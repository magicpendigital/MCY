-- Bind a check-in write to the learner session that captured its payload and
-- enforce the current version of every consent purpose required for storage.
-- Revoke the old client RPC so stale app builds fail closed after this migration.

revoke all on function public.save_my_checkin_with_current_consent(date, text, smallint, text, text, jsonb, text)
  from public, anon, authenticated;

create or replace function public.save_my_checkin_for_current_user_with_current_consent(
  p_expected_user_id uuid,
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
  if v_user_id is null or p_expected_user_id is distinct from v_user_id then
    raise exception using errcode = '28000', message = 'Authenticated user does not match check-in owner';
  end if;

  for v_required in
    select * from (values
      ('terms', 'terms-review-0.1'),
      ('privacy', 'privacy-review-0.1'),
      ('wellbeing_data', 'wellbeing-data-review-0.1')
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
      raise exception using errcode = '42501', message = 'Current consent required before saving check-ins';
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

comment on function public.save_my_checkin_for_current_user_with_current_consent(uuid, date, text, smallint, text, text, jsonb, text)
  is 'Saves owner-scoped check-ins only for the expected authenticated user and with current terms, privacy, and wellbeing-data consent versions.';
revoke all on function public.save_my_checkin_for_current_user_with_current_consent(uuid, date, text, smallint, text, text, jsonb, text)
  from public, anon, authenticated;
grant execute on function public.save_my_checkin_for_current_user_with_current_consent(uuid, date, text, smallint, text, text, jsonb, text)
  to authenticated;
