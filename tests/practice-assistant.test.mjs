import assert from "node:assert/strict";
import test from "node:test";
import { eligibleSessions, isPracticeContext, isReviewedSession } from "../supabase/functions/_shared/practiceContract.ts";
import { reviewedPracticeCatalog } from "../supabase/functions/_shared/reviewedPracticeCatalog.ts";
import { rememberedPace } from "../src/practice/feedbackMemory.ts";
import { harness, request, SESSION, CONTEXT, ACTOR } from "./fixtures/practice-harness.mjs";
const response = async r => ({ status: r.status, body: await r.json() });
test("catalogue has no unreviewed default content; cohort/spend/target gates fail closed", async () => {
  assert.deepEqual(reviewedPracticeCatalog, []);
  for (const env of [{ MCY_AI_PILOT_ACTORS: undefined }, { MCY_AI_PILOT_ACTORS: '["bad"]' }, { MCY_AI_PILOT_ACTORS: '[]' }, { MCY_AI_ENABLE_STAGING: "false" }, { MCY_AI_SPEND_CONTROL_APPROVED: "false" }, { OPENROUTER_API_KEY: "" }, { SUPABASE_URL: "https://production.invalid" }]) {
    const h = harness({ env }); assert.equal((await h.handler(request())).status, 404); assert.equal(h.providerCalls.length, 0); assert.equal(h.calls.length, 0);
  }
  const h = harness({ env: { MCY_AI_PILOT_ACTORS: "[]" } }); assert.equal((await response(await h.handler(request({ action: "capability" })))).body.available, false);
});
test("identity, actor forgery, free text and history are rejected before admission", async () => {
  for (const extra of [{ actorId: ACTOR }, { message: "name@example.test" }, { turns: [] }, { action: ["select_plan"] }, { context: { ...CONTEXT, floor: ["avoid"] } }, { context: { ...CONTEXT, healthNotes: "not allowed" } }]) {
    const h = harness(); assert.equal((await h.handler(request(extra))).status, 400); assert.equal(h.calls.length, 0); assert.equal(h.providerCalls.length, 0);
  }
  assert.equal((await harness().handler(request({}, null))).status, 401);
  assert.equal((await harness({ user: { id: ACTOR, email_confirmed_at: null } }).handler(request())).status, 401);
});
test("eligibility rejects drafts, expired reviews, insufficient time, floor/regions and unsafe asset URLs", () => {
  const now = Date.parse("2026-10-10"); assert.equal(isPracticeContext(CONTEXT), true); assert.equal(isPracticeContext({ ...CONTEXT, regions: ["neck", "neck"] }), false);
  for (const s of [{ ...SESSION, review: { ...SESSION.review, status: "draft" } }, { ...SESSION, review: { ...SESSION.review, expiresAt: "2020-01-01" } }, { ...SESSION, durationSeconds: 601 }, { ...SESSION, floorContact: true }, { ...SESSION, sections: [{ ...SESSION.sections[0], image: "https://tracker.invalid/image.png" }] }]) assert.deepEqual(eligibleSessions([s], CONTEXT, now), []);
  assert.deepEqual(eligibleSessions([SESSION], { ...CONTEXT, bodyStatus: "reported", regions: ["neck"] }, now), []); assert.equal(isReviewedSession(SESSION, now), true);
});
test("empty/no-match and clarification reserve no quota and call no provider", async () => {
  const h = harness({ catalog: [] }); assert.equal((await response(await h.handler(request()))).body.status, "no_match"); assert.equal(h.providerCalls.length, 0); assert.equal(h.calls.some(c => c.name === "mcy_ai_begin_request"), false);
  const clarify = harness(); assert.equal((await response(await clarify.handler(request({ context: { ...CONTEXT, pace: null } })))).body.question, "pace"); assert.equal(clarify.providerCalls.length, 0);
});
test("selection binds verified actor, supplied id/version and typed current preferences", async () => {
  const h = harness(); const r = await response(await h.handler(request())); assert.equal(r.status, 200); assert.equal(r.body.plan.version, SESSION.version); assert.equal(r.body.contextRevision, CONTEXT.revision); assert.match(r.body.reason, /danh mục đã duyệt/);
  assert.equal(h.providerCalls.length, 1); const upstream = JSON.parse(h.providerCalls[0].body.messages[1].content); assert.deepEqual(upstream.preferences, CONTEXT); assert.equal("message" in upstream, false); assert.equal("history" in upstream, false);
  assert.equal(JSON.stringify(upstream).includes(ACTOR), false); assert.equal(JSON.stringify(upstream).includes(SESSION.sections[0].text), false);
  assert.equal(h.calls.find(c => c.name === "mcy_ai_begin_request").args.p_actor_id, ACTOR); assert.equal(h.calls.filter(c => c.name === "mcy_ai_finish_request").length, 1);
});
test("model cannot introduce another session, instructions or contradictory no-match", async () => {
  for (const decision of [{ status: ["selected"], sessionId: SESSION.id }, { status: "selected", sessionId: "foreign-session" }, { status: "selected", sessionId: SESSION.id, instruction: "forbidden" }, { status: "no_match", sessionId: SESSION.id }, { status: "medical_advice", sessionId: "" }]) {
    const h = harness({ decision }); assert.equal((await h.handler(request())).status, 503); assert.equal(h.calls.filter(c => c.name === "mcy_ai_finish_request").length, 1); assert.equal(h.calls.at(-1).args.p_status, "failed"); assert.equal(h.calls.at(-1).args.p_input_tokens, 80); assert.equal(h.calls.at(-1).args.p_output_tokens, 20);
  }
});
test("first pilot cannot rank reported, uncertain, tired or uncomfortable states, including overly broad reviewed metadata", async () => {
  for (const bodyStatus of ["reported", "uncertain", "tired", "uncomfortable"]) {
    const h = harness({ catalog: [{ ...SESSION, eligibility: { bodyStatuses: [bodyStatus], regionCodes: ["neck"] } }] });
    const r = await response(await h.handler(request({ context: { ...CONTEXT, bodyStatus, regions: ["neck"] } })));
    assert.equal(r.body.status, "no_match"); assert.equal(h.providerCalls.length, 0); assert.equal(h.calls.some(c => c.name === "mcy_ai_begin_request"), false);
  }
  for (const key of ["locale", "intent", "floor"]) assert.equal(isPracticeContext({ ...CONTEXT, [key]: [CONTEXT[key]] }), false);
  for (const key of ["locale", "pace", "guidance", "source", "version"]) assert.equal(isReviewedSession({ ...SESSION, [key]: [SESSION[key]] }), false);
});
test("withdrawal during model catalogue read prevents provider admission", async () => {
  const h = harness({ states: [{ enabled: true, consent_current: true, version_no: 1 }, { enabled: true, consent_current: false, version_no: 1 }] }); assert.equal((await h.handler(request())).status, 409); assert.equal(h.providerCalls.length, 0); assert.equal(h.calls.at(-1).args.p_status, "failed");
});
test("kill switch, withdrawal and config change during inference discard output without retry", async () => {
  for (const changed of [{ enabled: false, consent_current: true, version_no: 1 }, { enabled: true, consent_current: false, version_no: 1 }, { enabled: true, consent_current: true, version_no: 2 }]) {
    const ready = { enabled: true, consent_current: true, version_no: 1 }; const h = harness({ states: [ready, ready, changed] }); assert.equal((await h.handler(request())).status, 409); assert.equal(h.providerCalls.length, 1); assert.equal(h.calls.filter(c => c.name === "mcy_ai_finish_request").length, 1);
  }
});
test("practice start revalidates exact id/version, eligibility and consent with no inference", async () => {
  for (const body of [{ sessionId: SESSION.id, contentVersion: "b".repeat(64) }, { sessionId: "foreign", contentVersion: SESSION.version }]) { const h = harness(); assert.equal((await h.handler(request({ action: "start_plan", ...body }))).status, 409); assert.equal(h.providerCalls.length, 0); }
  const h = harness(); assert.equal((await h.handler(request({ action: "start_plan", sessionId: SESSION.id, contentVersion: SESSION.version }))).status, 200); assert.equal(h.calls.some(c => c.name === "mcy_ai_begin_request"), false);
  const denied = harness({ states: [{ enabled: true, version_no: 1, consent_current: false }] }); assert.equal((await denied.handler(request({ action: "start_plan", sessionId: SESSION.id, contentVersion: SESSION.version }))).status, 403);
});
test("uncertain finalization never exposes a plan or retries", async () => { const h = harness({ finish: false }); assert.equal((await h.handler(request())).status, 503); assert.equal(h.calls.filter(c => c.name === "mcy_ai_finish_request").length, 1); });
test("quota and request duplicate stop before inference", async () => {
  for (const [message, status] of [["AI usage limit reached", 429], ["Request already processed", 409]]) { const h = harness({ rpc: name => name === "mcy_ai_begin_request" ? { data: null, error: { message } } : null }); assert.equal((await h.handler(request())).status, status); assert.equal(h.providerCalls.length, 0); assert.equal(h.calls.some(c => c.name === "mcy_ai_finish_request"), false); }
});
test("memory uses latest actual feedback, never absent/worse/uncertain/skipped/early feedback", () => {
  const valid = { kind: "Sau tập", pace: "Hơi nhanh", outcome: "Như cũ" }; assert.equal(rememberedPace([valid], true), valid);
  for (const patch of [{ pace: "Vừa" }, { pace: null }, { outcome: null }, { outcome: "Khó chịu hơn" }, { outcome: "Chưa rõ" }, { feedbackSkipped: true }, { endedEarly: true }]) assert.equal(rememberedPace([valid, { ...valid, ...patch }], true), undefined);
  assert.equal(rememberedPace([valid], false), undefined); assert.equal(rememberedPace([], true), undefined);
});
