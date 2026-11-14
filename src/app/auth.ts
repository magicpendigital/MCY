import { authRedirectUrl, getSupabaseClient } from "../backend/supabase";
import { NATIVE_AUTH_PENDING_KEY, nativeAuthCodeFromCallback } from "../backend/nativeAuth";

export async function handleNativeAuthUrl(url: string) {
  const client = await getSupabaseClient();
  if (!client) return;
  const code = nativeAuthCodeFromCallback(
    url,
    authRedirectUrl(),
    window.localStorage.getItem(NATIVE_AUTH_PENDING_KEY),
  );
  if (!code) return;
  const { error } = await client.auth.exchangeCodeForSession(code);
  if (error) throw error;
  window.localStorage.removeItem(NATIVE_AUTH_PENDING_KEY);
}
export function authErrorMessage(cause: unknown, fallback: string) {
  const message = cause && typeof cause === "object" && "message" in cause && typeof cause.message === "string"
    ? cause.message
    : "";
  if (/rate.?limit|too many requests|over_email_send_rate_limit/i.test(message)) {
    return "Dịch vụ email đang tạm giới hạn yêu cầu. Hãy dùng email mới nhất đã gửi và tránh bấm gửi lại liên tục. Nếu liên kết hết hạn, chờ giới hạn hồi hoặc cấu hình SMTP riêng để tiếp tục kiểm thử.";
  }
  return message || fallback;
}
