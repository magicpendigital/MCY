// Read/negative-only smoke for the selective staging rollout; no approvals/grants/inference.
// Sessions are consumed internally from ignored env; only identity hashes/statuses are reported.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {writeFileSync} from 'node:fs';
const origin='https://mhumbczqrzutdnraafhs.supabase.co',checks=[];
assert.equal(process.env.VITE_SUPABASE_URL?.replace(/\/$/,''),origin);
assert.ok(process.env.VITE_SUPABASE_PUBLISHABLE_KEY?.startsWith('sb_publishable_'));
const expected=JSON.parse(process.env.MCY_CONTENT_ACTOR_DIGESTS||'{}');
const actors=['LEARNER_A','LEARNER_B','TEACHER','REVIEWER','OWNER'];
assert.equal(Object.keys(expected).length,5,'Independently SQL-verified actor hashes required');
const pass=name=>{checks.push({name,status:'PASS'});console.log('PASS '+name);};
async function request(path,token,payload){
 const headers={apikey:process.env.VITE_SUPABASE_PUBLISHABLE_KEY,accept:'application/json','cache-control':'no-store'};
 if(token)headers.authorization='Bearer '+token;if(payload!==undefined)headers['content-type']='application/json';
 const response=await fetch(origin+path,{method:payload===undefined?'GET':'POST',headers,body:payload===undefined?undefined:JSON.stringify(payload),redirect:'error',signal:AbortSignal.timeout(12000)});
 const raw=await response.text();assert.ok(raw.length<1000000,'Bounded response');let body;try{body=JSON.parse(raw)}catch{body=null}return {status:response.status,body,cache:response.headers.get('cache-control')};
}
let status='FAIL';
try{
 const ids=new Set();for(const name of actors){const r=await request('/auth/v1/user',process.env['MCY_TEST_'+name+'_ACCESS_TOKEN']);assert.equal(r.status,200);assert.ok(r.body.email_confirmed_at);const digest=createHash('sha256').update(r.body.id).digest('hex');assert.equal(digest,expected[name]);ids.add(digest);}assert.equal(ids.size,5);pass('Five confirmed distinct sessions match independently verified current roles');
 const endpoint='/functions/v1/owner-control-plane',owner=process.env.MCY_TEST_OWNER_ACCESS_TOKEN;
 for(const token of [null,'invalid-fixture-jwt']){const r=await request(endpoint,token,{action:'read_content_review'});assert.equal(r.status,401);pass('Anonymous/invalid session denied HTTP401');}
 for(const name of actors.filter(n=>n!=='OWNER')){const r=await request(endpoint,process.env['MCY_TEST_'+name+'_ACCESS_TOKEN'],{action:'read_content_review'});assert.equal(r.status,403);assert.equal(r.body.error,'content_review_access_required');pass(name+' denied review without Owner/current active profile assignment');}
 const queue=await request(endpoint,owner,{action:'read_content_review'});assert.equal(queue.status,200);assert.equal(queue.cache,'no-store');assert.equal(queue.body.can_assign,true);assert.equal(queue.body.default_reviewer,'owner');assert.equal(queue.body.candidates.length,1);assert.equal(queue.body.eligible_reviewers.length,0);
 const candidate=queue.body.candidates[0],item=queue.body.items[0];assert.equal(candidate.id,'preparation-draft');assert.equal(candidate.scope,'learning_intro');assert.equal(item.state.decision,'pending');assert.equal(item.state.revision,0);pass('Owner reads fixed public intro at revision0, pending, no active teacher roster; no-store');
 const forged=await request(endpoint,owner,{action:'read_content_review',actor_id:'44000000-0000-4000-8000-000000000003'});assert.equal(forged.status,400);assert.equal(forged.body.error,'invalid_request');pass('Forged actor field rejected before review action');
 const invalid=await request(endpoint,owner,{action:'save_content_review',candidateId:candidate.id,contentVersion:candidate.version,expectedRevision:0,decision:'approved',qualification:'',reviewBasis:'',rightsBasis:'',checklist:{}});assert.equal(invalid.status,400);assert.equal(invalid.body.error,'invalid_review');pass('Missing expertise/rights/checklist rejected; no approval requested successfully');
 // Guaranteed impossible expected revision from independently read zero state.
 // No successful review is sent; transaction-created state is rolled back on PT409.
 const checklist=Object.fromEntries(['contentAccuracy','audienceScope','stopGuidance','accessibility','rightsConfirmed','expertiseConfirmed','vietnameseAudioReady','actualDurationChecked'].map(k=>[k,false]));
 const stale=await request(endpoint,owner,{action:'save_content_review',candidateId:candidate.id,contentVersion:candidate.version,expectedRevision:2147483647,decision:'changes_requested',qualification:'Technical negative probe only; no expertise asserted',reviewBasis:'Technical negative probe only; no content judgement',rightsBasis:'Technical negative probe only; no rights asserted',checklist});assert.equal(stale.status,409);assert.equal(stale.body.error,'content_review_conflict');pass('Owner impossible revision denied HTTP409; no committed review/event');
 const client=await request('/rest/v1/rpc/mcy_content_review_read',owner,{p_actor_id:'44000000-0000-4000-8000-000000000001',p_candidates:[]});assert.equal(client.status,403);assert.equal(client.body.code,'42501');pass('Authenticated direct RPC EXECUTE denied HTTP403/42501');
 const ai=await request(endpoint,owner,{action:'read_ai'});assert.equal(ai.status,200);assert.equal(ai.body.config.enabled,false);assert.equal(ai.body.config.version_no,1);assert.equal(ai.body.environment,'staging');assert.equal(ai.cache,'no-store');assert.equal(ai.body.provider,'openrouter');assert.equal(typeof ai.body.providerKeyConfigured,'boolean');assert.ok(!JSON.stringify(ai.body).includes('sk-or-'));pass('Old Owner AI-off version1 read remains compatible; bounded provider metadata read only');
 const final=await request(endpoint,owner,{action:'read_content_review'});assert.equal(final.status,200);assert.equal(final.body.items[0].state.revision,0);assert.equal(final.body.items[0].state.decision,'pending');pass('Readback remains pending revision0 after all negative probes');status='PASS';
}catch{console.error('FAIL bounded staging smoke; sensitive provider/identity/configuration details omitted');}
if(process.env.MCY_CONTENT_STAGING_RECEIPT)writeFileSync(process.env.MCY_CONTENT_STAGING_RECEIPT,JSON.stringify({schemaVersion:1,kind:'ContentReviewStagingReadNegativeSmoke',executedAt:new Date().toISOString(),status,checks,successfulWritesRequested:false,roleGrants:false,aiInference:false,limitations:['No active real teacher profile: live assigned-teacher positive path not exercised','Positive review/assignment writes covered by isolated PostgreSQL/PostgREST fixtures only','Owner read_ai may fetch provider model metadata, never inference']},null,2)+'\n');
process.exitCode=status==='PASS'?0:1;
