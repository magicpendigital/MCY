# Ledger tiếp nhận nội dung nháp — snapshot 5.1

Nguồn là [canonical handoff](../../content/yoga-library/INTEGRATION-HANDOFF.vi.md), [inventory](../../content/yoga-library/inventory.json) và 14 JSON unit được chọn. [Receipt](SNAPSHOT-RECEIPT.json) giữ full SHA-256, 38 khóa clip, 14 bộ ba unit, 13 sourceRef và số liệu media của lần đọc này; [baseline](BASELINE.json) giữ hash 18 file metadata/unit ở hai lượt đọc trước. Đây là **consumer index của draft đang sửa**, không phải bản sao catalog, manifest cuối, quyền phát hành hoặc review chuyên môn. Khi upstream gửi manifest cuối hoặc đổi file, cần snapshot mới; không cập nhật ngầm ledger này.

## Hai không gian ID và 38 clip tham khảo

Khóa clip là `(courseId, lessonId, youtubeId)`, trong JSON inventory dùng `records[].id` cho `lessonId`. Duration dưới đây chỉ là metadata clip, **không phải thời lượng thực hành**. Toàn bộ 38 record có rights/expert `pending`, caption `channelCaptionsVerified=false` và không có ngôn ngữ caption được xác minh trong snapshot. Không suy transcript, safety hoặc quyền biên tập/tái phân phối từ `unlisted` hay tên. `contentUnitIds` ở inventory là backlink, không chọn revision. Mỗi hàng dẫn về [inventory gốc](../../content/yoga-library/inventory.json); receipt lưu khóa chính xác để tra cứu, không lặp title/description/video content.

| courseId | lessonId | youtubeId | duration metadata | backlink unit ID nếu có |
|---|---:|---|---:|---|
|gentle|01|yKm7aOAWn-k|0:43|—|
|gentle|02|mjxV5BTR5jA|1:04|—|
|gentle|03|8KKUtPicnX0|0:53|—|
|gentle|04|lJkD5OsUs4E|0:36|—|
|gentle|05|XPk59lYaNzU|1:00|—|
|gentle|06|BSiC_g5FmRI|0:17|—|
|gentle|07|I5pwMv2jYT4|0:20|—|
|gentle|08|OJEzzRobrWQ|0:37|—|
|gentle|09|Ie55V8b4sD4|0:45|—|
|gentle|10|GQrO8VFJhss|0:34|—|
|gentle|11|uLVYaURNcsM|0:22|—|
|gentle|12|Gc8zn8NcCVk|0:25|—|
|gentle|13|CVjhYYhpn3o|0:30|—|
|gentle|14|_DttB5pLYjk|0:58|—|
|gentle|15|-o-0h5H0_2I|0:50|—|
|gentle|16|NxSbVNT_D-Y|0:28|—|
|gentle|17|67PlLgpEpnU|0:23|—|
|gentle|18|DLnOXS8BgJw|0:27|—|
|poses|19|McOZ1FW5jBM|0:24|mcy.pose.kneeling-backbend|
|poses|20|54IPJkU7f_o|0:35|mcy.pose.cobra-gentle|
|poses|21|KtMlgK2cjsU|0:49|mcy.pose.cobra|
|poses|22|0fs1LCnK3-U|0:39|mcy.pose.low-crow|
|poses|23|p3sKiK8szF8|0:53|mcy.pose.wild-thing-high|
|poses|24|DOmYgUoQyZI|0:38|mcy.transition.stand-up|
|poses|25|CwhLdstN0dc|0:53|mcy.pose.downward-dog|
|poses|26|oFWjSKxXvKY|0:46|mcy.pose.high-lunge|
|poses|27|rWl5ySBsrG0|0:35|mcy.foundation.cat-cow|
|poses|28|6Y-eWBnD8r8|0:54|mcy.pose.low-wheel|
|poses|29|wnenFwBE5oY|0:48|mcy.pose.cow-face|
|poses|30|wYiSFpP7vjs|0:33|mcy.pose.three-legged-dog|
|poses|31|gkiWrw9hREU|0:47|mcy.pose.warrior-ii|
|sequences|32|6DwXHdN_ccg|0:22|—|
|sequences|33|f7UfRc4TKdM|0:21|—|
|sequences|34|ZV-eHhsNlgo|0:21|—|
|sequences|35|npBdMvsuIto|0:19|—|
|sequences|36|jgQLZsoIDKc|0:21|—|
|sequences|37|rSOEcU1xGYA|0:21|—|
|sequences|38|AfMciZa5npw|0:18|—|

## 14 unit đọc được handoff chọn rõ revision/path

Khóa đọc là `(id, revision, locale, path)` như [handoff](../../content/yoga-library/INTEGRATION-HANDOFF.vi.md), không suy `latest` từ `contentUnitIds`. Prefix SHA trong bảng để rà mắt; full SHA nằm ở receipt/baseline. Cột media là **draft_present / identity_blocked / not_produced** của slot được khai báo trong JSON, không phải số file vật lý hoặc giấy phép phát hành.

