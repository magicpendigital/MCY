import assert from "node:assert/strict";
import test from "node:test";
import { createOwnerControlPlaneHandler } from "../supabase/functions/_shared/ownerControlPlane.ts";
import { readBoundedJson, RequestBodyTimeoutError, RequestBodyTooLargeError } from "../supabase/functions/_shared/boundedRequest.ts";

const STAGING_URL = "https://mhumbczqrzutdnraafhs.supabase.co";
const OWNER_ID = "11111111-1111-4111-8111-111111111111";
const VALID_TOKEN = "verified-owner-access-token";
const PROMPT = "Keep a gentle tone and ask at most one clarifying question.";
const DEFAULT_CONFIG = {
  enabled: false,
  model_id: "",
  system_prompt: PROMPT,
  temperature: 0.3,
  max_output_tokens: 320,
  per_user_daily_limit: 10,
  global_daily_limit: 100,
  version_no: 1,
};
const DEFAULT_MODELS = [{ id: "provider/model-a", name: "Model A" }];

function harness(options = {}) {
  const env = new Map(Object.entries({ SUPABASE_URL: STAGING_URL, ...options.env }));
  const calls = [];
  const modelsCalls = [];
  const authCalls = [];
  const rpcResults = options.rpcResults ?? {};
  const identity = options.identity === undefined
    ? { id: OWNER_ID, email_confirmed_at: "2026-09-01T00:00:00Z" }
    : options.identity;
  const handler = createOwnerControlPlaneHandler({
    env: name => env.get(name),
    clients: authorization => {
      authCalls.push(authorization);
      return {
        user: {
          auth: { getUser: async token => ({ data: { user: token === VALID_TOKEN ? identity : null }, error: options.authError ?? null }) },
        },
        server: {
          rpc: async (name, args) => {
            calls.push({ name, args });
            const configured = rpcResults[name];
            if (typeof configured === "function") return await configured(args);
            return configured ?? { data: options.config ?? DEFAULT_CONFIG, error: null };
          },
        },
      };
    },
    readModels: async apiKey => {
      modelsCalls.push(apiKey);
      if (options.modelError) throw new Error("provider_unavailable");
      return options.models ?? DEFAULT_MODELS;
    },
    readJson: options.readJson ?? readBoundedJson,
    isBodyTooLarge: error => error instanceof RequestBodyTooLargeError,
    isBodyTimeout: error => error instanceof RequestBodyTimeoutError,
  });
  return { handler, calls, modelsCalls, authCalls };
}

function request(body, options = {}) {
  const headers = new Headers(options.headers);
  if (options.token !== null) headers.set("Authorization", `Bearer ${options.token ?? VALID_TOKEN}`);
  if (body !== undefined) headers.set("Content-Type", "application/json");
  return new Request("https://function.invalid/owner-control-plane", {
    method: options.method ?? "POST",
    headers,
    body: body === undefined ? undefined : typeof body === "string" ? body : JSON.stringify(body),
  });
}

async function jsonResponse(response) {
  return { status: response.status, body: await response.json() };
}

function savePayload(overrides = {}) {
  return {
    action: "save_ai",
    config: { ...DEFAULT_CONFIG, ...overrides },
  };
}

test("Owner control plane rejects methods, missing identity, and non-staging configuration", async () => {
  const methodHarness = harness();
  assert.equal((await methodHarness.handler(request(undefined, { method: "GET" }))).status, 405);
  assert.equal(methodHarness.authCalls.length, 0);

  const anonymousHarness = harness();
  assert.deepEqual(await jsonResponse(await anonymousHarness.handler(request({ action: "read_ai" }, { token: null }))), {
    status: 401, body: { error: "authentication_required" },
  });

  const wrongProjectHarness = harness({ env: { SUPABASE_URL: "https://production.supabase.co" } });
  assert.equal((await wrongProjectHarness.handler(request({ action: "read_ai" }))).status, 404);
  assert.equal(wrongProjectHarness.authCalls.length, 0);

  const unconfirmedHarness = harness({ identity: { id: OWNER_ID, email_confirmed_at: null } });
  assert.equal((await unconfirmedHarness.handler(request({ action: "read_ai" }))).status, 401);
  assert.equal(unconfirmedHarness.calls.length, 0);
});

