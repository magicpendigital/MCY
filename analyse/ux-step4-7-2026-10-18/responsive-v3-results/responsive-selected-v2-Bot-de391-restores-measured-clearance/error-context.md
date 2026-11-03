# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: responsive-selected-v2.spec.ts >> BottomNav Profile to edit input and back clears ownership and restores measured clearance
- Location: ..\..\..\.vercel\ux-step4-7-20261018-v2\tests\ux-responsive.spec.ts:168:1

# Error details

```
Error: expect(received).toBeGreaterThanOrEqual(expected)

Expected: >= 917
Received:    851
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
        - generic: 10:51
        - generic:
          - img
      - generic [ref=e13]:
        - banner [ref=e14]:
          - generic [ref=e15]:
            - button "Quay lại" [ref=e16]:
              - img [ref=e17]
            - generic "Hồ sơ của bạn" [ref=e19]: Một chút yoga
        - generic [ref=e20]:
          - main [ref=e26]:
            - generic [ref=e27]: KHÁM PHÁ
            - heading "Bài học yoga miễn phí" [active] [level=1] [ref=e28]
            - paragraph [ref=e29]: Chọn một nhóm video từ kênh Một chút yoga. Mỗi bài được phát trong ứng dụng; bạn tự chọn thứ tự và nhịp tập phù hợp với mình.
            - region "Chọn một nhóm để bắt đầu" [ref=e30]:
              - generic [ref=e31]:
                - generic [ref=e32]:
                  - generic [ref=e33]: TỪ KÊNH MỘT CHÚT YOGA
                  - heading "Chọn một nhóm để bắt đầu" [level=2] [ref=e34]
                - generic [ref=e35]: 38 BÀI HỌC
              - paragraph [ref=e36]: Mở một nhóm để xem danh sách bài, thời lượng và nội dung từng video.
              - generic [ref=e37]:
                - generic [ref=e38]: Cuộn xuống để xem ghi chú và cách chọn bài
                - img [ref=e39]
              - generic [ref=e41]:
                - button "18 Một chút chuyển động nhẹ 18 bài học · Miễn phí Xem danh sách bài" [ref=e42]:
                  - generic [ref=e43]: "18"
                  - generic [ref=e44]:
                    - strong [ref=e45]: Một chút chuyển động nhẹ
                    - generic [ref=e46]: 18 bài học · Miễn phí
                    - emphasis [ref=e47]: Xem danh sách bài
                  - img [ref=e48]
                - button "13 Làm quen với các tư thế yoga 13 bài học · Miễn phí Xem danh sách bài" [ref=e50]:
                  - generic [ref=e51]: "13"
                  - generic [ref=e52]:
                    - strong [ref=e53]: Làm quen với các tư thế yoga
                    - generic [ref=e54]: 13 bài học · Miễn phí
                    - emphasis [ref=e55]: Xem danh sách bài
                  - img [ref=e56]
                - button "07 Chuỗi tư thế cơ bản 7 bài học · Miễn phí Xem danh sách bài" [ref=e58]:
                  - generic [ref=e59]: "07"
                  - generic [ref=e60]:
                    - strong [ref=e61]: Chuỗi tư thế cơ bản
                    - generic [ref=e62]: 7 bài học · Miễn phí
                    - emphasis [ref=e63]: Xem danh sách bài
                  - img [ref=e64]
              - paragraph [ref=e66]:
                - img [ref=e67]
                - text: Video chỉ kết nối với YouTube khi bạn nhấn Phát. Việc phát trong ứng dụng vẫn tuân theo chính sách quyền riêng tư của Google.
            - button "Cách chọn bài học video Duyệt bài miễn phí và ghi lại cảm nhận" [ref=e69]:
              - generic [ref=e70]:
                - strong [ref=e71]: Cách chọn bài học video
                - generic [ref=e72]: Duyệt bài miễn phí và ghi lại cảm nhận
              - img [ref=e73]
          - generic:
            - generic:
              - generic:
                - generic:
                  - generic:
                    - main:
                      - generic:
                        - generic: CÁ NHÂN · KHÁCH
                        - heading [level=1]: Lựa chọn của bạn.
                        - paragraph: Tài khoản là tùy chọn. Bạn vẫn có thể xem và thực hành như khách.
                      - region:
                        - heading [level=2]: Hồ sơ và dữ liệu
                        - button:
                          - generic:
                            - strong: Thông tin cá nhân
                            - generic: Tên tùy chọn · ngôn ngữ · hình minh họa
                          - img
                        - button:
                          - generic:
                            - strong: Quyền riêng tư và đồng ý
                            - generic: Xem từng mục đích · thay đổi hoặc rút đồng ý
                          - img
                        - button:
                          - generic:
                            - strong: AI và điều được nhớ
                            - generic: Chưa có thông tin được nhớ
                          - img
                      - generic:
                        - generic: TÀI KHOẢN
                        - paragraph: Đăng nhập để lưu hồ sơ, lựa chọn quyền và check-in có đồng ý.
                        - button: Tạo tài khoản hoặc đăng nhập
                      - region:
                        - heading [level=2]: Tài khoản và hướng dẫn
                        - button:
                          - generic:
                            - strong: Bảo mật tài khoản
                            - generic: Email và đăng nhập bằng tài khoản khác
                          - img
                        - button:
                          - generic:
                            - strong: Hướng dẫn và liên hệ
                            - generic: Đọc hướng dẫn · chưa gửi yêu cầu trong ứng dụng
                          - img
                      - region:
                        - heading [level=2]: Tính năng và trạng thái hiện có
                        - paragraph: Xem lựa chọn đang có và những phần chưa mở.
                        - button:
                          - generic:
                            - strong: Tùy chọn thông báo
                            - generic: Lưu lựa chọn nhận tin · chưa đặt lịch nhắc tập
                          - img
                        - button:
                          - generic:
                            - strong: Nội dung và quyền đang có
                            - generic: Bài học miễn phí đang có · khóa trả phí chưa mở
                          - img
                        - button:
                          - generic:
                            - strong: Chia sẻ với giáo viên
                            - generic: Chưa kết nối lớp · xem và quản lý lựa chọn chia sẻ
                          - img
                        - button:
                          - generic:
                            - strong: Xuất hoặc xóa dữ liệu
                            - generic: Xem hướng dẫn · chưa tiếp nhận yêu cầu trong ứng dụng
                          - img
                      - paragraph:
                        - img
                        - text: Bạn quyết định những gì mình chia sẻ. Mở Quyền riêng tư và đồng ý để xem phạm vi và thay đổi lựa chọn.
          - main [ref=e80]:
            - generic [ref=e81]: HỒ SƠ
            - heading "Thông tin tối thiểu, do bạn sửa." [level=1] [ref=e82]
            - paragraph [ref=e83]: Tên tùy chọn, cài đặt hiển thị và các trường chỉ hỏi khi thật sự cần.
            - generic [ref=e84]:
              - text: Tên hiển thị
              - textbox "Tên hiển thị" [ref=e85]:
                - /placeholder: Tên gọi trong ứng dụng
            - generic [ref=e86]:
              - strong [ref=e87]: Ngôn ngữ
              - generic [ref=e88]:
                - button "Tiếng Việt" [pressed] [ref=e89]
                - button "English · đang hoàn thiện" [ref=e90]
              - generic [ref=e91]: Tiếng Anh hiện đang được hoàn thiện. Chào mừng, luồng tập chính và Hành trình đã có bản dịch; tài khoản, đồng ý, hỗ trợ và nội dung kiến thức vẫn dùng tiếng Việt.
              - paragraph [ref=e92]: "Múi giờ thiết bị: Asia/Bangkok"
            - generic [ref=e93]:
              - strong [ref=e94]: Hình body map
              - button "Đổi hình minh họa" [ref=e95]:
                - text: Đổi hình minh họa
                - img [ref=e96]
            - button "Lưu thay đổi" [ref=e98]:
              - text: Lưu thay đổi
              - img [ref=e99]
            - button "Hủy" [ref=e101]
            - paragraph [ref=e102]:
              - img [ref=e103]
              - text: Hồ sơ và lựa chọn quyền được đồng bộ khi dịch vụ đã kết nối. Nếu một tính năng chưa sẵn sàng, ứng dụng sẽ thông báo rõ trước khi bạn sử dụng.
      - img
      - generic:
        - img
```

