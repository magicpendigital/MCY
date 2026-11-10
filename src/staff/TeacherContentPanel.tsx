import { useCallback, useEffect, useRef, useState } from "react";
import { getAccountBoundSupabaseClient } from "../backend/supabase";
import { validPayload } from "../../supabase/functions/_shared/contentWorkspaceContract";
import { AreaPicker } from "./AreaPicker";
import { lessonAreas } from "../courses/lessonFinder";
import "./owner.css";

// A teacher's own video lessons (phase 3): write, save a new version, send it to the Owner, read the Owner's notes. The teacher
// sees and edits only their own lessons; the Owner decides whether and where anything shows in the app. The name shown with a
// lesson comes from the activated teacher profile, never from what is typed here.
type Row = { item_id: string; kind: string; author_label: string | null; seq: number; title: string; status: "draft" | "submitted"; review: { decision: "pending" | "approved" | "changes_requested" | "withdrawn"; revision: number } };
type Version = { item_id: string; seq: number; latest_seq: number; title: string; payload: Record<string, unknown>; status: "draft" | "submitted"; review: { decision: string } };
type Note = { seq: number; note: string; at: string };
type Form = { id: string | null; seq: number; title: string; youtubeId: string; summary: string; duration: string; orientation: "portrait" | "landscape"; tags: string; areas: string[] };
const blank: Form = { id: null, seq: 0, title: "", youtubeId: "", summary: "", duration: "", orientation: "portrait", tags: "", areas: [] };
const errorText: Record<string, string> = {
  content_conflict: "Nội dung vừa thay đổi ở nơi khác. Tải lại trước khi lưu tiếp.",
  content_limit_reached: "Đã đạt giới hạn thao tác trong 24 giờ. Thử lại sau.",
  content_access_required: "Tài khoản này chưa có quyền với nội dung này. Cần hồ sơ giảng viên đã được kích hoạt.",
  content_kind_not_allowed: "Giảng viên chỉ soạn bài video.",
  invalid_content: "Nội dung chưa hợp lệ. Hãy kiểm lại các trường.",
  content_item_not_found: "Không tìm thấy bài này.",
};
const statusLabel = (r: Pick<Row, "status" | "review">) => r.status === "draft" ? "Nháp, chưa gửi" : r.review.decision === "approved" ? "Đã được Owner duyệt" : r.review.decision === "changes_requested" ? "Cần chỉnh sửa" : r.review.decision === "withdrawn" ? "Kết quả duyệt đã rút" : "Đã gửi, chờ Owner duyệt";

