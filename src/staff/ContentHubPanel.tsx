import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { getAccountBoundSupabaseClient } from "../backend/supabase";
import { reviewChecks, type ReviewChecklist } from "../../supabase/functions/_shared/contentReviewContract";
import { validPayload } from "../../supabase/functions/_shared/contentWorkspaceContract";
import type { ReadingUnitContent } from "../../supabase/functions/_shared/readingUnitCandidates";
import { ReadingUnitPreview } from "./ReadingUnitPreview";
import { AreaPicker } from "./AreaPicker";
import { lessonAreas } from "../courses/lessonFinder";
import "./owner.css";

// Owner content hub (phase 2): every item in the versioned content store in one list, a "see it as a learner" view,
// the Owner's own typed review declaration, and authoring of MCY content. Nothing here publishes or enables anything:
// a decision only records the review; visibility switches arrive with the display configuration.
type Kind = "video_lesson" | "course_group" | "reading_unit" | "screen_text";
type Decision = "pending" | "approved" | "changes_requested" | "withdrawn";
type Row = {
  item_id: string; kind: Kind; author_kind: "teacher" | "mcy"; author_label: string | null; seq: number; content_hash: string; title: string;
  status: "draft" | "submitted"; origin: "authored" | "imported"; updated_at: string; versions: number; approved_seq: number | null;
  review: { decision: Decision; revision: number };
};
type Version = {
  item_id: string; kind: Kind; author_kind: "teacher" | "mcy"; author_label: string | null; seq: number; latest_seq: number; title: string; payload: Record<string, unknown>;
  status: "draft" | "submitted"; origin: "authored" | "imported";
  review: { decision: Decision; revision: number; qualification?: string | null; review_basis?: string | null; rights_basis?: string | null; checklist?: ReviewChecklist | null };
};
const kindLabel: Record<Kind, string> = { video_lesson: "Bài video", course_group: "Nhóm khóa", reading_unit: "Bài đọc", screen_text: "Văn bản màn hình" };
const decisionLabel: Record<Decision, string> = { pending: "Chờ duyệt", approved: "Đã duyệt", changes_requested: "Cần sửa", withdrawn: "Đã rút" };
const checkLabels: Record<typeof reviewChecks[number], string> = {
  contentAccuracy: "Đã kiểm nội dung chính xác",
  audienceScope: "Đối tượng và phạm vi rõ ràng",
  stopGuidance: "Có hướng dẫn dừng",
  accessibility: "Dễ tiếp cận (đọc, nghe, ngôn ngữ)",
  rightsConfirmed: "Bản quyền đã xác nhận",
  expertiseConfirmed: "Tôi có chuyên môn phù hợp với phạm vi đang duyệt",
  vietnameseAudioReady: "Âm thanh tiếng Việt (chỉ buổi tập)",
  actualDurationChecked: "Thời lượng thực đã đo (chỉ buổi tập)",
};
const exemptChecks = ["vietnameseAudioReady", "actualDurationChecked"];
const emptyChecks = () => Object.fromEntries(reviewChecks.map(k => [k, false])) as ReviewChecklist;
const editorChoice = "Lựa chọn của biên tập · MCY biên soạn";
const errorText: Record<string, string> = {
  content_conflict: "Nội dung vừa thay đổi ở nơi khác. Tải lại trước khi lưu tiếp.",
  content_limit_reached: "Đã đạt giới hạn thao tác trong 24 giờ. Thử lại sau.",
  content_access_required: "Tài khoản này chưa có quyền với nội dung này.",
  owner_access_required: "Chỉ Owner làm được thao tác này.",
  content_kind_not_allowed: "Loại nội dung này không được phép.",
  teacher_content_is_reviewed_not_edited: "Nội dung của giảng viên chỉ được duyệt, không sửa. Hãy yêu cầu tác giả sửa.",
  invalid_content: "Nội dung chưa hợp lệ. Hãy kiểm lại các trường.",
  invalid_review: "Phiếu duyệt chưa đủ thông tin hoặc tiêu chí.",
  review_checks_incomplete: "Cần chọn đủ các tiêu chí trước khi duyệt.",
  content_not_submitted: "Tác giả chưa gửi duyệt phiên bản này.",
  content_item_not_found: "Không tìm thấy nội dung.",
};
const statusOf = (r: Pick<Row, "status" | "review">) => r.status === "draft" ? "Nháp chưa gửi" : decisionLabel[r.review.decision];

