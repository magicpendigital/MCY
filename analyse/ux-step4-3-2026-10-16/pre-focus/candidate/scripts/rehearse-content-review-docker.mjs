// Exact app-schema upgrade in isolated PostgreSQL/PostgREST; fictional rows only.
// Never reads .env.local; no published ports, cloud requests or host data mounts.
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {createHash,createHmac,randomUUID} from 'node:crypto';
import {readFileSync,writeFileSync} from 'node:fs';
const docker=process.env.MCY_DOCKER_PATH||'C:/Program Files/Docker/Docker/resources/bin/docker.exe';
const schemaFile=process.env.MCY_OWNER_SCHEMA_ONLY_FILE,receiptFile=process.env.MCY_CONTENT_DOCKER_RECEIPT;
assert.ok(schemaFile&&receiptFile,'Explicit schema and receipt paths required');
const schema=readFileSync(schemaFile,'utf8');
assert.ok(!/^COPY .+ FROM stdin|^INSERT INTO /mi.test(schema),'Schema only');
const migrationPath='supabase/migrations/20261010113419_owner_content_review.sql';
const migration=readFileSync(migrationPath,'utf8'),hash=v=>createHash('sha256').update(v).digest('hex');
const harnessSha256=hash(readFileSync(new URL(import.meta.url)));
assert.equal(hash(migration),'a206a63d3daa86747d8e3447193235ad88534775676a3582ac3ccd92472191c1');
const suffix=randomUUID().replaceAll('-','').slice(0,12),prefix='mcy-content-rehearsal-',db=prefix+suffix,api=db+'-api',network=db+'-net',label='mcy.content.rehearsal='+suffix;
const image='public.ecr.aws/supabase/postgres:17.6.1.139',restImage='public.ecr.aws/supabase/postgrest:v14.13';
const password='fictional-local-content-rehearsal-password',jwtSecret='fictional-local-content-rehearsal-jwt-secret-20261011';
const owner='44000000-0000-4000-8000-000000000001',teacher='44000000-0000-4000-8000-000000000002',learner='44000000-0000-4000-8000-000000000003',otherOwner='44000000-0000-4000-8000-000000000004';
const otherTeacher='44000000-0000-4000-8000-000000000005';
const children=new Set(),checks=[];
function start(args,input='',timeout=90000,end=true){
  const child=spawn(docker,args,{windowsHide:true,stdio:['pipe','pipe','pipe']});children.add(child);
  let stdout='',stderr='';child.stdout.setEncoding('utf8');child.stderr.setEncoding('utf8');
  child.stdout.on('data',v=>stdout+=v);child.stderr.on('data',v=>stderr+=v);
  const timer=setTimeout(()=>child.kill(),timeout);
  const done=new Promise((accept,reject)=>{child.once('error',reject);child.once('close',code=>{clearTimeout(timer);children.delete(child);accept({code,stdout,stderr});});});
  child.stdin.on('error',()=>{});if(end)child.stdin.end(input);else child.stdin.write(input);
  return {child,done,output:()=>stdout};
}
async function run(args,input='',timeout){const r=await start(args,input,timeout).done;assert.equal(r.code,0,'Local Docker '+args[0]+' failed: '+r.stderr.slice(-1400));return r.stdout.trim();}
const psql=(application,user='postgres')=>['exec','-i','-e','PGAPPNAME='+application,db,'psql','-U',user,'-d','postgres','-X','-At','-v','ON_ERROR_STOP=1'];
const sql=q=>run(psql('mcy-content-rehearsal'),'\\set VERBOSITY verbose\n'+q);
const json=async q=>JSON.parse(await sql(q)),pause=ms=>new Promise(r=>setTimeout(r,ms));
async function until(fn,name,timeout=20000){const end=Date.now()+timeout;while(Date.now()<end){if(await fn())return;await pause(150);}throw new Error('Timeout: '+name);}
const pass=name=>{checks.push({name,status:'PASS'});console.log('PASS '+name);};
const lit=v=>"'"+String(v).replaceAll("'","''")+"'";
const c=id=>({id,version:'a'.repeat(64),scope:'learning_intro',title:'Fictional technical fixture; not expert approval'});
const checklist=Object.fromEntries(['contentAccuracy','audienceScope','stopGuidance','accessibility','rightsConfirmed','expertiseConfirmed','vietnameseAudioReady','actualDurationChecked'].map(k=>[k,true]));
const save=(actor,candidate,revision,decision='approved')=>`select public.mcy_content_review_save('${actor}',${lit(JSON.stringify(candidate))}::jsonb,${revision},'${decision}','Fictional qualification; no actual expertise','Fictional technical test basis only','Fictional media rights test only',${lit(JSON.stringify(checklist))}::jsonb);`;
const assign=(actor,candidate,revision,active=true)=>`select public.mcy_content_reviewer_assign('${actor}',${lit(JSON.stringify(candidate))}::jsonb,${revision},'${teacher}',${active},7);`;
const counts=()=>json(`select json_build_object('states',(select count(*) from private.mcy_content_review_states),'events',(select count(*) from private.mcy_content_review_events),'assignments',(select count(*) from private.mcy_content_reviewer_assignments));`);
const config=()=>json(`select json_build_object('ai',(select json_build_object('enabled',enabled,'version',version_no,'model',model_id) from private.ai_configurations where singleton),'audit',(select count(*) from private.audit_events));`);
const snapshot=()=>json(`select json_build_object('tables',(select json_agg(row_to_json(t) order by t.oid) from (select c.oid,c.relacl::text,c.relrowsecurity from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname in ('public','private') and c.relkind='r' and c.relname not like 'mcy_content_%')t),'functions',(select json_agg(row_to_json(f) order by f.oid) from (select p.oid,p.proacl::text,p.proconfig,p.prosecdef,md5(pg_get_functiondef(p.oid)) as md5 from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname in ('public','private') and p.prokind='f' and p.proname not like 'mcy_content_%')f),'policies',(select json_agg(row_to_json(p) order by schemaname,tablename,policyname) from pg_policies p where schemaname in ('public','private')));`);
function token(role){const b64=v=>Buffer.from(JSON.stringify(v)).toString('base64url'),u=b64({alg:'HS256',typ:'JWT'})+'.'+b64({role,exp:Math.floor(Date.now()/1000)+300});return u+'.'+createHmac('sha256',jwtSecret).update(u).digest('base64url');}
async function http(role,rpc,payload){const out=await run(['exec','-i',db,'curl','--silent','--show-error','--max-time','8','--write-out','\n%{http_code}','-H','Content-Type: application/json','-H','Authorization: Bearer '+token(role),'--data-binary','@-',`http://${api}:3000/rpc/${rpc}`],JSON.stringify(payload));const i=out.lastIndexOf('\n');return {status:Number(out.slice(i+1)),body:JSON.parse(out.slice(0,i))};}
const savePayload=(actor,candidate,revision)=>({p_actor_id:actor,p_candidate:candidate,p_expected_revision:revision,p_decision:'changes_requested',p_qualification:'Fictional qualification; technical test only',p_review_basis:'Fictional technical fixture only',p_rights_basis:'Fictional rights fixture only',p_checklist:checklist});
async function denied(query,code='42501'){const r=await start(psql('mcy-content-denied'),'\\set VERBOSITY verbose\n'+query).done;assert.notEqual(r.code,0);assert.ok(r.stderr.includes(code),r.stderr);}
let status='FAIL',errorMessage,cleanupPassed=false,metadataSha256;
try{
  await run(['network','create','--internal','--label',label,network]);
  await run(['run','--detach','--pull=never','--name',db,'--label',label,'--network',network,'--memory','1g','--cpus','2','--env','POSTGRES_PASSWORD='+password,image]);
  await until(async()=>{const r=await start(['logs',db]).done;return /init process complete|Skipping initialization/.test(r.stdout+r.stderr);},'initialization',90000);
  await until(async()=>(await start(['exec',db,'pg_isready','-U','postgres']).done).code===0,'PostgreSQL ready');
  const inspected=JSON.parse(await run(['inspect',db]))[0];assert.equal(inspected.Config.Labels['mcy.content.rehearsal'],suffix);assert.deepEqual(inspected.HostConfig.PortBindings,{});assert.ok(!inspected.Mounts.some(m=>m.Type==='bind'));assert.equal(JSON.parse(await run(['network','inspect',network]))[0].Internal,true);
  pass('Internal network, no host mounts or published ports, fictional credentials');
  const defaults=['supabase_admin','postgres'].flatMap(role=>['','in schema public'].flatMap(scope=>['functions','tables','sequences'].map(kind=>`alter default privileges for role ${role} ${scope} revoke all on ${kind} from public,anon,authenticated,service_role;`))).join('\n');
  await run(psql('mcy-content-bootstrap','supabase_admin'),'\\set VERBOSITY verbose\n'+defaults+'\n'+schema.replace(/^CREATE SCHEMA "(public|private)";$/gm,'CREATE SCHEMA IF NOT EXISTS "$1";'),180000);
  assert.equal(await sql("select md5(pg_get_functiondef('public.mcy_ai_save_owner_config(uuid,integer,boolean,text,text,numeric,integer,integer,integer)'::regprocedure));"),'5ad67fe52caf79bd07c51caa0c30db92');
  const before=await snapshot();metadataSha256=hash(JSON.stringify(before));
  await sql(migration);assert.deepEqual(await snapshot(),before);
  pass('Fresh staging app-schema upgrade preserves all existing function definitions/ACL, table ACL/RLS and policies');
  // Cached image has only an old Auth scaffold, not current GoTrue migrations.
  // Add the verified-email column locally for synthetic identities only.
  await run(psql('mcy-content-auth-fixture','supabase_admin'),'alter table auth.users add column if not exists email_confirmed_at timestamptz;');
  await sql(`insert into auth.users(id,email,email_confirmed_at) values('${owner}','owner@example.test',now()),('${teacher}','teacher@example.test',now()),('${learner}','learner@example.test',now()),('${otherOwner}','other-owner@example.test',now()),('${otherTeacher}','other-teacher@example.test',now());
    insert into private.role_assignments(user_id,role,scope_type,reason) values('${owner}','owner','global','Fictional test'),('${otherOwner}','owner','global','Fictional test'),('${teacher}','teacher','global','Fictional test'),('${otherTeacher}','teacher','global','Fictional test');
    insert into public.teachers(user_id,public_name,active) values('${teacher}','Fictional teacher',true),('${otherTeacher}','Other fictional teacher',true);
    insert into private.ai_configurations(singleton,enabled,model_id,system_prompt) values(true,false,'','Fictional unchanged configuration used only for this isolated database rehearsal.');`);
  const untouched=await config();
  for(const role of ['anon','authenticated','service_role']){
    assert.equal(await sql(`select has_schema_privilege('${role}','private','USAGE');`),'f');
    for(const table of ['mcy_content_review_states','mcy_content_reviewer_assignments','mcy_content_review_events'])for(const privilege of ['SELECT','INSERT','UPDATE','DELETE','TRUNCATE'])assert.equal(await sql(`select has_table_privilege('${role}','private.${table}','${privilege}');`),'f');
    for(const sig of ['mcy_content_review_read(uuid,jsonb)','mcy_content_review_save(uuid,jsonb,integer,text,text,text,text,jsonb)','mcy_content_reviewer_assign(uuid,jsonb,integer,uuid,boolean,integer)'])assert.equal(await sql(`select has_function_privilege('${role}','public.${sig}','EXECUTE');`),role==='service_role'?'t':'f');
    await denied(`set role ${role}; select private.mcy_content_review_actor('${owner}');`);
  }
  const empty=await counts();await denied(`set role service_role; ${save(learner,c('denied'),0)}`);await denied(`set role service_role; ${save(teacher,c('denied'),0)}`);assert.deepEqual(await counts(),empty);
  pass('Effective private SELECT/write/TRUNCATE/helper ACL and service-only RPC EXECUTE; learner/unassigned teacher denied without rows');
  const candidate=c('parallel-version');
  const first=start(psql('mcy-content-first'),`\\set VERBOSITY verbose\nbegin; set local role service_role; ${save(owner,candidate,0)} select 'FIRST_SAVED';\n`,30000,false);
  await until(()=>first.output().includes('FIRST_SAVED'),'first transaction writes');
  const second=start(psql('mcy-content-second'),`\\set VERBOSITY verbose\nset role service_role; ${save(otherOwner,candidate,0)}`);
  await until(async()=>await sql("select count(*) from pg_stat_activity where application_name='mcy-content-second' and wait_event_type='Lock';")==='1','real version contention');
  first.child.stdin.end('commit;\n');const [a,b]=await Promise.all([first.done,second.done]);assert.equal(a.code,0);assert.notEqual(b.code,0);assert.match(b.stderr,/PT409/);assert.deepEqual(await counts(),{states:1,events:1,assignments:0});
  pass('Two independent actors/sessions contend: one version commit, one PT409, exactly one event');
  const expiry=c('expiry-lock');await sql(assign(owner,expiry,0));await sql(`update private.mcy_content_reviewer_assignments set expires_at=clock_timestamp()+interval '2 seconds' where candidate_id='expiry-lock';`);
  const blocker=start(psql('mcy-content-blocker'),`begin; select pg_advisory_xact_lock(hashtextextended('mcy-content-version:expiry-lock:${expiry.version}',0)); select 'LOCK_HELD';\n`,30000,false);
  await until(()=>blocker.output().includes('LOCK_HELD'),'version lock held');
  const waiting=start(psql('mcy-content-expiry'),`\\set VERBOSITY verbose\nset role service_role; ${save(teacher,expiry,1)}`);
  await until(async()=>await sql("select count(*) from pg_stat_activity where application_name='mcy-content-expiry' and wait_event_type='Lock';")==='1','teacher waiting');
  await until(async()=>await sql("select expires_at<clock_timestamp() from private.mcy_content_reviewer_assignments where candidate_id='expiry-lock';")==='t','assignment expired');
  const beforeExpiry=await counts();blocker.child.stdin.end('commit;\n');assert.equal((await blocker.done).code,0);const expired=await waiting.done;assert.notEqual(expired.code,0);assert.match(expired.stderr,/42501/);assert.deepEqual(await counts(),beforeExpiry);
  pass('Assignment expires while a real teacher transaction waits: post-lock wall-clock check denies without event');
  await sql(assign(owner,expiry,1));await sql(save(teacher,expiry,2));await sql(assign(owner,expiry,3,false));
  assert.equal(await sql("select decision from private.mcy_content_review_states where candidate_id='expiry-lock';"),'pending');await denied(`set role service_role; ${save(teacher,expiry,4)}`);
  const noOpBefore=await counts();const noOp=JSON.parse(await sql(assign(owner,expiry,4,false)));assert.equal(noOp.unchanged,true);assert.deepEqual(await counts(),noOpBefore);
  pass('Revocation invalidates decision and denies teacher; repeated revoke creates no new state/event');
  // FOR SHARE can evaluate its expiry predicate before waiting on an unchanged tuple.
  // The read boundary must refresh the clock after real role/profile row lock waits.
  for(const boundary of ['owner-role','teacher-profile']){
    if(boundary==='teacher-profile')await sql(assign(owner,expiry,4));
    const actor=boundary==='owner-role'?owner:teacher;
    await sql(`update private.role_assignments set starts_at=clock_timestamp()-interval '1 day',ends_at=clock_timestamp()+interval '2 seconds' where user_id='${actor}' and role='${boundary==='owner-role'?'owner':'teacher'}';`);
    const held=start(psql('mcy-content-role-blocker'),`begin;select 1 from ${boundary==='owner-role'?'private.role_assignments':'public.teachers'} where user_id='${actor}' for update;select 'ROLE_HELD';\n`,30000,false);
    await until(()=>held.output().includes('ROLE_HELD'),'row lock held');
    const reader=start(psql('mcy-content-read-expiry'),`\\set VERBOSITY verbose\nset role service_role;select public.mcy_content_review_read('${actor}',${lit(JSON.stringify([expiry]))}::jsonb);`);
    await until(async()=>await sql("select count(*) from pg_stat_activity where application_name='mcy-content-read-expiry' and wait_event_type='Lock';")==='1','reader waits on row');
    await until(async()=>await sql(`select ends_at<clock_timestamp() from private.role_assignments where user_id='${actor}' and role='${boundary==='owner-role'?'owner':'teacher'}';`)==='t','role expires');
    held.child.stdin.end('commit;\n');assert.equal((await held.done).code,0);const readResult=await reader.done;assert.notEqual(readResult.code,0,boundary+' read must deny after waiting past expiry');assert.match(readResult.stderr,/42501/);
    await sql(`update private.role_assignments set ends_at=null where user_id='${actor}';`);
  }
  pass('Read API refreshes wall-clock role expiry after actual unchanged role-row/profile-row lock waits');
  // Reach 19 fictional actions for the second Owner. Distinct versions must share actor quota lock.
  await sql(`insert into private.mcy_content_review_events(actor_id,candidate_id,content_version,revision,kind,payload) select '${otherOwner}','parallel-version','${candidate.version}',100+g,'review','{}'::jsonb from generate_series(1,19)g;`);
  const quotaFirst=start(psql('mcy-content-quota-first'),`begin;set local role service_role;${save(otherOwner,c('quota-a'),0)}select 'QUOTA_HELD';\n`,30000,false);await until(()=>quotaFirst.output().includes('QUOTA_HELD'),'quota transaction held');
  const quotaSecond=start(psql('mcy-content-quota-second'),`\\set VERBOSITY verbose\nset role service_role;${save(otherOwner,c('quota-b'),0)}`);await until(async()=>await sql("select count(*) from pg_stat_activity where application_name='mcy-content-quota-second' and wait_event_type='Lock';")==='1','real actor quota contention');
  quotaFirst.child.stdin.end('commit;\n');assert.equal((await quotaFirst.done).code,0);const capped=await quotaSecond.done;assert.notEqual(capped.code,0);assert.match(capped.stderr,/PT429/);assert.equal(await sql(`select count(*) from private.mcy_content_review_events where actor_id='${otherOwner}';`),'20');assert.equal(await sql("select count(*) from private.mcy_content_review_states where candidate_id='quota-b';"),'0');
  pass('Concurrent distinct versions serialize actor quota: twentieth action succeeds, twenty-first PT429 without row');
  await run(psql('mcy-content-http-bootstrap','supabase_admin'),`alter role authenticator with password '${password}';grant service_role,authenticated,anon to authenticator;`);
  await run(['run','--detach','--pull=never','--name',api,'--label',label,'--network',network,'--memory','256m','--env',`PGRST_DB_URI=postgres://authenticator:${password}@${db}:5432/postgres`,'--env','PGRST_DB_SCHEMAS=public','--env','PGRST_DB_ANON_ROLE=anon','--env','PGRST_JWT_SECRET='+jwtSecret,restImage]);
  await until(async()=>(await start(['exec',db,'curl','--silent','--fail','--max-time','2',`http://${api}:3000/`]).done).code===0,'PostgREST ready',120000);
  const readPayload=actor=>({p_actor_id:actor,p_candidates:[expiry]});
  const ownerQueue=await http('service_role','mcy_content_review_read',readPayload(owner));assert.equal(ownerQueue.status,200);assert.equal(ownerQueue.body.can_assign,true);
  const teacherQueue=await http('service_role','mcy_content_review_read',readPayload(teacher));assert.equal(teacherQueue.status,200);assert.equal(teacherQueue.body.items.length,1);assert.equal(teacherQueue.body.can_assign,false);
  assert.equal((await http('service_role','mcy_content_review_read',readPayload(learner))).status,403);
  for(const role of ['anon','authenticated'])assert.equal((await http(role,'mcy_content_review_read',readPayload(owner))).status,role==='anon'?401:403);
  assert.equal((await http('service_role','mcy_content_review_read',readPayload(otherTeacher))).status,403);
  assert.equal((await http('service_role','mcy_content_review_save',savePayload(otherTeacher,expiry,5))).status,403);
  await sql(`update private.role_assignments set starts_at=clock_timestamp()-interval '1 day',ends_at=clock_timestamp()-interval '1 second' where user_id='${teacher}';`);
  assert.equal((await http('service_role','mcy_content_review_read',readPayload(teacher))).status,403);await sql(`update private.role_assignments set ends_at=null where user_id='${teacher}';`);
  const assignPayload={p_actor_id:owner,p_candidate:c('http-assignment'),p_expected_revision:0,p_reviewer_id:teacher,p_active:true,p_expires_in_days:7};
  for(const role of ['anon','authenticated'])assert.equal((await http(role,'mcy_content_reviewer_assign',assignPayload)).status,role==='anon'?401:403);
  const assigned=await http('service_role','mcy_content_reviewer_assign',assignPayload);assert.equal(assigned.status,200);assert.equal(assigned.body.revision,1);
  assert.equal((await http('service_role','mcy_content_reviewer_assign',assignPayload)).status,409);
  assert.equal((await http('service_role','mcy_content_reviewer_assign',{...assignPayload,p_actor_id:teacher,p_expected_revision:1})).status,403);
  const legacy=await http('service_role','mcy_ai_get_owner_config',{p_actor_id:owner});assert.equal(legacy.status,200);assert.equal(legacy.body.version_no,1);assert.equal(legacy.body.enabled,false);
  pass('Real HTTP read/assign RPCs: Owner and assigned teacher allowed; learner/expired/client/cross-teacher denied; stale409 and old Owner read compatible');
  const rpc='mcy_content_review_save',beforeHttp=await counts();
  for(const role of ['anon','authenticated'])assert.equal((await http(role,rpc,savePayload(owner,candidate,1))).status,role==='anon'?401:403);
  const stale=await http('service_role',rpc,savePayload(owner,candidate,0));assert.equal(stale.status,409);assert.equal(stale.body.code,'PT409');
  assert.equal((await http('service_role',rpc,savePayload(learner,candidate,1))).status,403);
  const cap=await http('service_role',rpc,savePayload(otherOwner,c('quota-http'),0));assert.equal(cap.status,429);assert.equal(cap.body.code,'PT429');assert.deepEqual(await counts(),beforeHttp);
  const valid=await http('service_role',rpc,savePayload(owner,candidate,1));assert.equal(valid.status,200);assert.equal(valid.body.revision,2);assert.equal(valid.body.published,false);
  const afterHttp=await counts();assert.equal(afterHttp.events,beforeHttp.events+1);assert.equal(afterHttp.states,beforeHttp.states);
  pass('Real PostgREST HTTP403/409/429 and one normal200 write, no client grants or forbidden side effects');
  await pause(1200);assert.equal(await sql("select count(*) from pg_stat_activity where application_name like 'mcy-content-%' and application_name<>'mcy-content-rehearsal';"),'0');
  assert.equal(await sql("select count(*) from pg_stat_activity where usename='authenticator' and state<>'idle';"),'0');const logs=await start(['logs',api]).done;assert.equal(logs.code,0);assert.ok(!(logs.stdout+logs.stderr).includes('40001'));
  assert.deepEqual(await config(),untouched);assert.deepEqual(await snapshot(),before);
  pass('AI configuration and old application metadata untouched; no active writes or 40001 in bounded observation');status='PASS';
}catch(error){errorMessage=error.message;console.error('FAIL content review Docker rehearsal: '+errorMessage);const logs=await start(['logs',api]).done;if(logs.code===0)console.error('Fictional local PostgREST diagnostics: '+(logs.stdout+logs.stderr).slice(-2000));}
finally{
  for(const child of children)child.kill();const cleanupErrors=[];
  for(const [name,isNetwork] of [[api,false],[db,false],[network,true]])try{
    assert.ok(name.startsWith(prefix));const args=isNetwork?['network','inspect',name]:['inspect',name],absent=r=>r.code!==0&&/no such (?:object|container|network)|network .+ not found/i.test(r.stderr),r=await start(args).done;
    if(!absent(r)){assert.equal(r.code,0);const item=JSON.parse(r.stdout)[0];assert.equal((isNetwork?item.Labels:item.Config.Labels)['mcy.content.rehearsal'],suffix);await run(isNetwork?['network','rm',name]:['rm','--force','--volumes',name]);}
    assert.ok(absent(await start(args).done));
  }catch{cleanupErrors.push(name);}
  cleanupPassed=!cleanupErrors.length;if(!cleanupPassed){status='FAIL';console.error('FAIL fixture cleanup '+cleanupErrors.join(', '));}else console.log('PASS Exact labelled fixture cleanup and absence verified');
  if(hash(readFileSync(new URL(import.meta.url)))!==harnessSha256){status='FAIL';errorMessage='Harness changed while running';}
  writeFileSync(receiptFile,JSON.stringify({schemaVersion:1,kind:'ContentReviewDockerPostgrestRehearsal',status,exitCode:status==='PASS'?0:1,executedAt:new Date().toISOString(),harnessSha256,migration:{path:migrationPath,sha256:hash(migration)},schemaOnly:{sha256:hash(schema),metadataSha256},environment:{postgresImage:image,postgrestImage:restImage,fictionalRows:true,internalNetwork:true,publishedPorts:false},checks,cleanupPassed,errorMessage,limitations:['Cached PostgreSQL/PostgREST minor versions differ from staging; app-schema equivalence only; verified-email column added to old Auth scaffold','No hosted Edge/Auth credentials or clinical/media-rights approval','Readiness observation is bounded; clean migration replay covered separately'],releaseAuthorized:false},null,2)+'\n');
}
process.exitCode=status==='PASS'?0:1;
