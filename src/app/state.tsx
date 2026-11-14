import { createContext, useContext, type Dispatch, type SetStateAction } from "react";
import { backendConfigured } from "../backend/supabase";
import { emptyConsentState } from "../backend/learnerData";
import type { DemoState } from "./model";

export const initialState: DemoState = {
  locale: "vi-VN", checkinStep: 1,
  minutes: 10, energy: null, regions: [], bodyStyle: "feminine", bodyStatus: null, preObservations: [], postObservations: [], postBodyStatus: null, intent: "Bắt nhịp",
  dialogueChoice: null, dialogueText: "", unrecognizedText: "", aiConversation: [], aiPending: false, aiError: "",
  aiCapability: "disabled",
  outcome: null, pace: null, note: "",
  selectedCourseId: null,
  selectedLessonId: null,
  checkinBaselineReady: false,
  reflectionHasCheckinBaseline: false,
  reflectionBeforeStatus: null,
  reflectionBeforeObservations: [],
  reflectionLessonTitle: "",
  endedEarly: false, rememberPace: true, usePreviousFeedback: false, history: [],
  signedIn: false, userId: null, backendStatus: backendConfigured ? "loading" : "ready", backendError: "", remoteCheckins: [], currentRemoteCheckinId: null, pendingCheckinIdempotencyKey: null,
  accountEmail: "", authReturnTo: "home", authMode: "create", authCode: "", displayName: "",
  onboardingComplete: false, termsAccepted: false, privacyAccepted: false, consentBaseline: emptyConsentState, consentPolicyVersions: {}, aiConsent: false, saveFeedbackConsent: false, teacherShareConsent: false,
  marketingConsent: false, shareActive: false, notificationEnabled: false, emailUpdates: false, lastReflection: null,
};

export const DemoContext = createContext<{ state: DemoState; setState: Dispatch<SetStateAction<DemoState>> } | null>(null);

export function useDemo() {
  const context = useContext(DemoContext);
  if (!context) throw new Error("Prototype state missing");
  const update = (patch: Partial<DemoState>) => context.setState(previous => ({ ...previous, ...patch }));
  return { ...context, update };
}

export function clearAccountScopedState(previous: DemoState): DemoState {
  return {
    ...previous,
    signedIn: false,
    userId: null,
    accountEmail: "",
    displayName: "",
    bodyStyle: "feminine",
    checkinStep: 1,
    minutes: 10,
    energy: null,
    regions: [],
    bodyStatus: null,
    preObservations: [],
    postObservations: [],
    postBodyStatus: null,
    dialogueChoice: null,
    dialogueText: "",
    unrecognizedText: "",
    aiConversation: [],
    aiPending: false,
    aiError: "",
    aiCapability: "disabled",
    selectedCourseId: null,
    selectedLessonId: null,
    checkinBaselineReady: false,
    reflectionHasCheckinBaseline: false,
    reflectionBeforeStatus: null,
    reflectionBeforeObservations: [],
    reflectionLessonTitle: "",
    outcome: null,
    pace: null,
    note: "",
    endedEarly: false,
    usePreviousFeedback: false,
    history: [],
    termsAccepted: false,
    privacyAccepted: false,
    consentBaseline: emptyConsentState,
    consentPolicyVersions: {},
    aiConsent: false,
    saveFeedbackConsent: false,
    teacherShareConsent: false,
    marketingConsent: false,
    shareActive: false,
    notificationEnabled: false,
    emailUpdates: false,
    remoteCheckins: [],
    currentRemoteCheckinId: null,
    pendingCheckinIdempotencyKey: null,
    pendingCheckinPayload: null,
    backendError: "",
    lastReflection: null,
  };
}
