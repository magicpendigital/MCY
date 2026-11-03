# Independent R3 — isolated late-save source candidate, 2026-10-13

Reviewer: `auth_learner_final_review`. UTC time reference captured during source review: **2026-10-13 08:12:02 UTC**. Scope: an ignored shadow source candidate, its patch, existing fictional diagnostic spec and two candidate Playwright configurations. No main app edit, cloud/device operation, build/install/deploy, email or learner write by this reviewer. The frozen incident R3 `3e607bada085031dd0d759173ef55532692798ca205dcaaeee37838c9dbe80ba` and diagnostic R3 `18ffc368e55f73c6a11f3573c969aa604d2e5393959663882412cb040a981ffb` remain historical and unchanged.

## Conclusion

**No remaining P1/P2 found in the narrow candidate source/test-control scope.** Clear the exact two isolated diagnostics, followed by the selected existing learner-write/device fixture regressions, with one worker/Edge/validated loopback port and managed Vite. Tests have **not been run by this reviewer**, and candidate test outcomes remain **CHƯA CHẠY at this source clearance**. This review does not clear application rollout or prove the cause of the extra physical-native B record.

The candidate addresses a demonstrated source behavior: an explicitly initiated standalone save held during account-bound-client preparation can still be handed to the writer after its originating route was left. It checks the initiating continuation before preparation and immediately after that awaited preparation. It does not cancel requests already handed to the SDK/server, implement a single-flight save contract, alter SQL/consent/idempotency, or repair the earlier physical startup issue.

## Original diagnostic evidence

Read stored parent-run receipt `analyse/MCY_NATIVE_CHECKIN_DIAGNOSTIC_ORIGINAL_2026-10-13.json`, SHA256 `c91d79f3450007f143659410cb1557bc3c7ecb23edc10f8a5117968036de2ed3`. Exact cleared spec `a0aa6f329862bfcdbce24276c044a1a85e4ece235d942d833cd275616e78c07b` ran against original Prototype `58b8845cf5790c251e85554a27a74b9cf6d41f1c1568330868a205a4bbb84bd0` under isolated `mcy-playwright.invalid`, Edge/4298/one worker, exit **1**:

- No-click reload/synthetic auth hydration/focus/visibility/Journey case **PASS**, 8.5 seconds, zero writer requests in its bounded window.
- Explicit standalone save held during shared `auth.getSession`, then navigation away/release case **FAIL**: expected zero writer requests, actual one `none_now`/energy-2/standalone/zero-observation fictional POST after the gate/session-return checkpoints. This is a desired cancellation assertion failure, not a reported selector/timeout failure.

The source ordering independently supports that narrow gap: original code awaited `getAccountBoundSupabaseClient`, checked only session generation, then froze payload/key and invoked the writer; its originating route continuation was checked only after the helper returned. Neither the no-click PASS nor the late-dispatch energy-2 failure establishes the initiating action/cause of the native energy-null B row. Retain the native incident's cap breach, unknown cause and exhausted live budget.

## Candidate source review

Patch SHA256 **`5bd79171df95513b81123bb0525b61afef8a4cedb3e4a5d3377fa77d5dd5f2cd`** changes only `src/Prototype.tsx` in `.vercel/native-checkin-late-save-candidate`:

1. Adds required `canDispatch: () => boolean` to `persistCurrentCheckin`.
2. Rejects an invalid continuation at entry and again immediately after awaited account-bound-client preparation, before payload/key mutation and the writer invocation.
3. Passes each existing `current` initiating continuation from the three actual callsites: ConsentFooter, Onboarding, standalone check-in.

Independent in-memory exact-text comparison recreated the shadow candidate from the original using these replacements only: **PASS**, exit 0. Mandatory argument prevents a forgotten caller from silently using a permissive default. The existing continuations check mounting, route generation, actor/session generation and captured sign-in identity; ConsentFooter retains its additional actor guard. Genuine current-route saves continue to the same initiating-token client and same server writer. Cancelled preparation returns null and each caller's existing invalid-continuation guard prevents misleading navigation/success handling. Previously frozen uncertain keys are preserved; no acknowledgment/retry/payload semantics are changed.

