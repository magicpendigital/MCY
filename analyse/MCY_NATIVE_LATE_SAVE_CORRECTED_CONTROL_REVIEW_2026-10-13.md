# Independent R3 — corrected isolated late-save controls, 2026-10-13

Reviewer: `/root/late_save_candidate_review`. Final report time reference: **2026-10-13 08:32:26 UTC**, after the parent-reported candidate tests. This report was not frozen before execution. The reviewer's source-clearance message preceded the corrected execution.

**No remaining P1/P2 found in the narrow candidate source/corrected-control scope.** Clearance covers the exact two fictional diagnostics and nineteen selected existing learner-write/device fixture regressions, one worker, Edge, loopback port 4298 and managed Vite. It does not clear source integration, rollout or physical-native acceptance.

## Independently inspected pins

| Input | SHA256 |
|---|---|
| Shadow `src/Prototype.tsx` | `32c100fbcd7433f6db2c6c299556adb22633d5cd8ecd9da01ca5420515287482` |
| Original `src/Prototype.tsx` | `58b8845cf5790c251e85554a27a74b9cf6d41f1c1568330868a205a4bbb84bd0` |
| Candidate patch | `5bd79171df95513b81123bb0525b61afef8a4cedb3e4a5d3377fa77d5dd5f2cd` |
| Source snapshot | `eca27da324ecb5cbf11540c0f53b952a678d7f72a3e084a7bca68c16e8320821` |
| Auxiliary snapshot | `1158ed459ee49d44ee699fcc48b05c7e8c24f4d41bd2c5496b1aab738585acf1` |
| `candidate-global-setup.mjs` | `8c1e205d9e784018a0a0a36f8f02c6a054039b4655d5e9c9234481e071577279` |
| `candidate.playwright.config.mjs` | `db3f59515388b3231bfcd0261e1e3badff645b4951f36f64838b463b02968f32` |
| `candidate-regression.playwright.config.mjs` | `89313720eb291e42abc1049807f70e40e2a0478f325cad97cea457a5aa2317d7` |
| Unchanged `late-save.spec.ts` | `a0aa6f329862bfcdbce24276c044a1a85e4ece235d942d833cd275616e78c07b` |

Read-only SHA256 inspection before source clearance matched **71/71 original/copied pairs**: 68 source inputs plus exact existing `index.html`, strict noEmit `tsconfig.json` and `design-system/tokens.css`. Only Prototype differs between original and shadow. Shadow has 71 files, zero `.env*` files and zero symlinks. This inspection returned exit 0; it did not execute candidate code or tests.

The mandatory initiating continuation is checked at helper entry and immediately after awaited account-bound-client preparation, before freezing payload/key and invoking the writer. All three callsites pass their existing route/session/actor continuation. The current-route path, initiating-token client, server consent/idempotency contract and acknowledgment/uncertain-key behavior remain unchanged.

The corrected setup pins the source and auxiliary snapshots, checks all 71 pairs before Vite initialization and after managed server close, sets shadow `root`/`envDir`, rejects development env files and isolates the fictional backend before server creation. Original public assets are referenced read-only. The inspected Vite config has no alias redirecting the shadow Prototype to the original. Listen failure and teardown close the managed server. Configs retain one worker and exact diagnostic/regression selection; corrected diagnostic output uses a distinct directory. Copying and pinning the unchanged token stylesheet resolves the intermediate missing-stylesheet scaffold failure without weakening assertions.

The unchanged diagnostic uses fictional actor/token/origin, aborts real Supabase hosts, rejects direct table mutations and AI inference, and observes zero dispatch after explicit response/session checkpoints plus two frames and one second. This is bounded fixture evidence. The original run's late-dispatch failure involved an explicitly initiated energy-2 save; it does not establish the cause of the native energy-null extra B row.

## Execution evidence and limits

At source clearance, corrected tests were **CHƯA CHẠY**. Subsequently the parent reported diagnostics **2/2 PASS, exit 0** (4.6s and 5.2s; total 11.8s) and selected regressions **19/19 PASS, exit 0** (total 55.8s), with all 71 post-close guards passing. These results are **parent-reported**, not independently rerun or receipt-reconciled by this reviewer. No test, app/device/cloud operation, env/key read, build/install/deploy or data mutation was performed by this reviewer; the only write is this new report.

The native trial remains **FAIL**: three new check-ins versus approved cap two, both wellbeing consents finally revoked, zero remaining cloud writes, extra B cause unknown. The patch cannot cancel an SDK/server request already dispatched or cure same-route overlap by itself. The original source/APK remain frozen; further live writes, integration or release require their separate applicable authorization and acceptance.

Preserved historical reviews: candidate R3 `7d882248c5d3f0e966dfd2c73f5f4b98a7485c2f4c71de4607804727fc494e90`, incident R3 `3e607bada085031dd0d759173ef55532692798ca205dcaaeee37838c9dbe80ba`, diagnostic R3 `18ffc368e55f73c6a11f3573c969aa604d2e5393959663882412cb040a981ffb`. Their old control/status fields remain historical; this supplement does not rewrite them.
