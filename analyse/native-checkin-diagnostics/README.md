# Isolated check-in diagnostics

These fictional web fixtures live outside the normal test suite. They do not issue staging requests or establish native acceptance.

`playwright.config.mjs` serves the original source through the existing managed Vite setup. The pre-dispatch cancellation diagnostic is deliberately red on the frozen original source; see `../MCY_NATIVE_CHECKIN_DIAGNOSTIC_ORIGINAL_2026-10-13.json`.

`candidate.playwright.config.mjs` serves the source-only shadow. `candidate-regression.playwright.config.mjs` selects the existing learner-write/device fixtures against the same shadow. Both use the corrected setup, pin 68 source files and three auxiliary files before/after runner-owned server closure, and require the prepared source snapshots. Exact 2+19 results are in `../MCY_NATIVE_LATE_SAVE_CANDIDATE_VERIFICATION_2026-10-13.json`.

The initial preparation and failed missing-stylesheet run are historical. `intermediate-missing-tokens/` preserves their errors/control files; do not rerun those as the current candidate. The source preparer is exclusive and refuses an existing shadow. The final shadow additionally contains the exact unchanged token stylesheet from the auxiliary-input receipt.

Independent source clearance preceded each run. Final narrative reviews completed later where documented. Preserve frozen reviews, receipts and original application files; this candidate is not installed, deployed, or proof of the cause of the extra native B record.
