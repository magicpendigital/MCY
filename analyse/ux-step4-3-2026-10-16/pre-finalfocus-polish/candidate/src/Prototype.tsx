import { createContext, lazy, Suspense, useContext, useEffect, useLayoutEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";
import { createPortal } from "react-dom";
import "@fontsource/roboto/latin-400.css";
import "@fontsource/roboto/latin-700.css";
import "@fontsource/roboto/vietnamese-400.css";
import "@fontsource/roboto/vietnamese-500.css";
import "@fontsource/roboto/vietnamese-700.css";
import { App as CapacitorApp } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";
import { bodyLevelLabel, formatMessage, guidedChoiceLabel, localizedNumber, msg, regionLabel, energyLabel, sideLabel, type AppLocale } from "./i18n";
import {
  ArrowLeftIcon, ArrowRightIcon, BarChartIcon, CheckIcon, ChevronDownIcon,
  HeartIcon, HomeIcon, InfoCircledIcon, MagicWandIcon,
  PersonIcon, PlayIcon, ReaderIcon,
} from "@radix-ui/react-icons";
import { BottomSheet, Carousel, FlowStack, KeyboardInput, KeyboardTextarea, MobileScroll, type FlowScreen, useFlow, useKeyboard } from "./mobile";
import { authRedirectUrl, backendConfigured, clientChannel, getAccountBoundSupabaseClient, getSupabaseClient, shouldInitializeAuthForCurrentLaunch, syncAuthEmailLocale } from "./backend/supabase";
import { normalizeEmailLocale, readEmailLocale, rememberEmailLocale } from "./backend/emailLocale";
import { EmailLanguageSelect } from "./backend/EmailLanguageSelect";
import { learnerSessionGeneration, observeLearnerSession } from "./backend/learnerSession";
import { persistConsentChoices } from "./backend/consentPersistence";
import { NATIVE_AUTH_PENDING_KEY, nativeAuthCodeFromCallback, rememberNativeAuthUrl } from "./backend/nativeAuth";
import { isWebAuthCallback } from "./backend/authRouting";
import { BODY_REGIONS, BODY_REGION_GROUPS, bodyRegionCodes, decodeBodyRegionCode, isPairedBodyRegion, removeBodyObservation, replaceBodyObservation, type BodyRegion, type BodyRegionGroup, type BodySide } from "./bodyRegions";
import {
  deleteLearnerCheckin,
  CONSENT_POLICY_VERSIONS,
  emptyConsentState,
  hasCurrentConsentForPurpose,
  loadLearnerSnapshot,
  hasCurrentRequiredConsent,
  isCurrentLearnerSession,
  REQUIRED_CONSENT_POLICY_VERSIONS,
  saveConsentEvent,
  saveLearnerCheckin,
  type ConsentPurpose,
  type ConsentPolicyVersions,
  type ConsentState,
  type CheckinPayload,
  type LearnerCheckin,
  type LearnerObservation,
} from "./backend/learnerData";
import type { FreeCourseId } from "./courses/freeCourses";
import type { PracticeContext } from "../supabase/functions/_shared/practiceContract";
import { rememberedPace } from "./practice/feedbackMemory";

type Energy = "Rất thấp" | "Thấp" | "Bình thường" | "Khá ổn" | "Tràn đầy";
export type BodyStyle = "neutral" | "feminine" | "masculine";
type BodyLevel = "Không khó chịu" | "Nhẹ" | "Vừa" | "Nhiều";
type BodyStatus = "reported" | "none_now" | "uncertain" | "skipped" | null;
export type Observation = { region: BodyRegion; side: BodySide; level: BodyLevel | null; status: "reported" | "uncertain"; note: string };
type Intent = "Thả lỏng" | "Bắt nhịp" | "Tập trung";
type DialogueChoice = "Nhiều hướng dẫn" | "Nhịp chậm" | "Ít lời" | "Không nằm sàn" | null;
type DialogueMessage = { role: "user" | "assistant"; content: string };
type Outcome = "Dễ chịu hơn" | "Như cũ" | "Khó chịu hơn" | "Chưa rõ" | null;
type Pace = "Vừa" | "Hơi nhanh" | "Hơi chậm" | null;
type CheckinStep = 1 | 2;

export type Snapshot = {
  id: string; day: number; date: string; time: string; kind: "Trước tập" | "Sau tập" | "Ghi riêng";
  status: BodyStatus; observations: Observation[]; remoteId?: string;
  lessonTitle?: string;
  outcome?: Outcome; pace?: Pace; note?: string; endedEarly?: boolean; feedbackSkipped?: boolean;
};

export type DemoState = {
  locale: AppLocale;
  checkinStep: CheckinStep;
  minutes: number;
  energy: Energy | null;
  regions: BodyRegion[];
  bodyStyle: BodyStyle;
  bodyStatus: BodyStatus;
  preObservations: Observation[];
  postObservations: Observation[];
  postBodyStatus: BodyStatus;
  intent: Intent;
  dialogueChoice: DialogueChoice;
  dialogueText: string;
  unrecognizedText: string;
  aiConversation: DialogueMessage[];
  aiPending: boolean;
  aiError: string;
  aiCapability: "checking" | "ready" | "disabled" | "not_ready";
  selectedCourseId: FreeCourseId | null;
  selectedLessonId: string | null;
  checkinBaselineReady: boolean;
  reflectionHasCheckinBaseline: boolean;
  reflectionBeforeStatus: BodyStatus;
  reflectionBeforeObservations: Observation[];
  reflectionLessonTitle: string;
  outcome: Outcome;
  pace: Pace;
  note: string;
  endedEarly: boolean;
  rememberPace: boolean;
  usePreviousFeedback: boolean;
  history: Snapshot[];
  signedIn: boolean;
  userId: string | null;
  backendStatus: "loading" | "ready" | "error";
  checkinReadStatus: "loading" | "ready" | "error";
  backendError: string;
  remoteCheckins: Snapshot[];
  currentRemoteCheckinId: string | null;
  pendingCheckinIdempotencyKey: string | null;
  pendingCheckinPayload?: CheckinPayload | null;
  accountEmail: string;
  authReturnTo: string;
  authMode: "create" | "login";
  authCode: string;
  displayName: string;
  onboardingComplete: boolean;
  termsAccepted: boolean;
  privacyAccepted: boolean;
  consentBaseline: ConsentState;
  consentPolicyVersions: ConsentPolicyVersions;
  aiConsent: boolean;
  saveFeedbackConsent: boolean;
  teacherShareConsent: boolean;
  marketingConsent: boolean;
  shareActive: boolean;
  notificationEnabled: boolean;
  emailUpdates: boolean;
  lastReflection: Snapshot | null;
};

const initialState: DemoState = {
  locale: "vi-VN", checkinStep: 1,
  minutes: 10, energy: null, regions: [], bodyStyle: "feminine", bodyStatus: null, preObservations: [], postObservations: [], postBodyStatus: null, intent: "Bắt nhịp",
  dialogueChoice: null, dialogueText: "", unrecognizedText: "", aiConversation: [], aiPending: false, aiError: "",
  aiCapability: "disabled",
  outcome: null, pace: null, note: "",
  selectedCourseId: null,
  selectedLessonId: null,
  checkinBaselineReady: false,
  reflectionHasCheckinBaseline: false,
  reflectionBeforeStatus: null,
  reflectionBeforeObservations: [],
  reflectionLessonTitle: "",
  endedEarly: false, rememberPace: true, usePreviousFeedback: false, history: [],
  signedIn: false, userId: null, backendStatus: backendConfigured ? "loading" : "ready", checkinReadStatus: "ready", backendError: "", remoteCheckins: [], currentRemoteCheckinId: null, pendingCheckinIdempotencyKey: null,
  accountEmail: "", authReturnTo: "home", authMode: "create", authCode: "", displayName: "",
  onboardingComplete: false, termsAccepted: false, privacyAccepted: false, consentBaseline: emptyConsentState, consentPolicyVersions: {}, aiConsent: false, saveFeedbackConsent: false, teacherShareConsent: false,
  marketingConsent: false, shareActive: false, notificationEnabled: false, emailUpdates: false, lastReflection: null,
};

const DemoContext = createContext<{ state: DemoState; setState: Dispatch<SetStateAction<DemoState>> } | null>(null);
const OwnerWorkspace = lazy(() => import("./staff/owner").then(module => ({ default: module.OwnerWorkspace })));
const TeacherWorkspace = lazy(() => import("./staff/teacher").then(module => ({ default: module.TeacherWorkspace })));
const CourseDetailScreen = lazy(() => import("./courses/CourseDetailScreen"));
const DiscoverScreen = lazy(() => import("./courses/DiscoverScreen"));
const LazyJourneyScreen = lazy(() => import("./JourneyScreen"));
const PracticeFlowScreen = lazy(() => import("./practice/PracticeFlowScreen"));
const ContentReviewWorkspace = lazy(() => import("./practice/ContentReviewWorkspace"));
const WebAuthCallback = lazy(() => import("./backend/AuthCallback"));

function useDemo() {
  const context = useContext(DemoContext);
  if (!context) throw new Error("Prototype state missing");
  const update = (patch: Partial<DemoState>) => context.setState(previous => ({ ...previous, ...patch }));
  return { ...context, update };
}
function useLearnerContinuation() {
  const { state } = useDemo();
  const flow = useFlow();
  const latest = useRef(state); latest.current = state;
  const route = useRef({ key: flow.current.key, generation: 0 });
  if (route.current.key !== flow.current.key) route.current = { key: flow.current.key, generation: route.current.generation + 1 };
  const mounted = useRef(true);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  return () => {
    const expected = latest.current, generation = learnerSessionGeneration(), routeGeneration = route.current.generation;
    return (value = latest.current) => mounted.current && generation === learnerSessionGeneration()
      && routeGeneration === route.current.generation
      && value.userId === expected.userId && value.signedIn === expected.signedIn;
  };
}
function latestFeedback(state: DemoState) {
  return rememberedPace(state.history, state.saveFeedbackConsent && state.rememberPace && state.usePreviousFeedback);
}
function clearAccountScopedState(previous: DemoState): DemoState {
  return {
    ...previous,
    signedIn: false,
    userId: null,
    accountEmail: "",
    displayName: "",
    bodyStyle: "feminine",
    checkinStep: 1,
    minutes: 10,
    energy: null,
    regions: [],
    bodyStatus: null,
    preObservations: [],
    postObservations: [],
    postBodyStatus: null,
    dialogueChoice: null,
    dialogueText: "",
    unrecognizedText: "",
    aiConversation: [],
    aiPending: false,
    aiError: "",
    aiCapability: "disabled",
    selectedCourseId: null,
    selectedLessonId: null,
    checkinBaselineReady: false,
    reflectionHasCheckinBaseline: false,
    reflectionBeforeStatus: null,
    reflectionBeforeObservations: [],
    reflectionLessonTitle: "",
    outcome: null,
    pace: null,
    note: "",
    endedEarly: false,
    usePreviousFeedback: false,
    history: [],
    termsAccepted: false,
    privacyAccepted: false,
    consentBaseline: emptyConsentState,
    consentPolicyVersions: {},
    aiConsent: false,
    saveFeedbackConsent: false,
    teacherShareConsent: false,
    marketingConsent: false,
    shareActive: false,
    notificationEnabled: false,
    emailUpdates: false,
    remoteCheckins: [],
    checkinReadStatus: "ready",
    currentRemoteCheckinId: null,
    pendingCheckinIdempotencyKey: null,
    pendingCheckinPayload: null,
    backendError: "",
    lastReflection: null,
  };
}

function hasCurrentAiConsent(state: DemoState) {
  return state.aiConsent
    && state.consentPolicyVersions.ai_processing === CONSENT_POLICY_VERSIONS.ai_processing;
}
function isCheckinAuthReturn(destination: string) {
  return destination === "discover" || destination === "dialogue";
}
function hasCheckinTransferDraft(state: Pick<DemoState, "authReturnTo" | "bodyStatus" | "preObservations" | "energy" | "pendingCheckinPayload">) {
  return isCheckinAuthReturn(state.authReturnTo) && Boolean(state.bodyStatus || state.preObservations.length || state.energy || state.pendingCheckinPayload);
}
function normalizeAuthDestination(destination: string) {
  return destination === "dialogue" ? "discover" : destination;
}
function hasCheckinBaseline(state: Pick<DemoState, "bodyStatus">) {
  return state.bodyStatus !== null && state.bodyStatus !== "skipped";
}
function BrandMark({ animated = false }: { animated?: boolean }) {
  return <svg viewBox="0 0 100 100" aria-hidden="true" focusable="false" className={animated ? "mcy-open-space-mark mcy-open-space-mark-animated" : "mcy-open-space-mark"}>
    <path className="mcy-mark-arc" d="M67 19C53 12 36 15 25 26C13 38 12 56 21 70C29 82 44 87 58 82" fill="none" stroke="currentColor" strokeWidth="5.2" strokeLinecap="round" strokeLinejoin="round" pathLength="100" />
    <circle className="mcy-mark-point" cx="74" cy="34" r="3.5" fill="currentColor" />
  </svg>;
}
function Brand({ locale, compact = false, heading = false }: { locale: AppLocale; compact?: boolean; heading?: boolean }) {
  const BrandTag = heading ? "h1" : "span";
  return <BrandTag className={compact ? "mcy-brand compact" : "mcy-brand mcy-brand-animated"}><BrandMark animated={!compact} /><span className="mcy-brand-wordmark">{msg(locale, "brand.name")}</span></BrandTag>;
}
const BODY_LEVELS: BodyLevel[] = ["Không khó chịu", "Nhẹ", "Vừa", "Nhiều"];
const BODY_STYLES: { id: BodyStyle; label: string; image: string }[] = [
  { id: "feminine", label: "Hình thể nữ", image: "/assets/body-map-feminine-full-1024.webp" },
  { id: "masculine", label: "Hình thể nam", image: "/assets/body-map-masculine-full-1024.webp" },
  { id: "neutral", label: "Trung tính", image: "/assets/body-map-neutral-full-1024.webp" },
];
const REGION_POSITION: Record<BodyRegion, { x: number; y: number }> = {
  neck: { x: 50, y: 18 }, shoulder: { x: 50, y: 24 },
  upper_back: { x: 50, y: 32 }, lower_back: { x: 50, y: 43 },
  upper_arm: { x: 50, y: 30 }, elbow: { x: 50, y: 41 },
  forearm_wrist: { x: 50, y: 52 }, hand: { x: 50, y: 62 },
  knee: { x: 50, y: 73 }, foot: { x: 50, y: 94 },
};
const REGION_SIDE_OFFSET: Partial<Record<BodyRegion, number>> = {
  shoulder: 16, upper_arm: 20, elbow: 25, forearm_wrist: 29, hand: 27, knee: 8, foot: 7,
};
function regionSidePosition(region: BodyRegion, side: BodySide) {
  if (side === "unspecified" || side === "both" || !isPairedBodyRegion(region)) return REGION_POSITION[region];
  const offset = REGION_SIDE_OFFSET[region] ?? 14;
  return { x: 50 + (side === "left" ? -offset : offset), y: REGION_POSITION[region].y };
}
function currentAppLocale(): AppLocale { return typeof document !== "undefined" && document.documentElement.lang === "en" ? "en-US" : "vi-VN"; }
function makeSnapshot(kind: Snapshot["kind"], status: BodyStatus, observations: Observation[], extra: Partial<Snapshot> = {}, recordedAt = new Date()): Snapshot {
  const date = `${recordedAt.getFullYear()}-${String(recordedAt.getMonth() + 1).padStart(2, "0")}-${String(recordedAt.getDate()).padStart(2, "0")}`;
  return { id: crypto.randomUUID(), day: localDateOrdinal(date), date, time: recordedAt.toLocaleTimeString(currentAppLocale(), { hour: "2-digit", minute: "2-digit" }), kind, status, observations: observations.map(item => ({ ...item })), ...extra };
}
function localDateOrdinal(isoDate: string) { return Math.floor(Date.parse(`${isoDate}T00:00:00Z`) / 86_400_000); }
function todayLocalDate() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}
function mapDatabaseObservation(row: LearnerObservation): Observation {
  const decoded = decodeBodyRegionCode(row.region_code);
  if (!decoded) throw new Error(`Unsupported body region from database: ${row.region_code}`);
  const level: BodyLevel | null = row.state === "no_discomfort" ? "Không khó chịu" : row.level === 1 ? "Nhẹ" : row.level === 2 ? "Vừa" : row.level !== null && row.level >= 3 ? "Nhiều" : null;
  return { ...decoded, level, status: row.state === "uncertain" || row.state === "skipped" ? "uncertain" : "reported", note: row.note ?? "" };
}
function observationsFromDatabase(rows: LearnerObservation[]) {
  const values = rows.map(mapDatabaseObservation);
  const consumed = new Set<number>();
  const result: Observation[] = [];
  values.forEach((item, index) => {
    if (consumed.has(index)) return;
    const partnerIndex = item.side === "left" ? values.findIndex((candidate, candidateIndex) =>
      candidateIndex !== index && !consumed.has(candidateIndex) && candidate.region === item.region
      && candidate.side === "right" && candidate.level === item.level && candidate.status === item.status && candidate.note === item.note,
    ) : -1;
    if (partnerIndex >= 0) {
      consumed.add(partnerIndex);
      result.push({ ...item, side: "both" });
    } else result.push(item);
    consumed.add(index);
  });
  return result;
}
function snapshotFromDatabase(row: LearnerCheckin, rows: LearnerObservation[]): Snapshot {
  const date = row.local_date;
  return {
    id: row.id,
    remoteId: row.id,
    day: localDateOrdinal(date),
    date,
    time: new Date(row.created_at).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
    kind: row.capture_type === "standalone" ? "Ghi riêng" : "Trước tập",
    status: (row.body_status as BodyStatus) ?? null,
    observations: observationsFromDatabase(rows.filter(item => item.checkin_id === row.id)),
  };
}
function consentStateForDemo(state: DemoState): ConsentState {
  return {
    terms: state.termsAccepted,
    privacy: state.privacyAccepted,
    wellbeing_data: state.saveFeedbackConsent,
    ai_processing: state.aiConsent,
    teacher_sharing: state.teacherShareConsent,
    notifications: state.notificationEnabled,
    marketing: state.marketingConsent,
  };
}
async function persistConsentChanges(state: DemoState, source: "onboarding" | "settings", retryKeys: Map<string,string>) {
  // The development-only layout preview has no Auth identity or database writes.
  if (import.meta.env.DEV && !state.userId && new URLSearchParams(window.location.search).get("review-screen") === "consent") {
    return { consents: consentStateForDemo(state), policyVersions: state.consentPolicyVersions, matchesRequested: true, hasUnsettledWrites: false };
  }
  if (!state.userId) throw new Error("account_changed");
  const generation = learnerSessionGeneration();
  const client = await getAccountBoundSupabaseClient(state.userId);
  return persistConsentChoices(client, state.userId, consentStateForDemo(state), source, retryKeys, clientChannel(), () => generation === learnerSessionGeneration());
}
async function persistProfile(state: DemoState, displayName: string, bodyStyle: BodyStyle, locale: AppLocale = state.locale) {
  if (!state.userId) return;
  const generation = learnerSessionGeneration();
  const shared = await getSupabaseClient();
  if (!shared) return;
  const { data: auth } = await shared.auth.getSession();
  if (auth.session?.user.id !== state.userId) throw new Error("account_changed");
  const session = auth.session;
  const client = await getAccountBoundSupabaseClient(state.userId);
  if (generation !== learnerSessionGeneration()) return false;
  const { error } = await client.from("profiles").upsert({
    user_id: state.userId,
    display_name: displayName.trim() || null,
    locale,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Ho_Chi_Minh",
    body_display_preference: bodyStyle,
  }, { onConflict: "user_id" });
  if (error) throw new Error(error.message);
  if (generation !== learnerSessionGeneration()) return false;
  const emailLocale = Capacitor.isNativePlatform()
    ? normalizeEmailLocale(session.user.user_metadata.locale) ?? locale
    : locale !== state.locale ? locale : readEmailLocale(state.locale);
  rememberEmailLocale(emailLocale);
  return syncAuthEmailLocale(session, emailLocale);
}
function toLearnerCheckinPayload(state: DemoState, captureType: CheckinPayload["captureType"], idempotencyKey: string): CheckinPayload {
  const observations: CheckinPayload["observations"] = [];
  for (const item of state.preObservations) {
    for (const regionCode of bodyRegionCodes(item.region, item.side)) {
      const clear = item.level === "Không khó chịu";
      const state = item.status === "uncertain" || (!clear && !item.level) ? "uncertain" : clear ? "no_discomfort" : "discomfort";
      observations.push({
        regionCode,
        state,
        level: state === "discomfort" ? Math.max(1, BODY_LEVELS.indexOf(item.level!)) : null,
        note: item.note.trim() || null,
      });
    }
  }
  const energyValues: Energy[] = ["Rất thấp", "Thấp", "Bình thường", "Khá ổn", "Tràn đầy"];
  return {
    localDate: todayLocalDate(),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Ho_Chi_Minh",
    energyLevel: state.energy ? energyValues.indexOf(state.energy) : null,
    bodyStatus: state.bodyStatus,
    captureType,
    observations,
    idempotencyKey,
  };
}
type CheckinSaveResult =
  | { status: "saved_account"; snapshot: Snapshot }
  | { status: "saved_session" }
  | { status: "not_saved_permission" }
  | { status: "cancelled" };

