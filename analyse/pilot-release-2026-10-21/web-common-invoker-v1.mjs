// Preparatory R3 control: no invocation before independent QC/root common-web GO.
import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { cpSync, existsSync, lstatSync, mkdirSync, readFileSync, readdirSync, realpathSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const tree = 'C:/Users/Admin/.codex/worktrees/pilot-web-android-20261021/MCY';
const evidence = 'D:/Projects/MCY/analyse/pilot-release-2026-10-21';
const node = 'C:/Program Files/nodejs/node.exe';
const freezeSha = '9e9c5c88d7721c4986bf61396dac9dd8a17586377c493971895e70ae77f9d256';
const publicProposalSha = '50f20a6735b8b925175f153b1eb7bd861bbb9901527dc8391d78568108911792';
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const fixedJson = (name, expected) => { const bytes = readFileSync(path.join(evidence, name)); if (sha(bytes) !== expected) throw new Error(`Changed control input: ${name}`); return JSON.parse(bytes); };
if (process.argv.length !== 3 || process.argv[2] !== '--root-approved-common-web') throw new Error('Explicit common-web GO invocation only');
const freeze = fixedJson('SOURCE-FREEZE-v2.json', freezeSha);
const proposal = fixedJson('PUBLIC-CONFIG-REUSE-PROPOSAL-v2.json', publicProposalSha);
if (path.resolve(freeze.targetRoot).toLowerCase() !== path.resolve(tree).toLowerCase() || realpathSync(tree).toLowerCase() !== path.resolve(tree).toLowerCase()) throw new Error('Managed tree mismatch');
function verify() {
  for (const pin of freeze.allKnownCandidateFiles) {
    const file = path.resolve(tree, pin.relativePath);
    if (!file.toLowerCase().startsWith(`${path.resolve(tree).toLowerCase()}${path.sep}`) || pin.relativePath.includes('..') || lstatSync(file).isSymbolicLink()) throw new Error('Unsafe source path');
    const bytes = readFileSync(file); if (sha(bytes) !== pin.sha256 || bytes.length !== pin.bytes) throw new Error(`Source drift: ${pin.relativePath}`);
  }
  if (readdirSync(tree).some(name => name.startsWith('.env') && name !== '.env.example')) throw new Error('Unexpected environment file; no read attempted');
}
verify();
const deps = fixedJson('D0-REGISTRY-DEPS-v2.json', 'da2a8070f246001948a81aa7692b284266008ef0a2f6396e6a38b126549da8a8');
if (deps.status !== 'PASS_PINNED_REGISTRY_DEPENDENCIES_ONLY' || !deps.sourcePreserved || deps.sourceFreezeSha256 !== '5cd254ae1bd366e67ef763279c8db207cc061e67f10c39693cbb2a89e809fec5') throw new Error('D0 dependency acceptance missing');
const effective = fixedJson('EFFECTIVE-DEPENDENCIES-v3.json', 'b17373a876dc6bda3e3f9e5c97fcef5a3fd479314a65557a0dcb70853ab69810');
for (const pin of effective.toolPins) if (sha(readFileSync(pin.path)) !== pin.sha256) throw new Error('Installed tool changed');
for (const item of effective.packages.filter(item => item.status === 'INSTALLED_MATCH_LOCK')) if (sha(readFileSync(path.join(tree, item.path, 'package.json'))) !== item.packageJsonSha256) throw new Error('Installed package manifest changed');
const oldEntry = path.resolve('D:/Projects/MCY', proposal.source.publicEntryPath);
const oldBytes = readFileSync(oldEntry);
if (sha(oldBytes) !== proposal.source.publicEntrySha256) throw new Error('Public config provenance drift');
const oldText = oldBytes.toString('utf8');
const urls = [...new Set(oldText.match(/https:\/\/[a-z0-9]+\.supabase\.co/g) ?? [])];
const keys = [...new Set(oldText.match(/sb_publishable_[A-Za-z0-9_-]{12,}/g) ?? [])];
if (urls.length !== 1 || urls[0] !== 'https://mhumbczqrzutdnraafhs.supabase.co' || keys.length !== 1 || sha(keys[0]) !== proposal.publicKeyMetadata[0].sha256 || /sb_secret_[A-Za-z0-9_-]{12,}|SUPABASE_SERVICE_ROLE_KEY/.test(oldText)) throw new Error('Public config classification mismatch');
const allowed = new Set(['PATH', 'SYSTEMROOT', 'WINDIR', 'COMSPEC', 'PATHEXT', 'TEMP', 'TMP', 'USERPROFILE', 'LOCALAPPDATA', 'APPDATA', 'PROGRAMFILES', 'PROGRAMFILES(X86)', 'COMMONPROGRAMFILES']);
const env = Object.fromEntries(Object.entries(process.env).filter(([key]) => allowed.has(key.toUpperCase())));
Object.assign(env, { CI: 'true', NODE_ENV: 'production', NO_UPDATE_NOTIFIER: '1', VITE_SUPABASE_URL: urls[0], VITE_SUPABASE_PUBLISHABLE_KEY: keys[0] });
const archive = path.join(tree, '.vercel/pilot-artifacts/web-common-v1');
const receiptPath = path.join(evidence, 'COMMON-WEB-v1.json');
const logPath = path.join(evidence, 'COMMON-WEB-v1.log');
if (existsSync(archive) || existsSync(receiptPath) || existsSync(logPath)) throw new Error('Existing web output/evidence; no automatic retry');
const steps = [
  { id: 'runtime', args: ['scripts/check-mobile-runtime.mjs'], timeout: 120000 },
  { id: 'catalog', args: ['scripts/check-reviewed-practice-catalog.mjs'], timeout: 120000 },
  { id: 'typescript', args: ['node_modules/typescript/bin/tsc'], timeout: 120000 },
  { id: 'vite-web', args: ['node_modules/vite/bin/vite.js', 'build', '--configLoader', 'runner'], timeout: 180000 },
  { id: 'sites-package', args: ['scripts/prepare-sites-build.mjs'], timeout: 120000 },
  { id: 'bundle-secret-scan', args: ['scripts/check-client-bundle-secrets.mjs', 'dist/client'], timeout: 120000 },
  { id: 'sites-fixtures', args: ['--test', 'tests/sites-worker.test.mjs'], timeout: 120000 },
];
const output = []; const results = []; let totalBytes = 0;
const redact = value => value.replace(/sb_(?:publishable|secret)_[A-Za-z0-9_-]+/g, '[REDACTED_KEY]').replace(/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g, '[REDACTED_JWT]').replace(/sk-[A-Za-z0-9_-]+/g, '[REDACTED_KEY]');
async function run(step) {
  const child = spawn(node, step.args, { cwd: tree, env, shell: false, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] });
  let closed = false, exited = false, timedOut = false, capped = false, cleanup;
  function stop(reason) {
    timedOut ||= reason === 'TIMEOUT'; capped ||= reason === 'OUTPUT_CAP';
    if (cleanup) return;
    cleanup = new Promise(resolve => {
      if (!child.pid || exited || closed) { resolve('PARENT_ALREADY_EXITED'); return; }
      const helper = spawn('C:/Windows/System32/taskkill.exe', ['/PID', String(child.pid), '/T', '/F'], { env, shell: false, windowsHide: true, stdio: 'ignore' });
      const timer = setTimeout(() => { helper.kill(); resolve('HELPER_TIMEOUT'); }, 8000);
      helper.once('close', code => { clearTimeout(timer); resolve(code === 0 ? 'OWNED_TREE_STOPPED' : 'HELPER_FAILED'); }); helper.once('error', () => { clearTimeout(timer); resolve('HELPER_ERROR'); });
    });
  }
  const capture = stream => chunk => { totalBytes += chunk.length; if (totalBytes <= 4 * 1024 * 1024) output.push(`[${step.id}/${stream}] ${redact(chunk.toString('utf8'))}`); else stop('OUTPUT_CAP'); };
  child.stdout.on('data', capture('stdout')); child.stderr.on('data', capture('stderr')); child.once('exit', () => { exited = true; });
  const deadline = setTimeout(() => stop('TIMEOUT'), step.timeout); let fallback;
  const outcome = await new Promise(resolve => { fallback = setTimeout(() => { child.stdout.destroy(); child.stderr.destroy(); child.unref(); resolve({ exitCode: null, closeUnverified: true }); }, step.timeout + 20000); child.once('error', () => resolve({ exitCode: null, spawnError: true })); child.once('close', exitCode => { closed = true; resolve({ exitCode }); }); });
  clearTimeout(deadline); clearTimeout(fallback); const cleanupResult = cleanup ? await cleanup : 'NORMAL_EXIT';
  const result = { id: step.id, executable: node, args: step.args, ...outcome, closed, timedOut, outputCapped: capped, cleanup: cleanupResult };
  results.push(result); if (result.exitCode !== 0 || !closed || timedOut || capped || result.spawnError) throw new Error(`Step stopped: ${step.id}`);
}
let error = null; let files = [];
const startedUtc = new Date().toISOString();
try {
  for (const step of steps) await run(step);
  const visit = (dir, relative = '') => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const rel = relative ? `${relative}/${entry.name}` : entry.name; const file = path.join(dir, entry.name);
      if (lstatSync(file).isSymbolicLink()) throw new Error('Symlink in built output');
      if (entry.isDirectory()) visit(file, rel); else {
        const bytes = readFileSync(file);
        if (/\.(?:js|html|json|css|txt|map)$/.test(rel) && /content\/yoga-library|canonicalAdapter|selectedSnapshot|mcy-playwright\.invalid|sb_publishable_mcy_playwright_fixture/.test(bytes.toString('utf8'))) throw new Error('Private canonical/fixture source marker in common output');
        files.push({ path: rel, sha256: sha(bytes), bytes: bytes.length });
      }
    }
  };
  visit(path.join(tree, 'dist'));
  verify(); mkdirSync(path.dirname(archive), { recursive: true }); cpSync(path.join(tree, 'dist'), archive, { recursive: true, errorOnExist: true, force: false });
} catch (cause) { error = cause instanceof Error ? cause.message : 'Unknown build failure'; }
let sourcePreserved = true; try { verify(); } catch { sourcePreserved = false; }
writeFileSync(logPath, output.join(''), { flag: 'wx' });
const result = { status: !error && sourcePreserved ? 'PASS_COMMON_WEB_ARTIFACT_ONLY' : 'FAIL_STOP_NO_AUTOMATIC_RETRY', startedUtc, endedUtc: new Date().toISOString(), cwd: tree, sourceFreezeSha256: freezeSha, publicConfigProposalSha256: publicProposalSha, publicTarget: urls[0], publicKeySha256: proposal.publicKeyMetadata[0].sha256, rawKeyLoggedOrEnvFileWritten: false, environmentPolicy: 'OS_ALLOWLIST_PLUS_EXACT_PUBLIC_STAGING_BUILD_CONFIG_NO_ENV_FILES', steps: results, error, sourcePreserved, outputCapBytes: 4194304, archive, files, liveRoleOrNativeOrDeploymentAcceptance: false, serverDeviceProviderCloudWriteCommitActions: 0 };
writeFileSync(receiptPath, `${JSON.stringify(result, null, 2)}\n`, { flag: 'wx' });
process.stdout.write(`${JSON.stringify({ status: result.status, receiptPath, logPath, fileCount: files.length, archive })}\n`); process.exitCode = result.status.startsWith('PASS') ? 0 : 1;