Main Prototype SHA remains `58b8845cf5790c251e85554a27a74b9cf6d41f1c1568330868a205a4bbb84bd0`; candidate SHA is **`32c100fbcd7433f6db2c6c299556adb22633d5cd8ecd9da01ca5420515287482`**. Source snapshot **`eca27da324ecb5cbf11540c0f53b952a678d7f72a3e084a7bca68c16e8320821`** contains 68 original/copied source records. Independently hashed all 68 pairs: **PASS**, exactly one differs, Prototype. Shadow tree has 70 total files: these 68 source records plus `index.html` and generated `tsconfig.json`; zero symlinks or `.env*` files. Its bootstrap index matches the original SHA `5531697191a079b68e136b8f04a3670a7964d7253bb34c49a8c679ac6b897c34` and imports `/src/main.tsx`. Candidate tsconfig SHA `8fa7705f43c4cd96071fdef3a707eaf599d7af04f82950cb5f876eef3187d9dc` is strict/noEmit/src-only. The snapshot reports typecheck exit 0; that is parent preparation evidence, not a reviewer rerun.

## Test/control review and limits

Final controls independently read/hashed:

| Control | SHA256 |
|---|---|
| `candidate-global-setup.mjs` | `14d951a4362789e52d82b553022445d48916365526c62851bbdf95fdf096e718` |
| `candidate.playwright.config.mjs` | `e64340bab660dfbccee635d46e95d846be9753729ede5df3d485cea0f9383ea6` |
| `candidate-regression.playwright.config.mjs` | `89313720eb291e42abc1049807f70e40e2a0478f325cad97cea457a5aa2317d7` |
| Unchanged desired-contract spec | `a0aa6f329862bfcdbce24276c044a1a85e4ece235d942d833cd275616e78c07b` |

The setup fixes the workspace and shadow root, verifies the source-snapshot hash and all 68 original/shadow pairs before start and after server close, rejects root development env files, isolates fixture credentials before Vite initialization, uses the shadow as `root`/`envDir`, and references original public assets read-only. The actual Vite config has no source alias that redirects this candidate to the original Prototype. SDK/internal app imports resolve to the copied source tree. Managed server uses strict loopback port, closes on listen failure and teardown; no unmanaged process or server mutation is introduced. Configs select exactly the two diagnostics or existing `learner-write-review.spec.ts` and `learner-device-acceptance.spec.ts`, with one worker and ignored outputs. All three control files passed `node --check`, exit 0; this does not execute Vite or Playwright.

The setup verifies 68 source records, not a complete 70-file runtime artifact. Reviewer independently checked the two auxiliary files; pinning their hashes in a future control revision would strengthen drift detection. Snapshot `globalSetupSha256` records an earlier preparation-stage control hash; the final control pin above is authoritative for this review. Do not rewrite the snapshot or pretend its historical control field is the current setup hash.

Selected regressions are meaningful for normal positive saves, exact-key retry/edited draft, account/route continuity, consent revoke and restored web history. Helper imports in these existing test files use original backend modules, which are identical to their copied counterparts; browser UI runs the shadow Prototype. These fixtures are not real actor/RLS/native acceptance. The existing diagnostic spec's explicit session/response checkpoint plus two-frame/one-second window remains bounded observation rather than a promise of no request at any future time. It rejects direct table mutation, non-fixture actors, real Supabase hosts and AI selection/inference; only fictional capabilities reads are permitted.

## Follow-up gate

Record exact control/source pins, invocation, worker/browser/port, process exit and each failure scope. Candidate acceptance requires the original late-dispatch scenario to stop issuing the fictional writer while normal current-route positive saves/retries continue to pass. If failures occur, fix the candidate/control and rerun the affected scope; do not weaken the zero-dispatch assertion or regressions to obtain green.

Even successful candidate tests do not establish a physical-native causal fix, cancel in-flight requests, guarantee global same-route single-flight behavior, clear profile/locale or server migration scopes, grant a new live budget, or authorize build/install/deploy. Main source/APK/cloud remain unchanged. A real source integration/replacement artifact requires its separate exact diff/review and appropriate acceptance; the unexpected row and failed native acceptance remain retained.
