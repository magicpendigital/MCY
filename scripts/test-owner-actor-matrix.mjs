import { createHash } from "node:crypto";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const STAGING_ORIGIN = "https://mhumbczqrzutdnraafhs.supabase.co";
const ACTORS = [
  ["learner A", "MCY_TEST_LEARNER_A_ACCESS_TOKEN"],
  ["learner B", "MCY_TEST_LEARNER_B_ACCESS_TOKEN"],
  ["teacher", "MCY_TEST_TEACHER_ACCESS_TOKEN"],
  ["reviewer", "MCY_TEST_REVIEWER_ACCESS_TOKEN"],
  ["owner", "MCY_TEST_OWNER_ACCESS_TOKEN"],
];

class MatrixError extends Error {
  constructor(message, exitCode = 1) {
    super(message);
    this.exitCode = exitCode;
  }
}

function configuration(env) {
  let url;
  try { url = new URL(env.VITE_SUPABASE_URL?.trim()); } catch {
    throw new MatrixError("BLOCKED: provide the exact staging URL.", 2);
  }
  if (url.origin !== STAGING_ORIGIN || url.pathname !== "/" || url.search || url.hash || url.username || url.password) {
    throw new MatrixError("BLOCKED: this matrix is locked to mcy-staging.", 2);
  }
  const publishableKey = env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim();
  if (!publishableKey?.startsWith("sb_publishable_")) {
    throw new MatrixError("BLOCKED: only the staging publishable key is permitted.", 2);
  }
  const actors = ACTORS.map(([label, variable]) => ({ label, token: env[variable]?.trim() }));
  if (actors.some(actor => !actor.token)) {
    throw new MatrixError("BLOCKED: refresh all five disposable sessions with the interactive helper.", 2);
  }
  let digests;
  try { digests = JSON.parse(env.MCY_TEST_ACTOR_IDENTITY_DIGESTS); } catch {
    throw new MatrixError("BLOCKED: verify current role bindings and supply their identity digests first.", 2);
  }
  if (!digests || actors.some(actor => !/^[a-f0-9]{64}$/.test(digests[actor.label] ?? ""))
    || new Set(actors.map(actor => digests[actor.label])).size !== actors.length) {
    throw new MatrixError("BLOCKED: five distinct verified identity digests are required.", 2);
  }
  return { actors, digests, publishableKey, conflictSqlstate: env.MCY_TEST_OWNER_CONFLICT_SQLSTATE };
}

// Impossible expected version: never send an Owner save that could succeed.
// Confirm the deployed handler's gate/version checks and positive DB version before running.
export function rejectedSaveProbe(enabled) {
  return {
    action: "save_ai",
    config: {
      enabled,
      version_no: -1,
      model_id: enabled ? "fixture/never-selected" : "",
      system_prompt: "Offline fixture only. This text must never replace the live Owner configuration.",
      temperature: 0.3,
      max_output_tokens: 64,
      per_user_daily_limit: 1,
      global_daily_limit: 1,
    },
  };
}

async function readJson(response) {
  const reader = response.body?.getReader();
  if (!reader) return null;
  const chunks = [];
  let length = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > 65_536) throw new MatrixError("FAIL: response exceeded the safe size limit.");
      chunks.push(value);
    }
  } catch (error) {
    await reader.cancel().catch(() => {});
    throw error;
  } finally { reader.releaseLock(); }
  const bytes = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  try { return JSON.parse(new TextDecoder().decode(bytes)); } catch { return null; }
}

