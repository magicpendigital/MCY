import { publicStorageBase } from "../backend/supabase";
import type { ContentManifest, PublishedGroup, PublishedLesson } from "../../supabase/functions/_shared/contentManifestTypes";
import type { CourseLesson, FreeCourse } from "./freeCourses";
import { LESSON_AREAS } from "./lessonFinder";

// The learner catalogue. When the Owner has approved and switched on content, the server writes one public snapshot file and
// this app reads it (no sign-in). Anything wrong with that file, or no file, means the bundled catalogue is used, so a failure
// here can never leave the Khám phá screen empty. Every value is checked before it is used.
export type SectionId = "editors_choice" | "video_groups" | "quick_find" | "reading";
export type EditorsPick = { courseId: string; lessonId: string | null; title: string; subtitle: string; byline: string | null };
export type Catalog = {
  courses: FreeCourse[];
  source: "snapshot" | "bundled";
  display: { order: SectionId[]; picks: EditorsPick[]; showTeacherNames: boolean; aiImageLabel: boolean };
};

const BUCKET = "content-published";
const sections: readonly SectionId[] = ["editors_choice", "video_groups", "quick_find", "reading"];
// Today's screen: the finder first, the video groups, reading last. Used until a snapshot says otherwise.
const bundledDisplay: Catalog["display"] = { order: ["quick_find", "video_groups", "reading"], picks: [], showTeacherNames: true, aiImageLabel: true };
const itemId = /^[a-z0-9_-]{1,80}$/;
const areaIds: readonly string[] = LESSON_AREAS.map(a => a.id);
const youtubeId = /^[A-Za-z0-9_-]{11}$/;
const plain = (v: unknown): v is Record<string, unknown> => Boolean(v && typeof v === "object" && !Array.isArray(v));
const text = (v: unknown, max: number): v is string => typeof v === "string" && v.length > 0 && v.length <= max;
const textList = (v: unknown, max: number, each: number): v is string[] => Array.isArray(v) && v.length <= max && v.every(s => text(s, each));

function parseLesson(raw: unknown): PublishedLesson | null {
  if (!plain(raw) || !text(raw.id, 80) || !itemId.test(raw.id) || !text(raw.title, 200) || typeof raw.youtube_id !== "string" || !youtubeId.test(raw.youtube_id)
    || !text(raw.summary, 1000) || typeof raw.duration !== "string" || !/^[0-9]{1,2}:[0-9]{2}$/.test(raw.duration) || (raw.orientation !== "portrait" && raw.orientation !== "landscape")
    || typeof raw.captions_verified !== "boolean" || !textList(raw.caption_languages, 6, 12) || !(raw.byline === null || text(raw.byline, 120))
    || !(raw.visibility === undefined || ["private", "unlisted", "public"].includes(raw.visibility as string)) || !(raw.tags === undefined || textList(raw.tags, 8, 40))
    || !(raw.areas === undefined || (Array.isArray(raw.areas) && raw.areas.length <= 5 && new Set(raw.areas).size === raw.areas.length && raw.areas.every(a => typeof a === "string" && areaIds.includes(a))))) return null;
  return raw as unknown as PublishedLesson;
}
function parseGroup(raw: unknown): PublishedGroup | null {
  if (!plain(raw) || !text(raw.id, 80) || !itemId.test(raw.id) || !text(raw.title, 200) || !text(raw.summary, 1000) || !textList(raw.lesson_ids, 80, 80) || raw.lesson_ids.length === 0
    || !(raw.byline === null || text(raw.byline, 120))) return null;
  if (raw.guidance !== undefined && !(plain(raw.guidance) && typeof raw.guidance.reviewed === "boolean" && textList(raw.guidance.benefits, 8, 300) && textList(raw.guidance.cautions, 8, 300))) return null;
  return raw as unknown as PublishedGroup;
}
export function parseManifest(data: unknown): ContentManifest | null {
  if (!plain(data) || data.v !== 1 || !Array.isArray(data.groups) || !Array.isArray(data.lessons) || data.groups.length > 20 || data.lessons.length > 300 || !plain(data.display)) return null;
  const d = data.display;
  if (!Array.isArray(d.discover_order) || d.discover_order.length !== 4 || new Set(d.discover_order).size !== 4 || !d.discover_order.every(s => sections.includes(s as SectionId))
    || !plain(d.policies) || typeof d.policies.show_teacher_names !== "boolean" || typeof d.policies.ai_image_label !== "boolean" || !textList(d.editors_choice, 3, 80)) return null;
  const order = d.discover_order as string[];
  if (order.indexOf("video_groups") > order.indexOf("reading")) return null;
  const lessons = data.lessons.map(parseLesson), groups = data.groups.map(parseGroup);
  if (lessons.some(l => l === null) || groups.some(g => g === null)) return null;
  const known = new Set((lessons as PublishedLesson[]).map(l => l.id));
  // Every group must only use lessons that are in the file, and ids must be unique.
  if ((groups as PublishedGroup[]).some(g => g.lesson_ids.some(id => !known.has(id))) || known.size !== lessons.length || new Set((groups as PublishedGroup[]).map(g => g.id)).size !== groups.length) return null;
  return { v: 1, generated_at: typeof data.generated_at === "string" ? data.generated_at : "", display: d as ContentManifest["display"], groups: groups as PublishedGroup[], lessons: lessons as PublishedLesson[] };
}

