-- Owner 28/11 (plan plans/active/2026-11-28-mcy-content-share-and-standardise.md), option A: the Owner invites an active teacher to
-- READ an MCY lesson or course and leave comments. The teacher never edits MCY content ("a teacher edits only own lessons" stays),
-- never decides a review, and never changes what learners see; the Owner alone decides and makes new versions.
-- A share is per item (the teacher always sees the latest version), expires after 1-30 days, can be withdrawn, and is audited.
-- It deliberately does not use private.mcy_content_reviewer_assignments: an assignment there grants a review decision and resets the
-- Owner's decision, which a request for comments must never do.
-- Also: a read for the Owner of MCY video lessons whose latest version predates the common form (no "areas"), so the Owner can make
-- new versions with areas and tags from the workspace. Existing versions are never rewritten.
-- Expand-only. New tables are private with RLS on and every client/service privilege revoked; RPCs are security definer with an empty
-- search_path, EXECUTE for service_role only, and re-check the actor inside.

create table private.mcy_content_shares (
  item_id text not null references private.mcy_content_items(item_id),
  reviewer_id uuid not null references auth.users(id) on delete cascade,
  granted_by uuid references auth.users(id) on delete set null,
  active boolean not null,
  expires_at timestamptz not null,
  updated_at timestamptz not null default now(),
  primary key (item_id, reviewer_id)
);
create index mcy_content_shares_reviewer on private.mcy_content_shares(reviewer_id, expires_at) where active;
create table private.mcy_content_share_events (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id) on delete set null,
  item_id text not null references private.mcy_content_items(item_id),
  reviewer_id uuid references auth.users(id) on delete set null,
  active boolean not null,
  expires_at timestamptz not null,
  occurred_at timestamptz not null default now()
);
create index mcy_content_share_events_actor_time on private.mcy_content_share_events(actor_id, occurred_at desc);
create table private.mcy_content_share_notes (
  id uuid primary key default gen_random_uuid(),
  item_id text not null,
  seq integer not null,
  note text not null check (length(btrim(note)) between 1 and 1000),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  foreign key (item_id, seq) references private.mcy_content_versions(item_id, seq)
);
create index mcy_content_share_notes_item on private.mcy_content_share_notes(item_id, created_at desc);
create index mcy_content_share_notes_actor_time on private.mcy_content_share_notes(created_by, created_at desc);
alter table private.mcy_content_shares enable row level security;
alter table private.mcy_content_share_events enable row level security;
alter table private.mcy_content_share_notes enable row level security;
revoke all on private.mcy_content_shares, private.mcy_content_share_events, private.mcy_content_share_notes from public, anon, authenticated, service_role;

-- True when p_user is, right now, a verified active teacher (and not the Owner). Never raises.
create function private.mcy_content_is_teacher(p_user uuid) returns boolean language sql stable set search_path = '' as $$
  select exists (select 1 from auth.users u join public.teachers t on t.user_id = u.id
      where u.id = p_user and u.email_confirmed_at is not null and t.active)
    and exists (select 1 from private.role_assignments a where a.user_id = p_user and a.role = 'teacher' and a.scope_type = 'global'
      and a.status = 'active' and a.starts_at <= clock_timestamp() and (a.ends_at is null or a.ends_at > clock_timestamp()))
    and not exists (select 1 from private.role_assignments a where a.user_id = p_user and a.role = 'owner' and a.scope_type = 'global'
      and a.status = 'active' and a.starts_at <= clock_timestamp() and (a.ends_at is null or a.ends_at > clock_timestamp()))
$$;

