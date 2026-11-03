# Bàn giao 6.1 — hồ sơ pilot trên giấy

Đã tạo bốn tài liệu vận hành theo GO của root: [readiness](PILOT-READINESS.vi.md), [hai đường/nhiệm vụ](ROUTE-TASK-MATRIX.vi.md), [moderator packet](MODERATOR-PACKET.vi.md) và [mẫu kết quả rỗng](PILOT-RESULTS.template.md). Chúng bổ sung protocol hiện có, không tạo UI, nội dung vận động, inventory/schema/validator hoặc approval mới.

[Check receipt](DOCUMENT-CHECKS-v1.json): lệnh đọc builtins exit0, 17 liên kết tồn tại, cả 9 bảng kết quả trống; 168 manifest inputs, 71 core, 255 source, 59 client, 35 root dirty và 29 reference pins giữ hash/bytes. Chín tình huống đã được đọc theo kịch bản **trên giấy**, không phải pilot. Initial check đếm nhầm kỳ vọng 8 bảng trong khi thực tế 9/9 trống được giữ ở receipt riêng; không sửa tài liệu để làm check đạt.

Owner báo quyết định đã có và sẽ cung cấp phạm vi; exact evidence vẫn chờ, pilot `BLOCKED_DETAILS_PENDING`. Intro không vận động cũng cần review đúng bytes/mục đích. Mẫu không có participant, quote, kết quả hay quyết định giả. Delivery, người phụ trách, access/retention/rút lại còn phải chốt; không dùng lại capability/lease Owner 5.3 cho participant.

Independent QC và root kiểm trực tiếp bốn tài liệu được ghi riêng sau freeze; implementer không tự tuyên bố verdict thay họ. Chưa tuyển người, phát consent thật, chia sẻ/export, chạy app/server/browser, thu dữ liệu hoặc chạy thử với người. Native HALTED và web BLOCKED_NO_UPLOAD_OR_ALIAS giữ nguyên. Rollback là không dùng supplement, giữ protocol/canonical/candidate/evidence cũ. Sau QC/root báo cáo: **STOP chờ Owner**, không tự chuyển sang pilot thật hoặc bước kế.
