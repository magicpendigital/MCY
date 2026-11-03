# R3 native package control trước invocation — 21/10/2026

**PASS_N1_N2_N3_CONTROL_SOURCE_SCOPE; không còn P1/P2 trong scope package chuẩn bị. Chờ root trực tiếp kiểm/GO.** Không có APK/build/device acceptance trước process. Reviewer `/root/pilot_release_qc` độc lập với Agent triển khai; QC chỉ đọc/hash/ZIPmetadata, không chạy candidate/native/tool executables.

Đã đọc toàn actual `native-common-invoker-v1.mjs` SHA `b4495d5717682982a24f54d44fcb1c2679c89c58e3b38ccdfa5d9a933b5f56c4`, inspector `9c205384b13f81a8e0093625afb0ecdc0ce4e971b6a715f01cb098d93b3152bf` và freeze `177932ae922b52ba07e4704a46e3381903287f2c59351093f0423a3f803b3e05`. Toolchain SHA `dfdc1414a08c4bf271eeb5e20cf070751fa0fe51670a1a418caea550381a3a30`. **325 control/tool pins** (8+317) trực tiếp khớp hash/bytes; sourcev2/dependencies/publicproposal/commonwebreceipt đã QC và được rebind exact trong control.

## Native build boundary

Fixed managedtree/cwd/realpath và source479guard; từ chối envfile/existingoutput/evidence. Native Vite được cấp cùng pinnedpublicstaging config, scheme `motchutyoga-mcydebug`, riêng nativeweb output; explicit runtime/catalog checks và scans trước sync. Không dùng webfixture config hoặc unconfigured artifact để gọi là live app.

Capacitor sync chỉ Android trong cây riêng; Gradle dùng Java tuyệt đối và cached CLI JAR, **không gọi wrapper**. QC trực tiếp đọc JAR manifest thấy Main-Class `org.gradle.launcher.GradleMain`, Implementation-Version8.14.3; cacheddistribution317pins match. Usergradle.properties/init scripts/init.d đều absent ở lúc QC; cacheddistribution init scripts cũng absent. `--offline --no-daemon`, SDKdownloadfalse, no inheritedproxy/credential/GradleOpts env. Cache thiếu/toolchain mismatch phải failclosed, không fetch SDK/dependencies hoặc thayflags.

Nguồn479 phải vẫn khớp sau capsync/build; generated nativeassets được inventory riêng, không nằm trong sourcefreeze. Unknown source mutation không được allow chung hoặc refresh lock để lấy PASS. Dependency builddirs/cache là effects của nativebuild được mô tả, không ghi D-root modules/APKs.

Existing defaultdebug signing chỉ dùng qua Gradle, không đọc/hash/copy/export keystore bằng Agent. Kiểm certificate digest expected `dd3c8ee6d7ab263842a4dcce514efd398efa45ab54ca19c1c3d83456e54033c2` sau build. Aaptbadging kiểm .mcydebug/vcode1/vname1.0-mcydebug-pilot20261021 và cả defaultVI/ENpilotlabels; source identity đã được root GO hai tệp. Không gọi là versionCode2 hoặc native restore fix.

## Inspector và output

PowerShell NoProfile/NonInteractive chỉ đọc APK/metadata và extract **assets/public/** vào fixedpath trong managedtree; absolute containment/reparseancestor/ZIPentryname/traversal checks, CreateNew, max500entries/12MBentry/80MBtotal. Không extract key/server/env/cap paths. Actual PowerShell backslash literals là một ký tự đúng; không nhầm JSONescaped display là hai ký tự.

Inspector đối chiếu từng N1nativewebfile với APK public bytes; chỉ cho extras cordova.js/cordova_plugins.js, không đưa Node reader/canonical/fixture source vào APK. Scanner và private markers bổ sung có giới hạn, không thay rights/security audit. Native callback string phải có trong compiledJS; đây là source/package fact, không chứng minh actual resolver/Auth behavior trên thiết bị.

Mười một steps finite120/180giây, Gradle600giây, totaloutput4MiB, ownedchildPID/tree cleanup, mọi nonzero/timeout/uncertainclose/source drift đều fail/dừng. Từng step/exit và inspectionreceipt được giữ; no automatic retry. Archive APK+outputmetadata mới và hash/fileinventory sau expectedguards; no adb/install/launch/instrumentation/server/deploy/AI/Auth/datawrite/gitcommit.

## Current status và follow-up

Root có thể GO đúng N1–N3command sau directpincheck, rồi QC actual build exits/APK/cert/labels/public inventory và root preservation. Chưa mở bất kỳ thao tác device nào. NativeHALTED/currentActorVerified=false vẫn còn; buildlabel/scheme/hash không đóng restore/data acceptance.

Human FULLREAL/allprepared/practice/functions và actualdesignatedpeople/reportapprovalscope đã chốt, không yêu cầu chọn lạiunit/hash. Common nativepackage là baselineintegration, chưa có complete reviewed sessions hoặc realparticipant transport/roles acceptance. Current backendproject CLIreadbackv2 đã xác minh exact staging project/org ACTIVE_HEALTHY (SHA `3d96925794169625c69547d1510a767027ed502b4d3c988851fb6cffd492f67f`), supersede unavailablemetadata snapshot trước đó; roles/ledger/ACL vẫn chưa xác minh hiện tại. Web newPreviewprotection/release gates riêng giữ nguyên.

Recovery hiện là dừng dùng cây/artifact mới, giữ failures/preimages/cloudhistory/oldAPK; không rollback native/database hoặc xoá row cũ. Root final/direct verification còn chờ; UI/fullrealworkflow plan và controls cần review riêng.
