# R3 exact-artifact guest viewer trước invocation — 21/10/2026

**PASS_GUEST_VIEW_CONTROL_SOURCE_SCOPE; không còn P1/P2 trong boundedguestview.** Chờ root trực tiếp kiểm/GO. QC không khởi động server/browser hoặc gửi HTTP. Root có thể dùng tty để gửi Ctrl-C graceful và thu đúng closingreceipt; không cần visiblewindow.

Đã đọc toàn control `artifact-guest-server-v1.mjs` SHA `e3a1145180264fef28e9ce6bf9e65acfcbe4ae9ff5452d5f174f4984707b16e8`; freeze `86515772019782e07b32d88cf0a966dfd1a85187a1617bc8a5f597cd5b53bc7f`. **62 pins** (3controls+59artifactfiles) trực tiếp khớp hash/bytes. Serverbind `127.0.0.1:4288`, fixed15min, không childprocess/remote fetch/provider/sdkcall trong server.

Exact59publicfiles được verify lúcstart và từng request, realpath/symlink/containment guards; không rewriteHTML/JS hoặc serve source/config ngoài allowlist. GET/HEADonly, fixedHost/origin, queryallowlist, unknownAPI/write/path không SPAfallback. CSPselfscript/connect, noframe/object/worker/form/base, no-store/nosniff/referrernone/corpSameOrigin; fixedheader/requesttimeouts; log countsonly, không headers/body/cookie/query/path/rawkey.

Trước liveguestUI root nên kiểm bounded local negative probes: unknownAPI/path404, unsupportedquery400, wrongHost/methoddenied, cùng exactindexbytes+CSPheader. Đây chỉ staticserver forbiddenpaths, không gửi dữ liệu tới backend. Rootguestwalkthrough giới hạn Welcome/guest/no-save/navigation/Journey/Profile/coursepreplay; không playback/externalnavigation/login/consent/profile/check-in mutation hoặc sửa storage để giả actor. CSP không là permission test cho Supabase hoặc firewall chứng minh mọi arbitrary browser navigation bị chặn; không claim realAuth/roles/participant/backend/native acceptance.

Shutdown SIGINT/SIGTERM/fixedtimeout đóng connections và ghi fixedreceipt một lần; root kiểm port/processclosed và receipt, không suy cleanup từ time elapsed. Servererror/changedhash/unknownruntime behavior dừng và giữ evidence; không automaticrestart hoặc sửaartifact để demo chạy. HTTP/browser/runtime checks còn BLOCKED/unrun tới rootinvocation.

Reviewer `/root/pilot_release_qc` độc lập với triển khai; root là final/direct verifier. Commonwebcompiledbytes đã QC riêng, không gọi viewer sourcecheck là UI regression. Fullrealrequest đã chọn không bị thay bằng guestdemo: đây là root trực tiếp kiểm commonartifact trong quá trình triển khai; realfullworkflow/session/role/content operations còn riêng.

Supplement packagedcallback: root directrecord SHA `694582a9c8c9a6d4488265eef0e1c366f34b23bd7c929a0248b9fa75a3fb3dde` trên đúng APK `e1b036…97da7`, aapt2XML/resources exit0, MainActivity VIEW/DEFAULT/BROWSABLE và resource scheme resolve `motchutyoga-mcydebug://auth/callback`. Nó đóng **package intentfilter metadata gap** đã nêu trong frozen nativeartifactQC; không là physicalresolver/login/session/currentactor acceptance. FrozenQC cũ giữ nguyên, không rerunGradle.

Webupload/alias/nativeinstall/device/livewrites/roles/AI vẫn không được viewerGO mở. NativeHALTED và newPreviewprotection gates giữ nguyên; recovery là đóng viewer và ngừng dùng candidate, không rollback dữ liệu/device.
