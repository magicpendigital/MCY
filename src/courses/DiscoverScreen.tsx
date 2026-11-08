import { Fragment, useEffect, useRef, useState } from "react";
import { ArrowRightIcon, ChevronDownIcon, InfoCircledIcon } from "@radix-ui/react-icons";
import { formatMessage, msg, type AppLocale } from "../i18n";
import { MobileScroll } from "../mobile";
import type { FreeCourse, FreeCourseId } from "./freeCourses";
import { loadCatalog, type Catalog, type EditorsPick } from "./contentSnapshot";
import { areasForRegions, findLessons, formatLessonDuration, LESSON_AREAS, LESSON_LENGTHS, type LessonArea, type LessonLength } from "./lessonFinder";
import { clearLessonMemory, useLessonMemory, type LessonRef } from "./lessonMemory";
import { readReadingManifest, type ManifestUnit } from "../library/readingLibraryApi";
import "../library/reading-learner.css";

type DiscoverScreenProps = {
  locale: AppLocale;
  onOpenCourse: (courseId: FreeCourseId, firstLessonId: string | null) => void;
  onOpenGuide: () => void;
  /** Opens one illustrated reading unit, or the whole list when null. Omit to hide the section. */
  onOpenReading?: (entry: ManifestUnit | null) => void;
  /** Regions from the learner's current check-in; only used to offer a one-tap shortcut into the finder. */
  checkinRegions?: readonly string[];
};

const bundledDisplay: Catalog["display"] = { order: ["quick_find", "video_groups", "reading"], picks: [], showTeacherNames: true, aiImageLabel: true };
function useFreeCourseCatalog() {
  const [courses, setCourses] = useState<FreeCourse[] | null>(null);
  const [display, setDisplay] = useState<Catalog["display"]>(bundledDisplay);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    setFailed(false);
    void loadCatalog().then(result => {
      if (active) { setCourses(result.courses); setDisplay(result.display); }
    }).catch(() => {
      if (active) setFailed(true);
    });
    return () => { active = false; };
  }, [attempt]);
  return { courses, display, failed, retry: () => setAttempt(value => value + 1) };
}

// Illustrated reading units a reviewer has switched on. Nothing shows until the public manifest lists at least one.
function ReadingEntry({ onOpen }: { onOpen: (entry: ManifestUnit | null) => void }) {
  const [units, setUnits] = useState<ManifestUnit[]>([]);
  useEffect(() => {
    let active = true;
    void readReadingManifest().then(result => { if (active && result.status === "ok") setUnits(result.units); });
    return () => { active = false; };
  }, []);
  if (units.length === 0) return null;
  const shown = units.slice(0, 2);
  return <section className="mcy-rl-section" aria-labelledby="mcy-reading-heading" data-testid="reading-entry">
    <Eyebrow>ĐỌC THÊM</Eyebrow>
    <h2 id="mcy-reading-heading">Bài đọc có hình</h2>
    <p className="mcy-finder-lead">Đọc từng bước để hiểu thêm về tư thế. Không thay cho video và người hướng dẫn trực tiếp.</p>
    <div className="mcy-rl-list">
      {shown.map(entry => <button key={entry.id} type="button" className="mcy-rl-row" onClick={() => onOpen(entry)}><span><span className={`mcy-rl-badge ${entry.images === "none" ? "text" : "image"}`}>{entry.images === "none" ? "CHỈ CHỮ" : entry.images === "partial" ? "MỘT PHẦN CÓ HÌNH" : "CÓ HÌNH"}</span><strong>{entry.title}</strong><small>{entry.steps} bước</small></span><ArrowRightIcon aria-hidden="true" /></button>)}
      {units.length > shown.length && <button type="button" className="mcy-rl-row" onClick={() => onOpen(null)}><span><strong>Xem tất cả {units.length} bài đọc</strong></span><ArrowRightIcon aria-hidden="true" /></button>}
    </div>
  </section>;
}

