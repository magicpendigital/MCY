import { createContext, useContext, useEffect, useLayoutEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";
import "@fontsource/roboto/latin-400.css";
import "@fontsource/roboto/latin-700.css";
import "@fontsource/roboto/vietnamese-400.css";
import "@fontsource/roboto/vietnamese-500.css";
import "@fontsource/roboto/vietnamese-700.css";
import { App as CapacitorApp } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";
import type { EmailOtpType } from "@supabase/supabase-js";
import { bodyLevelLabel, formatMessage, guidedChoiceLabel, localizedNumber, msg, regionLabel, energyLabel, sessionCopy, sideLabel, type AppLocale } from "./i18n";
import {
  ArrowLeftIcon, ArrowRightIcon, BarChartIcon, CheckIcon, ChevronDownIcon, ClockIcon,
  HeartIcon, HomeIcon, InfoCircledIcon, MagicWandIcon, PauseIcon,
  PersonIcon, PlayIcon, ReaderIcon,
} from "@radix-ui/react-icons";
import { BottomSheet, Carousel, FlowStack, KeyboardInput, KeyboardTextarea, MobileScroll, type FlowScreen, useFlow, useKeyboard } from "./mobile";
import { authRedirectUrl, backendConfigured, clientChannel, supabase } from "./backend/supabase";
import { BODY_REGIONS, BODY_REGION_GROUPS, bodyRegionCodes, decodeBodyRegionCode, isPairedBodyRegion, removeBodyObservation, replaceBodyObservation, type BodyRegion, type BodyRegionGroup, type BodySide } from "./bodyRegions";
import {
  deleteLearnerCheckin,
  emptyConsentState,
  loadLearnerSnapshot,
  hasCurrentRequiredConsent,
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

type Energy = "Rất thấp" | "Thấp" | "Bình thường" | "Khá ổn" | "Tràn đầy";
type BodyStyle = "neutral" | "feminine" | "masculine";
type BodyLevel = "Không khó chịu" | "Nhẹ" | "Vừa" | "Nhiều";
type BodyStatus = "reported" | "none_now" | "uncertain" | "skipped" | null;
type Observation = { region: BodyRegion; side: BodySide; level: BodyLevel | null; status: "reported" | "uncertain"; note: string };
type Intent = "Thả lỏng" | "Bắt nhịp" | "Tập trung";
type DialogueChoice = "Nhiều hướng dẫn" | "Nhịp chậm" | "Ít lời" | "Không nằm sàn" | null;
type Outcome = "Dễ chịu hơn" | "Như cũ" | "Khó chịu hơn" | "Chưa rõ" | null;
type Pace = "Vừa" | "Hơi nhanh" | "Hơi chậm" | null;
type SessionId = "reset-8" | "slow-9" | "short-5" | "steady-12";
type CheckinStep = 1 | 2;
type FreeCourseId = "gentle" | "poses" | "sequences";

type CourseLesson = {
  id: string;
  youtubeId: string;
  title: string;
  duration: string;
  description: string;
  visibility: "private" | "unlisted" | "public";
};

type FreeCourse = {
  id: FreeCourseId;
  title: string;
  description: string;
  lessons: CourseLesson[];
};

const YOUTUBE_CHANNEL_URL = "https://www.youtube.com/channel/UCHd1MgfJI7Zx4ij06vkg9rQ";

function youtubeLesson(id: string, youtubeId: string, title: string, duration: string): CourseLesson {
  return {
    id,
    youtubeId,
    title,
    duration,
    description: "Video hướng dẫn ngắn từ kênh Một chút yoga, để bạn theo nhịp riêng.",
    visibility: "unlisted",
  };
}

// The IDs are taken from the user's YouTube Studio channel on 2026-09-29.
// All 38 clips were normalized and saved as unlisted on 2026-09-29. They remain
// discoverable through the app while staying out of YouTube's public search and feed.
const FREE_COURSES: FreeCourse[] = [
  {
    id: "gentle",
    title: "Một chút chuyển động nhẹ",
    description: "Các bài thực hành ngắn để làm quen với nhịp tập của riêng bạn.",
    lessons: [
      youtubeLesson("01", "yKm7aOAWn-k", "01 · Thư giãn nhẹ", "0:43"),
      youtubeLesson("02", "mjxV5BTR5jA", "02 · Kéo giãn gân kheo nhẹ", "1:04"),
      youtubeLesson("03", "8KKUtPicnX0", "03 · Chuyển động toàn thân", "0:53"),
      youtubeLesson("04", "lJkD5OsUs4E", "04 · Chuyển động lưng dưới", "0:36"),
      youtubeLesson("05", "XPk59lYaNzU", "05 · Chuyển động lưng dưới · bài ngắn", "1:00"),
      youtubeLesson("06", "BSiC_g5FmRI", "06 · Chuyển động cổ và lưng trên", "0:17"),
      youtubeLesson("07", "I5pwMv2jYT4", "07 · Chuyển động cổ và lưng trên · bài ngắn", "0:20"),
      youtubeLesson("08", "OJEzzRobrWQ", "08 · Nhón gót đứng · bài thực hành chân", "0:37"),
      youtubeLesson("09", "Ie55V8b4sD4", "09 · Giãn cơ nhẹ", "0:45"),
      youtubeLesson("10", "GQrO8VFJhss", "10 · Chuyển động nhẹ toàn thân", "0:34"),
      youtubeLesson("11", "uLVYaURNcsM", "11 · Chuyển động vùng cổ", "0:22"),
      youtubeLesson("12", "Gc8zn8NcCVk", "12 · Chuyển động hông và chân", "0:25"),
      youtubeLesson("13", "CVjhYYhpn3o", "13 · Chuyển động nhẹ toàn thân", "0:30"),
      youtubeLesson("14", "_DttB5pLYjk", "14 · Mở vai khi nằm nghiêng", "0:58"),
      youtubeLesson("15", "-o-0h5H0_2I", "15 · Chuyển động cột sống", "0:50"),
      youtubeLesson("16", "NxSbVNT_D-Y", "16 · Lăn lưng với vòng", "0:28"),
      youtubeLesson("17", "67PlLgpEpnU", "17 · Chuyển động nhẹ · bài 17", "0:23"),
      youtubeLesson("18", "DLnOXS8BgJw", "18 · Chuyển động nhẹ · bài 18", "0:27"),
    ],
  },
  {
    id: "poses",
    title: "Làm quen với các tư thế yoga",
    description: "Một thư viện nhỏ các tư thế đơn để bạn học từng bước, không cần vội.",
    lessons: [
      youtubeLesson("19", "KtMlgK2cjsU", "Quỳ gối ngả sau", "0:49"),
      youtubeLesson("20", "54IPJkU7f_o", "Rắn hổ mang · phiên bản nhẹ", "0:35"),
      youtubeLesson("21", "McOZ1FW5jBM", "Rắn hổ mang", "0:24"),
      youtubeLesson("22", "0fs1LCnK3-U", "Quạ thấp", "0:39"),
      youtubeLesson("23", "p3sKiK8szF8", "Hoang dã cao", "0:53"),
      youtubeLesson("24", "DOmYgUoQyZI", "Đứng lên, giữ lưng thẳng", "0:38"),
      youtubeLesson("25", "CwhLdstN0dc", "Chó úp mặt · biến thể V ngược", "0:53"),
      youtubeLesson("26", "oFWjSKxXvKY", "Trường tấn cao", "0:46"),
      youtubeLesson("27", "rWl5ySBsrG0", "Bò mèo", "0:35"),
      youtubeLesson("28", "6Y-eWBnD8r8", "Bánh xe thấp", "0:54"),
      youtubeLesson("29", "wnenFwBE5oY", "Đầu bò", "0:48"),
      youtubeLesson("30", "wYiSFpP7vjs", "Chó ba chân", "0:33"),
      youtubeLesson("31", "gkiWrw9hREU", "Chiến binh II", "0:47"),
    ],
  },
  {
    id: "sequences",
    title: "Chuỗi tư thế cơ bản",
    description: "Các clip ngắn được sắp xếp thành một nhóm riêng để biên tập thành chuỗi học rõ ràng.",
    lessons: [
      youtubeLesson("32", "6DwXHdN_ccg", "Chuỗi tư thế cơ bản · bài 32", "0:22"),
      youtubeLesson("33", "f7UfRc4TKdM", "Chuỗi tư thế cơ bản · bài 33", "0:21"),
      youtubeLesson("34", "ZV-eHhsNlgo", "Chuỗi tư thế cơ bản · bài 34", "0:21"),
      youtubeLesson("35", "npBdMvsuIto", "Chuỗi tư thế cơ bản · bài 35", "0:19"),
      youtubeLesson("36", "jgQLZsoIDKc", "Chuỗi tư thế cơ bản · bài 36", "0:21"),
      youtubeLesson("37", "rSOEcU1xGYA", "Chuỗi tư thế cơ bản · bài 37", "0:21"),
      youtubeLesson("38", "AfMciZa5npw", "Chuỗi tư thế cơ bản · bài 38", "0:18"),
    ],
  },
];

type Session = {
  id: SessionId;
  title: string;
  minutes: number;
  level: string;
  image: string;
  description: string;
  detail: string;
  imageAlt: string;
};
const SESSIONS: Session[] = [
  { id: "reset-8", title: "Thư giãn cổ & vai", minutes: 8, level: "Nhẹ nhàng · Có hướng dẫn", image: "/assets/today-neck-stretch.png", imageAlt: "Hình minh họa thả lỏng cổ và vai", description: "Một buổi nhẹ để bắt đầu theo nhịp riêng của bạn.", detail: "Không cần dụng cụ" },
  { id: "slow-9", title: "Chậm lại để theo rõ", minutes: 9, level: "Nhịp chậm · Nhiều hướng dẫn", image: "/assets/practice-shoulder-stretch.png", imageAlt: "Hình minh họa thực hành nhẹ nhàng", description: "Một lựa chọn nhịp chậm hơn khi bạn muốn có thêm thời gian theo hướng dẫn.", detail: "Không cần dụng cụ" },
  { id: "short-5", title: "Một khoảng nghỉ ngắn", minutes: 5, level: "Ngắn · Nhẹ", image: "/assets/motion-chest-open.png", imageAlt: "Hình minh họa buổi tập ngắn", description: "Bắt đầu và khép lại trọn vẹn trong một khoảng thời gian ngắn.", detail: "Không cần dụng cụ" },
  { id: "steady-12", title: "Trở về nhịp đều", minutes: 12, level: "Êm · Có hướng dẫn", image: "/assets/today-neck-stretch.png", imageAlt: "Hình minh họa buổi yoga theo nhịp đều", description: "Dành thêm một chút thời gian để theo trọn một buổi có cấu trúc.", detail: "Không cần dụng cụ" },
];

type Snapshot = {
  id: string; day: number; date: string; time: string; kind: "Trước tập" | "Sau tập" | "Ghi riêng";
  status: BodyStatus; observations: Observation[]; sessionId?: SessionId; remoteId?: string;
  outcome?: Outcome; pace?: Pace; note?: string; endedEarly?: boolean; feedbackSkipped?: boolean;
};

type DemoState = {
  locale: AppLocale;
  checkinStep: CheckinStep;
  day: number;
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
  chosenPlanId: SessionId | null;
  selectedCourseId: FreeCourseId | null;
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
  syncStatus: "saved" | "failed";
  lastReflection: Snapshot | null;
};

const initialState: DemoState = {
  locale: "vi-VN", checkinStep: 1,
  day: 1, minutes: 10, energy: null, regions: [], bodyStyle: "feminine", bodyStatus: null, preObservations: [], postObservations: [], postBodyStatus: null, intent: "Bắt nhịp",
  dialogueChoice: null, dialogueText: "", unrecognizedText: "",
  chosenPlanId: null, outcome: null, pace: null, note: "",
  selectedCourseId: null,
  endedEarly: false, rememberPace: true, usePreviousFeedback: false, history: [],
  signedIn: false, userId: null, backendStatus: backendConfigured ? "loading" : "ready", backendError: "", remoteCheckins: [], currentRemoteCheckinId: null, pendingCheckinIdempotencyKey: null,
  accountEmail: "", authReturnTo: "home", authMode: "create", authCode: "", displayName: "",
  onboardingComplete: false, termsAccepted: false, privacyAccepted: false, consentBaseline: emptyConsentState, consentPolicyVersions: {}, aiConsent: false, saveFeedbackConsent: false, teacherShareConsent: false,
  marketingConsent: false, shareActive: false, notificationEnabled: false, emailUpdates: false, syncStatus: "saved", lastReflection: null,
};

const DemoContext = createContext<{ state: DemoState; setState: Dispatch<SetStateAction<DemoState>> } | null>(null);
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
function suggestedSession(state: DemoState): SessionId {
  if (state.minutes <= 5) return "short-5";
  const previous = latestFeedback(state);
  if ((previous?.pace === "Hơi nhanh" || state.dialogueChoice === "Nhịp chậm") && state.minutes >= 9) return "slow-9";
  if (state.minutes >= 15 && (state.energy === "Khá ổn" || state.energy === "Tràn đầy") && state.dialogueChoice !== "Không nằm sàn") return "steady-12";
  return "reset-8";
}
function activeSession(state: DemoState) {
  return SESSIONS.find(session => session.id === (state.chosenPlanId ?? suggestedSession(state))) ?? SESSIONS[0];
}
function planReason(state: DemoState) {
  if (state.chosenPlanId) return "Bạn đã tự chọn buổi này.";
  const previous = latestFeedback(state);
  if (state.minutes <= 5) return "Bạn có khoảng 5 phút; đây là một buổi ngắn hoàn chỉnh.";
  if (previous?.pace === "Hơi nhanh" && state.minutes >= 9) return "Bạn từng phản hồi nhịp hơi nhanh. Lần này ưu tiên buổi chậm hơn, trong thời gian bạn có.";
  if (state.dialogueChoice === "Nhịp chậm") return "Bạn muốn nhịp chậm hơn và có đủ thời gian cho buổi này.";
  if (state.minutes >= 15 && (state.energy === "Khá ổn" || state.energy === "Tràn đầy")) return "Bạn có thêm thời gian và muốn một buổi có nhịp đều.";
  return (state.regions.length ? "Bạn đã đánh dấu " + state.regions.map(region => regionLabel("vi-VN", region).toLowerCase()).join(", ") + ". " : "") + "Bạn muốn " + state.intent.toLowerCase() + ", có " + state.minutes + " phút" + (state.energy ? " và năng lượng " + state.energy.toLowerCase() : "") + ". Đây là lựa chọn nội dung, không phải đánh giá sức khỏe.";
}
function unsupportedPlanRequest(state: DemoState) {
  if (state.dialogueChoice === "Không nằm sàn") return "Hiện chưa có buổi nào được xác nhận đáp ứng yêu cầu “không nằm sàn”.";
  if (state.regions.some(region => region !== "neck" && region !== "shoulder")) return `Hiện chưa có buổi được xác nhận phù hợp với ${state.regions.filter(region => region !== "neck" && region !== "shoulder").map(region => regionLabel(currentAppLocale(), region).toLowerCase()).join(", ")}.`;
  if (state.dialogueChoice === "Nhịp chậm" && state.minutes < 9) return "Trong khoảng 5 phút, chưa có buổi nào được xác nhận có nhịp chậm hơn.";
  return null;
}

function BrandMark({ animated = false }: { animated?: boolean }) {
  return <svg viewBox="0 0 100 100" aria-hidden="true" focusable="false" className={animated ? "mcy-open-space-mark mcy-open-space-mark-animated" : "mcy-open-space-mark"}>
    <path className="mcy-mark-arc" d="M67 19C53 12 36 15 25 26C13 38 12 56 21 70C29 82 44 87 58 82" fill="none" stroke="currentColor" strokeWidth="5.2" strokeLinecap="round" strokeLinejoin="round" pathLength="100" />
    <circle className="mcy-mark-point" cx="74" cy="34" r="3.5" fill="currentColor" />
  </svg>;
}
function Brand({ locale, compact = false }: { locale: AppLocale; compact?: boolean }) {
  return <span className={compact ? "mcy-brand compact" : "mcy-brand mcy-brand-animated"}><BrandMark animated={!compact} /><span className="mcy-brand-wordmark">{msg(locale, "brand.name")}</span></span>;
}
const BODY_LEVELS: BodyLevel[] = ["Không khó chịu", "Nhẹ", "Vừa", "Nhiều"];
const BODY_STYLES: { id: BodyStyle; label: string; image: string }[] = [
  { id: "feminine", label: "Hình thể nữ", image: "/assets/body-map-feminine-full.png" },
  { id: "masculine", label: "Hình thể nam", image: "/assets/body-map-masculine-full.png" },
  { id: "neutral", label: "Trung tính", image: "/assets/body-map-neutral-full.png" },
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
const demoEpoch = new Date();
demoEpoch.setHours(0, 0, 0, 0);
function dateForDay(day: number) {
  const date = new Date(demoEpoch);
  date.setDate(date.getDate() + day - 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
function currentAppLocale(): AppLocale { return typeof document !== "undefined" && document.documentElement.lang === "en" ? "en-US" : "vi-VN"; }
function prettyDate(iso: string, locale = currentAppLocale()) { const [year, month, day] = iso.split("-").map(Number); return new Intl.DateTimeFormat(locale, { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(year, month - 1, day)); }
function localizedSnapshotKind(locale: AppLocale, kind: Snapshot["kind"]) {
  return msg(locale, kind === "Trước tập" ? "journey.kind.before" : kind === "Sau tập" ? "journey.kind.after" : "journey.kind.private");
}
function snapshotLabel(snapshot: Snapshot, locale = currentAppLocale()) { return `${prettyDate(snapshot.date, locale)} · ${snapshot.time} · ${localizedSnapshotKind(locale, snapshot.kind)}`; }
function observationLabel(observation: Observation, locale = currentAppLocale()) {
  return `${regionLabel(locale, observation.region)}${observation.side === "unspecified" ? "" : ` · ${sideLabel(locale, observation.side).toLowerCase()}`} · ${observation.status === "uncertain" ? bodyLevelLabel(locale, "Chưa rõ") : observation.level ?? msg(locale, "checkin.notRecorded")}`;
}
function journeyBodyStatus(locale: AppLocale, status: BodyStatus) {
  return msg(locale, status === "none_now" ? "journey.noneNow" : status === "uncertain" ? "journey.unsure" : status === "skipped" ? "journey.skipped" : "journey.noLevel");
}
function makeSnapshot(day: number, kind: Snapshot["kind"], status: BodyStatus, observations: Observation[], extra: Partial<Snapshot> = {}): Snapshot {
  return { id: crypto.randomUUID(), day, date: dateForDay(day), time: new Date().toLocaleTimeString(currentAppLocale(), { hour: "2-digit", minute: "2-digit" }), kind, status, observations: observations.map(item => ({ ...item })), ...extra };
}
function localDateOrdinal(isoDate: string) { return Math.floor(Date.parse(`${isoDate}T00:00:00Z`) / 86_400_000); }
function dateFromOrdinal(ordinal: number) { return new Date(ordinal * 86_400_000).toISOString().slice(0, 10); }
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
  const client = supabase;
  if (!client || !state.userId) return { consents: state.consentBaseline, policyVersions: state.consentPolicyVersions };
  const next = consentStateForDemo(state);
  const events = (Object.keys(next) as ConsentPurpose[]).filter(purpose => {
    const requiredPolicyVersion = purpose === "terms"
      ? REQUIRED_CONSENT_POLICY_VERSIONS.terms
      : purpose === "privacy" ? REQUIRED_CONSENT_POLICY_VERSIONS.privacy : null;
    const needsReacceptance = requiredPolicyVersion !== null
      && state.consentPolicyVersions[purpose] !== requiredPolicyVersion
      && next[purpose];
    return next[purpose] !== state.consentBaseline[purpose] || needsReacceptance;
  });
  await Promise.all(events.map(purpose => saveConsentEvent(
    client,
    purpose,
    next[purpose],
    purpose === "terms" ? REQUIRED_CONSENT_POLICY_VERSIONS.terms : REQUIRED_CONSENT_POLICY_VERSIONS.privacy,
    source,
    crypto.randomUUID(),
    clientChannel(),
  )));
  const policyVersions = { ...state.consentPolicyVersions };
  for (const purpose of events) {
    policyVersions[purpose] = purpose === "terms"
      ? REQUIRED_CONSENT_POLICY_VERSIONS.terms
      : REQUIRED_CONSENT_POLICY_VERSIONS.privacy;
  }
  return { consents: next, policyVersions };
}
async function persistProfile(state: DemoState, displayName: string, bodyStyle: BodyStyle, locale: AppLocale = state.locale) {
  if (!supabase || !state.userId) return;
  const { error } = await supabase.from("profiles").upsert({
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
    localDate: dateForDay(state.day),
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
  if (!supabase || !state.userId || !state.saveFeedbackConsent) return null;
  const idempotencyKey = state.pendingCheckinIdempotencyKey ?? crypto.randomUUID();
  setState(previous => ({ ...previous, pendingCheckinIdempotencyKey: idempotencyKey, backendStatus: "loading", backendError: "" }));
  const payload = toLearnerCheckinPayload(state, captureType, idempotencyKey);
  const saved = await saveLearnerCheckin(supabase, payload);
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
  setState(previous => ({
    ...previous,
    remoteCheckins: [...previous.remoteCheckins.filter(item => item.remoteId !== saved.checkin_id), snapshot],
    currentRemoteCheckinId: saved.checkin_id,
    pendingCheckinIdempotencyKey: null,
    backendStatus: "ready",
    backendError: "",
  }));
  return snapshot;
}
async function handleNativeAuthUrl(url: string) {
  if (!supabase) return;
  const callback = new URL(url);
  const params = new URLSearchParams(callback.hash.replace(/^#/, ""));
  const code = callback.searchParams.get("code");
  const tokenHash = callback.searchParams.get("token_hash") ?? params.get("token_hash");
  const type = callback.searchParams.get("type") ?? params.get("type");
  const accessToken = params.get("access_token");
  const refreshToken = params.get("refresh_token");
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) throw error;
    return;
  }
  if (accessToken && refreshToken) {
    const { error } = await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
    if (error) throw error;
    return;
  }
  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: type as EmailOtpType });
    if (error) throw error;
  }
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
      {imageFailed ? <p className="mcy-body-fallback">{locale === "en-US" ? "The illustration did not load. You can still choose an area from the list." : "Hình minh họa chưa tải. Bạn vẫn có thể chọn vùng trong danh sách."}</p> : <img src={image} alt={locale === "en-US" ? "Full body illustration, viewed from behind" : "Minh họa toàn thân nhìn từ phía sau"} onError={() => setImageFailed(true)} />}
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
      <div className="mcy-style-options">{BODY_STYLES.map(style => <button key={style.id} className={value === style.id ? "selected" : ""} onClick={() => { onChange(style.id); setOpen(false); }} aria-pressed={value === style.id}><img src={style.image} alt="" /><strong>{styleLabel(style.id)}</strong>{value === style.id && <CheckIcon />}</button>)}</div>
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
    ? ({ "Check-in hôm nay": "Today's check-in", "Cùng chọn buổi tập": "Choose a practice", "Kế hoạch hôm nay": "Today's plan", "Thực hành hôm nay": "Today's practice", "Phản hồi của bạn": "Your reflection" } as Record<string, string>)[title ?? ""] ?? title
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
function Choice({ selected, onClick, children }: { selected: boolean; onClick?: () => void; children: React.ReactNode }) {
  return <button className={selected ? "mcy-choice selected" : "mcy-choice"} aria-pressed={selected} onClick={() => onClick?.()}>{children}</button>;
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

const ROUTES: Record<string, FlowScreen> = {
  welcome: { id: "welcome", footer: () => <WelcomeFooter />, footerHeight: 156, render: () => <WelcomeScreen /> },
  home: { id: "home", header: () => <Header />, headerHeight: 55, footer: () => <BottomNav />, footerHeight: 68, render: () => <HomeScreen /> },
  checkin: { id: "checkin", header: () => <Header title="Check-in hôm nay" back />, headerHeight: 55, footer: () => <CheckinFooter />, footerHeight: 176, render: () => <CheckinScreen /> },
  dialogue: { id: "dialogue", header: () => <Header title="Cùng chọn buổi tập" back />, headerHeight: 55, footer: () => <DialogueFooter />, footerHeight: 104, render: () => <DialogueScreen /> },
  plan: { id: "plan", header: () => <Header title="Kế hoạch hôm nay" back />, headerHeight: 55, footer: () => <PlanFooter />, footerHeight: 94, render: () => <PlanScreen /> },
  practice: { id: "practice", header: () => <Header title="Thực hành hôm nay" back />, headerHeight: 55, footer: () => <PracticeFooter />, footerHeight: 104, render: () => <PracticeScreen /> },
  reflection: { id: "reflection", header: () => <Header title="Phản hồi của bạn" back />, headerHeight: 55, footer: () => <ReflectionFooter />, footerHeight: 104, render: () => <ReflectionScreen /> },
  journey: { id: "journey", header: () => <Header />, headerHeight: 55, footer: () => <BottomNav />, footerHeight: 68, render: () => <JourneyScreen /> },
  discover: { id: "discover", header: () => <Header />, headerHeight: 55, footer: () => <BottomNav />, footerHeight: 68, render: () => <DiscoverScreen /> },
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
  sync: { id: "sync", header: () => <Header title="Lưu phản hồi" back />, headerHeight: 55, render: () => <SyncScreen /> },
  discoverDetail: { id: "discover-detail", header: () => <Header title="Chi tiết nội dung" back />, headerHeight: 55, render: () => <DiscoverDetailScreen /> },
  courseDetail: { id: "course-detail", header: () => <Header title="Khóa học miễn phí" back />, headerHeight: 55, render: () => <CourseDetailScreen /> },
  readiness: { id: "readiness", header: () => <Header title="Phạm vi hỗ trợ" back />, headerHeight: 55, render: () => <ReadinessScreen /> },
};

function finishAtAuthDestination(flow: ReturnType<typeof useFlow>, destination: string) {
  const target = ROUTES[destination] ?? ROUTES.home;
  let targetIndex = -1;
  flow.stack.forEach((entry, index) => { if (entry.id === target.id) targetIndex = index; });
  const stepsToPop = targetIndex >= 0 ? flow.stack.length - targetIndex - 1 : flow.stack.length - 1;
  for (let index = 0; index < stepsToPop; index += 1) flow.pop();
  if (targetIndex < 0) flow.replace(target);
}

export default function Prototype() {
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
    if (!supabase) {
      setState(previous => ({ ...previous, backendStatus: "ready" }));
      return;
    }
    let active = true;
    let appUrlListener: { remove: () => Promise<void> } | null = null;
    const handledAuthUrls = new Set<string>();
    const receiveNativeAuthUrl = async (url: string) => {
      if (handledAuthUrls.has(url)) return;
      handledAuthUrls.add(url);
      try {
        await handleNativeAuthUrl(url);
      } catch (error) {
        if (active) setState(previous => ({ ...previous, backendStatus: "error", backendError: error instanceof Error ? error.message : "Liên kết xác minh không còn hiệu lực." }));
      }
    };
    const hydrate = async (session: import("@supabase/supabase-js").Session | null) => {
      if (!active) return;
      if (!session) {
        setState(previous => ({
          ...previous,
          signedIn: false,
          userId: null,
          remoteCheckins: [],
          currentRemoteCheckinId: null,
          termsAccepted: false,
          privacyAccepted: false,
          aiConsent: false,
          saveFeedbackConsent: false,
          teacherShareConsent: false,
          marketingConsent: false,
          notificationEnabled: false,
          consentBaseline: emptyConsentState,
          consentPolicyVersions: {},
          backendStatus: "ready",
          backendError: "",
        }));
        return;
      }
      setState(previous => ({ ...previous, backendStatus: "loading", backendError: "" }));
      try {
        const data = await loadLearnerSnapshot(supabase!);
        if (!active) return;
        const remoteCheckins = data.checkins.map(row => snapshotFromDatabase(row, data.observations));
        const bodyStyle = data.profile?.body_display_preference;
        setState(previous => ({
          ...previous,
          signedIn: true,
          userId: session.user.id,
          accountEmail: session.user.email ?? previous.accountEmail,
          displayName: data.profile?.display_name ?? previous.displayName,
          locale: data.profile?.locale === "en-US" ? "en-US" : "vi-VN",
          bodyStyle: bodyStyle === "neutral" || bodyStyle === "masculine" || bodyStyle === "feminine" ? bodyStyle : "feminine",
          termsAccepted: data.consents.terms && data.consentPolicyVersions.terms === REQUIRED_CONSENT_POLICY_VERSIONS.terms,
          privacyAccepted: data.consents.privacy && data.consentPolicyVersions.privacy === REQUIRED_CONSENT_POLICY_VERSIONS.privacy,
          aiConsent: data.consents.ai_processing,
          saveFeedbackConsent: data.consents.wellbeing_data,
          teacherShareConsent: data.consents.teacher_sharing,
          marketingConsent: data.consents.marketing,
          notificationEnabled: data.consents.notifications,
          consentBaseline: data.consents,
          consentPolicyVersions: data.consentPolicyVersions,
          onboardingComplete: Boolean(data.profile),
          remoteCheckins,
          currentRemoteCheckinId: previous.currentRemoteCheckinId ?? remoteCheckins.at(-1)?.remoteId ?? null,
          backendStatus: "ready",
          backendError: "",
        }));
      } catch (error) {
        if (!active) return;
        setState(previous => ({
          ...previous,
          signedIn: true,
          userId: session.user.id,
          accountEmail: session.user.email ?? previous.accountEmail,
          backendStatus: "error",
          backendError: error instanceof Error ? error.message : "Chưa đọc được dữ liệu tài khoản.",
        }));
      }
    };
    void supabase.auth.getSession().then(({ data, error }) => {
      if (error) setState(previous => ({ ...previous, backendStatus: "error", backendError: error.message }));
      else void hydrate(data.session);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      window.setTimeout(() => { void hydrate(session); }, 0);
    });
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
    return () => {
      active = false;
      subscription.unsubscribe();
      void appUrlListener?.remove();
    };
  }, [reviewConsentScreen]);
  return <DemoContext.Provider value={{ state, setState }}><FlowStack initial={reviewConsentScreen ? ROUTES.consent : ROUTES.welcome}><AuthSessionRouter /></FlowStack></DemoContext.Provider>;
}

function AuthSessionRouter() {
  const { state } = useDemo();
  const flow = useFlow();
  useEffect(() => {
    if (!state.signedIn || state.backendStatus !== "ready") return;
    if (![ROUTES.welcome.id, ROUTES.authEmail.id, ROUTES.authCode.id].includes(flow.current.id)) return;
    if (!hasCurrentRequiredConsent(consentStateForDemo(state), state.consentPolicyVersions)) flow.replace(ROUTES.consent);
    else if (!state.onboardingComplete) flow.replace(ROUTES.onboarding);
    else finishAtAuthDestination(flow, state.authReturnTo);
  }, [flow, state.authReturnTo, state.backendStatus, state.consentPolicyVersions, state.onboardingComplete, state.privacyAccepted, state.signedIn, state.termsAccepted]);
  return null;
}

function WelcomeScreen() {
  const { state } = useDemo();
  const locale = state.locale;
  return <MobileScroll className="mcy-scroll welcome"><main className="mcy-welcome">
    <img className="mcy-welcome-photo" src="/assets/welcome-portrait.png" alt={locale === "en-US" ? "A woman resting on a yoga mat" : "Người ngồi thư giãn trên thảm yoga"} />
    <div className="mcy-welcome-top"><Brand locale={locale} /><LocaleToggle /><p>{msg(locale, "brand.slogan")}</p>{locale === "en-US" && <small className="mcy-slogan-note">{msg(locale, "brand.sloganNote")}</small>}</div>
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
    if (!supabase) { setError("Backend chưa được cấu hình cho môi trường này."); return; }
    setSending(true);
    setError("");
    try {
      const { error: authError } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: { shouldCreateUser: state.authMode === "create", emailRedirectTo: authRedirectUrl() },
      });
      if (authError) { setError(authErrorMessage(authError, "Chưa gửi được email xác minh. Hãy thử lại sau.")); return; }
      update({ accountEmail: email.trim(), authCode: "" });
      flow.replace(ROUTES.authCode);
    } catch (cause) {
      setError(authErrorMessage(cause, "Chưa gửi được email xác minh. Hãy thử lại sau."));
    } finally {
      setSending(false);
    }
  };
  return <MobileScroll className="mcy-scroll"><main className="mcy-page mcy-auth-page">
    <Eyebrow>{state.authMode === "create" ? "TẠO TÀI KHOẢN" : "ĐĂNG NHẬP"}</Eyebrow>
    <h1>Dùng email bạn có thể mở ngay.</h1>
    <p className="mcy-lead">Gửi email xác minh tới địa chỉ này. Nếu email có mã 6 chữ số, bạn có thể nhập ở bước tiếp theo; nếu có liên kết đăng nhập, hãy mở trên {Capacitor.isNativePlatform() ? "điện thoại này" : "trình duyệt này"}.</p>
    <label className="mcy-form-field">Email<KeyboardInput inputMode="email" autoComplete="email" aria-label="Địa chỉ email" placeholder="ban@example.com" value={email} onChange={event => { setEmail(event.target.value); setError(""); }} onBlur={() => keyboard.hide()} /></label>
    {state.authMode === "create" && <div className="mcy-inline-note" role="note"><InfoCircledIcon />Giáo viên cũng đăng ký bằng email xác minh. Quyền giáo viên chỉ được cấp qua lời mời đã kiểm tra; pilot hiện chưa mở đăng ký công khai.</div>}
    {error && <div className="mcy-form-error" role="alert">{error}</div>}
    <div className="mcy-inline-note"><InfoCircledIcon />Chỉ dùng để đăng nhập và gửi biên nhận yêu cầu. Không cần nhập số điện thoại, ngày sinh hay tên thật.</div>
    {!backendConfigured && <div className="mcy-alert">Backend chưa kết nối ở môi trường hiện tại. Bạn vẫn có thể xem và thử luồng khách.</div>}
    <Action disabled={sending || !backendConfigured} onClick={submit}>{sending ? "Đang gửi…" : "Gửi email xác minh"}</Action>
    {state.authReturnTo === "dialogue" && <button className="mcy-quiet-link" onClick={() => { keyboard.hide(); flow.replace(ROUTES.plan); }}>Tiếp tục với lựa chọn hiện tại</button>}
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
    if (code.length !== 6) { setError("Nhập đủ 6 chữ số để tiếp tục."); return; }
    if (!supabase) { setError("Backend chưa được cấu hình cho môi trường này."); return; }
    setVerifying(true);
    try {
      const { data, error: authError } = await supabase.auth.verifyOtp({ email: state.accountEmail, token: code, type: "email" });
      if (authError || !data.user) { setError("Mã không hợp lệ hoặc đã hết hạn. Hãy kiểm tra hộp thư và thử lại."); return; }
      update({ authCode: "", signedIn: true, userId: data.user.id, accountEmail: data.user.email ?? state.accountEmail, backendStatus: "loading", backendError: "" });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Chưa xác minh được mã. Hãy thử lại.");
    } finally {
      setVerifying(false);
    }
  };
  const resend = async () => {
    if (!supabase) return;
    setResending(true);
    try {
      const { error: authError } = await supabase.auth.signInWithOtp({ email: state.accountEmail, options: { shouldCreateUser: state.authMode === "create", emailRedirectTo: authRedirectUrl() } });
      if (authError) {
        setError(authErrorMessage(authError, "Chưa gửi lại được email xác minh."));
        setNotice("");
      } else {
        setError("");
        setNotice("Email xác minh mới đã được gửi. Mã hoặc liên kết cũ có thể hết hiệu lực.");
      }
    } catch (cause) {
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
    if (key === "teacherShareConsent") update({ teacherShareConsent: !state.teacherShareConsent });
    if (key === "marketingConsent") update({ marketingConsent: !state.marketingConsent });
  };
  return <MobileScroll className="mcy-scroll"><main lang="vi" className="mcy-page mcy-auth-page">
    <Eyebrow>A05 · QUYỀN VÀ ĐIỀU KHOẢN</Eyebrow><h1>Bạn chọn dữ liệu nào được dùng.</h1>
    <p className="mcy-lead">Mỗi mục đích là một lựa chọn riêng. Phiên bản hiện hành được hiển thị trước khi bạn đồng ý; nội dung pháp lý cuối cùng sẽ được cập nhật trước khi mở rộng phát hành.</p>
    {state.locale === "en-US" && <div className="mcy-locale-note" role="note">This consent screen is shown in Vietnamese. Consent evidence records the language displayed as vi-VN.</div>}
    <section className="mcy-consent-card required"><span className="mcy-tag">CẦN ĐỂ TIẾP TỤC TRONG APP</span><strong>Điều khoản dịch vụ và thông báo quyền riêng tư · phiên bản 0.1</strong><p>Supabase đã xác minh email. Đồng ý để tiếp tục sử dụng tài khoản; lựa chọn và phiên bản được ghi thành sự kiện.</p><button aria-pressed={state.termsAccepted && state.privacyAccepted} onClick={() => { const value = !(state.termsAccepted && state.privacyAccepted); update({ termsAccepted: value, privacyAccepted: value }); }}><i>{state.termsAccepted && state.privacyAccepted ? "✓" : ""}</i>{state.termsAccepted && state.privacyAccepted ? "Đã đồng ý phiên bản 0.1" : "Tôi đồng ý điều khoản và thông báo · phiên bản 0.1"}</button></section>
    {([
      ["aiConsent", "Cho phép xử lý check-in bằng AI", "P1 hiện chưa gửi dữ liệu tới AI; lựa chọn được ghi để quản lý đồng ý, không tạo chẩn đoán.", state.aiConsent],
      ["saveFeedbackConsent", "Lưu check-in cơ thể và năng lượng", "Cho phép lưu các lần check-in và ghi chú để xem trong Hành trình. Phản hồi sau buổi hiện chỉ được giữ trong phiên.", state.saveFeedbackConsent],
      ["teacherShareConsent", "Chia sẻ với một giáo viên cụ thể", "Mặc định tắt. Chỉ bật khi bạn chọn đúng lớp, phạm vi và thời gian.", state.teacherShareConsent],
      ["marketingConsent", "Nhận tin về nội dung mới", "Tùy chọn; tách khỏi thông báo dịch vụ và nhắc tập.", state.marketingConsent],
    ] as const).map(([key, title, description, value]) => <section className="mcy-consent-card" key={key}><strong>{title}</strong><p>{description}</p><button aria-pressed={value} onClick={() => togglePurpose(key)}><i>{value ? "✓" : ""}</i>{value ? "Cho phép" : "Không cho phép"}</button></section>)}
    <div className="mcy-form-error subtle">Từ chối AI vẫn dùng được các lựa chọn buổi. Từ chối lưu thì check-in chỉ còn trong phiên và không được ghi vào tài khoản.</div>
    {state.onboardingComplete && state.authReturnTo === "dialogue" && <div className="mcy-consent-card"><strong>Nháp check-in trong phiên này</strong><p>{state.saveFeedbackConsent ? "Xác nhận tiếp tục sẽ gắn nháp với tài khoản của bạn." : "Bạn chưa cho phép lưu check-in; nháp chỉ dùng trong phiên này."} Nếu không muốn dùng nháp nữa, chọn Bỏ nháp.</p></div>}
    <DemoNote>Mỗi thay đổi được ghi thành sự kiện đồng ý riêng của tài khoản. Ngôn ngữ và phiên bản hiển thị được lưu cùng lựa chọn.</DemoNote>
  </main></MobileScroll>;
}

function ConsentFooter() {
  const flow = useFlow();
  const { state, setState } = useDemo();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const hasTransferDraft = state.onboardingComplete && state.authReturnTo === "dialogue";
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
        if (!discardDraft && state.authReturnTo === "dialogue" && state.saveFeedbackConsent) {
          await persistCurrentCheckin({ ...state, consentBaseline: saved.consents, consentPolicyVersions: saved.policyVersions, privacyAccepted: true }, setState, "practice_preparation");
        }
        const destination = discardDraft ? "home" : state.authReturnTo === "dialogue" ? state.aiConsent ? "readiness" : "plan" : state.authReturnTo;
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
      if (!discardDraft && nextState.authReturnTo === "dialogue" && nextState.saveFeedbackConsent) {
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
      const destination = discardDraft ? "home" : state.authReturnTo === "dialogue" ? state.aiConsent ? "readiness" : "plan" : state.authReturnTo;
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
    {!showTransfer && <button className="mcy-quiet-link" disabled={saving} onClick={() => { if (state.authReturnTo === "dialogue") setShowTransfer(true); else void complete(); }}>{saving ? "Đang lưu…" : "Để sau"}</button>}
    <DemoNote>Hồ sơ và lựa chọn được đồng bộ với tài khoản. Check-in chỉ ghi server nếu bạn đã cho phép lưu.</DemoNote>
  </main></MobileScroll>;
}

function ReadinessScreen() {
  const flow = useFlow();
  const [result, setResult] = useState<"within_scope" | "unknown" | "needs_review" | "stop_guidance" | null>(null);
  const choose = (value: NonNullable<typeof result>) => setResult(value);
  const advance = () => {
    if (result === "within_scope") flow.replace(ROUTES.dialogue);
    else if (result === "unknown") flow.replace(ROUTES.plan);
    else if (result === "needs_review") flow.replace(ROUTES.help);
    else if (result === "stop_guidance") flow.replace(ROUTES.home);
  };
  return <MobileScroll className="mcy-scroll"><main className="mcy-page mcy-readiness-page"><Eyebrow>A06 · TRƯỚC KHI THỰC HÀNH</Eyebrow><h1>Hôm nay bạn có muốn tiếp tục thật nhẹ nhàng không?</h1><p className="mcy-lead">Chọn theo cảm nhận của bạn. Đây không phải chẩn đoán hay đánh giá an toàn y tế.</p><div className="mcy-account-panel"><strong>Nếu bạn chưa chắc, bạn có thể dừng lại.</strong><p>MCY chỉ sắp xếp nội dung trong phạm vi bạn chọn và không đoán thay bạn.</p></div><div className="mcy-readiness-options"><button aria-pressed={result === "within_scope"} onClick={() => choose("within_scope")}><strong>Tôi muốn tiếp tục nhẹ nhàng</strong><small>Đi tới phần chọn buổi.</small></button><button aria-pressed={result === "unknown"} onClick={() => choose("unknown")}><strong>Tôi chưa chắc</strong><small>Xem các lựa chọn mà không dùng phản hồi để cá nhân hóa.</small></button><button aria-pressed={result === "needs_review"} onClick={() => choose("needs_review")}><strong>Tôi cần người xem cùng</strong><small>Mở hướng dẫn và hỗ trợ.</small></button><button aria-pressed={result === "stop_guidance"} onClick={() => choose("stop_guidance")}><strong>Tôi muốn dừng hôm nay</strong><small>Không chọn bài lúc này.</small></button></div>{result === "stop_guidance" && <div className="mcy-alert">Mình sẽ không đề xuất bài lúc này. Nếu bạn cần hỗ trợ khẩn cấp, hãy liên hệ dịch vụ phù hợp tại nơi bạn đang ở.</div>}{result === "needs_review" && <div className="mcy-alert">Hiện chưa có phiên tư vấn trực tiếp trong ứng dụng. Bạn có thể xem hướng dẫn chung.</div>}<Action disabled={!result} onClick={advance}>{result === "within_scope" ? "Tiếp tục chọn buổi" : result === "unknown" ? "Xem các lựa chọn" : result === "needs_review" ? "Mở hỗ trợ" : "Kết thúc ở đây"}</Action><button className="mcy-quiet-link" onClick={() => flow.replace(ROUTES.plan)}>Bỏ qua câu hỏi · xem kế hoạch</button><DemoNote>Chỉ những điều bạn chủ động ghi nhận mới xuất hiện trong kế hoạch hoặc Hành trình.</DemoNote></main></MobileScroll>;
}

function HomeScreen() {
  const flow = useFlow();
  const { state } = useDemo();
  const previous = [...state.history].reverse().find(item => item.kind === "Sau tập");
  return <MobileScroll className="mcy-scroll"><main className="mcy-page">
    <Eyebrow>{previous ? "MỘT LẦN QUAY LẠI, KHÔNG CẦN VỘI" : "MỖI BUỔI BẮT ĐẦU TỪ HÔM NAY"}</Eyebrow>
    <h1>{previous ? "Hôm nay bạn muốn bắt đầu thế nào?" : "Một chút thời gian cho chính mình."}</h1>
    <p className="mcy-lead">Chia sẻ một chút về hôm nay. MCY sẽ giúp bạn chọn một buổi trong nội dung của giáo viên.</p>
    {previous && state.saveFeedbackConsent && state.rememberPace && previous.pace === "Hơi nhanh" && previous.outcome !== "Khó chịu hơn" && !previous.endedEarly ? <div className="mcy-memory-hint"><MagicWandIcon /><span>Lần trước bạn nói nhịp hơi nhanh. Lần này bạn có thể chọn chậm hơn.</span></div> : null}
    <div className="mcy-home-photo"><img src="/assets/today-neck-stretch.png" alt="Hình minh họa buổi tập yoga tại nhà" /><span>Buổi tập hôm nay, theo nhịp của bạn</span></div>
    <div className="mcy-home-cta"><Action onClick={() => flow.push(ROUTES.checkin)}>{previous ? "Chọn buổi tiếp theo" : "Chọn buổi hôm nay"}</Action><span>Chỉ vài bước để đến một kế hoạch rõ ràng</span></div>
    <div className="mcy-section-label">BẠN SẼ ĐI QUA</div>
    <div className="mcy-steps-list"><div><b>01</b><span>Check-in ngắn<small>Thời gian, năng lượng và ý muốn của bạn.</small></span></div><div><b>02</b><span>Trao đổi và chọn<small>Một buổi có lý do, có quyền điều chỉnh.</small></span></div><div><b>03</b><span>Phản hồi trung thực<small>Lần sau lựa chọn sẽ xét điều bạn đã chia sẻ.</small></span></div></div>
    <DemoNote>Khi đăng nhập, hồ sơ, lựa chọn quyền và check-in đã đồng ý lưu sẽ được kết nối với tài khoản của bạn.</DemoNote>
  </main></MobileScroll>;
}

function CheckinScreen() {
  const flow = useFlow();
  const { state, update, setState } = useDemo();
  const locale = state.locale;
  const [regionGroup, setRegionGroup] = useState<BodyRegionGroup>("trunk");
  useLayoutEffect(() => {
    const scroll = document.querySelector<HTMLElement>("[data-testid='flow-current'] .mobile-scroll");
    if (scroll) scroll.scrollTop = 0;
  }, [state.checkinStep]);
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
        history: !remote && previous.saveFeedbackConsent ? [...previous.history, makeSnapshot(previous.day, "Ghi riêng", previous.bodyStatus, previous.preObservations)] : previous.history,
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
      <section className="mcy-energy-card"><h2>{msg(locale, "checkin.energy")} <small>{msg(locale, "checkin.optional")}</small></h2><div className="mcy-energy-options">{(["Rất thấp", "Thấp", "Bình thường", "Khá ổn", "Tràn đầy"] as Energy[]).map((value, index) => <button key={value} aria-pressed={state.energy === value} onClick={() => update({ energy: value })}><EnergyFace level={index} /><span>{energyLabel(locale, value)}</span></button>)}</div></section>
      <section className="mcy-field-section compact"><h2>{msg(locale, "checkin.duration")}</h2><div className="mcy-chip-grid">{([5, 10, 15] as const).map(time => <Choice key={time} selected={state.minutes === time} onClick={() => update({ minutes: time, chosenPlanId: null })}>{formatMessage(locale, "checkin.minutes", { minutes: localizedNumber(locale, time) })}</Choice>)}</div></section>
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
  const { state, update, setState } = useDemo();
  const locale = state.locale;
  const [confirmSkip, setConfirmSkip] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const continueToDialogue = async () => {
    if (saving) return;
    update({ dialogueChoice: null, dialogueText: "", unrecognizedText: "", chosenPlanId: null, usePreviousFeedback: false });
    if (!state.signedIn) { update({ authReturnTo: "dialogue", authMode: "create" }); flow.push(ROUTES.authEmail); return; }
    if (!state.aiConsent) { update({ authReturnTo: "dialogue" }); flow.push(ROUTES.consent); return; }
    setSaving(true);
    setError("");
    try {
      await persistCurrentCheckin(state, setState, "practice_preparation");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Chưa lưu được check-in. Kiểm tra mạng rồi thử lại.");
      setSaving(false);
      return;
    }
    setSaving(false);
    flow.push(ROUTES.dialogue);
  };
  const continueAsGuest = () => { update({ chosenPlanId: null, dialogueChoice: null }); flow.push(ROUTES.plan); };
  const viewPlanNow = () => { update({ chosenPlanId: null, dialogueChoice: null, bodyStatus: "skipped", preObservations: [], regions: [] }); flow.push(ROUTES.plan); };
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
    {error && <div className="mcy-form-error footer-error" role="alert">{locale === "en-US" ? "Couldn't sync: " : "Chưa đồng bộ được: "}{error}</div>}
    {state.checkinStep === 1 ? <>
      <Action disabled={saving} onClick={advanceStep}>{msg(locale, "checkin.step1.next")}</Action>
      <div className="mcy-checkin-footer-options"><button disabled={saving} onClick={skipBody}>{msg(locale, "checkin.step1.skip")}</button><button disabled={saving} onClick={viewPlanNow}>{msg(locale, "checkin.directPlan")}</button></div>
    </> : <>
      <Action disabled={saving} onClick={() => { void continueToDialogue(); }}>{saving ? (locale === "en-US" ? "Saving…" : "Đang đồng bộ…") : state.signedIn ? state.aiConsent ? msg(locale, "checkin.step2.ai") : msg(locale, "checkin.step2.consent") : msg(locale, "checkin.step2.login")}</Action>
      <div className="mcy-checkin-footer-options"><button disabled={saving} onClick={continueAsGuest}>{msg(locale, "checkin.step2.guest")}</button><button disabled={saving} onClick={() => update({ checkinStep: 1 })}>{msg(locale, "checkin.backToBody")}</button></div>
    </>}
    <BottomSheet open={confirmSkip} onOpenChange={setConfirmSkip} title={locale === "en-US" ? "Skip the body check-in?" : "Bỏ ghi nhận vùng cơ thể?"} description={locale === "en-US" ? "The areas you entered will be cleared from this check-in. You can add them again later." : "Các vùng vừa ghi sẽ được xóa khỏi lần check-in này. Bạn có thể chọn lại sau."} snap={0.38}>
      <div className="mcy-sheet-actions"><button className="mcy-action" onClick={() => { update({ checkinStep: 2, bodyStatus: "skipped", preObservations: [], regions: [] }); setConfirmSkip(false); }}>{locale === "en-US" ? "Skip and continue" : "Bỏ qua và tiếp tục"} <ArrowRightIcon /></button><button className="mcy-quiet-link" onClick={() => setConfirmSkip(false)}>{locale === "en-US" ? "Keep my entries" : "Giữ các vùng đã ghi"}</button></div>
    </BottomSheet>
  </div>;
}

function DialogueScreen() {
  const keyboard = useKeyboard();
  const { state, update } = useDemo();
  const locale = state.locale;
  const prior = state.saveFeedbackConsent && state.rememberPace ? [...state.history].reverse().find(item => item.kind === "Sau tập") : undefined;
  const choose = (choice: DialogueChoice) => { keyboard.hide(); update({ dialogueChoice: choice, unrecognizedText: "" }); };
  const submitText = () => {
    const value = state.dialogueText.trim();
    if (!value) return;
    const lower = value.toLocaleLowerCase("vi");
    let choice: DialogueChoice = null;
    if (lower.includes("chậm")) choice = "Nhịp chậm";
    else if (lower.includes("sàn") || lower.includes("đứng")) choice = "Không nằm sàn";
    else if (lower.includes("hướng dẫn") || lower.includes("giải thích")) choice = "Nhiều hướng dẫn";
    else if (lower.includes("ít lời")) choice = "Ít lời";
    keyboard.hide();
    update({ dialogueChoice: choice, unrecognizedText: choice ? "" : value, dialogueText: "" });
  };
  const quickKeys = ["dialogue.quick.1", "dialogue.quick.2", "dialogue.quick.3", "dialogue.quick.4"] as const;
  return <MobileScroll className="mcy-scroll"><main className="mcy-page mcy-dialogue">
    <div className="mcy-step-count">{locale === "en-US" ? "STEP 2 OF 3" : "BƯỚC 02 / 03"} <span>{msg(locale, "dialogue.step")}</span></div>
    <h1>{msg(locale, "dialogue.title")}</h1>
    <p className="mcy-lead">{msg(locale, "dialogue.lead")}</p>
    <div className="mcy-conversation">
      <div className="mcy-ai-avatar"><MagicWandIcon /> <span>{msg(locale, "dialogue.actor")}</span></div>
      <div className="mcy-bubble ai">{locale === "en-US" ? <>You have <strong>{localizedNumber(locale, state.minutes)} min</strong>{state.energy ? <> and your energy is <strong>{energyLabel(locale, state.energy).toLowerCase()}</strong></> : null}{state.regions.length ? <>. You mentioned <strong>{state.regions.map(region => regionLabel(locale, region).toLowerCase()).join(", ")}</strong></> : null}. What would you like the session to focus on?</> : <>Mình biết bạn có <strong>{state.minutes} phút</strong>{state.energy ? <>, năng lượng <strong>{state.energy.toLowerCase()}</strong></> : null}{state.regions.length ? <> và muốn chú ý <strong>{state.regions.map(region => regionLabel(locale, region).toLowerCase()).join(", ")}</strong></> : null}. Có điều gì nên ưu tiên khi chọn buổi?</>}</div>
      {prior?.outcome === "Khó chịu hơn" ? <div className="mcy-bubble ai quiet">{locale === "en-US" ? "You previously reported more discomfort. I won't use that to recommend a session. If it continues, you can stop and seek appropriate support." : "Lần trước bạn chọn “khó chịu hơn”. Mình sẽ không tự dùng phản hồi đó để gợi ý buổi tập. Nếu cảm giác còn tiếp diễn, bạn có thể dừng và tìm hỗ trợ phù hợp."}</div> : prior?.pace === "Hơi nhanh" && !prior.endedEarly ? <div className="mcy-bubble ai quiet">{locale === "en-US" ? "You said the last session felt a little fast. Would you like to use that feedback to prioritize a slower session?" : "Lần trước bạn nói nhịp hơi nhanh. Bạn có muốn dùng phản hồi này để ưu tiên buổi chậm hơn?"}</div> : null}
      {prior?.pace === "Hơi nhanh" && prior.outcome !== "Khó chịu hơn" && !prior.endedEarly ? <div className="mcy-prior-actions"><Choice selected={state.usePreviousFeedback} onClick={() => update({ usePreviousFeedback: true })}>{locale === "en-US" ? "Use previous feedback" : "Dùng phản hồi cũ"}</Choice><Choice selected={!state.usePreviousFeedback} onClick={() => update({ usePreviousFeedback: false })}>{locale === "en-US" ? "Don't use it" : "Không dùng lần này"}</Choice></div> : null}
      {state.dialogueChoice ? <><div className="mcy-bubble mine">{guidedChoiceLabel(locale, state.dialogueChoice)}</div><div className="mcy-bubble ai">{locale === "en-US" ? state.dialogueChoice === "Nhịp chậm" ? "I'll prioritize a slower session within the time you have." : state.dialogueChoice === "Không nằm sàn" ? "I've noted that preference. Please read the session details before starting because this option is not confirmed for every session." : state.dialogueChoice === "Ít lời" ? "I'll show you a concise option that's easy to begin." : "I'll prioritize a session with clearer guidance." : state.dialogueChoice === "Nhịp chậm" ? "Mình sẽ ưu tiên một buổi có nhịp chậm trong thời gian bạn có." : state.dialogueChoice === "Không nằm sàn" ? "Mình đã ghi nhận cho hôm nay. Hãy đọc phần mô tả trước khi bắt đầu vì lựa chọn này chưa được xác nhận cho mọi buổi." : state.dialogueChoice === "Ít lời" ? "Mình sẽ để bạn xem một lựa chọn gọn và dễ bắt đầu." : "Mình sẽ ưu tiên buổi có thêm hướng dẫn rõ ràng."}</div></> : null}
      {state.unrecognizedText ? <><div className="mcy-bubble mine">{state.unrecognizedText}</div><div className="mcy-bubble ai">{locale === "en-US" ? "I don't recognize that preference yet. Choose one of the options below so I can arrange a clearer session." : "Mình chưa nhận ra nhu cầu này. Bạn có thể chọn một lựa chọn bên dưới để mình sắp xếp buổi phù hợp hơn."}</div></> : null}
    </div>
    <div className="mcy-section-label">{msg(locale, "dialogue.quick")}</div>
    <div className="mcy-chip-grid dialogue-chips">{(["Nhiều hướng dẫn", "Nhịp chậm", "Ít lời", "Không nằm sàn"] as Exclude<DialogueChoice, null>[]).map((choice, index) => <Choice key={choice} selected={state.dialogueChoice === choice} onClick={() => choose(choice)}>{msg(locale, quickKeys[index])}</Choice>)}</div>
    <div className="mcy-composer"><KeyboardInput aria-label={msg(locale, "dialogue.inputLabel")} placeholder={msg(locale, "dialogue.inputPlaceholder")} value={state.dialogueText} onChange={event => update({ dialogueText: event.target.value })} onKeyDown={event => { if (event.key === "Enter") submitText(); }} onBlur={() => keyboard.hide()} /><button aria-label={msg(locale, "dialogue.send")} onClick={submitText}><ArrowRightIcon /></button></div>
    <DemoNote>{msg(locale, "dialogue.note")}</DemoNote>
  </main></MobileScroll>;
}

function DialogueFooter() {
  const flow = useFlow();
  const keyboard = useKeyboard();
  const { state, update } = useDemo();
  const locale = state.locale;
  return <div className="mcy-flow-footer">
    <button className="mcy-quiet-link" onClick={() => { keyboard.hide(); update({ dialogueChoice: null, unrecognizedText: "", chosenPlanId: null }); flow.push(ROUTES.plan); }}>{msg(locale, "dialogue.fromCheckin")}</button>
    <Action disabled={Boolean(state.unrecognizedText)} onClick={() => { keyboard.hide(); update({ chosenPlanId: null }); flow.push(ROUTES.plan); }}>{msg(locale, "dialogue.viewPlan")}</Action>
  </div>;
}

function PlanScreen() {
  const flow = useFlow();
  const { state, update, setState } = useDemo();
  const locale = state.locale;
  const session = activeSession(state);
  const copy = sessionCopy(locale, session.id);
  const prior = latestFeedback(state);
  const alternatives = SESSIONS.filter(item => item.id !== session.id && item.minutes <= state.minutes);
  const unsupportedRequest = unsupportedPlanRequest(state);
  if (unsupportedRequest) {
    return <MobileScroll className="mcy-scroll"><main className="mcy-page">
      <div className="mcy-step-count">{locale === "en-US" ? "STEP 3 OF 3" : "BƯỚC 03 / 03"} <span>{locale === "en-US" ? "No confirmed match" : "Chưa có lựa chọn đủ rõ"}</span></div>
      <h1>{msg(locale, "plan.unsupportedTitle")}</h1>
      <p className="mcy-lead">{locale === "en-US" ? msg(locale, "plan.unsupportedBody") : `${unsupportedRequest} MCY sẽ không đoán thay bạn.`}</p>
      <div className="mcy-empty large"><InfoCircledIcon /><strong>{locale === "en-US" ? "No session is confirmed to meet this request" : "Chưa có buổi khớp điều kiện này"}</strong><p>{locale === "en-US" ? "Keep today's check-in or adjust your selection." : "Bạn có thể giữ lại ghi nhận hôm nay hoặc sửa vùng đã chọn."}</p></div>
      <button className="mcy-standalone-link" onClick={() => { setState(previous => ({ ...previous, history: [...previous.history, makeSnapshot(previous.day, "Ghi riêng", previous.bodyStatus, previous.preObservations)], preObservations: [], regions: [], bodyStatus: null })); flow.push(ROUTES.journey); }}>{msg(locale, "plan.keepCheckin")}</button>
      <button className="mcy-quiet-link" onClick={() => flow.push(ROUTES.checkin)}>{msg(locale, "plan.editCheckin")}</button>
    </main></MobileScroll>;
  }
  return <MobileScroll className="mcy-scroll"><main className="mcy-page mcy-plan-page">
    <h1>{msg(locale, "plan.title")}</h1><h2 className="mcy-subtitle">{msg(locale, "plan.subtitle")}</h2>
    <p className="mcy-lead">{state.regions.length ? `${locale === "en-US" ? "You selected" : "Bạn đã chọn"} ${state.regions.map(region => regionLabel(locale, region)).join(", ")}. ` : ""}{msg(locale, "plan.lead")}</p>
    <article className="mcy-plan-hero"><img src={session.image} alt={copy.imageAlt} /><span className="mcy-plan-time"><ClockIcon />{formatMessage(locale, "plan.minutes", { minutes: localizedNumber(locale, session.minutes) })}</span><div><h2>{copy.title}</h2><p>{copy.level} · {copy.detail}</p></div></article>
    <section className="mcy-movements"><h3>{msg(locale, "plan.movements")}</h3><Carousel ariaLabel={locale === "en-US" ? "Parts of the practice" : "Các phần trong buổi tập"} className="mcy-movement-carousel" contentClassName="mcy-movement-track">{[msg(locale, "plan.movement1"), msg(locale, "plan.movement2"), msg(locale, "plan.movement3")].map((label, index) => <article key={index}><img src={["/assets/today-neck-stretch.png", "/assets/practice-shoulder-stretch.png", "/assets/motion-chest-open.png"][index]} alt={formatMessage(locale, "plan.movementAlt", { movement: label.toLowerCase() })} /><span>{label}</span></article>)}</Carousel></section>
    {alternatives.length ? <button className="mcy-gentle-option" onClick={() => update({ chosenPlanId: alternatives[0].id })}><span><BrandMark /></span><span><strong>{msg(locale, "plan.alternative")}</strong><small>{sessionCopy(locale, alternatives[0].id).title} · {formatMessage(locale, "plan.minutes", { minutes: localizedNumber(locale, alternatives[0].minutes) })}</small></span><ArrowRightIcon /></button> : null}
    <div className="mcy-reason-card"><span className="mcy-source-icon"><MagicWandIcon /></span><div><span className="mcy-tag">{msg(locale, "plan.why")}</span><p>{locale === "en-US" ? state.chosenPlanId ? "You chose this session yourself." : state.minutes <= 5 ? "You have about five minutes, so this session is short and complete." : state.dialogueChoice === "Nhịp chậm" ? "You asked for a slower pace and have enough time for this session." : `A choice based on your ${localizedNumber(locale, state.minutes)} minutes${state.energy ? ` and ${energyLabel(locale, state.energy).toLowerCase()} energy` : ""}. This is not a health assessment.` : planReason(state)}</p>{prior?.pace === "Hơi nhanh" && state.chosenPlanId === null && state.minutes >= 9 ? <small>{locale === "en-US" ? "Based on feedback you chose to use today." : "Dựa trên phản hồi bạn đã đồng ý dùng hôm nay."}</small> : null}</div></div>
    <DemoNote>{msg(locale, "plan.note")}</DemoNote>
  </main></MobileScroll>;
}

function PlanFooter() {
  const flow = useFlow();
  const { state } = useDemo();
  const locale = state.locale;
  const unsupported = Boolean(unsupportedPlanRequest(state));
  return <div className="mcy-flow-footer single"><Action onClick={() => unsupported ? flow.pop() : flow.push(ROUTES.practice)}>{unsupported ? msg(locale, "plan.editCheckin") : msg(locale, "plan.start")}</Action></div>;
}

function PracticeScreen() {
  const flow = useFlow();
  const { state, update } = useDemo();
  const locale = state.locale;
  const session = activeSession(state);
  const [step, setStep] = useState(0);
  const [paused, setPaused] = useState(true);
  const [started, setStarted] = useState(false);
  const [remaining, setRemaining] = useState(30);
  useEffect(() => {
    if (paused || remaining === 0) return;
    const interval = window.setInterval(() => setRemaining(value => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(interval);
  }, [paused, remaining]);
  const steps = locale === "en-US" ? ["Gentle neck turns", "Stretch the shoulders", "Open the chest"] : ["Xoay cổ nhẹ", "Giãn vai và cổ bên", "Mở ngực"];
  const descriptions = locale === "en-US" ? ["Sit tall, move slowly, and stop if anything feels uncomfortable.", "Let your shoulders relax, breathe evenly, and avoid forcing a stretch.", "Open the chest gently within a comfortable range of motion."] : ["Giữ lưng thẳng, chuyển động chậm và dừng nếu không thoải mái.", "Giữ vai thả lỏng, hít thở đều và không kéo căng quá mức.", "Mở ngực nhẹ nhàng, chọn phạm vi chuyển động vừa sức."];
  const nextStep = () => { if (step < 2) { setStep(step + 1); setRemaining(30); setPaused(true); setStarted(false); } else finish(false); };
  const finish = (endedEarly: boolean) => { update({ endedEarly }); flow.push(ROUTES.reflection); };
  return <MobileScroll className="mcy-scroll"><main className="mcy-page mcy-practice-page">
    <div className="mcy-practice-heading"><span>{formatMessage(locale, "practice.part", { step: step + 1 })}</span><h1>{steps[step]}</h1><p>{descriptions[step]}</p></div>
    <div className="mcy-practice-image"><img src={["/assets/today-neck-stretch.png", "/assets/practice-shoulder-stretch.png", "/assets/motion-chest-open.png"][step]} alt={formatMessage(locale, "practice.visualAlt", { movement: steps[step].toLowerCase() })} /><span>{msg(locale, "practice.visual")}</span></div>
    <div className="mcy-practice-tip"><BrandMark /><span>{descriptions[step]}</span></div>
    <div className="mcy-timer-controls"><button onClick={() => { setStarted(true); setPaused(!paused); }} disabled={remaining === 0} aria-pressed={started && !paused} aria-label={msg(locale, remaining === 0 ? "practice.timerDone" : !started ? "practice.startTimer" : paused ? "practice.resumeTimer" : "practice.pauseTimer")}><span>{paused ? <PlayIcon /> : <PauseIcon />}</span>{remaining === 0 ? msg(locale, "practice.done") : !started ? msg(locale, "practice.start") : paused ? msg(locale, "practice.resume") : msg(locale, "practice.pause")}</button><div className="mcy-timer" style={{ background: `conic-gradient(#516b54 ${(30 - remaining) / 30 * 100}%, #d9e1d4 0)` }}><div><strong>00:{String(remaining).padStart(2, "0")}</strong><span>{msg(locale, "practice.timerLabel")}</span></div></div><button onClick={nextStep} aria-label={msg(locale, step === 2 ? "practice.end" : "practice.next")}><span><ArrowRightIcon /></span>{step === 2 ? msg(locale, "practice.finishButton") : msg(locale, "practice.skip")}</button></div>
    <div className="mcy-inline-note"><InfoCircledIcon />{msg(locale, "practice.timerNote")}</div>
  </main></MobileScroll>;
}

function PracticeFooter() {
  const flow = useFlow();
  const { state, update } = useDemo();
  const locale = state.locale;
  const finish = (endedEarly: boolean) => {
    update({ endedEarly });
    flow.push(ROUTES.reflection);
  };
  return <div className="mcy-flow-footer">
    <button className="mcy-quiet-link" onClick={() => finish(true)}>{msg(locale, "practice.stop")}</button>
    <Action onClick={() => finish(false)}>{msg(locale, "practice.finish")}</Action>
  </div>;
}

function ReflectionScreen() {
  const keyboard = useKeyboard();
  const { state, update, setState } = useDemo();
  const locale = state.locale;
  const [editing, setEditing] = useState<BodyRegion | null>(null);
  const [editingStoredSide, setEditingStoredSide] = useState<BodySide | undefined>();
  const [suggestedSide, setSuggestedSide] = useState<BodySide | undefined>();
  const [chooseNewRegion, setChooseNewRegion] = useState(false);
  const current = editing ? state.postObservations.find(item => item.region === editing && item.side === editingStoredSide) ?? state.postObservations.find(item => item.region === editing) : undefined;
  const openRegion = (region: BodyRegion, preferredSide?: BodySide) => {
    const entries = state.postObservations.filter(item => item.region === region);
    const prior = state.preObservations.filter(item => item.region === region);
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
    <div className="mcy-before-after"><div><BodyMap observations={state.preObservations} bodyStyle={state.bodyStyle} compact locale={locale} /><span>{msg(locale, "reflection.before")}</span></div><span className="mcy-before-arrow"><ArrowRightIcon /></span><div><BodyMap observations={state.postObservations} bodyStyle={state.bodyStyle} compact locale={locale} /><span>{msg(locale, "reflection.after")}</span></div></div>
    <p className="mcy-reflection-hint">{msg(locale, "reflection.hint")}</p>
    <section className="mcy-field-section"><h2>{msg(locale, "reflection.preRegions")}</h2>{state.preObservations.length ? <div className="mcy-reflection-regions">{state.preObservations.map(item => { const after = state.postObservations.find(entry => entry.region === item.region && (entry.side === item.side || (entry.side === "both" && (item.side === "left" || item.side === "right")))); const area = `${regionLabel(locale, item.region)}${isPairedBodyRegion(item.region) && item.side !== "unspecified" ? ` · ${sideLabel(locale, item.side)}` : ""}`; return <div key={`${item.region}-${item.side}`} className="mcy-reflection-region-row"><button onClick={() => openRegion(item.region, item.side)}><span><strong>{area}</strong><small>{msg(locale, "reflection.before")}: {item.status === "uncertain" ? bodyLevelLabel(locale, "Chưa rõ") : bodyLevelLabel(locale, item.level ?? msg(locale, "checkin.notRecorded"))}</small></span><span><small>{msg(locale, "reflection.after")}</small><strong>{after ? after.status === "uncertain" ? bodyLevelLabel(locale, "Chưa rõ") : bodyLevelLabel(locale, after.level ?? msg(locale, "checkin.notRecorded")) : msg(locale, "reflection.tapToRecord")}</strong></span><ArrowRightIcon /></button><button className="mcy-keep-region" onClick={() => setState(previous => ({ ...previous, postBodyStatus: "reported", postObservations: replaceBodyObservation(previous.postObservations, { ...item, note: "" }, item.side) }))}>{msg(locale, "reflection.keepSame")}</button></div>; })}</div> : <p className="mcy-inline-note">{msg(locale, "reflection.notCheckedIn")}</p>}</section>
    <button className="mcy-standalone-link" onClick={() => setChooseNewRegion(true)}>{msg(locale, "reflection.addRegion")}</button>
    {state.preObservations.length > 0 && <div className="mcy-post-options"><button onClick={() => update({ postObservations: state.preObservations.map(item => ({ ...item, note: "" })), postBodyStatus: "reported" })}>{msg(locale, "reflection.keepAll")}</button><button onClick={() => update({ postObservations: [], postBodyStatus: "uncertain" })}>{msg(locale, "reflection.unsureAfter")}</button></div>}
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
  const session = activeSession(state);
  const save = (skip: boolean) => {
    keyboard.hide();
    setState(previous => {
      const before = makeSnapshot(previous.day, "Trước tập", previous.bodyStatus, previous.preObservations, { sessionId: session.id });
      const after = makeSnapshot(previous.day, "Sau tập", skip ? "skipped" : previous.postBodyStatus ?? (previous.postObservations.length ? "reported" : null), skip ? [] : previous.postObservations, { sessionId: session.id, outcome: skip ? null : previous.outcome, pace: skip ? null : previous.pace, note: skip ? "" : previous.note, endedEarly: previous.endedEarly, feedbackSkipped: skip });
      const localBefore = previous.currentRemoteCheckinId ? [] : [before];
      return { ...previous, history: previous.saveFeedbackConsent ? [...previous.history, ...localBefore, after] : previous.history, lastReflection: after, preObservations: [], postObservations: [], bodyStatus: null, postBodyStatus: null, regions: [], outcome: null, pace: null, note: "", chosenPlanId: null, syncStatus: "saved" };
    });
    flow.push(ROUTES.sync);
  };
  return <div className="mcy-flow-footer"><button className="mcy-quiet-link" onClick={() => save(true)}>{msg(locale, "reflection.skip")}</button><Action onClick={() => save(false)}>{msg(locale, "reflection.save")}</Action></div>;
}

function JourneyScreen() {
  const flow = useFlow();
  const { state, setState, update } = useDemo();
  const [range, setRange] = useState<7 | 30>(7);
  const [selectedDay, setSelectedDay] = useState(localDateOrdinal(todayLocalDate()));
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detailRegion, setDetailRegion] = useState<BodyRegion | null>(null);
  const [detailSide, setDetailSide] = useState<BodySide | undefined>();
  const [editingRegion, setEditingRegion] = useState<BodyRegion | null>(null);
  const [editingStoredSide, setEditingStoredSide] = useState<BodySide | undefined>();
  const [editingSuggestedSide, setEditingSuggestedSide] = useState<BodySide | undefined>();
  const [compare, setCompare] = useState(false);
  const [compareA, setCompareA] = useState<string | null>(null);
  const [compareB, setCompareB] = useState<string | null>(null);
  const [comparePicker, setComparePicker] = useState<"A" | "B" | null>(null);
  const [trendRegion, setTrendRegion] = useState<BodyRegion>("neck");
  const [deletePending, setDeletePending] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const snapshots = [...state.remoteCheckins, ...state.history]
    .map(item => ({ ...item, day: localDateOrdinal(item.date) }))
    .sort((left, right) => left.date.localeCompare(right.date) || left.time.localeCompare(right.time));
  const maxDay = Math.max(localDateOrdinal(todayLocalDate()), ...snapshots.map(item => item.day));
  const days = Array.from({ length: range }, (_, index) => maxDay - (range - 1 - index));
  const selected = snapshots.find(item => item.id === selectedId && item.day === selectedDay);
  const daySnapshots = snapshots.filter(item => item.day === selectedDay);
  const detail = selected?.observations.find(item => item.region === detailRegion && item.side === detailSide) ?? selected?.observations.find(item => item.region === detailRegion);
  const editCurrent = selected?.observations.find(item => item.region === editingRegion && item.side === editingStoredSide) ?? selected?.observations.find(item => item.region === editingRegion);
  const a = snapshots.find(item => item.id === compareA);
  const b = snapshots.find(item => item.id === compareB);
  const compatible = Boolean(a && b && (a.kind === b.kind || (a.kind !== "Sau tập" && b.kind !== "Sau tập") || (a.date === b.date && [a.kind, b.kind].includes("Trước tập") && [a.kind, b.kind].includes("Sau tập"))));
  const trend = snapshots.filter(item => item.kind !== "Sau tập" && item.observations.some(observation => observation.region === trendRegion));
  const chooseDay = (day: number) => { setSelectedDay(day); setSelectedId(snapshots.filter(item => item.day === day).at(-1)?.id ?? null); setDetailRegion(null); setDetailSide(undefined); };
  const saveEdited = (value: Observation) => { if (!selected || selected.remoteId) return; setState(previous => ({ ...previous, history: previous.history.map(item => item.id === selected.id ? { ...item, status: "reported", observations: replaceBodyObservation(item.observations, value, editingStoredSide ?? value.side) } : item) })); };
  const deleteEdited = () => { if (!selected || !editingRegion || !editingStoredSide || selected.remoteId) return; setState(previous => ({ ...previous, history: previous.history.map(item => { if (item.id !== selected.id) return item; const observations = removeBodyObservation(item.observations, editingRegion, editingStoredSide); return { ...item, observations, status: observations.length ? "reported" : null }; }) })); };
  const deleteSelected = async () => {
    if (!selected || deleting) return;
    setDeleting(true);
    setDeleteError("");
    try {
      if (selected.remoteId) {
        if (!supabase) throw new Error("Backend chưa kết nối.");
        const deleted = await deleteLearnerCheckin(supabase, selected.remoteId);
        if (!deleted) throw new Error("Không tìm thấy bản ghi thuộc tài khoản này.");
        setState(previous => ({ ...previous, remoteCheckins: previous.remoteCheckins.filter(item => item.remoteId !== selected.remoteId) }));
      } else {
        setState(previous => ({ ...previous, history: previous.history.filter(item => item.id !== selected.id) }));
      }
      setSelectedId(null);
      setDeletePending(false);
    } catch (cause) {
      setDeleteError(cause instanceof Error ? cause.message : "Chưa xóa được bản ghi.");
    } finally {
      setDeleting(false);
    }
  };
  const startNext = () => { update({ day: state.day + 1, dialogueChoice: null, chosenPlanId: null, minutes: 10, energy: null, regions: [], preObservations: [], postObservations: [], bodyStatus: null, postBodyStatus: null, outcome: null, pace: null, note: "", endedEarly: false, usePreviousFeedback: false, lastReflection: null, currentRemoteCheckinId: null, pendingCheckinIdempotencyKey: null }); flow.push(ROUTES.checkin); };
  return <MobileScroll className="mcy-scroll"><main className="mcy-page mcy-journey-page">
    <h1>{msg(state.locale, "journey.title")}</h1><p className="mcy-lead">{msg(state.locale, "journey.lead")}</p>
    <div className="mcy-journey-toolbar"><div className="mcy-view-tabs"><button aria-pressed={range === 7} onClick={() => setRange(7)}>{msg(state.locale, "journey.days7")}</button><button aria-pressed={range === 30} onClick={() => setRange(30)}>{msg(state.locale, "journey.days30")}</button></div></div>
    <div className="mcy-timeline-head"><strong>{msg(state.locale, range === 30 ? "journey.timelineRecent" : "journey.timelineChoose")}</strong><button onClick={() => chooseDay(snapshots.at(-1)?.day ?? maxDay)}>{msg(state.locale, "journey.latest")}</button></div>
    <Carousel ariaLabel={msg(state.locale, "journey.title")} className="mcy-timeline-carousel" contentClassName="mcy-timeline-track">{days.map(day => { const count = snapshots.filter(item => item.day === day).length; const date = dateFromOrdinal(day); return <button key={day} className={selectedDay === day ? "selected" : ""} aria-pressed={selectedDay === day} onClick={() => chooseDay(day)}><small>{formatMessage(state.locale, "journey.month", { month: date.slice(5, 7) })}</small><strong>{date.slice(8, 10)}</strong><span>{count ? formatMessage(state.locale, "journey.recordCount", { count: localizedNumber(state.locale, count) }) : msg(state.locale, "journey.noRecord")}</span></button>; })}</Carousel>
    <section className="mcy-snapshot-card" aria-label={msg(state.locale, "journey.currentRecord")}>
      <div className="mcy-snapshot-heading"><span>{msg(state.locale, selected?.remoteId ? "journey.accountRecord" : "journey.sessionRecord")}</span><h2>{selected ? snapshotLabel(selected, state.locale) : `${prettyDate(dateFromOrdinal(selectedDay), state.locale)} · ${msg(state.locale, "journey.noRecordForDay")}`}</h2></div>
      {daySnapshots.length > 1 && <Carousel ariaLabel={msg(state.locale, "journey.sameDayEntries")} className="mcy-record-carousel" contentClassName="mcy-record-track">{daySnapshots.map(item => <button key={item.id} aria-pressed={selectedId === item.id} onClick={() => setSelectedId(item.id)}>{snapshotLabel(item, state.locale)}</button>)}</Carousel>}
      {selected ? <div className="mcy-snapshot-body">
        <div className="mcy-snapshot-map"><BodyMap observations={selected.observations} bodyStyle={state.bodyStyle} locale={state.locale} onSelect={(region, side) => { setDetailRegion(region); setDetailSide(side); }} showAll={false} /><BodyStylePicker value={state.bodyStyle} onChange={bodyStyle => update({ bodyStyle })} /></div>
        <div className="mcy-snapshot-details">
          <div className="mcy-snapshot-list">{selected.observations.length ? selected.observations.map(item => <button key={`${item.region}-${item.side}`} onClick={() => { setDetailRegion(item.region); setDetailSide(item.side); }}><span className="mcy-snapshot-dot" /><span><strong>{regionLabel(state.locale, item.region)}{isPairedBodyRegion(item.region) && item.side !== "unspecified" ? ` · ${sideLabel(state.locale, item.side)}` : ""}</strong><small>{item.status === "uncertain" ? msg(state.locale, "journey.unsure") : bodyLevelLabel(state.locale, item.level ?? msg(state.locale, "checkin.notRecorded"))}{item.note ? ` · ${msg(state.locale, "journey.hasNote")}` : ""}</small></span><ArrowRightIcon /></button>) : <p>{journeyBodyStatus(state.locale, selected.status)}</p>}</div>
          {selected.outcome && <div className="mcy-snapshot-meta">{msg(state.locale, "journey.overall")} <strong>{guidedChoiceLabel(state.locale, selected.outcome)}</strong></div>}
          {selected.endedEarly && <div className="mcy-snapshot-meta">{msg(state.locale, "journey.endedEarly")}</div>}
          {selected.note && <blockquote className="mcy-snapshot-note">“{selected.note}”</blockquote>}
          <button className="mcy-delete-link" onClick={() => { setDeleteError(""); setDeletePending(true); }}>{msg(state.locale, "journey.deleteEntry")}</button>
        </div>
      </div> : <div className="mcy-snapshot-empty">{msg(state.locale, "journey.emptyDay")}</div>}
    </section>
    <button className="mcy-compare-toggle" onClick={() => { setCompare(!compare); setCompareA(snapshots.find(item => item.kind !== "Sau tập")?.id ?? null); setCompareB(selected?.id ?? snapshots.at(-1)?.id ?? null); }}>{msg(state.locale, compare ? "journey.compareClose" : "journey.compareOpen")}<ArrowRightIcon /></button>
    {compare && <section className="mcy-compare-card"><h2>{msg(state.locale, "journey.compareTitle")}</h2><p>{msg(state.locale, "journey.compareLead")}</p><div className="mcy-compare-pickers"><button onClick={() => setComparePicker("A")}><small>{msg(state.locale, "journey.markerA")}</small><strong>{a ? snapshotLabel(a, state.locale) : msg(state.locale, "journey.chooseMarker")}</strong></button><button onClick={() => setComparePicker("B")}><small>{msg(state.locale, "journey.markerB")}</small><strong>{b ? snapshotLabel(b, state.locale) : msg(state.locale, "journey.chooseMarker")}</strong></button></div>{!compatible ? <p className="mcy-compare-warning">{msg(state.locale, "journey.compareHelp")}</p> : <div className="mcy-compare-rows">{BODY_REGIONS.map(region => { const describe = (snapshot?: Snapshot) => snapshot?.observations.filter(item => item.region === region).map(item => `${isPairedBodyRegion(region) && item.side !== "unspecified" ? `${sideLabel(state.locale, item.side)}: ` : ""}${item.status === "uncertain" ? msg(state.locale, "journey.unsure") : bodyLevelLabel(state.locale, item.level ?? msg(state.locale, "checkin.notRecorded"))}`).join(" · ") || msg(state.locale, "journey.noRecord"); const sidesA = (a?.observations.filter(item => item.region === region) ?? []).map(item => item.side).sort().join(","); const sidesB = (b?.observations.filter(item => item.region === region) ?? []).map(item => item.side).sort().join(","); return <div key={region}><strong>{regionLabel(state.locale, region)}</strong><span>{describe(a)} <ArrowRightIcon /> {describe(b)}{sidesA !== sidesB && sidesA && sidesB && <small>{msg(state.locale, "journey.otherSide")}</small>}</span></div>; })}</div>}</section>}
    <section className="mcy-region-trend"><h2>{msg(state.locale, "journey.trendTitle")}</h2><p>{msg(state.locale, "journey.trendLead")}</p><Carousel ariaLabel={msg(state.locale, "journey.chooseRegionTrend")} className="mcy-trend-carousel" contentClassName="mcy-trend-track">{BODY_REGIONS.map(region => <button key={region} aria-pressed={trendRegion === region} onClick={() => setTrendRegion(region)}>{regionLabel(state.locale, region)}</button>)}</Carousel><div className="mcy-trend-observations">{trend.length ? trend.map(item => { const observations = item.observations.filter(entry => entry.region === trendRegion); const summary = observations.map(observation => `${isPairedBodyRegion(trendRegion) && observation.side !== "unspecified" ? `${sideLabel(state.locale, observation.side)}: ` : ""}${observation.status === "uncertain" ? msg(state.locale, "journey.unsure") : bodyLevelLabel(state.locale, observation.level ?? msg(state.locale, "checkin.notRecorded"))}`).join(" · "); return <button key={item.id} onClick={() => { setSelectedDay(item.day); setSelectedId(item.id); }}><span>{prettyDate(item.date, state.locale)}</span><strong>{summary}</strong><ArrowRightIcon /></button>; }) : <p>{msg(state.locale, "journey.noRegionLevels")}</p>}</div><small>{msg(state.locale, trend.length <= 1 ? "journey.trendNotEnough" : "journey.trendGaps")}</small></section>
    {snapshots.length === 0 && <div className="mcy-empty large"><ReaderIcon /><strong>{msg(state.locale, "journey.emptyTitle")}</strong><p>{msg(state.locale, "journey.emptyLead")}</p></div>}
    <Action onClick={startNext}>{msg(state.locale, "journey.nextCheckin")}</Action>
    <DemoNote>{msg(state.locale, "journey.note")}</DemoNote>
    <BottomSheet open={Boolean(detailRegion)} onOpenChange={open => { if (!open) { setDetailRegion(null); setDetailSide(undefined); } }} title={detailRegion ? `${regionLabel(state.locale, detailRegion)}${isPairedBodyRegion(detailRegion) && detailSide && detailSide !== "unspecified" ? ` · ${sideLabel(state.locale, detailSide)}` : ""}` : msg(state.locale, "journey.detail")} description={selected ? snapshotLabel(selected, state.locale) : msg(state.locale, "journey.currentRecord")} snap={0.49}><div className="mcy-detail-sheet">{detail ? <><strong>{observationLabel(detail, state.locale)}</strong><p>{detail.note || msg(state.locale, "journey.noNote")}</p>{!selected?.remoteId && <button className="mcy-quiet-link" onClick={() => { setEditingRegion(detail.region); setEditingStoredSide(detail.side); setEditingSuggestedSide(detail.side); setDetailRegion(null); setDetailSide(undefined); }}>{msg(state.locale, "journey.editObservation")}</button>}</> : <p>{msg(state.locale, "journey.regionNotRecorded")}</p>}</div></BottomSheet>
    <RegionEditor region={editingRegion} current={editCurrent} suggestedSide={editingSuggestedSide} onSave={saveEdited} onDelete={deleteEdited} onClose={() => { setEditingRegion(null); setEditingStoredSide(undefined); setEditingSuggestedSide(undefined); }} />
    <BottomSheet open={Boolean(comparePicker)} onOpenChange={open => { if (!open) setComparePicker(null); }} title={formatMessage(state.locale, "journey.chooseCompareMarker", { marker: comparePicker ?? "" })} snap={0.63}><div className="mcy-picker-list">{snapshots.map(item => <button key={item.id} onClick={() => { if (comparePicker === "A") setCompareA(item.id); else setCompareB(item.id); setComparePicker(null); }}>{snapshotLabel(item, state.locale)}</button>)}</div></BottomSheet>
    <BottomSheet open={deletePending} onOpenChange={setDeletePending} title={msg(state.locale, "journey.deleteTitle")} description={msg(state.locale, selected?.remoteId ? "journey.deleteRemote" : "journey.deleteLocal")} snap={0.36}><div className="mcy-sheet-actions">{deleteError && <div className="mcy-form-error" role="alert">{deleteError}</div>}<button className="mcy-action danger-action" disabled={deleting} onClick={() => { void deleteSelected(); }}>{msg(state.locale, deleting ? "journey.deleting" : "journey.deleteAction")} <ArrowRightIcon /></button><button className="mcy-quiet-link" disabled={deleting} onClick={() => setDeletePending(false)}>{msg(state.locale, "journey.keepEntry")}</button></div></BottomSheet>
  </main></MobileScroll>;
}

function DiscoverScreen() {
  const flow = useFlow();
  const { state, update } = useDemo();
  const locale = state.locale;
  return <MobileScroll className="mcy-scroll"><main className="mcy-page">
    <Eyebrow>KHÁM PHÁ NỘI DUNG</Eyebrow><h1>Một danh mục nhỏ, có chủ đích.</h1><p className="mcy-lead">Chọn một buổi theo thời gian và nhịp bạn muốn hôm nay. Bạn luôn có thể quay lại check-in để bắt đầu từ cảm nhận hiện tại.</p>
    <div className="mcy-catalog">{SESSIONS.map(item => <button className="mcy-catalog-card" key={item.id} onClick={() => { update({ minutes: item.minutes, chosenPlanId: item.id, dialogueChoice: null }); flow.push(ROUTES.plan); }}><img src={item.image} alt="" /><span><small>{item.minutes} PHÚT · KHÔNG CẦN DỤNG CỤ</small><strong>{item.title}</strong><em>{item.level}</em></span><ArrowRightIcon /></button>)}</div>
    <section className="mcy-course-section" aria-labelledby="free-course-heading">
      <div className="mcy-course-heading"><div><Eyebrow>{msg(locale, "discover.freeCourses")}</Eyebrow><h2 id="free-course-heading">Học theo từng bài, ngay trong ứng dụng.</h2></div><span className="mcy-state-pill">YOUTUBE</span></div>
      <p className="mcy-course-lead">{msg(locale, "discover.freeCoursesLead")}</p>
      <div className="mcy-course-catalog" data-testid="free-course-catalog">{FREE_COURSES.map(course => <button className="mcy-course-card" key={course.id} onClick={() => { update({ selectedCourseId: course.id }); flow.push(ROUTES.courseDetail); }}><span className="mcy-course-card-index">{String(course.lessons.length).padStart(2, "0")}</span><span><strong>{course.title}</strong><small>{formatMessage(locale, "discover.courseLessons", { count: course.lessons.length })} · {msg(locale, "discover.youtubeLabel")}</small><em>{msg(locale, "discover.courseStatus")}</em></span><ArrowRightIcon /></button>)}</div>
      <DemoNote>{msg(locale, "discover.courseNote")}</DemoNote>
    </section>
    <button className="mcy-account-row" onClick={() => flow.push(ROUTES.discoverDetail)}><span><strong>Hướng dẫn chọn buổi tập</strong><small>Góc kiến thức · nguồn và ngày rà soát</small></span><ArrowRightIcon /></button>
  </main></MobileScroll>;
}

function CourseDetailScreen() {
  const { state } = useDemo();
  const locale = state.locale;
  const course = FREE_COURSES.find(item => item.id === state.selectedCourseId) ?? FREE_COURSES[0];
  return <MobileScroll className="mcy-scroll"><main className="mcy-page mcy-course-detail-page">
    <Eyebrow>{msg(locale, "course.eyebrow")}</Eyebrow>
    <h1>{course.title}</h1>
    <p className="mcy-lead">{course.description}</p>
    <div className="mcy-course-detail-meta"><span>{formatMessage(locale, "discover.courseLessons", { count: course.lessons.length })}</span><span>{msg(locale, "discover.youtubeLabel")}</span><span>{msg(locale, "course.unlistedStatus")}</span></div>
    <div className="mcy-course-status"><strong>{msg(locale, "course.unlistedTitle")}</strong><p>{msg(locale, "course.unlistedBody")}</p><a href={YOUTUBE_CHANNEL_URL} target="_blank" rel="noreferrer">{msg(locale, "course.openChannel")}</a></div>
    {locale === "en-US" && <p className="mcy-locale-note">{msg(locale, "course.englishNote")}</p>}
    <section className="mcy-course-lessons" aria-labelledby="course-lessons-heading">
      <div className="mcy-course-lessons-heading"><h2 id="course-lessons-heading">{msg(locale, "course.lessonsHeading")}</h2><span>{formatMessage(locale, "course.lessonCount", { count: course.lessons.length })}</span></div>
      {course.lessons.map((lesson, index) => <article className="mcy-course-lesson" key={lesson.id}>
        <div className="mcy-course-video" data-testid="course-video">
          {lesson.visibility === "public" || lesson.visibility === "unlisted" ? <iframe title={lesson.title} src={`https://www.youtube-nocookie.com/embed/${lesson.youtubeId}?rel=0&modestbranding=1`} loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen /> : <div className="mcy-course-video-placeholder"><span>YOUTUBE</span><strong>{msg(locale, "course.unlistedTitle")}</strong></div>}
        </div>
        <div className="mcy-course-lesson-copy"><span className="mcy-course-lesson-number">{String(index + 1).padStart(2, "0")} · {lesson.duration}</span><h3>{lesson.title}</h3><p>{lesson.description}</p></div>
      </article>)}
    </section>
    <DemoNote>{msg(locale, "course.sourceNote")}</DemoNote>
  </main></MobileScroll>;
}

function ProfileScreen() {
  const flow = useFlow();
  const { state, setState, update } = useDemo();
  const [signingOut, setSigningOut] = useState(false);
  const [error, setError] = useState("");
  const feedback = state.saveFeedbackConsent ? [...state.history].reverse().find(item => item.pace === "Hơi nhanh") : undefined;
  const signOut = async () => {
    if (!supabase) return;
    setSigningOut(true);
    setError("");
    const { error: signOutError } = await supabase.auth.signOut({ scope: "local" });
    setSigningOut(false);
    if (signOutError) setError(signOutError.message);
  };
  return <MobileScroll className="mcy-scroll"><main className="mcy-page mcy-account-home">
    <Eyebrow>CÁ NHÂN · {state.signedIn ? "TÀI KHOẢN HỌC VIÊN" : "KHÁCH"}</Eyebrow><h1>{state.signedIn ? `Chào${state.displayName ? `, ${state.displayName}` : " bạn"}.` : "Bạn kiểm soát tài khoản và dữ liệu."}</h1>
    <p className="mcy-lead">{state.signedIn ? `${state.accountEmail} · Đã xác minh qua Supabase Auth.` : "Bạn có thể xem nội dung mà không cần tài khoản. Đăng nhập để lưu hồ sơ, lựa chọn quyền và check-in đã đồng ý."}</p>
    {!state.signedIn ? <div className="mcy-profile-card"><span className="mcy-tag">L01 · TÀI KHOẢN</span><strong>Lưu hành trình trên tài khoản của bạn</strong><p>Đăng nhập bằng email để đồng bộ hồ sơ, quyền dữ liệu và check-in có đồng ý.</p><button onClick={() => { update({ authMode: "create", authReturnTo: "profile" }); flow.push(ROUTES.authEmail); }}>Tạo tài khoản hoặc đăng nhập</button></div> : <div className="mcy-profile-card"><span className="mcy-tag">TRẠNG THÁI</span><strong>Đang dùng tài khoản học viên</strong><p>Hồ sơ, quyền riêng tư và check-in được lưu theo lựa chọn của bạn.</p><button disabled={signingOut} onClick={() => { void signOut(); }}>{signingOut ? "Đang đăng xuất…" : "Đăng xuất thiết bị này"}</button></div>}
    {error && <div className="mcy-form-error" role="alert">{error}</div>}
    <div className="mcy-account-group"><span className="mcy-section-label">HỒ SƠ VÀ QUYỀN DỮ LIỆU</span>
      <AccountRow title="Thông tin cá nhân" detail={state.displayName || "Tên tùy chọn · ngôn ngữ · hình minh họa"} onClick={() => flow.push(ROUTES.editProfile)} />
      <AccountRow title="AI và điều được nhớ" detail={feedback ? "Có phản hồi để xem nguồn và cách rút lại" : "Chưa có thông tin được nhớ"} onClick={() => flow.push(ROUTES.memory)} />
      <AccountRow title="Quyền riêng tư và đồng ý" detail="Mỗi mục đích, phiên bản và cách thay đổi" onClick={() => flow.push(ROUTES.privacy)} />
      <AccountRow title="Bảo mật tài khoản" detail="Email, phiên đăng nhập và xác minh lại" onClick={() => flow.push(ROUTES.security)} />
      <AccountRow title="Nhắc tập và thông báo" detail="Tùy chọn kênh, giờ và múi giờ" onClick={() => flow.push(ROUTES.notifications)} />
      <AccountRow title="Nội dung và quyền đang có" detail="Nội dung hiện có · chưa có giao dịch" onClick={() => flow.push(ROUTES.access)} />
      <AccountRow title="Chia sẻ với giáo viên" detail="Chưa có lớp được kết nối · mặc định tắt" onClick={() => flow.push(ROUTES.sharing)} />
    </div>
    <div className="mcy-account-group"><span className="mcy-section-label">TRỢ GIÚP VÀ YÊU CẦU</span>
      <AccountRow title="Hướng dẫn và liên hệ" detail="Tìm câu trả lời hoặc gửi yêu cầu hỗ trợ" onClick={() => flow.push(ROUTES.help)} />
      <AccountRow title="Xuất hoặc xóa dữ liệu" detail="Xem phạm vi và cách gửi yêu cầu" onClick={() => flow.push(ROUTES.help)} />
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
  const latest = state.saveFeedbackConsent ? [...state.history].reverse().find(item => item.kind === "Sau tập") : undefined;
  const changeConsent = async (purpose: ConsentPurpose, granted: boolean, patch: Partial<DemoState>) => {
    setError("");
    try {
      if (supabase && state.userId && state.consentBaseline[purpose] !== granted) {
        await saveConsentEvent(supabase, purpose, granted, purpose === "terms" ? REQUIRED_CONSENT_POLICY_VERSIONS.terms : REQUIRED_CONSENT_POLICY_VERSIONS.privacy, "settings", crypto.randomUUID(), clientChannel());
      }
      const policyVersion = purpose === "terms" ? REQUIRED_CONSENT_POLICY_VERSIONS.terms : REQUIRED_CONSENT_POLICY_VERSIONS.privacy;
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
  const screen = (eyebrow: string, title: string, description: string, content: React.ReactNode) => <MobileScroll className="mcy-scroll"><main className="mcy-page mcy-account-detail"><Eyebrow>{eyebrow}</Eyebrow><h1>{title}</h1><p className="mcy-lead">{description}</p>{content}<DemoNote>Hồ sơ và lựa chọn quyền của tài khoản đã kết nối với Supabase. Tính năng chưa có kết nối sẽ báo rõ và không tạo biên nhận giả.</DemoNote></main></MobileScroll>;
  if (panel === "edit") return screen("L02 · HỒ SƠ", "Thông tin tối thiểu, do bạn sửa.", "Tên tùy chọn, cài đặt hiển thị và các trường chỉ hỏi khi thật sự cần.", <><label className="mcy-form-field">Tên hiển thị<KeyboardInput autoComplete="nickname" aria-label="Tên hiển thị" value={name} onChange={event => setName(event.target.value)} onBlur={() => keyboard.hide()} placeholder="Tên gọi trong ứng dụng" /></label><div className="mcy-account-panel"><strong>Ngôn ngữ và múi giờ</strong><div className="mcy-chip-grid"><Choice selected={editLocale === "vi-VN"} onClick={() => setEditLocale("vi-VN")}>Tiếng Việt</Choice><Choice selected={editLocale === "en-US"} onClick={() => setEditLocale("en-US")}>English · đang hoàn thiện</Choice><Choice selected>Asia/Bangkok</Choice></div><small className="mcy-locale-note">{editLocale === "en-US" ? "English is in progress. Welcome, the main practice loop and Journey are translated; account, consent, support and knowledge screens remain in Vietnamese." : "Tiếng Anh hiện đang được hoàn thiện. Chào mừng, luồng tập chính và Hành trình đã có bản dịch; tài khoản, đồng ý, hỗ trợ và nội dung kiến thức vẫn dùng tiếng Việt."}</small></div><div className="mcy-account-panel"><strong>Hình body map</strong><BodyStylePicker value={state.bodyStyle} onChange={bodyStyle => update({ bodyStyle })} /></div>{error && <div className="mcy-form-error" role="alert">{error}</div>}<Action onClick={() => { void saveProfileChanges(); }}>Lưu thay đổi</Action><button className="mcy-quiet-link" onClick={() => flow.pop()}>Hủy</button></>);
  if (panel === "memory") return screen("L03 · AI VÀ GHI NHỚ", "Bạn xem được nguồn của mọi điều được nhớ.", "Không có suy luận sức khỏe dài hạn. Một phản hồi khó chịu hơn không thành sở thích mặc định.", <><div className="mcy-account-panel"><span className="mcy-tag">TRẠNG THÁI</span>{latest && state.rememberPace ? <><strong>Nhịp buổi trước hơi nhanh</strong><p>Nguồn: phản hồi sau buổi · phạm vi: gợi ý nhịp lần kế tiếp · dữ liệu chỉ trong phiên.</p><button className="mcy-toggle" aria-pressed={state.rememberPace} onClick={() => update({ rememberPace: false, usePreviousFeedback: false })}>Tắt và xóa ghi nhớ</button></> : <><strong>Chưa có ghi nhớ đang bật</strong><p>Phản hồi sau buổi hiện chỉ nằm trong phiên; chưa được lưu vào tài khoản.</p></>}</div><div className="mcy-account-panel"><strong>Trợ lý AI</strong><p>{state.aiConsent ? "Đã ghi lựa chọn AI; tính năng AI chưa được kết nối." : "AI đang tắt. Bạn vẫn có thể chọn buổi theo check-in."}</p><button className="mcy-toggle" aria-pressed={state.aiConsent} onClick={() => { void changeConsent("ai_processing", !state.aiConsent, { aiConsent: !state.aiConsent, usePreviousFeedback: false }); }}>{state.aiConsent ? "Rút đồng ý AI" : "Cho phép AI trong lần chọn tới"}</button></div><AccountRow title="Xem quyền theo mục đích" detail="Rút đồng ý và xem ảnh hưởng" onClick={() => flow.push(ROUTES.privacy)} />{error && <div className="mcy-form-error" role="alert">{error}</div>}</>);
  if (panel === "privacy") return screen("L04 · QUYỀN RIÊNG TƯ", "Mỗi mục đích có phạm vi riêng.", "Các lựa chọn đã đăng nhập được ghi thành sự kiện vào sổ đồng ý. Đồng ý chia sẻ không tự cấp quyền xem dữ liệu cho giáo viên.", <><div className="mcy-consent-card required"><span className="mcy-tag">BẮT BUỘC KHI ĐĂNG NHẬP</span><strong>Điều khoản dịch vụ · phiên bản 0.1</strong><p>{state.termsAccepted && state.privacyAccepted ? "Đã ghi lựa chọn điều khoản và quyền riêng tư cho tài khoản này." : "Chưa ghi nhận đồng ý trong tài khoản."} Nội dung sẽ được cập nhật khi chính sách chính thức được phê duyệt.</p></div><PrivacyToggle title="Dùng check-in với trợ lý AI" detail="Lựa chọn được lưu; AI chưa được kết nối ở giai đoạn này." value={state.aiConsent} onToggle={value => { void changeConsent("ai_processing", value, { aiConsent: value, usePreviousFeedback: false }); }} /><PrivacyToggle title="Lưu check-in trong hành trình" detail="Cho phép lưu check-in mới; phản hồi sau buổi được giữ trong phiên hiện tại." value={state.saveFeedbackConsent} onToggle={value => { void changeConsent("wellbeing_data", value, { saveFeedbackConsent: value, rememberPace: value ? state.rememberPace : false, usePreviousFeedback: false }); }} /><PrivacyToggle title="Đồng ý chia sẻ với giáo viên" detail="Mặc định tắt. Hiện chưa có lớp hoặc giáo viên được kết nối." value={state.teacherShareConsent} onToggle={value => { void changeConsent("teacher_sharing", value, { teacherShareConsent: value }); }} /><PrivacyToggle title="Tin nội dung và marketing" detail="Tách khỏi nhắc tập và thông báo dịch vụ." value={state.marketingConsent} onToggle={value => { void changeConsent("marketing", value, { marketingConsent: value }); }} />{error && <div className="mcy-form-error" role="alert">{error}</div>}<div className="mcy-policy-meta"><span>Điều khoản: phiên bản 0.1 · vi-VN</span><span>Quyền riêng tư: phiên bản 0.1 · vi-VN</span><span>Chưa có quyền giáo viên được cấp</span></div><AccountRow title="Mở cài đặt chia sẻ" detail="Xem phạm vi và trạng thái kết nối" onClick={() => flow.push(ROUTES.sharing)} /></>);
  if (panel === "sharing") return screen("L05 · CHIA SẺ DỮ LIỆU", "Bạn luôn chọn người nhận và phạm vi.", "Chia sẻ với giáo viên hiện chưa được kết nối trong tài khoản này. Mặc định chia sẻ đang tắt.", <><div className="mcy-empty large"><PersonIcon /><strong>Chưa có lớp được kết nối</strong><p>Khi có lớp được cấp quyền, bạn sẽ thấy rõ tên người nhận, dữ liệu được chia sẻ và thời hạn trước khi bật.</p></div><div className="mcy-consent-card"><strong>Nguyên tắc chia sẻ</strong><p>Không chia sẻ mặc định. Check-in, ghi chú và phản hồi chỉ được gửi khi bạn chọn đúng người nhận và phạm vi.</p></div><AccountRow title="Quyền riêng tư" detail="Rút đồng ý và xem các mục đích khác" onClick={() => flow.push(ROUTES.privacy)} /></>);
  if (panel === "security") return screen("L06 · BẢO MẬT", "Kiểm soát email và phiên đang mở.", "Xác minh lại email khi cần. Việc quản lý thiết bị và khôi phục danh tính luôn cần kiểm tra ở máy chủ.", <><div className="mcy-account-panel"><strong>Email đăng nhập</strong><p>{state.accountEmail || "Chưa đăng nhập"} · {state.signedIn ? "đã xác minh" : "chưa đăng nhập"}</p><button className="mcy-toggle" onClick={() => { update({ authMode: "login", authReturnTo: "security" }); flow.push(ROUTES.authEmail); }}>Đổi email có xác minh</button></div><div className="mcy-account-row static"><span><strong>Thiết bị này</strong><small>{state.signedIn ? "Phiên hiện tại" : "Chưa có phiên đăng nhập"}</small></span><span className="mcy-state-pill">{state.signedIn ? "HIỆN TẠI" : "KHÁCH"}</span></div><p className="mcy-inline-note">Nếu mất quyền truy cập email hoặc nghi có người dùng tài khoản, hãy liên hệ kênh hỗ trợ của MCY. Không tự gộp hai tài khoản.</p>{error && <div className="mcy-form-error subtle">{error}</div>}</>);
  if (panel === "notifications") return screen("L07 · THÔNG BÁO", "Nhắc tập theo lịch của bạn.", "Backend chưa gửi push hoặc email nhắc. Lựa chọn thông báo của tài khoản được lưu để dùng khi dịch vụ được triển khai.", <><PrivacyToggle title="Nhắc tập trong ứng dụng" detail="Múi giờ lấy từ thiết bị · lịch gửi chưa được cấu hình." value={state.notificationEnabled} onToggle={value => { void changeConsent("notifications", value, { notificationEnabled: value }); }} /><PrivacyToggle title="Email cập nhật nội dung" detail="Tùy chọn marketing; không ảnh hưởng email đăng nhập." value={state.emailUpdates} onToggle={value => { void changeConsent("marketing", value, { marketingConsent: value, emailUpdates: value }); }} />{error && <div className="mcy-form-error subtle" role="alert">{error}</div>}<div className="mcy-account-panel"><strong>Giờ yên lặng</strong><p>Chưa có lịch nhắc nào được gửi hoặc lên lịch.</p></div></>);
  if (panel === "access") return screen("L08 · QUYỀN NỘI DUNG", "Những gì đang mở cho bạn.", "Bạn chỉ thấy nội dung và quyền đã được cấp cho tài khoản này.", <><div className="mcy-access-card"><span className="mcy-tag">NỘI DUNG HIỆN CÓ</span><strong>Các buổi tập trong Khám phá</strong><p>Chọn một buổi, xem hướng dẫn và bắt đầu theo thời gian bạn có.</p></div><div className="mcy-empty large"><ReaderIcon /><strong>Chưa có khóa học hoặc giao dịch</strong><p>Hiện chưa có sản phẩm bán, ngày hết hạn hoặc quyền hỗ trợ đi kèm.</p></div><button className="mcy-quiet-link" onClick={() => flow.push(ROUTES.discover)}>Mở Khám phá</button></>);
  if (panel === "help") return screen("L09 · HỖ TRỢ", "Tìm hướng dẫn rõ ràng.", "Chọn một chủ đề để đọc hướng dẫn phù hợp. Các yêu cầu tài khoản và dữ liệu sẽ chỉ được tiếp nhận khi kênh hỗ trợ chính thức được kết nối.", <><label className="mcy-form-field">Tìm hướng dẫn<KeyboardInput aria-label="Tìm hướng dẫn" value={query} onChange={event => setQuery(event.target.value)} onBlur={() => keyboard.hide()} placeholder="Ví dụ: phản hồi sau tập" /></label><div className="mcy-help-results">{["Cách ghi nhận từng vùng cơ thể", "Nếu muốn dừng giữa buổi", "Cách xem và xóa một bản ghi", "AI dùng check-in trong phạm vi nào?"].filter(item => !query || item.toLocaleLowerCase("vi").includes(query.toLocaleLowerCase("vi"))).map(item => <AccountRow key={item} title={item} detail="Hướng dẫn sử dụng MCY · tiếng Việt" onClick={() => flow.push(ROUTES.discoverDetail)} />)}</div><div className="mcy-account-panel"><strong>Chưa có kênh gửi yêu cầu trong ứng dụng</strong><p>MCY không tạo ticket hoặc biên nhận khi dịch vụ hỗ trợ chưa được kết nối. Bạn sẽ thấy hướng dẫn liên hệ ngay khi kênh này sẵn sàng.</p></div>{error && <div className="mcy-form-error">{error}</div>}</>);
   return screen("L10 · HỖ TRỢ DỮ LIỆU", "Yêu cầu tài khoản sẽ được mở sau.", "Kênh gửi yêu cầu xuất hoặc xóa dữ liệu chưa được kết nối trong phiên này. Hãy xem hướng dẫn quyền riêng tư hoặc liên hệ kênh chính thức khi kênh đó sẵn sàng.", <><div className="mcy-empty large"><InfoCircledIcon /><strong>Chưa có kênh xử lý yêu cầu</strong><p>MCY chưa tạo file, ticket hoặc biên nhận trong ứng dụng. Không có thao tác dữ liệu nào được giả lập.</p></div><AccountRow title="Quyền riêng tư" detail="Xem phạm vi lưu và chia sẻ" onClick={() => flow.push(ROUTES.privacy)} /><AccountRow title="Hướng dẫn và hỗ trợ" detail="Đọc các hướng dẫn đang có" onClick={() => flow.push(ROUTES.help)} /> </>);
}

function PrivacyToggle({ title, detail, value, onToggle }: { title: string; detail: string; value: boolean; onToggle: (value: boolean) => void }) {
  return <div className="mcy-account-panel mcy-toggle-row"><span><strong>{title}</strong><small>{detail}</small></span><button aria-pressed={value} className={value ? "on" : ""} onClick={() => onToggle(!value)}><i>{value ? "✓" : ""}</i><span>{value ? "Bật" : "Tắt"}</span></button></div>;
}

function SyncScreen() {
  const flow = useFlow();
  const { state, update } = useDemo();
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
    <Eyebrow>L14 · {msg(locale, "sync.eyebrow")}</Eyebrow>
    <h1>{msg(locale, state.syncStatus === "failed" ? "sync.failedTitle" : "sync.savedTitle")}</h1>
    <p className="mcy-lead">{msg(locale, state.syncStatus === "failed" ? "sync.failedLead" : "sync.savedLead")}</p>
    <div className={`mcy-sync-card ${state.syncStatus}`}>
      <span className="mcy-state-pill">{msg(locale, state.syncStatus === "failed" ? "sync.errorPill" : state.saveFeedbackConsent ? "sync.savedHistoryPill" : "sync.savedTemporaryPill")}</span>
      <strong>{reflectionTitle}</strong><p>{reflectionDetail}</p>
    </div>
    {!state.saveFeedbackConsent && <p className="mcy-inline-note">{msg(locale, "sync.noConsent")}</p>}
    <Action secondary onClick={() => flow.replace(ROUTES.journey)}>{msg(locale, "sync.openJourney")}</Action>
    <button className="mcy-quiet-link" onClick={() => flow.replace(ROUTES.home)}>{msg(locale, "sync.done")}</button>
    <DemoNote>{msg(locale, "sync.note")}</DemoNote>
  </main></MobileScroll>;
}

function DiscoverDetailScreen() {
  return <MobileScroll className="mcy-scroll"><main className="mcy-page mcy-discover-detail"><Eyebrow>L13 · HƯỚNG DẪN SỬ DỤNG</Eyebrow><h1>Chọn một buổi theo điều bạn cần hôm nay.</h1><p className="mcy-lead">Một hướng dẫn ngắn để bạn dùng check-in, lựa chọn buổi và phản hồi sau khi thực hành.</p><div className="mcy-article-meta"><span>Người viết: nhóm nội dung MCY</span><span>Nguồn: hướng dẫn sử dụng MCY</span><span>Ngôn ngữ: Tiếng Việt</span></div><section className="mcy-article-body"><p>Check-in là điều bạn tự ghi nhận ở thời điểm hiện tại. Bạn có thể chọn từng vùng cơ thể, chọn mức phù hợp và bỏ qua vùng chưa muốn ghi. Check-in không thay cho chẩn đoán.</p><p>MCY dùng những gì bạn chủ động ghi nhận để sắp xếp lựa chọn trong ngày. Nếu chưa có buổi đã được xác nhận phù hợp, ứng dụng sẽ nói rõ thay vì tự đoán hoặc gọi một khoảng trống là tiến bộ.</p><p>Trong lúc thực hành, hãy theo nhịp của mình và dừng nếu bài tập không phù hợp. Sau đó, bạn có thể ghi riêng từng vùng là dễ chịu hơn, như cũ, khó chịu hơn, chưa rõ hoặc bỏ qua.</p></section><DemoNote>Nội dung hướng dẫn không phải tư vấn y tế. Hãy tìm hỗ trợ phù hợp tại nơi bạn đang ở nếu bạn thấy không ổn hoặc cần được chăm sóc.</DemoNote></main></MobileScroll>;
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
