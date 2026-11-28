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
type Row = { item_id: string; kind: string; author_kind?: string; author_label: string | null; seq: number; title: string; status: "draft" | "submitted"; review: { decision: "pending" | "approved" | "changes_requested" | "withdrawn"; revision: number } };
type Version = { item_id: string; kind?: string; seq: number; latest_seq: number; title: string; payload: Record<string, unknown>; status: "draft" | "submitted"; review: { decision: string } };
type Note = { seq: number; note: string; at: string };
type Form = { id: string | null; seq: number; title: string; youtubeId: string; summary: string; duration: string; orientation: "portrait" | "landscape"; tags: string; areas: string[] };
const blank: Form = { id: null, seq: 0, title: "", youtubeId: "", summary: "", duration: "", orientation: "portrait", tags: "", areas: [] };
// A free course (S1): the teacher's own video lessons in order. The server accepts only the teacher's own lessons and no
// benefit/caution guidance (that is MCY-reviewed wording); the Owner reviews and switches the course on like a lesson.
// The form has three steps (canvas board G, Owner 28/11): name and description, choose and order lessons, preview as learners see it.
type CourseForm = { id: string | null; seq: number; title: string; summary: string; lessonIds: string[]; step: 1 | 2 | 3 };
const blankCourse: CourseForm = { id: null, seq: 0, title: "", summary: "", lessonIds: [], step: 1 };
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
// W1 / T1 (Owner 28/11): the server's tracking answer for the teacher's own items. Never names the reviewer.
type Track = { item_id: string; kind: string; shown_seq: number | null; on_app: boolean; history: { event: "submit" | "review"; seq: number | null; at: string; decision?: string }[]; courses: { item_id: string; title: string | null; own: boolean; shown: boolean }[] };
const validTrack = (t: unknown): t is Track => !!t && typeof t === "object" && typeof (t as Track).item_id === "string" && typeof (t as Track).on_app === "boolean"
  && Array.isArray((t as Track).history) && Array.isArray((t as Track).courses);
type Filter = "all" | "draft" | "submitted" | "changes" | "approved";
const filterLabel: Record<Filter, string> = { all: "Tất cả", draft: "Nháp", submitted: "Chờ duyệt", changes: "Cần sửa", approved: "Đã duyệt" };
const decisionText: Record<string, string> = { approved: "đã duyệt", changes_requested: "yêu cầu sửa", withdrawn: "rút kết quả duyệt", pending: "chờ duyệt" };
export type TeacherView = "lessons" | "courses" | "tracking";
const statusLabel = (r: Pick<Row, "status" | "review">) => r.status === "draft" ? "Nháp, chưa gửi" : r.review.decision === "approved" ? "Đã được Owner duyệt" : r.review.decision === "changes_requested" ? "Cần chỉnh sửa" : r.review.decision === "withdrawn" ? "Kết quả duyệt đã rút" : "Đã gửi, chờ Owner duyệt";

