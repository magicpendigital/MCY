-- Bound consent-ledger growth without suppressing a learner's revocation.
-- The actor-scoped transaction lock serializes idempotency, state and quota checks.
create index if not exists consent_events_user_occurred_idx
  on private.consent_events(user_id, occurred_at desc);

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
  v_existing_id uuid;
  v_existing_purpose text;
  v_existing_action text;
  v_existing_policy_version text;
  v_existing_source text;
  v_existing_evidence jsonb;
  v_current_action text;
  v_now timestamptz;
  v_recent_grants bigint;
begin
  if v_user_id is null then
    raise exception using errcode = '28000', message = 'Authentication required';
  end if;
  if p_purpose is null or p_purpose not in ('terms', 'privacy', 'wellbeing_data', 'ai_processing', 'teacher_sharing', 'notifications', 'marketing') then
    raise exception using errcode = '22023', message = 'Unsupported consent purpose';
  end if;
  if p_action is null or p_action not in ('granted', 'revoked') then
    raise exception using errcode = '22023', message = 'Unsupported consent action';
  end if;
  if p_source is null or p_source not in ('onboarding', 'settings') then
    raise exception using errcode = '22023', message = 'Unsupported consent source';
  end if;
  if p_channel is null or p_channel not in ('web', 'ios', 'android') then
    raise exception using errcode = '22023', message = 'Unsupported client channel';
  end if;
  if p_policy_version is null or length(p_policy_version) not between 1 and 80
    or p_idempotency_key is null or length(p_idempotency_key) not between 8 and 120 then
    raise exception using errcode = '22023', message = 'Invalid consent event metadata';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('mcy.consent-events:' || v_user_id::text, 0)
  );

  -- A reused key returns the original ID only for the exact same event payload.
  select e.id, e.purpose, e.action, e.policy_version, e.source, e.evidence
  into v_existing_id, v_existing_purpose, v_existing_action,
       v_existing_policy_version, v_existing_source, v_existing_evidence
  from private.consent_events e
  where e.user_id = v_user_id and e.idempotency_key = p_idempotency_key;
  if found then
    if v_existing_purpose is distinct from p_purpose
      or v_existing_action is distinct from p_action
      or v_existing_policy_version is distinct from p_policy_version
      or v_existing_source is distinct from p_source
      or v_existing_evidence is distinct from pg_catalog.jsonb_build_object('channel', p_channel) then
      raise exception using errcode = '22023', message = 'Idempotency key reused with different consent data';
    end if;
    return v_existing_id;
  end if;

  -- Capture wall-clock time after a possible lock wait so event ordering follows
  -- the serialized write order, not transaction start time.
  v_now := pg_catalog.clock_timestamp();

  select e.action into v_current_action
  from private.consent_events e
  where e.user_id = v_user_id and e.purpose = p_purpose
  order by e.occurred_at desc, e.created_at desc, e.id desc
  limit 1;

  if p_action = 'revoked' and v_current_action is distinct from 'granted' then
    return null;
  end if;

  if p_action = 'granted' then
    select count(*) into v_recent_grants
    from private.consent_events e
    where e.user_id = v_user_id
      and e.action = 'granted'
      and e.occurred_at > v_now - interval '24 hours';
    if v_recent_grants >= 20 then
      raise exception using errcode = '54000', message = 'Consent event limit reached';
    end if;
  end if;

  insert into private.consent_events (
    user_id, purpose, action, policy_version, source, evidence,
    idempotency_key, occurred_at
  ) values (
    v_user_id, p_purpose, p_action, p_policy_version, p_source,
    jsonb_build_object('channel', p_channel), p_idempotency_key, v_now
  ) returning id into v_id;

  return v_id;
end;
$$;

revoke all on function public.record_my_consent(text, text, text, text, text, text) from public, anon;
grant execute on function public.record_my_consent(text, text, text, text, text, text) to authenticated;

comment on function public.record_my_consent(text, text, text, text, text, text)
  is 'Appends actor-bound consent evidence; binds idempotency keys to payloads, serializes writes, caps new grants at 20 per rolling 24 hours, and allows valid revocations.';
