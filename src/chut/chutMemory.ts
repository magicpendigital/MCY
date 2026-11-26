// Chút slice 1: what this device remembers for the Chút card, under one versioned key. Only counters and one switch:
// how many sequences reached the end screen, how many times the account invitation was shown, from which session it may
// be shown again, and whether clips advance automatically. No body data, no identifiers. It never reads or writes the
// guest journal key. Blocked storage keeps the values in memory for this app run only.
// Owner decisions 26/11: first invitation after the 2nd session (N), after "Để sau" wait 3 more sessions (K), at most 3
// invitations in total (M), at most once per app run; auto-advance is on by default.

export const CHUT_MEMORY_KEY = "mcy.chut.v1";
export const CHUT_INVITE_FIRST_SESSION = 2; // N
export const CHUT_INVITE_WAIT_SESSIONS = 3; // K
export const CHUT_INVITE_MAX = 3; // M
const VERSION = 1;
const MAX_COUNT = 100_000;

export type ChutMemory = { version: 1; sessions: number; invitesShown: number; nextInviteAt: number; autoAdvance: boolean };
type StorageLike = Pick<Storage, "getItem" | "setItem">;

export const DEFAULT_CHUT_MEMORY: ChutMemory = { version: VERSION, sessions: 0, invitesShown: 0, nextInviteAt: CHUT_INVITE_FIRST_SESSION, autoAdvance: true };

const count = (value: unknown): value is number => typeof value === "number" && Number.isInteger(value) && value >= 0 && value <= MAX_COUNT;

/** Reads a stored value; anything malformed or of another version gives the defaults. Never throws. */
export function parseChutMemory(raw: string | null): ChutMemory {
  if (!raw) return { ...DEFAULT_CHUT_MEMORY };
  try {
    const data = JSON.parse(raw) as Partial<Record<keyof ChutMemory, unknown>> | null;
    if (!data || typeof data !== "object" || data.version !== VERSION) return { ...DEFAULT_CHUT_MEMORY };
    if (!count(data.sessions) || !count(data.invitesShown) || !count(data.nextInviteAt) || typeof data.autoAdvance !== "boolean") return { ...DEFAULT_CHUT_MEMORY };
    return { version: VERSION, sessions: data.sessions, invitesShown: Math.min(data.invitesShown, CHUT_INVITE_MAX), nextInviteAt: Math.max(data.nextInviteAt, CHUT_INVITE_FIRST_SESSION), autoAdvance: data.autoAdvance };
  } catch {
    return { ...DEFAULT_CHUT_MEMORY };
  }
}

export function serializeChutMemory(memory: ChutMemory): string {
  return JSON.stringify({ version: VERSION, sessions: memory.sessions, invitesShown: memory.invitesShown, nextInviteAt: memory.nextInviteAt, autoAdvance: memory.autoAdvance });
}

/** One more sequence reached the end screen (finished or ended early). */
export function recordSession(memory: ChutMemory): ChutMemory {
  return { ...memory, sessions: Math.min(memory.sessions + 1, MAX_COUNT) };
}

/** The account invitation may open now: a guest only (checked by the caller), from session N, not before the wait after
 * "Để sau", at most M times in total and at most once per app run. */
export function inviteEligible(memory: ChutMemory, shownThisRun: boolean): boolean {
  return !shownThisRun
    && memory.sessions >= CHUT_INVITE_FIRST_SESSION
    && memory.sessions >= memory.nextInviteAt
    && memory.invitesShown < CHUT_INVITE_MAX;
}

/** The invitation was shown at the current session; whatever the answer, the next one waits K more sessions. */
export function recordInviteShown(memory: ChutMemory): ChutMemory {
  return { ...memory, invitesShown: Math.min(memory.invitesShown + 1, CHUT_INVITE_MAX), nextInviteAt: memory.sessions + CHUT_INVITE_WAIT_SESSIONS };
}

export function withAutoAdvance(memory: ChutMemory, autoAdvance: boolean): ChutMemory {
  return { ...memory, autoAdvance };
}

function defaultStorage(): StorageLike | null {
  try { return typeof window === "undefined" ? null : window.localStorage; } catch { return null; }
}

// The in-memory copy is the source of truth for this run; storage is a best-effort mirror.
let current: ChutMemory | null = null;
let inviteShownThisRun = false;

export function loadChutMemory(storage: StorageLike | null = defaultStorage()): ChutMemory {
  if (current) return current;
  let raw: string | null = null;
  try { raw = storage ? storage.getItem(CHUT_MEMORY_KEY) : null; } catch { raw = null; }
  current = parseChutMemory(raw);
  return current;
}

/** Keeps the new value for this run and tries to store it. Returns false when storage is blocked. */
export function saveChutMemory(memory: ChutMemory, storage: StorageLike | null = defaultStorage()): boolean {
  current = memory;
  if (!storage) return false;
  try { storage.setItem(CHUT_MEMORY_KEY, serializeChutMemory(memory)); return true; } catch { return false; }
}

export function updateChutMemory(change: (memory: ChutMemory) => ChutMemory, storage: StorageLike | null = defaultStorage()): ChutMemory {
  const next = change(loadChutMemory(storage));
  saveChutMemory(next, storage);
  return next;
}

export function inviteShownInThisRun(): boolean { return inviteShownThisRun; }
export function markInviteShownInThisRun() { inviteShownThisRun = true; }

/** Test helper: forget the in-memory copy and the once-per-run flag, as a fresh app start would. */
export function resetChutMemoryForRun() { current = null; inviteShownThisRun = false; }
