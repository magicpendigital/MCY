# MCY — phiếu duyệt bản sửa và kiểm thử native mới, 14/10/2026

**PREPARED — CHƯA ĐƯỢC DUYỆT, CHƯA CÀI APP, CHƯA TRIỂN KHAI STAGING, CHƯA GHI DỮ LIỆU KIỂM THỬ MỚI.**

Gói `mcy-native-late-save-20261014` tích hợp đúng bản sửa đã review: nếu người dùng rời màn hình khởi tạo trong lúc chuẩn bị client đăng nhập, không gửi check-in muộn. Cả ba điểm gọi lưu truyền continuation hiện tại. Yêu cầu đã gửi vẫn có thể hoàn tất; bản sửa không hủy giao dịch đang chạy. Lỗi này được tái hiện riêng trên fixture, **chưa chứng minh là nguyên nhân bản ghi B ngoài dự kiến ngày13/10**.

## Artifact và đích được đề nghị

- Android: Air1 Ultra, serial `Q88549EEXCUOONGA`, chỉ package `com.nilaza.motchutyoga.mcydebug` — “Một chút yoga (Debug song song)”. APK [đã lưu riêng](../.vercel/mcy-native-20261014-late-save/app-parallel.apk), 12,016,725bytes, SHA256 `4b6620d6ae63fde5e7525f4a7beb318a01b4ad99859b68b7cd336b2c7a2a413e`, versionCode1/versionName1.0-mcydebug. Certificate SHA256 khớp APK đang dùng: `dd3c8ee6d7ab263842a4dcce514efd398efa45ab54ca19c1c3d83456e54033c2`. Xác định bản mới bằng hash; tên/version hiển thị giữ nguyên.
- Web staging: duy nhất Vercel **Preview**, project `prj_gTioLZWajGyQMkaPS1qapwoBOUnA`, team `team_BGXDJYYYe7LSDoGDjWRBFlJH`, branch `codex-mcy-p1-preview`, domain `motchutyoga.magicpendigital.com`. Prebuilt58files, artifact SHA256 `e160c60e497d74fc1ebb49a6419af3b67add7dd41518d858c7f8d489f9acd670`. Không chạy build lại trên cloud hoặc upload toàn checkout. **Web rollout hiện BLOCKED ở gate protection:** GET không cookie tới cả domain và URL Preview đều trả200; HTML domain khớp byte bản2zYC… hiện tại. Đây không phải fresh SSO302. Metadata protection null/default chưa chứng minh chính sách bảo vệ áp dụng cho Preview mới; gói này không tự bật/tắt protection.
- Backend: Supabase staging `mhumbczqrzutdnraafhs`, MagicpenDigital `rzbpjfrndhrtxagpgdre`. **Không áp dụng migration/Edge Function, sửa Auth/SMTP/DNS, role/expiry, cấu hình Owner hoặc bật AI.** Production và iOS ngoài gói này.
- Gói13/10 đã đóng với FAIL vì3new check-ins/cap2. [Nguồn lịch sử đã lưu](MCY_NATIVE_FROZEN_SOURCE_ARCHIVE_2026-10-14.json), manifest71bf…/APK5bf410…/receipts/history giữ nguyên. Không sửa hoặc chạy lại gói cũ để đạt PASS.

## Kiểm tra đã có và giới hạn

Nguồn tích hợp Prototype SHA32c100… khớp candidate đã review. Build web/TypeScript, runtime28files, Android assembleParallel, scanner native25/web23textfiles, catalogue0đóng, Sites4/isolation1 đạt. Full UI **142/142 PASS** (140normal +2late-save diagnostics), không flaky/skipped. Kiểm tra observer **8case** gồm consumer của manifest thực và contract check-in4case đạt; các lượt Gradle/Edge sandbox lỗi được giữ là trung gian. [Receipt chuẩn bị](MCY_NATIVE_LATE_SAVE_PREPARATION_2026-10-14.json) ghi7case tại thời điểm capture, [bổ sung contract](MCY_NATIVE_LATE_SAVE_MANIFEST_CONTRACT_2026-10-14.json) ghi8case sau sửa thiếu device alias; [R3 độc lập](MCY_NATIVE_INTEGRATION_R3_2026-10-14.md) ghi rõ phạm vi.

