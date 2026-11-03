# QC độc lập — local4.6 Cá nhân

**PASS có điều kiện cho riêng thay đổi trình bày Profile4.6; không có P1/P2 mới được xác nhận trong diff. Không phải toàn bộ kiểm tra PASS.** Hai P2 có từ4.5 vẫn tồn tại: nút đăng nhập tài khoản khác bị Auth router đưa trở lại Bảo mật, và nhãn thanh điều hướng bị cắt ở fixture28px. Nghiệm thu toàn bộ Auth/responsive vì vậy chưa đạt. Root final verification và user review còn chờ; dừng trước4.7.

Reviewer /root/profile46_qc độc lập với implementer và /root/profile46_finish. Root là final verifier. Theo lifecycle/change-review/risk matrix/brand guidance và QC template hiện hành. Phạm vi R1 là Profile return JSX/copy và CSS sở hữu Profile; không sửa handler Auth/consent/persistence, AccountDetail, shared navigation/runtime hay backend.

## Nguồn và phạm vi kiểm

Candidate .vercel/ux-step4-6-20261018, [source freeze01d](SOURCE-FREEZE-v1.json) SHA256 01d45905ff401b6e127bac0bbafff03d3c66934e064f0711fcaf10deddb8db45. Approved4.5 freeze f57b2ba99aad152ffa52192ea40725ceab0a9ba6005a347323c11a880e7301a8.

Own [source checker](independent-source-check.mjs) exit0/[receipt](INDEPENDENT-SOURCE-CHECK.json):236 app/test+16 harness pins,235 approved4.5 inputs,228 dirty-root preimages và52 old tests khớp. Existing files chỉ khác src/Prototype.tsx và src/prototype.css; thêm ux-profile.spec.ts. Profile handlers và toàn bộ source trước/sau return bytewise; CSS cũ là nguyên prefix. Backend, AccountDetail, routes/callback payloads, i18n và28 runtime inputs giữ nguyên. Reviewer không sửa app.

Đọc actual Profile/AccountDetail/AuthSessionRouter, scoped CSS, selected test/harness và raw receipts. Profile mới giữ9 destinations/back, direct privacy/revoke access, actual notification preferences/free access/help, optional guest account CTA, actual local logout handler; bỏ claim verified/sync trên Profile và không thêm status từ loading/default consent. Hướng hierarchy/copy phù hợp phạm vi đã giao.

## Kết quả thực tế và attribution

| Phạm vi | Command/action và nguồn | Exit/kết quả | Evidence và giới hạn |
|---|---|---|---|
| Seven baseline gates | Implementer run-checks.mjs, source01d | 7 exit0/PASS | checks.json và logs: runtime28/catalogue0/TypeScript/build/Sites prep/bundle23 text/Sites+env5. Reviewer kiểm input identity và receipts, không tự rerun toàn bộ. |
| Focused Profile | Implementer run-ui.mjs focused final-v1 | 28/28,exit0 | focused-final-v1-*; riêng worker security assertion có thể thấy màn tạm thời, không chứng minh stable login. |
| Mapped adjacent identity/settings | Implementer run-ui.mjs mapped final-v1 | 14/14,exit0 | mapped-final-v1-*; synthetic delayed profile/consent/account epoch/current-version và retained routes. |
| Original adjacent strict CSP | Implementer run-ui.mjs adjacent final-v1 | 13PASS/2FAIL,exit1 | adjacent-final-v1-* giữ nguyên; frame-src none chặn mocked iframe trước counter. Không relabel whole PASS. |
| Full15 synthetic-frame supplement | Worker run-course-mock-escalated-v2.mjs sau QC/root GO | 15/15,exit0 | course-mock-escalated-v2-*; prior supplement sandbox run15 pre-body launch FAIL/exit1 giữ nguyên. Source01d/tests/assertions/45s timeout/12min cap giữ nguyên, separate ef06/824e harness freezes. |
| Own original13 | node independent-profile-probe.mjs, freeze2e99 | 10PASS/3FAIL,exit1 | independent-profile-v1-command.json, independent-qc-v1/results.json; guest32028 focus bounds và2 stable security assertions FAIL. |
| Own same-path footer comparison | node independent-nav-baseline-control.mjs, freeze2e99 | 4 captures,exit0 | independent-nav-control/results.json và4 pixels; equality capture PASS không đồng nghĩa large-text legibility PASS. |
| Own bounded baseline classification | node independent-edge-baseline-diagnostic.mjs, freezeb23 | 4 captures,exit0 | independent-edge-baseline-diagnostic/results.json; process PASS chỉ là capture, không desired app behavior PASS. |
| Own final settled28 control | node independent-profile-probe-v2-settled28.mjs, final freeze4cf | 11PASS/2FAIL,exit1 | independent-profile-v2-command.json, independent-qc-v2-settled28/results.json; same13 assertions/timeouts, chỉ thêm computed28px/42px readiness trước actualTab và output/command metadata riêng. Hai stable security assertions vẫn FAIL. |

