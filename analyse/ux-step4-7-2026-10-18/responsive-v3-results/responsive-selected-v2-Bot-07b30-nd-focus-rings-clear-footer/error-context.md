# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: responsive-selected-v2.spec.ts >> BottomNav normal 68 and VI 28 four routes at 320: all text Ranges and focus rings clear footer
- Location: ..\..\..\.vercel\ux-step4-7-20261018-v2\tests\ux-responsive.spec.ts:117:1

# Error details

```
Error: locator.evaluate: Error: strict mode violation: getByTestId('flow-current').locator('.mobile-scroll') resolved to 2 elements:
    1) <div class="mobile-scroll" data-dragging="false" data-overscroll="0.00" data-testid="mobile-scroll">…</div> aka locator('section').filter({ hasText: 'Hành trình của bạnChưa có bản' }).getByTestId('mobile-scroll')
    2) <div class="mobile-scroll" data-dragging="false" data-overscroll="0.00" data-testid="mobile-scroll">…</div> aka locator('section').filter({ hasText: 'KHÁM PHÁBài học yoga miễn phí' }).getByTestId('mobile-scroll')

Call log:
  - waiting for getByTestId('flow-current').locator('.mobile-scroll')

```

# Page snapshot

```yaml
- generic [ref=e6]:
  - banner [ref=e7]:
    - generic "Một chút yoga" [ref=e9]
  - generic [ref=e10]:
    - generic:
      - generic:
        - generic:
          - generic:
            - generic:
              - main:
                - generic:
                  - text: Bước 1 / 2
                  - generic: Cảm nhận cơ thể
                - heading [level=1]: Cơ thể bạn hôm nay.
                - paragraph: Một chút để lắng nghe cảm nhận.
                - generic:
                  - button:
                    - generic:
                      - strong: Ghi nhận từng vùng cơ thể
                      - generic: Chọn vùng, ghi lại cảm nhận riêng.
                      - generic:
                        - text: Mở bản đồ cơ thể
                        - img
                  - generic:
                    - button:
                      - generic: Không thấy khó chịu
                    - button:
                      - generic: Chưa xác định
                - generic:
                  - img
                  - text: Bạn chỉ cần chia sẻ điều mình thấy. Đây không phải đánh giá sức khỏe.
    - main [ref=e16]:
      - heading "Hành trình của bạn" [level=1] [ref=e17]
      - generic [ref=e18]:
        - img [ref=e19]
        - heading "Chưa có bản ghi nào" [level=2] [ref=e21]
        - paragraph [ref=e22]: Bản ghi đầu tiên sẽ xuất hiện ở đây sau khi bạn hoàn tất một lần check-in.
      - button "Thử lần quay lại tiếp theo" [ref=e23]:
        - text: Thử lần quay lại tiếp theo
        - img [ref=e24]
      - paragraph [ref=e26]:
        - img [ref=e27]
        - text: Ngày chưa ghi vẫn giữ nguyên khoảng trống. MCY không tự ước tính hoặc gọi đó là tiến bộ.
    - main [ref=e34]:
      - generic [ref=e35]: KHÁM PHÁ
      - heading "Bài học yoga miễn phí" [level=1] [ref=e36]
      - paragraph [ref=e37]: Chọn một nhóm video từ kênh Một chút yoga. Mỗi bài được phát trong ứng dụng; bạn tự chọn thứ tự và nhịp tập phù hợp với mình.
      - region "Chọn một nhóm để bắt đầu" [ref=e38]:
        - generic [ref=e39]:
          - generic [ref=e40]:
            - generic [ref=e41]: TỪ KÊNH MỘT CHÚT YOGA
            - heading "Chọn một nhóm để bắt đầu" [level=2] [ref=e42]
          - generic [ref=e43]: 38 BÀI HỌC
        - paragraph [ref=e44]: Mở một nhóm để xem danh sách bài, thời lượng và nội dung từng video.
        - generic [ref=e45]:
          - generic [ref=e46]: Cuộn xuống để xem ghi chú và cách chọn bài
          - img [ref=e47]
        - generic [ref=e49]:
          - button "18 Một chút chuyển động nhẹ 18 bài học · Miễn phí Xem danh sách bài" [ref=e50]:
            - generic [ref=e51]: "18"
            - generic [ref=e52]:
              - strong [ref=e53]: Một chút chuyển động nhẹ
              - generic [ref=e54]: 18 bài học · Miễn phí
              - emphasis [ref=e55]: Xem danh sách bài
            - img [ref=e56]
          - button "13 Làm quen với các tư thế yoga 13 bài học · Miễn phí Xem danh sách bài" [ref=e58]:
            - generic [ref=e59]: "13"
            - generic [ref=e60]:
              - strong [ref=e61]: Làm quen với các tư thế yoga
              - generic [ref=e62]: 13 bài học · Miễn phí
              - emphasis [ref=e63]: Xem danh sách bài
            - img [ref=e64]
          - button "07 Chuỗi tư thế cơ bản 7 bài học · Miễn phí Xem danh sách bài" [ref=e66]:
            - generic [ref=e67]: "07"
            - generic [ref=e68]:
              - strong [ref=e69]: Chuỗi tư thế cơ bản
              - generic [ref=e70]: 7 bài học · Miễn phí
              - emphasis [ref=e71]: Xem danh sách bài
            - img [ref=e72]
        - paragraph [ref=e74]:
          - img [ref=e75]
          - text: Video chỉ kết nối với YouTube khi bạn nhấn Phát. Việc phát trong ứng dụng vẫn tuân theo chính sách quyền riêng tư của Google.
      - button "Cách chọn bài học video Duyệt bài miễn phí và ghi lại cảm nhận" [ref=e77]:
        - generic [ref=e78]:
          - strong [ref=e79]: Cách chọn bài học video
          - generic [ref=e80]: Duyệt bài miễn phí và ghi lại cảm nhận
        - img [ref=e81]
  - contentinfo [ref=e83]:
    - navigation "Điều hướng chính" [ref=e84]:
      - button "Hôm nay" [ref=e85]:
        - img [ref=e86]
        - generic [ref=e88]: Hôm nay
      - button "Hành trình" [ref=e89]:
        - img [ref=e90]
        - generic [ref=e92]: Hành trình
      - button "Khám phá" [ref=e93]:
        - img [ref=e94]
        - generic [ref=e96]: Khám phá
      - button "Cá nhân" [active] [ref=e97]:
        - img [ref=e98]
        - generic [ref=e100]: Cá nhân
```

