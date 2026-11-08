-- Phase 1 of the content workspace (plan 2026-11-08): one versioned content store for video lessons, course groups,
-- reading units and screen texts, authored by a teacher or by MCY (Owner). A version is immutable once saved; its hash
-- is computed here from kind + title + payload and doubles as the content_version of the existing review workflow, so one
-- approval system covers everything. Nothing here is learner-visible: publication switches and public snapshots come in
-- later phases. Everything is private; only service_role calls the RPCs, which re-check the verified Owner/teacher actor.
-- Expand-only. Local candidate: apply only after the exact-target review in docs/release/RELEASE_RUNBOOK.md.

-- 1. Widen the review scope to the new content kinds (reading units keep 'learning_reading').
do $migration$
declare
  v_constraint text; v_oid oid; v_definition text;
  v_old constant text := $$not in ('learning_intro','learning_reading','practice_session')$$;
  v_new constant text := $$not in ('learning_intro','learning_reading','practice_session','video_lesson','course_group','screen_text')$$;
  v_occurrences integer;
begin
  select c.conname into v_constraint from pg_catalog.pg_constraint c
  where c.conrelid = 'private.mcy_content_review_states'::regclass and c.contype = 'c'
    and pg_catalog.pg_get_constraintdef(c.oid) like '%learning_intro%learning_reading%practice_session%';
  if v_constraint is null then
    raise exception 'scope check on private.mcy_content_review_states not found; refusing to continue';
  end if;
  execute pg_catalog.format('alter table private.mcy_content_review_states drop constraint %I', v_constraint);
  alter table private.mcy_content_review_states add constraint mcy_content_review_states_scope_check
    check (scope in ('learning_intro','learning_reading','practice_session','video_lesson','course_group','screen_text'));

  select p.oid into v_oid from pg_catalog.pg_proc p join pg_catalog.pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'private' and p.proname = 'mcy_content_review_validate';
  if v_oid is null then raise exception 'private.mcy_content_review_validate is missing; refusing to continue'; end if;
  v_definition := pg_catalog.pg_get_functiondef(v_oid);
  v_occurrences := (pg_catalog.length(v_definition) - pg_catalog.length(pg_catalog.replace(v_definition, v_old, ''))) / pg_catalog.length(v_old);
  if v_occurrences <> 1 then
    raise exception 'private.mcy_content_review_validate changed (% scope lists found, expected 1); refusing to continue', v_occurrences;
  end if;
  execute pg_catalog.replace(v_definition, v_old, v_new);
end
$migration$;

-- 2. Tables.
create table private.mcy_content_items (
  item_id text primary key check (item_id ~ '^[a-z0-9_-]{1,80}$'),
  kind text not null check (kind in ('video_lesson','course_group','reading_unit','screen_text')),
  author_kind text not null check (author_kind in ('teacher','mcy')),
  -- Set for teacher items; becomes null if the teacher account is deleted (the content then reads as unattributed).
  author_id uuid references auth.users(id) on delete set null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
create table private.mcy_content_versions (
  item_id text not null references private.mcy_content_items(item_id),
  seq integer not null check (seq >= 1),
  content_hash text not null check (content_hash ~ '^[a-f0-9]{64}$'),
  title text not null check (length(btrim(title)) between 1 and 200),
  payload jsonb not null check (jsonb_typeof(payload) = 'object'),
  status text not null default 'draft' check (status in ('draft','submitted')),
  origin text not null default 'authored' check (origin in ('authored','imported')),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  submitted_at timestamptz,
  primary key (item_id, seq)
);
create index mcy_content_versions_hash on private.mcy_content_versions(item_id, content_hash);
create table private.mcy_content_events (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id) on delete set null,
  item_id text not null, seq integer not null,
  kind text not null check (kind in ('save','submit','import')),
  payload jsonb not null, occurred_at timestamptz not null default now()
);
create index mcy_content_events_actor_time on private.mcy_content_events(actor_id, occurred_at desc);
alter table private.mcy_content_items enable row level security;
alter table private.mcy_content_versions enable row level security;
alter table private.mcy_content_events enable row level security;
revoke all on private.mcy_content_items, private.mcy_content_versions, private.mcy_content_events
  from public, anon, authenticated, service_role;

