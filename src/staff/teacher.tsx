import { lastOf } from "../compat";
import { lazy, Suspense, useEffect, useRef, useState, type FormEvent } from "react";
import type { Session } from "@supabase/supabase-js";
import { authRedirectUrl, backendConfigured, getSupabaseClient } from "../backend/supabase";
import { readEmailLocale, rememberEmailLocale } from "../backend/emailLocale";
import { EmailLanguageSelect } from "../backend/EmailLanguageSelect";
import markUrl from "../../brand/assets/mark-forest.svg";
import "./teacher.css";
import { TeacherCollaborationPanel } from "./TeacherCollaborationPanel";
const ContentReviewPanel = lazy(() => import("./ContentReviewPanel"));
const TeacherContentPanel = lazy(() => import("./TeacherContentPanel"));

type DraftSummary = {
  session_id: string;
  version_id: string;
  version_no: number;
  title: string;
  locale: "vi-VN";
  status: "draft";
  updated_at: string;
};

type SegmentForm = {
  startSeconds: number;
  endSeconds: number;
  movementName: string;
  cueText: string;
  stopCue: string;
  breathCue: string;
  variantRef: string;
};

type DraftForm = {
  sessionId: string | null;
  expectedVersion: number | null;
  title: string;
  summary: string;
  objective: string;
  level: string;
  intensity: string;
  pace: string;
  instructionDensity: string;
  durationMinutes: number;
  props: string;
  spaceRequirement: string;
  floorContact: string;
  positions: string;
  learningFocus: string;
  segments: SegmentForm[];
};

type SavedDocument = DraftForm & {
  sessionId: string;
  expectedVersion: number;
  versionId: string;
  updatedAt: string;
};

type FunctionFailure = { error?: unknown };

class TeacherWorkspaceError extends Error {
  constructor(readonly code: string) { super(code); }
}

function teacherAuthRedirectUrl(emailLocale?: ReturnType<typeof readEmailLocale>) {
  return authRedirectUrl("teacher", emailLocale);
}

const emptyDraft = (): DraftForm => ({
  sessionId: null,
  expectedVersion: null,
  title: "",
  summary: "",
  objective: "",
  level: "Cơ bản",
  intensity: "Nhẹ",
  pace: "Chậm",
  instructionDensity: "Vừa phải",
  durationMinutes: 5,
  props: "",
  spaceRequirement: "",
  floorContact: "",
  positions: "",
  learningFocus: "",
  segments: [{ startSeconds: 0, endSeconds: 60, movementName: "", cueText: "", stopCue: "", breathCue: "", variantRef: "" }],
});

async function readFailureCode(error: unknown): Promise<string> {
  const context = (error as { context?: unknown } | null)?.context;
  if (!(context instanceof Response)) return "teacher_service_unavailable";
  try {
    const body = await context.clone().json() as FunctionFailure;
    return typeof body.error === "string" ? body.error : "teacher_service_unavailable";
  } catch {
    return "teacher_service_unavailable";
  }
}

async function invokeTeacher<T>(body: Record<string, unknown>): Promise<T> {
  if (!backendConfigured) throw new TeacherWorkspaceError("teacher_workspace_unavailable");
  const client = await getSupabaseClient();
  if (!client) throw new TeacherWorkspaceError("teacher_workspace_unavailable");
  const { data, error } = await client.functions.invoke("teacher-control-plane", { body });
  if (error) throw new TeacherWorkspaceError(await readFailureCode(error));
  if (!data || typeof data !== "object") throw new TeacherWorkspaceError("teacher_service_unavailable");
  return data as T;
}

function messageFor(error: unknown): string {
  const code = error instanceof TeacherWorkspaceError ? error.code : "teacher_service_unavailable";
  if (code === "workspace_access_required") return "Tài khoản này chưa có lời mời giáo viên đang hiệu lực. Đăng nhập không tự cấp quyền soạn bài.";
  if (code === "account_profile_required") return "Hãy hoàn thiện tên hiển thị trong hồ sơ tài khoản rồi thử mở workspace lại.";
  if (code === "workspace_conflict") return "Bản nháp đã được cập nhật ở nơi khác. Nội dung bạn đang sửa vẫn được giữ trên màn hình; hãy tải phiên bản đã lưu trước khi tiếp tục.";
  if (code === "draft_not_found") return "Không tìm thấy bản nháp này hoặc bạn không còn quyền truy cập.";
  if (code === "draft_save_limit_reached") return "Bạn đã đạt giới hạn 20 lần lưu trong 24 giờ. Nội dung hiện tại vẫn ở trên màn hình; hãy thử lưu lại sau.";
  if (code === "invalid_draft") return "Một vài mục chưa đúng giới hạn cho phép. Hãy kiểm tra tiêu đề, thời lượng và các đoạn hướng dẫn.";
  return "Workspace soạn bài chưa sẵn sàng hoặc đang tạm gián đoạn. Chưa có thay đổi nào được xác nhận là đã lưu.";
}

