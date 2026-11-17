import { useEffect, useState } from "react";
import { ArrowRightIcon, MagicWandIcon } from "@radix-ui/react-icons";
import { MobileScroll, useFlow } from "../../mobile";
import type { FreeCourseId } from "../../courses/freeCourses";
import { rememberedPace } from "../../practice/feedbackMemory";
import { useRoutes } from "../../app/navigation";
import { useDemo } from "../../app/state";
import { Action, DemoNote, Eyebrow } from "../../app/ui/controls";

function HomeQuickPicks() {
  const flow = useFlow();
  const routes = useRoutes();
  const { update } = useDemo();
  const [picks, setPicks] = useState<{ courseId: FreeCourseId; lessonId: string; title: string; courseTitle: string; time: string }[] | null>(null);
  useEffect(() => {
    let active = true;
    void Promise.all([import("../../courses/contentSnapshot"), import("../../courses/lessonFinder")]).then(async ([snapshot, finder]) => {
      const { courses } = await snapshot.loadCatalog();
      if (active) setPicks(finder.shortestLessons(courses, 3).map(item => ({ courseId: item.courseId, lessonId: item.lesson.id, title: item.lesson.title, courseTitle: item.courseTitle, time: finder.formatLessonDuration(item.seconds) })));
    }).catch(() => { if (active) setPicks([]); });
    return () => { active = false; };
  }, []);
  if (!picks?.length) return null;
  return <section className="mcy-quickpicks" aria-labelledby="quickpicks-heading" data-testid="home-quick-picks">
    <h2 id="quickpicks-heading">Bắt đầu nhẹ nhàng</h2>
    <p>Ba bài ngắn nhất trong thư viện, để làm quen trước khi chọn thêm.</p>
    {picks.map(item => <button key={item.lessonId} type="button" className="mcy-finder-row" onClick={() => { update({ selectedCourseId: item.courseId, selectedLessonId: item.lessonId }); flow.push(routes.courseDetail); }}><span className="mcy-finder-time">{item.time}</span><span><strong>{item.title}</strong><small>{item.courseTitle}</small></span><ArrowRightIcon aria-hidden="true" /></button>)}
    <button type="button" className="mcy-quiet-link" onClick={() => flow.push(routes.discover)}>Xem tất cả 38 bài</button>
  </section>;
}

export function HomeScreen() {
  const flow = useFlow();
  const routes = useRoutes();
  const { state } = useDemo();
  const previous = [...state.history].reverse().find(item => item.kind === "Sau tập");
  const paceMemory = rememberedPace(state.history, state.saveFeedbackConsent && state.rememberPace);
  return <MobileScroll className="mcy-scroll"><main className="mcy-page">
    <Eyebrow>{previous ? "MỘT LẦN QUAY LẠI, KHÔNG CẦN VỘI" : "MỖI BUỔI BẮT ĐẦU TỪ HÔM NAY"}</Eyebrow>
    <h1>{previous ? "Hôm nay bạn muốn bắt đầu thế nào?" : "Một chút thời gian cho chính mình."}</h1>
    <p className="mcy-lead">Chọn một bài ngắn bên dưới để bắt đầu ngay. Bạn không cần đăng nhập hay điền gì trước.</p>
    {paceMemory ? <div className="mcy-memory-hint"><MagicWandIcon /><span>Lần trước bạn nói nhịp hơi nhanh. Lần này bạn có thể chọn chậm hơn.</span></div> : null}
    <HomeQuickPicks />
    <div className="mcy-home-cta"><Action secondary onClick={() => flow.push(routes.checkin)}>{previous ? "Ghi nhận hôm nay" : "Bắt đầu check-in"}</Action><span>Tùy chọn · ghi nhận cơ thể trước hay sau khi tập đều được</span></div>
    <div className="mcy-home-photo"><img src="/assets/today-neck-stretch-1200.webp" srcSet="/assets/today-neck-stretch-600.webp 600w, /assets/today-neck-stretch-1200.webp 1200w" sizes="(min-width: 700px) 450px, 100vw" alt="Hình minh họa buổi tập yoga tại nhà" loading="lazy" decoding="async" /><span>Một bài học miễn phí, do bạn tự chọn</span></div>
    <div className="mcy-section-label">BẠN SẼ ĐI QUA</div>
    <div className="mcy-steps-list"><div><b>01</b><span>Chọn một bài ngắn<small>Xem video miễn phí ngay trong ứng dụng.</small></span></div><div><b>02</b><span>Tập theo nhịp của bạn<small>Dừng bất cứ lúc nào bạn thấy cần.</small></span></div><div><b>03</b><span>Ghi nhận nếu bạn muốn<small>Check-in và phản hồi sau buổi đều là tùy chọn.</small></span></div></div>
    <DemoNote>Khi đăng nhập, hồ sơ, lựa chọn quyền và check-in đã đồng ý lưu sẽ được kết nối với tài khoản của bạn.</DemoNote>
  </main></MobileScroll>;
}
