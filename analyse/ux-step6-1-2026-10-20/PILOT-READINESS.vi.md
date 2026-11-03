# 6.1 — Sẵn sàng chuẩn bị, chưa sẵn sàng chạy pilot

20/10/2026 · Hồ sơ vận hành trên giấy cho bước 6 của [kế hoạch](../ux-implementation-2026-10-14/PLAN.vi.md). 6.1 là phân đoạn chuẩn bị mới, không phải UI hay pilot đã triển khai. Dùng [protocol gốc](../ux-implementation-2026-10-14/content/pilot-test-protocol.md) và [trách nhiệm nội dung 5.1](../ux-step5-1-2026-10-18/NEXT-STEPS.vi.md); không thay protocol hoặc hồ sơ canonical.

**Owner báo quyết định đã có và sẽ cung cấp quyết định, phạm vi** (`OWNER_REPORTED_DECISIONS_EXIST_DETAILS_PENDING`). Task chưa nhận bằng chứng đủ để đối chiếu; pilot hiện `BLOCKED_DETAILS_PENDING`. Không suy “chưa ai duyệt”, cũng không tự chuyển canonical pending thành approved.

## Trước khi chốt lịch hoặc đưa tài liệu cho người tham gia

| Việc cần chốt | Evidence/đầu ra phải nhận | Hiện trạng |
|---|---|---|
| Nội dung, mục đích, đối tượng | Đúng ID/revision/locale/path/SHA và asset hashes; bản nào được xem, bởi ai, cho mục đích đọc hay thực hành, phạm vi và ngày quyết định | Chờ Owner cung cấp |
| Người chịu trách nhiệm | Tác giả, reviewer chuyên môn phù hợp và độc lập, editor, người kiểm quyền/accessibility; tên, căn cứ, phần đã xem, quyết định | Chờ facts; contact nomination không là assignment/approval |
| Intro/định hướng không vận động | Editorial, accessibility, quyền và review phù hợp mục đích; bản intro nháp cũ không tự đủ điều kiện | Chờ đối chiếu exact bytes |
| Nhánh Thực hành | Buổi hoàn chỉnh được duyệt, đối tượng/phạm vi, toàn trình và timing đã xác minh; media phù hợp | Chưa xác lập trong task; không thay bằng bài đọc/clip |
| Tổ chức | Moderator, người ghi chú, data custodian và Owner quyết định; tiêu chí tuyển người trưởng thành, lịch hai vòng, khả năng đọc/nghe cần hỗ trợ | Chưa phân công; không tuyển trong 6.1 |
| Môi trường đưa xem | Chọn artifact, thiết bị/cách trình bày, quyền truy cập và mục đích sử dụng đúng approval | Chưa chọn; không export/share lúc chuẩn bị |
| Consent và ghi chú | Bản nói/đọc được chốt; nơi lưu, ai được xem, thời hạn/ngày xóa, cách nhận rút lại và xử lý ghi chú đã tổng hợp | Pending; cần quyết định khả thi trước chạy |

Một quyết định chỉ dùng cho bytes và mục đích đã ghi. Hash/ảnh/phạm vi đổi phải đối chiếu lại phần ảnh hưởng; không tự lấy “latest”. Gói hiện có [manifest nháp](../../content/yoga-library/manifest.json): 14 bài đọc, 55 ảnh hiện diện, 25 slot bị chặn; review pending/approvalRecords rỗng, không learner-visible hoặc recommendation-eligible. Gói technical PASS không là quyền participant xem. Dùng [lesson-template](../ux-implementation-2026-10-14/content/lesson-template.md) và hợp đồng review sẵn có để nhận quyết định, không tạo approval JSON trong packet này.

## Người, lượt và hai vòng

Mục tiêu từ protocol là **5–8 người trưởng thành khác nhau trong toàn pilot**, không phải mỗi vòng. Đề xuất vòng 1 có 3–4 lượt đọc intro đủ điều kiện; vòng 2 có 2–4 lượt thử lại bản sửa đã review. Chỉ nhánh/nội dung đủ điều kiện mới được đưa vào lịch; thiếu buổi thực hành không thay bằng clip chưa duyệt. Không thực hiện động tác trong nhiệm vụ giấy này.

Theo dõi riêng số người khác nhau, số lượt tham dự và số người quay lại. Nếu mỗi người tối đa một lượt/vòng: `người khác nhau = lượt vòng 1 + lượt vòng 2 − người quay lại`. Ví dụ phương pháp, **không phải kết quả**:

- 3 + 2 lượt, có 1 người quay lại → 4 người khác nhau, chưa đạt đề xuất 5–8; cần điều chỉnh lịch trước chạy.
- 3 + 3 lượt, có 1 người quay lại → 5 người khác nhau.
- 4 + 4 lượt, có 2 người quay lại → 6 người khác nhau, 8 lượt tham dự.

Mẫu định tính giúp tìm điểm vướng, không đại diện dân số. Không coi hoàn thành, thích, im lặng hay không trả lời là cải thiện sức khỏe. Thu thời gian chọn, trợ giúp, hiểu sai, lý do muốn quay lại và giờ biên tập/sửa/review thực tế theo [mẫu kết quả trống](PILOT-RESULTS.template.md).

## Delivery và điểm dừng

Reader 5.3 là workspace nội bộ Owner: bootstrap 5 phút, lease 15 phút; không phải môi trường participant cho lượt 30–45 phút. Không chia sẻ capability, tự gia hạn, dùng chung account hoặc bỏ guard. Offline artifact chỉ là lựa chọn có thể đề xuất khi exact purpose/rights/access được chốt; hiện chưa chọn, chưa xuất tệp hoặc đưa draft cho người ngoài.

Nếu facts thiếu/mismatch, participant từ chối hoặc muốn dừng, không có môi trường hợp lệ, hoặc nội dung/media đổi: giữ phần liên quan BLOCKED, không bù bằng suy đoán. Không hỏi tình trạng sức khỏe để tự quyết định ai phù hợp vận động. Packet chỉ là consent UX đề xuất, không pháp lý hay chuyên môn phê duyệt.

Sau QC độc lập và root kiểm bốn tài liệu: **STOP chờ Owner**. Chưa tuyển người, chạy vòng 1, xây route/app hay phát hành. Native HALTED/currentActorVerified=false; web BLOCKED_NO_UPLOAD_OR_ALIAS giữ nguyên.
