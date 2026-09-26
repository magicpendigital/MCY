# 02 · Sản phẩm đa nền tảng, màn hình và hành trình

**Tất cả là đặc tả đề xuất. Storyboard bên dưới là prototype bằng văn bản để review, chưa phải prototype tương tác được triển khai.**

## 1. Phạm vi theo phiên bản

| Phiên bản | Phải có | Chưa cần xây |
|---|---|---|
| V0 · kiểm chứng dịch vụ | Khóa thật, bài mẫu, mô tả giá/quyền, lịch lớp, quy trình nhận tiền/cấp quyền/hoàn tiền, danh sách học viên có kiểm soát | App riêng, AI, dashboard phức tạp |
| V1 · web trả phí | Web responsive; tài khoản; khóa đang học; video/phụ đề; lưu tiến độ; phản hồi tùy chọn; mua/cấp quyền; hỗ trợ; privacy; admin tối thiểu; tracking thiết yếu | Thuê bao tự gia hạn, chat mở, tải offline, camera, mạng xã hội |
| V1.1 · AI hỗ trợ hẹp | Hỏi đáp nội dung đã duyệt, giải thích bài gợi ý, tổng kết có căn cứ; feature flag và fallback | Tự viết giáo trình, tư vấn điều trị, đánh giá tư thế |
| V2 · mobile | iOS/Android dùng chung tài khoản/quyền; push; player thích hợp thiết bị; restore purchase; offline nếu qua spike | Không mặc định mọi API thiết bị đều cần có |
| V3 · mở rộng | Tự tập thuê bao khi chứng minh gia hạn; voice/camera có kiểm chứng riêng; một thị trường tiếng Anh | Không mở tất cả quốc gia cùng lúc |

V1 dùng 6–8 bài chính và 2–3 bài mẫu đủ để bán một khóa. Lớp trực tuyến dùng dịch vụ họp hiện có đã được đánh giá; app quản lý lịch, quyền tham gia và link. Không xây hạ tầng livestream trong giai đoạn đầu. Không mặc định quay lại lớp có mặt học viên; nếu cần recording phải có chính sách và đồng ý phù hợp.

## 2. Ma trận năng lực nền tảng

“Có” bên dưới là mục tiêu phát triển, không xác nhận đã chạy. Test bằng thiết bị/OS/browser thật trước khi quảng bá. Phân biệt website trên mobile, PWA được thêm vào màn hình chính và app cài từ store.

| Năng lực | Web desktop/mobile | App iOS/Android | Fallback và gate |
|---|---|---|---|
| Khóa học, hồ sơ, lịch sử, FAQ, AI text | Có, đồng nhất giá trị cốt lõi | Có | Cùng backend và tài khoản |
| Video, phụ đề, tốc độ, ngang/dọc | Có trên tập browser hỗ trợ | Có | Bản chất lượng thấp, transcript; pause khi không phát được |
| Nhắc tập | Email/in-app; web push phụ thuộc thiết bị/cài đặt | Push khi người dùng cho phép | Không có push vẫn dùng trọn khóa |
| Offline video | Không cam kết lưu bền; lưu trữ browser có thể bị thu hồi | Ưu tiên khi có nhu cầu, vẫn cần quota/giấy phép/hết hạn | Hiển thị đã tải và thời hạn xác thực; không gọi cache tạm là offline chắc chắn |
| Chạy nền/khóa màn hình | Hành vi khác nhau, cần thử | Có thể tích hợp theo OS | Không tự ghi “đang tập” khi media đã dừng |
| Casting/PiP | Tùy browser, DRM và thiết bị | Cần tích hợp và thử | Player thường vẫn đầy đủ; không phụ thuộc PiP để dừng |
| Micro/voice AI | Có thể có với quyền và kết nối | Có thể có; vẫn chịu gián đoạn âm thanh/OS | Text và nút điều khiển luôn tồn tại |
| Camera/pose estimation | Có thể làm được về kỹ thuật, không mặc định đủ tin cậy | Có lợi thế một số API; vẫn phụ thuộc camera/góc/ánh sáng | Camera tắt, tiếp tục bài thường; không “pass tư thế” khi không đủ dữ liệu |
| Thanh toán | Provider phù hợp pháp nhân/thị trường | Chính sách store, loại sản phẩm và vùng phân phối | Một hệ thống quyền; một màn quản lý biết nơi đã mua |
| Hủy/xuất/xóa, hỗ trợ | Có | Có | Không khóa quyền dữ liệu vào nền tảng mua |
| Giáo viên/quản trị | Web desktop là chính, mobile responsive | Không cần đầy đủ native lúc đầu | Link/web console được kiểm quyền |

