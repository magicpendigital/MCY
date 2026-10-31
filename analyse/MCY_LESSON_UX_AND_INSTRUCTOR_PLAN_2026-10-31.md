# Bài giảng bằng hình, luồng video và không gian giảng viên — đánh giá và kế hoạch (31/10/2026)

Phạm vi: đọc nội dung `content/yoga-library` (14 bài đọc), mã học viên (`src/courses`, `src/library`, `src/Prototype.tsx`), hạ tầng giảng viên/phản hồi (`supabase/migrations/20261005004000_private_teacher_collaboration.sql`, `supabase/functions/teacher-collaboration`, `src/staff`), và chạy app web cục bộ ở khung 375×812 để xem trang bài video thật. **Không sửa mã ứng dụng, không deploy, không ghi cloud, không cài thiết bị.** Thiết kế lại nằm ở canvas Design (11 màn); mọi chỗ trong ngoặc vuông là dữ liệu thật chưa có (tên, giá, chứng chỉ), không điền giả.

Đây là **đề xuất, chưa phải quyết định**. Các điểm số bên dưới là đánh giá chuyên môn của người soạn báo cáo, không phải dữ liệu người dùng.

## 1. Kết luận ngắn

1. **Bài giảng bằng hình**: an toàn và trung thực rất tốt, nhưng đọc như tài liệu tuân thủ chứ chưa phải bài học. Người học không nhận được cách làm cụ thể (tay đặt đâu, thở lúc nào, lỗi thường gặp). 5/14 bài không có hình nào. Chưa có đường nào để học viên thấy chúng.
2. **Luồng video**: dùng được và trung thực, nhưng màn đầu bị poster 9:16 chiếm gần hết, mô tả giống hệt cho cả 38 bài, ghi chú pháp lý đứng trước tên bài, và không có người dạy nào được nhắc tên.
3. **Giảng viên**: ứng dụng học viên **không có chỗ nào** nói ai dạy. Phía backend có nền móng (hồ sơ, ghi danh, buổi học, nhận xét có phiên bản, nhãn nguồn), nhưng **học viên chưa có luồng nào**: không tìm hiểu cô, không đăng ký, không được mời, không nhận nhận xét.
4. **Điểm khác biệt của sản phẩm** (nhận xét sau buổi đặt cạnh tự check-in) hiện tồn tại trọn vẹn ở khâu tự check-in và hầu như chưa có ở khâu nhận xét.

## 2. Bài giảng bằng hình

### Điểm mạnh (giữ lại)
- Cấu trúc 5 bước có mục tiêu học, chuẩn bị, lựa chọn nhẹ hơn, điều kiện dừng; giọng "không cần đạt độ cong giống hình".
- Nhãn ảnh AI minh họa trung thực; alt text mô tả chi tiết (tốt cho TalkBack).
- Tách rõ "đọc" với "ghi nhận buổi tập": xem hết không tự tính là đã tập.

### Vấn đề, có bằng chứng

| # | Vấn đề | Bằng chứng | Mức |
|---|---|---|---|
| 1 | Câu "Dừng: Nếu thấy đau, tê…" lặp ở đầu bài và **trong cả 5 bước** (6 lần/bài) | `readable/foundation-cat-cow/r3.vi.md` | Cao |
| 2 | Dòng kỹ thuật lọt vào nội dung đọc: `Nguồn: source-1…; evidence: analyse/…json`, `Path: media/…`, "Media `…` · draft_present" | cùng tệp; mỗi bước | Cao |
| 3 | Ngôn ngữ nội bộ: "Ra: Chuyển sang khung đọc kế tiếp; không suy đường vào/ra từ một hình", "họ Rắn hổ mang" | `readable/cobra/r1.vi.md` | Cao |
| 4 | Bài Cobra không dạy: không nói tay đặt thế nào, nâng ra sao, hơi thở, lỗi thường gặp | 5 bước chỉ "nhận biết/đọc" | Cao |
| 5 | 5/14 bài **không có ảnh** (25 ô bị chặn `identity_blocked`): kneeling-backbend, low-crow, low-wheel, stand-up, wild-thing-high | `COVERAGE.vi.md` | Cao |
| 6 | Thời lượng thực hành "chưa xác định" nên người tập không biết giữ bao lâu hay mấy nhịp thở | mục "Thời gian đọc… Thời lượng thực hành: chưa xác định" | Trung bình |
| 7 | Toàn bộ là ảnh AI của **một** nhân vật hư cấu; người học yoga tin người thật dạy, và ảnh AI dễ sai giải phẫu | nhãn "photo_ai" mọi bước | Trung bình |
| 8 | Không có tương tác: không "đặt điện thoại", không "thử một nhịp", không liên kết sang video tương ứng | — | Trung bình |
| 9 | Học viên **không thể** thấy các bài này (không commit, không build, chưa xuất bản) | `MCY_ILLUSTRATED_CONTENT_AUDIT_2026-10-27.md` | Chặn |

