# 02 · Sản phẩm đa nền tảng, màn hình và hành trình

**Tất cả là đặc tả đề xuất. Storyboard bên dưới là prototype bằng văn bản để review, chưa phải prototype tương tác được triển khai.**

## 1. Phạm vi theo phiên bản

| Phiên bản | Phải có | Chưa cần xây |
|---|---|---|
| V0 · prototype và kiểm chứng dịch vụ | Vòng check-in → trao đổi → kế hoạch → tập → feedback → lần tiếp theo; dữ liệu demo có nhãn; test hai lần sử dụng | Chưa gọi mô phỏng là AI production; chưa thu tiền qua prototype |
| V1 · web với AI chọn buổi | AI text hỏi ngắn và chọn buổi đã duyệt; context/history có quyền; nội dung nhỏ đủ phạm vi; player; phản hồi; privacy; trả phí một kỳ; support và admin tối thiểu | Camera, voice, chat tự do, thư viện lớn, native, giáo viên đọc mọi nhật ký |
| V1.1 · cải thiện điều chỉnh | Chọn bài tốt hơn từ feedback; metadata tốt hơn; mẫu ghép nội dung nếu đã được rà cả chuyển tiếp; phân tích chất lượng | Không tự sáng tác chuỗi động tác không kiểm chứng |
| V2 · mobile | Cùng tài khoản/quyền/vòng lặp; push; native player; restore purchase; offline nếu qua thử nghiệm | Không xây lại domain hoặc bắt người dùng mua lại |
| V3 · mở rộng | Gói tiếp tục/thuê bao theo bằng chứng; một thị trường tiếng Anh; voice/camera nếu có giá trị riêng | Không mặc định AI cao cấp hoặc nhiều quốc gia là bước tất yếu |

AI là thành phần của V1. V0 mô phỏng và concierge minh bạch chỉ giúp kiểm chứng thiết kế/dịch vụ, chưa chứng minh độ tin cậy, chi phí hay khả năng cá nhân hóa của AI thật. Nếu chưa qua gate AI thì chưa bán lời hứa AI đó.

Danh mục đầu đề xuất 8–12 buổi hoàn chỉnh, mỗi buổi có mục đích và giới hạn rõ; 2–3 buổi trong đó làm mẫu. Đây là giả định sản xuất cần đối chiếu nội dung hiện có. Tiêu chí là đủ các hoàn cảnh ưu tiên, không đạt một số lượng video tùy ý. Giữ lớp online bằng công cụ hiện có; không xây livestream riêng.

## 2. Ma trận năng lực nền tảng

“Có” bên dưới là mục tiêu phát triển, không xác nhận đã chạy. Test bằng thiết bị/OS/browser thật trước khi quảng bá. Phân biệt website trên mobile, PWA được thêm vào màn hình chính và app cài từ store.

| Năng lực | Web desktop/mobile | App iOS/Android | Fallback và gate |
|---|---|---|---|
| Check-in, hội thoại AI, kế hoạch hôm nay, lịch sử | Có, đồng nhất giá trị cốt lõi | Có | Cùng backend và tài khoản |
| Video, phụ đề, tốc độ, ngang/dọc | Có trên tập browser hỗ trợ | Có | Bản chất lượng thấp, transcript; pause khi không phát được |
| Nhắc tập | Email/in-app; web push phụ thuộc thiết bị/cài đặt | Push khi người dùng cho phép | Không có push vẫn dùng được vòng lặp |
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
| Dịch vụ chọn bài thủ công để nghiên cứu | Giảm công xây, nhưng chưa chứng minh AI tự động | Ghi rõ người chuẩn bị; dùng học về nhu cầu, không thay thế V1 AI |

