# Tài khoản thử cho người xét duyệt Google Play (đăng nhập bằng mật khẩu)

Mục tiêu: Play yêu cầu người xét duyệt vào được mọi nội dung cần đăng nhập. Đăng nhập thường của ứng dụng là mã/liên kết gửi qua email nên người xét duyệt không dùng được; ứng dụng nay có thêm **đăng nhập bằng email + mật khẩu**.

## Ba cách đăng nhập, hai lựa chọn trên màn hình

- **Mã hoặc liên kết qua email:** một email duy nhất chứa cả mã một lần và liên kết một lần (mẫu `supabase/templates/magic_link.html`). Người dùng nhập mã trong ứng dụng hoặc mở liên kết. Hai cách này không tách thành hai email riêng.
- **Mật khẩu:** nhập email + mật khẩu. Không có đăng ký bằng mật khẩu và không có “quên mật khẩu”; quên mật khẩu thì đăng nhập bằng mã email rồi đặt lại trong Cá nhân → Bảo mật tài khoản.
- Tạo tài khoản mới vẫn chỉ qua mã/liên kết email (email được xác minh trước).

## Việc Owner làm một lần (không gửi mật khẩu qua chat)

1. Supabase Dashboard (project `mcy-staging` hiện dùng cho bản phát hành) → Authentication → Providers → Email: đảm bảo đăng nhập bằng email/mật khẩu không bị tắt. Authentication → Policies: đặt độ dài mật khẩu tối thiểu ≥ 8 (ứng dụng cũng kiểm tra 8–72 ký tự).
2. Authentication → Users → **Add user → Create new user**: email dành riêng cho người xét duyệt (ví dụ một hộp thư Magicpen Digital), mật khẩu dài do bạn tự đặt, tích **Auto Confirm User**. Không dùng email của người dùng thật.
3. Đăng nhập thử tài khoản đó trên bản web/APK, hoàn tất màn đồng ý, tạo vài check-in mẫu để người xét duyệt thấy Hành trình.
4. Play Console → Nội dung ứng dụng → Quyền truy cập ứng dụng → “Có” → thêm email + mật khẩu và hướng dẫn tiếng Anh (gợi ý bên dưới). Nhập mật khẩu trực tiếp vào Console.

Hướng dẫn tiếng Anh gợi ý (≤ 500 ký tự): *Tap "Đăng nhập" on the first screen, choose "Mật khẩu" (Password), enter the email and password above, then tap "Đăng nhập". Guest mode ("Trải nghiệm thử") also works without an account; an account only adds cloud-saved check-ins (Journey).*

## Sau khi dùng

Xóa hoặc đổi mật khẩu tài khoản thử sau mỗi đợt xét duyệt; không đặt vai trò quản trị/giáo viên cho tài khoản này. Cập nhật Data safety: cách tạo tài khoản gồm “tên người dùng + phương thức xác thực khác” (mã email) và “tên người dùng và mật khẩu”; chính sách quyền riêng tư đã ghi mật khẩu được Supabase lưu dạng băm một chiều.
