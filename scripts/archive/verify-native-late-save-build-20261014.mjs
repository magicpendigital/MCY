import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
// Read-only existing tooling dependency; does not enter the app or change its lockfile.
const toolingRequire = createRequire('C:/Users/Admin/AppData/Local/npm-cache/_npx/67eb4586ca667318/node_modules/vercel/package.json');
const { parse } = toolingRequire('acorn');
const sha = b => createHash('sha256').update(b).digest('hex');
const fileHash = p => sha(fs.readFileSync(p));
assert.equal(fileHash('src/Prototype.tsx'), '32c100fbcd7433f6db2c6c299556adb22633d5cd8ecd9da01ca5420515287482');
const native = JSON.parse(fs.readFileSync('analyse/MCY_NATIVE_LATE_SAVE_ARTIFACT_2026-10-14.json', 'utf8').replace(/^\uFEFF/, ''));
const web = JSON.parse(fs.readFileSync('analyse/MCY_NATIVE_LATE_SAVE_WEB_ARTIFACT_2026-10-14.json', 'utf8'));
assert.equal(fileHash(native.apkPath), native.apkSha256);
assert.equal(native.applicationId, 'com.nilaza.motchutyoga.mcydebug');
assert.equal(native.variant, 'parallel');
for (const a of native.assets) assert.equal(fileHash(path.join(native.extractedPublicPath, a.path)), a.sha256);
for (const a of web.files) assert.equal(fileHash(path.join(web.root, '.vercel/output', a.path)), a.sha256);
assert.equal(sha(JSON.stringify(web.files)), web.artifactSha256);
function inspect(base, entryPath) {
  const text = fs.readFileSync(path.join(base, entryPath), 'utf8');
  const tree = parse(text, { ecmaVersion: 'latest', sourceType: 'module' });
  const children = (n, visitor) => { for (const value of Object.values(n)) {
    if (Array.isArray(value)) value.forEach(x => { if (x?.type) visitor(x); });
    else if (value?.type) visitor(value);
  } };
  const candidates = [];
  function visit(n) {
    if (n.type === 'FunctionDeclaration' && n.params.length === 4 && n.body) {
      const body = text.slice(n.body.start, n.body.end);
      if (body.includes('.pendingCheckinPayload') && body.includes('.saveFeedbackConsent') && body.includes('.signedIn')) candidates.push(n);
    }
    children(n, visit);
  }
  visit(tree); assert.equal(candidates.length, 1, 'One compiled check-in writer adapter');
  const n = candidates[0], body = text.slice(n.body.start, n.body.end), predicate = n.params[3].name;
  const firstAwait = body.indexOf('await'); assert(firstAwait > 0);
  const escapedPredicate = predicate.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const occurrences = [...body.matchAll(new RegExp('(?<![\\w$])' + escapedPredicate + '\\(\\)', 'g'))].map(x => x.index);
  assert.equal(occurrences.length, 2); assert(occurrences[0] < firstAwait);
  assert(occurrences[1] > firstAwait && occurrences[1] < body.indexOf('.pendingCheckinPayload'));
  const callers = [];
  function calls(x) {
    if (x.type === 'CallExpression' && x.callee.type === 'Identifier' && x.callee.name === n.id.name && x.arguments.length >= 3) {
      const kind = x.arguments[2];
      const value = kind.type === 'Literal' ? kind.value
        : kind.type === 'TemplateLiteral' && kind.expressions.length === 0 ? kind.quasis[0].value.cooked : null;
      if (['standalone', 'practice_preparation'].includes(value)) {
        assert.equal(x.arguments.length, 4); callers.push(value);
      }
    }
    children(x, calls);
  }
  calls(tree); assert.deepEqual(callers.sort(), ['practice_preparation', 'practice_preparation', 'standalone']);
  assert(text.includes('https://mhumbczqrzutdnraafhs.supabase.co'));
  assert.equal((text.match(/sb_publishable_[A-Za-z0-9_-]+/g) || []).length, 1);
  return { entryPath, entrySha256: sha(text), writerBodySha256: sha(body), guardCalls: 2, callerCount: 3 };
}
const nativeEntry = native.assets.find(a => /^assets\/index-[A-Za-z0-9_-]+\.js$/.test(a.path));
const webEntry = web.files.find(a => /^static\/assets\/index-[A-Za-z0-9_-]+\.js$/.test(a.path));
assert(nativeEntry && webEntry);
const result = { kind: 'NativeLateSaveCompiledBuildVerification', status: 'PASS_COMPILED_ARTIFACT_SCOPE', capturedAt: new Date().toISOString(),
  sourceSha256: fileHash('src/Prototype.tsx'), apkSha256: native.apkSha256,
  parserVersion: toolingRequire('acorn/package.json').version, parserSha256: fileHash(toolingRequire.resolve('acorn')),
  native: inspect(native.extractedPublicPath, nativeEntry.path), web: inspect(path.join(web.root, '.vercel/output'), webEntry.path),
  nativeSchemePresent: fs.readFileSync(path.join(native.extractedPublicPath, nativeEntry.path), 'utf8').includes('motchutyoga-mcydebug'),
  physicalDeviceTested: false, installedOrDeployed: false };
assert(result.nativeSchemePresent);
fs.writeFileSync('analyse/MCY_NATIVE_LATE_SAVE_COMPILED_2026-10-14.json', JSON.stringify(result, null, 2) + '\n', { flag: 'wx' });
console.log(JSON.stringify({ status: result.status, nativeFiles: native.assets.length, webFiles: web.files.length, sourceSha256: result.sourceSha256 }));
