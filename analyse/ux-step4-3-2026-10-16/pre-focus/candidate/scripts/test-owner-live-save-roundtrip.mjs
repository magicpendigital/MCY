// MUTATING staging test: requires explicit human approval for one identical AI-off
// save (one new version/audit). This script never retries an uncertain write.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { writeFileSync } from 'node:fs';

const origin = 'https://mhumbczqrzutdnraafhs.supabase.co';
const expected = Number(process.argv[2]);
const receipt = {
  schemaVersion: 1, kind: 'StagingOwnerAiOffSaveRoundtrip',
  executedAt: new Date().toISOString(), status: 'FAIL', exitCode: 1,
  target: 'mhumbczqrzutdnraafhs', expectedVersion: expected,
  configValuesPrinted: false, aiInferenceRequested: false, automaticRetry: false,
  successfulSaveAttempted: false, checks: [],
};

try {
  assert.ok(Number.isSafeInteger(expected) && expected >= 1, 'Explicit expected version required');
  // The operator supplies this only after independent fresh RPC readback, as in
  // the negative matrix. Never infer it from local SQL or from a successful save.
  assert.equal(process.env.MCY_TEST_OWNER_CONFLICT_SQLSTATE, 'PT409');
  assert.equal(process.env.VITE_SUPABASE_URL?.replace(/\/$/, ''), origin);
  assert.ok(process.env.VITE_SUPABASE_PUBLISHABLE_KEY?.startsWith('sb_publishable_'));
  assert.ok(process.env.MCY_TEST_OWNER_ACCESS_TOKEN);
  const headers = {
    apikey: process.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    authorization: 'Bearer ' + process.env.MCY_TEST_OWNER_ACCESS_TOKEN,
    'content-type': 'application/json', 'cache-control': 'no-store',
  };
  async function request(path, body) {
    const response = await fetch(origin + path, {
      method: body ? 'POST' : 'GET', headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(10000), redirect: 'error',
    });
    return { status: response.status, body: await response.json() };
  }
  const identity = await request('/auth/v1/user');
  assert.equal(identity.status, 200);
  assert.equal(createHash('sha256').update(identity.body.id).digest('hex'),
    'de189456578ac66bc3fd5ec0e95d366b93b5365123fe6e0c3422abd3e421d43d');
  const path = '/functions/v1/owner-control-plane';
  const before = await request(path, { action: 'read_ai' });
  assert.equal(before.status, 200);
  assert.equal(before.body.environment, 'staging');
  assert.equal(before.body.enableGateOpen, false);
  assert.equal(before.body.spendControlApproved, false);
  assert.equal(before.body.config.enabled, false);
  assert.equal(before.body.config.version_no, expected);
  const fields = ['enabled', 'model_id', 'system_prompt', 'temperature',
    'max_output_tokens', 'per_user_daily_limit', 'global_daily_limit'];
  const config = Object.fromEntries([...fields, 'version_no'].map(key => [key, before.body.config[key]]));
  receipt.successfulSaveAttempted = true;
  const saved = await request(path, { action: 'save_ai', config });
  assert.equal(saved.status, 200);
  assert.equal(saved.body.config.version_no, expected + 1);
  for (const key of fields) assert.deepEqual(saved.body.config[key], config[key]);
  receipt.checks.push('PASS Owner identical AI-off save HTTP 200; exactly one version increment, business values preserved');
  const stale = await request(path, { action: 'save_ai', config });
  assert.equal(stale.status, 409);
  assert.equal(stale.body.error, 'configuration_conflict');
  receipt.checks.push('PASS previous-version save HTTP 409 without retry');
  const after = await request(path, { action: 'read_ai' });
  assert.equal(after.status, 200);
  assert.equal(after.body.config.version_no, expected + 1);
  assert.equal(after.body.enableGateOpen, false);
  assert.equal(after.body.spendControlApproved, false);
  for (const key of fields) assert.deepEqual(after.body.config[key], config[key]);
  receipt.checks.push('PASS readback preserves all business fields and closed inference gates');
  receipt.status = 'PASS'; receipt.exitCode = 0;
  console.log(receipt.checks.join('\n'));
} catch {
  console.error('FAIL bounded Owner roundtrip; do not retry a save. Read back outcome first; sensitive details omitted.');
}
writeFileSync('analyse/MCY_OWNER_LIVE_SAVE_2026-10-09.json', JSON.stringify(receipt, null, 2) + '\n');
process.exitCode = receipt.exitCode;
