# Luồng tạo nội dung bài giảng và các loại khóa học trên MCY: rà soát và use case (27/11/2026)

Nguồn: Owner 27/11, sau khi giảng viên thử (GV1) đăng nhập được trang giảng viên trên staging: "ở phần soạn bài giảng, hiện chưa có mục cho phép nhập link youtube bài giảng hoặc upload nội dung bài giảng, hãy rà soát và kiểm tra lại luồng tạo nội dung bài giảng và phân tích các use case cần có để đáp ứng nhu cầu cho các loại khóa học trên MCY".

Đây là **phân tích, chưa phải lệnh làm mã**. Mỗi lát dưới đây cần kế hoạch riêng theo `plans/_TEMPLATE.md` và Owner duyệt. Tài liệu không ghi email hay tên thật của giảng viên.

## 1. Hiện trạng (đọc mã ngày 27/11, commit `56e95fc`)

Trang giảng viên (`staff.html`, `src/staff/teacher.tsx`) có ba thẻ. Thẻ mở sẵn là thẻ ít dùng được nhất.

| Thẻ | Lưu ở đâu | Có link YouTube? | Đi tới học viên? |
|---|---|---|---|
| **Soạn bài** (mở sẵn) | Bản nháp riêng của `teacher-control-plane` (`mcy_teacher_save_own_draft`): tiêu đề, tóm tắt, mục tiêu, mức độ, cường độ, nhịp, đạo cụ, tư thế, thời lượng ≤ 60 phút, tối đa 40 đoạn có mốc giờ (tên động tác, lời dẫn, câu dừng, nhịp thở) | **Không** | **Không**: không có nút gửi duyệt, không có đường xuất bản |
| **Bài video của tôi** | Kho nội dung có phiên bản (`owner-control-plane`, `save_content` / `submit_content`, kind `video_lesson`) | **Có**: ô "Mã YouTube", kèm tóm tắt, thời lượng, khung dọc/ngang, vùng cơ thể | **Có**: Owner duyệt → bật hiển thị → snapshot `content-published/manifest.json` |
| **Duyệt nội dung được giao** | Chỉ khi Owner giao duyệt một phiên bản | — | — |

Kết luận: **giảng viên đã nhập được link YouTube ngay hôm nay**, ở thẻ "Bài video của tôi". Ô hiện chỉ nhận **mã 11 ký tự** (phần sau `v=` hoặc sau `youtu.be/`), chưa nhận cả link. Lỗi nằm ở cách sắp xếp: thẻ mở sẵn là một kho nháp cũ (viết 2/10, trước kho nội dung) không có video và không xuất bản được, nên người mới vào sẽ nghĩ là không có chỗ nhập video.

Các phần khác đã có trong mã:
- Kho nội dung có 4 loại: `video_lesson`, `course_group` (nhóm bài thành khóa, kèm lợi ích/thận trọng đã duyệt), `reading_unit` (bài đọc, hiện chỉ nhập từ thư viện đã duyệt, không soạn mới), `screen_text` (văn bản màn hình trong danh sách cho phép). Giảng viên chỉ có giao diện cho `video_lesson`. Owner soạn được cả `course_group` và `screen_text` trong Content Hub.
- Phiên bản không sửa được; Owner duyệt bằng lời cam kết gõ tay; hiển thị `private` / `unlisted` / `public`; tên giảng viên hiện theo chính sách hiển thị.
- **Chưa có:** tải tệp (video, ảnh, PDF) lên MCY; bài có hình; quyền dùng trả phí; lớp trực tuyến có lịch; ghi danh; nộp bài tập; nhận xét của giảng viên trên staging (bản cộng tác `teacher-collaboration` có mã và test nhưng chưa áp, chưa deploy); AI nhận xét (`mcy-ai-assistant` chưa deploy, AI đang tắt).

## 2. Các loại nội dung và khóa học: use case

Ký hiệu: ✅ có và chạy trên staging · ◐ có một phần · ✗ chưa có. "Giai đoạn" theo kế hoạch pilot giảng viên (N, P0, P1 = F0 + LC0, P2) và giai đoạn trả phí F (paid-tier §9).

