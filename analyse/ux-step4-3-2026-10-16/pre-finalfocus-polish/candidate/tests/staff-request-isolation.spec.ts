import { expect, test, type Page, type Route } from '@playwright/test';

const endpoint = 'https://mcy-playwright.invalid/functions/v1/';
const accountA = '22222222-2222-4222-8222-222222222222';
const accountB = '77777777-7777-4777-8777-777777777777';
function session(id = accountA) {
  return {access_token: `fictional-${id}`, refresh_token:'fictional-refresh', token_type:'bearer', expires_in:3600,
    expires_at:Math.floor(Date.now()/1000)+3600, user:{id,aud:'authenticated',role:'authenticated',
      email:`${id === accountA ? 'a' : 'b'}@example.test`, email_confirmed_at:'2026-09-01T00:00:00Z',
      app_metadata:{provider:'email',providers:['email']},user_metadata:{},identities:[],created_at:'2026-09-01T00:00:00Z'}};
}
async function seed(page: Page) {
  await page.addInitScript(value => localStorage.setItem('sb-mcy-playwright-auth-token', JSON.stringify(value)),session());
  await page.route('https://*.supabase.co/**', route => route.abort('blockedbyclient'));
}
async function switchAccount(page: Page) {
  await page.evaluate(value => {
    const key='sb-mcy-playwright-auth-token';
    localStorage.setItem(key,JSON.stringify(value));
    const channel=new BroadcastChannel(key);
    channel.postMessage({event:'SIGNED_IN',session:value});channel.close();
  },session(accountB));
}
async function reply(route: Route, status: number, body: unknown) {
  await route.fulfill({status,contentType:'application/json',body:JSON.stringify(body)});
}
function latch() {
  let release!: () => void;
  const promise=new Promise<void>(resolve => { release=resolve; });
  return {promise,release};
}
async function rendered(page: Page) {
  await page.evaluate(() => new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
}
const config = {enabled:false,model_id:'',system_prompt:'Fictional owner A prompt with more than forty characters.',temperature:0.3,
  max_output_tokens:320,per_user_daily_limit:10,global_daily_limit:100,version_no:1};
const ownerPayload = {config,models:null,gatewayKeyConfigured:false,spendControlApproved:false,enableGateOpen:false,environment:'staging'};
const configB = {...config, system_prompt:'Fictional owner B configuration with more than forty characters.',version_no:8};

for (const scenario of ['legacy Gateway','OpenRouter without approval']) {
  test(`owner keeps AI off for ${scenario} and does not mislabel provider readiness`, async ({page}) => {
    await seed(page);
    const legacy = scenario === 'legacy Gateway';
    await page.route(`${endpoint}owner-control-plane`, route => reply(route,200,{
      ...ownerPayload,
      ...(legacy ? {gatewayKeyConfigured:true,enableGateOpen:true} : {provider:'openrouter',providerKeyConfigured:true}),
      models: legacy ? [{id:'old/model',name:'Legacy catalogue',provider:'Old'}] : null,
    }));
    await page.goto('/?workspace=owner');
    await expect(page.getByRole('heading',{name:'Trợ lý AI đồng hành'})).toBeVisible();
    await expect(page.locator('.owner-switch input')).toBeDisabled();
    await expect(page.locator('.owner-switch input')).not.toBeChecked();
    await expect(page.getByLabel('Model')).toBeDisabled();
    await expect(page.getByText('Legacy catalogue',{exact:false})).toHaveCount(0);
    if(legacy) await expect(page.getByText('Chưa được máy chủ xác nhận',{exact:true})).toBeVisible();
    else await expect(page.getByText('Đã cấu hình khóa phía server',{exact:true})).toBeVisible();
  });
}

test('owner denies a new account without exposing the previous configuration', async ({page}) => {
  await seed(page);
  await page.route(`${endpoint}owner-control-plane`, route => reply(route,
    route.request().headers().authorization?.endsWith(accountA) ? 200 : 403,
    route.request().headers().authorization?.endsWith(accountA) ? ownerPayload : {error:'owner_access_required'}));
  await page.goto('/?workspace=owner');
  await expect(page.locator('.owner-ai-form textarea')).toHaveValue(config.system_prompt);
  await switchAccount(page);
  await expect(page.locator('.owner-session')).toContainText('b@example.test');
  await expect(page.locator('.owner-state-card')).toContainText('Owner');
  await expect(page.locator('.owner-ai-form')).toHaveCount(0);
});

for (const nextAccountAllowed of [false,true]) for (const delayedAction of ['read_ai','save_ai']) {
  test(`a late owner ${delayedAction} cannot overwrite the ${nextAccountAllowed ? 'allowed' : 'denied'} next account`, async ({page}) => {
    await seed(page);
    const started=latch(), pending=latch();
    let saves=0;
    await page.route(`${endpoint}owner-control-plane`, async route => {
      const body=route.request().postDataJSON();
      if (!route.request().headers().authorization?.endsWith(accountA)) return nextAccountAllowed
        ? reply(route,200,{...ownerPayload,config:configB}) : reply(route,403,{error:'owner_access_required'});
      if(body.action==='save_ai') saves++;
      if (body.action===delayedAction) { started.release(); await pending.promise; }
      return reply(route,200,ownerPayload);
    });
    await page.goto('/?workspace=owner');
    if (delayedAction==='save_ai') {
      await expect(page.locator('.owner-ai-form textarea')).toHaveValue(config.system_prompt);
      await page.locator('.owner-ai-form button[type=submit]').click();
    }
    await started.promise;
    if(delayedAction==='save_ai') {
      await page.locator('.owner-ai-form').evaluate(form => {
        form.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));
        form.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));
      });
      await rendered(page);expect(saves).toBe(1);
    }
    await switchAccount(page);
    await expect(page.locator('.owner-session')).toContainText('b@example.test');
    if(nextAccountAllowed) await expect(page.locator('.owner-ai-form textarea')).toHaveValue(configB.system_prompt);
    else await expect(page.locator('.owner-state-card')).toContainText('Owner');
    const response=page.waitForResponse(r => r.url().endsWith('owner-control-plane') && r.status()===200);
    pending.release();await response;await rendered(page);
    if(nextAccountAllowed) await expect(page.locator('.owner-ai-form textarea')).toHaveValue(configB.system_prompt);
    else await expect(page.locator('.owner-ai-form')).toHaveCount(0);
    await expect(page.locator('.owner-success')).toHaveCount(0);
  });
}

