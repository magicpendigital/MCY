# Hợp đồng nhận dữ liệu cho task UI/UX

18/10/2026 · Canonical nguồn draft: `D:/Projects/MCY/content/yoga-library/`. Consumer phối hợp: local task `01a13665-dd93-76d1-bc45-1fd05b110bf6`. Kho này chuẩn bị dữ liệu; chưa có adapter hoặc runtime import.

## Những gì có thể dùng sau khi tối ưu app

Đọc `inventory.json` cho source catalog và `units/**/rN.json` cho educational units. Khóa source là `(courseId, lessonId, youtubeId)`; khóa bài đọc là `(id, revision, locale)`. Giữ hai không gian ID tách nhau. Một pose family có thể có nhiều biến thể/bản đọc; một clip chuỗi có thể chứa nhiều pose sau annotation. Không join chỉ bằng tên hoặc thứ tự mảng.

Tên trường giữa hai tài liệu có khác nhau: `sourceRefs[].lessonId` ánh xạ đúng vào `inventory.records[].id`, cùng `courseId` và `youtubeId`. `inventory.records[].contentUnitIds` chỉ là backlink về ID bài, **không chọn revision hoặc locale**. Consumer phải chọn tường minh bộ ba và file trong snapshot manifest; không tự lấy revision mới nhất, không dùng nhầm bản preview cũ. Các bản được chọn cho bàn giao này:

| Unit ID | Revision | Locale | Path tương đối với package |
|---|---|---|---|
|mcy.pose.cobra|r1|vi-VN|units/cobra/r1.json|
|mcy.pose.cobra-gentle|r1|vi-VN|units/cobra-gentle/r1.json|
|mcy.pose.cow-face|r1|vi-VN|units/cow-face/r1.json|
|mcy.pose.downward-dog|r1|vi-VN|units/downward-dog/r1.json|
|mcy.foundation.cat-cow|r3|vi-VN|units/foundation-cat-cow/r3.json|
|mcy.foundation.standing|r3|vi-VN|units/foundation-standing/r3.json|
|mcy.pose.high-lunge|r1|vi-VN|units/high-lunge/r1.json|
|mcy.pose.kneeling-backbend|r1|vi-VN|units/kneeling-backbend/r1.json|
|mcy.pose.low-crow|r1|vi-VN|units/low-crow/r1.json|
|mcy.pose.low-wheel|r1|vi-VN|units/low-wheel/r1.json|
|mcy.transition.stand-up|r1|vi-VN|units/stand-up/r1.json|
|mcy.pose.three-legged-dog|r1|vi-VN|units/three-legged-dog/r1.json|
|mcy.pose.warrior-ii|r1|vi-VN|units/warrior-ii/r1.json|
|mcy.pose.wild-thing-high|r1|vi-VN|units/wild-thing-high/r1.json|

Cache bài, bước và ảnh phải gắn đủ `unit.id + revision + locale + step.id/media.id`. Không coi `step.id` hoặc `media.id` là khóa toàn thư viện. Manifest kiểm bytes của snapshot; nó không tự quyết định bản nào được phát hành.

`sourceRefs.relation` hiện là `topic_reference`/`unverified`, `contentObserved:false`. File MOV cục bộ có một số still quan sát riêng không làm quan hệ này thành exact transcript. Không lấy số phút clip hoặc thời gian đọc để suy liều/thời lượng thực hành.

`media.path` là **relative với canonical package**, ví dụ `media/new-poses/downward-dog/downward-dog-photo-1.webp`. `provenance.sourcePath` và `promptRef` là repo-relative để kiểm nội bộ. Không đưa absolute tool paths/provenance nội bộ vào UI người học. Khi chuyển sang media store sau này, adapter phải ánh xạ assetID+SHA sang object key được duyệt; không thay JSON bằng public URL trước review.

## Reader cần đọc đúng trạng thái

