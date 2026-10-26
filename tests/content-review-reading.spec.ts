import { expect, test, type Page, type Route } from "@playwright/test";
import { contentReviewCandidates } from "../supabase/functions/_shared/contentReviewCandidates";
import { readingUnitCandidates } from "../supabase/functions/_shared/readingUnitCandidates";

// Fictional Owner against the isolated .invalid backend: the panel is exercised with the real
// registry content but no real review is written anywhere.
const endpoint = "https://mcy-playwright.invalid/functions/v1/owner-control-plane";
const owner = "22222222-2222-4222-8222-222222222222";
const ownerPayload = { config: { enabled: false, model_id: "", system_prompt: "Fictional owner configuration with more than forty characters.", temperature: 0.3, max_output_tokens: 320, per_user_daily_limit: 10, global_daily_limit: 100, version_no: 1 }, models: null, provider: "openrouter", providerKeyConfigured: false, spendControlApproved: false, enableGateOpen: false, environment: "staging" };
const auth = { access_token: `fictional-${owner}`, refresh_token: "fictional-refresh", token_type: "bearer", expires_in: 3600, expires_at: Math.floor(Date.now() / 1000) + 3600, user: { id: owner, aud: "authenticated", role: "authenticated", email: "owner@example.test", email_confirmed_at: "2026-09-01T00:00:00Z", app_metadata: { provider: "email", providers: ["email"] }, user_metadata: {}, identities: [], created_at: "2026-09-01T00:00:00Z" } };
const reply = (route: Route, status: number, body: unknown) => route.fulfill({ status, contentType: "application/json", body: JSON.stringify(body) });
const item = (c: { id: string; version: string }, revision = 0, decision = "pending") => ({ candidate_id: c.id, content_version: c.version, state: { revision, decision, qualification: null, review_basis: null, rights_basis: null, checklist: null }, assignments: [] });
const queue = (revisions: Record<string, { revision: number; decision: string }> = {}) => ({
  can_assign: true,
  items: [contentReviewCandidates[0], ...readingUnitCandidates].map(c => item(c, revisions[c.id]?.revision ?? 0, revisions[c.id]?.decision ?? "pending")),
  eligible_reviewers: [],
  candidates: readingUnitCandidates,
});

async function setup(page: Page, review: (route: Route) => Promise<unknown>) {
  await page.addInitScript(value => localStorage.setItem("sb-mcy-playwright-auth-token", JSON.stringify(value)), auth);
  await page.route("https://*.supabase.co/**", route => route.abort("blockedbyclient"));
  await page.route(endpoint, route => route.request().postDataJSON().action === "read_ai" ? reply(route, 200, ownerPayload) : review(route));
  await page.goto("/?workspace=owner");
  await page.getByRole("button", { name: "Duyệt nội dung", exact: true }).click();
}
async function declare(page: Page, { checkAll = true } = {}) {
  await page.getByLabel("Chuyên môn và phạm vi của người duyệt").fill("Fictional owner declaration for the UI fixture only");
  await page.getByLabel("Căn cứ và nhận xét chuyên môn").fill("Fictional review basis for the UI fixture only");
  await page.getByLabel("Căn cứ quyền sử dụng nội dung và media").fill("Fictional rights basis for the UI fixture only");
  if (!checkAll) return;
  for (const box of await page.locator(".owner-review-checks input").all()) {
    const label = (await box.locator("xpath=..").innerText()).trim();
    if (!/audio tiếng Việt|thời lượng thực hành/.test(label)) await box.check();
  }
}

