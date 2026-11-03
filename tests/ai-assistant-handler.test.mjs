import assert from "node:assert/strict";
import test from "node:test";
import { createAiAssistantHandler } from "../supabase/functions/_shared/aiAssistant.ts";
import { readBoundedJson, RequestBodyTimeoutError, RequestBodyTooLargeError } from "../supabase/functions/_shared/boundedRequest.ts";

const STAGING_URL = "https://mhumbczqrzutdnraafhs.supabase.co";
const PROVIDER_KEY = "fixture-only-not-a-secret";
const ACCESS_TOKEN = "verified-learner-access-token";
const ACTOR_ID = "11111111-1111-4111-8111-111111111111";
const FORGED_ACTOR_ID = "22222222-2222-4222-8222-222222222222";
const REQUEST_ID = "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee";
const MODEL_ID = "provider/model-a";
const CONFIG = {
  enabled: true,
  model_id: MODEL_ID,
  system_prompt: "Use a gentle, concise tone and ask at most one question.",
  temperature: 0.3,
  max_output_tokens: 256,
};

function payload(overrides = {}) {
  return {
    requestId: REQUEST_ID,
    message: "Mình muốn thả lỏng nhẹ nhàng hôm nay.",
    turns: [],
    context: {
      locale: "vi-VN",
      minutes: 10,
      energy: "Bình thường",
      intent: "Thả lỏng",
      regions: ["neck", "shoulder_left"],
    },
    ...overrides,
  };
}

function request(body, options = {}) {
  const headers = new Headers(options.headers);
  if (options.token !== null) headers.set("Authorization", `Bearer ${options.token ?? ACCESS_TOKEN}`);
  if (body !== undefined) headers.set("Content-Type", "application/json");
  return new Request("https://function.invalid/mcy-ai-assistant", {
    method: options.method ?? "POST",
    headers,
    body: body === undefined ? undefined : typeof body === "string" ? body : JSON.stringify(body),
  });
}

function harness(options = {}) {
  const env = new Map(Object.entries({
    SUPABASE_URL: STAGING_URL,
    MCY_AI_ENABLE_STAGING: "true",
    MCY_AI_SPEND_CONTROL_APPROVED: "true",
    OPENROUTER_API_KEY: PROVIDER_KEY,
    ...options.env,
  }));
  const rpcCalls = [];
  const modelCalls = [];
  const providerCalls = [];
  const authCalls = [];
  const identity = options.identity === undefined
    ? { id: ACTOR_ID, email_confirmed_at: "2026-09-01T00:00:00Z" }
    : options.identity;
  const response = options.providerResponse ?? Response.json({
    model: MODEL_ID,
    choices: [{ message: { content: JSON.stringify({ reply: "Mình có thể cùng bạn chọn một nhịp thật nhẹ." }) } }],
    usage: { prompt_tokens: 84, completion_tokens: 22 },
  });
  const handler = createAiAssistantHandler({
    env: name => env.get(name),
    clients: authorization => {
      authCalls.push(authorization);
      return {
        user: {
          auth: {
            getUser: async token => ({
              data: { user: token === ACCESS_TOKEN ? identity : null },
              error: options.authError ?? null,
            }),
          },
        },
        server: {
          rpc: async (name, args) => {
            rpcCalls.push({ name, args });
            const configured = options.rpcResults?.[name];
            if (typeof configured === "function") return await configured(args);
            if (configured) return configured;
            if (name === "mcy_ai_begin_request") return { data: options.config ?? CONFIG, error: null };
            if (name === "mcy_ai_finish_request") return { data: true, error: null };
            return { data: null, error: null };
          },
        },
      };
    },
    readModels: async key => {
      modelCalls.push(key);
      if (options.modelError) throw new Error("catalog_unavailable");
      return options.models ?? [{ id: MODEL_ID }];
    },
    fetchProvider: async (url, init) => {
      providerCalls.push({ url: String(url), init });
      if (options.providerError) throw new Error("provider_unavailable");
      return response;
    },
    readJson: options.readJson ?? readBoundedJson,
    isBodyTooLarge: error => error instanceof RequestBodyTooLargeError,
    isBodyTimeout: error => error instanceof RequestBodyTimeoutError,
    newRequestId: () => options.generatedRequestId ?? "33333333-3333-4333-8333-333333333333",
  });
  return { handler, rpcCalls, modelCalls, providerCalls, authCalls };
}

