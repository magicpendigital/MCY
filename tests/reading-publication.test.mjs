import assert from 'node:assert/strict';
import test from 'node:test';
import {createOwnerControlPlaneHandler} from '../supabase/functions/_shared/ownerControlPlane.ts';
import {readingUnitCandidates} from '../supabase/functions/_shared/readingUnitCandidates.ts';
import {reviewChecks} from '../supabase/functions/_shared/contentReviewContract.ts';
import {evaluateUnit,imageCoverage,internalWording,learnerCaption,projectUnit,syncPublication,unitPath,imagePath,MANIFEST_PATH,PREVIEW_BUCKET,PUBLISHED_BUCKET} from '../supabase/functions/_shared/readingPublication.ts';

const byId=id=>readingUnitCandidates.find(c=>c.id===id);
const cobra=byId('reading-cobra'),lunge=byId('reading-high-lunge'),crow=byId('reading-low-crow');
const actor='55000000-0000-4000-8000-000000000001';
const T0='2026-11-02T01:00:00.000Z',T1='2026-11-02T02:00:00.000Z';
const approved=(...cs)=>cs.map(c=>({candidate_id:c.id,content_version:c.version,reviewed_at:T0}));
const row=(c,patch={})=>({candidate_id:c.id,content_version:c.version,visible:true,text_only_allowed:null,updated_at:T1,...patch});
const snap=(patch={})=>({role:'owner',default_text_only_allowed:false,approved:approved(cobra),rows:[row(cobra)],...patch});

test('real data: images, wording guard and learner projection for all 14 units',()=>{
  const ok=[],held={};
  for(const c of readingUnitCandidates){
    const p=projectUnit(c);
    if(p.ok){
      ok.push(c.id);
      const json=JSON.stringify(p.unit);
      assert.equal(internalWording.test(json),false,c.id);
      // review-only and internal fields never reach learners
      for(const forbidden of ['blockers','entry','exit','readTimeNote','productionStatus','provenance','disclosure','rightsStatus','"path"','stepId'])assert.equal(json.includes(forbidden),false,`${c.id} leaks ${forbidden}`);
      assert.ok(p.unit.stopGuidance.length>0);
      for(const s of p.unit.steps)for(const i of s.images){assert.match(i.sha256,/^[a-f0-9]{64}$/);assert.ok(i.alt.length>=10);}
    }else held[c.id]=p.reason;
  }
  assert.deepEqual(ok.sort(),['reading-cobra','reading-cobra-gentle','reading-cow-face','reading-downward-dog','reading-foundation-cat-cow','reading-foundation-standing','reading-three-legged-dog']);
  // Draft wording inside the body text keeps two illustrated units back until they are rewritten and re-approved.
  assert.equal(held['reading-high-lunge'],'copy_pass');assert.equal(held['reading-warrior-ii'],'copy_pass');
  for(const id of ['reading-kneeling-backbend','reading-low-crow','reading-low-wheel','reading-stand-up','reading-wild-thing-high']){assert.equal(held[id],'copy_pass');assert.equal(imageCoverage(byId(id)).state,'none');}
  assert.equal(imageCoverage(cobra).state,'complete');
});

test('captions: draft markers are stripped, unknown or dirty captions are dropped',()=>{
  assert.equal(learnerCaption('Ảnh AI nháp — Nền nằm sấp để nhận biết phiên bản. Chưa duyệt chuyên môn/quyền.'),'Nền nằm sấp để nhận biết phiên bản.');
  assert.equal(learnerCaption('Bò là một hướng mở nhẹ; chọn khoảng chuyển động phù hợp với bạn.'),'Bò là một hướng mở nhẹ; chọn khoảng chuyển động phù hợp với bạn.');
  assert.equal(learnerCaption('Bản nháp của hình này'),undefined);
  assert.equal(learnerCaption('Ảnh AI nháp — Chưa duyệt chuyên môn/quyền.'),undefined);
  assert.equal(learnerCaption(undefined),undefined);
  const unit=projectUnit(cobra).unit;
  assert.equal(unit.steps[0].images[0].caption,'Nền nằm sấp để nhận biết phiên bản.');
});

