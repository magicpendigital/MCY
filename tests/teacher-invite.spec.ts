import { expect, test, type Page, type Route } from "@playwright/test";

// Fictional Owner against the isolated .invalid backend. Fixtures are UI evidence only:
// they prove what the box sends and shows, not the Owner role check, hashing or delivery.
const ownerEndpoint = "https://mcy-playwright.invalid/functions/v1/owner-control-plane";
const teacherEndpoint = "https://mcy-playwright.invalid/functions/v1/teacher-control-plane";
const owner = "22222222-2222-4222-8222-222222222222";
const ownerPayload = { config: { enabled: false, model_id: "", system_prompt: "Fictional owner configuration with more than forty characters.", temperature: 0.3, max_output_tokens: 320, per_user_daily_limit: 10, global_daily_limit: 100, version_no: 1 }, models: null, provider: "openrouter", providerKeyConfigured: false, spendControlApproved: false, enableGateOpen: false, environment: "staging" };
const auth = { access_token: `fictional-${owner}`, refresh_token: "fictional-refresh", token_type: "bearer", expires_in: 3600, expires_at: Math.floor(Date.now() / 1000) + 3600, user: { id: owner, aud: "authenticated", role: "authenticated", email: "owner@example.test", email_confirmed_at: "2026-09-01T00:00:00Z", app_metadata: { provider: "email", providers: ["email"] }, user_metadata: {}, identities: [], created_at: "2026-09-01T00:00:00Z" } };
const reply = (route: Route, status: number, body: unknown) => route.fulfill({ status, contentType: "application/json", body: JSON.stringify(body) });
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

async function openOwner(page: Page, handler: (route: Route, body: Record<string, any>) => Promise<unknown> | unknown) {
  await page.addInitScript(value => localStorage.setItem("sb-mcy-playwright-auth-token", JSON.stringify(value)), auth);
  await page.route("https://*.supabase.co/**", route => route.abort("blockedbyclient"));
  await page.route(ownerEndpoint, route => reply(route, 200, ownerPayload));
  await page.route(teacherEndpoint, route => handler(route, route.request().postDataJSON()));
  await page.goto("/?workspace=owner");
  await expect(page.getByRole("heading", { name: "Mời giáo viên" })).toBeVisible();
}

test("the Owner invites a teacher with one normalized address and one idempotency key per address", async ({ page }) => {
  const sent: Record<string, any>[] = [];
  await openOwner(page, (route, body) => {
    sent.push(body);
    expect(route.request().headers().authorization).toBe(`Bearer fictional-${owner}`);
    return reply(route, 200, { status: sent.length === 1 ? "sent" : "already_sent" });
  });
  await expect(page.getByText("ĐANG KHÓA", { exact: true })).toHaveCount(0);
  const field = page.getByLabel("Email giảng viên");
  const button = page.getByRole("button", { name: "Gửi lời mời" });
  await expect(button).toBeDisabled();
  await field.fill("  Pilot.Teacher@Example.test ");
  await button.click();
  await expect(page.getByRole("status").filter({ hasText: "Đã gửi lời mời." })).toBeVisible();
  await expect(field).toHaveValue("");
  await field.fill("pilot.teacher@example.test");
  await button.click();
  await expect(page.getByText("đã được gửi trước đó", { exact: false })).toBeVisible();
  expect(sent).toHaveLength(2);
  expect(sent[0]).toEqual({ action: "invite_teacher", email: "pilot.teacher@example.test", idempotency_key: sent[0].idempotency_key });
  expect(sent[0].idempotency_key).toMatch(UUID);
  expect(sent[1].idempotency_key).toBe(sent[0].idempotency_key);
  expect(sent[0].actor_id).toBeUndefined();
  expect(sent[0].role).toBeUndefined();
  const stored = await page.evaluate(() => JSON.stringify({ ...localStorage }) + JSON.stringify({ ...sessionStorage }));
  expect(stored.includes("pilot.teacher")).toBe(false);
});

test("an existing account is reported honestly with the next step for the Owner", async ({ page }) => {
  await openOwner(page, route => reply(route, 200, { status: "existing_account" }));
  await page.getByLabel("Email giảng viên").fill("member@example.test");
  await page.getByRole("button", { name: "Gửi lời mời" }).click();
  await expect(page.getByRole("status").filter({ hasText: "không gửi thư" })).toContainText("Gửi liên kết xác minh");
});

test("an existing learner account that received the instructions email is reported as emailed", async ({ page }) => {
  await openOwner(page, route => reply(route, 200, { status: "sent_existing_account" }));
  await page.getByLabel("Email giảng viên").fill("member@example.test");
  await page.getByRole("button", { name: "Gửi lời mời" }).click();
  await expect(page.getByRole("status").filter({ hasText: "đã gửi thư hướng dẫn" })).toContainText("72 giờ");
});

test("a status this page does not know (an old tab after a server update) asks for a reload and never says nothing was sent", async ({ page }) => {
  await openOwner(page, route => reply(route, 200, { status: "some_newer_status" }));
  await page.getByLabel("Email giảng viên").fill("member@example.test");
  await page.getByRole("button", { name: "Gửi lời mời" }).click();
  await expect(page.getByRole("status").filter({ hasText: "trang này là bản cũ" })).toContainText("tải lại trang");
  await expect(page.getByText("Chưa gửi được lời mời")).toHaveCount(0);
});

test("an Owner or staff address is refused without an invitation or email", async ({ page }) => {
  await openOwner(page, route => reply(route, 200, { status: "existing_staff_account" }));
  await page.getByLabel("Email giảng viên").fill("staff@example.test");
  await page.getByRole("button", { name: "Gửi lời mời" }).click();
  await expect(page.getByRole("status").filter({ hasText: "tài khoản quản trị" })).toContainText("không tạo lời mời và không gửi thư");
});

test("closed gates, a non-Owner and an unconfirmed delivery never claim an invitation was sent", async ({ page }) => {
  const codes = [
    [404, "teacher_invites_unavailable", "chưa mở chức năng mời"],
    [403, "owner_access_required", "chưa được cấp quyền Owner"],
    [503, "invitation_delivery_unconfirmed", "không tự gửi lại"],
    [409, "invitation_in_progress", "đang được gửi"],
  ] as const;
  let call = 0;
  await openOwner(page, route => { const [status, error] = codes[call++]; return reply(route, status, { error }); });
  const field = page.getByLabel("Email giảng viên");
  for (const [, , text] of codes) {
    await field.fill("pilot@example.test");
    await page.getByRole("button", { name: "Gửi lời mời" }).click();
    await expect(page.getByRole("alert")).toContainText(text);
    await expect(page.getByText("Đã gửi lời mời.")).toHaveCount(0);
  }
});

test("an invalid address is refused in the browser without calling the server", async ({ page }) => {
  let calls = 0;
  await openOwner(page, route => { calls++; return reply(route, 200, { status: "sent" }); });
  // "a@b" passes the browser's own email check but has no domain dot, so the box refuses it.
  await page.getByLabel("Email giảng viên").fill("a@b");
  await page.getByRole("button", { name: "Gửi lời mời" }).click();
  await expect(page.getByRole("alert")).toContainText("Email chưa hợp lệ");
  expect(calls).toBe(0);
});
