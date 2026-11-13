# MCY task lifecycle

This is mandatory working guidance for every MCY task, including research, documentation, fixes and feature work. Read it before implementation, together with the latest user decision, [AGENTS.md](../../AGENTS.md), the [change-review skill](../../.claude/skills/mcy-change-review/SKILL.md) and its [risk matrix](../../.claude/skills/mcy-change-review/references/review-matrix.md). Existing authorization persists; this process adds no permission to run external actions and no extra confirmation for work already authorized. Current native HALTED and web release gates remain governed by AGENTS.md.

The lifecycle is documented guidance, not a runtime, CI or repository permission boundary. Checklists and hashes cannot guarantee zero regression, discover every dependency or prove a reviewer's identity. Verify remote required checks and release permissions separately when relevant.

## Before edits: intake and impact assessment

Record the following before changing implementation. The intake is a plan file: copy [plans/_TEMPLATE.md](../../plans/_TEMPLATE.md) to `plans/active/<YYYY-MM-DD>-<name>.md` and check it with `npm run check:plan` ([TASK_INTAKE.template.md](TASK_INTAKE.template.md) lists the same fields in English); a small R0 task can record the same information briefly in the task response. Read-only discovery needed to complete intake is allowed. Mark unknowns and resolve those that affect safe implementation rather than guessing.

1. **Decision and outcome:** latest authorized request, evidence of approved previous step, desired observable result, acceptance criteria, in-scope work, exclusions and any user-required stop before the next step. Sync relevant referenced decisions or chat evidence first; distinguish retrieved statements from current source and observed behavior.
2. **Current baseline:** actual source/configuration, revision or scoped hashes, dirty files and ownership. List existing working behavior to preserve, relevant passing evidence with source/environment/date, preexisting failures and missing evidence. An old PASS is historical unless its inputs and environment still apply; an unrun baseline is BLOCKED, not a new failure or a claimed PASS. Do not reset or overwrite unrelated work.
3. **Impact map:** trace entry point → caller/dependency → changed contract/state → consumer/output. Cover navigation/UI/locales/accessibility, storage/preferences, data/API/schema, identity/roles/consent, content/media/AI, web/native/runtime, build/config and workflow controls as applicable. Include adjacent consumers and failure/retry/account/route transitions. Give an evidence-based reason for each excluded surface; reading a filename alone is not a dependency audit.
4. **Risk and regression plan:** choose the highest R0–R3 tier from the matrix, including control changes. Map each changed behavior and preserved adjacent behavior to an appropriate check, expected result and environment. Inspect current package scripts, test source and config/testMatch; select meaningful affected tests plus applicable baseline gates. Record missing coverage and live/device prerequisites. Do not run unrelated full suites by default or downgrade risk because tests are absent.
5. **Execution boundary:** file ownership, implementer, reviewer/QC and final verifier; stop conditions, source-only rollback or compatible disable/forward-recovery path; external effects/caps/cost/target if any. Existing live-operation approval rules still apply. A plan or fixture test does not authorize a cloud write, email, native installation or deployment.

The coordinator checks that intake is complete before handing implementation over. If new evidence expands scope or risk, update intake and the test plan before that work. Ask only when required information or authorization is actually missing; preserve explicit per-step approval boundaries.

## Implementation and bounded verification

Work within the assigned files. For delegated work, the coordinator reconciles dependencies and ownership before overlapping edits; the implementer must not declare the independent reviewer's or root's verdict. When the user requires root coordination only, delegate implementation and keep root edits out of application source.

Preserve preimages or a scoped patch against the actual dirty baseline when rollback would otherwise be ambiguous. Fix causes rather than weakening assertions, guards, checkers or locks. Record each check's exact command, source identity, environment, exit status and evidence path. Preserve initial failures, interruptions and supplemental runs; do not turn a failed broad process plus a passing focused rerun into a broad PASS.

Use PASS, FAIL, BLOCKED and NOT_APPLICABLE for new task records. PASS requires successful process exit and the asserted outcome; BLOCKED includes unrun/unavailable checks (historical CHƯA CHẠY). NOT_APPLICABLE requires a scoped reason. Separate fixture, local browser, simulator, physical device, live API/data and user-reported evidence. None substitutes for another acceptance claim.

## Freeze, independent QC and final verification

Before final QC, freeze the candidate: list exact changed files, relevant dependent inputs, tests/harness/config and deliverable artifacts with SHA-256 or an immutable revision, together with commands/results. Keep evidence/manifest identity separate to avoid circular self-hashes. A dirty checkout's HEAD alone is insufficient. Preserve earlier freezes and reviews as history.

Use the [QC template](TASK_QC.template.md). QC reviews the actual frozen diff, impact map, expected outcomes, preserved behavior, failures and evidence limits; it should exercise meaningful negative/edge cases when relevant. R3 controls require an independent review of the control itself. Other tasks use review proportional to risk and the user's required workflow. Missing required independent expertise or evidence remains BLOCKED; self-review cannot be relabeled independent QC. Changing this workflow/skill requires syntax/link validation and forward walkthroughs of R0 copy/read-only, R1 real UI and R3 permission/media scenarios.

After a source, test, dependency, configuration or artifact change, issue a new freeze. Reopen affected review findings and rerun checks that consume changed inputs, plus applicable baseline gates and downstream regression. Reuse unchanged evidence only with an explicit input/environment comparison and justification; never silently carry the former verdict onto new bytes. Documentation added after freeze must not silently alter source or claims; record it separately and verify links/claims.

The final verifier checks the final pins, review attribution, required results, residual risks and rollback path before handoff. In a coordinated task, root performs and records this final check, using direct artifact inspection and appropriate user-visible checks; root cannot infer completion solely from implementer reports. For the current approved UX sequence, each step must finish independent QC, root verification and user review before the next step starts. User approval of one step does not approve the next; an explicit new decision can authorize it.

## Handoff and next step

State what changed and why, completed acceptance criteria, tested/untested behavior, failures and their disposition, source/artifact identity, independent QC and root/final-verifier result, residual risks, rollback/disable limits and the next authorized action. Separate local implementation from live/native/release acceptance. Stop at an explicit user review boundary. Retain historical receipts; do not rewrite failed trials or old prepared packets as current approval.
