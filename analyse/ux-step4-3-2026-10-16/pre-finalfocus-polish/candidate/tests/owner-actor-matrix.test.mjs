import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import test from "node:test";
import { runOwnerActorMatrix, rejectedSaveProbe } from "../scripts/test-owner-actor-matrix.mjs";
import { createOwnerControlPlaneHandler } from "../supabase/functions/_shared/ownerControlPlane.ts";
import { readBoundedJson, RequestBodyTimeoutError, RequestBodyTooLargeError } from "../supabase/functions/_shared/boundedRequest.ts";

const ORIGIN = "https://mhumbczqrzutdnraafhs.supabase.co";
const LABELS = ["learner A", "learner B", "teacher", "reviewer", "owner"];
const VARIABLES = ["LEARNER_A", "LEARNER_B", "TEACHER", "REVIEWER", "OWNER"];
const CONFIG = {
  enabled: false, model_id: "", system_prompt: "PRIVATE-FIXTURE-PROMPT-MUST-NOT-BE-LOGGED",
  temperature: 0.3, max_output_tokens: 64, per_user_daily_limit: 1,
  global_daily_limit: 1, version_no: 1, updated_by: null, updated_at: "2026-10-04T00:00:00Z",
};

function harness(options = {}) {
  const identities = LABELS.map((label, index) => ({
    label, token: `PRIVATE-FIXTURE-TOKEN-${index}`,
    id: `${index + 1}1111111-1111-4111-8111-111111111111`,
    email_confirmed_at: "2026-10-01T00:00:00Z",
  }));
  const digests = Object.fromEntries(identities.map(identity => [identity.label, createHash("sha256").update(identity.id).digest("hex")]));
  const env = {
    VITE_SUPABASE_URL: ORIGIN,
    VITE_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_fictional_offline_only",
    MCY_TEST_ACTOR_IDENTITY_DIGESTS: JSON.stringify(digests),
    MCY_TEST_OWNER_CONFLICT_SQLSTATE: "PT409",
    ...Object.fromEntries(identities.map((identity, index) => [`MCY_TEST_${VARIABLES[index]}_ACCESS_TOKEN`, identity.token])),
    ...options.env,
  };
  const requests = [];
  const logs = [];
  let modelsCalls = 0;
  let writes = 0;
  const serverEnv = { SUPABASE_URL: ORIGIN, ...options.serverEnv };
  const handler = createOwnerControlPlaneHandler({
    env: name => serverEnv[name],
    clients: authorization => ({
      user: { auth: { getUser: async () => ({
        data: { user: identities.find(identity => authorization === `Bearer ${identity.token}`) ?? null }, error: null,
      }) } },
      server: { rpc: async (name, args) => {
        if (args.p_actor_id !== identities[4].id) return { data: null, error: { message: "Owner role required" } };
        if (name === "mcy_ai_get_owner_config") return { data: CONFIG, error: null };
        if (args.p_expected_version !== CONFIG.version_no) return { data: null, error: { message: "changed; reload" } };
        writes += 1;
        return { data: CONFIG, error: null };
      } },
    }),
    readModels: async () => { modelsCalls += 1; return []; },
    readJson: readBoundedJson,
    isBodyTooLarge: error => error instanceof RequestBodyTooLargeError,
    isBodyTimeout: error => error instanceof RequestBodyTimeoutError,
  });
  const fetcher = async (url, init) => {
    assert.equal(new URL(url).origin, ORIGIN);
    assert.equal(init.redirect, "error");
    requests.push({ url, init });
    const overridden = await options.respond?.(url, init);
    if (overridden) return overridden;
    if (url.endsWith("/auth/v1/user")) {
      const user = identities.find(identity => init.headers.authorization === `Bearer ${identity.token}`);
      return Response.json(user ? { id: user.id, email_confirmed_at: user.email_confirmed_at } : { error: "unauthorized" }, { status: user ? 200 : 401 });
    }
    assert.equal(new URL(url).pathname, "/functions/v1/owner-control-plane");
    return handler(new Request(url, init));
  };
  return {
    env, identities, requests, logs,
    run: () => runOwnerActorMatrix({ env, fetcher, report: message => logs.push(message) }),
    get modelsCalls() { return modelsCalls; }, get writes() { return writes; },
  };
}

