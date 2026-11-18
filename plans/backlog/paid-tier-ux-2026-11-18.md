# UI/UX cho mô hình trả phí: khóa học trả phí và AI cho khách hàng trả phí — 2026-11-18

Nguồn: Owner 18/11: "sau này có khóa học trả phí; AI chỉ dành cho khách hàng trả phí". Đây là **phân tích và đề xuất**, chưa phải lệnh làm. Bản 1.0 vẫn không thanh toán và không AI (`AGENTS.md`); mọi tên gói, giá, chu kỳ dưới đây là chỗ giữ chỗ **do Owner đặt**. Canvas: trang "Mô hình trả phí" tại https://claude.ai/artifact/Uxw44YQsBvUdCFffPfPcHg (T1 bậc quyền, T2 luồng, T3 màn hình, T4 thanh toán và hoàn tiền, T5 hệ thống, AI, video, lộ trình).

## 1. Bậc quyền đề xuất

| | Khách | Tài khoản miễn phí | Thành viên (trả phí) | Mua lẻ một khóa |
|---|---|---|---|---|
| 38 clip miễn phí, 3 chạm tới video | Có | Có | Có | Có |
| Chút lớp 1 (chip vùng, chuỗi bài, phản hồi 1 chạm) | Có | Có | Có | Có |
| Mọi thông tin an toàn (câu dừng khi đau, hướng dẫn, rút đồng ý, xóa tài khoản) | Có | Có | Có | Có |
| Hành trình lưu trên tài khoản | Chỉ trên máy | Có | Có | Có |
| Xem thử một bài của khóa trả phí | Có | Có | Có | Có |
| Toàn bộ khóa học trả phí | Không | Không | Khóa được đưa vào gói | Khóa đã mua |
| Chút AI (lớp 2–3) | Không | Không | Có, sau các cổng an toàn | Có nếu khóa bật “kèm AI”, trong phạm vi và hạn của khóa |

Khách không mua được: quyền phải gắn với tài khoản để khôi phục khi đổi máy. Lúc mua là thời điểm tạo tài khoản tự nhiên thứ hai.

## 2. Bảy nguyên tắc UX

1. **Đường an toàn luôn miễn phí, không có chốt.** Trả phí không nới lỏng cổng an toàn nào.
2. **Đường 3 chạm của khách không đi qua cổng trả phí.** Cổng nằm ở mép: lối vào khóa trả phí và Chút AI.
3. **Cho thấy giá trị trước khi hỏi tiền:** mỗi khóa có bài xem thử miễn phí.
4. **Không bán thứ chưa có thật.** Skill `mcy-brand-ux`: chưa mở cổng AI thì người học không thấy điều khiển AI. Hiện AI tắt và danh mục đã duyệt rỗng, nên giai đoạn này không có gì để bán; lời mời AI chỉ hiện khi AI thật chạy.
5. **Trung thực về giá và cách hủy:** giá VND, chu kỳ, cách hủy ngay trên tấm mua; "Để sau" luôn có; không đếm ngược; giọng "mình–bạn".
6. **Rơi mềm khi hết hạn:** giữ Hành trình và dữ liệu, Chút về lớp 1, khóa đã mua lẻ vẫn mở.
7. **Một nơi để biết "tôi có gì":** "Gói và mua hàng" trong Cá nhân.

## 3. Điều chỉnh các đề xuất trước (xem `ux-audit-2026-11-18.md`)

- "AI chỉ cho tài khoản" → **tài khoản có quyền trả phí**; máy chủ AI phải kiểm quyền (không tin giao diện).
- "Nội dung và quyền" (từng đề xuất bỏ) → **giữ và mở rộng** thành "Gói và mua hàng", ẩn tới khi có sản phẩm bán.
- Khám phá/Thư viện: hai kệ, **Bài học miễn phí** (trước) và **Khóa học** (sau), thêm chip lọc Miễn phí/Thành viên.
- Thêm **trang giới thiệu khóa học**: giảng viên (chỉ từ hồ sơ đã kích hoạt), giáo trình, xem thử, lưu ý an toàn đã duyệt, giá, "Khôi phục giao dịch".
- Chút trên Hôm nay: lớp 1 cho mọi người; Chút AI chỉ cho thành viên, mời bằng **một dòng**, không hiện ô nhập khóa.
- Đồng ý lúc đăng ký vẫn 1 ô bắt buộc; **điều khoản mua hàng tách riêng và chỉ hỏi lúc mua**.
- "Chút và dữ liệu": thêm trạng thái quyền (chưa có · có quyền nhưng chưa đồng ý AI · đang dùng · hết hạn). Ba điều kiện độc lập: quyền, đồng ý AI, cổng hệ thống.
- Workspace Owner: thêm **mức truy cập** (miễn phí/thành viên/mua lẻ) và giá cho từng khóa trong kho nội dung có phiên bản.

## 4. Hệ quả hệ thống (cần quyết sớm)

