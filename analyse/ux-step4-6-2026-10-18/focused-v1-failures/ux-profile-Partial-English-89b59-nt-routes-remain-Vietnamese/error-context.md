# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: ux-profile.spec.ts >> Partial English stays disclosed; account routes remain Vietnamese
- Location: ..\..\..\.vercel\ux-step4-6-20261018\tests\ux-profile.spec.ts:39:1

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: getByTestId('flow-current').last()
Expected substring: "Tiếng Anh hiện đang được hoàn thiện"
Received string:    "HỒ SƠThông tin tối thiểu, do bạn sửa.Tên tùy chọn, cài đặt hiển thị và các trường chỉ hỏi khi thật sự cần.Tên hiển thịNgôn ngữTiếng ViệtEnglish · đang hoàn thiệnEnglish is in progress. Welcome, the main practice loop and Journey are translated; account, consent, support and knowledge screens remain in Vietnamese.Múi giờ thiết bị: Asia/BangkokHình body mapChange illustration Lưu thay đổiHủyHồ sơ và lựa chọn quyền được đồng bộ khi dịch vụ đã kết nối. Nếu một tính năng chưa sẵn sàng, ứng dụng sẽ thông báo rõ trước khi bạn sử dụng."
Timeout: 5000ms

Call log:
  - Expect "toContainText" with timeout 5000ms
  - waiting for getByTestId('flow-current').last()
    13 × locator resolved to <div class="flow-screen" data-flow-current="true" data-testid="flow-current">…</div>
       - unexpected value "HỒ SƠThông tin tối thiểu, do bạn sửa.Tên tùy chọn, cài đặt hiển thị và các trường chỉ hỏi khi thật sự cần.Tên hiển thịNgôn ngữTiếng ViệtEnglish · đang hoàn thiệnEnglish is in progress. Welcome, the main practice loop and Journey are translated; account, consent, support and knowledge screens remain in Vietnamese.Múi giờ thiết bị: Asia/BangkokHình body mapChange illustration Lưu thay đổiHủyHồ sơ và lựa chọn quyền được đồng bộ khi dịch vụ đã kết nối. Nếu một tính năng chưa sẵn sàng, ứng dụng sẽ thông báo rõ trước khi bạn sử dụng."

```

```yaml
- main:
  - text: HỒ SƠ
  - heading "Thông tin tối thiểu, do bạn sửa." [level=1]
  - paragraph: Tên tùy chọn, cài đặt hiển thị và các trường chỉ hỏi khi thật sự cần.
  - text: Tên hiển thị
  - textbox "Tên hiển thị":
    - /placeholder: Tên gọi trong ứng dụng
  - strong: Ngôn ngữ
  - button "Tiếng Việt"
  - button "English · đang hoàn thiện" [pressed]
  - text: English is in progress. Welcome, the main practice loop and Journey are translated; account, consent, support and knowledge screens remain in Vietnamese.
  - paragraph: "Múi giờ thiết bị: Asia/Bangkok"
  - strong: Hình body map
  - button "Change illustration":
    - text: Change illustration
    - img
  - button "Lưu thay đổi":
    - text: Lưu thay đổi
    - img
  - button "Hủy"
  - paragraph:
    - img
    - text: Hồ sơ và lựa chọn quyền được đồng bộ khi dịch vụ đã kết nối. Nếu một tính năng chưa sẵn sàng, ứng dụng sẽ thông báo rõ trước khi bạn sử dụng.
