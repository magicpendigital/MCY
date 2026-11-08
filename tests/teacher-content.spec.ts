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

const lessonRow = (patch: Record<string, unknown> = {}) => row({ item_id: "video-1111111111111111", title: "Bài của tôi", author_label: "Giảng viên Thử", ...patch });
async function openTeacher(page: Page, handler: (route: Route, body: Record<string, any>) => Promise<unknown> | unknown) {
  await page.addInitScript(value => localStorage.setItem("sb-mcy-playwright-auth-token", JSON.stringify(value)), auth);
  await page.route("https://*.supabase.co/**", route => route.abort("blockedbyclient"));
  await page.route("**/functions/v1/teacher-control-plane", route => reply(route, 404, { error: "not_available" }));
  await page.route("**/functions/v1/teacher-collaboration", route => reply(route, 404, { error: "not_available" }));
  await page.route(endpoint, route => handler(route, route.request().postDataJSON()));
  await page.goto("/?workspace=teacher");
  await page.getByRole("button", { name: "Bài video của tôi", exact: true }).click();
}

test("a teacher sees only own lessons with status, the author label from the profile, and the Owner's notes", async ({ page }) => {
  const mine = lessonRow({ review: { decision: "changes_requested", revision: 1 }, seq: 2 });
  await openTeacher(page, (r, body) => {
    if (body.action === "list_content") return reply(r, 200, { role: "teacher", items: [mine, { ...mcyRow }] });
    if (body.action === "read_content") return reply(r, 200, { version: version(mine, lessonPayload), published: false });
    if (body.action === "read_author_notes") return reply(r, 200, { notes: [{ seq: 1, note: "Hãy rút gọn phần mô tả.", at: "2026-11-09T01:00:00Z" }] });
    return reply(r, 400, { error: "unexpected" });
  });
  await expect(page.getByTestId("author-label")).toContainText("Giảng viên Thử");
  const list = page.getByRole("list", { name: "Bài của tôi" });
  await expect(list.getByRole("listitem")).toHaveCount(1);                              // only video lessons; never the Owner's group
  await expect(list).toContainText("Cần chỉnh sửa");
  await list.getByRole("button", { name: /Bài của tôi/ }).click();
  await expect(page.getByLabel("Ghi chú của Owner")).toContainText("Hãy rút gọn phần mô tả.");
  await expect(page.getByRole("button", { name: /Xuất bản|Bật hiển thị|Ghi kết quả duyệt/ })).toHaveCount(0);
});

test("without an activated profile the teacher is told no name will show", async ({ page }) => {
  await openTeacher(page, (r, body) => body.action === "list_content" ? reply(r, 200, { role: "teacher", items: [lessonRow({ author_label: null })] }) : reply(r, 200, { notes: [] }));
  await expect(page.getByTestId("author-label")).toContainText("Chưa có tên hiển thị");
});

test("writing a lesson validates locally, saves a version with the exact expected version and sends it to the Owner", async ({ page }) => {
  const writes: Record<string, any>[] = [];
  const mine = lessonRow({ seq: 1, status: "draft", review: { decision: "pending", revision: 0 } });
  await openTeacher(page, (r, body) => {
    if (body.action === "list_content") return reply(r, 200, { role: "teacher", items: [mine] });
    if (body.action === "read_content") return reply(r, 200, { version: version(mine, lessonPayload), published: false });
    if (body.action === "read_author_notes") return reply(r, 200, { notes: [] });
    writes.push(body);
    return reply(r, 200, { receipt: { item_id: mine.item_id, seq: body.action === "save_content" ? 2 : 2, status: "draft" } });
  });
  await page.getByRole("list", { name: "Bài của tôi" }).getByRole("button", { name: /Bài của tôi/ }).click();
  await page.getByRole("button", { name: "Sửa (phiên bản mới)" }).click();
  const form = page.getByRole("form", { name: "Soạn bài video" });
  await form.getByLabel("Mã video YouTube (11 ký tự)").fill("short");
  await form.getByRole("button", { name: "Lưu và gửi duyệt" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "Nội dung chưa hợp lệ" })).toBeVisible();
  expect(writes).toHaveLength(0);
  await form.getByLabel("Mã video YouTube (11 ký tự)").fill("BBBBBBBBBBB");
  await form.getByLabel("Bạn sẽ làm gì trong bài này (mô tả)").fill("Bạn sẽ làm ba chuyển động nhẹ cho cổ.");
  await form.getByRole("button", { name: "Lưu và gửi duyệt" }).click();
  await expect(page.getByText("Đã lưu và gửi cho Owner duyệt.")).toBeVisible();
  expect(writes.map(w => w.action)).toEqual(["save_content", "submit_content"]);
  expect(writes[0]).toMatchObject({ itemId: mine.item_id, kind: "video_lesson", expectedSeq: 1, payload: { youtubeId: "BBBBBBBBBBB", orientation: "portrait" } });
  expect(writes[0].actorId).toBeUndefined();
  expect(writes[1]).toMatchObject({ itemId: mine.item_id, expectedSeq: 2 });
});

