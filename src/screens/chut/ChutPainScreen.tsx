import { MobileScroll, useFlow, useKeyboard } from "../../mobile";
import { finishAtAuthDestination, useRoutes } from "../../app/navigation";

// Chút slice 1: fixed copy for pain or discomfort. Chút picks no lesson here, calls no network service and logs nothing.
export function ChutPainScreen() {
  const flow = useFlow();
  const routes = useRoutes();
  const keyboard = useKeyboard();
  return <MobileScroll className="mcy-scroll"><main className="mcy-page mcy-chut-page mcy-chut-pain" data-testid="chut-pain">
    <span className="mcy-chut-fixed-label">Câu cố định · không do AI viết</span>
    <p className="mcy-chut-pain-lead">Nếu bạn đang đau hoặc khó chịu, hãy dừng lại và nghỉ. Mình không thay được người hướng dẫn.</p>
    <p>Khi bạn đang đau hoặc khó chịu, Chút không chọn bài và không dùng AI. Nếu bạn cần hỗ trợ khẩn cấp, hãy liên hệ dịch vụ phù hợp tại nơi bạn đang ở.</p>
    <button type="button" className="mcy-chut-primary" onClick={() => { keyboard.hide(); finishAtAuthDestination(flow, routes, "home"); }}>Dừng ở đây</button>
    <button type="button" className="mcy-chut-secondary" onClick={() => { keyboard.hide(); flow.replace(routes.discover); }}>Tự xem thư viện bài học</button>
    <small className="mcy-chut-pain-small">Trong thư viện, bạn tự chọn. Chút không gợi ý bài lúc này.</small>
  </main></MobileScroll>;
}
