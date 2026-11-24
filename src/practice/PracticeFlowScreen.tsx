import { newId } from "../compat";
import { useEffect, useMemo, useRef, useState } from "react";
import { MobileScroll } from "../mobile";
import { getAccountBoundSupabaseClient } from "../backend/supabase";
import { eligibleSessions, isReviewedSession, type PracticeContext, type PracticeResult, type PracticeSession } from "../../supabase/functions/_shared/practiceContract";
import { LessonReader } from "./LessonReader";

type Props = {
  context: Omit<PracticeContext, "revision" | "pace" | "guidance" | "floor">;
  userId: string | null;
  consentCurrent: boolean;
  active: boolean;
  previousWasTooFast: boolean;
  onBrowse(): void;
  onConsent(): void;
  onAdjust(): void;
  onReflect(title: string, endedEarly: boolean): void;
};
export default function PracticeFlowScreen(p: Props) {
  const [pace, setPace] = useState<PracticeContext["pace"]>(null);
  const [guidance, setGuidance] = useState<PracticeContext["guidance"]>(null);
  const [floor, setFloor] = useState<PracticeContext["floor"]>("allowed");
  const [result, setResult] = useState<PracticeResult | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [practising, setPractising] = useState(false);
  const [stopped, setStopped] = useState(false);
  const base = JSON.stringify(p.context);
  const context = useMemo((): PracticeContext => ({ ...JSON.parse(base), revision: newId(), pace, guidance, floor }), [base, pace, guidance, floor]);
  const signature = `${p.userId}:${p.consentCurrent}:${p.active}:${context.revision}`;
  const current = useRef(signature); current.current = signature;
  const generation = useRef(0);
  const abort = useRef<AbortController | null>(null);
  const cancel = () => { generation.current++; abort.current?.abort(); };
  useEffect(() => { cancel(); setPace(null); setGuidance(null); setFloor("allowed"); setStopped(false); }, [p.userId]);
  useEffect(() => { cancel(); setPending(false); setResult(null); setPractising(false); setError(""); return cancel; }, [signature]);
  const plan = result?.status === "selected" && result.contextRevision === context.revision ? result.plan : null;
  const invoke = async (action: "select_plan" | "start_plan") => {
    if (pending || stopped || !p.userId || !p.consentCurrent || !p.active) return;
    const requestSignature = signature;
    const token = ++generation.current;
    const controller = new AbortController(); abort.current = controller;
    const valid = () => token === generation.current && current.current === requestSignature && !controller.signal.aborted;
    setPending(true); setError("");
    try {
      const client = await getAccountBoundSupabaseClient(p.userId);
      if (!valid()) return;
      const { data, error: failure } = await client.functions.invoke("mcy-ai-assistant", {
        signal: controller.signal,
        body: action === "select_plan" ? { action, requestId: newId(), context } : { action, sessionId: plan?.id, contentVersion: plan?.version, context },
      });
      if (!valid()) return;
      if (failure) {
        let code = "";
        const response = (failure as { context?: unknown }).context;
        if (response instanceof Response) { try { code = (await response.clone().json()).error ?? ""; } catch { /* sanitized */ } }
        if (!valid()) return;
        if (code === "current_ai_consent_required") throw new Error("Đồng ý AI cần được xác nhận lại trong Quyền riêng tư.");
        if (code === "ai_usage_limit_reached") throw new Error("Đã chạm giới hạn lượt trong ngày. Bạn vẫn có thể tự chọn bài học.");
        if (code === "plan_no_longer_available" || code === "ai_context_changed") { setResult(null); throw new Error("Lựa chọn hoặc cấu hình đã thay đổi. Hãy xem lại trước khi chọn buổi mới."); }
        throw new Error("Chưa nhận được xác nhận từ trợ lý. Không tự gửi lại; hãy kiểm tra lựa chọn hoặc tự chọn bài học.");
      }
      if (!data || data.contextRevision !== context.revision) throw new Error("Kết quả không thuộc lựa chọn hiện tại.");
      if (data.status === "selected") {
        if (!isReviewedSession(data.plan) || !eligibleSessions([data.plan], context).length || typeof data.reason !== "string") throw new Error("Buổi học chưa có xác nhận hợp lệ.");
        if (action === "start_plan" && (data.plan.id !== plan?.id || data.plan.version !== plan?.version)) throw new Error("Phiên bản buổi học đã thay đổi.");
        setResult(data as PracticeResult);
        if (action === "start_plan") setPractising(true);
      } else if (action === "select_plan" && (data.status === "no_match" || data.status === "safety_stop" || (data.status === "clarification" && ["pace", "guidance"].includes(data.question)))) setResult(data as PracticeResult);
      else throw new Error("Chưa có kế hoạch hợp lệ.");
    } catch (cause) { if (valid()) setError(cause instanceof Error ? cause.message : "Chưa mở được trợ lý."); }
    finally { if (valid()) setPending(false); }
  };
  const stop = () => { cancel(); setPending(false); setPractising(false); setStopped(true); };
  const en = context.locale === "en-US";
  if (stopped || result?.status === "safety_stop") return <MobileScroll className="mcy-scroll"><main className="mcy-page mcy-practice-page"><h1>{en ? "You can stop here." : "Bạn có thể dừng tại đây."}</h1><p className="mcy-lead">{en ? "No need to continue or send another request." : "Bạn không cần tiếp tục hoặc gửi thêm yêu cầu."}</p><p>Hãy dừng nếu nội dung không phù hợp với bạn. Nếu có triệu chứng nghiêm trọng hoặc đột ngột, tìm trợ giúp chuyên môn phù hợp. Nội dung an toàn này luôn hiện được khi mất mạng.</p>{plan && <button className="mcy-action" onClick={() => p.onReflect(plan.title, true)}>Tôi đã thực hành một phần · ghi cảm nhận</button>}<button className="mcy-quiet-link" onClick={p.onAdjust}>Trở lại check-in</button></main></MobileScroll>;
  return <MobileScroll className="mcy-scroll"><main className="mcy-page mcy-practice-page">
    <div className="mcy-step-count">{en ? "TODAY'S PRACTICE" : "BUỔI HỌC HÔM NAY"}</div><h1>{practising ? plan?.title : en ? "A practice that fits today." : "Một buổi phù hợp với hôm nay."}</h1>
    {!practising && <><p className="mcy-lead">{en ? "Confirm your preferences. AI can only choose reviewed content." : "Xác nhận điều bạn muốn. AI chỉ chọn trong nội dung đã được duyệt."}</p>
      <div className="mcy-practice-options"><fieldset><legend>{en ? "Pace" : "Nhịp buổi học"}</legend><div>{(["slow", "steady"] as const).map(v => <button key={v} aria-pressed={pace === v} onClick={() => setPace(v)}>{v === "slow" ? "Nhịp chậm" : "Nhịp vừa"}</button>)}</div></fieldset>
        <fieldset><legend>{en ? "Guidance" : "Mức hướng dẫn"}</legend><div>{(["more", "less"] as const).map(v => <button key={v} aria-pressed={guidance === v} onClick={() => setGuidance(v)}>{v === "more" ? "Nhiều hướng dẫn" : "Ít lời"}</button>)}</div></fieldset>
        <fieldset><legend>{en ? "Floor contact" : "Có muốn dùng sàn?"}</legend><div>{(["allowed", "avoid"] as const).map(v => <button key={v} aria-pressed={floor === v} onClick={() => setFloor(v)}>{v === "avoid" ? "Không nằm sàn" : "Có thể dùng sàn"}</button>)}</div></fieldset>
      </div>{p.previousWasTooFast && <p>Lần trước bạn ghi nhịp hơi nhanh. <button className="mcy-quiet-link" onClick={() => setPace("slow")}>Chọn nhịp chậm hôm nay</button></p>}
      <p className="mcy-ai-privacy-note">AI nhận các lựa chọn đang xác nhận: thời lượng, năng lượng, mục tiêu, mã vùng và sở thích ở trên. Không gửi hội thoại trước đó, tên/email, ghi chú tự do hoặc feedback lịch sử. Bạn có thể rút đồng ý AI trong Quyền riêng tư.</p>
      {!p.consentCurrent ? <div className="mcy-account-panel"><p>Cần đồng ý AI hiện hành trước khi gửi lựa chọn.</p><button className="mcy-action" onClick={p.onConsent}>Xem Quyền riêng tư</button></div> : <button className="mcy-action" disabled={pending} onClick={() => { void invoke("select_plan"); }}>{pending ? "Đang kiểm tra lựa chọn…" : "Chọn buổi từ danh mục đã duyệt"}</button>}
    </>}
    {pending && <p role="status">Đang chờ máy chủ xác nhận. Bạn có thể dừng hoặc rời màn.</p>}
    {result?.status === "clarification" && <p role="status">{result.question === "pace" ? "Bạn muốn nhịp chậm hay nhịp vừa?" : "Bạn muốn nhiều hướng dẫn hay ít lời?"}</p>}
    {result?.status === "no_match" && <div className="mcy-account-panel" role="status"><strong>Chưa có buổi phù hợp với lựa chọn này.</strong><p>{context.bodyStatus === "reported" || context.bodyStatus === "uncertain" ? "Pilot này chưa chọn bài khi bạn báo khó chịu hoặc chưa rõ tình trạng cơ thể. Không cần thay câu trả lời để nhận gợi ý. Bạn có thể dừng và xem hướng dẫn chung." : "Bạn có thể điều chỉnh thời lượng, sở thích hoặc tự xem thư viện."} Không có nội dung mới nào được AI tự tạo thay thế.</p></div>}
    {plan && !practising && <PlanCard plan={plan} reason={result?.status === "selected" ? result.reason : ""}><button className="mcy-action" disabled={pending} onClick={() => { void invoke("start_plan"); }}>{pending ? "Đang kiểm lại buổi học…" : "Xác nhận và mở buổi học"}</button></PlanCard>}
    {plan && practising && <><p className="mcy-practice-source">{plan.durationSeconds / 60} phút · phiên bản {plan.version.slice(0, 8)} · {plan.review.reviewerLabel}</p><LessonReader sections={plan.sections} active={p.active && p.consentCurrent} /><button className="mcy-action" onClick={() => p.onReflect(plan.title, false)}>Tôi đã thực hành · ghi cảm nhận</button><p>MCY không tự xác nhận bạn đã hoàn thành bài học. Phản hồi là tùy chọn.</p></>}
    {error && <p className="mcy-form-error" role="alert">{error}</p>}
    <div className="mcy-practice-actions"><button className="mcy-quiet-link" onClick={stop}>Dừng tại đây</button>{!practising && <><button className="mcy-quiet-link" onClick={p.onAdjust}>Sửa check-in hôm nay</button><button className="mcy-quiet-link" onClick={p.onBrowse}>Tự chọn trong thư viện</button></>}</div>
  </main></MobileScroll>;
}
function PlanCard({ plan, reason, children }: { plan: PracticeSession; reason: string; children: React.ReactNode }) {
  return <section className="mcy-practice-summary" aria-label="Kế hoạch hôm nay"><span className="mcy-tag">KẾ HOẠCH HÔM NAY</span><h2>{plan.title}</h2><p>{reason}</p><p>{plan.preparation}</p><p className="mcy-practice-source">{plan.source === "ai_assisted" ? "AI hỗ trợ soạn · đã duyệt" : "Nội dung giảng viên · đã duyệt"}<br />{plan.review.reviewerLabel} · {plan.review.reviewedAt.slice(0, 10)} · phiên bản {plan.version.slice(0, 8)}</p>{children}</section>;
}
