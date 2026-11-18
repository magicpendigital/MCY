import { useEffect, useState } from "react";
import { MobileScroll, useFlow } from "../../mobile";
import { backendConfigured, getSupabaseClient } from "../../backend/supabase";
import { rememberedPace } from "../../practice/feedbackMemory";
import { useDemo } from "../../app/state";
import { useRoutes } from "../../app/navigation";
import { DemoNote, Eyebrow } from "../../app/ui/controls";
import { AccountRow } from "../../app/ui/AccountRow";

export function ProfileScreen() {
  const flow = useFlow();
  const routes = useRoutes();
  const { state, setState, update } = useDemo();
  const [signingOut, setSigningOut] = useState(false);
  const [error, setError] = useState("");
  const feedback = rememberedPace(state.history, state.saveFeedbackConsent && state.rememberPace);
  // Owner/reviewer accounts get an extra entry when the server reports unpublished reading units for them.
  const [previewUnits, setPreviewUnits] = useState(0);
  const previewUserId = state.signedIn ? state.userId : null;
  useEffect(() => {
    setPreviewUnits(0);
    if (!backendConfigured || !previewUserId) return;
    let current = true;
    void import("../../library/readingPreviewApi").then(({ readPreviewList }) => readPreviewList(previewUserId)).then(result => {
      if (current) setPreviewUnits(result.status === "allowed" ? result.units.length : 0);
    }).catch(() => undefined);
    return () => { current = false; };
  }, [previewUserId]);
  // A learner enrolled in a teacher's class gets "Lớp của tôi" when the server confirms it; everyone else sees nothing new.
  const [classCount, setClassCount] = useState(0);
  useEffect(() => {
    setClassCount(0);
    if (!backendConfigured || !previewUserId) return;
    let current = true;
    void import("../../classes/classApi").then(({ readClassList }) => readClassList(previewUserId)).then(result => {
      if (current) setClassCount(result.status === "allowed" ? result.enrollments.length : 0);
    }).catch(() => undefined);
    return () => { current = false; };
  }, [previewUserId]);
  const signOut = async () => {
    if (!backendConfigured) return;
    setSigningOut(true);
    setError("");
    try {
      const client = await getSupabaseClient();
      if (!client) return;
      const { error: signOutError } = await client.auth.signOut({ scope: "local" });
      if (signOutError) setError(signOutError.message);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Chưa đăng xuất được. Hãy thử lại.");
    } finally {
      setSigningOut(false);
    }
  };
  return <MobileScroll className="mcy-scroll"><main className="mcy-page mcy-account-home">
    <Eyebrow>CÁ NHÂN · {state.signedIn ? "TÀI KHOẢN HỌC VIÊN" : "KHÁCH"}</Eyebrow><h1>{state.signedIn ? `Chào${state.displayName ? `, ${state.displayName}` : " bạn"}.` : "Bạn kiểm soát tài khoản và dữ liệu."}</h1>
    <p className="mcy-lead">{state.signedIn ? `${state.accountEmail} · Đã xác minh qua Supabase Auth.` : "Bạn có thể xem nội dung mà không cần tài khoản. Đăng nhập để lưu hồ sơ, lựa chọn quyền và check-in đã đồng ý."}</p>
    {!state.signedIn ? <div className="mcy-profile-card"><span className="mcy-tag">TÀI KHOẢN</span><strong>Lưu hành trình trên tài khoản của bạn</strong><p>Đăng nhập bằng email để đồng bộ hồ sơ, quyền dữ liệu và check-in có đồng ý.</p><button onClick={() => { update({ authMode: "create", authReturnTo: "profile" }); flow.push(routes.authEmail); }}>Tạo tài khoản hoặc đăng nhập</button></div> : <div className="mcy-profile-card"><span className="mcy-tag">TRẠNG THÁI</span><strong>Đang dùng tài khoản học viên</strong><p>Hồ sơ, quyền riêng tư và check-in được lưu theo lựa chọn của bạn.</p><button disabled={signingOut} onClick={() => { void signOut(); }}>{signingOut ? "Đang đăng xuất…" : "Đăng xuất thiết bị này"}</button></div>}
    {error && <div className="mcy-form-error" role="alert">{error}</div>}
    <div className="mcy-account-group"><span className="mcy-section-label">HỒ SƠ VÀ QUYỀN DỮ LIỆU</span>
      <AccountRow title="Thông tin cá nhân" detail={state.displayName || "Tên tùy chọn · ngôn ngữ · hình minh họa"} onClick={() => flow.push(routes.editProfile)} />
      <AccountRow title={state.aiCapability === "ready" ? "AI và điều được nhớ" : "Điều được nhớ"} detail={feedback ? "Có phản hồi để xem nguồn và cách rút lại" : "Chưa có thông tin được nhớ"} onClick={() => flow.push(routes.memory)} />
      <AccountRow title="Quyền riêng tư và đồng ý" detail="Mỗi mục đích, phiên bản và cách thay đổi" onClick={() => flow.push(routes.privacy)} />
      <AccountRow title="Bảo mật tài khoản" detail="Email, phiên đăng nhập và xác minh lại" onClick={() => flow.push(routes.security)} />
      <AccountRow title="Nhắc tập và thông báo" detail="Tùy chọn kênh, giờ và múi giờ" onClick={() => flow.push(routes.notifications)} />
      <AccountRow title="Nội dung và quyền đang có" detail="Khóa học miễn phí · quyền trả phí" onClick={() => flow.push(routes.access)} />
      <AccountRow title="Chia sẻ với giáo viên" detail="Chưa có lớp được kết nối · mặc định tắt" onClick={() => flow.push(routes.sharing)} />
    </div>
    {classCount > 0 && <div className="mcy-account-group"><span className="mcy-section-label">LỚP VÀ NHẬN XÉT</span>
      <AccountRow title="Lớp của tôi" detail={`${classCount} lớp · nhận xét giảng viên đã gửi cho bạn`} onClick={() => flow.push(routes.myClasses)} />
    </div>}
    {previewUnits > 0 && <div className="mcy-account-group"><span className="mcy-section-label">DÀNH CHO BIÊN TẬP</span>
      <AccountRow title="Xem trước nội dung" detail={`${previewUnits} bài đọc có hình · chỉ Owner hoặc người được giao thấy`} onClick={() => flow.push(routes.readingPreview)} />
      <AccountRow title="Hiển thị cho học viên" detail="Bật hoặc tắt từng bài đã duyệt · mặc định tắt" onClick={() => flow.push(routes.readingPublish)} />
    </div>}
    <div className="mcy-account-group"><span className="mcy-section-label">TRỢ GIÚP VÀ YÊU CẦU</span>
      <AccountRow title="Hướng dẫn và liên hệ" detail="Đọc hướng dẫn; chưa gửi được yêu cầu trong ứng dụng" onClick={() => flow.push(routes.help)} />
      <AccountRow title="Xuất hoặc xóa dữ liệu" detail="Ứng dụng chưa tiếp nhận yêu cầu xuất hoặc xóa" onClick={() => flow.push(routes.help)} />
    </div>
    <DemoNote>Hồ sơ, lựa chọn quyền và check-in được lưu theo trạng thái tài khoản. Nếu một tính năng chưa có kết nối, ứng dụng sẽ nói rõ trước khi bạn gửi dữ liệu.</DemoNote>
  </main></MobileScroll>;
}
