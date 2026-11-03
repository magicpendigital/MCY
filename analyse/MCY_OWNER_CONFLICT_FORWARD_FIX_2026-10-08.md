# MCY — Owner conflict forward-fix candidate, 2026-10-08

## Outcome and scope

Implemented **locally, not applied**: one guarded forward repair for the existing Owner save RPC, the corresponding handler error classification, and two equivalent conflict branches in the **unapplied** teacher migration. The requested next step follows the completed [exact-target containment](MCY_OWNER_RETRY_CONTAINMENT_2026-10-08.md). No cloud writes, stale-save probe, role/invite change, restart, compute/billing change, deployment, provider request, AI enablement, commit or push occurred in this pass. Existing dirty work is preserved.

HEAD: `82458fc219a2231ccac279112dfc0db5447b0edd`; this is an uncommitted candidate, not a reproducible release from HEAD alone. Highest change risk is **R3** under the MCY change-review skill: a privileged definer RPC and local CI control. The skill requires preservation checks and separate live/reviewer evidence; green fixtures do not authorize rollout. No learner-facing UI or protected runtime change.

## Read-only staging evidence

Target: existing `mcy-staging`, project `mhumbczqrzutdnraafhs`, MagicpenDigital `rzbpjfrndhrtxagpgdre`, `ap-southeast-1`, reported `ACTIVE_HEALTHY`. Project identity/region are unchanged; the health label is not a CPU measurement. No new CPU metric was collected. This remains staging.

Read the deployed `public.mcy_ai_save_owner_config(uuid,integer,boolean,text,text,numeric,integer,integer,integer)` definition and effective privileges without invoking it:

- Definition MD5: `1591e77afdfc0dacb6b39200d7bbefc2`; the expected-version business-conflict branch still raises `40001`.
- A read-only text replacement computes expected after-definition MD5 `5ad67fe52caf79bd07c51caa0c30db92`. This is a prediction, **not** applied-state evidence.
- Owner `postgres`, `SECURITY DEFINER`, pinned empty `search_path`; ACL `{postgres=X/postgres,service_role=X/postgres}`.
- `anon`/`authenticated` EXECUTE denied; `service_role` EXECUTE allowed. All three lack `private` schema USAGE. Active global Owner, actor, start/expiry, locked configuration version, validation and audit checks remain in the definition.
- Connector migration inventory still has **18 applied versions**, through `20261001043554_restrict_staging_public_client_table_acls.sql`; all 18 have corresponding local filenames. This is connector inventory, not the official CLI reconciliation.

Supabase CLI **2.119.0** was obtained in a task-scoped temporary npm cache, with telemetry disabled and no project dependency/lockfile edit. It successfully generated `20261007174155_fix_owner_config_conflict_sqlstate.sql` (UTC filename; local date 08 October). `supabase migration list --project-ref mhumbczqrzutdnraafhs --workdir D:/Projects/MCY --agent yes` exited **1**, `AccessTokenRequiredError`, before it could return the official list. No credentials were read or requested in chat, and no login/db push/apply was performed.

## Exact candidate changes

1. `supabase/migrations/20261007174155_fix_owner_config_conflict_sqlstate.sql`: one atomic `DO` statement. Requires the exact existing signature, one of the reviewed before/after definition fingerprints, exact owner/ACL and denied private-schema access. It replaces only `errcode = '40001'` with `errcode = 'PT409'` in the fingerprint-checked existing definition. No DROP, re-grant or application-row mutation. After replacement it verifies function identity, owner, ACL, `search_path` and definer status; exact repeat is a no-op. Missing function or drift aborts rather than overwriting it.
2. `supabase/functions/_shared/ownerControlPlane.ts`: structured `PT409` → sanitized HTTP 409; real `40001` → sanitized HTTP 503, no automatic retry; `42501` → 403. Message-only compatibility remains only when no structured code exists. Auth, enable gates, provider and save parameters are unchanged by this patch.
3. `supabase/migrations/20261002204228_teacher_control_plane_rpcs.sql`: only two **unapplied** business-conflict codes changed to `PT409` (stale version, or absent/non-draft latest version). Role, ownership, locking, quota, draft-only status and audit logic unchanged.
4. `supabase/functions/_shared/teacherControlPlane.ts`: `PT409` → 409; real `40001` → 503, no retry; structured permission/not-found codes cannot be overridden by overlapping message text.
5. Tests: `tests/owner-control-plane.test.mjs`, `tests/teacher-control-plane.test.mjs`, `tests/teacher-migration-contract.test.mjs`, new `tests/owner-conflict-migration-contract.test.mjs`, and new `tests/owner-conflict-migration-rehearsal.cjs`. Local package scripts added for both new suites; the contract suite is wired in local `.github/workflows/quality.yml`. This is **not** a remote CI run or an enforced required check.
6. Guidance: `AGENTS.md`, `supabase/README.md`, implementation plan and next-work catalog link this checkpoint and distinguish local preparation from deployed repair. Historical test evidence is retained with superseding notes.

