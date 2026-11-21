import { lazy } from "react";
import { MobileScroll, useFlow } from "../../mobile";
import { useDemo } from "../../app/state";
import { RouteSuspense } from "../../app/RouteSuspense";
import { useRoutes } from "../../app/navigation";

const DiscoverScreen = lazy(() => import("../../courses/DiscoverScreen"));

export function DiscoverRoute() {
  const flow = useFlow();
  const routes = useRoutes();
  const { state, update } = useDemo();
  return <RouteSuspense fallback={<MobileScroll className="mcy-scroll"><main className="mcy-page"><div className="mcy-inline-note" role="status">{state.locale === "en-US" ? "Opening free lessons…" : "Đang mở bài học miễn phí…"}</div></main></MobileScroll>}>
    <DiscoverScreen
      locale={state.locale}
      onOpenCourse={(courseId, firstLessonId) => {
        update({ selectedCourseId: courseId, selectedLessonId: firstLessonId });
        flow.push(routes.courseDetail);
      }}
      onOpenGuide={() => flow.push(routes.discoverDetail)}
      onOpenReading={entry => {
        if (!entry) { flow.push(routes.readingLibrary); return; }
        void import("../../library/ReadingLearnerScreens").then(module => module.openReadingEntry(entry));
        flow.push(routes.readingLesson);
      }}
      checkinRegions={state.preObservations.map(item => item.region)}
    />
  </RouteSuspense>;
}