test('visibility rule: approved at this version + switch after review + images or text-only allowed + clean wording',()=>{
  assert.equal(evaluateUnit(cobra,snap()).reason,'ok');
  assert.equal(evaluateUnit(cobra,snap({approved:[]})).reason,'not_approved');
  assert.equal(evaluateUnit(cobra,snap({approved:[{candidate_id:cobra.id,content_version:'f'.repeat(64),reviewed_at:T0}]})).reason,'not_approved');
  assert.equal(evaluateUnit(cobra,snap({rows:[]})).reason,'switch_off');
  assert.equal(evaluateUnit(cobra,snap({rows:[row(cobra,{visible:false})]})).reason,'switch_off');
  // a newer review hides the unit until a reviewer switches it on again
  assert.equal(evaluateUnit(cobra,snap({approved:[{candidate_id:cobra.id,content_version:cobra.version,reviewed_at:'2026-11-02T03:00:00.000Z'}]})).reason,'switch_off');
  // text-only units: held by default, then by wording
  const textOnly=s=>evaluateUnit(crow,{...s,approved:approved(crow),rows:[row(crow,s.rowPatch??{})]});
  assert.equal(textOnly(snap()).reason,'needs_images');
  assert.equal(textOnly(snap({default_text_only_allowed:true})).reason,'copy_pass');
  assert.equal(textOnly(snap({rowPatch:{text_only_allowed:true}})).reason,'copy_pass');
  assert.equal(textOnly(snap({default_text_only_allowed:true,rowPatch:{text_only_allowed:false}})).reason,'needs_images');
  assert.equal(evaluateUnit(lunge,{...snap(),approved:approved(lunge),rows:[row(lunge)]}).reason,'copy_pass');
  assert.equal(textOnly(snap()).mode,'inherit');assert.equal(textOnly(snap({rowPatch:{text_only_allowed:true}})).mode,'allow');
});

function fakeStorage(options={}){
  const buckets={[PREVIEW_BUCKET]:new Map(),[PUBLISHED_BUCKET]:new Map()};
  for(const c of readingUnitCandidates)for(const m of c.unit.media)if(m.status==='draft_present')buckets[PREVIEW_BUCKET].set(imagePath(m.sha256),'img');
  const log=[];
  const storage={from(bucket){return {
    copy:async(from,to,o)=>{log.push(['copy',from,o?.destinationBucket]);if(options.copyError&&options.copyError(from))return {data:null,error:{message:'boom',statusCode:'500'}};const dest=buckets[o?.destinationBucket??bucket];if(dest.has(to))return {data:null,error:{message:'The resource already exists',statusCode:'409'}};dest.set(to,buckets[bucket].get(from));return {data:{},error:null};},
    upload:async(path,body,o)=>{log.push(['upload',path,o.cacheControl]);if(options.uploadError&&options.uploadError(path))return {data:null,error:{message:'boom',statusCode:'500'}};buckets[bucket].set(path,body);return {data:{},error:null};},
    download:async path=>{log.push(['download',path]);if(options.downloadError)return {data:null,error:{message:'boom',statusCode:'500'}};const v=buckets[bucket].get(path);return v===undefined?{data:null,error:{message:'Object not found',statusCode:'404'}}:{data:{text:async()=>v},error:null};},
    remove:async paths=>{log.push(['remove',...paths]);for(const p of paths)buckets[bucket].delete(p);return {data:[],error:null};},
  };}};
  return {storage,buckets,log};
}

