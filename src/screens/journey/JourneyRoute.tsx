import { lazy } from "react";
import { MobileScroll, useFlow } from "../../mobile";
import { useDemo } from "../../app/state";
import { RouteSuspense } from "../../app/RouteSuspense";
import { useRoutes } from "../../app/navigation";
import { Action, DemoNote } from "../../app/ui/controls";
import { BodyMap } from "../../app/body/BodyMap";
import { BodyStylePicker } from "../../app/body/BodyStylePicker";
import { RegionEditor } from "../../app/body/RegionEditor";

const LazyJourneyScreen = lazy(() => import("../../JourneyScreen"));

export function JourneyRoute() {
  const flow = useFlow();
  const routes = useRoutes();
  const { state, setState, update } = useDemo();
  return <RouteSuspense fallback={<MobileScroll className="mcy-scroll"><main className="mcy-page"><div className="mcy-inline-note" role="status">{state.locale === "en-US" ? "Opening your journey…" : "Đang mở Hành trình…"}</div></main></MobileScroll>}>
    <LazyJourneyScreen
      state={state}
      setState={setState}
      update={update}
      BodyMapComponent={BodyMap}
      BodyStylePickerComponent={BodyStylePicker}
      RegionEditorComponent={RegionEditor}
      ActionComponent={Action}
      DemoNoteComponent={DemoNote}
      onStartNext={() => {
        update({ dialogueChoice: null, dialogueText: "", aiConversation: [], aiPending: false, aiError: "", minutes: 10, energy: null, regions: [], preObservations: [], postObservations: [], bodyStatus: null, postBodyStatus: null, outcome: null, pace: null, note: "", endedEarly: false, usePreviousFeedback: false, lastReflection: null, checkinBaselineReady: false, reflectionHasCheckinBaseline: false, reflectionBeforeStatus: null, reflectionBeforeObservations: [], reflectionLessonTitle: "", currentRemoteCheckinId: null, pendingCheckinIdempotencyKey: null, pendingCheckinPayload: null });
        flow.push(routes.checkin);
      }}
    />
  </RouteSuspense>;
}
