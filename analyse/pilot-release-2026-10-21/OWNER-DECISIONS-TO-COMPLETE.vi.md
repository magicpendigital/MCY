# Owner: bổ sung phạm vi và dẫn chiếu quyết định đã có

**BẢN CHUẨN BỊ ĐỂ OWNER XEM — chưa là approval record hoặc lệnh chạy test.** Owner đã chọn **FULL: tài khoản thật, toàn bộ bài đã chuẩn bị qua các task nội dung, thực hành và chức năng**, đồng thời chỉ định Teacher và Reviewer. Trạng thái **OWNER_REPORTED_APPROVALS_EXIST_ALL_PREPARED_FULL_REAL_SCOPE**. Nhóm đã map phiên bản/hash dưới đây; không yêu cầu Owner chọn lại Uxx, scope, purpose hoặc tính hash. Chỉ còn nối reviewer-authored evidence/quyền cụ thể và kiểm readiness kỹ thuật; không chép bài/ảnh/contact vào packet.

## 1. Phạm vi Owner đã chọn và facts còn cần nối

Các lựa chọn FULL đã nhận từ human reply, không phải đề xuất mới của Agent. Phần kỹ thuật sẽ được nhóm đối chiếu exact snapshot; nếu hồ sơ có giới hạn khác thì ghi đúng giới hạn đó.

| Quyết định cần chốt | Owner điền hoặc dẫn evidence sẵn có |
|---|---|
| Luồng và nền tảng | **ĐÃ CHỌN: FULL tài khoản thật/chức năng trên web và Android**; readiness/delivery chưa hoàn tất |
| Nội dung và purpose | **ĐÃ CHỌN: toàn bộ bài đã chuẩn bị qua các task nội dung; thực hành**. Map pool ở mục 2; không thu hẹp thành chỉ 14 unit |
| Teacher và Reviewer | **ĐÃ ĐƯỢC OWNER CHỈ ĐỊNH**; email nhận diện giữ trong human decision riêng, không xuất vào guides/packet này. Cần server active role/assignment và evidence chuyên môn/quyền tương ứng |
| Buổi thực hành hoàn chỉnh/session, media/timing và quyết định cho toàn trình | Cần đối chiếu evidence; nguồn hiện có không cung cấp reviewed PracticeSession hoàn chỉnh. Purpose thực hành đã chọn không tự biến unit đọc thành buổi tập |
| Moderator/custodian, kênh hỗ trợ; nơi lưu, ai được xem, retention/rút notes | PENDING |

## 2. Toàn bộ pool đã chuẩn bị — map theo dữ liệu hiện có

Human scope là “toàn bộ bài đã chuẩn bị qua các task nội dung”. Bảng dưới là bản đồ kỹ thuật hiện tìm thấy, không phải kết luận toàn bộ pool đã thành session đủ thực hành. Không đếm assets, alias, generated readable hoặc metadata thành bài mới.

| Pool | Snapshot/version hiện có | Phân loại thực tế và phần chưa thành session |
|---|---|---|
| Canonical 14 unit | Manifest `0fa137d5…114b1`, danh sách exact bên dưới | Bài đọc/quan sát; `practiceDurationSeconds=null`, learnerVisible/recommendationEligible false; 55 PNG nháp, 25 slot chặn. Không có buổi hoàn chỉnh từ phép cộng 14 unit |
| Source catalog 38 clip / 3 nhóm khóa | `inventory.json` SHA `85b1242a4f9fd06fa8eb53f3a12adb4e1bc401ab277813ff149b0c9a65ebe3ed`; `src/courses/freeCourses.ts` được pin trong metadata v2 | Metadata/source clip đang có, không phải 38 bài mới hoàn tất hay reviewed PracticeSession. Quan hệ unit là topic reference; chưa xác minh trọn nội dung/video/rights/timing cho mục đích FULL |
| Intro mẫu hình/text/audio | `preparation-draft`, version `e73a93ffb990887f22a2bd25a72b87ba29e8761eec86bbb9729c2d4328ee7f2b`; registry hiện hữu và 4 assets được pin riêng | “Dành một khoảng cho buổi học”, scope learning_intro; ảnh phòng + 3 audio mẫu tiếng Anh; không hướng dẫn động tác hoặc tạo buổi yoga đã duyệt |
| 114 entity mở rộng | `expansion/catalog.json`, schema `mcy-yoga-expansion-1`, taxonomy `mcy-yoga-taxonomy-1`; file hash tự pin trong metadata v2 | Metadata kế hoạch, contribution unit/media = 0; không là 114 lesson đã sản xuất |
| Task foundation/pose trước canonical | Canonical foundation-standing/r3, foundation-cat-cow/r3 giữ alias/provenance từ các bản 16/10; các pose observation đã nằm trong 14 unit | Preview16/10/generated readable/private stills là lịch sử/dependencies, không tạo thêm pool learner-visible hoặc copy vào bundle |
| Reviewed practice catalog | `reviewedPracticeCatalog.ts`: mảng rỗng | **0 PracticeSession đã được source catalog nhận là reviewed**; cần hoàn thiện buổi/evidence/adapter/operation thực, không dựng session bằng nhãn hoặc thời lượng clip |

