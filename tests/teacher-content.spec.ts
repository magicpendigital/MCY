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
// W1: the panel reads tracking silently after each list. Without a fixture it answers like a server that lacks read_tracking.
async function openTeacher(page: Page, handler: (route: Route, body: Record<string, any>) => Promise<unknown> | unknown, tracking?: unknown[], session: unknown = auth) {
  await page.addInitScript(value => localStorage.setItem("sb-mcy-playwright-auth-token", JSON.stringify(value)), session);
  await page.route("https://*.supabase.co/**", route => route.abort("blockedbyclient"));
  await page.route("**/functions/v1/teacher-control-plane", route => reply(route, 404, { error: "not_available" }));
  await page.route("**/functions/v1/teacher-collaboration", route => reply(route, 404, { error: "not_available" }));
  await page.route(endpoint, route => { const body = route.request().postDataJSON(); return body.action === "read_tracking" ? (tracking ? reply(route, 200, { items: tracking }) : reply(route, 400, { error: "invalid_request" })) : handler(route, body); });
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
  await expect(list).toContainText("Cần sửa");
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
  await form.getByLabel("Link hoặc mã video YouTube").fill("short");
  await form.getByRole("button", { name: "Lưu và gửi duyệt" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "Chưa nhận ra video YouTube" })).toBeVisible();
  expect(writes).toHaveLength(0);
  await form.getByLabel("Link hoặc mã video YouTube").fill("https://www.youtube.com/watch?v=BBBBBBBBBBB&t=12s");   // a pasted link is stored as its 11-character id
  await form.getByLabel("Bạn sẽ làm gì trong bài này (mô tả)").fill("Bạn sẽ làm ba chuyển động nhẹ cho cổ.");
  await form.getByLabel("Lưng", { exact: true }).check();                                      // the author files the lesson under areas; nothing is guessed from the title
  await form.getByLabel("Cổ và vai").check();
  await form.getByLabel("Tư thế", { exact: true }).uncheck();
  await form.getByRole("button", { name: "Lưu và gửi duyệt" }).click();
  await expect(page.getByText("Đã lưu và gửi cho Owner duyệt.")).toBeVisible();
  expect(writes.map(w => w.action)).toEqual(["save_content", "submit_content"]);
  expect(writes[0]).toMatchObject({ itemId: mine.item_id, kind: "video_lesson", expectedSeq: 1, payload: { youtubeId: "BBBBBBBBBBB", orientation: "portrait", areas: ["neck-shoulders", "back"] } });
  expect(writes[0].actorId).toBeUndefined();
  expect(writes[1]).toMatchObject({ itemId: mine.item_id, expectedSeq: 2 });
});

test("the teacher page opens on the video lessons, with the four steps, and the old script tab says it never publishes", async ({ page }) => {
  await page.addInitScript(value => localStorage.setItem("sb-mcy-playwright-auth-token", JSON.stringify(value)), auth);
  await page.route("https://*.supabase.co/**", route => route.abort("blockedbyclient"));
  let accepted = false;
  const order: string[] = [];
  await page.route("**/functions/v1/teacher-control-plane", route => {
    const body = route.request().postDataJSON();
    order.push(body.action);
    if (body.action === "accept_invite") { accepted = true; return reply(route, 200, { status: "active" }); }
    if (body.action === "list_drafts") return accepted ? reply(route, 200, { drafts: [] }) : reply(route, 403, { error: "workspace_access_required" });
    return reply(route, 400, { error: "unexpected" });
  });
  await page.route("**/functions/v1/teacher-collaboration", route => reply(route, 404, { error: "not_available" }));
  await page.route(endpoint, route => { const body = route.request().postDataJSON(); order.push(body.action); return body.action === "list_content" ? reply(route, 200, { role: "teacher", items: [] }) : reply(route, 200, { notes: [] }); });
  await page.goto("/?workspace=teacher");
  await expect(page.getByRole("navigation", { name: "Chức năng giáo viên" }).getByRole("button", { name: "Bài video của tôi", exact: true })).toHaveAttribute("aria-current", "page");
  const steps = page.getByRole("list", { name: "Cách đưa một bài video lên" }).getByRole("listitem");
  await expect(steps).toHaveCount(4);                                                          // S1 adds the course step: learners see lessons through a course
  await expect(steps.last()).toContainText("Khóa học của tôi");
  await expect(page.getByText("Bạn chưa có bài nào.")).toBeVisible();
  expect(order.indexOf("accept_invite")).toBeGreaterThanOrEqual(0);
  expect(order.indexOf("list_content")).toBeGreaterThan(order.indexOf("accept_invite"));   // a new teacher's invite is accepted before the lessons are read
  await page.getByRole("button", { name: "Kịch bản nháp", exact: true }).click();
  await expect(page.getByTestId("script-draft-note")).toContainText("chưa gửi Owner duyệt");
});

