# Sổ sự cố đã biết và ngưỡng tương thích (MCY)

**Bắt buộc đọc trước khi thêm, sửa hoặc nâng cấp bất kỳ tính năng nào.** Agent phải đối chiếu thay đổi của mình với sổ này, ghi rõ trong ghi chú bàn giao mục nào áp dụng và đã kiểm bằng cách nào. Khi xảy ra sự cố nghiêm trọng mới, thêm một mục ngay trong cùng thay đổi sửa nó; không xoá mục cũ, chỉ đánh dấu đã đóng kèm bằng chứng.

Tài liệu này là hướng dẫn làm việc, không phải cơ chế cưỡng chế. Chỉ các kiểm tra tự động nằm trong CI mới tự chặn được lỗi; mục "Trạng thái phòng ngừa" của từng sự cố nói rõ cái nào đã có, cái nào mới là đề xuất.

## 1. Ngưỡng trình duyệt hỗ trợ (đề xuất, chờ Owner chốt)

| Nền tảng | Ngưỡng tối thiểu đề xuất | Ghi chú |
|---|---|---|
| iOS Safari / WKWebView | **iOS 15.0** (WebKit 612) | Thiết bị Owner ghi nhận lỗi: iOS 15.x. Chưa rõ bản phụ (15.0–15.8); bản phụ quyết định một số lỗi dưới đây. |
| Android WebView / Chrome | Android 7 / Chrome 80+ (`minSdk 24`) | Đã có trong cấu hình Gradle. |
| Chrome, Edge, Firefox desktop | 2 năm gần nhất | Playwright chạy trên Edge. |

Quy tắc: tính năng mới **không được làm sập** màn hình hoặc cả ứng dụng trên ngưỡng tối thiểu. Phần trang trí (đổ bóng, độ mờ, bố cục phụ) được phép kém đi, nhưng chữ phải đọc được, nút phải bấm được và không có màn trắng. Nếu một tính năng thật sự cần API mới hơn, phải có phương án thay thế hoặc thông báo rõ ràng cho người dùng, và ghi vào sổ này.

## 2. Phiên bản tối thiểu của tính năng web hay gặp (đã kiểm với dữ liệu tương thích công khai, cần kiểm lại khi dùng)

| Tính năng | Safari tối thiểu | Hậu quả trên iOS cũ hơn |
|---|---|---|
| Regex lookbehind `(?<=…)` `(?<!…)` | **16.4** | `SyntaxError` khi nạp **cả tệp JS** chứa nó: mọi thứ trong tệp đó không chạy |
| `AbortSignal.timeout()` | 16.0 | `TypeError` khi gọi |
| `crypto.randomUUID()` | 15.4 | `TypeError` khi gọi |
| `Array.prototype.at()` | 15.4 | `TypeError` khi gọi |
| `Object.hasOwn`, `structuredClone`, `findLast` | 15.4 | `TypeError` khi gọi |
| Thuộc tính HTML `inert` | 15.5 | Bị bỏ qua: màn hình phía sau vẫn tương tác được |
| CSS `dvh` `svh` `lvh` | 15.4 | Cả khai báo bị bỏ: chiều cao/padding mất |
| CSS `:has()` | 15.4 | Cả quy tắc bị bỏ |
| CSS `@container`, `container-type` | 16.0 | Cả khối bị bỏ |
| `Intl.Segmenter`, regex cờ `v`, class static block | 16.4 / 17 / 16.1 | Lỗi cú pháp hoặc thiếu API |

Vite 8 mặc định nhắm tới trình duyệt `baseline-widely-available` (Safari 16.4 trở lên): nó **không hạ cấp cú pháp** cho Safari 15 và không bao giờ polyfill API. Điều này đã được xác nhận trong mã nguồn Vite của repo.

## 3. Sổ sự cố

### INC-001 — Màn hình lỗi trên iPhone iOS cũ (iOS 15.x), tái diễn nhiều lần

- **Phát hiện:** Owner báo trên iPhone iOS 15.x, bản web mobile hiển thị lỗi. Đã từng xảy ra và quay lại sau mỗi đợt thêm tính năng. Chưa tái hiện trên thiết bị iOS 15 thật, nguyên nhân dưới đây suy ra từ mã nguồn, cấu hình build và bản dựng; xem mục "Việc cần xác nhận".
- **Nguyên nhân gốc hệ thống:** không có ngưỡng trình duyệt nào được ghi thành quy tắc, không có `build.target`, không có kiểm tra tương thích tự động, và bộ kiểm thử chạy trên Chromium/Edge hiện đại. Mỗi tính năng mới tự do dùng cú pháp/API mới; lỗi chỉ lộ trên thiết bị cũ.
- **Các điểm vi phạm hiện có (đọc từ commit `e8816fc`, ngày xuất hiện lấy từ lịch sử git):**

