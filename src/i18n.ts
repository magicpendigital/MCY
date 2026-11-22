import { viApp, enApp } from "./i18n/app";
import { viWelcome, enWelcome } from "./i18n/welcome";
import { viCheckin, enCheckin, regionLabels, energyLabels, levelLabels, sideLabels } from "./i18n/checkin";
import { viDialogue, enDialogue } from "./i18n/dialogue";
import { viReflection, enReflection } from "./i18n/reflection";

export type AppLocale = "vi-VN" | "en-US";

const vi = {
  ...viApp,
  ...viWelcome,
  ...viCheckin,
  ...viDialogue,
  ...viReflection,
  "journey.title": "Hành trình của bạn",
  "journey.lead": "Nhìn lại cảm nhận qua từng lần ghi. Mỗi mốc là điều bạn đã chọn tại thời điểm đó.",
  "journey.days7": "7 ngày",
  "journey.days30": "30 ngày",
  "journey.timelineRecent": "Các mốc có ghi nhận · mới nhất trước",
  "journey.timelineChoose": "Chọn ngày để xem lại",
  "journey.latest": "Đến gần nhất",
  "journey.month": "THÁNG {month}",
  "journey.recordCount": "{count} lần ghi",
  "journey.noRecord": "Chưa ghi",
  "journey.accountRecord": "ĐÃ LƯU TRÊN TÀI KHOẢN",
  "journey.sessionRecord": "BẢN GHI TRONG PHIÊN",
  "journey.noRecordForDay": "Chưa có ghi nhận",
  "journey.sameDayEntries": "Các lần ghi trong ngày",
  "journey.noneNow": "Bạn đã ghi nhận không thấy khó chịu tại thời điểm này.",
  "journey.unsure": "Bạn đã chọn chưa rõ.",
  "journey.skipped": "Bạn đã bỏ qua phần ghi nhận cơ thể ở mốc này.",
  "journey.tired": "Bạn đã ghi nhận cảm thấy mệt tại thời điểm này.",
  "journey.uncomfortable": "Bạn đã ghi nhận cảm thấy khó chịu tại thời điểm này.",
  "journey.noLevel": "Chưa có mức cảm nhận cho bản ghi này.",
  "journey.hasNote": "Có ghi chú",
  "journey.overall": "Cảm nhận chung sau buổi:",
  "journey.endedEarly": "Buổi tập đã dừng sớm.",
  "journey.deleteEntry": "Xóa bản ghi này",
  "journey.emptyDay": "Ngày này chưa có ghi nhận. Không thể suy ra tình trạng từ ngày trước.",
  "journey.compareOpen": "So với lần khác",
  "journey.compareClose": "Đóng so sánh",
  "journey.compareTitle": "So hai lần ghi",
  "journey.compareLead": "So các mức do bạn tự ghi, không suy ra phần trăm cải thiện. “Chưa ghi” không phải mức 0.",
  "journey.markerA": "MỐC A",
  "journey.markerB": "MỐC B",
  "journey.chooseMarker": "Chọn mốc",
  "journey.compareHelp": "Hãy chọn hai lần check-in, hai phản hồi cùng loại, hoặc trước và sau cùng một ngày.",
  "journey.otherSide": "Khác bên",
  "journey.trendTitle": "Nhìn theo từng vùng",
  "journey.trendLead": "Các mức được ghi ở lần check-in hoặc ghi riêng. Phản hồi sau tập được xem cùng bản ghi của buổi đó.",
  "journey.chooseRegionTrend": "Chọn vùng xem theo thời gian",
  "journey.noRegionLevels": "Chưa có mức được ghi cho vùng này.",
  "journey.trendNotEnough": "Chưa đủ lần ghi để nói về xu hướng.",
  "journey.trendGaps": "Các ngày thiếu dữ liệu vẫn là khoảng trống, không được ước tính.",
  "journey.emptyTitle": "Chưa có bản ghi nào",
  "journey.emptyLead": "Bản ghi đầu tiên sẽ xuất hiện ở đây sau khi bạn hoàn tất một lần check-in.",
  "journey.nextCheckin": "Thử lần quay lại tiếp theo",
  "journey.note": "Ngày chưa ghi vẫn giữ nguyên khoảng trống. MCY không tự ước tính hoặc gọi đó là tiến bộ.",
  "journey.detail": "Chi tiết vùng",
  "journey.currentRecord": "Bản ghi đang xem",
  "journey.noNote": "Không có ghi chú riêng cho vùng này.",
  "journey.editObservation": "Sửa ghi nhận vùng này",
  "journey.regionNotRecorded": "Vùng này chưa được ghi tại thời điểm đang xem.",
  "journey.chooseCompareMarker": "Chọn mốc {marker}",
  "journey.deleteTitle": "Xóa bản ghi?",
  "journey.deleteRemote": "Xóa check-in khỏi tài khoản và lịch sử trên server.",
  "journey.deleteLocal": "Bản ghi sẽ biến mất khỏi hành trình trong phiên này.",
  "journey.deleting": "Đang xóa…",
  "journey.deleteAction": "Xóa bản ghi",
  "journey.keepEntry": "Giữ bản ghi",
  "journey.kind.before": "Trước tập",
  "journey.kind.after": "Sau tập",
  "journey.kind.private": "Ghi riêng",
  "journey.noDiscomfortStatus": "Không khó chịu",
  "journey.navLabel": "Điều hướng chính",
  "journey.nav.today": "Hôm nay",
  "journey.nav.journey": "Hành trình",
  "journey.nav.discover": "Khám phá",
  "journey.nav.profile": "Cá nhân",
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
  "journey.title": "Your Journey",
  "journey.lead": "Look back at what you recorded. Each entry reflects what you chose at that time.",
  "journey.days7": "7 days",
  "journey.days30": "30 days",
  "journey.timelineRecent": "Recorded entries · newest first",
  "journey.timelineChoose": "Choose a day to review",
  "journey.latest": "Go to latest",
  "journey.month": "MONTH {month}",
  "journey.recordCount": "{count} entries",
  "journey.noRecord": "No entry",
  "journey.accountRecord": "SAVED TO ACCOUNT",
  "journey.sessionRecord": "IN THIS SESSION",
  "journey.noRecordForDay": "No entry recorded",
  "journey.sameDayEntries": "Entries from this day",
  "journey.noneNow": "You recorded no discomfort at this time.",
  "journey.unsure": "You marked this as unsure.",
  "journey.skipped": "You skipped the body check-in for this entry.",
  "journey.tired": "You recorded feeling tired at this time.",
  "journey.uncomfortable": "You recorded feeling uncomfortable at this time.",
  "journey.noLevel": "No feeling level was recorded for this entry.",
  "journey.hasNote": "Note added",
  "journey.overall": "Overall feeling after practice:",
  "journey.endedEarly": "Practice stopped early.",
  "journey.deleteEntry": "Delete this entry",
  "journey.emptyDay": "No entry was recorded on this day. A previous day cannot fill in the gap.",
  "journey.compareOpen": "Compare with another entry",
  "journey.compareClose": "Close comparison",
  "journey.compareTitle": "Compare two entries",
  "journey.compareLead": "Compare the levels you recorded. No improvement percentage is inferred. “Not recorded” is not zero.",
  "journey.markerA": "ENTRY A",
  "journey.markerB": "ENTRY B",
  "journey.chooseMarker": "Choose entry",
  "journey.compareHelp": "Choose two check-ins, two reflections of the same type, or before and after entries from one day.",
  "journey.otherSide": "Different side",
  "journey.trendTitle": "By body area",
  "journey.trendLead": "Levels come from a check-in or a separate entry. Post-practice reflections stay with the entry for that session.",
  "journey.chooseRegionTrend": "Choose an area to view over time",
  "journey.noRegionLevels": "No level has been recorded for this area.",
  "journey.trendNotEnough": "There are not enough entries to describe a trend.",
  "journey.trendGaps": "Missing days remain gaps; no values are estimated.",
  "journey.emptyTitle": "No entries yet",
  "journey.emptyLead": "Your first entry will appear here after you complete a check-in.",
  "journey.nextCheckin": "Start another check-in",
  "journey.note": "Unrecorded days remain gaps. MCY does not estimate them or call them progress.",
  "journey.detail": "Area details",
  "journey.currentRecord": "Entry being viewed",
  "journey.noNote": "No separate note for this area.",
  "journey.editObservation": "Edit this area entry",
  "journey.regionNotRecorded": "This area was not recorded at the selected time.",
  "journey.chooseCompareMarker": "Choose entry {marker}",
  "journey.deleteTitle": "Delete this entry?",
  "journey.deleteRemote": "Delete this check-in from your account and server history.",
  "journey.deleteLocal": "This entry will be removed from the journey in this session.",
  "journey.deleting": "Deleting…",
  "journey.deleteAction": "Delete entry",
  "journey.keepEntry": "Keep entry",
  "journey.kind.before": "Before practice",
  "journey.kind.after": "After practice",
  "journey.kind.private": "Personal note",
  "journey.noDiscomfortStatus": "No discomfort",
  "journey.navLabel": "Main navigation",
  "journey.nav.today": "Today",
  "journey.nav.journey": "Journey",
  "journey.nav.discover": "Explore",
  "journey.nav.profile": "Profile",
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
