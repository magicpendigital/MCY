# MCY — phương án lưu trữ và phát video

Ngày 27/09/2026. Phân tích, chưa upload, mua dịch vụ hoặc triển khai. Slogan đúng: **Vạn chút an yên**.

## Khuyến nghị

Giữ bản gốc và backup độc lập. Teacher draft dùng private staging. Thử ít clip đã duyệt trên Supabase Storage hiện có; khi mở trải nghiệm học viên, cân nhắc dịch vụ video chuyên dụng cho bài giảng cốt lõi. YouTube dùng cho nội dung giới thiệu/kiến thức công khai miễn phí. Chưa nên vận hành VPS video riêng.

Provider và ngân sách là đề xuất; không thay thế gate teacher roster, quyền media, privacy statement, scanning và learner-visible publication đã xác định.

## Dữ liệu đầu vào

38 MOV dọc; tổng 551.262.056 byte (~551 MB), 1.349,304 giây (~22 phút 29 giây), 17–63 giây/file. Trung bình ~14,5 MB/file, bitrate suy ra từ tổng bytes/thời lượng ~3,27 Mbit/s gồm audio/container; chưa phân tích codec. 100 lượt xem trọn bộ nguồn, mỗi file tải đầy đủ một lần, tương đương ~55,1 GB trước cache/chuyển mã/xem lại/overhead. Đây là phép tính, không phải lưu lượng thực tế. Kho nhỏ không đồng nghĩa băng thông nhỏ.

## Các lựa chọn

| Cách | Ưu điểm | Trách nhiệm/giới hạn | Vai trò đề xuất |
|---|---|---|---|
| VPS riêng | Kiểm soát toàn bộ | OS, bảo mật, backup, encode, CDN, monitoring và tải cao | Chưa phù hợp quy mô |
| Object storage + CDN | UI/player và quyền do MCY kiểm soát | Chuẩn hóa video, caption, seek/range, retry, cache; adaptive bitrate phải bổ sung nếu cần | Pilot nhỏ |
| YouTube embed | Chuyển mã và phân phối sẵn; MCY không trả theo GB lưu/phát thông thường | Quảng cáo, branding, chia sẻ link, điều khoản nền tảng | Nội dung công khai miễn phí |
| Managed video | Pipeline video có sẵn, API, truy cập có token | Phí dịch vụ; vẫn cần backend kiểm quyền | Ứng viên cho học liệu cốt lõi |

Object storage không phải tự vận hành VPS, cũng không tự có đầy đủ pipeline streaming. Dịch vụ video chuyên dụng cũng có thể embed; iframe chỉ là cách hiển thị.

## YouTube: các giới hạn cần tính trước

