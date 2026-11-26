import { useEffect, useState } from "react";
import { ArrowRightIcon } from "@radix-ui/react-icons";
import { useFlow } from "../../mobile";
import { useRoutes } from "../../app/navigation";
import { BrandMark } from "../../app/ui/Brand";
import { buildChutSequence, chipSummary, CHUT_REGIONS, type ChutRegionId } from "../../chut/sequences";
import { startChutRun } from "../../chut/chutRun";

// Chút slice 1 (plan 2026-11-25, copy section 3b approved 26/11): the rule-based assistant slot on Hôm nay.
// One tap on an area opens a fixed sequence of short clips; nothing here uses AI or the learner's body data.
export function ChutCard() {
  const flow = useFlow();
  const routes = useRoutes();
  const [summaries, setSummaries] = useState<Partial<Record<ChutRegionId, string>>>({});
  useEffect(() => {
    let active = true;
    void import("../../courses/contentSnapshot").then(async snapshot => {
      const { courses } = await snapshot.loadCatalog();
      if (active) setSummaries(Object.fromEntries(CHUT_REGIONS.map(region => [region.id, chipSummary(buildChutSequence(courses, region))])));
    }).catch(() => undefined);
    return () => { active = false; };
  }, []);
  const open = (regionId: ChutRegionId) => {
    startChutRun(regionId);
    flow.push(routes.chutSequence);
  };
  return <section className="mcy-chut-card" aria-labelledby="chut-card-heading" data-testid="chut-card">
    <div className="mcy-chut-head">
      <span className="mcy-chut-avatar"><BrandMark /></span>
      <div><h2 id="chut-card-heading">Chút <span className="mcy-chut-role">trợ lý</span></h2><small>Gợi ý theo quy tắc · chưa dùng AI</small></div>
    </div>
    <p className="mcy-chut-greeting">Chào bạn. Hôm nay bạn muốn tập gì?</p>
    <div className="mcy-chut-chips">
      {CHUT_REGIONS.map(region => <button key={region.id} type="button" className="mcy-chut-chip" data-region={region.id} onClick={() => open(region.id)}>
        <strong>{region.label}</strong>
        <small data-testid="chut-chip-summary">{summaries[region.id] ?? " "}</small>
      </button>)}
    </div>
    <p className="mcy-chut-note">Một chạm là bắt đầu. Gợi ý theo vùng bạn chọn, chưa phải chỉ định. Bạn dừng bất cứ lúc nào.</p>
    <button type="button" className="mcy-chut-pain-link" onClick={() => flow.push(routes.chutPain)}>Tôi đang đau hoặc khó chịu<ArrowRightIcon aria-hidden="true" /></button>
  </section>;
}