export default function TeacherContentPanel({ userId }: { userId: string }) {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [version, setVersion] = useState<Version | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [form, setForm] = useState<Form | null>(null);
  const [busy, setBusy] = useState(false);
  const [stale, setStale] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const pending = useRef(false);
  const generation = useRef(0);
  const account = useRef(userId); account.current = userId;

  const call = useCallback(async (body: Record<string, unknown>, write: boolean) => {
    if (pending.current) return null;
    pending.current = true; setBusy(true); setError("");
    const tick = ++generation.current, actor = userId;
    const valid = () => tick === generation.current && account.current === actor;
    try {
      const client = await getAccountBoundSupabaseClient(actor);
      if (!valid()) return null;
      const { data, error: failure } = await client.functions.invoke("owner-control-plane", { body });
      if (!valid()) return null;
      if (failure) {
        let code = "";
        const response = (failure as { context?: unknown }).context;
        if (response instanceof Response) { try { code = (await response.clone().json()).error ?? ""; } catch { /* unknown */ } }
        if (!valid()) return null;
        if (errorText[code]) { setError(errorText[code]); if (code === "content_conflict") setStale(true); return null; }
        if (write) setStale(true);
        setError(write ? "Chưa xác định thao tác đã được lưu hay chưa. Tải lại để đối chiếu; không tự gửi lại." : "Chưa đọc được dữ liệu từ máy chủ. Thử tải lại.");
        return null;
      }
      return (data ?? {}) as Record<string, unknown>;
    } catch {
      if (valid()) { if (write) setStale(true); setError("Chưa kết nối được máy chủ."); }
      return null;
    } finally { if (valid()) { pending.current = false; setBusy(false); } }
  }, [userId]);

  const loadList = useCallback(async () => {
    const data = await call({ action: "list_content" }, false);
    if (data && Array.isArray(data.items)) { setRows((data.items as Row[]).filter(r => r.kind === "video_lesson")); setStale(false); }
  }, [call]);
  useEffect(() => { void loadList(); return () => { generation.current++; pending.current = false; }; }, [userId, loadList]);

  const open = async (itemId: string, keepNotice = false) => {
    if (!keepNotice) setNotice("");
    setForm(null);
    const data = await call({ action: "read_content", itemId }, false);
    if (data && data.version) setVersion(data.version as Version);
    const n = await call({ action: "read_author_notes", itemId }, false);
    setNotes(n && Array.isArray(n.notes) ? n.notes as Note[] : []);
  };
  const edit = (v: Version) => {
    const p = v.payload;
    setForm({ id: v.item_id, seq: v.latest_seq, title: v.title, youtubeId: String(p.youtubeId ?? ""), summary: String(p.summary ?? ""), duration: String(p.durationLabel ?? ""), orientation: p.orientation === "landscape" ? "landscape" : "portrait", tags: Array.isArray(p.tags) ? (p.tags as string[]).join(", ") : "", areas: Array.isArray(p.areas) ? (p.areas as string[]) : lessonAreas({ title: v.title }, "gentle") });
  };
  const save = async (andSubmit: boolean) => {
    if (!form || stale) return;
    const tags = form.tags.split(",").map(t => t.trim()).filter(Boolean);
    const payload = { youtubeId: form.youtubeId.trim(), summary: form.summary.trim(), durationLabel: form.duration.trim(), orientation: form.orientation, areas: form.areas, ...(tags.length ? { tags } : {}) };
    if (!form.title.trim() || !validPayload("video_lesson", payload)) { setError(errorText.invalid_content); return; }
    const saved = await call({ action: "save_content", itemId: form.id, kind: "video_lesson", title: form.title.trim(), payload, expectedSeq: form.seq }, true);
    const receipt = saved?.receipt as { item_id?: string; seq?: number } | undefined;
    if (!saved || !receipt || typeof receipt.item_id !== "string" || !Number.isInteger(receipt.seq)) return;
    let message = "Đã lưu phiên bản mới (nháp). Owner chưa thấy cho tới khi bạn gửi.";
    if (andSubmit) {
      const sent = await call({ action: "submit_content", itemId: receipt.item_id, expectedSeq: receipt.seq }, true);
      if (!sent?.receipt) { setForm({ ...form, id: receipt.item_id, seq: receipt.seq as number }); setNotice(message); await loadList(); return; }
      message = "Đã lưu và gửi cho Owner duyệt.";
    }
    setForm(null); setNotice(message); await loadList(); await open(receipt.item_id, true);
  };
  const submitOnly = async () => {
    if (!version) return;
    const sent = await call({ action: "submit_content", itemId: version.item_id, expectedSeq: version.latest_seq }, true);
    if (sent?.receipt) { setNotice("Đã gửi cho Owner duyệt."); await loadList(); await open(version.item_id, true); }
  };
  const set = (patch: Partial<Form>) => setForm(f => f ? { ...f, ...patch } : f);
  const label = rows?.find(r => r.author_label)?.author_label ?? null;

  return <section className="owner-panel owner-teacher-content" aria-label="Bài video của tôi">
    <div className="owner-panel-heading"><div><span className="owner-kicker">GIẢNG VIÊN</span><h2>Bài video của tôi</h2>
      <p>Bạn soạn và gửi bài cho Owner duyệt. Owner quyết định bài có hiện trong ứng dụng hay không. Bạn chỉ thấy bài của chính mình.</p></div>
      <button type="button" className="owner-primary" disabled={busy} onClick={() => { setVersion(null); setForm({ ...blank }); setNotice(""); }}>Soạn bài mới</button></div>
    <p className="owner-hub-note" data-testid="author-label">{label ? `Tên hiển thị với học viên: ${label} (lấy từ hồ sơ giảng viên đã kích hoạt của bạn).` : "Chưa có tên hiển thị: tên chỉ hiện khi hồ sơ giảng viên của bạn đã được kích hoạt."}</p>
    {busy && <p role="status">Đang đối chiếu với máy chủ…</p>}
    {error && <p className="owner-error" role="alert">{error}</p>}
    {notice && <p className="owner-success" role="status">{notice}</p>}
    {stale && <p className="owner-inline-warning" role="alert">Cần tải lại trước khi lưu tiếp. <button type="button" onClick={() => { setError(""); void (async () => { await loadList(); if (version) await open(version.item_id); })(); }}>Tải lại</button></p>}

    {rows && rows.length === 0 && !form && <p className="owner-hub-note">Bạn chưa có bài nào. Bấm “Soạn bài mới” để bắt đầu.</p>}
    {rows && rows.length > 0 && <ul className="owner-hub-list" aria-label="Bài của tôi">{rows.map(r => <li key={r.item_id}>
      <button type="button" aria-pressed={version?.item_id === r.item_id} disabled={busy} onClick={() => void open(r.item_id)}><strong>{r.title}</strong><span>{statusLabel(r)} · phiên bản {r.seq}</span></button></li>)}</ul>}

    {form && <form className="owner-hub-compose" aria-label="Soạn bài video" onSubmit={e => { e.preventDefault(); void save(false); }}>
      <fieldset disabled={busy || stale}><legend>{form.id ? "Sửa bài (tạo phiên bản mới)" : "Bài video mới"}</legend>
        <label className="owner-field">Tiêu đề<input required maxLength={200} value={form.title} onChange={e => set({ title: e.target.value })} /></label>
        <label className="owner-field">Mã video YouTube (11 ký tự)<input required value={form.youtubeId} onChange={e => set({ youtubeId: e.target.value })} /></label>
        <label className="owner-field">Bạn sẽ làm gì trong bài này (mô tả)<textarea required maxLength={1000} value={form.summary} onChange={e => set({ summary: e.target.value })} /></label>
        <label className="owner-field">Thời lượng (m:ss)<input required value={form.duration} placeholder="0:43" onChange={e => set({ duration: e.target.value })} /></label>
        <label className="owner-field">Khung hình<select value={form.orientation} onChange={e => set({ orientation: e.target.value as Form["orientation"] })}><option value="portrait">Dọc</option><option value="landscape">Ngang</option></select></label>
        <label className="owner-field">Thẻ (cách nhau bằng dấu phẩy)<input value={form.tags} onChange={e => set({ tags: e.target.value })} /></label>
        <AreaPicker value={form.areas} onChange={areas => set({ areas })} />
        <div className="owner-form-footer"><span>Mỗi lần lưu tạo một phiên bản mới; phiên bản cũ giữ nguyên.</span>
          <button type="submit" className="owner-primary">Lưu nháp</button> <button type="button" className="owner-primary" onClick={() => void save(true)}>Lưu và gửi duyệt</button> <button type="button" onClick={() => setForm(null)}>Đóng</button></div>
      </fieldset></form>}

    {version && !form && <article className="owner-hub-detail" aria-label={`Bài · ${version.title}`}>
      <div className="owner-hub-detail-head"><div><h3>{version.title}</h3><p>Phiên bản {version.seq}/{version.latest_seq} · {statusLabel({ status: version.status, review: version.review as Row["review"] })}</p></div>
        {version.seq === version.latest_seq && <button type="button" disabled={busy} onClick={() => edit(version)}>Sửa (phiên bản mới)</button>}
        {version.status === "draft" && version.seq === version.latest_seq && <button type="button" className="owner-primary" disabled={busy || stale} onClick={() => void submitOnly()}>Gửi duyệt</button>}</div>
      <p>{String(version.payload.summary ?? "")}</p>
      <p className="owner-hub-note">{String(version.payload.durationLabel ?? "")} · YouTube {String(version.payload.youtubeId ?? "")}</p>
      <section aria-label="Ghi chú của Owner"><h4>Ghi chú của Owner</h4>
        {notes.length === 0 ? <p className="owner-hub-note">Owner chưa có ghi chú cho bài này.</p> : <ul>{notes.map((n, i) => <li key={i}><strong>Phiên bản {n.seq}:</strong> {n.note}</li>)}</ul>}</section>
    </article>}
  </section>;
}
