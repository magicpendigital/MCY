# QC đọc dữ liệu core đã dừng sản xuất — 2026-10-19

Kết quả **PASS trong phạm vi đối chiếu dữ liệu, tệp và nguồn**. Đây là kiểm tra độc lập chỉ đọc của `/root/content_independent_qc`, không phải phê duyệt chuyên môn yoga, quyền sử dụng, phát hành hay tích hợp ứng dụng.

Bằng chứng chi tiết và các SHA256: [CORE-READ-SNAPSHOT.json](CORE-READ-SNAPSHOT.json). Đã kiểm tra đủ 14 selector trong `INTEGRATION-HANDOFF.vi.md` so với JSON thực, gồm đúng `id`, `revision`, `locale`, đường dẫn; 38 bản ghi inventory và các liên kết nguồn/đường ngược; trạng thái nháp, các cờ công khai đóng, duyệt còn pending và approval rỗng. Không có import hoặc chỉnh sửa runtime.

Đã đối chiếu 55 media hiện diện và 25 media `identity_blocked` còn thiếu. Tệp hiện diện khớp SHA256, kích thước PNG, alt/caption/disclosure và nguồn lưu thực; 20 media nhập từ hai bài nền tảng cùng `legacyPayload` giữ nguyên so với nguồn. Các slot bị chặn không có đường dẫn, SHA, MIME hoặc kích thước giả.

Ledger cuối có 35 ảnh, 199889 byte, SHA256 `da6aec401c8732fa89c41369b98e337442b0e989628dcf2cb9ffc2d28f9354b2`. Với cả 35 ảnh, SHA256 của tệp canonical khớp dòng ledger, ảnh output gốc và SHA đã xem pixel độc lập trong bốn báo cáo media. Do byte không đổi, kết quả xem ảnh trước được giữ lại; không suy thành xác nhận alignment/chuyên môn. Ledger lỗi trước và receipt sửa được giữ làm lịch sử riêng, không thay bằng một kết quả PASS hồi tố.

Đã xác nhận đúng 28 câu exit của bước 1–4 trong bảy bài mới là “Chuyển sang khung đọc kế tiếp; không suy đường vào/ra từ một hình.” Không còn câu generic cũ trong các vị trí này. Các nguồn ứng dụng dùng chung vẫn khớp bốn SHA trong snapshot.

Giới hạn: audit này không import module control mới, không chạy global suite, không kiểm danh mục expansion đang mutable và chưa đối chiếu final manifest. Bốn báo cáo pixel/editorial trước vẫn có giới hạn chuyên môn đã ghi. Kết quả chỉ đủ để tiếp tục đóng gói nháp và QC manifest sau khi toàn bộ dữ liệu/control dừng thay đổi.
