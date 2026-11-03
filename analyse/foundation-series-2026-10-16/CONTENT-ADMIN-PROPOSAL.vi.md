# Soạn, duyệt và phát hành “Một chút nền tảng” — đề xuất để đánh giá

16/10/2026 · Bản đề xuất và mô phỏng cục bộ. Chưa thay source ứng dụng, schema, quyền, danh mục, media cloud hoặc trạng thái phát hành.

**Đề xuất:** phát triển không gian tác giả và reviewer từ workflow **Private teacher collaboration** hiện có ở mức local candidate; Owner phân công và thu hồi qua Miu với adapter xác thực được thẩm định riêng. Thêm một quyết định xuất bản tách khỏi duyệt yoga. Series minh họa/ảnh từng bước là một loại nội dung mới, cần schema nội dung và checklist riêng trước khi tích hợp.

## 1. Có nền tảng, chưa có CMS cho loại bài mới

[Báo cáo hiện trạng](CONTENT-ADMIN-CURRENT.vi.md) phân biệt hai hệ thống:

- **A — Owner content review:** có UI/API/SQL và bằng chứng staging có ngày; registry hẹp của bài giới thiệu công khai, Owner hoặc teacher active được giao đúng candidate/version và còn hạn. Chưa chứng minh live positive delegation. Đây là nền tảng tham khảo cho phiếu, thời hạn và audit, chưa phải CMS của series mới.
- **B — Private teacher collaboration:** local candidate có tác giả, snapshot, gửi duyệt và reviewer độc lập. Reviewer cần tư cách chuyên gia đã xác minh, global role phù hợp và phân công máy chủ. Migration/adapter Miu/bootstrap/media private/phát hành còn các gate riêng; không được diễn tả là đã nối hoặc đã mở.

Chọn **B làm hướng phát triển workspace tác giả/reviewer** vì bản nháp phải riêng tư và cần duyệt độc lập. Có thể tái sử dụng khái niệm từ A, nhưng cần một adapter/hợp đồng được review để nối phiên bản và quyết định; không âm thầm cho hai backend cùng ghi một phiếu. Bản preview hiện tại không gọi A hoặc B.

SQL review hiện hành chỉ có `learning_intro` và `practice_session`, cùng một số tiêu chí audio/thời lượng. Bài tư thế bằng hình cần loại dự kiến **`illustrated_lesson`**, tách khỏi buổi thực hành hoàn chỉnh. Không gán `learning_intro` để né duyệt kỹ thuật hoặc nhồi tiêu chí audio không tồn tại. Khi có nhánh thực hành cần nhịp/audio/video, duyệt nhánh đó như một phiên bản/phạm vi riêng.

## 2. Bốn trách nhiệm, quyền có phạm vi

| Trách nhiệm đề xuất | Được làm | Ranh giới |
|---|---|---|
| **Người biên soạn / biên tập** | Soạn bài và từng bước; thêm media nháp; ghi alt, caption, nguồn, quyền, nguồn gốc AI; tạo bản mới, gửi duyệt và đọc nhận xét. | Chỉ nháp được giao hoặc thuộc phạm vi của mình; không tự duyệt chuyên môn hoặc tự xuất bản bài mình soạn. |
| **Người duyệt yoga** | Xem toàn bộ snapshot được giao; kiểm tư thế, đối tượng, chuyển tiếp, điều chỉnh/dừng; yêu cầu sửa hoặc duyệt đúng phiên bản. | Phải có chuyên môn thực, được xác minh phạm vi và độc lập với tác giả. Nhãn role không chứng nhận chuyên môn; không sửa nội dung âm thầm thay tác giả, không có quyền dữ liệu học viên hoặc xuất bản. |
| **Người xuất bản** | Kiểm biên tập, quyền, khả năng tiếp cận và sự khớp phiên bản; chọn bản đã đủ điều kiện để hiển thị; rút hoặc khôi phục một bản còn đủ điều kiện. | Là capability mới được đề xuất, chưa có quyền publisher vận hành hiện tại. Không thay quyết định chuyên môn; không xuất bản bài mình là tác giả. |
| **Owner** | Xác minh người và phạm vi; cấp/thu hồi capability trong series, giao reviewer đúng phiên bản, xem audit, xử lý sự cố và quyết định vận hành. | Owner không mặc nhiên là chuyên gia yoga. Owner muốn duyệt chuyên môn phải được xác minh và độc lập như người khác. Email xác minh hoặc quyền Owner không thay thế căn cứ chuyên môn. |

