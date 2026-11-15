import { msg } from "../../i18n";
import { useFlow } from "../../mobile";
import { hasStoredAuthSession } from "../../backend/supabase";
import { useRoutes } from "../../app/navigation";
import { useDemo } from "../../app/state";
import { Action } from "../../app/ui/controls";

export function WelcomeFooter() {
  const flow = useFlow();
  const routes = useRoutes();
  const { state, update } = useDemo();
  const locale = state.locale;
  const restoringStoredSession = hasStoredAuthSession() && state.backendStatus !== "ready";
  return <div className="mcy-flow-footer mcy-welcome-footer mcy-welcome-bottom">
    <Action onClick={() => { update({ checkinStep: 1 }); flow.push(routes.checkin); }}>{msg(locale, "welcome.tryGuest")}</Action>
    {!restoringStoredSession && <div className="mcy-welcome-auth"><button onClick={() => { update({ authMode: "create", authReturnTo: "home" }); flow.push(routes.authEmail); }}>{msg(locale, "welcome.createAccount")}</button><button onClick={() => { update({ authMode: "login", authReturnTo: "home" }); flow.push(routes.authEmail); }}>{msg(locale, "welcome.login")}</button></div>}
    {!restoringStoredSession && <small>{msg(locale, "welcome.note")}</small>}
  </div>;
}