# Test source

```ts
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
  108 |   return current(page).locator('.mobile-scroll').evaluate(scroll => {
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
> 186 |   expect(during.top).toBeGreaterThanOrEqual(before.top - 2);
      |                      ^ Error: expect(received).toBeGreaterThanOrEqual(expected)
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
  209 | for (const device of ['iphone', 'pixel-10'] as const) {
  210 |   test(`BottomNav ${device === 'iphone' ? 'iPhone safe area' : 'Pixel reserved navigation'} and fitted simulator scale use layout CSS pixels`, async ({ page }) => {
  211 |     await page.setViewportSize({ width: 390, height: 650 });
  212 |     await guest(page, `?mode=review&device=${device}`);
  213 |     const g = await geometry(page);
  214 |     const sizes = await nav(page).evaluate(footer => {
  215 |       const viewport = document.querySelector<HTMLElement>('.mobile-app-viewport')!;
  216 |       const screen = document.querySelector<HTMLElement>('.device-screen')!;
  217 |       const f = footer.getBoundingClientRect(), v = viewport.getBoundingClientRect(), s = screen.getBoundingClientRect();
  218 |       const scale = s.width / screen.offsetWidth;
  219 |       return { scale, footerScreenHeight: f.height, footerLayoutHeight: (footer as HTMLElement).offsetHeight, gapScreen: v.bottom - f.bottom, bottomCss: Number.parseFloat(getComputedStyle(footer).bottom) };
  220 |     });
  221 |     expect(sizes.scale).toBeLessThan(1);
  222 |     expect(Math.abs(sizes.footerScreenHeight / sizes.scale - sizes.footerLayoutHeight)).toBeLessThanOrEqual(1.5);
  223 |     expect(g.published).toBe(sizes.footerLayoutHeight);
  224 |     expect(Math.abs(sizes.gapScreen / sizes.scale - sizes.bottomCss)).toBeLessThanOrEqual(1.5);
  225 |     if (device === 'iphone') expect(sizes.bottomCss).toBe(34);
  226 |     else expect(sizes.bottomCss).toBe(0);
  227 |     const content = await lastContentClear(page);
  228 |     expect(content.lastBottom).toBeLessThanOrEqual(content.footerTop - 6);
  229 |     await nav(page).getByRole('button', { name: 'Cá nhân', exact: true }).click();
  230 |     await current(page).getByRole('button', { name: /Thông tin cá nhân/ }).click();
  231 |     await expect(nav(page)).toHaveCount(0);
  232 |     await page.getByLabel('Tên hiển thị', { exact: true }).click();
  233 |     await expect(page.getByTestId('keyboard-dock')).toHaveAttribute('data-visible', 'true');
  234 |     await page.getByRole('button', { name: 'Quay lại', exact: true }).click();
  235 |     await expect(nav(page)).toHaveCount(1);
  236 |     await settled(page);
  237 |   });
  238 | }
  239 | 
  240 | test('Welcome decoded image and actions remain visible at 320 short landscape and desktop', async ({ page }) => {
  241 |   for (const size of [{ width: 320, height: 568 }, { width: 844, height: 390 }, { width: 1440, height: 900 }]) {
  242 |     await page.setViewportSize(size);
  243 |     await page.goto('/?mode=web');
  244 |     const photo = page.locator('.mcy-welcome-photo');
  245 |     await expect.poll(() => photo.evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0)).toBe(true);
  246 |     await page.evaluate(async () => { await document.fonts.ready; });
  247 |     await expect(photo).toBeInViewport();
  248 |     await expect(page.getByRole('button', { name: 'Thử tìm hiểu như khách', exact: true })).toBeInViewport();
  249 |     expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  250 |   }
  251 | });
  252 | 
```