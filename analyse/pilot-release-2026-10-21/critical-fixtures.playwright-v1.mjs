import { defineConfig } from 'file:///C:/Users/Admin/.codex/worktrees/pilot-web-android-20261021/MCY/node_modules/@playwright/test/index.mjs';
const tree = 'C:/Users/Admin/.codex/worktrees/pilot-web-android-20261021/MCY';
export default defineConfig({
  testDir: `${tree}/tests`,
  testMatch: ['**/ux-save-feedback.spec.ts', '**/learner-device-acceptance.spec.ts', '**/auth-callback.spec.ts'],
  globalSetup: 'D:/Projects/MCY/analyse/pilot-release-2026-10-21/critical-fixtures-setup-v1.mjs',
  outputDir: `${tree}/.vercel/critical-fixtures-v1/results`,
  reporter: [['line'], ['json', { outputFile: 'D:/Projects/MCY/analyse/pilot-release-2026-10-21/CRITICAL-FIXTURES-v1.report.json' }]],
  workers: 1, retries: 0, timeout: 20000,
  use: { baseURL: 'http://127.0.0.1:4290', viewport: { width: 1100, height: 1100 },
    channel: 'msedge', serviceWorkers: 'block', trace: 'off', video: 'off', screenshot: 'off',
    proxy: { server: 'http://127.0.0.1:4291', bypass: '<-loopback>' } },
});
