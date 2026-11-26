import { useEffect, useState } from "react";
import { BottomSheet, MobileScroll, useFlow, useKeyboard } from "../../mobile";
import { useDemo } from "../../app/state";
import { useRoutes, finishAtAuthDestination } from "../../app/navigation";
import { appendGuestEntry } from "../../app/guestJournal";
import { appendSessionFeedback } from "../../app/reflectionSave";
import { makeSnapshot } from "../../app/snapshots";
import { showsGuestJournal } from "../../app/predicates";
import { hasStoredAuthSession } from "../../backend/supabase";
import type { Outcome } from "../../app/model";
import { approxMinutes, chutRegion } from "../../chut/sequences";
import { claimChutSessionCount, useChutRun } from "../../chut/chutRun";
import { inviteEligible, inviteShownInThisRun, loadChutMemory, markInviteShownInThisRun, recordInviteShown, recordSession, updateChutMemory } from "../../chut/chutMemory";

type EndChoice = Exclude<Outcome, null> | "skip";
const CHOICES: { value: EndChoice; label: string }[] = [
  { value: "Dễ chịu hơn", label: "Dễ chịu hơn" },
  { value: "Như cũ", label: "Như cũ" },
  { value: "Khó chịu hơn", label: "Khó chịu hơn" },
  { value: "Chưa rõ", label: "Chưa rõ" },
];

// Chút slice 1: one honest question about the whole session. A guest's answer goes to the guest journal on this device;
// a signed-in answer follows the reflection path (history only with consent, then the sync screen). "Bỏ qua" writes
// nothing and is never counted as better or worse. Nothing is written while the backend status is still loading.
export function ChutEndScreen() {
  const flow = useFlow();
  const routes = useRoutes();
  const keyboard = useKeyboard();
  const { state, setState, update } = useDemo();
  const run = useChutRun();
  const region = chutRegion(run?.regionId);
  const result = run?.result ?? null;
  const [answered, setAnswered] = useState<EndChoice | null>(null);
  // Thanks only when an answer was really written (a restoring or failed session writes nothing).
  const [saved, setSaved] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);

  // Count this session once, the first time the end screen is shown for this run.
  useEffect(() => {
    if (claimChutSessionCount()) updateChutMemory(recordSession);
  }, [run?.id]);

  const loading = state.backendStatus === "loading";
  const guest = showsGuestJournal(state, hasStoredAuthSession());
  const total = result?.total ?? run?.clipCount ?? 0;
  const watched = result?.watched ?? 0;
  const endedEarly = result?.endedEarly ?? false;
  const minutes = result && result.seconds > 0 ? approxMinutes(result.seconds) : "";
  const eyebrow = [region?.label.toUpperCase(), minutes ? `KHOẢNG ${minutes} PHÚT` : ""].filter(Boolean).join(" · ");

  const maybeInvite = () => {
    if (!guest) return;
    if (!inviteEligible(loadChutMemory(), inviteShownInThisRun())) return;
    markInviteShownInThisRun();
    updateChutMemory(recordInviteShown);
    keyboard.hide();
    setInviteOpen(true);
  };

  const choose = (choice: EndChoice) => {
    if (loading || answered) return;
    keyboard.hide();
    const outcome: Outcome = choice === "skip" ? null : choice;
    const lessonTitle = `Chuỗi ${region?.label ?? "bài ngắn"}`;
    if (state.signedIn) {
      if (choice !== "skip") {
        const entry = makeSnapshot("Sau tập", null, [], { lessonTitle, outcome, pace: null, note: "", endedEarly, feedbackSkipped: false });
        setState(previous => previous.signedIn && previous.backendStatus !== "loading" ? { ...previous, ...appendSessionFeedback(previous, [entry], entry) } : previous);
        flow.replace(routes.sync);
        return;
      }
      setAnswered(choice);
      return;
    }
    if (guest && choice !== "skip") {
      const entry = makeSnapshot("Sau tập", null, [], { lessonTitle, outcome, endedEarly });
      setState(previous => previous.signedIn || previous.backendStatus === "loading" ? previous : { ...previous, guestJournal: appendGuestEntry(previous.guestJournal, entry) });
      setSaved(true);
    }
    setAnswered(choice);
    maybeInvite();
  };

  const goHome = () => { keyboard.hide(); finishAtAuthDestination(flow, routes, "home"); };
  const createAccount = () => {
    keyboard.hide();
    setInviteOpen(false);
    update({ authReturnTo: "home", authMode: "create" });
    flow.push(routes.authEmail);
  };

  return <MobileScroll className="mcy-scroll"><main className="mcy-page mcy-chut-page mcy-chut-end" data-testid="chut-end">
    {eyebrow && <span className="mcy-chut-eyebrow">{eyebrow}</span>}
    <h1>Buổi vừa rồi</h1>
    <p className="mcy-chut-end-count">{endedEarly ? `Bạn đã xem ${watched} trên ${total} bài.` : `Bạn vừa xem xong ${total} bài.`}</p>
    {answered
      ? <div className="mcy-chut-thanks" role="status">{saved && <p>Cảm ơn bạn đã ghi lại.</p>}</div>
      : <section className="mcy-chut-question" aria-labelledby="chut-question">
        <h2 id="chut-question">Thấy thế nào sau buổi này? Bạn ghi lại hay bỏ qua đều được.</h2>
        <div className="mcy-chut-choices">
          {CHOICES.map(choice => <button key={choice.value} type="button" className="mcy-chut-choice" disabled={loading} onClick={() => choose(choice.value)}>{choice.label}</button>)}
          <button type="button" className="mcy-chut-choice mcy-chut-choice-skip" disabled={loading} onClick={() => choose("skip")}><span>Bỏ qua</span><small>Không ghi gì. Bỏ qua không bị tính là tốt hơn hay kém hơn.</small></button>
        </div>
        <p className="mcy-chut-note">Đây là cảm nhận của riêng bạn về cả buổi. Chút không tính phần trăm và không so sánh bạn với ai. Nếu bạn chưa có tài khoản, câu trả lời chỉ ở trên máy này.</p>
      </section>}
    {answered && <button type="button" className="mcy-chut-primary mcy-chut-done" onClick={goHome}>Xong, về Hôm nay</button>}
    <BottomSheet open={inviteOpen} onOpenChange={setInviteOpen} title="Lưu cảm nhận và Hành trình của bạn" description="Tạo tài khoản để lưu cảm nhận và Hành trình của bạn khi đổi điện thoại. Bạn vẫn xem bài mà không cần tài khoản." snap={0.46}>
      <div className="mcy-sheet-actions mcy-chut-invite" data-testid="chut-invite">
        <button type="button" className="mcy-action" onClick={createAccount}>Tạo tài khoản</button>
        <button type="button" className="mcy-quiet-link" onClick={() => setInviteOpen(false)}>Để sau</button>
        <small>Xác minh bằng mã gửi qua email. Bạn xóa được tài khoản trong Cá nhân.</small>
      </div>
    </BottomSheet>
  </main></MobileScroll>;
}
