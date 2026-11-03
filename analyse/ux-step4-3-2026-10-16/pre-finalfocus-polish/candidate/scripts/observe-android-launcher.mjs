#!/usr/bin/env node
import { execFile, spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Observe up to three externally initiated new-process starts.
// Review the log caller and images to verify actual Launcher starts and UI results.
// No input, start, stop, installation, settings, data changes, or CDP commands.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const app = "com.nilaza.motchutyoga.mcydebug";
const serial = process.argv[2];
if (process.argv.length !== 3 || !/^[A-Za-z0-9_-]+$/.test(serial ?? "")) {
  throw new Error("Usage: node scripts/observe-android-launcher.mjs <connected-serial>");
}
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const hash = bytes => createHash("sha256").update(bytes).digest("hex");
const adb = (args, options = {}) => new Promise((resolve, reject) => {
  execFile("adb", ["-s", serial, ...args], {
    encoding: "utf8", timeout: 4000, maxBuffer: 12 * 1024 * 1024,
    windowsHide: true, ...options,
  }, (error, stdout) => error ? reject(error) : resolve(stdout));
});
const textAdb = async args => (await adb(args)).trim();
const clean = value => value.replace(/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g, "[redacted-jwt]")
  .replace(/sb_secret_[A-Za-z0-9_-]+/g, "[redacted-secret]")
  .replace(/((?:access_token|refresh_token)["'\s:=]+)[^\s,"'}]+/gi, "$1[redacted-token]");
if (await textAdb(["get-state"]) !== "device") throw new Error("Device unavailable.");
const apkPath = (await textAdb(["shell", "pm", "path", app]))
  .match(/^package:(\/data\/app\/[A-Za-z0-9_/.~+=-]+\/base\.apk)$/m)?.[1];
if (!apkPath) throw new Error("Isolated package unavailable.");
const apkSha256 = hash(readFileSync(path.join(root, "android/app/build/outputs/apk/parallel/app-parallel.apk")));
if (!(await textAdb(["shell", "sha256sum", apkPath])).startsWith(`${apkSha256} `)) {
  throw new Error("Installed APK does not match local APK.");
}
const output = path.join(root, "analyse/android-startup-traces",
  `${new Date().toISOString().replace(/[:.]/g, "-")}-launcher-regression`);
mkdirSync(output, { recursive: true });
const trace = { app, serial, apkSha256, startedHostUtc: new Date().toISOString(),
  method: "Observe new-process starts; verify Launcher caller and screenshots manually. No automatic UI PASS.",
  initialPid: await textAdb(["shell", "pidof", app]).catch(() => ""), cycles: [], errors: [] };
const pids = new Set(trace.initialPid ? [trace.initialPid] : []);
let rawLog = "", truncated = false;
const logger = spawn("adb", ["-s", serial, "logcat", "-v", "threadtime", "-T", "1",
  "Capacitor:V", "Capacitor/Console:V", "chromium:W", "AndroidRuntime:E",
  "ActivityManager:I", "ActivityTaskManager:I", "PackageManager:W", "*:S"], { windowsHide: true });
logger.stdout.on("data", bytes => {
  if (rawLog.length < 4 * 1024 * 1024) rawLog += bytes.toString();
  else truncated = true;
});
logger.stderr.on("data", bytes => trace.errors.push(`Logger: ${bytes.toString().trim()}`));
logger.on("error", error => trace.errors.push(`Logger: ${error.message}`));
const loggerClosed = new Promise(resolve => logger.once("close", resolve));
const deadline = performance.now() + 180_000;
console.log(JSON.stringify({ event: "ready", output, initialPid: trace.initialPid, deadlineSeconds: 180 }));
try {
  while (performance.now() < deadline && trace.cycles.length < 3) {
    if (trace.errors.length) throw new Error("Logger failed; startup trace would be incomplete.");
    if (logger.exitCode !== null) throw new Error("Logger ended before observation finished.");
    const pid = await textAdb(["shell", "pidof", app]).catch(() => "");
    if (!/^\d+$/.test(pid) || pids.has(pid)) { await sleep(500); continue; }
    pids.add(pid);
    const cycle = { number: trace.cycles.length + 1, pid,
      detectedHostUtc: new Date().toISOString(), screenshots: [], errors: [] };
    trace.cycles.push(cycle);
    const detected = performance.now();
    console.log(JSON.stringify({ event: "new-process", ...cycle }));
    for (const second of [1, 5, 10]) {
      await sleep(Math.max(0, second * 1000 - (performance.now() - detected)));
      try {
        if (await textAdb(["shell", "pidof", app]) !== pid) throw new Error("Process changed during observation.");
        const activities = await textAdb(["shell", "dumpsys", "activity", "activities"]);
        const top = activities.split(/\r?\n/).find(line => line.includes("topResumedActivity="));
        if (!top?.includes(`${app}/`)) throw new Error("App is not the top resumed Activity.");
        const bytes = await adb(["exec-out", "screencap", "-p"], { encoding: null });
        if (!Buffer.isBuffer(bytes) || bytes.subarray(0, 8).toString("hex") !== "89504e470d0a1a0a") {
          throw new Error("Invalid screenshot PNG.");
        }
        const name = `${cycle.number}-${second}s.png`;
        writeFileSync(path.join(output, name), bytes, { flag: "wx" });
        cycle.screenshots.push({ second, name, sha256: hash(bytes),
          completedAfterDetectionMs: Math.round(performance.now() - detected), top: top.trim() });
      } catch (error) { cycle.errors.push(`${second}s: ${error.message}`); }
    }
    const state = await textAdb(["shell", "dumpsys", "package", app]);
    cycle.packageStopped = state.match(/User 0: ceDataInode=[^\n]*\bstopped=(true|false)/)?.[1] ?? "unknown";
    cycle.finalPid = await textAdb(["shell", "pidof", app]).catch(() => "");
    writeFileSync(path.join(output, `${cycle.number}-services.txt`),
      clean(await textAdb(["shell", "dumpsys", "activity", "services", app])), { flag: "wx" });
    console.log(JSON.stringify({ event: "cycle-recorded", ...cycle }));
  }
  if (trace.cycles.length !== 3) trace.errors.push("Fewer than three new-process starts observed within 180 seconds.");
} catch (error) { trace.errors.push(error.message); }
finally {
  logger.kill();
  await Promise.race([loggerClosed, sleep(2000)]);
  trace.endedHostUtc = new Date().toISOString();
  trace.logsTruncated = truncated;
  const lines = rawLog.split(/\r?\n/).filter(line => line.includes(app) ||
    pids.has(line.match(/^\d\d-\d\d \d\d:\d\d:\d\d\.\d+\s+(\d+)\s+\d+\s/)?.[1]));
  writeFileSync(path.join(output, "logcat.txt"), clean(lines.join("\n")) + "\n", { flag: "wx" });
  writeFileSync(path.join(output, "trace.json"), JSON.stringify(trace, null, 2) + "\n", { flag: "wx" });
  console.log(JSON.stringify({ event: "finished", output, cycles: trace.cycles.length, errors: trace.errors }));
}
if (truncated || trace.errors.length || trace.cycles.some(cycle => cycle.errors.length)) process.exitCode = 1;