test("the Owner sees the 14 reading units as Preview, with steps and media status but no publish action", async ({ page }) => {
  await setup(page, r => reply(r, 200, queue()));
  const select = page.getByLabel("Nội dung", { exact: true });
  await expect(select.locator("option")).toHaveCount(1 + readingUnitCandidates.length);
  await expect(select.locator("option").nth(1)).toContainText("Preview ·");
  await select.selectOption(readingUnitCandidates[0].id);
  await expect(page.getByText("PREVIEW · CHƯA DUYỆT")).toBeVisible();
  await expect(page.getByText("Bài đọc chưa duyệt (Preview)", { exact: false })).toBeVisible();
  await expect(page.locator(".reading-preview h3")).toHaveText(readingUnitCandidates[0].unit.title);
  await expect(page.locator(".reading-preview-steps > li")).toHaveCount(readingUnitCandidates[0].unit.steps.length);
  await expect(page.locator(".reading-preview-media").first()).toBeVisible();
  await expect(page.getByRole("button", { name: "Xuất bản", exact: true })).toHaveCount(0);
  await expect(page.locator(".owner-review-state")).toContainText("Chờ duyệt");
});

test("bulk approval needs the Owner's own declaration and confirmation, then writes one audited save per unit", async ({ page }) => {
  const saves: Record<string, unknown>[] = [];
  await setup(page, async r => {
    const body = r.request().postDataJSON();
    if (body.action === "read_content_review") return reply(r, 200, queue(Object.fromEntries(saves.map(s => [s.candidateId as string, { revision: 1, decision: "approved" }]))));
    saves.push(body);
    expect(r.request().headers().authorization).toBe(`Bearer fictional-${owner}`);
    return reply(r, 200, { receipt: { candidate_id: body.candidateId, content_version: body.contentVersion, revision: 1 }, published: false, aiEnabled: false });
  });
  const bulk = page.getByRole("button", { name: /Duyệt tất cả bài đọc đang chờ/ });
  await expect(bulk).toBeDisabled();
  await declare(page, { checkAll: false });
  await expect(bulk).toBeDisabled();
  await declare(page);
  await expect(bulk).toBeEnabled();
  await bulk.click();
  await expect(page.getByRole("alertdialog", { name: "Xác nhận duyệt hàng loạt" })).toBeVisible();
  expect(saves).toHaveLength(0);
  await page.getByRole("button", { name: /^Xác nhận duyệt 14 bài$/ }).click();
  await expect(page.getByText("Đã ghi kết quả duyệt cho 14 bài đọc", { exact: false })).toBeVisible();
  expect(saves).toHaveLength(14);
  expect(new Set(saves.map(s => s.candidateId))).toEqual(new Set(readingUnitCandidates.map(c => c.id)));
  for (const save of saves) {
    const unit = readingUnitCandidates.find(c => c.id === save.candidateId)!;
    expect(save).toMatchObject({ action: "save_content_review", contentVersion: unit.version, expectedRevision: 0, decision: "approved" });
    expect(save).not.toHaveProperty("actorId");
    expect(save.checklist).toMatchObject({ contentAccuracy: true, rightsConfirmed: true, expertiseConfirmed: true, vietnameseAudioReady: false, actualDurationChecked: false });
  }
  await expect(page.getByText("Tất cả bài đọc đã có kết quả duyệt.")).toBeVisible();
});

test("a failed save stops the run, reports how far it got and does not retry", async ({ page }) => {
  let saves = 0;
  await setup(page, async r => {
    const body = r.request().postDataJSON();
    if (body.action === "read_content_review") return reply(r, 200, queue());
    saves += 1;
    if (saves === 3) return r.abort("failed");
    return reply(r, 200, { receipt: { candidate_id: body.candidateId, content_version: body.contentVersion, revision: 1 } });
  });
  await declare(page);
  await page.getByRole("button", { name: /Duyệt tất cả bài đọc đang chờ/ }).click();
  await page.getByRole("button", { name: /^Xác nhận duyệt 14 bài$/ }).click();
  await expect(page.getByRole("alert")).toContainText("Đã ghi 2/14 bài");
  await expect(page.getByRole("alert")).toContainText("không tự gửi lại");
  expect(saves).toBe(3);
  await expect(page.getByRole("button", { name: /Duyệt tất cả bài đọc đang chờ/ })).toBeDisabled();
});
