# Khóa học trực tuyến với giảng viên: phân tích và thiết kế (24/11)

Nguồn: yêu cầu của Owner ngày 24/11. Đây là **phân tích và đề xuất**, chưa phải quyết định hay lệnh làm. Mỗi lát cần kế hoạch riêng (`plans/_TEMPLATE.md`). Canvas: bảng "L1 · Khóa trực tuyến" trên https://claude.ai/artifact/Uxw44YQsBvUdCFffPfPcHg. Thông tin bên ngoài lấy qua tìm kiếm ngày 24/11, chưa kiểm trong console thật; mục cần xác minh đánh dấu ⚑.

## 1. Owner muốn gì
1. Một loại khóa thứ hai, **khóa trực tuyến**: trang khóa có phần giới thiệu, không có danh sách bài chi tiết, vì học qua Zoom hoặc Google Meet với giảng viên.
2. Mua xong thì **lịch các buổi** được gửi vào tài khoản (trong app) và email của học viên.
3. Sau mỗi buổi, **giảng viên gửi nhận xét** vào tài khoản học viên.
4. **Ghi hình buổi học**: một extension Chrome ghi lại buổi học, đẩy lên kênh YouTube liên kết, rồi gắn video vào đúng khóa để người đã mua xem lại.
5. **Nhận xét kèm tư liệu**: nhận xét chỉ tới thời điểm trong video hoặc đính ảnh cắt từ video.

## 2. Đã có sẵn những gì
- **Phần xương đã có ở server** (migration `20261005004000_private_teacher_collaboration.sql`, schema `private`):
  - ghi danh (`enrollments`): học viên, giảng viên, phiên bản khóa;
  - điểm danh (`attendance`);
  - nhận xét theo buổi và theo khóa (`feedback`, `kind = session | course`), có lịch sử bản sửa, nút "gửi" riêng và nhật ký.
- **Phía học viên** (`src/classes/classApi.ts`, màn "Lớp của tôi") chỉ đọc. Hàm Edge `teacher-collaboration` **chưa triển khai**; rà soát #8 đã ghi lại điều này.
- **Còn thiếu:**
  - khái niệm buổi học có giờ: hiện điểm danh gắn với bài đọc (`lesson_version`), không gắn với một buổi họp;
  - lịch, link phòng họp, thông báo, email giao dịch;
  - video ghi hình;
  - mốc thời gian trong nhận xét;
  - cách mua.
- **Quyết định cũ phải đổi:**
  - Ngày 21/11 Owner chọn mặc định "khóa trả phí chưa gồm lớp trực tiếp". Yêu cầu này đi ngược lại, nên cần Owner xác nhận là đổi quyết định đó.
  - `PRODUCT_DECISIONS` ghi "video trả phí không đặt ở YouTube unlisted". Ý tưởng đưa bản ghi lên YouTube vướng đúng điểm này (xem mục 5).

## 3. Luồng đề xuất
```
Khám phá → trang khóa trực tuyến (giới thiệu, giảng viên, lịch dự kiến, số chỗ, "Đăng ký")
  → mua (giai đoạn F) hoặc Owner ghi danh tay (thử nghiệm)
  → "Lớp của tôi": lịch các buổi, nút "Vào lớp" mở 15 phút trước giờ
     + email xác nhận kèm tệp lịch .ics; nhắc trước 24 giờ và 1 giờ (theo đồng ý thông báo)
  → buổi học diễn ra trên Zoom/Meet
  → sau buổi: bản ghi xử lý xong → gắn vào buổi đó; giảng viên viết nhận xét (có mốc giờ, ảnh cắt) → bấm Gửi
  → học viên nhận thông báo → xem nhận xét, bấm mốc để nhảy tới đúng đoạn video
```
- Đường 3 chạm của khách và 38 clip miễn phí không đổi. Khóa trực tuyến chỉ là một loại thẻ khác trong Khám phá.

