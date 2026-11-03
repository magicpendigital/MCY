# Trạng thái 5.2 — packet để người thật review

18/10/2026 · **TECHNICAL_PACKET_PREPARED; independent QC và root final verification PENDING. HUMAN_REVIEW_BLOCKED.** Owner đã duyệt 5.1 và yêu cầu chuẩn bị 5.2. Sau [intake](TASK-INTAKE.vi.md), [baseline](BASELINE.json), [intake QC](INTAKE-QC.vi.md) và [bổ sung quyết định Owner](OWNER-DECISION-SUPPLEMENT.vi.md), root GO chỉ phần tài liệu kỹ thuật R0. Owner báo “Đã chọn; tôi sẽ cung cấp tên và phạm vi phụ trách”; vì chưa có chi tiết/qualification/independence/evidence, không ghi tên, phân công thật hoặc approval. Sau QC/root: **STOP chờ Owner trước 5.3/6**.

Deliverable: [queue kỹ thuật](REVIEW-QUEUE.vi.md), [snapshot receipt](REVIEW-SNAPSHOT.json) và [phiếu giao người thật](HUMAN-REVIEW-PACKET.vi.md). Hai file đầu do `/root/profile46_finish` lập, packet do agent `content51_plan` lập; `/root/profile46_qc` chỉ QC độc lập, `/root` kiểm cuối. Source of truth vẫn là canonical `content/yoga-library/`; hồ sơ consumer không sửa text, ảnh, schema, tool, app hoặc backend. [Freeze final](FINAL-EVIDENCE-FREEZE.json) sẽ pin exact docs/input, tách khỏi QC/root verdict.

## Snapshot mới và giới hạn

[Receipt](REVIEW-SNAPSHOT.json) đọc hai lượt 17 file README/handoff/inventory/14 unit lúc `2026-10-18T13:36:42.82402Z–13:36:43.5573362Z`: không drift trong lượt và không drift so [baseline 5.2](BASELINE.json). Có 38 source records, 14 unit `(id, revision, locale, path, SHA-256)`, 13 sourceRef đều join đúng một triple inventory. 80 media slot = **55 draft_present + 25 identity_blocked + 0 not_produced**; 55/55 asset được tham chiếu có path hợp lệ, file tồn tại và SHA đúng khai báo. **56 file vật lý** trong media folder là phép đếm khác, không suy 56 ảnh được duyệt. Hash chỉ chứng minh bytes, không chứng minh tư thế, bản quyền, caption, accessibility hoặc qualification.

So [freeze 5.1](../ux-step5-1-2026-10-18/FINAL-EVIDENCE-FREEZE.json), bốn file cùng danh sách đã đổi hash: handoff và ba unit `cobra`, `cobra-gentle`, `three-legged-dog`; `README.vi.md` là input mới của 5.2. Snapshot 5.1 45/25/10 là lịch sử, **không** carry thành hiện tại. Tại snapshot 5.2, `manifest.json` và hai path expansion được README/handoff nhắc vẫn chưa tồn tại. Expansion là metadata-only/planning và không được nhập vào queue 14 unit; nếu upstream thay đổi sau receipt, cần snapshot mới trước quyết định.

## Kết quả kiểm kỹ thuật và cổng người thật

| Kiểm | Lệnh/điều kiện đã dùng | Kết quả |
|---|---|---|
| Snapshot source | PowerShell `Get-FileHash -Algorithm SHA256` trước/sau trên 17 path trong baseline; đọc JSON bằng `ConvertFrom-Json`; so `(id, revision, locale, path)`, 38 record và 13 join triple | **PASS, exit 0** tại receipt; 17/17 stable, 38/14, join13/13. Đây không phải upstream final manifest. |
| Media references | Với `media.status=draft_present`, chỉ nhận `media/[A-Za-z0-9_./-]+.png`, cấm `..`, `Test-Path -LiteralPath`, rồi `Get-FileHash -Algorithm SHA256` so declared hash | **PASS, exit 0**: 55/55; 25 identity_blocked giữ nguyên. Không xem ảnh hoặc video. |
| Input/doc pins, local links, preserved app | Kiểm sau [freeze](FINAL-EVIDENCE-FREEZE.json), QC độc lập và root kiểm | **BLOCKED** tới final self-check/QC/root; baseline 4.7 237-input freeze `7614805e…bde1`, 5.1 freeze `9b943f38…5a7` không được sửa. |
| Build/runtime/UI/native/live/content approval | Không đổi app/config/hành vi, không có người thật review thực tế | **NOT_APPLICABLE** cho packet R0; không biến PASS kỹ thuật thành PASS nội dung. Human review **BLOCKED**. |

Packet giao Owner cần tên/phạm vi/căn cứ năng lực của giáo viên, reviewer chuyên môn độc lập, editor/quyền/accessibility; exact version/media/source họ đã xem, quyết định và ngày/basis. Đọc [lesson-template cũ](../ux-implementation-2026-10-14/content/lesson-template.md) và packet để ghi evidence thật sau này, không có CMS assignment hay approval record trong lượt này. 14 unit là bài đọc, `practiceDurationSeconds=null` đúng contract; chỉ một buổi tập được người thật chọn mới cần timing toàn buổi. Rights và content review pending, learnerVisible/recommendationEligible false, catalog đóng. Việc chuẩn bị này không mở 5.3, pilot, AI selection, native hoặc web release.

Rollback: không tiêu thụ packet nếu snapshot/role/evidence không còn đúng, tạo bản mới theo lifecycle; giữ nguyên canonical, 5.1 freeze, UX4.7 candidate. Native HALTED, web BLOCKED_NO_UPLOAD_OR_ALIAS. Final independent QC/root sẽ được ghi riêng và Owner quyết định bước tiếp theo; **không gọi 5.2 hoàn tất**.
