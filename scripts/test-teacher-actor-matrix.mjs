import { randomUUID } from "node:crypto";

const STAGING_ORIGIN = "https://mhumbczqrzutdnraafhs.supabase.co";
const ACTORS = [
  ["learner A", "MCY_TEST_LEARNER_A_ACCESS_TOKEN"],
  ["learner B", "MCY_TEST_LEARNER_B_ACCESS_TOKEN"],
  ["teacher", "MCY_TEST_TEACHER_ACCESS_TOKEN"],
  ["reviewer", "MCY_TEST_REVIEWER_ACCESS_TOKEN"],
  ["owner", "MCY_TEST_OWNER_ACCESS_TOKEN"],
];

function stagingConfiguration() {
  const rawUrl = process.env.VITE_SUPABASE_URL?.trim();
  const publishableKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim();

  if (!rawUrl || !publishableKey) {
    throw new Error("Set the staging Supabase URL and publishable key in .env.local or the environment.");
  }

  let parsedUrl;
  try {
    parsedUrl = new URL(rawUrl);
  } catch {
    throw new Error("VITE_SUPABASE_URL is not a valid URL.");
  }

  if (
    parsedUrl.origin !== STAGING_ORIGIN ||
    parsedUrl.pathname !== "/" ||
    parsedUrl.search ||
    parsedUrl.hash ||
    parsedUrl.username ||
    parsedUrl.password
  ) {
    throw new Error("Refusing to run: this test is locked to the mcy-staging API URL.");
  }

  if (!publishableKey.startsWith("sb_publishable_")) {
    throw new Error("Refusing to run: provide only the staging publishable key, never a secret key.");
  }

  const actors = ACTORS.map(([label, variable]) => ({
    label,
    variable,
    token: process.env[variable]?.trim(),
  }));
  const missing = actors.filter((actor) => !actor.token).map((actor) => actor.variable);

  return { actors, missing, publishableKey };
}

async function readJson(response) {
  const text = await response.text();
  try {
    return text ? JSON.parse(text) : undefined;
  } catch {
    return undefined;
  }
}

async function request(url, { method = "GET", body, publishableKey, token, profile }) {
  const headers = {
    apikey: publishableKey,
    accept: "application/json",
    "cache-control": "no-store",
  };

  if (token) headers.authorization = `Bearer ${token}`;
  if (profile) {
    headers["accept-profile"] = profile;
    headers["content-profile"] = profile;
  }
  if (body !== undefined) headers["content-type"] = "application/json";

  const response = await fetch(url, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(10_000),
  });

  return { status: response.status, payload: await readJson(response) };
}

async function identifyActor(actor, publishableKey) {
  const result = await request(`${STAGING_ORIGIN}/auth/v1/user`, {
    publishableKey,
    token: actor.token,
  });
  const userId = result.payload?.id;

  if (result.status !== 200 || !/^[0-9a-f-]{36}$/i.test(userId ?? "")) {
    throw new Error(`FAIL ${actor.label} fixture: staging Auth rejected the access token.`);
  }

  return { ...actor, userId };
}

function assertPermissionDenied(label, result) {
  if (result.status >= 400 && result.payload?.code === "42501") {
    console.log(`PASS ${label}: HTTP ${result.status}, PostgreSQL 42501`);
    return;
  }

  throw new Error(
    `FAIL ${label}: expected PostgreSQL 42501, received HTTP ${result.status}, code ${result.payload?.code ?? "none"}.`,
  );
}

