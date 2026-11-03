// Read-only accepted-4.6 browser capture. Prepare and freeze before invocation.
import { chromium } from '@playwright/test';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const here = import.meta.dirname;
const root = resolve(here, '../..');
const manifestPath = join(root, 'analyse/ux-step4-6-2026-10-18/SOURCE-FREEZE-v1.json');
const expectedFreeze = '01d45905ff401b6e127bac0bbafff03d3c66934e064f0711fcaf10deddb8db45';
const output = join(here, 'baseline-capture-v3');
const origin = 'http://127.0.0.1:4194';
const sha = file => createHash('sha256').update(readFileSync(file)).digest('hex');
function assertPins() {
  if (sha(manifestPath) !== expectedFreeze) throw Error('4.6 source manifest drift');
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  for (const entry of manifest.appInputs) {
    if (sha(join(root, manifest.candidate, entry.path)) !== entry.sha256) throw Error('4.6 candidate drift: ' + entry.path);
  }
  for (const entry of manifest.harnessAndIntake) {
    if (sha(join(root, entry.path)) !== entry.sha256) throw Error('4.6 harness drift: ' + entry.path);
  }
}
const scenarios = [
  { id: 'web-320', width: 320, height: 568, query: '?mode=web', nav: true, large: true },
  { id: 'web-landscape', width: 844, height: 390, query: '?mode=web', nav: false },
  { id: 'web-desktop', width: 1440, height: 900, query: '?mode=web', nav: false },
];
function describePage() {
  const rect = element => {
    if (!element) return null;
    const { x, y, width, height, top, right, bottom, left } = element.getBoundingClientRect();
    return { x, y, width, height, top, right, bottom, left };
  };
  const app = document.querySelector('.mobile-app-viewport');
  const stack = document.querySelector('.flow-stack');
  const footer = document.querySelector('.flow-fixed-footer');
  const nav = document.querySelector('.mcy-bottom-nav');
  const active = [...document.querySelectorAll('[data-testid="flow-current"]')].at(-1);
  const scroll = active?.querySelector('.mobile-scroll');
  const photo = active?.querySelector('.mcy-welcome-photo');
  const welcome = active?.querySelector('.mcy-welcome');
  const heading = active?.querySelector('h1');
  const benefits = active?.querySelector('.mcy-welcome-benefits');
  return {
    viewport: { width: innerWidth, height: innerHeight }, app: rect(app), stack: rect(stack),
    configuredFooterHeight: stack ? getComputedStyle(stack).getPropertyValue('--flow-footer-height').trim() : null,
    keyboardHeight: stack ? getComputedStyle(stack).getPropertyValue('--keyboard-height').trim() : null,
    safeArea: app ? getComputedStyle(app).getPropertyValue('--device-safe-area-bottom').trim() : null,
    footer: rect(footer), nav: rect(nav),
    controls: [...(nav?.querySelectorAll('button') ?? [])].map(button => {
      const label = button.querySelector('span');
      const range = document.createRange();
      if (label) range.selectNodeContents(label);
      const style = getComputedStyle(button);
      return { text: label?.textContent, control: rect(button), label: rect(label),
        ranges: label ? [...range.getClientRects()].map(r => ({ top: r.top, right: r.right, bottom: r.bottom, left: r.left })) : [],
        fontSize: style.fontSize, lineHeight: style.lineHeight };
    }),
    scroll: scroll ? { rect: rect(scroll), top: scroll.scrollTop, height: scroll.scrollHeight,
      clientHeight: scroll.clientHeight, width: scroll.scrollWidth, clientWidth: scroll.clientWidth,
      scrollPaddingBottom: getComputedStyle(scroll).scrollPaddingBottom } : null,
    page: rect(active?.querySelector('.mcy-page')),
    pagePaddingBottom: active?.querySelector('.mcy-page') ? getComputedStyle(active.querySelector('.mcy-page')).paddingBottom : null,
    welcome: rect(welcome), photo: rect(photo), photoObjectPosition: photo ? getComputedStyle(photo).objectPosition : null,
    heading: rect(heading), benefits: rect(benefits),
  };
}
async function settleRoute(page, route) {
  await page.waitForFunction(expected => {
    const currents = document.querySelectorAll('[data-testid="flow-current"]');
    if (currents.length !== 1) return false;
    const screen = currents[0];
    const active = screen.querySelector('[data-flow-route][data-flow-active="true"]');
    if (!active || active.getAttribute('data-flow-route') !== expected || active.hasAttribute('inert')) return false;
    const parent = screen.parentElement;
    return parent && Math.abs(screen.getBoundingClientRect().left - parent.getBoundingClientRect().left) < 0.3;
  }, route);
  await page.evaluate(async () => {
    await document.fonts.ready;
    const photo = document.querySelector('.mcy-welcome-photo');
    if (photo instanceof HTMLImageElement) {
      if (!photo.complete) await photo.decode();
      if (!photo.naturalWidth) throw Error('Welcome photo did not decode');
    }
  });
}

