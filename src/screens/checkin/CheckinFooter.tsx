import { useState } from "react";
import { ArrowRightIcon } from "@radix-ui/react-icons";
import { msg } from "../../i18n";
import { BottomSheet, useFlow } from "../../mobile";
import { useDemo } from "../../app/state";
import { aiPracticeOffered, hasCheckinBaseline } from "../../app/predicates";
import { Action } from "../../app/ui/controls";
import { useRoutes } from "../../app/navigation";

export function CheckinFooter() {
  const flow = useFlow();
  const routes = useRoutes();
  const { state, update } = useDemo();
  const locale = state.locale;
  const [confirmSkip, setConfirmSkip] = useState(false);
  const browseFreeLessons = () => {
    update({ dialogueChoice: null, dialogueText: "", unrecognizedText: "", aiConversation: [], aiPending: false, aiError: "", checkinBaselineReady: hasCheckinBaseline(state) });
    flow.push(routes.discover);
  };
  const openOptionalAccount = () => {
    update({ authReturnTo: "discover", authMode: "create" });
    flow.push(routes.authEmail);
  };
  // One screen for everyone: skipping clears the body entries and goes straight to the lesson finder.
  const applySkip = () => {
    update({ bodyStatus: "skipped", preObservations: [], regions: [], checkinBaselineReady: false });
    flow.push(routes.discover);
  };
  const skipBody = () => {
    if (state.preObservations.length) { setConfirmSkip(true); return; }
    applySkip();
  };
  return <div className="mcy-flow-footer single mcy-checkin-footer">
    {state.signedIn && aiPracticeOffered(state)
      ? <><Action onClick={() => { update({ checkinBaselineReady: hasCheckinBaseline(state) }); flow.push(routes.dailyPractice); }}>{locale === "en-US" ? "Choose today's practice with AI" : "Chọn buổi hôm nay cùng AI"}</Action><button className="mcy-quiet-link" onClick={browseFreeLessons}>{msg(locale, "checkin.guest.find")}</button></>
      : <Action onClick={browseFreeLessons}>{msg(locale, "checkin.guest.find")}</Action>}
    <div className="mcy-checkin-footer-options">{!state.signedIn && <button onClick={openOptionalAccount}>{msg(locale, "checkin.step2.account")}</button>}<button onClick={skipBody}>{msg(locale, "checkin.step1.skip")}</button></div>
    <BottomSheet open={confirmSkip} onOpenChange={setConfirmSkip} title={locale === "en-US" ? "Skip the body check-in?" : "Bỏ ghi nhận vùng cơ thể?"} description={locale === "en-US" ? "The areas you entered will be cleared from this check-in. You can add them again later." : "Các vùng vừa ghi sẽ được xóa khỏi lần check-in này. Bạn có thể chọn lại sau."} snap={0.38}>
      <div className="mcy-sheet-actions"><button className="mcy-action" onClick={() => { applySkip(); setConfirmSkip(false); }}>{locale === "en-US" ? "Skip and continue" : "Bỏ qua và tiếp tục"} <ArrowRightIcon /></button><button className="mcy-quiet-link" onClick={() => setConfirmSkip(false)}>{locale === "en-US" ? "Keep my entries" : "Giữ các vùng đã ghi"}</button></div>
    </BottomSheet>
  </div>;
}
