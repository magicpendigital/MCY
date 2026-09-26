# 01 · Chiến lược kinh doanh và thương hiệu

**Một chút Yoga / A little Yoga · Bản đề xuất 0.1 · 24/09/2026 · Chờ review, chưa phê duyệt triển khai.**

## 1. Kết luận điều hành

MCY nên phát triển thành **dịch vụ học và duy trì yoga có giáo viên chịu trách nhiệm về nội dung, được phần mềm và AI hỗ trợ**. Sản phẩm cần giúp người học biết tập gì, thực hiện được, và quay lại; doanh thu phải gắn với quyền lợi cụ thể mà một người sáng lập có khả năng cung cấp.

Đề xuất ra mắt cuối 2026–đầu 2027: một khóa nền tảng tiếng Việt, một trải nghiệm web dùng tốt trên điện thoại và máy tính, một tài khoản dùng xuyên nền tảng, cùng quy trình thanh toán/hỗ trợ đáng tin. Mobile iOS/Android nằm trong kiến trúc mục tiêu, mở theo bằng chứng và nguồn lực. Không hứa ba sản phẩm hoàn chỉnh, camera AI và thuê bao tự động cùng lúc trong khoảng ba tháng.

Đây là thay đổi về thứ tự đầu tư, không thu hẹp tầm nhìn đa nền tảng. Nếu đến hạn web riêng chưa đạt yêu cầu, vẫn có thể bán khóa bằng công cụ học trực tuyến sẵn có đã thẩm định và vận hành thủ công có kiểm soát. Không cần chờ ứng dụng riêng hoàn chỉnh mới bắt đầu kinh doanh.

## 2. Những gì đã biết và chưa biết

| Loại | Căn cứ | Hàm ý |
|---|---|---|
| Người dùng xác nhận | Việt Nam trước; thị trường tiếng Anh sau | Ra mắt tiếng Việt, chuẩn bị cấu trúc bản địa hóa |
| Người dùng xác nhận | Một người; TikTok khoảng 1.000 followers, bắt đầu có tương tác | Nguồn lực vận hành là giới hạn thiết kế; followers chưa chứng minh sức mua |
| Người dùng xác nhận | Hai lớp online: một karma/cộng đồng, một thu phí | Có nơi quan sát hành vi thật; chưa biết số học viên, doanh thu, lịch và tỷ lệ quay lại |
| Người dùng xác nhận | Muốn bán cuối 2026–đầu 2027; ưu tiên kênh miễn phí | Ưu tiên doanh thu khóa học và marketing organic; vẫn dự trù hạ tầng/chuyên môn |
| Đã đọc trong repo | README, toàn bộ báo cáo HTML, AGENTS, package, design QA và phần source liên quan | Prototype React/Vite có 9 route; không phải app mobile native đã xuất bản |
| Chưa xác minh | Năng lực kỹ thuật của founder, thời gian/tuần, video có bản quyền, tư cách kinh doanh, chứng chỉ/phạm vi chuyên môn | Chưa thể báo lịch, chi phí hay mức an toàn như đã chắc chắn |
| Giả định làm kế hoạch | Khách hàng trưởng thành; mục tiêu vận động và học yoga thông thường | Thai kỳ, phục hồi chấn thương, trẻ em và điều trị bệnh cần chương trình riêng |
| Giả định làm kế hoạch | AI ban đầu ở mức văn bản, phạm vi hẹp; chưa chốt giọng nói/camera | Thiết kế đường mở rộng nhưng không cộng chi phí đó vào launch |

Các giá, tỷ lệ, số học viên, giờ công và ngân sách dưới đây là **kịch bản để quyết định**, không phải dự báo doanh số, báo giá nhà cung cấp hay kết quả khảo sát. Nghiên cứu bàn giấy không thay thế dữ liệu của hai lớp hiện có.

## 3. Phản biện báo cáo ban đầu

