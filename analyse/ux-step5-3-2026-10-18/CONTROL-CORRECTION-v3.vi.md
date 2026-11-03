# 5.3 control source correction — bounded WAV allowlist

18/10/2026 · Mock UI setup đầu tiên dừng **trước test body** vì strict static allowlist của [control v2](CONTROL-SOURCE-FREEZE-v2.json) không có `.wav`. Candidate build chứa đúng ba audio mẫu đã có trong approved 4.7: `choice.wav`, `space.wav`, `welcome.wav` dưới `assets/practice/preparation-draft/`; đọc metadata tại candidate cho thấy mỗi file < 1.2 MB và có chữ ký `RIFF`/`WAVE`. Không phải lỗi content adapter, không đổi app/UI hay canonical.

Source v3 chỉ thêm `.wav` vào extension allowlist hiện có, MIME `audio/wav`, kiểm chữ ký `RIFF` vị trí 0 và `WAVE` vị trí 8 **trước khi pin hash startup hoặc gửi byte đầu**. Hash/size/path startup, symlink/containment, no-store/CSP và mọi chặn raw path giữ nguyên. Thêm một Node test positive buffered WAV/no-store và negative invalid WAV fail startup. Hai file đổi là `server/contentReview/localReviewServer.mjs` và `server/contentReview/localReviewServer.test.mjs`; 9 file v2 giữ nguyên byte trong `control-v2-preimage/`. Static parse hai file exit 0; chưa chạy Node suite v3 hoặc UI rerun.

Giữ nguyên toàn bộ v2 12/12 Node PASS như lịch sử trên source v2; **không carry sang v3**. Cần freeze v3, QC delta R3, root GO cho đúng Node suite/Mock UI rerun. Bounded audio support chỉ phục vụ static dist đã được hash, không mở media canonical draft dưới public path hoặc release.