Ghi chú: các lớp "Nguồn/evidence/Path/draft" là thông tin cần cho **người duyệt**, không phải cho học viên. Giữ nguyên ở màn Preview của Owner; ẩn khỏi bản học viên.

### Thiết kế lại (canvas A1–A3)
- **Một bước = một màn hình**: ảnh lớn trước, rồi ba dòng **Làm · Cảm nhận · Tránh** (mỗi dòng 1–2 câu). Có thanh tiến độ 5 đoạn.
- **Dấu hiệu dừng cố định 1 dòng** ở chân màn, thay cho 6 lần lặp; nội dung quy định vẫn nguyên.
- **"Dễ hơn cho hôm nay"** gập sẵn ở mỗi bước (giữ tinh thần lựa chọn của bản gốc nhưng không tốn chỗ).
- **Tổng quan** trả lời 3 câu: bài này làm gì cho tôi, mất bao lâu, ai soạn. Có nhãn "Ảnh AI minh họa · bản nháp" nhỏ nhưng luôn thấy.
- **Kết bài** dẫn sang tự đối chiếu, vẫn nói rõ "xem hết không tự ghi một buổi tập", và gợi ý nhẹ "Học cùng giảng viên".
- Viết lại nội dung 14 bài theo khuôn Làm · Cảm nhận · Tránh cần **người có chuyên môn** soạn hoặc duyệt; bản trong canvas chỉ là mẫu cho Bò–Mèo (lấy từ bước 2 đang có).

## 3. Luồng bài video

Quan sát trên app chạy cục bộ (khách, 375×812), màn "Làm quen với các tư thế yoga":

| # | Quan sát | Bằng chứng |
|---|---|---|
| 1 | Ô poster 9:16 (nền xanh chỉ có chữ, không có hình chuyển động) chiếm ~65% chiều cao màn đầu; nút Trước/Tiếp phải cuộn mới thấy | ảnh chụp, y 234→762 / 812 |
| 2 | Mô tả **giống hệt** cho cả 38 bài ("Video hướng dẫn yoga từ kênh… Bạn tự chọn biên độ…") | `src/courses/freeCourses.ts` `youtubeLesson()` |
| 3 | Ghi chú YouTube/quyền riêng tư và ghi chú phụ đề nằm **trước** tên bài và mô tả | ảnh chụp sau khi cuộn |
| 4 | Tên bài chung chung: "Chuỗi tư thế cơ bản · bài 32…38", "Chuyển động nhẹ · bài 17/18". Số bài không nhất quán: tiêu đề "BÀI HỌC 19" nhưng danh sách là "01" | `freeCourses.ts`, ảnh chụp |
| 5 | Không nói vùng cơ thể, mức độ, cần dụng cụ gì, sẽ làm gì | — |
| 6 | 38 clip dài 17–64 giây, **tổng ~23 phút** (18 bài 11 phút + 13 bài 9 phút + 7 bài 2 phút). Đây là clip minh họa chứ chưa phải buổi tập; không có chuỗi ghép để tập liền 5–15 phút | tính từ `freeCourses.ts` |
| 7 | Không có yêu thích, "đã xem", tiếp tục, tự phát bài kế | — |
| 8 | Không có tên người dạy | — |

Điểm tốt cần giữ: công cụ "Tìm nhanh" theo vùng và độ dài, nhắc check-in, khối trợ giúp tải lại/mở YouTube gốc, lời nhắc "MCY không biết bạn xem hết video".

