# R3 source v2 và common web control — 21/10/2026

**PASS_C1_W1_CONTROL_SOURCE_SCOPE; không còn P1/P2 trong scope này. Chờ root trực tiếp kiểm/GO đúng command.** QC chỉ đọc/hash/diff, chưa chạy build/tests/server hoặc inject public config. Đây không là web artifact PASS.

Reviewer `/root/pilot_release_qc` độc lập với triển khai. Freeze `COMMON-WEB-CONTROL-FREEZE-v1.json` SHA `34fb191b11a33ecc7293c96c318c91e80c04655e9a15f420cf1dc6fa6a15b470`; actual invoker `web-common-invoker-v1.mjs` SHA `6d435a1260dbb9db178ef0d8e2f1eb31c2514f4ff31fb4e9ad769aa2e87007c3`, 9.926bytes; đã đọc toàn file và sáu control inputs trực tiếp khớp hash/bytes.

## Nguồn và dependencies hiện tại

SOURCE-FREEZE-v2 SHA `9e9c5c88d7721c4986bf61396dac9dd8a17586377c493971895e70ae77f9d256`: QC tự so479knownfiles, 0 mismatch. So freezev1 đúng hai delta native đã review/root GO: Gradle `1dec0182…38a9c`, parallel EN `d0284aed…c06e6`;477files khác giữ nguyên. Không có app behavior/role/transport mới. Trực tiếp hash35D-root dirty+sáuAPK/metadata:0mismatch. Actual native identity khớp proposed bytes; main/debug/release/package/callback không đổi.

EFFECTIVE-DEPENDENCIES-v3 SHA `b17373a876dc6bda3e3f9e5c97fcef5a3fd479314a65557a0dcb70853ab69810`: QC tự kiểm184installed manifests/version và11toolpins,0mismatch. Bao gồm TypeScript getExePath+native compiler executable, Rolldown/LightningCSS native bindings và hidden dependency lock. 45platform-optional absent được tách; dependency receipt D0v2 exit0 gắn exact hash. Không tự gọi dependency source audit này là compiler execution PASS.

## Review control trước invocation

Invoker bind exact sourcev2/publicproposal/D0v2PASS/effective-dependency hashes và cwd/realpath fixed managedtree. Kiểm source/dependency inputs trước, source sau; từ chối actual .env files và existing archive/evidence để không automatic retry. Không gọi npm scripts hoặc lifecycle hooks.

Public binding đọc riêng old archived publicJS đúng SHA, parse literal không eval: đúng một existing staging origin và một publishable value đúnghash; denysecret classification. Chỉ thêm URL/key vào OS-allowlisted childenv, không ghi envfile/rawkey; không thêm server/provider secrets hoặc nativeAuth/session injection. Đây là retention cùng public staging binding đã QC provenance, không current live ACL/roles/key-usability proof.

Bảy finite steps cố định: runtime, catalog, native TypeScript, Vite web runner config loader, Sites packaging, client bundle scanner, Sites fixture tests. Đã đọc source/config của runtime/catalog/Sites/scanner/test config liên quan; không có browser/devserver/reader/Gradle/install/deploy/AI invocation trong sequence. Envproduction+public config dùng để compile; app không được khởi động bởi build này.

Mỗi child shell=false/windowsHide; timeout120/180giây, totaloutput4MiB, owned-PID tree cleanup, bất kỳ nonzero/hang/uncertain-close/source drift đều fail và dừng. Output redaction không thay env isolation; receipt giữ từng step/exit và không có live acceptance claim. Public/canonical fixture markers và symlinks trong output bị từ chối; build inventory từng tệp rồi archive `dist` trong ignoredmanagedtree. Scanner pattern check có giới hạn, không là general secret/rights audit.

`prepare-sites-build` giữ exact basehosting file để đáp ứng package/fixture contract; không cấp Sites target/publish. Weboutput chưa là uploadable pilot; sourceserver/selectedSnapshot/canonical không chạy hoặc đưa thành participant backend. Plan trước đề xuất backend-unconfigured common artifact đã được supersede trong control này bằng pinned existing public staging binding; receipt phải ghi config provenance đúng bản đó.

## Kết luận và phần tiếp theo

Root có thể GO đúng C1/W1 command sau directpincheck. Sau process phải đối chiếu seven step exits, runtime/catalog/Sites counts thật, archive/currentdist file hashes và sourcepreservation trước verdict artifact. Không tuyên bố trước testcounts hoặc process outcome. O1/bounded UI/native controls chưa nằm trong GO này và cần review tiếp; private reader relocation giữ BLOCKED.

Fresh backend metadata chưa được xác minh (connector INVALID_ARGUMENT không là projectdown/Authdenial/orgproof). NewPreview protection chưa được chứng minh và nativeHALTED/currentActorVerified=false còn nguyên. Không upload/alias/install/device/account data writes/role grants/AI từ commonbuild. Root final/direct verification và matching release packet còn chờ; recovery hiện là dừng dùng candidate/archive, không rollback database/device.
