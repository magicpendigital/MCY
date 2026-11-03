import {test,expect,type Page} from '@playwright/test';
const active=(page:Page)=>page.locator('[data-testid="flow-current"] > [data-flow-active="true"]').last();
async function home(page:Page,query='?mode=web'){
 await page.route('https://mcy-playwright.invalid/**',route=>route.abort());
 await page.goto('/'+query);
 await page.getByRole('button',{name:'Thử tìm hiểu như khách',exact:true}).click();
 await page.getByRole('button',{name:'Tiếp: năng lượng và thời gian',exact:true}).click();
 await page.getByRole('button',{name:'Tự chọn bài học video miễn phí',exact:true}).click();
 await page.locator('.mcy-bottom-nav button').first().click();
 await expect(active(page).locator('.mcy-home-page')).toBeVisible();
}
for(const [label,width,height,query] of [
 ['360',360,640,'?mode=web'],['390',390,844,'?mode=web'],['desktop',1440,900,'?mode=web'],
 ['iphone',1100,1100,'?mode=review&device=iphone'],['pixel',1100,1100,'?mode=review&device=pixel-10']
] as const)test(`Home actions and uncropped image ${label}`,async({page})=>{
 await page.setViewportSize({width,height});await home(page,query);
 const primary=active(page).getByRole('button',{name:'Bắt đầu check-in',exact:true});
 const manual=active(page).getByRole('button',{name:'Tự chọn bài học miễn phí',exact:true});
 await expect(primary).toBeVisible();await expect(manual).toBeVisible();
 expect(await active(page).locator('.mcy-action').count()).toBe(1);
 await expect(active(page)).toContainText('Bạn tự chọn bài học video trong thư viện.');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 const image=active(page).locator('.mcy-home-photo img');await image.scrollIntoViewIfNeeded();
 await expect.poll(()=>image.evaluate((el:HTMLImageElement)=>el.complete&&el.naturalWidth>0)).toBe(true);
 const metrics=await image.evaluate((el:HTMLImageElement)=>({width:el.clientWidth,height:el.clientHeight,nw:el.naturalWidth,nh:el.naturalHeight}));
 expect(Math.abs(metrics.width/metrics.height-metrics.nw/metrics.nh)).toBeLessThan(.02);
 await page.screenshot({path:`analyse/ux-step4-1-2026-10-14/home-${label}.png`,animations:'disabled'});
 await manual.click();await expect(active(page)).toHaveAttribute('data-flow-route','discover');
 await page.locator('.mcy-bottom-nav button').first().click();await primary.click();
 await expect(active(page)).toHaveAttribute('data-flow-route','checkin');
});
test('Home resumes an actual guest draft without saving or clearing it',async({page})=>{
 await home(page);await active(page).getByRole('button',{name:'Bắt đầu check-in',exact:true}).click();
 await active(page).getByRole('button',{name:'Sửa',exact:true}).click();
 await active(page).getByRole('button',{name:'Không thấy khó chịu',exact:true}).click();
 await page.getByRole('button',{name:'Tiếp: năng lượng và thời gian',exact:true}).click();
 await page.getByRole('button',{name:'Quay lại',exact:true}).click();
 await expect(active(page)).toContainText('Lựa chọn được giữ trong phiên này; chưa lưu vào tài khoản.');
 await active(page).getByRole('button',{name:'Tiếp tục check-in',exact:true}).click();
 await expect(active(page).locator('.mcy-checkin-summary')).toContainText('Không thấy khó chịu');
});
for(const ready of [false,true])test(`Home capability ${ready?'ready':'disabled'} offers existing paths only`,async({page})=>{
 const actor='11111111-1111-4111-8111-111111111111',calls:string[]=[];
 await page.addInitScript(({actor})=>localStorage.setItem('sb-mcy-playwright-auth-token',JSON.stringify({access_token:'fictional-home',refresh_token:'fictional-refresh',token_type:'bearer',expires_at:Math.floor(Date.now()/1000)+3600,expires_in:3600,user:{id:actor,aud:'authenticated',role:'authenticated',email:'home@example.invalid',email_confirmed_at:'2026-01-01T00:00:00Z',app_metadata:{},user_metadata:{locale:'vi-VN'},identities:[],created_at:'2026-01-01T00:00:00Z'}})),{actor});
 await page.route('https://mcy-playwright.invalid/**',async route=>{
  const path=new URL(route.request().url()).pathname;
  if(path.endsWith('/profiles'))return route.fulfill({json:{user_id:actor,display_name:'Home fixture',locale:'vi-VN',body_display_preference:'neutral'}});
  if(path.endsWith('/get_my_consent_state'))return route.fulfill({json:{terms:true,privacy:true,ai_processing:true,wellbeing_data:false}});
  if(path.endsWith('/get_my_consent_policy_versions'))return route.fulfill({json:{terms:'terms-review-0.1',privacy:'privacy-review-0.1',ai_processing:'ai-processing-review-1.0'}});
  if(path.endsWith('/checkins')||path.endsWith('/checkin_observations'))return route.fulfill({json:[]});
  if(path.endsWith('/mcy-ai-assistant')){const action=route.request().postDataJSON().action;calls.push(action);expect(action).toBe('capability');return route.fulfill({json:{available:ready,contractVersion:'reviewed-practice-1'}});}
  throw Error('Unexpected fixture request '+path);
 });
 await page.goto('/?mode=web');await expect(active(page).locator('.mcy-home-page')).toBeVisible();
 await expect.poll(()=>calls.length).toBe(1);
 await expect(active(page).locator('.mcy-home-capability')).toContainText(ready?'chọn nội dung đã duyệt cùng AI':'Bạn tự chọn bài học video');
 await active(page).getByRole('button',{name:'Tự chọn bài học miễn phí',exact:true}).click();
 await expect(active(page).locator('[data-testid="free-course-catalog"]')).toBeVisible();expect(calls).toEqual(['capability']);
});
test('English Home keeps partial-preview disclosure and meaningful manual navigation',async({page})=>{
 await page.goto('/?mode=web');await page.locator('.mcy-language-toggle').click();
 await expect(page.getByText('ENGLISH PREVIEW · SOME SCREENS REMAIN IN VIETNAMESE')).toBeVisible();
 await page.getByRole('button',{name:'Explore as a guest',exact:true}).click();
 await page.getByRole('button',{name:'Next: energy and time',exact:true}).click();
 await page.getByRole('button',{name:'Browse free video lessons',exact:true}).click();
 await page.locator('.mcy-bottom-nav button').first().click();
 await expect(active(page).getByRole('heading',{name:'A little time for yourself.'})).toBeVisible();
 await active(page).getByRole('button',{name:'Choose a free video lesson',exact:true}).click();
 await expect(active(page).getByTestId('free-course-catalog')).toBeVisible();
});
