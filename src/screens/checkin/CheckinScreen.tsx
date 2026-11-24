import { useEffect, useRef, useState } from "react";
import { ArrowRightIcon, ExclamationTriangleIcon, InfoCircledIcon, ReloadIcon } from "@radix-ui/react-icons";
import { bodyLevelLabel, msg, regionLabel, sideLabel } from "../../i18n";
import { BottomSheet, MobileScroll, useFlow } from "../../mobile";
import { BODY_REGION_GROUPS, isPairedBodyRegion, removeBodyObservation, replaceBodyObservation, type BodyRegion, type BodyRegionGroup, type BodySide } from "../../bodyRegions";
import type { Observation } from "../../app/model";
import { useDemo } from "../../app/state";
import { useLearnerContinuation } from "../../app/useLearnerContinuation";
import { makeSnapshot } from "../../app/snapshots";
import { appendGuestEntry } from "../../app/guestJournal";
import { persistCurrentCheckin, toLearnerCheckinPayload } from "../../app/persistence";
import { Choice } from "../../app/ui/controls";
import { BodyMap } from "../../app/body/BodyMap";
import { BodyStylePicker } from "../../app/body/BodyStylePicker";
import { RegionEditor } from "../../app/body/RegionEditor";
import { useRoutes } from "../../app/navigation";
import { showsGuestJournal } from "../../app/predicates";
import { SESSION_RESTORE_RETRY_EVENT } from "../../app/events";
import { hasStoredAuthSession } from "../../backend/supabase";

