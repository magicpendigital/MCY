# Rà soát chéo bài 01 — Đứng và nhận biết điểm tựa

16/10/2026 · Phạm vi: bản xem trước cục bộ trong thư mục này. Người rà soát không soạn nội dung bài hoặc tạo hình của lần cập nhật này. Đây là rà soát source, tính nhất quán nội dung–hình và nguồn tham khảo; **không phải thẩm định của chuyên gia yoga hoặc xác nhận phù hợp để phát hành cho người học**.

## Kết quả trong phạm vi xem trước

Không còn vấn đề P1/P2 được phát hiện trong phần source và nội dung đã rà soát. Kết luận này chỉ phục vụ Owner xem xét bản nháp. Rủi ro cao nhất là **R3 — hướng dẫn sức khỏe**; các điều kiện chuyên môn và phát hành vẫn chưa được thông qua. Không có tích hợp ứng dụng, thay đổi tài khoản/dữ liệu hoặc thao tác cloud trong phần rà soát này.

| Kiểm tra | Kết quả và bằng chứng |
|---|---|
| Năm nội dung và năm hình riêng | Đã xem trực tiếp cả năm PNG. Năm SHA-256 khác nhau; cùng nhân vật, trang phục và bảng màu. Không thấy lỗi thừa chi lớn qua kiểm thị giác; không suy ra độ chính xác giải phẫu/chuyên môn từ đó. |
| Cận cảnh và mô tả thay thế | Bước 2 chủ động cận bàn chân; bước 4 chủ động cận thân trên. Alt cuối không mô tả bàn chân ở bước 4 hoặc ghế ở bước 5 khi chúng không có trong pixels. |
| Lựa chọn có ghế xuyên suốt | Nội dung chính bước 4–5 nhắc giữ điểm tựa. Chú thích bước 4–5 nói rõ hình thể hiện lựa chọn không dùng ghế. Chuẩn bị ghế được giải thích bằng chữ; hình 3 không tự chứng minh ghế áp sát tường hoặc không trượt. |
| Nội dung từng bước | Có phần chuẩn bị, phạm vi, dấu hiệu dừng, lựa chọn chỉ xem và cách kết thúc. Không đưa số nhịp/thời gian giữ, mục tiêu ép cân lực, mục tiêu tạo hình giống ảnh hoặc hứa kết quả sức khỏe. |
| Hình hiện tại và phóng to | `reader()` và nhánh `zoom` cùng dùng `stepMedia()`. Src, alt, tiêu đề dialog và chú thích đều lấy từ bước đang mở. Source CSS dùng `object-fit: contain`. |
| Điều hướng và kết thúc | Năm lựa chọn nhìn lại mở đúng chỉ số bước. Mục lục, Trước/Tiếp và mở trực tiếp đều cập nhật bước. Copy kết thúc là “Bạn đã đến cuối phần đọc”; việc nhảy bước không tạo khẳng định đã đọc hết/đã tập. Context Hôm nay/buổi minh họa được giữ. |
| Dữ liệu và trạng thái | Dữ liệu bài được nạp bằng JS cùng nguồn; CSP vẫn chặn kết nối. Trạng thái đọc ở bộ nhớ, không có nhánh ghi buổi tập, wellbeing hoặc Hành trình. |
| Trạng thái bản nháp | Ribbon, trang tổng quan, series và ghi chú phân biệt bài 01 đã có nội dung/năm hình riêng với bài 02–03 còn là đề cương. Không có khẳng định giáo viên đã duyệt. |

## Đối chiếu nguồn

Đã mở lại bốn nguồn chính ngày 16/10/2026: [ACE](https://www.acefitness.org/resources/everyone/blog/7377/yes-you-can-do-yoga/), [CDPH Shape of Yoga](https://publichealth.calaverasgov.us/Portals/PublicHealth/Documents/CDPH_Shape_of_Yoga_Booklet.pdf), [NHS Strength exercises](https://www.nhs.uk/live-well/exercise/strength-exercises/) và [NHS Chair-based pilates](https://www.nhs.uk/live-well/exercise/pilates-and-yoga/chair-based-pilates-exercise-video/). Các nguồn hỗ trợ những điểm giới hạn đã ghi trong `STANDING-LESSON.vi.md`; không nguồn nào phê duyệt trình tự MCY, phương án một tay trên ghế hoặc bộ hình AI này.

## Kiểm đã chạy và giới hạn

- `node --check .../preview.js`: **PASS**, exit 0.
- `node --check .../standing-lesson.js`: **PASS**, exit 0.
- Đối chiếu object trong `standing-lesson.js` với `standing-lesson.json`: **PASS**, bằng nhau và đủ 5 bước.
- Xem trực tiếp năm PNG: **ĐÃ KIỂM**, giới hạn là kiểm thị giác biên tập.
- Browser, bàn phím, màn hẹp và phóng to thực tế: **không do người rà soát này chạy**; dùng bằng chứng QA của người triển khai, không coi source review là browser acceptance.
- Thẩm định giáo viên, kiểm với người học, thiết bị Android/iOS và phát hành: **CHƯA CHẠY / CHƯA DUYỆT**.

Các điểm chưa xác minh chuyên môn được giữ rõ trong bản nháp, đặc biệt cách đặt và dùng ghế, đầu/gối/chân, phần chuyển tiếp và lựa chọn cho người cần mức hỗ trợ khác. Hoàn thiện bản xem trước không thay thế các điều kiện đó.