WebKit mô tả web push trên iOS/iPadOS cho web app thêm vào Home Screen; MDN mô tả giới hạn và khả năng thu hồi lưu trữ browser. Vì vậy phải phát hiện năng lực thực tế, không ghi chung “web không hỗ trợ” hoặc “PWA như native”. [R04](https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/), [R05](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria).

Web giảm một số phụ thuộc xét duyệt store và thuận tiện thử từ TikTok, nhưng vẫn có trách nhiệm dữ liệu, an toàn, thanh toán và bảo vệ người tiêu dùng. Camera AI trên web không ít rủi ro hướng dẫn cơ thể chỉ vì chạy trong browser.

## 3. Kiến trúc ứng dụng đề xuất

Một backend nghiệp vụ, một nguồn sự thật cho danh tính/quyền học, một CMS nội dung; frontend web và mobile có thể chia sẻ domain types, API client, validation và design tokens. Không cần ép 100% UI dùng chung nếu làm giảm chất lượng player, accessibility hay trải nghiệm desktop.

| Lựa chọn | Đánh đổi | Khuyến nghị |
|---|---|---|
| Giữ React/Vite cho web, thêm React Native/Expo cho mobile sau | Web tận dụng kỹ năng hiện tại; có hai lớp UI | Phương án mặc định để đánh giá, chưa chọn framework sản xuất cuối cùng |
| Universal Expo cho web + mobile | Có hỗ trợ web [R06]; cần thử SEO, player, accessibility và SDK thanh toán | Chỉ chọn sau spike nếu tiết kiệm tổng công bảo trì |
| Web wrapper | Dễ tái sử dụng UI, nhưng plugin/player/offline/store review vẫn tốn công | Không xem là đường đảm bảo ra store nhanh |
| Thuê/mua nền tảng khóa học ban đầu | Ít kiểm soát, phụ thuộc nhà cung cấp | Phương án dự phòng thực tế nếu không có năng lực duy trì custom |

