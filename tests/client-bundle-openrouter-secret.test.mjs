import assert from "node:assert/strict";
import test from "node:test";
import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { tmpdir } from "node:os";
import { basename, join, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const execute = promisify(execFile);
const scanner = fileURLToPath(new URL("../scripts/check-client-bundle-secrets.mjs", import.meta.url));

test("client scanner rejects OpenRouter secrets without printing their values", async () => {
  const temporary = await mkdtemp(join(tmpdir(), "mcy-openrouter-scan-"));
  try {
    for (const content of [
      'const key="sk-or-v1-fictional_canary_never_real_12345";',
      'const name="OPENROUTER_API_KEY";',
      'const name="VITE_OPENROUTER_API_KEY";',
    ]) {
      await writeFile(join(temporary, "fixture.js"), content);
      await assert.rejects(execute(process.execPath, [scanner, temporary]), error => {
        assert.equal(error.code, 1);
        assert.equal(error.stderr.includes("OpenRouter server secret"), true);
        assert.equal(error.stderr.includes("fictional_canary"), false);
        return true;
      });
    }
    await writeFile(join(temporary, "fixture.js"), 'const provider="openrouter";');
    const result = await execute(process.execPath, [scanner, temporary]);
    assert.match(result.stdout, /secret check passed/);
  } finally {
    assert.ok(resolve(temporary).startsWith(resolve(tmpdir()) + sep));
    assert.ok(basename(temporary).startsWith("mcy-openrouter-scan-"));
    await rm(temporary, { recursive: true, force: true });
  }
});
