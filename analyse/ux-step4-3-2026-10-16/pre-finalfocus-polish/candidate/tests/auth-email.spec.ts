import { expect, test } from '@playwright/test';
import { emailLocaleRedirect, normalizeEmailLocale } from '../src/backend/emailLocale';
import { authRedirectForWorkspace } from '../src/backend/authRouting';
import { syncEmailLocaleForSession } from '../src/backend/authEmailMetadata';
import type { Session } from '@supabase/supabase-js';

const origin = 'https://mcy-playwright.invalid';
const metadataSync = (session: Session, locale: 'vi-VN' | 'en-US') => syncEmailLocaleForSession(session, locale, { url: origin, publishableKey: 'fictional-publishable-key' });
test('email language is an allowlisted cosmetic choice; native callback and Owner screen stay fixed', () => {
  expect(normalizeEmailLocale({ locale: 'en-US', role: 'owner' })).toBeNull();
  expect(normalizeEmailLocale('fr-FR')).toBeNull();
  expect(normalizeEmailLocale('en')).toBe('en-US');
  expect(emailLocaleRedirect(authRedirectForWorkspace('https://example.test/auth/callback', 'owner'), 'en-US')).toBe('https://example.test/auth/callback?workspace=owner&email_locale=en-US');
  expect(emailLocaleRedirect('motchutyoga://auth/callback', 'en-US')).toBe('motchutyoga://auth/callback');
  expect(emailLocaleRedirect('motchutyoga-mcydebug://auth/callback', 'en-US')).toBe('motchutyoga-mcydebug://auth/callback');
});
for (const workspace of ['owner', 'teacher']) test(`${workspace} can request an English email without creating or granting an account`, async ({ page }) => {
  await page.route('https://*.supabase.co/**', route => route.abort());
  await page.route(`${origin}/**`, route => route.fulfill({ status: 503, json: {} }));
  let count = 0;
  await page.route(`${origin}/auth/v1/otp**`, route => {
    count++;
    expect(route.request().postDataJSON().create_user).toBe(false);
    expect(new URL(route.request().url()).searchParams.get('redirect_to')).toBe(`${new URL(page.url()).origin}/auth/callback?workspace=${workspace}&email_locale=en-US`);
    return route.fulfill({ json: {} });
  });
  await page.goto(`/?workspace=${workspace}`);
  await page.getByLabel('Ngôn ngữ email / Email language').selectOption('en-US');
  await page.getByLabel(workspace === 'owner' ? 'Email Owner' : 'Email tài khoản').fill('fixture@example.test');
  await page.getByRole('button', { name: 'Gửi liên kết xác minh' }).click();
  await expect(page.getByRole('status')).toBeVisible();
  expect(count).toBe(1);
  await page.reload(); await expect(page.getByLabel('Ngôn ngữ email / Email language')).toHaveValue('en-US');
});

test('locale metadata update keeps the initiating account token and sends no role/profile/body data', async () => {
  const session = { access_token: 'fictional-account-A', expires_at: Math.floor(Date.now() / 1000) + 3600, user: { id: 'account-A', email_confirmed_at: '2026-01-01T00:00:00Z', user_metadata: {} } } as Session;
  const original = globalThis.fetch; let calls = 0;
  globalThis.fetch = async (input, init) => {
    calls++; expect(String(input)).toBe(`${origin}/auth/v1/user`);
    expect(init?.method).toBe('PUT'); expect((init?.headers as Record<string, string>).Authorization).toBe('Bearer fictional-account-A');
    expect(JSON.parse(String(init?.body))).toEqual({ data: { locale: 'en-US' } });
    session.access_token = 'fictional-account-B'; // A later shared session cannot change the serialized request.
    return new Response(JSON.stringify({ id: 'account-A' }), { status: 200 });
  };
  try { expect(await metadataSync(session, 'en-US')).toBe(true); expect(calls).toBe(1); }
  finally { globalThis.fetch = original; }
});
test('expired session cannot write email metadata; provider failure does not retry', async () => {
  const session = { access_token: 'fictional-account-A', expires_at: 1, user: { id: 'account-A', email_confirmed_at: '2026-01-01', user_metadata: {} } } as Session;
  const original = globalThis.fetch; let calls = 0;
  globalThis.fetch = async () => { calls++; return new Response('{}', { status: 500 }); };
  try { expect(await metadataSync(session, 'en-US')).toBe(false); expect(calls).toBe(0); session.expires_at = Date.now() / 1000 + 3600; expect(await metadataSync(session, 'en-US')).toBe(false); expect(calls).toBe(1); }
  finally { globalThis.fetch = original; }
});
test('stale SDK locale does not skip an actor-bound server preference update', async () => {
  const session = { access_token: 'fictional-account-A', expires_at: Date.now() / 1000 + 3600, user: { id: 'account-A', email_confirmed_at: '2026-01-01', user_metadata: { locale: 'en-US' } } } as Session;
  const original = globalThis.fetch; let storedLocale = 'vi-VN', calls = 0;
  globalThis.fetch = async (_input, init) => { calls++; storedLocale = JSON.parse(String(init?.body)).data.locale; return new Response(JSON.stringify({ id: 'account-A' }), { status: 200 }); };
  try { expect(await metadataSync(session, 'en-US')).toBe(true); expect(calls).toBe(1); expect(storedLocale).toBe('en-US'); }
  finally { globalThis.fetch = original; }
});
for (const device of ['iphone','pixel-10']) test(`${device} learner email choice survives resend and an 8-digit code is sent intact`, async ({ page }) => {
  await page.route('https://*.supabase.co/**', route => route.abort());
  await page.route(`${origin}/**`, route => route.fulfill({ json: {} }));
  let otpRequests = 0, code = '';
  await page.route(`${origin}/auth/v1/otp**`, route => {
    otpRequests++;
    expect(route.request().postDataJSON().data).toEqual({ locale: 'en-US' });
    expect(new URL(route.request().url()).searchParams.get('redirect_to')).toBe(`${new URL(page.url()).origin}/auth/callback?email_locale=en-US`);
    return route.fulfill({ json: {} });
  });
  await page.route(`${origin}/auth/v1/verify`, route => { code = route.request().postDataJSON().token; return route.fulfill({ status:400,json:{ error:'invalid_grant',error_description:'Fictional invalid code' } }); });
  await page.goto(`/?mode=review&device=${device}`);
  await page.getByRole('button',{name:'Tạo tài khoản',exact:true}).click();
  await page.getByLabel('Ngôn ngữ email / Email language').selectOption('en-US');
  await page.getByLabel('Địa chỉ email').fill('fixture@example.test');
  await page.getByRole('button',{name:'Gửi email xác minh',exact:true}).click();
  await expect(page.getByLabel('Mã xác minh')).toBeVisible();
  await page.getByRole('button',{name:'Gửi lại email',exact:true}).click();
  await expect(page.getByRole('status')).toContainText('mới đã được gửi');
  await page.getByLabel('Mã xác minh').fill('12345678');
  await page.getByRole('button',{name:'Xác minh email',exact:true}).click();
  await expect(page.getByRole('alert')).toContainText('Mã không hợp lệ');
  expect(code).toBe('12345678'); expect(otpRequests).toBe(2);
});
