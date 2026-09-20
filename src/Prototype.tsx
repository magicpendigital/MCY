import { createContext, useContext, useMemo, useState } from "react";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  BarChartIcon,
  CalendarIcon,
  CheckCircledIcon,
  CheckIcon,
  Cross1Icon,
  DotFilledIcon,
  HeartIcon,
  HomeIcon,
  InfoCircledIcon,
  LightningBoltIcon,
  MagicWandIcon,
  PauseIcon,
  PersonIcon,
  PlayIcon,
  ReaderIcon,
  StarFilledIcon,
} from "@radix-ui/react-icons";
import { FlowStack, KeyboardTextarea, MobileScroll, type FlowScreen, useFlow } from "./mobile";

type Focus = "Cổ & vai" | "Lưng trên" | "Lưng dưới";
type MessageKind = "teacher" | "ai";
const safeAreaHeader = () => <div aria-hidden="true" />;

const ROUTES: Record<string, FlowScreen> = {
  welcome: { id: "welcome", header: safeAreaHeader, headerHeight: 0, render: () => <WelcomeScreen /> },
  checkin: { id: "checkin", header: safeAreaHeader, headerHeight: 0, render: () => <CheckinScreen />, footer: () => <BottomNav />, footerHeight: 70 },
  today: { id: "today", header: safeAreaHeader, headerHeight: 0, render: () => <TodayScreen />, footer: () => <BottomNav />, footerHeight: 70 },
  practice: { id: "practice", header: safeAreaHeader, headerHeight: 0, render: () => <PracticeScreen /> },
  reflection: { id: "reflection", header: safeAreaHeader, headerHeight: 0, render: () => <ReflectionScreen />, footer: () => <BottomNav />, footerHeight: 70 },
  progress: { id: "progress", header: safeAreaHeader, headerHeight: 0, render: () => <ProgressScreen />, footer: () => <BottomNav />, footerHeight: 70 },
  message: { id: "message", header: safeAreaHeader, headerHeight: 0, render: () => <MessageScreen /> },
  plans: { id: "plans", header: safeAreaHeader, headerHeight: 0, render: () => <PlansScreen /> },
  teacher: { id: "teacher", header: safeAreaHeader, headerHeight: 0, render: () => <TeacherStudio /> },
};

export default function Prototype() {
  const [focus, setFocus] = useState<Focus>("Cổ & vai");
  const [energy, setEnergy] = useState("Bình thường");
  const [note, setNote] = useState("");
  const [reflectionSaved, setReflectionSaved] = useState(false);
  const [messageKind, setMessageKind] = useState<MessageKind>("teacher");
  const [teacherNote, setTeacherNote] = useState(
    "Trong những buổi vừa rồi, bạn đã chủ động chọn biến thể phù hợp và bình tĩnh hơn khi chuyển động. Cảm ơn bạn vì đã kiên nhẫn với cơ thể mình.",
  );
  const [teacherSent, setTeacherSent] = useState(false);

  const app = useMemo(
    () => ({
      focus, setFocus, energy, setEnergy, note, setNote, reflectionSaved,
      setReflectionSaved, messageKind, setMessageKind, teacherNote, setTeacherNote,
      teacherSent, setTeacherSent,
    }),
    [energy, focus, messageKind, note, reflectionSaved, teacherNote, teacherSent],
  );

  return <YogaAppContext.Provider value={app}><FlowStack initial={ROUTES.welcome} /></YogaAppContext.Provider>;
}

type YogaApp = {
  focus: Focus;
  setFocus: (focus: Focus) => void;
  energy: string;
  setEnergy: (energy: string) => void;
  note: string;
  setNote: (note: string) => void;
  reflectionSaved: boolean;
  setReflectionSaved: (saved: boolean) => void;
  messageKind: MessageKind;
  setMessageKind: (kind: MessageKind) => void;
  teacherNote: string;
  setTeacherNote: (note: string) => void;
  teacherSent: boolean;
  setTeacherSent: (sent: boolean) => void;
};

