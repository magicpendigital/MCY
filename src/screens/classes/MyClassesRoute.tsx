import { lazy } from "react";
import { MobileScroll, useFlow } from "../../mobile";
import { useDemo } from "../../app/state";
import { RouteSuspense } from "../../app/RouteSuspense";
import { useRoutes } from "../../app/navigation";

const MyClassesScreen = lazy(() => import("../../classes/MyClassesScreen"));

export function MyClassesRoute() {
  const flow = useFlow();
  const routes = useRoutes();
  const { state } = useDemo();
  if (!state.userId) return <MobileScroll className="mcy-scroll"><main className="mcy-page"><div className="mcy-inline-note" role="status">Đăng nhập để xem lớp và nhận xét của bạn.</div></main></MobileScroll>;
  return <RouteSuspense fallback={<MobileScroll className="mcy-scroll"><main className="mcy-page"><div className="mcy-inline-note" role="status">Đang mở lớp…</div></main></MobileScroll>}>
    <MyClassesScreen key={state.userId} userId={state.userId} active={flow.current.id === routes.myClasses.id} />
  </RouteSuspense>;
}
