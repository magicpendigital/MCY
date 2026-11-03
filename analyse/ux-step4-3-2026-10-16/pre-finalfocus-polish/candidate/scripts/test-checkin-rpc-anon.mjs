import { randomUUID } from "node:crypto";

const STAGING_ORIGIN = "https://mhumbczqrzutdnraafhs.supabase.co";

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

  if (parsedUrl.origin !== STAGING_ORIGIN || parsedUrl.pathname !== "/" || parsedUrl.search || parsedUrl.hash) {
    throw new Error("Refusing to run: this test is locked to the mcy-staging API URL.");
  }
  if (!publishableKey.startsWith("sb_publishable_")) {
    throw new Error("Refusing to run: provide only the staging publishable key, never a secret key.");
  }

  return { publishableKey, rpcUrl: `${STAGING_ORIGIN}/rest/v1/rpc/save_my_checkin_with_current_consent` };
}

async function main() {
  const { publishableKey, rpcUrl } = stagingConfiguration();
  const response = await fetch(rpcUrl, {
    method: "POST",
    headers: {
      apikey: publishableKey,
      accept: "application/json",
      "content-type": "application/json",
      "cache-control": "no-store",
    },
    body: JSON.stringify({
      p_local_date: "2026-09-28",
      p_local_timezone: "Asia/Ho_Chi_Minh",
      p_energy_level: 3,
      p_body_status: "reported",
      p_capture_type: "standalone",
      p_observations: [{
        region_code: "elbow_left",
        state: "discomfort",
        level: 2,
        note: "anon security probe",
      }],
      p_idempotency_key: `anon-checkin-${randomUUID()}`,
    }),
    signal: AbortSignal.timeout(10_000),
  });

  let payload;
  try {
    payload = await response.json();
  } catch {
    payload = undefined;
  }

  if (!(response.status >= 400 && payload?.code === "42501")) {
    throw new Error(
      `Expected anonymous RPC denial (PostgreSQL 42501); received HTTP ${response.status}, code ${payload?.code ?? "none"}.`,
    );
  }

  console.log(`PASS mcy-staging anonymous check-in RPC denied (HTTP ${response.status}, PostgreSQL 42501; no session token, no row written).`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Anonymous check-in RPC test failed.");
  process.exitCode = 1;
});
