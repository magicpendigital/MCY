# Bổ sung phạm vi theo phản hồi Owner — 18/10/2026

Owner trả lời câu hỏi phạm vi trong cùng phiên: “Toàn bộ tư thế trong thư viện app hiện có, sau đó xây thêm danh mục tư thế tất cả tư thế và kỹ năng trong yoga.” Đây là yêu cầu bổ sung, không thay mục tiêu hoàn tất nhóm hiện có trước.

## Hai đầu ra tách biệt

1. **Sản xuất hiện có:** giữ intake ban đầu — 38 source clip, 13 record nhóm poses, 14 bài đọc gồm bài Đứng nền tảng, ảnh/copy nháp và những blocker chuyên môn đã ghi. Các clip gentle/sequence chưa được annotation thành từng tư thế.
2. **Danh mục mở rộng:** thêm catalog metadata có nguồn cho các nhóm tư thế, biến thể và kỹ năng. Catalog phục vụ lập kế hoạch biên tập, không là bài học, chỉ dẫn thực hành, phiên tập hay nội dung đã duyệt. Không hứa một danh sách hữu hạn bao phủ mọi trường phái hoặc mọi biến thể yoga. Không tạo tên/Sanskrit, quan hệ tương đương, cấp độ hoặc đối tượng phù hợp khi chưa có căn cứ.

Canonical dự kiến cho phần bổ sung: `content/yoga-library/expansion/`, ngoài unit contract hiện có. Các mục có stable ID, nhãn/alias đã có nguồn hoặc null, taxonomy, quan hệ và references tường minh; linkage về source/unit chỉ ở mức được chứng minh. Mọi mục ở metadata-only, không learner-visible/recommendation-eligible/published; không approval con người tự sinh.

## Triển khai và kiểm

Worker tái sử dụng `/root/pose_photo_production/photo_draft_check` để research/intake trước; không thay công việc ảnh của parent hoặc các unit đang sản xuất. Root và QC độc lập đọc `EXPANSION-INTAKE.vi.md` trước GO ghi canonical. Schema/validator/negative fixtures riêng cần được đọc trước khi chạy, gồm kiểm unique ID, taxonomy/ref/alias/source, linkage và flags đóng. Final manifest cần pin cả expansion data và công cụ tương ứng; bổ sung vào runbook/handoff trước snapshot cuối.

R3 giữ nguyên vì dữ liệu có thể được consumer yoga sử dụng về sau. Technical/peer checks không là chấp thuận chuyên môn hoặc quyền. Không app/candidate/CMS/cloud/native/Auth/AI/deploy/publish thay đổi; không khởi động bước UX tiếp theo. Hợp đồng bàn giao với task liên quan phải nói rõ phần metadata mới không được đếm thành bài học đã sản xuất.

Intake/QC ban đầu và các kết quả kiểm trước được giữ nguyên như lịch sử phạm vi cũ. Scope mới chỉ được đưa vào snapshot cuối sau QC riêng; nếu có lỗi control/data phải giữ kết quả thất bại và sửa/kiểm lại theo bytes mới.
