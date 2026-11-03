# MCY — gói kiểm thử dữ liệu native trên staging, 13/10/2026

**PREPARED, CHƯA ĐƯỢC DUYỆT/CHƯA CHẠY.** Gói `mcy-native-learner-trial-20261013` là phép thử mới trên app đã cài, không chạy lại gói learner writer12/10. [Manifest](MCY_NATIVE_LEARNER_TRIAL_OPERATION_2026-10-13.json) bind tài liệu này, source dùng trong APK, kết quả kiểm thử và đúng đích staging. Mọi thay đổi input cần review/manifest mới trước khi quyết định.

## Đích và ngân sách

- Supabase `mcy-staging`, project `mhumbczqrzutdnraafhs`, MagicpenDigital `rzbpjfrndhrtxagpgdre`; Android Air1 Ultra, package `com.nilaza.motchutyoga.mcydebug`, APK SHA256 `5bf4104b019fbe31597c479ef2511e947803d056d42202b5c007843b5e9f74bc`.
- Chỉ hai tài khoản disposable Learner A/B đã dùng trước; bind identity SHA256 trong manifest. Xác minh Auth hiện tại, confirmed và thực quyền server trước từng tài khoản; không dùng Owner hoặc các nhãn helper làm bằng chứng quyền. Không đổi role/expiry.
- Tối đa **2 profile upserts tạo hồ sơ mới**, **2 cập nhật Auth metadata chỉ trường `locale`**, **4 consent events** (`wellbeing_data` grant/revoke mỗi tài khoản), **2 check-ins**, **0 observations**. Hồ sơ/timeline/lịch sử kiểm thử được giữ, không delete hoặc sửa bản ghi cũ. Các tài khoản đang có1check-in mỗi người; A có1observation lịch sử, B có0.
- [Read-only preflight](MCY_NATIVE_LEARNER_TRIAL_PREFLIGHT_2026-10-13.json)13/10: A8consents/1check-in/1observation, B4/1/0; cả hai confirmed,0active staff/teacher, current terms/privacy, wellbeing revoked, **chưa có profile**. Do đó onboarding tạo hồ sơ và `persistProfile()` gửi cosmetic locale là side effects thực cần tính. Không thêm grant terms/privacy; nếu chính sách/baseline đổi, dừng.
- Dữ liệu giả duy nhất: tên `MCY Native QA A`/`MCY Native QA B`, locale `vi-VN`, hình neutral, timezone thật của thiết bị; check-in `none_now`, energy2, `standalone`, không note/vùng cơ thể. Không thu tình trạng sức khỏe thật hoặc nhận định cải thiện.
- Kết thúc dự kiến: A10consents/2check-ins/1observation, B6/2/0; tổng lịch sử16consents/4check-ins/1observation,2profiles; wellbeing revoked cả hai. Cosmetic metadata giữ mọi khóa khác/không role claim. Không AI consent grant/inference, model/cost mới, migration, deploy, SMTP/template/flag/config-save hoặc Production.

## Quy trình một lượt, do người dùng thao tác trên điện thoại

1. Trước bắt đầu: lấy fresh exact project/org/APK/source readback; xác minh token A/B với `/auth/v1/user` và hash ID, quyền/current consent/counts qua [SQL chỉ đọc](../scripts/sql/native-learner-trial-readback.sql). Khóa lượt bằng intent độc quyền lưu cả baseline và nonce **trước đăng xuất/ghi**. Nếu đã có intent/kết quả, đọc trạng thái, không chạy lại. Không tự inject/đổi token hoặc backup/export session của người dùng.
2. Người dùng đăng xuất **thiết bị này** khỏi tài khoản hiện tại, yêu cầu email mới cho A trong app rồi tự mở liên kết; agent không gửi email, đọc link/mã hoặc mật khẩu. Agent xác minh initiating actor đã được Auth xác nhận; SDK/UI report và server ID hash phải cùng A trước mọi ghi. Email A/B và email quay về tài khoản ban đầu do người dùng chủ động yêu cầu; không hủy phiên trên thiết bị khác.
3. A tạo hồ sơ giả1lần qua onboarding, chọn neutral, không có draft check-in. Giữ terms/privacy hiện tại và AI tắt. Đọc lại1profile/locale và các khóa metadata khác giữ nguyên. Nếu response không rõ, readback trước, không bấm lưu lại.
4. A bật riêng “Lưu check-in trong hành trình”1lần; server latest wellbeing phải grant/current. Chọn Không thấy khó chịu → Bình thường → “Chỉ ghi lại cảm nhận hôm nay, không chọn bài”1lần. Đọc lại đúng1check-in mới, energy2/none_now/standalone/no notes/0new observations và idempotency UUID; ghi receipt chỉ ID/hash/counts, không token. Nếu không xác định commit, dừng và readback, không auto retry hoặc tạo key mới.
5. A đóng Recent/mở **icon thật**, xác nhận còn đăng nhập và bản ghi vẫn trong Hành trình. Không `am force-stop`/shell-launch, instrumentation runner, cài lại hoặc clear data. Thu hồi riêng wellbeing1lần, đọc latest revoked. Thử thao tác ghi với cùng dữ liệu giả sau revoked: client không tạo RPC/bản ghi mới; app hiện Hành trình rỗng cho lượt chưa lưu, không gọi đó là thành công. Baseline readback phải không tăng.
6. Người dùng đăng xuất local và đăng nhập B bằng email mới chủ động. Xác minh B trước ghi; UI Hành trình chỉ có lịch sử B, không còn draft/history A. B tạo profile giả, grant/check-in/revoke đúng như A, mỗi mục1lần. Không gửi dữ liệu A trong request của B. B đóng Recent/mở icon và kiểm bản ghi giữ được.
7. Đối chiếu counts cuối, channel consent Android, payload của2new check-ins và profile/locale, history cũ không bị sửa/xóa; wellbeing revoked A/B. Người dùng có thể quay lại tài khoản ban đầu bằng email mới chủ động sau kết thúc; không ghi trên tài khoản đó. Ghi kết quả từng mục PASS/FAIL/CHƯA CHẠY và kiểm read-only app packages/AI/Owner/ledger không đổi.

## Điều kiện dừng và giới hạn

Drift target/APK/source/actor/baseline/consent/role; profile đã tồn tại khác preflight; cap vượt; sai metadata;5xx/uncertain commit; màn hình trắng; cross-account draft/history; hoặc AI request đều dừng. Quyết định duyệt không thay fresh Auth/authority kiểm tra. Nếu dừng sau grant, revoke của chính actor vẫn nằm trong cap4events; nếu không thực hiện được, báo rõ grant còn active, không tự xóa/đặt SQL.

Native real sign-in/recovery hiện là Owner report và DOM/profile read-only;4new shared-source regressions trong matrix29PASS là web fixtures, không native/Data API acceptance. Phép `force-stop`13/10 đã tái hiện stopped=true/white; receipt vẫn failed/uncertain và đường đó bị retire. Không tuyên bố root cause ROM đã sửa hoặc launcher regression3/3 trên APK hiện tại từ lịch sử03/10.

Ngân sách gói12/10 đã dùng đủ12/2/1. Theo [AGENTS.md](../AGENTS.md), không mở rộng ngầm hoặc chạy lại receipt độc quyền; cần Owner duyệt riêng ngân sách mới nêu trên trước onboarding/consent/check-in. Đây không phải approval mở AI hoặc Production.