APK59public files và web58files được pin; mã build chứa hai guard và đủ ba caller. Đây là bằng chứng build/fixture, **chưa là nghiệm thu native thật, nội dung yoga/chuyên môn/rights, AI hoặc Production**. Không cam kết chặn mọi duplicate trong cùng một màn hình. Không sử dụng thao tác force-stop/ADB launch để suy ra cold-start đã đạt.

## Ngân sách mới — chỉ hai tài khoản disposable A/B

Baseline chỉ đọc ngày14/10: A10consents/2check-ins/1observation; B6/3/0; cả hai có hồ sơ giả và locale vi-VN, required terms/privacy current, wellbeing revoked,0active staff/teacher. AIoff/version1/model unset, ledger21 và Owner/writer MD5 giữ nguyên. Phải đọc lại đúng baseline và thực quyền trước execution; snapshot này không chứng minh phiên đăng nhập còn hạn.

| Tác động mới tối đa | Giới hạn |
|---|---:|
| Tạo/cập nhật hồ sơ | 0 |
| Cập nhật Auth locale/metadata | 0 |
| Wellbeing consent events | 4: A grant/revoke + B grant/revoke |
| Check-in giả | 2: đúng1/A và1/B |
| Observation mới, note hoặc dữ liệu sức khỏe thật | 0 |
| APK mới cài thay thế | 1, chỉ .mcydebug |
| Preview mới / gắn domain vào Preview mới | 1 / 1, chỉ khi native đạt |

Không chuẩn hóa hồ sơ A về tên/style của fixture cũ, không onboarding/lưu lại profile hoặc locale. Giữ mọi khóa metadata và toàn bộ lịch sử, gồm extra B ngày13/10. Kết thúc dự kiến A12/3/1+B8/4/0, tổng20consents/7check-ins/1oldobservation/2profiles; wellbeing revoked cả hai. Deltas được tính từ **baseline mới**, không từ mảng newRows/cutoff của gói13/10.

## Trình tự sau khi Owner duyệt đúng manifest

1. Operator kiểm manifest/hash/R3/source/artifacts/đích/baseline/policy/authority và APK cũ5bf410… thực trên điện thoại. Nếu khác, dừng trước mutation. Tạo intent độc quyền **mới** trước cài/ghi; chưa có intent/approval cho gói này. Không dùng các token/helper-label cũ làm bằng chứng tài khoản.
2. Cài đúng APK archived bằng `pm install -r`, giữ firstInstallTime và dữ liệu app; không uninstall/clear data, không cài release/.debug. Không dùng installer tự `am start`, force-stop hoặc instrumentation. Người dùng chạm icon thật để mở. Đối chiếu APK/certificate/package và hashes/update times của release/.debug, startup/UI và baseline vẫn nguyên khi wellbeing Tắt. Nếu trắng/đứng hoặc có thêm row/event, dừng trước grant.
3. Người dùng tự đăng xuất thiết bị này/đăng nhập A bằng email mới khi cần, rồi dừng trước ghi. Agent dùng [observer mới](../scripts/observe-native-late-save-20261014.mjs) chỉ Auth GET, giữ token/UID/raw metadata trong WebView; xác minh cached/server actor đúng A, confirmed, cùng session. [SELECT mới](../scripts/sql/native-late-save-readback-20261014.sql) xác minh actual authority/current policies, hồ sơ/metadata/history/counts. Nếu về onboarding, stale required policy, chuyển nháp hoặc error thì dừng; không lưu profile/locale/consent bổ sung.
4. Chỉ xem Home/Hành trình, Recent→icon thật và xem lại khi wellbeing Tắt: baseline không tăng. A bật đúng wellbeing1lần; đọc grant trước save. Lưu **một** check-in giả: Không thấy khó chịu/energy Bình thường2/standalone/no note/0observations, rồi dừng ở Journey. Readback phải đúng1row. Response không rõ thì chỉ đọc trạng thái; không retry/tạo key mới.
5. A Recent→icon thật, chỉ xem Hành trình; Auth/record giữ được và không có row/event mới. Thu hồi wellbeing1lần, xác minh revoked. Một thao tác standalone fake-save khi Tắt phải tạo0row/0event; Journey không được gọi là đã lưu thành công. Nếu app yêu cầu consent/nháp/retry, không xác nhận tiếp.
6. Người dùng tự đổi sang B, xác minh B trước ghi. Giữ hồ sơ/locale/history B và kiểm không hiển thị draft/history A. B làm đúng grant1/save1/Recent-icon chỉ xem/revoke1/negative-save0 như A. Chỉ xem không được phát sinh check-in. Không đọc hoặc ghi tài khoản Owner/teacher trong phép thử này.
7. Đọc trạng thái cuối: deltas tối đa4events/2checks/0observations/0profile/0metadata, hashes lịch sử/profile/metadata không đổi, wellbeing revoked cả hai, server controls nguyên. Ghi PASS/FAIL/CHƯA CHẠY theo từng bước, đóng intent native, không tiếp tục ghi. **Trước bất kỳ upload web** phải native đạt, reverify exact team/project/current alias và xác minh rõ chính sách bảo vệ Preview áp dụng cho deployment mới. Null/default không rõ, HTTP200 hiện tại hoặc không đối chiếu được policy thì **dừng phần web: không upload/không alias**; quyết định duyệt này không cho agent đổi protection hay mặc nhiên công khai bản mới. Chỉ khi gate này đã đạt mới tạo tối đa1Preview từ exact prebuilt artifact, kiểm READY/58files/SSO/HTTPS/callback trước khi gắn domain review. Không promote Production/auto tạo bypass credential; hosted GET chỉ dùng quyền SSO đã có. Không thêm phép thử ghi web ngoài ngân sách native.

