import { expect, test, type Locator, type Page } from "@playwright/test";

test.use({ viewport: { width: 390, height: 844 } });

// Owner decision 2026-11-15: a guest reaches a playing lesson in at most three taps and check-in is optional.
// The YouTube embed is replaced by an empty page, so this proves MCY's own path and the order of Hôm nay, not real playback.
async function stubEmbed(page: Page) {
  await page.route("https://www.youtube-nocookie.com/embed/**", route => route.fulfill({ status: 200, contentType: "text/html", body: "<!doctype html><title>Embedded player fixture</title>" }));
  await page.route("https://www.youtube.com/iframe_api", route => route.abort("blockedbyclient"));
}

test("a guest reaches a playing lesson in three taps without any check-in", async ({ page }) => {
  await stubEmbed(page);
  await page.goto("/?mode=web");
  let taps = 0;
  const tap = async (target: Locator) => { await target.click(); taps += 1; };

  await tap(page.getByRole("button", { name: "Trải nghiệm thử" }));
  await expect(page.getByRole("heading", { name: "Một chút thời gian cho chính mình." })).toBeVisible();
  const picks = page.getByTestId("home-quick-picks");
  await expect(picks.locator(".mcy-finder-row")).toHaveCount(3);
  await tap(picks.locator(".mcy-finder-row").first());
  await tap(page.locator(".mcy-course-play"));
  await expect(page.locator('iframe[src*="youtube-nocookie.com/embed/"]')).toHaveCount(1);

  expect(taps).toBe(3);
  await expect(page.getByRole("heading", { name: "Hôm nay, cơ thể bạn cảm thấy thế nào?" })).toHaveCount(0);
});

test("Hôm nay shows the lessons first and keeps check-in as an optional second choice", async ({ page }) => {
  await page.goto("/?mode=web");
  await page.getByRole("button", { name: "Trải nghiệm thử" }).click();
  const picks = page.getByTestId("home-quick-picks");
  await expect(picks.locator(".mcy-finder-row")).toHaveCount(3);

  // The three lessons are inside the first screen of a 390x844 phone and above the check-in button.
  const lastRow = await picks.locator(".mcy-finder-row").last().boundingBox();
  const checkin = page.getByRole("button", { name: "Bắt đầu check-in", exact: true });
  const checkinBox = await checkin.boundingBox();
  expect(lastRow && lastRow.y + lastRow.height).toBeLessThanOrEqual(844);
  expect(lastRow && checkinBox && lastRow.y < checkinBox.y).toBe(true);
  await expect(page.locator(".mcy-home-cta")).toContainText("Tùy chọn");

  // Check-in is unchanged and still reachable, and back returns to Hôm nay.
  await checkin.click();
  await expect(page.getByRole("heading", { name: "Hôm nay, cơ thể bạn cảm thấy thế nào?" })).toBeVisible();
  await page.getByRole("button", { name: "Quay lại" }).click();
  await expect(page.getByRole("heading", { name: "Một chút thời gian cho chính mình." })).toBeVisible();
});