export default function TeacherContentPanel({ userId, view = "lessons", onView = () => undefined }: { userId: string; view?: TeacherView; onView?: (view: TeacherView) => void }) {
  const [tracking, setTracking] = useState<Map<string, Track> | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [tab, setTab] = useState<"content" | "tracking">("content");
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

  // Read silently, outside the pending lock: an older server without read_tracking leaves tracking empty ("Chưa rõ"), never an error.
  const loadTracking = useCallback(async () => {
    const actor = userId;
    try {
      const client = await getAccountBoundSupabaseClient(actor);
      const { data, error: failure } = await client.functions.invoke("owner-control-plane", { body: { action: "read_tracking" } });
      if (account.current !== actor) return;
      const items = !failure && data && typeof data === "object" && Array.isArray((data as { items?: unknown }).items) ? (data as { items: unknown[] }).items : null;
      setTracking(items && items.every(validTrack) ? new Map((items as Track[]).map(t => [t.item_id, t])) : null);
    } catch { if (account.current === actor) setTracking(null); }
  }, [userId]);
  const loadList = useCallback(async () => {
    const data = await call({ action: "list_content" }, false);
    if (data && Array.isArray(data.items)) { setRows((data.items as Row[]).filter(r => r.kind === "video_lesson" || r.kind === "course_group")); setStale(false); void loadTracking(); }
  }, [call, loadTracking]);
  useEffect(() => { void loadList(); return () => { generation.current++; pending.current = false; }; }, [userId, loadList]);

  const open = async (itemId: string, keepNotice = false, showTab: "content" | "tracking" = "content") => {
    if (!keepNotice) setNotice("");
    setForm(null); setCourse(null); setTab(showTab);
    const data = await call({ action: "read_content", itemId }, false);
    if (data && data.version) setVersion(data.version as Version);
    const n = await call({ action: "read_author_notes", itemId }, false);
    setNotes(n && Array.isArray(n.notes) ? n.notes as Note[] : []);
  };
  const edit = (v: Version) => {
    const p = v.payload;
    if (kindOf(v) === "course_group") { setCourse({ id: v.item_id, seq: v.latest_seq, title: v.title, summary: String(p.summary ?? ""), lessonIds: ids(p.lessonIds), step: 1 }); return; }
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
  const lessonRow = (lessonId: string) => lessons.find(l => l.item_id === lessonId);
  const approvedCount = (list: string[]) => list.filter(id => lessonRow(id)?.review.decision === "approved").length;
  const courseLine = (list: string[]) => `${approvedCount(list)}/${list.length} bài đã được Owner duyệt. Học viên chỉ thấy những bài đã duyệt, sau khi Owner duyệt và bật hiển thị khóa.`;
  const startCourse = (lessonIds: string[]) => { setVersion(null); setForm(null); setPreviewId(null); setCourse({ ...blankCourse, lessonIds }); setNotice(""); setError(""); };
  const goStep = (to: 1 | 2 | 3) => {
    if (!course) return;
    const problem = to === 2 && (!course.title.trim() || !course.summary.trim()) ? "Khóa cần tên và mô tả."
      : to === 3 && !course.lessonIds.length ? "Chọn ít nhất một bài video của bạn." : "";
    if (problem) { setError(problem); return; }
    setError(""); setC({ step: to });
  };
  const titleOf = (lessonId: string) => lessons.find(l => l.item_id === lessonId)?.title ?? lessonId;
  const isCourse = version ? kindOf(version) === "course_group" : false;

  const bucketOf = (r: Pick<Row, "status" | "review">): Filter => r.status === "draft" ? "draft" : r.review.decision === "approved" ? "approved" : r.review.decision === "changes_requested" ? "changes" : "submitted";
  const reviewText = (r: Pick<Row, "status" | "review">) => r.status === "draft" ? "Nháp" : r.review.decision === "withdrawn" ? "Chờ duyệt lại" : filterLabel[bucketOf(r)];
  // "Trên app" never guesses: without the server's tracking answer it says "Chưa rõ".
  const appText = (r: Pick<Row, "item_id" | "kind">) => {
    const t = tracking?.get(r.item_id);
    if (!t) return "Chưa rõ";
    if (t.on_app) return `Đang hiện · bản ${t.shown_seq}`;
    if (t.shown_seq) return r.kind === "course_group" ? "Đã bật, chưa có bài đang hiện" : "Đã bật, chưa nằm trong khóa đang hiện";
    return "Chưa hiện";
  };
  const filtered = (list: Row[]) => filter === "all" ? list : list.filter(r => bucketOf(r) === filter);
  const showDetail = !!version && !form && !course && (view === "courses" ? isCourse : view === "lessons" ? !isCourse : false);
  const workOpen = view === "lessons" ? !!form || showDetail : view === "courses" ? !!course || showDetail : false;
  const workRef = useRef<HTMLDivElement>(null);
  const workKey = `${view}|${form ? form.id ?? "new" : ""}|${course ? course.id ?? "new" : ""}|${version?.item_id ?? ""}`;
  // The open item is shown at the top of the working area (beside the list on wide screens, above it on narrow ones), never
  // below the list (Owner 28/11: a form appearing far below looked like the app had failed).
  useEffect(() => { if (workOpen && workRef.current && typeof workRef.current.scrollIntoView === "function") workRef.current.scrollIntoView({ block: "nearest" }); }, [workKey, workOpen]);
  const track = version ? tracking?.get(version.item_id) ?? null : null;
  const when = (at: string) => { const d = new Date(at); return Number.isNaN(d.getTime()) ? "" : new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium", timeStyle: "short" }).format(d); };
  const lastSent = (itemId: string) => tracking?.get(itemId)?.history.find(h => h.event === "submit")?.at ?? null;

  const listOf = (list: Row[], name: string) => <>
    <div className="owner-row-head" aria-hidden="true"><span>Tên</span><span>Duyệt</span><span>Trên app</span></div>
    <ul className="owner-hub-list owner-hub-columns" aria-label={name}>{filtered(list).map(r => <li key={r.item_id}>
      <button type="button" aria-pressed={version?.item_id === r.item_id} disabled={busy} onClick={() => void open(r.item_id)}>
        <strong>{r.title}</strong><span data-col="review">{reviewText(r)} · bản {r.seq}</span><span data-col="app">{appText(r)}</span></button></li>)}</ul>
    {list.length > 0 && filtered(list).length === 0 && <p className="owner-hub-note">Không có mục nào ở trạng thái “{filterLabel[filter]}”.</p>}
  </>;
  const filterBox = <label className="owner-field owner-filter">Lọc theo trạng thái<select value={filter} onChange={e => setFilter(e.target.value as Filter)}>
    {(Object.keys(filterLabel) as Filter[]).map(f => <option key={f} value={f}>{filterLabel[f]}</option>)}</select></label>;

  const lessonForm = form && <form className="owner-hub-compose" aria-label="Soạn bài video" onSubmit={e => { e.preventDefault(); void save(false); }}>
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
    </fieldset></form>;

  const courseForm = course && <form className="owner-hub-compose" aria-label="Soạn khóa miễn phí" onSubmit={e => { e.preventDefault(); if (course.step === 3) void saveCourse(false); else goStep(course.step === 1 ? 2 : 3); }}>
    <fieldset disabled={busy || stale}><legend>{course.id ? "Sửa khóa (tạo phiên bản mới)" : "Khóa miễn phí mới"}</legend>
      <ol aria-label="Các bước tạo khóa">{["Tên và mô tả", "Chọn và sắp bài", "Xem trước"].map((name, i) =>
        <li key={name} aria-current={course.step === i + 1 ? "step" : undefined}>{course.step === i + 1 ? <strong>Bước {i + 1}: {name}</strong> : `Bước ${i + 1}: ${name}`}</li>)}</ol>
      {course.step === 1 && <>
        <label className="owner-field">Tên khóa<input required maxLength={200} value={course.title} onChange={e => setC({ title: e.target.value })} /></label>
        <label className="owner-field">Mô tả: khóa dành cho ai, học được gì<textarea required maxLength={1000} value={course.summary} onChange={e => setC({ summary: e.target.value })} /></label>
        <p className="owner-hub-note">Khóa miễn phí. Lời về lợi ích và lưu ý sức khỏe do MCY biên soạn và duyệt riêng, không nhập ở đây.</p>
      </>}
      {course.step === 2 && <>
        <fieldset className="owner-field"><legend>Chọn bài video của bạn</legend>
          {lessons.map(l => <label key={l.item_id} style={{ display: "block" }}><input type="checkbox" checked={course.lessonIds.includes(l.item_id)} onChange={e => toggle(l.item_id, e.target.checked)} /> {l.title} <span className="owner-hub-note">({statusLabel(l)})</span></label>)}
        </fieldset>
        {course.lessonIds.length > 0 && <ol aria-label="Thứ tự bài trong khóa">{course.lessonIds.map((lessonId, i) => <li key={lessonId}>{titleOf(lessonId)}{" "}
          <button type="button" aria-label={`Đưa “${titleOf(lessonId)}” lên`} disabled={i === 0} onClick={() => move(i, -1)}>Lên</button>{" "}
          <button type="button" aria-label={`Đưa “${titleOf(lessonId)}” xuống`} disabled={i === course.lessonIds.length - 1} onClick={() => move(i, 1)}>Xuống</button></li>)}</ol>}
        {course.lessonIds.length > 0 && <p className="owner-inline-warning" data-testid="course-approved-count">{courseLine(course.lessonIds)}</p>}
      </>}
      {course.step === 3 && <section aria-label="Xem trước khóa như học viên thấy">
        <h4>{course.title.trim()}</h4>
        {label && <p className="owner-hub-note">Giảng viên: {label}</p>}
        <p>{course.summary.trim()}</p>
        <ol>{course.lessonIds.map(lessonId => <li key={lessonId}>{titleOf(lessonId)}{lessonRow(lessonId)?.review.decision === "approved" ? "" : " · chưa hiện với học viên cho tới khi bài được duyệt"}</li>)}</ol>
        <p className="owner-hub-note" data-testid="course-approved-count">{courseLine(course.lessonIds)}</p>
      </section>}
      <div className="owner-form-footer"><span>Mỗi lần lưu tạo một phiên bản mới; phiên bản cũ giữ nguyên.</span>
        {course.step > 1 && <button type="button" onClick={() => goStep(course.step === 3 ? 2 : 1)}>Quay lại</button>}{" "}
        {course.step < 3 && <button type="button" className="owner-primary" onClick={() => goStep(course.step === 1 ? 2 : 3)}>Tiếp</button>}{" "}
        {course.step === 3 && <><button type="submit">Lưu nháp</button>{" "}<button type="button" className="owner-primary" onClick={() => void saveCourse(true)}>Lưu và gửi duyệt</button></>}{" "}
        <button type="button" onClick={() => setCourse(null)}>Đóng</button></div>
    </fieldset></form>;

  const trackingDetail = <section aria-label="Theo dõi bài sau khi gửi">
    {!tracking ? <p className="owner-hub-note" data-testid="tracking-unavailable">Máy chủ chưa trả dữ liệu theo dõi (cần bản cập nhật máy chủ). Không đoán bài có đang hiện hay không.</p>
      : !track ? <p className="owner-hub-note">Chưa có dữ liệu theo dõi cho mục này.</p> : <>
        <p data-testid="tracking-shown">{track.shown_seq ? `Học viên được phép thấy phiên bản ${track.shown_seq}.` : "Chưa có phiên bản nào được Owner duyệt và bật hiển thị."}{" "}
          {track.on_app ? "Đang hiện trong ứng dụng." : isCourse ? "Chưa hiện trong ứng dụng: khóa cần được bật và có ít nhất một bài đang hiện." : "Chưa hiện trong ứng dụng: bài chỉ tới học viên qua một khóa đang hiện."}</p>
        {!isCourse && <><h4>Khóa chứa bài này</h4>
          {track.courses.length === 0 ? <p className="owner-hub-note">Bài chưa nằm trong khóa nào.</p>
            : <ul aria-label="Khóa chứa bài này">{track.courses.map(c => <li key={c.item_id}>{c.title ?? "Khóa"}{" · "}{c.own ? "khóa của bạn" : "khóa của MCY"}{" · "}{c.shown ? "đang hiện" : "chưa hiện"}</li>)}</ul>}</>}
        <h4>Lịch sử gửi và duyệt</h4>
        {track.history.length === 0 ? <p className="owner-hub-note">Chưa gửi lần nào.</p>
          : <ol aria-label="Lịch sử gửi và duyệt">{track.history.map((h, i) => <li key={i}>{h.event === "submit" ? "Gửi duyệt" : `Owner: ${decisionText[h.decision ?? ""] ?? "đã ghi kết quả"}`}{h.seq ? ` · phiên bản ${h.seq}` : ""} · {when(h.at)}</li>)}</ol>}
        <p className="owner-hub-note">Không hiển thị người duyệt và lời khai duyệt. Số lượt xem chưa có.</p>
      </>}
  </section>;

  const detail = version && <article className="owner-hub-detail" aria-label={`${isCourse ? "Khóa" : "Bài"} · ${version.title}`}>
    <div className="owner-hub-detail-head"><div><h3>{version.title}</h3><p>Phiên bản {version.seq}/{version.latest_seq} · {statusLabel({ status: version.status, review: version.review as Row["review"] })}</p></div>
      {version.seq === version.latest_seq && <button type="button" disabled={busy} onClick={() => edit(version)}>Sửa (phiên bản mới)</button>}
      {version.status === "draft" && version.seq === version.latest_seq && <button type="button" className="owner-primary" disabled={busy || stale} onClick={() => void submitOnly()}>Gửi duyệt</button>}</div>
    <div className="owner-detail-tabs" role="group" aria-label="Xem">
      <button type="button" aria-pressed={tab === "content"} onClick={() => setTab("content")}>Nội dung</button>
      <button type="button" aria-pressed={tab === "tracking"} onClick={() => setTab("tracking")}>Theo dõi</button></div>
    {tab === "tracking" ? trackingDetail : <>
      <p>{String(version.payload.summary ?? "")}</p>
      {isCourse ? <><ol aria-label="Bài trong khóa">{ids(version.payload.lessonIds).map(lessonId => { const r = lessonRow(lessonId);
          return <li key={lessonId}>{titleOf(lessonId)} <span className="owner-hub-note">({r ? statusLabel(r) : "không còn trong danh sách bài của bạn"})</span></li>; })}</ol>
          <p className="owner-hub-note" data-testid="course-approved-count">{courseLine(ids(version.payload.lessonIds))}</p></>
        : <><p className="owner-hub-note">{String(version.payload.durationLabel ?? "")} · YouTube {String(version.payload.youtubeId ?? "")}</p>
          <p className="owner-hub-note">Bài chỉ tới học viên khi nằm trong một khóa đã được Owner duyệt và bật hiển thị.{" "}
            <button type="button" disabled={busy || stale} onClick={() => { startCourse([version.item_id]); onView("courses"); }}>Tạo khóa với bài này</button></p></>}
      <section aria-label="Ghi chú của Owner"><h4>Ghi chú của Owner</h4>
        {notes.length === 0 ? <p className="owner-hub-note">Owner chưa có ghi chú cho bài này.</p> : <ul>{notes.map((n, i) => <li key={i}><strong>Phiên bản {n.seq}:</strong> {n.note}</li>)}</ul>}</section>
    </>}
  </article>;

  const work = <div className="owner-split-work" ref={workRef}>
    {view === "lessons" && (lessonForm || (showDetail && detail))}
    {view === "courses" && (courseForm || (showDetail && detail))}
    {!workOpen && <p className="owner-hub-note owner-split-empty">{view === "courses" ? "Chọn một khóa để xem chi tiết, hoặc bấm “Tạo khóa mới”." : "Chọn một bài để xem chi tiết, hoặc bấm “Soạn bài mới”."}</p>}
  </div>;

  const heading = view === "courses" ? "Khóa học của tôi" : view === "tracking" ? "Theo dõi" : "Bài video của tôi";
  return <section className="owner-panel owner-teacher-content" aria-label={heading}>
    {view === "lessons" && <div className="owner-panel-heading"><div><h2>Bài video của tôi</h2>
      <p>Bạn soạn và gửi bài cho Owner duyệt. Owner quyết định bài có hiện trong ứng dụng hay không. Bạn chỉ thấy bài của chính mình.</p></div>
      <button type="button" className="owner-primary" disabled={busy} onClick={() => { setVersion(null); setCourse(null); setForm({ ...blank }); setPreviewId(null); setNotice(""); }}>Soạn bài mới</button></div>}
    {view === "courses" && <div className="owner-panel-heading"><div><h2>Khóa học của tôi</h2>
      <p>Gom các bài video của bạn thành một khóa miễn phí, theo thứ tự học. Khóa và từng bài trong khóa đều cần Owner duyệt và bật hiển thị; học viên chỉ thấy những bài đã duyệt.</p></div>
      <button type="button" className="owner-primary" disabled={busy || lessons.length === 0} onClick={() => startCourse([])}>Tạo khóa mới</button></div>}
    {view === "tracking" && <div className="owner-panel-heading"><div><h2>Theo dõi</h2>
      <p>Bài và khóa của bạn sau khi gửi: kết quả duyệt, có đang hiện trong ứng dụng không, lần gửi gần nhất. Bấm tên để xem lịch sử.</p></div></div>}
    {view === "lessons" && <details className="owner-howto" open={rows !== null && lessons.length === 0}><summary>Cách đưa một bài video lên</summary>
      <ol className="owner-hub-note" aria-label="Cách đưa một bài video lên">
        <li>Tải video lên kênh YouTube của chính bạn (công khai hoặc không công khai), rồi bấm “Soạn bài mới” và dán link video.</li>
        <li>Bấm “Xem thử video” để chắc đúng video, rồi điền mô tả, thời lượng và vùng cơ thể.</li>
        <li>Bấm “Lưu và gửi duyệt”. Owner xem và quyết định; bài chỉ hiện với học viên sau khi Owner duyệt và bật hiển thị.</li>
        <li>Gom các bài thành một khóa ở mục “Khóa học của tôi” và gửi duyệt: học viên thấy bài qua khóa đã được Owner duyệt và bật hiển thị.</li>
      </ol></details>}
    {view === "lessons" && <p className="owner-hub-note" data-testid="author-label">{label ? `Tên hiển thị với học viên: ${label} (lấy từ hồ sơ giảng viên đã kích hoạt của bạn).` : "Chưa có tên hiển thị: tên chỉ hiện khi hồ sơ giảng viên của bạn đã được kích hoạt."}</p>}
    {busy && <p role="status">Đang đối chiếu với máy chủ…</p>}
    {error && <p className="owner-error" role="alert">{error}</p>}
    {notice && <p className="owner-success" role="status">{notice}</p>}
    {stale && <p className="owner-inline-warning" role="alert">Cần tải lại trước khi lưu tiếp. <button type="button" onClick={() => { setError(""); void (async () => { await loadList(); if (version) await open(version.item_id); })(); }}>Tải lại</button></p>}

    {view === "lessons" && <div className={`owner-split${workOpen ? " is-open" : ""}`}>
      <div className="owner-split-list">
        {rows && lessons.length === 0 && !form && <p className="owner-hub-note">Bạn chưa có bài nào. Bấm “Soạn bài mới” để bắt đầu.</p>}
        {lessons.length > 0 && <>{filterBox}{listOf(lessons, "Bài của tôi")}</>}
      </div>
      {work}
    </div>}

    {view === "courses" && <div className={`owner-split${workOpen ? " is-open" : ""}`}>
      <div className="owner-split-list">
        {rows && (lessons.length === 0 ? <p className="owner-hub-note">Cần có ít nhất một bài video trước khi tạo khóa.</p>
          : courses.length === 0 && !course ? <p className="owner-hub-note">Bạn chưa có khóa nào.</p> : null)}
        {courses.length > 0 && <>{filterBox}{listOf(courses, "Khóa của tôi")}</>}
      </div>
      {work}
    </div>}

    {view === "tracking" && rows && <>
      {!tracking && <p className="owner-inline-warning" data-testid="tracking-unavailable">Máy chủ chưa trả dữ liệu theo dõi (cần bản cập nhật máy chủ). Cột “Trên app” ghi “Chưa rõ” thay vì đoán.</p>}
      {rows.length === 0 ? <p className="owner-hub-note">Bạn chưa có bài hay khóa nào.</p>
        : <table className="owner-track-table" aria-label="Theo dõi bài và khóa"><thead><tr><th scope="col">Tên</th><th scope="col">Loại</th><th scope="col">Duyệt</th><th scope="col">Trên app</th><th scope="col">Gửi gần nhất</th></tr></thead>
          <tbody>{rows.map(r => { const sent = lastSent(r.item_id); return <tr key={r.item_id}>
            <th scope="row"><button type="button" disabled={busy} onClick={() => { onView(r.kind === "course_group" ? "courses" : "lessons"); void open(r.item_id, false, "tracking"); }}>{r.title}</button></th>
            <td>{r.kind === "course_group" ? "Khóa" : "Bài"}</td><td>{reviewText(r)} · bản {r.seq}</td><td>{appText(r)}</td><td>{sent ? when(sent) : tracking ? "Chưa gửi" : "Chưa rõ"}</td></tr>; })}</tbody></table>}
    </>}
  </section>;
}
