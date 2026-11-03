# Private teacher collaboration — local candidate

Latest explicit direction supersedes external-only review proposals: teacher collaboration/review/feedback is in-app; Owner operations and reporting stay with Miu, with no separate Owner dashboard. Teachers may request more teacher invitations for admin review. Also include teacher comments after a recorded training session or course completion. This is local implementation, not a deployed or approved pilot.

## Scope and access

One private invited cohort is implemented. Multi-workspace/cohort tenancy, marketplace, payments, uploads, private teacher notes, automatic AI generation, SMTP and publication are deferred. No real learner data is used in fixtures.

| Actor | Access |
|---|---|
| Author A/B | Own private profile, lesson/course versions/history; submit saved version; read expert feedback; withdraw all document versions; request an invitation; comments only for own active assigned enrollments and recorded completions |
| Assigned qualified reviewer | Current specifically assigned submitted snapshot; independently approve/request changes with recorded feedback; no learner comments or arbitrary drafts |
| Actual Owner/admin via Miu | Metadata report, admit confirmed accounts with existing server roles, assign verified reviewer, adjudicate invite requests, revoke cohort membership, administer enrollment/completion records; no teacher-message bodies in report |
| Exact enrolled learner | Own explicitly sent comment revisions only; no author drafts, unsent comments, another learner's enrollment or role grants |
| Outsider/revoked | No collaboration access; revocation is checked each request |

Roles, qualification and enrollment are server state. Email confirmation alone cannot create teacher rights. `admit_member` does not grant a global role or send an invitation; author admission requires existing active teacher role/profile, reviewer admission requires existing reviewer role and explicit expert confirmation/basis. Initial Owner membership and real roster require a separately approved trusted bootstrap; clients cannot bootstrap or promote themselves. Revoked memberships cannot silently reactivate via admission. Cohort revocation and global platform-role revocation are separate operations; legacy own-draft RPCs still check their original global teacher role. Do not represent cohort revocation as global account deletion.

## Implemented local surfaces

- `src/staff/TeacherCollaborationPanel.tsx`: profile, own lessons/course child-version pins, submit/history/review decisions, invitation requests, enrollment-specific session/course feedback drafts and explicit sending. Assigned reviewers use the same teacher route; learner feedback preview is there too. Existing protected learner App/mobile runtime is untouched; integration into its account/course screens is deferred. Closed API preserves the legacy own-draft editor.
- `supabase/functions/teacher-collaboration/index.ts` and `_shared/teacherCollaboration.ts`: bounded POST, confirmed `getUser` identity, no client actor/role/publication claims, fixed approved staging pin, default-closed `MCY_TEACHER_COLLABORATION_ENABLED`, sanitized errors and no logs of payloads. New Pro target/key/JWT compatibility remains a separate gate.
- `20261005004000_private_teacher_collaboration.sql`: additive private cohort/schema plus `public.mcy_collaboration_dispatch`, service-role EXECUTE only, pinned empty search path, no raw client/private-table grants. Revokes anonymous/authenticated public reads on teachers/sessions/versions/segments; old actor-bound draft RPCs remain usable. Local Supabase CLI was unavailable, so this timestamped candidate was prepared as a local file only; no remote migration connector or SQL was executed.
- `tests/teacher-collaboration.test.mjs`, `.spec.ts`, `-rehearsal.cjs`: offline handler, synthetic browser and in-memory PostgreSQL access/upgrade evidence. No staging JWT/SMTP/actual clinician evidence follows from them.

## State and feedback contract

Content payload snapshots and review/audit rows are immutable. New edits create versions with optimistic expected-version checks. A newer edit supersedes a pending submission, so stale review fails. Only admin assigns an independent active verified reviewer. A course pins own lesson versions; expert approval and retrieval require approved children. Withdrawal closes every document version and removes its publication pointer; a new separate document is required afterward. No publish action exists. The approved catalog stays closed by default; fixtures simulate its publication gate/pointers only in memory to prove draft/withdrawal filtering. Actual student/AI retrieval integration is not enabled.

Enrollment pins learner, assigned teacher, course version and assignment generation. Admin/server records completion and exact lesson-version attendance; teachers cannot claim attendance or create enrollments. Transfer/revocation increments the generation and invalidates prior session references/drafts/sends. Teacher and learner access rechecks current enrollment and approved course/children; course withdrawal also denies these reads. Sent-history visibility after transfers/withdrawal needs an approved retention/access policy before live use; old generations remain in append-only storage but are not exposed by the pilot API.

Comments are immutable drafts/revisions with an explicit send receipt and reusable idempotency key. The UI keeps the same key across an uncertain retry of the exact revision. Students receive only sent rows. `human` and `ai_assisted_teacher_confirmed` provenance is visible; assisted drafts require teacher confirmation and never auto-send. No provider is called and no automated feedback is attributed to a teacher. Private notes are absent to prevent mixing them with student-visible comments. No diagnosis or medical scoring is implemented.

## Miu/admin integration boundary

Prepared actor-bound operations: `admin_report`, `admit_member`, `assign_reviewer`, `decide_invite_request`, `revoke_member`, `admin_enrollment`, `admin_completion`. Call through an authenticated trusted adapter preserving the requesting Owner identity, not a general model-supplied actor ID. The authenticated Edge handler derives identity and SQL checks actual Owner role. Miu tool registration, its confirmation protocol and live end-to-end authorization are not wired/tested in this candidate. No Owner dashboard expansion. Actual invitations remain under the existing separately closed Owner invitation action and SMTP/callback approval.

## Local checks and remaining gates

Run the offline handler: `node --test tests/teacher-collaboration.test.mjs`. Run `tests/teacher-collaboration.spec.ts` with the existing isolated Playwright configuration and fictional `.invalid` backend. The in-memory rehearsal needs an already installed `@electric-sql/pglite`; set `MCY_PGLITE_MODULE_PATH` to that package directory if outside this repo, then run `node tests/teacher-collaboration-rehearsal.cjs`. Optional `MCY_COLLABORATION_EVIDENCE_PATH` writes JSON evidence to an explicit local path. No engine package is added to this repository or installed by these scripts; absence is BLOCKED, not a passing test.

R3 gates remain: independent security/content expert review; exact target/cost approval; authoritative migration ledger and clean artifact; JWT/new-key/SMTP/invite-callback tests; live A/B/reviewer/learner/revoked-old-token tests including effective grants and function owners; rights/privacy/retention and cohort roster; trusted Miu adapter/bootstrap; actual learner-app integration where approved; load/pagination limits; production-schema upgrade/backup/restore. Local replay uses the reviewed local 21-file baseline with synthetic rows, not a live schema dump. The advisory release evidence checker cannot approve any of these. No SQL application, new project, invitation, course publication, AI paid call, deploy, commit or push occurs in this task.

Stop path: keep the Edge gate false and publication settings false. If later enabled under separate approval, disable the gate first; preserve immutable rows for reviewed retention and use an additive repair migration rather than dropping history. Test rollback compatibility on the exact approved live artifact/target before release.
