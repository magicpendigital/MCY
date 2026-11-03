import { createHash } from 'node:crypto';
import { constants } from 'node:fs';
import { lstat, open, realpath } from 'node:fs/promises';
import path from 'node:path';

const MAX_JSON_BYTES = 2_000_000;
const MAX_ASSET_BYTES = 12_000_000;
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
const fail = (code, message) => Object.assign(new Error(message), { code });
const inside = (child, parent) => child === parent || child.startsWith(`${parent}${path.sep}`);

async function readPinned(repoRoot, relative, expectedSha, maxBytes) {
  if (typeof relative !== 'string' || !relative.startsWith('content/yoga-library/') ||
      relative.includes('..') || relative.includes('\\') || path.isAbsolute(relative)) {
    throw fail('INVALID_INPUT', 'Selected path is outside the canonical package');
  }
  if (!/^[a-f0-9]{64}$/.test(expectedSha)) throw fail('INVALID_INPUT', 'Invalid selected hash');
  const repo = await realpath(repoRoot);
  const segments = relative.split('/');
  let cursor = repo;
  for (const segment of segments) {
    cursor = path.join(cursor, segment);
    if ((await lstat(cursor)).isSymbolicLink()) throw fail('FORBIDDEN', 'Selected path contains a symlink');
  }
  const root = await realpath(path.join(repo, 'content/yoga-library'));
  const absolute = path.join(repo, ...segments);
  const resolved = await realpath(absolute);
  if (!inside(resolved, root)) throw fail('FORBIDDEN', 'Canonical path escaped its root');
  const before = await lstat(absolute);
  if (before.isSymbolicLink() || !before.isFile() || before.size > maxBytes) {
    throw fail('INVALID_INPUT', 'Selected source is not a bounded regular file');
  }
  const handle = await open(absolute, constants.O_RDONLY);
  try {
    const actual = await handle.stat();
    if (!actual.isFile() || actual.size > maxBytes) throw fail('INVALID_INPUT', 'Selected file exceeds limit');
    const bytes = await handle.readFile();
    if (bytes.length > maxBytes || sha256(bytes) !== expectedSha ||
        (await realpath(absolute)) !== resolved) throw fail('SOURCE_CHANGED', 'Selected bytes changed');
    return bytes;
  } finally {
    await handle.close();
  }
}

function validateSnapshot(snapshot) {
  if (snapshot?.schema !== 'mcy.local-review.selected-snapshot.v1' ||
      !Array.isArray(snapshot.units) || snapshot.units.length !== 14 ||
      !Array.isArray(snapshot.assets) || snapshot.assets.length !== 55) {
    throw fail('INVALID_INPUT', 'Expected exact selected unit and asset counts');
  }
  if (snapshot.contract?.path !== 'content/yoga-library/contract.jsonschema' ||
      !/^[a-f0-9]{64}$/.test(snapshot.contract.sha256) ||
      snapshot.inventory?.path !== 'content/yoga-library/inventory.json' ||
      !/^[a-f0-9]{64}$/.test(snapshot.inventory.sha256)) {
    throw fail('INVALID_INPUT', 'Canonical contract and inventory pins required');
  }
  const unitKeys = new Set();
  const assetKeys = new Set();
  for (const unit of snapshot.units) {
    const key = `${unit.id}\0${unit.revision}\0${unit.locale}`;
    if (unitKeys.has(key)) throw fail('INVALID_INPUT', 'Duplicate selected unit');
    unitKeys.add(key);
  }
  for (const asset of snapshot.assets) {
    const key = `${asset.unitId}\0${asset.revision}\0${asset.locale}\0${asset.mediaId}`;
    if (assetKeys.has(key)) throw fail('INVALID_INPUT', 'Duplicate selected asset');
    assetKeys.add(key);
    if (!unitKeys.has(`${asset.unitId}\0${asset.revision}\0${asset.locale}`)) {
      throw fail('INVALID_INPUT', 'Asset references an unselected unit');
    }
  }
}

