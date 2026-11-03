# Trạng thái và bàn giao 5.1 — hồ sơ tiếp nhận nội dung nháp

18/10/2026 · **CONSUMER DOSSIER PREPARED — chờ QC độc lập cuối và root xác minh; Owner chưa duyệt 5.1.** Root đã GO cho phạm vi docs-only sau [intake](TASK-INTAKE.vi.md), [baseline](BASELINE.json) và [intake QC](INTAKE-QC.vi.md). 4.7 đã được Owner duyệt; bản UX `.vercel/ux-step4-7-20261018-v7` không đổi. Sau QC/root, **STOP chờ Owner trước 5.2 hoặc 6**.

Deliverable của consumer: [ledger 38 clip + 14 unit](CONTENT-LEDGER.vi.md), [receipt metadata](SNAPSHOT-RECEIPT.json), [brief và cổng tiếp](NEXT-STEPS.vi.md). Chỉ các file trong thư mục 5.1 được tạo trong lượt này; canonical `content/yoga-library/` do task content khác sở hữu và đang live. Receipt lúc `2026-10-18T11:34:40.7103318Z` khóa snapshot trên 18 file metadata/unit đã có trong baseline; **không phải manifest upstream cuối hoặc atomic snapshot toàn package**. Upstream final manifest PENDING. Nếu file/media/manifest thay đổi sau đó, cần snapshot mới và review lại; không chỉnh receipt cũ để tạo cảm giác liên tục.

## Kết quả quan sát và giới hạn

- `inventory.json` có 38 record; source hash khai báo khớp `src/courses/freeCourses.ts`. Rights/expert đều pending cho 38, caption chưa verified. 14 triple `(id, revision, locale)`/path được handoff chọn tường minh, 13 `sourceRefs` đều join chính xác **một** `(courseId, lessonId, youtubeId)` inventory; unit foundation-standing không có sourceRef và không được tự ghép. `contentUnitIds` chỉ là backlink.
- 14 unit đều `learnerVisible=false`, `recommendationEligible=false`, `practiceDurationSeconds=null`, không có approvalRecords; 7 media_draft/7 editorial_draft. 80 **slot JSON** = 45 `draft_present` + 25 `identity_blocked` + 10 `not_produced`. 45 đường dẫn/sha của `draft_present` khớp file được tham chiếu lúc receipt; 46 **file vật lý** trong media folder là phép đếm khác, không phải 46 slot hoặc 46 ảnh được duyệt. Không có clip/media thật được xem để kiểm nội dung.
- [COVERAGE.vi.md](../../content/yoga-library/COVERAGE.vi.md) là generated view đang chỉ liệt kê 2 foundation trong khi handoff chọn14 đường dẫn; không dùng nó làm truth hoặc gọi là production hoàn tất. Bản nháp photo/master vẫn cần chuyên môn, quyền và accessibility; tên clip/ảnh/hash không chứng minh safety hay quyền.
- [Brief](NEXT-STEPS.vi.md) phân biệt clip tham khảo, unit đọc, buổi tập trọn vẹn và khóa; tái sử dụng pilot/template cũ cho giáo viên chọn **1 intro + 3 buổi** nhưng chưa chỉ định người/chọn bài/duyệt. Bước 6 pilot 5–8 người/hai vòng chưa bắt đầu. Catalog/recommendation tiếp tục đóng, adapter/reader là task mới có risk review riêng.

## Kiểm tra thực tế của implementer

Người thực hiện `/root/profile46_finish` (gpt-6-sol, high); QC độc lập `/root/profile46_qc`, root `/root` kiểm cuối. Các đọc/kiểm dưới đây chỉ đụng filesystem local, không chạy upstream generator/validator, browser, cloud, native hay app:

| Kiểm | Cách kiểm | Kết quả |
|---|---|---|
| Intake baseline | Hai lượt SHA-256 trên 18 file handoff/inventory/schema/coverage/14 unit; so inventory source hash; ghi 4.7 freeze và 35 tracked dirty paths | **PASS** `BASELINE.json`: `STABLE_TWO_READS`, source match; 4.7 manifest hash `7614805e…bde1`. Không chứng minh upstream ngừng sửa sau đó. |
| Consumer receipt | Đọc lại 18 pin trước/sau; parse 38/14; exact triple join13; kiểm 45 media relative paths, file presence và declared SHA-256 | **PASS**, process exit 0: `STABLE_CONSUMER_SNAPSHOT`, 18 input mismatch 0, 13/13 join, 45/45 file/hash. Receipt SHA-256 `f0c87e4843dba778c300b0365ac035b604d522862bfa058d63224f4d8511729b`. |
| R0 source/link/wording và freeze | Đối chiếu ledger/brief với nguồn và frozen inputs, link local, pin docs | Pre-freeze self-check **exit 1** vì đúng 1 link tới [freeze](FINAL-EVIDENCE-FREEZE.json) chưa được tạo; app 237/237, canonical 18/18, tracked dirty khớp. Giữ kết quả này, chạy final self-check sau khi freeze tồn tại. QC/root còn **BLOCKED**. |
| Build, runtime, UI/browser, native, live API/data, release | Không có thay đổi app/config/hành vi hoặc external operation | **NOT_APPLICABLE** cho diff docs-only; không nhận PASS mới từ UX4.7 hay content upstream. |

Giới hạn: hash chỉ chứng minh bytes tại thời điểm đọc, không phải nội dung đúng về chuyên môn, copyright, caption, alt hoặc thực hành an toàn. Không có human approval JSON, quyền import, learner publication, AI selection, cloud write, media upload, native install hay deploy. Trạng thái native HALTED và web BLOCKED_NO_UPLOAD_OR_ALIAS theo AGENTS vẫn giữ. Các lỗi lịch sử của native trial và pending review không bị xóa bằng hồ sơ này.

Rollback là không tiêu thụ hồ sơ 5.1 hoặc thay bằng phiên bản mới sau review, giữ nguyên upstream, app và mọi evidence cũ. Handoff cho Owner chỉ là danh mục nguồn/gap/trách nhiệm có thể giao người phụ trách; **không phải nội dung đã được duyệt**. Final QC/root verdict và Owner decision phải ghi tách biệt sau freeze; trạng thái hiện tại vẫn chờ họ.