function stringList(value: string, maximumCount: number, maximumLength: number): string[] | null {
  const result = value.split(/[\n,]/).map(item => item.trim()).filter(Boolean);
  if (result.length > maximumCount || result.some(item => item.length > maximumLength)) return null;
  return result;
}

function validationError(form: DraftForm): string | null {
  if (!form.title.trim() || form.title.trim().length > 120) return "Tiêu đề cần có nội dung và không quá 120 ký tự.";
  if (form.summary.length > 1000 || form.objective.length > 1000) return "Tóm tắt và mục tiêu không được vượt quá 1.000 ký tự.";
  if (!Number.isInteger(form.durationMinutes) || form.durationMinutes < 1 || form.durationMinutes > 60) return "Thời lượng cần từ 1 đến 60 phút.";
  if (form.segments.length < 1 || form.segments.length > 40) return "Bài học cần có từ 1 đến 40 đoạn hướng dẫn.";
  if (!stringList(form.props, 12, 80) || !stringList(form.positions, 8, 80) || !stringList(form.learningFocus, 12, 120)) return "Kiểm tra số lượng và độ dài của các danh sách dụng cụ, tư thế và trọng tâm.";
  let previousEnd = 0;
  for (const [index, segment] of form.segments.entries()) {
    if (!segment.movementName.trim() || segment.movementName.length > 120) return `Đoạn ${index + 1}: hãy nhập tên chuyển động (tối đa 120 ký tự).`;
    if (segment.cueText.length > 600 || segment.stopCue.length > 400 || segment.breathCue.length > 400 || segment.variantRef.length > 100) return `Đoạn ${index + 1}: một trường hướng dẫn vượt quá giới hạn ký tự.`;
    if (!Number.isInteger(segment.startSeconds) || !Number.isInteger(segment.endSeconds)
      || segment.startSeconds < previousEnd || segment.endSeconds <= segment.startSeconds
      || segment.endSeconds > form.durationMinutes * 60) return `Đoạn ${index + 1}: thời gian phải nối tiếp, tăng dần và nằm trong tổng thời lượng.`;
    previousEnd = segment.endSeconds;
  }
  return null;
}

function toPayload(form: DraftForm) {
  return {
    session_id: form.sessionId,
    expected_version: form.expectedVersion,
    locale: "vi-VN",
    title: form.title.trim(),
    summary: form.summary.trim(),
    objective: form.objective.trim(),
    level: form.level.trim(),
    intensity: form.intensity.trim(),
    pace: form.pace.trim(),
    instruction_density: form.instructionDensity.trim(),
    duration_seconds: form.durationMinutes * 60,
    props: stringList(form.props, 12, 80) ?? [],
    space_requirement: form.spaceRequirement.trim(),
    floor_contact: form.floorContact.trim(),
    positions: stringList(form.positions, 8, 80) ?? [],
    learning_focus: stringList(form.learningFocus, 12, 120) ?? [],
    segments: form.segments.map((segment, index) => ({
      position: index + 1,
      start_ms: segment.startSeconds * 1000,
      end_ms: segment.endSeconds * 1000,
      movement_name: segment.movementName.trim(),
      cue_text: segment.cueText.trim(),
      stop_cue: segment.stopCue.trim(),
      breath_cue: segment.breathCue.trim(),
      variant_ref: segment.variantRef.trim(),
    })),
  };
}

