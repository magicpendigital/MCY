import { useState, type ComponentType, type Dispatch, type ReactNode, type SetStateAction } from "react";
import { ArrowRightIcon, ReaderIcon } from "@radix-ui/react-icons";
import { bodyLevelLabel, formatMessage, guidedChoiceLabel, localizedNumber, msg, regionLabel, sideLabel, type AppLocale } from "./i18n";
import { BODY_REGIONS, isPairedBodyRegion, removeBodyObservation, replaceBodyObservation, type BodyRegion, type BodySide } from "./bodyRegions";
import { BottomSheet, Carousel, MobileScroll } from "./mobile";
import { deleteLearnerCheckin } from "./backend/learnerData";
import { getSupabaseClient } from "./backend/supabase";
import type { BodyStyle, DemoState, Observation, Snapshot } from "./Prototype";

type BodyMapComponentProps = {
  observations: Observation[];
  bodyStyle: BodyStyle;
  locale?: AppLocale;
  onSelect?: (region: BodyRegion, side?: BodySide) => void;
  showAll?: boolean;
};
type BodyStylePickerComponentProps = { value: BodyStyle; onChange: (style: BodyStyle) => void };
type RegionEditorComponentProps = {
  region: BodyRegion | null;
  current?: Observation;
  suggestedSide?: BodySide;
  onSave: (value: Observation) => void;
  onDelete?: () => void;
  onClose: () => void;
};
type ActionComponentProps = { children: ReactNode; onClick: () => void; disabled?: boolean; secondary?: boolean };
type JourneyScreenProps = {
  state: DemoState;
  setState: Dispatch<SetStateAction<DemoState>>;
  update: (patch: Partial<DemoState>) => void;
  onStartNext: () => void;
  BodyMapComponent: ComponentType<BodyMapComponentProps>;
  BodyStylePickerComponent: ComponentType<BodyStylePickerComponentProps>;
  RegionEditorComponent: ComponentType<RegionEditorComponentProps>;
  ActionComponent: ComponentType<ActionComponentProps>;
  DemoNoteComponent: ComponentType<{ children: ReactNode }>;
};

