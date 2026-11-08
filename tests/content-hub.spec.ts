import { expect, test, type Page, type Route } from "@playwright/test";

// Fictional Owner against the isolated .invalid backend: the content hub is exercised with fictional store rows;
// nothing real is read or written. Fixtures are UI evidence, not authentication or staging evidence.
const endpoint = "https://mcy-playwright.invalid/functions/v1/owner-control-plane";
const owner = "22222222-2222-4222-8222-222222222222";
const ownerPayload = { config: { enabled: false, model_id: "", system_prompt: "Fictional owner configuration with more than forty characters.", temperature: 0.3, max_output_tokens: 320, per_user_daily_limit: 10, global_daily_limit: 100, version_no: 1 }, models: null, provider: "openrouter", providerKeyConfigured: false, spendControlApproved: false, enableGateOpen: false, environment: "staging" };
const auth = { access_token: `fictional-${owner}`, refresh_token: "fictional-refresh", token_type: "bearer", expires_in: 3600, expires_at: Math.floor(Date.now() / 1000) + 3600, user: { id: owner, aud: "authenticated", role: "authenticated", email: "owner@example.test", email_confirmed_at: "2026-09-01T00:00:00Z", app_metadata: { provider: "email", providers: ["email"] }, user_metadata: {}, identities: [], created_at: "2026-09-01T00:00:00Z" } };
const reply = (route: Route, status: number, body: unknown) => route.fulfill({ status, contentType: "application/json", body: JSON.stringify(body) });
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
  await page.route(endpoint, route => { const body = route.request().postDataJSON(); return body.action === "read_ai" ? reply(route, 200, ownerPayload) : handler(route, body); });
  await page.goto("/?workspace=owner");
  await page.getByRole("button", { name: "Nội dung", exact: true }).click();
}
async function declare(page: Page) {
  await page.getByLabel("Chuyên môn và phạm vi của người duyệt").fill("Fictional owner declaration for the UI fixture only");
  await page.getByLabel("Cơ sở duyệt nội dung").fill("Fictional review basis for the UI fixture only");
  await page.getByLabel("Cơ sở bản quyền").fill("Fictional rights basis for the UI fixture only");
}

test("an empty store offers the import with a confirmation; nothing is written before it", async ({ page }) => {
  const calls: string[] = [];
  let imported = false;
  await setup(page, (r, body) => {
    calls.push(body.action);
    if (body.action === "list_content") return reply(r, 200, { role: "owner", items: imported ? rows : [], published: false });
    imported = true;
    return reply(r, 200, { created: 55, unchanged: 0, total: 55, published: false });
  });
  await expect(page.getByText("Chưa có nội dung trong kho")).toBeVisible();
  await page.getByRole("button", { name: "Nhập nội dung hiện có" }).click();
  await expect(page.getByRole("alertdialog", { name: "Xác nhận nhập nội dung" })).toBeVisible();
  expect(calls).toEqual(["list_content"]);
  await page.getByRole("button", { name: "Xác nhận nhập" }).click();
  await expect(page.getByText("Đã nhập 55 mục mới, 0 mục không đổi (tổng 55)", { exact: false })).toBeVisible();
  await expect(page.getByRole("list", { name: "Danh sách nội dung" }).getByRole("listitem")).toHaveCount(3);
  expect(calls).toEqual(["list_content", "import_catalog", "list_content"]);
});

test("the list shows counts, author labels and filters; a teacher item can be reviewed but not edited", async ({ page }) => {
  await setup(page, (r, body) => body.action === "list_content" ? reply(r, 200, { role: "owner", items: rows, published: false })
    : reply(r, 200, { version: version(body.itemId === teacherRow.item_id ? teacherRow : body.itemId === draftRow.item_id ? draftRow : mcyRow, body.itemId.startsWith("group") ? { summary: "Fictional group summary", lessonIds: [teacherRow.item_id] } : lessonPayload), published: false }));
  const stats = page.getByLabel("Tổng quan");
  await expect(stats).toContainText("1Chờ Owner duyệt");
  await expect(stats).toContainText("1Nháp chưa gửi");
  await expect(stats).toContainText("1Đã duyệt");
  const list = page.getByRole("list", { name: "Danh sách nội dung" });
  await expect(list).toContainText("Fictional teacher");
  await expect(list).toContainText("MCY biên soạn");
  await page.getByLabel("Lọc theo tác giả").selectOption("mcy");
  await expect(list.getByRole("listitem")).toHaveCount(1);
  await page.getByLabel("Lọc theo tác giả").selectOption("all");
  await page.getByLabel("Lọc theo loại").selectOption("course_group");
  await expect(list.getByRole("listitem")).toHaveCount(1);
  await page.getByLabel("Lọc theo loại").selectOption("all");

  await list.getByRole("button", { name: /Fictional lesson/ }).click();
  const detail = page.getByRole("article", { name: "Đánh giá · Fictional lesson" });
  await expect(detail).toContainText("Fictional teacher · phiên bản 1/1 · Chờ duyệt");
  await expect(detail.getByLabel("Xem như học viên thấy")).toContainText("Fictional lesson summary");
  await expect(detail).toContainText("Owner chỉ duyệt hoặc yêu cầu sửa, không sửa trực tiếp");
  await expect(detail.getByRole("button", { name: /^Sửa/ })).toHaveCount(0);

  await list.getByRole("button", { name: /Fictional draft/ }).click();
  await expect(page.getByText("Tác giả chưa gửi duyệt phiên bản này.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Ghi kết quả duyệt" })).toBeDisabled();

  await list.getByRole("button", { name: /Fictional group/ }).click();
  await expect(page.getByLabel("Xem như học viên thấy")).toContainText("Lựa chọn của biên tập · MCY biên soạn");
  await expect(page.getByRole("button", { name: /^Sửa/ })).toBeVisible();
  await expect(page.getByRole("button", { name: /Xuất bản|Công bố/ })).toHaveCount(0);
});

