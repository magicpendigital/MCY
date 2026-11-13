// Schema-only staging copy + fictional identities; no cloud or .env.local.
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createHash, createHmac, randomUUID } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
const docker = 'C:/Program Files/Docker/Docker/resources/bin/docker.exe';
const directory = 'D:/Projects/MCY/.vercel/mcy-auth-emails-20261011';
const schema = readFileSync(directory + '/next-checkin-schema.sql','utf8');
const baseline = readFileSync(directory + '/checkin-before-lock.sql','utf8');
const authFunctions = readFileSync(directory + '/learner-auth-functions.sql','utf8');
const migrationPath = 'supabase/migrations/20261002120000_bind_checkin_writes_to_current_actor_and_consent.sql';
const candidate = readFileSync(migrationPath,'utf8'), hash = v => createHash('sha256').update(v).digest('hex');
assert.ok(!/^COPY .+ FROM stdin|^INSERT INTO /mi.test(schema));
const suffix = randomUUID().replaceAll('-','').slice(0,12), db = 'mcy-learner-'+suffix, api=db+'-api', network=db+'-net';
const labelKey='mcy.learner.rehearsal', label=labelKey+'='+suffix;
const image='public.ecr.aws/supabase/postgres:17.6.1.139', restImage='public.ecr.aws/supabase/postgrest:v14.13';
const password='fictional-learner-db-password', secret='fictional-learner-jwt-secret-for-local-tests-only';
const A='55000000-0000-4000-8000-000000000001', B='55000000-0000-4000-8000-000000000002';
const checks=[], children=new Set();
function start(args,input='',end=true,timeout=90000) {
  const child=spawn(docker,args,{windowsHide:true,stdio:['pipe','pipe','pipe']}); children.add(child);
  let out='',err=''; child.stdout.on('data',v=>out+=v); child.stderr.on('data',v=>err+=v);
  const timer=setTimeout(()=>child.kill(),timeout);
  const done=new Promise((resolve,reject)=>{child.once('error',reject);child.once('close',code=>{clearTimeout(timer);children.delete(child);resolve({code,out,err});});});
  child.stdin.on('error',()=>{}); if(end)child.stdin.end(input);else child.stdin.write(input);
  return {child,done,output:()=>out};
}
async function run(args,input='',timeout){const r=await start(args,input,true,timeout).done;assert.equal(r.code,0,r.err.slice(-1800));return r.out.trim();}
const psql=(app='mcy-learner',role='postgres')=>['exec','-i','-e','PGAPPNAME='+app,db,'psql','-U',role,'-d','postgres','-X','-qAt','-v','ON_ERROR_STOP=1'];
const sql=q=>run(psql(),'\\set VERBOSITY verbose\n'+q);
async function until(fn,name,timeout=45000){const deadline=Date.now()+timeout;while(Date.now()<deadline){if(await fn())return;await new Promise(r=>setTimeout(r,200));}throw Error('Timeout: '+name);}
const pass=name=>{checks.push({name,status:'PASS'});console.log('PASS '+name);};
const identity=id=>`set role authenticated; set request.jwt.claim.sub='${id}'; set request.jwt.claim.role='authenticated';`;
const consent=(id,action='granted',purpose='wellbeing_data',version='wellbeing-data-review-0.1',key=randomUUID())=>identity(id)+`select public.record_my_consent('${purpose}','${action}','${version}','settings','${key}','web');`;
const save=(id,key,body='none_now',obs='[]',expected=id)=>identity(id)+`select row_to_json(s) from public.save_my_checkin_for_current_user_with_current_consent('${expected}','2026-10-11','Asia/Bangkok',2::smallint,'${body}','standalone','${obs}'::jsonb,'${key}')s;`;
const grants=id=>['terms','privacy','wellbeing_data'].map(p=>consent(id,'granted',p,p==='wellbeing_data'?'wellbeing-data-review-0.1':`${p}-review-0.1`)).join('\n');
async function denied(q,code){const r=await start(psql(),'\\set VERBOSITY verbose\n'+q).done;assert.notEqual(r.code,0);assert.ok(r.err.includes(code),r.err);}
const count=()=>sql('select count(*) from public.checkins;');
const waiting=app=>sql(`select count(*) from pg_stat_activity where application_name='${app}' and wait_event_type='Lock';`);
async function block() {const b=start(psql('mcy-insert-blocker'),"begin; select pg_advisory_xact_lock(991117); select 'BARRIER_HELD';\n",false);await until(()=>b.output().includes('BARRIER_HELD'),'insert barrier');return b;}
async function release(b){b.child.stdin.end('commit;\n');assert.equal((await b.done).code,0);}
const trigger=`create or replace function public.mcy_fixture_insert_barrier() returns trigger language plpgsql as $$begin perform pg_advisory_xact_lock(991117);return new;end;$$;
 create trigger mcy_fixture_barrier before insert on public.checkins for each row execute function public.mcy_fixture_insert_barrier();`;
