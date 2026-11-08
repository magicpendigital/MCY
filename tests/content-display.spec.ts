import { expect, test, type Page, type Route } from "@playwright/test";

// Fictional Owner against the isolated .invalid backend: the content hub is exercised with fictional store rows;
// nothing real is read or written. Fixtures are UI evidence, not authentication or staging evidence.
const endpoint = "https://mcy-playwright.invalid/functions/v1/owner-control-plane";
const owner = "22222222-2222-4222-8222-222222222222";
const ownerPayload = { config: { enabled: false, model_id: "", system_prompt: "Fictional owner configuration with more than forty characters.", temperature: 0.3, max_output_tokens: 320, per_user_daily_limit: 10, global_daily_limit: 100, version_no: 1 }, models: null, provider: "openrouter", providerKeyConfigured: false, spendControlApproved: false, enableGateOpen: false, environment: "staging" };
const auth = { access_token: `fictional-${owner}`, refresh_token: "fictional-refresh", token_type: "bearer", expires_in: 3600, expires_at: Math.floor(Date.now() / 1000) + 3600, user: { id: owner, aud: "authenticated", role: "authenticated", email: "owner@example.test", email_confirmed_at: "2026-09-01T00:00:00Z", app_metadata: { provider: "email", providers: ["email"] }, user_metadata: {}, identities: [], created_at: "2026-09-01T00:00:00Z" } };
const reply = (route: Route, status: number, body: unknown) => route.fulfill({ status, contentType: "application/json", body: JSON.stringify(body) });
const defaultDisplay = { discover_order: ["editors_choice", "video_groups", "quick_find", "reading"], policies: { show_teacher_names: true, ai_image_label: true }, editors_choice: [], review_rules: Object.fromEntries(["video_lesson", "course_group", "reading_unit", "screen_text"].map(k => [k, { owner_self_review: true }])) };
const hash = (c: string) => c.repeat(64);
const row = (patch: Record<string, unknown>) => ({ item_id: "video-aaaaaaaaaaaaaaaa", kind: "video_lesson", author_kind: "teacher", author_label: "Fictional teacher", seq: 1, content_hash: hash("a"), title: "Fictional lesson", status: "submitted", origin: "authored", updated_at: "2026-11-08T10:00:00Z", versions: 1, approved_seq: null, review: { decision: "pending", revision: 0 }, ...patch });
const lessonPayload = { youtubeId: "AAAAAAAAAAA", summary: "Fictional lesson summary", durationLabel: "0:43", orientation: "portrait" };
const version = (r: Record<string, unknown>, payload: unknown = lessonPayload, extra: Record<string, unknown> = {}) => ({ ...r, latest_seq: r.seq, payload, review: { ...(r.review as object), qualification: null, review_basis: null, rights_basis: null, checklist: null }, ...extra });
const teacherRow = row({});
const draftRow = row({ item_id: "video-bbbbbbbbbbbbbbbb", title: "Fictional draft", status: "draft", content_hash: hash("b") });
const mcyRow = row({ item_id: "group-cccccccccccccccc", kind: "course_group", author_kind: "mcy", author_label: null, title: "Fictional group", content_hash: hash("c"), review: { decision: "approved", revision: 1 }, approved_seq: 1 });
const rows = [teacherRow, draftRow, mcyRow];

async function setup(page: Page, handler: (route: Route, body: Record<string, any>) => Promise<unknown> | unknown) {
  await page.addInitScript(value => localStorage.setItem("sb-mcy-playwright-auth-token", JSON.stringify(value)), auth);
  await page.route("https://*.supabase.co/**", route => route.abort("blockedbyclient"));
  await page.route(endpoint, route => { const body = route.request().postDataJSON(); if (body.action === "read_ai") return reply(route, 200, ownerPayload); if (body.action === "read_display") return reply(route, 200, { version_no: 1, config: defaultDisplay, log: [], visibility: [] }); return handler(route, body); });
  await page.goto("/?workspace=owner");
  await page.getByRole("button", { name: "Nội dung", exact: true }).click();
}
async function declare(page: Page) {
  await page.getByLabel("Chuyên môn và phạm vi của người duyệt").fill("Fictional owner declaration for the UI fixture only");
  await page.getByLabel("Cơ sở duyệt nội dung").fill("Fictional review basis for the UI fixture only");
  await page.getByLabel("Cơ sở bản quyền").fill("Fictional rights basis for the UI fixture only");
}