| Unit ID | revision / locale | JSON path | SHA-256 prefix | media slots | production |
|---|---|---|---|---:|---|
|mcy.pose.cobra|r1 / vi-VN|[units/cobra/r1.json](../../content/yoga-library/units/cobra/r1.json)|63febd72a595|5 / 0 / 0|media_draft|
|mcy.pose.cobra-gentle|r1 / vi-VN|[units/cobra-gentle/r1.json](../../content/yoga-library/units/cobra-gentle/r1.json)|d0491edfaefa|0 / 0 / 5|editorial_draft|
|mcy.pose.cow-face|r1 / vi-VN|[units/cow-face/r1.json](../../content/yoga-library/units/cow-face/r1.json)|11410eb99910|5 / 0 / 0|media_draft|
|mcy.pose.downward-dog|r1 / vi-VN|[units/downward-dog/r1.json](../../content/yoga-library/units/downward-dog/r1.json)|452299229d75|5 / 0 / 0|media_draft|
|mcy.foundation.cat-cow|r3 / vi-VN|[units/foundation-cat-cow/r3.json](../../content/yoga-library/units/foundation-cat-cow/r3.json)|aaa9cec5ac78|10 / 0 / 0|media_draft|
|mcy.foundation.standing|r3 / vi-VN|[units/foundation-standing/r3.json](../../content/yoga-library/units/foundation-standing/r3.json)|f208ff64d776|10 / 0 / 0|media_draft|
|mcy.pose.high-lunge|r1 / vi-VN|[units/high-lunge/r1.json](../../content/yoga-library/units/high-lunge/r1.json)|78135b89cbc9|5 / 0 / 0|media_draft|
|mcy.pose.kneeling-backbend|r1 / vi-VN|[units/kneeling-backbend/r1.json](../../content/yoga-library/units/kneeling-backbend/r1.json)|461ee017f41a|0 / 5 / 0|editorial_draft|
|mcy.pose.low-crow|r1 / vi-VN|[units/low-crow/r1.json](../../content/yoga-library/units/low-crow/r1.json)|0536caa4f45a|0 / 5 / 0|editorial_draft|
|mcy.pose.low-wheel|r1 / vi-VN|[units/low-wheel/r1.json](../../content/yoga-library/units/low-wheel/r1.json)|29d87457775d|0 / 5 / 0|editorial_draft|
|mcy.transition.stand-up|r1 / vi-VN|[units/stand-up/r1.json](../../content/yoga-library/units/stand-up/r1.json)|1a1c68e89af7|0 / 5 / 0|editorial_draft|
|mcy.pose.three-legged-dog|r1 / vi-VN|[units/three-legged-dog/r1.json](../../content/yoga-library/units/three-legged-dog/r1.json)|60ed4d0c1f19|0 / 0 / 5|editorial_draft|
|mcy.pose.warrior-ii|r1 / vi-VN|[units/warrior-ii/r1.json](../../content/yoga-library/units/warrior-ii/r1.json)|e666a51c0cf8|5 / 0 / 0|media_draft|
|mcy.pose.wild-thing-high|r1 / vi-VN|[units/wild-thing-high/r1.json](../../content/yoga-library/units/wild-thing-high/r1.json)|1f3780456235|0 / 5 / 0|editorial_draft|

Trong snapshot có **13 sourceRefs**, mỗi ref match đúng một triple inventory; `relation=topic_reference`, `contentObserved=false`. `mcy.foundation.standing` không có sourceRef; không tự ghép theo tên. Bản unit hiện là đọc/giải thích (`practiceDurationSeconds=null` cả 14), `learnerVisible=false`, `recommendationEligible=false`, `approvalRecords=[]`; không biến thành buổi tập, Journey, AI selection hoặc catalog. 14 unit: 7 `media_draft`, 7 `editorial_draft`.

Media: **80 slot khai báo = 45 draft_present + 25 identity_blocked + 10 not_produced**. 45 đường dẫn `draft_present` là relative trong canonical package và hash file thực khớp SHA khai báo tại thời điểm receipt. Filesystem hiện có **46 file** trong `media/`, là chỉ số khác: có ledger/asset ngoài đếm slot, không gọi 46 ảnh được duyệt. Không copy ảnh, provenance nội bộ hoặc frame private-evidence vào app. `draft_present` vẫn chỉ là nháp cho reviewer; blocked/missing phải ở trạng thái thiếu, không tráo ảnh.

Điểm chặn hiện tại: final manifest upstream PENDING; rights/caption/expert review clip chưa xong; unit/media approvals không có; phạm vi teacher-review, editorial VI/accessibility và quyền theo exact version/hash chưa được xác nhận. `COVERAGE.vi.md` chỉ là generated view đang lạc nhịp, không dùng làm nguồn ingest. [Bước tiếp/brief](NEXT-STEPS.vi.md) phân loại clip–unit đọc–buổi–khóa và chỉ định người/gate; không sinh nội dung sức khỏe.