async function verifyTeacherWriteDenials(actor, publishableKey) {
  const collectionUrl = `${STAGING_ORIGIN}/rest/v1/teachers`;
  const probeId = randomUUID();

  const insert = await request(collectionUrl, {
    method: "POST",
    publishableKey,
    token: actor.token,
    // Empty bulk insert checks the table privilege without providing any row to create.
    body: [],
  });
  assertPermissionDenied(`${actor.label} direct INSERT privilege`, insert);

  const targetUrl = new URL(collectionUrl);
  targetUrl.searchParams.set("user_id", `eq.${probeId}`);

  const update = await request(targetUrl, {
    method: "PATCH",
    publishableKey,
    token: actor.token,
    body: { active: true },
  });
  assertPermissionDenied(`${actor.label} direct UPDATE teacher`, update);

  const remove = await request(targetUrl, {
    method: "DELETE",
    publishableKey,
    token: actor.token,
  });
  assertPermissionDenied(`${actor.label} direct DELETE teacher`, remove);

  const privateTableUrl = `${STAGING_ORIGIN}/rest/v1/role_assignments`;
  const privateWrite = await request(privateTableUrl, {
    method: "POST",
    publishableKey,
    token: actor.token,
    profile: "private",
    // Empty bulk insert checks schema/table access without providing a role assignment to create.
    body: [],
  });

  assertPrivateRoleWriteDenied(`${actor.label} direct role-assignment INSERT`, privateWrite);

  const privateTargetUrl = new URL(privateTableUrl);
  privateTargetUrl.searchParams.set("id", `eq.${probeId}`);
  const privateUpdate = await request(privateTargetUrl, {
    method: "PATCH",
    publishableKey,
    token: actor.token,
    profile: "private",
    body: { role: "owner" },
  });
  assertPrivateRoleWriteDenied(`${actor.label} direct role-assignment UPDATE`, privateUpdate);

  const privateDelete = await request(privateTargetUrl, {
    method: "DELETE",
    publishableKey,
    token: actor.token,
    profile: "private",
  });
  assertPrivateRoleWriteDenied(`${actor.label} direct role-assignment DELETE`, privateDelete);
}

async function verifyPlanItemWriteDenials(actor, publishableKey) {
  const collectionUrl = `${STAGING_ORIGIN}/rest/v1/plan_items`;
  const probeId = randomUUID();

  const insert = await request(collectionUrl, {
    method: "POST",
    publishableKey,
    token: actor.token,
    // Empty bulk insert checks table-level permission without providing a row.
    body: [],
  });
  assertPermissionDenied(`${actor.label} direct plan-item INSERT`, insert);

  const targetUrl = new URL(collectionUrl);
  targetUrl.searchParams.set("id", `eq.${probeId}`);

  const update = await request(targetUrl, {
    method: "PATCH",
    publishableKey,
    token: actor.token,
    body: { position: 1 },
  });
  assertPermissionDenied(`${actor.label} direct plan-item UPDATE`, update);

  const remove = await request(targetUrl, {
    method: "DELETE",
    publishableKey,
    token: actor.token,
  });
  assertPermissionDenied(`${actor.label} direct plan-item DELETE`, remove);
}

function assertPrivateRoleWriteDenied(label, result) {
  if (
    (result.status === 406 && result.payload?.code === "PGRST106") ||
    (result.status >= 400 && result.payload?.code === "42501")
  ) {
    console.log(`PASS ${label}: denied (${result.payload.code}).`);
    return;
  }

  throw new Error(
    `FAIL ${label}: expected private-schema or permission denial, received HTTP ${result.status}, code ${result.payload?.code ?? "none"}.`,
  );
}

async function main() {
  const { actors, missing, publishableKey } = stagingConfiguration();
  if (missing.length > 0) {
    console.error(`CHƯA CHẠY: missing disposable staging actor tokens: ${missing.join(", ")}.`);
    process.exitCode = 2;
    return;
  }

  const identifiedActors = [];
  for (const actor of actors) {
    identifiedActors.push(await identifyActor(actor, publishableKey));
  }

  const distinctUserIds = new Set(identifiedActors.map((actor) => actor.userId));
  if (distinctUserIds.size !== identifiedActors.length) {
    throw new Error("Refusing to run: each actor fixture must belong to a distinct staging user.");
  }

  // Fixture labels are not authorization evidence. Their server-assigned roles must be provisioned
  // and verified separately; user-editable Auth metadata is deliberately not used for that check.

  for (const actor of identifiedActors) {
    await verifyTeacherWriteDenials(actor, publishableKey);
    await verifyPlanItemWriteDenials(actor, publishableKey);
  }

  console.log("PASS staging actor matrix: no direct teacher, role-assignment, or plan-item writes succeeded.");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Teacher actor matrix failed.");
  process.exitCode = 1;
});
