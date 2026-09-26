#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const apk = path.join(root, "android", "app", "build", "outputs", "apk", "debug", "app-debug.apk");
const gradle = readFileSync(path.join(root, "android", "app", "build.gradle"), "utf8");
const packageName = gradle.match(/applicationId\s+["']([^"']+)["']/)?.[1];
const remoteApk = "/data/local/tmp/mcy-debug.apk";

function runAdb(args, allowFailure = false) {
  const result = spawnSync("adb", args, { encoding: "utf8", timeout: 120_000 });
  if (result.error) throw result.error;
  if (!allowFailure && result.status !== 0) {
    throw new Error(`adb ${args.join(" ")} failed: ${(result.stderr || result.stdout).trim()}`);
  }
  return result;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function inspectPage(debuggerUrl) {
  const socket = new WebSocket(debuggerUrl);
  try {
    return await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error("WebView inspection timed out")), 5000);
      socket.addEventListener("open", () => {
        socket.send(JSON.stringify({
          id: 1,
          method: "Runtime.evaluate",
          params: {
            expression: "({url:location.href,ready:document.readyState,rootText:document.querySelector('#root')?.innerText?.trim()||'',rootChildren:document.querySelector('#root')?.children.length||0})",
            returnByValue: true,
          },
        }));
      });
      socket.addEventListener("message", event => {
        const message = JSON.parse(event.data);
        if (message.id !== 1) return;
        clearTimeout(timer);
        if (message.error || message.result?.exceptionDetails) {
          reject(new Error(JSON.stringify(message.error || message.result.exceptionDetails)));
        } else {
          resolve(message.result?.result?.value);
        }
      });
      socket.addEventListener("error", () => {
        clearTimeout(timer);
        reject(new Error("Could not connect to Android WebView debugger"));
      });
    });
  } finally {
    socket.close();
  }
}

async function verifyWebView(deviceArgs) {
  let lastError = "WebView renderer not ready";
  const deadline = Date.now() + 20_000;
  while (Date.now() < deadline) {
    const pidResult = runAdb([...deviceArgs, "shell", "pidof", packageName], true);
    const pid = pidResult.stdout.trim().split(/\s+/)[0];
    if (pid) {
      const forward = runAdb([...deviceArgs, "forward", "tcp:0", `localabstract:webview_devtools_remote_${pid}`], true);
      const port = Number(forward.stdout.trim());
      if (forward.status === 0 && port > 0) {
        try {
          const response = await fetch(`http://127.0.0.1:${port}/json`, { signal: AbortSignal.timeout(3000) });
          const pages = await response.json();
          const page = pages.find(item => item.type === "page" && item.url?.startsWith("https://localhost/"));
          if (page?.webSocketDebuggerUrl) {
            const state = await inspectPage(page.webSocketDebuggerUrl);
            if (state?.rootChildren > 0 && state.rootText.length > 30) {
              return state;
            }
            lastError = `WebView loaded but app root is empty: ${JSON.stringify(state)}`;
          } else {
            lastError = "WebView debugger has no Capacitor app page";
          }
        } catch (error) {
          lastError = error.message;
        } finally {
          runAdb([...deviceArgs, "forward", "--remove", `tcp:${port}`], true);
        }
      } else {
        lastError = "Android did not start the WebView renderer";
      }
    }
    await sleep(1000);
  }
  const diagnosticLog = runAdb([...deviceArgs, "logcat", "-d", "-t", "800", "-v", "brief"], true).stdout
    .split(/\r?\n/)
    .filter(line => /process is bad|ChildProcessConn|AndroidRuntime|Capacitor\/Console/.test(line))
    .slice(-12)
    .join("\n");
  throw new Error(`Installed app did not render: ${lastError}${diagnosticLog ? `\nRecent Android diagnostics:\n${diagnosticLog}` : ""}`);
}

if (!packageName) throw new Error("Cannot find Android applicationId in android/app/build.gradle.");
if (!existsSync(apk)) throw new Error(`Debug APK is missing: ${apk}`);

const devices = runAdb(["devices"]).stdout
  .split(/\r?\n/)
  .map(line => line.match(/^(\S+)\s+device$/)?.[1])
  .filter(Boolean);
const requestedSerial = process.argv[2];
const serial = requestedSerial || (devices.length === 1 ? devices[0] : null);

if (!serial || !devices.includes(serial)) {
  throw new Error(`Select one connected Android device: npm run android:install:debug -- <serial>. Connected: ${devices.join(", ") || "none"}`);
}

const deviceArgs = ["-s", serial];
// A package replacement stops the old app. The failing debug runs also used an
// extra force-stop and streamed install; use the repeatably verified path here.
runAdb([...deviceArgs, "push", apk, remoteApk]);
try {
  const install = runAdb([...deviceArgs, "shell", "pm", "install", "-r", remoteApk]);
  if (!install.stdout.includes("Success")) throw new Error(`Android rejected the APK: ${install.stdout}`);
  process.stdout.write(install.stdout);
} finally {
  runAdb([...deviceArgs, "shell", "rm", remoteApk], true);
}

const launch = runAdb([...deviceArgs, "shell", "am", "start", "-n", `${packageName}/.MainActivity`]);
process.stdout.write(launch.stdout);
const state = await verifyWebView(deviceArgs);
console.log(`Verified ${packageName} on ${serial}: ${state.url}, ${state.rootText.length} rendered characters.`);
