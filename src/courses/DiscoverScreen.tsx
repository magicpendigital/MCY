import { useEffect, useRef, useState } from "react";
import { ArrowRightIcon, ChevronDownIcon, InfoCircledIcon } from "@radix-ui/react-icons";
import { formatMessage, msg, type AppLocale } from "../i18n";
import { MobileScroll } from "../mobile";
import type { FreeCourse, FreeCourseId } from "./freeCourses";
import { findLessons, formatLessonDuration, LESSON_AREAS, LESSON_LENGTHS, type LessonArea, type LessonLength } from "./lessonFinder";

type DiscoverScreenProps = {
  locale: AppLocale;
  onOpenCourse: (courseId: FreeCourseId, firstLessonId: string | null) => void;
  onOpenGuide: () => void;
};

function useFreeCourseCatalog() {
  const [courses, setCourses] = useState<FreeCourse[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    setFailed(false);
    void import("./freeCourses").then(({ FREE_COURSES }) => {
      if (active) setCourses(FREE_COURSES);
    }).catch(() => {
      if (active) setFailed(true);
    });
    return () => { active = false; };
  }, [attempt]);
  return { courses, failed, retry: () => setAttempt(value => value + 1) };
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <div className="mcy-eyebrow">{children}</div>;
}

function InfoNote({ children }: { children: React.ReactNode }) {
  return <p className="mcy-info-note"><InfoCircledIcon />{children}</p>;
}

function LessonFinder({ courses, onOpenCourse }: { courses: FreeCourse[]; onOpenCourse: DiscoverScreenProps["onOpenCourse"] }) {
  const [area, setArea] = useState<LessonArea | null>(null);
  const [length, setLength] = useState<LessonLength | null>(null);
  const results = area || length ? findLessons(courses, { area, length }) : [];
  const active = Boolean(area || length);
  return <section className="mcy-finder" aria-labelledby="mcy-finder-heading" data-testid="lesson-finder">
    <h2 id="mcy-finder-heading">Tìm nhanh một bài</h2>
    <p className="mcy-finder-lead">Chọn vùng bạn muốn xem và độ dài. Bài được xếp theo tên bài, không dựa trên check-in.</p>
    <div className="mcy-finder-chips" role="group" aria-label="Vùng cơ thể hoặc loại bài">{LESSON_AREAS.map(item => <button key={item.id} type="button" aria-pressed={area === item.id} onClick={() => setArea(area === item.id ? null : item.id)}>{item.label}</button>)}</div>
    <div className="mcy-finder-chips" role="group" aria-label="Độ dài bài">{LESSON_LENGTHS.map(item => <button key={item.id} type="button" aria-pressed={length === item.id} onClick={() => setLength(length === item.id ? null : item.id)}>{item.label}</button>)}</div>
    {active && <div className="mcy-finder-results" role="region" aria-live="polite" aria-label="Kết quả tìm nhanh">
      <p className="mcy-finder-count">{results.length ? `${results.length} bài phù hợp` : "Chưa có bài khớp lựa chọn này. Hãy bỏ bớt một lựa chọn."}</p>
      {results.map(({ courseId, courseTitle, lesson, seconds }) => <button key={lesson.id} type="button" className="mcy-finder-row" onClick={() => onOpenCourse(courseId, lesson.id)}><span className="mcy-finder-time">{formatLessonDuration(seconds)}</span><span><strong>{lesson.title}</strong><small>{courseTitle}</small></span><ArrowRightIcon aria-hidden="true" /></button>)}
      <button type="button" className="mcy-quiet-link" onClick={() => { setArea(null); setLength(null); }}>Xóa lựa chọn</button>
    </div>}
  </section>;
}

