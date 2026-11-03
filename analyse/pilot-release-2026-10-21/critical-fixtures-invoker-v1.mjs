// Preparatory control: exact three existing fixture suites, after QC/root GO only.
import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, lstatSync, readFileSync, writeFileSync } from 'node:fs';
import { createConnection } from 'node:net';
import path from 'node:path';
const tree = 'C:/Users/Admin/.codex/worktrees/pilot-web-android-20261021/MCY';
const evidence = 'D:/Projects/MCY/analyse/pilot-release-2026-10-21';
const node = 'C:/Program Files/nodejs/node.exe';
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
if (process.argv.length !== 3 || process.argv[2] !== '--root-approved-critical-fixtures') throw new Error('Explicit critical fixture GO only');
const fixed = (name, expected) => { const bytes = readFileSync(path.join(evidence, name)); if (sha(bytes) !== expected) throw new Error('Frozen input changed'); return JSON.parse(bytes); };
const freeze = fixed('SOURCE-FREEZE-v2.json', '9e9c5c88d7721c4986bf61396dac9dd8a17586377c493971895e70ae77f9d256');
const deps = fixed('EFFECTIVE-DEPENDENCIES-v3.json', 'b17373a876dc6bda3e3f9e5c97fcef5a3fd479314a65557a0dcb70853ab69810');
const control = fixed('CRITICAL-FIXTURES-INPUTS-v1.json', 'd65366121fc642ddf4ff146f69ddf20e655f28c26025d23c2f69ceb6a7224bdf');
const verify = () => {
  for (const pin of freeze.allKnownCandidateFiles) {
    const file = path.resolve(tree, pin.relativePath);
    if (!file.toLowerCase().startsWith(`${path.resolve(tree).toLowerCase()}${path.sep}`) || lstatSync(file).isSymbolicLink()) throw new Error('Unsafe fixture source');
    if (sha(readFileSync(file)) !== pin.sha256) throw new Error('Source changed');
  }
  for (const pin of [...deps.toolPins, ...control.toolPins]) if (sha(readFileSync(pin.path)) !== pin.sha256) throw new Error('Fixture tool changed');
  for (const item of deps.packages.filter(item => item.status === 'INSTALLED_MATCH_LOCK')) if (sha(readFileSync(path.join(tree, item.path, 'package.json'))) !== item.packageJsonSha256) throw new Error('Fixture package manifest changed');
  for (const pin of control.controls) if (sha(readFileSync(pin.path)) !== pin.sha256) throw new Error('Fixture control changed');
};
verify();
const receiptPath = path.join(evidence, 'CRITICAL-FIXTURES-v1.json');
const logPath = path.join(evidence, 'CRITICAL-FIXTURES-v1.log');
if ([receiptPath, logPath, path.join(evidence, 'CRITICAL-FIXTURES-v1.report.json'), path.join(tree, '.vercel/critical-fixtures-v1')].some(existsSync)) throw new Error('Existing fixture invocation output; no automatic retry');
const allowed = new Set(['PATH', 'SYSTEMROOT', 'WINDIR', 'COMSPEC', 'PATHEXT', 'TEMP', 'TMP', 'USERPROFILE', 'LOCALAPPDATA', 'APPDATA', 'PROGRAMFILES', 'PROGRAMFILES(X86)', 'COMMONPROGRAMFILES']);
const env = Object.fromEntries(Object.entries(process.env).filter(([key]) => allowed.has(key.toUpperCase())));
Object.assign(env, { CI: 'true', NODE_ENV: 'test', NO_UPDATE_NOTIFIER: '1', VITE_SUPABASE_URL: 'https://mcy-playwright.invalid', VITE_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_mcy_playwright_fixture', HTTP_PROXY: 'http://127.0.0.1:4291', HTTPS_PROXY: 'http://127.0.0.1:4291' });
const args = [path.join(tree, 'node_modules/@playwright/test/cli.js'), 'test', '--config', path.join(evidence, 'critical-fixtures.playwright-v1.mjs')];
const child = spawn(node, args, { cwd: tree, env, windowsHide: true, shell: false, stdio: ['ignore', 'pipe', 'pipe'] });
let bytes = 0, timedOut = false, capped = false, closed = false, exited = false, cleanup;
const chunks = [];
function stop(reason) {
  timedOut ||= reason === 'TIMEOUT'; capped ||= reason === 'OUTPUT_CAP';
  if (cleanup) return;
  cleanup = new Promise(resolve => {
    if (!child.pid || exited || closed) { resolve('PARENT_ALREADY_EXITED'); return; }
    const helper = spawn('C:/Windows/System32/taskkill.exe', ['/PID', String(child.pid), '/T', '/F'], { env, shell: false, windowsHide: true, stdio: 'ignore' });
    const timer = setTimeout(() => { helper.kill(); resolve('HELPER_TIMEOUT'); }, 8000);
    helper.once('close', code => { clearTimeout(timer); resolve(code === 0 ? 'OWNED_CHILD_TREE_STOPPED' : 'HELPER_FAILED'); }); helper.once('error', () => { clearTimeout(timer); resolve('HELPER_ERROR'); });
  });
}
const capture = stream => chunk => { bytes += chunk.length; if (bytes <= 4 * 1024 * 1024) chunks.push(`[${stream}] ${chunk.toString('utf8')}`); else stop('OUTPUT_CAP'); };
child.stdout.on('data', capture('stdout')); child.stderr.on('data', capture('stderr')); child.once('exit', () => { exited = true; });
const startedUtc = new Date().toISOString(); const timeout = setTimeout(() => stop('TIMEOUT'), 600000); let fallback;
const outcome = await new Promise(resolve => { fallback = setTimeout(() => { child.stdout.destroy(); child.stderr.destroy(); child.unref(); resolve({ exitCode: null, closeUnverified: true }); }, 620000); child.once('error', () => resolve({ exitCode: null, spawnError: true })); child.once('close', exitCode => { closed = true; resolve({ exitCode }); }); });
clearTimeout(timeout); clearTimeout(fallback); const cleanupResult = cleanup ? await cleanup : 'NORMAL_EXIT';
let sourcePreserved = true; try { verify(); } catch { sourcePreserved = false; }
const ports = await Promise.all([4290, 4291].map(port => new Promise(resolve => { const socket = createConnection({ host: '127.0.0.1', port }); let done = false; const finish = state => { if (!done) { done = true; socket.destroy(); resolve({ port, state }); } }; socket.setTimeout(1000, () => finish('UNKNOWN')); socket.once('connect', () => finish('OPEN')); socket.once('error', error => finish(error.code === 'ECONNREFUSED' ? 'CLOSED' : 'UNKNOWN')); })));
const egressPath = path.join(tree, '.vercel/critical-fixtures-v1/egress.json');
let egress = null; if (existsSync(egressPath)) egress = JSON.parse(readFileSync(egressPath, 'utf8'));
const passed = outcome.exitCode === 0 && closed && !timedOut && !capped && !outcome.spawnError && sourcePreserved && ports.every(item => item.state === 'CLOSED') && egress && egress.unexpected === 0;
const redact = value => value.replace(/sb_(?:publishable|secret)_[A-Za-z0-9_-]+/g, '[REDACTED_KEY]').replace(/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g, '[REDACTED_JWT]');
writeFileSync(logPath, redact(chunks.join('')), { flag: 'wx' });
const result = { status: passed ? 'PASS_SELECTED_FIXTURE_SUITES_ONLY' : 'FAIL_STOP_NO_AUTOMATIC_RETRY', startedUtc, endedUtc: new Date().toISOString(), cwd: tree, selected: ['ux-save-feedback.spec.ts', 'learner-device-acceptance.spec.ts', 'auth-callback.spec.ts'], environmentPolicy: 'OS_ALLOWLIST_PLUS_EXISTING_INVALID_FIXTURE_NO_ENVFILE_OR_PUBLIC_REAL_CONFIG', timeoutMs: 600000, outputCapBytes: 4194304, timedOut, outputCapped: capped, closed, cleanup: cleanupResult, ...outcome, sourcePreserved, ports, egressPath, egressUnexpected: egress?.unexpected ?? null, exactBuiltArtifactOrLiveRoleOrNativeAcceptance: false, realProviderCloudWriteDeviceDeployCommitActions: 0 };
writeFileSync(receiptPath, `${JSON.stringify(result, null, 2)}\n`, { flag: 'wx' });
process.stdout.write(`${JSON.stringify({ status: result.status, exitCode: outcome.exitCode, receiptPath, logPath })}\n`); process.exitCode = passed ? 0 : 1;
