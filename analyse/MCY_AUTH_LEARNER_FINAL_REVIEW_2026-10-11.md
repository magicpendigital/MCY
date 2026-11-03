# MCY Auth email + learner writes — independent R3 review

Reviewed 2026-10-11, final follow-up completed before 11:32:34 UTC. This follow-up supersedes the original local33 checkpoint after the late consent preview fix. Reviewer: independent agent `auth_learner_final_review`; implementation and cloud operations belong to the parent agent. Scope follows `skills/mcy-change-review/SKILL.md`, its R3 matrix, `skills/mcy-brand-ux/SKILL.md`, current `AGENTS.md`, and the Owner's authorized email customization / continuation request.

## Decision

**No remaining P1/P2 identified in the frozen source listed below. Final independent targeted tests PASS 34/34, process exit 0.** This accepts the reviewed local candidate. It does not clear staging learner-data rollout or Production: exact hosted email readbacks, current renderer evidence, real actor/API tests and exact-stack operational acceptance remain separate gates. Local ordered SQL migration and sequential stop/resume evidence is now present, with the limits described below.

The reviewer edited only `tests/learner-write-review.spec.ts` and this report. No cloud configuration save, migration application, role grant/extension, positive Owner-config save, email to a real recipient, provider inference or protected runtime change was performed by this reviewer.

## Findings closed in this review

| Priority / scenario | Fix reviewed | Evidence / limit |
|---|---|---|
| **P2 — late check-in acknowledgement overrides navigation.** A learner starts a delayed save, opens the free lesson library, then the old response pushes Journey and clears the active draft. Retained FlowStack screens remain mounted, so a mounted/account-only guard was insufficient. | `useLearnerContinuation` now captures both account-session epoch and route generation. A different `flow.current.key` invalidates the continuation, including an observed departure and return. Check-in local busy/error/notice resets when the route key changes. | Original library scenario reproduced the incorrect navigation. Final browser cases assert the library remains usable and library → guide → Back → library remains usable after the old response. Same check-in stack key departure/return is source-reviewed; see the gesture coverage limit below. |
| **P2 — old consent acknowledgement removes a newer uncertain event.** During A→B→A, an old exact replay waits for its response; the new continuation replays that event, reads a later revocation, starts a new grant with the same signature/new UUID, and loses its response. The old acknowledgement previously deleted that newer UUID. | `retryKeys.delete(signature)` is guarded by `retryKeys.get(signature) === key`. | Deterministic real-helper regression verifies the newer UUID survives the old acknowledgement. This was source-identified and fixed before the regression ran; no baseline failing test is claimed. |
| **P2 — confirmed retry appears as a failure.** A frozen original check-in is confirmed after the learner edits the draft, but the success message was placed inside the “Chưa lưu được check-in” alert. | Separate VI/EN `saveNotice` with `role=status`; genuine errors keep `role=alert`; notice clears on a new attempt. | Browser regression confirms two identical original requests, no alert after confirmation, retained new energy selection, then a third explicit save with a new UUID and the changed energy. |
| **P2 — consent layout preview cannot continue.** The DEV `review-screen=consent` fixture has no Auth UID; removing the old local return made its Continue action throw `account_changed` before navigation. Parent full136 reproduced the failure; the reviewer confirmed the alert in an unchanged targeted attempt. | An explicit DEV-only/no-UID/`review-screen=consent` branch returns current cosmetic choices and versions without Auth/RPC calls. Production no-UID still throws. ConsentFooter compares the initiating `signedIn` value exactly, retaining UID, session epoch and route guards. | Original test is unchanged. Final34 passes Continue after scrolling at 320×568 and 390×844. There is no generic production guest/backend-error fallback, server grant or authentication bypass. |

The future CLI apply guard also now binds the 13 exact HTML inputs to the reviewed manifest and preflight. This closes the source-control gap caused by treating `content_path` as inert: CLI loading can send bodies even when the displayed config diff only lists subjects and redirects. The reviewer inspected the guard and did not run it against Supabase.

