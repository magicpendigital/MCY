import { useRef, useState } from "react";
import { InfoCircledIcon, PersonIcon, ReaderIcon } from "@radix-ui/react-icons";
import { newId } from "../../compat";
import type { AppLocale } from "../../i18n";
import { BottomSheet, KeyboardInput, MobileScroll, useFlow, useKeyboard } from "../../mobile";
import { clientChannel, getAccountBoundSupabaseClient, getSupabaseClient } from "../../backend/supabase";
import { checkNewPassword, PASSWORD_CHECK_MESSAGES, passwordChangeMessage } from "../../backend/passwordAuth";
import { CONSENT_POLICY_VERSIONS, deleteMyAccount, saveConsentEvent, type ConsentPurpose } from "../../backend/learnerData";
import { rememberedPace } from "../../practice/feedbackMemory";
import type { DemoState } from "../../app/model";
import { useDemo } from "../../app/state";
import { useLearnerContinuation } from "../../app/useLearnerContinuation";
import { persistProfile } from "../../app/persistence";
import { Action, Choice, DemoNote, Eyebrow } from "../../app/ui/controls";
import { AccountRow } from "../../app/ui/AccountRow";
import { BodyStylePicker } from "../../app/body/BodyStylePicker";
import { useHelpRoutes, useRoutes } from "../../app/navigation";
import { HELP_ARTICLES } from "../help/articles";
import { ACCOUNT_DELETION_WEB_URL, AI_OFF_PRIVACY_DETAIL, PRIVACY_POLICY_WEB_URL, TERMS_WEB_URL, type AccountPanel } from "./accountData";
import { PrivacyToggle } from "./PrivacyToggle";

