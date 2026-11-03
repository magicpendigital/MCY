import { useEffect, useState } from "react";
import { authCallbackDestination } from "./authRouting";
import { backendConfigured, getSupabaseClient, syncAuthEmailLocale } from "./supabase";
import { normalizeEmailLocale, rememberEmailLocale } from "./emailLocale";
import markUrl from "../../brand/assets/mark-forest.svg";
import "../staff/owner.css";

type CallbackResult = { destination: string; error: string | null };
const invalidLink = "Liên kết không hợp lệ, đã hết hạn hoặc đã được dùng. Hãy yêu cầu email mới.";
const wrongBrowser = "Liên kết không khớp phiên đăng nhập đã bắt đầu. Hãy gửi email mới từ trang đăng nhập và mở liên kết trong cùng trình duyệt.";
const initialUrl = new URL(window.location.href);
const destination = authCallbackDestination(initialUrl.search);
let completion: Promise<CallbackResult> | null = null;

function clearCallbackUrl() {
  // Never carry codes, provider errors or arbitrary return URLs into the next page.
  const workspace = new URLSearchParams(destination.split("?")[1] ?? "").get("workspace");
  window.history.replaceState(window.history.state, "", `/auth/callback${workspace ? `?workspace=${workspace}` : ""}`);
}

async function completeCallback(): Promise<CallbackResult> {
  try {
    const fragment = new URLSearchParams(initialUrl.hash.slice(1));
    if (["error", "error_code", "error_description"].some(key => initialUrl.searchParams.has(key) || fragment.has(key))) {
      return { destination, error: invalidLink };
    }
    const codes = initialUrl.searchParams.getAll("code");
    if (codes.length !== 1 || !codes[0] || codes[0].length > 4096 || /\s/.test(codes[0])
      || fragment.has("access_token") || fragment.has("refresh_token") || !backendConfigured) {
      return { destination, error: invalidLink };
    }
    const client = await getSupabaseClient();
    if (!client) return { destination, error: invalidLink };
    // The SDK owns the one-time PKCE exchange; do not exchange a second time.
    const initialized = await client.auth.initialize();
    if (initialized.error) return { destination, error: invalidLink };
    // Without this origin's verifier the SDK leaves code untouched, even if an
    // older unrelated session exists. Do not mistake that session for success.
    if (new URL(window.location.href).searchParams.has("code")) return { destination, error: wrongBrowser };
    const { data, error } = await client.auth.getSession();
    const session = data.session;
    if (error || !session?.user.email_confirmed_at || !session.expires_at || session.expires_at <= Date.now() / 1000) {
      return { destination, error: invalidLink };
    }
    const emailLocale = normalizeEmailLocale(initialUrl.searchParams.get("email_locale"));
    if (emailLocale) {
      rememberEmailLocale(emailLocale);
      await syncAuthEmailLocale(session, emailLocale);
    }
    return { destination, error: null };
  } catch {
    return { destination, error: "Chưa hoàn tất xác minh đăng nhập. Kiểm tra kết nối, rồi yêu cầu email mới từ trang đăng nhập." };
  } finally {
    clearCallbackUrl();
  }
}

export default function AuthCallback() {
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    document.title = "Xác minh đăng nhập · Một chút yoga";
    completion ??= completeCallback();
    void completion.then(result => {
      if (!active) return;
      if (result.error) setError(result.error);
      else window.location.replace(result.destination);
    });
    return () => { active = false; };
  }, []);

  return <div className="owner-shell"><header className="owner-topbar"><a className="owner-brand" href="/">
    <img src={markUrl} alt="" width="34" height="34" /><span>Một chút yoga<small>XÁC MINH ĐĂNG NHẬP</small></span>
  </a></header><main className="owner-main"><section className="owner-state-card">
    <h1>{error ? "Chưa thể đăng nhập." : "Đang xác minh đăng nhập…"}</h1>
    {error ? <><p role="alert">{error}</p><p><a href={destination}>Quay lại trang đăng nhập</a></p>
      {destination === "/" && <p><a href="/?workspace=owner">Đăng nhập Owner</a></p>}</> : <p role="status">Đang kiểm tra liên kết và mở lại trang bạn đã đăng nhập.</p>}
  </section></main></div>;
}
