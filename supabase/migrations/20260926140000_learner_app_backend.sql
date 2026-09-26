-- Learner P1 backend boundary: narrow client grants and expose only owner-scoped RPCs.
-- The native/web client never receives the service-role key.

alter table public.checkins
  add column if not exists body_status text,
  add column if not exists capture_type text not null default 'practice_preparation',
  add column if not exists idempotency_key text;

alter table public.checkins
  drop constraint if exists checkins_body_status_check,
  add constraint checkins_body_status_check
    check (body_status is null or body_status in ('reported', 'none_now', 'uncertain', 'skipped')),
  drop constraint if exists checkins_capture_type_check,
  add constraint checkins_capture_type_check
    check (capture_type in ('practice_preparation', 'standalone'));

create unique index if not exists checkins_user_idempotency_key_idx
  on public.checkins(user_id, idempotency_key)
  where idempotency_key is not null;

alter table public.checkin_observations
  drop constraint if exists checkin_observations_region_code_check,
  add constraint checkin_observations_region_code_check
    check (region_code in ('neck', 'shoulder_left', 'shoulder_right', 'shoulder_unspecified', 'upper_back', 'lower_back'));

alter table private.consent_events
  drop constraint if exists consent_events_purpose_check,
  add constraint consent_events_purpose_check
    check (purpose in (
      'terms', 'privacy', 'wellbeing_data', 'ai_processing',
      'teacher_sharing', 'notifications', 'marketing'
    ));

-- Keep PII and learner notes off the anonymous Data API. Authenticated users
-- can read only their own rows via the existing RLS policies. Check-ins are
-- written through an atomic RPC which checks the consent ledger first.
revoke all privileges on table
  public.profiles,
  public.user_consents,
  public.checkins,
  public.checkin_observations,
  public.daily_dialogues,
  public.dialogue_turns,
  public.practice_plans,
  public.practice_runs,
  public.practice_reflections,
  public.reflection_observations
from anon, authenticated;

grant select on table
  public.profiles,
  public.checkins,
  public.checkin_observations
to authenticated;

grant insert, update on table public.profiles to authenticated;

