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
  // Position is counted inside this group, and the tags repeat the finder's title-based labels and the clip length.
  await expect(page.locator(".mcy-course-featured-copy .mcy-course-lesson-number")).toHaveText("BÀI 6 / 18 · 0:17");
  const tags = page.locator(".mcy-course-lesson-tags li");
  await expect(tags).toHaveText(["Cổ và vai", "Lưng", "Dưới 30 giây"]);
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

test("welcome shows the Owner-approved benefit lines (2026-10-23)", async ({ page }) => {
  await page.goto("/?mode=web");
  const benefits = page.locator(".mcy-welcome-benefits > div");
  await expect(benefits).toHaveText(["Khám phá cơ thể qua từng chuyển động", "Lắng nghe cơ thể, thấu hiểu chính mình", "Chọn lộ trình riêng, tập theo nhịp của bạn"]);
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

test("choosing another lesson, or Next, brings its poster back into view and playback state stays beside the player", async ({ page }) => {
  await openDiscover(page);
  await page.getByRole("button", { name: /Một chút chuyển động nhẹ/ }).click();
  const detail = page.locator('[data-testid="flow-current"]').last();
  await expect(detail.getByRole("heading", { name: "Một chút chuyển động nhẹ" })).toBeVisible();
  // Previous/Next sit under the player, not under the lesson copy.
  const placement = await detail.locator(".mcy-course-featured").evaluate(card => ({ video: card.querySelector(".mcy-course-video")!.getBoundingClientRect().bottom, nav: card.querySelector(".mcy-course-lesson-navigation")!.getBoundingClientRect().top, copy: card.querySelector(".mcy-course-featured-copy")!.getBoundingClientRect().top }));
  expect(placement.nav).toBeGreaterThanOrEqual(placement.video - 1);
  expect(placement.nav).toBeLessThan(placement.copy);

  // Play: the loading status appears right under the player, in the same view.
  await detail.locator(".mcy-course-play").click();
  const status = detail.getByTestId("course-player-status");
  await expect(status).toBeVisible();
  const state = await detail.locator(".mcy-course-featured").evaluate(card => ({ video: card.querySelector(".mcy-course-video")!.getBoundingClientRect().bottom, status: card.querySelector("[data-testid=course-player-status]")!.getBoundingClientRect().top }));
  expect(state.status - state.video).toBeLessThan(40);

  // A lesson far down the list: after choosing it the new poster is on screen again.
  const row = detail.locator(".mcy-course-lesson").nth(9);
  await row.scrollIntoViewIfNeeded();
  await row.click();
  await expect(detail.locator(".mcy-course-featured-copy h2")).toContainText("10 ·");
  await expect(detail.locator(".mcy-course-play")).toBeInViewport({ ratio: 0.6 });
  await expect.poll(async () => (await detail.locator(".mcy-course-video").boundingBox())!.y, { timeout: 5_000 }).toBeGreaterThan(0);

  // Next works from where the player is and keeps the new poster and the buttons in view together.
  await detail.getByTestId("course-lesson-navigation").getByRole("button", { name: /Video tiếp theo|Next video/ }).click();
  await expect(detail.locator(".mcy-course-featured-copy h2")).toContainText("11 ·");
  await expect(detail.locator(".mcy-course-play")).toBeInViewport({ ratio: 0.6 });
  await expect(detail.getByTestId("course-lesson-navigation")).toBeInViewport();
});

test("saved and opened lessons are remembered on this device only, and can be cleared", async ({ page }) => {
  await openDiscover(page);
  await expect(page.getByTestId("my-lessons")).toHaveCount(0);
  await page.getByRole("button", { name: /Một chút chuyển động nhẹ/ }).click();
  const detail = page.locator('[data-testid="flow-current"]').last();
  await detail.getByRole("button", { name: "Lưu bài này" }).click();
  await expect(detail.getByRole("button", { name: "Đã lưu trên máy này" })).toHaveAttribute("aria-pressed", "true");
  // Pressing Play counts as "opened", never as "watched".
  await detail.locator(".mcy-course-play").click();
  const firstRow = detail.locator(".mcy-course-lesson").first();
  await expect(firstRow).toContainText("đã lưu");
  await expect(firstRow).toContainText("đã mở");
  const stored = await page.evaluate(() => window.localStorage.getItem("mcy.lessonMemory.v1"));
  expect(JSON.parse(stored!)).toMatchObject({ saved: [{ courseId: "gentle", lessonId: "01" }], opened: [{ courseId: "gentle", lessonId: "01" }], last: { courseId: "gentle", lessonId: "01" } });

  await page.getByRole("button", { name: "Quay lại" }).click();
  const mine = page.getByTestId("my-lessons");
  await expect(mine).toContainText("Gần đây");
  await expect(mine).toContainText("Đã lưu");
  await expect(mine).toContainText("không gửi đi");
  await mine.getByRole("button", { name: /01 · Thư giãn nhẹ/ }).first().click();
  await expect(page.locator(".mcy-course-featured-copy h2")).toHaveText("01 · Thư giãn nhẹ");
  await page.getByRole("button", { name: "Quay lại" }).click();
  await page.getByTestId("my-lessons").getByRole("button", { name: "Xóa danh sách này khỏi máy" }).click();
  await expect(page.getByTestId("my-lessons")).toHaveCount(0);
  expect(JSON.parse((await page.evaluate(() => window.localStorage.getItem("mcy.lessonMemory.v1")))!)).toEqual({ saved: [], opened: [], last: null, progress: {} });
});
