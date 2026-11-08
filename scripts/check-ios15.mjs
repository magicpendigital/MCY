#!/usr/bin/env node
// Release gate for the iOS 15 baseline (docs/quality/KNOWN_INCIDENTS.md, INC-001). Run it before every push, APK or AAB:
//   npm run check:ios15              runtime integrity, production build, then the static compatibility checks on source + bundle
//   npm run check:ios15 -- --no-build   reuse the existing dist (only if it was built from the commit you are about to ship)
// It proves the static part only. Edge/Chromium cannot show iOS 15 behaviour, so the real-device check stays CHƯA CHẠY until
// someone has opened the checklist in .claude/skills/mcy-ios-compat on an iPhone running iOS 15 or an equivalent cloud device.
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const skipBuild = process.argv.includes("--no-build");
const steps = [
  ["Mobile runtime integrity", "npm", ["run", "check:runtime"]],
  ...(skipBuild ? [] : [["Production build", "npm", ["run", "build"]]]),
  ["iOS 15 static checks (source, built JS and CSS)", process.execPath, ["--test", "tests/browser-compat.test.mjs"], { MCY_REQUIRE_DIST: "1" }],
  ["Client bundle secret scan", "npm", ["run", "check:bundle-secrets"]],
];
let failed = null;
for (const [label, command, args, env] of steps) {
  console.log(`\n== ${label}`);
  const result = spawnSync(command, args, { cwd: root, stdio: "inherit", shell: command === "npm", env: { ...process.env, ...(env ?? {}) } });
  if (result.status !== 0) { failed = label; break; }
}
if (failed) {
  console.error(`\ncheck:ios15 FAILED at: ${failed}. Do not push, install or upload. Fix the cause; never loosen the check to get green.`);
  process.exit(1);
}
console.log("\ncheck:ios15 PASSED (static checks only).");
console.log("Real iPhone on iOS 15 or an equivalent device: CHƯA CHẠY unless you ran the mcy-ios-compat checklist. Report it that way in the handoff.");
