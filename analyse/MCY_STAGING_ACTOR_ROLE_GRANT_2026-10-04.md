# MCY staging fixture role grant — 2026-10-04

## Authorized operation

- Target: `mcy-staging`, project `mhumbczqrzutdnraafhs`, organization `drxbmvimiekeoeesgssp`.
- Source checkout: `82458fc219a2231ccac279112dfc0db5447b0edd`, with pre-existing dirty work. This is an operational fixture-data change, not a source/artifact release, migration, deployment or production approval.
- The human Owner explicitly confirmed the five fixture identities and approved only three temporary role grants for feature testing. Email addresses, Auth IDs, passwords and access tokens are intentionally omitted from this document.
- Operation receipt: `mcy-staging-fixture-roles-2026-10-04-05e1e259-a8b5-48a8-8c7b-89960e897540`.
- Executor: authorized privileged database connector. Audit uses `actor_type=system`, `actor_id=NULL`, and role grants use `assigned_by=NULL`: this does not pretend an authenticated application Owner issued the operation. The human authorization and fixture labels are recorded in the private audit metadata.

## Committed database result

| Fixture | Effective application role | Grant period |
|---|---|---|
| Learner A | None (ordinary authenticated learner) | Unchanged |
| Learner B | None (ordinary authenticated learner) | Unchanged |
| Teacher | `teacher`, global | 7 days |
| Reviewer | `content_reviewer`, global | 7 days |
| Owner | `owner`, global | 7 days |

All three grants start at `2026-10-04T10:47:49.876065Z` and end at `2026-10-11T10:47:49.876065Z` (17:47:49 on 11 October, UTC+7). Three role rows and three linked `staging_fixture_role_granted` audit rows were committed together. The nine prior role rows belonging to the existing bootstrap actor remain unchanged.

These are application role rows, not PostgreSQL grants or changes to JWT/user metadata. Expiration is enforced by the server's current-role predicate; the stored row can still say `active` after `ends_at`. This operation does not introduce a cleanup job or renew the grant. Future endpoints must check status, start and end time, not just the role label.

## Verification and limits

| Evidence | Status | Actual result |
|---|---|---|
| Identity/eligibility preflight | PASS | Five distinct confirmed, non-deleted, non-banned, non-anonymous Auth users; no prior role rows for these fixtures. |
| Grant/audit rehearsal | PASS | The actual grant block ran twice within one transaction, asserted exactly three grants and three audit rows, then rolled back; zero fixture/batch rows remained. Same-receipt retry did not duplicate or extend grants. |
| Committed role and audit readback | PASS | Exactly one approved role per staff fixture, no Learner roles, exact 7-day intervals, three linked audit rows. |
| Owner RPC actor predicate | PASS | Privileged SQL calls to `mcy_ai_get_owner_config` allowed the fixture Owner and denied the other four actors with SQLSTATE `42501`. Function return bodies were discarded. This is not an authenticated Edge/HTTP test. |
| Owner expiry/revocation predicate | PASS | In an isolated transaction, an elapsed Owner interval and a revoked Owner status each produced `42501`; rollback restored the original three grants and expiry. This does not prove revocation of an Auth session or behavior with old tokens at an Edge endpoint. |
| Unchanged access boundary | PASS | Before/after fingerprints match for other role rows, teacher profiles, learner assignments, invitations, AI configuration and public/private table ACL/RLS flags. Client INSERT/UPDATE/DELETE/TRUNCATE remains denied on teachers, plan_items, role_assignments and teacher_assignments. `private` schema USAGE remains denied to anon/authenticated/service_role. |
| Initial agent direct-write run after grant | FAIL (fixture prerequisite, historical) | `npm run test:teacher-actors` exited 1 at Learner A Auth rejection, before probes; the cause was not classified. Superseded for direct-write coverage by the refreshed user run below, not erased. |
| Refreshed post-grant user run | PASS, user-supplied evidence | Two subsequent screenshots show 45/45 expected direct-write denials, the final matrix summary and `$LASTEXITCODE=0`. The Owner refreshed all five sessions beforehand. This is not an agent rerun or role-specific API coverage. |
| Teacher/reviewer APIs and teacher activation | CHƯA CHẠY / blocked | Zero teacher RPCs; no deployed teacher function and no activated fixture teacher profile. Distinct reviewer identity is not professional qualification or publication review approval. |
| Subsequent authenticated Owner HTTP matrix | PARTIAL / FAIL overall | The agent verified five distinct sessions against current role-bound identity digests. Sixteen HTTP assertions passed, including Owner read and non-owner/forged-actor denial. The seventeenth stale-save assertion timed out on both runs (exit 1); live RPC/log/PostgREST evidence identifies a `40001` retry loop. See the linked checkpoint; UI/complete save/revocation flows remain unverified. |
| Protected runtime integrity | PASS | `npm run check:runtime`, exit 0, 28/28 protected files; no application/runtime code changed in this operation. |
| Documentation whitespace review | PASS | `git diff --check -- AGENTS.md supabase/README.md`, exit 0; only a Windows line-ending notice. |

The only deployed Edge Function before/after was `owner-control-plane` v1, `verify_jwt=true`. AI configuration stayed disabled. There was no migration, function deployment, invitation, teacher-profile activation, upload, media publication or learner-access assignment. No client/security grant was widened, and no provider request or billable resource was created.

## Recovery and next test

The pre-commit transaction rollback and rolled-back Owner predicate tests were executed; an operational revocation of all three committed grants was **not** executed. For an approved early stop, a privileged operator must select only the three `private.role_assignments` rows whose `reason` equals this exact operation receipt, confirm the associated three grant audits, mark those rows revoked with a revocation timestamp, and append linked revocation audit events atomically. Keep the original grants/audits; do not delete them, revoke other actors, or extend expiry on a retry.

Superseding next step: token refresh and the user's direct-write matrix are complete. The subsequent [Owner checkpoint](MCY_OWNER_ACTOR_CHECKPOINT_2026-10-04.md) requires approval and exact-target revalidation before stopping two retrying backends. Do not repeat the stale-save probe or weaken Auth settings. Role-specific teacher/API, privacy/rights/retention/media, independent qualified review, SMTP, migration-history and release gates remain open; this grant does not clear them.
