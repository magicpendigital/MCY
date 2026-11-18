import { MobileScroll } from "../../mobile";
import { DemoNote, Eyebrow } from "../../app/ui/controls";

export function DiscoverDetailScreen() {
  return <MobileScroll className="mcy-scroll"><main className="mcy-page mcy-discover-detail"><Eyebrow>HƯỚNG DẪN</Eyebrow><h1>Tự chọn nội dung theo điều bạn cần hôm nay.</h1><p className="mcy-lead">Check-in, duyệt bài học miễn phí và ghi lại cảm nhận nếu bạn muốn.</p><section className="mcy-article-body"><p>Check-in là điều bạn tự ghi nhận ở thời điểm hiện tại. Bạn có thể chọn từng vùng cơ thể, chọn mức phù hợp hoặc bỏ qua vùng chưa muốn ghi. Check-in không thay cho chẩn đoán.</p><p>MCY chưa tự ghép video thành buổi tập hoặc chọn bài dựa trên check-in. Quay lại Khám phá để tự duyệt danh mục; mỗi video là một bài riêng và chưa được đánh giá theo nhu cầu sức khỏe cá nhân.</p><p>Trong lúc thực hành, hãy theo nhịp của mình và dừng nếu bài tập không phù hợp. Sau đó, bạn có thể ghi riêng từng vùng là dễ chịu hơn, như cũ, khó chịu hơn, chưa rõ hoặc bỏ qua.</p></section><DemoNote>Đây là hướng dẫn sử dụng chung, không phải tư vấn y tế. Nếu cần chăm sóc, hãy tìm hỗ trợ phù hợp tại nơi bạn đang ở.</DemoNote></main></MobileScroll>;
}
