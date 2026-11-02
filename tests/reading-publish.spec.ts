import { expect, test, type Page, type Route } from "@playwright/test";
import { CONSENT_POLICY_VERSIONS, emptyConsentState } from "../src/backend/learnerData";
import { readingUnitCandidates } from "../supabase/functions/_shared/readingUnitCandidates";

// Fictional reviewer on the isolated .invalid backend: the "Hiển thị cho học viên" screen, its confirmation step and the
// requests it sends. It is not evidence about the real Edge Function, database or storage.
const origin = "https://mcy-playwright.invalid";
const endpoint = `${origin}/functions/v1/owner-control-plane`;
const key = "sb-mcy-playwright-auth-token";
const A = "33333333-3333-4333-8333-333333333333";
const session = {
  access_token: "fictional-publish-a", refresh_token: "fictional-refresh", token_type: "bearer",
  expires_at: Math.floor(Date.now() / 1000) + 3600, expires_in: 3600,
  user: { id: A, email: "publish-a@example.test", aud: "authenticated", role: "authenticated", email_confirmed_at: "2026-01-01T00:00:00Z", app_metadata: {}, user_metadata: {}, identities: [], created_at: "2026-01-01T00:00:00Z" },
};
const cobra = readingUnitCandidates.find(c => c.id === "reading-cobra")!;
const crow = readingUnitCandidates.find(c => c.id === "reading-low-crow")!;
const unit = (c: typeof cobra, patch: Record<string, unknown> = {}) => ({
  id: c.id, version: c.version, title: c.title, decision: "approved", steps: 5, images: c.id === crow.id ? "none" : "complete",
  switchOn: false, textOnlyMode: "inherit", show: false, reason: "switch_off", contentReady: true, ...patch,
});