test("Owner reads require server RPC authorization and never return the OpenRouter key", async () => {
  const denied = harness({ rpcResults: { mcy_ai_get_owner_config: { data: null, error: { message: "Owner role required" } } } });
  assert.deepEqual(await jsonResponse(await denied.handler(request({ action: "read_ai" }))), {
    status: 403, body: { error: "owner_access_required" },
  });

  const secret = "test-only-never-return-this";
  const allowed = harness({ env: { OPENROUTER_API_KEY: secret, MCY_AI_ENABLE_STAGING: "false" } });
  const response = await allowed.handler(request({ action: "read_ai" }));
  const serialized = await response.text();
  assert.equal(response.status, 200);
  assert.equal(serialized.includes(secret), false);
  assert.deepEqual(JSON.parse(serialized), {
    config: DEFAULT_CONFIG,
    models: DEFAULT_MODELS,
    modelCatalogAvailable: true,
    provider: "openrouter",
    providerKeyConfigured: true,
    gatewayKeyConfigured: false,
    spendControlApproved: false,
    enableGateOpen: false,
    environment: "staging",
  });
  assert.deepEqual(allowed.calls, [{ name: "mcy_ai_get_owner_config", args: { p_actor_id: OWNER_ID } }]);
  assert.deepEqual(allowed.modelsCalls, [secret], "Owner can inspect readiness while inference remains off");

  const gatedOn = harness({
    env: {
      OPENROUTER_API_KEY: secret,
      MCY_AI_ENABLE_STAGING: "true",
      MCY_AI_SPEND_CONTROL_APPROVED: "true",
    },
  });
  const gatedResponse = await jsonResponse(await gatedOn.handler(request({ action: "read_ai" })));
  assert.equal(gatedResponse.body.enableGateOpen, true);
  assert.equal(gatedResponse.body.spendControlApproved, true);
  assert.equal(gatedResponse.body.modelCatalogAvailable, true);
  assert.deepEqual(gatedOn.modelsCalls, [secret]);
});

test("Owner request timeout is returned as a retryable client timeout", async () => {
  const timedOut = harness({ readJson: async () => { throw new RequestBodyTimeoutError(); } });
  assert.deepEqual(await jsonResponse(await timedOut.handler(request({ action: "read_ai" }))), {
    status: 408,
    body: { error: "request_timeout" },
  });
  assert.equal(timedOut.calls.length, 0);
});

test("AI-off reads and disabled saves need no OpenRouter key or model catalog", async () => {
  const disabledConfig = { ...DEFAULT_CONFIG, enabled: false, model_id: "" };
  const disabled = harness({
    rpcResults: {
      mcy_ai_save_owner_config: { data: disabledConfig, error: null },
    },
  });
  const read = await jsonResponse(await disabled.handler(request({ action: "read_ai" })));
  assert.equal(read.status, 200);
  assert.equal(read.body.models, null);
  assert.equal(read.body.providerKeyConfigured, false);
  assert.equal(read.body.spendControlApproved, false);
  assert.equal(read.body.enableGateOpen, false);

  const saveRequest = { ...savePayload(), actor_id: "99999999-9999-4999-8999-999999999999" };
  const save = await jsonResponse(await disabled.handler(request(saveRequest)));
  assert.equal(save.status, 200);
  assert.deepEqual(save.body, { config: disabledConfig });
  assert.equal(disabled.modelsCalls.length, 0);
  const saveCall = disabled.calls.find(call => call.name === "mcy_ai_save_owner_config");
  assert.ok(saveCall);
  assert.equal(saveCall.args.p_actor_id, OWNER_ID);
  assert.equal(saveCall.args.p_model_id, "");
  assert.equal(saveCall.args.p_enabled, false);
  assert.equal(saveCall.args.p_actor_id, OWNER_ID, "the actor must come only from the verified access token");
  assert.equal("actor_id" in saveCall.args, false);
});

