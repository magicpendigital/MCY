// One bounded live run, only the Owner-approved disposable staging actors.
// No retries, role changes, external mail, AI, deletion, or service credentials.
import assert from 'node:assert/strict';
import {createHash,randomUUID} from 'node:crypto';
import {readFileSync,writeFileSync,existsSync} from 'node:fs';
const sha=b=>createHash('sha256').update(b).digest('hex');
const manifestHash='13521cea066fa99467d23cca987533e03339efd019bbd4a09dc287b890ae2143';
assert.equal(sha(readFileSync('analyse/MCY_LEARNER_WRITE_OPERATION_2026-10-11.json')),manifestHash);
const origin='https://mhumbczqrzutdnraafhs.supabase.co';
assert.equal(process.env.VITE_SUPABASE_URL?.replace(/\/$/,''),origin);
const key=process.env.VITE_SUPABASE_PUBLISHABLE_KEY;assert.ok(key?.startsWith('sb_publishable_'));
const gate=JSON.parse(readFileSync('analyse/MCY_LEARNER_WRITE_ACTOR_GATE_2026-10-12.json'));
const deployed=JSON.parse(readFileSync('analyse/MCY_LEARNER_WRITE_READBACK_2026-10-12.json'));
assert.equal(gate.status,'PASS');assert.equal(deployed.status,'PASS');
assert.equal(gate.projectRef,'mhumbczqrzutdnraafhs');assert.equal(deployed.projectRef,gate.projectRef);
assert.equal(deployed.manifestSha256,manifestHash);assert.equal(gate.manifestSha256,manifestHash);
const age=Date.now()-Date.parse(gate.capturedAt);assert.ok(age>=0&&age<15*60*1000,'Fresh independently verified actor gate required');
assert.deepEqual(Object.keys(gate.actors).sort(),['LEARNER_A','LEARNER_B']);
for(const actor of Object.values(gate.actors)){assert.equal(actor.confirmed,true);assert.equal(actor.activeStaffRoles,0);assert.equal(actor.activeTeacherProfile,false);assert.equal(actor.disposableDecision,true);}
const receiptPath='analyse/MCY_LEARNER_WRITE_LIVE_2026-10-12.json';
assert.ok(!existsSync(receiptPath),'Prior run intent exists; inspect outcome, do not rerun');
const runId='mcy-lw-'+randomUUID(),checks=[],calls=[],actors={};
const receipt={kind:'BoundedApprovedLearnerWriteStagingMatrix',manifestSha256:manifestHash,projectRef:'mhumbczqrzutdnraafhs',startedAt:new Date().toISOString(),runId,status:'INTENT_RECORDED',limits:{consents:12,checkins:2,observations:1},reservedPositiveWrites:{consents:0,checkins:0,observations:0},checks,calls,baselineGateSha256:sha(readFileSync('analyse/MCY_LEARNER_WRITE_ACTOR_GATE_2026-10-12.json')),harnessSha256:sha(readFileSync('scripts/test-learner-write-staging.mjs')),historyRetained:true,externalMail:false,aiInference:false,automaticRetry:false};
const persist=()=>writeFileSync(receiptPath,JSON.stringify(receipt,null,2)+'\n');
writeFileSync(receiptPath,JSON.stringify(receipt,null,2)+'\n',{flag:'wx'});
const pass=name=>{checks.push({name,status:'PASS'});persist();console.log('PASS '+name);};
let stage='verified Auth preflight';
async function request(route,token,payload){
 const headers={apikey:key,accept:'application/json','cache-control':'no-store'};
 if(token)headers.authorization='Bearer '+token;
 if(payload!==undefined)headers['content-type']='application/json';
 const response=await fetch(origin+route,{method:payload===undefined?'GET':'POST',headers,body:payload===undefined?undefined:JSON.stringify(payload),redirect:'error',signal:AbortSignal.timeout(12000)});
 const raw=await response.text();assert.ok(raw.length<100000,'Bounded response');
 let body;try{body=JSON.parse(raw)}catch{body=null}
 const code=typeof body?.code==='string'&&/^[A-Z0-9]{5,20}$/.test(body.code)?body.code:null;
 calls.push({stage,method:payload===undefined?'GET':'POST',endpoint:route.split('?')[0],status:response.status,code});persist();
 assert.ok(response.status<500,'Unexpected server failure; stop this run');
 return {status:response.status,body};
}
const rpc=(name,token,payload)=>request('/rest/v1/rpc/'+name,token,payload);
function reserve(kind,n=1){receipt.reservedPositiveWrites[kind]+=n;assert.ok(receipt.reservedPositiveWrites[kind]<=receipt.limits[kind]);persist();}
function consentPayload(purpose,action='granted',policy=purpose==='wellbeing_data'?'wellbeing-data-review-0.1':purpose+'-review-0.1',suffix=randomUUID()){
 return {p_purpose:purpose,p_action:action,p_policy_version:policy,p_source:'settings',p_idempotency_key:runId+'-'+suffix,p_channel:'web'};
}
async function consent(label,payload){reserve('consents');const r=await rpc('record_my_consent',actors[label].token,payload);assert.equal(r.status,200);assert.match(r.body,/^[0-9a-f-]{36}$/i);return r.body;}
const savePayload=(id,suffix,observations=[])=>({p_expected_user_id:id,p_local_date:'2026-10-12',p_local_timezone:'Asia/Bangkok',p_energy_level:2,p_body_status:observations.length?'uncertain':'none_now',p_capture_type:'standalone',p_observations:observations,p_idempotency_key:runId+'-'+suffix});
const save=(label,payload)=>rpc('save_my_checkin_for_current_user_with_current_consent',actors[label].token,payload);
const deny=(r,status,code)=>{assert.equal(r.status,status);assert.equal(r.body?.code,code);};
try{
 for(const label of ['LEARNER_A','LEARNER_B']){
  const token=process.env['MCY_TEST_'+label+'_ACCESS_TOKEN'];assert.ok(token);
  const r=await request('/auth/v1/user',token);assert.equal(r.status,200);assert.ok(r.body.email_confirmed_at);
  const claims=JSON.parse(Buffer.from(token.split('.')[1],'base64url').toString());
  assert.equal(r.body.id,claims.sub);assert.ok(claims.exp*1000>Date.now()+5*60*1000);
  assert.equal(sha(r.body.id),gate.actors[label].identitySha256);
  actors[label]={id:r.body.id,token};
 }
 assert.notEqual(actors.LEARNER_A.id,actors.LEARNER_B.id);pass('Two fresh confirmed identities match independently verified disposable authority');
 const A='LEARNER_A',B='LEARNER_B';
 const observations=[{region_code:'neck',state:'uncertain',level:null,note:'Fictional staging fixture; no real symptom'}];
 const a=savePayload(actors[A].id,'checkin-A',observations),b=savePayload(actors[B].id,'checkin-B');
 stage='anonymous and actor mismatch';
 deny(await rpc('save_my_checkin_for_current_user_with_current_consent',null,a),401,'42501');
 deny(await save(A,{...a,p_expected_user_id:actors[B].id}),403,'28000');
 deny(await save(A,{...a,p_expected_user_id:null}),403,'28000');
 pass('Anonymous, cross-actor and null expected actor cannot save');
 stage='six required consent fixtures';
 const first=consentPayload('terms','granted',undefined,'consent-A-terms');
 const firstId=await consent(A,first);
 const retryConsent=await rpc('record_my_consent',actors[A].token,first);assert.equal(retryConsent.status,200);assert.equal(retryConsent.body,firstId);
 deny(await rpc('record_my_consent',actors[A].token,{...first,p_channel:'ios'}),400,'22023');
 for(const purpose of ['privacy','wellbeing_data'])await consent(A,consentPayload(purpose));
 for(const purpose of ['terms','privacy','wellbeing_data'])await consent(B,consentPayload(purpose));
 pass('Six required grants; exact consent retry stable; changed payload with same key denied');
 stage='stale privacy version';
 await consent(A,consentPayload('privacy','granted','privacy-staging-stale-fixture'));
 deny(await save(A,a),403,'42501');
 await consent(A,consentPayload('privacy'));
 pass('Stale latest privacy version denies save; current version re-established');
 stage='revoked wellbeing';
 await consent(A,consentPayload('wellbeing_data','revoked'));
 deny(await save(A,a),403,'42501');
 await consent(A,consentPayload('wellbeing_data'));
 pass('Latest revoked wellbeing consent denies save; required current grant re-established');
 stage='legacy and direct helper denied';
 const {p_expected_user_id:unused,...old}=a;
 deny(await rpc('save_my_checkin_with_current_consent',actors[A].token,old),403,'42501');
 const privateHelper=await rpc('save_my_checkin_expanded',actors[A].token,old);deny(privateHelper,404,'PGRST202');
 pass('Legacy client writer and unexposed private helper denied');
 stage='one A checkin and one observation';reserve('checkins');reserve('observations');
 const savedA=await save(A,a);assert.equal(savedA.status,200);assert.equal(savedA.body.length,1);
 const idA=savedA.body[0].checkin_id;assert.match(idA,/^[0-9a-f-]{36}$/i);
 const again=await save(A,a);assert.equal(again.status,200);assert.deepEqual(again.body,savedA.body);
 deny(await save(A,{...a,p_energy_level:3}),400,'22023');
 deny(await save(A,{...a,p_observations:[{...observations[0],note:'Different fictional fixture'}]}),400,'22023');
 pass('A saves once; exact full-payload retry stable; changed energy or observation rejected');
 stage='one B checkin';reserve('checkins');
 const savedB=await save(B,b);assert.equal(savedB.status,200);assert.equal(savedB.body.length,1);
 const idB=savedB.body[0].checkin_id;assert.notEqual(idB,idA);
 stage='stored payload and RLS';
 for(const [label,own,other,payload] of [[A,idA,idB,a],[B,idB,idA,b]]){
  const ownRead=await request('/rest/v1/checkins?select=id,user_id,local_date,local_timezone,energy_level,body_status,capture_type,idempotency_key&id=eq.'+own,actors[label].token);
  assert.equal(ownRead.status,200);assert.equal(ownRead.body.length,1);
  const row=ownRead.body[0];assert.equal(row.user_id,actors[label].id);
  for(const k of ['local_date','local_timezone','energy_level','body_status','capture_type','idempotency_key'])assert.equal(row[k],payload['p_'+k]);
  const hidden=await request('/rest/v1/checkins?select=id&id=eq.'+other,actors[label].token);assert.equal(hidden.status,200);assert.deepEqual(hidden.body,[]);
 }
 const obs=await request('/rest/v1/checkin_observations?select=user_id,region_code,state,level,note&checkin_id=eq.'+idA,actors[A].token);
 assert.equal(obs.status,200);assert.deepEqual(obs.body,[{user_id:actors[A].id,...observations[0]}]);
 const hiddenObs=await request('/rest/v1/checkin_observations?select=id&checkin_id=eq.'+idA,actors[B].token);assert.equal(hiddenObs.status,200);assert.deepEqual(hiddenObs.body,[]);
 const noObsB=await request('/rest/v1/checkin_observations?select=id&checkin_id=eq.'+idB,actors[B].token);assert.equal(noObsB.status,200);assert.deepEqual(noObsB.body,[]);
 pass('Exactly owned fictional stored fields, one A observation, no B observation; cross-user reads empty');
 stage='direct table and anonymous reads denied';
 deny(await request('/rest/v1/checkins',actors[A].token,{id:idA,user_id:actors[A].id,local_date:a.p_local_date,local_timezone:a.p_local_timezone,capture_type:a.p_capture_type,idempotency_key:a.p_idempotency_key}),403,'42501');
 deny(await request('/rest/v1/checkins?select=id&id=eq.'+idA,null),401,'42501');
 pass('Authenticated direct INSERT and anonymous table SELECT denied');
 stage='final append-only wellbeing revocations';
 for(const label of [A,B]){
  await consent(label,consentPayload('wellbeing_data','revoked'));
  deny(await save(label,label===A?a:b),403,'42501');
  const state=await rpc('get_my_consent_state',actors[label].token,{});assert.equal(state.status,200);assert.equal(state.body.wellbeing_data,false);
 }
 pass('Final wellbeing revocations stop both writers including retries; retained fixture history');
 receipt.status='API_PASS_DATABASE_AND_LOG_READBACK_REQUIRED';
 receipt.savedCheckinDigests=[sha(idA),sha(idB)];
 receipt.actorDigests=Object.fromEntries(Object.entries(actors).map(([label,x])=>[label,sha(x.id)]));
}catch{
 receipt.status='FAIL_OR_UNCERTAIN_STOP_ACCEPTANCE';receipt.failedStage=stage;
 console.error('FAIL at '+stage+'; sensitive response details withheld; no automatic retry');process.exitCode=1;
}finally{receipt.completedAt=new Date().toISOString();persist();console.log(JSON.stringify({status:receipt.status,checks:checks.length,limits:receipt.limits,reservedPositiveWrites:receipt.reservedPositiveWrites,receiptPath}));}
