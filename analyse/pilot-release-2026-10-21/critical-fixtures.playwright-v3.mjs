import { defineConfig } from 'file:///C:/Users/Admin/.codex/worktrees/pilot-web-android-20261021/MCY/node_modules/@playwright/test/index.mjs';
const tree='C:/Users/Admin/.codex/worktrees/pilot-web-android-20261021/MCY';
export default defineConfig({
 testDir:`${tree}/.vercel/critical-fixtures-v2-source/tests`,
 testMatch:['**/ux-save-feedback.spec.ts','**/learner-device-acceptance.spec.ts','**/auth-callback.spec.ts'],
 globalSetup:'D:/Projects/MCY/analyse/pilot-release-2026-10-21/critical-fixtures-setup-v3.mjs',
 outputDir:`${tree}/.vercel/critical-fixtures-v3/results`,
 reporter:[['line'],['json',{outputFile:'D:/Projects/MCY/analyse/pilot-release-2026-10-21/CRITICAL-FIXTURES-v3.report.json'}]],
 workers:1,retries:0,timeout:20000,
 use:{baseURL:'http://127.0.0.1:4294',viewport:{width:1100,height:1100},serviceWorkers:'block',trace:'off',video:'off',screenshot:'off',
  launchOptions:{executablePath:'D:/Projects/MCY/.vercel/ux-step5-3-browser-tools/chromium_headless_shell-1228/chrome-headless-shell-win64/chrome-headless-shell.exe'},
  proxy:{server:'http://127.0.0.1:4295',bypass:'<-loopback>'}},
});
