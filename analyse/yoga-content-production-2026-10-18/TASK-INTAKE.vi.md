# Nhận việc sản xuất nội dung yoga — 18/10/2026

## Quyết định và phạm vi

Owner yêu cầu tiếp tục sản xuất toàn bộ tư thế, lưu dữ liệu đồng bộ task UI/UX `01a13665-dd93-76d1-bc45-1fd05b110bf6`. Root đã đọc task bằng read_thread: task đang thực hiện responsive4.7 trên candidate riêng; nhánh foundation/CMS chưa tích hợp. Tin phối hợp đã gửi thành công sau một lần automatic-review timeout; không có grant/deploy được yêu cầu. Câu hỏi tùy chọn về mở rộng danh mục còn chờ; mặc định lấy toàn bộ inventory app hiện có, không tuyên bố bao phủ mọi trường phái yoga.

Kết quả: một kho **bản nháp có cấu trúc**, version/nguồn/media/status rõ và manifest, để task UX đọc sau tối ưu. Nguồn canonical clip là38 record của freeCourses.ts, không phải38 tư thế. Sản xuất nội dung cho13 record nhóm poses, giữ biến thể riêng và không tự biến chuỗi/chủ đề chưa annotation thành tư thế mới. Hai bài foundation trước được nhập có provenance, không sửa bản16Oct. Nội dung mới là nguyên tác biên soạn có AI hỗ trợ, không tự coi là transcript video. Nhãn quan sát/định danh chưa chắc phải có blocker; không dựng cue/ảnh kỹ thuật tự tin từ tên mơ hồ.

Đầu ra canonical đề xuất **`content/yoga-library/`**, ngoài src/public/candidate. JSON là nguồn chính, Markdown sinh từ JSON. Hồ sơ, công cụ, kiểm và QC ở `analyse/yoga-content-production-2026-10-18/`. Nếu task UX yêu cầu contract khác, làm adapter riêng sau khi đối chiếu, không thay schema runtime trong lượt này.

Không đổi app/candidate UX/runtime/RPC/schema/cloud/role/Auth/consent/AI configuration, không publish/upload/deploy/install. Không đưa nháp vào reviewedPracticeCatalog hoặc bundle học viên. Không tạo tên reviewer, approval hoặc quyền hư cấu. Không mở automation hoặc mua credit.

## Baseline và tác động

Checkout dirty của nhiều luồng; chỉ sở hữu hai thư mục mới nói trên. `CONTRACT-INTAKE.vi.md` và `EDITORIAL-INTAKE.vi.md` ghi source/hashes và38ID. Root và UX4.4–4.7 có cùng bytes của freeCourses/practiceContract/contentReviewCandidates/reviewedPracticeCatalog; catalogue reviewed vẫn đóng. Foundation có10photoAI và10illustration; chưa chuyên môn/quyền. Có13MOV gốc nhóm Tư thế lẻ, chỉ xem local để hiểu hình, không tái phân phối làm tài sản học viên. Tooling failures và private viewer giữ trong evidence riêng.

| Nguồn/đường vào | Thay đổi | Consumer/bảo toàn | Kiểm tương ứng |
|---|---|---|---|
|38 clip + CSV|inventory/crosswalk JSON|ID/group/YouTubeID/title/duration/captions nguyên trạng|Đối chiếu từng field,38unique; mutation negative|
|Foundation16Oct|bao gói revision, media/provenance|copy/alt/caption/PNG gốc không sửa|Hash/preimage, compare mapped text, media path/hash/dimensions|
|13 pose records + nguồn primary + quan sát media|bản đọc/steps và storyboard; identity uncertainty rõ|không suy độ khó/điều trị, không giả transcript/teacher|Peer editorial review, exact sources, transition/alt/stop/limits; human expert BLOCKED|
|Kho JSON/schema/validator|contract draft mới|reader/CMS tương lai chưa có adapter|Required fields,unique/order/refs/path/hash, negative reject publish/approval/fake media|
|Manifest/handoff|gói có pins + coverage|taskUX nhận đúng source/path/version/status|Final freeze + independent QC + root verify, gửi path/hash|
|App/Auth/roles/health persistence/native/cloud|không đổi/không gọi|nativeHALTED/webreleasegate và38catalog giữ nguyên|NOT_APPLICABLE app suite vì không import; pin4shared source trước/sau|

Rủi ro cao nhất **R3** do nội dung tư thế và media, dù chỉ là bản nháp. Việc reviewer con người xác minh chuyên môn/quyền còn BLOCKED cho phát hành. Không hạ gate vì local JSON pass. Quan sát vài frame không là duyệt toàn video/audio.

## Hợp đồng và nghiệm thu local

- Kho có inventory đầy đủ38record, sourceRefs explicit `topic_reference`/`unverified`, bảng coverage không đánh đồng metadata với bài hoàn tất.
- Unit có stableID/revision/locale/kind, audience/prerequisites/preparation/objectives/stop/entry/exit/alternatives/steps/sources và source relation rõ. Read-time estimate tách practice duration null.
- Flags bắt buộc `learnerVisible:false`, `recommendationEligible:false`, `publishStatus:unpublished`; review pending, approvalRecords rỗng. Chưa có ảnh thì media path/hash null + brief/blocker, không dùng ảnh sai làm placeholder. Bộ ảnh cũ chỉ map đúng bài/bước, có AI disclosure.
- Bản brief/metadata chưa có hướng dẫn hoặc ảnh được đếm riêng, không ghi ready-to-publish. Phạm vi nội dung không xác định thì giữ blocker thay đoán.
- Validator cục bộ và negative fixtures phải có process exit. Chọn catalog test hiện có để xác nhận fail-closed, không chạy Auth/UI toàn repo không liên quan. Package scripts/testMatch đã được agent intake đọc; app build/runtime/Sites NOT_APPLICABLE khi source không đổi.

## Phân công và gate

Root điều phối/intake/freeze/final verify. `content_contract_intake` triển khai schema/import/inventory/validator theo file ownership sau GO. Worker biên tập chỉ sửa units được giao. Worker media chỉ sửa media/metadata được giao sau xác định pose. Reviewer độc lập không tự duyệt chuyên môn; đọc frozen data và test negative riêng. Root phải đọc artifact và đối chiếu thực tế trước handoff; không suy hoàn tất từ báo cáo worker.

Rollback: không consume kho mới; nguồn16Oct và app giữ nguyên. Stop khi cần đoán identity, cue không có cơ sở, hoặc quyền/nguồn không rõ; ghi mục BLOCKED và tiếp tục phần độc lập. Sửa contract hoặc phạm vi sau intake phải có addendum/freeze mới và QC lại. External effects duy nhất được phép trong scope hiện tại: đọc primary web sources, quan sát video local, sinh ảnh AI draft khi có brief xác định; không app inference hoặc phát hành. Chi phí/credit ngoài tool hiện có không được mua.

Trạng thái intake: root đã đối chiếu hai intake phụ và lifecycle; chờ independent intake QC trước GO triển khai. Chưa có verdict chuyên môn, live hoặc release.
