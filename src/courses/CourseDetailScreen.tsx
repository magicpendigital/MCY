import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowDownIcon,
  InfoCircledIcon,
  PlayIcon,
} from "@radix-ui/react-icons";
import { formatMessage, msg, type AppLocale } from "../i18n";
import { MobileScroll } from "../mobile";
import type { FreeCourse, FreeCourseId } from "./freeCourses";
import { loadCatalog } from "./contentSnapshot";
import { LESSON_AREAS, LESSON_LENGTHS, lessonAreas, lessonLength } from "./lessonFinder";
import { isLessonCompleted, isLessonOpened, isLessonSaved, recordLessonOpened, recordLessonProgress, toggleSavedLesson, useLessonMemory } from "./lessonMemory";
import { trackPlayback } from "./youtubeProgress";
import { lessonThumbnailUrl } from "./lessonThumbnail";

type CourseDetailScreenProps = {
  locale: AppLocale;
  selectedCourseId: FreeCourseId | null;
  selectedLessonId: string | null;
  active: boolean;
  onSelectLesson: (lessonId: string) => void;
  onRecordReflection: (courseTitle: string, lessonTitle: string) => void;
};

// YouTube preview image for a lesson. Decorative: the lesson title next to it carries the meaning. Hidden if it cannot load.
function LessonThumb({ youtubeId }: { youtubeId: string }) {
  const [failed, setFailed] = useState(false);
  const url = lessonThumbnailUrl(youtubeId);
  if (!url || failed) return null;
  return <img className="mcy-thumb-img" src={url} alt="" loading="lazy" decoding="async" draggable={false} referrerPolicy="no-referrer" onError={() => setFailed(true)} />;
}

