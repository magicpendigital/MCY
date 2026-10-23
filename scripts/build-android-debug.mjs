#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, realpathSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const variant = process.argv[2] ?? "debug";
const nativeSchemes = {
  debug: "motchutyoga-debug",
  parallel: "motchutyoga-mcydebug",
  release: "motchutyoga",
};
if (!(variant in nativeSchemes)) throw new Error("Choose the debug, parallel or release Android build variant.");
const env = {
  ...process.env,
  VITE_NATIVE_AUTH_SCHEME: nativeSchemes[variant],
};
const windows = process.platform === "win32";
const npmCli = process.env.npm_execpath;
const javaExecutable = windows ? "java.exe" : "java";
const javacExecutable = windows ? "javac.exe" : "javac";

if (!npmCli) throw new Error("Run this build through `npm run android:debug:build`.");

function javaMajorVersion(executable) {
  if (!existsSync(executable)) return null;
  const result = spawnSync(executable, ["-version"], { encoding: "utf8" });
  if (result.error || result.status !== 0) return null;
  const output = `${result.stdout ?? ""}\n${result.stderr ?? ""}`;
  const match = output.match(/\b(?:javac|version)\s+["']?(\d+)/i);
  return match ? Number(match[1]) : null;
}

function compatibleJdk(home) {
  if (!home) return null;
  const normalizedHome = path.resolve(home.replace(/^"|"$/g, ""));
  const java = path.join(normalizedHome, "bin", javaExecutable);
  const javac = path.join(normalizedHome, "bin", javacExecutable);
  return javaMajorVersion(java) >= 21 && javaMajorVersion(javac) >= 21 ? normalizedHome : null;
}

function findCompatibleJdkOnPath() {
  for (const entry of (process.env.PATH ?? "").split(path.delimiter)) {
    const directory = entry.trim().replace(/^"|"$/g, "");
    if (!directory) continue;
    const compiler = path.join(directory, javacExecutable);
    if (!existsSync(compiler)) continue;
    try {
      const resolvedCompiler = realpathSync(compiler);
      const home = path.dirname(path.dirname(resolvedCompiler));
      const compatible = compatibleJdk(home);
      if (compatible) return compatible;
    } catch {
      // Skip stale PATH entries and continue to the next installed compiler.
    }
  }
  return null;
}

const configuredJdk = compatibleJdk(process.env.JAVA_HOME);
const selectedJdk = configuredJdk ?? findCompatibleJdkOnPath();
if (!selectedJdk) {
  throw new Error("Android debug builds require JDK 21+. Set JAVA_HOME to a JDK 21 installation.");
}
env.JAVA_HOME = selectedJdk;
if (!configuredJdk) process.stdout.write(`Using JDK 21 from PATH for this Android build: ${selectedJdk}\n`);

function runNode(script, args) {
  const result = spawnSync(process.execPath, [script, ...args], {
    cwd: root,
    env,
    encoding: "utf8",
    stdio: "inherit",
  });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    const error = new Error(`Command failed (${result.status ?? result.signal ?? "unknown status"}): ${script} ${args.join(" ")}`);
    error.exitCode = result.status ?? 1;
    throw error;
  }
}

function runGradle() {
  // Release produces the Play upload bundle (AAB); debug variants produce APKs.
  const task = `${variant === "release" ? "bundle" : "assemble"}${variant[0].toUpperCase()}${variant.slice(1)}`;
  const result = windows
    ? spawnSync(process.env.ComSpec || "cmd.exe", ["/d", "/s", "/c", `android\\gradlew.bat -p android ${task}`], {
        cwd: root,
        env,
        encoding: "utf8",
        stdio: "inherit",
      })
    : spawnSync("./android/gradlew", ["-p", "android", task], {
        cwd: root,
        env,
        encoding: "utf8",
        stdio: "inherit",
      });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    const error = new Error(`Gradle ${task} failed (${result.status ?? result.signal ?? "unknown status"}).`);
    error.exitCode = result.status ?? 1;
    throw error;
  }
}

let temporaryWebDir;
try {
  if (variant === "release") runNode(path.join(root, "scripts", "check-legal-placeholders.mjs"), []);
  if (variant === "parallel") {
    temporaryWebDir = mkdtempSync(path.join(os.tmpdir(), "mcy-android-parallel-"));
    runNode(npmCli, ["run", "check:runtime"]);
    runNode(path.join(root, "node_modules", "typescript", "bin", "tsc"), []);
    runNode(path.join(root, "node_modules", "vite", "bin", "vite.js"), [
      "build",
      "--configLoader",
      "runner",
      "--outDir",
      temporaryWebDir,
    ]);
    runNode(path.join(root, "scripts", "check-client-bundle-secrets.mjs"), [temporaryWebDir]);
    env.MCY_CAPACITOR_WEB_DIR = temporaryWebDir;
  } else {
    runNode(npmCli, ["run", "build"]);
  }

  runNode(path.join(root, "node_modules", "@capacitor", "cli", "bin", "capacitor"), ["sync", "android"]);
  runGradle();
} finally {
  if (temporaryWebDir) {
    const resolvedTempRoot = path.resolve(os.tmpdir());
    const resolvedBuildDir = path.resolve(temporaryWebDir);
    if (
      path.dirname(resolvedBuildDir).toLowerCase() !== resolvedTempRoot.toLowerCase() ||
      !path.basename(resolvedBuildDir).startsWith("mcy-android-parallel-")
    ) {
      throw new Error(`Refusing to remove unexpected temporary build directory: ${resolvedBuildDir}`);
    }
    rmSync(resolvedBuildDir, { recursive: true, force: true });
  }
}