for (const selection of ['new','close','existing']) {
  test(`a late teacher save cannot rebind an editor after ${selection} selection`, async ({page}) => {
    await seed(page);
    const started=latch(),pending=latch();
    const saves: Record<string,unknown>[]=[];
    const existingId='66666666-6666-4666-8666-666666666666';
    await page.route(`${endpoint}teacher-control-plane`, async route => {
      const body=route.request().postDataJSON();
      if (body.action==='list_drafts') return reply(route,200,{drafts:selection==='existing' ? [{session_id:existingId,
        version_id:existingId,version_no:7,title:'Existing document B',locale:'vi-VN',status:'draft',updated_at:'2026-10-02T00:00:00Z'}] : []});
      if (body.action==='read_draft') return reply(route,200,{draft:{session_id:existingId,expected_version:7,version_no:7,title:'Existing document B',
        duration_seconds:300,segments:[{position:1,start_ms:0,end_ms:60000,movement_name:'Fictional movement B'}]}});
      if (body.action==='save_draft') {
        saves.push(body.draft);
        if(saves.length===1) {started.release();await pending.promise;}
        return reply(route,200,{draft:{session_id:'44444444-4444-4444-8444-444444444444',
          version_id:'55555555-5555-4555-8555-555555555555',version_no:1,title:body.draft.title,
          locale:'vi-VN',status:'draft',updated_at:'2026-10-02T00:01:00Z'}});
      }
      return reply(route,400,{error:'unsupported_action'});
    });
    await page.goto('/?workspace=teacher');
    await page.locator('.teacher-editor-empty button').click();
    await page.locator('.teacher-editor input[maxlength="120"]').first().fill('Document A');
    await page.locator('.teacher-movement-field input').fill('Fictional movement A');
    await page.locator('.teacher-editor button[type=submit]').click();
    await started.promise;
    if(selection==='close') await page.locator('.teacher-quiet-button').click();
    else if(selection==='existing') await page.locator('.teacher-draft-item').click();
    else await page.locator('.teacher-list-heading button').click();
    if(selection==='existing') await expect(page.locator('.teacher-editor input[maxlength="120"]').first()).toHaveValue('Existing document B');
    const response=page.waitForResponse(r=>r.url().endsWith('teacher-control-plane')&&r.status()===200&&r.request().postDataJSON().action==='save_draft');
    pending.release();await response;await rendered(page);
    await expect(page.locator('.teacher-success')).toHaveCount(0);
    if(selection==='close') { await expect(page.locator('.teacher-editor')).toHaveCount(0);return; }
    if(selection==='new') {
      await page.locator('.teacher-editor input[maxlength="120"]').first().fill('Document B');
      await page.locator('.teacher-movement-field input').fill('Fictional movement B');
    }
    await page.locator('.teacher-editor button[type=submit]').click();
    await expect.poll(()=>saves.length).toBe(2);
    expect(saves[1].session_id).toBe(selection==='existing' ? existingId : null);
    expect(saves[1].expected_version).toBe(selection==='existing' ? 7 : null);
    expect(saves[1].title).toBe(selection==='existing' ? 'Existing document B' : 'Document B');
  });
}

