import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const prototype = await readFile(new URL("../src/Prototype.tsx", import.meta.url), "utf8");
const handler = await readFile(new URL("../supabase/functions/_shared/aiAssistant.ts", import.meta.url), "utf8");

test("the learner sends only the submitted AI turn and accurately discloses omitted history", () => {
  const invokeAt = prototype.indexOf('functions.invoke("mcy-ai-assistant"');
  const invokeEnd = prototype.indexOf("if (error) throw error;", invokeAt);
  assert.ok(invokeAt >= 0 && invokeEnd > invokeAt, "learner AI function call is present");
  const clientRequest = prototype.slice(invokeAt, invokeEnd);
  assert.match(clientRequest, /message:\s*userTurn\.content/);
  assert.doesNotMatch(clientRequest, /\bturns\s*:/);
  assert.match(prototype, /không gửi hội thoại trước đó/i);
  assert.match(handler, /turns\.length\s*>\s*0/);
  assert.doesNotMatch(handler, /recentConversation\s*:/);
});
