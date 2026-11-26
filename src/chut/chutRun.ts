import { useSyncExternalStore } from "react";
import type { ChutRegionId } from "./sequences";

// The Chút sequence in progress, shared by the sequence screen, its header and the end screen. In memory only.
export type ChutResult = { total: number; watched: number; endedEarly: boolean; seconds: number };
export type ChutRun = { id: number; regionId: ChutRegionId; clipCount: number; result: ChutResult | null; counted: boolean };

let run: ChutRun | null = null;
let nextId = 1;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach(listener => listener());

export function startChutRun(regionId: ChutRegionId) {
  run = { id: nextId++, regionId, clipCount: 0, result: null, counted: false };
  emit();
}
export function setChutClipCount(clipCount: number) {
  if (!run || run.clipCount === clipCount) return;
  run = { ...run, clipCount };
  emit();
}
export function finishChutRun(result: ChutResult) {
  if (!run) return;
  run = { ...run, result };
  emit();
}
/** True once per run: the end screen counts a session only the first time it is shown for this run. */
export function claimChutSessionCount(): boolean {
  if (!run || run.counted || !run.result) return false;
  run = { ...run, counted: true };
  return true;
}
export function getChutRun() { return run; }

export function useChutRun(): ChutRun | null {
  return useSyncExternalStore(listener => { listeners.add(listener); return () => { listeners.delete(listener); }; }, () => run, () => run);
}