test('sync copies images, then unit files, and writes the manifest last',async()=>{
  const f=fakeStorage();const r=await syncPublication(f.storage,readingUnitCandidates,snap());
  assert.equal(r.ok,true);assert.deepEqual(r.shown,[cobra.id]);
  const kinds=f.log.map(l=>l[0]);assert.deepEqual(kinds.slice(0,5),['copy','copy','copy','copy','copy']);
  assert.equal(f.log.filter(l=>l[0]==='upload').at(-1)[1],MANIFEST_PATH);
  assert.ok(f.log.findIndex(l=>l[0]==='upload'&&l[1]===unitPath(cobra.id,cobra.version))<f.log.findIndex(l=>l[0]==='upload'&&l[1]===MANIFEST_PATH));
  assert.ok(f.buckets[PUBLISHED_BUCKET].has(unitPath(cobra.id,cobra.version)));
  const manifest=JSON.parse(f.buckets[PUBLISHED_BUCKET].get(MANIFEST_PATH));
  assert.deepEqual(manifest.units.map(u=>[u.id,u.images,u.steps]),[[cobra.id,'complete',5]]);
  assert.equal(manifest.units[0].imageHashes.length,5);
  assert.deepEqual(r.held.find(h=>h.id===lunge.id),{id:lunge.id,reason:'not_approved'});
  // running again is idempotent: already-copied images are not an error
  const again=await syncPublication(f.storage,readingUnitCandidates,snap());assert.equal(again.ok,true);assert.deepEqual(again.shown,[cobra.id]);
});

test('switching a unit off removes its files and images, other units stay',async()=>{
  const f=fakeStorage();const two=byId('reading-cow-face');
  await syncPublication(f.storage,readingUnitCandidates,snap({approved:approved(cobra,two),rows:[row(cobra),row(two)]}));
  assert.equal(JSON.parse(f.buckets[PUBLISHED_BUCKET].get(MANIFEST_PATH)).units.length,2);
  const r=await syncPublication(f.storage,readingUnitCandidates,snap({approved:approved(cobra,two),rows:[row(cobra),row(two,{visible:false})]}));
  assert.deepEqual(r.shown,[cobra.id]);
  const pub=f.buckets[PUBLISHED_BUCKET];
  assert.equal(pub.has(unitPath(two.id,two.version)),false);
  for(const m of two.unit.media)if(m.status==='draft_present')assert.equal(pub.has(imagePath(m.sha256)),false);
  assert.equal(pub.has(unitPath(cobra.id,cobra.version)),true);
  const all=await syncPublication(f.storage,readingUnitCandidates,snap({rows:[]}));assert.deepEqual(all.shown,[]);
  assert.deepEqual(JSON.parse(pub.get(MANIFEST_PATH)).units,[]);assert.equal(pub.has(unitPath(cobra.id,cobra.version)),false);
});

test('a unit whose files cannot be written is left out while withdrawals still go through',async()=>{
  const f=fakeStorage({copyError:from=>from===imagePath(cobra.unit.media[0].sha256)});
  const r=await syncPublication(f.storage,readingUnitCandidates,snap());
  assert.equal(r.ok,true);assert.deepEqual(r.shown,[]);assert.deepEqual(r.held.find(h=>h.id===cobra.id),{id:cobra.id,reason:'media_copy_failed'});
  assert.deepEqual(JSON.parse(f.buckets[PUBLISHED_BUCKET].get(MANIFEST_PATH)).units,[]);
  const u=fakeStorage({uploadError:p=>p.startsWith('units/')});const ur=await syncPublication(u.storage,readingUnitCandidates,snap());
  assert.deepEqual(ur.held.find(h=>h.id===cobra.id),{id:cobra.id,reason:'upload_failed'});
  const m=fakeStorage({uploadError:p=>p===MANIFEST_PATH});assert.deepEqual(await syncPublication(m.storage,readingUnitCandidates,snap()),{ok:false,error:'manifest_write_failed'});
  assert.deepEqual(await syncPublication(undefined,readingUnitCandidates,snap()),{ok:false,error:'storage_unavailable'});
});

