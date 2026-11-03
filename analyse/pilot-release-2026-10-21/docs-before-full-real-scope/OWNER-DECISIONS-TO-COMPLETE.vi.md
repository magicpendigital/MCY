# Owner: bổ sung phạm vi và dẫn chiếu quyết định đã có

**BẢN CHUẨN BỊ ĐỂ OWNER XEM — chưa là approval record hoặc lệnh chạy test.** Trạng thái vẫn **OWNER_REPORTED_DECISIONS_EXIST_DETAILS_PENDING**: Owner đã báo có quyết định và sẽ cung cấp phạm vi; task cần nối quyết định thật với bản cụ thể. Owner chỉ cần chọn mã U01–U14 và dẫn hồ sơ/quyết định hiện có; không cần tự tính hash hoặc chép lại bài/ảnh/liên hệ.

## 1. Chọn phạm vi thử

Điền lựa chọn và phần được phép; chưa mặc định lựa chọn nào:

| Quyết định cần chốt | Owner điền hoặc dẫn evidence sẵn có |
|---|---|
| UX dữ liệu giả / đọc artifact đã được phép / luồng account thật; có thể chọn nhiều, nêu task riêng | PENDING |
| Nền tảng web / Android và vai trò tham gia | PENDING |
| Unit Uxx được xem, mục đích chỉ đọc hoặc thực hành, đối tượng/phạm vi/giới hạn | PENDING |
| Nếu thử thực hành: exact buổi hoàn chỉnh/session, media/timing và quyết định cho toàn trình | PENDING — unit đọc không tự là buổi tập |
| Moderator/custodian, kênh hỗ trợ; nơi lưu, ai được xem, retention/rút notes | PENDING |

## 2. Danh mục bản hiện tại đã điền sẵn

Các tiêu đề dưới đây chỉ là metadata nhận diện. Không kèm nội dung hướng dẫn, ảnh hoặc contact. Hash là JSON nguồn unit; bản rendered/ảnh phải khớp riêng trước delivery. 14 unit vẫn là nháp trong canonical; 114 mục mở rộng là metadata, không là 114 bài học đã soạn.

| Mã chọn | Tiêu đề hiện tại | ID | Revision / locale | SHA-256 JSON unit | Ảnh nháp có / slot chưa sẵn sàng |
|---|---|---|---|---|---|
| U01 | Rắn hổ mang · bản đọc nâng thấp | `mcy.pose.cobra-gentle` | r1 / vi-VN | `56e07e4df2823ca5ab87ea3de0895c0ec82312c54f16f924a911f2b89a05072e` | 5 / 0 |
| U02 | Rắn hổ mang · đọc nền nằm và độ nâng | `mcy.pose.cobra` | r1 / vi-VN | `a90652ee53aa4c44f5ee53a9d2f87d1cbfd6318b04f72ef069f5bb6005bccb54` | 5 / 0 |
| U03 | Đầu bò · đọc riêng phần tay và phần chân | `mcy.pose.cow-face` | r1 / vi-VN | `22c2a7651bb301d0ba6f881438c8fa4405d8a986d2da941afd508f1c8649e923` | 5 / 0 |
| U04 | Chó úp mặt · nhìn nền V ngược | `mcy.pose.downward-dog` | r1 / vi-VN | `64c83c00d8f31ec78f97f747c897694ac467a1f2fbcbc9ef266d4ed8f0ccb649` | 5 / 0 |
| U05 | Làm quen chuyển động Bò–Mèo | `mcy.foundation.cat-cow` | r3 / vi-VN | `aaa9cec5ac78e4fafc43657ec89dc77cc9ec0cb149a120484897b2f6abcb1854` | 10 / 0 |
| U06 | Đứng và nhận biết điểm tựa | `mcy.foundation.standing` | r3 / vi-VN | `f208ff64d776b0be4a01e81b89cd49d36144c47ca105d7acc44466b5486a7f89` | 10 / 0 |
| U07 | Trường tấn cao · đọc nền trước và sau | `mcy.pose.high-lunge` | r1 / vi-VN | `74bce3a00792b94c9b7580370825486a9b604fef5e38f063d498f6ef01b5939a` | 5 / 0 |
| U08 | Quỳ gối ngả sau · nhận biết nền đỡ bất đối xứng | `mcy.pose.kneeling-backbend` | r1 / vi-VN | `461ee017f41acd05c775de9760249adb0ca420a22ad384166193b9c9952ba05c` | 0 / 5 |
| U09 | Quạ thấp · phân biệt tay chống và cẳng tay | `mcy.pose.low-crow` | r1 / vi-VN | `0536caa4f45ac08fedf43e32c1c2c25415c7e7408f2790421c8d3694af6594af` | 0 / 5 |
| U10 | Bánh xe thấp · nhận biết điểm tựa gần đầu | `mcy.pose.low-wheel` | r1 / vi-VN | `29d87457775ddac019dbcb02d79f7185fdb7df117da7e747910da9101b34072a` | 0 / 5 |
| U11 | Đứng lên · đọc chuyển động qua nền chân | `mcy.transition.stand-up` | r1 / vi-VN | `1a1c68e89af79469ecea8f111bb7a2df2de8f8b96e9e6dc09512761d1fed504a` | 0 / 5 |
| U12 | Chó ba chân · đọc nền đỡ khi nhấc một chân | `mcy.pose.three-legged-dog` | r1 / vi-VN | `54712f1f219d65fdff53d215bc3bebed605b06cf5f0700419c708aa6b6f51844` | 5 / 0 |
| U13 | Chiến binh II · nhìn chân và hướng thân | `mcy.pose.warrior-ii` | r1 / vi-VN | `1a6eb2004fa48b3f9051bcf6bf16fdf2cbbf8c10f8b4a4ccbb1e9c3f2252b902` | 5 / 0 |
| U14 | Hoang dã cao · nhìn rõ ba điểm tựa | `mcy.pose.wild-thing-high` | r1 / vi-VN | `1f3780456235b38f877f4bf392b72d3006a28651ea37e9c464f385af3c3446ae` | 0 / 5 |

