import { useState } from "react";
import { InfoCircledIcon } from "@radix-ui/react-icons";
import { Capacitor } from "@capacitor/core";
import { KeyboardInput, MobileScroll, useFlow, useKeyboard } from "../../mobile";
import { authRedirectUrl, backendConfigured, getSupabaseClient, syncAuthEmailLocale } from "../../backend/supabase";
import { readEmailLocale } from "../../backend/emailLocale";
import { NATIVE_AUTH_PENDING_KEY } from "../../backend/nativeAuth";
import { AUTH_SIGN_IN_EVENT } from "../../app/events";
import { authErrorMessage } from "../../app/auth";
import { useRoutes } from "../../app/navigation";
import { useDemo } from "../../app/state";
import { Action, DemoNote, Eyebrow } from "../../app/ui/controls";

export function AuthCodeScreen() {
  const flow = useFlow();
  const routes = useRoutes();
  const keyboard = useKeyboard();
  const { state, update } = useDemo();
  const [code, setCode] = useState(state.authCode);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const verify = async () => {
    keyboard.hide();
    if (!/^(?:\d{6}|\d{8})$/.test(code)) { setError("Nhập đủ mã xác minh trong email để tiếp tục."); return; }
    if (!backendConfigured) { setError("Backend chưa được cấu hình cho môi trường này."); return; }
    setVerifying(true);
    try {
      const client = await getSupabaseClient();
      if (!client) { setError("Backend chưa được cấu hình cho môi trường này."); return; }
      const { data, error: authError } = await client.auth.verifyOtp({ email: state.accountEmail, token: code, type: "email" });
      if (authError || !data.user) { setError("Mã không hợp lệ hoặc đã hết hạn. Hãy kiểm tra hộp thư và thử lại."); return; }
      if (data.session && !Capacitor.isNativePlatform()) await syncAuthEmailLocale(data.session, readEmailLocale(state.locale));
      if (Capacitor.isNativePlatform()) window.localStorage.removeItem(NATIVE_AUTH_PENDING_KEY);
      update({ authCode: "", signedIn: true, userId: data.user.id, accountEmail: data.user.email ?? state.accountEmail, backendStatus: "loading", backendError: "" });
      window.dispatchEvent(new Event(AUTH_SIGN_IN_EVENT));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Chưa xác minh được mã. Hãy thử lại.");
    } finally {
      setVerifying(false);
    }
  };
  const resend = async () => {
    if (!backendConfigured) return;
    setResending(true);
    const native = Capacitor.isNativePlatform();
    try {
      if (native) window.localStorage.setItem(NATIVE_AUTH_PENDING_KEY, String(Date.now()));
      const client = await getSupabaseClient();
      if (!client) return;
      const emailLocale = readEmailLocale(state.locale);
      const { error: authError } = await client.auth.signInWithOtp({ email: state.accountEmail, options: { shouldCreateUser: state.authMode === "create", emailRedirectTo: authRedirectUrl("learner", emailLocale), data: { locale: emailLocale } } });
      if (authError) {
        if (native) window.localStorage.removeItem(NATIVE_AUTH_PENDING_KEY);
        setError(authErrorMessage(authError, "Chưa gửi lại được email xác minh."));
        setNotice("");
      } else {
        setError("");
        setNotice("Email xác minh mới đã được gửi. Mã hoặc liên kết cũ có thể hết hiệu lực.");
      }
    } catch (cause) {
      if (native) window.localStorage.removeItem(NATIVE_AUTH_PENDING_KEY);
      setNotice("");
      setError(authErrorMessage(cause, "Chưa gửi lại được email xác minh."));
    } finally {
      setResending(false);
    }
  };
  return <MobileScroll className="mcy-scroll"><main className="mcy-page mcy-auth-page">
    <Eyebrow>XÁC MINH EMAIL</Eyebrow><h1>Kiểm tra hộp thư của bạn.</h1>
    <p className="mcy-lead">Email đã gửi tới <strong>{state.accountEmail}</strong>. Nếu thư có mã xác minh, nhập mã bên dưới. Nếu thư có liên kết, mở trên {Capacitor.isNativePlatform() ? "điện thoại này" : "trình duyệt này"}.</p>
    <label className="mcy-form-field">Mã xác minh (nếu email có mã)<KeyboardInput inputMode="numeric" autoComplete="one-time-code" aria-label="Mã xác minh" placeholder="Nhập mã trong email" value={code} onChange={event => { setCode(event.target.value.replace(/\D/g, "").slice(0, 8)); setError(""); }} onBlur={() => keyboard.hide()} /></label>
    <div className="mcy-code-hint">Mã hoặc liên kết chỉ dùng một lần. Không gửi mã cho người khác.</div>
    {error && <div className="mcy-form-error" role="alert">{error}</div>}
    {notice && <div className="mcy-inline-note" role="status"><InfoCircledIcon />{notice}</div>}
    <Action disabled={verifying} onClick={verify}>{verifying ? "Đang xác minh…" : "Xác minh email"}</Action>
    <div className="mcy-auth-secondary"><button disabled={resending} onClick={() => { setCode(""); void resend(); }}>{resending ? "Đang gửi…" : "Gửi lại email"}</button><button onClick={() => flow.replace(routes.authEmail)}>Đổi email</button></div>
    <DemoNote>Mở liên kết trên cùng thiết bị đã yêu cầu xác minh. Trên điện thoại, liên kết sẽ quay lại ứng dụng.</DemoNote>
  </main></MobileScroll>;
}
