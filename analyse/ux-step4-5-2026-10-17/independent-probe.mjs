import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import { createServer } from 'vite';
import { chromium, expect } from '@playwright/test';
import { isolatePlaywrightTestEnvironment } from '../../scripts/playwright-test-environment.mjs';
const root = path.resolve(import.meta.dirname, '../..'), dir = path.join(import.meta.dirname, 'independent-qc');
fs.mkdirSync(dir, { recursive: true });
const sourcePath = path.join(import.meta.dirname, 'SOURCE-FREEZE.json'), expectedSource = '101e8b5c4d44399229d4b3e77bba281b33111889e793b1dc04abf6d5257c2c63';
const hash = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const source = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
function pins() {
  assert.equal(hash(sourcePath), expectedSource);
  for (const i of source.appInputs) assert.equal(hash(path.join(source.candidate, i.path)), i.sha256, i.path);
  for (const i of source.harnessAndIntake) assert.equal(hash(path.join(root, i.path)), i.sha256, i.path);
}
pins();
for (const k of Object.keys(process.env)) if (k.startsWith('VITE_')) delete process.env[k];
isolatePlaywrightTestEnvironment();
const server = await createServer({ root: source.candidate, envDir: path.join(dir, '.invalid'), configFile: path.join(source.candidate, 'vite.config.ts'), configLoader: 'runner', cacheDir: path.join(dir, '.vite-cache'), server: { host: '127.0.0.1', port: 4210, strictPort: true, fs: { allow: [source.candidate, path.join(root, 'node_modules')] } } });
const active = p => p.getByTestId('flow-current'), view = p => active(p).locator('.mcy-reflection-page');
const cases = [];
const scope = en => en ? 'This reflection is kept only for the current session; it is not synced to your account.' : 'Phản hồi này chỉ được giữ trong phiên hiện tại; chưa đồng bộ vào tài khoản.';
async function tabTo(p, selector, max = 50) {
  for (let n = 0; n < max; n++) { await p.keyboard.press('Tab'); if (await p.evaluate(s => document.activeElement?.matches(s), selector)) return n + 1; }
  throw Error('Tab did not reach ' + selector);
}
async function focusClear(p) {
  const g = await p.evaluate(() => { const r = document.activeElement.getBoundingClientRect(), h = document.querySelector('.flow-fixed-header').getBoundingClientRect(), f = document.querySelector('.flow-fixed-footer').getBoundingClientRect(); return { top: r.top, bottom: r.bottom, header: h.bottom, footer: f.top }; });
  assert.ok(g.top >= g.header - 1, JSON.stringify(g)); assert.ok(g.bottom <= g.footer + 1, JSON.stringify(g)); return g;
}
async function overflow(p) {
  const g = await view(p).evaluate(e => { const s = e.closest('.mobile-scroll'), box = s.getBoundingClientRect(); return { client: s.clientWidth, scroll: s.scrollWidth, offenders: [...e.querySelectorAll('*')].filter(n => { const r = n.getBoundingClientRect(); return r.width > 0 && getComputedStyle(n).visibility !== 'hidden' && (r.left < box.left - 1 || r.right > box.right + 1); }).map(n => ({ tag: n.tagName, cls: n.className?.baseVal ?? n.className, text: n.textContent?.slice(0, 60) })) }; });
  assert.ok(g.scroll <= g.client + 1, JSON.stringify(g)); assert.deepEqual(g.offenders, [], JSON.stringify(g)); return g;
}
async function footer(p) {
  const g = await p.evaluate(() => { const box = e => { const r = e.getBoundingClientRect(); return { left: r.left, right: r.right, top: r.top, bottom: r.bottom, width: r.width, height: r.height }; }; const f = document.querySelector('.flow-fixed-footer'), a = f.querySelector('.mcy-action'), s = f.querySelector('.mcy-quiet-link'); return { footer: box(f), primary: box(a), skip: box(s), safe: parseFloat(getComputedStyle(document.querySelector('.mobile-page')).getPropertyValue('--mobile-safe-area-height')) || 0 }; });
  for (const b of [g.primary, g.skip]) { assert.ok(b.left >= g.footer.left + 15.9, JSON.stringify(g)); assert.ok(b.right <= g.footer.right - 15.9, JSON.stringify(g)); assert.ok(b.height >= 44, JSON.stringify(g)); assert.ok(b.top - g.footer.top >= 6, JSON.stringify(g)); assert.ok(g.footer.bottom - g.safe - b.bottom >= 6, JSON.stringify(g)); }
  assert.ok(g.skip.right < g.primary.left, JSON.stringify(g)); return g;
}
async function enter(p, { en = false, before, account = false, query = '?mode=web' } = {}) {
  await p.goto('http://127.0.0.1:4210/' + query);
  if (en) await p.locator('.mcy-language-toggle').click();
  await p.getByRole('button', { name: account ? 'Bắt đầu check-in' : en ? 'Explore as a guest' : 'Thử tìm hiểu như khách', exact: true }).click();
  if (before === 'none') await p.getByRole('button', { name: en ? 'No discomfort now' : 'Không thấy khó chịu', exact: true }).click();
  if (before === 'unknown') await p.getByRole('button', { name: 'Chưa xác định', exact: true }).click();
  if (before === 'skip') await p.getByRole('button', { name: 'Bỏ qua ghi nhận cơ thể', exact: true }).click();
  if (before === 'regions') {
    await active(p).locator('.mcy-body-disclosure').click(); await active(p).locator('.mcy-body-groups button').nth(1).click();
    await active(p).locator('.mcy-region-list button').filter({ hasText: 'Khuỷu tay' }).click();
    await p.getByRole('button', { name: 'Trái', exact: true }).click(); await p.getByRole('button', { name: 'Vừa', exact: true }).click(); await p.getByRole('button', { name: 'Lưu vùng này', exact: true }).click();
    await active(p).locator('.mcy-map-pin[aria-label^="Khuỷu tay phải:"]').click(); await p.getByRole('button', { name: 'Phải', exact: true }).click(); await p.getByRole('button', { name: 'Nhẹ', exact: true }).click(); await p.getByRole('button', { name: 'Lưu vùng này', exact: true }).click();
  }
  if (before !== 'skip') await p.getByRole('button', { name: en ? 'Next: energy and time' : 'Tiếp: năng lượng và thời gian', exact: true }).click();
  await p.getByRole('button', { name: en ? 'Browse free video lessons' : 'Tự chọn bài học video miễn phí', exact: true }).click();
  await p.getByRole('button', { name: /Một chút chuyển động nhẹ/ }).click(); await active(p).locator('.mcy-course-play').click();
  await active(p).getByRole('button', { name: en ? 'I practised · record reflection' : 'Tôi đã thực hành · ghi cảm nhận', exact: true }).click();
  await expect(view(p)).toBeVisible(); await expect.poll(() => active(p).evaluate(e => Math.round(e.getBoundingClientRect().left - e.parentElement.getBoundingClientRect().left))).toBe(0);
  await expect(view(p).locator('.mcy-reflection-scope')).toHaveText(scope(en));
}
function session() { return { access_token: 'fictional-independent-reflection', refresh_token: 'fictional-refresh', token_type: 'bearer', expires_at: Math.floor(Date.now() / 1000) + 3600, expires_in: 3600, user: { id: '11111111-1111-4111-8111-111111111111', email: 'qc@example.test', aud: 'authenticated', role: 'authenticated', email_confirmed_at: '2026-01-01T00:00:00Z', app_metadata: {}, user_metadata: { locale: 'vi-VN' }, identities: [], created_at: '2026-01-01T00:00:00Z' } }; }
let browser;
async function run(name, options, body) {
  const context = await browser.newContext({ viewport: { width: 320, height: 568 }, reducedMotion: 'reduce', ...(options.context || {}) }); const p = await context.newPage(), requests = [], errors = [];
  p.on('request', r => { if (new URL(r.url()).hostname !== '127.0.0.1') requests.push({ method: r.method(), path: new URL(r.url()).pathname }); }); p.on('pageerror', e => errors.push(e.message));
  await context.route('**/*', r => new URL(r.request().url()).hostname === '127.0.0.1' ? r.fallback() : r.abort());
  await p.route('https://www.youtube-nocookie.com/embed/**', r => r.fulfill({ contentType: 'text/html', body: '<!doctype html><title>Independent player fixture</title>' }));
  if (options.account) {
    await p.addInitScript(value => localStorage.setItem('sb-mcy-playwright-auth-token', JSON.stringify(value)), session());
    await p.route('https://mcy-playwright.invalid/**', async r => {
      const u = new URL(r.request().url()).pathname;
      if (u.endsWith('/profiles')) return r.fulfill({ json: { user_id: session().user.id, display_name: 'Synthetic QC', locale: 'vi-VN', body_display_preference: 'neutral' } });
      if (u.endsWith('/get_my_consent_state')) return r.fulfill({ json: { terms: true, privacy: true, ai_processing: false, wellbeing_data: options.wellbeing, teacher_sharing: false, notifications: false, marketing: false } });
      if (u.endsWith('/get_my_consent_policy_versions')) return r.fulfill({ json: { terms: 'terms-review-0.1', privacy: 'privacy-review-0.1', wellbeing_data: 'wellbeing-data-review-0.1', ai_processing: 'ai-processing-review-1.0' } });
      if (u.endsWith('/checkins') || u.endsWith('/checkin_observations')) return r.fulfill({ json: [] });
      if (u.endsWith('/mcy-ai-assistant')) return r.fulfill({ json: { available: false, contractVersion: 'reviewed-practice-1' } });
      if (u.endsWith('/user')) return r.fulfill({ json: session().user });
      throw Error('Unmocked independent account fixture request: ' + u);
    });
  }
  try { const detail = await body(p, requests); assert.deepEqual(errors, []); cases.push({ name, status: 'PASS', detail, requests, pageErrors: errors }); }
  catch (e) { await p.screenshot({ path: path.join(dir, name + '-failure.png') }).catch(() => {}); cases.push({ name, status: 'FAIL', error: e.stack, requests, pageErrors: errors }); }
  finally { await context.close(); fs.writeFileSync(path.join(dir, 'probe-progress.json'), JSON.stringify(cases, null, 2) + '\n'); console.log(name + ': ' + cases.at(-1).status); }
}
try {
  await server.listen(); browser = await chromium.launch({ channel: 'msedge', headless: true, proxy: { server: 'http://127.0.0.1:9', bypass: '127.0.0.1,localhost' } });
  for (const en of [false, true]) for (const large of [false, true]) await run(`geometry-keyboard-${en ? 'en' : 'vi'}-${large ? '28' : 'normal'}`, {}, async (p, requests) => {
    await enter(p, { en }); await expect(view(p).locator('.mcy-before-after')).toHaveCount(0); await expect(view(p).locator('.selected')).toHaveCount(0); const main = await view(p).evaluate(e => { const f = document.querySelector('.flow-fixed-footer').getBoundingClientRect(), h = document.querySelector('.flow-fixed-header').getBoundingClientRect(); return { header: h.bottom, footer: f.top, scope: e.querySelector('.mcy-reflection-scope').getBoundingClientRect().bottom, choices: [...e.querySelectorAll('.mcy-reflection-grid button')].map(n => n.getBoundingClientRect().bottom) }; }); assert.ok(main.scope <= main.footer && Math.max(...main.choices) <= main.footer, JSON.stringify(main));
    if (large) await p.addStyleTag({ content: '.mcy-reflection-page :is(p,span,button,summary,small,strong,textarea),.mcy-reflection-footer button{font-size:28px!important;line-height:1.5!important}' });
    const footerGeometry = await footer(p); await tabTo(p, '.mcy-reflection-grid button'); await focusClear(p); await tabTo(p, '.mcy-reflection-details > summary'); await focusClear(p); await p.keyboard.press('Enter');
    await tabTo(p, '.mcy-reflection-page textarea'); const textFocus = await focusClear(p); await p.keyboard.type('Synthetic optional reflection only'); await expect(view(p).locator('textarea')).toHaveValue('Synthetic optional reflection only'); await focusClear(p); const overflowGeometry = await overflow(p);
    await tabTo(p, '.mcy-reflection-footer .mcy-quiet-link'); const skipFocus = await footer(p); await p.keyboard.press('Tab'); await expect(p.locator('.mcy-reflection-footer .mcy-action')).toBeFocused(); await footer(p);
    await p.screenshot({ path: path.join(dir, `keyboard-${en ? 'en' : 'vi'}-${large ? '28' : 'normal'}.png`) });
    await p.keyboard.press('Enter'); await expect(active(p).locator('.mcy-sync-card')).toContainText(en ? 'No overall feedback was provided.' : 'Không có phản hồi chung được cung cấp.'); assert.equal(requests.filter(r => r.method !== 'GET').length, 0);
    return { initialCore: main, footerGeometry, textFocus, overflowGeometry, skipFocus };
  });
  for (const device of ['iphone', 'pixel-10']) await run('safearea-' + device, { context: { viewport: { width: 1100, height: 1100 } } }, async p => { await enter(p, { query: '?mode=review&device=' + device }); await p.addStyleTag({ content: '.mcy-reflection-footer button{font-size:28px!important;line-height:1.5!important}' }); const g = await footer(p); await tabTo(p, '.mcy-reflection-footer .mcy-quiet-link'); await footer(p); await p.keyboard.press('Tab'); await footer(p); await p.screenshot({ path: path.join(dir, 'safearea-' + device + '.png') }); return g; });
  for (const [before, text] of [['none', 'Trước tập, bạn đã chọn không thấy khó chịu'], ['unknown', 'Trước tập, bạn đã chọn chưa rõ'], ['skip', 'Chưa có ghi nhận vùng trước tập']]) await run('prior-status-' + before, {}, async (p, requests) => { await enter(p, { before }); await expect(view(p).locator('.mcy-reflection-baseline')).toContainText(text); await expect(view(p).locator('.mcy-before-after')).toHaveCount(0); await p.locator('.mcy-reflection-footer .mcy-action').click(); await expect(active(p).locator('.mcy-sync-card')).toContainText('Không có phản hồi chung được cung cấp.'); assert.equal(requests.filter(r => r.method !== 'GET').length, 0); return { text, noInventedComparison: true }; });
  await run('new-post-edit-delete-and-retained-route', {}, async (p, requests) => { await enter(p); await view(p).locator('summary').click(); await view(p).getByRole('button', { name: 'Ghi thêm vùng khác sau tập', exact: true }).click(); const dialog = p.getByRole('dialog'); await dialog.getByRole('button', { name: 'Khuỷu tay', exact: true }).click(); await dialog.getByRole('button', { name: 'Trái', exact: true }).click(); await dialog.getByRole('button', { name: 'Vừa', exact: true }).click(); await dialog.getByRole('button', { name: 'Lưu vùng này', exact: true }).click(); await view(p).locator('summary').click(); const row = view(p).locator('.mcy-reflection-current-list button'); await expect(row).toContainText('Trái'); await expect(row).toContainText('Vừa'); await row.click(); await dialog.getByRole('button', { name: 'Nhẹ', exact: true }).click(); await dialog.getByRole('button', { name: 'Lưu vùng này', exact: true }).click(); await expect(row).toContainText('Nhẹ'); await row.click(); await dialog.getByRole('button', { name: 'Xóa vùng này', exact: true }).click(); await expect(row).toHaveCount(0); await expect(view(p).locator('.mcy-before-after')).toHaveCount(0); await p.getByRole('button', { name: 'Quay lại', exact: true }).click(); await expect(active(p).locator('.mcy-course-detail-page')).toBeVisible(); await expect(p.locator('.mcy-reflection-footer')).toHaveCount(0); await expect(p.locator('iframe')).toHaveCount(0); assert.equal(requests.filter(r => r.method !== 'GET').length, 0); return { currentRegionEditableWithoutInventedBefore: true, retainedCourseFooterClean: true }; });
  await run('unequal-sides-keep-uncertain', {}, async (p, requests) => { await enter(p, { before: 'regions' }); const rows = view(p).locator('.mcy-reflection-region-row'); await expect(rows).toHaveCount(2); await expect(rows.first()).toContainText('Trước tập: Vừa'); await expect(rows.last()).toContainText('Trước tập: Nhẹ'); await rows.first().getByRole('button', { name: 'Giữ như trước ở vùng này', exact: true }).click(); await expect(rows.first()).toContainText('Sau tậpVừa'); await expect(rows.last()).toContainText('Chạm để ghi'); await view(p).getByRole('button', { name: 'Giữ như trước cho tất cả vùng', exact: true }).click(); await expect(rows.last()).toContainText('Sau tậpNhẹ'); await view(p).getByRole('button', { name: 'Chưa rõ sau tập', exact: true }).click(); await expect(rows.first()).toContainText('Chạm để ghi'); await expect(view(p).getByText('Chưa rõ sau tập', { exact: true })).toHaveCount(2); assert.equal(requests.filter(r => r.method !== 'GET').length, 0); return { perSideLevelsPreserved: true, noImplicitSame: true, uncertainClearsAfterEntries: true }; });
  for (const wellbeing of [false, true]) await run('signed-in-session-only-' + wellbeing, { account: true, wellbeing }, async (p, requests) => { await enter(p, { account: true, before: 'none' }); const marker = requests.length; await view(p).getByRole('button', { name: 'Khó chịu hơn', exact: true }).click(); await expect(view(p).locator('.mcy-alert')).toContainText('không tự gợi bài'); await expect(view(p).locator('details')).not.toHaveAttribute('open', ''); await p.locator('.mcy-reflection-footer .mcy-action').click(); await expect(active(p).locator('.mcy-sync-card')).toContainText('Khó chịu hơn'); await expect(active(p).locator('.mcy-state-pill')).toHaveText('CHỈ GIỮ TRONG PHIÊN'); await active(p).getByRole('button', { name: 'Mở hành trình', exact: true }).click(); if (wellbeing) await expect(active(p).locator('.mcy-snapshot-card')).toContainText('Khó chịu hơn'); else await expect(active(p).locator('.mcy-snapshot-card')).toHaveCount(0); assert.deepEqual(requests.slice(marker), []); return { wellbeing, noReflectionRpc: true, localHistoryHonorsConsent: true, requestsBeforeReflectionAction: marker }; });
  await run('explicit-skip-discards-worse', {}, async (p, requests) => { await enter(p); await view(p).getByRole('button', { name: 'Khó chịu hơn', exact: true }).click(); await p.locator('.mcy-reflection-footer').getByRole('button', { name: 'Bỏ qua', exact: true }).click(); await expect(active(p).locator('.mcy-sync-card')).toContainText('Bạn đã chọn bỏ qua phản hồi'); await expect(active(p).locator('.mcy-sync-card')).not.toContainText('Khó chịu hơn'); assert.equal(requests.filter(r => r.method !== 'GET').length, 0); return { skipDistinctFromBlankAndWorse: true }; });
  pins();
} finally { await browser?.close(); await server.close(); }
const result = { status: cases.every(c => c.status === 'PASS') ? 'PASS' : 'FAIL', executedAt: new Date().toISOString(), command: 'node analyse/ux-step4-5-2026-10-17/independent-probe.mjs', sourceManifestSha256: expectedSource, beforeAfterPinsMatch: true, environment: 'Windows / Edge headless / Vite4210 exact candidate / invalid-only backend fixtures / nonlocal proxy denied / iframe fulfilled', cases, harnessSha256: hash(import.meta.filename), limits: 'Synthetic session fixtures and geometry only; no real Auth/data/AI/video/native/device/screenreader acceptance' };
fs.writeFileSync(path.join(dir, 'probe-results.json'), JSON.stringify(result, null, 2) + '\n'); console.log(JSON.stringify({ status: result.status, cases: cases.map(c => ({ name: c.name, status: c.status, error: c.error })) })); process.exitCode = result.status === 'PASS' ? 0 : 1;