// Ids of the imported catalogue stay what the device already remembers: group-gentle -> gentle, video-gentle-01 -> 01.
const courseIdOf = (groupId: string) => groupId.startsWith("group-") ? groupId.slice(6) : groupId;
const lessonIdOf = (courseId: string, id: string) => id.startsWith(`video-${courseId}-`) && id.length > `video-${courseId}-`.length ? id.slice(`video-${courseId}-`.length) : id;

export function catalogFromManifest(m: ContentManifest): Catalog {
  const byId = new Map(m.lessons.map(l => [l.id, l]));
  const show = m.display.policies.show_teacher_names;
  const courses: FreeCourse[] = m.groups.map(g => {
    const courseId = courseIdOf(g.id);
    const lessons: CourseLesson[] = g.lesson_ids.map(id => byId.get(id)!).map(l => ({
      id: lessonIdOf(courseId, l.id), youtubeId: l.youtube_id, title: l.title, duration: l.duration, description: l.summary, visibility: l.visibility === "private" || l.visibility === "public" ? l.visibility : "unlisted",
      orientation: l.orientation, channelCaptionsVerified: l.captions_verified, channelCaptionLanguages: l.caption_languages, ...(l.areas ? { areas: l.areas } : {}), byline: show ? l.byline : null,
    }));
    return { id: courseId, title: g.title, description: g.summary, ...(g.guidance ? { guidance: g.guidance } : {}), lessons };
  });
  const picks: EditorsPick[] = [];
  for (const id of m.display.editors_choice) {
    const group = m.groups.find(g => g.id === id);
    if (group) { const c = courses.find(x => x.id === courseIdOf(group.id)); if (c) picks.push({ courseId: c.id, lessonId: c.lessons[0]?.id ?? null, title: c.title, subtitle: c.description, byline: show ? group.byline : null }); continue; }
    const lesson = byId.get(id);
    const owner = lesson && m.groups.find(g => g.lesson_ids.includes(id));
    const c = owner && courses.find(x => x.id === courseIdOf(owner.id));
    if (lesson && c) picks.push({ courseId: c.id, lessonId: lessonIdOf(c.id, lesson.id), title: lesson.title, subtitle: c.title, byline: show ? lesson.byline : null });
  }
  return { courses, source: "snapshot", display: { order: m.display.discover_order as SectionId[], picks, showTeacherNames: show, aiImageLabel: m.display.policies.ai_image_label } };
}

async function fetchManifest(): Promise<ContentManifest | null> {
  const root = publicStorageBase(BUCKET);
  if (!root) return null;
  try {
    const response = await fetch(`${root}/manifest.json`, { cache: "no-cache", credentials: "omit", headers: { Accept: "application/json" } });
    if (!response.ok) return null;
    return parseManifest(await response.json());
  } catch {
    return null;
  }
}

// One read per app session. The bundled catalogue is the answer whenever the snapshot is missing, empty or invalid.
let catalogRead: Promise<Catalog> | null = null;
export function loadCatalog(refresh = false): Promise<Catalog> {
  if (catalogRead && !refresh) return catalogRead;
  const request = (async (): Promise<Catalog> => {
    const [bundled, manifest] = await Promise.all([import("./freeCourses"), fetchManifest()]);
    if (manifest && manifest.groups.length > 0) return catalogFromManifest(manifest);
    return { courses: bundled.FREE_COURSES, source: "bundled", display: bundledDisplay };
  })();
  catalogRead = request;
  // A failed bundled import must not be cached: the next visit can retry.
  request.catch(() => { if (catalogRead === request) catalogRead = null; });
  return request;
}
