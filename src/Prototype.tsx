import { createContext, lazy, Suspense, useContext, useEffect, useLayoutEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";
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
import { bodyLevelLabel, formatMessage, guidedChoiceLabel, localizedNumber, msg, regionLabel, energyLabel, sideLabel, type AppLocale } from "./i18n";
import {
  ArrowLeftIcon, ArrowRightIcon, BarChartIcon, CheckIcon, ChevronDownIcon,
  HeartIcon, HomeIcon, InfoCircledIcon, MagicWandIcon,
  PersonIcon, PlayIcon, ReaderIcon,
} from "@radix-ui/react-icons";
import { BottomSheet, Carousel, FlowStack, KeyboardInput, KeyboardTextarea, MobileScroll, type FlowScreen, useFlow, useKeyboard } from "./mobile";
import { authRedirectUrl, backendConfigured, clientChannel, getSupabaseClient, shouldInitializeAuthForCurrentLaunch } from "./backend/supabase";
import { NATIVE_AUTH_PENDING_KEY, nativeAuthCodeFromCallback, rememberNativeAuthUrl } from "./backend/nativeAuth";
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
  backendError: string;
  remoteCheckins: Snapshot[];
  currentRemoteCheckinId: string | null;
  pendingCheckinIdempotencyKey: string | null;
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
  outcome: null, pace: null, note: "",
  selectedCourseId: null,
  selectedLessonId: null,
  checkinBaselineReady: false,
  reflectionHasCheckinBaseline: false,
  reflectionBeforeStatus: null,
  reflectionBeforeObservations: [],
  reflectionLessonTitle: "",
  endedEarly: false, rememberPace: true, usePreviousFeedback: false, history: [],
  signedIn: false, userId: null, backendStatus: backendConfigured ? "loading" : "ready", backendError: "", remoteCheckins: [], currentRemoteCheckinId: null, pendingCheckinIdempotencyKey: null,
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

function useDemo() {
  const context = useContext(DemoContext);
  if (!context) throw new Error("Prototype state missing");
  const update = (patch: Partial<DemoState>) => context.setState(previous => ({ ...previous, ...patch }));
  return { ...context, update };
}
function latestFeedback(state: DemoState) {
  const previous = [...state.history].reverse().find(item => item.kind === "Sau tập");
  return state.saveFeedbackConsent && state.rememberPace && state.usePreviousFeedback && previous?.outcome !== "Khó chịu hơn" && !previous?.endedEarly ? previous : undefined;
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
    currentRemoteCheckinId: null,
    pendingCheckinIdempotencyKey: null,
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
// The editor offers three levels (Bình thường · Hơi mỏi · Đau nhức); "Vừa" (stored level 2) stays readable for records saved earlier.
const EDITOR_LEVELS: BodyLevel[] = ["Không khó chịu", "Nhẹ", "Nhiều"];
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
async function persistConsentChanges(
  state: DemoState,
  source: "onboarding" | "settings",
): Promise<{ consents: ConsentState; policyVersions: ConsentPolicyVersions }> {
  const client = state.userId ? await getSupabaseClient() : null;
  if (!client || !state.userId) return { consents: state.consentBaseline, policyVersions: state.consentPolicyVersions };
  const next = consentStateForDemo(state);
  const events = (Object.keys(next) as ConsentPurpose[]).filter(purpose => {
    const currentPolicyVersion = CONSENT_POLICY_VERSIONS[purpose];
    const needsReacceptance = state.consentPolicyVersions[purpose] !== currentPolicyVersion
      && next[purpose];
    return next[purpose] !== state.consentBaseline[purpose] || needsReacceptance;
  });
  await Promise.all(events.map(purpose => saveConsentEvent(
    client,
    purpose,
    next[purpose],
    CONSENT_POLICY_VERSIONS[purpose],
    source,
    crypto.randomUUID(),
    clientChannel(),
  )));
  const policyVersions = { ...state.consentPolicyVersions };
  for (const purpose of events) {
    policyVersions[purpose] = CONSENT_POLICY_VERSIONS[purpose];
  }
  return { consents: next, policyVersions };
}
async function persistProfile(state: DemoState, displayName: string, bodyStyle: BodyStyle, locale: AppLocale = state.locale) {
  if (!state.userId) return;
  const client = await getSupabaseClient();
  if (!client) return;
  const { error } = await client.from("profiles").upsert({
    user_id: state.userId,
    display_name: displayName.trim() || null,
    locale,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Ho_Chi_Minh",
    body_display_preference: bodyStyle,
  }, { onConflict: "user_id" });
  if (error) throw new Error(error.message);
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
async function persistCurrentCheckin(
  state: DemoState,
  setState: Dispatch<SetStateAction<DemoState>>,
  captureType: CheckinPayload["captureType"],
) {
  if (!state.signedIn || !state.userId || !state.saveFeedbackConsent) return null;
  const expectedUserId = state.userId;
  const client = await getSupabaseClient();
  if (!client) return null;
  const { data: authData, error: authError } = await client.auth.getUser();
  if (authError || authData.user?.id !== expectedUserId) return null;
  const idempotencyKey = state.pendingCheckinIdempotencyKey ?? crypto.randomUUID();
  setState(previous => isCurrentLearnerSession(previous.signedIn, previous.userId, expectedUserId)
    ? { ...previous, pendingCheckinIdempotencyKey: idempotencyKey, backendStatus: "loading", backendError: "" }
    : previous);
  const payload = toLearnerCheckinPayload(state, captureType, idempotencyKey);
  const saved = await saveLearnerCheckin(client, payload, expectedUserId);
  const row: LearnerCheckin = {
    id: saved.checkin_id,
    user_id: state.userId,
    local_date: payload.localDate,
    local_timezone: payload.timezone,
    energy_level: payload.energyLevel,
    overall_note: null,
    body_status: state.bodyStatus,
    capture_type: captureType,
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
  setState(previous => isCurrentLearnerSession(previous.signedIn, previous.userId, expectedUserId)
    ? {
        ...previous,
        remoteCheckins: [...previous.remoteCheckins.filter(item => item.remoteId !== saved.checkin_id), snapshot],
        currentRemoteCheckinId: saved.checkin_id,
        pendingCheckinIdempotencyKey: null,
        backendStatus: "ready",
        backendError: "",
      }
    : previous);
  return snapshot;
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
      <div className="mcy-editor-options">{([...EDITOR_LEVELS, ...(level === "Vừa" ? ["Vừa" as const] : []), "Chưa rõ" as const]).map(value => <Choice key={value} selected={level === value} onClick={() => setLevel(value)}>{bodyLevelLabel(locale, value)}</Choice>)}</div>
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
const AI_OFF_PRIVACY_DETAIL = "AI inference đang tắt trong staging; tin nhắn không được gửi tới nhà cung cấp mô hình khi tính năng tắt. Việc mở sau này cần qua các gate, có đồng ý riêng và chỉ dùng dữ liệu tối thiểu của lượt hiện tại; không gửi hội thoại trước đó, tên/email hay ghi chú lịch sử. AI không chẩn đoán.";
const AI_INFERENCE_AVAILABLE_FOR_LEARNERS = false;
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
    lead: "AI inference hiện đang tắt theo cấu hình staging của MCY.",
    paragraphs: [
      "Khi AI đang tắt, không có câu trả lời từ mô hình được tạo và tin nhắn không được gửi tới nhà cung cấp AI. Bạn vẫn có thể tự chọn các bài học video miễn phí.",
      "Nếu tính năng được mở sau khi hoàn tất các gate, xử lý AI sẽ cần sự đồng ý riêng và chỉ dùng thông tin tối thiểu của lượt hiện tại. Hội thoại trước đó, tên, email và ghi chú lịch sử không được gửi; AI không chẩn đoán hoặc chỉ định động tác.",
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
  checkin: { id: "checkin", header: () => <Header title="Check-in hôm nay" back />, headerHeight: 55, footer: () => <CheckinFooter />, footerHeight: 124, render: () => <CheckinScreen /> },
  dialogue: { id: "dialogue", header: () => <Header title="Trợ lý hôm nay" back />, headerHeight: 55, footer: () => <DialogueFooter />, footerHeight: 104, render: () => <DialogueScreen /> },
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
        update({ dialogueChoice: null, dialogueText: "", aiConversation: [], aiPending: false, aiError: "", minutes: 10, energy: null, regions: [], preObservations: [], postObservations: [], bodyStatus: null, postBodyStatus: null, outcome: null, pace: null, note: "", endedEarly: false, usePreviousFeedback: false, lastReflection: null, checkinBaselineReady: false, reflectionHasCheckinBaseline: false, reflectionBeforeStatus: null, reflectionBeforeObservations: [], reflectionLessonTitle: "", currentRemoteCheckinId: null, pendingCheckinIdempotencyKey: null });
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
  const staffWorkspace = ownerWorkspace || teacherWorkspace;
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

  if (ownerWorkspace) {
    return <Suspense fallback={<div className="owner-loading" role="status">Đang mở workspace…</div>}><OwnerWorkspacePortal /></Suspense>;
  }
  if (teacherWorkspace) {
    return <Suspense fallback={<div className="mcy-teacher-loading" role="status">Đang mở workspace…</div>}><TeacherWorkspacePortal /></Suspense>;
  }
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
          currentRemoteCheckinId: previous.currentRemoteCheckinId ?? remoteCheckins.at(-1)?.remoteId ?? null,
          backendStatus: "ready",
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
          window.setTimeout(() => { void hydrate(session); }, 0);
        });
        subscription = authSubscription.data.subscription;
        const { data, error } = await authClient.auth.getSession();
        if (!active) return;
        if (error) setState(previous => ({ ...previous, backendStatus: "error", backendError: error.message }));
        else void hydrate(data.session);
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
      subscription?.unsubscribe();
      void appUrlListener?.remove();
    };
  }, [reviewConsentScreen]);
  return <DemoContext.Provider value={{ state, setState }}><FlowStack initial={reviewConsentScreen ? ROUTES.consent : ROUTES.welcome}><AuthSessionRouter /><FlowRouteFocusManager /></FlowStack></DemoContext.Provider>;
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
        options: { shouldCreateUser: state.authMode === "create", emailRedirectTo: authRedirectUrl() },
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
    <h1>{state.authMode === "create" ? "Tạo tài khoản nhanh bằng email" : "Đăng nhập nhanh qua email"}</h1>
    {state.authMode === "create" && <p className="mcy-lead">Một Chút Yoga sẽ gửi email xác minh tới địa chỉ bạn cung cấp.</p>}
    <label className="mcy-form-field">Email<KeyboardInput inputMode="email" autoComplete="email" aria-label="Địa chỉ email" placeholder="ban@example.com" value={email} onChange={event => { setEmail(event.target.value); setError(""); }} onBlur={() => keyboard.hide()} /></label>
    {error && <div className="mcy-form-error" role="alert">{error}</div>}
    {!backendConfigured && <div className="mcy-alert">Backend chưa kết nối ở môi trường hiện tại. Bạn vẫn có thể xem và thử luồng khách.</div>}
    <Action disabled={sending || !backendConfigured} onClick={submit}>{sending ? "Đang gửi…" : state.authMode === "create" ? "Gửi email xác minh" : "Gửi mã"}</Action>
    {state.authMode === "create" && isCheckinAuthReturn(state.authReturnTo) && <button className="mcy-quiet-link" onClick={() => { keyboard.hide(); flow.replace(ROUTES.discover); }}>Xem bài học video miễn phí</button>}
    {state.authMode === "create" && <DemoNote>Email xác minh chỉ dùng qua Supabase Auth. Hãy hoàn tất trên cùng thiết bị để tiếp tục đúng phiên.</DemoNote>}
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
    if (code.length !== 6) { setError("Nhập đủ 6 chữ số để tiếp tục."); return; }
    if (!backendConfigured) { setError("Backend chưa được cấu hình cho môi trường này."); return; }
    setVerifying(true);
    try {
      const client = await getSupabaseClient();
      if (!client) { setError("Backend chưa được cấu hình cho môi trường này."); return; }
      const { data, error: authError } = await client.auth.verifyOtp({ email: state.accountEmail, token: code, type: "email" });
      if (authError || !data.user) { setError("Mã không hợp lệ hoặc đã hết hạn. Hãy kiểm tra hộp thư và thử lại."); return; }
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
      const { error: authError } = await client.auth.signInWithOtp({ email: state.accountEmail, options: { shouldCreateUser: state.authMode === "create", emailRedirectTo: authRedirectUrl() } });
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
    <p className="mcy-lead">Email đã gửi tới <strong>{state.accountEmail}</strong>. Nếu thư có mã 6 chữ số, nhập mã bên dưới. Nếu thư có liên kết, mở trên {Capacitor.isNativePlatform() ? "điện thoại này" : "trình duyệt này"}.</p>
    <label className="mcy-form-field">Mã 6 chữ số (nếu email có mã)<KeyboardInput inputMode="numeric" autoComplete="one-time-code" aria-label="Mã xác minh" placeholder="123456" value={code} onChange={event => { setCode(event.target.value.replace(/\D/g, "").slice(0, 6)); setError(""); }} onBlur={() => keyboard.hide()} /></label>
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
      ["aiConsent", "Cho phép AI hỗ trợ trao đổi ngắn", "AI inference đang tắt theo cấu hình staging. Lựa chọn này chỉ ghi nhận đồng ý riêng cho thời điểm tính năng được mở; hiện tin nhắn không được gửi tới nhà cung cấp mô hình và không có câu trả lời AI nào được tạo. Khi được bật sau các gate, chỉ thời lượng, năng lượng, vùng bạn chọn và tin nhắn của lượt hiện tại mới được gửi tới dịch vụ AI bên ngoài; không gửi hội thoại trước đó, tên/email hay ghi chú lịch sử. AI không chẩn đoán hoặc chỉ định động tác. Bạn có thể rút đồng ý bất cứ lúc nào. Nội dung quyền riêng tư vẫn là bản rà soát, chưa phải văn bản pháp lý cuối cùng.", state.aiConsent],
      ["saveFeedbackConsent", "Lưu check-in cơ thể và năng lượng", "Cho phép lưu các lần check-in và ghi chú để xem trong Hành trình. Phản hồi sau buổi hiện chỉ được giữ trong phiên.", state.saveFeedbackConsent],
      ["teacherShareConsent", "Chia sẻ với một giáo viên cụ thể", "Chưa có lớp được kết nối. Lựa chọn này luôn tắt cho đến khi bạn chọn rõ người nhận, phạm vi và thời hạn.", state.teacherShareConsent],
      ["marketingConsent", "Nhận tin về nội dung mới", "Tùy chọn; tách khỏi thông báo dịch vụ và nhắc tập.", state.marketingConsent],
    ] as const).map(([key, title, description, value]) => <section className="mcy-consent-card" key={key}><strong>{title}</strong><p>{description}</p><button disabled={key === "teacherShareConsent" && !value} aria-pressed={value} onClick={() => togglePurpose(key)}><i>{value ? "✓" : ""}</i>{key === "teacherShareConsent" && !value ? "Chưa có lớp được kết nối" : value && key === "teacherShareConsent" ? "Rút đồng ý" : value ? "Cho phép" : "Không cho phép"}</button></section>)}
    <div className="mcy-form-error subtle">Từ chối AI, bạn vẫn có thể tự chọn video miễn phí. Từ chối lưu thì check-in chỉ còn trong phiên và không được ghi vào tài khoản.</div>
    {state.onboardingComplete && isCheckinAuthReturn(state.authReturnTo) && <div className="mcy-consent-card"><strong>Nháp check-in trong phiên này</strong><p>{state.saveFeedbackConsent ? "Xác nhận tiếp tục sẽ gắn nháp với tài khoản của bạn." : "Bạn chưa cho phép lưu check-in; nháp chỉ dùng trong phiên này."} Nếu không muốn dùng nháp nữa, chọn Bỏ nháp.</p></div>}
    <DemoNote>Mỗi thay đổi được ghi thành sự kiện đồng ý riêng của tài khoản. Ngôn ngữ và phiên bản hiển thị được lưu cùng lựa chọn.</DemoNote>
  </main></MobileScroll>;
}