The two applied Owner migrations remain byte-identical (checked by the contract test):

| Applied historical file | SHA-256 |
|---|---|
| `20260929173001_ai_owner_controls.sql` | `b3758861e2f501940427fa9de0ffb9ddbdd8479cf082723f754131592857d1fc` |
| `20260930160616_allow_unset_model_for_disabled_ai.sql` | `f04f5003c646aa8d25a43834948fe3068c4fc58a2558ad519441ffcbb7830d61` |

Current inventory has **23 local files: 18 applied + 5 pending**, not permission to apply them together. Pending hashes bind this local observation, not a released artifact:

| Pending file | SHA-256 |
|---|---|
| `20261002120000_bind_checkin_writes_to_current_actor_and_consent.sql` | `6a8c5c6459bb3c1a9ca3166b242780dfb3ef9ef031ded2d5d57e637c7dc94cee` |
| `20261002204228_teacher_control_plane_rpcs.sql` | `b868c0f7548f88769703284bb6cc916d5f262319918106c7edb6bc58343f3568` |
| `20261003031137_limit_my_consent_events.sql` | `def54f448088dfde32f4baccd4dbc662cb0d1e74fbe9f17d2d2ce46a601f6f39` |
| `20261005004000_private_teacher_collaboration.sql` | `9fbba7b2bffeebc795231210d57887b1a063d4f28310447c86aea923fce3edaa` |
| `20261007174155_fix_owner_config_conflict_sqlstate.sql` | `b7f8637c4568cbb138c680089214d14b308567d2ae0eb52990c22b73976d1fab` |

The unrelated pending collaboration/check-in/consent migrations were not edited or rehearsed by this repair. Do not use `db push` to bundle these candidates or repair the ledger automatically.

## Tests actually run

Windows PowerShell; Node fixture tests, fictional actors/data, no `.env.local`, Auth credentials, email delivery or provider traffic. PGlite **0.5.8 / PostgreSQL 17** is a disposable in-memory minimal schema, not the Supabase local stack. The rehearsal requires an already-installed engine via `MCY_PGLITE_MODULE_PATH`; it does not auto-install dependencies or silently skip. Outbound `fetch` is disabled inside that fixture.

| Check | Result | Meaning / limits |
|---|---|---|
| Owner handler | **PASS 10/10** | Sanitized codes, no retry, unchanged AI-off gates; mocked RPC |
| Teacher handler | **PASS 17/17** | Conflict/infrastructure distinction and existing invite/draft guards; mocked RPC |
| Teacher migration contract | **PASS 4/4** | Server-only/draft/role/quota boundary, exactly two PT409 branches |
| Owner actor runner offline | **PASS 19/19** | Fictional identity/network responses; preserves deployed-PT409 precondition |
| Owner forward migration contract | **PASS 4/4** | Guarded atomic repair, unchanged historical hashes, no intentional business 40001 in pending files |
| SQL rehearsal | **PASS 15/15** | Exact before/after definition, OID/owner/ACL/search-path/data preservation, repeat/missing/drift refusal, stale/null PT409 without writes; valid AI-off Owner save/audit; wrong/revoked/expired/future actors denied; client/server execution boundary; teacher conflict/cross-actor/no-write paths |
| Final combined six-file batch | **PASS 69/69, exit 0**, no skipped tests | The six suites above, not an app-wide suite |
| Focused shared-handler TypeScript | **PASS, exit 0** | See exact command below; not Deno deployment validation |
| `npm run check:runtime` | **PASS 28/28, exit 0** | Protected-file integrity, not Android/iOS behavior |
| `git diff --check` | **PASS, exit 0** | Tracked whitespace; LF/CRLF notices only |
| Official CLI migration list | **BLOCKED / command exit 1** | CLI authentication absent; no returned ledger |
| Independent R3 review, full schema replay/upgrade, multi-session concurrency, live PostgREST/Edge/role matrix, current CPU/device/UI/build/deploy | **CHƯA CHẠY** | No rollout/release claim |