## Final independent execution

```powershell
$env:MOBILE_RUNTIME_TEST_PORT='4204'
$env:MCY_PLAYWRIGHT_CHANNEL='msedge'
$env:MCY_PLAYWRIGHT_VITE_CONFIG_LOADER='runner'
npx playwright test tests/auth-email.spec.ts tests/auth-callback.spec.ts tests/learner-write-review.spec.ts tests/learner-ux.spec.ts:1506 --workers=1 --output=test-results/auth-learner-r3-final34-complete
```

**PASS 34/34; exit 0; 3.4 minutes.** Auth18 + learner15 + unchanged consent continuation1. The repository's supported Vite runner loader avoided an `EPERM` write to `node_modules/.vite-temp`; the runner owns server startup and teardown. Every backend URL/token/actor in the Auth/learner fixtures is fictional; actual `*.supabase.co` browser requests are explicitly blocked. The consent preview is the explicit development layout fixture and executes no backend write. Assertions and the normal 20-second test deadline were preserved. Final `.last-run.json` is `passed`, with no failed tests.

Coverage includes fixed Owner/Teacher callbacks, denied/ambiguous/missing-verifier/expired callback cases, exactly one SDK PKCE exchange, role authorization after valid login, captured-token cosmetic locale writes, expired-token denial, VI/EN email choice and intact 8-digit codes on iPhone/Pixel presets; partial/lost-response consent replay before contrary choices; failed replay keeping the original key; account changes during baseline reads; other actors' pending keys; the old-acknowledgement/new-UUID race; A→B→A epoch invalidation; initiating-token profile writes; late profile/consent/check-in responses; frozen check-in retry; and late route responses.

Historical runs are not substituted for the final run: a previous combined33 run was **32 PASS / 1 FAIL**, with a timeout waiting for the initial “Bắt đầu check-in” button before sending a write. That unchanged case then passed individually and in original final33. The first follow-up34 was **33 PASS / 1 FAIL**, solely a cold Owner `page.goto` waiting for load before any email/API action; final34 passed that unchanged case in12.7 seconds. The independent consent-only attempt before the DEV branch failed and received source HMR, so it is intermediate evidence. The earlier Auth18 attempt had an initial Owner page-load timeout, and earlier route harness attempts did not all pass. These failures remain historical evidence; final34 on the current hashes is the acceptance evidence.

Parent reports full **136/136 PASS, exit0, 10.0 minutes**, after the consent fix; the reviewer inspected its final `test-results/auth-email-final/.last-run.json` (`passed`, no failed tests). The prior parent135/136 run is superseded for final acceptance. Parent also reports canonical build601/runtime28, scanner23, Sites4 and environment-isolation1 PASS on the same frozen source. These broader checks were executed by the parent, not independently rerun here.

A synthetic edge-swipe attempt encountered `FlowStack.tsx:118` with `state.event.currentTarget` being `Window`, causing `target.getBoundingClientRect` to fail. This does not establish a physical-device gesture failure. The gesture harness was removed from the final suite, protected runtime was not edited, and exact same-check-in-key return through that gesture remains **CHƯA CHẠY**. The final route regressions use reachable app buttons. Physical Android/iOS callback and gesture behavior remain unverified here.

## Source assessment