test('an unreadable previous manifest is never used to delete anything',async()=>{
  const f=fakeStorage();await syncPublication(f.storage,readingUnitCandidates,snap());
  const bad=fakeStorage({downloadError:true});for(const [k,v] of f.buckets[PUBLISHED_BUCKET])bad.buckets[PUBLISHED_BUCKET].set(k,v);
  const r=await syncPublication(bad.storage,readingUnitCandidates,snap({rows:[]}));assert.equal(r.ok,true);
  assert.equal(bad.log.some(l=>l[0]==='remove'),false);
});

// ---- handler ----
function harness(options={}){
  const calls=[];let snapshot=options.snapshot??snap();
  const f=options.noStorage?{storage:undefined}:fakeStorage();
  const items=options.items??[{candidate_id:cobra.id,content_version:cobra.version,state:{revision:1,decision:'approved'},assignments:[]}];
  const handler=createOwnerControlPlaneHandler({
    env:k=>k==='SUPABASE_URL'?'https://mhumbczqrzutdnraafhs.supabase.co':undefined,
    clients:()=>({user:{auth:{getUser:async()=>({data:{user:{id:actor,email_confirmed_at:'2026-10-01'}},error:null})}},server:{storage:f.storage,rpc:async(name,args)=>{
      calls.push({name,args});
      if(name==='mcy_content_review_read')return {data:{can_assign:options.canAssign??true,items,eligible_reviewers:[]},error:null};
      if(name==='mcy_reading_publication_snapshot')return options.snapshotError?{data:null,error:{code:'XX000'}}:{data:snapshot,error:null};
      if(name==='mcy_reading_publication_set'||name==='mcy_reading_publication_set_default'){if(options.setError)return {data:null,error:options.setError};if(name==='mcy_reading_publication_set')snapshot={...snapshot,rows:[row(cobra,{visible:args.p_visible,text_only_allowed:null,updated_at:T1})]};return {data:{ok:true},error:null};}
      if(name==='mcy_content_review_save')return {data:{candidate_id:cobra.id,content_version:cobra.version,revision:2,decision:'withdrawn'},error:null};
      throw new Error('unexpected rpc '+name);
    }}}),
    readModels:async()=>{throw new Error('no provider');},readJson:r=>r.json(),isBodyTooLarge:()=>false,isBodyTimeout:()=>false,
  });
  return {calls,f,run:async body=>{const r=await handler(new Request('https://edge.invalid',{method:'POST',headers:{'content-type':'application/json',authorization:'Bearer fictional-only'},body:JSON.stringify(body)}));return {status:r.status,body:await r.json()};}};
}
const set=(patch={})=>({action:'set_reading_publication',candidateId:cobra.id,contentVersion:cobra.version,visible:true,textOnlyMode:'inherit',...patch});

test('read_reading_publication lists admitted units with effective state and reasons',async()=>{
  const h=harness();const r=await h.run({action:'read_reading_publication'});
  assert.equal(r.status,200);assert.equal(r.body.canSetDefault,true);assert.equal(r.body.defaultTextOnlyAllowed,false);
  assert.deepEqual(r.body.units.map(u=>[u.id,u.show,u.reason,u.switchOn,u.images,u.contentReady]),[[cobra.id,true,'ok',true,'complete',true]]);
  assert.equal(JSON.stringify(r.body).includes('"body"'),false);
  const bad=harness({snapshotError:true});assert.deepEqual(await bad.run({action:'read_reading_publication'}),{status:503,body:{error:'reading_publication_not_ready'}});
});

