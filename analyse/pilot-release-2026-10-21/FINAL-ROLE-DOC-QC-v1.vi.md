# QC độc lập — role guides bind artifact, 21/10/2026

Kết luận: **PASS trong phạm vi bản nháp hướng dẫn có điều kiện và binding artifact; chưa phải participant/release acceptance.** Không còn P1/P2 mới trong bảy tài liệu được freeze. Root cần direct-check kết quả này; chưa cấp quyền phát URL/cài APK/chạy tài khoản thật.

## Inputs và kiểm tra thực tế

- `ROLE-GUIDES-FREEZE-v4.json` SHA `e7af93fe7fc4220ed42e4cd0b86ca308e1f503183feddc2d46370ff8ec327b8c`; `OWNER-DECISIONS-FREEZE-v3.json` SHA `5a08dad09c749cb1921db3c2ff6b7f7e54a4e57c41defbd650e3b39066603abe`.
- Đọc nội dung/delta bảy tài liệu so với preimages trước artifact binding; tự hash/size **116 pin occurrences, 0 mismatch**, gồm exact APK thật trong managed tree. Tự resolve **47 local file links, 0 missing**. Metadata/content pool không thay đổi so với FULL-SCOPE-DOC-QC-v1; không lặp lại toàn bộ kiểm nội dung đã giữ nguyên.
- Web receipt `682b13d0…906d`: 61 files/59 client; native receipt `881df446…1471`: APK SHA `e1b036765affce158e05d699239a4f0b36e8ce8bf317dd6b6bd7a0d142897da7`, 11,585,235 bytes. Version/nhãn pilot, vcode1 có chủ ý, certificate và 59 native web + 2 Cordova khớp package QC trước.
- Root compiled manifest proof `694582a9…3dde` xác nhận callback đóng gói `motchutyoga-mcydebug://auth/callback`; không suy physical resolver/Auth/restore. Đây là supplement cho QC package cũ, không sửa lịch sử frozen.
- Root guest UI receipt `740d751a…f9d9`: tám màn ở 1280×720, chưa Play/login/save/toggle. Root HTTP receipt `99634065…b2d4`: sáu guard probes riêng. Đã đọc receipts, xem hai ảnh local; phù hợp mô tả bounded guest. Không là full responsive/accessibility/role/backend/native acceptance.
- Đọc server closed receipt `7b808a6d…6c6` và cleanup `6a930683…f43d`: SIGINT có chủ ý, sourceChanged0, port4288/process owned đều0, no restart. Wrapper exit1 ở Ctrl-C không phải app/test failure. Hướng dẫn nói viewer đã đóng và không dùng localhost làm URL participant là chính xác.

## Tính đúng của hướng dẫn

FULL tài khoản thật/toàn bộ prepared pool/thực hành/chức năng và người Teacher/Reviewer do Owner chỉ định được giữ nguyên. Trạng thái Owner-reported approvals exist được phân biệt với reviewer-authored evidence/quyền cụ thể/chứng minh server roles. Không yêu cầu chọn lại Uxx/phạm vi/purpose hoặc tự tính SHA; không xuất contacts vào guides.

Pool vẫn gồm 14 reading units/55 PNG/25 blocked slots, 38 source clips/3 courses, intro riêng với 4 assets và 114 metadata entries không đóng góp lesson/media mới. Không đếm reading draft/clip/intro thành complete reviewed practice sessions; catalog hiện0. Nội dung Owner form là technical binding và narrow evidence còn thiếu, không là bản phê duyệt giả.

Mỗi vai trò nêu đường đi hiện hữu, điều kiện mở và dừng khi sai actor/assignment/version/expiry. Private Owner local reader/fictional rehearsal được mô tả đúng phạm vi, bootstrap5 phút/lease15 phút; không giả thành real participant transport. Common artifacts được gọi là đã chuẩn bị, chưa deploy/install/phát nhóm test. ACTIVE_HEALTHY chỉ project metadata; current ledger/roles/ACL/Auth/key usability chưa được suy ra.

Web protection exact new Preview chưa verified nên BLOCKED_NO_UPLOAD_OR_ALIAS. Native HALTED/currentActorVerified=false còn nguyên. Không tự grant/extend role, lặp old write cap, cài/relogin/force-stop hoặc dùng build PASS để xóa failure cũ. Hướng dẫn báo lỗi không chứa token/contact/notes thật và chưa gửi tới kênh chưa chốt.

## Giới hạn mới ngoài freeze này

Critical fixture run sau freeze đã trả **FAIL_STOP_NO_AUTOMATIC_RETRY**, exit1, 29 passed/2 failed và teardown 220 deny-proxy requests; receipt `ab1f7698ebc4f8019df5d62b24be8584125847e1016f37361fa00755250e06dd`. Guides không claim critical fixtures PASS nên không phải stale PASS trong tài liệu này. Cần supplement độc lập phân loại lỗi selector/copy và egress từ actual report trước mọi claim regression acceptance. Không sửa frozen guides/receipts để giấu kết quả.

QC agent chỉ đọc/hash/diff/xem ảnh local và ghi record này; không chạy app/test/build/server/provider/device, không sửa source hoặc phát tài liệu ra ngoài. Root final task acceptance, rollout source/design mới, roles/rights/complete practice/native restore/protected deployment còn tách biệt.
