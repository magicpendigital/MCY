import assert from 'node:assert/strict';
import test from 'node:test';
import {createOwnerControlPlaneHandler} from '../supabase/functions/_shared/ownerControlPlane.ts';
import {validPayload} from '../supabase/functions/_shared/contentWorkspaceContract.ts';
import {videoCatalogItems} from '../supabase/functions/_shared/videoCatalogCandidates.ts';
import {readingUnitCandidates} from '../supabase/functions/_shared/readingUnitCandidates.ts';
import {reviewChecks} from '../supabase/functions/_shared/contentReviewContract.ts';
const actor='55000000-0000-4000-8000-000000000001';
const lesson={youtubeId:'AAAAAAAAAAA',summary:'Fictional summary',durationLabel:'0:43',orientation:'portrait'};
function harness(options={}) {
  const calls=[];
  const handler=createOwnerControlPlaneHandler({
    env:key=>key==='SUPABASE_URL'?'https://mhumbczqrzutdnraafhs.supabase.co':undefined,
    clients:()=>({user:{auth:{getUser:async()=>({data:{user:options.identity===false?null:{id:actor,email_confirmed_at:'2026-10-01'}},error:null})}},server:{rpc:async(name,args)=>{calls.push({name,args});if(options.throwWrite)throw new Error('private failure must not leak');const out=typeof options.rpc==='function'?options.rpc(name,args,calls.length):options.rpc;return out??{data:{item_id:'video-0123456789abcdef',seq:1,content_hash:'a'.repeat(64),unchanged:false},error:null};}}}),
    readModels:async()=>{throw new Error('Content must not call provider');},readJson:(r)=>r.json(),isBodyTooLarge:()=>false,isBodyTimeout:()=>false
  });
  return {calls,run:async(body,token=true)=>{const r=await handler(new Request('https://edge.invalid',{method:'POST',headers:{'content-type':'application/json',...(token?{authorization:'Bearer fictional-only'}:{})},body:JSON.stringify(body)}));return {status:r.status,body:await r.json()};}};
}
const save=(patch={})=>({action:'save_content',kind:'video_lesson',title:'Fictional lesson',payload:lesson,expectedSeq:0,...patch});
const review=(patch={})=>({action:'review_content',itemId:'video-0123456789abcdef',seq:1,expectedRevision:0,decision:'changes_requested',qualification:'Fictional test qualification only',reviewBasis:'Fictional test basis only',rightsBasis:'Fictional rights test only',checklist:Object.fromEntries(reviewChecks.map(k=>[k,false])),...patch});