### 14 unit canonical đã map exact bytes

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

Mỗi unit JSON có `media[].id/status/path/sha256`; manifest `inputs` pin bytes/hashes của ảnh hiện có. Dùng [bảng metadata đối chiếu v2](OWNER-DECISIONS-METADATA-v2.json) để nối toàn bộ pool, unit path/asset refs và source catalog IDs với file hashes đã tính sẵn. Không chọn hình thay thế khi media bị chặn. Quyết định trên bản/ảnh khác phải chỉ ra khác biệt; nhóm đối chiếu phần ảnh hưởng, không tự lấy “latest”.

## 3. Dẫn quyết định thực — dùng một hàng cho một nhóm bản cùng scope

Không cần chọn lại nội dung: scope là toàn bộ prepared pool và mục đích thực hành đã được Owner chọn. Chỉ dẫn hồ sơ quyết định đã có cho pool tương ứng, reviewer-authored evidence, ngày/phần đã xem, quyền media/phạm vi đối tượng hoặc giới hạn chưa được thể hiện. Nếu các căn cứ ở hồ sơ khác nhau, dẫn từng phần; không gửi email/contact riêng vào packet.

| Mã Uxx hoặc session được xét | Tác giả/Teacher phụ trách, bằng chứng phân công (không contact) | Reviewer/người có chuyên môn phù hợp, căn cứ phạm vi/độc lập | Quyết định thật và ngày, link/path/ref | Purpose đọc/thực hành; đối tượng/phạm vi/giới hạn | Phần đã xem: toàn bản hay mục/asset nào | Rights/media scope và evidence; editorial/accessibility còn thiếu |
|---|---|---|---|---|---|---|
| ALL prepared pool ở mục 2 | Owner đã chỉ định Teacher; server assignment cần xác minh | Owner đã chỉ định Reviewer; reviewer-authored evidence/chuyên môn phù hợp cần đối chiếu | Owner báo approvals đã có; dẫn hồ sơ/ngày còn cần nối | **FULL tài khoản thật + thực hành + chức năng**; giới hạn/đối tượng theo evidence thật | Cần dẫn phần đã được người có trách nhiệm xem | Cần dẫn quyền/media scope, editorial/accessibility tương ứng |

Nêu rõ “cần chỉnh”, “chỉ cho đọc”, “không bao gồm media…”, hoặc giới hạn khác đúng hồ sơ thật. Không tick/điền thay reviewer. Vai trò tài khoản, nomination email hoặc QC kỹ thuật không chứng nhận chuyên môn/quyền. Mẫu này không viết `approvalRecords`, không tự chuyển `humanReviews` thành approved và không cung cấp clinical/legal approval.

## 4. Delivery còn cần operation riêng

| Bề mặt | Điều đã biết / còn chờ |
|---|---|
| Web Preview | [Readback đúng project/team](ROOT-HOSTING-PROJECT-READBACK.json) quan sát SSO null, password false, trusted IPs false; chưa chứng minh protection áp dụng cho Preview mới. Vẫn **BLOCKED_NO_UPLOAD_OR_ALIAS**; cần exact artifact/target/protection và operation trước upload/alias. Không tự bật bảo vệ, bypass hoặc Production |
| Android | Session-restore vẫn **HALTED/currentActorVerified=false**. Build chuẩn bị không cấp phép cài/chạy/đăng nhập lại hoặc chứng minh thiết bị đạt; cần exact APK và operation/caps/acceptance mới. Không force-stop/shell-launch/clear-data |
| Artifact chuẩn bị | Common web 61 files/59 client và APK `1.0-mcydebug-pilot20261021` đã build; [delivery bind exact paths/hashes](DELIVERY-AND-REPORTING.vi.md#exact-artifacts-đã-build-chuẩn-bị), root local guest UI tám màn/HTTP guard PASS và compiled callback đã kiểm. Chưa deploy/cài/accept participant, account thật hoặc thực hành |
| Backend hiện tại | [CLI readback v2](ROOT-BACKEND-PROJECT-CLI-READBACK-v2.json) xác nhận đúng staging/org `ACTIVE_HEALTHY`, chỉ project metadata; chưa kiểm roles/ACL/ledger/Auth hoặc data. Không dùng lỗi connector cũ thay trạng thái hiện tại |
| Teacher/Reviewer/account thật | Scope FULL và người phụ trách đã được Owner chỉ định; backend/server-owned roles/assignments/write caps chưa được xác lập. Reader Owner local và fictional author/reviewer không thay quyền thật; không chia sẻ/gia hạn capability |

Owner có thể cung cấp quyết định nội dung trước khi delivery đóng các cổng kỹ thuật; quyết định đó không tự mở các thao tác bên ngoài. Sau khi có facts, nhóm đối chiếu và lập operation cụ thể để review; tài liệu này chưa gửi lời mời, phát tài liệu nháp, chạy pilot hoặc thay consent/privacy protocol.
