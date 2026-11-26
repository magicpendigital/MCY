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

## 11. Owner trả lời ngày 25/11 và phương án điều chỉnh

| # | Owner quyết | Hệ quả |
|---|---|---|
| 1 | Khóa trả phí **có** lớp trực tiếp: PT 1-1 và lớp online nhóm | Thay mặc định 21/11 "khóa trả phí chưa gồm lớp trực tiếp". Mô hình dữ liệu thêm `kind` cho đợt học: `pt_1_1` (sĩ số 1) hoặc `group`. |
| 2 | Muốn dùng YouTube nếu được, để tiết kiệm chi phí lưu trữ giai đoạn đầu | Xem phương án Y bên dưới. Quy tắc "video trả phí không đặt ở YouTube unlisted" **chưa đổi**: cần Owner chấp nhận rủi ro ở điểm Y-a. |
| 3 | Dùng cả Zoom và Meet tùy buổi; **chưa có gói ghi hình**, đang dùng phần mềm ghi bên thứ ba | Ghi hình đám mây không dùng được lúc này. Extension Chrome trở thành **phương án chính**, không còn là dự phòng. |
| 4 | Học viên được từ chối ghi hình; video trả phí không công khai trên app, chỉ người đã mua xem theo tài khoản | Cần đồng ý ghi hình riêng cho từng học viên; ai từ chối thì tắt camera và ẩn tên trong buổi, hoặc buổi đó chỉ ghi phần giảng viên. Quyền xem kiểm ở server theo tài khoản đã ghi danh. |
| 5 | (chưa trả lời) sĩ số, vắng/hủy buổi | Còn mở. Với PT 1-1, cần quy định dời buổi. |
| 6 | Có thử đợt đầu (LC0). Học viên Việt Nam chuyển khoản vào tài khoản giảng viên; quốc tế để sau | Thanh toán nằm **ngoài app**; Owner hoặc giảng viên xác nhận đã nhận tiền rồi ghi danh tay trong workspace. |

### Phương án Y: ghi bằng extension, lưu trên YouTube

- **Ghi:** extension Chrome (Manifest V3) ghi tab Zoom web hoặc Meet bằng `tabCapture` + tài liệu offscreen, kèm tiếng micro của giảng viên; lưu tệp WebM/MP4 trên máy giảng viên. Bắt đầu ghi cần một lần bấm của giảng viên (Chrome bắt buộc). Có báo "đang ghi" trong buổi. ⚑
  - Giới hạn: không ghi được app Zoom cài trên máy (chỉ Zoom chạy trong trình duyệt); đóng tab hoặc máy ngủ là dừng ghi; nên ghi thành từng đoạn để mất ít nếu lỗi.
- **Đưa lên YouTube, giai đoạn đầu:** giảng viên tải tệp lên YouTube Studio bằng tay, chọn **Không công khai (unlisted)**, rồi dán link vào buổi học trong workspace MCY. Không cần API, không cần kiểm định của YouTube.
  - Tải tự động qua API: dự án API chưa qua kiểm định của YouTube chỉ tải được video **riêng tư** và không đổi được chế độ cho tới khi qua kiểm định ⚑. Để sau, khi có nhiều buổi.
  - Chế độ **riêng tư** chia sẻ theo từng tài khoản Google không dùng được trong app (học viên phải đăng nhập Google trong khung nhúng; giới hạn số người được chia sẻ ⚑).
- **Y-a. Rủi ro Owner phải chấp nhận nếu chọn YouTube:** link unlisted ai có cũng xem được, kể cả người chưa mua, nếu học viên chép link ra ngoài. App chỉ cho người đã mua mở trang xem lại và không hiện link thô, nhưng **không chặn được** việc chia sẻ link. Video có hình học viên làm rủi ro nặng hơn: nên ưu tiên khung hình chỉ có giảng viên.
- **Nhận xét có mốc thời gian:** dùng được với YouTube. Trong workspace, giảng viên xem video nhúng; nút "Gắn mốc" lấy thời điểm đang phát (IFrame API cho phép). Học viên chạm chip `12:34` để nhảy tới đúng đoạn.
- **Ảnh cắt:** không lấy được từ khung YouTube. Extension giữ tệp gốc trên máy giảng viên nên có thể cắt ảnh từ tệp đó, hoặc giảng viên chụp màn hình; ảnh nhỏ tải lên Storage riêng tư của MCY, chỉ học viên của buổi xem được.
- **Khi doanh thu đủ:** chuyển video sang nơi lưu có bảo vệ (lựa chọn F1) mà không đổi luồng của học viên; dữ liệu buổi học chỉ lưu "nguồn video" nên đổi nguồn không phá mốc thời gian.

