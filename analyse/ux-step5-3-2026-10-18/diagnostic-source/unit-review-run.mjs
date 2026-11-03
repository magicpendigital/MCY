import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createConnection } from 'node:net';

// Source-reviewed entry point only; no environment files or inherited credentials.
let project;
let channel;
let listing = false;
const args = process.argv.slice(2);
for (let index = 0; index < args.length; index++) {
  if (args[index] === '--project' && !project) project = args[++index];
  else if (args[index] === '--channel' && !channel) channel = args[++index];
  else if (args[index] === '--list' && !listing) listing = true;
  else throw new Error('Only --project, optional --channel and --list are supported.');
}
if (project !== 'browser-baseline-diagnostic' || channel !== 'chromium' || listing)
  throw new Error('Only the reviewed managed Chromium diagnostic is supported.');
const sourceRoot = dirname(fileURLToPath(import.meta.url));
const candidateRoot = resolve(sourceRoot, '../../../.vercel/ux-step5-3-20261018-v1');
const repoRoot = resolve(candidateRoot, '../..');
const allowed = new Set(['PATH', 'SYSTEMROOT', 'WINDIR', 'TEMP', 'TMP', 'COMSPEC', 'PATHEXT', 'USERPROFILE',
  'LOCALAPPDATA', 'APPDATA', 'PROGRAMFILES', 'PROGRAMFILES(X86)', 'COMMONPROGRAMFILES']);
const environment = Object.fromEntries(Object.entries(process.env).filter(([key]) => allowed.has(key.toUpperCase())));
Object.assign(environment, { NODE_ENV: 'test', VITE_SUPABASE_URL: 'https://mcy-playwright.invalid',
  VITE_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_mcy_playwright_fixture',
  PLAYWRIGHT_BROWSERS_PATH: resolve(repoRoot, '.vercel/ux-step5-3-browser-tools'),
  HTTP_PROXY: 'http://127.0.0.1:4255', HTTPS_PROXY: 'http://127.0.0.1:4255' });
if (channel) environment.MCY_PLAYWRIGHT_CHANNEL = channel;
const runId = `${Date.now()}-${process.pid}`;
const directory = resolve(sourceRoot, '../diagnostic-results/invocations');
await mkdir(directory, { recursive: true });
const stdoutPath = resolve(directory, `${runId}.stdout.log`);
const stderrPath = resolve(directory, `${runId}.stderr.log`);
const receiptPath = resolve(directory, `${runId}.json`);
const cliArgs = [resolve(sourceRoot, 'unit-review-browser-diagnostic.mjs')];
const outputCapBytes = 4 * 1024 * 1024;
const timeoutMs = 120_000;
const startedAt = new Date().toISOString();
const child = spawn(process.execPath, cliArgs, { cwd: candidateRoot, env: environment, stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true });
const stdout = [];
const stderr = [];
let totalBytes = 0;
let outputCapExceeded = false;
let timedOut = false;
let childClosed = false;
let childExited = false;
let settleOutcome;
let secondaryTimer;
let cleanupPromise;
const secondaryDeadlineMs = 20_000;
const taskkillDeadlineMs = 8000;
const cleanup = { attempted: false, reason: null, method: 'NORMAL_TEARDOWN', taskkillExitCode: null,
  taskkillTimedOut: false, secondaryDeadlineExceeded: false, status: 'UNKNOWN', verified: false };
