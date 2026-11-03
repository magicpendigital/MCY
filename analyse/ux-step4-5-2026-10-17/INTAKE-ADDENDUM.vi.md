# Addendum trước chỉnh footer Reflection — 4.5

Root yêu cầu đo footer sau early pixel review. Đo local web320×568, VI/EN: nút chính chạm right320, skip chạm left0 nên thiếu inset/focus clearance. Với font28px/line-height1.5, nút chính108px và bottom573 vượt viewport568. Bốn JSON `footer-{false,true}-{false,true}.json` là đo trước sửa, không phải PASS về layout.

Phạm vi R1 bổ sung có điều kiện đã nêu trong intake và root hiện đã cho phép: chỉ thêm root class `mcy-reflection-footer` vào JSX root của ReflectionFooter, giữ nguyên save callback/children/onClick; CSS chọn đúng class này để grid/shrink/wrap/inset16px. Không sửa FlowStack, route footerHeight104, runtime, snapshot hoặc handlers. Đo lại VI/EN28 và simulator safe area; nếu không vừa reservation hiện có phải gửi root geometry/proposal trước thay scope. Không tự mở rộng logic hay parent footer height.

Impact: root footer class → scoped control layout → opaque inset footer/current Reflection only. Class chỉ ở footer đang render, không dùng retained reflection route để select ancestor; Home/CourseDetail/4.1–4.4 giữ regression. So sánh toàn bộ ReflectionFooter sau khi bỏ đúng class token phải byte-for-byte với4.4; flow route/config và phần còn lại giữ pin.

Checks: actual primary/skip bounds và focus ring đủ6px, inset>=16px, touch>=44px, no overlap/clipping at320/390, VI/EN+28, iPhone/Pixel, keyboard/textarea scroll clear actual header/footer. Bảy baseline gates và bounded adjacent suite chạy sau final edit. Rollback chỉ bỏ class/scoped CSS hoặc bỏ candidate, không live effects.
