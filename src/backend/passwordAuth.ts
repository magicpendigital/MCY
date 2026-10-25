// Password sign-in helpers. Supabase Auth owns hashing, throttling and storage; this file only maps
// outcomes to copy that never reveals whether an email has an account.
export const MIN_PASSWORD_LENGTH = 8;
export const MAX_PASSWORD_LENGTH = 72;

export type PasswordCheck = "ok" | "too_short" | "too_long" | "mismatch";

export function checkNewPassword(password: string, confirmation: string): PasswordCheck {
  if (password.length < MIN_PASSWORD_LENGTH) return "too_short";
  if (password.length > MAX_PASSWORD_LENGTH) return "too_long";
  if (password !== confirmation) return "mismatch";
  return "ok";
}

export const PASSWORD_CHECK_MESSAGES: Record<Exclude<PasswordCheck, "ok">, string> = {
  too_short: `Mật khẩu cần ít nhất ${MIN_PASSWORD_LENGTH} ký tự.`,
  too_long: `Mật khẩu tối đa ${MAX_PASSWORD_LENGTH} ký tự.`,
  mismatch: "Hai lần nhập mật khẩu chưa khớp.",
};

function authCode(cause: unknown): string {
  if (cause && typeof cause === "object" && "code" in cause && typeof cause.code === "string") return cause.code;
  return "";
}
function authText(cause: unknown): string {
  return cause && typeof cause === "object" && "message" in cause && typeof cause.message === "string" ? cause.message : "";
}

export function passwordSignInMessage(cause: unknown): string {
  const code = authCode(cause), text = authText(cause);
  if (code === "email_not_confirmed" || /email not confirmed/i.test(text)) return "Email này chưa được xác minh. Hãy đăng nhập bằng mã gửi qua email.";
  if (code === "over_request_rate_limit" || /rate.?limit|too many requests/i.test(text)) return "Bạn đã thử quá nhiều lần. Hãy chờ một lúc rồi thử lại, hoặc đăng nhập bằng mã gửi qua email.";
  if (code === "invalid_credentials" || /invalid login credentials/i.test(text)) return "Email hoặc mật khẩu chưa đúng. Nếu chưa đặt mật khẩu, hãy đăng nhập bằng mã gửi qua email.";
  return "Chưa đăng nhập được bằng mật khẩu. Hãy kiểm tra kết nối rồi thử lại, hoặc dùng mã gửi qua email.";
}

export function passwordChangeMessage(cause: unknown): string {
  const code = authCode(cause), text = authText(cause);
  if (code === "reauthentication_needed" || /reauthentication/i.test(text)) return "Để đổi mật khẩu, hãy đăng xuất rồi đăng nhập lại bằng mã gửi qua email, sau đó thử lại.";
  if (code === "same_password" || /different from the old password/i.test(text)) return "Mật khẩu mới cần khác mật khẩu hiện tại.";
  if (code === "weak_password" || /password (is )?(too )?(weak|short)|should contain/i.test(text)) return "Mật khẩu chưa đủ mạnh. Hãy dùng mật khẩu dài hơn, khó đoán hơn.";
  if (code === "over_request_rate_limit" || /rate.?limit|too many requests/i.test(text)) return "Bạn thao tác quá nhanh. Hãy chờ một lúc rồi thử lại.";
  return "Chưa lưu được mật khẩu. Hãy kiểm tra kết nối rồi thử lại.";
}
