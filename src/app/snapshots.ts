import { newId } from "../compat";
import type { AppLocale } from "../i18n";
import { decodeBodyRegionCode } from "../bodyRegions";
import type { LearnerCheckin, LearnerObservation } from "../backend/learnerData";
import type { BodyLevel, BodyStatus, Observation, Snapshot } from "./model";

export function currentAppLocale(): AppLocale { return typeof document !== "undefined" && document.documentElement.lang === "en" ? "en-US" : "vi-VN"; }
export function makeSnapshot(kind: Snapshot["kind"], status: BodyStatus, observations: Observation[], extra: Partial<Snapshot> = {}, recordedAt = new Date()): Snapshot {
  const date = `${recordedAt.getFullYear()}-${String(recordedAt.getMonth() + 1).padStart(2, "0")}-${String(recordedAt.getDate()).padStart(2, "0")}`;
  return { id: newId(), day: localDateOrdinal(date), date, time: recordedAt.toLocaleTimeString(currentAppLocale(), { hour: "2-digit", minute: "2-digit" }), kind, status, observations: observations.map(item => ({ ...item })), ...extra };
}
export function localDateOrdinal(isoDate: string) { return Math.floor(Date.parse(`${isoDate}T00:00:00Z`) / 86_400_000); }
export function todayLocalDate() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}
export function mapDatabaseObservation(row: LearnerObservation): Observation {
  const decoded = decodeBodyRegionCode(row.region_code);
  if (!decoded) throw new Error(`Unsupported body region from database: ${row.region_code}`);
  const level: BodyLevel | null = row.state === "no_discomfort" ? "Không khó chịu" : row.level === 1 ? "Nhẹ" : row.level === 2 ? "Vừa" : row.level !== null && row.level >= 3 ? "Nhiều" : null;
  return { ...decoded, level, status: row.state === "uncertain" || row.state === "skipped" ? "uncertain" : "reported", note: row.note ?? "" };
}
export function observationsFromDatabase(rows: LearnerObservation[]) {
  const values = rows.map(mapDatabaseObservation);
  const consumed = new Set<number>();
  const result: Observation[] = [];
  values.forEach((item, index) => {
    if (consumed.has(index)) return;
    const partnerIndex = item.side === "left" ? values.findIndex((candidate, candidateIndex) =>
      candidateIndex !== index && !consumed.has(candidateIndex) && candidate.region === item.region
      && candidate.side === "right" && candidate.level === item.level && candidate.status === item.status && candidate.note === item.note,
    ) : -1;
    if (partnerIndex >= 0) {
      consumed.add(partnerIndex);
      result.push({ ...item, side: "both" });
    } else result.push(item);
    consumed.add(index);
  });
  return result;
}
export function snapshotFromDatabase(row: LearnerCheckin, rows: LearnerObservation[]): Snapshot {
  const date = row.local_date;
  return {
    id: row.id,
    remoteId: row.id,
    day: localDateOrdinal(date),
    date,
    time: new Date(row.created_at).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
    kind: row.capture_type === "standalone" ? "Ghi riêng" : "Trước tập",
    status: (row.body_status as BodyStatus) ?? null,
    observations: observationsFromDatabase(rows.filter(item => item.checkin_id === row.id)),
  };
}