let status='FAIL',failure,cleanup=false;
try {
  await run(['network','create','--internal','--label',label,network]);
  await run(['run','-d','--pull=never','--name',db,'--label',label,'--network',network,'--memory','1g','--cpus','2','-e','POSTGRES_INITDB_ARGS=--no-sync','-e','POSTGRES_PASSWORD='+password,image]);
  await until(async()=>{const r=await start(['logs',db]).done;return /init process complete/.test(r.out+r.err);},'initialization',120000);
  await until(async()=>(await start(['exec',db,'pg_isready','-U','postgres']).done).code===0,'ready');
  const inspected=JSON.parse(await run(['inspect',db]))[0];assert.equal(inspected.Config.Labels[labelKey],suffix);assert.deepEqual(inspected.HostConfig.PortBindings,{});assert.ok(!inspected.Mounts.some(m=>m.Type==='bind'));
  const defaults=['supabase_admin','postgres'].flatMap(role=>['','in schema public'].flatMap(scope=>['functions','tables','sequences'].map(kind=>`alter default privileges for role ${role} ${scope} revoke all on ${kind} from public,anon,authenticated,service_role;`))).join('\n');
  await run(psql('mcy-bootstrap','supabase_admin'),defaults+'\n'+schema.replace(/^CREATE SCHEMA "(public|private)";$/gm,'CREATE SCHEMA IF NOT EXISTS "$1";'),180000);
  await run(psql('mcy-fixtures','supabase_admin'),`alter table auth.users add column if not exists email_confirmed_at timestamptz; insert into auth.users(id,email,email_confirmed_at)values('${A}','a@example.test',now()),('${B}','b@example.test',now());`);
  await run(psql('mcy-current-auth-functions','supabase_admin'),authFunctions);
  await sql(baseline); await sql(grants(A)); await sql(grants(B)); await sql(trigger);
  let barrier=await block();
  let write=start(psql('mcy-baseline-write'),'\\set VERBOSITY verbose\n'+save(A,'baseline-race-key'));
  await until(async()=>await waiting('mcy-baseline-write')==='1','baseline waiting before INSERT');
  await sql(consent(A,'revoked')); await release(barrier); assert.equal((await write.done).code,0); assert.equal(await count(),'1');
  pass('Historical candidate reproduced real revoke-before-INSERT race in two independent sessions');
  await sql(grants(A)); const changed=JSON.parse(await sql(save(A,'baseline-race-key','reported','[{"region_code":"neck","state":"discomfort","level":1,"note":null}]')));
  assert.ok(changed.checkin_id);assert.equal(await sql(`select body_status from public.checkins where id='${changed.checkin_id}';`),'none_now');
  pass('Historical ID-only retry reproduced changed payload returning a different stored health state');
  await sql('drop trigger mcy_fixture_barrier on public.checkins;');
  const ownerMd5=await sql("select md5(pg_get_functiondef('public.mcy_ai_save_owner_config(uuid,integer,boolean,text,text,numeric,integer,integer,integer)'::regprocedure));");
  await sql(candidate); assert.equal(await sql("select md5(pg_get_functiondef('public.mcy_ai_save_owner_config(uuid,integer,boolean,text,text,numeric,integer,integer,integer)'::regprocedure));"),ownerMd5);
  for(const role of ['anon','authenticated','service_role']) {
    assert.equal(await sql(`select has_schema_privilege('${role}','private','USAGE');`),'f',role+' private schema');
    for(const table of ['public.checkins','public.checkin_observations','private.consent_events'])for(const privilege of ['INSERT','UPDATE','DELETE','TRUNCATE']) {
      const value=await sql(`select has_table_privilege('${role}','${table}','${privilege}');`);
      if(role!=='service_role'||table.startsWith('private.'))assert.equal(value,'f',role+' '+table+' '+privilege);
      else checks.push({name:role+' existing '+table+' '+privilege,value,status:'OBSERVED'});
    }
    assert.equal(await sql(`select has_function_privilege('${role}','private.save_my_checkin_expanded(date,text,smallint,text,text,jsonb,text)','EXECUTE');`),'f',role+' private helper');
  }
  await denied(`set role anon; select * from public.save_my_checkin_for_current_user_with_current_consent('${A}','2026-10-11','Asia/Bangkok',2::smallint,'none_now','standalone','[]','anonymous-key');`,'42501');
  await denied(save(A,'cross-user-key','none_now','[]',B),'28000');
  await denied(identity(A)+"select * from public.save_my_checkin_with_current_consent('2026-10-11','Asia/Bangkok',2::smallint,'none_now','standalone','[]','old-client-key');",'42501');
  pass('Client INSERT/UPDATE/DELETE/TRUNCATE/helper denied; private service access denied; existing public service ACL observed; Owner definition unchanged');
  const obs='[{"region_code":"neck","state":"discomfort","level":1,"note":"fixture"}]';
  const one=JSON.parse(await sql(save(A,'exact-retry-key','reported',obs))),two=JSON.parse(await sql(save(A,'exact-retry-key','reported',obs)));assert.equal(one.checkin_id,two.checkin_id);
  await denied(save(A,'exact-retry-key','none_now','[]'),'22023');
  assert.equal(await sql(identity(B)+'select count(*) from public.checkins;'),'0');
  const before=await count(); await sql(consent(A,'granted','privacy','stale-version')); await denied(save(A,'stale-consent-key'),'42501');assert.equal(await count(),before);await sql(grants(A));
  await denied('begin isolation level repeatable read; '+save(A,'snapshot-isolation-key'),'0A000');
  pass('Valid exact retry returns one row; changed payload, cross-user read, stale consent and higher snapshot isolation fail closed');
  const first=start(psql('mcy-exact-first'),'begin; '+save(A,'parallel-same-key')+" select 'FIRST_SAVED';\n",false);
  await until(()=>first.output().includes('FIRST_SAVED'),'first save');
  const second=start(psql('mcy-exact-second'),save(A,'parallel-same-key'));
  await until(async()=>await waiting('mcy-exact-second')==='1','same actor serialized');await release(first);assert.equal((await second.done).code,0);
  assert.equal(await sql("select count(*) from public.checkins where idempotency_key='parallel-same-key';"),'1');
  pass('Concurrent exact retry serializes across real sessions and creates one check-in');
  const revoke=start(psql('mcy-revoke-first'),'begin; '+consent(A,'revoked')+" select 'REVOKE_PENDING';\n",false);
  await until(()=>revoke.output().includes('REVOKE_PENDING'),'pending revoke');
  write=start(psql('mcy-write-after-revoke'),'\\set VERBOSITY verbose\n'+save(A,'after-revoke-key'));
  await until(async()=>await waiting('mcy-write-after-revoke')==='1','check-in waiting behind revoke');await release(revoke);
  const deniedWrite=await write.done;assert.notEqual(deniedWrite.code,0);assert.match(deniedWrite.err,/42501/);
  pass('Revoke holds actor lock first: waiting check-in refreshes consent after commit and writes no row');
  await sql(grants(A));await sql(trigger);barrier=await block();
  write=start(psql('mcy-protected-insert'),save(A,'protected-insert-key'));
  await until(async()=>await waiting('mcy-protected-insert')==='1','protected INSERT barrier');
  const pendingRevoke=start(psql('mcy-revoke-after-write'),consent(A,'revoked'));
  await until(async()=>await waiting('mcy-revoke-after-write')==='1','revoke serialized behind check-in');await release(barrier);
  assert.equal((await write.done).code,0);assert.equal((await pendingRevoke.done).code,0);await denied(save(A,'post-revocation-key'),'42501');
  pass('Check-in holds lock first: revocation waits until save commits; every later write denied');
  await sql('drop trigger mcy_fixture_barrier on public.checkins;');await sql(grants(A));
  const consentKey=randomUUID();const c1=await sql(consent(A,'granted','notifications','notifications-review-0.1',consentKey)),c2=await sql(consent(A,'granted','notifications','notifications-review-0.1',consentKey));assert.equal(c1,c2);
  await denied(consent(A,'revoked','notifications','notifications-review-0.1',consentKey),'22023');
  pass('Consent retry preserves original event; reused key with different action rejected without quota migration');
  await run(psql('mcy-api-password','supabase_admin'),`alter role authenticator password '${password}';`);
  await run(['run','-d','--pull=never','--name',api,'--label',label,'--network',network,'-e',`PGRST_DB_URI=postgresql://authenticator:${password}@${db}:5432/postgres`,'-e','PGRST_DB_SCHEMAS=public','-e','PGRST_DB_ANON_ROLE=anon','-e','PGRST_JWT_SECRET='+secret,restImage]);
  await until(async()=>{const r=await start(['exec',db,'curl','--silent','--fail','--max-time','2',`http://${api}:3000/`]).done;return r.code===0;},'PostgREST HTTP');
  const encode=v=>Buffer.from(JSON.stringify(v)).toString('base64url');const unsigned=encode({alg:'HS256',typ:'JWT'})+'.'+encode({role:'authenticated',sub:A,exp:Math.floor(Date.now()/1000)+300});const token=unsigned+'.'+createHmac('sha256',secret).update(unsigned).digest('base64url');
  const payload={p_expected_user_id:A,p_local_date:'2026-10-11',p_local_timezone:'Asia/Bangkok',p_energy_level:2,p_body_status:'none_now',p_capture_type:'standalone',p_observations:[],p_idempotency_key:'real-http-checkin-key'};
  const response=await run(['exec','-i',db,'curl','--silent','--show-error','--max-time','8','--write-out','\n%{http_code}','-H','Content-Type: application/json','-H','Authorization: Bearer '+token,'--data-binary','@-',`http://${api}:3000/rpc/save_my_checkin_for_current_user_with_current_consent`],JSON.stringify(payload));
  assert.ok(response.endsWith('\n200'),response);assert.ok(JSON.parse(response.slice(0,response.lastIndexOf('\n')))[0].checkin_id);
  pass('Real PostgREST authenticated HTTP 200 under current consent and actor-bound payload'); status='PASS';
}catch(error){failure=error.message;console.error('FAIL '+failure);}
finally {
  for(const child of children){try{child.stdin.end('rollback;\n');}catch{}child.kill();}
  for(const name of [api,db]){const found=await start(['inspect','--format',`{{index .Config.Labels "${labelKey}"}}`,name]).done;if(found.code===0){assert.equal(found.out.trim(),suffix);await run(['rm','-f','-v',name]);}assert.notEqual((await start(['inspect',name]).done).code,0);}
  const found=await start(['network','inspect','--format',`{{index .Labels "${labelKey}"}}`,network]).done;if(found.code===0){assert.equal(found.out.trim(),suffix);await run(['network','rm',network]);}assert.notEqual((await start(['network','inspect',network]).done).code,0);cleanup=true;
  writeFileSync('analyse/MCY_LEARNER_WRITES_DOCKER_2026-10-11.json',JSON.stringify({kind:'LearnerWriteDockerRehearsal',capturedAt:new Date().toISOString(),status,checks,failure,migrationPath,migrationSha256:hash(candidate),baselineSha256:hash(baseline),schemaSha256:hash(schema),authFunctionsSha256:hash(authFunctions),harnessSha256:hash(readFileSync(new URL(import.meta.url))),images:{image,restImage},cloudRequests:false,realActorTests:false,cleanupVerified:cleanup},null,2)+'\n');
  console.log('PASS Owned rehearsal resources removed');
}
if(status!=='PASS')process.exitCode=1;