function ConsentFooter() {
  const flow = useFlow();
  const { state, setState } = useDemo();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const hasTransferDraft = state.onboardingComplete && isCheckinAuthReturn(state.authReturnTo);
  const continueNext = async (discardDraft = false) => {
    if (!state.termsAccepted || !state.privacyAccepted || saving) return;
    setSaving(true);
    setError("");
    try {
      const saved = await persistConsentChanges(state, "onboarding");
      setState(previous => ({
        ...previous,
        consentBaseline: saved.consents,
        consentPolicyVersions: saved.policyVersions,
        ...(discardDraft ? { preObservations: [], regions: [], bodyStatus: null, energy: null, pendingCheckinIdempotencyKey: null } : {}),
      }));
      if (state.onboardingComplete) {
        if (!discardDraft && isCheckinAuthReturn(state.authReturnTo) && state.saveFeedbackConsent) {
          await persistCurrentCheckin({ ...state, consentBaseline: saved.consents, consentPolicyVersions: saved.policyVersions, privacyAccepted: true }, setState, "practice_preparation");
        }
        const destination = discardDraft ? (isCheckinAuthReturn(state.authReturnTo) ? "discover" : "home") : normalizeAuthDestination(state.authReturnTo);
        finishAtAuthDestination(flow, destination);
      } else flow.replace(ROUTES.onboarding);
    } catch (cause) {
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
  const complete = async (discardDraft = false) => {
    if (saving) return;
    keyboard.hide();
    setSaving(true);
    setError("");
    try {
      const displayName = name.trim();
      const nextState = discardDraft ? {
        ...state,
        preObservations: [],
        regions: [],
        bodyStatus: null,
        energy: null,
        pendingCheckinIdempotencyKey: null,
      } : state;
      await persistProfile(nextState, displayName, nextState.bodyStyle, nextState.locale);
      if (!discardDraft && isCheckinAuthReturn(nextState.authReturnTo) && nextState.saveFeedbackConsent) {
        await persistCurrentCheckin({ ...nextState, displayName, onboardingComplete: true }, setState, "practice_preparation");
      }
      update({
        displayName,
        onboardingComplete: true,
        backendStatus: "ready",
        backendError: "",
        ...(discardDraft ? {
          preObservations: [], regions: [], bodyStatus: null, energy: null,
          pendingCheckinIdempotencyKey: null,
        } : {}),
      });
      const destination = discardDraft ? (isCheckinAuthReturn(state.authReturnTo) ? "discover" : "home") : normalizeAuthDestination(state.authReturnTo);
      finishAtAuthDestination(flow, destination);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Chưa hoàn tất được thiết lập tài khoản.");
    } finally {
      setSaving(false);
    }
  };
  return <MobileScroll className="mcy-scroll"><main className="mcy-page mcy-auth-page">
    <Eyebrow>A04 · THIẾT LẬP TỐI THIỂU</Eyebrow><h1>Chỉ thêm điều hữu ích.</h1>
    <p className="mcy-lead">Tên hiển thị không bắt buộc. Hình minh họa là sở thích hiển thị, không dùng để suy luận giới hay sức khỏe.</p>
    <label className="mcy-form-field">Tên hiển thị · tùy chọn<KeyboardInput autoComplete="nickname" aria-label="Tên hiển thị" placeholder="Bạn muốn được gọi là gì?" value={name} onChange={event => setName(event.target.value)} onBlur={() => keyboard.hide()} /></label>
    <section className="mcy-account-panel"><strong>Hình minh họa cơ thể</strong><p>Chọn hình dễ dùng nhất; có thể đổi bất cứ lúc nào.</p><BodyStylePicker value={state.bodyStyle} onChange={bodyStyle => update({ bodyStyle })} /></section>
    {showTransfer && <div className="mcy-consent-card"><strong>Nháp check-in trong phiên này</strong><p>{state.preObservations.length || state.regions.length ? `${state.preObservations.length || state.regions.length} vùng đã ghi, ${state.minutes} phút${state.energy ? `, năng lượng ${state.energy}` : ""}.` : "Chưa có ghi nhận cơ thể trong phiên này."} Tiếp tục sẽ gắn nháp với tài khoản hiện tại theo lựa chọn lưu của bạn.</p><div className="mcy-auth-secondary"><button disabled={saving} onClick={() => { void complete(); }}>Xác nhận chuyển nháp</button><button disabled={saving} onClick={() => { void complete(true); }}>Bỏ nháp</button></div></div>}
    {error && <div className="mcy-form-error" role="alert">{error}</div>}
    {!showTransfer && <Action disabled={saving} onClick={() => setShowTransfer(true)}>Tiếp tục</Action>}
    {!showTransfer && <button className="mcy-quiet-link" disabled={saving} onClick={() => { if (isCheckinAuthReturn(state.authReturnTo)) setShowTransfer(true); else void complete(); }}>{saving ? "Đang lưu…" : "Để sau"}</button>}
    <DemoNote>Hồ sơ và lựa chọn được đồng bộ với tài khoản. Check-in chỉ ghi server nếu bạn đã cho phép lưu.</DemoNote>
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
  const previous = [...state.history].reverse().find(item => item.kind === "Sau tập");
  return <MobileScroll className="mcy-scroll"><main className="mcy-page">
    <Eyebrow>{previous ? "MỘT LẦN QUAY LẠI, KHÔNG CẦN VỘI" : "MỖI BUỔI BẮT ĐẦU TỪ HÔM NAY"}</Eyebrow>
    <h1>{previous ? "Hôm nay bạn muốn bắt đầu thế nào?" : "Một chút thời gian cho chính mình."}</h1>
    <p className="mcy-lead">Ghi lại điều bạn muốn cho hôm nay, rồi tự chọn một bài học video miễn phí. Bạn không cần đăng nhập để xem bài.</p>
    {previous && state.saveFeedbackConsent && state.rememberPace && previous.pace === "Hơi nhanh" && previous.outcome !== "Khó chịu hơn" && !previous.endedEarly ? <div className="mcy-memory-hint"><MagicWandIcon /><span>Lần trước bạn nói nhịp hơi nhanh. Lần này bạn có thể chọn chậm hơn.</span></div> : null}
    <div className="mcy-home-photo"><img src="/assets/today-neck-stretch-1200.webp" srcSet="/assets/today-neck-stretch-600.webp 600w, /assets/today-neck-stretch-1200.webp 1200w" sizes="(min-width: 700px) 450px, 100vw" alt="Hình minh họa buổi tập yoga tại nhà" loading="lazy" decoding="async" /><span>Một bài học miễn phí, do bạn tự chọn</span></div>
    <div className="mcy-home-cta"><Action onClick={() => flow.push(ROUTES.checkin)}>{previous ? "Ghi nhận hôm nay" : "Bắt đầu check-in"}</Action><span>Không cần check-in để duyệt bài học</span></div>
    <div className="mcy-section-label">BẠN SẼ ĐI QUA</div>
    <div className="mcy-steps-list"><div><b>01</b><span>Check-in ngắn<small>Ghi nhận cảm nhận, năng lượng hoặc bỏ qua.</small></span></div><div><b>02</b><span>Tự chọn bài học<small>Duyệt từng video miễn phí ngay trong ứng dụng.</small></span></div><div><b>03</b><span>Phản hồi của bạn<small>Ghi lại cảm nhận sau buổi nếu bạn muốn.</small></span></div></div>
    <DemoNote>Khi đăng nhập, hồ sơ, lựa chọn quyền và check-in đã đồng ý lưu sẽ được kết nối với tài khoản của bạn.</DemoNote>
  </main></MobileScroll>;
}

function CheckinScreen() {
  const flow = useFlow();
  const { state, update, setState } = useDemo();
  const locale = state.locale;
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
    try {
      const remote = await persistCurrentCheckin(state, setState, "standalone");
      setState(previous => ({
        ...previous,
        history: !remote && previous.saveFeedbackConsent ? [...previous.history, makeSnapshot("Ghi riêng", previous.bodyStatus, previous.preObservations)] : previous.history,
        preObservations: [], postObservations: [], regions: [], bodyStatus: null, energy: null,
        pendingCheckinIdempotencyKey: null,
      }));
    } catch (cause) {
      setSaveError(cause instanceof Error ? cause.message : "Chưa lưu được check-in. Kiểm tra mạng rồi thử lại.");
      setSaving(false);
      return;
    }
    setSaving(false);
    flow.push(ROUTES.journey);
  };
  const statusDescription = state.bodyStatus === "none_now" ? msg(locale, "checkin.selectedNone") : state.bodyStatus === "uncertain" ? msg(locale, "checkin.selectedUnsure") : state.bodyStatus === "skipped" ? msg(locale, "checkin.selectedSkipped") : "";
  const bodySummary = state.bodyStatus === "none_now" ? msg(locale, "checkin.noDiscomfort") : state.bodyStatus === "uncertain" ? msg(locale, "checkin.unsure") : state.bodyStatus === "skipped" ? msg(locale, "checkin.skipBody") : state.preObservations.map(item => `${regionLabel(locale, item.region)}${isPairedBodyRegion(item.region) && item.side !== "unspecified" ? ` · ${sideLabel(locale, item.side)}` : ""} · ${item.status === "uncertain" ? bodyLevelLabel(locale, "Chưa rõ") : bodyLevelLabel(locale, item.level ?? msg(locale, "checkin.notRecorded"))}`).join(", ");
  return <MobileScroll className="mcy-scroll"><main className={`mcy-page mcy-checkin-page step-${state.checkinStep}`}>
    <div className="mcy-step-count" aria-live="polite">{formatMessage(locale, "checkin.stepCount", { step: state.checkinStep })}<span>{msg(locale, state.checkinStep === 1 ? "checkin.step1.label" : "checkin.step2.label")}</span></div>
    <h1>{msg(locale, state.checkinStep === 1 ? "checkin.step1.title" : "checkin.step2.title")}</h1>
    <p className="mcy-lead">{msg(locale, state.checkinStep === 1 ? "checkin.step1.lead" : "checkin.step2.lead")}</p>
    {state.checkinStep === 1 ? <div className="mcy-checkin-content checkin-step-body">
      <div className="mcy-checkin-illustration">
        <div className="mcy-scroll-hint"><ChevronDownIcon />{msg(locale, "checkin.scrollHint")}</div>
        <div className="mcy-body-groups" aria-label={locale === "en-US" ? "Body areas" : "Nhóm vùng cơ thể"}>{(["trunk", "arms", "legs"] as BodyRegionGroup[]).map(group => <button key={group} aria-pressed={regionGroup === group} onClick={() => setRegionGroup(group)}>{msg(locale, `checkin.group.${group}` as "checkin.group.trunk" | "checkin.group.arms" | "checkin.group.legs")}<small>{state.preObservations.filter(item => BODY_REGION_GROUPS[group].includes(item.region)).length}</small></button>)}</div>
        <BodyMap observations={state.preObservations} bodyStyle={state.bodyStyle} locale={locale} group={regionGroup} onSelect={openRegion} />
        <BodyStylePicker value={state.bodyStyle} onChange={bodyStyle => update({ bodyStyle })} />
      </div>
      <div className="mcy-checkin-fields">
        <h2 className="mcy-inline-section-title">{msg(locale, "checkin.regions")}</h2>
        <div className="mcy-region-list" aria-label={locale === "en-US" ? "Choose a body area" : "Chọn vùng cơ thể"}>{BODY_REGION_GROUPS[regionGroup].map(region => { const items = state.preObservations.filter(entry => entry.region === region); const detail = items.length ? items.map(item => `${isPairedBodyRegion(region) && item.side !== "unspecified" ? `${sideLabel(locale, item.side)} · ` : ""}${item.status === "uncertain" ? msg(locale, "checkin.unsure") : bodyLevelLabel(locale, item.level ?? msg(locale, "checkin.notRecorded"))}`).join(" / ") : msg(locale, "checkin.tapToRecord"); return <button key={region} className={items.length ? "selected" : ""} onClick={() => openRegion(region)}><span>{regionLabel(locale, region)}</span><small>{detail}</small><ArrowRightIcon /></button>; })}</div>
        <div className="mcy-body-status-actions"><p>{locale === "en-US" ? "Or choose one of these:" : "Hoặc chọn một trạng thái:"}</p><div><Choice selected={state.bodyStatus === "none_now"} onClick={() => chooseStatus("none_now")}>{msg(locale, "checkin.noDiscomfort")}</Choice><Choice selected={state.bodyStatus === "uncertain"} onClick={() => chooseStatus("uncertain")}>{msg(locale, "checkin.unsure")}</Choice><Choice selected={state.bodyStatus === "skipped"} onClick={() => chooseStatus("skipped")}>{msg(locale, "checkin.skipBody")}</Choice></div></div>
        {statusDescription && <p className="mcy-status-caption">{statusDescription}</p>}
        <div className="mcy-inline-note"><InfoCircledIcon />{msg(locale, "checkin.disclaimer")}</div>
      </div>
    </div> : <div className="mcy-checkin-step-two">
      {showStepTwoScrollHint && <div className="mcy-scroll-hint mcy-checkin-step-two-scroll-hint"><ChevronDownIcon aria-hidden="true" />{msg(locale, "checkin.step2.scrollHint")}</div>}
      <section className="mcy-energy-card"><h2>{msg(locale, "checkin.energy")} <small>({msg(locale, "checkin.optional")})</small></h2><div className="mcy-energy-options">{(["Rất thấp", "Thấp", "Bình thường", "Khá ổn", "Tràn đầy"] as Energy[]).map((value, index) => <button key={value} aria-pressed={state.energy === value} onClick={() => update({ energy: value })}><EnergyFace level={index} /><span>{energyLabel(locale, value)}</span></button>)}</div></section>
      <section className="mcy-field-section compact"><h2>{msg(locale, "checkin.duration")}</h2><div className="mcy-chip-grid">{([5, 10, 15] as const).map(time => <Choice key={time} selected={state.minutes === time} onClick={() => update({ minutes: time })}>{formatMessage(locale, "checkin.minutes", { minutes: localizedNumber(locale, time) })}</Choice>)}</div></section>
      <div className="mcy-checkin-summary"><span><strong>{locale === "en-US" ? "Body check-in" : "Cảm nhận cơ thể"}</strong><small>{bodySummary || (locale === "en-US" ? "Not added" : "Chưa ghi nhận")}</small></span><button onClick={() => update({ checkinStep: 1 })}>{locale === "en-US" ? "Edit" : "Sửa"}</button></div>
      <button className="mcy-standalone-link" disabled={saving} onClick={() => { void standalone(); }}>{saving ? (locale === "en-US" ? "Saving check-in…" : "Đang lưu check-in…") : msg(locale, "checkin.standalone")}</button>
      {saveError && <div className="mcy-form-error" role="alert">{locale === "en-US" ? "Couldn't save check-in: " : "Chưa lưu được check-in: "}{saveError}</div>}
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
    <div className="mcy-checkin-progress" aria-hidden="true">
      <span className="mcy-progress-track"><i className={state.checkinStep === 1 ? "active" : "done"} /><i className={state.checkinStep === 2 ? "active" : ""} /></span>
    </div>
    {state.checkinStep === 1 ? <>
      <Action onClick={advanceStep}>{msg(locale, "checkin.step1.next")}</Action>
      <div className="mcy-checkin-footer-options"><button onClick={skipBody}>{msg(locale, "checkin.step1.skip")}</button><button onClick={browseFreeLessons}>{msg(locale, "checkin.directPlan")}</button></div>
    </> : <>
      <Action onClick={browseFreeLessons}>{msg(locale, "checkin.step2.guest")}</Action>
      <div className="mcy-checkin-footer-options">{!state.signedIn && <button onClick={openOptionalAccount}>{msg(locale, "checkin.step2.account")}</button>}<button onClick={() => update({ checkinStep: 1 })}>{msg(locale, "checkin.backToBody")}</button></div>
    </>}
    <BottomSheet open={confirmSkip} onOpenChange={setConfirmSkip} title={locale === "en-US" ? "Skip the body check-in?" : "Bỏ ghi nhận vùng cơ thể?"} description={locale === "en-US" ? "The areas you entered will be cleared from this check-in. You can add them again later." : "Các vùng vừa ghi sẽ được xóa khỏi lần check-in này. Bạn có thể chọn lại sau."} snap={0.38}>
      <div className="mcy-sheet-actions"><button className="mcy-action" onClick={() => { update({ checkinStep: 2, bodyStatus: "skipped", preObservations: [], regions: [] }); setConfirmSkip(false); }}>{locale === "en-US" ? "Skip and continue" : "Bỏ qua và tiếp tục"} <ArrowRightIcon /></button><button className="mcy-quiet-link" onClick={() => setConfirmSkip(false)}>{locale === "en-US" ? "Keep my entries" : "Giữ các vùng đã ghi"}</button></div>
    </BottomSheet>
  </div>;
}

async function aiFailureMessage(error: unknown, locale: AppLocale) {
  let code = "";
  const response = (error as { context?: unknown } | null)?.context;
  if (response instanceof Response) {
    try {
      const body = await response.clone().json() as { error?: unknown };
      if (typeof body.error === "string") code = body.error;
    } catch {
      // Function errors are deliberately shown as neutral, non-sensitive copy.
    }
  }
  if (locale === "en-US") {
    if (code === "message_contains_identifiers") return "Please remove names or contact details before sending. This message was not sent to the AI provider.";
    if (code === "ai_usage_limit_reached") return "The assistant has reached its daily limit. You can still browse the free video lessons.";
    if (code === "current_ai_consent_required") return "Your current AI consent is missing or out of date. Review it in Privacy settings before trying again.";
    if (code === "ai_provider_not_configured" || code === "ai_temporarily_unavailable" || code === "ai_model_unavailable") return "The assistant is not available right now. No reply was generated; you can browse the free lessons instead.";
    return "The assistant could not reply just now. Your message was not saved; please try again or browse the free lessons.";
  }
  if (code === "message_contains_identifiers") return "Vui lòng xóa tên hoặc thông tin liên hệ trước khi gửi. Tin nhắn này chưa được chuyển tới nhà cung cấp AI.";
  if (code === "ai_usage_limit_reached") return "Trợ lý đã chạm giới hạn trong ngày. Bạn vẫn có thể tự chọn bài học video miễn phí.";
  if (code === "current_ai_consent_required") return "Đồng ý AI hiện thiếu hoặc đã cũ. Hãy xem lại mục Quyền riêng tư trước khi thử tiếp.";
  if (code === "ai_provider_not_configured" || code === "ai_temporarily_unavailable" || code === "ai_model_unavailable") return "Trợ lý hiện chưa sẵn sàng. Chưa có câu trả lời nào được tạo; bạn vẫn có thể xem các bài học miễn phí.";
  return "Trợ lý chưa trả lời được lúc này. Tin nhắn không được lưu; bạn có thể thử lại hoặc tự chọn bài học miễn phí.";
}

function DialogueScreen() {
  const keyboard = useKeyboard();
  const { state, update, setState } = useDemo();
  const locale = state.locale;
  const quickKeys = ["dialogue.quick.1", "dialogue.quick.2", "dialogue.quick.3", "dialogue.quick.4"] as const;
  const sendPreference = async (message: string, choice: DialogueChoice = null) => {
    const trimmed = message.trim();
    if (!trimmed || state.aiPending) return;
    keyboard.hide();
    const requestUserId = state.userId;
    const userTurnIndex = state.aiConversation.length;
    if (!backendConfigured || !state.signedIn || !requestUserId || !hasCurrentAiConsent(state)) {
      update({ aiError: locale === "en-US" ? "Sign in and review the current AI consent before continuing." : "Hãy đăng nhập và xác nhận đồng ý AI hiện hành trước khi tiếp tục." });
      return;
    }
    const userTurn: DialogueMessage = { role: "user", content: trimmed.slice(0, 500) };
    update({
      aiPending: true,
      aiError: "",
      dialogueChoice: choice,
      dialogueText: "",
      unrecognizedText: "",
      aiConversation: [...state.aiConversation, userTurn],
    });
    const regions = [...new Set(state.preObservations.flatMap(item => bodyRegionCodes(item.region, item.side)))];
    try {
      const client = await getSupabaseClient();
      if (!client) throw new Error("Backend chưa kết nối.");
      const { data, error } = await client.functions.invoke("mcy-ai-assistant", {
        body: {
          requestId: crypto.randomUUID(),
          context: {
            locale,
            minutes: state.minutes,
            energy: state.energy,
            intent: state.intent,
            regions,
          },
          message: userTurn.content,
        },
      });
      if (error) throw error;
      if (!data || typeof data.reply !== "string" || !data.reply.trim()) throw new Error("invalid_ai_response");
      setState(previous => {
        if (previous.userId !== requestUserId
          || previous.aiConversation.length !== userTurnIndex + 1
          || previous.aiConversation[userTurnIndex]?.role !== "user"
          || previous.aiConversation[userTurnIndex]?.content !== userTurn.content) return previous;
        return {
          ...previous,
          aiPending: false,
          aiError: "",
          aiConversation: [...previous.aiConversation, { role: "assistant", content: data.reply.trim().slice(0, 500) }],
        };
      });
    } catch (error) {
      const safeMessage = await aiFailureMessage(error, locale);
      setState(previous => previous.userId !== requestUserId
        || previous.aiConversation.length !== userTurnIndex + 1
        || previous.aiConversation[userTurnIndex]?.role !== "user"
        || previous.aiConversation[userTurnIndex]?.content !== userTurn.content
        ? previous
        : { ...previous, aiPending: false, aiError: safeMessage, aiConversation: previous.aiConversation.slice(0, userTurnIndex) });
    }
  };
  const submitText = () => {
    void sendPreference(state.dialogueText);
  };
  return <MobileScroll className="mcy-scroll"><main className="mcy-page mcy-dialogue">
    <div className="mcy-step-count">{locale === "en-US" ? "STEP 2 OF 3" : "BƯỚC 02 / 03"} <span>{msg(locale, "dialogue.step")}</span></div>
    <h1>{AI_INFERENCE_AVAILABLE_FOR_LEARNERS ? msg(locale, "dialogue.title") : locale === "en-US" ? "Choose a free lesson at your own pace." : "Bạn có thể tự chọn một bài học phù hợp."}</h1>
    <p className="mcy-lead">{AI_INFERENCE_AVAILABLE_FOR_LEARNERS ? msg(locale, "dialogue.lead") : locale === "en-US" ? "AI is currently off. No message will be sent and no AI reply will be created." : "AI hiện đang tắt. Không có tin nhắn nào được gửi đi và không có phản hồi AI nào được tạo."}</p>
    {!AI_INFERENCE_AVAILABLE_FOR_LEARNERS ? <div className="mcy-account-panel" role="status"><span className="mcy-tag">{locale === "en-US" ? "AI OFF" : "AI ĐANG TẮT"}</span><strong>{locale === "en-US" ? "Browse without sharing a message" : "Xem bài học mà không gửi lời nhắn"}</strong><p>{locale === "en-US" ? "You can browse the free lessons now. Your check-in remains yours; it will not be used to generate an AI recommendation." : "Bạn có thể tự xem thư viện bài học miễn phí. Check-in vẫn thuộc về bạn và hiện chưa được dùng để tạo gợi ý bằng AI."}</p></div> : <>
    <div className="mcy-ai-context"><div className="mcy-ai-avatar"><MagicWandIcon /><span>{locale === "en-US" ? "Today, so far" : "Điều bạn đã chọn hôm nay"}</span></div><p>{locale === "en-US" ? <>You have <strong>{localizedNumber(locale, state.minutes)} min</strong>{state.energy ? <> and your energy is <strong>{energyLabel(locale, state.energy).toLowerCase()}</strong></> : null}{regionsDescription(locale, state.preObservations)}. Tell me what would help you feel ready to begin.</> : <>Hôm nay bạn có <strong>{state.minutes} phút</strong>{state.energy ? <>, năng lượng <strong>{state.energy.toLowerCase()}</strong></> : null}{regionsDescription(locale, state.preObservations)}. Điều gì sẽ giúp bạn thấy sẵn sàng bắt đầu?</>}</p></div>
    <div className="mcy-conversation" aria-live="polite">
      {state.aiConversation.map((turn, index) => <div className={`mcy-bubble ${turn.role === "user" ? "mine" : "ai"}`} key={`${turn.role}-${index}`}>{turn.content}</div>)}
      {state.aiPending && <div className="mcy-bubble ai quiet" role="status">{locale === "en-US" ? "Thinking…" : "Mình đang lắng nghe…"}</div>}
    </div>
    <div className="mcy-section-label">{msg(locale, "dialogue.quick")}</div>
    <div className="mcy-chip-grid dialogue-chips">{(["Nhiều hướng dẫn", "Nhịp chậm", "Ít lời", "Không nằm sàn"] as Exclude<DialogueChoice, null>[]).map((choice, index) => <Choice key={choice} selected={state.dialogueChoice === choice} disabled={state.aiPending} onClick={() => { void sendPreference(guidedChoiceLabel(locale, choice), choice); }}>{msg(locale, quickKeys[index])}</Choice>)}</div>
    <div className="mcy-composer"><KeyboardInput aria-label={msg(locale, "dialogue.inputLabel")} placeholder={msg(locale, "dialogue.inputPlaceholder")} value={state.dialogueText} maxLength={500} onChange={event => update({ dialogueText: event.target.value })} onKeyDown={event => { if (event.key === "Enter") { event.preventDefault(); submitText(); } }} onBlur={() => keyboard.hide()} /><button aria-label={msg(locale, "dialogue.send")} disabled={state.aiPending || !state.dialogueText.trim()} onClick={submitText}><ArrowRightIcon /></button></div>
    {state.aiError && <div className="mcy-form-error" role="alert">{state.aiError}</div>}
    <p className="mcy-ai-privacy-note">{locale === "en-US" ? "AI uses only today's selections and this conversation. Stored body notes and account details are not added automatically; please don't include names or contact details in your message. Replies are not saved." : "AI chỉ nhận lựa chọn hôm nay và nội dung bạn gửi trong cuộc trò chuyện. Ghi chú cơ thể đã lưu và thông tin tài khoản không được tự động gửi; vui lòng không ghi tên hoặc thông tin liên hệ vào lời nhắn. Hội thoại không được lưu vào tài khoản."}</p>
    <div className="mcy-inline-note"><InfoCircledIcon />{msg(locale, "dialogue.note")}</div>
    </>}
  </main></MobileScroll>;
}

function regionsDescription(locale: AppLocale, observations: Observation[]) {
  const regions = observations.map(item => regionLabel(locale, item.region).toLowerCase());
  return regions.length ? locale === "en-US" ? <> and selected <strong>{[...new Set(regions)].join(", ")}</strong></> : <>; bạn chọn lưu ý vùng <strong>{[...new Set(regions)].join(", ")}</strong></> : null;
}

function DialogueFooter() {
  const flow = useFlow();
  const keyboard = useKeyboard();
  const { state } = useDemo();
  const locale = state.locale;
  return <div className="mcy-flow-footer">
    <button className="mcy-quiet-link" onClick={() => { keyboard.hide(); flow.pop(); }}>{locale === "en-US" ? "Adjust today's check-in" : "Điều chỉnh check-in hôm nay"}</button>
    <Action onClick={() => { keyboard.hide(); flow.push(ROUTES.discover); }}>{locale === "en-US" ? "Browse free video lessons" : "Tự chọn bài học video miễn phí"}</Action>
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
  const feedback = state.saveFeedbackConsent ? [...state.history].reverse().find(item => item.pace === "Hơi nhanh") : undefined;
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
      <AccountRow title="AI và điều được nhớ" detail={feedback ? "Có phản hồi để xem nguồn và cách rút lại" : "Chưa có thông tin được nhớ"} onClick={() => flow.push(ROUTES.memory)} />
      <AccountRow title="Quyền riêng tư và đồng ý" detail="Mỗi mục đích, phiên bản và cách thay đổi" onClick={() => flow.push(ROUTES.privacy)} />
      <AccountRow title="Bảo mật tài khoản" detail="Email, phiên đăng nhập và xác minh lại" onClick={() => flow.push(ROUTES.security)} />
      <AccountRow title="Nhắc tập và thông báo" detail="Tùy chọn kênh, giờ và múi giờ" onClick={() => flow.push(ROUTES.notifications)} />
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
  const deviceTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "Không xác định";
  const filteredHelpArticles = HELP_ARTICLES.filter(article => {
    const searchableText = [article.title, article.detail, article.lead, ...article.paragraphs].join(" ").toLocaleLowerCase("vi");
    return searchableText.includes(query.toLocaleLowerCase("vi"));
  });
  const latest = state.saveFeedbackConsent ? [...state.history].reverse().find(item => item.kind === "Sau tập") : undefined;
  const changeConsent = async (purpose: ConsentPurpose, granted: boolean, patch: Partial<DemoState>) => {
    setError("");
    try {
      const policyVersion = CONSENT_POLICY_VERSIONS[purpose];
      const needsReacceptance = granted && state.consentPolicyVersions[purpose] !== policyVersion;
      if (state.userId && (state.consentBaseline[purpose] !== granted || needsReacceptance)) {
        const client = await getSupabaseClient();
        if (!client) throw new Error("Backend chưa kết nối.");
        await saveConsentEvent(client, purpose, granted, policyVersion, "settings", crypto.randomUUID(), clientChannel());
      }
      setState(previous => ({ ...previous, ...patch, consentBaseline: { ...previous.consentBaseline, [purpose]: granted }, consentPolicyVersions: { ...previous.consentPolicyVersions, [purpose]: policyVersion } }));
    } catch (cause) {
      setError(cause instanceof Error ? `Chưa lưu được lựa chọn quyền: ${cause.message}` : "Chưa lưu được lựa chọn quyền.");
    }
  };
  const saveProfileChanges = async () => {
    keyboard.hide();
    setError("");
    try {
      await persistProfile(state, name, state.bodyStyle, editLocale);
      update({ displayName: name.trim(), locale: editLocale });
      setError(state.userId ? "Hồ sơ đã lưu vào tài khoản." : "Hồ sơ chỉ được giữ trong phiên khách.");
    } catch (cause) {
      setError(cause instanceof Error ? `Chưa lưu được hồ sơ: ${cause.message}` : "Chưa lưu được hồ sơ.");
    }
  };
  const screen = (eyebrow: string, title: string, description: string, content: React.ReactNode) => <MobileScroll className="mcy-scroll"><main className="mcy-page mcy-account-detail"><Eyebrow>{eyebrow}</Eyebrow><h1>{title}</h1><p className="mcy-lead">{description}</p>{content}<DemoNote>Hồ sơ và lựa chọn quyền được đồng bộ khi dịch vụ đã kết nối. Nếu một tính năng chưa sẵn sàng, ứng dụng sẽ thông báo rõ trước khi bạn sử dụng.</DemoNote></main></MobileScroll>;
  if (panel === "edit") return screen("HỒ SƠ", "Thông tin tối thiểu, do bạn sửa.", "Tên tùy chọn, cài đặt hiển thị và các trường chỉ hỏi khi thật sự cần.", <><label className="mcy-form-field">Tên hiển thị<KeyboardInput autoComplete="nickname" aria-label="Tên hiển thị" value={name} onChange={event => setName(event.target.value)} onBlur={() => keyboard.hide()} placeholder="Tên gọi trong ứng dụng" /></label><div className="mcy-account-panel"><strong>Ngôn ngữ</strong>{import.meta.env.DEV ? <><div className="mcy-chip-grid"><Choice selected={editLocale === "vi-VN"} onClick={() => setEditLocale("vi-VN")}>Tiếng Việt</Choice><Choice selected={editLocale === "en-US"} onClick={() => setEditLocale("en-US")}>English · đang hoàn thiện</Choice></div><small className="mcy-locale-note">{editLocale === "en-US" ? "English is in progress. Welcome, the main practice loop and Journey are translated; account, consent, support and knowledge screens remain in Vietnamese." : "Tiếng Anh hiện đang được hoàn thiện. Chào mừng, luồng tập chính và Hành trình đã có bản dịch; tài khoản, đồng ý, hỗ trợ và nội dung kiến thức vẫn dùng tiếng Việt."}</small></> : <p className="mcy-device-timezone">Tiếng Việt</p>}<p className="mcy-device-timezone">Múi giờ thiết bị: {deviceTimeZone}</p></div><div className="mcy-account-panel"><strong>Hình body map</strong><BodyStylePicker value={state.bodyStyle} onChange={bodyStyle => update({ bodyStyle })} /></div>{error && <div className="mcy-form-error" role="alert">{error}</div>}<Action onClick={() => { void saveProfileChanges(); }}>Lưu thay đổi</Action><button className="mcy-quiet-link" onClick={() => flow.pop()}>Hủy</button></>);
  if (panel === "memory") return screen("AI VÀ ĐIỀU ĐƯỢC NHỚ", "Bạn xem được nguồn của mọi điều được nhớ.", "Không có suy luận sức khỏe dài hạn. Một phản hồi khó chịu hơn không thành sở thích mặc định.", <><div className="mcy-account-panel"><span className="mcy-tag">TRẠNG THÁI</span>{latest && state.rememberPace ? <><strong>Nhịp buổi trước hơi nhanh</strong><p>Nguồn: phản hồi sau buổi · phạm vi: gợi ý nhịp lần kế tiếp · dữ liệu chỉ trong phiên.</p><button className="mcy-toggle" aria-pressed={state.rememberPace} onClick={() => update({ rememberPace: false, usePreviousFeedback: false })}>Tắt và xóa ghi nhớ</button></> : <><strong>Chưa có ghi nhớ đang bật</strong><p>Phản hồi sau buổi hiện chỉ nằm trong phiên; chưa được lưu vào tài khoản.</p></>}</div><div className="mcy-account-panel"><strong>Trợ lý AI</strong><p>{state.aiConsent ? "Bạn đã đồng ý cho phép xử lý AI khi tính năng được mở. Inference hiện đang tắt trong staging; không có câu trả lời mô hình nào được tạo." : "AI inference đang tắt. Bạn vẫn có thể xem khóa học và tự chọn bài."}</p><button className="mcy-toggle" aria-pressed={state.aiConsent} onClick={() => { void changeConsent("ai_processing", !state.aiConsent, { aiConsent: !state.aiConsent, usePreviousFeedback: false }); }}>{state.aiConsent ? "Rút đồng ý AI" : "Đồng ý cho xử lý khi tính năng được mở"}</button></div><AccountRow title="Xem quyền theo mục đích" detail="Rút đồng ý và xem ảnh hưởng" onClick={() => flow.push(ROUTES.privacy)} />{error && <div className="mcy-form-error" role="alert">{error}</div>}</>);
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
      <PrivacyToggle title="Dùng check-in với trợ lý AI" detail={AI_OFF_PRIVACY_DETAIL} actionLabels={{ active: "Rút đồng ý", inactive: "Đồng ý" }} value={state.aiConsent} onToggle={value => { void changeConsent("ai_processing", value, { aiConsent: value, usePreviousFeedback: false }); }} />
      <PrivacyToggle title="Lưu check-in trong hành trình" detail="Cho phép lưu check-in mới; phản hồi sau buổi được giữ trong phiên hiện tại." value={state.saveFeedbackConsent} onToggle={value => { void changeConsent("wellbeing_data", value, { saveFeedbackConsent: value, rememberPace: value ? state.rememberPace : false, usePreviousFeedback: false }); }} />
      <PrivacyToggle title="Đồng ý chia sẻ với giáo viên" detail={state.teacherShareConsent ? "Chưa có lớp được kết nối. Bạn có thể rút lựa chọn đã lưu; hiện không có dữ liệu nào được gửi." : "Chưa có lớp được kết nối nên chưa thể cấp đồng ý chia sẻ. Khi có người nhận, bạn sẽ chọn rõ phạm vi và thời hạn."} value={state.teacherShareConsent} disabled={!state.teacherShareConsent} onToggle={value => { if (!value) void changeConsent("teacher_sharing", false, { teacherShareConsent: false }); }} />
      <PrivacyToggle title="Tin nội dung và marketing" detail="Tách khỏi thông báo dịch vụ và nhắc tập." value={state.marketingConsent} onToggle={value => { void changeConsent("marketing", value, { marketingConsent: value }); }} />
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
  if (panel === "security") return screen("BẢO MẬT", "Kiểm soát email và phiên đang mở.", "Xác minh lại email khi cần. Việc quản lý thiết bị và khôi phục danh tính luôn cần kiểm tra ở máy chủ.", <><div className="mcy-account-panel"><strong>Email đăng nhập</strong><p>{state.accountEmail || "Chưa đăng nhập"} · {state.signedIn ? "đã xác minh" : "chưa đăng nhập"}</p><button className="mcy-toggle" onClick={() => { update({ authMode: "login", authReturnTo: "security" }); flow.push(ROUTES.authEmail); }}>Đổi email có xác minh</button></div><div className="mcy-account-row static"><span><strong>Thiết bị này</strong><small>{state.signedIn ? "Phiên hiện tại" : "Chưa có phiên đăng nhập"}</small></span><span className="mcy-state-pill">{state.signedIn ? "HIỆN TẠI" : "KHÁCH"}</span></div><p className="mcy-inline-note">Nếu mất quyền truy cập email hoặc nghi có người dùng tài khoản, hãy liên hệ kênh hỗ trợ của MCY. Không tự gộp hai tài khoản.</p>{error && <div className="mcy-form-error subtle">{error}</div>}</>);
  if (panel === "notifications") return screen("THÔNG BÁO", "Nhắc tập theo lịch của bạn.", "Backend chưa gửi push hoặc email nhắc. Lựa chọn thông báo của tài khoản được lưu để dùng khi dịch vụ được triển khai.", <><PrivacyToggle title="Nhắc tập trong ứng dụng" detail="Múi giờ lấy từ thiết bị · lịch gửi chưa được cấu hình." value={state.notificationEnabled} onToggle={value => { void changeConsent("notifications", value, { notificationEnabled: value }); }} /><PrivacyToggle title="Email cập nhật nội dung" detail="Tùy chọn marketing; không ảnh hưởng email đăng nhập." value={state.emailUpdates} onToggle={value => { void changeConsent("marketing", value, { marketingConsent: value, emailUpdates: value }); }} />{error && <div className="mcy-form-error subtle" role="alert">{error}</div>}<div className="mcy-account-panel"><strong>Giờ yên lặng</strong><p>Chưa có lịch nhắc nào được gửi hoặc lên lịch.</p></div></>);
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
