import type { PracticeSession } from "./practiceContract.ts";

// Populate only through a content-reviewed release, with exact asset/text hashes,
// expertise/rights evidence and eligibility. Drafts are kept outside this module.
// Empty is deliberate: no model may manufacture a replacement for missing content.
export const reviewedPracticeCatalog: readonly PracticeSession[] = Object.freeze([]);
