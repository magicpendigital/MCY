-- Local-only teacher control-plane RPCs. Keep both Edge gates closed until
-- authenticated actor, reviewer, privacy, rights, and delivery checks pass.

alter table private.workspace_invites
  add column if not exists idempotency_key uuid,
  add column if not exists delivery_state text not null default 'uncertain'
    check (delivery_state in ('ready', 'in_progress', 'sent', 'uncertain')),
  add column if not exists delivery_started_at timestamptz,
  add column if not exists delivery_updated_at timestamptz not null default pg_catalog.now();

-- Existing accepted invites prove delivery; every other legacy invitation has
-- an unknown delivery outcome and therefore must not be retried automatically.
update private.workspace_invites
set delivery_state = 'sent',
    delivery_updated_at = pg_catalog.now()
where accepted_at is not null and delivery_state <> 'sent';

create unique index if not exists workspace_invites_actor_idempotency_idx
  on private.workspace_invites(invited_by, idempotency_key)
  where invited_by is not null and idempotency_key is not null;

create index if not exists workspace_invites_pending_teacher_idx
  on private.workspace_invites(email_hash, expires_at desc)
  where role = 'teacher' and scope_type = 'global' and accepted_at is null;

create or replace function public.mcy_teacher_prepare_invite(
  p_actor_id uuid,
  p_email_hash text,
  p_actor_email_hash text,
  p_idempotency_key uuid,
  p_role text,
  p_scope_type text,
  p_expires_in_hours integer
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_invite private.workspace_invites%rowtype;
  v_invite_id uuid;
begin
  if p_actor_id is null or p_idempotency_key is null
     or p_email_hash is null or p_email_hash !~ '^[0-9a-f]{64}$'
     or p_actor_email_hash is null or p_actor_email_hash !~ '^[0-9a-f]{64}$'
     or p_role is distinct from 'teacher'
     or p_scope_type is distinct from 'global'
     or p_expires_in_hours is distinct from 72 then
    raise exception using errcode = '22023', message = 'Invalid teacher invitation';
  end if;

  if not exists (
    select 1 from private.role_assignments r
    where r.user_id = p_actor_id
      and r.role = 'owner'
      and r.scope_type = 'global'
      and r.status = 'active'
      and r.starts_at <= pg_catalog.now()
      and (r.ends_at is null or r.ends_at > pg_catalog.now())
  ) then
    raise exception using errcode = '42501', message = 'Owner role required';
  end if;

  if p_email_hash = p_actor_email_hash then
    raise exception using errcode = '22023', message = 'Self invitation is not allowed';
  end if;

  select i.* into v_invite
  from private.workspace_invites i
  where i.invited_by = p_actor_id and i.idempotency_key = p_idempotency_key
  for update;
  if found then
    if v_invite.email_hash <> p_email_hash or v_invite.role <> 'teacher'
       or v_invite.scope_type <> 'global' then
      raise exception using errcode = '23505', message = 'Idempotency key already used';
    end if;
    return pg_catalog.jsonb_build_object(
      'invite_id', v_invite.id,
      'delivery_state', case when v_invite.accepted_at is not null then 'sent' else v_invite.delivery_state end
    );
  end if;

  -- Serialize per Owner and target so parallel requests cannot bypass the
  -- hourly cap or create two pending invitations for the same email hash.
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('mcy-teacher-invite-owner:' || p_actor_id::text, 0)
  );
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_email_hash, 0));

  -- Do not create or send a second invitation while a matching one is pending.
  select i.* into v_invite
  from private.workspace_invites i
  where i.email_hash = p_email_hash
    and i.role = 'teacher'
    and i.scope_type = 'global'
    and i.accepted_at is null
    and i.expires_at > pg_catalog.now()
  order by i.created_at desc
  limit 1
  for update;
  if found then
    return pg_catalog.jsonb_build_object(
      'invite_id', v_invite.id,
      'delivery_state', v_invite.delivery_state
    );
  end if;

  if (
    select pg_catalog.count(*)
    from private.workspace_invites i
    where i.invited_by = p_actor_id
      and i.created_at > pg_catalog.now() - interval '1 hour'
  ) >= 3 then
    raise exception using errcode = '54000', message = 'Invitation rate limit reached';
  end if;

  v_invite_id := pg_catalog.gen_random_uuid();
  insert into private.workspace_invites (
    id, email_hash, role, scope_type, scope_id, token_hash, invited_by,
    expires_at, idempotency_key, delivery_state, delivery_started_at, delivery_updated_at
  ) values (
    v_invite_id, p_email_hash, 'teacher', 'global', null,
    pg_catalog.gen_random_uuid()::text, p_actor_id,
    pg_catalog.now() + interval '72 hours', p_idempotency_key,
    'in_progress', pg_catalog.now(), pg_catalog.now()
  );

  insert into private.audit_events (
    actor_id, actor_type, action, object_schema, object_table, object_id,
    outcome, reason, metadata
  ) values (
    p_actor_id, 'user', 'teacher.invite.prepared', 'private', 'workspace_invites', v_invite_id,
    'success', 'Owner prepared a staging teacher invitation',
    pg_catalog.jsonb_build_object('role', 'teacher', 'scope_type', 'global', 'delivery_state', 'in_progress')
  );

  -- The new row is already claimed as in_progress. "ready" is returned only
  -- to this caller so concurrent retries cannot both send the same email.
  return pg_catalog.jsonb_build_object('invite_id', v_invite_id, 'delivery_state', 'ready');