-- A saved version never changes; the only allowed update is draft -> submitted. Nothing is ever deleted.
create function private.mcy_content_versions_guard() returns trigger language plpgsql set search_path = '' as $$
begin
  if tg_op = 'DELETE' then raise exception using errcode = '42501', message = 'content_versions_are_immutable'; end if;
  if new.item_id is distinct from old.item_id or new.seq is distinct from old.seq or new.content_hash is distinct from old.content_hash
    or new.title is distinct from old.title or new.payload is distinct from old.payload or new.origin is distinct from old.origin
    or new.created_by is distinct from old.created_by or new.created_at is distinct from old.created_at
    or not (old.status = new.status or (old.status = 'draft' and new.status = 'submitted')) then
    raise exception using errcode = '42501', message = 'content_versions_are_immutable';
  end if;
  return new;
end $$;
create trigger mcy_content_versions_guard before update or delete on private.mcy_content_versions
  for each row execute function private.mcy_content_versions_guard();

-- 3. Helpers.
create function private.mcy_content_scope(p_kind text) returns text language sql immutable set search_path = '' as $$
  select case p_kind when 'video_lesson' then 'video_lesson' when 'course_group' then 'course_group'
    when 'reading_unit' then 'learning_reading' when 'screen_text' then 'screen_text' end
$$;
-- The version identifier: SHA-256 over kind, title and the canonical jsonb text, so a change to any of them is a new version.
create function private.mcy_content_hash(p_kind text, p_title text, p_payload jsonb) returns text language sql immutable set search_path = '' as $$
  select pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to(p_kind || E'\n' || p_title || E'\n' || p_payload::text, 'UTF8')), 'hex')
$$;
create function private.mcy_content_prefix(p_kind text) returns text language sql immutable set search_path = '' as $$
  select case p_kind when 'video_lesson' then 'video-' when 'course_group' then 'group-' when 'reading_unit' then 'reading-' when 'screen_text' then 'text-' end
$$;
-- Actor and ownership rule shared by the author-side RPCs: a teacher works only on own teacher items; the Owner only on MCY items.
create function private.mcy_content_check_author(p_actor uuid, p_role text, p_item private.mcy_content_items) returns void
language plpgsql set search_path = '' as $$
begin
  if p_role = 'teacher' and (p_item.author_kind <> 'teacher' or p_item.author_id is distinct from p_actor) then
    raise exception using errcode = '42501', message = 'content_access_required';
  end if;
  if p_role = 'owner' and p_item.author_kind <> 'mcy' then
    raise exception using errcode = '42501', message = 'teacher_content_is_reviewed_not_edited';
  end if;
end $$;
create function private.mcy_content_event_limit(p_actor uuid, p_max integer) returns void language plpgsql set search_path = '' as $$
begin
  if (select count(*) from private.mcy_content_events where actor_id = p_actor and occurred_at > clock_timestamp() - interval '24 hours') >= p_max then
    raise exception using errcode = 'PT429', message = 'content_limit_reached';
  end if;
end $$;

