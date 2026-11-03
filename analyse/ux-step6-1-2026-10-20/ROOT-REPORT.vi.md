# Bàn giao 6.1 — gói chuẩn bị pilot

**Đã hoàn tất bốn tài liệu vận hành, qua Agent triển khai → QC độc lập → root trực tiếp kiểm. Dừng chờ Owner xem và duyệt; chưa chạy pilot với người tham gia.** Đây là phần chuẩn bị mới của bước 6, chưa xây hai route trong ứng dụng.

Bốn tài liệu bổ sung cho protocol đã có:

- [Điều kiện sẵn sàng](D:/Projects/MCY/analyse/ux-step6-1-2026-10-20/PILOT-READINESS.vi.md): nhận quyết định đúng bài/phiên bản/hash/phạm vi, người phụ trách, môi trường và cách quản lý ghi chú; phân biệt người duy nhất với lượt tham dự.
- [Ma trận Tìm hiểu/Thực hành](D:/Projects/MCY/analyse/ux-step6-1-2026-10-20/ROUTE-TASK-MATRIX.vi.md): nhiệm vụ, điều quan sát và điều kiện dừng; đọc không thành thực hành hoặc Hành trình. Nhánh thực hành còn chờ nội dung/phạm vi phù hợp.
- [Kịch bản moderator](D:/Projects/MCY/analyse/ux-step6-1-2026-10-20/MODERATOR-PACKET.vi.md): lời mở đầu, lựa chọn tham gia, câu hỏi trung tính, trợ giúp, bỏ qua/dừng và ghi chú tối thiểu. Không yêu cầu thử động tác hoặc thu tình trạng sức khỏe.
- [Mẫu kết quả](D:/Projects/MCY/analyse/ux-step6-1-2026-10-20/PILOT-RESULTS.template.md): chín bảng rỗng, tách quan sát/diễn giải, trợ giúp, hiểu sai, lý do quay lại, giờ công và quyết định có evidence.

QC cuối không còn P1/P2 trong phạm vi tài liệu. Root đã đọc đủ bốn bản, tự kiểm 17 liên kết, chín bảng trống và bảy tình huống giả định: thiếu chi tiết duyệt, chỉ intro đủ điều kiện, đổi hash, từ chối/dừng, không phản hồi/tự bộc lộ dữ liệu nhạy cảm, đếm người quay lại và giới hạn phiên Owner cục bộ. Đây là kiểm logic trên giấy, không là kết quả người dùng hoặc review chuyên môn. Lỗi công cụ đếm nhầm số bảng ban đầu được giữ riêng và sửa cách kiểm, không sửa tài liệu để đạt.

Root xác minh hash/byte giữ nguyên: 168 đầu vào manifest, 71 phụ thuộc core, 255 nguồn reader, 59 tệp giao diện, 35 tệp root đang chỉnh và 29 tài liệu tham chiếu. Bốn bản bàn giao cùng 36 pin evidence đều khớp. Không cần build hoặc chạy bộ app vì không đổi mã, frontend, control hay runtime.

Owner đã báo có quyết định duyệt và sẽ cung cấp phạm vi; trạng thái là **OWNER_REPORTED_DECISIONS_EXIST_DETAILS_PENDING**. Task chưa nhận đủ chi tiết để gắn quyết định với đúng nội dung thử. Ngoài các quyết định đó, trước khi chạy cần chốt delivery, moderator/custodian, nơi lưu, access/retention và xử lý rút lại. Phiên Owner 5.3 không được tự dùng lại hoặc gia hạn cho participant.

Chưa tuyển người, gửi lời mời, phát consent thật, chia sẻ bản nháp, xuất artifact, thu dữ liệu hoặc chạy app/server/cloud/native/AI. Gói canonical và protocol cũ giữ nguyên. Native HALTED và web BLOCKED_NO_UPLOAD_OR_ALIAS. Có thể bỏ dùng supplement này mà không hoàn nguyên dữ liệu hay mã ứng dụng.

Bằng chứng: [QC cuối](D:/Projects/MCY/analyse/ux-step6-1-2026-10-20/FINAL-QC.vi.md), [root kiểm trực tiếp](D:/Projects/MCY/analyse/ux-step6-1-2026-10-20/ROOT-DIRECT-DOCUMENT-CHECK.json), [root xác minh cuối](D:/Projects/MCY/analyse/ux-step6-1-2026-10-20/ROOT-FINAL-VERIFICATION.json), [freeze](D:/Projects/MCY/analyse/ux-step6-1-2026-10-20/FINAL-EVIDENCE-FREEZE-v1.json).

**Dừng chờ Owner duyệt gói chuẩn bị và cung cấp phạm vi quyết định đã có; chưa chuyển sang vòng pilot hoặc bước tiếp theo.**