import { contentReviewCandidates } from "./contentReviewCandidates.ts";
import { readingUnitCandidates } from "./readingUnitCandidates.ts";
import type { OwnerControlPlaneDependencies } from "./ownerControlPlane.ts";
import { reviewChecks } from "./contentReviewContract.ts";

const actions = ["read_content_review", "read_reading_preview", "save_content_review", "assign_content_reviewer"];
// Private bucket holding the reviewed-draft reading images, addressed by the exact SHA-256 of each file.
const PREVIEW_BUCKET = "reading-preview";
const PREVIEW_URL_SECONDS = 900;
const sha = /^[a-f0-9]{64}$/;
const id = /^[a-z0-9_-]{1,80}$/;
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const plain = (v: unknown): v is Record<string, unknown> => Boolean(v && typeof v === "object" && !Array.isArray(v));
const text = (v: unknown, max: number) => typeof v === "string" && v.trim().length >= 10 && v.length <= max;
// Intro (client-visible) plus the server-only reading units; only the fixed metadata is sent to the database.
const allCandidates = [...contentReviewCandidates, ...readingUnitCandidates] as const;
const meta = (c: typeof allCandidates[number]) => ({ id: c.id, version: c.version, scope: c.scope, title: c.title });
type Result = { status: number; body: Record<string, unknown> };
export async function handleContentReview(payload: Record<string, unknown>, actor: string, server: ReturnType<OwnerControlPlaneDependencies["clients"]>["server"]): Promise<Result | null> {
  if (typeof payload.action !== "string" || !actions.includes(payload.action)) return null;
  const action = payload.action;
  const allowed = action === "read_content_review" ? ["action"] : action === "read_reading_preview" ? ["action", "candidateId"] : action === "save_content_review"
    ? ["action", "candidateId", "contentVersion", "expectedRevision", "decision", "qualification", "reviewBasis", "rightsBasis", "checklist"]
    : ["action", "candidateId", "contentVersion", "expectedRevision", "reviewerId", "active", "expiresInDays"];
  if (Object.keys(payload).some(k => !allowed.includes(k))) return { status: 400, body: { error: "invalid_request" } };
  const { data: queue, error: readError } = await server.rpc("mcy_content_review_read", { p_actor_id: actor, p_candidates: allCandidates.map(meta) });
  if (readError || !plain(queue) || !Array.isArray(queue.items) || typeof queue.can_assign !== "boolean") return { status: readError?.code === "42501" ? 403 : 503, body: { error: readError?.code === "42501" ? "content_review_access_required" : "content_review_not_ready" } };
  if (action === "read_content_review") {
    return { status: 200, body: { ...queue, candidates: allCandidates.filter(c => (queue.items as Record<string, unknown>[]).some(item => item.candidate_id === c.id && item.content_version === c.version)) } };
  }
  if (action === "read_reading_preview") return readingPreview(payload, queue.items as Record<string, unknown>[], server);
  const candidate = allCandidates.find(c => c.id === payload.candidateId && c.version === payload.contentVersion);
  if (!candidate || !id.test(candidate.id) || !Number.isInteger(payload.expectedRevision) || Number(payload.expectedRevision) < 0) return { status: 400, body: { error: "invalid_request" } };
  if (!(queue.items as Record<string, unknown>[]).some(item => item.candidate_id === candidate.id && item.content_version === candidate.version)) return { status: 403, body: { error: "content_review_access_required" } };
  let name: string;
  const args: Record<string, unknown> = { p_actor_id: actor, p_candidate: meta(candidate), p_expected_revision: payload.expectedRevision };
  if (action === "save_content_review") {
    if (typeof payload.decision !== "string" || !["approved", "changes_requested", "withdrawn"].includes(payload.decision) || !text(payload.qualification, 1000) || !text(payload.reviewBasis, 2000) || !text(payload.rightsBasis, 2000) || !plain(payload.checklist) || Object.keys(payload.checklist).sort().join() !== [...reviewChecks].sort().join() || reviewChecks.some(k => typeof (payload.checklist as Record<string, unknown>)[k] !== "boolean")) return { status: 400, body: { error: "invalid_review" } };
    name = "mcy_content_review_save";
    Object.assign(args, { p_decision: payload.decision, p_qualification: payload.qualification, p_review_basis: payload.reviewBasis, p_rights_basis: payload.rightsBasis, p_checklist: payload.checklist });
  } else {
    if (!queue.can_assign) return { status: 403, body: { error: "owner_access_required" } };
    if (typeof payload.reviewerId !== "string" || !uuid.test(payload.reviewerId) || typeof payload.active !== "boolean" || !Number.isInteger(payload.expiresInDays) || Number(payload.expiresInDays) < 1 || Number(payload.expiresInDays) > 30) return { status: 400, body: { error: "invalid_assignment" } };
    name = "mcy_content_reviewer_assign";
    Object.assign(args, { p_reviewer_id: payload.reviewerId, p_active: payload.active, p_expires_in_days: payload.expiresInDays });
  }
  const { data, error } = await server.rpc(name, args);
  if (error || !plain(data)) {
    const code = error?.code;
    return { status: code === "PT409" ? 409 : code === "42501" ? 403 : code === "PT429" ? 429 : code === "22023" ? 400 : 503, body: { error: code === "PT409" ? "content_review_conflict" : code === "42501" ? "content_review_access_required" : code === "PT429" ? "content_review_limit_reached" : code === "22023" ? "invalid_review" : "content_review_result_uncertain" } };
  }
  return { status: 200, body: { receipt: data, published: false, aiEnabled: false } };
}

