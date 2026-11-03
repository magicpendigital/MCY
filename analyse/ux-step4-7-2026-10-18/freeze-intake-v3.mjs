import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '../..');
const sha = path => createHash('sha256').update(readFileSync(path)).digest('hex');
const previousPath = join(import.meta.dirname, 'INTAKE-FREEZE-v2.json');
const previous = JSON.parse(readFileSync(previousPath, 'utf8'));
for (const file of previous.files) {
  if (sha(join(root, file.path)) !== file.sha256) throw Error('Prior intake v2 drift: ' + file.path);
}
const paths = [
  'analyse/ux-step4-7-2026-10-18/INTAKE-DELTA-v3.vi.md',
  'analyse/ux-step4-7-2026-10-18/capture-visual-baseline-v3.mjs',
  'analyse/ux-step4-7-2026-10-18/run-visual-baseline-v3.mjs',
  'analyse/ux-step4-7-2026-10-18/freeze-intake-v3.mjs',
];
const output = join(import.meta.dirname, 'INTAKE-FREEZE-v3.json');
if (existsSync(output)) throw Error('Intake v3 freeze already exists; never overwrite');
const result = {
  createdAt: new Date().toISOString(),
  state: 'PREPARED_FOR_INDEPENDENT_DELTA_QC; BASELINE_BROWSER_NOT_INVOKED',
  previousIntakeFreezeSha256: sha(previousPath),
  accepted46SourceFreezeSha256: previous.accepted46SourceFreezeSha256,
  approved45SourceFreezeSha256: previous.approved45SourceFreezeSha256,
  files: paths.map(path => ({ path, sha256: sha(join(root, path)) })),
  candidate47Exists: existsSync(join(root, '.vercel/ux-step4-7-20261018')),
  boundary: 'V3 is a fail-closed baseline helper/runner control delta; app candidate and browser await QC/root release.',
};
if (result.candidate47Exists) throw Error('4.7 candidate exists before GO');
writeFileSync(output, JSON.stringify(result, null, 2) + '\n', { flag: 'wx' });
console.log(JSON.stringify({ output: 'analyse/ux-step4-7-2026-10-18/INTAKE-FREEZE-v3.json', sha256: sha(output), files: result.files.length, previous: result.previousIntakeFreezeSha256 }));
