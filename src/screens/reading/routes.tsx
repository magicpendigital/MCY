import { lazy } from "react";
import { MobileScroll, useFlow } from "../../mobile";
import { useDemo } from "../../app/state";
import { RouteSuspense } from "../../app/RouteSuspense";
import { useRoutes } from "../../app/navigation";

const ReadingPreviewScreen = lazy(() => import("../../library/ReadingPreviewScreen"));
const ReadingLibraryScreen = lazy(() => import("../../library/ReadingLearnerScreens").then(module => ({ default: module.ReadingLibraryScreen })));
const ReadingLessonScreen = lazy(() => import("../../library/ReadingLearnerScreens").then(module => ({ default: module.ReadingLessonScreen })));
const ReadingPublishScreen = lazy(() => import("../../library/ReadingPublishScreen"));

const readingFallback = <MobileScroll className="mcy-scroll"><main className="mcy-page"><div className="mcy-inline-note" role="status">Đang mở bài đọc…</div></main></MobileScroll>;
export function ReadingLibraryRoute() {
  const flow = useFlow();
  const routes = useRoutes();
  return <RouteSuspense fallback={readingFallback}><ReadingLibraryScreen onOpened={() => flow.push(routes.readingLesson)} /></RouteSuspense>;
}
export function ReadingLessonRoute() {
  const flow = useFlow();
  const routes = useRoutes();
  return <RouteSuspense fallback={readingFallback}><ReadingLessonScreen onCheckin={() => flow.push(routes.checkin)} onOpened={() => undefined} /></RouteSuspense>;
}
export function ReadingPublishRoute() {
  const { state } = useDemo();
  if (!state.userId) return <MobileScroll className="mcy-scroll"><main className="mcy-page"><div className="mcy-inline-note" role="status">Đăng nhập để cấu hình hiển thị cho học viên.</div></main></MobileScroll>;
  return <RouteSuspense fallback={readingFallback}><ReadingPublishScreen key={state.userId} userId={state.userId} /></RouteSuspense>;
}

export function ReadingPreviewRoute() {
  const flow = useFlow();
  const routes = useRoutes();
  const { state } = useDemo();
  if (!state.userId) return <MobileScroll className="mcy-scroll"><main className="mcy-page"><div className="mcy-inline-note" role="status">Đăng nhập để xem trước nội dung được giao cho bạn.</div></main></MobileScroll>;
  return <RouteSuspense fallback={<MobileScroll className="mcy-scroll"><main className="mcy-page"><div className="mcy-inline-note" role="status">Đang mở xem trước…</div></main></MobileScroll>}>
    <ReadingPreviewScreen key={state.userId} userId={state.userId} active={flow.current.id === routes.readingPreview.id} />
  </RouteSuspense>;
}