type Admitted = { decision: string; revision: number };
const admitted = (items: Record<string, unknown>[], c: { id: string; version: string }): Admitted | null => {
  const found = items.find(i => i.candidate_id === c.id && i.content_version === c.version);
  const state = found && plain(found.state) ? found.state : null;
  return state ? { decision: typeof state.decision === "string" ? state.decision : "pending", revision: Number.isInteger(state.revision) ? Number(state.revision) : 0 } : null;
};
// Owner/assigned reviewer read model for the in-app Preview. Without candidateId it returns a light list (also the
// access probe); with candidateId it returns one unit plus short-lived signed image URLs. Nothing here publishes content.
async function readingPreview(payload: Record<string, unknown>, items: Record<string, unknown>[], server: ReturnType<OwnerControlPlaneDependencies["clients"]>["server"]): Promise<Result> {
  if (payload.candidateId === undefined) {
    const units = readingUnitCandidates.flatMap(c => {
      const state = admitted(items, c);
      return state ? [{ id: c.id, version: c.version, title: c.title, decision: state.decision, revision: state.revision, steps: c.unit.steps.length, images: { present: c.unit.media.filter(m => m.status === "draft_present").length, total: c.unit.media.length } }] : [];
    });
    return { status: 200, body: { units, published: false } };
  }
  const candidate = typeof payload.candidateId === "string" && id.test(payload.candidateId) ? readingUnitCandidates.find(c => c.id === payload.candidateId) : undefined;
  if (!candidate) return { status: 400, body: { error: "invalid_request" } };
  const state = admitted(items, candidate);
  if (!state) return { status: 403, body: { error: "content_review_access_required" } };
  const paths = new Map<string, string>();
  for (const m of candidate.unit.media) if (m.status === "draft_present" && typeof m.sha256 === "string" && sha.test(m.sha256)) paths.set(m.id, `${m.sha256}.webp`);
  const mediaUrls: Record<string, string> = {};
  if (paths.size && server.storage) {
    try {
      const { data, error } = await server.storage.from(PREVIEW_BUCKET).createSignedUrls([...new Set(paths.values())], PREVIEW_URL_SECONDS);
      if (!error && Array.isArray(data)) {
        const byPath = new Map(data.filter(d => d.path && !d.error && typeof d.signedUrl === "string").map(d => [d.path as string, d.signedUrl]));
        for (const [mediaId, path] of paths) { const url = byPath.get(path); if (url) mediaUrls[mediaId] = url; }
      }
    } catch { /* images are optional; the reader shows an honest "not uploaded" state */ }
  }
  return { status: 200, body: { unit: { id: candidate.id, version: candidate.version, title: candidate.title, decision: state.decision, revision: state.revision, content: candidate.unit }, mediaUrls, published: false } };
}
