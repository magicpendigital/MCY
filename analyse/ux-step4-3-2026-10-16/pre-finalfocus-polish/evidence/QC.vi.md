# QC độc lập — bước 4.3

Reviewer `energy_time_qc`, 16/10/2026. **CHƯA CHỐT**: đang chờ freeze CSS sau sửa mép focus đầu tiên và kiểm lại phạm vi liên quan. Root cần direct review rồi dừng trước4.4.

## Phạm vi

Đã đọc AGENTS.md hiện hành, PLAN.vi.md bước4 mục3/F03, mcy-brand-ux, mcy-change-review/review-matrix, brand guidelines, design system/tokens. R1 trình bày Check-in bước2 trong candidate riêng `.vercel/ux-step4-3-20261016`. Không rootapp, protectedruntime, backend/persistence/VM, native, install, deploy, cloud hoặc inference. Native HALTED và web BLOCKED_NO_UPLOAD_OR_ALIAS còn nguyên.

## Source và copy

Review diff chỉ thấy UI/CSS ở Step2 và tests liên quan. Time5/10/15, mặc định10 và năm energy/null giữ nguyên. Timecard sage làm thời gian thành điểm nhìn chính; năng lượng tùy chọn nhẹ hơn. Body summary/Sửa, notices/errors/pending/retry/standalone và footer giữ logic cũ; Step1 body JSX/handlers/state/outsideCheckin byte-equivalent được own integrity xác nhận. Shared header giữ đúng nhánh Step1.

Helper off/not_ready nói đúng thời gian chỉ để tham khảo, Discover chưa lọc theo lựa chọn. Truy source: PracticeRoute truyền minutes/energy; PracticeFlowScreen chỉ invoke sau hành động chọn rõ ràng, actor/currentAIconsent/active guard; eligibleSessions có durationSeconds<=minutes*60. Catalogue0 và tập ứng viên rỗng vẫn có thể không chọn được bài, copy không hứa có kết quả phù hợp.

Energy remote chỉ được payload0–4/null khi signedIn+uid+saveFeedbackConsent; guest makeSnapshot không giữ energy. Final conditionalhelper phân biệt draft và remoteallowed, không hứa guest lưu energy hoặc Journey hiện hiển thị. Helperready mô tả gửi context khi xác nhận, không mô tả auto request. Không sửa JourneyVM, Discoverfilter, state, writehandler hoặc API.

## Evidence trước lần sửa focus cuối

Own `qc-probe.mjs`7/7 exit0 trên freeze b622…626/app430…bee/CSS796…4aa:320/360/390default+choice+Editretain,44px/14px controls, default10/nullenergy, helperguest, keyboard activation/focusstyle, wheel short/landscape tới standalone và fixedfooter, VI/EN2x changedtext; externalRequests0. Pixels trực tiếp xem gồm time360/390, energy320/390, EN2x time/energy, VI2xenergy, landscape. Đây là historicalscope vì focus được click/cuộn trước, không kiểm toànrect của mọiTab liên tiếp.

Worker phát hiện P2 Tabenergy bịfooter che175.609px; own mixedsource probe `qc-focus-initial.json` cũng ghi giá trị âm đó tại320 nhưng CSS đổi trongrun, nên toànrun exit1 và không dùng làm exactfreeze acceptance. Không bỏ qua before/afterpin mismatch.

CSS6ee…9b5/freeze7c4…5503 sửa P2 bằng scroll-padding chỉ scroller chứa Step2, footerheight hiện có+8px. Own sequential54records/6cases xác nhận các energy/nexttime/Edit đều clear+6px, mọicase giữ lựa chọn quaEdit; nhưng first5min EN2x320 chỉ1.828125px dưới nút tớifooter. `qc-focus-first-tab-ring-failure.json` exactbefore/afterpins, exit1; focusoutline solid3px và offset3px nên mép bịche4.171875px. P3 còn mở tại checkpoint này. Initialprogrammatic và actualShiftTab→Tab đã tách trong receipts; actualentry vẫn tái hiện, không đổi assertion để lấyPASS.

SandboxEdge launch thất bại trước app, giữ `qc-probe-initial-launch-failure.json`. Ownhost browser+server4198 sau đó dùng fixture.invalid, abort ngoại mạng và đóngfinally; process7case exit0. Các probe không gọi livebackend hoặc tạo grant/save thực.

## Worker checks được review

Runtime28protectedfiles, catalogue0sessions, TypeScript, Vitebuild, Sitesprep, scanner23textfiles, Sites4+isolation1 có command/process exit0 trong checks.json/log. Không gọi28runtime là28UItests. Vitechunk>500kBwarning vẫn còn.

Focused18/18exit0 gồm7viewports/iPhone/Pixel, off/notready/readyhelpers,2xVIEN,8buttonTab và fixtureAIcontext chỉ gửi sauconfirm. Regression31process30PASS/1FAILexit1 do oldfixture giả định1440x1000 hếtcuộn; app thực96pxoverflow nên cue đúng. Test mới giữ overflow/cue ở1000 rồi fit/hide ở1400; supplemental1/1exit0. Đây là30+1, không phải clean31process. Initial13/14testlabelerror và pre-focus26/31failures giữ riêng. Reviewer không chạy lại fullsuite hoặcbuild.

## Giới hạn

Browserfixtures và textstress scopedcontrols/helpers không phải physicalAndroid/iOS, OSdynamictext, screenreader hay fullWCAG. English vẫn partialpreview. Candidate chưaintegrate/release; rootdirectverification và uservisualacceptance là gate riêng. 4.4 WAITING_USER.
