# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: ux-course-detail.spec.ts >> Course decision, disclosures and explicit player reveal 390
- Location: ..\..\..\.vercel\ux-step4-6-20261018\tests\ux-course-detail.spec.ts:21:305

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 1
Received: 0

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
      - generic "Khóa học miễn phí" [ref=e12]: Một chút yoga
  - generic [ref=e13]:
    - generic:
      - generic:
        - generic:
          - generic:
            - generic:
              - main:
                - generic: KHÁM PHÁ
                - heading [level=1]: Bài học yoga miễn phí
                - paragraph: Chọn một nhóm video từ kênh Một chút yoga. Mỗi bài được phát trong ứng dụng; bạn tự chọn thứ tự và nhịp tập phù hợp với mình.
                - region:
                  - generic:
                    - generic:
                      - generic: TỪ KÊNH MỘT CHÚT YOGA
                      - heading [level=2]: Chọn một nhóm để bắt đầu
                    - generic: 38 BÀI HỌC
                  - paragraph: Mở một nhóm để xem danh sách bài, thời lượng và nội dung từng video.
                  - generic:
                    - generic: Cuộn xuống để xem ghi chú và cách chọn bài
                    - img
                  - generic:
                    - button:
                      - generic: "18"
                      - generic:
                        - strong: Một chút chuyển động nhẹ
                        - generic: 18 bài học · Miễn phí
                        - emphasis: Xem danh sách bài
                      - img
                    - button:
                      - generic: "13"
                      - generic:
                        - strong: Làm quen với các tư thế yoga
                        - generic: 13 bài học · Miễn phí
                        - emphasis: Xem danh sách bài
                      - img
                    - button:
                      - generic: "07"
                      - generic:
                        - strong: Chuỗi tư thế cơ bản
                        - generic: 7 bài học · Miễn phí
                        - emphasis: Xem danh sách bài
                      - img
                  - paragraph:
                    - img
                    - text: Video chỉ kết nối với YouTube khi bạn nhấn Phát. Việc phát trong ứng dụng vẫn tuân theo chính sách quyền riêng tư của Google.
                - button:
                  - generic:
                    - strong: Cách chọn bài học video
                    - generic: Duyệt bài miễn phí và ghi lại cảm nhận
                  - img
    - main [ref=e19]:
      - generic [ref=e20]: VIDEO MIỄN PHÍ · YOUTUBE
      - heading "Một chút chuyển động nhẹ" [level=1] [ref=e21]
      - generic [ref=e22]:
        - generic [ref=e23]: 18 bài học
        - generic [ref=e24]: Miễn phí
        - generic [ref=e25]: Kênh · Một chút yoga
      - group [ref=e26]:
        - generic "Về nhóm video này" [ref=e27]
      - paragraph [ref=e28]:
        - img [ref=e29]
        - text: Video và danh sách bài ở bên dưới
      - region "Bài học đang chọn" [ref=e31]:
        - generic [ref=e32]:
          - generic [ref=e33]:
            - text: VIDEO · 0:43
            - generic [ref=e34]: · Đang chọn bài 1 / 18
          - heading "01 · Thư giãn nhẹ" [level=2] [ref=e35]
          - paragraph [ref=e36]: Bạn tự chọn biên độ phù hợp và dừng lại nếu thấy đau tăng hoặc không an toàn.
          - group [ref=e37]:
            - generic "Phụ đề chưa xác minh · lưu ý video +" [ref=e38]:
              - img [ref=e39]
              - text: Phụ đề chưa xác minh · lưu ý video +
          - note [ref=e41]:
            - img [ref=e42]
            - generic [ref=e44]:
              - text: Nhấn Phát sẽ tải trình phát YouTube trong ứng dụng; việc xử lý dữ liệu tuân theo chính sách quyền riêng tư của Google.
              - link "Chính sách quyền riêng tư của Google" [ref=e45]:
                - /url: https://policies.google.com/privacy?hl=vi
          - generic [ref=e46]:
            - img [ref=e47]
            - text: Trình phát đã mở bên dưới
        - group "01 · Thư giãn nhẹ" [active] [ref=e49]:
          - iframe [ref=e50]:
            - generic [ref=f1e3]: This content is blocked. Contact the site owner to fix the issue.
        - generic [ref=e51]:
          - status [ref=e52]: Trình phát YouTube đã mở trong ứng dụng. MCY không theo dõi tiến độ xem; nếu video không phát, hãy mở trợ giúp.
          - button "Video gặp sự cố khi phát?" [ref=e54]:
            - img [ref=e55]
            - text: Video gặp sự cố khi phát?
          - navigation "Điều hướng video trong danh sách này" [ref=e57]:
            - generic [ref=e58]: Đang chọn bài 1 / 18
            - button "Video trước" [disabled] [ref=e59]:
              - img [ref=e60]
              - text: Video trước
            - button "Video tiếp theo" [ref=e62]:
              - text: Video tiếp theo
              - img [ref=e63]
      - generic [ref=e65]:
        - paragraph [ref=e66]: MCY không nhận được trạng thái xem hết video. Sau khi tự thực hành, bạn có thể chủ động ghi lại cảm nhận.
        - button "Tôi đã thực hành · ghi cảm nhận" [ref=e67]:
          - text: Tôi đã thực hành · ghi cảm nhận
          - img [ref=e68]
      - region "Các bài học" [ref=e70]:
        - generic [ref=e71]:
          - heading "Các bài học" [level=2] [ref=e72]
          - generic [ref=e73]: 18 bài
        - generic [ref=e74]:
          - button "01 · 0:43 01 · Thư giãn nhẹ" [pressed] [ref=e75]:
            - img [ref=e77]
            - generic [ref=e79]:
              - generic [ref=e80]: 01 · 0:43
              - strong [ref=e81]: 01 · Thư giãn nhẹ
            - img [ref=e83]
          - button "02 · 1:04 02 · Kéo giãn gân kheo nhẹ" [ref=e85]:
            - img [ref=e87]
            - generic [ref=e89]:
              - generic [ref=e90]: 02 · 1:04
              - strong [ref=e91]: 02 · Kéo giãn gân kheo nhẹ
            - img [ref=e93]
          - button "03 · 0:53 03 · Chuyển động toàn thân" [ref=e95]:
            - img [ref=e97]
            - generic [ref=e99]:
              - generic [ref=e100]: 03 · 0:53
              - strong [ref=e101]: 03 · Chuyển động toàn thân
            - img [ref=e103]
          - button "04 · 0:36 04 · Chuyển động lưng dưới" [ref=e105]:
            - img [ref=e107]
            - generic [ref=e109]:
              - generic [ref=e110]: 04 · 0:36
              - strong [ref=e111]: 04 · Chuyển động lưng dưới
            - img [ref=e113]
          - button "05 · 1:00 05 · Chuyển động lưng dưới · bài ngắn" [ref=e115]:
            - img [ref=e117]
            - generic [ref=e119]:
              - generic [ref=e120]: 05 · 1:00
              - strong [ref=e121]: 05 · Chuyển động lưng dưới · bài ngắn
            - img [ref=e123]
          - button "06 · 0:17 06 · Chuyển động cổ và lưng trên" [ref=e125]:
            - img [ref=e127]
            - generic [ref=e129]:
              - generic [ref=e130]: 06 · 0:17
              - strong [ref=e131]: 06 · Chuyển động cổ và lưng trên
            - img [ref=e133]
          - button "07 · 0:20 07 · Chuyển động cổ và lưng trên · bài ngắn" [ref=e135]:
            - img [ref=e137]
            - generic [ref=e139]:
              - generic [ref=e140]: 07 · 0:20
              - strong [ref=e141]: 07 · Chuyển động cổ và lưng trên · bài ngắn
            - img [ref=e143]
          - button "08 · 0:37 08 · Nhón gót đứng · bài thực hành chân" [ref=e145]:
            - img [ref=e147]
            - generic [ref=e149]:
              - generic [ref=e150]: 08 · 0:37
              - strong [ref=e151]: 08 · Nhón gót đứng · bài thực hành chân
            - img [ref=e153]
          - button "09 · 0:45 09 · Giãn cơ nhẹ" [ref=e155]:
            - img [ref=e157]
            - generic [ref=e159]:
              - generic [ref=e160]: 09 · 0:45
              - strong [ref=e161]: 09 · Giãn cơ nhẹ
            - img [ref=e163]
          - button "10 · 0:34 10 · Chuyển động nhẹ toàn thân" [ref=e165]:
            - img [ref=e167]
            - generic [ref=e169]:
              - generic [ref=e170]: 10 · 0:34
              - strong [ref=e171]: 10 · Chuyển động nhẹ toàn thân
            - img [ref=e173]
          - button "11 · 0:22 11 · Chuyển động vùng cổ" [ref=e175]:
            - img [ref=e177]
            - generic [ref=e179]:
              - generic [ref=e180]: 11 · 0:22
              - strong [ref=e181]: 11 · Chuyển động vùng cổ
            - img [ref=e183]
          - button "12 · 0:25 12 · Chuyển động hông và chân" [ref=e185]:
            - img [ref=e187]
            - generic [ref=e189]:
              - generic [ref=e190]: 12 · 0:25
              - strong [ref=e191]: 12 · Chuyển động hông và chân
            - img [ref=e193]
          - button "13 · 0:30 13 · Chuyển động nhẹ toàn thân" [ref=e195]:
            - img [ref=e197]
            - generic [ref=e199]:
              - generic [ref=e200]: 13 · 0:30
              - strong [ref=e201]: 13 · Chuyển động nhẹ toàn thân
            - img [ref=e203]
          - button "14 · 0:58 14 · Mở vai khi nằm nghiêng" [ref=e205]:
            - img [ref=e207]
            - generic [ref=e209]:
              - generic [ref=e210]: 14 · 0:58
              - strong [ref=e211]: 14 · Mở vai khi nằm nghiêng
            - img [ref=e213]
          - button "15 · 0:50 15 · Chuyển động cột sống" [ref=e215]:
            - img [ref=e217]
            - generic [ref=e219]:
              - generic [ref=e220]: 15 · 0:50
              - strong [ref=e221]: 15 · Chuyển động cột sống
            - img [ref=e223]
          - button "16 · 0:28 16 · Lăn lưng với vòng" [ref=e225]:
            - img [ref=e227]
            - generic [ref=e229]:
              - generic [ref=e230]: 16 · 0:28
              - strong [ref=e231]: 16 · Lăn lưng với vòng
            - img [ref=e233]
          - button "17 · 0:23 17 · Chuyển động nhẹ · bài 17" [ref=e235]:
            - img [ref=e237]
            - generic [ref=e239]:
              - generic [ref=e240]: 17 · 0:23
              - strong [ref=e241]: 17 · Chuyển động nhẹ · bài 17
            - img [ref=e243]
          - button "18 · 0:27 18 · Chuyển động nhẹ · bài 18" [ref=e245]:
            - img [ref=e247]
            - generic [ref=e249]:
              - generic [ref=e250]: 18 · 0:27
              - strong [ref=e251]: 18 · Chuyển động nhẹ · bài 18
            - img [ref=e253]