Pilot nên dùng ba người riêng cho **tác giả → duyệt yoga → xuất bản**, để dễ hiểu trách nhiệm. Owner có thể kiêm vận hành xuất bản nếu có capability máy chủ phù hợp và không là tác giả của bản đó; vẫn cần một người có chuyên môn độc lập.

Đề xuất cấp quyền bằng server-owned grant có người nhận, capability, series/phạm vi, ngày bắt đầu/hết hạn, người cấp và lý do. Phân công duyệt bổ sung **lesson ID + content revision/hash + reviewer + thời hạn**. Cho phép 7/14/30 ngày trong UI pilot, máy chủ tính thời điểm hết hạn; không tin ngày hoặc role do client gửi. Global role, membership, xác minh chuyên môn và assignment là các lớp khác nhau; nhận assignment không tự cấp role toàn hệ thống.

Owner thao tác qua Miu: “Giao Linh duyệt bài 02 bản r3, phạm vi Một chút nền tảng, 14 ngày.” Trước khi ghi, Miu cho xem người nhận, bài/bản, phạm vi, thời hạn và quyền thực sự cấp. Adapter phải giữ danh tính Owner đã xác thực; không nhận `actor_id`/role tự khai từ mô hình. Quyền được kiểm lại ở mỗi read/write/media URL; hết hạn hoặc thu hồi chặn thao tác mới. Mọi thay đổi ghi audit. Không tự cấp quyền qua email, lời mời, switch góc nhìn, nội dung chat hoặc một checkbox chuyên môn.

## 3. Một vòng nội dung rõ ràng

**Draft → Submitted → Changes requested → Draft mới → Submitted → Approved → Published → Retired.** Nhánh yêu cầu sửa có thể lặp; Approved và Published là hai trạng thái khác nhau.

| Trạng thái | Ý nghĩa và hành động tiếp |
|---|---|
| **Draft / Bản nháp** | Tác giả sửa riêng tư. Media mới còn private/quarantine, chưa vào bundle/cdn công khai. |
| **Submitted / Gửi duyệt** | Đóng băng snapshot gồm copy, nguồn, thứ tự, alt/caption và byte media. Owner phân công người có chuyên môn cho đúng snapshot. |
| **Changes requested / Cần sửa** | Reviewer nêu bước, vấn đề và căn cứ. Không sửa đè bản đã gửi; tác giả tạo revision mới và gửi lại. |
| **Approved / Đã duyệt** | Người có chuyên môn độc lập duyệt toàn bộ bản theo đúng phạm vi. Chưa hiển thị người học; publisher tiếp tục kiểm biên tập/quyền/accessibility. |
| **Published / Đã xuất bản** | Hành động riêng của publisher trỏ thư viện tới đúng bản đủ điều kiện. Luồng người học chỉ đọc bản này; không tự biến bài đọc thành buổi tập/gợi ý AI. |
| **Retired / Đã rút** | Gỡ chỉ định hiển thị, ngừng cấp truy cập mới theo chính sách; giữ snapshot, quyết định và audit cho retention đã được duyệt. Không xóa lịch sử để “sửa” sự cố. |

**Đổi một ảnh cũng tạo bản mới.** Ví dụ bộ minh họa Bò–Mèo là r2; chuyển sang 5 ảnh AI mô phỏng tạo **photo-draft r3**, cần đối chiếu lại nội dung, alt, quyền và kỹ thuật. Quyết định r2 không được mang sang r3. Bộ r2 được giữ để đối chiếu, không chỉnh lại bytes/receipts cũ.

Bản nháp r4 không tự gỡ bản r3 đang hiển thị. Phiên bản hiển thị và phiên bản đang biên tập là hai trạng thái riêng, để có thể hoàn thiện mà không đổi nội dung người học đang xem. Nếu r3 bị rút vì an toàn/quyền, gỡ bản hiển thị ngay; không tự fallback tới r2 khi chưa kiểm đủ điều kiện.

## 4. Snapshot và phiếu duyệt phải đủ thông tin

Một snapshot đề xuất chứa: ID bài/series/loại; revision; tiêu đề/mục tiêu/đối tượng/giới hạn; chuẩn bị/dấu hiệu dừng; năm bước hoặc số bước được biên soạn thực tế; thứ tự và chuyển tiếp; text chính/phần mở rộng; từng media có ID/hash, kích thước, nguồn gốc, căn cứ quyền, alt, caption; ngôn ngữ text/audio; tác giả/ngày; sources và thay đổi từ bản trước. Hash cần gắn canonical copy/metadata và bytes của từng media. Đây là **hợp đồng đề xuất**, không phải schema đã được triển khai.

