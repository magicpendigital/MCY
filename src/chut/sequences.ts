import type { CourseLesson, FreeCourse } from "../courses/freeCourses";

// Chút slice 1 (plan 2026-11-25, section 12, Owner approved 26/11): fixed clip sequences per area, chosen by the Owner.
// They are a rule-based suggestion, not a prescription and not AI. Each clip is named by courseId + lessonId, never by a
// title rule. A clip missing from the loaded catalogue is skipped; with fewer than two left the area falls back to two
// gentle clips and the screen says that no matching lessons were found.
// This file only imports types so the Node unit test can load it directly.

export type ChutRegionId = "neck-shoulders" | "back" | "hips-legs" | "whole-body";
export type ChutClipRef = { courseId: string; lessonId: string };
export type ChutRegion = { id: ChutRegionId; label: string; clips: readonly ChutClipRef[] };

const gentle = (lessonId: string): ChutClipRef => ({ courseId: "gentle", lessonId });

export const CHUT_REGIONS: readonly ChutRegion[] = [
  { id: "neck-shoulders", label: "Cổ và vai", clips: [gentle("06"), gentle("07"), gentle("11"), gentle("14")] },
  { id: "back", label: "Lưng", clips: [gentle("04"), gentle("16"), { courseId: "poses", lessonId: "27" }, gentle("15")] },
  { id: "hips-legs", label: "Hông và chân", clips: [gentle("12"), gentle("08"), gentle("02")] },
  { id: "whole-body", label: "Toàn thân", clips: [gentle("10"), gentle("13"), gentle("09"), gentle("01")] },
];

/** Shown, with a note, when an area has fewer than two of its clips in the catalogue. */
export const CHUT_FALLBACK_CLIPS: readonly ChutClipRef[] = [gentle("01"), gentle("10")];
export const CHUT_MIN_CLIPS = 2;

export type ChutClip = { courseId: string; lessonId: string; lesson: CourseLesson; seconds: number };
export type ChutSequence = { region: ChutRegion; clips: ChutClip[]; fallback: boolean; totalSeconds: number };

export function chutRegion(id: string | null | undefined): ChutRegion | null {
  return CHUT_REGIONS.find(region => region.id === id) ?? null;
}

/** "0:43" → 43. Unparseable durations give 0 so they never break a total. */
export function clipSeconds(duration: string): number {
  if (!/^\d{1,2}:\d{2}$/.test(duration)) return 0;
  const [minutes, seconds] = duration.split(":").map(Number);
  return minutes * 60 + seconds;
}

function resolve(courses: readonly FreeCourse[], refs: readonly ChutClipRef[]): ChutClip[] {
  const clips: ChutClip[] = [];
  for (const ref of refs) {
    const lesson = courses.find(course => course.id === ref.courseId)?.lessons.find(item => item.id === ref.lessonId);
    if (!lesson || (lesson.visibility !== "public" && lesson.visibility !== "unlisted")) continue;
    clips.push({ courseId: ref.courseId, lessonId: ref.lessonId, lesson, seconds: clipSeconds(lesson.duration) });
  }
  return clips;
}

export function buildChutSequence(courses: readonly FreeCourse[], region: ChutRegion): ChutSequence {
  let clips = resolve(courses, region.clips);
  let fallback = false;
  if (clips.length < CHUT_MIN_CLIPS) {
    fallback = true;
    clips = resolve(courses, CHUT_FALLBACK_CLIPS);
  }
  return { region, clips, fallback, totalSeconds: clips.reduce((total, clip) => total + clip.seconds, 0) };
}

/** Whole or half minutes, at least 1, written the Vietnamese way: 117 s → "2", 149 s → "2,5". */
export function approxMinutes(seconds: number): string {
  const halves = Math.max(2, Math.round(seconds / 30));
  return halves % 2 === 0 ? String(halves / 2) : `${Math.floor(halves / 2)},5`;
}

/** "{n} bài · ~{m} phút" under each chip. */
export function chipSummary(sequence: Pick<ChutSequence, "clips" | "totalSeconds">): string {
  return `${sequence.clips.length} bài · ~${approxMinutes(sequence.totalSeconds)} phút`;
}

/** Remaining time from clip `index` (inclusive) to the end, e.g. "1 phút 20 giây". */
export function remainingLabel(clips: readonly Pick<ChutClip, "seconds">[], index: number): string {
  const seconds = clips.slice(Math.max(0, index)).reduce((total, clip) => total + clip.seconds, 0);
  if (seconds < 60) return `${seconds} giây`;
  return seconds % 60 === 0 ? `${seconds / 60} phút` : `${Math.floor(seconds / 60)} phút ${seconds % 60} giây`;
}
