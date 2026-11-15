import { useLayoutEffect, useRef } from "react";
import { type FlowScreen, useFlow } from "../mobile";

export function FlowScreenAccessibilityBoundary({ routeId, active, children }: { routeId: string; active: boolean; children: React.ReactNode }) {
  return <div className="mcy-flow-route-accessibility" data-flow-route={routeId} data-flow-active={active ? "true" : "false"} aria-hidden={active ? undefined : true} inert={!active}>{children}</div>;
}

export function withFlowScreenAccessibility(screens: Record<string, FlowScreen>): Record<string, FlowScreen> {
  return Object.fromEntries(Object.entries(screens).map(([key, screen]) => {
    const render = screen.render;
    return [key, {
      ...screen,
      render: controls => <FlowScreenAccessibilityBoundary routeId={screen.id} active={controls.current.id === screen.id}>{render(controls)}</FlowScreenAccessibilityBoundary>,
    }];
  })) as Record<string, FlowScreen>;
}

export function FlowRouteFocusManager() {
  const { current } = useFlow();
  const lastRouteKey = useRef(current.key);
  useLayoutEffect(() => {
    if (lastRouteKey.current === current.key) return;
    lastRouteKey.current = current.key;
    let frame = 0;
    let attempts = 0;
    let cancelled = false;
    const focusCurrentRoute = () => {
      if (cancelled) return;
      const activeRoute = document.querySelector<HTMLElement>("[data-testid='flow-current'] .mcy-flow-route-accessibility[data-flow-active='true']");
      const heading = activeRoute?.querySelector<HTMLElement>("h1");
      const activeElement = document.activeElement as HTMLElement | null;
      const activeElementRoute = activeElement?.closest<HTMLElement>(".mcy-flow-route-accessibility");
      if (activeElement && activeElement !== document.body && activeElement !== document.documentElement && activeElementRoute?.dataset.flowActive !== "false") return;
      if (heading) {
        if (!heading.hasAttribute("tabindex")) heading.tabIndex = -1;
        heading.focus({ preventScroll: true });
        return;
      }
      attempts += 1;
      if (attempts < 60) {
        frame = requestAnimationFrame(focusCurrentRoute);
        return;
      }
      const firstControl = activeRoute?.querySelector<HTMLElement>("button:not(:disabled), a[href], input:not(:disabled), textarea:not(:disabled), select:not(:disabled), [tabindex]:not([tabindex='-1'])");
      firstControl?.focus({ preventScroll: true });
    };
    frame = requestAnimationFrame(focusCurrentRoute);
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
    };
  }, [current.key]);
  return null;
}
