import { useEffect, useState } from "react";
import { ArrowRightIcon } from "@radix-ui/react-icons";
import { bodyLevelLabel, msg, regionLabel, sideLabel } from "../../i18n";
import { BottomSheet, KeyboardTextarea, useKeyboard } from "../../mobile";
import { isPairedBodyRegion, type BodyRegion, type BodySide } from "../../bodyRegions";
import type { BodyLevel, Observation } from "../model";
import { useDemo } from "../state";
import { Choice } from "../ui/controls";
import { EDITOR_LEVELS } from "./bodyLayout";

export function RegionEditor({ region, current, suggestedSide, onSave, onDelete, onClose }: { region: BodyRegion | null; current?: Observation; suggestedSide?: BodySide; onSave: (value: Observation) => void; onDelete?: () => void; onClose: () => void }) {
  const { state } = useDemo();
  const locale = state.locale;
  const keyboard = useKeyboard();
  const [level, setLevel] = useState<BodyLevel | "Chưa rõ" | null>(current?.status === "uncertain" ? "Chưa rõ" : current?.level ?? null);
  const [side, setSide] = useState<BodySide>(suggestedSide ?? current?.side ?? "unspecified");
  const [note, setNote] = useState(current?.note ?? "");
  useEffect(() => { setLevel(current?.status === "uncertain" ? "Chưa rõ" : current?.level ?? null); setSide(suggestedSide ?? current?.side ?? "unspecified"); setNote(current?.note ?? ""); }, [region, current?.level, current?.side, current?.note, current?.status, suggestedSide]);
  const close = () => { keyboard.hide(); onClose(); };
  return <BottomSheet open={Boolean(region)} onOpenChange={open => { if (!open) close(); }} title={region ? locale === "en-US" ? `Check in on your ${regionLabel(locale, region).toLowerCase()}` : `Ghi nhận vùng ${regionLabel(locale, region).toLowerCase()}` : locale === "en-US" ? "Check in on an area" : "Ghi nhận vùng"} description={msg(locale, "regionEditor.prompt")} snap={0.9}>
    {region && <div className="mcy-region-editor">
      <div className="mcy-editor-options">{([...EDITOR_LEVELS, ...(level === "Vừa" ? ["Vừa" as const] : []), "Chưa rõ" as const]).map(value => <Choice key={value} selected={level === value} onClick={() => setLevel(value)}>{bodyLevelLabel(locale, value)}</Choice>)}</div>
      {isPairedBodyRegion(region) && <><strong>{msg(locale, "regionEditor.side")}</strong><div className="mcy-editor-options side">{(["unspecified", "left", "right", "both"] as BodySide[]).map(value => <Choice key={value} selected={side === value} onClick={() => setSide(value)}>{sideLabel(locale, value)}</Choice>)}</div></>}
      <label className="mcy-editor-note">{msg(locale, "regionEditor.note")} <small>{msg(locale, "regionEditor.optional")}</small><KeyboardTextarea placeholder={locale === "en-US" ? `For example: my ${regionLabel(locale, region).toLowerCase()} feels tired after sitting...` : `Ví dụ: ${regionLabel(locale, region).toLowerCase()} mỏi khi ngồi lâu...`} value={note} onChange={event => setNote(event.target.value)} onBlur={() => keyboard.hide()} /></label>
      <button className="mcy-action" disabled={!level} onClick={() => { if (!level) return; keyboard.hide(); onSave({ region, side: isPairedBodyRegion(region) ? side : "unspecified", level: level === "Chưa rõ" ? null : level, status: level === "Chưa rõ" ? "uncertain" : "reported", note: note.trim() }); onClose(); }}>{msg(locale, "regionEditor.save")} <ArrowRightIcon /></button>
      {current && onDelete && <button className="mcy-quiet-link" onClick={() => { keyboard.hide(); onDelete(); onClose(); }}>{msg(locale, "regionEditor.delete")}</button>}
    </div>}
  </BottomSheet>;
}
