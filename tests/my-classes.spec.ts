import { expect, test, type Page, type Route } from "@playwright/test";
import { CONSENT_POLICY_VERSIONS, emptyConsentState } from "../src/backend/learnerData";

// Fictional signed-in learner against the isolated .invalid backend. It exercises the learner's "Lớp của tôi"
// (probe, list, feedback with source labels); it is not evidence about the real Edge Function or database.
const origin = "https://mcy-playwright.invalid";
const endpoint = `${origin}/functions/v1/teacher-collaboration`;
const key = "sb-mcy-playwright-auth-token";
const A = "33333333-3333-4333-8333-333333333333";
const E1 = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const E2 = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const session = {
  access_token: "fictional-class-a", refresh_token: "fictional-refresh", token_type: "bearer",
  expires_at: Math.floor(Date.now() / 1000) + 3600, expires_in: 3600,
  user: { id: A, email: "class-a@example.test", aud: "authenticated", role: "authenticated", email_confirmed_at: "2026-01-01T00:00:00Z", app_metadata: {}, user_metadata: {}, identities: [], created_at: "2026-01-01T00:00:00Z" },
};
const workspace = { role: "learner", profile: null, documents: [], enrollments: [
  { id: E1, learner_label: "ignored", course_version_id: "11111111-1111-4111-8111-111111111111", completed: false, sessions: [{ id: "s1", lesson_version_id: "x" }, { id: "s2", lesson_version_id: "y" }] },
  { id: E2, learner_label: "ignored", course_version_id: "22222222-2222-4222-8222-222222222222", completed: true, sessions: [] },
] };
const feedback = [
  { id: "f1", kind: "session", attendance_id: "s1", revision: 1, teacher_id: "t", body: "Bản cũ của nhận xét.", provenance: "human", created_at: "2026-10-20T01:00:00Z", sent_at: "2026-10-20T02:00:00Z" },
  { id: "f1", kind: "session", attendance_id: "s1", revision: 2, teacher_id: "t", body: "Bạn giữ nhịp thở đều.\nBuổi sau thử nhẹ hơn.", provenance: "human", created_at: "2026-10-21T01:00:00Z", sent_at: "2026-10-21T02:00:00Z" },
  { id: "f2", kind: "course", attendance_id: null, revision: 1, teacher_id: "t", body: "Cả khóa bạn tiến bộ đều.", provenance: "ai_assisted_teacher_confirmed", created_at: "2026-10-25T01:00:00Z", sent_at: "2026-10-25T02:00:00Z" },
  { id: "f3", kind: "session", attendance_id: "s2", revision: 1, teacher_id: "t", body: "Chưa gửi, không được hiện.", provenance: "human", created_at: "2026-10-26T01:00:00Z", sent_at: null },
];