// One screen for everyone: body areas or one overall state, then find lessons or save the check-in.
// Energy and minutes stay in the model (older records keep them) but are no longer asked; a saved check-in sends energy as null.
export function CheckinScreen() {
  const flow = useFlow();
  const routes = useRoutes();
  const { state, update, setState } = useDemo();
  const locale = state.locale;
  const [regionGroup, setRegionGroup] = useState<BodyRegionGroup>("trunk");
  const [editing, setEditing] = useState<BodyRegion | null>(null);
  const [editingStoredSide, setEditingStoredSide] = useState<BodySide | undefined>();
  const [suggestedSide, setSuggestedSide] = useState<BodySide | undefined>();
  const [pendingStatus, setPendingStatus] = useState<"none_now" | "uncertain" | "skipped" | "tired" | "uncomfortable" | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveNotice, setSaveNotice] = useState("");
  useEffect(() => { setSaving(false); setSaveError(""); setSaveNotice(""); }, [flow.current.key]);
  const captureContinuation = useLearnerContinuation();
  const latestCheckinState = useRef(state); latestCheckinState.current = state;
  const selected = editing ? state.preObservations.find(item => item.region === editing && item.side === editingStoredSide) ?? state.preObservations.find(item => item.region === editing) : undefined;
  const openRegion = (region: BodyRegion, preferredSide?: BodySide) => {
    const entries = state.preObservations.filter(item => item.region === region);
    const current = preferredSide
      ? entries.find(item => item.side === preferredSide) ?? entries.find(item => item.side === "both" || item.side === "unspecified")
      : entries[0];
    const storedSide = current?.side ?? preferredSide ?? "unspecified";
    setEditingStoredSide(storedSide);
    setSuggestedSide(preferredSide ?? current?.side ?? "unspecified");
    setEditing(region);
  };
  const closeRegion = () => { setEditing(null); setEditingStoredSide(undefined); setSuggestedSide(undefined); };
  const saveObservation = (observation: Observation) => setState(previous => {
    const preObservations = replaceBodyObservation(previous.preObservations, observation, editingStoredSide ?? observation.side);
    return { ...previous, bodyStatus: "reported", preObservations, regions: [...new Set(preObservations.map(item => item.region))] };
  });
  const deleteObservation = () => { if (!editing || !editingStoredSide) return; setState(previous => { const preObservations = removeBodyObservation(previous.preObservations, editing, editingStoredSide); return { ...previous, preObservations, regions: [...new Set(preObservations.map(item => item.region))], bodyStatus: preObservations.length ? "reported" : null }; }); };
  const chooseStatus = (value: "none_now" | "uncertain" | "skipped" | "tired" | "uncomfortable") => {
    if (state.preObservations.length) setPendingStatus(value);
    else update({ bodyStatus: value, preObservations: [], regions: [] });
  };
  // A guest's check-in is kept only on this device (src/app/guestJournal.ts) and never sent anywhere.
  const saveOnDevice = () => {
    if (!showsGuestJournal(latestCheckinState.current, hasStoredAuthSession())) return;
    const entry = makeSnapshot("Ghi riêng", state.bodyStatus, state.preObservations);
    setState(previous => previous.signedIn || previous.backendStatus === "loading" ? previous : ({
      ...previous,
      guestJournal: appendGuestEntry(previous.guestJournal, entry),
      preObservations: [], postObservations: [], regions: [], bodyStatus: null, energy: null,
    }));
    flow.push(routes.journey);
  };
  const standalone = async () => {
    if (saving) return;
    if (!state.signedIn) { saveOnDevice(); return; }
    setSaving(true);
    setSaveError("");
    setSaveNotice("");
    const current = captureContinuation();
    try {
      const remote = await persistCurrentCheckin(state, setState, "standalone", current);
      if (!current()) return;
      const original = state.pendingCheckinPayload ?? toLearnerCheckinPayload(state, "standalone", "comparison");
      const latestDraft = toLearnerCheckinPayload(latestCheckinState.current, "standalone", original.idempotencyKey);
      const sameDraft = latestDraft.bodyStatus === original.bodyStatus && latestDraft.energyLevel === original.energyLevel
        && JSON.stringify(latestDraft.observations) === JSON.stringify(original.observations);
      if (!sameDraft) { setSaveNotice(locale === "en-US" ? "The previous record is confirmed. Your edits remain in the draft; save again to create a new record." : "Đã xác nhận bản ghi trước. Nháp vừa sửa vẫn được giữ; chọn lưu lần nữa để tạo bản ghi mới."); setSaving(false); return; }
      setState(previous => !current(previous) ? previous : ({
        ...previous,
        history: !remote && previous.saveFeedbackConsent ? [...previous.history, makeSnapshot("Ghi riêng", previous.bodyStatus, previous.preObservations)] : previous.history,
        preObservations: [], postObservations: [], regions: [], bodyStatus: null, energy: null,
        pendingCheckinIdempotencyKey: null,
        pendingCheckinPayload: null,
      }));
    } catch (cause) {
      if (!current()) return;
      setSaveError(cause instanceof Error ? cause.message : "Chưa lưu được check-in. Kiểm tra mạng rồi thử lại.");
      setSaving(false);
      return;
    }
    setSaving(false);
    if (!current()) return;
    flow.push(routes.journey);
  };
  const statusDescription = state.bodyStatus === "none_now" ? msg(locale, "checkin.selectedNone") : state.bodyStatus === "uncertain" ? msg(locale, "checkin.selectedUnsure") : state.bodyStatus === "skipped" ? msg(locale, "checkin.selectedSkipped") : state.bodyStatus === "tired" ? msg(locale, "checkin.selectedTired") : state.bodyStatus === "uncomfortable" ? msg(locale, "checkin.selectedUncomfortable") : "";
  // Not signed in yet a stored sign-in is still being restored (or failed to restore): this is an account holder, so the
  // device save is not offered; the restore status and its retry are shown instead (same copy as the welcome screen).
  const restoringAccount = !state.signedIn && !showsGuestJournal(state, hasStoredAuthSession());
  const canSave = state.preObservations.length > 0 || Boolean(state.bodyStatus && state.bodyStatus !== "skipped") || Boolean(state.signedIn && state.pendingCheckinPayload);
  return <MobileScroll className="mcy-scroll"><main className="mcy-page mcy-checkin-page">
    <div className="mcy-step-count"><span>{msg(locale, "checkin.step1.label")}</span></div>
    <h1>{msg(locale, "checkin.step1.title")}</h1>
    <p className="mcy-lead">{msg(locale, "checkin.step1.lead")}</p>
    <div className="mcy-checkin-content checkin-step-body">
      <div className="mcy-checkin-illustration">
        <div className="mcy-scroll-hint mcy-star-hint"><span className="mcy-star" aria-hidden="true">*</span><em>{msg(locale, "checkin.scrollHint")}</em></div>
        <div className="mcy-body-groups" aria-label={locale === "en-US" ? "Body areas" : "Nhóm vùng cơ thể"}>{(["trunk", "arms", "legs"] as BodyRegionGroup[]).map(group => <button key={group} aria-pressed={regionGroup === group} onClick={() => setRegionGroup(group)}>{msg(locale, `checkin.group.${group}` as "checkin.group.trunk" | "checkin.group.arms" | "checkin.group.legs")}<small>{state.preObservations.filter(item => BODY_REGION_GROUPS[group].includes(item.region)).length}</small></button>)}</div>
        <BodyMap observations={state.preObservations} bodyStyle={state.bodyStyle} locale={locale} group={regionGroup} onSelect={openRegion} />
        <BodyStylePicker value={state.bodyStyle} onChange={bodyStyle => update({ bodyStyle })} />
      </div>
      <div className="mcy-checkin-fields">
        <h2 className="mcy-inline-section-title">{msg(locale, "checkin.regions")}</h2>
        <div className="mcy-region-list" aria-label={locale === "en-US" ? "Choose a body area" : "Chọn vùng cơ thể"}>{BODY_REGION_GROUPS[regionGroup].map(region => { const items = state.preObservations.filter(entry => entry.region === region); const detail = items.length ? items.map(item => `${isPairedBodyRegion(region) && item.side !== "unspecified" ? `${sideLabel(locale, item.side)} · ` : ""}${item.status === "uncertain" ? msg(locale, "checkin.unsure") : bodyLevelLabel(locale, item.level ?? msg(locale, "checkin.notRecorded"))}`).join(" / ") : msg(locale, "checkin.tapToRecord"); return <button key={region} className={items.length ? "selected" : ""} onClick={() => openRegion(region)}><span>{regionLabel(locale, region)}</span><small>{detail}</small><ArrowRightIcon /></button>; })}</div>
        <div className="mcy-body-status-actions"><p>{locale === "en-US" ? "Or choose one overall state describing the whole body:" : "Hoặc chọn trạng thái chung mô tả cả cơ thể:"}</p><div><Choice selected={state.bodyStatus === "none_now"} onClick={() => chooseStatus("none_now")}>{msg(locale, "checkin.noDiscomfort")}</Choice><Choice selected={state.bodyStatus === "tired"} onClick={() => chooseStatus("tired")}>{msg(locale, "checkin.tired")}</Choice><Choice selected={state.bodyStatus === "uncomfortable"} onClick={() => chooseStatus("uncomfortable")}>{msg(locale, "checkin.uncomfortable")}</Choice><Choice selected={state.bodyStatus === "skipped"} onClick={() => chooseStatus("skipped")}>{msg(locale, "checkin.skipBody")}</Choice></div></div>
        {statusDescription && <p className="mcy-status-caption">{statusDescription}</p>}
        {canSave && <>
          {state.signedIn && state.pendingCheckinPayload && <p role="status">{locale === "en-US" ? "The previous save is unconfirmed. Retry that exact record first; edits remain in your draft." : "Lần lưu trước chưa được xác nhận. Hãy thử lại đúng bản ghi đó trước; phần sửa được giữ trong nháp."}</p>}
          {restoringAccount ? (state.backendStatus === "error"
            ? <section className="mcy-restore-card failed" role="alert" data-testid="checkin-restore"><span className="mcy-restore-icon" aria-hidden="true"><ExclamationTriangleIcon /></span><div><strong>{msg(locale, "session.restoreFailedTitle")}</strong><p>{msg(locale, "session.restoreFailed")}</p></div><button className="mcy-restore-retry" onClick={() => window.dispatchEvent(new Event(SESSION_RESTORE_RETRY_EVENT))}>{msg(locale, "session.retry")}</button></section>
            : <section className="mcy-restore-card" role="status" data-testid="checkin-restore"><span className="mcy-restore-icon spinning" aria-hidden="true"><ReloadIcon /></span><div><strong>{msg(locale, "session.restoring")}</strong><p>{msg(locale, "session.restoringHint")}</p></div></section>) : <>
          <button className="mcy-standalone-link" disabled={saving} onClick={() => { void standalone(); }}>{saving ? (locale === "en-US" ? "Saving check-in…" : "Đang lưu check-in…") : state.signedIn && state.pendingCheckinPayload ? (locale === "en-US" ? "Retry the previous record" : "Thử lại bản ghi trước") : msg(locale, "checkin.standalone")}</button>
          {!state.signedIn && <p className="mcy-guest-save-note" data-testid="guest-save-note">{msg(locale, state.guestJournalPersistent ? "checkin.guestSaveNote" : "checkin.guestSaveSessionOnly")}</p>}
          </>}
          {saveError && <div className="mcy-form-error" role="alert">{locale === "en-US" ? "Couldn't save check-in: " : "Chưa lưu được check-in: "}{saveError}</div>}
          {saveNotice && <p role="status">{saveNotice}</p>}
        </>}
        <div className="mcy-inline-note"><InfoCircledIcon />{msg(locale, "checkin.disclaimer")}</div>
      </div>
    </div>
    <RegionEditor region={editing} current={selected} suggestedSide={suggestedSide} onClose={closeRegion} onSave={saveObservation} onDelete={deleteObservation} />
    <BottomSheet open={Boolean(pendingStatus)} onOpenChange={open => { if (!open) setPendingStatus(null); }} title="Đổi lựa chọn vùng cơ thể" description="Các vùng vừa ghi sẽ được xóa khỏi lần check-in này. Bạn có thể chọn lại sau." snap={0.38}><div className="mcy-sheet-actions"><button className="mcy-action" onClick={() => { update({ bodyStatus: pendingStatus, preObservations: [], regions: [] }); setPendingStatus(null); }}>Đổi lựa chọn <ArrowRightIcon /></button><button className="mcy-quiet-link" onClick={() => setPendingStatus(null)}>Giữ các vùng đã ghi</button></div></BottomSheet>
  </main></MobileScroll>;
}
