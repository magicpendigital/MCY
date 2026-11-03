# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: late-save.spec.ts >> navigation away before account-bound client preparation completes must prevent a late save dispatch
- Location: analyse\native-checkin-diagnostics\late-save.spec.ts:93:1

# Error details

```
Test timeout of 20000ms exceeded.
```

```
Error: locator.click: Test timeout of 20000ms exceeded.
Call log:
  - waiting for locator('[data-testid="flow-fixed-footer"]').getByRole('button', { name: 'Cá nhân', exact: true })

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - generic [ref=e4]: "[plugin:vite:css] [postcss] ENOENT: no such file or directory, open 'D:\\Projects\\design-system\\tokens.css'"
  - generic [ref=e5]: D:/Projects/MCY/.vercel/native-checkin-late-save-candidate/src/prototype.css:undefined:null
  - generic [ref=e6]: at open (node:internal/fs/promises:1281:25) at Object.readFile (node:internal/fs/promises:1929:14) at Object.load (file:///D:/Projects/MCY/node_modules/vite/dist/node/chunks/node.js:30197:17) at loadImportContent (file:///D:/Projects/MCY/node_modules/vite/dist/node/chunks/postcss-import.js:390:19) at async Promise.all (index 0) at resolveImportId (file:///D:/Projects/MCY/node_modules/vite/dist/node/chunks/postcss-import.js:376:20) at parseStyles (file:///D:/Projects/MCY/node_modules/vite/dist/node/chunks/postcss-import.js:328:4) at Object.Once (file:///D:/Projects/MCY/node_modules/vite/dist/node/chunks/postcss-import.js:453:20) at LazyResult.runAsync (D:\Projects\MCY\node_modules\postcss\lib\lazy-result.js:299:11) at runPostCSS (file:///D:/Projects/MCY/node_modules/vite/dist/node/chunks/node.js:30251:19) at compilePostCSS (file:///D:/Projects/MCY/node_modules/vite/dist/node/chunks/node.js:30235:6) at compileCSS (file:///D:/Projects/MCY/node_modules/vite/dist/node/chunks/node.js:30165:26) at TransformPluginContext.handler (file:///D:/Projects/MCY/node_modules/vite/dist/node/chunks/node.js:29636:47) at EnvironmentPluginContainer.transform (file:///D:/Projects/MCY/node_modules/vite/dist/node/chunks/node.js:8515:14) at loadAndTransform (file:///D:/Projects/MCY/node_modules/vite/dist/node/chunks/node.js:19998:26) at viteTransformMiddleware (file:///D:/Projects/MCY/node_modules/vite/dist/node/chunks/node.js:20217:20)
  - generic [ref=e7]:
    - text: Click outside, press Esc key, or fix the code to dismiss.
    - text: You can also disable this overlay by setting
    - code [ref=e8]: server.hmr.overlay
    - text: to
    - code [ref=e9]: "false"
    - text: in
    - code [ref=e10]: vite.config.ts
    - text: .
```

# Test source

