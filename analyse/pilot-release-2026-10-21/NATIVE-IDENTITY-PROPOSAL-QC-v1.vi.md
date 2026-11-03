# QC đề xuất định danh native — 21/10/2026

**PASS_PROPOSED_TWO_FILE_SCOPE; không còn P1/P2 ở đề xuất này.** Chờ root GO cho source application sau D0v2 đã đóng, trước common web/native final-control freeze. Chưa áp dụng source, build, install hoặc thao tác device. Timing này supersede câu “sau common web build” của proposal; dùng một SOURCE-FREEZE-v2 chung để không làm drift freeze khi chạy build.

Reviewer `/root/pilot_release_qc` đã đọc proposal, actual preimages `android/app/build.gradle`, parallel `values-en/strings.xml` và main AndroidManifest trong managedtree. Main manifest dùng `@string/app_name` cho app và `@string/title_activity_main` cho launcher activity; scheme giữ resource riêng. Root là final verifier/GO.

Actual proposed files đã được diff trực tiếp so preimages: đúng ba replacements trong parallel Gradle và hai EN labels; diff exit1 là có khác như dự kiến, không là test failure. Proposal SHA `019f8c98367c54b665a6c719bb3ae8ea8e545a8a46ae97d5556729e2ecf0e62b`; preimage Gradle `8c041d55b98c022564b5d7892ae1cd91ab4fa5586213457404a7c9dff741a8bd`, EN `545e818eae5ac7f0bee2f5b98c8c383cb96751ba13d9353f1fe82e0b2d53d348`; proposed Gradle `1dec0182686b9b6c0c2732017d817773895f5b15ae3672032ebc55bf4d238a9c`, EN `d0284aed266d81ccfbff979556faaf844b9646cca2249444bcb26b21e23c06e6`. Agent phải copy exact proposed bytes, không thêm sửa ngoài bảng.

Chỉ trong parallel: versionNameSuffix `-mcydebug-pilot20261021`; hai default resValue thành `Một chút yoga (Pilot 21/10)`; hai string của EN parallel thành `A Little Yoga (Pilot 21 Oct)`. Không đổi package/scheme/cert/defaultConfig/debug/release/main/other locale resources. Không cần sửa runtime lock hoặc frontend để đổi nhãn này.

Giữ versionCode1 được mô tả chính xác: nó không phân biệt old/new APK; label/versionName và exact APK SHA/manifest làm việc đó. Trong scope parallel debug preparation, đây không là P1/P2; source/build metadata phải ghi versionCode1 thật, không gọi là versionCode2 hoặc monotonic release upgrade. Chưa có installation acceptance.

Trước áp dụng lưu đúng hai preimages, root chốt timing/ownership; sau áp dụng Agent cung cấp actual diff và freeze mới. QC kiểm chỉ expected replacements, unchanged debug/release/defaultConfig, package/callback và source/preservation pins; native invoker phải bind freeze mới. Common web final control cũng rebind freeze mới dù native identity không đổi JS/web feature.

Sau build cần kiểm APK package/versionName/versionCode/cert/default+EN labels/scheme và packaged public bytes; source review không thay package inspection. D-root APK/debug/release/history phải giữ nguyên. Pilot label không đóng native HALTED/currentActorVerified=false hoặc cấp quyền cài/re-login/force-stop/shell-launch/clear-data, không mở live writes. Recovery hiện là ngừng dùng candidate; không tự rollback thiết bị.
