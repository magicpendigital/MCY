# Bước 4.2 — revision thị giác, 16/10/2026

Trạng thái: **LOCAL COMPLETE — chờ QC độc lập và root kiểm tra**. Rủi ro R1, chỉ sửa cách trình bày check-in. Chưa tích hợp vào checkout chính; dừng trước 4.3.

Candidate: `D:\Projects\MCY\.vercel\ux-step4-2-visual-20261016`.

Preview: <http://127.0.0.1:4190/?mode=web>, chỉ loopback với cấu hình `.invalid`, PID **15776**, unified session **53370**. Cùng app có `?mode=review&device=iphone` hoặc `?mode=review&device=pixel-10`.

## Kết quả người dùng nhìn thấy

- Trang mở bằng “Cơ thể bạn hôm nay.”, tiếp theo là thẻ sage nhạt dùng hình cơ thể hiện có và hành động “Mở bản đồ cơ thể”. Câu lợi ích “Chọn vùng, ghi lại cảm nhận riêng” mô tả đúng thao tác sẵn có.
- “Không thấy khó chịu” và “Chưa xác định” là hai lựa chọn phụ 14 px, bình thường, vùng chạm tối thiểu 44 px; không có đáp án mặc định. Chúng có vòng trạng thái rõ ràng và trạng thái `aria-pressed` vốn có. Ở 320 px, hai cột mềm cho phép nhãn xuống dòng và cả hai hiện phía trên footer.
- Khi mở bản đồ, thẻ thu gọn và bỏ ảnh lặp. Nhóm vùng và cue cuộn xuất hiện; toàn thân vẫn có đầy đủ khi cuộn. Danh sách chữ, laterality, cảnh báo trước xóa, và sở thích hình thể vẫn dùng các handler cũ.
- Tiêu đề ngắn và ít chữ làm điểm vào chọn vùng nổi bật hơn ba hàng ngang nhau của bản trước. Không thêm claim y tế hoặc khả năng AI chưa có.

## Bằng chứng và pin

`source-freeze.json` chứa 232 input và từng SHA; chỉ bốn file khác bản 4.2 cũ: `src/Prototype.tsx`, `src/prototype.css`, `tests/learner-ux.spec.ts`, `tests/ux-checkin-layout.spec.ts`. 232 input candidate cũ và 228 input tương ứng trong root giữ nguyên SHA. State/handler trong CheckinScreen và mọi source ngoài CheckinScreen giữ nguyên byte; runtime lock không đổi.

| Artifact | SHA256 |
|---|---|
| Prototype.tsx | `0d2875338cbd0efe6f16b1c301629a157e043775624754338d471782ad7ec761` |
| prototype.css | `b56d1c10c696104bd3c6b351309d237da2a511ea40846d727ac7b65ea86a62b2` |
| source-freeze.json | `257633c2db418f93e1623e7112e8275059b58d18bfc375a2f9c5faa1d3ccad31` |
| checkin-visual.patch | `0ba05d9719a9f47329086d2b341f2e8357c7cdbfa040f67ce13bfbaa6170ec58` |
| evidence.json | `83edceaf288b529f0ce4cf6d5de059589f3d444c0f60e0f5eb5bb88d031c915a` |

`evidence.json` pin kết quả, ảnh cuối và built artifacts. `checks.json` và các `.log` ghi command/cwd/exit. `regression-45-source-pins.json` bind source trước refinement CSS cuối; `ui-results.json` là test cuối trên source đã freeze.

## Kiểm tra đã chạy

