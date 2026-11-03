# Bước 4.3 — thời gian và năng lượng, 16/10/2026

Trạng thái: **IMPLEMENTED_QC_ROOT_VERIFIED_WAITING_USER**. R1, chỉ UI local trong candidate riêng. **4.4 WAITING_USER**. Chưa tích hợp checkout chính.

Candidate: `D:\Projects\MCY\.vercel\ux-step4-3-20261016`.

Preview: <http://127.0.0.1:4191/?mode=web>, loopback với cấu hình `.invalid`, unified session **65252**. Cùng app hỗ trợ `?mode=review&device=iphone` và `?mode=review&device=pixel-10`. Preview4190 và bản4.2 được duyệt giữ nguyên.

## Kết quả nhìn thấy

- Step2 mở bằng “Một khoảng cho mình.”, đưa thời gian5/10/15 lên đầu trong timecard sage, mặc định10 có nền forest. Thời gian là điểm nhìn chính; năng lượng tùy chọn được trình bày nhẹ hơn trên canvas, nhãn14px và vùng chạm ít nhất44px.
- Khi AI tắt/chưa sẵn sàng: UI nói người dùng tự chọn bài trong thư viện; thời gian chỉ để tham khảo và thư viện chưa lọc theo lựa chọn này. Khi AI ready: UI nói giới hạn thời gian dùng để chọn nội dung đã duyệt, không hứa có ứng viên phù hợp hay cá nhân hóa.
- Helper năng lượng theo đúng trạng thái: được ghi cùng check-in khi tài khoản có quyền lưu nhưng chưa hiện Hành trình; nháp/AI xác nhận khi ready mà chưa cho lưu; chỉ ở nháp và chưa dùng chọn bài trong nhánh còn lại. Không hứa guest lưu được năng lượng vào lịch sử.
- Body summary, Sửa, save notice, standalone/error/pending/retry và footer dùng nguyên logic. Năm enum năng lượng, null, thời gian/mặc định giữ nguyên. Không thêm recommender, content, bộ lọc hoặc Journey viewmodel.
- Cue cuộn thành dòng nhỏ sau timecard. CSS `scroll-padding-block` chỉ trên scroller chứa step2 dùng footerheight hiện có +8px; Tab qua tất cả lựa chọn không còn đưa focus sau footer. Envelope6px được đo bằng test, không chỉ nhìn screenshot.

Source trace đầy đủ trong `SOURCE-TRACE.vi.md`. Root đã xem và duyệt hướng thị giác qua early/refined360/390; đây chưa phải root verification cuối.

## Pin và tính toàn vẹn

| Artifact | SHA256 |
|---|---|
| Prototype.tsx | `4301656f5e45197b421a98d63d9da8898a699cbc608449ce51ce909bc0e84bee` |
| prototype.css | `4a4a251b4ab64b5ea6b94813f24175d36fdbe3161b0a23bd1d5841027a5067a1` |
| source-freeze.json | `d29bf12d5f20992139094af4f8a4facb2ca6e9af37b4865a9e9151e33956cd2f` |
| evidence.json | `a8e0f53bf75ab0ebb88b704d32ffaa365b6caa19625496239059a73dca4ab64f` |

Freeze gồm233input:232copy chọn lọc + `tests/ux-energy-time.spec.ts`. Hai appfile thay đổi và ba testfile thay đổi để redirect ảnh/cập nhật exactcopy/fixtureviewport; newfocusedtest là addition. Toàn bộ232input bản4.2 và228input tương ứng trong root giữ SHA. State/handlers CheckinScreen, Step1 body JSX và source ngoài CheckinScreen byte-equal. Protectedruntime/lock không đổi. `checkin-energy-time.patch` và hash từng input nằm trong freeze;59builtfiles/20ảnh cuối được pin trong evidence.

