# Phiếu nhận việc 4.4 — CourseDetail

17/10/2026 · Owner: root điều phối; implementer và independent reviewer do root giao sau intake/control QC. **Trạng thái: PRE_IMPLEMENTATION / AWAITING_INTAKE_QC.** Tài liệu này chưa phải chứng nhận QC cuối. Root không tự triển khai app; root kiểm tay và bàn giao sau worker/QC.

Áp dụng [TASK_LIFECYCLE](../../docs/quality/TASK_LIFECYCLE.md), đã đối chiếu các trường trong [intake template](../../docs/quality/TASK_INTAKE.template.md); QC cuối dùng [QC template](../../docs/quality/TASK_QC.template.md). Record mới dùng PASS/FAIL/BLOCKED/NOT_APPLICABLE. **Coordinator intake verdict: BLOCKED trước triển khai app vì intake/control QC chưa hoàn tất**, không phải thiếu phê duyệt user cho phạm vi 4.4 đã giao. Các check 4.4 chưa chạy: BLOCKED, không có PASS mới hoặc failure mới được suy ra từ source read.

Môi trường intake: Windows/PowerShell, `D:\Projects\MCY`, 17/10/2026 Asia/Bangkok. Đã đọc `git status --short --untracked-files=no`: root có nhiều file dirty sẵn thuộc UI/backend/skills/tests/cloud config; không reset hoặc nhận làm thay đổi của task này. Documentation worker chỉ sở hữu các file ở scope bên dưới. Preimage kế hoạch cũ nằm ở `OLD-PLAN.pre-pointer.vi.md`, SHA256 `0b4a368e15a3c32bad29ed79c8ca386c3fb33b6d1be16805564dbd38374b18a2`; thay đổi chỉ là pointer. Không có external effects, chi phí media hoặc live cap mới; mọi kiểm mới chỉ local/fixture. Lịch sử native FAIL/HALTED và thiếu physical/live acceptance được giữ nguyên.

## Yêu cầu và độ rủi ro trước thay đổi

Owner đã duyệt 4.3, yêu cầu đồng bộ kế hoạch với luồng hướng dẫn yoga rồi tiếp tục 4.4, và kiểm quy trình nhận việc/tác động/regression/QC trước bàn giao. Kế hoạch hiện hành: [PLAN-CONSOLIDATED](PLAN-CONSOLIDATED.vi.md). **R1** cho phạm vi trình bày local đã bó hẹp; chạm contract/state/Auth/privacy behavior mới thì dừng và phân loại lại. Nội dung tư thế/quyền quản trị của foundation vẫn là nhánh R3 riêng, không được hưởng clearance R1.

Baseline `.vercel/ux-step4-3-20261016`, chưa tích hợp root. Hash đã đọc lại: Prototype `4301656f5e45197b421a98d63d9da8898a699cbc608449ce51ce909bc0e84bee`, CSS `4a4a251b4ab64b5ea6b94813f24175d36fdbe3161b0a23bd1d5841027a5067a1`; freeze root cung cấp `d29bf12d5f20992139094af4f8a4facb2ca6e9af37b4865a9e9151e33956cd2f`. Không dựa vào AGENTS copy cũ trong candidate để điều hành native.

## Source đã đối chiếu và hành vi đang có

- Root `AGENTS.md`: native HALTED, không khôi phục grant/save, web upload/alias blocked.
- Candidate `src/Prototype.tsx`: lazy CourseDetail/Discover; chọn IDs rồi push; active prop theo FlowStack; reflection chỉ từ callback rõ ràng với baseline hiện có.
- `src/courses/CourseDetailScreen.tsx`: import data động, load/retry, text poster, chọn bài, giới hạn trước/sau, active cleanup, timer 12 giây, player recovery, caption/source/privacy note, reflection tự xác nhận.
- `src/courses/DiscoverScreen.tsx`, `freeCourses.ts`: ba nhóm/38 video, generic description, IDs/media/caption metadata; chưa có objective/reviewer/rights schema.
- `src/prototype.css`: mobile stack, desktop columns, 9:16 và 16:9, short-screen overrides; nguy cơ cascade cần kiểm thật.
- `tests/learner-ux.spec.ts`, `free-courses-contract.spec.ts`, các `ux-*.spec.ts`, `playwright.config.ts`, `package.json`: kiểm hiện hành và môi trường local. Không đọc `.env`.
- Các proposal/handoff foundation được dẫn trong consolidated plan: hai bài/10 ảnh photo mới chỉ preview; không có chuỗi CMS/phát hành đầy đủ.

## Impact và hồi quy cần giữ