function EditorsChoice({ picks, onOpenCourse }: { picks: EditorsPick[]; onOpenCourse: DiscoverScreenProps["onOpenCourse"] }) {
  return <section className="mcy-editors-choice" aria-labelledby="mcy-editors-heading" data-testid="editors-choice">
    <Eyebrow>LỰA CHỌN CỦA BIÊN TẬP</Eyebrow>
    <h2 id="mcy-editors-heading">Gợi ý từ biên tập</h2>
    <div className="mcy-rl-list">
      {picks.map(pick => <button key={`${pick.courseId}:${pick.lessonId ?? ""}`} type="button" className="mcy-rl-row" onClick={() => onOpenCourse(pick.courseId, pick.lessonId)}><span><strong>{pick.title}</strong><small>{pick.byline ?? pick.subtitle}</small></span><ArrowRightIcon aria-hidden="true" /></button>)}
    </div>
  </section>;
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <div className="mcy-eyebrow">{children}</div>;
}

function InfoNote({ children }: { children: React.ReactNode }) {
  return <p className="mcy-info-note"><InfoCircledIcon />{children}</p>;
}

function LessonFinder({ courses, onOpenCourse, checkinRegions = [] }: { courses: FreeCourse[]; onOpenCourse: DiscoverScreenProps["onOpenCourse"]; checkinRegions?: readonly string[] }) {
  const [area, setArea] = useState<LessonArea | null>(null);
  const [length, setLength] = useState<LessonLength | null>(null);
  const results = area || length ? findLessons(courses, { area, length }) : [];
  const active = Boolean(area || length);
  const suggested = areasForRegions(checkinRegions);
  const suggestedAreas = LESSON_AREAS.filter(item => suggested.includes(item.id));
  return <section className="mcy-finder" aria-labelledby="mcy-finder-heading" data-testid="lesson-finder">
    <h2 id="mcy-finder-heading">Tìm nhanh một bài</h2>
    <p className="mcy-finder-lead">Chọn vùng bạn muốn xem và độ dài. Bài được xếp theo tên bài, không dựa trên check-in.</p>
    {!area && suggestedAreas.length > 0 && <div className="mcy-finder-suggest" data-testid="finder-checkin-suggestion"><p>Bạn vừa ghi nhận vùng liên quan. Bạn muốn xem bài theo nhãn nào?</p><div className="mcy-finder-chips">{suggestedAreas.map(item => <button key={item.id} type="button" onClick={() => setArea(item.id)}>{`Xem bài: ${item.label}`}</button>)}</div></div>}
    <div className="mcy-finder-chips" role="group" aria-label="Vùng cơ thể hoặc loại bài">{LESSON_AREAS.map(item => <button key={item.id} type="button" aria-pressed={area === item.id} onClick={() => setArea(area === item.id ? null : item.id)}>{item.label}</button>)}</div>
    <div className="mcy-finder-chips" role="group" aria-label="Độ dài bài">{LESSON_LENGTHS.map(item => <button key={item.id} type="button" aria-pressed={length === item.id} onClick={() => setLength(length === item.id ? null : item.id)}>{item.label}</button>)}</div>
    {active && <div className="mcy-finder-results" role="region" aria-live="polite" aria-label="Kết quả tìm nhanh">
      <p className="mcy-finder-count">{results.length ? `${results.length} bài phù hợp` : "Chưa có bài khớp lựa chọn này. Hãy bỏ bớt một lựa chọn."}</p>
      {results.map(({ courseId, courseTitle, lesson, seconds }) => <button key={lesson.id} type="button" className="mcy-finder-row" onClick={() => onOpenCourse(courseId, lesson.id)}><span className="mcy-finder-time">{formatLessonDuration(seconds)}</span><span><strong>{lesson.title}</strong><small>{courseTitle}</small></span><ArrowRightIcon aria-hidden="true" /></button>)}
      <button type="button" className="mcy-quiet-link" onClick={() => { setArea(null); setLength(null); }}>Xóa lựa chọn</button>
    </div>}
  </section>;
}

