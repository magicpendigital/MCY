import { msg, type AppLocale } from "../../i18n";

export function BrandMark({ animated = false }: { animated?: boolean }) {
  return <svg viewBox="0 0 100 100" aria-hidden="true" focusable="false" className={animated ? "mcy-open-space-mark mcy-open-space-mark-animated" : "mcy-open-space-mark"}>
    <path className="mcy-mark-arc" d="M67 19C53 12 36 15 25 26C13 38 12 56 21 70C29 82 44 87 58 82" fill="none" stroke="currentColor" strokeWidth="5.2" strokeLinecap="round" strokeLinejoin="round" pathLength="100" />
    <circle className="mcy-mark-point" cx="74" cy="34" r="3.5" fill="currentColor" />
  </svg>;
}
export function Brand({ locale, compact = false, heading = false }: { locale: AppLocale; compact?: boolean; heading?: boolean }) {
  const BrandTag = heading ? "h1" : "span";
  return <BrandTag className={compact ? "mcy-brand compact" : "mcy-brand mcy-brand-animated"}><BrandMark animated={!compact} /><span className="mcy-brand-wordmark">{msg(locale, "brand.name")}</span></BrandTag>;
}
