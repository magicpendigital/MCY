import { expect, test, type Page } from '@playwright/test';
import { writeFile } from 'node:fs/promises';
import '../../../.vercel/ux-step5-3-20261018-v1/tests/teacher-workspace.spec';

const selected = new Map([
  ['teacher workspace denies a verified account without an invite and fits a narrow mobile viewport', 'legacy-teacher-denied'],
  ['a late draft read cannot replace the workspace after the signed-in account changes', 'legacy-teacher-switch'],
]);
const evidence = new WeakMap<Page, { caseId: string; validCalls: number; invalidCalls: number }>();
test.beforeEach(async ({ page }, testInfo) => {
  const caseId = selected.get(testInfo.title);
  if (!caseId) return;
  const counts = { caseId, validCalls: 0, invalidCalls: 0 };
  evidence.set(page, counts);
  await page.route('https://mcy-playwright.invalid/functions/v1/teacher-collaboration', async route => {
    let valid = false;
    try {
      const body = route.request().postDataJSON();
      valid = route.request().method() === 'POST' && body !== null && typeof body === 'object' && !Array.isArray(body)
        && Object.keys(body).length === 2 && Object.hasOwn(body, 'action') && Object.hasOwn(body, 'payload')
        && body.action === 'workspace' && body.payload !== null && typeof body.payload === 'object'
        && !Array.isArray(body.payload) && Object.keys(body.payload).length === 0;
    } catch { /* Record only validation outcome, never request data. */ }
    if (!valid) { counts.invalidCalls++; await route.abort('blockedbyclient'); return; }
    counts.validCalls++;
    await route.fulfill({ status: 503, contentType: 'application/json',
      headers: { 'Cache-Control': 'no-store' }, body: JSON.stringify({ error: 'collaboration_unavailable' }) });
  });
});
test.afterEach(async ({ page }, testInfo) => {
  const counts = evidence.get(page);
  if (!counts) return;
  const sanitized = { ...counts, consumed: counts.validCalls >= 1, allRequestsMatchedContract: counts.invalidCalls === 0 };
  const artifactPath = testInfo.outputPath('scoped-collaboration-fixture-counts.json');
  await writeFile(artifactPath, `${JSON.stringify(sanitized, null, 2)}\n`);
  await testInfo.attach('scoped-collaboration-fixture-counts', { path: artifactPath, contentType: 'application/json' });
  expect(counts.invalidCalls, 'Only exact POST workspace with empty payload is allowed').toBe(0);
  expect(counts.validCalls, 'Selected legacy case must exercise the scoped fixture').toBeGreaterThanOrEqual(1);
  evidence.delete(page);
});
