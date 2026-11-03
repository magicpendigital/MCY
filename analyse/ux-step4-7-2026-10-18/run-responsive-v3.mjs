import { createHash } from 'node:crypto';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const dir = import.meta.dirname;
const root = path.resolve(dir, '../..');
const shaBytes = bytes => createHash('sha256').update(bytes).digest('hex');
const sha = file => shaBytes(fs.readFileSync(file));
const freezePath = path.join(dir, 'RESPONSIVE-HARNESS-FREEZE-v3.json');
const sourcePath = path.join(dir, 'CANDIDATE-SOURCE-FREEZE-v2.json');
const logPath = path.join(dir, 'responsive-v3.log');
const receiptPath = path.join(dir, 'responsive-v3-command.json');
const resultsPath = path.join(dir, 'responsive-v3-results.json');
assert(!fs.existsSync(logPath) && !fs.existsSync(receiptPath) && !fs.existsSync(resultsPath), 'Never overwrite selected test evidence');

const freezeBytes = fs.readFileSync(freezePath);
const freezeSha256 = shaBytes(freezeBytes);
const freeze = JSON.parse(freezeBytes);
const sourceBytes = fs.readFileSync(sourcePath);
const sourceSha256 = shaBytes(sourceBytes);
const runnerSha256 = sha(new URL(import.meta.url));
assert.equal(sourceSha256, freeze.sourceFreezeSha256);
const source = JSON.parse(sourceBytes);
assert.equal(source.candidate, '.vercel/ux-step4-7-20261018-v2');
assert.equal(source.appInputs.length, 237);
for (const item of freeze.files) assert.equal(sha(path.join(root, item.path)), item.sha256, item.path);
for (const item of source.appInputs) assert.equal(sha(path.join(root, source.candidate, item.path)), item.sha256, item.path);

const cwd = path.join(dir, 'responsive-v3-run');
fs.mkdirSync(cwd, { recursive: true });
for (const sub of ['ux-step4-1-2026-10-14','ux-step4-2-2026-10-15','ux-step4-3-2026-10-16','ux-step4-4-2026-10-17','ux-step4-5-2026-10-17']) fs.mkdirSync(path.join(cwd, 'analyse', sub), { recursive: true });
const args = [path.join(root, 'node_modules/@playwright/test/cli.js'), 'test', '--config', path.join(dir, 'responsive-v3.playwright.config.mjs')];
const startedAt = new Date().toISOString();
const fd = fs.openSync(logPath, 'wx');
const child = spawn(process.execPath, args, { cwd, env: { ...process.env, PLAYWRIGHT_JSON_OUTPUT_FILE: resultsPath }, stdio: ['ignore', 'pipe', 'pipe'] });
let budgetExceeded = false, spawnError = null;
const budgetMs = 900000;
const timer = setTimeout(() => { budgetExceeded = true; child.kill(); }, budgetMs);
for (const stream of [child.stdout, child.stderr]) stream.on('data', chunk => { fs.writeSync(fd, chunk); process.stdout.write(chunk); });
child.on('error', error => { spawnError = String(error); fs.writeSync(fd, spawnError + '\n'); });
child.on('close', (exitCode, signal) => {
  clearTimeout(timer);
  fs.closeSync(fd);
  let postPinsMatch = true, postPinError = null;
  try {
    if (sha(freezePath) !== freezeSha256 || sha(sourcePath) !== sourceSha256) postPinsMatch = false;
    for (const item of freeze.files) if (sha(path.join(root, item.path)) !== item.sha256) postPinsMatch = false;
    for (const item of source.appInputs) if (sha(path.join(root, source.candidate, item.path)) !== item.sha256) postPinsMatch = false;
  } catch (error) {
    postPinsMatch = false;
    postPinError = String(error);
  }
  const status = exitCode === 0 && !budgetExceeded && postPinsMatch && !spawnError ? 'PASS' : 'FAIL';
  const receipt = {
    startedAt, endedAt: new Date().toISOString(), command: ['node', ...args], cwd,
    exitCode, signal, budgetExceeded, runnerBudgetMs: budgetMs, caseTimeoutMs: 45000,
    freezeSha256, sourceFreezeSha256, runnerSha256,
    postPinsMatch, postPinError, spawnError, status,
    forcedBudgetCleanup: budgetExceeded ? 'UNVERIFIED_NO_AUTOMATIC_RETRY' : 'NOT_TRIGGERED',
    executionMode: 'Scoped local Edge review; exact synthetic frame, deny proxy and CSP; no real outbound media/backend.',
  };
  fs.writeFileSync(receiptPath, JSON.stringify(receipt, null, 2) + '\n', { flag: 'wx' });
  console.log(JSON.stringify(receipt));
  process.exitCode = status === 'PASS' ? 0 : 1;
});