- **Quyền (entitlement) ở máy chủ:** bảng quyền (người dùng, sản phẩm, nguồn, trạng thái, hạn), RPC kiểm tra, cập nhật qua thông báo từ cửa hàng/cổng thanh toán. Client chỉ nhận cờ. `mcy-ai-assistant` phải kiểm quyền cùng cohort, đồng ý AI và cổng chi tiêu.
- **Video trả phí không thể nằm ở YouTube unlisted** (ai có liên kết đều xem được; AGENTS.md cũng cấm tải/sao chép). Cần nguồn riêng có quyền và có liên kết ký hoặc bảo vệ tương đương. Quyết định này đứng trước khi quay khóa trả phí.
- **Snapshot công khai `manifest.json`** chỉ được chứa metadata của khóa trả phí (tên, mô tả, giá, bài xem thử), không có địa chỉ video.
- **Thanh toán:** theo trang chính sách của Google Play, hàng hóa số bán trong app Android phải dùng Play Billing; không được dẫn người dùng ra ngoài để mua; thanh toán thay thế chỉ cho một số thị trường (các trang tôi tìm thấy nêu EEA, Anh, Mỹ; **Việt Nam không thấy**, cần kiểm trong Play Console). iOS (chưa build) có luật tương tự, cần kiểm khi tới giai đoạn iOS. Phí nền tảng ảnh hưởng giá. Web có thể dùng cổng thanh toán riêng; quyền cần hợp nhất hai nguồn.
- **Pháp lý và Play listing (Owner/người phụ trách pháp lý):** điều khoản bán hàng, hoàn tiền, hóa đơn/thuế, Data safety (mục "mua hàng"), khai báo "có giao dịch trong ứng dụng".
- **Chất lượng nội dung:** khóa trả phí cần chuẩn cao hơn (duyệt chuyên môn, quyền, caption); hiện danh mục đã duyệt là 0 và chưa có người duyệt có tên.
- **Chi phí AI:** trả phí khớp với ngân sách OpenRouter do Owner quyết; vẫn cần hạn mức theo người, công tắc tắt, và cổng chi tiêu hiện có.
- **Rủi ro kinh doanh:** nếu gói miễn phí quá nghèo thì mất niềm tin; Chút lớp 1 và 38 clip phải thật sự hữu ích.

## 5. Việc nên làm trong bản miễn phí để không phải làm lại

1. Thêm trường `access` (`free|member|purchase`, mặc định `free`) vào mô hình nội dung và snapshot.
2. Gom mọi kiểm tra quyền vào một hàm client (`hasEntitlement`), mặc định miễn phí; AI đi qua đó.
3. Chuẩn bị khe giao diện "Gói và mua hàng" nhưng **ẩn**; không lộ giao diện trả phí khi chưa có sản phẩm bán.
4. Không quảng bá AI trước khi AI thật chạy.
5. Quyết vị trí lưu video trả phí trước khi quay khóa.

## 6. Quyết định của Owner (18/11) và việc còn mở

Đã quyết: (1) mô hình giá **lai** (thuê bao + mua lẻ khóa); (2) AI **theo gói** và có thể **kèm từng khóa** (lúc đặt giá khóa có tùy chọn "bao gồm AI"; bật thì người mua dùng được AI); (3) khóa trả phí **Owner tự quay**; (5) gói miễn phí giữ 38 clip, Chút lớp 1, Hành trình; (6) **giai đoạn F** sau Closed testing, điều kiện vào: ≥ 1 khóa trả phí đã duyệt, người duyệt chuyên môn có tên, quyết định thanh toán và video có bảo vệ, kiểm Play Console cho Việt Nam.

Còn mở (Owner quyết, agent không đề xuất con số ngân sách): phương án quản lý quyền A (tự làm trên Supabase, nhận thông báo Google Play) hay B (dịch vụ như RevenueCat); Android trước, web sau; pháp nhân đứng bán và hồ sơ thanh toán Google; con số hoàn tiền; phạm vi AI kèm khóa (toàn app hay chỉ ngữ cảnh khóa) và thời hạn/hạn mức; có dùng thử AI không; khóa trả phí có gồm lớp trực tiếp không; kênh hỗ trợ.

## 7. Nền tảng thanh toán (đề xuất, ⚑ = cần kiểm nguồn chính thống)

