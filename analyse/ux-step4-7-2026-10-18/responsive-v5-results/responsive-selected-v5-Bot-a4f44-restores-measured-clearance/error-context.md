# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: responsive-selected-v5.spec.ts >> BottomNav Profile to edit input and back clears ownership and restores measured clearance
- Location: ..\..\..\.vercel\ux-step4-7-20261018-v4\tests\ux-responsive.spec.ts:179:1

# Error details

```
Error: expect(received).toBeLessThanOrEqual(expected)

Expected: <= 2
Received:    919
```

# Page snapshot

```yaml
- generic [ref=e3]:
  - 'button "Preview device: iPhone" [ref=e5] [cursor=pointer]':
    - generic [ref=e6]: iPhone
    - img [ref=e7]
  - generic [ref=e10]:
    - img
    - generic [ref=e11]:
      - generic "Device status bar":
        - generic: 11:31
        - generic:
          - img
      - generic [ref=e13]:
        - banner [ref=e14]:
          - generic "Một chút yoga" [ref=e16]
        - generic [ref=e17]:
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
          - main [ref=e23]:
            - generic [ref=e24]:
              - generic [ref=e25]: CÁ NHÂN · KHÁCH
              - heading "Lựa chọn của bạn." [active] [level=1] [ref=e26]
              - paragraph [ref=e27]: Tài khoản là tùy chọn. Bạn vẫn có thể xem và thực hành như khách.
            - region "Hồ sơ và dữ liệu" [ref=e28]:
              - heading "Hồ sơ và dữ liệu" [level=2] [ref=e29]
              - button "Thông tin cá nhân Tên tùy chọn · ngôn ngữ · hình minh họa" [ref=e30]:
                - generic [ref=e31]:
                  - strong [ref=e32]: Thông tin cá nhân
                  - generic [ref=e33]: Tên tùy chọn · ngôn ngữ · hình minh họa
                - img [ref=e34]
              - button "Quyền riêng tư và đồng ý Xem từng mục đích · thay đổi hoặc rút đồng ý" [ref=e36]:
                - generic [ref=e37]:
                  - strong [ref=e38]: Quyền riêng tư và đồng ý
                  - generic [ref=e39]: Xem từng mục đích · thay đổi hoặc rút đồng ý
                - img [ref=e40]
              - button "AI và điều được nhớ Chưa có thông tin được nhớ" [ref=e42]:
                - generic [ref=e43]:
                  - strong [ref=e44]: AI và điều được nhớ
                  - generic [ref=e45]: Chưa có thông tin được nhớ
                - img [ref=e46]
            - generic [ref=e48]:
              - generic [ref=e49]: TÀI KHOẢN
              - paragraph [ref=e50]: Đăng nhập để lưu hồ sơ, lựa chọn quyền và check-in có đồng ý.
              - button "Tạo tài khoản hoặc đăng nhập" [ref=e51]
            - region "Tài khoản và hướng dẫn" [ref=e52]:
              - heading "Tài khoản và hướng dẫn" [level=2] [ref=e53]
              - button "Bảo mật tài khoản Email và đăng nhập bằng tài khoản khác" [ref=e54]:
                - generic [ref=e55]:
                  - strong [ref=e56]: Bảo mật tài khoản
                  - generic [ref=e57]: Email và đăng nhập bằng tài khoản khác
                - img [ref=e58]
              - button "Hướng dẫn và liên hệ Đọc hướng dẫn · chưa gửi yêu cầu trong ứng dụng" [ref=e60]:
                - generic [ref=e61]:
                  - strong [ref=e62]: Hướng dẫn và liên hệ
                  - generic [ref=e63]: Đọc hướng dẫn · chưa gửi yêu cầu trong ứng dụng
                - img [ref=e64]
            - region "Tính năng và trạng thái hiện có" [ref=e66]:
              - heading "Tính năng và trạng thái hiện có" [level=2] [ref=e67]
              - paragraph [ref=e68]: Xem lựa chọn đang có và những phần chưa mở.
              - button "Tùy chọn thông báo Lưu lựa chọn nhận tin · chưa đặt lịch nhắc tập" [ref=e69]:
                - generic [ref=e70]:
                  - strong [ref=e71]: Tùy chọn thông báo
                  - generic [ref=e72]: Lưu lựa chọn nhận tin · chưa đặt lịch nhắc tập
                - img [ref=e73]
              - button "Nội dung và quyền đang có Bài học miễn phí đang có · khóa trả phí chưa mở" [ref=e75]:
                - generic [ref=e76]:
                  - strong [ref=e77]: Nội dung và quyền đang có
                  - generic [ref=e78]: Bài học miễn phí đang có · khóa trả phí chưa mở
                - img [ref=e79]
              - button "Chia sẻ với giáo viên Chưa kết nối lớp · xem và quản lý lựa chọn chia sẻ" [ref=e81]:
                - generic [ref=e82]:
                  - strong [ref=e83]: Chia sẻ với giáo viên
                  - generic [ref=e84]: Chưa kết nối lớp · xem và quản lý lựa chọn chia sẻ
                - img [ref=e85]
              - button "Xuất hoặc xóa dữ liệu Xem hướng dẫn · chưa tiếp nhận yêu cầu trong ứng dụng" [ref=e87]:
                - generic [ref=e88]:
                  - strong [ref=e89]: Xuất hoặc xóa dữ liệu
                  - generic [ref=e90]: Xem hướng dẫn · chưa tiếp nhận yêu cầu trong ứng dụng
                - img [ref=e91]
            - paragraph [ref=e93]:
              - img [ref=e94]
              - text: Bạn quyết định những gì mình chia sẻ. Mở Quyền riêng tư và đồng ý để xem phạm vi và thay đổi lựa chọn.
        - contentinfo [ref=e96]:
          - navigation "Điều hướng chính" [ref=e97]:
            - button "Hôm nay" [ref=e98]:
              - img [ref=e99]
              - generic [ref=e101]: Hôm nay
            - button "Hành trình" [ref=e102]:
              - img [ref=e103]
              - generic [ref=e105]: Hành trình
            - button "Khám phá" [ref=e106]:
              - img [ref=e107]
              - generic [ref=e109]: Khám phá
            - button "Cá nhân" [ref=e110]:
              - img [ref=e111]
              - generic [ref=e113]: Cá nhân
      - img
      - generic:
        - img
```

