#!/usr/bin/env node
// Release gate: the public legal pages must not ship with unfilled Owner details.
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dir = path.join(path.resolve(path.dirname(fileURLToPath(import.meta.url)), ".."), "public");
const pages = ["privacy.html", "terms.html", "delete-account.html"];
const found = [];
for (const page of pages) {
  const text = readFileSync(path.join(dir, page), "utf8");
  for (const match of text.matchAll(/\[\[[^\]]+\]\]/g)) found.push(`${page}: ${match[0]}`);
}
if (found.length) {
  const unique = [...new Set(found)];
  console.error(`Public legal pages still contain Owner placeholders:\n${unique.map(item => `  - ${item}`).join("\n")}\nReplace them in public/*.html before a release build.`);
  process.exit(1);
}
console.log(`Legal pages ready: ${pages.join(", ")}`);
