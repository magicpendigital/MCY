import { randomUUID } from "node:crypto";

const STAGING_ORIGIN = "https://mhumbczqrzutdnraafhs.supabase.co";

function stagingConfiguration() {
  const rawUrl = process.env.VITE_SUPABASE_URL?.trim();
  const publishableKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim();

  if (!rawUrl || !publishableKey) {
    throw new Error(
      "Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in .env.local or the environment.",
    );
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

  return { publishableKey, restUrl: `${STAGING_ORIGIN}/rest/v1/teachers` };
}

async function request(url, { method = "GET", body, publishableKey }) {
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

async function assertNoVisibleTeacher(restUrl, publishableKey, userId, label) {
  const url = new URL(restUrl);
  url.searchParams.set("select", "user_id");
  url.searchParams.set("user_id", `eq.${userId}`);

  const response = await fetch(url, {
    headers: {
      apikey: publishableKey,
      accept: "application/json",
      "cache-control": "no-store",
    },
    signal: AbortSignal.timeout(10_000),
  });
  const responseText = await response.text();
  let rows;
  try {
    rows = responseText ? JSON.parse(responseText) : undefined;
  } catch {
    rows = undefined;
  }

  if (!response.ok || !Array.isArray(rows) || rows.length !== 0) {
    throw new Error(`FAIL ${label}: expected an empty successful read, received HTTP ${response.status}.`);
  }
}

async function main() {
  const { publishableKey, restUrl } = stagingConfiguration();
  const probeUserId = randomUUID();
  const probeName = `acl-test-${probeUserId.slice(0, 8)}`;

  await assertNoVisibleTeacher(restUrl, publishableKey, probeUserId, "preflight");

  const insertUrl = new URL(restUrl);
  const insert = await request(insertUrl, {
    method: "POST",
    publishableKey,
    // user_id is intentionally omitted (it is required); even if INSERT is accidentally granted,
    // this probe cannot create a row or attach a teacher role to a real account.
    body: { public_name: probeName, bio: null, active: true },
  });
  assertPermissionDenied("anon INSERT active teacher", insert);

  const targetUrl = new URL(restUrl);
  targetUrl.searchParams.set("user_id", `eq.${probeUserId}`);

  const update = await request(targetUrl, {
    method: "PATCH",
    publishableKey,
    body: { public_name: probeName, active: true },
  });
  assertPermissionDenied("anon UPDATE teacher", update);

  const remove = await request(targetUrl, {
    method: "DELETE",
    publishableKey,
  });
  assertPermissionDenied("anon DELETE teacher", remove);

  await assertNoVisibleTeacher(restUrl, publishableKey, probeUserId, "postflight");
  console.log("PASS staging anon teacher ACL PostgREST checks (no session token used; no data changed).");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Teacher ACL test failed.");
  process.exitCode = 1;
});