async function persistCurrentCheckin(
  state: DemoState,
  setState: Dispatch<SetStateAction<DemoState>>,
  captureType: CheckinPayload["captureType"],
  canDispatch: () => boolean,
): Promise<CheckinSaveResult> {
  if (!canDispatch()) return { status: "cancelled" };
  if (!state.saveFeedbackConsent) return { status: "not_saved_permission" };
  // Only the existing opted-in guest standalone path records local history.
  if (!state.signedIn) return { status: captureType === "standalone" ? "saved_session" : "not_saved_permission" };
  if (!state.userId) return { status: "not_saved_permission" };
  const expectedUserId = state.userId;
  const generation = learnerSessionGeneration();
  const client = await getAccountBoundSupabaseClient(expectedUserId);
  if (generation !== learnerSessionGeneration() || !canDispatch()) return { status: "cancelled" };
  const payload = state.pendingCheckinPayload ?? toLearnerCheckinPayload(state, captureType, state.pendingCheckinIdempotencyKey ?? crypto.randomUUID());
  const idempotencyKey = payload.idempotencyKey;
  const current = (previous: DemoState) => generation === learnerSessionGeneration() && isCurrentLearnerSession(previous.signedIn, previous.userId, expectedUserId);
  setState(previous => current(previous)
    ? { ...previous, pendingCheckinIdempotencyKey: idempotencyKey, pendingCheckinPayload: payload, backendStatus: "loading", backendError: "" }
    : previous);
  const saved = await saveLearnerCheckin(client, payload, expectedUserId);
  if (generation !== learnerSessionGeneration()) return { status: "cancelled" };
  const row: LearnerCheckin = {
    id: saved.checkin_id,
    user_id: state.userId,
    local_date: payload.localDate,
    local_timezone: payload.timezone,
    energy_level: payload.energyLevel,
    overall_note: null,
    body_status: payload.bodyStatus,
    capture_type: payload.captureType,
    idempotency_key: idempotencyKey,
    created_at: saved.created_at,
    updated_at: saved.created_at,
  };
  const snapshot = snapshotFromDatabase(row, payload.observations.map((item, index) => ({
    id: `${saved.checkin_id}-${index}`,
    checkin_id: saved.checkin_id,
    user_id: state.userId!,
    region_code: item.regionCode,
    state: item.state,
    level: item.level,
    note: item.note,
    created_at: saved.created_at,
    updated_at: saved.created_at,
  })));
  setState(previous => current(previous)
    ? {
        ...previous,
        remoteCheckins: [...previous.remoteCheckins.filter(item => item.remoteId !== saved.checkin_id), snapshot],
        ...(previous.pendingCheckinIdempotencyKey === idempotencyKey ? {
          currentRemoteCheckinId: saved.checkin_id, pendingCheckinIdempotencyKey: null, pendingCheckinPayload: null, backendStatus: "ready" as const,
        } : {}),
        backendError: "",
      }
    : previous);
  return { status: "saved_account", snapshot };
}
async function handleNativeAuthUrl(url: string) {
  const client = await getSupabaseClient();
  if (!client) return;
  const code = nativeAuthCodeFromCallback(
    url,
    authRedirectUrl(),
    window.localStorage.getItem(NATIVE_AUTH_PENDING_KEY),
  );
  if (!code) return;
  const { error } = await client.auth.exchangeCodeForSession(code);
  if (error) throw error;
  window.localStorage.removeItem(NATIVE_AUTH_PENDING_KEY);
}
function BodyMap({ observations, bodyStyle, compact = false, onSelect, showAll = true, locale = "vi-VN", group }: { observations: Observation[]; bodyStyle: BodyStyle; compact?: boolean; onSelect?: (region: BodyRegion, side?: BodySide) => void; showAll?: boolean; locale?: AppLocale; group?: BodyRegionGroup }) {
  const [imageFailed, setImageFailed] = useState(false);
  const image = BODY_STYLES.find(item => item.id === bodyStyle)?.image ?? BODY_STYLES[0].image;
  useEffect(() => setImageFailed(false), [image]);
  const regions = group ? BODY_REGION_GROUPS[group] : BODY_REGIONS;
  const points: { key: string; region: BodyRegion; item?: Observation; side?: BodySide; x: number; y: number }[] = [];
  regions.forEach(region => {
    const entries = observations.filter(entry => entry.region === region);
    if (!isPairedBodyRegion(region)) {
      const item = entries[0];
      if (item || (onSelect && showAll)) points.push({ key: region, region, item, ...REGION_POSITION[region] });
      return;
    }
    const left = entries.find(item => item.side === "left" || item.side === "both");
    const right = entries.find(item => item.side === "right" || item.side === "both");
    const unspecified = entries.find(item => item.side === "unspecified");
    if (left || (onSelect && showAll)) points.push({ key: `${region}-left`, region, item: left, side: "left", ...regionSidePosition(region, "left") });
    if (right || (onSelect && showAll)) points.push({ key: `${region}-right`, region, item: right, side: "right", ...regionSidePosition(region, "right") });
    if (unspecified) points.push({ key: `${region}-unspecified`, region, item: unspecified, side: "unspecified", ...regionSidePosition(region, "unspecified") });
  });
  return <div className={`mcy-body-map-v2${compact ? " compact" : ""}`}>
    <div className="mcy-body-art">
      {imageFailed ? <p className="mcy-body-fallback">{locale === "en-US" ? "The illustration did not load. You can still choose an area from the list." : "Hình minh họa chưa tải. Bạn vẫn có thể chọn vùng trong danh sách."}</p> : <img src={image} srcSet={`${image.replace("-1024.webp", "-512.webp")} 512w, ${image} 1024w`} sizes={compact ? "128px" : "(max-width: 380px) 190px, (max-width: 700px) 230px, 280px"} alt={locale === "en-US" ? "Full body illustration, viewed from behind" : "Minh họa toàn thân nhìn từ phía sau"} loading="eager" decoding="async" onError={() => setImageFailed(true)} />}
      {!imageFailed && points.map(({ key, region, item, side, x, y }) => {
        const className = `mcy-map-pin${item ? ` is-${item.status === "uncertain" ? "uncertain" : item.level === "Không khó chịu" ? "clear" : item.level === "Nhiều" ? "high" : "reported"}` : ""}`;
        const style = { left: `${x}%`, top: `${y}%` };
        const label = side && side !== "unspecified" ? `${regionLabel(locale, region)} ${sideLabel(locale, side).toLowerCase()}` : regionLabel(locale, region);
        const marker = item?.status === "uncertain" ? "?" : item?.level === "Không khó chịu" ? "✓" : item ? "•" : "+";
        const itemLabel = item ? item.status === "uncertain" ? bodyLevelLabel(locale, "Chưa rõ") : bodyLevelLabel(locale, item.level ?? msg(locale, "checkin.notRecorded")) : msg(locale, "checkin.tapToRecord");
        return onSelect ? <button key={key} type="button" className={className} style={style} aria-label={`${label}: ${itemLabel}`} onClick={() => onSelect(region, side)}><span aria-hidden="true">{marker}</span></button> : <span key={key} className={className} style={style} aria-label={`${label}: ${itemLabel}`}><span aria-hidden="true">{marker}</span></span>;
      })}
    </div>
    {!compact && <small className="mcy-body-orientation" data-testid="body-orientation">{msg(locale, "checkin.orientation")}</small>}
  </div>;
}
function BodyStylePicker({ value, onChange }: { value: BodyStyle; onChange: (style: BodyStyle) => void }) {
  const { state } = useDemo();
  const locale = state.locale;
  const styleLabel = (style: BodyStyle) => locale === "en-US" ? style === "neutral" ? "Neutral" : style === "feminine" ? "Feminine" : "Masculine" : BODY_STYLES.find(item => item.id === style)?.label ?? "Trung tính";
  const [open, setOpen] = useState(false);
  return <><button className="mcy-style-link" onClick={() => setOpen(true)}>{locale === "en-US" ? "Change illustration" : "Đổi hình minh họa"} <ArrowRightIcon /></button>
    <BottomSheet open={open} onOpenChange={setOpen} title={locale === "en-US" ? "Choose an illustration" : "Chọn hình minh họa"} description={locale === "en-US" ? "Choose the figure that helps you identify areas. You can change it any time." : "Chọn hình giúp bạn dễ xác định vùng cơ thể hơn. Có thể đổi bất cứ lúc nào."} snap={0.57}>
      <div className="mcy-style-options">{BODY_STYLES.map(style => <button key={style.id} className={value === style.id ? "selected" : ""} onClick={() => { onChange(style.id); setOpen(false); }} aria-pressed={value === style.id}><img src={style.image} srcSet={`${style.image.replace("-1024.webp", "-512.webp")} 512w, ${style.image} 1024w`} sizes="112px" alt="" loading="lazy" decoding="async" /><strong>{styleLabel(style.id)}</strong>{value === style.id && <CheckIcon />}</button>)}</div>
      <p className="mcy-sheet-footnote">{locale === "en-US" ? "This illustration is a display preference. It does not infer gender or select a practice." : "Đây chỉ là hình hiển thị; không dùng để suy ra giới tính hoặc chọn bài tập."}</p>
    </BottomSheet></>;
}
function RegionEditor({ region, current, suggestedSide, onSave, onDelete, onClose }: { region: BodyRegion | null; current?: Observation; suggestedSide?: BodySide; onSave: (value: Observation) => void; onDelete?: () => void; onClose: () => void }) {
  const { state } = useDemo();
  const locale = state.locale;
  const keyboard = useKeyboard();
  const [level, setLevel] = useState<BodyLevel | "Chưa rõ" | null>(current?.status === "uncertain" ? "Chưa rõ" : current?.level ?? null);
  const [side, setSide] = useState<BodySide>(suggestedSide ?? current?.side ?? "unspecified");
  const [note, setNote] = useState(current?.note ?? "");
  useEffect(() => { setLevel(current?.status === "uncertain" ? "Chưa rõ" : current?.level ?? null); setSide(suggestedSide ?? current?.side ?? "unspecified"); setNote(current?.note ?? ""); }, [region, current?.level, current?.side, current?.note, current?.status, suggestedSide]);
  const close = () => { keyboard.hide(); onClose(); };
  return <BottomSheet open={Boolean(region)} onOpenChange={open => { if (!open) close(); }} title={region ? locale === "en-US" ? `Check in on your ${regionLabel(locale, region).toLowerCase()}` : `Ghi nhận vùng ${regionLabel(locale, region).toLowerCase()}` : locale === "en-US" ? "Check in on an area" : "Ghi nhận vùng"} description={msg(locale, "regionEditor.prompt")} snap={0.9}>
    {region && <div className="mcy-region-editor">
      <div className="mcy-editor-options">{([...BODY_LEVELS, "Chưa rõ"] as const).map(value => <Choice key={value} selected={level === value} onClick={() => setLevel(value)}>{bodyLevelLabel(locale, value)}</Choice>)}</div>
      {isPairedBodyRegion(region) && <><strong>{msg(locale, "regionEditor.side")}</strong><div className="mcy-editor-options side">{(["unspecified", "left", "right", "both"] as BodySide[]).map(value => <Choice key={value} selected={side === value} onClick={() => setSide(value)}>{sideLabel(locale, value)}</Choice>)}</div></>}
      <label className="mcy-editor-note">{msg(locale, "regionEditor.note")} <small>{msg(locale, "regionEditor.optional")}</small><KeyboardTextarea placeholder={locale === "en-US" ? `For example: my ${regionLabel(locale, region).toLowerCase()} feels tired after sitting...` : `Ví dụ: ${regionLabel(locale, region).toLowerCase()} mỏi khi ngồi lâu...`} value={note} onChange={event => setNote(event.target.value)} onBlur={() => keyboard.hide()} /></label>
      <button className="mcy-action" disabled={!level} onClick={() => { if (!level) return; keyboard.hide(); onSave({ region, side: isPairedBodyRegion(region) ? side : "unspecified", level: level === "Chưa rõ" ? null : level, status: level === "Chưa rõ" ? "uncertain" : "reported", note: note.trim() }); onClose(); }}>{msg(locale, "regionEditor.save")} <ArrowRightIcon /></button>
      {current && onDelete && <button className="mcy-quiet-link" onClick={() => { keyboard.hide(); onDelete(); onClose(); }}>{msg(locale, "regionEditor.delete")}</button>}
    </div>}
  </BottomSheet>;
}
function EnergyFace({ level }: { level: number }) {
  return <svg viewBox="0 0 36 36" aria-hidden="true"><circle cx="18" cy="18" r="17" fill="currentColor" opacity=".14" /><circle cx="12" cy="15" r="1.2" fill="currentColor" /><circle cx="24" cy="15" r="1.2" fill="currentColor" /><path d={level < 2 ? "M12 25 Q18 20 24 25" : level === 2 ? "M13 23 Q18 25 23 23" : "M11 21 Q18 29 25 21"} stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" /></svg>;
}
function Header({ title, back = false }: { title?: string; back?: boolean }) {
  const flow = useFlow();
  const { state } = useDemo();
  const locale = state.locale;
  const localizedTitle = locale === "en-US"
    ? ({ "Check-in hôm nay": "Today's check-in", "Phản hồi của bạn": "Your reflection" } as Record<string, string>)[title ?? ""] ?? title
    : title;
  useLayoutEffect(() => {
    const scroll = document.querySelector<HTMLElement>("[data-testid='flow-current'] .mobile-scroll");
    if (scroll) scroll.scrollTop = 0;
  }, [flow.current.key]);
  const brandName = msg(locale, "brand.name");
  return <div className="mcy-header">{back ? <button className="mcy-icon-button" aria-label={locale === "en-US" ? "Back" : "Quay lại"} onClick={() => flow.pop()}><ArrowLeftIcon /></button> : <span />}<span className="mcy-header-title" aria-label={localizedTitle ?? brandName}>{brandName}</span><span /></div>;
}
function Action({ children, onClick, disabled = false, secondary = false }: { children: React.ReactNode; onClick: () => void; disabled?: boolean; secondary?: boolean }) {
  return <button className={secondary ? "mcy-action secondary" : "mcy-action"} onClick={event => { event.currentTarget.blur(); onClick(); }} disabled={disabled}>{children}<ArrowRightIcon /></button>;
}
function Choice({ selected, onClick, disabled = false, children }: { selected: boolean; onClick?: () => void; disabled?: boolean; children: React.ReactNode }) {
  return <button className={selected ? "mcy-choice selected" : "mcy-choice"} aria-pressed={selected} disabled={disabled} onClick={() => onClick?.()}>{children}</button>;
}
function Eyebrow({ children }: { children: React.ReactNode }) { return <div className="mcy-eyebrow">{children}</div>; }
function DemoNote({ children }: { children: React.ReactNode }) { return <p className="mcy-info-note"><InfoCircledIcon />{children}</p>; }
function authErrorMessage(cause: unknown, fallback: string) {
  const message = cause && typeof cause === "object" && "message" in cause && typeof cause.message === "string"
    ? cause.message
    : "";
  if (/rate.?limit|too many requests|over_email_send_rate_limit/i.test(message)) {
    return "Dịch vụ email đang tạm giới hạn yêu cầu. Hãy dùng email mới nhất đã gửi và tránh bấm gửi lại liên tục. Nếu liên kết hết hạn, chờ giới hạn hồi hoặc cấu hình SMTP riêng để tiếp tục kiểm thử.";
  }
  return message || fallback;
}

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
      "Chọn mức phù hợp và thêm ghi chú nếu muốn. “Không khó chịu”, “Chưa rõ” và “Bỏ qua” là các lựa chọn riêng; vùng chưa chọn không được hiểu thành một phản hồi.",
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

