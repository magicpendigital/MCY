import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { ArrowRightIcon, ChevronDownIcon } from "@radix-ui/react-icons";
import { MobileScroll } from "../mobile";
import { readReadingManifest, readReadingUnit, readingImageUrl, savedReadingStep, saveReadingStep, type ManifestUnit, type PublishedImage, type PublishedUnit } from "./readingLibraryApi";
import "./reading-learner.css";

// Learner reading screens (design: canvas "Màn học bài cho học viên"). The reading position lives in a small module
// store so the route body and its fixed footer stay in step; it is never sent anywhere.
type Load = "idle" | "loading" | "ok" | "gone" | "error";
type View = "overview" | "step" | "done";
type Store = { entry: ManifestUnit | null; load: Load; unit: PublishedUnit | null; view: View; step: number; resume: number };
const EMPTY: Store = { entry: null, load: "idle", unit: null, view: "overview", step: 0, resume: 0 };
let store: Store = EMPTY;
let token = 0;
const listeners = new Set<() => void>();
const set = (next: Partial<Store>) => { store = { ...store, ...next }; listeners.forEach(listener => listener()); };
const subscribe = (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; };
const useStore = () => useSyncExternalStore(subscribe, () => store, () => store);

export async function openReadingEntry(entry: ManifestUnit) {
  const mine = ++token;
  set({ entry, load: "loading", unit: null, view: "overview", step: 0, resume: 0 });
  const result = await readReadingUnit(entry);
  if (mine !== token) return;
  if (result.status === "ok") set({ load: "ok", unit: result.unit, resume: Math.min(savedReadingStep(entry.id, entry.version), result.unit.steps.length - 1) });
  else set({ load: result.status === "gone" ? "gone" : "error" });
}
const retryOpen = () => { if (store.entry) void openReadingEntry(store.entry); };
const goStep = (step: number) => {
  if (!store.unit || !store.entry) return;
  const clamped = Math.max(0, Math.min(step, store.unit.steps.length - 1));
  saveReadingStep(store.entry.id, store.entry.version, clamped);
  set({ view: "step", step: clamped });
};
const finish = () => { if (store.entry) saveReadingStep(store.entry.id, store.entry.version, 0); set({ view: "done", resume: 0 }); };
const toOverview = () => set({ view: "overview" });

const BADGE = { complete: "CÓ HÌNH", partial: "MỘT PHẦN CÓ HÌNH", none: "CHỈ CHỮ" } as const;
function Badge({ images }: { images: ManifestUnit["images"] }) {
  return <span className={`mcy-rl-badge ${images === "none" ? "text" : "image"}`}>{BADGE[images]}</span>;
}
function useScrollTop(deps: unknown[]) {
  const root = useRef<HTMLElement | null>(null);
  useEffect(() => { root.current?.closest(".mobile-page")?.querySelector<HTMLElement>(".mobile-scroll")?.scrollTo({ top: 0 }); }, deps); // eslint-disable-line react-hooks/exhaustive-deps
  return root;
}

// ---- list ----
export function ReadingLibraryScreen({ onOpened }: { onOpened: () => void }) {
  const [read, setRead] = useState<Awaited<ReturnType<typeof readReadingManifest>> | null>(null);
  const [attempt, setAttempt] = useState(0);
  const root = useScrollTop([]);
  useEffect(() => {
    let active = true;
    setRead(null);
    void readReadingManifest(attempt > 0).then(result => { if (active) setRead(result); });
    return () => { active = false; };
  }, [attempt]);
  return <MobileScroll className="mcy-scroll"><main className="mcy-page mcy-rl-page" ref={root}>
    <div className="mcy-eyebrow">KHÁM PHÁ</div>
    <h1>Bài đọc có hình</h1>
    <p className="mcy-lead">Đi từng bước, có hình minh hoạ khi có. Đọc để hiểu; không thay cho người hướng dẫn trực tiếp.</p>
    {!read && <p className="mcy-inline-note" role="status">Đang tải bài đọc…</p>}
    {read?.status === "unavailable" && <div className="mcy-form-error" role="alert">Chưa tải được danh sách. Hãy kiểm tra kết nối.<button className="mcy-quiet-link" onClick={() => setAttempt(value => value + 1)}>Thử lại</button></div>}
    {read?.status === "empty" && <p className="mcy-inline-note" role="status">Chưa có bài đọc nào sẵn sàng. Bạn vẫn xem được các video miễn phí ở Khám phá.</p>}
    {read?.status === "ok" && <div className="mcy-rl-list">{read.units.map(entry => <button key={entry.id} type="button" className="mcy-rl-row" onClick={() => { void openReadingEntry(entry); onOpened(); }}>
      <span><Badge images={entry.images} /><strong>{entry.title}</strong><small>{entry.steps} bước</small></span><ArrowRightIcon aria-hidden="true" />
    </button>)}</div>}
  </main></MobileScroll>;
}

