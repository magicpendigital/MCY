import { useEffect, useRef, useState } from "react";
import { getAccountBoundSupabaseClient } from "../backend/supabase";
import { contentReviewCandidates } from "../../supabase/functions/_shared/contentReviewCandidates";
import { reviewChecks, type ReviewChecklist } from "../../supabase/functions/_shared/contentReviewContract";
import { LessonReader } from "../practice/LessonReader";
import "./owner.css";

type Decision = "pending" | "approved" | "changes_requested" | "withdrawn";
type ReviewState = { revision: number; decision: Decision; qualification?: string; review_basis?: string; rights_basis?: string; checklist?: ReviewChecklist; reviewer_id?: string; updated_at?: string };
type Assignment = { reviewer_id: string; active: boolean; expires_at: string };
type Queue = { can_assign: boolean; items: { candidate_id: string; content_version: string; state: ReviewState; assignments: Assignment[] }[]; eligible_reviewers: { user_id: string; label: string }[] };
const labels: Record<typeof reviewChecks[number], string> = {
  contentAccuracy: "Đã kiểm nội dung và hình minh họa",
  audienceScope: "Đã xác định đối tượng và phạm vi phù hợp",
  stopGuidance: "Đã kiểm quyền dừng và hướng dẫn khi nội dung không phù hợp",
  accessibility: "Đã kiểm khả năng đọc, nghe và ngôn ngữ audio",
  rightsConfirmed: "Đã xác nhận quyền sử dụng text, hình và audio",
  expertiseConfirmed: "Tôi có chuyên môn phù hợp với phạm vi đang duyệt",
  vietnameseAudioReady: "Đã kiểm audio tiếng Việt và transcript cho buổi tập",
  actualDurationChecked: "Đã đo thời lượng thực hành của buổi tập",
};
const emptyChecks = () => Object.fromEntries(reviewChecks.map(k => [k, false])) as ReviewChecklist;
const decisions: Record<Decision, string> = { pending: "Chờ duyệt", approved: "Đã duyệt phiên bản này", changes_requested: "Cần chỉnh sửa", withdrawn: "Đã rút kết quả duyệt" };
class ReviewResponseError extends Error {}
export default function ContentReviewPanel({ userId }: { userId: string }) {
  const [queue, setQueue] = useState<Queue | null>(null);
  const [selected, setSelected] = useState(contentReviewCandidates[0].id);
  const [qualification, setQualification] = useState("");
  const [basis, setBasis] = useState("");
  const [rights, setRights] = useState("");
  const [checks, setChecks] = useState<ReviewChecklist>(emptyChecks);
  const [decision, setDecision] = useState<Exclude<Decision, "pending">>("changes_requested");
  const [teacher, setTeacher] = useState("");
  const [days, setDays] = useState(7);
  const [busy, setBusy] = useState(false);
  const [uncertain, setUncertain] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [reload, setReload] = useState(0);
  const pending = useRef(false);
  const generation = useRef(0);
  const account = useRef(userId); account.current = userId;
  const candidate = contentReviewCandidates.find(c => c.id === selected)!;
  const item = queue?.items.find(i => i.candidate_id === candidate.id && i.content_version === candidate.version);

  const operation = async (body: Record<string, unknown>) => {
    if (pending.current) return;
    pending.current = true; setBusy(true); setError("");
    const tick = ++generation.current, actor = userId;
    const valid = () => tick === generation.current && account.current === actor;
    let invoked = false;
    try {
      const client = await getAccountBoundSupabaseClient(actor);
      if (!valid()) return;
      invoked = true;
      const { data, error: failure } = await client.functions.invoke("owner-control-plane", { body });
      if (!valid()) return;
      if (failure) {
        const response = failure.context;
        let code = "";
        if (response instanceof Response) { try { code = (await response.clone().json()).error ?? ""; } catch {} }
        if (!valid()) return;
        if (code === "content_review_access_required" || code === "owner_access_required" || response instanceof Response && response.status === 401) {
          setQueue(null); setUncertain(true);
          throw new ReviewResponseError("Máy chủ chưa xác nhận quyền duyệt của tài khoản này. Tải lại để đối chiếu quyền hiện tại.");
        }
        if (code === "content_review_conflict") { setUncertain(true); throw new ReviewResponseError("Phiên bản duyệt đã thay đổi. Tải lại trước khi lưu tiếp."); }
        if (["invalid_review", "invalid_request", "invalid_assignment"].includes(code)) throw new ReviewResponseError("Phiếu chưa đủ thông tin hoặc tiêu chí để duyệt. Hãy kiểm lại lựa chọn.");
        if (code === "content_review_limit_reached") throw new ReviewResponseError("Đã đạt giới hạn 20 thao tác trong 24 giờ. Vẫn có thể rút kết quả duyệt hoặc thu hồi quyền.");
        if (body.action === "read_content_review") {
          setQueue(null);
          throw new ReviewResponseError("Chức năng duyệt nội dung chưa kết nối. Cần triển khai backend trước khi ghi kết quả.");
        }
        setUncertain(true);
        throw new ReviewResponseError("Chưa xác định thao tác đã được lưu hay chưa. Tải lại để đối chiếu; không tự gửi lại.");
      }
      if (body.action === "read_content_review") {
        if (!data || typeof data.can_assign !== "boolean" || !Array.isArray(data.items) || !Array.isArray(data.eligible_reviewers)) throw new Error("Chưa có phiếu duyệt hợp lệ từ máy chủ.");
        setQueue(data); setUncertain(false);
      } else {
        if (!data?.receipt || data.receipt.content_version !== candidate.version || data.receipt.candidate_id !== candidate.id || !Number.isInteger(data.receipt.revision)) { setUncertain(true); throw new Error("Chưa xác định kết quả đã được lưu hay chưa. Tải lại để đối chiếu."); }
        setNotice(data.receipt.unchanged === true ? "Phiếu không thay đổi. Không ghi thêm lịch sử cho thao tác lặp lại." : body.action === "save_content_review" ? "Đã ghi kết quả duyệt và lịch sử. Nội dung chưa được xuất bản hoặc mở cho AI." : "Đã cập nhật quyền cho đúng phiên bản. Phiếu trở về chờ duyệt; cần ghi kết quả mới.");
        setReload(v => v + 1);
      }
    } catch (cause) {
      if (valid()) {
        if (!(cause instanceof ReviewResponseError) && invoked && body.action !== "read_content_review") {
          setUncertain(true); setError("Chưa xác định thao tác đã được lưu hay chưa. Tải lại để đối chiếu; không tự gửi lại.");
        } else {
          if (body.action === "read_content_review") setQueue(null);
          setError(cause instanceof ReviewResponseError ? cause.message : "Chưa thể đối chiếu phiếu duyệt. Tải lại khi kết nối sẵn sàng.");
        }
      }
    }
    finally { if (valid()) { pending.current = false; setBusy(false); } }
  };
  useEffect(() => { void operation({ action: "read_content_review" }); return () => { generation.current++; pending.current = false; }; }, [userId, reload]);
  useEffect(() => {
    setQualification(item?.state.qualification ?? ""); setBasis(item?.state.review_basis ?? ""); setRights(item?.state.rights_basis ?? ""); setChecks(item?.state.checklist ?? emptyChecks()); setTeacher(""); setDecision("changes_requested");
  }, [item]);
  const common = { candidateId: candidate.id, contentVersion: candidate.version, expectedRevision: item?.state.revision ?? 0 };
  return <section className="owner-panel owner-content-review" aria-label="Duyệt nội dung">
    <div className="owner-panel-heading"><div><span className="owner-kicker">DUYỆT NỘI DUNG</span><h2>{queue && !queue.can_assign ? "Nội dung được giao cho bạn duyệt." : "Owner phụ trách duyệt ban đầu."}</h2><p>{queue && !queue.can_assign ? "Chỉ các phiên bản được Owner giao và còn thời hạn mới xuất hiện. " : "Quyền Owner cho phép ghi kết quả và chỉ định teacher. "}Chuyên môn và quyền media cần có căn cứ thật; hệ thống không tự chứng nhận từ vai trò tài khoản.</p></div><button type="button" disabled={busy} onClick={() => { if (window.confirm("Tải lại sẽ thay thông tin chưa lưu bằng phiếu trên máy chủ. Tiếp tục?")) { setNotice(""); setReload(v => v + 1); } }}>Tải lại phiếu duyệt</button></div>
    {busy && <p role="status">Đang đối chiếu phiếu duyệt…</p>}{error && <p className="owner-error" role="alert">{error}</p>}{notice && <p className="owner-success" role="status">{notice}</p>}
    {queue && <><label className="owner-field">Nội dung<select aria-label="Nội dung" disabled={busy} value={selected} onChange={e => setSelected(e.target.value)}>{contentReviewCandidates.filter(c => queue.items.some(i => i.candidate_id === c.id && i.content_version === c.version)).map(c => <option key={c.id} value={c.id}>{c.title}</option>)}</select></label>
      {item && <><p className="owner-review-state">{decisions[item.state.decision]} · revision {item.state.revision} · nội dung {candidate.version.slice(0, 12)}</p><p>Bản này là bài giới thiệu cách học, audio mẫu tiếng Anh. Duyệt bài giới thiệu chưa tạo thành một buổi thực hành yoga hay mở gợi ý AI.</p>
        <LessonReader sections={candidate.sections} active draft />
        <form onSubmit={e => { e.preventDefault(); if (!uncertain) void operation({ action: "save_content_review", ...common, decision, qualification, reviewBasis: basis, rightsBasis: rights, checklist: checks }); }}>
          <fieldset disabled={busy || uncertain}><legend>Phiếu duyệt đúng phiên bản</legend>
            <label className="owner-field">Chuyên môn và phạm vi của người duyệt<textarea required minLength={10} maxLength={1000} value={qualification} onChange={e => setQualification(e.target.value)} /></label>
            <label className="owner-field">Căn cứ và nhận xét chuyên môn<textarea required minLength={10} maxLength={2000} value={basis} onChange={e => setBasis(e.target.value)} /></label>
            <label className="owner-field">Căn cứ quyền sử dụng nội dung và media<textarea required minLength={10} maxLength={2000} value={rights} onChange={e => setRights(e.target.value)} /></label>
            <div className="owner-review-checks">{reviewChecks.map(k => <label key={k}><input type="checkbox" checked={checks[k]} onChange={e => setChecks({ ...checks, [k]: e.target.checked })}/><span>{labels[k]}{["vietnameseAudioReady", "actualDurationChecked"].includes(k) && <small> Bắt buộc khi duyệt buổi tập thực tế.</small>}</span></label>)}</div>
            <label className="owner-field">Kết quả<select aria-label="Kết quả" value={decision} onChange={e => setDecision(e.target.value as typeof decision)}><option value="changes_requested">Cần chỉnh sửa</option><option value="approved">Duyệt phiên bản này</option><option value="withdrawn">Rút kết quả duyệt</option></select></label>
            <button className="owner-primary" type="submit">Ghi kết quả duyệt</button>
          </fieldset>
        </form>
        {queue.can_assign && <section className="owner-review-assignment"><h3>Chỉ định teacher cho phiên bản này</h3><p>Chỉ hiển thị teacher đã được kích hoạt. Quyền có thời hạn, không cấp quyền xuất bản hoặc xem dữ liệu học viên. Thay đổi người được giao sẽ đưa phiếu về chờ duyệt.</p>
          {!queue.eligible_reviewers.length && <p>Chưa có teacher đủ điều kiện để chỉ định. Owner tiếp tục phụ trách duyệt.</p>}
          {queue.eligible_reviewers.length > 0 && <><label className="owner-field">Teacher<select aria-label="Teacher" value={teacher} disabled={busy || uncertain} onChange={e => setTeacher(e.target.value)}><option value="">Chọn teacher</option>{queue.eligible_reviewers.map(t => <option key={t.user_id} value={t.user_id}>{t.label}</option>)}</select></label><label className="owner-field">Thời hạn<select aria-label="Thời hạn" value={days} disabled={busy || uncertain} onChange={e => setDays(Number(e.target.value))}>{[1,7,14,30].map(d => <option key={d} value={d}>{d} ngày</option>)}</select></label><button type="button" disabled={!teacher || busy || uncertain} onClick={() => { void operation({ action: "assign_content_reviewer", ...common, reviewerId: teacher, active: true, expiresInDays: days }); }}>Chỉ định teacher</button></>}
          {item.assignments.filter(a => a.active).map(a => <div className="owner-review-assigned" key={a.reviewer_id}><span>{queue.eligible_reviewers.find(t => t.user_id === a.reviewer_id)?.label ?? "Teacher được chỉ định"} · hết hạn {new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "short" }).format(new Date(a.expires_at))}</span><button disabled={busy || uncertain} type="button" onClick={() => { void operation({ action: "assign_content_reviewer", ...common, reviewerId: a.reviewer_id, active: false, expiresInDays: 1 }); }}>Thu hồi quyền duyệt</button></div>)}
        </section>}
      </>}
    </>}
  </section>;
}