| # | Điểm | Vị trí | Xuất hiện | Ảnh hưởng iOS 15 |
|---|---|---|---|---|
| 1 | **Regex lookbehind** `/(?<!\p{L})(cổ\|vai)(?!\p{L})/iu` | `src/courses/lessonFinder.ts:21..` | 2026-10-27 | `SyntaxError` làm hỏng cả chunk `lessonFinder`. Chunk này được nạp bởi **Khám phá**, **Chi tiết khoá học** và khối bài học ở Trang chủ, tức luồng khách "Trải nghiệm thử → Tìm bài học ngắn" và toàn bộ xem bài học video. Đây là nghi phạm chính của "lỗi hiển thị". Ảnh hưởng mọi iOS dưới 16.4. |
| 2 | `AbortSignal.timeout(2500)` | `src/backend/authEmailMetadata.ts:11` | 2026-10-03 | `TypeError` trên iOS dưới 16; nằm trong `try/catch` nên chỉ bỏ qua đồng bộ ngôn ngữ email, không chặn đăng nhập (mức ảnh hưởng thấp). |
| 3 | `crypto.randomUUID()` | `Prototype.tsx` (3), `consentPersistence.ts`, `PracticeFlowScreen.tsx`, `TeacherCollaborationPanel.tsx` | 2026-09-26 | `TypeError` khi lưu check-in, ghi đồng ý, bắt đầu buổi thực hành (iOS dưới 15.4). |
| 4 | `.at(-1)` | `JourneyScreen.tsx` (3), `Prototype.tsx` (2), `staff/teacher.tsx` | 2026-09-26 trở đi | `TypeError` trong Hành trình và khi nạp lịch sử (iOS dưới 15.4). |
| 5 | `inert` trên màn hình không ở trên cùng | `src/mobile/FlowStack.tsx:204` | 2026-10-23 | iOS dưới 15.5 bỏ qua; vẫn có `aria-hidden` nhưng không chặn tương tác. File này thuộc runtime được bảo vệ. |
| 6 | `100dvh`, `svh`, `:has()`, `@container` | `src/styles.css:79,301,310`, `prototype.css` (nhiều chỗ) | 2026-09-26 trở đi | Một số khai báo/quy tắc bị bỏ trên iOS dưới 15.4/16.0: mất padding đầu trang chào, footer trong suốt, mũi tên cuộn. Chủ yếu mất trang trí, vài chỗ mất chiều cao. |

- **Trạng thái phòng ngừa (2026-11-03, Owner chọn "sửa mã + kiểm tra CI + build target"; mã nằm trong cây làm việc, chưa phát hành):**
  1. **Đã làm:** regex lookbehind ở `lessonFinder.ts` viết lại không dùng lookbehind; `crypto.randomUUID`, `.at(-1)`, `AbortSignal.timeout` đổi sang lớp bao `src/compat` (`newId`, `lastOf`, `timeoutSignal`) ở mọi điểm trong `src/`.
  2. **Đã làm:** `build.target = chrome87/edge88/firefox78/safari15` trong `vite.config.ts` (Owner cho phép; khoá `mobile-runtime.lock.json` đã làm mới, chỉ đổi mã băm của tệp này). **Đã kiểm thực tế: bản dựng không báo lỗi khi gặp regex lookbehind**, nó chỉ đi qua nguyên vẹn; `build.target` chỉ hạ cấp cú pháp ES mới, không thay được kiểm tra tĩnh dưới đây và không polyfill API.
  3. **Đã làm:** `tests/browser-compat.test.mjs` (`npm run test:browser-compat`, chạy trong CI sau bước build): chặn lookbehind, `static {`, các API ở bảng mục 2 dùng ngoài `src/compat`, và bản dựng `dist` có lookbehind; khoá "ngân sách" CSS mới (dvh/svh, `:has`, `@container`, `color-mix`, `@layer`…) chỉ được giảm. Đã thử đột biến: thêm `.at(-1)`, lookbehind, `randomUUID` thì test thất bại.
  4. **Đã làm:** `RouteBoundary` (`src/compat/RouteBoundary.tsx`) bao các route tải lười: chunk lỗi hoặc lỗi render hiện thông báo kèm nút "Tải lại ứng dụng" thay vì màn trắng; `index.html` có đoạn ES5 hiện thông báo nếu sau 10 giây ứng dụng chưa vẽ gì.
  5. **Chưa làm / không thể làm ở đây:** (a) `inert` ở `FlowStack.tsx` (tệp runtime được bảo vệ; trên iOS dưới 15.5 màn hình phía sau vẫn tương tác được, cần Owner cho phép sửa tệp runtime nếu muốn xử lý); (b) CSS `dvh/svh/:has/@container` còn nguyên, chỉ bị khoá không tăng thêm; (c) **kiểm tra trên iPhone iOS 15 thật hoặc dịch vụ đám mây có iOS 15: CHƯA CHẠY.** Playwright WebKit/Edge trên máy này không chứng minh được iOS 15. Mỗi đợt phát hành (`mcy-release-sync`) phải ghi kết quả bước này.
