# QC đọc bằng chứng control expansion — 2026-10-19

Đã đọc trực tiếp `EXPANSION-CONTROL-RESULTS.json`, `expansion-control-fixtures-1.log` và `expansion-control-canonical-1.log`; không chạy lại checker/fixtures. Exact source freezev2 trong receipt khớp các pin đã GO ở `CONTROL-EXPANSION-PREINVOCATION-REVIEW.vi.md`.

Run fixtures thực có **82 tests: 81 PASS, 0 FAIL, 1 SKIP, exit0**. SKIP là OS không cho tạo file symlink; không coi case đó đã exercised/PASS. Source guard symlink vẫn được review; traversal, absolute path, wrong canonical folder và selector/tuple negatives có kết quả chạy PASS. Các fixtures chỉ có dữ liệu hư cấu/temp, không chứng minh source truth/chuyên môn/quyền.

Canonical CLI lần1 trên catalog `74dd755c…75ab` có **exit1/FAIL** với error `Local assertion needs exact existing inventory record locator` tại taxonomy label local chưa có exact record. Đây là failure của lần acceptance dữ liệu đầu, không phải một fixture được lên kế hoạch expect FAIL hay acceptance PASS. Guard từ chối dữ liệu là đúng; log gốc được giữ.

Data repair sau đó đã được reviewer đọc độc lập và GO trước canonical CLI lần2: `EXPANSION-REPAIR-READ-QC.json`. Chỉ taxonomy label refs và README thiếu Crow được sửa, không weaken checker. Receipt kết quả CLI2/global suite/final manifest chưa nằm trong phạm vi snapshot này; không suy chúng từ GO source hoặc audit đọc. Báo cáo phase này không là final package verdict.

## Đã đọc canonical CLI2 sau repair STOP

Đã đọc trực tiếp `expansion-control-canonical-2.log` và receipt sau CONTROL_WRITE_STOP, SHA256 `0ba1f72ec14ec3b6276f79cd955effddba763796f223d613f947c3a8e6e54582`. CLI2 trên catalog `055317c1…0830` có exit0/PASS: 114 entities, 20 sources, 24 taxonomies, 11 relations và 17 existingContentLinks; unit/media contribution0. Source freezev2 giữ nguyên; fixtures không bị lặp. Receipt đã làm rõ CLI1 là initial unexpected acceptance failure, status plain FAIL_DATA_LOCATOR_REJECTION, không relabel thành PASS.

Phạm vi phase expansion technical evidence hiện PASS với giới hạn 1 OS symlink SKIP và các human/source-truth gates ở trên. Core global suite, final producer source pin/research dependency addition và final manifest chưa được reviewer nhận để chốt. Không có final-package hay release verdict ở báo cáo này.
