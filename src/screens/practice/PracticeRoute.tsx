import { lazy } from "react";
import type { PracticeContext } from "../../../supabase/functions/_shared/practiceContract";
import { bodyRegionCodes } from "../../bodyRegions";
import { MobileScroll, useFlow } from "../../mobile";
import { rememberedPace } from "../../practice/feedbackMemory";
import { useDemo } from "../../app/state";
import { hasCurrentAiConsent } from "../../app/predicates";
import { RouteSuspense } from "../../app/RouteSuspense";
import { useRoutes } from "../../app/navigation";

const PracticeFlowScreen = lazy(() => import("../../practice/PracticeFlowScreen"));

export function PracticeRoute() {
  const flow = useFlow();
  const routes = useRoutes();
  const { state, update } = useDemo();
  const context: Omit<PracticeContext, "revision" | "pace" | "guidance" | "floor"> = {
    locale: state.locale, minutes: state.minutes, energy: state.energy, intent: state.intent, bodyStatus: state.bodyStatus,
    regions: [...new Set(state.preObservations.flatMap(item => bodyRegionCodes(item.region, item.side)))],
  };
  return <RouteSuspense fallback={<MobileScroll className="mcy-scroll"><main className="mcy-page"><p role="status">Đang mở buổi học…</p></main></MobileScroll>}><PracticeFlowScreen
    context={context} userId={state.userId} consentCurrent={hasCurrentAiConsent(state)} active={flow.current.id === routes.dailyPractice.id}
    previousWasTooFast={Boolean(rememberedPace(state.history, state.saveFeedbackConsent && state.rememberPace))}
    onBrowse={() => flow.push(routes.discover)} onConsent={() => flow.push(routes.privacy)} onAdjust={() => flow.pop()}
    onReflect={(title, endedEarly) => {
      update({ checkinBaselineReady: false, reflectionHasCheckinBaseline: state.checkinBaselineReady, reflectionBeforeStatus: state.checkinBaselineReady ? state.bodyStatus : null, reflectionBeforeObservations: state.checkinBaselineReady ? [...state.preObservations] : [], reflectionLessonTitle: title, postObservations: [], postBodyStatus: null, outcome: null, pace: null, note: "", endedEarly });
      flow.push(routes.reflection);
    }}
  /></RouteSuspense>;
}
