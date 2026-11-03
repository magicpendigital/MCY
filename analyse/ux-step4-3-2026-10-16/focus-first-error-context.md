# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: ux-energy-time.spec.ts >> Sequential keyboard focus clears footer true 28
- Location: .vercel\ux-step4-3-20261016\tests\ux-energy-time.spec.ts:14:56

# Error details

```
Error: expect(received).toBeGreaterThanOrEqual(expected)

Expected: >= 6
Received:    5.828125

Call Log:
- Timeout 5000ms exceeded while waiting on the predicate
```

# Page snapshot

```yaml
- generic [ref=e6]:
  - banner [ref=e7]:
    - generic [ref=e8]:
      - button "Back" [ref=e9]:
        - img [ref=e10]
      - generic "Today's check-in" [ref=e12]: A Little Yoga
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
                    - generic: A Little Yoga
                  - button: EN / VI
                  - paragraph: A little more peace
                  - generic: ENGLISH PREVIEW · SOME SCREENS REMAIN IN VIETNAMESE
                - generic:
                  - generic:
                    - generic:
                      - img
                    - text: Explore gentle movement for your neck, shoulders and back
                  - generic:
                    - generic:
                      - img
                    - text: Listen to your body each day
                  - generic:
                    - generic:
                      - img
                    - text: Start with a lesson you choose
    - main [ref=e19]:
      - generic [ref=e20]:
        - text: Step 2 of 2
        - generic [ref=e21]: Energy and time
      - heading "A little time for you." [level=1] [ref=e22]
      - paragraph [ref=e23]: Choose a practice yourself in the library.
      - generic [ref=e24]:
        - region "How much time do you have?" [ref=e25]:
          - heading "How much time do you have?" [level=2] [ref=e26]
          - generic [ref=e27]:
            - button "5 min" [active] [ref=e28]:
              - generic [ref=e29]: "5"
              - generic [ref=e30]: min
            - button "10 min" [pressed] [ref=e31]:
              - generic [ref=e32]: "10"
              - generic [ref=e33]: min
            - button "15 min" [ref=e34]:
              - generic [ref=e35]: "15"
              - generic [ref=e36]: min
          - paragraph [ref=e37]: A reference for your own choice. The library does not filter by this time.
        - generic [ref=e38]:
          - img [ref=e39]
          - text: Scroll down to see more options
        - region "Your energy today (optional)" [ref=e41]:
          - heading "Your energy today (optional)" [level=2] [ref=e42]:
            - text: Your energy today
            - generic [ref=e43]: (optional)
          - paragraph [ref=e44]: Kept only in your current draft; not used to choose a practice yet.
          - generic [ref=e45]:
            - button "Very low" [ref=e46]:
              - img [ref=e47]
              - generic [ref=e52]: Very low
            - button "Low" [ref=e53]:
              - img [ref=e54]
              - generic [ref=e59]: Low
            - button "Okay" [ref=e60]:
              - img [ref=e61]
              - generic [ref=e66]: Okay
            - button "Good" [ref=e67]:
              - img [ref=e68]
              - generic [ref=e73]: Good
            - button "Full" [ref=e74]:
              - img [ref=e75]
              - generic [ref=e80]: Full
        - generic [ref=e81]:
          - generic [ref=e82]:
            - strong [ref=e83]: Body check-in
            - generic [ref=e84]: Not added
          - button "Edit" [ref=e85]
        - paragraph [ref=e86]: Check-in saving is off. Your choices stay in the current draft.
        - button "Save today's check-in without choosing a session" [ref=e87]
        - generic [ref=e88]:
          - img [ref=e89]
          - text: Share only what you notice. This is not a health assessment.
  - contentinfo [ref=e91]:
    - generic [ref=e92]:
      - generic "Step 2 of 2" [ref=e93]:
        - generic [ref=e94]:
          - strong [ref=e95]: Step 2 of 2
          - generic [ref=e96]: Energy and time
      - button "Browse free video lessons" [ref=e100]:
        - text: Browse free video lessons
        - img [ref=e101]
      - generic [ref=e103]:
        - button "Sign in or create an account (optional)" [ref=e104]
        - button "Back to body check-in" [ref=e105]
```

