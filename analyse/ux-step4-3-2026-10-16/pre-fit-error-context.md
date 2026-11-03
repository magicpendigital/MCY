# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: learner-ux.spec.ts >> short second check-in step signals when more choices are available by scrolling
- Location: .vercel\ux-step4-3-20261016\tests\learner-ux.spec.ts:1375:1

# Error details

```
Error: expect(received).toBeLessThanOrEqual(expected)

Expected: <= 8
Received:    96

Call Log:
- Timeout 5000ms exceeded while waiting on the predicate
```

# Page snapshot

```yaml
- generic [ref=e6]:
  - banner [ref=e7]:
    - generic [ref=e8]:
      - button "Quay lại" [ref=e9]:
        - img [ref=e10]
      - generic "Check-in hôm nay" [ref=e12]: Một chút yoga
  - generic [ref=e13]:
    - generic:
      - generic:
        - generic:
          - generic:
            - generic:
              - main:
                - img
                - generic:
                  - heading [level=1]:
                    - img
                    - generic: Một chút yoga
                  - button: VI / EN*
                  - paragraph: Vạn chút an yên
                - generic:
                  - generic:
                    - generic:
                      - img
                    - text: Khám phá chuyển động nhẹ cho cổ · vai · lưng
                  - generic:
                    - generic:
                      - img
                    - text: Lắng nghe cơ thể mỗi ngày
                  - generic:
                    - generic:
                      - img
                    - text: Bắt đầu với bài học bạn tự chọn
                - paragraph: “An yên bắt đầu từ những điều nhỏ bé”
    - main [ref=e19]:
      - generic [ref=e20]:
        - text: Bước 2 / 2
        - generic [ref=e21]: Năng lượng và thời gian
      - heading "Một khoảng cho mình." [level=1] [ref=e22]
      - paragraph [ref=e23]: Bạn tự chọn bài trong thư viện.
      - generic [ref=e24]:
        - region "Bạn có khoảng bao lâu?" [ref=e25]:
          - heading "Bạn có khoảng bao lâu?" [level=2] [ref=e26]
          - generic [ref=e27]:
            - button "5 phút" [ref=e28]:
              - generic [ref=e29]: "5"
              - generic [ref=e30]: phút
            - button "10 phút" [pressed] [ref=e31]:
              - generic [ref=e32]: "10"
              - generic [ref=e33]: phút
            - button "15 phút" [ref=e34]:
              - generic [ref=e35]: "15"
              - generic [ref=e36]: phút
          - paragraph [ref=e37]: Để bạn tham khảo khi tự chọn bài. Thư viện chưa lọc theo thời gian này.
        - generic [ref=e38]:
          - img [ref=e39]
          - text: Cuộn xuống để xem thêm lựa chọn
        - region "Năng lượng hôm nay (không bắt buộc)" [ref=e41]:
          - heading "Năng lượng hôm nay (không bắt buộc)" [level=2] [ref=e42]:
            - text: Năng lượng hôm nay
            - generic [ref=e43]: (không bắt buộc)
          - paragraph [ref=e44]: Chỉ nằm trong nháp hiện tại; chưa dùng để chọn bài.
          - generic [ref=e45]:
            - button "Rất thấp" [ref=e46]:
              - img [ref=e47]
              - generic [ref=e52]: Rất thấp
            - button "Thấp" [ref=e53]:
              - img [ref=e54]
              - generic [ref=e59]: Thấp
            - button "Bình thường" [ref=e60]:
              - img [ref=e61]
              - generic [ref=e66]: Bình thường
            - button "Khá ổn" [ref=e67]:
              - img [ref=e68]
              - generic [ref=e73]: Khá ổn
            - button "Tràn đầy" [ref=e74]:
              - img [ref=e75]
              - generic [ref=e80]: Tràn đầy
        - generic [ref=e81]:
          - generic [ref=e82]:
            - strong [ref=e83]: Cảm nhận cơ thể
            - generic [ref=e84]: Chưa ghi nhận
          - button "Sửa" [ref=e85]
        - paragraph [ref=e86]: Bạn chưa cho phép lưu check-in. Các lựa chọn vẫn nằm trong nháp hiện tại.
        - button "Chỉ ghi lại cảm nhận hôm nay, không chọn bài" [ref=e87]
        - generic [ref=e88]:
          - img [ref=e89]
          - text: Bạn chỉ cần chia sẻ điều mình thấy. Đây không phải đánh giá sức khỏe.
  - contentinfo [ref=e91]:
    - generic [ref=e92]:
      - generic "Bước 2 / 2" [ref=e93]:
        - generic [ref=e94]:
          - strong [ref=e95]: Bước 2 / 2
          - generic [ref=e96]: Năng lượng và thời gian
      - button "Tự chọn bài học video miễn phí" [ref=e100]:
        - text: Tự chọn bài học video miễn phí
        - img [ref=e101]
      - generic [ref=e103]:
        - button "Đăng nhập hoặc tạo tài khoản (tùy chọn)" [ref=e104]
        - button "Quay lại cảm nhận cơ thể" [ref=e105]
```

