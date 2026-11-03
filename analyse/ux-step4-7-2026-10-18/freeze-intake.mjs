import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '../..');
const sha = path => createHash('sha256').update(readFileSync(path)).digest('hex');
const paths = [
  'analyse/ux-step4-7-2026-10-18/TASK-INTAKE.vi.md',
  'analyse/ux-step4-7-2026-10-18/TEST-SELECTION.vi.md',
  'analyse/ux-step4-7-2026-10-18/BASELINE-PINS-v1-invalid.json',
  'analyse/ux-step4-7-2026-10-18/BASELINE-PINS-v2.json',
  'analyse/ux-step4-7-2026-10-18/capture-baseline.mjs',
  'analyse/ux-step4-7-2026-10-18/capture-visual-baseline.mjs',
  'analyse/ux-step4-7-2026-10-18/freeze-intake.mjs',
];
const output = join(import.meta.dirname, 'INTAKE-FREEZE-v1.json');
if (existsSync(output)) throw Error('Intake freeze already exists; never overwrite');
const baseline = JSON.parse(readFileSync(join(import.meta.dirname, 'BASELINE-PINS-v2.json')));
if (baseline.sourceManifestSha256 !== baseline.sourceManifestExpectedSha256 ||
    baseline.approvedManifestSha256 !== baseline.approvedManifestExpectedSha256 ||
    baseline.app.some(x => !x.match) || baseline.harness.some(x => !x.match) ||
    baseline.approvedApp.some(x => !x.match)) throw Error('Baseline pins did not validate');
const result = {
  createdAt: new Date().toISOString(),
  state: 'PREPARED_FOR_INDEPENDENT_INTAKE_QC; NO_APP_OR_BROWSER_INVOCATION',
  files: paths.map(path => ({ path, sha256: sha(join(root, path)) })),
  accepted46SourceFreezeSha256: baseline.sourceManifestSha256,
  approved45SourceFreezeSha256: baseline.approvedManifestSha256,
  candidate47Exists: existsSync(join(root, '.vercel/ux-step4-7-20261018')),
  boundary: 'Only new analysis intake artifacts; 4.6 source/evidence/root checkout unchanged. Candidate/browser await independent QC and root GO.',
};
if (result.candidate47Exists) throw Error('4.7 candidate exists before GO');
writeFileSync(output, JSON.stringify(result, null, 2) + '\n', { flag: 'wx' });
console.log(JSON.stringify({ output: 'analyse/ux-step4-7-2026-10-18/INTAKE-FREEZE-v1.json', sha256: sha(output), files: result.files.length, candidate47Exists: false }));