```

# Test source

```ts
  1  | import {test,expect,type Page} from '@playwright/test';
  2  | import {CONSENT_POLICY_VERSIONS,emptyConsentState} from '../src/backend/learnerData';
  3  | const active=(p:Page)=>p.getByTestId('flow-current').last(),view=(p:Page)=>active(p).locator('.mcy-account-home');
  4  | const A='11111111-1111-4111-8111-111111111111',B='77777777-7777-4777-8777-777777777777',origin='https://mcy-playwright.invalid',key='sb-mcy-playwright-auth-token';
  5  | const titles=['Thông tin cá nhân','Quyền riêng tư và đồng ý','AI và điều được nhớ','Bảo mật tài khoản','Hướng dẫn và liên hệ','Tùy chọn thông báo','Nội dung và quyền đang có','Chia sẻ với giáo viên','Xuất hoặc xóa dữ liệu'];
  6  | const routes=['edit-profile','privacy','memory','security','help','notifications','access','sharing','help'];
  7  | function session(id=A,email='a@example.test'){return{access_token:id===A?'fictional-a-token':'fictional-b-token',refresh_token:'fictional-refresh',token_type:'bearer',expires_at:Math.floor(Date.now()/1000)+3600,expires_in:3600,user:{id,email,aud:'authenticated',role:'authenticated',email_confirmed_at:'2026-01-01T00:00:00Z',app_metadata:{},user_metadata:{},identities:[],created_at:'2026-01-01T00:00:00Z'}};}
  8  | function latch(){let release!:()=>void;const promise=new Promise<void>(r=>release=r);return{promise,release};}
  9  | async function fixture(p:Page,options:{signed?:boolean;name?:string;email?:string;wellbeing?:boolean;sharing?:boolean;profileDelay?:ReturnType<typeof latch>;profileError?:boolean;logout?:'error'|'success';logoutDelay?:ReturnType<typeof latch>}={}){
  10 |  const mutations:{path:string;query:string;method:string;body:unknown}[]=[],reads:string[]=[],external:string[]=[];
  11 |  if(options.signed)await p.addInitScript(({key,value})=>localStorage.setItem(key,JSON.stringify(value)),{key,value:session(A,options.email)});
  12 |  await p.route('**/*',async r=>{const u=new URL(r.request().url());if(u.hostname==='127.0.0.1')return r.fallback();if(u.origin!==origin){external.push(u.origin);return r.abort();}const method=r.request().method(),path=u.pathname;
  13 |  const readonly=method==='GET'||method==='HEAD'||method==='OPTIONS'||path.endsWith('/get_my_consent_state')||path.endsWith('/get_my_consent_policy_versions')||path.endsWith('/mcy-ai-assistant');
  14 |  if(!readonly)mutations.push({path,query:u.search,method,body:r.request().postData()});else reads.push(path);
  15 |  const id=r.request().headers().authorization?.endsWith('fictional-b-token')?B:A;
  16 |  if(path.endsWith('/profiles')){if(method!=='GET')throw Error('Unexpected profile mutation');if(options.profileDelay)await options.profileDelay.promise;if(options.profileError)return r.fulfill({status:500,json:{message:'Fictional profile unavailable'}});return r.fulfill({json:{user_id:id,display_name:id===B?'Fixture B':options.name??'Fixture A',locale:'vi-VN',body_display_preference:'neutral'}});}
  17 |  if(path.endsWith('/get_my_consent_state'))return r.fulfill({json:{...emptyConsentState,terms:true,privacy:true,wellbeing_data:options.wellbeing??false,teacher_sharing:options.sharing??false,notifications:true}});
  18 |  if(path.endsWith('/get_my_consent_policy_versions'))return r.fulfill({json:CONSENT_POLICY_VERSIONS});
  19 |  if(path.endsWith('/checkins')||path.endsWith('/checkin_observations'))return r.fulfill({json:[]});
  20 |  if(path.endsWith('/mcy-ai-assistant'))return r.fulfill({json:{available:false,contractVersion:'reviewed-practice-1'}});
  21 |  if(path.endsWith('/user'))return r.fulfill({json:session(id,options.email).user});
  22 |  if(path.endsWith('/logout')){if(options.logoutDelay)await options.logoutDelay.promise;return options.logout==='error'?r.fulfill({status:500,json:{message:'Fictional logout unavailable'}}):r.fulfill({status:204,body:''});}
  23 |  throw Error('Unexpected synthetic request '+method+' '+path);
  24 |  });return{mutations,reads,external};
  25 | }
  26 | async function enter(p:Page,options:Parameters<typeof fixture>[1]={},query='?mode=web',english=false){const f=await fixture(p,options);await p.emulateMedia({reducedMotion:'reduce'});await p.goto('/'+query);if(options.signed){await expect(p.locator('.mcy-home-page')).toBeVisible();}else{if(english)await p.locator('.mcy-language-toggle').click();await p.getByRole('button',{name:english?'Explore as a guest':'Thử tìm hiểu như khách',exact:true}).click();await p.getByRole('button',{name:english?'Browse free video lessons':'Tự chọn bài học miễn phí',exact:true}).click();}await p.locator('.flow-fixed-footer').getByRole('button',{name:english?'Profile':'Cá nhân',exact:true}).click();await expect(view(p)).toBeVisible();await expect.poll(()=>active(p).evaluate(e=>Math.round(e.getBoundingClientRect().left-e.parentElement!.getBoundingClientRect().left))).toBe(0);return f;}
  27 | async function noOverflow(p:Page){const s=await active(p).locator('.mobile-scroll').evaluate(e=>({client:e.clientWidth,scroll:e.scrollWidth}));expect(s.scroll).toBeLessThanOrEqual(s.client);}
  28 | async function tabTo(p:Page,selector:string,max=35){for(let i=0;i<max;i++){await p.keyboard.press('Tab');if(await p.evaluate(s=>document.activeElement?.matches(s),selector))return;}throw Error('Actual Tab did not reach '+selector);}
  29 | async function focusedBounds(p:Page){const g=await p.evaluate(()=>{const e=document.activeElement!,r=e.getBoundingClientRect(),f=document.querySelector('.flow-fixed-footer')!.getBoundingClientRect(),h=document.querySelector('.flow-fixed-header')!.getBoundingClientRect(),s=getComputedStyle(e);return{top:r.top,bottom:r.bottom,left:r.left,right:r.right,header:h.bottom,footer:f.top,ring:parseFloat(s.outlineWidth)+parseFloat(s.outlineOffset),visible:e.matches(':focus-visible')};});expect(g.visible).toBe(true);expect(g.ring).toBeGreaterThanOrEqual(6);expect(g.top-g.ring).toBeGreaterThanOrEqual(g.header-.5);expect(g.bottom+g.ring).toBeLessThanOrEqual(g.footer+.5);return g;}
  30 | for(const [label,width,height,query] of [['320',320,568,'?mode=web'],['360',360,640,'?mode=web'],['390',390,844,'?mode=web'],['landscape',844,390,'?mode=web'],['desktop',1440,1000,'?mode=web'],['iphone',1100,1100,'?mode=review&device=iphone'],['pixel',1100,1100,'?mode=review&device=pixel-10']] as const)for(const signed of [false,true])test('Profile hierarchy '+label+' '+(signed?'account':'guest'),async({page},info)=>{
  31 |  await page.setViewportSize({width,height});const f=await enter(page,{signed});await expect(view(page).locator('h2')).toHaveText(['Hồ sơ và dữ liệu','Tài khoản và hướng dẫn','Tính năng và trạng thái hiện có']);await expect(view(page).locator('.mcy-account-row strong')).toHaveText(titles);await expect(view(page).locator('details')).toHaveCount(0);await expect(view(page)).not.toContainText(/Email đã xác minh|đã đồng bộ|chuỗi ngày|tiến độ của bạn/i);await expect(view(page).getByRole('button',{name:/Quyền riêng tư và đồng ý/})).toBeEnabled();await expect(view(page).getByRole('button',{name:/Tùy chọn thông báo/})).toContainText('Lưu lựa chọn nhận tin');await expect(view(page).getByRole('button',{name:/Nội dung và quyền đang có/})).toContainText('Bài học miễn phí đang có');await noOverflow(page);await page.screenshot({path:info.outputPath('early-'+label+'-'+signed+'.png'),animations:'disabled'});expect(f.mutations).toEqual([]);expect(f.external).toEqual([]);
  32 | });
  33 | test('All nine original row destinations and back are reachable without mutations',async({page})=>{const f=await enter(page,{signed:true});for(let i=0;i<titles.length;i++){await view(page).getByRole('button',{name:new RegExp(titles[i])}).click();await expect(active(page).locator('[data-flow-route]')).toHaveAttribute('data-flow-route',routes[i]);await page.getByRole('button',{name:'Quay lại',exact:true}).click();await expect(view(page)).toBeVisible();}expect(f.mutations).toEqual([]);expect(f.external).toEqual([]);});
  34 | test('Guest account CTA opens create email form without sending email',async({page})=>{const f=await enter(page);await view(page).getByRole('button',{name:'Tạo tài khoản hoặc đăng nhập',exact:true}).click();await expect(active(page).locator('.mcy-eyebrow')).toHaveText('TẠO TÀI KHOẢN');await expect(page.getByLabel('Địa chỉ email')).toBeVisible();expect(f.mutations).toEqual([]);await page.getByRole('button',{name:'Quay lại',exact:true}).click();await expect(view(page)).toBeVisible();});
  35 | test('Notification and security parity: real preferences, no scheduling and other account login',async({page})=>{const f=await enter(page,{signed:true});await view(page).getByRole('button',{name:/Tùy chọn thông báo/}).click();await expect(active(page)).toContainText('Nhắc tập chưa mở');await expect(active(page)).toContainText('Chỉ lưu lựa chọn nhận tin; chưa đặt giờ hay gửi nhắc tập.');await expect(active(page).getByRole('button',{name:'Cho phép nhận thông báo nhắc tập · Bật',exact:true})).toHaveAttribute('aria-pressed','true');await page.getByRole('button',{name:'Quay lại',exact:true}).click();await view(page).getByRole('button',{name:/Bảo mật tài khoản/}).click();await expect(active(page)).toContainText('Hồ sơ và Hành trình được giữ riêng theo từng tài khoản.');await active(page).getByRole('button',{name:'Đăng nhập bằng tài khoản khác',exact:true}).click();await expect(active(page).locator('.mcy-eyebrow')).toHaveText('ĐĂNG NHẬP');await expect(page.getByLabel('Địa chỉ email')).toBeVisible();expect(f.mutations).toEqual([]);});
  36 | for(const result of ['error','success'] as const)test('Existing local logout pending '+result,async({page})=>{const delay=latch(),f=await enter(page,{signed:true,logout:result,logoutDelay:delay});await view(page).getByRole('button',{name:'Đăng xuất thiết bị này',exact:true}).click();await expect(view(page).getByRole('button',{name:'Đang đăng xuất…',exact:true})).toBeDisabled();await expect.poll(()=>f.mutations.length).toBe(1);expect(f.mutations[0]).toMatchObject({path:'/auth/v1/logout',query:'?scope=local',method:'POST'});delay.release();if(result==='error'){await expect(view(page).getByRole('alert')).toContainText('Fictional logout unavailable');await expect(view(page).getByRole('button',{name:'Đăng xuất thiết bị này',exact:true})).toBeEnabled();await expect(view(page).locator('h1')).toHaveText('Chào, Fixture A.');}else{await expect(view(page).getByRole('button',{name:'Tạo tài khoản hoặc đăng nhập',exact:true})).toBeVisible();await expect(view(page)).not.toContainText('a@example.test');expect(await page.evaluate(k=>localStorage.getItem(k),key)).toBeNull();}expect(f.mutations).toHaveLength(1);});
  37 | test('Long identity and true 28px text reflow; actual Tab reaches every row clear of footer',async({page},info)=>{await page.setViewportSize({width:320,height:568});const name='Nguyễn Thị Minh An '.repeat(5).trim(),email='long.synthetic.account.name.without.breaks@example.test',f=await enter(page,{signed:true,name,email});await page.addStyleTag({content:'.mcy-account-home :is(p,button,small,strong,h2){font-size:28px!important;line-height:1.5!important}.mcy-bottom-nav button{font-size:28px!important;line-height:1.5!important}'});await expect(view(page).locator('h1')).toHaveText('Chào, '+name+'.');await expect(view(page).locator('.mcy-lead')).toHaveText(email);await noOverflow(page);await tabTo(page,'.mcy-account-home .mcy-account-row');for(let i=0;i<9;i++){await expect(view(page).locator('.mcy-account-row').nth(i)).toBeFocused();await focusedBounds(page);if(i===4){await page.keyboard.press('Tab');await expect(view(page).getByRole('button',{name:'Đăng xuất thiết bị này',exact:true})).toBeFocused();await focusedBounds(page);}if(i<8)await page.keyboard.press('Tab');}await noOverflow(page);await page.screenshot({path:info.outputPath('large-identity-focused.png'),animations:'disabled'});expect(f.mutations).toEqual([]);});
  38 | for(const device of ['iphone','pixel-10'])test('Profile actual keyboard and footer safe area '+device,async({page})=>{await enter(page,{},'?mode=review&device='+device);await tabTo(page,'.mcy-account-home .mcy-account-row');for(let i=0;i<9;i++){await expect(view(page).locator('.mcy-account-row').nth(i)).toBeFocused();await focusedBounds(page);if(i<8)await page.keyboard.press('Tab');}const g=await page.locator('.flow-fixed-footer').evaluate(e=>{const r=e.getBoundingClientRect(),v=document.querySelector('.mobile-app-viewport')!.getBoundingClientRect(),s=parseFloat(getComputedStyle(document.querySelector('.mobile-page')!).getPropertyValue('--mobile-safe-area-height'))||0;return{bottom:r.bottom,viewport:v.bottom,safe:s};});expect(g.bottom).toBeLessThanOrEqual(g.viewport-g.safe+.5);});