function fromPayload(value: Record<string, unknown>): SavedDocument {
  const segments = Array.isArray(value.segments) ? value.segments as Record<string, unknown>[] : [];
  return {
    sessionId: String(value.session_id),
    expectedVersion: Number(value.version_no),
    versionId: String(value.version_id),
    updatedAt: String(value.updated_at),
    title: String(value.title ?? ""),
    summary: String(value.summary ?? ""),
    objective: String(value.objective ?? ""),
    level: String(value.level ?? ""),
    intensity: String(value.intensity ?? ""),
    pace: String(value.pace ?? ""),
    instructionDensity: String(value.instruction_density ?? ""),
    durationMinutes: Math.max(1, Math.ceil(Number(value.duration_seconds ?? 300) / 60)),
    props: Array.isArray(value.props) ? value.props.join("\n") : "",
    spaceRequirement: String(value.space_requirement ?? ""),
    floorContact: String(value.floor_contact ?? ""),
    positions: Array.isArray(value.positions) ? value.positions.join("\n") : "",
    learningFocus: Array.isArray(value.learning_focus) ? value.learning_focus.join("\n") : "",
    segments: segments.map(segment => ({
      startSeconds: Math.round(Number(segment.start_ms ?? 0) / 1000),
      endSeconds: Math.round(Number(segment.end_ms ?? 0) / 1000),
      movementName: String(segment.movement_name ?? ""),
      cueText: String(segment.cue_text ?? ""),
      stopCue: String(segment.stop_cue ?? ""),
      breathCue: String(segment.breath_cue ?? ""),
      variantRef: String(segment.variant_ref ?? ""),
    })),
  };
}

function validSummary(value: unknown): value is DraftSummary {
  if (!value || typeof value !== "object") return false;
  const draft = value as Partial<DraftSummary>;
  return typeof draft.session_id === "string" && typeof draft.version_id === "string"
    && Number.isInteger(draft.version_no) && typeof draft.title === "string"
    && draft.locale === "vi-VN" && draft.status === "draft"
    && typeof draft.updated_at === "string" && Number.isFinite(Date.parse(draft.updated_at));
}