Reviewer cần xem đúng toàn bài, phóng to từng ảnh, so với lời và đọc đường chuyển ở nhịp người học có thể theo. Một checklist yoga cho illustrated lesson gồm: phạm vi người học; nền/điểm tiếp xúc; hướng đầu–cổ–thân–tay–gối/chân; chuyển giữa các hình và điểm dừng; lựa chọn hỗ trợ; giới hạn của hình tĩnh; alt không kể khác pixels. Không dùng một checkbox “đã đẹp” hoặc “đã đọc” làm duyệt kỹ thuật.

**Duyệt yoga** đánh giá kỹ thuật và phạm vi bài. **Duyệt biên tập/hình** đánh giá tiếng Việt, đọc hiểu, bố cục, tính nhất quán và accessibility. **Duyệt quyền** kiểm text, ảnh, audio, giấy phép/consent cần thiết. Ba việc có thể dùng chung workspace nhưng quyết định và người chịu trách nhiệm phải rõ. Bài phổ thông không tự được gọi là đã duyệt lâm sàng; nếu đề xuất mục tiêu phục hồi/nhóm bệnh lý, cần người có chuyên môn lâm sàng phù hợp và phạm vi/hồ sơ riêng trước khi phát hành.

Với ảnh AI mô phỏng người tập: lưu nhãn synthetic/AI-assisted, model/tool và nguồn tài sản phù hợp trong provenance; người học thấy nhãn phù hợp, không hiểu là ảnh chụp giáo viên hoặc người bệnh thật. Ảnh giống thật vẫn phải qua review tư thế, giải phẫu, điểm tiếp xúc, dụng cụ và toàn bộ chuyển tiếp. Nguồn tham khảo kỹ thuật không cấp quyền sao chép ảnh của nguồn và không phê duyệt ảnh AI mới.

## 5. Xuất bản, rút và quay về bản trước

Trước mỗi publish, máy chủ kiểm lại identity, grant publisher/phạm vi/hạn, snapshot tồn tại, reviewer độc lập/căn cứ thật, quyết định đúng hash còn đủ điều kiện, quyền media và kiểm cuối. Chỉ đổi publication pointer sau khi kiểm xong trong một thao tác nhất quán; xử lý conflict/idempotency và trả receipt đúng revision. Bài đã duyệt mà đổi copy/media phải quay vòng, không bypass bằng đổi nhãn version ở client.

Khi thu hồi quyền, lịch sử không bị xóa. Capability hết hạn chặn các thao tác mới. Nếu việc thu hồi làm mất điều kiện chuyên môn/quyền của bản đã duyệt, bản đó mất eligibility; dừng publish mới và rút publication pointer liên quan theo quy tắc đã được phê duyệt. Mock hiện minh họa quy tắc thận trọng này cho assignment reviewer. Cần chốt chính sách runtime về expiry thông thường so với rút căn cứ an toàn trước khi tích hợp; không coi nút “hết hạn” trong mock là cơ chế production đã có.

**Rút bản:** gỡ bản khỏi thư viện và gợi ý liên quan, chặn URL mới và làm rõ giới hạn URL/cache/offline đã phát hành. Signed URL đã cấp có thể còn dùng đến TTL; phải đo và xử lý cửa sổ đó. Không hứa xóa ngay bản đã tải trên thiết bị. Retention, quyền xem lịch sử và cache/offline là việc phải thiết kế và kiểm trên hệ thật.

**Quay về bản trước:** một hành động publish mới tới một snapshot cũ còn được duyệt, còn quyền, phù hợp phạm vi và không có lý do rút chưa giải quyết. Ghi lý do/người thao tác/phiên bản trước–sau. Không phục hồi tự động một bản bị rút vì kỹ thuật hoặc bản quyền. Nếu không có bản đủ điều kiện, hiển thị trạng thái bài tạm không có thay vì tự chọn nội dung khác.

## 6. Media nháp riêng tư và hàng đợi đúng quyền

Không import nháp giáo viên hoặc ảnh chưa duyệt vào registry/client bundle công khai. Đề xuất pipeline upload private/quarantine → kiểm kiểu nội dung bằng bytes, kích thước và kiểm an toàn → hoàn tất gắn bản → reviewer URL có thời hạn → artifact xuất bản đã kiểm. Kiểm quyền và object ownership tại lúc cấp upload, finalize, download; kiểm thu hồi ở giữa các bước và chặn object key của người khác. Đây là phạm vi mới, không được suy từ việc schema nền có bảng media.