- The shared Auth observer increments `learnerSessionGeneration` synchronously when the actor changes. A→B→A invalidates an older continuation even when React skips rendering B; same-actor token refresh preserves the epoch.
- Account-bound clients capture a confirmed, unexpired initiating session token before subsequent asynchronous work. Profile, consent and check-in writes do not borrow a later shared B token. Profile UI updates are guarded after completion. Locale update sends only `{data:{locale}}` under the captured token, is bounded to 2.5 seconds, has no retry and cannot grant a workspace role.
- Consent retry acknowledges original uncertain events before reading the latest state and issuing an explicit contrary choice. Partial batches retain failed exact keys and block navigation; keys for another actor are untouched. Later acknowledgements cannot delete replacement UUIDs.
- The explicit consent layout preview exception is guarded by build-time `import.meta.env.DEV`, no UID and the exact review query. Real account operations still take the bound-client path; production no-UID operations fail closed. Exact initiating `signedIn` comparisons do not remove the account/epoch/route checks.
- Check-in retry freezes serialized payload and UUID. A confirmed snapshot comes from that actual payload, while later edits remain a draft for an explicit new save. Completion only clears the matching pending UUID; UI continuation requires the current session and route.
- The SQL wrapper checks expected UID against `auth.uid()`, current required policy versions, pinned empty `search_path`, restricted EXECUTE and the shared transaction actor lock. Consent and check-in take the same lock before read/write; `READ COMMITTED` is required to avoid stale transaction snapshots. Canonical payload comparison makes a changed-data retry fail rather than acknowledge another stored health state. Old client RPC execution and private helper/client table writes remain denied. Existing public `service_role` table privileges are observed, not falsely described as denied.

No new clinical guidance, reviewed practice catalog item, data-sharing permission or teacher authority was supplied by these technical fixes.

## Email generator, CLI scope and hosted limits

