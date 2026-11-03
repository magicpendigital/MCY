# Thực thi 4.4 — CourseDetail

Root đã GO sau QC intake/control độc lập PASS, không còn P1/P2: [report](../process-workflow-2026-10-17/INDEPENDENT-CONTROL-PLAN-QC.md), SHA256 `750cd065…1399fd`. Root báo đã trực tiếp đọc final lifecycle/patch/plan/intake/report và rehash 7 workflow + 4 plan inputs, exit 0, mọi pin khớp. Đây là checkpoint mới; các trường PRE_IMPLEMENTATION/AWAITING_INTAKE_QC trong intake/freeze cũ được giữ nguyên là lịch sử.

Worker `/root/course_detail_implementer` được ghi candidate `.vercel/ux-step4-4-20261017`, kế thừa đúng 233 input của freeze 4.3 `d29bf12d5f20992139094af4f8a4facb2ca6e9af37b4865a9e9151e33956cd2f`. [app-baseline.json](app-baseline.json) ghi source hash và root preimage hash. Không copy `.env`, native, build output hoặc node_modules.

Phạm vi: CourseDetail TSX, CSS chỉ course-detail, test tập trung và expectation layout bị ảnh hưởng có giải thích. Di chuyển nút Phát thật gần thông tin bài được chọn là thay đổi trình bày đã được root chấp thuận; giữ nguyên onClick và điều kiện tạo iframe, source/privacy/caption trước Phát, tỷ lệ/footprint media và reset/recovery/reflection. Chỉ mô tả có sẵn; không tạo nội dung, quyền hay kết quả học tập mới.

Preview local dự kiến `http://127.0.0.1:4192/?mode=web`, `.invalid` fixture; test dùng cổng riêng. Không có live API/Auth/write/AI/media/native/deploy. QC app và root kiểm tay còn BLOCKED cho đến evidence tương ứng. STOP trước 4.5.
