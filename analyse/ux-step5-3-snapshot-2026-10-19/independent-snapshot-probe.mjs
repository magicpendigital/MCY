import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, '../..');
const oldRoot = path.join(repoRoot, '.vercel/ux-step5-3-20261018-v1');
const newRoot = path.join(repoRoot, '.vercel/ux-step5-3-rebind-20261019-v1');
const oldSnapshot = JSON.parse(await readFile(path.join(oldRoot, 'server/contentReview/selectedSnapshot.json'), 'utf8'));
const newSnapshot = JSON.parse(await readFile(path.join(newRoot, 'server/contentReview/selectedSnapshot.json'), 'utf8'));
const { createCanonicalAdapter } = await import(pathToFileURL(path.join(newRoot, 'server/contentReview/canonicalAdapter.mjs')).href);
const clone = value => structuredClone(value);

const changedPaths = new Set([
  'content/yoga-library/units/cobra/r1.json',
  'content/yoga-library/units/cobra-gentle/r1.json',
  'content/yoga-library/units/cow-face/r1.json',
  'content/yoga-library/units/downward-dog/r1.json',
  'content/yoga-library/units/high-lunge/r1.json',
  'content/yoga-library/units/three-legged-dog/r1.json',
  'content/yoga-library/units/warrior-ii/r1.json',
]);
assert.equal(oldSnapshot.schema, newSnapshot.schema);
assert.notEqual(oldSnapshot.capturedUtc, newSnapshot.capturedUtc);
const oldWithoutChanges = clone(oldSnapshot);
oldWithoutChanges.capturedUtc = newSnapshot.capturedUtc;
assert.equal(newSnapshot.units.length, 14);
for (let i = 0; i < newSnapshot.units.length; i += 1) {
  const current = newSnapshot.units[i];
  const previous = oldSnapshot.units[i];
  assert.equal(current.path, previous.path);
  if (changedPaths.has(current.path)) {
    assert.notEqual(current.sha256, previous.sha256);
    oldWithoutChanges.units[i].sha256 = current.sha256;
  }
}
assert.deepEqual(newSnapshot, oldWithoutChanges, 'only seven unit SHA pins and capturedUtc may differ');

const fresh = createCanonicalAdapter({ repoRoot, snapshot: newSnapshot });
const stale = createCanonicalAdapter({ repoRoot, snapshot: oldSnapshot });
const accepted = await fresh.listUnits();
assert.equal(accepted.length, 14);
let staleChanged = 0;
let staleMatched = 0;
for (const key of stale.selectedKeys) {
  try {
    await stale.verifyCurrent(key);
    staleMatched += 1;
  } catch (error) {
    assert.equal(error.code, 'SOURCE_CHANGED');
    staleChanged += 1;
  }
}
assert.equal(staleChanged, 7);
assert.equal(staleMatched, 7);
await assert.rejects(stale.listUnits(), { code: 'SOURCE_CHANGED' });

const wrongIdentity = clone(newSnapshot);
const first = wrongIdentity.units[0];
const priorId = first.id;
first.id = `${priorId}.wrong`;
for (const asset of wrongIdentity.assets) {
  if (asset.unitId === priorId) asset.unitId = first.id;
}
await assert.rejects(createCanonicalAdapter({ repoRoot, snapshot: wrongIdentity }).readUnit('u1'), { code: 'SOURCE_CHANGED' });

const wrongMime = clone(newSnapshot);
const firstAsset = wrongMime.assets.find(asset => asset.unitId === newSnapshot.units[0].id);
assert.ok(firstAsset);
firstAsset.mime = 'text/html';
await assert.rejects(createCanonicalAdapter({ repoRoot, snapshot: wrongMime }).readUnit('u1'), { code: 'SOURCE_CHANGED' });

const blocked = accepted.flatMap(record => record.unit.media
  .filter(media => media.status === 'identity_blocked')
  .map(media => ({ key: record.opaqueKey, id: media.id })))[0];
assert.ok(blocked);
await assert.rejects(fresh.readAsset(blocked.key, blocked.id), { code: 'MEDIA_UNAVAILABLE' });

process.stdout.write(`${JSON.stringify({
  status: 'PASS_INDEPENDENT_SNAPSHOT_BINDING',
  freshAccepted: accepted.length,
  staleChanged,
  staleMatched,
  staleListDenied: true,
  identityDenied: true,
  mimeDenied: true,
  blockedMediaDenied: true,
  payloadEmitted: false,
})}\n`);
