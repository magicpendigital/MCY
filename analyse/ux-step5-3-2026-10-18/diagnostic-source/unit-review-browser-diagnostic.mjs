import { chromium } from 'playwright';
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createLocalReviewServer } from '../../../.vercel/ux-step5-3-20261018-v1/server/contentReview/localReviewServer.mjs';
import { classifyReviewDiagnosticTarget, startReviewEgressGuard } from './unit-review-egress-guard.mjs';

// Source-reviewed diagnostic only. No bootstrap, capability, canonical input or raw request export.
const candidateRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../../../.vercel/ux-step5-3-20261018-v1');
const repoRoot = resolve(candidateRoot, '../..');
if (process.env.PLAYWRIGHT_BROWSERS_PATH !== resolve(repoRoot, '.vercel/ux-step5-3-browser-tools') ||
    process.env.MCY_PLAYWRIGHT_CHANNEL !== 'chromium') throw new Error('Reviewed fixed-cache Chromium runner required.');
const outputRoot = resolve(repoRoot, 'analyse/ux-step5-3-2026-10-18/diagnostic-results');
await mkdir(outputRoot, { recursive: true });
const runId = `${Date.now()}-${process.pid}`;
const phases = ['A_aboutblank', 'B_neutral_local_html', 'C_closed_unit_review'];
let phase = 'browser_startup';
const connectCounts = Object.fromEntries(['browser_startup', ...phases, 'browser_cleanup'].map(name => [name, {}]));
const pageRequestCounts = Object.fromEntries(phases.map(name => [name, {}]));
const diagnosticConnect = item => {
  const key = item.category === 'unknown' ? `unknown_sha256:${item.unknownHostSha256}` : item.category;
  const bucket = connectCounts[phase];
  const boundedKey = key in bucket || Object.keys(bucket).length < 64 ? key : 'overflow_categories';
  bucket[boundedKey] = (bucket[boundedKey] ?? 0) + 1;
};
let running, guard, browser, context, proxyReceipt;
let executionError = false;
let cleanupError = false;
const observedPhases = [];
try {
  const assetRoot = resolve(candidateRoot, 'dist/client/assets');
  let fixtureUrl = false, fixtureKey = false;
  for (const name of (await readdir(assetRoot)).filter(name => name.endsWith('.js'))) {
    const source = await readFile(resolve(assetRoot, name), 'utf8');
    fixtureUrl ||= source.includes('https://mcy-playwright.invalid');
    fixtureKey ||= source.includes('sb_publishable_mcy_playwright_fixture');
  }
  if (!fixtureUrl || !fixtureKey) throw new Error('Isolated fixture artifact required.');
  running = await createLocalReviewServer({ mode: 'fictional_rehearsal', candidateRoot, repoRoot,
    privateRoot: resolve(repoRoot, '.vercel/ux-step5-3-ui-diagnostic-private'), port: 4253 });
  guard = await startReviewEgressGuard({ port: 4255, allowedOrigin: 'http://127.0.0.1:4253',
    receiptPath: resolve(outputRoot, `${runId}-egress.json`), diagnosticConnect });
  browser = await chromium.launch({ channel: 'chromium', headless: true,
    proxy: { server: 'http://127.0.0.1:4255', bypass: '<-loopback>' } });
  context = await browser.newContext({ serviceWorkers: 'block' });
  for (const name of phases) {
    phase = name;
    const page = await context.newPage();
    page.on('request', request => {
      const category = classifyReviewDiagnosticTarget(request.url()).category;
      const key = `${category}:${request.resourceType()}`;
      const bucket = pageRequestCounts[name];
      bucket[key] = (bucket[key] ?? 0) + 1;
    });
    if (name === 'B_neutral_local_html') {
      // Exact local request fulfilled with inert neutral HTML, no additional server route.
      await page.route('http://127.0.0.1:4253/__mcy_diagnostic_neutral', route => route.fulfill({
        status: 200, contentType: 'text/html', body: '<!doctype html><html lang="vi"><title>Neutral fixture</title><p>Neutral local HTML fixture.</p></html>' }));
    }
    if (name === 'C_closed_unit_review') {
      await page.route('**/__mcy_review/v1/**', route => route.fulfill({ status: 503,
        contentType: 'application/json', body: '{"error":{"code":"REVIEW_UNAVAILABLE","message":"Unavailable"}}' }));
    }
    const startedAt = new Date().toISOString();
    const target = name === 'A_aboutblank' ? 'about:blank' : name === 'B_neutral_local_html'
      ? 'http://127.0.0.1:4253/__mcy_diagnostic_neutral' : 'http://127.0.0.1:4253/?workspace=unit-review&mode=web';
    await page.goto(target, { waitUntil: 'domcontentloaded', timeout: 10_000 });
    if (name === 'C_closed_unit_review') {
      await page.getByRole('alert').filter({ hasText: 'Dịch vụ xem nội bộ chưa sẵn sàng' }).waitFor({ timeout: 10_000 });
      if (await page.getByLabel('Danh sách bản được cấp').count() || await page.getByRole('textbox').count())
        throw new Error('Closed diagnostic state required.');
    }
    await new Promise(resolveWait => setTimeout(resolveWait, 4000));
    await page.close();
    observedPhases.push({ name, startedAt, endedAt: new Date().toISOString(), observationMs: 4000 });
  }
} catch { executionError = true; }
finally {
  phase = 'browser_cleanup';
  try { await context?.close(); } catch { cleanupError = true; }
  try { await browser?.close(); } catch { cleanupError = true; }
  try { if (guard) proxyReceipt = await guard.close(); } catch { cleanupError = true; }
  try { await running?.close(); } catch { cleanupError = true; }
}
const receipt = { scope: 'THREE_PHASE_FICTIONAL_BROWSER_DIAGNOSTIC_NOT_UI_CLEARANCE', runId,
  channel: 'chromium', maxBrowsers: 1, maxPages: 3, observedPhases, connectCounts, pageRequestCounts,
  executionError, cleanupError, proxyStatus: proxyReceipt?.status ?? 'UNKNOWN',
  unexpected: proxyReceipt?.unexpected ?? null, recordedRawHostsPathsQueriesHeadersBodiesOrCapabilities: false,
  phaseAttribution: 'EVENT_TIME_BUCKET_ONLY_NOT_CAUSAL_ATTRIBUTION', clearsHistoricalUiFailure: false,
  status: executionError || cleanupError ? 'FAIL_DIAGNOSTIC_EXECUTION' : proxyReceipt?.unexpected
    ? 'FAIL_UNEXPECTED_EGRESS_OR_CAP' : 'DIAGNOSTIC_NO_UNEXPECTED_EGRESS_NOT_UI_CLEARANCE' };
const receiptPath = resolve(outputRoot, `${runId}.json`);
await writeFile(receiptPath, `${JSON.stringify(receipt, null, 2)}\n`);
process.stdout.write(`${JSON.stringify({ scope: receipt.scope, status: receipt.status, receiptPath })}\n`);
process.exitCode = executionError || cleanupError || !proxyReceipt || proxyReceipt.unexpected ? 1 : 0;
