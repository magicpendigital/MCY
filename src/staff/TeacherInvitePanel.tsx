import { useRef, useState, type FormEvent } from "react";
import { backendConfigured, getSupabaseClient } from "../backend/supabase";
import { newId } from "../compat";

/**
 * Owner-only teacher invitation. The server re-checks the Owner role, hashes the
 * address, caps invitations and audits every step; this box only collects the
 * address the Owner types. Nothing here is stored in the browser.
 */

type InviteResult = "sent" | "already_sent" | "existing_account" | "sent_existing_account" | "existing_staff_account";
const INVITE_RESULTS: readonly InviteResult[] = ["sent", "already_sent", "existing_account", "sent_existing_account", "existing_staff_account"];

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

function looksLikeEmail(value: string): boolean {
  return value.length <= 254 && /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(value);
}

async function failureCode(error: unknown): Promise<string> {
  const context = (error as { context?: unknown } | null)?.context;
  if (!(context instanceof Response)) return "teacher_service_unavailable";
  try {
    const body = await context.clone().json() as { error?: unknown };
    return typeof body.error === "string" ? body.error : "teacher_service_unavailable";
  } catch {
    return "teacher_service_unavailable";
  }
}

export function inviteFailureMessage(code: string): string {
  if (code === "teacher_invites_unavailable" || code === "teacher_workspace_unavailable") return "Máy chủ chưa mở chức năng mời giáo viên. Chưa có lời mời nào được gửi.";
  if (code === "owner_access_required" || code === "workspace_access_required") return "Tài khoản này chưa được cấp quyền Owner nên không thể mời giáo viên.";
  if (code === "invalid_invitation") return "Email chưa hợp lệ, hoặc là email của chính bạn. Hãy kiểm tra lại.";
  if (code === "invitation_in_progress") return "Lời mời cho email này đang được gửi. Hãy đợi một lát rồi tải lại trang để xem kết quả.";
  if (code === "invitation_delivery_unconfirmed") return "Chưa xác nhận được email mời đã đi hay chưa. Để tránh gửi trùng, hệ thống không tự gửi lại; hãy hỏi giảng viên có nhận được thư không.";
  if (code === "workspace_conflict") return "Mã lần mời này đã dùng cho một email khác. Hãy tải lại trang rồi mời lại.";
  if (code === "authentication_required") return "Phiên đăng nhập đã hết. Hãy đăng nhập lại rồi mời.";
  return "Chưa gửi được lời mời. Chưa có thay đổi nào được xác nhận; hãy thử lại sau.";
}

export function inviteSuccessMessage(result: InviteResult): string {
  if (result === "existing_staff_account") return "Email này là tài khoản quản trị (Owner hoặc nhân sự) nên hệ thống không tạo lời mời và không gửi thư. Hãy dùng một tài khoản học viên riêng để thử vai giảng viên.";
  if (result === "sent_existing_account") return "Email này đã có tài khoản Một chút yoga. Hệ thống đã gửi thư hướng dẫn vào trang giảng viên; lời mời có hiệu lực 72 giờ.";
  if (result === "existing_account") return "Email này đã có tài khoản Một chút yoga nên hệ thống không gửi thư. Lời mời đã được ghi nhận trong 72 giờ: hãy nhắn giảng viên mở trang dành cho giáo viên, bấm “Gửi liên kết xác minh” với chính email này, và đặt tên hiển thị trong Cá nhân nếu trang yêu cầu.";
  if (result === "already_sent") return "Lời mời cho email này đã được gửi trước đó và vẫn còn hiệu lực. Hệ thống không gửi thêm thư.";
  return "Đã gửi lời mời. Giảng viên có 72 giờ để mở thư, đặt tên hiển thị trong Cá nhân, rồi mở trang dành cho giáo viên.";
}

export default function TeacherInvitePanel() {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  // One idempotency key per address: a retry for the same address can never send a second email.
  const keys = useRef(new Map<string, string>());

  async function invite(event: FormEvent) {
    event.preventDefault();
    if (sending) return;
    const address = normalizeEmail(email);
    setNotice("");
    setError("");
    if (!looksLikeEmail(address)) {
      setError(inviteFailureMessage("invalid_invitation"));
      return;
    }
    if (!backendConfigured) {
      setError(inviteFailureMessage("teacher_invites_unavailable"));
      return;
    }
    let key = keys.current.get(address);
    if (!key) {
      key = newId();
      keys.current.set(address, key);
    }
    setSending(true);
    try {
      const client = await getSupabaseClient();
      if (!client) throw new Error("backend_unavailable");
      const { data, error: failure } = await client.functions.invoke("teacher-control-plane", {
        body: { action: "invite_teacher", email: address, idempotency_key: key },
      });
      if (failure) {
        setError(inviteFailureMessage(await failureCode(failure)));
        return;
      }
      const status = (data as { status?: unknown } | null)?.status;
      if (INVITE_RESULTS.includes(status as InviteResult)) {
        setNotice(inviteSuccessMessage(status as InviteResult));
        setEmail("");
        return;
      }
      setError(inviteFailureMessage("teacher_service_unavailable"));
    } catch {
      setError(inviteFailureMessage("teacher_service_unavailable"));
    } finally {
      setSending(false);
    }
  }

  return <section className="owner-panel owner-teacher-invite" aria-labelledby="owner-teacher-invite-title">
    <div className="owner-panel-heading"><div>
      <span className="owner-kicker">PILOT GIÁO VIÊN</span>
      <h2 id="owner-teacher-invite-title">Mời giáo viên</h2>
      <p>Giảng viên nhận quyền soạn bài video sau khi mở lời mời và đặt tên hiển thị. Bài của giảng viên chỉ đến học viên sau khi bạn duyệt và bật hiển thị. Giảng viên không xem được dữ liệu học viên. Không tải media lên MCY: bài dùng video trên kênh YouTube của chính giảng viên.</p>
    </div></div>
    <form className="owner-teacher-invite-form" onSubmit={event => { void invite(event); }}>
      <label className="owner-field">Email giảng viên
        <input type="email" inputMode="email" autoComplete="off" maxLength={254} required value={email} disabled={sending} onChange={event => setEmail(event.target.value)} />
        <small>Lời mời có hạn 72 giờ. Mỗi giờ mời tối đa 3 người. Email dùng để gửi thư mời và để đối chiếu khi giảng viên nhận lời mời; bảng lời mời chỉ lưu mã băm của email.</small>
      </label>
      <div className="owner-form-footer"><button className="owner-primary" type="submit" disabled={sending || !email.trim()}>{sending ? "Đang gửi…" : "Gửi lời mời"}</button></div>
    </form>
    {notice && <p className="owner-success" role="status">{notice}</p>}
    {error && <p className="owner-error" role="alert">{error}</p>}
  </section>;
}
