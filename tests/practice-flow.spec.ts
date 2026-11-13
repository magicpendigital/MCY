import { expect, test, type Page, type Route } from "@playwright/test";
import { SESSION } from "./fixtures/practice-harness.mjs";

const actor = "11111111-1111-4111-8111-111111111111";
async function seedSession(page: Page) {
  await page.addInitScript(({ actor }) => localStorage.setItem("sb-mcy-playwright-auth-token", JSON.stringify({ access_token: "fictional-ui-token", refresh_token: "fictional-ui-refresh", token_type: "bearer", expires_at: Math.floor(Date.now() / 1000) + 3600, expires_in: 3600, user: { id: actor, email: "learner@example.test", aud: "authenticated", role: "authenticated", email_confirmed_at: "2026-01-01T00:00:00Z", app_metadata: {}, user_metadata: {}, identities: [], created_at: "2026-01-01T00:00:00Z" } })), { actor });
  await page.route("https://*.supabase.co/**", route => route.abort("blockedbyclient"));
}
async function learner(page: Page, handle: (route: Route, body: any) => Promise<void>, available = true) {
  await seedSession(page);
  await page.route("https://mcy-playwright.invalid/**", async route => {
    const path = new URL(route.request().url()).pathname;
    if (path.endsWith("/mcy-ai-assistant")) {
      const body = route.request().postDataJSON();
      if (body.action === "capability") return route.fulfill({ json: { available, contractVersion: "reviewed-practice-1" } });
      return handle(route, body);
    }
    if (path.endsWith("/profiles")) { const isB = route.request().headers().authorization?.endsWith("fictional-b-token"); return route.fulfill({ json: { id: isB ? "77777777-7777-4777-8777-777777777777" : actor, display_name: isB ? "B fixture" : "UI fixture", locale: "vi-VN", preferences: {} } }); }
    if (path.endsWith("/get_my_consent_state")) return route.fulfill({ json: { terms: true, privacy: true, ai_processing: true, wellbeing_data: false } });
    if (path.endsWith("/get_my_consent_policy_versions")) return route.fulfill({ json: { terms: "terms-review-0.1", privacy: "privacy-review-0.1", ai_processing: "ai-processing-review-1.0" } });
    if (path.endsWith("/checkins")) return route.fulfill({ json: [] });
    if (path.endsWith("/owner-control-plane")) return route.fulfill({ status: 403, json: { error: "content_review_access_required" } });
    // Khám phá asks once for the public reading manifest; a missing file means "nothing published".
    if (path.endsWith("/reading-published/manifest.json") || path.endsWith("/content-published/manifest.json")) return route.fulfill({ status: 404, body: "" });
    if (path.endsWith("/teacher-collaboration")) return route.fulfill({ status: 404, json: { error: "collaboration_unavailable" } });
    throw new Error(`Unmocked fixture request: ${path}`);
  });
}
async function enterPractice(page: Page, query = "?mode=web") {
  await page.goto(`/${query}`);
  await page.getByRole("button", { name: "Bắt đầu check-in", exact: true }).click();
  await page.getByRole("button", { name: "Tiếp: năng lượng và thời gian" }).click();
  await page.getByRole("button", { name: "Chọn buổi hôm nay cùng AI" }).click();
  await expect(page.getByRole("heading", { name: "Một buổi phù hợp với hôm nay." })).toBeVisible();
  await page.getByRole("button", { name: "Nhịp chậm", exact: true }).click();
  await page.getByRole("button", { name: "Nhiều hướng dẫn", exact: true }).click();
  await page.getByRole("button", { name: "Không nằm sàn", exact: true }).click();
}
const choose = (page: Page) => page.getByRole("button", { name: "Chọn buổi từ danh mục đã duyệt" }).click();
const selected = (body: any) => ({ status: "selected", contextRevision: body.context.revision, requestId: body.requestId, plan: SESSION, reason: "5 phút · nhịp chậm · không nằm sàn. Nội dung từ danh mục đã duyệt." });

