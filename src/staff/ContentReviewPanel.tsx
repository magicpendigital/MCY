import { useEffect, useMemo, useRef, useState } from "react";
import { getAccountBoundSupabaseClient } from "../backend/supabase";
import { contentReviewCandidates } from "../../supabase/functions/_shared/contentReviewCandidates";
import { reviewChecks, type ReviewChecklist } from "../../supabase/functions/_shared/contentReviewContract";
import { LessonReader } from "../practice/LessonReader";
import { ReadingUnitPreview } from "./ReadingUnitPreview";
import type { ReadingUnitCandidate } from "../../supabase/functions/_shared/readingUnitCandidates";
import "./owner.css";

type Decision = "pending" | "approved" | "changes_requested" | "withdrawn";
type ReviewState = { revision: number; decision: Decision; qualification?: string; review_basis?: string; rights_basis?: string; checklist?: ReviewChecklist; reviewer_id?: string; updated_at?: string };
type Assignment = { reviewer_id: string; active: boolean; expires_at: string };
type Queue = { can_assign: boolean; items: { candidate_id: string; content_version: string; state: ReviewState; assignments: Assignment[] }[]; eligible_reviewers: { user_id: string; label: string }[]; candidates?: unknown[] };
const isReadingCandidate = (value: unknown): value is ReadingUnitCandidate => Boolean(value && typeof value === "object" && (value as { scope?: unknown }).scope === "learning_reading" && typeof (value as { id?: unknown }).id === "string" && typeof (value as { version?: unknown }).version === "string" && (value as { unit?: { steps?: unknown } }).unit && Array.isArray((value as { unit: { steps?: unknown } }).unit.steps));
const pendingStates = (decision: Decision) => decision !== "approved";
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
  const [bulkConfirm, setBulkConfirm] = useState(false);
  const pending = useRef(false);
  const generation = useRef(0);
  const account = useRef(userId); account.current = userId;
  const readingCandidates = useMemo(() => (queue?.candidates ?? []).filter(isReadingCandidate), [queue]);
  const allCandidates = useMemo(() => [...contentReviewCandidates, ...readingCandidates], [readingCandidates]);
  const candidate = allCandidates.find(c => c.id === selected) ?? contentReviewCandidates[0];
  const reading = candidate.scope === "learning_reading" ? candidate as ReadingUnitCandidate : null;
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
  // Owner approves every pending reading unit with the single declaration entered in the form.
  // One audited save per unit; stops at the first unconfirmed outcome and never retries by itself.
  const bulkTargets = queue ? queue.items.filter(i => readingCandidates.some(c => c.id === i.candidate_id && c.version === i.content_version) && pendingStates(i.state.decision)) : [];
  const exempt = ["vietnameseAudioReady", "actualDurationChecked"];
  const bulkReady = qualification.trim().length >= 10 && basis.trim().length >= 10 && rights.trim().length >= 10 && reviewChecks.every(k => checks[k] || exempt.includes(k));
  const bulkApprove = async () => {
    if (pending.current || !queue || !bulkReady || !bulkTargets.length) return;
    pending.current = true; setBusy(true); setError(""); setNotice(""); setBulkConfirm(false);
    const tick = ++generation.current, actor = userId;
    const valid = () => tick === generation.current && account.current === actor;
    let done = 0, current = "";
    try {
      const client = await getAccountBoundSupabaseClient(actor);
      for (const target of bulkTargets) {
        if (!valid()) return;
        current = readingCandidates.find(c => c.id === target.candidate_id)?.title ?? target.candidate_id;
        const { data, error: failure } = await client.functions.invoke("owner-control-plane", { body: { action: "save_content_review", candidateId: target.candidate_id, contentVersion: target.content_version, expectedRevision: target.state.revision, decision: "approved", qualification, reviewBasis: basis, rightsBasis: rights, checklist: checks } });
        if (failure || !data?.receipt || data.receipt.candidate_id !== target.candidate_id || data.receipt.content_version !== target.content_version) throw new Error("unconfirmed");
        done += 1;
      }
      if (valid()) { setNotice(`Đã ghi kết quả duyệt cho ${done} bài đọc bằng tài khoản của bạn. Nội dung chưa được xuất bản hoặc mở cho AI.`); setReload(v => v + 1); }
    } catch {
      if (valid()) { setUncertain(true); setError(`Đã ghi ${done}/${bulkTargets.length} bài. Chưa xác định bài “${current}” đã được lưu hay chưa. Tải lại để đối chiếu; không tự gửi lại.`); }
    } finally {
      if (valid()) { pending.current = false; setBusy(false); }
    }
  };
  useEffect(() => { void operation({ action: "read_content_review" }); return () => { generation.current++; pending.current = false; }; }, [userId, reload]);
  useEffect(() => {
    setQualification(item?.state.qualification ?? ""); setBasis(item?.state.review_basis ?? ""); setRights(item?.state.rights_basis ?? ""); setChecks(item?.state.checklist ?? emptyChecks()); setTeacher(""); setDecision("changes_requested");
  }, [item]);
  const common = { candidateId: candidate.id, contentVersion: candidate.version, expectedRevision: item?.state.revision ?? 0 };
  return <section className="owner-panel owner-content-review" aria-label="Duyệt nội dung">
    <div className="owner-panel-heading"><div><span className="owner-kicker">DUYỆT NỘI DUNG</span><h2>{queue && !queue.can_assign ? "Nội dung được giao cho bạn duyệt." : "Owner phụ trách duyệt ban đầu."}</h2><p>{queue && !queue.can_assign ? "Chỉ các phiên bản được Owner giao và còn thời hạn mới xuất hiện. " : "Quyền Owner cho phép ghi kết quả và chỉ định teacher. "}Chuyên môn và quyền media cần có căn cứ thật; hệ thống không tự chứng nhận từ vai trò tài khoản.</p></div><button type="button" disabled={busy} onClick={() => { if (window.confirm("Tải lại sẽ thay thông tin chưa lưu bằng phiếu trên máy chủ. Tiếp tục?")) { setNotice(""); setReload(v => v + 1); } }}>Tải lại phiếu duyệt</button></div>
    {busy && <p role="status">Đang đối chiếu phiếu duyệt…</p>}{error && <p className="owner-error" role="alert">{error}</p>}{notice && <p className="owner-success" role="status">{notice}</p>}
    {queue && <><label className="owner-field">Nội dung<select aria-label="Nội dung" disabled={busy} value={selected} onChange={e => setSelected(e.target.value)}>{allCandidates.filter(c => queue.items.some(i => i.candidate_id === c.id && i.content_version === c.version)).map(c => <option key={c.id} value={c.id}>{c.scope === "learning_reading" ? `Preview · ${c.title}` : c.title}</option>)}</select></label>
      {item && <><p className="owner-review-state">{decisions[item.state.decision]} · revision {item.state.revision} · nội dung {candidate.version.slice(0, 12)}</p>{reading ? <p>Bài đọc chưa duyệt (Preview): chỉ Owner hoặc người được giao thấy. Duyệt chỉ ghi kết quả — bài chưa hiển thị cho học viên, chưa là buổi thực hành và không dành cho AI.</p> : <p>Bản này là bài giới thiệu cách học, audio mẫu tiếng Anh. Duyệt bài giới thiệu chưa tạo thành một buổi thực hành yoga hay mở gợi ý AI.</p>}
        {reading ? <ReadingUnitPreview unit={reading.unit} /> : <LessonReader sections={(candidate as typeof contentReviewCandidates[number]).sections} active draft />}
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
        {readingCandidates.length > 0 && <section className="owner-review-bulk" aria-label="Duyệt hàng loạt bài đọc">
          <h3>Duyệt hàng loạt bài đọc Preview</h3>
          <p>{bulkTargets.length ? `${bulkTargets.length} / ${readingCandidates.length} bài đọc đang chờ duyệt.` : "Tất cả bài đọc đã có kết quả duyệt."} Dùng đúng khai báo chuyên môn, căn cứ, quyền sử dụng và các ô đã chọn ở phiếu phía trên; mỗi bài ghi một kết quả riêng dưới tài khoản của bạn.</p>
          {!bulkReady && bulkTargets.length > 0 && <p><small>Cần điền đủ ba mục khai báo và chọn mọi tiêu chí (trừ audio và thời lượng thực hành, chỉ áp dụng cho buổi tập).</small></p>}
          {!bulkConfirm ? <button type="button" className="owner-primary" disabled={busy || uncertain || !bulkReady || !bulkTargets.length} onClick={() => setBulkConfirm(true)}>Duyệt tất cả bài đọc đang chờ ({bulkTargets.length})</button>
            : <div role="alertdialog" aria-label="Xác nhận duyệt hàng loạt"><p><strong>Bạn xác nhận duyệt {bulkTargets.length} bài đọc bằng khai báo ở trên?</strong> Đây là quyết định của bạn với tư cách người chịu trách nhiệm; bài vẫn chưa hiển thị cho học viên.</p><button type="button" className="owner-primary" disabled={busy} onClick={() => { void bulkApprove(); }}>Xác nhận duyệt {bulkTargets.length} bài</button> <button type="button" disabled={busy} onClick={() => setBulkConfirm(false)}>Chưa duyệt</button></div>}
        </section>}
        {queue.can_assign && <section className="owner-review-assignment"><h3>Chỉ định teacher cho phiên bản này</h3><p>Chỉ hiển thị teacher đã được kích hoạt. Quyền có thời hạn, không cấp quyền xuất bản hoặc xem dữ liệu học viên. Thay đổi người được giao sẽ đưa phiếu về chờ duyệt.</p>
          {!queue.eligible_reviewers.length && <p>Chưa có teacher đủ điều kiện để chỉ định. Owner tiếp tục phụ trách duyệt.</p>}
          {queue.eligible_reviewers.length > 0 && <><label className="owner-field">Teacher<select aria-label="Teacher" value={teacher} disabled={busy || uncertain} onChange={e => setTeacher(e.target.value)}><option value="">Chọn teacher</option>{queue.eligible_reviewers.map(t => <option key={t.user_id} value={t.user_id}>{t.label}</option>)}</select></label><label className="owner-field">Thời hạn<select aria-label="Thời hạn" value={days} disabled={busy || uncertain} onChange={e => setDays(Number(e.target.value))}>{[1,7,14,30].map(d => <option key={d} value={d}>{d} ngày</option>)}</select></label><button type="button" disabled={!teacher || busy || uncertain} onClick={() => { void operation({ action: "assign_content_reviewer", ...common, reviewerId: teacher, active: true, expiresInDays: days }); }}>Chỉ định teacher</button></>}
          {item.assignments.filter(a => a.active).map(a => <div className="owner-review-assigned" key={a.reviewer_id}><span>{queue.eligible_reviewers.find(t => t.user_id === a.reviewer_id)?.label ?? "Teacher được chỉ định"} · hết hạn {new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "short" }).format(new Date(a.expires_at))}</span><button disabled={busy || uncertain} type="button" onClick={() => { void operation({ action: "assign_content_reviewer", ...common, reviewerId: a.reviewer_id, active: false, expiresInDays: 1 }); }}>Thu hồi quyền duyệt</button></div>)}
        </section>}
      </>}
    </>}
  </section>;
}
