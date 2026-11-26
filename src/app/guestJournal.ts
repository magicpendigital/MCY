import type { BodyLevel, BodyStatus, Observation, Outcome, Snapshot } from "./model";

// Device-only journal for guests (no account). A guest's saved check-ins stay on this device under one versioned
// key and are never sent anywhere. They are shown only while the app is in guest mode: a signed-in account never
// sees them and they are not uploaded; they reappear when the device is back in guest mode.
// Blocked storage (private mode, storage disabled) keeps entries in memory for this session only, and the caller
// is told so through `persistent: false`.
export const GUEST_JOURNAL_KEY = "mcy.guest.journal.v1";
export const GUEST_JOURNAL_LIMIT = 60;
export const GUEST_JOURNAL_PROBE_KEY = "mcy.guest.journal.probe";
const VERSION = 1;
const MAX_OBSERVATIONS = 40;
const MAX_NOTE = 2000;

type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;
export type GuestJournalLoad = { entries: Snapshot[]; persistent: boolean };

const KINDS: readonly Snapshot["kind"][] = ["Trước tập", "Sau tập", "Ghi riêng"];
const STATUSES: readonly Exclude<BodyStatus, null>[] = ["reported", "none_now", "uncertain", "skipped", "tired", "uncomfortable"];
const LEVELS: readonly BodyLevel[] = ["Không khó chịu", "Nhẹ", "Vừa", "Nhiều"];
const SIDES: readonly Observation["side"][] = ["unspecified", "left", "right", "both"];
const DATE = /^\d{4}-\d{2}-\d{2}$/;
// A "Sau tập" entry from the end of a Chút sequence also keeps its title, the one-tap answer and whether it ended early.
const OUTCOMES: readonly Exclude<Outcome, null>[] = ["Dễ chịu hơn", "Như cũ", "Khó chịu hơn", "Chưa rõ"];
const MAX_LESSON_TITLE = 200;

function defaultStorage(): StorageLike | null {
  try { return typeof window === "undefined" ? null : window.localStorage; } catch { return null; }
}
function dayOf(isoDate: string) { return Math.floor(Date.parse(`${isoDate}T00:00:00Z`) / 86_400_000); }

function parseObservation(value: unknown, regions: ReadonlySet<string>): Observation | null {
  const item = value as Partial<Observation> | null;
  if (!item || typeof item !== "object") return null;
  if (typeof item.region !== "string" || !regions.has(item.region)) return null;
  if (!SIDES.includes(item.side as Observation["side"])) return null;
  if (item.level !== null && !LEVELS.includes(item.level as BodyLevel)) return null;
  if (item.status !== "reported" && item.status !== "uncertain") return null;
  return { region: item.region, side: item.side as Observation["side"], level: item.level ?? null, status: item.status, note: typeof item.note === "string" ? item.note.slice(0, MAX_NOTE) : "" };
}

function parseEntry(value: unknown, regions: ReadonlySet<string>): Snapshot | null {
  const item = value as Partial<Snapshot> | null;
  if (!item || typeof item !== "object") return null;
  if (typeof item.id !== "string" || !item.id || item.id.length > 80) return null;
  if (typeof item.date !== "string" || !DATE.test(item.date) || !Number.isFinite(dayOf(item.date))) return null;
  if (typeof item.time !== "string" || item.time.length > 20) return null;
  if (!KINDS.includes(item.kind as Snapshot["kind"])) return null;
  if (item.status !== null && !STATUSES.includes(item.status as Exclude<BodyStatus, null>)) return null;
  if (!Array.isArray(item.observations) || item.observations.length > MAX_OBSERVATIONS) return null;
  const observations = item.observations.map(entry => parseObservation(entry, regions));
  if (observations.some(entry => entry === null)) return null;
  const entry: Snapshot = { id: item.id, day: dayOf(item.date), date: item.date, time: item.time, kind: item.kind as Snapshot["kind"], status: item.status ?? null, observations: observations as Observation[] };
  if (typeof item.lessonTitle === "string" && item.lessonTitle && item.lessonTitle.length <= MAX_LESSON_TITLE) entry.lessonTitle = item.lessonTitle;
  if (OUTCOMES.includes(item.outcome as Exclude<Outcome, null>)) entry.outcome = item.outcome as Outcome;
  if (item.endedEarly === true) entry.endedEarly = true;
  return entry;
}