export function createCanonicalAdapter({ repoRoot, snapshot }) {
  validateSnapshot(snapshot);
  const unitByKey = new Map(snapshot.units.map((unit, i) => [`u${i + 1}`, unit]));
  const assetByComposite = new Map(snapshot.assets.map(asset => [
    `${asset.unitId}\0${asset.revision}\0${asset.locale}\0${asset.mediaId}`, asset,
  ]));

  async function inventory() {
    const contractBytes = await readPinned(repoRoot, snapshot.contract.path, snapshot.contract.sha256, MAX_JSON_BYTES);
    const contract = JSON.parse(contractBytes.toString('utf8'));
    if (contract.$id !== 'https://motchutyoga.local/contracts/yoga-draft-1') {
      throw fail('SOURCE_CHANGED', 'Canonical schema identity changed');
    }
    const bytes = await readPinned(repoRoot, snapshot.inventory.path, snapshot.inventory.sha256, MAX_JSON_BYTES);
    const value = JSON.parse(bytes.toString('utf8'));
    if (!Array.isArray(value.records) || value.records.length !== 38) {
      throw fail('SOURCE_CHANGED', 'Inventory is no longer the selected 38-source snapshot');
    }
    const keys = new Set();
    for (const record of value.records) {
      const key = `${record.courseId}\0${record.id}\0${record.youtubeId}`;
      if (keys.has(key)) throw fail('SOURCE_CHANGED', 'Duplicate inventory source key');
      keys.add(key);
    }
    return keys;
  }

  async function verifyUnitPin(selected) {
    await Promise.all([
      readPinned(repoRoot, snapshot.contract.path, snapshot.contract.sha256, MAX_JSON_BYTES),
      readPinned(repoRoot, snapshot.inventory.path, snapshot.inventory.sha256, MAX_JSON_BYTES),
      readPinned(repoRoot, selected.path, selected.sha256, MAX_JSON_BYTES),
    ]);
  }

  async function readUnit(opaqueKey) {
    const selected = unitByKey.get(opaqueKey);
    if (!selected) throw fail('NOT_FOUND', 'Unit is not selected');
    const sourceKeys = await inventory();
    const bytes = await readPinned(repoRoot, selected.path, selected.sha256, MAX_JSON_BYTES);
    const unit = JSON.parse(bytes.toString('utf8'));
    if (unit.schemaVersion !== 'mcy-yoga-draft-1' ||
        unit.id !== selected.id || unit.revision !== selected.revision || unit.locale !== selected.locale ||
        unit.learnerVisible !== false || unit.recommendationEligible !== false ||
        unit.publishStatus !== 'unpublished' || unit.practiceDurationSeconds !== null ||
        !Array.isArray(unit.steps) || !Array.isArray(unit.media) || !Array.isArray(unit.sourceRefs) ||
        typeof unit.title !== 'string' || !unit.title || typeof unit.shortTitle !== 'string' ||
        typeof unit.intro !== 'string' || typeof unit.audience !== 'string' ||
        typeof unit.stopGuidance !== 'string' ||
        !['learningObjectives', 'prerequisites', 'preparation'].every(name =>
          Array.isArray(unit[name]) && unit[name].every(value => typeof value === 'string')) ||
        !unit.review || !Array.isArray(unit.review.approvalRecords) ||
        unit.review.approvalRecords.length !== 0) {
      throw fail('SOURCE_CHANGED', 'Unit identity or unpublished contract changed');
    }
    for (const ref of unit.sourceRefs) {
      if (typeof ref.courseId !== 'string' || typeof ref.lessonId !== 'string' ||
          typeof ref.youtubeId !== 'string' || typeof ref.relation !== 'string' ||
          !sourceKeys.has(`${ref.courseId}\0${ref.lessonId}\0${ref.youtubeId}`) || ref.contentObserved !== false) {
        throw fail('SOURCE_CHANGED', 'Unit source reference is outside selected inventory');
      }
    }
    const ids = new Set();
    for (const media of unit.media) {
      if (typeof media.id !== 'string' || !media.id || ids.has(media.id) ||
          typeof media.alt !== 'string' || typeof media.caption !== 'string' ||
          (media.stepId != null && typeof media.stepId !== 'string')) {
        throw fail('SOURCE_CHANGED', 'Media structure or ID changed');
      }
      ids.add(media.id);
      const pin = assetByComposite.get(`${unit.id}\0${unit.revision}\0${unit.locale}\0${media.id}`);
      if (media.status === 'draft_present') {
        if (!pin || typeof media.path !== 'string' || pin.path !== `content/yoga-library/${media.path}` ||
            pin.sha256 !== media.sha256 || pin.mime !== media.mime || pin.mime !== 'image/png') {
          throw fail('SOURCE_CHANGED', 'Draft media no longer matches selected snapshot');
        }
      } else if (pin || !['identity_blocked', 'not_produced'].includes(media.status)) {
        throw fail('SOURCE_CHANGED', 'Blocked media status changed');
      }
    }
    const selectedAssetCount = snapshot.assets.filter(asset =>
      asset.unitId === unit.id && asset.revision === unit.revision && asset.locale === unit.locale).length;
    if (selectedAssetCount !== unit.media.filter(media => media.status === 'draft_present').length) {
      throw fail('SOURCE_CHANGED', 'Selected asset count changed');
    }
    for (const step of unit.steps) {
      if (typeof step.id !== 'string' || !Number.isInteger(step.order) ||
          !['title', 'body'].every(name => typeof step[name] === 'string') ||
          !['detail', 'entry', 'exit', 'alternative', 'stopCue'].every(name =>
            step[name] == null || typeof step[name] === 'string') ||
          !Array.isArray(step.mediaIds) || step.mediaIds.some(id => !ids.has(id))) {
        throw fail('SOURCE_CHANGED', 'Step references missing media');
      }
    }
    await verifyUnitPin(selected);
    return { opaqueKey, sourceHash: selected.sha256, unit };
  }

  async function listUnits() {
    const result = [];
    for (const key of unitByKey.keys()) result.push(await readUnit(key));
    // Bounded final recheck of all consumed pins; this is not an atomic filesystem snapshot.
    await Promise.all([...unitByKey.values()].map(verifyUnitPin));
    return result;
  }

  async function readAsset(opaqueKey, mediaId) {
    const { unit } = await readUnit(opaqueKey);
    const media = unit.media.find(entry => entry.id === mediaId);
    if (!media) throw fail('NOT_FOUND', 'Media is not selected');
    if (media.status !== 'draft_present') throw fail('MEDIA_UNAVAILABLE', 'Media is not yet produced');
    const pin = assetByComposite.get(`${unit.id}\0${unit.revision}\0${unit.locale}\0${media.id}`);
    const bytes = await readPinned(repoRoot, pin.path, pin.sha256, MAX_ASSET_BYTES);
    if (pin.mime !== 'image/png' ||
        !bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) {
      throw fail('SOURCE_CHANGED', 'Selected media MIME or signature changed');
    }
    const selected = unitByKey.get(opaqueKey);
    await Promise.all([
      verifyUnitPin(selected),
      readPinned(repoRoot, pin.path, pin.sha256, MAX_ASSET_BYTES),
    ]);
    return { bytes, mime: pin.mime, sourceHash: pin.sha256 };
  }

  async function verifyCurrent(opaqueKey, mediaId) {
    const selected = opaqueKey === undefined ? [...unitByKey.values()] : [unitByKey.get(opaqueKey)];
    if (selected.some(item => !item)) throw fail('NOT_FOUND', 'Unit is not selected');
    const checks = selected.map(verifyUnitPin);
    if (mediaId !== undefined) {
      const unit = selected[0];
      const pin = assetByComposite.get(`${unit.id}\0${unit.revision}\0${unit.locale}\0${mediaId}`);
      if (!pin) throw fail('MEDIA_UNAVAILABLE', 'Media is not selected');
      checks.push(readPinned(repoRoot, pin.path, pin.sha256, MAX_ASSET_BYTES));
    }
    await Promise.all(checks);
  }

  return { listUnits, readUnit, readAsset, verifyCurrent, selectedKeys: [...unitByKey.keys()] };
}
