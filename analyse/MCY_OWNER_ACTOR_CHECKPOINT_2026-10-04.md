# MCY — Owner actor checkpoint, 2026-10-04

## Scope and source

Staging-only permission verification following the human request to proceed after fixture-role setup and the user-supplied direct-write PASS. Target metadata reverified: `mcy-staging`, project `mhumbczqrzutdnraafhs`, organization `drxbmvimiekeoeesgssp`. No release, migration, function deployment, successful config save, teacher activation/invite, upload/publication, inference or billing change was authorized/executed in this pass.

Checkout HEAD: `82458fc219a2231ccac279112dfc0db5447b0edd`, with pre-existing dirty work preserved. Agent changes in this pass: new `scripts/test-owner-actor-matrix.mjs`, new `tests/owner-actor-matrix.test.mjs`, two npm entries in `package.json`, and dated evidence updates in this file, the role-grant record, implementation plan, `AGENTS.md` and `supabase/README.md`. No UI, runtime, backend handler or SQL migration source was changed. Nothing was committed, pushed or deployed.

Read the MCY change-review skill and Supabase skill. R3/auth/secret handling evidence was selected for this test helper; no application behavior was released. Provider guidance caused the unsafe conflict probe to be disabled after its actual staging behavior was discovered. This is not independent security review or remote CI enforcement.

## Evidence

| Check | Status | Actual result and limits |
|---|---|---|
| User's post-grant direct-write matrix | PASS, user-supplied | Refreshed sessions; screenshots of all 45 denials, final summary and exit 0. Does not prove teacher/API or learner-data ownership. |
| Current role fixture preflight | PASS | Five confirmed, eligible, distinct users; learners have no privileged role, other fixtures have exactly teacher/reviewer/Owner roles. Auth UUID digests compared internally to actual Auth responses; no user metadata used for authorization. Identities/emails/tokens omitted here. |
| Deployed Owner function readback | PASS | Active v1, `verify_jwt=true`, bundle `2e6639c44927345c11dd0639b7d9e84f243bd64a07e559c5580e41ce997eed24`. Inspected handler checks Auth identity, then server-owned roles; open AI gates check version before model lookup for an enabled save. |
| Anonymous / invalid JWT | PASS | Two HTTP 401 assertions. These may be gateway denial; not proof the handler executed. |
| Four non-owner reads / forged actor requests | PASS | Eight HTTP 403 responses with `owner_access_required`; submitted actor IDs did not override verified JWT identity. |
| Four non-owner rejected saves | PASS | Four HTTP 403 responses with the exact Owner-role denial. These are not Owner successful-save evidence. |
| Closed AI gate / Owner read | PASS | Gate probe: 409 `ai_staging_gate_closed`. Read: 200; AI disabled, positive version, Gateway key/spend approval/enable gate false, catalogue absent, no-store. Response values/prompts were not printed or saved. |
| Owner stale-version save | FAIL: timeout, not a completed assertion | Both runs passed the preceding 16 checks, then ended exit 1 with no client response for the seventeenth within 10 seconds. Second runner classified AbortError/TimeoutError safely. Neither whole command is PASS; no infinite client retry was used. |
| RPC / server / log diagnosis | PASS: retry defect evidenced | Deployed save RPC raises intentional `40001` for expected-version mismatch. Live activity reports PostgREST 14.5. For 11:19–11:27 UTC logs show 32,906 + 6,642 = **39,548** `40001` errors with this exact RPC in their context on two backends. An activity snapshot had no lock blocker, null wait event, query age 0; this does not by itself exclude every transient lock. The log/RPC/version chain, not timeout alone, identifies the known retry-loop condition. |
| No config / role mutation | PASS at observed readbacks | AI config stays disabled/version 1; config and role fingerprints match the preflight, AI write audit count remains 0. This is not proof looping backends have stopped. |
| ACL boundary | PASS: catalog | Owner RPC EXECUTE denied to anon/authenticated and permitted to service_role; private schema USAGE denied to all three. No grant widened. This is not direct RPC HTTP coverage or revoked-token evidence. |
| Current teacher readiness | BLOCKED / CHƯA CHẠY | Zero deployed teacher RPCs, zero teacher profiles, no teacher function. Local-only draft migration has two intentional `40001` conflicts; mock/PGlite tests do not exercise PostgREST retry behavior. Independent qualified review, migration CLI, full integration, privacy/rights/retention/SMTP and media gates remain open. |
| Guarded Owner helper offline suite | PASS | `npm run test:owner-actor-matrix-offline`, **19/19, exit 0**, fictional sessions/in-memory handler, no local environment file or actual network. Covers canonical staging URL, publishable key only, identity binding, exact denials, provider/save guard, size/redaction, timeout classification and unsafe conflict-code skip. |
| Existing source contract suites | PASS | Owner handler **9/9**, teacher handler **16/16**, teacher migration contract **3/3**, each process completed exit 0. These are offline, not live SQL/Edge validation. |
| Runtime | PASS | `npm run check:runtime`, exit 0, 28 protected files unchanged. No app build/device/UI verification claimed for this script/doc-only diff. |