export default function DiscoverScreen({ locale, onOpenCourse, onOpenGuide }: DiscoverScreenProps) {
  const { courses, failed, retry } = useFreeCourseCatalog();
  const catalogMainRef = useRef<HTMLElement | null>(null);
  const [showCatalogScrollCue, setShowCatalogScrollCue] = useState(false);
  const lessonCount = courses?.reduce((total, course) => total + course.lessons.length, 0) ?? 0;

  useEffect(() => {
    const main = catalogMainRef.current;
    const scroll = main?.closest(".mobile-page")?.querySelector<HTMLDivElement>(".mobile-scroll");
    const content = scroll?.querySelector<HTMLElement>(".mobile-scroll-content");
    if (!scroll) return;

    const updateCue = () => {
      const maxScrollTop = Math.max(0, scroll.scrollHeight - scroll.clientHeight);
      const next = maxScrollTop > 2 && scroll.scrollTop < maxScrollTop - 2;
      setShowCatalogScrollCue(current => current === next ? current : next);
    };
    const resizeObserver = new ResizeObserver(updateCue);
    resizeObserver.observe(scroll);
    if (content) resizeObserver.observe(content);
    scroll.addEventListener("scroll", updateCue, { passive: true });
    updateCue();

    return () => {
      resizeObserver.disconnect();
      scroll.removeEventListener("scroll", updateCue);
    };
  }, [courses?.length, failed]);

  return <MobileScroll className="mcy-scroll"><main className="mcy-page mcy-discover-page" ref={catalogMainRef}>
    <Eyebrow>KHÁM PHÁ</Eyebrow><h1>Bài học yoga miễn phí</h1><p className="mcy-lead">Chọn một nhóm video từ kênh Một chút yoga. Mỗi bài được phát trong ứng dụng; bạn tự chọn thứ tự và nhịp tập phù hợp với mình.</p>
    {courses && <LessonFinder courses={courses} onOpenCourse={onOpenCourse} />}
    <section className="mcy-course-section" aria-labelledby="free-course-heading">
      <div className="mcy-course-heading"><div><Eyebrow>{msg(locale, "discover.freeCourses")}</Eyebrow><h2 id="free-course-heading">Chọn một nhóm để bắt đầu</h2></div><span className="mcy-state-pill">{locale === "en-US" ? `${lessonCount} VIDEOS` : `${lessonCount} BÀI HỌC`}</span></div>
      <p className="mcy-course-lead">{msg(locale, "discover.freeCoursesLead")}</p>
      {showCatalogScrollCue && <div className="mcy-catalog-scroll-cue" aria-hidden="true"><span>Cuộn xuống để xem ghi chú và cách chọn bài</span><ChevronDownIcon /></div>}
      <div className="mcy-course-catalog" data-testid="free-course-catalog">
        {courses ? courses.map(course => <button className="mcy-course-card" key={course.id} onClick={() => onOpenCourse(course.id, course.lessons[0]?.id ?? null)}><span className="mcy-course-card-index">{String(course.lessons.length).padStart(2, "0")}</span><span><strong>{course.title}</strong><small>{formatMessage(locale, "discover.courseLessons", { count: course.lessons.length })} · {msg(locale, "discover.youtubeLabel")}</small><em>{msg(locale, "discover.courseStatus")}</em></span><ArrowRightIcon /></button>)
          : <div className="mcy-inline-note" role={failed ? "alert" : "status"}>{failed ? (locale === "en-US" ? "The lesson library could not be loaded." : "Chưa mở được thư viện bài học.") : (locale === "en-US" ? "Opening the lesson library…" : "Đang mở thư viện bài học…")}</div>}
      </div>
      {failed && <button className="mcy-quiet-link" onClick={retry}>{locale === "en-US" ? "Try again" : "Thử tải lại"}</button>}
      <InfoNote>{msg(locale, "discover.courseNote")}</InfoNote>
    </section>
    <button className="mcy-account-row" onClick={onOpenGuide}><span><strong>Cách chọn bài học video</strong><small>Duyệt bài miễn phí và ghi lại cảm nhận</small></span><ArrowRightIcon /></button>
  </main></MobileScroll>;
}
