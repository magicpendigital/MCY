# Independent UI/runner source QC 5.3 — v1

Reviewer `/root/profile46_qc`, 18/10/2026. **R3; source-only. Verdict: BLOCKED_INVOCATION_PENDING_RUNNER_BOUND_AND_FINAL_CONTROL_REVIEW.** Không import, collection, test, build, server hoặc browser. Đây là review source của UI/runner, không final QC của backend đang hoàn thiện, không human review5.2 hoặc live/private Auth acceptance.

## Exact inputs và kiểm thực tế

[UI handoff](UI-SOURCE-HANDOFF.vi.md) SHA-256 `0d6ecce765f290a62b7877b9b303f5f202c3c3dab66832d069c5d88f02ec1548` ràng buộc10 path thuộc candidate `.vercel/ux-step5-3-20261018-v1`. Independent PowerShell read/hash/size check lúc `2026-10-18T15:53:00.9985443Z`, **actual exit0, 10/10 match**. Command kiểm đọc handoff, parse các hàng `path | bytes | SHA-256`, dùng `Get-FileHash -Algorithm SHA256` và `Get-Item.Length` so từng hàng; throw nếu count khác10 hoặc mismatch. Chỉ source/pin read, không execute module.

Các pin liên quan trực tiếp:

- `scripts/unit-review-egress-guard.mjs`: `9e0ac189f37f3d00a9cfca756a96e9142c1a6bc01a6dc752c72e4d7dcd3da58b`.
- `scripts/unit-review-run.mjs`: `d2e1fcd1b4a56bbf163c08ad1cd6a34c163e0f8c2293b85a0d0b86280c9154e8`.
- `tests/unit-review-egress-guard.test.mjs`: `7461b66317a4386fd76e3042383e2c3fa7d95af2aa88deae063951801ee8a921`.
- Setup `40623d16459db2ba075a8f645c8c2c07361d314acb36fd1c2b7291fd5905a531`; config `344b74dcd524244ba43fa397b87b9169b016f5cc1d42e203e68b91f831856a45`.

## Read-through

Hai P2 UI trước đã sửa ở Workspace `20b1366173c1ed9ea7e58038befc9b69ce1ce477de5caa0890d8476b50375141`: malformed/foreign-epoch mutation clears private DOM; notes/review phải giữ exact hash/revision. Validated read mới focus/scroll reader heading. Case14-item dùng locator.focus rồi Enter: chứng minh activation/focus transfer dự kiến, **không** chứng minh toàn bộ hành trình actual Tab. Chưa test thực tế.

Proxy chỉ forward HTTP tới exact `127.0.0.1:4253`; deny nonlocal HTTP, CONNECT và upgrade; cap request/body, timeout local-forward; receipt counts-only, không ghi destination/header/body/capability. Config ép transport browser qua proxy4255;15 UI giữ CSP,11 regression browser dùng bypassCSP chỉ cho unchanged SDK `.invalid` mocks. Không context catchall; mock-resolved calls không nằm trong transport counts. Đây là phạm vi đo, không proof mọi request application đúng mong đợi.

Runner chỉ nhận3 project cố định, channel allowlist, OS env allowlist cùng explicit `.invalid` fixture, không NODE_OPTIONS hoặc provider secrets. Node-worker catalog substitution giữ nguyên tập assertions38 records của original; denominator phải ghi **11 unchanged browser +1 equivalent Node-worker**, không12 unchanged browser. Collection15+12 vẫn pending.

## P2 cần đóng trước invocation

`scripts/unit-review-run.mjs:49–56`: timeout/output cap chỉ SIGTERM direct child rồi đợi `close` vô hạn. Không có secondary deadline hoặc cleanup classification/verification cho Playwright browser descendants/server/proxy nếu global teardown không chạy. Vì vậy600s chưa là hard bound cho toàn invocation; forced exit không được suy browser/server đã đóng. Sửa hẹp bằng bounded termination/final receipt kể cả child không close, ghi rõ cleanup unverified nếu không chứng minh được; chỉ xử lý PID/process tree do runner sở hữu, không global browser kill. Hoặc outer reviewed executor cung cấp bound/cleanup tương đương và pin rõ exact command. Không automatic retry khi forced cleanup chưa rõ.

## Gate tiếp theo

Backend/server/model/adapter và build/control dependencies vẫn phải freeze/review R3 riêng; source mới phải có pin mới. Runner chưa tự kiểm input pins trước/sau, nên final reviewed wrapper hoặc root invocation receipt phải làm việc đó rõ ràng.

Sau khi root GO exact frozen controls: chạy negative egress trước browser (`node scripts/unit-review-run.mjs --project egress-negative`), đọc actual exit và negative assertions; sau đó launch-free collection từng project để xác nhận15 và12, rồi mới bounded suites. Negative cố ý tạo403/count FAIL_UNEXPECTED_EGRESS_OR_CAP được test assert và processPASS; không nhầm với suite transport receipt0 unexpected. Các backend protocol/source-race/lease negatives cũng phải PASS theo final control plan trước actual Owner preview. Build/artifact scan và exact static artifact pins là gate riêng trước server/browser; source-only verdict không thay thế chúng.

Giữ native HALTED, web BLOCKED, canonical/contacts/root app/approved4.7 không sửa. Local fixture/Owner preview không cấp role, không xác minh chuyên môn/independence và không approve nội dung. STOP sau5.3 trước bước6.
