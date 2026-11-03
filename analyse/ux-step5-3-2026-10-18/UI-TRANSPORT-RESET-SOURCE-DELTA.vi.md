# Bổ sung source: socket reset của proxy kiểm thử

Trạng thái: SOURCE READY FOR INDEPENDENT QC; chưa có quyền chạy lại. Bổ sung này giữ nguyên [handoff đã frozen](UI-SOURCE-HANDOFF.vi.md), SHA256 `9131d6b8da83d788cb2e36d15075ed611f07706868916b31025f7b7b44da39c7`, và toàn bộ lịch sử chạy. Chrome trước đó dừng vì unhandled socket `ECONNRESET`; Edge có 15 assertions đạt nhưng process FAIL do 71 CONNECT bị chặn. Không suy nguồn hoặc nguyên nhân của 71 CONNECT từ lỗi transport này. Chưa chạy 12 mapped regressions; Owner preview vẫn blocked.

## Delta giới hạn

Candidate: `.vercel/ux-step5-3-20261018-v1`.

| File | SHA256 trước → sau | Bytes sau |
| --- | --- | ---: |
| `scripts/unit-review-egress-guard.mjs` | `9e0ac189f37f3d00a9cfca756a96e9142c1a6bc01a6dc752c72e4d7dcd3da58b` → `a525750ca14e5c3586bd217ff4e6c04c43548618b9a87bbc788395d965cbcc9d` | 4391 |
| `tests/unit-review-egress-guard.test.mjs` | `7461b66317a4386fd76e3042383e2c3fa7d95af2aa88deae063951801ee8a921` → `e63da85e9e602388598f087fa84965d679f760eb5b8ade52cdc92ca1512619aa` | 4758 |

Proxy gắn listener `error` vào accepted socket ngay ở sự kiện `connection`, trước khi xử lý CONNECT/upgrade. Client hủy/reset socket sau phản hồi 403 không trở thành lỗi EventEmitter chưa xử lý. Không thêm log host/header/body, không đổi counter, allowlist, cap, CSP, proxy routing hay teardown verdict. CONNECT/upgrade vẫn luôn bị từ chối; receipt có denied attempts vẫn `FAIL_UNEXPECTED_EGRESS_OR_CAP`.

Ca negative mới chỉ kết nối loopback, dùng đích `.invalid` làm chuỗi request. Sau mỗi phản hồi 403 cho CONNECT và upgrade, client dùng `resetAndDestroy()`, rồi xác nhận proxy vẫn phục vụ đúng local origin. Receipt phải có forwarded2, deniedConnect1, deniedUpgrade1, unexpected2 và FAIL; không chứa đích synthetic. Đây là kiểm tra proxy sống sau hủy kết nối, không phải cho phép egress. Tổng negative hiện **2 ca**; chưa chạy phiên bản mới.

## Kiểm tra thực hiện

Chỉ static parse: `node --check scripts/unit-review-egress-guard.mjs` và `node --check tests/unit-review-egress-guard.test.mjs`, từ candidate, đều exit0. Không import module/test collection/server/browser. Đọc lại hash cả 10 owned files: 8 file khác khớp handoff; chỉ 2 delta trên thay đổi. Không sửa frontend nên không yêu cầu build lại chỉ vì delta Node này; artifact và kết quả build cũ không được diễn giải thành kiểm thử delta mới.

## Chromium có sẵn: kiểm tra chỉ đọc

`node_modules/playwright-core/browsers.json` yêu cầu Chromium và chromium-headless-shell revision1228, version149.0.7827.55. `PLAYWRIGHT_BROWSERS_PATH` không được cấu hình trong môi trường đã đọc. Các thư mục cache kiểm tra đều chưa tồn tại:

- `C:\Users\Admin\AppData\Local\ms-playwright`
- `C:\Users\Admin\.cache\ms-playwright`
- `D:\Projects\MCY\node_modules\playwright-core\.local-browsers`

Vì vậy chưa xác nhận có bundled Chromium phù hợp trong các vị trí configured/default/hermetic này; không kết luận mọi vị trí trên máy đều không có Chromium. Không tải, cài, khởi chạy hoặc đổi browser/channel. Cần QC nguồn delta và root GO riêng trước lần invocation tiếp theo; không tự retry Chrome/Edge hoặc nới guard.
