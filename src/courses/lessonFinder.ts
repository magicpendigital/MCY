import type { CourseLesson, FreeCourse, FreeCourseId } from "./freeCourses";

// Browse helpers for the free-lesson library. Areas are derived from the lesson *title* only: they are a way
// to scan 38 short clips, not a statement about what a clip is good for and never a recommendation from a check-in.
export type LessonArea = "neck-shoulders" | "back" | "hips-legs" | "whole-body" | "poses";
export type LessonLength = "short" | "medium";

export const LESSON_AREAS: readonly { id: LessonArea; label: string }[] = [
  { id: "neck-shoulders", label: "Cổ và vai" },
  { id: "back", label: "Lưng" },
  { id: "hips-legs", label: "Hông và chân" },
  { id: "whole-body", label: "Toàn thân" },
  { id: "poses", label: "Tư thế" },
];
export const LESSON_LENGTHS: readonly { id: LessonLength; label: string }[] = [
  { id: "short", label: "Dưới 30 giây" },
  { id: "medium", label: "30 giây – 1 phút" },
];

const areaRules: readonly [LessonArea, RegExp][] = [
  // No lookbehind here: it needs Safari 16.4, and one such regex makes the whole chunk fail to parse on iOS 15 (INC-001).
  ["neck-shoulders", /(?:^|[^\p{L}])(?:cổ|vai)(?!\p{L})/iu],
  ["back", /(lưng|cột sống|bò mèo|rắn hổ mang|quỳ gối ngả sau|bánh xe)/i],
  ["hips-legs", /(hông|chân|gân kheo|nhón gót|đầu bò|trường tấn|chiến binh|quạ|chó)/i],
  ["whole-body", /(toàn thân|thư giãn|giãn cơ)/i],
];

/** Maps a check-in region to a browse area. Used only to offer the learner a shortcut they can accept or ignore. */
export function areaForRegion(region: string): LessonArea | null {
  switch (region) {
    case "neck": case "shoulder": return "neck-shoulders";
    case "upper_back": case "lower_back": return "back";
    case "glute": case "knee": case "foot": return "hips-legs";
    default: return null;
  }
}
export function areasForRegions(regions: readonly string[]): LessonArea[] {
  return [...new Set(regions.flatMap(region => { const area = areaForRegion(region); return area ? [area] : []; }))];
}

export function lessonSeconds(duration: string): number {
  const parts = duration.split(":").map(Number);
  if (parts.some(part => !Number.isFinite(part))) return Number.NaN;
  return parts.reduce((total, part) => total * 60 + part, 0);
}

export function lessonAreas(lesson: Pick<CourseLesson, "title"> & { areas?: readonly string[] }, courseId: FreeCourseId): LessonArea[] {
  // An author's explicit choice wins; unknown ids are ignored. An empty list means "no area on purpose".
  if (lesson.areas) return [...new Set(LESSON_AREAS.map(a => a.id).filter(id => lesson.areas!.includes(id)))];
  const found = areaRules.filter(([, pattern]) => pattern.test(lesson.title)).map(([area]) => area);
  if (courseId === "poses" || courseId === "sequences") found.push("poses");
  return [...new Set(found)];
}

export function lessonLength(lesson: Pick<CourseLesson, "duration">): LessonLength | null {
  const seconds = lessonSeconds(lesson.duration);
  if (!Number.isFinite(seconds)) return null;
  return seconds < 30 ? "short" : seconds <= 64 ? "medium" : null;
}

export type FoundLesson = { courseId: FreeCourseId; courseTitle: string; lesson: CourseLesson; seconds: number };

export function findLessons(courses: readonly FreeCourse[], filters: { area?: LessonArea | null; length?: LessonLength | null }): FoundLesson[] {
  return courses.flatMap(course => course.lessons
    .filter(lesson => (!filters.area || lessonAreas(lesson, course.id).includes(filters.area)) && (!filters.length || lessonLength(lesson) === filters.length))
    .map(lesson => ({ courseId: course.id, courseTitle: course.title, lesson, seconds: lessonSeconds(lesson.duration) })));
}

/** The shortest clips, for a gentle first look. Ordering is by duration only, never by body area or state. */
export function shortestLessons(courses: readonly FreeCourse[], count: number): FoundLesson[] {
  return findLessons(courses, {}).filter(item => Number.isFinite(item.seconds)).sort((a, b) => a.seconds - b.seconds || a.lesson.id.localeCompare(b.lesson.id)).slice(0, count);
}

export function formatLessonDuration(seconds: number): string {
  if (!Number.isFinite(seconds)) return "";
  return seconds < 60 ? `${seconds} giây` : seconds % 60 === 0 ? `${seconds / 60} phút` : `${Math.floor(seconds / 60)} phút ${seconds % 60} giây`;
}
