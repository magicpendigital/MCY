const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto'), assert = require('node:assert/strict');
const root = path.resolve(__dirname, '../..'), file = path.join(__dirname, 'PLAN-INTAKE-FREEZE.json');
const hash = p => crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const expected = 'c9dd35f0bf9d70903f62d00ddae36a05ef5cb36d7c06fc9351791266fd23fe4c';
let pins = 0, links = 0;
function pin(p, h) { assert.equal(hash(p), h, p); pins++; }
pin(file, expected); const freeze = JSON.parse(fs.readFileSync(file, 'utf8'));
for (const i of [...freeze.files, ...freeze.baselinePins]) pin(path.resolve(root, i.path), i.sha256);
for (const name of ['TASK-INTAKE.vi.md', 'PLAN-CONSOLIDATED.vi.md']) {
  const text = fs.readFileSync(path.join(__dirname, name), 'utf8');
  assert(!text.includes('\uFFFD')); assert(text.endsWith('\n'));
  for (const link of text.matchAll(/\[[^\]]*\]\(([^\s)]+)\)/g)) {
    if (/^(?:https?:|#)/.test(link[1])) continue;
    assert(fs.existsSync(path.resolve(__dirname, link[1].split('#')[0])), link[1]); links++;
  }
}
assert.equal(links, 14); assert.equal(freeze.baselinePins.length, 23);
for (const i of freeze.files) pin(path.resolve(root, i.path), i.sha256); pin(file, expected);
const result = { status: 'PASS', exitCode: 0, executedAt: new Date().toISOString(), reviewer: '/root/step44_independent_qc', command: 'node analyse/ux-step4-5-2026-10-17/intake-qc-checks.cjs', manifestSha256: expected, rawBytePins: pins, baselinePins: 23, localLinks: links, appExecution: false, limit: 'Intake/documentation and baseline identity only; app implementation/final QC/root GO remain pending' };
fs.writeFileSync(path.join(__dirname, 'INTAKE-QC-CHECKS.json'), JSON.stringify(result, null, 2) + '\n'); console.log(JSON.stringify(result));