type Handler = (body: { action: string; payload: Record<string, unknown> }, route: Route) => Promise<unknown>;
async function backend(page: Page, handler: Handler) {
  const calls: { action: string; payload: Record<string, unknown> }[] = [];
  const unexpected: string[] = [];
  await page.addInitScript(({ key, value }) => { if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify(value)); }, { key, value: session });
  await page.route("https://*.supabase.co/**", route => { unexpected.push("forbidden-staging-host"); return route.abort("blockedbyclient"); });
  await page.route(origin + "/**", async route => {
    const request = route.request(), pathname = new URL(request.url()).pathname;
    if (pathname.endsWith("/profiles")) return route.fulfill({ json: { user_id: A, display_name: "Class A", locale: "vi-VN", body_display_preference: "neutral" } });
    if (pathname.endsWith("/get_my_consent_state")) return route.fulfill({ json: { ...emptyConsentState, terms: true, privacy: true, wellbeing_data: true } });
    if (pathname.endsWith("/get_my_consent_policy_versions")) return route.fulfill({ json: CONSENT_POLICY_VERSIONS });
    if (pathname.endsWith("/checkins") || pathname.endsWith("/checkin_observations")) return route.fulfill({ json: [] });
    if (pathname.endsWith("/user")) return route.fulfill({ json: session.user });
    if (pathname.endsWith("/mcy-ai-assistant")) return route.fulfill({ json: { available: false, contractVersion: "reviewed-practice-1" } });
    if (pathname.endsWith("/owner-control-plane")) return route.fulfill({ status: 403, json: { error: "content_review_access_required" } });
    if (request.url() === endpoint) {
      expect(request.headers().authorization).toBe("Bearer fictional-class-a");
      const body = request.postDataJSON();
      calls.push(body);
      return handler(body, route);
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
  await expect(page.locator(".mcy-account-home h1")).toHaveText("Chào, Class A.");
}

test("an enrolled learner opens a class and sees only sent feedback, newest revision, with its source", async ({ page }) => {
  const fixture = await backend(page, (body, route) => body.action === "workspace" ? reply(route, 200, { result: workspace }) : reply(route, 200, { result: feedback }));
  await openProfile(page);
  await page.getByRole("button", { name: /Lớp của tôi/ }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Nhận xét từ giảng viên" })).toBeVisible();
  await expect(page.locator(".mcy-mc-row")).toHaveCount(2);
  await expect(page.locator(".mcy-mc-row").first()).toContainText("2 buổi đã ghi nhận · đang học");
  await expect(page.locator(".mcy-mc-row").nth(1)).toContainText("đã kết thúc khóa");

  await page.locator(".mcy-mc-row").first().click();
  await expect(page.getByRole("heading", { level: 1, name: "Lớp 1" })).toBeVisible();
  const cards = page.locator(".mcy-mc-feedback");
  await expect(cards).toHaveCount(2);
  // Newest sent first; the older revision and the unsent draft are not shown.
  await expect(cards.first()).toContainText("KẾT THÚC KHÓA");
  await expect(cards.first()).toContainText("AI hỗ trợ · giảng viên đã kiểm tra và xác nhận");
  await expect(cards.nth(1)).toContainText("SAU MỘT BUỔI TẬP");
  await expect(cards.nth(1)).toContainText("Giảng viên viết");
  await expect(cards.nth(1)).toContainText("Buổi sau thử nhẹ hơn.");
  await expect(cards.nth(1)).toContainText("bản cập nhật 2");
  await expect(page.getByText("Bản cũ của nhận xét.")).toHaveCount(0);
  await expect(page.getByText("Chưa gửi, không được hiện.")).toHaveCount(0);
  await expect(page.locator(".mcy-mc-footnote")).toContainText("không thay lời khuyên y tế");
  // Read-only: no control to reply, send or enrol exists here.
  await expect(page.locator(".mcy-mc-page").getByRole("button", { name: /gửi|đăng ký|tham gia|trả lời/i })).toHaveCount(0);

  expect(fixture.calls).toEqual([{ action: "workspace", payload: {} }, { action: "read_feedback", payload: { enrollment_id: E1 } }]);
  expect(fixture.unexpected).toEqual([]);
});

test("a class with no sent feedback says so, and a failed read offers retry", async ({ page }) => {
  let failFeedback = true;
  await backend(page, (body, route) => body.action === "workspace" ? reply(route, 200, { result: workspace }) : failFeedback ? reply(route, 503, { error: "collaboration_unavailable" }) : reply(route, 200, { result: [] }));
  await openProfile(page);
  await page.getByRole("button", { name: /Lớp của tôi/ }).click();
  await page.locator(".mcy-mc-row").nth(1).click();
  await expect(page.getByRole("alert")).toContainText("Chưa tải được nhận xét");
  failFeedback = false;
  await page.getByRole("button", { name: "Thử lại" }).click();
  await expect(page.getByText("Giảng viên chưa gửi nhận xét nào cho lớp này.")).toBeVisible();
});

test("a learner without a class never sees the entry: closed function, no cohort, not a learner, or no enrolments", async ({ page }) => {
  const cases: { status: number; body: unknown }[] = [
    { status: 404, body: { error: "collaboration_unavailable" } },
    { status: 403, body: { error: "collaboration_access_denied" } },
    { status: 400, body: { error: "invalid_collaboration_request" } },
    { status: 200, body: { result: { ...workspace, role: "author" } } },
    { status: 200, body: { result: { ...workspace, enrollments: [] } } },
  ];
  for (const response of cases) {
    const fixture = await backend(page, (_body, route) => reply(route, response.status, response.body));
    await openProfile(page);
    await expect(page.getByRole("button", { name: /Bảo mật tài khoản/ })).toBeVisible();
    await expect.poll(() => fixture.calls.length).toBe(1);
    await expect(page.getByRole("button", { name: /Lớp của tôi/ })).toHaveCount(0);
    expect(fixture.unexpected).toEqual([]);
    await page.unrouteAll({ behavior: "ignoreErrors" });
    await page.goto("about:blank");
  }
});

test("a guest never calls the class function", async ({ page }) => {
  const calls: string[] = [];
  await page.route(origin + "/**", route => { calls.push(route.request().url()); return route.fulfill({ status: 500, json: {} }); });
  await page.goto("/?mode=web");
  await expect(page.getByRole("button", { name: "Trải nghiệm thử" })).toBeVisible();
  await page.waitForTimeout(1500);
  expect(calls.filter(url => url.includes("teacher-collaboration"))).toEqual([]);
});
