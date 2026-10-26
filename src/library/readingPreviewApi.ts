import { getAccountBoundSupabaseClient } from "../backend/supabase";
import type { ReadingUnitContent } from "../../supabase/functions/_shared/readingUnitCandidates";

// Owner/reviewer-only Preview of the illustrated reading units. Text and image URLs arrive from the
// authenticated owner-control-plane function; none of this content is bundled with the learner app.
export type PreviewDecision = "pending" | "approved" | "changes_requested" | "withdrawn";
export type PreviewListItem = { id: string; version: string; title: string; decision: PreviewDecision; revision: number; steps: number; images: { present: number; total: number } };
export type PreviewUnit = { id: string; version: string; title: string; decision: PreviewDecision; revision: number; content: ReadingUnitContent };
export type PreviewList = { status: "allowed"; units: PreviewListItem[] } | { status: "denied" } | { status: "unavailable" };
export type PreviewRead = { status: "ok"; unit: PreviewUnit; mediaUrls: Record<string, string> } | { status: "denied" } | { status: "unavailable" };

const decisions: readonly string[] = ["pending", "approved", "changes_requested", "withdrawn"];
const plain = (value: unknown): value is Record<string, unknown> => Boolean(value && typeof value === "object" && !Array.isArray(value));
const decision = (value: unknown): PreviewDecision => decisions.includes(value as string) ? value as PreviewDecision : "pending";

async function invoke(userId: string, body: Record<string, unknown>): Promise<{ data: unknown } | { denied: boolean }> {
  const client = await getAccountBoundSupabaseClient(userId);
  const { data, error } = await client.functions.invoke("owner-control-plane", { body });
  if (!error) return { data };
  const response = (error as { context?: unknown }).context;
  if (response instanceof Response) {
    let code = "";
    try { code = String((await response.clone().json())?.error ?? ""); } catch { /* non-JSON body */ }
    // A learner without a review role, or a backend that predates this action, simply has no Preview.
    if ([401, 403, 404].includes(response.status) || ["unsupported_action", "workspace_not_available", "content_review_access_required"].includes(code)) return { denied: true };
  }
  return { denied: false };
}

// One probe per account per app session; transient failures are not cached so a later visit can retry.
const probes = new Map<string, Promise<PreviewList>>();
export function readPreviewList(userId: string, refresh = false): Promise<PreviewList> {
  const cached = probes.get(userId);
  if (cached && !refresh) return cached;
  const request = (async (): Promise<PreviewList> => {
    try {
      const result = await invoke(userId, { action: "read_reading_preview" });
      if ("denied" in result) return result.denied ? { status: "denied" } : { status: "unavailable" };
      const data = result.data;
      if (!plain(data) || !Array.isArray(data.units)) return { status: "unavailable" };
      const units = data.units.filter(plain).flatMap((unit): PreviewListItem[] => {
        const images = plain(unit.images) ? unit.images : {};
        return typeof unit.id === "string" && typeof unit.version === "string" && typeof unit.title === "string"
          ? [{ id: unit.id, version: unit.version, title: unit.title, decision: decision(unit.decision), revision: Number.isInteger(unit.revision) ? Number(unit.revision) : 0, steps: Number.isInteger(unit.steps) ? Number(unit.steps) : 0, images: { present: Number(images.present) || 0, total: Number(images.total) || 0 } }]
          : [];
      });
      return { status: "allowed", units };
    } catch {
      return { status: "unavailable" };
    }
  })();
  probes.set(userId, request);
  void request.then(result => { if (result.status === "unavailable" && probes.get(userId) === request) probes.delete(userId); });
  return request;
}

export async function readPreviewUnit(userId: string, candidateId: string): Promise<PreviewRead> {
  try {
    const result = await invoke(userId, { action: "read_reading_preview", candidateId });
    if ("denied" in result) return result.denied ? { status: "denied" } : { status: "unavailable" };
    const data = result.data;
    const unit = plain(data) && plain(data.unit) ? data.unit : null;
    if (!unit || unit.id !== candidateId || typeof unit.version !== "string" || typeof unit.title !== "string" || !plain(unit.content) || !Array.isArray(unit.content.steps)) return { status: "unavailable" };
    const urls = plain((data as Record<string, unknown>).mediaUrls) ? (data as Record<string, unknown>).mediaUrls as Record<string, unknown> : {};
    const mediaUrls: Record<string, string> = {};
    for (const [mediaId, url] of Object.entries(urls)) if (typeof url === "string" && /^https:\/\//.test(url)) mediaUrls[mediaId] = url;
    return { status: "ok", unit: { id: unit.id, version: unit.version, title: unit.title, decision: decision(unit.decision), revision: Number.isInteger(unit.revision) ? Number(unit.revision) : 0, content: unit.content as unknown as ReadingUnitContent }, mediaUrls };
  } catch {
    return { status: "unavailable" };
  }
}
