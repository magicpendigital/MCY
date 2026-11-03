import { defineConfig } from '@playwright/test';
import path from 'node:path';

export const selectedTitles = [
  'BottomNav normal 68 and VI 28 four routes at 320: all text Ranges and focus rings clear footer',
  'BottomNav EN 28 labels wrap inside four equal controls at 320 without horizontal overflow',
  'BottomNav live font and viewport resize updates measured CSS height and content end',
  'BottomNav Profile to edit input and back clears ownership and restores measured clearance',
  'BottomNav iPhone safe area and fitted simulator scale use layout CSS pixels',
  'BottomNav Pixel reserved navigation and fitted simulator scale use layout CSS pixels',
  'Welcome decoded image and actions remain visible at 320 short landscape and desktop',
  'Home actions and uncropped image 360',
  'Home actions and uncropped image desktop',
  'Visual hierarchy and optional map 320',
  'Visual hierarchy and optional map landscape',
  'Profile hierarchy 320 guest',
  'Profile hierarchy landscape guest',
  'Profile hierarchy desktop guest',
  'Profile hierarchy iphone guest',
  'Profile hierarchy pixel guest',
  'Long identity and true 28px text reflow; actual Tab reaches every row clear of footer',
  'Leaving Profile retains Home layout and no Profile styles in later routes',
  'Reflection return does not leak styles into retained course or Home routes',
  'Course manual first/last selection and route return never auto-play or write',
  'account replacement resets selection and comparison before its records arrive',
  'keyboard and its attached footer dismiss on the same transition',
  'switching to Pixel keeps the composer above Android navigation',
];
const escape = text => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const selection = new RegExp('(?:' + selectedTitles.map(escape).join('|') + ')$');
export default defineConfig({
  testDir: import.meta.dirname,
  testMatch: 'responsive-selected-v7.spec.ts',
  grep: selection,
  globalSetup: './responsive-global-setup-v7.mjs',
  timeout: 45000,
  workers: 2,
  reporter: [['list'], ['json', { outputFile: path.join(import.meta.dirname, 'responsive-v7-results.json') }]],
  outputDir: path.join(import.meta.dirname, 'responsive-v7-results'),
  use: { baseURL: 'http://127.0.0.1:4195', viewport: { width: 1100, height: 1100 }, serviceWorkers: 'block', launchOptions: { channel: 'msedge', proxy: { server: 'http://127.0.0.1:9', bypass: '127.0.0.1,localhost' } } },
});
