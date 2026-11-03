# MCY — Supabase Auth qua Resend SMTP

Project: **mcy-staging**, ref `mhumbczqrzutdnraafhs`, organization MagicpenDigital. Owner sau đó đã báo cấu hình Resend/Cloudflare và **đăng nhập thành công**. Đoạn hướng dẫn bên dưới giải thích quá trình trước đó; trạng thái SMTP chưa lưu không còn là kết luận hiện hành. Agent không tuyên bố đã kiểm tra inbox của bộ email VI/EN mới hoặc toàn bộ trigger. Xem [triển khai email theo nhận diện](../../analyse/MCY_AUTH_EMAIL_IMPLEMENTATION_2026-10-11.md).

## Vì sao cần cấu hình

Hai yêu cầu Owner `/otp` ngày 2026-10-11 lúc 06:51:27Z và 06:52:02Z bị Supabase từ chối HTTP429, code `over_email_send_rate_limit`. Dashboard xác nhận dịch vụ email tích hợp đang được dùng. Dịch vụ này hiện giới hạn hai email/giờ cho toàn project và chỉ gửi đến địa chỉ thuộc team project. [Supabase rate limits](https://supabase.com/docs/guides/auth/rate-limits), [SMTP](https://supabase.com/docs/guides/auth/auth-smtp), [receipt tối thiểu](../../analyse/MCY_OWNER_AUTH_EMAIL_LIMIT_2026-10-11.json).

## Lấy key và xác định địa chỉ gửi

1. Trong [Resend Domains](https://resend.com/domains), kiểm tra domain gửi có trạng thái **Verified**. Nếu chưa có, thêm domain/subdomain bạn sở hữu rồi cấu hình các bản ghi DNS mà **chính Resend trả về** và xác minh. Việc xác minh email là cấu hình riêng với CNAME web MCY; không đoán giá trị DKIM/SPF/MX, không thay thế bản ghi mail hiện có bằng mẫu.
2. Trong [Resend API Keys](https://resend.com/api-keys), chọn **Create API Key**. Name: `MCY Supabase staging`; Permission: **Sending access**; Domain: domain gửi đã Verified. Người dùng tự tạo/copy key và nhập vào Supabase. Không gửi key vào chat, tài liệu, client Vite hoặc repository. Key chỉ được xem một lần; nếu không giữ được giá trị của key cũ, tạo key riêng cho MCY, không xóa key ứng dụng khác. [Hướng dẫn tạo key chính thức](https://resend.com/docs/create-an-api-key).
3. Chọn địa chỉ Sender email thuộc domain được key cho phép. Ví dụ `no-reply@magicpendigital.com` **chỉ khi `magicpendigital.com` đã Verified và thuộc phạm vi key**; nếu domain là `auth.magicpendigital.com`, địa chỉ tương ứng có thể là `no-reply@auth.magicpendigital.com`. Chưa có domain/địa chỉ nào được agent chứng nhận ở đây. [Verified domains](https://resend.com/docs/dashboard/domains/introduction).

## Nhập vào Supabase

Mở [Authentication → Emails → SMTP Settings](https://supabase.com/dashboard/project/mhumbczqrzutdnraafhs/auth/smtp), bật **Enable custom SMTP**, rồi điền:

| Trường | Giá trị |
| --- | --- |
| Sender email | Địa chỉ trên domain Verified/phạm vi key được chọn ở trên |
| Sender name | Một chút yoga |
| Host | `smtp.resend.com` |
| Port | `465` |
| Username | `resend` |
| Password | API key Resend, nhập trực tiếp vào Supabase |

Chọn **Save changes**. [Resend hướng dẫn tích hợp Supabase SMTP](https://resend.com/docs/send-with-supabase-smtp).

## Đối chiếu và thử lại

- Báo đã lưu; agent đối chiếu trạng thái SMTP/host/port/sender và Auth Rate Limits bằng dữ liệu không bí mật. Không cần đọc/xuất password. Chưa có quyết định tăng hạn mức hoặc thay đổi gói/cost trong hướng dẫn này.
- Site URL/callback domain MCY đã sửa và lưu riêng. Đăng nhập ở [Owner](https://motchutyoga.magicpendigital.com/?workspace=owner), tải lại trang, gửi **một** yêu cầu email mới và mở email mới nhất trong cùng trình duyệt. Không gửi thật trong kiểm thử fixture và không tự retry vòng lặp.
- Kiểm tra giao dịch gửi trong Resend Emails và lỗi Auth tối thiểu trên Supabase nếu cần. Hạn mức/quota/địa chỉ gửi và khả năng giao thư của Resend vẫn áp dụng; SMTP configured không tự chứng minh email delivered hoặc Owner authorization.
- Bấm liên kết/email thành công vẫn cần role Owner còn hiệu lực để API cho phép. Không grant/gia hạn role, tắt xác minh email/CAPTCHA hay cấp quyền team cho người nhận chỉ để tránh lỗi gửi mail.

Bản sửa callback/triển khai/kiểm thử app nằm trong [báo cáo Owner Auth](../../analyse/MCY_OWNER_AUTH_CALLBACK_FIX_2026-10-11.md).
