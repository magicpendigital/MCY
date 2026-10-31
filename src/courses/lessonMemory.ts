import { useSyncExternalStore } from "react";

// Device-local memory for the free video lessons: saved lessons, the lessons the learner opened the player for, and
// best-effort playback progress from the YouTube player. It never leaves the device and is not tied to an account.
// "Opened" means the learner pressed Play. "Completed" is only set when the player reported enough forward playback;
// if the player never reports (offline, blocked), a lesson stays "opened" and nothing here claims it was watched.
const STORAGE_KEY = "mcy.lessonMemory.v1";
const MAX_SAVED = 60;
const MAX_OPENED = 120;

export type LessonRef = { courseId: string; lessonId: string };
export type LessonProgress = { watchedSeconds: number; durationSeconds: number; completed: boolean; at: string };
export type LessonMemory = { saved: LessonRef[]; opened: LessonRef[]; last: (LessonRef & { at: string }) | null; progress: Record<string, LessonProgress> };

const EMPTY: LessonMemory = { saved: [], opened: [], last: null, progress: {} };
export const progressKey = (ref: LessonRef) => `${ref.courseId}:${ref.lessonId}`;
const isProgress = (value: unknown): value is LessonProgress => {
  const item = value as Partial<LessonProgress> | null;
  return Boolean(item && Number.isFinite(item.watchedSeconds) && Number.isFinite(item.durationSeconds) && typeof item.completed === "boolean" && typeof item.at === "string");
};
const isRef = (value: unknown): value is LessonRef => {
  const item = value as Partial<LessonRef> | null;
  return Boolean(item && typeof item.courseId === "string" && typeof item.lessonId === "string" && item.courseId.length < 40 && item.lessonId.length < 40);
};
const sameRef = (a: LessonRef, b: LessonRef) => a.courseId === b.courseId && a.lessonId === b.lessonId;

function parse(raw: string | null): LessonMemory {
  if (!raw) return EMPTY;
  try {
    const data = JSON.parse(raw) as Partial<LessonMemory>;
    const last = data.last as (LessonRef & { at?: unknown }) | null | undefined;
    return {
      saved: Array.isArray(data.saved) ? data.saved.filter(isRef).slice(0, MAX_SAVED) : [],
      opened: Array.isArray(data.opened) ? data.opened.filter(isRef).slice(0, MAX_OPENED) : [],
      last: last && isRef(last) && typeof last.at === "string" ? { courseId: last.courseId, lessonId: last.lessonId, at: last.at } : null,
      progress: Object.fromEntries(Object.entries(data.progress && typeof data.progress === "object" ? data.progress : {}).filter(([key, value]) => key.length < 90 && isProgress(value)).slice(0, MAX_OPENED)) as Record<string, LessonProgress>,
    };
  } catch {
    return EMPTY;
  }
}

let snapshot: LessonMemory = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded) return;
  loaded = true;
  try { snapshot = parse(window.localStorage.getItem(STORAGE_KEY)); } catch { snapshot = EMPTY; }
}
function commit(next: LessonMemory) {
  snapshot = next;
  try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* Private mode or blocked storage: memory then lasts for this session only. */ }
  listeners.forEach(listener => listener());
}

export function getLessonMemory(): LessonMemory { load(); return snapshot; }
export function isLessonSaved(memory: LessonMemory, ref: LessonRef) { return memory.saved.some(item => sameRef(item, ref)); }
export function isLessonOpened(memory: LessonMemory, ref: LessonRef) { return memory.opened.some(item => sameRef(item, ref)); }

export function toggleSavedLesson(ref: LessonRef) {
  const memory = getLessonMemory();
  const ours = { courseId: ref.courseId, lessonId: ref.lessonId };
  commit({ ...memory, saved: isLessonSaved(memory, ours) ? memory.saved.filter(item => !sameRef(item, ours)) : [ours, ...memory.saved].slice(0, MAX_SAVED) });
}
export function recordLessonOpened(ref: LessonRef, now = new Date()) {
  const memory = getLessonMemory();
  const ours = { courseId: ref.courseId, lessonId: ref.lessonId };
  commit({ ...memory, opened: [ours, ...memory.opened.filter(item => !sameRef(item, ours))].slice(0, MAX_OPENED), last: { ...ours, at: now.toISOString() } });
}
/** Keeps the best watched time and never un-completes a lesson. Called a few times a minute while a lesson plays. */
export function recordLessonProgress(ref: LessonRef, report: { watchedSeconds: number; durationSeconds: number; completed: boolean }, now = new Date()) {
  if (!Number.isFinite(report.watchedSeconds) || !Number.isFinite(report.durationSeconds) || report.durationSeconds <= 0) return;
  const memory = getLessonMemory();
  const key = progressKey(ref);
  const before = memory.progress[key];
  const next: LessonProgress = {
    watchedSeconds: Math.max(before?.watchedSeconds ?? 0, Math.min(report.watchedSeconds, report.durationSeconds * 3)),
    durationSeconds: report.durationSeconds,
    completed: Boolean(before?.completed) || report.completed,
    at: now.toISOString(),
  };
  if (before && before.watchedSeconds === next.watchedSeconds && before.completed === next.completed) return;
  const entries = Object.entries({ ...memory.progress, [key]: next });
  commit({ ...memory, progress: Object.fromEntries(entries.slice(-MAX_OPENED)) });
}
export function isLessonCompleted(memory: LessonMemory, ref: LessonRef) { return memory.progress[progressKey(ref)]?.completed === true; }
export function clearLessonMemory() { commit(EMPTY); }

export function useLessonMemory(): LessonMemory {
  return useSyncExternalStore(
    listener => { listeners.add(listener); return () => { listeners.delete(listener); }; },
    getLessonMemory,
    () => EMPTY,
  );
}
