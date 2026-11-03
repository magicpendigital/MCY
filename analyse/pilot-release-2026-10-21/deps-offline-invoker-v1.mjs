// Preparatory R3 control: invoke only after independent QC and root D0 GO.
import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, lstatSync, mkdirSync, readFileSync, realpathSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const tree = 'C:/Users/Admin/.codex/worktrees/pilot-web-android-20261021/MCY';
const evidence = 'D:/Projects/MCY/analyse/pilot-release-2026-10-21';
const freezePath = path.join(evidence, 'SOURCE-FREEZE-v1.json');
const freezeSha = '5cd254ae1bd366e67ef763279c8db207cc061e67f10c39693cbb2a89e809fec5';
const node = 'C:/Program Files/nodejs/node.exe';
const npm = 'C:/Program Files/nodejs/node_modules/npm/bin/npm-cli.js';
const cache = 'C:/Users/Admin/AppData/Local/npm-cache';
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
if (process.argv.length !== 3 || process.argv[2] !== '--root-approved-D0') throw new Error('Explicit reviewed D0 invocation only');
if (sha(readFileSync(freezePath)) !== freezeSha) throw new Error('Source freeze changed');
const freeze = JSON.parse(readFileSync(freezePath, 'utf8'));
if (path.resolve(freeze.targetRoot).toLowerCase() !== path.resolve(tree).toLowerCase() || realpathSync(tree).toLowerCase() !== path.resolve(tree).toLowerCase()) throw new Error('Managed tree mismatch');
const verify = () => {
  for (const pin of freeze.allKnownCandidateFiles) {
    const absolute = path.resolve(tree, pin.relativePath);
    if (!absolute.toLowerCase().startsWith(`${path.resolve(tree).toLowerCase()}${path.sep}`) || pin.relativePath.includes('..') || lstatSync(absolute).isSymbolicLink()) throw new Error('Unsafe frozen input');
    const bytes = readFileSync(absolute);
    if (bytes.length !== pin.bytes || sha(bytes) !== pin.sha256) throw new Error(`Frozen source changed: ${pin.relativePath}`);
  }
};
verify();
// The one project npmrc is a frozen, noncredential two-line setting. No other config is read.
if (readFileSync(path.join(tree, '.npmrc'), 'utf8').replaceAll('\r\n', '\n').trim() !== 'fund=false\naudit=false') throw new Error('Unexpected project npmrc');
if (!existsSync(path.join(cache, '_cacache')) || !existsSync(node) || !existsSync(npm)) throw new Error('Offline cache/tool absent');
if (existsSync(path.join(tree, 'node_modules'))) throw new Error('Dependency tree already exists; no automatic retry');
const control = path.join(tree, '.vercel/pilot-deps-v1');
if (existsSync(control)) throw new Error('D0 control directory already exists; no automatic retry');
mkdirSync(control, { recursive: true });
const userConfig = path.join(control, 'empty-user.npmrc');
const globalConfig = path.join(control, 'empty-global.npmrc');
writeFileSync(userConfig, '', { flag: 'wx' });
writeFileSync(globalConfig, '', { flag: 'wx' });
const allowed = new Set(['PATH', 'SYSTEMROOT', 'WINDIR', 'COMSPEC', 'PATHEXT', 'TEMP', 'TMP', 'USERPROFILE', 'LOCALAPPDATA', 'APPDATA', 'PROGRAMFILES', 'PROGRAMFILES(X86)', 'COMMONPROGRAMFILES']);
const env = Object.fromEntries(Object.entries(process.env).filter(([key]) => allowed.has(key.toUpperCase())));
Object.assign(env, { CI: 'true', NO_UPDATE_NOTIFIER: '1', NPM_CONFIG_UPDATE_NOTIFIER: 'false', NPM_CONFIG_OFFLINE: 'true', NPM_CONFIG_AUDIT: 'false', NPM_CONFIG_FUND: 'false', NPM_CONFIG_USERCONFIG: userConfig, NPM_CONFIG_GLOBALCONFIG: globalConfig, NPM_CONFIG_CACHE: cache });
const args = [npm, 'ci', '--offline', '--ignore-scripts', '--no-audit', '--fund=false', '--userconfig', userConfig, '--globalconfig', globalConfig, '--cache', cache];
const startedUtc = new Date().toISOString();
const child = spawn(node, args, { cwd: tree, env, windowsHide: true, shell: false, stdio: ['ignore', 'pipe', 'pipe'] });
const chunks = []; let bytes = 0; let timedOut = false; let outputExceeded = false; let closed = false; let exited = false; let cleanup;
function stop(reason) {
  if (cleanup) return;
  timedOut ||= reason === 'TIMEOUT'; outputExceeded ||= reason === 'OUTPUT_CAP';
  cleanup = new Promise(resolve => {
    if (!child.pid || exited || closed) { resolve({ status: 'PARENT_ALREADY_EXITED_NO_KILL' }); return; }
    const kill = spawn('C:/Windows/System32/taskkill.exe', ['/PID', String(child.pid), '/T', '/F'], { shell: false, windowsHide: true, stdio: 'ignore', env });
    const deadline = setTimeout(() => { kill.kill(); resolve({ status: 'KILL_HELPER_TIMEOUT' }); }, 8000);
    kill.once('close', code => { clearTimeout(deadline); resolve({ status: 'OWNED_CHILD_TREE_KILL', exitCode: code }); });
    kill.once('error', () => { clearTimeout(deadline); resolve({ status: 'KILL_HELPER_ERROR' }); });
  });
}
const capture = stream => chunk => { bytes += chunk.length; if (bytes <= 4 * 1024 * 1024) chunks.push({ stream, text: chunk.toString('utf8') }); else stop('OUTPUT_CAP'); };
child.stdout.on('data', capture('stdout')); child.stderr.on('data', capture('stderr'));
child.once('exit', () => { exited = true; });
const deadline = setTimeout(() => stop('TIMEOUT'), 600_000);
let fallback;
const outcome = await new Promise(resolve => {
  fallback = setTimeout(() => { child.stdout.destroy(); child.stderr.destroy(); child.unref(); resolve({ exitCode: null, spawnError: false, closeUnverified: true }); }, 620_000);
  child.once('error', () => resolve({ exitCode: null, spawnError: true }));
  child.once('close', code => { closed = true; resolve({ exitCode: code, spawnError: false }); });
});
clearTimeout(deadline); clearTimeout(fallback);
const cleanupResult = cleanup ? await cleanup : { status: 'NORMAL_EXIT' };
let preserved = true; try { verify(); } catch { preserved = false; }
const redact = value => value.replace(/sb_(?:publishable|secret)_[A-Za-z0-9_-]+/g, '[REDACTED_KEY]').replace(/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g, '[REDACTED_JWT]').replace(/sk-[A-Za-z0-9_-]+/g, '[REDACTED_KEY]');
const log = path.join(evidence, 'D0-OFFLINE-DEPS-v1.log');
const receipt = path.join(evidence, 'D0-OFFLINE-DEPS-v1.json');
if (existsSync(log) || existsSync(receipt)) throw new Error('D0 evidence already exists');
writeFileSync(log, chunks.map(item => `[${item.stream}] ${redact(item.text)}`).join(''), { flag: 'wx' });
const success = outcome.exitCode === 0 && closed && !timedOut && !outputExceeded && !outcome.spawnError && preserved;
const result = { status: success ? 'PASS_OFFLINE_DEPENDENCIES_ONLY' : 'FAIL_STOP_NO_AUTOMATIC_RETRY', startedUtc, endedUtc: new Date().toISOString(), cwd: tree, sourceFreezeSha256: freezeSha, command: 'node npm-cli.js ci --offline --ignore-scripts --no-audit --fund=false plus pinned empty config/cache arguments', environmentPolicy: 'OS_ALLOWLIST_NO_ENV_FILES_EMPTY_USER_GLOBAL_NPMRC_FROZEN_PUBLIC_PROJECT_NPMRC', cache, rawEnvironmentValuesLogged: false, timeoutMs: 600000, outputCapBytes: 4194304, capturedBytes: Math.min(bytes, 4194304), timedOut, outputExceeded, closed, cleanup: cleanupResult, sourcePreserved: preserved, ...outcome, sourceTestsBuildServerCommitProviderDeviceActions: 0 };
writeFileSync(receipt, `${JSON.stringify(result, null, 2)}\n`, { flag: 'wx' });
process.stdout.write(`${JSON.stringify({ status: result.status, exitCode: outcome.exitCode, receipt, log })}\n`);
process.exitCode = success ? 0 : 1;
