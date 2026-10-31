import { expect, test, type Page, type Route } from "@playwright/test";
import { CONSENT_POLICY_VERSIONS, emptyConsentState } from "../src/backend/learnerData";
import { readingUnitCandidates } from "../supabase/functions/_shared/readingUnitCandidates";

// Fictional signed-in account against the isolated .invalid backend. It exercises the in-app Preview
// (profile entry, list, reader, image states); it is not evidence about the real Edge Function or storage.
const origin = "https://mcy-playwright.invalid";
const endpoint = `${origin}/functions/v1/owner-control-plane`;
const key = "sb-mcy-playwright-auth-token";
const A = "33333333-3333-4333-8333-333333333333";
const session = {
  access_token: "fictional-preview-a", refresh_token: "fictional-refresh", token_type: "bearer",
  expires_at: Math.floor(Date.now() / 1000) + 3600, expires_in: 3600,
  user: { id: A, email: "preview-a@example.test", aud: "authenticated", role: "authenticated", email_confirmed_at: "2026-01-01T00:00:00Z", app_metadata: {}, user_metadata: {}, identities: [], created_at: "2026-01-01T00:00:00Z" },
};
const png = Buffer.from("UklGRiQAAABXRUJQVlA4IBgAAABQAQCdASoBAAEAAUAmJaQABYwAAP6igAA=", "base64");
const blocked = readingUnitCandidates.find(c => c.unit.media.every(m => m.status === "identity_blocked"))!;
const drawn = readingUnitCandidates.find(c => c.unit.media.every(m => m.status === "draft_present"))!;

const listItem = (c: typeof drawn, decision = "pending") => ({ id: c.id, version: c.version, title: c.title, decision, revision: 0, steps: c.unit.steps.length, images: { present: c.unit.media.filter(m => m.status === "draft_present").length, total: c.unit.media.length } });
const unitBody = (c: typeof drawn, decision = "pending", withUrls = true) => ({
  unit: { id: c.id, version: c.version, title: c.title, decision, revision: 0, content: c.unit },
  mediaUrls: withUrls ? Object.fromEntries(c.unit.media.filter(m => m.status === "draft_present").map(m => [m.id, `https://signed.invalid/${m.sha256}.webp?token=fictional`])) : {},
  published: false,
});

type Review = (body: Record<string, unknown>, route: Route) => Promise<unknown>;
async function backend(page: Page, review: Review) {
  const calls: Record<string, unknown>[] = [];
  const unexpected: string[] = [];
  await page.addInitScript(({ key, value }) => { if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify(value)); }, { key, value: session });
  await page.route("https://*.supabase.co/**", route => { unexpected.push("forbidden-staging-host"); return route.abort("blockedbyclient"); });
  await page.route("https://signed.invalid/**", route => route.fulfill({ status: 200, contentType: "image/webp", body: png }));
  await page.route(origin + "/**", async route => {
    const request = route.request(), pathname = new URL(request.url()).pathname;
    if (pathname.endsWith("/profiles")) return route.fulfill({ json: { user_id: A, display_name: "Preview A", locale: "vi-VN", body_display_preference: "neutral" } });
    if (pathname.endsWith("/get_my_consent_state")) return route.fulfill({ json: { ...emptyConsentState, terms: true, privacy: true, wellbeing_data: true } });
    if (pathname.endsWith("/get_my_consent_policy_versions")) return route.fulfill({ json: CONSENT_POLICY_VERSIONS });
    if (pathname.endsWith("/checkins") || pathname.endsWith("/checkin_observations")) return route.fulfill({ json: [] });
    if (pathname.endsWith("/user")) return route.fulfill({ json: session.user });
    if (pathname.endsWith("/mcy-ai-assistant")) return route.fulfill({ json: { available: false, contractVersion: "reviewed-practice-1" } });
    if (pathname.endsWith("/teacher-collaboration")) return route.fulfill({ status: 404, json: { error: "collaboration_unavailable" } });
    if (request.url() === endpoint) {
      expect(request.headers().authorization).toBe("Bearer fictional-preview-a");
      const body = request.postDataJSON();
      calls.push(body);
      return review(body, route);
    }
    unexpected.push(pathname);
    return route.fulfill({ status: 500, json: { message: "Unexpected fixture request" } });
  });
  return { calls, unexpected };
}
const reply = (route: Route, status: number, body: unknown) => route.fulfill({ status, json: body });
async function openProfile(page: Page) {
  await page.goto("/?mode=web");
  await page.locator('[data-testid="flow-fixed-footer"]').getByRole("button", { name: "Cá nhân", exact: true }).click();
  await expect(page.locator(".mcy-account-home h1")).toHaveText("Chào, Preview A.");
}

