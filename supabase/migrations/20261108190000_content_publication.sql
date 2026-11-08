-- Phases 3 and 4 of the content workspace: what the learner app is allowed to read, and what a teacher is told.
--  * a public bucket for one JSON snapshot of the content that is effectively shown (approved at its exact version, switched on
--    after the latest review); only the service role writes it, anyone can read an exact path;
--  * a whitelisted snapshot RPC the Edge function turns into that file (video lessons and course groups, the display
--    configuration, author labels taken from an active teacher profile at publish time, never read live by the app);
--  * Owner notes to the author, readable by the Owner and by the author of that item only.
-- Builds on content_foundation and content_display. Expand-only. Local candidate.

-- 1. Public snapshot bucket: no storage.objects policy, so only service_role can write.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('content-published', 'content-published', true, 1048576, array['application/json'])
on conflict (id) do nothing;
do $$
begin
  if not exists (select 1 from storage.buckets where id = 'content-published' and public and file_size_limit = 1048576
      and allowed_mime_types @> array['application/json']::text[] and allowed_mime_types <@ array['application/json']::text[]) then
    raise exception 'content-published must be a public bucket limited to json' using errcode = '42501';
  end if;
end $$;

-- 2. Owner notes to the author.
create table private.mcy_content_notes (
  id uuid primary key default gen_random_uuid(),
  item_id text not null references private.mcy_content_items(item_id),
  seq integer not null check (seq >= 1),
  note text not null check (length(btrim(note)) between 1 and 1000),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
create index mcy_content_notes_item on private.mcy_content_notes(item_id, created_at desc);
create index mcy_content_notes_actor_time on private.mcy_content_notes(created_by, created_at desc);
alter table private.mcy_content_notes enable row level security;
revoke all on private.mcy_content_notes from public, anon, authenticated, service_role;

create function public.mcy_content_note_save(p_actor_id uuid, p_item_id text, p_seq integer, p_note text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare n private.mcy_content_notes%rowtype;
begin
  if private.mcy_content_review_actor(p_actor_id) <> 'owner' then raise exception using errcode = '42501', message = 'owner_access_required'; end if;
  if p_item_id is null or p_item_id !~ '^[a-z0-9_-]{1,80}$' or p_seq is null or p_seq < 1 or p_note is null or length(btrim(p_note)) not between 1 and 1000 then
    raise exception using errcode = '22023', message = 'invalid_note';
  end if;
  perform pg_advisory_xact_lock(hashtextextended('mcy-content-actor:' || p_actor_id::text, 0));
  if private.mcy_content_review_actor(p_actor_id) <> 'owner' then raise exception using errcode = '42501', message = 'owner_access_required'; end if;
  if not exists (select 1 from private.mcy_content_versions where item_id = p_item_id and seq = p_seq) then
    raise exception using errcode = '22023', message = 'content_item_not_found';
  end if;
  if (select count(*) from private.mcy_content_notes where created_by = p_actor_id and created_at > clock_timestamp() - interval '24 hours') >= 100 then
    raise exception using errcode = 'PT429', message = 'content_limit_reached';
  end if;
  insert into private.mcy_content_notes(item_id, seq, note, created_by) values (p_item_id, p_seq, btrim(p_note), p_actor_id) returning * into n;
  return jsonb_build_object('item_id', n.item_id, 'seq', n.seq, 'at', n.created_at);
end $$;

-- The Owner reads any item's notes; a teacher reads the notes of an item the teacher authored.
create function public.mcy_content_notes_read(p_actor_id uuid, p_item_id text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare r text; it private.mcy_content_items%rowtype;
begin
  r := private.mcy_content_review_actor(p_actor_id);
  if p_item_id is null or p_item_id !~ '^[a-z0-9_-]{1,80}$' then raise exception using errcode = '22023', message = 'invalid_content'; end if;
  select * into it from private.mcy_content_items where item_id = p_item_id;
  if not found then raise exception using errcode = '22023', message = 'content_item_not_found'; end if;
  if r = 'teacher' and (it.author_kind <> 'teacher' or it.author_id is distinct from p_actor_id) then
    raise exception using errcode = '42501', message = 'content_access_required';
  end if;
  return jsonb_build_object('notes', coalesce((select jsonb_agg(jsonb_build_object('seq', x.seq, 'note', x.note, 'at', x.created_at) order by x.created_at desc)
    from (select * from private.mcy_content_notes where item_id = p_item_id order by created_at desc limit 20) x), '[]'::jsonb));
end $$;

-- 3. The snapshot source. Only effectively shown video lessons and course groups; the author label is resolved here, now, from an
-- active teacher profile. Imported content carries no byline (origin 'imported'), so existing lessons are never attributed by accident.
create function public.mcy_content_snapshot(p_actor_id uuid) returns jsonb language plpgsql security definer set search_path = '' as $$
declare d private.mcy_display_config%rowtype;
begin
  if private.mcy_content_review_actor(p_actor_id) <> 'owner' then raise exception using errcode = '42501', message = 'owner_access_required'; end if;
  select * into strict d from private.mcy_display_config where singleton;
  return jsonb_build_object('display', d.config, 'display_version', d.version_no, 'items', coalesce((
    select jsonb_agg(jsonb_build_object('item_id', i.item_id, 'kind', i.kind, 'seq', v.seq, 'content_hash', v.content_hash, 'title', v.title, 'payload', v.payload,
      'author_kind', i.author_kind, 'origin', v.origin,
      'author_label', case when i.author_kind = 'teacher' then (select t.public_name from public.teachers t where t.user_id = i.author_id and t.active) end) order by i.item_id)
    from private.mcy_content_items i join private.mcy_content_versions v on v.item_id = i.item_id
    where i.kind in ('video_lesson', 'course_group') and private.mcy_content_effective(v.item_id, v.content_hash)), '[]'::jsonb));
end $$;

revoke all on function public.mcy_content_note_save(uuid, text, integer, text), public.mcy_content_notes_read(uuid, text), public.mcy_content_snapshot(uuid) from public, anon, authenticated;
grant execute on function public.mcy_content_note_save(uuid, text, integer, text), public.mcy_content_notes_read(uuid, text), public.mcy_content_snapshot(uuid) to service_role;
