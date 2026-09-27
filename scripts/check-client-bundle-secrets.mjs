import { readdir, readFile } from "node:fs/promises";
import { extname, join } from "node:path";
import { fileURLToPath } from "node:url";

const bundleRoot = fileURLToPath(new URL("../dist/client/", import.meta.url));
const textExtensions = new Set([".js", ".mjs", ".html", ".json", ".css", ".txt", ".map"]);
const findings = [];
let inspected = 0;

async function scan(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      await scan(path);
      continue;
    }
    if (!entry.isFile() || !textExtensions.has(extname(entry.name))) {
      continue;
    }

    inspected += 1;
    const content = await readFile(path, "utf8");
    if (/sb_secret_[A-Za-z0-9_-]{12,}/.test(content)) {
      findings.push(`${path}: Supabase secret key prefix`);
    }
    if (/\b(?:VITE_)?SUPABASE_SERVICE_ROLE_KEY\b/.test(content)) {
      findings.push(`${path}: service-role variable name`);
    }
    for (const match of content.matchAll(/\beyJ[A-Za-z0-9_-]+\.([A-Za-z0-9_-]+)\.[A-Za-z0-9_-]+\b/g)) {
      try {
        const payload = JSON.parse(Buffer.from(match[1], "base64url").toString("utf8"));
        if (payload.role === "service_role") {
          findings.push(`${path}: JWT with service_role claim`);
        }
      } catch {
        // Not a decodable JWT payload.
      }
    }
  }
}

await scan(bundleRoot);
if (inspected === 0) {
  throw new Error(`No client text files found in ${bundleRoot}; run the build first.`);
}
if (findings.length) {
  console.error(`Client bundle secret check failed:\n${findings.join("\n")}`);
  process.exitCode = 1;
} else {
  console.log(`Client bundle secret check passed (${inspected} text files).`);
}
