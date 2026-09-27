-- Keep required consent current without interrupting every authenticated session.
-- The identifiers match the review text already recorded in mcy-staging; they
-- must be bumped when the corresponding reviewed copy changes.

create or replace function public.get_my_consent_policy_versions()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  with purposes(purpose) as (
    values ('terms'), ('privacy'), ('wellbeing_data'), ('ai_processing'),
           ('teacher_sharing'), ('notifications'), ('marketing')
  )
  select coalesce(jsonb_object_agg(p.purpose, latest.policy_version), '{}'::jsonb)
  from purposes p
  left join lateral (
    select e.policy_version
    from private.consent_events e
    where e.user_id = auth.uid() and e.purpose = p.purpose
    order by e.occurred_at desc, e.created_at desc, e.id desc
    limit 1
  ) latest on true
  where auth.uid() is not null;
$$;

comment on function public.get_my_consent_policy_versions()
  is 'Returns only the authenticated user latest consent policy version per purpose.';

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
as $$
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
    from public.save_my_checkin(
      p_local_date,
      p_local_timezone,
      p_energy_level,
      p_body_status,
      p_capture_type,
      p_observations,
      p_idempotency_key
    ) saved;
end;
$$;

comment on function public.save_my_checkin_with_current_consent(date, text, smallint, text, text, jsonb, text)
  is 'Saves an owner-scoped check-in only after current terms/privacy consent; existing RPC also requires wellbeing-data consent.';

revoke all on function public.get_my_consent_policy_versions() from public, anon;
grant execute on function public.get_my_consent_policy_versions() to authenticated;

revoke all on function public.save_my_checkin_with_current_consent(date, text, smallint, text, text, jsonb, text) from public, anon;
grant execute on function public.save_my_checkin_with_current_consent(date, text, smallint, text, text, jsonb, text) to authenticated;

-- Clients must use the version-checking wrapper; the wrapped implementation is
-- callable only by this SECURITY DEFINER boundary after its owner/consent checks.
revoke all on function public.save_my_checkin(date, text, smallint, text, text, jsonb, text) from public, anon, authenticated;
