import { getAccountBoundSupabaseClient } from "../backend/supabase";

// Reviewer-side switches for which approved reading units learners can see. The server decides what is shown; this
// module only reads the effective state and sends the reviewer's choices.
export type TextOnlyMode = "inherit" | "allow" | "require";
export type PublicationReason = "ok" | "not_approved" | "switch_off" | "needs_images" | "copy_pass" | "media_unverified" | "media_copy_failed" | "upload_failed";
export type PublicationUnit = {
  id: string; version: string; title: string; decision: string; steps: number; images: "complete" | "partial" | "none";
  switchOn: boolean; textOnlyMode: TextOnlyMode; show: boolean; reason: PublicationReason; contentReady: boolean;
};
export type PublicationList =
  | { status: "allowed"; units: PublicationUnit[]; defaultTextOnlyAllowed: boolean; canSetDefault: boolean }
  | { status: "denied" } | { status: "unavailable" };
export type PublicationChange = { status: "ok"; synced: boolean } | { status: "error"; code: string };

const reasons: readonly string[] = ["ok", "not_approved", "switch_off", "needs_images", "copy_pass", "media_unverified", "media_copy_failed", "upload_failed"];
const plain = (value: unknown): value is Record<string, unknown> => Boolean(value && typeof value === "object" && !Array.isArray(value));

async function call(userId: string, body: Record<string, unknown>): Promise<{ data: unknown } | { code: string; denied: boolean }> {
  const client = await getAccountBoundSupabaseClient(userId);
  const { data, error } = await client.functions.invoke("owner-control-plane", { body });
  if (!error) return { data };
  let code = "";
  let denied = false;
  const response = (error as { context?: unknown }).context;
  if (response instanceof Response) {
    denied = [401, 403, 404].includes(response.status);
    try { code = String((await response.clone().json())?.error ?? ""); } catch { /* non-JSON body */ }
  }
  return { code: code || "unavailable", denied };
}

export async function readPublication(userId: string): Promise<PublicationList> {
  try {
    const result = await call(userId, { action: "read_reading_publication" });
    if ("code" in result) return result.denied ? { status: "denied" } : { status: "unavailable" };
    const data = result.data;
    if (!plain(data) || !Array.isArray(data.units) || typeof data.defaultTextOnlyAllowed !== "boolean") return { status: "unavailable" };
    const units = data.units.filter(plain).flatMap((unit): PublicationUnit[] => {
      if (typeof unit.id !== "string" || typeof unit.version !== "string" || typeof unit.title !== "string" || !reasons.includes(unit.reason as string)) return [];
      return [{
        id: unit.id, version: unit.version, title: unit.title, decision: typeof unit.decision === "string" ? unit.decision : "pending",
        steps: Number.isInteger(unit.steps) ? Number(unit.steps) : 0, images: unit.images === "complete" || unit.images === "partial" ? unit.images : "none",
        switchOn: unit.switchOn === true, textOnlyMode: unit.textOnlyMode === "allow" || unit.textOnlyMode === "require" ? unit.textOnlyMode : "inherit",
        show: unit.show === true, reason: unit.reason as PublicationReason, contentReady: unit.contentReady === true,
      }];
    });
    return { status: "allowed", units, defaultTextOnlyAllowed: data.defaultTextOnlyAllowed, canSetDefault: data.canSetDefault === true };
  } catch {
    return { status: "unavailable" };
  }
}

async function change(userId: string, body: Record<string, unknown>): Promise<PublicationChange> {
  try {
    const result = await call(userId, body);
    if ("code" in result) return { status: "error", code: result.code };
    return { status: "ok", synced: plain(result.data) && result.data.synced === true };
  } catch {
    return { status: "error", code: "unavailable" };
  }
}

export const setUnitPublication = (userId: string, unit: Pick<PublicationUnit, "id" | "version">, visible: boolean, textOnlyMode: TextOnlyMode) =>
  change(userId, { action: "set_reading_publication", candidateId: unit.id, contentVersion: unit.version, visible, textOnlyMode });
export const setDefaultTextOnly = (userId: string, allowed: boolean) =>
  change(userId, { action: "set_reading_publication", defaultTextOnlyAllowed: allowed });
