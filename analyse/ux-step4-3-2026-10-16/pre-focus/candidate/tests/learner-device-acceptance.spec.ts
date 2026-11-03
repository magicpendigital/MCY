import { expect, test, type Page } from '@playwright/test';
import { CONSENT_POLICY_VERSIONS, emptyConsentState } from '../src/backend/learnerData';

// Web fixtures exercise the shared source; they do not claim physical native or
// real staging acceptance. The runner owns Vite with mcy-playwright.invalid.
const origin = 'https://mcy-playwright.invalid';
const key = 'sb-mcy-playwright-auth-token';
const A = '11111111-1111-4111-8111-111111111111';
const B = '77777777-7777-4777-8777-777777777777';
const writer = '/save_my_checkin_for_current_user_with_current_consent';
function session(id = A) {
  return { access_token: id === A ? 'fictional-device-a' : 'fictional-device-b', refresh_token: 'fictional-device-refresh',
    token_type: 'bearer', expires_at: Math.floor(Date.now()/1000)+3600, expires_in: 3600,
    user: { id, email: id === A ? 'device-a@example.test' : 'device-b@example.test', aud: 'authenticated', role: 'authenticated',
      email_confirmed_at: '2026-01-01T00:00:00Z', app_metadata: {}, user_metadata: {}, identities: [], created_at: '2026-01-01T00:00:00Z' } };
}
async function switchActor(page: Page, id: string) {
  await page.evaluate(({key, value}) => {
    localStorage.setItem(key, JSON.stringify(value));
    const channel = new BroadcastChannel(key); channel.postMessage({event:'SIGNED_IN',session:value}); channel.close();
  }, {key, value:session(id)});
}
async function backend(page: Page) {
  const consent = new Map([A,B].map(id=>[id,{...emptyConsentState,terms:true,privacy:true,wellbeing_data:true}]));
  const rows = new Map<string, Record<string,unknown>[]>([[A,[]],[B,[]]]);
  const consentWrites: {actor:string;body:Record<string,unknown>}[] = [];
  const saves: {actor:string;body:Record<string,unknown>}[] = [];
  const reads = new Map([[A,0],[B,0]]);
  const unexpected: string[] = [];
  await page.addInitScript(({key,value})=>{
    if(!localStorage.getItem(key)) localStorage.setItem(key,JSON.stringify(value));
  },{key,value:session()});
  await page.route('https://*.supabase.co/**',route=>{unexpected.push('forbidden-staging-host');return route.abort('blockedbyclient');});
  await page.route(origin+'/**',async route=>{
    const request=route.request(), pathname=new URL(request.url()).pathname;
    const authorization=request.headers().authorization;
    const actor=authorization==='Bearer fictional-device-a'?A:authorization==='Bearer fictional-device-b'?B:null;
    if(!actor){unexpected.push('missing-fictional-actor');return route.fulfill({status:401,json:{message:'Fixture actor required'}});}
    const state=consent.get(actor)!;
    if(pathname.endsWith('/profiles')) {
      expect(request.method()).toBe('GET'); reads.set(actor,reads.get(actor)!+1);
      return route.fulfill({json:{user_id:actor,display_name:actor===A?'Device Fixture A':'Device Fixture B',locale:'vi-VN',body_display_preference:'neutral'}});
    }
    if(pathname.endsWith('/get_my_consent_state')) return route.fulfill({json:{...state}});
    if(pathname.endsWith('/get_my_consent_policy_versions')) return route.fulfill({json:CONSENT_POLICY_VERSIONS});
    if(pathname.endsWith('/record_my_consent')) {
      const body=request.postDataJSON();consentWrites.push({actor,body});
      expect(body.p_policy_version).toBe(CONSENT_POLICY_VERSIONS[body.p_purpose as keyof typeof CONSENT_POLICY_VERSIONS]);
      state[body.p_purpose as keyof typeof state]=body.p_action==='granted';
      return route.fulfill({json:'fictional-device-event-'+consentWrites.length});
    }
    if(pathname.endsWith(writer)) {
      const body=request.postDataJSON();saves.push({actor,body});expect(body.p_expected_user_id).toBe(actor);
      if(!state.wellbeing_data) return route.fulfill({status:403,json:{code:'42501',message:'Fictional revoked consent'}});
      const actorRows=rows.get(actor)!;
      let row=actorRows.find(row=>row.idempotency_key===body.p_idempotency_key);
      if(!row){row={id:actor===A?'55000000-0000-4000-8000-000000000001':'55000000-0000-4000-8000-000000000002',user_id:actor,
        local_date:body.p_local_date,local_timezone:body.p_local_timezone,energy_level:body.p_energy_level,body_status:body.p_body_status,
        capture_type:body.p_capture_type,idempotency_key:body.p_idempotency_key,overall_note:null,created_at:new Date().toISOString(),updated_at:new Date().toISOString()};actorRows.push(row);}
      return route.fulfill({json:[{checkin_id:row.id,created_at:row.created_at}]});
    }
    if(pathname.endsWith('/checkins')) return route.fulfill({json:rows.get(actor)});
    if(pathname.endsWith('/checkin_observations')) return route.fulfill({json:[]});
    if(pathname.endsWith('/user')) return route.fulfill({json:session(actor).user});
    if(pathname.endsWith('/mcy-ai-assistant')) return route.fulfill({json:{available:false,contractVersion:'reviewed-practice-1'}});
    unexpected.push(pathname);return route.fulfill({status:500,json:{message:'Unexpected fixture request'}});
  });
  return {consent,rows,consentWrites,saves,reads,unexpected};
}
const nav = (page:Page,name:string)=>page.locator('[data-testid="flow-fixed-footer"]').getByRole('button',{name,exact:true});
async function account(page:Page,name='Device Fixture A') {
  await nav(page,'Cá nhân').click();
  await expect(page.locator('.mcy-account-home h1')).toHaveText('Chào, '+name+'.');
  await expect(page.getByRole('button',{name:'Đăng xuất thiết bị này',exact:true})).toBeEnabled();
}
async function beginCheckin(page:Page) {
  await nav(page,'Hôm nay').click();
  const start=page.locator('[data-testid="flow-current"] [data-flow-route="home"][data-flow-active="true"]').getByRole('button',{name:/^(Bắt đầu check-in|Ghi nhận hôm nay)$/});
  await expect(start).toHaveCount(1); // Wait for the outgoing retained FlowStack screen to finish its transition.
  await start.click();
  await page.getByRole('button',{name:'Không thấy khó chịu',exact:true}).click();
  await page.getByRole('button',{name:'Tiếp: năng lượng và thời gian'}).click();
  await page.getByRole('button',{name:'Bình thường',exact:true}).click();
}
const saveOnly = (page:Page)=>page.getByRole('button',{name:'Chỉ ghi lại cảm nhận hôm nay, không chọn bài',exact:true});

