# Nhận việc 4.6 — Cá nhân/Profile

18/10/2026 Asia/Bangkok · Windows/PowerShell, `D:\Projects\MCY`. **PRE_IMPLEMENTATION / BLOCKED chờ independent intake QC và root đọc/GO trước tạo app candidate.** User đã duyệt4.5 và yêu cầu4.6; stop user review trước4.7. Không cần xin lại quyền local đã giao. Root điều phối, implementer thực hiện, reviewer độc lập QC, root trực tiếp kiểm/báo cáo.

Theo [lifecycle](../../docs/quality/TASK_LIFECYCLE.md), [intake](../../docs/quality/TASK_INTAKE.template.md)/[QC template](../../docs/quality/TASK_QC.template.md), [change review](../../skills/mcy-change-review/SKILL.md), [risk matrix](../../skills/mcy-change-review/references/review-matrix.md) và [brand UX](../../skills/mcy-brand-ux/SKILL.md). Record mới PASS/FAIL/BLOCKED/NOT_APPLICABLE; không giả định zero regression hoặc remote CI enforcement.

## Yêu cầu và baseline thực tế

[Plan14/10 bước4.6](../ux-implementation-2026-10-14/PLAN.vi.md): Profile ưu tiên chức năng đang dùng; nhắc tập/gói/lớp/support chưa có không trình bày như đã hoạt động; không tự tạo email support. [Audit S10](../ux-audit-2026-10-14/source-ux-notes.md) đề xuất ba tầng Hồ sơ / Dữ liệu và quyền / Hỗ trợ, thu gọn trạng thái capability chưa mở. Đây là hierarchy, không cho phép mở backend hoặc liên hệ mới.

Approved app `.vercel/ux-step4-5-20261017`: [source-v2](../ux-step4-5-2026-10-17/SOURCE-FREEZE-v2.json) SHA256 `f57b2ba99aad152ffa52192ea40725ceab0a9ba6005a347323c11a880e7301a8`; [evidence-v2](../ux-step4-5-2026-10-17/EVIDENCE-FREEZE-v2.json) `a81bf13ee6d378600658b891c287ae3c01c59dec9b4135edb51217ed4e6b7270`. [Current status4.5](../ux-step4-5-2026-10-17/CURRENT-STATUS.vi.md) và [root verification](../ux-step4-5-2026-10-17/ROOT-VERIFICATION.vi.md) là prior local evidence; user18/10 mới duyệt, các waiting fields cũ là lịch sử, không sửa frozen records.

Source reads và **fresh current dirty root status/hashes** được lưu riêng trong receipt; không giả định228 root preimages17/10 còn đúng hôm nay. Không reset/chép đè root. Documentation worker chỉ sở hữu thư mục analysis mới; app worker chỉ candidate mới sau GO. Không copy env/secrets/account state. Baseline4.6 checks chưa chạy → BLOCKED, không phải app failure mới hoặc PASS mới.

## Trace source / capability boundaries

BottomNav→ROUTES.profile (header55/footer68)→ProfileScreen. Hiện hero guest/account +card đăng nhập/đăng xuất +9rows. Profile có local signingOut/error; signOut gọi shared SDK `auth.signOut({scope:'local'})` khi backendConfigured, finally mở lại nút. **Không sửa handler/async behavior**; chỉ di chuyển cùng button JSX khi cần. Guest CTA giữ authMode=create/authReturnTo=profile rồi push authEmail. Không email được gửi khi chỉ mở route.

Các rows: editProfile; memory; privacy; security; notifications; access; sharing; help; export/delete→cũng Help. Không About route/link thật trong đoạn này, không tạo mới. Learner Profile không điều kiện teacher/Owner roles; staff workspace query roots lazy riêng, không thêm admin entry hoặc tự suy quyền từ signedIn. Không avatar/progress/streak/purchase giả.

AccountDetailScreen có profile edit/name/locale/body style; device timezone thật, English chỉ DEV partial preview. `persistProfile` kiểm initiating account/session generation, upsert profiles rồi sync cosmetic Auth locale; UI continuation chặn late response. Body style onChange hiện update state ngay cả trước Save, giữ nguyên behavior, không tự sửa semantics Hủy.