# Test source

```ts
  106 |       const b = button.getBoundingClientRect();
  107 |       const footer = button.closest('footer') as HTMLElement;
  108 |       const f = footer.getBoundingClientRect();
  109 |       const style = getComputedStyle(button);
  110 |       return { ring: Number.parseFloat(style.outlineWidth) + Number.parseFloat(style.outlineOffset), scale: f.width / footer.offsetWidth, visible: button.matches(':focus-visible'), left: b.left - f.left, right: f.right - b.right, top: b.top - f.top, bottom: f.bottom - b.bottom };
  111 |     });
  112 |     expect(bounds.visible).toBe(true);
  113 |     expect(bounds.ring).toBeGreaterThanOrEqual(6);
  114 |     for (const side of [bounds.left, bounds.right, bounds.top, bounds.bottom]) expect(side).toBeGreaterThanOrEqual(bounds.ring * bounds.scale - 1);
  115 |   }
  116 | }
  117 | 
  118 | async function lastContentClear(page: Page) {
  119 |   return current(page).locator('.mcy-flow-route-accessibility[data-flow-active="true"] .mobile-scroll').evaluate(scroll => {
  120 |     scroll.scrollTop = scroll.scrollHeight;
  121 |     const last = scroll.querySelector('main')?.lastElementChild;
  122 |     const footer = document.querySelector('.mcy-app-navigation');
  123 |     if (!last || !footer) throw Error('Missing active content or shared navigation');
  124 |     return { lastBottom: last.getBoundingClientRect().bottom, footerTop: footer.getBoundingClientRect().top, scrollTop: scroll.scrollTop };
  125 |   });
  126 | }
  127 | 
  128 | test('BottomNav normal 68 and VI 28 four routes at 320: all text Ranges and focus rings clear footer', async ({ page }) => {
  129 |   await page.setViewportSize({ width: 320, height: 568 });
  130 |   await guest(page);
  131 |   for (const [index, label] of labels.entries()) {
  132 |     await nav(page).getByRole('button', { name: label, exact: true }).click();
  133 |     await settled(page, routes[index]);
  134 |     const normal = await geometry(page);
  135 |     expect(normal.offsetHeight).toBe(68);
  136 |   }
  137 |   await font28(page, 'profile');
  138 |   for (const [index, label] of labels.entries()) {
  139 |     await nav(page).getByRole('button', { name: label, exact: true }).click();
  140 |     await settled(page, routes[index]);
  141 |     const large = await geometry(page, 69);
  142 |     expect(large.buttons.every(button => button.font === '28px')).toBe(true);
  143 |     await assertActualNavTabRings(page);
  144 |     const content = await lastContentClear(page);
  145 |     expect(content.lastBottom).toBeLessThanOrEqual(content.footerTop - 6);
  146 |   }
  147 | });
  148 | 
  149 | test('BottomNav EN 28 labels wrap inside four equal controls at 320 without horizontal overflow', async ({ page }) => {
  150 |   await page.setViewportSize({ width: 320, height: 568 });
  151 |   await guest(page, '?mode=web', true);
  152 |   await font28(page, 'discover');
  153 |   const g = await geometry(page, 69);
  154 |   const widths = g.buttons.map(button => button.rect.right - button.rect.left);
  155 |   expect(Math.max(...widths) - Math.min(...widths)).toBeLessThanOrEqual(1);
  156 |   expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  157 |   await assertActualNavTabRings(page);
  158 | });
  159 | 
  160 | test('BottomNav live font and viewport resize updates measured CSS height and content end', async ({ page }) => {
  161 |   await page.setViewportSize({ width: 390, height: 844 });
  162 |   await guest(page);
  163 |   const normal = await geometry(page);
  164 |   await font28(page, 'discover');
  165 |   const large = await geometry(page, 69);
  166 |   expect(large.offsetHeight).toBeGreaterThan(normal.offsetHeight);
  167 |   await page.setViewportSize({ width: 320, height: 568 });
  168 |   await settled(page, 'discover');
  169 |   await geometry(page, 69);
  170 |   let content = await lastContentClear(page);
  171 |   expect(content.lastBottom).toBeLessThanOrEqual(content.footerTop - 6);
  172 |   await page.setViewportSize({ width: 844, height: 390 });
  173 |   await settled(page, 'discover');
  174 |   await geometry(page, 69);
  175 |   content = await lastContentClear(page);
  176 |   expect(content.lastBottom).toBeLessThanOrEqual(content.footerTop - 6);
  177 | });
  178 | 
  179 | test('BottomNav Profile to edit input and back clears ownership and restores measured clearance', async ({ page }) => {
  180 |   await page.setViewportSize({ width: 1100, height: 1100 });
  181 |   await guest(page, '?mode=review&device=iphone');
  182 |   await nav(page).getByRole('button', { name: 'Cá nhân', exact: true }).click();
  183 |   await settled(page, 'profile');
  184 |   const row = current(page).getByRole('button', { name: /Thông tin cá nhân/ });
  185 |   const retainedScroll = page.locator('.mcy-profile-scroll > .mobile-scroll');
  186 |   const before = await retainedScroll.evaluate(scroll => {
  187 |     scroll.scrollTop = scroll.scrollHeight;
  188 |     return { top: scroll.scrollTop, height: scroll.scrollHeight, last: scroll.querySelector('main')!.lastElementChild!.getBoundingClientRect().bottom };
  189 |   });
  190 |   expect(before.top).toBeGreaterThan(0);
  191 |   // Trigger the existing row handler without scrolling its offscreen DOM node first:
  192 |   // this isolates whether a route transition itself clamps a retained end position.
  193 |   await row.evaluate((button: HTMLButtonElement) => button.click());
  194 |   await expect(nav(page)).toHaveCount(0);
  195 |   expect(await page.locator('.flow-stack').evaluate(stack => stack.style.getPropertyValue('--mcy-app-nav-height'))).toBe('');
  196 |   const during = await retainedScroll.evaluate(scroll => ({ top: scroll.scrollTop, height: scroll.scrollHeight }));
  197 |   expect(during.top).toBeGreaterThanOrEqual(before.top - 2);
  198 |   const input = page.getByLabel('Tên hiển thị', { exact: true });
  199 |   await input.click();
  200 |   await expect(page.getByTestId('keyboard-dock')).toHaveAttribute('data-visible', 'true');
  201 |   await page.getByRole('button', { name: 'Quay lại', exact: true }).click();
  202 |   await expect(nav(page)).toHaveCount(1);
  203 |   await settled(page, 'profile');
  204 |   await expect(page.getByTestId('flow-current')).toHaveCount(1);
  205 |   const after = await retainedScroll.evaluate(scroll => ({ top: scroll.scrollTop, last: scroll.querySelector('main')!.lastElementChild!.getBoundingClientRect().bottom }));
> 206 |   expect(Math.abs(after.top - before.top)).toBeLessThanOrEqual(2);
      |                                            ^ Error: expect(received).toBeLessThanOrEqual(expected)
  207 |   expect(Math.abs(after.last - before.last)).toBeLessThanOrEqual(3);
  208 |   const content = await lastContentClear(page);
  209 |   expect(content.lastBottom).toBeLessThanOrEqual(content.footerTop - 6);
  210 |   await nav(page).getByRole('button', { name: 'Khám phá', exact: true }).click();
  211 |   await page.getByRole('button', { name: /Một chút chuyển động nhẹ/ }).click();
  212 |   await expect(nav(page)).toHaveCount(0);
  213 |   expect(await page.locator('.flow-stack').evaluate(stack => stack.style.getPropertyValue('--mcy-app-nav-height'))).toBe('');
  214 |   await page.getByRole('button', { name: 'Quay lại', exact: true }).click();
  215 |   await expect(nav(page)).toHaveCount(1);
  216 |   await settled(page, 'discover');
  217 |   await geometry(page);
  218 | });
  219 | 
  220 | for (const device of ['iphone', 'pixel-10'] as const) {
  221 |   test(`BottomNav ${device === 'iphone' ? 'iPhone safe area' : 'Pixel reserved navigation'} and fitted simulator scale use layout CSS pixels`, async ({ page }) => {
  222 |     await page.setViewportSize({ width: 390, height: 650 });
  223 |     await guest(page, `?mode=review&device=${device}`);
  224 |     const g = await geometry(page);
  225 |     const sizes = await nav(page).evaluate(footer => {
  226 |       const viewport = document.querySelector<HTMLElement>('.mobile-app-viewport')!;
  227 |       const screen = document.querySelector<HTMLElement>('.device-screen')!;
  228 |       const f = footer.getBoundingClientRect(), v = viewport.getBoundingClientRect(), s = screen.getBoundingClientRect();
  229 |       const scale = s.width / screen.offsetWidth;
  230 |       return { scale, footerScreenHeight: f.height, footerLayoutHeight: (footer as HTMLElement).offsetHeight, gapScreen: v.bottom - f.bottom, bottomCss: Number.parseFloat(getComputedStyle(footer).bottom) };
  231 |     });
  232 |     expect(sizes.scale).toBeLessThan(1);
  233 |     expect(Math.abs(sizes.footerScreenHeight / sizes.scale - sizes.footerLayoutHeight)).toBeLessThanOrEqual(1.5);
  234 |     expect(g.published).toBe(sizes.footerLayoutHeight);
  235 |     expect(Math.abs(sizes.gapScreen / sizes.scale - sizes.bottomCss)).toBeLessThanOrEqual(1.5);
  236 |     if (device === 'iphone') expect(sizes.bottomCss).toBe(34);
  237 |     else expect(sizes.bottomCss).toBe(0);
  238 |     const content = await lastContentClear(page);
  239 |     expect(content.lastBottom).toBeLessThanOrEqual(content.footerTop - 6);
  240 |     await nav(page).getByRole('button', { name: 'Cá nhân', exact: true }).click();
  241 |     await current(page).getByRole('button', { name: /Thông tin cá nhân/ }).click();
  242 |     await expect(nav(page)).toHaveCount(0);
  243 |     await page.getByLabel('Tên hiển thị', { exact: true }).click();
  244 |     await expect(page.getByTestId('keyboard-dock')).toHaveAttribute('data-visible', 'true');
  245 |     await page.getByRole('button', { name: 'Quay lại', exact: true }).click();
  246 |     await expect(nav(page)).toHaveCount(1);
  247 |     await settled(page, 'profile');
  248 |   });
  249 | }
  250 | 
  251 | test('Welcome decoded image and actions remain visible at 320 short landscape and desktop', async ({ page }) => {
  252 |   for (const size of [{ width: 320, height: 568 }, { width: 844, height: 390 }, { width: 1440, height: 900 }]) {
  253 |     await page.setViewportSize(size);
  254 |     await page.goto('/?mode=web');
  255 |     const photo = page.locator('.mcy-welcome-photo');
  256 |     await expect.poll(() => photo.evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0)).toBe(true);
  257 |     await page.evaluate(async () => { await document.fonts.ready; });
  258 |     await expect(photo).toBeInViewport();
  259 |     await expect(page.getByRole('button', { name: 'Thử tìm hiểu như khách', exact: true })).toBeInViewport();
  260 |     expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  261 |   }
  262 | });
  263 | 
```