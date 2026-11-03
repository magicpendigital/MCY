# Root verification — bước 4.2 Check-in

**Ngày kiểm tra:** 16/10/2026  
**Người trực tiếp kiểm tra:** root agent (theo quan sát do root cung cấp)  
**Phạm vi:** candidate local `.vercel/ux-step4-2-20261014`, mở trong CUA browser tab mới tại `http://127.0.0.1:4189/?mode=web`, guest-only với harness backend `.invalid`.

Tài liệu này ghi lại những gì root báo đã trực tiếp quan sát ngày 16/10. Người viết handoff không tự nhận đã thao tác UI. Root đã đọc full patch và báo cáo QC; hash `Prototype.tsx` và `prototype.css` hiện tại lần lượt là `873111024377eb65ee55d229b9899d04acc798dca11c02924ab428cd6d39528c` và `856165bc65112bb46b9c4f0ee346820d5fe17607f4ecd4b0cc7fe97b8d5a340d`, khớp source freeze. Root báo review scope PASS, không tìm thấy P1/P2 bổ sung.

## Quan sát trực tiếp được root báo lại

- Ảnh 360×640 cho thấy ba lựa chọn nhanh và toàn bộ footer/CTA cùng nằm trong viewport. Đo chỉ đọc: viewport/document width đều 360; mỗi nút cao 52 px, các mép dưới ở y=261, 323 và 385. Ảnh: [quick choices 360×640](root-checkin-quick-360-2026-10-16.png), SHA-256 `07af0d96077aede751d610f4858dad6a23d6cf5f531525a5dad0a6308449c7ca`.
- Root chọn **Không thấy khó chịu** rồi **Tiếp**; tóm tắt bước 2 giữ trạng thái đó. Chọn **Sửa** về bước 1 vẫn thấy lựa chọn được pressed. Mở **Muốn ghi một vùng** chỉ mở disclosure: `none_now` vẫn pressed và caption không đổi.
- Ở kích thước 390×844, root đọc `innerWidth/innerHeight` là 390×844, body/document width là 390; footer bắt đầu tại y=668 và cao 176 px. Root dùng cuộn chuột thông thường xuống khoảng 0.65 rồi lên khoảng 0.3. Danh sách text và ảnh toàn thân đều tới được; ảnh toàn thân nhìn đầy đủ phía trên footer trong [ảnh full map 390×844](root-checkin-full-map-390-2026-10-16.png), SHA-256 `693fd933c940aab90f6010e3b91561cd7aade07551bbe189cc1a5ed0b73c00ec`.
- Ảnh [vị trí cuộn sâu 390×844](root-checkin-map-390-2026-10-16.png), SHA-256 `a600cd577927f675c8df0660ca3044841ed592ff054263fbd3219d8ca09a0864`, cho thấy danh sách text ở viewport trong khi phần đầu hình nằm ngoài viewport. Không dùng ảnh này để khẳng định toàn bộ bản đồ và text list hiện đồng thời.
- Root chọn **Cổ → Vừa → Lưu vùng này** trong guest draft giả lập. Thu gọn rồi chọn **Sửa vùng đã ghi** hiển thị số lượng 1; mở lại cho thấy **Cổ — Vừa**.
- Chọn **Không thấy khó chịu** mở hộp xác nhận. Ảnh [xác nhận 390×844](root-checkin-confirm-390-2026-10-16.png), SHA-256 `05d68cd2c7624ccb38b0f1992a997e63e4bedba7e78c7c97755e05803ff7dd43`, cho thấy đầy đủ tiêu đề cùng hai nút **Đổi lựa chọn** và **Giữ các vùng đã ghi**. Hủy bằng **Giữ các vùng đã ghi** giữ lại **Cổ — Vừa**. Mở lại và xác nhận **Đổi lựa chọn** chuyển về `none_now`, số vùng thân mình là 0 và **Cổ** hiện lời nhắc chạm để ghi.

## Đối chiếu QC và giới hạn

Đây là kiểm tra thủ công UI local ngày 16/10; không chạy lại tests. Bộ QC ngày 14/10 giữ nguyên kết quả lịch sử: lượt regression ban đầu có 81 PASS và 1 geometry assertion FAIL (exit 1); targeted rerun cuối có 16 PASS (exit 0), tổng 97 case độc nhất PASS qua nhiều lượt. Không mô tả chúng thành một lượt 82/82 xanh. QC độc lập ngày 14/10 kết luận PASS trong R1 local, không còn P1/P2; P3 ảnh xác nhận giữa transition đã được đóng bằng ảnh cuối và readback riêng.

Thao tác ngày 16/10 chỉ dùng guest/harness với backend giả `.invalid`; không thực hiện check-in save cuối, xác thực người dùng, request/backend thật, native/device, cloud hay deploy. Kiểm tra này không xác nhận native session/data restoration, live behavior, full screen-reader/accessibility, WCAG hoặc reflow 200%.

**Kết luận root:** bước 4.2 được triển khai, QC độc lập hoàn tất và root đã kiểm tra trực tiếp candidate local theo phạm vi nêu trên. Trạng thái: `IMPLEMENTED_QC_ROOT_VERIFIED_WAITING_USER`. Bước 4.3: `WAITING_USER`; dừng tại đây cho tới khi có phản hồi mới từ người dùng.