# Test source

```ts
  8   |   await page.evaluate(async () => {
  9   |     await document.fonts.ready;
  10  |     await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
  11  |   });
  12  |   await expect.poll(() => nav(page).evaluate(footer => {
  13  |     const stack = footer.closest<HTMLElement>('.flow-stack')!;
  14  |     return Number.parseFloat(stack.style.getPropertyValue('--mcy-app-nav-height')) === (footer as HTMLElement).offsetHeight;
  15  |   })).toBe(true);
  16  | }
  17  | 
  18  | async function guest(page: Page, query = '?mode=web', english = false) {
  19  |   await page.emulateMedia({ reducedMotion: 'reduce' });
  20  |   await page.goto('/' + query);
  21  |   if (english) await page.locator('.mcy-language-toggle').click();
  22  |   await page.getByRole('button', { name: english ? 'Explore as a guest' : 'Thử tìm hiểu như khách', exact: true }).click();
  23  |   await page.getByRole('button', { name: english ? 'Browse free video lessons' : 'Tự chọn bài học miễn phí', exact: true }).click();
  24  |   await expect(nav(page)).toHaveCount(1);
  25  |   await settled(page);
  26  | }
  27  | 
  28  | async function font28(page: Page) {
  29  |   await page.addStyleTag({ content: '.mcy-bottom-nav button{font-size:28px!important;line-height:1.5!important}' });
  30  |   await expect.poll(() => nav(page).evaluate(footer => [...footer.querySelectorAll<HTMLButtonElement>('.mcy-bottom-nav button')].every(button => {
  31  |     const span = button.querySelector('span')!;
  32  |     const style = getComputedStyle(span);
  33  |     const range = document.createRange();
  34  |     range.selectNodeContents(span);
  35  |     return style.fontSize === '28px' && Math.abs(Number.parseFloat(style.lineHeight) - 42) <= 0.5 && range.getClientRects().length > 0 && range.getBoundingClientRect().height >= 25;
  36  |   }))).toBe(true);
  37  |   await page.evaluate(() => new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
  38  |   await settled(page);
  39  | }
  40  | 
  41  | async function geometry(page: Page, expectedMin = 68) {
  42  |   const result = await nav(page).evaluate(footer => {
  43  |     const f = footer.getBoundingClientRect();
  44  |     const stack = footer.closest<HTMLElement>('.flow-stack')!;
  45  |     const scale = f.width / (footer as HTMLElement).offsetWidth;
  46  |     const buttons = [...footer.querySelectorAll<HTMLButtonElement>('.mcy-bottom-nav button')];
  47  |     return {
  48  |       offsetHeight: (footer as HTMLElement).offsetHeight,
  49  |       scale,
  50  |       published: Number.parseFloat(stack.style.getPropertyValue('--mcy-app-nav-height')),
  51  |       footer: { top: f.top, right: f.right, bottom: f.bottom, left: f.left },
  52  |       buttons: buttons.map(button => {
  53  |         const b = button.getBoundingClientRect();
  54  |         const span = button.querySelector('span')!;
  55  |         const range = document.createRange();
  56  |         range.selectNodeContents(span);
  57  |         const lines = [...range.getClientRects()].map(r => ({ top: r.top, right: r.right, bottom: r.bottom, left: r.left }));
  58  |         return { rect: { top: b.top, right: b.right, bottom: b.bottom, left: b.left }, lines, font: getComputedStyle(button).fontSize };
  59  |       }),
  60  |     };
  61  |   });
  62  |   expect(result.offsetHeight).toBeGreaterThanOrEqual(expectedMin);
  63  |   expect(result.published).toBe(result.offsetHeight);
  64  |   expect(result.buttons).toHaveLength(4);
  65  |   for (const button of result.buttons) {
  66  |     expect(button.lines.length).toBeGreaterThan(0);
  67  |     const ring = 6 * result.scale;
  68  |     expect(button.rect.left - ring).toBeGreaterThanOrEqual(result.footer.left - 1);
  69  |     expect(button.rect.right + ring).toBeLessThanOrEqual(result.footer.right + 1);
  70  |     expect(button.rect.top - ring).toBeGreaterThanOrEqual(result.footer.top - 1);
  71  |     expect(button.rect.bottom + ring).toBeLessThanOrEqual(result.footer.bottom + 1);
  72  |     for (const line of button.lines) {
  73  |       expect(line.left).toBeGreaterThanOrEqual(button.rect.left - 1);
  74  |       expect(line.right).toBeLessThanOrEqual(button.rect.right + 1);
  75  |       expect(line.top).toBeGreaterThanOrEqual(button.rect.top - 1);
  76  |       expect(line.bottom).toBeLessThanOrEqual(button.rect.bottom + 1);
  77  |       expect(line.left).toBeGreaterThanOrEqual(result.footer.left - 1);
  78  |       expect(line.right).toBeLessThanOrEqual(result.footer.right + 1);
  79  |       expect(line.bottom).toBeLessThanOrEqual(result.footer.bottom + 1);
  80  |     }
  81  |   }
  82  |   return result;
  83  | }
  84  | 
  85  | async function assertActualNavTabRings(page: Page) {
  86  |   for (let index = 0; index < 4; index++) {
  87  |     let reached = false;
  88  |     for (let attempt = 0; attempt < 60; attempt++) {
  89  |       await page.keyboard.press('Tab');
  90  |       reached = await nav(page).locator('button').nth(index).evaluate(button => document.activeElement === button);
  91  |       if (reached) break;
  92  |     }
  93  |     expect(reached, `Actual Tab reaches nav control ${index + 1}`).toBe(true);
  94  |     const bounds = await nav(page).locator('button').nth(index).evaluate(button => {
  95  |       const b = button.getBoundingClientRect();
  96  |       const footer = button.closest('footer') as HTMLElement;
  97  |       const f = footer.getBoundingClientRect();
  98  |       const style = getComputedStyle(button);
  99  |       return { ring: Number.parseFloat(style.outlineWidth) + Number.parseFloat(style.outlineOffset), scale: f.width / footer.offsetWidth, visible: button.matches(':focus-visible'), left: b.left - f.left, right: f.right - b.right, top: b.top - f.top, bottom: f.bottom - b.bottom };
  100 |     });
  101 |     expect(bounds.visible).toBe(true);
  102 |     expect(bounds.ring).toBeGreaterThanOrEqual(6);
  103 |     for (const side of [bounds.left, bounds.right, bounds.top, bounds.bottom]) expect(side).toBeGreaterThanOrEqual(bounds.ring * bounds.scale - 1);
  104 |   }
  105 | }
  106 | 
  107 | async function lastContentClear(page: Page) {
> 108 |   return current(page).locator('.mobile-scroll').evaluate(scroll => {
      |                                                  ^ Error: locator.evaluate: Error: strict mode violation: getByTestId('flow-current').locator('.mobile-scroll') resolved to 2 elements:
  109 |     scroll.scrollTop = scroll.scrollHeight;
  110 |     const last = scroll.querySelector('main')?.lastElementChild;
  111 |     const footer = document.querySelector('.mcy-app-navigation');
  112 |     if (!last || !footer) throw Error('Missing active content or shared navigation');
  113 |     return { lastBottom: last.getBoundingClientRect().bottom, footerTop: footer.getBoundingClientRect().top, scrollTop: scroll.scrollTop };
  114 |   });
  115 | }
  116 | 
  117 | test('BottomNav normal 68 and VI 28 four routes at 320: all text Ranges and focus rings clear footer', async ({ page }) => {
  118 |   await page.setViewportSize({ width: 320, height: 568 });
  119 |   await guest(page);
  120 |   for (const label of labels) {
  121 |     await nav(page).getByRole('button', { name: label, exact: true }).click();
  122 |     await settled(page);
  123 |     const normal = await geometry(page);
  124 |     expect(normal.offsetHeight).toBe(68);
  125 |   }
  126 |   await font28(page);
  127 |   for (const label of labels) {
  128 |     await nav(page).getByRole('button', { name: label, exact: true }).click();
  129 |     await settled(page);
  130 |     const large = await geometry(page, 69);
  131 |     expect(large.buttons.every(button => button.font === '28px')).toBe(true);
  132 |     await assertActualNavTabRings(page);
  133 |     const content = await lastContentClear(page);
  134 |     expect(content.lastBottom).toBeLessThanOrEqual(content.footerTop - 6);
  135 |   }
  136 | });
  137 | 
  138 | test('BottomNav EN 28 labels wrap inside four equal controls at 320 without horizontal overflow', async ({ page }) => {
  139 |   await page.setViewportSize({ width: 320, height: 568 });
  140 |   await guest(page, '?mode=web', true);
  141 |   await font28(page);
  142 |   const g = await geometry(page, 69);
  143 |   const widths = g.buttons.map(button => button.rect.right - button.rect.left);
  144 |   expect(Math.max(...widths) - Math.min(...widths)).toBeLessThanOrEqual(1);
  145 |   expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  146 |   await assertActualNavTabRings(page);
  147 | });
  148 | 
  149 | test('BottomNav live font and viewport resize updates measured CSS height and content end', async ({ page }) => {
  150 |   await page.setViewportSize({ width: 390, height: 844 });
  151 |   await guest(page);
  152 |   const normal = await geometry(page);
  153 |   await font28(page);
  154 |   const large = await geometry(page, 69);
  155 |   expect(large.offsetHeight).toBeGreaterThan(normal.offsetHeight);
  156 |   await page.setViewportSize({ width: 320, height: 568 });
  157 |   await settled(page);
  158 |   await geometry(page, 69);
  159 |   let content = await lastContentClear(page);
  160 |   expect(content.lastBottom).toBeLessThanOrEqual(content.footerTop - 6);
  161 |   await page.setViewportSize({ width: 844, height: 390 });
  162 |   await settled(page);
  163 |   await geometry(page, 69);
  164 |   content = await lastContentClear(page);
  165 |   expect(content.lastBottom).toBeLessThanOrEqual(content.footerTop - 6);
  166 | });
  167 | 
  168 | test('BottomNav Profile to edit input and back clears ownership and restores measured clearance', async ({ page }) => {
  169 |   await page.setViewportSize({ width: 1100, height: 1100 });
  170 |   await guest(page, '?mode=review&device=iphone');
  171 |   await nav(page).getByRole('button', { name: 'Cá nhân', exact: true }).click();
  172 |   await settled(page);
  173 |   const row = current(page).getByRole('button', { name: /Thông tin cá nhân/ });
  174 |   const retainedScroll = page.locator('.mcy-profile-scroll > .mobile-scroll');
  175 |   const before = await retainedScroll.evaluate(scroll => {
  176 |     scroll.scrollTop = scroll.scrollHeight;
  177 |     return { top: scroll.scrollTop, height: scroll.scrollHeight, last: scroll.querySelector('main')!.lastElementChild!.getBoundingClientRect().bottom };
  178 |   });
  179 |   expect(before.top).toBeGreaterThan(0);
  180 |   // Trigger the existing row handler without scrolling its offscreen DOM node first:
  181 |   // this isolates whether a route transition itself clamps a retained end position.
  182 |   await row.evaluate((button: HTMLButtonElement) => button.click());
  183 |   await expect(nav(page)).toHaveCount(0);
  184 |   expect(await page.locator('.flow-stack').evaluate(stack => stack.style.getPropertyValue('--mcy-app-nav-height'))).toBe('');
  185 |   const during = await retainedScroll.evaluate(scroll => ({ top: scroll.scrollTop, height: scroll.scrollHeight }));
  186 |   expect(during.top).toBeGreaterThanOrEqual(before.top - 2);
  187 |   const input = page.getByLabel('Tên hiển thị', { exact: true });
  188 |   await input.click();
  189 |   await expect(page.getByTestId('keyboard-dock')).toHaveAttribute('data-visible', 'true');
  190 |   await page.getByRole('button', { name: 'Quay lại', exact: true }).click();
  191 |   await expect(nav(page)).toHaveCount(1);
  192 |   await settled(page);
  193 |   await expect(page.getByTestId('flow-current')).toHaveCount(1);
  194 |   const after = await retainedScroll.evaluate(scroll => ({ top: scroll.scrollTop, last: scroll.querySelector('main')!.lastElementChild!.getBoundingClientRect().bottom }));
  195 |   expect(Math.abs(after.top - before.top)).toBeLessThanOrEqual(2);
  196 |   expect(Math.abs(after.last - before.last)).toBeLessThanOrEqual(3);
  197 |   const content = await lastContentClear(page);
  198 |   expect(content.lastBottom).toBeLessThanOrEqual(content.footerTop - 6);
  199 |   await nav(page).getByRole('button', { name: 'Khám phá', exact: true }).click();
  200 |   await page.getByRole('button', { name: /Một chút chuyển động nhẹ/ }).click();
  201 |   await expect(nav(page)).toHaveCount(0);
  202 |   expect(await page.locator('.flow-stack').evaluate(stack => stack.style.getPropertyValue('--mcy-app-nav-height'))).toBe('');
  203 |   await page.getByRole('button', { name: 'Quay lại', exact: true }).click();
  204 |   await expect(nav(page)).toHaveCount(1);
  205 |   await settled(page);
  206 |   await geometry(page);
  207 | });
  208 | 
```