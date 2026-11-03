# MCY — cập nhật native tương thích learner writer, 13/10/2026

**Bổ sung sau bước QA13/10:** [Báo cáo mới](MCY_NATIVE_LEARNER_QA_2026-10-13.md) ghi nguồn cô lập29PASS, phép force-stop/ADB failed/uncertain, Owner khôi phục từ icon thật và DOM/profile precheck sau đó. [Gói native dữ liệu tiếp theo](MCY_NATIVE_LEARNER_TRIAL_OPERATION_2026-10-13.md) chuẩn bị riêng, chưa được duyệt/chưa chạy; bản app/APK và các receipt trước giữ nguyên. Các hash tài liệu/guidance trong checkpoint cũ là snapshot lịch sử.

**Đã build, cài cập nhật Debug song song trên Air1 Ultra và chuẩn bị project iOS. Owner xác nhận liên kết email mới đã về đúng app và đăng nhập thành công sau sửa callback.** Native dùng actor-bound writer đã nghiệm thu staging12/10. Trạng thái đăng nhập là **USER_REPORTED_PASS** từ phản hồi trực tiếp của Owner; chưa nghiệm thu đầy đủ Auth/check-in trên thiết bị.

## Bản Android đã cài

- Package `com.nilaza.motchutyoga.mcydebug`, version `1.0-mcydebug`, Android Debug signed.
- APK12,016,725bytes, SHA256 `5bf4104b019fbe31597c479ef2511e947803d056d42202b5c007843b5e9f74bc`; [inventory](MCY_NATIVE_ARTIFACT_2026-10-13.json) bind59 packaged public files. Archive `.vercel/mcy-native-20261013/app-parallel.apk`; public assets được đọc trực tiếp từ ZIP và quét secret25text files PASS.
- Build pipeline `npm run android:parallel:build`: runtime28, TypeScript, Vite601modules, scanner23 trước cap sync và Gradle assembleParallel exit0. Bản final sau sửa label PASS; initial build không dùng làm final artifact.
- Sửa resource overlay riêng cho debug/parallel: tiếng Anh có `A Little Yoga (Debug)` / `A Little Yoga (Parallel Debug)`. Actual final APK VI có “Debug song song”, EN/launcher có “Parallel Debug”. Chỉ cài bản parallel; app release và .debug đang có trên điện thoại không được cập nhật.
- `npm run android:install:parallel -- Q88549EEXCUOONGA` exit0: `pm install -r`, app WebView render tại `https://localhost/`. Không uninstall, pm clear hoặc sửa settings.
- [Installed readback](MCY_NATIVE_INSTALLED_2026-10-13.json): actual APK hash khớp archive, firstInstallTime parallel giữ03/10, lastUpdateTime13/10 00:46:24 trên device. Release/.debug giữ nguyên APK hashes và lastUpdateTimes so với [preflight](MCY_NATIVE_PREFLIGHT_2026-10-13.json); không kiểm/đọc nội dung dữ liệu riêng để tuyên bố mọi userdata byte không đổi.
- Native DOM Android/complete, no simulator, welcome và ảnh đã tải. Ảnh `mcy-native-welcome-verified-2026-10-13.png` được xem trực tiếp: đúng Một chút yoga, slogan, CTA khách/tạo tài khoản/đăng nhập hiện. Resumed package trước/sau capture đúng .mcydebug; hash `e359a34339e74fff569cd5fc6034a99dbe68efebc2af8cc0eae4a90be537b305`.
- Ảnh đầu lấy nhầm foreground app khác, **không dùng làm evidence MCY**. [Receipt trung gian](MCY_NATIVE_INSTALLED_INITIAL_REJECTED_SCREENSHOT_2026-10-13.json) giữ để audit; P2 collector đã sửa guard trước/sau resumed package và được review. DOM nền không đủ để gắn nhãn pixels của toàn màn hình.

[Review độc lập native](MCY_NATIVE_LEARNER_COMPATIBILITY_REVIEW_2026-10-13.md) xác minh actual APK package/scheme/cert/ZIP/labels/new writer và pin nguồn; không còn P1/P2 trong packaging/startup/preservation scope. Không trình bày helper13native cases hoặc welcome screenshot là full native Auth acceptance.

## Lỗi email native và sửa Supabase

Owner thử app và báo **“Email mở sai app/trình duyệt”**. Ba evidence thu hẹp nguyên nhân:

1. [Probe request thật](MCY_NATIVE_AUTH_REQUEST_PROBE_2026-10-13.json) chỉ đọc metadata performance: Android native gửi OTP redirect `motchutyoga-mcydebug://auth/callback`, không query parameters; không đọc email/body/code/token và không gọi API.
2. Android resolver cho bareURI này trả đúng .mcydebug; actual APK manifest/resource cũng đăng ký đúng scheme/host/path.
3. [Fresh official CLI Auth probe](MCY_NATIVE_AUTH_CONFIG_PROBE_2026-10-13.json) có17callbacks, chỉ native release `motchutyoga://auth/callback`; thiếu URI parallel. Theo [Supabase redirect guidance](https://supabase.com/docs/guides/auth/redirect-urls), redirect yêu cầu phải nằm trong allowlist; [native deep linking](https://supabase.com/docs/guides/auth/native-mobile-deep-linking) hỗ trợ scheme riêng.

[Preflight](MCY_NATIVE_AUTH_REDIRECT_PREFLIGHT_2026-10-13.json) tạo isolated TOML chỉ khai báo `auth.additional_redirect_urls`, giữ thứ tự/bytes của17URLs, append **duy nhất** `motchutyoga-mcydebug://auth/callback`. Không wildcard, không đổi SiteURL hoặc thêm standard .debug callback chưa nằm trong scope install này.

Sau review R3, official CLI2.119.0 push một lần tại18:03:46.211–18:03:50.662 UTC12/10, tương ứng01:03 ngày13/10 Bangkok. [Apply receipt](MCY_NATIVE_AUTH_REDIRECT_APPLY_2026-10-13.json) `PASS_READBACK`; separate readback có0declared diff và18unmanaged difference hashes giữ nguyên. Các hash này không phải fresh readback toàn13HTMLbodies hoặc secret-key values. Không body/template upload, notification switch, role, SQL, AI, DNS, Vercel hay Production change; không gửi email từ agent.

[Review Auth repair](MCY_NATIVE_AUTH_REDIRECT_REVIEW_2026-10-13.md) ghi source/preflight/direct project scope và giới hạn độc lập. User đã được yêu cầu tạo email mới từ đúng app sau sửa; liên kết cũ không dùng làm acceptance cho cấu hình mới. Không cần cài lại APK sau sửa allowlist.

Ngày13/10, Owner trả lời câu hỏi thử lại email mới trên Air1 Ultra: **“Đã về đúng app và đăng nhập”**. [Phiếu xác nhận người dùng](MCY_NATIVE_AUTH_USER_ACCEPTANCE_2026-10-13.json) chốt phạm vi email mới → đúng app Debug song song → đăng nhập theo báo cáo của người dùng. Agent không đọc email, liên kết, mã, token, UID hoặc dữ liệu riêng; không đo độc lập phiên đăng nhập và không gửi thêm email. Thời điểm thao tác thực tế không được đo; thời điểm ghi phiếu chỉ là thời điểm lưu phản hồi.

[Checkpoint cập nhật](MCY_NATIVE_LEARNER_ACCEPTANCE_2026-10-13.json) bổ sung xác nhận này. Các review R3, receipt install/apply và [snapshot trước thử lại](MCY_NATIVE_LEARNER_IMPLEMENTATION_EVIDENCE_2026-10-13.json) giữ nguyên; trạng thái pending và hash tài liệu/guidance trong snapshot trước là lịch sử, không phải trạng thái hiện tại hoặc hash của tài liệu sau cập nhật.

## iOS và kiểm thử còn lại

`npm run ios:sync` exit0: canonical build/runtime28/catalog0, copy57web files và sync3plugins/SPM. [iOS receipt](MCY_NATIVE_IOS_PREPARATION_2026-10-13.json) đối chiếu từng file với canonical web, có writer mới, scheme `motchutyoga`, ID `com.nilaza.motchutyoga`; scanner25 PASS. `SceneDelegateProxy`/SPM interfaces được review với SDK local. **Chưa build/sign Xcode hoặc kiểm iPhone thật**; Windows sync là chuẩn bị project.

Selected contract/isolation5 và Sites4 PASS exit0. Frozen learner operation manifest/source/evidence giữ nguyên; không rerun exclusive staging apply/live harness. Fresh SQL17:46:35Z đọc ledger21, new writer bodyMD5 `ba61a962de9c9fdfc364ad6fe83837e6`, old client denied, Owner definitionMD5 unchanged, AIoff/version1/model unset. Không có thêm consent/check-in/observation do agent trong lượt native này; lịch sử12/2/1 trước vẫn giữ.

## Giới hạn và bước tiếp

- Email mới → đúng app → đăng nhập trên Android đã được Owner xác nhận. Khôi phục phiên sau mở lại app, đổi tài khoản, thu hồi consent và lưu/readback check-in trên thiết bị vẫn CHƯA CHẠY trong acceptance này; đây là bước kiểm learner flow tiếp theo. Không suy ra các mục đó PASS từ đăng nhập thành công.
- Welcome/startup ở một lần install/resume không chứng minh cold-start regression, TalkBack, keyboard, YouTube native playback/privacy hoặc toàn bộ learner loop.
- Hai tài khoản disposable từ matrix trước có wellbeing revoked; nếu dùng lại trong app, cần consent mới. Không tự mở rộng write budget hoặc dùng token/role đã hết hạn.
- iOS cần Mac/Xcode/signing và iPhone thật.
- Bốn migration pending và catalog chuyên môn/rights vẫn có gate riêng; AI tiếp tục off, Production không promote.
- Các isolated Auth config11/10 ghi17URLs là lịch sử, không push lại để xóa URL native mới. Lần cấu hình sau phải lấy18URLs hiện tại làm baseline và kiểm drift trước apply.
