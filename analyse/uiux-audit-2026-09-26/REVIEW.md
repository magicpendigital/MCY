# Một chút yoga — phân tích UI/UX và kế hoạch đề xuất

Ngày 26/09/2026. Chỉ phân tích, chưa triển khai giao diện. Các lựa chọn thiết kế dưới đây là đề xuất để review.

**Cập nhật 27/09/2026:** Người dùng đồng ý hướng UX chính và bổ sung phản biện về slogan, ngôn ngữ, video, kiến thức, thiền và mobile web. Kế hoạch hiện hành: [PLAN_V2.md](D:/Projects/MCY/analyse/uiux-audit-2026-09-26/PLAN_V2.md). Báo cáo này giữ bằng chứng của lượt audit trước.

## Phạm vi và bằng chứng

Đối chiếu ba ảnh người dùng cung cấp, brand/BRAND_GUIDELINES.md, design-system/DESIGN_SYSTEM.md, tokens và mã hiện tại. Mở bản hiện tại bằng in-app browser, đi luồng khách: chào → check-in → cuộn các trường → bài tập; đối chiếu check-in và bài tập trên iPhone/Pixel 10. Kiểm tra hình launcher trong dự án Android/iOS. Runtime integrity đạt 28/28 file được bảo vệ.

Đây là đánh giá các màn hình và nhánh khách nói trên; chưa kiểm thử toàn bộ luồng tài khoản, screen reader, font rendering trên máy iOS thật hay mọi trạng thái bàn phím. Không có nghiên cứu người dùng MCY trong lượt này; nguồn bên ngoài cung cấp nguyên tắc tham khảo, không chứng minh hiệu quả trên MCY.

## Các bước quan sát

1. Chào / ảnh người dùng số 2: nền ảnh, màu sắc và mark Khoảng mở giữ được tinh thần thương hiệu; chữ phụ nhỏ, đăng ký/đăng nhập có độ nổi thấp. Cần tinh chỉnh, không cần làm lại hình ảnh chủ đạo.
2. Check-in / ảnh người dùng số 1: cần ưu tiên sửa. Hình cơ thể chiếm phần lớn vùng nhìn, năng lượng/danh sách vùng/thời gian ở phía dưới; thanh đăng nhập tạo cảm giác đã hết nội dung. Cuộn vẫn hoạt động.
3. Check-in sau cuộn: có đủ lựa chọn không khó chịu, chưa xác định và bỏ qua; nhưng thứ tự đang tách hình cơ thể khỏi danh sách vùng bằng phần năng lượng. Việc quay lại từ bài tập giữ vị trí cuộn trong phiên kiểm tra.
4. Bài tập / ảnh người dùng số 3: nội dung có cấu trúc tương đối rõ, có bản thay thế. Thanh bắt đầu sát mép, che nội dung; ghi chú lộ phía dưới trên iPhone. Câu “Dành riêng cho bạn” quá mạnh với buổi mẫu, nhất là khi chưa nhập gì.
5. Launcher: icon PNG Android và iOS đang là Capacitor mặc định. Không suy ra trạng thái icon cài trên điện thoại chỉ từ ảnh màn hình app; kết luận này dựa trên asset của dự án.

## Phát hiện và hướng xử lý

### 1. Brand và typography — ưu tiên cao

Khoảng mở đã có trên màn chào; vấn đề là áp dụng chưa đồng bộ. Có master icon nhưng launcher chưa dùng, index.html chưa khai báo favicon. Giữ hình học cung mở và chấm, dùng nền forest và mark ivory cho icon, không thêm chữ vào icon. Xuất đủ Android adaptive/legacy và iOS; kiểm tra mask và kích thước nhỏ.

Mã main.tsx chỉ import @fontsource/roboto/latin-500.css. Giao diện tiếng Việt dùng nhiều weight khác nhau, đồng thời xen Georgia, Times New Roman và system-ui. Đây là rủi ro fallback và giả lập độ đậm đã xác định từ mã, nhưng chưa kết luận font nào thực sự vẽ từng glyph trên thiết bị thật. Tiêu đề check-in có line-height 1.03, cần tăng khoảng thở cho dấu tiếng Việt.

Chốt một bảng font thực thi: serif theo kit cho tiêu đề, sans hệ thống iOS và Roboto đầy đủ Vietnamese cho Android; đối chiếu bất nhất hiện tại giữa brand guideline và token ưu tiên Roboto chung. Chỉ đóng gói weight cần dùng. Đề xuất body 16 px, phụ 13–14 px, heading 28–32 px / line-height 1.18–1.25; đây là thông số khởi điểm cần review. Không giấu thông tin thiết yếu trong chữ 9–11 px.

### 2. Check-in — ưu tiên cao

Khuyến nghị tách hai bước, không thu nhỏ lại hình cơ thể đến khó bấm:

- Bước 1/2 — Cơ thể: câu hỏi ngắn “Bạn thấy căng mỏi ở đâu?”, hình thân trên, danh sách tên vùng ngay cùng khu vực, trạng thái đã chọn. Chạm vùng mở sheet sửa mức, bên và ghi chú; phải bấm Lưu để ghi nhận. Giữ “Không thấy khó chịu”, “Chưa xác định” riêng biệt.
- Bước 2/2 — Năng lượng & thời gian: hai nhóm lựa chọn ngắn, có thể sửa bước trước mà không mất dữ liệu. Sau đó mới đến trò chuyện mẫu và kế hoạch hôm nay.

Stepper phía trên chỉ thể hiện tiến độ check-in, không tính đăng nhập thành một bước và không đếm số bước không chắc chắn của cuộc trò chuyện. Bước đã qua cho phép quay lại; không tự chuyển màn khi chọn đáp án. Giữ một nút chính dưới đáy: “Tiếp: Năng lượng & thời gian”, rồi “Tiếp: Trò chuyện mẫu”. Có thể dùng nhãn ngắn trên nút và một dòng “Tiếp theo: …” khi chữ lớn.

Phân biệt ba ý định: “Bỏ qua phần cơ thể” đến bước 2; “Xem buổi mẫu ngay” bỏ phần còn lại để đến kế hoạch mẫu; “Không thấy khó chịu” là một tự báo cáo, không phải bỏ qua. Không ghi bỏ qua thành mức 0 hay dữ liệu cải thiện. Nếu người dùng đã nhập rồi chọn đường tắt, không tự xóa hay tự lưu server; ghi rõ trạng thái nháp và phạm vi sử dụng.

Đặt đường tắt xem mẫu cạnh phần tiến độ, có vùng bấm đủ lớn nhưng ít nhấn mạnh; không dồn tất cả vào một footer. “Bỏ qua phần này” là hành động phụ theo bước. Các trường vẫn cuộn được khi màn thấp/chữ lớn; nếu có nội dung còn dưới thì cho thấy tiêu đề tiếp nối phía trên footer hoặc chỉ dẫn bằng chữ, không dùng chữ xuyên qua footer làm dấu hiệu cuộn.

### 3. Tách tài khoản khỏi nhiệm vụ check-in

Hiện tại khách được mời thử, nhưng nút chính tiếp theo lại đòi đăng nhập để xem trợ lý mẫu; nút phụ bỏ qua luôn trò chuyện và đi kế hoạch. Điều này làm ý nghĩa “tiếp tục” thiếu nhất quán.

Đề xuất đích UX: khách có thể xem hội thoại kịch bản có nhãn mẫu trong phiên, không có AI thật hay lưu server; mời đăng nhập khi muốn lưu/đồng bộ. Đây là thay đổi sản phẩm cần duyệt, không tự gỡ auth/consent hiện tại. Nếu giữ gate hiện hành, thông báo trước ở màn chào và đặt bước tài khoản riêng sau check-in, giữ dữ liệu nháp để không phải nhập lại.

Không đặt “đồng ý xử lý dữ liệu” chung nghĩa với nút Tiếp; không tự bật consent. Hướng dẫn ban đầu là ngắn và theo ngữ cảnh, không bắt xem lại mỗi ngày. Bottom navigation bốn mục chỉ dùng ở các màn cấp cao, không chồng với thanh Next của flow.

### 4. Thanh hành động đáy — ưu tiên cao

Nền phủ phải kín từ đầu vùng action tới mép dưới vùng app, không để chữ lộ phía dưới hoặc xuyên qua. Nút thụt vào 20–24 px, thẳng hàng nội dung; trên màn rất hẹp có thể 16 px. Cao 52–56 px; cách hành động phụ 8–12 px, action phụ có hit area khoảng 44–48 px. Giữ pill và màu terracotta theo kit.

Footer phải thích ứng nhãn nhiều dòng, lỗi mạng và cỡ chữ lớn; chiều cao dùng để bù nội dung phải khớp chiều cao render. Nội dung cuối cuộn lên được hoàn toàn phía trên footer; không chỉ tăng z-index hoặc đổ gradient.

Mã hiện tại khai báo padding footer qua --mobile-safe-area-height, nhưng biến được đặt ở .mobile-page trong vùng cuộn, trong khi footer là sibling bên ngoài vùng đó. Đây là nguyên nhân mạnh cho việc shorthand padding không có giá trị hợp lệ, làm mất cả lề ngang; cần xác nhận computed style ở bước sửa. Footer còn có nền alpha và wrapper trong suốt. Sửa app-owned wrapper và cách dùng inset đúng ngữ cảnh, tránh chỉnh runtime được bảo vệ.

### 5. Màn bài tập và nội dung minh bạch

