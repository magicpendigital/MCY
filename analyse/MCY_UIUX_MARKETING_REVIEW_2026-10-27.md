# Một chút yoga — Đánh giá UI/UX, sức hấp dẫn và thiết kế lại (27/10/2026)

Phạm vi: chạy thật app web mobile (390×844, chế độ khách, Edge) và đọc mã; chụp 9 màn (welcome, check-in 2 bước, Hôm nay, Khám phá, chi tiết bài, Hành trình, Cá nhân). Chưa có bằng chứng trên thiết bị thật, TalkBack/VoiceOver, hay phản hồi người dùng mục tiêu — kết luận về "hấp dẫn/marketing" là **đánh giá chuyên gia**, cần kiểm chứng bằng thử nghiệm với người dùng.

Đối tượng mục tiêu (suy ra từ tài liệu dự án): người lớn Việt Nam, thường ngồi nhiều (nhân viên văn phòng), căng mỏi cổ–vai–lưng, muốn vận động nhẹ vài chục giây–vài phút, ngại phải đăng ký hay bị phán xét. Dữ liệu then chốt: **cả 38 video chỉ dài 17 giây – 1 phút 4 giây**.

## 1. Đánh giá tổng quan

Thiết kế đã **nhất quán, ấm, đáng tin** (ngà–xanh rừng–đất nung, serif biên tập, ảnh mềm, ngôn ngữ trung thực, chạm lớn, tương phản kiểm bằng test ≥4.5). Check-in bản đồ cơ thể là điểm nhấn thật sự khác biệt và dễ dùng. Vấn đề không nằm ở "đẹp hay không" mà ở **giá trị nhận lại sau khi người dùng bỏ công**: check-in xong họ chỉ được dẫn tới một thư viện video, và thư viện đó được trình bày như 3 thẻ chữ lớn, không tìm kiếm, không thấy độ dài.

### Bảng phát hiện

| # | Màn | Phát hiện | Mức | Trạng thái |
|---|---|---|---|---|
| 1 | Khám phá | 38 bài giấu sau 3 thẻ chữ, mỗi thẻ ~115 px cao; không lọc, không thấy độ dài; người dùng "căng cổ" không có đường tắt | 🔴 | **Đã thiết kế lại**: panel "Tìm nhanh" (vùng/loại bài × độ dài), kết quả dạng hàng nhỏ, mở thẳng đúng bài |
| 2 | Chi tiết bài | Hai khung ghi chú (phụ đề, YouTube) + tiêu đề lớn đẩy **video xuống dưới màn hình**; hành động chính bị chôn | 🔴 | **Đã sửa**: video/poster lên đầu, ghi chú ngay dưới (giữ nguyên nội dung quyền riêng tư gần nút Phát); mô tả khóa học xuống dưới; tiêu đề nhỏ lại |
| 3 | Hành trình (lần đầu) | Người mới thấy 7 ô ngày "Chưa ghi", thẻ rỗng, "So với lần khác", "Nhìn theo từng vùng" — toàn công cụ không có dữ liệu; CTA nằm cuối trang và ghi "Thử lần quay lại tiếp theo" | 🔴 | **Đã thiết kế lại**: trạng thái rỗng một thẻ với CTA "Ghi nhận cơ thể hôm nay"; ẩn các công cụ cho tới khi có bản ghi |
| 4 | Hôm nay | Màn chính chỉ là văn bản + ảnh + CTA; không có gì để làm ngay với người chưa muốn check-in; ảnh hero có chữ lấn lên ảnh | 🟡 | **Đã bổ sung** "Bắt đầu nhẹ nhàng": 3 bài ngắn nhất (xếp theo độ dài, không theo check-in). Còn lại: hero/copy (xem 6) |
| 5 | Check-in bước 2 | Hỏi "bao lâu? 5/10/15 phút" nhưng mọi video <1,1 phút và lựa chọn không đổi kết quả (đã thấy "chưa có gợi ý tự động") — tạo kỳ vọng sai | 🟡 | **Giảm thiểu**: thêm dòng giải thích độ dài thật. Giải pháp gốc cần quyết định sản phẩm (6) |
| 6 | Welcome | Lợi ích chung chung ("Chọn lộ trình riêng" chưa có thật); không nói điều mạnh nhất: miễn phí, không cần tài khoản, bài rất ngắn | 🟡 | Đề xuất (copy do Owner chốt — chưa đổi) |
| 7 | Cá nhân (khách) | Danh sách 7 hàng cài đặt dành cho tài khoản hiện cho cả khách; ít ý nghĩa trước khi đăng nhập | 🟢 | Đề xuất: thu gọn cho khách |
| 8 | Poster video | Khối xanh đen trống 9:16 không có hình; nhưng không dùng thumbnail YouTube vì sẽ gọi Google trước khi người dùng đồng ý | 🟢 | Cần ảnh poster riêng do mình tạo (khi có quyền) |
| 9 | Welcome (dev) | `VI / EN*` thấy trên bản dev; bản production đã ẩn (đã kiểm 23/10) | 🟢 | Không đổi |