test("Owner readiness excludes models the applied save RPC cannot persist while inference remains closed", async () => {
  const h = harness({ env: { OPENROUTER_API_KEY: "fictional-key", MCY_AI_ENABLE_STAGING: "false" }, models: [{ id: "provider/model:free" }, { id: "provider/model" }] });
  const r = await jsonResponse(await h.handler(request({ action: "read_ai" })));
  assert.equal(r.status, 200); assert.deepEqual(r.body.models, [{ id: "provider/model" }]); assert.equal(r.body.enableGateOpen, false);
  assert.equal(h.calls.some(c => c.name === "mcy_ai_save_owner_config"), false);
});

test("oversized, malformed, and structurally invalid requests fail before RPC", async () => {
  const large = harness();
  const oversized = `{"action":"read_ai","padding":"${"x".repeat(32768)}"}`;
  assert.deepEqual(await jsonResponse(await large.handler(request(oversized))), {
    status: 413, body: { error: "request_too_large" },
  });
  assert.deepEqual(await jsonResponse(await large.handler(request("{"))), {
    status: 400, body: { error: "invalid_request" },
  });
  assert.deepEqual(await jsonResponse(await large.handler(request([]))), {
    status: 400, body: { error: "invalid_request" },
  });
  assert.equal(large.calls.length, 0);

  const invalid = harness();
  const response = await jsonResponse(await invalid.handler(request({ action: "save_ai", config: { ...DEFAULT_CONFIG, temperature: "high" } })));
  assert.deepEqual(response, { status: 400, body: { error: "invalid_configuration" } });
  assert.equal(invalid.calls.length, 0);
});

test("enable requests fail closed before RPC unless staging, spend approval, and key gates are open", async () => {
  const noKey = harness({ env: { MCY_AI_ENABLE_STAGING: "true" } });
  assert.deepEqual(await jsonResponse(await noKey.handler(request(savePayload({ enabled: true, model_id: "provider/model-a" })))), {
    status: 409, body: { error: "ai_staging_gate_closed" },
  });
  assert.equal(noKey.calls.length, 0);
  assert.equal(noKey.modelsCalls.length, 0);

  const noSpendApproval = harness({
    env: { OPENROUTER_API_KEY: "test-only-key", MCY_AI_ENABLE_STAGING: "true" },
  });
  assert.deepEqual(await jsonResponse(await noSpendApproval.handler(request(savePayload({ enabled: true, model_id: "provider/model-a" })))), {
    status: 409, body: { error: "ai_staging_gate_closed" },
  });
  assert.equal(noSpendApproval.calls.length, 0);
  assert.equal(noSpendApproval.modelsCalls.length, 0);

  const closedFlag = harness({ env: { OPENROUTER_API_KEY: "test-only-key", MCY_AI_ENABLE_STAGING: "false" } });
  assert.equal((await closedFlag.handler(request(savePayload({ enabled: true, model_id: "provider/model-a" })))).status, 409);
  assert.equal(closedFlag.calls.length, 0);
  assert.equal(closedFlag.modelsCalls.length, 0);
});

test("enabled saves check owner, configuration version, and live model before persistence", async () => {
  const enabledConfig = { ...DEFAULT_CONFIG, enabled: true, model_id: "provider/model-a" };
  const ownerDenied = harness({
    env: { OPENROUTER_API_KEY: "test-only-key", MCY_AI_ENABLE_STAGING: "true", MCY_AI_SPEND_CONTROL_APPROVED: "true" },
    rpcResults: { mcy_ai_get_owner_config: { data: null, error: { message: "Owner role required" } } },
  });
  assert.deepEqual(await jsonResponse(await ownerDenied.handler(request(savePayload(enabledConfig)))), {
    status: 403, body: { error: "owner_access_required" },
  });
  assert.equal(ownerDenied.modelsCalls.length, 0);

  const conflict = harness({
    env: { OPENROUTER_API_KEY: "test-only-key", MCY_AI_ENABLE_STAGING: "true", MCY_AI_SPEND_CONTROL_APPROVED: "true" },
    rpcResults: { mcy_ai_get_owner_config: { data: { ...DEFAULT_CONFIG, version_no: 2 }, error: null } },
  });
  assert.deepEqual(await jsonResponse(await conflict.handler(request(savePayload(enabledConfig)))), {
    status: 409, body: { error: "configuration_conflict" },
  });
  assert.equal(conflict.modelsCalls.length, 0);
  assert.equal(conflict.calls.some(call => call.name === "mcy_ai_save_owner_config"), false);

  const unsupported = harness({
    env: { OPENROUTER_API_KEY: "test-only-key", MCY_AI_ENABLE_STAGING: "true", MCY_AI_SPEND_CONTROL_APPROVED: "true" },
    rpcResults: {
      mcy_ai_get_owner_config: { data: DEFAULT_CONFIG, error: null },
      mcy_ai_save_owner_config: { data: enabledConfig, error: null },
    },
    models: [{ id: "provider/different-model" }],
  });
  assert.deepEqual(await jsonResponse(await unsupported.handler(request(savePayload(enabledConfig)))), {
    status: 400, body: { error: "unsupported_model" },
  });
  assert.equal(unsupported.calls.some(call => call.name === "mcy_ai_save_owner_config"), false);
});