| Vùng | Phạm vi / hành vi cần bảo toàn | Kiểm tương ứng |
|---|---|---|
| CourseDetail hierarchy | Tên bài chọn, loại video, thời lượng, mô tả thật và Phát gần nhau; không hứa mục tiêu/chuyên môn chưa có | Test 4.4 adjacency/nội dung + pixels ở màn hẹp/desktop |
| Navigation | Guest mở được thư viện; ba nhóm và first/last, list/prev/next, back còn đúng; giữ lựa chọn check-in | Existing guest/library, VI/EN flow, route-inert/focus tests |
| YouTube boundary | Không iframe/request trước Phát; `autoplay=1` chỉ sau click; đổi bài/rời route tháo iframe, không tự next | New request-count/selection/back cases + existing player cases |
| Privacy/accessibility | Caption uncertainty và source/privacy tiếp cận trước Phát; target/focus/pressed/disabled đúng | Existing disclosure/geometry/focus + kiểm tay keyboard/large text |
| Media/layout | Poster chữ, không ảnh mới; 9:16 nguyên vẹn, không layout shift, không tràn ngang | Existing layout/short portrait + 320/360/390/landscape/desktop |
| Recovery | Loading/frame-loaded không được gọi là xem hết; timeout 12 giây, reload, link gốc chủ động | Existing retry/fallback + timeout |
| Reflection/Journey | Xem/chọn/phát/back không tự hoàn tất hoặc ghi health; chỉ CTA tự xác nhận hiện có nối cảm nhận | Existing reflection path + fixture no-write khi duyệt |
| 4.1–4.3/shared CSS | Home/check-in/time-energy, nháp và Journey giữ đúng bản đã duyệt | ux-home, ux-checkin-layout, ux-energy-time, ux-save-feedback, ux-journey-selection |
| Contracts/operations | Catalog/reviewed practice, runtime/auth/backend/native/admin/AI không đổi | Hash/diff protected scope + runtime/catalog/build/scanner/isolation baseline |

Không thêm storage/analytics/progress, không đổi localization contract, monetization, media assets, seed catalog, CMS, provider hay consent. Blind spot: fixture không chứng minh native playback, remote Auth hay quyền nội dung thực tế.

## Write scope và cách triển khai

App worker chỉ được ghi candidate mới `.vercel/ux-step4-4-20261017`: `src/courses/CourseDetailScreen.tsx`, các selector course-detail scoped trong `src/prototype.css`, test 4.4 riêng và chỉnh expectation cũ chỉ khi layout yêu cầu đã được giải thích. Không giảm assertion privacy/crop/state để lấy PASS. Không sửa runtime lock/checker/dependency hoặc copy `.env`/credentials/account state. Các file khác muốn đổi cần intake bổ sung trước.

Documentation worker sở hữu hai tài liệu này, preimage/hash và pointer ngắn ở kế hoạch cũ. Không sửa receipts/manifest 4.3/native/web đã frozen. Root source giữ nguyên. Independent QC chỉ đọc app/diff/check evidence và ghi báo cáo riêng theo phạm vi root giao.

## Validation trước bàn giao

1. Sau intake/control QC mới tạo app candidate từ đúng baseline; pin protected files và ghi changed-file inventory.
2. Implementer kiểm TypeScript/build và test 4.4 tập trung. Dùng `.invalid`/fixture, chặn real Supabase/YouTube; test player tải bằng response giả.
3. Mapped regression: `free-courses-contract.spec.ts`; các case trong `learner-ux.spec.ts` về guest browse, lazy course chunks, honest guidance, VI/EN flow, responsive course layout, inert/focus, player retry/fallback/timeout, short portrait/reflection. Chọn bằng title/grep rõ trong evidence; không tuyên bố cả file/suite PASS nếu chỉ chọn case.
4. Regression 4.1–4.3 và phần lưu/Journey: năm file ux nêu trong bảng. Baseline checks theo package scripts: `check:runtime`, `check:practice-catalog`, `build` (gồm tsc/Vite/Sites preparation), `check:bundle-secrets`; Sites worker và Playwright environment/isolation phù hợp runtime thay đổi. Runtime kỳ vọng 28 file và reviewed catalog rỗng. Lệnh/channels/port thật và exit code ghi khi chạy, không điền PASS trước.
5. Broader suite chỉ khi diff/failure hoặc review cho thấy phụ thuộc chưa được bao phủ; ghi lý do. Không chạy test live/ACL helper có env-file.
6. Independent QC xem final diff/hashes, tính đúng và evidence; P1/P2 phải đóng và kiểm lại phạm vi liên quan. Root sau đó kiểm pixels/thao tác artifact cuối: 320×568, 360×640, 390×844, landscape, desktop, long title, keyboard/focus/text lớn, trước/sau Phát, đổi bài, back/reopen, recovery và CTA reflection.

## Acceptance, handoff và rollback

PASS 4.4 khi quyết định Phát có đủ danh tính video/thời lượng/loại và source/privacy, media nguyên khung, selection/navigation/recovery/reflection không hồi quy, không thêm write/capability, checks được ánh xạ có bằng chứng, independent QC đạt và root kiểm tay đạt. Không coi local/browser fixture là native/clinical/rights/release acceptance.

STOP nếu source pin sai, unexpected file thay đổi, external request thật, xuất hiện contract mới, test critical fail, P1/P2 mở hoặc QC final chưa xong. Sau chỉnh source phải cập nhật hashes và rerun checks/review bị ảnh hưởng; không bàn giao bằng evidence cũ. Rollback: không tích hợp 4.4, dùng baseline 4.3; không chạm dữ liệu/APK/deployment. Handoff bắt buộc có scope, final hashes/diff, tests + giới hạn, review, root manual evidence, risks và **STOP trước 4.5 chờ Owner**.
