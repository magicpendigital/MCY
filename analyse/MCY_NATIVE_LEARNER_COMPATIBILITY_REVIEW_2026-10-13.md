# MCY — review độc lập bản native tương thích learner writer

Ngày báo cáo là **2026-10-13 Asia/Bangkok**; review window **2026-10-12 17:37–17:56 UTC / 2026-10-13 00:37–00:56 Asia/Bangkok**. Timestamp dưới đây giữ đúng UTC, không đổi evidence cũ thành kiểm thử mới.

**Không còn P1/P2 trong phạm vi source/exact APK packaging/startup/preservation được review; screenshot mismatch đã đóng bằng ảnh mới. Physical native Auth hiện FAIL theo user report “Email mở sai app/trình duyệt”, đang điều tra.** Không nghiệm thu sign-in hoặc health writes từ startup PASS. Đây là R3 theo `skills/mcy-change-review/SKILL.md` và review matrix vì đóng gói Auth/consent và bundle cho thiết bị. Reviewer đọc AGENTS hiện hành, release runbook, code và dirty checkout; dùng Supabase skill cho native Auth/client. Không dùng kết quả này để mở general release checker hoặc Production.

Reviewer không build, chạy ADB, cài/khởi động app, đọc `.env`/token, yêu cầu email/đăng nhập, ghi consent/check-in, gọi cloud hoặc inference. Parent thực hiện build/install nếu các kiểm tra đạt. Reviewer chỉ review nguồn, đọc artifact/receipt và chạy checks local không tạo application side effects. Frozen manifest/packet/reports 11–12/10 giữ nguyên.

## Scope và source binding

User13/10 yêu cầu triển khai bước kế tiếp. Acceptance12/10 chọn cập nhật native tương thích sau selective staging learner writer. Bản được review là **parallel `.mcydebug`**, package `com.nilaza.motchutyoga.mcydebug`, callback `motchutyoga-mcydebug://auth/callback`, debug label riêng. Release `com.nilaza.motchutyoga` / `motchutyoga` và `.debug` / `motchutyoga-debug` giữ nguyên. Không uninstall app cũ hoặc xóa dữ liệu để xử lý lỗi signing.

Independent offline verification **PASS exit0**: manifest SHA256 `13521cea066fa99467d23cca987533e03339efd019bbd4a09dc287b890ae2143` đúng; 67 path/hash records /44 unique root paths khớp (gồm records trùng của isolated migration inputs). Đây là kiểm bytes local, không official ledger mới hoặc authorization mới. Native build cần artifact hash riêng vì compile-time callback scheme khác web; không bắt APK bytes phải bằng hosted web artifact.

Client source giữ đúng source đã được review: Prototype `58b8845c…`, supabase `e4c5f2b7…`, learnerData `7e007bde…`. `saveLearnerCheckin` gọi exposed RPC `save_my_checkin_for_current_user_with_current_consent` với `p_expected_user_id` của initiating actor, đầy đủ date/timezone/energy/body/capture/idempotency/observations và locale-neutral `region_code`. `getAccountBoundSupabaseClient` chụp token của confirmed/non-expired expected UID; không chuyển sang shared session mới sau await. UI session/route generations và uncertain exact-payload retry keys giữ source đã review. Không sửa database candidate hoặc các pending migration.

## Build/install source review

`android:parallel:build` chọn scheme riêng, JDK21+ có compiler thật, runtime integrity và TypeScript trước Vite. Vite output vào unique `mkdtemp` dưới temp root; known-secret scanner chạy trước Capacitor sync. `MCY_CAPACITOR_WEB_DIR` chỉ trỏ bản temp cho sync này; canonical config vẫn dùng `dist/client` khi không override. Chỉ assembleParallel. `finally` chỉ xóa exact generated temp child với prefix đã kiểm; không đổi shared canonical dist hoặc uninstall device package.

Gradle `parallel` kế thừa debug, applicationIdSuffix `.mcydebug`, matching fallback debug, debug label và custom scheme riêng. Android manifest intent-filter khớp scheme/host `auth`/path `/callback`, activity singleTask; FileProvider authority có `${applicationId}` nên không trùng giữa variants. MainActivity giữ Capacitor BridgeActivity. Không tạo release artifact hoặc đổi release identity.

Installer chọn explicit connected serial hoặc duy nhất một device; không tự chọn khi có nhiều device. Nó yêu cầu output-metadata đúng variant/package có suffix khác release; push vào fixed temp device path, `pm install -r`, xóa chỉ APK temp và launch đúng component. Không uninstall/`pm clear`, không fallback thay package để vượt signature conflict. Startup probe đọc rendered app root qua WebView debugger, tháo đúng forward port trong finally; đây chỉ là render-startup evidence, không đăng nhập/check-in evidence.

