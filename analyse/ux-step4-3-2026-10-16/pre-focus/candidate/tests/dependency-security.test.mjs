import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, parse } from "node:path";
import test from "node:test";

const requireFromProject = createRequire(import.meta.url);
const requireFromXcode = createRequire(requireFromProject.resolve("xcode"));

function findPackageManifest(entryPath, expectedName) {
  let directory = dirname(entryPath);

  while (true) {
    try {
      const manifestPath = `${directory}/package.json`;
      const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
      if (manifest.name === expectedName) return manifest;
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }

    const parent = dirname(directory);
    if (parent === directory || directory === parse(directory).root) break;
    directory = parent;
  }

  assert.fail(`Could not locate package.json for ${expectedName} from ${entryPath}`);
}

test("Capacitor's xcode dependency resolves the patched CommonJS uuid API", () => {
  const projectManifest = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));
  assert.equal(projectManifest.overrides?.xcode?.uuid, "11.1.1");

  const uuidEntry = requireFromXcode.resolve("uuid");
  const uuidManifest = findPackageManifest(uuidEntry, "uuid");
  assert.equal(uuidManifest.version, "11.1.1");

  const uuid = requireFromXcode("uuid");
  assert.equal(typeof uuid.v4, "function");
  assert.match(uuid.v4(), /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
});