async function jsonResponse(response) {
  return { status: response.status, body: await response.json() };
}

test("inference fails closed before client/provider calls unless every staging spend gate is open", async () => {
  const closed = harness({ env: { MCY_AI_ENABLE_STAGING: "false" } });
  assert.deepEqual(await jsonResponse(await closed.handler(request(payload()))), {
    status: 404,
    body: { error: "ai_temporarily_unavailable" },
  });
  assert.equal(closed.authCalls.length, 0);
  assert.equal(closed.rpcCalls.length, 0);
  assert.equal(closed.modelCalls.length, 0);
  assert.equal(closed.providerCalls.length, 0);

  for (const env of [
    { SUPABASE_URL: "https://production.supabase.co" },
    { MCY_AI_SPEND_CONTROL_APPROVED: "false" },
    { OPENROUTER_API_KEY: "  " },
    { OPENROUTER_API_KEY: undefined, AI_GATEWAY_API_KEY: "obsolete-key-must-not-open-gate" },
  ]) {
    const disabled = harness({ env });
    assert.equal((await disabled.handler(request(payload())).then(response => response.status)), 404);
    assert.equal(disabled.providerCalls.length, 0);
  }
});

test("inference rejects unsupported methods, missing auth, and unconfirmed identities", async () => {
  const method = harness();
  assert.equal((await method.handler(request(undefined, { method: "GET" }))).status, 405);
  assert.equal(method.authCalls.length, 0);

  const anonymous = harness();
  assert.equal((await anonymous.handler(request(payload(), { token: null }))).status, 401);
  assert.equal(anonymous.authCalls.length, 0);

  const unconfirmed = harness({ identity: { id: ACTOR_ID, email_confirmed_at: null } });
  assert.equal((await unconfirmed.handler(request(payload()))).status, 401);
  assert.equal(unconfirmed.rpcCalls.length, 0);
  assert.equal(unconfirmed.providerCalls.length, 0);
});

test("request validation and direct identifiers fail before quota reservation or provider access", async () => {
  const invalid = harness();
  assert.equal((await invalid.handler(request({ ...payload(), context: { ...payload().context, regions: ["admin"] } }))).status, 400);
  assert.equal(invalid.rpcCalls.length, 0);
  assert.equal(invalid.providerCalls.length, 0);

  const pii = harness();
  assert.deepEqual(await jsonResponse(await pii.handler(request(payload({ message: "Tên tôi là Minh Anh, muốn tập nhẹ." })))), {
    status: 400,
    body: { error: "message_contains_identifiers" },
  });
  assert.equal(pii.rpcCalls.length, 0);
  assert.equal(pii.providerCalls.length, 0);

  const address = harness();
  assert.deepEqual(await jsonResponse(await address.handler(request(payload({ message: "I live at 12 Nguyễn Trãi" })))), {
    status: 400,
    body: { error: "message_contains_identifiers" },
  });
  assert.equal(address.rpcCalls.length, 0);
  assert.equal(address.providerCalls.length, 0);

  const previousTurn = harness();
  assert.equal((await previousTurn.handler(request(payload({
    turns: [{ role: "user", content: "I live at 12 Nguyễn Trãi" }],
  }))).then(response => response.status)), 400);
  assert.equal(previousTurn.rpcCalls.length, 0);
  assert.equal(previousTurn.providerCalls.length, 0);

  const malformed = harness();
  assert.equal((await malformed.handler(request("{"))).status, 400);
  assert.equal(malformed.rpcCalls.length, 0);

  const oversized = harness();
  assert.equal((await oversized.handler(request({ ...payload(), message: "x".repeat(9000) }))).status, 413);
  assert.equal(oversized.rpcCalls.length, 0);

  const timedOut = harness({ readJson: async () => { throw new RequestBodyTimeoutError(); } });
  assert.equal((await timedOut.handler(request(payload())).then(response => response.status)), 408);
  assert.equal(timedOut.rpcCalls.length, 0);
});