test("offline five-role matrix passes 17 HTTP assertions without writes, providers or sensitive output", async () => {
  const h = harness();
  assert.deepEqual(await h.run(), { exitCode: 0, checks: 17 });
  assert.equal(h.requests.length, 22);
  assert.equal(h.modelsCalls, 0);
  assert.equal(h.writes, 0);
  const output = h.logs.join("\n");
  for (const value of [...h.identities.flatMap(identity => [identity.id, identity.token]), CONFIG.system_prompt]) {
    assert.equal(output.includes(value), false);
  }
  for (const { init } of h.requests) {
    if (init.body && JSON.parse(init.body).action === "save_ai") {
      assert.equal(JSON.parse(init.body).config.version_no, -1);
    }
  }
});

for (const url of ["https://production.invalid", `${ORIGIN}/other`, `${ORIGIN}/?redirect=other`, `${ORIGIN}/#other`, "https://user:password@mhumbczqrzutdnraafhs.supabase.co"]) {
  test(`noncanonical URL is refused before network: ${new URL(url).pathname}${new URL(url).search}${new URL(url).hash}`, async () => {
    const h = harness({ env: { VITE_SUPABASE_URL: url } });
    assert.equal((await h.run()).exitCode, 2);
    assert.equal(h.requests.length, 0);
  });
}

test("secret key, missing token and missing/malformed identity evidence fail before network", async () => {
  for (const env of [
    { VITE_SUPABASE_PUBLISHABLE_KEY: "sb_secret_NEVER_LOG_ME" },
    { MCY_TEST_OWNER_ACCESS_TOKEN: "" },
    { MCY_TEST_ACTOR_IDENTITY_DIGESTS: "" },
    { MCY_TEST_ACTOR_IDENTITY_DIGESTS: "{}" },
  ]) {
    const h = harness({ env });
    assert.equal((await h.run()).exitCode, 2);
    assert.equal(h.requests.length, 0);
    assert.equal(h.logs.join().includes("NEVER_LOG_ME"), false);
  }
});

test("swapped or duplicate sessions fail identity binding before all Edge probes", async () => {
  const h = harness();
  h.env.MCY_TEST_TEACHER_ACCESS_TOKEN = h.env.MCY_TEST_REVIEWER_ACCESS_TOKEN;
  assert.equal((await h.run()).exitCode, 2);
  assert.equal(h.requests.every(request => request.url.endsWith("/auth/v1/user")), true);
});

test("rejected or unconfirmed sessions block without claiming API authorization failure", async () => {
  for (const response of [Response.json({ error: "SECRET-ERROR" }, { status: 401 }), Response.json({ id: "11111111-1111-4111-8111-111111111111" })]) {
    const h = harness({ respond: async () => response });
    assert.equal((await h.run()).exitCode, 2);
    assert.equal(h.requests.length, 1);
    assert.equal(h.logs.join().includes("SECRET-ERROR"), false);
  }
});

test("open AI gates stop at version conflict before catalogue lookup or any Owner read/save", async () => {
  const h = harness({ serverEnv: {
    OPENROUTER_API_KEY: "OFFLINE-ONLY-SECRET", MCY_AI_ENABLE_STAGING: "true", MCY_AI_SPEND_CONTROL_APPROVED: "true",
  } });
  assert.equal((await h.run()).exitCode, 1);
  assert.equal(h.modelsCalls, 0);
  assert.equal(h.writes, 0);
  const ownerRequests = h.requests.filter(request => request.url.includes("/functions/") && request.init.headers.authorization === `Bearer ${h.identities[4].token}`);
  assert.equal(ownerRequests.length, 1);
  assert.equal(JSON.parse(ownerRequests[0].init.body).config.version_no, -1);
});

