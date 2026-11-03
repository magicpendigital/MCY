# QC độc lập intake — sản xuất nội dung yoga18/10/2026

Reviewer: `/root/content_independent_qc`, độc lập với root điều phối và hai tác giả intake. Đây là kiểm kỹ thuật/phạm vi/luồng dữ liệu của intake, **không phải chuyên gia yoga, thẩm định y khoa hay chấp thuận quyền media**. Không sửa dữ liệu/source, không gọi cloud, không sinh ảnh và không tự đọc referenced chat; root chịu trách nhiệm phần truy xuất/phối hợp chat.

## Kết luận cho bước hiện tại

**PASS cho intake để bắt đầu sản xuất kho nháp local trong phạm vi đã định.** Không có P1/P2 chưa giải quyết ngăn việc làm inventory/schema/validator/import foundation hoặc soạn bản nháp có nguồn và blocker. Hướng dẫn/ảnh cho biến thể chưa xác định vẫn phải chờ evidence quan sát như intake đã quy định. Đây không phải clearance đưa nội dung ra người học; expert/rights/accessibility/editorial release gates vẫn **BLOCKED**.

Root được tiếp tục scope hiện có, không cần xin lại quyền cho việc soạn nháp có thể đảo ngược. “Tất cả” trong intake được ghi trung thực là38 record nguồn hiện có, với13 record nhóm poses ưu tiên sản xuất; chưa tuyên bố toàn bộ tư thế của mọi hệ yoga hoặc38 bài hoàn tất.

## Inputs đã đối chiếu

| Input | SHA256 tại thời điểm đọc |
|---|---|
|TASK-INTAKE.vi.md|`f7c32a7fadfb2020ba1cea1e38d290c5c982161bd6a2627e24f0a540bd6082e4`|
|CONTRACT-INTAKE.vi.md|`3bb5d511c92fc1d7d0736fd357eced4000f84c32ebaecdfeace5b1389bc66b7f`|
|EDITORIAL-INTAKE.vi.md|`92f7644dff3a759c792b80765ce6c59ac1bb9bd35fdce412c84132e53b7c5394`|

Đã đọc lifecycle, QC template, hai skill MCY/review matrix, AGENTS phần giới hạn hiện tại, brand/design/tokens và dirty status. Đã trực tiếp đọc `freeCourses.ts`, `practiceContract.ts`, `contentReviewCandidates.ts`, `reviewedPracticeCatalog.ts`; kiểm existence hai foundation JSON và overlay photo. Không dùng HEAD của dirty checkout làm identity của intake.

| Kiểm intake | Cách kiểm / môi trường | Kết quả và giới hạn |
|---|---|---|
|38 record/ID/YouTubeID|PowerShell regex trên source canonical local; process exit0|**PASS:**38/38/38 unique.18gentle/13poses/7sequences đối chiếu source. Không chứng minh identity của từng video.|
|4 shared source pins|`Get-FileHash … -Algorithm SHA256`, process exit0|**PASS:** cả bốn khớp intake: freeCourses`92cfc2…5436`, practiceContract`e52deb…0e17`, candidates`97b1cf…0ffe`, reviewedCatalog`119d31…1f1e`. Reviewer không tự đối chiếu bốn candidate UX; phần đó là evidence của tác giả intake/root.|
|Tách draft khỏi live consumer|Đọc source contract/catalog/candidate + impact map|**PASS:** catalog thực sự rỗng; candidate hiện chỉ preparation learning_intro; intake không đề nghị import draft vào app/runtime.|
|Nguồn, giới hạn, quyền|Đọc bảng38 và source-map, foundation/media overlay|**PASS cho cách đặt scope:** topic_reference khác transcript, không suy quyền từ link công khai, AI media có disclosure. Không tự xác minh web/video/yoga trong lượt QC intake.|
|Gate R3 và rollback|Đọc intake/lifecycle/matrix|**PASS:** R3 được giữ, reviewer người thật còn thiếu; rollback local là không consume package. Không có kế hoạch grant/deploy/native hoặc sửa khóa.|
|App suite/live/native|Không gọi vì không đổi các surface này trong bước intake|**NOT_APPLICABLE** cho R0 intake; không dùng suite fixture thay chuyên môn. Final package vẫn cần validator/frozen data/negative cases/QC riêng.|

## Điểm cần thực hiện trong production/final freeze

1. **Một nơi canonical duy nhất.** CONTRACT-INTAKE mục layout còn ghi đường đề xuất trong`analyse/…`; TASK-INTAKE đã chọn`content/yoga-library/`làm canonical. Root choice rõ và supersede đề xuất cũ nên không chặn bước local. Khi tạo README/schema/manifest, ghi rõ quyết định này, để công cụ/evidence ở`analyse/…`, không tạo hai bản JSON cùng là nguồn chính. Markdown phải sinh từ JSON.
2. **Binding nguồn cho cue/variant.** Danh sách nguồn chung chưa đủ chứng minh một bước hoặc posture exact. Unit/step mới phải có source/evidence refs thực dùng; khi dựa vào media local cần nêu file/source identity và timestamps/frames đã thực sự quan sát, tách khỏi transcript/audio chưa nghe. Tên mơ hồ giữ identity blocker; không biến URL pose-family thành xác nhận clip hoặc đường vào/ra. Đây là tiêu chí kiểm artifact, không phải yêu cầu đã phải soạn dữ liệu trong intake.
3. **Coverage không gộp trạng thái.** Báo cáo cuối tách38 source records,13 pose-group records, unit có hướng dẫn, brief/metadata-only và media còn thiếu. Nếu identity chưa đủ, nói phần việc ấy còn BLOCKED; không dùng count đủ38 để nhận đã sản xuất đầy đủ38 bài.
4. **Validator là control cần được kiểm độc lập.** Final freeze phải chứa schema/validator/test inputs và manifest; negative cases cần thực sự reject learner/publish/approved flags, drift/hash/path/media refs và source mapping. Review này chưa đọc validator chưa tồn tại, không cho verdict trước.

## Rủi ro còn lại và handoff

R3 của copy/ảnh tư thế không hạ thành R0 vì lưu local. Dữ liệu sai giải phẫu/cue hoặc tự tin vào variant sai vẫn có thể bị consumer tương lai dùng sai; flags cố định, provenance và adapter gate cần đồng thời tồn tại. Chuyên gia yoga/quyền/khả năng tiếp cận chưa được xác nhận. Không có danh tính reviewer thật hay approval record mới.

QC intake hoàn tất. Reviewer chờ final frozen package để đọc dữ liệu thực, chạy validator/negative case và kiểm manifest/no-import. Root phải thực hiện final verification riêng trước handoff sang UX; verdict hiện tại không tự mang sang bytes mới hoặc app integration.
