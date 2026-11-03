import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { isolatePlaywrightTestEnvironment } from '../../scripts/playwright-test-environment.mjs';

const dir = import.meta.dirname;
const root = path.resolve(dir, '../..');
const candidate = path.join(root, '.vercel/ux-step4-7-20261018-v5');
const sourceFreezePath = path.join(dir, 'CANDIDATE-SOURCE-FREEZE-v5.json');
const inputFreezePath = path.join(dir, 'FINAL-GATES-INPUT-FREEZE-v1.json');
const receiptPath = path.join(dir, 'final-gates-v1.json');
assert(!fs.existsSync(receiptPath), 'Preserve prior gate receipt');
const sha = file => createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const sourceFreezeSha256 = sha(sourceFreezePath);
const inputFreezeSha256 = sha(inputFreezePath);
const source = JSON.parse(fs.readFileSync(sourceFreezePath));
const inputs = JSON.parse(fs.readFileSync(inputFreezePath));
assert.equal(source.candidate, '.vercel/ux-step4-7-20261018-v5');
assert.equal(inputs.sourceFreezeSha256, sourceFreezeSha256);
function checkPins() {
  assert.equal(sha(sourceFreezePath), sourceFreezeSha256);
  assert.equal(sha(inputFreezePath), inputFreezeSha256);
  for (const item of source.appInputs) assert.equal(sha(path.join(candidate, item.path)), item.sha256, item.path);
  for (const item of inputs.files) assert.equal(sha(path.join(root, item.path)), item.sha256, item.path);
}
checkPins();
const env = { ...process.env };
for (const name of Object.keys(env)) if (name.startsWith('VITE_')) delete env[name];
isolatePlaywrightTestEnvironment(env);
const node = process.execPath;
const gates = [
  { name: 'runtime', cwd: candidate, args: ['scripts/check-mobile-runtime.mjs'], timeoutMs: 120000 },
  { name: 'catalogue', cwd: candidate, args: ['scripts/check-reviewed-practice-catalog.mjs'], timeoutMs: 120000 },
  { name: 'typecheck', cwd: candidate, args: [path.join(root, 'node_modules/typescript/bin/tsc')], timeoutMs: 120000 },
  { name: 'build', cwd: root, args: [path.join(dir, 'build-fixture-v5.mjs')], timeoutMs: 300000 },
  { name: 'sites-prep', cwd: candidate, args: ['scripts/prepare-sites-build.mjs'], timeoutMs: 120000 },
  { name: 'bundle', cwd: candidate, args: ['scripts/check-client-bundle-secrets.mjs'], timeoutMs: 120000 },
  { name: 'sites-isolation', cwd: candidate, args: ['--test', 'tests/sites-worker.test.mjs', 'tests/playwright-test-environment.test.mjs'], timeoutMs: 120000 },
];
const startedAt = new Date().toISOString();
const checks = [];
for (const gate of gates) {
  const logPath = path.join(dir, `final-gate-v1-${gate.name}.log`);
  assert(!fs.existsSync(logPath), 'Preserve gate log: ' + gate.name);
  const result = spawnSync(node, gate.args, { cwd: gate.cwd, env, encoding: 'utf8', timeout: gate.timeoutMs, maxBuffer: 16 * 1024 * 1024 });
  const output = (result.stdout ?? '') + (result.stderr ?? '') + (result.error ? '\n' + String(result.error) : '');
  fs.writeFileSync(logPath, output, { flag: 'wx' });
  const check = {
    name: gate.name, command: [node, ...gate.args], cwd: gate.cwd,
    exitCode: result.status, signal: result.signal, error: result.error ? String(result.error) : null,
    timeoutMs: gate.timeoutMs, logSha256: sha(logPath),
  };
  checks.push(check);
  console.log(`${gate.name}: exit=${result.status} signal=${result.signal ?? 'none'}`);
  if (result.status !== 0 || result.error || result.signal) break;
}
let postPinsMatch = true, postPinError = null;
try { checkPins(); } catch (error) { postPinsMatch = false; postPinError = String(error); }
const status = checks.length === gates.length && checks.every(check => check.exitCode === 0 && !check.error && !check.signal) && postPinsMatch ? 'PASS' : 'FAIL';
fs.writeFileSync(receiptPath, JSON.stringify({ startedAt, endedAt: new Date().toISOString(), status, sourceFreezeSha256, inputFreezeSha256, postPinsMatch, postPinError, expectedGateCount: gates.length, checks }, null, 2) + '\n', { flag: 'wx' });
console.log(status + ': ' + checks.length + '/' + gates.length + ' gates');
process.exitCode = status === 'PASS' ? 0 : 1;
