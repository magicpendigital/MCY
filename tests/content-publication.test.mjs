import assert from 'node:assert/strict';
import test from 'node:test';
import {createOwnerControlPlaneHandler} from '../supabase/functions/_shared/ownerControlPlane.ts';
import {buildManifest, syncContentSnapshot, EDITORS_CHOICE_LABEL} from '../supabase/functions/_shared/contentPublication.ts';
import {videoCatalogItems} from '../supabase/functions/_shared/videoCatalogCandidates.ts';
const actor='56000000-0000-4000-8000-000000000001';
const display=()=>({discover_order:['editors_choice','video_groups','quick_find','reading'],policies:{show_teacher_names:true,ai_image_label:true},editors_choice:[]});
const lesson=(id,patch={})=>({item_id:id,kind:'video_lesson',seq:1,content_hash:'a'.repeat(64),title:'Fictional '+id,payload:{youtubeId:'AAAAAAAAAAA',summary:'Fictional summary',durationLabel:'0:43',orientation:'portrait'},author_kind:'mcy',origin:'authored',author_label:null,...patch});
const group=(id,lessonIds,patch={})=>({item_id:id,kind:'course_group',seq:1,content_hash:'b'.repeat(64),title:'Fictional group',payload:{summary:'Fictional group summary',lessonIds},author_kind:'mcy',origin:'authored',author_label:null,...patch});
const source=(items,d=display())=>({display:d,display_version:1,items});

test('the manifest projects only whitelisted fields and decides bylines at publish time',()=>{
  const m=buildManifest(source([lesson('video-a'),lesson('video-t',{author_kind:'teacher',author_label:'Fictional teacher'}),lesson('video-i',{origin:'imported'}),group('group-x',['video-a','video-t','video-i'])]),new Date('2026-11-09T00:00:00Z'));
  assert.deepEqual([m.v,m.generated_at,m.groups.length,m.lessons.length],[1,'2026-11-09T00:00:00.000Z',1,3]);
  assert.deepEqual(Object.fromEntries(m.lessons.map(l=>[l.id,l.byline])),{'video-a':EDITORS_CHOICE_LABEL,'video-t':'Fictional teacher','video-i':null});
  assert.deepEqual(Object.keys(m.lessons[0]).sort(),['byline','caption_languages','captions_verified','duration','id','orientation','summary','title','youtube_id']);
  assert.deepEqual(Object.keys(m.groups[0]).sort(),['byline','id','lesson_ids','summary','title']);
  assert.ok(!JSON.stringify(m).includes('content_hash')&&!JSON.stringify(m).includes('author_kind'));
});
test('a teacher name is never published when the policy is off or the profile is not active; imported content has no byline',()=>{
  const off=display();off.policies.show_teacher_names=false;
  assert.equal(buildManifest(source([lesson('video-t',{author_kind:'teacher',author_label:'Fictional teacher'}),group('group-x',['video-t'])],off)).lessons[0].byline,null);
  assert.equal(buildManifest(source([lesson('video-t',{author_kind:'teacher',author_label:null}),group('group-x',['video-t'])])).lessons[0].byline,null);
  assert.equal(buildManifest(source([lesson('video-t',{author_kind:'teacher',author_label:'   '}),group('group-x',['video-t'])])).lessons[0].byline,null);
});
test('groups without shown lessons, invalid payloads and internal wording are left out, and editor slots keep only published ids',()=>{
  const d=display();d.editors_choice=['video-a','group-x','group-ghost','video-orphan'];
  const m=buildManifest(source([lesson('video-a'),lesson('video-orphan'),lesson('video-bad',{payload:{youtubeId:'x'}}),lesson('video-draftword',{title:'Bản nháp chưa duyệt'}),
    group('group-x',['video-a','video-missing']),group('group-empty',['video-missing']),group('group-word',['video-a'],{title:'Brief of the progression'})],d));
  assert.deepEqual(m.groups.map(g=>g.id),['group-x']);
  assert.deepEqual(m.groups[0].lesson_ids,['video-a']);
  assert.deepEqual(m.lessons.map(l=>l.id),['video-a']);
  assert.deepEqual(m.display.editors_choice,['video-a','group-x']);
  assert.deepEqual(buildManifest(source([])).groups,[]);
});
test('the bundled catalogue imported as MCY content publishes without bylines and with the three groups',()=>{
  const items=videoCatalogItems.map(c=>({item_id:c.id,kind:c.kind,seq:1,content_hash:'c'.repeat(64),title:c.title,payload:c.payload,author_kind:'mcy',origin:'imported',author_label:null}));
  const m=buildManifest(source(items));
  assert.deepEqual([m.groups.length,m.lessons.length,m.lessons.every(l=>l.byline===null)],[3,38,true]);
});
test('sync writes one manifest, reports failures without throwing, and an empty manifest withdraws everything',async()=>{
  const calls=[];
  const storage={from:bucket=>({upload:async(path,body,options)=>{calls.push({bucket,path,body,options});return {data:{},error:null};}})};
  const ok=await syncContentSnapshot(storage,source([lesson('video-a'),group('group-x',['video-a'])]));
  assert.deepEqual([ok.ok,ok.groups,ok.lessons,calls.length,calls[0].bucket,calls[0].path,calls[0].options],[true,1,1,1,'content-published','manifest.json',{contentType:'application/json',cacheControl:'60',upsert:true}]);
  assert.equal(JSON.parse(calls[0].body).v,1);
  const empty=await syncContentSnapshot(storage,source([]));assert.deepEqual([empty.ok,empty.groups],[true,0]);
  assert.deepEqual(await syncContentSnapshot(undefined,source([])),{ok:false,error:'storage_unavailable'});
  assert.deepEqual(await syncContentSnapshot({from:()=>({})},source([])),{ok:false,error:'storage_unavailable'});
  assert.deepEqual(await syncContentSnapshot({from:()=>({upload:async()=>({data:null,error:{message:'Private detail'}})})},source([])),{ok:false,error:'write_failed'});
  assert.deepEqual(await syncContentSnapshot({from:()=>({upload:async()=>{throw new Error('Private detail');}})},source([])),{ok:false,error:'write_failed'});
});

