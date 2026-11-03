import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const migration = await readFile(
  new URL("../supabase/migrations/20261003031137_limit_my_consent_events.sql", import.meta.url),
  "utf8",
);
const signature = "public.record_my_consent(text, text, text, text, text, text)";

test("consent writes stay actor-bound, serialized, and retry-safe before the grant cap", () => {
  assert.match(migration, /security definer\s+set search_path\s*=\s*''/i);
  assert.match(migration, /v_user_id\s+uuid\s*:=\s*auth\.uid\(\)/i);
  const lockAt = migration.indexOf("pg_advisory_xact_lock");
  const idempotencyAt = migration.indexOf("e.idempotency_key = p_idempotency_key");
  const latestStateAt = migration.indexOf("select e.action into v_current_action");
  const quotaAt = migration.indexOf("select count(*) into v_recent_grants");
  const insertAt = migration.indexOf("insert into private.consent_events");
  assert.ok(lockAt >= 0 && lockAt < idempotencyAt);
  assert.ok(idempotencyAt < latestStateAt && latestStateAt < quotaAt && quotaAt < insertAt);
  assert.match(migration, /hashtextextended\('mcy\.consent-events:'\s*\|\|\s*v_user_id::text,\s*0\)/i);
  assert.match(migration, /e\.user_id\s*=\s*v_user_id[\s\S]*?e\.idempotency_key\s*=\s*p_idempotency_key/i);
  assert.match(migration, /v_existing_purpose is distinct from p_purpose[\s\S]*?v_existing_action is distinct from p_action/i);
  assert.match(migration, /v_existing_policy_version is distinct from p_policy_version[\s\S]*?v_existing_source is distinct from p_source/i);
  assert.match(migration, /Idempotency key reused with different consent data/i);
});

test("the rolling limit bounds new grants, preserves revocation, and timestamps after lock acquisition", () => {
  assert.match(migration, /p_idempotency_key is null/i);
  assert.match(migration, /p_policy_version is null/i);
  assert.match(migration, /v_now\s*:=\s*pg_catalog\.clock_timestamp\(\)/i);
  assert.match(migration, /e\.action\s*=\s*'granted'[\s\S]*?e\.occurred_at\s*>\s*v_now\s*-\s*interval\s*'24 hours'/i);
  assert.match(migration, /if v_recent_grants\s*>=\s*20 then[\s\S]*?Consent event limit reached/i);
  assert.match(migration, /if p_action\s*=\s*'revoked'[\s\S]*?return null/i);
  assert.match(migration, /idempotency_key, occurred_at[\s\S]*?p_idempotency_key, v_now/i);
  assert.match(migration, /consent_events_user_occurred_idx[\s\S]*?on private\.consent_events\(user_id, occurred_at desc\)/i);
});

test("the replacement retains authenticated-only RPC execution and does not grant direct table access", () => {
  assert.ok(migration.toLowerCase().includes(`revoke all on function ${signature} from public, anon`));
  assert.ok(migration.toLowerCase().includes(`grant execute on function ${signature} to authenticated`));
  assert.doesNotMatch(migration, /grant\s+(?:select|insert|update|delete|all)[\s\S]{0,100}on\s+(?:table\s+)?private\.consent_events/i);
});