- Unlisted cho phép bất kỳ ai có link xem và chia sẻ. Private dùng người xem được chỉ định, không tự đồng bộ quyền với tài khoản MCY. [Privacy settings](https://support.google.com/youtube/answer/157177?hl=en).
- Quảng cáo có thể xuất hiện kể cả kênh không tự bật kiếm tiền. Không cam kết buổi tập/thiền luôn không quảng cáo. [YouTube ads](https://support.google.com/youtube/answer/2475463?hl=en).
- `rel=0` không xóa hoàn toàn video liên quan; `modestbranding` không còn hiệu lực. [Player parameters](https://developers.google.com/youtube/player_parameters).
- Không che player/controls bằng overlay của app; cần thiết kế ghi chú và tiến độ ngoài player. Kích thước tối thiểu 200×200 px cần tính trên điện thoại hẹp. [Required functionality](https://developers.google.com/youtube/terms/required-minimum-functionality).
- Chính sách API không cho thu tiền để xem nội dung trong embedded player. Không chọn YouTube làm nền mặc định cho khóa học trả phí; mô hình thương mại cụ thể cần rà điều khoản. Đây không phải kết luận mọi sản phẩm giáo dục có nhúng video đều không được thu phí. [Developer policies](https://developers.google.com/youtube/terms/developer-policies).
- Capacitor cần kiểm WebView identity/Referer; YouTube mô tả lỗi 153 khi thiếu Referer. Privacy-enhanced mode không có nghĩa không gửi dữ liệu Google, và có giới hạn website/app. [Embed guidance](https://support.google.com/youtube/answer/171780?hl=en).

Theo dõi sự kiện phát qua API có thể hỗ trợ tiến độ, nhưng lượt xem không chứng minh đã thực hành. Không giả định YouTube hỗ trợ audio-only thiền chạy nền/offline trong app. Không gửi thông tin check-in vào URL hoặc analytics provider.

## Storage + CDN cho pilot

Chuẩn hóa vài MP4 tương thích rồi thử private bucket, quyền server và URL ngắn hạn. Giữ MOV gốc ngoài bundle web/native. Với clip dưới khoảng một phút, progressive MP4 có thể đủ; cần đo trước khi dựng HLS. Test Safari/Chrome/WebView, mạng yếu, tua, caption và token hết hạn lúc pause/resume.

URL ký là bearer link trong thời hạn; không phải DRM/chống quay màn hình. Cache và policy phải cấu hình đúng. Chỉ giấu đường dẫn sau nút đăng nhập không đủ bảo vệ nội dung.

Supabase công bố quota cached/uncached độc lập: Free 5 GB mỗi loại; Pro 250 GB mỗi loại, overage $0,03/$0,09 mỗi GB tương ứng. [Egress](https://supabase.com/docs/guides/platform/manage-your-usage/egress). Pro từ $25/tháng, compute/add-on có thể thêm phí; không tính toàn bộ phí backend là chi phí video nếu MCY vốn đã cần backend đó. [Pricing](https://supabase.com/pricing).

Staging hiện Free; không nâng gói trong lượt này. Dung lượng nguồn có thể vừa quota danh nghĩa, nhưng bản phát/poster và băng thông phải tính riêng. So sánh cả công chuyển mã, player và vận hành.

## Ví dụ managed video: Cloudflare Stream

Giá kiểm tra 27/09/2026: $5/tháng mỗi block 1.000 phút lưu; $1/1.000 phút phân phối; encoding/ingress bao gồm. [Pricing](https://developers.cloudflare.com/stream/pricing/).

| Giả định/tháng | Phút phát | Chi phí video minh họa |
|---|---:|---:|
| 20 người × 10 phút × 10 ngày | 2.000 | $7 |
| 100 người × 10 phút × 20 ngày | 20.000 | $25 |
| 1.000 người × 10 phút × 20 ngày | 200.000 | $205 |

Một block lưu trữ; chưa thuế, backend, backup và hạng mục ngoài video. Phút phân phối tính phí có thể khác phút xem hữu ích vì buffering/preload. Đây là kịch bản, không phải dự báo.

Để đối chiếu storage/CDN: 20.000 phút ở bitrate tổng giả định 1,5–2,5 Mbit/s ~225–375 GB trước overhead. Chưa đo chất lượng encode của bộ nguồn ở bitrate đó. Chi phí còn phụ thuộc cache/quota/công vận hành; không kết luận Stream luôn rẻ hơn Supabase.

Stream có signed token và allowed origins; phải bật yêu cầu signed access, vì video ID mặc định chưa phải private. Domain restriction không thay authorization, token không phải DRM. [Access control](https://developers.cloudflare.com/stream/viewing-videos/securing-your-stream/). Chưa benchmark nhà cung cấp tại mạng/thiết bị của người dùng; chọn Stream ở đây làm ví dụ minh bạch giá, không phải kết quả đấu thầu.

## Cấu trúc tích hợp và bước chọn

Supabase giữ lesson/version, quyền, reviewer, publication, locale và mapping media. Provider giữ video/renditions. Server kiểm quyền/version/trạng thái rút trước khi cấp playback token; video tải trực tiếp CDN, không chạy xuyên qua Vercel function. Secrets ở server; URL có hạn không lưu làm link vĩnh viễn.

Mở rộng mô hình asset hiện có với provider/video ID, playback policy, trạng thái xử lý và metadata; không thêm bảng trùng media_renditions một cách máy móc. Giữ backup gốc, poster và phụ đề để có thể chuyển nhà cung cấp. Native/web dùng chung lesson UI nhưng renderer YouTube phải tuân thủ giới hạn riêng.

1. Chọn 3–5 clip có quyền và đã duyệt, gồm clip dài và động tác rộng. Gate upload trial vẫn áp dụng.
2. Đo private storage hiện có; so managed video khi có phê duyệt dùng dịch vụ. Ghi thời gian bắt đầu, rebuffer, tua, chất lượng dọc/ngang, captions, pause/resume, token expiry trên web mobile/native.
3. Ước tính học viên hoạt động × phút/ngày × ngày/tháng, đặt ngân sách và theo dõi actual usage.
4. Chọn host cốt lõi; YouTube giữ vai trò công khai miễn phí. Không tự chốt production, phát hành nội dung hay subscription từ báo cáo này.