test("a pasted YouTube link is recognised, and the player loads only when the teacher asks for a preview", async ({ page }) => {
  const players: string[] = [];
  await page.route("https://www.youtube-nocookie.com/embed/**", route => { players.push(route.request().url()); return route.fulfill({ status: 200, contentType: "text/html", body: "<!doctype html><title>Embedded player fixture</title>" }); });
  await page.route("https://www.youtube.com/**", route => route.abort("blockedbyclient"));
  await openTeacher(page, (r, body) => body.action === "list_content" ? reply(r, 200, { role: "teacher", items: [] }) : reply(r, 400, { error: "unexpected" }));
  await page.getByRole("button", { name: "Soạn bài mới" }).click();
  const form = page.getByRole("form", { name: "Soạn bài video" });
  const field = form.getByLabel("Link hoặc mã video YouTube");
  const preview = form.getByRole("button", { name: "Xem thử video" });
  for (const [input, id] of [["youtu.be/CCCCCCCCCCC?si=x", "CCCCCCCCCCC"], ["https://youtube.com/shorts/DDDDDDDDDDD", "DDDDDDDDDDD"], ["https://m.youtube.com/watch?feature=share&v=EEEEEEEEEEE", "EEEEEEEEEEE"]] as const) {
    await field.fill(input);
    await expect(form.getByTestId("youtube-id-status")).toHaveText(`Mã video: ${id}`);
  }
  for (const bad of ["https://evil.example/watch?v=CCCCCCCCCCC", "javascript:alert(1)", "https://youtube.com/watch?v=short"]) {
    await field.fill(bad);
    await expect(form.getByTestId("youtube-id-status")).toHaveText("Chưa nhận ra video YouTube từ nội dung này.");
    await expect(preview).toBeDisabled();
  }
  await field.fill("https://youtu.be/CCCCCCCCCCC");
  expect(players).toHaveLength(0);
  await expect(form.locator("iframe")).toHaveCount(0);
  await preview.click();
  await expect(form.locator('iframe[src^="https://www.youtube-nocookie.com/embed/CCCCCCCCCCC?"]')).toHaveCount(1);
  await field.fill("https://youtu.be/DDDDDDDDDDD");                                                   // changing the link closes the old preview
  await expect(form.locator("iframe")).toHaveCount(0);
});

test("the primary 'Soạn bài mới' button is actually visible: solid background and readable text", async ({ page }) => {
  await openTeacher(page, (r, body) => body.action === "list_content" ? reply(r, 200, { role: "teacher", items: [] }) : reply(r, 400, { error: "unexpected" }));
  const button = page.getByRole("button", { name: "Soạn bài mới" });
  await expect(button).toBeVisible();
  const look = await button.evaluate(el => {   // a transparent background with near-white text once hid this button (W0, 27/11)
    const parse = (value: string) => (value.match(/[\d.]+/g) ?? []).map(Number);
    const style = getComputedStyle(el);
    const [br, bg, bb, ba = 1] = parse(style.backgroundColor);
    const [fr, fg, fb] = parse(style.color);
    const lum = (r: number, g: number, b: number) => [r, g, b].map(c => { const s = c / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; }).reduce((sum, c, i) => sum + c * [0.2126, 0.7152, 0.0722][i], 0);
    const [hi, lo] = [lum(br, bg, bb), lum(fr, fg, fb)].sort((a, b) => b - a);
    return { alpha: ba, contrast: (hi + 0.05) / (lo + 0.05) };
  });
  expect(look.alpha).toBe(1);
  expect(look.contrast).toBeGreaterThanOrEqual(4.5);
});

