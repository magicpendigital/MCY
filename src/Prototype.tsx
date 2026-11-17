import { newId, lastOf } from "./compat";
import { installFocusGuard } from "./compat/focusGuard";
import { lazy, Suspense, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import "@fontsource/roboto/latin-400.css";
import "@fontsource/roboto/latin-700.css";
import "@fontsource/roboto/vietnamese-400.css";
import "@fontsource/roboto/vietnamese-500.css";
import "@fontsource/roboto/vietnamese-700.css";
import "@fontsource/source-serif-4/latin-400.css";
import "@fontsource/source-serif-4/latin-400-italic.css";
import "@fontsource/source-serif-4/latin-700.css";
import "@fontsource/source-serif-4/vietnamese-400.css";
import "@fontsource/source-serif-4/vietnamese-400-italic.css";
import { App as CapacitorApp } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";
import { bodyLevelLabel, formatMessage, guidedChoiceLabel, localizedNumber, msg, regionLabel, sideLabel, type AppLocale } from "./i18n";
import {
  ArrowLeftIcon, ArrowRightIcon, CheckIcon,
  InfoCircledIcon,
  PersonIcon, ReaderIcon,
} from "@radix-ui/react-icons";
import { BottomSheet, Carousel, FlowStack, KeyboardInput, KeyboardTextarea, MobileScroll, type FlowScreen, useFlow, useKeyboard } from "./mobile";
import { backendConfigured, clientChannel, getAccountBoundSupabaseClient, getSupabaseClient, shouldInitializeAuthForCurrentLaunch } from "./backend/supabase";
import { checkNewPassword, PASSWORD_CHECK_MESSAGES, passwordChangeMessage } from "./backend/passwordAuth";
import { observeLearnerSession } from "./backend/learnerSession";
import { rememberNativeAuthUrl } from "./backend/nativeAuth";
import { isWebAuthCallback } from "./backend/authRouting";
import { BODY_REGIONS, bodyRegionCodes, isPairedBodyRegion, removeBodyObservation, replaceBodyObservation, type BodyRegion, type BodySide } from "./bodyRegions";
import {
  deleteLearnerCheckin,
  CONSENT_POLICY_VERSIONS,
  emptyConsentState,
  hasCurrentConsentForPurpose,
  loadLearnerSnapshot,
  hasCurrentRequiredConsent,
  REQUIRED_CONSENT_POLICY_VERSIONS,
  deleteMyAccount,
  saveConsentEvent,
  type ConsentPurpose,
} from "./backend/learnerData";
import type { PracticeContext } from "../supabase/functions/_shared/practiceContract";
import { rememberedPace } from "./practice/feedbackMemory";
import type { DemoState, Observation, Outcome, Pace } from "./app/model";
import { clearAccountScopedState, DemoContext, initialState, useDemo } from "./app/state";
import { AUTH_SIGN_IN_EVENT, SESSION_RESTORE_RETRY_EVENT } from "./app/events";
import { hasCurrentAiConsent, latestFeedback, normalizeAuthDestination } from "./app/predicates";
import { useLearnerContinuation } from "./app/useLearnerContinuation";
import { makeSnapshot, snapshotFromDatabase } from "./app/snapshots";
import { consentStateForDemo, persistProfile } from "./app/persistence";
import { handleNativeAuthUrl } from "./app/auth";
import { Action, Choice, DemoNote, Eyebrow } from "./app/ui/controls";
import { Header } from "./app/ui/Header";
import { BodyMap } from "./app/body/BodyMap";
import { BodyStylePicker } from "./app/body/BodyStylePicker";
import { RegionEditor } from "./app/body/RegionEditor";
import { finishAtAuthDestination, RoutesContext } from "./app/navigation";
import { FlowRouteFocusManager, withFlowScreenAccessibility } from "./app/accessibility";
import { RouteSuspense } from "./app/RouteSuspense";
import { BottomNav } from "./app/BottomNav";
import { WelcomeScreen } from "./screens/welcome/WelcomeScreen";
import { WelcomeFooter } from "./screens/welcome/WelcomeFooter";
import { ConsentScreen } from "./screens/consent/ConsentScreen";
import { ConsentFooter } from "./screens/consent/ConsentFooter";
import { OnboardingScreen } from "./screens/onboarding/OnboardingScreen";
import { HomeScreen } from "./screens/home/HomeScreen";
import { CheckinScreen } from "./screens/checkin/CheckinScreen";
import { CheckinFooter } from "./screens/checkin/CheckinFooter";
import { AuthEmailScreen } from "./screens/auth/AuthEmailScreen";
import { AuthCodeScreen } from "./screens/auth/AuthCodeScreen";

const OwnerWorkspace = lazy(() => import("./staff/owner").then(module => ({ default: module.OwnerWorkspace })));
const TeacherWorkspace = lazy(() => import("./staff/teacher").then(module => ({ default: module.TeacherWorkspace })));
const CourseDetailScreen = lazy(() => import("./courses/CourseDetailScreen"));
const DiscoverScreen = lazy(() => import("./courses/DiscoverScreen"));
const LazyJourneyScreen = lazy(() => import("./JourneyScreen"));
const PracticeFlowScreen = lazy(() => import("./practice/PracticeFlowScreen"));
const ReadingPreviewScreen = lazy(() => import("./library/ReadingPreviewScreen"));
const ReadingLibraryScreen = lazy(() => import("./library/ReadingLearnerScreens").then(module => ({ default: module.ReadingLibraryScreen })));
const ReadingLessonScreen = lazy(() => import("./library/ReadingLearnerScreens").then(module => ({ default: module.ReadingLessonScreen })));
const ReadingLessonFooter = lazy(() => import("./library/ReadingLearnerScreens").then(module => ({ default: module.ReadingLessonFooter })));
const ReadingPublishScreen = lazy(() => import("./library/ReadingPublishScreen"));
const MyClassesScreen = lazy(() => import("./classes/MyClassesScreen"));
const ContentReviewWorkspace = lazy(() => import("./practice/ContentReviewWorkspace"));
const WebAuthCallback = lazy(() => import("./backend/AuthCallback"));

type HelpArticleId = "body-map" | "pause-video" | "journey-record" | "ai-scope";
const AI_OFF_PRIVACY_DETAIL = "Trợ lý chỉ hoạt động khi máy chủ xác nhận sẵn sàng và bạn đồng ý riêng. AI nhận lựa chọn được xác nhận của lượt hiện tại; không gửi hội thoại trước đó, tên/email, ghi chú tự do hay feedback lịch sử. AI chỉ chọn nội dung đã duyệt, không tạo động tác hoặc chẩn đoán. Khi tắt, không gửi yêu cầu mô hình.";
const HELP_ARTICLES: Array<{ id: HelpArticleId; title: string; detail: string; lead: string; paragraphs: string[] }> = [
  {
    id: "body-map",
    title: "Cách ghi nhận từng vùng cơ thể",
    detail: "Chọn vùng, bên và mức bạn muốn ghi",
    lead: "Check-in ghi lại điều bạn tự cảm nhận ở thời điểm hiện tại.",
    paragraphs: [
      "Chạm vào vùng trên hình hoặc chọn tên vùng trong danh sách để mở phần ghi nhận. Với vùng có hai bên, bạn có thể chọn trái, phải hoặc cả hai; mỗi bên được lưu riêng nếu cảm nhận khác nhau.",
      "Chọn mức phù hợp và thêm ghi chú nếu muốn. “Bình thường”, “Chưa rõ” và “Bỏ qua” là các lựa chọn riêng; vùng chưa chọn không được hiểu thành một phản hồi.",
    ],
  },
  {
    id: "pause-video",
    title: "Nếu muốn dừng giữa buổi",
    detail: "Bạn có thể dừng video bất cứ lúc nào",
    lead: "Bạn tự quyết định có tiếp tục hay không.",
    paragraphs: [
      "Dùng nút tạm dừng trong trình phát video, hoặc quay lại để chọn bài khác. MCY không xác nhận bạn đã xem hết video.",
      "Nếu một chuyển động không phù hợp với bạn, hãy dừng lại. Phản hồi sau buổi là tùy chọn và có thể ghi “không thay đổi”, “khó chịu hơn”, “chưa rõ” hoặc bỏ qua.",
    ],
  },
  {
    id: "journey-record",
    title: "Cách xem và xóa một bản ghi",
    detail: "Mở Hành trình để xem hoặc quản lý bản ghi",
    lead: "Hành trình chỉ hiển thị những gì bạn đã ghi nhận và cho phép lưu.",
    paragraphs: [
      "Mở Hành trình, chọn một ngày rồi chọn bản ghi cần xem. Bạn có thể xem các vùng đã ghi, bên cơ thể, mức tự chọn và ghi chú nếu có.",
      "Để xóa, mở bản ghi và chọn xóa; ứng dụng sẽ yêu cầu xác nhận trước khi gửi thao tác. Nếu dịch vụ chưa xác nhận, ứng dụng sẽ báo lỗi để bạn biết bản ghi chưa được xóa.",
    ],
  },
  {
    id: "ai-scope",
    title: "AI dùng check-in trong phạm vi nào?",
    detail: "Tìm hiểu trạng thái AI và quyền riêng tư",
    lead: "Trạng thái AI được máy chủ xác nhận trước khi gửi lựa chọn.",
    paragraphs: [
      "Khi trợ lý chưa sẵn sàng cho phiên của bạn, ứng dụng không gửi yêu cầu chọn buổi tới mô hình. Bạn vẫn có thể tự chọn các bài học video miễn phí.",
      "Khi trợ lý sẵn sàng, xử lý AI cần sự đồng ý riêng và chỉ nhận lựa chọn đã xác nhận trong lượt hiện tại. Hội thoại trước đó, tên, email, ghi chú tự do và feedback lịch sử không được gửi. Mô hình chỉ chọn nội dung đã duyệt, không tự tạo động tác hoặc chẩn đoán.",
    ],
  },
];

const HELP_ARTICLE_ROUTES: Record<HelpArticleId, FlowScreen> = withFlowScreenAccessibility({
  "body-map": { id: "help-body-map", header: () => <Header title="Hướng dẫn check-in" back />, headerHeight: 55, render: () => <HelpArticleScreen articleId="body-map" /> },
  "pause-video": { id: "help-pause-video", header: () => <Header title="Dừng giữa buổi" back />, headerHeight: 55, render: () => <HelpArticleScreen articleId="pause-video" /> },
  "journey-record": { id: "help-journey-record", header: () => <Header title="Quản lý bản ghi" back />, headerHeight: 55, render: () => <HelpArticleScreen articleId="journey-record" /> },
  "ai-scope": { id: "help-ai-scope", header: () => <Header title="AI và quyền riêng tư" back />, headerHeight: 55, render: () => <HelpArticleScreen articleId="ai-scope" /> },
});

const ROUTES: Record<string, FlowScreen> = withFlowScreenAccessibility({
  welcome: { id: "welcome", footer: () => <WelcomeFooter />, footerHeight: 156, render: () => <WelcomeScreen /> },
  home: { id: "home", header: () => <Header />, headerHeight: 55, footer: () => <BottomNav />, footerHeight: 68, render: () => <HomeScreen /> },
  checkin: { id: "checkin", header: () => <Header title="Check-in hôm nay" back />, headerHeight: 55, footer: () => <CheckinFooter />, footerHeight: 124, render: () => <CheckinScreen /> },
  dailyPractice: { id: "daily-practice", header: () => <Header title="Buổi học hôm nay" back />, headerHeight: 55, render: () => <PracticeRoute /> },
  reflection: { id: "reflection", header: () => <Header title="Phản hồi của bạn" back />, headerHeight: 55, footer: () => <ReflectionFooter />, footerHeight: 104, render: () => <ReflectionScreen /> },
  journey: { id: "journey", header: () => <Header />, headerHeight: 55, footer: () => <BottomNav />, footerHeight: 68, render: () => <JourneyRoute /> },
  discover: { id: "discover", header: () => <Header />, headerHeight: 55, footer: () => <BottomNav />, footerHeight: 68, render: () => <DiscoverRoute /> },
  profile: { id: "profile", header: () => <Header />, headerHeight: 55, footer: () => <BottomNav />, footerHeight: 68, render: () => <ProfileScreen /> },
  authEmail: { id: "auth-email", header: () => <Header title="Tài khoản" back />, headerHeight: 55, render: () => <AuthEmailScreen /> },
  authCode: { id: "auth-code", header: () => <Header title="Xác minh email" back />, headerHeight: 55, render: () => <AuthCodeScreen /> },
  consent: { id: "consent", header: () => <Header title="Quyền dữ liệu" back />, headerHeight: 55, footer: () => <ConsentFooter />, footerHeight: 164, render: () => <ConsentScreen /> },
  onboarding: { id: "onboarding", header: () => <Header title="Bắt đầu vừa đủ" back />, headerHeight: 55, render: () => <OnboardingScreen /> },
  editProfile: { id: "edit-profile", header: () => <Header title="Hồ sơ của bạn" back />, headerHeight: 55, render: () => <AccountDetailScreen panel="edit" /> },
  privacy: { id: "privacy", header: () => <Header title="Quyền riêng tư" back />, headerHeight: 55, render: () => <AccountDetailScreen panel="privacy" /> },
  memory: { id: "memory", header: () => <Header title="AI và điều được nhớ" back />, headerHeight: 55, render: () => <AccountDetailScreen panel="memory" /> },
  sharing: { id: "sharing", header: () => <Header title="Chia sẻ với giáo viên" back />, headerHeight: 55, render: () => <AccountDetailScreen panel="sharing" /> },
  security: { id: "security", header: () => <Header title="Bảo mật tài khoản" back />, headerHeight: 55, render: () => <AccountDetailScreen panel="security" /> },
  notifications: { id: "notifications", header: () => <Header title="Nhắc tập" back />, headerHeight: 55, render: () => <AccountDetailScreen panel="notifications" /> },
  access: { id: "access", header: () => <Header title="Nội dung và quyền" back />, headerHeight: 55, render: () => <AccountDetailScreen panel="access" /> },
  help: { id: "help", header: () => <Header title="Hướng dẫn và hỗ trợ" back />, headerHeight: 55, render: () => <AccountDetailScreen panel="help" /> },
  sync: { id: "sync", header: () => <Header title="Phản hồi sau tập" back />, headerHeight: 55, render: () => <SyncScreen /> },
  discoverDetail: { id: "discover-detail", header: () => <Header title="Chi tiết nội dung" back />, headerHeight: 55, render: () => <DiscoverDetailScreen /> },
  courseDetail: { id: "course-detail", header: () => <Header title="Khóa học miễn phí" back />, headerHeight: 55, render: () => <CourseDetailRoute /> },
  readingPreview: { id: "reading-preview", header: () => <Header title="Xem trước nội dung" back />, headerHeight: 55, render: () => <ReadingPreviewRoute /> },
  readingLibrary: { id: "reading-library", header: () => <Header title="Bài đọc có hình" back />, headerHeight: 55, render: () => <ReadingLibraryRoute /> },
  readingLesson: { id: "reading-lesson", header: () => <Header title="Bài đọc" back />, headerHeight: 55, footer: flow => <Suspense fallback={null}><ReadingLessonFooter onBack={() => flow.pop()} /></Suspense>, footerHeight: 88, render: () => <ReadingLessonRoute /> },
  readingPublish: { id: "reading-publish", header: () => <Header title="Hiển thị cho học viên" back />, headerHeight: 55, render: () => <ReadingPublishRoute /> },
  readiness: { id: "readiness", header: () => <Header title="Phạm vi hỗ trợ" back />, headerHeight: 55, render: () => <ReadinessScreen /> },
  myClasses: { id: "my-classes", header: () => <Header title="Lớp của tôi" back />, headerHeight: 55, render: () => <MyClassesRoute /> },
});

const readingFallback = <MobileScroll className="mcy-scroll"><main className="mcy-page"><div className="mcy-inline-note" role="status">Đang mở bài đọc…</div></main></MobileScroll>;
function ReadingLibraryRoute() {
  const flow = useFlow();
  return <RouteSuspense fallback={readingFallback}><ReadingLibraryScreen onOpened={() => flow.push(ROUTES.readingLesson)} /></RouteSuspense>;
}
function ReadingLessonRoute() {
  const flow = useFlow();
  return <RouteSuspense fallback={readingFallback}><ReadingLessonScreen onCheckin={() => flow.push(ROUTES.checkin)} onOpened={() => undefined} /></RouteSuspense>;
}
function ReadingPublishRoute() {
  const { state } = useDemo();
  if (!state.userId) return <MobileScroll className="mcy-scroll"><main className="mcy-page"><div className="mcy-inline-note" role="status">Đăng nhập để cấu hình hiển thị cho học viên.</div></main></MobileScroll>;
  return <RouteSuspense fallback={readingFallback}><ReadingPublishScreen key={state.userId} userId={state.userId} /></RouteSuspense>;
}

function MyClassesRoute() {
  const flow = useFlow();
  const { state } = useDemo();
  if (!state.userId) return <MobileScroll className="mcy-scroll"><main className="mcy-page"><div className="mcy-inline-note" role="status">Đăng nhập để xem lớp và nhận xét của bạn.</div></main></MobileScroll>;
  return <RouteSuspense fallback={<MobileScroll className="mcy-scroll"><main className="mcy-page"><div className="mcy-inline-note" role="status">Đang mở lớp…</div></main></MobileScroll>}>
    <MyClassesScreen key={state.userId} userId={state.userId} active={flow.current.id === ROUTES.myClasses.id} />
  </RouteSuspense>;
}

function ReadingPreviewRoute() {
  const flow = useFlow();
  const { state } = useDemo();
  if (!state.userId) return <MobileScroll className="mcy-scroll"><main className="mcy-page"><div className="mcy-inline-note" role="status">Đăng nhập để xem trước nội dung được giao cho bạn.</div></main></MobileScroll>;
  return <RouteSuspense fallback={<MobileScroll className="mcy-scroll"><main className="mcy-page"><div className="mcy-inline-note" role="status">Đang mở xem trước…</div></main></MobileScroll>}>
    <ReadingPreviewScreen key={state.userId} userId={state.userId} active={flow.current.id === ROUTES.readingPreview.id} />
  </RouteSuspense>;
}

function CourseDetailRoute() {
  const flow = useFlow();
  const { state, update } = useDemo();
  return <RouteSuspense fallback={<MobileScroll className="mcy-scroll"><main className="mcy-page"><div className="mcy-inline-note" role="status">{state.locale === "en-US" ? "Opening the lesson…" : "Đang mở bài học…"}</div></main></MobileScroll>}>
    <CourseDetailScreen
      locale={state.locale}
      selectedCourseId={state.selectedCourseId}
      selectedLessonId={state.selectedLessonId}
      active={flow.current.id === ROUTES.courseDetail.id}
      onSelectLesson={lessonId => update({ selectedLessonId: lessonId })}
      onRecordReflection={(courseTitle, lessonTitle) => {
        update({ checkinBaselineReady: false, reflectionHasCheckinBaseline: state.checkinBaselineReady, reflectionBeforeStatus: state.checkinBaselineReady ? state.bodyStatus : null, reflectionBeforeObservations: state.checkinBaselineReady ? [...state.preObservations] : [], reflectionLessonTitle: `${courseTitle} · ${lessonTitle}`, postObservations: [], postBodyStatus: null, outcome: null, pace: null, note: "", endedEarly: false });
        flow.push(ROUTES.reflection);
      }}
    />
  </RouteSuspense>;
}

function PracticeRoute() {
  const flow = useFlow();
  const { state, update } = useDemo();
  const context: Omit<PracticeContext, "revision" | "pace" | "guidance" | "floor"> = {
    locale: state.locale, minutes: state.minutes, energy: state.energy, intent: state.intent, bodyStatus: state.bodyStatus,
    regions: [...new Set(state.preObservations.flatMap(item => bodyRegionCodes(item.region, item.side)))],
  };
  return <RouteSuspense fallback={<MobileScroll className="mcy-scroll"><main className="mcy-page"><p role="status">Đang mở buổi học…</p></main></MobileScroll>}><PracticeFlowScreen
    context={context} userId={state.userId} consentCurrent={hasCurrentAiConsent(state)} active={flow.current.id === ROUTES.dailyPractice.id}
    previousWasTooFast={Boolean(rememberedPace(state.history, state.saveFeedbackConsent && state.rememberPace))}
    onBrowse={() => flow.push(ROUTES.discover)} onConsent={() => flow.push(ROUTES.privacy)} onAdjust={() => flow.pop()}
    onReflect={(title, endedEarly) => {
      update({ checkinBaselineReady: false, reflectionHasCheckinBaseline: state.checkinBaselineReady, reflectionBeforeStatus: state.checkinBaselineReady ? state.bodyStatus : null, reflectionBeforeObservations: state.checkinBaselineReady ? [...state.preObservations] : [], reflectionLessonTitle: title, postObservations: [], postBodyStatus: null, outcome: null, pace: null, note: "", endedEarly });
      flow.push(ROUTES.reflection);
    }}
  /></RouteSuspense>;
}

function PracticeCapabilityObserver() {
  const { state, setState } = useDemo();
  const user = useRef(state.userId); user.current = state.userId;
  useEffect(() => {
    const actor = state.userId;
    if (!actor || !state.signedIn) { setState(p => ({ ...p, aiCapability: "disabled" })); return; }
    const controller = new AbortController();
    setState(p => ({ ...p, aiCapability: "checking" }));
    void (async () => {
      let capability: DemoState["aiCapability"] = "disabled";
      try {
        const client = await getSupabaseClient();
        if (controller.signal.aborted || user.current !== actor) return;
        const response = await client?.functions.invoke("mcy-ai-assistant", { signal: controller.signal, body: { action: "capability" } });
        if (!response?.error && response?.data?.available === true && response.data.contractVersion === "reviewed-practice-1") capability = "ready";
        else if (response?.data?.reason === "not_ready") capability = "not_ready";
      } catch { /* fail closed, no provider request */ }
      if (!controller.signal.aborted && user.current === actor) setState(p => p.userId === actor ? { ...p, aiCapability: capability } : p);
    })();
    return () => controller.abort();
  }, [state.userId, state.signedIn, state.aiConsent, setState]);
  return null;
}

function DiscoverRoute() {
  const flow = useFlow();
  const { state, update } = useDemo();
  return <RouteSuspense fallback={<MobileScroll className="mcy-scroll"><main className="mcy-page"><div className="mcy-inline-note" role="status">{state.locale === "en-US" ? "Opening free lessons…" : "Đang mở bài học miễn phí…"}</div></main></MobileScroll>}>
    <DiscoverScreen
      locale={state.locale}
      onOpenCourse={(courseId, firstLessonId) => {
        update({ selectedCourseId: courseId, selectedLessonId: firstLessonId });
        flow.push(ROUTES.courseDetail);
      }}
      onOpenGuide={() => flow.push(ROUTES.discoverDetail)}
      onOpenReading={entry => {
        if (!entry) { flow.push(ROUTES.readingLibrary); return; }
        void import("./library/ReadingLearnerScreens").then(module => module.openReadingEntry(entry));
        flow.push(ROUTES.readingLesson);
      }}
      checkinRegions={state.preObservations.map(item => item.region)}
    />
  </RouteSuspense>;
}

function JourneyRoute() {
  const flow = useFlow();
  const { state, setState, update } = useDemo();
  return <RouteSuspense fallback={<MobileScroll className="mcy-scroll"><main className="mcy-page"><div className="mcy-inline-note" role="status">{state.locale === "en-US" ? "Opening your journey…" : "Đang mở Hành trình…"}</div></main></MobileScroll>}>
    <LazyJourneyScreen
      state={state}
      setState={setState}
      update={update}
      BodyMapComponent={BodyMap}
      BodyStylePickerComponent={BodyStylePicker}
      RegionEditorComponent={RegionEditor}
      ActionComponent={Action}
      DemoNoteComponent={DemoNote}
      onStartNext={() => {
        update({ dialogueChoice: null, dialogueText: "", aiConversation: [], aiPending: false, aiError: "", minutes: 10, energy: null, regions: [], preObservations: [], postObservations: [], bodyStatus: null, postBodyStatus: null, outcome: null, pace: null, note: "", endedEarly: false, usePreviousFeedback: false, lastReflection: null, checkinBaselineReady: false, reflectionHasCheckinBaseline: false, reflectionBeforeStatus: null, reflectionBeforeObservations: [], reflectionLessonTitle: "", currentRemoteCheckinId: null, pendingCheckinIdempotencyKey: null, pendingCheckinPayload: null });
        flow.push(ROUTES.checkin);
      }}
    />
  </RouteSuspense>;
}

export default function Prototype() {
  const workspace = new URLSearchParams(window.location.search).get("workspace");
  const ownerWorkspace = workspace === "owner";
  const teacherWorkspace = workspace === "teacher";
  const contentReviewWorkspace = workspace === "content-review";
  const webAuthCallback = !Capacitor.isNativePlatform() && isWebAuthCallback(window.location.pathname, window.location.search, window.location.hash);
  const staffWorkspace = ownerWorkspace || teacherWorkspace || contentReviewWorkspace || webAuthCallback;
  useLayoutEffect(() => {
    if (!staffWorkspace) return;
    const learnerRoot = document.getElementById("root");
    if (!learnerRoot) return;
    const previousAriaHidden = learnerRoot.getAttribute("aria-hidden");
    const previousInert = learnerRoot.inert;
    learnerRoot.setAttribute("aria-hidden", "true");
    learnerRoot.inert = true;
    return () => {
      learnerRoot.inert = previousInert;
      if (previousAriaHidden === null) learnerRoot.removeAttribute("aria-hidden");
      else learnerRoot.setAttribute("aria-hidden", previousAriaHidden);
    };
  }, [staffWorkspace]);
  // INC-005: put stray scroll back after a text field loses focus; `?debug=viewport` shows what iOS reports (zoom, pan, scroll) for a screenshot.
  useEffect(() => {
    const stopGuard = installFocusGuard();
    let stopProbe: (() => void) | undefined, cancelled = false;
    if (new URLSearchParams(window.location.search).get("debug") === "viewport") void import("./compat/viewportProbe").then(module => { if (!cancelled) stopProbe = module.installViewportProbe(); });
    return () => { cancelled = true; stopGuard(); stopProbe?.(); };
  }, []);

  if (webAuthCallback) return createPortal(<Suspense fallback={<p role="status">Đang xác minh đăng nhập…</p>}><WebAuthCallback /></Suspense>, document.body);
  if (ownerWorkspace) {
    return <Suspense fallback={<div className="owner-loading" role="status">Đang mở workspace…</div>}><OwnerWorkspacePortal /></Suspense>;
  }
  if (teacherWorkspace) {
    return <Suspense fallback={<div className="mcy-teacher-loading" role="status">Đang mở workspace…</div>}><TeacherWorkspacePortal /></Suspense>;
  }
  if (contentReviewWorkspace) return createPortal(<Suspense fallback={<p role="status">Đang mở bài mẫu…</p>}><ContentReviewWorkspace /></Suspense>, document.body);
  return <LearnerPrototype />;
}

function OwnerWorkspacePortal() {
  return createPortal(<OwnerWorkspace />, document.body);
}

function TeacherWorkspacePortal() {
  return createPortal(<TeacherWorkspace />, document.body);
}

function LearnerPrototype() {
  const reviewConsentScreen = import.meta.env.DEV && new URLSearchParams(window.location.search).get("review-screen") === "consent";
  const [state, setState] = useState<DemoState>(() => reviewConsentScreen ? {
    ...initialState,
    signedIn: true,
    onboardingComplete: true,
    termsAccepted: true,
    privacyAccepted: true,
    consentBaseline: { ...emptyConsentState, terms: true, privacy: true },
    consentPolicyVersions: REQUIRED_CONSENT_POLICY_VERSIONS,
  } : initialState);
  const [authInitNonce, setAuthInitNonce] = useState(0);
  const authStarted = useRef(false);
  useEffect(() => {
    const start = () => { if (!authStarted.current) setAuthInitNonce(value => value + 1); };
    window.addEventListener(AUTH_SIGN_IN_EVENT, start);
    return () => window.removeEventListener(AUTH_SIGN_IN_EVENT, start);
  }, []);
  useLayoutEffect(() => {
    document.title = state.locale === "en-US" ? "A Little Yoga" : "Một chút yoga";
    document.documentElement.lang = state.locale === "en-US" ? "en" : "vi";
  }, [state.locale]);
  useLayoutEffect(() => {
    const screen = document.querySelector<HTMLElement>("[data-phone-screen]");
    if (!screen) return;
    const keepChromeFixed = () => {
      if (screen.scrollTop !== 0) screen.scrollTop = 0;
      if (screen.scrollLeft !== 0) screen.scrollLeft = 0;
    };
    screen.addEventListener("scroll", keepChromeFixed);
    keepChromeFixed();
    return () => screen.removeEventListener("scroll", keepChromeFixed);
  }, []);
  useEffect(() => {
    if (reviewConsentScreen) return;
    if (!backendConfigured) {
      setState(previous => ({ ...previous, backendStatus: "ready" }));
      return;
    }
    if (authInitNonce === 0 && !shouldInitializeAuthForCurrentLaunch()) {
      setState(previous => ({ ...previous, backendStatus: "ready", backendError: "" }));
      return;
    }
    authStarted.current = true;
    let active = true;
    let hydrationGeneration = 0;
    let lastHydratedUserId: string | null = null;
    let client: Awaited<ReturnType<typeof getSupabaseClient>> = null;
    let subscription: { unsubscribe: () => void } | null = null;
    let appUrlListener: { remove: () => Promise<void> } | null = null;
    const handledAuthUrls = new Set<string>();
    const receiveNativeAuthUrl = async (url: string) => {
      if (!rememberNativeAuthUrl(handledAuthUrls, url)) return;
      try {
        await handleNativeAuthUrl(url);
      } catch (error) {
        if (active) setState(previous => ({ ...previous, backendStatus: "error", backendError: "Liên kết xác minh không hợp lệ hoặc đã hết hạn. Hãy yêu cầu email mới." }));
      }
    };
    // A cold start or Recent/icon reopen can run before the radio is usable. A stored session must
    // not look like a sign-out because one request failed: retry a few times, then offer a retry.
    const RESTORE_RETRY_DELAYS_MS = [1500, 4000, 10000];
    let retryTimer = 0;
    let retryAttempt = 0;
    let restoreFailed = false;
    const isTransientAuthError = (error: { name?: string }) => error.name === "AuthRetryableFetchError";
    const scheduleRestoreRetry = () => {
      if (!active || retryAttempt >= RESTORE_RETRY_DELAYS_MS.length) return false;
      window.clearTimeout(retryTimer);
      retryTimer = window.setTimeout(() => { retryAttempt += 1; void restore(); }, RESTORE_RETRY_DELAYS_MS[retryAttempt]);
      return true;
    };
    const restore = async () => {
      if (!active || !client) return;
      restoreFailed = false;
      const { data, error } = await client.auth.getSession();
      if (!active) return;
      if (error) {
        const transient = isTransientAuthError(error);
        if (transient && scheduleRestoreRetry()) {
          setState(previous => ({ ...previous, backendStatus: "loading", backendError: "" }));
          return;
        }
        restoreFailed = transient;
        setState(previous => ({ ...previous, backendStatus: "error", backendError: error.message }));
        return;
      }
      observeLearnerSession(data.session?.user.id ?? null);
      void hydrate(data.session);
    };
    const retryNow = () => {
      if (!active || !client) return;
      retryAttempt = 0;
      window.clearTimeout(retryTimer);
      setState(previous => ({ ...previous, backendStatus: "loading", backendError: "" }));
      void restore();
    };
    const retryWhenBackOnline = () => { if (restoreFailed && document.visibilityState === "visible") retryNow(); };
    window.addEventListener(SESSION_RESTORE_RETRY_EVENT, retryNow);
    window.addEventListener("online", retryWhenBackOnline);
    document.addEventListener("visibilitychange", retryWhenBackOnline);
    const hydrate = async (session: import("@supabase/supabase-js").Session | null) => {
      if (!active) return;
      const generation = ++hydrationGeneration;
      if (!session) {
        lastHydratedUserId = null;
        setState(previous => ({ ...clearAccountScopedState(previous), backendStatus: "ready", backendError: "" }));
        return;
      }
      const switchedAccount = lastHydratedUserId !== null && lastHydratedUserId !== session.user.id;
      lastHydratedUserId = session.user.id;
      setState(previous => ({ ...(switchedAccount ? clearAccountScopedState(previous) : previous), backendStatus: "loading", backendError: "" }));
      try {
        if (!client) throw new Error("Chưa tải được kết nối tài khoản. Hãy thử tải lại.");
        const data = await loadLearnerSnapshot(client);
        if (!active || generation !== hydrationGeneration) return;
        const remoteCheckins = data.checkins.map(row => snapshotFromDatabase(row, data.observations));
        const bodyStyle = data.profile?.body_display_preference;
        setState(previous => ({
          ...previous,
          signedIn: true,
          userId: session.user.id,
          accountEmail: session.user.email ?? previous.accountEmail,
          displayName: data.profile?.display_name ?? previous.displayName,
          locale: import.meta.env.DEV && data.profile?.locale === "en-US" ? "en-US" : "vi-VN",
          bodyStyle: bodyStyle === "neutral" || bodyStyle === "masculine" || bodyStyle === "feminine" ? bodyStyle : "feminine",
          termsAccepted: data.consents.terms && data.consentPolicyVersions.terms === REQUIRED_CONSENT_POLICY_VERSIONS.terms,
          privacyAccepted: data.consents.privacy && data.consentPolicyVersions.privacy === REQUIRED_CONSENT_POLICY_VERSIONS.privacy,
          aiConsent: data.consents.ai_processing && data.consentPolicyVersions.ai_processing === CONSENT_POLICY_VERSIONS.ai_processing,
          saveFeedbackConsent: hasCurrentConsentForPurpose("wellbeing_data", data.consents, data.consentPolicyVersions),
          teacherShareConsent: data.consents.teacher_sharing,
          marketingConsent: data.consents.marketing,
          notificationEnabled: data.consents.notifications,
          consentBaseline: { ...data.consents, ai_processing: data.consents.ai_processing && data.consentPolicyVersions.ai_processing === CONSENT_POLICY_VERSIONS.ai_processing },
          consentPolicyVersions: data.consentPolicyVersions,
          onboardingComplete: Boolean(data.profile),
          remoteCheckins,
          currentRemoteCheckinId: previous.currentRemoteCheckinId ?? lastOf(remoteCheckins)?.remoteId ?? null,
          backendStatus: "ready",
          backendError: "",
        }));
        retryAttempt = 0;
        restoreFailed = false;
      } catch (error) {
        if (!active || generation !== hydrationGeneration) return;
        if (scheduleRestoreRetry()) {
          setState(previous => ({ ...(switchedAccount ? clearAccountScopedState(previous) : previous), backendStatus: "loading", backendError: "" }));
          return;
        }
        restoreFailed = true;
        setState(previous => ({
          ...(switchedAccount ? clearAccountScopedState(previous) : previous),
          signedIn: true,
          userId: session.user.id,
          accountEmail: session.user.email ?? previous.accountEmail,
          backendStatus: "error",
          backendError: error instanceof Error ? error.message : "Chưa đọc được dữ liệu tài khoản.",
        }));
      }
    };
    void (async () => {
      try {
        client = await getSupabaseClient();
        if (!active) return;
        if (!client) {
          setState(previous => ({ ...previous, backendStatus: "ready" }));
          return;
        }
        const authClient = client;
        const authSubscription = authClient.auth.onAuthStateChange((_event, session) => {
          observeLearnerSession(session?.user.id ?? null);
          window.setTimeout(() => { void hydrate(session); }, 0);
        });
        subscription = authSubscription.data.subscription;
        await restore();
        if (Capacitor.isNativePlatform()) {
          void CapacitorApp.addListener("appUrlOpen", ({ url }) => { void receiveNativeAuthUrl(url); }).then(listener => {
            if (active) appUrlListener = listener;
            else void listener.remove();
          }).catch(error => {
            if (active) setState(previous => ({ ...previous, backendStatus: "error", backendError: error instanceof Error ? error.message : "Chưa bật được liên kết đăng nhập trên thiết bị." }));
          });
          void CapacitorApp.getLaunchUrl().then(launch => {
            if (launch?.url) void receiveNativeAuthUrl(launch.url);
          }).catch(() => undefined);
        }
      } catch (error) {
        if (active) setState(previous => ({
          ...previous,
          backendStatus: "error",
          backendError: error instanceof Error ? error.message : "Chưa tải được kết nối tài khoản. Hãy thử lại.",
        }));
      }
    })();
    return () => {
      active = false;
      window.clearTimeout(retryTimer);
      window.removeEventListener(SESSION_RESTORE_RETRY_EVENT, retryNow);
      window.removeEventListener("online", retryWhenBackOnline);
      document.removeEventListener("visibilitychange", retryWhenBackOnline);
      subscription?.unsubscribe();
      void appUrlListener?.remove();
    };
  }, [reviewConsentScreen, authInitNonce]);
  return <DemoContext.Provider value={{ state, setState }}><RoutesContext.Provider value={ROUTES}><FlowStack initial={reviewConsentScreen ? ROUTES.consent : ROUTES.welcome}><AuthSessionRouter /><FlowRouteFocusManager /><PracticeCapabilityObserver /></FlowStack></RoutesContext.Provider></DemoContext.Provider>;
}

function AuthSessionRouter() {
  const { state } = useDemo();
  const flow = useFlow();
  useEffect(() => {
    if (!state.signedIn || state.backendStatus !== "ready") return;
    if (![ROUTES.welcome.id, ROUTES.authEmail.id, ROUTES.authCode.id].includes(flow.current.id)) return;
    if (!hasCurrentRequiredConsent(consentStateForDemo(state), state.consentPolicyVersions)) flow.replace(ROUTES.consent);
    else if (!state.onboardingComplete) flow.replace(ROUTES.onboarding);
    else finishAtAuthDestination(flow, ROUTES, normalizeAuthDestination(state.authReturnTo));
  }, [flow, state.authReturnTo, state.backendStatus, state.consentPolicyVersions, state.onboardingComplete, state.privacyAccepted, state.signedIn, state.termsAccepted]);
  return null;
}

function ReadinessScreen() {
  const flow = useFlow();
  const [result, setResult] = useState<"within_scope" | "unknown" | "needs_review" | "stop_guidance" | null>(null);
  const choose = (value: NonNullable<typeof result>) => setResult(value);
  const advance = () => {
    if (result === "within_scope") flow.replace(ROUTES.discover);
    else if (result === "unknown") flow.replace(ROUTES.discover);
    else if (result === "needs_review") flow.replace(ROUTES.help);
    else if (result === "stop_guidance") flow.replace(ROUTES.home);
  };
  return <MobileScroll className="mcy-scroll"><main className="mcy-page mcy-readiness-page"><Eyebrow>A06 · TRƯỚC KHI THỰC HÀNH</Eyebrow><h1>Hôm nay bạn có muốn tiếp tục thật nhẹ nhàng không?</h1><p className="mcy-lead">Chọn theo cảm nhận của bạn. Đây không phải chẩn đoán hay đánh giá an toàn y tế.</p><div className="mcy-account-panel"><strong>Nếu bạn chưa chắc, bạn có thể dừng lại.</strong><p>MCY hiện chưa tạo gợi ý tự động. Bạn luôn tự chọn bài học và có thể dừng bất cứ lúc nào.</p></div><div className="mcy-readiness-options"><button aria-pressed={result === "within_scope"} onClick={() => choose("within_scope")}><strong>Tôi muốn tiếp tục nhẹ nhàng</strong><small>Đi tới thư viện bài học miễn phí.</small></button><button aria-pressed={result === "unknown"} onClick={() => choose("unknown")}><strong>Tôi chưa chắc</strong><small>Xem thư viện mà không dùng phản hồi để cá nhân hóa.</small></button><button aria-pressed={result === "needs_review"} onClick={() => choose("needs_review")}><strong>Tôi cần người xem cùng</strong><small>Mở hướng dẫn và hỗ trợ.</small></button><button aria-pressed={result === "stop_guidance"} onClick={() => choose("stop_guidance")}><strong>Tôi muốn dừng hôm nay</strong><small>Không chọn bài lúc này.</small></button></div>{result === "stop_guidance" && <div className="mcy-alert">Mình sẽ không đề xuất bài lúc này. Nếu bạn cần hỗ trợ khẩn cấp, hãy liên hệ dịch vụ phù hợp tại nơi bạn đang ở.</div>}{result === "needs_review" && <div className="mcy-alert">Hiện chưa có phiên tư vấn trực tiếp trong ứng dụng. Bạn có thể xem hướng dẫn chung.</div>}<Action disabled={!result} onClick={advance}>{result === "within_scope" || result === "unknown" ? "Xem bài học miễn phí" : result === "needs_review" ? "Mở hướng dẫn" : "Kết thúc ở đây"}</Action><button className="mcy-quiet-link" onClick={() => flow.replace(ROUTES.discover)}>Bỏ qua câu hỏi · xem bài học miễn phí</button><DemoNote>Chỉ những điều bạn chủ động ghi nhận mới xuất hiện trong check-in và Hành trình.</DemoNote></main></MobileScroll>;
}

// Three shortest clips, ordered by length only. This is a gentle first look, not a pick based on the check-in.
function ReflectionScreen() {
  const keyboard = useKeyboard();
  const { state, update, setState } = useDemo();
  const locale = state.locale;
  const beforeObservations = state.reflectionBeforeObservations;
  const [editing, setEditing] = useState<BodyRegion | null>(null);
  const [editingStoredSide, setEditingStoredSide] = useState<BodySide | undefined>();
  const [suggestedSide, setSuggestedSide] = useState<BodySide | undefined>();
  const [chooseNewRegion, setChooseNewRegion] = useState(false);
  const current = editing ? state.postObservations.find(item => item.region === editing && item.side === editingStoredSide) ?? state.postObservations.find(item => item.region === editing) : undefined;
  const openRegion = (region: BodyRegion, preferredSide?: BodySide) => {
    const entries = state.postObservations.filter(item => item.region === region);
    const prior = beforeObservations.filter(item => item.region === region);
    const currentEntry = preferredSide
      ? entries.find(item => item.side === preferredSide) ?? entries.find(item => item.side === "both" || item.side === "unspecified")
      : entries[0];
    const base = currentEntry ?? (preferredSide ? prior.find(item => item.side === preferredSide) ?? prior.find(item => item.side === "both" || item.side === "unspecified") : prior[0]);
    const storedSide = currentEntry?.side ?? base?.side ?? preferredSide ?? "unspecified";
    setEditingStoredSide(storedSide);
    setSuggestedSide(preferredSide ?? base?.side ?? "unspecified");
    setEditing(region);
  };
  const closeEditor = () => { setEditing(null); setEditingStoredSide(undefined); setSuggestedSide(undefined); };
  const saveRegion = (value: Observation) => setState(previous => ({ ...previous, postBodyStatus: "reported", postObservations: replaceBodyObservation(previous.postObservations, value, editingStoredSide ?? value.side) }));
  const removeRegion = () => { if (!editing || !editingStoredSide) return; setState(previous => { const postObservations = removeBodyObservation(previous.postObservations, editing, editingStoredSide); return { ...previous, postObservations, postBodyStatus: postObservations.length ? "reported" : null }; }); };
  return <MobileScroll className="mcy-scroll"><main className="mcy-page mcy-reflection-page">
    <h1>{msg(locale, "reflection.title")}</h1><p className="mcy-lead">{msg(locale, "reflection.lead")}</p>
    {state.reflectionLessonTitle && <div className="mcy-inline-note"><InfoCircledIcon />{msg(locale, "course.reflectionLesson")} {state.reflectionLessonTitle}</div>}
    <div className="mcy-before-after"><div><BodyMap observations={beforeObservations} bodyStyle={state.bodyStyle} compact locale={locale} /><span>{msg(locale, "reflection.before")}</span></div><span className="mcy-before-arrow"><ArrowRightIcon /></span><div><BodyMap observations={state.postObservations} bodyStyle={state.bodyStyle} compact locale={locale} /><span>{msg(locale, "reflection.after")}</span></div></div>
    <p className="mcy-reflection-hint">{msg(locale, "reflection.hint")}</p>
    <section className="mcy-field-section"><h2>{msg(locale, "reflection.preRegions")}</h2>{beforeObservations.length ? <div className="mcy-reflection-regions">{beforeObservations.map(item => { const after = state.postObservations.find(entry => entry.region === item.region && (entry.side === item.side || (entry.side === "both" && (item.side === "left" || item.side === "right")))); const area = `${regionLabel(locale, item.region)}${isPairedBodyRegion(item.region) && item.side !== "unspecified" ? ` · ${sideLabel(locale, item.side)}` : ""}`; return <div key={`${item.region}-${item.side}`} className="mcy-reflection-region-row"><button onClick={() => openRegion(item.region, item.side)}><span><strong>{area}</strong><small>{msg(locale, "reflection.before")}: {item.status === "uncertain" ? bodyLevelLabel(locale, "Chưa rõ") : bodyLevelLabel(locale, item.level ?? msg(locale, "checkin.notRecorded"))}</small></span><span><small>{msg(locale, "reflection.after")}</small><strong>{after ? after.status === "uncertain" ? bodyLevelLabel(locale, "Chưa rõ") : bodyLevelLabel(locale, after.level ?? msg(locale, "checkin.notRecorded")) : msg(locale, "reflection.tapToRecord")}</strong></span><ArrowRightIcon /></button><button className="mcy-keep-region" onClick={() => setState(previous => ({ ...previous, postBodyStatus: "reported", postObservations: replaceBodyObservation(previous.postObservations, { ...item, note: "" }, item.side) }))}>{msg(locale, "reflection.keepSame")}</button></div>; })}</div> : <p className="mcy-inline-note">{msg(locale, "reflection.notCheckedIn")}</p>}</section>
    <button className="mcy-standalone-link" onClick={() => setChooseNewRegion(true)}>{msg(locale, "reflection.addRegion")}</button>
    {beforeObservations.length > 0 && <div className="mcy-post-options"><button onClick={() => update({ postObservations: beforeObservations.map(item => ({ ...item, note: "" })), postBodyStatus: "reported" })}>{msg(locale, "reflection.keepAll")}</button><button onClick={() => update({ postObservations: [], postBodyStatus: "uncertain" })}>{msg(locale, "reflection.unsureAfter")}</button></div>}
    <section className="mcy-field-section"><h2>{msg(locale, "reflection.overall")} <small>{msg(locale, "reflection.optional")}</small></h2><div className="mcy-reflection-grid">{(["Dễ chịu hơn", "Như cũ", "Khó chịu hơn", "Chưa rõ"] as Exclude<Outcome, null>[]).map(value => <Choice key={value} selected={state.outcome === value} onClick={() => update({ outcome: value })}>{guidedChoiceLabel(locale, value)}</Choice>)}</div></section>
    <section className="mcy-field-section compact"><h2>{msg(locale, "reflection.pace")} <small>{msg(locale, "reflection.optional")}</small></h2><div className="mcy-chip-grid">{(["Vừa", "Hơi nhanh", "Hơi chậm"] as Exclude<Pace, null>[]).map(value => <Choice key={value} selected={state.pace === value} onClick={() => update({ pace: value })}>{guidedChoiceLabel(locale, value)}</Choice>)}</div></section>
    {state.outcome === "Khó chịu hơn" ? <div className="mcy-alert">{msg(locale, "reflection.alert")}</div> : null}
    <label className="mcy-note-label">{msg(locale, "reflection.notePrompt")} <small>{msg(locale, "reflection.noteScope")}</small><KeyboardTextarea placeholder={msg(locale, "reflection.notePlaceholder")} value={state.note} onChange={event => update({ note: event.target.value })} onBlur={() => keyboard.hide()} /></label>
    <DemoNote>{msg(locale, "reflection.note")}</DemoNote>
    <RegionEditor region={editing} current={current} suggestedSide={suggestedSide} onSave={saveRegion} onClose={closeEditor} onDelete={removeRegion} />
    <BottomSheet open={chooseNewRegion} onOpenChange={setChooseNewRegion} title={msg(locale, "reflection.chooseRegion")} description={msg(locale, "reflection.newRegionHelp")} snap={0.48}><div className="mcy-picker-list">{BODY_REGIONS.map(region => <button key={region} onClick={() => { setChooseNewRegion(false); openRegion(region); }}>{regionLabel(locale, region)}</button>)}</div></BottomSheet>
  </main></MobileScroll>;
}

function ReflectionFooter() {
  const flow = useFlow();
  const keyboard = useKeyboard();
  const { state, setState } = useDemo();
  const locale = state.locale;
  const save = (skip: boolean) => {
    keyboard.hide();
    const recordedAt = new Date();
    setState(previous => {
      const before = makeSnapshot("Trước tập", previous.reflectionBeforeStatus, previous.reflectionBeforeObservations, {}, recordedAt);
      const after = makeSnapshot("Sau tập", skip ? "skipped" : previous.postBodyStatus ?? (previous.postObservations.length ? "reported" : null), skip ? [] : previous.postObservations, { lessonTitle: previous.reflectionLessonTitle || undefined, outcome: skip ? null : previous.outcome, pace: skip ? null : previous.pace, note: skip ? "" : previous.note, endedEarly: previous.endedEarly, feedbackSkipped: skip }, recordedAt);
      const localBefore = previous.currentRemoteCheckinId || !previous.reflectionHasCheckinBaseline ? [] : [before];
      return { ...previous, history: previous.saveFeedbackConsent ? [...previous.history, ...localBefore, after] : previous.history, lastReflection: after, preObservations: [], postObservations: [], bodyStatus: null, postBodyStatus: null, regions: [], outcome: null, pace: null, note: "", checkinBaselineReady: false, reflectionHasCheckinBaseline: false, reflectionBeforeStatus: null, reflectionBeforeObservations: [], reflectionLessonTitle: "" };
    });
    flow.replace(ROUTES.sync);
  };
  return <div className="mcy-flow-footer"><button className="mcy-quiet-link" onClick={() => save(true)}>{msg(locale, "reflection.skip")}</button><Action onClick={() => save(false)}>{msg(locale, "reflection.save")}</Action></div>;
}


function ProfileScreen() {
  const flow = useFlow();
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
    void import("./library/readingPreviewApi").then(({ readPreviewList }) => readPreviewList(previewUserId)).then(result => {
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
    void import("./classes/classApi").then(({ readClassList }) => readClassList(previewUserId)).then(result => {
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
    {!state.signedIn ? <div className="mcy-profile-card"><span className="mcy-tag">TÀI KHOẢN</span><strong>Lưu hành trình trên tài khoản của bạn</strong><p>Đăng nhập bằng email để đồng bộ hồ sơ, quyền dữ liệu và check-in có đồng ý.</p><button onClick={() => { update({ authMode: "create", authReturnTo: "profile" }); flow.push(ROUTES.authEmail); }}>Tạo tài khoản hoặc đăng nhập</button></div> : <div className="mcy-profile-card"><span className="mcy-tag">TRẠNG THÁI</span><strong>Đang dùng tài khoản học viên</strong><p>Hồ sơ, quyền riêng tư và check-in được lưu theo lựa chọn của bạn.</p><button disabled={signingOut} onClick={() => { void signOut(); }}>{signingOut ? "Đang đăng xuất…" : "Đăng xuất thiết bị này"}</button></div>}
    {error && <div className="mcy-form-error" role="alert">{error}</div>}
    <div className="mcy-account-group"><span className="mcy-section-label">HỒ SƠ VÀ QUYỀN DỮ LIỆU</span>
      <AccountRow title="Thông tin cá nhân" detail={state.displayName || "Tên tùy chọn · ngôn ngữ · hình minh họa"} onClick={() => flow.push(ROUTES.editProfile)} />
      <AccountRow title={state.aiCapability === "ready" ? "AI và điều được nhớ" : "Điều được nhớ"} detail={feedback ? "Có phản hồi để xem nguồn và cách rút lại" : "Chưa có thông tin được nhớ"} onClick={() => flow.push(ROUTES.memory)} />
      <AccountRow title="Quyền riêng tư và đồng ý" detail="Mỗi mục đích, phiên bản và cách thay đổi" onClick={() => flow.push(ROUTES.privacy)} />
      <AccountRow title="Bảo mật tài khoản" detail="Email, phiên đăng nhập và xác minh lại" onClick={() => flow.push(ROUTES.security)} />
      <AccountRow title="Nhắc tập và thông báo" detail="Tùy chọn kênh, giờ và múi giờ" onClick={() => flow.push(ROUTES.notifications)} />
      <AccountRow title="Nội dung và quyền đang có" detail="Khóa học miễn phí · quyền trả phí" onClick={() => flow.push(ROUTES.access)} />
      <AccountRow title="Chia sẻ với giáo viên" detail="Chưa có lớp được kết nối · mặc định tắt" onClick={() => flow.push(ROUTES.sharing)} />
    </div>
    {classCount > 0 && <div className="mcy-account-group"><span className="mcy-section-label">LỚP VÀ NHẬN XÉT</span>
      <AccountRow title="Lớp của tôi" detail={`${classCount} lớp · nhận xét giảng viên đã gửi cho bạn`} onClick={() => flow.push(ROUTES.myClasses)} />
    </div>}
    {previewUnits > 0 && <div className="mcy-account-group"><span className="mcy-section-label">DÀNH CHO BIÊN TẬP</span>
      <AccountRow title="Xem trước nội dung" detail={`${previewUnits} bài đọc có hình · chỉ Owner hoặc người được giao thấy`} onClick={() => flow.push(ROUTES.readingPreview)} />
      <AccountRow title="Hiển thị cho học viên" detail="Bật hoặc tắt từng bài đã duyệt · mặc định tắt" onClick={() => flow.push(ROUTES.readingPublish)} />
    </div>}
    <div className="mcy-account-group"><span className="mcy-section-label">TRỢ GIÚP VÀ YÊU CẦU</span>
      <AccountRow title="Hướng dẫn và liên hệ" detail="Đọc hướng dẫn; chưa gửi được yêu cầu trong ứng dụng" onClick={() => flow.push(ROUTES.help)} />
      <AccountRow title="Xuất hoặc xóa dữ liệu" detail="Ứng dụng chưa tiếp nhận yêu cầu xuất hoặc xóa" onClick={() => flow.push(ROUTES.help)} />
    </div>
    <DemoNote>Hồ sơ, lựa chọn quyền và check-in được lưu theo trạng thái tài khoản. Nếu một tính năng chưa có kết nối, ứng dụng sẽ nói rõ trước khi bạn gửi dữ liệu.</DemoNote>
  </main></MobileScroll>;
}

function AccountRow({ title, detail, onClick, danger = false }: { title: string; detail: string; onClick: () => void; danger?: boolean }) {
  return <button className={`mcy-account-row${danger ? " danger" : ""}`} onClick={onClick}><span><strong>{title}</strong><small>{detail}</small></span><ArrowRightIcon /></button>;
}

type AccountPanel = "edit" | "privacy" | "memory" | "sharing" | "security" | "notifications" | "access" | "help";
const LEGAL_WEB_ORIGIN = "https://motchutyoga.magicpendigital.com";
const ACCOUNT_DELETION_WEB_URL = `${LEGAL_WEB_ORIGIN}/delete-account.html`;
const PRIVACY_POLICY_WEB_URL = `${LEGAL_WEB_ORIGIN}/privacy.html`;
const TERMS_WEB_URL = `${LEGAL_WEB_ORIGIN}/terms.html`;

function AccountDetailScreen({ panel }: { panel: AccountPanel }) {
  const flow = useFlow();
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
  if (panel === "memory") return screen(state.aiCapability === "ready" ? "AI VÀ ĐIỀU ĐƯỢC NHỚ" : "ĐIỀU ĐƯỢC NHỚ", "Bạn xem được nguồn của mọi điều được nhớ.", "Không có suy luận sức khỏe dài hạn. Một phản hồi khó chịu hơn không thành sở thích mặc định.", <><div className="mcy-account-panel"><span className="mcy-tag">TRẠNG THÁI</span>{latest && state.rememberPace ? <><strong>Nhịp buổi trước hơi nhanh</strong><p>Nguồn: phản hồi sau buổi · phạm vi: gợi ý nhịp lần kế tiếp · dữ liệu chỉ trong phiên.</p><button className="mcy-toggle" aria-pressed={state.rememberPace} onClick={() => update({ rememberPace: false, usePreviousFeedback: false })}>Tắt và xóa ghi nhớ</button></> : <><strong>Chưa có ghi nhớ đang bật</strong><p>Phản hồi sau buổi hiện chỉ nằm trong phiên; chưa được lưu vào tài khoản.</p></>}</div><div className="mcy-account-panel"><strong>Trợ lý AI</strong><p>{state.aiCapability === "ready" ? "Trợ lý sẵn sàng cho phiên này. Chỉ gửi lựa chọn khi bạn đồng ý AI hiện hành và chủ động xác nhận." : "Trợ lý chưa sẵn sàng cho phiên này. Bạn vẫn có thể xem khóa học và tự chọn bài."}</p><button className="mcy-toggle" aria-pressed={state.aiConsent} disabled={consentPending} onClick={() => { void changeConsent("ai_processing", !state.aiConsent, { aiConsent: !state.aiConsent, usePreviousFeedback: false }); }}>{state.aiConsent ? "Rút đồng ý AI" : "Đồng ý cho xử lý khi tính năng được mở"}</button></div><AccountRow title="Xem quyền theo mục đích" detail="Rút đồng ý và xem ảnh hưởng" onClick={() => flow.push(ROUTES.privacy)} />{error && <div className="mcy-form-error" role="alert">{error}</div>}</>);
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
      <AccountRow title="Mở cài đặt chia sẻ" detail="Xem phạm vi và trạng thái kết nối" onClick={() => flow.push(ROUTES.sharing)} />
    </>,
  );
  if (panel === "sharing") return screen("CHIA SẺ DỮ LIỆU", "Bạn luôn chọn người nhận và phạm vi.", "Chia sẻ với giáo viên hiện chưa được kết nối trong tài khoản này. Mặc định chia sẻ đang tắt.", <><div className="mcy-empty large"><PersonIcon /><strong>Chưa có lớp được kết nối</strong><p>Khi có lớp được cấp quyền, bạn sẽ thấy rõ tên người nhận, dữ liệu được chia sẻ và thời hạn trước khi bật.</p></div><div className="mcy-consent-card"><strong>Nguyên tắc chia sẻ</strong><p>Không chia sẻ mặc định. Check-in, ghi chú và phản hồi chỉ được gửi khi bạn chọn đúng người nhận và phạm vi.</p></div><AccountRow title="Quyền riêng tư" detail="Rút đồng ý và xem các mục đích khác" onClick={() => flow.push(ROUTES.privacy)} /></>);
  if (panel === "security") return screen("BẢO MẬT", "Kiểm soát email và phiên đang mở.", "Xác minh lại email khi cần. Việc quản lý thiết bị và khôi phục danh tính luôn cần kiểm tra ở máy chủ.", <><div className="mcy-account-panel"><strong>Email đăng nhập</strong><p>{state.accountEmail || "Chưa đăng nhập"} · {state.signedIn ? "đã xác minh" : "chưa đăng nhập"}</p><button className="mcy-toggle" onClick={() => { update({ authMode: "login", authReturnTo: "security" }); flow.push(ROUTES.authEmail); }}>Đổi email có xác minh</button></div>{state.signedIn && <div className="mcy-account-panel mcy-password-panel"><strong>Mật khẩu đăng nhập</strong><p>Tùy chọn. Đặt mật khẩu để đăng nhập bằng email và mật khẩu; bạn vẫn đăng nhập được bằng mã hoặc liên kết gửi qua email.</p><label className="mcy-form-field">Mật khẩu mới<KeyboardInput type="password" autoComplete="new-password" aria-label="Mật khẩu mới" value={newPassword} onChange={event => { setNewPassword(event.target.value); setPasswordMessage(null); }} onBlur={() => keyboard.hide()} /></label><label className="mcy-form-field">Nhập lại mật khẩu mới<KeyboardInput type="password" autoComplete="new-password" aria-label="Nhập lại mật khẩu mới" value={confirmPassword} onChange={event => { setConfirmPassword(event.target.value); setPasswordMessage(null); }} onBlur={() => keyboard.hide()} /></label>{passwordMessage && <div className={passwordMessage.tone === "ok" ? "mcy-inline-note" : "mcy-form-error"} role={passwordMessage.tone === "ok" ? "status" : "alert"}>{passwordMessage.text}</div>}<button className="mcy-toggle" disabled={passwordSaving} onClick={() => { void savePassword(); }}>{passwordSaving ? "Đang lưu…" : "Lưu mật khẩu"}</button></div>}<div className="mcy-account-row static"><span><strong>Thiết bị này</strong><small>{state.signedIn ? "Phiên hiện tại" : "Chưa có phiên đăng nhập"}</small></span><span className="mcy-state-pill">{state.signedIn ? "HIỆN TẠI" : "KHÁCH"}</span></div><p className="mcy-inline-note">Nếu mất quyền truy cập email hoặc nghi có người dùng tài khoản, hãy liên hệ kênh hỗ trợ của MCY. Không tự gộp hai tài khoản.</p>{error && <div className="mcy-form-error subtle" role="alert">{error}</div>}{deleteNotice && <div className="mcy-inline-note" role="status">{deleteNotice}</div>}{state.signedIn && <div className="mcy-account-panel mcy-danger-zone"><strong>Xóa tài khoản</strong><p>Xóa tài khoản này cùng hồ sơ, check-in, lựa chọn quyền riêng tư và dữ liệu liên quan trên máy chủ. Việc này không thể hoàn tác.</p><button className="mcy-toggle danger" onClick={() => { setError(""); setDeleteOpen(true); }}>Xóa tài khoản và dữ liệu</button></div>}<a className="mcy-quiet-link" href={ACCOUNT_DELETION_WEB_URL} target="_blank" rel="noopener noreferrer">Trang yêu cầu xóa tài khoản trên web</a><BottomSheet open={deleteOpen} onOpenChange={open => { if (!deleting) { setDeleteOpen(open); if (!open) setDeleteWord(""); } }} title="Xóa tài khoản?" description="Hồ sơ, check-in và lựa chọn quyền riêng tư của bạn sẽ bị xóa vĩnh viễn. Gõ XÓA để xác nhận." snap={0.6}><div className="mcy-sheet-actions"><label className="mcy-form-field">Gõ XÓA để xác nhận<KeyboardInput aria-label="Gõ XÓA để xác nhận" autoComplete="off" autoCapitalize="characters" value={deleteWord} onChange={event => setDeleteWord(event.target.value)} onBlur={() => keyboard.hide()} /></label>{error && <div className="mcy-form-error" role="alert">{error}</div>}<button className="mcy-action danger" disabled={!deleteConfirmed || deleting} onClick={() => { void deleteAccount(); }}>{deleting ? "Đang xóa…" : "Xóa vĩnh viễn"}</button><button className="mcy-quiet-link" disabled={deleting} onClick={() => { keyboard.hide(); setDeleteOpen(false); setDeleteWord(""); }}>Giữ tài khoản</button></div></BottomSheet></>);
  if (panel === "notifications") return screen("THÔNG BÁO", "Nhắc tập theo lịch của bạn.", "Backend chưa gửi push hoặc email nhắc. Lựa chọn thông báo của tài khoản được lưu để dùng khi dịch vụ được triển khai.", <><PrivacyToggle title="Nhắc tập trong ứng dụng" detail="Múi giờ lấy từ thiết bị · lịch gửi chưa được cấu hình." value={state.notificationEnabled} disabled={consentPending} onToggle={value => { void changeConsent("notifications", value, { notificationEnabled: value }); }} /><PrivacyToggle title="Email cập nhật nội dung" detail="Tùy chọn marketing; không ảnh hưởng email đăng nhập." value={state.emailUpdates} disabled={consentPending} onToggle={value => { void changeConsent("marketing", value, { marketingConsent: value, emailUpdates: value }); }} />{error && <div className="mcy-form-error subtle" role="alert">{error}</div>}<div className="mcy-account-panel"><strong>Giờ yên lặng</strong><p>Chưa có lịch nhắc nào được gửi hoặc lên lịch.</p></div></>);
  if (panel === "access") return screen("QUYỀN NỘI DUNG", "Những gì đang mở cho bạn.", "Khóa học miễn phí có thể học không cần giao dịch. Mục này cho biết nội dung trả phí hiện có trong ứng dụng.", <><div className="mcy-access-card"><span className="mcy-tag">HỌC MIỄN PHÍ</span><strong>Khóa học trong Khám phá</strong><p>Bạn có thể xem các bài học video ngay trong ứng dụng mà không cần mua quyền truy cập.</p></div><div className="mcy-empty large"><ReaderIcon /><strong>Chưa có khóa học trả phí</strong><p>Giao dịch, thời hạn học và quyền lợi đi kèm hiện chưa được cung cấp trong ứng dụng.</p></div><button className="mcy-quiet-link" onClick={() => flow.push(ROUTES.discover)}>Mở Khám phá</button></>);
  if (panel === "help") return screen("HỖ TRỢ", "Tìm hướng dẫn rõ ràng.", "Chọn một chủ đề để xem hướng dẫn. Hiện chưa thể gửi yêu cầu tài khoản từ ứng dụng.", <><label className="mcy-form-field">Tìm hướng dẫn<KeyboardInput aria-label="Tìm hướng dẫn" value={query} onChange={event => setQuery(event.target.value)} onBlur={() => keyboard.hide()} placeholder="Ví dụ: phản hồi sau tập" /></label><div className="mcy-help-results">{filteredHelpArticles.length ? filteredHelpArticles.map(article => <AccountRow key={article.id} title={article.title} detail={article.detail} onClick={() => flow.push(HELP_ARTICLE_ROUTES[article.id])} />) : <p className="mcy-help-empty" role="status">Chưa tìm thấy hướng dẫn phù hợp. Thử một từ khác.</p>}</div><div className="mcy-account-panel"><strong>Chưa thể gửi yêu cầu trong ứng dụng</strong><p>Các mục bên dưới là hướng dẫn tham khảo; hiện chưa có nội dung nào được gửi tới đội ngũ hỗ trợ của MCY.</p></div>{error && <div className="mcy-form-error">{error}</div>}</>);
   return screen("YÊU CẦU VỀ DỮ LIỆU", "Yêu cầu về dữ liệu tài khoản.", "Chức năng gửi yêu cầu xuất hoặc xóa dữ liệu chưa sẵn sàng. Bạn có thể xem hướng dẫn quyền riêng tư hoặc liên hệ kênh chính thức của MCY.", <><div className="mcy-empty large"><InfoCircledIcon /><strong>Hiện chưa thể gửi yêu cầu trong ứng dụng</strong><p>Ứng dụng chưa tiếp nhận yêu cầu xuất hoặc xóa dữ liệu, nên chưa có thao tác nào được thực hiện.</p></div><AccountRow title="Quyền riêng tư" detail="Xem phạm vi lưu và chia sẻ" onClick={() => flow.push(ROUTES.privacy)} /><AccountRow title="Hướng dẫn và hỗ trợ" detail="Đọc các hướng dẫn đang có" onClick={() => flow.push(ROUTES.help)} /> </>);
}

function PrivacyToggle({ title, detail, value, onToggle, actionLabels, disabled = false }: { title: string; detail: string; value: boolean; onToggle: (value: boolean) => void; actionLabels?: { active: string; inactive: string }; disabled?: boolean }) {
  return <div className="mcy-account-panel mcy-toggle-row"><span><strong>{title}</strong><small>{detail}</small></span><button disabled={disabled} aria-pressed={value} className={value ? "on" : ""} onClick={() => onToggle(!value)}><i>{value ? "✓" : ""}</i><span>{value ? actionLabels?.active ?? "Bật" : actionLabels?.inactive ?? "Tắt"}</span></button></div>;
}

function SyncScreen() {
  const flow = useFlow();
  const { state } = useDemo();
  const locale = state.locale;
  const latest = state.lastReflection ?? lastOf(state.history);
  const reflectionTitle = latest?.feedbackSkipped
    ? msg(locale, "sync.skippedTitle")
    : latest?.kind === "Sau tập"
      ? latest.endedEarly
        ? msg(locale, "sync.endedEarlyTitle")
        : latest.outcome || latest.observations.length || latest.status === "uncertain" || latest.status === "none_now" || latest.status === "tired" || latest.status === "uncomfortable"
          ? msg(locale, "sync.reflectionTitle")
          : msg(locale, "sync.noFeelingTitle")
      : msg(locale, "sync.noReflectionTitle");
  const reflectionDetail = [
    latest?.outcome ? formatMessage(locale, "sync.overall", { feeling: guidedChoiceLabel(locale, latest.outcome) }) : msg(locale, "sync.noOverall"),
    latest?.status === "skipped" && !latest.feedbackSkipped ? msg(locale, "sync.skippedBody") : "",
    latest?.observations.length ? formatMessage(locale, "sync.observationCount", { count: localizedNumber(locale, latest.observations.length) }) : msg(locale, "sync.noObservation"),
  ].filter(Boolean).join(" ");
  return <MobileScroll className="mcy-scroll"><main className="mcy-page mcy-sync-page">
    <Eyebrow>{msg(locale, "sync.eyebrow")}</Eyebrow>
    <h1>{msg(locale, "sync.title")}</h1>
    <p className="mcy-lead">{msg(locale, "sync.lead")}</p>
    <div className="mcy-sync-card">
      <span className="mcy-state-pill">{msg(locale, "sync.sessionOnlyPill")}</span>
      <strong>{reflectionTitle}</strong><p>{reflectionDetail}</p>
    </div>
    {!state.saveFeedbackConsent && <p className="mcy-inline-note">{msg(locale, "sync.noConsent")}</p>}
    <Action secondary onClick={() => flow.replace(ROUTES.journey)}>{msg(locale, "sync.openJourney")}</Action>
    <button className="mcy-quiet-link" onClick={() => flow.replace(ROUTES.home)}>{msg(locale, "sync.done")}</button>
    <DemoNote>{msg(locale, "sync.note")}</DemoNote>
  </main></MobileScroll>;
}

function HelpArticleScreen({ articleId }: { articleId: HelpArticleId }) {
  const flow = useFlow();
  const article = HELP_ARTICLES.find(item => item.id === articleId) ?? HELP_ARTICLES[0];
  return <MobileScroll className="mcy-scroll"><main className="mcy-page mcy-discover-detail">
    <Eyebrow>HƯỚNG DẪN SỬ DỤNG</Eyebrow>
    <h1>{article.title}</h1>
    <p className="mcy-lead">{article.lead}</p>
    <section className="mcy-article-body">{article.paragraphs.map((paragraph, index) => <p key={`${article.id}-${index}`}>{paragraph}</p>)}</section>
    {article.id === "ai-scope" && <AccountRow title="Mở cài đặt quyền riêng tư" detail="Xem hoặc thay đổi lựa chọn AI" onClick={() => flow.push(ROUTES.privacy)} />}
    <DemoNote>Hướng dẫn sử dụng chung, không thay thế tư vấn y tế. Nếu cần hỗ trợ tài khoản hoặc dữ liệu, hiện chưa có kênh gửi yêu cầu trong ứng dụng.</DemoNote>
  </main></MobileScroll>;
}

function DiscoverDetailScreen() {
  return <MobileScroll className="mcy-scroll"><main className="mcy-page mcy-discover-detail"><Eyebrow>HƯỚNG DẪN</Eyebrow><h1>Tự chọn nội dung theo điều bạn cần hôm nay.</h1><p className="mcy-lead">Check-in, duyệt bài học miễn phí và ghi lại cảm nhận nếu bạn muốn.</p><section className="mcy-article-body"><p>Check-in là điều bạn tự ghi nhận ở thời điểm hiện tại. Bạn có thể chọn từng vùng cơ thể, chọn mức phù hợp hoặc bỏ qua vùng chưa muốn ghi. Check-in không thay cho chẩn đoán.</p><p>MCY chưa tự ghép video thành buổi tập hoặc chọn bài dựa trên check-in. Quay lại Khám phá để tự duyệt danh mục; mỗi video là một bài riêng và chưa được đánh giá theo nhu cầu sức khỏe cá nhân.</p><p>Trong lúc thực hành, hãy theo nhịp của mình và dừng nếu bài tập không phù hợp. Sau đó, bạn có thể ghi riêng từng vùng là dễ chịu hơn, như cũ, khó chịu hơn, chưa rõ hoặc bỏ qua.</p></section><DemoNote>Đây là hướng dẫn sử dụng chung, không phải tư vấn y tế. Nếu cần chăm sóc, hãy tìm hỗ trợ phù hợp tại nơi bạn đang ở.</DemoNote></main></MobileScroll>;
}
