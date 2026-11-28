import type { OwnerControlPlaneDependencies } from "./ownerControlPlane.ts";
import { reviewChecks } from "./contentReviewContract.ts";
import { authorableKinds, validDisplayConfig, validPayload } from "./contentWorkspaceContract.ts";
import { readingUnitCandidates } from "./readingUnitCandidates.ts";
import { videoCatalogItems } from "./videoCatalogCandidates.ts";
import { syncContentSnapshot, type ContentStorage, type SnapshotSource } from "./contentPublication.ts";

// Versioned content store (phase 1 of the content workspace). Every action is a thin, validated call to a service-only RPC
// that re-checks the verified Owner or active-teacher actor; nothing here approves or publishes anything.
type Server = ReturnType<OwnerControlPlaneDependencies["clients"]>["server"];
type Result = { status: number; body: Record<string, unknown> };

const actions = ["list_content", "read_content", "save_content", "submit_content", "review_content", "import_catalog", "read_display", "save_display", "set_visibility", "sync_content_snapshot", "read_author_notes", "save_author_note", "read_tracking"];
const allowedKeys: Record<string, string[]> = {
  list_content: ["action"],
  read_content: ["action", "itemId", "seq"],
  save_content: ["action", "itemId", "kind", "title", "payload", "expectedSeq"],
  submit_content: ["action", "itemId", "expectedSeq"],
  review_content: ["action", "itemId", "seq", "expectedRevision", "decision", "qualification", "reviewBasis", "rightsBasis", "checklist"],
  import_catalog: ["action"],
  read_display: ["action"],
  save_display: ["action", "expectedVersion", "config"],
  set_visibility: ["action", "itemId", "seq", "visible"],
  sync_content_snapshot: ["action"],
  read_author_notes: ["action", "itemId"],
  save_author_note: ["action", "itemId", "seq", "note"],
  read_tracking: ["action"],
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
  self_review_not_allowed: "self_review_not_allowed",
};
function failure(error: { code?: string; message?: string } | null): Result {
  const code = error?.code;
  if (code === "PT409") return { status: 409, body: { error: error?.message === "display_conflict" ? "display_conflict" : "content_conflict" } };
  if (code === "PT429") return { status: 429, body: { error: "content_limit_reached" } };
  if (code === "42501") return { status: 403, body: { error: forbiddenMessages[error?.message ?? ""] ?? "content_access_required" } };
  if (code === "22023") {
    const m = error?.message;
    if (m === "content_not_submitted") return { status: 409, body: { error: "content_not_submitted" } };
    if (m === "content_item_not_found") return { status: 404, body: { error: "content_item_not_found" } };
    if (m === "review_checks_incomplete") return { status: 400, body: { error: "review_checks_incomplete" } };
    if (m === "content_not_approved" || m === "editors_choice_not_shown") return { status: 409, body: { error: m } };
    if (m === "invalid_display_config" || m === "invalid_visibility" || m === "invalid_note") return { status: 400, body: { error: m } };
    return { status: 400, body: { error: "invalid_content" } };
  }
  return { status: 503, body: { error: "content_result_uncertain" } };
}

// Rebuilds the public snapshot from the database. The action that changed what is shown has already succeeded; if publishing fails
// the response says so (snapshotSynced: false) and the Owner can repeat it with sync_content_snapshot.
async function publishSnapshot(actor: string, server: Server): Promise<boolean | undefined> {
  if (!server.storage) return undefined;
  try {
    const { data, error } = await server.rpc("mcy_content_snapshot", { p_actor_id: actor });
    if (error || !plain(data) || !plain(data.display) || !Array.isArray(data.items)) return false;
    return (await syncContentSnapshot(server.storage as unknown as ContentStorage, data as unknown as SnapshotSource)).ok;
  } catch { return false; }
}

