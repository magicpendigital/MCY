import { expect, test } from "@playwright/test";
import {
  emptyConsentState,
  hasCurrentRequiredConsent,
  REQUIRED_CONSENT_POLICY_VERSIONS,
} from "../src/backend/learnerData";

test("required consent is reusable until a required policy version changes", () => {
  const accepted = { ...emptyConsentState, terms: true, privacy: true };
  expect(hasCurrentRequiredConsent(accepted, REQUIRED_CONSENT_POLICY_VERSIONS)).toBe(true);
  expect(hasCurrentRequiredConsent(accepted, { ...REQUIRED_CONSENT_POLICY_VERSIONS, privacy: "privacy-review-0.0" })).toBe(false);
  expect(hasCurrentRequiredConsent({ ...accepted, terms: false }, REQUIRED_CONSENT_POLICY_VERSIONS)).toBe(false);
});
