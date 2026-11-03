# Ảnh phong cách chụp và luồng quản trị — bản xem trước

16/10/2026 · Phạm vi: artifact cục bộ trong `analyse/foundation-series-2026-10-16`. Không sửa ứng dụng, backend, native, dữ liệu, role hoặc deployment.

Phân loại theo MCY review matrix: **R3** cho nội dung tư thế và thiết kế quyền quản trị. Lượt này chỉ tạo bản nháp/proposal để Owner xem; kiểm cục bộ và peer review không phải clearance phát hành. Các gate chuyên môn, quyền máy chủ, staging và rollout còn mở; không phát hành hoặc mời người dùng thật từ artifact này. Bộ kiểm/build ứng dụng không chạy lại vì không đổi source/runtime ứng dụng.

## Kết quả có thể xem

- [Reader bài 02](http://127.0.0.1:4317/preview.html?lesson=tabletop): mặc định dùng ảnh AI phong cách chụp, cùng bảng màu và ánh sáng với `public/assets/welcome-portrait-1024.webp` ở màn Welcome. Bộ 10 PNG riêng cho hai bài; không thay ảnh Welcome.
- Thanh công cụ **Phong cách → Ảnh AI / Minh họa** để so cùng bài/bước; đổi phong cách giữ vị trí đang đọc. Đây là công cụ đánh giá thiết kế, nằm ngoài điều hướng người học.
- [Trang tổng hợp](http://127.0.0.1:4317/review.html#photo-v3): 10 ảnh mới; storyboard minh họa v2 giữ phía dưới. Có liên kết phân tích quản trị.
- [Mô phỏng quản trị](http://127.0.0.1:4317/admin-preview.html): ba góc nhìn giả định, mặc định reviewer bài 02/photo-draft r3; dữ liệu chỉ trong bộ nhớ. Không nối tài khoản, API hoặc reader.

## Ảnh và phiên bản

`standing-photo-01…05.png`, `tabletop-photo-01…05.png` là ảnh tổng hợp AI, 1536 × 1024, cùng nhân vật hư cấu và trang phục olive–kem. `assets/photo-media.json` có alt/caption riêng; `photo-media.js` là overlay đồng bộ vào preview. Không sửa JSON/JS nội dung bài gốc hoặc các PNG minh họa v2. Giữ bản preview trước thay đổi tại `revisions/2026-10-16-before-photo-admin/`.

Prompt, nguồn, SHA và kiểm ảnh ở [PHOTO-MEDIA.vi.md](assets/PHOTO-MEDIA.vi.md). [PHOTO-ASSET-CHECK.json](PHOTO-ASSET-CHECK.json) xác nhận 10 PNG khác nhau, kích thước và hash. Đây là master để đánh giá, chưa tối ưu dung lượng cho phát hành mobile.

Ảnh phong cách chụp không phải ảnh giáo viên thật hoặc chứng cứ tư thế đã được duyệt. Thay hình tạo photo-draft mới; không chuyển quyết định duyệt của bộ hình cũ sang. Nội dung và ảnh vẫn chờ thẩm định yoga, quyền và accessibility trước tích hợp.

## Quản trị: hiện trạng và phương án

[CONTENT-ADMIN-CURRENT.vi.md](CONTENT-ADMIN-CURRENT.vi.md) đọc source và receipt có ngày, không kiểm live: có nền Owner content-review hẹp; Private teacher collaboration là local candidate riêng; hai bài mới chưa vào CMS/catalog. Upload media private, adapter Miu và publish chưa thành một đường vận hành hoàn chỉnh.

[CONTENT-ADMIN-PROPOSAL.vi.md](CONTENT-ADMIN-PROPOSAL.vi.md) đề xuất workspace tác giả/reviewer trên hướng collaboration, Owner phân công qua Miu/trusted adapter, một loại illustrated lesson và publisher capability riêng. Không tự nối hai backend hoặc cấp các capability này.

Mock tách tác giả, chuyên gia yoga và người xuất bản. Assignment gắn bài + revision + người + thời hạn; sửa tạo snapshot mới; quyết định chuyên môn và kiểm cuối độc lập; publish/rút bản là hành động riêng. Hết hạn/thu hồi trong mock dùng lựa chọn thận trọng về eligibility; chính sách expiry thông thường so với rút căn cứ an toàn còn cần chốt trước thiết kế runtime. Danh tính, hạn và quyền publisher đều giả định.

## Kiểm tra thực hiện

| Kiểm tra | Kết quả / giới hạn |
|---|---|
| Node syntax: preview.js, photo-media.js, admin-preview.js, serve-preview.mjs, update-photo-preview.mjs | PASS, sau thay đổi cuối. |
| 10 ảnh PNG, đường dẫn, alt, kích thước và SHA khác nhau | PASS; script `node analyse/foundation-series-2026-10-16/update-photo-preview.mjs`. |
| Reader hai bài: 5 bước + 5 modal ảnh đúng từng bài | PASS trong IAB. Ảnh standing05 đang tải ở lần đọc tức thời đầu; đọc lại xác nhận complete/1536. |
| Chuyển Ảnh AI ↔ Minh họa tại bước 4 | PASS; giữ tiêu đề/bước và dùng đúng asset. |
| Reader 390×844 và 320×740 | PASS: không tràn ngang, footer trong viewport. Admin 390×844 không tràn ngang và nút kiểm tra có thể tới được. |
| Report 10 ảnh mới | PASS: đủ 10 ảnh tải 1536 px. |
| Mock: thiếu checklist, assignment cũ khi revision mới, chưa đủ chuyên môn/biên tập | PASS: chặn thao tác tương ứng. |
| Mock: yêu cầu sửa → tạo/gửi r4 → giao đúng r4 → duyệt → kiểm cuối → publish | PASS, chỉ state trong bộ nhớ. |
| Mock: giao lặp cùng thông tin, nháp mới giữ bản hiển thị, thu hồi assignment bản cũ trong lúc sửa bản mới, hết hạn | PASS; không mang approval sang bản mới, thu hồi đúng bản đã được giao. |
| Browser console reader/admin | Không có warn/error trong lượt kiểm. |
| Peer review source và pixels | Không còn P1/P2 trong scope local prototype; [PHOTO-ADMIN-REVIEW.vi.md](PHOTO-ADMIN-REVIEW.vi.md). Không thay thẩm định yoga hoặc kiểm quyền server. |

[PHOTO-ADMIN-BROWSER-QA.json](PHOTO-ADMIN-BROWSER-QA.json) lưu các quan sát DOM tương ứng. Screenshot: `screenshots/30-photo-tabletop-390.jpg`, `screenshots/31-admin-review-desktop.jpg`.

Chưa chạy: native/iOS/Android, screen reader thiết bị thật, toàn bộ accessibility, quyền server/live role/Storage, upload, grant, migration, AI recommendation, staging hoặc Production. Bản mô phỏng không chứng minh server enforcement.

## Tiếp tục hoặc quay lại

Server chỉ GET/HEAD ở `127.0.0.1:4317`, whitelist artifact cụ thể, CSP `connect-src 'none'`. Chạy `node analyse/foundation-series-2026-10-16/serve-preview.mjs` khi cần mở lại; chỉ dừng tiến trình preview mình đang quản lý.

Để so hướng cũ, dùng selector Minh họa; ảnh và dữ liệu cũ còn nguyên. Để dựng lại overlay/report sau cập nhật metadata, chạy `update-photo-preview.mjs`; không chạy lại script lắp ghép v2 một cách mù quáng lên bản mới. Không dùng bất cứ nút mock nào làm căn cứ cho quyết định/cấp quyền thật.
