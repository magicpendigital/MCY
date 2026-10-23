import { expect, test, type Page } from "@playwright/test";
import { CONSENT_POLICY_VERSIONS, emptyConsentState } from "../src/backend/learnerData";

// A stored session must survive a start where the first requests fail (radio not ready after a
// Recent/icon reopen): the app keeps the session, says it is restoring, retries and then opens.
// Fictional learner against the isolated .invalid backend; not evidence about a physical device.
const origin = "https://mcy-playwright.invalid";
const key = "sb-mcy-playwright-auth-token";
const A = "11111111-1111-4111-8111-111111111111";
const session = {
  access_token: "fictional-restore-a", refresh_token: "fictional-refresh", token_type: "bearer",
  expires_at: Math.floor(Date.now() / 1000) + 3600, expires_in: 3600,
  user: { id: A, email: "restore-a@example.test", aud: "authenticated", role: "authenticated", email_confirmed_at: "2026-01-01T00:00:00Z", app_metadata: {}, user_metadata: {}, identities: [], created_at: "2026-01-01T00:00:00Z" },
};

async function backend(page: Page, failuresBeforeSuccess: number) {
  let profileCalls = 0;
  let failing = failuresBeforeSuccess;
  await page.addInitScript(({ key, value }) => { if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify(value)); }, { key, value: session });
  await page.route("https://*.supabase.co/**", route => route.abort("blockedbyclient"));
  await page.route(origin + "/**", async route => {
    const pathname = new URL(route.request().url()).pathname;
    if (pathname.endsWith("/profiles")) {
      profileCalls += 1;
      if (failing > 0) { failing -= 1; return route.fulfill({ status: 503, json: { message: "fictional radio not ready" } }); }
      return route.fulfill({ json: { user_id: A, display_name: "Restore A", locale: "vi-VN", body_display_preference: "neutral" } });
    }
    if (pathname.endsWith("/get_my_consent_state")) return route.fulfill({ json: { ...emptyConsentState, terms: true, privacy: true, wellbeing_data: true } });
    if (pathname.endsWith("/get_my_consent_policy_versions")) return route.fulfill({ json: CONSENT_POLICY_VERSIONS });
    if (pathname.endsWith("/checkins") || pathname.endsWith("/checkin_observations")) return route.fulfill({ json: [] });
    if (pathname.endsWith("/user")) return route.fulfill({ json: session.user });
    if (pathname.endsWith("/mcy-ai-assistant")) return route.fulfill({ json: { available: false, contractVersion: "reviewed-practice-1" } });
    return route.fulfill({ status: 500, json: { message: "Unexpected fixture request" } });
  });
  return { calls: () => profileCalls, recover: () => { failing = 0; } };
}
const stored = (page: Page) => page.evaluate(k => Boolean(localStorage.getItem(k)), key);
const leftWelcome = (page: Page) => expect(page.getByRole("button", { name: "Trải nghiệm thử" })).toHaveCount(0, { timeout: 20_000 });

test("a stored session survives early request failures and the app opens after automatic retries", async ({ page }) => {
  test.setTimeout(45_000);
  const fixture = await backend(page, 2);
  await page.goto("/?mode=web");
  await expect(page.getByRole("status").filter({ hasText: "Đang khôi phục phiên đăng nhập" })).toBeVisible();
  await expect(page.getByRole("alert")).toHaveCount(0);
  expect(await stored(page)).toBe(true);
  await leftWelcome(page);
  expect(fixture.calls()).toBeGreaterThanOrEqual(3);
  expect(await stored(page)).toBe(true);
});

test("when retries are exhausted the user sees the session is kept and can retry", async ({ page }) => {
  test.setTimeout(120_000);
  const fixture = await backend(page, 100);
  await page.goto("/?mode=web");
  const alert = page.getByRole("alert").filter({ hasText: "Phiên đăng nhập của bạn vẫn được giữ trên máy" });
  await expect(alert).toBeVisible({ timeout: 75_000 });
  expect(await stored(page)).toBe(true);
  fixture.recover();
  await alert.getByRole("button", { name: "Thử lại" }).click();
  await leftWelcome(page);
  expect(await stored(page)).toBe(true);
});

test("a first-time guest never sees restoration messages", async ({ page }) => {
  await page.route("https://*.supabase.co/**", route => route.abort("blockedbyclient"));
  await page.goto("/?mode=web");
  await expect(page.getByRole("button", { name: "Trải nghiệm thử" })).toBeVisible();
  await expect(page.locator(".mcy-restore-note")).toHaveCount(0);
});
