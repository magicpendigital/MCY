import { contentReviewCandidates } from "./contentReviewCandidates.ts";
import { readingUnitCandidates } from "./readingUnitCandidates.ts";
import type { OwnerControlPlaneDependencies } from "./ownerControlPlane.ts";
import { reviewChecks } from "./contentReviewContract.ts";
import { evaluateUnit, projectUnit, syncPublication, type PublicationSnapshot, type PublicationStorage, type SyncResult, type TextOnlyMode } from "./readingPublication.ts";

const actions = ["read_content_review", "read_reading_preview", "save_content_review", "assign_content_reviewer", "read_reading_publication", "set_reading_publication", "sync_reading_publication"];
const allowedKeys: Record<string, string[]> = {
  read_content_review: ["action"],
  read_reading_preview: ["action", "candidateId"],
  save_content_review: ["action", "candidateId", "contentVersion", "expectedRevision", "decision", "qualification", "reviewBasis", "rightsBasis", "checklist"],
  assign_content_reviewer: ["action", "candidateId", "contentVersion", "expectedRevision", "reviewerId", "active", "expiresInDays"],
  read_reading_publication: ["action"],
  sync_reading_publication: ["action"],
  set_reading_publication: ["action", "candidateId", "contentVersion", "visible", "textOnlyMode", "defaultTextOnlyAllowed"],
};
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
  const allowed = allowedKeys[action];
  if (Object.keys(payload).some(k => !allowed.includes(k))) return { status: 400, body: { error: "invalid_request" } };
  const { data: queue, error: readError } = await server.rpc("mcy_content_review_read", { p_actor_id: actor, p_candidates: allCandidates.map(meta) });
  if (readError || !plain(queue) || !Array.isArray(queue.items) || typeof queue.can_assign !== "boolean") return { status: readError?.code === "42501" ? 403 : 503, body: { error: readError?.code === "42501" ? "content_review_access_required" : "content_review_not_ready" } };
  if (action === "read_content_review") {
    return { status: 200, body: { ...queue, candidates: allCandidates.filter(c => (queue.items as Record<string, unknown>[]).some(item => item.candidate_id === c.id && item.content_version === c.version)) } };
  }
  if (action === "read_reading_preview") return readingPreview(payload, queue.items as Record<string, unknown>[], server);
  if (action === "read_reading_publication") return readReadingPublication(queue.items as Record<string, unknown>[], Boolean(queue.can_assign), actor, server);
  if (action === "sync_reading_publication") {
    if (!queue.can_assign) return { status: 403, body: { error: "owner_access_required" } };
    return syncResponse(await syncPublished(actor, server), {});
  }
  if (action === "set_reading_publication") return setReadingPublication(payload, queue.items as Record<string, unknown>[], Boolean(queue.can_assign), actor, server);
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
  // A new review (including withdrawal) can hide a unit that is live, so reading units re-sync the public snapshot.
  let publicationSynced: boolean | undefined;
  if (action === "save_content_review" && candidate.scope === "learning_reading" && server.storage) {
    try { const synced = await syncPublished(actor, server); publicationSynced = synced !== null && synced.ok; } catch { publicationSynced = false; }
  }
  return { status: 200, body: { receipt: data, published: false, aiEnabled: false, ...(publicationSynced === undefined ? {} : { publicationSynced }) } };
}

type Server = ReturnType<OwnerControlPlaneDependencies["clients"]>["server"];

async function publicationSnapshot(actor: string, server: Server): Promise<PublicationSnapshot | null> {
  const { data, error } = await server.rpc("mcy_reading_publication_snapshot", { p_actor_id: actor });
  if (error || !plain(data) || typeof data.role !== "string" || typeof data.default_text_only_allowed !== "boolean" || !Array.isArray(data.approved) || !Array.isArray(data.rows)) return null;
  return data as unknown as PublicationSnapshot;
}

// Rebuilds the public snapshot from database state. If the state changes while it runs, it runs once more.
async function syncPublished(actor: string, server: Server): Promise<SyncResult | null> {
  let last: SyncResult | null = null;
  for (let attempt = 0; attempt < 2; attempt++) {
    const before = await publicationSnapshot(actor, server);
    if (!before) return last;
    last = await syncPublication(server.storage as unknown as PublicationStorage | undefined, readingUnitCandidates, before);
    if (!last.ok) return last;
    const after = await publicationSnapshot(actor, server);
    if (after && JSON.stringify(after) === JSON.stringify(before)) return last;
  }
  return last;
}

