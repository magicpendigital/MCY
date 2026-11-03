import {expect,test,type Page,type Route} from '@playwright/test';
import {contentReviewCandidates} from '../supabase/functions/_shared/contentReviewCandidates';
const endpoint='https://mcy-playwright.invalid/functions/v1/owner-control-plane';
const owner='22222222-2222-4222-8222-222222222222',other='77777777-7777-4777-8777-777777777777',teacher='44444444-4444-4444-8444-444444444444';
const candidate=contentReviewCandidates[0];
const ownerPayload={config:{enabled:false,model_id:'',system_prompt:'Fictional owner configuration with more than forty characters.',temperature:0.3,max_output_tokens:320,per_user_daily_limit:10,global_daily_limit:100,version_no:1},models:null,provider:'openrouter',providerKeyConfigured:false,spendControlApproved:false,enableGateOpen:false,environment:'staging'};
const queue=(revision=0)=>({can_assign:true,items:[{candidate_id:candidate.id,content_version:candidate.version,state:{revision,decision:'pending',qualification:null,review_basis:null,rights_basis:null,checklist:null},assignments:[]}],eligible_reviewers:[{user_id:teacher,label:'Teacher fixture'}]});
const auth=(id=owner)=>({access_token:`fictional-${id}`,refresh_token:'fictional-refresh',token_type:'bearer',expires_in:3600,expires_at:Math.floor(Date.now()/1000)+3600,user:{id,aud:'authenticated',role:'authenticated',email:id===owner?'owner@example.test':'other@example.test',email_confirmed_at:'2026-09-01T00:00:00Z',app_metadata:{provider:'email',providers:['email']},user_metadata:{},identities:[],created_at:'2026-09-01T00:00:00Z'}});
const reply=(route:Route,status:number,body:unknown)=>route.fulfill({status,contentType:'application/json',body:JSON.stringify(body)});
async function setup(page:Page,review:(route:Route)=>Promise<unknown>) {
  await page.addInitScript(s=>localStorage.setItem('sb-mcy-playwright-auth-token',JSON.stringify(s)),auth());
  await page.route('https://*.supabase.co/**',route=>route.abort('blockedbyclient'));
  await page.route(endpoint,route=>route.request().postDataJSON().action==='read_ai'?reply(route,200,ownerPayload):review(route));
  await page.goto('/?workspace=owner');await page.getByRole('button',{name:'Duyệt nội dung',exact:true}).click();
}
async function fill(page:Page) {
  await page.getByLabel('Chuyên môn và phạm vi của người duyệt').fill('Fictional technical fixture, not real expert qualification');
  await page.getByLabel('Căn cứ và nhận xét chuyên môn').fill('Fictional UI review basis only');
  await page.getByLabel('Căn cứ quyền sử dụng nội dung và media').fill('Fictional UI rights basis only');
}
test('Owner sees a draft, explicit unchecked criteria and no AI/publish action',async({page})=>{
  await setup(page,r=>reply(r,200,queue()));await expect(page.getByText('Owner phụ trách duyệt ban đầu.')).toBeVisible();
  await expect(page.getByText('Bản này là bài giới thiệu cách học',{exact:false})).toBeVisible();await expect(page.getByText('Audio mẫu · giọng tổng hợp tiếng Anh.',{exact:false}).first()).toBeVisible();
  await expect(page.getByLabel('Kết quả',{exact:true})).toHaveValue('changes_requested');
  for(const check of await page.locator('.owner-review-checks input').all())await expect(check).not.toBeChecked();
  await expect(page.getByRole('button',{name:'Xuất bản',exact:true})).toHaveCount(0);
  await expect(page.getByLabel('Chuyên môn và phạm vi của người duyệt')).toHaveValue('');
});
test('one save sends exact account/version/revision; success rereads without retry',async({page})=>{
  const saves:Record<string,unknown>[]=[];let revision=0;
  await setup(page,async r=>{const body=r.request().postDataJSON();if(body.action==='read_content_review')return reply(r,200,queue(revision));saves.push(body);revision=1;expect(r.request().headers().authorization).toBe(`Bearer fictional-${owner}`);return reply(r,200,{receipt:{candidate_id:candidate.id,content_version:candidate.version,revision},published:false,aiEnabled:false});});
  await fill(page);await page.getByRole('button',{name:'Ghi kết quả duyệt'}).click();await expect(page.getByText('Đã ghi kết quả duyệt và lịch sử.',{exact:false})).toBeVisible();
  await expect(page.locator('.owner-review-state')).toContainText('revision 1');expect(saves).toHaveLength(1);expect(saves[0].contentVersion).toBe(candidate.version);expect(saves[0].expectedRevision).toBe(0);expect(saves[0]).not.toHaveProperty('actorId');
});
for(const scenario of ['network','conflict','malformed'] as const)test(`${scenario} write blocks repeat until explicit reload`,async({page})=>{
  let saves=0;
  await setup(page,r=>{if(r.request().postDataJSON().action==='read_content_review')return reply(r,200,queue());saves++;if(scenario==='network')return r.abort('failed');return reply(r,scenario==='conflict'?409:200,scenario==='conflict'?{error:'content_review_conflict'}:{receipt:{revision:1}});});
  await fill(page);await page.getByRole('button',{name:'Ghi kết quả duyệt'}).click();await expect(page.getByRole('alert')).toContainText('Tải lại');await expect(page.getByRole('button',{name:'Ghi kết quả duyệt'})).toBeDisabled();expect(saves).toBe(1);
  page.once('dialog',d=>d.accept());await page.getByRole('button',{name:'Tải lại phiếu duyệt'}).click();await expect(page.getByRole('button',{name:'Ghi kết quả duyệt'})).toBeEnabled();expect(saves).toBe(1);
});
test('revoked access hides review details and does not retry',async({page})=>{
  let saves=0;await setup(page,r=>{if(r.request().postDataJSON().action==='read_content_review')return reply(r,200,queue());saves++;return reply(r,403,{error:'content_review_access_required'});});
  await fill(page);await page.getByRole('button',{name:'Ghi kết quả duyệt'}).click();await expect(page.getByRole('alert')).toContainText('quyền duyệt');await expect(page.locator('.mcy-lesson-reader')).toHaveCount(0);await expect(page.getByRole('button',{name:'Ghi kết quả duyệt'})).toHaveCount(0);expect(saves).toBe(1);
});
test('Owner assigns only offered teacher with explicit expiry on exact version',async({page})=>{
  const writes:Record<string,unknown>[]=[];let revision=0;await setup(page,r=>{const body=r.request().postDataJSON();if(body.action==='read_content_review')return reply(r,200,queue(revision));writes.push(body);revision++;return reply(r,200,{receipt:{candidate_id:candidate.id,content_version:candidate.version,revision}});});
  await page.getByLabel('Teacher',{exact:true}).selectOption(teacher);await page.getByLabel('Thời hạn',{exact:true}).selectOption('14');await page.getByRole('button',{name:'Chỉ định teacher',exact:true}).click();await expect(page.getByText('Đã cập nhật quyền cho đúng phiên bản.',{exact:false})).toBeVisible();expect(writes).toEqual([{action:'assign_content_reviewer',candidateId:candidate.id,contentVersion:candidate.version,expectedRevision:0,reviewerId:teacher,active:true,expiresInDays:14}]);
});
test('late review result cannot appear after account switch',async({page})=>{
  let release!:()=>void;const pending=new Promise<void>(r=>release=r);let started!:()=>void;const ready=new Promise<void>(r=>started=r);
  await setup(page,async r=>{const body=r.request().postDataJSON();if(body.action==='read_content_review')return reply(r,200,queue());started();await pending;return reply(r,200,{receipt:{candidate_id:candidate.id,content_version:candidate.version,revision:9}});});
  await fill(page);await page.getByRole('button',{name:'Ghi kết quả duyệt'}).click();await ready;
  await page.evaluate(value=>{const key='sb-mcy-playwright-auth-token';localStorage.setItem(key,JSON.stringify(value));const channel=new BroadcastChannel(key);channel.postMessage({event:'SIGNED_IN',session:value});channel.close();},auth(other));
  await expect(page.locator('.owner-session')).toContainText('other@example.test');release();
  await expect(page.locator('.owner-review-state')).not.toContainText('revision 9');await expect(page.getByText('Đã ghi kết quả duyệt và lịch sử.',{exact:false})).toHaveCount(0);
});
test('assigned teacher review surface hides assignment controls; denied teacher sees no content',async({page})=>{
  await page.addInitScript(s=>localStorage.setItem('sb-mcy-playwright-auth-token',JSON.stringify(s)),auth());
  await page.route('https://*.supabase.co/**',r=>r.abort('blockedbyclient'));
  await page.route('https://mcy-playwright.invalid/functions/v1/teacher-control-plane',r=>reply(r,403,{error:'teacher_access_required'}));
  await page.route('https://mcy-playwright.invalid/functions/v1/teacher-collaboration',r=>reply(r,503,{error:'collaboration_disabled'}));
  let denied=false;await page.route(endpoint,r=>reply(r,denied?403:200,denied?{error:'content_review_access_required'}:{...queue(1),can_assign:false,eligible_reviewers:[]}));
  await page.goto('/?workspace=teacher');await page.getByRole('button',{name:'Duyệt nội dung được giao',exact:true}).click();await expect(page.getByRole('heading',{name:'Nội dung được giao cho bạn duyệt.'})).toBeVisible();await expect(page.locator('.owner-review-assignment')).toHaveCount(0);
  denied=true;page.once('dialog',d=>d.accept());await page.getByRole('button',{name:'Tải lại phiếu duyệt'}).click();await expect(page.getByRole('alert')).toContainText('quyền duyệt');await expect(page.locator('.mcy-lesson-reader')).toHaveCount(0);
});
for(const preset of [{name:'iphone',width:390,height:844},{name:'pixel-10',width:412,height:915}])test(`review controls remain reachable on ${preset.name} mobile web`,async({page})=>{
  await page.setViewportSize({width:preset.width,height:preset.height});await setup(page,r=>reply(r,200,queue()));await expect(page.getByLabel('Chuyên môn và phạm vi của người duyệt')).toBeVisible();
  const overflow=await page.evaluate(()=>document.querySelector('.owner-shell')!.scrollWidth>innerWidth);expect(overflow).toBe(false);
  const submit=page.getByRole('button',{name:'Ghi kết quả duyệt'});await submit.scrollIntoViewIfNeeded();await expect(submit).toBeInViewport();
  const box=await submit.boundingBox();expect(box!.height).toBeGreaterThanOrEqual(48);
  await page.getByRole('button',{name:'Duyệt nội dung',exact:true}).scrollIntoViewIfNeeded();
  // Synthetic authenticated UI screenshot, not evidence of a live Owner save.
  await page.screenshot({path:`analyse/ux-ai-2026-10-10/content-review-fixture-${preset.name}.png`});
});
