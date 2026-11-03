import { expect, test } from "@playwright/test";
import {
  emptyConsentState,
  hasCurrentConsentForPurpose,
  hasCurrentRequiredConsent,
  CONSENT_POLICY_VERSIONS,
  isCurrentLearnerSession,
  REQUIRED_CONSENT_POLICY_VERSIONS,
} from "../src/backend/learnerData";

test("required consent is reusable until a required policy version changes", () => {
  const accepted = { ...emptyConsentState, terms: true, privacy: true };
  expect(hasCurrentRequiredConsent(accepted, REQUIRED_CONSENT_POLICY_VERSIONS)).toBe(true);
  expect(hasCurrentRequiredConsent(accepted, { ...REQUIRED_CONSENT_POLICY_VERSIONS, privacy: "privacy-review-0.0" })).toBe(false);
  expect(hasCurrentRequiredConsent({ ...accepted, terms: false }, REQUIRED_CONSENT_POLICY_VERSIONS)).toBe(false);
});

test("optional wellbeing consent is usable only for its current policy version", () => {
  const consent = { ...emptyConsentState, wellbeing_data: true };
  expect(hasCurrentConsentForPurpose("wellbeing_data", consent, CONSENT_POLICY_VERSIONS)).toBe(true);
  expect(hasCurrentConsentForPurpose("wellbeing_data", consent, { ...CONSENT_POLICY_VERSIONS, wellbeing_data: "wellbeing-data-review-0.0" })).toBe(false);
  expect(hasCurrentConsentForPurpose("wellbeing_data", emptyConsentState, CONSENT_POLICY_VERSIONS)).toBe(false);
});

test("account-scoped async results are accepted only by their initiating signed-in session", () => {
  expect(isCurrentLearnerSession(true, "learner-a", "learner-a")).toBe(true);
  expect(isCurrentLearnerSession(false, null, "learner-a")).toBe(false);
  expect(isCurrentLearnerSession(true, "learner-b", "learner-a")).toBe(false);
});
