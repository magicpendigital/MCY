# QC độc lập source/control/UI 5.3 — v1

Verifier: `/root/profile46_qc`, độc lập với implementer `/root/profile46_finish` và UI agent `/root/content51_plan`. Ngày kiểm: 19/10/2026 Asia/Bangkok; hash sweep cuối ghi UTC bên dưới. Áp dụng `skills/mcy-change-review/SKILL.md`, lifecycle và R3 đã chọn tại intake; không hạ tier vì dùng fixture.

**PASS_SOURCE_CONTROL_SCOPE — không còn P1/P2 source đã xác định trong phạm vi local được duyệt. OVERALL_QA_PENDING; CURRENT_CANONICAL_BLOCKED.** Đây là QC source và bằng chứng đã chạy theo snapshot, không phải final handoff/release PASS. Hai gate còn mở:15 UI +12 mapped regression phải có process sạch, và canonical hiện tại không còn khớp snapshot đã chọn. Không sửa source/snapshot/upstream để viết báo cáo này.

## Exact bytes và kiểm độc lập

Candidate: `.vercel/ux-step5-3-20261018-v1`. Các SHA-256 dưới là full hash, không phải commit Git.

| Artifact | SHA-256 |
|---|---|
| [Combined255 source freeze](COMBINED-CANDIDATE-SOURCE-FREEZE-v1.json) | `fdfedf82b83c57f2ede7ac85bf9bb1d053604992b600fc13390b9b68375d4d6c` |
| [Control v4 freeze](CONTROL-SOURCE-FREEZE-v4.json) | `8fa517d08d99f938b76f93b11f07fe00ee8dd302155205a2fa13d6e2e0ca7c97` |
| [Client59 freeze](BUILD-ARTIFACT-FREEZE-v1.json) | `d9a5c81f5291d6404cdadff228f21acbd5f044de82382fbad991ca338ff43fda` |
| [Node13 receipt](control-node-v4/receipt.json) | `299463e0eface4d5f30cb9b3214fac5cd93e60a3c331f63aa00a09c11af73ad1` |
| [Independent5 receipt](independent-controls-v3-run/receipt.json) | `28003a97280e037d70eb71db485353ae872cb48be93722a1af342525a317ec8d` |
| [Independent5 results](independent-controls-v3-results.json) | `6162a5fdaa36331af11f1918af853e3f8aeaf51b82c5af6d4c79eb8be0e4c5c8` |
| [Root actual UI](ROOT-MANUAL-CHECK-v1.json) | `4493933be8587215565924e1838d9475490f63802a0e6fdef87b061a45561989` |
| [Root artifact privacy](ROOT-ARTIFACT-PRIVACY-v1.json) | `5f764e49712bf9fa2ad16a2ea7cf55c5e0f85f13490563e1aba8df4e962598e9` |
| [Canonical drift](CANONICAL-DRIFT-CHECK-v1.json) | `13fdac006797d003d1c4032545fb4852a13e4a61e5ab662d4f0c597933ba6eb4` |

Lệnh QC hiện tại chỉ đọc: PowerShell `Get-Content … | ConvertFrom-Json`, `Get-Item`, `Get-FileHash -Algorithm SHA256` và so từng record trong các freeze; không import control/test. Sweep18:29:48.528585Z **exit1**: control9/UI10/client59/log4 khớp, canonical64/71 khớp và7 JSON đổi. UI10 dùng7 pins không đổi của build freeze, cộng3 helper pins đã review qua transport/provision delta: runner `3f717c23c24391317718a9cc6428499dd9acbb85aa6530e67d348fc232f52c8f`, proxy `a525750ca14e5c3586bd217ff4e6c04c43548618b9a87bbc788395d965cbcc9d`, negative `e63da85e9e602388598f087fa84965d679f760eb5b8ade52cdc92ca1512619aa`. Exit1 này là drift quan sát được, không là app test failure.