function FlowScreenAccessibilityBoundary({ routeId, active, children }: { routeId: string; active: boolean; children: React.ReactNode }) {
  return <div className="mcy-flow-route-accessibility" data-flow-route={routeId} data-flow-active={active ? "true" : "false"} aria-hidden={active ? undefined : true} inert={!active}>{children}</div>;
}

function withFlowScreenAccessibility(screens: Record<string, FlowScreen>): Record<string, FlowScreen> {
  return Object.fromEntries(Object.entries(screens).map(([key, screen]) => {
    const render = screen.render;
    return [key, {
      ...screen,
      render: controls => <FlowScreenAccessibilityBoundary routeId={screen.id} active={controls.current.id === screen.id}>{render(controls)}</FlowScreenAccessibilityBoundary>,
    }];
  })) as Record<string, FlowScreen>;
}

function FlowRouteFocusManager() {
  const { current } = useFlow();
  const lastRouteKey = useRef(current.key);
  useLayoutEffect(() => {
    if (lastRouteKey.current === current.key) return;
    lastRouteKey.current = current.key;
    let frame = 0;
    let attempts = 0;
    let cancelled = false;
    const focusCurrentRoute = () => {
      if (cancelled) return;
      const activeRoute = document.querySelector<HTMLElement>(".mcy-flow-route-accessibility[data-flow-active='true']");
      const heading = activeRoute?.querySelector<HTMLElement>("h1");
      const activeElement = document.activeElement as HTMLElement | null;
      const activeElementRoute = activeElement?.closest<HTMLElement>(".mcy-flow-route-accessibility");
      if (activeElement && activeElement !== document.body && activeElement !== document.documentElement && activeElementRoute?.dataset.flowActive !== "false") return;
      if (heading) {
        if (!heading.hasAttribute("tabindex")) heading.tabIndex = -1;
        heading.focus({ preventScroll: true });
        return;
      }
      attempts += 1;
      if (attempts < 60) {
        frame = requestAnimationFrame(focusCurrentRoute);
        return;
      }
      const firstControl = activeRoute?.querySelector<HTMLElement>("button:not(:disabled), a[href], input:not(:disabled), textarea:not(:disabled), select:not(:disabled), [tabindex]:not([tabindex='-1'])");
      firstControl?.focus({ preventScroll: true });
    };
    frame = requestAnimationFrame(focusCurrentRoute);
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
    };
  }, [current.key]);
  return null;
}

const HELP_ARTICLE_ROUTES: Record<HelpArticleId, FlowScreen> = withFlowScreenAccessibility({
  "body-map": { id: "help-body-map", header: () => <Header title="Hướng dẫn check-in" back />, headerHeight: 55, render: () => <HelpArticleScreen articleId="body-map" /> },
  "pause-video": { id: "help-pause-video", header: () => <Header title="Dừng giữa buổi" back />, headerHeight: 55, render: () => <HelpArticleScreen articleId="pause-video" /> },
  "journey-record": { id: "help-journey-record", header: () => <Header title="Quản lý bản ghi" back />, headerHeight: 55, render: () => <HelpArticleScreen articleId="journey-record" /> },
  "ai-scope": { id: "help-ai-scope", header: () => <Header title="AI và quyền riêng tư" back />, headerHeight: 55, render: () => <HelpArticleScreen articleId="ai-scope" /> },
});

const ROUTES: Record<string, FlowScreen> = withFlowScreenAccessibility({
  welcome: { id: "welcome", footer: () => <WelcomeFooter />, footerHeight: 156, render: () => <WelcomeScreen /> },
  home: { id: "home", header: () => <Header />, headerHeight: 55, footer: () => <BottomNav />, footerHeight: 68, render: () => <HomeScreen /> },
  checkin: { id: "checkin", header: () => <Header title="Check-in hôm nay" back />, headerHeight: 55, footer: () => <CheckinFooter />, footerHeight: 176, render: () => <CheckinScreen /> },
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
  notifications: { id: "notifications", header: () => <Header title="Tùy chọn thông báo" back />, headerHeight: 55, render: () => <AccountDetailScreen panel="notifications" /> },
  access: { id: "access", header: () => <Header title="Nội dung và quyền" back />, headerHeight: 55, render: () => <AccountDetailScreen panel="access" /> },
  help: { id: "help", header: () => <Header title="Hướng dẫn và hỗ trợ" back />, headerHeight: 55, render: () => <AccountDetailScreen panel="help" /> },
  sync: { id: "sync", header: () => <Header title="Phản hồi sau tập" back />, headerHeight: 55, render: () => <SyncScreen /> },
  discoverDetail: { id: "discover-detail", header: () => <Header title="Chi tiết nội dung" back />, headerHeight: 55, render: () => <DiscoverDetailScreen /> },
  courseDetail: { id: "course-detail", header: () => <Header title="Khóa học miễn phí" back />, headerHeight: 55, render: () => <CourseDetailRoute /> },
  readiness: { id: "readiness", header: () => <Header title="Phạm vi hỗ trợ" back />, headerHeight: 55, render: () => <ReadinessScreen /> },
});

function CourseDetailRoute() {
  const flow = useFlow();
  const { state, update } = useDemo();
  return <Suspense fallback={<MobileScroll className="mcy-scroll"><main className="mcy-page"><div className="mcy-inline-note" role="status">{state.locale === "en-US" ? "Opening the lesson…" : "Đang mở bài học…"}</div></main></MobileScroll>}>
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
  </Suspense>;
}

