# Bàn giao implementer — 4.6 Cá nhân (local candidate)

18/10/2026. **Ứng dụng/harness đã freeze; implementer verification hoàn tất. Independent app QC và root manual/final đang chờ, nên đây chưa phải 4.6 acceptance hay lệnh bắt đầu 4.7.** Candidate `.vercel/ux-step4-6-20261018`, source freeze [01d](SOURCE-FREEZE-v1.json) từ approved4.5 f57. Dirty root giữ nguyên; không tích hợp vào root.

## Hành vi và phạm vi

Profile mới xếp Hồ sơ/dữ liệu (cá nhân, quyền riêng tư, ghi nhớ) lên trước, rồi tài khoản/hướng dẫn, sau đó capability/status thấp hơn. Guest CTA đăng ký/đăng nhập và signout giữ functional. Tùy chọn thông báo/free access hiện trạng được diễn đạt đúng giới hạn; không giả lịch thông báo, trả phí, chia sẻ, export, xác minh email, metrics/consent badge. Privacy đi trực tiếp; export/delete vẫn qua Help. Chỉ JSX return của Profile, CSS `.mcy-account-home` và `tests/ux-profile.spec.ts` mới khác approved4.5. Profile handlers, Auth/consent/backend/routes/shared runtime/52 tests cũ và mọi source ngoài vùng Profile đã giữ bytewise. [EXECUTION](EXECUTION.vi.md) và [preservation](preservation.json) giải thích chi tiết.

## Bằng chứng thực thi của implementer

| Gate | Kết quả và giới hạn |
|---|---|
| 7 baseline | [checks.json](checks.json): runtime, catalogue, typecheck, fixture build, Sites prep, bundle scanner, Sites+environment isolation đều process exit0. Fixture build, không tuyên bố generic release build. |
| Profile focused | [focused-final-v1 command](focused-final-v1-command.json) + results/log: 28/28 expected, unexpected0, process exit0. Guest/account,9 routes, no automatic write, CTA, signout, consent pending, long name/main28 focus, simulator/safe-area, error/loading/sharing. |
| Mapped adjacent contracts | [mapped-final-v1 command](mapped-final-v1-command.json) + results/log:14/14 expected, unexpected0, process exit0. Account/access/version/delayed profile+consent/actor and nearby Help/timezone. |
| Original adjacent strict-CSP | [adjacent-final-v1 command](adjacent-final-v1-command.json):13PASS/2FAIL, process exit1. Unchanged Course tests expected page-mocked iframe request counter1; `frame-src 'none'` blocked before route. Original failure remains FAIL, not overwritten. |
| Mock-frame selected adjacent | Separate [ef06 supplement](COURSE-MOCK-SUPPLEMENT-FREEZE.json) binds original01d; independent pre-invocation review. First sandbox invocation [command](course-mock-final-command.json) **15 pre-body FAIL/process1** because Edge could not create sandbox temp profile. Distinct environment-only [v2 freeze824e](COURSE-MOCK-ESCALATED-v2-FREEZE.json), independently reviewed before scoped escalated run. [V2 command](course-mock-escalated-v2-command.json) + results/log: **full selected15/15 expected, unexpected0, skipped0, flaky0, actual process exit0**; no assertion/case/timeout change. |
| Post-run identity | [post-run pin check](COURSE-MOCK-POST-RUN-PINS.json) PASS263:236 app/test,16 original harness/intake,7 ef06 supplement,4 v2 environment files. Candidate/source01d unchanged. Root also separately read-only matched approved4.5/root preimages; root attribution remains in its own record. |
| User review preview | Frozen `preview.mjs` on4194: [HTTP/CSP receipt](PREVIEW4194-CHECK.json) 200, `frame-src 'none'`, `media-src 'none'`, invalid backend. This is read-only transport/CSP, not root visual acceptance. Preview stays available for root/user review. |

Combined successful selected checks are **28 focused +14 mapped +15 supplemental adjacent =57 case executions** across distinct runs; not a whole repository suite. Original adjacent13/2 FAIL and sandbox first run15 pre-body FAIL remain visible. Early setup/locator/fixture diagnostics stay in [DIAGNOSTICS](DIAGNOSTICS.vi.md); no failures were erased or relabeled.

## Limits and pending checks

Focused main content at text28px passed bounds/focus checks, but the unchanged shared BottomNav footer clips/overlaps at the same injected size; **full footer28 legibility remains unaccepted**. Independent same-input4.5/4.6 comparison and classification are QC duties. Notification preference true-state is covered; false-state parity belongs to independent QC. Independent Profile review and root direct pixels/keyboard/navigation final verification remain **PENDING** here; no implementer self-review is substituted for those results.

Local fixture/browser evidence does not establish full screen reader, physical Android/iOS, native restoration, actual account/Auth/consent/write paths, clinical/content rights, full English, remote CI or web release. Native remains HALTED and web upload/alias BLOCKED. No agent real account, email, SQL, inference, media, device build/install, deployment or cloud upload. Rollback is to retain approved4.5 and omit this isolated4.6 candidate; no data rollback is involved.

**Next:** independent QC, root final verification, then user review. Stop before4.7. Later acceptance/current status belongs in new records and must not mutate pinned intake/plan or historical failures.