// The most recently opened lesson and the learner's saved lessons. Device-local only; "opened" is not "watched".
function MyLessons({ courses, onOpenCourse }: { courses: FreeCourse[]; onOpenCourse: DiscoverScreenProps["onOpenCourse"] }) {
  const memory = useLessonMemory();
  const find = (ref: LessonRef) => {
    const course = courses.find(item => item.id === ref.courseId);
    const lesson = course?.lessons.find(item => item.id === ref.lessonId);
    return course && lesson ? { course, lesson } : null;
  };
  const last = memory.last ? find(memory.last) : null;
  const saved = memory.saved.map(find).filter((item): item is NonNullable<ReturnType<typeof find>> => item !== null).slice(0, 5);
  if (!last && saved.length === 0) return null;
  return <section className="mcy-finder mcy-my-lessons" aria-labelledby="mcy-my-lessons-heading" data-testid="my-lessons">
    <h2 id="mcy-my-lessons-heading">Của bạn trên máy này</h2>
    <div className="mcy-finder-results">
      {last && <button type="button" className="mcy-finder-row" onClick={() => onOpenCourse(last.course.id as FreeCourseId, last.lesson.id)}><span className="mcy-finder-time">Gần đây</span><span><strong>{last.lesson.title}</strong><small>Bài bạn mở gần nhất · {last.course.title}</small></span><ArrowRightIcon aria-hidden="true" /></button>}
      {saved.map(({ course, lesson }) => <button key={`${course.id}:${lesson.id}`} type="button" className="mcy-finder-row" onClick={() => onOpenCourse(course.id as FreeCourseId, lesson.id)}><span className="mcy-finder-time">Đã lưu</span><span><strong>{lesson.title}</strong><small>{course.title}</small></span><ArrowRightIcon aria-hidden="true" /></button>)}
    </div>
    <p className="mcy-finder-lead">Chỉ lưu trên thiết bị này, không gửi đi. “Mở” nghĩa là bạn đã nhấn Phát; MCY không biết bạn có xem hết hay không.</p>
    <button type="button" className="mcy-quiet-link" onClick={clearLessonMemory}>Xóa danh sách này khỏi máy</button>
  </section>;
}

export default function DiscoverScreen({ locale, onOpenCourse, onOpenGuide, onOpenReading, checkinRegions }: DiscoverScreenProps) {
  const { courses, display, failed, retry } = useFreeCourseCatalog();
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

  const blocks: Record<string, React.ReactNode> = {
    editors_choice: display.picks.length > 0 ? <EditorsChoice picks={display.picks} onOpenCourse={onOpenCourse} /> : null,
    quick_find: <>
    {courses && <MyLessons courses={courses} onOpenCourse={onOpenCourse} />}
    {courses && <LessonFinder courses={courses} onOpenCourse={onOpenCourse} checkinRegions={checkinRegions} />}
    </>,
    video_groups: <>
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
    </>,
    reading: <>{onOpenReading && <ReadingEntry onOpen={onOpenReading} />}</>,
  };

  return <MobileScroll className="mcy-scroll"><main className="mcy-page mcy-discover-page" ref={catalogMainRef}>
    <Eyebrow>KHÁM PHÁ</Eyebrow><h1>Bài học yoga miễn phí</h1><p className="mcy-lead">Chọn một nhóm video từ kênh Một chút yoga. Mỗi bài được phát trong ứng dụng; bạn tự chọn thứ tự và nhịp tập phù hợp với mình.</p>
    {display.order.map(id => <Fragment key={id}>{blocks[id]}</Fragment>)}
    <button className="mcy-account-row" onClick={onOpenGuide}><span><strong>Cách chọn bài học video</strong><small>Duyệt bài miễn phí và ghi lại cảm nhận</small></span><ArrowRightIcon /></button>
  </main></MobileScroll>;
}
