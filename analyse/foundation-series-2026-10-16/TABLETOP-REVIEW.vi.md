# Rà soát chéo bài 02 — Làm quen chuyển động Bò–Mèo

16/10/2026 · Phạm vi: bản xem trước cục bộ trong thư mục này. Người rà soát không soạn nội dung hoặc tạo hình của lần cập nhật bài 02. Đã kiểm source, đối chiếu nguồn chính và xem trực tiếp năm PNG; không điều khiển browser trong phần rà soát này.

## Kết quả

Không phát hiện P1/P2 còn mở trong phạm vi **bản nháp để Owner đánh giá**. Rủi ro cao nhất là **R3 — hướng dẫn sức khỏe**. Kết luận này không phải duyệt chuyên môn yoga, đo tải khớp hoặc xác nhận phù hợp để đưa cho người học thực hành. Việc tích hợp ứng dụng và phát hành chưa nằm trong phạm vi được xác nhận.

| Kiểm tra | Kết quả |
|---|---|
| Trình tự và phạm vi | Bốn điểm tựa → Bò nhẹ → vị trí giữa → Mèo nhẹ → trở về nền và ngừng chuyển động. Đối tượng giới hạn ở người lớn đã tự xuống/rời sàn và chống tay–gối thoải mái. Không thêm kỹ thuật chuyển sàn hoặc tư thế Em bé bắt buộc. |
| Liều và kết quả | Không yêu cầu số lần, số nhịp giữ, độ cong phải đạt hoặc kết quả sức khỏe. Có lựa chọn chuyển ít hơn, chỉ xem hoặc dừng ở vị trí giữa. |
| Đầu/cổ và vùng chậu | Copy nhắc không hất đầu ở Bò, không ép cằm sát ngực ở Mèo; mô tả chuyển động nhỏ và đầu theo thân. Các điểm kỹ thuật vẫn cần giáo viên thẩm định cùng ảnh. |
| Điểm tựa | Tay và gối được giữ trong trình tự; chuẩn bị lớp lót không được dùng làm cách bỏ qua đau/tê. Không tự áp biến thể nắm tay/cẳng tay cho người đang khó chịu. |
| Hình và chữ | Đã nhìn trực tiếp cả năm ảnh. Hình 2 hơi võng, hình 4 tròn lưng, hình 3 trở qua gần trung tính; hình 5 đổi góc máy và copy nói rõ không yêu cầu xoay người. Alt không mô tả hình tĩnh như một video hoàn chỉnh. |
| Media từng bước | Source reader và zoom cùng lấy `stepMedia()` theo bài/bước hiện tại; ảnh, alt, caption và tiêu đề dialog tương ứng. CSS tiếp tục dùng `object-fit: contain`. |
| Luồng dùng chung | Bài hoàn thiện dùng `draftLesson()`, số bài theo chỉ số, màn cuối có nội dung riêng và CTA sang bài kế tiếp đúng chỉ số. Đường dẫn `lesson=tabletop` và bước 1–5 được xử lý cùng bài Đứng; ngoài khoảng không mở bước không hợp lệ. |
| Tính trung thực | Kết thúc là “đã đến cuối phần đọc”; xem/nhảy khung không tạo bản ghi tập hoặc wellbeing. Bản nháp và bài 03 còn là đề cương được ghi rõ. Trạng thái tạm ở bộ nhớ. |

Góp ý câu chữ alt bước 2 đã **ĐÓNG**: câu mơ hồ “cong lõm nhẹ hơn hình bắt đầu” đã đổi thành “Lưng có độ võng nhẹ, ngực hướng về trước, vùng chậu nâng nhẹ; đầu không ngửa ra sau.” Người triển khai đã đồng bộ lại JSON, JS, tài liệu và trang review. Không còn góp ý câu chữ mở trong phạm vi này.

## Nguồn được mở lại

Đã mở trực tiếp ngày 16/10/2026:

- [ACE — Cat-Cow](https://www.acefitness.org/resources/everyone/exercise-library/15/cat-cow/): đối chiếu nền tay/gối, hai hướng lưng và trở về. MCY không lấy thời gian giữ hoặc cách co ngón chân của bản ACE.
- [Mayo Clinic — Cat/cow pose](https://www.mayoclinic.org/healthy-lifestyle/stress-management/multimedia/cat-cow-pose/vid-20453581): đối chiếu hướng chuyển vùng chậu/đầu/lưng và phối hợp hơi thở. MCY không lấy số lần hoặc yêu cầu hít sâu làm liều tập.
- [Cleveland Clinic — Cat-Cow Stretch](https://health.clevelandclinic.org/cat-cow-stretch): đối chiếu nền, mu bàn chân, chuyển nhỏ/chậm và tránh hất đầu. Không dùng tuyên bố tác dụng hoặc tự áp biến thể của nguồn cho người có triệu chứng.
- [NHS — Chair-based pilates](https://www.nhs.uk/live-well/exercise/pilates-and-yoga/chair-based-pilates-exercise-video/): đối chiếu lời nhắc dừng và tìm hỗ trợ khi triệu chứng không hết hoặc gây lo lắng; không phải nguồn duyệt kỹ thuật Bò–Mèo.

Thứ tự năm khung, biên độ nhỏ, tùy chọn hơi thở tự nhiên và giới hạn đối tượng là tổng hợp biên tập. Không nguồn nào đã duyệt bài MCY hoặc năm hình do AI tạo.

## Kiểm đã chạy

- `node --check .../preview.js`: **PASS**, exit 0.
- `node --check .../tabletop-lesson.js`: **PASS**, exit 0.
- Object JS so với `tabletop-lesson.json`: **PASS**, dữ liệu bằng nhau, đủ 5 bước và 5 đường dẫn hình khác nhau.
- Năm PNG: **ĐÃ XEM** trực tiếp; SHA-256 khác nhau và khớp bảng nguồn hình.
- Bảy pin bài Đứng so với `revisions/2026-10-16-before-tabletop/standing-pins.json`: **PASS**, JSON/JS và 5 PNG giữ nguyên chính xác.

Browser, thao tác bàn phím và màn hẹp thuộc bằng chứng QA của người triển khai. Rà soát source này không thay thế kiểm browser, kiểm với người học, thẩm định chuyên gia yoga hoặc kiểm Android/iOS thật. Không có thao tác cloud, ghi dữ liệu hoặc phát hành trong phần rà soát này.