[R06 · Expo web documentation](https://docs.expo.dev/workflow/web/) xác nhận khả năng web; không chứng minh phù hợp riêng MCY. Spike phải dùng một video thật, đăng nhập, resume, caption, mạng yếu, checkout sandbox và thiết bị iPhone/Android thật.

Source hiện tại là **phòng thử prototype**. Giữ ranh giới AGENTS hiện hành: app UI trong Prototype.tsx/prototype.css; không tự tách module, sửa mobile runtime hoặc thay framework theo báo cáo này. Để chuyển sang production cần một quyết định kiến trúc riêng về nơi đặt code mới/repo mới và ranh giới chỉnh sửa. Báo cáo trước gợi ý tách file chưa phải quyền làm việc đó.

Backend ban đầu nên là một ứng dụng chia module: identity, catalog, learning, commerce, teaching, consent, messaging và AI gateway. Ưu tiên managed auth + PostgreSQL + object storage/video delivery + tác vụ nền; chưa cần microservices, Kubernetes hay vector database độc lập. Chọn nhà cung cấp bằng tiêu chí hỗ trợ pháp nhân VN, vùng dữ liệu, backup/restore, export, quota, tổng chi phí và khả năng vận hành. Không có nhà cung cấp nào được mặc định đã chọn/cấu hình.

## 4. Quyền mua xuyên nền tảng

Nội dung số và thuê bao fitness phải phân loại đúng khi bán trong app. Apple có quy định khác nhau cho dịch vụ đa nền tảng, reader app và dịch vụ trực tiếp 1:1; khóa video có feedback không tự nhiên thuộc ngoại lệ 1:1. Google yêu cầu Play Billing cho các giao dịch thuộc chính sách, có chương trình/ngoại lệ theo thị trường. Không dùng quy định storefront Mỹ làm mặc định cho Việt Nam. Rà lại phương án trước khi nộp app. [R07 · Apple](https://developer.apple.com/app-store/review/guidelines/), [R08 · Google Payments](https://support.google.com/googleplay/android-developer/answer/9858738?hl=en).

**Thiết kế MCY đề xuất:** cùng một product nội bộ ánh xạ nhiều SKU/kênh; đơn hàng và nguồn mua tách quyền sử dụng. Mua ở web đăng nhập mobile vẫn thấy khóa được cấp hợp lệ. Giá có thể khác theo kênh nhưng không che tổng tiền/thuế/chu kỳ. Trước khi mua hiển thị tài khoản và quyền đã có để giảm trả hai lần.

Màn gói hiển thị: sản phẩm, thời hạn xem, thời hạn hỗ trợ, nơi mua, ngày gia hạn nếu có, nút quản lý phù hợp nguồn mua, khôi phục giao dịch và hỗ trợ. Không hứa nút web có thể hủy mọi thuê bao store. Xóa tài khoản và hủy thuê bao là hai thao tác khác nhau: giải thích và hỗ trợ xử lý cả hai, không âm thầm tiếp tục thu tiền khi người dùng tin đã dừng.

V1 có thể dùng một provider checkout hoặc chuyển khoản đối soát thủ công nếu khối lượng nhỏ. Ảnh chụp chuyển khoản không đủ cấp quyền: kiểm giao dịch thực, số tiền và mã đơn; ghi người đối soát, thời gian, tham chiếu, chống trùng. Chỉ thông báo “đang chờ” cho đến khi xác nhận. Đây là lựa chọn vận hành cần chọn trước pilot, không nhận tiền trong lượt lập kế hoạch này.

Apple yêu cầu minh bạch và xin phép rõ trước khi chia sẻ dữ liệu cá nhân với AI bên thứ ba. Google có yêu cầu về đường xóa tài khoản trong app và tài nguyên web cho app thuộc phạm vi áp dụng. Đưa các luồng này vào checklist submission. [Apple privacy](https://developer.apple.com/app-store/review/guidelines/#privacy), [Google account deletion](https://support.google.com/googleplay/android-developer/answer/13327111?hl=en).

## 5. Bật/tắt tính năng mà không phá quyền lợi

Điều kiện hiệu lực: **phiên bản có hỗ trợ ∧ thiết bị có năng lực ∧ thị trường/chính sách cho phép ∧ quyền sử dụng hợp lệ ∧ consent cần thiết ∧ điều kiện nội dung/an toàn ∧ feature flag**. An toàn và quyền truy cập được kiểm ở server; ẩn nút ở client không đủ.

| Flag | Mặc định | Khi tắt / mất dịch vụ |
|---|---|---|
| ai_content_help | Off đến khi evaluation đạt | FAQ và tài liệu đã duyệt |
| ai_personal_summary | Off | Thống kê thật và lịch sử vẫn có |
| voice_assistant | Off | Text/nút, không thu micro nền |
| camera_coach | Off | Video thường; không ghi lại hình |
| recurring_sales | Off tại launch | Khóa trả một lần; quyền đang mua vẫn xử lý theo hợp đồng |
| offline_downloads | Off đến khi đủ kiểm chứng | Streaming; báo rõ giới hạn |
| new_course_sales | Theo công suất | Chờ đợt sau; học viên cũ giữ quyền |

Mỗi flag có owner, mục đích, nhóm đủ điều kiện, platform/version, ngày hết hạn, phương án tắt, metric và audit. Triển khai internal → nhóm đồng ý beta → cohort nhỏ → mở rộng. Nhóm nhỏ không cần chia phần trăm giả chính xác; dùng danh sách cohort có kiểm soát.

Tắt việc bán mới, tắt inference AI và thu hồi quyền đã mua là ba việc khác nhau. Tính năng trả phí ngừng dài ngày phải có thông báo, gia hạn/bù/hoàn theo điều khoản. Có thể tắt ngay tính năng gây nguy hiểm; sau đó xử lý quyền lợi. Không dùng flag để giấu tính năng với reviewer store hoặc vượt kiểm tra an toàn. Client cũ không hiểu capability mới phải fallback; backend giữ compatibility trong cửa sổ được công bố.

## 6. Sơ đồ thông tin và danh mục màn hình

Điều hướng học viên: **Hôm nay · Khóa học · Hành trình · Tài khoản**. AI đặt trong ngữ cảnh bài/khóa, chưa cần tab chat chiếm trung tâm. Player tách điều hướng bán hàng. Desktop có vùng nội dung rộng hơn/sidebar phù hợp; không đơn thuần phóng to mock điện thoại.

L = launch web; N = nâng cấp; M = khi có app native. Mỗi dòng là màn hoặc nhóm trạng thái, không nhất thiết một route. Mọi màn có loading/empty/error khi liên quan; lỗi luôn có hành động khôi phục.

| ID | Màn / nhiệm vụ | Nội dung và hành động chính | Trạng thái cần thiết | Đợt |
|---|---|---|---|---|
| U01 | Landing từ nội dung | Giáo viên, lợi ích, bài mẫu, khóa, đăng nhập | Nguồn link mất, ảnh lỗi, khách cũ | L |
| U02 | Giới thiệu giáo viên | Kinh nghiệm được xác minh, cách dạy, phạm vi | Không bịa chứng chỉ/testimonial | L |
| U03 | Xem khóa | Ai phù hợp, giáo trình, mẫu, giá, hai thời hạn, SLA | Hết chỗ, chưa mở bán, đã mua | L |
| U04 | Đăng nhập | Phương thức chính, OTP/link, giữ đích đến | Hết hạn, sai tài khoản, gửi quá nhiều, mở tab khác | L |
| U05 | Onboarding | Mục tiêu/kinh nghiệm tối thiểu, có thể sửa | Bỏ câu tùy chọn, người cũ, chưa đủ phạm vi | L |
| U06 | Quyền dữ liệu/phạm vi tập | Mục đích riêng, câu hỏi được duyệt, giới hạn hỗ trợ | Từ chối, rút, cần kiểm tra lại | L |
| U07 | Hôm nay | Tiếp tục khóa hoặc bài mẫu; một CTA chính | Chưa học, đã học, tạm dừng, mới quay lại | L |
| U08 | Check-in ngắn | Thời gian, lựa chọn phù hợp hôm nay; dữ liệu tùy chọn | Không có vùng khó chịu, không trả lời, stale | L tối giản |
| U09 | Chọn/gợi ý bài | Một bài và lý do, đổi bài, không match | Quyền hết hạn, bài gỡ, thiếu dữ liệu | L rules nhỏ |
| U10 | Chuẩn bị | Thời lượng thật, dụng cụ, preview, hướng dẫn dừng | Media lỗi, không có dụng cụ, không đủ điều kiện | L |
| U11 | Player | Video, caption, pause, tua, dừng lớn | Buffer, gọi điện, đổi hướng, nền, hết token | L |
| U12 | Trợ giúp động tác | Clip/cue và biến thể đã duyệt, quay về đúng chỗ | Chưa có biến thể, không thể tải | L cue; N đổi timeline |
| U13 | Dừng/khó chịu | Dừng media tức thời, hướng dẫn đã rà, liên hệ phù hợp | Không mạng, không cần đăng nhập, không paywall | L |
| U14 | Phản hồi | Dễ chịu hơn/như cũ/khó chịu hơn/chưa rõ; bỏ qua | Lưu lỗi, sửa, thiếu câu trả lời | L |
| U15 | Kết thúc | Ghi nhận thời gian/tiến độ thật, lưu hành trình | Kết thúc sớm, chưa sync, không tự nhận đã vận động | L |
| U16 | Khóa đang học | Bài tiếp theo, lịch, mốc feedback, hai thời hạn | Nghỉ, lặp bài, không tính mở trang là hoàn thành | L |
| U17 | Lịch lớp live | Lịch/múi giờ, tham gia, đổi lịch, nội quy | Link hết hạn, lớp hủy, ghi hình có consent | L nếu bán live |
| U18 | Hành trình | Buổi đã học, tiến độ khóa, cảm nhận nếu có | 0/1 buổi, dữ liệu thiếu, thiết bị chưa sync | L |
| U19 | Lời giáo viên | Tên người, khóa, căn cứ, ngày gửi, hỏi thêm theo gói | Chưa có, quá SLA, đã sửa | L |
| U20 | Trợ lý AI | Nhãn AI, nguồn bài, dữ liệu dùng, báo câu trả lời | Không đủ nguồn, timeout, quota, ngoài phạm vi | N |
| U21 | Giá/gói | Quyền lợi đang có và dự định mua | Không nhân đôi quyền; AI chưa mở không bán | L |
| U22 | Checkout | Tài khoản, snapshot đơn, tổng giá, phương thức | Double click, mã ưu đãi lỗi, hết chỗ | L |
| U23 | Trạng thái đơn | Pending/đã xác nhận/thất bại/hoàn; mã đơn | Mất callback, trả tiền nhưng chưa mở khóa | L |
| U24 | Quản lý quyền mua | Nguồn mua, hạn, hỗ trợ, hủy/restore | Gia hạn lỗi, refund một phần, mua trùng | L; M restore |
| U25 | Cá nhân | Tên tùy chọn, locale, timezone, mục tiêu | Không yêu cầu DOB/giới/cân nặng không cần thiết | L |
| U26 | Nhắc tập | Opt-in, giờ, ngày nghỉ, kênh, tắt | OS từ chối, browser không hỗ trợ | L email; M push |
| U27 | Privacy | Ai đọc gì, rút chia sẻ, AI, xuất/xóa | Re-auth, đang xử lý, giữ hồ sơ bắt buộc | L |
| U28 | Hỗ trợ | FAQ, gửi vấn đề, ticket và hạn trả lời | Tiền, nội dung, kỹ thuật; không nhập thẻ/thông tin y tế thừa | L |
| U29 | Tải bài | Dung lượng, chất lượng, hạn offline, xóa | Hết bộ nhớ, bài thu hồi, đổi tài khoản | M/N |
| U30 | Camera/voice setup | Phạm vi, quyền, kiểm tra môi trường, tắt | Từ chối/quá nóng/không đủ confidence | N nghiên cứu |
| O01 | Giáo viên: hàng đợi | Người được giao, mốc phản hồi, hạn, công suất | Vắng mặt, mất assignment, không có consent | L |
| O02 | Hồ sơ học viên | Lịch sử được chia sẻ; soạn → preview → gửi | Sai người nhận, gửi lặp, rút chia sẻ giữa lúc soạn | L |
| O03 | CMS | Bản nháp, media, metadata, duyệt/publish/thu hồi | Thiếu caption, giấy phép hết hạn, sai version | L tối thiểu |
| O04 | Đơn/quyền học | Đối soát, cấp đúng người, refund có lý do | Webhook lặp, đối soát tay, mua cũ | L |
| O05 | Hỗ trợ/privacy | Ticket, yêu cầu xóa/xuất, incident | Quá hạn, định danh chưa xác minh | L |
| O06 | Vận hành | Funnel tổng hợp, hạn mức, flags, audit | Không đưa raw health data vào dashboard marketing | L tối giản/N |

## 7. Storyboard và hành trình để review

### J01 · Khách mới từ TikTok, chưa muốn tạo tài khoản

U01 với cùng chủ đề vừa xem → U03/U10 bài mẫu → thông tin phạm vi cần thiết → U11 → U14 tùy chọn → U15 → U04 nếu muốn giữ lịch sử. Không xin push/camera hoặc email ngay khi mở link. Guest xem mẫu không tạo hồ sơ sức khỏe trên server; nếu lưu nhật ký nhạy cảm hoặc mua thì đăng nhập và cung cấp quyền cần thiết.

Wireframe Hôm nay: tiêu đề “Hôm nay bạn muốn bắt đầu thế nào?” → card tiếp tục bài/khóa → thời lượng và dụng cụ → nút “Chuẩn bị tập” → dòng “Chỉ có ít thời gian?” → lựa chọn phù hợp → dưới cùng lịch lớp/thông tin giáo viên. Không đặt cùng lúc banner ưu đãi, chatbot, streak và 10 card đề xuất.

### J02 · Học viên lớp trả phí chuyển vào app

Link mời gắn enrollment → xác minh tài khoản → đối soát quyền đã mua → U16. Link không tự cấp quyền chỉ vì email khai báo giống nhau. Nếu không khớp, tạo ticket và giữ mã mời, không bắt mua lại. Giữ công cụ cũ hoạt động trong giai đoạn chuyển; nhập tiến độ có nhãn “được nhập”, không bịa event đã xem video.

### J03 · Mua khóa rồi mở trên thiết bị khác

U03 cho xem giá/thời hạn/SLA → U04 → U22 xác nhận tài khoản → U23. Server xác nhận payment → entitlement → U16. App trên điện thoại đăng nhập cùng tài khoản → cùng khóa và checkpoint. Nếu tài khoản khác, hướng dẫn tìm/khôi phục, không tự merge email hoặc hai tài khoản store. Hai thiết bị tập cùng lúc lưu hai run; resume một run dùng version conflict, không ghi đè im lặng.

### J04 · Chỉ có 5 phút

U07 → U08 cập nhật hôm nay → U09 chỉ trả bài hoàn chỉnh trong 5 phút nếu có. Không có thì nói rõ, cho lựa chọn khác hoặc để sau. Không cắt tùy tiện đoạn khởi động/kết thúc của bài 15 phút. Bài bổ sung không tự tính là hoàn tất bài giáo trình gốc.

### J05 · Khó chịu giữa buổi

U11 nút dừng → media dừng ngay dù server lỗi → U13 nội dung được chuyên môn duyệt → lưu ended_early nếu có quyền và kết nối → không upsell/nhắc tập tiếp. Không lấy “đã mua”, “AI trả lời là ổn” hoặc nút Back làm cách vượt điều kiện. Tái đánh giá theo policy đã duyệt, không khóa vô thời hạn mà không có hướng giải quyết; app không cấp giấy chứng nhận đủ điều kiện y tế.

### J06 · Quay lại sau hai tuần

U07 chào trung tính, giữ bài đang học → cập nhật điều kiện thay đổi → tiếp tục/lặp bài. Không nợ streak, không phải bù buổi, không tự tăng độ khó theo ngày lịch. Nếu hỗ trợ giáo viên đã hết nhưng xem còn hạn, hai trạng thái được giải thích riêng.

### J07 · Nhận lời nhắn giáo viên

O01 → O02 kiểm assignment và chia sẻ → viết nháp → preview có người nhận/khóa → gửi idempotent → U19. Nếu dùng AI soạn nháp về sau, giáo viên vẫn đọc/duyệt/chịu trách nhiệm. Không viết “tôi thấy bạn làm đúng” khi chỉ có dữ liệu tự báo cáo. Nếu quá SLA, báo thời gian dự kiến và xử lý dịch vụ, không gửi AI giả tên giáo viên.

### J08 · AI thiếu dữ liệu hoặc bị hỏi ngoài phạm vi

U20 chỉ nhận nguồn đã duyệt và quyền được phép → không đủ thông tin thì nói rõ, chỉ thống kê có thật hoặc mở FAQ. Hỏi chữa bệnh/đau cấp → nội dung định tuyến được chuyên môn duyệt; không tự kê bài. Hỏi đổi lịch → đưa bản đề xuất để người dùng xác nhận, không tự mua/gia hạn hoặc gửi thông tin cho giáo viên.

### J09 · Hủy, hoàn hoặc xóa

U24 chọn quản lý đúng nguồn mua → hiển thị ngày quyền kết thúc và trạng thái xác nhận. Hủy gia hạn không xóa lịch sử; refund xử lý theo đơn/phạm vi quyền bị thu hồi. U27 xuất/xóa dùng re-auth; có biên nhận và tiến trình; tách nghĩa vụ lưu hồ sơ giao dịch. Không ép khảo sát hoặc chat sales để được hủy.

### J10 · Founder nghỉ/khóa hết chỗ

O01 công suất giảm → ngừng nhận đơn mới → người học thấy lịch hỗ trợ mới và lựa chọn xử lý theo điều khoản. Khóa đang học vẫn xem được nếu hợp lệ. Nếu không có người thay, không bán quyền “giáo viên theo sát” chưa thể cung cấp.

## 8. Ma trận tình huống khó chịu và tiêu chí nghiệm thu

| Tình huống | Hành vi bắt buộc | Kiểm chứng |
|---|---|---|
| TikTok mở trong browser nhúng | Login/video có đường mở browser ngoài, giữ đích đến | iPhone/Android từ link thật |
| OTP chậm, gửi lại | Cooldown, không lộ tài khoản tồn tại, không mất checkout | Hết hạn và retry |
| Nhấn mua 2 lần | Cùng ý định mua, không cấp/thu trùng | Idempotency và provider sandbox |
| Bị trừ tiền, UI pending | Không yêu cầu trả lại; mã đơn, kiểm tra/hỗ trợ | Đóng tab trước callback |
| Mất mạng lúc lưu | Giữ bản nháp tối thiểu, báo chưa đồng bộ | Mạng rớt và retry |
| Đổi tài khoản | Xóa cache/draft nhạy cảm, quyền tải offline đổi theo owner | A logout, B login cùng thiết bị |
| Video tải chậm | Chọn chất lượng thấp, trạng thái rõ, không cộng thời gian buffer | 4G yếu và mất kết nối |
| Có cuộc gọi/chuyển app | Pause/resume rõ, không tự phát lại bất ngờ | Thiết bị thật |
| Giáo viên gửi sau khi rút chia sẻ | Kiểm quyền lại lúc đọc/gửi; chặn nguồn không còn được phép | Race test giữa hai request |
| Bài bị thu hồi | Không run mới; run cũ xử lý theo mức rủi ro | Policy version và media ticket |
| Thuê bao hết giữa buổi | Với hết hạn thương mại thông thường, cho kết thúc run đã cấp phép trong grace có giới hạn | Không mở buổi mới ngoài hạn; safety luôn ưu tiên |
| Không muốn ghi nhật ký | Vẫn học được phần không cần dữ liệu đó | Không hard-block vì analytics hoặc marketing |
| Accessibility | Caption, focus, screen reader, nhãn, chữ lớn, reduced motion | Kiểm tự động + tác vụ thủ công |
| Không có camera/micro | Toàn bộ khóa thường vẫn dùng được | Denied/unsupported/permission revoked |

Mục tiêu thiết kế: chữ UI đủ đọc, điều khiển 44–48px, nội dung không bị safe area/keyboard che, caption dễ bật; dùng WCAG 2.2 AA làm cơ sở kiểm tra web. Kích thước chạm 44–48px là lựa chọn thiết kế, không gán thành yêu cầu AA chung. [R09 · WCAG](https://www.w3.org/TR/WCAG22/).

## 9. Thiết kế AI theo cấp độ rủi ro

| Cấp | AI được làm | Không được suy | Điều kiện mở |
|---|---|---|---|
| A0 · hỗ trợ nội bộ | Soạn FAQ, metadata, outline và phụ đề nháp | Không tự duyệt chuyên môn/publish | Người chịu trách nhiệm duyệt |
| A1 · trợ lý khóa | Giải thích từ tài liệu được duyệt, có link bài | Không tự tạo động tác hoặc nói đã quan sát | Bộ kiểm thử ngôn ngữ và ngoài phạm vi |
| A2 · cá nhân hóa có giới hạn | Diễn đạt lựa chọn từ rules, tổng hợp lịch sử được phép | Không dự báo bệnh, không coi bỏ trống là tốt lên | Consent, dữ liệu, evidence validation, rollback |
| A3 · voice | Hỏi/đáp ngắn, điều khiển khi phù hợp | Không có micro nền mặc định, không phụ thuộc cloud để dừng | Độ trễ/nhận dạng tiếng Việt, interruption, chi phí |
| A4 · camera | Nghiên cứu feedback hình học trên bộ tư thế giới hạn | Góc khớp 2D không chứng minh tư thế an toàn, không thấy lực/đau/bệnh | Chuyên môn, dữ liệu đa dạng, false correction, privacy và pilot riêng |

Pipeline A1/A2: request có identity/quyền/consent → rules lọc nội dung → truy xuất chỉ tài liệu được phép → dữ liệu đầu vào tối thiểu → model → schema/ID/số liệu kiểm chứng → policy nội dung → trả kết quả có nguồn hoặc fallback. API key chỉ server; model không có quyền DB tùy ý, thanh toán, cấp quyền hay tự gửi lời giáo viên. Bản ghi người dùng và tài liệu truy xuất là dữ liệu không đáng tin, không là chỉ dẫn hệ thống.

Ngân sách AI theo người/tháng và theo ngày toàn hệ thống; quota công khai nếu ảnh hưởng quyền lợi. Log model/prompt/retrieval/policy version, latency, chi phí, kết quả validation; không ghi nguyên nhật ký nhạy cảm vào log chung. Cache chỉ theo người, consent và phiên bản; không lấy kết quả người A trả cho B.

Bộ evaluation đề xuất: 80–120 tình huống tiếng Việt trước A1 (nội dung thông thường, ngoài phạm vi, thiếu dữ liệu, prompt injection, typo, lẫn Việt/Anh, hứa hẹn quan sát, cấp quyền sai). Chặn release khi có bất kỳ lỗi nghiêm trọng trong suite; mục tiêu ≥95% trả lời có nguồn phù hợp và 100% ID/quyền hợp lệ trong suite. Đây là ngưỡng kỹ thuật nội bộ, không chứng minh an toàn ngoài thực tế. Test lại mỗi đổi model/prompt/knowledge; mở nhóm nhỏ có report và kill switch.

Camera nếu theo đuổi: ưu tiên xử lý tại thiết bị và không lưu raw video mặc định; nhận biết “không đánh giá được”, góc quay/che khuất; không giám sát người không đồng ý. Chỉ thử trên các tư thế đã được rà và trên thiết bị/nhóm thể trạng đa dạng. Không dùng confidence của model làm thước đo y khoa. Giai đoạn này có thể không đáng đầu tư với mô hình solo; phải có bằng chứng khách trả tiền cho lợi ích tăng thêm.

Google có chính sách nội dung AI với cơ chế xử lý/report nội dung và quy định health app; khai báo đúng chức năng trước store launch. MCY đề xuất nút báo câu trả lời ngay trong giao diện dù AI chỉ là tính năng phụ. [R10 · AI policy](https://support.google.com/googleplay/android-developer/answer/14094294?hl=en), [R11 · Health declaration](https://support.google.com/googleplay/android-developer/answer/14738291?hl=en).

## 10. Nội dung và an toàn sản phẩm

Giáo trình hoàn chỉnh được duyệt trước khi bán; mỗi bài có mục tiêu học, mức độ, dụng cụ, thời lượng thật, hướng dẫn/caption, giới hạn sử dụng, người chịu trách nhiệm và phiên bản. Quay bài mẫu đầu để test giọng/tốc độ/góc máy trước khi quay toàn bộ. Không cần đủ 50 tư thế mới học được điều gì từ thị trường.

Quy trình: outline → rà chuyên môn → quay → biên tập/caption → kiểm nội dung/UX → publish → theo dõi câu hỏi/sự cố → sửa phiên bản hoặc thu hồi. Với solo, ít nhất cần một đợt rà độc lập các hướng dẫn và giới hạn quan trọng; nếu chưa có thì giảm phạm vi cá nhân hóa và hoãn những nội dung chưa được thẩm định.

Yoga có lợi ích tiềm năng và cũng có rủi ro; tài liệu tổng quan không chứng minh hiệu quả riêng của MCY. Nội dung về triệu chứng, điều kiện không phù hợp và cách tìm trợ giúp cần người đủ chuyên môn duyệt theo thị trường; không giao Coding Agent sáng tác danh sách y tế. [R12 · NCCIH](https://www.nccih.nih.gov/health/yoga-effectiveness-and-safety).

Readiness là đánh giá phù hợp phạm vi dịch vụ, không chứng nhận “an toàn”. Không thu hồ sơ bệnh án nếu không cần. Với chương trình ngoài năng lực hiện tại, giải thích giới hạn và hướng tìm hỗ trợ; nội dung giáo dục không cá nhân hóa vẫn có thể xem khi phù hợp. Safety stop hoạt động ở client ngay, còn điều kiện khởi tạo buổi được server kiểm lại.
