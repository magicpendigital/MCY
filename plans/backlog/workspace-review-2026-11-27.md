# Workspace giảng viên và Owner: rà soát và kế hoạch bổ sung (27/11)

Owner hỏi 27/11: ở "Bài video của tôi" không thấy nút thêm bài; chưa có tạo khóa; chưa có theo dõi dữ liệu bài và khóa.
Thiết kế để Owner duyệt nằm trên canvas MCY, trang "Workspace giảng viên & Owner" (bảng R, G, T, Đ):
https://claude.ai/artifact/Uxw44YQsBvUdCFffPfPcHg#page-workspace . Chưa viết mã.

## Phát hiện

- **Nút "Soạn bài mới" không nhìn thấy (lỗi):** nút dùng `owner-primary`, nền lấy từ `--owner-clay`. Biến này chỉ khai báo trong `.owner-shell` (trang Owner) và `.owner-content-review`. Trang giảng viên không có, nên nền trong suốt và chữ gần trắng. Đã xác nhận bằng computed style trong Playwright, trên mã `main` (`bf64cab`). Nút "Tạo khóa mới" của bản nháp S1 cũng mắc lỗi này. Bài kiểm S0 chỉ xem nút có tồn tại và bấm được, không xem nút có nhìn thấy được không.
- **Khóa:** bài của giảng viên chỉ tới học viên khi nằm trong một course_group đang hiện (`buildManifest`). Hiện chỉ Owner gom bài vào khóa. S1 đang dừng ở nhánh `claude/teacher-s1-course-groups` (`9e2fb90`), migration chưa áp.
- **Theo dõi:** `list_content` của giảng viên không trả về trạng thái hiện hay khóa chứa bài; chỉ `read_display` của Owner có. Máy chủ không ghi lượt xem video; tiến độ xem chỉ lưu trên máy người học.
- **Trang Owner:** thẻ mặc định là Cấu hình AI (đang tắt). Ô mời giảng viên nằm dưới AI. Không có danh sách giảng viên, không lọc theo trạng thái, không cảnh báo khi bài đã duyệt mà không tới học viên.

## Kế hoạch (mỗi bước chờ Owner duyệt)

| Bước | Việc | Rủi ro |
|---|---|---|
| W0 | Khai báo biến `--owner-*` cho `.owner-teacher-content` (1 dòng CSS) và thêm kiểm Playwright rằng nút có nền đặc | R1 |
| S1 | Hoàn tất khóa miễn phí của giảng viên theo bố cục bảng G (form 3 bước, "học viên thấy x/y bài", lối tắt "Thêm vào khóa") | R3 |
| W1 | Trang giảng viên có thanh bên (Bài video, Khóa học, Theo dõi; Kịch bản nháp xuống nhóm Khác), cột Duyệt và Trên app, lọc trạng thái, thẻ Theo dõi T1; thêm hàm đọc mới cho giảng viên, chỉ đọc bài của chính mình | R3 |
| W2 | Trang Owner mở vào thẻ Nội dung; thêm thẻ Giảng viên (danh sách và ô mời); thêm lọc trạng thái và mục "Cần Owner xử lý" | R2–R3 |
| T2 | Đếm ẩn danh theo ngày (mở, phát, xem gần hết), ngưỡng "<5", không cột người dùng; cập nhật chính sách quyền riêng tư và mục An toàn dữ liệu trên Play | R3–R4 |

Sau đó giữ thứ tự S3 → P1 → P2 → F.

## Ranh giới

- Giảng viên không thấy tên hay hồ sơ học viên.
- Phản hồi sau buổi không đưa cho giảng viên.
- Không hiện "cải thiện %".
- Số liệu chỉ là số gộp, có ngưỡng.

## Owner quyết 28/11

Owner đồng ý cả 5 đề xuất.

- **Q1 · Có:** sửa nút ngay.
  - W0 làm xong ở nhánh `claude/teacher-w0-button`.
  - Đã thêm kiểm Playwright: nền phải đặc, độ tương phản từ 4.5 trở lên.
  - Đã lên `origin/main` (`e018b11`).
- **Q2 · Có:** dùng bố cục thanh bên. "Kịch bản nháp" chuyển xuống nhóm Khác.
- **Q3 · Theo đề xuất:** T1 làm trong W1–W2. T2 để sau bản 1.0, hoặc khi Owner duyệt lời chính sách.
- **Q4 · Có:** khi T2 bật, giảng viên xem số gộp của bài mình, ngưỡng 5.
- **Q5 · Có:** trang Owner mở vào thẻ Nội dung, có thêm thẻ Giảng viên, ô mời chuyển sang thẻ đó.

S1 xong 28/11 (form 3 bước, x/y, lối tắt); migration đã áp lên staging (`20261128030007`), đã push.

Thứ tự làm: W0 → S1 → W1 → W2 → (T2 khi Owner duyệt chính sách) → S3 → P1 → P2 → F.
Bước có migration hoặc Edge cần Owner yêu cầu áp trong chính bước đó.