### Thiết kế lại (canvas B1–B2)
- Video thu gọn (~60%), có **dòng giảng viên** (xem hồ sơ), tiêu đề, 4 thẻ (vùng · mức · thời lượng · cần gì), một đoạn "Bạn sẽ làm".
- **Thanh hành động cố định**: Trước · "Tôi đã tập · ghi cảm nhận" · Tiếp. Ghi chú quyền riêng tư gọn một dòng cuối màn.
- **Sau video**: chạm một lần chọn Nhẹ hơn / Như cũ / Khó chịu hơn / Chưa chắc, có thể bỏ qua; nếu học viên đang trong lớp, có công tắc "Gửi cho giảng viên" (chỉ buổi này, thu hồi được).
- Việc làm được ngay, không cần backend: thêm trường dữ liệu theo bài (vùng, mức, cần gì, "Bạn sẽ làm", tên bài riêng) trong `freeCourses.ts`; nội dung do Owner/giảng viên viết hoặc duyệt, không để AI tự điền.

## 4. Góc nhìn người học yoga: yếu tố quyết định có dùng hay không

Điểm 1–5 là đánh giá chuyên môn hiện trạng bản 1.0 (không phải khảo sát):

| Yếu tố người học cân nhắc | Hiện tại | Ghi chú |
|---|---|---|
| Tin người dạy (ai, bằng cấp, phong cách) | **1** | Không có tên/ảnh/giới thiệu ở đâu trong app |
| Biết hôm nay nên tập gì, bao lâu | 2 | Có tìm nhanh; AI/kế hoạch tắt theo quyết định 1.0; không có chương trình |
| Chất lượng hướng dẫn (hơi thở, nhịp, lỗi thường gặp) | 2 | Clip 17–64 giây, mô tả chung |
| An toàn cho người đau/chấn thương | **4** | Tín hiệu dừng, tách rõ không chẩn đoán |
| Thói quen và tiến bộ | 3 | Check-in và Hành trình có; chưa nhắc, chưa chuỗi/tuần |
| Được góp ý | **1** | Backend chưa triển khai, học viên chưa có luồng |
| Ít ma sát (không đăng ký, vào là xem) | **4** | Dùng thử khách |
| Đa dạng (mục tiêu, thời lượng, cấp độ) | 2 | 38 clip, 3 nhóm |

Người học yoga thường ở lại với app khi có **một người dạy họ tin** và **một lộ trình ngắn rõ ràng**, chứ không phải một thư viện clip. Đó là hai chỗ trống lớn nhất.

## 5. Trả lời hai câu hỏi của Owner

### 5.1 Không gian riêng cho giảng viên
**Hiện chưa có** phía học viên. Chỉ có workspace giáo viên (`/?workspace=teacher`, mời-only) để soạn bài. Bảng hồ sơ giảng viên có `display_name` và `bio` nhưng không hiển thị cho học viên.

Quy tắc đã có trong AGENTS.md: tên hiển thị lấy từ **hồ sơ đã kích hoạt**, không viết cứng; không gán nội dung cho giảng viên trước khi hồ sơ kích hoạt và có bằng chứng quyền. Vì vậy trang giảng viên cần: (1) hồ sơ do chính giảng viên viết và đồng ý công khai (tên, ảnh, giới thiệu), (2) chứng chỉ/kinh nghiệm chỉ hiện khi đã xác minh, (3) danh sách bài và lớp của cô. Canvas C1–C2.

### 5.2 Mời học viên, đăng ký học, nhận nhận xét hằng ngày — đã có luồng chưa?
**Chưa có luồng cho học viên.** Nền móng phía backend (cục bộ):

| Có (phía giảng viên/backend) | Chưa có |
|---|---|
| Bảng ghi danh (`enrollments`: học viên, giảng viên, phiên bản khóa, `active/revoked`), điểm danh theo buổi, nhận xét có phiên bản, bản ghi gửi có khóa chống trùng, audit | Không có màn nào trong app học viên gọi `teacher-collaboration` (chỉ `src/staff`) |
| Nhãn nguồn nhận xét: `human` hoặc `ai_assisted_teacher_confirmed` | Ghi danh do **admin** tạo (`admin_enrollment`); học viên không tự đăng ký |
| Giảng viên soạn/gửi nhận xét sau buổi hoặc sau khóa (`TeacherCollaborationPanel`) | `invite_request` là mời **giảng viên**, không có lời mời **học viên** |
| Ghi chú trong migration: "No publication action exists. Retrieval remains closed" | Công tắc chia sẻ với giáo viên hiện luôn tắt: "Chưa có lớp được kết nối" |

