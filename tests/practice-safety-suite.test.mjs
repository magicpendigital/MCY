import assert from "node:assert/strict";
import test from "node:test";
import { eligibleSessions, isReviewedSession } from "../supabase/functions/_shared/practiceContract.ts";
import { containsUnsafeMedicalAdvice } from "../supabase/functions/_shared/aiSafety.ts";
import { harness, request, SESSION, SESSION_B, CONTEXT } from "./fixtures/practice-harness.mjs";

// The enable-gate suite for the learner assistant (plan phase 5, G3). It is fixture-only: it proves the server logic refuses or
// narrows correctly, not that any real catalogue is safe or reviewed. It must stay green before the assistant is switched on for a
// pilot, and a green run never replaces the expert and rights review of the sessions.
const now = Date.parse("2026-10-10T00:00:00Z");
const run = async (context, options = {}) => { const h = harness(options); const r = await h.handler(request({ context })); return { h, status: r.status, body: await r.json() }; };

test("pain, discomfort, tiredness or an unclear body state never reach the model and never get a session", async () => {
  for (const bodyStatus of ["reported", "uncertain", "tired", "uncomfortable"]) {
    const regions = bodyStatus === "reported" ? ["neck"] : [];
    const { h, status, body } = await run({ ...CONTEXT, bodyStatus, regions });
    assert.equal(status, 200, bodyStatus);
    assert.equal(body.status, "no_match", bodyStatus);
    assert.equal(h.providerCalls.length, 0, `${bodyStatus}: no provider call`);
    assert.equal(h.calls.some(c => c.name === "mcy_ai_begin_request"), false, `${bodyStatus}: no usage slot`);
    assert.deepEqual(eligibleSessions([SESSION, SESSION_B], { ...CONTEXT, bodyStatus, regions }, now), [], bodyStatus);
  }
});

test("a stop request ends the flow without any model call, whatever else is in the request", async () => {
  const h = harness();
  const r = await h.handler(request({ context: CONTEXT, stopRequested: true }));
  assert.equal((await r.json()).status, "safety_stop");
  assert.equal(h.providerCalls.length, 0);
  assert.equal(h.calls.some(c => c.name === "mcy_ai_begin_request"), false);
});

test("a check-in with no match answers no_match, reserves nothing and sends nothing", async () => {
  const { h, body } = await run({ ...CONTEXT, minutes: 1 });                    // both sessions are longer than a minute
  assert.equal(body.status, "no_match");
  assert.equal(h.providerCalls.length, 0);
  assert.equal(h.calls.some(c => c.name === "mcy_ai_begin_request"), false);
});

test("Mông (glute) regions are accepted in the context and only match a session that declares them", async () => {
  const glute = { ...CONTEXT, regions: ["glute_left"] };
  assert.equal((await run(glute)).status, 200);
  assert.deepEqual(eligibleSessions([SESSION], glute, now), []);                 // the fixture session declares no regions
  const declared = { ...SESSION, eligibility: { ...SESSION.eligibility, regionCodes: ["glute_left", "glute_right"] } };
  assert.equal(eligibleSessions([declared], glute, now).length, 1);
});

test("English is only matched to English sessions and Vietnamese only to Vietnamese ones", () => {
  const en = { ...SESSION, id: "offline-reviewed-session-en", locale: "en-US" };
  assert.deepEqual(eligibleSessions([SESSION, en], { ...CONTEXT, locale: "en-US" }, now).map(s => s.id), [en.id]);
  assert.deepEqual(eligibleSessions([SESSION, en], CONTEXT, now).map(s => s.id), [SESSION.id]);
});

test("floor contact, time, expired review and draft status are hard filters", () => {
  const floor = { ...SESSION, id: "offline-floor", floorContact: true };
  assert.deepEqual(eligibleSessions([floor], { ...CONTEXT, floor: "avoid" }, now), []);
  assert.equal(eligibleSessions([floor], { ...CONTEXT, floor: "allowed" }, now).length, 1);
  assert.deepEqual(eligibleSessions([{ ...SESSION, durationSeconds: 601 }], CONTEXT, now), []);
  assert.deepEqual(eligibleSessions([{ ...SESSION, review: { ...SESSION.review, expiresAt: "2020-01-01T00:00:00Z" } }], CONTEXT, now), []);
  assert.deepEqual(eligibleSessions([{ ...SESSION, review: { ...SESSION.review, status: "draft" } }], CONTEXT, now), []);
});

