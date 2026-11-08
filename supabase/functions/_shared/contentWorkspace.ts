import type { OwnerControlPlaneDependencies } from "./ownerControlPlane.ts";
import { reviewChecks } from "./contentReviewContract.ts";
import { authorableKinds, validPayload } from "./contentWorkspaceContract.ts";
import { readingUnitCandidates } from "./readingUnitCandidates.ts";
import { videoCatalogItems } from "./videoCatalogCandidates.ts";

// Versioned content store (phase 1 of the content workspace). Every action is a thin, validated call to a service-only RPC
// that re-checks the verified Owner or active-teacher actor; nothing here approves or publishes anything.
type Server = ReturnType<OwnerControlPlaneDependencies["clients"]>["server"];
type Result = { status: number; body: Record<string, unknown> };

const actions = ["list_content", "read_content", "save_content", "submit_content", "review_content", "import_catalog"];
const allowedKeys: Record<string, string[]> = {
  list_content: ["action"],
  read_content: ["action", "itemId", "seq"],
  save_content: ["action", "itemId", "kind", "title", "payload", "expectedSeq"],
  submit_content: ["action", "itemId", "expectedSeq"],
  review_content: ["action", "itemId", "seq", "expectedRevision", "decision", "qualification", "reviewBasis", "rightsBasis", "checklist"],
  import_catalog: ["action"],
};
const itemId = /^[a-z0-9_-]{1,80}$/;
const plain = (v: unknown): v is Record<string, unknown> => Boolean(v && typeof v === "object" && !Array.isArray(v));
const natural = (v: unknown, min: number) => typeof v === "number" && Number.isInteger(v) && v >= min && v <= 1_000_000;
const text = (v: unknown, max: number) => typeof v === "string" && v.trim().length >= 10 && v.length <= max;

// Database messages that are safe to name to the caller; anything else is reported as an uncertain result.
const forbiddenMessages: Record<string, string> = {
  owner_access_required: "owner_access_required",
  content_kind_not_allowed: "content_kind_not_allowed",
  teacher_content_is_reviewed_not_edited: "teacher_content_is_reviewed_not_edited",
};
function failure(error: { code?: string; message?: string } | null): Result {
  const code = error?.code;
  if (code === "PT409") return { status: 409, body: { error: "content_conflict" } };
  if (code === "PT429") return { status: 429, body: { error: "content_limit_reached" } };
  if (code === "42501") return { status: 403, body: { error: forbiddenMessages[error?.message ?? ""] ?? "content_access_required" } };
  if (code === "22023") {
    const m = error?.message;
    if (m === "content_not_submitted") return { status: 409, body: { error: "content_not_submitted" } };
    if (m === "content_item_not_found") return { status: 404, body: { error: "content_item_not_found" } };
    if (m === "review_checks_incomplete") return { status: 400, body: { error: "review_checks_incomplete" } };
    return { status: 400, body: { error: "invalid_content" } };
  }
  return { status: 503, body: { error: "content_result_uncertain" } };
}