function PracticeRoute() {
  const flow = useFlow();
  const { state, update } = useDemo();
  const context: Omit<PracticeContext, "revision" | "pace" | "guidance" | "floor"> = {
    locale: state.locale, minutes: state.minutes, energy: state.energy, intent: state.intent, bodyStatus: state.bodyStatus,
    regions: [...new Set(state.preObservations.flatMap(item => bodyRegionCodes(item.region, item.side)))],
  };
  return <Suspense fallback={<MobileScroll className="mcy-scroll"><main className="mcy-page"><p role="status">Đang mở buổi học…</p></main></MobileScroll>}><PracticeFlowScreen
    context={context} userId={state.userId} consentCurrent={hasCurrentAiConsent(state)} active={flow.current.id === ROUTES.dailyPractice.id}
    previousWasTooFast={Boolean(rememberedPace(state.history, state.saveFeedbackConsent && state.rememberPace))}
    onBrowse={() => flow.push(ROUTES.discover)} onConsent={() => flow.push(ROUTES.privacy)} onAdjust={() => flow.pop()}
    onReflect={(title, endedEarly) => {
      update({ checkinBaselineReady: false, reflectionHasCheckinBaseline: state.checkinBaselineReady, reflectionBeforeStatus: state.checkinBaselineReady ? state.bodyStatus : null, reflectionBeforeObservations: state.checkinBaselineReady ? [...state.preObservations] : [], reflectionLessonTitle: title, postObservations: [], postBodyStatus: null, outcome: null, pace: null, note: "", endedEarly });
      flow.push(ROUTES.reflection);
    }}
  /></Suspense>;
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
  return <Suspense fallback={<MobileScroll className="mcy-scroll"><main className="mcy-page"><div className="mcy-inline-note" role="status">{state.locale === "en-US" ? "Opening free lessons…" : "Đang mở bài học miễn phí…"}</div></main></MobileScroll>}>
    <DiscoverScreen
      locale={state.locale}
      onOpenCourse={(courseId, firstLessonId) => {
        update({ selectedCourseId: courseId, selectedLessonId: firstLessonId });
        flow.push(ROUTES.courseDetail);
      }}
      onOpenGuide={() => flow.push(ROUTES.discoverDetail)}
    />
  </Suspense>;
}

function JourneyRoute() {
  const flow = useFlow();
  const { state, setState, update } = useDemo();
  return <Suspense fallback={<MobileScroll className="mcy-scroll"><main className="mcy-page"><div className="mcy-inline-note" role="status">{state.locale === "en-US" ? "Opening your journey…" : "Đang mở Hành trình…"}</div></main></MobileScroll>}>
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
        if (state.pendingCheckinPayload) {
          update({ checkinStep: 2 });
          flow.push(ROUTES.checkin);
          return;
        }
        update({ dialogueChoice: null, dialogueText: "", aiConversation: [], aiPending: false, aiError: "", minutes: 10, energy: null, regions: [], preObservations: [], postObservations: [], bodyStatus: null, postBodyStatus: null, outcome: null, pace: null, note: "", endedEarly: false, usePreviousFeedback: false, lastReflection: null, checkinBaselineReady: false, reflectionHasCheckinBaseline: false, reflectionBeforeStatus: null, reflectionBeforeObservations: [], reflectionLessonTitle: "", currentRemoteCheckinId: null, pendingCheckinIdempotencyKey: null, pendingCheckinPayload: null });
        flow.push(ROUTES.checkin);
      }}
    />
  </Suspense>;
}

function finishAtAuthDestination(flow: ReturnType<typeof useFlow>, destination: string) {
  const target = ROUTES[destination] ?? ROUTES.home;
  let targetIndex = -1;
  flow.stack.forEach((entry, index) => { if (entry.id === target.id) targetIndex = index; });
  const stepsToPop = targetIndex >= 0 ? flow.stack.length - targetIndex - 1 : flow.stack.length - 1;
  for (let index = 0; index < stepsToPop; index += 1) flow.pop();
  if (targetIndex < 0) flow.replace(target);
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
    if (!shouldInitializeAuthForCurrentLaunch()) {
      setState(previous => ({ ...previous, backendStatus: "ready", backendError: "" }));
      return;
    }
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
      setState(previous => ({ ...(switchedAccount ? clearAccountScopedState(previous) : previous), backendStatus: "loading", checkinReadStatus: "loading", backendError: "" }));
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
          currentRemoteCheckinId: previous.currentRemoteCheckinId ?? remoteCheckins.at(-1)?.remoteId ?? null,
          backendStatus: "ready",
          checkinReadStatus: "ready",
          backendError: "",
        }));
      } catch (error) {
        if (!active || generation !== hydrationGeneration) return;
        setState(previous => ({
          ...(switchedAccount ? clearAccountScopedState(previous) : previous),
          signedIn: true,
          userId: session.user.id,
          accountEmail: session.user.email ?? previous.accountEmail,
          backendStatus: "error",
          checkinReadStatus: "error",
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
        const { data, error } = await authClient.auth.getSession();
        if (!active) return;
        if (error) setState(previous => ({ ...previous, backendStatus: "error", checkinReadStatus: "error", backendError: error.message }));
        else { observeLearnerSession(data.session?.user.id ?? null); void hydrate(data.session); }
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
          checkinReadStatus: "error",
          backendError: error instanceof Error ? error.message : "Chưa tải được kết nối tài khoản. Hãy thử lại.",
        }));
      }
    })();
    return () => {
      active = false;
      subscription?.unsubscribe();
      void appUrlListener?.remove();
    };
  }, [reviewConsentScreen]);
  return <DemoContext.Provider value={{ state, setState }}><FlowStack initial={reviewConsentScreen ? ROUTES.consent : ROUTES.welcome}><AuthSessionRouter /><FlowRouteFocusManager /><PracticeCapabilityObserver /></FlowStack></DemoContext.Provider>;
}

function AuthSessionRouter() {
  const { state } = useDemo();
  const flow = useFlow();
  useEffect(() => {
    if (!state.signedIn || state.backendStatus !== "ready") return;
    if (![ROUTES.welcome.id, ROUTES.authEmail.id, ROUTES.authCode.id].includes(flow.current.id)) return;
    if (!hasCurrentRequiredConsent(consentStateForDemo(state), state.consentPolicyVersions)) flow.replace(ROUTES.consent);
    else if (!state.onboardingComplete) flow.replace(ROUTES.onboarding);
    else finishAtAuthDestination(flow, normalizeAuthDestination(state.authReturnTo));
  }, [flow, state.authReturnTo, state.backendStatus, state.consentPolicyVersions, state.onboardingComplete, state.privacyAccepted, state.signedIn, state.termsAccepted]);
  return null;
}

function WelcomeScreen() {
  const { state } = useDemo();
  const locale = state.locale;
  return <MobileScroll className="mcy-scroll welcome"><main className="mcy-welcome">
    <img className="mcy-welcome-photo" src="/assets/welcome-portrait-1024.webp" srcSet="/assets/welcome-portrait-512.webp 512w, /assets/welcome-portrait-1024.webp 1024w" sizes="(min-width: 700px) 450px, 100vw" alt={locale === "en-US" ? "A woman resting on a yoga mat" : "Người ngồi thư giãn trên thảm yoga"} loading="eager" fetchPriority="high" decoding="async" />
    <div className="mcy-welcome-top"><Brand locale={locale} heading />{import.meta.env.DEV && <LocaleToggle />}<p>{msg(locale, "brand.slogan")}</p>{locale === "en-US" && <small className="mcy-slogan-note">{msg(locale, "brand.sloganNote")}</small>}</div>
    <div className="mcy-welcome-benefits"><div><span><PersonIcon /></span>{msg(locale, "welcome.benefit1")}</div><div><span><HeartIcon /></span>{msg(locale, "welcome.benefit2")}</div><div><span><MagicWandIcon /></span>{msg(locale, "welcome.benefit3")}</div></div>
    <p className="mcy-welcome-quote">{msg(locale, "welcome.quote")}</p>
  </main></MobileScroll>;
}

function LocaleToggle() {
  const { state, update } = useDemo();
  const locale = state.locale;
  return <button className="mcy-language-toggle" aria-label={msg(locale, locale === "vi-VN" ? "locale.switchToEnglish" : "locale.switchToVietnamese")} onClick={() => update({ locale: locale === "vi-VN" ? "en-US" : "vi-VN" })}>{locale === "vi-VN" ? "VI / EN*" : "EN / VI"}</button>;
}

function WelcomeFooter() {
  const flow = useFlow();
  const { state, update } = useDemo();
  const locale = state.locale;
  return <div className="mcy-flow-footer mcy-welcome-footer mcy-welcome-bottom">
    <Action onClick={() => { update({ checkinStep: 1 }); flow.push(ROUTES.checkin); }}>{msg(locale, "welcome.tryGuest")}</Action>
    <div className="mcy-welcome-auth"><button onClick={() => { update({ authMode: "create", authReturnTo: "home" }); flow.push(ROUTES.authEmail); }}>{msg(locale, "welcome.createAccount")}</button><button onClick={() => { update({ authMode: "login", authReturnTo: "home" }); flow.push(ROUTES.authEmail); }}>{msg(locale, "welcome.login")}</button></div>
    <small>{msg(locale, "welcome.note")}</small>
  </div>;
}

function AuthEmailScreen() {
  const flow = useFlow();
  const keyboard = useKeyboard();
  const { state, update } = useDemo();
  const [email, setEmail] = useState(state.accountEmail);
  const [emailLocale, setEmailLocale] = useState(() => readEmailLocale(state.locale));
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const submit = async () => {
    keyboard.hide();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { setError("Kiểm tra lại địa chỉ email bạn vừa nhập."); return; }
    if (!backendConfigured) { setError("Backend chưa được cấu hình cho môi trường này."); return; }
    setSending(true);
    setError("");
    try {
      const native = Capacitor.isNativePlatform();
      if (native) window.localStorage.setItem(NATIVE_AUTH_PENDING_KEY, String(Date.now()));
      const client = await getSupabaseClient();
      if (!client) { setError("Backend chưa được cấu hình cho môi trường này."); return; }
      const { error: authError } = await client.auth.signInWithOtp({
        email: email.trim(),
        options: { shouldCreateUser: state.authMode === "create", emailRedirectTo: authRedirectUrl("learner", emailLocale), data: { locale: emailLocale } },
      });
      if (authError) {
        if (native) window.localStorage.removeItem(NATIVE_AUTH_PENDING_KEY);
        setError(authErrorMessage(authError, "Chưa gửi được email xác minh. Hãy thử lại sau."));
        return;
      }
      update({ accountEmail: email.trim(), authCode: "" });
      flow.replace(ROUTES.authCode);
    } catch (cause) {
      if (Capacitor.isNativePlatform()) window.localStorage.removeItem(NATIVE_AUTH_PENDING_KEY);
      setError(authErrorMessage(cause, "Chưa gửi được email xác minh. Hãy thử lại sau."));
    } finally {
      setSending(false);
    }
  };
  return <MobileScroll className="mcy-scroll"><main className="mcy-page mcy-auth-page">
    <Eyebrow>{state.authMode === "create" ? "TẠO TÀI KHOẢN" : "ĐĂNG NHẬP"}</Eyebrow>
    <h1>Dùng email bạn có thể mở ngay.</h1>
    <p className="mcy-lead">Gửi email xác minh tới địa chỉ này. Nếu email có mã xác minh, bạn có thể nhập ở bước tiếp theo; nếu có liên kết đăng nhập, hãy mở trên {Capacitor.isNativePlatform() ? "điện thoại này" : "trình duyệt này"}.</p>
    <label className="mcy-form-field">Email<KeyboardInput inputMode="email" autoComplete="email" aria-label="Địa chỉ email" placeholder="ban@example.com" value={email} onChange={event => { setEmail(event.target.value); setError(""); }} onBlur={() => keyboard.hide()} /></label>
    <EmailLanguageSelect value={emailLocale} disabled={sending} onChange={locale => { setEmailLocale(locale); rememberEmailLocale(locale); }} />
    {state.authMode === "create" && <div className="mcy-inline-note" role="note"><InfoCircledIcon />Giáo viên cũng đăng ký bằng email xác minh. Quyền giáo viên chỉ được cấp qua lời mời đã kiểm tra; pilot hiện chưa mở đăng ký công khai.</div>}
    {error && <div className="mcy-form-error" role="alert">{error}</div>}
    <div className="mcy-inline-note"><InfoCircledIcon />Chỉ dùng để đăng nhập và gửi biên nhận yêu cầu. Không cần nhập số điện thoại, ngày sinh hay tên thật.</div>
    {!backendConfigured && <div className="mcy-alert">Backend chưa kết nối ở môi trường hiện tại. Bạn vẫn có thể xem và thử luồng khách.</div>}
    <Action disabled={sending || !backendConfigured} onClick={submit}>{sending ? "Đang gửi…" : "Gửi email xác minh"}</Action>
    {isCheckinAuthReturn(state.authReturnTo) && <button className="mcy-quiet-link" onClick={() => { keyboard.hide(); flow.replace(ROUTES.discover); }}>Xem bài học video miễn phí</button>}
    <DemoNote>Email xác minh chỉ dùng qua Supabase Auth. Hãy hoàn tất trên cùng thiết bị để tiếp tục đúng phiên.</DemoNote>
  </main></MobileScroll>;
}