-- 4. Author RPCs.
create function public.mcy_content_save_version(p_actor_id uuid, p_item_id text, p_kind text, p_title text, p_payload jsonb, p_expected_seq integer)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare r text; it private.mcy_content_items%rowtype; cur integer; h text; id text; last private.mcy_content_versions%rowtype; v private.mcy_content_versions%rowtype;
begin
  r := private.mcy_content_review_actor(p_actor_id);
  if p_kind is null or p_kind not in ('video_lesson','course_group','reading_unit','screen_text')
    or p_title is null or length(btrim(p_title)) not between 1 and 200
    or p_payload is null or jsonb_typeof(p_payload) <> 'object' or pg_catalog.octet_length(p_payload::text) > 24000
    or p_expected_seq is null or p_expected_seq < 0 or (p_item_id is not null and p_item_id !~ '^[a-z0-9_-]{1,80}$') then
    raise exception using errcode = '22023', message = 'invalid_content';
  end if;
  -- Teachers author video lessons only; groups, texts and reading units are MCY content (reading units reach the store by import).
  if r = 'teacher' and p_kind <> 'video_lesson' then raise exception using errcode = '42501', message = 'content_kind_not_allowed'; end if;
  perform pg_advisory_xact_lock(hashtextextended('mcy-content-actor:' || p_actor_id::text, 0));
  if p_item_id is not null then perform pg_advisory_xact_lock(hashtextextended('mcy-content-item:' || p_item_id, 0)); end if;
  -- Recheck the wall-clock role after a possible lock wait.
  r := private.mcy_content_review_actor(p_actor_id);
  if r = 'teacher' and p_kind <> 'video_lesson' then raise exception using errcode = '42501', message = 'content_kind_not_allowed'; end if;
  perform private.mcy_content_event_limit(p_actor_id, 200);
  if (select count(*) from private.mcy_content_events where actor_id = p_actor_id and kind = 'save' and occurred_at > clock_timestamp() - interval '24 hours') >= 40 then
    raise exception using errcode = 'PT429', message = 'content_limit_reached';
  end if;
  if p_item_id is null then
    if p_expected_seq <> 0 then raise exception using errcode = '22023', message = 'invalid_content'; end if;
    id := private.mcy_content_prefix(p_kind) || substr(replace(pg_catalog.gen_random_uuid()::text, '-', ''), 1, 16);
    insert into private.mcy_content_items(item_id, kind, author_kind, author_id, created_by)
      values (id, p_kind, case r when 'owner' then 'mcy' else 'teacher' end, case when r = 'teacher' then p_actor_id end, p_actor_id);
    cur := 0;
  else
    select * into it from private.mcy_content_items where item_id = p_item_id for update;
    if not found then raise exception using errcode = '22023', message = 'content_item_not_found'; end if;
    if it.kind <> p_kind then raise exception using errcode = '22023', message = 'content_kind_mismatch'; end if;
    perform private.mcy_content_check_author(p_actor_id, r, it);
    select coalesce(max(seq), 0) into cur from private.mcy_content_versions where item_id = p_item_id;
    if cur <> p_expected_seq then raise exception using errcode = 'PT409', message = 'content_conflict'; end if;
    id := p_item_id;
  end if;
  h := private.mcy_content_hash(p_kind, btrim(p_title), p_payload);
  if cur > 0 then
    select * into last from private.mcy_content_versions where item_id = id and seq = cur;
    if last.content_hash = h then
      return jsonb_build_object('item_id', id, 'kind', p_kind, 'seq', cur, 'content_hash', h, 'status', last.status, 'unchanged', true);
    end if;
  end if;
  insert into private.mcy_content_versions(item_id, seq, content_hash, title, payload, created_by)
    values (id, cur + 1, h, btrim(p_title), p_payload, p_actor_id) returning * into v;
  insert into private.mcy_content_events(actor_id, item_id, seq, kind, payload)
    values (p_actor_id, id, v.seq, 'save', jsonb_build_object('content_hash', h, 'kind', p_kind));
  return jsonb_build_object('item_id', id, 'kind', p_kind, 'seq', v.seq, 'content_hash', h, 'status', 'draft', 'unchanged', false);
end $$;

