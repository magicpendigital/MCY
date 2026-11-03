const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '../..');
const hash = relative => crypto.createHash('sha256').update(fs.readFileSync(path.resolve(root, relative))).digest('hex');
const read = relative => fs.readFileSync(path.resolve(root, relative), 'utf8');
const checks = [];
function check(name, condition, detail) {
  checks.push({ name, status: condition ? 'PASS' : 'FAIL', detail });
}
const manifests = [
  ['analyse/process-workflow-2026-10-17/source-freeze.json', 'f59ba2fd1fee43361c607f715d3348820acd950386b2d105f83feda909b6490e'],
  ['analyse/ux-step4-4-2026-10-17/PLAN-INTAKE-FREEZE.json', '647348c686f30f56d22bac547ac93c0e0c8414063967cfee57fe76c0a8e31750'],
];
const pinned = [];
for (const [file, expected] of manifests) {
  check(`manifest:${file}`, hash(file) === expected, expected);
  pinned.push({ path: file, sha256: expected });
  const manifest = JSON.parse(read(file));
  for (const input of [...manifest.files, ...(manifest.evidence || [])]) {
    check(`pin:${input.path}`, hash(input.path) === input.sha256, input.sha256);
    pinned.push(input);
  }
}
const sourcePins = [
  ['.vercel/ux-step4-3-20261016/src/Prototype.tsx', '4301656f5e45197b421a98d63d9da8898a699cbc608449ce51ce909bc0e84bee'],
  ['.vercel/ux-step4-3-20261016/src/prototype.css', '4a4a251b4ab64b5ea6b94813f24175d36fdbe3161b0a23bd1d5841027a5067a1'],
];
for (const [file, expected] of sourcePins) {
  check(`baseline:${file}`, hash(file) === expected, expected);
  pinned.push({ path: file, sha256: expected });
}
const preimage = JSON.parse(read('analyse/process-workflow-2026-10-17/pre-change.json'));
for (const input of preimage.files) check(`preimage:${input.path}`, hash(input.preimage) === input.sha256, input.sha256);
const agentBefore = read('analyse/process-workflow-2026-10-17/preimages/AGENTS.md');
const agentAfter = read('AGENTS.md');
const lifecyclePointer = '- Every MCY task follows the [task lifecycle]';
check('AGENTS narrow insertion', agentAfter.replace(/^\- Every MCY task follows the \[task lifecycle\][^\r\n]*\r?\n\r?\n/m, '') === agentBefore && agentAfter.includes(lifecyclePointer), 'All prior native/web and other dirty baseline text preserved byte-for-byte');
const skill = read('skills/mcy-change-review/SKILL.md');
const oldSkill = read('analyse/process-workflow-2026-10-17/preimages/skills/mcy-change-review/SKILL.md');
check('skill frontmatter unchanged', skill.match(/^---\r?\n[\s\S]*?\r?\n---/)[0] === oldSkill.match(/^---\r?\n[\s\S]*?\r?\n---/)[0], 'Narrow syntax fallback; not the unavailable PyYAML validator');
const docs = [
  'skills/mcy-change-review/SKILL.md', 'skills/mcy-change-review/references/review-matrix.md',
  '.github/pull_request_template.md', 'docs/quality/TASK_LIFECYCLE.md',
  'docs/quality/TASK_INTAKE.template.md', 'docs/quality/TASK_QC.template.md',
  'analyse/ux-step4-4-2026-10-17/PLAN-CONSOLIDATED.vi.md',
  'analyse/ux-step4-4-2026-10-17/TASK-INTAKE.vi.md',
];
let links = 0;
for (const file of docs) {
  const text = read(file);
  check(`format:${file}`, !text.includes('\uFFFD') && text.endsWith('\n') && (text.match(/^```/gm) || []).length % 2 === 0, 'UTF-8 replacement char absent, final newline, paired code fences');
  for (const link of text.matchAll(/\[[^\]]*\]\(([^\s)]+)\)/g)) {
    if (/^(?:https?:|#)/.test(link[1])) continue;
    const target = path.resolve(root, path.dirname(file), link[1].split('#')[0]);
    check(`link:${file}:${link[1]}`, fs.existsSync(target), 'Local link target exists');
    links += 1;
  }
}
for (const input of pinned) check(`final-pin:${input.path}`, hash(input.path) === input.sha256, 'Rechecked after all reads');
const result = {
  operation: 'mcy-task-workflow-and-step44-intake-independent-qc',
  executedAt: new Date().toISOString(), reviewer: '/root/step44_independent_qc', independentOfImplementers: true,
  command: 'node analyse/process-workflow-2026-10-17/independent-control-plan-checks.cjs',
  environment: 'Windows / Node / D:/Projects/MCY; local read-only checks; writes this QC evidence only',
  status: checks.every(x => x.status === 'PASS') ? 'PASS' : 'FAIL',
  exitCode: checks.every(x => x.status === 'PASS') ? 0 : 1, links, checks,
  harnessSha256: hash('analyse/process-workflow-2026-10-17/independent-control-plan-checks.cjs'),
  limits: ['No app execution, live/provider/native/media/release action', 'Full PyYAML skill validator remains BLOCKED as reported by implementer', 'Manual independent protocol walkthrough and semantic review recorded separately; not app test results', 'Root final verification remains pending'],
};
fs.writeFileSync(path.join(__dirname, 'independent-control-plan-checks.json'), JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify({ status: result.status, exitCode: result.exitCode, checkCount: checks.length, links, failures: checks.filter(x => x.status !== 'PASS') }));
process.exitCode = result.exitCode;