export async function runOwnerActorMatrix({ env = process.env, fetcher = fetch, report = console.log } = {}) {
  let checks = 0;
  try {
    const { actors, digests, publishableKey, conflictSqlstate } = configuration(env);
    async function request(path, token, payload, step = "staging request") {
      const headers = { apikey: publishableKey, accept: "application/json", "cache-control": "no-store" };
      if (token) headers.authorization = `Bearer ${token}`;
      if (payload !== undefined) headers["content-type"] = "application/json";
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 10_000);
      try {
        const response = await fetcher(`${STAGING_ORIGIN}${path}`, {
          method: payload === undefined ? "GET" : "POST",
          headers,
          body: payload === undefined ? undefined : JSON.stringify(payload),
          signal: controller.signal,
          redirect: "error",
        });
        return { status: response.status, body: await readJson(response), headers: response.headers };
      } catch (error) {
        if (error instanceof MatrixError) throw error;
        const timedOut = error?.name === "AbortError" || error?.name === "TimeoutError";
        throw new MatrixError(`FAIL ${step}: ${timedOut ? "request exceeded 10 seconds; outcome unconfirmed" : "transport request failed; details omitted"}.`);
      } finally { clearTimeout(timer); }
    }
    function denied(label, result, status, code) {
      // A 5xx, missing route, token rejection or arbitrary JSON error is not a role denial.
      if (result.status !== status || (code && result.body?.error !== code)
        || !result.body || typeof result.body !== "object" || Array.isArray(result.body)
        || Object.keys(result.body).some(key => !["error", "code", "message"].includes(key))) {
        throw new MatrixError(`FAIL ${label}: expected the specific denial; HTTP ${result.status}.`);
      }
      checks += 1;
      report(`PASS ${label}: HTTP ${status}${code ? `, ${code}` : ""}.`);
    }
    const identified = [];
    for (const actor of actors) {
      const identity = await request("/auth/v1/user", actor.token);
      const id = identity.body?.id;
      if (identity.status !== 200 || !/^[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}$/i.test(id ?? "")
        || !identity.body.email_confirmed_at) {
        throw new MatrixError(`BLOCKED ${actor.label}: Auth did not verify this confirmed session; refresh the helper tokens.`, 2);
      }
      if (createHash("sha256").update(id).digest("hex") !== digests[actor.label]) {
        throw new MatrixError(`BLOCKED ${actor.label}: token identity does not match the independently verified role fixture.`, 2);
      }
      identified.push({ ...actor, id });
    }
    if (new Set(identified.map(actor => actor.id)).size !== actors.length) {
      throw new MatrixError("BLOCKED: the five sessions must represent distinct users.", 2);
    }
    report("PASS fixture preflight: five confirmed sessions match independently verified role identities.");
    const path = "/functions/v1/owner-control-plane";
    const owner = identified.find(actor => actor.label === "owner");
    denied("anonymous Owner access", await request(path, null, { action: "read_ai" }), 401);
    denied("invalid JWT Owner access", await request(path, "invalid-fixture-jwt", { action: "read_ai" }), 401);
    for (const actor of identified.filter(actor => actor !== owner)) {
      denied(`${actor.label} Owner read`, await request(path, actor.token, { action: "read_ai" }), 403, "owner_access_required");
      denied(`${actor.label} forged Owner actor`, await request(path, actor.token, {
        action: "read_ai", actor_id: owner.id, p_actor_id: owner.id,
      }), 403, "owner_access_required");
      const roleProbe = rejectedSaveProbe(false);
      // If roles drift, this invalid model is rejected before the DB version/row-lock path.
      roleProbe.config.model_id = "_invalid-role-probe";
      denied(`${actor.label} rejected Owner save`, await request(path, actor.token, roleProbe), 403, "owner_access_required");
    }
    // When gates are open, deployed v1 rejects -1 at its version check before model lookup.
    // Only the specific closed-gate response permits the subsequent Owner read.
    denied("Owner AI gate closed", await request(path, owner.token, rejectedSaveProbe(true)), 409, "ai_staging_gate_closed");
    const read = await request(path, owner.token, { action: "read_ai" });
    const body = read.body;
    const allowedKeys = ["config", "models", "modelCatalogAvailable", "gatewayKeyConfigured", "provider", "providerKeyConfigured", "spendControlApproved", "enableGateOpen", "environment"];
    const providerFieldsValid = body && (body.provider === "openrouter"
      ? body.providerKeyConfigured === false
      : body.provider === undefined && body.providerKeyConfigured === undefined);
    const configKeys = ["enabled", "model_id", "system_prompt", "temperature", "max_output_tokens", "per_user_daily_limit", "global_daily_limit", "version_no", "updated_by", "updated_at"];
    if (read.status !== 200 || !body || Object.keys(body).some(key => !allowedKeys.includes(key))
      || !body.config || Object.keys(body.config).some(key => !configKeys.includes(key))
      || body.config.enabled !== false || !Number.isInteger(body.config.version_no) || body.config.version_no < 1
      || body.environment !== "staging" || body.enableGateOpen !== false
      || body.gatewayKeyConfigured !== false || !providerFieldsValid || body.spendControlApproved !== false
      || body.models !== null || body.modelCatalogAvailable !== false
      || read.headers.get("cache-control") !== "no-store") {
      throw new MatrixError(`FAIL Owner read: expected an AI-off, secret-free, non-cacheable staging response; HTTP ${read.status}.`);
    }
    checks += 1;
    report("PASS Owner read: HTTP 200; AI/key/spend gates off, no model catalogue, Cache-Control no-store. Configuration values omitted.");
    // PostgREST 14 retries intentional SQLSTATE 40001 indefinitely. A caller timeout does not
    // stop those transactions. Require independently inspected, non-retryable PT409 first.
    if (conflictSqlstate !== "PT409") {
      throw new MatrixError("BLOCKED Owner stale-version save: verify deployed conflict SQLSTATE PT409 before this probe; never retest intentional 40001 on PostgREST 14.", 2);
    }
    denied("Owner stale-version save", await request(path, owner.token, rejectedSaveProbe(false), "Owner stale-version save"), 409, "configuration_conflict");
    report(`PASS Owner actor matrix: ${checks}/${checks} HTTP assertions. No successful save, invite, deployment or inference requested.`);
    return { exitCode: 0, checks };
  } catch (error) {
    // Never serialize thrown fetch/provider errors, raw responses, credentials or configuration.
    report(error instanceof MatrixError ? error.message : "FAIL: bounded staging request failed; sensitive details omitted.");
    return { exitCode: error instanceof MatrixError ? error.exitCode : 1, checks };
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  process.exitCode = (await runOwnerActorMatrix()).exitCode;
}
