import { expect,test,type Page,type Route } from '@playwright/test';
const endpoint='https://mcy-playwright.invalid/functions/v1/';
const A='10000000-0000-4000-8000-000000000001',B='20000000-0000-4000-8000-000000000002';
function session(id=A){return {access_token:`fictional-${id}`,refresh_token:'fictional-refresh',token_type:'bearer',expires_in:3600,expires_at:Math.floor(Date.now()/1000)+3600,
 user:{id,aud:'authenticated',role:'authenticated',email:`${id===A?'a':'b'}@example.test`,email_confirmed_at:'2026-09-01T00:00:00Z',app_metadata:{provider:'email',providers:['email']},user_metadata:{},identities:[],created_at:'2026-09-01T00:00:00Z'}};}
async function seed(page:Page){await page.addInitScript(s=>localStorage.setItem('sb-mcy-playwright-auth-token',JSON.stringify(s)),session());
 await page.route('https://*.supabase.co/**',r=>r.abort('blockedbyclient'));await page.route(endpoint+'teacher-control-plane',r=>r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({drafts:[]})}));}
async function reply(route:Route,result:unknown,status=200){await route.fulfill({status,contentType:'application/json',body:JSON.stringify(status===200?{result}:result)});}
const enrollment={id:'enrollment-synthetic',learner_label:'Fictional learner',course_version_id:'course-synthetic',completed:true,sessions:[{id:'attendance-synthetic',lesson_version_id:'lesson-synthetic'}]};
const base={role:'author',profile:null,documents:[],enrollments:[enrollment]};
test('author saves a lesson, sees version history and submits exact saved version',async({page})=>{
 await seed(page);const calls:Record<string,unknown>[]=[];let saved=false;
 const doc={id:'document-synthetic',kind:'lesson',title:'Synthetic lesson',version_id:'version-synthetic',version_no:1,status:'draft',author_id:A};
 await page.route(endpoint+'teacher-collaboration',async route=>{const body=route.request().postDataJSON();calls.push(body);
  if(body.action==='workspace')return reply(route,{...base,documents:saved?[doc]:[]});
  if(body.action==='save_document'){saved=true;return reply(route,{document_id:doc.id,version_no:1});}
  if(body.action==='read_document')return reply(route,{document_id:doc.id,kind:'lesson',version_id:doc.version_id,version_no:1,status:'draft',payload:{title:doc.title,instruction:'Synthetic instruction',stop_cue:'Pause'},history:[{version_no:1,status:'draft',author_id:A,created_at:'synthetic'}],reviews:[]});
  return reply(route,{status:'submitted'});
 });
 await page.goto('/?workspace=teacher');const panel=page.getByRole('region',{name:'Cộng tác giáo viên riêng tư'});
 await panel.getByRole('button',{name:'Bài học mới',exact:true}).click();await panel.getByLabel('Tiêu đề',{exact:true}).fill('Synthetic lesson');
 await panel.getByLabel('Hướng dẫn thực hành').fill('Synthetic instruction');await panel.getByLabel('Dấu hiệu dừng hoặc điều chỉnh').fill('Pause');
 await panel.getByRole('button',{name:'Lưu phiên bản mới'}).evaluate(button=>{const form=button.closest('form')!;form.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));form.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));});
 await panel.getByRole('button',{name:/Synthetic lesson/}).click();expect(calls.filter(c=>c.action==='save_document')).toHaveLength(1);
 await expect(panel.getByRole('heading',{name:'Lịch sử tác giả và phiên bản'})).toBeVisible();
 await panel.getByRole('button',{name:'Gửi phiên bản đã lưu để review'}).click();
 expect(calls.find(c=>c.action==='submit_document')).toEqual({action:'submit_document',payload:{document_id:doc.id,expected_version:1}});
});
test('teacher saves feedback privately and sends only after an explicit click',async({page})=>{
 await page.setViewportSize({width:375,height:667});
 await seed(page);let rows:unknown[]=[];let sends=0;let savedPayload:Record<string,unknown>|undefined;
 await page.route(endpoint+'teacher-collaboration',async route=>{const b=route.request().postDataJSON();
  if(b.action==='workspace')return reply(route,base);if(b.action==='read_feedback')return reply(route,rows);
  if(b.action==='save_feedback'){savedPayload=b.payload;rows=[{id:'feedback-synthetic',kind:'session',attendance_id:'attendance-synthetic',revision:1,teacher_id:A,body:b.payload.body,provenance:b.payload.provenance,sent_at:null}];return reply(route,{id:'feedback-synthetic',revision:1,sent:false});}
  if(b.action==='send_feedback'){sends++;rows=[{...(rows[0] as object),sent_at:'2026-10-04T00:00:00Z'}];return reply(route,{sent:true});}return reply(route,{});
 });
 await page.goto('/?workspace=teacher');const panel=page.getByRole('region',{name:'Cộng tác giáo viên riêng tư'});
 await panel.getByLabel('Học viên được phân công').selectOption(enrollment.id);await panel.getByLabel('Buổi tập hoặc kết thúc khóa').selectOption('attendance-synthetic');
 await panel.getByLabel('Nhận xét gửi cho học viên').fill('Fictional supportive observation');await panel.getByLabel('Nguồn nội dung').selectOption('ai_assisted_teacher_confirmed');
 await expect(panel.getByRole('button',{name:'Lưu nháp nhận xét'})).toBeDisabled();
 await panel.getByRole('checkbox',{name:/Tôi đã kiểm tra/}).check();await panel.getByRole('button',{name:'Lưu nháp nhận xét'}).click();
 await expect(panel.getByRole('button',{name:'Gửi bản đã lưu v1 cho học viên'})).toBeEnabled();expect(sends).toBe(0);expect(savedPayload?.teacher_confirmed).toBe(true);
 await panel.getByRole('button',{name:'Gửi bản đã lưu v1 cho học viên'}).click();await expect(panel.getByRole('button',{name:'Gửi bản đã lưu v1 cho học viên'})).toBeDisabled();expect(sends).toBe(1);
 await expect(panel.getByText('AI hỗ trợ · giáo viên đã xác nhận', {exact:false})).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth)).toBe(true);
});
test('learner preview exposes sent feedback and no author or enrollment controls',async({page})=>{
 await seed(page);await page.route(endpoint+'teacher-collaboration',route=>{const b=route.request().postDataJSON();return reply(route,b.action==='workspace'?{...base,role:'learner'}:[{id:'sent',kind:'course',attendance_id:null,revision:1,teacher_id:A,body:'Fictional sent feedback',provenance:'human',sent_at:'synthetic'}]);});
 await page.goto('/?workspace=teacher');const panel=page.getByRole('region',{name:'Cộng tác giáo viên riêng tư'});
 await panel.getByLabel('Khóa học của bạn').selectOption(enrollment.id);await expect(panel.getByText('Fictional sent feedback')).toBeVisible();
 await expect(panel.getByRole('button',{name:'Lưu nháp nhận xét'})).toHaveCount(0);await expect(panel.getByRole('button',{name:'Bài học mới'})).toHaveCount(0);
 await expect(panel.getByRole('heading',{name:'Đề xuất mời thêm giáo viên'})).toHaveCount(0);
});
test('revoked feedback permission clears private content',async({page})=>{
 await seed(page);await page.route(endpoint+'teacher-collaboration',route=>reply(route,route.request().postDataJSON().action==='workspace'?base:{error:'collaboration_access_denied'},route.request().postDataJSON().action==='workspace'?200:403));
 await page.goto('/?workspace=teacher');await page.getByLabel('Học viên được phân công').selectOption(enrollment.id);
 await expect(page.getByRole('region',{name:'Cộng tác giáo viên riêng tư'})).toHaveCount(0);
});
test('late prior-account workspace cannot reveal private cohort metadata',async({page})=>{
 await seed(page);let release!:()=>void;const pending=new Promise<void>(r=>release=r);let started!:()=>void;const start=new Promise<void>(r=>started=r);
 await page.route(endpoint+'teacher-collaboration',async route=>{
  if(route.request().headers().authorization?.endsWith(A)){started();await pending;return reply(route,{...base,profile:{display_name:'Private A only',bio:'Private A bio'}});}
  return reply(route,{error:'collaboration_access_denied'},403);
 });
 await page.goto('/?workspace=teacher');await start;
 await page.evaluate(s=>{const key='sb-mcy-playwright-auth-token';localStorage.setItem(key,JSON.stringify(s));const c=new BroadcastChannel(key);c.postMessage({event:'SIGNED_IN',session:s});c.close();},session(B));
 await expect(page.locator('.teacher-account')).toHaveText('b@example.test');release();
 await expect(page.getByRole('region',{name:'Cộng tác giáo viên riêng tư'})).toHaveCount(0);await expect(page.getByText('Private A only')).toHaveCount(0);
});
test('closed collaboration API preserves legacy own-draft fallback',async({page})=>{
 await seed(page);await page.route(endpoint+'teacher-collaboration',route=>reply(route,{error:'collaboration_unavailable'},404));
 await page.goto('/?workspace=teacher');await expect(page.locator('.teacher-editor-empty')).toBeVisible();await expect(page.getByRole('region',{name:'Cộng tác giáo viên riêng tư'})).toHaveCount(0);
});
test('assigned reviewer reads pinned approved lesson and writes in-app course feedback',async({page})=>{
 await seed(page);let decision:unknown;
 const doc={id:'course-review',kind:'course',title:'Synthetic review course',version_id:'course-version',version_no:3,status:'submitted',author_id:B};
 await page.route(endpoint+'teacher-collaboration',route=>{const b=route.request().postDataJSON();
  if(b.action==='workspace')return reply(route,{...base,role:'reviewer',documents:[doc],enrollments:[]});
  if(b.action==='read_document')return reply(route,{document_id:doc.id,kind:'course',version_id:doc.version_id,version_no:3,status:'submitted',payload:{title:doc.title,lesson_version_ids:['pinned-approved']},
   pinned_lessons:[{version_id:'pinned-approved',version_no:2,payload:{title:'Exact approved child',segments:[{instruction:'Exact approved synthetic instruction',stop_cue:'Pause if uncomfortable'}]}}],history:[],reviews:[]});
  decision=b;return reply(route,{status:'changes_requested'});
 });
 await page.goto('/?workspace=teacher');const panel=page.getByRole('region',{name:'Cộng tác giáo viên riêng tư'});
 await panel.getByRole('button',{name:/Synthetic review course/}).click();await expect(panel.getByText('Exact approved child · v2')).toBeVisible();
 await expect(panel.getByText(/Exact approved synthetic instruction/)).toBeVisible();await expect(panel.getByLabel('Tiêu đề',{exact:true})).toBeDisabled();
 await panel.getByLabel('Phản hồi chuyên gia').fill('Synthetic sequencing feedback');await panel.getByRole('button',{name:'Yêu cầu chỉnh sửa'}).click();
 expect(decision).toEqual({action:'review_document',payload:{document_id:doc.id,expected_version:3,decision:'changes_requested',message:'Synthetic sequencing feedback'}});
});
