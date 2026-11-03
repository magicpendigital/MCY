import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';

const root = path.resolve(import.meta.dirname, '../..');
const dir = import.meta.dirname;
const rel = 'analyse/ux-step4-7-2026-10-18/';
const read = name => JSON.parse(fs.readFileSync(path.join(dir, name)));
const sha = file => createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const exact = (file, hash) => assert.equal(sha(path.join(root, file)), hash, file);
const manifestChecks = [];
function manifest(name, expected, prefix = '', key = 'files') {
  exact(rel + name, expected);
  const data = read(name);
  for (const item of data[key]) exact(path.join(prefix, item.path), item.sha256);
  manifestChecks.push({ name, sha256: expected, records: data[key].length });
  return data;
}
const sourceSha = '7614805ee74ccfa6fad506e26b8ad3dfebefec243620e4f42ab664068475bde1';
manifest('CANDIDATE-SOURCE-FREEZE-v7.json', sourceSha, '.vercel/ux-step4-7-20261018-v7', 'appInputs');
manifest('RESPONSIVE-HARNESS-FREEZE-v8.json', '1dd275f69547cffde4b56b39e5e578ca879662278f9868866bc566ca351f1dc9');
manifest('INDEPENDENT-EXECUTION-FREEZE-v3.json', 'c76b71f688b9573f5a5d3c4d8cd8c1103787832ac46edc9dd6ee2420685d85e8');
manifest('FINAL-GATES-INPUT-FREEZE-v2.json', '4465fdb42a9c22e2da93f945c2bf3597170efdea2d281988cdaa8dc04db01700');
manifest('IMPLEMENTER-READABILITY-EVIDENCE-FREEZE-v2.json', 'c02e085607d40fa144a44a7681a524726a1fec272687307053060042f986724d');
const baseline = read('BASELINE-PINS-v2.json');
for (const item of baseline.app) exact(path.join('.vercel/ux-step4-6-20261018', item.path), item.expectedSha256);
for (const item of baseline.harness) exact(item.path, item.expectedSha256);
for (const item of baseline.approvedApp) exact(path.join('.vercel/ux-step4-5-20261017', item.path), item.expectedSha256);
for (const item of baseline.rootPreimages) {
  assert.equal(fs.existsSync(path.join(root, item.path)), item.exists, item.path);
  if (item.exists) exact(item.path, item.sha256);
}
const intake = read('INDEPENDENT-INTAKE-SOURCE-CHECK.json');
for (const item of intake.trackedDirty) exact(item.path, item.sha256);
exact(rel + 'INDEPENDENT-APP-QC.vi.md', '754718514cfa631d25083a334eb6ed5d2263b702c6e07192e94daece08b38a3f');
exact(rel + 'INDEPENDENT-QC-EVIDENCE-FREEZE-v1.json', '06345b85b9d63767ef840d212c45a02ff075f235b15ec37d576953e8eab1a2d8');
const own = read('independent-final-v3/results.json');
const command = read('independent-final-v3-command.json');
const worker = read('responsive-v8-command.json');
const reporter = read('responsive-v8-results.json');
const gates = read('final-gates-v2.json');
for (const receipt of [own, command, worker, gates]) {
  assert.equal(receipt.status, 'PASS');
  assert.equal(receipt.sourceFreezeSha256, sourceSha);
  assert.equal(receipt.postPinsMatch, true);
}
for (const receipt of [command, worker]) {
  assert.equal(receipt.exitCode, 0);
  assert.equal(receipt.signal, null);
  assert.equal(receipt.budgetExceeded, false);
}
assert.equal(own.cases.length, 5);
for (const control of own.cases) {
  assert.equal(control.status, 'PASS');
  for (const entries of Object.values(control.ledger)) assert.equal(entries.length, 0, control.id);
}
assert.equal(own.browserCloseCompleted, true);
assert.equal(own.ownedServerCloseCompleted, true);
assert.equal(own.cleanupErrors.length, 0);
assert.equal(reporter.stats.expected, 23);
for (const key of ['unexpected', 'skipped', 'flaky']) assert.equal(reporter.stats[key], 0);
assert.equal(reporter.errors.length, 0);
assert.equal(gates.checks.length, 7);
for (const gate of gates.checks) {
  assert.equal(gate.exitCode, 0);
  assert.equal(gate.error, null);
  assert.equal(gate.signal, null);
  exact(rel + `final-gate-v2-${gate.name}.log`, gate.logSha256);
}
function geometry(g) {
  return { route: g.route, mode: g.navLayout, height: g.layoutHeight, scale: g.scale,
    safe: g.safe, inset: g.inset, measured: g.measured,
    words: g.controls.map(c => ({ label: c.text, words: c.words.map(w => ({ text: w.text, rects: w.ranges.length })) })) };
}
const metrics = own.cases.map(c => ({ id: c.id, status: c.status,
  ordinary: geometry(c.result.ordinary.geometry),
  routes: c.result.routes?.map(r => geometry(r.geometry)),
  fitted: c.result.scaled ? geometry(c.result.scaled) : undefined,
  modeCycle: c.result.modeCycle,
  retainedEnd: c.result.retainedEnd,
  restore: c.result.restore ? { retainedRouteNodeRestored: c.result.restore.retainedRouteNodeRestored,
    scrollDelta: c.result.restore.scrollDelta } : undefined,
  ledger: c.ledger }));
const result = { recordedAt: new Date().toISOString(), status: 'PASS_INDEPENDENT_LOCAL_RESPONSIVE_ROOT_DIRECT_PENDING',
  sourceFreezeSha256: sourceSha, manifestChecks,
  preservation: { accepted46App: baseline.app.length, accepted46Harness: baseline.harness.length,
    accepted45App: baseline.approvedApp.length, rootPresent: baseline.rootPreimages.filter(i => i.exists).length,
    rootAbsent: baseline.rootPreimages.filter(i => !i.exists).length, trackedDirty: intake.trackedDirty.length,
    historicalQC7547AndFreeze0634Unchanged: true },
  worker: { cases: reporter.stats, childAndWrapperExit: 0 },
  gates: gates.checks.map(g => ({ name: g.name, exitCode: g.exitCode, logSha256: g.logSha256 })),
  independent: { actualChildAndWrapperExit: 0, cases: 5, cleanupErrors: own.cleanupErrors,
    browserCloseCompleted: own.browserCloseCompleted, ownedServerCloseCompleted: own.ownedServerCloseCompleted, metrics },
  note: 'Pin groups overlap; counts are records, not unique files. Source/gate/evidence read-through plus bounded guest controls; no OS inventory or native/live/release claim.' };
fs.writeFileSync(path.join(dir, 'INDEPENDENT-FINAL-PIN-CHECK-v2.json'), JSON.stringify(result, null, 2) + '\n', { flag: 'wx' });
console.log(JSON.stringify({ status: result.status, manifestChecks, preservation: result.preservation, cases: metrics.map(m => ({ id: m.id, mode: m.fitted?.mode, height: m.fitted?.height, scale: m.fitted?.scale, modeCycle: m.modeCycle, retainedEnd: m.retainedEnd, restore: m.restore })) }, null, 2));