const YogaAppContext = createContext<YogaApp | null>(null);

function useYogaApp() {
  const app = useContext(YogaAppContext);
  if (!app) throw new Error("Yoga app context is missing");
  return app;
}

function Brand({ compact = false }: { compact?: boolean }) {
  return <div className={compact ? "brand brand-compact" : "brand"} aria-label="Một chút Yoga"><span className="brand-mark"><HeartIcon /></span><span>Một chút Yoga</span></div>;
}

function Topbar({ title, action }: { title?: string; action?: React.ReactNode }) {
  const flow = useFlow();
  return <div className="topbar"><button className="icon-button" aria-label="Quay lại" onClick={() => flow.pop()}><ArrowLeftIcon /></button>{title ? <div className="topbar-title">{title}</div> : <Brand compact />}<div className="topbar-action">{action}</div></div>;
}

function PrimaryButton({ children, onClick, className = "" }: { children: React.ReactNode; onClick: () => void; className?: string }) {
  return <button className={"primary-button " + className} onClick={onClick}>{children}<ArrowRightIcon /></button>;
}

function WelcomeScreen() {
  const flow = useFlow();
  return (
    <MobileScroll className="app-scroll welcome-screen">
      <main className="welcome-content">
        <Brand />
        <div className="welcome-copy">
          <h1>Nhẹ nhàng hôm nay<br />cho một cơ thể bình yên hơn ngày mai</h1>
          <div className="value-list">
            <p><span><LightningBoltIcon /></span> Giảm căng mỏi<br />cổ · vai · lưng</p>
            <p><span><HeartIcon /></span> Lắng nghe cơ thể<br />mỗi ngày</p>
            <p><span><CheckCircledIcon /></span> Tập an toàn, phù hợp<br />cho người mới</p>
          </div>
        </div>
        <img className="welcome-photo" src="/assets/welcome-portrait.png" alt="Người phụ nữ ngồi thư giãn trên thảm yoga" />
        <p className="welcome-script">Một cơ thể an yên<br />bắt đầu từ những điều nhỏ bé</p>
        <PrimaryButton onClick={() => flow.push(ROUTES.checkin)}>Bắt đầu hành trình</PrimaryButton>
      </main>
    </MobileScroll>
  );
}

function CheckinScreen() {
  const flow = useFlow();
  const { focus, setFocus, energy, setEnergy } = useYogaApp();
  const focusPoints: { label: Focus; position: string }[] = [
    { label: "Cổ & vai", position: "focus-neck" },
    { label: "Lưng trên", position: "focus-upper" },
    { label: "Lưng dưới", position: "focus-lower" },
  ];
  return (
    <MobileScroll className="app-scroll">
      <main className="screen-content checkin-content">
        <Topbar />
        <h1>Hôm nay, cơ thể bạn thế nào?</h1>
        <p className="lead">Chạm vào vùng đang căng mỏi để chọn bài tập phù hợp. Bạn có thể đổi lựa chọn bất cứ lúc nào.</p>
        <section className="body-selector" aria-label="Chọn vùng cơ thể cần chú ý">
          <img src="/assets/body-map-neutral.png" alt="Sơ đồ vùng cơ thể phía sau" />
          {focusPoints.map((point) => (
            <button key={point.label} className={"body-point " + point.position + (focus === point.label ? " selected" : "")} onClick={() => setFocus(point.label)} aria-pressed={focus === point.label}>
              <span className="point-dot" />{point.label}
            </button>
          ))}
        </section>
        <section className="energy-panel" aria-label="Chọn mức năng lượng">
          <h2>Năng lượng của bạn hôm nay?</h2>
          <div className="energy-options">
            {["Rất thấp", "Thấp", "Bình thường", "Khá ổn", "Tràn đầy"].map((option, index) => (
              <button key={option} className={energy === option ? "energy-choice selected" : "energy-choice"} onClick={() => setEnergy(option)} aria-pressed={energy === option}>
                <span><DotFilledIcon /></span>{option}
              </button>
            ))}
          </div>
        </section>
        <div className="row-actions"><button className="text-button" onClick={() => flow.push(ROUTES.today)}>Bỏ qua</button><PrimaryButton onClick={() => flow.push(ROUTES.today)}>Tiếp tục</PrimaryButton></div>
      </main>
    </MobileScroll>
  );
}