function harness(options={}) {
  const calls=[];const uploads=[];
  const storage=options.noStorage?undefined:{from:bucket=>({upload:async(path,body)=>{uploads.push({bucket,path,body});return {data:{},error:options.uploadError?{message:'x'}:null};}})};
  const handler=createOwnerControlPlaneHandler({
    env:key=>key==='SUPABASE_URL'?'https://mhumbczqrzutdnraafhs.supabase.co':undefined,
    clients:()=>({user:{auth:{getUser:async()=>({data:{user:{id:actor,email_confirmed_at:'2026-10-01'}},error:null})}},server:{storage,rpc:async(name,args)=>{calls.push({name,args});const out=options.rpc?.(name,args);return out??{data:{item_id:'video-x',seq:1,unchanged:false},error:null};}}}),
    readModels:async()=>{throw new Error('no provider');},readJson:r=>r.json(),isBodyTooLarge:()=>false,isBodyTimeout:()=>false
  });
  return {calls,uploads,run:async body=>{const r=await handler(new Request('https://edge.invalid',{method:'POST',headers:{'content-type':'application/json',authorization:'Bearer fictional-only'},body:JSON.stringify(body)}));return {status:r.status,body:await r.json()};}};
}
const snapshotRpc=name=>name==='mcy_content_snapshot'?{data:source([lesson('video-a'),group('group-x',['video-a'])]),error:null}:undefined;
test('changing what is shown republishes the snapshot, and a publishing failure never undoes the saved change',async()=>{
  const vis=harness({rpc:snapshotRpc});const r=await vis.run({action:'set_visibility',itemId:'video-a',seq:1,visible:true});
  assert.deepEqual([r.status,r.body.snapshotSynced,vis.calls.map(c=>c.name),vis.uploads.length,vis.uploads[0].path],[200,true,['mcy_content_set_visibility','mcy_content_snapshot'],1,'manifest.json']);
  const failed=harness({rpc:snapshotRpc,uploadError:true});const f=await failed.run({action:'set_visibility',itemId:'video-a',seq:1,visible:true});
  assert.deepEqual([f.status,f.body.snapshotSynced],[200,false]);
  const none=harness({rpc:snapshotRpc,noStorage:true});assert.equal((await none.run({action:'set_visibility',itemId:'video-a',seq:1,visible:true})).body.snapshotSynced,undefined);
  const bad=harness({rpc:name=>name==='mcy_content_snapshot'?{data:null,error:{code:'XX000',message:'Private detail'}}:undefined});assert.equal((await bad.run({action:'set_visibility',itemId:'video-a',seq:1,visible:true})).body.snapshotSynced,false);
  const refused=harness({rpc:name=>name==='mcy_content_set_visibility'?{data:null,error:{code:'22023',message:'content_not_approved'}}:undefined});
  assert.deepEqual([(await refused.run({action:'set_visibility',itemId:'video-a',seq:1,visible:true})).status,refused.uploads.length],[409,0]);
  const config={...display(),review_rules:Object.fromEntries(['video_lesson','course_group','reading_unit','screen_text'].map(k=>[k,{owner_self_review:true}]))};
  const saved=harness({rpc:snapshotRpc});const d=await saved.run({action:'save_display',expectedVersion:1,config});
  assert.deepEqual([d.status,d.body.snapshotSynced],[200,true]);
});
test('sync_content_snapshot is explicit, owner-checked in the database and never leaks details',async()=>{
  const ok=harness({rpc:snapshotRpc});assert.deepEqual((await ok.run({action:'sync_content_snapshot'})).body,{synced:true,groups:1,lessons:1});
  assert.equal((await harness({noStorage:true}).run({action:'sync_content_snapshot'})).status,503);
  const denied=harness({rpc:()=>({data:null,error:{code:'42501',message:'owner_access_required'}})});assert.deepEqual([(await denied.run({action:'sync_content_snapshot'})).status,denied.uploads.length],[403,0]);
  assert.equal((await harness().run({action:'sync_content_snapshot',extra:1})).status,400);
});
test('author notes validate input and pass only the verified actor',async()=>{
  const bad=[{action:'save_author_note',itemId:'video-x',seq:1,note:'  '},{action:'save_author_note',itemId:'video-x',seq:0,note:'ok'},{action:'save_author_note',itemId:'Bad Id',seq:1,note:'ok'},{action:'save_author_note',itemId:'video-x',seq:1,note:'x'.repeat(1001)},{action:'save_author_note',itemId:'video-x',seq:1,note:'ok',actorId:actor},{action:'read_author_notes'},{action:'read_author_notes',itemId:'Bad Id'}];
  for(const body of bad){const h=harness();assert.deepEqual([(await h.run(body)).status,h.calls.length],[400,0]);}
  const h=harness({rpc:name=>name==='mcy_content_notes_read'?{data:{notes:[{seq:1,note:'Fix it',at:'2026-11-09T00:00:00Z'}]},error:null}:undefined});
  const r=await h.run({action:'read_author_notes',itemId:'video-x'});assert.deepEqual([r.status,r.body.notes.length,h.calls[0].args.p_actor_id],[200,1,actor]);
  const w=harness();const s=await w.run({action:'save_author_note',itemId:'video-x',seq:2,note:'  Please shorten.  '});assert.deepEqual([s.status,w.calls[0].name,w.calls[0].args.p_note,w.calls[0].args.p_seq,w.calls[0].args.p_actor_id],[200,'mcy_content_note_save','Please shorten.',2,actor]);
  const forbidden=harness({rpc:()=>({data:null,error:{code:'42501',message:'Private detail'}})});const x=await forbidden.run({action:'read_author_notes',itemId:'video-x'});assert.deepEqual([x.status,x.body.error],[403,'content_access_required']);
});
test('explicit browse areas are published when valid and make a lesson invalid when not',()=>{
  const m=buildManifest(source([lesson('video-a',{payload:{youtubeId:'AAAAAAAAAAA',summary:'Fictional summary',durationLabel:'0:43',orientation:'portrait',areas:['neck-shoulders','back']}}),
    lesson('video-none',{payload:{youtubeId:'AAAAAAAAAAA',summary:'Fictional summary',durationLabel:'0:43',orientation:'portrait',areas:[]}}),
    lesson('video-bad',{payload:{youtubeId:'AAAAAAAAAAA',summary:'Fictional summary',durationLabel:'0:43',orientation:'portrait',areas:['made-up']}}),
    lesson('video-dup',{payload:{youtubeId:'AAAAAAAAAAA',summary:'Fictional summary',durationLabel:'0:43',orientation:'portrait',areas:['back','back']}}),
    lesson('video-plain'),group('group-x',['video-a','video-none','video-bad','video-dup','video-plain'])]));
  assert.deepEqual(m.lessons.map(l=>l.id),['video-a','video-none','video-plain']);
  assert.deepEqual(Object.fromEntries(m.lessons.map(l=>[l.id,l.areas])),{'video-a':['neck-shoulders','back'],'video-none':[],'video-plain':undefined});
});
