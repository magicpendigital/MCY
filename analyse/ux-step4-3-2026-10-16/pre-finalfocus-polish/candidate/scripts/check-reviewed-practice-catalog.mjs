import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { resolve, sep } from 'node:path';
import { pathToFileURL } from 'node:url';
import { isReviewedSession } from '../supabase/functions/_shared/practiceContract.ts';
import { reviewedPracticeCatalog } from '../supabase/functions/_shared/reviewedPracticeCatalog.ts';
import { contentReviewCandidates } from '../supabase/functions/_shared/contentReviewCandidates.ts';

const sha = value => createHash('sha256').update(value).digest('hex');
function canonical(value) {
  if (Array.isArray(value)) return value.map(canonical);
  return value && typeof value === 'object' ? Object.fromEntries(Object.keys(value).sort().map(key => [key, canonical(value[key])])) : value;
}
export function contentVersion(session, assetHashes) {
  const { version, ...content } = session;
  return sha(JSON.stringify(canonical({ content, assetHashes })));
}
export async function verifyReviewCandidates(candidates, io) {
  const ids = new Set();
  for (const candidate of candidates) {
    if (!candidate || !/^[a-z0-9_-]{1,80}$/.test(candidate.id) || ids.has(candidate.id) || !['learning_intro','practice_session'].includes(candidate.scope) || !Array.isArray(candidate.sections) || !candidate.sections.length) throw new Error('Invalid review candidate');
    ids.add(candidate.id);
    const assets = [...new Set(candidate.sections.flatMap(s => [s.image, ...(s.audio ? [s.audio] : [])]))].sort();
    const assetHashes = Object.fromEntries(await Promise.all(assets.map(async asset => {
      if (typeof asset !== 'string' || !/^\/assets\/practice\/[a-z0-9_./-]+$/.test(asset) || asset.split('/').includes('..')) throw new Error('Invalid review asset');
      return [asset, sha(await io.asset(asset))];
    })));
    if (candidate.version !== contentVersion(candidate, assetHashes)) throw new Error('Review candidate content or asset version mismatch');
  }
  return { reviewCandidates: ids.size };
}
export async function verifyCatalog(catalog, io, now = Date.now()) {
  const ids = new Set();
  for (const session of catalog) {
    if (!isReviewedSession(session, now) || ids.has(session.id)) throw new Error('Invalid or duplicate reviewed session');
    ids.add(session.id);
    if (!/^docs\/content-review\/[a-z0-9_-]+\.json$/.test(session.review.evidenceRef)) throw new Error('Missing content approval reference');
    const assets = [...new Set(session.sections.flatMap(s => [s.image, ...(s.audio ? [s.audio] : [])]))].sort();
    const assetHashes = Object.fromEntries(await Promise.all(assets.map(async asset => [asset, sha(await io.asset(asset))])));
    if (session.version !== contentVersion(session, assetHashes)) throw new Error('Content or asset version mismatch');
    const evidence = await io.evidence(session.review.evidenceRef);
    if (evidence.sessionId !== session.id || evidence.contentVersion !== session.version || evidence.reviewerLabel !== session.review.reviewerLabel || evidence.expertApproved !== true || evidence.rightsApproved !== true || typeof evidence.reviewBasis !== 'string' || !evidence.reviewBasis.trim() || typeof evidence.expertQualification !== 'string' || !evidence.expertQualification.trim()) throw new Error('Missing matching expert and rights approval');
  }
  return { reviewedSessions: ids.size, readyForRecommendations: ids.size > 0 };
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const root = resolve('.');
  const within = (path, folder) => { const target = resolve(root, path); const base = resolve(root, folder); if (!target.startsWith(`${base}${sep}`)) throw new Error('Invalid content path'); return target; };
  try {
    const io = {
      asset: asset => readFile(within(`public${asset}`, 'public/assets/practice')),
      evidence: async ref => JSON.parse(await readFile(within(ref, 'docs/content-review'), 'utf8')),
    };
    const result = await verifyCatalog(reviewedPracticeCatalog, io);
    const drafts = await verifyReviewCandidates(contentReviewCandidates, io);
    console.log(`Reviewed practice catalogue check passed (${result.reviewedSessions} sessions; ${result.readyForRecommendations ? 'content evidence present' : 'recommendations closed'}; ${drafts.reviewCandidates} version-bound review candidates).`);
  } catch { console.error('Reviewed practice catalogue check failed. Restore approved content/version/evidence before build.'); process.exitCode = 1; }
}
