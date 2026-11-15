import { createContext, useContext } from "react";
import type { FlowScreen, useFlow } from "../mobile";

// The learner route table, provided once by Prototype so split-out screens never import it back from Prototype.
export const RoutesContext = createContext<Record<string, FlowScreen> | null>(null);

export function useRoutes() {
  const routes = useContext(RoutesContext);
  if (!routes) throw new Error("Prototype routes missing");
  return routes;
}

export function finishAtAuthDestination(flow: ReturnType<typeof useFlow>, routes: Record<string, FlowScreen>, destination: string) {
  const target = routes[destination] ?? routes.home;
  let targetIndex = -1;
  flow.stack.forEach((entry, index) => { if (entry.id === target.id) targetIndex = index; });
  const stepsToPop = targetIndex >= 0 ? flow.stack.length - targetIndex - 1 : flow.stack.length - 1;
  for (let index = 0; index < stepsToPop; index += 1) flow.pop();
  if (targetIndex < 0) flow.replace(target);
}
