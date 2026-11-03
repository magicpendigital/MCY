import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { resolve, join, isAbsolute } from 'node:path';

const root = resolve(import.meta.dirname, '../..');
const here = import.meta.dirname;
const hash = path => createHash('sha256').update(readFileSync(path)).digest('hex');
const relative = 'analyse/ux-step4-6-2026-10-18/SOURCE-FREEZE-v1.json';
const manifestPath = join(root, relative);
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
const candidate = join(root, manifest.candidate);
const check = (base, records) => records.map(({ path, sha256 }) => {
  const file = join(base, path);
  const actual = existsSync(file) ? hash(file) : null;
  return { path, expectedSha256: sha256, actualSha256: actual, match: actual === sha256 };
});
const app = check(candidate, manifest.appInputs);
const harness = check(root, manifest.harnessAndIntake);
const approvedPath = join(root, manifest.approvedSourceManifest);
const approvedManifest = JSON.parse(readFileSync(approvedPath, 'utf8'));
const approvedCandidate = isAbsolute(approvedManifest.candidate) ? approvedManifest.candidate : join(root, approvedManifest.candidate);
const approvedApp = check(approvedCandidate, approvedManifest.appInputs);
const rootPreimages = manifest.appInputs.map(({ path }) => {
  const file = join(root, path);
  return { path, exists: existsSync(file), sha256: existsSync(file) ? hash(file) : null };
});
const trackedStatus = execFileSync('git', ['status', '--porcelain=v1', '-uno'], { cwd: root, encoding: 'utf8' });
const result = {
  recordedAt: new Date().toISOString(),
  sourceManifest: relative,
  sourceManifestSha256: hash(manifestPath),
  sourceManifestExpectedSha256: '01d45905ff401b6e127bac0bbafff03d3c66934e064f0711fcaf10deddb8db45',
  approvedManifest: manifest.approvedSourceManifest,
  approvedManifestSha256: hash(approvedPath),
  approvedManifestExpectedSha256: manifest.approvedSourceManifestSha256,
  counts: {
    candidateAppInputs: app.length,
    candidateAppMatches: app.filter(x => x.match).length,
    originalHarnessInputs: harness.length,
    originalHarnessMatches: harness.filter(x => x.match).length,
    approved45AppInputs: approvedApp.length,
    approved45AppMatches: approvedApp.filter(x => x.match).length,
    rootExistingPreimages: rootPreimages.filter(x => x.exists).length,
    rootMissingPreimages: rootPreimages.filter(x => !x.exists).length,
    trackedDirtyPaths: trackedStatus.trim() ? trackedStatus.trimEnd().split(/\r?\n/).length : 0,
  },
  trackedDirtyStatus: trackedStatus,
  app,
  harness,
  approvedApp,
  rootPreimages,
  scope: 'Read-only SHA-256 and tracked dirty status. No file contents, environment, credential, native, or network access.',
};
writeFileSync(join(here, 'BASELINE-PINS-v2.json'), JSON.stringify(result, null, 2) + '\n');
const valid = result.sourceManifestSha256 === result.sourceManifestExpectedSha256 &&
  result.approvedManifestSha256 === result.approvedManifestExpectedSha256 &&
  app.every(x => x.match) && harness.every(x => x.match) && approvedApp.every(x => x.match);
console.log(JSON.stringify({ valid, counts: result.counts, sourceManifestSha256: result.sourceManifestSha256, approvedManifestSha256: result.approvedManifestSha256 }));
if (!valid) process.exitCode = 1;
