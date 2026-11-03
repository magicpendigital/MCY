# Bổ sung đề cử vai trò do Owner cung cấp — 5.2

18/10/2026 · **OWNER_PROVIDED_ROLE_CONTACT_NOMINATIONS_ONLY.** Owner đã trực tiếp cung cấp hai liên hệ kèm vai trò Teacher và Reviewer. Chi tiết liên hệ được giữ riêng trong receipt local thuộc `.vercel/` đã được Git ignore; tài liệu này chỉ dùng mã tham chiếu, không ghi email hoặc suy tên thật.

| Mã liên hệ | Vai trò Owner nêu | Trạng thái và phạm vi đề xuất |
|---|---|---|
| `teacher-contact-01` | Teacher | **NOMINATED / PROPOSED_SCOPE**: đề xuất phụ trách biên soạn/chuyên môn; phạm vi cụ thể chưa được xác nhận. |
| `reviewer-contact-01` | Reviewer | **NOMINATED / PROPOSED_SCOPE**: đề xuất review chuyên môn độc lập; tính độc lập và phạm vi cụ thể chưa có evidence. |

Đây là đề cử liên hệ do Owner cung cấp, không phải xác minh tài khoản, qualification, assignment exact version hoặc quyền hiện có. Hai địa chỉ khác nhau không chứng minh hai người độc lập. Không có lời mời/email, tra cứu tài khoản, API, grant hay thay đổi role/backend nào được thực hiện trong bước ghi nhận này.

## Thông tin còn cần người thật xác nhận

- Danh tính và căn cứ năng lực/phạm vi chuyên môn của từng người; tính độc lập của reviewer với tác giả.
- Phần được giao, loại nội dung, exact `(id, revision, locale, path, SHA-256)`, asset/version và thời hạn review; nguồn/phần thực tế đã xem.
- Người phụ trách editor, quyền và accessibility; evidence quyền, caption/alt, kết quả và quyết định thật theo từng phạm vi.

Dùng [HUMAN-REVIEW-PACKET](HUMAN-REVIEW-PACKET.vi.md), [queue](REVIEW-QUEUE.vi.md) và [snapshot](REVIEW-SNAPSHOT.json) đã frozen để chuẩn bị tiếp. Các câu “chưa nhận tên/phạm vi” trong packet cũ là trạng thái tại lần freeze; supplement này chỉ bổ sung việc đã nhận liên hệ theo vai trò, không ghi đè hồ sơ cũ hoặc điền quyết định thay người được đề cử. Không sửa canonical pending/approval để vượt review.

**Human review 5.2 vẫn BLOCKED**: chưa có qualification/tính độc lập/phạm vi cụ thể/exact-version assignment hoặc evidence quyết định. Chưa hoàn thành 5.2, chưa mở 5.3/6, catalog, recommendation hay pilot. Native HALTED và web BLOCKED giữ nguyên. Hồ sơ này chỉ là ghi nhận offline/reference; tiếp tục QC độc lập → root kiểm → STOP chờ Owner.

Rollback cục bộ: không dùng supplement/receipt này hoặc thay bằng phiên bản được review riêng; không chỉnh các pin frozen, app hoặc upstream.
