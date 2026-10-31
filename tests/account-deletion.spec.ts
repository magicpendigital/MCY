import { expect, test, type Page } from "@playwright/test";
import { CONSENT_POLICY_VERSIONS, emptyConsentState } from "../src/backend/learnerData";

// Fictional signed-in learner against the isolated .invalid backend. This exercises the
// shared client code path; it is not evidence about the real staging function.
const origin = "https://mcy-playwright.invalid";
const key = "sb-mcy-playwright-auth-token";
const A = "11111111-1111-4111-8111-111111111111";
const session = {
  access_token: "fictional-deletion-a", refresh_token: "fictional-refresh", token_type: "bearer",
  expires_at: Math.floor(Date.now() / 1000) + 3600, expires_in: 3600,
  user: { id: A, email: "deletion-a@example.test", aud: "authenticated", role: "authenticated", email_confirmed_at: "2026-01-01T00:00:00Z", app_metadata: {}, user_metadata: {}, identities: [], created_at: "2026-01-01T00:00:00Z" },
};

async function backend(page: Page, deleteResponse: { status: number; json?: unknown }) {
  const deletes: Record<string, unknown>[] = [];
  const unexpected: string[] = [];
  await page.addInitScript(({ key, value }) => { if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify(value)); }, { key, value: session });
  await page.route("https://*.supabase.co/**", route => { unexpected.push("forbidden-staging-host"); return route.abort("blockedbyclient"); });
  await page.route(origin + "/**", async route => {
    const request = route.request(), pathname = new URL(request.url()).pathname;
    if (pathname.endsWith("/profiles")) return route.fulfill({ json: { user_id: A, display_name: "Fixture A", locale: "vi-VN", body_display_preference: "neutral" } });
    if (pathname.endsWith("/get_my_consent_state")) return route.fulfill({ json: { ...emptyConsentState, terms: true, privacy: true, wellbeing_data: true } });
    if (pathname.endsWith("/get_my_consent_policy_versions")) return route.fulfill({ json: CONSENT_POLICY_VERSIONS });
    if (pathname.endsWith("/checkins") || pathname.endsWith("/checkin_observations")) return route.fulfill({ json: [] });
    if (pathname.endsWith("/user")) return route.fulfill({ json: session.user });
    if (pathname.endsWith("/logout")) return route.fulfill({ status: 204, body: "" });
    if (pathname.endsWith("/owner-control-plane")) return route.fulfill({ status: 403, json: { error: "content_review_access_required" } });
    if (pathname.endsWith("/teacher-collaboration")) return route.fulfill({ status: 404, json: { error: "collaboration_unavailable" } });
    if (pathname.endsWith("/mcy-ai-assistant")) return route.fulfill({ json: { available: false, contractVersion: "reviewed-practice-1" } });
    if (pathname.endsWith("/delete_my_account")) {
      deletes.push(request.postDataJSON());
      return route.fulfill(deleteResponse.json === undefined ? { status: deleteResponse.status, body: "" } : { status: deleteResponse.status, json: deleteResponse.json });
    }
    unexpected.push(pathname);
    return route.fulfill({ status: 500, json: { message: "Unexpected fixture request" } });
  });
  return { deletes, unexpected };
}

async function openSecurity(page: Page) {
  await page.goto("/?mode=web");
  await page.locator('[data-testid="flow-fixed-footer"]').getByRole("button", { name: "Cá nhân", exact: true }).click();
  await expect(page.locator(".mcy-account-home h1")).toHaveText("Chào, Fixture A.");
  await page.getByRole("button", { name: /Bảo mật tài khoản/ }).click();
  await expect(page.getByRole("button", { name: "Xóa tài khoản và dữ liệu" })).toBeVisible();
}

test("a signed-in learner confirms by typing XÓA and the account is deleted", async ({ page }) => {
  const fixture = await backend(page, { status: 204 });
  await openSecurity(page);
  await page.getByRole("button", { name: "Xóa tài khoản và dữ liệu" }).click();
  const confirm = page.getByRole("button", { name: "Xóa vĩnh viễn" });
  await expect(confirm).toBeDisabled();
  const word = page.getByLabel("Gõ XÓA để xác nhận");
  await word.fill("xin");
  await expect(confirm).toBeDisabled();
  await word.fill("xóa");
  await expect(confirm).toBeEnabled();
  await confirm.click();
  await expect(page.getByRole("status")).toContainText("Đã xóa tài khoản và dữ liệu của bạn");
  expect(fixture.deletes).toEqual([{ p_confirmation: "DELETE_MY_ACCOUNT" }]);
  await expect(page.getByRole("button", { name: "Xóa tài khoản và dữ liệu" })).toHaveCount(0);
  expect(fixture.unexpected).toEqual([]);
});

test("a staff account is told to contact the Owner and stays signed in", async ({ page }) => {
  const fixture = await backend(page, { status: 403, json: { code: "42501", message: "Accounts with a staff role are deleted by the Owner" } });
  await openSecurity(page);
  await page.getByRole("button", { name: "Xóa tài khoản và dữ liệu" }).click();
  await page.getByLabel("Gõ XÓA để xác nhận").fill("XÓA");
  await page.getByRole("button", { name: "Xóa vĩnh viễn" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "chỉ Owner xóa được" }).first()).toBeVisible();
  expect(fixture.deletes).toHaveLength(1);
  await page.getByRole("button", { name: "Giữ tài khoản" }).click();
  await expect(page.getByRole("button", { name: "Xóa tài khoản và dữ liệu" })).toBeVisible();
});

test("a network failure keeps the account and shows the web fallback", async ({ page }) => {
  const fixture = await backend(page, { status: 500, json: { message: "fictional outage" } });
  await openSecurity(page);
  await page.getByRole("button", { name: "Xóa tài khoản và dữ liệu" }).click();
  await page.getByLabel("Gõ XÓA để xác nhận").fill("XOA");
  await page.getByRole("button", { name: "Xóa vĩnh viễn" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "Chưa xóa được tài khoản" }).first()).toBeVisible();
  await page.getByRole("button", { name: "Giữ tài khoản" }).click();
  await expect(page.getByRole("link", { name: "Trang yêu cầu xóa tài khoản trên web" })).toHaveAttribute("href", "https://motchutyoga.magicpendigital.com/delete-account.html");
  expect(fixture.deletes).toHaveLength(1);
});

test("public legal pages exist and explain deletion in the app and on the web", async ({ page }) => {
  for (const [path, heading] of [["/privacy.html", "Chính sách quyền riêng tư"], ["/terms.html", "Điều khoản sử dụng"], ["/delete-account.html", "Xóa tài khoản và dữ liệu"]] as const) {
    const response = await page.request.get(path);
    expect(response.status(), path).toBe(200);
    expect(await response.text()).toContain(`<h1>${heading}</h1>`);
  }
  await page.goto("/delete-account.html");
  await expect(page.getByText("Cá nhân → Bảo mật tài khoản")).toBeVisible();
  await expect(page.getByRole("link", { name: "Chính sách quyền riêng tư" })).toHaveAttribute("href", "/privacy.html");
});
