# Người duyệt chuyên môn: gán Owner, mời hoặc giao quyền cho người khác — thiết kế 2026-11-21

Nguồn: Owner 21/11: "Hãy gán cho tài khoản Owner và thiết kế thêm tính năng cho phép invite người khác hoặc assign cho người khác quyền này." Đây là **thiết kế, chưa phải lệnh làm mã**; mọi thay đổi cần kế hoạch riêng theo `plans/_TEMPLATE.md` (R3: vai trò, dữ liệu, migration). Canvas: trang "Mô hình trả phí", bảng T6 (https://claude.ai/artifact/Uxw44YQsBvUdCFffPfPcHg).

## Hiện có (không làm lại)

- Owner là người duyệt chịu trách nhiệm ban đầu; Owner giao duyệt theo đúng phiên bản trong 1–30 ngày cho giảng viên đã kích hoạt, hoặc thu hồi; đổi quyền thì vô hiệu quyết định ([docs/content-review/README.md](../../docs/content-review/README.md)).
- Đường mời giảng viên: `private.workspace_invites` (vai, phạm vi, email băm, mã idempotency, hạn, giới hạn tần suất), RPC `mcy_teacher_prepare_invite`, kích hoạt bằng hành động có nhật ký ở máy chủ.

## Thiết kế

- **Gán ban đầu:** tài khoản Owner là người duyệt chuyên môn có tên của giai đoạn F. Mỗi bản ghi mang nhãn "Owner tự duyệt" và trường "độc lập: không" (sự thật hiển thị, không phải lỗi). Khuyến nghị mời người duyệt độc lập cho nội dung về đau, chấn thương, thai kỳ.
- **Vai mới `reviewer`:** chỉ thấy hàng đợi được giao (khóa hoặc bài, đúng phiên bản); ghi Đạt / Cần sửa / Không đạt, lý do, tiêu chí, đối tượng, loại trừ, câu dừng; không thấy dữ liệu học viên, giá, doanh thu, bản nháp ngoài phạm vi; **không mời hay giao quyền** (chỉ Owner); không duyệt bài mình viết; giảng viên kiêm người duyệt được nếu Owner giao.
- **Mời:** Owner nhập email, phạm vi (khóa / vài khóa / toàn bộ khóa trả phí), thời hạn vai [Owner đặt]; dùng lại đường mời giảng viên (mã, hạn, giới hạn tần suất, không gửi trùng, email Resend, chữ Owner duyệt) → người nhận xác minh email, đọc điều khoản vai trò (không xem dữ liệu học viên, giữ bí mật bản nháp), tự khai tên và trình độ, chọn có hiện tên công khai không → **Owner kích hoạt** (email xác minh một mình không cấp quyền) → giao việc (1–30 ngày theo phiên bản như hiện nay, hoặc toàn bộ khóa trong phạm vi).
- **Giao cho người đã là giảng viên:** thêm vai vào hồ sơ đã kích hoạt, không cần mời lại.
- **Thu hồi:** một chạm, hiệu lực ngay, có nhật ký; người duyệt tự rút vai được. Quyết định chưa hoàn tất bị vô hiệu; khóa đã bán giữ lời duyệt đã ghi.
- **Chuỗi cổng của một khóa trả phí:** tác giả → người duyệt chuyên môn (đúng phiên bản) → Owner khai báo → Owner bật hiển thị và đặt giá. Đổi nội dung = phiên bản mới = duyệt lại; đổi giá hoặc tùy chọn AI không phải duyệt lại.
- **Hiển thị cho người học:** dòng "Duyệt chuyên môn: tên, trình độ, ngày" chỉ khi người duyệt đồng ý hiện công khai và Owner khai báo trình độ là đúng; nếu không: "Duyệt nội bộ bởi Magicpen Digital". Không dùng chữ "chứng nhận", "chữa", "điều trị".
- **Không bao giờ:** hệ thống hoặc AI điền lời duyệt thay người; agent ghi bản ghi duyệt thay Owner (AGENTS.md cổng 3); hệ thống chứng nhận bằng cấp (chỉ kiểm tính nhất quán).

## Hệ quả hệ thống (R3)

Mở rộng ràng buộc vai của lời mời để nhận `reviewer` và phạm vi theo khóa; thêm vai vào bảng gán vai; RPC mới ở schema `private` (security definer, `search_path` rỗng, EXECUTE chỉ cho `service_role`, danh tính kiểm trong RPC, nhật ký, lỗi nghiệp vụ `PT409`); hàng đợi chỉ trả bản ghi trong phạm vi. Cần: kế hoạch R3, thử lại trên PGlite, kiểm quyền thực tế (kể cả TRUNCATE và PUBLIC), skill `mcy-supabase-rollout` cho mọi lần áp. Không thử mời hay duyệt trên dữ liệu thật khi chưa có lệnh của Owner.

## Khi nào làm

Cần trước F1 nếu Owner muốn người duyệt độc lập; nếu chỉ Owner duyệt thì F1 chạy được với hệ thống hiện có.

## Cần Owner quyết sau

Thời hạn mặc định của vai trò; có bắt buộc ít nhất một người duyệt độc lập với khóa có nội dung về đau/thai kỳ không; mẫu chữ lời mời và điều khoản vai trò (Owner duyệt, không phải văn bản pháp lý).

## Chưa kiểm

Chưa có mã, chưa mời ai, chưa có người duyệt thật; chưa kiểm hợp pháp của việc Owner tự duyệt nội dung bán thu phí; canvas chưa dựng để xem bằng mắt khi viết.