function TodayScreen() {
  const flow = useFlow();
  const { focus, energy } = useYogaApp();
  return (
    <MobileScroll className="app-scroll">
      <main className="screen-content today-content">
        <Topbar />
        <div className="eyebrow">Bài tập hôm nay</div>
        <h1>Dành riêng cho bạn</h1>
        <p className="lead">Dựa trên vùng <strong>{focus}</strong> và năng lượng <strong>{energy.toLowerCase()}</strong>, đây là buổi tập nhẹ nhàng cho hôm nay.</p>
        <section className="practice-hero">
          <img src="/assets/today-neck-stretch.png" alt="Tư thế giãn cổ vai nhẹ nhàng" />
          <div className="practice-hero-copy"><span className="duration"><CalendarIcon />12 phút</span><h2>Thư giãn<br />{focus.toLowerCase()}</h2><p>Nhẹ nhàng · An toàn · Vừa sức</p></div>
        </section>
        <section className="move-list"><h2>Bạn sẽ thực hành các động tác:</h2><div className="move-tiles"><MiniMove label="Xoay cổ nhẹ" image="/assets/motion-chest-open.png" /><MiniMove label="Giãn vai" image="/assets/practice-shoulder-stretch.png" /><MiniMove label="Mở ngực" image="/assets/motion-chest-open.png" /></div></section>
        <button className="gentle-option"><span><HeartIcon /></span><span><strong>Có phiên bản nhẹ hơn</strong><small>Phù hợp cho ngày mệt mỏi hoặc mới bắt đầu.</small></span><ArrowRightIcon /></button>
        <PrimaryButton onClick={() => flow.push(ROUTES.practice)}>Bắt đầu bài tập</PrimaryButton>
      </main>
    </MobileScroll>
  );
}

function MiniMove({ label, image }: { label: string; image: string }) {
  return <div className="mini-move"><img src={image} alt="" /><span>{label}</span></div>;
}

function PracticeScreen() {
  const flow = useFlow();
  const [isPaused, setPaused] = useState(false);
  const [step, setStep] = useState(3);
  return (
    <MobileScroll className="app-scroll practice-content-scroll">
      <main className="screen-content practice-content">
        <Topbar title="Bài tập 3 / 6" action={<button className="text-button small" onClick={() => flow.push(ROUTES.reflection)}>Kết thúc</button>} />
        <h1>Giãn vai và cổ bên</h1>
        <p className="lead compact">Thả lỏng cổ – vai, hít thở sâu và chậm.</p>
        <div className="practice-image-wrap"><img src="/assets/practice-shoulder-stretch.png" alt="Hướng dẫn giãn vai và cổ bên" /><span className="step-pill">{step} / 6</span></div>
        <section className="cue-panel"><InfoCircledIcon /><div><strong>Thực hiện nhẹ nhàng</strong><ul><li>Giữ lưng thẳng, vai thả lỏng.</li><li>Hít thở chậm, không kéo căng quá mức.</li></ul></div></section>
        <div className="timer-row"><button className="round-control" onClick={() => setPaused(!isPaused)} aria-label={isPaused ? "Tiếp tục" : "Tạm dừng"}>{isPaused ? <PlayIcon /> : <PauseIcon />}<small>{isPaused ? "Tiếp tục" : "Tạm dừng"}</small></button><div className="breath-timer"><strong>00:28</strong><span>{isPaused ? "Đang tạm dừng" : "Hít thở đều"}</span></div><button className="round-control" onClick={() => setStep(Math.min(6, step + 1))} aria-label="Bỏ qua"><ArrowRightIcon /><small>Bỏ qua</small></button></div>
        <button className="gentle-option"><span><HeartIcon /></span><span><strong>Động tác nhẹ hơn</strong><small>Ngồi trên ghế nếu bạn cảm thấy không thoải mái.</small></span><ArrowRightIcon /></button>
        <PrimaryButton onClick={() => flow.push(ROUTES.reflection)}>Hoàn thành buổi tập</PrimaryButton>
      </main>
    </MobileScroll>
  );
}