- Từng thành phần của build hiện hành: protected runtime **28**, catalogue **0**, TypeScript, Vite **601 modules**, Sites preparation; tất cả exit **0**. `run-checks.mjs` gọi trực tiếp đúng tool/script của npm scripts, xóa biến VITE kế thừa và dùng fixture `.invalid`.
- Bundle scanner **23 text files**, Sites **4** + Playwright isolation **1**: exit **0**.
- Regression được chọn theo check-in/region/safe-area/keyboard/save: **45/45**, process exit **0**; report `regression-45-results.json`. Bộ này chạy trước refinement chỉ CSS `<=360px` cuối. Có một Owner AI-off fixture cũ khớp grep “save”; đó là mock `.invalid`, không phải live save.
- Trên source cuối: focused **15/15**, process exit **0**, `ui-results.json`: 320×568, 390×568, 360×640, 390×844, landscape844×390, iPhone/Pixel review; bốn kết quả riêng biệt (none/unsure/no answer/skip), đóng/mở và quay lại với unequal left/right, hủy/xác nhận thay thế; English partial preview; chữ lớn và keyboard.
- Exporter riêng **4 controls PASS**, exit **0**, `detail-captures.json`: expanded entry không lặp ảnh và có group selector; hình neutral/masculine hiện nhất quán trên map + thumbnail theo lựa chọn hiện tại; confirmation đã settle, cả hai action trong viewport.

Ảnh chính: `checkin-quick-final-320.png`, `checkin-quick-final-360.png`, `checkin-quick-final-390.png`, `checkin-expanded-entry.png`, `checkin-map-final-390.png`, `checkin-confirm-settled.png`, `checkin-large-false.png`, `checkin-large-true.png`. Đã tự xem các ảnh 320/360/390, full map, expanded entry và confirmation. Các preset/viewport còn lại có ảnh riêng trong thư mục.

## Intermediate failures được giữ riêng

`focused-initial-results.json`: **12 PASS / 3 FAIL**, exit1. Locator English ban đầu chứa label “Open” nên không còn match sau khi mở thành “Close”; sửa locator dùng heading ổn định. CSS-generated checkmark ban đầu lọt vào accessible name; thay bằng hình radio dot không có text. Final45 và final15 PASS sau sửa. Không giảm assertion về semantics, size hoặc laterality.

Sandboxed Edge không khởi động được; host browser lúc đầu không nối được sandbox loopback. Exporter/Playwright cuối chạy browser và server local cùng host. Không nhận ảnh từ hai lần lỗi. `checkin-confirm.png` có thể nằm giữa entrance transition nên loại khỏi visual acceptance; ảnh chấp nhận là `checkin-confirm-settled.png`. Ảnh early320 trước refinement có lựa chọn thứ hai qua fold; ảnh final320 đã sửa.

## Giới hạn và hoàn tác

Bổ sung sau phát hiện P3 của QC: nhận định tự xem ban đầu “cả hai phía trên footer” chưa chứng minh toàn bộ rect; QC đo bản pre-QC có 2.1875 px ở đáy button qua footer. Toàn bộ snapshot trước sửa được bảo tồn trong `pre-qc/`, mapping/hash trong `PRE-QC-ARCHIVE.json` (65 files). Bản cuối chỉ giảm hai margin ở step1/width≤360 xuống4px; không giảm chữ, vùng chạm hoặc artwork. `clearance-probe.json` đã settle: mỗi button top323/height59.1875/bottom382.1875; footerTop392; khoảng trống button9.8125px, focusring3px+offset3px tới388.1875 còn3.8125px. Probe exit0, sau đó final15/15 đã exit0 với assertion fullrect+6pxclearance; final build/runtime/scanner/Sites cũng exit0. 45case report giữ nguyên lịch sử trước hai refinement CSS hẹp. Lần sửa margin đầu bị margin-collapse chặn và fail guard được giữ ở `clearance-first-attempt.json` / error context; attempt dừng sau knownfailure, không nhận thành full15report. Ảnh `checkin-clearance-320.png` và quick-final320 mới thay claim tự xem bằng bằng chứng đo. QC đang kiểm tra lại độc lập; chưa suy ra verdict từ probe implementer.

Chỉ là browser fixture local; chưa có physical Android/iOS, screen reader hoặc full WCAG/200% browser zoom acceptance. Stress chữ lớn là override trên control liên quan. English vẫn là partial internal preview. Cảnh báo Vite chunk >500 kB giữ nguyên.

Không có root app edit, backend/Auth/SQL/consent contract change, email, native build/install/launch, deployment/alias, inference hoặc bước 4.3. Native HALTED và web BLOCKED không được thay đổi. Candidate cũ còn nguyên để đối chiếu/hoàn tác; candidate mới chưa đi vào runtime phát hành. QC và root chỉ cần dùng source freeze này, không rerun helper cũ hoặc ghi đè evidence trước.
