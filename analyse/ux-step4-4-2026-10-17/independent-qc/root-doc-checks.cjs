const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto'), assert = require('node:assert/strict');
const root = path.resolve(__dirname, '../../..'), dir = path.dirname(__dirname), hash = f => crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
const read = f => JSON.parse(fs.readFileSync(f, 'utf8')); let pins = 0, links = 0;
function pin(file, expected) { assert.equal(hash(file), expected, file); pins++; }
const manifestPath = path.join(dir, 'ROOT-VERIFICATION-FREEZE.json');
pin(manifestPath, '287279527cb6a54f684bb0c328ec6b081562ed5d137d877c723f4bfd71bbd668');
const manifest = read(manifestPath);
for (const i of manifest.files) pin(i.path, i.sha256);
pin(path.join(dir, 'SOURCE-FREEZE.json'), manifest.sourceFreezeSha256);
pin(path.join(dir, 'APP-EVIDENCE-FREEZE.json'), manifest.evidenceFreezeSha256);
pin(path.join(dir, 'INDEPENDENT-APP-QC.vi.md'), manifest.independentAppQcSha256);
const source = read(path.join(dir, 'SOURCE-FREEZE.json')), evidence = read(path.join(dir, 'APP-EVIDENCE-FREEZE.json'));
for (const i of source.appInputs) pin(path.join(source.candidate, i.path), i.sha256);
for (const i of source.harnessAndIntake) pin(path.join(root, i.path), i.sha256);
for (const i of evidence.build) pin(path.join(source.candidate, i.path), i.sha256);
for (const i of [...evidence.evidence, ...evidence.screenshots]) pin(path.join(root, i.path), i.sha256);
for (const file of ['ROOT-VERIFICATION.vi.md', 'CURRENT-STATUS.vi.md']) {
  const text = fs.readFileSync(path.join(dir, file), 'utf8');
  for (const link of text.matchAll(/\[[^\]]*\]\(([^\s)]+)\)/g)) {
    if (/^(?:https?:|#)/.test(link[1])) continue;
    assert(fs.existsSync(path.resolve(dir, link[1].split('#')[0])), link[1]); links++;
  }
}
assert.equal(links, 20); assert.equal(manifest.files.length, 12);
for (const i of manifest.files) pin(i.path, i.sha256);
const result = { status: 'PASS', exitCode: 0, command: 'node analyse/ux-step4-4-2026-10-17/independent-qc/root-doc-checks.cjs', executedAt: new Date().toISOString(), rootDocFreezeSha256: hash(manifestPath), rawBytePins: pins, localLinks: links, rootDocFiles: 12, limits: 'Static documentation/final pin review only; no app suites rerun; root manual actions remain attributed to root; source/evidence/review bytes unchanged' };
fs.writeFileSync(path.join(__dirname, 'root-doc-checks.json'), JSON.stringify(result, null, 2) + '\n'); console.log(JSON.stringify(result));
