import { expect, test, type Page } from "@playwright/test";
import { authCallbackDestination, authRedirectForWorkspace, isWebAuthCallback } from "../src/backend/authRouting";

const authOrigin = "https://mcy-playwright.invalid";
const userId = "11111111-1111-4111-8111-111111111111";
const session = () => ({ access_token: "fictional-callback-token", refresh_token: "fictional-callback-refresh", token_type: "bearer", expires_in: 3600,
  expires_at: Math.floor(Date.now() / 1000) + 3600, user: { id: userId, aud: "authenticated", role: "authenticated", email: "owner@example.test",
    email_confirmed_at: "2026-09-01T00:00:00Z", app_metadata: { provider: "email", providers: ["email"] }, user_metadata: {}, identities: [], created_at: "2026-09-01T00:00:00Z" } });
const config = { enabled: false, model_id: "", system_prompt: "Fictional fixture", temperature: 0.3, max_output_tokens: 320, per_user_daily_limit: 10, global_daily_limit: 100, version_no: 1 };

async function isolate(page: Page) {
  await page.route("https://*.supabase.co/**", route => route.abort("blockedbyclient"));
  await page.route(`${authOrigin}/**`, route => route.fulfill({ status: 503, json: { error: "fixture_unavailable" } }));
}

test("callback destinations are fixed screens and preserve existing native deep links", () => {
  expect(authRedirectForWorkspace("https://motchutyoga.magicpendigital.com/auth/callback", "owner")).toBe("https://motchutyoga.magicpendigital.com/auth/callback?workspace=owner");
  expect(authRedirectForWorkspace("motchutyoga://auth/callback", "learner")).toBe("motchutyoga://auth/callback");
  expect(authRedirectForWorkspace("motchutyoga-mcydebug://auth/callback", "teacher")).toBe("motchutyoga-mcydebug://auth/callback");
  expect(authCallbackDestination("?workspace=owner&next=https://evil.invalid")).toBe("/?workspace=owner");
  expect(authCallbackDestination("?workspace=https://evil.invalid&next=//evil.invalid")).toBe("/");
  expect(isWebAuthCallback("/", "?error_code=otp_expired", "")).toBe(true);
  expect(isWebAuthCallback("/auth/callback", "", "")).toBe(true);
  expect(isWebAuthCallback("/", "?workspace=owner", "")).toBe(false);
});

test("Owner email request keeps the same origin, Owner callback and no account creation", async ({ page }) => {
  await isolate(page);
  let redirect = ""; let requests = 0;
  await page.route(`${authOrigin}/auth/v1/otp**`, route => {
    requests++;
    redirect = new URL(route.request().url()).searchParams.get("redirect_to") ?? "";
    expect(route.request().postDataJSON().create_user).toBe(false);
    return route.fulfill({ json: { message_id: "fictional-auth-mail" } });
  });
  await page.goto("/?workspace=owner");
  await page.getByLabel("Ngôn ngữ email / Email language").selectOption("vi-VN");
  await page.getByLabel("Email Owner").fill("owner@example.test");
  await page.getByRole("button", { name: "Gửi liên kết xác minh" }).click();
  await expect(page.getByRole("status")).toContainText("trở lại workspace Owner");
  expect(redirect).toBe(`${new URL(page.url()).origin}/auth/callback?workspace=owner&email_locale=vi-VN`);
  expect(requests).toBe(1);
});

for (const failure of [
  { status: 429, code: "over_email_send_rate_limit", expected: "đã chạm giới hạn gửi email xác minh" },
  { status: 500, code: "unknown_private_provider_error", expected: "Owner cần kiểm tra dịch vụ đăng nhập" },
]) test(`Owner email failure ${failure.code} has safe actionable copy without retry`, async ({ page }) => {
  await isolate(page);
  let requests = 0;
  await page.route(`${authOrigin}/auth/v1/otp**`, route => {
    requests++;
    return route.fulfill({ status: failure.status, headers: { "x-supabase-api-version": "2024-01-01", "access-control-expose-headers": "x-supabase-api-version" }, json: { code: failure.code, msg: "Private provider response secret@example.test token=fictional-secret" } });
  });
  await page.goto("/?workspace=owner");
  await page.getByLabel("Email Owner").fill("owner@example.test");
  await page.getByRole("button", { name: "Gửi liên kết xác minh" }).click();
  await expect(page.getByRole("alert")).toContainText(failure.expected);
  await expect(page.getByRole("alert")).not.toContainText("Private provider response");
  await expect(page.getByLabel("Email Owner")).toHaveValue("owner@example.test");
  await expect(page.getByRole("button", { name: "Gửi liên kết xác minh" })).toBeEnabled();
  expect(requests).toBe(1);
});