Manifest gốc: [content/yoga-library/manifest.json](../../content/yoga-library/manifest.json), SHA-256 `0fa137d5ea658fadfdb8a1ab97e5fd86550a03b82fbed972530b338e65d114b1`. Inventory: [inventory.json](../../content/yoga-library/inventory.json). Tổng manifest là 55 PNG nháp/25 slot bị chặn; không suy ảnh hiện diện là được thẩm định hoặc có quyền đưa xem.

Mỗi unit JSON có `media[].id/status/path/sha256`; manifest `inputs` pin bytes/hashes của ảnh hiện có. Dùng [bảng metadata đối chiếu](OWNER-DECISIONS-METADATA-v1.json) để nối mã Uxx với unit path và asset refs đã có. Hash ở đây được Agent tính/đối chiếu, Owner không cần tính. Không chọn hình thay thế khi media bị chặn. Quyết định trên bản/ảnh khác phải chỉ ra khác biệt; nhóm sẽ đối chiếu phần ảnh hưởng, không tự lấy “latest”.

## 3. Dẫn quyết định thực — dùng một hàng cho một nhóm bản cùng scope

Owner có thể trả lời ngắn như “U01, U05: hồ sơ X, ngày Y, chỉ đọc; người/phạm vi tại mục Z”. Đây chỉ là cách dẫn hồ sơ, không là ví dụ quyết định duyệt. Nếu tác giả, reviewer, rights và accessibility ở hồ sơ khác nhau, dẫn từng phần; không cần gửi email/contact riêng vào packet.

| Mã Uxx hoặc session được xét | Tác giả/Teacher phụ trách, bằng chứng phân công (không contact) | Reviewer/người có chuyên môn phù hợp, căn cứ phạm vi/độc lập | Quyết định thật và ngày, link/path/ref | Purpose đọc/thực hành; đối tượng/phạm vi/giới hạn | Phần đã xem: toàn bản hay mục/asset nào | Rights/media scope và evidence; editorial/accessibility còn thiếu |
|---|---|---|---|---|---|---|
| PENDING | PENDING | PENDING | PENDING | PENDING | PENDING | PENDING |

Nêu rõ “cần chỉnh”, “chỉ cho đọc”, “không bao gồm media…”, hoặc giới hạn khác đúng hồ sơ thật. Không tick/điền thay reviewer. Vai trò tài khoản, nomination email hoặc QC kỹ thuật không chứng nhận chuyên môn/quyền. Mẫu này không viết `approvalRecords`, không tự chuyển `humanReviews` thành approved và không cung cấp clinical/legal approval.

## 4. Delivery còn cần operation riêng

| Bề mặt | Điều đã biết / còn chờ |
|---|---|
| Web Preview | [Readback đúng project/team](ROOT-HOSTING-PROJECT-READBACK.json) quan sát SSO null, password false, trusted IPs false; chưa chứng minh protection áp dụng cho Preview mới. Vẫn **BLOCKED_NO_UPLOAD_OR_ALIAS**; cần exact artifact/target/protection và operation trước upload/alias. Không tự bật bảo vệ, bypass hoặc Production |
| Android | Session-restore vẫn **HALTED/currentActorVerified=false**. Build chuẩn bị không cấp phép cài/chạy/đăng nhập lại hoặc chứng minh thiết bị đạt; cần exact APK và operation/caps/acceptance mới. Không force-stop/shell-launch/clear-data |
| Teacher/Reviewer/account thật | Backend/server-owned roles/assignments/testgroup scope và writes chưa được xác lập. Reader Owner local và fictional author/reviewer không thay quyền thật; không chia sẻ/gia hạn capability |

Owner có thể cung cấp quyết định nội dung trước khi delivery đóng các cổng kỹ thuật; quyết định đó không tự mở các thao tác bên ngoài. Sau khi có facts, nhóm đối chiếu và lập operation cụ thể để review; tài liệu này chưa gửi lời mời, phát tài liệu nháp, chạy pilot hoặc thay consent/privacy protocol.
