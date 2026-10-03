import assert from "node:assert/strict";
import test from "node:test";
import { containsDirectIdentifiers } from "../supabase/functions/_shared/aiPrivacy.ts";
import { containsUnsafeMedicalAdvice } from "../supabase/functions/_shared/aiSafety.ts";
import { aiSpendGateOpen } from "../supabase/functions/_shared/aiGates.ts";
import { readBoundedJson, RequestBodyTimeoutError, RequestBodyTooLargeError } from "../supabase/functions/_shared/boundedRequest.ts";

test("AI privacy guard catches common direct identifiers and name disclosures", () => {
  for (const value of [
    "Email của tôi là learner@example.test",
    "Số điện thoại 0912345678",
    "Trang của tôi: https://example.test/profile",
    "Tài khoản @yoga_learner",
    "Tên tôi là Minh Anh",
    "Tên: Nguyễn Văn An",
    "My name: Alex Rivera",
    "My name's Alex Rivera.",
    "My name's alex rivera.",
    "Địa chỉ: 12 Nguyễn Trãi",
    "Address: 24 High Street",
    "I live at 12 Nguyễn Trãi",
    "Mình ở số 12 đường Nguyễn Trãi",
    "12 Nguyễn Trãi, Quận 1",
    "My address is 12A Baker Street",
    "42 Main Street, Springfield, IL 62704",
    "I'm alex rivera, and I prefer a slower pace",
    "My full name is Alex Rivera",
    "I'm Jordan Lee",
  ]) {
    assert.equal(containsDirectIdentifiers(value), true, value);
  }
});

test("AI reply guard blocks obvious diagnoses, movement prescriptions and treatment claims", () => {
  for (const value of [
    "You probably have sciatica.",
    "Bạn có thể đang bị thoát vị đĩa đệm.",
    "Try child's pose for your back pain.",
    "Hãy thử tư thế em bé để giảm đau lưng.",
    "Yoga chữa khỏi đau lưng.",
    "Yoga can cure back pain.",
    "You should take painkillers.",
  ]) {
    assert.equal(containsUnsafeMedicalAdvice(value), true, value);
  }

  for (const value of [
    "Mình có thể cùng bạn chọn một nhịp thật nhẹ.",
    "Nếu triệu chứng nặng lên, hãy dừng lại và tìm hỗ trợ y tế phù hợp.",
    "I can help you describe what pace feels comfortable today.",
    "If symptoms become severe, stop and seek appropriate medical help.",
  ]) {
    assert.equal(containsUnsafeMedicalAdvice(value), false, value);
  }
});

test("AI privacy guard allows ordinary practice preferences and body-region context", () => {
  for (const value of [
    "Tôi muốn tập nhẹ nhàng trong 15 phút cho vùng lưng.",
    "Please keep the practice under ten minutes and avoid floor poses.",
    "Hôm nay tôi chưa chắc, có thể chỉ cần thả lỏng vai.",
    "I have 10 minutes and want a gentle shoulder practice.",
    "Mình tập 12 phút cho lưng.",
    "I'm feeling sore today and would like a gentle stretch.",
    "I'm very stiff after sitting at work.",
  ]) {
    assert.equal(containsDirectIdentifiers(value), false, value);
  }
});

test("AI spend gate stays closed unless staging, owner spend approval, and a key are all present", () => {
  const complete = {
    supabaseUrl: "https://mhumbczqrzutdnraafhs.supabase.co/",
    stagingEnabled: "true",
    spendControlApproved: "true",
    gatewayApiKey: "test-only-key",
  };
  assert.equal(aiSpendGateOpen(complete), true);
  for (const incomplete of [
    { ...complete, supabaseUrl: "https://production.supabase.co" },
    { ...complete, stagingEnabled: "false" },
    { ...complete, spendControlApproved: undefined },
    { ...complete, spendControlApproved: "false" },
    { ...complete, gatewayApiKey: "  " },
  ]) {
    assert.equal(aiSpendGateOpen(incomplete), false);
  }
});

test("bounded request reader parses JSON and rejects malformed or absent bodies", async () => {
  const valid = new Request("https://mcy.test", { method: "POST", body: '{"ok":true}' });
  assert.deepEqual(await readBoundedJson(valid, 32), { ok: true });

  const malformed = new Request("https://mcy.test", { method: "POST", body: "not-json" });
  await assert.rejects(readBoundedJson(malformed, 32), SyntaxError);

  const empty = new Request("https://mcy.test", { method: "POST" });
  await assert.rejects(readBoundedJson(empty, 32), /empty_request_body/);
});

test("bounded request reader rejects oversized declared and streamed bodies", async () => {
  const declared = new Request("https://mcy.test", {
    method: "POST",
    headers: { "content-length": "128" },
    body: "{}",
  });
  await assert.rejects(readBoundedJson(declared, 32), RequestBodyTooLargeError);

  let cancelled = false;
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(new TextEncoder().encode("123456789"));
    },
    cancel() {
      cancelled = true;
    },
  });
  const streamed = new Request("https://mcy.test", { method: "POST", body: stream, duplex: "half" });
  await assert.rejects(readBoundedJson(streamed, 8), RequestBodyTooLargeError);
  assert.equal(cancelled, true);
});

test("bounded request reader times out and cancels an unfinished body stream", async () => {
  let cancelled = false;
  const stream = new ReadableStream({
    cancel() {
      cancelled = true;
    },
  });
  const request = new Request("https://mcy.test", { method: "POST", body: stream, duplex: "half" });

  await assert.rejects(readBoundedJson(request, 32, 20), RequestBodyTimeoutError);
  assert.equal(cancelled, true);
});
