import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, mkdtemp, mkdir, copyFile, symlink, rm } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { createCanonicalAdapter } from './canonicalAdapter.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, '../../../..');
const snapshot = JSON.parse(await readFile(path.join(here, 'selectedSnapshot.json'), 'utf8'));
const clone = value => structuredClone(value);

test('selected 14 canonical structures and 55 actual image buffers remain exact and unpublished', async () => {
  const adapter = createCanonicalAdapter({ repoRoot, snapshot });
  const units = await adapter.listUnits();
  assert.equal(units.length, 14);
  assert.equal(new Set(units.map(x => `${x.unit.id}\0${x.unit.revision}\0${x.unit.locale}`)).size, 14);
  assert.ok(units.every(x => x.unit.learnerVisible === false && x.unit.recommendationEligible === false));
  let available = 0;
  let blocked = 0;
  for (const record of units) {
    for (const media of record.unit.media) {
      if (media.status === 'draft_present') {
        const image = await adapter.readAsset(record.opaqueKey, media.id);
        assert.equal(image.mime, 'image/png');
        assert.ok(image.bytes.length > 8);
        available += 1;
      } else {
        await assert.rejects(adapter.readAsset(record.opaqueKey, media.id), { code: 'MEDIA_UNAVAILABLE' });
        blocked += 1;
      }
    }
  }
  assert.equal(available, 55);
  assert.equal(blocked, 25);
});

test('canonical selection rejects duplicate identities, path traversal, changed unit and changed schema pin', async () => {
  const duplicate = clone(snapshot);
  duplicate.units[1].id = duplicate.units[0].id;
  duplicate.units[1].revision = duplicate.units[0].revision;
  duplicate.units[1].locale = duplicate.units[0].locale;
  assert.throws(() => createCanonicalAdapter({ repoRoot, snapshot: duplicate }), { code: 'INVALID_INPUT' });
  const traversal = clone(snapshot);
  traversal.units[0].path = 'content/yoga-library/../AGENTS.md';
  await assert.rejects(createCanonicalAdapter({ repoRoot, snapshot: traversal }).readUnit('u1'), { code: 'INVALID_INPUT' });
  const changedUnit = clone(snapshot);
  changedUnit.units[0].sha256 = '0'.repeat(64);
  await assert.rejects(createCanonicalAdapter({ repoRoot, snapshot: changedUnit }).readUnit('u1'), { code: 'SOURCE_CHANGED' });
  const wrongRevision = clone(snapshot);
  wrongRevision.units[0].revision = 'r999';
  await assert.rejects(createCanonicalAdapter({ repoRoot, snapshot: wrongRevision }).readUnit('u1'), { code: 'SOURCE_CHANGED' });
  const wrongMime = clone(snapshot);
  wrongMime.assets.find(x => x.unitId === snapshot.units[0].id).mime = 'text/html';
  await assert.rejects(createCanonicalAdapter({ repoRoot, snapshot: wrongMime }).readUnit('u1'), { code: 'SOURCE_CHANGED' });
  const missingAsset = clone(snapshot);
  missingAsset.assets.find(x => x.unitId === snapshot.units[0].id).path += '.missing';
  await assert.rejects(createCanonicalAdapter({ repoRoot, snapshot: missingAsset }).readUnit('u1'), { code: 'SOURCE_CHANGED' });
  const changedSchema = clone(snapshot);
  changedSchema.contract.sha256 = '0'.repeat(64);
  await assert.rejects(createCanonicalAdapter({ repoRoot, snapshot: changedSchema }).readUnit('u1'), { code: 'SOURCE_CHANGED' });
});

test('ancestor symlink to exact bytes still cannot escape selected canonical root', async t => {
  const temporary = await mkdtemp(path.join(os.tmpdir(), 'mcy-review-ancestor-'));
  try {
    const root = path.join(temporary, 'content/yoga-library');
    await mkdir(path.join(root, 'units'), { recursive: true });
    await copyFile(path.join(repoRoot, snapshot.contract.path), path.join(root, 'contract.jsonschema'));
    await copyFile(path.join(repoRoot, snapshot.inventory.path), path.join(root, 'inventory.json'));
    const original = snapshot.units[0];
    const folder = path.dirname(original.path).split('/').at(-1);
    try {
      await symlink(path.join(repoRoot, path.dirname(original.path)), path.join(root, 'units', folder), 'junction');
    } catch (error) {
      if (['EPERM', 'EACCES', 'ENOTSUP'].includes(error.code)) return t.skip('Host disallows local symlink fixture');
      throw error;
    }
    await assert.rejects(createCanonicalAdapter({ repoRoot: temporary, snapshot }).readUnit('u1'), { code: 'FORBIDDEN' });
  } finally {
    await rm(temporary, { recursive: true, force: true });
  }
});