function localDateOrdinal(isoDate: string) {
  return Math.floor(Date.parse(`${isoDate}T00:00:00Z`) / 86_400_000);
}
function dateFromOrdinal(ordinal: number) {
  return new Date(ordinal * 86_400_000).toISOString().slice(0, 10);
}
function todayLocalDate() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}
function prettyDate(iso: string, locale: AppLocale) {
  const [year, month, day] = iso.split("-").map(Number);
  return new Intl.DateTimeFormat(locale, { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(year, month - 1, day));
}
function localizedSnapshotKind(locale: AppLocale, kind: Snapshot["kind"]) {
  return msg(locale, kind === "Trước tập" ? "journey.kind.before" : kind === "Sau tập" ? "journey.kind.after" : "journey.kind.private");
}
function snapshotLabel(snapshot: Snapshot, locale: AppLocale) {
  return `${prettyDate(snapshot.date, locale)} · ${snapshot.time} · ${localizedSnapshotKind(locale, snapshot.kind)}`;
}
function observationLabel(observation: Observation, locale: AppLocale) {
  return `${regionLabel(locale, observation.region)}${observation.side === "unspecified" ? "" : ` · ${sideLabel(locale, observation.side).toLowerCase()}`} · ${observation.status === "uncertain" ? bodyLevelLabel(locale, "Chưa rõ") : observation.level ?? msg(locale, "checkin.notRecorded")}`;
}
function journeyBodyStatus(locale: AppLocale, status: Snapshot["status"]) {
  return msg(locale, status === "none_now" ? "journey.noneNow" : status === "uncertain" ? "journey.unsure" : status === "skipped" ? "journey.skipped" : "journey.noLevel");
}

export default function JourneyScreen({
  state,
  setState,
  update,
  onStartNext,
  BodyMapComponent,
  BodyStylePickerComponent,
  RegionEditorComponent,
  ActionComponent,
  DemoNoteComponent,
}: JourneyScreenProps) {
  const [range, setRange] = useState<7 | 30>(7);
  const [selectedDay, setSelectedDay] = useState(localDateOrdinal(todayLocalDate()));
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detailRegion, setDetailRegion] = useState<BodyRegion | null>(null);
  const [detailSide, setDetailSide] = useState<BodySide | undefined>();
  const [editingRegion, setEditingRegion] = useState<BodyRegion | null>(null);
  const [editingStoredSide, setEditingStoredSide] = useState<BodySide | undefined>();
  const [editingSuggestedSide, setEditingSuggestedSide] = useState<BodySide | undefined>();
  const [compare, setCompare] = useState(false);
  const [compareA, setCompareA] = useState<string | null>(null);
  const [compareB, setCompareB] = useState<string | null>(null);
  const [comparePicker, setComparePicker] = useState<"A" | "B" | null>(null);
  const [trendRegion, setTrendRegion] = useState<BodyRegion>("neck");
  const [deletePending, setDeletePending] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const snapshots = [...state.remoteCheckins, ...state.history]
    .map(item => ({ ...item, day: localDateOrdinal(item.date) }))
    .sort((left, right) => left.date.localeCompare(right.date) || left.time.localeCompare(right.time));
  const maxDay = Math.max(localDateOrdinal(todayLocalDate()), ...snapshots.map(item => item.day));
  const days = Array.from({ length: range }, (_, index) => maxDay - (range - 1 - index));
  const selected = snapshots.find(item => item.id === selectedId && item.day === selectedDay);
  const daySnapshots = snapshots.filter(item => item.day === selectedDay);
  const detail = selected?.observations.find(item => item.region === detailRegion && item.side === detailSide) ?? selected?.observations.find(item => item.region === detailRegion);
  const editCurrent = selected?.observations.find(item => item.region === editingRegion && item.side === editingStoredSide) ?? selected?.observations.find(item => item.region === editingRegion);
  const a = snapshots.find(item => item.id === compareA);
  const b = snapshots.find(item => item.id === compareB);
  const compatible = Boolean(a && b && (a.kind === b.kind || (a.kind !== "Sau tập" && b.kind !== "Sau tập") || (a.date === b.date && [a.kind, b.kind].includes("Trước tập") && [a.kind, b.kind].includes("Sau tập"))));
  const trend = snapshots.filter(item => item.kind !== "Sau tập" && item.observations.some(observation => observation.region === trendRegion));
  const chooseDay = (day: number) => { setSelectedDay(day); setSelectedId(snapshots.filter(item => item.day === day).at(-1)?.id ?? null); setDetailRegion(null); setDetailSide(undefined); };
  const saveEdited = (value: Observation) => { if (!selected || selected.remoteId) return; setState(previous => ({ ...previous, history: previous.history.map(item => item.id === selected.id ? { ...item, status: "reported", observations: replaceBodyObservation(item.observations, value, editingStoredSide ?? value.side) } : item) })); };
  const deleteEdited = () => { if (!selected || !editingRegion || !editingStoredSide || selected.remoteId) return; setState(previous => ({ ...previous, history: previous.history.map(item => { if (item.id !== selected.id) return item; const observations = removeBodyObservation(item.observations, editingRegion, editingStoredSide); return { ...item, observations, status: observations.length ? "reported" : null }; }) })); };
  const deleteSelected = async () => {
    if (!selected || deleting) return;
    setDeleting(true);
    setDeleteError("");
    try {
      if (selected.remoteId) {
        const client = await getSupabaseClient();
        if (!client) throw new Error("Backend chưa kết nối.");
        const deleted = await deleteLearnerCheckin(client, selected.remoteId);
        if (!deleted) throw new Error("Không tìm thấy bản ghi thuộc tài khoản này.");
        setState(previous => ({ ...previous, remoteCheckins: previous.remoteCheckins.filter(item => item.remoteId !== selected.remoteId) }));
      } else {
        setState(previous => ({ ...previous, history: previous.history.filter(item => item.id !== selected.id) }));
      }
      setSelectedId(null);
      setDeletePending(false);
    } catch (cause) {
      setDeleteError(cause instanceof Error ? cause.message : "Chưa xóa được bản ghi.");
    } finally {
      setDeleting(false);
    }
  };
  return <MobileScroll className="mcy-scroll"><main className="mcy-page mcy-journey-page">
    <h1>{msg(state.locale, "journey.title")}</h1><p className="mcy-lead">{msg(state.locale, "journey.lead")}</p>
    <div className="mcy-journey-toolbar"><div className="mcy-view-tabs"><button aria-pressed={range === 7} onClick={() => setRange(7)}>{msg(state.locale, "journey.days7")}</button><button aria-pressed={range === 30} onClick={() => setRange(30)}>{msg(state.locale, "journey.days30")}</button></div></div>
    <div className="mcy-timeline-head"><strong>{msg(state.locale, range === 30 ? "journey.timelineRecent" : "journey.timelineChoose")}</strong><button onClick={() => chooseDay(snapshots.at(-1)?.day ?? maxDay)}>{msg(state.locale, "journey.latest")}</button></div>
    <Carousel ariaLabel={msg(state.locale, "journey.title")} className="mcy-timeline-carousel" contentClassName="mcy-timeline-track">{days.map(day => { const count = snapshots.filter(item => item.day === day).length; const date = dateFromOrdinal(day); return <button key={day} className={selectedDay === day ? "selected" : ""} aria-pressed={selectedDay === day} onClick={() => chooseDay(day)}><small>{formatMessage(state.locale, "journey.month", { month: date.slice(5, 7) })}</small><strong>{date.slice(8, 10)}</strong><span>{count ? formatMessage(state.locale, "journey.recordCount", { count: localizedNumber(state.locale, count) }) : msg(state.locale, "journey.noRecord")}</span></button>; })}</Carousel>
    <section className="mcy-snapshot-card" aria-label={msg(state.locale, "journey.currentRecord")}>
      <div className="mcy-snapshot-heading"><span>{msg(state.locale, selected?.remoteId ? "journey.accountRecord" : "journey.sessionRecord")}</span><h2>{selected ? snapshotLabel(selected, state.locale) : `${prettyDate(dateFromOrdinal(selectedDay), state.locale)} · ${msg(state.locale, "journey.noRecordForDay")}`}</h2>{selected?.lessonTitle && <small>{msg(state.locale, "course.reflectionLesson")} {selected.lessonTitle}</small>}</div>
      {daySnapshots.length > 1 && <Carousel ariaLabel={msg(state.locale, "journey.sameDayEntries")} className="mcy-record-carousel" contentClassName="mcy-record-track">{daySnapshots.map(item => <button key={item.id} aria-pressed={selectedId === item.id} onClick={() => setSelectedId(item.id)}>{snapshotLabel(item, state.locale)}</button>)}</Carousel>}
      {selected ? <div className="mcy-snapshot-body">
        <div className="mcy-snapshot-map"><BodyMapComponent observations={selected.observations} bodyStyle={state.bodyStyle} locale={state.locale} onSelect={(region, side) => { setDetailRegion(region); setDetailSide(side); }} showAll={false} /><BodyStylePickerComponent value={state.bodyStyle} onChange={bodyStyle => update({ bodyStyle })} /></div>
        <div className="mcy-snapshot-details">
          <div className="mcy-snapshot-list">{selected.observations.length ? selected.observations.map(item => <button key={`${item.region}-${item.side}`} onClick={() => { setDetailRegion(item.region); setDetailSide(item.side); }}><span className="mcy-snapshot-dot" /><span><strong>{regionLabel(state.locale, item.region)}{isPairedBodyRegion(item.region) && item.side !== "unspecified" ? ` · ${sideLabel(state.locale, item.side)}` : ""}</strong><small>{item.status === "uncertain" ? msg(state.locale, "journey.unsure") : bodyLevelLabel(state.locale, item.level ?? msg(state.locale, "checkin.notRecorded"))}{item.note ? ` · ${msg(state.locale, "journey.hasNote")}` : ""}</small></span><ArrowRightIcon /></button>) : <p>{journeyBodyStatus(state.locale, selected.status)}</p>}</div>
          {selected.outcome && <div className="mcy-snapshot-meta">{msg(state.locale, "journey.overall")} <strong>{guidedChoiceLabel(state.locale, selected.outcome)}</strong></div>}
          {selected.endedEarly && <div className="mcy-snapshot-meta">{msg(state.locale, "journey.endedEarly")}</div>}
          {selected.note && <blockquote className="mcy-snapshot-note">“{selected.note}”</blockquote>}
          <button className="mcy-delete-link" onClick={() => { setDeleteError(""); setDeletePending(true); }}>{msg(state.locale, "journey.deleteEntry")}</button>
        </div>
      </div> : <div className="mcy-snapshot-empty">{msg(state.locale, "journey.emptyDay")}</div>}
    </section>
    <button className="mcy-compare-toggle" onClick={() => { setCompare(!compare); setCompareA(snapshots.find(item => item.kind !== "Sau tập")?.id ?? null); setCompareB(selected?.id ?? snapshots.at(-1)?.id ?? null); }}>{msg(state.locale, compare ? "journey.compareClose" : "journey.compareOpen")}<ArrowRightIcon /></button>
    {compare && <section className="mcy-compare-card"><h2>{msg(state.locale, "journey.compareTitle")}</h2><p>{msg(state.locale, "journey.compareLead")}</p><div className="mcy-compare-pickers"><button onClick={() => setComparePicker("A")}><small>{msg(state.locale, "journey.markerA")}</small><strong>{a ? snapshotLabel(a, state.locale) : msg(state.locale, "journey.chooseMarker")}</strong></button><button onClick={() => setComparePicker("B")}><small>{msg(state.locale, "journey.markerB")}</small><strong>{b ? snapshotLabel(b, state.locale) : msg(state.locale, "journey.chooseMarker")}</strong></button></div>{!compatible ? <p className="mcy-compare-warning">{msg(state.locale, "journey.compareHelp")}</p> : <div className="mcy-compare-rows">{BODY_REGIONS.map(region => { const describe = (snapshot?: Snapshot) => snapshot?.observations.filter(item => item.region === region).map(item => `${isPairedBodyRegion(region) && item.side !== "unspecified" ? `${sideLabel(state.locale, item.side)}: ` : ""}${item.status === "uncertain" ? msg(state.locale, "journey.unsure") : bodyLevelLabel(state.locale, item.level ?? msg(state.locale, "checkin.notRecorded"))}`).join(" · ") || msg(state.locale, "journey.noRecord"); const sidesA = (a?.observations.filter(item => item.region === region) ?? []).map(item => item.side).sort().join(","); const sidesB = (b?.observations.filter(item => item.region === region) ?? []).map(item => item.side).sort().join(","); return <div key={region}><strong>{regionLabel(state.locale, region)}</strong><span>{describe(a)} <ArrowRightIcon /> {describe(b)}{sidesA !== sidesB && sidesA && sidesB && <small>{msg(state.locale, "journey.otherSide")}</small>}</span></div>; })}</div>}</section>}
    <section className="mcy-region-trend"><h2>{msg(state.locale, "journey.trendTitle")}</h2><p>{msg(state.locale, "journey.trendLead")}</p><Carousel ariaLabel={msg(state.locale, "journey.chooseRegionTrend")} className="mcy-trend-carousel" contentClassName="mcy-trend-track">{BODY_REGIONS.map(region => <button key={region} aria-pressed={trendRegion === region} onClick={() => setTrendRegion(region)}>{regionLabel(state.locale, region)}</button>)}</Carousel><div className="mcy-trend-observations">{trend.length ? trend.map(item => { const observations = item.observations.filter(entry => entry.region === trendRegion); const summary = observations.map(observation => `${isPairedBodyRegion(trendRegion) && observation.side !== "unspecified" ? `${sideLabel(state.locale, observation.side)}: ` : ""}${observation.status === "uncertain" ? msg(state.locale, "journey.unsure") : bodyLevelLabel(state.locale, observation.level ?? msg(state.locale, "checkin.notRecorded"))}`).join(" · "); return <button key={item.id} onClick={() => { setSelectedDay(item.day); setSelectedId(item.id); }}><span>{prettyDate(item.date, state.locale)}</span><strong>{summary}</strong><ArrowRightIcon /></button>; }) : <p>{msg(state.locale, "journey.noRegionLevels")}</p>}</div><small>{msg(state.locale, trend.length <= 1 ? "journey.trendNotEnough" : "journey.trendGaps")}</small></section>
    {snapshots.length === 0 && <div className="mcy-empty large"><ReaderIcon /><strong>{msg(state.locale, "journey.emptyTitle")}</strong><p>{msg(state.locale, "journey.emptyLead")}</p></div>}
    <ActionComponent onClick={onStartNext}>{msg(state.locale, "journey.nextCheckin")}</ActionComponent>
    <DemoNoteComponent>{msg(state.locale, "journey.note")}</DemoNoteComponent>
    <BottomSheet open={Boolean(detailRegion)} onOpenChange={open => { if (!open) { setDetailRegion(null); setDetailSide(undefined); } }} title={detailRegion ? `${regionLabel(state.locale, detailRegion)}${isPairedBodyRegion(detailRegion) && detailSide && detailSide !== "unspecified" ? ` · ${sideLabel(state.locale, detailSide)}` : ""}` : msg(state.locale, "journey.detail")} description={selected ? snapshotLabel(selected, state.locale) : msg(state.locale, "journey.currentRecord")} snap={0.49}><div className="mcy-detail-sheet">{detail ? <><strong>{observationLabel(detail, state.locale)}</strong><p>{detail.note || msg(state.locale, "journey.noNote")}</p>{!selected?.remoteId && <button className="mcy-quiet-link" onClick={() => { setEditingRegion(detail.region); setEditingStoredSide(detail.side); setEditingSuggestedSide(detail.side); setDetailRegion(null); setDetailSide(undefined); }}>{msg(state.locale, "journey.editObservation")}</button>}</> : <p>{msg(state.locale, "journey.regionNotRecorded")}</p>}</div></BottomSheet>
    <RegionEditorComponent region={editingRegion} current={editCurrent} suggestedSide={editingSuggestedSide} onSave={saveEdited} onDelete={deleteEdited} onClose={() => { setEditingRegion(null); setEditingStoredSide(undefined); setEditingSuggestedSide(undefined); }} />
    <BottomSheet open={Boolean(comparePicker)} onOpenChange={open => { if (!open) setComparePicker(null); }} title={formatMessage(state.locale, "journey.chooseCompareMarker", { marker: comparePicker ?? "" })} snap={0.63}><div className="mcy-picker-list">{snapshots.map(item => <button key={item.id} onClick={() => { if (comparePicker === "A") setCompareA(item.id); else setCompareB(item.id); setComparePicker(null); }}>{snapshotLabel(item, state.locale)}</button>)}</div></BottomSheet>
    <BottomSheet open={deletePending} onOpenChange={setDeletePending} title={msg(state.locale, "journey.deleteTitle")} description={msg(state.locale, selected?.remoteId ? "journey.deleteRemote" : "journey.deleteLocal")} snap={0.36}><div className="mcy-sheet-actions">{deleteError && <div className="mcy-form-error" role="alert">{deleteError}</div>}<button className="mcy-action danger-action" disabled={deleting} onClick={() => { void deleteSelected(); }}>{msg(state.locale, deleting ? "journey.deleting" : "journey.deleteAction")} <ArrowRightIcon /></button><button className="mcy-quiet-link" disabled={deleting} onClick={() => setDeletePending(false)}>{msg(state.locale, "journey.keepEntry")}</button></div></BottomSheet>
  </main></MobileScroll>;
}