Ở queue reviewer, chỉ tải các bài/phiên bản được giao còn hiệu lực. Khi queue tải hoặc thay đổi, chọn **candidate đầu thật sự có quyền**; nếu mục đang chọn không còn hợp lệ thì bỏ lựa chọn và hiện empty state. Không khởi tạo candidate đầu toàn registry rồi lọc options riêng, vì sẽ tạo màn trống hoặc lựa chọn không có quyền khi người duyệt chỉ nhận bài mới. Chặn truy cập trực tiếp bằng ID lạ ở server, không dựa vào dropdown.

## 7. Bản mô phỏng đang có

[Mở admin-preview.html](admin-preview.html). Ba góc nhìn là công cụ xem thiết kế: **Người biên soạn**, **Người duyệt yoga**, **Vận hành nội bộ (mô phỏng)**. Chúng không thay đổi identity hoặc quyền thật.

Tình huống giả định: Hà soạn bài 02; Linh được giao duyệt photo-draft r3 trong 14 ngày; Mai là publisher độc lập do Owner cấp capability có phạm vi trong giả định. Có thể thử yêu cầu sửa, sửa thành r4, gửi lại, giao đúng bản, duyệt yoga, ghi kiểm cuối, xuất bản/rút bản và thu hồi/hết hạn phân công. Mỗi thao tác chỉ đổi state trong bộ nhớ; tải lại sẽ reset. Nút publish không cập nhật reader thật, ứng dụng, cloud hoặc catalog. Bộ r2 vẫn có thể mở trong phần lịch sử.

Đây không phải một Owner dashboard mới được triển khai. MCY hiện đã có panel Owner content-review hẹp của A; hướng đề xuất B giữ Owner ops/report qua Miu như quyết định đã ghi. UI vận hành trong mock giúp đánh giá thông tin/ý nghĩa thao tác, không quyết định thay vị trí sản phẩm cuối cùng.

## 8. Thứ tự tích hợp được đề xuất

1. Chốt loại illustrated lesson và vai trò chuyên môn/publisher; duyệt nội dung thật cho một bài pilot, ảnh/alt/quyền và phạm vi thực hành.
2. Chốt hợp đồng phiên bản–review–publication, chính sách expiry/withdrawal/retention, private media và adapter Miu; độc lập review model quyền trước triển khai.
3. Làm editor/reviewer in-app trên B, queue đúng quyền, diff text/media, kiểm chuyên môn và kiểm biên tập tách nhau. Không trộn registry A với nháp private khi chưa có adapter review.
4. Kiểm offline với vai trò giả, sau đó staging theo operation được duyệt riêng: learner/outsider/author A-B/reviewer/publisher/Owner; assignment sai bản, hết hạn/thu hồi, self-approval, sửa sau duyệt, media URL và rollback/withdrawal. Kiểm deny ở server, không chỉ khóa nút UI.
5. Khi đã có duyệt chuyên môn và quyền thật, mới chọn release artifact/target. Catalog thực hành, AI recommendation, native và Production vẫn là các quyết định riêng.

Lượt hiện tại dừng ở proposal + mock cục bộ theo yêu cầu xem trước. Không có role grant, SQL, upload, lời mời, API, inference hay deploy nào trong bản mô phỏng này.

## Căn cứ nội bộ đã đọc

- [Hiện trạng nguồn và bằng chứng có ngày](CONTENT-ADMIN-CURRENT.vi.md).
- [Content review hiện có](../../docs/content-review/README.md), `ContentReviewPanel.tsx`, `contentReviewContract.ts`.
- [Private teacher collaboration local candidate](../../docs/teacher-collaboration-local-mvp.md), `TeacherCollaborationPanel.tsx`, handler `teacherCollaboration.ts`.
- [MCY brand/UX](../../skills/mcy-brand-ux/SKILL.md) và [risk/review matrix](../../skills/mcy-change-review/references/review-matrix.md).

Không kiểm live quyền, roster, ACL, deployment, media bucket hoặc reviewer hôm nay. Bằng chứng local không xác nhận những khả năng này đang hoạt động trên server.

Tài liệu nền tảng chính thức đã đối chiếu cho phương án kiểm quyền: [Supabase — Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security) và [Storage access control](https://supabase.com/docs/guides/storage/security/access-control). Các tài liệu này giải thích cơ chế; không xác nhận cấu hình MCY hoặc thay kiểm actor trên server thật.