# Test source

```ts
  1  | import {test,expect,type Page} from '@playwright/test';
  2  | import {CONSENT_POLICY_VERSIONS} from '../src/backend/learnerData';
  3  | const active=(p:Page)=>p.locator('[data-testid="flow-current"] > [data-flow-active="true"]').last();
  4  | async function enter(p:Page,query='?mode=web',en=false){await p.route('**/*',r=>new URL(r.request().url()).hostname==='127.0.0.1'?r.continue():r.abort());await p.goto('/'+query);if(en)await p.locator('.mcy-language-toggle').click();await p.getByRole('button',{name:en?'Explore as a guest':'Thử tìm hiểu như khách',exact:true}).click();await p.getByRole('button',{name:en?'Next: energy and time':'Tiếp: năng lượng và thời gian',exact:true}).click();await expect(active(p).locator('.mcy-time-choice')).toBeVisible();}
  5  | async function wheelTo(p:Page,target:string){const scroll=active(p).locator('.mobile-scroll'),s=(await scroll.boundingBox())!;await p.mouse.move(s.x+s.width/2,s.y+s.height/2);for(let i=0;i<12;i++){const b=await active(p).locator(target).boundingBox(),f=(await p.locator('.flow-fixed-footer').boundingBox())!;if(b&&b.y>=s.y+6&&b.y+b.height+6<=f.y)return;await p.mouse.wheel(0,110);await p.waitForTimeout(30);}throw Error('Ordinary wheel cannot reveal '+target);}
  6  | for(const [label,width,height,query] of [['320',320,568,'?mode=web'],['360',360,640,'?mode=web'],['390',390,844,'?mode=web'],['short',390,568,'?mode=web'],['landscape',844,390,'?mode=web'],['iphone',1100,1100,'?mode=review&device=iphone'],['pixel',1100,1100,'?mode=review&device=pixel-10']] as const)test('Time-first honest check-in '+label,async({page})=>{
  7  |  await page.setViewportSize({width,height});await enter(page,query);const root=active(page);await expect(root.locator('#checkin-time-use')).toContainText('Thư viện chưa lọc');await expect(root.locator('.mcy-time-choice [aria-pressed="true"]')).toHaveAccessibleName('10 phút');await expect(root.locator('.mcy-energy-options [aria-pressed="true"]')).toHaveCount(0);const time=(await root.locator('.mcy-time-choice').boundingBox())!,energy=(await root.locator('.mcy-energy-card').boundingBox())!;expect(time.y).toBeLessThan(energy.y);for(const b of await root.locator('.mcy-time-choice button,.mcy-energy-options button').all()){const box=(await b.boundingBox())!;expect(box.width).toBeGreaterThanOrEqual(44);expect(box.height).toBeGreaterThanOrEqual(44);}await page.waitForTimeout(350);await page.screenshot({path:`analyse/ux-step4-3-2026-10-16/time-${label}.png`,animations:'disabled'});
  8  |  await wheelTo(page,'.mcy-energy-options');await expect(root.locator('#checkin-energy-use')).toContainText('Chỉ nằm trong nháp hiện tại');await page.screenshot({path:`analyse/ux-step4-3-2026-10-16/energy-${label}.png`,animations:'disabled'});await page.mouse.wheel(0,1200);await expect(root.locator('.mcy-standalone-link')).toBeInViewport();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await expect(page.locator('.flow-fixed-footer .mcy-action')).toBeInViewport();
  9  | });
  10 | for(const en of [false,true])test('True2x text and keyboard time energy '+en,async({page})=>{await page.setViewportSize({width:320,height:568});await enter(page,'?mode=web',en);await page.addStyleTag({content:'.mcy-time-choice .mcy-choice small,.mcy-energy-options button{font-size:28px!important}.mcy-time-choice .mcy-choice span{font-size:64px!important}.mcy-time-choice p,#checkin-energy-use{font-size:28px!important}'});const root=active(page),times=root.locator('.mcy-time-choice button');await times.first().focus();await page.keyboard.press('Enter');await expect(times.first()).toHaveAttribute('aria-pressed','true');await page.keyboard.press('Tab');await expect(times.nth(1)).toBeFocused();await page.keyboard.press('Enter');await expect(times.nth(1)).toHaveAttribute('aria-pressed','true');await page.keyboard.press('Tab');await page.keyboard.press('Enter');await expect(times.last()).toHaveAttribute('aria-pressed','true');await page.keyboard.press('Tab');const energy=root.locator('.mcy-energy-options button');await expect(energy.first()).toBeFocused();await page.keyboard.press('Enter');await expect(energy.first()).toHaveAttribute('aria-pressed','true');await page.keyboard.press('Tab');await page.keyboard.press('Enter');await expect(energy.nth(1)).toHaveAttribute('aria-pressed','true');
  11 |  for(const button of await root.locator('.mcy-time-choice button,.mcy-energy-options button').all()){const bounds=await button.evaluate(el=>{const r=el.getBoundingClientRect(),span=el.querySelector('span')!,range=document.createRange();range.selectNodeContents(span);return{client:el.clientWidth,scroll:el.scrollWidth,left:r.left,right:r.right,lines:[...range.getClientRects()].map(t=>({left:t.left,right:t.right}))};});expect(bounds.scroll).toBeLessThanOrEqual(bounds.client);for(const line of bounds.lines){expect(line.left).toBeGreaterThanOrEqual(bounds.left);expect(line.right).toBeLessThanOrEqual(bounds.right);}}
  12 |  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.screenshot({path:`analyse/ux-step4-3-2026-10-16/true2x-${en}.png`,animations:'disabled'});
  13 | });
  14 | for(const en of [false,true])for(const font of [14,28])test(`Sequential keyboard focus clears footer ${en} ${font}`,async({page})=>{
  15 |  await page.setViewportSize({width:320,height:568});await enter(page,'?mode=web',en);await page.waitForTimeout(600);if(font===28)await page.addStyleTag({content:'.mcy-time-choice .mcy-choice small,.mcy-energy-options button{font-size:28px!important}.mcy-time-choice .mcy-choice span{font-size:64px!important}.mcy-time-choice p,#checkin-energy-use{font-size:28px!important}'});
> 16 |  const controls=active(page).locator('.mcy-time-choice button,.mcy-energy-options button');await controls.first().focus();for(let i=0;i<8;i++){if(i)await page.keyboard.press('Tab');await expect(controls.nth(i)).toBeFocused();await expect.poll(()=>controls.nth(i).evaluate(el=>{const r=el.getBoundingClientRect(),s=el.closest('.mobile-scroll')!.getBoundingClientRect(),f=document.querySelector('.flow-fixed-footer')!.getBoundingClientRect();return Math.min(r.top-s.top,f.top-r.bottom);})).toBeGreaterThanOrEqual(6);await page.keyboard.press('Enter');await expect(controls.nth(i)).toHaveAttribute('aria-pressed','true');}
     |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         ^ Error: expect(received).toBeGreaterThanOrEqual(expected)
  17 |  await page.screenshot({path:`analyse/ux-step4-3-2026-10-16/keyboard-final-${en}-${font}.png`,animations:'disabled'});
  18 | });
  19 | test('Manual library keeps choices as preferences without filtering or saving',async({page})=>{const writes:string[]=[];page.on('request',r=>{if(new URL(r.url()).hostname!=='127.0.0.1'&&r.method()!=='GET')writes.push(r.url());});await enter(page);const root=active(page);await root.getByRole('button',{name:'5 phút',exact:true}).click();await root.getByRole('button',{name:'Rất thấp',exact:true}).click();await page.getByRole('button',{name:'Tự chọn bài học video miễn phí',exact:true}).click();await expect(active(page)).toHaveAttribute('data-flow-route','discover');await expect(active(page).getByRole('heading',{name:'Bài học yoga miễn phí',exact:true})).toBeVisible();await expect(active(page).getByRole('region',{name:'Chọn một nhóm để bắt đầu'})).toContainText('38 BÀI HỌC');await expect(active(page).getByRole('region',{name:'Chọn một nhóm để bắt đầu'}).getByRole('button')).toHaveCount(3);expect(writes).toEqual([]);});
  20 | for(const [capability,save] of [['disabled',true],['not_ready',true],['disabled',false],['ready',false]] as const)test(`Honest helper capability ${capability} saving ${save}`,async({page})=>{
  21 |  const actor='11111111-1111-4111-8111-111111111111',calls:any[]=[];
  22 |  await page.addInitScript(({actor})=>localStorage.setItem('sb-mcy-playwright-auth-token',JSON.stringify({access_token:'fictional-ui-token',refresh_token:'fictional-ui-refresh',token_type:'bearer',expires_at:Math.floor(Date.now()/1000)+3600,expires_in:3600,user:{id:actor,email:'fixture@example.test',aud:'authenticated',role:'authenticated',email_confirmed_at:'2026-01-01T00:00:00Z',app_metadata:{},user_metadata:{},identities:[],created_at:'2026-01-01T00:00:00Z'}})),{actor});
  23 |  await page.route('https://*.supabase.co/**',r=>r.abort());await page.route('https://mcy-playwright.invalid/**',async route=>{const path=new URL(route.request().url()).pathname;if(path.endsWith('/profiles'))return route.fulfill({json:{id:actor,display_name:'Fixture',locale:'vi-VN',preferences:{}}});if(path.endsWith('/get_my_consent_state'))return route.fulfill({json:{terms:true,privacy:true,ai_processing:true,wellbeing_data:save}});if(path.endsWith('/get_my_consent_policy_versions'))return route.fulfill({json:CONSENT_POLICY_VERSIONS});if(path.endsWith('/checkins')||path.endsWith('/checkin_observations'))return route.fulfill({json:[]});if(path.endsWith('/mcy-ai-assistant')){const body=route.request().postDataJSON();if(body.action==='capability')return route.fulfill({json:{available:capability==='ready',reason:capability==='not_ready'?'not_ready':'disabled',contractVersion:'reviewed-practice-1'}});calls.push(body);return route.fulfill({json:{status:'no_match',contextRevision:body.context.revision,requestId:body.requestId}});}throw Error('Unexpected synthetic request '+path);});
  24 |  await page.goto('/?mode=web');await page.getByRole('button',{name:'Bắt đầu check-in',exact:true}).click();await page.getByRole('button',{name:'Tiếp: năng lượng và thời gian',exact:true}).click();const root=active(page);await expect(root.locator('#checkin-energy-use')).toContainText(save?'chưa hiển thị trong Hành trình':capability==='ready'?'khi bạn xác nhận với AI':'Chỉ nằm trong nháp');
  25 |  if(capability==='ready'){await expect(root.locator('#checkin-time-use')).toContainText('AI dùng giới hạn');await root.getByRole('button',{name:'15 phút',exact:true}).click();await root.getByRole('button',{name:'Khá ổn',exact:true}).click();await page.getByRole('button',{name:'Chọn buổi hôm nay cùng AI',exact:true}).click();await expect(active(page)).toHaveAttribute('data-flow-route','daily-practice');expect(calls).toHaveLength(0);await page.getByRole('button',{name:'Chọn buổi từ danh mục đã duyệt',exact:true}).click();await expect.poll(()=>calls.length).toBe(1);expect(calls[0].context).toMatchObject({minutes:15,energy:'Khá ổn'});}else{await expect(root.locator('#checkin-time-use')).toContainText('Thư viện chưa lọc');await expect(page.getByRole('button',{name:'Chọn buổi hôm nay cùng AI',exact:true})).toHaveCount(0);}expect(calls.length).toBe(capability==='ready'?1:0);
  26 | });
  27 | 
```