Giữ hero, preview động tác và lựa chọn nhẹ hơn. Chuyển “Dành riêng cho bạn” thành “Một buổi mẫu để bạn thử” trong nhánh khách chưa có cơ sở cá nhân hóa. Đưa nhãn “Nội dung mẫu” cạnh thông tin buổi tập; không đẩy thông tin này xuống dưới action. Nội dung hỗ trợ quyết định phải cuộn lên được. Header hiển thị tên màn hoặc bước; tên thương hiệu có thể nhỏ hơn, tránh chiếm vị trí định hướng ở mọi màn.

## Cơ sở tham khảo

- NN/g mô tả “illusion of completeness”: ảnh lớn cộng CTA nổi bật khiến người dùng nghĩ trang đã hết. Áp dụng bằng cách tổ chức lại thông tin và làm rõ phần tiếp nối, không chỉ thêm mũi tên cuộn. [Nghiên cứu NN/g](https://www.nngroup.com/articles/illusion-of-completeness/).
- GOV.UK dùng question pages để tập trung vào một nhiệm vụ/câu hỏi. MCY có thể áp dụng hai bước check-in ngắn; không cần chia từng chip thành một màn. [Question pages](https://design-system.service.gov.uk/patterns/question-pages/).
- WCAG 2.2 đề cập focus không bị nội dung do tác giả tạo che hoàn toàn; với MCY nên đặt tiêu chí mạnh hơn: control có focus nhìn thấy đầy đủ phía trên footer. [Focus not obscured](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html). Mức tối thiểu target của WCAG AA là 24 CSS px hoặc các ngoại lệ khoảng cách; mục tiêu 44–48 cho sản phẩm là lớn hơn mức đó. [Target size](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html).

## Kế hoạch sau review

1. Chốt sơ đồ hai bước và hành vi từng loại bỏ qua; quyết định giữ auth gate hay cho khách xem hội thoại mẫu cục bộ. Đầu ra: state/route map, copy, quy tắc giữ nháp và consent.
2. Làm mockup cùng một hướng thương hiệu: chào, cơ thể, năng lượng/thời gian, trò chuyện, kế hoạch; kèm màn thấp/chữ lớn, sheet nhập liệu và lỗi footer. Đầu ra để duyệt trước code.
3. Sau khi được yêu cầu triển khai: sửa font, icon và wrapper footer dùng chung trước; tách flow và chuẩn hóa nhãn sau. App UI trong Prototype.tsx/prototype.css, icon platform ở asset tương ứng; không sửa protected runtime nếu chưa có yêu cầu rõ.
4. Kiểm tra iPhone/Pixel, Android native, portrait/landscape, 320 CSS px, phóng chữ 200%, bàn phím mở/đóng, vùng đã chọn/chưa chọn, không khó chịu/chưa rõ/bỏ qua, lỗi đồng bộ. Chỉ kiểm tra iPhone thật khi có môi trường, không gọi simulator web là kiểm thử native.
5. Usability review với khoảng 5–7 người mục tiêu: yêu cầu chọn vai, thêm ghi chú, đổi thời gian, bỏ qua cơ thể, xem mẫu, quay lại sửa. Quan sát họ có biết bước tiếp theo và phân biệt bỏ qua với không khó chịu hay không. Đo task completion, nhầm đường đi, thao tác quay lại và thời gian; không đưa ra phần trăm cải thiện trước khi có dữ liệu.

Tiêu chí nghiệm thu: icon Khoảng mở đúng master; dấu tiếng Việt không tách/cắt; không có chữ lộ dưới footer; lề hai bên nhất quán; control cuối có thể cuộn lên đầy đủ; một hành động chính mỗi bước; back giữ nháp; mọi loại skip có điểm đến rõ; dữ liệu thiếu không trở thành kết quả tốt; runtime check vẫn đạt.

## Ảnh kiểm tra bản hiện tại

Các ảnh dưới là hiện trạng, không phải mockup đề xuất.

![Bước 1 — Chào](D:/Projects/MCY/analyse/uiux-audit-2026-09-26/01-welcome.png)

![Bước 2 — Check-in iPhone](C:/Users/Admin/.codex/visualizations/2026/09/26/01a0dea2-f215-76a1-ba93-3620be6788b4/mcy-checkin-iphone.png)

![Bước 3 — Check-in sau cuộn](C:/Users/Admin/.codex/visualizations/2026/09/26/01a0dea2-f215-76a1-ba93-3620be6788b4/mcy-checkin-scrolled.png)

![Bước 4 — Kế hoạch iPhone](C:/Users/Admin/.codex/visualizations/2026/09/26/01a0dea2-f215-76a1-ba93-3620be6788b4/mcy-plan-iphone.png)

![Đối chiếu kế hoạch Pixel](C:/Users/Admin/.codex/visualizations/2026/09/26/01a0dea2-f215-76a1-ba93-3620be6788b4/mcy-plan-pixel.png)

![Đối chiếu check-in Pixel, giữ vị trí cuộn khi quay lại](C:/Users/Admin/.codex/visualizations/2026/09/26/01a0dea2-f215-76a1-ba93-3620be6788b4/mcy-checkin-pixel.png)