test("consent and rate-limit decisions come from the server admission RPC", async () => {
  const noConsent = harness({
    rpcResults: { mcy_ai_begin_request: { data: null, error: { message: "Current consent required" } } },
  });
  assert.deepEqual(await jsonResponse(await noConsent.handler(request(payload()))), {
    status: 403,
    body: { error: "current_ai_consent_required" },
  });
  assert.equal(noConsent.providerCalls.length, 0);
  assert.equal(noConsent.rpcCalls.some(call => call.name === "mcy_ai_finish_request"), false);

  const limited = harness({
    rpcResults: { mcy_ai_begin_request: { data: null, error: { message: "AI usage limit reached" } } },
  });
  assert.equal((await limited.handler(request(payload())).then(response => response.status)), 429);
  assert.equal(limited.providerCalls.length, 0);
});

test("successful turn uses verified actor and allowlisted minimum context, then records metadata only", async () => {
  const app = harness();
  const result = await jsonResponse(await app.handler(request({ ...payload(), actor_id: FORGED_ACTOR_ID })));
  assert.deepEqual(result, {
    status: 200,
    body: {
      reply: "Mình có thể cùng bạn chọn một nhịp thật nhẹ.",
      requestId: REQUEST_ID,
      consentPolicyVersion: "ai-processing-review-1.0",
    },
  });
  assert.deepEqual(app.rpcCalls.map(call => call.name), ["mcy_ai_begin_request", "mcy_ai_finish_request"]);
  assert.equal(app.rpcCalls[0].args.p_actor_id, ACTOR_ID);
  assert.equal(app.rpcCalls[0].args.p_actor_id === FORGED_ACTOR_ID, false);
  assert.equal(app.rpcCalls[0].args.p_request_id, REQUEST_ID);

  const gateway = app.providerCalls[0];
  assert.equal(gateway.url, "https://openrouter.ai/api/v1/chat/completions");
  assert.equal(new Headers(gateway.init.headers).get("Authorization"), `Bearer ${PROVIDER_KEY}`);
  const modelRequest = JSON.parse(gateway.init.body);
  assert.equal(gateway.init.redirect, "error");
  assert.deepEqual(modelRequest.provider, { require_parameters: true, data_collection: "deny", zdr: true, allow_fallbacks: false });
  assert.equal(modelRequest.response_format.type, "json_schema");
  assert.equal(modelRequest.response_format.json_schema.strict, true);
  assert.equal(modelRequest.response_format.json_schema.schema.additionalProperties, false);
  assert.equal(modelRequest.stream, false);
  assert.equal(modelRequest.max_tokens, CONFIG.max_output_tokens);
  const sent = JSON.stringify(modelRequest);
  const sentContext = JSON.parse(modelRequest.messages[1].content);
  assert.equal(sent.includes(ACTOR_ID), false);
  assert.equal(sent.includes(FORGED_ACTOR_ID), false);
  assert.equal(sent.includes("email"), false);
  assert.equal(sent.includes("note"), false);
  assert.equal(modelRequest.messages[1].content.includes("selectedBodyRegions"), true);
  assert.equal(modelRequest.messages[1].content.includes("currentMessage"), true);
  assert.equal("recentConversation" in sentContext, false);
  assert.equal(sentContext.currentMessage, "Mình muốn thả lỏng nhẹ nhàng hôm nay.");

  const finish = app.rpcCalls[1].args;
  assert.equal(finish.p_status, "succeeded");
  assert.equal(finish.p_input_tokens, 84);
  assert.equal(finish.p_output_tokens, 22);
  assert.equal("message" in finish, false);
  assert.equal("prompt" in finish, false);
  assert.equal("reply" in finish, false);
});

test("insufficient credit, rate limits and provider failures are not retried or leaked", async () => {
  for (const status of [401, 402, 403, 429, 500]) {
    const app = harness({ providerResponse: new Response("PRIVATE_ERROR_WITH_SECRET", { status }) });
    const response = await app.handler(request(payload()));
    assert.equal(response.status, 502);
    assert.equal((await response.text()).includes("PRIVATE_ERROR"), false);
    assert.equal(app.providerCalls.length, 1);
    assert.equal(app.rpcCalls.at(-1).args.p_status, "failed");
  }
});

