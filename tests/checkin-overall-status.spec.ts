import { expect, test } from "@playwright/test";

// Overall answers sit beside region entries: Bình thường, Mệt, Khó chịu, Bỏ qua phần cảm nhận.
test("overall body states Mệt and Khó chịu can be chosen, summarised and left without a body record for a guest", async ({ page }) => {
  await page.goto("/?mode=web");
  await page.getByRole("button", { name: "Trải nghiệm thử" }).click();
  await page.getByRole("button", { name: "Bắt đầu check-in", exact: true }).click();
  const status = page.locator(".mcy-body-status-actions");
  await expect(status.getByRole("button")).toHaveText(["Bình thường", "Mệt", "Khó chịu", "Bỏ qua phần cảm nhận"]);

  await status.getByRole("button", { name: "Mệt", exact: true }).click();
  await expect(status.getByRole("button", { name: "Mệt", exact: true })).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".mcy-status-caption")).toContainText("Đã chọn: Mệt");

  await status.getByRole("button", { name: "Khó chịu", exact: true }).click();
  await expect(status.getByRole("button", { name: "Mệt", exact: true })).toHaveAttribute("aria-pressed", "false");
  await expect(page.locator(".mcy-status-caption")).toContainText("Đã chọn: Khó chịu");

  // Guests record from the first screen; there is no second step.
  await expect(page.getByRole("button", { name: "Tiếp: năng lượng và thời gian" })).toHaveCount(0);
  await page.getByRole("button", { name: "Chỉ ghi lại cảm nhận hôm nay, không chọn bài" }).click();

  await expect(page.getByRole("heading", { name: "Hành trình của bạn" })).toBeVisible();
});