export async function handleContentWorkspace(payload: Record<string, unknown>, actor: string, server: Server): Promise<Result | null> {
  if (typeof payload.action !== "string" || !actions.includes(payload.action)) return null;
  const action = payload.action;
  if (Object.keys(payload).some(k => !allowedKeys[action].includes(k))) return { status: 400, body: { error: "invalid_request" } };

  // T1 (W1): the version learners may see, review history and the courses that hold each own item; the RPC re-checks the actor.
  if (action === "read_tracking") {
    const { data, error } = await server.rpc("mcy_content_tracking", { p_actor_id: actor });
    return error || !plain(data) || !Array.isArray(data.items) ? failure(error) : { status: 200, body: { items: data.items } };
  }

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
    if (error || !plain(data)) return failure(error);
    // A decision can hide shown content (a newer review), so the public snapshot is rebuilt. Approval alone still shows nothing new.
    return { status: 200, body: { receipt: data, published: false, aiEnabled: false, snapshotSynced: await publishSnapshot(actor, server) } };
  }

  if (action === "read_display") {
    const { data: config, error } = await server.rpc("mcy_display_read", { p_actor_id: actor });
    if (error || !plain(config)) return failure(error);
    const { data: shown, error: shownError } = await server.rpc("mcy_content_visibility_list", { p_actor_id: actor });
    if (shownError || !plain(shown)) return failure(shownError);
    return { status: 200, body: { ...config, visibility: Array.isArray(shown.rows) ? shown.rows : [], published: false } };
  }

  if (action === "save_display") {
    if (!natural(payload.expectedVersion, 1) || !validDisplayConfig(payload.config)) return { status: 400, body: { error: "invalid_display_config" } };
    const { data, error } = await server.rpc("mcy_display_save", { p_actor_id: actor, p_expected_version: payload.expectedVersion, p_config: payload.config });
    if (error || !plain(data)) return failure(error);
    return { status: 200, body: { receipt: data, snapshotSynced: await publishSnapshot(actor, server) } };
  }

  if (action === "set_visibility") {
    if (typeof payload.itemId !== "string" || !itemId.test(payload.itemId) || !natural(payload.seq, 1) || typeof payload.visible !== "boolean") return { status: 400, body: { error: "invalid_visibility" } };
    const { data, error } = await server.rpc("mcy_content_set_visibility", { p_actor_id: actor, p_item_id: payload.itemId, p_seq: payload.seq, p_visible: payload.visible });
    if (error || !plain(data)) return failure(error);
    return { status: 200, body: { receipt: data, snapshotSynced: await publishSnapshot(actor, server) } };
  }

  if (action === "sync_content_snapshot") {
    if (!server.storage) return { status: 503, body: { error: "content_publication_not_ready" } };
    const { data, error } = await server.rpc("mcy_content_snapshot", { p_actor_id: actor });
    if (error || !plain(data) || !plain(data.display) || !Array.isArray(data.items)) return failure(error);
    const result = await syncContentSnapshot(server.storage as unknown as ContentStorage, data as unknown as SnapshotSource);
    return result.ok ? { status: 200, body: { synced: true, groups: result.groups, lessons: result.lessons } } : { status: 503, body: { error: "content_publication_not_ready" } };
  }

  if (action === "read_author_notes") {
    if (typeof payload.itemId !== "string" || !itemId.test(payload.itemId)) return { status: 400, body: { error: "invalid_request" } };
    const { data, error } = await server.rpc("mcy_content_notes_read", { p_actor_id: actor, p_item_id: payload.itemId });
    return error || !plain(data) ? failure(error) : { status: 200, body: data };
  }

  if (action === "save_author_note") {
    if (typeof payload.itemId !== "string" || !itemId.test(payload.itemId) || !natural(payload.seq, 1) || typeof payload.note !== "string" || payload.note.trim().length < 1 || payload.note.length > 1000) return { status: 400, body: { error: "invalid_note" } };
    const { data, error } = await server.rpc("mcy_content_note_save", { p_actor_id: actor, p_item_id: payload.itemId, p_seq: payload.seq, p_note: payload.note.trim() });
    return error || !plain(data) ? failure(error) : { status: 200, body: { receipt: data } };
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