test('a late teacher save cannot repopulate a denied next account', async ({page}) => {
  await seed(page);
  const started=latch(),pending=latch();
  await page.route(`${endpoint}teacher-control-plane`,async route=>{
    const body=route.request().postDataJSON();
    if(!route.request().headers().authorization?.endsWith(accountA)) return reply(route,403,{error:'workspace_access_required'});
    if(body.action==='list_drafts') return reply(route,200,{drafts:[]});
    if(body.action==='save_draft') {
      started.release();await pending.promise;
      return reply(route,200,{draft:{session_id:'44444444-4444-4444-8444-444444444444',
        version_id:'55555555-5555-4555-8555-555555555555',version_no:1,title:'Account A private draft',
        locale:'vi-VN',status:'draft',updated_at:'2026-10-02T00:01:00Z'}});
    }
    return reply(route,400,{error:'unsupported_action'});
  });
  await page.goto('/?workspace=teacher');
  await page.locator('.teacher-editor-empty button').click();
  await page.locator('.teacher-editor input[maxlength="120"]').first().fill('Account A private draft');
  await page.locator('.teacher-movement-field input').fill('Fictional movement');
  await page.locator('.teacher-editor button[type=submit]').click();await started.promise;
  await switchAccount(page);
  await expect(page.locator('.teacher-state-card')).toContainText('Chưa có lời mời');
  const response=page.waitForResponse(r=>r.url().endsWith('teacher-control-plane')&&r.status()===200);
  pending.release();await response;await rendered(page);
  await expect(page.locator('.teacher-editor')).toHaveCount(0);
  await expect(page.getByText('Account A private draft',{exact:true})).toHaveCount(0);
  await expect(page.locator('.teacher-success')).toHaveCount(0);
});