| Nội dung cũ | Đánh giá | Điều chỉnh đề xuất |
|---|---|---|
| Check-in → tập → phản hồi → điều chỉnh | Giữ, nhưng không bắt mọi người nhập mỗi ngày | Có đường vào thẳng bài đang học; chỉ hỏi phần thực sự cần |
| Tách lời giáo viên và AI | Giữ bắt buộc | Tách nguồn dữ liệu, quyền gửi, nhãn hiển thị và trách nhiệm |
| Khóa giáo viên + thuê bao AI | Tách quyền là đúng; tách thành hai sản phẩm trả tiền ngay chưa có bằng chứng | Khóa là sản phẩm đầu; AI cơ bản có thể nằm trong khóa; thuê bao tự tập chỉ mở sau |
| 12–18 buổi, 20–25 động tác, nhiều lộ trình | Có thể quá tải cho một người vừa dạy, quay, marketing, vận hành | Launch 1 khóa gồm 6–8 bài chính, 2–3 bài mẫu, FAQ; tái sử dụng có chủ đích |
| 24 màn và beta 80–120 người | Là bản đồ mục tiêu, chưa phải backlog vừa sức | Mỗi giai đoạn chỉ mở các lát cắt cần thiết; pilot 10–15, rồi 20–30 nếu công suất cho phép |
| Web trước, native sau | Phù hợp nguồn lực, cần rõ đây là đề xuất | Giữ web là kênh học lâu dài; native phải dùng chung quyền và dữ liệu |
| Giữ prototype/framework hiện có | Giữ để nghiên cứu giao diện | Production cần quyết định riêng; không coi khung điện thoại mô phỏng là kiến trúc mobile thật |
| Chủ yếu hướng cổ/vai/lưng | Dễ bị hiểu thành chữa đau | Định vị theo hoàn cảnh sử dụng và kỹ năng học; nội dung sức khỏe phải được rà |
| Nhiều file handoff được nhắc trong report | Thư mục analyse hiện chỉ có report HTML gốc | Không yêu cầu agent đọc những file chưa tồn tại; tạo đặc tả được duyệt theo giai đoạn |

## 4. Khách hàng và lý do mua

**Nhóm đầu:** người trưởng thành đang biết hoặc có thể tin giáo viên MCY, mới tập/quay lại, muốn học tại nhà nhưng khó chọn bài và duy trì. Tuyển mẫu theo hành vi và hoàn cảnh, không khóa sản phẩm vào một giới hay tuổi cụ thể.

**Việc khách muốn hoàn thành:** “Tôi có một khoảng thời gian ngắn; tôi muốn biết nên làm gì và theo được hướng dẫn, rồi hiểu bước tiếp theo mà không phải tự tìm giữa nhiều video.”

Ba nhóm kiểm chứng riêng: học viên trả phí hiện tại; người theo dõi nhưng chưa mua; người chưa biết giáo viên. Không gộp người học thân quen với khách mới để suy khả năng mở rộng.

| Giải pháp thay thế | Bằng chứng công khai | MCY cần tạo thêm giá trị gì? |
|---|---|---|
| Video/chương trình miễn phí | Yoga With Adriene có hành trình 30 ngày miễn phí [R01] | Hướng dẫn tiếng Việt, giáo trình phù hợp nhóm đầu, trả lời có phạm vi, tiến độ liên tục |
| App cá nhân hóa | Down Dog công bố tùy biến buổi tập, offline và dùng nhiều thiết bị [R02] | Không gọi cá nhân hóa là độc nhất; kiểm chứng chất lượng hướng dẫn và quan hệ giáo viên |
| Thư viện lớn | Glo công bố lớp và chương trình nhiều cấp độ [R03] | Không đua số video; ít nội dung nhưng biết bắt đầu và tiếp tục ở đâu |
| Lớp online hiện có của MCY | Thông tin founder cung cấp | Giảm việc gửi link, nhắc riêng, tìm video và trả lời câu hỏi lặp lại |

Khác biệt dự kiến: **giáo trình nhỏ dễ theo + linh hoạt theo hôm nay + người chịu trách nhiệm + AI có căn cứ + quyền kiểm soát tiền và dữ liệu**. Đây là giả thuyết định vị, cần được chứng minh bằng mua thật và sử dụng lại.