function byline(v: { author_kind: string; author_label: string | null }) {
  if (v.author_kind === "mcy") return editorChoice;
  return v.author_label ?? "Giảng viên (chưa có tên hiển thị: hồ sơ chưa kích hoạt)";
}
const asStrings = (v: unknown): string[] => Array.isArray(v) ? v.filter((s): s is string => typeof s === "string") : [];
const lines = (s: string) => s.split(/\r?\n/).map(x => x.trim()).filter(Boolean);

type Draft = { id: string | null; seq: number; kind: Exclude<Kind, "reading_unit">; title: string; youtubeId: string; summary: string; duration: string; orientation: "portrait" | "landscape"; tags: string; areas: string[];
  lessonIds: string[]; benefits: string; cautions: string; locale: "vi-VN" | "en-US"; entries: string };
const blankDraft = (kind: Draft["kind"] = "video_lesson"): Draft => ({ id: null, seq: 0, kind, title: "", youtubeId: "", summary: "", duration: "", orientation: "portrait", tags: "", areas: [], lessonIds: [], benefits: "", cautions: "", locale: "vi-VN", entries: "" });
function draftFrom(v: Version): Draft | null {
  if (v.kind === "reading_unit") return null;
  const p = v.payload, g = (p.guidance ?? {}) as Record<string, unknown>;
  const entries = (p.entries ?? {}) as Record<string, string>;
  return { id: v.item_id, seq: v.latest_seq, kind: v.kind, title: v.title, youtubeId: String(p.youtubeId ?? ""), summary: String(p.summary ?? ""), duration: String(p.durationLabel ?? ""),
    orientation: p.orientation === "landscape" ? "landscape" : "portrait", tags: asStrings(p.tags).join(", "), areas: Array.isArray(p.areas) ? asStrings(p.areas) : lessonAreas({ title: v.title }, "gentle"), lessonIds: asStrings(p.lessonIds), benefits: asStrings(g.benefits).join("\n"), cautions: asStrings(g.cautions).join("\n"),
    locale: p.locale === "en-US" ? "en-US" : "vi-VN", entries: Object.entries(entries).map(([k, t]) => `${k}=${t}`).join("\n") };
}
function payloadOf(d: Draft): Record<string, unknown> {
  if (d.kind === "video_lesson") {
    const tags = d.tags.split(",").map(t => t.trim()).filter(Boolean);
    return { youtubeId: d.youtubeId.trim(), summary: d.summary.trim(), durationLabel: d.duration.trim(), orientation: d.orientation, areas: d.areas, ...(tags.length ? { tags } : {}) };
  }
  if (d.kind === "course_group") {
    const benefits = lines(d.benefits), cautions = lines(d.cautions);
    return { summary: d.summary.trim(), lessonIds: d.lessonIds, ...(benefits.length || cautions.length ? { guidance: { reviewed: false, benefits, cautions } } : {}) };
  }
  const entries: Record<string, string> = {};
  for (const line of lines(d.entries)) { const i = line.indexOf("="); if (i > 0) entries[line.slice(0, i).trim()] = line.slice(i + 1).trim(); }
  return { locale: d.locale, entries };
}

