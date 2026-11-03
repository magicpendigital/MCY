import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import { createServer } from 'vite';
import { chromium, expect } from '@playwright/test';
import { isolatePlaywrightTestEnvironment } from '../../scripts/playwright-test-environment.mjs';
const dir = path.resolve(import.meta.dirname, 'independent-qc');
fs.mkdirSync(dir, { recursive: true });
const project = path.resolve(import.meta.dirname, '../..');
const manifestPath = path.join(import.meta.dirname, 'SOURCE-FREEZE.json');
const hash = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const expectedManifest = 'f11a6af114f42427cd6d758f5ac191d0af65324d5018e82524adf913fde7e243';
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
function pins() {
  assert.equal(hash(manifestPath), expectedManifest);
  for (const x of manifest.appInputs) assert.equal(hash(path.join(manifest.candidate, x.path)), x.sha256, x.path);
  for (const x of manifest.harnessAndIntake) assert.equal(hash(path.resolve(project, x.path)), x.sha256, x.path);
}
pins();
for (const k of Object.keys(process.env)) if (k.startsWith('VITE_')) delete process.env[k];
isolatePlaywrightTestEnvironment();
const server = await createServer({ root: manifest.candidate, envDir: path.join(dir, '.invalid'), configFile: path.join(manifest.candidate, 'vite.config.ts'), configLoader: 'runner', cacheDir: path.join(dir, '.vite-cache'), server: { host: '127.0.0.1', port: 4208, strictPort: true, fs: { allow: [manifest.candidate, path.join(project, 'node_modules')] } } });
const cases = [];
let browser;
const active = p => p.locator('[data-flow-route="course-detail"][data-flow-active="true"]').last();
async function tabTo(p, selector, limit = 50) {
  for (let n = 0; n < limit; n++) { await p.keyboard.press('Tab'); if (await p.evaluate(s => document.activeElement?.matches(s), selector)) return n + 1; }
  throw Error(`Keyboard did not reach ${selector}`);
}
async function open(p, english = false) {
  await p.goto('http://127.0.0.1:4208/?mode=web');
  if (english) await p.locator('.mcy-language-toggle').click();
  await p.getByRole('button', { name: english ? 'Explore as a guest' : 'Thử tìm hiểu như khách', exact: true }).click();
  await p.getByRole('button', { name: english ? 'Next: energy and time' : 'Tiếp: năng lượng và thời gian', exact: true }).click();
  await p.getByRole('button', { name: english ? 'Browse free video lessons' : 'Tự chọn bài học video miễn phí', exact: true }).click();
  await p.getByRole('button', { name: /Một chút chuyển động nhẹ/ }).click();
  await expect(active(p).locator('h1')).toHaveText('Một chút chuyển động nhẹ');
  await expect.poll(() => active(p).evaluate(e => Math.round(e.getBoundingClientRect().left - e.parentElement.getBoundingClientRect().left))).toBe(0);
}
async function run(name, options, body) {
  const context = await browser.newContext({ viewport: { width: 320, height: 568 }, reducedMotion: 'reduce', ...options });
  const p = await context.newPage(), external = [], writes = [], errors = [];
  let embeds = 0;
  p.on('pageerror', e => errors.push(e.message));
  p.on('request', r => { const u = new URL(r.url()); if (u.hostname !== '127.0.0.1') { external.push(r.method() + ' ' + u.hostname + u.pathname); if (!['GET', 'HEAD', 'OPTIONS'].includes(r.method())) writes.push(r.method() + ' ' + u.pathname); } });
  await context.route('**/*', r => new URL(r.request().url()).hostname === '127.0.0.1' ? r.fallback() : r.abort());
  await p.route('https://www.youtube-nocookie.com/embed/**', r => { embeds++; return r.fulfill({ contentType: 'text/html', body: '<!doctype html><title>Independent player fixture</title><button>Player control fixture</button>' }); });
  try {
    const detail = await body(p, () => embeds);
    assert.deepEqual(writes, []);
    assert.deepEqual(errors, []);
    cases.push({ name, status: 'PASS', detail, externalRequests: external, writes, pageErrors: errors });
  } catch (e) {
    await p.screenshot({ path: path.join(dir, name + '-failure.png') }).catch(() => {});
    cases.push({ name, status: 'FAIL', error: e.stack, externalRequests: external, writes, pageErrors: errors });
  } finally { await context.close(); }
}
try {
  await server.listen();
  browser = await chromium.launch({ channel: 'msedge', headless: true, proxy: { server: 'http://127.0.0.1:9', bypass: '127.0.0.1,localhost' } });
  for (const english of [false, true]) for (const large of [false, true]) await run(`keyboard-${english ? 'en' : 'vi'}-${large ? 'text28' : 'normal'}`, {}, async (p, embeds) => {
    await open(p, english); assert.equal(embeds(), 0); await expect(p.locator('iframe')).toHaveCount(0);
    const initialScroll = await active(p).locator('.mobile-scroll').evaluate(e => e.scrollTop);
    await p.waitForTimeout(250); assert.equal(await active(p).locator('.mobile-scroll').evaluate(e => e.scrollTop), initialScroll);
    if (large) await p.addStyleTag({ content: '.mcy-course-detail-page :is(p,span,button,a,summary,small,strong){font-size:28px!important;line-height:1.5!important}' });
    await tabTo(p, '.mcy-course-video-notes > summary'); await p.keyboard.press('Enter'); await expect(active(p).locator('.mcy-course-caption-detail')).toBeVisible(); await p.keyboard.press('Enter');
    await tabTo(p, '.mcy-course-source-note a'); await tabTo(p, '.mcy-course-play');
    const before = await active(p).getByTestId('course-video').boundingBox();
    await p.keyboard.press('Enter'); await expect(active(p).getByTestId('course-video')).toBeFocused(); await expect(active(p).getByTestId('course-player-status')).toHaveAttribute('data-state', 'frame-loaded'); assert.equal(embeds(), 1);
    const after = await active(p).getByTestId('course-video').boundingBox(), scroll = await active(p).locator('.mobile-scroll').boundingBox();
    assert.ok(Math.abs(before.width - after.width) < 1 && Math.abs(before.height - after.height) < 1, 'Media footprint changed');
    assert.ok(after.y >= scroll.y - 1 && after.y < scroll.y + 25, `Media reveal top ${after.y} outside scroll ${scroll.y}`);
    await p.screenshot({ path: path.join(dir, `playing-${english ? 'en' : 'vi'}-${large ? '28' : 'normal'}.png`) });
    const tabs = await tabTo(p, '.mcy-course-player-help-trigger', 8); await p.keyboard.press('Enter'); await expect(active(p).locator('.mcy-course-player-help')).toBeVisible();
    await tabTo(p, '.mcy-course-player-help button', 4); await p.keyboard.press('Enter'); await expect(active(p).getByTestId('course-player-status')).toHaveAttribute('data-state', 'frame-loaded'); assert.equal(embeds(), 2);
    await active(p).locator('.mcy-course-lesson').nth(1).click(); await expect(p.locator('iframe')).toHaveCount(0); assert.equal(embeds(), 2); await expect(active(p).locator('.mcy-course-reflection-prompt')).toHaveCount(0);
    await p.getByRole('button', { name: english ? 'Back' : 'Quay lại', exact: true }).click(); await p.getByRole('button', { name: /Một chút chuyển động nhẹ/ }).click(); await expect(p.locator('iframe')).toHaveCount(0); assert.equal(embeds(), 2);
    return { initialScroll, before, after, scroll, tabsFromGroupThroughFixtureToRecovery: tabs, font: large ? 28 : 'normal' };
  });
  for (const mode of ['unverified', 'verified-en', 'verified-vi']) await run(`captions-${mode}`, {}, async (p, embeds) => {
    if (mode !== 'unverified') await p.route('**/src/courses/freeCourses.ts', async r => { const res = await r.fetch(), text = await res.text(); const body = text.replace('channelCaptionsVerified: false', 'channelCaptionsVerified: true').replace('channelCaptionLanguages: []', mode === 'verified-vi' ? 'channelCaptionLanguages: ["vi"]' : 'channelCaptionLanguages: ["en"]'); assert.notEqual(text, body); await r.fulfill({ response: res, body }); });
    await open(p, true);
    const expected = mode === 'unverified' ? 'Captions unverified · video notes' : mode === 'verified-en' ? 'Vietnamese captions not listed · video notes' : 'Video and caption notes';
    await expect(active(p).locator('.mcy-course-caption-note')).toHaveText(expected); await active(p).locator('.mcy-course-caption-note').click();
    if (mode === 'verified-vi') await expect(active(p).locator('.mcy-course-caption-detail')).toHaveCount(0); else await expect(active(p).locator('.mcy-course-caption-detail')).toBeVisible();
    assert.equal(embeds(), 0); return { expected, sourceFixtureOnly: mode !== 'unverified' };
  });
  pins();
} finally { await browser?.close(); await server.close(); }
const result = { sourceManifestSha256: expectedManifest, executedAt: new Date().toISOString(), command: 'node analyse/ux-step4-4-2026-10-17/independent-qc-probe.mjs', environment: 'Windows / Edge headless / Vite localhost4208 / invalid backend / outbound proxy denies nonlocal; embeds fulfilled in-memory', status: cases.every(c => c.status === 'PASS') ? 'PASS' : 'FAIL', cases, beforeAfterSourcePinsMatch: true, harnessSha256: hash(import.meta.filename) };
fs.writeFileSync(path.join(dir, 'probe-results.json'), JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify({ status: result.status, cases: cases.map(x => ({ name: x.name, status: x.status, error: x.error })) }, null, 2));
process.exitCode = result.status === 'PASS' ? 0 : 1;
