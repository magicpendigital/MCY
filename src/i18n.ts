import { viApp, enApp } from "./i18n/app";
import { viWelcome, enWelcome } from "./i18n/welcome";
import { viCheckin, enCheckin, regionLabels, energyLabels, levelLabels, sideLabels } from "./i18n/checkin";
import { viDialogue, enDialogue } from "./i18n/dialogue";
import { viReflection, enReflection } from "./i18n/reflection";
import { viJourney, enJourney } from "./i18n/journey";

export type AppLocale = "vi-VN" | "en-US";

const vi = {
  ...viApp,
  ...viWelcome,
  ...viCheckin,
  ...viDialogue,
  ...viReflection,
  ...viJourney,
  "discover.freeCourses": "TỪ KÊNH MỘT CHÚT YOGA",
  "discover.freeCoursesLead": "Mở một nhóm để xem danh sách bài, thời lượng và nội dung từng video.",
  "discover.youtubeLabel": "Miễn phí",
  "discover.courseLessons": "{count} bài học",
  "discover.courseStatus": "Xem danh sách bài",
  "discover.courseNote": "Video chỉ kết nối với YouTube khi bạn nhấn Phát. Việc phát trong ứng dụng vẫn tuân theo chính sách quyền riêng tư của Google.",
  "course.header": "Khóa học miễn phí",
  "course.eyebrow": "KHÓA HỌC MIỄN PHÍ · YOUTUBE",
  "course.unlistedStatus": "Video từ kênh YouTube",
  "course.unlistedTitle": "Bài học video miễn phí",
  "course.unlistedBody": "Bài học được phát từ kênh YouTube Một chút yoga ngay trong ứng dụng.",
  "course.openChannel": "Nguồn kênh YouTube",
  "course.englishNote": "English course copy is still limited; Vietnamese titles remain the canonical source copy for this course.",
  "course.scrollHint": "Cuộn xuống để xem video và phát trong ứng dụng.",
  "course.lessonsHeading": "Các bài học",
  "course.lessonCount": "{count} bài",
  "course.selectedLessonPosition": "Đang chọn bài {current} / {count}",
  "course.lessonNavigation": "Điều hướng video trong danh sách này",
  "course.previousLesson": "Video trước",
  "course.nextLesson": "Video tiếp theo",
  "course.sourceNote": "Ảnh xem trước được tải từ YouTube khi danh sách hiện ra. Nhấn Phát sẽ tải trình phát YouTube trong ứng dụng; việc xử lý dữ liệu tuân theo chính sách quyền riêng tư của Google.",
  "course.privacyLink": "Chính sách quyền riêng tư của Google",
  "course.playerLoading": "Đang tải khung video từ YouTube…",
  "course.playerFrameLoaded": "Trình phát YouTube đã mở trong ứng dụng. MCY ghi nhớ tiến độ phát trên thiết bị này, không gửi đi; nếu video không phát, hãy mở trợ giúp.",
  "course.playerLoadFailed": "Chưa nhận được phản hồi từ trình phát. Hãy thử tải lại trong ứng dụng hoặc mở video gốc trên YouTube.",
  "course.reflectionLesson": "Bài bạn đã thực hành:",
} as const;