create function public.mcy_content_submit(p_actor_id uuid, p_item_id text, p_expected_seq integer)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare r text; it private.mcy_content_items%rowtype; v private.mcy_content_versions%rowtype;
begin
  r := private.mcy_content_review_actor(p_actor_id);
  if p_item_id is null or p_item_id !~ '^[a-z0-9_-]{1,80}$' or p_expected_seq is null or p_expected_seq < 1 then
    raise exception using errcode = '22023', message = 'invalid_content';
  end if;
  perform pg_advisory_xact_lock(hashtextextended('mcy-content-actor:' || p_actor_id::text, 0));
  perform pg_advisory_xact_lock(hashtextextended('mcy-content-item:' || p_item_id, 0));
  r := private.mcy_content_review_actor(p_actor_id);
  select * into it from private.mcy_content_items where item_id = p_item_id for update;
  if not found then raise exception using errcode = '22023', message = 'content_item_not_found'; end if;
  perform private.mcy_content_check_author(p_actor_id, r, it);
  select * into v from private.mcy_content_versions where item_id = p_item_id order by seq desc limit 1 for update;
  if not found or v.seq <> p_expected_seq then raise exception using errcode = 'PT409', message = 'content_conflict'; end if;
  if v.status = 'submitted' then
    return jsonb_build_object('item_id', v.item_id, 'seq', v.seq, 'content_hash', v.content_hash, 'status', 'submitted', 'unchanged', true,
      'candidate', jsonb_build_object('id', v.item_id, 'scope', private.mcy_content_scope(it.kind), 'title', v.title, 'version', v.content_hash));
  end if;
  perform private.mcy_content_event_limit(p_actor_id, 200);
  update private.mcy_content_versions set status = 'submitted', submitted_at = clock_timestamp() where item_id = v.item_id and seq = v.seq returning * into v;
  insert into private.mcy_content_events(actor_id, item_id, seq, kind, payload)
    values (p_actor_id, v.item_id, v.seq, 'submit', jsonb_build_object('content_hash', v.content_hash));
  return jsonb_build_object('item_id', v.item_id, 'seq', v.seq, 'content_hash', v.content_hash, 'status', 'submitted', 'unchanged', false,
    'candidate', jsonb_build_object('id', v.item_id, 'scope', private.mcy_content_scope(it.kind), 'title', v.title, 'version', v.content_hash));
end $$;

-- 5. Reads. The Owner sees every item; a teacher only own items. Author labels come from an active teacher profile only.
create function public.mcy_content_list(p_actor_id uuid) returns jsonb language plpgsql security definer set search_path = '' as $$
declare r text; items jsonb;
begin
  r := private.mcy_content_review_actor(p_actor_id);
  select coalesce(jsonb_agg(x.item order by x.sort desc), '[]'::jsonb) into items from (
    select v.created_at as sort, jsonb_build_object(
      'item_id', i.item_id, 'kind', i.kind, 'author_kind', i.author_kind,
      'author_label', case when i.author_kind = 'teacher' then (select t.public_name from public.teachers t where t.user_id = i.author_id and t.active) end,
      'seq', v.seq, 'content_hash', v.content_hash, 'title', v.title, 'status', v.status, 'origin', v.origin, 'updated_at', v.created_at,
      'versions', (select count(*) from private.mcy_content_versions a where a.item_id = i.item_id),
      'review', jsonb_build_object('decision', coalesce(s.decision, 'pending'), 'revision', coalesce(s.revision, 0), 'reviewed_at', s.updated_at),
      'approved_seq', (select max(a.seq) from private.mcy_content_versions a join private.mcy_content_review_states ss
        on ss.candidate_id = a.item_id and ss.content_version = a.content_hash where a.item_id = i.item_id and ss.decision = 'approved')
    ) as item
    from private.mcy_content_items i
    join lateral (select * from private.mcy_content_versions x where x.item_id = i.item_id order by x.seq desc limit 1) v on true
    left join private.mcy_content_review_states s on s.candidate_id = i.item_id and s.content_version = v.content_hash
    where r = 'owner' or (i.author_kind = 'teacher' and i.author_id = p_actor_id)
    order by v.created_at desc limit 300
  ) x;
  return jsonb_build_object('role', r, 'items', items);
end $$;

