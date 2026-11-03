# Rà soát tính nhất quán — Một chút nền tảng

Ngày 16/10/2026 · Rà soát tài liệu và source bản mẫu; chưa chạy UI, chưa thẩm định chuyên môn yoga. Người rà soát đã soạn bản đề xuất nội dung trước đó; đây là đối chiếu chéo với tài liệu UI/UX và bản mẫu, không phải chứng nhận nội dung độc lập.

## 1. Cần tách phản hồi hiểu bài khỏi cảm nhận sau tập trong đề xuất UI/UX

**Vị trí:** `UI-UX-AUDIT.vi.md:40,101,114–115,165`, đối chiếu `CONTENT-PROPOSAL.vi.md:7,42,118,145`.

Tài liệu UI/UX đưa “Tôi đã thử · ghi cảm nhận” và một màn cảm nhận cơ thể vào bản MVP xem trước. Trong khi đó ba bài hiện chỉ là nháp để đọc/chọn/xem lại; tài liệu nội dung quy định phản hồi cuối bài về khả năng hiểu và chỉ mở cảm nhận cơ thể sau một buổi thực hành đã được duyệt. Cách viết hiện tại có thể khiến người triển khai thêm nhánh wellbeing cho chính bài minh họa chưa đủ hướng dẫn.

**Đề nghị sửa:** bản xem trước dùng câu hỏi “Phần nào chưa rõ?” hoặc “Cách trình bày có dễ hiểu không?” với lựa chọn trung tính, không tạo record sức khỏe. Chuyển nhánh “Tôi đã thực hành · ghi cảm nhận” sang phương án tương lai, có điều kiện phiên bản thực hành được duyệt và người học chủ động xác nhận đã tham gia. Nêu rõ tự bấm “đã thử” không thay điều kiện nội dung được duyệt. `preview.js` hiện đã làm phản hồi hiểu bài đúng phạm vi; cần sửa tài liệu để khớp.

## 2. Màn series đang yêu cầu thời lượng thực hành chưa có cơ sở

**Vị trí:** `UI-UX-AUDIT.vi.md:111–112`, đối chiếu `CONTENT-PROPOSAL.vi.md:7,31,49–53,72–76,97–101`.

Bảng màn hình yêu cầu thời gian “thực hành gợi ý” và nói tổng quan bài có 4–6 bước. Ba bài mẫu đã chốt 5 khung, chỉ có ước lượng thời gian đọc, chưa có nhịp/thời lượng thực hành do giáo viên xác định. Một người dựng màn theo bảng có thể điền thêm số phút giả hoặc làm số bước lệch giữa các tài liệu.

**Đề nghị sửa:** với bản mẫu này ghi “5 khung · đọc khoảng 3/4/3 phút — ước lượng”; bỏ trường thời lượng thực hành khỏi bản hiện tại. Mô hình sản phẩm tương lai có thể hỗ trợ số bước linh hoạt và thời lượng thực hành, nhưng chỉ hiển thị dữ liệu có thật của phiên bản đã được duyệt.

## 3. Copy kết thúc đang khẳng định người dùng đã xem mọi bước

**Vị trí:** `preview.js:74`, đối chiếu nhánh `jump` và kết thúc tại `preview.js:125,128` ở thời điểm rà soát.

Nút “Các bước” cho nhảy thẳng từ bước 1 tới bước 5 rồi mở kết thúc. Khi đó tiêu đề “Bạn đã xem hết bài” chưa đúng với hành vi quan sát được, dù bản mẫu đã tránh tính là tập xong.

**Đề nghị sửa:** đổi thành **“Bạn đã đến cuối phần đọc.”** hoặc **“Bạn muốn làm gì tiếp?”**. Không cần khóa nhảy bước hay thêm bộ đếm để chứng minh đã xem; đó sẽ đi ngược mục tiêu tự do xem lại và không bảo đảm đã hiểu.
