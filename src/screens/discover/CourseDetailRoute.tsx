import { lazy } from "react";
import { MobileScroll, useFlow } from "../../mobile";
import { useDemo } from "../../app/state";
import { RouteSuspense } from "../../app/RouteSuspense";
import { useRoutes } from "../../app/navigation";

const CourseDetailScreen = lazy(() => import("../../courses/CourseDetailScreen"));

export function CourseDetailRoute() {
  const flow = useFlow();
  const routes = useRoutes();
  const { state, update } = useDemo();
  return <RouteSuspense fallback={<MobileScroll className="mcy-scroll"><main className="mcy-page"><div className="mcy-inline-note" role="status">{state.locale === "en-US" ? "Opening the lesson…" : "Đang mở bài học…"}</div></main></MobileScroll>}>
    <CourseDetailScreen
      locale={state.locale}
      selectedCourseId={state.selectedCourseId}
      selectedLessonId={state.selectedLessonId}
      active={flow.current.id === routes.courseDetail.id}
      onSelectLesson={lessonId => update({ selectedLessonId: lessonId })}
      onRecordReflection={(courseTitle, lessonTitle) => {
        update({ checkinBaselineReady: false, reflectionHasCheckinBaseline: state.checkinBaselineReady, reflectionBeforeStatus: state.checkinBaselineReady ? state.bodyStatus : null, reflectionBeforeObservations: state.checkinBaselineReady ? [...state.preObservations] : [], reflectionLessonTitle: `${courseTitle} · ${lessonTitle}`, postObservations: [], postBodyStatus: null, outcome: null, pace: null, note: "", endedEarly: false });
        flow.push(routes.reflection);
      }}
    />
  </RouteSuspense>;
}
