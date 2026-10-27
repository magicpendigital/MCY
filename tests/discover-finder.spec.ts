import { expect, test, type Page } from "@playwright/test";

test.use({ viewport: { width: 390, height: 844 } });

async function openDiscover(page: Page) {
  await page.goto("/?mode=web");
  await page.getByRole("button", { name: "Trải nghiệm thử" }).click();
  await page.getByRole("button", { name: "Tìm bài học ngắn" }).click();
  await expect(page.getByTestId("lesson-finder")).toBeVisible();
}
const nav = (page: Page, name: string) => page.locator('[data-testid="flow-fixed-footer"]').getByRole("button", { name, exact: true });

test("the finder lists matching lessons by area and length and opens the chosen lesson", async ({ page }) => {
  await openDiscover(page);
  const finder = page.getByTestId("lesson-finder");
  await expect(finder.locator(".mcy-finder-row")).toHaveCount(0);
  await finder.getByRole("button", { name: "Cổ và vai", exact: true }).click();
  await expect(finder.getByRole("button", { name: "Cổ và vai", exact: true })).toHaveAttribute("aria-pressed", "true");
  const rows = finder.locator(".mcy-finder-row");
  expect(await rows.count()).toBeGreaterThanOrEqual(3);
  await expect(finder.locator(".mcy-finder-count")).toContainText("bài phù hợp");
  await finder.getByRole("button", { name: "Dưới 30 giây", exact: true }).click();
  const short = await finder.locator(".mcy-finder-time").allInnerTexts();
  expect(short.length).toBeGreaterThan(0);
  for (const text of short) expect(Number.parseInt(text, 10)).toBeLessThan(30);
  await finder.getByRole("button", { name: "Cổ và vai", exact: true }).click(); // toggles the area off
  await finder.getByRole("button", { name: "Cổ và vai", exact: true }).click();
  await rows.filter({ hasText: "06 · Chuyển động cổ và lưng trên" }).click();
  await expect(page.getByRole("heading", { name: "Một chút chuyển động nhẹ" })).toBeVisible();
  await expect(page.locator(".mcy-course-featured-copy h2")).toHaveText("06 · Chuyển động cổ và lưng trên");
  // The video leads the page: the poster sits above the privacy and caption notes.
  const order = await page.locator(".mcy-course-featured").evaluate(card => ({ video: card.querySelector(".mcy-course-video")!.getBoundingClientRect().top, note: card.querySelector(".mcy-course-source-note")!.getBoundingClientRect().top }));
  expect(order.video).toBeLessThan(order.note);
});

test("home offers the three shortest lessons and a guest's empty Journey invites a first record", async ({ page }) => {
  await openDiscover(page);
  await nav(page, "Hôm nay").click();
  const picks = page.getByTestId("home-quick-picks").locator(".mcy-finder-row");
  await expect(picks).toHaveCount(3);
  const seconds = (await picks.locator(".mcy-finder-time").allInnerTexts()).map(text => Number.parseInt(text, 10));
  expect(seconds).toEqual([...seconds].sort((a, b) => a - b));
  await picks.first().click();
  await expect(page.locator(".mcy-course-featured-copy h2")).toBeVisible();
  await page.getByRole("button", { name: "Quay lại" }).click();
  await nav(page, "Hành trình").click();
  await expect(page.locator(".mcy-journey-empty")).toBeVisible();
  await expect(page.getByRole("button", { name: /Ghi nhận cơ thể hôm nay/ })).toBeVisible();
  await expect(page.locator(".mcy-timeline-carousel")).toHaveCount(0);
  await page.getByRole("button", { name: /Ghi nhận cơ thể hôm nay/ }).click();
  await expect(page.locator("[data-flow-active='true'] .mcy-step-count").last()).toBeVisible();
});

test("welcome states the real value: 38 short free lessons, a private body note, no account", async ({ page }) => {
  await page.goto("/?mode=web");
  const benefits = page.locator(".mcy-welcome-benefits > div");
  await expect(benefits).toHaveText(["38 bài học ngắn, xem miễn phí", "Ghi lại cơ thể hôm nay, riêng tư", "Không cần tài khoản"]);
  await expect(page.getByText("Chọn lộ trình riêng")).toHaveCount(0);
});

test("a guest goes from the body map straight to the finder, with a shortcut the learner can take or ignore", async ({ page }) => {
  await page.goto("/?mode=web");
  await page.getByRole("button", { name: "Trải nghiệm thử" }).click();
  await expect(page.locator(".mcy-step-count")).not.toContainText("Bước");
  await expect(page.locator(".mcy-checkin-progress")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Tiếp: năng lượng và thời gian" })).toHaveCount(0);
  const footer = page.locator('[data-testid="flow-fixed-footer"]');
  await expect(footer.getByRole("button", { name: "Lưu bằng tài khoản" })).toBeVisible();
  await expect(footer.getByRole("button", { name: "Bỏ qua ghi nhận cơ thể" })).toBeVisible();
  // Nothing chosen yet: no standalone record offered.
  await expect(page.getByRole("button", { name: "Chỉ ghi lại cảm nhận hôm nay, không chọn bài" })).toHaveCount(0);

  await page.getByRole("button", { name: "Cổ: Chạm để ghi" }).click();
  await page.getByRole("button", { name: "Hơi mỏi", exact: true }).click();
  await page.getByRole("button", { name: "Lưu vùng này" }).click();
  await expect(page.getByRole("button", { name: "Chỉ ghi lại cảm nhận hôm nay, không chọn bài" })).toBeVisible();
  await footer.getByRole("button", { name: "Tìm bài học ngắn" }).click();

  const finder = page.getByTestId("lesson-finder");
  await expect(finder).toBeVisible();
  const suggestion = page.getByTestId("finder-checkin-suggestion");
  await expect(suggestion).toContainText("Xem bài: Cổ và vai");
  await expect(finder.locator(".mcy-finder-row")).toHaveCount(0); // never pre-filtered
  await suggestion.getByRole("button", { name: "Xem bài: Cổ và vai" }).click();
  await expect(finder.getByRole("button", { name: "Cổ và vai", exact: true })).toHaveAttribute("aria-pressed", "true");
  expect(await finder.locator(".mcy-finder-row").count()).toBeGreaterThan(0);
  await expect(suggestion).toHaveCount(0);
});

test("a guest can skip the body check-in and land on the finder, or save a note without choosing a lesson", async ({ page }) => {
  await page.goto("/?mode=web");
  await page.getByRole("button", { name: "Trải nghiệm thử" }).click();
  await page.locator('[data-testid="flow-fixed-footer"]').getByRole("button", { name: "Bỏ qua ghi nhận cơ thể" }).click();
  await expect(page.getByTestId("lesson-finder")).toBeVisible();
  await expect(page.getByTestId("finder-checkin-suggestion")).toHaveCount(0);

  await page.goto("/?mode=web");
  await page.getByRole("button", { name: "Trải nghiệm thử" }).click();
  await page.locator(".mcy-body-status-actions").getByRole("button", { name: "Mệt", exact: true }).click();
  await page.getByRole("button", { name: "Chỉ ghi lại cảm nhận hôm nay, không chọn bài" }).click();
  await expect(page.getByRole("heading", { name: "Hành trình của bạn" })).toBeVisible();
});
