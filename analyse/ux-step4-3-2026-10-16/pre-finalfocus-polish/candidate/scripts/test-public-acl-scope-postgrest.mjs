import { randomUUID } from "node:crypto";

const STAGING_ORIGIN = "https://mhumbczqrzutdnraafhs.supabase.co";

const noClientReadTables = [
  "campaigns",
  "caption_tracks",
  "content_placements",
  "course_lessons",
  "course_versions",
  "courses",
  "editorial_ai_grants",
  "editorial_publication_events",
  "editorial_review_events",
  "media_assets",
  "media_renditions",
  "session_alternatives",
  "session_assets",
  "session_publication_events",
  "session_publications",
  "session_review_events",
  "session_suitability_rules",
  "session_version_availability",
];

const selectOnlyTables = [
  "editorial_items",
  "editorial_publications",
  "editorial_routes",
  "editorial_seo",
  "editorial_session_links",
  "editorial_sources",
  "editorial_version_topics",
  "help_placements",
  "topic_localizations",
  "topics",
];

const harmlessFilterColumns = {
  campaigns: "id",
  caption_tracks: "id",
  content_placements: "id",
  course_lessons: "course_version_id",
  course_versions: "id",
  courses: "id",
  editorial_ai_grants: "editorial_version_id",
  editorial_publication_events: "id",
  editorial_items: "id",
  editorial_publications: "item_id",
  editorial_review_events: "id",
  editorial_routes: "id",
  editorial_seo: "version_id",
  editorial_session_links: "editorial_version_id",
  editorial_sources: "id",
  editorial_version_topics: "editorial_version_id",
  help_placements: "editorial_version_id",
  media_assets: "id",
  media_renditions: "id",
  session_alternatives: "source_version_id",
  session_assets: "session_version_id",
  session_publication_events: "id",
  session_publications: "session_id",
  session_review_events: "id",
  session_suitability_rules: "id",
  session_version_availability: "session_version_id",
  topic_localizations: "topic_id",
  topics: "id",
};

function stagingConfiguration() {
  const rawUrl = process.env.VITE_SUPABASE_URL?.trim();
  const publishableKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim();

  if (!rawUrl || !publishableKey) {
    throw new Error("Set the staging URL and publishable key in .env.local or the environment.");
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

  return { publishableKey };
}

async function request(table, { method, query, body, publishableKey }) {
  const url = new URL(`${STAGING_ORIGIN}/rest/v1/${table}`);
  if (query) url.search = query;

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

  return { status: response.status, code: payload?.code, payload };
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
  const { publishableKey } = stagingConfiguration();

  for (const table of noClientReadTables) {
    const keyColumn = harmlessFilterColumns[table];
    const read = await request(table, {
      method: "GET",
      query: new URLSearchParams({ select: keyColumn, [keyColumn]: `eq.${randomUUID()}` }).toString(),
      publishableKey,
    });
    assertPermissionDenied(`anon SELECT ${table}`, read);

    const insert = await request(table, {
      method: "POST",
      body: [],
      publishableKey,
    });
    assertPermissionDenied(`anon INSERT ${table} (empty bulk; no rows)`, insert);
  }

  for (const table of selectOnlyTables) {
    const keyColumn = harmlessFilterColumns[table];
    const read = await request(table, {
      method: "GET",
      query: new URLSearchParams({ select: keyColumn, [keyColumn]: `eq.${randomUUID()}` }).toString(),
      publishableKey,
    });
    if (read.status !== 200 || !Array.isArray(read.payload) || read.payload.length !== 0) {
      throw new Error(
        `FAIL anon SELECT ${table}: expected HTTP 200 and no match for a random UUID, received HTTP ${read.status}.`,
      );
    }
    console.log(`PASS anon SELECT ${table}: HTTP 200, random UUID has no match`);

    const insert = await request(table, {
      method: "POST",
      body: [],
      publishableKey,
    });
    assertPermissionDenied(`anon INSERT ${table} (empty bulk; no rows)`, insert);
  }

  console.log("PASS staging public ACL scope: 18 client-hidden tables, 10 SELECT-only tables; no rows written or read.");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Public ACL scope test failed.");
  process.exitCode = 1;
});