## 4. Mô hình dữ liệu (thêm vào schema `private`, theo quy tắc RPC hiện có)
| Bảng | Trường chính | Ghi chú |
|---|---|---|
| `live_courses` | `course_version_id`, `delivery = 'live'`, `teacher_id`, `capacity`, `timezone` (mặc định Asia/Ho_Chi_Minh), `provider` (zoom/meet) | Phần giới thiệu nằm trong bản đã duyệt; giá và quyền nằm ở bảng ưu đãi và bảng quyền của giai đoạn F |
| `live_cohorts` | khóa, ngày khai giảng, trạng thái (mở đăng ký, đang học, kết thúc, hủy) | Một khóa có nhiều đợt |
| `live_sessions` | đợt, số thứ tự, `starts_at`, `duration`, trạng thái (đã lên lịch, đổi giờ, đã học, hủy), `meeting_ref` | **Link phòng họp không đưa vào snapshot công khai**; chỉ người đã ghi danh mới nhận, qua RPC |
| `attendance` (mở rộng) | thêm `live_session_id`, có thể để trống | Giữ nguyên điểm danh theo bài đọc hiện có |
| `session_recordings` | buổi, nơi lưu (`provider`, `asset_id`), thời lượng, trạng thái (chờ, sẵn sàng, gỡ), `retention_until` | Không lưu URL vĩnh viễn; link xem được cấp sau khi kiểm quyền |
| `feedback_anchors` | `feedback_id`, `revision`, `t_start` (giây), `t_end?`, `frame_asset_id?`, ghi chú ngắn | Gắn với bản sửa nhận xét đã gửi, nên không sửa được sau khi gửi |
| `notifications` | người nhận, loại (lịch, đổi giờ, nhắc, nhận xét mới, bản ghi mới), đã đọc | Hộp thư trong app; email đi qua hàng đợi riêng |

- Quyền xem: học viên chỉ thấy buổi, bản ghi và nhận xét của **đợt mình đã ghi danh, còn hiệu lực**. Giảng viên chỉ thấy đợt mình dạy.
- Học viên khác trong đợt **không thấy nhận xét của nhau**.

## 5. Ghi hình: extension Chrome + YouTube có ổn không?
**Kết luận: không nên làm theo hướng này lúc đầu.** Lý do:

1. **YouTube không hợp với video trả phí và hình học viên.**
   - Video "không công khai" ai có link cũng xem và chia sẻ được.
   - Video "riêng tư" chỉ chia sẻ được cho từng tài khoản Google, rất khó quản lý.
   - `PRODUCT_DECISIONS` đã cấm đặt video trả phí ở YouTube unlisted.
   - Buổi yoga có hình học viên mặc đồ tập, đây là dữ liệu cá nhân nhạy cảm về mặt xã hội.
2. **YouTube khóa video tải lên qua API chưa kiểm định.** Dự án API chưa qua kiểm định (audit) của YouTube chỉ tải được video **riêng tư**; muốn đổi phải qua kiểm định tuân thủ điều khoản của YouTube ⚑. Hạn mức tải lên mỗi ngày cũng có giới hạn ⚑.
3. **Ảnh cắt từ video YouTube nhúng thì trình duyệt không cho lấy** (khung nhúng khác tên miền). Muốn có ảnh cắt phải tự giữ tệp video.
4. **Extension tự ghi thì dễ hỏng.**
   - Nó chỉ ghi được tab Chrome đang mở (API `tabCapture`, cần Chrome 116+ và giảng viên phải bấm bắt đầu); không ghi được ứng dụng Zoom cài trên máy.
   - Đóng tab, máy ngủ hoặc mạng yếu là mất bản ghi.
   - Tệp lớn nằm trên máy giảng viên.
   - Phải qua duyệt của Chrome Web Store và bảo trì mỗi khi Meet hoặc Zoom đổi giao diện.
