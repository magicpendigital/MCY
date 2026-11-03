# Bàn giao implementer — 4.4 CourseDetail

**Trạng thái hiện tại: implementation và kiểm local PASS; bàn giao cuối cho Owner còn BLOCKED chờ QC độc lập và root final. STOP trước 4.5.** Bản này cập nhật trạng thái thực thi, supersede các trường PRE_IMPLEMENTATION/AWAITING_INTAKE_QC trong [kế hoạch](PLAN-CONSOLIDATED.vi.md), [intake](TASK-INTAKE.vi.md) và checkpoint [EXECUTION](EXECUTION.vi.md) chỉ về tiến độ hiện tại; các tài liệu đã frozen được giữ nguyên là lịch sử. Không thay phê duyệt nội dung, native hay release.

Candidate: `D:\Projects\MCY\.vercel\ux-step4-4-20261017`; baseline duyệt 4.3 giữ nguyên. Preview root kiểm local: `http://127.0.0.1:4192/?mode=web`, session `26713`, cấu hình `.invalid`; response CSP chặn external frames/network/media. Click Phát kiểm DOM/scroll/focus, không phải phát YouTube thật. Test dùng cổng 4207, YouTube fixture và unavailable loopback proxy. Không cài/khởi chạy native, gọi live/Auth/health/AI, sinh media hay deploy.

## Điều đã thay đổi

- Thông tin nhóm video gọn: tên hiện có, số bài/kênh, mô tả thật trong “Về nhóm video này”. Eyebrow ghi “VIDEO MIỄN PHÍ · YOUTUBE”; không biến 38 clip thành khóa đã duyệt mục tiêu/chuyên môn.
- Bài đang chọn gom loại VIDEO, thời lượng, vị trí, tiêu đề và một nút Phát thật trong cùng vùng quyết định. Lời nhắc tự chọn biên độ/dừng khi đau tăng hoặc không an toàn giữ nguyên và hiển thị trước Phát. Không lặp tiêu đề bài lớn trong poster.
- Source/Google privacy luôn có trước Phát; disclosure phụ đề hiển thị uncertainty và mở đầy đủ bằng Tab/Enter. Ba nhánh unverified / verified không liệt kê VI / verified có VI phân biệt đúng; không suy ngôn ngữ audio từ UI.
- Explicit Play cuộn tức thời MobileScroll hiện tại đến khung media, đặt focus có tên ở khung (preventScroll), để Tab tiếp tục đến iframe/trợ giúp/điều hướng/cảm nhận. [Addendum trước sửa](INTAKE-ADDENDUM.vi.md) ghi tác động và kiểm liên quan. Không cuộn mới khi entry/selection/back.
- Giữ 9:16/16:9, kích thước trước/sau Phát, cùng iframe JSX/src/allow và guard visibility, manual selection/first/last, reset khi rời route, timer12s/reload/fallback, CTA tự xác nhận thực hành. Không xem hết/đổi bài/phát tự ghi progress, completion hay health.

App diff chỉ `src/courses/CourseDetailScreen.tsx` và course-detail CSS; test cũ đổi expectation geometry đúng bố cục mới và kiểm full caption qua disclosure, không bỏ privacy/crop/request/lifecycle assertions. Thêm `tests/ux-course-detail.spec.ts`. Prototype/Discover/catalogue/i18n/backend/runtime/lock/dependencies/media giữ nguyên.

## Bằng chứng và nguồn đóng băng

[SOURCE-FREEZE.json](SOURCE-FREEZE.json) SHA256 `f11a6af114f42427cd6d758f5ac191d0af65324d5018e82524adf913fde7e243`: 234 app inputs, 16 harness/config/intake inputs; các pending fields là snapshot lúc freeze. [APP-EVIDENCE-FREEZE.json](APP-EVIDENCE-FREEZE.json) SHA256 `ea5e3fd5bd8f2efb7270d97c74058c909251f47d7f9857b770f0384d8f1455d6`: kết quả cuối, patch, screenshot và 59 build files. Finalizer exit0 trực tiếp rehash mọi pin; 233 input của 4.3 và 228 input root hiện có không đổi. Pre-render logic tương đương khi loại riêng focus ref/hook mới; iframe JSX byte-equivalent.

