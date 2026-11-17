import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ArrowRightIcon, ChevronDownIcon, InfoCircledIcon } from "@radix-ui/react-icons";
import { bodyLevelLabel, energyLabel, formatMessage, localizedNumber, msg, regionLabel, sideLabel } from "../../i18n";
import { BottomSheet, MobileScroll, useFlow } from "../../mobile";
import { BODY_REGION_GROUPS, isPairedBodyRegion, removeBodyObservation, replaceBodyObservation, type BodyRegion, type BodyRegionGroup, type BodySide } from "../../bodyRegions";
import type { Energy, Observation } from "../../app/model";
import { useDemo } from "../../app/state";
import { aiPracticeOffered } from "../../app/predicates";
import { useLearnerContinuation } from "../../app/useLearnerContinuation";
import { makeSnapshot } from "../../app/snapshots";
import { persistCurrentCheckin, toLearnerCheckinPayload } from "../../app/persistence";
import { Choice } from "../../app/ui/controls";
import { BodyMap } from "../../app/body/BodyMap";
import { BodyStylePicker } from "../../app/body/BodyStylePicker";
import { RegionEditor } from "../../app/body/RegionEditor";
import { useRoutes } from "../../app/navigation";

function EnergyFace({ level }: { level: number }) {
  return <svg viewBox="0 0 36 36" aria-hidden="true"><circle cx="18" cy="18" r="17" fill="currentColor" opacity=".14" /><circle cx="12" cy="15" r="1.2" fill="currentColor" /><circle cx="24" cy="15" r="1.2" fill="currentColor" /><path d={level < 2 ? "M12 25 Q18 20 24 25" : level === 2 ? "M13 23 Q18 25 23 23" : "M11 21 Q18 29 25 21"} stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" /></svg>;
}

