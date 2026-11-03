# Intake đồng bộ snapshot 5.3 — 19/10/2026

Trạng thái: **READY_FOR_INDEPENDENT_INTAKE_QC; implementation/invocation BLOCKED chờ QC và root GO**. Áp dụng skill `skills/mcy-change-review/SKILL.md`, lifecycle và risk matrix; chỉ ghi hai tài liệu intake, chưa tạo candidate, chưa import/chạy app/control hoặc mở browser.

Yêu cầu được root chuyển nguyên văn: “Tôi thấy ok với phần kỹ thuật 5.3. Hãy giao Agent đồng bộ snapshot của 7 bài đã thay đổi, QC độc lập rồi bạn trực tiếp kiểm tra, báo cáo và dừng chờ tôi duyệt.” Kết quả mong muốn: Owner local preview đọc đúng 14 bản nháp hiện tại, gồm bảy unit đã sửa câu exit; pin sai vẫn bị từ chối. Sau QC và root trực tiếp kiểm tra, dừng chờ Owner; không bắt đầu bước tiếp theo.

## Baseline và quyền sở hữu

[BASELINE.json](BASELINE.json), SHA256 `ad9ae5385a517c5b0f078d2b875d77c3b3641dd23657dace0dfa4f7f8e35fd10`, ghi HEAD thực,35 tracked dirty với SHA, toàn bộ255 source và59 built-client pins,71 canonical pins và14 unit identity/media/refs. Discovery dùng PowerShell Get-Content/rg/git status và Node read-only fs+crypto; không đọc env, provider credentials hoặc contact file. 255/255 source và59/59 client giữ nguyên. 71 canonical có đúng7 thay đổi, khớp từng current SHA trong drift receipt; contract/inventory,7 unit còn lại và55 asset không đổi. 14 selector,38 nguồn,55PNG,25 slot identity_blocked vẫn đúng; learnerVisible/recommendationEligible=false, unpublished, approvalRecords rỗng. Đây là kiểm tra các invariant adapter tiêu thụ bằng đọc JSON trực tiếp; chưa gọi adapter hoặc test control, không thay cho full JSON Schema validator hay chuyên môn nội dung.

Giữ nguyên candidate cũ `.vercel/ux-step5-3-20261018-v1` và toàn bộ evidence đã frozen. New candidate dự kiến `.vercel/ux-step5-3-rebind-20261019-v1`, chỉ sau GO; từ chối nếu đích đã tồn tại. Copy đúng255 source paths từ COMBINED freeze fdfedf82…d4d6c; không copy node_modules/env/test-results/canonical content/contact. Copy đúng59 `dist/client` đã pin nếu root đồng ý. Không cần hai Sites auxiliary vì localReviewServer chỉ đọc dist/client; không tạo Sites/release artifact.

## Diff và mức rủi ro

**R3 delta**: selectedSnapshot là allowlist/hash binding của Node-only protected Owner reader. Không sửa implementation kiểm soát nhưng đổi bytes được phép đọc, cần independent QC trước invocation. Chỉ một application file được đổi: `server/contentReview/selectedSnapshot.json`. Đúng8 JSON-field differences:7 `units[].sha256` và `capturedUtc` phản ánh thời điểm chọn mới theo root; không sửa source/id/revision/locale/path/assets/contract/inventory/schema. Danh sách: cobra,cobra-gentle,cow-face,downward-dog,high-lunge,three-legged-dog,warrior-ii; đều r1/vi-VN. BASELINE ghi SHA cũ/mới từng path.

Nguồn upstream: `analyse/yoga-content-production-2026-10-18/ROOT-EXIT-WORDING-FIX.vi.md` SHA `58d0f0b902b560a86e6067fb6afd7821ec1d8b50ff328e4fb1d591763756a22b` và `CORE-READ-QC.vi.md` SHA `00575b1a2c3b617562c6540cf250c5c418a7ed7d10d6717940c4bbf9538004a2`; QC này chỉ đối chiếu dữ liệu/tệp/nguồn, không là human yoga/rights/release approval. Nội dung ghi28 exit thay từ “Xem khung tiếp để đọc đầy đủ đoạn chuyển; không tự thực hiện theo một khung đơn.” thành “Chuyển sang khung đọc kế tiếp; không suy đường vào/ra từ một hình.” Independent snapshot SHA `423dbd3283a9af839fd533d7732928ee38bd099e3746d1c74142cc1abb11779a`.