test("a decision needs the Owner's own declaration and checks, and sends the exact version", async ({ page }) => {
  const reviews: Record<string, any>[] = [];
  await setup(page, (r, body) => {
    if (body.action === "list_content") return reply(r, 200, { role: "owner", items: [teacherRow], published: false });
    if (body.action === "read_content") return reply(r, 200, { version: version(teacherRow), published: false });
    reviews.push(body);
    expect(r.request().headers().authorization).toBe(`Bearer fictional-${owner}`);
    return reply(r, 200, { receipt: { revision: 1, decision: body.decision, published: false }, published: false, aiEnabled: false });
  });
  await page.getByRole("button", { name: /Fictional lesson/ }).click();
  await page.getByLabel("Quyết định").selectOption("approved");
  const submit = page.getByRole("button", { name: "Ghi kết quả duyệt" });
  await expect(submit).toBeDisabled();
  await declare(page);
  await expect(submit).toBeDisabled();
  for (const box of await page.locator(".owner-review-checks input").all()) {
    const label = (await box.locator("xpath=..").innerText()).trim();
    if (!/chỉ buổi tập/.test(label)) await box.check();
  }
  await expect(submit).toBeEnabled();
  await submit.click();
  await expect(page.getByText("Đã ghi kết quả duyệt và lịch sử.", { exact: false })).toBeVisible();
  expect(reviews).toHaveLength(1);
  expect(reviews[0]).toMatchObject({ action: "review_content", itemId: teacherRow.item_id, seq: 1, expectedRevision: 0, decision: "approved", qualification: "Fictional owner declaration for the UI fixture only" });
  expect(Object.keys(reviews[0].checklist)).toHaveLength(8);
  expect(reviews[0].actorId).toBeUndefined();
});

test("the Owner composes MCY content: invalid input is stopped locally, then save and submit send exact payloads", async ({ page }) => {
  const writes: Record<string, any>[] = [];
  await setup(page, (r, body) => {
    if (body.action === "list_content") return reply(r, 200, { role: "owner", items: [], published: false });
    if (body.action === "read_content") return reply(r, 200, { version: version(row({ item_id: "video-dddddddddddddddd", author_kind: "mcy", author_label: null, title: "Fictional new lesson", seq: 1, status: "submitted" })), published: false });
    writes.push(body);
    return reply(r, 200, { receipt: { item_id: "video-dddddddddddddddd", seq: 1, status: body.action === "save_content" ? "draft" : "submitted" }, published: false });
  });
  await page.getByRole("button", { name: "Soạn nội dung MCY" }).click();
  const form = page.getByRole("form", { name: "Soạn nội dung MCY" });
  await form.getByLabel("Tiêu đề").fill("Fictional new lesson");
  await form.getByLabel("Mã video YouTube (11 ký tự)").fill("short");
  await form.getByLabel("Mô tả", { exact: true }).fill("Fictional description");
  await form.getByLabel("Thời lượng (m:ss)").fill("1:05");
  await form.getByRole("button", { name: "Lưu và gửi duyệt" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "Nội dung chưa hợp lệ" })).toBeVisible();
  expect(writes).toHaveLength(0);
  await form.getByLabel("Mã video YouTube (11 ký tự)").fill("AAAAAAAAAAA");
  await form.getByLabel("Thẻ (cách nhau bằng dấu phẩy)").fill("cổ, vai");
  await form.getByRole("button", { name: "Lưu và gửi duyệt" }).click();
  await expect(page.getByText("Đã lưu và gửi duyệt.", { exact: false })).toBeVisible();
  expect(writes.map(w => w.action)).toEqual(["save_content", "submit_content"]);
  expect(writes[0]).toMatchObject({ itemId: null, kind: "video_lesson", title: "Fictional new lesson", expectedSeq: 0, payload: { youtubeId: "AAAAAAAAAAA", summary: "Fictional description", durationLabel: "1:05", orientation: "portrait", tags: ["cổ", "vai"] } });
  expect(writes[1]).toMatchObject({ itemId: "video-dddddddddddddddd", expectedSeq: 1 });
});

test("a conflict asks for a reload; an unknown outcome of a write is never retried by itself", async ({ page }) => {
  let saves = 0;
  await setup(page, (r, body) => {
    if (body.action === "list_content") return reply(r, 200, { role: "owner", items: [teacherRow], published: false });
    if (body.action === "read_content") return reply(r, 200, { version: version(teacherRow), published: false });
    saves += 1;
    return saves === 1 ? reply(r, 409, { error: "content_conflict" }) : reply(r, 503, { error: "content_result_uncertain" });
  });
  await page.getByRole("button", { name: /Fictional lesson/ }).click();
  await declare(page);
  await page.getByRole("button", { name: "Ghi kết quả duyệt" }).click();
  await expect(page.getByText("Nội dung vừa thay đổi ở nơi khác.", { exact: false })).toBeVisible();
  await expect(page.getByRole("button", { name: "Tải lại" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Ghi kết quả duyệt" })).toBeDisabled();
  await page.getByRole("button", { name: "Tải lại" }).click();
  await declare(page);
  await page.getByRole("button", { name: "Ghi kết quả duyệt" }).click();
  await expect(page.getByText("Chưa xác định thao tác đã được lưu hay chưa", { exact: false })).toBeVisible();
  await page.waitForTimeout(500);
  expect(saves).toBe(2);
  await expect(page.getByRole("button", { name: "Ghi kết quả duyệt" })).toBeDisabled();
});
