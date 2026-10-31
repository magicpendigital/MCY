import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRightIcon } from "@radix-ui/react-icons";
import { MobileScroll } from "../mobile";
import { readClassFeedback, readClassList, type ClassEnrollment, type ClassFeedback, type ClassList, type FeedbackRead } from "./classApi";
import "./my-classes.css";

const kindLabel = { session: "SAU MỘT BUỔI TẬP", course: "KẾT THÚC KHÓA" } as const;
const sourceLabel = { human: "Giảng viên viết", ai_assisted_teacher_confirmed: "AI hỗ trợ · giảng viên đã kiểm tra và xác nhận" } as const;
const sentDate = (iso: string) => { const date = new Date(iso); return Number.isNaN(date.getTime()) ? "" : date.toLocaleDateString("vi-VN", { day: "numeric", month: "numeric", year: "numeric" }); };

function FeedbackCard({ item }: { item: ClassFeedback }) {
  return <article className="mcy-mc-feedback" data-source={item.provenance}>
    <div className="mcy-mc-feedback-head"><span className="mcy-tag">{kindLabel[item.kind]}</span><span className="mcy-mc-source">{sourceLabel[item.provenance]}</span></div>
    <p className="mcy-mc-body">{item.body}</p>
    <small>Giảng viên gửi {sentDate(item.sentAt)}{item.revision > 1 ? ` · bản cập nhật ${item.revision}` : ""}</small>
  </article>;
}

// Learners only see feedback a teacher has sent. This screen never creates anything.
export default function MyClassesScreen({ userId }: { userId: string; active?: boolean }) {
  const [list, setList] = useState<ClassList | null>(null);
  const [selected, setSelected] = useState<{ enrollment: ClassEnrollment; index: number } | null>(null);
  const [detail, setDetail] = useState<FeedbackRead | null>(null);
  const [attempt, setAttempt] = useState(0);
  const main = useRef<HTMLElement | null>(null);
  const account = useRef(userId);
  account.current = userId;

  useEffect(() => {
    let current = true;
    setList(null);
    void readClassList(userId, attempt > 0).then(result => { if (current && account.current === userId) setList(result); });
    return () => { current = false; };
  }, [userId, attempt]);

  const open = useCallback((choice: { enrollment: ClassEnrollment; index: number } | null) => {
    setSelected(choice);
    setDetail(null);
    main.current?.closest(".mobile-page")?.querySelector<HTMLElement>(".mobile-scroll")?.scrollTo({ top: 0 });
    if (!choice) return;
    const actor = userId;
    void readClassFeedback(actor, choice.enrollment.id).then(result => { if (account.current === actor) setDetail(result); });
  }, [userId]);

  return <MobileScroll className="mcy-scroll"><main className="mcy-page mcy-mc-page" ref={main}>
    {selected ? <>
      <button className="mcy-mc-back" onClick={() => open(null)}>← Tất cả lớp</button>
      <div className="mcy-eyebrow">NHẬN XÉT TỪ GIẢNG VIÊN</div>
      <h1>Lớp {selected.index + 1}</h1>
      <p className="mcy-lead">{selected.enrollment.sessions} buổi đã ghi nhận · {selected.enrollment.completed ? "đã kết thúc khóa" : "đang học"}</p>
      {!detail && <p className="mcy-inline-note" role="status">Đang mở nhận xét…</p>}
      {detail?.status === "unavailable" && <div className="mcy-form-error" role="alert">Chưa tải được nhận xét. Hãy kiểm tra kết nối.<button className="mcy-quiet-link" onClick={() => open(selected)}>Thử lại</button></div>}
      {detail?.status === "denied" && <p className="mcy-inline-note" role="status">Máy chủ không còn xác nhận lớp này cho tài khoản của bạn.</p>}
      {detail?.status === "ok" && (detail.feedback.length === 0
        ? <p className="mcy-inline-note" role="status">Giảng viên chưa gửi nhận xét nào cho lớp này.</p>
        : <div className="mcy-mc-list">{detail.feedback.map(item => <FeedbackCard key={item.id} item={item} />)}</div>)}
      <p className="mcy-mc-footnote">Nhận xét chỉ để tham khảo, không thay lời khuyên y tế. Nếu đau, tê hoặc chóng mặt, hãy dừng và hỏi người có chuyên môn. Bạn có thể đối chiếu với cảm nhận của chính mình trong Hành trình.</p>
    </> : <>
      <div className="mcy-eyebrow">LỚP CỦA TÔI</div>
      <h1>Nhận xét từ giảng viên</h1>
      <p className="mcy-lead">Chỉ hiện những nhận xét giảng viên đã gửi cho bạn.</p>
      {!list && <p className="mcy-inline-note" role="status">Đang tải danh sách…</p>}
      {list?.status === "unavailable" && <div className="mcy-form-error" role="alert">Chưa tải được danh sách. Hãy kiểm tra kết nối.<button className="mcy-quiet-link" onClick={() => setAttempt(value => value + 1)}>Thử lại</button></div>}
      {list?.status === "denied" && <p className="mcy-inline-note" role="status">Tài khoản này chưa có lớp nào được kết nối.</p>}
      {list?.status === "allowed" && <div className="mcy-mc-list">{list.enrollments.map((enrollment, index) => <button key={enrollment.id} className="mcy-account-row mcy-mc-row" onClick={() => open({ enrollment, index })}>
        <span><strong>Lớp {index + 1}</strong><small>{enrollment.sessions} buổi đã ghi nhận · {enrollment.completed ? "đã kết thúc khóa" : "đang học"}</small></span><ArrowRightIcon />
      </button>)}</div>}
    </>}
  </main></MobileScroll>;
}
