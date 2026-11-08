import { defineConfig } from "@playwright/test";

const testPort = Number(process.env.MOBILE_RUNTIME_TEST_PORT ?? 4177);
if (!Number.isInteger(testPort) || testPort < 1 || testPort > 65535) {
  throw new Error("MOBILE_RUNTIME_TEST_PORT must be a valid TCP port.");
}

export default defineConfig({
  testDir: "./tests",
  testMatch: "**/*.spec.ts",
  timeout: 20_000,
  // Shared CI runners are slower than a developer machine: the first CI run (2026-11-08) failed 2 of 198 specs on a 20 s timeout that pass locally.
  // One retry keeps the gate meaningful; a spec that only passes on retry is reported as flaky, not hidden.
  retries: process.env.CI ? 1 : 0,
  globalSetup: "./scripts/playwright-global-setup.mjs",
  use: {
    baseURL: `http://127.0.0.1:${testPort}`,
    viewport: { width: 1100, height: 1100 },
    ...(process.env.MCY_PLAYWRIGHT_CHANNEL ? { launchOptions: { channel: process.env.MCY_PLAYWRIGHT_CHANNEL } } : {}),
  },
});
