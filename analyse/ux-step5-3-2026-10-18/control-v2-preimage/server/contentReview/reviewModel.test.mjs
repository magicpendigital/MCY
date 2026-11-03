import test from 'node:test';
import assert from 'node:assert/strict';
import { createReviewModel } from './reviewModel.mjs';

test('fictional lease is exact-version scoped; edit invalidates reviewer until reassigned', async () => {
  const model = createReviewModel({ mode: 'fictional_rehearsal' });
  const author = model.issueLease('fictional-author');
  const reviewer = model.issueLease('fictional-reviewer');
  const first = (await model.read(author.id, 'f1')).unit;
  assert.equal(first.reviewState, 'unreviewed');
  await assert.rejects(model.draft(reviewer.id, 'f1', {
    epoch: reviewer.epoch, sourceHash: first.sourceHash, revision: first.revision, title: 'Wrong actor',
  }), { code: 'FORBIDDEN' });
  const edited = (await model.draft(author.id, 'f1', {
    epoch: author.epoch, sourceHash: first.sourceHash, revision: first.revision, title: 'Neutral revised title',
  })).unit;
  assert.notEqual(edited.sourceHash, first.sourceHash);
  assert.notEqual(edited.revision, first.revision);
  await assert.rejects(model.read(reviewer.id, 'f1'), { code: 'FORBIDDEN' });
  model.reassignFixture('fictional-reviewer');
  await assert.rejects(model.review(reviewer.id, 'f1', {
    epoch: reviewer.epoch, sourceHash: first.sourceHash, revision: first.revision,
    decision: 'fixture_reviewed',
  }), { code: 'VERSION_CONFLICT' });
  const reviewed = (await model.review(reviewer.id, 'f1', {
    epoch: reviewer.epoch, sourceHash: edited.sourceHash, revision: edited.revision,
    decision: 'changes_requested',
  })).unit;
  assert.equal(reviewed.reviewState, 'changes_requested');
  model.close();
});

test('two simultaneous same-version draft requests commit at most once', async () => {
  const model = createReviewModel({ mode: 'fictional_rehearsal' });
  const actor = model.issueLease('fictional-author');
  const first = (await model.read(actor.id, 'f1')).unit;
  const body = { epoch: actor.epoch, sourceHash: first.sourceHash, revision: first.revision,
    title: 'One revised fixture title' };
  const outcomes = await Promise.allSettled([
    model.draft(actor.id, 'f1', body), model.draft(actor.id, 'f1', body),
  ]);
  assert.equal(outcomes.filter(x => x.status === 'fulfilled').length, 1);
  assert.equal(outcomes.filter(x => x.status === 'rejected' && x.reason.code === 'VERSION_CONFLICT').length, 1);
  assert.equal((await model.read(actor.id, 'f1')).unit.revision, 'f2');
  model.close();
});

test('revoke, expiry and stale epoch clear lease access and version-scoped notes', async () => {
  let current = 1000;
  const model = createReviewModel({ mode: 'fictional_rehearsal', now: () => current, leaseMs: 100 });
  const actor = model.issueLease('fictional-author');
  const unit = (await model.read(actor.id, 'f1')).unit;
  const noted = (await model.note(actor.id, 'f1', {
    epoch: actor.epoch, sourceHash: unit.sourceHash, revision: unit.revision, notes: 'Local fixture note',
  })).unit;
  assert.equal(noted.notes, 'Local fixture note');
  await assert.rejects(model.note(actor.id, 'f1', {
    epoch: 'old-epoch', sourceHash: unit.sourceHash, revision: unit.revision, notes: 'stale',
  }), { code: 'VERSION_CONFLICT' });
  model.revoke(actor.id);
  await assert.rejects(model.read(actor.id, 'f1'), { code: 'SESSION_REVOKED' });
  const newActor = model.issueLease('fictional-author');
  assert.equal((await model.read(newActor.id, 'f1')).unit.notes, null);
  current = 1100;
  await assert.rejects(model.read(newActor.id, 'f1'), { code: 'SESSION_EXPIRED' });
  model.close();
});

test('owner mode reads selected source but cannot draft or review; post-await revoke denies stale result', async () => {
  let release;
  const gate = new Promise(resolve => { release = resolve; });
  const record = { opaqueKey: 'u1', sourceHash: 'a'.repeat(64), unit: {
    id: 'fixture.owner.placeholder', revision: 'r1', locale: 'vi-VN', kind: 'reading',
    title: 'Only a test record', shortTitle: 'Test', intro: '', learningObjectives: [], audience: '',
    prerequisites: [], preparation: [], stopGuidance: '', steps: [], media: [], sourceRefs: [],
  } };
  const adapter = { async readUnit() { await gate; return record; }, async listUnits() { await gate; return [record]; } };
  const model = createReviewModel({ mode: 'owner_local_preview', adapter });
  const owner = model.issueLease('local-owner-machine');
  await assert.rejects(model.draft(owner.id, 'u1', {}), { code: 'FORBIDDEN' });
  await assert.rejects(model.review(owner.id, 'u1', {}), { code: 'FORBIDDEN' });
  const pending = model.read(owner.id, 'u1');
  model.revoke(owner.id);
  release();
  await assert.rejects(pending, { code: 'SESSION_REVOKED' });
  model.close();
});

test('delayed owner note cannot commit after revoke; final source verification rejects list and asset drift', async () => {
  let release;
  const gate = new Promise(resolve => { release = resolve; });
  let changed = false;
  const record = { opaqueKey: 'u1', sourceHash: 'b'.repeat(64), unit: {
    id: 'fixture.owner.placeholder', revision: 'r1', locale: 'vi-VN', kind: 'reading',
    title: 'Only a test record', shortTitle: 'Test', intro: '', learningObjectives: [], audience: '',
    prerequisites: [], preparation: [], stopGuidance: '', steps: [], media: [], sourceRefs: [],
  } };
  const adapter = {
    async readUnit() { await gate; return record; },
    async listUnits() { await gate; return [record]; },
    async readAsset() { await gate; return { bytes: Buffer.from('fixture'), mime: 'image/png' }; },
    async verifyCurrent() { if (changed) throw Object.assign(new Error('Changed'), { code: 'SOURCE_CHANGED' }); },
  };
  const model = createReviewModel({ mode: 'owner_local_preview', adapter });
  const owner = model.issueLease('local-owner-machine');
  const pending = model.note(owner.id, 'u1', {
    epoch: owner.epoch, sourceHash: record.sourceHash, revision: 'r1', notes: 'must not commit',
  });
  model.revoke(owner.id);
  release();
  await assert.rejects(pending, { code: 'SESSION_REVOKED' });
  const second = model.issueLease('local-owner-machine');
  assert.equal((await model.read(second.id, 'u1')).unit.notes, null);
  const listed = await model.list(second.id);
  assert.equal(listed.items.length, 1);
  const asset = await model.asset(second.id, 'u1', 'any');
  assert.equal(asset.bytes.toString(), 'fixture');
  changed = true;
  await assert.rejects(model.verifySource(), { code: 'SOURCE_CHANGED' });
  await assert.rejects(model.verifySource('u1', 'any'), { code: 'SOURCE_CHANGED' });
  model.close();
});