test('set_reading_publication saves the switch, then publishes; forged or invalid input never reaches the database',async()=>{
  const h=harness({snapshot:snap({rows:[]})});const r=await h.run(set());
  assert.equal(r.status,200);assert.equal(r.body.synced,true);assert.deepEqual(r.body.shown,[cobra.id]);
  const call=h.calls.find(c=>c.name==='mcy_reading_publication_set');
  assert.equal(call.args.p_actor_id,actor);assert.equal(call.args.p_visible,true);assert.equal(call.args.p_text_only_mode,'inherit');
  assert.deepEqual(call.args.p_candidate,{id:cobra.id,scope:'learning_reading',title:cobra.title,version:cobra.version});
  assert.ok(h.f.buckets[PUBLISHED_BUCKET].has(MANIFEST_PATH));
  for(const body of [set({actorId:actor}),set({visible:'yes'}),set({textOnlyMode:'always'}),set({contentVersion:'f'.repeat(64)}),set({candidateId:'../x'}),set({defaultTextOnlyAllowed:true}),{action:'set_reading_publication',candidateId:cobra.id,contentVersion:cobra.version}]){
    const g=harness();assert.equal((await g.run(body)).status,400);assert.equal(g.calls.some(c=>c.name.startsWith('mcy_reading_publication_set')),false);
  }
  const hidden=harness({items:[]});assert.equal((await hidden.run(set())).status,403);assert.equal(hidden.calls.some(c=>c.name==='mcy_reading_publication_set'),false);
});

test('the default for text-only units is Owner-only and the database result codes are sanitized',async()=>{
  const owner=harness();const r=await owner.run({action:'set_reading_publication',defaultTextOnlyAllowed:true});assert.equal(r.status,200);assert.equal(owner.calls.find(c=>c.name==='mcy_reading_publication_set_default').args.p_text_only_allowed,true);
  const teacher=harness({canAssign:false});assert.equal((await teacher.run({action:'set_reading_publication',defaultTextOnlyAllowed:true})).status,403);assert.equal(teacher.calls.some(c=>c.name==='mcy_reading_publication_set_default'),false);
  assert.equal((await owner.run({action:'set_reading_publication',defaultTextOnlyAllowed:'true'})).status,400);
  for(const [error,status,code] of [[{code:'22023',message:'unit_not_approved'},409,'unit_not_approved'],[{code:'22023',message:'x'},400,'invalid_publication'],[{code:'42501',message:'Secret detail'},403,'content_review_access_required'],[{code:'PT429',message:'x'},429,'reading_publication_limit_reached'],[{code:'XX000',message:'Secret detail'},503,'reading_publication_result_uncertain']]){
    const h=harness({setError:error});const x=await h.run(set());assert.equal(x.status,status);assert.equal(x.body.error,code);assert.equal(JSON.stringify(x).includes('Secret'),false);
  }
});

test('sync_reading_publication is Owner-only; saving a review of a reading unit re-syncs, other scopes do not',async()=>{
  const teacher=harness({canAssign:false});assert.equal((await teacher.run({action:'sync_reading_publication'})).status,403);
  const owner=harness();const s=await owner.run({action:'sync_reading_publication'});assert.equal(s.status,200);assert.deepEqual(s.body.shown,[cobra.id]);
  const withdraw={action:'save_content_review',candidateId:cobra.id,contentVersion:cobra.version,expectedRevision:1,decision:'withdrawn',qualification:'Fictional test qualification only',reviewBasis:'Fictional test basis only',rightsBasis:'Fictional rights test only',checklist:Object.fromEntries(reviewChecks.map(k=>[k,false]))};
  const w=harness();const wr=await w.run(withdraw);assert.equal(wr.status,200);assert.equal(wr.body.publicationSynced,true);assert.equal(wr.body.published,false);
  assert.equal(w.calls.filter(c=>c.name==='mcy_reading_publication_snapshot').length>=1,true);
  const none=harness({noStorage:true});const nr=await none.run(withdraw);assert.equal(nr.status,200);assert.equal('publicationSynced' in nr.body,false);assert.equal(none.calls.some(c=>c.name==='mcy_reading_publication_snapshot'),false);
});
