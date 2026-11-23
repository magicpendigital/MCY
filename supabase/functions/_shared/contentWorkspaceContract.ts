// Strict payload shapes for content saved through the workspace. The database stores any jsonb object of the right size;
// this contract is what makes a saved version well-formed. Reading units are not authored here: they reach the store by import.
export const contentKinds = ["video_lesson", "course_group", "reading_unit", "screen_text"] as const;
export type ContentKind = typeof contentKinds[number];
// Kinds a person can write through save_content; a teacher may write video lessons only (the database enforces this too).
export const authorableKinds: readonly ContentKind[] = ["video_lesson", "course_group", "screen_text"];

// Screen texts an author may replace through the content workspace (also read by the learner app and the Edge publisher, which is why
// it lives in this import-free file). Everything NOT listed is locked ("đã chốt"): Owner-approved copy, consent and privacy notes,
// safety and body-check wording stay in the app code and change only with the Owner's sign-off and a release. Add a key only when the
// Owner agrees the text may change without a release; it must exist in the app texts (src/i18n/*.ts, joined in src/i18n.ts; a test checks), carry no {placeholder}, and not be
// a privacy, consent, safety or medical statement.
export const screenTextKeys = [
  "discover.freeCourses",
  "discover.freeCoursesLead",
  "discover.courseStatus",
  "course.lessonsHeading",
] as const;
export type ScreenTextKey = typeof screenTextKeys[number];
export const isScreenTextKey = (key: string): key is ScreenTextKey => (screenTextKeys as readonly string[]).includes(key);
// A replacement is plain text only: no placeholder braces (the app code decides where values go) and a bounded length.
export const validScreenValue = (v: unknown): v is string => typeof v === "string" && v.trim().length >= 1 && v.length <= 500 && !/[{}<>]/.test(v);

const plain = (v: unknown): v is Record<string, unknown> => Boolean(v && typeof v === "object" && !Array.isArray(v));
const onlyKeys = (v: Record<string, unknown>, keys: string[]) => Object.keys(v).every(k => keys.includes(k));
const str = (v: unknown, min: number, max: number) => typeof v === "string" && v.trim().length >= min && v.length <= max;
const strings = (v: unknown, maxCount: number, maxLen: number, pattern?: RegExp): v is string[] =>
  Array.isArray(v) && v.length <= maxCount && v.every(s => typeof s === "string" && s.trim().length > 0 && s.length <= maxLen && (!pattern || pattern.test(s)));

const youtubeId = /^[A-Za-z0-9_-]{11}$/;
const durationLabel = /^\d{1,2}:\d{2}$/;
const lessonId = /^video-[a-z0-9_-]{1,74}$/;
const languageTag = /^[a-z]{2,3}(-[A-Za-z0-9]{2,8})?$/;
// Browse areas a lesson can be filed under, chosen by the author (replaces guessing from the title). Must match LessonArea in src/courses/lessonFinder.ts.
export const lessonAreaIds = ["neck-shoulders", "back", "hips-legs", "whole-body", "poses"] as const;
export const validAreas = (v: unknown): v is string[] => Array.isArray(v) && v.length <= lessonAreaIds.length && new Set(v).size === v.length && v.every(a => (lessonAreaIds as readonly string[]).includes(a as string));

export function validPayload(kind: string, payload: unknown): boolean {
  if (!plain(payload)) return false;
  if (kind === "video_lesson") {
    return onlyKeys(payload, ["youtubeId", "summary", "durationLabel", "orientation", "visibility", "captionsVerified", "captionLanguages", "tags", "areas"])
      && typeof payload.youtubeId === "string" && youtubeId.test(payload.youtubeId)
      && str(payload.summary, 1, 1000)
      && typeof payload.durationLabel === "string" && durationLabel.test(payload.durationLabel)
      && (payload.orientation === "portrait" || payload.orientation === "landscape")
      && (payload.visibility === undefined || ["private", "unlisted", "public"].includes(payload.visibility as string))
      && (payload.captionsVerified === undefined || typeof payload.captionsVerified === "boolean")
      && (payload.captionLanguages === undefined || strings(payload.captionLanguages, 6, 12, languageTag))
      && (payload.tags === undefined || strings(payload.tags, 8, 40))
      && (payload.areas === undefined || validAreas(payload.areas));
  }
  if (kind === "course_group") {
    const g = payload.guidance;
    return onlyKeys(payload, ["summary", "lessonIds", "guidance"])
      && str(payload.summary, 1, 1000)
      && strings(payload.lessonIds, 80, 80, lessonId) && new Set(payload.lessonIds as string[]).size === (payload.lessonIds as string[]).length
      && (g === undefined || (plain(g) && onlyKeys(g, ["reviewed", "benefits", "cautions"]) && typeof g.reviewed === "boolean"
        && strings(g.benefits, 8, 300) && strings(g.cautions, 8, 300)));
  }
  if (kind === "screen_text") {
    if (!onlyKeys(payload, ["locale", "entries"]) || (payload.locale !== "vi-VN" && payload.locale !== "en-US") || !plain(payload.entries)) return false;
    // Only keys on the allow-list can be replaced; every other key is locked ("đã chốt") and is refused, not ignored.
    const keys = Object.keys(payload.entries);
    return keys.length >= 1 && keys.every(k => isScreenTextKey(k) && validScreenValue((payload.entries as Record<string, unknown>)[k]));
  }
  return false;
}

// Display configuration (phase 2b). The database validates the same rules; this mirrors them so the Owner sees an error before a call.
export const discoverSections = ["editors_choice", "video_groups", "quick_find", "reading"] as const;
export type DisplayConfig = {
  discover_order: string[];
  policies: { show_teacher_names: boolean; ai_image_label: boolean };
  editors_choice: string[];
  review_rules: Record<"video_lesson" | "course_group" | "reading_unit" | "screen_text", { owner_self_review: boolean }>;
};
export function validDisplayConfig(config: unknown): config is DisplayConfig {
  if (!plain(config) || !onlyKeys(config, ["discover_order", "editors_choice", "policies", "review_rules"]) || Object.keys(config).length !== 4) return false;
  const order = config.discover_order;
  if (!Array.isArray(order) || order.length !== 4 || new Set(order).size !== 4 || !order.every(s => (discoverSections as readonly string[]).includes(s as string))) return false;
  // Product rule: video is the focus, so the video groups always stay above reading.
  if (order.indexOf("video_groups") > order.indexOf("reading")) return false;
  const p = config.policies;
  if (!plain(p) || Object.keys(p).length !== 2 || typeof p.show_teacher_names !== "boolean" || typeof p.ai_image_label !== "boolean") return false;
  const slots = config.editors_choice;
  if (!Array.isArray(slots) || slots.length > 3 || new Set(slots).size !== slots.length || !slots.every(s => typeof s === "string" && /^[a-z0-9_-]{1,80}$/.test(s))) return false;
  const rules = config.review_rules;
  if (!plain(rules) || Object.keys(rules).length !== 4) return false;
  return ["video_lesson", "course_group", "reading_unit", "screen_text"].every(k => {
    const r = rules[k];
    return plain(r) && Object.keys(r).length === 1 && typeof r.owner_self_review === "boolean";
  });
}
