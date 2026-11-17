import { useEffect, useRef, useState } from "react";
import { useFlow } from "../../mobile";
import { useDemo } from "../../app/state";
import { isCheckinAuthReturn, normalizeAuthDestination } from "../../app/predicates";
import { useLearnerContinuation } from "../../app/useLearnerContinuation";
import { persistConsentChanges, persistCurrentCheckin } from "../../app/persistence";
import { finishAtAuthDestination, useRoutes } from "../../app/navigation";
import { Action } from "../../app/ui/controls";

export function ConsentFooter() {
  const flow = useFlow();
  const routes = useRoutes();
  const { state, setState } = useDemo();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const actor = useRef({ id: state.userId, signedIn: state.signedIn, generation: 0 });
  const retryKeys = useRef(new Map<string, string>());
  const captureContinuation = useLearnerContinuation();
  if (actor.current.id !== state.userId || actor.current.signedIn !== state.signedIn) actor.current = { id: state.userId, signedIn: state.signedIn, generation: actor.current.generation + 1 };
  useEffect(() => () => { actor.current.generation++; }, []);
  const hasTransferDraft = state.onboardingComplete && isCheckinAuthReturn(state.authReturnTo);
  const continueNext = async (discardDraft = false) => {
    if (!state.termsAccepted || !state.privacyAccepted || saving) return;
    setSaving(true);
    setError("");
    const expectedUserId = state.userId, expectedSignedIn = state.signedIn, generation = actor.current.generation;
    const continuation = captureContinuation();
    const current = () => continuation() && actor.current.id === expectedUserId && actor.current.signedIn === expectedSignedIn && actor.current.generation === generation;
    try {
      const saved = await persistConsentChanges(state, "onboarding", retryKeys.current);
      if (!current()) return;
      if (saved.hasUnsettledWrites) {
        setState(previous => continuation(previous) ? { ...previous, consentBaseline: saved.consents, consentPolicyVersions: saved.policyVersions } : previous);
        setError("Một lần ghi quyền chưa được xác nhận. Lựa chọn trên màn hình vẫn là nháp; chọn Tiếp tục để đối chiếu lại trước khi đổi quyền hoặc đi tiếp.");
        return;
      }
      setState(previous => !continuation(previous) || previous.userId !== expectedUserId || previous.signedIn !== expectedSignedIn ? previous : ({
        ...previous,
        consentBaseline: saved.consents,
        consentPolicyVersions: saved.policyVersions,
        termsAccepted: saved.consents.terms, privacyAccepted: saved.consents.privacy,
        saveFeedbackConsent: saved.consents.wellbeing_data, aiConsent: saved.consents.ai_processing,
        teacherShareConsent: saved.consents.teacher_sharing, notificationEnabled: saved.consents.notifications,
        marketingConsent: saved.consents.marketing,
        ...(discardDraft ? { preObservations: [], regions: [], bodyStatus: null, energy: null, pendingCheckinIdempotencyKey: null, pendingCheckinPayload: null } : {}),
      }));
      if (!saved.matchesRequested) { setError("Quyền dữ liệu đã thay đổi. Kiểm tra và chọn lại trước khi tiếp tục."); return; }
      if (state.onboardingComplete) {
        if (!discardDraft && isCheckinAuthReturn(state.authReturnTo) && state.saveFeedbackConsent) {
          await persistCurrentCheckin({ ...state, consentBaseline: saved.consents, consentPolicyVersions: saved.policyVersions, privacyAccepted: true }, setState, "practice_preparation", current);
        }
        if (!current()) return;
        const destination = discardDraft ? (isCheckinAuthReturn(state.authReturnTo) ? "discover" : "home") : normalizeAuthDestination(state.authReturnTo);
        finishAtAuthDestination(flow, routes, destination);
      } else flow.replace(routes.onboarding);
    } catch (cause) {
      if (!current()) return;
      setError(cause instanceof Error ? cause.message : "Chưa lưu được lựa chọn của bạn.");
    } finally {
      setSaving(false);
    }
  };
  return <div className="mcy-flow-footer mcy-consent-footer">
    {error && <div className="mcy-consent-footer-error" role="alert">Chưa lưu được lựa chọn: {error}</div>}
    <Action disabled={!state.termsAccepted || !state.privacyAccepted || saving} onClick={() => { void continueNext(); }}>{saving ? "Đang lưu lựa chọn…" : hasTransferDraft ? state.saveFeedbackConsent ? "Xác nhận chuyển nháp" : "Tiếp tục với nháp trong phiên" : "Tiếp tục"}</Action>
    {hasTransferDraft && <button className="mcy-quiet-link" disabled={!state.termsAccepted || !state.privacyAccepted || saving} onClick={() => { void continueNext(true); }}>Bỏ nháp</button>}
  </div>;
}