export function TeacherWorkspace() {
  const [session, setSession] = useState<Session | null>(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const [loadingWorkspace, setLoadingWorkspace] = useState(false);
  const [sendingLink, setSendingLink] = useState(false);
  const [saving, setSaving] = useState(false);
  const [email, setEmail] = useState("");
  const [emailLocale, setEmailLocale] = useState(readEmailLocale);
  const [linkSent, setLinkSent] = useState(false);
  const [accessState, setAccessState] = useState<"unknown" | "active" | "denied" | "unavailable">("unknown");
  const [collaborationReadyUserId, setCollaborationReadyUserId] = useState<string | null>(null);
  const [contentReviewOpen, setContentReviewOpen] = useState(false);
  // "Bài video của tôi" opens first: it is the only place a lesson (with its YouTube link) can be sent to the Owner and published.
  const [myLessonsOpen, setMyLessonsOpen] = useState(true);
  const [drafts, setDrafts] = useState<DraftSummary[]>([]);
  const [form, setForm] = useState<DraftForm | null>(null);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [conflictDraftId, setConflictDraftId] = useState<string | null>(null);
  const sessionUserId = session?.user.id ?? null;
  const currentSessionUserId = useRef(sessionUserId);
  const draftReadGeneration = useRef(0);
  const draftSaveGeneration = useRef(0);
  if (currentSessionUserId.current !== sessionUserId) {
    currentSessionUserId.current = sessionUserId;
    draftReadGeneration.current += 1;
    draftSaveGeneration.current += 1;
  }
  const beginDraftRead = () => {
    const requestUserId = sessionUserId;
    const requestGeneration = ++draftReadGeneration.current;
    return () => currentSessionUserId.current === requestUserId
      && draftReadGeneration.current === requestGeneration;
  };
  const beginDraftSave = () => {
    const requestUserId = sessionUserId;
    const requestGeneration = ++draftSaveGeneration.current;
    return () => currentSessionUserId.current === requestUserId
      && draftSaveGeneration.current === requestGeneration;
  };

  useEffect(() => () => {
    draftReadGeneration.current += 1;
    draftSaveGeneration.current += 1;
  }, []);

  useEffect(() => {
    document.title = "Workspace giáo viên · Một chút yoga";
    document.documentElement.lang = "vi";
    return () => { document.title = "Một chút yoga"; };
  }, []);

  useEffect(() => {
    if (!backendConfigured) {
      setLoadingSession(false);
      setAccessState("unavailable");
      return;
    }
    let active = true;
    let unsubscribe: (() => void) | null = null;
    void (async () => {
      try {
        const client = await getSupabaseClient();
        if (!active) return;
        if (!client) {
          setAccessState("unavailable");
          setLoadingSession(false);
          return;
        }
        const listener = client.auth.onAuthStateChange((_event, nextSession) => {
          if (!active) return;
          setSession(nextSession);
          setLinkSent(false);
        });
        unsubscribe = () => listener.data.subscription.unsubscribe();
        const { data, error: sessionError } = await client.auth.getSession();
        if (!active) return;
        if (!sessionError) setSession(data.session);
        else setError("Chưa xác thực được phiên đăng nhập. Hãy tải lại workspace.");
        setLoadingSession(false);
      } catch {
        if (active) {
          setAccessState("unavailable");
          setError("Chưa tải được kết nối xác thực. Hãy thử lại sau.");
          setLoadingSession(false);
        }
      }
    })();
    return () => { active = false; unsubscribe?.(); };
  }, []);

  useEffect(() => {
    if (!session) {
      setAccessState(backendConfigured ? "unknown" : "unavailable");
      setLoadingWorkspace(false);
      setSaving(false);
      setDrafts([]);
      setForm(null);
      setConflictDraftId(null);
      return;
    }
    let active = true;
    setLoadingWorkspace(true);
    setSaving(false);
    setAccessState("unknown");
    setDrafts([]);
    setForm(null);
    setConflictDraftId(null);
    setError("");
    setNotice("");
    void (async () => {
      try {
        let result: { drafts?: unknown };
        try {
          result = await invokeTeacher({ action: "list_drafts" });
        } catch (cause) {
          if (!(cause instanceof TeacherWorkspaceError) || cause.code !== "workspace_access_required") throw cause;
          await invokeTeacher({ action: "accept_invite" });
          result = await invokeTeacher({ action: "list_drafts" });
        }
        if (!Array.isArray(result.drafts) || result.drafts.length > 100 || !result.drafts.every(validSummary)) {
          throw new TeacherWorkspaceError("teacher_service_unavailable");
        }
        if (active) {
          setDrafts(result.drafts);
          setAccessState("active");
        }
      } catch (cause) {
        if (active) {
          const code = cause instanceof TeacherWorkspaceError ? cause.code : "teacher_service_unavailable";
          setAccessState(code === "workspace_access_required" ? "denied" : "unavailable");
          setError(messageFor(cause));
        }
      } finally {
        if (active) setLoadingWorkspace(false);
      }
    })();
    return () => { active = false; };
  }, [session]);

  const signIn = async (event: FormEvent) => {
    event.preventDefault();
    if (!backendConfigured || !email.trim() || sendingLink) return;
    setSendingLink(true);
    setError("");
    setNotice("");
    try {
      const client = await getSupabaseClient();
      if (!client) throw new Error("not_configured");
      const { error: authError } = await client.auth.signInWithOtp({
        email: email.trim(),
        options: { emailRedirectTo: teacherAuthRedirectUrl(emailLocale), shouldCreateUser: false },
      });
      if (authError) throw authError;
      setLinkSent(true);
    } catch {
      setError("Chưa gửi được liên kết xác minh. Hãy kiểm tra địa chỉ email hoặc thử lại sau.");
    } finally {
      setSendingLink(false);
    }
  };

  const replaceEditor = (nextForm: DraftForm | null) => {
    // Selecting another document supersedes both reads and saves for this editor.
    // A request already sent may finish on the server, but cannot rebind this form.
    draftReadGeneration.current += 1;
    draftSaveGeneration.current += 1;
    setSaving(false);
    setLoadingWorkspace(false);
    setForm(nextForm);
    setError("");
    setNotice("");
    setConflictDraftId(null);
  };

  const openDraft = async (summary: DraftSummary) => {
    replaceEditor(null);
    const isCurrentRequest = beginDraftRead();
    setError("");
    setNotice("");
    setConflictDraftId(null);
    setLoadingWorkspace(true);
    try {
      const result = await invokeTeacher<{ draft?: unknown }>({ action: "read_draft", session_id: summary.session_id });
      if (!isCurrentRequest()) return;
      if (!result.draft || typeof result.draft !== "object") throw new TeacherWorkspaceError("teacher_service_unavailable");
      setForm(fromPayload(result.draft as Record<string, unknown>));
    } catch (cause) {
      if (isCurrentRequest()) setError(messageFor(cause));
    } finally {
      if (isCurrentRequest()) setLoadingWorkspace(false);
    }
  };

  const saveDraft = async (event: FormEvent) => {
    event.preventDefault();
    if (!form || saving) return;
    const problem = validationError(form);
    if (problem) {
      setError(problem);
      setNotice("");
      return;
    }
    setSaving(true);
    setError("");
    setNotice("");
    setConflictDraftId(null);
    const isCurrentRequest = beginDraftSave();
    try {
      const result = await invokeTeacher<{ draft?: unknown }>({ action: "save_draft", draft: toPayload(form) });
      if (!isCurrentRequest()) return;
      if (!validSummary(result.draft)) throw new TeacherWorkspaceError("teacher_service_unavailable");
      const saved = result.draft;
      setForm(current => current ? { ...current, sessionId: saved.session_id, expectedVersion: saved.version_no } : current);
      setDrafts(current => [saved, ...current.filter(item => item.session_id !== saved.session_id)]
        .sort((left, right) => Date.parse(right.updated_at) - Date.parse(left.updated_at)));
      setNotice("Bản nháp riêng đã được lưu. Bài chưa xuất hiện trong thư viện học viên và chưa có chức năng publish.");
    } catch (cause) {
      if (isCurrentRequest()) {
        setError(messageFor(cause));
        if (cause instanceof TeacherWorkspaceError && cause.code === "workspace_conflict" && form.sessionId) setConflictDraftId(form.sessionId);
      }
    } finally {
      if (isCurrentRequest()) setSaving(false);
    }
  };

  const reloadAfterConflict = async () => {
    const summary = drafts.find(item => item.session_id === conflictDraftId);
    if (summary) await openDraft(summary);
  };

  const signOut = async () => {
    try {
      const client = await getSupabaseClient();
      if (!client) return;
      const { error: signOutError } = await client.auth.signOut();
      if (signOutError) setError("Chưa đăng xuất được. Hãy thử lại.");
    } catch {
      setError("Chưa đăng xuất được. Hãy thử lại.");
    }
  };

  const updateForm = (field: keyof Omit<DraftForm, "segments">, value: string | number) => {
    setForm(current => current ? { ...current, [field]: value } : current);
  };

  const updateSegment = (index: number, field: keyof SegmentForm, value: string | number) => {
    setForm(current => current ? {
      ...current,
      segments: current.segments.map((segment, segmentIndex) => segmentIndex === index ? { ...segment, [field]: value } : segment),
    } : current);
  };

  const addSegment = () => setForm(current => {
    if (!current || current.segments.length >= 40) return current;
    const startSeconds = lastOf(current.segments)?.endSeconds ?? 0;
    return { ...current, segments: [...current.segments, { startSeconds, endSeconds: Math.min(startSeconds + 30, current.durationMinutes * 60), movementName: "", cueText: "", stopCue: "", breathCue: "", variantRef: "" }] };
  });

  const removeSegment = (index: number) => setForm(current => current
    ? { ...current, segments: current.segments.filter((_, segmentIndex) => segmentIndex !== index) }
    : current);

  return <div className="teacher-shell">
    <header className="teacher-topbar">
      <a className="teacher-brand" href="/" aria-label="Một chút yoga, về ứng dụng học viên">
        <img src={markUrl} alt="" /><span>Một chút yoga<small>GIÁO VIÊN · STAGING</small></span>
      </a>
      <div className="teacher-top-actions">
        {session && <><span className="teacher-account">{session.user.email}</span><button type="button" className="teacher-link-button" onClick={() => { void signOut(); }}>Đăng xuất</button></>}
        <a className="teacher-link-button" href="/" aria-label="Mở ứng dụng học viên">Học viên</a>
      </div>
    </header>

    {!backendConfigured && <main className="teacher-main"><section className="teacher-state-card"><span className="teacher-kicker">CHƯA KẾT NỐI</span><h1>Workspace giáo viên chưa sẵn sàng.</h1><p>Môi trường này chưa có cấu hình Supabase. Chưa thể xác minh tài khoản hoặc lưu nội dung.</p></section></main>}
    {backendConfigured && loadingSession && <main className="teacher-main"><section className="teacher-state-card" role="status"><span className="teacher-kicker">XÁC THỰC</span><h1>Đang kiểm tra phiên đăng nhập…</h1></section></main>}
    {backendConfigured && !loadingSession && !session && <main className="teacher-main teacher-auth-main">
      <section className="teacher-intro"><span className="teacher-kicker">SOẠN NỘI DUNG · CHỈ DÀNH CHO GIÁO VIÊN ĐƯỢC MỜI</span><h1>Mỗi bài học, một nhịp riêng.</h1><p>Đăng nhập bằng email đã xác minh. Quyền giáo viên chỉ được kích hoạt qua lời mời đã kiểm tra ở máy chủ; workspace này không có đăng ký giáo viên mở.</p><div className="teacher-staging-badge"><i />MÔI TRƯỜNG STAGING · KHÔNG PHẢI PRODUCTION</div></section>
      <form className="teacher-panel teacher-auth-card" onSubmit={event => { void signIn(event); }}><h2>Đăng nhập workspace</h2><p>Nếu tài khoản chưa có lời mời đang hiệu lực, bạn sẽ không được vào phần soạn bài.</p><label htmlFor="teacher-email">Email tài khoản</label><input id="teacher-email" type="email" autoComplete="email" required value={email} onChange={event => setEmail(event.target.value)} /><EmailLanguageSelect value={emailLocale} disabled={sendingLink} onChange={locale => { setEmailLocale(locale); rememberEmailLocale(locale); }} /><button className="teacher-primary" type="submit" disabled={sendingLink}>{sendingLink ? "Đang gửi…" : "Gửi liên kết xác minh"}</button>
        {linkSent && <p className="teacher-success" role="status">Nếu địa chỉ email đủ điều kiện đăng nhập, liên kết xác minh đã được gửi. Mở liên kết trên thiết bị này rồi quay lại workspace.</p>}
        {error && <p className="teacher-error" role="alert">{error}</p>}</form>
    </main>}

    {backendConfigured && session && <main className="teacher-main">
      <section className="teacher-intro teacher-workspace-intro"><span className="teacher-kicker">KHÔNG GIAN SOẠN BÀI</span><h1>Bài học của bạn.</h1><p>Bản nháp được lưu riêng cho tài khoản có quyền. Chỉ soạn nội dung có căn cứ quyền sử dụng; mọi bản nháp cần được rà soát riêng trước khi có thể đến với học viên.</p><div className="teacher-staging-badge"><i />MÔI TRƯỜNG STAGING · KHÔNG PHẢI PRODUCTION</div></section>
      <nav className="owner-workspace-tabs" aria-label="Chức năng giáo viên"><button type="button" className="teacher-secondary" aria-pressed={myLessonsOpen} onClick={() => { setContentReviewOpen(false); setMyLessonsOpen(true); }}>Bài video của tôi</button><button type="button" className="teacher-secondary" aria-pressed={!contentReviewOpen && !myLessonsOpen} onClick={() => { setContentReviewOpen(false); setMyLessonsOpen(false); }}>Kịch bản nháp</button><button type="button" className="teacher-secondary" aria-pressed={contentReviewOpen} onClick={() => { setMyLessonsOpen(false); setContentReviewOpen(true); }}>Duyệt nội dung được giao</button></nav>
      {myLessonsOpen ? (loadingWorkspace || accessState === "unknown" ? <section className="teacher-state-card" role="status"><h2>Đang xác minh quyền giảng viên…</h2></section> : accessState === "denied" ? <section className="teacher-state-card"><span className="teacher-kicker">QUYỀN TRUY CẬP</span><h2>Chưa có lời mời giáo viên.</h2><p>{error}</p><p>Email đã xác minh không tự cấp quyền giáo viên. Nếu bạn nghĩ đây là nhầm lẫn, hãy liên hệ Owner qua kênh hỗ trợ đã được xác nhận.</p></section> : <Suspense fallback={<p role="status">Đang mở bài video của tôi…</p>}><TeacherContentPanel key={session.user.id} userId={session.user.id} /></Suspense>) : contentReviewOpen ? <Suspense fallback={<p role="status">Đang mở phiếu duyệt…</p>}><ContentReviewPanel key={session.user.id} userId={session.user.id} /></Suspense> : <>
      <p className="teacher-privacy-note" data-testid="script-draft-note">Kịch bản nháp (các đoạn có mốc giờ, lời dẫn, lưu ý dừng lại) chỉ lưu riêng cho bạn: chưa gắn với video, chưa gửi Owner duyệt và chưa hiện với học viên. Để đưa bài lên ứng dụng, dùng thẻ “Bài video của tôi”.</p>
      <TeacherCollaborationPanel userId={session.user.id} onReadyChange={setCollaborationReadyUserId} />
      {collaborationReadyUserId !== session.user.id && loadingWorkspace && <section className="teacher-state-card" role="status"><h2>Đang xác minh quyền và tải bản nháp…</h2></section>}
      {collaborationReadyUserId !== session.user.id && !loadingWorkspace && accessState === "denied" && <section className="teacher-state-card"><span className="teacher-kicker">QUYỀN TRUY CẬP</span><h2>Chưa có lời mời giáo viên.</h2><p>{error}</p><p>Email đã xác minh không tự cấp quyền giáo viên. Nếu bạn nghĩ đây là nhầm lẫn, hãy liên hệ Owner qua kênh hỗ trợ đã được xác nhận.</p></section>}
      {collaborationReadyUserId !== session.user.id && !loadingWorkspace && accessState === "unavailable" && <section className="teacher-state-card"><span className="teacher-kicker">DỊCH VỤ CHƯA SẴN SÀNG</span><h2>Chưa thể mở phần soạn bài.</h2><p>{error || "API workspace giáo viên chưa được triển khai hoặc đang tạm gián đoạn."}</p><p>Không có nội dung giả được hiển thị; chưa có quyền tải media hoặc publish.</p></section>}
      {collaborationReadyUserId !== session.user.id && !loadingWorkspace && accessState === "active" && <div className="teacher-workspace-grid">
        <aside className="teacher-panel teacher-draft-list" aria-label="Danh sách bản nháp riêng">
          <div className="teacher-list-heading"><div><span className="teacher-kicker">NỘI DUNG RIÊNG</span><h2>Bản nháp</h2></div><button className="teacher-secondary" type="button" onClick={() => { replaceEditor(emptyDraft()); }}>Bài mới</button></div>
          {drafts.length === 0 ? <div className="teacher-empty"><strong>Chưa có bản nháp.</strong><p>Bắt đầu một bài học mới. Nội dung chỉ được gửi khi bạn chọn lưu.</p></div> : <div className="teacher-draft-items">{drafts.map(draft => <button key={draft.session_id} type="button" className={`teacher-draft-item${form?.sessionId === draft.session_id ? " is-selected" : ""}`} onClick={() => { void openDraft(draft); }}>
            <strong>{draft.title}</strong><span>Nháp · phiên bản {draft.version_no}</span><time dateTime={draft.updated_at}>{new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(draft.updated_at))}</time>
          </button>)}</div>}
          <p className="teacher-privacy-note">Chỉ danh sách nháp thuộc tài khoản đã được server xác minh mới xuất hiện tại đây.</p>
        </aside>

        <section className="teacher-editor-column">
          {!form && <section className="teacher-state-card teacher-editor-empty"><span className="teacher-kicker">BẮT ĐẦU KHI BẠN SẴN SÀNG</span><h2>Soạn một bài học.</h2><p>Chọn một bản nháp để tiếp tục hoặc tạo bài mới. Nội dung chưa lưu chỉ nằm trong phiên trình duyệt hiện tại.</p><button className="teacher-primary" type="button" onClick={() => { replaceEditor(emptyDraft()); }}>Tạo bản nháp</button></section>}
          {form && <form className="teacher-panel teacher-editor" onSubmit={event => { void saveDraft(event); }}>
            <div className="teacher-editor-heading"><div><span className="teacher-kicker">{form.sessionId ? `BẢN NHÁP · PHIÊN BẢN ${form.expectedVersion}` : "BẢN NHÁP MỚI"}</span><h2>{form.title || "Bài học chưa đặt tên"}</h2><p>Lưu riêng tư để tiếp tục sau. Chưa có tải video, publish hay đưa vào thư viện học viên.</p></div><button type="button" className="teacher-quiet-button" onClick={() => { replaceEditor(null); }}>Đóng bản nháp</button></div>
            <label className="teacher-field">Tiêu đề bài học<input required maxLength={120} value={form.title} onChange={event => updateForm("title", event.target.value)} /></label>
            <label className="teacher-field">Tóm tắt<textarea rows={2} maxLength={1000} value={form.summary} onChange={event => updateForm("summary", event.target.value)} /></label>
            <label className="teacher-field">Mục tiêu học tập<textarea rows={2} maxLength={1000} value={form.objective} onChange={event => updateForm("objective", event.target.value)} /></label>
            <div className="teacher-form-grid">
              <label className="teacher-field">Trình độ<input maxLength={80} value={form.level} onChange={event => updateForm("level", event.target.value)} /></label>
              <label className="teacher-field">Cường độ<input maxLength={80} value={form.intensity} onChange={event => updateForm("intensity", event.target.value)} /></label>
              <label className="teacher-field">Nhịp độ<input maxLength={80} value={form.pace} onChange={event => updateForm("pace", event.target.value)} /></label>
              <label className="teacher-field">Mật độ hướng dẫn<input maxLength={80} value={form.instructionDensity} onChange={event => updateForm("instructionDensity", event.target.value)} /></label>
              <label className="teacher-field">Thời lượng · phút<input type="number" min={1} max={60} step={1} value={form.durationMinutes} onChange={event => updateForm("durationMinutes", Number(event.target.value))} /></label>
              <label className="teacher-field">Không gian cần có<input maxLength={240} value={form.spaceRequirement} onChange={event => updateForm("spaceRequirement", event.target.value)} /></label>
              <label className="teacher-field">Dụng cụ <small>Mỗi dòng một mục, tối đa 12.</small><textarea rows={2} value={form.props} onChange={event => updateForm("props", event.target.value)} /></label>
              <label className="teacher-field">Tiếp xúc với sàn <small>Ví dụ: đứng, ngồi hoặc nằm.</small><input maxLength={240} value={form.floorContact} onChange={event => updateForm("floorContact", event.target.value)} /></label>
              <label className="teacher-field">Tư thế liên quan <small>Mỗi dòng một mục, tối đa 8.</small><textarea rows={2} value={form.positions} onChange={event => updateForm("positions", event.target.value)} /></label>
              <label className="teacher-field">Trọng tâm học tập <small>Mỗi dòng một mục, tối đa 12.</small><textarea rows={2} value={form.learningFocus} onChange={event => updateForm("learningFocus", event.target.value)} /></label>
            </div>

            <section className="teacher-segments" aria-labelledby="teacher-segments-title">
              <div className="teacher-segments-heading"><div><span className="teacher-kicker">KỊCH BẢN BÀI HỌC</span><h3 id="teacher-segments-title">Các đoạn hướng dẫn <span>{form.segments.length}/40</span></h3></div><button type="button" className="teacher-secondary" disabled={form.segments.length >= 40} onClick={addSegment}>Thêm đoạn</button></div>
              {form.segments.map((segment, index) => <fieldset className="teacher-segment" key={index}><legend>Đoạn {index + 1}</legend>
                <div className="teacher-segment-top"><label className="teacher-field">Bắt đầu · giây<input type="number" min={0} step={1} value={segment.startSeconds} onChange={event => updateSegment(index, "startSeconds", Number(event.target.value))} /></label><label className="teacher-field">Kết thúc · giây<input type="number" min={1} step={1} value={segment.endSeconds} onChange={event => updateSegment(index, "endSeconds", Number(event.target.value))} /></label><label className="teacher-field teacher-movement-field">Chuyển động<input required maxLength={120} value={segment.movementName} onChange={event => updateSegment(index, "movementName", event.target.value)} /></label>{form.segments.length > 1 && <button type="button" className="teacher-remove-button" onClick={() => removeSegment(index)} aria-label={`Xóa đoạn ${index + 1}`}>Xóa đoạn</button>}</div>
                <label className="teacher-field">Lời hướng dẫn<textarea rows={2} maxLength={600} value={segment.cueText} onChange={event => updateSegment(index, "cueText", event.target.value)} /></label>
                <div className="teacher-form-grid teacher-segment-notes"><label className="teacher-field">Lưu ý dừng lại<textarea rows={2} maxLength={400} value={segment.stopCue} onChange={event => updateSegment(index, "stopCue", event.target.value)} /></label><label className="teacher-field">Gợi ý hơi thở<textarea rows={2} maxLength={400} value={segment.breathCue} onChange={event => updateSegment(index, "breathCue", event.target.value)} /></label><label className="teacher-field">Biến thể tham chiếu<input maxLength={100} value={segment.variantRef} onChange={event => updateSegment(index, "variantRef", event.target.value)} /></label></div>
              </fieldset>)}
            </section>
            {notice && <p className="teacher-success" role="status">{notice}</p>}
            {error && <div className="teacher-error" role="alert"><p>{error}</p>{conflictDraftId && <button type="button" className="teacher-secondary" onClick={() => { void reloadAfterConflict(); }}>Tải phiên bản đã lưu</button>}</div>}
          <div className="teacher-save-footer"><span>{form.sessionId ? `Lần lưu gần nhất: phiên bản ${form.expectedVersion}.` : "Bản nháp chưa được lưu."} Nội dung chỉ được xác nhận sau phản hồi thành công từ server.</span><button className="teacher-primary" type="submit" disabled={saving}>{saving ? "Đang lưu…" : "Lưu bản nháp riêng"}</button></div>
          </form>}
        </section>
      </div>}
      </>}
    </main>}

    <footer className="teacher-footer"><span>Quyền và quyền sở hữu nháp được kiểm tra ở server · không truy cập hồ sơ học viên</span><span>Chưa có upload media hoặc publish</span></footer>
  </div>;
}
