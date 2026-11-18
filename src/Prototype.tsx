import { lastOf } from "./compat";
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
import { msg } from "./i18n";
import {
  ArrowLeftIcon, CheckIcon,
} from "@radix-ui/react-icons";
import { Carousel, FlowStack, MobileScroll, type FlowScreen, useFlow } from "./mobile";
import { backendConfigured, getSupabaseClient, shouldInitializeAuthForCurrentLaunch } from "./backend/supabase";
import { observeLearnerSession } from "./backend/learnerSession";
import { rememberNativeAuthUrl } from "./backend/nativeAuth";
import { isWebAuthCallback } from "./backend/authRouting";
import { bodyRegionCodes } from "./bodyRegions";
import {
  deleteLearnerCheckin,
  CONSENT_POLICY_VERSIONS,
  emptyConsentState,
  hasCurrentConsentForPurpose,
  loadLearnerSnapshot,
  hasCurrentRequiredConsent,
  REQUIRED_CONSENT_POLICY_VERSIONS,
} from "./backend/learnerData";
import type { PracticeContext } from "../supabase/functions/_shared/practiceContract";
import { rememberedPace } from "./practice/feedbackMemory";
import type { DemoState } from "./app/model";
import { clearAccountScopedState, DemoContext, initialState, useDemo } from "./app/state";
import { AUTH_SIGN_IN_EVENT, SESSION_RESTORE_RETRY_EVENT } from "./app/events";
import { hasCurrentAiConsent, latestFeedback, normalizeAuthDestination } from "./app/predicates";
import { useLearnerContinuation } from "./app/useLearnerContinuation";
import { snapshotFromDatabase } from "./app/snapshots";
import { consentStateForDemo } from "./app/persistence";
import { handleNativeAuthUrl } from "./app/auth";
import { Action, DemoNote, Eyebrow } from "./app/ui/controls";
import { Header } from "./app/ui/Header";
import { BodyMap } from "./app/body/BodyMap";
import { BodyStylePicker } from "./app/body/BodyStylePicker";
import { RegionEditor } from "./app/body/RegionEditor";
import { finishAtAuthDestination, HelpRoutesContext, RoutesContext } from "./app/navigation";
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
import { ReflectionScreen } from "./screens/reflection/ReflectionScreen";
import { ReflectionFooter } from "./screens/reflection/ReflectionFooter";
import { SyncScreen } from "./screens/reflection/SyncScreen";
import { AuthEmailScreen } from "./screens/auth/AuthEmailScreen";
import { AuthCodeScreen } from "./screens/auth/AuthCodeScreen";
import { AccountRow } from "./app/ui/AccountRow";
import { PrivacyToggle } from "./screens/account/PrivacyToggle";
import { HELP_ARTICLES, type HelpArticleId } from "./screens/help/articles";
import { ProfileScreen } from "./screens/account/ProfileScreen";
import { AccountDetailScreen } from "./screens/account/AccountDetailScreen";

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
  return <DemoContext.Provider value={{ state, setState }}><RoutesContext.Provider value={ROUTES}><HelpRoutesContext.Provider value={HELP_ARTICLE_ROUTES}><FlowStack initial={reviewConsentScreen ? ROUTES.consent : ROUTES.welcome}><AuthSessionRouter /><FlowRouteFocusManager /><PracticeCapabilityObserver /></FlowStack></HelpRoutesContext.Provider></RoutesContext.Provider></DemoContext.Provider>;
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
