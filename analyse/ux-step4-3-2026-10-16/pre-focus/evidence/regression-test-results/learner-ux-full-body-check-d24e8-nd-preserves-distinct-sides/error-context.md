# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: learner-ux.spec.ts >> full-body check-in covers office-work areas and preserves distinct sides
- Location: .vercel\ux-step4-3-20261016\tests\learner-ux.spec.ts:339:1

# Error details

```
Test timeout of 20000ms exceeded.
```

```
Error: locator.click: Test timeout of 20000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: 'Hai bên', exact: true })
    - locator resolved to <button class="mcy-choice" aria-pressed="false">Hai bên</button>
  - attempting click action
    - waiting for element to be visible, enabled and stable
    - element is not stable
  - retrying click action
    - waiting for element to be visible, enabled and stable

```

# Page snapshot

```yaml
- generic:
  - generic:
    - generic:
      - generic:
        - generic:
          - generic:
            - banner:
              - generic:
                - button:
                  - img
                - generic: Một chút yoga
            - generic:
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
              - main [ref=e6]:
                - generic [ref=e7]:
                  - text: Bước 1 / 2
                  - generic [ref=e8]: Cảm nhận cơ thể
                - heading [level=1] [ref=e9]: Cơ thể bạn hôm nay.
                - paragraph [ref=e10]: Một chút để lắng nghe cảm nhận.
                - generic [ref=e11]:
                  - button [expanded] [ref=e12]:
                    - generic [ref=e13]:
                      - strong [ref=e14]: Ghi nhận từng vùng cơ thể
                      - generic [ref=e15]:
                        - text: Thu gọn bản đồ
                        - img [ref=e16]
                      - generic [ref=e18]: Giữ 2 ghi nhận
                  - generic [ref=e19]:
                    - button [ref=e20]:
                      - generic [ref=e21]: Không thấy khó chịu
                    - button [ref=e22]:
                      - generic [ref=e23]: Chưa xác định
                - generic [ref=e25]:
                  - generic [ref=e26]:
                    - generic [ref=e27]:
                      - img [ref=e28]
                      - text: Chọn điểm trên hình hoặc nhóm vùng tay/chân bên dưới
                    - generic [ref=e30]:
                      - button [ref=e31]:
                        - text: Thân mình
                        - generic [ref=e32]: "0"
                      - button [ref=e33]:
                        - text: Tay
                        - generic [ref=e34]: "2"
                      - button [pressed] [ref=e35]:
                        - text: Chân
                        - generic [ref=e36]: "0"
                    - generic [ref=e37]:
                      - generic [ref=e38]:
                        - img [ref=e39]
                        - button [ref=e40]:
                          - generic [ref=e41]: +
                        - button [ref=e42]:
                          - generic [ref=e43]: +
                        - button [ref=e44]:
                          - generic [ref=e45]: +
                        - button [ref=e46]:
                          - generic [ref=e47]: +
                      - generic [ref=e48]: Toàn thân nhìn từ phía sau · trái/phải theo bạn
                    - button [ref=e49]:
                      - text: Đổi hình minh họa
                      - img [ref=e50]
                  - generic [ref=e52]:
                    - heading [level=2] [ref=e53]: Hoặc chọn một vùng
                    - generic [ref=e54]:
                      - button [ref=e55]:
                        - generic [ref=e56]: Đầu gối
                        - generic [ref=e57]: Chạm để ghi
                        - img [ref=e58]
                      - button [ref=e60]:
                        - generic [ref=e61]: Bàn chân
                        - generic [ref=e62]: Chạm để ghi
                        - img [ref=e63]
                    - generic [ref=e65]:
                      - img [ref=e66]
                      - text: Bạn chỉ cần chia sẻ điều mình thấy. Đây không phải đánh giá sức khỏe.
            - contentinfo:
              - generic:
                - generic:
                  - generic:
                    - strong: Bước 1 / 2
                    - generic: Cảm nhận cơ thể
                - button:
                  - text: "Tiếp: năng lượng và thời gian"
                  - img
                - generic:
                  - button: Bỏ qua ghi nhận cơ thể
                  - button: Tự chọn bài học miễn phí
        - dialog "Ghi nhận vùng đầu gối" [ref=e69]:
          - generic [ref=e72]:
            - heading "Ghi nhận vùng đầu gối" [level=2] [ref=e73]
            - paragraph [ref=e74]: Ngay lúc này, vùng này khiến bạn cảm thấy thế nào?
          - generic [ref=e76]:
            - generic [ref=e77]:
              - button "Không khó chịu" [active] [ref=e78]
              - button "Nhẹ" [ref=e79]
              - button "Vừa" [ref=e80]
              - button "Nhiều" [ref=e81]
              - button "Chưa rõ" [ref=e82]
            - strong [ref=e83]: Bên nào?
            - generic [ref=e84]:
              - button "Không rõ bên" [pressed] [ref=e85]
              - button "Trái" [ref=e86]
              - button "Phải" [ref=e87]
              - button "Hai bên" [ref=e88]
            - generic [ref=e89]:
              - text: Ghi chú riêng vùng này không bắt buộc
              - textbox "Ghi chú riêng vùng này không bắt buộc" [ref=e90]:
                - /placeholder: "Ví dụ: đầu gối mỏi khi ngồi lâu..."
            - button "Lưu vùng này" [disabled] [ref=e91]:
              - text: Lưu vùng này
              - img [ref=e92]
```