test('repeated submit and out-of-order saves preserve the newest teacher editor', async ({page})=>{
  await seed(page);
  const started=latch(),pending=latch(),saves:Record<string,unknown>[]=[];
  const newId='66666666-6666-4666-8666-666666666666';
  await page.route(`${endpoint}teacher-control-plane`,async route=>{
    const body=route.request().postDataJSON();
    if(body.action==='list_drafts') return reply(route,200,{drafts:[]});
    if(body.action==='save_draft') {
      saves.push(body.draft);const first=saves.length===1;
      if(first){started.release();await pending.promise;}
      return reply(route,200,{draft:{session_id:first ? '44444444-4444-4444-8444-444444444444' : newId,
        version_id:'55555555-5555-4555-8555-555555555555',version_no:first?9:saves.length-1,title:body.draft.title,
        locale:'vi-VN',status:'draft',updated_at:'2026-10-02T00:01:00Z'}});
    }
    return reply(route,400,{error:'unsupported_action'});
  });
  await page.goto('/?workspace=teacher');await page.locator('.teacher-editor-empty button').click();
  await page.locator('.teacher-editor input[maxlength="120"]').first().fill('First draft');
  await page.locator('.teacher-movement-field input').fill('Fictional movement');
  await page.locator('.teacher-editor button[type=submit]').click();await started.promise;
  await page.locator('.teacher-editor').evaluate(form=>{
    form.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));
    form.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));
  });await rendered(page);expect(saves.length).toBe(1);
  // Closing and creating repeatedly supersedes the pending first save.
  await page.locator('.teacher-quiet-button').click();
  await page.locator('.teacher-editor-empty button').click();
  await page.locator('.teacher-list-heading button').click();
  await page.locator('.teacher-editor input[maxlength="120"]').first().fill('Newest draft');
  await page.locator('.teacher-movement-field input').fill('Fictional movement');
  await page.locator('.teacher-editor button[type=submit]').click();
  await expect(page.locator('.teacher-editor-heading')).toContainText('PHIÊN BẢN 1');
  const response=page.waitForResponse(r=>r.url().endsWith('teacher-control-plane')&&r.status()===200&&r.request().postDataJSON().draft?.title==='First draft');
  pending.release();await response;await rendered(page);
  await expect(page.locator('.teacher-editor input[maxlength="120"]').first()).toHaveValue('Newest draft');
  await expect(page.locator('.teacher-editor-heading')).toContainText('PHIÊN BẢN 1');
  await page.locator('.teacher-editor button[type=submit]').click();await expect.poll(()=>saves.length).toBe(3);
  expect(saves[2].session_id).toBe(newId);expect(saves[2].expected_version).toBe(1);
});

for(const workspace of ['owner','teacher'] as const) for(const action of ['read','save'] as const) {
  test(`${workspace} ignores a pending ${action} after component unmount`,async({page})=>{
    await seed(page);const started=latch(),pending=latch();const errors:string[]=[];
    page.on('pageerror',error=>errors.push(error.message));
    const functionName=workspace==='owner'?'owner-control-plane':'teacher-control-plane';
    await page.route(`${endpoint}${functionName}`,async route=>{
      const body=route.request().postDataJSON();
      const isDelayed=workspace==='owner'?body.action===`${action}_ai`:body.action===(action==='read'?'list_drafts':'save_draft');
      if(isDelayed){started.release();await pending.promise;}
      if(workspace==='owner') return reply(route,200,ownerPayload);
      if(body.action==='list_drafts')return reply(route,200,{drafts:[]});
      return reply(route,200,{draft:{session_id:'44444444-4444-4444-8444-444444444444',
        version_id:'55555555-5555-4555-8555-555555555555',version_no:1,title:'Unmounted draft',
        locale:'vi-VN',status:'draft',updated_at:'2026-10-02T00:01:00Z'}});
    });
    await page.route('**/__staff-isolation-fixture',route=>route.fulfill({contentType:'text/html',
      body:'<!doctype html><html><body><div id="staff-fixture"></div></body></html>'}));
    await page.goto('/__staff-isolation-fixture');
    await page.evaluate(async kind=>{
      // The fixture mounts the actual component, then uses React unmount rather than hiding its DOM.
      const {mountWorkspace}=await import('/tests/staff-request-isolation-harness.tsx');
      (window as unknown as {staffRoot:{unmount:()=>void}}).staffRoot=mountWorkspace(kind);
    },workspace);
    if(action==='save') {
      if(workspace==='owner'){
        await expect(page.locator('.owner-ai-form textarea')).toHaveValue(config.system_prompt);
        await page.locator('.owner-ai-form button[type=submit]').click();
      }else{
        await page.locator('.teacher-editor-empty button').click();
        await page.locator('.teacher-editor input[maxlength="120"]').first().fill('Unmounted draft');
        await page.locator('.teacher-movement-field input').fill('Fictional movement');
        await page.locator('.teacher-editor button[type=submit]').click();
      }
    }
    await started.promise;
    await page.evaluate(()=>(window as unknown as {staffRoot:{unmount:()=>void}}).staffRoot.unmount());
    const response=page.waitForResponse(r=>r.url().endsWith(functionName)&&r.status()===200);
    pending.release();await response;await rendered(page);
    await expect(page.locator('#staff-fixture')).toBeEmpty();expect(errors).toEqual([]);
  });
}