test("model catalogue failures and RPC failures return bounded public error codes", async () => {
  const catalogue = harness({
    env: { OPENROUTER_API_KEY: "test-only-key", MCY_AI_ENABLE_STAGING: "true", MCY_AI_SPEND_CONTROL_APPROVED: "true" },
    modelError: true,
  });
  const read = await jsonResponse(await catalogue.handler(request({ action: "read_ai" })));
  assert.equal(read.status, 200);
  assert.equal(read.body.modelCatalogAvailable, false);
  assert.equal(read.body.models, null);

  const enabledConfig = { ...DEFAULT_CONFIG, enabled: true, model_id: "provider/model-a" };
  const saveCatalogue = harness({
    env: { OPENROUTER_API_KEY: "test-only-key", MCY_AI_ENABLE_STAGING: "true", MCY_AI_SPEND_CONTROL_APPROVED: "true" },
    modelError: true,
    rpcResults: { mcy_ai_get_owner_config: { data: DEFAULT_CONFIG, error: null } },
  });
  assert.deepEqual(await jsonResponse(await saveCatalogue.handler(request(savePayload(enabledConfig)))), {
    status: 503, body: { error: "model_catalog_unavailable" },
  });
  assert.equal(saveCatalogue.calls.some(call => call.name === "mcy_ai_save_owner_config"), false);

  const rpcConflict = harness({
    rpcResults: { mcy_ai_save_owner_config: { data: null, error: { message: "AI configuration changed; reload before saving" } } },
  });
  assert.deepEqual(await jsonResponse(await rpcConflict.handler(request(savePayload()))), {
    status: 409, body: { error: "configuration_conflict" },
  });

  const ownerRecheck = harness({
    rpcResults: { mcy_ai_save_owner_config: { data: null, error: { message: "Owner role required" } } },
  });
  assert.deepEqual(await jsonResponse(await ownerRecheck.handler(request(savePayload()))), {
    status: 403, body: { error: "owner_access_required" },
  });
});

test("OPTIONS and unexpected action return safe responses without logging request contents", async () => {
  const options = harness();
  const preflight = await options.handler(request(undefined, { method: "OPTIONS" }));
  assert.equal(preflight.status, 200);
  assert.deepEqual(options.authCalls, []);

  const unknown = harness();
  assert.deepEqual(await jsonResponse(await unknown.handler(request({ action: "unknown", message: "private learner message" }))), {
    status: 400, body: { error: "unsupported_action" },
  });
  assert.deepEqual(unknown.calls, []);
});

test("Owner domain conflicts use PT409; real serialization failures never become 409 or retry", async () => {
  for (const [code, status, publicError] of [
    ["PT409", 409, "configuration_conflict"],
    ["40001", 503, "owner_service_unavailable"],
    ["42501", 403, "owner_access_required"],
    ["22023", 400, "configuration_rejected"],
  ]) {
    const h = harness({ rpcResults: { mcy_ai_save_owner_config: {
      data: null, error: { code, message: "AI configuration changed; reload; Owner role; private row data" },
    } } });
    const response = await h.handler(request(savePayload()));
    assert.equal(response.status, status);
    assert.deepEqual(await response.json(), { error: publicError });
    assert.equal(response.headers.get("Cache-Control"), "no-store");
    assert.equal(h.calls.length, 1);
    assert.equal(h.modelsCalls.length, 0);
  }
});
