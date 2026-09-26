# Một chút yoga — ba hướng lá / mầm

Ngày 25.09.2026. Đây là các phác thảo để lựa chọn, chưa phải logo cuối cùng.

## Nguyên tắc chung

- Biểu tượng cây đứng riêng, không gắn lên đầu người. Bỏ thế đối xứng dễ bị hiểu là nơ tóc.
- Cả ba dùng một hệ SVG 100 × 100, nét đơn 6 đơn vị, đầu và góc bo tròn, không tô nền. Khi thu nhỏ hoặc đổi màu vẫn dùng cùng đường vẽ.
- Không dùng hiệu ứng, gradient, chi tiết xước hay chữ viết tay trong biểu tượng gốc. Chữ ký dùng kiểu chữ dễ tái tạo để có thể triển khai trên in ấn, màn hình và motion.

| Phương án | Ý nghĩa | Điểm mạnh | Rủi ro cần kiểm tra |
|---|---|---|---|
| Lá mở | Lời mời nhẹ, khoảng thở | Ít nét; dễ nhận ở kích thước nhỏ; in một màu thuận lợi | Có thể giống lông vũ nếu thân lá quá hẹp |
| Mầm lệch | Bắt đầu nhỏ và lớn dần | Diễn đạt “một chút” rõ; lá lệch cấp độ, có thân và nền nên ít giống nơ | Cần xem lại độ thoáng ở 24 px |
| Lá trên đường đi | Bước tiến liên tục | Có đường dẫn tự nhiên để tạo animation | Nét ngang có thể bị đọc thành gạch trang trí |

## Ứng dụng dự kiến

- **Ứng dụng:** dùng riêng biểu tượng cho icon; dùng biểu tượng cùng chữ “Một chút yoga” ở màn chào. Thử trên cả iOS/Android ở kích thước hiển thị thực tế trước khi chốt độ dày nét.
- **Nội dung truyền thông:** dùng bản một màu trên ảnh, nền xanh rừng, nền ngà; chữ ký ngang đặt ở vị trí có khoảng trống, không đặt đè lên mặt hoặc tư thế tập.
- **In ấn:** SVG ít điểm neo, nét đồng nhất; có thể chuyển nét thành outline khi bàn giao nhà in. Cần bản đảo màu và quy định khoảng trống an toàn.
- **Chuyển động:** giữ hình cuối khớp chính xác SVG tĩnh. Với mầm lệch, vẽ thân trước, lá dưới rồi lá trên trong khoảng 0,8–1,2 giây cho splash. Loading nên ưu tiên chỉ báo tiến trình thật; không dùng logo chuyển động để giả biểu thị tiến độ.

## Đề xuất

Phát triển **Mầm lệch** thêm một vòng vì hình cây được hiểu rõ hơn và hợp ý “mỗi ngày một chút”. Giữ **Lá mở** làm đối chứng cho bài kiểm tra icon nhỏ. Hỏi 5–8 người xem từng biểu tượng trong 2 giây: họ thấy hình gì, nhớ được gì sau một phút, và có đọc thành tóc/nơ không. Chỉ sau đó mới tinh chỉnh tỉ lệ và chuẩn hóa bộ logo ngang/dọc, icon, vùng an toàn và motion.

SVG gốc: `brand-assets/logo-leaf-open.svg`, `brand-assets/logo-sprout-asymmetric.svg`, `brand-assets/logo-leaf-path.svg`.