export function AccountDetailScreen({ panel }: { panel: AccountPanel }) {
  const flow = useFlow();
  const routes = useRoutes();
  const helpRoutes = useHelpRoutes();
  const keyboard = useKeyboard();
  const { state, setState, update } = useDemo();
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [editLocale, setEditLocale] = useState<AppLocale>(state.locale);
  const [name, setName] = useState(state.displayName);
  const consentAccount = useRef(`${state.signedIn}:${state.userId}`);
  consentAccount.current = `${state.signedIn}:${state.userId}`;
  const consentWritePending = useRef(false);
  const captureContinuation = useLearnerContinuation();
  const [consentPending, setConsentPending] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteWord, setDeleteWord] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteNotice, setDeleteNotice] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ tone: "ok" | "error"; text: string } | null>(null);
  const savePassword = async () => {
    keyboard.hide();
    const check = checkNewPassword(newPassword, confirmPassword);
    if (check !== "ok") { setPasswordMessage({ tone: "error", text: PASSWORD_CHECK_MESSAGES[check] }); return; }
    if (!state.userId || passwordSaving) return;
    const expectedUserId = state.userId;
    setPasswordSaving(true);
    setPasswordMessage(null);
    try {
      const client = await getSupabaseClient();
      const { data: current } = (await client?.auth.getSession()) ?? { data: { session: null } };
      if (!client || current.session?.user.id !== expectedUserId) throw new Error("account_changed");
      const { error: updateError } = await client.auth.updateUser({ password: newPassword });
      if (updateError) { setPasswordMessage({ tone: "error", text: passwordChangeMessage(updateError) }); return; }
      setNewPassword("");
      setConfirmPassword("");
      setPasswordMessage({ tone: "ok", text: "Đã lưu mật khẩu. Bạn có thể đăng nhập bằng email và mật khẩu này." });
    } catch (cause) {
      setPasswordMessage({ tone: "error", text: passwordChangeMessage(cause) });
    } finally {
      setPasswordSaving(false);
    }
  };
  const deviceTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "Không xác định";
  const filteredHelpArticles = HELP_ARTICLES.filter(article => {
    const searchableText = [article.title, article.detail, article.lead, ...article.paragraphs].join(" ").toLocaleLowerCase("vi");
    return searchableText.includes(query.toLocaleLowerCase("vi"));
  });
  const latest = rememberedPace(state.history, state.saveFeedbackConsent && state.rememberPace);
  const changeConsent = async (purpose: ConsentPurpose, granted: boolean, patch: Partial<DemoState>) => {
    if (consentWritePending.current) return;
    consentWritePending.current = true;
    setConsentPending(true);
    const expectedAccount = consentAccount.current;
    const expectedUserId = state.userId;
    const expectedSignedIn = state.signedIn;
    const current = captureContinuation();
    setError("");
    try {
      const policyVersion = CONSENT_POLICY_VERSIONS[purpose];
      const needsReacceptance = granted && state.consentPolicyVersions[purpose] !== policyVersion;
      if (state.userId && (state.consentBaseline[purpose] !== granted || needsReacceptance)) {
        const client = await getAccountBoundSupabaseClient(expectedUserId!);
        if (!current() || consentAccount.current !== expectedAccount) return;
        await saveConsentEvent(client, purpose, granted, policyVersion, "settings", newId(), clientChannel());
      }
      if (!current() || consentAccount.current !== expectedAccount) return;
      setState(previous => current(previous) && previous.userId === expectedUserId && previous.signedIn === expectedSignedIn ? { ...previous, ...patch, consentBaseline: { ...previous.consentBaseline, [purpose]: granted }, consentPolicyVersions: { ...previous.consentPolicyVersions, [purpose]: policyVersion } } : previous);
    } catch {
      if (current() && consentAccount.current === expectedAccount) setError("Chưa xác định lựa chọn quyền đã được lưu hay chưa. Hãy tải lại trạng thái trước khi thử tiếp.");
    } finally { consentWritePending.current = false; setConsentPending(false); }
  };
  const deleteConfirmed = ["XÓA", "XOA"].includes(deleteWord.trim().normalize("NFC").toLocaleUpperCase("vi"));
  const deleteAccount = async () => {
    if (!state.userId || deleting || !deleteConfirmed) return;
    const expectedUserId = state.userId;
    setDeleting(true);
    setError("");
    try {
      const client = await getSupabaseClient();
      const { data: current } = (await client?.auth.getSession()) ?? { data: { session: null } };
      if (!client || current.session?.user.id !== expectedUserId) throw new Error("account_changed");
      const outcome = await deleteMyAccount(client);
      if (outcome === "staff_account") {
        setError("Tài khoản có vai trò quản trị hoặc giáo viên nên chỉ Owner xóa được. Hãy liên hệ Owner.");
        return;
      }
      keyboard.hide();
      setDeleteOpen(false);
      setDeleteWord("");
      const shared = await getSupabaseClient();
      await shared?.auth.signOut({ scope: "local" });
      setDeleteNotice("Đã xóa tài khoản và dữ liệu của bạn trên máy chủ. Bạn đang ở chế độ khách.");
    } catch {
      setError("Chưa xóa được tài khoản. Hãy kiểm tra kết nối rồi thử lại; nếu vẫn lỗi, dùng trang yêu cầu xóa trên web.");
    } finally {
      setDeleting(false);
    }
  };
  const saveProfileChanges = async () => {
    keyboard.hide();
    setError("");
    const current = captureContinuation();
    try {
      const emailLocaleSynced = await persistProfile(state, name, state.bodyStyle, editLocale);
      if (!current()) return;
      setState(previous => current(previous) ? { ...previous, displayName: name.trim(), locale: editLocale } : previous);
      setError(state.userId ? emailLocaleSynced === false ? "Hồ sơ đã lưu. Ngôn ngữ email chưa đồng bộ; bạn có thể chọn lại khi đăng nhập." : "Hồ sơ đã lưu vào tài khoản." : "Hồ sơ chỉ được giữ trong phiên khách.");
    } catch (cause) {
      if (!current()) return;
      setError(cause instanceof Error ? `Chưa lưu được hồ sơ: ${cause.message}` : "Chưa lưu được hồ sơ.");
    }
  };
  const screen = (eyebrow: string, title: string, description: string, content: React.ReactNode) => <MobileScroll className="mcy-scroll"><main className="mcy-page mcy-account-detail"><Eyebrow>{eyebrow}</Eyebrow><h1>{title}</h1><p className="mcy-lead">{description}</p>{consentPending && <p role="status">Đang lưu lựa chọn quyền…</p>}{content}<DemoNote>Hồ sơ và lựa chọn quyền được đồng bộ khi dịch vụ đã kết nối. Nếu một tính năng chưa sẵn sàng, ứng dụng sẽ thông báo rõ trước khi bạn sử dụng.</DemoNote></main></MobileScroll>;
  if (panel === "edit") return screen("HỒ SƠ", "Thông tin tối thiểu, do bạn sửa.", "Tên tùy chọn, cài đặt hiển thị và các trường chỉ hỏi khi thật sự cần.", <><label className="mcy-form-field">Tên hiển thị<KeyboardInput autoComplete="nickname" aria-label="Tên hiển thị" value={name} onChange={event => setName(event.target.value)} onBlur={() => keyboard.hide()} placeholder="Tên gọi trong ứng dụng" /></label><div className="mcy-account-panel"><strong>Ngôn ngữ</strong>{import.meta.env.DEV ? <><div className="mcy-chip-grid"><Choice selected={editLocale === "vi-VN"} onClick={() => setEditLocale("vi-VN")}>Tiếng Việt</Choice><Choice selected={editLocale === "en-US"} onClick={() => setEditLocale("en-US")}>English · đang hoàn thiện</Choice></div><small className="mcy-locale-note">{editLocale === "en-US" ? "English is in progress. Welcome, the main practice loop and Journey are translated; account, consent, support and knowledge screens remain in Vietnamese." : "Tiếng Anh hiện đang được hoàn thiện. Chào mừng, luồng tập chính và Hành trình đã có bản dịch; tài khoản, đồng ý, hỗ trợ và nội dung kiến thức vẫn dùng tiếng Việt."}</small></> : <p className="mcy-device-timezone">Tiếng Việt</p>}<p className="mcy-device-timezone">Múi giờ thiết bị: {deviceTimeZone}</p></div><div className="mcy-account-panel"><strong>Hình body map</strong><BodyStylePicker value={state.bodyStyle} onChange={bodyStyle => update({ bodyStyle })} /></div>{error && <div className="mcy-form-error" role="alert">{error}</div>}<Action onClick={() => { void saveProfileChanges(); }}>Lưu thay đổi</Action><button className="mcy-quiet-link" onClick={() => flow.pop()}>Hủy</button></>);
  if (panel === "memory") return screen(state.aiCapability === "ready" ? "AI VÀ ĐIỀU ĐƯỢC NHỚ" : "ĐIỀU ĐƯỢC NHỚ", "Bạn xem được nguồn của mọi điều được nhớ.", "Không có suy luận sức khỏe dài hạn. Một phản hồi khó chịu hơn không thành sở thích mặc định.", <><div className="mcy-account-panel"><span className="mcy-tag">TRẠNG THÁI</span>{latest && state.rememberPace ? <><strong>Nhịp buổi trước hơi nhanh</strong><p>Nguồn: phản hồi sau buổi · phạm vi: gợi ý nhịp lần kế tiếp · dữ liệu chỉ trong phiên.</p><button className="mcy-toggle" aria-pressed={state.rememberPace} onClick={() => update({ rememberPace: false, usePreviousFeedback: false })}>Tắt và xóa ghi nhớ</button></> : <><strong>Chưa có ghi nhớ đang bật</strong><p>Phản hồi sau buổi hiện chỉ nằm trong phiên; chưa được lưu vào tài khoản.</p></>}</div><div className="mcy-account-panel"><strong>Trợ lý AI</strong><p>{state.aiCapability === "ready" ? "Trợ lý sẵn sàng cho phiên này. Chỉ gửi lựa chọn khi bạn đồng ý AI hiện hành và chủ động xác nhận." : "Trợ lý chưa sẵn sàng cho phiên này. Bạn vẫn có thể xem khóa học và tự chọn bài."}</p><button className="mcy-toggle" aria-pressed={state.aiConsent} disabled={consentPending} onClick={() => { void changeConsent("ai_processing", !state.aiConsent, { aiConsent: !state.aiConsent, usePreviousFeedback: false }); }}>{state.aiConsent ? "Rút đồng ý AI" : "Đồng ý cho xử lý khi tính năng được mở"}</button></div><AccountRow title="Xem quyền theo mục đích" detail="Rút đồng ý và xem ảnh hưởng" onClick={() => flow.push(routes.privacy)} />{error && <div className="mcy-form-error" role="alert">{error}</div>}</>);
  if (panel === "privacy") return screen(
    "QUYỀN RIÊNG TƯ",
    "Mỗi mục đích có phạm vi riêng.",
    "Các lựa chọn đã đăng nhập được ghi thành sự kiện vào sổ đồng ý. Đồng ý chia sẻ không tự cấp quyền xem dữ liệu cho giáo viên.",
    <>
      <div className="mcy-consent-card required">
        <span className="mcy-tag">BẮT BUỘC KHI ĐĂNG NHẬP</span>
        <strong>Điều khoản dịch vụ · phiên bản 0.1</strong>
        <p>{state.termsAccepted && state.privacyAccepted ? "Đã ghi lựa chọn điều khoản và quyền riêng tư cho tài khoản này." : "Chưa ghi nhận đồng ý trong tài khoản."} Nội dung sẽ được cập nhật khi chính sách chính thức được phê duyệt.</p>
      </div>
      <PrivacyToggle title="Dùng check-in với trợ lý AI" detail={AI_OFF_PRIVACY_DETAIL} actionLabels={{ active: "Rút đồng ý", inactive: "Đồng ý" }} value={state.aiConsent} disabled={consentPending} onToggle={value => { void changeConsent("ai_processing", value, { aiConsent: value, usePreviousFeedback: false }); }} />
      <PrivacyToggle title="Lưu check-in trong hành trình" detail="Cho phép lưu check-in mới; phản hồi sau buổi được giữ trong phiên hiện tại." value={state.saveFeedbackConsent} disabled={consentPending} onToggle={value => { void changeConsent("wellbeing_data", value, { saveFeedbackConsent: value, rememberPace: value ? state.rememberPace : false, usePreviousFeedback: false }); }} />
      <PrivacyToggle title="Đồng ý chia sẻ với giáo viên" detail={state.teacherShareConsent ? "Chưa có lớp được kết nối. Bạn có thể rút lựa chọn đã lưu; hiện không có dữ liệu nào được gửi." : "Chưa có lớp được kết nối nên chưa thể cấp đồng ý chia sẻ. Khi có người nhận, bạn sẽ chọn rõ phạm vi và thời hạn."} value={state.teacherShareConsent} disabled={consentPending || !state.teacherShareConsent} onToggle={value => { if (!value) void changeConsent("teacher_sharing", false, { teacherShareConsent: false }); }} />
      <PrivacyToggle title="Tin nội dung và marketing" detail="Tách khỏi thông báo dịch vụ và nhắc tập." value={state.marketingConsent} disabled={consentPending} onToggle={value => { void changeConsent("marketing", value, { marketingConsent: value }); }} />
      {error && <div className="mcy-form-error" role="alert">{error}</div>}
      <div className="mcy-policy-meta">
        <span>Điều khoản: phiên bản 0.1 · vi-VN</span>
        <span>Quyền riêng tư: phiên bản 0.1 · vi-VN</span>
        <span>AI: ai-processing-review-1.0 · bản rà soát, chưa phải văn bản pháp lý cuối cùng</span>
        <span>Chưa có quyền giáo viên được cấp</span>
      </div>
      <div className="mcy-policy-links"><a href={PRIVACY_POLICY_WEB_URL} target="_blank" rel="noopener noreferrer">Chính sách quyền riêng tư (web)</a><a href={TERMS_WEB_URL} target="_blank" rel="noopener noreferrer">Điều khoản sử dụng (web)</a></div>
      <AccountRow title="Mở cài đặt chia sẻ" detail="Xem phạm vi và trạng thái kết nối" onClick={() => flow.push(routes.sharing)} />
    </>,
  );
  if (panel === "sharing") return screen("CHIA SẺ DỮ LIỆU", "Bạn luôn chọn người nhận và phạm vi.", "Chia sẻ với giáo viên hiện chưa được kết nối trong tài khoản này. Mặc định chia sẻ đang tắt.", <><div className="mcy-empty large"><PersonIcon /><strong>Chưa có lớp được kết nối</strong><p>Khi có lớp được cấp quyền, bạn sẽ thấy rõ tên người nhận, dữ liệu được chia sẻ và thời hạn trước khi bật.</p></div><div className="mcy-consent-card"><strong>Nguyên tắc chia sẻ</strong><p>Không chia sẻ mặc định. Check-in, ghi chú và phản hồi chỉ được gửi khi bạn chọn đúng người nhận và phạm vi.</p></div><AccountRow title="Quyền riêng tư" detail="Rút đồng ý và xem các mục đích khác" onClick={() => flow.push(routes.privacy)} /></>);
  if (panel === "security") return screen("BẢO MẬT", "Kiểm soát email và phiên đang mở.", "Xác minh lại email khi cần. Việc quản lý thiết bị và khôi phục danh tính luôn cần kiểm tra ở máy chủ.", <><div className="mcy-account-panel"><strong>Email đăng nhập</strong><p>{state.accountEmail || "Chưa đăng nhập"} · {state.signedIn ? "đã xác minh" : "chưa đăng nhập"}</p><button className="mcy-toggle" onClick={() => { update({ authMode: "login", authReturnTo: "security" }); flow.push(routes.authEmail); }}>Đổi email có xác minh</button></div>{state.signedIn && <div className="mcy-account-panel mcy-password-panel"><strong>Mật khẩu đăng nhập</strong><p>Tùy chọn. Đặt mật khẩu để đăng nhập bằng email và mật khẩu; bạn vẫn đăng nhập được bằng mã hoặc liên kết gửi qua email.</p><label className="mcy-form-field">Mật khẩu mới<KeyboardInput type="password" autoComplete="new-password" aria-label="Mật khẩu mới" value={newPassword} onChange={event => { setNewPassword(event.target.value); setPasswordMessage(null); }} onBlur={() => keyboard.hide()} /></label><label className="mcy-form-field">Nhập lại mật khẩu mới<KeyboardInput type="password" autoComplete="new-password" aria-label="Nhập lại mật khẩu mới" value={confirmPassword} onChange={event => { setConfirmPassword(event.target.value); setPasswordMessage(null); }} onBlur={() => keyboard.hide()} /></label>{passwordMessage && <div className={passwordMessage.tone === "ok" ? "mcy-inline-note" : "mcy-form-error"} role={passwordMessage.tone === "ok" ? "status" : "alert"}>{passwordMessage.text}</div>}<button className="mcy-toggle" disabled={passwordSaving} onClick={() => { void savePassword(); }}>{passwordSaving ? "Đang lưu…" : "Lưu mật khẩu"}</button></div>}<div className="mcy-account-row static"><span><strong>Thiết bị này</strong><small>{state.signedIn ? "Phiên hiện tại" : "Chưa có phiên đăng nhập"}</small></span><span className="mcy-state-pill">{state.signedIn ? "HIỆN TẠI" : "KHÁCH"}</span></div><p className="mcy-inline-note">Nếu mất quyền truy cập email hoặc nghi có người dùng tài khoản, hãy liên hệ kênh hỗ trợ của MCY. Không tự gộp hai tài khoản.</p>{error && <div className="mcy-form-error subtle" role="alert">{error}</div>}{deleteNotice && <div className="mcy-inline-note" role="status">{deleteNotice}</div>}{state.signedIn && <div className="mcy-account-panel mcy-danger-zone"><strong>Xóa tài khoản</strong><p>Xóa tài khoản này cùng hồ sơ, check-in, lựa chọn quyền riêng tư và dữ liệu liên quan trên máy chủ. Việc này không thể hoàn tác.</p><button className="mcy-toggle danger" onClick={() => { setError(""); setDeleteOpen(true); }}>Xóa tài khoản và dữ liệu</button></div>}<a className="mcy-quiet-link" href={ACCOUNT_DELETION_WEB_URL} target="_blank" rel="noopener noreferrer">Trang yêu cầu xóa tài khoản trên web</a><BottomSheet open={deleteOpen} onOpenChange={open => { if (!deleting) { setDeleteOpen(open); if (!open) setDeleteWord(""); } }} title="Xóa tài khoản?" description="Hồ sơ, check-in và lựa chọn quyền riêng tư của bạn sẽ bị xóa vĩnh viễn. Gõ XÓA để xác nhận." snap={0.6}><div className="mcy-sheet-actions"><label className="mcy-form-field">Gõ XÓA để xác nhận<KeyboardInput aria-label="Gõ XÓA để xác nhận" autoComplete="off" autoCapitalize="characters" value={deleteWord} onChange={event => setDeleteWord(event.target.value)} onBlur={() => keyboard.hide()} /></label>{error && <div className="mcy-form-error" role="alert">{error}</div>}<button className="mcy-action danger" disabled={!deleteConfirmed || deleting} onClick={() => { void deleteAccount(); }}>{deleting ? "Đang xóa…" : "Xóa vĩnh viễn"}</button><button className="mcy-quiet-link" disabled={deleting} onClick={() => { keyboard.hide(); setDeleteOpen(false); setDeleteWord(""); }}>Giữ tài khoản</button></div></BottomSheet></>);
  if (panel === "notifications") return screen("THÔNG BÁO", "Nhắc tập theo lịch của bạn.", "Backend chưa gửi push hoặc email nhắc. Lựa chọn thông báo của tài khoản được lưu để dùng khi dịch vụ được triển khai.", <><PrivacyToggle title="Nhắc tập trong ứng dụng" detail="Múi giờ lấy từ thiết bị · lịch gửi chưa được cấu hình." value={state.notificationEnabled} disabled={consentPending} onToggle={value => { void changeConsent("notifications", value, { notificationEnabled: value }); }} /><PrivacyToggle title="Email cập nhật nội dung" detail="Tùy chọn marketing; không ảnh hưởng email đăng nhập." value={state.emailUpdates} disabled={consentPending} onToggle={value => { void changeConsent("marketing", value, { marketingConsent: value, emailUpdates: value }); }} />{error && <div className="mcy-form-error subtle" role="alert">{error}</div>}<div className="mcy-account-panel"><strong>Giờ yên lặng</strong><p>Chưa có lịch nhắc nào được gửi hoặc lên lịch.</p></div></>);
  if (panel === "access") return screen("QUYỀN NỘI DUNG", "Những gì đang mở cho bạn.", "Khóa học miễn phí có thể học không cần giao dịch. Mục này cho biết nội dung trả phí hiện có trong ứng dụng.", <><div className="mcy-access-card"><span className="mcy-tag">HỌC MIỄN PHÍ</span><strong>Khóa học trong Khám phá</strong><p>Bạn có thể xem các bài học video ngay trong ứng dụng mà không cần mua quyền truy cập.</p></div><div className="mcy-empty large"><ReaderIcon /><strong>Chưa có khóa học trả phí</strong><p>Giao dịch, thời hạn học và quyền lợi đi kèm hiện chưa được cung cấp trong ứng dụng.</p></div><button className="mcy-quiet-link" onClick={() => flow.push(routes.discover)}>Mở Khám phá</button></>);
  if (panel === "help") return screen("HỖ TRỢ", "Tìm hướng dẫn rõ ràng.", "Chọn một chủ đề để xem hướng dẫn. Hiện chưa thể gửi yêu cầu tài khoản từ ứng dụng.", <><label className="mcy-form-field">Tìm hướng dẫn<KeyboardInput aria-label="Tìm hướng dẫn" value={query} onChange={event => setQuery(event.target.value)} onBlur={() => keyboard.hide()} placeholder="Ví dụ: phản hồi sau tập" /></label><div className="mcy-help-results">{filteredHelpArticles.length ? filteredHelpArticles.map(article => <AccountRow key={article.id} title={article.title} detail={article.detail} onClick={() => flow.push(helpRoutes[article.id])} />) : <p className="mcy-help-empty" role="status">Chưa tìm thấy hướng dẫn phù hợp. Thử một từ khác.</p>}</div><div className="mcy-account-panel"><strong>Chưa thể gửi yêu cầu trong ứng dụng</strong><p>Các mục bên dưới là hướng dẫn tham khảo; hiện chưa có nội dung nào được gửi tới đội ngũ hỗ trợ của MCY.</p></div>{error && <div className="mcy-form-error">{error}</div>}</>);
   return screen("YÊU CẦU VỀ DỮ LIỆU", "Yêu cầu về dữ liệu tài khoản.", "Chức năng gửi yêu cầu xuất hoặc xóa dữ liệu chưa sẵn sàng. Bạn có thể xem hướng dẫn quyền riêng tư hoặc liên hệ kênh chính thức của MCY.", <><div className="mcy-empty large"><InfoCircledIcon /><strong>Hiện chưa thể gửi yêu cầu trong ứng dụng</strong><p>Ứng dụng chưa tiếp nhận yêu cầu xuất hoặc xóa dữ liệu, nên chưa có thao tác nào được thực hiện.</p></div><AccountRow title="Quyền riêng tư" detail="Xem phạm vi lưu và chia sẻ" onClick={() => flow.push(routes.privacy)} /><AccountRow title="Hướng dẫn và hỗ trợ" detail="Đọc các hướng dẫn đang có" onClick={() => flow.push(routes.help)} /> </>);
}
