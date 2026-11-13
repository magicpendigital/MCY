// Rebuild only the unapplied check-in candidate; never execute SQL remotely.
import { readFileSync, writeFileSync } from 'node:fs';
const path = 'supabase/migrations/20261002120000_bind_checkin_writes_to_current_actor_and_consent.sql';
let wrapper = readFileSync(path, 'utf8').split('-- Shared consent/check-in serialization')[0].trimEnd();
const isolation = `  if pg_catalog.current_setting('transaction_isolation') <> 'read committed' then
    raise exception using errcode = '0A000', message = 'Learner writes require READ COMMITTED isolation';
  end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('mcy.consent-events:' || v_user_id::text, 0));
`;
if (!wrapper.includes('mcy.consent-events:')) wrapper = wrapper.replace('  for v_required in', isolation + '\n  for v_required in');
const historical = readFileSync('supabase/migrations/20260926064515_learner_app_backend.sql', 'utf8');
let consent = historical.slice(historical.indexOf('create or replace function public.record_my_consent('), historical.indexOf('create or replace function public.get_my_consent_state()')).trim();
consent = consent.replace('  v_current_action text;', '  v_current_action text;\n  v_existing private.consent_events%rowtype;\n  v_now timestamptz;');
for (const field of ['p_purpose','p_action','p_source','p_channel']) consent = consent.replace(`if ${field} not in`, `if ${field} is null or ${field} not in`);
consent = consent.replace('if length(p_policy_version)', 'if p_policy_version is null or p_idempotency_key is null or length(p_policy_version)');
consent = consent.replace('  select e.action into v_current_action', isolation + `
  select e.* into v_existing from private.consent_events e
  where e.user_id = v_user_id and e.idempotency_key = p_idempotency_key;
  if found then
    if v_existing.purpose is distinct from p_purpose or v_existing.action is distinct from p_action
      or v_existing.policy_version is distinct from p_policy_version or v_existing.source is distinct from p_source
      or v_existing.evidence is distinct from pg_catalog.jsonb_build_object('channel', p_channel) then
      raise exception using errcode = '22023', message = 'Idempotency key reused with different consent data';
    end if;
    return v_existing.id;
  end if;
  v_now := pg_catalog.clock_timestamp();
  select e.action into v_current_action`);
consent = consent.replace('source, evidence, idempotency_key\n', 'source, evidence, idempotency_key, occurred_at\n');
consent = consent.replace("jsonb_build_object('channel', p_channel), p_idempotency_key", "jsonb_build_object('channel', p_channel), p_idempotency_key, v_now");
const expanded = readFileSync('supabase/migrations/20260928063009_expand_body_region_checkin_support.sql', 'utf8');
let helper = expanded.slice(expanded.indexOf('create or replace function private.save_my_checkin_expanded('), expanded.indexOf('comment on function private.save_my_checkin_expanded(')).trim();
helper = helper.replace("  if length(coalesce(p_local_timezone", isolation + "  if length(coalesce(p_local_timezone");
helper = helper.replace('  if found then\n    return query select v_checkin.id', `  if found then
    if v_checkin.local_date is distinct from p_local_date or v_checkin.local_timezone is distinct from p_local_timezone
      or v_checkin.energy_level is distinct from p_energy_level or v_checkin.body_status is distinct from p_body_status
      or v_checkin.capture_type is distinct from p_capture_type
      or (select coalesce(jsonb_agg(jsonb_build_object('region_code',o.region_code,'state',o.state,'level',o.level,'note',o.note) order by o.region_code),'[]'::jsonb)
          from public.checkin_observations o where o.checkin_id=v_checkin.id and o.user_id=v_user_id)
        is distinct from (select coalesce(jsonb_agg(jsonb_build_object('region_code',o->>'region_code','state',o->>'state',
          'level',nullif(o->>'level','')::smallint,'note',nullif(btrim(o->>'note'),'')) order by o->>'region_code'),'[]'::jsonb)
          from jsonb_array_elements(p_observations) o) then
      raise exception using errcode = '22023', message = 'Idempotency key reused with different check-in data';
    end if;
    return query select v_checkin.id`);
const acl = `
revoke all on function private.save_my_checkin_expanded(date,text,smallint,text,text,jsonb,text) from public,anon,authenticated;
revoke all on function public.record_my_consent(text,text,text,text,text,text) from public,anon;
grant execute on function public.record_my_consent(text,text,text,text,text,text) to authenticated;
`;
writeFileSync(path, wrapper + '\n\n-- Shared consent/check-in serialization: local candidate, no quota migration.\n' + consent + '\n\n' + helper + '\n' + acl);
console.log('PREPARED local check-in candidate: actor lock, fresh consent, exact retry payload; no cloud mutation');