### A. Bài giảng (đơn vị nhỏ nhất)
| # | Use case | Ai làm | Hiện trạng | Còn thiếu | Giai đoạn |
|---|---|---|---|---|---|
| A1 | **Bài video miễn phí** (YouTube của chính GV) | GV soạn → Owner duyệt → bật hiển thị | ✅ ở thẻ "Bài video của tôi" | Thẻ mở sẵn sai chỗ; chưa xem thử video ngay trong ô soạn; chưa lấy tự động thời lượng và ảnh bìa | P0 (sửa giao diện: lát S0) |
| A2 | **Bài video có kịch bản** (đoạn có mốc giờ, lời dẫn, câu dừng) | GV | ◐ kịch bản nằm ở kho "Soạn bài", tách khỏi video | Gắn kịch bản vào phiên bản bài video để học viên thấy chương/mốc và câu dừng an toàn | Lát S2 |
| A3 | **Bài có hình** (bài đọc minh họa từng tư thế, ảnh + chữ) | GV soạn, Owner duyệt | ✗ (bài đọc chỉ nhập từ thư viện đã duyệt; không có tải ảnh) | Kind mới hoặc mở rộng `reading_unit` cho GV; bucket ảnh riêng tư có duyệt; quyền dùng ảnh và người trong ảnh; nhãn ảnh AI (chính sách `ai_image_label` đã có) | Lát S3 (R3) |
| A4 | **Bài video thu phí** | Owner/GV đặt vào khóa trả phí | ✗ | Bảng quyền dùng F0; trang xem kiểm quyền ở server; nơi lưu video có bảo vệ (F1) hoặc YouTube unlisted (Owner đã chấp nhận rủi ro Y-a cho bản ghi lớp, chưa cho bài quay sẵn). Theo paid-tier §6 chỉ bán **thuê bao** và **mua lẻ khóa**, không bán lẻ từng bài | F (sau Closed testing) |
| A5 | **Xem thử một bài của khóa trả phí** | Owner đánh dấu | ✗ | Cờ "bài xem thử" trên bài trong khóa | F |

### B. Khóa học (nhóm bài, lịch hoặc người dạy)
| # | Use case | Ai làm | Hiện trạng | Còn thiếu | Giai đoạn |
|---|---|---|---|---|---|
| B1 | **Khóa miễn phí quay sẵn** (chuỗi bài video) | Owner tạo nhóm; GV đề xuất | ◐ Owner tạo `course_group` từ bài đã duyệt; 38 clip miễn phí đang chạy | GV chưa có ô tạo nhóm từ bài của chính mình; thứ tự bài, "bài tiếp theo", tiến độ của học viên trên tài khoản | Lát S1 |
| B2 | **Khóa quay sẵn thu phí** | Owner tự quay (quyết định 18/11) | ✗ | F0 (quyền dùng) + F1 (video có bảo vệ) + thanh toán (Play Billing trên Android) + chính sách hoàn tiền đã chốt số | F |
| B3 | **Khóa online trực tuyến theo nhóm** (Meet/Zoom, có lịch) | GV dạy, Owner ghi danh tay sau chuyển khoản | ✗ trong app; **đợt N đang chạy ngoài app** (2 lớp Google Meet) | Trang lớp, đợt học, buổi có giờ, link phòng chỉ người ghi danh thấy, ghi danh = dòng quyền F0 | P1 (LC0) → LC1 |
| B4 | **PT 1:1 trực tiếp** | GV + 1 học viên | ✗ | Như B3 với `kind = pt_1_1` (sĩ số 1); quy định dời buổi 1:1 (live-class §12 còn chờ chốt) | P1 (LC0) |
| B5 | **Xem lại buổi học** (học viên vắng hoặc ôn) | GV dán link YouTube unlisted | ✗ | Trang xem lại chỉ cho tài khoản ghi danh; đồng ý ghi hình từng học viên | LC2 + LC4 |
| B6 | **Khóa kết hợp** (bài quay sẵn + buổi trực tiếp + bài tập) | Owner | ✗ | Khóa chứa cả `course_group` và đợt học; một dòng quyền mở cả hai | Sau P2 |

