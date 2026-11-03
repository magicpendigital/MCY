# R1 focus correction trước chỉnh source — 4.5 revision2

Independent QC tìm P2 thật trên frozen source101e8b5c…: normal VI320, actual Tab tới optional summary có top431.796875/bottom496.796875 trong khi opaque footer bắt đầu464, che khoảng33px. EN normal có cùng cơ chế. Local scroll-margin24px chưa tính fixed footer. Larger-text cases đi qua không chứng minh normal focus.

Root đã chấp thuận proposal trong R1: thêm duy nhất class `mcy-reflection-scroll` vào MobileScroll của ReflectionScreen; `.mcy-reflection-scroll > .mobile-scroll` nhận scroll-padding-top24px và bottom `calc(var(--flow-footer-height,104px) + 24px)`. Selector chọn đúng DOM scroll con, không ancestor `:has` từ retained inactive route. Giữ handlers, snapshot, consent/Auth/backend, route footerHeight104 và runtime bytewise. Không sửa shared runtime/checker/lock.

Durable test bổ sung actual Tab ở normal VI/EN320 tới summary; đo computed scroll padding và toàn rect focused element phải nằm giữa actual header và actual opaque footer với focus-ring clearance. Giữ28px/no-overflow/textarea/true source branches. Footer helper cũ dùng programmatic focus sau click nên :focus-visible có thể0; đổi helper sang actual Tab trước assert ring6, không sửa app vì sai modality của test.

HOLD: không sửa app/test khi old focused runner hoặc QC old-freeze probes còn chạy. Chỉ sau root relay clear và runner receipt, preserve sourcefreeze101e/current results rồi mới áp patch. New SOURCE-FREEZE-v2 pin final app/tests/harness/addendum; reopen affected QC. Bảy baseline app gates và bounded focused/mapped/adjacent chạy trên revision2; old36 verdict bất kể PASS hay FAIL không là final clearance.

Evidence scope local browser/simulator fixtures; no physical/native/live/AI/provider/deploy. Native HALTED/web BLOCKED, STOP trước4.6 giữ nguyên. Rollback bỏ revision2/candidate, giữ approved4.4; không đụng history/cloud data.