Hai điểm cần lưu ý khi thiết kế tiếp:
- Buổi điểm danh gắn với **phiên bản bài do giảng viên soạn trong hệ thống**, còn 38 video hiện là clip YouTube ngoài hệ thống. Cần quyết định "lớp" bao bọc video YouTube thế nào.
- Theo ghi nhận gần nhất trong AGENTS.md, migration collaboration **chưa áp lên staging**; cần kiểm lại trạng thái thật trước khi lên kế hoạch kỹ thuật.

**Chọn người nhận xét (người hoặc AI)**, canvas C3: giảng viên viết · Trợ lý AI (hiện "Chưa mở": chỉ mở khi có nội dung đã duyệt, đồng ý riêng và qua kiểm tra an toàn, đúng các cổng AI trong AGENTS.md) · chỉ tự đối chiếu. Giai đoạn đầu chỉ làm chế độ **người thật** và **AI soạn nháp, giảng viên xác nhận** (đã có mô hình dữ liệu). **AI trả lời trực tiếp** để sau.

**Mời vào lớp**, canvas C4: giảng viên tạo liên kết/mã; học viên mở, cần tài khoản, bấm Tham gia; lời mời **không** tự cấp quyền xem dữ liệu, học viên chọn chia sẻ ở bước sau, có thể thu hồi.

**Vòng nhận xét**, canvas B2 → D1 → D2: học viên ghi cảm nhận (chọn gửi) → giảng viên thấy cảm nhận và check-in được chia sẻ, soạn nhận xét có nhãn nguồn → học viên thấy nhận xét **đặt cạnh cảm nhận của chính mình**.

Lưu ý quy mô: nhận xét hằng ngày cho mỗi học viên là cam kết thời gian lớn của giảng viên. Cần quyết định hạn phản hồi, quy mô lớp, mẫu nhận xét và gói (khi nào tính phí; thanh toán hiện ngoài phạm vi).

## 6. Nhu cầu phổ biến chưa được đáp ứng

| # | Nhu cầu | Tại sao quan trọng | Hướng đề xuất | Ưu tiên |
|---|---|---|---|---|
| 1 | Biết ai dạy và tin được | Quyết định #1 với người học | Trang giảng viên (C1–C2) | P0 |
| 2 | Lộ trình có cấu trúc (7/14/28 ngày, "tuần đầu cho dân văn phòng") | 38 clip rời không tạo thói quen | Chương trình ngắn do giảng viên duyệt | P1 |
| 3 | Buổi tập liền mạch 5–15 phút | Clip 17–64 giây không đủ một buổi | Danh sách phát có tự chuyển bài + đồng hồ nghỉ | P1 |
| 4 | Nhắc nhở và thói quen, không áp lực | Giữ chân | Nhắc cục bộ trên native; tuần thay vì "chuỗi ngày" | P1 |
| 5 | Chọn theo mục tiêu/hoàn cảnh (ngồi văn phòng, đau lưng, ngủ, căng thẳng, mới tập, lớn tuổi) | Người học nghĩ theo vấn đề, không theo tên tư thế | Mở rộng bộ lọc; nhắc "hỏi người có chuyên môn" cho tình huống y tế | P1 |
| 6 | Hướng dẫn bằng **giọng nói** khi không nhìn màn hình | Chính bài đọc đã dặn tránh xoay cổ nhìn máy | Audio hướng dẫn (cần giọng/quyền được duyệt) | P2 |
| 7 | Phụ đề, bản tiếng Anh | Phụ đề 38 bài **chưa kiểm** | Kiểm phụ đề trước; dịch sau | P2 |
| 8 | Xem trên TV, offline | Nhiều người tập trước màn hình lớn; YouTube nhúng không offline | Gợi ý cast; offline cần quyết định quyền | P2 |
| 9 | Hỏi đáp, cộng đồng, lớp trực tiếp | Cam kết xã hội tăng giữ chân | Hỏi giảng viên trong lớp, lớp có lịch | P2 |
| 10 | Yêu thích, lịch sử, tiếp tục xem | Cơ bản của thư viện video | Lưu cục bộ trước, đồng bộ sau khi đồng ý | P1 |
| 11 | Liên kết giữa "đọc từng bước" và "xem video" | Hai kênh học bổ sung nhau | Nút chéo giữa bài đọc và video cùng tư thế | P2 |
| 12 | Trả phí hợp lý cho thời gian giảng viên | Bền vững | Quyết định mô hình gói; không thuộc 1.0 | Quyết định |
| 13 | Khả năng tiếp cận (TalkBack, cỡ chữ, giảm chuyển động) | Chưa có bằng chứng thiết bị thật | Kiểm bằng thiết bị thật | P1 |