/** Reads stored entries, dropping anything malformed. Never throws. */
export function parseGuestJournal(raw: string | null, regions: readonly string[]): Snapshot[] {
  if (!raw) return [];
  try {
    const data = JSON.parse(raw) as { version?: unknown; entries?: unknown };
    if (!data || data.version !== VERSION || !Array.isArray(data.entries)) return [];
    const known = new Set(regions);
    const seen = new Set<string>();
    const entries: Snapshot[] = [];
    for (const value of data.entries) {
      const entry = parseEntry(value, known);
      if (!entry || seen.has(entry.id)) continue;
      seen.add(entry.id);
      entries.push(entry);
    }
    return entries.slice(-GUEST_JOURNAL_LIMIT);
  } catch {
    return [];
  }
}

/** Only the fields a check-in (or a Chút "Sau tập" answer) needs; the newest GUEST_JOURNAL_LIMIT entries are kept, the oldest dropped. */
export function serializeGuestJournal(entries: readonly Snapshot[]): string {
  const kept = entries.slice(-GUEST_JOURNAL_LIMIT).map(item => ({
    id: item.id, date: item.date, time: item.time, kind: item.kind, status: item.status,
    observations: item.observations.map(entry => ({ region: entry.region, side: entry.side, level: entry.level, status: entry.status, note: entry.note })),
    ...(item.lessonTitle ? { lessonTitle: item.lessonTitle.slice(0, MAX_LESSON_TITLE) } : {}),
    ...(item.outcome ? { outcome: item.outcome } : {}),
    ...(item.endedEarly ? { endedEarly: true } : {}),
  }));
  return JSON.stringify({ version: VERSION, entries: kept });
}

export function appendGuestEntry(entries: readonly Snapshot[], entry: Snapshot): Snapshot[] {
  return [...entries.filter(item => item.id !== entry.id), entry].slice(-GUEST_JOURNAL_LIMIT);
}

/** Reads the journal without ever rewriting or removing the stored value: a corrupt value, another version or an
 * unknown region (e.g. after a rollback) stays byte-identical on the device; only unparseable entries are left out
 * in memory. Writability is probed on a separate scratch key. */
export function loadGuestJournal(regions: readonly string[], storage: StorageLike | null = defaultStorage()): GuestJournalLoad {
  if (!storage) return { entries: [], persistent: false };
  let raw: string | null;
  try { raw = storage.getItem(GUEST_JOURNAL_KEY); } catch { return { entries: [], persistent: false }; }
  // A device that can read but not write (Safari private mode on old iOS) must still be told entries will not last.
  return { entries: parseGuestJournal(raw, regions), persistent: canWrite(storage) };
}

function canWrite(storage: StorageLike): boolean {
  try {
    storage.setItem(GUEST_JOURNAL_PROBE_KEY, "1");
    storage.removeItem(GUEST_JOURNAL_PROBE_KEY);
    return true;
  } catch {
    return false;
  }
}

/** Writes the whole journal (or removes the key when it is empty). Called only after the guest changed the journal.
 * Returns false when storage is blocked. */
export function writeGuestJournal(entries: readonly Snapshot[], storage: StorageLike | null = defaultStorage()): boolean {
  if (!storage) return false;
  try {
    if (entries.length) storage.setItem(GUEST_JOURNAL_KEY, serializeGuestJournal(entries));
    else storage.removeItem(GUEST_JOURNAL_KEY);
    return true;
  } catch {
    return false;
  }
}