### Thanh toán đợt thử (chuyển khoản) ⚑
- App (nhất là bản Android trên Play) **không hiện giá, số tài khoản hay hướng dẫn chuyển khoản** cho khóa này; Google Play yêu cầu nội dung số bán trong app dùng Play Billing. Hướng dẫn chuyển khoản đi qua kênh ngoài app (email, Zalo, trang web riêng). Cần kiểm lại chính sách Play cho dịch vụ 1-1 trực tiếp. ⚑
- Nhận tiền qua tài khoản cá nhân của giảng viên: hóa đơn, thuế và hoàn tiền là trách nhiệm Owner/giảng viên; agent không điền pháp nhân hay giá.
- Ghi danh sau chuyển khoản là thao tác có kiểm toán trong workspace (ai xác nhận, lúc nào), không phải học viên tự mở quyền.

### Lát triển khai điều chỉnh
| Lát | Nội dung |
|---|---|
| LC0 | Trang khóa trực tuyến (PT 1-1, nhóm); Lớp của tôi đọc lịch thật; Owner ghi danh tay sau chuyển khoản; một đợt thử |
| LC1 | Lịch, link phòng họp chỉ người ghi danh thấy, hộp thư trong app, email + tệp .ics, nhắc theo đồng ý |
| LC2 | Nhận xét sau buổi gắn với buổi họp; đồng ý ghi hình từng học viên |
| LC3 | Extension Chrome ghi tab (bản thử với một giảng viên), tệp trên máy giảng viên |
| LC4 | Gắn link YouTube unlisted vào buổi (chỉ khi Owner chấp nhận Y-a); trang xem lại chỉ cho người đã ghi danh |
| LC5 | Mốc thời gian và ảnh cắt trong nhận xét |
| LC6 | Tải lên tự động qua API (sau kiểm định YouTube) hoặc chuyển sang nơi lưu có bảo vệ |

Thứ tự trong hàng việc chung: các lát này cần migration và Edge Function (R3), nên xếp sau bước 6 (vai người duyệt), trừ khi Owner muốn chen LC0 lên trước.

## 12. Owner trả lời ngày 26/11, đề xuất vắng/hủy và thứ tự LC0

Owner viết 26/11: "Chấp nhận rủi ro link YouTube không công khai bị chia sẻ. Sĩ số không cố định (theo tình hình học viên đăng ký thực tế), chính sách vắng / hủy hãy đề xuất giúp tôi, học viên vắng có thể xem lại buổi học trực tuyến và vẫn cần làm bài tập sau buổi tập để giảng viên / trợ lý AI nhận xét. Hãy phân tích, đánh giá và đề xuất quyết định hợp lý cho việc làm lớp trực tuyến thử trước hay sau bước 6."

| # | Quyết định | Hệ quả |
|---|---|---|
| Y-a | **Chấp nhận** rủi ro link unlisted bị chia sẻ | LC4 được làm. Bản ghi của lớp trả phí được đặt ở YouTube không công khai. App không hiện link thô; trang xem lại chỉ mở cho tài khoản đã ghi danh. Khung hình ưu tiên chỉ có giảng viên. Học viên từ chối ghi hình thì không xuất hiện trong bản ghi. |
| Sĩ số | **Không cố định**, theo số đăng ký thực tế | Không có trường sĩ số tối đa bắt buộc. Giảng viên có thể đặt một con số "tối đa" tùy chọn cho từng đợt; để trống thì không giới hạn. PT 1-1 luôn có 1 học viên. |
| Vắng | Học viên vắng **xem lại bản ghi** và **vẫn làm bài tập sau buổi** để giảng viên hoặc trợ lý AI nhận xét | Thêm "bài tập sau buổi" vào LC2: học viên nộp bài, giảng viên nhận xét. Nhận xét bằng AI chỉ bật sau các cổng AI hiện có (tài khoản trả phí, đồng ý AI, hạn mức do Owner duyệt) và cần kế hoạch R3 riêng. AI gợi ý, giảng viên xem trước khi gửi. |

### Chính sách vắng/hủy đề xuất (chờ Owner chốt các con số)
Các con số dưới đây là đề xuất của agent. Owner sửa hoặc đồng ý; agent không tự đặt giá hay mức hoàn tiền mới.

**Lớp nhóm online**
1. Học viên vắng: không hoàn tiền, không có buổi bù. Học viên xem lại bản ghi trong thời hạn khóa và nộp bài tập trong **7 ngày** sau buổi để được nhận xét như người có mặt.
2. Buổi không có bản ghi (lỗi ghi, hoặc cả lớp từ chối ghi hình): giảng viên gửi tóm tắt buổi và bài tập; nếu có đợt khác cùng nội dung thì học viên vắng được vào học buổi đó.
3. Học viên báo vắng trước **2 giờ** (không bắt buộc) để giảng viên biết; không mất quyền gì.
4. Giảng viên hủy hoặc dời buổi: báo trước **24 giờ** qua email và hộp thư trong app; buổi được dời sang ngày khác. Hủy sát giờ hoặc giảng viên không tới: buổi bù cho cả lớp. Từ lần thứ hai trong cùng một khóa, học viên được hoàn tiền phần buổi đó theo chính sách hoàn tiền chung.
5. Đợt mở mà quá ít người đăng ký: giảng viên có thể gộp sang đợt sau; học viên chọn chuyển đợt hoặc hoàn tiền đầy đủ.

