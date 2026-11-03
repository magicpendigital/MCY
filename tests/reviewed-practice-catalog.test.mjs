import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import test from 'node:test';
import { contentVersion, verifyCatalog, verifyReviewCandidates } from '../scripts/check-reviewed-practice-catalog.mjs';
import { SESSION } from './fixtures/practice-harness.mjs';
const bytes = Buffer.from('fictional image bytes for offline approval binding');
const fixture = () => {
  const session = structuredClone(SESSION); session.review.evidenceRef = 'docs/content-review/fictional.json';
  session.version = contentVersion(session, { [session.sections[0].image]: createHash('sha256').update(bytes).digest('hex') });
  const evidence = { sessionId: session.id, contentVersion: session.version, reviewerLabel: session.review.reviewerLabel, expertApproved: true, rightsApproved: true, reviewBasis: 'Fictional offline fixture only', expertQualification: 'Not a real expert approval' };
  return { session, evidence, io: { asset: async () => bytes, evidence: async () => evidence } };
};
test('empty catalog remains a valid closed state; exact fictional content/asset approval binds its version', async () => {
  assert.deepEqual(await verifyCatalog([], {}), { reviewedSessions: 0, readyForRecommendations: false });
  const f = fixture(); assert.deepEqual(await verifyCatalog([f.session], f.io), { reviewedSessions: 1, readyForRecommendations: true });
});
test('modified text or media cannot retain an old approval/version', async () => {
  const f = fixture(); await assert.rejects(verifyCatalog([{ ...f.session, title: 'Changed after approval' }], f.io), /mismatch/);
  await assert.rejects(verifyCatalog([f.session], { ...f.io, asset: async () => Buffer.from('changed image') }), /mismatch/);
});
test('missing expert/rights approval, stale evidence, duplicate entries and missing files fail closed', async () => {
  for (const patch of [{ expertApproved: false }, { rightsApproved: false }, { contentVersion: 'b'.repeat(64) }, { expertQualification: '' }, { expertQualification: '   ' }, { reviewBasis: '   ' }]) { const f = fixture(); Object.assign(f.evidence, patch); await assert.rejects(verifyCatalog([f.session], f.io)); }
  const f = fixture(); await assert.rejects(verifyCatalog([f.session, f.session], f.io), /duplicate/);
  await assert.rejects(verifyCatalog([f.session], { ...f.io, asset: async () => { throw new Error('File unavailable'); } }), /unavailable/);
});
test('draft review version binds text, scope and media without creating approval evidence', async () => {
  const draft = {id:'fictional-review',scope:'learning_intro',title:'Fictional candidate',status:'draft',sections:[{id:'intro',image:'/assets/practice/fictional.png',text:'Fixture only'}]};
  draft.version = contentVersion(draft, {'/assets/practice/fictional.png':createHash('sha256').update(bytes).digest('hex')});
  const io = {asset:async()=>bytes};
  assert.deepEqual(await verifyReviewCandidates([draft],io), {reviewCandidates:1});
  for (const patch of [{title:'Changed'}, {scope:'practice_session'}, {sections:[{...draft.sections[0],text:'Changed'}]}]) await assert.rejects(verifyReviewCandidates([{...draft,...patch}],io),/mismatch/);
  await assert.rejects(verifyReviewCandidates([draft],{asset:async()=>Buffer.from('changed asset')}),/mismatch/);
  await assert.rejects(verifyReviewCandidates([draft,draft],io),/Invalid/);
});
