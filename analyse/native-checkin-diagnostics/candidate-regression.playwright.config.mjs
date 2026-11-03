import {defineConfig} from '@playwright/test';
import candidate from './candidate.playwright.config.mjs';
export default defineConfig({
  ...candidate,testDir:'../../tests',
  testMatch:['**/learner-write-review.spec.ts','**/learner-device-acceptance.spec.ts'],
  outputDir:'../../.vercel/native-checkin-candidate-regressions',
});