create or replace function public.record_my_consent(
  p_purpose text,
  p_action text,
  p_policy_version text,
  p_source text,
  p_idempotency_key text,
  p_channel text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_id uuid;
  v_current_action text;
begin
  if v_user_id is null then
    raise exception using errcode = '28000', message = 'Authentication required';
  end if;
  if p_purpose not in ('terms', 'privacy', 'wellbeing_data', 'ai_processing', 'teacher_sharing', 'notifications', 'marketing') then
    raise exception using errcode = '22023', message = 'Unsupported consent purpose';
  end if;
  if p_action not in ('granted', 'revoked') then
    raise exception using errcode = '22023', message = 'Unsupported consent action';
  end if;
  if p_source not in ('onboarding', 'settings') then
    raise exception using errcode = '22023', message = 'Unsupported consent source';
  end if;
  if p_channel not in ('web', 'ios', 'android') then
    raise exception using errcode = '22023', message = 'Unsupported client channel';
  end if;
  if length(p_policy_version) not between 1 and 80 or length(p_idempotency_key) not between 8 and 120 then
    raise exception using errcode = '22023', message = 'Invalid consent event metadata';
  end if;

  select e.action into v_current_action
  from private.consent_events e
  where e.user_id = v_user_id and e.purpose = p_purpose
  order by e.occurred_at desc, e.created_at desc, e.id desc
  limit 1;

  if p_action = 'revoked' and v_current_action is distinct from 'granted' then
    return null;
  end if;

  insert into private.consent_events (
    user_id, purpose, action, policy_version, source, evidence, idempotency_key
  ) values (
    v_user_id, p_purpose, p_action, p_policy_version, p_source,
    jsonb_build_object('channel', p_channel), p_idempotency_key
  )
  on conflict (user_id, idempotency_key) where idempotency_key is not null do nothing
  returning id into v_id;

  if v_id is null then
    select e.id into v_id
    from private.consent_events e
    where e.user_id = v_user_id and e.idempotency_key = p_idempotency_key;
  end if;
  return v_id;
end;
$$;

create or replace function public.get_my_consent_state()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  with purposes(purpose) as (
    values ('terms'), ('privacy'), ('wellbeing_data'), ('ai_processing'),
           ('teacher_sharing'), ('notifications'), ('marketing')
  ), latest as (
    select distinct on (e.purpose) e.purpose, e.action
    from private.consent_events e
    where e.user_id = auth.uid()
  order by e.purpose, e.occurred_at desc, e.created_at desc, e.id desc
  )
  select coalesce(jsonb_object_agg(p.purpose, coalesce(l.action = 'granted', false)), '{}'::jsonb)
  from purposes p
  left join latest l on l.purpose = p.purpose
  where auth.uid() is not null;
$$;

create or replace function public.save_my_checkin(
  p_local_date date,
  p_local_timezone text,
  p_energy_level smallint,
  p_body_status text,
  p_capture_type text,
  p_observations jsonb,
  p_idempotency_key text
)
returns table(checkin_id uuid, created_at timestamptz)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_checkin public.checkins%rowtype;
  v_item jsonb;
  v_region text;
  v_state text;
  v_level smallint;
  v_note text;
begin
  if v_user_id is null then
    raise exception using errcode = '28000', message = 'Authentication required';
  end if;
  if length(coalesce(p_local_timezone, '')) not between 1 and 80 then
    raise exception using errcode = '22023', message = 'Invalid timezone';
  end if;
  if p_energy_level is not null and p_energy_level not between 0 and 5 then
    raise exception using errcode = '22023', message = 'Invalid energy level';
  end if;
  if p_body_status is not null and p_body_status not in ('reported', 'none_now', 'uncertain', 'skipped') then
    raise exception using errcode = '22023', message = 'Invalid body status';
  end if;
  if p_capture_type not in ('practice_preparation', 'standalone') then
    raise exception using errcode = '22023', message = 'Invalid capture type';
  end if;
  if length(coalesce(p_idempotency_key, '')) not between 8 and 120 then
    raise exception using errcode = '22023', message = 'Invalid idempotency key';
  end if;
  if jsonb_typeof(p_observations) is distinct from 'array' or jsonb_array_length(p_observations) > 5 then
    raise exception using errcode = '22023', message = 'Invalid observations';
  end if;

  -- Consent is checked at the trusted write boundary, not just in UI state.
  if not exists (
    select 1 from private.consent_events e
    where e.user_id = v_user_id and e.purpose = 'terms' and e.action = 'granted'
      and not exists (
        select 1 from private.consent_events newer
        where newer.user_id = v_user_id and newer.purpose = e.purpose
          and (newer.occurred_at, newer.created_at, newer.id) > (e.occurred_at, e.created_at, e.id)
      )
  ) or not exists (
    select 1 from private.consent_events e
    where e.user_id = v_user_id and e.purpose = 'privacy' and e.action = 'granted'
      and not exists (
        select 1 from private.consent_events newer
        where newer.user_id = v_user_id and newer.purpose = e.purpose
          and (newer.occurred_at, newer.created_at, newer.id) > (e.occurred_at, e.created_at, e.id)
      )
  ) or not exists (
    select 1 from private.consent_events e
    where e.user_id = v_user_id and e.purpose = 'wellbeing_data' and e.action = 'granted'
      and not exists (
        select 1 from private.consent_events newer
        where newer.user_id = v_user_id and newer.purpose = e.purpose
          and (newer.occurred_at, newer.created_at, newer.id) > (e.occurred_at, e.created_at, e.id)
      )
  ) then
    raise exception using errcode = '42501', message = 'Current consent required before saving check-ins';
  end if;

  select c.* into v_checkin
  from public.checkins c
  where c.user_id = v_user_id and c.idempotency_key = p_idempotency_key;
  if found then
    return query select v_checkin.id, v_checkin.created_at;
    return;
  end if;

  insert into public.checkins (
    user_id, local_date, local_timezone, energy_level, body_status, capture_type, idempotency_key
  ) values (
    v_user_id, p_local_date, p_local_timezone, p_energy_level, p_body_status, p_capture_type, p_idempotency_key
  ) on conflict (user_id, idempotency_key) where idempotency_key is not null do nothing
  returning * into v_checkin;

  if not found then
    select c.* into v_checkin
    from public.checkins c
    where c.user_id = v_user_id and c.idempotency_key = p_idempotency_key;
    return query select v_checkin.id, v_checkin.created_at;
    return;
  end if;

  for v_item in select value from jsonb_array_elements(p_observations) as observations(value) loop
    if jsonb_typeof(v_item) is distinct from 'object' then
      raise exception using errcode = '22023', message = 'Invalid observation object';
    end if;
    v_region := v_item ->> 'region_code';
    v_state := v_item ->> 'state';
    v_level := nullif(v_item ->> 'level', '')::smallint;
    v_note := nullif(btrim(v_item ->> 'note'), '');

    if v_region is null or v_region not in ('neck', 'shoulder_left', 'shoulder_right', 'shoulder_unspecified', 'upper_back', 'lower_back') then
      raise exception using errcode = '22023', message = 'Unsupported observation region';
    end if;
    if v_state is null or v_state not in ('discomfort', 'no_discomfort', 'uncertain', 'skipped') then
      raise exception using errcode = '22023', message = 'Unsupported observation state';
    end if;
    if v_state = 'discomfort' and (v_level is null or v_level not between 1 and 4) then
      raise exception using errcode = '22023', message = 'Discomfort level required';
    end if;
    if v_state <> 'discomfort' and v_level is not null then
      raise exception using errcode = '22023', message = 'Level is not applicable to this observation';
    end if;
    if v_note is not null and length(v_note) > 500 then
      raise exception using errcode = '22023', message = 'Observation note is too long';
    end if;

    insert into public.checkin_observations (
      checkin_id, user_id, region_code, state, level, note
    ) values (
      v_checkin.id, v_user_id, v_region, v_state, v_level, v_note
    );
  end loop;

  return query select v_checkin.id, v_checkin.created_at;
end;
$$;

create or replace function public.delete_my_checkin(p_checkin_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_deleted integer;
begin
  if v_user_id is null then
    raise exception using errcode = '28000', message = 'Authentication required';
  end if;
  if not exists (select 1 from public.checkins c where c.id = p_checkin_id and c.user_id = v_user_id) then
    return false;
  end if;
  -- The existing composite foreign keys use SET NULL on (checkin_id, user_id).
  -- Detach only this user's optional context references before deleting the
  -- check-in so their dialogue and plan records remain intact.
  update public.daily_dialogues d set checkin_id = null
  where d.checkin_id = p_checkin_id and d.user_id = v_user_id;
  update public.practice_plans p set checkin_id = null
  where p.checkin_id = p_checkin_id and p.user_id = v_user_id;
  delete from public.checkins c where c.id = p_checkin_id and c.user_id = v_user_id;
  get diagnostics v_deleted = row_count;
  return v_deleted = 1;
end;
$$;

revoke all on function public.record_my_consent(text, text, text, text, text, text) from public, anon;
revoke all on function public.get_my_consent_state() from public, anon;
revoke all on function public.save_my_checkin(date, text, smallint, text, text, jsonb, text) from public, anon;
revoke all on function public.delete_my_checkin(uuid) from public, anon;
grant execute on function public.record_my_consent(text, text, text, text, text, text) to authenticated;
grant execute on function public.get_my_consent_state() to authenticated;
grant execute on function public.save_my_checkin(date, text, smallint, text, text, jsonb, text) to authenticated;
grant execute on function public.delete_my_checkin(uuid) to authenticated;

comment on function public.save_my_checkin(date, text, smallint, text, text, jsonb, text)
  is 'Atomically saves an owner-scoped check-in only while terms, privacy and wellbeing-data consent are active.';
comment on function public.record_my_consent(text, text, text, text, text, text)
  is 'Appends an owner-scoped consent grant/revoke event to the private ledger.';