export async function handleContentWorkspace(payload: Record<string, unknown>, actor: string, server: Server): Promise<Result | null> {
  if (typeof payload.action !== "string" || !actions.includes(payload.action)) return null;
  const action = payload.action;
  if (Object.keys(payload).some(k => !allowedKeys[action].includes(k))) return { status: 400, body: { error: "invalid_request" } };

  if (action === "list_content") {
    const { data, error } = await server.rpc("mcy_content_list", { p_actor_id: actor });
    return error || !plain(data) ? failure(error) : { status: 200, body: { ...data, published: false } };
  }

  if (action === "read_content") {
    if (typeof payload.itemId !== "string" || !itemId.test(payload.itemId) || (payload.seq !== undefined && !natural(payload.seq, 1))) return { status: 400, body: { error: "invalid_request" } };
    const { data, error } = await server.rpc("mcy_content_read_version", { p_actor_id: actor, p_item_id: payload.itemId, p_seq: payload.seq ?? null });
    return error || !plain(data) ? failure(error) : { status: 200, body: { version: data, published: false } };
  }

  if (action === "save_content") {
    const kind = payload.kind;
    if (typeof kind !== "string" || !authorableKinds.includes(kind as never) || typeof payload.title !== "string" || payload.title.trim().length < 1 || payload.title.length > 200
      || !natural(payload.expectedSeq, 0)
      || (payload.itemId !== undefined && payload.itemId !== null && (typeof payload.itemId !== "string" || !itemId.test(payload.itemId)))
      || !validPayload(kind, payload.payload) || JSON.stringify(payload.payload).length > 20000) return { status: 400, body: { error: "invalid_content" } };
    const { data, error } = await server.rpc("mcy_content_save_version", {
      p_actor_id: actor, p_item_id: payload.itemId ?? null, p_kind: kind, p_title: payload.title.trim(), p_payload: payload.payload, p_expected_seq: payload.expectedSeq,
    });
    return error || !plain(data) ? failure(error) : { status: 200, body: { receipt: data, published: false } };
  }

  if (action === "submit_content") {
    if (typeof payload.itemId !== "string" || !itemId.test(payload.itemId) || !natural(payload.expectedSeq, 1)) return { status: 400, body: { error: "invalid_request" } };
    const { data, error } = await server.rpc("mcy_content_submit", { p_actor_id: actor, p_item_id: payload.itemId, p_expected_seq: payload.expectedSeq });
    return error || !plain(data) ? failure(error) : { status: 200, body: { receipt: data, published: false } };
  }

  if (action === "review_content") {
    const checklist = payload.checklist;
    if (typeof payload.itemId !== "string" || !itemId.test(payload.itemId) || !natural(payload.seq, 1) || !natural(payload.expectedRevision, 0)
      || typeof payload.decision !== "string" || !["approved", "changes_requested", "withdrawn"].includes(payload.decision)
      || !text(payload.qualification, 1000) || !text(payload.reviewBasis, 2000) || !text(payload.rightsBasis, 2000)
      || !plain(checklist) || Object.keys(checklist).sort().join() !== [...reviewChecks].sort().join()
      || reviewChecks.some(k => typeof checklist[k] !== "boolean")) return { status: 400, body: { error: "invalid_review" } };
    const { data, error } = await server.rpc("mcy_content_review_item", {
      p_actor_id: actor, p_item_id: payload.itemId, p_seq: payload.seq, p_expected_revision: payload.expectedRevision, p_decision: payload.decision,
      p_qualification: payload.qualification, p_review_basis: payload.reviewBasis, p_rights_basis: payload.rightsBasis, p_checklist: checklist,
    });
    // Approval and publication stay separate: a decision here never makes anything learner-visible.
    return error || !plain(data) ? failure(error) : { status: 200, body: { receipt: data, published: false, aiEnabled: false } };
  }

  // import_catalog: record the current reading units and the free-course catalogue as submitted versions. Owner only (the RPC checks).
  let created = 0, unchanged = 0;
  const items: Array<{ id: string; kind: string; title: string; payload: unknown; hash: string | null }> = [
    ...readingUnitCandidates.map(c => ({ id: c.id, kind: "reading_unit", title: c.title, payload: c.unit, hash: c.version })),
    ...videoCatalogItems.map(c => ({ id: c.id, kind: c.kind, title: c.title, payload: c.payload, hash: null })),
  ];
  for (const item of items) {
    const { data, error } = await server.rpc("mcy_content_import", { p_actor_id: actor, p_item_id: item.id, p_kind: item.kind, p_title: item.title, p_payload: item.payload, p_trusted_hash: item.hash });
    if (error || !plain(data)) {
      // The first call also proves the actor: an Owner-only refusal stops everything without partial detail.
      const result = failure(error);
      return { status: result.status, body: { ...result.body, created, unchanged, failedItem: item.id } };
    }
    if (data.unchanged === true) unchanged++; else created++;
  }
  return { status: 200, body: { created, unchanged, total: items.length, published: false } };
}