function ReflectionScreen() {
  const flow = useFlow();
  const { note, setNote, setReflectionSaved } = useYogaApp();
  const save = () => { setReflectionSaved(true); flow.push(ROUTES.progress); };
  return (
    <MobileScroll className="app-scroll">
      <main className="screen-content reflection-content">
        <Topbar />
        <h1>Sau buổi tập,<br />cơ thể bạn thế nào?</h1>
        <p className="lead">Cảm nhận sự khác biệt, dù là nhỏ nhất.</p>
        <section className="before-after" aria-label="So sánh cảm nhận trước và sau buổi tập"><BodyState title="Trước tập" image="/assets/body-map-neutral.png" type="before" /><ArrowRightIcon /><BodyState title="Sau tập" image="/assets/body-map-comfort.png" type="after" /></section>
        <div className="comfort-legend"><span className="legend-high" />Căng nhiều <span className="legend-mid" />Căng nhẹ <span className="legend-good" />Thoải mái</div>
        <label className="reflection-field">Cảm nhận của bạn <em>(không bắt buộc)</em><KeyboardTextarea placeholder="Ví dụ: Cổ nhẹ hơn, dễ chịu hơn..." value={note} onChange={(event) => setNote(event.target.value)} onBlur={(event) => event.currentTarget.blur()} /></label>
        <PrimaryButton onClick={save}>Lưu lại</PrimaryButton>
      </main>
    </MobileScroll>
  );
}

function BodyState({ title, image, type }: { title: string; image: string; type: string }) {
  return <div className={"body-state " + type}><img src={image} alt={title} /><span>{title}</span></div>;
}

function ProgressScreen() {
  const flow = useFlow();
  const { reflectionSaved, setMessageKind } = useYogaApp();
  const openMessage = (kind: MessageKind) => { setMessageKind(kind); flow.push(ROUTES.message); };
  return (
    <MobileScroll className="app-scroll">
      <main className="screen-content progress-content">
        <div className="progress-brand-row"><Brand compact /><button className="plans-link" onClick={() => flow.push(ROUTES.plans)}>Quyền lợi <ArrowRightIcon /></button></div>
        <h1>Hành trình của bạn</h1>
        <p className="lead">Những thay đổi nhỏ đang tạo nên một cơ thể dễ chịu hơn.</p>
        <div className="segmented" role="tablist"><button className="active" role="tab">Theo vùng cơ thể</button><button role="tab">Theo thời gian</button></div>
        <section className="body-progress"><img src="/assets/body-map-comfort.png" alt="Bản đồ cảm nhận vùng cơ thể" /><div className="body-progress-labels"><p><strong>Cổ & vai</strong><span>Tự ghi nhận: dễ chịu hơn</span></p><p><strong>Lưng trên</strong><span>Đang theo dõi</span></p><p><strong>Lưng dưới</strong><span>Chưa đủ dữ liệu</span></p></div></section>
        <section className="trend-card"><div><span className="trend-icon"><BarChartIcon /></span><span><strong>Cảm giác dễ chịu hơn theo thời gian</strong><small>Dựa trên 7 buổi tập gần nhất</small></span></div><div className="trend-lines" aria-label="Biểu đồ tăng dần qua 7 buổi"><i /><i /><i /><i /><i /><i /><i /></div></section>
        {reflectionSaved ? <div className="saved-note"><CheckIcon /> Cảm nhận hôm nay đã được lưu vào hành trình.</div> : null}
        <section className="milestones"><div className="section-title"><h2>Dấu mốc của bạn</h2><button className="text-button" onClick={() => flow.push(ROUTES.plans)}>Tìm hiểu</button></div><Milestone type="teacher" onClick={() => openMessage("teacher")} /><Milestone type="ai" onClick={() => openMessage("ai")} /></section>
      </main>
    </MobileScroll>
  );
}

