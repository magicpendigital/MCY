# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: learner-ux.spec.ts >> short portrait and landscape mobile viewports keep the check-in actions reachable
- Location: .vercel\ux-step4-3-20261016\tests\learner-ux.spec.ts:1346:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('heading', { name: 'Hôm nay bạn muốn dành bao lâu?' })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByRole('heading', { name: 'Hôm nay bạn muốn dành bao lâu?' })

```

```yaml
- banner:
  - button "Quay lại":
    - img
  - text: Một chút yoga
- main:
  - text: Bước 2 / 2 Năng lượng và thời gian
  - heading "Một khoảng cho mình." [level=1]
  - paragraph: Bạn tự chọn bài trong thư viện.
  - region "Bạn có khoảng bao lâu?":
    - heading "Bạn có khoảng bao lâu?" [level=2]
    - button "5 phút"
    - button "10 phút" [pressed]
    - button "15 phút"
    - paragraph: Để bạn tham khảo khi tự chọn bài. Thư viện chưa lọc theo thời gian này.
  - text: Cuộn xuống để xem thêm lựa chọn
  - region "Năng lượng hôm nay (không bắt buộc)":
    - heading "Năng lượng hôm nay (không bắt buộc)" [level=2]
    - paragraph: Chỉ nằm trong nháp hiện tại; chưa dùng để chọn bài.
    - button "Rất thấp"
    - button "Thấp"
    - button "Bình thường"
    - button "Khá ổn"
    - button "Tràn đầy"
  - strong: Cảm nhận cơ thể
  - text: Chưa ghi nhận
  - button "Sửa"
  - paragraph: Bạn chưa cho phép lưu check-in. Các lựa chọn vẫn nằm trong nháp hiện tại.
  - button "Chỉ ghi lại cảm nhận hôm nay, không chọn bài"
  - img
  - text: Bạn chỉ cần chia sẻ điều mình thấy. Đây không phải đánh giá sức khỏe.
- contentinfo:
  - strong: Bước 2 / 2
  - text: Năng lượng và thời gian
  - button "Tự chọn bài học video miễn phí":
    - text: Tự chọn bài học video miễn phí
    - img
  - button "Đăng nhập hoặc tạo tài khoản (tùy chọn)"
  - button "Quay lại cảm nhận cơ thể"
```

# Test source

```ts
  1268 |   let playerLoads = 0;
  1269 |   await page.route("https://www.youtube-nocookie.com/embed/**", async route => {
  1270 |     playerLoads += 1;
  1271 |     await route.abort();
  1272 |   });
  1273 |   await page.goto("/?mode=web");
  1274 |   await openGuestCheckin(page);
  1275 |   await page.locator(".mcy-checkin-footer-options button").nth(1).click();
  1276 |   await expect(page.getByTestId("free-course-catalog")).toBeVisible();
  1277 |   await page.getByRole("button", { name: /Một chút chuyển động nhẹ/ }).click();
  1278 |   const detail = page.locator('[data-testid="flow-current"]').last();
  1279 |   await expect(detail.getByRole("heading", { name: "Một chút chuyển động nhẹ" })).toBeVisible();
  1280 |   await expect(page.locator("iframe")).toHaveCount(0);
  1281 | 
  1282 |   await detail.locator(".mcy-course-play").click();
  1283 |   const player = page.locator('iframe[src*="youtube-nocookie.com/embed/yKm7aOAWn-k"]');
  1284 |   await expect(player).toHaveCount(1);
  1285 |   await expect.poll(() => playerLoads).toBe(1);
  1286 |   const status = detail.getByTestId("course-player-status");
  1287 |   await expect(status).toBeVisible();
  1288 |   await expect(status).toHaveAttribute("data-state", "frame-loaded");
  1289 |   await expect(status).toContainText("MCY không theo dõi tiến độ xem");
  1290 |   const help = detail.locator(".mcy-course-player-help");
  1291 |   const helpToggle = detail.getByRole("button", { name: "Video gặp sự cố khi phát?" });
  1292 |   await expect(helpToggle).toHaveAttribute("aria-expanded", "false");
  1293 |   await expect(help).toBeHidden();
  1294 |   await helpToggle.scrollIntoViewIfNeeded();
  1295 |   await expect(helpToggle).toBeInViewport();
  1296 |   await helpToggle.click();
  1297 |   await expect(helpToggle).toHaveAttribute("aria-expanded", "true");
  1298 |   await expect(help).toContainText("Bạn có thể tải lại video ngay trong ứng dụng");
  1299 |   await expect(help.getByRole("button", { name: "Tải lại trong ứng dụng" })).toBeVisible();
  1300 |   const fallback = help.getByRole("link", { name: "Mở video gốc trên YouTube" });
  1301 |   await expect(fallback).toHaveAttribute("href", "https://www.youtube.com/watch?v=yKm7aOAWn-k");
  1302 |   await expect(fallback).toHaveAttribute("target", "_blank");
  1303 |   await expect(fallback).toHaveAttribute("rel", "noopener noreferrer");
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
> 1368 |       await expect(page.getByRole("heading", { name: "Hôm nay bạn muốn dành bao lâu?" })).toBeVisible();
       |                                                                                           ^ Error: expect(locator).toBeVisible() failed
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
  1380 |   await expect(page.getByRole("heading", { name: "Hôm nay bạn muốn dành bao lâu?" })).toBeVisible();
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
  1404 |   await expect.poll(() => scroll.evaluate(element => element.scrollHeight - element.clientHeight)).toBeLessThanOrEqual(8);
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
```