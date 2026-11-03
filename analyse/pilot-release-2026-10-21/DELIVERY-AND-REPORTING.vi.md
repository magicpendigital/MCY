# Mở đúng bản thử và báo lỗi

**BẢN NHÁP VẬN HÀNH — CHƯA PHÁT CHO NHÓM TEST.** Owner đã chọn **FULL: tài khoản thật, toàn bộ bài đã chuẩn bị, thực hành và chức năng**, đồng thời chỉ định Teacher và Reviewer. Trạng thái: **OWNER_REPORTED_APPROVALS_EXIST_ALL_PREPARED_FULL_REAL_SCOPE**. Phạm vi đã được trả lời; phần còn thiếu là reviewer-authored evidence/quyền cụ thể, buổi hoàn chỉnh và technical delivery. Việc build chuẩn bị hoặc hướng dẫn hoàn chỉnh chưa mở pilot; dùng sau khi phiếu dưới đây được xác minh theo operation mới.

## Phiếu delivery chung

| Trường cần khớp trước lượt test | Hiện trạng |
|---|---|
| Scope được Owner chọn | **FULL tài khoản thật / toàn bộ bài đã chuẩn bị / thực hành / chức năng**; không dùng UX giả thay nghiệm thu thật |
| Mã bản chuẩn bị/source freeze | `pilot-common-v1`, [SOURCE-FREEZE-v2](SOURCE-FREEZE-v2.json) SHA `9e9c5c88d7721c4986bf61396dac9dd8a17586377c493971895e70ae77f9d256`; build từ managed tree cô lập, chưa là bản phát hành |
| Web URL được phép mở, môi trường và protection kiểm trên exact artifact | **BLOCKED/PENDING delivery**; [readback đúng project/team](ROOT-HOSTING-PROJECT-READBACK.json) quan sát SSO `null`, password `false`, trusted IPs `false`; chưa chứng minh protection áp dụng cho Preview mới. GET200 ngày 14/10 là lịch sử |
| Web artifact và hosted byte match | **ĐÃ CHUẨN BỊ** [COMMON-WEB-v1](COMMON-WEB-v1.json), receipt SHA `682b13d0c525402bdc3a04e1530a76db1185a68650406741682183ae6e74906d`, 61 files/59 client. Hosted byte match/URL release PENDING, chưa upload |
| Android APK/hash/package/version | **ĐÃ CHUẨN BỊ** [COMMON-NATIVE-v1](COMMON-NATIVE-v1.json), receipt SHA `881df4463829f6f93a8173faec8ecd4e58a99f4f5ccd9d07e1698a8e38e61471`; exact APK bên dưới. Chưa cài/chạy trên thiết bị; native restore vẫn HALTED/currentActorVerified=false |
| Cách cài/mở/callback mới và người thực hiện theo operation được duyệt | PENDING; tài liệu này chưa hướng dẫn cài hoặc đăng nhập native |
| Nội dung exact ID/revision/locale/SHA, ảnh/media hashes, purpose và decision evidence | Toàn bộ prepared pool được nhóm [map sẵn](OWNER-DECISIONS-TO-COMPLETE.vi.md); purpose thực hành đã chọn. Reviewer-authored evidence/quyền trên exact snapshot và buổi hoàn chỉnh cần đối chiếu; không hỏi Owner tính hash |
| Vai trò thật/phạm vi/thời hạn được server xác minh; caps nếu có writes | Owner đã chỉ định Teacher/Reviewer; server active roles/assignments, write caps và acceptance còn PENDING. Chỉ định con người không tự grant backend |
| Backend staging hiện tại | [CLI readback v2](ROOT-BACKEND-PROJECT-CLI-READBACK-v2.json): đúng staging/org, `ACTIVE_HEALTHY`; chỉ project metadata, chưa kiểm ledger/roles/ACL/Auth/data hoặc key usability |
| Moderator/custodian, kênh nhận lỗi, nơi lưu/access/retention/rút notes | PENDING; không gửi notes đến kênh chưa chốt |

Không dùng URL ở report cũ hoặc đường dẫn `?workspace=...` như link test. Không chia sẻ capability/bootstrap/cookie; không dùng chung tài khoản. Chỉ điều phối cập nhật phiếu bằng evidence thực, không điền giá trị ví dụ để thử mở.

## Exact artifacts đã build chuẩn bị

Managed tree: `C:/Users/Admin/.codex/worktrees/pilot-web-android-20261021/MCY`. Web archive ở `.vercel/pilot-artifacts/web-common-v1`, gồm manifest file/hash trong receipt web; không dùng một receipt hash như hash của ZIP chưa tạo.

