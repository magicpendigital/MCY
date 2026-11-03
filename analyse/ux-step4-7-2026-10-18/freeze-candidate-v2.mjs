import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const root = path.resolve(import.meta.dirname, '../..');
const previousPath = path.join(import.meta.dirname, 'CANDIDATE-SOURCE-FREEZE-v1.json');
const output = path.join(import.meta.dirname, 'CANDIDATE-SOURCE-FREEZE-v2.json');
const source = path.join(root, '.vercel/ux-step4-7-20261018');
const candidate = path.join(root, '.vercel/ux-step4-7-20261018-v2');
const sha = file => createHash('sha256').update(fs.readFileSync(file)).digest('hex');
assert.equal(sha(previousPath), 'f2efb588b758f4e903573268acb2d39d188c1844dbf089c7b40f423384cd7d02');
assert(!fs.existsSync(output));
const previous = JSON.parse(fs.readFileSync(previousPath));
const changed = [];
const appInputs = previous.appInputs.map(item => {
  assert.equal(sha(path.join(source, item.path)), item.sha256, item.path);
  const nextHash = sha(path.join(candidate, item.path));
  if (nextHash !== item.sha256) changed.push({ path: item.path, beforeSha256: item.sha256, afterSha256: nextHash });
  return { path: item.path, sha256: nextHash };
});
assert.deepEqual(changed.map(item => item.path), ['tests/ux-responsive.spec.ts']);
const result = { schema:'mcy-ux-step4-7-candidate-source-freeze-v2', recordedAt:new Date().toISOString(), candidate:'.vercel/ux-step4-7-20261018-v2', previousCandidate:previous.candidate, previousSourceFreezeSha256:sha(previousPath), approved46SourceManifestSha256:previous.approved46SourceManifestSha256, appInputs, changedFromV1:changed, boundary:'v2 preserves frozen v1, changing only new test geometry/readiness assertions; app source and existing tests identical to v1.' };
fs.writeFileSync(output, JSON.stringify(result, null, 2) + '\n', { flag:'wx' });
console.log(JSON.stringify({path:path.relative(root,output).split(path.sep).join('/'),sha256:sha(output),inputs:appInputs.length,changedFromV1:changed.length}));