const shownRow = (item: string, effective = true) => ({ item_id: item, seq: 1, content_hash: hash("a"), visible: true, effective });
const log = [{ kind: "config", subject: "display_config", before: null, after: null, at: "2026-11-08T10:00:00Z" }, { kind: "visibility", subject: "video-aaaaaaaaaaaaaaaa#1", before: false, after: true, at: "2026-11-08T11:00:00Z" }];

async function openDisplay(page: Page, handler: (route: Route, body: Record<string, any>) => Promise<unknown> | unknown) {
  await page.addInitScript(value => localStorage.setItem("sb-mcy-playwright-auth-token", JSON.stringify(value)), auth);
  await page.route("https://*.supabase.co/**", route => route.abort("blockedbyclient"));
  await page.route(endpoint, route => { const body = route.request().postDataJSON(); return body.action === "read_ai" ? reply(route, 200, ownerPayload) : handler(route, body); });
  await page.goto("/?workspace=owner");
  await page.getByRole("button", { name: "Hiển thị", exact: true }).click();
}

test("the section order can change but reading can never move above the video groups", async ({ page }) => {
  await openDisplay(page, (r, body) => body.action === "read_display" ? reply(r, 200, { version_no: 1, config: defaultDisplay, log, visibility: [] }) : reply(r, 200, { items: [], role: "owner" }));
  const items = page.locator(".owner-display-group ol li span");
  await expect(items).toHaveText(["1. Lựa chọn của biên tập (tối đa 3 ô)", "2. Nhóm bài video (nội dung chính)", "3. Tìm nhanh một bài", "4. Bài đọc có hình (đọc thêm)"]);
  await page.getByRole("button", { name: "Đưa xuống: Nhóm bài video (nội dung chính)" }).click();
  await expect(items.nth(2)).toContainText("Nhóm bài video");
  await page.getByRole("button", { name: "Đưa xuống: Nhóm bài video (nội dung chính)" }).click();   // would put reading above the video groups: refused
  await expect(items.nth(2)).toContainText("Nhóm bài video");
  await expect(items.nth(3)).toContainText("Bài đọc");
  await expect(page.getByText("Bài đọc luôn nằm dưới nhóm video")).toBeVisible();
});

test("Editor's choice offers only shown content, and a save sends the exact configuration and version", async ({ page }) => {
  const saves: Record<string, any>[] = [];
  await openDisplay(page, (r, body) => {
    if (body.action === "read_display") return reply(r, 200, { version_no: 4, config: defaultDisplay, log, visibility: [shownRow("video-aaaaaaaaaaaaaaaa"), shownRow("video-bbbbbbbbbbbbbbbb", false)] });
    if (body.action === "list_content") return reply(r, 200, { role: "owner", items: [teacherRow, draftRow] });
    saves.push(body); expect(r.request().headers().authorization).toBe(`Bearer fictional-${owner}`);
    return reply(r, 200, { receipt: { version_no: 5, unchanged: false }, published: false });
  });
  const slot = page.getByLabel("Ô lựa chọn 1");
  await expect(slot.locator("option")).toHaveText(["(trống)", "Fictional lesson"]);
  await expect(page.getByRole("button", { name: "Lưu cấu hình" })).toBeDisabled();
  await slot.selectOption("video-aaaaaaaaaaaaaaaa");
  await page.getByLabel("Hiện tên tác giả giảng viên (chỉ khi hồ sơ đã kích hoạt)").uncheck();
  await page.getByLabel("Bài video: Owner được tự duyệt nội dung do chính mình soạn").uncheck();
  await page.getByRole("button", { name: "Lưu cấu hình" }).click();
  await expect(page.getByText("Đã lưu cấu hình và ghi nhật ký.", { exact: false })).toBeVisible();
  expect(saves).toHaveLength(1);
  expect(saves[0]).toMatchObject({ action: "save_display", expectedVersion: 4, config: { editors_choice: ["video-aaaaaaaaaaaaaaaa"], policies: { show_teacher_names: false, ai_image_label: true }, review_rules: { video_lesson: { owner_self_review: false }, course_group: { owner_self_review: true } } } });
  expect(saves[0].actorId).toBeUndefined();
  await expect(page.getByLabel("Nhật ký thay đổi")).toContainText("Đổi cấu hình hiển thị");
});