| Dữ liệu | Cách tiếp nhận dự kiến |
|---|---|
|title/intro/learningObjectives/audience/prerequisites/preparation/stopGuidance/steps|Dùng đúng tên khóa JSON và thứ tự bước; ảnh không thay thế hướng dẫn chuẩn bị hoặc dấu hiệu dừng. Lựa chọn khác nằm ở `steps[].alternative`.|
|step.id/order/sourceIds/evidenceRefs/mediaIds|Dùng ID, kiểm refs; giữ khung lớn đúng cùng ảnh/alt/caption của bước.|
|media.status=draft_present|Có bytes để reviewer xem, chưa có quyền hiện learner.|
|media.status=not_produced hoặc identity_blocked|Hiện trạng thái thiếu trong workspace biên tập; không tráo ảnh của tư thế khác.|
|productionStatus|Chỉ tiến độ sản xuất, không suy approved/eligible.|
|review pending + approvalRecords[]|Chưa được phát hành. Chỉ backend review được thiết kế riêng mới có thể xác lập review thật.|
|learnerVisible/recommendationEligible=false|Không nhập catalog phát hành và không cho AI chọn.|
|practiceDurationSeconds=null|Bài đọc, không là phiên tập có timing; completion không tạo buổi tập/Hành trình.|

## Các công đoạn còn phải làm

`expansion/catalog.json` là danh mục lập kế hoạch riêng theo yêu cầu bổ sung của Owner, với schema ở cùng thư mục. Các ID của catalog không thay ID source hoặc ID unit. Một entity metadata-only không được tạo card bài học có nút thực hành, thời lượng hoặc trạng thái đã sản xuất. Đọc `expansion/README.vi.md` trước khi xây consumer; kiểm relation và provenance từng tên, không tự nối cùng tên thành exact match. Danh mục có thể tiếp tục mở rộng qua review, không là tuyên bố bao phủ mọi truyền thống yoga.

1. Chốt loại illustrated lesson và exact variant, đối tượng, chuyển vào/ra với chuyên gia yoga; xử lý các blocker của từng unit.
2. Kiểm text, ảnh AI, alt/caption, quyền/provenance; ghi quyết định con người cho exact hash. Không dùng kỹ thuật validator pass thay phê duyệt chuyên môn.
3. Xây adapter trên hướng private teacher collaboration, không trộn registry Owner sample với draft private. Giao reviewer đúng bản và hạn; publisher riêng; nội dung/media đổi cần revision mới và duyệt lại.
4. Thêm reader/editor/tests trên candidate mới sau quyết định tích hợp. Kiểm loading/missing media/revision conflict/revoke/withdrawal/cache/accessibility và privacy theo lifecycle riêng.
5. Chọn release target/artifact theo gate đang có. Kho này không mở native, staging, AI hoặc Production.

## Đồng bộ và giới hạn

Manifest được cung cấp kèm bàn giao cuối; task app phải đối chiếu file/hash/size trước khi dùng. Nếu contract/catalog app thay đổi, lập mapping version mới; giữ các snapshot cũ. Không âm thầm ghi đè nội dung đã duyệt hoặc cập nhật approval từ bản khác. Bản đọc Markdown là generated view, không là nguồn để ingest.

Các `inputs` ở ngoài `content/yoga-library/` là dependencies để audit, **không phải danh sách cần đưa vào app**. Đặc biệt, ảnh chụp frame video trong `analyse/.../private-evidence/` chỉ phục vụ đối chiếu nội bộ; không copy vào bundle/media store của người học. Chỉ media được duyệt và derivative có lineage/hash rõ mới được adapter phát hành tiếp nhận. Ảnh giao cho app là **WebP** (rộng tối đa 1280 px, chất lượng 80; 55 ảnh ≈ 1,9 MiB). PNG master đã lưu ngoài repo (xem `archive-manifest.json`; hash master nằm ở `provenance.sourceSha256`, đường dẫn dạng `archive:…`); chưa chốt byte budget riêng cho mobile.

Hiện kho chỉ ở filesystem chung, không đồng bộ database/cloud và không có quyền phát hành được cấp. Owner đã yêu cầu phối hợp hai task; thông tin path/schema/manifest được gửi qua task message. Việc message gửi thành công không chứng minh task nhận đã import hoặc nghiệm thu dữ liệu.