## 5. Kiến trúc sản phẩm thương mại

| Đề nghị | Quyền lợi dự kiến | Giới hạn phải nói rõ | Thời điểm |
|---|---|---|---|
| Lớp karma | Lớp cộng đồng theo lịch và khả năng hiện tại | Không mặc định tư vấn riêng hoặc hỗ trợ không giới hạn | Tiếp tục độc lập |
| Trải nghiệm miễn phí | 2–3 bài mẫu, giới thiệu phương pháp, lưu tiến độ cơ bản | Không quảng cáo mọi bài đều miễn phí | Launch |
| Khóa nền tảng | 6–8 bài theo thứ tự; ví dụ truy cập 90 ngày; 4 tuần hỗ trợ; 2 mốc phản hồi | Thời hạn xem và thời hạn hỗ trợ khác nhau; không hứa “trọn đời” | Sản phẩm đầu |
| Học tiếp/tự tập | Thư viện đang phát triển, kế hoạch linh hoạt, hỗ trợ AI có kiểm soát | Không mặc định có giáo viên đọc nhật ký; giới hạn AI minh bạch | Sau 2–3 cohort |
| Gói có giáo viên nhiều hơn | Số buổi/mốc/câu hỏi cụ thể, quota theo công suất | Hết chỗ thì chờ; không thay người bằng AI gắn tên giáo viên | Khi đo được công suất |
| Tiếng Anh | Một khóa được biên tập lại cho một thị trường | Không chỉ dịch UI; phải hỗ trợ, thanh toán, quyền nội dung và pháp lý | Sau bằng chứng VN |

Không tự chuyển lớp karma thành phễu bắt buộc bán hàng. Lời mời mua là tùy chọn; không lấy nội dung chia sẻ riêng trong lớp để quảng cáo. Quyền học của học viên đã đóng tiền được nhập có đối soát; không yêu cầu mua lại để dùng app.

AI có thể mang lại ba lợi ích: giải thích bài đang học từ tài liệu đã duyệt; chọn trong các buổi hợp lệ; giúp nhìn lại thói quen dựa trên dữ liệu thật. Chỉ thu tiền riêng nếu khách nhận ra và tiếp tục trả cho giá trị này. Không bán phần thống kê số buổi cơ bản dưới nhãn “AI cao cấp”.

## 6. Giá, chi phí và công suất

Chưa đủ dữ liệu để chốt giá. Trước hết ghi giá lớp hiện tại, thời lượng hỗ trợ, số người mua/lặp lại, lý do từ chối và mức công việc thực. Sau đó thử một gói rõ quyền lợi; với mẫu nhỏ nên dùng các cohort tuần tự, công bố giá từng đợt, không gọi là A/B có ý nghĩa thống kê.

**Ví dụ tính một khóa giá 599.000đ, hoàn toàn là giả định:** sau thuế, phí và hoàn tiền giả định còn 90% = 539.100đ; chi phí hỗ trợ riêng 60.000đ/người, video/hạ tầng biến đổi 10.000đ/người → đóng góp 469.100đ/người trước chi phí chung của cohort, quay dựng và phát triển.

Giả sử 2,4 triệu đồng công dạy/chuẩn bị chung cho cohort và 0,6 triệu đồng vận hành phân bổ: cần ceil(3.000.000 / 469.100) = **7 học viên** để bù các chi phí vừa nêu. Không bao gồm vốn đầu tư ban đầu. Với 10 người: thu tiền gộp 5.990.000đ; đóng góp sau các giả định trên 1.691.000đ. Với 15 người: 8.985.000đ và 4.036.500đ. Phải thay tỷ lệ 90% bằng cơ cấu thuế/phí/refund thật từng kênh; đây không phải thu nhập bảo đảm.

| Số người mua/cohort | 5 | 10 | 15 |
|---|---|---|---|
| Thu gộp ở giá giả định 599.000đ | 2.995.000đ | 5.990.000đ | 8.985.000đ |
| Đóng góp sau 3 triệu chi phí cohort nói trên | −654.500đ | 1.691.000đ | 4.036.500đ |

