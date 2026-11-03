-- Read-only, service-only snapshot used immediately before and after inference.
-- Identity is verified with Auth getUser in the Edge boundary, never caller JSON.
create function public.mcy_ai_read_admission_state(p_actor_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_enabled boolean;
  v_version integer;
  v_consent boolean;
  v_verified boolean;
begin
  if p_actor_id is null then
    raise exception using errcode = '22023', message = 'Actor is required';
  end if;
  select exists(select 1 from auth.users u where u.id = p_actor_id and u.email_confirmed_at is not null)
    into v_verified;
  select c.enabled and c.model_id <> '', c.version_no into strict v_enabled, v_version
    from private.ai_configurations c where c.singleton = true;
  select pg_catalog.count(*) = 3 into v_consent
    from (
      select distinct on (e.purpose) e.purpose, e.action, e.policy_version
      from private.consent_events e
      where e.user_id = p_actor_id and e.purpose in ('terms', 'privacy', 'ai_processing')
      order by e.purpose, e.occurred_at desc, e.created_at desc, e.id desc
    ) latest
    where latest.action = 'granted' and latest.policy_version = case latest.purpose
      when 'terms' then 'terms-review-0.1'
      when 'privacy' then 'privacy-review-0.1'
      when 'ai_processing' then 'ai-processing-review-1.0'
    end;
  return pg_catalog.jsonb_build_object('enabled', v_enabled and v_verified,
    'version_no', v_version, 'consent_current', v_consent and v_verified);
end
$$;

revoke all on function public.mcy_ai_read_admission_state(uuid) from public, anon, authenticated;
grant execute on function public.mcy_ai_read_admission_state(uuid) to service_role;
comment on function public.mcy_ai_read_admission_state(uuid) is
  'Service-only read of AI switch/version and exact current consent. No provider access, quota reservation, private-schema grants, content publication or data writes.';
