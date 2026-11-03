# MCY — targeted Owner retry containment, 2026-10-08

## Authorization and scope

The human Owner replied “Đồng ý” to the specific proposal to revalidate and stop only the two backends still matching the diagnosed Owner-save retry loop. This authorizes containment, not an RPC/schema change, project restart, compute/billing change, deployment, inference, role grant or release.

Target: existing `mcy-staging`, `mhumbczqrzutdnraafhs`, organization `rzbpjfrndhrtxagpgdre` (MagicpenDigital Pro, freshly confirmed), Singapore `ap-southeast-1`. Fresh project metadata confirms the organization transfer, unchanged project identity/region, and `ACTIVE_HEALTHY`; that health label does not measure CPU. The project remains staging. Historical 04/05 October records describing transfer/containment as pending are superseded only for these completed operations; their release/actor/migration/AI gates remain.

Local HEAD: `82458fc219a2231ccac279112dfc0db5447b0edd`; pre-existing dirty work preserved. Read the Supabase and MCY change-review skills, review matrix, AGENTS, release runbook and Owner packet. Classify the privileged operational action as R3; this is a narrowly authorized incident operation, not evidence of release approval or independent security review.

## Fresh evidence before stopping

Log window: 07 October 23:56:53 through 08 October 00:01:53 Bangkok (`2026-10-07T16:56:53Z`–`2026-10-07T17:01:53Z`). Aggregates only; no raw query parameters, tokens, prompts, email addresses or user rows were printed or saved.

| PID | Exact backend start (UTC) | RPC-specific `40001` errors in five minutes |
| --- | --- | --- |
| 928289 | 2026-10-04 11:20:15.558322+00 | 14,972 |
| 928984 | 2026-10-04 11:24:39.509104+00 | 15,024 |

Both logs identify PostgREST 14.5 and `mcy_ai_save_owner_config`; their parsed session start times match the same connections, not reused PIDs. At 00:02:35.891 Bangkok, 928289 showed this RPC with query fingerprint `c706ea5842c340c9ddce627cb6bffa31`; 928984 showed an intermediate non-RPC query. The latter snapshot was not used as blanket permission to stop an unrelated query. The termination statement independently rechecked both connections at execution.

## Exact operation and result

At **08 October 00:03:08.015–.016 Bangkok** (`2026-10-07T17:03:08.015172Z`–`2026-10-07T17:03:08.016071Z`), one bounded SQL statement:

- allowlisted only PIDs 928289 and 928984 with the exact backend starts above;
- required current database, `authenticator`, `PostgREST 14.5`, `client backend`, Owner-save RPC query and its exact fingerprint;
- excluded the executing connection;
- called `pg_terminate_backend` only for targets passing every predicate; a non-match would be skipped, not broadened or retried indefinitely.

Both rows returned `guard_matched=true` and `termination_signal_sent=true`. Signal delivery is not by itself proof of disappearance; readbacks below confirm it. No other connection was targeted. No project restart, stale-save probe, DDL, data-row update/delete, credential access, function deployment or provider request occurred. In-flight failed transactions on the terminated connections are not recoverable as sessions; PostgREST can establish ordinary new connections. Do not replay the failed requests while the deployed conflict code remains unsafe.

## Verification and limits

| Check | Status | Observed result |
| --- | --- | --- |
| Exact-target guard and termination signal | PASS | Both intended connections matched at execution and received the signal. |
| First activity readback, 00:03:44.900 Bangkok | PASS | Target backend count 0; authenticator Owner-save connection count 0. |
| Second activity readback, 00:04:51.996 Bangkok | PASS | Both counts still 0. |
| Post-operation log query, 00:03:30–00:04:46 Bangkok | PASS, bounded observation | Returned 0 Postgres rows, 0 `40001`, 0 Owner-save retry errors and 0 rows from the targeted PIDs in this window. Log ingestion delay and the short window prevent a permanent/global no-error claim; activity readback is separate direct evidence. |
| Termination-boundary log check, 00:02:30–00:06:56 Bangkok | PASS, bounded observation | PID 928289: 1,808 Owner retry errors before stop, final error 00:03:08.009; PID 928984: 1,994, final error 00:03:07.998. Each has one SQLSTATE `57P01` administrative termination entry. Both have 0 Owner retry errors after 00:03:30 through 00:06:56. These are parsed log aggregates, not raw messages; no recurring monitor or permanent no-error guarantee. |
| RPC source readback | FAIL: repair still pending | Definition fingerprint remains `1591e77afdfc0dacb6b39200d7bbefc2`; intentional `40001` remains and `PT409` is absent. Containment did not repair the underlying function. |
| `npm.cmd run check:runtime` | PASS, exit 0 | All 28 protected runtime files unchanged. No app build, device smoke or full actor acceptance was claimed. |
| Targeted whitespace/guidance check | PASS, exit 0 | `git diff --check -- AGENTS.md supabase/README.md`; a line-ending notice only. The new receipt is checked separately for trailing whitespace. |
| CPU, billing, long-window health | CHƯA CHẠY | No current CPU measurement, per-PID CPU attribution, invoice check or recurring monitor. |

Only local evidence/guidance files are updated in this pass: this receipt, `AGENTS.md`, and `supabase/README.md`. No commit, push, deploy, migration application or release-policy/allowlist edit.

## Exactly one next step

Prepare a separately reviewed forward Owner migration replacing the expected-version business-conflict `40001` with `PT409`, preserving active-role/expiry, server-only EXECUTE, search_path, audit and version guards; reconcile the ledger and pass compatibility/actor/HTTP tests before any application. Never rewrite an applied migration or set the test precondition to bypass the unsafe deployed code. Until then, keep stale-save probes blocked and do not expand to AI/teacher rollout.

Supabase's [current troubleshooting guidance](https://supabase.com/docs/guides/troubleshooting/high-cpu-and-infinite-transaction-retries-when-using-custom-error-codes-in-rpc-functions-77326b), checked through documentation search during this operation, explains the PostgREST 14 retry bug, non-retryable conflict codes and separate termination requirement. The markdown changelog fetch failed with unsupported content type; the HTML changelog fallback was inspected. No security setting was weakened to contain the incident.
