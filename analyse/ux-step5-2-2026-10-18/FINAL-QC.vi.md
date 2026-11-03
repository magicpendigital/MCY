# QC độc lập cuối 5.2 — technical packet cho người thật

**PASS_R0_TECHNICAL_PACKET / ROOT_VERIFICATION_PENDING. HUMAN_REVIEW vẫn BLOCKED_DETAILS_AND_EVIDENCE_PENDING; chưa hoàn tất5.2.** Packet đủ để giao Owner/người phụ trách; không phải approval chuyên môn/quyền hoặc quyền tích hợp/phát hành. Sau root kiểm: **STOP chờ Owner trước5.3/6**.

Implementer queue/snapshot `/root/profile46_finish`, packet helper `content51_plan`; independent QC `/root/profile46_qc`; final verifier `/root`. Các tên này là vai trò agent sản xuất/kiểm hồ sơ kỹ thuật, không phải nhân sự yoga hoặc người có thẩm quyền review thật.

## Inputs và actual checks

[FINAL-EVIDENCE-FREEZE.json](FINAL-EVIDENCE-FREEZE.json) SHA256 `80cb5e10adb4701135034aff4dbb120e4a1796ee0b24a97a3fd2297b2dcc6410` pin9 gate/deliverable docs,17 canonical metadata/unit inputs,55 referenced draft assets và4.7 sourcefreeze761480…bde1. Đã đọc exact [queue](REVIEW-QUEUE.vi.md), [snapshot](REVIEW-SNAPSHOT.json) SHA `6afe0108557058b0634c7ac65c2ef46209fc2269e9755cf0f8082dc6a5225d75`, [human packet](HUMAN-REVIEW-PACKET.vi.md) SHA `427afa283004491e8ad96b9d1da024e0b60c47f69ace9cf1d3ecabf99ee31db6`, status và intake/supplement bound bytes.

[FINAL-QC-CHECK.json](FINAL-QC-CHECK.json) giữ **exact lệnh node -e**, thời điểm13:46:08–09Z và **actual process exit0**. Lệnh chỉ đọc filesystem/JSON/SHA/path/refs và ghi receipt QC riêng; không chạy upstream validator/generator/manifest, app/browser/build/cloud/device/Auth/SDK.

| Kiểm mapped / expected | Actual result |
|---|---|
| Immutable docs và source preservation |9/9 docs,17/17 canonical,55/55 referenced asset hashes khớp trước/sau;237/237 input4.7 và sourcefreeze khớp;7 consumer docpins5.1 cùng freeze cũ nguyên byte. Không có drift trong lượt đọc. |
|38 source keys | Receipt khớp inventory courseId/id↔lessonId/youtubeId/backlinks/rights/expert/caption flags; clip ID không trở thành unit ID hoặc buổi tập. |
|14 exact unit selections | id/revision/locale/path/hash/kind/status/closedflags/count khớp JSON;13 sourceRefs join đúng một inventory triple có backlink, relation topic_reference/contentObserved=false. Standing không bị ghép theo tên với stand-up. |
| Queue readback | Parse đủ14 hàng và đối chiếu revision/locale/path/prefixSHA/sourceRef/media counts với snapshot; tất cả khớp. Không chọn latest bằng rN hoặc dùng contentUnitIds để chọn bản. |
|80 media slots | Snapshot từng slot khớp source:55 draft_present,25 identity_blocked,0 not_produced; step.mediaIds/stepId liên kết đúng.80 khóa unit+revision+locale+step/media ID duy nhất.55 file/path/SHA đúng; blocked giữ null. Không review pixels/quyền/chuyên môn. |
| Filesystem khác slots |56 file vật lý,55 PNG và ledger JSON; không nói56 ảnh hoặc55 asset đã được duyệt. |
| Links |52 local-link occurrences trong các Markdown được freeze đều tồn tại. Không truy cập provider/source URL. |

## Contract, nhân sự và giới hạn acceptance

Mapping/namespace đúng: sourceRefs.lessonId map inventory.records.id cùng courseId/youtubeId; source, unit và media giữ các không gian ID riêng. Trong JSON unit gốc media.path là package-relative; REVIEW-SNAPSHOT.path là repo-relative đã prefix content/yoga-library để mở đúng file. Receipt giữ full exact hash, không thay media store/object-key approval. Provenance/private evidence không thành learner asset; không có adapter/import/runtime consumer.

Owner báo **OWNER_REPORTED_SELECTED_DETAILS_PENDING** được tách đúng khỏi danh tính/phạm vi/năng lực/tính độc lập, quyền hoặc evidence thật. Packet không điền tên/qualification/approval thay người thật, không tạo CMS assignment/grant hay approval JSON. Template/checklist là câu hỏi cần người nhận trả lời; technical readiness không tự đóng expert/rights/editorial/accessibility decisions. Thiếu người/evidence là blocker human review, **không phải lỗi packet R0**.

Brief1intro+3buổi tái dùng pilot/template, chưa chọn tư thế hoặc viết cue/health copy. Clip tham khảo, unit đọc, buổi thực hành và khóa được tách rõ; đọc hết không tạo thực hành/Journey. Timing toàn buổi chỉ cho buổi thực hành được người thật chọn;14 bài đọc giữ practiceDurationSeconds=null và mọi learnerVisible/recommendationEligible=false, publishStatus=unpublished, review pending, approvalRecords rỗng.

Temporal comparison đúng: so5.1 có4 shared input đổi upstream (handoff, cobra, cobra-gentle, three-legged-dog); README là input mới5.2.55/25/0 hiện tại không carry45/25/10 cũ thành PASS mới.5.1 đã duyệt là hồ sơ snapshot lịch sử và vẫn giữ nguyên.17 input5.2 gồm README/handoff/inventory+14units, không gồm schema/COVERAGE hoặc toàn package. Manifest và expansion catalog/README vẫn absent tại lượt kiểm; expansion metadata-only/in-flight không nhập vào14unit queue và không bị coi là lỗi cần consumer sửa.

CURRENT-STATUS PREPARED và final-QC/root-pending là trạng thái frozen trước review, được verdict này bổ sung riêng. Worker báo một query PowerShell ad-hoc sau freeze dùng pipe trực tiếp sau if/else bị ParserError “An empty pipe element is not allowed”, exit1 trước khi đọc freeze; không có mutation. Query sửa syntax rồi self-check9/17/55/237/52 exit0 là các lần riêng, không đổi diagnostic thất bại thành PASS. QC không tự chạy lại các query đó; tool history của worker giữ chúng. Đây không phải app/content failure hoặc full-suite acceptance. Lượt kiểm QC hiện tại có command/exit riêng; không chạy suite và không mang PASS4.7/5.1 sang5.2.

**Không còn finding cần sửa trong phạm vi packet.** Root cần kiểm final pins/claims và bàn giao cụ thể; human review5.2 vẫn BLOCKED tới khi đủ nhân sự, scope, exact bytes và evidence/quyết định thật. Upstream live có thể đổi ngay sau lượt đọc; phải snapshot/review mới trước người thật quyết định, không sửa receipt cũ. Hash/path consistency không chứng minh yoga, rights, alt/caption, qualification hoặc nguồn đã được xem.35 dirty paths không được claim QC đã kiểm35 hash mới. App/UI/build/live/native/clinical/rights acceptance là NOT_APPLICABLE cho technical packet R0, không phải PASS các lĩnh vực đó. NativeHALTED/webBLOCKED giữ nguyên; rollback là không consume hoặc thay packet bằng phiên bản review riêng. **STOP trước5.3/6.**