[R06 · Expo web documentation](https://docs.expo.dev/workflow/web/) xác nhận khả năng web; không chứng minh phù hợp riêng MCY. Spike phải dùng một video thật, đăng nhập, resume, caption, mạng yếu, checkout sandbox và thiết bị iPhone/Android thật.

Source hiện tại là **phòng thử prototype**. Giữ ranh giới AGENTS hiện hành: app UI trong Prototype.tsx/prototype.css; không tự tách module, sửa mobile runtime hoặc thay framework theo báo cáo này. Để chuyển sang production cần một quyết định kiến trúc riêng về nơi đặt code mới/repo mới và ranh giới chỉnh sửa. Báo cáo trước gợi ý tách file chưa phải quyền làm việc đó.

Backend ban đầu nên là một ứng dụng chia module: identity, catalog, daily planning, practice/feedback, commerce, consent và AI gateway; teaching/messaging bổ sung theo gói. Ưu tiên managed auth + PostgreSQL + object storage/video delivery + tác vụ nền; chưa cần microservices, Kubernetes hay vector database độc lập. Chọn nhà cung cấp bằng tiêu chí hỗ trợ pháp nhân VN, vùng dữ liệu, backup/restore, export, quota, tổng chi phí và khả năng vận hành. Không có nhà cung cấp nào được mặc định đã chọn/cấu hình.

## 4. Quyền mua xuyên nền tảng

Nội dung số và thuê bao fitness phải phân loại đúng khi bán trong app. Apple có quy định khác nhau cho dịch vụ đa nền tảng, reader app và dịch vụ trực tiếp 1:1; khóa video có feedback không tự nhiên thuộc ngoại lệ 1:1. Google yêu cầu Play Billing cho các giao dịch thuộc chính sách, có chương trình/ngoại lệ theo thị trường. Không dùng quy định storefront Mỹ làm mặc định cho Việt Nam. Rà lại phương án trước khi nộp app. [R07 · Apple](https://developer.apple.com/app-store/review/guidelines/), [R08 · Google Payments](https://support.google.com/googleplay/android-developer/answer/9858738?hl=en).

**Thiết kế MCY đề xuất:** cùng một product nội bộ ánh xạ nhiều SKU/kênh; đơn hàng và nguồn mua tách quyền sử dụng. Mua ở web đăng nhập mobile vẫn thấy quyền đồng hành và nội dung được cấp hợp lệ. Giá có thể khác theo kênh nhưng không che tổng tiền/thuế/chu kỳ. Trước khi mua hiển thị tài khoản và quyền đã có để giảm trả hai lần.

Màn gói hiển thị: sản phẩm, thời hạn xem, thời hạn hỗ trợ, nơi mua, ngày gia hạn nếu có, nút quản lý phù hợp nguồn mua, khôi phục giao dịch và hỗ trợ. Không hứa nút web có thể hủy mọi thuê bao store. Xóa tài khoản và hủy thuê bao là hai thao tác khác nhau: giải thích và hỗ trợ xử lý cả hai, không âm thầm tiếp tục thu tiền khi người dùng tin đã dừng.

V1 có thể dùng một provider checkout hoặc chuyển khoản đối soát thủ công nếu khối lượng nhỏ. Ảnh chụp chuyển khoản không đủ cấp quyền: kiểm giao dịch thực, số tiền và mã đơn; ghi người đối soát, thời gian, tham chiếu, chống trùng. Chỉ thông báo “đang chờ” cho đến khi xác nhận. Đây là lựa chọn vận hành cần chọn trước pilot, không nhận tiền trong lượt lập kế hoạch này.

Apple yêu cầu minh bạch và xin phép rõ trước khi chia sẻ dữ liệu cá nhân với AI bên thứ ba. Google có yêu cầu về đường xóa tài khoản trong app và tài nguyên web cho app thuộc phạm vi áp dụng. Đưa các luồng này vào checklist submission. [Apple privacy](https://developer.apple.com/app-store/review/guidelines/#privacy), [Google account deletion](https://support.google.com/googleplay/android-developer/answer/13327111?hl=en).

## 5. Bật/tắt tính năng mà không phá quyền lợi

Điều kiện hiệu lực: **phiên bản có hỗ trợ ∧ thiết bị có năng lực ∧ thị trường/chính sách cho phép ∧ quyền sử dụng hợp lệ ∧ consent cần thiết ∧ điều kiện nội dung/an toàn ∧ feature flag**. An toàn và quyền truy cập được kiểm ở server; ẩn nút ở client không đủ.

| Flag | Mặc định | Khi tắt / mất dịch vụ |
|---|---|---|
| daily_ai_planner | On trong cohort V1 đã qua gate; không bật public trước eval | Gợi ý theo quy tắc có nhãn, hoặc buổi được duyệt đã lưu còn phù hợp; không giả AI |
| feedback_memory | On khi có consent và qua gate V1 | Chọn dựa trên thông tin hôm nay, nói rõ không dùng lịch sử; vẫn xem được lịch sử riêng |
| voice_assistant | Off | Text/nút, không thu micro nền |
| camera_coach | Off | Video thường; không ghi lại hình |
| recurring_sales | Off tại launch | Gói một kỳ trả một lần; quyền đã mua vẫn xử lý theo điều khoản |
| offline_downloads | Off đến khi đủ kiểm chứng | Streaming; báo rõ giới hạn |
| new_membership_sales | Theo công suất AI/nội dung/hỗ trợ | Chờ đợt sau; thành viên cũ giữ quyền và có phương án xử lý gián đoạn |

Mỗi flag có owner, mục đích, nhóm đủ điều kiện, platform/version, ngày hết hạn, phương án tắt, metric và audit. Triển khai internal → nhóm đồng ý beta → cohort nhỏ → mở rộng. Nhóm nhỏ không cần chia phần trăm giả chính xác; dùng danh sách cohort có kiểm soát.

Tắt việc bán mới, tắt inference AI và thu hồi quyền đã mua là ba việc khác nhau. Tính năng trả phí ngừng dài ngày phải có thông báo, gia hạn/bù/hoàn theo điều khoản. Có thể tắt ngay tính năng gây nguy hiểm; sau đó xử lý quyền lợi. Không dùng flag để giấu tính năng với reviewer store hoặc vượt kiểm tra an toàn. Client cũ không hiểu capability mới phải fallback; backend giữ compatibility trong cửa sổ được công bố.

## 6. Sơ đồ thông tin và danh mục màn hình

Điều hướng học viên đề xuất: **Hôm nay · Hành trình · Khám phá · Cá nhân**. Hôm nay là trung tâm vòng lặp; AI hiện diện trong cuộc trao đổi ngắn dẫn tới kế hoạch. Khám phá là đường tìm nội dung/khóa chủ động, có thể thu nhỏ thành link phụ ở launch. Không cần tab chatbot độc lập. Player tách điều hướng bán hàng. Desktop có vùng nội dung rộng hơn/sidebar phù hợp; không đơn thuần phóng to mock điện thoại.

L = launch web; N = nâng cấp; M = khi có app native. Mỗi dòng là màn hoặc nhóm trạng thái, không nhất thiết một route. Mọi màn có loading/empty/error khi liên quan; lỗi luôn có hành động khôi phục.

| ID | Màn / nhiệm vụ | Nội dung và hành động chính | Trạng thái cần thiết | Đợt |
|---|---|---|---|---|
| U01 | Landing theo hoàn cảnh | Lời hứa buổi hôm nay, giáo viên, thử vòng lặp, đăng nhập | Link lỗi, người cũ, chưa đồng ý AI | L |
| U02 | Giới thiệu giáo viên | Kinh nghiệm được xác minh, cách dạy, phạm vi | Không bịa chứng chỉ/testimonial | L |
| U03 | Xem khóa kỹ năng | Giáo trình bổ trợ, mẫu, giá và hỗ trợ riêng | Chưa bán, đã mua, hết chỗ | N; giữ quyền lớp cũ |
| U04 | Đăng nhập | Phương thức chính, OTP/link, giữ đích đến | Hết hạn, sai tài khoản, gửi quá nhiều, mở tab khác | L |
| U05 | Onboarding | Mục tiêu/kinh nghiệm tối thiểu, có thể sửa | Bỏ câu tùy chọn, người cũ, chưa đủ phạm vi | L |
| U06 | Quyền dữ liệu/phạm vi tập | Mục đích riêng, câu hỏi được duyệt, giới hạn hỗ trợ | Từ chối, rút, cần kiểm tra lại | L |
| U07 | Hôm nay | Bắt đầu check-in, tiếp tục buổi còn dở, kế hoạch đã chọn | Lần đầu, quay lại, đã tập, tạm nghỉ, dữ liệu cũ | L |
| U08 | Check-in | Thời gian, năng lượng, ý muốn hôm nay, context tùy chọn | Thiếu dữ liệu quan trọng, sửa, không muốn nhập | L |
| U09 | Kế hoạch hôm nay | Bài được duyệt, lý do chọn, thời lượng thật, dụng cụ, đổi/xác nhận | Đang chọn, no-match, bị thu hồi, không còn phù hợp | L |
| U10 | Chuẩn bị | Thời lượng thật, dụng cụ, preview, hướng dẫn dừng | Media lỗi, không có dụng cụ, không đủ điều kiện | L |
| U11 | Player | Video, caption, pause, tua, dừng lớn | Buffer, gọi điện, đổi hướng, nền, hết token | L |
| U12 | Trợ giúp động tác | Clip/cue và biến thể đã duyệt, quay về đúng chỗ | Chưa có biến thể, không thể tải | L cue; N đổi timeline |
| U13 | Dừng/khó chịu | Dừng media tức thời, hướng dẫn đã rà, liên hệ phù hợp | Không mạng, không cần đăng nhập, không paywall | L |
| U14 | Phản hồi | Dễ chịu hơn/như cũ/khó chịu hơn/chưa rõ; bỏ qua | Lưu lỗi, sửa, thiếu câu trả lời | L |
| U15 | Kết thúc | Ghi nhận thời gian/tiến độ thật, lưu hành trình | Kết thúc sớm, chưa sync, không tự nhận đã vận động | L |
| U16 | Khóa kỹ năng đang học | Thứ tự bài, lịch, quyền hỗ trợ nếu có | Nghỉ, lặp, hết hạn; tách khỏi kế hoạch hằng buổi | N hoặc lớp cũ |
| U17 | Lịch lớp live | Lịch/múi giờ, tham gia, đổi lịch, nội quy | Link hết hạn, lớp hủy, ghi hình có consent | L nếu bán live |
| U18 | Hành trình | Buổi thật, feedback trung tính, điều đã thay đổi trong kế hoạch | Không phản hồi, chưa rõ, ít dữ liệu, sửa/xóa | L |
| U19 | Lời giáo viên | Tên người, quyền lợi, căn cứ tự báo cáo, ngày gửi | Chưa có, quá SLA, đã sửa | N; L nếu bán quyền này |
| U20 | Trao đổi ngắn với AI | Xác nhận bối cảnh, làm rõ điều ảnh hưởng chọn bài; CTA xem kế hoạch | Timeout, chưa đồng ý, ngoài phạm vi, sửa AI hiểu nhầm | L; nằm giữa U08 và U09 |
| U21 | Gói đồng hành | AI chọn buổi và quyền nội dung; giới hạn, hạn dùng, nguồn mua | Trial/hết hạn/đã có gói, outage; không bán AI chưa mở | L |
| U22 | Checkout | Tài khoản, snapshot đơn, tổng giá, phương thức | Double click, mã ưu đãi lỗi, hết chỗ | L |
| U23 | Trạng thái đơn | Pending/đã xác nhận/thất bại/hoàn; mã đơn | Mất callback, trả tiền nhưng chưa mở khóa | L |
| U24 | Quản lý quyền mua | Nguồn mua, hạn, hỗ trợ, hủy/restore | Gia hạn lỗi, refund một phần, mua trùng | L; M restore |
| U25 | Cá nhân và điều AI ghi nhớ | Tên tùy chọn, locale/timezone, sở thích đã xác nhận, sửa/xóa/không nhớ | Dữ liệu hôm nay hết hạn, nhầm bối cảnh, rút consent | L |
| U26 | Nhắc tập | Opt-in, giờ, ngày nghỉ, kênh, tắt | OS từ chối, browser không hỗ trợ | L email; M push |
| U27 | Privacy | Ai đọc gì, rút chia sẻ, AI, xuất/xóa | Re-auth, đang xử lý, giữ hồ sơ bắt buộc | L |
| U28 | Hỗ trợ | FAQ, gửi vấn đề, ticket và hạn trả lời | Tiền, nội dung, kỹ thuật; không nhập thẻ/thông tin y tế thừa | L |
| U29 | Tải bài | Dung lượng, chất lượng, hạn offline, xóa | Hết bộ nhớ, bài thu hồi, đổi tài khoản | M/N |
| U30 | Camera/voice setup | Phạm vi, quyền, kiểm tra môi trường, tắt | Từ chối/quá nóng/không đủ confidence | N nghiên cứu |
| O01 | Giáo viên: hàng đợi | Người được giao và đồng ý chia sẻ, quota/SLA nếu bán | Vắng mặt, hết assignment/consent | N; L nếu có gói giáo viên |
| O02 | Hồ sơ học viên | Đọc phần được chia sẻ; soạn → preview → gửi | Sai người, gửi lặp, rút quyền khi đang soạn | N; L nếu có gói giáo viên |
| O03 | CMS | Bản nháp, media, metadata, duyệt/publish/thu hồi | Thiếu caption, giấy phép hết hạn, sai version | L tối thiểu |
| O04 | Đơn/quyền học | Đối soát, cấp đúng người, refund có lý do | Webhook lặp, đối soát tay, mua cũ | L |
| O05 | Hỗ trợ/privacy | Ticket, yêu cầu xóa/xuất, incident | Quá hạn, định danh chưa xác minh | L |
| O06 | Vận hành và chất lượng AI | Phiên lỗi, no-match, flag, chi phí, báo AI và funnel tổng hợp | Không raw journal trong marketing; xử lý sự cố ưu tiên | L tối giản |

## 7. Storyboard và hành trình để review

### J01 · Khách mới từ TikTok

U01 thể hiện cùng hoàn cảnh vừa xem → khách có thể xem buổi mẫu không cá nhân hóa, hoặc chọn thử AI → đăng nhập và quyền dữ liệu cần thiết trước gửi dữ liệu riêng cho AI → U08 → U20 → U09 → U10 → U11 → U14 → U15. Không bắt đăng ký để đọc giới thiệu/xem mẫu; không thu nhật ký sức khỏe của guest trên server.

Wireframe Hôm nay: “Bạn có bao nhiêu thời gian hôm nay?” → nút thời gian nhanh → “Bạn muốn buổi tập thế nào?” → nút “Cùng chọn buổi tập” → cuộc trao đổi ngắn nếu cần → thẻ kế hoạch cụ thể. Không đồng thời hiện banner sale, danh sách khóa, streak và chatbot rỗng. Người quay lại có kế hoạch còn hợp lệ có thể xác nhận context và bắt đầu nhanh.

Điểm ma sát đăng nhập/consent trước AI cần test riêng; mời tài khoản bằng giá trị lưu và điều chỉnh lần sau, không bắt khai form dài. Bản mẫu mô phỏng phải ghi rõ là ví dụ, không dùng nó để hứa AI đã hiểu người dùng.

### J02 · Học viên lớp trả phí chuyển vào app

Link mời gắn enrollment → xác minh tài khoản → đối soát quyền đã mua → U16. Link không tự cấp quyền chỉ vì email khai báo giống nhau. Nếu không khớp, tạo ticket và giữ mã mời, không bắt mua lại. Giữ công cụ cũ hoạt động trong giai đoạn chuyển; nhập tiến độ có nhãn “được nhập”, không bịa event đã xem video.

### J03 · Mua gói đồng hành rồi mở trên thiết bị khác

U21 cho xem kỳ truy cập, phạm vi AI, nội dung, hỗ trợ và không tự gia hạn nếu chọn gói một kỳ → U04 → U22 → U23. Server xác nhận payment → entitlement → U07, giữ lại context/plan đang chuẩn bị nếu còn hợp lệ. Đổi thiết bị cùng tài khoản thấy cùng lịch sử và quyền; không yêu cầu mua lại.

Hai thiết bị đồng thời: một bản kế hoạch chỉ có một revision được chấp nhận; run có owner và version. Nếu tài khoản khác, hướng dẫn tìm/khôi phục, không tự merge vì email hoặc store account giống tên. Quyền lớp cũ được đối soát riêng và không tự chuyển thành AI đã mua.

### J04 · Chỉ có 5 phút

U07 → U08 cập nhật hôm nay → U09 chỉ trả bài hoàn chỉnh trong 5 phút nếu có. Không có thì nói rõ, cho lựa chọn khác hoặc để sau. Không cắt tùy tiện đoạn khởi động/kết thúc của bài 15 phút. Bài bổ sung không tự tính là hoàn tất bài giáo trình gốc.

### J05 · Khó chịu giữa buổi

U11 nút dừng → media dừng ngay dù server lỗi → U13 nội dung được chuyên môn duyệt → lưu ended_early nếu có quyền và kết nối → không upsell/nhắc tập tiếp. Không lấy “đã mua”, “AI trả lời là ổn” hoặc nút Back làm cách vượt điều kiện. Tái đánh giá theo policy đã duyệt, không khóa vô thời hạn mà không có hướng giải quyết; app không cấp giấy chứng nhận đủ điều kiện y tế.

### J06 · Quay lại sau hai tuần

U07 chào trung tính → xác nhận hoàn cảnh mới → AI chọn dựa trên dữ liệu còn phù hợp; có thể lặp bài quen hoặc chọn bài khác. Kế hoạch cũ không tự dùng lại khi đã stale. Không nợ streak, không phải bù buổi, không tự tăng độ khó theo ngày lịch. Nếu hỗ trợ giáo viên đã hết nhưng xem còn hạn, hai trạng thái được giải thích riêng.

### J07 · Nhận lời nhắn giáo viên

O01 → O02 kiểm assignment và chia sẻ → viết nháp → preview có người nhận/khóa → gửi idempotent → U19. Nếu dùng AI soạn nháp về sau, giáo viên vẫn đọc/duyệt/chịu trách nhiệm. Không viết “tôi thấy bạn làm đúng” khi chỉ có dữ liệu tự báo cáo. Nếu quá SLA, báo thời gian dự kiến và xử lý dịch vụ, không gửi AI giả tên giáo viên.

### J08 · AI thiếu dữ liệu hoặc bị hỏi ngoài phạm vi

U20 chỉ nhận nguồn đã duyệt và quyền được phép → thiếu thông tin quan trọng thì hỏi làm rõ; không có bài hợp lệ thì nói rõ no-match. Không kéo dài hỏi đáp chỉ để tạo cảm giác AI. Hỏi chữa bệnh/đau cấp → nội dung định tuyến được chuyên môn duyệt; không tự kê bài. Hỏi đổi lịch → đưa bản đề xuất để người dùng xác nhận, không tự mua/gia hạn hoặc gửi thông tin cho giáo viên.

### J09 · Hủy, hoàn hoặc xóa

U24 chọn quản lý đúng nguồn mua → hiển thị ngày quyền kết thúc và trạng thái xác nhận. Hủy gia hạn không xóa lịch sử; refund xử lý theo đơn/phạm vi quyền bị thu hồi. U27 xuất/xóa dùng re-auth; có biên nhận và tiến trình; tách nghĩa vụ lưu hồ sơ giao dịch. Không ép khảo sát hoặc chat sales để được hủy.

### J10 · Founder nghỉ hoặc công suất hỗ trợ giảm

Công suất hỗ trợ giảm → hạn chế nhận mới gói cần con người → người học thấy lịch hỗ trợ mới và lựa chọn xử lý theo điều khoản. Vòng lặp tự tập và nội dung vẫn dùng được nếu đủ điều kiện; sự cố AI có cơ chế thông báo và bù quyền lợi. Nếu không có người thay, không bán quyền “giáo viên theo sát” chưa thể cung cấp.

### J11 · Feedback thật thay đổi lần sau

Sau buổi đầu, U14: “Nhịp hơi nhanh; cảm giác không thay đổi” → lưu hai trường riêng, không gán thất bại/cải thiện. Lần sau U08: còn 10 phút → U20 xác nhận có muốn ưu tiên nhịp chậm hơn → U09 chọn buổi phù hợp đã duyệt và ghi “Dựa trên phản hồi nhịp hơi nhanh ở buổi trước”. Nếu không có lựa chọn chậm hơn, nói rõ; không đổi tiêu đề của cùng bài rồi gọi là cá nhân hóa.

Không hỏi lại mọi thông tin đã biết, không tự tăng độ khó khi bỏ trống feedback và không bắt đổi bài cho có vẻ mới. Các nhánh chi tiết, bộ nhớ, lựa chọn lặp và lỗi được đặc tả ở phần 06.

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
| Không muốn ghi nhật ký/chat | Có nút chọn nhanh từ context tối thiểu; không giả đã cá nhân hóa theo lịch sử | Không hard-block vì analytics/marketing; giải thích giới hạn đúng |
| Accessibility | Caption, focus, screen reader, nhãn, chữ lớn, reduced motion | Kiểm tự động + tác vụ thủ công |
| Không có camera/micro | Toàn bộ khóa thường vẫn dùng được | Denied/unsupported/permission revoked |

Mục tiêu thiết kế: chữ UI đủ đọc, điều khiển 44–48px, nội dung không bị safe area/keyboard che, caption dễ bật; dùng WCAG 2.2 AA làm cơ sở kiểm tra web. Kích thước chạm 44–48px là lựa chọn thiết kế, không gán thành yêu cầu AA chung. [R09 · WCAG](https://www.w3.org/TR/WCAG22/).

## 9. Thiết kế AI theo cấp độ rủi ro

| Cấp | AI được làm | Không được suy | Điều kiện mở |
|---|---|---|---|
| A0 · hỗ trợ nội bộ | Soạn FAQ, metadata, outline và phụ đề nháp | Không tự duyệt chuyên môn/publish | Người chịu trách nhiệm duyệt |
| A1 · trao đổi trước buổi | Hiểu ý định, hỏi làm rõ, xác nhận context và giải thích có nguồn | Không tự chẩn đoán hoặc nói đã quan sát | Bắt buộc trong V1; test ngôn ngữ, context và ngoài phạm vi |
| A2 · lập kế hoạch hằng buổi | Xếp hạng/chọn trong các buổi đủ điều kiện, dùng feedback đúng scope; giải thích và thay lựa chọn | Không vượt constraints, bịa bài, suy tiến bộ từ im lặng | Bắt buộc trong V1; consent, validation và eval xuyên nhiều buổi |
| A3 · voice | Hỏi/đáp ngắn, điều khiển khi phù hợp | Không có micro nền mặc định, không phụ thuộc cloud để dừng | Độ trễ/nhận dạng tiếng Việt, interruption, chi phí |
| A4 · camera | Nghiên cứu feedback hình học trên bộ tư thế giới hạn | Góc khớp 2D không chứng minh tư thế an toàn, không thấy lực/đau/bệnh | Chuyên môn, dữ liệu đa dạng, false correction, privacy và pilot riêng |

Pipeline A1/A2: identity/quyền/consent → context có nguồn và còn hiệu lực → rules lọc điều kiện cứng → AI trao đổi và xếp hạng/chọn trong candidates → server kiểm schema/ID/quyền/duration/constraints/evidence → trả thẻ kế hoạch có nguồn → user xác nhận → kiểm lại trước run. AI có vai trò chọn thực sự, không chỉ tô lời giải thích cho rules; rules và validator giữ giới hạn bắt buộc. V1 chọn buổi hoàn chỉnh; ghép block chỉ mở sau khi cả template/chuyển tiếp được duyệt. API key chỉ server; model không có quyền DB tùy ý, thanh toán, cấp quyền hay tự gửi lời giáo viên. Bản ghi người dùng và tài liệu truy xuất là dữ liệu không đáng tin, không là chỉ dẫn hệ thống.

Ngân sách AI theo người/tháng và theo ngày toàn hệ thống; quota công khai nếu ảnh hưởng quyền lợi. Log model/prompt/retrieval/policy version, latency, chi phí, kết quả validation; không ghi nguyên nhật ký nhạy cảm vào log chung. Cache chỉ theo người, consent và phiên bản; không lấy kết quả người A trả cho B.

Bộ evaluation đề xuất: 80–120 tình huống tiếng Việt trước V1, gồm cả chuỗi nhiều buổi và phản hồi đối nghịch (nội dung thông thường, ngoài phạm vi, thiếu dữ liệu, prompt injection, typo, lẫn Việt/Anh, hứa hẹn quan sát, cấp quyền sai). Chặn release khi có bất kỳ lỗi nghiêm trọng trong suite; mục tiêu ≥95% trả lời có nguồn phù hợp và 100% ID/quyền hợp lệ trong suite. Đây là ngưỡng kỹ thuật nội bộ, không chứng minh an toàn ngoài thực tế. Test lại mỗi đổi model/prompt/knowledge; mở nhóm nhỏ có report và kill switch.

Camera nếu theo đuổi: ưu tiên xử lý tại thiết bị và không lưu raw video mặc định; nhận biết “không đánh giá được”, góc quay/che khuất; không giám sát người không đồng ý. Chỉ thử trên các tư thế đã được rà và trên thiết bị/nhóm thể trạng đa dạng. Không dùng confidence của model làm thước đo y khoa. Giai đoạn này có thể không đáng đầu tư với mô hình solo; phải có bằng chứng khách trả tiền cho lợi ích tăng thêm.

Google có chính sách nội dung AI với cơ chế xử lý/report nội dung và quy định health app; khai báo đúng chức năng trước store launch. MCY đề xuất nút báo câu trả lời ngay trong giao diện vì AI là thành phần chính của việc chọn buổi. [R10 · AI policy](https://support.google.com/googleplay/android-developer/answer/14094294?hl=en), [R11 · Health declaration](https://support.google.com/googleplay/android-developer/answer/14738291?hl=en).

## 10. Nội dung và an toàn sản phẩm

Danh mục đủ bao phủ phạm vi chào bán được duyệt trước pilot trả phí; mỗi buổi có mục tiêu học, mức độ, dụng cụ, thời lượng thật, hướng dẫn/caption, giới hạn sử dụng, người chịu trách nhiệm và phiên bản. Quay bài mẫu đầu để test giọng/tốc độ/góc máy trước khi quay toàn bộ. Không cần đủ 50 tư thế mới học được điều gì từ thị trường.

Quy trình: outline → rà chuyên môn → quay → biên tập/caption → kiểm nội dung/UX → publish → theo dõi câu hỏi/sự cố → sửa phiên bản hoặc thu hồi. Với solo, ít nhất cần một đợt rà độc lập các hướng dẫn và giới hạn quan trọng; nếu chưa có thì giảm phạm vi cá nhân hóa và hoãn những nội dung chưa được thẩm định.

Yoga có lợi ích tiềm năng và cũng có rủi ro; tài liệu tổng quan không chứng minh hiệu quả riêng của MCY. Nội dung về triệu chứng, điều kiện không phù hợp và cách tìm trợ giúp cần người đủ chuyên môn duyệt theo thị trường; không giao Coding Agent sáng tác danh sách y tế. [R12 · NCCIH](https://www.nccih.nih.gov/health/yoga-effectiveness-and-safety).

Readiness là đánh giá phù hợp phạm vi dịch vụ, không chứng nhận “an toàn”. Không thu hồ sơ bệnh án nếu không cần. Với chương trình ngoài năng lực hiện tại, giải thích giới hạn và hướng tìm hỗ trợ; nội dung giáo dục không cá nhân hóa vẫn có thể xem khi phù hợp. Safety stop hoạt động ở client ngay, còn điều kiện khởi tạo buổi được server kiểm lại.