```ts
  1   | import { expect, test, type Page } from '@playwright/test';
  2   | import { CONSENT_POLICY_VERSIONS, emptyConsentState } from '../../src/backend/learnerData';
  3   | 
  4   | // Diagnostic desired contracts, outside the normal suite. Fictional web UI only;
  5   | // no native lifecycle/incident reproduction or deployed fix is claimed.
  6   | const origin = 'https://mcy-playwright.invalid';
  7   | const storageKey = 'sb-mcy-playwright-auth-token';
  8   | const actor = '77777777-7777-4777-8777-777777777777';
  9   | const writer = '/save_my_checkin_for_current_user_with_current_consent';
  10  | function session() {
  11  |   return { access_token: 'fictional-diagnostic-b', refresh_token: 'fictional-diagnostic-refresh', token_type: 'bearer',
  12  |     expires_at: Math.floor(Date.now()/1000)+3600, expires_in: 3600,
  13  |     user: { id: actor, email: 'diagnostic-b@example.test', aud: 'authenticated', role: 'authenticated',
  14  |       email_confirmed_at: '2026-01-01T00:00:00Z', app_metadata: {}, user_metadata: {}, identities: [], created_at: '2026-01-01T00:00:00Z' } };
  15  | }
  16  | async function fixture(page: Page) {
  17  |   const saves: Record<string,unknown>[] = [], unexpected: string[] = [];
  18  |   let profileReads = 0;
  19  |   const rows: Record<string,unknown>[] = [{ id: '55000000-0000-4000-8000-000000000002', user_id: actor,
  20  |     local_date: '2026-10-13', local_timezone: 'Asia/Ho_Chi_Minh', energy_level: 2, body_status: 'none_now',
  21  |     capture_type: 'standalone', idempotency_key: '90000000-0000-4000-8000-000000000002', overall_note: null,
  22  |     created_at: '2026-10-13T01:00:00Z', updated_at: '2026-10-13T01:00:00Z' }];
  23  |   await page.addInitScript(({storageKey,value})=>{
  24  |     if (!localStorage.getItem(storageKey)) localStorage.setItem(storageKey, JSON.stringify(value));
  25  |   }, {storageKey,value:session()});
  26  |   await page.route('https://*.supabase.co/**', route=>{unexpected.push('forbidden-staging-host');return route.abort('blockedbyclient');});
  27  |   await page.route(origin+'/**', async route=>{
  28  |     const req=route.request(), path=new URL(req.url()).pathname;
  29  |     if (req.headers().authorization !== 'Bearer fictional-diagnostic-b') {
  30  |       unexpected.push('non-fixture-actor');return route.fulfill({status:401,json:{message:'Fixture actor required'}});
  31  |     }
  32  |     if (path.endsWith('/profiles') && req.method()==='GET') {
  33  |       profileReads++;return route.fulfill({json:{user_id:actor,display_name:'Diagnostic B',locale:'vi-VN',body_display_preference:'neutral'}});
  34  |     }
  35  |     if (path.endsWith('/get_my_consent_state')) return route.fulfill({json:{...emptyConsentState,terms:true,privacy:true,wellbeing_data:true}});
  36  |     if (path.endsWith('/get_my_consent_policy_versions')) return route.fulfill({json:CONSENT_POLICY_VERSIONS});
  37  |     if (path.endsWith(writer)) {
  38  |       expect(req.method()).toBe('POST');const body=req.postDataJSON();saves.push(body);
  39  |       expect(body.p_expected_user_id).toBe(actor);
  40  |       return route.fulfill({json:[{checkin_id:'55000000-0000-4000-8000-000000000003',created_at:'2026-10-13T02:00:00Z'}]});
  41  |     }
  42  |     if (path.endsWith('/checkins') || path.endsWith('/checkin_observations')) {
  43  |       if (req.method() !== 'GET') {
  44  |         unexpected.push('forbidden-direct-table-mutation');
  45  |         return route.fulfill({status:403,json:{message:'Diagnostic forbids direct table mutation'}});
  46  |       }
  47  |       return route.fulfill({json:path.endsWith('/checkins')?rows:[]});
  48  |     }
  49  |     if (path.endsWith('/user') && req.method()==='GET') return route.fulfill({json:session().user});
  50  |     if (path.endsWith('/mcy-ai-assistant')) {
  51  |       if (req.method() !== 'POST' || req.postDataJSON()?.action !== 'capability') {
  52  |         unexpected.push('forbidden-ai-selection-or-inference');
  53  |         return route.fulfill({status:403,json:{message:'Diagnostic permits only capability read'}});
  54  |       }
  55  |       return route.fulfill({json:{available:false,contractVersion:'reviewed-practice-1'}});
  56  |     }
  57  |     unexpected.push('unexpected-fixture-request');return route.fulfill({status:500,json:{message:'Unexpected fixture request'}});
  58  |   });
  59  |   return {saves,unexpected,rows,reads:()=>profileReads};
  60  | }
  61  | const nav = (p:Page,name:string)=>p.locator('[data-testid="flow-fixed-footer"]').getByRole('button',{name,exact:true});
  62  | async function ready(page:Page) {
> 63  |   await nav(page,'Cá nhân').click();
      |                             ^ Error: locator.click: Test timeout of 20000ms exceeded.
  64  |   await expect(page.locator('.mcy-account-home h1')).toHaveText('Chào, Diagnostic B.');
  65  | }
  66  | async function journey(page:Page) {
  67  |   await nav(page,'Hành trình').click();
  68  |   await expect(page.getByRole('heading',{name:'Hành trình của bạn',exact:true})).toBeVisible();
  69  | }
  70  | async function observeBoundedNoWriteWindow(page:Page) {
  71  |   await page.evaluate(()=>new Promise<void>(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>resolve()))));
  72  |   // Intentional bounded negative observation, after explicit response/session
  73  |   // completion. Not an assertion that no request can ever happen in the future.
  74  |   await page.waitForTimeout(1000);
  75  | }
  76  | test('acknowledged history reload, session hydration and Journey viewing do not initiate a write',async({page})=>{
  77  |   const f=await fixture(page);const prior=JSON.stringify(f.rows);
  78  |   await page.goto('/?mode=web');await ready(page);await journey(page);
  79  |   await page.reload();await ready(page);await journey(page);
  80  |   const before=f.reads();
  81  |   const observationsResponse=page.waitForResponse(response=>response.url().startsWith(origin+'/')
  82  |     && new URL(response.url()).pathname.endsWith('/checkin_observations') && response.request().method()==='GET');
  83  |   await page.evaluate(({storageKey,value})=>{
  84  |     const channel=new BroadcastChannel(storageKey);channel.postMessage({event:'TOKEN_REFRESHED',session:value});channel.close();
  85  |     window.dispatchEvent(new Event('focus'));document.dispatchEvent(new Event('visibilitychange'));
  86  |   },{storageKey,value:session()});
  87  |   await expect.poll(()=>f.reads()).toBeGreaterThan(before);
  88  |   await (await observationsResponse).finished();
  89  |   await observeBoundedNoWriteWindow(page);
  90  |   expect(f.saves).toHaveLength(0);expect(JSON.stringify(f.rows)).toBe(prior);expect(f.unexpected).toEqual([]);
  91  | });
  92  | 
  93  | test('navigation away before account-bound client preparation completes must prevent a late save dispatch',async({page})=>{
  94  |   const f=await fixture(page);await page.goto('/?mode=web');await ready(page);await nav(page,'Hôm nay').click();
  95  |   const start=page.locator('[data-testid="flow-current"] [data-flow-route="home"][data-flow-active="true"]').getByRole('button',{name:/^(Bắt đầu check-in|Ghi nhận hôm nay)$/});
  96  |   await expect(start).toHaveCount(1);await start.click();
  97  |   await page.getByRole('button',{name:'Không thấy khó chịu',exact:true}).click();
  98  |   await page.getByRole('button',{name:'Tiếp: năng lượng và thời gian'}).click();
  99  |   await page.getByRole('button',{name:'Bình thường',exact:true}).click();
  100 |   await page.evaluate(async()=>{
  101 |     // Replace one method only inside this isolated browser context. The same Vite
  102 |     // module/client is used by the app; no source file or physical app is edited.
  103 |     const mod=await import('/src/backend/supabase.ts');
  104 |     const shared=await mod.getSupabaseClient();if(!shared)throw new Error('Fixture client missing');
  105 |     const original=shared.auth.getSession.bind(shared.auth);
  106 |     const scope=window as unknown as {__mcyDiagnosticHeld:boolean;__mcyDiagnosticSessionReturned:boolean;__mcyDiagnosticRelease:()=>void};
  107 |     let release!:()=>void;const gate=new Promise<void>(r=>{release=r;});
  108 |     scope.__mcyDiagnosticHeld=false;scope.__mcyDiagnosticSessionReturned=false;scope.__mcyDiagnosticRelease=release;
  109 |     shared.auth.getSession=async()=>{
  110 |       shared.auth.getSession=original;scope.__mcyDiagnosticHeld=true;await gate;
  111 |       const result=await original();scope.__mcyDiagnosticSessionReturned=true;return result;
  112 |     };
  113 |   });
  114 |   await page.getByRole('button',{name:'Chỉ ghi lại cảm nhận hôm nay, không chọn bài',exact:true}).click();
  115 |   await expect.poll(()=>page.evaluate(()=>(window as unknown as {__mcyDiagnosticHeld:boolean}).__mcyDiagnosticHeld)).toBe(true);
  116 |   expect(f.saves).toHaveLength(0);
  117 |   await page.getByRole('button',{name:'Quay lại',exact:true}).click();await journey(page);
  118 |   await page.evaluate(()=>(window as unknown as {__mcyDiagnosticRelease:()=>void}).__mcyDiagnosticRelease());
  119 |   await expect.poll(()=>page.evaluate(()=>(window as unknown as {__mcyDiagnosticSessionReturned:boolean}).__mcyDiagnosticSessionReturned)).toBe(true);
  120 |   await observeBoundedNoWriteWindow(page);
  121 |   expect(f.unexpected).toEqual([]);
  122 |   expect(f.saves,'An explicit save whose originating route was left before dispatch must be cancelled').toHaveLength(0);
  123 | });
  124 | 
```