export function CheckinScreen() {
  const flow = useFlow();
  const routes = useRoutes();
  const { state, update, setState } = useDemo();
  const locale = state.locale;
  const [regionGroup, setRegionGroup] = useState<BodyRegionGroup>("trunk");
  // Energy and time are for account check-ins; a guest goes from the body map straight to the lesson finder.
  useEffect(() => { if (!state.signedIn && state.checkinStep === 2) update({ checkinStep: 1 }); }, [state.signedIn, state.checkinStep]);
  const [showStepTwoScrollHint, setShowStepTwoScrollHint] = useState(false);
  useLayoutEffect(() => {
    const scroll = document.querySelector<HTMLElement>("[data-testid='flow-current'] .mobile-scroll");
    if (scroll) scroll.scrollTop = 0;
  }, [state.checkinStep]);
  useEffect(() => {
    if (flow.current.id !== routes.checkin.id || state.checkinStep !== 2) {
      setShowStepTwoScrollHint(false);
      return;
    }
    const scroll = document.querySelector<HTMLElement>('[data-testid="flow-current"] [data-flow-route="checkin"][data-flow-active="true"] .mobile-scroll');
    const content = scroll?.querySelector<HTMLElement>(".mobile-scroll-content");
    if (!scroll) return;
    const updateScrollHint = () => {
      const remaining = scroll.scrollHeight - scroll.clientHeight - scroll.scrollTop;
      const next = scroll.scrollHeight > scroll.clientHeight + 8 && remaining > 8;
      setShowStepTwoScrollHint(current => current === next ? current : next);
    };
    const resizeObserver = new ResizeObserver(updateScrollHint);
    resizeObserver.observe(scroll);
    if (content) resizeObserver.observe(content);
    scroll.addEventListener("scroll", updateScrollHint, { passive: true });
    updateScrollHint();
    return () => {
      resizeObserver.disconnect();
      scroll.removeEventListener("scroll", updateScrollHint);
    };
  }, [flow.current.id, state.checkinStep]);
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
  const standalone = async () => {
    if (saving) return;
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
  const bodySummary = state.bodyStatus === "none_now" ? msg(locale, "checkin.noDiscomfort") : state.bodyStatus === "uncertain" ? msg(locale, "checkin.unsure") : state.bodyStatus === "skipped" ? msg(locale, "checkin.skipBody") : state.bodyStatus === "tired" ? msg(locale, "checkin.tired") : state.bodyStatus === "uncomfortable" ? msg(locale, "checkin.uncomfortable") : state.preObservations.map(item => `${regionLabel(locale, item.region)}${isPairedBodyRegion(item.region) && item.side !== "unspecified" ? ` · ${sideLabel(locale, item.side)}` : ""} · ${item.status === "uncertain" ? bodyLevelLabel(locale, "Chưa rõ") : bodyLevelLabel(locale, item.level ?? msg(locale, "checkin.notRecorded"))}`).join(", ");
  return <MobileScroll className="mcy-scroll"><main className={`mcy-page mcy-checkin-page step-${state.checkinStep}`}>
    <div className="mcy-step-count" aria-live="polite">{state.signedIn ? formatMessage(locale, "checkin.stepCount", { step: state.checkinStep }) : null}<span>{msg(locale, state.checkinStep === 1 ? "checkin.step1.label" : "checkin.step2.label")}</span></div>
    <h1>{msg(locale, state.checkinStep === 1 ? "checkin.step1.title" : "checkin.step2.title")}</h1>
    <p className="mcy-lead">{state.checkinStep === 2 && aiPracticeOffered(state) ? (locale === "en-US" ? "Confirm your time, then choose reviewed content with AI or browse on your own." : "Xác nhận thời gian rồi chọn nội dung đã duyệt cùng AI, hoặc tự xem thư viện.") : msg(locale, state.checkinStep === 1 ? "checkin.step1.lead" : "checkin.step2.lead")}</p>
    {state.checkinStep === 1 ? <div className="mcy-checkin-content checkin-step-body">
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
        {!state.signedIn && (state.preObservations.length > 0 || (state.bodyStatus && state.bodyStatus !== "skipped")) && <>
          <button className="mcy-standalone-link" disabled={saving} onClick={() => { void standalone(); }}>{saving ? (locale === "en-US" ? "Saving check-in…" : "Đang lưu check-in…") : msg(locale, "checkin.standalone")}</button>
          {saveError && <div className="mcy-form-error" role="alert">{locale === "en-US" ? "Couldn't save check-in: " : "Chưa lưu được check-in: "}{saveError}</div>}
          {saveNotice && <p role="status">{saveNotice}</p>}
        </>}
        <div className="mcy-inline-note"><InfoCircledIcon />{msg(locale, "checkin.disclaimer")}</div>
      </div>
    </div> : <div className="mcy-checkin-step-two">
      {showStepTwoScrollHint && <div className="mcy-scroll-hint mcy-checkin-step-two-scroll-hint"><ChevronDownIcon aria-hidden="true" />{msg(locale, "checkin.step2.scrollHint")}</div>}
      <section className="mcy-energy-card"><h2>{msg(locale, "checkin.energy")} <small>({msg(locale, "checkin.optional")})</small></h2><div className="mcy-energy-options">{(["Rất thấp", "Thấp", "Bình thường", "Khá ổn", "Tràn đầy"] as Energy[]).map((value, index) => <button key={value} aria-pressed={state.energy === value} onClick={() => update({ energy: value })}><EnergyFace level={index} /><span>{energyLabel(locale, value)}</span></button>)}</div></section>
      <section className="mcy-field-section compact"><h2>{msg(locale, "checkin.duration")}</h2><div className="mcy-chip-grid">{([5, 10, 15] as const).map(time => <Choice key={time} selected={state.minutes === time} onClick={() => update({ minutes: time })}>{formatMessage(locale, "checkin.minutes", { minutes: localizedNumber(locale, time) })}</Choice>)}</div>{locale !== "en-US" && <p className="mcy-field-hint">Mỗi bài trong thư viện dài từ vài chục giây đến khoảng 1 phút; bạn có thể xem nhiều bài liên tiếp trong khoảng thời gian này.</p>}</section>
      <div className="mcy-checkin-summary"><span><strong>{locale === "en-US" ? "Body check-in" : "Cảm nhận cơ thể"}</strong><small>{bodySummary || (locale === "en-US" ? "Not added" : "Chưa ghi nhận")}</small></span><button onClick={() => update({ checkinStep: 1 })}>{locale === "en-US" ? "Edit" : "Sửa"}</button></div>
      {state.pendingCheckinPayload && <p role="status">{locale === "en-US" ? "The previous save is unconfirmed. Retry that exact record first; edits remain in your draft." : "Lần lưu trước chưa được xác nhận. Hãy thử lại đúng bản ghi đó trước; phần sửa được giữ trong nháp."}</p>}
      <button className="mcy-standalone-link" disabled={saving} onClick={() => { void standalone(); }}>{saving ? (locale === "en-US" ? "Saving check-in…" : "Đang lưu check-in…") : state.pendingCheckinPayload ? (locale === "en-US" ? "Retry the previous record" : "Thử lại bản ghi trước") : msg(locale, "checkin.standalone")}</button>
      {saveError && <div className="mcy-form-error" role="alert">{locale === "en-US" ? "Couldn't save check-in: " : "Chưa lưu được check-in: "}{saveError}</div>}
      {saveNotice && <p role="status">{saveNotice}</p>}
      <div className="mcy-inline-note"><InfoCircledIcon />{msg(locale, "checkin.disclaimer")}</div>
    </div>}
    <RegionEditor region={editing} current={selected} suggestedSide={suggestedSide} onClose={closeRegion} onSave={saveObservation} onDelete={deleteObservation} />
    <BottomSheet open={Boolean(pendingStatus)} onOpenChange={open => { if (!open) setPendingStatus(null); }} title="Đổi lựa chọn vùng cơ thể" description="Các vùng vừa ghi sẽ được xóa khỏi lần check-in này. Bạn có thể chọn lại sau." snap={0.38}><div className="mcy-sheet-actions"><button className="mcy-action" onClick={() => { update({ bodyStatus: pendingStatus, preObservations: [], regions: [] }); setPendingStatus(null); }}>Đổi lựa chọn <ArrowRightIcon /></button><button className="mcy-quiet-link" onClick={() => setPendingStatus(null)}>Giữ các vùng đã ghi</button></div></BottomSheet>
  </main></MobileScroll>;
}
