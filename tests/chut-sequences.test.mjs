import assert from "node:assert/strict";
import test from "node:test";
import { FREE_COURSES } from "../src/courses/freeCourses.ts";
import {
  approxMinutes, buildChutSequence, chipSummary, CHUT_FALLBACK_CLIPS, CHUT_REGIONS, chutRegion, clipSeconds, remainingLabel,
} from "../src/chut/sequences.ts";
import {
  CHUT_INVITE_FIRST_SESSION, CHUT_INVITE_MAX, CHUT_INVITE_WAIT_SESSIONS, CHUT_MEMORY_KEY, DEFAULT_CHUT_MEMORY, inviteEligible, loadChutMemory,
  parseChutMemory, recordInviteShown, recordSession, resetChutMemoryForRun, saveChutMemory, serializeChutMemory, updateChutMemory, withAutoAdvance,
} from "../src/chut/chutMemory.ts";

// Chút slice 1 (plan 2026-11-25, Owner decisions 26/11). Fictional catalogue entries only, plus the bundled free catalogue.
const lesson = (id, duration = "0:40", visibility = "unlisted") => ({ id, title: `Bài ${id}`, youtubeId: `yt${id}`, duration, visibility, orientation: "portrait" });
const course = (id, lessons) => ({ id, title: id, lessons });
const memoryStorage = (initial = {}) => {
  const data = new Map(Object.entries(initial));
  return { data, getItem: key => data.has(key) ? data.get(key) : null, setItem: (key, value) => { data.set(key, String(value)); } };
};
const ids = sequence => sequence.clips.map(clip => `${clip.courseId}/${clip.lessonId}`);

test("the four areas keep the Owner-approved order", () => {
  assert.deepEqual(CHUT_REGIONS.map(region => region.label), ["Cổ và vai", "Lưng", "Hông và chân", "Toàn thân"]);
  const order = Object.fromEntries(CHUT_REGIONS.map(region => [region.id, region.clips.map(clip => `${clip.courseId}/${clip.lessonId}`)]));
  assert.deepEqual(order, {
    "neck-shoulders": ["gentle/06", "gentle/07", "gentle/11", "gentle/14"],
    back: ["gentle/04", "gentle/16", "poses/27", "gentle/15"],
    "hips-legs": ["gentle/12", "gentle/08", "gentle/02"],
    "whole-body": ["gentle/10", "gentle/13", "gentle/09", "gentle/01"],
  });
  assert.deepEqual(CHUT_FALLBACK_CLIPS.map(clip => clip.lessonId), ["01", "10"]);
  assert.equal(chutRegion("back")?.label, "Lưng");
  assert.equal(chutRegion("nope"), null);
  assert.equal(chutRegion(null), null);
});

test("every clip of every area exists in the bundled free catalogue", () => {
  for (const region of CHUT_REGIONS) {
    const sequence = buildChutSequence(FREE_COURSES, region);
    assert.equal(sequence.fallback, false, region.id);
    assert.deepEqual(ids(sequence), region.clips.map(clip => `${clip.courseId}/${clip.lessonId}`));
    assert.ok(sequence.totalSeconds > 0);
    assert.match(chipSummary(sequence), /^\d bài · ~\d+(,5)? phút$/);
  }
  const back = buildChutSequence(FREE_COURSES, chutRegion("back"));
  assert.equal(back.clips[2].lesson.title.includes("Bò mèo"), true);
});

test("missing or private clips are skipped; fewer than two left falls back to the gentle pair", () => {
  const courses = [course("gentle", [lesson("01", "0:30"), lesson("06", "0:43"), lesson("07", "1:10", "private"), lesson("10", "0:50"), lesson("11", "0:20")]), course("poses", [])];
  const neck = buildChutSequence(courses, chutRegion("neck-shoulders"));
  assert.equal(neck.fallback, false);
  assert.deepEqual(ids(neck), ["gentle/06", "gentle/11"]);
  assert.equal(neck.totalSeconds, 63);
  const back = buildChutSequence(courses, chutRegion("back"));
  assert.equal(back.fallback, true);
  assert.deepEqual(ids(back), ["gentle/01", "gentle/10"]);
  const empty = buildChutSequence([], chutRegion("back"));
  assert.equal(empty.fallback, true);
  assert.deepEqual(empty.clips, []);
});

test("durations, rounded minutes and remaining time", () => {
  assert.equal(clipSeconds("0:43"), 43);
  assert.equal(clipSeconds("12:05"), 725);
  assert.equal(clipSeconds("abc"), 0);
  assert.equal(clipSeconds(""), 0);
  assert.equal(approxMinutes(117), "2");
  assert.equal(approxMinutes(149), "2,5");
  assert.equal(approxMinutes(10), "1");
  assert.equal(approxMinutes(0), "1");
  assert.equal(chipSummary({ clips: [1, 2, 3], totalSeconds: 150 }), "3 bài · ~2,5 phút");
  const clips = [{ seconds: 40 }, { seconds: 50 }, { seconds: 30 }];
  assert.equal(remainingLabel(clips, 0), "2 phút");
  assert.equal(remainingLabel(clips, 1), "1 phút 20 giây");
  assert.equal(remainingLabel(clips, 2), "30 giây");
});

