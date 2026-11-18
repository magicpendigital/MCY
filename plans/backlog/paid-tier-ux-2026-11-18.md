# UI/UX cho mô hình trả phí: khóa học trả phí và AI cho khách hàng trả phí — 2026-11-18

Nguồn: Owner 18/11: "sau này có khóa học trả phí; AI chỉ dành cho khách hàng trả phí". Đây là **phân tích và đề xuất**, chưa phải lệnh làm. Bản 1.0 vẫn không thanh toán và không AI (`AGENTS.md`); mọi tên gói, giá, chu kỳ dưới đây là chỗ giữ chỗ **do Owner đặt**. Canvas: trang "Mô hình trả phí" tại https://claude.ai/artifact/Uxw44YQsBvUdCFffPfPcHg (T1 bậc quyền, T2 luồng; T3 màn hình và T4 hệ thống còn chờ đăng).

## 1. Bậc quyền đề xuất

| | Khách | Tài khoản miễn phí | Thành viên (trả phí) | Mua lẻ một khóa |
|---|---|---|---|---|
| 38 clip miễn phí, 3 chạm tới video | Có | Có | Có | Có |
| Chút lớp 1 (chip vùng, chuỗi bài, phản hồi 1 chạm) | Có | Có | Có | Có |
| Mọi thông tin an toàn (câu dừng khi đau, hướng dẫn, rút đồng ý, xóa tài khoản) | Có | Có | Có | Có |
| Hành trình lưu trên tài khoản | Chỉ trên máy | Có | Có | Có |
| Xem thử một bài của khóa trả phí | Có | Có | Có | Có |
| Toàn bộ khóa học trả phí | Không | Không | Theo gói (Owner quyết) | Khóa đã mua |
| Chút AI (lớp 2–3) | Không | Không | Có, sau các cổng an toàn | Không, trừ khi Owner gộp |

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

## 6. Cần Owner quyết

1. Mô hình giá: thuê bao, mua lẻ khóa, hay lai.
2. AI gộp vào gói thành viên hay bán riêng; có dùng thử AI không (ngân sách do Owner, không agent nào đề xuất con số).
3. Khóa trả phí do ai quay và có gồm lớp trực tiếp ("Lớp của tôi") không.
4. Nền tảng thanh toán (Play Billing cho Android; web dùng cổng nào) và chính sách hoàn tiền.
5. Gói miễn phí gồm những gì (đề xuất: giữ nguyên 38 clip, Chút lớp 1, Hành trình).
6. Mốc thời gian: đề xuất "giai đoạn F" sau Closed testing; điều kiện vào: ≥ 1 khóa trả phí đã duyệt, người duyệt chuyên môn có tên, quyết định thanh toán và video có bảo vệ, kiểm Play Console cho Việt Nam.

Nguồn chính sách: [Google Play Payments / Alternative billing (trợ giúp)](https://support.google.com/googleplay/android-developer/answer/12348241), [Learn about Google Play & alternative billing systems](https://support.google.com/googleplay/answer/11174377). Danh sách thị trường thay đổi theo thời gian; trang trợ giúp hiện hành mới là nguồn chuẩn.

## Chưa kiểm

Mọi mục là phân tích, chưa có người dùng thử; chính sách cửa hàng chỉ đọc qua tìm kiếm (chưa kiểm trong Play Console cho Việt Nam); các màn hình T3 và sơ đồ hệ thống T4 chưa đăng lên canvas.
