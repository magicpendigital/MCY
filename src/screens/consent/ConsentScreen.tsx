import { MobileScroll } from "../../mobile";
import { useDemo } from "../../app/state";
import { isCheckinAuthReturn } from "../../app/predicates";
import { DemoNote, Eyebrow } from "../../app/ui/controls";

export function ConsentScreen() {
  const { state, update } = useDemo();
  const togglePurpose = (key: "aiConsent" | "saveFeedbackConsent" | "teacherShareConsent" | "marketingConsent") => {
    if (key === "aiConsent") update({ aiConsent: !state.aiConsent });
    if (key === "saveFeedbackConsent") update({ saveFeedbackConsent: !state.saveFeedbackConsent });
    if (key === "teacherShareConsent" && state.teacherShareConsent) update({ teacherShareConsent: false });
    if (key === "marketingConsent") update({ marketingConsent: !state.marketingConsent });
  };
  return <MobileScroll className="mcy-scroll"><main lang="vi" className="mcy-page mcy-auth-page">
    <Eyebrow>A05 · QUYỀN VÀ ĐIỀU KHOẢN</Eyebrow><h1>Bạn chọn dữ liệu nào được dùng.</h1>
    <p className="mcy-lead">Mỗi mục đích là một lựa chọn riêng. Phiên bản hiện hành được hiển thị trước khi bạn đồng ý; nội dung pháp lý cuối cùng sẽ được cập nhật trước khi mở rộng phát hành.</p>
    {state.locale === "en-US" && <div className="mcy-locale-note" role="note">This consent screen is shown in Vietnamese. Consent evidence records the language displayed as vi-VN.</div>}
    <section className="mcy-consent-card required"><span className="mcy-tag">CẦN ĐỂ TIẾP TỤC TRONG APP</span><strong>Điều khoản dịch vụ và thông báo quyền riêng tư · phiên bản 0.1</strong><p>Supabase đã xác minh email. Đồng ý để tiếp tục sử dụng tài khoản; lựa chọn và phiên bản được ghi thành sự kiện.</p><button aria-pressed={state.termsAccepted && state.privacyAccepted} onClick={() => { const value = !(state.termsAccepted && state.privacyAccepted); update({ termsAccepted: value, privacyAccepted: value }); }}><i>{state.termsAccepted && state.privacyAccepted ? "✓" : ""}</i>{state.termsAccepted && state.privacyAccepted ? "Đã đồng ý phiên bản 0.1" : "Tôi đồng ý điều khoản và thông báo · phiên bản 0.1"}</button></section>
    {([
      ["aiConsent", "Cho phép AI hỗ trợ trao đổi ngắn", "Trợ lý chỉ hoạt động khi máy chủ xác nhận sẵn sàng cho phiên của bạn. Khi bạn xác nhận lựa chọn và đồng ý AI hiện hành, chỉ thời lượng, năng lượng, mục tiêu, mã vùng và sở thích hiện tại được gửi tới dịch vụ AI bên ngoài. Không gửi hội thoại trước đó, tên/email, ghi chú tự do hoặc feedback lịch sử. AI chỉ chọn nội dung đã duyệt, không tạo động tác hoặc chẩn đoán. Bạn có thể rút đồng ý bất cứ lúc nào. Nội dung quyền riêng tư vẫn là bản rà soát, chưa phải văn bản pháp lý cuối cùng.", state.aiConsent],
      ["saveFeedbackConsent", "Lưu check-in cơ thể và năng lượng", "Cho phép lưu các lần check-in và ghi chú để xem trong Hành trình. Phản hồi sau buổi hiện chỉ được giữ trong phiên.", state.saveFeedbackConsent],
      ["teacherShareConsent", "Chia sẻ với một giáo viên cụ thể", "Chưa có lớp được kết nối. Lựa chọn này luôn tắt cho đến khi bạn chọn rõ người nhận, phạm vi và thời hạn.", state.teacherShareConsent],
      ["marketingConsent", "Nhận tin về nội dung mới", "Tùy chọn; tách khỏi thông báo dịch vụ và nhắc tập.", state.marketingConsent],
    ] as const).map(([key, title, description, value]) => <section className="mcy-consent-card" key={key}><strong>{title}</strong><p>{description}</p><button disabled={key === "teacherShareConsent" && !value} aria-pressed={value} onClick={() => togglePurpose(key)}><i>{value ? "✓" : ""}</i>{key === "teacherShareConsent" && !value ? "Chưa có lớp được kết nối" : value && key === "teacherShareConsent" ? "Rút đồng ý" : value ? "Cho phép" : "Không cho phép"}</button></section>)}
    <div className="mcy-form-error subtle">Từ chối AI, bạn vẫn có thể tự chọn video miễn phí. Từ chối lưu thì check-in chỉ còn trong phiên và không được ghi vào tài khoản.</div>
    {state.onboardingComplete && isCheckinAuthReturn(state.authReturnTo) && <div className="mcy-consent-card"><strong>Nháp check-in trong phiên này</strong><p>{state.saveFeedbackConsent ? "Xác nhận tiếp tục sẽ gắn nháp với tài khoản của bạn." : "Bạn chưa cho phép lưu check-in; nháp chỉ dùng trong phiên này."} Nếu không muốn dùng nháp nữa, chọn Bỏ nháp.</p></div>}
    <DemoNote>Mỗi thay đổi được ghi thành sự kiện đồng ý riêng của tài khoản. Ngôn ngữ và phiên bản hiển thị được lưu cùng lựa chọn.</DemoNote>
  </main></MobileScroll>;
}