### C. Thực hành, nhận xét và cảm nhận
| # | Use case | Ai làm | Hiện trạng | Còn thiếu | Giai đoạn |
|---|---|---|---|---|---|
| C1 | **Học viên tự ghi cảm nhận sau buổi tập** (tốt hơn / không đổi / tệ hơn / không chắc / bỏ qua) | Học viên | ✅ Hành trình + phản hồi sau bài | Gắn cảm nhận với bài/khóa của GV (chỉ khi học viên đồng ý `teacher_sharing`) | P2 |
| C2 | **Nộp bài tập sau buổi** (chữ trước; ảnh/video sau) | Học viên ghi danh | ✗ (bản cộng tác có nhận xét, chưa có nộp bài) | Bảng bài tập + bài nộp ở `private`; hạn 7 ngày (đề xuất, chờ chốt); bucket riêng cho ảnh/video (R3) | P2 |
| C3 | **Giảng viên nhận xét riêng từng học viên** (có mốc giờ trên video) | GV | ◐ mã cộng tác có bản sửa + nút gửi riêng + nhật ký, chưa áp | Áp/viết lại theo F0; `teacher_sharing` bắt buộc ở server; chip `12:34` nhảy tới đoạn video | P2 (LC2, LC5) |
| C4 | **Học viên xem nhận xét của mình** | Học viên | ◐ màn "Lớp của tôi" chỉ đọc, chưa có dữ liệu thật | Hộp thư trong app + email theo đồng ý | P2 / LC1 |
| C5 | **Trợ lý AI gợi ý nhận xét**, GV đọc và sửa trước khi gửi | GV (AI chỉ gợi ý) | ✗ | Cổng AI: tài khoản trả phí, đồng ý `ai_processing`, hạn mức Owner duyệt, duyệt chuyên môn; nhãn "AI hỗ trợ · giáo viên đã xác nhận" | P2-AI, kế hoạch R3 riêng |
| C6 | **AI nhận xét trực tiếp cho học viên** (không qua GV) | — | ✗ | Khuyên **không làm** trong pilot: rủi ro nghe như chẩn đoán; AI chỉ gợi ý, không duyệt, không thay giảng viên | Không đề xuất |
| C7 | **Học viên đánh giá công khai bài/khóa** (sao, bình luận) | Học viên | ✗ | Cần kiểm duyệt, quy tắc không có tuyên bố chữa bệnh; chưa có trong định hướng nào | Để sau, cần Owner quyết |

## 3. Nguyên tắc giữ nguyên khi mở rộng
- Video bài giảng chỉ là **YouTube của chính giảng viên** (quyết định 7, 26/11); MCY không tải xuống, không sao chép video. Tải video lên MCY chỉ xét ở F1 cho nội dung trả phí.
- Mọi phiên bản bất biến; Owner duyệt và ghi căn cứ quyền; AI gợi ý, không duyệt.
- Giảng viên không thấy dữ liệu học viên nếu học viên chưa ghi danh **và** chưa đồng ý `teacher_sharing`.
- Không hiện giá, số tài khoản hay hướng dẫn chuyển khoản trong app Android (chính sách Play); thanh toán đợt thử nằm ngoài app.
- Không trình bày cảm nhận hay nhận xét như kết quả điều trị.

## 4. Lát đề xuất (nhỏ trước)
| Lát | Nội dung | Vùng / mức | Phụ thuộc |
|---|---|---|---|
| **S0** | Thẻ mở sẵn = "Bài video của tôi"; đổi tên thẻ "Soạn bài" thành "Kịch bản nháp (chưa xuất bản)" kèm một câu giải thích; ô "Mã YouTube" nhận cả link dán vào và tự tách mã; khung xem thử video trước khi lưu; hướng dẫn 3 bước "dán link → điền tóm tắt → gửi Owner duyệt". Thêm: trạng thái lạ từ máy chủ ở ô mời → "đã ghi nhận, hãy tải lại trang" (lỗi thẻ cũ ngày 27/11) | `src/staff/` · R1, không migration | Không. Làm được ngay khi Owner đồng ý |
| **S1** | GV tạo "khóa miễn phí" (`course_group`) từ bài đã duyệt của chính mình; Owner duyệt như bài | `src/staff/` + kiểm quyền ở Edge/SQL · R2–R3 | S0 |
| **S2** | Gắn kịch bản (đoạn có mốc giờ, câu dừng) vào phiên bản bài video; bỏ hoặc chuyển kho "Soạn bài" cũ | migration + Edge · R3 | S0; Owner chọn ở §5 Q2 |
| **S3** | Bài có hình: bucket ảnh riêng tư, GV tải ảnh, Owner duyệt, snapshot công khai | migration + Storage + Edge · R3 | Owner chọn ở §5 Q3 |
| **P1** | F0 + LC0: trang lớp nhóm và PT 1:1, Owner ghi danh tay sau chuyển khoản, ghi danh = dòng quyền | R3, kế hoạch riêng | Quyết định 8 của pilot |
| **P2** | Bài tập, nhận xét riêng, xem lại bản ghi, gắn cảm nhận học viên | R3, kế hoạch riêng | P1; quyết định 10–11 của pilot |
| **P2-AI** | AI gợi ý nhận xét cho GV | R3, kế hoạch riêng | Cổng AI; quyết định 12 |
| **F** | Bài/khóa thu phí, video có bảo vệ, thanh toán | R3 | Sau Closed testing (quyết định 18/11) |