test("a configuration conflict asks for a reload and an unknown outcome is never retried", async ({ page }) => {
  let saves = 0;
  await openDisplay(page, (r, body) => {
    if (body.action === "read_display") return reply(r, 200, { version_no: 1, config: defaultDisplay, log: [], visibility: [] });
    if (body.action === "list_content") return reply(r, 200, { role: "owner", items: [] });
    saves += 1;
    return saves === 1 ? reply(r, 409, { error: "display_conflict" }) : reply(r, 503, { error: "content_result_uncertain" });
  });
  await page.getByLabel("Gắn nhãn “Hình AI minh họa”").uncheck();
  await page.getByRole("button", { name: "Lưu cấu hình" }).click();
  await expect(page.getByText("Cấu hình vừa được thay đổi ở nơi khác.", { exact: false })).toBeVisible();
  await expect(page.getByRole("button", { name: "Lưu cấu hình" })).toBeDisabled();
  await page.getByRole("button", { name: "Tải lại" }).click();
  await expect(page.getByText("Cần tải lại trước khi lưu tiếp")).toHaveCount(0);   // the reload finished and replaced the draft
  await expect(page.getByLabel("Gắn nhãn “Hình AI minh họa”")).toBeChecked();
  await page.getByLabel("Gắn nhãn “Hình AI minh họa”").uncheck();
  await page.getByRole("button", { name: "Lưu cấu hình" }).click();
  await expect(page.getByText("Chưa xác định cấu hình đã được lưu hay chưa", { exact: false })).toBeVisible();
  await page.waitForTimeout(400);
  expect(saves).toBe(2);
  await expect(page.getByRole("button", { name: "Lưu cấu hình" })).toBeDisabled();
});

test("the visibility switch appears only for an approved latest version, asks for confirmation and sends the exact version", async ({ page }) => {
  const switches: Record<string, any>[] = [];
  let on = false;
  await page.addInitScript(value => localStorage.setItem("sb-mcy-playwright-auth-token", JSON.stringify(value)), auth);
  await page.route("https://*.supabase.co/**", route => route.abort("blockedbyclient"));
  await page.route(endpoint, route => {
    const body = route.request().postDataJSON();
    if (body.action === "read_ai") return reply(route, 200, ownerPayload);
    if (body.action === "read_display") return reply(route, 200, { version_no: 1, config: defaultDisplay, log: [], visibility: on ? [shownRow(mcyRow.item_id)] : [] });
    if (body.action === "list_content") return reply(route, 200, { role: "owner", items: [mcyRow], published: false });
    if (body.action === "read_content") return reply(route, 200, { version: version(mcyRow, { summary: "Fictional group summary", lessonIds: [] }), published: false });
    switches.push(body); on = body.visible;
    return reply(route, 200, { receipt: { item_id: body.itemId, seq: body.seq, visible: body.visible, unchanged: false }, published: false });
  });
  await page.goto("/?workspace=owner");
  await page.getByRole("button", { name: "Nội dung", exact: true }).click();
  await page.getByRole("button", { name: /Fictional group/ }).click();
  const section = page.getByLabel("Hiển thị cho học viên", { exact: true });
  await expect(section).toContainText("đã duyệt và đang tắt");
  await section.getByRole("button", { name: "Bật hiển thị" }).click();
  await expect(page.getByRole("alertdialog", { name: "Xác nhận bật hiển thị" })).toBeVisible();
  expect(switches).toHaveLength(0);
  await page.getByRole("button", { name: "Xác nhận bật" }).click();
  await expect(page.getByText("Đã bật hiển thị cho phiên bản này", { exact: false })).toBeVisible();
  expect(switches).toHaveLength(1);
  expect(switches[0]).toMatchObject({ action: "set_visibility", itemId: mcyRow.item_id, seq: 1, visible: true });
  await expect(section).toContainText("Đang bật hiển thị");
  await expect(section.getByRole("button", { name: "Tắt hiển thị" })).toBeVisible();
});
