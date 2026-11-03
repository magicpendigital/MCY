# QC intake độc lập 5.1 — tiếp nhận kho nội dung nháp

18/10/2026 · Reviewer `/root/profile46_qc`; implementer `/root/profile46_finish`; final verifier `/root`.

**PASS_INTAKE_R0 — đủ điều kiện để root GO triển khai hồ sơ consumer 5.1.** Đây chưa là nghiệm thu deliverable, dữ liệu upstream, chuyên môn/quyền hoặc tích hợp. Chưa có deliverable được tạo trước GO: lượt kiểm chỉ thấy `TASK-INTAKE.vi.md` và `BASELINE.json`. Sau hồ sơ 5.1 phải QC độc lập → root kiểm → STOP chờ Owner trước 5.2/6.

## Input và kiểm tra thực tế

- [Intake](TASK-INTAKE.vi.md) SHA256 `5fe812bbf1f26e0017b803711b76c7b8d97af5b72ba01f50777c2bde474b5077`.
- [Baseline](BASELINE.json) SHA256 `c97d03b86868de6b6692f0e8f05b56ef3f3e02ca38c852faae28be757b30ebee`, snapshot hai lượt đọc của implementer tại11:23:09Z; không phải manifest atomic/final của upstream.
- QC đọc plan Bước5/F06, lifecycle/matrix, AGENTS hiện hành, handoff canonical mới, inventory/schema, validator, hai unit mẫu và pilot/template đã có. Read-only metadata/hash/path checker tại11:24:45Z **actual exit0**:18/18 file canonical còn khớp bytes/hash snapshot;14 selected unit `(id, revision, locale, path)` khớp JSON;12 link intake tồn tại; freeze4.7 `7614805ee74ccfa6fad506e26b8ad3dfebefec243620e4f42ab664068475bde1` và237 input ứng viên đều khớp. Không chạy validator/generator/render/manifest của nhánh content, app tests hoặc browser.
-35 tracked dirty paths là danh sách baseline, không phải chứng cứ hash từng file dirty. Không diễn giải thành35 hash đã được QC kiểm mới. Canonical vẫn đang sản xuất; kết quả trên chỉ đúng tại lượt đọc đã nêu.

## Đánh giá phạm vi/tác động

R0 đúng theo diff dự kiến: chỉ ledger/index dẫn nguồn, acceptance contract, phân biệt loại nội dung, brief tái sử dụng và backlog/gate. Luồng tác động là canonical snapshot → receipt/mapping/status → hồ sơ giao người phụ trách; không có consumer runtime. Không tái sản xuất inventory/schema/unit/media/crosswalk/render hay dựng validator/framework thứ hai. Nhánh upstream tiếp tục sở hữu nội dung và manifest cuối; thiếu manifest lúc intake là PENDING có chủ đích. COVERAGE chỉ có hai foundation là generated view đang lạc nhịp, không dùng làm truth và không sửa tại5.1.

Intake phân biệt clip tham khảo, unit đọc, buổi thực hành, khóa học; dùng lại brief1intro+3buổi từ pilot/template, không tự chọn động tác, viết cue hay duyệt chuyên môn. Review thật, exact hash/version, quyền, caption/accessibility và người chịu trách nhiệm vẫn là gate; catalog/recommendation đóng. Chạm health copy, adapter, quyền, tool/control hoặc app phải đánh giá lại scope/tier trước làm, không kế thừa R0.

Mapping/version strategy đủ rõ cho triển khai docs: `sourceRefs.lessonId ↔ inventory.records[].id` cùng courseId/youtubeId; contentUnitIds chỉ là backlink. Chọn exact bộ ba/path theo handoff/snapshot, không lấy rN lớn nhất; step/media/cache phải namespace theo unit+revision+locale. Dùng tên JSON `learningObjectives/stopGuidance`, không biến shorthand objectives/stop thành field thật. Package-relative media khác repo-relative provenance; dependencies/private evidence không trở thành learner asset.

## Kiểm sau GO và giới hạn

Map kiểm phù hợp R0: đối chiếu38 source record và14 selected triples/path; truy nguyên từng trạng thái/gap; link/diff/wording/receipt-hash; kiểm no-import/no-publish và source4.7 không đổi. Nếu input live đổi giữa hai lượt đọc thì ghi UNSTABLE và tạo receipt mới, giữ snapshot cũ; không gọi đó là consumer regression hay final upstream acceptance.

**46 là số file vật lý đếm tại intake**, không phải46 ảnh đã sản xuất/được duyệt. Ledger phải tách referenced media slots, draft_present, identity_blocked, not_produced và file filesystem; không suy counts giữa các nhóm hoặc mang số đang sản xuất thành final coverage. Final manifest/media-byte/provenance verification của upstream còn pending và không bị đóng bởi tài liệu5.1.

Không còn blocker intake trong phạm vi này. Build/runtime/UI, cloud/device/Auth/media/clinical/rights acceptance là **NOT_APPLICABLE** cho diff docs-only, không phải PASS. Deliverable và root final verification còn **BLOCKED chờ triển khai sau root GO**. Rollback là không consume hoặc thay hồ sơ consumer ở lượt review riêng; không sửa upstream/candidate4.7, không phát hành và không bắt đầu bước tiếp theo.