- **Android trong app: Google Play Billing, bắt buộc** cho hàng hóa số (khóa, thuê bao, quyền AI). Không dẫn ra ngoài để mua. Thanh toán thay thế chỉ ở một số thị trường; Việt Nam không thấy ⚑. Cần hồ sơ thanh toán và nhận tiền về Việt Nam ⚑; phí dịch vụ của Google ảnh hưởng giá ⚑.
- **Web (sau, F3):** Stripe nhiều nguồn nói chưa cho doanh nghiệp đăng ký tại Việt Nam ⚑; cổng nội địa (MoMo, VNPay, PayOS/VietQR, ZaloPay) hợp mua lẻ một lần hơn thuê bao tự gia hạn; merchant-of-record nước ngoài cần kiểm điều kiện Việt Nam ⚑.
- **Hợp nhất quyền:** bảng quyền của MCY là nguồn sự thật duy nhất (client và AI chỉ đọc). Nguồn cấp dữ liệu thay thế được: A tự làm (Edge Function nhận RTDN, gọi Play Developer API) hoặc B dịch vụ quản lý quyền (thêm bên xử lý dữ liệu: cập nhật chính sách riêng tư và Data safety). Chọn đầu giai đoạn F sau thử với license tester.
- **Bảng quyền:** user_id, product_id, source (play/web/owner_grant/promo), status, expires_at, ai_included, ai_until, ai_quota, nhật ký. AI mở khi: (gói còn hạn HOẶC khóa còn hạn có ai_included) VÀ đồng ý AI riêng VÀ cổng hệ thống + ngân sách Owner VÀ hạn mức người dùng; kiểm ở máy chủ.
- **Giá và tùy chọn AI** nằm ở bản ghi "ưu đãi" tách khỏi nội dung đã duyệt, để đổi giá không đổi hash bài đã duyệt.
- **Video trả phí:** nơi lưu có liên kết phát có chữ ký, hết hạn ngắn, HLS (dịch vụ video có token, Supabase Storage + liên kết ký, Vimeo riêng tư; chưa so giá, cần thử một video trên điện thoại thật). Không chặn được quay màn hình; mục tiêu là chặn chia sẻ liên kết và xem khi chưa có quyền.

## 8. Chính sách hoàn tiền (bản nháp để Owner và pháp lý quyết; số trong [ ] do Owner đặt)

- Khóa mua lẻ: hoàn 100% trong [7] ngày nếu đã xem chưa quá [30]% số bài; ngoài mức đó không hoàn trừ lỗi hệ thống.
- Thuê bao: hủy bất cứ lúc nào, quyền giữ đến hết chu kỳ đã trả; không hoàn phần chu kỳ đã bắt đầu, trừ trong [48 giờ] sau tự gia hạn; nhắc trước khi gia hạn năm.
- Khóa kèm AI: AI là một phần của quyền; hoàn tiền thu hồi cả khóa và AI của lần mua đó; không hoàn "từng phần AI".
- Lỗi của MCY (trừ hai lần, đã trả không mở khóa, video không xem được kéo dài, khóa bị gỡ vì an toàn/chuyên môn): hoàn 100% bất kể thời hạn.
- Qua Google Play: Google xử lý trong 48 giờ đầu ⚑; sau đó Owner xử lý bằng công cụ hoàn tiền trong Play Console.
- Sau hoàn tiền/hủy: thu hồi quyền của lần mua đó, không xóa Hành trình hay dữ liệu cá nhân; Chút về gợi ý theo quy tắc.
- Quy trình: kênh hỗ trợ thật (Owner quyết), phản hồi trong [2] ngày làm việc, hoàn qua đúng kênh đã trả, ghi sổ. Không quảng bá yoga như chữa bệnh.
- **Cần người phụ trách pháp lý xác nhận ⚑:** luật bảo vệ quyền lợi người tiêu dùng (hợp đồng từ xa, quyền hủy, thông tin trước khi mua), quy định thương mại điện tử về hàng hóa số, hóa đơn điện tử và thuế dịch vụ số, điều khoản bán hàng của Google Play. Thời hạn và tỷ lệ trên chỉ là điểm khởi đầu, không phải luật.

## 9. Lộ trình giai đoạn F (đề xuất)

F0 (trong bản miễn phí): trường `access`, hàm `hasEntitlement`, khe "Gói và mua hàng" ẩn; không đổi gì người dùng thấy. F1: video có bảo vệ + ≥ 1 khóa + người duyệt có tên. F2: bảng quyền, Play Billing với license tester trong Closed testing, điều khoản và hoàn tiền đăng công khai, cập nhật Data safety. F3: web mua lẻ (tùy chọn). F4: AI trả phí, chỉ khi AI thật chạy.

Nguồn chính sách: [Google Play Payments / Alternative billing (trợ giúp)](https://support.google.com/googleplay/android-developer/answer/12348241), [Learn about Google Play & alternative billing systems](https://support.google.com/googleplay/answer/11174377). Danh sách thị trường thay đổi theo thời gian; trang trợ giúp hiện hành mới là nguồn chuẩn.

## Chưa kiểm

Mọi mục là phân tích, chưa có người dùng thử; chính sách cửa hàng chỉ đọc qua tìm kiếm (chưa kiểm trong Play Console cho Việt Nam); thông tin Play Billing, cổng thanh toán Việt Nam và RevenueCat đọc qua tìm kiếm (nguồn thứ cấp), chưa gọi thử, chưa có license tester, chưa đối chiếu pháp lý, chưa so phí; canvas chưa được dựng để xem bằng mắt khi viết.
