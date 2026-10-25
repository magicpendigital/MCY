# Bản nháp hồ sơ Google Play — Một chút yoga (23/10/2026)

Bản nháp để Owner xem và tự điền vào Play Console; chưa gửi gì lên Google. Biểu mẫu Play thay đổi theo thời gian — đối chiếu lại câu hỏi hiện hành khi điền. Phạm vi: bản 1.0 = khách dùng ngay, tài khoản email tùy chọn, **không AI**, không buổi thực hành mới.

## 0. Trạng thái trên Play Console (25/10/2026)

Tài khoản nhà phát triển cá nhân **Tuyên Trịnh** (app ID Console 4975610131404090547). Đã làm: tạo app (Một chút yoga, miễn phí, vi); phát hành 1 (1.0.0) lên Thử nghiệm nội bộ; Chính sách quyền riêng tư (`/privacy.html`); Quyền truy cập ứng dụng = **không hạn chế** (khách dùng được toàn bộ; tài khoản chỉ để lưu/đồng bộ — Owner cần xác nhận phần Hành trình khi chưa đăng nhập); Quảng cáo = không; Đối tượng mục tiêu = **16–17 và 18+**. Cũng đã khai: An toàn dữ liệu (thu thập tên, email, ID người dùng, thông tin sức khỏe tự báo; mục đích chức năng + quản lý tài khoản; không chia sẻ; mã hóa khi truyền; URL xóa tài khoản), Ứng dụng của chính phủ = không, Tính năng tài chính = không có, Sức khỏe = hoạt động/thể dục + giảm căng thẳng, Danh mục = Sức khỏe và thể dục, Liên hệ công khai = magicpendigital@gmail.com + website, trang cửa hàng (mô tả ngắn/đầy đủ vi, icon, feature graphic, 4 ảnh chụp). Mục “khai báo thành phần do AI tạo” chưa chọn (Owner cần xác nhận ảnh minh họa có do AI tạo hay không). Mức phân loại nội dung (IARC) đã khai ngày 25/10/2026 theo xác nhận của Owner (đồng ý điều khoản IARC, email magicpendigital@gmail.com): loại “Mọi loại ứng dụng khác”; có nội dung trực tuyến (video YouTube); không bạo lực/tình dục/ngôn ngữ/chất kích thích/quảng bá hàng giới hạn tuổi/mua hàng/chia sẻ vị trí/tương tác người dùng/trình duyệt; không phải sản phẩm giáo dục-tin tức; kết quả hiển thị “Mọi độ tuổi” (chi tiết xem trên Console). Bảng thiết lập ứng dụng đã báo sẵn sàng; **chưa bấm “Gửi thay đổi đi xem xét”**. Tài nguyên đã tạo cục bộ (không commit): `.vercel/play-assets/` — icon 512, feature graphic 1024×500, 4 ảnh chụp 1080×1920.

## 1. Việc Owner cần làm trước khi nộp

1. ~~Điền thông tin pháp nhân và email liên hệ~~ — **đã điền 23/10/2026**: Magicpen Digital, magicpendigital@gmail.com (hiển thị công khai trên 3 trang). `npm run check:legal` đạt và vẫn chặn `android:release:bundle` nếu sau này còn ký hiệu `[[…]]`.
2. Xác nhận các giả định tôi đã viết vào chính sách (sửa nếu khác): độ tuổi tối thiểu **16**; yêu cầu xóa qua email xử lý **trong 30 ngày**; không chia sẻ dữ liệu với giáo viên/bên thứ ba ở bản này; chỉ có Supabase (Singapore), Resend, Vercel, YouTube là bên xử lý; chu kỳ sao lưu của nhà cung cấp (chưa nêu số ngày).
3. Triển khai bản web có ba trang `/privacy.html`, `/terms.html`, `/delete-account.html` trên `motchutyoga.magicpendigital.com`; Play cần URL công khai hoạt động.
4. ~~Áp dụng migration xóa tài khoản và Mệt/Khó chịu~~ — **đã áp lên staging `mcy-staging` ngày 24/10/2026** (phiên bản remote 20261023171158 và 20261023171210). Khi lên production cần lặp lại theo review riêng trước khi phát hành bản app.

## 2. Data safety (gợi ý trả lời)

