# Independent intake QC — 4.6 Profile

**PASS intake/impact gate; không có P1/P2 được xác nhận trong frozen plan.** Reviewer `/root/step44_independent_qc`, độc lập với plan worker/implementer. Root phải đọc intake và ra GO riêng trước tạo candidate/implementation. Đây chưa là app QC hoặc user handoff PASS.

Reviewed [PLAN-INTAKE-FREEZE.json](PLAN-INTAKE-FREEZE.json), SHA256 `9596f1f4d7f2f782d819dabc50fae0b4a280f5506de06d89bbfe8877ffbb8d3d`, cùng [intake](TASK-INTAKE.vi.md), [plan](PLAN-CONSOLIDATED.vi.md), actual approved Profile/AccountDetail/Auth source, package/config và relevant test source. Theo current lifecycle/change-review/risk/brand guidance. User18/10 đã duyệt4.5/giao4.6; **STOP trước4.7**.

## Independent byte/baseline check

Own command `node analyse/ux-step4-6-2026-10-18/independent-intake-checks.cjs` **exit0**. [Raw receipt](INDEPENDENT-INTAKE-CHECKS.json) SHA256 `485f1cead4f7f83a7d56b3e65f4977ca6b672eba82af6f239c7b07381ad5757b`:

- 5 frozen documentation/helper pins và26 source-context pins khớp; source-read receipt trùng chính xác baselinePins.
- 35 fresh tracked dirty-file raw hashes khớp current root, tracked git status/list khớp; không staged inputs bị bỏ sót. Không tái dùng228pins17/10 như current baseline.
- Approved4.5 f57 và toàn bộ235candidate inputs vẫn khớp; candidate4.6 chưa tồn tại lúc kiểm.
- 15 local links resolve; frozen docs/context pins khớp lại sau kiểm. Read-only Git phát LF/CRLF warnings; đây không phải app runner failure hoặc thay raw bytes.

Không chạy lại helper freeze của worker vì nó ghi frozen records; reviewer dùng checker riêng fail-fast, schema/path cụ thể và raw Buffer hashes. Không browser/app tests/live/Auth/native/deploy actions trong intake QC.

## Scope/risk và contract mapping

R1 hợp lý **chỉ với ProfileScreen return JSX/copy hẹp và scoped CSS/focused tests** như intake. Actual signOut implementation, rememberedPace gate, AccountRow shared component, AccountDetailScreen, route config/callback payloads, Auth hydration/reset, consent/profile writes/backend/runtime giữ bytewise. Di chuyển cùng controls không cấp quyền sửa handlers. New API/persistence→R2; Auth/consent/permission/policy thay đổi→R3 và intake bổ sung trước edit. Profile-owned scroll wrapper class là presentation trong return, không shared-runtime/retained ancestor styling.

Intake giữ đủ9destinations: editProfile, memory, privacy, security, notifications, access, sharing, help và export/delete→Help. Privacy trực tiếp và revoke không bị capability disclosure che; teacher sharing không tự grant khi chưa lớp. Notification/marketing preferences thực có vẫn usable dù scheduling/push/reminder chưa mở. Free access/help/search/articles có thật không bị gọi chung unavailable. Không fake About/contact/mailto/export request/entitlement. Guest CTA giữ create/profile auth destination và chỉ mở route; security giữ login/security destination, không tự gửi email.

Actual Profile consumer chỉ có guest/signedIn, không role-gated admin entry hoặc confirmed-email flag riêng. Intake đúng khi cho bỏ claim “Email đã xác minh” bằng copy hẹp, không thêm verified/consent/sync badge từ signedIn/defaultfalse/loading. Không derive status từ backend flags hoặc gọi refresh mới. Account-detail error/loading/pending/cancel/body-style semantics là preserved adjacent behavior; không tự sửa chúng trong task hierarchy.

## Coverage mapping so với discovery

Intake đã bao phủ các gaps reviewer nêu: focused guest/synthetic account, no automatic mutation khi entry/browse/collapse, signOut pending/disabled/error/local success, all9targets/back, long identity, actualTab/full focused rect trên BottomNav, true28px, narrow/landscape/desktop/iPhone/Pixel và retained Home/CourseDetail/Reflection CSS.

Current tests có timezone/DEVpartialEnglish, access free-v-paid/help/privacyAI-off, security other-account/notification no-scheduling, delayed profile A→B/A→B→A và delayed consent/session guards. Intake map đúng các cases này và adjacent4.1–4.5/save/Journey. Profile signout pending/error trước đây chưa có focused coverage; intake yêu cầu mới, không suy từ actor reload PASS. Signed-in/consent synthetic fixtures chỉ chứng minh local contracts, không live Auth hoặc cloud acceptance. Existing handler không được “nâng cấp” session guarantee trong4.6 chỉ vì test mới chạy.

Các app baseline gates và focused/mapped/regression của4.6 vẫn **BLOCKED/unrun tại intake**, không nhận historical4.5PASS thành4.6PASS. Required runners phải process exit0 trên final frozen source/tests/harness/config; preserve initial failures/supplements và không thay whole gate bằng focused rerun. Scope test cụ thể, không unrelated full suite. Screenshots dùng evidence cwd riêng để không ghi đè historical artifacts.

## Remaining gates và limits

Sau rootGO: implement trong candidate4.6 riêng → applicable baseline/focused/mapped checks → exact final source/evidence freeze → independent appQC → root direct final pins/pixels/flow → user review. Source/test/config thay phải newfreeze/reopen affected QC. Bytewise preservation proof và thực tế reachable controls vẫn phải kiểm ở app QC; intake PASS không thay thế.

Prior4.5P3 shared RegionEditor clipping và invalid falsePASS root receipt giữ nguyên lịch sử, không sửa shared runtime trong4.6. Physical/native/screen-reader/OSkeyboard/liveAuth/realvideo/rights/release chưa được nghiệm thu; không làm blocker giả cho local presentation scope, cũng không tuyên bố PASS các mặt đó. Historical control PyYAML gap không thành skill-validatorPASS và N/A khi4.6 không đổi skill.

Không cần approval lại cho local4.6 đã giao; root appGO là coordinator gate đã thống nhất. Native **HALTED**, web **BLOCKED_NO_UPLOAD_OR_ALIAS**; no live writes/Auth/logout/consent/email/AI/media/native/install/deploy. Rollback bỏ candidate4.6, giữ approved4.5, không data/APK/deploy changes. **WAITING_USER trước4.7**; không zero-regression hoặc remote-CI-enforcement guarantee.