const outcomePromise = new Promise(resolveOutcome => {
  let settled = false;
  settleOutcome = value => { if (!settled) { settled = true; resolveOutcome(value); } };
  child.once('error', () => settleOutcome({ exitCode: null, signal: null, spawnError: true }));
  child.once('exit', () => { childExited = true; });
  child.once('close', (exitCode, signal) => { childClosed = true; settleOutcome({ exitCode, signal, spawnError: false }); });
});
function beginCleanup(reason) {
  if (cleanupPromise) return;
  cleanup.attempted = true; cleanup.reason = reason;
  secondaryTimer = setTimeout(() => {
    cleanup.secondaryDeadlineExceeded = true;
    child.stdout.destroy(); child.stderr.destroy(); child.unref();
    settleOutcome({ exitCode: child.exitCode, signal: child.signalCode, spawnError: false });
  }, secondaryDeadlineMs);
  cleanupPromise = (async () => {
    // Never target a PID after observing the owned parent exit; it could have been reused.
    if (!Number.isInteger(child.pid) || child.pid < 1 || childExited || childClosed) {
      cleanup.method = 'OWNED_PARENT_ALREADY_EXITED_NO_PID_KILL'; return;
    }
    if (process.platform !== 'win32') {
      cleanup.method = 'OWNED_DIRECT_CHILD_ONLY_NONWINDOWS'; child.kill('SIGKILL'); return;
    }
    cleanup.method = 'WINDOWS_OWNED_CHILD_TASKKILL_TREE';
    const systemRoot = process.env.SystemRoot ?? process.env.SYSTEMROOT ?? process.env.WINDIR ?? 'C:\\Windows';
    const helper = spawn(resolve(systemRoot, 'System32/taskkill.exe'), ['/PID', String(child.pid), '/T', '/F'],
      { shell: false, windowsHide: true, stdio: 'ignore', env: environment });
    await new Promise(resolveCleanup => {
      let settled = false;
      const finish = exitCode => { if (!settled) { settled = true; clearTimeout(deadline); cleanup.taskkillExitCode = exitCode; resolveCleanup(); } };
      const deadline = setTimeout(() => {
        cleanup.taskkillTimedOut = true; helper.kill('SIGKILL'); helper.unref(); finish(null);
      }, taskkillDeadlineMs);
      helper.once('error', () => finish(null)); helper.once('close', exitCode => finish(exitCode));
    });
  })();
}
const capture = list => chunk => {
  totalBytes += chunk.length;
  if (totalBytes <= outputCapBytes) list.push(chunk);
  else { outputCapExceeded = true; beginCleanup('OUTPUT_CAP'); }
};
child.stdout.on('data', capture(stdout)); child.stderr.on('data', capture(stderr));
const timeout = setTimeout(() => { timedOut = true; beginCleanup('TIMEOUT'); }, timeoutMs);
const outcome = await outcomePromise;
clearTimeout(timeout);
if (cleanupPromise) await cleanupPromise;
clearTimeout(secondaryTimer);
const listenerPorts = project === 'egress-negative' ? [4265] : [4253, 4255];
const listeners = await Promise.all(listenerPorts.map(port => new Promise(resolveProbe => {
  const socket = createConnection({ host: '127.0.0.1', port });
  let settled = false;
  const finish = state => { if (!settled) { settled = true; socket.destroy(); resolveProbe({ port, state }); } };
  socket.setTimeout(500, () => finish('UNKNOWN_TIMEOUT'));
  socket.once('connect', () => finish('OPEN'));
  socket.once('error', error => finish(error.code === 'ECONNREFUSED' ? 'CLOSED' : 'UNKNOWN_ERROR'));
})));
const portsClosed = listeners.every(listener => listener.state === 'CLOSED');
cleanup.verified = childClosed && portsClosed && !cleanup.secondaryDeadlineExceeded &&
  (!cleanup.attempted || cleanup.method === 'WINDOWS_OWNED_CHILD_TASKKILL_TREE' && cleanup.taskkillExitCode === 0 && !cleanup.taskkillTimedOut);
cleanup.status = cleanup.verified ? 'VERIFIED_OWNED_CHILD_AND_SELECTED_LISTENERS' : 'UNKNOWN_DO_NOT_RETRY_AUTOMATICALLY';
cleanup.childClosed = childClosed;
cleanup.listeners = listeners;
cleanup.descendantEvidence = cleanup.attempted && cleanup.taskkillExitCode === 0
  ? 'OS_REPORTED_OWNED_TREE_TERMINATED' : 'NORMAL_DESCENDANTS_NOT_INDEPENDENTLY_ENUMERATED';
await writeFile(stdoutPath, Buffer.concat(stdout)); await writeFile(stderrPath, Buffer.concat(stderr));
const success = outcome.exitCode === 0 && !timedOut && !outputCapExceeded && !outcome.spawnError && cleanup.verified;
const receipt = { runId, startedAt, endedAt: new Date().toISOString(), project, channel: channel ?? 'configured-default', listing,
  cwd: candidateRoot, args: cliArgs, environmentPolicy: 'OS_ALLOWLIST_PLUS_EXPLICIT_INVALID_FIXTURE_ONLY_NO_ENV_FILES',
  browserCachePolicy: 'FIXED_WORKSPACE_TEST_CACHE_NO_INHERITED_PATH', browserCachePath: environment.PLAYWRIGHT_BROWSERS_PATH,
  inheritedEnvironmentKeys: Object.keys(environment).filter(key => allowed.has(key.toUpperCase())).sort(),
  timeoutMs, secondaryDeadlineMs, taskkillDeadlineMs, outputCapBytes, capturedBytes: Math.min(totalBytes, outputCapBytes), totalObservedBytes: totalBytes,
  cleanup,
  childPid: child.pid ?? null, outputCapExceeded, timedOut, ...outcome, status: success ? 'PASS_PROCESS' : 'FAIL_PROCESS', stdoutPath, stderrPath };
await writeFile(receiptPath, `${JSON.stringify(receipt, null, 2)}\n`, 'utf8');
process.stdout.write(`${JSON.stringify({ status: receipt.status, project, listing, exitCode: outcome.exitCode, receiptPath, stdoutPath, stderrPath })}\n`);
process.exitCode = success ? 0 : 1;
