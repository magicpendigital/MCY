import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '../..');
const source = path.join(root, '.vercel/ux-step4-6-20261018');
const target = path.join(root, '.vercel/ux-step4-7-20261018');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'analyse/ux-step4-6-2026-10-18/SOURCE-FREEZE-v1.json'), 'utf8'));
const sha = bytes => createHash('sha256').update(bytes).digest('hex');

if (fs.existsSync(target)) throw Error('4.7 candidate already exists; refusing overwrite');
if (manifest.candidate !== '.vercel/ux-step4-6-20261018' || manifest.appInputs.length !== 236) throw Error('Unexpected accepted 4.6 manifest');
for (const item of manifest.appInputs) {
  const rel = item.path.split('/').join(path.sep);
  const from = path.resolve(source, rel);
  if (!from.startsWith(source + path.sep)) throw Error('Out-of-scope source path');
  if (sha(fs.readFileSync(from)) !== item.sha256) throw Error(`Accepted 4.6 source mismatch: ${item.path}`);
}
fs.mkdirSync(target, { recursive: true });
for (const item of manifest.appInputs) {
  const rel = item.path.split('/').join(path.sep);
  const from = path.resolve(source, rel);
  const to = path.resolve(target, rel);
  if (!to.startsWith(target + path.sep)) throw Error('Out-of-scope target path');
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.copyFileSync(from, to, fs.constants.COPYFILE_EXCL);
  if (sha(fs.readFileSync(to)) !== item.sha256) throw Error(`Copy mismatch: ${item.path}`);
}
console.log(JSON.stringify({ baseline: manifest.candidate, candidate: path.relative(root, target).split(path.sep).join('/'), copied: manifest.appInputs.length, matched: manifest.appInputs.length, sourceManifestSha256: sha(fs.readFileSync(path.join(root, 'analyse/ux-step4-6-2026-10-18/SOURCE-FREEZE-v1.json'))) }));
