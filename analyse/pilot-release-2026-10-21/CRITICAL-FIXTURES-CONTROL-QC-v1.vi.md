# R3 critical fixture control trước invocation — 21/10/2026

**PASS_SELECTED_FIXTURE_CONTROL_SOURCE_SCOPE; không còn P1/P2 trong scope. Chờ root directcheck/GO.** QC không chạy fixtures/browser/server/proxy; process outcome và casecounts chưa có.

Đã đọc toàn invoker `5a3ca91d39480cd195eb072046201ad19fe0deefdef05e0bc7083d6c5af71785`, config/setup, exact prior egressguard và ba existing test sources. Freeze `d12dc111af49da22360086c2c9bdea1c555a50dfbd1817e3090e634a41cf2096`; INPUTS `d65366121fc642ddf4ff146f69ddf20e655f28c26025d23c2f69ceb6a7224bdf`. Trực tiếp16pins (có giao nhau) match hash/bytes. Reviewer `/root/pilot_release_qc` độc lập với triển khai, root là finalverifier.

Selection đúng ba existing suites `ux-save-feedback`, `learner-device-acceptance`, `auth-callback`: mandatory delayedclient/route/account guards, frozenretrykey/payload, profile-only/no-draft, deniedconsent/reload/noextraacceptance, PKCEfixedreturn/error/Ownerauthorization. Test tên deviceacceptance vẫn là browserfixtures, không physicalAndroid. Không thêm broad142legacychecks hoặc suy latestbuildaccepted từ tests source.

Invoker cố định sourcefreezev2/effectivedepsv3/controls/toolpins, childcwd managedtree, OSallowlist rồi chỉ cấp `.invalid` fixture URL/key. Không read actualpublicconfig/envfiles/servercredentials hoặc import oldreader. Thực tếselectedtests route mock `.invalid` và abort Supabasehosts; không gửi OTP/email thật. Configabsoluteimports đúng manageddependencies;1worker/retries0/20spertest/10minchild/output4MiB, không browserdownload.

Setup khởi Vite cùng runner/process, strictloopback4290/hmrfalse, envDir control riêng rỗng và fsdeny env/git/vercel/server; trả teardown đóng Vite và proxy. Exact reviewed proxy4291 chỉ forward đúng loopbackorigin GET/HEAD/POST dưới16KiB/10.000requests, denyremoteHTTP/CONNECT/upgrade, không ghi destinations/headers/body. Edgecontext serviceworkersblock và proxy `<-loopback>` ép loopbackqua proxy, không dùng browserprofile thật. Không dựa riêng page.route để bảo đảm egress.

Sauchild bắt buộc exit0/normalclose/no timeout/cap/sourcepreserved, cả4290+4291CLOSED và proxyunexpected0 mới PASS. Unknown/source drift/hang/egress phải giữfailure, dừng; không rerun hoặc bỏ guard để xanh. OwnedPIDtreecleanup finite, newevidence/controloutputs khôngoverwrite; rawlogredaction trước write, report/trace/video/screenshot không lấy privateuserdata (tất cảactor/credentials trong tests là hư cấu).

Root kiểm pins/trốngoutput trước exact invocation trong freeze. Sauprocess QC actual JSONreport/case outcomes/ports/proxy và sourcepins; không cộng processFAIL với focusedcasePASS thành broadPASS. Source/UIfixtures này riêng với immutablecommonweb/Androidartifacts và rootguestcheck.

HumanFULLREAL scope giữ nguyên: fixturesteps là regressionpreparation, không thay realaccounts/roles/rights/session/liveAPI/device/newPreviewprotection/nativeHALTED acceptance. Không cloudwrite, deployment, email, grant hoặc devicepermission thêm. Root final/directverification còn chờ.