**Metadata file không phải chứng minh cryptographic cho nội dung APK.** Final artifact review phải xác nhận actual APK package/scheme/signature/contained assets, SHA và scan. Không suy ra từ output-metadata rằng bất kỳ APK cạnh nó đều đúng package. Signature conflict phải dừng và giữ app/data đang có; không uninstall làm workaround.

Build/install `node --check` **PASS exit0**, không thực thi hai scripts. Không có source edit trong review.

## Native Auth review và helper checks

Native Auth lấy compile-time `VITE_NATIVE_AUTH_SCHEME`; fallback release scheme chỉ khi không override. Native redirect không thêm workspace/email locale query; locale lưu cosmetic metadata, không role. PKCE client hiện hành persist verifier/session trong native origin. `appUrlOpen` và `getLaunchUrl` đi qua dedup helper, exact callback validator và một SDK `exchangeCodeForSession`; pending timestamp bị xóa sau success. Source không dùng callback bearer fragments để tạo session.

Independent **13 helper assertions PASS exit0** trực tiếp import unchanged TypeScript dưới Node25: correct parallel pending PKCE code accepted; release/.debug schemes, wrong host/path, bearer-token fragment, code whitespace denied; no pending, expired15-minute window/future timestamp denied; duplicate/oversized URL rejected. Initial ad-hoc TypeScript transpile launcher lỗi enum export; đổi launcher sang Node native type stripping, không đổi source/test để làm đạt. Helper checks không gọi Auth hoặc gửi email.

Guard script vẫn cần SDK PKCE verifier thực tế và server authorization; pending timestamp không thay verifier/role check. Valid-code helper không chứng minh email callback hoàn tất trên thiết bị. Parent/device evidence phải phân biệt startup, callback dispatch, real sign-in và actual persisted check-in; phần chưa chạy ghi rõ.

