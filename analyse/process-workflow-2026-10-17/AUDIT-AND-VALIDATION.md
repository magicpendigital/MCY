# MCY workflow control change — audit, intake and implementer checks

Task date: 2026-10-17 Asia/Bangkok. UTC capture timestamps record the host clock; the date in this folder is a task label. Pre-edit assessment was sent to root before GO; this document preserves that assessment and subsequent results. This is implementer evidence, not independent QC or root acceptance.

## Read-only audit and pre-edit assessment

Existing skill (`skills/mcy-change-review/SKILL.md`, preimage lines 8–15) already required scope, highest risk, final applicable tests and handoff. Matrix preimage lines 12, 22 and 24 required successful runner exit, honest remote-enforcement limits, control review and three forward scenarios. Release runbook lines 9–12 already required intake before edits and exact release approval; lines 42 and 57 said remote controls are proposed and the checker validates evidence only. PR template had scope/risk/tests/rollback. The source CI baseline (`.github/workflows/quality.yml`, lines 3–6 and 27–45) defines PR/main triggers and broad checks; no remote run/ruleset was inspected. The checker (`scripts/release-evidence.mjs`, lines 48–50, 70–73, 99, 150 and 154) binds structured receipt source/bundle/target/exit, policy bytes, known inputs and exact approval, and always returns `releaseAuthorized=false`. It does not discover every dependency, authenticate reviewers or prove test truth. Playwright config matches all `**/*.spec.ts`; dated suite counts should not select today's checks. Step 4.3 coordination evidence shows final source freeze, independent QC and root verification already used for that task.

Gaps addressed: one all-task entry point and proportional intake; explicit dependency/consumer impact map and existing working baseline/preexisting failures; regression selection mapped to impact; file ownership; independent review attribution; final freeze/recheck/root-verifier protocol; user-required next-step boundaries. These strengthen documented practice, not technical enforcement.

Risk: audit R0; proposed/implemented guidance control R3 because skill/review gates change. Scope: seven documentation/control files only, plus this local evidence folder. Dependencies: AGENTS → skill → matrix → lifecycle/templates; PR points to lifecycle. App, API/schema, Auth/consent/roles, data/media/AI, runtime, native, CI/checkers/release configuration and external effects are excluded because no executable/configuration/artifact in those surfaces changes. Current native HALTED and web BLOCKED restrictions remain. No cloud/DB/Auth/email/inference/native/install/deploy operation ran.

Baseline: HEAD `82458fc219a2231ccac279112dfc0db5447b0edd`; dirty tracked/untracked work existed before this task, preserved in `pre-change-status.txt`. Scoped preimages/hashes are in `pre-change.json`; AGENTS and skill already contained uncommitted changes. No fresh app tests or live acceptance were needed or claimed for this process-only diff. Root authorized the scoped edits after reviewing the pre-edit impact assessment. Implementation owner: task_process_audit. Independent reviewer and root verdict remain separate.

Stop conditions: scope spill, inaccessible required inputs, missing required independent control QC or mismatch between freeze and reviewed bytes. Rollback: reverse only this operation's scoped patch against the captured preimages; remove only new process documents if reverting them is authorized. Never reset the dirty checkout or touch historical native receipts. No released runtime rollback is involved.

## Implementer forward walkthroughs

These are manual protocol walkthroughs against the authored guidance, not execution of an app, live API or an independent agent simulation. Each records a plausible task and the resulting allowed plan; actual independent forward evaluation is pending.

| Scenario and evidence considered | Walkthrough result |
|---|---|
| R0: read an already supplied project note and summarize it; optional one-sentence local nonbehavioral copy correction | Record request/outcome/scope and baseline briefly inline; no forced giant artifact, app build or unrelated suite. Check source/wording/link/diff if edited, final review and limits. Read-only discovery allowed to finish intake. Existing authorization suffices. |
| R1: current step 4.4 CourseDetail presentation within existing contracts; no new playback, persistence or health instruction | First sync referenced decision and accepted 4.3 source, then read actual CourseDetail callers/consumers and map existing navigation/back, lesson selection, responsive/accessibility and locale behavior. Preserve working baseline and preexisting failures. Use current package/config/test source; run applicable R1 baseline checks and affected UI cases with meaningful adjacent regression. New playback/data/health contract would raise risk before implementation. Freeze source/tests/config/artifacts; independent QC then root direct checks then user boundary before next UX step. No live acceptance inferred from fixtures. |
| R3: request a teacher/media permission change | Trace server identity/role/object/storage boundary and affected consumers; R3 with relevant R2 checks, role-revocation/old-token/cross-actor forbidden paths, required independent expertise and stop/restore evidence. Missing authorized actor/live environment remains BLOCKED; local plan does not grant live writes/uploads/deploy. Existing approvals persist only within their exact scope. |

No gap requiring wider implementation was found in these own walkthroughs. An independent reviewer must reach its own conclusion; this statement is not independent QC.

## Commands, outcomes and limits

- Preimage capture and git status/HEAD capture: exit 0. Files/hashes recorded in `pre-change.json`.
- First Python edit invocation: exit 1 because `python` was absent; no edit occurred.
- First Node edit invocation: exit 1 on sandbox EPERM for skill file; only AGENTS pointer had been inserted. No partial skill edit.
- Narrow authorized `node analyse/process-workflow-2026-10-17/apply-scoped-controls.cjs` with sandbox escalation: exit 0; skill/matrix/PR guidance writes succeeded. No permission-policy change or auto-review rejection.
- Bundled Python `quick_validate.py D:\Projects\MCY\skills\mcy-change-review`: exit 1, `ModuleNotFoundError: yaml`; validator execution BLOCKED by missing PyYAML. No package installation. This does not indicate invalid skill syntax.
- `git diff --check -- AGENTS.md skills/mcy-change-review/SKILL.md skills/mcy-change-review/references/review-matrix.md .github/pull_request_template.md`: exit 0; existing mixed newline conversion warnings only. No git reset/stage/commit.
- Local Node link/frontmatter check: exit 0; 13 relative links resolve and existing expected skill frontmatter retained. This narrow fallback does not replace the unavailable full skill validator or behavioral review.
- Final preimage/diff/new-file whitespace/source-freeze validation: recorded in `validation.json` and `source-freeze.json` after this report is saved.

No app/runtime/CI suite was run: implementation changes guidance only; reading existing tests/config selected this bounded verification. Independent QC and root final verification remain required before relying on these changed controls or beginning app 4.4 implementation.
