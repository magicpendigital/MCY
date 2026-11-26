import { makeSnapshot } from "./snapshots";
import type { DemoState, Snapshot } from "./model";

// The signed-in feedback path, shared by the full reflection footer and the Chút end screen. Entries are added to this
// session's history only with the wellbeing-data consent (saveFeedbackConsent); `lastReflection` always shows what was
// just answered on the sync screen. The caller then goes through routes.sync.
export function appendSessionFeedback(previous: DemoState, entries: Snapshot[], latest: Snapshot): Pick<DemoState, "history" | "lastReflection"> {
  return { history: previous.saveFeedbackConsent ? [...previous.history, ...entries] : previous.history, lastReflection: latest };
}

/** The reflection footer's save (unchanged behaviour): one "Sau tập" entry, plus the check-in baseline when it is local. */
export function savedReflectionState(previous: DemoState, skip: boolean, recordedAt: Date): DemoState {
  const before = makeSnapshot("Trước tập", previous.reflectionBeforeStatus, previous.reflectionBeforeObservations, {}, recordedAt);
  const after = makeSnapshot("Sau tập", skip ? "skipped" : previous.postBodyStatus ?? (previous.postObservations.length ? "reported" : null), skip ? [] : previous.postObservations, { lessonTitle: previous.reflectionLessonTitle || undefined, outcome: skip ? null : previous.outcome, pace: skip ? null : previous.pace, note: skip ? "" : previous.note, endedEarly: previous.endedEarly, feedbackSkipped: skip }, recordedAt);
  const localBefore = previous.currentRemoteCheckinId || !previous.reflectionHasCheckinBaseline ? [] : [before];
  return { ...previous, ...appendSessionFeedback(previous, [...localBefore, after], after), preObservations: [], postObservations: [], bodyStatus: null, postBodyStatus: null, regions: [], outcome: null, pace: null, note: "", checkinBaselineReady: false, reflectionHasCheckinBaseline: false, reflectionBeforeStatus: null, reflectionBeforeObservations: [], reflectionLessonTitle: "" };
}
