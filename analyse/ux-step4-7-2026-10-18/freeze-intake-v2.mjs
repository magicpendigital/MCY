import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '../..');
const sha = path => createHash('sha256').update(readFileSync(path)).digest('hex');
const prior = join(import.meta.dirname, 'INTAKE-FREEZE-v1.json');
const priorFreeze = JSON.parse(readFileSync(prior, 'utf8'));
for (const file of priorFreeze.files) {
  if (sha(join(root, file.path)) !== file.sha256) throw Error('Prior intake freeze drift: ' + file.path);
}
const paths = [
  'analyse/ux-step4-7-2026-10-18/TASK-INTAKE-v2.vi.md',
  'analyse/ux-step4-7-2026-10-18/TEST-SELECTION-v2.vi.md',
  'analyse/ux-step4-7-2026-10-18/capture-visual-baseline-v2.mjs',
  'analyse/ux-step4-7-2026-10-18/freeze-intake-v2.mjs',
  'analyse/ux-step4-7-2026-10-18/BASELINE-PINS-v2.json',
];
const output = join(import.meta.dirname, 'INTAKE-FREEZE-v2.json');
if (existsSync(output)) throw Error('Intake v2 freeze already exists; never overwrite');
const baseline = JSON.parse(readFileSync(join(import.meta.dirname, 'BASELINE-PINS-v2.json')));
if (baseline.app.some(x => !x.match) || baseline.harness.some(x => !x.match) || baseline.approvedApp.some(x => !x.match)) {
  throw Error('Baseline pin failure');
}
const result = {
  createdAt: new Date().toISOString(),
  state: 'PREPARED_FOR_INDEPENDENT_INTAKE_QC; NO_APP_OR_BROWSER_INVOCATION',
  previousIntakeFreezeSha256: sha(prior),
  files: paths.map(path => ({ path, sha256: sha(join(root, path)) })),
  accepted46SourceFreezeSha256: baseline.sourceManifestSha256,
  approved45SourceFreezeSha256: baseline.approvedManifestSha256,
  candidate47Exists: existsSync(join(root, '.vercel/ux-step4-7-20261018')),
  boundary: 'Supersedes v1 intake/helper only. No app candidate, browser, protected runtime, native or live action.',
};
if (result.candidate47Exists) throw Error('4.7 candidate exists before GO');
writeFileSync(output, JSON.stringify(result, null, 2) + '\n', { flag: 'wx' });
console.log(JSON.stringify({ output: 'analyse/ux-step4-7-2026-10-18/INTAKE-FREEZE-v2.json', sha256: sha(output), files: result.files.length, previous: result.previousIntakeFreezeSha256 }));
