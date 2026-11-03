import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import test from "node:test";

const directory = new URL("../supabase/migrations/", import.meta.url);
const name = "20261007174155_fix_owner_config_conflict_sqlstate.sql";
const migration = await readFile(new URL(name, directory), "utf8");

test("Owner forward repair binds only the reviewed RPC and its exact before/after definitions", () => {
  assert.match(migration, /public\.mcy_ai_save_owner_config\(uuid,integer,boolean,text,text,numeric,integer,integer,integer\)/);
  assert.match(migration, /1591e77afdfc0dacb6b39200d7bbefc2/);
  assert.match(migration, /5ad67fe52caf79bd07c51caa0c30db92/);
  assert.match(migration, /v_fingerprint not in/);
  assert.match(migration, /pg_catalog\.replace\(v_definition, 'errcode = ''40001''', 'errcode = ''PT409'''/);
  assert.equal((migration.match(/execute v_definition;/g) ?? []).length, 1);
  assert.match(migration, /pg_catalog\.to_jsonb\(v_after\) is distinct from pg_catalog\.to_jsonb\(v_before\)/);
});

test("Owner repair is atomic, repeat-safe and cannot widen grants or modify application data", () => {
  const executable = migration.replace(/--[^\n]*/g, "");
  assert.equal((executable.match(/do \$repair\$/g) ?? []).length, 1);
  assert.match(executable, /if v_fingerprint = '1591e77afdfc0dacb6b39200d7bbefc2' then/);
  assert.match(executable, /v_before\.proacl::text is distinct from '\{postgres=X\/postgres,service_role=X\/postgres\}'/);
  for (const role of ["anon", "authenticated", "service_role"]) {
    assert.ok(executable.includes(`pg_catalog.has_schema_privilege('${role}', 'private', 'USAGE')`));
  }
  assert.doesNotMatch(executable, /\b(?:grant|revoke|drop|truncate|insert|update|delete|create\s+table|alter\s+table)\b/i);
  assert.doesNotMatch(executable, /(?:errcode\s*=|raise\s+sqlstate)\s*'40001'/i);
});

test("applied Owner migrations remain byte-identical historical evidence", async () => {
  for (const [file, hash] of [
    ["20260929173001_ai_owner_controls.sql", "b3758861e2f501940427fa9de0ffb9ddbdd8479cf082723f754131592857d1fc"],
    ["20260930160616_allow_unset_model_for_disabled_ai.sql", "f04f5003c646aa8d25a43834948fe3068c4fc58a2558ad519441ffcbb7830d61"],
  ]) {
    assert.equal(createHash("sha256").update(await readFile(new URL(file, directory))).digest("hex"), hash);
  }
});

test("pending migrations cannot introduce intentional retryable business exceptions", async () => {
  for (const file of await readdir(directory)) {
    if (!file.endsWith(".sql") || file.slice(0, 14) <= "20261001043554") continue;
    const sql = (await readFile(new URL(file, directory), "utf8")).replace(/--[^\n]*/g, "");
    assert.doesNotMatch(sql, /(?:errcode\s*=|raise\s+sqlstate)\s*'40001'/i, file);
  }
});
