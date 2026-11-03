# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: unit-review-workspace.spec.ts >> expiry clears the unit and unsaved notes at the lease deadline
- Location: tests\unit-review-workspace.spec.ts:143:1

# Error details

```
Test timeout of 20000ms exceeded.
```

```
Error: locator.click: Test timeout of 20000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: 'Tài liệu trung tính A' })

```

# Page snapshot

```yaml
- generic [ref=e9]:
  - link "Đến nội dung đọc" [ref=e10] [cursor=pointer]:
    - /url: "#unit-review-content"
  - generic [ref=e11]:
    - generic [ref=e12]:
      - text: MỘT CHÚT YOGA · KHÔNG GIAN NỘI BỘ
      - heading "Đọc và đối chiếu bản nháp" [level=1] [ref=e13]
      - paragraph [ref=e14]: Đọc nội dung không tạo buổi thực hành hoặc ghi Hành trình.
    - link "Về ứng dụng" [ref=e15] [cursor=pointer]:
      - /url: /
  - region "Phạm vi phiên local" [ref=e16]:
    - strong [ref=e17]: Chưa có phiên xem nội bộ
    - paragraph [ref=e18]: Không gian này chỉ mở khi dịch vụ local cấp phiên có thời hạn. Không dùng đăng nhập giả hoặc lựa chọn vai trò để mở nội dung.
    - button "Tải lại phạm vi" [ref=e19] [cursor=pointer]
  - alert [ref=e20]:
    - paragraph [ref=e21]: Chưa đối chiếu được với dịch vụ local. Tải lại khi kết nối sẵn sàng.
    - link "Mở cổng phiên local" [ref=e22] [cursor=pointer]:
      - /url: /__mcy_review/v1/bootstrap
  - main
  - paragraph [ref=e24]: Chưa mở phát hành, gợi ý AI hoặc pilot. Review chuyên môn và quyền sử dụng của người thật vẫn là cổng riêng.
```

# Test source

