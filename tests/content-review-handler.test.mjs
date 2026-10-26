import assert from 'node:assert/strict';
import test from 'node:test';
import {createOwnerControlPlaneHandler} from '../supabase/functions/_shared/ownerControlPlane.ts';
import {contentReviewCandidates} from '../supabase/functions/_shared/contentReviewCandidates.ts';
import {readingUnitCandidates} from '../supabase/functions/_shared/readingUnitCandidates.ts';
import {reviewChecks} from '../supabase/functions/_shared/contentReviewContract.ts';
const actor='44000000-0000-4000-8000-000000000001',teacher='44000000-0000-4000-8000-000000000002';
const candidate=contentReviewCandidates[0];
const item={candidate_id:candidate.id,content_version:candidate.version,state:{revision:0,decision:'pending'},assignments:[]};
const queue={can_assign:true,items:[item],eligible_reviewers:[]};
function harness(options={}) {
  const calls=[];
  const handler=createOwnerControlPlaneHandler({
    env:key=>key==='SUPABASE_URL'?'https://mhumbczqrzutdnraafhs.supabase.co':undefined,
    clients:()=>({user:{auth:{getUser:async()=>({data:{user:options.identity===false?null:{id:actor,email_confirmed_at:'2026-10-01'}},error:null})}},server:{rpc:async(name,args)=>{calls.push({name,args});if(name==='mcy_content_review_read')return options.read??{data:queue,error:null};if(options.throwWrite)throw new Error('private failure must not leak');return options.write??{data:{candidate_id:candidate.id,content_version:candidate.version,revision:1,published:false},error:null};}}}),
    readModels:async()=>{throw new Error('Review must not call provider');},readJson:(r)=>r.json(),isBodyTooLarge:()=>false,isBodyTimeout:()=>false
  });
  return {calls,run:async(body,token=true)=>{const r=await handler(new Request('https://edge.invalid',{method:'POST',headers:{'content-type':'application/json',...(token?{authorization:'Bearer fictional-only'}:{})},body:JSON.stringify(body)}));return {status:r.status,body:await r.json()};}};
}
const save=(patch={})=>({action:'save_content_review',candidateId:candidate.id,contentVersion:candidate.version,expectedRevision:0,decision:'changes_requested',qualification:'Fictional test qualification only',reviewBasis:'Fictional test basis only',rightsBasis:'Fictional rights test only',checklist:Object.fromEntries(reviewChecks.map(k=>[k,false])),...patch});
const assignment=(patch={})=>({action:'assign_content_reviewer',candidateId:candidate.id,contentVersion:candidate.version,expectedRevision:0,reviewerId:teacher,active:true,expiresInDays:7,...patch});
test('verified identity and staging server admission precede any review data',async()=>{
  for(const options of [{identity:false},{}]){const h=harness(options);assert.equal((await h.run({action:'read_content_review'},options.identity===false)).status,401);assert.equal(h.calls.length,0);}
  const h=harness({read:{data:null,error:{code:'42501',message:'Private detail'}}});assert.deepEqual(await h.run({action:'read_content_review'}),{status:403,body:{error:'content_review_access_required'}});
  const missing=harness({read:{data:null,error:{code:'PGRST202'}}});assert.equal((await missing.run(save())).status,503);assert.equal(missing.calls.length,1);
});
test('read sends fixed metadata to server and only admitted candidate versions back',async()=>{
  const h=harness({read:{data:{...queue,can_assign:false,items:[]},error:null}});const r=await h.run({action:'read_content_review'});assert.deepEqual(r.body.candidates,[]);
  assert.equal(h.calls[0].args.p_actor_id,actor);assert.deepEqual(h.calls[0].args.p_candidates,[...contentReviewCandidates,...readingUnitCandidates].map(c=>({id:c.id,scope:c.scope,title:c.title,version:c.version})));
  const yes=await harness().run({action:'read_content_review'});assert.deepEqual(yes.body.candidates,[candidate]);
});
test('forged actor/version/metadata and nonboolean checklist fail before any write',async()=>{
  const cases=[save({actorId:teacher}),save({contentVersion:'f'.repeat(64)}),save({expectedRevision:-1}),save({qualification:' '}),save({checklist:{...save().checklist,rightsConfirmed:'true'}}),save({checklist:{...save().checklist,extra:true}}),assignment({expiresInDays:31}),assignment({active:'true'}),assignment({reviewerId:'fake'}),assignment({scope:'global'})];
  for(const body of cases){const h=harness();assert.equal((await h.run(body)).status,400);assert.equal(h.calls.filter(c=>c.name!=='mcy_content_review_read').length,0);}
});
test('assigned teacher can save only admitted fixed version; only Owner can assign',async()=>{
  const h=harness({read:{data:{...queue,can_assign:false},error:null}});assert.equal((await h.run(save())).status,200);assert.equal(h.calls[1].args.p_actor_id,actor);
  const forbidden=harness({read:{data:{...queue,can_assign:false},error:null}});assert.equal((await forbidden.run(assignment())).status,403);assert.equal(forbidden.calls.length,1);
  const hidden=harness({read:{data:{...queue,items:[]},error:null}});assert.equal((await hidden.run(save())).status,403);assert.equal(hidden.calls.length,1);
  const allowed=harness();const r=await allowed.run(assignment());assert.equal(r.status,200);assert.equal(allowed.calls[1].name,'mcy_content_reviewer_assign');assert.equal(allowed.calls[1].args.p_expires_in_days,7);assert.equal(r.body.aiEnabled,false);assert.equal(r.body.published,false);
});
test('SQL conflict, revoked access, cap and validation are sanitized; unknown outcomes never retry',async()=>{
  for(const [code,status] of [['PT409',409],['42501',403],['PT429',429],['22023',400],['unknown',503]]){const h=harness({write:{data:null,error:{code,message:'Sensitive SQL detail'}}});const r=await h.run(save());assert.equal(r.status,status);assert.equal(JSON.stringify(r).includes('Sensitive'),false);assert.equal(h.calls.length,2);}
  const h=harness({throwWrite:true});const r=await h.run(save());assert.equal(r.status,503);assert.equal(JSON.stringify(r).includes('private failure'),false);assert.equal(h.calls.length,2);
});

