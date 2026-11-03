# QC độc lập — bước 4.3

Reviewer `energy_time_qc`, 16/10/2026. **PASS trong phạm vi source/direct QC R1 local trên freeze cuối; không còn P1/P2/P3.** Root cần direct review rồi dừng trước4.4.

## Phạm vi

Đã đọc AGENTS.md hiện hành, PLAN.vi.md bước4 mục3/F03, mcy-brand-ux, mcy-change-review/review-matrix, brand guidelines, design system/tokens. R1 trình bày Check-in bước2 trong candidate riêng `.vercel/ux-step4-3-20261016`. Không rootapp, protectedruntime, backend/persistence/VM, native, install, deploy, cloud hoặc inference. Native HALTED và web BLOCKED_NO_UPLOAD_OR_ALIAS còn nguyên.

## Source và copy

Review diff chỉ thấy UI/CSS ở Step2 và tests liên quan. Time5/10/15, mặc định10 và năm energy/null giữ nguyên. Timecard sage làm thời gian thành điểm nhìn chính; năng lượng tùy chọn nhẹ hơn. Body summary/Sửa, notices/errors/pending/retry/standalone và footer giữ logic cũ; Step1 body JSX/handlers/state/outsideCheckin byte-equivalent được own integrity xác nhận. Shared header giữ đúng nhánh Step1.

Helper off/not_ready nói đúng thời gian chỉ để tham khảo, Discover chưa lọc theo lựa chọn. Truy source: PracticeRoute truyền minutes/energy; PracticeFlowScreen chỉ invoke sau hành động chọn rõ ràng, actor/currentAIconsent/active guard; eligibleSessions có durationSeconds<=minutes*60. Catalogue0 và tập ứng viên rỗng vẫn có thể không chọn được bài, copy không hứa có kết quả phù hợp.

Energy remote chỉ được payload0–4/null khi signedIn+uid+saveFeedbackConsent; guest makeSnapshot không giữ energy. Final conditionalhelper phân biệt draft và remoteallowed, không hứa guest lưu energy hoặc Journey hiện hiển thị. Helperready mô tả gửi context khi xác nhận, không mô tả auto request. Không sửa JourneyVM, Discoverfilter, state, writehandler hoặc API.

## Evidence trước lần sửa focus cuối

Own `qc-probe.mjs`7/7 exit0 trên freeze b622…626/app430…bee/CSS796…4aa:320/360/390default+choice+Editretain,44px/14px controls, default10/nullenergy, helperguest, keyboard activation/focusstyle, wheel short/landscape tới standalone và fixedfooter, VI/EN2x changedtext; externalRequests0. Pixels trực tiếp xem gồm time360/390, energy320/390, EN2x time/energy, VI2xenergy, landscape. Đây là historicalscope vì focus được click/cuộn trước, không kiểm toànrect của mọiTab liên tiếp.

Worker phát hiện P2 Tabenergy bịfooter che175.609px; own mixedsource probe `qc-focus-initial.json` cũng ghi giá trị âm đó tại320 nhưng CSS đổi trongrun, nên toànrun exit1 và không dùng làm exactfreeze acceptance. Không bỏ qua before/afterpin mismatch.

CSS6ee…9b5/freeze7c4…5503 sửa P2 bằng scroll-padding chỉ scroller chứa Step2, footerheight hiện có+8px. Own sequential54records/6cases xác nhận các energy/nexttime/Edit đều clear+6px, mọicase giữ lựa chọn quaEdit; nhưng first5min EN2x320 chỉ1.828125px dưới nút tớifooter. `qc-focus-first-tab-ring-failure.json` exactbefore/afterpins, exit1; focusoutline solid3px và offset3px nên mép bịche4.171875px. P3 mở tại checkpoint cũ này, đã đóng bên dưới. Initialprogrammatic và actualShiftTab→Tab đã tách trong receipts; actualentry vẫn tái hiện, không đổi assertion để lấyPASS.

SandboxEdge launch thất bại trước app, giữ `qc-probe-initial-launch-failure.json`. Ownhost browser+server4198 sau đó dùng fixture.invalid, abort ngoại mạng và đóngfinally; process7case exit0. Các probe không gọi livebackend hoặc tạo grant/save thực.

