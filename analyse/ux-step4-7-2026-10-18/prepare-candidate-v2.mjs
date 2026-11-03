import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '../..');
const source = path.join(root, '.vercel/ux-step4-7-20261018');
const target = path.join(root, '.vercel/ux-step4-7-20261018-v2');
const freezePath = path.join(import.meta.dirname, 'CANDIDATE-SOURCE-FREEZE-v1.json');
const sha = file => createHash('sha256').update(fs.readFileSync(file)).digest('hex');
if (sha(freezePath) !== 'f2efb588b758f4e903573268acb2d39d188c1844dbf089c7b40f423384cd7d02') throw Error('Unexpected v1 candidate freeze');
const freeze = JSON.parse(fs.readFileSync(freezePath));
if (fs.existsSync(target)) throw Error('v2 candidate already exists; refusing overwrite');
if (freeze.candidate !== '.vercel/ux-step4-7-20261018' || freeze.appInputs.length !== 237) throw Error('Unexpected v1 candidate manifest');
for (const input of freeze.appInputs) {
  const from = path.resolve(source, input.path);
  if (!from.startsWith(source + path.sep) || sha(from) !== input.sha256) throw Error('v1 candidate input mismatch: ' + input.path);
}
fs.mkdirSync(target, { recursive: true });
for (const input of freeze.appInputs) {
  const from = path.resolve(source, input.path);
  const to = path.resolve(target, input.path);
  if (!to.startsWith(target + path.sep)) throw Error('Out-of-scope v2 target');
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.copyFileSync(from, to, fs.constants.COPYFILE_EXCL);
  if (sha(to) !== input.sha256) throw Error('v2 copy mismatch: ' + input.path);
}
console.log(JSON.stringify({source:freeze.candidate,target:path.relative(root,target).split(path.sep).join('/'),copied:freeze.appInputs.length,matched:freeze.appInputs.length,sourceFreezeSha256:sha(freezePath)}));
