# Đánh giá hướng logo người tập yoga từ ảnh tham chiếu

Ngày 25.09.2026 · Trạng thái: phác thảo vector để đánh giá, chưa chốt nhận diện hoặc thay logo trong ứng dụng.

## Kết luận thiết kế

**Có thể làm theo hướng này.** Dáng người đang tập giúp người mới hiểu nhóm sản phẩm nhanh hơn các dấu lá trừu tượng. Mầm nhỏ giữ sự mềm mại của hệ màu và có thể gợi việc chăm sóc bản thân từng ngày. Hình tham chiếu phù hợp nhất như một *minh họa thương hiệu*; cần rút gọn thành một dấu hình có hai mức chi tiết để làm logo hệ thống.

## Điều giữ và điều chỉnh từ ảnh

| Thành phần | Quyết định sơ bộ | Lý do |
|---|---|---|
| Dáng ngồi khoanh chân, hai tay thả lỏng | Giữ trong bản nét đầy đủ; cô đọng ở icon | Nhận ra yoga và cảm giác êm; nhiều giao điểm nét ở cỡ nhỏ sẽ bết. |
| Hai lá/mầm trên đầu | Giữ như chi tiết nhận diện, tăng kích cỡ trong bản cô đọng | Giữ cầu nối với hướng cũ; bản gốc có thể đọc như nơ/kẹp tóc khi thu nhỏ. |
| Đường nét trắng trên nền xanh nhạt | Giữ làm biến thể cho ấn phẩm lớn; dùng xanh rừng trên nền sáng hoặc trắng trên nền xanh đậm ở UI | Với xanh nhạt tham chiếu xấp xỉ `#A8C398`, tương phản trắng khoảng **1,92:1**; xanh rừng `#25372D` trên cùng nền khoảng **6,57:1**. |
| Chữ viết tay nhiều nét + cành lá gạch chân | Chỉ dùng như phong cách chiến dịch sau khi kiểm tra font/quyền dùng; bỏ khỏi icon và logo nhỏ | Dễ mất dấu tiếng Việt, khó đọc, khó canh vector và làm chuyển động. |
| Khoảng trống lớn giữa biểu tượng và tên | Rút lại thành lockup ngang/dọc có khoảng cách cố định | Dễ dùng ở app, banner, ảnh đại diện và vật phẩm in. |

## Hệ biến thể đề xuất

1. **Biểu tượng nét đầy đủ**: SVG một màu, nét tròn đồng nhất, cho splash, ấn phẩm, hình mở đầu, kích thước từ khoảng 80 px trở lên.
2. **Biểu tượng cô đọng**: cùng cấu trúc đầu–mầm–tay–chân, bỏ bớt nét nội thất và dùng đầu/mầm đặc, cho icon ứng dụng, avatar, loading và nhãn nhỏ. Cần thử thực tế ở 24, 32, 48 px; không khẳng định 24 px đã đạt nếu chưa thấy trên thiết bị.
3. **Wordmark**: tên chính thức “Một chút yoga” với dấu tiếng Việt chuẩn. Kiểu chữ trong bảng xem là mô phỏng. Sau khi chọn font và kiểm tra quyền sử dụng, chuyển wordmark thành outline/path cho bộ bàn giao.
4. **Trang trí phụ**: cành/lá và đường gạch trong ảnh chỉ là pattern cho bìa, poster, social; không ghép cứng vào logo chính.

## Ứng dụng theo bề mặt

| Bề mặt | Cách dùng | Kiểm tra trước khi chốt |
|---|---|---|
| Icon iOS/Android | Bản cô đọng một màu, nền xanh rừng hoặc ngà, không có chữ | Tương phản, vùng an toàn, nhận diện ở 24–48 px, Android monochrome/theme; so cạnh các icon khác. |
| Header, tab, trạng thái trong app | Biểu tượng cô đọng cạnh tên hoặc đứng một mình nếu đã có ngữ cảnh | Không dùng logo làm icon chức năng như Back, Home, Start; tránh gây nhầm điều hướng. |
| Splash/màn hình mở đầu | Bản nét đầy đủ có thể dùng trong chuyển tiếp ngắn sau khi app sẵn sàng; Android có thể dùng icon vector động của hệ thống | iOS launch screen là tĩnh và nên giống màn hình đầu; Android 12+ yêu cầu AnimatedVectorDrawable cho icon động và khuyến nghị chuyển động không quá khoảng 1 giây. Không kéo dài thời gian mở app chỉ để xem hoạt hình. |
| Loading | Chuyển động thở rất nhẹ của dấu cô đọng; khi tải có thời lượng xác định thì dùng progress thật | Không dùng vòng quay/tiến trình giả; có thông điệp rõ nếu chờ lâu và hỗ trợ giảm chuyển động. |
| Poster, mạng xã hội, banner | Bản nét đầy đủ có không gian rộng, tên và thông điệp rõ; cành lá có thể là họa tiết phụ | Kiểm tra ảnh thu nhỏ, chữ Việt, bản in một màu, độ tương phản. |
| Vật phẩm in, thêu, dập nổi | Bản đơn sắc với nét dày; ưu tiên bản cô đọng cho kích thước nhỏ | In thử thực tế để xem các vòng chân và lá còn tách nhau. |

## Rủi ro cần nói thẳng

- Tư thế ngồi khoanh chân có thể làm người dùng nghĩ ứng dụng chỉ dạy thiền hoặc đòi hỏi tư thế mà họ chưa làm được. Tên, hình ảnh và trải nghiệm nên cho thấy lựa chọn bài tập phù hợp với nhiều mức vận động.
- Người với mầm trên đầu là mô-típ có thể đã được dùng ở lĩnh vực yoga/wellness. Đây chưa phải kết luận về khả năng đăng ký; cần tra cứu hình tương tự và rà soát pháp lý trước khi công bố.
- Nét mảnh trong ảnh gốc sẽ biến mất ở kích thước nhỏ. Dùng một SVG gốc thu tỉ lệ cho mọi bề mặt sẽ không đạt; hai mức chi tiết là điều kiện kỹ thuật quan trọng của hướng này.
- Hoạt hình CSS trong bảng xem là chứng minh ý tưởng; khi làm ứng dụng cần dùng cơ chế native phù hợp từng nền tảng. Với tùy chọn giảm chuyển động, dùng hình tĩnh.

## Đề xuất bước tiếp

So bản cô đọng của hướng người tập với **Lá đơn** và **Dấu ngắt** trong thử nghiệm nhận diện mù. Nếu người dùng nhận ra yoga nhưng vẫn cảm thấy gần gũi và nhớ được hình sau vài giây, phát triển tiếp bộ wordmark, quy chuẩn khoảng trống, màu, export iOS/Android và motion spec. Không thay logo ứng dụng trước khi chọn bản cuối.

## Tham chiếu kỹ thuật

- Apple, App icons: https://developer.apple.com/design/human-interface-guidelines/app-icons
- Android Developers, Adaptive icons: https://developer.android.com/develop/ui/compose/system/icon_design_adaptive
- Apple, Launching: https://developer.apple.com/design/human-interface-guidelines/launching
- Android Developers, Splash screens: https://developer.android.com/develop/ui/views/launch/splash-screen
- MDN, prefers-reduced-motion: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/%40media/prefers-reduced-motion