test("a refused write is explained and a conflict asks for a reload", async ({ page }) => {
  await openTeacher(page, (r, body) => {
    if (body.action === "list_content") return reply(r, 200, { role: "teacher", items: [] });
    return body.action === "save_content" ? reply(r, 409, { error: "content_conflict" }) : reply(r, 200, { notes: [] });
  });
  await page.getByRole("button", { name: "Soạn bài mới" }).click();
  const form = page.getByRole("form", { name: "Soạn bài video" });
  await form.getByLabel("Tiêu đề").fill("Bài mới");
  await form.getByLabel("Mã video YouTube (11 ký tự)").fill("AAAAAAAAAAA");
  await form.getByLabel("Bạn sẽ làm gì trong bài này (mô tả)").fill("Mô tả ngắn");
  await form.getByLabel("Thời lượng (m:ss)").fill("1:00");
  await form.getByRole("button", { name: "Lưu nháp" }).click();
  await expect(page.getByText("Nội dung vừa thay đổi ở nơi khác.", { exact: false })).toBeVisible();
  await expect(page.getByRole("button", { name: "Tải lại" })).toBeVisible();
});

test("the Owner must write a note to the author when asking for changes, and it is sent with the exact version", async ({ page }) => {
  const calls: Record<string, any>[] = [];
  await setup(page, (r, body) => {
    if (body.action === "list_content") return reply(r, 200, { role: "owner", items: [teacherRow], published: false });
    if (body.action === "read_content") return reply(r, 200, { version: version(teacherRow), published: false });
    if (body.action === "read_author_notes") return reply(r, 200, { notes: [] });
    calls.push(body);
    return reply(r, 200, body.action === "review_content" ? { receipt: { revision: 1, decision: body.decision }, snapshotSynced: undefined } : { receipt: { item_id: body.itemId, seq: body.seq } });
  });
  await page.getByRole("button", { name: /Fictional lesson/ }).click();
  await declare(page);
  await page.getByRole("button", { name: "Ghi kết quả duyệt" }).click();
  await expect(page.getByText("Ghi chú gửi tác giả là bắt buộc khi yêu cầu sửa.")).toBeVisible();
  expect(calls).toHaveLength(0);
  await page.getByLabel("Ghi chú gửi tác giả", { exact: true }).fill("Hãy rút gọn phần mô tả xuống hai câu.");
  await page.getByRole("button", { name: "Ghi kết quả duyệt" }).click();
  await expect(page.getByText("Đã ghi kết quả duyệt và lịch sử.", { exact: false })).toBeVisible();
  expect(calls.map(c => c.action)).toEqual(["review_content", "save_author_note"]);
  expect(calls[0]).toMatchObject({ itemId: teacherRow.item_id, seq: 1, decision: "changes_requested" });
  expect(calls[1]).toMatchObject({ itemId: teacherRow.item_id, seq: 1, note: "Hãy rút gọn phần mô tả xuống hai câu." });
});
