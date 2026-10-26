export const reviewChecks = ["contentAccuracy", "audienceScope", "stopGuidance", "accessibility", "rightsConfirmed", "expertiseConfirmed", "vietnameseAudioReady", "actualDurationChecked"] as const;
export type ReviewChecklist = Record<typeof reviewChecks[number], boolean>;