# Test source

```ts
  268 |       const fixedBottom = Number.parseFloat(getComputedStyle(fixedFooter).bottom) || 0;
  269 |       return {
  270 |         leftInset: actionRect.left - screenRect.left,
  271 |         rightInset: screenRect.right - actionRect.right,
  272 |         bottom: footerRect.bottom,
  273 |         expectedBottom: appViewport.getBoundingClientRect().bottom - fixedBottom,
  274 |         background: getComputedStyle(footer).backgroundColor,
  275 |         safeAreaFill: {
  276 |           content: getComputedStyle(fixedFooter, "::after").content,
  277 |           height: getComputedStyle(fixedFooter, "::after").height,
  278 |           background: getComputedStyle(fixedFooter, "::after").backgroundColor,
  279 |         },
  280 |       };
  281 |     });
  282 |     expect(footerBox.leftInset).toBeGreaterThanOrEqual(15);
  283 |     expect(footerBox.rightInset).toBeGreaterThanOrEqual(15);
  284 |     expect(footerBox.bottom).toBeCloseTo(footerBox.expectedBottom, 0);
  285 |     expect(footerBox.background).toBe("rgb(255, 252, 247)");
  286 |     if (device === "iphone") {
  287 |       expect(footerBox.safeAreaFill.height).toBe("34px");
  288 |       expect(footerBox.safeAreaFill.background).toBe("rgb(255, 252, 247)");
  289 |     } else {
  290 |       expect(footerBox.safeAreaFill.content).toBe("none");
  291 |     }
  292 | 
  293 |     await page.getByRole("button", { name: "Cổ: Chạm để ghi" }).click();
  294 |     await expect(page.getByRole("dialog")).toBeVisible();
  295 |     await expect(page.locator(".mcy-editor-note textarea")).toHaveCSS("font-size", "16px");
  296 |     await page.getByRole("button", { name: "Nhẹ", exact: true }).click();
  297 |     await page.getByRole("button", { name: "Lưu vùng này" }).click();
  298 |     const checkinScroll = page.locator("[data-testid=flow-current] .mobile-scroll");
  299 |     await checkinScroll.evaluate((element) => element.scrollTo({ top: element.scrollHeight, behavior: "instant" }));
  300 |     await page.getByRole("button", { name: "Tiếp: năng lượng và thời gian" }).click();
  301 |     await expect(page.getByRole("heading", { name: "Hôm nay bạn muốn dành bao lâu?" })).toBeVisible();
  302 |     await expect.poll(() => checkinScroll.evaluate(element => element.scrollTop)).toBe(0);
  303 |     await page.getByRole("button", { name: "5 phút", exact: true }).click();
  304 |     await page.getByRole("button", { name: "Quay lại cảm nhận cơ thể" }).click();
  305 |     await expect.poll(() => checkinScroll.evaluate(element => element.scrollTop)).toBe(0);
  306 |     await expect(page.locator(".mcy-region-list button.selected")).toContainText("Cổ");
  307 |     await expect(page.locator(".mcy-region-list button.selected")).toContainText("Nhẹ");
  308 | 
  309 |     const scroll = page.locator("[data-testid=flow-current] .mobile-scroll");
  310 |     await scroll.evaluate((element) => element.scrollTo({ top: element.scrollHeight, behavior: "instant" }));
  311 |     const finalRegion = page.locator(".mcy-region-list button").last();
  312 |     await expect(finalRegion).toBeInViewport();
  313 |     const captionGap = await page.locator(".mcy-body-orientation").evaluate((caption) => caption.getBoundingClientRect().top - caption.previousElementSibling!.getBoundingClientRect().bottom);
  314 |     expect(captionGap).toBeGreaterThanOrEqual(10);
  315 | 
  316 |     await page.getByRole("button", { name: "Bỏ qua ghi nhận cơ thể" }).click();
  317 |     await expect(page.getByRole("heading", { name: "Bỏ ghi nhận vùng cơ thể?" })).toBeVisible();
  318 |     await page.getByRole("button", { name: "Giữ các vùng đã ghi" }).click();
  319 |     await expect(page.locator(".mcy-region-list button.selected")).toContainText("Cổ");
  320 |     await page.getByRole("button", { name: "Bỏ qua ghi nhận cơ thể" }).click();
  321 |     await page.getByRole("button", { name: "Bỏ qua và tiếp tục" }).click();
  322 |     await expect(page.locator(".mcy-checkin-summary")).toContainText("Bỏ qua phần cơ thể");
  323 |     await page.getByRole("button", { name: "Tự chọn bài học video miễn phí" }).click();
  324 |     await expect(page.getByTestId("free-course-catalog")).toBeVisible();
  325 |     await page.getByRole("button", { name: /Một chút chuyển động nhẹ/ }).click();
  326 |     await expect(page.getByRole("heading", { name: "Một chút chuyển động nhẹ" })).toBeVisible();
  327 |     await expect(page.locator("iframe")).toHaveCount(0);
  328 |     await expect(page.locator(".mcy-practice-page, .mcy-practice-step, .mcy-timer, .mcy-plan-hero")).toHaveCount(0);
  329 |     await page.getByRole("button", { name: /Phát bài học/ }).click();
  330 |     await expect(page.locator('iframe[src*="youtube-nocookie.com/embed/yKm7aOAWn-k"]')).toHaveCount(1);
  331 |     await expect(page.getByText("MCY không nhận được trạng thái xem hết video.")).toBeVisible();
  332 |     await page.getByRole("button", { name: "Tôi đã thực hành · ghi cảm nhận" }).click();
  333 |     await expect(page.getByRole("heading", { name: "Sau buổi tập, cơ thể bạn thế nào?" })).toBeVisible();
  334 |     await page.getByRole("button", { name: "Khó chịu hơn" }).click();
  335 |     await expect(page.locator(".mcy-alert")).toContainText("không tự gợi bài");
  336 |   });
  337 | }
  338 | 
  339 | test("full-body check-in covers office-work areas and preserves distinct sides", async ({ page }) => {
  340 |   await page.setViewportSize({ width: 390, height: 844 });
  341 |   await page.goto("/?mode=web");
  342 |   await openGuestCheckin(page);
  343 |   await expect(page.locator(".mcy-checkin-illustration .mcy-body-art img")).toHaveAttribute("src", "/assets/body-map-feminine-full-1024.webp");
  344 |   await expect(page.getByTestId("body-orientation")).toContainText("Toàn thân");
  345 |   await page.locator(".mcy-checkin-illustration .mcy-body-art").evaluate(map => { const scroll = map.closest(".mobile-scroll")!; scroll.scrollTop += map.getBoundingClientRect().top - scroll.getBoundingClientRect().top; });
  346 |   const mapAndFooter = await page.evaluate(() => ({
  347 |     mapBottom: document.querySelector(".mcy-checkin-illustration .mcy-body-art")!.getBoundingClientRect().bottom,
  348 |     footerTop: document.querySelector(".flow-fixed-footer")!.getBoundingClientRect().top,
  349 |     mapPinSize: document.querySelector(".mcy-map-pin")!.getBoundingClientRect().width,
  350 |   }));
  351 |   expect(mapAndFooter.mapBottom).toBeLessThanOrEqual(mapAndFooter.footerTop);
  352 |   expect(mapAndFooter.mapPinSize).toBeGreaterThanOrEqual(44);
  353 | 
  354 |   await page.locator(".mcy-body-groups button").nth(1).click();
  355 |   await expect(page.locator(".mcy-region-list")).toContainText("Khuỷu tay");
  356 |   await page.locator(".mcy-region-list button").filter({ hasText: "Khuỷu tay" }).click();
  357 |   await page.getByRole("button", { name: "Trái", exact: true }).click();
  358 |   await page.getByRole("button", { name: "Vừa", exact: true }).click();
  359 |   await page.getByRole("button", { name: "Lưu vùng này" }).click();
  360 |   await page.locator('.mcy-map-pin[aria-label^="Khuỷu tay phải:"]').click();
  361 |   await page.getByRole("button", { name: "Phải", exact: true }).click();
  362 |   await page.getByRole("button", { name: "Nhẹ", exact: true }).click();
  363 |   await page.getByRole("button", { name: "Lưu vùng này" }).click();
  364 |   await expect(page.locator(".mcy-region-list button").filter({ hasText: "Khuỷu tay" })).toContainText("Trái · Vừa / Phải · Nhẹ");
  365 | 
  366 |   await page.locator(".mcy-body-groups button").nth(2).click();
  367 |   await page.locator(".mcy-region-list button").filter({ hasText: "Đầu gối" }).click();
> 368 |   await page.getByRole("button", { name: "Hai bên", exact: true }).click();
      |                                                                    ^ Error: locator.click: Test timeout of 20000ms exceeded.
  369 |   await page.getByRole("button", { name: "Nhẹ", exact: true }).click();
  370 |   await page.getByRole("button", { name: "Lưu vùng này" }).click();
  371 |   await expect(page.locator(".mcy-region-list button").filter({ hasText: "Đầu gối" })).toContainText("Hai bên · Nhẹ");
  372 | 
  373 |   await page.getByRole("button", { name: "Tiếp: năng lượng và thời gian" }).click();
  374 |   await expect(page.locator(".mcy-checkin-summary")).toContainText("Khuỷu tay · Trái · Vừa");
  375 |   await expect(page.locator(".mcy-checkin-summary")).toContainText("Khuỷu tay · Phải · Nhẹ");
  376 |   await expect(page.locator(".mcy-checkin-summary")).toContainText("Đầu gối · Hai bên · Nhẹ");
  377 | });
  378 | 
  379 | test("learner-facing MVP surfaces do not expose preview or mock copy", async ({ page }) => {
  380 |   const learnerSurface = page.locator("main").first();
  381 |   const forbiddenCopy = /preview|prototype|mock|sample|mô phỏng|bản mẫu|bản review/i;
  382 |   await page.goto("/?mode=web");
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
```