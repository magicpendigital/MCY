import { expect, test, type Page } from "@playwright/test";
import { CONSENT_POLICY_VERSIONS, emptyConsentState } from "../src/backend/learnerData";

// Fictional learner against the isolated .invalid backend: exercises the client password paths
// (sign-in, wrong password, setting a password). Not evidence about real Supabase Auth behaviour.
const origin = "https://mcy-playwright.invalid";
const key = "sb-mcy-playwright-auth-token";
const A = "11111111-1111-4111-8111-111111111111";
const user = { id: A, email: "password-a@example.test", aud: "authenticated", role: "authenticated", email_confirmed_at: "2026-01-01T00:00:00Z", app_metadata: {}, user_metadata: {}, identities: [], created_at: "2026-01-01T00:00:00Z" };
const session = { access_token: "fictional-password-a", refresh_token: "fictional-refresh", token_type: "bearer", expires_at: Math.floor(Date.now() / 1000) + 3600, expires_in: 3600, user };

async function backend(page: Page, options: { stored?: boolean; token?: { status: number; json: unknown }; updateUser?: { status: number; json: unknown } } = {}) {
  const tokenBodies: Record<string, unknown>[] = [];
  const tokenUrls: string[] = [];
  const unexpected: string[] = [];
  const userUpdates: Record<string, unknown>[] = [];
  const otpRequests: string[] = [];
  if (options.stored) await page.addInitScript(({ key, value }) => { if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify(value)); }, { key, value: session });
  await page.route("https://*.supabase.co/**", route => route.abort("blockedbyclient"));
  await page.route(origin + "/**", async route => {
    const request = route.request(), pathname = new URL(request.url()).pathname;
    if (pathname.endsWith("/token")) {
      tokenUrls.push(request.url()); if (new URL(request.url()).searchParams.get("grant_type") === "password") tokenBodies.push(request.postDataJSON());
      return route.fulfill(options.token ?? { status: 200, json: session });
    }
    if (pathname.endsWith("/otp")) { otpRequests.push(pathname); return route.fulfill({ json: {} }); }
    if (pathname.endsWith("/user") && request.method() === "PUT") { userUpdates.push(request.postDataJSON()); return route.fulfill(options.updateUser ?? { status: 200, json: user }); }
    if (pathname.endsWith("/user")) return route.fulfill({ json: user });
    if (pathname.endsWith("/profiles")) return route.fulfill({ json: { user_id: A, display_name: "Password A", locale: "vi-VN", body_display_preference: "neutral" } });
    if (pathname.endsWith("/get_my_consent_state")) return route.fulfill({ json: { ...emptyConsentState, terms: true, privacy: true, wellbeing_data: true } });
    if (pathname.endsWith("/get_my_consent_policy_versions")) return route.fulfill({ json: CONSENT_POLICY_VERSIONS });
    if (pathname.endsWith("/checkins") || pathname.endsWith("/checkin_observations")) return route.fulfill({ json: [] });
    if (pathname.endsWith("/mcy-ai-assistant")) return route.fulfill({ json: { available: false, contractVersion: "reviewed-practice-1" } });
    unexpected.push(request.method() + " " + pathname);
    return route.fulfill({ status: 500, json: { message: "Unexpected fixture request" } });
  });
  return { unexpected, tokenBodies, tokenUrls, userUpdates, otpRequests };
}