function AuthCodeScreen() {
  const flow = useFlow();
  const keyboard = useKeyboard();
  const { state, update } = useDemo();
  const [code, setCode] = useState(state.authCode);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const verify = async () => {
    keyboard.hide();
    if (!/^(?:\d{6}|\d{8})$/.test(code)) { setError("Nhập đủ mã xác minh trong email để tiếp tục."); return; }
    if (!backendConfigured) { setError("Backend chưa được cấu hình cho môi trường này."); return; }
    setVerifying(true);
    try {
      const client = await getSupabaseClient();
      if (!client) { setError("Backend chưa được cấu hình cho môi trường này."); return; }
      const { data, error: authError } = await client.auth.verifyOtp({ email: state.accountEmail, token: code, type: "email" });
      if (authError || !data.user) { setError("Mã không hợp lệ hoặc đã hết hạn. Hãy kiểm tra hộp thư và thử lại."); return; }
      if (data.session && !Capacitor.isNativePlatform()) await syncAuthEmailLocale(data.session, readEmailLocale(state.locale));
      if (Capacitor.isNativePlatform()) window.localStorage.removeItem(NATIVE_AUTH_PENDING_KEY);
      update({ authCode: "", signedIn: true, userId: data.user.id, accountEmail: data.user.email ?? state.accountEmail, backendStatus: "loading", backendError: "" });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Chưa xác minh được mã. Hãy thử lại.");
    } finally {
      setVerifying(false);
    }
  };
  const resend = async () => {
    if (!backendConfigured) return;
    setResending(true);
    const native = Capacitor.isNativePlatform();
    try {
      if (native) window.localStorage.setItem(NATIVE_AUTH_PENDING_KEY, String(Date.now()));
      const client = await getSupabaseClient();
      if (!client) return;
      const emailLocale = readEmailLocale(state.locale);
      const { error: authError } = await client.auth.signInWithOtp({ email: state.accountEmail, options: { shouldCreateUser: state.authMode === "create", emailRedirectTo: authRedirectUrl("learner", emailLocale), data: { locale: emailLocale } } });
      if (authError) {
        if (native) window.localStorage.removeItem(NATIVE_AUTH_PENDING_KEY);
        setError(authErrorMessage(authError, "Chưa gửi lại được email xác minh."));
        setNotice("");
      } else {
        setError("");
        setNotice("Email xác minh mới đã được gửi. Mã hoặc liên kết cũ có thể hết hiệu lực.");
      }
    } catch (cause) {
      if (native) window.localStorage.removeItem(NATIVE_AUTH_PENDING_KEY);
      setNotice("");
      setError(authErrorMessage(cause, "Chưa gửi lại được email xác minh."));
    } finally {
      setResending(false);
    }
  };
  return <MobileScroll className="mcy-scroll"><main className="mcy-page mcy-auth-page">
    <Eyebrow>XÁC MINH EMAIL</Eyebrow><h1>Kiểm tra hộp thư của bạn.</h1>
    <p className="mcy-lead">Email đã gửi tới <strong>{state.accountEmail}</strong>. Nếu thư có mã xác minh, nhập mã bên dưới. Nếu thư có liên kết, mở trên {Capacitor.isNativePlatform() ? "điện thoại này" : "trình duyệt này"}.</p>
    <label className="mcy-form-field">Mã xác minh (nếu email có mã)<KeyboardInput inputMode="numeric" autoComplete="one-time-code" aria-label="Mã xác minh" placeholder="Nhập mã trong email" value={code} onChange={event => { setCode(event.target.value.replace(/\D/g, "").slice(0, 8)); setError(""); }} onBlur={() => keyboard.hide()} /></label>
    <div className="mcy-code-hint">Mã hoặc liên kết chỉ dùng một lần. Không gửi mã cho người khác.</div>
    {error && <div className="mcy-form-error" role="alert">{error}</div>}
    {notice && <div className="mcy-inline-note" role="status"><InfoCircledIcon />{notice}</div>}
    <Action disabled={verifying} onClick={verify}>{verifying ? "Đang xác minh…" : "Xác minh email"}</Action>
    <div className="mcy-auth-secondary"><button disabled={resending} onClick={() => { setCode(""); void resend(); }}>{resending ? "Đang gửi…" : "Gửi lại email"}</button><button onClick={() => flow.replace(ROUTES.authEmail)}>Đổi email</button></div>
    <DemoNote>Mở liên kết trên cùng thiết bị đã yêu cầu xác minh. Trên điện thoại, liên kết sẽ quay lại ứng dụng.</DemoNote>
  </main></MobileScroll>;
}

function ConsentScreen() {
  const { state, update } = useDemo();
  const togglePurpose = (key: "aiConsent" | "saveFeedbackConsent" | "teacherShareConsent" | "marketingConsent") => {
    if (key === "aiConsent") update({ aiConsent: !state.aiConsent });
    if (key === "saveFeedbackConsent") update({ saveFeedbackConsent: !state.saveFeedbackConsent });
    if (key === "teacherShareConsent" && state.teacherShareConsent) update({ teacherShareConsent: false });
    if (key === "marketingConsent") update({ marketingConsent: !state.marketingConsent });
  };
  return <MobileScroll className="mcy-scroll"><main lang="vi" className="mcy-page mcy-auth-page">
    <Eyebrow>A05 · QUYỀN VÀ ĐIỀU KHOẢN</Eyebrow><h1>Bạn chọn dữ liệu nào được dùng.</h1>
    <p className="mcy-lead">Mỗi mục đích là một lựa chọn riêng. Phiên bản hiện hành được hiển thị trước khi bạn đồng ý; nội dung pháp lý cuối cùng sẽ được cập nhật trước khi mở rộng phát hành.</p>
    {state.locale === "en-US" && <div className="mcy-locale-note" role="note">This consent screen is shown in Vietnamese. Consent evidence records the language displayed as vi-VN.</div>}
    <section className="mcy-consent-card required"><span className="mcy-tag">CẦN ĐỂ TIẾP TỤC TRONG APP</span><strong>Điều khoản dịch vụ và thông báo quyền riêng tư · phiên bản 0.1</strong><p>Supabase đã xác minh email. Đồng ý để tiếp tục sử dụng tài khoản; lựa chọn và phiên bản được ghi thành sự kiện.</p><button aria-pressed={state.termsAccepted && state.privacyAccepted} onClick={() => { const value = !(state.termsAccepted && state.privacyAccepted); update({ termsAccepted: value, privacyAccepted: value }); }}><i>{state.termsAccepted && state.privacyAccepted ? "✓" : ""}</i>{state.termsAccepted && state.privacyAccepted ? "Đã đồng ý phiên bản 0.1" : "Tôi đồng ý điều khoản và thông báo · phiên bản 0.1"}</button></section>
    {([
      ["aiConsent", "Cho phép AI hỗ trợ trao đổi ngắn", "Trợ lý chỉ hoạt động khi máy chủ xác nhận sẵn sàng cho phiên của bạn. Khi bạn xác nhận lựa chọn và đồng ý AI hiện hành, chỉ thời lượng, năng lượng, mục tiêu, mã vùng và sở thích hiện tại được gửi tới dịch vụ AI bên ngoài. Không gửi hội thoại trước đó, tên/email, ghi chú tự do hoặc feedback lịch sử. AI chỉ chọn nội dung đã duyệt, không tạo động tác hoặc chẩn đoán. Bạn có thể rút đồng ý bất cứ lúc nào. Nội dung quyền riêng tư vẫn là bản rà soát, chưa phải văn bản pháp lý cuối cùng.", state.aiConsent],
      ["saveFeedbackConsent", "Lưu check-in cơ thể và năng lượng", "Cho phép lưu các lần check-in và ghi chú để xem trong Hành trình. Phản hồi sau buổi hiện chỉ được giữ trong phiên.", state.saveFeedbackConsent],
      ["teacherShareConsent", "Chia sẻ với một giáo viên cụ thể", "Chưa có lớp được kết nối. Lựa chọn này luôn tắt cho đến khi bạn chọn rõ người nhận, phạm vi và thời hạn.", state.teacherShareConsent],
      ["marketingConsent", "Nhận tin về nội dung mới", "Tùy chọn; tách khỏi thông báo dịch vụ và nhắc tập.", state.marketingConsent],
    ] as const).map(([key, title, description, value]) => <section className="mcy-consent-card" key={key}><strong>{title}</strong><p>{description}</p><button disabled={key === "teacherShareConsent" && !value} aria-pressed={value} onClick={() => togglePurpose(key)}><i>{value ? "✓" : ""}</i>{key === "teacherShareConsent" && !value ? "Chưa có lớp được kết nối" : value && key === "teacherShareConsent" ? "Rút đồng ý" : value ? "Cho phép" : "Không cho phép"}</button></section>)}
    <div className="mcy-form-error subtle">Từ chối AI, bạn vẫn có thể tự chọn video miễn phí. Từ chối lưu thì check-in chỉ còn trong phiên và không được ghi vào tài khoản.</div>
    {state.onboardingComplete && hasCheckinTransferDraft(state) && <div className="mcy-consent-card"><strong>Nháp check-in trong phiên này</strong><p>{state.saveFeedbackConsent ? "Xác nhận tiếp tục sẽ gắn nháp với tài khoản của bạn." : "Bạn chưa cho phép lưu check-in; nháp chỉ dùng trong phiên này."} Nếu không muốn dùng nháp nữa, chọn Bỏ nháp.</p></div>}
    <DemoNote>Mỗi thay đổi được ghi thành sự kiện đồng ý riêng của tài khoản. Ngôn ngữ và phiên bản hiển thị được lưu cùng lựa chọn.</DemoNote>
  </main></MobileScroll>;
}

function ConsentFooter() {
  const flow = useFlow();
  const { state, setState } = useDemo();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const actor = useRef({ id: state.userId, signedIn: state.signedIn, generation: 0 });
  const retryKeys = useRef(new Map<string, string>());
  const captureContinuation = useLearnerContinuation();
  if (actor.current.id !== state.userId || actor.current.signedIn !== state.signedIn) actor.current = { id: state.userId, signedIn: state.signedIn, generation: actor.current.generation + 1 };
  useEffect(() => () => { actor.current.generation++; }, []);
  const hasTransferDraft = state.onboardingComplete && hasCheckinTransferDraft(state);
  const continueNext = async (discardDraft = false) => {
    if (!state.termsAccepted || !state.privacyAccepted || saving) return;
    setSaving(true);
    setError("");
    const expectedUserId = state.userId, expectedSignedIn = state.signedIn, generation = actor.current.generation;
    const continuation = captureContinuation();
    const current = () => continuation() && actor.current.id === expectedUserId && actor.current.signedIn === expectedSignedIn && actor.current.generation === generation;
    try {
      const saved = await persistConsentChanges(state, "onboarding", retryKeys.current);
      if (!current()) return;
      if (saved.hasUnsettledWrites) {
        setState(previous => continuation(previous) ? { ...previous, consentBaseline: saved.consents, consentPolicyVersions: saved.policyVersions } : previous);
        setError("Một lần ghi quyền chưa được xác nhận. Lựa chọn trên màn hình vẫn là nháp; chọn Tiếp tục để đối chiếu lại trước khi đổi quyền hoặc đi tiếp.");
        return;
      }
      setState(previous => !continuation(previous) || previous.userId !== expectedUserId || previous.signedIn !== expectedSignedIn ? previous : ({
        ...previous,
        consentBaseline: saved.consents,
        consentPolicyVersions: saved.policyVersions,
        termsAccepted: saved.consents.terms, privacyAccepted: saved.consents.privacy,
        saveFeedbackConsent: saved.consents.wellbeing_data, aiConsent: saved.consents.ai_processing,
        teacherShareConsent: saved.consents.teacher_sharing, notificationEnabled: saved.consents.notifications,
        marketingConsent: saved.consents.marketing,
        ...(discardDraft ? { preObservations: [], regions: [], bodyStatus: null, energy: null, pendingCheckinIdempotencyKey: null, pendingCheckinPayload: null } : {}),
      }));
      if (!saved.matchesRequested) { setError("Quyền dữ liệu đã thay đổi. Kiểm tra và chọn lại trước khi tiếp tục."); return; }
      if (state.onboardingComplete) {
        if (!discardDraft && hasTransferDraft && state.saveFeedbackConsent) {
          await persistCurrentCheckin({ ...state, consentBaseline: saved.consents, consentPolicyVersions: saved.policyVersions, privacyAccepted: true }, setState, "practice_preparation", current);
        }
        if (!current()) return;
        const destination = discardDraft ? (isCheckinAuthReturn(state.authReturnTo) ? "discover" : "home") : normalizeAuthDestination(state.authReturnTo);
        finishAtAuthDestination(flow, destination);
      } else flow.replace(ROUTES.onboarding);
    } catch (cause) {
      if (!current()) return;
      setError(cause instanceof Error ? cause.message : "Chưa lưu được lựa chọn của bạn.");
    } finally {
      setSaving(false);
    }
  };
  return <div className="mcy-flow-footer mcy-consent-footer">
    {error && <div className="mcy-consent-footer-error" role="alert">Chưa lưu được lựa chọn: {error}</div>}
    <Action disabled={!state.termsAccepted || !state.privacyAccepted || saving} onClick={() => { void continueNext(); }}>{saving ? "Đang lưu lựa chọn…" : hasTransferDraft ? state.saveFeedbackConsent ? "Xác nhận chuyển nháp" : "Tiếp tục với nháp trong phiên" : "Tiếp tục"}</Action>
    {hasTransferDraft && <button className="mcy-quiet-link" disabled={!state.termsAccepted || !state.privacyAccepted || saving} onClick={() => { void continueNext(true); }}>Bỏ nháp</button>}
  </div>;
}

