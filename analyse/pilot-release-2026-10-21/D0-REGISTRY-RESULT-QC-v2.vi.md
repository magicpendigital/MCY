# QC kết quả provisioning D0v2 — 21/10/2026

**PASS_PINNED_REGISTRY_DEPENDENCIES_ONLY.** QC độc lập đọc actual receipt SHA `da2a8070f246001948a81aa7692b284266008ef0a2f6396e6a38b126549da8a8` và log SHA `7ad5fc7bb85f5267b713c80c311e093da70fbc376c88844259cac1510dc04040`: 18:23:43.124Z→18:24:47.348Z, exit0, normal close, no timeout/output-cap/spawn error. npm báo added184packages; 229 lock entries đã được kiểm nguồn không đồng nghĩa229packages phải có trên Windows do platform/optional dependencies.

QC tự đọc/hash lại479known-source pins sau process: 0 mismatch, PowerShell exit0; archived v1partial và fresh node_modules cùng tồn tại đúng managedtree. V1 offline FAIL/EPERM log/receipt không bị thay thế bằng PASS mới. Đây là amendment riêng root đã cho phép, không là automatic retry.

QC không rerun npm, chạy executable từ dependencies, app/test/build/server/provider/device. Receipt+source checks đủ xác nhận provisioning kết thúc theo phạm vi; actual build/native/browser tool compatibility vẫn cần checks tiếp. Trước invocation mới bind selected dependency executables/package metadata cùng freeze và current source identity; không suy từ npm exit0 rằng mọi tool chạy được.

Không có app, native restore, roles, content review hoặc release acceptance. Next: source identity amendment đã QC/root GO nếu chọn, freeze mới; rồi actual web/native/UI control review và root GO phù hợp. Giữ private reader relocation và newPreview/native/human gates riêng.