if (existsSync(output)) throw Error('Output exists; never overwrite prior capture');
mkdirSync(output, { recursive: false });
const startedAt = new Date().toISOString();
const records = [];
const violations = [];
let browser;
let failure = null;
let postPinsMatch = false;
try {
  assertPins();
  const response = await fetch(origin + '/?mode=web', { redirect: 'error', signal: AbortSignal.timeout(5000) });
  if (!response.ok) throw Error('Strict 4.6 local preview unavailable: HTTP ' + response.status);
  if (new URL(response.url).origin !== origin) throw Error('Preview health response escaped exact loopback origin');
  const csp = response.headers.get('content-security-policy') ?? '';
  if (!csp.includes("frame-src 'none'") || !csp.includes("media-src 'none'")) throw Error('Unexpected preview CSP');
  browser = await chromium.launch({ channel: 'msedge', timeout: 30000, proxy: { server: 'http://127.0.0.1:9', bypass: '127.0.0.1,localhost' } });
  for (const scenario of scenarios) {
    const context = await browser.newContext({ viewport: { width: scenario.width, height: scenario.height }, serviceWorkers: 'block', reducedMotion: 'reduce' });
    const page = await context.newPage();
    page.setDefaultTimeout(10000);
    await page.route('**/*', route => {
      const u = new URL(route.request().url());
      if (u.origin === origin) return route.continue();
      violations.push({ scenario: scenario.id, origin: u.origin, method: route.request().method() });
      return route.abort();
    });
    try {
      await page.goto(origin + '/' + scenario.query, { waitUntil: 'domcontentloaded' });
      await settleRoute(page, 'welcome');
      await page.locator('.mcy-welcome').waitFor({ state: 'visible' });
      records.push({ scenario: scenario.id, state: 'welcome', geometry: await page.evaluate(describePage) });
      await page.screenshot({ path: join(output, scenario.id + '-welcome.png'), animations: 'disabled' });
      if (scenario.nav) {
        await page.getByRole('button', { name: 'Thử tìm hiểu như khách', exact: true }).click();
        await page.getByRole('button', { name: 'Tự chọn bài học miễn phí', exact: true }).click();
        await settleRoute(page, 'discover');
        await page.locator('.mcy-bottom-nav').waitFor({ state: 'visible' });
        records.push({ scenario: scenario.id, state: 'nav-normal', geometry: await page.evaluate(describePage) });
        await page.screenshot({ path: join(output, scenario.id + '-nav-normal.png'), animations: 'disabled' });
        if (scenario.large) {
          await page.addStyleTag({ content: '.mcy-bottom-nav button{font-size:28px!important;line-height:1.5!important}' });
          await page.evaluate(async () => { await document.fonts.ready; });
          await page.waitForFunction(() => {
            const button = document.querySelector('.mcy-bottom-nav button');
            return button && getComputedStyle(button).fontSize === '28px' && getComputedStyle(button).lineHeight === '42px';
          });
          records.push({ scenario: scenario.id, state: 'nav-28-settled', geometry: await page.evaluate(describePage) });
          await page.screenshot({ path: join(output, scenario.id + '-nav-28.png'), animations: 'disabled' });
        }
      }
    } catch (error) {
      await page.screenshot({ path: join(output, scenario.id + '-failure.png'), animations: 'disabled' }).catch(() => {});
      throw error;
    } finally {
      await context.close();
    }
  }
  // Historical RegionEditor P3: capture only its local focused-field geometry.
  // The guest path never invokes a provider or writes a saved check-in.
  const context = await browser.newContext({ viewport: { width: 320, height: 568 }, serviceWorkers: 'block', reducedMotion: 'reduce' });
  const page = await context.newPage();
  page.setDefaultTimeout(10000);
  await page.route('**/*', route => {
    const u = new URL(route.request().url());
    if (u.origin === origin) return route.continue();
    violations.push({ scenario: 'editor-320', origin: u.origin, method: route.request().method() });
    return route.abort();
  });
  try {
    await page.goto(origin + '/?mode=web', { waitUntil: 'domcontentloaded' });
    await settleRoute(page, 'welcome');
    await page.getByRole('button', { name: 'Thử tìm hiểu như khách', exact: true }).click();
    await settleRoute(page, 'checkin');
    const active = page.getByTestId('flow-current').last();
    await active.locator('.mcy-body-disclosure').click();
    await active.locator('.mcy-body-groups button').nth(1).click();
    await active.locator('.mcy-region-list button').filter({ hasText: 'Khuỷu tay' }).click();
    await page.getByRole('dialog').locator('.mcy-editor-note textarea').waitFor({ state: 'visible' });
    for (let i = 0; i < 45; i++) {
      await page.keyboard.press('Tab');
      if (await page.evaluate(() => document.activeElement?.matches('.mcy-region-editor textarea'))) break;
    }
    if (!(await page.evaluate(() => document.activeElement?.matches('.mcy-region-editor textarea')))) throw Error('Editor textarea not keyboard reachable');
    await page.keyboard.type('Fictional editor note');
    await page.waitForTimeout(750);
    const geometry = await page.evaluate(() => {
      const box = element => {
        const r = element.getBoundingClientRect();
        return { top: r.top, bottom: r.bottom, left: r.left, right: r.right };
      };
      const focused = document.activeElement;
      const dialog = focused.closest('[role="dialog"]');
      const sheet = dialog.querySelector('.sheet-content');
      const style = getComputedStyle(focused);
      return { focused: box(focused), dialog: box(dialog), sheet: box(sheet), scrollTop: sheet.scrollTop,
        ring: Number.parseFloat(style.outlineWidth) + Number.parseFloat(style.outlineOffset),
        note: focused.value };
    });
    records.push({ scenario: 'editor-320', state: 'focused-note-settled', geometry });
    await page.screenshot({ path: join(output, 'editor-320-note.png'), animations: 'disabled' });
  } catch (error) {
    await page.screenshot({ path: join(output, 'editor-320-failure.png'), animations: 'disabled' }).catch(() => {});
    throw error;
  } finally {
    await context.close();
  }
  if (violations.length) throw Error('Unexpected nonlocal request attempted');
} catch (error) {
  failure = String(error);
  process.exitCode = 1;
} finally {
  if (browser) await browser.close();
  try { assertPins(); postPinsMatch = true; }
  catch (error) { failure = [failure, 'Post-pin failure: ' + String(error)].filter(Boolean).join(' | '); process.exitCode = 1; }
  const receipt = { startedAt, endedAt: new Date().toISOString(), sourceFreezeSha256: expectedFreeze,
    previewOrigin: origin, previewCspRequired: "frame-src 'none'; media-src 'none'", scenarios: scenarios.length + 1,
    captures: records.length, violations, failure, postPinsMatch, status: failure ? 'FAIL' : 'PASS_CAPTURE_ONLY',
    browser: 'msedge', proxy: '127.0.0.1:9 deny; loopback bypass', noAppMutation: true };
  writeFileSync(join(output, 'results.json'), JSON.stringify({ receipt, records }, null, 2) + '\n');
  console.log(JSON.stringify(receipt));
}