for (const device of ["iphone", "pixel-10"]) test(`reviewed plan and explicit start/reflection in ${device} simulator`, async ({ page }) => {
  const calls: any[] = [];
  await learner(page, async (route, body) => { calls.push(body); await route.fulfill({ json: selected(body) }); });
  await enterPractice(page, `?mode=review&device=${device}`); await choose(page);
  await expect(page.getByRole("region", { name: "Kế hoạch hôm nay" })).toContainText("Fictional reviewed session");
  await expect(page.getByRole("region", { name: "Kế hoạch hôm nay" })).toContainText("5 phút");
  expect(calls).toHaveLength(1); expect(calls[0].context.floor).toBe("avoid"); expect(calls[0]).not.toHaveProperty("history");
  await page.getByRole("region", { name: "Kế hoạch hôm nay" }).scrollIntoViewIfNeeded();
  await page.mouse.move(0, 0);
  await page.screenshot({ path: `test-results/screenshots/ux-ai/plan-fixture-${device}.png`, animations: "disabled" });
  await page.getByRole("button", { name: "Xác nhận và mở buổi học" }).click();
  await expect(page.getByRole("region", { name: "Nội dung buổi tập" })).toBeVisible();
  expect(calls).toHaveLength(2); expect(calls[1]).toMatchObject({ action: "start_plan", sessionId: SESSION.id, contentVersion: SESSION.version });
  await page.mouse.move(0, 0);
  await page.screenshot({ path: `test-results/screenshots/ux-ai/practice-fixture-${device}.png`, animations: "disabled" });
  await page.getByRole("button", { name: "Tôi đã thực hành · ghi cảm nhận", exact: true }).click();
  await page.getByRole("button", { name: "Khó chịu hơn", exact: true }).click();
  await expect(page.locator(".mcy-alert")).toContainText("không tự gợi bài");
  expect(calls).toHaveLength(2);
});

test("no match and quota failure keep preferences and permit manual browsing without automatic retry", async ({ page }) => {
  let calls = 0;
  await learner(page, async (route, body) => { calls++; if (calls === 1) await route.fulfill({ status: 429, json: { error: "ai_usage_limit_reached" } }); else await route.fulfill({ json: { status: "no_match", contextRevision: body.context.revision } }); });
  await enterPractice(page); await choose(page);
  await expect(page.getByRole("alert")).toContainText("giới hạn lượt");
  await expect(page.getByRole("button", { name: "Nhịp chậm", exact: true })).toHaveAttribute("aria-pressed", "true");
  expect(calls).toBe(1); await choose(page);
  await expect(page.getByRole("status")).toContainText("Chưa có buổi phù hợp"); expect(calls).toBe(2);
  await page.getByRole("button", { name: "Tự chọn trong thư viện", exact: true }).click();
  await expect(page.getByTestId("free-course-catalog")).toBeVisible(); expect(calls).toBe(2);
});