test('reload restores the saved actor and current consent without writing acceptance again',async({page})=>{
  const fixture=await backend(page);await page.goto('/?mode=web');await account(page);
  await page.reload();await account(page);
  await page.getByRole('button',{name:/Quyền riêng tư và đồng ý/}).click();
  await expect(page.locator('.mcy-toggle-row').filter({hasText:'Lưu check-in trong hành trình'}).getByRole('button')).toHaveAttribute('aria-pressed','true');
  expect(fixture.reads.get(A)).toBeGreaterThanOrEqual(2);
  expect(fixture.consentWrites).toHaveLength(0);expect(fixture.saves).toHaveLength(0);expect(fixture.unexpected).toEqual([]);
});

test('standalone saved check-in is read back in Journey after reload with honest missing reflection',async({page})=>{
  const fixture=await backend(page);await page.goto('/?mode=web');await account(page);await beginCheckin(page);
  await saveOnly(page).click();await expect(page.getByRole('heading',{name:'Hành trình của bạn',exact:true})).toBeVisible();
  expect(fixture.saves).toHaveLength(1);expect(fixture.rows.get(A)).toHaveLength(1);
  expect(fixture.saves[0].body.p_capture_type).toBe('standalone');expect(fixture.saves[0].body.p_body_status).toBe('none_now');
  await page.reload();await account(page);await nav(page,'Hành trình').click();
  await expect(page.getByRole('heading',{name:'Hành trình của bạn',exact:true})).toBeVisible();
  await page.getByRole('button',{name:'Đến gần nhất',exact:true}).click();
  await expect(page.locator('.mcy-snapshot-heading')).toContainText('ĐÃ LƯU TRÊN TÀI KHOẢN');
  await expect(page.locator('.mcy-snapshot-body')).toContainText('Bạn đã ghi nhận không thấy khó chịu tại thời điểm này.');
  await expect(page.locator('.mcy-snapshot-meta')).toHaveCount(0);
  expect(fixture.saves).toHaveLength(1);expect(fixture.rows.get(A)).toHaveLength(1);expect(fixture.unexpected).toEqual([]);
});

