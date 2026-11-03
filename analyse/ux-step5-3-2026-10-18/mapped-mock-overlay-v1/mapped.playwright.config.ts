import { defineConfig } from '@playwright/test';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import base from '../../../.vercel/ux-step5-3-20261018-v1/unit-review.playwright.config';

const overlayRoot = dirname(fileURLToPath(import.meta.url));
const candidateRoot = resolve(overlayRoot, '../../../.vercel/ux-step5-3-20261018-v1');
const mapped = base.projects?.find(project => project.name === 'preserved-regressions');
if (!mapped) throw new Error('Reviewed mapped project required');
export default defineConfig({
  ...base,
  testDir: resolve(candidateRoot, 'tests'),
  globalSetup: resolve(candidateRoot, 'scripts/unit-review-global-setup.mjs'),
  outputDir: resolve(candidateRoot, 'test-results/unit-review-5-3'),
  projects: [
    { ...mapped, name: 'preserved-regressions', testMatch: [
      '**/content-review.spec.ts', '**/teacher-collaboration.spec.ts',
      '**/unit-review-catalog-contract.spec.ts', '**/learner-ux.spec.ts',
    ] },
    { ...mapped, name: 'teacher-workspace-overlay', testDir: overlayRoot, testMatch: 'teacher-workspace-overlay.spec.ts' },
  ],
});