test("provider, model-catalog, and malformed-output failures stay generic and finish the reserved usage event", async () => {
  const modelUnavailable = harness({ models: [{ id: "provider/other-model" }] });
  assert.equal((await modelUnavailable.handler(request(payload())).then(response => response.status)), 503);
  assert.equal(modelUnavailable.providerCalls.length, 0);
  assert.equal(modelUnavailable.rpcCalls[1].args.p_status, "failed");
  assert.equal(modelUnavailable.rpcCalls[1].args.p_error_code, "model_unavailable");

  const providerFailure = harness({ providerResponse: new Response("no", { status: 402 }) });
  assert.deepEqual(await jsonResponse(await providerFailure.handler(request(payload()))), {
    status: 502,
    body: { error: "ai_temporarily_unavailable" },
  });
  assert.equal(providerFailure.rpcCalls[1].args.p_status, "failed");
  assert.equal(providerFailure.rpcCalls[1].args.p_error_code, "provider_request_failed");

  const malformedOutput = harness({ providerResponse: Response.json({ choices: [{ message: { content: "not-json" } }] }) });
  assert.equal((await malformedOutput.handler(request(payload())).then(response => response.status)), 502);
  assert.equal(malformedOutput.rpcCalls[1].args.p_error_code, "invalid_model_response");

  const oversizedProviderOutput = harness({ providerResponse: new Response("x".repeat(33_000)) });
  assert.equal((await oversizedProviderOutput.handler(request(payload())).then(response => response.status)), 502);
  assert.equal(oversizedProviderOutput.rpcCalls[1].args.p_error_code, "invalid_model_response");
});

test("unsafe medical output is never returned and its token usage is still recorded as failed", async () => {
  const responseBody = {
    model: MODEL_ID,
    choices: [{ message: { content: JSON.stringify({ reply: "Hãy thử tư thế em bé để giảm đau lưng." }) } }],
    usage: { prompt_tokens: 91, completion_tokens: 27 },
  };
  const app = harness({ providerResponse: Response.json(responseBody) });
  assert.deepEqual(await jsonResponse(await app.handler(request(payload()))), {
    status: 502,
    body: { error: "ai_temporarily_unavailable" },
  });
  assert.equal(app.rpcCalls[1].args.p_status, "failed");
  assert.equal(app.rpcCalls[1].args.p_error_code, "unsafe_model_response");
  assert.equal(app.rpcCalls[1].args.p_input_tokens, 91);
  assert.equal(app.rpcCalls[1].args.p_output_tokens, 27);
});

test("failed or rejected usage finalization cannot return a successful AI answer", async () => {
  for (const result of [
    { data: null, error: { message: "ledger unavailable" } },
    { data: false, error: null },
  ]) {
    const app = harness({ rpcResults: { mcy_ai_finish_request: result } });
    assert.deepEqual(await jsonResponse(await app.handler(request(payload()))), {
      status: 503,
      body: { error: "ai_temporarily_unavailable" },
    });
    assert.equal(app.rpcCalls.at(-1).name, "mcy_ai_finish_request");
  }
});

test("malformed client request IDs are replaced with a canonical server-generated UUID", async () => {
  const app = harness({ generatedRequestId: "33333333-3333-4333-8333-333333333333" });
  const response = await app.handler(request(payload({ requestId: "a".repeat(36) })));
  assert.equal(response.status, 200);
  assert.equal(app.rpcCalls[0].args.p_request_id, "33333333-3333-4333-8333-333333333333");
});

test("handler accepts the Owner UI's 6000-character prompt bound and fails closed above it", async () => {
  const accepted = harness({ config: { ...CONFIG, system_prompt: "x".repeat(6000) } });
  assert.equal((await accepted.handler(request(payload())).then(response => response.status)), 200);

  const rejected = harness({ config: { ...CONFIG, system_prompt: "x".repeat(6001) } });
  assert.equal((await rejected.handler(request(payload())).then(response => response.status)), 503);
  assert.equal(rejected.providerCalls.length, 0);
  assert.equal(rejected.rpcCalls[1].args.p_error_code, "invalid_configuration");
});