```

# Test source

```ts
  1  | import {test,expect,type Page} from '@playwright/test';
  2  | const active=(p:Page)=>p.locator('[data-flow-route="course-detail"][data-flow-active="true"]').last();
  3  | async function enter(p:Page,query='?mode=web',english=false){
  4  |  await p.route('**/*',r=>new URL(r.request().url()).hostname==='127.0.0.1'?r.fallback():r.abort());
  5  |  await p.goto('/'+query);if(english)await p.locator('.mcy-language-toggle').click();
  6  |  await p.getByRole('button',{name:english?'Explore as a guest':'Thử tìm hiểu như khách',exact:true}).click();
  7  |  await p.getByRole('button',{name:english?'Next: energy and time':'Tiếp: năng lượng và thời gian',exact:true}).click();
  8  |  await p.getByRole('button',{name:english?'Browse free video lessons':'Tự chọn bài học video miễn phí',exact:true}).click();
  9  |  await p.getByRole('button',{name:/Một chút chuyển động nhẹ/}).click();
  10 |  await expect(active(p).locator('h1')).toHaveText('Một chút chuyển động nhẹ');
  11 |  await expect.poll(()=>active(p).evaluate(e=>Math.round(e.getBoundingClientRect().left-e.parentElement!.getBoundingClientRect().left))).toBe(0);
  12 | }
  13 | async function tabTo(p:Page,selector:string,max=50){
  14 |  for(let i=0;i<max;i++){await p.keyboard.press('Tab');if(await p.evaluate(s=>document.activeElement?.matches(s),selector))return;}
  15 |  throw Error('Tab did not reach '+selector);
  16 | }
  17 | async function focusClearOfHeader(p:Page){
  18 |  const b=await p.evaluate(()=>{const r=document.activeElement!.getBoundingClientRect(),h=document.querySelector('.flow-fixed-header')!.getBoundingClientRect();return{top:r.top,bottom:r.bottom,header:h.bottom,height:innerHeight};});
  19 |  expect(b.top).toBeGreaterThanOrEqual(b.header-1);expect(b.bottom).toBeLessThanOrEqual(b.height+1);
  20 | }
  21 | for(const [label,width,height,query] of [['320',320,568,'?mode=web'],['360',360,640,'?mode=web'],['390',390,844,'?mode=web'],['landscape',844,390,'?mode=web'],['desktop',1440,1000,'?mode=web'],['iphone',1100,1100,'?mode=review&device=iphone'],['pixel',1100,1100,'?mode=review&device=pixel-10']] as const)test('Course decision, disclosures and explicit player reveal '+label,async({page})=>{
  22 |  await page.setViewportSize({width,height});await page.emulateMedia({reducedMotion:'reduce'});await enter(page,query);const root=active(page);
  23 |  await expect(root.locator('.mcy-eyebrow')).toHaveText('VIDEO MIỄN PHÍ · YOUTUBE');
  24 |  await expect(root.locator('.mcy-course-featured-copy h2')).toHaveText('01 · Thư giãn nhẹ');
  25 |  await expect(root.locator('.mcy-course-featured-copy > .mcy-course-lesson-number')).toContainText('VIDEO · 0:43');
  26 |  await expect(root.locator('.mcy-course-lesson-description')).toHaveText('Bạn tự chọn biên độ phù hợp và dừng lại nếu thấy đau tăng hoặc không an toàn.');
  27 |  await expect(root.locator('.mcy-course-caption-note')).toContainText('Phụ đề chưa xác minh');
  28 |  await expect(root.locator('.mcy-course-video-notes')).not.toHaveAttribute('open','');
  29 |  await expect(root.locator('.mcy-course-source-note a')).toHaveAttribute('href','https://policies.google.com/privacy?hl=vi');
  30 |  const geometry=await root.evaluate(r=>{const b=(s:string)=>r.querySelector(s)!.getBoundingClientRect();return{title:b('.mcy-course-featured-copy h2').bottom,source:b('.mcy-course-source-note').bottom,play:b('.mcy-course-play').top,playBottom:b('.mcy-course-play').bottom,scrollWidth:(r.querySelector('.mobile-scroll') as HTMLElement).scrollWidth,clientWidth:(r.querySelector('.mobile-scroll') as HTMLElement).clientWidth};});
  31 |  expect(geometry.play).toBeGreaterThan(geometry.title);expect(geometry.source).toBeLessThanOrEqual(geometry.play);expect(geometry.play-geometry.title).toBeLessThan(280);
  32 |  expect(geometry.scrollWidth).toBeLessThanOrEqual(geometry.clientWidth);if(label==='320'||label==='360'||label==='390')expect(geometry.playBottom).toBeLessThanOrEqual(height);
  33 |  await expect(page.locator('iframe')).toHaveCount(0);
  34 |  await page.screenshot({path:`analyse/ux-step4-4-2026-10-17/final-${label}.png`,animations:'disabled'});
  35 |  let embeds=0;await page.route('https://www.youtube-nocookie.com/embed/**',r=>{embeds++;return r.fulfill({contentType:'text/html',body:'<!doctype html><title>Fixture player</title>'});});
  36 |  const before=await root.locator('.mcy-course-video').boundingBox();
> 37 |  await root.locator('.mcy-course-play').click();await expect(page.locator('iframe')).toHaveCount(1);await expect.poll(()=>embeds).toBe(1);
     |                                                                                                                                   ^ Error: expect(received).toBe(expected) // Object.is equality
  38 |  const after=await root.locator('.mcy-course-video').boundingBox(),scroll=await root.locator('.mobile-scroll').boundingBox();
  39 |  expect(after!.width/after!.height).toBeCloseTo(9/16,2);expect(after!.width).toBeCloseTo(before!.width,0);expect(after!.height).toBeCloseTo(before!.height,0);
  40 |  expect(after!.y).toBeGreaterThanOrEqual(scroll!.y-1);expect(after!.y).toBeLessThan(scroll!.y+25);
  41 |  expect(Math.min(after!.y+after!.height,scroll!.y+scroll!.height)-after!.y).toBeGreaterThan(Math.min(after!.height,scroll!.height)*.85);
  42 |  await expect(root.locator('.mcy-course-reflection-prompt')).toContainText('Sau khi tự thực hành');
  43 |  await page.screenshot({path:`analyse/ux-step4-4-2026-10-17/playing-${label}.png`,animations:'disabled'});
  44 | });
  45 | for(const english of [false,true])test('Course actual Tab disclosure, Play and recovery continuation '+english,async({page})=>{
  46 |  await page.setViewportSize({width:320,height:568});await enter(page,'?mode=web',english);
  47 |  await tabTo(page,'.mcy-course-context > summary');await page.keyboard.press('Enter');await expect(active(page).locator('.mcy-course-context .mcy-lead')).toBeVisible();
  48 |  await page.keyboard.press('Enter');await tabTo(page,'.mcy-course-video-notes > summary');await focusClearOfHeader(page);await page.keyboard.press('Enter');
  49 |  await expect(active(page).locator('.mcy-course-caption-detail')).toBeVisible();await expect(active(page).locator('.mcy-course-caption-detail')).toContainText(english?'auto-captions, if available, may be inaccurate':'phụ đề tự động (nếu có) có thể chưa chính xác');
  50 |  await page.keyboard.press('Enter');await tabTo(page,'.mcy-course-source-note a');await focusClearOfHeader(page);await tabTo(page,'.mcy-course-play');await focusClearOfHeader(page);
  51 |  await page.route('https://www.youtube-nocookie.com/embed/**',r=>r.fulfill({contentType:'text/html',body:'<!doctype html><title>Fixture player</title>'}));await page.keyboard.press('Enter');
  52 |  await expect(page.locator('iframe')).toHaveCount(1);await expect(active(page).getByTestId('course-video')).toBeFocused();await expect(active(page).getByTestId('course-player-status')).toHaveAttribute('data-state','frame-loaded');await tabTo(page,'.mcy-course-player-help-trigger',8);await focusClearOfHeader(page);await page.keyboard.press('Enter');
  53 |  await expect(active(page).locator('.mcy-course-player-help')).toBeVisible();await tabTo(page,'.mcy-course-player-help button',4);await focusClearOfHeader(page);
  54 |  await page.keyboard.press('Enter');await expect(active(page).locator('iframe')).toHaveAttribute('data-load-attempt','1');await expect(active(page).getByTestId('course-player-status')).toHaveAttribute('data-state','frame-loaded');
  55 |  await tabTo(page,'.mcy-course-lesson-navigation button:not(:disabled)',8);await focusClearOfHeader(page);
  56 |  await tabTo(page,'.mcy-course-reflection-prompt button',8);await focusClearOfHeader(page);await expect(active(page)).toBeVisible();
  57 | });
  58 | for(const english of [false,true])test('Course true 2x text reflows and keyboard reaches Play '+english,async({page})=>{
  59 |  await page.setViewportSize({width:320,height:568});await enter(page,'?mode=web',english);
  60 |  await page.addStyleTag({content:'.mcy-course-detail-page :is(p,span,button,a,summary,small,strong){font-size:28px!important;line-height:1.5!important}'});
  61 |  expect(await active(page).locator('.mcy-course-source-note').evaluate(e=>parseFloat(getComputedStyle(e).fontSize))).toBe(28);
  62 |  await tabTo(page,'.mcy-course-video-notes > summary');await page.keyboard.press('Enter');await expect(active(page).locator('.mcy-course-caption-detail')).toBeVisible();
  63 |  const size=await active(page).locator('.mobile-scroll').evaluate(e=>({client:e.clientWidth,scroll:e.scrollWidth}));expect(size.scroll).toBeLessThanOrEqual(size.client);
  64 |  await page.keyboard.press('Enter');await tabTo(page,'.mcy-course-play');await focusClearOfHeader(page);
  65 |  await page.screenshot({path:`analyse/ux-step4-4-2026-10-17/text28-${english}.png`,animations:'disabled'});
  66 | });
  67 | test('Course manual first/last selection and route return never auto-play or write',async({page})=>{
  68 |  const writes:string[]=[];page.on('request',r=>{if(new URL(r.url()).hostname==='mcy-playwright.invalid'&&!['GET','HEAD','OPTIONS'].includes(r.method()))writes.push(r.method()+' '+new URL(r.url()).pathname);});
  69 |  await page.setViewportSize({width:390,height:844});await enter(page);const root=active(page);let embeds=0;await page.route('https://www.youtube-nocookie.com/embed/**',r=>{embeds++;return r.fulfill({contentType:'text/html',body:'<!doctype html><title>Fixture player</title>'});});
  70 |  for(const title of ['Một chút chuyển động nhẹ','Làm quen với các tư thế yoga','Chuỗi tư thế cơ bản']){
  71 |   if(title!=='Một chút chuyển động nhẹ'){await page.getByRole('button',{name:'Quay lại',exact:true}).click();await page.locator('.mcy-course-card').filter({hasText:title}).click();}
  72 |   const lessons=root.locator('.mcy-course-lesson'),count=await lessons.count(),navigation=root.getByTestId('course-lesson-navigation');
  73 |   await expect(navigation.getByRole('button',{name:'Video trước',exact:true})).toBeDisabled();await lessons.last().click();
  74 |   await expect(navigation.getByRole('button',{name:'Video tiếp theo',exact:true})).toBeDisabled();await expect(lessons.last()).toHaveAttribute('aria-pressed','true');
  75 |   await expect(page.locator('iframe')).toHaveCount(0);expect(embeds).toBe(0);await expect(root.locator('.mcy-course-selected-position')).toContainText(`${count} / ${count}`);
  76 |   const scroll=root.locator('.mobile-scroll');expect(await scroll.evaluate(e=>e.scrollTop)).toBeGreaterThan(100);
  77 |   await lessons.first().click();await expect(page.locator('iframe')).toHaveCount(0);await expect(root.locator('.mcy-course-selected-position')).toContainText(`1 / ${count}`);
  78 |  }
  79 |  await root.locator('.mcy-course-play').click();await expect.poll(()=>embeds).toBe(1);await root.locator('.mcy-course-lesson').last().click();await expect(page.locator('iframe')).toHaveCount(0);expect(embeds).toBe(1);
  80 |  await page.getByRole('button',{name:'Quay lại',exact:true}).click();await page.locator('.mcy-course-card').filter({hasText:'Chuỗi tư thế cơ bản'}).click();await expect(page.locator('iframe')).toHaveCount(0);expect(embeds).toBe(1);expect(writes).toEqual([]);
  81 |  await expect(root.locator('.mcy-course-reflection-prompt')).toHaveCount(0);
  82 | });
  83 | test('Course landscape source keeps 16:9 footprint before and after explicit Play',async({page})=>{
  84 |  await page.route('**/src/courses/freeCourses.ts',async route=>{const response=await route.fetch();const body=(await response.text()).replace('orientation = "portrait"','orientation = "landscape"');expect(body).not.toBe(await response.text());await route.fulfill({response,body});});
  85 |  // Register the source fixture after enter's network guard via fallback chaining.
  86 |  await enter(page);const root=active(page);await page.route('https://www.youtube-nocookie.com/embed/**',r=>r.fulfill({contentType:'text/html',body:'<!doctype html><title>Fixture player</title>'}));
  87 |  const before=await root.locator('.mcy-course-video').boundingBox();expect(before!.width/before!.height).toBeCloseTo(16/9,2);await root.locator('.mcy-course-play').click();const after=await root.locator('.mcy-course-video').boundingBox();expect(after!.width).toBeCloseTo(before!.width,0);expect(after!.height).toBeCloseTo(before!.height,0);
  88 | });
  89 | for(const viCaptions of [false,true])test('Course verified caption metadata stays distinct '+viCaptions,async({page})=>{
  90 |  await page.route('**/src/courses/freeCourses.ts',async route=>{const response=await route.fetch(),original=await response.text(),body=original.replace('channelCaptionsVerified: false','channelCaptionsVerified: true').replace('channelCaptionLanguages: []',viCaptions?'channelCaptionLanguages: ["vi"]':'channelCaptionLanguages: ["en"]');expect(body).not.toBe(original);await route.fulfill({response,body});});
  91 |  await enter(page);const root=active(page);await expect(root.locator('.mcy-course-caption-note')).toHaveText(viCaptions?'Lưu ý video và phụ đề':'Chưa liệt kê phụ đề tiếng Việt · lưu ý video');
  92 |  await root.locator('.mcy-course-caption-note').click();if(viCaptions)await expect(root.locator('.mcy-course-caption-detail')).toHaveCount(0);else await expect(root.locator('.mcy-course-caption-detail')).toContainText('Kênh chưa liệt kê phụ đề tiếng Việt cho bài này');await expect(page.locator('iframe')).toHaveCount(0);
  93 | });
  94 | 
```