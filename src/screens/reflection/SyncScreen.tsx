import { lastOf } from "../../compat";
import { formatMessage, guidedChoiceLabel, localizedNumber, msg } from "../../i18n";
import { MobileScroll, useFlow } from "../../mobile";
import { useDemo } from "../../app/state";
import { Action, DemoNote, Eyebrow } from "../../app/ui/controls";
import { useRoutes } from "../../app/navigation";

export function SyncScreen() {
  const flow = useFlow();
  const routes = useRoutes();
  const { state } = useDemo();
  const locale = state.locale;
  const latest = state.lastReflection ?? lastOf(state.history);
  const reflectionTitle = latest?.feedbackSkipped
    ? msg(locale, "sync.skippedTitle")
    : latest?.kind === "Sau tập"
      ? latest.endedEarly
        ? msg(locale, "sync.endedEarlyTitle")
        : latest.outcome || latest.observations.length || latest.status === "uncertain" || latest.status === "none_now" || latest.status === "tired" || latest.status === "uncomfortable"
          ? msg(locale, "sync.reflectionTitle")
          : msg(locale, "sync.noFeelingTitle")
      : msg(locale, "sync.noReflectionTitle");
  const reflectionDetail = [
    latest?.outcome ? formatMessage(locale, "sync.overall", { feeling: guidedChoiceLabel(locale, latest.outcome) }) : msg(locale, "sync.noOverall"),
    latest?.status === "skipped" && !latest.feedbackSkipped ? msg(locale, "sync.skippedBody") : "",
    latest?.observations.length ? formatMessage(locale, "sync.observationCount", { count: localizedNumber(locale, latest.observations.length) }) : msg(locale, "sync.noObservation"),
  ].filter(Boolean).join(" ");
  return <MobileScroll className="mcy-scroll"><main className="mcy-page mcy-sync-page">
    <Eyebrow>{msg(locale, "sync.eyebrow")}</Eyebrow>
    <h1>{msg(locale, "sync.title")}</h1>
    <p className="mcy-lead">{msg(locale, "sync.lead")}</p>
    <div className="mcy-sync-card">
      <span className="mcy-state-pill">{msg(locale, "sync.sessionOnlyPill")}</span>
      <strong>{reflectionTitle}</strong><p>{reflectionDetail}</p>
    </div>
    {!state.saveFeedbackConsent && <p className="mcy-inline-note">{msg(locale, "sync.noConsent")}</p>}
    <Action secondary onClick={() => flow.replace(routes.journey)}>{msg(locale, "sync.openJourney")}</Action>
    <button className="mcy-quiet-link" onClick={() => flow.replace(routes.home)}>{msg(locale, "sync.done")}</button>
    <DemoNote>{msg(locale, "sync.note")}</DemoNote>
  </main></MobileScroll>;
}