test("late plan is discarded when current preferences change", async ({ page }) => {
  let release: () => void = () => {};
  const delayed = new Promise<void>(resolve => { release = resolve; });
  let received = false;
  await learner(page, async (route, body) => { received = true; await delayed; await route.fulfill({ json: selected(body) }).catch(() => {}); });
  await enterPractice(page); await choose(page); await expect.poll(() => received).toBe(true);
  await page.getByRole("button", { name: "Nhịp vừa", exact: true }).click(); release();
  await expect(page.getByRole("button", { name: "Nhịp vừa", exact: true })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("region", { name: "Kế hoạch hôm nay" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Chọn buổi từ danh mục đã duyệt" })).toBeEnabled();
});

test("account switch invalidates pending plan and clears previous account preferences", async ({ page }) => {
  let release: () => void = () => {}; const delayed = new Promise<void>(resolve => { release = resolve; }); let received = false;
  await learner(page, async (route, body) => { received = true; await delayed; await route.fulfill({ json: selected(body) }).catch(() => {}); });
  await enterPractice(page); await choose(page); await expect.poll(() => received).toBe(true);
  await page.evaluate(() => { const key = "sb-mcy-playwright-auth-token"; const s = JSON.parse(localStorage.getItem(key)!); s.user.id = "77777777-7777-4777-8777-777777777777"; s.user.email = "b@example.test"; s.access_token = "fictional-b-token"; localStorage.setItem(key, JSON.stringify(s)); const channel = new BroadcastChannel(key); channel.postMessage({ event: "SIGNED_IN", session: s }); channel.close(); });
  await expect(page.getByRole("button", { name: "Nhịp chậm", exact: true })).toHaveAttribute("aria-pressed", "false"); release();
  await expect(page.getByRole("region", { name: "Kế hoạch hôm nay" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Nhiều hướng dẫn", exact: true })).toHaveAttribute("aria-pressed", "false");
});

test("consent withdrawal through privacy invalidates pending plan and blocks a new request", async ({ page }) => {
  let release: () => void = () => {}; const delayed = new Promise<void>(resolve => { release = resolve; }); let calls = 0;
  await learner(page, async (route, body) => { calls++; await delayed; await route.fulfill({ json: selected(body) }).catch(() => {}); });
  await page.route("https://mcy-playwright.invalid/rest/v1/rpc/record_my_consent", route => route.fulfill({ json: "99999999-9999-4999-8999-999999999999" }));
  await enterPractice(page); await choose(page); await expect.poll(() => calls).toBe(1);
  await page.getByRole("button", { name: "Quay lại", exact: true }).click();
  // Returning to privacy uses the real app navigation; no state injection.
  await page.getByRole("button", { name: "Quay lại", exact: true }).click();
  await page.locator('.flow-fixed-footer').getByRole("button", { name: "Cá nhân", exact: true }).click();
  await page.getByRole("button", { name: /Quyền riêng tư/ }).click();
  const aiPrivacy = page.locator(".mcy-toggle-row").filter({ hasText: "Dùng check-in với trợ lý AI" });
  await aiPrivacy.getByRole("button", { name: /Rút đồng ý/ }).click();
  await expect(aiPrivacy.getByRole("button", { name: "Đồng ý", exact: true })).toBeVisible(); release();
  await expect(page.getByRole("region", { name: "Kế hoạch hôm nay" })).toHaveCount(0); expect(calls).toBe(1);
  await page.getByRole("button", { name: "Quay lại", exact: true }).click();
  await page.locator('.flow-fixed-footer').getByRole("button", { name: "Hôm nay", exact: true }).click();
  await page.getByRole("button", { name: "Bắt đầu check-in", exact: true }).click();
  await page.getByRole("button", { name: "Chọn buổi hôm nay cùng AI" }).click();
  await expect(page.getByRole("button", { name: "Xem Quyền riêng tư" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Chọn buổi từ danh mục đã duyệt" })).toHaveCount(0); expect(calls).toBe(1);
});

test("stop remains available offline and cannot trigger another model request", async ({ page, context }) => {
  let calls = 0; await learner(page, async (route, body) => { calls++; await route.fulfill({ json: selected(body) }); });
  await enterPractice(page); await choose(page);
  await page.getByRole("button", { name: "Xác nhận và mở buổi học" }).click();
  await expect(page.getByRole("region", { name: "Nội dung buổi tập" })).toBeVisible();
  await context.setOffline(true); await page.getByRole("button", { name: "Dừng tại đây", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Bạn có thể dừng tại đây." })).toBeVisible();
  await expect(page.getByText("Nội dung an toàn này luôn hiện được khi mất mạng.", { exact: false })).toBeVisible();
  await expect(page.getByRole("button", { name: "Chọn buổi từ danh mục đã duyệt" })).toHaveCount(0);
  await expect(page.locator("audio")).toHaveCount(0); expect(calls).toBe(2);
});

test("late consent-save success cannot revoke AI consent of a different account", async ({ page }) => {
  await learner(page, async () => { throw new Error("Unexpected inference"); });
  let release: () => void = () => {}; const delayed = new Promise<void>(resolve => { release = resolve; }); let writes = 0;
  await page.route("https://mcy-playwright.invalid/rest/v1/rpc/record_my_consent", async route => { expect(route.request().headers().authorization).toBe("Bearer fictional-ui-token"); writes++; await delayed; await route.fulfill({ json: "99999999-9999-4999-8999-999999999999" }); });
  await page.goto("/?mode=web"); await page.locator('.flow-fixed-footer').getByRole("button", { name: "Cá nhân", exact: true }).click();
  await page.getByRole("button", { name: /Quyền riêng tư/ }).click();
  const aiPrivacy = page.locator(".mcy-toggle-row").filter({ hasText: "Dùng check-in với trợ lý AI" });
  await aiPrivacy.getByRole("button", { name: /Rút đồng ý/ }).click(); await expect.poll(() => writes).toBe(1);
  await expect(aiPrivacy.getByRole("button", { name: /Rút đồng ý/ })).toBeDisabled();
  await expect(page.getByRole("status")).toContainText("Đang lưu lựa chọn quyền"); expect(writes).toBe(1);
  await page.evaluate(() => { const key = "sb-mcy-playwright-auth-token"; const s = JSON.parse(localStorage.getItem(key)!); s.user.id = "77777777-7777-4777-8777-777777777777"; s.user.email = "b@example.test"; s.access_token = "fictional-b-token"; localStorage.setItem(key, JSON.stringify(s)); const channel = new BroadcastChannel(key); channel.postMessage({ event: "SIGNED_IN", session: s }); channel.close(); });
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem("sb-mcy-playwright-auth-token")!).user.id)).toBe("77777777-7777-4777-8777-777777777777");
  // Wait for new-account hydration before releasing the old account's RPC reply.
  await expect(page.locator(".mcy-account-home h1")).toContainText("B fixture");
  const replied = page.waitForResponse(r => r.url().endsWith("/record_my_consent")); release(); await replied;
  await expect(aiPrivacy.getByRole("button", { name: /Rút đồng ý/ })).toBeVisible(); expect(writes).toBe(1);
});

test("closed capability preserves manual entry and never exposes a sample as reviewed AI content", async ({ page }) => {
  await learner(page, async () => { throw new Error("Unexpected model request"); }, false);
  await page.goto("/?mode=web"); await page.getByRole("button", { name: "Bắt đầu check-in", exact: true }).click();
  await page.getByRole("button", { name: "Tiếp: năng lượng và thời gian" }).click();
  await expect(page.getByRole("button", { name: "Chọn buổi hôm nay cùng AI" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Tự chọn bài học video miễn phí", exact: true })).toBeVisible();
});

test("multimodal draft is readable on narrow web, preserves image ratio and pauses audio between sections", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 });
  const cloud: string[] = []; page.on("request", request => { if (/supabase|openrouter|mcy-playwright/.test(new URL(request.url()).hostname)) cloud.push(request.url()); });
  await page.goto("/?workspace=content-review&mode=web");
  await expect(page.getByRole("heading", { name: "Dành một khoảng cho buổi học" })).toBeVisible();
  expect((await page.getByRole("heading", { name: "Dành một khoảng cho buổi học" }).boundingBox())!.y).toBeLessThan(260);
  await expect(page.getByRole("note")).toContainText("chưa có audio tiếng Việt");
  const img = page.locator(".mcy-lesson-reader > img"); await expect.poll(() => img.evaluate((el: HTMLImageElement) => el.naturalWidth)).toBe(1280);
  await img.scrollIntoViewIfNeeded();
  expect(await img.evaluate(el => { const r = el.getBoundingClientRect(); return document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2) === el; })).toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  const audio = page.locator("audio"); expect(await audio.evaluate((a: HTMLAudioElement) => a.autoplay)).toBe(false);
  await audio.evaluate((a: HTMLAudioElement) => a.play()); await expect.poll(() => audio.evaluate((a: HTMLAudioElement) => a.paused)).toBe(false);
  const old = await audio.elementHandle(); await page.getByRole("button", { name: "2 Chọn không gian của bạn" }).click();
  expect(await old!.evaluate((a: HTMLAudioElement) => a.paused)).toBe(true);
  await expect(page.getByRole("heading", { name: "Chọn không gian của bạn" })).toBeVisible();
  expect(await audio.evaluate((a: HTMLAudioElement) => a.paused)).toBe(true); expect(cloud).toEqual([]);
  await img.scrollIntoViewIfNeeded();
  await page.screenshot({ path: "test-results/screenshots/ux-ai/draft-mobile.png" });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.locator(".mcy-content-review").evaluate(el => { el.scrollTop = 0; });
  await page.screenshot({ path: "test-results/screenshots/ux-ai/draft-web.png" });
});

test("Owner uncertain save requires readback language and explicit reload refreshes version", async ({ page }) => {
  await seedSession(page); let reads = 0, saves = 0;
  const config = { enabled: false, model_id: "", system_prompt: "Fictional retained prompt not used by the reviewed selector.", temperature: .3, max_output_tokens: 320, per_user_daily_limit: 10, global_daily_limit: 100, version_no: 1 };
  await page.route("https://mcy-playwright.invalid/functions/v1/owner-control-plane", async route => {
    const body = route.request().postDataJSON();
    if (body.action === "read_ai") { reads++; await route.fulfill({ json: { config: { ...config, version_no: reads }, models: [{ id: "provider/model", name: "Fixture model", provider: "Fixture" }], provider: "openrouter", providerKeyConfigured: true, spendControlApproved: false, enableGateOpen: false, environment: "staging" } }); }
    else { saves++; await route.abort("failed"); }
  });
  await page.goto("/?workspace=owner&mode=web");
  await expect(page.getByLabel("Prompt hội thoại trước đây · chỉ đọc")).toHaveAttribute("readonly", "");
  await page.getByRole("button", { name: "Lưu cấu hình staging" }).click();
  await expect(page.getByRole("alert")).toContainText("đã được lưu hay chưa"); expect(saves).toBe(1);
  page.on("dialog", dialog => dialog.accept()); await page.getByRole("button", { name: "Tải lại từ máy chủ" }).click();
  await expect(page.getByText("CẤU HÌNH AI · V2", { exact: true })).toBeVisible(); expect(reads).toBe(2); expect(saves).toBe(1);
});

test("the AI practice path is not offered when the check-in reports tiredness or discomfort, and is offered otherwise", async ({ page }) => {
  await learner(page, async route => { await route.fulfill({ status: 500, json: {} }); });   // the assistant must not even be asked
  await page.goto("/?mode=web");
  await page.getByRole("button", { name: "Bắt đầu check-in", exact: true }).click();
  const status = page.locator(".mcy-body-status-actions");
  for (const label of ["Mệt", "Khó chịu"]) {
    await status.getByRole("button", { name: label, exact: true }).click();
    await page.getByRole("button", { name: "Tiếp: năng lượng và thời gian" }).click();
    await expect(page.getByRole("button", { name: "Chọn buổi hôm nay cùng AI" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Tự chọn bài học video miễn phí" })).toBeVisible();   // manual browsing stays
    await page.getByRole("button", { name: "Quay lại cảm nhận cơ thể" }).click();
  }
  await status.getByRole("button", { name: "Bình thường", exact: true }).click();
  await page.getByRole("button", { name: "Tiếp: năng lượng và thời gian" }).click();
  await expect(page.getByRole("button", { name: "Chọn buổi hôm nay cùng AI" })).toBeVisible();
});
