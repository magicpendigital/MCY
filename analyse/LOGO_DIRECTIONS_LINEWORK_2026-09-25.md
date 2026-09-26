# Ba hướng logo nét đồng nhất cho Một chút yoga

Ngày 25.09.2026 · Gợi ý nghiên cứu từ phản hồi của người dùng, chưa chốt biểu tượng.

## Thiết kế lần này sửa điều gì

Phản hồi mới nói rõ hai vấn đề của vòng trước: bản nét đầy đủ và bản cô đọng trông như hai logo khác nhau; hai hình lá trên đầu giống nơ buộc tóc hơn mầm cây. Ba hướng dưới đây bỏ chi tiết trên đầu và dùng cùng một hệ vẽ để so sánh công bằng:

- cùng khung `viewBox` 100 × 100;
- một màu xanh rừng, không dùng gradient hoặc chi tiết trang trí;
- cùng nét 6 đơn vị, đầu nét tròn, góc nối tròn;
- không đổi từ nét viền sang mảng đặc khi thu nhỏ; thay đổi chỉ là tỉ lệ hiển thị.

Apple khuyến nghị biểu tượng gọn, có ít hình khối và giữ đặc điểm cốt lõi nhất quán giữa các biến thể; Android dùng vùng an toàn 66 × 66 trong khung adaptive icon 108 × 108. Đây là lý do các phác thảo đang ưu tiên một ý chính, ít nét, và có khoảng trống quanh hình. Nguồn: Apple HIG, App icons; Android Developers, Adaptive icons.

## Hướng đề xuất

| Hướng | Dấu hình | Liên tưởng tốt nhất | Đánh đổi |
|---|---|---|---|
| **A · Ngồi mở** | Người ngồi tập, hai tay buông tự nhiên, không có mầm trên đầu | Yoga dịu, gần với ảnh người dùng gửi, nhưng không phụ thuộc chi tiết giống tóc/nơ | Dễ bị đọc thành thiền; các nét tay và chân cần giữ thoáng ở 24–32 px. |
| **B · Vươn ngang** | Dáng đứng mở rộng, hai chân tạo thế vững | Có chuyển động và năng lượng; giảm cảm giác chỉ tập thiền | Có thể bị hiểu là thể dục hoặc tư thế võ; cần thử xem người mới có nhận ra yoga. |
| **C · Thảm mở** | Thảm yoga cuộn ở một đầu, một đường giữa | Dễ vector hóa; thuận tiện cho chuyển động mở thảm | Rất dễ trông như viên thuốc ở icon; cần đặt cạnh tên để tạo ngữ cảnh. |

Đây là phán đoán thiết kế, chưa phải kết quả khảo sát. Tôi đề xuất đưa **A và B** vào vòng nhận diện người dùng tiếp theo; giữ C làm mốc kiểm tra mức độ cần biểu tượng vật thể. A nên là bản chủ đạo nếu sự gần gũi quan trọng nhất; B nên thắng nếu ứng dụng muốn được hiểu là luyện tập vận động đa dạng, không chỉ ngồi thở.

## Khả năng sử dụng

| Tình huống | A · Ngồi mở | B · Vươn ngang | C · Thảm mở |
|---|---|---|---|
| App icon | Cần thử 24/32/48 px; không kèm chữ | Silhouette đơn giản hơn, nhưng phải tránh người thành hình dấu cộng | Dễ dính thành viên thuốc ở cỡ nhỏ |
| Trong app | Dùng một mình cạnh tiêu đề; không thay icon điều hướng | Dùng làm biểu tượng nhận diện bài tập/chuyển động | Dùng ở nội dung chuẩn bị buổi tập, kém phù hợp làm dấu thương hiệu duy nhất |
| Poster/mạng xã hội | Có thể phóng lớn, đặt cạnh ảnh và slogan | Tạo cảm giác năng động, hợp chiến dịch “bắt đầu hôm nay” | Có thể làm họa tiết đường nét chạy ngang |
| Splash/loading | Nét đầu/đầu người xuất hiện trước, rồi thân; animation một lần | Có thể chuyển động tay/chân, nhưng cần tránh chuyển thành tư thế khác không đúng | Có thể “mở thảm” ngắn; không lặp vô hạn nếu app chưa tải xong |
| Vector/in một màu | Các đường hở tách nhau; dễ đổi màu | Ít điểm giao nhau; tương đối đơn giản | Ít thành phần, nhưng vòng cuộn phải đủ lớn để không bết |

## Quy tắc giữ đồng nhất về sau

1. Chọn một độ dày nét chuẩn và quy đổi theo kích thước; mọi bản đều dùng đầu tròn, nối tròn.
2. Không thay cùng một chi tiết từ outline sang solid chỉ để “cố cứu” icon nhỏ. Nếu cần optical correction, điều chỉnh khoảng hở và độ dày vừa đủ, giữ nguyên dáng chính.
3. Giữ chính xác cùng một dáng đầu–thân–chân trong logo master, app icon, social avatar và animation.
4. Dùng bản xanh rừng trên ngà hoặc bản trắng trên xanh đậm; tránh nét trắng nhỏ trên nền sage sáng.
5. Chuyển động dựa trên chính các path vector, ngắn, một lần khi mở, và tắt/giảm khi thiết bị bật Reduce Motion.

## Kiểm tra trước khi chọn

- Đưa ba dấu cùng tên “Một chút yoga” cho 8–12 người xem 5 giây; hỏi họ thấy gì, nghĩ app làm gì, nhớ được hình nào. Đừng gợi ý từ “yoga”, “thiền”, “thảm” trước khi hỏi.
- Xem lại trên nền sáng/tối và ở 24, 32, 48 px; Android adaptive icon phải giữ nội dung chính trong vùng an toàn.
- Đặt các phương án cạnh icon ứng dụng cùng nhóm để đánh giá độ khác biệt.
- Tra cứu nhãn hiệu theo hình và tên ở thị trường dự kiến trước khi công bố.

Các SVG và bảng xem là phác thảo ban đầu; chưa gồm wordmark chuyển thành outline, file Android VectorDrawable/AVD hoặc icon store 1024 px.
