# QC độc lập intake cập nhật web + Android — 21/10/2026

**PASS cho intake và nhánh chuẩn bị candidate cục bộ chung, chờ root trực tiếp kiểm/GO. Không còn P1/P2 trong phạm vi intake này.** Chưa là source/control clearance, test/build PASS, release, native restore hoặc pilot acceptance. Chưa chọn thay Owner một trong ba phạm vi UX giả / đọc nội dung được duyệt / thực hành thật.

Reviewer: Agent `/root/pilot_release_qc`, độc lập với Agent intake và Agent role-guides; root là final verifier. Đã đọc trực tiếp AGENTS, skill `skills/mcy-change-review/SKILL.md`, lifecycle, risk matrix, release runbook; nguồn liên quan và hồ sơ 6.1. Không chạy app, server, tests, build, provider hoặc device. QC chỉ thực hiện đọc file, Git status/diff-name, so hash/bytes và kiểm đường dẫn.

## Bản đã kiểm

| Tệp | SHA-256 | Bytes |
|---|---|---|
| TASK-INTAKE.vi.md | `097f216022d2f2bc751b723a8ead28631c7a7a3a2dbb7afeaae5eee0b26a94c0` | 17.296 |
| BASELINE.json | `2803a1263c5858d9fb35c077ba73d018a083188a17c21bf198454d9a265ce377` | 237.627 |
| ROLE-GUIDES-BRIEF.vi.md | `300ca1b1aff201bb4be89ecb503ad3eab7c5b3140b6140b5890a4e4a66f54fe2` | 10.959 |

Đây là freeze intake/brief, không có artifact mới. QC không sửa ba tệp trên. File QC này được bổ sung sau freeze và cần root pin riêng; không tạo self-hash vòng tròn.

## Kết quả đối chiếu

| Phần | Hành động trực tiếp / evidence | Kết quả và giới hạn |
|---|---|---|
| Baseline hiện tại | PowerShell đọc JSON rồi `Get-FileHash` và `Get-Item` cho toàn bộ rootDirty/files, references, bốn nhóm inputs | PASS, exit0: 620 entries/540 đường dẫn duy nhất, 0 mismatch hash/bytes; 35 tracked dirty giữ nguyên. Không là kiểm toàn bộ dependency động |
| Nguồn cũ và scope integration | Đọc intake, delta và package/config/build scripts; đối chiếu root/candidate Prototype và selectedSnapshot | PASS intake: không gọi root dirty là UX mới; 13 khác +27 vắng có inventory, không cho phép copy đè toàn candidate. Parent root phải chốt ownership/clean Git candidate trước tích hợp |
| Canonical và review | Trực tiếp hash manifest và selectedSnapshot, đọc flags trong baseline, đối chiếu 6.1 | PASS: manifest `0fa137d5ea658fadfdb8a1ab97e5fd86550a03b82fbed972530b338e65d114b1`; selectedSnapshot `2e9ffee39872c08891bedce9ed5a93f93ec4af4d878ce50d47b09aaa8d71a937`. Pending/approvalRecords rỗng không bị đổi thành approved. Human reported decisions vẫn details pending |
| Reader và role claims | Đọc `reviewModel.mjs`, `localReviewServer.mjs`, UnitReviewWorkspace, Teacher/Owner/ContentReviewPanel và package scripts | PASS intake/brief: Owner loopback và fictional author/reviewer tách khỏi role thật. Bootstrap 5 phút, lease 15 phút; static web/APK không tự có desktop Node server. Nhãn handbook dự kiến khớp nguồn; không phải live role evidence |
| Native paths | Đọc build helper, installer, Gradle và Capacitor config | PASS gap mapping: parallel capsync ghi native assets chung, khác web build; catalog gate cần parity; installer dòng147 tự `am start` nên không dùng nguyên script. Isolated native tree và install-only reviewed procedure được yêu cầu; HALTED giữ nguyên |
| Phạm vi regression | Đọc bảng mapped checks, package scripts và lifecycle/matrix | PASS kế hoạch: chọn checks theo diff, inspect testMatch trước chạy; tách fixtures/real API/device và preserved learner transitions. Không yêu cầu chạy lại toàn bộ lịch sử khi inputs/environment không đổi |
| Handbook | Đọc đủ brief và đối chiếu labels/permissions thật | PASS brief: không có URL/APK/account giả; real Teacher/Reviewer, chuyên môn/rights, moderator/data custodian không bị suy từ nominees. Handbook hoàn chỉnh còn conditional theo artifact/scope |
| Provider/release/native acceptance | Không gọi provider, app hoặc device | BLOCKED trong QC này. Root chịu read-only preflight; hiện chưa có protection evidence cho Preview mới, packet mới hay native restoration PASS |