## 7. Kế hoạch đề xuất

Mỗi giai đoạn tuân theo [mcy-release-sync](../skills/mcy-release-sync/SKILL.md): một HEAD cho mọi nền tảng, tăng `versionCode`, ghi sổ phát hành, mỗi hành động cloud cần Owner yêu cầu.

### Giai đoạn 0 — Trang bài video và bài đọc (không cần backend, ~1–2 tuần)
**Trạng thái 31/10/2026: phần mã đã làm trong working tree (chưa commit, chưa deploy).** Đã có: thẻ vùng/độ dài theo tên bài, đánh số "BÀI n / tổng", ghi chú Google/YouTube xuống dưới phần mô tả, nút ghi cảm nhận dời lên dưới Trước/Tiếp khi đang phát; bài đọc Preview dạng tổng quan + một bước một màn, một thanh dừng cố định, "Lựa chọn nhẹ hơn" gập, Vào/Ra chuyển vào khối gập dành cho người duyệt. Chưa làm: viết lại 14 bài theo Làm · Cảm nhận · Tránh và "Bạn sẽ làm" cho từng video (cần người có chuyên môn), tên bài riêng cho clip chung chung, thanh hành động cố định cuối màn (cần đổi footer của FlowStack, thuộc runtime được bảo vệ). Kiểm thử: tsc, runtime 28, reading-preview 4/4, discover-finder 6/6, learner-ux 39/39 ở lần chạy đầy đủ thứ hai (lần đầu 38/39 do giới hạn poster 300px, đã hoàn lại).

- Trang bài video mới (B1), trường dữ liệu theo bài, tên bài riêng, đánh số nhất quán, đưa ghi chú pháp lý xuống dưới.
- Bài đọc: tách lớp "dành cho người duyệt" khỏi lớp học viên; bố cục một bước một màn (A1–A3) áp trước cho màn Preview của Owner.
- Viết lại nội dung 14 bài theo khuôn Làm · Cảm nhận · Tránh: **cần người có chuyên môn**; không dùng AI để tự điền hướng dẫn tư thế.
- Kiểm thử: cập nhật `learner-ux`, Playwright; không có bằng chứng thiết bị/TalkBack nếu chưa đo.

### Giai đoạn 1 — Không gian giảng viên và chương trình (~3–5 tuần)
- Trang giảng viên (C1–C2) đọc hồ sơ đã kích hoạt qua một API chỉ-đọc; chưa có đăng ký.
- Quyết định đường xuất bản bài đọc cho học viên (tách người duyệt và người xuất bản; ảnh WebP đã tối ưu).
- Chương trình 7 ngày và danh sách phát; yêu thích/đã xem lưu cục bộ.

### Giai đoạn 2 — Lớp học và nhận xét bởi giảng viên (~6–10 tuần)
- Kiểm tra trạng thái thật của migration collaboration; kiểm thử actor theo vai trò; áp lên staging khi Owner đồng ý.
- Luồng học viên: mời bằng liên kết/mã (C4), chọn cách học và đồng ý chia sẻ (C3), gửi cảm nhận (B2), hộp thư nhận xét (D1).
- Giảng viên: hàng đợi, bối cảnh học viên, soạn nhận xét, hạn phản hồi (D2); AI chỉ soạn nháp khi giảng viên bật.
- Cổng bắt buộc: cập nhật chính sách/Data safety (dữ liệu sức khỏe chia sẻ cho giảng viên), xóa tài khoản xử lý ghi danh, quyền nội dung và hình ảnh giảng viên, hạn mức SMTP/thông báo.

