# Independent R3 design delta QC — Owner local preview

**PASS_DESIGN_SOURCE_ONLY / INVOCATION_BLOCKED.** Root có thể mở source-only GO cho addendum [OWNER-LOCAL-PREVIEW-DESIGN.vi.md](OWNER-LOCAL-PREVIEW-DESIGN.vi.md), SHA256 `04af84b2bc07e750fbe73e253e294e49ed127dce0399e33efe385726f403f230`, cùng [intake QC](INTAKE-QC.vi.md). Đây là review tính khả thi/boundary và nghĩa vụ kiểm, chưa là PASS actual control/runner/server. Reviewer `/root/profile46_qc`; implementer `/root/profile46_finish` và UI agent; root kiểm cuối.

Phần mới supersede duy nhất ranh giới browser-fictional-only của intake cho mode **OWNER_LOCAL_PREVIEW**. Owner local draft inspection đã nằm trong công việc được giao; không cần human content approval trước khi chính Owner xem bản nháp trên máy. Không biến quyền đó thành Teacher/Reviewer identity, qualification/independence, exact assignment, quyết định chuyên môn/quyền hoặc learner publication. R3 giữ nguyên. Notes nếu có chỉ ghi chú cá nhân ephemeral, không phải decision hoặc canonical edit.

## Kiểm input

Read-only `Get-Content/Get-FileHash` và `node -e` hash/path/assert actual exit0: design đúng hash,2 link tồn tại; intake dcd2c2…a9c7, baseline1931ab…cf24 và QC a3b87f…1342 nguyên byte; candidate5.3 chưa tồn tại. Không quét lại237 app/media, không import hoặc chạy control/test/server. Original intake/QC không bị sửa ngầm; addendum và verdict này bổ sung phạm vi nguồn mới trước GO.

## Đánh giá

Fixed startup mode, tách process/state, Node-only canonical adapter và Node static-dist allowlist thay Vite trong Owner mode là lựa chọn phù hợp cho scope local. Browser chỉ nhận selected draft qua read API được guard; không đưa actual content/contact/seed vào dist hoặc learner bundle. Fixture mode vẫn neutral và không được chọn canonical. Typed reader có thể hiện nguyên draft đã có để review với nhãn chưa duyệt; không tự viết cue hoặc đánh giá đúng/sai. Không có edit/review/approve/publish/assignment production route.

Capability là quyền sở hữu local session do operator khởi tạo, **không là xác minh danh tính con người**. One-use bootstrap, HttpOnly/SameSite cookie, lease/epoch, exact Host/Origin và no-store là design cần thiết; tính đúng thực tế còn chờ source/negative tests. Local machine compromise không được suy là đã được bảo vệ bởi mô hình này.

## Nghĩa vụ phải thấy ở frozen source/control gate

- Nonce/bootstrap channel không xuất hiện trong URL/query/referrer, captured stdout/log/receipt, localStorage hoặc bundle. Phải mô tả cụ thể trusted out-of-band delivery; không dùng một endpoint bootstrap công khai không secret. Consume một lần, timeout/replay denied, không lưu private contact hoặc account tokens.
- Cookie **không được browser cô lập theo port**. Cần unpredictable process-specific token/name, purpose+lease/epoch, host-only cookie/no Domain, exact Host/Origin gồm port và request/method/CSRF policy. Wrong-process cookie phải bị server từ chối; fixture/server logs không ghi Cookie/Authorization. Không dựa riêng vào SameSite/loopback hoặc UI ẩn nút.
- Mỗi list/read/asset và note operation nếu có phải kiểm đúng lease/purpose/selected triple/hash; sau await và trước commit/header/emit kiểm lại expiry/revoke epoch. Notes gắn lease+unit version, purge trên timeout/revoke/teardown, không tạo human decision. Browser clear private state khi session mất hiệu lực, kể cả late response/cache/back-forward.
- Asset phải là bounded bytes từ contained file, verified MIME/hash **trước byte đầu tiên được phát**; dùng cùng buffer/file identity cho hash và response để tránh TOCTOU. Stream/revoke tests không được hứa thu hồi bytes đã gửi. Upstream có thể đổi ngay sau một read; chỉ claim selected pinned buffer/snapshot và fail closed khi phát hiện drift, không giả atomic/latest package.
- Node Owner server deny raw path/directory/source map, `/@fs`, `/src`, `/tests` và Node/test modules, trước mọi static/SPA fallback. Chỉ allowlist dist đã scan và guarded assets; không broad CORS/external fetch, CSP/no-referrer/no-store, loopback peer/host/origin checks. Fixture Vite vẫn cần guard các bypass tương ứng; việc bỏ Vite ở Owner mode không tự bảo vệ fixture mode.
- Freeze actual schema/dependencies,14 unit/asset pins, source/harness/fixture/runner/build config. Negative controls gồm bootstrap sai/replay/expiry, cross-origin/host/process, mode/actor/source injection, exact-version/hash/lease race/revoke, wrong asset/traversal/symlink/raw bypass và no-draft-in-static-build. Owner mode deny edit/review/publish và mode switch; fixture mode deny canonical. Real contacts, SDK/provider bridge và cloud không tham gia.

Các điều trên là điều kiện source/control review kế tiếp, không yêu cầu thêm scope production hoặc phê duyệt giả định. **Không còn blocker thiết kế cho source-only GO** nếu implementation tuân thủ boundary này. Không import controls, collect/run tests, build/serve preview trước frozen independent R3 review và root invocation GO; static parse/tsc không execute control giữ theo gate cũ. Nếu guard chưa đủ thì giữ Owner mode BLOCKED tới khi sửa; không hạ R3 hoặc suy demo thành private-auth proof.

Final acceptance sẽ tách Owner local inspection, fictional edit/review rehearsal và production/human review còn BLOCKED. NativeHALTED/webBLOCKED không đổi; no canonical write, real role/email/API/deploy/AI operation. Rollback stop/discard isolated candidate. Sau QC/root5.3: **STOP chờ Owner trước bước6/integration/release khác**.
