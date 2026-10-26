import type { ReadingUnitContent } from "../../supabase/functions/_shared/readingUnitCandidates";

// Owner-only preview of an unreviewed reading unit. The unit arrives from the authenticated
// owner-control-plane response; it is never bundled with the learner app. Images are described
// (status, alt text, caption, disclosure) but their pixels are not delivered in this preview yet.
const mediaStatus: Record<string, string> = {
  draft_present: "Ảnh nháp AI có trong kho biên tập",
  not_produced: "Chưa sản xuất",
  identity_blocked: "Bị chặn: chưa xác định đúng biến thể/tư thế",
};
const asList = (value: unknown): string[] => Array.isArray(value) ? value.map(item => typeof item === "string" ? item : JSON.stringify(item)) : typeof value === "string" ? [value] : [];

function Facts({ title, value }: { title: string; value: unknown }) {
  const items = asList(value);
  if (!items.length) return null;
  return <div className="reading-preview-facts"><strong>{title}</strong><ul>{items.map((item, index) => <li key={index}>{item}</li>)}</ul></div>;
}

export function ReadingUnitPreview({ unit }: { unit: ReadingUnitContent }) {
  const media = new Map(unit.media.map(item => [item.id, item]));
  return <article className="reading-preview" aria-label={`Preview · ${unit.title}`}>
    <span className="mcy-tag reading-preview-badge">PREVIEW · CHƯA DUYỆT</span>
    <h3>{unit.title}</h3>
    {unit.intro && <p>{unit.intro}</p>}
    {unit.audience && <p><strong>Đối tượng:</strong> {unit.audience}</p>}
    <Facts title="Mục tiêu" value={unit.learningObjectives} />
    <Facts title="Điều kiện trước khi đọc" value={unit.prerequisites} />
    <Facts title="Chuẩn bị" value={unit.preparation} />
    <Facts title="Dấu hiệu dừng" value={unit.stopGuidance} />
    <ol className="reading-preview-steps">{unit.steps.map(step => <li key={step.id}>
      <strong>{step.order}. {step.title}</strong>
      <p>{step.body}</p>
      {step.detail && <p>{step.detail}</p>}
      {step.entry && <p><em>Vào:</em> {step.entry}</p>}
      {step.exit && <p><em>Ra:</em> {step.exit}</p>}
      {step.alternative && <p><em>Lựa chọn nhẹ hơn:</em> {step.alternative}</p>}
      {step.stopCue && <p><em>Dừng khi:</em> {step.stopCue}</p>}
      {(step.mediaIds ?? []).map(id => media.get(id)).filter(Boolean).map(item => <figure key={item!.id} className="reading-preview-media">
        <figcaption><span className="mcy-tag">{mediaStatus[item!.status] ?? item!.status}</span><br />{item!.alt ?? "Chưa có mô tả ảnh"}{item!.caption ? <><br /><small>{item!.caption}</small></> : null}{item!.disclosure ? <><br /><small>{item!.disclosure}</small></> : null}{item!.sha256 ? <><br /><small>sha256 {item!.sha256.slice(0, 12)}…</small></> : null}</figcaption>
      </figure>)}
    </li>)}</ol>
    {asList(unit.blockers).length > 0 && <div className="reading-preview-facts blockers"><strong>Điểm còn chặn theo bản biên tập</strong><ul>{asList(unit.blockers).map((item, index) => <li key={index}>{item}</li>)}</ul></div>}
    {unit.readTimeNote && <p><small>{unit.readTimeNote}</small></p>}
  </article>;
}
