# QC kết quả D0 — 21/10/2026

**FAIL dependency provisioning; các bước cần dependencies còn BLOCKED.** Đây không là app/test/build/native failure và không được tổng hợp thành PASS từ source-preservation.

QC độc lập đọc receipt `D0-OFFLINE-DEPS-v1.json` SHA-256 `46f1ce905ed6c04704cca88a3dca63b383ae789d47a10766717f80a13c1d9e9b` và log SHA `dc0bb67ab0effb0a6fe099a716dca6e24f7161a90cc430e2b30e2e63f30e8eab`. Một lần chạy đã được root cho phép; 18:17:21.410Z→18:18:20.196Z, exit1, normal close, không timeout/output-cap/spawn error.

Lỗi kết thúc: npm `ENOTCACHED` cho request Vite8.3.1 tarball khi dùng only-if-cached. Log cũng giữ các cảnh báo EPERM khi npm dọn một phần node_modules trong isolated tree; không đủ evidence xác định nguyên nhân OS/quyền của EPERM, không suy Vite là dependency duy nhất thiếu. Không có retry/fallback/deletion do Agent sau failure.

QC tự hash lại **479 known-source pins**, 0 mismatch; hai npmrc user/global rỗng đúng0bytes. node_modules một phần tồn tại, không đủ điều kiện dùng như bộ dependencies hoàn chỉnh. Kiểm này chỉ đọc/hash; QC không chạy npm hoặc tests/build/provider/device. Cache/log ghi trong phạm vi D0 được cho phép; không khẳng định zero filesystem effects.

D0 source/control QC trước chạy vẫn là review của đúng control; outcome FAIL được giữ độc lập. Tiếp theo cần một amendment provisioning có nguồn dependency/cwd/config/lifecycle/network/cleanup rõ và independent control QC/root GO riêng. Không tự bỏ offline/ignore-scripts, sửa lock, reuse partial modules như PASS hoặc xoá cảnh báo cũ. Root có thể tiếp tục chuẩn bị source/control khác không phụ thuộc execution.

Web/native/role/content gates giữ nguyên. Không có artifact mới, native restore fix, live write hoặc release acceptance trong D0.
