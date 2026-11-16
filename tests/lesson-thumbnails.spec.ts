import { expect, test } from "@playwright/test";

// YouTube preview images in the free-course screens, with the thumbnail host stubbed. It shows the images appear in
// the lesson list and behind the poster, fall back quietly, and never carry the learner's data; it is not evidence
// about the real i.ytimg.com host.
test.use({ viewport: { width: 390, height: 844 } });
const jpeg = Buffer.from("/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=", "base64");

async function openCourse(page: import("@playwright/test").Page) {
  await page.goto("/?mode=web");
  await page.getByRole("button", { name: "Trải nghiệm thử" }).click();
  await page.getByRole("button", { name: "Bắt đầu check-in", exact: true }).click();
  await page.getByRole("button", { name: "Tìm bài học ngắn" }).click();
  await expect(page.getByTestId("free-course-catalog")).toBeVisible({ timeout: 30_000 });
  await page.getByRole("button", { name: /Một chút chuyển động nhẹ/ }).click();
  await expect(page.getByRole("heading", { name: "Một chút chuyển động nhẹ" })).toBeVisible();
}

test("lesson list and poster show YouTube thumbnails and keep working without them", async ({ page }) => {
  const requests: string[] = [];
  await page.route("https://i.ytimg.com/**", route => { requests.push(route.request().url()); return route.fulfill({ contentType: "image/jpeg", body: jpeg }); });
  await openCourse(page);
  const screen = page.locator('[data-flow-current="true"]');
  const poster = screen.locator(".mcy-course-video-poster .mcy-thumb-img");
  // The first run compiles lazy chunks on a cold dev server, so allow extra time.
  await expect(poster).toHaveAttribute("src", /^https:\/\/i\.ytimg\.com\/vi\/[A-Za-z0-9_-]{11}\/hqdefault\.jpg$/, { timeout: 20_000 });
  const rows = screen.locator(".mcy-course-lesson");
  await expect(rows.first().locator(".mcy-thumb-img")).toHaveAttribute("src", /\/hqdefault\.jpg$/, { timeout: 20_000 });
  // decorative: no alt text, not announced, and the lesson title stays the accessible name
  await expect(rows.first().locator(".mcy-thumb-img")).toHaveAttribute("alt", "");
  expect(requests.every(url => /^https:\/\/i\.ytimg\.com\/vi\/[A-Za-z0-9_-]{11}\/hqdefault\.jpg$/.test(url))).toBe(true);
  await expect(screen.locator(".mcy-course-source-note")).toContainText("Ảnh xem trước được tải từ YouTube");
});

test("a thumbnail that fails to load disappears and the play icon and title remain", async ({ page }) => {
  await page.route("https://i.ytimg.com/**", route => route.fulfill({ status: 404, body: "" }));
  await openCourse(page);
  const screen = page.locator('[data-flow-current="true"]');
  // Images below the fold are lazy and have not been requested yet; the ones in view have failed and been removed.
  await expect(screen.locator(".mcy-course-video-poster .mcy-thumb-img")).toHaveCount(0);
  await expect(screen.locator(".mcy-course-lesson").first().locator(".mcy-thumb-img")).toHaveCount(0);
  await expect(screen.locator(".mcy-course-lesson").first().locator(".mcy-course-lesson-icon svg")).toBeVisible();
  await expect(screen.getByRole("button", { name: /Phát bài học/ })).toBeVisible();
});

test("each course ends with provisional benefits and cautions, labelled as awaiting expert review", async ({ page }) => {
  await page.route("https://i.ytimg.com/**", route => route.fulfill({ status: 404, body: "" }));
  await openCourse(page);
  const guidance = page.locator('[data-flow-current="true"]').getByTestId("course-guidance");
  await guidance.scrollIntoViewIfNeeded();
  await expect(guidance.getByRole("heading", { level: 2, name: "Lợi ích và lưu ý" })).toBeVisible();
  await expect(guidance.getByRole("note")).toContainText("đang chờ chuyên gia yoga hoặc y tế duyệt");
  await expect(guidance.getByRole("heading", { level: 3, name: "Chống chỉ định và lưu ý an toàn" })).toBeVisible();
  await expect(guidance).toContainText("Dừng ngay nếu đau tăng, tê, choáng hoặc khó thở");
  // the section sits below the lesson list, and never claims to treat or cure anything
  const order = await page.locator('[data-flow-current="true"]').evaluate(root => ({
    list: root.querySelector(".mcy-course-lessons")!.getBoundingClientRect().bottom,
    guidance: root.querySelector(".mcy-course-guidance")!.getBoundingClientRect().top,
  }));
  expect(order.list).toBeLessThanOrEqual(order.guidance + 1);
  expect(await guidance.innerText()).not.toMatch(/chữa|điều trị khỏi|khỏi bệnh/i);
});

test("check-in offers Mông in the trunk group with left, right and both, and the step-one hint is a footnote", async ({ page }) => {
  await page.goto("/?mode=web");
  await page.getByRole("button", { name: "Trải nghiệm thử" }).click();
  await page.getByRole("button", { name: "Bắt đầu check-in", exact: true }).click();
  const hint = page.locator(".mcy-star-hint");
  await expect(hint.first()).toContainText("Chọn điểm trên hình hoặc nhóm vùng tay chân bên dưới", { timeout: 30_000 });
  await expect(hint.first().locator(".mcy-star")).toHaveText("*");
  await expect(hint.first().locator("svg")).toHaveCount(0);
  expect(await hint.first().locator("em").evaluate(node => getComputedStyle(node).fontStyle)).toBe("italic");
  await page.getByRole("button", { name: "Thân mình" }).click();
  const list = page.locator(".mcy-region-list");
  await expect(list).toContainText("Mông");
  await list.getByRole("button", { name: /Mông/ }).click();
  await expect(page.getByRole("button", { name: "Trái", exact: true }).first()).toBeVisible();
});