| Phạm vi | Lệnh thực chạy | Kết quả và evidence |
|---|---|---|
| Baseline | `node analyse/ux-step4-4-2026-10-17/run-checks.mjs` | PASS, 7 command exit0: runtime28, reviewed catalogue0, tsc, Vite build với envDir `.invalid`, Sites prep, bundle scanner23, Sites4 + isolation1. [checks](checks.json), các `.log` được pin. Đây là các bước tương đương build script, không tuyên bố đã chạy `npm run build` nguyên lệnh. |
| 4.4 tập trung | `node analyse/ux-step4-4-2026-10-17/run-ui.mjs focused` | PASS15/15 exit0; [command](focused-command.json), [results](focused-results.json). 320/360/390/landscape/desktop/iPhone/Pixel, reduced motion, actual Tab sau Phát/reload đến recovery/next/reflection, text28 VI/EN, first/last ba nhóm, route return/no autoplay/no account write,16:9 fixture và caption metadata fixtures. |
| Existing course regression | `node analyse/ux-step4-4-2026-10-17/run-ui.mjs mapped` | PASS11/11 exit0; [command](mapped-command.json), [results](mapped-results.json). Catalogue38, guest retention/lazy chunks, honest guidance, EN loop, responsive geometry, inert/focus, retry/fallback/timeout và short portrait/reflection. Chọn title rõ, không tuyên bố cả learner-ux suite PASS. |
| Adjacent 4.1–4.3/save/Journey | `node analyse/ux-step4-4-2026-10-17/run-ui.mjs adjacent` | PASS69/69 exit0; [command](adjacent-command.json), [results](adjacent-results.json). Năm file được map trong intake; cwd riêng `adjacent-run` giữ screenshot của 4.1–4.3 cũ nguyên vẹn. |

Không flaky/skipped/unexpected trong ba runner cuối. Tổng selected UI fixtures95/95; không phải full application suite. Các ảnh final-/playing-/text28- được pin trong evidence; implementer đã xem final320, player320 và text28 VI, root đã xem early320/390/desktop trước test cuối. Root final pixels/thao tác chưa được implementer tự nhận PASS.

## Lỗi trung gian và giới hạn

`initial-focused-failure` giữ 11/13 exit1 (focus geometry, selector không scope route chuyển cảnh); `second-focused-failure` giữ12/13 exit1 (Tab sau nút Phát bị tháo). Scroll padding/margin scoped, focus khung có tên và test chờ reload frame-loaded xử lý điểm đó; final15/15 là nguồn mới. Không gọi các lượt lỗi là PASS. Lỗi sandbox mkdir candidate/fixture ban đầu được giải quyết bằng cùng bounded command có escalation; không phải lỗi app. Một PowerShell read với brace glob lỗi parser chỉ là diagnostic command, không thuộc acceptance. Vite vẫn cảnh báo chunk >500kB; không đổi bundling vượt scope.

QC guard ban đầu của reviewer trỏ `manifest.changed` về root sau khi đã kiểm appInputs đúng, nên báo mismatch với 4.3/root. Root và worker trực tiếp xác nhận hash candidate `62d64469…6826b5e6` vẫn khớp freeze; reviewer xác nhận lỗi đường dẫn harness, giữ failure và sửa probe riêng. Không có app mutation/refreeze do incident này.

Đây là Edge browser/simulator/fixture evidence; không phải physical Android/iOS, real playback/captions, live actor/SQL hoặc clinical/expert/rights acceptance. Foundation series/photoAI/CMS không tích hợp. Native HALTED/current actor chưa xác minh lại; web BLOCKED_NO_UPLOAD_OR_ALIAS và các cap/trial cũ giữ nguyên.

## Tiếp nhận và phục hồi

Independent app QC đang xử lý bản freeze trên; root sẽ ghi report/verification riêng sau khi trực tiếp đọc pins/diff/results và kiểm artifact cuối. Bản này không cấp verdict thay reviewer/root. Chỉ sau hai bước đó mới bàn giao Owner review4.4; không tự bắt đầu4.5. Rollback local: không tích hợp4.4, tiếp tục baseline4.3, không chạm data/APK/deployment; chưa sửa root app.