-- Owner: invite (p_active true) or withdraw (false) one teacher on one MCY lesson or course.
create function public.mcy_content_share_set(p_actor_id uuid, p_item_id text, p_reviewer_id uuid, p_active boolean, p_expires_in_days integer)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare it private.mcy_content_items%rowtype; cur private.mcy_content_shares%rowtype; expiry timestamptz;
begin
  if private.mcy_content_review_actor(p_actor_id) <> 'owner' then raise exception using errcode = '42501', message = 'owner_access_required'; end if;
  if p_item_id is null or p_item_id !~ '^[a-z0-9_-]{1,80}$' or p_reviewer_id is null or p_reviewer_id = p_actor_id or p_active is null
    or p_expires_in_days is null or p_expires_in_days not between 1 and 30 then
    raise exception using errcode = '22023', message = 'invalid_share';
  end if;
  perform pg_advisory_xact_lock(hashtextextended('mcy-content-actor:' || p_actor_id::text, 0));
  perform pg_advisory_xact_lock(hashtextextended('mcy-content-item:' || p_item_id, 0));
  if private.mcy_content_review_actor(p_actor_id) <> 'owner' then raise exception using errcode = '42501', message = 'owner_access_required'; end if;
  select * into it from private.mcy_content_items where item_id = p_item_id;
  if not found then raise exception using errcode = '22023', message = 'content_item_not_found'; end if;
  if it.author_kind <> 'mcy' or it.kind not in ('video_lesson', 'course_group') then raise exception using errcode = '22023', message = 'invalid_share'; end if;
  select * into cur from private.mcy_content_shares where item_id = p_item_id and reviewer_id = p_reviewer_id for update;
  if not p_active and (not found or not cur.active) then
    return jsonb_build_object('item_id', p_item_id, 'reviewer_id', p_reviewer_id, 'active', false, 'unchanged', true);
  end if;
  if p_active and not private.mcy_content_is_teacher(p_reviewer_id) then
    raise exception using errcode = '42501', message = 'active_teacher_required';
  end if;
  if (select count(*) from private.mcy_content_share_events where actor_id = p_actor_id and occurred_at > clock_timestamp() - interval '24 hours') >= 100 then
    raise exception using errcode = 'PT429', message = 'content_limit_reached';
  end if;
  expiry := case when p_active then clock_timestamp() + make_interval(days => p_expires_in_days) else clock_timestamp() end;
  insert into private.mcy_content_shares(item_id, reviewer_id, granted_by, active, expires_at, updated_at)
    values (p_item_id, p_reviewer_id, p_actor_id, p_active, expiry, clock_timestamp())
    on conflict (item_id, reviewer_id) do update set granted_by = excluded.granted_by, active = excluded.active,
      expires_at = excluded.expires_at, updated_at = excluded.updated_at;
  insert into private.mcy_content_share_events(actor_id, item_id, reviewer_id, active, expires_at)
    values (p_actor_id, p_item_id, p_reviewer_id, p_active, expiry);
  return jsonb_build_object('item_id', p_item_id, 'reviewer_id', p_reviewer_id, 'active', p_active, 'expires_at', expiry, 'unchanged', false);
end $$;

