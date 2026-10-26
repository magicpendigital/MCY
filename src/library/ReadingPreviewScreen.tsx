import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRightIcon } from "@radix-ui/react-icons";
import { MobileScroll } from "../mobile";
import { readPreviewList, readPreviewUnit, type PreviewDecision, type PreviewList, type PreviewListItem, type PreviewUnit } from "./readingPreviewApi";
import type { ReadingUnitMedia } from "../../supabase/functions/_shared/readingUnitCandidates";
import "./reading-preview.css";

// Owner/reviewer Preview of the illustrated reading units, inside the learner app. It labels every unit with
// its real review state; approval alone never publishes, so the label never says the unit is public.
const badge = (decision: PreviewDecision) => decision === "approved" ? "ĐÃ DUYỆT · CHƯA XUẤT BẢN" : "PREVIEW · CHƯA DUYỆT";
const missingMedia: Record<string, string> = {
  not_produced: "Ảnh chưa được sản xuất cho bước này.",
  identity_blocked: "Ảnh bị chặn: chưa xác định đúng biến thể hoặc tư thế, nên không dùng ảnh khác để thay.",
};
const asList = (value: unknown): string[] => Array.isArray(value) ? value.map(item => typeof item === "string" ? item : JSON.stringify(item)) : typeof value === "string" && value ? [value] : [];

function Facts({ title, value, tone }: { title: string; value: unknown; tone?: "stop" | "blocker" }) {
  const items = asList(value);
  if (!items.length) return null;
  return <section className={`mcy-rp-facts${tone ? ` ${tone}` : ""}`}><h3>{title}</h3><ul>{items.map((item, index) => <li key={index}>{item}</li>)}</ul></section>;
}

function StepFigure({ media, url, onFailed, failed }: { media: ReadingUnitMedia; url?: string; failed: boolean; onFailed: () => void }) {
  const showImage = media.status === "draft_present" && url && !failed;
  return <figure className="mcy-rp-figure">
    {showImage
      ? <img src={url} alt={media.alt ?? ""} width={media.width ?? undefined} height={media.height ?? undefined} loading="lazy" decoding="async" draggable={false} onError={onFailed} />
      : <div className="mcy-rp-figure-empty" role="img" aria-label={media.alt ?? "Ảnh chưa có"}>
        <strong>{media.status === "draft_present" ? (failed ? "Chưa tải được ảnh" : "Ảnh nháp chưa được tải lên kho riêng") : (missingMedia[media.status] ?? "Ảnh chưa sẵn sàng")}</strong>
        {media.alt && <span>{media.alt}</span>}
      </div>}
    {(media.caption || media.disclosure) && <figcaption>{media.caption}{media.caption && media.disclosure ? " " : ""}{media.disclosure && <em>{media.disclosure}</em>}</figcaption>}
  </figure>;
}

function UnitReader({ unit, mediaUrls }: { unit: PreviewUnit; mediaUrls: Record<string, string> }) {
  const [failed, setFailed] = useState<Set<string>>(new Set());
  const content = unit.content;
  const media = new Map(content.media.map(item => [item.id, item]));
  return <article className="mcy-rp-article" aria-label={unit.title}>
    <span className="mcy-tag mcy-rp-badge">{badge(unit.decision)}</span>
    <p className="mcy-rp-notice">Chỉ Owner hoặc người được giao duyệt thấy bài này; học viên chưa thấy. Hình do AI tạo từ nhân vật hư cấu, chưa duyệt chuyên môn và quyền.</p>
    {content.intro && <p className="mcy-lead">{content.intro}</p>}
    {content.audience && <p className="mcy-rp-audience"><strong>Dành cho:</strong> {content.audience}</p>}
    <Facts title="Dấu hiệu dừng" value={content.stopGuidance} tone="stop" />
    <Facts title="Bạn sẽ xem được gì" value={content.learningObjectives} />
    <Facts title="Điều kiện trước khi đọc" value={content.prerequisites} />
    <Facts title="Chuẩn bị" value={content.preparation} />
    <ol className="mcy-rp-steps">{content.steps.map(step => <li key={step.id} aria-labelledby={`rp-step-${step.id}`}>
      <span className="mcy-tag">BƯỚC {step.order} / {content.steps.length}</span>
      <h2 id={`rp-step-${step.id}`}>{step.title}</h2>
      {(step.mediaIds ?? []).map(id => media.get(id)).filter((item): item is ReadingUnitMedia => Boolean(item)).map(item =>
        <StepFigure key={item.id} media={item} url={mediaUrls[item.id]} failed={failed.has(item.id)} onFailed={() => setFailed(previous => new Set(previous).add(item.id))} />)}
      <p>{step.body}</p>
      {step.detail && <p>{step.detail}</p>}
      <dl>
        {step.entry && <><dt>Vào</dt><dd>{step.entry}</dd></>}
        {step.exit && <><dt>Ra</dt><dd>{step.exit}</dd></>}
        {step.alternative && <><dt>Lựa chọn nhẹ hơn</dt><dd>{step.alternative}</dd></>}
        {step.stopCue && <><dt>Dừng khi</dt><dd>{step.stopCue}</dd></>}
      </dl>
    </li>)}</ol>
    <Facts title="Điểm còn chặn theo bản biên tập" value={content.blockers} tone="blocker" />
    {content.readTimeNote && <p className="mcy-rp-small">{content.readTimeNote}</p>}
  </article>;
}

