# Kho nội dung yoga — nguồn bản nháp chung

Kho JSON này là nguồn nội dung dùng chung để chuẩn bị tích hợp sau nhánh tối ưu UI/UX. **Chưa phải thư viện phát hành hoặc nội dung được phép dùng để gợi ý/thực hành.** Chuyên môn, quyền, biên tập và accessibility còn chờ duyệt; không có approval tự sinh.

- `inventory.json`: đủ38 source clip của app; giữ nguyên group + ID + YouTubeID và metadata. Đây không phải38 tư thế hoặc38 bài mới hoàn tất.
- `units/<tên>/rN.json`: nguồn chính của từng bài đọc. ID ổn định nằm trong JSON; revision là bản nội dung, không là trạng thái phát hành. Hai bài foundation cũ có alias và provenance để giữ đối chiếu.
- `media/`: ảnh nháp AI có SHA, alt/caption và disclosure theo từng bước. Tài sản chưa tạo được giữ path/hash null cùng brief và blocker, không dùng ảnh sai làm placeholder.
- `readable/` và `COVERAGE.vi.md`: bản đọc và thống kê **sinh từ JSON**; không sửa copy ở đây.
- `expansion/`: danh mục mở rộng tư thế, biến thể, kỹ năng và kiến thức theo phạm vi bổ sung của Owner; chỉ metadata có nguồn, chưa là bài đọc hoặc ảnh đã sản xuất. Dùng contract riêng của catalog, không parse như unit.
- `contract.jsonschema`: hợp đồng draft riêng. Không phải `CourseLesson`, `PracticeSession` hoặc API CMS hiện hành.
- `manifest.json`: snapshot cuối được root chọn, gồm file/hash/size và dependency. Không tự chứa hash chính nó. Xem hồ sơ QC/handoff để biết manifest đã được kiểm tới phạm vi nào.

Tất cả unit giữ `learnerVisible:false`, `recommendationEligible:false`, `publishStatus:"unpublished"`, thời lượng thực hành null và bốn review pending. Một bài có đủ chữ/ảnh chỉ là hoàn tất khâu sản xuất nháp, không được gọi là đã thẩm định.

Các bài mới dùng cách **đọc và quan sát** tư thế; không tự biến hình tĩnh thành một buổi tập hoàn chỉnh. Một số biến thể chịu lực hoặc chuyển động phức tạp còn chặn phần vào/ra và ảnh vì thiếu căn cứ chuyên môn. `sourceRefs` là liên hệ chủ đề, không phải transcript video. `sourceObservations` chỉ ghi những still thực sự đã xem, không giả đã xem/nghe toàn clip hoặc xác nhận file MOV tương ứng chính xác YouTubeID.

Mở [danh sách bài đọc](COVERAGE.vi.md) để xem từng bài và số media thực có, hoặc [danh mục mở rộng](expansion/README.vi.md) để xem các mục dự kiến. Danh mục mở rộng là một nguồn lập kế hoạch có thể bổ sung, không tuyên bố một danh sách hữu hạn bao phủ mọi truyền thống và mọi biến thể yoga.

## Đồng bộ với nhánh app

Task liên quan: `01a13665-dd93-76d1-bc45-1fd05b110bf6` (local). Nội dung được Owner yêu cầu chuẩn bị song song khi task này tối ưu app. App/candidate4.7 không được sửa hoặc tự import nội dung từ kho này.

Hợp đồng bàn giao ở [INTEGRATION-HANDOFF.vi.md](INTEGRATION-HANDOFF.vi.md). Task app cần đọc đúng canonical folder và manifest; không dùng các JSON/JS preview16Oct làm một nguồn thứ hai. Alias `standing`/`tabletop` và clip IDs01–38 được giữ để adapter có thể ánh xạ tường minh. Bài đứng tĩnh không bị gán vào clip đứng lên.

Trước tích hợp thật: chốt review chuyên môn và quyền cho exact snapshot/media; xây adapter/editor/reader/CMS với intake riêng; kiểm lại loại nội dung, private media, role/version/withdrawal và các gate phát hành. Không đổi review pending thành approved để tiện thử giao diện. Cần fixture thì tạo dữ liệu giả tách riêng, có nhãn.

## Công cụ local

Các script ở `analyse/yoga-content-production-2026-10-18/`:

1. `sync-inventory-backlinks.mjs` cập nhật crosswalk từ các sourceRefs có thật; không đổi source clip.
2. `validate-library.mjs` kiểm contract, references, bytes/provenance và trạng thái đóng.
3. `validate-library.test.mjs` kiểm trường hợp sai bằng dữ liệu giả.
4. `render-library.mjs` sinh bản đọc, `--check` phát hiện lệch.
5. `create-manifest.mjs --write` và `verify-manifest.mjs` đóng/kiểm snapshot sau khi root chốt dữ liệu; không chạy freeze khi worker còn đang sửa.

Những kiểm tra này không xác minh chuyên môn yoga hoặc quyền thật. Ảnh và video gốc của giáo viên không được nhập vào kho để làm hình người học hoặc làm likeness reference. Các still nghiên cứu chỉ giữ trong `analyse/.../private-evidence/`, ngoài learner assets.