create function public.mcy_content_read_version(p_actor_id uuid, p_item_id text, p_seq integer) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare r text; it private.mcy_content_items%rowtype; v private.mcy_content_versions%rowtype; s private.mcy_content_review_states%rowtype;
begin
  r := private.mcy_content_review_actor(p_actor_id);
  if p_item_id is null or p_item_id !~ '^[a-z0-9_-]{1,80}$' or (p_seq is not null and p_seq < 1) then
    raise exception using errcode = '22023', message = 'invalid_content';
  end if;
  select * into it from private.mcy_content_items where item_id = p_item_id;
  if not found then raise exception using errcode = '22023', message = 'content_item_not_found'; end if;
  if r = 'teacher' and (it.author_kind <> 'teacher' or it.author_id is distinct from p_actor_id) then
    raise exception using errcode = '42501', message = 'content_access_required';
  end if;
  select * into v from private.mcy_content_versions where item_id = p_item_id and (p_seq is null or seq = p_seq) order by seq desc limit 1;
  if not found then raise exception using errcode = '22023', message = 'content_item_not_found'; end if;
  select * into s from private.mcy_content_review_states where candidate_id = v.item_id and content_version = v.content_hash;
  return jsonb_build_object('item_id', it.item_id, 'kind', it.kind, 'author_kind', it.author_kind,
    'author_label', case when it.author_kind = 'teacher' then (select t.public_name from public.teachers t where t.user_id = it.author_id and t.active) end,
    'seq', v.seq, 'content_hash', v.content_hash, 'title', v.title, 'payload', v.payload, 'status', v.status, 'origin', v.origin,
    'created_at', v.created_at, 'submitted_at', v.submitted_at,
    'latest_seq', (select max(a.seq) from private.mcy_content_versions a where a.item_id = it.item_id),
    'candidate', jsonb_build_object('id', v.item_id, 'scope', private.mcy_content_scope(it.kind), 'title', v.title, 'version', v.content_hash),
    'review', case when r = 'owner' then jsonb_build_object('decision', coalesce(s.decision, 'pending'), 'revision', coalesce(s.revision, 0),
        'qualification', s.qualification, 'review_basis', s.review_basis, 'rights_basis', s.rights_basis, 'checklist', s.checklist, 'reviewed_at', s.updated_at)
      else jsonb_build_object('decision', coalesce(s.decision, 'pending'), 'revision', coalesce(s.revision, 0), 'reviewed_at', s.updated_at) end);
end $$;

-- 6. Owner-only: review a stored version, and import prepared content. Review goes through the existing review RPC so the
-- Owner's own typed declaration, the audit trail and the rate limits are shared with the older candidates.
create function public.mcy_content_review_item(p_actor_id uuid, p_item_id text, p_seq integer, p_expected_revision integer,
  p_decision text, p_qualification text, p_review_basis text, p_rights_basis text, p_checklist jsonb) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare it private.mcy_content_items%rowtype; v private.mcy_content_versions%rowtype;
begin
  if private.mcy_content_review_actor(p_actor_id) <> 'owner' then raise exception using errcode = '42501', message = 'owner_access_required'; end if;
  if p_item_id is null or p_item_id !~ '^[a-z0-9_-]{1,80}$' or p_seq is null or p_seq < 1 then raise exception using errcode = '22023', message = 'invalid_review'; end if;
  select * into it from private.mcy_content_items where item_id = p_item_id;
  if not found then raise exception using errcode = '22023', message = 'content_item_not_found'; end if;
  select * into v from private.mcy_content_versions where item_id = p_item_id order by seq desc limit 1;
  -- Only the latest version, and only after it was submitted, can be decided.
  if v.seq <> p_seq then raise exception using errcode = 'PT409', message = 'content_conflict'; end if;
  if v.status <> 'submitted' then raise exception using errcode = '22023', message = 'content_not_submitted'; end if;
  return public.mcy_content_review_save(p_actor_id,
    jsonb_build_object('id', v.item_id, 'scope', private.mcy_content_scope(it.kind), 'title', v.title, 'version', v.content_hash),
    p_expected_revision, p_decision, p_qualification, p_review_basis, p_rights_basis, p_checklist);
end $$;