Sweep riêng18:31:17.2056745Z **exit0**: `foreach ($p in $freeze.files) { Get-Item (Join-Path $freeze.candidate $p.path); Get-FileHash … }` đối chiếu bytes+SHA; **255/255 unique candidate paths match,0 mismatch**. Combined freeze PREPARED là lịch sử của producer; verdict này không sửa trường đó.255 =237 baseline inputs +10 UI-owned +9 control-owned −1 Prototype overlap; không phải255 file đều mới. So diff actual approved4.7→candidate: chỉ Prototype hiện hữu đổi, thêm lazy import/boolean/portal entry nội bộ; không đổi learner routes/runtime. Các file mới và helpers nằm trong255 pins.

## Read-through và phạm vi R3 được kiểm

- Node-only adapter/server giữ canonical ngoài client bundle/static root. Hai mode cố định tại process start: Owner local đọc canonical được pin; fictional rehearsal dùng dữ liệu trung tính và assignment giả. Không có client actor/source selector để chuyển mode; nomination không được đổi thành real role.
- Static server snapshot allowlist path/hash/size, ancestor/junction bounds, không phục vụ Vite `/@fs`, source/server/tests, raw JSON hoặc fallback tùy ý. MIME/signature PNG và WAV có giới hạn; read đủ buffer và kiểm SHA trước emit. Bootstrap secret ở private ignored directory ngoài candidate, không URL/bundle/log. Cookie HttpOnly/SameSiteStrict theo process; Host/Origin/intent, CSP self và no-store vẫn áp dụng. V4 chỉ GET form bootstrap dùng Referrer-Policy same-origin; null/wrong Origin POST vẫn bị chặn.
- Lease/purpose/version/hash/epoch kiểm mỗi operation; recheck sau awaited source read và trước emit/commit. CAS ngăn stale concurrent draft; notes theo lease+unit hash, purge khi expiry/revoke/close. Owner không có draft/review/publish operation. Không có canonical write hay persisted notes.
- UI kiểm response/session/epoch và exact unit identity, clear private DOM/notes khi lỗi quyền/version/malformed/expiry/hidden; abort+generation chặn late response. Mutation pending guard, kết quả transport không rõ khóa gửi lại, không auto retry. Không local/sessionStorage cho nội dung. MobileScroll/Keyboard controls dùng existing context; CSS scope `.mcy-unit-review`; learner root ẩn khi portal mở. Chọn mục dài focus/scroll đúng reader; missing/identity_blocked không thay ảnh.

Các giới hạn được giữ: finite filesystem recheck không phải atomic filesystem snapshot; không thu hồi được bytes đã giao; browser có thể giữ bytes trong memory. Adapter enforce consumed invariants và pinned schema identity, không claim thực thi toàn bộ JSON Schema. Local possession capability không xác minh identity/qualification/independence người thật. Không có production private Auth/RLS acceptance.

## Bằng chứng thực thi, đúng attribution

| Phạm vi | Actual kết quả và nguồn |
|---|---|
| Final v4 Node controls | Worker chạy `node --test server/contentReview/canonicalAdapter.test.mjs server/contentReview/reviewModel.test.mjs server/contentReview/localReviewServer.test.mjs`;13 PASS/0 fail/0 skip, child0, wrapper0 theo execution report; pre/post9+71 match. QC đã đọc raw TAP và kiểm2 log SHA từ receipt. Không phải QC rerun. |
| Independent controls v3 | QC chạy một lần `node --test analyse/ux-step5-3-2026-10-18/independent-controls-v3.mjs`;5 PASS/0 fail/0 skip, child+outer0, pre/post3probe+9control+71canonical match. Changed static409, added/raw paths404, root junction rejected; joined HTTP final emit source drift409/revoke401/expiry401, không private unit emit. Original model.read chạy đầy đủ; chỉ latency gate ở temp fixture, không sửa production guards. Owned Node exited, temp entries0; không claim OS-wide listener inventory. |
| Build/compatibility | [Build receipt](build-checks-v1/receipt.json):9 selected commands exit0, runtime28/catalog/typecheck/build/Sites/scanners theo logs; đây là worker/root execution. Privacy root scan59client/14IDs/80paragraph fingerprints/55image hashes/2private contacts:0 hits/forbidden paths0. Exact fingerprint scan không chứng minh mọi paraphrase. QC rehash59client khớp ở sweep trên. |
| Root actual Owner UI | IAB tại exact `http://127.0.0.1:4260`: fresh v4 form→14drafts; Cobra r1 vi-VN và ảnh1536×1024; blocked media không ảnh; next-step focus;320×640/1280×720 không horizontal overflow. Root notes/content mutations0, không independently captured HTTP status. QC đọc receipt và xem actual3 PNG; không clinical/rights/pose review. |

