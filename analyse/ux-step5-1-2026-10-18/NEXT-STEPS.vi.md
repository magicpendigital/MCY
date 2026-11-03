# Tiếp nối 5.1 — giao người phụ trách nội dung

18/10/2026 · **Hồ sơ chuẩn bị R0, chưa nghiệm thu nội dung.** Owner đã duyệt 4.7; bản `.vercel/ux-step4-7-20261018-v7` giữ nguyên. Sau QC độc lập và root kiểm hồ sơ này, **STOP chờ Owner trước 5.2/6**. Native HALTED; web BLOCKED_NO_UPLOAD_OR_ALIAS.

## Nguồn và loại nội dung

Dùng [handoff canonical](../../content/yoga-library/INTEGRATION-HANDOFF.vi.md) làm hợp đồng tiếp nhận. Nhánh content sở hữu text/media/schema/công cụ và manifest cuối; 5.1 chỉ dẫn nguồn, không tạo bản nội dung, schema, validator hoặc crosswalk thứ hai. Manifest upstream còn PENDING; snapshot consumer không thay bàn giao cuối.

| Loại | Cách hiểu và giới hạn |
|---|---|
| Clip tham khảo | Nguồn video có metadata. 38 clip không đồng nghĩa 38 tư thế; tên/thời lượng không xác nhận nội dung hoặc quyền. |
| Unit đọc/giải thích | 14 unit nháp không phải 14 bài thực hành được duyệt. `practiceDurationSeconds=null`; đọc hết không tạo buổi tập hay Hành trình. |
| Buổi tập hoàn chỉnh | Có mở–thân–kết, cue, chuyển tiếp, phương án khác/dừng và thời lượng đo toàn buổi; cần người thật thẩm định. |
| Khóa học | Có mục tiêu, prerequisite, progression và tiêu chí học; nhóm clip hoặc thứ tự unit chưa tạo thành khóa. |

Phân loại nối [kế hoạch 14/10, bước 5–6](../ux-implementation-2026-10-14/PLAN.vi.md) và [kế hoạch đồng bộ 17/10](../ux-step4-4-2026-10-17/PLAN-CONSOLIDATED.vi.md). Trạng thái lịch sử trong hai plan không thay quyết định hiện tại.

## Brief giao người phụ trách: 1 intro + 3 buổi

Tái sử dụng [CONTENT-PILOT](../ux-implementation-2026-10-14/content/CONTENT-PILOT.vi.md) và [lesson-template](../ux-implementation-2026-10-14/content/lesson-template.md). Intro chỉ định hướng cách đọc/chọn/dừng/thoát; bản nháp cũ vẫn chưa duyệt. Ba buổi **chưa chọn, chưa thẩm định**; giáo viên đề xuất chủ đề, đối tượng, mục tiêu học, prerequisite, exclusions, vật dụng và quan hệ giữa các buổi. Không chọn tư thế hoặc gắn nhãn beginner-safe tại 5.1.

Giáo viên xác nhận brief trước biên soạn; xem trọn nguồn ở nhịp sử dụng, ghi mốc đối chiếu, cue/chuyển vào–ra, điều kiện dừng và phương án khác. Đo thời lượng cả buổi; không cộng độ dài clip thành thời lượng tập. AI chỉ hỗ trợ nháp từ brief đã xác nhận trong task được phép riêng, không tự đặt chuỗi hoặc phê duyệt. Hồ sơ này không gọi inference hay sinh media.

## Trách nhiệm và evidence

- **Giáo viên biên soạn:** cung cấp tên thật, năng lực/căn cứ, phạm vi và xác nhận brief.
- **Reviewer chuyên môn độc lập với tác giả:** kiểm từng cue, hình, transition và toàn buổi; ghi vấn đề, quyết định, ngày, phạm vi. Thiếu reviewer phù hợp thì BLOCKED.
- **Editor:** proofread tiếng Việt, nhãn loại nội dung, giới hạn và minh bạch AI; không thay kết luận chuyên môn.
- **Người kiểm quyền:** xác minh text, video, ảnh, audio/voice, phần chỉnh sửa và phạm vi permission. Unlisted hay file hiện có không chứng minh quyền.
- **Người kiểm accessibility:** đối chiếu caption/transcript với media, alt/caption với hình, khả năng đọc/nghe và các lựa chọn dừng/thoát. Editor có thể kiêm nếu ghi rõ trách nhiệm.
- **Owner:** chỉ định người, giải quyết gap và quyết định chuyển bước trên hồ sơ cụ thể; vai trò Owner không tự thay expertise/rights review.

Mỗi quyết định thật phải gắn exact `(id, revision, locale)`, path, SHA-256, asset hashes, người/basis/ngày và phần đã xem. Dùng trường trong mẫu sẵn có; không tạo approval giả. Sửa text/media phải có revision và review lại phần ảnh hưởng; không mang quyết định sang bytes mới. `draft_present` chỉ có bytes để review, không đủ quyền hiện learner; missing/identity_blocked phải giữ rõ. Evidence riêng tư không vào bundle.

## Các cổng tiếp theo

**5.2 — review người thật:** sau Owner duyệt hồ sơ 5.1, chốt exact variant, người phụ trách/reviewer, nguồn và quyền; hoàn thiện brief/template trên canonical theo phân công. Chỉ chuyển tiếp khi chuyên môn, quyền, tiếng Việt/accessibility và exact-version evidence đủ cho mục đích đã định. UNKNOWN/pending, thiếu timing cho buổi thực hành hoặc nội dung/media đổi đều giữ BLOCKED; bài đọc giữ `practiceDurationSeconds=null` đúng contract, không bị coi là thiếu timing. Review kỹ thuật không chứng minh chuyên môn.

**5.3 — adapter/reader:** chỉ mở task sau intake mới, đánh giá R3 phù hợp và QC độc lập của control trước thực thi. Bám mapping/version canonical; kiểm private draft, assignment/expiry/revoke, media lineage, missing media, revision conflict, cache, account switch và accessibility. Không import draft vào catalog hoặc dùng provenance nội bộ làm asset learner. Reader không biến đọc thành thực hành. Release cần packet/target riêng.

**6 — pilot:** sau Owner cho phép và nội dung/media thử đủ điều kiện, dùng [protocol hiện có](../ux-implementation-2026-10-14/content/pilot-test-protocol.md): 5–8 người/hai vòng định tính, consent và ghi chú tối thiểu. Vòng 1 thử intro đã duyệt; vòng 2 thử lại bản sửa cùng nội dung đủ điều kiện. Đo hiểu sai, trợ giúp, thời gian chọn, lý do quay lại và giờ biên tập/review; không suy hiệu quả sức khỏe từ completion. Khóa 5–7 bài và AI runtime là quyết định sau pilot.

## Điểm dừng 5.1

Hồ sơ cần QC độc lập → root kiểm pins/link/claim → Owner review. Hiện chưa tuyển người, chạy pilot, xây adapter hay mở catalog/recommendation. Không có cloud/device/env/Auth/SQL/SDK/deploy/browser/media/inference trong phạm vi này. Rollback: không consume hồ sơ hoặc sửa ở lượt review riêng; giữ canonical, candidate 4.7 và evidence cũ. **STOP chờ Owner trước 5.2/6.**