function Milestone({ type, onClick }: { type: MessageKind; onClick: () => void }) {
  const teacher = type === "teacher";
  return <button className={"milestone-card " + type} onClick={onClick}><span className="message-source">{teacher ? <PersonIcon /> : <MagicWandIcon />}{teacher ? "Nhận xét từ giáo viên" : "Tổng kết tự động từ Trợ lý AI"}</span><strong>{teacher ? "Một chặng đường đáng ghi nhận" : "Bạn đang dần tạo nhịp tập đều"}</strong><p>{teacher ? "Giáo viên Mai Anh · Khóa Cổ vai nhẹ nhàng" : "Dựa trên 7 buổi tập và phản hồi của bạn"}</p><span className="open-card">Xem lời nhắn <ArrowRightIcon /></span></button>;
}

function MessageScreen() {
  const flow = useFlow();
  const { messageKind, teacherNote } = useYogaApp();
  const teacher = messageKind === "teacher";
  return (
    <MobileScroll className="app-scroll">
      <main className="screen-content message-content">
        <Topbar />
        <div className={"message-card-detail " + (teacher ? "teacher" : "ai")}><div className="message-card-top"><span className="message-source">{teacher ? <PersonIcon /> : <MagicWandIcon />}{teacher ? "Nhận xét từ giáo viên" : "Tổng kết từ Trợ lý AI"}</span><span>20.09.2026</span></div><h1>{teacher ? "Một chặng đường đáng ghi nhận" : "Bạn đang dần tạo nhịp tập đều"}</h1><div className="sticker-line"><StarFilledIcon /><span>{teacher ? "Cảm ơn bạn vì đã kiên nhẫn với cơ thể mình." : "Mỗi lần trở lại thảm tập đều là một bước tiến."}</span></div><p>{teacher ? teacherNote : "Trong 7 buổi tập gần nhất, bạn đã hoàn thành 5 buổi và thường ghi nhận vùng cổ vai dễ chịu hơn sau khi tập."}</p>{teacher ? <div className="message-attribution"><PersonIcon /><span><strong>Mai Anh</strong><small>Giáo viên của Khóa Cổ vai nhẹ nhàng</small></span></div> : <div className="message-attribution"><MagicWandIcon /><span><strong>Trợ lý AI</strong><small>Dựa trên nhật ký và phản hồi bạn đã cung cấp</small></span></div>}</div>
        <section className="message-basis"><h2>{teacher ? "Điều giáo viên đã ghi nhận" : "Căn cứ của tổng kết"}</h2><ul>{teacher ? <><li>Bạn biết chọn biến thể phù hợp khi cơ thể mệt.</li><li>Hơi thở đều hơn khi chuyển động.</li></> : <><li>5/7 buổi tập đã hoàn thành.</li><li>4 lần bạn ghi nhận cổ vai dễ chịu hơn.</li></>}</ul></section>
        <button className="outline-button" onClick={() => flow.push(ROUTES.teacher)}><ReaderIcon />Xem trải nghiệm giáo viên gửi lời nhắn</button>
        <PrimaryButton onClick={() => flow.pop()}>Trở lại hành trình</PrimaryButton>
      </main>
    </MobileScroll>
  );
}