test("a reviewer opens the illustrated reading units as Preview, with real images and honest blocked slots", async ({ page }) => {
  const fixture = await backend(page, (body, route) => body.candidateId
    ? reply(route, 200, unitBody(body.candidateId === blocked.id ? blocked : drawn))
    : reply(route, 200, { units: [listItem(drawn), listItem(blocked)], published: false }));
  await openProfile(page);
  await page.getByRole("button", { name: /Xem trước nội dung/ }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Bài đọc có hình" })).toBeVisible();
  await expect(page.locator(".mcy-rp-row")).toHaveCount(2);
  await expect(page.locator(".mcy-rp-row .mcy-tag").first()).toHaveText("PREVIEW · CHƯA DUYỆT");

  await page.locator(".mcy-rp-row", { hasText: drawn.title }).click();
  await expect(page.getByRole("heading", { level: 1, name: drawn.title })).toBeVisible();
  await expect(page.locator(".mcy-rp-badge")).toHaveText("PREVIEW · CHƯA DUYỆT");
  await expect(page.locator(".mcy-rp-notice")).toContainText("học viên chưa thấy");
  await expect(page.getByRole("heading", { name: "Dấu hiệu dừng" })).toBeVisible();
  // The overview shows no step; each step then opens on its own screen with one stop bar and a progress bar.
  await expect(page.locator(".mcy-rp-steps > li")).toHaveCount(0);
  await page.getByRole("button", { name: new RegExp(`Bắt đầu · bước 1/${drawn.unit.steps.length}`) }).click();
  await expect(page.locator(".mcy-rp-steps > li")).toHaveCount(1);
  await expect(page.locator(".mcy-rp-steps .mcy-tag")).toHaveText(`BƯỚC 1 / ${drawn.unit.steps.length}`);
  await expect(page.getByRole("progressbar", { name: "Tiến độ bài đọc" })).toHaveAttribute("aria-valuenow", "1");
  await expect(page.locator(".mcy-rp-stopbar")).toHaveCount(1);
  const first = page.locator(".mcy-rp-figure img").first();
  await expect(first).toBeVisible();
  await expect.poll(() => first.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
  await expect(first).toHaveAttribute("alt", drawn.unit.media[0].alt!);
  await expect(page.locator(".mcy-rp-figure figcaption").first()).toContainText("Ảnh AI");
  await expect(page.getByRole("button", { name: /xuất bản/i })).toHaveCount(0);

  // Next moves one step at a time and back returns to the overview from the first step.
  await page.getByRole("button", { name: "Bước 2" }).click();
  await expect(page.locator(".mcy-rp-steps .mcy-tag")).toHaveText(`BƯỚC 2 / ${drawn.unit.steps.length}`);
  await expect(page.getByRole("progressbar", { name: "Tiến độ bài đọc" })).toHaveAttribute("aria-valuenow", "2");
  await page.getByRole("button", { name: "Bước trước" }).click();
  await page.getByRole("button", { name: "Tổng quan" }).click();
  await expect(page.getByRole("heading", { name: "Dấu hiệu dừng" })).toBeVisible();

  await page.getByRole("button", { name: "← Tất cả bài đọc" }).click();
  await page.locator(".mcy-rp-row", { hasText: blocked.title }).click();
  await expect(page.getByRole("heading", { name: "Điểm còn chặn theo bản biên tập" })).toBeVisible();
  await page.getByRole("button", { name: /Bắt đầu · bước 1/ }).click();
  await expect(page.locator(".mcy-rp-figure img")).toHaveCount(0);
  await expect(page.locator(".mcy-rp-figure-empty").first()).toContainText("chưa xác định đúng biến thể");

  expect(fixture.calls.map(c => c.action)).toEqual(["read_reading_preview", "read_reading_preview", "read_reading_preview"]);
  expect(fixture.calls[0]).toEqual({ action: "read_reading_preview" });
  expect(fixture.calls[1]).toEqual({ action: "read_reading_preview", candidateId: drawn.id });
  expect(fixture.unexpected).toEqual([]);
});

test("an approved unit is labelled approved but not published, and a missing upload or broken image is stated", async ({ page }) => {
  let withUrls = false;
  await backend(page, (body, route) => body.candidateId
    ? reply(route, 200, unitBody(drawn, "approved", withUrls))
    : reply(route, 200, { units: [listItem(drawn, "approved")], published: false }));
  await openProfile(page);
  await page.getByRole("button", { name: /Xem trước nội dung/ }).click();
  await expect(page.locator(".mcy-rp-row .mcy-tag")).toHaveText("ĐÃ DUYỆT · CHƯA XUẤT BẢN");
  await page.locator(".mcy-rp-row").click();
  await expect(page.locator(".mcy-rp-badge")).toHaveText("ĐÃ DUYỆT · CHƯA XUẤT BẢN");
  await page.getByRole("button", { name: /Bắt đầu · bước 1/ }).click();
  await expect(page.locator(".mcy-rp-figure img")).toHaveCount(0);
  await expect(page.locator(".mcy-rp-figure-empty").first()).toContainText("Ảnh nháp chưa được tải lên kho riêng");

  withUrls = true;
  await page.route("https://signed.invalid/**", route => route.abort("failed"));
  await page.getByRole("button", { name: "← Tất cả bài đọc" }).click();
  await page.locator(".mcy-rp-row").click();
  await page.getByRole("button", { name: /Bắt đầu · bước 1/ }).click();
  await expect(page.locator(".mcy-rp-figure-empty").first()).toContainText("Chưa tải được ảnh");
});

test("an ordinary learner never sees the entry, whether denied or the backend predates the action", async ({ page }) => {
  for (const response of [{ status: 403, body: { error: "content_review_access_required" } }, { status: 400, body: { error: "unsupported_action" } }, { status: 200, body: { units: [], published: false } }]) {
    const fixture = await backend(page, (_body, route) => reply(route, response.status, response.body));
    await openProfile(page);
    await expect(page.getByRole("button", { name: /Bảo mật tài khoản/ })).toBeVisible();
    await expect.poll(() => fixture.calls.length).toBe(1);
    await expect(page.getByRole("button", { name: /Xem trước nội dung/ })).toHaveCount(0);
    expect(fixture.unexpected).toEqual([]);
    await page.unrouteAll({ behavior: "ignoreErrors" });
    await page.goto("about:blank");
  }
});

test("a guest never calls the review function", async ({ page }) => {
  const calls: string[] = [];
  await page.route(origin + "/**", route => { calls.push(route.request().url()); return route.fulfill({ status: 500, json: {} }); });
  await page.goto("/?mode=web");
  await expect(page.getByRole("button", { name: "Trải nghiệm thử" })).toBeVisible();
  await page.waitForTimeout(1500);
  expect(calls.filter(url => url.includes("owner-control-plane"))).toEqual([]);
});