const en: Record<keyof typeof vi, string> = {
  ...enApp,
  ...enWelcome,
  ...enCheckin,
  ...enDialogue,
  ...enReflection,
  ...enJourney,
  "discover.freeCourses": "FROM MỘT CHÚT YOGA",
  "discover.freeCoursesLead": "Open a group to browse its lessons, durations and video descriptions.",
  "discover.youtubeLabel": "Free",
  "discover.courseLessons": "{count} lessons",
  "discover.courseStatus": "View lesson list",
  "discover.courseNote": "YouTube connects only when you choose Play. In-app playback is still subject to Google's privacy policy.",
  "course.header": "Free course",
  "course.eyebrow": "FREE COURSE · YOUTUBE",
  "course.unlistedStatus": "Video from the YouTube channel",
  "course.unlistedTitle": "Free video lessons",
  "course.unlistedBody": "Lessons stream from the Một chút yoga YouTube channel inside the app.",
  "course.openChannel": "YouTube channel source",
  "course.englishNote": "English course copy is still limited; Vietnamese titles remain the canonical source copy for this course.",
  "course.scrollHint": "Scroll down to view and play this lesson in the app.",
  "course.lessonsHeading": "Lessons",
  "course.lessonCount": "{count} lessons",
  "course.selectedLessonPosition": "Selected video {current} of {count}",
  "course.lessonNavigation": "Navigate videos in this list",
  "course.previousLesson": "Previous video",
  "course.nextLesson": "Next video",
  "course.sourceNote": "Preview images load from YouTube when the list appears. Choosing Play loads YouTube's player in the app; data handling is covered by Google's Privacy Policy.",
  "course.privacyLink": "Google Privacy Policy",
  "course.playerLoading": "Loading the YouTube video frame…",
  "course.playerFrameLoaded": "The YouTube player is open in the app. MCY remembers playback progress on this device only. If the video does not play, open playback help.",
  "course.playerLoadFailed": "The player has not responded yet. Try reloading it in the app or open the original video on YouTube.",
  "course.reflectionLesson": "Lesson you practised:",
};

const messages = { "vi-VN": vi, "en-US": en } as const;
export type MessageKey = keyof typeof vi;

// Replacement texts from the published content snapshot. Only keys on the unlocked allow-list ever get here (contentSnapshot.ts
// checks that); every other text is locked in this file. Empty until a snapshot says otherwise, so the bundled text is the default.
let screenOverrides: Partial<Record<AppLocale, Record<string, string>>> = {};
export function setScreenOverrides(next: Partial<Record<AppLocale, Record<string, string>>>): void {
  screenOverrides = next;
}

export function msg(locale: AppLocale, key: MessageKey): string {
  const own = screenOverrides[locale];
  return (own && Object.prototype.hasOwnProperty.call(own, key) ? own[key] : undefined) ?? messages[locale][key];
}

export function regionLabel(locale: AppLocale, value: string): string {
  return regionLabels[locale][value] ?? value;
}

export function energyLabel(locale: AppLocale, value: string): string {
  return energyLabels[locale][value] ?? value;
}

const guidedChoiceLabels: Record<AppLocale, Record<string, string>> = {
  "vi-VN": { "Nhiều hướng dẫn": "Nhiều hướng dẫn", "Nhịp chậm": "Nhịp chậm", "Ít lời": "Ít lời", "Không nằm sàn": "Không nằm sàn", "Dễ chịu hơn": "Dễ chịu hơn", "Như cũ": "Như cũ", "Khó chịu hơn": "Khó chịu hơn", "Chưa rõ": "Chưa rõ", "Vừa": "Vừa", "Hơi nhanh": "Hơi nhanh", "Hơi chậm": "Hơi chậm" },
  "en-US": { "Nhiều hướng dẫn": "More guidance", "Nhịp chậm": "Slower pace", "Ít lời": "Fewer words", "Không nằm sàn": "No floor work", "Dễ chịu hơn": "Better", "Như cũ": "Unchanged", "Khó chịu hơn": "Worse", "Chưa rõ": "Unsure", "Vừa": "About right", "Hơi nhanh": "A little fast", "Hơi chậm": "A little slow" },
};

export function bodyLevelLabel(locale: AppLocale, value: string): string {
  return levelLabels[locale][value] ?? value;
}

export function sideLabel(locale: AppLocale, value: string): string {
  return sideLabels[locale][value] ?? value;
}

export function guidedChoiceLabel(locale: AppLocale, value: string): string {
  return guidedChoiceLabels[locale][value] ?? value;
}

export function formatMessage(locale: AppLocale, key: MessageKey, values: Record<string, string | number>): string {
  return msg(locale, key).replace(/\{(\w+)\}/g, (_, name: string) => String(values[name] ?? ""));
}

export function localizedNumber(locale: AppLocale, value: number): string {
  return new Intl.NumberFormat(locale).format(value);
}
