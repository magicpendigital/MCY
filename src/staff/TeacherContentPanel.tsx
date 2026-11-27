import { useCallback, useEffect, useRef, useState } from "react";
import { getAccountBoundSupabaseClient } from "../backend/supabase";
import { validPayload } from "../../supabase/functions/_shared/contentWorkspaceContract";
import { AreaPicker } from "./AreaPicker";
import { lessonAreas } from "../courses/lessonFinder";
import { youtubeIdFrom } from "./youtubeInput";
import "./owner.css";

// A teacher's own video lessons (phase 3): write, save a new version, send it to the Owner, read the Owner's notes. The teacher
// sees and edits only their own lessons; the Owner decides whether and where anything shows in the app. The name shown with a
// lesson comes from the activated teacher profile, never from what is typed here.
type Row = { item_id: string; kind: string; author_label: string | null; seq: number; title: string; status: "draft" | "submitted"; review: { decision: "pending" | "approved" | "changes_requested" | "withdrawn"; revision: number } };
type Version = { item_id: string; kind?: string; seq: number; latest_seq: number; title: string; payload: Record<string, unknown>; status: "draft" | "submitted"; review: { decision: string } };
type Note = { seq: number; note: string; at: string };
type Form = { id: string | null; seq: number; title: string; youtubeId: string; summary: string; duration: string; orientation: "portrait" | "landscape"; tags: string; areas: string[] };
const blank: Form = { id: null, seq: 0, title: "", youtubeId: "", summary: "", duration: "", orientation: "portrait", tags: "", areas: [] };
// A free course (S1): the teacher's own video lessons in order. The server accepts only the teacher's own lessons and no
// benefit/caution guidance (that is MCY-reviewed wording); the Owner reviews and switches the course on like a lesson.
type CourseForm = { id: string | null; seq: number; title: string; summary: string; lessonIds: string[] };
const blankCourse: CourseForm = { id: null, seq: 0, title: "", summary: "", lessonIds: [] };
const ids = (v: unknown): string[] => Array.isArray(v) ? v.filter((s): s is string => typeof s === "string") : [];
const errorText: Record<string, string> = {
  content_conflict: "Nội dung vừa thay đổi ở nơi khác. Tải lại trước khi lưu tiếp.",
  content_limit_reached: "Đã đạt giới hạn thao tác trong 24 giờ. Thử lại sau.",
  content_access_required: "Tài khoản này chưa có quyền với nội dung này. Cần hồ sơ giảng viên đã được kích hoạt.",
  content_kind_not_allowed: "Máy chủ chưa nhận loại nội dung này từ giảng viên (khóa học cần bản cập nhật máy chủ). Nội dung chưa được lưu.",
  invalid_content: "Nội dung chưa hợp lệ. Hãy kiểm lại các trường.",
  course_input: "Khóa cần tên, mô tả và ít nhất một bài video của bạn.",
  content_item_not_found: "Không tìm thấy bài này.",
  youtube_input: "Chưa nhận ra video YouTube. Dán link của video (ví dụ youtube.com/watch?v=… hoặc youtu.be/…) hoặc mã 11 ký tự.",
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
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [course, setCourse] = useState<CourseForm | null>(null);
  const pending = useRef(false);
  const generation = useRef(0);
  const account = useRef(userId); account.current = userId;
  const kindOf = (v: Version) => v.kind ?? rows?.find(r => r.item_id === v.item_id)?.kind ?? "video_lesson";

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
    if (data && Array.isArray(data.items)) { setRows((data.items as Row[]).filter(r => r.kind === "video_lesson" || r.kind === "course_group")); setStale(false); }
  }, [call]);
  useEffect(() => { void loadList(); return () => { generation.current++; pending.current = false; }; }, [userId, loadList]);

  const open = async (itemId: string, keepNotice = false) => {
    if (!keepNotice) setNotice("");
    setForm(null); setCourse(null);
    const data = await call({ action: "read_content", itemId }, false);
    if (data && data.version) setVersion(data.version as Version);
    const n = await call({ action: "read_author_notes", itemId }, false);
    setNotes(n && Array.isArray(n.notes) ? n.notes as Note[] : []);
  };
  const edit = (v: Version) => {
    const p = v.payload;
    if (kindOf(v) === "course_group") { setCourse({ id: v.item_id, seq: v.latest_seq, title: v.title, summary: String(p.summary ?? ""), lessonIds: ids(p.lessonIds) }); return; }
    setForm({ id: v.item_id, seq: v.latest_seq, title: v.title, youtubeId: String(p.youtubeId ?? ""), summary: String(p.summary ?? ""), duration: String(p.durationLabel ?? ""), orientation: p.orientation === "landscape" ? "landscape" : "portrait", tags: Array.isArray(p.tags) ? (p.tags as string[]).join(", ") : "", areas: Array.isArray(p.areas) ? (p.areas as string[]) : lessonAreas({ title: v.title }, "gentle") });
  };
  const save = async (andSubmit: boolean) => {
    if (!form || stale) return;
    const videoId = youtubeIdFrom(form.youtubeId);
    if (!videoId) { setError(errorText.youtube_input); return; }
    const tags = form.tags.split(",").map(t => t.trim()).filter(Boolean);
    const payload = { youtubeId: videoId, summary: form.summary.trim(), durationLabel: form.duration.trim(), orientation: form.orientation, areas: form.areas, ...(tags.length ? { tags } : {}) };
    if (!form.title.trim() || !validPayload("video_lesson", payload)) { setError(errorText.invalid_content); return; }
    await commit("video_lesson", form.id, form.seq, form.title.trim(), payload, andSubmit, (id, seq) => setForm({ ...form, id, seq }), () => setForm(null));
  };
  const saveCourse = async (andSubmit: boolean) => {
    if (!course || stale) return;
    const payload = { summary: course.summary.trim(), lessonIds: course.lessonIds };
    if (!course.title.trim() || !course.lessonIds.length || !validPayload("course_group", payload)) { setError(errorText.course_input); return; }
    await commit("course_group", course.id, course.seq, course.title.trim(), payload, andSubmit, (id, seq) => setCourse({ ...course, id, seq }), () => setCourse(null));
  };
  // Saves a new version, optionally sends it to the Owner, then shows it. If sending fails the form stays open on the saved version.
  const commit = async (kind: "video_lesson" | "course_group", itemId: string | null, seq: number, title: string, payload: Record<string, unknown>, andSubmit: boolean,
    keepOpen: (id: string, seq: number) => void, close: () => void) => {
    const saved = await call({ action: "save_content", itemId, kind, title, payload, expectedSeq: seq }, true);
    const receipt = saved?.receipt as { item_id?: string; seq?: number } | undefined;
    if (!saved || !receipt || typeof receipt.item_id !== "string" || !Number.isInteger(receipt.seq)) return;
    let message = "Đã lưu phiên bản mới (nháp). Owner chưa thấy cho tới khi bạn gửi.";
    if (andSubmit) {
      const sent = await call({ action: "submit_content", itemId: receipt.item_id, expectedSeq: receipt.seq }, true);
      if (!sent?.receipt) { keepOpen(receipt.item_id, receipt.seq as number); setNotice(message); await loadList(); return; }
      message = "Đã lưu và gửi cho Owner duyệt.";
    }
    close(); setNotice(message); await loadList(); await open(receipt.item_id, true);
  };
  const submitOnly = async () => {
    if (!version) return;
    const sent = await call({ action: "submit_content", itemId: version.item_id, expectedSeq: version.latest_seq }, true);
    if (sent?.receipt) { setNotice("Đã gửi cho Owner duyệt."); await loadList(); await open(version.item_id, true); }
  };
  const set = (patch: Partial<Form>) => setForm(f => f ? { ...f, ...patch } : f);
  const setC = (patch: Partial<CourseForm>) => setCourse(c => c ? { ...c, ...patch } : c);
  const move = (index: number, by: -1 | 1) => setCourse(c => {
    if (!c || index + by < 0 || index + by >= c.lessonIds.length) return c;
    const next = c.lessonIds.slice(); const [item] = next.splice(index, 1); next.splice(index + by, 0, item);
    return { ...c, lessonIds: next };
  });
  const toggle = (lessonId: string, on: boolean) => setCourse(c => c ? { ...c, lessonIds: on ? (c.lessonIds.includes(lessonId) ? c.lessonIds : [...c.lessonIds, lessonId]) : c.lessonIds.filter(x => x !== lessonId) } : c);
  const typedId = form ? youtubeIdFrom(form.youtubeId) : null;
  const label = rows?.find(r => r.author_label)?.author_label ?? null;
  const lessons = (rows ?? []).filter(r => r.kind === "video_lesson");
  const courses = (rows ?? []).filter(r => r.kind === "course_group");
  const titleOf = (lessonId: string) => lessons.find(l => l.item_id === lessonId)?.title ?? lessonId;
  const isCourse = version ? kindOf(version) === "course_group" : false;

  return <section className="owner-panel owner-teacher-content" aria-label="Bài video của tôi">
    <div className="owner-panel-heading"><div><span className="owner-kicker">GIẢNG VIÊN</span><h2>Bài video của tôi</h2>
      <p>Bạn soạn và gửi bài cho Owner duyệt. Owner quyết định bài có hiện trong ứng dụng hay không. Bạn chỉ thấy bài của chính mình.</p></div>
      <button type="button" className="owner-primary" disabled={busy} onClick={() => { setVersion(null); setCourse(null); setForm({ ...blank }); setPreviewId(null); setNotice(""); }}>Soạn bài mới</button></div>
    <ol className="owner-hub-note" aria-label="Cách đưa một bài video lên">
      <li>Tải video lên kênh YouTube của chính bạn (công khai hoặc không công khai), rồi bấm “Soạn bài mới” và dán link video.</li>
      <li>Bấm “Xem thử video” để chắc đúng video, rồi điền mô tả, thời lượng và vùng cơ thể.</li>
      <li>Bấm “Lưu và gửi duyệt”. Owner xem và quyết định; bài chỉ hiện với học viên sau khi Owner duyệt và bật hiển thị.</li>
      <li>Gom các bài thành một khóa ở mục “Khóa miễn phí của tôi” và gửi duyệt: học viên thấy bài qua khóa đã được Owner duyệt và bật hiển thị.</li>
    </ol>
    <p className="owner-hub-note" data-testid="author-label">{label ? `Tên hiển thị với học viên: ${label} (lấy từ hồ sơ giảng viên đã kích hoạt của bạn).` : "Chưa có tên hiển thị: tên chỉ hiện khi hồ sơ giảng viên của bạn đã được kích hoạt."}</p>
    {busy && <p role="status">Đang đối chiếu với máy chủ…</p>}
    {error && <p className="owner-error" role="alert">{error}</p>}
    {notice && <p className="owner-success" role="status">{notice}</p>}
    {stale && <p className="owner-inline-warning" role="alert">Cần tải lại trước khi lưu tiếp. <button type="button" onClick={() => { setError(""); void (async () => { await loadList(); if (version) await open(version.item_id); })(); }}>Tải lại</button></p>}

    {rows && lessons.length === 0 && !form && <p className="owner-hub-note">Bạn chưa có bài nào. Bấm “Soạn bài mới” để bắt đầu.</p>}
    {lessons.length > 0 && <ul className="owner-hub-list" aria-label="Bài của tôi">{lessons.map(r => <li key={r.item_id}>
      <button type="button" aria-pressed={version?.item_id === r.item_id} disabled={busy} onClick={() => void open(r.item_id)}><strong>{r.title}</strong><span>{statusLabel(r)} · phiên bản {r.seq}</span></button></li>)}</ul>}

    {form && <form className="owner-hub-compose" aria-label="Soạn bài video" onSubmit={e => { e.preventDefault(); void save(false); }}>
      <fieldset disabled={busy || stale}><legend>{form.id ? "Sửa bài (tạo phiên bản mới)" : "Bài video mới"}</legend>
        <label className="owner-field">Tiêu đề<input required maxLength={200} value={form.title} onChange={e => set({ title: e.target.value })} /></label>
        <label className="owner-field">Link hoặc mã video YouTube<input required inputMode="url" autoComplete="off" spellCheck={false} placeholder="https://youtu.be/…" value={form.youtubeId} onChange={e => { set({ youtubeId: e.target.value }); setPreviewId(null); }} /></label>
        <p className="owner-hub-note" data-testid="youtube-id-status">{!form.youtubeId.trim() ? "Dán link video trên kênh YouTube của bạn, hoặc mã 11 ký tự." : typedId ? `Mã video: ${typedId}` : "Chưa nhận ra video YouTube từ nội dung này."}</p>
        <div><button type="button" disabled={!typedId} onClick={() => setPreviewId(typedId)}>Xem thử video</button></div>
        {previewId && previewId === typedId && <div className="owner-video-preview" style={{ position: "relative", width: "100%", maxWidth: form.orientation === "portrait" ? 320 : 640, aspectRatio: form.orientation === "portrait" ? "9 / 16" : "16 / 9" }}>
          <iframe title="Xem thử video YouTube" src={`https://www.youtube-nocookie.com/embed/${previewId}?playsinline=1&rel=0&modestbranding=1`} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 }} allow="accelerometer; clipboard-write; encrypted-media; fullscreen; gyroscope; picture-in-picture" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen /></div>}
        <label className="owner-field">Bạn sẽ làm gì trong bài này (mô tả)<textarea required maxLength={1000} value={form.summary} onChange={e => set({ summary: e.target.value })} /></label>
        <label className="owner-field">Thời lượng (m:ss)<input required value={form.duration} placeholder="0:43" onChange={e => set({ duration: e.target.value })} /></label>
        <label className="owner-field">Khung hình<select value={form.orientation} onChange={e => set({ orientation: e.target.value as Form["orientation"] })}><option value="portrait">Dọc</option><option value="landscape">Ngang</option></select></label>
        <label className="owner-field">Thẻ (cách nhau bằng dấu phẩy)<input value={form.tags} onChange={e => set({ tags: e.target.value })} /></label>
        <AreaPicker value={form.areas} onChange={areas => set({ areas })} />
        <div className="owner-form-footer"><span>Mỗi lần lưu tạo một phiên bản mới; phiên bản cũ giữ nguyên.</span>
          <button type="submit" className="owner-primary">Lưu nháp</button> <button type="button" className="owner-primary" onClick={() => void save(true)}>Lưu và gửi duyệt</button> <button type="button" onClick={() => { setForm(null); setPreviewId(null); }}>Đóng</button></div>
      </fieldset></form>}

    {rows && <section className="owner-teacher-courses" aria-label="Khóa miễn phí của tôi">
      <div className="owner-panel-heading"><div><h3>Khóa miễn phí của tôi</h3>
        <p>Gom các bài video của bạn thành một khóa miễn phí, theo thứ tự học. Khóa và từng bài trong khóa đều cần Owner duyệt và bật hiển thị; học viên chỉ thấy những bài đã duyệt.</p></div>
        <button type="button" className="owner-primary" disabled={busy || lessons.length === 0} onClick={() => { setVersion(null); setForm(null); setPreviewId(null); setCourse({ ...blankCourse }); setNotice(""); }}>Tạo khóa mới</button></div>
      {lessons.length === 0 ? <p className="owner-hub-note">Cần có ít nhất một bài video trước khi tạo khóa.</p>
        : courses.length === 0 && !course ? <p className="owner-hub-note">Bạn chưa có khóa nào.</p> : null}
      {courses.length > 0 && <ul className="owner-hub-list" aria-label="Khóa của tôi">{courses.map(r => <li key={r.item_id}>
        <button type="button" aria-pressed={version?.item_id === r.item_id} disabled={busy} onClick={() => void open(r.item_id)}><strong>{r.title}</strong><span>{statusLabel(r)} · phiên bản {r.seq}</span></button></li>)}</ul>}
    </section>}

    {course && <form className="owner-hub-compose" aria-label="Soạn khóa miễn phí" onSubmit={e => { e.preventDefault(); void saveCourse(false); }}>
      <fieldset disabled={busy || stale}><legend>{course.id ? "Sửa khóa (tạo phiên bản mới)" : "Khóa miễn phí mới"}</legend>
        <label className="owner-field">Tên khóa<input required maxLength={200} value={course.title} onChange={e => setC({ title: e.target.value })} /></label>
        <label className="owner-field">Khóa này dành cho ai, học được gì (mô tả)<textarea required maxLength={1000} value={course.summary} onChange={e => setC({ summary: e.target.value })} /></label>
        <fieldset className="owner-field"><legend>Chọn bài video của bạn</legend>
          {lessons.map(l => <label key={l.item_id} style={{ display: "block" }}><input type="checkbox" checked={course.lessonIds.includes(l.item_id)} onChange={e => toggle(l.item_id, e.target.checked)} /> {l.title} <span className="owner-hub-note">({statusLabel(l)})</span></label>)}
        </fieldset>
        {course.lessonIds.length > 0 && <ol aria-label="Thứ tự bài trong khóa">{course.lessonIds.map((lessonId, i) => <li key={lessonId}>{titleOf(lessonId)}{" "}
          <button type="button" aria-label={`Đưa “${titleOf(lessonId)}” lên`} disabled={i === 0} onClick={() => move(i, -1)}>Lên</button>{" "}
          <button type="button" aria-label={`Đưa “${titleOf(lessonId)}” xuống`} disabled={i === course.lessonIds.length - 1} onClick={() => move(i, 1)}>Xuống</button></li>)}</ol>}
        <p className="owner-hub-note">Khóa miễn phí. Lời về lợi ích và lưu ý sức khỏe do MCY biên soạn và duyệt riêng, không nhập ở đây.</p>
        <div className="owner-form-footer"><span>Mỗi lần lưu tạo một phiên bản mới; phiên bản cũ giữ nguyên.</span>
          <button type="submit" className="owner-primary">Lưu nháp</button> <button type="button" className="owner-primary" onClick={() => void saveCourse(true)}>Lưu và gửi duyệt</button> <button type="button" onClick={() => setCourse(null)}>Đóng</button></div>
      </fieldset></form>}

    {version && !form && !course && <article className="owner-hub-detail" aria-label={`${isCourse ? "Khóa" : "Bài"} · ${version.title}`}>
      <div className="owner-hub-detail-head"><div><h3>{version.title}</h3><p>Phiên bản {version.seq}/{version.latest_seq} · {statusLabel({ status: version.status, review: version.review as Row["review"] })}</p></div>
        {version.seq === version.latest_seq && <button type="button" disabled={busy} onClick={() => edit(version)}>Sửa (phiên bản mới)</button>}
        {version.status === "draft" && version.seq === version.latest_seq && <button type="button" className="owner-primary" disabled={busy || stale} onClick={() => void submitOnly()}>Gửi duyệt</button>}</div>
      <p>{String(version.payload.summary ?? "")}</p>
      {isCourse ? <ol aria-label="Bài trong khóa">{ids(version.payload.lessonIds).map(lessonId => <li key={lessonId}>{titleOf(lessonId)}</li>)}</ol>
        : <p className="owner-hub-note">{String(version.payload.durationLabel ?? "")} · YouTube {String(version.payload.youtubeId ?? "")}</p>}
      <section aria-label="Ghi chú của Owner"><h4>Ghi chú của Owner</h4>
        {notes.length === 0 ? <p className="owner-hub-note">Owner chưa có ghi chú cho bài này.</p> : <ul>{notes.map((n, i) => <li key={i}><strong>Phiên bản {n.seq}:</strong> {n.note}</li>)}</ul>}</section>
    </article>}
  </section>;
}
