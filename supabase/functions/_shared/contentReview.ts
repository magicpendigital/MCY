import { contentReviewCandidates } from "./contentReviewCandidates.ts";
import { readingUnitCandidates } from "./readingUnitCandidates.ts";
import type { OwnerControlPlaneDependencies } from "./ownerControlPlane.ts";
import { reviewChecks } from "./contentReviewContract.ts";

const actions = ["read_content_review", "save_content_review", "assign_content_reviewer"];
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
  const allowed = action === "read_content_review" ? ["action"] : action === "save_content_review"
    ? ["action", "candidateId", "contentVersion", "expectedRevision", "decision", "qualification", "reviewBasis", "rightsBasis", "checklist"]
    : ["action", "candidateId", "contentVersion", "expectedRevision", "reviewerId", "active", "expiresInDays"];
  if (Object.keys(payload).some(k => !allowed.includes(k))) return { status: 400, body: { error: "invalid_request" } };
  const { data: queue, error: readError } = await server.rpc("mcy_content_review_read", { p_actor_id: actor, p_candidates: allCandidates.map(meta) });
  if (readError || !plain(queue) || !Array.isArray(queue.items) || typeof queue.can_assign !== "boolean") return { status: readError?.code === "42501" ? 403 : 503, body: { error: readError?.code === "42501" ? "content_review_access_required" : "content_review_not_ready" } };
  if (action === "read_content_review") {
    return { status: 200, body: { ...queue, candidates: allCandidates.filter(c => (queue.items as Record<string, unknown>[]).some(item => item.candidate_id === c.id && item.content_version === c.version)) } };
  }
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
