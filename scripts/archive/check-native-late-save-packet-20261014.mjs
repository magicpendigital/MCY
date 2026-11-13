// Local evidence verifier only; cannot install, deploy, authenticate or write data.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
const root = path.resolve('D:/Projects/MCY');
assert.equal(process.cwd().toLowerCase(), root.toLowerCase());
const sha = b => createHash('sha256').update(b).digest('hex');
function hash(p) {
  assert(typeof p === 'string' && !path.isAbsolute(p) && !p.split(/[\\/]/).includes('..'));
  assert(!/(^|[\\/])\.env(?:[./\\]|$)/.test(p));
  const absolute = fs.realpathSync(path.resolve(root, p));
  assert(absolute.toLowerCase().startsWith(root.toLowerCase() + path.sep));
  return sha(fs.readFileSync(absolute));
}
const mp = 'analyse/MCY_NATIVE_LATE_SAVE_OPERATION_2026-10-14.json';
const m = JSON.parse(fs.readFileSync(mp, 'utf8'));
assert.equal(m.releaseId, 'mcy-native-late-save-20261014');
assert.equal(m.status, 'PREPARED_AWAITING_OWNER_DECISION_WEB_GATE_BLOCKED');
assert.equal(m.target.projectRef, 'mhumbczqrzutdnraafhs');
assert.equal(m.target.organizationId, 'rzbpjfrndhrtxagpgdre'); assert.equal(m.target.kind, 'staging');
assert.deepEqual(m.maxEffects, { newProfiles: 0, profileUpsertRequests: 0, authLocaleMetadataUpdates: 0, consentEvents: 4, checkins: 2, newObservations: 0 });
assert.equal(m.web.releaseGate.status, 'BLOCKED_PROTECTION_NOT_VERIFIED');
assert.equal(m.permissions.releaseAuthorized, false);
assert.deepEqual(m.device, { model: m.native.model, serial: m.native.serial, package: m.native.package, apkSha256: m.native.apkSha256 });
for (const r of [...m.inputs, ...m.frozenApplicationSource]) assert.equal(hash(r.path), r.sha256, r.path);
assert.equal(hash(m.native.apkPath), m.native.apkSha256);
const a = JSON.parse(fs.readFileSync(m.native.artifactReceiptPath, 'utf8').replace(/^\uFEFF/, ''));
assert.equal(a.applicationId, m.native.package); assert.equal(a.apkSha256, m.native.apkSha256);
for (const r of a.assets) assert.equal(hash(path.join(a.extractedPublicPath, r.path)), r.sha256);
const w = JSON.parse(fs.readFileSync(m.web.artifactReceiptPath, 'utf8'));
assert.equal(sha(JSON.stringify(w.files)), m.web.artifactSha256);
for (const r of w.files) assert.equal(hash(path.join(w.root, '.vercel/output', r.path)), r.sha256);
const closed = JSON.parse(fs.readFileSync('analyse/MCY_NATIVE_FROZEN_SOURCE_ARCHIVE_2026-10-14.json', 'utf8'));
for (const r of closed.records) assert.equal(hash(r.archivePath), r.sha256);
assert.equal(hash(closed.oldApkPath), closed.oldApkSha256);
const b = JSON.parse(fs.readFileSync(m.baseline.path, 'utf8')).receipt;
for (const [i, expected] of [[0, [10, 2, 1]], [1, [6, 3, 0]]]) {
  const actor = b.actors[i]; assert.deepEqual([actor.consentCount, actor.checkinCount, actor.observationCount], expected);
  assert.equal(actor.hasProfile, true); assert.equal(actor.activeStaffRoles, 0); assert.equal(actor.activeTeacherProfile, false);
  assert.equal(actor.latestConsent.find(x => x.purpose === 'wellbeing_data').action, 'revoked');
  assert.equal(actor.newConsentRows.length, 0); assert.equal(actor.newCheckinRows.length, 0);
}
assert.equal(b.ai.enabled, false); assert.equal(b.ai.version, 1); assert.equal(b.ledgerApplied, 21);
console.log(JSON.stringify({ status: 'PASS_LOCAL_NATIVE_PACKET_EVIDENCE', manifestSha256: hash(mp),
  releaseAuthorized: false, ownerDecision: 'PENDING', nativePhysicalAcceptance: 'CHUA_CHAY',
  webRelease: 'BLOCKED_PROTECTION_NOT_VERIFIED', cloudOrDeviceActions: 0 }));