-- p_trusted_hash lets prepared content that was already reviewed under a registry hash keep that approval; without it the hash is computed here.
create function public.mcy_content_import(p_actor_id uuid, p_item_id text, p_kind text, p_title text, p_payload jsonb, p_trusted_hash text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare it private.mcy_content_items%rowtype; cur integer; h text; last private.mcy_content_versions%rowtype;
begin
  if private.mcy_content_review_actor(p_actor_id) <> 'owner' then raise exception using errcode = '42501', message = 'owner_access_required'; end if;
  if p_kind is null or p_kind not in ('video_lesson','course_group','reading_unit','screen_text')
    or p_item_id is null or p_item_id !~ '^[a-z0-9_-]{1,80}$' or left(p_item_id, length(private.mcy_content_prefix(p_kind))) <> private.mcy_content_prefix(p_kind)
    or p_title is null or length(btrim(p_title)) not between 1 and 200
    or p_payload is null or jsonb_typeof(p_payload) <> 'object' or pg_catalog.octet_length(p_payload::text) > 400000
    or (p_trusted_hash is not null and p_trusted_hash !~ '^[a-f0-9]{64}$') then
    raise exception using errcode = '22023', message = 'invalid_content';
  end if;
  perform pg_advisory_xact_lock(hashtextextended('mcy-content-actor:' || p_actor_id::text, 0));
  perform pg_advisory_xact_lock(hashtextextended('mcy-content-item:' || p_item_id, 0));
  if private.mcy_content_review_actor(p_actor_id) <> 'owner' then raise exception using errcode = '42501', message = 'owner_access_required'; end if;
  h := coalesce(p_trusted_hash, private.mcy_content_hash(p_kind, btrim(p_title), p_payload));
  select * into it from private.mcy_content_items where item_id = p_item_id for update;
  if found then
    if it.kind <> p_kind then raise exception using errcode = '22023', message = 'content_kind_mismatch'; end if;
    if it.author_kind <> 'mcy' then raise exception using errcode = '42501', message = 'teacher_content_is_reviewed_not_edited'; end if;
    select * into last from private.mcy_content_versions where item_id = p_item_id order by seq desc limit 1;
    cur := coalesce(last.seq, 0);
    if cur > 0 and last.content_hash = h then
      return jsonb_build_object('item_id', p_item_id, 'seq', cur, 'content_hash', h, 'unchanged', true);
    end if;
  else
    perform private.mcy_content_event_limit(p_actor_id, 400);
    insert into private.mcy_content_items(item_id, kind, author_kind, created_by) values (p_item_id, p_kind, 'mcy', p_actor_id);
    cur := 0;
  end if;
  perform private.mcy_content_event_limit(p_actor_id, 400);
  insert into private.mcy_content_versions(item_id, seq, content_hash, title, payload, status, origin, created_by, submitted_at)
    values (p_item_id, cur + 1, h, btrim(p_title), p_payload, 'submitted', 'imported', p_actor_id, clock_timestamp());
  insert into private.mcy_content_events(actor_id, item_id, seq, kind, payload)
    values (p_actor_id, p_item_id, cur + 1, 'import', jsonb_build_object('content_hash', h, 'kind', p_kind, 'trusted_hash', p_trusted_hash is not null));
  return jsonb_build_object('item_id', p_item_id, 'seq', cur + 1, 'content_hash', h, 'unchanged', false);
end $$;

revoke all on function private.mcy_content_versions_guard(), private.mcy_content_scope(text), private.mcy_content_hash(text, text, jsonb),
  private.mcy_content_prefix(text), private.mcy_content_check_author(uuid, text, private.mcy_content_items), private.mcy_content_event_limit(uuid, integer)
  from public, anon, authenticated, service_role;
revoke all on function public.mcy_content_save_version(uuid, text, text, text, jsonb, integer), public.mcy_content_submit(uuid, text, integer),
  public.mcy_content_list(uuid), public.mcy_content_read_version(uuid, text, integer),
  public.mcy_content_review_item(uuid, text, integer, integer, text, text, text, text, jsonb),
  public.mcy_content_import(uuid, text, text, text, jsonb, text) from public, anon, authenticated;
grant execute on function public.mcy_content_save_version(uuid, text, text, text, jsonb, integer), public.mcy_content_submit(uuid, text, integer),
  public.mcy_content_list(uuid), public.mcy_content_read_version(uuid, text, integer),
  public.mcy_content_review_item(uuid, text, integer, integer, text, text, text, text, jsonb),
  public.mcy_content_import(uuid, text, text, text, jsonb, text) to service_role;
