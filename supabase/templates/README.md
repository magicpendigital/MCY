# Email giao dịch MCY

Nhận diện: **Một chút yoga — Vạn chút an yên** / **A Little Yoga — A little more peace**. Bộ nguồn có 13 kịch bản, hai ngôn ngữ Việt/Anh, nền ivory, chữ forest và CTA terracotta; không tải ảnh/font/tracking từ bên ngoài.

| Nhóm | Kịch bản |
|---|---|
| Xác thực | Xác nhận tài khoản, đăng nhập bằng link/OTP, lời mời, đặt lại mật khẩu, xác nhận đổi email, xác thực lại |
| Bảo mật | Đổi mật khẩu/email/số điện thoại, thêm/xóa phương thức đăng nhập, thêm/xóa MFA |

Web cho phép chọn ngôn ngữ email trước khi yêu cầu link. Sáu email xác thực ưu tiên callback/ngôn ngữ nằm trong allowlist chính xác; nếu không có, dùng `user_metadata.locale`; giá trị không hỗ trợ mặc định tiếng Việt. Bảy thông báo bảo mật chỉ dùng locale đã lưu vì các sự kiện này không có ngôn ngữ yêu cầu đăng nhập. Locale là tùy chọn hiển thị, không cấp quyền Owner/Teacher.

Native giữ nguyên callback scheme; email dùng locale đã lưu. App tiếng Anh vẫn là preview chưa dịch đầy đủ. Biến `{{ .ConfirmationURL }}` và `{{ .Token }}` giữ nguyên cơ chế xác minh của Supabase; không dựng URL hoặc token riêng.

Nguồn sinh: [auth-email-templates.mjs](../../scripts/auth-email-templates.mjs), [manifest](manifest.json). `content_path` của CLI2.119.0 thật sự upload HTML xác thực. CLI bỏ qua HTML notification khi `enabled=false`; không được diễn giải `bodyUploads` trong receipt là 13 body đã được server lưu. Bảy switch notification hiện giữ OFF. Mẫu notification có thể lưu bằng Dashboard mà không bật switch.

Sáu subject xác thực chứa template phân nhánh callback dài hơn 255 ký tự nguồn. GoTrue/CLI nhận cấu hình đó và render subject ngắn; Dashboard giới hạn 255 ký tự **nguồn**, nên không sửa/lưu các form này trực tiếp. Quản lý bằng isolated CLI config + manifest/hash/readback. Bảy subject bảo mật dùng biểu thức locale ngắn hơn 255 ký tự để Dashboard có thể lưu body. Không dùng root `config.toml` cho cloud push.

Dashboard Preview hiển thị các biểu thức Go chưa thực thi; đây không phải hình email đã gửi. Dùng các mẫu Việt/Anh từ actual GoTrue renderer trong `analyse/auth-emails-2026-10-11` để xem nội dung đã dựng; link và mã trong các mẫu là giả. Kiểm thử renderer dùng GoTrue/Mailpit và tài khoản giả trên mạng Docker internal. Nó không gửi email ra ngoài và không chứng minh các trigger signup/invite/recovery/MFA thật hay inbox delivery. Xem [báo cáo triển khai](../../analyse/MCY_AUTH_EMAIL_IMPLEMENTATION_2026-10-11.md) để biết chính xác body nào đã lưu và kiểm tra nào còn chờ.
