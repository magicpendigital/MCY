#!/usr/bin/env node
// One list of check suites, shared by agents, `npm run` and CI (.github/workflows/quality.yml).
// Usage: node scripts/run-suite.mjs <quick|unit|all|list>
// Runs every npm script of the suite in order, keeps going after a failure, prints a PASS/FAIL table
// and exits 1 if any step failed. Add a new offline test to `unit` here, not as a new CI step.
import { spawnSync } from "node:child_process";

export const suites = {
  // Seconds, no build: what an agent runs after every edit.
  quick: ["typecheck", "check:runtime", "check:plan", "test:browser-compat", "test:input-font-size", "test:skills", "test:agents-size"],
  // Offline Node tests and contract checks (no browser, no network writes). CI runs this after check:ios15.
  // check:plan is deliberately not here: a stale PLAN.md must not block a release; CI runs it as a non-blocking step.
  unit: [
    "test:input-font-size",
    "test:skills",
    "test:agents-size",
    "test:dependency-security",
    "test:checkin-migration-contract",
    "test:consent-event-migration-contract",
    "test:ai-gateway",
    "test:owner-control-plane",
    "test:practice-assistant",
    "test:practice-catalog",
    "test:content-review",
    "test:reading-publication",
    "test:content-workspace",
    "test:content-publication",
    "check:video-catalog",
    "test:owner-conflict-migration-contract",
    "test:teacher-control-plane",
    "test:teacher-migration-contract",
    "test:guest-journal",
    "test:chut",
  ],
};
// `npm test`: everything that runs without a build, each step once (test:sites needs dist/, so it runs after check:ios15 in CI and `npm run verify`).
suites.all = [...new Set([...suites.quick, ...suites.unit])];

const name = process.argv[2];
if (name === "list" || !suites[name]) {
  for (const [key, steps] of Object.entries(suites)) console.log(`${key}: ${steps.join(", ")}`);
  process.exit(name === "list" ? 0 : 2);
}

const results = [];
for (const step of suites[name]) {
  const started = Date.now();
  console.log(`\n=== ${name}: npm run ${step}`);
  // Step names are fixed literals above, so one command string through the shell is safe (and works for npm.cmd on Windows).
  const run = spawnSync(`npm run --silent ${step}`, { stdio: "inherit", shell: true });
  results.push({ step, ok: run.status === 0, seconds: ((Date.now() - started) / 1000).toFixed(1) });
}

console.log(`\n${name} suite`);
for (const r of results) console.log(`${r.ok ? "PASS" : "FAIL"}  ${r.seconds.padStart(6)}s  ${r.step}`);
const failed = results.filter((r) => !r.ok);
console.log(failed.length ? `\n${failed.length} step(s) failed.` : "\nAll steps passed.");
process.exit(failed.length ? 1 : 0);
