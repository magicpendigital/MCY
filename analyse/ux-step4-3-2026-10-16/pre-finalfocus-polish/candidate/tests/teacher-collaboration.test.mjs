import test from 'node:test';
import assert from 'node:assert/strict';
import { createTeacherCollaborationHandler } from '../supabase/functions/_shared/teacherCollaboration.ts';
import { readBoundedJson, RequestBodyTimeoutError, RequestBodyTooLargeError } from '../supabase/functions/_shared/boundedRequest.ts';
const actor='10000000-0000-4000-8000-000000000001';
function setup({enabled=true,url='https://mhumbczqrzutdnraafhs.supabase.co',verified=true,confirmed=true,error=null,reader=readBoundedJson}={}){
 const calls=[];
 const handler=createTeacherCollaborationHandler({env:name=>name==='SUPABASE_URL'?url:enabled?'true':'false',readJson:reader,
 isBodyTooLarge:e=>e instanceof RequestBodyTooLargeError,isBodyTimeout:e=>e instanceof RequestBodyTimeoutError,
 clients:()=>({user:{auth:{getUser:async()=>({data:{user:verified?{id:actor,email_confirmed_at:confirmed?'synthetic-confirmation':null}:null},error:null})}},
 server:{rpc:async(name,args)=>{calls.push({name,args});return {data:{saved:true},error:error?{code:error,message:'confidential SQL value'}:null};}}})});
 return {handler,calls};
}
function req(body={action:'workspace',payload:{}},options={}){return new Request('https://example.test',{method:'POST',headers:{authorization:'Bearer fictional', 'content-type':'application/json'},body:JSON.stringify(body),...options});}
test('closed gate and unrelated project deny without RPC',async()=>{
 for(const config of [{enabled:false},{url:'https://other.invalid'}]){const s=setup(config);assert.equal((await s.handler(req())).status,404);assert.equal(s.calls.length,0);}
});
test('verified confirmed identity required',async()=>{
 for(const config of [{verified:false},{confirmed:false}]){const s=setup(config);assert.equal((await s.handler(req())).status,401);assert.equal(s.calls.length,0);}
 const s=setup();assert.equal((await s.handler(req(undefined,{headers:{}}))).status,401);
});
test('RPC actor comes exclusively from verified account',async()=>{
 const s=setup();assert.equal((await s.handler(req({action:'save_feedback',payload:{enrollment_id:'synthetic',body:'Fictional feedback'}}))).status,200);
 assert.equal(s.calls[0].args.p_actor_id,actor);assert.equal(s.calls[0].name,'mcy_collaboration_dispatch');
});
test('client actor, role, expert and publication claims are rejected',async()=>{
 for(const field of ['actor_id','user_id','role','expert_verified','publish','publication_enabled']){
  const s=setup();assert.equal((await s.handler(req({action:'workspace',payload:{[field]:'injected'}}))).status,400);assert.equal(s.calls.length,0);
 }
 const s=setup();assert.equal((await s.handler(req({action:'workspace',payload:{},actor_id:actor}))).status,400);
});
test('publication, AI generation and SMTP actions absent',async()=>{
 for(const action of ['publish','invite_teacher','generate_feedback','set_role']){const s=setup();assert.equal((await s.handler(req({action,payload:{}}))).status,400);}
});
test('bounded and timed body failures fail closed',async()=>{
 const large=setup();assert.equal((await large.handler(req({action:'workspace',payload:{x:'x'.repeat(56000)}}))).status,413);
 const timeout=setup({reader:async()=>{throw new RequestBodyTimeoutError();}});assert.equal((await timeout.handler(req())).status,408);
});
test('SQL failures have bounded public codes without private details',async()=>{
 for(const [error,status] of [['42501',403],['PT409',409],['40001',503],['23505',409],['22P02',400],['54000',429],['XX000',503]]){
  const s=setup({error});const response=await s.handler(req());assert.equal(response.status,status);assert.ok(!(await response.text()).includes('confidential'));
 }
});
test('OPTIONS and unsupported verbs never dispatch',async()=>{
 const s=setup();assert.equal((await s.handler(new Request('https://example.test',{method:'OPTIONS'}))).status,204);
 assert.equal((await s.handler(new Request('https://example.test'))).status,405);assert.equal(s.calls.length,0);
});

test('domain conflict and real serialization failure stay distinct without handler retries',async()=>{
 for(const [code,status,error] of [['PT409',409,'collaboration_conflict'],['40001',503,'collaboration_unavailable']]){
  const s=setup({error:code});const response=await s.handler(req());
  assert.equal(response.status,status);assert.deepEqual(await response.json(),{error});assert.equal(s.calls.length,1);
 }
});
