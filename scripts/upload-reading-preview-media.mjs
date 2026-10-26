// Uploads the draft reading-unit images to the private `reading-preview` bucket (staging only).
// Dry run by default: reads units, verifies each file's SHA-256 against its unit JSON and lists what would be uploaded.
// `--apply` writes to the cloud and needs the Owner's explicit go-ahead plus SUPABASE_URL and a server key in the
// environment (never read from the repository). Objects are named <sha256>.webp and are never overwritten.
import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const STAGING_URL = "https://mhumbczqrzutdnraafhs.supabase.co";
const BUCKET = "reading-preview";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "content", "yoga-library");
const apply = process.argv.includes("--apply");

const files = new Map(); // sha256 -> { file, bytes, units: Set }
for (const dir of await readdir(path.join(root, "units"))) {
  const revisions = (await readdir(path.join(root, "units", dir))).filter(name => /^r\d+\.json$/.test(name));
  for (const name of revisions) {
    const unit = JSON.parse(await readFile(path.join(root, "units", dir, name), "utf8"));
    for (const media of unit.media ?? []) {
      if (media.status !== "draft_present" || !media.path || !media.sha256) continue;
      const file = path.resolve(root, media.path);
      if (!file.startsWith(root + path.sep)) throw new Error(`media path escapes the library: ${media.path}`);
      const bytes = await readFile(file);
      const actual = createHash("sha256").update(bytes).digest("hex");
      if (actual !== media.sha256) throw new Error(`hash mismatch for ${media.path}`);
      if (media.mime !== "image/webp") throw new Error(`unexpected mime ${media.mime} for ${media.path}`);
      const entry = files.get(actual) ?? { file, bytes, units: new Set() };
      entry.units.add(unit.id);
      files.set(actual, entry);
    }
  }
}
const total = [...files.values()].reduce((sum, entry) => sum + entry.bytes.length, 0);
console.log(`${files.size} unique images, ${(total / 1048576).toFixed(1)} MiB, hashes verified against unit JSON.`);
if (!apply) { console.log("Dry run: nothing was uploaded. Re-run with --apply after the Owner approves the cloud write."); process.exit(0); }

const url = process.env.SUPABASE_URL?.replace(/\/$/, "");
const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY;
if (url !== STAGING_URL) throw new Error("SUPABASE_URL must be the mcy-staging project");
if (!key) throw new Error("A server key is required in the environment");
let uploaded = 0, existing = 0;
for (const [hash, entry] of files) {
  const response = await fetch(`${url}/storage/v1/object/${BUCKET}/${hash}.webp`, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, apikey: key, "Content-Type": "image/webp", "x-upsert": "false", "Cache-Control": "private, max-age=3600" },
    body: entry.bytes,
  });
  if (response.ok) uploaded += 1;
  else if (response.status === 400 || response.status === 409) existing += 1; // already stored under this exact hash
  else throw new Error(`upload failed for ${hash.slice(0, 12)}… with HTTP ${response.status}`);
}
console.log(`Uploaded ${uploaded}, already present ${existing}.`);