### Hierarchy & reading flow
- Welcome: mắt đi đúng — logo → tên → ảnh → CTA đất nung. Khoảng trống giữa danh sách lợi ích và câu trích khá lớn trên máy cao.
- Khám phá cũ: tiêu đề → đoạn dẫn dài → thẻ; **mắt không biết bắt đầu ở đâu**. Mới: công cụ tìm nhanh trước, nhóm bài sau.
- Chi tiết bài: nay đọc theo thứ tự đúng: *xem → ghi chú → mô tả bài → danh sách bài*.

### Accessibility
- Chip mới ≥44 px, `aria-pressed`, vùng kết quả `aria-live="polite"`, chữ ≥14 px; hàng kết quả là `button` đầy đủ. Test hiện có (tương phản, cỡ chữ, route inert) vẫn đạt.
- Chưa kiểm bằng TalkBack/VoiceOver; thứ tự tab trên chi tiết bài đã đổi, cần kiểm trên thiết bị.

### Điểm làm tốt (giữ nguyên)
Check-in tôn trọng quyền chọn (bỏ qua/chưa ghi là các trạng thái khác nhau); Hành trình không bịa xu hướng; chú thích ngoài hình; điều hướng 4 tab rõ; ngôn ngữ y tế thận trọng; font serif đã hiển thị đúng dấu tiếng Việt.

## 2. App đã đủ hấp dẫn để thu hút và marketing chưa?

**Chưa đủ để tự thu hút; đủ để làm nền tin cậy.** Cảm xúc thương hiệu tốt, nhưng lời hứa trên Welcome ("chọn lộ trình riêng") lớn hơn thứ app đang giao (check-in + 38 clip YouTube ngắn). Điểm khó nhất cho marketing: **các video nằm sẵn trên YouTube** — nếu app chỉ là cách xem video thì không có lý do cài. Giá trị chỉ app mới có phải là *sổ cơ thể riêng tư + thói quen vi mô + học tư thế có hình*.

Giá trị nên bổ sung (xếp theo tác động/chi phí, đều giữ nguyên tắc trung thực, không AI, không quảng bá điều trị):

| Ưu tiên | Giá trị | Vì sao quan trọng | Phụ thuộc |
|---|---|---|---|
| 1 | **Nhắc nhẹ theo thói quen** (nhắc 1 bài 30 giây sau giờ ngồi lâu; thông báo cục bộ) | Sản phẩm "một chút" sống bằng thói quen; hiện mục Nhắc tập chỉ là hàng cài đặt chưa hoạt động | Quyền thông báo Android/iOS; copy không gây áp lực |
| 2 | **Bộ sưu tập theo tình huống do người dùng chọn**: "Ngồi lâu", "Mới ngủ dậy", "Trước khi ngủ", "Giữa buổi làm việc" | Người dùng không nghĩ theo "nhóm 1/2/3" mà theo khoảnh khắc; đây cũng là câu chuyện marketing rõ nhất | Biên tập thủ công từ 38 bài; không cần AI |
| 3 | **Bài học có hình** (14 bài đọc tư thế) làm điểm khác biệt: "hiểu tư thế trước khi tập" | Nội dung YouTube không có; đã sản xuất, ảnh nay chỉ ~1,9 MiB | Owner duyệt chuyên môn/quyền; quyết định xuất bản; 25 ô ảnh còn bị chặn |
| 4 | **Sổ cơ thể có ý nghĩa**: sau 3+ lần ghi, tóm tắt trung thực từ dữ liệu người dùng ("Cổ: bạn ghi 4 lần trong 14 ngày, 3 lần ở mức Bình thường") | Là lý do để quay lại; không suy diễn, không % cải thiện | Chỉ cần dữ liệu đã có |
| 5 | **Giới thiệu giáo viên và cách bài được biên soạn** (Huyền My, tên hiển thị lấy từ tài khoản đã kích hoạt) | Niềm tin là rào cản lớn nhất của app sức khỏe | Quyền/xác nhận của giáo viên; không dùng ảnh khi chưa có quyền |
| 6 | **Chia sẻ một bài** (liên kết sâu) | Vòng lan truyền chi phí thấp, phù hợp "gửi bạn đồng nghiệp bài 20 giây cho cổ" | App Links/Web route công khai |
| 7 | **Trang đích web + ASO** (ảnh chụp từ bản thật, mô tả không hứa điều trị, từ khóa "yoga văn phòng", "giãn cơ cổ vai gáy") | Hiện chưa có kênh khám phá nào ngoài link | Hồ sơ cửa hàng Play, ảnh chụp, trang `/` công khai |

