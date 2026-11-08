-- Phase 2b of the content workspace: the Owner's visibility switch for stored content, one display configuration for the
-- app (Khám phá section order, general policies, Editor's choice slots, review rules), and a change log of both.
-- Builds on 20261108111116_content_foundation.sql. Everything is private and reached only by service_role RPCs that
-- re-check the verified Owner. Nothing here makes anything learner-visible by itself: the app reads a public snapshot in phase 4.
-- Expand-only, plus one drift-guarded in-place patch of mcy_content_review_item (the self-review rule). Local candidate.

-- 1. Tables.
create table private.mcy_content_visibility (
  item_id text not null references private.mcy_content_items(item_id),
  content_hash text not null check (content_hash ~ '^[a-f0-9]{64}$'),
  visible boolean not null default false,
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now(),
  primary key (item_id, content_hash)
);
create table private.mcy_display_config (
  singleton boolean primary key default true check (singleton),
  version_no integer not null default 1 check (version_no >= 1),
  config jsonb not null check (jsonb_typeof(config) = 'object'),
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now()
);
-- Defaults reproduce today's app: Editor's choice first, then the video groups, quick find, and reading last.
insert into private.mcy_display_config(config) values (jsonb_build_object(
  'discover_order', jsonb_build_array('editors_choice', 'video_groups', 'quick_find', 'reading'),
  'policies', jsonb_build_object('show_teacher_names', true, 'ai_image_label', true),
  'editors_choice', '[]'::jsonb,
  'review_rules', jsonb_build_object(
    'video_lesson', jsonb_build_object('owner_self_review', true), 'course_group', jsonb_build_object('owner_self_review', true),
    'reading_unit', jsonb_build_object('owner_self_review', true), 'screen_text', jsonb_build_object('owner_self_review', true))));
create table private.mcy_display_events (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id) on delete set null,
  kind text not null check (kind in ('config', 'visibility')),
  subject text not null,
  before_value jsonb, after_value jsonb,
  occurred_at timestamptz not null default now()
);
create index mcy_display_events_time on private.mcy_display_events(occurred_at desc);
create index mcy_display_events_actor_time on private.mcy_display_events(actor_id, occurred_at desc);
alter table private.mcy_content_visibility enable row level security;
alter table private.mcy_display_config enable row level security;
alter table private.mcy_display_events enable row level security;
revoke all on private.mcy_content_visibility, private.mcy_display_config, private.mcy_display_events from public, anon, authenticated, service_role;