Current remote ledger remains 18 applied versions; three existing local migrations are pending. Official CLI ledger comparison and full-schema integration are still CHƯA CHẠY. No inference function was deployed. Test grants still expire `2026-10-11T10:47:49.876065Z`, with no renewal.

## Diagnosed defect and containment

Supabase's [official troubleshooting guidance](https://supabase.com/docs/guides/troubleshooting/high-cpu-and-infinite-transaction-retries-when-using-custom-error-codes-in-rpc-functions-77326b), checked 2026-10-04, describes custom business errors using `40001` triggering PostgREST 14 transaction retries; it recommends a non-retryable exception or `PT409`. A client abort is not sufficient to stop existing backends; even a function correction does not stop already running transactions.

The two server process identities were obtained from RPC-specific log aggregates, not guessed from all authenticator connections. Their exact values stay in tool evidence. A targeted termination approval was requested; **no cancellation/termination/restart has been executed**. PID reuse and pooled-connection reuse must be checked against current query and logs immediately before any approved termination. If either PID no longer matches this RPC, do not terminate it.

The helper now requires independently verified deployed `PT409` before its Owner stale-save probe. Missing/unsafe code returns exit 2/BLOCKED after the 16 safe assertions, never a full PASS. This precondition is test guidance, not a deploy or security authority. Non-owner save probes now use invalid model input so unexpected role drift fails before the DB version/row-lock path. The new guarded helper has **not** been rerun against staging; further network requests were stopped once the defect was identified.

## Proposed repair, not executed

After exact backend containment and separately reviewed ledger/compatibility/authorization gates, generate a **new forward Owner migration** replacing only this business-conflict SQLSTATE with `PT409`; preserve Owner status/start/end checks, server-only EXECUTE, pinned search_path, qualified objects, atomic audit/config update, expected-version and AI-off behavior. Do not edit applied historical migrations. Correct the two equivalent branches of the still-local teacher draft migration before its first deployment and add a contract check forbidding intentional business-conflict `40001`. Local/PGlite correctness alone cannot clear the HTTP retry gate; verify an actual non-retryable 409 through PostgREST, unchanged config/audit, and absence of new repeated errors.

Successful Owner saving, HTTP expiry/revocation with old tokens, teacher CRUD/cross-teacher/quota, invitation delivery and learner consent/data isolation are still CHƯA CHẠY. Do not infer production readiness from the 16 allowed/denied responses. The application remains gated, AI remains off, and no production action was taken.

## Exactly one immediate next step

Obtain approval, revalidate the two exact RPC/error-backed backend targets, and stop **only those still matching** the retrying Owner save. No broad restart, unrelated session termination, role revocation or schema mutation. The forward repair and further feature work remain paused behind this containment checkpoint.