| Câu hỏi | Gợi ý | Căn cứ |
|---|---|---|
| Có thu thập dữ liệu người dùng? | Có (chỉ khi có tài khoản) | Email, hồ sơ, check-in |
| Địa chỉ email | Thu thập · bắt buộc khi tạo tài khoản · chức năng ứng dụng, quản lý tài khoản · không chia sẻ | Supabase Auth |
| User ID | Thu thập · quản lý tài khoản · không chia sẻ | `auth.users.id` |
| Thông tin sức khỏe (check-in tự báo cáo) | Thu thập · tùy chọn (cần đồng ý riêng) · chức năng ứng dụng · không chia sẻ | `checkins`, `checkin_observations` |
| Vị trí, danh bạ, ảnh, âm thanh, tệp | Không | — |
| Hoạt động trong ứng dụng / phân tích / quảng cáo | Không thu thập | Không có SDK phân tích hay quảng cáo |
| Mã định danh thiết bị | Không thu thập bởi ứng dụng | Nhật ký hạ tầng không dùng để theo dõi |
| Chia sẻ với bên thứ ba | Không (nhà cung cấp hạ tầng xử lý thay mặt, không phải “chia sẻ”) — đối chiếu định nghĩa hiện hành | Supabase, Resend, Vercel |
| Mã hóa khi truyền | Có | HTTPS |
| Cho phép yêu cầu xóa dữ liệu | Có — trong ứng dụng (Cá nhân → Bảo mật tài khoản) và URL web `https://motchutyoga.magicpendigital.com/delete-account.html` | Phải khai cả hai |
| Dữ liệu YouTube khi nhấn Phát | Ghi chú: trình phát YouTube nhúng do Google xử lý theo chính sách của Google | Chỉ kết nối khi nhấn Phát |

## 3. Nội dung và đối tượng

- Đối tượng mục tiêu: **16+**; không dành cho trẻ em; không tham gia Play Families.
- Xếp hạng nội dung: không bạo lực, không nội dung người lớn; có nội dung sức khỏe/wellbeing tự báo cáo (không y tế).
- Khai báo ứng dụng sức khỏe (nếu biểu mẫu hiện hành áp dụng): ứng dụng wellbeing/yoga, **không** chẩn đoán, điều trị hay thiết bị y tế; dữ liệu sức khỏe do người dùng tự nhập.
- Quảng cáo: không. Giao dịch/mua trong ứng dụng: không.
- Quyền Android: chỉ `INTERNET`.
- Ghi chú để đối chiếu với trình duyệt WebView: video YouTube nhúng; chưa kiểm phát trên thiết bị thật (xem AGENTS.md mục YouTube native).

## 4. Mô tả cửa hàng (nháp, tiếng Việt)

**Tên:** Một chút yoga  
**Mô tả ngắn (≤ 80 ký tự):** Ghi nhận cơ thể mỗi ngày và tập yoga nhẹ nhàng theo nhịp của bạn.

**Mô tả đầy đủ:**
Một chút yoga giúp bạn dừng lại một nhịp, lắng nghe cơ thể và chọn một bài tập nhẹ nhàng phù hợp với hôm nay.

• Trải nghiệm thử ngay, không cần tài khoản.
• Check-in cơ thể: chạm vào hình hoặc chọn vùng cổ, vai, lưng, tay, chân và ghi lại cảm nhận của bạn.
• Bài học yoga miễn phí từ kênh Một chút yoga, bạn tự chọn thứ tự và nhịp tập.
• Hành trình: xem lại từng lần ghi nhận, không suy diễn thành điểm số hay tiến bộ.
• Tài khoản email là tùy chọn để lưu hành trình; bạn có thể xóa tài khoản và dữ liệu bất cứ lúc nào trong ứng dụng.

Ứng dụng không chẩn đoán, không điều trị và không thay thế tư vấn y tế. Hãy dừng tập nếu thấy đau tăng.

## 5. Tài nguyên cần chuẩn bị

Icon 512×512 (từ bộ icon Khoảng mở), feature graphic 1024×500, tối thiểu 2 (nên 4–8) ảnh chụp màn hình điện thoại từ bản build thật, URL chính sách quyền riêng tư, URL xóa tài khoản, email liên hệ nhà phát triển.

## 6. Closed testing (tài khoản cá nhân)

Cần ít nhất 12 người tham gia liên tục 14 ngày trước khi xin production (theo trợ giúp Play Console; đối chiếu lại). Chuẩn bị danh sách người thử thật, hướng dẫn tham gia qua liên kết/nhóm Google, kênh nhận phản hồi. Kiểm tra bản build đầu tiên trên Air1 Ultra và ít nhất một máy khác trước khi mời.
