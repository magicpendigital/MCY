import { defineConfig } from '@playwright/test';
const port = Number(process.env.MOBILE_RUNTIME_TEST_PORT ?? 4177);
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Invalid fixture port');
export default defineConfig({
  projects: [
    { name: 'runtime', testDir: '../../tests', testMatch: '**/*.spec.ts', use: { viewport: { width: 1100, height: 1100 } } },
    { name: 'late-save', testDir: '.', testMatch: 'late-save.spec.ts', use: { viewport: { width: 390, height: 844 } } },
  ],
  workers: 1, timeout: 20000,
  globalSetup: '../../scripts/playwright-global-setup.mjs',
  reporter: [['list'], ['json', { outputFile: '.vercel/native-integrated-20261014-results.json' }]], outputDir: '../../.vercel/native-integrated-20261014-results',
  use: { baseURL: `http://127.0.0.1:${port}`, viewport: { width: 390, height: 844 },
    ...(process.env.MCY_PLAYWRIGHT_CHANNEL ? { launchOptions: { channel: process.env.MCY_PLAYWRIGHT_CHANNEL } } : {}) },
});
