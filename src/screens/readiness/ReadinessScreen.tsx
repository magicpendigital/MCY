import { useState } from "react";
import { MobileScroll, useFlow } from "../../mobile";
import { Action, DemoNote, Eyebrow } from "../../app/ui/controls";
import { useRoutes } from "../../app/navigation";

export function ReadinessScreen() {
  const flow = useFlow();
  const routes = useRoutes();
  const [result, setResult] = useState<"within_scope" | "unknown" | "needs_review" | "stop_guidance" | null>(null);
  const choose = (value: NonNullable<typeof result>) => setResult(value);
  const advance = () => {
    if (result === "within_scope") flow.replace(routes.discover);
    else if (result === "unknown") flow.replace(routes.discover);
    else if (result === "needs_review") flow.replace(routes.help);
    else if (result === "stop_guidance") flow.replace(routes.home);
  };
  return <MobileScroll className="mcy-scroll"><main className="mcy-page mcy-readiness-page"><Eyebrow>A06 · TRƯỚC KHI THỰC HÀNH</Eyebrow><h1>Hôm nay bạn có muốn tiếp tục thật nhẹ nhàng không?</h1><p className="mcy-lead">Chọn theo cảm nhận của bạn. Đây không phải chẩn đoán hay đánh giá an toàn y tế.</p><div className="mcy-account-panel"><strong>Nếu bạn chưa chắc, bạn có thể dừng lại.</strong><p>MCY hiện chưa tạo gợi ý tự động. Bạn luôn tự chọn bài học và có thể dừng bất cứ lúc nào.</p></div><div className="mcy-readiness-options"><button aria-pressed={result === "within_scope"} onClick={() => choose("within_scope")}><strong>Tôi muốn tiếp tục nhẹ nhàng</strong><small>Đi tới thư viện bài học miễn phí.</small></button><button aria-pressed={result === "unknown"} onClick={() => choose("unknown")}><strong>Tôi chưa chắc</strong><small>Xem thư viện mà không dùng phản hồi để cá nhân hóa.</small></button><button aria-pressed={result === "needs_review"} onClick={() => choose("needs_review")}><strong>Tôi cần người xem cùng</strong><small>Mở hướng dẫn và hỗ trợ.</small></button><button aria-pressed={result === "stop_guidance"} onClick={() => choose("stop_guidance")}><strong>Tôi muốn dừng hôm nay</strong><small>Không chọn bài lúc này.</small></button></div>{result === "stop_guidance" && <div className="mcy-alert">Mình sẽ không đề xuất bài lúc này. Nếu bạn cần hỗ trợ khẩn cấp, hãy liên hệ dịch vụ phù hợp tại nơi bạn đang ở.</div>}{result === "needs_review" && <div className="mcy-alert">Hiện chưa có phiên tư vấn trực tiếp trong ứng dụng. Bạn có thể xem hướng dẫn chung.</div>}<Action disabled={!result} onClick={advance}>{result === "within_scope" || result === "unknown" ? "Xem bài học miễn phí" : result === "needs_review" ? "Mở hướng dẫn" : "Kết thúc ở đây"}</Action><button className="mcy-quiet-link" onClick={() => flow.replace(routes.discover)}>Bỏ qua câu hỏi · xem bài học miễn phí</button><DemoNote>Chỉ những điều bạn chủ động ghi nhận mới xuất hiện trong check-in và Hành trình.</DemoNote></main></MobileScroll>;
}
