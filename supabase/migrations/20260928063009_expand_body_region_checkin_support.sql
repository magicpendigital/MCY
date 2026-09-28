-- Expand the learner's current-moment body map without changing the existing
-- observation table shape or rewriting stored records. New side detail stays
-- in stable region_code values (for example, elbow_left / elbow_right).

alter table public.profiles
  alter column body_display_preference set default 'feminine';

alter table public.checkin_observations
  drop constraint if exists checkin_observations_region_code_check,
  add constraint checkin_observations_region_code_check check (region_code in (
    'neck',
    'shoulder_left', 'shoulder_right', 'shoulder_unspecified',
    'upper_arm_left', 'upper_arm_right', 'upper_arm_unspecified',
    'elbow_left', 'elbow_right', 'elbow_unspecified',
    'forearm_wrist_left', 'forearm_wrist_right', 'forearm_wrist_unspecified',
    'hand_left', 'hand_right', 'hand_unspecified',
    'upper_back', 'lower_back',
    'knee_left', 'knee_right', 'knee_unspecified',
    'foot_left', 'foot_right', 'foot_unspecified'
  ));

alter table public.reflection_observations
  drop constraint if exists reflection_observations_region_code_check,
  add constraint reflection_observations_region_code_check check (region_code in (
    'neck',
    'shoulder_left', 'shoulder_right', 'shoulder_unspecified',
    'upper_arm_left', 'upper_arm_right', 'upper_arm_unspecified',
    'elbow_left', 'elbow_right', 'elbow_unspecified',
    'forearm_wrist_left', 'forearm_wrist_right', 'forearm_wrist_unspecified',
    'hand_left', 'hand_right', 'hand_unspecified',
    'upper_back', 'lower_back',
    'knee_left', 'knee_right', 'knee_unspecified',
    'foot_left', 'foot_right', 'foot_unspecified'
  ));

create or replace function private.save_my_checkin_expanded(
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
as $function$
declare
  v_user_id uuid := auth.uid();
  v_checkin public.checkins%rowtype;
  v_item jsonb;
  v_region text;
  v_region_key text;
  v_region_side text;
  v_seen jsonb := '[]'::jsonb;
  v_state text;
  v_level smallint;
  v_note text;
  v_purpose text;
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
  if jsonb_typeof(p_observations) is distinct from 'array'
    or jsonb_array_length(p_observations) > 20 then
    raise exception using errcode = '22023', message = 'Invalid observations';
  end if;

  -- This inner write boundary requires all three learner-data purposes. The
  -- exposed wrapper below additionally checks the current terms/privacy versions.
  foreach v_purpose in array ARRAY['terms', 'privacy', 'wellbeing_data']
  loop
    if not exists (
      select 1 from private.consent_events e
      where e.user_id = v_user_id and e.purpose = v_purpose and e.action = 'granted'
        and not exists (
          select 1 from private.consent_events newer
          where newer.user_id = v_user_id and newer.purpose = e.purpose
            and (newer.occurred_at, newer.created_at, newer.id) > (e.occurred_at, e.created_at, e.id)
        )
    ) then
      raise exception using errcode = '42501', message = 'Current consent required before saving check-ins';
    end if;
  end loop;

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

  for v_item in select value from jsonb_array_elements(p_observations) as observations(value)
  loop
    if jsonb_typeof(v_item) is distinct from 'object' then
      raise exception using errcode = '22023', message = 'Invalid observation object';
    end if;
    v_region := v_item ->> 'region_code';
    v_state := v_item ->> 'state';
    v_level := nullif(v_item ->> 'level', '')::smallint;
    v_note := nullif(btrim(v_item ->> 'note'), '');

    if v_region is null or v_region not in (
      'neck',
      'shoulder_left', 'shoulder_right', 'shoulder_unspecified',
      'upper_arm_left', 'upper_arm_right', 'upper_arm_unspecified',
      'elbow_left', 'elbow_right', 'elbow_unspecified',
      'forearm_wrist_left', 'forearm_wrist_right', 'forearm_wrist_unspecified',
      'hand_left', 'hand_right', 'hand_unspecified',
      'upper_back', 'lower_back',
      'knee_left', 'knee_right', 'knee_unspecified',
      'foot_left', 'foot_right', 'foot_unspecified'
    ) then
      raise exception using errcode = '22023', message = 'Unsupported observation region';
    end if;
    v_region_key := regexp_replace(v_region, '_(left|right|unspecified)$', '');
    v_region_side := case
      when right(v_region, 5) = '_left' then 'left'
      when right(v_region, 6) = '_right' then 'right'
      else 'unspecified'
    end;
    if exists (
      select 1
      from jsonb_array_elements(v_seen) as prior(value)
      where prior.value ->> 'region' = v_region_key
        and (
          prior.value ->> 'side' = v_region_side
          or prior.value ->> 'side' = 'unspecified'
          or v_region_side = 'unspecified'
        )
    ) then
      raise exception using errcode = '22023', message = 'Duplicate observation region side';
    end if;
    v_seen := v_seen || jsonb_build_array(jsonb_build_object('region', v_region_key, 'side', v_region_side));

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
$function$;

comment on function private.save_my_checkin_expanded(date, text, smallint, text, text, jsonb, text)
  is 'Private owner-scoped check-in writer for the expanded self-reported body-region taxonomy.';
revoke all on function private.save_my_checkin_expanded(date, text, smallint, text, text, jsonb, text)
  from public, anon, authenticated;

create or replace function public.save_my_checkin_with_current_consent(
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
as $function$
declare
  v_user_id uuid := auth.uid();
  v_required record;
begin
  if v_user_id is null then
    raise exception using errcode = '28000', message = 'Authentication required';
  end if;

  for v_required in
    select * from (values
      ('terms', 'terms-review-0.1'),
      ('privacy', 'privacy-review-0.1')
    ) as required(purpose, policy_version)
  loop
    if not exists (
      select 1
      from private.consent_events e
      where e.user_id = v_user_id
        and e.purpose = v_required.purpose
        and e.action = 'granted'
        and e.policy_version = v_required.policy_version
        and not exists (
          select 1
          from private.consent_events newer
          where newer.user_id = e.user_id
            and newer.purpose = e.purpose
            and (newer.occurred_at, newer.created_at, newer.id) > (e.occurred_at, e.created_at, e.id)
        )
    ) then
      raise exception using errcode = '42501', message = 'Current terms and privacy consent required';
    end if;
  end loop;

  return query
    select saved.checkin_id, saved.created_at
    from private.save_my_checkin_expanded(
      p_local_date, p_local_timezone, p_energy_level, p_body_status,
      p_capture_type, p_observations, p_idempotency_key
    ) saved;
end;
$function$;

comment on function public.save_my_checkin_with_current_consent(date, text, smallint, text, text, jsonb, text)
  is 'Saves owner-scoped check-ins with current consent; validates up to 20 observations against the current body-region taxonomy.';
revoke all on function public.save_my_checkin_with_current_consent(date, text, smallint, text, text, jsonb, text)
  from public, anon;
grant execute on function public.save_my_checkin_with_current_consent(date, text, smallint, text, text, jsonb, text)
  to authenticated;
