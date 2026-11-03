# Bài 01 — bản nội dung và năm hình để đánh giá

16/10/2026 · Thay phần đề cương bài 01 trong bản xem trước cục bộ. Đây là bản biên tập để Owner đánh giá trước khi tích hợp.

## Mở xem

- [Tổng quan và đọc từng bước](http://127.0.0.1:4317/preview.html?lesson=standing)
- [Năm hình cạnh nội dung](http://127.0.0.1:4317/review.html#standing-v2)
- Nội dung/nguồn đối chiếu: `STANDING-LESSON.vi.md`; dữ liệu gốc: `standing-lesson.json`; bản JS dùng trực tiếp trong trình duyệt: `standing-lesson.js`.
- Hình: `assets/standing-step-01.png` đến `assets/standing-step-05.png`, năm PNG riêng 1536×1024. Tạo bằng built-in imagegen; prompt, hash và ghi chú pixels nằm ở `assets/STANDING-IMAGES.vi.md`.

## Đã hoàn thiện

1. Chọn chỗ đứng.
2. Nhận biết bàn chân.
3. Thêm điểm tựa khi cần.
4. Đứng nhẹ và thở tự nhiên.
5. Kết thúc theo ý bạn.

Mỗi bước có nội dung chính cụ thể, phần xem kỹ, lựa chọn khác, hình riêng, alt và chú thích riêng. Tổng quan có đối tượng, chuẩn bị và dấu hiệu dừng. Bước 4–5 nhắc rõ việc tiếp tục giữ ghế nếu đang dùng; hình của hai bước này thể hiện lựa chọn không dùng ghế. Hình 3 không tự chứng minh ghế đã áp sát tường: yêu cầu chuẩn bị được nói bằng chữ.

Reader và modal dùng cùng dữ liệu hình của bước hiện tại. Màn cuối có năm lựa chọn mở lại đúng bước. Hoạt động đọc được giữ trong bộ nhớ phiên và không tạo buổi tập, phút tập, check-in hoặc cảm nhận sức khỏe. Hai bài còn lại tiếp tục là đề cương.

## Kiểm chứng sau sửa

| Kiểm | Kết quả và phạm vi |
|---|---|
| Dữ liệu | JSON parse, đủ 5 bước, 5 đường dẫn khác nhau; JSON và JS bằng nhau theo peer review. |
| Cú pháp | `node --check standing-lesson.js`, `preview.js`, `serve-preview.mjs` đều exit 0. |
| Pixels | Root và agent khác đã xem trực tiếp cả 5 ảnh; điều chỉnh alt/chú thích theo phần thực sự thấy được. Không phải duyệt kỹ thuật yoga. |
| Trình duyệt | Đi qua đủ 5 bước; Trước/Tiếp, mở rộng xem kỹ, mục lục nhảy bước 5, xem lại Bàn chân từ màn cuối đều hoạt động. |
| Phóng to | Bước 2 và 5: src/alt của ảnh lớn bằng ảnh đang đọc, tiêu đề/chú thích đúng bước. Escape đóng và focus trở về nút mở ở lần kiểm bước 2. |
| Ngữ cảnh | Đọc tiếp từ Hôm nay mở lại bước 4 và có nút trở về Hôm nay. |
| 320×740 | Sửa chiều cao linh hoạt sau khi thanh công cụ xuống dòng. Bản cuối body 320 px, vùng cuộn không tràn ngang; footer kết thúc ở y=739 trong viewport cao740. |
| 390×844 | Bản cuối body390 px, footer kết thúc y=843; hình bước3 hiện đầy đủ trong vùng hình. |
| Trang trình bày | Có5khung; cả5ảnh tải đủ tại lúc kiểm. Liên kết bước2 mở đúng tiêu đề và ảnh bước2 trong reader. |
| Console | Không có error được ghi nhận trong tab preview ở lần kiểm cuối. |
| Peer review | `STANDING-REVIEW.vi.md`: không còn P1/P2 trong phạm vi nội dung/source của bản xem trước cục bộ. |

Ảnh cuối: `screenshots/23-standing-step3-390-final.jpg`, `22-standing-step4-320-fixed.jpg`, `24-standing-review-desktop.jpg`. Ảnh21 là lần phát hiện chiều cao trước sửa, không dùng để mô tả bản cuối. Bộ trước sửa được giữ tại `revisions/2026-10-16-before-standing/`.

Một lần tạo JS dữ liệu qua lệnh shell bị lỗi quoting trước khi ghi tệp; đã chuyển sang `update-standing-preview.mjs`, chạy thành công. Một locator thử mở summary bằng rolebutton không khớp; locator theo text hiển thị mở được. Đây là lỗi thao tác kiểm, không được tính là app acceptance hay che mất bằng chứng trung gian.

## Phạm vi và giới hạn

Nội dung hướng dẫn được xếp ở mức rủi ro R3 theo matrix MCY; đầu ra lần này chỉ là bản Owner xem xét cục bộ. Chưa có giáo viên/chuyên gia yoga thẩm định bài, hình hoặc khả năng áp dụng cho từng người. Không coi nguồn đối chiếu hay rà soát của AI là phê duyệt chuyên môn. Các cổng thẩm định và phát hành vẫn mở trước khi cung cấp cho người học.

Chưa kiểm screen reader thật, chữ lớn200%, thiết bị Android/iOS hoặc người dùng thật. Không có audio/video mới. Không chạy build/test ứng dụng vì thay đổi chỉ nằm trong bản mẫu độc lập; không thay source ứng dụng, native, cloud, auth/consent, AI runtime hoặc deployment. Các trạng thái HALTED hiện có vẫn được giữ.

Để khôi phục bản trước, dùng các tệp được lưu trong thư mục revisions nêu trên. Để chạy lại bản xem trước, chạy `node serve-preview.mjs` trong thư mục này; máy chủ chỉ nghe 127.0.0.1. Để đồng bộ nội dung đã sửa: `node update-standing-preview.mjs` rồi kiểm cú pháp. Script chỉ ghi các tệp thiết kế trong thư mục này.