**PT 1-1**
1. Dời lịch miễn phí nếu báo trước **24 giờ**.
2. Báo dưới 24 giờ hoặc không tới: buổi tính là đã dùng. Mỗi gói có **1 lần** ngoại lệ vì ốm hoặc việc gấp.
3. Học viên tới muộn: buổi vẫn kết thúc đúng giờ đã hẹn.
4. Giảng viên dời hoặc hủy: dời miễn phí. Giảng viên không tới: học viên được thêm một buổi.
5. Gói buổi có hạn dùng (đề xuất: số buổi × **1 tuần**, ví dụ 8 buổi dùng trong 8 tuần). Hết hạn thì buổi còn lại hết hiệu lực, trừ khi Owner gia hạn.
6. Buổi 1-1 **mặc định không ghi hình**. Chỉ ghi khi học viên yêu cầu và đồng ý; bản ghi chỉ học viên đó xem.

**Chung:** hoàn tiền theo quy định 21/11 (7 ngày, 30%, 48 giờ, phản hồi trong 2 ngày làm việc). Mọi lần dời, hủy hay ghi danh được ghi lại: ai làm, lúc nào. Chữ chính sách đưa học viên đọc trước khi chuyển khoản; đây là chữ để Owner duyệt, không phải tư vấn pháp lý.

### LC0 trước hay sau bước 6: phân tích

**Hai việc không phụ thuộc nhau.**
- Bước 6 (vai người duyệt chuyên môn: mời hoặc gán người khác) chỉ cần khi có người duyệt thứ hai. Hiện Owner đã là người duyệt (quyết định 21/11).
- LC0 cần ghi danh có kiểm toán do Owner làm và trang "Lớp của tôi" đọc lịch thật. Cả hai dùng vai Owner và giảng viên đã có.
- Cả hai đều cần migration (R3). Quy tắc "một migration mỗi thay đổi" bắt chúng đi lần lượt, nhưng thứ tự là tự chọn.

**Những thứ LC0 thực sự cần trước:**
1. **Bảng quyền dùng (F0) là nguồn sự thật duy nhất** (quyết định 21/11). Ghi danh lớp phải là một dòng quyền dùng, không làm bảng riêng, để sau này mua khóa trên Play không phải gộp hai hệ thống. Nghĩa là phần dữ liệu của F0 (trường `access`, hàm `hasEntitlement`, bảng quyền dùng) phải làm cùng hoặc trước LC0. Trong hàng việc, F0 hiện ở bước 7.
2. **Bước 4 và 5** dọn màn đồng ý, màn Cá nhân và workspace nhân sự. LC0 thêm màn ghi danh vào workspace, nên làm sau bước 5 thì tránh sửa cùng tệp hai lần.
3. **Chính sách Play** ⚑. App Android không được hiện giá hay hướng dẫn chuyển khoản. Đề xuất: LC0 chỉ bật trên web (Vercel Preview). Bản Android không hiện trang khóa trực tuyến cho tới khi kiểm xong chính sách.

**Thứ có thể làm ngay, không cần mã:** chạy một **đợt thử ngoài app**.
- Ghi danh qua Zalo hoặc email.
- Học trên Zoom hoặc Meet; ghi bằng phần mềm Owner đang dùng.
- Gửi link YouTube không công khai trực tiếp cho học viên.
- Nhận bài tập qua email.

Đợt này cho câu trả lời thật về nhu cầu, giờ học, số người vắng, ai từ chối ghi hình, mà không phải chờ hay tạo rủi ro cho app. Dữ liệu học viên ở ngoài app (Zalo/email) là trách nhiệm của Owner và giảng viên; không chép vào staging.

**Đề xuất quyết định:**
- (a) Chạy đợt thử ngoài app ngay khi Owner sẵn sàng.
- (b) Trong app, đưa **LC0 lên trước bước 6**: thứ tự mới 3 → 4 → 5 → **F0 + LC0** → 6 → F1–F4.
  - Bước 6 lùi lại vì chưa có người duyệt thứ hai để mời.
  - LC0 làm chung với F0 để chỉ có một bảng quyền dùng.
- (c) LC0 chỉ chạy trên web cho tới khi kiểm xong chính sách Play.
- (d) Những gì học được ở đợt thử ngoài app (giờ học, tỉ lệ vắng, mẫu bài tập) đưa vào kế hoạch LC0 trước khi viết mã.

Điều kiện để giữ thứ tự cũ (bước 6 trước): Owner đã có tên người duyệt thứ hai cần mời ngay. Hoặc phần trả phí (F) phải chờ Closed testing như quyết định 18/11, và Owner muốn LC0 theo cùng mốc đó.

Rủi ro của đề xuất:
- Theo quyết định 18/11, phần trả phí bắt đầu sau Closed testing. Làm F0 sớm (chỉ phần dữ liệu, chưa bán gì) không trái ý đó, nhưng Owner cần xác nhận.
- LC0 trên web vẫn là thu tiền ngoài app cho nội dung trong app. Kiểm lại với chính sách Play trước khi mở trên Android.