test('verified identity precedes any content data, and the actor always comes from the token',async()=>{
  const h=harness({identity:false});assert.equal((await h.run({action:'list_content'},false)).status,401);assert.equal(h.calls.length,0);
  const none=harness({identity:false});assert.equal((await none.run({action:'list_content'})).status,401);assert.equal(none.calls.length,0);
  const ok=harness({rpc:{data:{role:'teacher',items:[]},error:null}});
  const r=await ok.run({action:'list_content'});assert.deepEqual([r.status,r.body.published,ok.calls[0].name,ok.calls[0].args.p_actor_id],[200,false,'mcy_content_list',actor]);
  const forged=await harness().run({action:'list_content',actorId:'someone-else'});assert.equal(forged.status,400);
});
test('read validates the item id and version before calling the database',async()=>{
  for(const body of [{action:'read_content'},{action:'read_content',itemId:'Bad Id'},{action:'read_content',itemId:'video-x',seq:0},{action:'read_content',itemId:'video-x',seq:1.5},{action:'read_content',itemId:'video-x',extra:1}]){const h=harness();assert.equal((await h.run(body)).status,400,JSON.stringify(body));assert.equal(h.calls.length,0);}
  const h=harness({rpc:{data:{item_id:'video-x',seq:2,payload:lesson},error:null}});const r=await h.run({action:'read_content',itemId:'video-x',seq:2});assert.deepEqual([r.status,h.calls[0].args.p_seq,h.calls[0].args.p_item_id,r.body.version.seq],[200,2,'video-x',2]);
  const latest=harness();await latest.run({action:'read_content',itemId:'video-x'});assert.equal(latest.calls[0].args.p_seq,null);
});
test('save accepts only strict payloads of authorable kinds, and sends the verified actor',async()=>{
  const bad=[save({payload:{...lesson,youtubeId:'short'}}),save({payload:{...lesson,extra:true}}),save({payload:{...lesson,summary:''}}),save({payload:{...lesson,orientation:'square'}}),save({payload:{...lesson,durationLabel:'43s'}}),save({payload:[]}),save({payload:null}),
    save({kind:'reading_unit',payload:{steps:[]}}),save({kind:'bogus'}),save({title:' '}),save({title:'x'.repeat(201)}),save({expectedSeq:-1}),save({expectedSeq:'0'}),save({expectedSeq:undefined}),save({itemId:'Bad Id'}),save({actorId:actor}),
    save({kind:'course_group',payload:{summary:'s',lessonIds:['not-a-video']}}),save({kind:'course_group',payload:{summary:'s',lessonIds:['video-a','video-a']}}),
    save({kind:'screen_text',payload:{locale:'fr-FR',entries:{a:'b'}}}),save({kind:'screen_text',payload:{locale:'vi-VN',entries:{}}}),save({kind:'screen_text',payload:{locale:'vi-VN',entries:{'Bad Key':'b'}}}),
    save({payload:{...lesson,summary:'x'.repeat(21000)}})];
  for(const body of bad){const h=harness();const r=await h.run(body);assert.equal(r.status,400,JSON.stringify(body).slice(0,80));assert.equal(h.calls.length,0);}
  const good=harness();const r=await good.run(save({itemId:'video-0123456789abcdef',expectedSeq:2,title:'  Fictional lesson  '}));
  assert.deepEqual([r.status,r.body.published,good.calls[0].name,good.calls[0].args.p_actor_id,good.calls[0].args.p_title,good.calls[0].args.p_expected_seq],[200,false,'mcy_content_save_version',actor,'Fictional lesson',2]);
  const fresh=harness();await fresh.run(save());assert.equal(fresh.calls[0].args.p_item_id,null);
  for(const kind of ['course_group','screen_text']){const payload=kind==='course_group'?{summary:'Fictional group',lessonIds:['video-a-01'],guidance:{reviewed:false,benefits:['b'],cautions:['c']}}:{locale:'vi-VN',entries:{greeting:'Xin chào'}};const h=harness();assert.equal((await h.run(save({kind,payload}))).status,200,kind);}
});
test('database refusals map to stable codes and never leak details',async()=>{
  const cases=[[{code:'PT409',message:'content_conflict'},409,'content_conflict'],[{code:'PT429',message:'content_limit_reached'},429,'content_limit_reached'],
    [{code:'42501',message:'content_kind_not_allowed'},403,'content_kind_not_allowed'],[{code:'42501',message:'teacher_content_is_reviewed_not_edited'},403,'teacher_content_is_reviewed_not_edited'],
    [{code:'42501',message:'owner_access_required'},403,'owner_access_required'],[{code:'42501',message:'Private detail'},403,'content_access_required'],
    [{code:'22023',message:'content_item_not_found'},404,'content_item_not_found'],[{code:'22023',message:'content_not_submitted'},409,'content_not_submitted'],[{code:'22023',message:'Private detail'},400,'invalid_content'],
    [{code:'XX000',message:'Private detail'},503,'content_result_uncertain'],[undefined,503,'content_result_uncertain']];
  for(const [error,status,code] of cases){const h=harness({rpc:{data:error?null:'not an object',error:error??null}});const r=await h.run(save());assert.deepEqual([r.status,r.body.error],[status,code]);assert.ok(!JSON.stringify(r.body).includes('Private'));}
  const thrown=await harness({throwWrite:true}).run(save()).catch(e=>e);assert.ok(thrown instanceof Error||thrown.status>=500);
});
test('submit and review validate first; a decision never publishes or enables AI',async()=>{
  for(const body of [{action:'submit_content',itemId:'video-x'},{action:'submit_content',itemId:'video-x',expectedSeq:0},{action:'submit_content',itemId:'Bad',expectedSeq:1}]){const h=harness();assert.equal((await h.run(body)).status,400);assert.equal(h.calls.length,0);}
  const sub=harness();const s=await sub.run({action:'submit_content',itemId:'video-x',expectedSeq:3});assert.deepEqual([s.status,sub.calls[0].name,sub.calls[0].args.p_expected_seq,s.body.published],[200,'mcy_content_submit',3,false]);
  const cases=[review({actorId:actor}),review({seq:0}),review({expectedRevision:-1}),review({decision:'published'}),review({qualification:' '}),review({rightsBasis:'short'}),review({checklist:{...review().checklist,extra:true}}),review({checklist:{...review().checklist,rightsConfirmed:'true'}}),review({itemId:'Bad Id'})];
  for(const body of cases){const h=harness();assert.equal((await h.run(body)).status,400,JSON.stringify(body).slice(0,60));assert.equal(h.calls.length,0);}
  const ok=harness({rpc:{data:{decision:'changes_requested',revision:1,published:false},error:null}});const r=await ok.run(review());
  assert.deepEqual([r.status,r.body.published,r.body.aiEnabled,ok.calls[0].name,ok.calls[0].args.p_actor_id,ok.calls[0].args.p_seq],[200,false,false,'mcy_content_review_item',actor,1]);
  const teacher=harness({rpc:{data:null,error:{code:'42501',message:'owner_access_required'}}});assert.deepEqual((await teacher.run(review())).body,{error:'owner_access_required'});
});
test('import_catalog records readings with their registry hashes and videos without one, counts results, and stops on the first refusal',async()=>{
  const h=harness({rpc:(name,args,n)=>({data:{item_id:args.p_item_id,unchanged:n%5===0},error:null})});
  const r=await h.run({action:'import_catalog'});
  const total=readingUnitCandidates.length+videoCatalogItems.length;
  assert.deepEqual([r.status,r.body.total,r.body.created+r.body.unchanged,r.body.published],[200,total,total,false]);
  assert.equal(h.calls.length,total);assert.ok(h.calls.every(c=>c.name==='mcy_content_import'&&c.args.p_actor_id===actor));
  for(const c of readingUnitCandidates){const call=h.calls.find(x=>x.args.p_item_id===c.id);assert.deepEqual([call.args.p_kind,call.args.p_trusted_hash],['reading_unit',c.version]);}
  assert.ok(h.calls.filter(x=>x.args.p_kind!=='reading_unit').every(x=>x.args.p_trusted_hash===null));
  assert.deepEqual(new Set(h.calls.map(c=>c.args.p_kind)),new Set(['reading_unit','video_lesson','course_group']));
  const stop=harness({rpc:(name,args,n)=>n===1?{data:null,error:{code:'42501',message:'owner_access_required'}}:{data:{unchanged:false},error:null}});
  const denied=await stop.run({action:'import_catalog'});assert.deepEqual([denied.status,denied.body.error,denied.body.created,stop.calls.length],[403,'owner_access_required',0,1]);
  assert.equal((await harness().run({action:'import_catalog',extra:1})).status,400);
});
test('the prepared video catalogue is itself valid and internally consistent',()=>{
  const ids=new Set(videoCatalogItems.map(i=>i.id));assert.equal(ids.size,videoCatalogItems.length);
  const lessons=videoCatalogItems.filter(i=>i.kind==='video_lesson'),groups=videoCatalogItems.filter(i=>i.kind==='course_group');
  assert.deepEqual([lessons.length,groups.length],[38,3]);
  for(const item of videoCatalogItems){assert.ok(validPayload(item.kind,item.payload),item.id);assert.ok(item.id.startsWith(item.kind==='video_lesson'?'video-':'group-'));assert.ok(JSON.stringify(item.payload).length<24000);}
  for(const g of groups)for(const id of g.payload.lessonIds)assert.ok(ids.has(id),`${g.id} -> ${id}`);
  assert.equal(new Set(lessons.map(l=>l.payload.youtubeId)).size,38);
});
