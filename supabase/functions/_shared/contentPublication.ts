import { internalWording } from "./readingPublication.ts";
import { validPayload, validAreas, isScreenTextKey, validScreenValue } from "./contentWorkspaceContract.ts";
import type { ContentManifest, PublishedGroup, PublishedLesson, PublishedScreens } from "./contentManifestTypes.ts";
export type { ContentManifest, PublishedGroup, PublishedLesson, PublishedScreens };

// The public snapshot of stored content that is effectively shown (phase 4). The database returns only versions that are approved
// at their exact version and switched on after the latest review; this module projects them into a whitelisted file the learner app
// reads without signing in. Author labels are decided here, at publish time. Nothing is read live by the app from private tables.
export const CONTENT_BUCKET = "content-published";
export const MANIFEST_PATH = "manifest.json";
export const EDITORS_CHOICE_LABEL = "Lựa chọn của biên tập · MCY biên soạn";

export type SnapshotItem = { item_id: string; kind: string; seq: number; content_hash: string; title: string; payload: Record<string, unknown>; author_kind: string; origin: string; author_label: string | null };
export type SnapshotSource = { display: { discover_order: string[]; policies: { show_teacher_names: boolean; ai_image_label: boolean }; editors_choice: string[] }; display_version: number; items: SnapshotItem[] };
const plain = (v: unknown): v is Record<string, unknown> => Boolean(v && typeof v === "object" && !Array.isArray(v));
const clean = (...texts: unknown[]) => texts.every(t => typeof t === "string" && t.length > 0 && !internalWording.test(t));
const strings = (v: unknown): string[] => Array.isArray(v) ? v.filter((s): s is string => typeof s === "string") : [];

// The byline never names anyone who is not an active teacher at publish time, and never labels imported content.
function byline(item: SnapshotItem, showTeacherNames: boolean): string | null {
  if (item.author_kind === "teacher") return showTeacherNames && typeof item.author_label === "string" && item.author_label.trim() ? item.author_label.trim().slice(0, 80) : null;
  return item.author_kind === "mcy" && item.origin === "authored" ? EDITORS_CHOICE_LABEL : null;
}

export function buildManifest(source: SnapshotSource, now = new Date()): ContentManifest {
  const show = source.display.policies.show_teacher_names;
  const lessons: PublishedLesson[] = [];
  for (const item of source.items) {
    if (item.kind !== "video_lesson" || !validPayload("video_lesson", item.payload)) continue;
    const p = item.payload;
    if (!clean(item.title, p.summary)) continue;
    lessons.push({
      id: item.item_id, title: item.title, youtube_id: p.youtubeId as string, summary: p.summary as string, duration: p.durationLabel as string, orientation: p.orientation as "portrait" | "landscape",
      ...(typeof p.visibility === "string" ? { visibility: p.visibility } : {}), captions_verified: p.captionsVerified === true, caption_languages: strings(p.captionLanguages),
      ...(Array.isArray(p.tags) && p.tags.length ? { tags: strings(p.tags) } : {}), ...(validAreas(p.areas) ? { areas: p.areas } : {}), byline: byline(item, show),
    });
  }
  const have = new Set(lessons.map(l => l.id));
  const groups: PublishedGroup[] = [];
  for (const item of source.items) {
    if (item.kind !== "course_group" || !validPayload("course_group", item.payload)) continue;
    const p = item.payload;
    const ids = strings(p.lessonIds).filter(id => have.has(id));
    const g = plain(p.guidance) ? p.guidance : null;
    const benefits = g ? strings(g.benefits) : [], cautions = g ? strings(g.cautions) : [];
    if (!ids.length || !clean(item.title, p.summary) || [...benefits, ...cautions].some(t => !clean(t))) continue;
    groups.push({ id: item.item_id, title: item.title, summary: p.summary as string, lesson_ids: ids, ...(g ? { guidance: { reviewed: g.reviewed === true, benefits, cautions } } : {}), byline: byline(item, show) });
  }
  // Screen texts: unlocked keys only, plain wording only; when two shown items set the same key the first in list order wins.
  const screens: PublishedScreens = {};
  for (const item of source.items) {
    if (item.kind !== "screen_text" || !validPayload("screen_text", item.payload)) continue;
    const locale = item.payload.locale as "vi-VN" | "en-US";
    for (const [key, value] of Object.entries(item.payload.entries as Record<string, unknown>)) {
      if (!isScreenTextKey(key) || !validScreenValue(value) || !clean(value)) continue;
      const bucket = (screens[locale] ??= {});
      if (!(key in bucket)) bucket[key] = value;
    }
  }
  const known = new Set([...groups.map(g => g.id), ...lessons.filter(l => groups.some(g => g.lesson_ids.includes(l.id))).map(l => l.id)]);
  return {
    v: 1, generated_at: now.toISOString(),
    display: { discover_order: source.display.discover_order, policies: source.display.policies, editors_choice: source.display.editors_choice.filter(id => known.has(id)) },
    // Only groups that still hold a shown lesson, and only the lessons those groups use, are published.
    groups, lessons: lessons.filter(l => groups.some(g => g.lesson_ids.includes(l.id))),
    ...(Object.keys(screens).length ? { screens } : {}),
  };
}

export type ContentStorage = {
  from(bucket: string): {
    upload?(path: string, body: string, options: { contentType: string; cacheControl: string; upsert: boolean }): PromiseLike<{ data: unknown; error: { message?: string } | null }>;
  };
};
export type SyncResult = { ok: true; groups: number; lessons: number } | { ok: false; error: "storage_unavailable" | "write_failed" | "too_large" };

export async function syncContentSnapshot(storage: ContentStorage | undefined, source: SnapshotSource): Promise<SyncResult> {
  const upload = storage?.from(CONTENT_BUCKET).upload;
  if (!storage || typeof upload !== "function") return { ok: false, error: "storage_unavailable" };
  const manifest = buildManifest(source);
  const body = JSON.stringify(manifest);
  if (body.length > 900_000) return { ok: false, error: "too_large" };
  try {
    // An empty manifest is still written: it withdraws everything and tells the app to use its bundled catalogue.
    const { error } = await storage.from(CONTENT_BUCKET).upload!(MANIFEST_PATH, body, { contentType: "application/json", cacheControl: "60", upsert: true });
    return error ? { ok: false, error: "write_failed" } : { ok: true, groups: manifest.groups.length, lessons: manifest.lessons.length };
  } catch {
    return { ok: false, error: "write_failed" };
  }
}
