// Diagnostic overlay, only when the address has `?debug=viewport`. It prints what iOS reports about the page while a text field is
// focused, so a screenshot from a real iPhone shows whether the page was zoomed (scale), panned (offset), scrolled (container
// scrollTop) or made wider than the screen. It reads values only; it changes nothing and sends nothing anywhere (INC-005).
export function installViewportProbe(): () => void {
  const panel = document.createElement("pre");
  panel.setAttribute("data-testid", "viewport-probe");
  panel.setAttribute("aria-hidden", "true");
  panel.style.cssText = "position:fixed;left:4px;bottom:4px;z-index:2147483647;margin:0;padding:6px 8px;max-width:92vw;border-radius:8px;background:rgba(20,34,26,.86);color:#fff;font:11px/1.35 monospace;white-space:pre-wrap;pointer-events:none";
  document.body.appendChild(panel);
  const read = () => {
    const viewport = window.visualViewport;
    const active = document.activeElement as HTMLElement | null;
    const screen = document.querySelector<HTMLElement>(".device-screen");
    const stage = document.querySelector<HTMLElement>(".mobile-web-stage");
    const box = active && active !== document.body ? active.getBoundingClientRect() : null;
    const fontSize = active && active !== document.body ? getComputedStyle(active).fontSize : "-";
    panel.textContent = [
      "scale " + (viewport ? viewport.scale.toFixed(2) : "?") + "  vv " + (viewport ? Math.round(viewport.width) + "x" + Math.round(viewport.height) : "?") + "  offset " + (viewport ? Math.round(viewport.offsetLeft) + "," + Math.round(viewport.offsetTop) : "?"),
      "inner " + window.innerWidth + "x" + window.innerHeight + "  page " + Math.round(window.pageXOffset) + "," + Math.round(window.pageYOffset),
      "doc " + document.documentElement.scrollWidth + "x" + document.documentElement.scrollHeight + "  stageTop " + (stage ? stage.scrollTop : "-") + "  screenTop " + (screen ? screen.scrollTop : "-"),
      "focus " + (active && active !== document.body ? active.tagName.toLowerCase() : "-") + "  font " + fontSize + (box ? "  box " + Math.round(box.left) + "," + Math.round(box.top) + " " + Math.round(box.width) + "x" + Math.round(box.height) : ""),
    ].join("\n");
  };
  const events: [EventTarget | null, string][] = [[document, "focusin"], [document, "focusout"], [window, "resize"], [window, "scroll"], [window.visualViewport, "resize"], [window.visualViewport, "scroll"]];
  for (const [target, name] of events) target?.addEventListener(name, read, true);
  read();
  return () => {
    for (const [target, name] of events) target?.removeEventListener(name, read, true);
    panel.remove();
  };
}