type DetailState = { status: "loading" } | { status: "error"; message: string } | { status: "ok"; unit: PreviewUnit; mediaUrls: Record<string, string> };

export default function ReadingPreviewScreen({ userId }: { userId: string; active?: boolean }) {
  const [list, setList] = useState<PreviewList | null>(null);
  const [selected, setSelected] = useState<PreviewListItem | null>(null);
  const [detail, setDetail] = useState<DetailState>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);
  const main = useRef<HTMLElement | null>(null);
  const account = useRef(userId);
  account.current = userId;

  useEffect(() => {
    let current = true;
    setList(null);
    void readPreviewList(userId).then(result => { if (current && account.current === userId) setList(result); });
    return () => { current = false; };
  }, [userId, attempt]);

  const open = useCallback((item: PreviewListItem | null) => {
    setSelected(item);
    main.current?.closest(".mobile-page")?.querySelector<HTMLElement>(".mobile-scroll")?.scrollTo({ top: 0 });
    if (!item) return;
    setDetail({ status: "loading" });
    const actor = userId;
    void readPreviewUnit(actor, item.id).then(result => {
      if (account.current !== actor) return;
      if (result.status === "ok") setDetail({ status: "ok", unit: result.unit, mediaUrls: result.mediaUrls });
      else setDetail({ status: "error", message: result.status === "denied" ? "Máy chủ không còn xác nhận quyền xem trước của tài khoản này." : "Chưa mở được bài. Hãy kiểm tra kết nối rồi thử lại." });
    });
  }, [userId]);

  const retry = () => setAttempt(value => value + 1);
  return <MobileScroll className="mcy-scroll"><main className="mcy-page mcy-rp-page" ref={main}>
    {selected ? <>
      <button className="mcy-rp-back" onClick={() => open(null)}>← Tất cả bài đọc</button>
      <h1>{selected.title}</h1>
      {detail.status === "loading" && <p className="mcy-inline-note" role="status">Đang mở bài…</p>}
      {detail.status === "error" && <div className="mcy-form-error" role="alert">{detail.message}<button className="mcy-quiet-link" onClick={() => open(selected)}>Thử lại</button></div>}
      {detail.status === "ok" && <UnitReader unit={detail.unit} mediaUrls={detail.mediaUrls} />}
    </> : <>
      <div className="mcy-eyebrow">XEM TRƯỚC NỘI DUNG</div>
      <h1>Bài đọc có hình</h1>
      <p className="mcy-lead">Bản nháp để Owner đọc và duyệt. Học viên chưa thấy các bài này, và duyệt xong cũng chưa tự xuất bản.</p>
      {!list && <p className="mcy-inline-note" role="status">Đang tải danh sách…</p>}
      {list?.status === "unavailable" && <div className="mcy-form-error" role="alert">Chưa tải được danh sách. Hãy kiểm tra kết nối.<button className="mcy-quiet-link" onClick={retry}>Thử lại</button></div>}
      {list?.status === "denied" && <p className="mcy-inline-note" role="status">Tài khoản này không có nội dung nào để xem trước.</p>}
      {list?.status === "allowed" && (list.units.length === 0
        ? <p className="mcy-inline-note" role="status">Chưa có bài nào được giao cho tài khoản này.</p>
        : <div className="mcy-rp-list">{list.units.map(item => <button key={item.id} className="mcy-account-row mcy-rp-row" onClick={() => open(item)}>
          <span><span className="mcy-tag">{badge(item.decision)}</span><strong>{item.title}</strong><small>{item.steps} bước · {item.images.present}/{item.images.total} ảnh nháp</small></span><ArrowRightIcon />
        </button>)}</div>)}
    </>}
  </main></MobileScroll>;
}
