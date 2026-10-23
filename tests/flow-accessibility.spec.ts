import { expect, test } from "@playwright/test";

// Entries parked beneath the current flow screen must leave the focus order and the accessibility tree.
test("parked flow entries are inert and hidden from assistive technology", async ({ page }) => {
  await page.goto("/?mode=web");
  await page.getByRole("button", { name: "Trải nghiệm thử" }).click();
  await expect(page.getByRole("heading", { name: "Hôm nay, cơ thể bạn cảm thấy thế nào?" })).toBeVisible();

  const entries = page.locator(".flow-screen");
  await expect(entries).toHaveCount(2);
  const parked = page.locator('.flow-screen[data-flow-current="false"]');
  await expect(parked).toHaveAttribute("aria-hidden", "true");
  await expect(parked).toHaveJSProperty("inert", true);
  const current = page.locator('.flow-screen[data-flow-current="true"]');
  await expect(current).not.toHaveAttribute("aria-hidden", /.*/);
  await expect(current).toHaveJSProperty("inert", false);

  // Keyboard focus never lands inside a parked entry.
  for (let step = 0; step < 14; step += 1) {
    await page.keyboard.press("Tab");
    const insideParked = await page.evaluate(() => Boolean(document.activeElement?.closest('.flow-screen[data-flow-current="false"]')));
    expect(insideParked).toBe(false);
  }
});

test("returning to a route re-exposes it and parks the one that was current", async ({ page }) => {
  await page.goto("/?mode=web");
  await page.getByRole("button", { name: "Trải nghiệm thử" }).click();
  await expect(page.getByRole("heading", { name: "Hôm nay, cơ thể bạn cảm thấy thế nào?" })).toBeVisible();
  await page.getByRole("button", { name: "Quay lại" }).click();
  await expect(page.locator(".flow-screen")).toHaveCount(1);
  await expect(page.locator('.flow-screen[data-flow-current="true"]')).toHaveJSProperty("inert", false);
  await expect(page.getByRole("button", { name: "Trải nghiệm thử" })).toBeVisible();
});
