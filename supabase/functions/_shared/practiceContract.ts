/** The provider can rank reviewed content, never generate movement instructions. */
export const PRACTICE_CONTRACT_VERSION = "reviewed-practice-1";
export type PracticeContext = {
  revision: string;
  locale: "vi-VN" | "en-US";
  minutes: number;
  energy: "Rất thấp" | "Thấp" | "Bình thường" | "Khá ổn" | "Tràn đầy" | null;
  intent: "Thả lỏng" | "Bắt nhịp" | "Tập trung";
  bodyStatus: "reported" | "none_now" | "uncertain" | "skipped" | "tired" | "uncomfortable" | null;
  regions: string[];
  pace: "slow" | "steady" | null;
  guidance: "more" | "less" | null;
  floor: "allowed" | "avoid";
};
export type LessonSection = { id: string; title: string; text: string; image: string; audio: string | null; audioLocale: "vi-VN" | "en-US" | null };
export type PracticeSession = {
  id: string;
  version: string;
  locale: PracticeContext["locale"];
  title: string;
  durationSeconds: number;
  pace: "slow" | "steady";
  guidance: "more" | "less";
  floorContact: boolean;
  preparation: string;
  source: "teacher" | "ai_assisted";
  review: { status: "approved"; evidenceRef: string; reviewerLabel: string; reviewedAt: string; expiresAt: string };
  eligibility: { bodyStatuses: PracticeContext["bodyStatus"][]; regionCodes: string[] };
  sections: LessonSection[];
};
export type PracticeResult =
  | { status: "selected"; requestId: string; contextRevision: string; plan: PracticeSession; reason: string }
  | { status: "clarification"; contextRevision: string; question: "pace" | "guidance" }
  | { status: "no_match" | "safety_stop"; contextRevision: string };

const REGION = /^(?:neck|upper_back|lower_back|(?:shoulder|upper_arm|elbow|forearm_wrist|hand|knee|foot|glute)_(?:left|right|unspecified))$/;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const object = (v: unknown): v is Record<string, unknown> => Boolean(v) && typeof v === "object" && !Array.isArray(v);
export function isPracticeContext(v: unknown): v is PracticeContext {
  if (!object(v) || Object.keys(v).some(key => !["revision", "locale", "minutes", "energy", "intent", "bodyStatus", "regions", "pace", "guidance", "floor"].includes(key))) return false;
  return typeof v.revision === "string" && UUID.test(v.revision)
    && typeof v.locale === "string" && ["vi-VN", "en-US"].includes(v.locale)
    && Number.isInteger(v.minutes) && Number(v.minutes) >= 1 && Number(v.minutes) <= 60
    && [null, "Rất thấp", "Thấp", "Bình thường", "Khá ổn", "Tràn đầy"].includes(v.energy as never)
    && typeof v.intent === "string" && ["Thả lỏng", "Bắt nhịp", "Tập trung"].includes(v.intent)
    && [null, "reported", "none_now", "uncertain", "skipped", "tired", "uncomfortable"].includes(v.bodyStatus as never)
    && [null, "slow", "steady"].includes(v.pace as never) && [null, "more", "less"].includes(v.guidance as never)
    && typeof v.floor === "string" && ["allowed", "avoid"].includes(v.floor)
    && Array.isArray(v.regions) && v.regions.length <= 20 && new Set(v.regions).size === v.regions.length
    && v.regions.every(code => typeof code === "string" && REGION.test(code));
}
function text(v: unknown, max: number) { return typeof v === "string" && v.trim().length > 0 && v.length <= max; }
function asset(v: unknown) { return typeof v === "string" && /^\/assets\/practice\/[a-z0-9][a-z0-9/_-]*\.(?:png|webp|jpg|wav|mp3|ogg)$/.test(v) && !v.includes(".."); }
export function isReviewedSession(v: unknown, now = Date.now()): v is PracticeSession {
  if (!object(v) || !object(v.review) || !object(v.eligibility)) return false;
  return text(v.id, 80) && typeof v.id === "string" && /^[a-z0-9-]+$/.test(v.id) && typeof v.version === "string" && /^[a-f0-9]{64}$/.test(v.version)
    && typeof v.locale === "string" && ["vi-VN", "en-US"].includes(v.locale) && text(v.title, 140)
    && Number.isInteger(v.durationSeconds) && Number(v.durationSeconds) > 0 && Number(v.durationSeconds) <= 3600
    && typeof v.pace === "string" && ["slow", "steady"].includes(v.pace) && typeof v.guidance === "string" && ["more", "less"].includes(v.guidance)
    && typeof v.floorContact === "boolean" && text(v.preparation, 600) && typeof v.source === "string" && ["teacher", "ai_assisted"].includes(v.source)
    && v.review.status === "approved" && text(v.review.evidenceRef, 240) && text(v.review.reviewerLabel, 100)
    && typeof v.review.reviewedAt === "string" && Number.isFinite(Date.parse(v.review.reviewedAt)) && Date.parse(v.review.reviewedAt) <= now
    && typeof v.review.expiresAt === "string" && Number.isFinite(Date.parse(v.review.expiresAt)) && Date.parse(v.review.expiresAt) > now
    && Array.isArray(v.eligibility.bodyStatuses) && v.eligibility.bodyStatuses.length > 0
    && v.eligibility.bodyStatuses.every(s => [null, "reported", "none_now", "uncertain", "skipped", "tired", "uncomfortable"].includes(s))
    && Array.isArray(v.eligibility.regionCodes) && v.eligibility.regionCodes.every(code => typeof code === "string" && REGION.test(code))
    && Array.isArray(v.sections) && v.sections.length > 0 && v.sections.length <= 20
    && new Set(v.sections.map(s => object(s) ? s.id : null)).size === v.sections.length
    && v.sections.every(s => object(s) && text(s.id, 40) && text(s.title, 140) && text(s.text, 2000) && asset(s.image) && (s.audio === null ? s.audioLocale === null : asset(s.audio) && (s.audioLocale === "vi-VN" || s.audioLocale === "en-US")));
}
export function eligibleSessions(catalog: readonly unknown[], context: PracticeContext, now = Date.now()): PracticeSession[] {
  // The first pilot has no severity/red-flag contract. Never rank practice for
  // reported discomfort or an uncertain body state through a coarse region code.
  if (!isPracticeContext(context) || context.bodyStatus === "reported" || context.bodyStatus === "uncertain" || context.bodyStatus === "tired" || context.bodyStatus === "uncomfortable") return [];
  return catalog.filter((s): s is PracticeSession => isReviewedSession(s, now))
    .filter(s => s.locale === context.locale && s.durationSeconds <= context.minutes * 60
      && (context.pace === null || s.pace === context.pace) && (context.guidance === null || s.guidance === context.guidance)
      && (context.floor !== "avoid" || !s.floorContact)
      && s.eligibility.bodyStatuses.includes(context.bodyStatus)
      && context.regions.every(code => s.eligibility.regionCodes.includes(code)))
    .slice(0, 12);
}
export function planReason(s: PracticeSession, locale: PracticeContext["locale"]) {
  const minutes = Number((s.durationSeconds / 60).toFixed(1));
  return locale === "en-US"
    ? `${minutes} minutes · ${s.pace === "slow" ? "slow pace" : "steady pace"} · ${s.floorContact ? "floor practice" : "no floor contact"}. Content from the reviewed catalogue.`
    : `${minutes} phút · ${s.pace === "slow" ? "nhịp chậm" : "nhịp vừa"} · ${s.floorContact ? "có dùng sàn" : "không nằm sàn"}. Nội dung từ danh mục đã duyệt.`;
}
