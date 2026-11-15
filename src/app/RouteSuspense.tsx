import { Suspense } from "react";
import { RouteBoundary } from "../compat/RouteBoundary";

// A route that loads a lazy chunk: a failed chunk or render error shows a message instead of a blank screen (INC-001).
export function RouteSuspense({ fallback, children }: { fallback: React.ReactNode; children: React.ReactNode }) {
  return <RouteBoundary><Suspense fallback={fallback}>{children}</Suspense></RouteBoundary>;
}
