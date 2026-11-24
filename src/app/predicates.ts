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
// The device's guest journal belongs to settled guest mode only. It is hidden, and a check-in is never saved to it,
// while a session is being restored, and also when a stored sign-in could not be restored ("error"): that person is
// an account holder, so their entry must not land silently in the device journal and then vanish once they sign in.
// `storedAuthSession` is hasStoredAuthSession() from the caller (kept as a parameter so this stays pure).
export function showsGuestJournal(state: Pick<DemoState, "signedIn" | "backendStatus">, storedAuthSession: boolean) {
  if (state.signedIn || state.backendStatus === "loading") return false;
  return !storedAuthSession || state.backendStatus === "ready";
}