function OnboardingScreen() {
  const flow = useFlow();
  const keyboard = useKeyboard();
  const { state, update, setState } = useDemo();
  const [name, setName] = useState(state.displayName);
  const [showTransfer, setShowTransfer] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const captureContinuation = useLearnerContinuation();
  const hasTransferDraft = hasCheckinTransferDraft(state);
  const complete = async (discardDraft = false) => {
    if (saving) return;
    keyboard.hide();
    setSaving(true);
    setError("");
    const current = captureContinuation();
    try {
      const displayName = name.trim();
      const nextState = discardDraft ? {
        ...state,
        preObservations: [],
        regions: [],
        bodyStatus: null,
        energy: null,
        pendingCheckinIdempotencyKey: null,
        pendingCheckinPayload: null,
      } : state;
      await persistProfile(nextState, displayName, nextState.bodyStyle, nextState.locale);
      if (!current()) return;
      if (!discardDraft && hasTransferDraft && nextState.saveFeedbackConsent) {
        await persistCurrentCheckin({ ...nextState, displayName, onboardingComplete: true }, setState, "practice_preparation", current);
      }
      if (!current()) return;
      setState(previous => !current(previous) ? previous : ({ ...previous,
        displayName,
        onboardingComplete: true,
        backendStatus: "ready",
        backendError: "",
        ...(discardDraft ? {
          preObservations: [], regions: [], bodyStatus: null, energy: null,
          pendingCheckinIdempotencyKey: null,
          pendingCheckinPayload: null,
        } : {}),
      }));
      const destination = discardDraft ? (isCheckinAuthReturn(state.authReturnTo) ? "discover" : "home") : normalizeAuthDestination(state.authReturnTo);
      finishAtAuthDestination(flow, destination);
    } catch (cause) {
      if (!current()) return;
      setError(cause instanceof Error ? cause.message : "Chưa hoàn tất được thiết lập tài khoản.");
    } finally {
      setSaving(false);
    }
  };
  return <MobileScroll className="mcy-scroll"><main className="mcy-page mcy-auth-page">
    <Eyebrow>THIẾT LẬP TỐI THIỂU</Eyebrow><h1>Chỉ thêm điều hữu ích.</h1>
    <p className="mcy-lead">Tên hiển thị không bắt buộc. Hình minh họa là sở thích hiển thị, không dùng để suy luận giới hay sức khỏe.</p>
    <label className="mcy-form-field">Tên hiển thị · tùy chọn<KeyboardInput autoComplete="nickname" aria-label="Tên hiển thị" placeholder="Bạn muốn được gọi là gì?" value={name} onChange={event => setName(event.target.value)} onBlur={() => keyboard.hide()} /></label>
    <section className="mcy-account-panel"><strong>Hình minh họa cơ thể</strong><p>Chọn hình dễ dùng nhất; có thể đổi bất cứ lúc nào.</p><BodyStylePicker value={state.bodyStyle} onChange={bodyStyle => update({ bodyStyle })} /></section>
    {showTransfer && <div className="mcy-consent-card"><strong>Nháp check-in trong phiên này</strong><p>{state.preObservations.length || state.regions.length ? `${state.preObservations.length || state.regions.length} vùng đã ghi, ${state.minutes} phút${state.energy ? `, năng lượng ${state.energy}` : ""}.` : "Có cảm nhận hoặc năng lượng đã chọn trong nháp."} {state.saveFeedbackConsent ? "Bạn đã cho phép lưu check-in. Xác nhận sẽ lưu hồ sơ và nháp vào tài khoản hiện tại." : "Bạn chưa cho phép lưu check-in. Tiếp tục chỉ lưu hồ sơ; nháp check-in vẫn dùng trong phiên này."}</p><div className="mcy-auth-secondary"><button disabled={saving} onClick={() => { void complete(); }}>{state.saveFeedbackConsent ? "Lưu hồ sơ và check-in" : "Lưu hồ sơ và giữ nháp"}</button><button disabled={saving} onClick={() => { void complete(true); }}>Lưu hồ sơ và bỏ nháp</button></div></div>}
    {error && <div className="mcy-form-error" role="alert">{error}</div>}
    {!showTransfer && <Action disabled={saving} onClick={() => { if (hasTransferDraft) setShowTransfer(true); else void complete(); }}>{saving ? "Đang lưu hồ sơ…" : hasTransferDraft ? "Xem lựa chọn nháp check-in" : "Lưu hồ sơ và tiếp tục"}</Action>}
    <DemoNote>Hồ sơ và lựa chọn được lưu vào tài khoản. Check-in chỉ được lưu khi bạn đã cho phép.</DemoNote>
  </main></MobileScroll>;
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

function HomeScreen() {
  const flow = useFlow();
  const { state } = useDemo();
  const en = state.locale === "en-US";
  // Only advertise the existing in-session guest draft. Account save/retry and
  // completed practice state have separate guarded handlers; Home does not reset them.
  const guestDraft = !state.signedIn && !state.checkinBaselineReady && !state.lastReflection
    && (state.bodyStatus !== null || state.energy !== null || state.preObservations.length > 0 || state.regions.length > 0);
  return <MobileScroll className="mcy-scroll"><main className="mcy-page mcy-home-page">
    <Eyebrow>{en ? "TODAY, AT YOUR PACE" : "HÔM NAY, THEO NHỊP CỦA BẠN"}</Eyebrow>
    <h1>{en ? "A little time for yourself." : "Một chút thời gian cho chính mình."}</h1>
    <p className="mcy-lead">{en ? "Start with how you feel, or choose a free video lesson." : "Bắt đầu từ cảm nhận của bạn, hoặc tự chọn một bài học video miễn phí."}</p>
    <section className="mcy-home-cta" aria-label={en ? "Your next step" : "Bước tiếp theo của bạn"}>
      <Action onClick={() => flow.push(ROUTES.checkin)}>{guestDraft ? (en ? "Continue check-in" : "Tiếp tục check-in") : (en ? "Start check-in" : "Bắt đầu check-in")}</Action>
      {guestDraft && <p className="mcy-home-draft" role="status">{en ? "Your choices are kept in this session; they have not been saved to an account." : "Lựa chọn được giữ trong phiên này; chưa lưu vào tài khoản."}</p>}
      <button className="mcy-secondary-action" onClick={() => flow.push(ROUTES.discover)}>{en ? "Choose a free video lesson" : "Tự chọn bài học miễn phí"}<ArrowRightIcon /></button>
      <p className="mcy-home-helper">{en ? "No check-in or sign-in needed to browse." : "Không cần check-in hay đăng nhập để xem bài."}</p>
    </section>
    <p className="mcy-home-capability">{state.aiCapability === "ready"
      ? (en ? "After check-in, you can choose reviewed content with AI or browse yourself." : "Sau check-in, bạn có thể chọn nội dung đã duyệt cùng AI hoặc tự xem thư viện.")
      : (en ? "Check-in records how you feel. You choose the video lesson yourself." : "Check-in giúp ghi nhận cảm nhận. Bạn tự chọn bài học video trong thư viện.")}</p>
    <div className="mcy-home-photo"><img src="/assets/today-neck-stretch-1200.webp" srcSet="/assets/today-neck-stretch-600.webp 600w, /assets/today-neck-stretch-1200.webp 1200w" sizes="(min-width: 900px) 756px, 100vw" alt={en ? "Yoga practice at home" : "Hình minh họa buổi tập yoga tại nhà"} loading="lazy" decoding="async" /></div>
  </main></MobileScroll>;
}

function CheckinScreen() {
  const flow = useFlow();
  const { state, update, setState } = useDemo();
  const locale = state.locale;
  const [showBodyAreas, setShowBodyAreas] = useState(() => state.preObservations.length > 0);
  useEffect(() => {
    if (state.checkinStep === 1 && state.preObservations.length > 0) setShowBodyAreas(true);
  }, [state.checkinStep, flow.current.key]);
  const [regionGroup, setRegionGroup] = useState<BodyRegionGroup>("trunk");
  const [showStepTwoScrollHint, setShowStepTwoScrollHint] = useState(false);
  useLayoutEffect(() => {
    const scroll = document.querySelector<HTMLElement>("[data-testid='flow-current'] .mobile-scroll");
    if (scroll) scroll.scrollTop = 0;
  }, [state.checkinStep]);
  useEffect(() => {
    if (flow.current.id !== ROUTES.checkin.id || state.checkinStep !== 2) {
      setShowStepTwoScrollHint(false);
      return;
    }
    const scroll = document.querySelector<HTMLElement>('[data-testid="flow-current"] [data-flow-route="checkin"][data-flow-active="true"] .mobile-scroll');
    const content = scroll?.querySelector<HTMLElement>(".mobile-scroll-content");
    if (!scroll) return;
    const updateScrollHint = () => {
      const remaining = scroll.scrollHeight - scroll.clientHeight - scroll.scrollTop;
      const next = scroll.scrollHeight > scroll.clientHeight + 8 && remaining > 8;
      setShowStepTwoScrollHint(current => current === next ? current : next);
    };
    const resizeObserver = new ResizeObserver(updateScrollHint);
    resizeObserver.observe(scroll);
    if (content) resizeObserver.observe(content);
    scroll.addEventListener("scroll", updateScrollHint, { passive: true });
    updateScrollHint();
    return () => {
      resizeObserver.disconnect();
      scroll.removeEventListener("scroll", updateScrollHint);
    };
  }, [flow.current.id, state.checkinStep]);
  const [editing, setEditing] = useState<BodyRegion | null>(null);
  const [editingStoredSide, setEditingStoredSide] = useState<BodySide | undefined>();
  const [suggestedSide, setSuggestedSide] = useState<BodySide | undefined>();
  const [pendingStatus, setPendingStatus] = useState<"none_now" | "uncertain" | "skipped" | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveNotice, setSaveNotice] = useState("");
  useEffect(() => { setSaving(false); setSaveError(""); setSaveNotice(""); }, [flow.current.key]);
  const captureContinuation = useLearnerContinuation();
  const latestCheckinState = useRef(state); latestCheckinState.current = state;
  const selected = editing ? state.preObservations.find(item => item.region === editing && item.side === editingStoredSide) ?? state.preObservations.find(item => item.region === editing) : undefined;
  const openRegion = (region: BodyRegion, preferredSide?: BodySide) => {
    const entries = state.preObservations.filter(item => item.region === region);
    const current = preferredSide
      ? entries.find(item => item.side === preferredSide) ?? entries.find(item => item.side === "both" || item.side === "unspecified")
      : entries[0];
    const storedSide = current?.side ?? preferredSide ?? "unspecified";
    setEditingStoredSide(storedSide);
    setSuggestedSide(preferredSide ?? current?.side ?? "unspecified");
    setEditing(region);
  };
  const closeRegion = () => { setEditing(null); setEditingStoredSide(undefined); setSuggestedSide(undefined); };
  const saveObservation = (observation: Observation) => setState(previous => {
    const preObservations = replaceBodyObservation(previous.preObservations, observation, editingStoredSide ?? observation.side);
    return { ...previous, bodyStatus: "reported", preObservations, regions: [...new Set(preObservations.map(item => item.region))] };
  });
  const deleteObservation = () => { if (!editing || !editingStoredSide) return; setState(previous => { const preObservations = removeBodyObservation(previous.preObservations, editing, editingStoredSide); return { ...previous, preObservations, regions: [...new Set(preObservations.map(item => item.region))], bodyStatus: preObservations.length ? "reported" : null }; }); };
  const chooseStatus = (value: "none_now" | "uncertain" | "skipped") => {
    if (state.preObservations.length) setPendingStatus(value);
    else update({ bodyStatus: value, preObservations: [], regions: [] });
  };
  const standalone = async () => {
    if (saving) return;
    setSaving(true);
    setSaveError("");
    setSaveNotice("");
    const current = captureContinuation();
    try {
      const result = await persistCurrentCheckin(state, setState, "standalone", current);
      if (!current()) return;
      if (result.status === "cancelled") return;
      if (result.status === "not_saved_permission") {
        setSaveNotice(locale === "en-US"
          ? "Check-in has not been saved. Your draft stays here. To save it to an account, sign in and choose check-in saving in Privacy and consent."
          : "Check-in chưa được lưu. Nháp vẫn ở đây. Để lưu vào tài khoản, đăng nhập và chọn cho phép lưu check-in trong Quyền riêng tư và đồng ý.");
        return;
      }
      const original = state.pendingCheckinPayload ?? toLearnerCheckinPayload(state, "standalone", "comparison");
      const latestDraft = toLearnerCheckinPayload(latestCheckinState.current, "standalone", original.idempotencyKey);
      const sameDraft = latestDraft.bodyStatus === original.bodyStatus && latestDraft.energyLevel === original.energyLevel
        && JSON.stringify(latestDraft.observations) === JSON.stringify(original.observations);
      if (!sameDraft) { setSaveNotice(locale === "en-US" ? "The previous record is confirmed. Your edits remain in the draft; save again to create a new record." : "Đã xác nhận bản ghi trước. Nháp vừa sửa vẫn được giữ; chọn lưu lần nữa để tạo bản ghi mới."); setSaving(false); return; }
      setState(previous => !current(previous) ? previous : ({
        ...previous,
        history: result.status === "saved_session" && previous.saveFeedbackConsent ? [...previous.history, makeSnapshot("Ghi riêng", previous.bodyStatus, previous.preObservations)] : previous.history,
        preObservations: [], postObservations: [], regions: [], bodyStatus: null, energy: null,
        pendingCheckinIdempotencyKey: null,
        pendingCheckinPayload: null,
      }));
    } catch (cause) {
      if (!current()) return;
      setSaveError(cause instanceof Error ? cause.message : "Chưa lưu được check-in. Kiểm tra mạng rồi thử lại.");
      return;
    } finally {
      setSaving(false);
    }
    if (!current()) return;
    flow.push(ROUTES.journey);
  };
  const statusDescription = state.bodyStatus === "none_now" ? msg(locale, "checkin.selectedNone") : state.bodyStatus === "uncertain" ? msg(locale, "checkin.selectedUnsure") : state.bodyStatus === "skipped" ? msg(locale, "checkin.selectedSkipped") : "";
  const bodySummary = state.bodyStatus === "none_now" ? msg(locale, "checkin.noDiscomfort") : state.bodyStatus === "uncertain" ? msg(locale, "checkin.unsure") : state.bodyStatus === "skipped" ? msg(locale, "checkin.skipBody") : state.preObservations.map(item => `${regionLabel(locale, item.region)}${isPairedBodyRegion(item.region) && item.side !== "unspecified" ? ` · ${sideLabel(locale, item.side)}` : ""} · ${item.status === "uncertain" ? bodyLevelLabel(locale, "Chưa rõ") : bodyLevelLabel(locale, item.level ?? msg(locale, "checkin.notRecorded"))}`).join(", ");
  return <MobileScroll className="mcy-scroll"><main className={`mcy-page mcy-checkin-page step-${state.checkinStep}`}>
    <div className="mcy-step-count" aria-live="polite">{formatMessage(locale, "checkin.stepCount", { step: state.checkinStep })}<span>{msg(locale, state.checkinStep === 1 ? "checkin.step1.label" : "checkin.step2.label")}</span></div>
    <h1>{state.checkinStep === 1 ? (locale === "en-US" ? "Your body, today." : "Cơ thể bạn hôm nay.") : (locale === "en-US" ? "A little time for you." : "Một khoảng cho mình.")}</h1>
    <p className="mcy-lead">{state.checkinStep === 1 ? (locale === "en-US" ? "A little space to notice how you feel." : "Một chút để lắng nghe cảm nhận.") : state.aiCapability === "ready" ? (locale === "en-US" ? "Choose reviewed content with AI, or browse on your own." : "Chọn nội dung đã duyệt cùng AI, hoặc tự xem thư viện.") : (locale === "en-US" ? "Choose a practice yourself in the library." : "Bạn tự chọn bài trong thư viện.")}</p>
    {state.checkinStep === 1 ? <>
      <div className="mcy-checkin-quick-choices" aria-label={locale === "en-US" ? "How your body feels now" : "Cảm nhận cơ thể lúc này"}>
        <button className="mcy-body-disclosure" aria-expanded={showBodyAreas} aria-controls="checkin-body-areas" onClick={() => setShowBodyAreas(open => !open)}>
          <span className="mcy-body-entry-art" aria-hidden="true"><img src={BODY_STYLES.find(item => item.id === state.bodyStyle)?.image ?? BODY_STYLES[0].image} alt="" /></span>
          <span className="mcy-body-entry-copy">
            <strong>{locale === "en-US" ? "Notice each body area" : "Ghi nhận từng vùng cơ thể"}</strong>
            <span>{locale === "en-US" ? "Choose an area. Record how it feels." : "Chọn vùng, ghi lại cảm nhận riêng."}</span>
            <span className="mcy-body-entry-link">{showBodyAreas ? (locale === "en-US" ? "Close body map" : "Thu gọn bản đồ") : state.preObservations.length ? (locale === "en-US" ? "Edit body areas" : "Sửa vùng đã ghi") : (locale === "en-US" ? "Open body map" : "Mở bản đồ cơ thể")}<ChevronDownIcon aria-hidden="true" /></span>
            {state.preObservations.length > 0 && <small>{locale === "en-US" ? state.preObservations.length + " entries retained" : "Giữ " + state.preObservations.length + " ghi nhận"}</small>}
          </span>
        </button>
        <div className="mcy-checkin-other-choices">
        <Choice selected={state.bodyStatus === "none_now"} onClick={() => chooseStatus("none_now")}><span>{msg(locale, "checkin.noDiscomfort")}</span></Choice>
        <Choice selected={state.bodyStatus === "uncertain"} onClick={() => chooseStatus("uncertain")}><span>{msg(locale, "checkin.unsure")}</span></Choice>
        </div>
      </div>
      {statusDescription && <p className="mcy-status-caption" role="status">{statusDescription}</p>}
      <div id="checkin-body-areas" hidden={!showBodyAreas}>
      {showBodyAreas && <div className="mcy-checkin-content checkin-step-body">
      <div className="mcy-checkin-illustration">
        <div className="mcy-scroll-hint"><ChevronDownIcon />{msg(locale, "checkin.scrollHint")}</div>
        <div className="mcy-body-groups" aria-label={locale === "en-US" ? "Body areas" : "Nhóm vùng cơ thể"}>{(["trunk", "arms", "legs"] as BodyRegionGroup[]).map(group => <button key={group} aria-pressed={regionGroup === group} onClick={() => setRegionGroup(group)}>{msg(locale, `checkin.group.${group}` as "checkin.group.trunk" | "checkin.group.arms" | "checkin.group.legs")}<small>{state.preObservations.filter(item => BODY_REGION_GROUPS[group].includes(item.region)).length}</small></button>)}</div>
        <BodyMap observations={state.preObservations} bodyStyle={state.bodyStyle} locale={locale} group={regionGroup} onSelect={openRegion} />
        <BodyStylePicker value={state.bodyStyle} onChange={bodyStyle => update({ bodyStyle })} />
      </div>
      <div className="mcy-checkin-fields">
        <h2 className="mcy-inline-section-title">{msg(locale, "checkin.regions")}</h2>
        <div className="mcy-region-list" aria-label={locale === "en-US" ? "Choose a body area" : "Chọn vùng cơ thể"}>{BODY_REGION_GROUPS[regionGroup].map(region => { const items = state.preObservations.filter(entry => entry.region === region); const detail = items.length ? items.map(item => `${isPairedBodyRegion(region) && item.side !== "unspecified" ? `${sideLabel(locale, item.side)} · ` : ""}${item.status === "uncertain" ? msg(locale, "checkin.unsure") : bodyLevelLabel(locale, item.level ?? msg(locale, "checkin.notRecorded"))}`).join(" / ") : msg(locale, "checkin.tapToRecord"); return <button key={region} className={items.length ? "selected" : ""} onClick={() => openRegion(region)}><span>{regionLabel(locale, region)}</span><small>{detail}</small><ArrowRightIcon /></button>; })}</div>
        <div className="mcy-inline-note"><InfoCircledIcon />{msg(locale, "checkin.disclaimer")}</div>
      </div>
    </div>}
      </div>
      {!showBodyAreas && <div className="mcy-inline-note"><InfoCircledIcon />{msg(locale, "checkin.disclaimer")}</div>}
    </> : <div className="mcy-checkin-step-two">
      <section className="mcy-time-choice" aria-labelledby="checkin-time-title" aria-describedby="checkin-time-use">
        <h2 id="checkin-time-title">{locale === "en-US" ? "How much time do you have?" : "Bạn có khoảng bao lâu?"}</h2>
        <div className="mcy-chip-grid">{([5, 10, 15] as const).map(time => <Choice key={time} selected={state.minutes === time} onClick={() => update({ minutes: time })}><span>{localizedNumber(locale, time)}</span><small>{locale === "en-US" ? "min" : "phút"}</small></Choice>)}</div>
        <p id="checkin-time-use">{state.aiCapability === "ready"
          ? (locale === "en-US" ? "AI uses this time limit to choose from reviewed content. The library stays unfiltered." : "AI dùng giới hạn này để chọn trong nội dung đã duyệt. Thư viện vẫn không lọc theo thời gian.")
          : (locale === "en-US" ? "A reference for your own choice. The library does not filter by this time." : "Để bạn tham khảo khi tự chọn bài. Thư viện chưa lọc theo thời gian này.")}</p>
      </section>
      {showStepTwoScrollHint && <div className="mcy-scroll-hint mcy-checkin-step-two-scroll-hint"><ChevronDownIcon aria-hidden="true" />{msg(locale, "checkin.step2.scrollHint")}</div>}
      <section className="mcy-energy-card" aria-labelledby="checkin-energy-title" aria-describedby="checkin-energy-use"><h2 id="checkin-energy-title">{msg(locale, "checkin.energy")} <small>({msg(locale, "checkin.optional")})</small></h2><p id="checkin-energy-use">{state.signedIn && state.userId && state.saveFeedbackConsent
        ? (locale === "en-US" ? "Recorded with your check-in if you save it; not yet shown in Journey." : "Ghi cùng check-in khi bạn lưu; chưa hiển thị trong Hành trình.")
        : state.aiCapability === "ready"
          ? (locale === "en-US" ? "Kept in your draft. Sent with your preferences when you confirm with AI." : "Nằm trong nháp. Gửi cùng lựa chọn khi bạn xác nhận với AI.")
          : (locale === "en-US" ? "Kept only in your current draft; not used to choose a practice yet." : "Chỉ nằm trong nháp hiện tại; chưa dùng để chọn bài.")}</p><div className="mcy-energy-options">{(["Rất thấp", "Thấp", "Bình thường", "Khá ổn", "Tràn đầy"] as Energy[]).map((value, index) => <button key={value} aria-pressed={state.energy === value} onClick={() => update({ energy: value })}><EnergyFace level={index} /><span>{energyLabel(locale, value)}</span></button>)}</div></section>
      <div className="mcy-checkin-summary"><span><strong>{locale === "en-US" ? "Body check-in" : "Cảm nhận cơ thể"}</strong><small>{bodySummary || (locale === "en-US" ? "Not added" : "Chưa ghi nhận")}</small></span><button onClick={() => update({ checkinStep: 1 })}>{locale === "en-US" ? "Edit" : "Sửa"}</button></div>
      {state.pendingCheckinPayload && <p role="status">{locale === "en-US" ? "The previous save is unconfirmed. Retry that exact record first; edits remain in your draft." : "Lần lưu trước chưa được xác nhận. Hãy thử lại đúng bản ghi đó trước; phần sửa được giữ trong nháp."}</p>}
      <p className="mcy-inline-note">{state.signedIn && state.userId && state.saveFeedbackConsent
        ? (locale === "en-US" ? "This check-in will be saved to your account." : "Check-in này sẽ được lưu vào tài khoản của bạn.")
        : !state.signedIn && state.saveFeedbackConsent
          ? (locale === "en-US" ? "This check-in is kept only in this session and will be lost when the app reloads." : "Check-in chỉ được giữ trong phiên này và sẽ mất khi tải lại ứng dụng.")
          : (locale === "en-US" ? "Check-in saving is off. Your choices stay in the current draft." : "Bạn chưa cho phép lưu check-in. Các lựa chọn vẫn nằm trong nháp hiện tại.")}</p>
      <button className="mcy-standalone-link" disabled={saving} onClick={() => { void standalone(); }}>{saving ? (locale === "en-US" ? "Saving check-in…" : "Đang lưu check-in…") : state.pendingCheckinPayload ? (locale === "en-US" ? "Retry the previous record" : "Thử lại bản ghi trước") : msg(locale, "checkin.standalone")}</button>
      {saveError && <div className="mcy-form-error" role="alert">{locale === "en-US" ? "Couldn't save check-in: " : "Chưa lưu được check-in: "}{saveError}</div>}
      {saveNotice && <p role="status">{saveNotice}</p>}
      <div className="mcy-inline-note"><InfoCircledIcon />{msg(locale, "checkin.disclaimer")}</div>
    </div>}
    <RegionEditor region={editing} current={selected} suggestedSide={suggestedSide} onClose={closeRegion} onSave={saveObservation} onDelete={deleteObservation} />
    <BottomSheet open={Boolean(pendingStatus)} onOpenChange={open => { if (!open) setPendingStatus(null); }} title="Đổi lựa chọn vùng cơ thể" description="Các vùng vừa ghi sẽ được xóa khỏi lần check-in này. Bạn có thể chọn lại sau." snap={0.38}><div className="mcy-sheet-actions"><button className="mcy-action" onClick={() => { update({ bodyStatus: pendingStatus, preObservations: [], regions: [] }); setPendingStatus(null); }}>Đổi lựa chọn <ArrowRightIcon /></button><button className="mcy-quiet-link" onClick={() => setPendingStatus(null)}>Giữ các vùng đã ghi</button></div></BottomSheet>
  </main></MobileScroll>;
}