# Test source

```ts
  1304 | 
  1305 |   const reloadInApp = help.getByRole("button", { name: "Tải lại trong ứng dụng" });
  1306 |   await reloadInApp.scrollIntoViewIfNeeded();
  1307 |   await expect(reloadInApp).toBeInViewport();
  1308 |   await reloadInApp.click();
  1309 |   await expect(player).toHaveAttribute("data-load-attempt", "1");
  1310 |   await expect.poll(() => status.getAttribute("data-state")).toBe("frame-loaded");
  1311 |   await expect(helpToggle).toHaveAttribute("aria-expanded", "false");
  1312 |   await expect.poll(() => playerLoads).toBe(2);
  1313 |   await expect(page.locator("iframe")).toHaveCount(1);
  1314 |   await expect(page).toHaveURL(/\?mode=web$/);
  1315 | });
  1316 | 
  1317 | test("course player timeout opens recovery when the embedded frame does not respond", async ({ page }) => {
  1318 |   await page.setViewportSize({ width: 390, height: 844 });
  1319 |   await page.goto("/?mode=web");
  1320 |   await openGuestCheckin(page);
  1321 |   await page.locator(".mcy-checkin-footer-options button").nth(1).click();
  1322 |   await expect(page.getByTestId("free-course-catalog")).toBeVisible();
  1323 |   await page.getByRole("button", { name: /Một chút chuyển động nhẹ/ }).click();
  1324 |   const detail = page.locator('[data-testid="flow-current"]').last();
  1325 |   await expect(detail.getByRole("heading", { name: "Một chút chuyển động nhẹ" })).toBeVisible();
  1326 | 
  1327 |   let releasePendingNavigation: () => void = () => {};
  1328 |   await page.route("https://www.youtube-nocookie.com/embed/**", async route => {
  1329 |     await new Promise<void>(resolve => { releasePendingNavigation = resolve; });
  1330 |     await route.fulfill({ status: 200, contentType: "text/html", body: "<!doctype html><title>Mock embedded player</title>" });
  1331 |   });
  1332 |   await page.clock.install();
  1333 |   await detail.locator(".mcy-course-play").click();
  1334 |   const status = detail.getByTestId("course-player-status");
  1335 |   await expect(status).toHaveAttribute("data-state", "loading");
  1336 |   await page.clock.fastForward(12_001);
  1337 |   await expect(status).toHaveAttribute("data-state", "timeout");
  1338 |   const helpToggle = detail.getByRole("button", { name: "Video gặp sự cố khi phát?" });
  1339 |   await expect(helpToggle).toHaveAttribute("aria-expanded", "true");
  1340 |   await expect(detail.locator(".mcy-course-player-help")).toBeVisible();
  1341 |   releasePendingNavigation();
  1342 |   await expect(status).toHaveAttribute("data-state", "frame-loaded");
  1343 |   await expect(helpToggle).toHaveAttribute("aria-expanded", "false");
  1344 | });
  1345 | 
  1346 | test("short portrait and landscape mobile viewports keep the check-in actions reachable", async ({ browser }) => {
  1347 |   for (const viewport of [{ width: 320, height: 568 }, { width: 844, height: 390 }]) {
  1348 |     const page = await browser.newPage({ viewport, isMobile: true, hasTouch: true });
  1349 |     try {
  1350 |       await page.goto("/?mode=web");
  1351 |       await openGuestCheckin(page, true);
  1352 |       const primary = page.locator(".flow-fixed-footer .mcy-action");
  1353 |       await expect(primary).toBeVisible();
  1354 |       const layout = await page.evaluate(() => ({
  1355 |         documentWidth: document.documentElement.scrollWidth,
  1356 |         mapWidth: Math.round(document.querySelector(".mcy-checkin-illustration .mcy-body-art")!.getBoundingClientRect().width * 100) / 100,
  1357 |       }));
  1358 |       expect(layout.documentWidth).toBeLessThanOrEqual(viewport.width);
  1359 |       if (viewport.width === 320) expect(layout.mapWidth).toBeLessThanOrEqual(210);
  1360 |       const footer = await page.locator(".flow-fixed-footer").evaluate(element => {
  1361 |         const rect = element.getBoundingClientRect();
  1362 |         return { top: rect.top, bottom: rect.bottom, height: rect.height };
  1363 |       });
  1364 |       expect(footer.top).toBeGreaterThanOrEqual(0);
  1365 |       expect(footer.bottom).toBeLessThanOrEqual(viewport.height);
  1366 |       if (viewport.height < 520) expect(footer.height).toBeLessThanOrEqual(162);
  1367 |       await primary.tap();
  1368 |       await expect(page.getByRole("heading", { name: "Một khoảng cho mình." })).toBeVisible();
  1369 |     } finally {
  1370 |       await page.close();
  1371 |     }
  1372 |   }
  1373 | });
  1374 | 
  1375 | test("short second check-in step signals when more choices are available by scrolling", async ({ page }) => {
  1376 |   await page.setViewportSize({ width: 320, height: 568 });
  1377 |   await page.goto("/?mode=web");
  1378 |   await openGuestCheckin(page);
  1379 |   await page.getByRole("button", { name: "Tiếp: năng lượng và thời gian" }).click();
  1380 |   await expect(page.getByRole("heading", { name: "Một khoảng cho mình." })).toBeVisible();
  1381 | 
  1382 |   const scroll = page.locator('.mcy-flow-route-accessibility[data-flow-route="checkin"][data-flow-active="true"] .mobile-scroll');
  1383 |   const hint = page.locator(".mcy-checkin-step-two-scroll-hint");
  1384 |   await expect.poll(() => scroll.evaluate(element => element.scrollHeight - element.clientHeight)).toBeGreaterThan(8);
  1385 |   await expect(hint).toContainText("Cuộn xuống để xem thêm lựa chọn");
  1386 |   await expect(hint).toBeVisible();
  1387 |   const hintContrast = await hint.evaluate(element => {
  1388 |     const style = getComputedStyle(element);
  1389 |     const luminance = (color: string) => {
  1390 |       const [r, g, b] = color.match(/[\d.]+/g)!.slice(0, 3).map(channel => Number(channel) / 255).map(channel => channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4);
  1391 |       return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  1392 |     };
  1393 |     const foreground = luminance(style.color);
  1394 |     const background = luminance(style.backgroundColor);
  1395 |     return (Math.max(foreground, background) + 0.05) / (Math.min(foreground, background) + 0.05);
  1396 |   });
  1397 |   expect(hintContrast).toBeGreaterThanOrEqual(4.5);
  1398 | 
  1399 |   await scroll.evaluate(element => element.scrollTo({ top: element.scrollHeight, behavior: "instant" }));
  1400 |   await expect.poll(() => hint.isVisible()).toBe(false);
  1401 | 
  1402 |   await scroll.evaluate(element => element.scrollTo({ top: 0, behavior: "instant" }));
  1403 |   await page.setViewportSize({ width: 1440, height: 1000 });
> 1404 |   await expect.poll(() => scroll.evaluate(element => element.scrollHeight - element.clientHeight)).toBeLessThanOrEqual(8);
       |                                                                                                    ^ Error: expect(received).toBeLessThanOrEqual(expected)
  1405 |   await expect(hint).toHaveCount(0);
  1406 | });
  1407 | 
  1408 | test("short landscape keeps welcome choices and all benefits clear of the fixed footer", async ({ browser }) => {
  1409 |   const page = await browser.newPage({ viewport: { width: 844, height: 390 }, isMobile: true, hasTouch: true });
  1410 |   try {
  1411 |     await page.goto("/?mode=web");
  1412 |     const welcomeAction = page.locator(".mcy-welcome-bottom .mcy-action");
  1413 |     await expect(welcomeAction).toBeInViewport();
  1414 |     await expect(page.getByRole("button", { name: "Tạo tài khoản" })).toBeInViewport();
  1415 |     const layout = await page.evaluate(() => {
  1416 |       const screen = document.querySelector("[data-testid=device-screen]")!.getBoundingClientRect();
  1417 |       const footer = document.querySelector(".flow-fixed-footer")!.getBoundingClientRect();
  1418 |       const action = document.querySelector(".mcy-welcome-bottom .mcy-action")!.getBoundingClientRect();
  1419 |       const benefits = Array.from(document.querySelectorAll(".mcy-welcome-benefits > div"), item => item.getBoundingClientRect());
  1420 |       return {
  1421 |         footerHeight: footer.height,
  1422 |         footerTop: footer.top,
  1423 |         benefitsBottom: Math.max(...benefits.map(item => item.bottom)),
  1424 |         leftInset: action.left - screen.left,
  1425 |         rightInset: screen.right - action.right,
  1426 |       };
  1427 |     });
  1428 |     expect(layout.footerHeight).toBeLessThanOrEqual(140);
  1429 |     expect(layout.benefitsBottom).toBeLessThanOrEqual(layout.footerTop);
  1430 |     expect(layout.leftInset).toBeGreaterThanOrEqual(15);
  1431 |     expect(layout.rightInset).toBeGreaterThanOrEqual(15);
  1432 |   } finally {
  1433 |     await page.close();
  1434 |   }
  1435 | });
  1436 | 
  1437 | test("short portrait keeps welcome, lesson and reflection actions inside the viewport", async ({ browser }, testInfo) => {
  1438 |   const page = await browser.newPage({ viewport: { width: 320, height: 568 }, isMobile: true, hasTouch: true });
  1439 |   try {
  1440 |     await page.goto("/?mode=web");
  1441 |     const welcomeAction = page.locator(".mcy-welcome-bottom .mcy-action");
  1442 |     await expect(welcomeAction).toBeInViewport();
  1443 |     await expect(page.getByRole("button", { name: "Tạo tài khoản" })).toBeInViewport();
  1444 |     const welcomeLayout = await page.evaluate(() => {
  1445 |       const screen = document.querySelector("[data-testid=device-screen]")!.getBoundingClientRect();
  1446 |       const action = document.querySelector(".mcy-welcome-bottom .mcy-action")!.getBoundingClientRect();
  1447 |       const wordmark = document.querySelector(".mcy-welcome .mcy-brand-wordmark")!.getBoundingClientRect();
  1448 |       const brand = document.querySelector(".mcy-welcome .mcy-brand")!;
  1449 |       const scroll = document.querySelector(".mcy-scroll.welcome")!;
  1450 |       return {
  1451 |         leftInset: action.left - screen.left,
  1452 |         rightInset: screen.right - action.right,
  1453 |         actionBottom: action.bottom,
  1454 |         screenBottom: screen.bottom,
  1455 |         brandFontSize: Number.parseFloat(getComputedStyle(brand).fontSize),
  1456 |         wordmarkRight: wordmark.right,
  1457 |         screenRight: screen.right,
  1458 |         horizontalOverflow: scroll.scrollWidth > scroll.clientWidth,
  1459 |       };
  1460 |     });
  1461 |     expect(welcomeLayout.leftInset).toBeGreaterThanOrEqual(15);
  1462 |     expect(welcomeLayout.rightInset).toBeGreaterThanOrEqual(15);
  1463 |     expect(welcomeLayout.actionBottom).toBeLessThanOrEqual(welcomeLayout.screenBottom);
  1464 |     expect(welcomeLayout.brandFontSize).toBeLessThanOrEqual(36);
  1465 |     expect(welcomeLayout.wordmarkRight).toBeLessThanOrEqual(welcomeLayout.screenRight);
  1466 |     expect(welcomeLayout.horizontalOverflow).toBe(false);
  1467 |     await welcomeAction.tap();
  1468 | 
  1469 |     await page.locator(".flow-fixed-footer .mcy-action").tap();
  1470 |     await page.getByRole("button", { name: "Tự chọn bài học video miễn phí" }).tap();
  1471 |     await expect(page.getByTestId("free-course-catalog")).toBeVisible();
  1472 |     await page.getByRole("button", { name: /Một chút chuyển động nhẹ/ }).tap();
  1473 |     await expect.poll(() => page.locator('.flow-screen[data-flow-current="true"]').evaluate(screen => Math.round(screen.getBoundingClientRect().left - screen.parentElement!.getBoundingClientRect().left))).toBe(0);
  1474 |     const activeCourseDetail = page.locator('.mcy-flow-route-accessibility[data-flow-route="course-detail"][data-flow-active="true"]');
  1475 |     const captionNote = activeCourseDetail.locator(".mcy-course-caption-note");
  1476 |     await expect(captionNote).toBeVisible();
  1477 |     const captionLayout = await activeCourseDetail.locator(".mcy-course-featured").evaluate(featured => {
  1478 |       const note = featured.querySelector(".mcy-course-caption-note")!.getBoundingClientRect();
  1479 |       const video = featured.querySelector(".mcy-course-video")!.getBoundingClientRect();
  1480 |       return { noteLeft: note.left, noteRight: note.right, noteBottom: note.bottom, videoTop: video.top, documentWidth: document.documentElement.scrollWidth };
  1481 |     });
  1482 |     expect(captionLayout.noteLeft).toBeGreaterThanOrEqual(0);
  1483 |     expect(captionLayout.noteRight).toBeLessThanOrEqual(320);
  1484 |     expect(captionLayout.noteBottom).toBeLessThanOrEqual(captionLayout.videoTop);
  1485 |     expect(captionLayout.documentWidth).toBeLessThanOrEqual(320);
  1486 |     const scrollHint = activeCourseDetail.locator(".mcy-course-scroll-hint");
  1487 |     await expect(scrollHint).toBeVisible();
  1488 |     await expect(scrollHint).toBeInViewport({ ratio: 1 });
  1489 |     await page.screenshot({ path: testInfo.outputPath("course-detail-320x568-visible-scroll-cue.png") });
  1490 |     const playAction = page.getByRole("button", { name: /Phát bài học/ });
  1491 |     await playAction.scrollIntoViewIfNeeded();
  1492 |     await expect(playAction.locator(":scope > span")).toBeInViewport({ ratio: 1 });
  1493 |     await playAction.tap();
  1494 |     const reflectionAction = page.getByRole("button", { name: "Tôi đã thực hành · ghi cảm nhận" });
  1495 |     await reflectionAction.scrollIntoViewIfNeeded();
  1496 |     await expect(reflectionAction).toBeInViewport();
  1497 |     await reflectionAction.tap();
  1498 |     await expect(page.getByRole("heading", { name: "Sau buổi tập, cơ thể bạn thế nào?" })).toBeVisible();
  1499 |     await expect(page.locator(".flow-fixed-footer .mcy-action")).toBeInViewport();
  1500 |     await expect(page.locator(".mcy-note-label small")).toHaveText("Phản hồi này chỉ được giữ trong phiên hiện tại; chưa đồng bộ vào tài khoản.");
  1501 |     await page.locator(".flow-fixed-footer .mcy-action").tap();
  1502 |     await expect(page.getByRole("heading", { name: "Phản hồi cho phiên này đã được ghi nhận." })).toBeVisible();
  1503 |     await expect(page.locator(".mcy-sync-page .mcy-lead")).toContainText("chưa đồng bộ vào tài khoản hoặc lưu cho lần sau");
  1504 |     await expect(page.locator(".mcy-sync-page .mcy-state-pill")).toHaveText("CHỈ GIỮ TẠM TRONG PHIÊN");
```