-- 2. Config validation: exact keys, the four Khám phá sections in any order except that video groups stay above reading
-- (product rule: video is the focus), booleans only, at most three distinct Editor's choice ids.
create function private.mcy_display_validate(p_config jsonb) returns void language plpgsql set search_path = '' as $$
declare k text; order_arr text[]; ids text[];
begin
  if p_config is null or jsonb_typeof(p_config) <> 'object'
    or (select array_agg(x order by x) from jsonb_object_keys(p_config) x) is distinct from array['discover_order', 'editors_choice', 'policies', 'review_rules']::text[]
    or jsonb_typeof(p_config->'discover_order') <> 'array' or jsonb_typeof(p_config->'editors_choice') <> 'array'
    or jsonb_typeof(p_config->'policies') <> 'object' or jsonb_typeof(p_config->'review_rules') <> 'object' then
    raise exception using errcode = '22023', message = 'invalid_display_config';
  end if;
  select array_agg(v) into order_arr from jsonb_array_elements_text(p_config->'discover_order') v;
  if order_arr is null or array_length(order_arr, 1) <> 4 or (select array_agg(x order by x) from unnest(order_arr) x) is distinct from array['editors_choice', 'quick_find', 'reading', 'video_groups']::text[]
    or array_position(order_arr, 'video_groups') > array_position(order_arr, 'reading') then
    raise exception using errcode = '22023', message = 'invalid_display_config';
  end if;
  if (select array_agg(x order by x) from jsonb_object_keys(p_config->'policies') x) is distinct from array['ai_image_label', 'show_teacher_names']::text[]
    or exists (select 1 from jsonb_each(p_config->'policies') e where jsonb_typeof(e.value) <> 'boolean') then
    raise exception using errcode = '22023', message = 'invalid_display_config';
  end if;
  if (select array_agg(x order by x) from jsonb_object_keys(p_config->'review_rules') x) is distinct from array['course_group', 'reading_unit', 'screen_text', 'video_lesson']::text[] then
    raise exception using errcode = '22023', message = 'invalid_display_config';
  end if;
  for k in select jsonb_object_keys(p_config->'review_rules') loop
    if jsonb_typeof(p_config->'review_rules'->k) <> 'object'
      or (select array_agg(x order by x) from jsonb_object_keys(p_config->'review_rules'->k) x) is distinct from array['owner_self_review']::text[]
      or jsonb_typeof(p_config->'review_rules'->k->'owner_self_review') <> 'boolean' then
      raise exception using errcode = '22023', message = 'invalid_display_config';
    end if;
  end loop;
  if jsonb_array_length(p_config->'editors_choice') > 3 or exists (select 1 from jsonb_array_elements(p_config->'editors_choice') e where jsonb_typeof(e) <> 'string' or (e #>> '{}') !~ '^[a-z0-9_-]{1,80}$') then
    raise exception using errcode = '22023', message = 'invalid_display_config';
  end if;
  select array_agg(v) into ids from jsonb_array_elements_text(p_config->'editors_choice') v;
  if ids is not null and (select count(distinct x) from unnest(ids) x) <> array_length(ids, 1) then
    raise exception using errcode = '22023', message = 'invalid_display_config';
  end if;
end $$;

-- 3. The version that is effectively shown: approved at its exact hash, switched on, and switched on after the latest review
-- (a newer review hides it until the Owner switches it on again, as with reading units).
create function private.mcy_content_effective(p_item text, p_hash text) returns boolean language sql stable set search_path = '' as $$
  select exists (
    select 1 from private.mcy_content_visibility v
    join private.mcy_content_review_states s on s.candidate_id = v.item_id and s.content_version = v.content_hash
    where v.item_id = p_item and v.content_hash = p_hash and v.visible and s.decision = 'approved' and v.updated_at >= s.updated_at)
$$;

-- 4. RPCs (Owner only).
create function public.mcy_display_read(p_actor_id uuid) returns jsonb language plpgsql security definer set search_path = '' as $$
declare d private.mcy_display_config%rowtype;
begin
  if private.mcy_content_review_actor(p_actor_id) <> 'owner' then raise exception using errcode = '42501', message = 'owner_access_required'; end if;
  select * into strict d from private.mcy_display_config where singleton;
  return jsonb_build_object('version_no', d.version_no, 'config', d.config, 'updated_at', d.updated_at,
    'log', coalesce((select jsonb_agg(jsonb_build_object('kind', e.kind, 'subject', e.subject, 'before', e.before_value, 'after', e.after_value, 'at', e.occurred_at) order by e.occurred_at desc)
      from (select * from private.mcy_display_events order by occurred_at desc limit 30) e), '[]'::jsonb));
end $$;

create function public.mcy_display_save(p_actor_id uuid, p_expected_version integer, p_config jsonb) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare d private.mcy_display_config%rowtype; id text; ok boolean; prev jsonb;
begin
  if private.mcy_content_review_actor(p_actor_id) <> 'owner' then raise exception using errcode = '42501', message = 'owner_access_required'; end if;
  if p_expected_version is null or p_expected_version < 1 then raise exception using errcode = '22023', message = 'invalid_display_config'; end if;
  perform private.mcy_display_validate(p_config);
  perform pg_advisory_xact_lock(hashtextextended('mcy-display-config', 0));
  if private.mcy_content_review_actor(p_actor_id) <> 'owner' then raise exception using errcode = '42501', message = 'owner_access_required'; end if;
  if (select count(*) from private.mcy_display_events where actor_id = p_actor_id and occurred_at > clock_timestamp() - interval '24 hours') >= 200 then
    raise exception using errcode = 'PT429', message = 'display_limit_reached';
  end if;
  select * into strict d from private.mcy_display_config where singleton for update;
  if d.version_no <> p_expected_version then raise exception using errcode = 'PT409', message = 'display_conflict'; end if;
  -- Editor's choice may only show content that is effectively shown now (approved, switched on after the latest review).
  for id in select jsonb_array_elements_text(p_config->'editors_choice') loop
    select exists (select 1 from private.mcy_content_versions v where v.item_id = id and private.mcy_content_effective(v.item_id, v.content_hash)) into ok;
    if not ok then raise exception using errcode = '22023', message = 'editors_choice_not_shown'; end if;
  end loop;
  if d.config = p_config then return jsonb_build_object('version_no', d.version_no, 'unchanged', true); end if;
  prev := d.config;
  update private.mcy_display_config set config = p_config, version_no = version_no + 1, updated_by = p_actor_id, updated_at = clock_timestamp() where singleton returning * into d;
  insert into private.mcy_display_events(actor_id, kind, subject, before_value, after_value)
    values (p_actor_id, 'config', 'display_config', prev, p_config);
  return jsonb_build_object('version_no', d.version_no, 'unchanged', false);
end $$;

create function public.mcy_content_set_visibility(p_actor_id uuid, p_item_id text, p_seq integer, p_visible boolean) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v private.mcy_content_versions%rowtype; s private.mcy_content_review_states%rowtype; cur private.mcy_content_visibility%rowtype; had boolean; kind text;
begin
  if private.mcy_content_review_actor(p_actor_id) <> 'owner' then raise exception using errcode = '42501', message = 'owner_access_required'; end if;
  if p_item_id is null or p_item_id !~ '^[a-z0-9_-]{1,80}$' or p_seq is null or p_seq < 1 or p_visible is null then raise exception using errcode = '22023', message = 'invalid_visibility'; end if;
  perform pg_advisory_xact_lock(hashtextextended('mcy-display-config', 0));
  perform pg_advisory_xact_lock(hashtextextended('mcy-content-item:' || p_item_id, 0));
  if private.mcy_content_review_actor(p_actor_id) <> 'owner' then raise exception using errcode = '42501', message = 'owner_access_required'; end if;
  if (select count(*) from private.mcy_display_events where actor_id = p_actor_id and occurred_at > clock_timestamp() - interval '24 hours') >= 200 then
    raise exception using errcode = 'PT429', message = 'display_limit_reached';
  end if;
  select * into v from private.mcy_content_versions where item_id = p_item_id and seq = p_seq;
  if not found then raise exception using errcode = '22023', message = 'content_item_not_found'; end if;
  select i.kind into kind from private.mcy_content_items i where i.item_id = p_item_id;
  if p_visible then
    if v.status <> 'submitted' then raise exception using errcode = '22023', message = 'content_not_submitted'; end if;
    select * into s from private.mcy_content_review_states where candidate_id = v.item_id and content_version = v.content_hash for share;
    if not found or s.decision <> 'approved' then raise exception using errcode = '22023', message = 'content_not_approved'; end if;
  end if;
  select * into cur from private.mcy_content_visibility where item_id = v.item_id and content_hash = v.content_hash for update;
  had := found;
  -- Switching on again after a newer review is a real change even if the stored value matches: it re-dates the switch.
  if had and cur.visible = p_visible and (not p_visible or s.updated_at is null or cur.updated_at >= s.updated_at) then
    return jsonb_build_object('item_id', v.item_id, 'seq', v.seq, 'visible', cur.visible, 'unchanged', true);
  end if;
  if p_visible then
    -- One shown version per item: switching a version on switches the item's other versions off.
    update private.mcy_content_visibility set visible = false, updated_by = p_actor_id, updated_at = clock_timestamp()
      where item_id = v.item_id and content_hash <> v.content_hash and visible;
  end if;
  insert into private.mcy_content_visibility(item_id, content_hash, visible, updated_by, updated_at)
    values (v.item_id, v.content_hash, p_visible, p_actor_id, clock_timestamp())
    on conflict (item_id, content_hash) do update set visible = excluded.visible, updated_by = excluded.updated_by, updated_at = excluded.updated_at;
  if not p_visible then
    -- A hidden item cannot stay in the Editor's choice slots.
    update private.mcy_display_config set config = jsonb_set(config, '{editors_choice}', coalesce((select jsonb_agg(e) from jsonb_array_elements(config->'editors_choice') e where (e #>> '{}') <> v.item_id), '[]'::jsonb)),
      version_no = version_no + 1, updated_by = p_actor_id, updated_at = clock_timestamp()
      where singleton and config->'editors_choice' ? v.item_id;
  end if;
  insert into private.mcy_display_events(actor_id, kind, subject, before_value, after_value)
    values (p_actor_id, 'visibility', v.item_id || '#' || v.seq, to_jsonb(coalesce(cur.visible, false)), to_jsonb(p_visible));
  return jsonb_build_object('item_id', v.item_id, 'seq', v.seq, 'visible', p_visible, 'unchanged', false);
end $$;

-- Owner view of every stored version's switch and whether it is effectively shown now.
create function public.mcy_content_visibility_list(p_actor_id uuid) returns jsonb language plpgsql security definer set search_path = '' as $$
begin
  if private.mcy_content_review_actor(p_actor_id) <> 'owner' then raise exception using errcode = '42501', message = 'owner_access_required'; end if;
  return jsonb_build_object('rows', coalesce((select jsonb_agg(jsonb_build_object('item_id', x.item_id, 'seq', x.seq, 'content_hash', x.content_hash, 'visible', x.visible,
      'effective', private.mcy_content_effective(x.item_id, x.content_hash), 'updated_at', x.updated_at) order by x.item_id, x.seq)
    from (select ver.item_id, ver.seq, ver.content_hash, vis.visible, vis.updated_at from private.mcy_content_visibility vis
      join private.mcy_content_versions ver on ver.item_id = vis.item_id and ver.content_hash = vis.content_hash where vis.visible limit 500) x), '[]'::jsonb));
end $$;

-- 5. Self-review rule: patch the deployed review function in place. When the Owner has switched owner_self_review off for a
-- kind, the Owner cannot decide the Owner's own (MCY) content of that kind. Refuse unless the expected text occurs exactly once.
do $migration$
declare v_oid oid; v_definition text; v_old constant text := E'  -- Only the latest version, and only after it was submitted, can be decided.';
  v_new constant text := E'  if it.author_kind = ''mcy'' and coalesce((select (d.config->''review_rules''->it.kind->>''owner_self_review'')::boolean from private.mcy_display_config d where d.singleton), true) is not true then\n    raise exception using errcode = ''42501'', message = ''self_review_not_allowed'';\n  end if;\n' || E'  -- Only the latest version, and only after it was submitted, can be decided.';
  v_occurrences integer;
begin
  select p.oid into v_oid from pg_catalog.pg_proc p join pg_catalog.pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public' and p.proname = 'mcy_content_review_item';
  if v_oid is null then raise exception 'public.mcy_content_review_item is missing; refusing to continue'; end if;
  v_definition := pg_catalog.pg_get_functiondef(v_oid);
  v_occurrences := (pg_catalog.length(v_definition) - pg_catalog.length(pg_catalog.replace(v_definition, v_old, ''))) / pg_catalog.length(v_old);
  if v_occurrences <> 1 then
    raise exception 'public.mcy_content_review_item changed (% marker lines found, expected 1); refusing to continue', v_occurrences;
  end if;
  execute pg_catalog.replace(v_definition, v_old, v_new);
end
$migration$;

revoke all on function private.mcy_display_validate(jsonb), private.mcy_content_effective(text, text) from public, anon, authenticated, service_role;
revoke all on function public.mcy_display_read(uuid), public.mcy_display_save(uuid, integer, jsonb), public.mcy_content_set_visibility(uuid, text, integer, boolean),
  public.mcy_content_visibility_list(uuid) from public, anon, authenticated;
grant execute on function public.mcy_display_read(uuid), public.mcy_display_save(uuid, integer, jsonb), public.mcy_content_set_visibility(uuid, text, integer, boolean),
  public.mcy_content_visibility_list(uuid) to service_role;