## Dừng, khôi phục và điều kiện duyệt

Sai target/hash/actor/authority/baseline/policy; mới xuất hiện profile/metadata/row/event ngoài kịch bản; uncertain commit/5xx; trắng/đứng; cross-account draft/history; AI request hoặc cap vượt đều **HALT**. Giữ dữ liệu/evidence, không xóa để sửa số đếm hoặc chạy lại bước lưu. Sau HALT chỉ cho final revoke của actor đã grant, có readback và còn event dành riêng trong cap4; không grant/check-in/profile mới. Nếu không revoke được qua UI, báo trạng thái grant còn active, không tự ghi SQL.

Nếu native không đạt, không deploy Preview. Chỉ sau both wellbeing revoked và không còn request ghi đang chạy mới được khôi phục **tối đa1lần** APK cũ5bf410… bằng update giữ dữ liệu, theo quyết định stop/restore; không dùng bản release hoặc clear data. Nếu Preview mới không đạt, khôi phục domain tới đúng Preview cũ `dpl_2zYC7QQJKMRLGsKgWPpWQqnPkaT4`/artifact3197f3… đã kiểm trước execution, tối đa1alias restore, giữ protection. Nếu đích cũ không READY/không đúng project thì dừng, không chọn deployment khác. Khôi phục code/alias không xóa hoặc đảo ngược consent/check-in đã commit; không restore database.

Owner duyệt **gói mới, hash manifest mới và giới hạn trên** mới cho phép cài/cập nhật staging/kiểm thử có ghi. Mọi input/artifact/baseline/packet thay đổi cần review và manifest mới. Gói này không xóa FAIL của gói13/10 hoặc các gate release chung/các migration pending/catalog chuyên môn.

Gate web áp dụng [mcy-change-review](../skills/mcy-change-review/SKILL.md): “Only the exact owner-approved target/artifact may enter a separately verified protected release path.” [R3](MCY_NATIVE_INTEGRATION_R3_2026-10-14.md) yêu cầu xác minh policy **trước upload**. Vì fresh GET200/metadata null chưa xác lập protected Preview, gate này còn BLOCKED; không suy ra quyết định của Owner cho phép đổi protection hoặc công khai bản mới. Yêu cầu chuẩn bị/cần duyệt trước cập nhật của Owner được giữ nguyên.
