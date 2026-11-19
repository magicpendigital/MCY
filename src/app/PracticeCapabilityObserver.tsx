import { useEffect, useRef } from "react";
import { getSupabaseClient } from "../backend/supabase";
import type { DemoState } from "./model";
import { useDemo } from "./state";

export function PracticeCapabilityObserver() {
  const { state, setState } = useDemo();
  const user = useRef(state.userId); user.current = state.userId;
  useEffect(() => {
    const actor = state.userId;
    if (!actor || !state.signedIn) { setState(p => ({ ...p, aiCapability: "disabled" })); return; }
    const controller = new AbortController();
    setState(p => ({ ...p, aiCapability: "checking" }));
    void (async () => {
      let capability: DemoState["aiCapability"] = "disabled";
      try {
        const client = await getSupabaseClient();
        if (controller.signal.aborted || user.current !== actor) return;
        const response = await client?.functions.invoke("mcy-ai-assistant", { signal: controller.signal, body: { action: "capability" } });
        if (!response?.error && response?.data?.available === true && response.data.contractVersion === "reviewed-practice-1") capability = "ready";
        else if (response?.data?.reason === "not_ready") capability = "not_ready";
      } catch { /* fail closed, no provider request */ }
      if (!controller.signal.aborted && user.current === actor) setState(p => p.userId === actor ? { ...p, aiCapability: capability } : p);
    })();
    return () => controller.abort();
  }, [state.userId, state.signedIn, state.aiConsent, setState]);
  return null;
}