test("a refused write is explained and a conflict asks for a reload", async ({ page }) => {
  await openTeacher(page, (r, body) => {
    if (body.action === "list_content") return reply(r, 200, { role: "teacher", items: [] });
    return body.action === "save_content" ? reply(r, 409, { error: "content_conflict" }) : reply(r, 200, { notes: [] });
  });
  await page.getByRole("button", { name: "Soạn bài mới" }).click();
  const form = page.getByRole("form", { name: "Soạn bài video" });
  await form.getByLabel("Tiêu đề").fill("Bài mới");
  await form.getByLabel("Link hoặc mã video YouTube").fill("AAAAAAAAAAA");
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

// S1 (board G, Owner 28/11): a teacher groups own lessons into a free course in three steps; the learner count is honest.
const approvedLesson = lessonRow({ item_id: "video-2222222222222222", title: "Bài đã duyệt", status: "submitted", review: { decision: "approved", revision: 1 }, approved_seq: 1 });
const waitingLesson = lessonRow({ item_id: "video-3333333333333333", title: "Bài chờ duyệt", status: "submitted", review: { decision: "pending", revision: 0 } });

test("a free course is made in three steps from the teacher's own lessons, with an honest learner count, and saved as course_group", async ({ page }) => {
  const writes: Record<string, any>[] = [];
  await openTeacher(page, (r, body) => {
    if (body.action === "list_content") return reply(r, 200, { role: "teacher", items: [approvedLesson, waitingLesson] });
    if (body.action === "read_content") return reply(r, 200, { version: version(row({ item_id: "group-dddddddddddddddd", kind: "course_group", title: "Buổi sáng nhẹ", seq: 1, status: "submitted" }), { summary: "Cho người mới", lessonIds: [waitingLesson.item_id, approvedLesson.item_id] }), published: false });
    if (body.action === "read_author_notes") return reply(r, 200, { notes: [] });
    writes.push(body);
    return reply(r, 200, { receipt: { item_id: "group-dddddddddddddddd", seq: 1, status: body.action === "submit_content" ? "submitted" : "draft" } });
  });
  await page.getByRole("button", { name: "Khóa học của tôi", exact: true }).click();
  await page.getByRole("button", { name: "Tạo khóa mới" }).click();
  const form = page.getByRole("form", { name: "Soạn khóa miễn phí" });
  await expect(form.locator("[aria-current=step]")).toContainText("Bước 1");
  await form.getByRole("button", { name: "Tiếp" }).click();                                   // step 1 needs a name and a description
  await expect(page.getByRole("alert").filter({ hasText: "Khóa cần tên và mô tả." })).toBeVisible();
  await form.getByLabel("Tên khóa").fill("Buổi sáng nhẹ");
  await form.getByLabel("Mô tả: khóa dành cho ai, học được gì").fill("Cho người mới");
  await form.getByRole("button", { name: "Tiếp" }).click();
  await expect(form.locator("[aria-current=step]")).toContainText("Bước 2");
  await form.getByRole("button", { name: "Tiếp" }).click();                                   // step 2 needs at least one lesson
  await expect(page.getByRole("alert").filter({ hasText: "Chọn ít nhất một bài video của bạn." })).toBeVisible();
  await expect(form.getByText("Bài chờ duyệt (Đã gửi, chờ Owner duyệt)")).toBeVisible();     // each lesson shows its status
  await form.getByRole("checkbox", { name: /Bài đã duyệt/ }).check();
  await form.getByRole("checkbox", { name: /Bài chờ duyệt/ }).check();
  await form.getByRole("button", { name: "Đưa “Bài chờ duyệt” lên" }).click();
  await expect(form.getByRole("list", { name: "Thứ tự bài trong khóa" }).getByRole("listitem").first()).toContainText("Bài chờ duyệt");
  await expect(form.getByTestId("course-approved-count")).toContainText("1/2 bài đã được Owner duyệt");
  await form.getByRole("button", { name: "Tiếp" }).click();
  const preview = form.getByRole("region", { name: "Xem trước khóa như học viên thấy" });
  await expect(preview).toContainText("Buổi sáng nhẹ");
  await expect(preview).toContainText("Giảng viên: Giảng viên Thử");
  await expect(preview.getByRole("listitem").first()).toContainText("chưa hiện với học viên cho tới khi bài được duyệt");
  await expect(preview.getByRole("listitem").nth(1)).not.toContainText("chưa hiện");
  await form.getByRole("button", { name: "Quay lại" }).click();
  await expect(form.locator("[aria-current=step]")).toContainText("Bước 2");
  await form.getByRole("button", { name: "Tiếp" }).click();
  expect(writes).toHaveLength(0);
  await form.getByRole("button", { name: "Lưu và gửi duyệt" }).click();
  await expect(page.getByText("Đã lưu và gửi cho Owner duyệt.")).toBeVisible();
  expect(writes.map(w => w.action)).toEqual(["save_content", "submit_content"]);
  expect(writes[0]).toMatchObject({ itemId: null, kind: "course_group", title: "Buổi sáng nhẹ", expectedSeq: 0, payload: { summary: "Cho người mới", lessonIds: [waitingLesson.item_id, approvedLesson.item_id] } });
  expect(Object.keys(writes[0].payload).sort()).toEqual(["lessonIds", "summary"]);          // no benefit/caution wording from the teacher
  const detail = page.getByRole("article", { name: "Khóa · Buổi sáng nhẹ" });
  await expect(detail.getByTestId("course-approved-count")).toContainText("1/2 bài đã được Owner duyệt");
  await expect(detail.getByRole("list", { name: "Bài trong khóa" })).toContainText("Bài đã duyệt (Đã được Owner duyệt)");
});

test("a lesson offers 'Tạo khóa với bài này', and a course cannot be started without any lesson", async ({ page }) => {
  let items: unknown[] = [];
  await openTeacher(page, (r, body) => {
    if (body.action === "list_content") return reply(r, 200, { role: "teacher", items });
    if (body.action === "read_content") return reply(r, 200, { version: version(approvedLesson, lessonPayload), published: false });
    if (body.action === "read_author_notes") return reply(r, 200, { notes: [] });
    return reply(r, 400, { error: "unexpected" });
  });
  await page.getByRole("button", { name: "Khóa học của tôi", exact: true }).click();
  await expect(page.getByRole("button", { name: "Tạo khóa mới" })).toBeDisabled();
  await expect(page.getByText("Cần có ít nhất một bài video trước khi tạo khóa.")).toBeVisible();
  items = [approvedLesson, waitingLesson];
  await page.reload();
  await page.getByRole("button", { name: "Bài video của tôi", exact: true }).click();
  await page.getByRole("list", { name: "Bài của tôi" }).getByRole("button", { name: /Bài đã duyệt/ }).click();
  await page.getByRole("button", { name: "Tạo khóa với bài này" }).click();
  await expect(page.getByRole("button", { name: "Khóa học của tôi", exact: true })).toHaveAttribute("aria-current", "page");   // the shortcut opens the course view
  const form = page.getByRole("form", { name: "Soạn khóa miễn phí" });
  await form.getByLabel("Tên khóa").fill("Khóa thử");
  await form.getByLabel("Mô tả: khóa dành cho ai, học được gì").fill("Mô tả");
  await form.getByLabel("Mô tả: khóa dành cho ai, học được gì").press("Enter");   // Enter in a textarea adds a line, never saves
  await form.getByLabel("Tên khóa").press("Enter");                                // Enter moves to the next step, never saves early
  await expect(form.locator("[aria-current=step]")).toContainText("Bước 2");
  await expect(form.getByRole("checkbox", { name: /Bài đã duyệt/ })).toBeChecked();
  await expect(form.getByRole("checkbox", { name: /Bài chờ duyệt/ })).not.toBeChecked();
  await expect(form.getByTestId("course-approved-count")).toContainText("1/1 bài đã được Owner duyệt");
});

// W1 (Owner 28/11). A session that is about to expire makes supabase-js refresh the token (a new session object) on load, on
// the 30-second ticker and whenever the tab becomes visible again. That once reset the workspace and lost what was typed.
const refreshing = () => ({ ...auth, expires_in: 20, expires_at: Math.floor(Date.now() / 1000) + 20 });
async function refreshTokens(page: Page) {
  let count = 0;
  await page.route("**/auth/v1/token**", route => { count++; const fresh = refreshing(); return reply(route, 200, { ...fresh, access_token: `fictional-${owner}-${count}`, refresh_token: `fictional-refresh-${count}` }); });
  return () => count;
}
const hideAndShow = (page: Page) => page.evaluate(() => {
  for (const state of ["hidden", "visible"]) { Object.defineProperty(document, "visibilityState", { value: state, configurable: true }); document.dispatchEvent(new Event("visibilitychange")); }
});

test("switching browser tabs or refreshing the session keeps a half-written lesson and does not reload the workspace", async ({ page }) => {
  test.setTimeout(120000);
  const reads: string[] = [];
  const refreshes = await refreshTokens(page);
  await openTeacher(page, (r, body) => { reads.push(body.action); return body.action === "list_content" ? reply(r, 200, { role: "teacher", items: [] }) : reply(r, 400, { error: "unexpected" }); }, undefined, refreshing());
  await page.getByRole("button", { name: "Soạn bài mới" }).click();
  const form = page.getByRole("form", { name: "Soạn bài video" });
  await form.getByLabel("Tiêu đề").fill("Bài đang viết dở");
  await form.getByLabel("Bạn sẽ làm gì trong bài này (mô tả)").fill("Chưa lưu, đang gõ");
  const before = refreshes(), lists = reads.filter(a => a === "list_content").length;
  await hideAndShow(page);
  await expect.poll(refreshes, { timeout: 45000 }).toBeGreaterThan(before);                     // the token really was refreshed (30-second ticker)
  await hideAndShow(page);
  await page.waitForTimeout(500);
  await expect(form.getByLabel("Tiêu đề")).toHaveValue("Bài đang viết dở");
  await expect(form.getByLabel("Bạn sẽ làm gì trong bài này (mô tả)")).toHaveValue("Chưa lưu, đang gõ");
  expect(reads.filter(a => a === "list_content").length).toBe(lists);                         // no reload of the list
  await page.getByRole("button", { name: "Kịch bản nháp", exact: true }).click();                 // another section and back keeps the form too
  await page.getByRole("button", { name: "Bài video của tôi", exact: true }).click();
  await expect(form.getByLabel("Tiêu đề")).toHaveValue("Bài đang viết dở");
});

test("the Owner's half-written MCY content survives a session refresh and a tab switch", async ({ page }) => {
  test.setTimeout(120000);
  const refreshes = await refreshTokens(page);
  await page.addInitScript(value => localStorage.setItem("sb-mcy-playwright-auth-token", JSON.stringify(value)), refreshing());
  await page.route("https://*.supabase.co/**", route => route.abort("blockedbyclient"));
  await page.route(endpoint, route => { const body = route.request().postDataJSON(); if (body.action === "read_ai") return reply(route, 200, ownerPayload); if (body.action === "read_display") return reply(route, 200, { version_no: 1, config: defaultDisplay, log: [], visibility: [] }); return body.action === "list_content" ? reply(route, 200, { role: "owner", items: rows }) : reply(route, 400, { error: "unexpected" }); });
  await page.goto("/?workspace=owner");
  await page.getByRole("button", { name: "Nội dung", exact: true }).click();
  await page.getByRole("button", { name: "Soạn nội dung MCY" }).click();
  const form = page.getByRole("form", { name: "Soạn nội dung MCY" });
  await form.getByLabel("Tiêu đề", { exact: true }).fill("Nội dung đang soạn");
  const before = refreshes();
  await hideAndShow(page);
  await expect.poll(refreshes, { timeout: 45000 }).toBeGreaterThan(before);
  await page.waitForTimeout(500);
  await expect(form.getByLabel("Tiêu đề", { exact: true })).toHaveValue("Nội dung đang soạn");
});

const shownLesson = lessonRow({ item_id: "video-4444444444444444", title: "Bài đang hiện", status: "submitted", review: { decision: "approved", revision: 1 }, approved_seq: 1 });
const draftLesson = lessonRow({ item_id: "video-5555555555555555", title: "Bài nháp", status: "draft" });
const mixed = [shownLesson, waitingLesson, draftLesson];
const mixedHandler = (r: Route, body: Record<string, any>) => {
  if (body.action === "list_content") return reply(r, 200, { role: "teacher", items: mixed });
  if (body.action === "read_content") return reply(r, 200, { version: version(mixed.find(m => m.item_id === body.itemId) ?? shownLesson, lessonPayload), published: false });
  if (body.action === "read_author_notes") return reply(r, 200, { notes: [] });
  return reply(r, 400, { error: "unexpected" });
};

test("an opened lesson shows beside the list on a wide screen and above it on a narrow one, never below", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await openTeacher(page, mixedHandler);
  const list = page.getByRole("list", { name: "Bài của tôi" });
  await list.getByRole("button", { name: /Bài nháp/ }).click();
  const detail = page.getByRole("article", { name: "Bài · Bài nháp" });
  await expect(detail).toBeVisible();
  let [l, d] = [await list.boundingBox(), await detail.boundingBox()];
  expect(d!.x).toBeGreaterThan(l!.x + l!.width - 1);                                            // beside
  expect(d!.y).toBeLessThan(l!.y + l!.height);
  await page.setViewportSize({ width: 390, height: 844 });
  await list.getByRole("button", { name: /Bài chờ duyệt/ }).click();
  const narrow = page.getByRole("article", { name: "Bài · Bài chờ duyệt" });
  await expect(narrow).toBeInViewport();
  [l, d] = [await list.boundingBox(), await narrow.boundingBox()];
  expect(d!.y + d!.height).toBeLessThanOrEqual(l!.y + 1);                                       // above the list
});

test("the list has Duyệt and Trên app columns, a status filter, and says 'Chưa rõ' when the server has no tracking", async ({ page }) => {
  await openTeacher(page, mixedHandler);
  const list = page.getByRole("list", { name: "Bài của tôi" });
  await expect(list.getByRole("listitem")).toHaveCount(3);
  await expect(list.getByRole("listitem").filter({ hasText: "Bài đang hiện" })).toContainText("Đã duyệt");
  for (const item of await list.getByRole("listitem").all()) await expect(item).toContainText("Chưa rõ");   // never guessed as shown
  await page.getByLabel("Lọc theo trạng thái").selectOption({ label: "Chờ duyệt" });
  await expect(list.getByRole("listitem")).toHaveCount(1);
  await expect(list).toContainText("Bài chờ duyệt");
  await page.getByLabel("Lọc theo trạng thái").selectOption({ label: "Nháp" });
  await expect(list).toContainText("Bài nháp");
  await page.getByLabel("Lọc theo trạng thái").selectOption({ label: "Tất cả" });
  await list.getByRole("button", { name: /Bài đang hiện/ }).click();
  const detail = page.getByRole("article", { name: "Bài · Bài đang hiện" });
  await detail.getByRole("button", { name: "Theo dõi", exact: true }).click();
  await expect(detail.getByTestId("tracking-unavailable")).toContainText("Không đoán");
});

test("with tracking, the Theo dõi tab and view show what learners see, the holding courses and the history without the reviewer", async ({ page }) => {
  const tracking = [
    { item_id: shownLesson.item_id, kind: "video_lesson", shown_seq: 1, on_app: true, history: [{ event: "review", decision: "approved", seq: 1, at: "2026-11-20T03:00:00Z" }, { event: "submit", seq: 1, at: "2026-11-19T03:00:00Z" }],
      courses: [{ item_id: "group-eeeeeeeeeeeeeeee", title: "Khóa sáng", own: true, shown: true }, { item_id: "group-ffffffffffffffff", title: "Nhóm của MCY", own: false, shown: true }] },
    { item_id: waitingLesson.item_id, kind: "video_lesson", shown_seq: null, on_app: false, history: [{ event: "submit", seq: 1, at: "2026-11-21T03:00:00Z" }], courses: [] },
    { item_id: draftLesson.item_id, kind: "video_lesson", shown_seq: null, on_app: false, history: [], courses: [] },
  ];
  await openTeacher(page, mixedHandler, tracking);
  const list = page.getByRole("list", { name: "Bài của tôi" });
  await expect(list.getByRole("listitem").filter({ hasText: "Bài đang hiện" })).toContainText("Đang hiện · bản 1");
  await expect(list.getByRole("listitem").filter({ hasText: "Bài nháp" })).toContainText("Chưa hiện");
  await list.getByRole("button", { name: /Bài đang hiện/ }).click();
  const detail = page.getByRole("article", { name: "Bài · Bài đang hiện" });
  await detail.getByRole("button", { name: "Theo dõi", exact: true }).click();
  await expect(detail.getByTestId("tracking-shown")).toContainText("phiên bản 1");
  await expect(detail.getByRole("list", { name: "Khóa chứa bài này" })).toContainText("Khóa sáng · khóa của bạn · đang hiện");
  await expect(detail.getByRole("list", { name: "Khóa chứa bài này" })).toContainText("Nhóm của MCY · khóa của MCY");
  await expect(detail.getByRole("list", { name: "Lịch sử gửi và duyệt" }).getByRole("listitem").first()).toContainText("Owner: đã duyệt · phiên bản 1");
  await page.getByRole("navigation", { name: "Chức năng giáo viên" }).getByRole("button", { name: "Theo dõi", exact: true }).click();
  const table = page.getByRole("table", { name: "Theo dõi bài và khóa" });
  await expect(table.getByRole("row")).toHaveCount(4);
  await expect(table.getByRole("row").filter({ hasText: "Bài nháp" })).toContainText("Chưa gửi");
  await table.getByRole("button", { name: "Bài chờ duyệt" }).click();                         // opens the lesson on its Theo dõi tab
  await expect(page.getByRole("article", { name: "Bài · Bài chờ duyệt" }).getByRole("button", { name: "Theo dõi", exact: true })).toHaveAttribute("aria-pressed", "true");
});
