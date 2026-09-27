---
name: mcy-change-review
description: Plan, implement, or review a change to the MCY learner app, teacher trial, data, media, or release workflow with current project scope and risk-based evidence. Do not treat a research-only request as permission to ship.
---

# MCY change review

Use this skill for MCY feature work and handoff. Read the repository's `AGENTS.md`, the user's latest decision, the affected code/docs, and `git status` before choosing a gate. `AGENTS.md` holds runtime and authorization boundaries; source files and current configuration establish what actually exists. Dated analysis is evidence or a proposal, not a newer rule simply because it is detailed. The latest explicit user decision supersedes historical candidates.

1. State the observable outcome, authorized scope and affected app surfaces/data/roles. For a plan-only task, produce the plan and update requested guidance; do not silently implement the planned feature.
2. Classify the **highest** risk in the diff as R0–R3 using [review-matrix.md](references/review-matrix.md). Select checks for that risk and the actual behavior changed. Verify commands and provider state before citing them; never report a proposed check as already running.
3. Keep security boundaries in `AGENTS.md` and `supabase/README.md`: no client secret, no self-granted teacher role, no teacher access to learner data by default, no private draft in the learner catalog, no inferred improvement from absent feedback. Test negative paths when changing ownership, consent, roles, media or AI.
4. Run the applicable checks after the final edit. Record command, exit status, environment and commit/revision where possible as **PASS**, **FAIL** or **CHƯA CHẠY**. A build or runtime fixture pass does not prove learner behavior or RLS. If a required gate fails, fix the cause or stop that release scope; do not weaken tests, policies, checker or lock to get green.
5. Review the guidance impact in the same change: update `AGENTS.md`, brand/design/schema references and this skill only when a durable decision or workflow changed; remove or label superseded rules. Do not freeze provider prices, quotas, external account state or unvalidated English copy in a skill. Check current authoritative sources at execution.
6. Hand off the behavior, tests, untested cases, residual risks and rollback/disable path. Skills are instructions, not a security boundary. A release needs enforceable CI and repository/deploy permissions appropriate to the risk; never claim zero risk.

For learner UI changes, inspect the current E2E coverage in `tests/learner-ux.spec.ts` and the Playwright test match/config before deciding which path is covered. The English locale is still an internal partial preview; passing its main-loop test is not evidence that consent, account, support or Journey is translated. A simulator/browser pass does not establish physical Android/iOS behavior.

Read [review-matrix.md](references/review-matrix.md) when selecting or auditing gates. For visual/copy/interaction work, also use [mcy-brand-ux](../mcy-brand-ux/SKILL.md). Use specialized provider/SDK skills only when the task actually involves them and they are available; avoid skills for other repositories.