> 39 | test('Partial English stays disclosed; account routes remain Vietnamese',async({page})=>{const f=await enter(page,{},'?mode=web',true);await expect(view(page).locator('h2').first()).toHaveText('Hồ sơ và dữ liệu');await view(page).getByRole('button',{name:/Thông tin cá nhân/}).click();await expect(active(page)).toContainText('Tiếng Anh hiện đang được hoàn thiện');await expect(active(page)).toContainText('tài khoản, đồng ý, hỗ trợ và nội dung kiến thức vẫn dùng tiếng Việt');expect(f.mutations).toEqual([]);});
     |                                                                                                                                                                                                                                                                                                                         ^ Error: expect(locator).toContainText(expected) failed
  40 | test('Hydration failure preserves Profile controls without invented consent status',async({page})=>{const f=await fixture(page,{signed:true,profileError:true});await page.goto('/?mode=web');await page.getByRole('button',{name:'Thử tìm hiểu như khách',exact:true}).click();await page.getByRole('button',{name:'Tự chọn bài học miễn phí',exact:true}).click();await page.getByRole('button',{name:'Cá nhân',exact:true}).click();await expect(view(page)).toBeVisible();await expect(view(page).getByRole('button',{name:/Quyền riêng tư và đồng ý/})).toBeEnabled();await expect(view(page)).not.toContainText(/Email đã xác minh|đã đồng bộ|đã đọc quyền/i);expect(f.mutations).toEqual([]);});
  41 | test('Leaving Profile retains Home layout and no Profile styles in later routes',async({page})=>{const f=await enter(page);await page.locator('.flow-fixed-footer').getByRole('button',{name:'Hôm nay',exact:true}).click();await expect(active(page).locator('.mcy-home-page')).toBeVisible();await expect(active(page).locator('.mcy-profile-scroll')).toHaveCount(0);await page.getByRole('button',{name:'Khám phá',exact:true}).click();await page.getByRole('button',{name:/Một chút chuyển động nhẹ/}).click();await expect(active(page).locator('.mcy-course-detail-page')).toBeVisible();await expect(active(page).locator('.mcy-profile-scroll')).toHaveCount(0);expect(f.mutations).toEqual([]);});
  42 | 
```