test('account switch and reload do not expose the previous actor saved check-in',async({page})=>{
  const fixture=await backend(page);await page.goto('/?mode=web');await account(page);await beginCheckin(page);
  await saveOnly(page).click();await expect(page.getByRole('heading',{name:'Hành trình của bạn',exact:true})).toBeVisible();
  await switchActor(page,B);await expect.poll(()=>fixture.reads.get(B)).toBeGreaterThan(0);await account(page,'Device Fixture B');
  await page.reload();await account(page,'Device Fixture B');await nav(page,'Hành trình').click();
  await expect(page.getByRole('heading',{name:'Hành trình của bạn',exact:true})).toBeVisible();
  expect(fixture.rows.get(B)).toHaveLength(0);
  await expect(page.locator('.mcy-journey-empty')).toBeVisible();
  await expect(page.getByRole('button',{name:'Đến gần nhất',exact:true})).toHaveCount(0);
  await expect(page.locator('.mcy-snapshot-body')).toHaveCount(0);
  await expect(page.getByRole('button',{name:/Xem hành trình mẫu/})).toHaveCount(0);
  await switchActor(page,A);await expect.poll(()=>fixture.reads.get(A)).toBeGreaterThan(1);await account(page);
  expect(fixture.saves).toHaveLength(1);expect(fixture.consentWrites).toHaveLength(0);expect(fixture.unexpected).toEqual([]);
});

test('wellbeing revocation survives reload and prevents a new save request',async({page})=>{
  const fixture=await backend(page);await page.goto('/?mode=web');await account(page);
  await page.getByRole('button',{name:/Quyền riêng tư và đồng ý/}).click();
  const wellbeing=page.locator('.mcy-toggle-row').filter({hasText:'Lưu check-in trong hành trình'});
  await wellbeing.getByRole('button').click();
  await expect(wellbeing.getByRole('button')).toHaveAttribute('aria-pressed','false');
  expect(fixture.consent.get(A)?.wellbeing_data).toBe(false);expect(fixture.consentWrites).toHaveLength(1);
  await page.reload();await account(page);
  await page.getByRole('button',{name:/Quyền riêng tư và đồng ý/}).click();
  await expect(page.locator('.mcy-toggle-row').filter({hasText:'Lưu check-in trong hành trình'}).getByRole('button')).toHaveAttribute('aria-pressed','false');
  await page.getByRole('button',{name:'Quay lại',exact:true}).click();await beginCheckin(page);
  await saveOnly(page).click();
  await expect(page.locator('.mcy-checkin-page')).toBeVisible();
  await expect(page.getByRole('status').filter({hasText:'Check-in chưa được lưu'})).toBeVisible();
  await expect(page.locator('.mcy-checkin-summary')).toContainText('Không thấy khó chịu');
  await expect(page.locator('.mcy-snapshot-body')).toHaveCount(0);
  expect(fixture.saves).toHaveLength(0);expect(fixture.rows.get(A)).toHaveLength(0);expect(fixture.consentWrites).toHaveLength(1);expect(fixture.unexpected).toEqual([]);
});