async function backend(page: Page, state: { units: ReturnType<typeof unit>[]; defaultTextOnlyAllowed: boolean }, onSet: (body: Record<string, unknown>, route: Route) => Promise<unknown>) {
  const calls: Record<string, unknown>[] = [];
  await page.addInitScript(({ key, value }) => { if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify(value)); }, { key, value: session });
  await page.route("https://*.supabase.co/**", route => route.abort("blockedbyclient"));
  await page.route(origin + "/**", async route => {
    const request = route.request(), pathname = new URL(request.url()).pathname;
    if (pathname.endsWith("/profiles")) return route.fulfill({ json: { user_id: A, display_name: "Publish A", locale: "vi-VN", body_display_preference: "neutral" } });
    if (pathname.endsWith("/get_my_consent_state")) return route.fulfill({ json: { ...emptyConsentState, terms: true, privacy: true, wellbeing_data: true } });
    if (pathname.endsWith("/get_my_consent_policy_versions")) return route.fulfill({ json: CONSENT_POLICY_VERSIONS });
    if (pathname.endsWith("/checkins") || pathname.endsWith("/checkin_observations")) return route.fulfill({ json: [] });
    if (pathname.endsWith("/user")) return route.fulfill({ json: session.user });
    if (pathname.endsWith("/mcy-ai-assistant")) return route.fulfill({ json: { available: false, contractVersion: "reviewed-practice-1" } });
    if (pathname.endsWith("/teacher-collaboration")) return route.fulfill({ status: 404, json: { error: "collaboration_unavailable" } });
    if (request.url() === endpoint) {
      expect(request.headers().authorization).toBe("Bearer fictional-publish-a");
      const body = request.postDataJSON();
      calls.push(body);
      if (body.action === "read_reading_preview") return route.fulfill({ json: { units: [{ id: cobra.id, version: cobra.version, title: cobra.title, decision: "approved", revision: 1, steps: 5, images: { present: 5, total: 5 } }], published: false } });
      if (body.action === "read_reading_publication") return route.fulfill({ json: { units: state.units, defaultTextOnlyAllowed: state.defaultTextOnlyAllowed, canSetDefault: true } });
      return onSet(body, route);
    }
    return route.fulfill({ status: 500, json: { message: "Unexpected fixture request" } });
  });
  return calls;
}
async function open(page: Page) {
  await page.goto("/?mode=web");
  await page.locator('[data-testid="flow-fixed-footer"]').getByRole("button", { name: "Cá nhân", exact: true }).click();
  await expect(page.locator(".mcy-account-home h1")).toHaveText("Chào, Publish A.", { timeout: 30_000 });
  await page.getByRole("button", { name: /Hiển thị cho học viên/ }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Hiển thị cho học viên" })).toBeVisible();
}

test.use({ viewport: { width: 390, height: 844 } });

test("a reviewer sees why units are held, confirms before going public, and can switch a unit back off", async ({ page }) => {
  const state = { units: [unit(cobra), unit(crow, { reason: "needs_images", images: "none" }), unit(readingUnitCandidates.find(c => c.id === "reading-cow-face")!, { decision: "pending", reason: "not_approved" })], defaultTextOnlyAllowed: false };
  const calls = await backend(page, state, async (body, route) => {
    if (body.action === "set_reading_publication" && body.candidateId) {
      const target = state.units.find(u => u.id === body.candidateId)!;
      Object.assign(target, { switchOn: body.visible, show: body.visible === true && target.reason !== "needs_images", reason: body.visible ? "ok" : "switch_off" });
      return route.fulfill({ json: { receipt: { ok: true }, synced: true, shown: [], held: [] } });
    }
    if (body.action === "set_reading_publication") { state.defaultTextOnlyAllowed = body.defaultTextOnlyAllowed as boolean; return route.fulfill({ json: { receipt: { ok: true }, synced: true, shown: [], held: [] } }); }
    return route.fulfill({ status: 400, json: { error: "invalid_request" } });
  });
  await open(page);
  const rows = page.locator(".mcy-rp2-row");
  await expect(rows).toHaveCount(3);
  await expect(page.locator(".mcy-rp2-count")).toHaveText("0 bài đang hiện · 3 bài giữ lại hoặc đang tắt");
  await expect(rows.nth(1)).toContainText("Giữ lại: còn thiếu hình");
  await expect(rows.nth(2).getByRole("switch")).toBeDisabled();

  // Turning a unit on asks first, and sends nothing until the reviewer confirms.
  await rows.nth(0).getByRole("switch").click();
  const dialog = page.getByRole("alertdialog");
  await expect(dialog).toContainText("công khai cho mọi học viên và khách");
  expect(calls.filter(c => c.action === "set_reading_publication")).toHaveLength(0);
  await dialog.getByRole("button", { name: "Để sau" }).click();
  await expect(dialog).toHaveCount(0);
  await rows.nth(0).getByRole("switch").click();
  await dialog.getByRole("button", { name: "Bật cho học viên" }).click();
  await expect(rows.nth(0).getByRole("switch")).toHaveAttribute("aria-checked", "true");
  await expect(rows.nth(0)).toContainText("Đang hiện cho học viên");
  expect(calls.filter(c => c.action === "set_reading_publication")).toEqual([{ action: "set_reading_publication", candidateId: cobra.id, contentVersion: cobra.version, visible: true, textOnlyMode: "inherit" }]);
  await expect(page.locator(".mcy-rp2-count")).toHaveText("1 bài đang hiện · 2 bài giữ lại hoặc đang tắt");

  // Switching off needs no confirmation.
  await rows.nth(0).getByRole("switch").click();
  await expect(rows.nth(0).getByRole("switch")).toHaveAttribute("aria-checked", "false");
  expect(calls.filter(c => c.action === "set_reading_publication").at(-1)).toMatchObject({ visible: false });
});

test("the Owner default for text-only units and the per-unit override are sent as explicit choices", async ({ page }) => {
  const state = { units: [unit(crow, { reason: "needs_images", images: "none" })], defaultTextOnlyAllowed: false };
  const calls = await backend(page, state, async (body, route) => {
    if (body.candidateId === undefined) state.defaultTextOnlyAllowed = body.defaultTextOnlyAllowed as boolean;
    else Object.assign(state.units[0], { textOnlyMode: body.textOnlyMode });
    return route.fulfill({ json: { receipt: { ok: true }, synced: false } });
  });
  await open(page);
  await page.getByRole("radio", { name: /Cho phép hiện chỉ chữ/ }).click();
  await expect(page.getByRole("alert")).toContainText("chưa đăng được lên cho học viên");
  expect(calls.find(c => c.defaultTextOnlyAllowed !== undefined)).toEqual({ action: "set_reading_publication", defaultTextOnlyAllowed: true });
  await page.getByLabel("Bài này chưa đủ hình").selectOption("require");
  await expect.poll(() => calls.some(c => c.textOnlyMode === "require" && c.visible === false)).toBe(true);
});

test("server refusals are shown in plain words", async ({ page }) => {
  const state = { units: [unit(cobra)], defaultTextOnlyAllowed: false };
  await backend(page, state, (_body, route) => route.fulfill({ status: 409, json: { error: "unit_not_approved" } }));
  await open(page);
  await page.getByRole("switch").click();
  await page.getByRole("alertdialog").getByRole("button", { name: "Bật cho học viên" }).click();
  await expect(page.getByRole("alert")).toContainText("chưa được duyệt ở phiên bản hiện tại");
});