APK ở `.vercel/pilot-artifacts/native-common-v1/app-parallel.apk` trong managed tree trên, **11,585,235 bytes**, SHA-256 `e1b036765affce158e05d699239a4f0b36e8ce8bf317dd6b6bd7a0d142897da7`. Package `com.nilaza.motchutyoga.mcydebug`; versionCode `1`, versionName `1.0-mcydebug-pilot20261021`. [Root đọc compiled manifest/resources](ROOT-APK-MANIFEST-VERIFICATION-v1.json) xác nhận MainActivity VIEW/DEFAULT/BROWSABLE và `motchutyoga-mcydebug://auth/callback`; chưa có physical resolver/Auth/session proof. Nhãn mặc định `Một chút yoga (Pilot 21/10)`, EN `A Little Yoga (Pilot 21 Oct)`. Certificate SHA-256 `dd3c8ee6d7ab263842a4dcce514efd398efa45ab54ca19c1c3d83456e54033c2`. Public package 61 files = 59 native web + 2 Cordova files.

Đây là artifact preparation, không phải delivery participant hoặc hướng dẫn cài APK. Build receipts và [web artifact QC](COMMON-WEB-ARTIFACT-QC-v1.vi.md)/[native artifact QC](COMMON-NATIVE-ARTIFACT-QC-v1.vi.md) PASS trong scope package/bytes. [Root guest UI](ROOT-GUEST-UI-VERIFICATION-v1.json) PASS bounded trên exact web artifact local: tám màn Welcome/Check-in/Khám phá/course trước Play/Home/Hành trình trống/Cá nhân/Privacy đọc; [sáu HTTP/CSP guard probes](ROOT-LOCAL-HTTP-VERIFICATION-v1.json) PASS riêng. Không đăng nhập, playback, toggle hoặc ghi dữ liệu; không là full responsive/accessibility matrix. Viewer đã đóng, localhost kiểm nội bộ không là test URL. Không suy native restoration, role/backend acceptance hoặc hosted UI từ các PASS này.

## Cách mở khi delivery đã được xác nhận

**Web:** đối chiếu mã bản thử và URL với phiếu; mở bằng trình duyệt được chỉ định; kiểm nhãn môi trường/mode/actor hiển thị phù hợp. Nếu tới bản cũ, trang đăng nhập khác, không có quyền hoặc sai mode thì dừng và báo. Không đổi tham số để tự chọn role, bypass protection hoặc xin quyền bằng tài khoản khác.

**Android:** chờ operation mới nêu exact APK/package/version/hash và cách cài/mở được kiểm. Chưa có quy trình cài hoặc callback mới trong gói này. Native đang HALTED: không tự đăng nhập lại, cài đè, xóa dữ liệu, force-stop/shell-launch hoặc thử lưu để khắc phục lỗi. Một APK build thành công chưa chứng minh khôi phục phiên hoặc dữ liệu thiết bị đạt.

**Reader nội bộ:** chỉ người được operation local cho phép mới mở origin/bootstrap được cấp riêng. Banner phân biệt **MÔ PHỎNG · DỮ LIỆU TRUNG TÍNH GIẢ** và **OWNER LOCAL · XEM NHÁP THẬT, CHƯA DUYỆT**. Đây là năng lực rehearsal/nội bộ hiện hữu, không phải scope nghiệm thu FULL đã chọn. Lease 15 phút/khởi tạo 5 phút không được kéo dài hoặc chia sẻ để chạy lượt participant 30–45 phút.

## Ghi lỗi tối thiểu

Chỉ gửi khi có kênh được xác nhận. Dùng mô tả UI, không gửi tên/email/account ID, password, token, cookie, callback URL hoặc capability. Không nhập dữ liệu sức khỏe thật. Mặc định không ảnh/ghi âm/video; nếu scope riêng cho phép ảnh, bỏ mọi định danh/mã truy cập trước khi chuyển.

```text
Mã bản thử / nền tảng / trình duyệt hoặc model thiết bị:
Vai trò hoặc mode hiển thị (không account ID):
Task và bước:
Mong đợi:
Quan sát thực tế / thông báo an toàn trên UI:
Thời điểm tương đối trong lượt:
Đã dừng ở đâu / kết quả thao tác còn chưa rõ:
```

Không bấm lại Save/Review khi chưa rõ kết quả. Sai actor/phiên bản, nguồn thay đổi, quyền hết hạn/thu hồi, xuất hiện dữ liệu người khác hoặc participant muốn dừng: ngừng task, giữ thông báo tối thiểu và báo điều phối. Không tự xóa lịch sử hoặc sửa dữ liệu để đạt bài test.

Chọn [Learner](ROLE-LEARNER.vi.md), [Teacher](ROLE-TEACHER.vi.md), [Reviewer](ROLE-REVIEWER.vi.md), [Moderator](ROLE-MODERATOR.vi.md) hoặc [Owner](ROLE-OWNER.vi.md). Các bước dưới dạng điều kiện chưa được kích hoạt bằng tài liệu này.
