import { expect, test, type Page } from '@playwright/test';
import { CONSENT_POLICY_VERSIONS, emptyConsentState } from '../../src/backend/learnerData';

// Diagnostic desired contracts, outside the normal suite. Fictional web UI only;
// no native lifecycle/incident reproduction or deployed fix is claimed.
const origin = 'https://mcy-playwright.invalid';
const storageKey = 'sb-mcy-playwright-auth-token';
const actor = '77777777-7777-4777-8777-777777777777';
const writer = '/save_my_checkin_for_current_user_with_current_consent';
function session() {
  return { access_token: 'fictional-diagnostic-b', refresh_token: 'fictional-diagnostic-refresh', token_type: 'bearer',
    expires_at: Math.floor(Date.now()/1000)+3600, expires_in: 3600,
    user: { id: actor, email: 'diagnostic-b@example.test', aud: 'authenticated', role: 'authenticated',
      email_confirmed_at: '2026-01-01T00:00:00Z', app_metadata: {}, user_metadata: {}, identities: [], created_at: '2026-01-01T00:00:00Z' } };
}
async function fixture(page: Page) {
  const saves: Record<string,unknown>[] = [], unexpected: string[] = [];
  let profileReads = 0;
  const rows: Record<string,unknown>[] = [{ id: '55000000-0000-4000-8000-000000000002', user_id: actor,
    local_date: '2026-10-13', local_timezone: 'Asia/Ho_Chi_Minh', energy_level: 2, body_status: 'none_now',
    capture_type: 'standalone', idempotency_key: '90000000-0000-4000-8000-000000000002', overall_note: null,
    created_at: '2026-10-13T01:00:00Z', updated_at: '2026-10-13T01:00:00Z' }];
  await page.addInitScript(({storageKey,value})=>{
    if (!localStorage.getItem(storageKey)) localStorage.setItem(storageKey, JSON.stringify(value));
  }, {storageKey,value:session()});
  await page.route('https://*.supabase.co/**', route=>{unexpected.push('forbidden-staging-host');return route.abort('blockedbyclient');});
  await page.route(origin+'/**', async route=>{
    const req=route.request(), path=new URL(req.url()).pathname;
    if (req.headers().authorization !== 'Bearer fictional-diagnostic-b') {
      unexpected.push('non-fixture-actor');return route.fulfill({status:401,json:{message:'Fixture actor required'}});
    }
    if (path.endsWith('/profiles') && req.method()==='GET') {
      profileReads++;return route.fulfill({json:{user_id:actor,display_name:'Diagnostic B',locale:'vi-VN',body_display_preference:'neutral'}});
    }
    if (path.endsWith('/get_my_consent_state')) return route.fulfill({json:{...emptyConsentState,terms:true,privacy:true,wellbeing_data:true}});
    if (path.endsWith('/get_my_consent_policy_versions')) return route.fulfill({json:CONSENT_POLICY_VERSIONS});
    if (path.endsWith(writer)) {
      expect(req.method()).toBe('POST');const body=req.postDataJSON();saves.push(body);
      expect(body.p_expected_user_id).toBe(actor);
      return route.fulfill({json:[{checkin_id:'55000000-0000-4000-8000-000000000003',created_at:'2026-10-13T02:00:00Z'}]});
    }
    if (path.endsWith('/checkins') || path.endsWith('/checkin_observations')) {
      if (req.method() !== 'GET') {
        unexpected.push('forbidden-direct-table-mutation');
        return route.fulfill({status:403,json:{message:'Diagnostic forbids direct table mutation'}});
      }
      return route.fulfill({json:path.endsWith('/checkins')?rows:[]});
    }
    if (path.endsWith('/user') && req.method()==='GET') return route.fulfill({json:session().user});
    if (path.endsWith('/mcy-ai-assistant')) {
      if (req.method() !== 'POST' || req.postDataJSON()?.action !== 'capability') {
        unexpected.push('forbidden-ai-selection-or-inference');
        return route.fulfill({status:403,json:{message:'Diagnostic permits only capability read'}});
      }
      return route.fulfill({json:{available:false,contractVersion:'reviewed-practice-1'}});
    }
    unexpected.push('unexpected-fixture-request');return route.fulfill({status:500,json:{message:'Unexpected fixture request'}});
  });
  return {saves,unexpected,rows,reads:()=>profileReads};
}
const nav = (p:Page,name:string)=>p.locator('[data-testid="flow-fixed-footer"]').getByRole('button',{name,exact:true});
async function ready(page:Page) {
  await nav(page,'Cá nhân').click();
  await expect(page.locator('.mcy-account-home h1')).toHaveText('Chào, Diagnostic B.');
}
async function journey(page:Page) {
  await nav(page,'Hành trình').click();
  await expect(page.getByRole('heading',{name:'Hành trình của bạn',exact:true})).toBeVisible();
}
async function observeBoundedNoWriteWindow(page:Page) {
  await page.evaluate(()=>new Promise<void>(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>resolve()))));
  // Intentional bounded negative observation, after explicit response/session
  // completion. Not an assertion that no request can ever happen in the future.
  await page.waitForTimeout(1000);
}
test('acknowledged history reload, session hydration and Journey viewing do not initiate a write',async({page})=>{
  const f=await fixture(page);const prior=JSON.stringify(f.rows);
  await page.goto('/?mode=web');await ready(page);await journey(page);
  await page.reload();await ready(page);await journey(page);
  const before=f.reads();
  const observationsResponse=page.waitForResponse(response=>response.url().startsWith(origin+'/')
    && new URL(response.url()).pathname.endsWith('/checkin_observations') && response.request().method()==='GET');
  await page.evaluate(({storageKey,value})=>{
    const channel=new BroadcastChannel(storageKey);channel.postMessage({event:'TOKEN_REFRESHED',session:value});channel.close();
    window.dispatchEvent(new Event('focus'));document.dispatchEvent(new Event('visibilitychange'));
  },{storageKey,value:session()});
  await expect.poll(()=>f.reads()).toBeGreaterThan(before);
  await (await observationsResponse).finished();
  await observeBoundedNoWriteWindow(page);
  expect(f.saves).toHaveLength(0);expect(JSON.stringify(f.rows)).toBe(prior);expect(f.unexpected).toEqual([]);
});

