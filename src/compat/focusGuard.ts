// iOS Safari can scroll an `overflow: hidden` ancestor (or pan the visual viewport) to reveal a focused text field, and never scrolls it
// back, so the whole app is left shifted or looks enlarged after the field loses focus (INC-005). The app's own scrollers are
// MobileScroll children; none of the containers below ever scrolls on purpose, so putting them back to 0 is always safe.
const CONTAINERS = [".mobile-web-stage", ".device-screen", ".mobile-app-viewport"];
const TEXT_CONTROL = "input:not([type=checkbox]):not([type=radio]):not([type=range]):not([type=button]):not([type=submit]), textarea, select, [contenteditable=true]";

export function textControlFocused(doc: Document = document): boolean {
  const active = doc.activeElement;
  return Boolean(active && active !== doc.body && active.matches(TEXT_CONTROL));
}

/** Puts the stray scroll of the fixed containers and the window back to 0. Returns true when something had moved. */
export function resetStrayScroll(root: ParentNode = document): boolean {
  let moved = false;
  for (const selector of CONTAINERS) {
    for (const element of Array.from(root.querySelectorAll<HTMLElement>(selector))) {
      if (element.scrollTop !== 0 || element.scrollLeft !== 0) {
        element.scrollTop = 0;
        element.scrollLeft = 0;
        moved = true;
      }
    }
  }
  if (window.pageYOffset !== 0 || window.pageXOffset !== 0) {
    window.scrollTo(0, 0);
    moved = true;
  }
  return moved;
}

/** Resets stray scroll shortly after a text field loses focus and when the keyboard closes. Returns the remover. */
export function installFocusGuard(): () => void {
  let timer: number | undefined;
  const schedule = () => {
    window.clearTimeout(timer);
    // Moving focus straight to another field is not a close: wait, then only reset when no text field has focus.
    timer = window.setTimeout(() => { if (!textControlFocused()) resetStrayScroll(); }, 120);
  };
  document.addEventListener("focusout", schedule, true);
  const viewport = window.visualViewport;
  viewport?.addEventListener("resize", schedule);
  return () => {
    window.clearTimeout(timer);
    document.removeEventListener("focusout", schedule, true);
    viewport?.removeEventListener("resize", schedule);
  };
}