## 5. Owner cần quyết (đã trả lời 27/11, xem cuối tệp)
1. **Làm S0 ngay?** Khuyên: **có**. Chỉ sửa giao diện trang giảng viên, không đụng dữ liệu, giải quyết đúng điều GV1 gặp.
2. **Kho "Soạn bài" cũ:** (a) giữ làm kịch bản nháp rồi gắn vào bài video ở S2, (b) ẩn đi tới khi có S2, hay (c) xóa hẳn. Khuyên: **(a)**, vì kịch bản có câu dừng và nhịp thở là giá trị riêng của MCY; trong lúc chờ S2, S0 ghi rõ "chưa xuất bản".
3. **"Bài giảng có hình" nghĩa là gì?** (a) bài đọc ảnh + chữ từng tư thế, (b) ảnh bìa riêng cho bài video, (c) cả hai. Ảnh do ai cung cấp, có người thật trong ảnh không, có dùng ảnh AI không. Khuyên: bắt đầu bằng (b) ảnh bìa (rẻ, ít rủi ro), (a) để sau S2.
4. **GV có được tự tạo khóa miễn phí (S1) không**, hay chỉ Owner nhóm bài thành khóa? Khuyên: GV đề xuất, Owner duyệt như bài.
5. **Bán theo bài hay theo khóa?** Paid-tier 18/11 chọn thuê bao + mua lẻ khóa. Khuyên: **giữ, không bán lẻ từng bài**; "bài video thu phí" = bài nằm trong khóa trả phí hoặc gói.
6. **Thứ tự:** S0 → (S1, S2) → P1 → P2 → F, với P1/P2 theo quyết định 8 của kế hoạch pilot (còn chờ). Khuyên: đồng ý.
7. **Đánh giá công khai của học viên (C7):** khuyên **chưa làm**; dùng cảm nhận riêng tư (C1) trước.

## Quyết định của Owner (27/11)
| # | Quyết định | Hệ quả |
|---|---|---|
| 1 | Làm S0 ngay: **đồng ý** | Xong ở máy, commit `a90e3a2` ([kế hoạch](../active/2026-11-27-teacher-authoring-s0.md)); chờ Owner cho push. |
| 2 | Kho "Soạn bài" cũ: **(a)** giữ làm kịch bản nháp, sau gắn vào bài video | S2 gắn kịch bản (đoạn có mốc giờ, lời dẫn, câu dừng, nhịp thở) vào phiên bản bài video; không xóa kho cũ. |
| 3 | "Bài giảng có hình": **(c)**, tức là bài giảng có hình ảnh minh họa bên trong | S3 gồm cả ảnh minh họa trong nội dung bài (ảnh + chữ theo từng tư thế/đoạn) và ảnh bìa. Cần bucket ảnh riêng tư, Owner duyệt từng ảnh trong phiên bản, quyền dùng ảnh và người trong ảnh, nhãn ảnh AI. Kế hoạch R3 riêng. |
| 4 | GV tự tạo khóa miễn phí: **có**, GV đề xuất, Owner duyệt như bài | S1. |
| 5 | **Bán theo khóa**, không bán lẻ từng bài | "Bài video thu phí" (A4) = bài nằm trong khóa trả phí hoặc gói; không có giá cho từng bài. Giữ mô hình 18/11 (thuê bao + mua lẻ khóa). |
| 6 | Thứ tự S0 → S1/S2 → P1 → P2 → F: **đồng ý** | P1/P2 vẫn theo kế hoạch pilot (quyết định 8 của pilot). Vị trí của S3 chưa xếp; agent đề xuất làm sau S1/S2, trước P1, nếu Owner muốn có bài minh họa sớm. |
| 7 | Đánh giá công khai của học viên (C7): **chưa làm** | Dùng cảm nhận riêng tư (C1) trước. |

## Chưa kiểm
- Chưa mở trang giảng viên trên staging bằng tài khoản GV1 để chụp lại (agent không giữ phiên GV1); hiện trạng §1 dựa trên đọc mã và lời Owner.
- Chưa kiểm lại chính sách Play cho dịch vụ 1:1 trả ngoài app (⚑ trong live-class §11).
