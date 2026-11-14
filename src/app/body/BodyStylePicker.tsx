import { useState } from "react";
import { ArrowRightIcon, CheckIcon } from "@radix-ui/react-icons";
import { BottomSheet } from "../../mobile";
import type { BodyStyle } from "../model";
import { useDemo } from "../state";
import { BODY_STYLES } from "./bodyLayout";

export function BodyStylePicker({ value, onChange }: { value: BodyStyle; onChange: (style: BodyStyle) => void }) {
  const { state } = useDemo();
  const locale = state.locale;
  const styleLabel = (style: BodyStyle) => locale === "en-US" ? style === "neutral" ? "Neutral" : style === "feminine" ? "Feminine" : "Masculine" : BODY_STYLES.find(item => item.id === style)?.label ?? "Trung tính";
  const [open, setOpen] = useState(false);
  return <><button className="mcy-style-link" onClick={() => setOpen(true)}>{locale === "en-US" ? "Change illustration" : "Đổi hình minh họa"} <ArrowRightIcon /></button>
    <BottomSheet open={open} onOpenChange={setOpen} title={locale === "en-US" ? "Choose an illustration" : "Chọn hình minh họa"} description={locale === "en-US" ? "Choose the figure that helps you identify areas. You can change it any time." : "Chọn hình giúp bạn dễ xác định vùng cơ thể hơn. Có thể đổi bất cứ lúc nào."} snap={0.57}>
      <div className="mcy-style-options">{BODY_STYLES.map(style => <button key={style.id} className={value === style.id ? "selected" : ""} onClick={() => { onChange(style.id); setOpen(false); }} aria-pressed={value === style.id}><img src={style.image} srcSet={`${style.image.replace("-1024.webp", "-512.webp")} 512w, ${style.image} 1024w`} sizes="112px" alt="" loading="lazy" decoding="async" /><strong>{styleLabel(style.id)}</strong>{value === style.id && <CheckIcon />}</button>)}</div>
      <p className="mcy-sheet-footnote">{locale === "en-US" ? "This illustration is a display preference. It does not infer gender or select a practice." : "Đây chỉ là hình hiển thị; không dùng để suy ra giới tính hoặc chọn bài tập."}</p>
    </BottomSheet></>;
}