Privacy/memory/notification actions gọi `changeConsent`: pending guard, initiating identity/continuation và account-bound client, version/purpose, RPC record_my_consent; finally/error giữ nguyên. Notification/marketing **saved preference thực có**, dù scheduling/push/email reminder chưa mở. Teacher sharing không thể grant mới khi chưa lớp, có thể revoke existing true; không giấu lối revoke. Memory là session pace thật có điều kiện và capability observer, không inference mới. Security chỉ mở other-account login, không update-email API. Access có free library, paid chưa mở. Help/search/articles có thật, không gửi support ticket/export/delete. Không tạo contact/mailto hay button giả request thành công.

Auth hydration có loading/error và account-reset source; signedIn/defaultfalse không chứng minh consent đã đọc. Không thêm derived consent status cards hoặc badge “đã đồng bộ” từ default flags. Preserve loading/error content và actionable Profile controls; không gán backendError thành signout error hoặc tự thêm refresh/network call.

## Concrete hierarchy / R1 scope

1. Hero gọn rõ guest/account; guest account CTA tùy chọn, không ép login/consent. Signed-in hiện actual name/email theo source. Current lead nói “Email đã xác minh” chỉ từ signedIn trong Profile, không có confirmedflag riêng ở consumer này: cho phép copy hẹp bỏ claim đó, không thêm verifiedbadge hoặc sửa Auth hydration. Không invented stats/status.
2. Nhóm **Hồ sơ và dữ liệu**: Thông tin cá nhân, Quyền riêng tư và đồng ý, AI và điều được nhớ. Privacy trực tiếp/revocation không qua marketing hoặc disclosure capability; labels không khuyến dụ grant.
3. Nhóm **Tài khoản và hướng dẫn**: Bảo mật tài khoản và Hướng dẫn đang có. Signout dễ thấy/đến bằng keyboard, error visible, disabled/signingOut label còn nguyên; không nhất thiết dominate trên settings.
4. Nhóm/disclosure thứ yếu có tên rõ về **Tính năng và trạng thái hiện có**: notifications (lưu preference, chưa scheduling), content access (free có/paid chưa), sharing (chưa lớp; mọi explanatory route còn tới được). Export/delete giữ đường Help cùng limitation rõ, không render như dịch vụ request đang hoạt động. Không gom Help có thật thành unavailable toàn bộ. Nếu disclosure dùng native details/summary, kiểm keyboard/expanded state/reflow, không auto-expand do network hay thay persistence.

**R1 chỉ khi handlers/routes/permission/network contracts giữ bytewise.** Allowed: ProfileScreen return JSX/copy hẹp, `.mcy-account-home` selectors scoped, focused tests. Nếu actual Tab bị bottomnav che, có thể thêm Profile-owned MobileScroll rootclass trong return JSX và scope scrollpadding đúng child mobile-scroll, đo trước/sau; không sharedruntime/ancestor selector từ retained route. Không đổi AccountRow shared component, AccountDetailScreen, callbacks/onClick payloads, state/effects/routes/consent/Auth/backend/runtime/assets/i18n toàn app. Có thể reorder cùng event JSX; signOut implementation và rememberedPacegate giữ byte-for-byte. Nếu cần sửa shared class/helper hoặc newstatus logic phải addendum trước và phân loại lại. Permission/Auth/consent logic hoặc policy/copy scope đổi→R3 stop; persistent/API change→R2 stop.

## Impact và test map