Khấu hao nội dung ban đầu phải theo dõi riêng để tránh tưởng khóa đã có lãi đầy đủ. Ví dụ thêm 6 triệu chi phí quay/biên tập thì số dư lũy kế phải bù cả khoản đó. Tiền ứng trước cho khóa chưa dạy là nghĩa vụ phải cung cấp dịch vụ; không tiêu toàn bộ rồi không còn tiền hoàn.

**Công suất:** nếu dành được 3 giờ/tuần cho phản hồi cá nhân, chỉ phân bổ 70%, và cần trung bình 8 phút/học viên/tuần thì trần là floor(180 × 0,7 / 8) = 15 học viên. Nếu thực tế cần 15 phút thì chỉ còn 8. Thời gian dạy live, chuẩn bị, bán hàng và xử lý sự cố phải tính riêng. Số chỗ bán phải lấy giá trị nhỏ hơn giữa nhu cầu và công suất.

Đề nghị SLA thử: trả lời trong 2 ngày làm việc, có khung giờ/ngày nghỉ công bố. Đây là lựa chọn dịch vụ để review; không phải trực 24/7, không phải kênh cấp cứu. Khi founder nghỉ, ngừng nhận thêm hoặc có người thay đủ năng lực và được cấp quyền đúng phạm vi.

**Ngân sách:** ưu tiên 0đ quảng cáo trong giai đoạn đầu; dùng thiết bị quay và phần mềm sẵn có nếu quyền sử dụng phù hợp. Đặt trần tiền mặt hạ tầng thử 0,5–1,5 triệu/tháng để lập kế hoạch, không coi đó là giá thị trường. Domain, email, video, backup, payment, store account, hỗ trợ kỹ thuật và thẩm định đều phải có báo giá trước cam kết. Tính cả giờ founder; kênh miễn phí vẫn tốn thời gian.

Nếu không thể chi cho kiểm tra kỹ thuật khi nhận tiền và dữ liệu nhạy cảm, giảm phạm vi custom: dùng nền tảng học đã được đánh giá, giảm thu dữ liệu, chưa bật AI cá nhân hóa. Coding Agent không thay được người chịu trách nhiệm vận hành.

## 7. Bộ nền tảng thương hiệu

**Định vị đề xuất:** “Một chút Yoga — học từng bước, tập theo nhịp của bạn.” Lời hứa là trải nghiệm học rõ ràng, có thể bắt đầu và tiếp tục; không bảo đảm kết quả sức khỏe.

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

**Concept: “Một khoảng nghỉ có hướng dẫn”.** Trang Hôm nay có một việc chính; thư viện có cấu trúc; thẻ phản hồi như một lời nhắn thật, hiển thị nguồn bằng chữ. Không biến toàn bộ ứng dụng thành thiệp trang trí: player, giá, trạng thái tiền, lỗi và quyền dữ liệu cần chữ dễ đọc, hành động dứt khoát.

Bộ bàn giao nhận diện tương lai: logo ngang/dọc/đơn sắc, vùng an toàn và kích thước tối thiểu; app icon; token màu/chữ/spacing/radius/elevation; 8–12 component nền; template TikTok/thumbnail/email/course cover; guideline ảnh/giọng văn; ví dụ trạng thái lỗi và safety; danh mục quyền sử dụng tài sản. Không cần brand book dài trước khi khóa đầu có người mua.

## 8. Kế hoạch marketing phù hợp một người

Phễu ưu tiên: **TikTok → trang giới thiệu gắn đúng nội dung nguồn → bài mẫu → lưu tiến độ/liên hệ tự nguyện → khóa có lịch và quyền lợi rõ → học → mời học tiếp/giới thiệu bạn bè**. Không lấy 1.000 followers nhân một tỷ lệ chuyển đổi tưởng tượng để dự báo doanh thu.

