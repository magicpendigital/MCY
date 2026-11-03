import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
const dir = import.meta.dirname;
const root = path.resolve(dir, '../..');
const rel = 'analyse/ux-step4-7-2026-10-18/';
const sha = file => createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const names = new Set([
  'INDEPENDENT-APP-QC-v2.vi.md', 'INDEPENDENT-FINAL-PIN-CHECK-v2.json',
  'check-independent-final-v2.mjs', 'freeze-independent-evidence-v2.mjs',
  'CANDIDATE-SOURCE-FREEZE-v7.json', 'RESPONSIVE-HARNESS-FREEZE-v8.json',
  'INDEPENDENT-EXECUTION-FREEZE-v3.json', 'INDEPENDENT-EXECUTION-PREPARATION-v3.json',
  'FINAL-GATES-INPUT-FREEZE-v2.json', 'IMPLEMENTER-READABILITY-EVIDENCE-FREEZE-v2.json',
  'INDEPENDENT-APP-QC.vi.md', 'INDEPENDENT-QC-EVIDENCE-FREEZE-v1.json',
  'BASELINE-PINS-v2.json', 'INDEPENDENT-INTAKE-SOURCE-CHECK.json',
  'independent-final-v3-command.json', 'independent-final-v3.log',
]);
for (const freeze of ['RESPONSIVE-HARNESS-FREEZE-v8.json', 'INDEPENDENT-EXECUTION-FREEZE-v3.json', 'FINAL-GATES-INPUT-FREEZE-v2.json', 'IMPLEMENTER-READABILITY-EVIDENCE-FREEZE-v2.json']) {
  const data = JSON.parse(fs.readFileSync(path.join(dir, freeze)));
  for (const item of data.files) {
    assert.equal(sha(path.join(root, item.path)), item.sha256, item.path);
    names.add(path.relative(dir, path.join(root, item.path)));
  }
}
for (const name of fs.readdirSync(path.join(dir, 'independent-final-v3'))) {
  if (fs.statSync(path.join(dir, 'independent-final-v3', name)).isFile()) names.add('independent-final-v3/' + name);
}
const report = fs.readFileSync(path.join(dir, 'INDEPENDENT-APP-QC-v2.vi.md'), 'utf8');
const links = [...report.matchAll(/\]\(([^)]+)\)/g)].map(match => match[1]);
for (const link of links) assert(fs.existsSync(path.resolve(dir, link)), link);
const files = [...names].sort().map(name => ({ path: path.relative(root, path.resolve(dir, name)).replaceAll('\\', '/'), sha256: sha(path.resolve(dir, name)) }));
const result = { schema: 'mcy-independent-responsive-final-evidence-v2', recordedAt: new Date().toISOString(),
  status: 'PASS_INDEPENDENT_LOCAL_4_7_ROOT_DIRECT_PENDING',
  sourceFreezeSha256: '7614805ee74ccfa6fad506e26b8ad3dfebefec243620e4f42ab664068475bde1',
  executionFreezeSha256: 'c76b71f688b9573f5a5d3c4d8cd8c1103787832ac46edc9dd6ee2420685d85e8',
  ownCases: 5, ownChildAndWrapperExit: 0, workerCases: 23, workerChildAndWrapperExit: 0,
  finalGates: 7, finalGateExits: 0, reportLocalLinksChecked: links.length, files,
  boundary: 'Historical geometric-only QC is superseded by stronger whole-word local acceptance. Root direct/user presentation pending. No Auth/native/live/deploy/release clearance. Nested manifests bind source records; reference groups overlap.' };
const target = path.join(dir, 'INDEPENDENT-QC-EVIDENCE-FREEZE-v2.json');
fs.writeFileSync(target, JSON.stringify(result, null, 2) + '\n', { flag: 'wx' });
console.log(JSON.stringify({ status: result.status, evidenceRecords: files.length, reportLinks: links.length,
  freezeSha256: sha(target), reportSha256: sha(path.join(dir, 'INDEPENDENT-APP-QC-v2.vi.md')) }, null, 2));
