# Independent R3 — isolated native-check-in diagnostic UI tests, 2026-10-13

Reviewer: `auth_learner_final_review`. Scope is read-only review of two new diagnostic test/control files and the existing runner-owned fictional-backend setup. No application/frozen manifest/source/report changes, Playwright invocation, device access or cloud operation by this reviewer. The frozen incident R3 `3e607bada085031dd0d759173ef55532692798ca205dcaaeee37838c9dbe80ba` remains unchanged. Native incident cause remains unknown; these desired-contract tests are not physical-native incident reproduction or release clearance.

## Initial source review, 07:58:11 UTC

Reviewed inputs:

- `analyse/native-checkin-diagnostics/playwright.config.mjs`, SHA256 `3bd6e1f9d2c10fec9a6b6fb5ed7ef89bae223bce406747355f3813de7b89a9d7`.
- `analyse/native-checkin-diagnostics/late-save.spec.ts`, SHA256 `77c699481519f55b2e18db4edc93bc41857e5038f091d419fc40ec68b707bd91`.

The config selects only this spec outside normal `tests/`, one worker, a validated loopback port, existing managed Vite global setup and an ignored diagnostic output directory. Existing setup calls `isolatePlaywrightTestEnvironment()` before Vite creation, forces `mcy-playwright.invalid`/fictional publishable key, removes known server credentials and returns `server.close()` teardown; it does not start an unmanaged child server. These controls are appropriate for this isolated test. The spec seeds a fictional B session/history and aborts `*.supabase.co`. The shared-client method patch exists only inside the disposable test page. Fixed-footer/home/current-route selectors and header Back selectors align the current app; execution has not verified them yet.

## Findings requiring closure before relying on results

**P2 — operation completion is not established by `networkidle`.** In the delayed-client test, releasing the held `shared.auth.getSession` does not mean `getAccountBoundSupabaseClient` and its caller have completed. `page.waitForLoadState('networkidle')` may return immediately if the page already reached that state while the non-network gate was held. The subsequent zero-save assertion can therefore pass before the awaited session result/dynamic SDK import/RPC dispatch runs. In the reload/refresh test, `profileReads` increments when a request starts, before complete snapshot hydration; existing `networkidle` alone is not a settled-operation marker either. Add an explicit test-only completion barrier or a clearly bounded negative observation after confirming release and hydration completion. Do not call an already-idle page proof that the pending save was cancelled.

**P2 — the read fixture can silently accept table mutations.** `/checkins` and `/checkin_observations` are fulfilled regardless of HTTP method and their static fixture rows never change. A direct REST POST/PATCH/DELETE could escape `saves` and still pass zero-write/history assertions. Require GET for read-table routes and fail/record any unexpected mutation; allow only the actual capabilities action on the AI function so selection/inference is rejected rather than silently answered as unavailable. Current frozen app code uses the reviewed RPC, so this is diagnostic-control completeness, not evidence of a direct-table incident write.

No P1 found in the reviewed local test/config scope. Initial conclusion: **fix these P2 evidence gaps before treating the test result as meaningful cancellation/zero-write evidence**. This conclusion applies to the initial source only; closure is recorded below.

## Final source closure, 08:02:35 UTC

Re-read final `late-save.spec.ts`, SHA256 **`a0aa6f329862bfcdbce24276c044a1a85e4ece235d942d833cd275616e78c07b`**. Config SHA remains **`3bd6e1f9d2c10fec9a6b6fb5ed7ef89bae223bce406747355f3813de7b89a9d7`**.

Both initial P2s are closed **for this explicitly bounded diagnostic scope**:

- The reload/refresh test arms a GET observations-response latch before the synthetic auth event, observes a new profile read, awaits response completion, then waits two animation frames and a stated one-second negative observation window. It no longer treats an already-idle page as completed hydration.
- The delayed-session wrapper marks `__mcyDiagnosticSessionReturned` only after the original getSession resolves. The test awaits that marker after releasing the gate, then the same two-frame/one-second observation window. This still is not a direct promise-completion marker for every later helper continuation, and its result must be described as a bounded dispatch observation, not proof about every future request.
- Check-in/observation read table routes require GET; attempted mutations are recorded as unexpected and answered 403. Profile/Auth writes fall to the unexpected route. The AI fixture permits only POST action `capability`, rejecting selection/inference attempts. Auth/fixture actor mismatches and staging-host requests remain rejected.

**Source clearance: no remaining P1/P2 in the final two-file diagnostic control scope.** The parent may run this exact isolated spec using the existing runner-owned fictional Vite environment, chosen loopback port/Edge channel and one worker. Test execution remains **CHƯA CHẠY at source clearance**; the reviewer has not invoked Playwright. A timing/selector failure must be distinguished from an observed writer request; record the exact final spec hash and actual process exit. A red zero-dispatch assertion is useful only with a captured fictional writer request/body and successful navigation/gate checkpoints.

The frozen incident R3 still hashes to `3e607bada085031dd0d759173ef55532692798ca205dcaaeee37838c9dbe80ba`. No frozen app/input/old receipt was changed by this review.

## Scope limits

The first test exercises reload, synthetic TOKEN_REFRESHED/focus/visibility events and Journey viewing in a fictional web page. Synthetic visibility events do not change native lifecycle or prove cold-start/native behavior. The second test specifies a desired rule: an explicit save whose originating route is left while client preparation is held must dispatch zero writers after release. A red result can identify a deterministic web/source gap in that rule, not prove the cause of the unexpected B row. Existing server actor/consent/idempotency guards are separate. No migration, app fix/build/install, cloud write, repeated physical trial, additional budget or broader tests are cleared by this review.