| Nhịp tuần đề xuất | Nội dung | CTA và đo lường |
|---|---|---|
| 1 nội dung hướng dẫn ngắn | Một khó khăn khi mới học, một cue dễ hiểu đã rà | Thử bài mẫu có liên quan; đo lượt vào và bắt đầu bài |
| 1 nội dung giải thích | Tập ít có ích gì trong việc xây thói quen; cách chọn mức phù hợp | Xem phương pháp/giáo trình; không hứa hiệu quả y tế |
| 1 nội dung giáo viên/khóa | Cách buổi học diễn ra, ai phù hợp, người dạy | Xem khóa; phản hồi học viên chỉ dùng khi có phép |
| 1 lần trả lời FAQ theo nhóm | Từ câu hỏi thật, khử định danh | Giảm hỏi riêng; không công khai sức khỏe học viên |
| 1 khối 30 phút | Xem funnel và quyết định chủ đề tuần sau | Không chạy theo views nếu không dẫn tới học thử |

Tái sử dụng có biên tập cho Shorts/Reels khi không tăng gánh vận hành đáng kể. Email là kênh sở hữu ưu tiên; Zalo tùy sở thích học viên và năng lực quản lý, không tự động hóa đa kênh ngay. Không scrape followers, tự inbox hàng loạt hay thêm người lớp karma vào danh sách quảng cáo.

Onboarding marketing: gửi tài liệu đã xin → gợi ý bài đầu nếu chưa học → hỏi có vướng mắc → giới thiệu khóa khi phù hợp. Mỗi tin có mục đích, opt-out, giới hạn tần suất. Tin giao dịch (biên nhận, lịch học thay đổi) tách tin quảng cáo. Khi có cờ tạm dừng do khó chịu, dừng nhắc tập/upsell; marketing không cần biết chi tiết lý do.

SEO chỉ làm khi có nội dung gốc tốt: trang khóa, hồ sơ giáo viên, 5–10 bài trả lời câu hỏi phổ biến đã được rà; không sản xuất hàng trăm bài AI về bệnh lý. Giới thiệu bạn bè sau trải nghiệm có giá trị, quyền lợi nhỏ rõ ràng và chống lạm dụng; chưa xây hệ thống affiliate phức tạp.

## 9. Nghiên cứu tối thiểu để bác bỏ giả thuyết

Trong 2 tuần đầu: 8–12 cuộc trò chuyện ngắn (học viên có trả phí, người karma, follower chưa mua và người lạ); 5–6 buổi quan sát thử prototype; kiểm kê toàn bộ câu hỏi và điểm bỏ cuộc trong hai lớp. Xin phép trước khi ghi âm/ghi hình; không thu hồ sơ bệnh án.

Tác vụ nghiên cứu: tìm bài đầu khi chỉ có 10 phút; hiểu mình mua gì; tìm cách dừng; hiểu khác nhau giữa AI và giáo viên; tìm cách hủy và xem trên thiết bị khác. Hỏi hành vi và khoản tiền đã chi gần nhất, không chỉ hỏi “có thích app AI không”.

Nếu học viên muốn theo giáo viên nhiều hơn tự tập: ưu tiên công cụ hỗ trợ lớp. Nếu muốn tự tập nhưng không mua: thử cấu trúc khóa và lý do tin tưởng trước chatbot. Nếu bài mẫu khó theo: sửa nội dung và player trước marketing. Nếu khách mua nhưng founder quá tải: giảm số chỗ/giảm lời hứa hỗ trợ hoặc tăng giá hợp lý, không tự động giả lập phản hồi con người.

## 10. Nguồn đối chiếu

[R01 · Yoga With Adriene — hành trình miễn phí](https://do.yogawithadriene.com/30-days-of-yoga). [R02 · Down Dog — tính năng công bố](https://www.downdogapp.com/download). [R03 · Glo — chương trình](https://www.glo.com/programs). Truy cập 24/09/2026; chỉ xác nhận công bố sản phẩm, không xác minh hiệu quả hay doanh số.

Nguồn nội bộ: README.md, analyse/MCY_MVP_Report.html, AGENTS.md, design-qa.md, package.json và source đã đọc tại workspace; thông tin nguồn lực do founder cung cấp trong phiên này. Không lặp lại các con số thị trường của báo cáo cũ như bằng chứng mới.
