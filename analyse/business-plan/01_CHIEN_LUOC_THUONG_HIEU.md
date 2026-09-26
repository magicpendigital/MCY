# 01 · Chiến lược kinh doanh và thương hiệu

**Một chút Yoga / A little Yoga · Bản đề xuất 0.2 · 24/09/2026 · Cập nhật theo định hướng founder; chưa phê duyệt triển khai.**

## 1. Quyết định trung tâm và điều chỉnh so với bản 0.1

MCY là **dịch vụ hướng dẫn thực hành yoga theo hoàn cảnh hôm nay, bằng nội dung của giáo viên và AI có khả năng trao đổi, chọn bài, sử dụng phản hồi cho lần tiếp theo**. Câu hỏi chính người dùng cần giải quyết là: “Hôm nay nên tập gì, tập như thế nào và tiếp tục ra sao?”

**Một buổi tập vừa sức hôm nay → một phản hồi trung thực → một lựa chọn phù hợp hơn cho lần tiếp theo.** Đây là giá trị cần kiểm chứng, chưa phải kết quả sản phẩm đã đạt được.

Founder đã chọn vòng lặp **check-in → trao đổi với AI → kế hoạch hôm nay → thực hành → phản hồi → điều chỉnh lần sau** và cho phép lấy prototype hiện tại làm nền phát triển tiếp. Bản 0.1 đã nghiêng quá nhiều về khóa học làm sản phẩm đầu và trì hoãn AI; bản này thay đổi thứ tự đó. Khóa học, thư viện và lớp giáo viên trở thành các lớp nội dung/dịch vụ hỗ trợ. Người mới không phải hiểu danh mục khóa học trước khi có buổi tập đầu.

Đề xuất ra mắt: web dùng tốt trên điện thoại, một danh mục nhỏ các buổi tập được duyệt, AI text thực sự tham gia lựa chọn và giải thích, lịch sử/feedback dùng được cho lần sau, quyền lợi trả phí rõ. Native cùng backend phát triển theo bằng chứng. Giảm phạm vi bằng cách hoãn camera, voice, cộng đồng, CMS lớn và nhiều gói hỗ trợ; **không bỏ AI khỏi giá trị cốt lõi rồi vẫn gọi đó là cùng một sản phẩm**.

Bản 0.1 được lưu tại archive/v0.1 để đối chiếu, không còn là hướng ưu tiên. Các giá, lượng nội dung, lịch và ngưỡng trong 0.2 vẫn là đề xuất cần review.

## 2. Những gì đã biết và chưa biết

| Trạng thái | Căn cứ | Hàm ý |
|---|---|---|
| Founder xác nhận | Việt Nam trước, thị trường tiếng Anh sau | Tiếng Việt trước; chuẩn bị locale và timezone |
| Founder xác nhận | Một người, TikTok khoảng 1.000 followers, hai lớp online karma và thu phí | Thiết kế để vận hành ít người; followers chưa chứng minh sức mua |
| Founder xác nhận | Mục tiêu bán cuối 2026–đầu 2027; ít ngân sách trả phí | Pilot nhỏ, marketing organic; vẫn cần tính hạ tầng, AI API, thẩm định và giờ công |
| Founder xác nhận | Check-in và trao đổi với AI là điểm vào chính | AI chọn buổi tập thuộc MVP; chatbot tự do không phải điều hướng chính |
| Founder xác nhận | Phát triển tiếp từ prototype hiện tại | Giữ cơ sở thiết kế và runtime; không đồng nghĩa prototype đã là hệ thống production |
| Đã đọc trong repo | README, báo cáo gốc, AGENTS, source và tài liệu QA liên quan | 9 route prototype; thiếu cuộc trao đổi trước buổi và cơ chế dùng feedback lần sau |
| Giả định đề xuất | Nhóm đầu là người trưởng thành mới tập/quay lại, mục tiêu vận động thông thường | Không hứa chương trình điều trị, thai kỳ, phục hồi hoặc trẻ em khi chưa có chuyên môn/nội dung riêng |
| Chưa rõ | Giờ founder mỗi tuần, số học viên/giá lớp, nội dung có quyền sử dụng, reviewer, ngân sách tiền mặt | Chưa thể chốt thời gian hoàn thành, giá bán hay chi phí sản xuất |
| Chưa chốt | Loại model, stack, payment, gói 30 ngày, số video và quyền lợi giáo viên | Không coi việc đồng ý hướng AI là duyệt mọi lựa chọn kỹ thuật/thương mại |