- **Việc cần xác nhận:** bản phụ chính xác của iPhone (Cài đặt → Cài đặt chung → Giới thiệu), màn hình nào lỗi (trắng hoàn toàn, mất phần Khám phá, không đăng nhập được, hay chỉ sai bố cục). Điều này cho biết điểm nào trong bảng là nguyên nhân thực tế.

### INC-002 — Lưu cấu hình Owner kẹt vòng lặp thử lại 40001 trên PostgREST
- Hàm lưu cấu hình AI của Owner dùng SQLSTATE `40001` cho xung đột phiên bản nghiệp vụ; PostgREST 14.5 tự thử lại vô hạn, ghi hàng chục nghìn lỗi và giữ kết nối. Đã cắt kết nối có mục tiêu (2026-10-08), sửa bằng `PT409` (migration `20261007174155`).
- **Quy tắc:** lỗi nghiệp vụ không bao giờ dùng `40001`/`40P01`; xung đột dùng `PT409`. Không lặp lại thử nghiệm phiên bản cũ khi chưa đọc lại mã lỗi đang triển khai. Chi tiết trong `AGENTS.md` (mục "Real AI and Owner controls").

### INC-003 — Khôi phục phiên đăng nhập trên Android sau Recent/icon
- Mở lại ứng dụng qua Recent/icon đôi khi đưa về màn Chào với nút đăng nhập dù phiên còn lưu; cũng một lần script `force-stop`/`shell launch` làm trắng màn hình. Nguyên nhân gốc chưa chứng minh; đã giảm nhẹ bằng thử lại có giới hạn và thẻ "phiên vẫn được giữ".
- **Quy tắc:** không dùng `force-stop`, shell launch, xoá dữ liệu hay cài lại để lấy bằng chứng khôi phục phiên; dùng quan sát người dùng qua Recent/icon.

### INC-004 — Hạ tầng thử nghiệm trên Windows
- `node_modules/.vite-temp` và `dist/client/assets` có thể báo `EPERM` trong sandbox; máy chủ Vite lồng nhau sống sót sau khi Playwright dừng. Máy chủ phải khởi tạo trong `scripts/playwright-global-setup.mjs` với `server.close()` rõ ràng.
- **Quy tắc:** không thay bằng tiến trình con không quản lý; khởi động nguội có thể làm `page.goto` chậm, chạy lại với `--timeout=60000` trước khi kết luận lỗi.

### INC-005 — iOS phóng to khi lấy tiêu điểm ô ghi chú
- Textarea 12px làm iOS tự phóng to. Đã đổi sang 16px; chưa kiểm trên iOS thật.
- **Quy tắc:** mọi ô nhập tối thiểu 16px; giữ phóng to bằng cử chỉ của trình duyệt.

## 4. Danh sách kiểm tra tương thích cho mỗi thay đổi giao diện hoặc mã chạy trên client

1. Thay đổi có dùng cú pháp/API/CSS trong bảng mục 2 không? Nếu có: dùng lớp bao/phương án thay thế hoặc ghi ngoại lệ vào sổ này.
2. Có thêm regex mới không? Cấm lookbehind và cờ `v`; kiểm chuỗi Unicode bằng cách khác.
3. Có thêm chunk tải lười mới không? Có `ErrorBoundary` và trạng thái lỗi/thử lại chưa?
4. Một lỗi trong một chunk có thể làm hỏng luồng chính (Chào → Check-in → Khám phá) không? Nếu có, tách hoặc bảo vệ.
5. Khai báo CSS dùng đơn vị/selector mới có khai báo dự phòng ở dòng trước không (`height: 100vh; height: 100dvh;`)?
6. Đã chạy kiểm tra tương thích tự động (khi có) và đã ghi PASS/FAIL/CHƯA CHẠY cho kiểm tra trên iPhone iOS 15 thật chưa?

Ghi vào bàn giao: "Đã đối chiếu `docs/quality/KNOWN_INCIDENTS.md`: áp dụng INC-… ; kiểm bằng …; CHƯA CHẠY: …".
