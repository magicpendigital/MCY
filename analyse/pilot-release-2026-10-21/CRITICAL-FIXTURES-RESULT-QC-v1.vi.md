# QC độc lập — critical fixture run v1, 21/10/2026

Kết luận: **FAIL còn giữ nguyên; STOP/no automatic retry.** Receipt thật `ab1f7698ebc4f8019df5d62b24be8584125847e1016f37361fa00755250e06dd`, log `f2ba44c0e9e49167c1d14002a1be521912aa89cc6be2e50f1e8789aae9d7c6ad`, report `057823327c7374511bc1bd744b129d4846c1235c50c1e1bafdb0a88bf18ef3dc` đã đọc và tự hash. Run exit1 normal close, không timeout/output cap; 29 passed/2 failed/0 skipped/0 flaky, thêm một teardown error ngoài tests. Source479 preserved và ports4290/4291 CLOSED theo receipt. Không được đổi thành overall PASS hoặc native/live acceptance.

## Hai assertions thất bại

1. `learner-device-acceptance.spec.ts:73`, gọi từ dòng121 ở cuối account-switch/reload test, dùng global CSS `.mcy-account-home h1`. Actual report cho hai heading cùng `Chào, Device Fixture A.`. FlowStack source giữ entries trong stack, có một outer `data-testid=flow-current`; source boundary ở Prototype635 dùng so sánh route ID. Vì cùng route ID có thể được push lại, không suy tất cả retained entries đều inert/aria-hidden từ source này. Đây là lỗi phạm vi selector được chứng minh; bản thân strict violation không chứng minh B thấy dữ liệu A. Run vẫn chưa hoàn tất đầy đủ case, nên không cấp account-isolation acceptance.

   Bản QA sửa hợp lệ phải scope outer current screen rồi route hiện hành, khẳng định Count1/visible/exact actor và giữ mọi assertions B empty Journey/no A snapshot/no extra save/consent. Không dùng `.first()`, bỏ checks hoặc gọi DOM trùng là harmless accessibility đã đạt. Nếu cần accessibility acceptance của retained cùng-ID, phải có kiểm riêng trước claim đó.

2. `ux-save-feedback.spec.ts:310` đợi nguyên văn `Email đã xác minh.` ngay trên Profile. Accepted source Profile hiện có greeting/accountEmail, nhóm bảo mật và hành động rõ ràng; đúng literal này đã bỏ. Actual current-screen snapshot khớp source. Security panel vẫn có email + ` · đã xác minh`, mô tả dữ liệu riêng từng tài khoản và hành động `Đăng nhập bằng tài khoản khác`. Notifications panel vẫn nói `Nhắc tập chưa mở`, toggle opt-in ban đầu và chưa lên lịch/gửi nhắc.

   Đây là stale assertion so với UI accepted, không chứng minh mất chức năng xác minh email. QA overlay có thể chuyển assert email/verified vào Security panel và assert đúng profile identity hiện hành, nhưng phải giữ no-scheduling/opt-in/other-account/no-write semantics. Phần sau dòng310 chưa chạy trong case này; source presence chưa thay actual test PASS.

## 220 deny proxy requests chưa biết đích

Đọc actual `.vercel/critical-fixtures-v1/egress.json`, tự hash `2236857c111f1343813676214ab422d36495999db6758b4e9bc0effbb6d1201b`: forwarded2478; **deniedConnect220**, deniedHttp0, deniedUpgrade0, capExceeded0, localTransportErrors0. Proxy từ chối mọi CONNECT và upgrade, không mở remote tunnel. Receipt chủ ý không lưu destinations/headers/body. Setup dùng Vite development server `hmr:false`, browser proxy bắt loopback, invalid fixture binding, serviceWorkers blocked.

Không thể phân loại 220 CONNECT thành local HMR, remote app request hoặc browser background từ aggregate này. Không gọi chúng là 220 HMR upgrades: actual deniedUpgrade là0. Không suy có remote request thành công hoặc provider write từ denial. Cũng không thể dùng các số0 của fixture handler để khẳng định browser không cố kết nối ngoài. V1 không đủ observability để kết luận nguyên nhân, failure phải giữ.

Một control v2 có thể loại dev injection bằng static fixture build/preview, giữ original479 sources và artifact bytes freeze, dùng test overlay cô lập và exact `.invalid` config. Nếu đổi proxy, chỉ thêm category counters hữu hạn (exact allowed loopback / exact fictional fixture origin / other / malformed), không export đích/header/body/token; **mọi CONNECT vẫn deny và mọi unexpected vẫn fail**. Không trừ browser/HMR traffic để đạt0. Cần review actual control/source, root GO riêng trước một lượt mới; v1 outputs giữ nguyên, không rerun âm thầm.

## Phạm vi kết luận

29 fixture PASS hỗ trợ từng assertion đã chạy, gồm delayed-client/late response guards và callback mocks; không là exact built artifact test, server role/rights/live Auth, physical native restoration hoặc real participant transport. Common web/APK build/package PASS và root bounded guest walkthrough vẫn có scope riêng; không xóa FAIL mới. Final role docs freeze v4 chưa claim critical fixture PASS, vì vậy supplement failure này không đòi sửa frozen docs để che kết quả.

QC chỉ read/hash actual receipts/report/contexts và nguồn liên quan; không sửa source/test, chạy server/test/browser hoặc provider/device. Hai read-only path guesses tới test files không tồn tại đã được sửa bằng actual source paths; đó là diagnostic query errors, không app/test outcome.
