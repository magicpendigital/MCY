import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
const observer = 'scripts/observe-native-late-save-20261014.mjs';
const mp = 'analyse/MCY_NATIVE_LATE_SAVE_OPERATION_2026-10-14.json';
const ap = 'analyse/MCY_NATIVE_LATE_SAVE_APPROVAL_2026-10-14.json';
const ip = '.vercel/mcy-native-late-save-20261014.intent.json';
const review = 'analyse/MCY_NATIVE_INTEGRATION_R3_2026-10-14.md';
const sha = b => createHash('sha256').update(b).digest('hex');
const source = fs.readFileSync(observer, 'utf8').split('\n').filter(x => !x.startsWith('import ')).join('\n')
  .replaceAll('import.meta.url', JSON.stringify(new URL('../../' + observer, import.meta.url).href));
const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
async function probe(kind, phase = 'before-checkin') {
  const manifest = { releaseId: 'mcy-native-late-save-20261014', target: { kind: 'staging', projectRef: 'mhumbczqrzutdnraafhs', organizationId: 'rzbpjfrndhrtxagpgdre' },
    inputs: [], frozenApplicationSource: [], permissions: { independentReviewRequired: review },
    device: { package: 'com.nilaza.motchutyoga.mcydebug', serial: 'Q88549EEXCUOONGA', apkSha256: '4b6620d6ae63fde5e7525f4a7beb318a01b4ad99859b68b7cd336b2c7a2a413e' },
    actors: [{ label: 'LEARNER_A', identitySha256: '995e6d265987a1c5cd6c831d6b2dda54998092aa769082cc72bf93fa209ece68' }] };
  if (kind === 'manifest-contract') Object.assign(manifest, JSON.parse(fs.readFileSync(mp, 'utf8')));
  const bytes = JSON.stringify(manifest);
  const approval = { decision: 'APPROVED', releaseId: manifest.releaseId, manifestSha256: sha(bytes), target: manifest.target, reviewSha256: sha(fs.readFileSync(review)) };
  if (kind === 'old-approval') approval.releaseId = 'mcy-native-learner-trial-20261013';
  if (kind === 'pending') approval.decision = 'PREPARED';
  const ab = JSON.stringify(approval);
  const intent = { kind: 'ManualNativeLateSaveExclusiveIntent', manifestSha256: sha(bytes), approvalSha256: sha(ab), nonce: '10000000-0000-4000-8000-000000000014', phase: 'A_ACTIVE', executionStatus: 'ACTIVE' };
  if (kind === 'old-intent') intent.kind = 'ManualNativeLearnerTrialExclusiveIntent';
  if (kind === 'closed') intent.executionStatus = 'TERMINATED';
  if (kind === 'halted') intent.executionStatus = 'HALTED';
  const fakeFiles = new Map([[mp, bytes], [ap, ab], [ip, JSON.stringify(intent)]]);
  let deviceCalls = 0, receiptWrites = 0, error = null;
  const mockFs = { ...fs,
    existsSync: p => p === ap ? kind !== 'no-approval' : fakeFiles.has(p) || fs.existsSync(p),
    readFileSync: (p, encoding) => fakeFiles.has(p) ? encoding ? fakeFiles.get(p) : Buffer.from(fakeFiles.get(p)) : fs.readFileSync(p, encoding),
    writeFileSync: () => { receiptWrites++; },
  };
  const proc = { argv: ['node', observer, 'LEARNER_A', phase], exitCode: 0 };
  try { await new AsyncFunction('fs', 'path', 'execFileSync', 'createHash', 'assert', 'process', 'WebSocket', 'console', source)(
    mockFs, path, () => { deviceCalls++; throw Error('OFFLINE_DEVICE_SENTINEL'); }, createHash, assert, proc,
    class { constructor() { throw Error('Unexpected WebSocket'); } }, { log() {} });
  } catch (e) { error = e; }
  return { deviceCalls, receiptWrites, error, exitCode: proc.exitCode };
}
for (const kind of ['no-approval', 'old-approval', 'pending', 'old-intent', 'closed', 'halted']) test(`${kind} blocks normal observation before any device/Auth command`, async () => {
  const r = await probe(kind); assert(r.error); assert.equal(r.deviceCalls, 0); assert.equal(r.receiptWrites, 0);
});
test('HALTED permits only final revoke read; device sentinel prevents any real execution', async () => {
  const r = await probe('halted', 'after-revoke'); assert.equal(r.error, null); assert.equal(r.deviceCalls, 1); assert.equal(r.receiptWrites, 1); assert.equal(r.exitCode, 1);
});
test('actual prepared manifest matches observer consumer schema before mocked device dispatch', async () => {
  const r = await probe('manifest-contract'); assert.equal(r.error, null); assert.equal(r.deviceCalls, 1); assert.equal(r.receiptWrites, 1); assert.equal(r.exitCode, 1);
});
