import assert from "node:assert/strict";
import test from "node:test";
import { BODY_REGIONS } from "../src/bodyRegions.ts";
import {
  appendGuestEntry, GUEST_JOURNAL_KEY, GUEST_JOURNAL_PROBE_KEY, GUEST_JOURNAL_LIMIT, loadGuestJournal, parseGuestJournal, serializeGuestJournal, writeGuestJournal,
} from "../src/app/guestJournal.ts";

// Fictional entries only: a guest's device-only check-in journal (plan 2026-11-24 step 2).
const entry = (id, date = "2026-11-20", extra = {}) => ({
  id, day: 0, date, time: "08:30", kind: "Ghi riêng", status: "reported",
  observations: [{ region: "neck", side: "unspecified", level: "Nhẹ", status: "reported", note: "" }], ...extra,
});
function memoryStorage(initial = {}) {
  const data = new Map(Object.entries(initial));
  return {
    data,
    getItem: key => data.has(key) ? data.get(key) : null,
    setItem: (key, value) => { data.set(key, String(value)); },
    removeItem: key => { data.delete(key); },
  };
}
const blockedStorage = {
  getItem: () => { throw new Error("SecurityError"); },
  setItem: () => { throw new Error("QuotaExceededError"); },
  removeItem: () => { throw new Error("SecurityError"); },
};

test("the key is versioned and a round trip keeps the entries, recomputing the day from the date", () => {
  assert.equal(GUEST_JOURNAL_KEY, "mcy.guest.journal.v1");
  const raw = serializeGuestJournal([entry("a"), entry("b", "2026-11-21", { status: "tired", observations: [] })]);
  const parsed = parseGuestJournal(raw, BODY_REGIONS);
  assert.deepEqual(parsed.map(item => item.id), ["a", "b"]);
  assert.equal(parsed[0].day, Math.floor(Date.parse("2026-11-20T00:00:00Z") / 86_400_000));
  assert.equal(parsed[1].status, "tired");
  assert.deepEqual(parsed[0].observations, entry("a").observations);
});

test("only the newest 60 entries are kept; the oldest are dropped", () => {
  let entries = [];
  for (let index = 0; index < GUEST_JOURNAL_LIMIT + 5; index += 1) entries = appendGuestEntry(entries, entry(`e${index}`));
  assert.equal(GUEST_JOURNAL_LIMIT, 60);
  assert.equal(entries.length, 60);
  assert.equal(entries[0].id, "e5");
  assert.equal(entries[59].id, "e64");
  const tooMany = JSON.stringify({ version: 1, entries: Array.from({ length: 70 }, (_, index) => entry(`s${index}`)) });
  const parsed = parseGuestJournal(tooMany, BODY_REGIONS);
  assert.equal(parsed.length, 60);
  assert.equal(parsed[0].id, "s10");
});

test("malformed, unknown-version or tampered data is dropped instead of crashing", () => {
  assert.deepEqual(parseGuestJournal(null, BODY_REGIONS), []);
  assert.deepEqual(parseGuestJournal("{not json", BODY_REGIONS), []);
  assert.deepEqual(parseGuestJournal(JSON.stringify({ version: 2, entries: [entry("a")] }), BODY_REGIONS), []);
  const mixed = JSON.stringify({ version: 1, entries: [
    entry("ok"),
    entry("bad-region", undefined, { observations: [{ region: "spleen", side: "unspecified", level: "Nhẹ", status: "reported", note: "" }] }),
    entry("bad-date", "20-11-2026"),
    entry("bad-kind", undefined, { kind: "Khác" }),
    entry("bad-status", undefined, { status: "cured" }),
    entry("bad-level", undefined, { observations: [{ region: "neck", side: "left", level: "100%", status: "reported", note: "" }] }),
    entry("ok"),
    null, 7, "text",
  ] });
  assert.deepEqual(parseGuestJournal(mixed, BODY_REGIONS).map(item => item.id), ["ok"]);
});

test("load and write use one key on the device; an empty journal removes the key", () => {
  const storage = memoryStorage({ [GUEST_JOURNAL_KEY]: serializeGuestJournal([entry("a")]) });
  const loaded = loadGuestJournal(BODY_REGIONS, storage);
  assert.equal(loaded.persistent, true);
  assert.deepEqual(loaded.entries.map(item => item.id), ["a"]);
  assert.equal(writeGuestJournal(appendGuestEntry(loaded.entries, entry("b")), storage), true);
  assert.deepEqual(parseGuestJournal(storage.getItem(GUEST_JOURNAL_KEY), BODY_REGIONS).map(item => item.id), ["a", "b"]);
  assert.equal(writeGuestJournal([], storage), true);
  assert.equal(storage.getItem(GUEST_JOURNAL_KEY), null);
  assert.deepEqual([...storage.data.keys()], []);
});

test("a fresh device probes storage without leaving anything behind", () => {
  const storage = memoryStorage();
  assert.deepEqual(loadGuestJournal(BODY_REGIONS, storage), { entries: [], persistent: true });
  assert.equal(storage.data.size, 0);
});

test("blocked or missing storage never throws and reports session-only memory", () => {
  assert.deepEqual(loadGuestJournal(BODY_REGIONS, blockedStorage), { entries: [], persistent: false });
  assert.deepEqual(loadGuestJournal(BODY_REGIONS, null), { entries: [], persistent: false });
  assert.equal(writeGuestJournal([entry("a")], blockedStorage), false);
  const readOnly = { ...memoryStorage(), setItem: () => { throw new Error("QuotaExceededError"); } };
  assert.equal(loadGuestJournal(BODY_REGIONS, readOnly).persistent, false);
});

test("loading never rewrites or removes the stored value, even when parts of it cannot be read", () => {
  const values = [
    "{not json",
    JSON.stringify({ version: 2, entries: [entry("future")] }),
    JSON.stringify({ version: 1, entries: [entry("kept"), entry("rolled-back", undefined, { observations: [{ region: "future-region", side: "left", level: "Nhẹ", status: "reported", note: "" }] })] }),
    `  ${serializeGuestJournal([entry("spaced")])}  `,
  ];
  for (const value of values) {
    const storage = memoryStorage({ [GUEST_JOURNAL_KEY]: value, other: "untouched" });
    const writes = [];
    const setItem = storage.setItem; const removeItem = storage.removeItem;
    storage.setItem = (key, next) => { writes.push(["set", key]); setItem(key, next); };
    storage.removeItem = key => { writes.push(["remove", key]); removeItem(key); };
    const loaded = loadGuestJournal(BODY_REGIONS, storage);
    assert.equal(loaded.persistent, true);
    assert.equal(storage.getItem(GUEST_JOURNAL_KEY), value);
    assert.equal(storage.getItem("other"), "untouched");
    assert.deepEqual([...storage.data.keys()].sort(), [GUEST_JOURNAL_KEY, "other"].sort());
    assert.ok(writes.every(([, key]) => key === GUEST_JOURNAL_PROBE_KEY), `only the probe key is written: ${JSON.stringify(writes)}`);
  }
  // Only the unreadable entry is left out in memory.
  assert.deepEqual(loadGuestJournal(BODY_REGIONS, memoryStorage({ [GUEST_JOURNAL_KEY]: values[2] })).entries.map(item => item.id), ["kept"]);
});