Own actual browser scope: synthetic Edge/local invalid backend, proxy deny outbound, strict4213 CSP frame/media none, service workers blocked. Các helper đóng context/browser/server trong finally và node đã exit; không có independent OS process inventory. Root preview4194 là process riêng, reviewer không đóng. Không actual account/email/Auth logout/consent/profile/SQL/media/provider/native/deploy action.

Own11 PASS ở final control gồm guest320 normal và settled28 actualTab/full-ring toàn bộ9 rows+guest CTA, long identity28 toàn bộ9 rows+logout, iPhone/Pixel normal keyboard/safe area, all9 destinations/back+guest create form, local logout success và HTTP500 pending/disabled/local SDK clear/error display, hydration loading/error/account replacement, sharing revoke access và Home CSS isolation. Notification false/true state/copy/aria-pressed assertions đều chạy qua trước failure ở stable security; hai combined cases vẫn được ghi FAIL, không tính chúng là PASS. Local logout500 clear không chứng minh remote revocation thành công.

## Findings và disposition

**P2 có từ4.5 — stable other-account login không giữ được màn email.** Khi signedIn/backend ready, vào Bảo mật rồi bấm “Đăng nhập bằng tài khoản khác”, cả approved4.5 và candidate4.6 đều xuất hiện auth-email tạm thời rồi quay về security; sau settled+1second không có active email form. Raw captures lưu route/DOM và pixels cho cả hai. Unchanged AccountDetail action đặt login/security rồi push authEmail; unchanged AuthSessionRouter1021–1025 redirect signedIn ready auth routes về destination. Không suy đổi tài khoản thành công từ transient form. Ngoài sửa presentation4.6; không có phép sửa shared Auth/router ở đây.

**P2 có từ4.5 — shared BottomNav28px cắt nhãn.** Cùng guest Profile path/320x568/injection28px, footer/control/label/line geometry của4.5 và4.6 bằng nhau chính xác. Normal text legible ở cả hai. 28px cả4 nhãn vượt bounds/cắt tại thanh68px; range geometry không ghi nhận overlap giữa line rects, nhưng pixels thể hiện nhãn bị cắt/đứng sát nhau. Shared navigation source/CSS giữ nguyên. Không nghiệm thu global responsive/large-text legibility; đây là fixture28px, không phải kết luận physical text-setting hay WCAG conformance.

**Rapid/unsettled style-change focus còn chưa nghiệm thu; chưa xác nhận regression mới.** Original13 có guest28 first-row clipped sau actualTab. Bounded baseline capture với pre-focus geometry read cho thấy4.5 row374.875–567.875/ring6 vượt footer500, trong khi4.6 row204.5–451.5/ring6 nằm trọn phía trên footer500, scrollTop171/padding24px/92px. Final v2 dùng explicit computed style28px/42px gate, giữ full-ring bounds nguyên, guest28 và long-account28 đều PASS. Việc layout/style settlement giải thích khác biệt là inference; không được ghi thành bound cause hoặc biến original10/3 thành11/2. Không product patch, không thêm exploratory iteration sau final control.

Historical shared RegionEditor8px P3 ngoài4.6 giữ nguyên; không rerun/fix trong scope này.

## Controls, evidence reuse và handoff

Reviewer đã pre-invocation review ef06 synthetic-frame guard/setup/wrapper/config/runner,14 URL controls exit0; v2 config bytewise trừ output paths,4 new+7 original pins checked. Root review/GO trước invocation. Exact frame origin/path/query/GET/document chỉ trả static HTML; unknown nonlocal abort/fail và proxy deny. Own integrity check đọc đủ15 network-guard attachments PASS/violations=[]; không actual YouTube playback/media claim.

Source01d và original strict harness không đổi qua supplements/own probes; do đó focused28/mapped14/seven gates được reuse với input comparison cụ thể, không đổi environment-specific failures thành PASS. New helper freezes2e99/b23/4cf giữ riêng; c791 preliminary metadata preimage chưa invoke, được giữ cùng final correction record. Các failure, sandbox errors và prepared statuses lịch sử không bị rewrite.

Final pins/evidence được pin trong INDEPENDENT-QC-EVIDENCE-FREEZE.json, kiểm riêng để tránh self-hash cycle. Root phải kiểm final artifacts/pixels/flow và ghi verdict trực tiếp; reviewer không nhận thay root result. Full screen reader/physical keyboard/Android/iOS/live Auth/data/real media/clinical/rights/release/full English chưa nghiệm thu. Native HALTED và web BLOCKED_NO_UPLOAD_OR_ALIAS giữ nguyên.

Rollback trong scope: không integrate candidate4.6, giữ approved4.5; cách này không sửa các P2 cũ. Không live data/APK/deployment để rollback. Next authorized action là root direct final verification và user review riêng4.6; **STOP trước4.7**.
