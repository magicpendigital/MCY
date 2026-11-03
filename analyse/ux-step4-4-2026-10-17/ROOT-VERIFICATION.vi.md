# Root verification 4.4 — CourseDetail

**PASS local 4.4 · WAITING_USER · STOP trước 4.5.** Root đã hoàn tất kiểm trực tiếp sau [independent app QC PASS](INDEPENDENT-APP-QC.vi.md), SHA256 `a5d673a177c6ff817987a3733437b47523f9a83d1817c4ae4836e84fe110a683`. Không còn P1/P2 được phát hiện trong phạm vi local đã kiểm. Đây không phải acceptance native, phát YouTube thật, dữ liệu live, chuyên môn/quyền nội dung hoặc release.

Record ngày 17/10/2026 Asia/Bangkok, documentation worker ghi từ kết quả root trực tiếp cung cấp và [ROOT-BROWSER-OBSERVATIONS.json](ROOT-BROWSER-OBSERVATIONS.json) do root tạo bằng Cua. Timestamp UTC trong raw observations được giữ nguyên. Worker không gán các thao tác của root thành lần kiểm riêng của mình và không sửa app source.

## Identity và các bước kiểm

Candidate cô lập: `D:\Projects\MCY\.vercel\ux-step4-4-20261017`; source freeze [SOURCE-FREEZE.json](SOURCE-FREEZE.json) SHA256 `f11a6af114f42427cd6d758f5ac191d0af65324d5018e82524adf913fde7e243`; evidence freeze [APP-EVIDENCE-FREEZE.json](APP-EVIDENCE-FREEZE.json) SHA256 `ea5e3fd5bd8f2efb7270d97c74058c909251f47d7f9857b770f0384d8f1455d6`. Root độc lập kiểm 257 pins (234 app + 16 harness + 7 workflow), command exit 0, `errors=[]`; cả hai manifest hash khớp. Root không sửa app source. Candidate chưa tích hợp root checkout, chưa đóng gói/cài native hoặc phát hành.

| Evidence | Kết quả và phạm vi |
|---|---|
| Implementer | [Handoff](HANDOFF-IMPLEMENTER.vi.md): 95 selected UI fixtures = 15 focused + 11 mapped + 69 adjacent, mọi runner exit 0; bảy baseline commands exit 0. Không gọi đây là full suite hoặc nguyên lệnh npm build nếu thực chạy các bước tương đương. |
| Independent app QC | 7 probe cases và 807 raw-byte pins exit 0; reviewer đọc diff/negative branches/ảnh và bằng chứng worker, phân biệt phần tự rerun. Xem report và [probe results](independent-qc/probe-results.json). |
| Independent control/plan QC | [Report](../process-workflow-2026-10-17/INDEPENDENT-CONTROL-PLAN-QC.md): 81 bounded checks, 25 links exit 0 và ba protocol walkthroughs; không phải app tests. [Root gate trước triển khai](ROOT-PREIMPLEMENTATION-GATE.vi.md) ghi phần root kiểm tài liệu. |
| Root final | Rehash trực tiếp 257 pins, kiểm pixels và thao tác Cua trên preview cuối sau independent app QC; các quan sát bên dưới và raw JSON. |

## Root trực tiếp kiểm trên trình duyệt

Preview local `http://127.0.0.1:4192/?mode=web`, guest, CSP chặn external network/frame/media. Root đánh dấu preview là Deliverable và reset viewport override khi kết thúc.

- Guest → thư viện ba nhóm/38 video → detail; xem 320×568, 360×640, 390×844, 844×390 và 1440×1000. Không tràn ngang, media giữ 9:16. Phát trong viewport đầu ở 320/360/390/desktop; landscape có đường cuộn tới nút. Bài 05 tiêu đề dài xuống dòng đúng ở 390.
- Tab/Enter mở caption details → privacy → Phát. Phát rõ ràng mới tạo iframe và focus media group có tên. Ở 320, group top 66.64 px nằm dưới header 55 px; Tab đầu vào iframe, native Cua Tab tiếp tới recovery ở top 289.875 px, Enter mở help. Reload giữ đúng một iframe với attempt 1.
- Chọn tiếp sang 02 tháo iframe và reflection prompt; chọn bài 18 có nút tiếp disabled. Back thư viện có zero iframe; mở lại bài đầu vẫn zero iframe. Phát rõ ràng rồi tự xác nhận đã thực hành mở reflection **hiện có**; root back không submit và khi rời có zero iframe. Đây là regression path, không triển khai 4.5 hoặc ghi health.
- Root trực tiếp xem `root-final-320/360/390/landscape/desktop.png`, `root-playing-320.png`, `root-long-390.png`; raw root captures còn có `root-last-320.png` và `root-reflection-390.png`. Root cũng xem ảnh worker font thật 28px VI/EN (`text28-false/true.png`) và iPhone/Pixel (`final-iphone/pixel.png`). Phần sau là kiểm ảnh, không phải root thao tác OS font hay thiết bị vật lý.

Hai lỗi Cua Playwright keyboard bên trong iframe bị CSP chặn đã được xử lý bằng native Cua Tab theo API có tài liệu. Lỗi công cụ/blocked frame được ghi trong raw observations, không kết luận app bug. Iframe xuất hiện và focus đúng không chứng minh video ngoài thực tế phát được.

## Giới hạn, lịch sử và bàn giao

Giữ nguyên hai worker focused failures ban đầu, lỗi reviewer map nhầm đường dẫn và các correction receipts; final PASS không viết lại lịch sử. Full skill validator vẫn **BLOCKED vì thiếu PyYAML**; kiểm frontmatter/link và direct control QC đã PASS trong phạm vi riêng. Guidance là quy trình làm việc, chưa chứng minh remote CI enforcement và không đảm bảo zero regression.

Ghi chú P3 ngoài scope hẹp: route header/aria “Khóa học miễn phí” còn trong Prototype theo baseline; không sửa ở 4.4. English là partial preview. Screen reader, native thật, actual YouTube playback/caption, live Auth/data và expert/rights acceptance còn chưa chạy. Foundation series/ảnh AI/CMS tiếp tục draft riêng. Native HALTED và web BLOCKED_NO_UPLOAD_OR_ALIAS không đổi.

Root verdict: local 4.4 đủ bàn giao Owner xem; **WAITING_USER, 4.5 chưa bắt đầu**. Rollback bằng không tích hợp 4.4 và giữ candidate 4.3 đã duyệt; không chạm dữ liệu/APK/deployment. Các trường pending/root-waiting trong tài liệu frozen trước đây là checkpoint lịch sử, chỉ được supersede về tiến độ bởi record này và [CURRENT-STATUS](CURRENT-STATUS.vi.md), không thay bytes/claims của receipts cũ.
