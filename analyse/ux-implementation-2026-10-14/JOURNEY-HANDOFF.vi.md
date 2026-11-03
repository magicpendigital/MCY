# Handoff Journey UI — 14/10/2026

Candidate: `D:\Projects\MCY\.vercel\ux-implementation-20261014`. Chỉ agent Journey chỉnh `src/JourneyScreen.tsx`, thêm phần Journey cuối `src/prototype.css`, và tạo `tests/ux-journey-selection.spec.ts`. Không chỉnh app root, i18n, runtime, RPC, backend, native hay packet frozen. Đã dùng `mcy-change-review` + `mcy-brand-ux`, đọc AGENTS, plan, source audit, brand/design/tokens. Mức riêng Journey R1: UI trong hợp đồng hiện có; root giữ mức cao nhất cho toàn candidate và review độc lập.

## Hành vi đã triển khai

- Chưa có lựa chọn chủ động: chọn snapshot mới nhất theo date/time khi data đầu tiên/đợt hydrate tới; không còn selectedId=null làm một ngày có bản ghi hiển thị trống.
- Chọn ngày có dữ liệu sẽ giữ ID bản cuối hiện có của ngày đó. Chọn record trong nhiều bản/ngày hoặc trend cũng giữ đúng ID qua cập nhật. Chọn ngày thật sự trống giữ ngày đó; nếu ngày ấy nhận dữ liệu sau, hiển thị bản cuối của chính ngày đó. Nút Bản gần nhất chọn lại bản mới nhất hiện có.
- State lựa chọn, compare, detail/editor/delete sheets được remount theo `signedIn:userId` khi đổi tài khoản/sign-out. Đây là reset UI local; source hydration/actor guards của parent vẫn chịu trách nhiệm dữ liệu thuộc actor nào.
- Loading + no snapshots: một status tải; error + no snapshots: một alert chưa tải được. Không kết luận empty từ read đang chờ/lỗi. Có snapshots cũ khi loading/error vẫn xem được chúng với notice.
- Lịch sử thực sự 0 bản: title, một empty state, CTA hiện có dẫn check-in và chú thích honest gaps; không timeline, empty snapshot card, compare hoặc trend trống.
- Các labels tài khoản/trong phiên, map + danh sách chữ, nhiều bản/ngày, compare contract, outcomes, notes, deletion/persistence giữ nguyên. Source hiện tại không có sample-history affordance/schema; không thêm fixture mẫu vào ứng dụng, không gán sample thành observed user outcomes. Fixture riêng kiểm session label và outcome khó chịu hơn.
- CSS chỉ 3 rule mới: pending-read notice 14px/1.5; empty heading24px; empty body15px/1.5, dùng semantic colors. Root có thể tiếp tục sửa typography/CSS sau handoff này.

## Kiểm chứng

- `node D:/Projects/MCY/node_modules/typescript/bin/tsc --noEmit`, cwd candidate: **PASS exit0**, cả lần đầu và sau final selection edit.
- Final focused command: env `MOBILE_RUNTIME_TEST_PORT=4188`, `MCY_PLAYWRIGHT_CHANNEL=msedge`, `MCY_PLAYWRIGHT_VITE_CONFIG_LOADER=runner`; `node D:/Projects/MCY/node_modules/@playwright/test/cli.js test tests/ux-journey-selection.spec.ts --workers=1 --max-failures=1`: **10/10 PASS, 35.7s, exit0**.
- Fixture mounts real Journey + MobileRuntime with synthetic state via test-only browser evaluate, map/style/editor stubs; outbound HTTPS routes abort. VI iPhone + EN/blank date Pixel simulator checked. Cases: late hydrate one/two same/different-day records, explicit record preservation, explicit date preservation, blank date, Latest, actor reset+compare reset, VI/EN empty CTA+error, session label+worse outcome.
- Initial ordinary sandbox invocation: **8 browser-launch failures, exit1**, `Target page/context/browser closed`, Crashpad pipe and Edge temp site-list replace errors; no app acceptance. Escalated mock-only local browser runs were approved and used thereafter.
- Intermediate harness failures: duplicated React URL (invalid hook call) corrected by resolving Vite revisioned React URL from transformed main; expected casing and innerText/textContent whitespace corrected to current app labels. Final assertions remained meaningful; app behavior was not weakened for tests.
- Candidate inherits dependencies from root node_modules; Vite font serving allowlist logged blocked parent Roboto files. Final selection cases still PASS, but **font/visual QA not established by this run**. Root has been notified and owns candidate dependency/preview setup.

## Phạm vi còn mở

Root chạy final build/runtime/scanner/Sites/isolation and selected existing flow regressions, independent review, screenshot/reflow/320px/mobile-web/focus/reader checks after its typography edits. No full suite by this worker. Physical Android/iOS, live Auth/health, deletion acceptance, staging, hosting protection/deploy, clinical/content/rights: CHƯA CHẠY. Native closed FAIL/cap0 và approval/release gates không được đóng bằng local fixtures.

Rollback: lấy lại Journey/CSS từ candidate baseline; root checkout chưa tích hợp. Không có data rollback hay cloud effect.

## Final Journey file hashes (trước root typography edits)

- `src/JourneyScreen.tsx`: SHA256 `76e084a037e452ce188aa194b2355ed4503d0500e0853aa33b0278e37b7a8523`
- `src/prototype.css`: SHA256 `8ab5985fccf027d68f45f1315bc62d07172b6c0b806a1ec13563af06a91a5442`
- `tests/ux-journey-selection.spec.ts`: SHA256 `a54c416185280a76eb3be4a58bd51fa055ede0ae61772792cd8e498704e9c84a`
