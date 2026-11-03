# R3 D0 registry amendment trước invocation — 21/10/2026

**PASS_CONTROL_SOURCE_SCOPE; không còn P1/P2 trong amendment này. Chờ root trực tiếp kiểm/GO đúng một lần.** QC không chạy invoker/npm/network; chưa có dependency PASS. V1 offline FAIL và kết quả QC của nó giữ nguyên.

Đã đọc toàn bộ `deps-registry-invoker-v2.mjs` SHA-256 `f88dd4c9f5a5bd3be675d71b62ed87978e4198240b87b4e9f8eda22ad9d6b659` và freeze `D0-CONTROL-FREEZE-v2.json` SHA `58f78c5e5fbe3aa0e2d6396703ed31a818de48c0e8ec10a34fbacf57ed10a840`. Reviewer `/root/pilot_release_qc` độc lập với Agent triển khai, root là final verifier. 11 pins inputs/dependency/tools trực tiếp so hash/bytes: 0 mismatch, PowerShell exit0.

QC tự đọc lock metadata: **229 entries** ngoài root đều HTTPS `registry.npmjs.org`, tarball `.tgz`, không credentials/query/fragment/link và có SHA512 integrity. Lần đọc đầu PowerShell bị lỗi parse tên property rỗng của lock; lần bổ sung dùng `ConvertFrom-Json -AsHashtable` exit0 mới kiểm đủ229/0invalid. Không sửa lock hoặc control để vượt lỗi công cụ đọc. Control kiểm cùng contract trước child; package/lock và nguồn được pin. Không đổi phiên bản hoặc lấy npm install/unpinned/git/local source để lấp cache.

Một contained move giữ partial node_modules thất bại của v1: fixed paths trong managedtree, realpath của root/partial và không symlink/ancestor escape, destination chưa tồn tại; `renameSync`, không recursive delete hoặc root module copy. Move/config/install lỗi phải dừng, không tự xoá/retry. Control mới và evidence mới riêng, prior failure receipt hash cố định.

Child chạy Node/npm CLI tuyệt đối, cwd managedtree, shell=false/windowsHide, environment OS allowlist. Empty user/global npmrc và exact credential-free project npmrc giữ như v1. Dùng official registry, ignore-scripts, audit/fund/update off, fetch-retries0, fetch-timeout120s, overall10phút/output4MiB; chỉ owned child process tree cleanup. Không kế thừa proxy/provider/credential env, không đọc .env hoặc public binding vào buildenv trong D0. Network tải package là phạm vi mới root chọn để chuẩn bị build; không gọi là zero external network.

Đây là kiểm nguồn/plan về registry tarballs có integrity; không tuyên bố firewall egress đã được enforce bởi command. npm integrity và ignore-scripts không thay app/security tests, nhưng phù hợp provisioning đúng các dependencies đã pin. Cache/OS read-write phát sinh theo npm trong paths ghi ở freeze; không sửa D-root dependencies hoặc source.

Invocations/caps/receipts finite và single attempt; process exit0, normal closed, no timeout/output cap, source preserved mới được PASS dependencies. Trường hợp registry/network/cache/EPERM fail phải giữ outcome và dừng; mọi fallback/thay network policy/lock/lifecycle cần control amendment riêng. Nếu sandbox auto-review từ chối, không đi vòng qua đường khác hoặc đổi tên hành động để lách.

Root kiểm pins/control/archive preconditions hiện tại trước exact command trong freeze. Không có test/build/server/git commit/cloud/role/Auth/native/device permission thêm; web/newPreview protection, native HALTED và human/scope facts pending giữ nguyên. Tiếp theo khi D0v2 kết thúc mới đối chiếu receipt/dependency inputs và review C1/W1/O1/native/UI controls.
