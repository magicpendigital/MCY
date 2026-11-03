# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: practice-flow.spec.ts >> reviewed plan and explicit start/reflection in iphone simulator
- Location: .vercel\ux-step4-3-20261016\tests\practice-flow.spec.ts:38:46

# Error details

```
Test timeout of 20000ms exceeded.
```

```
Error: mouse.move: Test timeout of 20000ms exceeded.
```

# Page snapshot

```yaml
- generic [ref=e3]:
  - 'button "Preview device: iPhone" [ref=e5] [cursor=pointer]':
    - generic [ref=e6]: iPhone
    - img [ref=e7]
  - generic [ref=e10]:
    - img
    - generic [ref=e11]:
      - generic "Device status bar":
        - generic: 1:27
        - generic:
          - img
      - generic [ref=e13]:
        - banner [ref=e14]:
          - generic [ref=e15]:
            - button "Quay lại" [ref=e16]:
              - img [ref=e17]
            - generic "Buổi học hôm nay" [ref=e19]: Một chút yoga
        - generic [ref=e20]:
          - generic:
            - generic:
              - generic:
                - generic:
                  - generic:
                    - main:
                      - generic:
                        - text: Bước 2 / 2
                        - generic: Năng lượng và thời gian
                      - heading [level=1]: Một khoảng cho mình.
                      - paragraph: Chọn nội dung đã duyệt cùng AI, hoặc tự xem thư viện.
                      - generic:
                        - region:
                          - heading [level=2]: Bạn có khoảng bao lâu?
                          - generic:
                            - button:
                              - generic: "5"
                              - generic: phút
                            - button [pressed]:
                              - generic: "10"
                              - generic: phút
                            - button:
                              - generic: "15"
                              - generic: phút
                          - paragraph: AI dùng giới hạn này để chọn trong nội dung đã duyệt. Thư viện vẫn không lọc theo thời gian.
                        - region:
                          - heading [level=2]:
                            - text: Năng lượng hôm nay
                            - generic: (không bắt buộc)
                          - paragraph: Nằm trong nháp. Gửi cùng lựa chọn khi bạn xác nhận với AI.
                          - generic:
                            - button:
                              - img
                              - generic: Rất thấp
                            - button:
                              - img
                              - generic: Thấp
                            - button:
                              - img
                              - generic: Bình thường
                            - button:
                              - img
                              - generic: Khá ổn
                            - button:
                              - img
                              - generic: Tràn đầy
                        - generic:
                          - generic:
                            - strong: Cảm nhận cơ thể
                            - generic: Chưa ghi nhận
                          - button: Sửa
                        - paragraph: Bạn chưa cho phép lưu check-in. Các lựa chọn vẫn nằm trong nháp hiện tại.
                        - button: Chỉ ghi lại cảm nhận hôm nay, không chọn bài
                        - generic:
                          - img
                          - text: Bạn chỉ cần chia sẻ điều mình thấy. Đây không phải đánh giá sức khỏe.
          - main [ref=e26]:
            - generic [ref=e27]: BUỔI HỌC HÔM NAY
            - heading "Fictional reviewed session" [level=1] [ref=e28]
            - paragraph [ref=e29]: 5 phút · phiên bản aaaaaaaa · Fictional reviewer
            - region "Nội dung buổi tập" [ref=e30]:
              - img "Fictional content"
              - navigation "Các phần của bài học" [ref=e31]:
                - button "1 Fictional content" [pressed] [ref=e32]:
                  - text: "1"
                  - generic [ref=e33]: Fictional content
              - generic [ref=e34]:
                - generic [ref=e35]: PHẦN 1 / 1
                - heading "Fictional content" [level=2] [ref=e36]
                - paragraph [ref=e37]: Offline fixture, not an exercise.
                - paragraph [ref=e38]: Bạn có thể đọc nội dung ở trên; phần này chưa có audio.
            - button "Tôi đã thực hành · ghi cảm nhận" [ref=e39]
            - paragraph [ref=e40]: MCY không tự xác nhận bạn đã hoàn thành bài học. Phản hồi là tùy chọn.
            - button "Dừng tại đây" [ref=e42]
      - img
      - generic:
        - img
```

