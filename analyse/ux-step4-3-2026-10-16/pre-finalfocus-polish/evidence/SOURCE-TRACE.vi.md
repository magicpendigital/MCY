# Bước 4.3 — thời gian và năng lượng

Phạm vi R1: trình bày và copy của CheckinScreen step2 trong candidate riêng. Giữ các giá trị 5/10/15, mặc định10, năm enum năng lượng và null; không thêm bộ lọc, nội dung, hệ gợi ý hay trường dữ liệu.

## Đường đi được xác minh trong source

- `src/Prototype.tsx`, `PracticeRoute`: tạo context có `minutes` và `energy`, truyền vào `PracticeFlowScreen`. Tại screen này chỉ khi người dùng xác nhận, actor/current consent hợp lệ mới gọi action chọn nội dung. `supabase/functions/_shared/practiceContract.ts`, `eligibleSessions`: giới hạn `durationSeconds <= context.minutes * 60`. `practiceAssistant.ts` gửi context cùng các ứng viên đã duyệt cho provider; tập ứng viên có thể rỗng. UI không hứa một bài phù hợp hoặc kết quả cá nhân hóa.
- Footer check-in khi capability ready mở dailyPractice; các trạng thái khác mở Discover qua handler cũ. Discover không nhận minutes/energy và không có bộ lọc từ check-in. Vì vậy helper AI off/not_ready nói thời gian là tham khảo để tự chọn, chưa lọc thư viện. Khi ready, helper mô tả giới hạn thời gian trong lựa chọn nội dung đã duyệt, đồng thời nói thư viện không lọc.
- `toLearnerCheckinPayload` chuyển năm enum năng lượng thành0–4/null; writer giữ `energyLevel` trong payload. Journey `Snapshot`/viewmodel không đưa energy vào phần hiển thị. Thời gian không thuộc payload check-in được lưu.
- Guest local `makeSnapshot` không giữ năng lượng. Vì vậy helper không hứa mọi lần lưu đều lưu năng lượng: signedIn+userId+saveFeedbackConsent nói ghi cùng check-in nếu lưu, chưa hiện Hành trình; ready nhưng chưa cho lưu nói draft và gửi lựa chọn khi chủ động xác nhận với AI; các trạng thái khác nói năng lượng chỉ ở nháp hiện tại và chưa dùng chọn bài. Save notice/standalone/pending/retry/errors giữ nguyên.

## Thiết kế đã triển khai

Tiêu đề editorial ngắn; timecard sage đặt đầu với số lớn và lựa chọn10 mặc định forest. Cue cuộn thành dòng nhỏ sau timecard. Năng lượng tùy chọn nền canvas, label14px và target44px trở lên; chữ2× tự reflow. Body summary và actionSửa ở dưới. Footer vẫn đưa người dùng đến nhánh thực có, dùng nguyên handler.

Probe bổ sung phát hiện keyboardTab đưa energybutton xuống sau footer. Sửa chỉ CSS `scroll-padding-block` trên scroller chứa step2, dùng biến footerheight hiện có +8px để dành đủ envelope focus6px khi có layoutfractional. Không sửa protectedruntime hoặc focus/navigation handler. Step1 body JSX, state/handlers của CheckinScreen và toàn bộ source ngoài CheckinScreen được so sánh byte-equal với candidate được duyệt trước.

Đây là fixture browser local với env.invalid, không phải native/data/AI acceptance. Native HALTED và web BLOCKED_NO_UPLOAD_OR_ALIAS còn nguyên; bước4.4 chờ người dùng.