// ---- lesson ----
function Figure({ image }: { image: PublishedImage }) {
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const url = readingImageUrl(image.sha256);
  return <figure className="mcy-rl-figure">
    {url && !failed
      ? <img key={attempt} src={url} alt={image.alt} width={image.width} height={image.height} loading="lazy" decoding="async" draggable={false} onError={() => setFailed(true)} />
      : <div className="mcy-rl-figure-empty" role="img" aria-label={image.alt}>
        <strong>Chưa tải được hình</strong><span>{image.alt}</span>
        <button type="button" className="mcy-rl-retry" onClick={() => { setFailed(false); setAttempt(value => value + 1); }}>Tải lại hình</button>
      </div>}
    <figcaption><span className="mcy-rl-ai">HÌNH AI</span><span>{image.caption ? `${image.caption} ` : ""}Chỉ để minh hoạ.</span></figcaption>
  </figure>;
}

function Collapsible({ title, children }: { title: string; children: ReactNode }) {
  return <details className="mcy-rl-more"><summary>{title}<ChevronDownIcon aria-hidden="true" /></summary><div>{children}</div></details>;
}
const Bullets = ({ items }: { items: string[] }) => <ul>{items.map((item, index) => <li key={index}>{item}</li>)}</ul>;

function Overview({ unit, entry, resume }: { unit: PublishedUnit; entry: ManifestUnit; resume: number }) {
  const hero = unit.steps.flatMap(step => step.images)[0];
  return <>
    <h1>{unit.title}</h1>
    <div className="mcy-rl-meta"><Badge images={entry.images} /><span>{unit.steps.length} bước · đọc theo nhịp của bạn</span></div>
    {unit.intro && <p className="mcy-rl-intro">{unit.intro}</p>}
    <section className="mcy-rl-stop" aria-label="Dấu hiệu dừng"><strong>Dừng khi cần</strong><p>{unit.stopGuidance.join(" ")}</p></section>
    {hero && <Figure image={hero} />}
    {resume > 0 && <p className="mcy-rl-resume" role="status">Bạn đang đọc dở ở bước {resume + 1}/{unit.steps.length}.</p>}
    <div className="mcy-rl-collapsibles">
      {unit.audience && <Collapsible title="Dành cho ai"><p>{unit.audience}</p></Collapsible>}
      {unit.learningObjectives.length > 0 && <Collapsible title="Bạn sẽ nhận ra gì"><Bullets items={unit.learningObjectives} /></Collapsible>}
      {(unit.prerequisites.length > 0 || unit.preparation.length > 0) && <Collapsible title="Chuẩn bị"><Bullets items={[...unit.prerequisites, ...unit.preparation]} /></Collapsible>}
    </div>
  </>;
}

function StepView({ unit, index }: { unit: PublishedUnit; index: number }) {
  const step = unit.steps[index];
  const heading = useRef<HTMLHeadingElement | null>(null);
  useEffect(() => { heading.current?.focus({ preventScroll: true }); }, [index]);
  const total = unit.steps.length;
  const textOnly = !unit.steps.some(item => item.images.length > 0);
  const onlyHere = step.stopCue && !unit.stopGuidance.includes(step.stopCue) ? step.stopCue : null;
  return <>
    <div className="mcy-rl-progress" role="progressbar" aria-label="Tiến độ bài đọc" aria-valuemin={1} aria-valuemax={total} aria-valuenow={index + 1} aria-valuetext={`Bước ${index + 1} trên ${total}`}>
      {unit.steps.map((item, position) => <i key={item.id} className={position < index ? "done" : position === index ? "current" : ""} />)}
    </div>
    <details className="mcy-rl-stopnote"><summary>Dấu hiệu dừng</summary><p>{unit.stopGuidance.join(" ")}</p></details>
    {textOnly && <p className="mcy-rl-textonly"><span className="mcy-rl-badge text">CHỈ CHỮ</span> Bài này đọc bằng chữ.</p>}
    <div className="mcy-eyebrow">BƯỚC {index + 1} / {total}</div>
    <h2 tabIndex={-1} ref={heading}>{step.title}</h2>
    {step.images.map(image => <Figure key={image.sha256} image={image} />)}
    <p className={`mcy-rl-body${textOnly ? " serif" : ""}`}>{step.body}</p>
    {step.detail && <p className="mcy-rl-detail">{step.detail}</p>}
    {step.alternative && <Collapsible title="Lựa chọn nhẹ hơn"><p>{step.alternative}</p></Collapsible>}
    {onlyHere && <p className="mcy-rl-extra-stop"><strong>Riêng bước này, dừng khi: </strong>{onlyHere}</p>}
  </>;
}

