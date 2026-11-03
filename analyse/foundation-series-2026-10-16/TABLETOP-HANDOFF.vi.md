# Bài 02 — Bò–Mèo với nội dung và năm hình riêng

16/10/2026 · Bản biên tập để Owner đánh giá trước khi tích hợp.

## Mở xem

- [Bài tương tác](http://127.0.0.1:4317/preview.html?lesson=tabletop)
- [Năm hình cạnh nội dung](http://127.0.0.1:4317/review.html#tabletop-v2)
- Nội dung và nguồn: `TABLETOP-LESSON.vi.md`; dữ liệu: `tabletop-lesson.json` / `tabletop-lesson.js`.
- Hình: `assets/tabletop-step-01.png` đến `assets/tabletop-step-05.png`, năm PNG riêng 1536×1024. Tạo bằng built-in imagegen, dùng hình bài đầu làm tham chiếu nhân vật/phong cách. Prompt, đường dẫn và SHA-256 nằm trong `assets/TABLETOP-IMAGES.vi.md`.

## Đã hoàn thiện

Năm bước: chuẩn bị bốn điểm tựa → Bò nhẹ → vị trí giữa → Mèo nhẹ → trở về và kết thúc. Mỗi bước có nội dung chính, xem kỹ, lựa chọn khác, ảnh/alt/chú thích riêng. Bài giới hạn cho người đã có thể tự xuống/rời sàn và chống tay–gối thoải mái; không tự thêm một kỹ thuật chuyển từ đứng xuống sàn hoặc tư thế nghỉ bắt buộc.

Năm hình tĩnh phân biệt các thời điểm; chưa có audio/clip mô tả toàn chuyển động. Khung 05 dùng góc nhìn khác để minh họa điểm dừng, không hướng dẫn xoay người.

Reader dùng cùng cơ chế với bài Đứng. Đã khái quát số bài, lời kết và nút sang bài tiếp theo để bài 02 không mang nhãn/câu kết/nút sang bài của bài 01. Bài 03 giữ là đề cương. Đọc không tạo buổi tập, phút tập, check-in hoặc cảm nhận sức khỏe.

## Kiểm chứng

| Kiểm | Kết quả trong phạm vi bản mẫu |
|---|---|
| Cú pháp | `node --check preview.js`, `tabletop-lesson.js`, `update-tabletop-preview.mjs`, `serve-preview.mjs`: exit0. |
| Dữ liệu | JSON đủ 5 bước/5 đường dẫn riêng, JS khớp JSON; peer review đã kiểm. Helper đồng bộ đã chạy lại thành công sau sửa alt bước2. |
| Hình | Root và agent rà soát đã xem đủ5PNG; trình tự trung tính/Bò/trung tính/Mèo/trung tính và alt/chú thích khớp phần thấy được. Không phải thẩm định kỹ thuật yoga. |
| Đọc từng bước | Browser đi qua đủ5bước và ghi nhận đúng từng đường dẫn ảnh01→05; đúng nhãn Bài02. |
| Phóng to | Bước4: ảnh, alt, tiêu đề và chú thích đúng bước; Escape đóng và trả focus về nút mở. |
| Mục lục/xem lại | Mục lục nhảy về bước2; Previous về bước1 cập nhật ảnh/live region. Chọn “Vị trí giữa” ở màn cuối mở đúng bước3. |
| Kết thúc | Dùng “Bạn đã đến cuối phần đọc”; nút tiếp theo dẫn tới đề cương bài3, không mở lại bài2. |
| Bảo toàn bài1 | Mở lại bài Đứng, nhảy bước5 và mở kết thúc: giữ ảnh/copy/5lựa chọn của bài1. Nút “Xem bài2” mở đúng tổng quan Bò–Mèo. JSON, JS và5PNG của bài Đứng khớp7pin trước sửa. |
| Đọc tiếp | Từ Hôm nay, thẻ đọc tiếp trở về Bò–Mèo bước1 và có nút trở về Hôm nay. |
| 390×844 | Body390px, footer kết thúc y843; hình bước4 hiện đủ trong vùng hình. |
| 320×740 | Body320px, vùng cuộn clientWidth/scrollWidth310px, footer kết thúc y739; nút luôn trong viewport. |
| Trang duyệt | Có5khung; ảnh đầu tải đủ khi tới mục Bài02. Liên kết khung3 mở đúng tiêu đề và ảnh03. Đổi chuyển cuộn anchor sang tức thì để vị trí đọc ổn định. |
| Console | Không có error trong tab preview ở lần kiểm cuối. |
| Rà soát | `TABLETOP-REVIEW.vi.md`: không còn P1/P2 trong phạm vi source/copy/pixels của bản nháp cục bộ. |

Ảnh dùng đối chiếu: `screenshots/25-tabletop-step4-390.jpg`, `27-tabletop-step2-320-verified.jpg`, `29-tabletop-review-verified.jpg`. Ảnh26 bị paint chưa ổn định ngay sau đổi viewport; ảnh28 ở vị trí cuộn không đúng, không dùng làm căn cứ bản cuối. Lần đầu chỉ đổi hash trên tab report cũ không tải lại tài liệu; đã reload để kiểm bản mới. Lazy images ngoài viewport chưa tải không được coi là ảnh lỗi.

## Phạm vi còn mở

Đây là nội dung hướng dẫn thuộc R3 theo matrix MCY nhưng chỉ phục vụ Owner xem trước cục bộ. Thẩm định chuyên gia yoga, quyền/khả năng phát hành, thử người dùng mục tiêu, screen reader thật, chữ200% và Android/iOS chưa được xác nhận. Các nguồn ACE/Mayo/Cleveland/NHS không phê duyệt bài hoặc ảnh MCY.

Không sửa source ứng dụng, không build/cài APK, không thao tác cloud/auth/consent/AI runtime hoặc triển khai. Các trạng thái HALTED và cổng phát hành hiện có giữ nguyên. Bản trước sửa nằm ở `revisions/2026-10-16-before-tabletop/`; tệp `standing-pins.json` lưu baseline bài đầu.

Chạy localhost: `node serve-preview.mjs`. Đồng bộ nội dung: `node update-tabletop-preview.mjs`, sau đó kiểm cú pháp. Máy chủ chỉ nghe127.0.0.1 và chỉ phục vụ các tệp thiết kế cho phép trong thư mục này.