Commands for this batch (PowerShell uses `npm.cmd`/`tsc.cmd`):

```text
node --test tests/owner-control-plane.test.mjs tests/teacher-control-plane.test.mjs tests/teacher-migration-contract.test.mjs tests/owner-actor-matrix.test.mjs tests/owner-conflict-migration-contract.test.mjs tests/owner-conflict-migration-rehearsal.cjs
node_modules/.bin/tsc.cmd --ignoreConfig --noEmit --allowImportingTsExtensions --target ES2022 --module ESNext --moduleResolution bundler --lib ES2022,DOM supabase/functions/_shared/ownerControlPlane.ts supabase/functions/_shared/teacherControlPlane.ts
npm.cmd run check:runtime
git diff --check
```

The first focused TypeScript invocation omitted `--ignoreConfig` and exited 1 with TS5112; the corrected command above passed without changing compiler/project configuration. Initial CLI wrapper retrieval also lacked the optional Windows binary; the pinned official Windows binary was subsequently obtained in the same isolated cache and the CLI generator succeeded. Neither setup error was treated as an application failure or hidden as a first-run PASS.

## Residual risk and safe rollout sequence — not executed

Supabase documents intentional business `40001` causing infinite retries in affected PostgREST 14 deployments and recommends a non-retryable business code. `PT409` has an explicit HTTP 409 mapping; this pass proves SQL plus handler fixtures, **not** actual live retry behavior. [Supabase incident guidance](https://supabase.com/docs/guides/troubleshooting/high-cpu-and-infinite-transaction-retries-when-using-custom-error-codes-in-rpc-functions-77326b), [PostgREST error mapping](https://docs.postgrest.org/en/v14/references/errors.html#raise-errors-with-http-status-codes).

CREATE OR REPLACE preserves identity, ownership and privileges; the candidate reuses the exact catalog definition and verifies preservation. It deliberately refuses any definition/permission drift. [PostgreSQL 17 function rules](https://www.postgresql.org/docs/17/sql-createfunction.html). Fingerprints are drift checks, not reviewer signatures or a release enforcement layer. Deployment must prevent concurrent privileged DDL and revalidate the actual target/definition/ACL immediately before applying; the minimal fixture does not prove this operational lock or multi-session parity.

After ledger reconciliation and independent review, an explicitly approved rollout should select **only this Owner repair**, not all pending migrations. Read back definition/hash, migration version and effective ACLs before permitting one bounded role-verified stale-save HTTP probe. Observe activity/logs beyond the client response to verify HTTP 409 and no continuing retries/config/audit mutation. Current fixture roles expire `2026-10-11T10:47:49.876065Z`; refresh evidence/tokens as needed without extending grants automatically. Do not set the runner's deployed-PT409 precondition merely because the local file passes.

No runtime rollback is needed now: nothing was applied. If the atomic repair fails before commit, PostgreSQL retains the previous definition. After a future successful repair, **do not restore intentional 40001 as rollback**; stop affected save probes and obtain a separately reviewed forward correction/containment if readback fails. Preserve unrelated sessions and Owner read access; do not broadly restart or weaken ACLs. The teacher migration/function, AI deployment/enablement and production release remain separately gated.

**One immediate next step:** an authorized operator supplies an authenticated CLI migration-list result for this exact staging target so the five pending candidates and selective Owner-repair route can be independently reviewed. Authenticate locally; never send access tokens through chat. Until then the live stale-save probe stays blocked.