for (const status of [401, 404, 500]) {
  test(`HTTP ${status} must not masquerade as non-owner denial`, async () => {
    const h = harness({ respond: async (url, init) => url.includes("/functions/") && init.headers.authorization === "Bearer PRIVATE-FIXTURE-TOKEN-0"
      ? Response.json({ error: "owner_access_required" }, { status }) : undefined });
    assert.equal((await h.run()).exitCode, 1);
    assert.equal(h.modelsCalls, 0);
  });
}

test("unexpected secret fields/configuration and AI drift fail with redacted output", async () => {
  for (const extra of [{ secret: "NEVER-LOG-SECRET" }, { enableGateOpen: true }, { gatewayKeyConfigured: true },
    { provider: "openrouter", providerKeyConfigured: true }, { provider: "unknown", providerKeyConfigured: false }]) {
    const h = harness({ respond: async (url, init) => url.includes("/functions/") && init.headers.authorization === "Bearer PRIVATE-FIXTURE-TOKEN-4"
      && JSON.parse(init.body).action === "read_ai" ? Response.json({
        config: CONFIG, models: null, modelCatalogAvailable: false, gatewayKeyConfigured: false,
        spendControlApproved: false, enableGateOpen: false, environment: "staging", ...extra,
      }, { headers: { "cache-control": "no-store" } }) : undefined });
    assert.equal((await h.run()).exitCode, 1);
    assert.equal(h.logs.join().includes("NEVER-LOG-SECRET"), false);
    assert.equal(h.writes, 0);
  }
});

test("oversized responses and thrown network errors never serialize raw details", async () => {
  for (const respond of [
    async () => new Response("NEVER-LOG-".repeat(10_000)),
    async () => { throw new Error("NEVER-LOG-TOKEN-OR-PROVIDER-ERROR"); },
  ]) {
    const h = harness({ respond });
    assert.equal((await h.run()).exitCode, 1);
    assert.equal(h.logs.join().includes("NEVER-LOG-"), false);
  }
});

test("enabled and disabled save probes always use the impossible expected version", () => {
  for (const enabled of [true, false]) {
    assert.equal(rejectedSaveProbe(enabled).config.version_no, -1);
    assert.equal(rejectedSaveProbe(enabled).config.enabled, enabled);
  }
});

test("timeout names are classified without leaking the thrown message", async () => {
  for (const name of ["AbortError", "TimeoutError"]) {
    const h = harness({ respond: async () => {
      const error = new Error("NEVER-LOG-TOKEN-TIMEOUT");
      error.name = name;
      throw error;
    } });
    assert.equal((await h.run()).exitCode, 1);
    assert.match(h.logs.join(), /outcome unconfirmed/);
    assert.equal(h.logs.join().includes("NEVER-LOG-TOKEN"), false);
  }
});

test("missing or retryable conflict code skips the unsafe Owner RPC probe and reports BLOCKED", async () => {
  for (const code of [undefined, "40001", "P0001"]) {
    const h = harness({ env: { MCY_TEST_OWNER_CONFLICT_SQLSTATE: code } });
    assert.deepEqual(await h.run(), { exitCode: 2, checks: 16 });
    assert.equal(h.writes, 0);
    assert.equal(h.modelsCalls, 0);
    const ownerSaves = h.requests.filter(request => request.url.includes("/functions/")
      && request.init.headers.authorization === `Bearer ${h.identities[4].token}`
      && JSON.parse(request.init.body).action === "save_ai");
    assert.equal(ownerSaves.length, 1);
    assert.equal(JSON.parse(ownerSaves[0].init.body).config.enabled, true, "only the fail-before-RPC gate check is allowed");
  }
});

test("non-owner save probes also fail input validation before version conflicts if roles drift", async () => {
  const h = harness();
  await h.run();
  for (const request of h.requests.filter(request => request.url.includes("/functions/")
    && request.init.headers.authorization !== `Bearer ${h.identities[4].token}`
    && JSON.parse(request.init.body).action === "save_ai")) {
    assert.equal(JSON.parse(request.init.body).config.model_id, "_invalid-role-probe");
  }
});
