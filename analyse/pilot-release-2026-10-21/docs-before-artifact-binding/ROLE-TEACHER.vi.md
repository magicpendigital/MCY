# Hướng dẫn Teacher/tác giả

**BẢN NHÁP — Owner đã chỉ định Teacher cho scope FULL tài khoản thật/toàn bộ bài chuẩn bị/thực hành/chức năng.** Xác minh [delivery](DELIVERY-AND-REPORTING.vi.md), server role/assignment và operation trước thao tác. Chỉ định của Owner không tự kích hoạt quyền backend. Root có UI soạn bài, nhưng chưa có evidence backend/quyền testgroup thật hoạt động; không dùng mô phỏng để thay nghiệm thu thật.

## Rehearsal nội bộ hiện hữu — không thay scope FULL

Các bước sau chỉ mô tả năng lực rehearsal đã có; không giao nhóm tài khoản thật thực hiện thay quy trình thật. Khi có operation rehearsal riêng, điều phối cấp đúng phiên local `fictional-author`; không tự chọn role hoặc chia sẻ bootstrap. Kiểm banner **MÔ PHỎNG · DỮ LIỆU TRUNG TÍNH GIẢ** và actor giả. Nếu banner Owner local hoặc tài khoản thật thì không thực hiện nhánh này.

1. Trong **Trong phạm vi phiên**, chọn bản giả được giao. Đối chiếu ID/bản/ngôn ngữ và SHA; chỉ bản trong scope xuất hiện.
2. Mở **Đối tượng, chuẩn bị và nguồn đối chiếu**, chọn mục lục, dùng **Mục trước/Mục tiếp**. Ảnh thiếu/bị chặn giữ thông báo; không thay ảnh khác.
3. Ở **Tiêu đề giả để thử xung đột phiên bản**, nhập chuỗi trung tính do điều phối giao, chọn **Thử sửa bản giả** một lần. Mong đợi thông báo thao tác mô phỏng trong bộ nhớ và version mới nếu thành công; không sửa canonical hoặc nháp của người thật.
4. Nếu task có ghi chú giả, dùng **Ghi chú riêng của phiên** → **Giữ ghi chú tạm trong phiên local**. Ghi chú chỉ ở bộ nhớ, mất khi phiên kết thúc; không là hồ sơ review bền vững.
5. Đóng theo task hoặc **Về ứng dụng**. Không thử vượt quyền reviewer. Kịch bản xung đột chỉ chạy khi điều phối có case rõ; nếu gặp VERSION_CONFLICT/SOURCE_CHANGED thì dừng đối chiếu bản, không gửi lại liên tục.

## Soạn bài thật — quy trình có trong UI, hiện chưa kích hoạt

Chỉ dùng sau một operation mới xác nhận tài khoản/server-owned Teacher role, backend, exact target, nội dung/purpose, write caps và test path. Chưa gửi link đăng nhập hoặc tạo draft bằng tài liệu này.

| Khi đã đủ điều kiện | Thao tác theo UI nguồn | Mong đợi |
|---|---|---|
| Mở workspace Teacher được delivery chỉ định | Đăng nhập theo phương thức mới được phép; chờ server kiểm quyền | Thấy **Soạn bài**; **Chưa có lời mời giáo viên** hoặc **Dịch vụ chưa sẵn sàng** là điểm dừng |
| Chọn **Bài mới/Tạo bản nháp** | Điền **Tiêu đề bài học**, **Tóm tắt**, **Mục tiêu học tập** và metadata theo bản được giao | Nội dung chưa lưu nằm trong phiên; không tự soạn lời hướng dẫn sức khỏe để lấp trường |
| Kiểm **Các đoạn hướng dẫn** | Đối chiếu bắt đầu/kết thúc giây, chuyển động, lời hướng dẫn, lưu ý dừng và các trường của tài liệu được giao | Timing và nội dung là dữ kiện cần người phụ trách review; không suy hợp lệ chuyên môn từ form |
| Lưu một lần theo cap được duyệt | **Lưu bản nháp riêng** | Chỉ coi lưu khi server thành công và có version; riêng tư, chưa learner-visible |
| Xung đột phiên bản | Đọc lỗi; dùng **Tải phiên bản đã lưu** chỉ theo task và sau bảo toàn phần sửa theo quy trình cho phép | Không ghi đè bản mới hoặc giả định lần lưu trước thất bại |

Chưa có upload video/media, publish hoặc quyền đọc hồ sơ học viên. **Duyệt nội dung được giao** là workflow khác: chỉ phần được server giao còn hạn, không tự biến tác giả thành reviewer độc lập. Báo lỗi tối thiểu theo [mẫu chung](DELIVERY-AND-REPORTING.vi.md#ghi-lỗi-tối-thiểu); chưa rõ kết quả Save thì dừng, không resave hoặc xóa history.
