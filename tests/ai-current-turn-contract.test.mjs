import assert from "node:assert/strict";
import test from "node:test";
import { harness, request, CONTEXT } from "./fixtures/practice-harness.mjs";
test("learner selection accepts confirmed current choices, never transcript or free text", async () => {
  for (const extra of [{ turns: [{ role: "user", content: "a previous turn" }] }, { history: [] }, { message: "personal text" }, { context: { ...CONTEXT, previousFeedback: "worse" } }]) {
    const h = harness(); const result = await h.handler(request(extra)); assert.equal(result.status, 400); assert.equal(h.providerCalls.length, 0);
  }
});