Lưu ý kênh: nhóm văn phòng/phụ nữ 25–45 ở Việt Nam đến từ short video (TikTok/Reels/Shorts — kênh đã có 38 Shorts) → cắt từng bài thành câu hỏi hành động ("Cổ cứng sau 2 tiếng ngồi? 20 giây này…") kèm liên kết vào đúng bài trong app (cần mục 6).

## 3. Những gì đã thiết kế lại (mã nguồn cục bộ)

| Khu vực | Thay đổi | Tệp |
|---|---|---|
| Khám phá | Panel "Tìm nhanh một bài": chip vùng (Cổ và vai · Lưng · Hông và chân · Toàn thân · Tư thế) và độ dài (<30 giây · 30 giây–1 phút); kết quả hàng nhỏ có thời lượng; nhãn vùng suy từ **tên bài**, nói rõ không dựa trên check-in | `src/courses/lessonFinder.ts`, `DiscoverScreen.tsx`, `prototype.css` |
| Chi tiết bài | Video trước, ghi chú sau, mô tả khóa học xuống dưới; h1 28 px; lưới 2 cột desktop giữ nguyên | `CourseDetailScreen.tsx`, `prototype.css` |
| Hôm nay | "Bắt đầu nhẹ nhàng": 3 bài ngắn nhất, mở thẳng bài | `Prototype.tsx` |
| Hành trình | Trạng thái rỗng một thẻ có CTA đúng ngữ cảnh; công cụ chỉ hiện khi có dữ liệu | `JourneyScreen.tsx` |
| Check-in bước 2 | Dòng giải thích độ dài bài thật | `Prototype.tsx` |

Kiểm thử: `tests/lesson-finder.test.mjs` (4), `tests/discover-finder.spec.ts` (2); cập nhật các test đang mã hóa thiết kế cũ (ghi chú nằm trên video, cue cuộn xuống, ô ngày rỗng) sang thiết kế mới.

## 4. Còn chưa thiết kế lại và vì sao

1. **Welcome copy / Hôm nay hero**: copy do Owner chốt 23/10; đề xuất 3 lợi ích mới — "38 bài ngắn, xem miễn phí", "Ghi lại cơ thể hôm nay, riêng tư", "Không cần tài khoản" — chờ Owner đồng ý.
2. **Check-in bước 2**: gốc vấn đề là câu hỏi thời lượng/năng lượng không đổi kết quả. Phương án: bỏ bước 2 khỏi luồng khách và chuyển thẳng sang "Tìm nhanh" với vùng vừa chọn làm *gợi ý lọc do người dùng xác nhận* (không tự lọc, để giữ nguyên tắc không suy luận từ check-in). Cần quyết định sản phẩm.
3. **Poster video và Welcome ảnh**: cần ảnh poster do mình sở hữu quyền.
4. **Cá nhân cho khách** và **Khám phá nhóm lớn** (3 thẻ): có thể thu gọn thành thanh nhóm ngang khi có số liệu sử dụng.
5. Tablet/ngang, cỡ chữ lớn hệ thống, TalkBack — chưa kiểm.
