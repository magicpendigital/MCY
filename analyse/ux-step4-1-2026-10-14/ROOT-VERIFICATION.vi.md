# Root verification — 4.1 Home

Ngày 14/10/2026. Tài liệu này ghi nhận các kết quả do root trực tiếp báo cáo sau QC cho checkpoint 4.1 trong candidate `.vercel/ux-step4-1-20261014`. Tài liệu được `step_coordinator` ghi theo dữ kiện root cung cấp; người viết không tự chạy lại kiểm tra hoặc quan sát browser.

## Source freeze và QC

- Worker handoff/evidence xác nhận source hash `0a9d46864b427c58dd9e0bac1f35f143176f2e1558b19e0baf1820ebd1b6fd3a`, CSS hash `66b2edad77bf9057d0a3c72f17c09b954c325d5d48b7df788b7f1c51cb9eb25a`, test hash `d4b26b7bed811561f25d03b1a4c06071d4dc5e9fc4a7d30fba78a69434ef0996`.
- Reviewer `home_qc` final `QC.vi.md`: R1 PASS, no P1/P2; report hash `e686acdeff1e94c94ccfa0fd7c2fc7266489a202baef3540b795193b186457d5`. QC có chạy narrow independent probe.
- Worker báo Home 9 và regression 82 đều PASS, exit 0; build, runtime 28, scanner 23, Sites 4 và isolation 1 đều PASS.
- Root sau QC trực tiếp đọc patch, harness, HANDOFF và evidence; tự tính source và QC hash, khớp với các giá trị đã báo.

## Root source và visual review

Root trực tiếp dùng in-app browser tới localhost port 4188, không đăng nhập tài khoản thật, ở viewport 360×640:

- Guest vào Home rỗng: primary và secondary actions đều ở phía trên footer; body rộng 360px.
- Bắt đầu check-in, chọn `Không thấy khó chịu`, rồi quay lại Home: CTA `Tiếp tục check-in` xuất hiện cùng thông báo session chưa lưu; khi tiếp tục, status đã chọn vẫn được giữ.
- Secondary action của Home mở Discover và catalog 38 nội dung.
- Ảnh desktop 1440×900 giữ đầy đủ phần đầu và khuôn mặt; ảnh dùng `object-fit: contain`, kích thước hiển thị 756×454 cho ảnh tự nhiên 756×453.

Các ảnh root lưu trong thư mục checkpoint này: `root-home-360.png`, `root-home-draft-360.png`, `root-home-desktop.png`. Đây là ảnh do root báo đã chụp, không phải ảnh được người viết tài liệu tự kiểm tra.

## Giới hạn và quyết định checkpoint

Preview đầu ở localhost 4188 timeout trong sandbox. Worker dừng process 88396; cùng script khởi động lại trong session 78393 với `require_escalated` trả HTTP 200. Các quan sát browser ở trên là phiên root báo hoạt động sau đó; preview mới là session 78393. Evidence `evidence.json` của session cũ được giữ như lịch sử.

Không có native hoặc live acceptance, kiểm accessibility đầy đủ, kiểm thiết bị thật, hoặc kết luận AI-ready. READY/EN/iPhone/Pixel là fixture của agent. Root không sửa code, không tích hợp candidate và không sửa harness/test.

Trạng thái: **4.1 IMPLEMENTED, QC AND ROOT VERIFIED — WAITING_USER**. Đề xuất của root là chấp nhận Home candidate cho người dùng xem xét ở môi trường local; đây không phải release approval. **4.2 vẫn WAITING_USER** và chưa bắt đầu.

Thời điểm root gửi báo cáo cuối: ____________________

Phản hồi mới nhất của người dùng về checkpoint kế tiếp: ____________________
