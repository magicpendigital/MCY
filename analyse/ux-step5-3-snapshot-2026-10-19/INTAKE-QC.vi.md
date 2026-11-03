# QC độc lập intake rebind snapshot 5.3 — 19/10/2026

Reviewer `/root/snapshot53_qc`; chỉ đọc source/intake, không import control hoặc chạy test/app/browser. **PASS_INTAKE_SCOPE** để root xét GO tạo candidate; execution và final acceptance vẫn **BLOCKED** cho tới freeze, QC source, test và root kiểm trực tiếp.

Tôi đọc [TASK-INTAKE.vi.md](TASK-INTAKE.vi.md) SHA256 `56105bf265256e4c5adcdcb6a61ef654d71e3534b23386b18fb88a34a6e31509`, [BASELINE.json](BASELINE.json) SHA256 `ad9ae5385a517c5b0f078d2b875d77c3b3641dd23657dace0dfa4f7f8e35fd10`, skill/lifecycle/risk matrix và AGENTS. Phân loại R3 là đúng cho thay pin allowlist của Owner reader nháp có kiểm soát. Quyền Owner hiện có chỉ cho đồng bộ snapshot bảy unit, QC độc lập, root kiểm và STOP chờ quyết định tiếp; không cấp quyền nội dung/chuyên môn, real Reviewer/Teacher, native/cloud/web release.

## Đối chiếu độc lập trước edit

- Tôi tự hash 71 dependency của selectedSnapshot cũ: **64 khớp, đúng 7 unit JSON khác**; bảy path và SHA mới khớp `CANONICAL-DRIFT-CHECK-v1.json`. Contract, inventory, bảy unit còn lại và 55 PNG đều giữ pin cũ. BASELINE ghi 255/255 source và 59/59 dist/client khớp freeze, 35 root tracked dirty được liệt kê; không có lý do copy arbitrary glob hoặc đụng checkout root.
- Tôi đọc bytes UTF-8 bảy JSON hiện tại, thay ngược duy nhất câu exit mới bằng câu cũ **4 lần/unit**, hash lại trong bộ nhớ. Kết quả tái tạo đúng **7/7 old SHA** của selectedSnapshot; tương ứng đúng 28 chuỗi exit được ghi trong `ROOT-EXIT-WORDING-FIX.vi.md`. Không viết preimage hay sửa canonical. Đây là chứng cứ byte diff, không là phê duyệt hướng dẫn vận động.
- BASELINE kiểm 14 selector identity/revision/locale/path, 38 nguồn, 55 asset `draft_present`, 25 slot `identity_blocked`, flags đóng và approval rỗng. Tôi đọc adapter hiện hữu: selectedSnapshot chỉ Node-side; `readPinned` kiểm hash/path/symlink, `readUnit` kiểm identity/source refs/media/status, `readAsset` kiểm PNG, `verifyCurrent` recheck. Test adapter đầu tiên đã đi qua cả 14 unit, 55 buffer ảnh và 25 slot unavailable; hai suite model/server kèm theo tổng 13 case. Fresh execution vẫn phải chờ source freeze và root GO.
- Diff dự kiến đúng **8 JSON fields**: `capturedUtc` và bảy `units[].sha256` theo path cố định. `schema`, ID, revision, locale, paths, assets, contract, inventory, source/control/test/frontend/config/package không đổi. Kế hoạch đóng băng new 255, new 71 và reused client59, kiểm old selection reject cùng negative mới là phù hợp. Reuse build/runtime/UI15/mapped12 chỉ được ghi historical với so sánh exact inputs: frontend graph không import selectedSnapshot, 254 source còn lại/config/package/lock và 59 artifact phải giữ bytes; root fresh Owner reader kiểm bảy unit mới và blocked labels. Không suy human review hoặc release từ fixture.

## Điều kiện còn lại

Sau root GO tạo candidate, QC sẽ đối chiếu actual full diff với tám field trên, tất cả pin 255/71/59 và control source unchanged **trước Node13 invocation**. Old selection phải tiếp tục fail closed; new selection phải đọc 14 unit/55 ảnh và từ chối 25 missing slot cùng negative identity/MIME/path. Nếu thêm path/hash drift, thiếu media, status hoặc source ref đổi, hoặc target đã tồn tại, dừng và mở lại intake. Root phải trực tiếp xác minh final pins/browser/stop; không chạy bước 6 khi chưa có Owner quyết định. Native `HALTED/currentActorVerified=false`, web `BLOCKED_NO_UPLOAD_OR_ALIAS` giữ nguyên.

P1/P2 trong phạm vi **intake**: không có. Kết luận này không gán PASS cho candidate hay test chưa chạy.
