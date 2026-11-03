const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto'), assert = require('node:assert/strict');
const root = path.resolve(__dirname, '../../..'), dir = path.dirname(__dirname);
const hash = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const read = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const checks = [];
function pin(file, expected, scope) { assert.equal(hash(file), expected, file); checks.push({ scope, path: path.relative(root, file).replaceAll('\\', '/'), sha256: expected }); }
const sourcePath = path.join(dir, 'SOURCE-FREEZE.json'), evidencePath = path.join(dir, 'APP-EVIDENCE-FREEZE.json');
pin(sourcePath, 'f11a6af114f42427cd6d758f5ac191d0af65324d5018e82524adf913fde7e243', 'source manifest');
pin(evidencePath, 'ea5e3fd5bd8f2efb7270d97c74058c909251f47d7f9857b770f0384d8f1455d6', 'final evidence manifest');
const source = read(sourcePath), evidence = read(evidencePath), baseline = read(path.join(dir, 'app-baseline.json'));
for (const i of source.appInputs) pin(path.join(source.candidate, i.path), i.sha256, 'candidate');
for (const i of source.harnessAndIntake) pin(path.join(root, i.path), i.sha256, 'harness/intake');
for (const i of [...evidence.evidence, ...evidence.screenshots]) pin(path.join(root, i.path), i.sha256, 'final evidence');
for (const i of evidence.build) pin(path.join(source.candidate, i.path), i.sha256, 'build artifact');
for (const i of baseline.inputs) {
  pin(path.join(baseline.source, i.path), i.sourceSha256, 'unchanged approved4.3');
  if (i.rootSha256) pin(path.join(root, i.path), i.rootSha256, 'unchanged root');
}
const probe = read(path.join(__dirname, 'probe-results.json'));
assert.equal(probe.status, 'PASS'); assert.equal(probe.cases.length, 7); assert(probe.cases.every(c => c.status === 'PASS')); assert.equal(probe.beforeAfterSourcePinsMatch, true);
assert(evidence.checks.every(c => c.exitCode === 0));
const expected = { focused: 15, mapped: 11, adjacent: 69 };
for (const s of evidence.suites) { assert.equal(s.command.exitCode, 0); assert.equal(s.stats.expected, expected[s.name]); for (const k of ['unexpected', 'flaky', 'skipped']) assert.equal(s.stats[k], 0); }
assert.equal(source.appInputs.length, 234); assert.equal(source.harnessAndIntake.length, 16); assert.equal(evidence.build.length, 59);
assert.deepEqual(source.changed.map(i => i.path).sort(), ['src/courses/CourseDetailScreen.tsx', 'src/prototype.css', 'tests/learner-ux.spec.ts'].sort());
assert.equal(source.addition.path, 'tests/ux-course-detail.spec.ts');
const output = { status: 'PASS', exitCode: 0, executedAt: new Date().toISOString(), command: 'node analyse/ux-step4-4-2026-10-17/independent-qc/final-pins.cjs', rawBytePins: checks.length, checks, summaries: { baselineCommands: 7, focused: 15, mapped: 11, adjacent: 69, independent: 7, appInputs: 234, harnessAndIntake: 16, buildFiles: 59, approved43Preserved: 233, existingRootPreserved: 228 }, harnessSha256: hash(__filename), limits: 'No app implementation change or test rerun here; final independent raw-byte pin and completed-receipt check; root final verification remains pending' };
fs.writeFileSync(path.join(__dirname, 'final-pins.json'), JSON.stringify(output, null, 2) + '\n'); console.log(JSON.stringify({ status: output.status, rawBytePins: checks.length, summaries: output.summaries }));