Freeze trước sửa viewportfixture là `d45db396…e1e9`, giữ ở `pre-fit-source-freeze.json`. Checkpoint7c4 sau sửa fixture chỉ đổi pin `tests/learner-ux.spec.ts`; checkpoint này đã được bảo tồn trong pre-finalfocus-polish. Freeze cuối d29bf thêm đúng rule scrollmargin cục bộ và nâng bốn keyboardtests sang actualfirstTab; final18 và buildchecks được chạy lại trên appsource cuối, mô tả ở phần polish bên dưới.

## Kiểm tra đã hoàn tất

- `node analyse/ux-step4-3-2026-10-16/run-checks.mjs`: exit0 trên appsource cuối; gọi đúng từng thành phần npm script với VITE env kế thừa bị xóa và fixture.invalid. Runtime28, catalogue0, TypeScript, Vite601modules, Sitesprep, scanner23textfiles, Sites4 + Playwrightisolation1 đều exit0. Command/cwd/exit riêng trong `checks.json` và `.log`.
- `node analyse/ux-step4-3-2026-10-16/run-ui.mjs focused`: **18/18**, process exit0,1.0m. `ui-results.json`/`focused.log`/`focused-command.json`. Bao gồm320×568,360×640,390×844,390×568,844×390, iPhone/Pixelreview; helperoff/not_ready/ready, remoteallowed/revoked/guest; default10/nullenergy, exactbuttonnames, no-write manualcatalog, AIcontext chỉ gửi sau xác nhận; 2×14→28px và số32→64px VI/EN; Tab qua cả8time/energybuttons, rect+focusenvelope6px trênfooter.
- `node analyse/ux-step4-3-2026-10-16/run-ui.mjs regression`: **30 PASS /1FAIL**, process exit1,2.1m, giữ nguyên `regression-results.json`/`.log`. Lỗi duy nhất là test cũ giả định1440×1000 hết cuộn; bố cục mới thực có96px overflow nên cue còn hiện đúng.
- Sau sửa **chỉ fixturetest**, `node node_modules/@playwright/test/cli.js test --config analyse/ux-step4-3-2026-10-16/fit.playwright.config.mjs`: **1/1**, process exit0,9.2s, `fit-results.json`. Test giữ kiểm tra cue tại320, thêm overflow/cue tại1440×1000 rồi kiểm fit/hide tại1440×1400. Không giảm assertion hoặc sửa app để hợp test.

31regressioncases được đối chiếu bằng **30+1**, không phải một process31/31. Chọn phạm vi body semantics/unequal sides, Edit/back, English loop, navigation focus, short viewport/scroll cue, AIready2presets/closedcapability, guest explicitoptin, consentedaccountsave, samekey retry, late dispatch/accountswitch, failedsave→Journey. Không chạy Owner hay fullsuite không liên quan. Mọi backend là fixture.invalid.

Ảnh cuối đã tự xem: `time-390.png`, `energy-320.png`, `keyboard-final-true-28.png`, `true2x-true.png`; refined360/390 xác nhận activeX==viewportX==0 và energyheading360 đầy đủ. Các preset/kích thước và VI2× có ảnh riêng được pin. Cuộn bằng wheel thông thường được kiểm khi tiếp cận năng lượng và standalone, không chỉ scrollIntoView.

## Failures được giữ

Sandbox Edge launch thất bại; hostbrowser không nối sandboxpreview. Sau khi cả preview vàbrowser cùnghost, ảnh hợp lệ được xuất exit0. Không nhận ảnh lỗi thành evidence.

Focused đầu13/14 exit1 vì assertion tên màn “Thư viện” không tồn tại; sửa sang heading thực +3groups/38lessons,14/14 exit0. `focused-initial-results.json`/initialsource giữ riêng.

Pre-focus31run26PASS/5FAIL exit1:3exactcopy cũ,2timeout20s trong lúc browser chạy đồng thời. Rerun cùng31case1worker đóng các lỗi đó, chỉ còn viewportfixture mô tả trên.

