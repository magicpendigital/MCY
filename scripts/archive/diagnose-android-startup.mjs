#!/usr/bin/env node
import { execFile, spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// One bounded force-stop/shell-launch experiment on the isolated Android package.
// This is not equivalent to removing a Recent task and tapping the real Launcher icon.
// Never installs/uninstalls, clears data, changes settings, or uses CDP.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const serial = process.argv[2];
// This changes the shell launch Intent, not the calling UID; it is not an icon tap.
const launcherMode = process.argv[3] === "--launcher";
const app = "com.nilaza.motchutyoga.mcydebug";
if (![3, 4].includes(process.argv.length) ||
    (process.argv.length === 4 && !launcherMode) || !/^[A-Za-z0-9_-]+$/.test(serial ?? "")) {
  throw new Error("Usage: node scripts/diagnose-android-startup.mjs <connected-serial> [--launcher]");
}
const sleep = ms => new Promise(resolve => setTimeout(resolve, Math.max(0, ms)));
const hash = bytes => createHash("sha256").update(bytes).digest("hex");
function adb(args, options = {}) {
  return new Promise((resolve, reject) => {
    execFile("adb", ["-s", serial, ...args], {
      encoding: "utf8", timeout: 5000, maxBuffer: 12 * 1024 * 1024,
      windowsHide: true, ...options,
    }, (error, stdout, stderr) => {
      if (error) reject(new Error(`adb ${args[0]} failed: ${error.message}`));
      else resolve({ stdout, stderr });
    });
  });
}
async function textAdb(args) { return (await adb(args)).stdout.trim(); }
const metadata = JSON.parse(readFileSync(path.join(root,
  "android/app/build/outputs/apk/parallel/output-metadata.json"), "utf8"));
if (metadata.applicationId !== app || metadata.variantName !== "parallel") {
  throw new Error("Local metadata does not confirm the isolated parallel app.");
}
if (await textAdb(["get-state"]) !== "device") throw new Error("Device is unavailable.");
const packagePath = (await textAdb(["shell", "pm", "path", app]))
  .match(/^package:(\/data\/app\/[A-Za-z0-9_/.~+=-]+\/base\.apk)$/m)?.[1];
if (!packagePath) throw new Error("The isolated app is not installed, or has unexpected APK paths.");
const expectedHash = hash(readFileSync(path.join(root,
  "android/app/build/outputs/apk/parallel/app-parallel.apk")));
const installedHash = (await textAdb(["shell", "sha256sum", packagePath])).split(/\s+/)[0];
if (installedHash !== expectedHash) throw new Error("Installed and local APK hashes differ; no launch performed.");
const power = await textAdb(["shell", "dumpsys", "power"]);
const policy = await textAdb(["shell", "dumpsys", "window", "policy"]);
if (!power.includes("mWakefulness=Awake") || /^\s*(?:showing|inputRestricted)=true/m.test(policy)) {
  throw new Error("Device must be awake and unlocked; no launch performed.");
}

const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const output = path.join(root, "analyse", "android-startup-traces", stamp);
mkdirSync(output, { recursive: true });
const trace = { app, serial, launchMode: launcherMode ? "main-launcher" : "component",
  apkSha256: expectedHash, output, screenshots: [], errors: [] };
async function packageStopped() {
  const state = await textAdb(["shell", "dumpsys", "package", app]);
  return state.match(/User 0: ceDataInode=[^\n]*\bstopped=(true|false)/)?.[1] ?? "unavailable";
}
trace.initialPackageStopped = await packageStopped();
const previousPid = await textAdb(["shell", "pidof", app]).catch(() => "");
trace.previousPid = previousPid;
let logText = "", logError = "", droppedLogs = false;
const logger = spawn("adb", ["-s", serial, "logcat", "-v", "threadtime", "-T", "1",
  "Capacitor:V", "Capacitor/Console:V", "chromium:W", "AndroidRuntime:E",
  "ActivityManager:I", "ActivityTaskManager:I", "PackageManager:W", "*:S"], { windowsHide: true });
logger.stdout.on("data", data => {
  if (logText.length < 2 * 1024 * 1024) logText += data.toString();
  else droppedLogs = true;
});
logger.stderr.on("data", data => { logError += data.toString(); });
logger.on("error", error => { trace.errors.push(`Logger: ${error.message}`); });
const loggerClosed = new Promise(resolve => logger.once("close", resolve));
let stopTimer, started, captureTasks = [];
const stopLogger = () => { if (logger.exitCode === null && !logger.killed) logger.kill(); };
try {
  await sleep(150);
  if (logger.exitCode !== null || trace.errors.length) throw new Error("Logcat exited before launch.");
  await textAdb(["shell", "am", "force-stop", app]);
  const remainingPid = await textAdb(["shell", "pidof", app]).catch(() => "");
  if (remainingPid) throw new Error("Old app process did not stop; no launch performed.");
  trace.launchHostUtc = new Date().toISOString();
  started = performance.now();
  stopTimer = setTimeout(() => {
    trace.observationMs = Math.round(performance.now() - started);
    stopLogger();
  }, 20_000);
  captureTasks = [1, 5, 10].map(async second => {
    await sleep(second * 1000 - (performance.now() - started));
    const shot = { second, captureStartedMs: Math.round(performance.now() - started) };
    try {
      const remaining = Math.floor(20_000 - (performance.now() - started));
      if (remaining <= 0) throw new Error("Observation deadline reached.");
      const { stdout: bytes } = await adb(["exec-out", "screencap", "-p"], {
        encoding: null, timeout: Math.min(remaining, 5000),
      });
      if (!Buffer.isBuffer(bytes) || bytes.length < 24 ||
          bytes.subarray(0, 8).toString("hex") !== "89504e470d0a1a0a") {
        throw new Error("Device did not return a valid PNG.");
      }
      shot.completedMs = Math.round(performance.now() - started);
      shot.path = path.join(output, `${second}s.png`);
      shot.bytes = bytes.length;
      shot.sha256 = hash(bytes);
      writeFileSync(shot.path, bytes, { flag: "wx" });
    } catch (error) { shot.error = error.message; }
    trace.screenshots.push(shot);
  });
  const launchArgs = ["shell", "am", "start"];
  if (launcherMode) launchArgs.push("-a", "android.intent.action.MAIN", "-c",
    "android.intent.category.LAUNCHER", "-f", "0x10200000");
  launchArgs.push("-n", `${app}/com.nilaza.motchutyoga.MainActivity`);
  trace.launchOutput = await textAdb(launchArgs);
  const pidDeadline = performance.now() + 2000;
  while (performance.now() < pidDeadline) {
    const remainingMs = Math.max(1, Math.floor(pidDeadline - performance.now()));
    const candidate = await adb(["shell", "pidof", app], { timeout: remainingMs })
      .then(result => result.stdout.trim()).catch(() => "");
    if (/^\d+$/.test(candidate)) { trace.pid = candidate; break; }
    await sleep(Math.min(100, Math.max(0, pidDeadline - performance.now())));
  }
  trace.pidFoundMs = Math.round(performance.now() - started);
  if (!trace.pid) trace.errors.push("PID unavailable within the bounded wait.");
  await sleep(20_000 - (performance.now() - started));
} catch (error) { trace.errors.push(error.message); }
finally {
  clearTimeout(stopTimer);
  if (started && trace.observationMs === undefined) {
    trace.observationMs = Math.round(performance.now() - started);
  }
  stopLogger();
  await Promise.race([loggerClosed, sleep(2000)]);
  await Promise.all(captureTasks);
}
trace.finalPid = await textAdb(["shell", "pidof", app]).catch(() => "");
trace.finalPackageStopped = await packageStopped().catch(() => "unavailable");
trace.screenshots.sort((a, b) => a.second - b.second);
const lines = logText.split(/\r?\n/).filter(line => {
  const pid = line.match(/^\d\d-\d\d \d\d:\d\d:\d\d\.\d+\s+(\d+)\s+\d+\s/)?.[1];
  return line.includes(app) || (trace.pid && pid === trace.pid);
}).map(line => line.replace(/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g, "[redacted-jwt]")
  .replace(/sb_secret_[A-Za-z0-9_-]+/g, "[redacted-secret]")
  .replace(/((?:access_token|refresh_token)["'\s:=]+)[^\s,"'}]+/gi, "$1[redacted-token]"));
trace.logLines = lines.length;
trace.logsTruncated = droppedLogs;
trace.logError = logError.trim();
trace.hasBridgeStartup = lines.some(line => line.includes("Starting BridgeActivity"));
trace.hasDocumentLoad = lines.some(line => line.includes("Loading app at https://localhost"));
writeFileSync(path.join(output, "logcat.txt"), lines.join("\n") + "\n", { flag: "wx" });
writeFileSync(path.join(output, "trace.json"), JSON.stringify(trace, null, 2) + "\n", { flag: "wx" });
console.log(JSON.stringify(trace, null, 2));
if (trace.errors.length || trace.screenshots.some(shot => shot.error) || droppedLogs ||
    !trace.hasBridgeStartup || !trace.hasDocumentLoad) process.exitCode = 1;
// A successful helper is evidence of trace capture, not a UI PASS.
