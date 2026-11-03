# Queue kỹ thuật 5.2 — nguồn cần người thật xem

Đây là chỉ mục giao review, **không phải quyết định review**. [REVIEW-SNAPSHOT.json](REVIEW-SNAPSHOT.json) chốt tại thời điểm đọc các khóa/hash/path của 38 clip, 14 unit và 80 media slot; [handoff canonical](../../content/yoga-library/INTEGRATION-HANDOFF.vi.md) giải thích hợp đồng nguồn. Nội dung text/ảnh thật chỉ đọc ở canonical, không được nhân bản trong packet này. Owner đã báo **đã chọn người nhưng sẽ cung cấp tên và phạm vi** (`OWNER_REPORTED_SELECTED_DETAILS_PENDING`); ô danh tính/phạm vi/năng lực/tính độc lập và mọi kết luận chuyên môn/quyền vẫn **CHỜ CHI TIẾT / BLOCKED**. [Packet cho người phụ trách](HUMAN-REVIEW-PACKET.vi.md) là nơi ghi câu hỏi và evidence cần xin, chưa phải CMS hoặc assignment thật.

## Cách tra snapshot

- `sourceRecords[]` trong receipt liệt kê đủ 38 khóa `(courseId, lessonId, youtubeId)` cùng backlink `linkedUnitIds`; [inventory gốc](../../content/yoga-library/inventory.json) giữ metadata/title/video. Chia nhóm: 18 `gentle`, 13 `poses`, 7 `sequences`. Không tự coi 38 clip là 38 tư thế/buổi. `sourceRefs[]` của 14 unit có 13 khóa join chính xác một inventory record; quan hệ `topic_reference`, `contentObserved=false`, không phải transcript hoặc giáo viên đã xem hết video.
- `units[]` là đúng bộ `(id, revision, locale, path, SHA-256)`. Người review mở đúng JSON có hash trong receipt; không lấy revision mới nhất hay ghép theo tên. `mcy.foundation.standing` không có sourceRef; không tự gán clip đứng lên. `contentUnitIds` chỉ backlink.
- `media[]` có từng `(unitId, revision, locale, stepId, mediaId, status, path, declaredSha256, actualSha256)`. Lọc theo `unitId` để mở asset relative trong `content/yoga-library/`; `draft_present` đã đối chiếu file/hash nhưng **không duyệt hình/tư thế/quyền**. `identity_blocked` giữ thiếu, không dùng ảnh khác. Cache/review sau này phải gắn đủ unit+revision+locale+step/media ID; không coi media ID toàn cục.

