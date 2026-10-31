import { getAccountBoundSupabaseClient } from "../backend/supabase";

// Learner side of the private teacher collaboration function: the classes an admin enrolled the learner in, and the
// feedback a teacher has actually sent. It only reads. Enrolment, invitations and sharing a reflection with a teacher
// have no server action yet, so nothing here can create them.
export type ClassEnrollment = { id: string; sessions: number; completed: boolean };
export type FeedbackProvenance = "human" | "ai_assisted_teacher_confirmed";
export type ClassFeedback = { id: string; kind: "session" | "course"; revision: number; body: string; provenance: FeedbackProvenance; sentAt: string };
export type ClassList = { status: "allowed"; enrollments: ClassEnrollment[] } | { status: "denied" } | { status: "unavailable" };
export type FeedbackRead = { status: "ok"; feedback: ClassFeedback[] } | { status: "denied" } | { status: "unavailable" };

const plain = (value: unknown): value is Record<string, unknown> => Boolean(value && typeof value === "object" && !Array.isArray(value));
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

async function invoke(userId: string, action: string, payload: Record<string, unknown> = {}): Promise<{ data: unknown } | { denied: boolean }> {
  const client = await getAccountBoundSupabaseClient(userId);
  const { data, error } = await client.functions.invoke("teacher-collaboration", { body: { action, payload } });
  if (!error) return { data: plain(data) ? data.result : undefined };
  const response = (error as { context?: unknown }).context;
  if (response instanceof Response) {
    let code = "";
    try { code = String((await response.clone().json())?.error ?? ""); } catch { /* non-JSON body */ }
    // A function that is switched off or not deployed, or an account outside the class cohort, simply has no classes.
    if ([401, 403, 404].includes(response.status) || ["collaboration_unavailable", "collaboration_access_denied", "invalid_collaboration_request", "authentication_required"].includes(code) && response.status !== 503) return { denied: true };
  }
  return { denied: false };
}

// One probe per account per app session; transient failures are not cached so a later visit can retry.
const probes = new Map<string, Promise<ClassList>>();
export function readClassList(userId: string, refresh = false): Promise<ClassList> {
  const cached = probes.get(userId);
  if (cached && !refresh) return cached;
  const request = (async (): Promise<ClassList> => {
    try {
      const result = await invoke(userId, "workspace");
      if ("denied" in result) return result.denied ? { status: "denied" } : { status: "unavailable" };
      const data = result.data;
      if (!plain(data) || !Array.isArray(data.enrollments)) return { status: "unavailable" };
      if (data.role !== "learner") return { status: "denied" };
      const enrollments = data.enrollments.flatMap((item): ClassEnrollment[] => {
        if (!plain(item) || typeof item.id !== "string" || !UUID.test(item.id)) return [];
        return [{ id: item.id, sessions: Array.isArray(item.sessions) ? item.sessions.length : 0, completed: item.completed === true }];
      });
      return enrollments.length > 0 ? { status: "allowed", enrollments } : { status: "denied" };
    } catch {
      return { status: "unavailable" };
    }
  })();
  probes.set(userId, request);
  void request.then(result => { if (result.status === "unavailable" && probes.get(userId) === request) probes.delete(userId); });
  return request;
}

export async function readClassFeedback(userId: string, enrollmentId: string): Promise<FeedbackRead> {
  try {
    const result = await invoke(userId, "read_feedback", { enrollment_id: enrollmentId });
    if ("denied" in result) return result.denied ? { status: "denied" } : { status: "unavailable" };
    if (!Array.isArray(result.data)) return { status: "unavailable" };
    // Keep only sent, well-formed feedback, and only the newest sent revision of each piece.
    const latest = new Map<string, ClassFeedback>();
    for (const item of result.data) {
      if (!plain(item) || typeof item.id !== "string" || typeof item.body !== "string" || typeof item.sent_at !== "string" || typeof item.revision !== "number") continue;
      if (item.kind !== "session" && item.kind !== "course") continue;
      if (item.provenance !== "human" && item.provenance !== "ai_assisted_teacher_confirmed") continue;
      const entry: ClassFeedback = { id: item.id, kind: item.kind, revision: item.revision, body: item.body, provenance: item.provenance, sentAt: item.sent_at };
      const existing = latest.get(entry.id);
      if (!existing || existing.revision < entry.revision) latest.set(entry.id, entry);
    }
    return { status: "ok", feedback: [...latest.values()].sort((a, b) => b.sentAt.localeCompare(a.sentAt)) };
  } catch {
    return { status: "unavailable" };
  }
}
