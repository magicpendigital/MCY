import { expect, test, type Page } from "@playwright/test";

// iOS Safari zooms the page when a text field with a font size under 16px gets focus, and keeps it zoomed until the user pinches back.
// Chromium never does that, so this spec checks the cause instead: every visible text control the learner can focus must compute to
// at least 16px, and the screen must not be wider than the viewport (a wider page makes iOS shrink-to-fit, which lowers the effective
// size of every field). See docs/quality/KNOWN_INCIDENTS.md (INC-005). It does not replace a check on a real iPhone.
test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, actionTimeout: 15_000 });

// Only the screen the learner is looking at counts: parked flow screens sit to the right of the viewport by design, and a screen that is
// still sliding in is not settled yet.
async function settled(page: Page) {
  await expect.poll(() => page.evaluate(() => {
    const screen = document.querySelector<HTMLElement>('.flow-screen[data-flow-current="true"]');
    return screen && screen.parentElement ? Math.round(screen.getBoundingClientRect().left - screen.parentElement.getBoundingClientRect().left) : 0;
  })).toBe(0);
}
async function textControls(page: Page) {
  await settled(page);
  return page.evaluate(() => {
    const skip = new Set(["checkbox", "radio", "range", "button", "submit", "reset", "file", "hidden", "color", "image"]);
    const dialog = document.querySelector('[role="dialog"]');
    const root: ParentNode = dialog ?? document.querySelector('.flow-screen[data-flow-current="true"]') ?? document;
    return [...root.querySelectorAll<HTMLElement>("input, textarea, select")]
      .filter(el => !skip.has((el as HTMLInputElement).type) && el.getClientRects().length > 0 && getComputedStyle(el).visibility !== "hidden")
      .map(el => ({
        label: el.getAttribute("aria-label") ?? el.closest("label")?.textContent?.trim().slice(0, 40) ?? el.tagName.toLowerCase(),
        tag: el.tagName.toLowerCase(),
        size: Number.parseFloat(getComputedStyle(el).fontSize),
        right: Math.round(el.getBoundingClientRect().right),
      }));
  });
}
const noSmallFields = async (page: Page, expectAtLeast: number) => {
  const fields = await textControls(page);
  expect(fields.length, "expected text controls on this screen").toBeGreaterThanOrEqual(expectAtLeast);
  expect(fields.filter(f => f.size < 16), "fields under 16px make iOS zoom on focus").toEqual([]);
  expect(fields.filter(f => f.right > 390), "a field wider than the viewport").toEqual([]);
  const width = await page.evaluate(() => ({ doc: document.documentElement.scrollWidth, body: document.body.scrollWidth, inner: window.innerWidth }));
  expect(Math.max(width.doc, width.body)).toBeLessThanOrEqual(width.inner);
};

test("the body-region note is at least 16px and fits the screen", async ({ page }) => {
  await page.goto("/?mode=web");
  await page.getByRole("button", { name: "Trải nghiệm thử" }).tap();
  await page.getByRole("button", { name: "Bắt đầu check-in", exact: true }).tap();
  await page.getByRole("button", { name: "Cổ: Chạm để ghi" }).tap();
  await expect(page.getByRole("dialog")).toBeVisible();
  await noSmallFields(page, 1);
  await page.getByRole("button", { name: "Đóng" }).first().tap().catch(() => undefined);
});

test("the reflection note after a lesson is at least 16px and fits the screen", async ({ page }) => {
  await page.goto("/?mode=web");
  await page.getByRole("button", { name: "Trải nghiệm thử" }).tap();
  await page.getByRole("button", { name: "Bắt đầu check-in", exact: true }).tap();
  await page.getByRole("button", { name: "Tìm bài học ngắn" }).tap();
  await page.getByRole("button", { name: /Một chút chuyển động nhẹ/ }).tap();
  const play = page.getByRole("button", { name: /Phát bài học/ });
  await play.scrollIntoViewIfNeeded();
  await play.tap();
  const reflect = page.getByRole("button", { name: "Tôi đã thực hành · ghi cảm nhận" });
  await reflect.scrollIntoViewIfNeeded();
  await reflect.tap();
  await expect(page.getByRole("heading", { name: "Sau buổi tập, cơ thể bạn thế nào?" })).toBeVisible();
  await noSmallFields(page, 1);
});

test("the sign-in and account fields are at least 16px and fit the screen", async ({ page }) => {
  await page.goto("/?mode=web");
  await page.getByRole("button", { name: "Đăng nhập", exact: true }).tap();
  await expect(page.getByRole("textbox", { name: "Địa chỉ email" })).toBeVisible();
  await noSmallFields(page, 1);
});

const IPHONE_UA = "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1";
test("on iOS the viewport also gets maximum-scale=1 as a second guard; elsewhere it is left alone", async ({ browser }) => {
  const viewportOf = async (userAgent?: string) => {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, ...(userAgent ? { userAgent } : {}) });
    const page = await context.newPage();
    try {
      await page.goto("/?mode=web");
      return await page.evaluate(() => document.querySelector('meta[name="viewport"]')!.getAttribute("content"));
    } finally { await context.close(); }
  };
  expect(await viewportOf(IPHONE_UA)).toContain("maximum-scale=1");
  expect(await viewportOf()).not.toContain("maximum-scale");
});

test("?debug=viewport shows the probe with the numbers needed from a real iPhone", async ({ page }) => {
  await page.goto("/?mode=web&debug=viewport");
  const probe = page.getByTestId("viewport-probe");
  await expect(probe).toBeVisible();
  await expect(probe).toContainText(/scale \d/);
  await expect(probe).toContainText("doc ");
  await page.getByRole("button", { name: "Đăng nhập", exact: true }).tap();
  const email = page.getByRole("textbox", { name: "Địa chỉ email" });
  await email.focus();
  await expect(probe).toContainText("focus input");
  await expect(probe).toContainText("font 16px");
});

test("stray scroll that iOS leaves on the fixed containers is put back after a field loses focus, and the probe is opt-in", async ({ page }) => {
  await page.goto("/?mode=web");
  await page.getByRole("button", { name: "Đăng nhập", exact: true }).tap();
  const email = page.getByRole("textbox", { name: "Địa chỉ email" });
  await expect(email).toBeVisible();
  await expect(page.getByTestId("viewport-probe")).toHaveCount(0);
  await email.focus();
  // Simulate what iOS does: scroll the overflow:hidden screen to reveal the field (a tall child makes that possible).
  const moved = await page.evaluate(() => {
    const screen = document.querySelector<HTMLElement>(".device-screen")!;
    const filler = document.createElement("div");
    filler.id = "ios-filler";
    filler.style.cssText = "position:absolute;left:0;top:0;width:1px;height:3000px;pointer-events:none";
    screen.appendChild(filler);
    screen.scrollTop = 60;
    return screen.scrollTop;
  });
  expect(moved).toBeGreaterThan(0);
  await email.evaluate(element => (element as HTMLInputElement).blur());
  await expect.poll(() => page.evaluate(() => document.querySelector<HTMLElement>(".device-screen")!.scrollTop)).toBe(0);
  await page.evaluate(() => document.getElementById("ios-filler")?.remove());
});
