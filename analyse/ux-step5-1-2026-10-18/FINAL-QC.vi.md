# QC độc lập cuối 5.1 — hồ sơ consumer, R0

**PASS_R0_CONSUMER_DOSSIER / ROOT_VERIFICATION_PENDING.** Hồ sơ đạt phạm vi5.1 đã giao; chưa là nghiệm thu nội dung yoga, quyền, adapter hoặc phát hành. Không cần approval chuyên môn để nghiệm thu chính hồ sơ dẫn nguồn/gap này. Sau root kiểm: bàn giao Owner và **STOP trước5.2/6**.

Implementer `/root/profile46_finish`; reviewer độc lập `/root/profile46_qc`; final verifier `/root`. QC chỉ đọc source/deliverable và tạo tài liệu QC riêng, không sửa dữ liệu hoặc metadata của implementer/upstream/candidate4.7.

## Input được review

[FINAL-EVIDENCE-FREEZE.json](FINAL-EVIDENCE-FREEZE.json) SHA256 `9b943f389e45d873b3aac835b96629d43fe0af00c1257deae6a4614236a9f5a7`:7 consumer doc pins,18 canonical metadata/unit pins,45 referenced draft-media pins và source4.7 `7614805ee74ccfa6fad506e26b8ad3dfebefec243620e4f42ab664068475bde1`. Đã đọc exact frozen ledger, receipt, next-steps, status và intake/baseline/QC; NEXT-STEPS đúng SHA `fcd229d4949df541afdb51bf4baab7bf4e9751afa18005261d753614745d5694` sau correction timing chỉ áp dụng cho buổi thực hành. Bài đọc tiếp tục có practiceDurationSeconds=null.

## Kiểm độc lập thực tế

[FINAL-QC-CHECK.json](FINAL-QC-CHECK.json) lưu exact hai lệnh `node -e` chỉ đọc filesystem/JSON/hash/assert, thời điểm và kết quả; cả hai process **actual exit0**. Không gọi script upstream, import/generate/freeze canonical hoặc chạy app/browser/build/cloud/device/Auth.

| Kiểm / expected | Kết quả quan sát |
|---|---|
| Exact immutable input/pin |7/7 docs,18/18 metadata/units,45/45 referenced bytes/SHA khớp;237/237 input4.7 và freeze/source catalog khớp. Không có drift trước/sau lượt11:40:20Z. |
|38 source records | Receipt đối chiếu đầy đủ courseId/id↔lessonId/youtubeId/duration/backlinks với inventory.38 hàng ledger được parse/readback khớp receipt; không chép title/description hoặc nội dung sức khỏe. Rights/expert pending38/38, caption chưa verified. |
|14 exact unit selections | id/revision/locale/path/SHA,kind/status/closedflags/approval count khớp JSON;14 hàng ledger gồm prefix SHA/status/count cũng khớp.13 sourceRefs match đúng một triple inventory và có backlink; standing không bị ghép theo tên. |
| Media accounting |80 slot=45 draft_present+25 identity_blocked+10 not_produced;45 referenced path/SHA đều đúng, missing giữ null.46 file vật lý=45 PNG+GENERATION-LEDGER.json; không gọi46 ảnh hoặc suy thành nội dung được duyệt.7 media_draft/7 editorial_draft. |
| Liên kết |50 local-link occurrences trong toàn bộ các Markdown được pin đều tồn tại, gồm2 link của INTAKE-QC. Đây là số đếm theo phạm vi quét QC; không thay số self-check48 của implementer. Không truy cập URL/provider. |
| Phạm vi/trách nhiệm | Không tạo kho/schema/validator/crosswalk/runtime thứ hai; ledger là index snapshot. Brief1intro+3buổi tái dùng pilot/template, chưa chọn động tác/người/bài hoặc tự sinh cue/approval. Bước5.2–6 giữ quyết định/gate riêng. |

## Kết luận về contract và wording

Hai không gian ID được tách đúng; sourceRefs.lessonId map inventory.records.id, contentUnitIds không chọn revision. Handoff chọn exact unit triple/path, cache/media dùng namespace unit+revision+locale+step/media ID; không chọn latest theo tên rN. Các field JSON learningObjectives/stopGuidance và provenance/media path giữ nghĩa từ canonical; đường dẫn nội bộ/private evidence không thành learner assets.

Hồ sơ phân biệt clip metadata, unit đọc/giải thích, buổi thực hành và khóa học; không biến đọc hết thành tập/Journey/health improvement. Buổi thực hành cần thời lượng toàn buổi thực đo, không cộng duration clip; unit đọc không bị coi là thiếu timing. Teacher/reviewer/editor/rights/accessibility cần evidence thật trên exact version/hash khi sang giai đoạn thẩm định; chưa có người thật không được tạo approval giả. Schema/validator chỉ là consistency, không phải chuyên môn/quyền. Catalog/AI recommendation vẫn đóng; không có consumer runtime nên không cần UI/build suite cho diff này.

**Không còn finding cần sửa trong phạm vi5.1.** PREPARED/QC-pending trong CURRENT-STATUS là bytes lịch sử đã frozen, được verdict riêng này bổ sung, không sửa ngầm. Pre-freeze link scan exit1 vì future freeze chưa tồn tại được giữ rõ; pass cuối chỉ áp dụng cho freeze hiện tại. Không gộp failed scan thành một run pass hoặc biến lịch sử4.7 thành test5.1 mới.

Giới hạn thời điểm:18/45 file được đối chiếu đúng trong lượt đọc; upstream đang live, đây không phải snapshot atomic toàn package. Manifest upstream PENDING và COVERAGE generated view lạc nhịp là trạng thái được ghi có chủ đích, không phải blocker nghiệm thu hồ sơ consumer. Trước tích hợp tương lai cần manifest/snapshot mới và review lại input ảnh hưởng; không sửa receipt cũ.45 ảnh chỉ được kiểm bytes/SHA/path, không xem pixels, thẩm định yoga, alt/rights hay provenance lineage toàn bộ.35 tracked dirty paths chỉ là inventory đã ghi, không có claim QC mới đã kiểm35 hash.

Build/runtime/UI/live/native/clinical/rights checks: **NOT_APPLICABLE cho hồ sơ R0**, không phải PASS các lĩnh vực đó. NativeHALTED/webBLOCKED giữ nguyên. Rollback là không consume hồ sơ5.1 hoặc thay qua phiên bản review riêng; app/upstream/history không bị đổi. **Root kiểm pins/claims và bàn giao Owner; chờ quyết định trước mọi bước sau5.1.**