test("real SDK completes one PKCE exchange, stores email locale under the initiating token and returns to Owner before learner data hydration", async ({ page }) => {
  await isolate(page);
  await page.addInitScript(() => localStorage.setItem("sb-mcy-playwright-auth-token-code-verifier", JSON.stringify("fictional-code-verifier")));
  let exchanges = 0; let ownerReads = 0; let preferenceWrites = 0; const learnerReads: string[] = [];
  await page.route(`${authOrigin}/auth/v1/user`, route => {
    expect(route.request().method()).toBe("PUT");
    expect(route.request().headers().authorization).toBe("Bearer fictional-callback-token");
    expect(route.request().postDataJSON()).toEqual({ data: { locale: "en-US" } });
    preferenceWrites++;
    return route.fulfill({ json: session().user });
  });
  await page.route(`${authOrigin}/auth/v1/token**`, route => {
    exchanges++;
    expect(new URL(route.request().url()).searchParams.get("grant_type")).toBe("pkce");
    expect(route.request().postDataJSON()).toMatchObject({ auth_code: "fictional-code", code_verifier: "fictional-code-verifier" });
    return route.fulfill({ json: session() });
  });
  await page.route(`${authOrigin}/rest/v1/**`, route => { learnerReads.push(new URL(route.request().url()).pathname); return route.fulfill({ json: [] }); });
  await page.route(`${authOrigin}/functions/v1/owner-control-plane`, route => {
    ownerReads++;
    expect(route.request().postDataJSON().action).toBe("read_ai");
    return route.fulfill({ json: { config, models: [], provider: "openrouter", providerKeyConfigured: true, spendControlApproved: false, enableGateOpen: false, environment: "staging" } });
  });
  await page.goto("/auth/callback?workspace=owner&email_locale=en-US&code=fictional-code&next=https://evil.invalid");
  await expect(page).toHaveURL(/\/\?workspace=owner$/);
  await expect(page.getByRole("button", { name: "Duyệt nội dung", exact: true })).toBeVisible();
  await expect(page.getByLabel("Email Owner")).toHaveCount(0);
  expect(exchanges).toBe(1); expect(preferenceWrites).toBe(1); expect(ownerReads).toBeGreaterThan(0); expect(learnerReads).toEqual([]);
});

test("missing verifier cannot treat an older session as the new callback's success", async ({ page }) => {
  await isolate(page);
  await page.addInitScript(value => localStorage.setItem("sb-mcy-playwright-auth-token", JSON.stringify(value)), session());
  let exchanges = 0; let reads = 0;
  await page.route(`${authOrigin}/auth/v1/token**`, route => { exchanges++; return route.fulfill({ json: session() }); });
  await page.route(`${authOrigin}/functions/v1/**`, route => { reads++; return route.fulfill({ json: {} }); });
  await page.goto("/auth/callback?workspace=owner&code=fictional-wrong-origin");
  await expect(page.getByRole("alert")).toContainText("không khớp phiên đăng nhập");
  expect(new URL(page.url()).searchParams.has("code")).toBe(false);
  await expect(page.getByRole("link", { name: "Quay lại trang đăng nhập" })).toHaveAttribute("href", "/?workspace=owner");
  expect(exchanges).toBe(0); expect(reads).toBe(0);
});

test("expired root callback displays a safe error and clears provider text and auth URL parameters", async ({ page }) => {
  await isolate(page);
  await page.goto("/?error=access_denied&error_code=otp_expired&error_description=PROVIDER_PRIVATE_TEXT#access_token=fictional-secret");
  await expect(page.getByRole("alert")).toContainText("hết hạn");
  await expect(page.locator("body")).not.toContainText("PROVIDER_PRIVATE_TEXT");
  await expect(page).toHaveURL(/\/auth\/callback$/);
  await expect(page.getByRole("link", { name: "Đăng nhập Owner", exact: true })).toHaveAttribute("href", "/?workspace=owner");
});

test("denied PKCE exchange is not retried and never opens Owner controls", async ({ page }) => {
  await isolate(page);
  await page.addInitScript(() => localStorage.setItem("sb-mcy-playwright-auth-token-code-verifier", JSON.stringify("fictional-code-verifier")));
  let exchanges = 0;
  await page.route(`${authOrigin}/auth/v1/token**`, route => { exchanges++; return route.fulfill({ status: 400, json: { error: "invalid_grant", error_description: "PROVIDER_PRIVATE_TEXT" } }); });
  await page.goto("/auth/callback?workspace=owner&code=fictional-expired-code");
  await expect(page.getByRole("alert")).toContainText("yêu cầu email mới");
  await expect(page.locator("body")).not.toContainText("PROVIDER_PRIVATE_TEXT");
  await expect(page.getByRole("button", { name: "Duyệt nội dung" })).toHaveCount(0);
  expect(exchanges).toBe(1); expect(new URL(page.url()).searchParams.has("code")).toBe(false);
});

test("a valid login still needs server Owner authorization", async ({ page }) => {
  await isolate(page);
  await page.addInitScript(() => localStorage.setItem("sb-mcy-playwright-auth-token-code-verifier", JSON.stringify("fictional-code-verifier")));
  await page.route(`${authOrigin}/auth/v1/token**`, route => route.fulfill({ json: session() }));
  await page.route(`${authOrigin}/functions/v1/owner-control-plane`, route => route.fulfill({ status: 403, json: { error: "owner_access_required" } }));
  await page.goto("/auth/callback?workspace=owner&code=fictional-code");
  await expect(page).toHaveURL(/\/\?workspace=owner$/);
  await expect(page.getByText("Tài khoản này chưa được cấp quyền Owner.", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Duyệt nội dung" })).toHaveCount(0);
});

test("ambiguous callback codes fail without exchange or an external return URL", async ({ page }) => {
  await isolate(page);
  let requests = 0;
  await page.route(`${authOrigin}/**`, route => { requests++; return route.fulfill({ json: {} }); });
  await page.goto("/auth/callback?workspace=owner&code=one&code=two&next=//evil.invalid");
  await expect(page.getByRole("alert")).toContainText("không hợp lệ");
  await expect(page).toHaveURL(/\/auth\/callback\?workspace=owner$/);
  expect(requests).toBe(0);
});
