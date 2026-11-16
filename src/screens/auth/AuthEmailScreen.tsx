import { useState } from "react";
import { Capacitor } from "@capacitor/core";
import { KeyboardInput, MobileScroll, useFlow, useKeyboard } from "../../mobile";
import { authRedirectUrl, backendConfigured, getSupabaseClient, syncAuthEmailLocale } from "../../backend/supabase";
import { readEmailLocale, rememberEmailLocale } from "../../backend/emailLocale";
import { EmailLanguageSelect } from "../../backend/EmailLanguageSelect";
import { passwordSignInMessage } from "../../backend/passwordAuth";
import { NATIVE_AUTH_PENDING_KEY } from "../../backend/nativeAuth";
import { AUTH_SIGN_IN_EVENT } from "../../app/events";
import { isCheckinAuthReturn } from "../../app/predicates";
import { authErrorMessage } from "../../app/auth";
import { useRoutes } from "../../app/navigation";
import { useDemo } from "../../app/state";
import { Action, Choice, DemoNote, Eyebrow } from "../../app/ui/controls";

export function AuthEmailScreen() {
  const flow = useFlow();
  const routes = useRoutes();
  const keyboard = useKeyboard();
  const { state, update } = useDemo();
  const [email, setEmail] = useState(state.accountEmail);
  const [emailLocale, setEmailLocale] = useState(() => readEmailLocale(state.locale));
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [method, setMethod] = useState<"code" | "password">("code");
  const [password, setPassword] = useState("");
  const usePassword = state.authMode === "login" && method === "password";
  const submitPassword = async () => {
    keyboard.hide();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { setError("Kiểm tra lại địa chỉ email bạn vừa nhập."); return; }
    if (!password) { setError("Nhập mật khẩu để tiếp tục."); return; }
    if (!backendConfigured) { setError("Backend chưa được cấu hình cho môi trường này."); return; }
    setSending(true);
    setError("");
    try {
      const client = await getSupabaseClient();
      if (!client) { setError("Backend chưa được cấu hình cho môi trường này."); return; }
      const { data, error: authError } = await client.auth.signInWithPassword({ email: email.trim(), password });
      if (authError || !data.user) { setError(passwordSignInMessage(authError)); return; }
      setPassword("");
      update({ authCode: "", signedIn: true, userId: data.user.id, accountEmail: data.user.email ?? email.trim(), backendStatus: "loading", backendError: "" });
      window.dispatchEvent(new Event(AUTH_SIGN_IN_EVENT));
      if (data.session && !Capacitor.isNativePlatform()) await syncAuthEmailLocale(data.session, readEmailLocale(state.locale));
    } catch (cause) {
      setError(passwordSignInMessage(cause));
    } finally {
      setSending(false);
    }
  };
  const submit = async () => {
    keyboard.hide();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { setError("Kiểm tra lại địa chỉ email bạn vừa nhập."); return; }
    if (!backendConfigured) { setError("Backend chưa được cấu hình cho môi trường này."); return; }
    setSending(true);
    setError("");
    try {
      const native = Capacitor.isNativePlatform();
      if (native) window.localStorage.setItem(NATIVE_AUTH_PENDING_KEY, String(Date.now()));
      const client = await getSupabaseClient();
      if (!client) { setError("Backend chưa được cấu hình cho môi trường này."); return; }
      const { error: authError } = await client.auth.signInWithOtp({
        email: email.trim(),
        options: { shouldCreateUser: state.authMode === "create", emailRedirectTo: authRedirectUrl("learner", emailLocale), data: { locale: emailLocale } },
      });
      if (authError) {
        if (native) window.localStorage.removeItem(NATIVE_AUTH_PENDING_KEY);
        setError(authErrorMessage(authError, "Chưa gửi được email xác minh. Hãy thử lại sau."));
        return;
      }
      update({ accountEmail: email.trim(), authCode: "" });
      flow.replace(routes.authCode);
    } catch (cause) {
      if (Capacitor.isNativePlatform()) window.localStorage.removeItem(NATIVE_AUTH_PENDING_KEY);
      setError(authErrorMessage(cause, "Chưa gửi được email xác minh. Hãy thử lại sau."));
    } finally {
      setSending(false);
    }
  };
  return <MobileScroll className="mcy-scroll"><main className="mcy-page mcy-auth-page">
    <Eyebrow>{state.authMode === "create" ? "TẠO TÀI KHOẢN" : "ĐĂNG NHẬP"}</Eyebrow>
    <h1>{state.authMode === "create" ? "Tạo tài khoản nhanh bằng email" : usePassword ? "Đăng nhập bằng mật khẩu" : "Đăng nhập nhanh qua email"}</h1>
    {state.authMode === "create" && <p className="mcy-lead">Một Chút Yoga sẽ gửi email xác minh tới địa chỉ bạn cung cấp.</p>}
    <label className="mcy-form-field">Email<KeyboardInput inputMode="email" autoComplete="email" aria-label="Địa chỉ email" placeholder="ban@example.com" value={email} onChange={event => { setEmail(event.target.value); setError(""); }} onBlur={() => keyboard.hide()} /></label>
    {state.authMode === "login" && <div className="mcy-chip-grid mcy-auth-method" role="group" aria-label="Cách đăng nhập"><Choice selected={!usePassword} disabled={sending} onClick={() => { setMethod("code"); setError(""); }}>Mã hoặc liên kết qua email</Choice><Choice selected={usePassword} disabled={sending} onClick={() => { setMethod("password"); setError(""); }}>Mật khẩu</Choice></div>}
    {usePassword && <label className="mcy-form-field">Mật khẩu<KeyboardInput type="password" autoComplete="current-password" aria-label="Mật khẩu" value={password} onChange={event => { setPassword(event.target.value); setError(""); }} onBlur={() => keyboard.hide()} /></label>}
    {!usePassword && <EmailLanguageSelect value={emailLocale} disabled={sending} onChange={locale => { setEmailLocale(locale); rememberEmailLocale(locale); }} />}
    {error && <div className="mcy-form-error" role="alert">{error}</div>}
    {!backendConfigured && <div className="mcy-alert">Backend chưa kết nối ở môi trường hiện tại. Bạn vẫn có thể xem và thử luồng khách.</div>}
    <Action disabled={sending || !backendConfigured} onClick={usePassword ? submitPassword : submit}>{usePassword ? (sending ? "Đang đăng nhập…" : "Đăng nhập") : sending ? "Đang gửi…" : state.authMode === "create" ? "Gửi email xác minh" : "Gửi mã"}</Action>
    {state.authMode === "login" && (usePassword
      ? <DemoNote>Chưa đặt mật khẩu? Chọn “Mã hoặc liên kết qua email” để đăng nhập, rồi đặt mật khẩu trong Cá nhân → Bảo mật tài khoản.</DemoNote>
      : <DemoNote>Email gửi tới bạn có cả mã và liên kết một lần: nhập mã trong ứng dụng hoặc mở liên kết, dùng cách nào thuận tiện hơn.</DemoNote>)}
    {state.authMode === "create" && isCheckinAuthReturn(state.authReturnTo) && <button className="mcy-quiet-link" onClick={() => { keyboard.hide(); flow.replace(routes.discover); }}>Xem bài học video miễn phí</button>}
    {state.authMode === "create" && <DemoNote>Email xác minh chỉ dùng qua Supabase Auth. Hãy hoàn tất trên cùng thiết bị để tiếp tục đúng phiên.</DemoNote>}
  </main></MobileScroll>;
}