Đối chiếu current [Supabase mobile deep linking](https://supabase.com/docs/guides/auth/native-mobile-deep-linking), [PKCE flow](https://supabase.com/docs/guides/auth/sessions/pkce-flow) và [Capacitor App API](https://capacitorjs.com/docs/apis/app): custom scheme/redirect allowlist và both launch/open handlers cần đồng bộ. Changelog markdown không fetch được do content type; HTML fallback [changelog](https://supabase.com/changelog) đọc được. Thông báo12/10 về TLS cipher deprecation áp dụng từ10/11 sớm nhất không phải lỗi native đã tái hiện; lượt này không kiểm TLS handshake/provider acceptance trên device.

## Exact APK và nhãn Debug

Parent final build sau sửa nhãn EN được archive tại `.vercel/mcy-native-20261013/app-parallel.apk`. Independent read-only APK hash/size **PASS**: **`5bf4104b019fbe31597c479ef2511e947803d056d42202b5c007843b5e9f74bc` /12,016,725 bytes**. [Artifact receipt](MCY_NATIVE_ARTIFACT_2026-10-13.json) SHA256 `cc8ad85020b3bffe78a0278a41f49ded209311dc4534d6d52bc19cd61b418a94` capture17:44:26.6193206Z. Reviewer đọc direct ZIP và đối chiếu từng length/hash của toàn bộ **59 `assets/public` files** với receipt và extracted public directory; không chỉ tin parent extraction. Inventory không thiếu/thêm file. Known-secret scanner trên exact matched extraction **PASS exit0 /25 text files**.

`aapt2` đọc actual compiled APK **PASS exit0**: applicationId `com.nilaza.motchutyoga.mcydebug`, versionCode1/versionName1.0-mcydebug, minSdk24/targetSdk36, debuggable=true; VI label “Một chút yoga (Debug song song)”, EN label **“A Little Yoga (Parallel Debug)”**. Resolved resource `custom_url_scheme`=`motchutyoga-mcydebug`, manifest host=`auth`/path=`/callback`, FileProvider authority riêng `.mcydebug.fileprovider`. `apksigner verify --print-certs` **PASS exit0**, certificate `Android Debug` SHA256 **`dd3c8ee6d7ab263842a4dcce514efd398efa45ab54ca19c1c3d83456e54033c2`**. Signature verification không chứng minh installed certificate hoặc package data preservation; cần parent device receipt.

Source patch chỉ thêm `android/app/src/parallel/res/values-en/strings.xml` và `android/app/src/debug/res/values-en/strings.xml`, giữ selected brand “A Little Yoga” và explicit debug identity. Production resource diff empty; không đổi main name/icon/mark/slogan hoặc learner screens. Đã đọc `mcy-brand-ux`, brand guidelines/design system/tokens để review copy. Actual parallel APK xác minh EN Debug; `.debug` mới chỉ có source overlay, không claim bản `.debug` trên device đã được thay. Initial EN label thiếu Debug là intermediate trước final rebuild, không dùng làm acceptance.

Contained main chunk **`assets/index-DrQV5pJU.js` /SHA256 `d09ac448ece52abb34b5ca5d8c7af3173210e145f3f7ad0906ab5c0c0642855f`** trực tiếp có full-payload new writer và `p_expected_user_id`, captured-token custom client, exact native parallel callback, native pending/dedup/PKCE exchange. Public target là đúng `mhumbczqrzutdnraafhs.supabase.co`; không log publishable key value. Không có code/config edit bật AI trong scope này; previous AIoff và empty catalog là historical server checkpoint, reviewer không đọc live server state mới13/10. APK không tự chứng minh provider processing được mở hay đã hoạt động.

Archiver source review/syntax parser **PASS /0 errors**, không thực thi script: exact owned archive path, refused different existing APK/assets, ZIP traversal/lexical escape/immediate directory-link guards, no deletion; current `.vercel`/archive/public/assets ancestors cũng được đọc và không là reparse points. Reviewer independently verified exact final APK bytes thay vì dùng metadata để suy ra identity. Receipt ghi artifact preparation, không release authorization. Không coi limited archiver là extractor tổng quát cho archive không tin cậy hoặc tự reuse path có drift.

## Device và iOS checkpoint

Parent installed receipt capture17:48:14.780Z ghi exact archived APK hash được cài trên Air1 Ultra /serial `Q88549EEXCUOONGA`. Release và standard `.debug` APK hashes/firstInstallTime/lastUpdateTime khớp preflight; `.mcydebug` firstInstallTime giữ03/10, chỉ APK/lastUpdateTime cập nhật. DOM thuộc Android/native có welcome/nonempty root/images ready và no simulator; parent không yêu cầu email/health writes/AI. Reviewer chỉ đọc receipt, không thao tác ADB hoặc đọc private user data. No uninstall/pm clear theo nguồn/receipt và preserved package timestamps không chứng minh byte-for-byte private data/real account restoration.

**P2 visual receipt mismatch — CLOSED.** Initial `publicWelcomeScreenshot` hash `fe77eafcea601aa673d68fc0b7a0f2d5d7767ac9754c6255fc25dd3abf87dad3` khớp local file, nhưng reviewer trực tiếp view pixels thấy app **“Tiệm Nhỏ / Quầy đang nghỉ · ngày 4”**, không phải MCY welcome. WebView DOM có thể đúng MCY nhưng screenshot foreground khác; initial receipt không đủ chứng minh MCY visible UI. Parent giữ [rejected initial receipt](MCY_NATIVE_INSTALLED_INITIAL_REJECTED_SCREENSHOT_2026-10-13.json) SHA `6d65b93ecdbbbf42c18e14c647bb20fb2512f06899bd018dd91bae434dc1c83e` và ảnh cũ; không suy ra APK/product defect hoặc bỏ assertion để làm đạt.

Final verifier thêm resumed-package check trước **và** sau screencap; chỉ public welcome của exact package mới được lưu, và status vẫn yêu cầu pixel review. Parent đưa đúng app lên foreground một lần, không force-stop/clear. [Final installed receipt](MCY_NATIVE_INSTALLED_2026-10-13.json) capture **17:51:48.800Z**, SHA **`32309747d34d17683f869f0795fb5d04cb344f0e23d7de7a6493f7cc7b2e331c`**, ghi `.mcydebug` trước/sau ảnh. Reviewer đối chiếu receipt metadata với preflight bằng local verifier **PASS exit0**: release/.debug hashes và install/update/version metadata nguyên vẹn; parallel firstInstallTime giữ nguyên và installed APK hash đúng archive. Reviewer không tự gọi device API.

Reviewer trực tiếp view final PNG `mcy-native-welcome-verified-2026-10-13.png`, independently hash **`e359a34339e74fff569cd5fc6034a99dbe68efebc2af8cc0eae4a90be537b305`** khớp receipt: đúng MCY mark/name/slogan, welcome image, khách/tạo tài khoản/đăng nhập đều visible trong native viewport; không simulator frame hoặc white screen ở snapshot. Đây là startup visual acceptance cho ảnh này, không long-session/keyboard/landscape/a11y hoặc Auth acceptance. Verifier source/syntax **PASS exit0**, PID-owned WebView, bounded read-only DOM/CDP và port cleanup; không chạy script bởi reviewer. No automatic screenshot PASS chỉ vì filename/hash hoặc foreground string.

**Steering mới sau startup capture: `FAIL_USER_REPORTED_INVESTIGATING` cho physical native Auth.** User trả lời “Email mở sai app/trình duyệt”. Trường `NOT_RUN_USER_TRIAL_PENDING` trong startup receipt là checkpoint trước human trial, không trạng thái nghiệm thu Auth hiện tại. Exact scheme trong APK/helper PASS không phủ định user report hoặc chứng minh Supabase redirect/email/client dispatch thực tế đúng. Parent đang kiểm live redirect/allowlist/Android routing; không có verified root cause/fix trong phạm vi report này. Cần follow-up diff/config review và user/device sign-in xác nhận sau sửa. Reviewer không yêu cầu link email/token hoặc tự gửi email, đăng nhập/health writes.

Parent báo canonical build/`cap sync ios` PASS. Reviewer đọc generated iOS config có `dist/client`, bundle `com.nilaza.motchutyoga` /scheme `motchutyoga`, đúng plugin list; independently scan `ios/App/App/public` **PASS /25 text files**. Main chunk `index-CLgWYXPw.js` /SHA256 `f9287129c8bbb084d1ed7fd21a6623674b8baf87d848b9f5c1b266c801b5cb7b` có new writer/expected UID/canonical native callback. SceneDelegate forwards cold launch/open/universal-link callbacks vào `SceneDelegateProxy`; các signatures đã đối chiếu SDK8.5.2 source có thật. Chưa có Xcode/signing/iPhone run trong lượt reviewer; generated assets/`cap sync` không chứng minh một app iOS đã build/cài/đăng nhập.

## Source hashes đã review

| Input | SHA256 |
| --- | --- |
| Build debug/parallel script | `0920fa062ce063e12d2a161372b62bb9da89bfeca1ee3bfd7b8f51b7281a642e` |
| Install debug/parallel script | `27bfc0f449ec7f6bb0c38e8cc384e3feabca4da49c300f89fe520f928f088b4d` |
| Capacitor config | `e60bed34795177dfd8eb24cb35ad89b6c63905a924880589657cd80c295f85ec` |
| Android app build.gradle | `8c041d55b98c022564b5d7892ae1cd91ab4fa5586213457404a7c9dff741a8bd` |
| Android source manifest | `2fd86858d5c9d6a69b03b57b9665555a74cfebdc2e79832d5ca10ed30bba5d43` |
| Prototype | `58b8845cf5790c251e85554a27a74b9cf6d41f1c1568330868a205a4bbb84bd0` |
| Supabase client | `e4c5f2b7fb84f69dff28b4af13e09b12ee7338dfbd7789ca760e8cc22ba108c9` |
| LearnerData | `7e007bde10cda2d45e1c187e1a2e1f9d1d6f0999d3e185945dd68a6077019776` |
| Native Auth helpers | `bece108aecf68e042a55696be215d36b99950d78290649a83b5f8f244d15770f` |
| Bundle scanner | `ef5c0ae608e91ed55c68dba2950a760731b3af5f8e1ef209773c556225c11138` |
| Package lock | `f983447a10aaeb56091f43bf99ac5f9a01040e6c8a4b95bedf2f98d29cfd3fc6` |
| Parallel EN label overlay | `545e818eae5ac7f0bee2f5b98c8c383cb96751ba13d9353f1fe82e0b2d53d348` |
| Debug EN label overlay | `11589e9b19fadfc681b27f8de9264b7018817f3b8aae1b6dd9082c3989990331` |
| Native artifact archiver | `9faf7ba410432cec7b7ac254d75d50be126f29d3f0255546fc73d2d48bb629a9` |
| Final installed verifier | `9ad8e18b3f7848973daba171200636b203a64f1bf06d88e72e4dfe2a67ad94b6` |
| Device preflight receipt | `49bfbbeab1d7702c85d22fd2ce1443e4f226e39da62f98be46f92f611ae06d8e` |
| iOS Info.plist | `482b8294169408a103c149f091f35d2172ad2968df7c3a3ccb5402c79ea3ae26` |
| iOS AppDelegate | `481e2ad8672b14acbd3e3df65acdc6d046526ae542b7bec903cf842fc68d9e49` |
| iOS SceneDelegate | `738b9b96bb71d34d80cd8c1183cf7f8f6f2e789c64e46fb5fe6777a35ae12dfd` |

Known-secret scanner kiểm text extensions và Supabase secret/service-role/JWT, OpenRouter key/variable patterns; không gọi đó là exhaustive secret/security scan. Debug WebView inspectability và existing allowBackup cần release-specific review trước production; lượt này không mở distribution ngoài debug device scope. UI136/R3/DB live41 từ checkpoint11–12/10 là evidence lịch sử cùng client/SQL source, không suite vừa chạy lại hoặc physical-native acceptance. AI/catalog/teacher/cap/admission/Production và positive Owner-config-save gates giữ nguyên.
