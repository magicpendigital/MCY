import { randomUUID } from "node:crypto";

const STAGING_ORIGIN = "https://mhumbczqrzutdnraafhs.supabase.co";

function stagingConfiguration() {
  const rawUrl = process.env.VITE_SUPABASE_URL?.trim();
  const publishableKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim();

  if (!rawUrl || !publishableKey) {
    throw new Error("Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in .env.local or the environment.");
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

  return { publishableKey, restUrl: `${STAGING_ORIGIN}/rest/v1/plan_items` };
}

async function request(url, { method, body, publishableKey }) {
  const response = await fetch(url, {
    method,
    headers: {
      apikey: publishableKey,
      accept: "application/json",
      "content-type": "application/json",
      "cache-control": "no-store",
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(10_000),
  });

  const responseText = await response.text();
  let payload;
  try {
    payload = responseText ? JSON.parse(responseText) : undefined;
  } catch {
    payload = undefined;
  }

  return { status: response.status, code: payload?.code };
}

function assertPermissionDenied(label, result) {
  if (result.status >= 400 && result.code === "42501") {
    console.log(`PASS ${label}: HTTP ${result.status}, PostgreSQL 42501`);
    return;
  }

  throw new Error(
    `FAIL ${label}: expected PostgreSQL 42501, received HTTP ${result.status}, code ${result.code ?? "none"}.`,
  );
}

async function main() {
  const { publishableKey, restUrl } = stagingConfiguration();
  const probeId = randomUUID();

  const insert = await request(restUrl, {
    method: "POST",
    publishableKey,
    // An empty bulk insert checks table-level permission without creating a row.
    body: [],
  });
  assertPermissionDenied("anon INSERT plan item", insert);

  const targetUrl = new URL(restUrl);
  targetUrl.searchParams.set("id", `eq.${probeId}`);

  const update = await request(targetUrl, {
    method: "PATCH",
    publishableKey,
    body: { position: 1 },
  });
  assertPermissionDenied("anon UPDATE plan item", update);

  const remove = await request(targetUrl, {
    method: "DELETE",
    publishableKey,
  });
  assertPermissionDenied("anon DELETE plan item", remove);

  console.log("PASS staging anon plan-items ACL PostgREST checks (no session token; no data changed).");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Plan-items ACL test failed.");
  process.exitCode = 1;
});