| Entry/dependency → consumer | Preserve/impact | Check expected / gap |
|---|---|---|
| BottomNav→Profile guest/account | New hierarchy, every prior route reachable, authCTA payload unchanged | Focused guest/synthetic signed-in, long name/email, group/disclosure, back; opening/collapsing zero write/email/AI request |
| Guest CTA / security action | Existing auth route, no automatic send | Open auth screen only; no OTP/email call until untested explicit send; exact authMode/return destination |
| Signout button→existing handler | Disabled/error/pending accessible | Mock SDK logout delay/error/success only; no real Auth mutation; original handler has no new session guard added here |
| Hydration/account switch→Profile | No false consent/sync badge, stale actor UI not promoted | Synthetic loading/error/A→B; preserve clearAccountScopedState and existing negative late-response cases; no new writes |
| Edit/locale/body style route | Working form and existing save semantics unaffected | Mapped timezone/DEV English preview; mocked profile success/error/cosmetic locale; delayed A→B/A→B→A guards; keyboard form/cancel/readback under existing semantics |
| Privacy/memory/notifications/sharing | Existing independent purpose/version/disabled/revoke semantics | Synthetic wellbeing off/on, consent pending/error, existing sharing true can still access revoke; no dark patterns/default grant; exact handlers bytewise |
| Access/Help/export | Truthful free/paid/scheduling/support scope | Existing access/help/search/article/no-results; all9 original destinations reachable, export still Help/no request claimed, no fake About/contact |
| CSS/retained FlowStack | Scoped only active Profile surface | 320×568,360×640,390×844,844×390,desktop,iPhone/Pixel,actual28px+long identity/VI; actualTab tới lastrow/full focused rect trên BottomNav; leave→Home/CourseDetail/Reflection no style leak |
| Shared Prototype previous steps | Preserve4.1–4.5 and save/Journey/route guards | ux-home,ux-checkin-layout,ux-energy-time,ux-course-detail,ux-reflection,ux-save-feedback,ux-journey-selection; relevant learner-write-review delayed/retry/account/leave-route selection |
| Runtime/build/contracts | No lock/backend/catalog change | runtime28/catalogue0/typecheck/build/Sites prep/bundle scanner/Sites+environment isolation, exact commands/exit/cwd recorded |

Focused tests `tests/ux-profile.spec.ts` new; map learner-ux titles account free-v-paid, actual timezone/partial locale, help AI-off/privacy/memory; existing ux-save-feedback security+notification no scheduling. Account/profile/consent mocked writes only to `.invalid` fake router; no actual accounts or probes. Local proxy/CSP denies real outbound and tests fail on unexpected external requests. No env-file/live helpers. Screenshot-writing mapped tests run evidence cwd mới, không ghi historical artifacts.

Do not arbitrary full suite; broaden only for actual diff/failure/dependency gap. No 4.6 checks PASS until process exit/assert outcome. Fail-fast validators use assert/node or ErrorActionPreferenceStop with missing-file/hash mismatch throws; app-relative paths resolve candidate, named harness paths root; exact manifest filename/schema checked. Preserve failed initial/rerun receipts; one focused rerun không thay whole gate cần thiết.

## Gates, residuals, rollback

Before app creation: independent intake QC→root đọc/GO. After implementation: bounded checks→source/evidence freeze→independent appQC→root direct final pins/pixels/flow→user handoff. Source/test/config change sau freeze requires newfreeze/affected rechecks/review. Final docsQC/receipt riêng, no circular selfhash.

Prior4.5 local132case executions/bảy commands là historical; không nhận thành4.6PASS. ExistingP3 RegionEditor ~8px focus clip và rejected falsePASS root pin record4.5 giữ nguyên, không sửa shared runtime để xử lý ở4.6. Physical/native/screenreader/OSkeyboard/liveAuth/realvideo/expert-rights/release missing. Former control PyYAML gap N/A new appgate khi không skillchange. Guidance không remote enforcement/zero guarantee.

Acceptance: working settings/privacy/help dễ tìm, unsupported capabilities truthful/lower priority, every9 destination reachable, account/signout/error/keyboard semantics giữ, no new request/state/permission, mapped tests/gatesexit0, independentQC và rootfinal đạt. STOP mismatch/unexpected write/file/scope/newclinical or permission change/P1P2/missing finalQC. Rollback không tích hợp4.6, giữ approved4.5, không chạm data/APK/deploy. NativeHALTED/webBLOCKED_NO_UPLOAD_OR_ALIAS; no cloud/email/SQL/Auth/livegrant/AI/media/native/build-install/deploy. **WAITING_USER trước4.7.**