test('navigation away before account-bound client preparation completes must prevent a late save dispatch',async({page})=>{
  const f=await fixture(page);await page.goto('/?mode=web');await ready(page);await nav(page,'Hôm nay').click();
  const start=page.locator('[data-testid="flow-current"] [data-flow-route="home"][data-flow-active="true"]').getByRole('button',{name:/^(Bắt đầu check-in|Ghi nhận hôm nay)$/});
  await expect(start).toHaveCount(1);await start.click();
  await page.getByRole('button',{name:'Không thấy khó chịu',exact:true}).click();
  await page.getByRole('button',{name:'Tiếp: năng lượng và thời gian'}).click();
  await page.getByRole('button',{name:'Bình thường',exact:true}).click();
  await page.evaluate(async()=>{
    // Replace one method only inside this isolated browser context. The same Vite
    // module/client is used by the app; no source file or physical app is edited.
    const mod=await import('/src/backend/supabase.ts');
    const shared=await mod.getSupabaseClient();if(!shared)throw new Error('Fixture client missing');
    const original=shared.auth.getSession.bind(shared.auth);
    const scope=window as unknown as {__mcyDiagnosticHeld:boolean;__mcyDiagnosticSessionReturned:boolean;__mcyDiagnosticRelease:()=>void};
    let release!:()=>void;const gate=new Promise<void>(r=>{release=r;});
    scope.__mcyDiagnosticHeld=false;scope.__mcyDiagnosticSessionReturned=false;scope.__mcyDiagnosticRelease=release;
    shared.auth.getSession=async()=>{
      shared.auth.getSession=original;scope.__mcyDiagnosticHeld=true;await gate;
      const result=await original();scope.__mcyDiagnosticSessionReturned=true;return result;
    };
  });
  await page.getByRole('button',{name:'Chỉ ghi lại cảm nhận hôm nay, không chọn bài',exact:true}).click();
  await expect.poll(()=>page.evaluate(()=>(window as unknown as {__mcyDiagnosticHeld:boolean}).__mcyDiagnosticHeld)).toBe(true);
  expect(f.saves).toHaveLength(0);
  await page.getByRole('button',{name:'Quay lại',exact:true}).click();await journey(page);
  await page.evaluate(()=>(window as unknown as {__mcyDiagnosticRelease:()=>void}).__mcyDiagnosticRelease());
  await expect.poll(()=>page.evaluate(()=>(window as unknown as {__mcyDiagnosticSessionReturned:boolean}).__mcyDiagnosticSessionReturned)).toBe(true);
  await observeBoundedNoWriteWindow(page);
  expect(f.unexpected).toEqual([]);
  expect(f.saves,'An explicit save whose originating route was left before dispatch must be cancelled').toHaveLength(0);
});