620 entries gồm nhóm có giao nhau; 0 mismatch là so với pins ghi trong BASELINE tại lúc QC, không là app regression hoặc bằng chứng approval ngoài đời. Git in cảnh báo CRLF khi đọc diff-name; exit0 và hash files vẫn khớp, không có edit ứng dụng.

## Điều kiện GO phải giữ

Root có thể cho chuẩn bị common candidate: reconcile các nguồn UX đã nhận vào cây riêng có preimages/inventory; xác minh paths build web/native và chuẩn bị artifacts có thể review sau source/control QC; viết role handbooks với delivery/capability còn pending đúng sự thật. Root chọn worktree/Git candidate và file ownership cụ thể. Không build nhầm root dirty hoặc biến snapshot thành cách bỏ qua clean-Git release checker.

Trước invocation của control/harness R3 mới hoặc đã đổi, cần independent source/control review và root GO phù hợp. Review intake này không thay review script, test proxy, native installer/observer, edition guard hoặc participant API. Sau thay source/test/config/artifact phải freeze mới và chạy checks bị ảnh hưởng; reuse lịch sử phải có comparison inputs/environment rõ ràng.

**Chưa được bắt đầu behavioral mock edition mới hoặc participant transport thật chỉ từ intake này.** Chờ lựa chọn scope từ người dùng và source/design QC cần thiết. Không nới host/CORS/TTL, share Owner capability, public bundle draft, tự grant/extend roles, bật AI hoặc đẩy migrations. Không dùng ba loại scope như cùng một bản pilot.

Web upload/alias vẫn BLOCKED tới khi exact target/artifact và protection cho Preview mới được xác minh trước upload. Android install/device invocation vẫn ngoài common prep: packet mới phải bind package/cert/APK/hash/device và đường install-only; user mở icon, không shell-launch/force-stop/clear-data. Build/install không chữa hay đóng native HALTED; giữ trial cũ và mọi history. Không tái dùng budgets/approval13–14/10.

## Rủi ro, recovery và bàn giao

Highest deliverable risk R3 hợp lý; diff intake/brief thuần tài liệu là R0. Thiếu scope/human exact facts/participant roles/content rights/native acceptance/protected new Preview chặn phần release tương ứng, không chặn read-only reconciliation và chuẩn bị cục bộ đã giới hạn. Không suy provider current từ báo cáo cũ hoặc coi request cập nhật là cho phép thay security policy.

Recovery hiện tại là bỏ dùng candidate/brief mới; giữ root dirty, accepted candidates, canonical, frozen receipts/APKs và cloud history. Recovery sau release cần packet riêng có stop/compatible artifact, không hứa database restore hoặc native downgrade.

Root chưa được QC này tuyên bố đã final-verified. Next: root tự kiểm pins, ghi GO có phạm vi chung cụ thể, giao Agent triển khai; giữ điều kiện đang chờ và dừng trước bước phụ thuộc quyết định còn thiếu. Không có source/test/build/live/native acceptance mới trong review này.