# Test source

```ts
  1   | import { expect, test, type Page, type Route } from "@playwright/test";
  2   | import { SESSION } from "./fixtures/practice-harness.mjs";
  3   | 
  4   | const actor = "11111111-1111-4111-8111-111111111111";
  5   | async function seedSession(page: Page) {
  6   |   await page.addInitScript(({ actor }) => localStorage.setItem("sb-mcy-playwright-auth-token", JSON.stringify({ access_token: "fictional-ui-token", refresh_token: "fictional-ui-refresh", token_type: "bearer", expires_at: Math.floor(Date.now() / 1000) + 3600, expires_in: 3600, user: { id: actor, email: "learner@example.test", aud: "authenticated", role: "authenticated", email_confirmed_at: "2026-01-01T00:00:00Z", app_metadata: {}, user_metadata: {}, identities: [], created_at: "2026-01-01T00:00:00Z" } })), { actor });
  7   |   await page.route("https://*.supabase.co/**", route => route.abort("blockedbyclient"));
  8   | }
  9   | async function learner(page: Page, handle: (route: Route, body: any) => Promise<void>, available = true) {
  10  |   await seedSession(page);
  11  |   await page.route("https://mcy-playwright.invalid/**", async route => {
  12  |     const path = new URL(route.request().url()).pathname;
  13  |     if (path.endsWith("/mcy-ai-assistant")) {
  14  |       const body = route.request().postDataJSON();
  15  |       if (body.action === "capability") return route.fulfill({ json: { available, contractVersion: "reviewed-practice-1" } });
  16  |       return handle(route, body);
  17  |     }
  18  |     if (path.endsWith("/profiles")) { const isB = route.request().headers().authorization?.endsWith("fictional-b-token"); return route.fulfill({ json: { id: isB ? "77777777-7777-4777-8777-777777777777" : actor, display_name: isB ? "B fixture" : "UI fixture", locale: "vi-VN", preferences: {} } }); }
  19  |     if (path.endsWith("/get_my_consent_state")) return route.fulfill({ json: { terms: true, privacy: true, ai_processing: true, wellbeing_data: false } });
  20  |     if (path.endsWith("/get_my_consent_policy_versions")) return route.fulfill({ json: { terms: "terms-review-0.1", privacy: "privacy-review-0.1", ai_processing: "ai-processing-review-1.0" } });
  21  |     if (path.endsWith("/checkins")) return route.fulfill({ json: [] });
  22  |     throw new Error(`Unmocked fixture request: ${path}`);
  23  |   });
  24  | }
  25  | async function enterPractice(page: Page, query = "?mode=web") {
  26  |   await page.goto(`/${query}`);
  27  |   await page.getByRole("button", { name: "Bắt đầu check-in", exact: true }).click();
  28  |   await page.getByRole("button", { name: "Tiếp: năng lượng và thời gian" }).click();
  29  |   await page.getByRole("button", { name: "Chọn buổi hôm nay cùng AI" }).click();
  30  |   await expect(page.getByRole("heading", { name: "Một buổi phù hợp với hôm nay." })).toBeVisible();
  31  |   await page.getByRole("button", { name: "Nhịp chậm", exact: true }).click();
  32  |   await page.getByRole("button", { name: "Nhiều hướng dẫn", exact: true }).click();
  33  |   await page.getByRole("button", { name: "Không nằm sàn", exact: true }).click();
  34  | }
  35  | const choose = (page: Page) => page.getByRole("button", { name: "Chọn buổi từ danh mục đã duyệt" }).click();
  36  | const selected = (body: any) => ({ status: "selected", contextRevision: body.context.revision, requestId: body.requestId, plan: SESSION, reason: "5 phút · nhịp chậm · không nằm sàn. Nội dung từ danh mục đã duyệt." });
  37  | 
  38  | for (const device of ["iphone", "pixel-10"]) test(`reviewed plan and explicit start/reflection in ${device} simulator`, async ({ page }) => {
  39  |   const calls: any[] = [];
  40  |   await learner(page, async (route, body) => { calls.push(body); await route.fulfill({ json: selected(body) }); });
  41  |   await enterPractice(page, `?mode=review&device=${device}`); await choose(page);
  42  |   await expect(page.getByRole("region", { name: "Kế hoạch hôm nay" })).toContainText("Fictional reviewed session");
  43  |   await expect(page.getByRole("region", { name: "Kế hoạch hôm nay" })).toContainText("5 phút");
  44  |   expect(calls).toHaveLength(1); expect(calls[0].context.floor).toBe("avoid"); expect(calls[0]).not.toHaveProperty("history");
  45  |   await page.getByRole("region", { name: "Kế hoạch hôm nay" }).scrollIntoViewIfNeeded();
  46  |   await page.mouse.move(0, 0);
  47  |   await page.screenshot({ path: `analyse/ux-step4-3-2026-10-16/plan-fixture-${device}.png`, animations: "disabled" });
  48  |   await page.getByRole("button", { name: "Xác nhận và mở buổi học" }).click();
  49  |   await expect(page.getByRole("region", { name: "Nội dung buổi tập" })).toBeVisible();
  50  |   expect(calls).toHaveLength(2); expect(calls[1]).toMatchObject({ action: "start_plan", sessionId: SESSION.id, contentVersion: SESSION.version });
> 51  |   await page.mouse.move(0, 0);
      |                    ^ Error: mouse.move: Test timeout of 20000ms exceeded.
  52  |   await page.screenshot({ path: `analyse/ux-step4-3-2026-10-16/practice-fixture-${device}.png`, animations: "disabled" });
  53  |   await page.getByRole("button", { name: "Tôi đã thực hành · ghi cảm nhận", exact: true }).click();
  54  |   await page.getByRole("button", { name: "Khó chịu hơn", exact: true }).click();
  55  |   await expect(page.locator(".mcy-alert")).toContainText("không tự gợi bài");
  56  |   expect(calls).toHaveLength(2);
  57  | });
  58  | 
  59  | test("no match and quota failure keep preferences and permit manual browsing without automatic retry", async ({ page }) => {
  60  |   let calls = 0;
  61  |   await learner(page, async (route, body) => { calls++; if (calls === 1) await route.fulfill({ status: 429, json: { error: "ai_usage_limit_reached" } }); else await route.fulfill({ json: { status: "no_match", contextRevision: body.context.revision } }); });
  62  |   await enterPractice(page); await choose(page);
  63  |   await expect(page.getByRole("alert")).toContainText("giới hạn lượt");
  64  |   await expect(page.getByRole("button", { name: "Nhịp chậm", exact: true })).toHaveAttribute("aria-pressed", "true");
  65  |   expect(calls).toBe(1); await choose(page);
  66  |   await expect(page.getByRole("status")).toContainText("Chưa có buổi phù hợp"); expect(calls).toBe(2);
  67  |   await page.getByRole("button", { name: "Tự chọn trong thư viện", exact: true }).click();
  68  |   await expect(page.getByTestId("free-course-catalog")).toBeVisible(); expect(calls).toBe(2);
  69  | });
  70  | 
  71  | test("late plan is discarded when current preferences change", async ({ page }) => {
  72  |   let release: () => void = () => {};
  73  |   const delayed = new Promise<void>(resolve => { release = resolve; });
  74  |   let received = false;
  75  |   await learner(page, async (route, body) => { received = true; await delayed; await route.fulfill({ json: selected(body) }).catch(() => {}); });
  76  |   await enterPractice(page); await choose(page); await expect.poll(() => received).toBe(true);
  77  |   await page.getByRole("button", { name: "Nhịp vừa", exact: true }).click(); release();
  78  |   await expect(page.getByRole("button", { name: "Nhịp vừa", exact: true })).toHaveAttribute("aria-pressed", "true");
  79  |   await expect(page.getByRole("region", { name: "Kế hoạch hôm nay" })).toHaveCount(0);
  80  |   await expect(page.getByRole("button", { name: "Chọn buổi từ danh mục đã duyệt" })).toBeEnabled();
  81  | });
  82  | 
  83  | test("account switch invalidates pending plan and clears previous account preferences", async ({ page }) => {
  84  |   let release: () => void = () => {}; const delayed = new Promise<void>(resolve => { release = resolve; }); let received = false;
  85  |   await learner(page, async (route, body) => { received = true; await delayed; await route.fulfill({ json: selected(body) }).catch(() => {}); });
  86  |   await enterPractice(page); await choose(page); await expect.poll(() => received).toBe(true);
  87  |   await page.evaluate(() => { const key = "sb-mcy-playwright-auth-token"; const s = JSON.parse(localStorage.getItem(key)!); s.user.id = "77777777-7777-4777-8777-777777777777"; s.user.email = "b@example.test"; s.access_token = "fictional-b-token"; localStorage.setItem(key, JSON.stringify(s)); const channel = new BroadcastChannel(key); channel.postMessage({ event: "SIGNED_IN", session: s }); channel.close(); });
  88  |   await expect(page.getByRole("button", { name: "Nhịp chậm", exact: true })).toHaveAttribute("aria-pressed", "false"); release();
  89  |   await expect(page.getByRole("region", { name: "Kế hoạch hôm nay" })).toHaveCount(0);
  90  |   await expect(page.getByRole("button", { name: "Nhiều hướng dẫn", exact: true })).toHaveAttribute("aria-pressed", "false");
  91  | });
  92  | 
  93  | test("consent withdrawal through privacy invalidates pending plan and blocks a new request", async ({ page }) => {
  94  |   let release: () => void = () => {}; const delayed = new Promise<void>(resolve => { release = resolve; }); let calls = 0;
  95  |   await learner(page, async (route, body) => { calls++; await delayed; await route.fulfill({ json: selected(body) }).catch(() => {}); });
  96  |   await page.route("https://mcy-playwright.invalid/rest/v1/rpc/record_my_consent", route => route.fulfill({ json: "99999999-9999-4999-8999-999999999999" }));
  97  |   await enterPractice(page); await choose(page); await expect.poll(() => calls).toBe(1);
  98  |   await page.getByRole("button", { name: "Quay lại", exact: true }).click();
  99  |   // Returning to privacy uses the real app navigation; no state injection.
  100 |   await page.getByRole("button", { name: "Quay lại", exact: true }).click();
  101 |   await page.locator('.flow-fixed-footer').getByRole("button", { name: "Cá nhân", exact: true }).click();
  102 |   await page.getByRole("button", { name: /Quyền riêng tư/ }).click();
  103 |   const aiPrivacy = page.locator(".mcy-toggle-row").filter({ hasText: "Dùng check-in với trợ lý AI" });
  104 |   await aiPrivacy.getByRole("button", { name: /Rút đồng ý/ }).click();
  105 |   await expect(aiPrivacy.getByRole("button", { name: "Dùng check-in với trợ lý AI · Đồng ý", exact: true })).toHaveAttribute("aria-pressed", "false"); release();
  106 |   await expect(page.getByRole("region", { name: "Kế hoạch hôm nay" })).toHaveCount(0); expect(calls).toBe(1);
  107 |   await page.getByRole("button", { name: "Quay lại", exact: true }).click();
  108 |   await page.locator('.flow-fixed-footer').getByRole("button", { name: "Hôm nay", exact: true }).click();
  109 |   await page.getByRole("button", { name: "Bắt đầu check-in", exact: true }).click();
  110 |   await page.getByRole("button", { name: "Chọn buổi hôm nay cùng AI" }).click();
  111 |   await expect(page.getByRole("button", { name: "Xem Quyền riêng tư" })).toBeVisible();
  112 |   await expect(page.getByRole("button", { name: "Chọn buổi từ danh mục đã duyệt" })).toHaveCount(0); expect(calls).toBe(1);
  113 | });
  114 | 
  115 | test("stop remains available offline and cannot trigger another model request", async ({ page, context }) => {
  116 |   let calls = 0; await learner(page, async (route, body) => { calls++; await route.fulfill({ json: selected(body) }); });
  117 |   await enterPractice(page); await choose(page);
  118 |   await page.getByRole("button", { name: "Xác nhận và mở buổi học" }).click();
  119 |   await expect(page.getByRole("region", { name: "Nội dung buổi tập" })).toBeVisible();
  120 |   await context.setOffline(true); await page.getByRole("button", { name: "Dừng tại đây", exact: true }).click();
  121 |   await expect(page.getByRole("heading", { name: "Bạn có thể dừng tại đây." })).toBeVisible();
  122 |   await expect(page.getByText("Nội dung an toàn này luôn hiện được khi mất mạng.", { exact: false })).toBeVisible();
  123 |   await expect(page.getByRole("button", { name: "Chọn buổi từ danh mục đã duyệt" })).toHaveCount(0);
  124 |   await expect(page.locator("audio")).toHaveCount(0); expect(calls).toBe(2);
  125 | });
  126 | 
  127 | test("late consent-save success cannot revoke AI consent of a different account", async ({ page }) => {
  128 |   await learner(page, async () => { throw new Error("Unexpected inference"); });
  129 |   let release: () => void = () => {}; const delayed = new Promise<void>(resolve => { release = resolve; }); let writes = 0;
  130 |   await page.route("https://mcy-playwright.invalid/rest/v1/rpc/record_my_consent", async route => { expect(route.request().headers().authorization).toBe("Bearer fictional-ui-token"); writes++; await delayed; await route.fulfill({ json: "99999999-9999-4999-8999-999999999999" }); });
  131 |   await page.goto("/?mode=web"); await page.locator('.flow-fixed-footer').getByRole("button", { name: "Cá nhân", exact: true }).click();
  132 |   await page.getByRole("button", { name: /Quyền riêng tư/ }).click();
  133 |   const aiPrivacy = page.locator(".mcy-toggle-row").filter({ hasText: "Dùng check-in với trợ lý AI" });
  134 |   await aiPrivacy.getByRole("button", { name: /Rút đồng ý/ }).click(); await expect.poll(() => writes).toBe(1);
  135 |   await expect(aiPrivacy.getByRole("button", { name: /Rút đồng ý/ })).toBeDisabled();
  136 |   await expect(page.getByRole("status")).toContainText("Đang lưu lựa chọn quyền"); expect(writes).toBe(1);
  137 |   await page.evaluate(() => { const key = "sb-mcy-playwright-auth-token"; const s = JSON.parse(localStorage.getItem(key)!); s.user.id = "77777777-7777-4777-8777-777777777777"; s.user.email = "b@example.test"; s.access_token = "fictional-b-token"; localStorage.setItem(key, JSON.stringify(s)); const channel = new BroadcastChannel(key); channel.postMessage({ event: "SIGNED_IN", session: s }); channel.close(); });
  138 |   await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem("sb-mcy-playwright-auth-token")!).user.id)).toBe("77777777-7777-4777-8777-777777777777");
  139 |   // Wait for new-account hydration before releasing the old account's RPC reply.
  140 |   await expect(page.locator(".mcy-account-home h1")).toContainText("B fixture");
  141 |   const replied = page.waitForResponse(r => r.url().endsWith("/record_my_consent")); release(); await replied;
  142 |   await expect(aiPrivacy.getByRole("button", { name: /Rút đồng ý/ })).toBeVisible(); expect(writes).toBe(1);
  143 | });
  144 | 
  145 | test("closed capability preserves manual entry and never exposes a sample as reviewed AI content", async ({ page }) => {
  146 |   await learner(page, async () => { throw new Error("Unexpected model request"); }, false);
  147 |   await page.goto("/?mode=web"); await page.getByRole("button", { name: "Bắt đầu check-in", exact: true }).click();
  148 |   await page.getByRole("button", { name: "Tiếp: năng lượng và thời gian" }).click();
  149 |   await expect(page.getByRole("button", { name: "Chọn buổi hôm nay cùng AI" })).toHaveCount(0);
  150 |   await expect(page.getByRole("button", { name: "Tự chọn bài học video miễn phí", exact: true })).toBeVisible();
  151 | });
```