## 3. Khác biệt cạnh tranh cần chứng minh

Giả thuyết của founder hợp lý ở điểm không đua số lượng video. Tuy nhiên, **AI không tự làm một danh mục ít nội dung trở nên đủ dùng**, cũng không tự tạo khác biệt bền vững. Down Dog đã công bố tùy biến theo thời gian, mức độ và trọng tâm; Glo có nhiều chương trình theo nhu cầu. Các công bố này cho thấy MCY cần kiểm chứng cụ thể hơn chữ “cá nhân hóa”. [R02](https://www.downdogapp.com/), [R03](https://www.glo.com/programs).

| Lợi thế dự kiến của MCY | Biểu hiện người học nhìn thấy | Cách bác bỏ |
|---|---|---|
| Hiểu hoàn cảnh qua tiếng Việt tự nhiên | “Hôm nay bận, không muốn nằm sàn” được chuyển thành lựa chọn cụ thể | Nếu form 3 nút cho kết quả dễ hơn và tương đương, hội thoại chưa tạo giá trị tăng thêm |
| Nhớ đúng phản hồi đã được cho phép | “Lần trước bạn nói nhịp hơi nhanh; lần này ưu tiên bài chậm hơn” có dẫn về phản hồi thật | Nếu giải thích chung chung hoặc lựa chọn không thay đổi hợp lý, vòng lặp chưa hoạt động |
| Nội dung nhất quán của một giáo viên | Giọng, cue, tốc độ và phương pháp liên tục | Nếu ít bài không đủ hoàn cảnh thường gặp, phải bổ sung nội dung hoặc thu hẹp lời hứa |
| Ít công sức chọn bài | Một đề xuất rõ + một lựa chọn thay thế phù hợp | Nếu trao đổi lâu hơn tìm video và không tăng sự tự tin, phải rút gọn |
| Quan hệ tin cậy, quyền kiểm soát | Biết người nào chịu trách nhiệm; sửa/xóa điều AI nhớ; phản hồi không bị phán xét | Nếu người dùng tưởng AI đã quan sát cơ thể hoặc giáo viên đọc mọi note, thiết kế thất bại |

Lợi thế có thể tích lũy là chất lượng phương pháp chọn bài, metadata nội dung, hiểu ngôn ngữ người học và quy trình dùng feedback có căn cứ. Không lấy việc tích trữ nhật ký nhạy cảm hay khóa người dùng vào dữ liệu làm lợi thế. Có thể học từ thống kê phù hợp mục đích và phản hồi được phép, không tự đem dữ liệu riêng huấn luyện model.

## 4. Nhóm đầu và công việc sản phẩm phải hoàn thành

Nhóm đầu: người trưởng thành mới tập/quay lại, có lúc muốn tập ở nhà nhưng khó chọn, thời gian và năng lượng không đều, thích cách hướng dẫn của giáo viên MCY. Tuyển cả học viên quen, follower chưa mua và người chưa biết giáo viên; phân tích riêng để tránh nhầm niềm tin sẵn có với sức hút của sản phẩm.

Ba công việc: **trước buổi** giảm phân vân; **trong buổi** theo được hướng dẫn và có quyền dừng/đổi; **giữa các buổi** biết tại sao hôm nay tiếp tục hoặc điều chỉnh. “Một chút” có thể là một buổi ngắn hoặc một ngày nghỉ hợp lý, không ép streak hằng ngày.

Giải pháp thay thế không chỉ là app: mở lại video quen, YouTube miễn phí, đi lớp, hỏi giáo viên qua tin nhắn hoặc bỏ tập. Cần hỏi về hành vi gần nhất và khoản tiền thật đã chi; chưa có dữ liệu đủ để kết luận toàn thị trường bão hòa hoặc AI sẽ thắng.

Không chọn nhóm “người đau cổ/lưng cần chữa” làm phân khúc mặc định. Có thể hỏi vùng muốn chú ý trong phạm vi nội dung phù hợp, nhưng không biến điểm chạm trên body map thành chẩn đoán hoặc hứa điều trị.

## 5. Mô hình thương mại theo vòng lặp

| Lớp sản phẩm | Giá trị/quyền lợi dự kiến | Giới hạn | Giai đoạn |
|---|---|---|---|
| Trải nghiệm mẫu | Buổi mẫu; khi đồng ý dùng AI thì trải nghiệm thật từ check-in đến feedback và lần quay lại | Cần đủ ít nhất hai lần sử dụng để thấy điều chỉnh; hạn dùng/quota phải công khai | Pilot |
| Đồng hành tự tập MCY | Quyền dùng vòng lặp AI + các buổi trong danh mục + lịch sử và kiểm soát dữ liệu | Không giáo viên đọc mỗi note, không sửa tư thế qua camera, không AI vô hạn | Sản phẩm trả phí đầu đề xuất |
| Gói 30 ngày trả một lần | Cách thử willingness-to-pay và dùng tiếp, chưa tự gia hạn | Đây là cấu trúc thu tiền đề xuất, không giá/chính sách đã chốt | Cuối 2026–đầu 2027 nếu qua gate |
| Học cùng giáo viên | Lớp hiện tại hoặc số lần phản hồi có lịch/công suất rõ | Quyền con người tách quyền AI; không giả tên giáo viên | Duy trì/add-on theo năng lực |
| Khóa kỹ năng | Nội dung nền có thứ tự khi người học cần học sâu hơn | Hỗ trợ vòng lặp, không bắt mọi người mua khóa trước khi tự tập | Theo nhu cầu thật |
| Thuê bao tự gia hạn | Tiếp tục dịch vụ theo chu kỳ minh bạch | Chỉ sau khi hiểu giá trị lặp lại, cancellation và economics | Sau pilot trả phí |
| Karma/cộng đồng | Lớp cộng đồng hiện có | Không bắt buộc vào phễu trả tiền hoặc chia sẻ dữ liệu | Tiếp tục độc lập |

“Bán nội dung của tôi” vẫn được đáp ứng: người học trả cho quyền tiếp cận nội dung ấy được hướng dẫn và lựa chọn có ích theo thời gian. Không cần bán từng khóa như đơn vị doanh thu duy nhất.

Không thu phí để xem hướng dẫn dừng, quản lý dữ liệu, hiểu trạng thái thanh toán hoặc xem lịch sử cơ bản của chính mình. Khi hết quyền AI, nói rõ lựa chọn nào còn dùng được; không xóa ký ức người học để ép gia hạn. Đợt beta miễn phí hay có phí phải nói đúng AI thật, mô phỏng hay người vận hành chọn bài.

## 6. Kinh tế đơn vị và công suất

Chưa chốt giá. Đơn vị phân tích mới là **một người dùng trả phí trong một kỳ 30 ngày**, không phải doanh thu một khóa. Theo dõi cả người không dùng, người dùng nhiều và công hỗ trợ phát sinh.

Công thức: đóng góp/kỳ = tiền thực giữ lại sau thuế/phí/refund − inference AI − media/hạ tầng biến đổi − công hỗ trợ biến đổi. Chi phí cố định tháng, nội dung ban đầu, phát triển và giờ founder còn lại tính riêng. Tái mua kỳ 30 ngày là tín hiệu trả tiền tiếp; không gọi là gia hạn tự động.

**Ví dụ thuần giả định để thử độ nhạy:** giá 149.000đ/30 ngày; phần thực giữ lại giả định 90% = 134.100đ; AI 8.000đ, video/email/khác 7.000đ, hỗ trợ 12.000đ/người → đóng góp 107.100đ. Không số nào là báo giá, thuế suất hay dự báo thực của MCY.

| Người mua trong kỳ | Thu gộp giả định | Đóng góp trước chi phí cố định | Sau 2 triệu chi phí cố định giả định |
|---|---|---|---|
| 10 | 1.490.000đ | 1.071.000đ | −929.000đ |
| 20 | 2.980.000đ | 2.142.000đ | 142.000đ |
| 30 | 4.470.000đ | 3.213.000đ | 1.213.000đ |

Trong ví dụ cần ceil(2.000.000 / 107.100) = 19 người để bù phần chi phí tháng nêu trên; **chưa bù nội dung, phát triển, công sáng lập chưa phân bổ**. Nếu AI tăng từ 8.000 lên 30.000đ thì đóng góp còn 85.100đ và cần 24 người. Mẫu nhỏ có thể âm tiền nhưng vẫn có ích cho kiểm chứng; không lấy đó làm business đã có lãi.

Đo AI cost theo số buổi/kỳ × số lần gọi/buổi × token/giá model thực, cộng retry, evaluation và abuse. Cache chỉ theo đúng người/quyền/phiên bản. Không tính mỗi cuộc chat là một buổi hoặc giả định subscription ChatGPT trả sẵn API cho khách hàng.

Công suất con người vẫn là trần: ví dụ có 180 phút/tuần, chỉ phân bổ 70%, mỗi học viên cần 8 phút thì phục vụ được khoảng 15 người; nếu 15 phút thì còn 8. Với gói tự tập, đo công hỗ trợ và rà AI thực tế thay vì hứa chăm sóc từng người. Gói giáo viên có quota riêng, không tự gộp vào 149.000đ giả định.

Ưu tiên không chạy quảng cáo trả phí ban đầu; đặt trần hạ tầng theo khả năng tiền mặt sau khi có báo giá. Free tier phù hợp thử nhưng phải có đường xử lý hết quota/backup và chi phí nhận tiền thật. Nếu chưa có nguồn lực kiểm kỹ thuật, thử dịch vụ chọn bài do người thực hiện có nhãn minh bạch để học về nhu cầu, đồng thời hoãn bán AI production; đây là phép thử tiền đề, không thay thế chứng minh AI.

## 7. Bộ nền tảng thương hiệu

**Định vị đề xuất:** “Một chút Yoga — biết tập gì hôm nay, tiếp tục theo nhịp của bạn.” Lời hứa là một lựa chọn vừa sức có căn cứ, hướng dẫn rõ và biết cách tiếp tục; không bảo đảm kết quả sức khỏe.

**Tagline ưu tiên thử:** “Một chút mỗi ngày, theo nhịp của bạn.” Phương án phụ: “Bắt đầu nhẹ nhàng. Tiếp tục theo cách của bạn.” Kiểm tra xem chữ “mỗi ngày” có gây áp lực; luôn cho phép ngày nghỉ. Tên tiếng Anh “A little Yoga” là tên làm việc do founder đưa ra, chưa xác minh nhãn hiệu/domain; cần rà trước đầu tư nhận diện quốc tế.

| Thành phần | Hướng đề xuất | Tiêu chí duyệt |
|---|---|---|
| Tính cách | Gần gũi, rõ ràng, có chuyên môn, tôn trọng lựa chọn | Người mới hiểu, không giọng phán xét hoặc hứa chữa lành |
| Từ ngữ | “Thử”, “chọn”, “điều chỉnh”, “theo cảm nhận của bạn” | Không “AI biết cơ thể bạn”, “đúng 100%”, “cam kết hết đau” |
| Logo | Wordmark tiếng Việt rõ dấu; biểu tượng đơn giản gợi nhịp thở/khoảng nghỉ | Đọc ở kích thước nhỏ, đơn sắc, nền sáng/tối; không dùng icon trái tim hiện tại như tài sản độc quyền |
| Màu nền | Ngà #FBF6ED; bề mặt trắng ấm #FFFCF6 | Nền ấm vừa phải, không giảm độ đọc |
| Màu chữ | Xanh đậm #25372D; chữ phụ #59675E | Đo tương phản từng cặp ở kích thước thật |
| CTA | Đất nung đậm thử #91482F | Đề xuất thay sắc nhạt khi chữ trắng chưa đủ tương phản; chưa coi đã QC |
| Màu bổ trợ | Sage #E7EDDF; AI tím rất nhạt | Không dùng màu làm dấu hiệu duy nhất phân biệt người/AI |
| Typography | Serif cho tiêu đề/editorial, sans hỗ trợ tiếng Việt cho UI | Body 16–18px; kiểm tra dấu, font fallback, giấy phép, tăng cỡ chữ |
| Ảnh | Giáo viên thật, bối cảnh nhà ở, nhiều thể trạng, tư thế phù hợp cấp độ | Có giấy đồng ý hình ảnh; không ảnh before/after giả hoặc tư thế sai |
| Motion | Chậm vừa, chỉ hỗ trợ định hướng; có reduced motion | Không chuyển động trang trí lúc tập hoặc khi cần dừng |
| Âm thanh | Giọng hướng dẫn rõ; nhạc tùy chọn, thấp hơn giọng | Bản quyền thương mại rõ, phụ đề và transcript tương ứng |

**Concept: “Một khoảng nghỉ có hướng dẫn”.** Trang Hôm nay có một việc chính: cùng chọn buổi tập; thư viện chỉ là đường tìm chủ động; thẻ phản hồi như một lời nhắn thật, hiển thị nguồn bằng chữ. Không biến toàn bộ ứng dụng thành thiệp trang trí: player, giá, trạng thái tiền, lỗi và quyền dữ liệu cần chữ dễ đọc, hành động dứt khoát.

Bộ bàn giao nhận diện tương lai: logo ngang/dọc/đơn sắc, vùng an toàn và kích thước tối thiểu; app icon; token màu/chữ/spacing/radius/elevation; 8–12 component nền; template TikTok/thumbnail/email/course cover; guideline ảnh/giọng văn; ví dụ trạng thái lỗi và safety; danh mục quyền sử dụng tài sản. Không cần brand book dài trước khi vòng lặp đầu có người dùng quay lại.


## 8. Marketing và onboarding theo lời hứa mới

Phễu ưu tiên: **TikTok nêu một hoàn cảnh → mở “Hôm nay bạn có bao nhiêu thời gian?” → xem cách MCY chọn → thực hành → phản hồi → quay lại thấy lựa chọn có căn cứ → cân nhắc gói đồng hành**. Không bắt người xem đọc danh mục hàng chục khóa.

| Nhịp đề xuất | Nội dung | CTA và tín hiệu |
|---|---|---|
| 1 video/tuần về hoàn cảnh | Có ít thời gian, quay lại sau nghỉ, khó chọn bài | Thử chọn buổi hôm nay; đo vào thử và bắt đầu |
| 1 video/tuần về phương pháp | Vì sao lặp bài có ích cho việc học, cách phản hồi cả khi không thay đổi | Xem một vòng lặp minh họa; không tạo kết quả sức khỏe giả |
| 1 video/tuần về giáo viên/nội dung | Cách ghi hình, cue, chuẩn bị bài phù hợp nhóm đầu | Thử buổi có liên quan; xây niềm tin vào nội dung |
| 1 khối FAQ + xem dữ liệu | Câu hỏi khử định danh, lý do bỏ giữa chừng | Quyết định chủ đề/video hoặc phần UX cần sửa |

Lịch là giả định công suất, có thể giảm còn hai nội dung tốt/tuần. Tái sử dụng có biên tập trên Shorts/Reels; không mở nhiều kênh khó quản lý. Email/liên hệ tự nguyện giúp bớt phụ thuộc TikTok. Không tự thêm người lớp karma vào marketing, scrape followers hoặc gửi tin hàng loạt.

Onboarding chia theo thời điểm: lần đầu chỉ hỏi phần cần chọn buổi; sau khi có giá trị mới mời lưu lịch sử/nhắc tập; trước gửi dữ liệu cho AI phải giải thích và xin quyền phù hợp. Nếu người dùng không đồng ý AI bên thứ ba, vẫn có bài mẫu và lựa chọn nội dung thông thường, nhưng nói rõ không có vòng cá nhân hóa đầy đủ.

Chuỗi giữ liên lạc: gửi đúng tài liệu đã xin → giúp vượt khó khăn vào buổi đầu → mời quay lại vào thời điểm đã chọn → giải thích điều chỉnh từ feedback → giới thiệu gói khi người dùng hiểu giá trị. Dừng nhắc/upsell khi có trạng thái tạm dừng; marketing chỉ cần cờ suppress, không biết nhật ký/sức khỏe. Không tạo cảm giác mắc nợ vì bỏ một ngày.

## 9. Nghiên cứu cần làm và giả thuyết có thể thất bại

8–12 phỏng vấn hành vi, 5–6 quan sát prototype hai lần sử dụng, rồi pilot 10–15 người nếu vận hành nổi. Có người quen và người mới; số lượng là đề xuất phù hợp nguồn lực, không đủ để khẳng định thống kê.

So sánh cùng một danh mục được duyệt: người tự chọn qua bộ lọc hoặc quy tắc cố định với người dùng hội thoại AI. Đo công sức quyết định, độ hiểu kế hoạch, mức phù hợp tự báo cáo, lý do đổi bài, tỷ lệ quay lại và sẵn sàng trả tiền thật. Không A/B các điều kiện an toàn; không lấy chat nhiều làm thành công.

Nếu AI giải thích hay nhưng chọn bài không tốt hơn, cải thiện context/ranking hoặc rút hội thoại. Nếu chọn bài tốt nhưng người học không theo được, sửa nội dung/player. Nếu nội dung không có lựa chọn hợp lệ, bổ sung đúng khoảng trống phổ biến hoặc thu hẹp phân khúc; không để model bịa bài để che thiếu nội dung. Nếu feedback thường bị bỏ qua, đơn giản hóa và học cách làm tốt ngay cả khi thiếu dữ liệu.

Lợi thế chưa được kiểm chứng là khả năng biến phản hồi thành quyết định tiếp theo mà người dùng thấy đúng và hữu ích. Phần 06 mô tả cách thử chính điều đó trên prototype hiện có.

## 10. Nguồn và trạng thái bằng chứng

[R01 · Yoga With Adriene — hành trình miễn phí](https://do.yogawithadriene.com/30-days-of-yoga). [R02 · Down Dog — tính năng công bố](https://www.downdogapp.com/). [R03 · Glo — chương trình](https://www.glo.com/programs). Nguồn chính thức được đối chiếu trong ngày 24/09/2026; công bố sản phẩm không chứng minh hiệu quả, quy mô thị trường hoặc lợi nhuận.

Nguồn nội bộ: README.md, analyse/MCY_MVP_Report.html, AGENTS.md, design-qa.md, package.json và source liên quan; quyết định và nguồn lực founder cung cấp trong phiên. Các chỉ số cạnh tranh trong báo cáo ban đầu không được lặp lại như nghiên cứu mới. Chưa có dữ liệu khách hàng mới hoặc thẩm định chuyên môn riêng cho kế hoạch này.