function CheckinFooter() {
  const flow = useFlow();
  const { state, update } = useDemo();
  const locale = state.locale;
  const [confirmSkip, setConfirmSkip] = useState(false);
  const browseFreeLessons = () => {
    update({ dialogueChoice: null, dialogueText: "", unrecognizedText: "", aiConversation: [], aiPending: false, aiError: "", checkinBaselineReady: hasCheckinBaseline(state) });
    flow.push(ROUTES.discover);
  };
  const openOptionalAccount = () => {
    update({ authReturnTo: "discover", authMode: "create" });
    flow.push(ROUTES.authEmail);
  };
  const advanceStep = () => update({ checkinStep: 2 });
  const skipBody = () => {
    if (state.preObservations.length) { setConfirmSkip(true); return; }
    update({ checkinStep: 2, bodyStatus: "skipped", preObservations: [], regions: [] });
  };
  return <div className="mcy-flow-footer single mcy-checkin-footer">
    <div className="mcy-checkin-progress" aria-label={formatMessage(locale, "checkin.stepCount", { step: state.checkinStep })}>
      <span><strong>{formatMessage(locale, "checkin.stepCount", { step: state.checkinStep })}</strong><small>{msg(locale, state.checkinStep === 1 ? "checkin.step1.label" : "checkin.step2.label")}</small></span>
      <span className="mcy-progress-track" aria-hidden="true"><i className={state.checkinStep === 1 ? "active" : "done"} /><i className={state.checkinStep === 2 ? "active" : ""} /></span>
    </div>
    {state.checkinStep === 1 ? <>
      <Action onClick={advanceStep}>{msg(locale, "checkin.step1.next")}</Action>
      <div className="mcy-checkin-footer-options"><button onClick={skipBody}>{msg(locale, "checkin.step1.skip")}</button><button onClick={browseFreeLessons}>{msg(locale, "checkin.directPlan")}</button></div>
    </> : <>
      {state.aiCapability === "ready" ? <><Action onClick={() => { update({ checkinBaselineReady: hasCheckinBaseline(state) }); flow.push(ROUTES.dailyPractice); }}>{locale === "en-US" ? "Choose today's practice with AI" : "Chọn buổi hôm nay cùng AI"}</Action><button className="mcy-quiet-link" onClick={browseFreeLessons}>{msg(locale, "checkin.step2.guest")}</button></> : <Action onClick={browseFreeLessons}>{msg(locale, "checkin.step2.guest")}</Action>}
      <div className="mcy-checkin-footer-options">{!state.signedIn && <button onClick={openOptionalAccount}>{msg(locale, "checkin.step2.account")}</button>}<button onClick={() => update({ checkinStep: 1 })}>{msg(locale, "checkin.backToBody")}</button></div>
    </>}
    <BottomSheet open={confirmSkip} onOpenChange={setConfirmSkip} title={locale === "en-US" ? "Skip the body check-in?" : "Bỏ ghi nhận vùng cơ thể?"} description={locale === "en-US" ? "The areas you entered will be cleared from this check-in. You can add them again later." : "Các vùng vừa ghi sẽ được xóa khỏi lần check-in này. Bạn có thể chọn lại sau."} snap={0.38}>
      <div className="mcy-sheet-actions"><button className="mcy-action" onClick={() => { update({ checkinStep: 2, bodyStatus: "skipped", preObservations: [], regions: [] }); setConfirmSkip(false); }}>{locale === "en-US" ? "Skip and continue" : "Bỏ qua và tiếp tục"} <ArrowRightIcon /></button><button className="mcy-quiet-link" onClick={() => setConfirmSkip(false)}>{locale === "en-US" ? "Keep my entries" : "Giữ các vùng đã ghi"}</button></div>
    </BottomSheet>
  </div>;
}

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
    <p className="mcy-lead">{state.signedIn ? `${state.accountEmail} · Email đã xác minh.` : "Bạn có thể xem nội dung mà không cần tài khoản. Đăng nhập để lưu hồ sơ, lựa chọn quyền và check-in đã đồng ý."}</p>
    {!state.signedIn ? <div className="mcy-profile-card"><span className="mcy-tag">TÀI KHOẢN</span><strong>Lưu hành trình trên tài khoản của bạn</strong><p>Đăng nhập bằng email để đồng bộ hồ sơ, quyền dữ liệu và check-in có đồng ý.</p><button onClick={() => { update({ authMode: "create", authReturnTo: "profile" }); flow.push(ROUTES.authEmail); }}>Tạo tài khoản hoặc đăng nhập</button></div> : <div className="mcy-profile-card"><span className="mcy-tag">TRẠNG THÁI</span><strong>Đang dùng tài khoản học viên</strong><p>Hồ sơ, quyền riêng tư và check-in được lưu theo lựa chọn của bạn.</p><button disabled={signingOut} onClick={() => { void signOut(); }}>{signingOut ? "Đang đăng xuất…" : "Đăng xuất thiết bị này"}</button></div>}
    {error && <div className="mcy-form-error" role="alert">{error}</div>}
    <div className="mcy-account-group"><span className="mcy-section-label">HỒ SƠ VÀ QUYỀN DỮ LIỆU</span>
      <AccountRow title="Thông tin cá nhân" detail={state.displayName || "Tên tùy chọn · ngôn ngữ · hình minh họa"} onClick={() => flow.push(ROUTES.editProfile)} />
      <AccountRow title="AI và điều được nhớ" detail={feedback ? "Có phản hồi để xem nguồn và cách rút lại" : "Chưa có thông tin được nhớ"} onClick={() => flow.push(ROUTES.memory)} />
      <AccountRow title="Quyền riêng tư và đồng ý" detail="Mỗi mục đích, phiên bản và cách thay đổi" onClick={() => flow.push(ROUTES.privacy)} />
      <AccountRow title="Bảo mật tài khoản" detail="Email, phiên đăng nhập và xác minh lại" onClick={() => flow.push(ROUTES.security)} />
      <AccountRow title="Tùy chọn thông báo" detail="Lựa chọn nhận tin · nhắc tập chưa mở" onClick={() => flow.push(ROUTES.notifications)} />
      <AccountRow title="Nội dung và quyền đang có" detail="Khóa học miễn phí · quyền trả phí" onClick={() => flow.push(ROUTES.access)} />
      <AccountRow title="Chia sẻ với giáo viên" detail="Chưa có lớp được kết nối · mặc định tắt" onClick={() => flow.push(ROUTES.sharing)} />
    </div>
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
        await saveConsentEvent(client, purpose, granted, policyVersion, "settings", crypto.randomUUID(), clientChannel());
      }
      if (!current() || consentAccount.current !== expectedAccount) return;
      setState(previous => current(previous) && previous.userId === expectedUserId && previous.signedIn === expectedSignedIn ? { ...previous, ...patch, consentBaseline: { ...previous.consentBaseline, [purpose]: granted }, consentPolicyVersions: { ...previous.consentPolicyVersions, [purpose]: policyVersion } } : previous);
    } catch {
      if (current() && consentAccount.current === expectedAccount) setError("Chưa xác định lựa chọn quyền đã được lưu hay chưa. Hãy tải lại trạng thái trước khi thử tiếp.");
    } finally { consentWritePending.current = false; setConsentPending(false); }
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
  if (panel === "memory") return screen("AI VÀ ĐIỀU ĐƯỢC NHỚ", "Bạn xem được nguồn của mọi điều được nhớ.", "Không có suy luận sức khỏe dài hạn. Một phản hồi khó chịu hơn không thành sở thích mặc định.", <><div className="mcy-account-panel"><span className="mcy-tag">TRẠNG THÁI</span>{latest && state.rememberPace ? <><strong>Nhịp buổi trước hơi nhanh</strong><p>Nguồn: phản hồi sau buổi · phạm vi: gợi ý nhịp lần kế tiếp · dữ liệu chỉ trong phiên.</p><button className="mcy-toggle" aria-pressed={state.rememberPace} onClick={() => update({ rememberPace: false, usePreviousFeedback: false })}>Tắt và xóa ghi nhớ</button></> : <><strong>Chưa có ghi nhớ đang bật</strong><p>Phản hồi sau buổi hiện chỉ nằm trong phiên; chưa được lưu vào tài khoản.</p></>}</div><div className="mcy-account-panel"><strong>Trợ lý AI</strong><p>{state.aiCapability === "ready" ? "Trợ lý sẵn sàng cho phiên này. Chỉ gửi lựa chọn khi bạn đồng ý AI hiện hành và chủ động xác nhận." : "Trợ lý chưa sẵn sàng cho phiên này. Bạn vẫn có thể xem khóa học và tự chọn bài."}</p><button className="mcy-toggle" aria-pressed={state.aiConsent} disabled={consentPending} onClick={() => { void changeConsent("ai_processing", !state.aiConsent, { aiConsent: !state.aiConsent, usePreviousFeedback: false }); }}>{state.aiConsent ? "Rút đồng ý AI" : "Đồng ý cho xử lý khi tính năng được mở"}</button></div><AccountRow title="Xem quyền theo mục đích" detail="Rút đồng ý và xem ảnh hưởng" onClick={() => flow.push(ROUTES.privacy)} />{error && <div className="mcy-form-error" role="alert">{error}</div>}</>);
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
      <AccountRow title="Mở cài đặt chia sẻ" detail="Xem phạm vi và trạng thái kết nối" onClick={() => flow.push(ROUTES.sharing)} />
    </>,
  );
  if (panel === "sharing") return screen("CHIA SẺ DỮ LIỆU", "Bạn luôn chọn người nhận và phạm vi.", "Chia sẻ với giáo viên hiện chưa được kết nối trong tài khoản này. Mặc định chia sẻ đang tắt.", <><div className="mcy-empty large"><PersonIcon /><strong>Chưa có lớp được kết nối</strong><p>Khi có lớp được cấp quyền, bạn sẽ thấy rõ tên người nhận, dữ liệu được chia sẻ và thời hạn trước khi bật.</p></div><div className="mcy-consent-card"><strong>Nguyên tắc chia sẻ</strong><p>Không chia sẻ mặc định. Check-in, ghi chú và phản hồi chỉ được gửi khi bạn chọn đúng người nhận và phạm vi.</p></div><AccountRow title="Quyền riêng tư" detail="Rút đồng ý và xem các mục đích khác" onClick={() => flow.push(ROUTES.privacy)} /></>);
  if (panel === "security") return screen("BẢO MẬT", "Kiểm soát email và phiên đang mở.", "Đăng nhập bằng email khác sẽ mở tài khoản đó. Hồ sơ và Hành trình được giữ riêng theo từng tài khoản.", <><div className="mcy-account-panel"><strong>Email đăng nhập</strong><p>{state.accountEmail || "Chưa đăng nhập"} · {state.signedIn ? "đã xác minh" : "chưa đăng nhập"}</p><button className="mcy-toggle" onClick={() => { update({ authMode: "login", authReturnTo: "security" }); flow.push(ROUTES.authEmail); }}>Đăng nhập bằng tài khoản khác</button></div><div className="mcy-account-row static"><span><strong>Thiết bị này</strong><small>{state.signedIn ? "Phiên hiện tại" : "Chưa có phiên đăng nhập"}</small></span><span className="mcy-state-pill">{state.signedIn ? "HIỆN TẠI" : "KHÁCH"}</span></div><p className="mcy-inline-note">Nếu mất quyền truy cập email hoặc nghi có người dùng tài khoản, hãy liên hệ kênh hỗ trợ của MCY. Không tự gộp hai tài khoản.</p>{error && <div className="mcy-form-error subtle">{error}</div>}</>);
  if (panel === "notifications") return screen("THÔNG BÁO", "Tùy chọn thông báo của bạn.", "Nhắc tập chưa mở; hiện chưa gửi thông báo đẩy hoặc email nhắc. Khi đăng nhập, lựa chọn nhận thông báo được lưu vào tài khoản để dùng khi tính năng sẵn sàng.", <><PrivacyToggle title="Cho phép nhận thông báo nhắc tập" detail="Chỉ lưu lựa chọn nhận tin; chưa đặt giờ hay gửi nhắc tập." value={state.notificationEnabled} disabled={consentPending} onToggle={value => { void changeConsent("notifications", value, { notificationEnabled: value }); }} /><PrivacyToggle title="Email cập nhật nội dung" detail="Tùy chọn marketing; không ảnh hưởng email đăng nhập." value={state.emailUpdates} disabled={consentPending} onToggle={value => { void changeConsent("marketing", value, { marketingConsent: value, emailUpdates: value }); }} />{error && <div className="mcy-form-error subtle" role="alert">{error}</div>}<div className="mcy-account-panel"><strong>Nhắc tập chưa mở</strong><p>Ứng dụng chưa có thao tác đặt giờ hoặc lên lịch nhắc tập.</p></div></>);
  if (panel === "access") return screen("QUYỀN NỘI DUNG", "Những gì đang mở cho bạn.", "Khóa học miễn phí có thể học không cần giao dịch. Mục này cho biết nội dung trả phí hiện có trong ứng dụng.", <><div className="mcy-access-card"><span className="mcy-tag">HỌC MIỄN PHÍ</span><strong>Khóa học trong Khám phá</strong><p>Bạn có thể xem các bài học video ngay trong ứng dụng mà không cần mua quyền truy cập.</p></div><div className="mcy-empty large"><ReaderIcon /><strong>Chưa có khóa học trả phí</strong><p>Giao dịch, thời hạn học và quyền lợi đi kèm hiện chưa được cung cấp trong ứng dụng.</p></div><button className="mcy-quiet-link" onClick={() => flow.push(ROUTES.discover)}>Mở Khám phá</button></>);
  if (panel === "help") return screen("HỖ TRỢ", "Tìm hướng dẫn rõ ràng.", "Chọn một chủ đề để xem hướng dẫn. Hiện chưa thể gửi yêu cầu tài khoản từ ứng dụng.", <><label className="mcy-form-field">Tìm hướng dẫn<KeyboardInput aria-label="Tìm hướng dẫn" value={query} onChange={event => setQuery(event.target.value)} onBlur={() => keyboard.hide()} placeholder="Ví dụ: phản hồi sau tập" /></label><div className="mcy-help-results">{filteredHelpArticles.length ? filteredHelpArticles.map(article => <AccountRow key={article.id} title={article.title} detail={article.detail} onClick={() => flow.push(HELP_ARTICLE_ROUTES[article.id])} />) : <p className="mcy-help-empty" role="status">Chưa tìm thấy hướng dẫn phù hợp. Thử một từ khác.</p>}</div><div className="mcy-account-panel"><strong>Chưa thể gửi yêu cầu trong ứng dụng</strong><p>Các mục bên dưới là hướng dẫn tham khảo; hiện chưa có nội dung nào được gửi tới đội ngũ hỗ trợ của MCY.</p></div>{error && <div className="mcy-form-error">{error}</div>}</>);
   return screen("YÊU CẦU VỀ DỮ LIỆU", "Yêu cầu về dữ liệu tài khoản.", "Chức năng gửi yêu cầu xuất hoặc xóa dữ liệu chưa sẵn sàng. Bạn có thể xem hướng dẫn quyền riêng tư hoặc liên hệ kênh chính thức của MCY.", <><div className="mcy-empty large"><InfoCircledIcon /><strong>Hiện chưa thể gửi yêu cầu trong ứng dụng</strong><p>Ứng dụng chưa tiếp nhận yêu cầu xuất hoặc xóa dữ liệu, nên chưa có thao tác nào được thực hiện.</p></div><AccountRow title="Quyền riêng tư" detail="Xem phạm vi lưu và chia sẻ" onClick={() => flow.push(ROUTES.privacy)} /><AccountRow title="Hướng dẫn và hỗ trợ" detail="Đọc các hướng dẫn đang có" onClick={() => flow.push(ROUTES.help)} /> </>);
}