function Action({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return <button className="mcy-action" onClick={event => { event.currentTarget.blur(); onClick(); }}>{children}<ArrowRightIcon /></button>;
}

export default function CourseDetailScreen({
  locale,
  selectedCourseId,
  selectedLessonId,
  active,
  onSelectLesson,
  onRecordReflection,
}: CourseDetailScreenProps) {
  const [courses, setCourses] = useState<FreeCourse[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [playingLessonId, setPlayingLessonId] = useState<string | null>(null);
  const [playerReloadCount, setPlayerReloadCount] = useState(0);
  const [playerHelpOpen, setPlayerHelpOpen] = useState(false);
  const [playerStatus, setPlayerStatus] = useState<"idle" | "loading" | "frame-loaded" | "timeout">("idle");
  const featuredRef = useRef<HTMLElement | null>(null);
  const memory = useLessonMemory();
  // Playback progress comes from the YouTube player and stays on this device. "waiting" until the player first reports,
  // "unavailable" when the player API cannot be used; neither state blocks playback or the reflection button.
  const [trackingState, setTrackingState] = useState<"idle" | "waiting" | "active" | "unavailable">("idle");

  useEffect(() => {
    let mounted = true;
    setFailed(false);
    void loadCatalog().then(result => {
      if (mounted) setCourses(result.courses);
    }).catch(() => {
      if (mounted) setFailed(true);
    });
    return () => { mounted = false; };
  }, [attempt]);

  const playerOpen = active && playingLessonId !== null;
  useEffect(() => {
    if (!active) {
      setPlayingLessonId(null);
      setPlayerHelpOpen(false);
      setPlayerStatus("idle");
    }
  }, [active]);
  useEffect(() => {
    if (!playerOpen || playerStatus !== "loading") return;
    const timeout = window.setTimeout(() => {
      setPlayerStatus("timeout");
      setPlayerHelpOpen(true);
    }, 12_000);
    return () => window.clearTimeout(timeout);
  }, [playerOpen, playerReloadCount, playerStatus]);

  useEffect(() => {
    if (!courses || !playerOpen || playerStatus !== "frame-loaded" || playingLessonId === null) return;
    const course = courses.find(item => item.id === selectedCourseId) ?? courses[0];
    const frame = featuredRef.current?.querySelector<HTMLIFrameElement>("iframe");
    if (!course || !frame) return;
    const ref = { courseId: course.id, lessonId: playingLessonId };
    setTrackingState("waiting");
    const stop = trackPlayback(
      frame,
      progress => { recordLessonProgress(ref, progress); setTrackingState(current => current === "unavailable" ? current : "active"); },
      () => setTrackingState("unavailable"),
    );
    return () => { stop(); setTrackingState("idle"); };
  }, [courses, playerOpen, playerStatus, playingLessonId, playerReloadCount, selectedCourseId]);

  if (!courses) return <MobileScroll className="mcy-scroll"><main className="mcy-page"><div className="mcy-inline-note" role={failed ? "alert" : "status"}>{failed ? (locale === "en-US" ? "The lesson could not be loaded." : "Chưa mở được bài học.") : (locale === "en-US" ? "Opening the lesson…" : "Đang mở bài học…")}</div>{failed && <button className="mcy-quiet-link" onClick={() => setAttempt(value => value + 1)}>{locale === "en-US" ? "Try again" : "Thử tải lại"}</button>}</main></MobileScroll>;

  const course = courses.find(item => item.id === selectedCourseId) ?? courses[0];
  const lesson = course.lessons.find(item => item.id === selectedLessonId) ?? course.lessons[0];
  const lessonIndex = Math.max(0, course.lessons.findIndex(item => item.id === lesson.id));
  // Tags come from the lesson title and length only (same rules as the finder); they help scanning and are not a recommendation.
  const lessonTags = locale === "en-US" ? [] : [
    ...LESSON_AREAS.filter(area => lessonAreas(lesson, course.id).includes(area.id)).map(area => area.label),
    ...LESSON_LENGTHS.filter(length => lessonLength(lesson) === length.id).map(length => length.label),
  ];
  const isLessonPlayerOpen = playerOpen && playingLessonId === lesson.id;
  const lessonRef = { courseId: course.id, lessonId: lesson.id };
  const lessonSaved = isLessonSaved(memory, lessonRef);
  const lessonCompleted = isLessonCompleted(memory, lessonRef);
  const hasNextLesson = lessonIndex < course.lessons.length - 1;
  const reloadLessonPlayer = () => {
    setPlayerHelpOpen(false);
    setPlayerStatus("loading");
    setPlayerReloadCount(count => count + 1);
  };
  // The lesson list and the Previous/Next buttons can be far below the player, so after choosing another lesson bring its poster back into view.
  const scrollToVideo = () => {
    window.requestAnimationFrame(() => {
      const section = featuredRef.current;
      const scroller = section?.closest<HTMLElement>(".mobile-scroll");
      if (!section || !scroller) return;
      const top = section.getBoundingClientRect().top - scroller.getBoundingClientRect().top + scroller.scrollTop - 8;
      scroller.scrollTo({ top: Math.max(0, top), behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    });
  };
  const selectRelativeLesson = (offset: number) => {
    const nextLesson = course.lessons[lessonIndex + offset];
    if (!nextLesson) return;
    setPlayingLessonId(null);
    setPlayerHelpOpen(false);
    setPlayerStatus("idle");
    setPlayerReloadCount(0);
    onSelectLesson(nextLesson.id);
    scrollToVideo();
  };

  return <MobileScroll className="mcy-scroll"><main className="mcy-page mcy-course-detail-page">
    <div className="mcy-eyebrow">{msg(locale, "course.eyebrow")}</div>
    <h1>{course.title}</h1>
    <div className="mcy-course-detail-meta"><span>{formatMessage(locale, "discover.courseLessons", { count: course.lessons.length })}</span><span>{msg(locale, "discover.youtubeLabel")}</span><span>{locale === "en-US" ? "Channel · Một chút yoga" : "Kênh · Một chút yoga"}</span></div>
    {locale === "en-US" && <p className="mcy-locale-note">{msg(locale, "course.englishNote")}</p>}
    <section className="mcy-course-featured" ref={featuredRef} aria-label={locale === "en-US" ? "Selected lesson" : "Bài học đang chọn"}>
      <div className={`mcy-course-video mcy-course-video-${lesson.orientation}`} data-testid="course-video">
        {isLessonPlayerOpen && (lesson.visibility === "public" || lesson.visibility === "unlisted")
          ? <iframe key={`${lesson.id}-${playerReloadCount}`} data-load-attempt={playerReloadCount} title={lesson.title} src={`https://www.youtube-nocookie.com/embed/${lesson.youtubeId}?autoplay=1&playsinline=1&rel=0&modestbranding=1&fs=1&enablejsapi=1&origin=${encodeURIComponent(window.location.origin)}`} loading="eager" allow="accelerometer; autoplay; clipboard-write; encrypted-media; fullscreen; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" onLoad={() => { setPlayerStatus("frame-loaded"); setPlayerHelpOpen(false); }} allowFullScreen />
          : <button className="mcy-course-play" type="button" onClick={() => { setPlayerHelpOpen(false); setPlayerReloadCount(0); setPlayerStatus("loading"); setPlayingLessonId(lesson.id); recordLessonOpened(lessonRef); }} aria-label={`${locale === "en-US" ? "Play lesson" : "Phát bài học"}: ${lesson.title}`}>
            <div className="mcy-course-video-poster" aria-hidden="true"><LessonThumb key={lesson.id} youtubeId={lesson.youtubeId} /><span>{course.title}</span><strong>{lesson.title}</strong><small>{lesson.duration}</small></div>
            <span><PlayIcon />{locale === "en-US" ? "Play in app" : "Học ngay trong ứng dụng"}</span>
          </button>}
      </div>
      {lesson.byline && <p className="mcy-course-byline" data-testid="lesson-byline">{lesson.byline}</p>}
      <div className="mcy-course-player-feedback">
        {isLessonPlayerOpen && playerStatus !== "idle" && <p className="mcy-course-player-status" data-testid="course-player-status" data-state={playerStatus} role={playerStatus === "timeout" ? "alert" : "status"}>{msg(locale, playerStatus === "loading" ? "course.playerLoading" : playerStatus === "frame-loaded" ? "course.playerFrameLoaded" : "course.playerLoadFailed")}</p>}
        {isLessonPlayerOpen && <div className="mcy-course-player-recovery">
          <button className="mcy-course-player-help-trigger" type="button" aria-expanded={playerHelpOpen} aria-controls={`course-player-help-${lesson.id}`} onClick={() => setPlayerHelpOpen(open => !open)}>
            <InfoCircledIcon />{locale === "en-US" ? "Having trouble with the video?" : "Video gặp sự cố khi phát?"}
          </button>
          <div className="mcy-course-player-help" id={`course-player-help-${lesson.id}`} hidden={!playerHelpOpen}>
            <p>{locale === "en-US" ? "Try reloading the video here first. If it still does not play, you can open the original on YouTube." : "Bạn có thể tải lại video ngay trong ứng dụng. Nếu vẫn chưa phát được, hãy mở video gốc trên YouTube."}</p>
            <div>
              <button type="button" onClick={reloadLessonPlayer}>{locale === "en-US" ? "Reload in the app" : "Tải lại trong ứng dụng"}</button>
              <a href={`https://www.youtube.com/watch?v=${lesson.youtubeId}`} target="_blank" rel="noopener noreferrer">{locale === "en-US" ? "Open original on YouTube" : "Mở video gốc trên YouTube"}</a>
            </div>
          </div>
        </div>}
        <nav className="mcy-course-lesson-navigation" aria-label={msg(locale, "course.lessonNavigation")} data-testid="course-lesson-navigation">
          <span aria-live="polite">{formatMessage(locale, "course.selectedLessonPosition", { current: lessonIndex + 1, count: course.lessons.length })}</span>
          <button type="button" onClick={() => selectRelativeLesson(-1)} disabled={lessonIndex === 0}>
            <ArrowLeftIcon aria-hidden="true" />{msg(locale, "course.previousLesson")}
          </button>
          <button type="button" onClick={() => selectRelativeLesson(1)} disabled={lessonIndex >= course.lessons.length - 1}>
            {msg(locale, "course.nextLesson")}<ArrowRightIcon aria-hidden="true" />
          </button>
        </nav>
        {isLessonPlayerOpen && trackingState === "active" && <p className="mcy-course-tracking-note" data-testid="course-tracking-note">{locale === "en-US" ? "Playback progress is remembered on this device only." : "Tiến độ phát được ghi nhớ trên thiết bị này, không gửi đi."}</p>}
        {isLessonPlayerOpen && <div className="mcy-course-reflection-prompt" data-completed={lessonCompleted}>
          {lessonCompleted && <p className="mcy-course-complete" role="status" data-testid="course-complete">{locale === "en-US" ? "You have watched this lesson to the end." : "Bạn đã xem hết bài này."}</p>}
          <p>{lessonCompleted
            ? (locale === "en-US" ? "After you have practised, you can record your own reflection." : "Sau khi tự thực hành, hãy ghi lại cảm nhận của bạn.")
            : (locale === "en-US" ? "MCY has not recorded that you watched this video to the end: you may have watched part of it, or the player did not report progress. After you have practised, you can still record your own reflection." : "MCY chưa ghi nhận bạn xem hết video này: bạn có thể mới xem dở, hoặc trình phát không báo tiến độ về. Sau khi tự thực hành, bạn vẫn có thể ghi lại cảm nhận.")}</p>
          <Action onClick={() => onRecordReflection(course.title, lesson.title)}>{locale === "en-US" ? "I practised · record reflection" : "Tôi đã thực hành · ghi cảm nhận"}</Action>
          {lessonCompleted && hasNextLesson && <button type="button" className="mcy-quiet-link" onClick={() => selectRelativeLesson(1)}>{locale === "en-US" ? "Next lesson" : "Chọn bài tiếp theo"}</button>}
        </div>}
      </div>
      <div className="mcy-course-featured-copy"><span className="mcy-course-lesson-number">{locale === "en-US" ? `LESSON ${lessonIndex + 1} OF ${course.lessons.length}` : `BÀI ${lessonIndex + 1} / ${course.lessons.length}`} · {lesson.duration}</span><h2>{lesson.title}</h2>
        <button type="button" className="mcy-course-save" aria-pressed={lessonSaved} onClick={() => toggleSavedLesson(lessonRef)}>{lessonSaved ? (locale === "en-US" ? "Saved on this device" : "Đã lưu trên máy này") : (locale === "en-US" ? "Save this lesson" : "Lưu bài này")}</button>
        {lessonTags.length > 0 && <ul className="mcy-course-lesson-tags" aria-label="Nhãn theo tên bài">{lessonTags.map(tag => <li key={tag}>{tag}</li>)}</ul>}
        <p>{lesson.description}</p>
      </div>
      <p className="mcy-course-source-note" role="note"><InfoCircledIcon aria-hidden="true" focusable="false" /><span>{msg(locale, "course.sourceNote")} <a href={`https://policies.google.com/privacy?hl=${locale === "en-US" ? "en" : "vi"}`} target="_blank" rel="noopener noreferrer" referrerPolicy="no-referrer">{msg(locale, "course.privacyLink")}</a></span></p>
    </section>
    <p className="mcy-lead mcy-course-about">{course.description}</p>
    <section className="mcy-course-lessons" aria-labelledby="course-lessons-heading">
      <div className="mcy-course-lessons-heading"><h2 id="course-lessons-heading">{msg(locale, "course.lessonsHeading")}</h2><span>{formatMessage(locale, "course.lessonCount", { count: course.lessons.length })}</span></div>
      <div className="mcy-course-lesson-list">{course.lessons.map((item, index) => <button className={`mcy-course-lesson${item.id === lesson.id ? " active" : ""}`} key={item.id} type="button" aria-pressed={item.id === lesson.id} onClick={() => { setPlayingLessonId(null); setPlayerHelpOpen(false); setPlayerStatus("idle"); setPlayerReloadCount(0); onSelectLesson(item.id); scrollToVideo(); }}>
        <span className="mcy-course-lesson-icon" aria-hidden="true"><LessonThumb youtubeId={item.youtubeId} /><PlayIcon /></span>
        <span className="mcy-course-lesson-copy"><span className="mcy-course-lesson-number">{String(index + 1).padStart(2, "0")} · {item.duration}{isLessonSaved(memory, { courseId: course.id, lessonId: item.id }) ? (locale === "en-US" ? " · saved" : " · đã lưu") : ""}{isLessonCompleted(memory, { courseId: course.id, lessonId: item.id }) ? (locale === "en-US" ? " · watched" : " · đã xem hết") : isLessonOpened(memory, { courseId: course.id, lessonId: item.id }) ? (locale === "en-US" ? " · opened" : " · đã mở") : ""}</span><strong>{item.title}</strong></span><span className="mcy-course-lesson-select">{item.id === lesson.id ? <PlayIcon /> : <ArrowRightIcon />}</span>
      </button>)}</div>
    </section>
    {locale !== "en-US" && course.guidance && <section className="mcy-course-guidance" aria-labelledby="course-guidance-heading" data-testid="course-guidance">
      <h2 id="course-guidance-heading">Lợi ích và lưu ý</h2>
      {!course.guidance.reviewed && <p className="mcy-course-guidance-draft" role="note">Nội dung đang chờ chuyên gia yoga hoặc y tế duyệt. Hãy xem đây là gợi ý chung, không phải lời khuyên y tế.</p>}
      <h3>Lợi ích có thể có</h3>
      <ul>{course.guidance.benefits.map(item => <li key={item}>{item}</li>)}</ul>
      <h3>Chống chỉ định và lưu ý an toàn</h3>
      <ul>{course.guidance.cautions.map(item => <li key={item}>{item}</li>)}</ul>
    </section>}
  </main></MobileScroll>;
}
