# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: ux-checkin-layout.spec.ts >> Visual hierarchy and optional map 320
- Location: .vercel\ux-step4-2-visual-20261016\tests\ux-checkin-layout.spec.ts:4:301

# Error details

```
Error: expect(received).toBeLessThanOrEqual(expected)

Expected: <= 392
Received:    394.1875
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
    - main [ref=e19]:
      - generic [ref=e20]:
        - text: Bước 1 / 2
        - generic [ref=e21]: Cảm nhận cơ thể
      - heading "Cơ thể bạn hôm nay." [active] [level=1] [ref=e22]
      - paragraph [ref=e23]: Một chút để lắng nghe cảm nhận.
      - generic "Cảm nhận cơ thể lúc này" [ref=e24]:
        - button "Ghi nhận từng vùng cơ thể Chọn vùng, ghi lại cảm nhận riêng. Mở bản đồ cơ thể" [ref=e25]:
          - generic [ref=e27]:
            - strong [ref=e28]: Ghi nhận từng vùng cơ thể
            - generic [ref=e29]: Chọn vùng, ghi lại cảm nhận riêng.
            - generic [ref=e30]:
              - text: Mở bản đồ cơ thể
              - img [ref=e31]
        - generic [ref=e33]:
          - button "Không thấy khó chịu" [ref=e34]
          - button "Chưa xác định" [ref=e35]
      - generic [ref=e36]:
        - img [ref=e37]
        - text: Bạn chỉ cần chia sẻ điều mình thấy. Đây không phải đánh giá sức khỏe.
  - contentinfo [ref=e39]:
    - generic [ref=e40]:
      - generic "Bước 1 / 2" [ref=e41]:
        - generic [ref=e42]:
          - strong [ref=e43]: Bước 1 / 2
          - generic [ref=e44]: Cảm nhận cơ thể
      - 'button "Tiếp: năng lượng và thời gian" [ref=e48]':
        - text: "Tiếp: năng lượng và thời gian"
        - img [ref=e49]
      - generic [ref=e51]:
        - button "Bỏ qua ghi nhận cơ thể" [ref=e52]
        - button "Tự chọn bài học miễn phí" [ref=e53]
```

# Test source