| Unit để giao review | Bản + nguồn JSON | SHA prefix | sourceRef `(course/lesson/youtube)` | Media slot `present/blocked/missing` |
|---|---|---|---|---:|
|mcy.pose.cobra|r1 vi-VN · [JSON](../../content/yoga-library/units/cobra/r1.json)|e599f8a6f6f4|poses/21/KtMlgK2cjsU|5/0/0|
|mcy.pose.cobra-gentle|r1 vi-VN · [JSON](../../content/yoga-library/units/cobra-gentle/r1.json)|3460c3ada4ee|poses/20/54IPJkU7f_o|5/0/0|
|mcy.pose.cow-face|r1 vi-VN · [JSON](../../content/yoga-library/units/cow-face/r1.json)|11410eb99910|poses/29/wnenFwBE5oY|5/0/0|
|mcy.pose.downward-dog|r1 vi-VN · [JSON](../../content/yoga-library/units/downward-dog/r1.json)|452299229d75|poses/25/CwhLdstN0dc|5/0/0|
|mcy.foundation.cat-cow|r3 vi-VN · [JSON](../../content/yoga-library/units/foundation-cat-cow/r3.json)|aaa9cec5ac78|poses/27/rWl5ySBsrG0|10/0/0|
|mcy.foundation.standing|r3 vi-VN · [JSON](../../content/yoga-library/units/foundation-standing/r3.json)|f208ff64d776|không có sourceRef|10/0/0|
|mcy.pose.high-lunge|r1 vi-VN · [JSON](../../content/yoga-library/units/high-lunge/r1.json)|78135b89cbc9|poses/26/oFWjSKxXvKY|5/0/0|
|mcy.pose.kneeling-backbend|r1 vi-VN · [JSON](../../content/yoga-library/units/kneeling-backbend/r1.json)|461ee017f41a|poses/19/McOZ1FW5jBM|0/5/0|
|mcy.pose.low-crow|r1 vi-VN · [JSON](../../content/yoga-library/units/low-crow/r1.json)|0536caa4f45a|poses/22/0fs1LCnK3-U|0/5/0|
|mcy.pose.low-wheel|r1 vi-VN · [JSON](../../content/yoga-library/units/low-wheel/r1.json)|29d87457775d|poses/28/6Y-eWBnD8r8|0/5/0|
|mcy.transition.stand-up|r1 vi-VN · [JSON](../../content/yoga-library/units/stand-up/r1.json)|1a1c68e89af7|poses/24/DOmYgUoQyZI|0/5/0|
|mcy.pose.three-legged-dog|r1 vi-VN · [JSON](../../content/yoga-library/units/three-legged-dog/r1.json)|8d55dc8db176|poses/30/wYiSFpP7vjs|5/0/0|
|mcy.pose.warrior-ii|r1 vi-VN · [JSON](../../content/yoga-library/units/warrior-ii/r1.json)|e666a51c0cf8|poses/31/gkiWrw9hREU|5/0/0|
|mcy.pose.wild-thing-high|r1 vi-VN · [JSON](../../content/yoga-library/units/wild-thing-high/r1.json)|1f3780456235|poses/23/p3sKiK8szF8|0/5/0|

## Snapshot và điểm cần quyết định

Tại receipt hiện tại: **80 slot = 55 `draft_present` + 25 `identity_blocked` + 0 `not_produced`**; 55/55 path/file/SHA được tham chiếu khớp. Có **56 file vật lý** trong `media/`, không phải 56 slot hoặc 56 ảnh được phép dùng. 14 unit vẫn là bài đọc: không có approval record, `learnerVisible=false`, `recommendationEligible=false`, `practiceDurationSeconds=null`. Media draft chỉ có bytes cho reviewer; không chứng minh tư thế, rights, caption, accessibility hoặc ảnh phù hợp phiên bản. 25 slot blocked phải giữ rõ cho đến khi người có trách nhiệm xử lý và review lại.

So với snapshot 5.1, handoff và ba unit `cobra`, `cobra-gentle`, `three-legged-dog` có hash mới; số `draft_present` 45→55 và `not_produced` 10→0. Đây là **temporal update của upstream đang sản xuất**, không phải consumer sửa nội dung hay chứng nhận hoàn tất. 17 file được chọn trong intake 5.2 khớp receipt trước/sau, không drift giữa hai mốc 5.2. README/handoff nhắc `expansion/` metadata-only, nhưng folder và `manifest.json` chưa có ở snapshot này; không đưa expansion vào queue unit hay gọi manifest final. Khi upstream đổi tiếp, tạo receipt mới gắn exact bytes trước khi người thật quyết định.

Người thật cần xác nhận đúng `id/revision/locale/path/hash` và từng media hash được xem, nguồn/quan hệ clip, exact variant, phạm vi đối tượng/điều kiện dừng, chuyên môn cue/hình/chuyển tiếp, quyền text/video/ảnh/audio, VI/caption/alt/accessibility. Giáo viên chọn brief cho 1 intro + 3 **buổi** trọn vẹn nếu phù hợp; unit đọc không tự thành buổi. Chỉ buổi tập mới cần đo thời lượng toàn buổi. Tên/phạm vi/căn cứ chuyên môn và reviewer độc lập do Owner cung cấp, quyết định thật ghi ở workflow được phê chuẩn về sau; queue này không tạo approval JSON, CMS assignment hay publish. **STOP trước 5.3/6.**