end
$$;

create or replace function public.mcy_teacher_invite_mark_delivered(
  p_actor_id uuid,
  p_invite_id uuid
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_updated integer;
begin
  if p_actor_id is null or p_invite_id is null or not exists (
    select 1 from private.role_assignments r
    where r.user_id = p_actor_id and r.role = 'owner' and r.scope_type = 'global'
      and r.status = 'active' and r.starts_at <= pg_catalog.now()
      and (r.ends_at is null or r.ends_at > pg_catalog.now())
  ) then
    raise exception using errcode = '42501', message = 'Owner role required';
  end if;

  update private.workspace_invites i
  set delivery_state = 'sent', delivery_updated_at = pg_catalog.now()
  where i.id = p_invite_id and i.invited_by = p_actor_id
    and i.role = 'teacher' and i.scope_type = 'global'
    and i.accepted_at is null and i.delivery_state = 'in_progress';
  get diagnostics v_updated = row_count;
  if v_updated = 1 then
    insert into private.audit_events (
      actor_id, actor_type, action, object_schema, object_table, object_id,
      outcome, reason, metadata
    ) values (
      p_actor_id, 'user', 'teacher.invite.delivery_confirmed', 'private', 'workspace_invites', p_invite_id,
      'success', 'Auth provider accepted the invitation request',
      pg_catalog.jsonb_build_object('delivery_state', 'sent')
    );
    return true;
  end if;
  return false;
end
$$;

create or replace function public.mcy_teacher_invite_delivery_failed(
  p_actor_id uuid,
  p_invite_id uuid
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_updated integer;
begin
  if p_actor_id is null or p_invite_id is null or not exists (
    select 1 from private.role_assignments r
    where r.user_id = p_actor_id and r.role = 'owner' and r.scope_type = 'global'
      and r.status = 'active' and r.starts_at <= pg_catalog.now()
      and (r.ends_at is null or r.ends_at > pg_catalog.now())
  ) then
    raise exception using errcode = '42501', message = 'Owner role required';
  end if;

  update private.workspace_invites i
  set delivery_state = 'uncertain', delivery_updated_at = pg_catalog.now()
  where i.id = p_invite_id and i.invited_by = p_actor_id
    and i.role = 'teacher' and i.scope_type = 'global'
    and i.accepted_at is null and i.delivery_state = 'in_progress';
  get diagnostics v_updated = row_count;
  if v_updated = 1 then
    insert into private.audit_events (
      actor_id, actor_type, action, object_schema, object_table, object_id,
      outcome, reason, metadata
    ) values (
      p_actor_id, 'user', 'teacher.invite.delivery_uncertain', 'private', 'workspace_invites', p_invite_id,
      'failure', 'Auth provider outcome could not be confirmed; automatic retry is disabled',
      pg_catalog.jsonb_build_object('delivery_state', 'uncertain')
    );
    return true;
  end if;
  return false;
end
$$;

create or replace function public.mcy_teacher_accept_own_invite(
  p_actor_id uuid,
  p_email_hash text,
  p_public_name text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_confirmed_at timestamptz;
  v_profile_name text;
  v_invite private.workspace_invites%rowtype;
  v_assignment_id uuid;
begin
  if p_actor_id is null or p_email_hash is null or p_email_hash !~ '^[0-9a-f]{64}$'
     or p_public_name is null or pg_catalog.length(pg_catalog.btrim(p_public_name)) not between 1 and 80
     or p_public_name ~ '[[:cntrl:]]' then
    raise exception using errcode = '22023', message = 'Invalid invitation acceptance';
  end if;

  select u.email_confirmed_at into v_confirmed_at
  from auth.users u where u.id = p_actor_id for update;
  if not found or v_confirmed_at is null then
    raise exception using errcode = '42501', message = 'Confirmed account required';
  end if;

  select p.display_name into v_profile_name
  from public.profiles p where p.user_id = p_actor_id;
  if v_profile_name is null or pg_catalog.btrim(v_profile_name) <> pg_catalog.btrim(p_public_name)
     or pg_catalog.length(pg_catalog.btrim(v_profile_name)) not between 1 and 80
     or v_profile_name ~ '[[:cntrl:]]' then
    raise exception using errcode = '42501', message = 'Registered profile name required';
  end if;

  -- Make acceptance retries idempotent, but never revive a revoked role from a consumed invite.
  select i.* into v_invite
  from private.workspace_invites i
  where i.email_hash = p_email_hash and i.role = 'teacher' and i.scope_type = 'global'
    and i.accepted_at is not null and i.accepted_by = p_actor_id
  order by i.accepted_at desc limit 1;
  if found then
    if exists (
      select 1 from private.role_assignments r
      where r.user_id = p_actor_id and r.role = 'teacher' and r.scope_type = 'global'
        and r.status = 'active' and r.starts_at <= pg_catalog.now()
        and (r.ends_at is null or r.ends_at > pg_catalog.now())
    ) and exists (select 1 from public.teachers t where t.user_id = p_actor_id and t.active) then
      return pg_catalog.jsonb_build_object('status', 'active', 'role', 'teacher');
    end if;
    raise exception using errcode = '42501', message = 'Invitation access is no longer active';
  end if;

  select i.* into v_invite
  from private.workspace_invites i
  where i.email_hash = p_email_hash and i.role = 'teacher' and i.scope_type = 'global'
    and i.accepted_at is null and i.expires_at > pg_catalog.now()
    and i.delivery_state = 'sent'
  order by i.created_at desc
  limit 1
  for update;
  if not found then
    raise exception using errcode = '42501', message = 'Invitation required';
  end if;

  update private.workspace_invites i
  set accepted_at = pg_catalog.now(), accepted_by = p_actor_id, delivery_updated_at = pg_catalog.now()
  where i.id = v_invite.id;

  select r.id into v_assignment_id
  from private.role_assignments r
  where r.user_id = p_actor_id and r.role = 'teacher' and r.scope_type = 'global'
    and r.status = 'active' and r.starts_at <= pg_catalog.now()
    and (r.ends_at is null or r.ends_at > pg_catalog.now())
  limit 1;

  if v_assignment_id is null then
    update private.role_assignments r
    set status = 'active', starts_at = pg_catalog.now(), ends_at = null,
        assigned_by = v_invite.invited_by, reason = 'Accepted a verified staging teacher invitation',
        revoked_at = null
    where r.id = (
      select prior.id from private.role_assignments prior
      where prior.user_id = p_actor_id and prior.role = 'teacher' and prior.scope_type = 'global'
        and (
          prior.status in ('revoked', 'expired')
          or (prior.status = 'active' and (
            prior.starts_at > pg_catalog.now()
            or (prior.ends_at is not null and prior.ends_at <= pg_catalog.now())
          ))
        )
      order by prior.created_at desc limit 1
    )
    returning r.id into v_assignment_id;

    if v_assignment_id is null then
      insert into private.role_assignments (
        user_id, role, scope_type, scope_id, status, reason, starts_at, assigned_by
      ) values (
        p_actor_id, 'teacher', 'global', null, 'active',
        'Accepted a verified staging teacher invitation', pg_catalog.now(), v_invite.invited_by
      ) returning id into v_assignment_id;
    end if;
  end if;

  insert into public.teachers (user_id, public_name, active)
  values (p_actor_id, pg_catalog.btrim(v_profile_name), true)
  on conflict (user_id) do update
    set public_name = excluded.public_name, active = true, updated_at = pg_catalog.now();

  insert into private.audit_events (
    actor_id, actor_type, action, object_schema, object_table, object_id,
    outcome, reason, metadata
  ) values (
    p_actor_id, 'user', 'teacher.invite.accepted', 'private', 'workspace_invites', v_invite.id,
    'success', 'Teacher accepted a delivered, email-matched invitation',
    pg_catalog.jsonb_build_object('role', 'teacher', 'scope_type', 'global', 'assignment_id', v_assignment_id)
  );

  return pg_catalog.jsonb_build_object('status', 'active', 'role', 'teacher');
end
$$;

create or replace function public.mcy_teacher_list_own_drafts(p_actor_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_drafts jsonb;
begin
  if p_actor_id is null or not exists (
    select 1 from private.role_assignments r
    join public.teachers t on t.user_id = r.user_id and t.active
    where r.user_id = p_actor_id and r.role = 'teacher' and r.scope_type = 'global'
      and r.status = 'active' and r.starts_at <= pg_catalog.now()
      and (r.ends_at is null or r.ends_at > pg_catalog.now())
  ) then
    raise exception using errcode = '42501', message = 'Teacher role required';
  end if;

  select coalesce(pg_catalog.jsonb_agg(q.item order by q.updated_at desc), '[]'::jsonb)
  into v_drafts
  from (
    select pg_catalog.jsonb_build_object(
      'session_id', s.id, 'version_id', v.id, 'version_no', v.version_no,
      'title', v.title, 'locale', v.locale, 'status', 'draft', 'updated_at', v.updated_at
    ) as item, v.updated_at
    from public.sessions s
    join public.session_versions v on v.session_id = s.id
    where s.owner_teacher_id = p_actor_id and v.locale = 'vi-VN' and v.status = 'draft'
      and not exists (
        select 1 from public.session_versions newer
        where newer.session_id = v.session_id and newer.locale = v.locale
          and newer.version_no > v.version_no
      )
    order by v.updated_at desc
    limit 100
  ) q;
  return v_drafts;
end
$$;

create or replace function public.mcy_teacher_read_own_draft(
  p_actor_id uuid,
  p_session_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_version public.session_versions%rowtype;
  v_segments jsonb;
begin
  if p_actor_id is null or p_session_id is null or not exists (
    select 1 from private.role_assignments r
    join public.teachers t on t.user_id = r.user_id and t.active
    where r.user_id = p_actor_id and r.role = 'teacher' and r.scope_type = 'global'
      and r.status = 'active' and r.starts_at <= pg_catalog.now()
      and (r.ends_at is null or r.ends_at > pg_catalog.now())
  ) then
    raise exception using errcode = '42501', message = 'Teacher role required';
  end if;

  select v.* into v_version
  from public.session_versions v
  join public.sessions s on s.id = v.session_id
  where v.session_id = p_session_id and s.owner_teacher_id = p_actor_id and v.locale = 'vi-VN'
  order by v.version_no desc limit 1;
  if not found then
    raise exception using errcode = 'P0002', message = 'Draft not found';
  end if;
  if v_version.status <> 'draft' then
    raise exception using errcode = 'P0002', message = 'Draft not found';
  end if;

  select coalesce(pg_catalog.jsonb_agg(pg_catalog.jsonb_build_object(
    'position', g.position, 'start_ms', g.start_ms, 'end_ms', g.end_ms,
    'movement_name', g.movement_name, 'cue_text', g.cue_text, 'stop_cue', g.stop_cue,
    'breath_cue', g.breath_cue, 'variant_ref', g.variant_ref
  ) order by g.position), '[]'::jsonb)
  into v_segments
  from public.session_segments g where g.session_version_id = v_version.id;

  return pg_catalog.jsonb_build_object(
    'session_id', v_version.session_id, 'expected_version', v_version.version_no,
    'version_id', v_version.id, 'version_no', v_version.version_no,
    'locale', v_version.locale, 'title', v_version.title,
    'summary', coalesce(v_version.summary, ''), 'objective', coalesce(v_version.objective, ''),
    'level', coalesce(v_version.level, ''), 'intensity', coalesce(v_version.intensity, ''),
    'pace', coalesce(v_version.pace, ''),
    'instruction_density', coalesce(v_version.instruction_density, ''),
    'duration_seconds', v_version.duration_seconds,
    'props', v_version.props, 'space_requirement', coalesce(v_version.space_requirement, ''),
    'floor_contact', coalesce(v_version.floor_contact, ''), 'positions', v_version.positions,
    'learning_focus', v_version.learning_focus, 'segments', v_segments,
    'status', 'draft', 'updated_at', v_version.updated_at
  );
end
$$;

create or replace function public.mcy_teacher_save_own_draft(
  p_actor_id uuid,
  p_draft jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_session_id uuid;
  v_source_version_id uuid;
  v_expected_version integer;
  v_version_no integer;
  v_duration_seconds integer;
  v_version_id uuid;
  v_updated_at timestamptz;
  v_current public.session_versions%rowtype;
  v_segment jsonb;
  v_ordinal integer := 0;
  v_position integer;
  v_start_ms integer;
  v_end_ms integer;
  v_previous_end integer := 0;
  v_recent_save_count integer;
begin
  if p_actor_id is null or not exists (
    select 1 from private.role_assignments r
    join public.teachers t on t.user_id = r.user_id and t.active
    where r.user_id = p_actor_id and r.role = 'teacher' and r.scope_type = 'global'
      and r.status = 'active' and r.starts_at <= pg_catalog.now()
      and (r.ends_at is null or r.ends_at > pg_catalog.now())
  ) then
    raise exception using errcode = '42501', message = 'Teacher role required';
  end if;

  if p_draft is null or pg_catalog.jsonb_typeof(p_draft) is distinct from 'object'
     or p_draft->>'locale' is distinct from 'vi-VN'
     or p_draft->>'title' is null or pg_catalog.length(pg_catalog.btrim(p_draft->>'title')) not between 1 and 120
     or (p_draft->>'title') ~ '[[:cntrl:]]'
     or pg_catalog.length(coalesce(p_draft->>'summary', '')) > 1000
     or pg_catalog.length(coalesce(p_draft->>'objective', '')) > 1000
     or pg_catalog.length(coalesce(p_draft->>'level', '')) > 80
     or pg_catalog.length(coalesce(p_draft->>'intensity', '')) > 80
     or pg_catalog.length(coalesce(p_draft->>'pace', '')) > 80
     or pg_catalog.length(coalesce(p_draft->>'instruction_density', '')) > 80
     or pg_catalog.length(coalesce(p_draft->>'space_requirement', '')) > 240
     or pg_catalog.length(coalesce(p_draft->>'floor_contact', '')) > 240
     or coalesce(p_draft->>'summary', '') ~ '[[:cntrl:]]'
     or coalesce(p_draft->>'objective', '') ~ '[[:cntrl:]]'
     or coalesce(p_draft->>'level', '') ~ '[[:cntrl:]]'
     or coalesce(p_draft->>'intensity', '') ~ '[[:cntrl:]]'
     or coalesce(p_draft->>'pace', '') ~ '[[:cntrl:]]'
     or coalesce(p_draft->>'instruction_density', '') ~ '[[:cntrl:]]'
     or coalesce(p_draft->>'space_requirement', '') ~ '[[:cntrl:]]'
     or coalesce(p_draft->>'floor_contact', '') ~ '[[:cntrl:]]'
     or pg_catalog.jsonb_typeof(p_draft->'duration_seconds') is distinct from 'number'
     or (p_draft->>'duration_seconds') !~ '^[0-9]{1,4}$'
     or (p_draft->>'duration_seconds')::integer not between 1 and 3600 then
    raise exception using errcode = '22023', message = 'Invalid teacher draft';
  end if;

  v_duration_seconds := (p_draft->>'duration_seconds')::integer;
  if pg_catalog.jsonb_typeof(p_draft->'props') is distinct from 'array'
     or pg_catalog.jsonb_typeof(p_draft->'positions') is distinct from 'array'
     or pg_catalog.jsonb_typeof(p_draft->'learning_focus') is distinct from 'array'
     or pg_catalog.jsonb_typeof(p_draft->'segments') is distinct from 'array' then
    raise exception using errcode = '22023', message = 'Invalid teacher draft arrays';
  end if;
  if pg_catalog.jsonb_array_length(p_draft->'props') > 12
     or pg_catalog.jsonb_array_length(p_draft->'positions') > 8
     or pg_catalog.jsonb_array_length(p_draft->'learning_focus') > 12
     or pg_catalog.jsonb_array_length(p_draft->'segments') > 40 then
    raise exception using errcode = '22023', message = 'Invalid teacher draft arrays';
  end if;

  if exists (select 1 from pg_catalog.jsonb_array_elements(p_draft->'props') e(value)
      where pg_catalog.jsonb_typeof(e.value) is distinct from 'string'
        or pg_catalog.length(e.value #>> '{}') > 80 or (e.value #>> '{}') ~ '[[:cntrl:]]')
     or exists (select 1 from pg_catalog.jsonb_array_elements(p_draft->'positions') e(value)
      where pg_catalog.jsonb_typeof(e.value) is distinct from 'string'
        or pg_catalog.length(e.value #>> '{}') > 80 or (e.value #>> '{}') ~ '[[:cntrl:]]')
     or exists (select 1 from pg_catalog.jsonb_array_elements(p_draft->'learning_focus') e(value)
      where pg_catalog.jsonb_typeof(e.value) is distinct from 'string'
        or pg_catalog.length(e.value #>> '{}') > 120 or (e.value #>> '{}') ~ '[[:cntrl:]]') then
    raise exception using errcode = '22023', message = 'Invalid teacher draft arrays';
  end if;

  if p_draft->>'session_id' is null then
    if p_draft->>'expected_version' is not null then
      raise exception using errcode = '22023', message = 'Invalid draft version';
    end if;
  else
    if (p_draft->>'session_id') !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
       or p_draft->>'expected_version' is null
       or (p_draft->>'expected_version') !~ '^[1-9][0-9]{0,8}$' then
      raise exception using errcode = '22023', message = 'Invalid draft version';
    end if;
    v_session_id := (p_draft->>'session_id')::uuid;
    v_expected_version := (p_draft->>'expected_version')::integer;
  end if;

  for v_segment in
    select e.value from pg_catalog.jsonb_array_elements(p_draft->'segments') with ordinality as e(value, ord)
    order by e.ord
  loop
    v_ordinal := v_ordinal + 1;
    if pg_catalog.jsonb_typeof(v_segment) is distinct from 'object'
       or coalesce(v_segment->>'position', '') !~ '^[1-9][0-9]{0,2}$'
       or coalesce(v_segment->>'start_ms', '') !~ '^[0-9]{1,9}$'
       or coalesce(v_segment->>'end_ms', '') !~ '^[1-9][0-9]{0,9}$' then
      raise exception using errcode = '22023', message = 'Invalid teacher draft segments';
    end if;
    v_position := (v_segment->>'position')::integer;
    v_start_ms := (v_segment->>'start_ms')::integer;
    v_end_ms := (v_segment->>'end_ms')::integer;
    if v_position <> v_ordinal or v_start_ms < v_previous_end
       or v_end_ms <= v_start_ms or v_end_ms::bigint > v_duration_seconds::bigint * 1000
       or pg_catalog.length(coalesce(v_segment->>'movement_name', '')) > 120
       or pg_catalog.length(coalesce(v_segment->>'cue_text', '')) > 600
       or pg_catalog.length(coalesce(v_segment->>'stop_cue', '')) > 400
       or pg_catalog.length(coalesce(v_segment->>'breath_cue', '')) > 400
       or pg_catalog.length(coalesce(v_segment->>'variant_ref', '')) > 100
       or coalesce(v_segment->>'movement_name', '') ~ '[[:cntrl:]]'
       or coalesce(v_segment->>'cue_text', '') ~ '[[:cntrl:]]'
       or coalesce(v_segment->>'stop_cue', '') ~ '[[:cntrl:]]'
       or coalesce(v_segment->>'breath_cue', '') ~ '[[:cntrl:]]'
       or coalesce(v_segment->>'variant_ref', '') ~ '[[:cntrl:]]' then
      raise exception using errcode = '22023', message = 'Invalid teacher draft segments';
    end if;
    v_previous_end := v_end_ms;
  end loop;

  -- Serialize saves per teacher so parallel requests cannot race past the rolling quota.
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('mcy:teacher-draft-save:' || p_actor_id::text, 0)
  );
  select pg_catalog.count(*)::integer into v_recent_save_count
  from private.audit_events e
  where e.actor_id = p_actor_id
    and e.action = 'teacher.draft.saved'
    and e.outcome = 'success'
    and e.occurred_at >= pg_catalog.now() - interval '24 hours';
  if v_recent_save_count >= 20 then
    raise exception using errcode = '54000', message = 'Teacher draft write limit reached';
  end if;

  if v_session_id is null then
    v_session_id := pg_catalog.gen_random_uuid();
    insert into public.sessions (id, owner_teacher_id, stable_slug)
    values (
      v_session_id, p_actor_id,
      'teacher-draft-' || pg_catalog.replace(pg_catalog.gen_random_uuid()::text, '-', '')
    );
  else
    perform 1 from public.sessions s
    where s.id = v_session_id and s.owner_teacher_id = p_actor_id
    for update;
    if not found then
      raise exception using errcode = 'P0002', message = 'Draft not found';
    end if;

    select v.* into v_current
    from public.session_versions v
    where v.session_id = v_session_id and v.locale = 'vi-VN'
    order by v.version_no desc limit 1;
    if not found or v_current.status <> 'draft' then
      raise exception using errcode = '40001', message = 'Draft changed; reload before saving';
    end if;
    if v_current.version_no <> v_expected_version then
      raise exception using errcode = '40001', message = 'Draft changed; reload before saving';
    end if;
    v_source_version_id := v_current.id;
  end if;

  select coalesce(pg_catalog.max(v.version_no), 0) + 1 into v_version_no
  from public.session_versions v
  where v.session_id = v_session_id and v.locale = 'vi-VN';

  insert into public.session_versions (
    session_id, version_no, source_version_id, locale, title, summary, objective,
    level, intensity, pace, instruction_density, duration_seconds, props,
    space_requirement, floor_contact, positions, learning_focus, status
  ) values (
    v_session_id, v_version_no, v_source_version_id, 'vi-VN', pg_catalog.btrim(p_draft->>'title'),
    nullif(pg_catalog.btrim(coalesce(p_draft->>'summary', '')), ''),
    nullif(pg_catalog.btrim(coalesce(p_draft->>'objective', '')), ''),
    nullif(pg_catalog.btrim(coalesce(p_draft->>'level', '')), ''),
    nullif(pg_catalog.btrim(coalesce(p_draft->>'intensity', '')), ''),
    nullif(pg_catalog.btrim(coalesce(p_draft->>'pace', '')), ''),
    nullif(pg_catalog.btrim(coalesce(p_draft->>'instruction_density', '')), ''),
    v_duration_seconds, p_draft->'props',
    nullif(pg_catalog.btrim(coalesce(p_draft->>'space_requirement', '')), ''),
    nullif(pg_catalog.btrim(coalesce(p_draft->>'floor_contact', '')), ''),
    p_draft->'positions', p_draft->'learning_focus', 'draft'
  ) returning id, updated_at into v_version_id, v_updated_at;

  insert into public.session_segments (
    session_version_id, position, start_ms, end_ms, movement_name,
    cue_text, stop_cue, breath_cue, variant_ref
  )
  select v_version_id, e.position, e.start_ms, e.end_ms,
    nullif(pg_catalog.btrim(e.movement_name), ''), nullif(pg_catalog.btrim(e.cue_text), ''),
    nullif(pg_catalog.btrim(e.stop_cue), ''), nullif(pg_catalog.btrim(e.breath_cue), ''),
    nullif(pg_catalog.btrim(e.variant_ref), '')
  from pg_catalog.jsonb_to_recordset(p_draft->'segments') as e(
    position integer, start_ms integer, end_ms integer, movement_name text,
    cue_text text, stop_cue text, breath_cue text, variant_ref text
  );

  update public.sessions s set updated_at = pg_catalog.now() where s.id = v_session_id;

  insert into private.audit_events (
    actor_id, actor_type, action, object_schema, object_table, object_id,
    outcome, reason, metadata
  ) values (
    p_actor_id, 'user', 'teacher.draft.saved', 'public', 'sessions', v_session_id,
    'success', 'Teacher saved a private staging draft',
    pg_catalog.jsonb_build_object('version_id', v_version_id, 'version_no', v_version_no, 'locale', 'vi-VN')
  );

  return pg_catalog.jsonb_build_object(
    'session_id', v_session_id, 'version_id', v_version_id, 'version_no', v_version_no,
    'title', pg_catalog.btrim(p_draft->>'title'), 'locale', 'vi-VN',
    'status', 'draft', 'updated_at', v_updated_at
  );
end
$$;

revoke all on function public.mcy_teacher_prepare_invite(uuid, text, text, uuid, text, text, integer) from public, anon, authenticated;
revoke all on function public.mcy_teacher_invite_mark_delivered(uuid, uuid) from public, anon, authenticated;
revoke all on function public.mcy_teacher_invite_delivery_failed(uuid, uuid) from public, anon, authenticated;
revoke all on function public.mcy_teacher_accept_own_invite(uuid, text, text) from public, anon, authenticated;
revoke all on function public.mcy_teacher_list_own_drafts(uuid) from public, anon, authenticated;
revoke all on function public.mcy_teacher_read_own_draft(uuid, uuid) from public, anon, authenticated;
revoke all on function public.mcy_teacher_save_own_draft(uuid, jsonb) from public, anon, authenticated;

grant execute on function public.mcy_teacher_prepare_invite(uuid, text, text, uuid, text, text, integer) to service_role;
grant execute on function public.mcy_teacher_invite_mark_delivered(uuid, uuid) to service_role;
grant execute on function public.mcy_teacher_invite_delivery_failed(uuid, uuid) to service_role;
grant execute on function public.mcy_teacher_accept_own_invite(uuid, text, text) to service_role;
grant execute on function public.mcy_teacher_list_own_drafts(uuid) to service_role;
grant execute on function public.mcy_teacher_read_own_draft(uuid, uuid) to service_role;
grant execute on function public.mcy_teacher_save_own_draft(uuid, jsonb) to service_role;
