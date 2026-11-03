# Bàn giao bản đề xuất — Một chút nền tảng

Ngày 16/10/2026 · Bản đề xuất nội dung và giao diện cục bộ.

## Xem trước

- Trang trình bày: http://127.0.0.1:4317/
- Bản tương tác: http://127.0.0.1:4317/preview.html
- Nếu máy chủ đã tắt: tại thư mục này chạy `node serve-preview.mjs`. Máy chủ chỉ nghe trên 127.0.0.1 và chỉ phục vụ các tài liệu/ảnh thiết kế được cho phép trong thư mục này.
- Có thể mở `review.html` hoặc `preview.html` trực tiếp trong trình duyệt thông thường; toàn bộ tài nguyên đi kèm là cục bộ.

## Đã có

- Cấu trúc series, 3 đề tài, 15 khung storyboard, copy xem trước và yêu cầu biên tập trong `CONTENT-PROPOSAL.vi.md`.
- Phân tích source và phương án màn hình trong `UI-UX-AUDIT.vi.md`; ảnh quan sát giao diện web hiện tại và giới hạn trong `VISUAL-AUDIT.vi.md`.
- Trang trình bày `review.html` và bản tương tác độc lập `preview.html`/`preview.css`/`preview.js`.
- 3 hình concept bằng AI cho 3 bài, có prompt/provenance trong `assets/README.md`. Chưa phải 15 hình kỹ thuật. Hình của mỗi bài được dùng lại qua 5 khung để thử bố cục.

## Đã kiểm trong trình duyệt

- Ba bài có đủ 5 bước; có Trước/Tiếp, mục lục để nhảy bước, xem lại từ đầu và màn kết thúc.
- Modal phóng to mở/đóng bằng Escape và trả focus về nút mở. Phản hồi hiểu bài cập nhật trạng thái lựa chọn.
- Màn cuối ghi “Bạn đã đến cuối phần đọc.” kể cả khi nhảy thẳng tới khung 5; không tuyên bố đã đọc hết hoặc đã thực hành.
- Hôm nay có đường vào bài; kế hoạch minh họa có đường trở về đúng phần chuẩn bị. Kế hoạch chỉ là trạng thái đề xuất, không phải chức năng AI đang hoạt động.
- Đọc tiếp nhớ vị trí trong phiên. Đọc tiếp từ Hôm nay giữ đường về Hôm nay, đã kiểm lại sau sửa. Xóa vị trí đọc làm thẻ đọc tiếp biến mất. Tải lại trang khởi tạo phiên mới.
- Live region đã kiểm Next → Previous, nhảy khung, vào lại reader và xóa khi rời. Đây là kiểm DOM/aria; chưa phải kiểm bằng phần mềm đọc màn hình thật.
- Bố cục mobile đã quan sát 390 × 844 và 320 × 740; màn kiểm ở 320 không tràn ngang. Desktop mặc định 1280 × 720 có chế độ hình/chữ hai cột. Override viewport đã trả về mặc định.
- Chữ tiếng Việt đã chỉnh sang Times New Roman trong nhóm serif sau khi quan sát lỗi giãn glyph với Georgia. Giữ palette và logo gốc; logo copy khớp byte.
- `node --check` qua với preview.js và serve-preview.mjs. Console lỗi của bản preview tĩnh trả về danh sách rỗng tại lần kiểm cuối. Trang trình bày tải đủ ảnh tại lúc kiểm.

## Rà soát và sửa

Ba vấn đề trong `REVIEW-NOTES.vi.md` đã được xử lý: phản hồi hiện tại chỉ về hiểu bài; thời gian hiển thị là đọc 3/4/3 phút với đúng 5 khung; copy kết thúc trung thực khi cho phép nhảy bước. Tên tab thống nhất “Cá nhân”. Đã bổ sung ID cho nhãn các section của trang trình bày.

Ảnh cuối dùng để đối chiếu: `11-final-discover-390.jpg`, `12-final-series-390.jpg`, `13-final-reader-390.jpg`, `14-final-end-320.jpg`, `15-final-reader-desktop.jpg`, `16-final-review-desktop.jpg`, `18-final-three-lessons-expanded.jpg`. Ảnh 17 là ảnh đang chuyển cuộn; không dùng làm căn cứ bố cục hoàn tất. Các ảnh 07/08/09 không có hậu tố verified là capture lỗi, không dùng. Giữ nguyên ảnh trung gian để không thay đổi lịch sử bằng chứng.

## Phạm vi còn lại

Chưa thẩm định kỹ thuật yoga, chưa có đủ ảnh riêng cho từng khung, audio/clip, user test, screen reader thật, chữ phóng lớn 200%, Android/iOS hoặc xác nhận WCAG toàn bộ. Thời gian đọc là ước lượng. Bản mẫu không gọi API, không đăng nhập, không lưu storage, không đồng bộ Hành trình và không thu cảm nhận cơ thể.

Chỉ tạo tài liệu và bản mẫu trong thư mục này; không tích hợp source ứng dụng, không build/cài APK, không triển khai staging/Production, không thao tác dữ liệu cloud. Các trạng thái native/cloud HALTED hiện có không bị thay thế bởi kết quả thiết kế này.

## Đề xuất triển khai sau khi chốt thiết kế

1. Hoàn thiện một bài với người phụ trách chuyên môn và 5 hình riêng; thử cách hiểu với người dùng mục tiêu.
2. Tích hợp loại bài minh họa, trang series và reader; mở từ Khám phá trước.
3. Bổ sung liên kết theo ngữ cảnh ở Hôm nay/buổi tập và nhớ vị trí đọc với phạm vi lưu rõ ràng.
4. Chỉ thiết kế nhánh thực hành/ghi cảm nhận khi đã có nội dung thực hành được duyệt và yêu cầu dữ liệu cụ thể.