Tự đối chiếu ngữ nghĩa có chứng cứ byte: thay ngược duy nhất câu mới→cũ trong memory4lần/unit tái tạo SHA cũ frozen chính xác7/7; không viết preimage. Vì vậy diff đúng28 chuỗi exit đã mô tả; không đổi media, schema hoặc refs ngoài các chuỗi đó. Không suy thành phê duyệt sức khỏe.

| Đường tiêu thụ | Thay đổi và hành vi cần giữ | Kiểm tra tương ứng |
|---|---|---|
| Owner startup → selectedSnapshot → canonicalAdapter → reviewModel/server → UnitReviewWorkspace | Cho phép đúng7 JSON mới;14 unit giữ identity/refs/draft/status | Freeze mới; Node adapter/server/model13 tests; read14/asset55/unavailable25 |
| canonical pins → reader/asset post-await checks | SHA cũ và drift tương lai vẫn fail closed; duplicate identity/wrong MIME/traversal không lọt | Existing13 + QC độc lập negative old SHA,identity,MIME/blocked guards trên snapshot mới |
| source+package+lock+Vite → dist/client → static allowlist → browser | Frontend/config không đổi; runtime/static privacy guards nguyên vẹn | So255 và59 exact pins; giữ historical build/runtime/bundle-scanner/Sites evidence với input comparison; root fresh Owner browser7unit/blocked labels |
| learner/native/cloud/data/roles/AI | Không có caller hoặc import mới; các flag/publication/control không đổi | Chỉ file snapshot Node-only đổi; không live API/SQL/device/deploy/inference |

## Kế hoạch kiểm tra và reuse

Sau intake QC/root source GO: tạo candidate/copy255+59, đổi8fields; freeze toàn255 source+59dist+71canonical mới và diff so old; independent QC source selection trước execution. Sau root invocation GO chạy tại new candidate: `node --test server/contentReview/canonicalAdapter.test.mjs server/contentReview/reviewModel.test.mjs server/contentReview/localReviewServer.test.mjs` →13/13 với process exit0. QC tự negative cases đã nêu; không thay controls/tests để cho PASS. Nếu symlink fixture skip, ghi rõ. Không dùng env file/network dependencies.

Frontend build không cần rerun vì module selectedSnapshot chỉ Node server import, không thuộc frontend graph;255 source trừ snapshot/unchanged package+lock+Vite config và59 dist phải so byte, Node hiện tại v25.9.0 khớp historical build runtime. Không tái khẳng định historical full-suite failure: final green headless15+mapped12 có receipt cuối riêng, được giữ lịch sử; không cần rerun chúng cho pin-only change. Reuse chỉ covered behavior có unchanged consumed inputs; fresh root browser trực tiếp kiểm7unit mới là acceptance thay thế phần Owner trước drift, không là14unit human expertise. Chưa chạy baseline13 hiện tại vì snapshot cũ dự kiến fail; không report PASS dựa historical13.

Startup CLI đã đọc: candidateRoot tính từ script; repoRoot hai cấp lên vẫn đúng cho candidate mới; privateRoot `.vercel/local-review-private` tồn tại và chứa capability không được emit. CLI chỉ nhận `--mode owner_local_preview --port 4260`; static allowlist chỉ dist/client, snapshot load tại startup, nên chuyển process sang candidate mới mới nhận snapshot mới. Chuẩn bị startup riêng sau Node/QC rồi chờ root GO trước launch; không tự chạy. Root browser chỉ list/read/asset, không notes/edit/review/approval.

Implementer `/root/snapshot53_sync`; reviewer độc lập do root giao; root trực tiếp final verify. Stop nếu drift ngoài7, identity/asset/contract khác baseline, target đã có, source pin lệch hoặc bất kỳ test/control gate fail; cập nhật intake trước mở rộng. Rollback bằng dừng process mới và bỏ dùng candidate mới; candidate cũ vẫn fail closed với canonical hiện tại và không gọi đó là phục hồi preview. Không xóa/revert canonical/history. Native HALTED/currentActorVerified=false; web BLOCKED_NO_UPLOAD_OR_ALIAS. Không cloud/Auth/SQL/email/role/device/install/deploy/AI/media generation/human approval; contacts và đề cử vai trò vẫn chưa xác minh. Sau root báo cáo, STOP chờ Owner.
