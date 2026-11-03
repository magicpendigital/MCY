import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const migration = await readFile(
  new URL("../supabase/migrations/20261002120000_bind_checkin_writes_to_current_actor_and_consent.sql", import.meta.url),
  "utf8",
);
const learnerData = await readFile(new URL("../src/backend/learnerData.ts", import.meta.url), "utf8");
const databaseTypes = await readFile(new URL("../src/backend/database.types.ts", import.meta.url), "utf8");

test("check-in writer binds the payload to the authenticated learner", () => {
  assert.match(migration, /p_expected_user_id\s+uuid/i);
  assert.match(migration, /p_expected_user_id\s+is\s+distinct\s+from\s+v_user_id/i);
  assert.match(migration, /revoke all on function public\.save_my_checkin_with_current_consent[\s\S]*?from public, anon, authenticated/i);
});

test("check-in writer requires current versions of all three data purposes", () => {
  assert.match(migration, /\('terms',\s*'terms-review-0\.1'\)/);
  assert.match(migration, /\('privacy',\s*'privacy-review-0\.1'\)/);
  assert.match(migration, /\('wellbeing_data',\s*'wellbeing-data-review-0\.1'\)/);
  assert.match(migration, /e\.policy_version\s*=\s*v_required\.policy_version/i);
  assert.match(migration, /grant execute on function public\.save_my_checkin_for_current_user_with_current_consent[\s\S]*?to authenticated/i);
});

test("client RPC arguments, generated types, and SQL signature stay aligned", () => {
  const clientCall = learnerData.match(/client\.rpc\("save_my_checkin_for_current_user_with_current_consent",\s*\{([\s\S]*?)\}\)/)?.[1];
  assert.ok(clientCall, "learner check-in client RPC call is present");
  const sqlArguments = migration.match(/create or replace function public\.save_my_checkin_for_current_user_with_current_consent\(([\s\S]*?)\)\s*returns/i)?.[1];
  const typedArguments = databaseTypes.match(/save_my_checkin_for_current_user_with_current_consent:[\s\S]*?Args:\s*\{([\s\S]*?)\n\s*\}/)?.[1];
  assert.ok(sqlArguments, "new SQL RPC signature is present");
  assert.ok(typedArguments, "generated database RPC arguments are present");
  const expectedArguments = {
    p_expected_user_id: { sql: "uuid", ts: "string" },
    p_local_date: { sql: "date", ts: "string" },
    p_local_timezone: { sql: "text", ts: "string" },
    p_energy_level: { sql: "smallint", ts: "number | null" },
    p_body_status: { sql: "text", ts: "string | null" },
    p_capture_type: { sql: "text", ts: "string" },
    p_idempotency_key: { sql: "text", ts: "string" },
    p_observations: { sql: "jsonb", ts: "Json" },
  };
  const clientNames = [...clientCall.matchAll(/\b(p_[a-z_]+)\s*:/g)].map((match) => match[1]).sort();
  const sqlNames = [...sqlArguments.matchAll(/^\s*(p_[a-z_]+)\s+\w+/gm)].map((match) => match[1]).sort();
  const typedNames = [...typedArguments.matchAll(/^\s*(p_[a-z_]+):/gm)].map((match) => match[1]).sort();
  assert.deepEqual(clientNames, Object.keys(expectedArguments).sort());
  assert.deepEqual(sqlNames, Object.keys(expectedArguments).sort());
  assert.deepEqual(typedNames, Object.keys(expectedArguments).sort());
  for (const [argument, types] of Object.entries(expectedArguments)) {
    assert.match(sqlArguments, new RegExp(`\\b${argument}\\s+${types.sql}\\b`, "i"));
    assert.ok(typedArguments.includes(`${argument}: ${types.ts};`), `generated TypeScript type for ${argument} matches`);
  }
  assert.match(learnerData, /region_code:\s*regionCode/);
});

test("privileged RPC pins name resolution and limits execution to authenticated clients", () => {
  assert.match(migration, /language plpgsql\s+security definer\s+set search_path\s*=\s*''/i);
  assert.match(migration, /auth\.uid\(\)/);
  assert.match(migration, /from private\.consent_events/i);
  assert.match(migration, /from private\.save_my_checkin_expanded\(/i);
  assert.match(migration, /revoke all on function public\.save_my_checkin_for_current_user_with_current_consent[\s\S]*?from public, anon, authenticated/i);
  assert.match(migration, /grant execute on function public\.save_my_checkin_for_current_user_with_current_consent[\s\S]*?to authenticated/i);
});