function PrivacyToggle({ title, detail, value, onToggle, actionLabels, disabled = false }: { title: string; detail: string; value: boolean; onToggle: (value: boolean) => void; actionLabels?: { active: string; inactive: string }; disabled?: boolean }) {
  const label = value ? actionLabels?.active ?? "Bật" : actionLabels?.inactive ?? "Tắt";
  return <div className="mcy-account-panel mcy-toggle-row"><span><strong>{title}</strong><small>{detail}</small></span><button disabled={disabled} aria-label={`${title} · ${label}`} aria-pressed={value} className={value ? "on" : ""} onClick={() => onToggle(!value)}><i aria-hidden="true">{value ? "✓" : ""}</i><span>{label}</span></button></div>;
}

function SyncScreen() {
  const flow = useFlow();
  const { state } = useDemo();
  const locale = state.locale;
  const latest = state.lastReflection ?? state.history.at(-1);
  const reflectionTitle = latest?.feedbackSkipped
    ? msg(locale, "sync.skippedTitle")
    : latest?.kind === "Sau tập"
      ? latest.endedEarly
        ? msg(locale, "sync.endedEarlyTitle")
        : latest.outcome || latest.observations.length || latest.status === "uncertain" || latest.status === "none_now"
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

function BottomNav() {
  const flow = useFlow();
  const { state } = useDemo();
  const current = flow.current.id;
  const locale = state.locale;
  const items = [
    { id: "home", label: msg(locale, "journey.nav.today"), icon: <HomeIcon /> },
    { id: "journey", label: msg(locale, "journey.nav.journey"), icon: <BarChartIcon /> },
    { id: "discover", label: msg(locale, "journey.nav.discover"), icon: <PlayIcon /> },
    { id: "profile", label: msg(locale, "journey.nav.profile"), icon: <PersonIcon /> },
  ];
  return <nav className="mcy-bottom-nav" aria-label={msg(locale, "journey.navLabel")}>{items.map(item => <button key={item.id} aria-current={current === item.id ? "page" : undefined} onClick={() => { if (current !== item.id) flow.replace(ROUTES[item.id]); }}>{item.icon}<span>{item.label}</span></button>)}</nav>;
}
