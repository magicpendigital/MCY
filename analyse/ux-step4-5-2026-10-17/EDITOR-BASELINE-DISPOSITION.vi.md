# Phân loại editor diagnostic — 4.5 v2

Reviewer `/root/step44_independent_qc`; root yêu cầu control giới hạn sau probe v2. Không sửa app/runtime hoặc đổi assertion để lấy PASS.

Probe v2 trên source `f57b2ba99aad152ffa52192ea40725ceab0a9ba6005a347323c11a880e7301a8` trả **14 case PASS và 1 diagnostic FAIL, runner exit 1**. Case fail đòi toàn bộ textarea/focus ring của RegionEditor nằm trong dialog; textarea kết thúc y=575.859375 trong khi dialog/viewport kết thúc y=568. Không gọi toàn bộ 15-case runner là PASS.

Control `node analyse/ux-step4-5-2026-10-17/editor-baseline-control.mjs` đã hoàn tất **exit 0, hai scenario PASS về comparison/reachability**, với source/harness pins trước/sau khớp. [Raw result](editor-baseline-control/results.json) so sánh cùng thao tác Tab/Enter/typing ở 320×568 trên approved 4.4 f11 và candidate 4.5 f57:

| Quan sát | 4.4 | 4.5 v2 |
|---|---|---|
| Textarea ngay sau typing và sau chờ 750ms | top 505.859375, bottom 575.859375 | giống hệt, chênh lệch 0px |
| Dialog | top 57, bottom 568 | giống hệt |
| Tab tiếp tới Save | sheet scrollTop 123; Save top 468.859375, bottom 519.859375, trong dialog | giống hệt |
| Enter Save rồi mở lại | note `Fictional editor note` giữ đúng | giống hệt |

Pixels cũng cho thấy text vẫn nhìn/nhập được; phần bị cắt là khoảng 8px ở đáy khung/focus ring trước khi Tab tiếp. Save dùng keyboard được và sau khi Tab panel cuộn để thấy đầy đủ cả note lẫn nút.

**Disposition: P3 accessibility/layout gap đã có trong shared RegionEditor/BottomSheet, không phải regression của 4.5.** Không tuyên bố full editor focus visibility hoặc complete accessibility acceptance. Giữ gap cho task riêng; không mở rộng lượt này sang shared runtime/handlers. Source/handler/runtime của editor vẫn giữ baseline. Probe fail và control riêng được giữ nguyên để không che lịch sử.

Original P2 riêng của optional summary bị fixed footer che ở normal VI/EN đã được sửa trong source f57; bốn independent normal/28px VI/EN cases kiểm Tab/rect/ring/computed padding/open optional/typed textarea và overflow đã PASS. Hai signed-in consent on/off cases hoàn tất Sync/Journey và không có request mới từ reflection action cũng PASS. Verdict app cuối vẫn chờ toàn bộ worker required runners/evidence/final pin review và root verification.