```ts
  1   | import { expect, test, type Page, type Route } from "@playwright/test";
  2   | import type { LocalReviewSession, LocalReviewUnit, LocalReviewUnitSummary } from "../src/review/localReviewContract";
  3   | 
  4   | // Neutral fictional transport only. No canonical text, assets, contacts or identity tokens.
  5   | const base = "/__mcy_review/v1";
  6   | const neutralUnit = (key = "fixture-a"): LocalReviewUnit => ({
  7   |   key, id: `fixture.document.${key}`, revision: "r1", locale: "vi-VN", kind: "reading",
  8   |   title: key === "fixture-a" ? "Tài liệu trung tính A" : "Tài liệu trung tính B", shortTitle: key === "fixture-a" ? "Tài liệu trung tính A" : "Tài liệu trung tính B",
  9   |   sourceHash: "a".repeat(64), mediaAvailable: 0, mediaBlocked: 1, reviewState: "unreviewed",
  10  |   intro: "Văn bản giả để kiểm cách đọc và đối chiếu phiên bản.", learningObjectives: ["Nhận biết nhãn phiên bản."], audience: "Người thử giao diện nội bộ.",
  11  |   prerequisites: ["Chỉ dùng dữ liệu giả."], preparation: ["Đọc thông tin trên màn hình."], stopGuidance: "Có thể đóng tài liệu.",
  12  |   steps: [
  13  |     { id: "section-one", order: 1, title: "Mục văn bản đầu", body: "Đây là đoạn văn trung tính thứ nhất.", detail: null, entry: null, exit: null, alternative: null, stopCue: null, mediaIds: ["missing-one"] },
  14  |     { id: "section-two", order: 2, title: "Mục văn bản sau", body: "Đây là đoạn văn trung tính thứ hai.", detail: null, entry: null, exit: null, alternative: null, stopCue: null, mediaIds: [] },
  15  |   ],
  16  |   media: [{ id: "missing-one", stepId: "section-one", status: "identity_blocked", alt: "Chưa có hình giả được xác định.", caption: "Ô media giả để thử trạng thái thiếu.", assetUrl: null, mime: null }],
  17  |   sourceRefs: [], notes: null,
  18  | });
  19  | const identity = (mode: "owner_local_preview" | "fictional_rehearsal" = "owner_local_preview", expiresAt = new Date(Date.now() + 60_000).toISOString()): LocalReviewSession => ({
  20  |   authenticated: true, mode, bootstrapPath: `${base}/bootstrap`, epoch: "neutral-epoch-one", expiresAt,
  21  |   actorLabel: mode === "owner_local_preview" ? "Phiên xem local được cấp" : "Actor fixture từ máy chủ",
  22  |   permissions: mode === "owner_local_preview" ? ["list", "read", "asset", "note"] : ["list", "read", "asset", "note", "draft", "review"],
  23  | });
  24  | const response = (route: Route, status: number, data: unknown) => route.fulfill({ status, contentType: "application/json", headers: { "Cache-Control": "no-store" }, body: JSON.stringify(data) });
  25  | const summaries = (units: LocalReviewUnit[]): LocalReviewUnitSummary[] => units.map(unit => ({ ...unit }));
  26  | async function arrange(page: Page, options: {
  27  |   session?: () => LocalReviewSession;
  28  |   read?: (route: Route, key: string) => Promise<unknown>;
  29  |   mutation?: (route: Route, action: string) => Promise<unknown>;
  30  |   units?: LocalReviewUnit[];
  31  | } = {}) {
  32  |   const units = options.units ?? [neutralUnit()];
  33  |   await page.route("https://*.supabase.co/**", route => route.abort("blockedbyclient"));
  34  |   await page.route("https://mcy-playwright.invalid/**", route => route.abort("blockedbyclient"));
  35  |   await page.route(`**${base}/**`, async route => {
  36  |     const path = new URL(route.request().url()).pathname;
  37  |     const session = options.session?.() ?? identity();
  38  |     if (path === `${base}/session`) return response(route, 200, session);
  39  |     if (path === `${base}/units`) return response(route, 200, { epoch: session.epoch, items: summaries(units) });
  40  |     const parts = path.slice(`${base}/units/`.length).split("/");
  41  |     if (parts.length === 1) {
  42  |       if (options.read) return options.read(route, parts[0]);
  43  |       return response(route, 200, { epoch: session.epoch, unit: units.find(unit => unit.key === parts[0]) });
  44  |     }
  45  |     if (options.mutation) return options.mutation(route, parts[1]);
  46  |     return response(route, 403, { error: { code: "FORBIDDEN", message: "Fictional denial" } });
  47  |   });
  48  |   await page.goto("/?workspace=unit-review&mode=web");
  49  | }
  50  | const selectFirst = async (page: Page) => {
> 51  |   await page.getByRole("button", { name: "Tài liệu trung tính A", exact: false }).click();
      |                                                                                   ^ Error: locator.click: Test timeout of 20000ms exceeded.
  52  |   await expect(page.getByRole("heading", { name: "Tài liệu trung tính A", exact: true })).toBeVisible();
  53  | };
  54  | 
  55  | test("unit review stays closed without a local session and never requests learner auth", async ({ page }) => {
  56  |   let authRequests = 0;
  57  |   page.on("request", request => { if (/supabase|mcy-playwright\.invalid/.test(request.url())) authRequests++; });
  58  |   await page.route(`**${base}/**`, route => response(route, 503, { error: { code: "REVIEW_UNAVAILABLE", message: "Unavailable" } }));
  59  |   await page.goto("/?workspace=unit-review&mode=web");
  60  |   await expect(page.getByRole("alert")).toContainText("Dịch vụ xem nội bộ chưa sẵn sàng");
  61  |   await expect(page.getByRole("link", { name: "Mở cổng phiên local" })).toHaveAttribute("href", `${base}/bootstrap`);
  62  |   await expect(page.getByLabel("Danh sách bản được cấp")).toHaveCount(0);
  63  |   await expect(page.getByRole("textbox")).toHaveCount(0);
  64  |   expect(authRequests).toBe(0);
  65  | });
  66  | 
  67  | test("owner local reader shows exact source and blocked media without practice or review controls", async ({ page }) => {
  68  |   const writes: string[] = [];
  69  |   page.on("request", request => { if (request.method() === "POST") writes.push(request.url()); });
  70  |   await arrange(page); await selectFirst(page);
  71  |   await expect(page.getByText("OWNER LOCAL · XEM NHÁP THẬT, CHƯA DUYỆT", { exact: true })).toBeVisible();
  72  |   await expect(page.getByText("a".repeat(64), { exact: true })).toBeVisible();
  73  |   await expect(page.getByText("Media bị chặn: chưa xác định đúng danh tính", { exact: true })).toBeVisible();
  74  |   await expect(page.getByRole("button", { name: "Mô phỏng ghi kết quả thử" })).toHaveCount(0);
  75  |   await expect(page.getByRole("button", { name: /Bắt đầu tập|Hoàn tất buổi|Xuất bản/ })).toHaveCount(0);
  76  |   await expect(page.locator("#root")).toHaveAttribute("aria-hidden", "true");
  77  |   await page.getByRole("button", { name: "Mục tiếp", exact: true }).click();
  78  |   await expect(page.getByRole("heading", { name: "Mục văn bản sau", exact: true })).toBeFocused();
  79  |   await expect(page.getByText("Đây là đoạn văn trung tính thứ hai.", { exact: true })).toBeVisible();
  80  |   expect(writes).toEqual([]);
  81  | });
  82  | 
  83  | test("notes are explicit lease-version requests and an uncertain result cannot be resubmitted", async ({ page }) => {
  84  |   const bodies: Record<string, unknown>[] = [];
  85  |   await arrange(page, { mutation: async route => {
  86  |     expect(route.request().headers()["x-mcy-review-intent"]).toBe("1");
  87  |     bodies.push(route.request().postDataJSON()); return route.abort("failed");
  88  |   } });
  89  |   await selectFirst(page);
  90  |   await page.getByLabel("Ghi chú riêng của phiên", { exact: true }).fill("Ghi chú giả chỉ để thử UI.");
  91  |   await page.getByRole("button", { name: "Giữ ghi chú tạm trong phiên local" }).click();
  92  |   await expect(page.getByRole("alert")).toContainText("Không gửi lại");
  93  |   await expect(page.getByRole("button", { name: "Giữ ghi chú tạm trong phiên local" })).toBeDisabled();
  94  |   expect(bodies).toEqual([{ epoch: "neutral-epoch-one", revision: "r1", sourceHash: "a".repeat(64), notes: "Ghi chú giả chỉ để thử UI." }]);
  95  |   await page.getByRole("button", { name: "Tải lại phạm vi" }).click();
  96  |   await expect(page.getByLabel("Bản nháp đang đọc")).toHaveCount(0);
  97  | });
  98  | 
  99  | test("fictional rehearsal controls remain visibly fictional and do not appear in owner mode", async ({ page }) => {
  100 |   const actions: string[] = [];
  101 |   await arrange(page, { session: () => identity("fictional_rehearsal"), mutation: async (route, action) => {
  102 |     actions.push(action); return response(route, 200, { epoch: "neutral-epoch-one", unit: { ...neutralUnit(), reviewState: "changes_requested" } });
  103 |   } });
  104 |   await selectFirst(page);
  105 |   await expect(page.getByText("MÔ PHỎNG · DỮ LIỆU TRUNG TÍNH GIẢ", { exact: true })).toBeVisible();
  106 |   await page.getByRole("button", { name: "Mô phỏng yêu cầu chỉnh sửa" }).click();
  107 |   await expect(page.getByRole("status").filter({ hasText: "Đây không phải quyết định duyệt thật" })).toBeVisible();
  108 |   expect(actions).toEqual(["review"]);
  109 | });
  110 | 
  111 | for (const mismatch of ["foreign-epoch", "malformed-unit", "changed-source"] as const) {
  112 |   test(`mutation ${mismatch} clears private DOM immediately`, async ({ page }) => {
  113 |     await arrange(page, { mutation: route => response(route, 200, {
  114 |       epoch: mismatch === "foreign-epoch" ? "another-lease-epoch" : "neutral-epoch-one",
  115 |       unit: mismatch === "malformed-unit" ? { key: "fixture-a" } : { ...neutralUnit(), sourceHash: mismatch === "changed-source" ? "b".repeat(64) : "a".repeat(64) },
  116 |     }) });
  117 |     await selectFirst(page);
  118 |     await page.getByLabel("Ghi chú riêng của phiên", { exact: true }).fill("Ghi chú giả.");
  119 |     await page.getByRole("button", { name: "Giữ ghi chú tạm trong phiên local" }).click();
  120 |     await expect(page.getByRole("alert")).toContainText("không khớp hợp đồng");
  121 |     await expect(page.getByLabel("Bản nháp đang đọc")).toHaveCount(0);
  122 |     await expect(page.getByRole("textbox")).toHaveCount(0);
  123 |   });
  124 | }
  125 | 
  126 | test("a changed session clears private content and rejects a late prior read", async ({ page }) => {
  127 |   let release!: () => void;
  128 |   let started!: () => void;
  129 |   const ready = new Promise<void>(resolve => { started = resolve; });
  130 |   const delayed = new Promise<void>(resolve => { release = resolve; });
  131 |   let revoked = false;
  132 |   await arrange(page, { session: () => revoked ? { ...identity(), authenticated: false, mode: null, epoch: null, expiresAt: null, actorLabel: null, permissions: [] } : identity(), read: async route => {
  133 |     started(); await delayed; return response(route, 200, { epoch: "neutral-epoch-one", unit: neutralUnit() });
  134 |   } });
  135 |   await page.getByRole("button", { name: "Tài liệu trung tính A", exact: false }).click(); await ready;
  136 |   revoked = true; await page.evaluate(() => window.dispatchEvent(new Event("focus")));
  137 |   await expect(page.getByRole("alert")).toContainText("Chưa có phiên xem nội bộ");
  138 |   release();
  139 |   await expect(page.getByLabel("Bản nháp đang đọc")).toHaveCount(0);
  140 |   await expect(page.getByLabel("Ghi chú riêng của phiên", { exact: true })).toHaveCount(0);
  141 | });
  142 | 
  143 | test("expiry clears the unit and unsaved notes at the lease deadline", async ({ page }) => {
  144 |   await page.clock.install();
  145 |   const expiresAt = new Date(Date.now() + 30_000).toISOString();
  146 |   await arrange(page, { session: () => identity("owner_local_preview", expiresAt) }); await selectFirst(page);
  147 |   await page.getByLabel("Ghi chú riêng của phiên", { exact: true }).fill("Ghi chú giả chưa gửi.");
  148 |   await page.clock.fastForward(30_001);
  149 |   await expect(page.getByRole("alert")).toContainText("hết hạn");
  150 |   await expect(page.getByLabel("Bản nháp đang đọc")).toHaveCount(0);
  151 |   await expect(page.getByRole("textbox")).toHaveCount(0);
```