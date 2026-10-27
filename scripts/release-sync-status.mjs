#!/usr/bin/env node
// Read-only release synchronisation report. Prints what a release would be built from and what the ledger says
// about each platform. It changes nothing, calls no cloud API and is not an enforcement gate.
//   node scripts/release-sync-status.mjs
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const git = (...args) => { try { return execFileSync("git", args, { cwd: repo, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim(); } catch { return ""; } };

const branch = git("rev-parse", "--abbrev-ref", "HEAD");
const head = git("rev-parse", "--short", "HEAD");
const headFull = git("rev-parse", "HEAD");
const upstream = git("rev-parse", "--abbrev-ref", "--symbolic-full-name", "@{u}");
const [ahead = "?", behind = "?"] = upstream ? git("rev-list", "--left-right", "--count", `HEAD...${upstream}`).split(/\s+/) : [];
const dirtyTracked = git("status", "--porcelain", "--untracked-files=no").split("\n").filter(Boolean);
const untracked = git("status", "--porcelain").split("\n").filter(line => line.startsWith("??")).length;

const ledgerPath = path.join(repo, "docs", "release", "RELEASE_LEDGER.md");
const rows = readFileSync(ledgerPath, "utf8").split("\n").filter(line => /^\|\s*\d+\s*\|/.test(line)).map(line => line.split("|").slice(1, -1).map(cell => cell.trim()));
const last = rows.at(-1);
const maxCode = Math.max(0, ...rows.map(row => Number(row[0])));
const gradle = readFileSync(path.join(repo, "android", "app", "build.gradle"), "utf8");

const lines = [];
lines.push(`Branch ${branch} @ ${head}`);
lines.push(upstream ? `Remote ${upstream}: ahead ${ahead}, behind ${behind}${ahead === "0" && behind === "0" ? " (in sync)" : ""}` : "Remote: no upstream configured");
lines.push(`Uncommitted tracked changes: ${dirtyTracked.length}; untracked paths: ${untracked} (none of these ever ship: Android builds use a clean export of HEAD)`);
lines.push(last ? `Last ledger release: versionCode ${last[0]} / ${last[1]} from commit ${last[3]} (${last[2]})` : "Ledger has no releases");
lines.push(`Next versionCode must be greater than ${maxCode}: suggest ${maxCode + 1}`);
lines.push(`Gradle default versionCode: ${/Integer\.parseInt\(System\.getenv\("MCY_VERSION_CODE"\) \?: "(\d+)"\)/.exec(gradle)?.[1] ?? "unknown"} (builds must pass MCY_VERSION_CODE explicitly)`);
const behindLedger = last && git("merge-base", "--is-ancestor", last[3], "HEAD") === "" && git("cat-file", "-t", last[3]) === "commit";
lines.push(last ? (behindLedger ? `HEAD contains the last released commit ${last[3]}` : `WARNING: last released commit ${last[3]} is not an ancestor of HEAD (rewritten history or other branch)`) : "");
if (ahead !== "0" && upstream) lines.push(`NOTE: ${ahead} local commit(s) are not on the remote: the web site will not update until they are pushed.`);
if (head && last && last[3] && !headFull.startsWith(last[3])) lines.push("NOTE: HEAD is newer than the last released commit: a release would ship the difference.");
console.log(lines.filter(Boolean).join("\n"));