### Giai đoạn 3 — AI nhận xét trực tiếp và gói trả phí (sau)
- Chỉ sau khi nội dung được duyệt, đồng ý AI riêng, đánh giá an toàn, kill switch và reviewer độc lập (các cổng AI hiện có).
- Mô hình gói/thanh toán do Owner quyết định.

### Chỉ số gợi ý
Tỷ lệ khách bấm xem video sau check-in; tỷ lệ ghi cảm nhận sau video; số buổi/tuần; tỷ lệ tham gia lớp sau lời mời; thời gian giảng viên phản hồi; tỷ lệ nhận xét bị học viên đánh dấu không hữu ích.

## 8. Quyết định Owner cần đưa ra
1. Hồ sơ giảng viên công khai: ai kích hoạt, nội dung nào được hiện, ai duyệt chứng chỉ.
2. Lớp bọc video YouTube hay bài do giảng viên soạn trong hệ thống.
3. Hạn phản hồi, quy mô lớp, số buổi nhận xét mỗi tuần; có tính phí hay không và khi nào.
4. Cho phép "AI soạn nháp, giảng viên xác nhận" ngay từ đầu không.
5. Bài đọc: tách người duyệt/xuất bản; xuất bản sau 1.0 hay cùng đợt.
6. Có tạo chương trình 7 ngày (ai soạn, ai duyệt).
7. Cho phép giảng viên thấy phần nào của check-in (mặc định đề xuất: chỉ phần học viên bật từng lần).

## 9. Giới hạn của báo cáo
- Không có nghiên cứu người dùng thật; điểm số và độ ưu tiên là đánh giá chuyên môn.
- Trang video đã xem trên web cục bộ (Vite), không phải bản Vercel/Play hay thiết bị thật; chưa thử phát video YouTube thật, chưa đo TalkBack/iOS.
- Bài đọc và ảnh AI là bản nháp chưa duyệt chuyên môn/quyền; canvas thiết kế dùng placeholder cho tên, giá, chứng chỉ và ảnh.
- Trạng thái áp migration collaboration lấy từ ghi nhận trong AGENTS.md, chưa đọc lại từ staging.

## 10. Triển khai theo kế hoạch (31/10/2026, Owner: "Triển khai theo kế hoạch đề xuất")

Owner chọn: mã Giai đoạn 1+2, cờ tắt, không cloud; hồ sơ giảng viên lấy từ hồ sơ đã kích hoạt (chưa có thì ẩn); lớp bao bọc video YouTube hiện có. **Mọi thay đổi ở working tree, chưa commit, chưa push, chưa deploy, không ghi cloud/thiết bị.**

### Đã làm
| Hạng mục | Nội dung | Tệp chính |
|---|---|---|
| Lưu bài / đã mở / gần đây (Giai đoạn 1) | Nút "Lưu bài này" ở trang bài; nhãn "đã lưu · đã mở" ở danh sách; mục "Của bạn trên máy này" trong Khám phá (bài mở gần nhất + tối đa 5 bài đã lưu); nút xóa. **Chỉ lưu trên thiết bị** (localStorage, không theo tài khoản, không gửi đi). "Đã mở" nghĩa là đã nhấn Phát, không phải đã xem hết (MCY không nhận tiến độ phát). | `src/courses/lessonMemory.ts`, `CourseDetailScreen.tsx`, `DiscoverScreen.tsx` |
| Lớp của tôi (Giai đoạn 2, phía học viên, chỉ đọc) | Cá nhân → "Lớp của tôi" chỉ hiện khi máy chủ xác nhận tài khoản có ghi danh (`workspace` vai `learner` và có lớp); danh sách lớp; nhận xét **đã gửi** (`read_feedback`), bản mới nhất, nhãn nguồn "Giảng viên viết" hoặc "AI hỗ trợ · giảng viên đã kiểm tra và xác nhận", ghi chú không thay lời khuyên y tế. Không có nút tạo/gửi/đăng ký. Khách và học viên thường không thấy gì; chức năng backend đang tắt nên hiện tại ẩn hoàn toàn. | `src/classes/*`, `Prototype.tsx` (route + dòng ở Cá nhân) |

