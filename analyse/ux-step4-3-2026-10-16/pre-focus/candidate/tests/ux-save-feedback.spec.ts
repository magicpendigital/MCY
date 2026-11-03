import { expect, test, type Page, type Route } from '@playwright/test';
import { CONSENT_POLICY_VERSIONS, emptyConsentState } from '../src/backend/learnerData';

const origin = 'https://mcy-playwright.invalid';
const storageKey = 'sb-mcy-playwright-auth-token';
const A = '11111111-1111-4111-8111-111111111111';
const B = '77777777-7777-4777-8777-777777777777';
const writer = '/save_my_checkin_for_current_user_with_current_consent';
const saveLabel = 'Chỉ ghi lại cảm nhận hôm nay, không chọn bài';
const active = (page: Page) => page.getByTestId('flow-current');
const activeRoute = (page: Page) => page.locator('[data-testid="flow-current"] > [data-flow-route]');
async function expectRoute(page: Page, id: string) {
  await expect.poll(() => activeRoute(page).evaluateAll(routes => routes.length === 1 ? routes[0].getAttribute('data-flow-route') : null)).toBe(id);
}
function session(id = A) {
  return { access_token: id === A ? 'fictional-ux-a' : 'fictional-ux-b', refresh_token: 'fictional-refresh', token_type: 'bearer', expires_at: Math.floor(Date.now() / 1000) + 3600, expires_in: 3600,
    user: { id, email: 'fixture@example.test', aud: 'authenticated', role: 'authenticated', email_confirmed_at: '2026-01-01T00:00:00Z', app_metadata: {}, user_metadata: { locale: 'vi-VN' }, identities: [], created_at: '2026-01-01T00:00:00Z' } };
}
function latch() {
  let release!: () => void;
  const promise = new Promise<void>(resolve => { release = resolve; });
  return { promise, release };
}
async function fixture(page: Page, options: { guest?: boolean; wellbeing?: boolean; noProfile?: boolean; requiredConsent?: 'missing' | 'stale'; handle?: (route: Route, path: string) => Promise<boolean> } = {}) {
  const writes: Array<{ path: string; body: Record<string, unknown> }> = [];
  const profileReads = { [A]: 0, [B]: 0 };
  const consents = { ...emptyConsentState, terms: options.requiredConsent !== 'missing', privacy: options.requiredConsent !== 'missing', wellbeing_data: options.wellbeing ?? true };
  const versions: Record<string, string> = { ...CONSENT_POLICY_VERSIONS, ...(options.requiredConsent === 'stale' ? { terms: 'fictional-old-terms', privacy: 'fictional-old-privacy' } : {}) };
  await page.addInitScript(({ key, value }) => localStorage.setItem(key, JSON.stringify(value)), { key: storageKey, value: options.guest ? null : session() });
  await page.route('https://*.supabase.co/**', route => route.abort('blockedbyclient'));
  await page.route(origin + '/**', async route => {
    const path = new URL(route.request().url()).pathname;
    if (route.request().method() !== 'GET' && !path.endsWith('/get_my_consent_state') && !path.endsWith('/get_my_consent_policy_versions') && !path.endsWith('/mcy-ai-assistant')) writes.push({ path, body: route.request().postDataJSON() });
    if (await options.handle?.(route, path)) return;
    const id = route.request().headers().authorization?.endsWith('fictional-ux-b') ? B : A;
    if (path.endsWith('/profiles')) {
      if (route.request().method() !== 'GET') return route.fulfill({ json: {} });
      profileReads[id]++;
      return route.fulfill({ json: options.noProfile ? null : { user_id: id, display_name: id === A ? 'Fixture A' : 'Fixture B', locale: 'vi-VN', body_display_preference: 'neutral' } });
    }
    if (path.endsWith('/get_my_consent_state')) return route.fulfill({ json: consents });
    if (path.endsWith('/get_my_consent_policy_versions')) return route.fulfill({ json: versions });
    if (path.endsWith('/record_my_consent')) {
      const body = route.request().postDataJSON();
      consents[body.p_purpose as keyof typeof consents] = body.p_action === 'granted';
      versions[body.p_purpose] = body.p_policy_version;
      return route.fulfill({ json: 'fictional-ux-consent-' + writes.length });
    }
    if (path.endsWith('/checkins') || path.endsWith('/checkin_observations')) return route.fulfill({ json: [] });
    if (path.endsWith('/mcy-ai-assistant')) return route.fulfill({ json: { available: false, contractVersion: 'reviewed-practice-1' } });
    if (path.endsWith('/user')) return route.fulfill({ json: session(id).user });
    if (path.endsWith(writer)) return route.fulfill({ json: [{ checkin_id: '55000000-0000-4000-8000-000000000001', created_at: new Date().toISOString() }] });
    throw Error('Unexpected synthetic UX request: ' + path);
  });
  return { writes, profileReads };
}
async function switchActor(page: Page, id = A) {
  await page.evaluate(({ key, value }) => {
    localStorage.setItem(key, JSON.stringify(value));
    const channel = new BroadcastChannel(key); channel.postMessage({ event: 'SIGNED_IN', session: value }); channel.close();
  }, { key: storageKey, value: session(id) });
}
async function draft(page: Page, guest = false) {
  await page.goto('/?mode=web');
  if (guest) await page.getByRole('button', { name: 'Thử tìm hiểu như khách', exact: true }).click();
  else await active(page).getByRole('button', { name: 'Bắt đầu check-in', exact: true }).click();
  await active(page).getByRole('button', { name: 'Không thấy khó chịu', exact: true }).click();
  await page.getByRole('button', { name: 'Tiếp: năng lượng và thời gian', exact: true }).click();
  await active(page).getByRole('button', { name: 'Bình thường', exact: true }).click();
}
async function expectDraft(page: Page) {
  await expectRoute(page, 'checkin');
  await expect(active(page).getByRole('button', { name: 'Bình thường', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(active(page).locator('.mcy-checkin-summary')).toContainText('Không thấy khó chịu');
}

for (const guest of [true, false]) test(`${guest ? 'guest' : 'revoked account'} standalone explicitly stays unsaved and keeps the draft`, async ({ page }) => {
  const backend = await fixture(page, { guest, wellbeing: false });
  await draft(page, guest);
  await active(page).getByRole('button', { name: saveLabel, exact: true }).click();
  await expect(active(page).getByRole('status')).toContainText('Check-in chưa được lưu. Nháp vẫn ở đây.');
  await expectDraft(page);
  expect(backend.writes.filter(call => !call.path.endsWith('/mcy-ai-assistant'))).toEqual([]);
});

test('guest session recording requires the existing explicit opt-in and makes no account write', async ({ page }) => {
  const backend = await fixture(page, { guest: true, wellbeing: false });
  await page.goto('/?mode=web');
  await page.getByRole('button', { name: 'Thử tìm hiểu như khách', exact: true }).click();
  await expectRoute(page, 'checkin');
  await page.getByRole('button', { name: 'Tự chọn bài học miễn phí', exact: true }).click();
  await page.getByRole('button', { name: 'Cá nhân', exact: true }).click();
  await active(page).getByRole('button', { name: /Quyền riêng tư và đồng ý/ }).click();
  const permission = active(page).getByRole('button', { name: 'Lưu check-in trong hành trình · Tắt', exact: true });
  await expect(permission).toHaveAttribute('aria-pressed', 'false');
  await permission.click();
  await expect(active(page).getByRole('button', { name: 'Lưu check-in trong hành trình · Bật', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'Quay lại', exact: true }).click();
  await page.getByRole('button', { name: 'Hôm nay', exact: true }).click();
  await active(page).getByRole('button', { name: 'Bắt đầu check-in', exact: true }).click();
  await active(page).getByRole('button', { name: 'Không thấy khó chịu', exact: true }).click();
  await page.getByRole('button', { name: 'Tiếp: năng lượng và thời gian', exact: true }).click();
  await expect(active(page)).toHaveCount(1);
  await expect(active(page)).toContainText('Check-in chỉ được giữ trong phiên này');
  await active(page).getByRole('button', { name: saveLabel, exact: true }).click();
  await expectRoute(page, 'journey');
  await expect(active(page)).toHaveCount(1);
  await expect(active(page)).toContainText('Ghi riêng');
  expect(backend.writes).toEqual([]);
  await page.reload();
  await page.getByRole('button', { name: 'Thử tìm hiểu như khách', exact: true }).click();
  await expectRoute(page, 'checkin');
  await page.getByRole('button', { name: 'Tự chọn bài học miễn phí', exact: true }).click();
  await page.getByRole('button', { name: 'Hành trình', exact: true }).click();
  await expectRoute(page, 'journey');
  await expect(active(page)).not.toContainText('Ghi riêng');
});

test('consented account success writes once then opens Journey with the real record', async ({ page }) => {
  const backend = await fixture(page);
  await draft(page);
  await expect(active(page)).toHaveCount(1);
  await expect(active(page)).toContainText('Check-in này sẽ được lưu vào tài khoản của bạn.');
  await active(page).getByRole('button', { name: saveLabel, exact: true }).click();
  await expectRoute(page, 'journey');
  await expect(active(page)).toHaveCount(1);
  await expect(active(page)).toContainText('Ghi riêng');
  const calls = backend.writes.filter(call => call.path.endsWith(writer));
  expect(calls).toHaveLength(1);
  expect(calls[0].body).toMatchObject({ p_expected_user_id: A, p_body_status: 'none_now', p_energy_level: 2, p_capture_type: 'standalone', p_observations: [] });
});

test('uncertain save retries the same key and payload while retaining edited draft', async ({ page }) => {
  let attempts = 0;
  const backend = await fixture(page, { handle: async (route, path) => {
    if (!path.endsWith(writer) || ++attempts !== 1) return false;
    await route.abort('failed'); return true;
  } });
  await draft(page);
  await active(page).getByRole('button', { name: saveLabel, exact: true }).click();
  await expect(active(page).getByRole('alert')).toBeVisible();
  await expectDraft(page);
  await active(page).getByRole('button', { name: 'Rất thấp', exact: true }).click();
  await active(page).getByRole('button', { name: 'Thử lại bản ghi trước', exact: true }).click();
  await expect(active(page).getByRole('status')).toContainText('Nháp vừa sửa vẫn được giữ');
  const calls = backend.writes.filter(call => call.path.endsWith(writer));
  expect(calls).toHaveLength(2); expect(calls[1].body).toEqual(calls[0].body);
  await expect(active(page).getByRole('button', { name: 'Rất thấp', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expectRoute(page, 'checkin');
});

test('leaving during client preparation cancels dispatch and navigation', async ({ page }) => {
  const backend = await fixture(page);
  await draft(page);
  await page.evaluate(async () => {
    // Test-only gate on the real account-bound client preparation, no app hook.
    const { getSupabaseClient } = await import('/src/backend/supabase.ts');
    const client = await getSupabaseClient();
    const original = client.auth.getSession.bind(client.auth);
    const controls = window as unknown as { uxStarted: boolean; uxRelease: () => void; uxSettled: boolean };
    const gate = new Promise<void>(resolve => { controls.uxRelease = resolve; });
    client.auth.getSession = async () => { controls.uxStarted = true; await gate; const result = await original(); controls.uxSettled = true; return result; };
  });
  await active(page).getByRole('button', { name: saveLabel, exact: true }).click();
  await expect.poll(() => page.evaluate(() => (window as unknown as { uxStarted: boolean }).uxStarted)).toBe(true);
  await page.getByRole('button', { name: 'Tự chọn bài học video miễn phí', exact: true }).click();
  await page.evaluate(() => (window as unknown as { uxRelease: () => void }).uxRelease());
  await expect.poll(() => page.evaluate(() => (window as unknown as { uxSettled: boolean }).uxSettled)).toBe(true);
  await active(page).getByRole('button', { name: /Cách chọn bài học video/ }).click();
  await expectRoute(page, 'discover-detail');
  expect(backend.writes.filter(call => call.path.endsWith(writer))).toEqual([]);
});

test('response from an already dispatched save cannot navigate a switched account', async ({ page }) => {
  const started = latch(), release = latch();
  const backend = await fixture(page, { handle: async (route, path) => {
    if (!path.endsWith(writer)) return false;
    started.release(); await release.promise;
    await route.fulfill({ json: [{ checkin_id: '55000000-0000-4000-8000-000000000001', created_at: new Date().toISOString() }] }); return true;
  } });
  await draft(page);
  await active(page).getByRole('button', { name: saveLabel, exact: true }).click(); await started.promise;
  await switchActor(page, B); await expect.poll(() => backend.profileReads[B]).toBeGreaterThan(0);
  const response = page.waitForResponse(result => result.url().endsWith(writer));
  release.release(); await (await response).json();
  await expectRoute(page, 'checkin');
  await page.getByRole('button', { name: 'Quay lại', exact: true }).click();
  await page.getByRole('button', { name: 'Cá nhân', exact: true }).click();
  await expect(active(page)).toHaveCount(1);
  await expect(active(page).locator('.mcy-account-home h1')).toHaveText('Chào, Fixture B.');
  expect(backend.writes.filter(call => call.path.endsWith(writer))).toHaveLength(1);
});

test('no-draft onboarding accurately labels profile saving and preserves explicit retry after error', async ({ page }) => {
  let profileAttempts = 0;
  const backend = await fixture(page, { noProfile: true, handle: async (route, path) => {
    if (!path.endsWith('/profiles') || route.request().method() === 'GET' || ++profileAttempts !== 1) return false;
    await route.fulfill({ status: 503, json: { message: 'Fictional profile failure' } }); return true;
  } });
  await page.goto('/?mode=web');
  await page.getByLabel('Tên hiển thị').fill('Optional name');
  await page.getByRole('button', { name: 'Lưu hồ sơ và tiếp tục', exact: true }).click();
  await expect(active(page).getByRole('alert')).toBeVisible();
  await expect(page.getByLabel('Tên hiển thị')).toHaveValue('Optional name');
  await expect(active(page)).not.toContainText('Nháp check-in trong phiên này');
  await expect(active(page).getByRole('button', { name: 'Để sau', exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: 'Lưu hồ sơ và tiếp tục', exact: true }).click();
  await expectRoute(page, 'home');
  expect(backend.writes.filter(call => call.path.endsWith('/profiles'))).toHaveLength(2);
  expect(backend.writes.filter(call => call.path.endsWith(writer))).toEqual([]);
});

for (const wellbeing of [false, true]) test(`onboarding with a draft ${wellbeing ? 'confirms account check-in saving' : 'retains the unsaved draft'} after an explicit profile retry`, async ({ page }) => {
  let profileAttempts = 0;
  const backend = await fixture(page, { guest: true, noProfile: true, wellbeing, handle: async (route, path) => {
    if (!path.endsWith('/profiles') || route.request().method() === 'GET' || ++profileAttempts !== 1) return false;
    await route.fulfill({ status: 503, json: { message: 'Fictional profile failure' } }); return true;
  } });
  await draft(page, true);
  await page.getByRole('button', { name: 'Đăng nhập hoặc tạo tài khoản (tùy chọn)', exact: true }).click();
  // The fixture's initialized SDK subscription receives a fictional account;
  // this test does not request or verify any email.
  await switchActor(page);
  await expect(page.getByRole('button', { name: 'Xem lựa chọn nháp check-in', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Xem lựa chọn nháp check-in', exact: true }).click();
  const confirmation = page.getByRole('button', { name: wellbeing ? 'Lưu hồ sơ và check-in' : 'Lưu hồ sơ và giữ nháp', exact: true });
  await confirmation.click();
  await expect(active(page).getByRole('alert')).toBeVisible();
  await expect(confirmation).toBeEnabled();
  await confirmation.click();
  await expectRoute(page, 'discover');
  expect(backend.writes.filter(call => call.path.endsWith('/profiles'))).toHaveLength(2);
  expect(backend.writes.filter(call => call.path.endsWith(writer))).toHaveLength(wellbeing ? 1 : 0);
  await page.getByRole('button', { name: 'Hôm nay', exact: true }).click();
  await expectRoute(page, 'home');
  await active(page).getByRole('button', { name: 'Bắt đầu check-in', exact: true }).click();
  await expectDraft(page);
});

test('returning from check-in without a body or energy draft saves only the profile', async ({ page }) => {
  const backend = await fixture(page, { guest: true, noProfile: true });
  await page.goto('/?mode=web');
  await page.getByRole('button', { name: 'Thử tìm hiểu như khách', exact: true }).click();
  await page.getByRole('button', { name: 'Tiếp: năng lượng và thời gian', exact: true }).click();
  await page.getByRole('button', { name: 'Đăng nhập hoặc tạo tài khoản (tùy chọn)', exact: true }).click();
  await switchActor(page);
  await page.getByRole('button', { name: 'Lưu hồ sơ và tiếp tục', exact: true }).click();
  await expectRoute(page, 'discover');
  expect(backend.writes.filter(call => call.path.endsWith('/profiles'))).toHaveLength(1);
  expect(backend.writes.filter(call => call.path.endsWith(writer))).toEqual([]);
});

for (const requiredConsent of ['missing', 'stale'] as const) for (const actualDraft of [false, true]) test(`consent ${requiredConsent} required versions with ${actualDraft ? 'an actual' : 'no'} draft only transfers actual data`, async ({ page }) => {
  const backend = await fixture(page, { guest: true, requiredConsent });
  await page.goto('/?mode=web');
  await page.getByRole('button', { name: 'Thử tìm hiểu như khách', exact: true }).click();
  await expectRoute(page, 'checkin');
  if (actualDraft) await active(page).getByRole('button', { name: 'Không thấy khó chịu', exact: true }).click();
  await page.getByRole('button', { name: 'Tiếp: năng lượng và thời gian', exact: true }).click();
  if (actualDraft) await active(page).getByRole('button', { name: 'Bình thường', exact: true }).click();
  await page.getByRole('button', { name: 'Đăng nhập hoặc tạo tài khoản (tùy chọn)', exact: true }).click();
  await switchActor(page);
  await expectRoute(page, 'consent');
  const draftNotice = active(page).locator('.mcy-consent-card').filter({ hasText: 'Nháp check-in trong phiên này' });
  await expect(draftNotice).toHaveCount(actualDraft ? 1 : 0);
  await page.getByRole('button', { name: 'Tôi đồng ý điều khoản và thông báo · phiên bản 0.1', exact: true }).click();
  await page.getByRole('button', { name: actualDraft ? 'Xác nhận chuyển nháp' : 'Tiếp tục', exact: true }).click();
  await expectRoute(page, 'discover');
  const events = backend.writes.filter(call => call.path.endsWith('/record_my_consent'));
  expect(events.map(call => call.body.p_purpose).sort()).toEqual(['privacy', 'terms']);
  const records = backend.writes.filter(call => call.path.endsWith(writer));
  expect(records).toHaveLength(actualDraft ? 1 : 0);
  if (actualDraft) expect(records[0].body).toMatchObject({ p_capture_type: 'practice_preparation', p_body_status: 'none_now', p_energy_level: 2 });
  expect(backend.writes.filter(call => call.path.endsWith('/profiles'))).toHaveLength(0);
});

test('failed save leaves Journey ready and its pending CTA preserves the exact retry and edited draft', async ({ page }) => {
  let attempts = 0;
  const backend = await fixture(page, { handle: async (route, path) => {
    if (!path.endsWith(writer) || ++attempts !== 1) return false;
    await route.abort('failed'); return true;
  } });
  await draft(page);
  await active(page).getByRole('button', { name: saveLabel, exact: true }).click();
  await expect(active(page).getByRole('alert')).toBeVisible();
  await active(page).getByRole('button', { name: 'Rất thấp', exact: true }).click();
  await page.getByRole('button', { name: 'Tự chọn bài học video miễn phí', exact: true }).click();
  await expectRoute(page, 'discover');
  await page.getByRole('button', { name: 'Hành trình', exact: true }).click();
  await expectRoute(page, 'journey');
  await expect(active(page).getByText('Đang tải bản ghi của bạn…', { exact: true })).toHaveCount(0);
  await expect(active(page).getByRole('status')).toContainText('Một lần lưu check-in chưa được xác nhận. Nháp vẫn được giữ');
  await expect(active(page).locator('.mcy-journey-empty')).toHaveCount(0);
  await page.getByRole('button', { name: 'Xem lại lần lưu chưa xác nhận', exact: true }).click();
  await expectRoute(page, 'checkin');
  await expect(active(page).getByRole('button', { name: 'Rất thấp', exact: true })).toHaveAttribute('aria-pressed', 'true');
  expect(backend.writes.filter(call => call.path.endsWith(writer))).toHaveLength(1);
  await active(page).getByRole('button', { name: 'Thử lại bản ghi trước', exact: true }).click();
  await expect(active(page).getByRole('status')).toContainText('Nháp vừa sửa vẫn được giữ');
  const records = backend.writes.filter(call => call.path.endsWith(writer));
  expect(records).toHaveLength(2); expect(records[1].body).toEqual(records[0].body);
  await expect(active(page).getByRole('button', { name: 'Rất thấp', exact: true })).toHaveAttribute('aria-pressed', 'true');
});

test('security action describes other-account sign-in and notification copy promises no scheduling', async ({ page }) => {
  const backend = await fixture(page);
  await page.goto('/?mode=web');
  await page.getByRole('button', { name: 'Cá nhân', exact: true }).click();
  await expect(active(page)).toHaveCount(1);
  await expect(active(page)).toContainText('Email đã xác minh.');
  await active(page).getByRole('button', { name: /Tùy chọn thông báo/ }).click();
  await expect(active(page)).toHaveCount(1);
  await expect(active(page)).toContainText('Nhắc tập chưa mở');
  await expect(active(page).getByRole('button', { name: 'Cho phép nhận thông báo nhắc tập · Tắt', exact: true })).toHaveAttribute('aria-pressed', 'false');
  await page.getByRole('button', { name: 'Quay lại', exact: true }).click();
  await active(page).getByRole('button', { name: /Bảo mật tài khoản/ }).click();
  await expect(active(page)).toHaveCount(1);
  await expect(active(page)).toContainText('Hồ sơ và Hành trình được giữ riêng theo từng tài khoản.');
  await active(page).getByRole('button', { name: 'Đăng nhập bằng tài khoản khác', exact: true }).click();
  await expect(page.getByLabel('Địa chỉ email')).toBeVisible();
  expect(backend.writes.filter(call => !call.path.endsWith('/mcy-ai-assistant'))).toEqual([]);
});