QC đã xem [desktop](ROOT-OWNER-READER-DESKTOP.png), [320 reader](ROOT-OWNER-READER-320.png), [320 blocked](ROOT-OWNER-BLOCKED-MEDIA-320.png), SHA lần lượt `f79a0fb0af6fa75a81f764a68fb55ea35c2c3ce0581b047889e80e3a78fe77e9`, `639eeeea6718400af4f9c7ddd2f2e502184158955965c1bf38236659e22b8805`, `54f1e9a34360a117b63d67fe68e5094379cd8b4c1c7ee0ad03d296aba50d02c1`. Không thấy P1/P2 UI mới trên pixels đã xem. Không suy native, touch keyboard hoặc physical-device acceptance từ IAB.

## Hai boundary còn mở

**Canonical hiện tại:**7 units cobra/cobra-gentle/cow-face/downward-dog/high-lunge/three-legged-dog/warrior-ii đổi so71 dependency pins. Đó là upstream live production; không rewrite approved history hoặc cập nhật selectedSnapshot. Node13, independent5 và root actual14 UI đều là bằng chứng tại timestamp/pins lúc chạy, không current-canonical PASS. Source `canonicalAdapter.mjs:12–43,173–179,200–212` sẽ từ chối SHA lệch qua readPinned/verifyCurrent/listUnits; tại thời điểm báo cáo này, kết luận cho đúng7 bytes hiện tại còn là source inference, cộng cơ chế409 đã được probe temp drift thực thi. Một existing-export read-only validation đã đề xuất root, chưa chạy trong báo cáo v1. Current Owner canonical acceptance **BLOCKED**.

**Browser process:**15UI và12mapped đã assertion PASS ở các lần trước nhưng processFAIL vì CONNECT bị deny (Edge71/fullChromium81/mapped63), không app leak proof và không clean PASS. Diagnostic about:blank cũng có blocked CONNECT không chứng minh nguyên nhân toàn bộ history. Giữ nguyên deny policy/counters; transport socket crash, WAV setup failure, v3 Origin form failure và installer ECONNRESET đều giữ lịch sử. Headless shell provision/recovery pending; chưa có default-shell clean15+12 receipts để đổi overall verdict.12mapped là11 unchanged browser regressions +1 equivalent Node-worker catalog contract, không12 unchanged browser cases.

[Root preservation](ROOT-PRESERVATION-CHECK-v1.json)17:20:14Z ghi35dirty/237approved4.7/71canonical/9control/59client khớp và guidance match;71 là lịch sử trước drift, không trạng thái hiện tại. QC không sửa root/app/control/upstream, không chạy thêm UI/build/cloud cho report này.

Không có blocker P1/P2 source mới đã xác định trong local scope; **không đủ để bàn giao5.3 như QA hoàn tất**. Human5.2 expertise/rights/qualification/independence/exact assignment/decision, production integration, native session HALTED, web release BLOCKED vẫn riêng. Existing Auth bounce P2/RegionEditor P3/unsettled-font focus gap không được report này đóng. Không mở bước6 hoặc learner draft catalog.
