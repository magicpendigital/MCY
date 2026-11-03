import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const root = path.resolve(import.meta.dirname, '../..');
const source = path.join(root, '.vercel/ux-step4-6-20261018');
const candidate = path.join(root, '.vercel/ux-step4-7-20261018');
const baselinePath = path.join(root, 'analyse/ux-step4-6-2026-10-18/SOURCE-FREEZE-v1.json');
const output = path.join(import.meta.dirname, 'CANDIDATE-SOURCE-FREEZE-v1.json');
const sha = file => createHash('sha256').update(fs.readFileSync(file)).digest('hex');
assert.equal(sha(baselinePath), '01d45905ff401b6e127bac0bbafff03d3c66934e064f0711fcaf10deddb8db45');
assert(!fs.existsSync(output));
const baseline = JSON.parse(fs.readFileSync(baselinePath));
const changedExpected = new Set(['src/Prototype.tsx','src/prototype.css','tests/ux-profile.spec.ts','tests/practice-flow.spec.ts','tests/learner-write-review.spec.ts','tests/learner-device-acceptance.spec.ts','tests/learner-ux.spec.ts']);
const changed = [];
const appInputs = baseline.appInputs.map(item => {
  const oldHash = sha(path.join(source, item.path));
  assert.equal(oldHash, item.sha256, item.path);
  const newHash = sha(path.join(candidate, item.path));
  if (newHash !== oldHash) {
    assert(changedExpected.has(item.path), 'Unexpected changed candidate input ' + item.path);
    changed.push({ path: item.path, beforeSha256: oldHash, afterSha256: newHash });
  }
  return { path: item.path, sha256: newHash };
});
assert.deepEqual(changed.map(item => item.path).sort(), [...changedExpected].sort());
const addition = 'tests/ux-responsive.spec.ts';
assert(!baseline.appInputs.some(item => item.path === addition));
appInputs.push({ path: addition, sha256: sha(path.join(candidate, addition)) });
const result = {
  schema: 'mcy-ux-step4-7-candidate-source-freeze-v1',
  recordedAt: new Date().toISOString(),
  candidate: '.vercel/ux-step4-7-20261018',
  approved46SourceManifest: 'analyse/ux-step4-6-2026-10-18/SOURCE-FREEZE-v1.json',
  approved46SourceManifestSha256: sha(baselinePath),
  designFreezeSha256: sha(path.join(import.meta.dirname, 'SHARED-NAV-PROPOSAL-v2a-FREEZE.json')),
  appInputs,
  changedExisting: changed,
  addition,
  boundary: 'Isolated local responsive candidate only; no root/protected/native/backend/deploy changes.',
};
fs.writeFileSync(output, JSON.stringify(result, null, 2) + '\n', { flag: 'wx' });
console.log(JSON.stringify({ path: path.relative(root, output).split(path.sep).join('/'), sha256: sha(output), inputs: appInputs.length, changedExisting: changed.length, additions: 1 }));
