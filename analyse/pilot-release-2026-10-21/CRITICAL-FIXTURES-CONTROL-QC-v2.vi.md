# R3 độc lập — QA amendment v2, trước invocation

Kết luận: **PASS cho một lượt fixture QA v2 sau root direct-check/GO riêng.** Không còn P1/P2 trong control/diff được review; chưa có test/build/browser result mới. V1 FAIL và nguyên nhân CONNECT unknown không thay đổi.

Freeze `CRITICAL-FIXTURES-CONTROL-FREEZE-v2.json` SHA `a695b8619ad6c48d847bdf3f9d27b89ca232306e84a92c859669456b518deeba`; runner `43ade6d9f2967c0fdbd657447c62801efcbbfe59243db28fc1056817502d1823`; inputs `67bd8035f12f1cafee9741e7ff327f4e26ba1ef6fe42288a2c7977df76c7527d`; overlay `220a54922f83afc90e9d916af5cfc0ae359aab5bbd69fad98627ba8faf070a6b`.

Đọc full runner/setup/config/proxy và amendment; diff trực tiếp original→copied tests. Tự hash **786 pins, 0 mismatch** gồm 479 original source, controls, overlay và cached browser. Bảy physical copies gồm ba tests và bốn relative-import modules; chỉ hai copied tests đổi, auth-callback và bốn module giữ exact bytes. Imports ngoài closure resolve pinned managedtree dependencies. Original tests/app/commonweb/APK và v1 receipt không sửa.

## Hai thay đổi assertion

Learner account helper dùng outer `flow-current` Count1, direct Profile route active Count1/visible/not inert/not aria-hidden; heading Count1/visible/exact actor A/B; logout scoped cùng route enabled. Không `.first()`. Toàn bộ account-switch/reload, B empty Journey/no A snapshot, đúng save/consent counts giữ nguyên. Không suy accessibility toàn bộ retained same-ID entries đã đạt từ helper này.

Profile assertion kiểm actual fixture email; security panel thêm email + ` · đã xác minh`. Các assertion notification chưa scheduling/toggle Tắt, account-private copy, khác email login và no-write giữ nguyên. Đây là cập nhật QA với accepted UX/source; không xóa chức năng hoặc thay đổi app để đạt test.

## Runtime và egress

Setup build fixture riêng bằng Vite API từ original app không đổi, exact invalid backend/publishable fixture trong env allowlist, empty envDir, output mới dưới isolatedtree và fail nếu đã tồn tại. Không Vite dev/HMR; không thay delivery dist/archive. Inventory output đọc vào memory, cap80MiB/1000files, link denied; static loopback4292 GET/HEAD, exact Host, MIME/nosniff/no-store/CSP. Callback route trả fixture index; không ghi/log header/body/URL secrets. CSP chỉ self và exact `.invalid` connect phục vụ route mock; frame/object none.

Proxy4293 vẫn forward chỉ exact loopback origin với GET/HEAD/POST và body16KiB/cap10000. Mọi CONNECT/upgrade/HTTP ngoài origin đều deny và tính unexpected. Thay đổi duy nhất vào proxy là finite CONNECT counters loopbackExpected/invalidBackend/other, không export đích/headers/body, không loại category nào khỏi failure. V1 220CONNECT không được gán nguyên nhân bởi thay đổi này.

Cached Playwright Chromium headless revision1228/browser149.0.7827.55 khớp installed browsers.json và292 browser file pins; không download, debug.log không đọc/pin. Đổi browser là control/environment amendment có khai báo, không phải bằng chứng Edge gây lỗi. Context mới/serviceWorkers blocked/proxy bắt cả loopback, không user browser profile.

Runner chỉ31 selected tests,1worker/retries0/20s testcase/10min child/4MiB output; taskkill giới hạn owned PID tree, windows hidden, cleanup checks ports4292/4293. PASS cần report31 expected/0unexpected/skipped/flaky, exit0/closed, không timeout/cap, freeze/tool/package/control giữ nguyên, ports CLOSED và proxy unexpected0. Log keys/JWT được redact; outputs fixed mới và no automatic retry. Quá trình fail vẫn giữ receipt/log/report; không lặp dưới cùng GO.

Chưa build/test/browser/probe bởi QC agent. Root cần đọc actual controls và cho exact invocation trước lead chạy. Kết quả sau chỉ fixture scope trên compiled invalid-config output; không là byte-exact delivery artifact, physical native/Auth/restore, current live role/ACL/rights/content session hoặc FULL participant acceptance. Common preparation/release/native HALTED/protection gates không mở thêm.