const reading=readingUnitCandidates[0];
const readingItem={candidate_id:reading.id,content_version:reading.version,state:{revision:0,decision:'pending'},assignments:[]};
const readingSave=(patch={})=>({...save(),candidateId:reading.id,contentVersion:reading.version,decision:'approved',checklist:{...save().checklist,...Object.fromEntries(reviewChecks.map(k=>[k,true])),vietnameseAudioReady:false,actualDurationChecked:false},...patch});
test('reading units are private drafts: 14 server-only candidates with exact hashes and no learner exposure',()=>{
  assert.equal(readingUnitCandidates.length,14);
  assert.equal(new Set(readingUnitCandidates.map(c=>c.id)).size,14);
  for(const c of readingUnitCandidates){
    assert.match(c.id,/^reading-[a-z0-9-]+$/);assert.match(c.version,/^[a-f0-9]{64}$/);assert.equal(c.scope,'learning_reading');
    assert.ok(c.unit.steps.length>0&&c.title.length<=200);
    assert.deepEqual(Object.keys(c).sort(),['id','scope','title','unit','version']);
  }
});
test('an admitted reading unit is returned with its content; metadata sent to the database stays fixed',async()=>{
  const h=harness({read:{data:{...queue,items:[item,readingItem]},error:null}});const r=await h.run({action:'read_content_review'});
  assert.equal(r.status,200);assert.deepEqual(r.body.candidates.map(c=>c.id).sort(),[candidate.id,reading.id].sort());
  assert.equal(r.body.candidates.find(c=>c.id===reading.id).unit.unitId,reading.unit.unitId);
  assert.equal(h.calls[0].args.p_candidates.every(c=>Object.keys(c).sort().join()==='id,scope,title,version'),true);
  const hidden=harness();const none=await hidden.run({action:'read_content_review'});assert.equal(none.body.candidates.some(c=>c.id===reading.id),false);
});
test('a reading unit approval needs no audio/duration checks and sends only fixed metadata',async()=>{
  const h=harness({read:{data:{...queue,items:[readingItem]},error:null}});const r=await h.run(readingSave());
  assert.equal(r.status,200);const call=h.calls.find(c=>c.name==='mcy_content_review_save');
  assert.deepEqual(call.args.p_candidate,{id:reading.id,version:reading.version,scope:'learning_reading',title:reading.title});
  assert.equal(call.args.p_decision,'approved');assert.equal(call.args.p_expected_revision,0);
  const forged=harness({read:{data:{...queue,items:[readingItem]},error:null}});assert.equal((await forged.run(readingSave({contentVersion:'e'.repeat(64)}))).status,400);
  assert.equal(forged.calls.some(c=>c.name==='mcy_content_review_save'),false);
});