function syncResponse(result: SyncResult | null, extra: Record<string, unknown>): Result {
  if (!result) return { status: 503, body: { error: "reading_publication_not_ready" } };
  if (!result.ok) return { status: 503, body: { error: result.error === "storage_unavailable" ? "reading_publication_not_ready" : "reading_publication_result_uncertain" } };
  return { status: 200, body: { ...extra, synced: true, shown: result.shown, held: result.held } };
}

async function readReadingPublication(items: Record<string, unknown>[], canSetDefault: boolean, actor: string, server: Server): Promise<Result> {
  const snapshot = await publicationSnapshot(actor, server);
  if (!snapshot) return { status: 503, body: { error: "reading_publication_not_ready" } };
  const units = readingUnitCandidates.flatMap(c => {
    const state = admitted(items, c);
    if (!state) return [];
    const result = evaluateUnit(c, snapshot);
    return [{
      id: c.id, version: c.version, title: c.title, decision: state.decision, steps: c.unit.steps.length,
      images: result.coverage.state, switchOn: result.visible, textOnlyMode: result.mode, show: result.show, reason: result.reason,
      contentReady: projectUnit(c).ok,
    }];
  });
  return { status: 200, body: { units, defaultTextOnlyAllowed: snapshot.default_text_only_allowed, canSetDefault } };
}

const textModes: readonly TextOnlyMode[] = ["inherit", "allow", "require"];
function publicationError(error: { code?: string; message?: string } | null): Result {
  const code = error?.code;
  if (code === "22023" && error?.message === "unit_not_approved") return { status: 409, body: { error: "unit_not_approved" } };
  return { status: code === "42501" ? 403 : code === "PT429" ? 429 : code === "22023" ? 400 : 503, body: { error: code === "42501" ? (error?.message === "owner_access_required" ? "owner_access_required" : "content_review_access_required") : code === "PT429" ? "reading_publication_limit_reached" : code === "22023" ? "invalid_publication" : "reading_publication_result_uncertain" } };
}

async function setReadingPublication(payload: Record<string, unknown>, items: Record<string, unknown>[], canSetDefault: boolean, actor: string, server: Server): Promise<Result> {
  if (payload.candidateId === undefined) {
    if (typeof payload.defaultTextOnlyAllowed !== "boolean" || Object.keys(payload).some(k => !["action", "defaultTextOnlyAllowed"].includes(k))) return { status: 400, body: { error: "invalid_request" } };
    if (!canSetDefault) return { status: 403, body: { error: "owner_access_required" } };
    const { data, error } = await server.rpc("mcy_reading_publication_set_default", { p_actor_id: actor, p_text_only_allowed: payload.defaultTextOnlyAllowed });
    if (error || !plain(data)) return publicationError(error);
    return syncResponse(await syncPublished(actor, server), { receipt: data });
  }
  const candidate = typeof payload.candidateId === "string" && id.test(payload.candidateId)
    ? readingUnitCandidates.find(c => c.id === payload.candidateId && c.version === payload.contentVersion) : undefined;
  if (!candidate || typeof payload.visible !== "boolean" || !textModes.includes(payload.textOnlyMode as TextOnlyMode) || payload.defaultTextOnlyAllowed !== undefined) return { status: 400, body: { error: "invalid_request" } };
  if (!admitted(items, candidate)) return { status: 403, body: { error: "content_review_access_required" } };
  const { data, error } = await server.rpc("mcy_reading_publication_set", { p_actor_id: actor, p_candidate: meta(candidate), p_visible: payload.visible, p_text_only_mode: payload.textOnlyMode });
  if (error || !plain(data)) return publicationError(error);
  const synced = await syncPublished(actor, server);
  // The switch is already saved; if publishing fails the screen says so and the sync can be repeated safely.
  if (!synced || !synced.ok) return { status: 200, body: { receipt: data, synced: false } };
  return syncResponse(synced, { receipt: data });
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