-- Owner: who is invited on an item, which teachers can be invited, and the comments left on it (with the teacher's public name).
create function public.mcy_content_share_read(p_actor_id uuid, p_item_id text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare it private.mcy_content_items%rowtype;
begin
  if private.mcy_content_review_actor(p_actor_id) <> 'owner' then raise exception using errcode = '42501', message = 'owner_access_required'; end if;
  if p_item_id is null or p_item_id !~ '^[a-z0-9_-]{1,80}$' then raise exception using errcode = '22023', message = 'invalid_share'; end if;
  select * into it from private.mcy_content_items where item_id = p_item_id;
  if not found then raise exception using errcode = '22023', message = 'content_item_not_found'; end if;
  return jsonb_build_object(
    'shareable', it.author_kind = 'mcy' and it.kind in ('video_lesson', 'course_group'),
    'shares', coalesce((select jsonb_agg(jsonb_build_object('reviewer_id', s.reviewer_id, 'label', coalesce(t.public_name, 'Giảng viên'),
        'expires_at', s.expires_at) order by s.expires_at desc)
      from private.mcy_content_shares s left join public.teachers t on t.user_id = s.reviewer_id
      where s.item_id = p_item_id and s.active and s.expires_at > clock_timestamp()), '[]'::jsonb),
    'eligible', coalesce((select jsonb_agg(jsonb_build_object('user_id', x.user_id, 'label', x.public_name) order by x.public_name, x.user_id)
      from (select t.user_id, t.public_name from public.teachers t where private.mcy_content_is_teacher(t.user_id)
        order by t.public_name, t.user_id limit 50) x), '[]'::jsonb),
    'notes', coalesce((select jsonb_agg(jsonb_build_object('seq', n.seq, 'note', n.note, 'at', n.created_at,
        'label', coalesce((select t.public_name from public.teachers t where t.user_id = n.created_by), 'Giảng viên')) order by n.created_at desc)
      from (select * from private.mcy_content_share_notes where item_id = p_item_id order by created_at desc limit 50) n), '[]'::jsonb));
end $$;

-- Teacher: the MCY items the teacher is invited on right now, each with its latest version and the teacher's own comments.
create function public.mcy_content_shared_list(p_actor_id uuid) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare r text;
begin
  r := private.mcy_content_review_actor(p_actor_id);
  if r <> 'teacher' then return jsonb_build_object('items', '[]'::jsonb); end if;
  return jsonb_build_object('items', coalesce((select jsonb_agg(jsonb_build_object(
      'item_id', i.item_id, 'kind', i.kind, 'expires_at', s.expires_at, 'seq', v.seq, 'title', v.title, 'payload', v.payload,
      'notes', coalesce((select jsonb_agg(jsonb_build_object('seq', n.seq, 'note', n.note, 'at', n.created_at) order by n.created_at desc)
        from (select * from private.mcy_content_share_notes x where x.item_id = i.item_id and x.created_by = p_actor_id
          order by x.created_at desc limit 20) n), '[]'::jsonb)) order by s.expires_at desc, i.item_id)
    from private.mcy_content_shares s
    join private.mcy_content_items i on i.item_id = s.item_id
    join lateral (select * from private.mcy_content_versions x where x.item_id = i.item_id order by x.seq desc limit 1) v on true
    where s.reviewer_id = p_actor_id and s.active and s.expires_at > clock_timestamp() and i.author_kind = 'mcy'), '[]'::jsonb));
end $$;

-- Teacher: one comment on the latest version of an item the teacher is invited on.
create function public.mcy_content_share_note(p_actor_id uuid, p_item_id text, p_seq integer, p_note text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare latest integer; n private.mcy_content_share_notes%rowtype;
begin
  if private.mcy_content_review_actor(p_actor_id) <> 'teacher' then raise exception using errcode = '42501', message = 'content_access_required'; end if;
  if p_item_id is null or p_item_id !~ '^[a-z0-9_-]{1,80}$' or p_seq is null or p_seq < 1 or p_note is null or length(btrim(p_note)) not between 1 and 1000 then
    raise exception using errcode = '22023', message = 'invalid_note';
  end if;
  perform pg_advisory_xact_lock(hashtextextended('mcy-content-actor:' || p_actor_id::text, 0));
  if private.mcy_content_review_actor(p_actor_id) <> 'teacher' then raise exception using errcode = '42501', message = 'content_access_required'; end if;
  perform 1 from private.mcy_content_shares s where s.item_id = p_item_id and s.reviewer_id = p_actor_id and s.active and s.expires_at > clock_timestamp() for share;
  if not found then raise exception using errcode = '42501', message = 'content_access_required'; end if;
  select max(seq) into latest from private.mcy_content_versions where item_id = p_item_id;
  if latest is distinct from p_seq then raise exception using errcode = 'PT409', message = 'content_conflict'; end if;
  if (select count(*) from private.mcy_content_share_notes where created_by = p_actor_id and created_at > clock_timestamp() - interval '24 hours') >= 50 then
    raise exception using errcode = 'PT429', message = 'content_limit_reached';
  end if;
  insert into private.mcy_content_share_notes(item_id, seq, note, created_by) values (p_item_id, p_seq, btrim(p_note), p_actor_id) returning * into n;
  return jsonb_build_object('item_id', n.item_id, 'seq', n.seq, 'at', n.created_at);
end $$;

-- Owner: MCY video lessons whose latest version has no "areas" yet (imported before the common form), with that version's payload.
create function public.mcy_content_legacy_lessons(p_actor_id uuid) returns jsonb
language plpgsql security definer set search_path = '' as $$
begin
  if private.mcy_content_review_actor(p_actor_id) <> 'owner' then raise exception using errcode = '42501', message = 'owner_access_required'; end if;
  return jsonb_build_object('items', coalesce((select jsonb_agg(jsonb_build_object('item_id', i.item_id, 'seq', v.seq, 'title', v.title,
      'payload', v.payload, 'origin', v.origin) order by v.title, i.item_id)
    from private.mcy_content_items i
    join lateral (select * from private.mcy_content_versions x where x.item_id = i.item_id order by x.seq desc limit 1) v on true
    where i.kind = 'video_lesson' and i.author_kind = 'mcy' and not (v.payload ? 'areas')), '[]'::jsonb));
end $$;

revoke all on function private.mcy_content_is_teacher(uuid) from public, anon, authenticated, service_role;
revoke all on function public.mcy_content_share_set(uuid, text, uuid, boolean, integer), public.mcy_content_share_read(uuid, text),
  public.mcy_content_shared_list(uuid), public.mcy_content_share_note(uuid, text, integer, text), public.mcy_content_legacy_lessons(uuid)
  from public, anon, authenticated;
grant execute on function public.mcy_content_share_set(uuid, text, uuid, boolean, integer), public.mcy_content_share_read(uuid, text),
  public.mcy_content_shared_list(uuid), public.mcy_content_share_note(uuid, text, integer, text), public.mcy_content_legacy_lessons(uuid)
  to service_role;
