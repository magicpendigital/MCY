// Preparatory R3 control: no invocation before independent QC/root native package GO.
import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { copyFileSync, existsSync, lstatSync, mkdirSync, readFileSync, readdirSync, realpathSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const tree = 'C:/Users/Admin/.codex/worktrees/pilot-web-android-20261021/MCY';
const evidence = 'D:/Projects/MCY/analyse/pilot-release-2026-10-21';
const node = 'C:/Program Files/nodejs/node.exe';
const freezeSha = '9e9c5c88d7721c4986bf61396dac9dd8a17586377c493971895e70ae77f9d256';
const publicProposalSha = '50f20a6735b8b925175f153b1eb7bd861bbb9901527dc8391d78568108911792';
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const fixedJson = (name, expected) => { const bytes = readFileSync(path.join(evidence, name)); if (sha(bytes) !== expected) throw new Error(`Changed control input: ${name}`); return JSON.parse(bytes); };
if (process.argv.length !== 3 || process.argv[2] !== '--root-approved-common-native') throw new Error('Explicit native package GO invocation only');
const freeze = fixedJson('SOURCE-FREEZE-v2.json', freezeSha);
const proposal = fixedJson('PUBLIC-CONFIG-REUSE-PROPOSAL-v2.json', publicProposalSha);
const nativeTools = fixedJson('NATIVE-TOOLCHAIN-v1.json', 'dfdc1414a08c4bf271eeb5e20cf070751fa0fe51670a1a418caea550381a3a30');
for (const pin of nativeTools.toolPins) if (sha(readFileSync(pin.path)) !== pin.sha256) throw new Error('Native tool changed');
for (const file of nativeTools.globalGradleConfigMustRemainAbsent) if (existsSync(file)) throw new Error('Unexpected Gradle user config; no read attempted');
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
const nativeWeb = path.join(tree, '.vercel/pilot-artifacts/native-web-v1');
const archive = path.join(tree, '.vercel/pilot-artifacts/native-common-v1');
const apk = path.join(tree, 'android/app/build/outputs/apk/parallel/app-parallel.apk');
const publicPath = path.join(tree, '.vercel/pilot-artifacts/native-public-v1');
const java = path.join(nativeTools.javaHome, 'bin/java.exe');
Object.assign(env, { JAVA_HOME: nativeTools.javaHome, ANDROID_HOME: nativeTools.sdkRoot, ANDROID_SDK_ROOT: nativeTools.sdkRoot, GRADLE_USER_HOME: nativeTools.gradleUserHome, VITE_NATIVE_AUTH_SCHEME: 'motchutyoga-mcydebug', MCY_CAPACITOR_WEB_DIR: nativeWeb });
const receiptPath = path.join(evidence, 'COMMON-NATIVE-v1.json');
const logPath = path.join(evidence, 'COMMON-NATIVE-v1.log');
if (existsSync(nativeWeb) || existsSync(archive) || existsSync(apk) || existsSync(publicPath) || existsSync(receiptPath) || existsSync(logPath)) throw new Error('Existing native output/evidence; no automatic retry');
const webReceipt = fixedJson('COMMON-WEB-v1.json', '682b13d0c525402bdc3a04e1530a76db1185a68650406741682183ae6e74906d');
if (webReceipt.status !== 'PASS_COMMON_WEB_ARTIFACT_ONLY' || webReceipt.sourceFreezeSha256 !== freezeSha) throw new Error('Common source web acceptance missing');
const steps = [
  { id: 'runtime', args: ['scripts/check-mobile-runtime.mjs'], timeout: 120000 },
  { id: 'catalog', args: ['scripts/check-reviewed-practice-catalog.mjs'], timeout: 120000 },
  { id: 'vite-native', args: ['node_modules/vite/bin/vite.js', 'build', '--configLoader', 'runner', '--outDir', nativeWeb], timeout: 180000 },
  { id: 'native-web-secret-scan', args: ['scripts/check-client-bundle-secrets.mjs', nativeWeb], timeout: 120000 },
  { id: 'capacitor-sync-android', args: ['node_modules/@capacitor/cli/bin/capacitor', 'sync', 'android'], timeout: 120000 },
  { id: 'cached-gradle-version', executable: java, args: ['-jar', nativeTools.gradleCliJar, '--offline', '--no-daemon', '--version'], timeout: 120000 },
  { id: 'assemble-parallel-offline', executable: java, args: ['-Duser.home=C:/Users/Admin', '-jar', nativeTools.gradleCliJar, '-p', path.join(tree, 'android'), '--offline', '--no-daemon', '-Dorg.gradle.vfs.watch=false', '-Pandroid.builder.sdkDownload=false', 'assembleParallel'], timeout: 600000 },
  { id: 'public-byte-inspection', executable: 'C:/Users/Admin/.cache/codex-runtimes/codex-primary-runtime/dependencies/native/powershell/pwsh.exe', args: ['-NoProfile', '-NonInteractive', '-File', path.join(evidence, 'inspect-native-public-v1.ps1')], timeout: 120000 },
  { id: 'packaged-public-secret-scan', args: ['scripts/check-client-bundle-secrets.mjs', publicPath], timeout: 120000 },
  { id: 'apk-badging', executable: path.join(nativeTools.sdkRoot, 'build-tools/36.1.0/aapt2.exe'), args: ['dump', 'badging', apk], timeout: 120000 },
  { id: 'apk-signature', executable: java, args: ['-jar', path.join(nativeTools.sdkRoot, 'build-tools/36.1.0/lib/apksigner.jar'), 'verify', '--print-certs', apk], timeout: 120000 },
];
const output = []; const results = []; let totalBytes = 0;
const redact = value => value.replace(/sb_(?:publishable|secret)_[A-Za-z0-9_-]+/g, '[REDACTED_KEY]').replace(/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g, '[REDACTED_JWT]').replace(/sk-[A-Za-z0-9_-]+/g, '[REDACTED_KEY]');
async function run(step) {
  const executable = step.executable ?? node;
  const child = spawn(executable, step.args, { cwd: tree, env, shell: false, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] });
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
  const result = { id: step.id, executable, args: step.args, ...outcome, closed, timedOut, outputCapped: capped, cleanup: cleanupResult };
  results.push(result); if (result.exitCode !== 0 || !closed || timedOut || capped || result.spawnError) throw new Error(`Step stopped: ${step.id}`);
}
let error = null; let files = [];
const startedUtc = new Date().toISOString();
try {
  for (const step of steps) await run(step);
  const allOutput = output.join('');
  if (!allOutput.includes('Gradle 8.14.3')) throw new Error('Cached Gradle version mismatch');
  if (!allOutput.includes("name='com.nilaza.motchutyoga.mcydebug'") || !allOutput.includes("versionCode='1'") || !allOutput.includes("versionName='1.0-mcydebug-pilot20261021'")) throw new Error('APK package/version badging mismatch');
  if (!allOutput.includes("application-label:'Một chút yoga (Pilot 21/10)'") || !allOutput.includes("application-label-en:'A Little Yoga (Pilot 21 Oct)'")) throw new Error('APK pilot labels missing');
  const certificate = allOutput.match(/certificate SHA-256 digest:\s*([a-fA-F0-9]{64})/);
  if (!certificate || certificate[1].toLowerCase() !== nativeTools.expectedCertificateSha256) throw new Error('APK signing certificate mismatch');
  const packaged = JSON.parse(readFileSync(path.join(evidence, 'NATIVE-PUBLIC-INVENTORY-v1.json'), 'utf8'));
  if (packaged.status !== 'PASS_NATIVE_PUBLIC_BYTE_PARITY_ONLY') throw new Error('Packaged public parity acceptance missing');
  for (const pin of packaged.files.filter(pin => /\.(?:js|html|json|css|txt|map)$/.test(pin.path))) {
    const text = readFileSync(path.join(publicPath, pin.path), 'utf8');
    if (/content\/yoga-library|canonicalAdapter|selectedSnapshot|mcy-playwright\.invalid|sb_publishable_mcy_playwright_fixture/.test(text)) throw new Error('Private canonical/fixture marker in APK public output');
  }
  const schemePresent = packaged.files.filter(pin => pin.path.endsWith('.js')).some(pin => readFileSync(path.join(publicPath, pin.path), 'utf8').includes('motchutyoga-mcydebug'));
  if (!schemePresent) throw new Error('Native auth scheme missing');
  verify(); mkdirSync(archive, { recursive: true });
  copyFileSync(apk, path.join(archive, 'app-parallel.apk')); copyFileSync(path.join(path.dirname(apk), 'output-metadata.json'), path.join(archive, 'output-metadata.json'));
  files = ['app-parallel.apk', 'output-metadata.json'].map(rel => { const bytes = readFileSync(path.join(archive, rel)); return { path: rel, sha256: sha(bytes), bytes: bytes.length }; });
} catch (cause) { error = cause instanceof Error ? cause.message : 'Unknown build failure'; }
let sourcePreserved = true; try { verify(); } catch { sourcePreserved = false; }
writeFileSync(logPath, output.join(''), { flag: 'wx' });
const result = { status: !error && sourcePreserved ? 'PASS_COMMON_NATIVE_PACKAGE_ONLY' : 'FAIL_STOP_NO_AUTOMATIC_RETRY', startedUtc, endedUtc: new Date().toISOString(), cwd: tree, sourceFreezeSha256: freezeSha, publicConfigProposalSha256: publicProposalSha, publicTarget: urls[0], publicKeySha256: proposal.publicKeyMetadata[0].sha256, rawKeyLoggedOrEnvFileWritten: false, environmentPolicy: 'OS_ALLOWLIST_PLUS_EXACT_PUBLIC_STAGING_CONFIG_AND_PINNED_SDK_JDK_GRADLE_PATHS_NO_ENV_FILES', steps: results, error, sourcePreserved, outputCapBytes: 4194304, archive, files, physicalNativeOrRestorationOrLiveRoleOrDeploymentAcceptance: false, serverDeviceProviderCloudWriteCommitActions: 0 };
writeFileSync(receiptPath, `${JSON.stringify(result, null, 2)}\n`, { flag: 'wx' });
process.stdout.write(`${JSON.stringify({ status: result.status, receiptPath, logPath, fileCount: files.length, archive })}\n`); process.exitCode = result.status.startsWith('PASS') ? 0 : 1;
