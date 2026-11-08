## Thay đổi và phạm vi

- Intake trước sửa và QC cuối theo [task lifecycle](../docs/quality/TASK_LIFECYCLE.md): liên kết hồ sơ đã điền, baseline/impact map và regression được chọn; hash bản cuối, reviewer độc lập khi bắt buộc, xác minh cuối của root/người phụ trách và điểm dừng chờ người dùng. Không dùng mẫu trống làm bằng chứng.

- Kết quả trước/sau; quyết định người dùng hoặc issue liên quan:
- Đã chạy `npm run check:ios15` trên đúng commit (PASS/FAIL) và ghi rõ iPhone iOS 15 thật: PASS / CHƯA CHẠY (INC-001, skill `mcy-ios-compat`):
- Tier R0 / R1 / R2 / R3 theo `.claude/skills/mcy-change-review` và lý do:
- Dữ liệu, vai trò, consent, media, nền tảng và file protected bị ảnh hưởng:

## Bằng chứng kiểm duyệt

- Lệnh/kiểm tra đã chạy, kết quả PASS / FAIL / CHƯA CHẠY, commit và môi trường:
- Flow, actor hoặc điều kiện lỗi đã kiểm thủ công; ảnh/video khi có UI:
- Test mới hoặc test còn thiếu cho hành vi mới:
- AGENTS/brand/design/schema/skills có cần cập nhật không; đã xử lý thế nào:

## Phát hành và rủi ro còn lại

- Rủi ro còn lại, người review cần thiết, gate chưa đạt:
- Cách tắt/quay lại và bằng chứng đã thử (nếu thay hành vi/dữ liệu):