function Done({ unit, entry, onCheckin, onOpened }: { unit: PublishedUnit; entry: ManifestUnit; onCheckin?: () => void; onOpened: () => void }) {
  const [next, setNext] = useState<ManifestUnit | null>(null);
  useEffect(() => {
    let active = true;
    void readReadingManifest().then(result => {
      if (!active || result.status !== "ok") return;
      const at = result.units.findIndex(item => item.id === entry.id);
      setNext(at >= 0 ? result.units[at + 1] ?? null : null);
    });
    return () => { active = false; };
  }, [entry.id]);
  return <>
    <div className="mcy-rl-tick" aria-hidden="true">✓</div>
    <h1>Bạn đã đọc hết {unit.steps.length} bước.</h1>
    <p className="mcy-rl-intro">Đọc hết không ghi nhận một buổi tập. Bạn có thể xem lại từ đầu hoặc chuyển sang một bài khác khi muốn.</p>
    <section className="mcy-rl-stop" aria-label="Dấu hiệu dừng"><p>Nếu bạn thử tại nhà và thấy đau, tê, choáng hoặc mất vững: ngừng; nghỉ an toàn và tìm hỗ trợ phù hợp.</p></section>
    {next && <section aria-labelledby="rl-next"><h2 id="rl-next" className="mcy-rl-small-title">BÀI ĐỌC TIẾP THEO</h2>
      <button type="button" className="mcy-rl-row" onClick={() => { void openReadingEntry(next); onOpened(); }}><span><Badge images={next.images} /><strong>{next.title}</strong></span><ArrowRightIcon aria-hidden="true" /></button></section>}
    {onCheckin && <button type="button" className="mcy-quiet-link" onClick={onCheckin}>Hôm nay bạn thấy thế nào? Ghi lại check-in</button>}
  </>;
}

export function ReadingLessonScreen({ onCheckin, onOpened }: { onCheckin?: () => void; onOpened: () => void }) {
  const state = useStore();
  const root = useScrollTop([state.view, state.step, state.entry?.id]);
  const { unit, entry } = state;
  return <MobileScroll className="mcy-scroll"><main className="mcy-page mcy-rl-page mcy-rl-lesson" ref={root} aria-live="polite">
    {state.load === "loading" && <p className="mcy-inline-note" role="status">Đang mở bài…</p>}
    {state.load === "error" && <div className="mcy-form-error" role="alert">Chưa mở được bài. Hãy kiểm tra kết nối rồi thử lại.</div>}
    {state.load === "gone" && <div className="mcy-rl-gone" role="status"><strong>Bài này tạm thời không còn hiển thị.</strong><p>Bạn có thể chọn một bài đọc khác trong danh sách.</p></div>}
    {state.load === "ok" && unit && entry && (state.view === "overview" ? <Overview unit={unit} entry={entry} resume={state.resume} />
      : state.view === "step" ? <StepView unit={unit} index={state.step} />
        : <Done unit={unit} entry={entry} onCheckin={onCheckin} onOpened={onOpened} />)}
  </main></MobileScroll>;
}

export function ReadingLessonFooter({ onBack }: { onBack: () => void }) {
  const state = useStore();
  const { unit } = state;
  if (state.load === "loading" || state.load === "idle") return <div className="mcy-rl-footer"><span className="mcy-rl-footer-note" role="status">Đang mở bài…</span></div>;
  if (state.load === "error") return <div className="mcy-rl-footer"><button type="button" className="ghost" onClick={onBack}>Về danh sách</button><button type="button" className="primary" onClick={retryOpen}>Thử lại</button></div>;
  if (state.load === "gone" || !unit) return <div className="mcy-rl-footer"><button type="button" className="primary" onClick={onBack}>Về danh sách bài đọc</button></div>;
  const total = unit.steps.length;
  if (state.view === "overview") return <div className="mcy-rl-footer">
    {state.resume > 0 && <button type="button" className="ghost" onClick={() => goStep(0)}>Bắt đầu lại</button>}
    <button type="button" className="primary" onClick={() => goStep(state.resume)}>{state.resume > 0 ? `Tiếp tục · bước ${state.resume + 1}/${total}` : `Bắt đầu · bước 1/${total}`}<ArrowRightIcon aria-hidden="true" /></button>
  </div>;
  if (state.view === "step") return <div className="mcy-rl-footer">
    <button type="button" className="ghost" onClick={() => state.step === 0 ? toOverview() : goStep(state.step - 1)}>{state.step === 0 ? "Tổng quan" : `Bước ${state.step}`}</button>
    {state.step < total - 1
      ? <button type="button" className="primary" onClick={() => goStep(state.step + 1)}>Bước {state.step + 2}<ArrowRightIcon aria-hidden="true" /></button>
      : <button type="button" className="primary" onClick={finish}>Xong phần đọc</button>}
  </div>;
  return <div className="mcy-rl-footer">
    <button type="button" className="ghost" onClick={() => goStep(0)}>Xem lại từ bước 1</button>
    <button type="button" className="primary" onClick={onBack}>Về danh sách bài đọc</button>
  </div>;
}