5. **Zoom và Meet đã có ghi hình trên đám mây, kèm API.**
   - Zoom cloud recording có webhook `recording.completed` để tải tệp ⚑ (cần gói Zoom trả phí).
   - Google Meet ghi vào Drive của người tổ chức; Meet REST API cho biết khi tệp MP4 sẵn sàng (`FILE_GENERATED`) và trả mã tệp Drive ⚑ (cần gói Workspace có ghi hình).
   - Cả hai đều có thông báo "đang ghi" hiện cho mọi người trong phòng.

**Đề xuất:**
- Dùng ghi hình đám mây sẵn có của Zoom/Meet. Một hàm Edge nhận thông báo, kéo tệp về **nơi lưu video có bảo vệ**: cùng lựa chọn với giai đoạn F1 (dịch vụ video có link ký ngắn hạn và phát HLS, như Bunny, Cloudflare Stream, Mux; xem `paid-tier-ux-2026-11-18.md`). Sau đó gắn tệp vào `session_recordings`.
- Ảnh cắt được tạo ở server từ tệp gốc (ffmpeg) hoặc ngay trong trình biên tập của giảng viên, rồi lưu riêng tư.
- **Extension Chrome chỉ là phương án dự phòng** cho giảng viên không có gói Zoom hoặc Workspace. Nếu làm, extension tải thẳng lên nơi lưu của MCY qua link tải lên một lần, không qua YouTube.
- Nếu Owner vẫn muốn YouTube:
  - chỉ dùng cho **bản biên tập công khai không có hình học viên** (ví dụ bài tóm tắt của giảng viên);
  - không dùng cho bản ghi buổi học;
  - không tải xuống hay sao chép lại video YouTube (đúng quy tắc hiện có).

## 6. Nhận xét có mốc thời gian
- Trình viết nhận xét của giảng viên:
  - video phát bên trái, ô viết bên phải;
  - nút "Gắn mốc tại 12:34" chèn một thẻ mốc;
  - nút "Cắt ảnh" lưu khung hình hiện tại.
- Phía học viên:
  - mỗi mốc là một chip `12:34`; bấm vào thì video nhảy tới đúng giây;
  - ảnh cắt hiện nhỏ, chạm để phóng to.
- Quy tắc sẵn có vẫn giữ: nhận xét do người viết, AI chỉ gợi ý (`ai_assisted_teacher_confirmed`), chỉ gửi khi giảng viên bấm Gửi, sửa thì thành bản mới.
- Giọng văn: không chẩn đoán, không hứa chữa bệnh. Nhận xét về tư thế là quan sát, không phải kết luận y khoa.

## 7. Thông báo và email
- **Trong app:** hộp thư mới ở "Lớp của tôi", gồm lịch, đổi giờ, nhắc, nhận xét mới, bản ghi mới.
- **Email giao dịch** (xác nhận đăng ký, lịch kèm `.ics`, đổi hoặc hủy buổi):
  - gửi theo hợp đồng mua, khác email quảng cáo;
  - cần một đường gửi riêng, ví dụ Resend API qua hàm Edge có hàng đợi và giới hạn;
  - **không** dùng 13 mẫu email Auth hiện có.
- **Nhắc trước giờ:** chỉ khi học viên bật thông báo, vì đồng ý thông báo đã tách riêng.
- Đổi giờ hoặc hủy buổi luôn báo cả trong app lẫn email.

## 8. Riêng tư, đồng ý, pháp lý ⚑
- Luật Bảo vệ dữ liệu cá nhân số 91/2025/QH15 có hiệu lực từ 1/1/2026 ⚑. Hình ảnh và giọng nói của học viên trong bản ghi là dữ liệu cá nhân. Cần:
  - **đồng ý ghi hình riêng** trước buổi đầu;
  - được tắt camera mà vẫn học;
  - nói rõ ai xem bản ghi (chỉ đợt đó và giảng viên), giữ bao lâu (ví dụ hết đợt + N ngày, Owner quyết), xóa theo yêu cầu.
