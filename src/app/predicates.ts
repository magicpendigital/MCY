import { CONSENT_POLICY_VERSIONS } from "../backend/learnerData";
import { rememberedPace } from "../practice/feedbackMemory";
import type { DemoState } from "./model";

export function latestFeedback(state: DemoState) {
  return rememberedPace(state.history, state.saveFeedbackConsent && state.rememberPace && state.usePreviousFeedback);
}

export function hasCurrentAiConsent(state: DemoState) {
  return state.aiConsent
    && state.consentPolicyVersions.ai_processing === CONSENT_POLICY_VERSIONS.ai_processing;
}
export function isCheckinAuthReturn(destination: string) {
  return destination === "discover" || destination === "dialogue";
}
export function normalizeAuthDestination(destination: string) {
  return destination === "dialogue" ? "discover" : destination;
}
// The pilot server refuses to rank practice for reported discomfort, tiredness or an unclear body state (practiceContract.eligibleSessions), so the
// AI path is not offered then: the learner would only get a refusal. Browsing the free lessons stays available.
export function aiPracticeOffered(state: Pick<DemoState, "aiCapability" | "bodyStatus">) {
  return state.aiCapability === "ready" && state.bodyStatus !== "reported" && state.bodyStatus !== "uncertain" && state.bodyStatus !== "tired" && state.bodyStatus !== "uncomfortable";
}
export function hasCheckinBaseline(state: Pick<DemoState, "bodyStatus">) {
  return state.bodyStatus !== null && state.bodyStatus !== "skipped";
}
