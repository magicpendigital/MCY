# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: learner-ux.spec.ts >> guest can browse free lessons without an account and retains check-in choices
- Location: .vercel\ux-step4-3-20261016\tests\learner-ux.spec.ts:471:1

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: locator('.mcy-checkin-page > .mcy-lead')
Expected substring: "Hiện chưa có gợi ý tự động"
Received string:    "Bạn tự chọn bài trong thư viện."
Timeout: 5000ms

Call log:
  - Expect "toContainText" with timeout 5000ms
  - waiting for locator('.mcy-checkin-page > .mcy-lead')
    13 × locator resolved to <p class="mcy-lead">Bạn tự chọn bài trong thư viện.</p>
       - unexpected value "Bạn tự chọn bài trong thư viện."

```

```yaml
- paragraph: Bạn tự chọn bài trong thư viện.
```

# Test source

```ts
  383 |   await expect(learnerSurface).not.toContainText(forbiddenCopy);
  384 |   await page.getByRole("button", { name: "Thử tìm hiểu như khách" }).click();
  385 |   await expect(learnerSurface).not.toContainText(forbiddenCopy);
  386 |   await page.getByRole("button", { name: "Tiếp: năng lượng và thời gian" }).click();
  387 |   await page.getByRole("button", { name: "Tự chọn bài học video miễn phí" }).click();
  388 |   await expect(learnerSurface).not.toContainText(forbiddenCopy);
  389 |   await expect(page.getByTestId("free-course-catalog")).toBeVisible();
  390 | });
  391 | 
  392 | test("desktop welcome exposes the visible wordmark as its page heading without horizontal overflow", async ({ page }) => {
  393 |   await page.setViewportSize({ width: 1440, height: 1000 });
  394 |   await page.goto("/?mode=web");
  395 | 
  396 |   const heading = page.getByRole("heading", { level: 1, name: "Một chút yoga" });
  397 |   await expect(heading).toBeVisible();
  398 |   await expect(page.locator(".mcy-brand-wordmark")).toHaveText("Một chút yoga");
  399 |   await expect(page.getByRole("button", { name: "Thử tìm hiểu như khách" })).toBeVisible();
  400 |   expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
  401 | });
  402 | 
  403 | test("critical lesson art loads promptly while secondary images stay deferred", async ({ page }) => {
  404 |   await page.setViewportSize({ width: 390, height: 844 });
  405 |   await page.goto("/?mode=web");
  406 |   const welcomePhoto = page.locator(".mcy-welcome-photo");
  407 |   await expect(welcomePhoto).toHaveAttribute("loading", "eager");
  408 |   await expect(welcomePhoto).toHaveAttribute("fetchpriority", "high");
  409 |   await expect(welcomePhoto).toHaveAttribute("decoding", "async");
  410 |   await expect(welcomePhoto).toHaveAttribute("srcset", /welcome-portrait-512\.webp 512w, \/assets\/welcome-portrait-1024\.webp 1024w/);
  411 |   await expect.poll(() => welcomePhoto.evaluate(image => (image as HTMLImageElement).complete && (image as HTMLImageElement).naturalWidth > 0)).toBe(true);
  412 |   expect(await welcomePhoto.evaluate(image => (image as HTMLImageElement).currentSrc)).toMatch(/welcome-portrait-512\.webp$/);
  413 | 
  414 |   await openGuestCheckin(page);
  415 |   const bodyMap = page.locator(".mcy-checkin-illustration .mcy-body-art img");
  416 |   await expect(bodyMap).toHaveAttribute("src", "/assets/body-map-feminine-full-1024.webp");
  417 |   await expect(bodyMap).toHaveAttribute("loading", "eager");
  418 |   await expect(bodyMap).toHaveAttribute("decoding", "async");
  419 |   await expect(bodyMap).toHaveAttribute("srcset", /body-map-feminine-full-512\.webp 512w, \/assets\/body-map-feminine-full-1024\.webp 1024w/);
  420 |   await expect.poll(() => bodyMap.evaluate(image => (image as HTMLImageElement).complete && (image as HTMLImageElement).naturalWidth > 0)).toBe(true);
  421 |   expect(await bodyMap.evaluate(image => (image as HTMLImageElement).currentSrc)).toMatch(/body-map-feminine-full-512\.webp$/);
  422 |   const bodyStyleImages = page.locator(".mcy-style-options img");
  423 |   await expect(bodyStyleImages).toHaveCount(0);
  424 |   await page.getByRole("button", { name: "Đổi hình minh họa" }).click();
  425 |   await expect(bodyStyleImages).toHaveCount(3);
  426 |   for (const image of await bodyStyleImages.all()) {
  427 |     await expect(image).toHaveAttribute("loading", "lazy");
  428 |     await expect(image).toHaveAttribute("decoding", "async");
  429 |     await expect(image).toHaveAttribute("srcset", /-512\.webp 512w, \/assets\/body-map-(feminine|masculine|neutral)-full-1024\.webp 1024w/);
  430 |   }
  431 |   await page.keyboard.press("Escape");
  432 | 
  433 |   await page.getByRole("button", { name: "Tiếp: năng lượng và thời gian" }).click();
  434 |   await page.getByRole("button", { name: "Tự chọn bài học video miễn phí" }).click();
  435 |   await page.locator(".mcy-bottom-nav button").first().click();
  436 |   await expect(page.getByRole("heading", { name: "Một chút thời gian cho chính mình." })).toBeVisible();
  437 |   const homePhoto = page.locator(".mcy-home-photo img");
  438 |   await expect(homePhoto).toHaveAttribute("loading", "lazy");
  439 |   await expect(homePhoto).toHaveAttribute("decoding", "async");
  440 |   await expect(homePhoto).toHaveAttribute("src", "/assets/today-neck-stretch-1200.webp");
  441 |   await expect(homePhoto).toHaveAttribute("srcset", /today-neck-stretch-600\.webp 600w, \/assets\/today-neck-stretch-1200\.webp 1200w/);
  442 |   await expect.poll(() => homePhoto.evaluate(image => (image as HTMLImageElement).complete && (image as HTMLImageElement).naturalWidth > 0)).toBe(true);
  443 |   expect(await homePhoto.evaluate(image => (image as HTMLImageElement).currentSrc)).toMatch(/today-neck-stretch-600\.webp$/);
  444 | });
  445 | 
  446 | test("responsive WebP candidates select higher-resolution assets on high-density displays", async ({ browser }) => {
  447 |   const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3 });
  448 |   try {
  449 |     await page.goto("/?mode=web");
  450 |     const welcomePhoto = page.locator(".mcy-welcome-photo");
  451 |     await expect.poll(() => welcomePhoto.evaluate(image => (image as HTMLImageElement).complete && (image as HTMLImageElement).naturalWidth > 0)).toBe(true);
  452 |     expect(await welcomePhoto.evaluate(image => (image as HTMLImageElement).currentSrc)).toMatch(/welcome-portrait-1024\.webp$/);
  453 | 
  454 |     await openGuestCheckin(page);
  455 |     const bodyMap = page.locator(".mcy-checkin-illustration .mcy-body-art img");
  456 |     await expect.poll(() => bodyMap.evaluate(image => (image as HTMLImageElement).complete && (image as HTMLImageElement).naturalWidth > 0)).toBe(true);
  457 |     expect(await bodyMap.evaluate(image => (image as HTMLImageElement).currentSrc)).toMatch(/body-map-feminine-full-1024\.webp$/);
  458 | 
  459 |     await page.getByRole("button", { name: "Tiếp: năng lượng và thời gian" }).click();
  460 |     await page.getByRole("button", { name: "Tự chọn bài học video miễn phí" }).click();
  461 |     await page.locator(".mcy-bottom-nav button").first().click();
  462 |     const homePhoto = page.locator(".mcy-home-photo img");
  463 |     await homePhoto.scrollIntoViewIfNeeded();
  464 |     await expect.poll(() => homePhoto.evaluate(image => (image as HTMLImageElement).complete && (image as HTMLImageElement).naturalWidth > 0)).toBe(true);
  465 |     expect(await homePhoto.evaluate(image => (image as HTMLImageElement).currentSrc)).toMatch(/today-neck-stretch-1200\.webp$/);
  466 |   } finally {
  467 |     await page.close();
  468 |   }
  469 | });
  470 | 
  471 | test("guest can browse free lessons without an account and retains check-in choices", async ({ page }, testInfo) => {
  472 |   test.setTimeout(35_000);
  473 |   await page.setViewportSize({ width: 390, height: 844 });
  474 |   const assistantRequests: string[] = [];
  475 |   page.on("request", request => {
  476 |     if (request.url().includes("/functions/v1/mcy-ai-assistant")) assistantRequests.push(request.url());
  477 |   });
  478 |   await page.goto("/?mode=web");
  479 |   await openGuestCheckin(page);
  480 |   await page.getByRole("button", { name: "Tiếp: năng lượng và thời gian" }).click();
  481 |   await page.getByRole("button", { name: "Thấp", exact: true }).click();
  482 |   await page.getByRole("button", { name: "5 phút", exact: true }).click();
> 483 |   await expect(page.locator(".mcy-checkin-page > .mcy-lead")).toContainText("Hiện chưa có gợi ý tự động");
      |                                                               ^ Error: expect(locator).toContainText(expected) failed
  484 |   await expect(page.getByRole("button", { name: "Đăng nhập hoặc tạo tài khoản (tùy chọn)" })).toBeVisible();
  485 |   await page.screenshot({ path: testInfo.outputPath("mobile-06-checkin-ai-off.png") });
  486 |   await page.setViewportSize({ width: 1440, height: 1000 });
  487 |   await page.screenshot({ path: testInfo.outputPath("desktop-06-checkin-ai-off.png") });
  488 |   await page.setViewportSize({ width: 390, height: 844 });
  489 | 
  490 |   await page.getByTestId("flow-fixed-footer").getByRole("button", { name: "Đăng nhập hoặc tạo tài khoản (tùy chọn)" }).click();
  491 |   await expect(page.getByRole("heading", { name: "Dùng email bạn có thể mở ngay." })).toBeVisible();
  492 |   await page.getByRole("button", { name: "Quay lại" }).click();
  493 |   const returnedCheckin = page.locator("[data-testid='flow-current'] .mcy-checkin-page");
  494 |   await expect(returnedCheckin.getByRole("button", { name: "5 phút", exact: true })).toHaveAttribute("aria-pressed", "true");
  495 |   await expect(returnedCheckin.getByRole("button", { name: "Thấp", exact: true })).toHaveAttribute("aria-pressed", "true");
  496 | 
  497 |   await page.getByRole("button", { name: "Tự chọn bài học video miễn phí" }).click();
  498 |   await expect(page.getByTestId("free-course-catalog")).toBeVisible();
  499 |   await expect(page.locator("[data-testid='flow-current'] .mcy-checkin-page")).toHaveCount(0);
  500 |   await expect.poll(() => assistantRequests.length).toBe(0);
  501 | });
  502 | 
  503 | test("free-course screens load only when a learner opens their routes", async ({ page }) => {
  504 |   let detailModuleRequests = 0;
  505 |   let discoverModuleRequests = 0;
  506 |   page.on("request", request => {
  507 |     if (request.url().includes("/src/courses/CourseDetailScreen.tsx")) detailModuleRequests += 1;
  508 |     if (request.url().includes("/src/courses/DiscoverScreen.tsx")) discoverModuleRequests += 1;
  509 |   });
  510 |   await page.goto("/?mode=web");
  511 |   await openGuestCheckin(page);
  512 |   expect(discoverModuleRequests).toBe(0);
  513 |   expect(detailModuleRequests).toBe(0);
  514 |   await page.locator(".mcy-checkin-footer-options button").nth(1).click();
  515 |   await expect(page.getByTestId("free-course-catalog")).toBeVisible();
  516 |   expect(discoverModuleRequests).toBe(1);
  517 |   expect(detailModuleRequests).toBe(0);
  518 | 
  519 |   const firstCourseCard = page.getByRole("button", { name: /Một chút chuyển động nhẹ/ });
  520 |   await expect(firstCourseCard).toContainText("18 bài học");
  521 |   await expect(firstCourseCard).toContainText("Miễn phí");
  522 |   await expect(firstCourseCard).toContainText("Xem danh sách bài");
  523 |   await expect(page.locator(".mcy-course-section .mcy-info-note")).toContainText("Video chỉ kết nối với YouTube khi bạn nhấn Phát");
  524 | 
  525 |   await firstCourseCard.click();
  526 |   await expect(page.getByRole("heading", { name: "Một chút chuyển động nhẹ" })).toBeVisible();
  527 |   await expect(page.locator(".mcy-course-detail-meta")).toContainText("Miễn phí");
  528 |   expect(detailModuleRequests).toBe(1);
  529 | });
  530 | 
  531 | test("learner app defers course and Journey route chunks until navigation", async ({ page }) => {
  532 |   const discoverRequests: string[] = [];
  533 |   const detailRequests: string[] = [];
  534 |   const journeyRequests: string[] = [];
  535 |   const pageErrors: string[] = [];
  536 |   page.on("request", request => {
  537 |     const url = request.url();
  538 |     if (url.includes("/src/courses/DiscoverScreen.tsx") || /\/assets\/DiscoverScreen-[\w-]+\.js/.test(url)) discoverRequests.push(url);
  539 |     if (url.includes("/src/courses/CourseDetailScreen.tsx") || /\/assets\/CourseDetailScreen-[\w-]+\.js/.test(url)) detailRequests.push(url);
  540 |     if (url.includes("/src/JourneyScreen.tsx") || /\/assets\/JourneyScreen-[\w-]+\.js/.test(url)) journeyRequests.push(url);
  541 |   });
  542 |   page.on("pageerror", error => pageErrors.push(error.message));
  543 | 
  544 |   await page.goto("/?mode=web");
  545 |   await expect(page.locator(".mcy-welcome")).toBeVisible();
  546 |   await expect(page.getByRole("button", { name: "Thử tìm hiểu như khách" })).toBeVisible();
  547 |   await expect(page.locator(".vite-error-overlay, [data-nextjs-dialog]")).toHaveCount(0);
  548 |   expect(discoverRequests).toHaveLength(0);
  549 |   expect(detailRequests).toHaveLength(0);
  550 |   expect(journeyRequests).toHaveLength(0);
  551 | 
  552 |   await openGuestCheckin(page);
  553 |   expect(discoverRequests).toHaveLength(0);
  554 |   expect(journeyRequests).toHaveLength(0);
  555 |   await page.locator(".mcy-checkin-footer-options button").nth(1).click();
  556 |   await expect(page.getByTestId("free-course-catalog")).toBeVisible();
  557 |   expect(discoverRequests).toHaveLength(1);
  558 |   expect(detailRequests).toHaveLength(0);
  559 |   expect(journeyRequests).toHaveLength(0);
  560 | 
  561 |   const navigation = page.getByRole("navigation", { name: "Điều hướng chính" });
  562 |   await navigation.getByRole("button", { name: /Hành trình/ }).click();
  563 |   await expect(page.getByRole("heading", { name: "Hành trình của bạn" })).toBeVisible();
  564 |   expect(journeyRequests).toHaveLength(1);
  565 |   await navigation.getByRole("button", { name: /Khám phá/ }).click();
  566 |   const activeCatalog = page.getByTestId("free-course-catalog").last();
  567 |   await expect(activeCatalog).toBeVisible();
  568 |   expect(journeyRequests).toHaveLength(1);
  569 | 
  570 |   await activeCatalog.getByRole("button", { name: /Một chút chuyển động nhẹ/ }).click();
  571 |   await expect(page.getByRole("heading", { name: "Một chút chuyển động nhẹ" })).toBeVisible();
  572 |   expect(detailRequests).toHaveLength(1);
  573 |   expect(pageErrors).toEqual([]);
  574 | });
  575 | 
  576 | test("account access distinguishes free courses from paid purchases", async ({ page }, testInfo) => {
  577 |   await page.setViewportSize({ width: 390, height: 844 });
  578 |   await page.goto("/?mode=web");
  579 |   await openGuestCheckin(page);
  580 |   await page.getByRole("button", { name: "Tiếp: năng lượng và thời gian" }).click();
  581 |   await page.getByRole("button", { name: "Tự chọn bài học video miễn phí" }).click();
  582 |   await expect(page.locator(".mcy-course-card")).toHaveCount(3);
  583 | 
```