test("the unsafe-advice guard flags diagnosis, movement prescription and treatment claims in Vietnamese and English", () => {
  for (const text of ["Bạn có thể đang bị thoát vị đĩa đệm.", "Hãy thực hiện tư thế con rắn để giảm đau.", "Yoga sẽ chữa khỏi đau lưng.", "You probably have sciatica.", "Try the cobra pose for your back.", "Bạn nên uống thuốc giảm đau."])
    assert.equal(containsUnsafeMedicalAdvice(text), true, text);
  for (const text of ["Buổi tập 5 phút, nhịp chậm, không nằm sàn.", "5 minutes, slow pace, no floor contact."])
    assert.equal(containsUnsafeMedicalAdvice(text), false, text);
});

test("the model output can only name an eligible session; anything else is discarded as a failed request", async () => {
  for (const decision of [{ status: "selected", sessionId: "not-in-the-candidates" }, { status: "selected", sessionId: "" }, { status: "no_match", sessionId: SESSION.id }]) {
    const h = harness({ decision });
    const r = await h.handler(request({ context: CONTEXT }));
    assert.equal(r.status, 503, JSON.stringify(decision));
    assert.equal(h.calls.at(-1).args.p_status, "failed");
  }
});

test("optional ranking signals are validated and reach the model as data only", async () => {
  const signalled = { ...SESSION, suitableEnergy: ["Thấp", "Bình thường"], intents: ["Thả lỏng"] };
  assert.equal(isReviewedSession(signalled, now), true);
  for (const bad of [{ suitableEnergy: [] }, { suitableEnergy: ["Quá mệt"] }, { suitableEnergy: ["Thấp", "Thấp"] }, { intents: ["Thả lỏng", "Thả lỏng"] }, { intents: "Thả lỏng" }, { intents: [] }])
    assert.equal(isReviewedSession({ ...SESSION, ...bad }, now), false, JSON.stringify(bad));
  const h = harness({ catalog: [signalled, SESSION_B] });
  await h.handler(request({ context: { ...CONTEXT, energy: "Thấp" } }));
  assert.equal(h.providerCalls.length, 1);
  const sent = JSON.parse(h.providerCalls[0].body.messages[1].content);
  const a = sent.candidates.find(c => c.sessionId === SESSION.id), b = sent.candidates.find(c => c.sessionId === SESSION_B.id);
  assert.deepEqual([a.suitableEnergy, a.intents, a.regionCodes], [["Thấp", "Bình thường"], ["Thả lỏng"], []]);
  assert.equal("suitableEnergy" in b, false);                                         // a session that declares nothing sends nothing
  assert.equal(JSON.stringify(sent).includes(SESSION.sections[0].text), false);       // session text never leaves the server
});

test("one eligible session is answered without a model call, a usage slot or any data leaving", async () => {
  const h = harness({ catalog: [SESSION] });
  const r = await h.handler(request({ context: CONTEXT }));
  const body = await r.json();
  assert.equal(r.status, 200);
  assert.equal(body.status, "selected");
  assert.equal(body.plan.id, SESSION.id);
  assert.equal(body.contextRevision, CONTEXT.revision);
  assert.match(body.reason, /danh mục đã duyệt/);
  assert.equal(h.providerCalls.length, 0);
  assert.equal(h.modelCalls.length, 0);
  assert.equal(h.calls.some(c => c.name === "mcy_ai_begin_request" || c.name === "mcy_ai_finish_request"), false);
});

test("the single-session answer still needs a valid request id, consent and the usual gates", async () => {
  assert.equal((await harness({ catalog: [SESSION] }).handler(request({ context: CONTEXT, requestId: "not-a-uuid" }))).status, 400);
  const noConsent = harness({ catalog: [SESSION], states: [{ enabled: true, consent_current: false, version_no: 1 }] });
  assert.equal((await noConsent.handler(request({ context: CONTEXT }))).status, 403);
  const off = harness({ catalog: [SESSION], env: { MCY_AI_ENABLE_STAGING: "false" } });
  assert.equal((await off.handler(request({ context: CONTEXT }))).status, 404);
});
