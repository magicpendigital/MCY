# Node control 5.3 v3 — WAV static allowlist

Root duyệt [source v3](CONTROL-SOURCE-FREEZE-v3.json) sau [QC v3](CONTROL-PREINVOCATION-QC-v3.vi.md). Thay đổi so v2 chỉ ở `localReviewServer.mjs` và test của nó: ba WAV đã thuộc artifact UX4.7 được static allowlist phục vụ với `audio/wav`, RIFF/WAVE magic và startup hash; WAV sai bị từ chối. Không nới source/test/raw-path hoặc asset canonical allowlist.

Lần wrapper đầu [v3 receipt](control-node-v3/receipt.json) **exit1 trước khi khởi chạy Node**: PowerShell `return ,$bad` đóng gói danh sách mismatch rỗng thành một phần tử. `childExitCode=null`, stdout/stderr rỗng, không có test verdict. Source v3 và canonical vẫn khớp; [wrapper v3b](run-control-node-v3b.ps1) chỉ sửa cách liệt kê mismatch, ghi output riêng. Root đọc wrapper và cấp GO riêng.

[V3b receipt](control-node-v3b/receipt.json) ghi child/wrapper **exit0**, [TAP](control-node-v3b/stdout.tap) **13/13 PASS, 0 FAIL, 0 SKIP**, không timeout. Chín source v3 và 71 canonical dependency khớp hash trước/sau; child chỉ nhận sáu biến OS `SystemRoot`, `WINDIR`, `PATH`, `TEMP`, `TMP`, `USERPROFILE`, không có `NODE_OPTIONS`, provider key hoặc `.env`. Test WAV positive và invalid mới cùng các control adapter, local lease, drift, Host/Origin, Owner read-only đã chạy; không có SDK/cloud/native/deploy. Kết quả này không chứng nhận bản UI/browser, Owner actual preview hay human Teacher/Reviewer review.

Giới hạn vẫn như [control v2](CONTROL-EXECUTION.vi.md): chỉ kiểm các field schema đã tiêu thụ; final source recheck hữu hạn không phải snapshot filesystem nguyên tử, bytes đã gửi không thể thu hồi; canonical upstream có thể đổi và khi đó đọc phải fail closed. Preview Owner, QC độc lập và root manual vẫn là gate riêng.