Primary current CLI source: [Supabase CLI Go/TypeScript divergences](https://github.com/supabase/cli/blob/develop/apps/cli/docs/go-cli-divergences.md). Its `config push` loads both template and notification `content_path` values through the path resolver. The earlier independent report's “local-only body paths / subjects only” description is superseded. [Supabase Auth email template documentation](https://supabase.com/docs/guides/auth/auth-email-templates) describes Go templates and Auth template variables.

The distinction matters: loading 13 body inputs does not prove 13 hosted bodies persisted. Parent fresh Dashboard observations confirmed the six Auth bodies, while seven security notification bodies remained provider defaults and their switches stayed OFF. The latest inspected apply receipt at **11:04:39 UTC** records the seven compact security subjects and deliberately sets `hostedHtmlBodiesVerified=false`. `bodyUploads` describes reviewed/intended CLI inputs; it must not be used as a hosted acceptance receipt.

The six Auth templates retain exact allowlisted initiating `.RedirectTo` locale overrides in both directions, with stored-locale/default-Vietnamese fallback. Workspace selection remains server-authorized. The seven security events have no initiating email-request redirect; their compact subject/body preamble uses stored `Data.locale` only. Their raw subjects fit the Dashboard's 255-character validation. Go template values are used for an allowlisted language decision, not inserted as role/body/user-provided HTML. Security notifications stay OFF until separately authorized; this review does not enable them.

The new body guard checks exact 13 IDs/kinds/paths, no extra `content_path`, isolated/source hashes, no isolated symlinks, manifest hash and equality with the reviewed preflight. Subject/redirect scope and undeclared differences are rechecked before/after push. This is a bounded apply-input guard; it cannot prove hosted HTML, notification delivery or rollback by itself.

At this report's readback, current `MCY_AUTH_EMAIL_DOCKER_2026-10-11.json` is **FAIL**, captured 10:58:53 UTC with cleanup verified but no renderer case passed, because Docker was unavailable. Historical renderer78 PASS used the earlier security templates and does not prove the latest seven bodies. Required next evidence: rerun latest **78** renderer cases, then fresh hosted readback of all 13 exact bodies/subjects and unchanged notification switches. The harness uses the common GoTrue MagicLink renderer for every body; it explicitly does **not** test all seven notification event triggers or real delivered inbox formatting. Parent may supply newer receipts separately.

## Learner database evidence and remaining rollout gates

The reviewer inspected the exact local Docker harness and `MCY_LEARNER_WRITES_DOCKER_2026-10-11.json` **PASS** at 10:06:46 UTC, rather than independently rerunning Docker. Nine behavioral groups include reproduction of the old revoke-before-INSERT race and old changed-payload phantom success; effective ACL/private/helper denial; unchanged Owner function; current policy and actor checks; higher isolation denial; real independent-session concurrency for exact retries and both revoke/save lock orders; consent exact retry/mismatch; and local PostgREST authenticated HTTP200. Eight pre-existing public service-role table privileges are separate OBSERVED entries. Cleanup is verified, no cloud request/real actor test occurred. Database17.6.1.139 + PostgREST14.13 and fictional auth claim functions are recorded.

The Docker rehearsal is a current schema snapshot upgraded with the candidate, rather than a complete migration chain from an empty database. The new `tests/learner-write-clean-rehearsal.cjs` supplements it: an empty PGlite database applies the selected21 in chronological order; a second database applies the observed20 then this candidate. Full public/private function definitions, ACLs, pinned configuration and SECURITY DEFINER flags agree. Owner MD5, private-schema/client-table denials, exact/mismatched check-in retries, actor mismatch, missing/stale/revoked consent, cross-user read, old-client and anonymous denial, row count and AI-off/version1 remain verified. The reviewer inspected the source; parent reports final **PASS1, exit0, 49.993 seconds**, after correcting a fixture-only idempotency key shorter than8 characters.

That same final test applies the exact STOP SQL and denies both authenticated new and old writer calls; RESUME restores the prior function/ACL fingerprint, permits a currently consented new save, and still denies the old writer. This is sequential PGlite evidence using fictional Auth/Storage scaffolding. It is not Supabase Auth, multi-session concurrency, a live operational drill, cancellation of calls already executing or a test of all trusted service-role table writes. The candidate migration SQL remains unchanged and was not applied to cloud.

R3 rollout gates remain:

1. Freeze the explicit staging target and only this exact candidate; no `db push` or bundled pending teacher/consent/collaboration/admission migrations. Fresh official CLI2.119 readback at11:31:44 UTC in `MCY_LEARNER_WRITE_LEDGER_2026-10-11.json` confirms **20 shared/aligned, 0 remote-only, 5 pending**, including this candidate. Actor-bound check-in RPC remains unapplied. Independently match deployed owners, safe `search_path`, ACLs, SQL hashes and ledger after any separately cleared apply.
2. Local clean chronological21 / selected upgrade20+candidate SQL compatibility is now PASS in PGlite, alongside the exact-schema Docker upgrade/concurrency evidence. Retain the fictional platform scaffold limitation; exact Auth/REST/platform behavior and real actor acceptance still require the checks below.
3. Complete real staging API/row readbacks with verified disposable actors: valid learner A save and exact retry; learner B cross-user read/write denial; anonymous/direct/private/helper denial; expected-UID mismatch; stale/revoked required consent; appropriate teacher/reviewer/Owner forbidden paths; expired/revoked tokens/roles and concurrent revoke/save. Authenticate actor identity and actual authority independently of helper labels.
4. Fresh read-only A/B Auth preflight at 10:58:29 UTC returned200 and confirmed emails, with expiries11:56:27/11:56:40 UTC. This is not the actor/consent write matrix or proof of role assignments. The earlier temporary roles expired10:47:49.876065 UTC; do not extend or grant implicitly. Reverify at actual execution time.
5. Local sequential STOP/RESUME is now PASS. Match deployed candidate SQL/ACLs and resolve the triggering incident before any RESUME. Keep the known-racy old writer closed; reopening it is not a safe rollback. No live stop/restore or in-flight cancellation is claimed.
6. Bind final broad UI136/build/runtime/scanner/Sites and native limitations to the exact web artifact before staged exposure. Parent owns artifact/hosted acceptance; targeted34 does not substitute for those readbacks. Verify enforced repository/deploy protections rather than infer them from local workflow text.

The separate pending consent-cap migration replaces `record_my_consent`; do not apply it unchanged after this candidate without preserving/retesting the shared-lock and isolation contracts. The recorded automatic-review rejection of successful live Owner config save remains in force. None of these learner tests clear AI enablement/content expertise/rights or Production gates.

## Frozen source hashes (SHA-256)

| File | SHA-256 |
|---|---|
| `src/Prototype.tsx` | `58b8845cf5790c251e85554a27a74b9cf6d41f1c1568330868a205a4bbb84bd0` |
| `src/backend/consentPersistence.ts` | `141f4ec40f12d4c14be1384b4883e104dbd7be38168c0faf3fe184f4e37da181` |
| `src/backend/learnerSession.ts` | `3286c118eac57cc1a83d85144a22b6787b3b146cdba7df290cca6ac66a48ece1` |
| `src/backend/supabase.ts` | `e4c5f2b7fb84f69dff28b4af13e09b12ee7338dfbd7789ca760e8cc22ba108c9` |
| `src/backend/authEmailMetadata.ts` | `1aa385a2792330930d18e5051a1e3330bacc7571723efc4b64fff378185c5067` |
| `src/backend/AuthCallback.tsx` | `5dc40e88ddb53d89c255430d6694224d634024c328d26ad0830a64c412cdf120` |
| `supabase/migrations/20261002120000_bind_checkin_writes_to_current_actor_and_consent.sql` | `439963a4be829f46661b72aad89267038033e0ce1401b404f8ef95ddd421785a` |
| `scripts/rehearse-learner-writes-docker.mjs` | `97b32e509bac0f204825d490bcb37a8529e55290ed465b490b14f72cbff7e903` |
| `scripts/auth-email-templates.mjs` | `d5e2ca3d188e9b00042eb53c9e0f78363254776453f00a326b13514c92df5b58` |
| `scripts/rehearse-auth-emails-docker.mjs` | `0f12d2058d571fc629966ba7eb3d23e9f00770d27596cf9301ff3c9a3188e530` |
| `scripts/auth-email-body-manifest.mjs` | `979da618eb2b3a13cad12e4a898ead556b49e65bc65b1e9d20bfff9d54c1bc98` |
| `scripts/preflight-auth-email-config.mjs` | `82c0cc86fd0102f25dab4dff8953d4833e82af7bda77e1f0b815d5895304a607` |
| `scripts/apply-auth-email-config.mjs` | `8a33f99011bfb37419df41c991aa3ff4a690e41d94ba82e58c486d3bdba773b6` |
| `supabase/templates/manifest.json` | `63012a11e03a7c37ad3b1eff1ed548048f14ad7e23baab14ad84697f59dbc8bd` |
| `tests/learner-write-review.spec.ts` | `151fd957ae1639e4ed07a7f03421c7f7c8adfd5082a50baa0f9f35bea08bf0a8` |
| `tests/auth-email.spec.ts` | `9d99bf0b427f7ec0628063a0a9f212277cc5f13289891f50ac7befa1bd1921c5` |
| `tests/auth-callback.spec.ts` | `fe90a9b105a41ad783ca5be1b42e563d2064135e47eca4622ad0265a3dfc2a3c` |
| `tests/learner-ux.spec.ts` | `1015a060c76cbded938d217ee9370e15cc27f2f3ecd41b109bbc10802a3ec01e` |
| `tests/learner-write-clean-rehearsal.cjs` | `217a950c8003c5a72630e5cbded5ded5c85dfffc0624a876536b368e1f171887` |
| `docs/release/MCY_LEARNER_WRITE_STOP_2026-10-11.sql` | `fc558996a3f789b4b4c0691c584916edf22f7d49e68ebe2dc0230d03e171f25e` |
| `docs/release/MCY_LEARNER_WRITE_RESUME_2026-10-11.sql` | `b8064b0f8f031036ed85a7e5b041cdd4e429c83e0f5d4201703afdf3df396c0f` |

Dirty workspace state was inspected; this review does not equate current HEAD or older broad test runs with the frozen candidate above. Source changes after these hashes require a corresponding review/evidence update.
