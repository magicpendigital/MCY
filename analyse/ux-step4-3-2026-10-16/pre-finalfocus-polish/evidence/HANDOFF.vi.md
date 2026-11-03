# Bước 4.3 — thời gian và năng lượng, 16/10/2026

Trạng thái: **IMPLEMENTED_LOCAL_CHECKS_PASS_QC_ROOT_PENDING**. R1, chỉ UI local trong candidate riêng. **4.4 WAITING_USER**. Chưa tích hợp checkout chính.

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
| prototype.css | `6ee32cfe537e30c414abd367c8a9496716fa9025d304a30caca30bfa13eaf9b5` |
| source-freeze.json | `7c4c6fbbd9dc7596a4f9d3befa25fb24184ed36b532aabcbb23f0162d1795503` |
| evidence.json | `9d150fcda74ae9248a909808e856a7dea6327831d74b9d5cd6a4a5a91f9c961a` |

Freeze gồm233input:232copy chọn lọc + `tests/ux-energy-time.spec.ts`. Hai appfile thay đổi và ba testfile thay đổi để redirect ảnh/cập nhật exactcopy/fixtureviewport; newfocusedtest là addition. Toàn bộ232input bản4.2 và228input tương ứng trong root giữ SHA. State/handlers CheckinScreen, Step1 body JSX và source ngoài CheckinScreen byte-equal. Protectedruntime/lock không đổi. `checkin-energy-time.patch` và hash từng input nằm trong freeze;59builtfiles/20ảnh cuối được pin trong evidence.

Freeze trước sửa viewportfixture là `d45db396…e1e9`, giữ ở `pre-fit-source-freeze.json`. Freeze cuối chỉ đổi pin `tests/learner-ux.spec.ts`; appfiles và focusedtest giữ nguyên. Final18 và buildchecks vì vậy kiểm đúng appsource cuối.

## Kiểm tra đã hoàn tất

- `node analyse/ux-step4-3-2026-10-16/run-checks.mjs`: exit0 trên appsource cuối; gọi đúng từng thành phần npm script với VITE env kế thừa bị xóa và fixture.invalid. Runtime28, catalogue0, TypeScript, Vite601modules, Sitesprep, scanner23textfiles, Sites4 + Playwrightisolation1 đều exit0. Command/cwd/exit riêng trong `checks.json` và `.log`.
- `node analyse/ux-step4-3-2026-10-16/run-ui.mjs focused`: **18/18**, process exit0,38.2s. `ui-results.json`/`focused.log`/`focused-command.json`. Bao gồm320×568,360×640,390×844,390×568,844×390, iPhone/Pixelreview; helperoff/not_ready/ready, remoteallowed/revoked/guest; default10/nullenergy, exactbuttonnames, no-write manualcatalog, AIcontext chỉ gửi sau xác nhận; 2×14→28px và số32→64px VI/EN; Tab qua cả8time/energybuttons, rect+focusenvelope6px trênfooter.
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