```ts
  1  | import {test,expect,type Page} from '@playwright/test';
  2  | const active=(p:Page)=>p.locator('[data-testid="flow-current"] > [data-flow-active="true"]').last();
  3  | async function enter(p:Page,query='?mode=web',english=false){await p.route('https://mcy-playwright.invalid/**',r=>r.abort());await p.goto('/'+query);if(english)await p.locator('.mcy-language-toggle').click();await p.getByRole('button',{name:english?'Explore as a guest':'Thử tìm hiểu như khách',exact:true}).click();await expect(active(p)).toHaveAttribute('data-flow-route','checkin');}
  4  | for(const [label,width,height,query] of [['320',320,568,'?mode=web'],['short',390,568,'?mode=web'],['360',360,640,'?mode=web'],['390',390,844,'?mode=web'],['landscape',844,390,'?mode=web'],['iphone',1100,1100,'?mode=review&device=iphone'],['pixel',1100,1100,'?mode=review&device=pixel-10']] as const)test('Visual hierarchy and optional map '+label,async({page})=>{
  5  |  await page.setViewportSize({width,height});await enter(page,query);
> 6  |  const opener=active(page).locator('.mcy-body-disclosure');await expect(opener).toHaveAttribute('aria-expanded','false');await expect(opener).toHaveAttribute('aria-controls','checkin-body-areas');await expect(active(page).locator('.mcy-body-art')).toHaveCount(0);if(label==='320'){const footerTop=(await page.locator('.flow-fixed-footer').boundingBox())!.y;for(const choice of await active(page).locator('.mcy-checkin-other-choices > button').all()){const b=(await choice.boundingBox())!;expect(b.height).toBeGreaterThanOrEqual(44);expect(b.y+b.height+6).toBeLessThanOrEqual(footerTop);}}
     |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            ^ Error: expect(received).toBeLessThanOrEqual(expected)
  7  |  await expect(opener).toBeVisible();if(height>=640)await expect(active(page).getByRole('button',{name:'Không thấy khó chịu',exact:true})).toBeInViewport();await active(page).getByRole('button',{name:'Không thấy khó chịu',exact:true}).scrollIntoViewIfNeeded();await expect(active(page).getByRole('button',{name:'Không thấy khó chịu',exact:true})).toBeInViewport();await active(page).locator('.mobile-scroll').evaluate(s=>{s.scrollTop=0;});await expect(page.locator('.flow-fixed-footer .mcy-action')).toBeInViewport();
  8  |  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  9  |  await expect.poll(async()=>Math.abs((await active(page).boundingBox())!.x-(await page.locator('.mobile-app-viewport').boundingBox())!.x)).toBeLessThan(.2);
  10 |  await page.screenshot({path:`analyse/ux-step4-2-visual-2026-10-16/checkin-quick-final-${label}.png`,animations:'disabled'});
  11 |  await opener.click();await expect(opener).toHaveAttribute('aria-expanded','true');await expect(active(page).locator('.mcy-body-art img')).toHaveAttribute('src',/feminine-full/);await expect(active(page).locator('.mcy-region-list button')).toHaveCount(4);
  12 |  await active(page).locator('.mcy-body-art').evaluate(map=>{const scroll=map.closest('.mobile-scroll')!;scroll.scrollTop+=map.getBoundingClientRect().top-scroll.getBoundingClientRect().top;});
  13 |  await page.screenshot({path:`analyse/ux-step4-2-visual-2026-10-16/checkin-map-final-${label}.png`,animations:'disabled'});
  14 |  await active(page).locator('.mcy-region-list').scrollIntoViewIfNeeded();await expect(active(page).locator('.mcy-region-list button').last()).toBeInViewport();
  15 |  await page.screenshot({path:`analyse/ux-step4-2-visual-2026-10-16/checkin-expanded-final-${label}.png`,animations:'disabled'});
  16 |  await page.getByRole('button',{name:'Tiếp: năng lượng và thời gian',exact:true}).click();await expect(active(page).locator('.mcy-checkin-summary')).toContainText('Chưa ghi nhận');
  17 | });
  18 | for(const [label,choice,expected] of [['none','Không thấy khó chịu','Không thấy khó chịu'],['unknown','Chưa xác định','Chưa xác định'],['noanswer',null,'Chưa ghi nhận'],['skip','Bỏ qua ghi nhận cơ thể','Bỏ qua phần cơ thể']] as const)test('Distinct body outcome '+label,async({page})=>{await enter(page);if(choice)await page.getByRole('button',{name:choice,exact:true}).click();if(label!=='skip')await page.getByRole('button',{name:'Tiếp: năng lượng và thời gian',exact:true}).click();await expect(active(page).locator('.mcy-checkin-summary')).toContainText(expected);});
  19 | test('Regional entries survive collapse, return and cancelled replacement; confirm clears',async({page})=>{
  20 |  await enter(page);await active(page).locator('.mcy-body-disclosure').click();await active(page).locator('.mcy-body-groups button').nth(1).click();
  21 |  const elbow=()=>active(page).locator('.mcy-region-list button').filter({hasText:'Khuỷu tay'});
  22 |  for(const [side,level] of [['Trái','Vừa'],['Phải','Nhẹ']]){if(side==='Trái')await elbow().click();else await active(page).locator('.mcy-map-pin[aria-label^="Khuỷu tay phải:"]').click();await page.getByRole('button',{name:side,exact:true}).click();await page.getByRole('button',{name:level,exact:true}).click();await page.getByRole('button',{name:'Lưu vùng này',exact:true}).click();}
  23 |  await expect(elbow()).toContainText('Trái · Vừa / Phải · Nhẹ');await active(page).locator('.mcy-body-disclosure').click();await expect(active(page).locator('.mcy-body-disclosure')).toContainText('Giữ 2 ghi nhận');await expect(active(page).locator('.mcy-body-art')).toHaveCount(0);
  24 |  await page.getByRole('button',{name:'Tiếp: năng lượng và thời gian',exact:true}).click();await expect(active(page).locator('.mcy-checkin-summary')).toContainText('Trái · Vừa');await expect(active(page).locator('.mcy-checkin-summary')).toContainText('Phải · Nhẹ');
  25 |  await active(page).getByRole('button',{name:'Sửa',exact:true}).click();await expect(active(page).locator('.mcy-body-disclosure')).toHaveAttribute('aria-expanded','true');await expect(elbow()).toContainText('Trái · Vừa / Phải · Nhẹ');
  26 |  await page.getByRole('button',{name:'Không thấy khó chịu',exact:true}).click();await expect(page.getByRole('dialog')).toBeVisible();await page.screenshot({path:'analyse/ux-step4-2-visual-2026-10-16/checkin-confirm.png',animations:'disabled'});await page.getByRole('button',{name:'Giữ các vùng đã ghi',exact:true}).click();await expect(elbow()).toContainText('Trái · Vừa / Phải · Nhẹ');
  27 |  await page.getByRole('button',{name:'Chưa xác định',exact:true}).click();await page.getByRole('button',{name:'Đổi lựa chọn',exact:true}).click();await expect(active(page).locator('.mcy-region-list button.selected')).toHaveCount(0);await page.getByRole('button',{name:'Tiếp: năng lượng và thời gian',exact:true}).click();await expect(active(page).locator('.mcy-checkin-summary')).toContainText('Chưa xác định');
  28 | });
  29 | test('English disclosure preserves partial preview and no-answer semantics',async({page})=>{await enter(page,'?mode=web',true);await expect(page.getByText('ENGLISH PREVIEW · SOME SCREENS REMAIN IN VIETNAMESE')).toBeVisible();const opener=active(page).getByRole('button',{name:/Notice each body area/});await opener.click();await expect(opener).toHaveAttribute('aria-expanded','true');await expect(active(page).locator('.mcy-region-list')).toHaveAttribute('aria-label','Choose a body area');await opener.click();await page.getByRole('button',{name:'Next: energy and time',exact:true}).click();await expect(active(page).locator('.mcy-checkin-summary')).toContainText('Not added');});
  30 | 
  31 | for(const english of [false,true])test('Large text and keyboard body choices '+english,async({page})=>{await page.setViewportSize({width:320,height:568});await enter(page,'?mode=web',english);await page.addStyleTag({content:'.mcy-checkin-page { font-size:20px; } .mcy-checkin-page h1 { font-size:42px!important; } .mcy-body-entry-copy strong { font-size:32px!important; } .mcy-body-entry-copy > span,.mcy-checkin-other-choices > button { font-size:20px!important; }'});const opener=active(page).locator('.mcy-body-disclosure');await opener.focus();await expect(opener).toBeFocused();await page.keyboard.press('Tab');const none=active(page).getByRole('button',{name:english?'No discomfort now':'Không thấy khó chịu',exact:true});await expect(none).toBeFocused();await page.keyboard.press('Enter');await expect(none).toHaveAttribute('aria-pressed','true');await page.keyboard.press('Tab');const uncertain=active(page).getByRole('button',{name:english?'Not sure':'Chưa xác định',exact:true});await expect(uncertain).toBeFocused();await page.keyboard.press('Enter');await expect(uncertain).toHaveAttribute('aria-pressed','true');await expect(none).toHaveAttribute('aria-pressed','false');for(const b of [none,uncertain]){const bounds=await b.boundingBox();expect(bounds!.height).toBeGreaterThanOrEqual(44);expect(await b.evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);}expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.screenshot({path:'analyse/ux-step4-2-visual-2026-10-16/checkin-large-'+english+'.png',animations:'disabled'});await opener.focus();await page.keyboard.press('Enter');await expect(opener).toHaveAttribute('aria-expanded','true');await expect(active(page).locator('.mcy-region-list')).toBeVisible();});
  32 | 
```