## Freeze cuối và đóng findings

| Input | SHA256 tự kiểm |
|---|---|
| source-freeze.json | `d29bf12d5f20992139094af4f8a4facb2ca6e9af37b4865a9e9151e33956cd2f` |
| src/Prototype.tsx | `4301656f5e45197b421a98d63d9da8898a699cbc608449ce51ce909bc0e84bee` |
| src/prototype.css | `4a4a251b4ab64b5ea6b94813f24175d36fdbe3161b0a23bd1d5841027a5067a1` |
| evidence.json | `a8e0f53bf75ab0ebb88b704d32ffaa365b6caa19625496239059a73dca4ab64f` |

Sửa cuối chỉ thêm `.mcy-checkin-step-two button { scroll-margin-block: 8px; }`, giữ scroll-padding theo footerheight hiện có. Không handler/runtime/state mới. Own `qc-integrity.mjs` **exit0**:232 oldcandidate,228 rootinput,233 frozeninput match; guard ngoàiCheckin, state/handlers, Step1body và toànsummary/tail byte-equal.

Own `qc-focus-final.mjs` / `qc-focus-final.json` **6cases/54rectchecks PASS, process exit0**, browser/server đã đóng. VI/EN mặc định và2x tại320×568, VI360×640 và844×390; actualShiftTab→Tab vào nút đầu, Tab qua3time+5energy+Edit, activate từng lựa chọn rồi Edit/return giữ15min+energycuối. Mọi rect đầy đủ cáchfooter/top ít nhất6px; minimumfooter gap15.828125px, bao gồmfirst5minEN2x đã lỗi. Before/afterapp+CSS+freeze pins match, externalRequests0. P2hiddenenergy và P3firstringclip **CLOSED** bằng sourcefix+ownrecheck, không nới assertion. Đã xem pixels finalEN2xenergy; time transition capture tức thì không được dùng để kết luận contrastselected khi chưasettle.

## Worker checks được review

Runtime28protectedfiles, catalogue0sessions, TypeScript, Vitebuild, Sitesprep, scanner23textfiles, Sites4+isolation1 có command/process exit0 trong checks.json/log. Không gọi28runtime là28UItests. Vitechunk>500kBwarning vẫn còn.

Final focused **18/18, exit0,61.1s** trên exact app/CSS cuối:7viewports/iPhone/Pixel, off/notready/readyhelpers,2xVIEN, actualfirstTab và8buttonTab, fixtureAIcontext chỉ gửi sauconfirm. Regression31process **30PASS/1FAIL,exit1** do oldfixture giả định1440x1000 hếtcuộn; app thực96pxoverflow nên cue đúng. Test mới giữ overflow/cue ở1000 rồi fit/hide ở1400; supplemental **1/1,exit0**. Đây là30+1 trên checkpoint trước rule scrollmargin cuối, không phải clean31process hoặc finalCSSrerun. Initial13/14testlabelerror và pre-focus26/31failures giữ riêng. Reviewer không chạy lại fullsuite hoặcbuild.

Own `qc-evidence.mjs` **exit0** tự kiểm20finalimages,59builtfiles, finalfreeze/evidence và ba reporthashes/stats/processstatus. Initial evidence-harness đọc nhầm builtpath ngoài thư mụcdist nên ENOENT/exit1; sửa đường dẫn đúng manifest, không thay app/evidence/assertion. Final focused reportsha `03abdca7161e062404788b13fe037cdffc689ad43d9c4f7be21d8eb0638c2089` đúng18expected/0unexpected/0flaky. Checks là worker thực chạy và reviewer xác minh evidence, không phải reviewer rerun.

## Giới hạn

Browserfixtures và textstress scopedcontrols/helpers không phải physicalAndroid/iOS, OSdynamictext, screenreader hay fullWCAG. English vẫn partialpreview. Candidate chưaintegrate/release; rootdirectverification và uservisualacceptance là gate riêng. 4.4 WAITING_USER.