export default function ContentHubPanel({ userId }: { userId: string }) {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [kindFilter, setKindFilter] = useState<"all" | Kind>("all");
  const [authorFilter, setAuthorFilter] = useState<"all" | "teacher" | "mcy">("all");
  const [version, setVersion] = useState<Version | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [qualification, setQualification] = useState("");
  const [basis, setBasis] = useState("");
  const [rights, setRights] = useState("");
  const [checks, setChecks] = useState<ReviewChecklist>(emptyChecks);
  const [decision, setDecision] = useState<"approved" | "changes_requested" | "withdrawn">("changes_requested");
  const [importConfirm, setImportConfirm] = useState(false);
  const [visibilityRows, setVisibilityRows] = useState<{ item_id: string; seq: number; effective: boolean }[]>([]);
  const [visConfirm, setVisConfirm] = useState(false);
  const [authorNote, setAuthorNote] = useState("");
  const [notes, setNotes] = useState<{ seq: number; note: string; at: string }[]>([]);
  const [busy, setBusy] = useState(false);
  const [uncertain, setUncertain] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const pending = useRef(false);
  const generation = useRef(0);
  const account = useRef(userId); account.current = userId;

  // One guarded call: a stale answer (another account, a newer request) is dropped; an unknown outcome of a write is never retried.
  const call = useCallback(async (body: Record<string, unknown>, write: boolean): Promise<Record<string, unknown> | null> => {
    const tick = ++generation.current, actor = userId;
    const valid = () => tick === generation.current && account.current === actor;
    let invoked = false;
    try {
      const client = await getAccountBoundSupabaseClient(actor);
      if (!valid()) return null;
      invoked = true;
      const { data, error: failure } = await client.functions.invoke("owner-control-plane", { body });
      if (!valid()) return null;
      if (failure) {
        let code = "";
        const response = (failure as { context?: unknown }).context;
        if (response instanceof Response) { try { code = (await response.clone().json()).error ?? ""; } catch { /* unknown */ } }
        if (!valid()) return null;
        if (errorText[code]) { setError(errorText[code]); if (code === "content_conflict") setUncertain(true); return null; }
        if (write) setUncertain(true);
        setError(write ? "Chưa xác định thao tác đã được lưu hay chưa. Tải lại để đối chiếu; không tự gửi lại." : "Chưa đọc được nội dung từ máy chủ. Thử tải lại.");
        return null;
      }
      return (data ?? {}) as Record<string, unknown>;
    } catch {
      if (valid()) { if (write && invoked) setUncertain(true); setError(write && invoked ? "Chưa xác định thao tác đã được lưu hay chưa. Tải lại để đối chiếu; không tự gửi lại." : "Chưa kết nối được máy chủ."); }
      return null;
    }
  }, [userId]);

  const run = useCallback(async (body: Record<string, unknown>, write: boolean) => {
    if (pending.current) return null;
    pending.current = true; setBusy(true); setError("");
    try { return await call(body, write); } finally { pending.current = false; setBusy(false); }
  }, [call]);

  const loadList = useCallback(async () => {
    const data = await run({ action: "list_content" }, false);
    if (data && Array.isArray(data.items)) { setRows(data.items as Row[]); setUncertain(false); }
  }, [run]);
  useEffect(() => { void loadList(); return () => { generation.current++; pending.current = false; }; }, [userId, loadList]);

  const open = async (itemId: string, seq?: number, keepNotice = false) => {
    if (!keepNotice) setNotice("");
    setDraft(null);
    const data = await run({ action: "read_content", itemId, ...(seq ? { seq } : {}) }, false);
    if (data && data.version) setVersion(data.version as Version);
    setVisConfirm(false); setAuthorNote(""); setNotes([]);
    if (data && data.version && (data.version as Version).author_kind === "teacher") {
      const n = await run({ action: "read_author_notes", itemId }, false);
      if (n && Array.isArray(n.notes)) setNotes(n.notes as typeof notes);
    }
    // The switch state lives in the display tables; an older backend without them simply shows no switch state.
    const display = await run({ action: "read_display" }, false);
    if (display && Array.isArray(display.visibility)) setVisibilityRows(display.visibility as typeof visibilityRows);
  };
  useEffect(() => {
    const r = version?.review;
    setQualification(r?.qualification ?? ""); setBasis(r?.review_basis ?? ""); setRights(r?.rights_basis ?? ""); setChecks(r?.checklist ?? emptyChecks()); setDecision("changes_requested");
  }, [version]);

  const shown = useMemo(() => (rows ?? []).filter(r => (kindFilter === "all" || r.kind === kindFilter) && (authorFilter === "all" || r.author_kind === authorFilter)), [rows, kindFilter, authorFilter]);
  const stats = useMemo(() => {
    const all = rows ?? [];
    return {
      waiting: all.filter(r => r.status === "submitted" && r.review.decision === "pending").length,
      fix: all.filter(r => r.status === "submitted" && r.review.decision === "changes_requested").length,
      approved: all.filter(r => r.status === "submitted" && r.review.decision === "approved").length,
      drafts: all.filter(r => r.status === "draft").length,
    };
  }, [rows]);
  const titleOf = (id: string) => rows?.find(r => r.item_id === id)?.title ?? id;

  const doImport = async () => {
    setImportConfirm(false); setNotice("");
    const data = await run({ action: "import_catalog" }, true);
    if (data && typeof data.total === "number") { setNotice(`Đã nhập ${data.created} mục mới, ${data.unchanged} mục không đổi (tổng ${data.total}). Nhập chỉ ghi lại nội dung hiện có ở trạng thái chưa duyệt; không công bố gì.`); await loadList(); }
  };

  const saveReview = async (e: FormEvent) => {
    e.preventDefault();
    if (!version || uncertain) return;
    // For a teacher's lesson that needs changes, the author is told why; the note is required.
    const forTeacher = version.author_kind === "teacher";
    if (forTeacher && decision === "changes_requested" && authorNote.trim().length < 1) { setError("Ghi chú gửi tác giả là bắt buộc khi yêu cầu sửa."); return; }
    const data = await run({ action: "review_content", itemId: version.item_id, seq: version.seq, expectedRevision: version.review.revision, decision, qualification, reviewBasis: basis, rightsBasis: rights, checklist: checks }, true);
    const receipt = data?.receipt as { revision?: number } | undefined;
    if (data && receipt && Number.isInteger(receipt.revision)) {
      if (forTeacher && authorNote.trim()) await run({ action: "save_author_note", itemId: version.item_id, seq: version.seq, note: authorNote.trim() }, true);
      setNotice("Đã ghi kết quả duyệt và lịch sử. Duyệt chưa làm nội dung hiện lên app: bước tiếp theo là bật công tắc hiển thị khi có cấu hình hiển thị.");
      await loadList(); await open(version.item_id, undefined, true);
    }
  };

  const saveDraft = async (andSubmit: boolean) => {
    if (!draft || uncertain) return;
    const payload = payloadOf(draft);
    if (!draft.title.trim() || !validPayload(draft.kind, payload)) { setError(errorText.invalid_content); return; }
    const saved = await run({ action: "save_content", itemId: draft.id, kind: draft.kind, title: draft.title.trim(), payload, expectedSeq: draft.seq }, true);
    const receipt = saved?.receipt as { item_id?: string; seq?: number } | undefined;
    if (!saved || !receipt || typeof receipt.item_id !== "string" || !Number.isInteger(receipt.seq)) return;
    let message = "Đã lưu phiên bản mới (nháp).";
    if (andSubmit) {
      const sent = await run({ action: "submit_content", itemId: receipt.item_id, expectedSeq: receipt.seq }, true);
      if (!sent?.receipt) { setDraft({ ...draft, id: receipt.item_id, seq: receipt.seq as number }); setNotice(message); await loadList(); return; }
      message = "Đã lưu và gửi duyệt. Nội dung vào hàng chờ của Owner.";
    }
    setDraft(null); setNotice(message); await loadList(); await open(receipt.item_id, undefined, true);
  };

  const setVisible = async (visible: boolean) => {
    if (!version || uncertain) return;
    setVisConfirm(false);
    const data = await run({ action: "set_visibility", itemId: version.item_id, seq: version.seq, visible }, true);
    if (data?.receipt) { setNotice(visible ? "Đã bật hiển thị cho phiên bản này và ghi nhật ký. App chưa đọc kho nội dung (giai đoạn 4), nên học viên chưa thấy thay đổi." : "Đã tắt hiển thị và ghi nhật ký."); await open(version.item_id, version.seq, true); }
  };
  const needsAll = reviewChecks.every(k => checks[k] || exemptChecks.includes(k) || decision !== "approved");
  const canReview = Boolean(version && version.status === "submitted" && version.seq === version.latest_seq);
  const set = (patch: Partial<Draft>) => setDraft(d => d ? { ...d, ...patch } : d);

  return <section className="owner-panel owner-hub" aria-label="Nội dung của toàn ứng dụng">
    <div className="owner-panel-heading"><div><span className="owner-kicker">NỘI DUNG</span><h2>Nội dung của toàn ứng dụng</h2>
      <p>Mọi bài video, nhóm khóa, bài đọc và văn bản màn hình ở một chỗ. Mỗi lần lưu là một phiên bản bất biến. Duyệt chưa làm nội dung hiện lên app.</p></div>
      <button type="button" className="owner-primary" disabled={busy} onClick={() => { setVersion(null); setDraft(blankDraft()); setNotice(""); }}>Soạn nội dung MCY</button></div>
    {busy && <p role="status">Đang đối chiếu với máy chủ…</p>}
    {error && <p className="owner-error" role="alert">{error}</p>}
    {notice && <p className="owner-success" role="status">{notice}</p>}
    {uncertain && <p className="owner-inline-warning" role="alert">Cần tải lại trước khi lưu tiếp. <button type="button" onClick={() => { setUncertain(false); setError(""); void (async () => { await loadList(); if (version) await open(version.item_id); })(); }}>Tải lại</button></p>}

    {rows && <>
      <div className="owner-hub-stats" aria-label="Tổng quan">
        <div><b>{stats.waiting}</b><span>Chờ Owner duyệt</span></div><div><b>{stats.fix}</b><span>Cần tác giả sửa</span></div>
        <div><b>{stats.approved}</b><span>Đã duyệt</span></div><div><b>{stats.drafts}</b><span>Nháp chưa gửi</span></div>
      </div>
      <div className="owner-hub-filters">
        <label className="owner-field">Loại<select aria-label="Lọc theo loại" value={kindFilter} onChange={e => setKindFilter(e.target.value as typeof kindFilter)}><option value="all">Tất cả</option>{(Object.keys(kindLabel) as Kind[]).map(k => <option key={k} value={k}>{kindLabel[k]}</option>)}</select></label>
        <label className="owner-field">Tác giả<select aria-label="Lọc theo tác giả" value={authorFilter} onChange={e => setAuthorFilter(e.target.value as typeof authorFilter)}><option value="all">Tất cả</option><option value="teacher">Do giảng viên soạn</option><option value="mcy">MCY biên soạn</option></select></label>
      </div>
      {rows.length === 0 && <div className="owner-hub-empty"><p><strong>Chưa có nội dung trong kho.</strong> Nhập nội dung hiện có của app (14 bài đọc, 38 video, 3 nhóm khóa) để rà soát một chỗ. Nhập không duyệt và không công bố gì.</p>
        {!importConfirm ? <button type="button" className="owner-primary" disabled={busy} onClick={() => setImportConfirm(true)}>Nhập nội dung hiện có</button>
          : <div role="alertdialog" aria-label="Xác nhận nhập nội dung"><p><strong>Ghi 55 mục vào kho ở trạng thái đã gửi, chưa duyệt?</strong> Bài đọc giữ nguyên các lần duyệt đã có. Video và nhóm khóa cần bạn duyệt sau.</p>
            <button type="button" className="owner-primary" disabled={busy} onClick={() => void doImport()}>Xác nhận nhập</button> <button type="button" onClick={() => setImportConfirm(false)}>Hủy</button></div>}</div>}
      {shown.length > 0 && <ul className="owner-hub-list" aria-label="Danh sách nội dung">{shown.map(r => <li key={r.item_id}>
        <button type="button" aria-pressed={version?.item_id === r.item_id} disabled={busy} onClick={() => void open(r.item_id)}>
          <strong>{r.title}</strong>
          <span>{kindLabel[r.kind]} · {r.author_kind === "mcy" ? "MCY biên soạn" : (r.author_label ?? "Giảng viên")} · {statusOf(r)}{r.approved_seq && r.approved_seq !== r.seq ? ` · bản ${r.approved_seq} đã duyệt` : ""} · phiên bản {r.seq}</span>
        </button></li>)}</ul>}
      {rows.length > 0 && shown.length === 0 && <p>Không có nội dung khớp bộ lọc.</p>}
    </>}

    {draft && <form className="owner-hub-compose" aria-label="Soạn nội dung MCY" onSubmit={e => { e.preventDefault(); void saveDraft(false); }}>
      <fieldset disabled={busy || uncertain}><legend>{draft.id ? "Sửa nội dung MCY (tạo phiên bản mới)" : "Soạn nội dung MCY"}</legend>
        <label className="owner-field">Loại<select aria-label="Loại nội dung" value={draft.kind} disabled={Boolean(draft.id)} onChange={e => setDraft({ ...blankDraft(e.target.value as Draft["kind"]), title: draft.title })}>
          <option value="video_lesson">Bài video</option><option value="course_group">Nhóm khóa</option><option value="screen_text">Văn bản màn hình</option></select></label>
        <label className="owner-field">Tiêu đề<input required maxLength={200} value={draft.title} onChange={e => set({ title: e.target.value })} /></label>
        {draft.kind === "video_lesson" && <>
          <label className="owner-field">Mã video YouTube (11 ký tự)<input required value={draft.youtubeId} onChange={e => set({ youtubeId: e.target.value })} /></label>
          <label className="owner-field">Mô tả<textarea required maxLength={1000} value={draft.summary} onChange={e => set({ summary: e.target.value })} /></label>
          <label className="owner-field">Thời lượng (m:ss)<input required value={draft.duration} placeholder="0:43" onChange={e => set({ duration: e.target.value })} /></label>
          <label className="owner-field">Khung hình<select value={draft.orientation} onChange={e => set({ orientation: e.target.value as Draft["orientation"] })}><option value="portrait">Dọc</option><option value="landscape">Ngang</option></select></label>
          <label className="owner-field">Thẻ (cách nhau bằng dấu phẩy)<input value={draft.tags} onChange={e => set({ tags: e.target.value })} /></label>
          <AreaPicker value={draft.areas} onChange={areas => set({ areas })} /></>}
        {draft.kind === "course_group" && <>
          <label className="owner-field">Mô tả nhóm<textarea required maxLength={1000} value={draft.summary} onChange={e => set({ summary: e.target.value })} /></label>
          <fieldset className="owner-hub-lessons"><legend>Bài video trong nhóm</legend>{(rows ?? []).filter(r => r.kind === "video_lesson").map(r => <label key={r.item_id}>
            <input type="checkbox" checked={draft.lessonIds.includes(r.item_id)} onChange={e => set({ lessonIds: e.target.checked ? [...draft.lessonIds, r.item_id] : draft.lessonIds.filter(id => id !== r.item_id) })} /> {r.title}</label>)}</fieldset>
          <label className="owner-field">Lợi ích (mỗi dòng một ý, bản nháp chờ chuyên gia duyệt)<textarea value={draft.benefits} onChange={e => set({ benefits: e.target.value })} /></label>
          <label className="owner-field">Lưu ý an toàn (mỗi dòng một ý)<textarea value={draft.cautions} onChange={e => set({ cautions: e.target.value })} /></label></>}
        {draft.kind === "screen_text" && <>
          <label className="owner-field">Ngôn ngữ<select value={draft.locale} onChange={e => set({ locale: e.target.value as Draft["locale"] })}><option value="vi-VN">Tiếng Việt</option><option value="en-US">English</option></select></label>
          <label className="owner-field">Các dòng chữ (mỗi dòng dạng khóa=nội dung)<textarea required rows={5} value={draft.entries} onChange={e => set({ entries: e.target.value })} /></label></>}
        <div className="owner-form-footer"><span>Mỗi lần lưu tạo một phiên bản mới; phiên bản cũ giữ nguyên.</span>
          <button type="submit" className="owner-primary">Lưu nháp</button> <button type="button" className="owner-primary" onClick={() => void saveDraft(true)}>Lưu và gửi duyệt</button> <button type="button" onClick={() => setDraft(null)}>Đóng</button></div>
      </fieldset></form>}

    {version && !draft && <article className="owner-hub-detail" aria-label={`Đánh giá · ${version.title}`}>
      <div className="owner-hub-detail-head"><div><span className="owner-kicker">{kindLabel[version.kind].toUpperCase()}</span><h3>{version.title}</h3>
        <p>{byline(version)} · phiên bản {version.seq}/{version.latest_seq} · {version.status === "draft" ? "Nháp chưa gửi" : decisionLabel[version.review.decision]}{version.origin === "imported" ? " · nhập từ nội dung hiện có" : ""}</p></div>
        {version.latest_seq > 1 && <label className="owner-field">Lịch sử<select aria-label="Phiên bản" value={version.seq} disabled={busy} onChange={e => void open(version.item_id, Number(e.target.value))}>{Array.from({ length: version.latest_seq }, (_, i) => i + 1).map(n => <option key={n} value={n}>Phiên bản {n}{n === version.latest_seq ? " (mới nhất)" : ""}</option>)}</select></label>}
        {version.author_kind === "mcy" && version.kind !== "reading_unit" && version.seq === version.latest_seq && <button type="button" disabled={busy} onClick={() => setDraft(draftFrom(version))}>Sửa (phiên bản mới)</button>}
      </div>
      {version.author_kind === "teacher" && <p className="owner-hub-note">Nội dung của giảng viên: Owner chỉ duyệt hoặc yêu cầu sửa, không sửa trực tiếp.</p>}

      <section className="owner-hub-learner" aria-label="Xem như học viên thấy"><h4>Xem như học viên thấy</h4>
        {version.kind === "reading_unit" ? <ReadingUnitPreview unit={version.payload as unknown as ReadingUnitContent} /> : <div className="owner-hub-card">
          <span className="mcy-tag">{kindLabel[version.kind]}</span><strong>{version.title}</strong><small>{byline(version)}</small>
          {version.kind === "video_lesson" && <><p>{String(version.payload.summary ?? "")}</p><p><small>{String(version.payload.durationLabel ?? "")} · {version.payload.orientation === "landscape" ? "khung ngang" : "khung dọc"} · YouTube {String(version.payload.youtubeId ?? "")}</small></p></>}
          {version.kind === "course_group" && <><p>{String(version.payload.summary ?? "")}</p><ol>{asStrings(version.payload.lessonIds).map(id => <li key={id}>{titleOf(id)}</li>)}</ol>
            {Boolean(version.payload.guidance) && <><p><small>{(version.payload.guidance as { reviewed?: boolean }).reviewed ? "Lợi ích và lưu ý đã được duyệt." : "Lợi ích và lưu ý đang chờ chuyên gia yoga hoặc y tế duyệt."}</small></p>
              <ul>{asStrings((version.payload.guidance as Record<string, unknown>).benefits).map(t => <li key={t}>{t}</li>)}</ul><ul>{asStrings((version.payload.guidance as Record<string, unknown>).cautions).map(t => <li key={t}>{t}</li>)}</ul></>}</>}
          {version.kind === "screen_text" && <dl>{Object.entries((version.payload.entries ?? {}) as Record<string, string>).map(([k, t]) => <div key={k}><dt>{k}</dt><dd>{t}</dd></div>)}</dl>}
        </div>}
      </section>

      {version.author_kind === "teacher" && notes.length > 0 && <section aria-label="Ghi chú đã gửi tác giả"><h4>Ghi chú đã gửi tác giả</h4><ul>{notes.map((n, i) => <li key={i}>Phiên bản {n.seq}: {n.note}</li>)}</ul></section>}
      <section className="owner-hub-visibility" aria-label="Hiển thị cho học viên"><h4>Hiển thị cho học viên</h4>
        {(() => {
          const row = visibilityRows.find(r => r.item_id === version.item_id && r.seq === version.seq);
          const canShow = version.status === "submitted" && version.review.decision === "approved" && version.seq === version.latest_seq;
          return <>
            <p>{row?.effective ? "Đang bật hiển thị cho phiên bản này." : row ? "Đã bật nhưng chưa có hiệu lực vì có lần duyệt mới hơn. Bật lại để áp dụng." : canShow ? "Phiên bản này đã duyệt và đang tắt." : "Cần duyệt phiên bản mới nhất trước khi bật hiển thị."}</p>
            {row && <button type="button" disabled={busy || uncertain} onClick={() => void setVisible(false)}>Tắt hiển thị</button>}
            {(canShow && (!row || !row.effective)) && (!visConfirm ? <button type="button" className="owner-primary" disabled={busy || uncertain} onClick={() => setVisConfirm(true)}>{row ? "Bật lại hiển thị" : "Bật hiển thị"}</button>
              : <span role="alertdialog" aria-label="Xác nhận bật hiển thị"><strong>Bật hiển thị phiên bản {version.seq}?</strong> <button type="button" className="owner-primary" disabled={busy} onClick={() => void setVisible(true)}>Xác nhận bật</button> <button type="button" onClick={() => setVisConfirm(false)}>Hủy</button></span>)}
            <p className="owner-hub-note">Công tắc chỉ có hiệu lực khi bật sau lần duyệt gần nhất. Mỗi nội dung chỉ có một phiên bản đang bật. App học viên đọc kho nội dung ở giai đoạn 4; hiện app vẫn dùng nội dung trong mã.</p></>;
        })()}
      </section>

      <form onSubmit={saveReview} aria-label="Phiếu duyệt">
        <fieldset disabled={busy || uncertain || !canReview}><legend>Khai báo của Owner (tự gõ, bắt buộc)</legend>
          {!canReview && <p className="owner-hub-note">{version.status !== "submitted" ? "Tác giả chưa gửi duyệt phiên bản này." : "Chỉ duyệt phiên bản mới nhất."}</p>}
          <label className="owner-field">Chuyên môn và phạm vi của người duyệt<textarea required minLength={10} maxLength={1000} value={qualification} onChange={e => setQualification(e.target.value)} /></label>
          <label className="owner-field">Cơ sở duyệt nội dung<textarea required minLength={10} maxLength={2000} value={basis} onChange={e => setBasis(e.target.value)} /></label>
          <label className="owner-field">Cơ sở bản quyền<textarea required minLength={10} maxLength={2000} value={rights} onChange={e => setRights(e.target.value)} /></label>
          <div className="owner-review-checks">{reviewChecks.map(k => <label key={k}><input type="checkbox" checked={checks[k]} onChange={e => setChecks({ ...checks, [k]: e.target.checked })} /><span>{checkLabels[k]}</span></label>)}</div>
          {version.author_kind === "teacher" && <label className="owner-field">Ghi chú gửi tác giả (bắt buộc khi yêu cầu sửa)<textarea aria-label="Ghi chú gửi tác giả" maxLength={1000} value={authorNote} onChange={e => setAuthorNote(e.target.value)} /></label>}
          <label className="owner-field">Quyết định<select aria-label="Quyết định" value={decision} onChange={e => setDecision(e.target.value as typeof decision)}>
            <option value="changes_requested">Yêu cầu tác giả sửa</option><option value="approved">Duyệt phiên bản này</option><option value="withdrawn">Rút kết quả duyệt</option></select></label>
          <button type="submit" className="owner-primary" disabled={!needsAll}>Ghi kết quả duyệt</button>
          <p className="owner-hub-note">Duyệt chưa làm nội dung hiện lên app. Bạn tự gõ khai báo cho từng phiên bản, kể cả nội dung bạn soạn.</p>
        </fieldset>
      </form>
    </article>}
  </section>;
}