async function openPasswordLogin(page: Page) {
  await page.goto("/?mode=web");
  await page.getByRole("button", { name: "Đăng nhập", exact: true }).click();
  await page.getByRole("button", { name: "Mật khẩu", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Đăng nhập bằng mật khẩu" })).toBeVisible();
}

test("a learner can sign in with email and password", async ({ page }) => {
  test.setTimeout(90_000);
  const fixture = await backend(page);
  await openPasswordLogin(page);
  await page.getByLabel("Địa chỉ email").fill(user.email);
  await page.getByLabel("Mật khẩu", { exact: true }).fill("a long fictional passphrase");
  await page.getByRole("button", { name: "Đăng nhập", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Đăng nhập bằng mật khẩu" })).toHaveCount(0, { timeout: 45_000 });
  expect(fixture.tokenBodies).toHaveLength(1);
  expect(fixture.tokenBodies[0]).toMatchObject({ email: user.email, password: "a long fictional passphrase" });
  expect(fixture.otpRequests).toEqual([]);
});

test("a wrong password shows a neutral message and keeps the learner signed out", async ({ page }) => {
  const fixture = await backend(page, { token: { status: 400, json: { code: "invalid_credentials", error_code: "invalid_credentials", msg: "Invalid login credentials" } } });
  await openPasswordLogin(page);
  await page.getByLabel("Địa chỉ email").fill(user.email);
  await page.getByLabel("Mật khẩu", { exact: true }).fill("wrong password value");
  await page.getByRole("button", { name: "Đăng nhập", exact: true }).click();
  const alert = page.getByRole("alert").filter({ hasText: "Email hoặc mật khẩu chưa đúng" });
  await expect(alert).toBeVisible();
  await expect(alert).toContainText("mã gửi qua email");
  expect(fixture.tokenBodies).toHaveLength(1);
  expect(await page.evaluate(k => Boolean(localStorage.getItem(k)), key)).toBe(false);
});

test("login offers the method switch, account creation stays email-code only", async ({ page }) => {
  await backend(page);
  await page.goto("/?mode=web");
  await page.getByRole("button", { name: "Tạo tài khoản", exact: true }).click();
  await expect(page.getByRole("button", { name: "Mật khẩu", exact: true })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Gửi email xác minh" })).toBeVisible();
});

test("the email-code method explains that the email carries both a code and a link", async ({ page }) => {
  await backend(page);
  await page.goto("/?mode=web");
  await page.getByRole("button", { name: "Đăng nhập", exact: true }).click();
  await expect(page.getByRole("button", { name: "Mã hoặc liên kết qua email" })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByText("có cả mã và liên kết một lần")).toBeVisible();
});

async function openSecurity(page: Page) {
  await page.goto("/?mode=web");
  await page.locator('[data-testid="flow-fixed-footer"]').getByRole("button", { name: "Cá nhân", exact: true }).click();
  await expect(page.locator(".mcy-account-home h1")).toHaveText("Chào, Password A.");
  await page.getByRole("button", { name: /Bảo mật tài khoản/ }).click();
  await expect(page.getByRole("button", { name: "Lưu mật khẩu" })).toBeVisible();
}

test("a signed-in learner validates and sets a password", async ({ page }) => {
  test.setTimeout(90_000);
  const fixture = await backend(page, { stored: true });
  await openSecurity(page);
  const save = page.getByRole("button", { name: "Lưu mật khẩu" });
  await page.getByLabel("Mật khẩu mới", { exact: true }).fill("short");
  await page.getByLabel("Nhập lại mật khẩu mới").fill("short");
  await save.click();
  await expect(page.getByRole("alert").filter({ hasText: "ít nhất 8 ký tự" })).toBeVisible();
  await page.getByLabel("Mật khẩu mới", { exact: true }).fill("a long fictional passphrase");
  await page.getByLabel("Nhập lại mật khẩu mới").fill("a different passphrase");
  await save.click();
  await expect(page.getByRole("alert").filter({ hasText: "chưa khớp" })).toBeVisible();
  expect(fixture.userUpdates).toEqual([]);
  await page.getByLabel("Nhập lại mật khẩu mới").fill("a long fictional passphrase");
  await save.click();
  await expect(page.getByRole("status").filter({ hasText: "Đã lưu mật khẩu" })).toBeVisible();
  expect(fixture.userUpdates).toHaveLength(1);
  expect(fixture.userUpdates[0]).toMatchObject({ password: "a long fictional passphrase" });
  await expect(page.getByLabel("Mật khẩu mới", { exact: true })).toHaveValue("");
});

test("a server refusal to change the password is explained without leaking details", async ({ page }) => {
  test.setTimeout(90_000);
  await backend(page, { stored: true, updateUser: { status: 422, json: { code: "reauthentication_needed", error_code: "reauthentication_needed", msg: "Password update requires reauthentication" } } });
  await openSecurity(page);
  await page.getByLabel("Mật khẩu mới", { exact: true }).fill("a long fictional passphrase");
  await page.getByLabel("Nhập lại mật khẩu mới").fill("a long fictional passphrase");
  await page.getByRole("button", { name: "Lưu mật khẩu" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "đăng nhập lại bằng mã gửi qua email" })).toBeVisible();
});