Ownprobe phát hiện Tabenergy bịfooter che dù các test click sau khi wheel đều pass. `PRE-FOCUS-ARCHIVE.json` bảo tồn397file của checkpoint đó. Sửa6px đầu3/4 exit1 do EN28px có5.828pxclearance; context/CSS/freeze giữ ở `focus-first-*`. Sửa8px giữ nguyên assertion6px, targeted4/4 exit0 rồi final18/18 exit0. Không tự coi QC7/7 trước đó là đã đóng lỗi focus mới.

## Giới hạn và bước tiếp

Đây là browserfixturelocal; chưa có physicalAndroid/iOS, screenreader, fullWCAG hoặc fullbrowser200%zoom acceptance. True2× chỉ áp dụng controls/helpers liên quan. English vẫn partialpreview. Cảnh báo Vite chunk>500kB được giữ nguyên.

Không rootapp edit, cloud/backend/Auth/SQL/consentcontract/AI/model/datawrite, email, nativebuild/install/launch hay deployment/alias. NativeHALTED và webBLOCKED_NO_UPLOAD_OR_ALIAS không thay đổi. Hoàn tác bằng giữ candidate4.2 được duyệt; candidate4.3 chưa đi vào runtime phát hành.

QC độc lập và root directverification sẽ có hồ sơ riêng trên hash cuối. Implementer dừng code ở đây; chỉ bổ sung tài liệu dựa trên kết luận thực tế được root cung cấp. Dừng trước4.4 để chờ người dùng.

## Polish focus cuối sau QC

Checkpoint7c4 và442file evidence/source/dist đã được bảo tồn trong `pre-finalfocus-polish/`, mapping `PRE-FINALFOCUS-POLISH-ARCHIVE.json`. QC độc lập dùng actualfirstTab (focus5min, ShiftTab, Tab) phát hiện EN2×320 có bottom390.171875/footer392: button/text hiện đầy đủ nhưng vòng6px còn bị cắt4.17px. Ownprobe trước edit tái hiện gap1.828125; thêm `scroll-margin-block:8px` cho button trong step2 cho gap15.828125. `first-tab-polish-probe.json` giữ cả baseline và ba phương án CSS injection.

Source cuối chỉ thêm đúng một rule CSS này so checkpoint7c4; Prototype byte-equal. Bốn ca keyboardtest được nâng lên actualfirstTab bằng ShiftTab→Tab trước khi đi qua cả8control, giữ assertion fullrect+6px. Freeze cuối d29bf…6cd2f, CSS4a4a…067a1. Sau chỉnh: requiredchecks7nhóm đều exit0; focused18/18 process exit0 (1.0m). Finalimages20 và dist59 được pin lại trong evidence a8e0…ab64f. Không chạy lại31regression;30+1 là lịch sử trước polishCSS cuối theo phạm vi root cho phép. Evidence có guard xác nhận ngoài rule scrollmargin mới, CSS và Prototype không có thay đổi app khác. QC-owned receipts/files gốc không bị ghi đè.

Checkpoint chốt: QC độc lập6cases/54rectchecks exit0 đã đóng P2/P3 trên đúng pin cuối. Root đọc source/diff/harness/evidence, tự đối chiếu hash, thao tác guest390/320, keyboardfirstTab, Edit-retain, wheel tới phần dưới và manualcatalog3groups/38lessons; không thêm P1/P2/P3 trong scope local. Root để preview4191 ở Step2 clean và tự xem `root-final-clean-390.png`. Chi tiết/giới hạn trong `ROOT-VERIFICATION.vi.md`. Trạng thái chờQC/root ở các đoạn checkpoint trước và snapshot immutable nay là lịch sử; không sửa lại các receipt đó. **4.3 IMPLEMENTED_QC_ROOT_VERIFIED_WAITING_USER;4.4 WAITING_USER**.
