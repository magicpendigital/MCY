// Strict payload shapes for content saved through the workspace. The database stores any jsonb object of the right size;
// this contract is what makes a saved version well-formed. Reading units are not authored here: they reach the store by import.
export const contentKinds = ["video_lesson", "course_group", "reading_unit", "screen_text"] as const;
export type ContentKind = typeof contentKinds[number];
// Kinds a person can write through save_content; a teacher may write video lessons only (the database enforces this too).
export const authorableKinds: readonly ContentKind[] = ["video_lesson", "course_group", "screen_text"];

const plain = (v: unknown): v is Record<string, unknown> => Boolean(v && typeof v === "object" && !Array.isArray(v));
const onlyKeys = (v: Record<string, unknown>, keys: string[]) => Object.keys(v).every(k => keys.includes(k));
const str = (v: unknown, min: number, max: number) => typeof v === "string" && v.trim().length >= min && v.length <= max;
const strings = (v: unknown, maxCount: number, maxLen: number, pattern?: RegExp): v is string[] =>
  Array.isArray(v) && v.length <= maxCount && v.every(s => typeof s === "string" && s.trim().length > 0 && s.length <= maxLen && (!pattern || pattern.test(s)));

const youtubeId = /^[A-Za-z0-9_-]{11}$/;
const durationLabel = /^\d{1,2}:\d{2}$/;
const lessonId = /^video-[a-z0-9_-]{1,74}$/;
const languageTag = /^[a-z]{2,3}(-[A-Za-z0-9]{2,8})?$/;
const entryKey = /^[a-z0-9_.-]{1,60}$/;

export function validPayload(kind: string, payload: unknown): boolean {
  if (!plain(payload)) return false;
  if (kind === "video_lesson") {
    return onlyKeys(payload, ["youtubeId", "summary", "durationLabel", "orientation", "visibility", "captionsVerified", "captionLanguages", "tags"])
      && typeof payload.youtubeId === "string" && youtubeId.test(payload.youtubeId)
      && str(payload.summary, 1, 1000)
      && typeof payload.durationLabel === "string" && durationLabel.test(payload.durationLabel)
      && (payload.orientation === "portrait" || payload.orientation === "landscape")
      && (payload.visibility === undefined || ["private", "unlisted", "public"].includes(payload.visibility as string))
      && (payload.captionsVerified === undefined || typeof payload.captionsVerified === "boolean")
      && (payload.captionLanguages === undefined || strings(payload.captionLanguages, 6, 12, languageTag))
      && (payload.tags === undefined || strings(payload.tags, 8, 40));
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
    const keys = Object.keys(payload.entries);
    return keys.length >= 1 && keys.length <= 40 && keys.every(k => entryKey.test(k) && str((payload.entries as Record<string, unknown>)[k], 1, 500));
  }
  return false;
}