test("chut memory parses only valid values and never throws", () => {
  assert.equal(CHUT_MEMORY_KEY, "mcy.chut.v1");
  assert.notEqual(CHUT_MEMORY_KEY, "mcy.guest.journal.v1");
  assert.deepEqual(parseChutMemory(null), DEFAULT_CHUT_MEMORY);
  assert.deepEqual(parseChutMemory("{not json"), DEFAULT_CHUT_MEMORY);
  assert.deepEqual(parseChutMemory("null"), DEFAULT_CHUT_MEMORY);
  assert.deepEqual(parseChutMemory(JSON.stringify({ version: 2, sessions: 3, invitesShown: 0, nextInviteAt: 2, autoAdvance: true })), DEFAULT_CHUT_MEMORY);
  assert.deepEqual(parseChutMemory(JSON.stringify({ version: 1, sessions: -1, invitesShown: 0, nextInviteAt: 2, autoAdvance: true })), DEFAULT_CHUT_MEMORY);
  assert.deepEqual(parseChutMemory(JSON.stringify({ version: 1, sessions: 1.5, invitesShown: 0, nextInviteAt: 2, autoAdvance: true })), DEFAULT_CHUT_MEMORY);
  assert.deepEqual(parseChutMemory(JSON.stringify({ version: 1, sessions: 2, invitesShown: 0, nextInviteAt: 2, autoAdvance: "yes" })), DEFAULT_CHUT_MEMORY);
  const clamped = parseChutMemory(JSON.stringify({ version: 1, sessions: 9, invitesShown: 99, nextInviteAt: 0, autoAdvance: false }));
  assert.deepEqual(clamped, { version: 1, sessions: 9, invitesShown: CHUT_INVITE_MAX, nextInviteAt: CHUT_INVITE_FIRST_SESSION, autoAdvance: false });
  const value = { version: 1, sessions: 4, invitesShown: 1, nextInviteAt: 5, autoAdvance: false };
  assert.deepEqual(parseChutMemory(serializeChutMemory(value)), value);
  assert.deepEqual(Object.keys(JSON.parse(serializeChutMemory({ ...value, extra: "x" }))).sort(), ["autoAdvance", "invitesShown", "nextInviteAt", "sessions", "version"]);
  assert.equal(DEFAULT_CHUT_MEMORY.autoAdvance, true);
});

test("invitation: from session 2, wait 3 after Để sau, at most 3 times, once per run", () => {
  assert.equal(CHUT_INVITE_FIRST_SESSION, 2);
  assert.equal(CHUT_INVITE_WAIT_SESSIONS, 3);
  assert.equal(CHUT_INVITE_MAX, 3);
  let memory = { ...DEFAULT_CHUT_MEMORY };
  memory = recordSession(memory);
  assert.equal(inviteEligible(memory, false), false, "not after the first session");
  memory = recordSession(memory);
  assert.equal(inviteEligible(memory, false), true, "after the second session");
  assert.equal(inviteEligible(memory, true), false, "once per app run");
  memory = recordInviteShown(memory);
  assert.equal(memory.nextInviteAt, 5);
  const shownAt = [2];
  for (let session = 3; session <= 20; session += 1) {
    memory = recordSession(memory);
    if (inviteEligible(memory, false)) { shownAt.push(session); memory = recordInviteShown(memory); }
  }
  assert.deepEqual(shownAt, [2, 5, 8]);
  assert.equal(memory.invitesShown, 3);
  assert.equal(withAutoAdvance(memory, false).autoAdvance, false);
});

test("load/save use only the chut key and survive blocked storage", () => {
  resetChutMemoryForRun();
  const storage = memoryStorage({ "mcy.guest.journal.v1": "[]" });
  assert.deepEqual(loadChutMemory(storage), DEFAULT_CHUT_MEMORY);
  updateChutMemory(recordSession, storage);
  assert.equal(JSON.parse(storage.data.get(CHUT_MEMORY_KEY)).sessions, 1);
  assert.equal(storage.data.get("mcy.guest.journal.v1"), "[]");
  assert.deepEqual([...storage.data.keys()].sort(), [CHUT_MEMORY_KEY, "mcy.guest.journal.v1"].sort());

  resetChutMemoryForRun();
  const blocked = { getItem() { throw new Error("blocked"); }, setItem() { throw new Error("blocked"); } };
  assert.deepEqual(loadChutMemory(blocked), DEFAULT_CHUT_MEMORY);
  assert.equal(saveChutMemory(recordSession(DEFAULT_CHUT_MEMORY), blocked), false);
  assert.equal(loadChutMemory(blocked).sessions, 1, "kept in memory for this run");
  assert.equal(saveChutMemory(DEFAULT_CHUT_MEMORY, null), false);
  resetChutMemoryForRun();
});

test("guest journal keeps a Chút after-session answer and still drops invalid extras", async () => {
  const { parseGuestJournal, serializeGuestJournal } = await import("../src/app/guestJournal.ts");
  const { BODY_REGIONS } = await import("../src/bodyRegions.ts");
  const regions = BODY_REGIONS;
  const base = { id: "a", day: 0, date: "2026-11-26", time: "08:30", kind: "Sau tập", status: null, observations: [] };
  const kept = parseGuestJournal(serializeGuestJournal([{ ...base, lessonTitle: "Chuỗi Cổ và vai", outcome: "Như cũ", endedEarly: true }]), regions);
  assert.equal(kept.length, 1);
  assert.equal(kept[0].lessonTitle, "Chuỗi Cổ và vai");
  assert.equal(kept[0].outcome, "Như cũ");
  assert.equal(kept[0].endedEarly, true);
  const raw = JSON.stringify(JSON.parse(serializeGuestJournal([base])));
  const tampered = raw.replace('"kind":"Sau tập"', '"kind":"Sau tập","outcome":"Khỏi bệnh","lessonTitle":"","endedEarly":"yes"');
  const dropped = parseGuestJournal(tampered, regions);
  assert.equal(dropped.length, 1);
  assert.equal("outcome" in dropped[0], false);
  assert.equal("lessonTitle" in dropped[0], false);
  assert.equal("endedEarly" in dropped[0], false);
  assert.equal(serializeGuestJournal([base]).includes("outcome"), false, "old entries serialize unchanged");
});
