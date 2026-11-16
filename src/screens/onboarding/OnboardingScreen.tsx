import { useState } from "react";
import { KeyboardInput, MobileScroll, useFlow, useKeyboard } from "../../mobile";
import { useDemo } from "../../app/state";
import { isCheckinAuthReturn, normalizeAuthDestination } from "../../app/predicates";
import { useLearnerContinuation } from "../../app/useLearnerContinuation";
import { persistCurrentCheckin, persistProfile } from "../../app/persistence";
import { finishAtAuthDestination, useRoutes } from "../../app/navigation";
import { BodyStylePicker } from "../../app/body/BodyStylePicker";
import { Action, DemoNote, Eyebrow } from "../../app/ui/controls";

export function OnboardingScreen() {
  const flow = useFlow();
  const routes = useRoutes();
  const keyboard = useKeyboard();
  const { state, update, setState } = useDemo();
  const [name, setName] = useState(state.displayName);
  const [showTransfer, setShowTransfer] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const captureContinuation = useLearnerContinuation();
  const complete = async (discardDraft = false) => {
    if (saving) return;
    keyboard.hide();
    setSaving(true);
    setError("");
    const current = captureContinuation();
    try {
      const displayName = name.trim();
      const nextState = discardDraft ? {
        ...state,
        preObservations: [],
        regions: [],
        bodyStatus: null,
        energy: null,
        pendingCheckinIdempotencyKey: null,
        pendingCheckinPayload: null,
      } : state;
      await persistProfile(nextState, displayName, nextState.bodyStyle, nextState.locale);
      if (!current()) return;
      if (!discardDraft && isCheckinAuthReturn(nextState.authReturnTo) && nextState.saveFeedbackConsent) {
        await persistCurrentCheckin({ ...nextState, displayName, onboardingComplete: true }, setState, "practice_preparation", current);
      }
      if (!current()) return;
      setState(previous => !current(previous) ? previous : ({ ...previous,
        displayName,
        onboardingComplete: true,
        backendStatus: "ready",
        backendError: "",
        ...(discardDraft ? {
          preObservations: [], regions: [], bodyStatus: null, energy: null,
          pendingCheckinIdempotencyKey: null,
          pendingCheckinPayload: null,
        } : {}),
      }));
      const destination = discardDraft ? (isCheckinAuthReturn(state.authReturnTo) ? "discover" : "home") : normalizeAuthDestination(state.authReturnTo);
      finishAtAuthDestination(flow, routes, destination);
    } catch (cause) {
      if (!current()) return;
      setError(cause instanceof Error ? cause.message : "Chưa hoàn tất được thiết lập tài khoản.");
    } finally {
      setSaving(false);
    }
  };
  return <MobileScroll className="mcy-scroll"><main className="mcy-page mcy-auth-page">
    <Eyebrow>A04 · THIẾT LẬP TỐI THIỂU</Eyebrow><h1>Chỉ thêm điều hữu ích.</h1>
    <p className="mcy-lead">Tên hiển thị không bắt buộc. Hình minh họa là sở thích hiển thị, không dùng để suy luận giới hay sức khỏe.</p>
    <label className="mcy-form-field">Tên hiển thị · tùy chọn<KeyboardInput autoComplete="nickname" aria-label="Tên hiển thị" placeholder="Bạn muốn được gọi là gì?" value={name} onChange={event => setName(event.target.value)} onBlur={() => keyboard.hide()} /></label>
    <section className="mcy-account-panel"><strong>Hình minh họa cơ thể</strong><p>Chọn hình dễ dùng nhất; có thể đổi bất cứ lúc nào.</p><BodyStylePicker value={state.bodyStyle} onChange={bodyStyle => update({ bodyStyle })} /></section>
    {showTransfer && <div className="mcy-consent-card"><strong>Nháp check-in trong phiên này</strong><p>{state.preObservations.length || state.regions.length ? `${state.preObservations.length || state.regions.length} vùng đã ghi, ${state.minutes} phút${state.energy ? `, năng lượng ${state.energy}` : ""}.` : "Chưa có ghi nhận cơ thể trong phiên này."} Tiếp tục sẽ gắn nháp với tài khoản hiện tại theo lựa chọn lưu của bạn.</p><div className="mcy-auth-secondary"><button disabled={saving} onClick={() => { void complete(); }}>Xác nhận chuyển nháp</button><button disabled={saving} onClick={() => { void complete(true); }}>Bỏ nháp</button></div></div>}
    {error && <div className="mcy-form-error" role="alert">{error}</div>}
    {!showTransfer && <Action disabled={saving} onClick={() => setShowTransfer(true)}>Tiếp tục</Action>}
    {!showTransfer && <button className="mcy-quiet-link" disabled={saving} onClick={() => { if (isCheckinAuthReturn(state.authReturnTo)) setShowTransfer(true); else void complete(); }}>{saving ? "Đang lưu…" : "Để sau"}</button>}
    <DemoNote>Hồ sơ và lựa chọn được đồng bộ với tài khoản. Check-in chỉ ghi server nếu bạn đã cho phép lưu.</DemoNote>
  </main></MobileScroll>;
}
