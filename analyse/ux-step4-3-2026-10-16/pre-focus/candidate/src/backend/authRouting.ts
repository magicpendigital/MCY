export type AuthWorkspace = "learner" | "owner" | "teacher";

/** The workspace selects a screen only; the server still verifies every role. */
export function authRedirectForWorkspace(baseUrl: string, workspace: AuthWorkspace): string {
  const redirect = new URL(baseUrl);
  if ((redirect.protocol === "http:" || redirect.protocol === "https:")
    && (workspace === "owner" || workspace === "teacher")) redirect.searchParams.set("workspace", workspace);
  return redirect.toString();
}

/** Only known Auth codes select copy; never display a provider's raw message. */
export function emailLinkErrorMessage(cause: unknown): string {
  const error = cause && typeof cause === "object" ? cause as { code?: unknown; status?: unknown } : {};
  if (error.code === "over_email_send_rate_limit") return "Hệ thống đã chạm giới hạn gửi email xác minh. Chưa có email mới được gửi. Hãy chờ hạn mức hồi phục rồi thử lại một lần; Owner cần kiểm tra dịch vụ gửi email nếu tình trạng kéo dài.";
  if (error.code === "over_request_rate_limit" || error.code === "over_email_send_rate_limit_user" || error.status === 429) return "Có quá nhiều yêu cầu đăng nhập. Hãy chờ một lúc trước khi thử lại; chưa có email mới được gửi.";
  if (error.code === "email_address_not_authorized") return "Dịch vụ email hiện chưa gửi được đến địa chỉ này. Owner cần kiểm tra cấu hình dịch vụ gửi email.";
  return "Chưa gửi được liên kết xác minh. Kiểm tra kết nối và địa chỉ email, rồi thử lại sau. Nếu lỗi tiếp tục, Owner cần kiểm tra dịch vụ đăng nhập.";
}

export function authCallbackDestination(search: string): string {
  const workspace = new URLSearchParams(search).get("workspace");
  if (workspace === "owner" || workspace === "teacher") return `/?workspace=${workspace}`;
  return "/";
}

export function isWebAuthCallback(pathname: string, search: string, hash: string): boolean {
  if (pathname.replace(/\/+$/, "") === "/auth/callback") return true;
  const query = new URLSearchParams(search);
  const fragment = new URLSearchParams(hash.replace(/^#/, ""));
  return ["code", "error", "error_code", "error_description", "access_token", "refresh_token", "token_hash"]
    .some(key => query.has(key) || fragment.has(key));
}
