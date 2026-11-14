import { useLayoutEffect } from "react";
import { ArrowLeftIcon } from "@radix-ui/react-icons";
import { msg } from "../../i18n";
import { useFlow } from "../../mobile";
import { useDemo } from "../state";

export function Header({ title, back = false }: { title?: string; back?: boolean }) {
  const flow = useFlow();
  const { state } = useDemo();
  const locale = state.locale;
  const localizedTitle = title === "AI và điều được nhớ" && state.aiCapability !== "ready" ? "Điều được nhớ" : locale === "en-US"
    ? ({ "Check-in hôm nay": "Today's check-in", "Phản hồi của bạn": "Your reflection" } as Record<string, string>)[title ?? ""] ?? title
    : title;
  useLayoutEffect(() => {
    const scroll = document.querySelector<HTMLElement>("[data-testid='flow-current'] .mobile-scroll");
    if (scroll) scroll.scrollTop = 0;
  }, [flow.current.key]);
  const brandName = msg(locale, "brand.name");
  return <div className="mcy-header">{back ? <button className="mcy-icon-button" aria-label={locale === "en-US" ? "Back" : "Quay lại"} onClick={() => flow.pop()}><ArrowLeftIcon /></button> : <span />}<span className="mcy-header-title" aria-label={localizedTitle ?? brandName}>{brandName}</span><span /></div>;
}
