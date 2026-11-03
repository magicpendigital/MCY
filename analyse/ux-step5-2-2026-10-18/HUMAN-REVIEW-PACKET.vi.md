# Phiếu giao người thật review — 5.2

18/10/2026 · **Packet chuẩn bị kỹ thuật; review người thật BLOCKED, chưa hoàn thành 5.2.** Theo [bổ sung Owner](OWNER-DECISION-SUPPLEMENT.vi.md), Owner báo “Đã chọn; tôi sẽ cung cấp tên và phạm vi phụ trách”: `OWNER_REPORTED_SELECTED_DETAILS_PENDING`. Tên, phạm vi, căn cứ năng lực, tính độc lập và evidence quyết định chưa có. Các ô nhân sự dưới giữ **DETAILS_PENDING/CHỜ CHI TIẾT**; không suy người từ lịch sử hoặc gán agent làm chuyên gia.

## Cách nhận đúng bản

1. Mở [queue](REVIEW-QUEUE.vi.md) và [receipt snapshot](REVIEW-SNAPSHOT.json); ghi mã mục cần xem cùng exact `(id, revision, locale, path, SHA-256)`, không lấy bản mới nhất theo tên. Queue chỉ dẫn nguồn; receipt không phải manifest cuối của upstream hoặc quyết định phát hành.
2. Đối chiếu [handoff canonical](../../content/yoga-library/INTEGRATION-HANDOFF.vi.md). Giữ source `(courseId, lessonId, youtubeId)` riêng với unit ID; `sourceRefs.lessonId` trỏ inventory record ID. Step/media phải gắn unit+revision+locale; không chọn variant từ backlink.
3. Nếu bytes/hash hoặc phạm vi đã đổi, dừng quyết định trên snapshot cũ và yêu cầu snapshot/review mới. Không sửa trạng thái pending/approval trong canonical để vượt review.

38 clip không đồng nghĩa 38 tư thế; 14 unit nháp là bài đọc, chưa là 14 buổi được duyệt. `practiceDurationSeconds=null` đúng với bài đọc; không yêu cầu timing buổi tập cho chúng. `expansion/catalog.json` và `expansion/README.vi.md` được README/handoff nhắc nhưng chưa tồn tại tại intake; danh mục metadata-only chưa là unit/bài học. Nếu xuất hiện sau, cần rà snapshot/phạm vi trước tiếp nhận, không mở rộng sản xuất trong packet này.

## Người và phạm vi cần Owner cung cấp

Owner đã báo chọn người; hồ sơ chưa nhận tên/phạm vi, các ô giữ **DETAILS_PENDING/CHỜ CHI TIẾT**. Selection được báo cáo chưa thay bằng chứng phân công cụ thể được ghi nhận.

| Vai trò | Thông tin cần điền bằng evidence thật |
|---|---|
| Tác giả/giáo viên biên soạn | Tên; phần phụ trách; năng lực/căn cứ và giới hạn; brief/variant đề xuất; ngày xác nhận. |
| Reviewer chuyên môn độc lập | Tên; căn cứ phù hợp; quan hệ với tác giả/tính độc lập; exact phần được giao; ngày/hạn và giới hạn review. |
| Editor | Tên; phạm vi tiếng Việt, nhãn loại nội dung, minh bạch AI; bản được proofread. |
| Người kiểm quyền | Tên; basis; phạm vi text/video/ảnh/audio/voice; evidence permission và điều kiện sử dụng. |
| Người kiểm accessibility | Tên; phạm vi đọc/nghe, alt/caption/transcript, lựa chọn dừng/thoát; cách và bản đã kiểm. |
| Owner | Người xác nhận phân công/phạm vi, xử lý gap và nhận quyết định; không tự thay chuyên môn/quyền. |

Kiêm nhiệm editor/quyền/accessibility phải được ghi rõ; reviewer chuyên môn giữ độc lập với tác giả. Đây là phân công hồ sơ nội bộ offline/reference, không tạo CMS assignment, role backend hoặc quyền truy cập thật.

## Phiếu quyết định có thể điền

Dùng các mục sẵn trong [lesson-template](../ux-implementation-2026-10-14/content/lesson-template.md); phiếu dưới là nơi dẫn evidence, không phải schema/approval JSON mới. Mỗi phạm vi dùng một phiếu:

- Mục queue / loại nội dung / exact variant: **CHƯA CHỌN**.
- ID + revision + locale + path + SHA-256 / receipt tham chiếu: **CHỜ XÁC NHẬN**.
- Người / vai trò / căn cứ / tính độc lập / phạm vi: **DETAILS_PENDING/CHỜ CHI TIẾT**.
- Nguồn, phần đã xem, mốc clip/step/asset và hash: **CHƯA BẮT ĐẦU**.
- Vấn đề, sửa đổi yêu cầu, evidence tham chiếu: **CHƯA BẮT ĐẦU**.
- Quyết định: **CHƯA QUYẾT ĐỊNH**; sau review người thật ghi sửa và review lại / loại / chấp thuận cho mục đích cụ thể, cùng basis/ngày/hạn.
- Phạm vi còn thiếu và người xử lý: **BLOCKED chờ phân công/evidence**.

Không điền qualification, chữ ký hoặc quyết định thay người thật. Theo [quy trình content-review](../../docs/content-review/README.md), checker chỉ kiểm nhất quán, không chứng minh danh tính/chuyên môn/quyền; approval session catalog không tự áp sang unit đọc private.

## Checklist người nhận phải xác nhận

- Giáo viên/reviewer: đã xem đúng nguồn, text, từng cue, hình và chuyển tiếp; audience/prerequisite, phương án khác/dừng do người thật quyết định, không suy từ tên clip.
- Editor: đã proofread đúng bản tiếng Việt, nhãn đọc/thực hành/khóa, giới hạn và phần AI hỗ trợ; không thêm claim hiệu quả.
- Accessibility: đã so alt/caption với ảnh; caption/transcript với audio đúng ngôn ngữ; ghi thiếu gì và cách xử lý, không coi chưa xác minh là không có.
- Quyền: từng asset có nguồn/chủ thể quyền/permission/phạm vi/thời hạn và evidence; unlisted hoặc `draft_present` không đủ. Provenance/private evidence chỉ phục vụ audit, không vào learner bundle.
- Với **buổi thực hành**: reviewer xem toàn buổi ở nhịp thật và đo timing; không cộng thời lượng clip. Bài đọc không biến thành buổi tập khi đọc hết.

Brief dùng [CONTENT-PILOT](../ux-implementation-2026-10-14/content/CONTENT-PILOT.vi.md): **1 intro + 3 buổi**, chưa có tên người/buổi được xác nhận trong packet; không chọn tư thế hoặc viết health copy tại đây. Giáo viên xác nhận brief trước biên soạn. Bất kỳ đổi text/media/variant sau review phải có version/hash mới và review lại phần ảnh hưởng; giữ quyết định cũ gắn bytes cũ.

## Kết thúc bàn giao

Packet kỹ thuật chỉ có thể READY sau QC độc lập và root kiểm riêng. Review thật vẫn BLOCKED tới khi đủ người/phạm vi/evidence/quyết định; không mở catalog, recommendation hoặc pilot. Native HALTED, web BLOCKED; không app/cloud/device/env/Auth/SQL/SDK/deploy/media/inference. **STOP chờ Owner trước 5.3/6**; rollback bằng không consume packet, không sửa canonical/candidate đã duyệt.
