import { useEffect, useState } from "react";
import { bodyLevelLabel, msg, regionLabel, sideLabel, type AppLocale } from "../../i18n";
import { BODY_REGIONS, BODY_REGION_GROUPS, isPairedBodyRegion, type BodyRegion, type BodyRegionGroup, type BodySide } from "../../bodyRegions";
import type { BodyStyle, Observation } from "../model";
import { BODY_STYLES, REGION_POSITION, regionSidePosition } from "./bodyLayout";

export function BodyMap({ observations, bodyStyle, compact = false, onSelect, showAll = true, locale = "vi-VN", group }: { observations: Observation[]; bodyStyle: BodyStyle; compact?: boolean; onSelect?: (region: BodyRegion, side?: BodySide) => void; showAll?: boolean; locale?: AppLocale; group?: BodyRegionGroup }) {
  const [imageFailed, setImageFailed] = useState(false);
  const image = BODY_STYLES.find(item => item.id === bodyStyle)?.image ?? BODY_STYLES[0].image;
  useEffect(() => setImageFailed(false), [image]);
  const regions = group ? BODY_REGION_GROUPS[group] : BODY_REGIONS;
  const points: { key: string; region: BodyRegion; item?: Observation; side?: BodySide; x: number; y: number }[] = [];
  regions.forEach(region => {
    const entries = observations.filter(entry => entry.region === region);
    if (!isPairedBodyRegion(region)) {
      const item = entries[0];
      if (item || (onSelect && showAll)) points.push({ key: region, region, item, ...REGION_POSITION[region] });
      return;
    }
    const left = entries.find(item => item.side === "left" || item.side === "both");
    const right = entries.find(item => item.side === "right" || item.side === "both");
    const unspecified = entries.find(item => item.side === "unspecified");
    if (left || (onSelect && showAll)) points.push({ key: `${region}-left`, region, item: left, side: "left", ...regionSidePosition(region, "left") });
    if (right || (onSelect && showAll)) points.push({ key: `${region}-right`, region, item: right, side: "right", ...regionSidePosition(region, "right") });
    if (unspecified) points.push({ key: `${region}-unspecified`, region, item: unspecified, side: "unspecified", ...regionSidePosition(region, "unspecified") });
  });
  return <div className={`mcy-body-map-v2${compact ? " compact" : ""}`}>
    <div className="mcy-body-art">
      {imageFailed ? <p className="mcy-body-fallback">{locale === "en-US" ? "The illustration did not load. You can still choose an area from the list." : "Hình minh họa chưa tải. Bạn vẫn có thể chọn vùng trong danh sách."}</p> : <img src={image} srcSet={`${image.replace("-1024.webp", "-512.webp")} 512w, ${image} 1024w`} sizes={compact ? "128px" : "(max-width: 380px) 190px, (max-width: 700px) 230px, 280px"} alt={locale === "en-US" ? "Full body illustration, viewed from behind" : "Minh họa toàn thân nhìn từ phía sau"} loading="eager" decoding="async" onError={() => setImageFailed(true)} />}
      {!imageFailed && points.map(({ key, region, item, side, x, y }) => {
        const className = `mcy-map-pin${item ? ` is-${item.status === "uncertain" ? "uncertain" : item.level === "Không khó chịu" ? "clear" : item.level === "Nhiều" ? "high" : "reported"}` : ""}`;
        const style = { left: `${x}%`, top: `${y}%` };
        const label = side && side !== "unspecified" ? `${regionLabel(locale, region)} ${sideLabel(locale, side).toLowerCase()}` : regionLabel(locale, region);
        const marker = item?.status === "uncertain" ? "?" : item?.level === "Không khó chịu" ? "✓" : item ? "•" : "+";
        const itemLabel = item ? item.status === "uncertain" ? bodyLevelLabel(locale, "Chưa rõ") : bodyLevelLabel(locale, item.level ?? msg(locale, "checkin.notRecorded")) : msg(locale, "checkin.tapToRecord");
        return onSelect ? <button key={key} type="button" className={className} style={style} aria-label={`${label}: ${itemLabel}`} onClick={() => onSelect(region, side)}><span aria-hidden="true">{marker}</span></button> : <span key={key} className={className} style={style} aria-label={`${label}: ${itemLabel}`}><span aria-hidden="true">{marker}</span></span>;
      })}
    </div>
    {!compact && <small className="mcy-body-orientation" data-testid="body-orientation">{msg(locale, "checkin.orientation")}</small>}
  </div>;
}