- Bản ghi nên ưu tiên **góc nhìn giảng viên** (speaker view) để ít ghi hình học viên.
- Data safety của Google Play và `privacy.html` phải cập nhật trước khi bật. Văn bản pháp lý là của Owner.
- **Thanh toán:** chưa thấy ngoại lệ hiện hành nào của Google Play cho lớp trực tuyến một-nhiều. Ngoại lệ thời COVID năm 2020 chỉ tạm thời. Mua trong app Android nhiều khả năng phải qua Play Billing ⚑. Gói vào giai đoạn F, cùng bảng quyền.

## 9. Lát triển khai đề xuất (sau bước 6 của hàng việc, hoặc song song với giai đoạn F)
| Lát | Nội dung | Mức | Điều kiện |
|---|---|---|---|
| LC0 | Trang khóa trực tuyến (giới thiệu, giảng viên, lịch dự kiến), chưa mua được; "Lớp của tôi" đọc lịch thật; Owner ghi danh tay để thử | R2–R3 (migration) | Triển khai `teacher-collaboration` hoặc hàm mới; một đợt thử miễn phí |
| LC1 | Lịch, link phòng họp chỉ cho người ghi danh, hộp thư trong app, email giao dịch + `.ics`, nhắc theo đồng ý | R3 | Owner duyệt chữ email; chọn đường gửi email |
| LC2 | Nhận xét sau buổi (dùng bảng có sẵn) gắn với buổi họp | R2 | Sau LC0 |
| LC3 | Bản ghi: ghi hình đám mây Zoom/Meet → nơi lưu có bảo vệ → gắn vào buổi; đồng ý ghi hình; thời hạn giữ | R3 | Đã chọn nơi lưu video (F1); Owner duyệt chữ đồng ý |
| LC4 | Mốc thời gian và ảnh cắt trong nhận xét | R2 | Sau LC3 |
| LC5 | (Tùy chọn) extension Chrome dự phòng | R3 | Chỉ khi có giảng viên thật cần |
| LC6 | Bán khóa trực tuyến qua Play Billing/web | R3 | Giai đoạn F (sau Closed testing, có pháp nhân bán) |

## 10. Owner cần quyết
1. Xác nhận đổi quyết định 21/11: khóa trả phí **có** lớp trực tiếp.
2. Ghi hình bằng tính năng đám mây của Zoom/Meet và lưu ở nơi lưu có bảo vệ (đề xuất), hay vẫn muốn YouTube? Nếu YouTube, chỉ cho bản không có học viên.
3. Nền tảng họp chính: Zoom, Meet hay cả hai? Owner có gói Zoom trả phí hoặc Workspace có ghi hình không?
4. Thời gian giữ bản ghi, và học viên có được tắt camera, được từ chối ghi hình không.
5. Sĩ số tối đa mỗi đợt; chính sách khi học viên vắng hoặc buổi bị hủy (học bù, hoàn tiền một phần).
6. Có làm LC0 (thử với một đợt miễn phí, Owner ghi danh tay) trước giai đoạn F không.

## Nguồn đã đọc (thứ cấp, cần kiểm lại)
- YouTube Data API `videos.insert`: video tải lên từ dự án chưa kiểm định (tạo sau 28/7/2020) bị giới hạn ở chế độ riêng tư.
- Google Meet REST API `conferenceRecords.recordings`: tệp MP4 trong Drive, trạng thái `FILE_GENERATED`.
- Zoom developer blog và diễn đàn về webhook `recording.completed`.
- Chrome extensions: "Audio recording and screen capture" (`tabCapture`, offscreen document, Chrome 116+).
- Google Play Payments policy; blog Android 2020 về ngoại lệ tạm thời cho lớp trực tuyến.
- Luật Bảo vệ dữ liệu cá nhân 91/2025/QH15 (thuvienphapluat.vn, hatinh.gov.vn).