### Cố ý chưa làm, và lý do
Các mục sau **cần hành động backend chưa tồn tại** và tôi không thể kiểm thử SQL ở môi trường này (không có PGlite/Docker). Viết giao diện cho hành động chưa có sẽ là mã chết không kiểm chứng được:
1. **Trang giảng viên công khai (C1–C2).** Backend chỉ trả hồ sơ của chính người gọi (`workspace.profile`). Cần: cột đồng ý công khai trên hồ sơ giảng viên, và hành động chỉ đọc `public_teacher_profiles` trả `{display_name, bio, ...}` chỉ của hồ sơ đã kích hoạt, đã đồng ý công khai, có quyền ảnh/tên.
2. **Lời mời vào lớp (C4) và học viên tự chọn cách học (C3).** Hiện ghi danh chỉ do admin tạo (`admin_enrollment`). Cần: bảng lời mời (mã/liên kết, hạn, số lần dùng), hành động `redeem_class_invite` (xác thực email đã xác minh, tạo ghi danh `active`, ghi nhận đồng ý chia sẻ có phạm vi/thời hạn), và hành động thu hồi.
3. **Gửi cảm nhận cho giảng viên (B2) và nhận xét gắn với cảm nhận học viên (D1).** Điểm danh (`attendance`) hiện do admin tạo. Cần hành động học viên gửi cảm nhận có đồng ý từng lần, lưu bản chụp cảm nhận (chỉ vùng/mức học viên chọn gửi), và quy tắc xóa khi thu hồi hoặc xóa tài khoản (`delete_my_account` đang từ chối vai trò nhân viên, cần thêm ghi danh/nhận xét vào phạm vi xóa).
4. **Nhận xét AI trực tiếp** vẫn sau các cổng AI hiện có. Nhận xét `ai_assisted_teacher_confirmed` đã được nhãn đúng ở màn học viên.
5. **Tên lớp.** `workspace` không trả tiêu đề khóa cho học viên (chỉ `course_version_id`), nên danh sách tạm hiện "Lớp 1, Lớp 2". Cần trả tiêu đề phiên bản khóa đã duyệt cho đúng người học.
6. **Danh sách phát tự chuyển bài** vẫn không làm. Sau khi Owner cho phép theo dõi tiến độ phát (cùng ngày), khi bài xem hết app chỉ đề xuất nút "Chọn bài tiếp theo", không tự phát.

Cổng bắt buộc trước khi mở các hành động trên: migration collaboration phải được kiểm lại trạng thái thật trên staging, áp bằng quy trình có xác nhận, kiểm thử actor theo vai trò, cập nhật chính sách/Data safety (dữ liệu sức khỏe chia sẻ cho giảng viên), xử lý xóa tài khoản, quyền nội dung/hình ảnh giảng viên.

### 10.1 Theo dõi tiến độ phát YouTube (Owner cho phép 31/10/2026)
Ghi nhận bằng YouTube IFrame API chính thức, chỉ sau khi học viên bấm Phát; chỉ đếm thời gian phát tiến (tua tới cuối không tính là đã xem); hoàn thành khi xem ≥85% thời lượng, hoặc kết thúc với ≥60% đã phát. **Dữ liệu chỉ lưu trên thiết bị**, không gửi MCY hay giảng viên. Nếu API không dùng được, bài vẫn phát và không có lời nào khẳng định đã xem. Cần làm tiếp trước khi phát hành: cập nhật trang chính sách quyền riêng tư công khai, chữ trong app và khai báo Data safety của Google Play (ứng dụng nay tải `youtube.com/iframe_api` sau khi Phát); kiểm tra trên Android WebView/iOS thật (origin, Referer, lỗi 153); quyết định có đồng bộ tiến độ lên tài khoản hoặc chia sẻ cho giảng viên không (cần đồng ý và hành động backend ở trên). Kiểm thử: `video-progress` 4/4 với YT API giả, `learner-ux` 39/39, `discover-finder` 7/7, `my-classes` 4/4.
