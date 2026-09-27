import { expect, test, type Locator, type Page } from "@playwright/test";

async function activate(target: Locator, touch: boolean) {
  if (touch) await target.tap();
  else await target.click();
}

async function openGuestCheckin(page: Page, touch = false, locale: "vi-VN" | "en-US" = "vi-VN") {
  await activate(page.locator(".mcy-welcome-bottom .mcy-action"), touch);
  await expect(page.getByRole("heading", { name: locale === "en-US" ? "How does your body feel today?" : "Hôm nay, cơ thể bạn cảm thấy thế nào?" })).toBeVisible();
  if (locale === "en-US") await expect(page.locator(".mcy-header-title")).toHaveText("A Little Yoga");
}

for (const device of ["iphone", "pixel-10"] as const) {
  test(`${device} review preserves check-in, safe-area footer and guest lesson flow`, async ({ page }) => {
    await page.goto(`/?mode=review&device=${device}`);
    await expect(page.locator("[data-testid=phone-frame]")).toHaveAttribute("data-device", device);
    if (device === "pixel-10") await expect(page.locator("[data-testid=device-camera]")).toBeVisible();
    await openGuestCheckin(page);

    const footerBox = await page.locator(".mcy-checkin-footer").evaluate((footer) => {
      const screen = footer.closest("[data-testid=device-screen]")!;
      const appViewport = footer.closest("[data-testid=mobile-app-viewport]")!;
      const fixedFooter = footer.parentElement!;
      const footerRect = footer.getBoundingClientRect();
      const screenRect = screen.getBoundingClientRect();
      const actionRect = footer.querySelector(".mcy-action")!.getBoundingClientRect();
      const fixedBottom = Number.parseFloat(getComputedStyle(fixedFooter).bottom) || 0;
      return {
        leftInset: actionRect.left - screenRect.left,
        rightInset: screenRect.right - actionRect.right,
        bottom: footerRect.bottom,
        expectedBottom: appViewport.getBoundingClientRect().bottom - fixedBottom,
        background: getComputedStyle(footer).backgroundColor,
        safeAreaFill: {
          content: getComputedStyle(fixedFooter, "::after").content,
          height: getComputedStyle(fixedFooter, "::after").height,
          background: getComputedStyle(fixedFooter, "::after").backgroundColor,
        },
      };
    });
    expect(footerBox.leftInset).toBeGreaterThanOrEqual(15);
    expect(footerBox.rightInset).toBeGreaterThanOrEqual(15);
    expect(footerBox.bottom).toBeCloseTo(footerBox.expectedBottom, 0);
    expect(footerBox.background).toBe("rgb(255, 252, 247)");
    if (device === "iphone") {
      expect(footerBox.safeAreaFill.height).toBe("34px");
      expect(footerBox.safeAreaFill.background).toBe("rgb(255, 252, 247)");
    } else {
      expect(footerBox.safeAreaFill.content).toBe("none");
    }

    await page.getByRole("button", { name: "Cổ: Chạm để ghi" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.getByRole("button", { name: "Nhẹ", exact: true }).click();
    await page.getByRole("button", { name: "Lưu vùng này" }).click();
    await page.getByRole("button", { name: "Tiếp: năng lượng và thời gian" }).click();
    await page.getByRole("button", { name: "5 phút", exact: true }).click();
    await page.getByRole("button", { name: "Quay lại cảm nhận cơ thể" }).click();
    await expect(page.locator(".mcy-region-list button.selected")).toContainText("Cổ");
    await expect(page.locator(".mcy-region-list button.selected")).toContainText("Nhẹ");

    const scroll = page.locator("[data-testid=flow-current] .mobile-scroll");
    await scroll.evaluate((element) => element.scrollTo({ top: element.scrollHeight, behavior: "instant" }));
    const finalRegion = page.locator(".mcy-region-list button").last();
    await expect(finalRegion).toBeInViewport();
    const captionGap = await page.locator(".mcy-body-orientation").evaluate((caption) => caption.getBoundingClientRect().top - caption.previousElementSibling!.getBoundingClientRect().bottom);
    expect(captionGap).toBeGreaterThanOrEqual(10);

    await page.getByRole("button", { name: "Bỏ qua ghi nhận cơ thể" }).click();
    await expect(page.getByRole("heading", { name: "Bỏ ghi nhận vùng cơ thể?" })).toBeVisible();
    await page.getByRole("button", { name: "Giữ các vùng đã ghi" }).click();
    await expect(page.locator(".mcy-region-list button.selected")).toContainText("Cổ");
    await page.getByRole("button", { name: "Bỏ qua ghi nhận cơ thể" }).click();
    await page.getByRole("button", { name: "Bỏ qua và tiếp tục" }).click();
    await expect(page.locator(".mcy-checkin-summary")).toContainText("Bỏ qua phần cơ thể");
    await page.getByRole("button", { name: "Xem buổi mẫu như khách" }).click();
    await expect(page.getByRole("heading", { name: "Bài tập hôm nay" })).toBeVisible();
    await page.locator(".flow-fixed-footer .mcy-action").click();
    await expect(page.getByRole("heading", { name: "Xoay cổ nhẹ" })).toBeVisible();
    await page.locator(".flow-fixed-footer .mcy-action").click();
    await expect(page.getByRole("heading", { name: /Sau buổi tập/ })).toBeVisible();
    await page.getByRole("button", { name: "Khó chịu hơn" }).click();
    await expect(page.locator(".mcy-alert")).toContainText("không tự gợi bài");
  });
}

test("mobile browser defaults to an unframed app, while review mode retains the simulator", async ({ browser }) => {
  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  try {
    await mobile.goto("/");
    await expect(mobile.locator("[data-testid=mobile-app-viewport]")).toHaveAttribute("data-runtime-mode", "web");
    await expect(mobile.locator("[data-testid=device-screen]")).toBeVisible();
    await expect(mobile.locator("[data-testid=phone-frame]")).toHaveCount(0);
    await expect(mobile.locator("[data-testid=device-picker]")).toHaveCount(0);
    await expect(mobile.locator(".device-status-bar, .home-indicator, .keyboard-dock")).toHaveCount(0);
    await expect(mobile.locator(".mcy-language-toggle")).toHaveCSS("border-radius", "999px");

    await mobile.goto("/?mode=review&device=pixel-10");
    await expect(mobile.locator("[data-testid=mobile-app-viewport]")).toHaveAttribute("data-runtime-mode", "simulator");
    await expect(mobile.locator("[data-testid=phone-frame]")).toHaveAttribute("data-device", "pixel-10");
    await expect(mobile.locator("[data-testid=device-picker]")).toBeVisible();
  } finally {
    await mobile.close();
  }
});

test("internal English preview follows check-in, sample practice and honest reflection on mobile web", async ({ browser }) => {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  try {
    await page.goto("/?mode=web");
    await page.locator(".mcy-language-toggle").tap();
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.locator(".mcy-brand-wordmark")).toHaveText("A Little Yoga");
    await expect(page.locator(".mcy-welcome-top > p")).toHaveText("A little more peace");
    await expect(page.getByText("ENGLISH PREVIEW · SOME SCREENS ARE NOT TRANSLATED")).toBeVisible();
    await openGuestCheckin(page, true, "en-US");
    await page.getByRole("button", { name: "Next: energy and time" }).tap();
    await page.getByRole("button", { name: "10 min" }).tap();
    await page.getByRole("button", { name: "View a sample session as guest" }).tap();
    await expect(page.getByRole("heading", { name: "Today's practice" })).toBeVisible();
    await expect(page.locator(".mcy-plan-hero h2")).toHaveText("Relax your neck and shoulders");
    await page.locator(".flow-fixed-footer .mcy-action").tap();
    await expect(page.getByRole("heading", { name: "Gentle neck turns" })).toBeVisible();
    await page.locator(".flow-fixed-footer .mcy-action").tap();
    await expect(page.getByRole("heading", { name: /How does your body feel after practice/ })).toBeVisible();
    await page.getByRole("button", { name: "Worse" }).tap();
    await expect(page.locator(".mcy-alert")).toContainText("won't recommend a session");
    await page.locator(".flow-fixed-footer .mcy-action").tap();
    await expect(page.getByRole("heading", { name: "Reflection saved for this session." })).toBeVisible();
    await expect(page.locator(".mcy-sync-card")).toContainText("Worse");
  } finally {
    await page.close();
  }
});

test("short portrait and landscape mobile viewports keep the check-in actions reachable", async ({ browser }) => {
  for (const viewport of [{ width: 320, height: 568 }, { width: 844, height: 390 }]) {
    const page = await browser.newPage({ viewport, isMobile: true, hasTouch: true });
    try {
      await page.goto("/?mode=web");
      await openGuestCheckin(page, true);
      const primary = page.locator(".flow-fixed-footer .mcy-action");
      await expect(primary).toBeVisible();
      const footer = await page.locator(".flow-fixed-footer").evaluate(element => {
        const rect = element.getBoundingClientRect();
        return { top: rect.top, bottom: rect.bottom, height: rect.height };
      });
      expect(footer.top).toBeGreaterThanOrEqual(0);
      expect(footer.bottom).toBeLessThanOrEqual(viewport.height);
      if (viewport.height < 520) expect(footer.height).toBeLessThanOrEqual(162);
      await primary.tap();
      await expect(page.getByRole("heading", { name: "Hôm nay bạn muốn dành bao lâu?" })).toBeVisible();
    } finally {
      await page.close();
    }
  }
});

test("short portrait keeps welcome, lesson and reflection actions inside the viewport", async ({ browser }) => {
  const page = await browser.newPage({ viewport: { width: 320, height: 568 }, isMobile: true, hasTouch: true });
  try {
    await page.goto("/?mode=web");
    const welcomeAction = page.locator(".mcy-welcome-bottom .mcy-action");
    await expect(welcomeAction).toBeInViewport();
    await welcomeAction.tap();

    await page.locator(".flow-fixed-footer .mcy-action").tap();
    await page.getByRole("button", { name: "Xem buổi mẫu như khách" }).tap();
    const planAction = page.locator(".flow-fixed-footer .mcy-action");
    await expect(planAction).toBeInViewport();
    await planAction.tap();

    const practiceAction = page.locator(".flow-fixed-footer .mcy-action");
    await expect(practiceAction).toBeInViewport();
    await expect(page.locator(".flow-fixed-footer .mcy-flow-footer")).toHaveCSS("background-color", "rgb(255, 252, 247)");
    await practiceAction.tap();

    const reflectionAction = page.locator(".flow-fixed-footer .mcy-action");
    await expect(reflectionAction).toBeInViewport();
  } finally {
    await page.close();
  }
});