function PlansScreen() {
  const flow = useFlow();
  return (
    <MobileScroll className="app-scroll">
      <main className="screen-content plans-content">
        <Topbar title="Hình thức đồng hành" />
        <h1>Chọn cách<br />bạn muốn được đồng hành</h1>
        <p className="lead">Hai quyền lợi độc lập. Bạn có thể dùng một, hoặc kết hợp cả hai.</p>
        <section className="plan-card teacher"><span className="plan-kicker"><PersonIcon />KHÓA HỌC CÙNG GIÁO VIÊN</span><h2>Được giáo viên theo sát trong khóa học</h2><p>Mỗi khóa có giáo viên phụ trách, quan sát và gửi nhận xét tại các dấu mốc của chính khóa học đó.</p><ul><li><CheckIcon />Nhận xét trực tiếp từ giáo viên</li><li><CheckIcon />Dấu mốc theo hành trình khóa học</li><li><CheckIcon />Lời nhắn được giáo viên duyệt và gửi</li></ul><button className="outline-button" onClick={() => flow.push(ROUTES.teacher)}>Xem cách tạo lời nhắn</button></section>
        <section className="plan-card ai"><span className="plan-kicker"><MagicWandIcon />TRỢ LÝ AI · GÓI THUÊ BAO</span><h2>Tổng kết tự động cho việc tự tập</h2><p>Trợ lý AI tổng hợp check-in, nhật ký và phản hồi trong giới hạn gói bạn đăng ký.</p><ul><li><CheckIcon />Phân tích theo dữ liệu bạn đã cung cấp</li><li><CheckIcon />Tổng kết tự động khi đủ dữ liệu</li><li><CheckIcon />Card được tạo theo mẫu chuẩn của Một chút Yoga</li></ul><button className="primary-button small-button" onClick={() => flow.pop()}>Khám phá gói AI<ArrowRightIcon /></button></section>
      </main>
    </MobileScroll>
  );
}

function TeacherStudio() {
  const flow = useFlow();
  const { teacherNote, setTeacherNote, teacherSent, setTeacherSent } = useYogaApp();
  return (
    <MobileScroll className="app-scroll">
      <main className="screen-content teacher-studio">
        <Topbar title="Không gian giáo viên" />
        <div className="teacher-for"><div className="avatar">MA</div><span><small>HỌC VIÊN</small><strong>Minh Anh · Buổi 7</strong></span></div>
        <h1>Tạo lời nhắn<br />dành cho Minh Anh</h1>
        <p className="lead">Hệ thống sẽ dàn trang theo mẫu chuẩn. Giáo viên kiểm tra nội dung trước khi gửi.</p>
        <label className="reflection-field">Ghi chú của giáo viên<KeyboardTextarea value={teacherNote} onChange={(event) => setTeacherNote(event.target.value)} onBlur={(event) => event.currentTarget.blur()} /></label>
        <section className="mini-preview"><span className="message-source"><PersonIcon />NHẬN XÉT TỪ GIÁO VIÊN</span><h2>Một chặng đường đáng ghi nhận</h2><p>{teacherNote}</p><small>Mai Anh · Khóa Cổ vai nhẹ nhàng</small></section>
        {teacherSent ? <div className="success-box"><CheckCircledIcon />Đã gửi lời nhắn tới Minh Anh.</div> : null}
        <PrimaryButton onClick={() => setTeacherSent(true)}>Gửi lời nhắn</PrimaryButton>
        <button className="text-button centered" onClick={() => flow.pop()}><Cross1Icon />Đóng bản minh họa</button>
      </main>
    </MobileScroll>
  );
}

function BottomNav() {
  const flow = useFlow();
  return <nav className="bottom-nav" aria-label="Điều hướng chính"><button onClick={() => flow.replace(ROUTES.checkin)}><HomeIcon /><span>Trang chủ</span></button><button onClick={() => flow.replace(ROUTES.today)}><PlayIcon /><span>Luyện tập</span></button><button onClick={() => flow.replace(ROUTES.progress)}><BarChartIcon /><span>Tiến trình</span></button><button onClick={() => flow.push(ROUTES.plans)}><PersonIcon /><span>Cá nhân</span></button></nav>;
}
