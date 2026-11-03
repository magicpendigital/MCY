// Isolated PostgreSQL/PostgREST rehearsal. Never reads .env.local or cloud credentials.
// Input: a schema-only public/private export; all row fixtures below are fictional.
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createHash, createHmac, randomUUID } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const docker = process.env.MCY_DOCKER_PATH || 'C:/Program Files/Docker/Docker/resources/bin/docker.exe';
const schemaFile = process.env.MCY_OWNER_SCHEMA_ONLY_FILE;
const receiptFile = process.env.MCY_OWNER_DOCKER_RECEIPT;
assert.ok(schemaFile && receiptFile, 'Provide explicit schema-only input and receipt output paths');
const schema = readFileSync(schemaFile, 'utf8');
assert.match(schema, /CREATE TABLE (?:"private"\."ai_configurations"|private\.ai_configurations)/);
assert.ok(!/^COPY .+ FROM stdin|^INSERT INTO /mi.test(schema), 'Input must contain schema only, not dumped rows');
const migrationPath = 'supabase/migrations/20261007174155_fix_owner_config_conflict_sqlstate.sql';
const repair = readFileSync(resolve(migrationPath), 'utf8');
const hash = value => createHash('sha256').update(value).digest('hex');
const harnessSha256 = hash(readFileSync(new URL(import.meta.url)));
assert.equal(hash(repair), 'b7f8637c4568cbb138c680089214d14b308567d2ae0eb52990c22b73976d1fab');
const suffix = randomUUID().replaceAll('-', '').slice(0, 12);
const prefix = 'mcy-owner-rehearsal-';
const db = prefix + suffix;
const api = db + '-api';
const network = db + '-net';
const label = 'mcy.owner.rehearsal=' + suffix;
const image = 'public.ecr.aws/supabase/postgres:17.6.1.139';
const restImage = 'public.ecr.aws/supabase/postgrest:v14.13';
const password = 'fictional-local-owner-rehearsal-password';
const jwtSecret = 'fictional-local-owner-rehearsal-jwt-secret-20261009';
const owner = '33000000-0000-4000-8000-000000000001';
const learner = '33000000-0000-4000-8000-000000000002';
const expired = '33000000-0000-4000-8000-000000000003';
const revoked = '33000000-0000-4000-8000-000000000004';
const signature = 'public.mcy_ai_save_owner_config(uuid,integer,boolean,text,text,numeric,integer,integer,integer)';
const checks = [];
const children = new Set();

function start(args, input = '', timeout = 30000, end = true) {
  const child = spawn(docker, args, { windowsHide: true, stdio: ['pipe', 'pipe', 'pipe'] });
  children.add(child);
  let stdout = '', stderr = '';
  child.stdout.setEncoding('utf8');
  child.stderr.setEncoding('utf8');
  child.stdout.on('data', value => { stdout += value; });
  child.stderr.on('data', value => { stderr += value; });
  const timer = setTimeout(() => child.kill(), timeout);
  const done = new Promise((accept, reject) => {
    child.once('error', reject);
    child.once('close', code => { clearTimeout(timer); children.delete(child); accept({ code, stdout, stderr }); });
  });
  child.stdin.on('error', () => {});
  if (end) child.stdin.end(input); else child.stdin.write(input);
  return { child, done, output: () => stdout };
}
async function run(args, input = '', timeout) {
  const result = await start(args, input, timeout).done;
  if (result.code !== 0) throw new Error('Local Docker command failed: ' + args[0] + '; ' + result.stderr.slice(-1600));
  return result.stdout.trim();
}
const psqlArgs = (application,user='postgres') => ['exec', '-i', '-e', 'PGAPPNAME=' + application, db, 'psql', '-U', user, '-d', 'postgres', '-X', '-At', '-v', 'ON_ERROR_STOP=1'];
const sql = query => run(psqlArgs('mcy-owner-rehearsal'), '\\set VERBOSITY verbose\n' + query);
const json = async query => JSON.parse(await sql(query));
const pause = ms => new Promise(accept => setTimeout(accept, ms));
async function until(predicate, description, timeout = 20000) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) { if (await predicate()) return; await pause(150); }
  throw new Error('Local timeout: ' + description);
}
const pass = name => { checks.push({ name, status: 'PASS' }); console.log('PASS ' + name); };
const save = (actor, version) => `select public.mcy_ai_save_owner_config('${actor}',${version},false,'','Fictional prompt used only for an isolated Owner repair rehearsal.',0.3,320,10,100);`;
const rowState = () => json(`select json_build_object('version',(select version_no from private.ai_configurations),'enabled',(select enabled from private.ai_configurations),'audit',(select count(*) from private.audit_events));`);
const metadata = () => json(`select row_to_json(q) from (select oid,proowner,proacl::text as acl,proconfig,prosecdef,md5(pg_get_functiondef(oid)) as fingerprint from pg_proc where oid='${signature}'::regprocedure) q;`);
async function snapshot() {
  return json(`select json_build_object(
    'tables',(select json_agg(row_to_json(t) order by t.schema,t.name) from (select n.nspname as schema,c.relname as name,c.relacl::text as acl,c.relrowsecurity,c.relforcerowsecurity from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname in ('public','private') and c.relkind='r') t),
    'policies',(select json_agg(row_to_json(p) order by schemaname,tablename,policyname) from pg_policies p where schemaname in ('public','private')));`);
}
function token(role) {
  const b64 = value => Buffer.from(JSON.stringify(value)).toString('base64url');
  const unsigned = b64({ alg: 'HS256', typ: 'JWT' }) + '.' + b64({ role, exp: Math.floor(Date.now()/1000)+300 });
  return unsigned + '.' + createHmac('sha256', jwtSecret).update(unsigned).digest('base64url');
}
async function http(role, payload) {
  const out = await run(['exec', '-i', db, 'curl', '--silent', '--show-error', '--max-time', '8', '--write-out', '\n%{http_code}', '-H', 'Content-Type: application/json', '-H', 'Authorization: Bearer ' + token(role), '--data-binary', '@-', `http://${api}:3000/rpc/mcy_ai_save_owner_config`], JSON.stringify(payload));
  const split = out.lastIndexOf('\n');
  return { status: Number(out.slice(split+1)), body: JSON.parse(out.slice(0,split)) };
}
const payload = (actor, version) => ({p_actor_id:actor,p_expected_version:version,p_enabled:false,p_model_id:'',p_system_prompt:'Fictional prompt used only for an isolated Owner repair rehearsal.',p_temperature:0.3,p_max_output_tokens:320,p_per_user_daily_limit:10,p_global_daily_limit:100});
let result = 'FAIL';
let errorMessage;
let schemaMetadataHash;
let cleanupPassed = false;
try {
  await run(['network','create','--internal','--label',label,network]);
  await run(['run','--detach','--pull=never','--name',db,'--label',label,'--network',network,'--memory','1g','--cpus','2','--env','POSTGRES_PASSWORD='+password,image]);
  // pg_isready also succeeds against the entrypoint's temporary initialization server.
  // Wait for all platform migrations to finish before importing app DDL.
  await until(async () => {
    const logs=await start(['logs',db]).done;
    return /init process complete|Skipping initialization/.test(logs.stdout+logs.stderr);
  },'platform initialization completed',90000);
  await until(async () => (await start(['exec',db,'pg_isready','-U','postgres']).done).code===0,'PostgreSQL readiness');
  const inspected = JSON.parse(await run(['inspect',db]))[0];
  assert.equal(inspected.Config.Labels['mcy.owner.rehearsal'], suffix);
  assert.deepEqual(inspected.HostConfig.PortBindings, {});
  assert.equal(JSON.parse(await run(['network','inspect',network]))[0].Internal,true);
  assert.ok(!inspected.Mounts.some(mount => mount.Type === 'bind'), 'No host bind mount');
  pass('Docker network is internal, no published ports or host data mounts');
  // The image initializes Auth users/functions and platform roles. This Owner scope
  // has no Storage table dependency; leave the platform-owned Storage schema untouched.
  // Restore only the explicitly exported app schemas into this NEW fictional database.
  // Preserve platform extensions/event-trigger dependencies already installed by the image.
  // Only schema declarations are made repeat-safe; app objects restore unchanged.
  // Only the local restore uses the image's bootstrap superuser, because pg_dump
  // includes platform-owned default privileges. Explicit dumped owners/ACLs remain.
  // pg_dump expects initially empty function default grants. The platform image
  // grants anon/authenticated on new functions; remove these LOCAL restore defaults
  // before creation, then let dumped explicit ACLs/default-ACL statements restore truth.
  const restoreDefaults=['supabase_admin','postgres'].flatMap(role=>['','in schema public'].flatMap(scope=>['functions','tables','sequences'].map(kind=>
    `alter default privileges for role ${role} ${scope} revoke all on ${kind} from public,anon,authenticated,service_role;`))).join('\n');
  await run(psqlArgs('mcy-owner-bootstrap','supabase_admin'),'\\set VERBOSITY verbose\n'+restoreDefaults+'\n'+schema.replace(/^CREATE SCHEMA "(public|private)";$/gm,'CREATE SCHEMA IF NOT EXISTS "$1";'));
  const initial = await metadata();
  assert.equal(initial.fingerprint,'1591e77afdfc0dacb6b39200d7bbefc2');
  assert.equal(initial.acl,'{postgres=X/postgres,service_role=X/postgres}');
  const baseline = await snapshot();
  schemaMetadataHash = hash(JSON.stringify(baseline));
  pass('Actual staging schema-only export restores with the exact reviewed Owner definition and ACL');
  await sql(`insert into auth.users(id,email) values ('${owner}','owner@example.test'),('${learner}','learner@example.test'),('${expired}','expired@example.test'),('${revoked}','revoked@example.test');
    insert into private.role_assignments(user_id,role,scope_type,reason,starts_at,ends_at) values ('${owner}','owner','global','Fictional Owner rehearsal',now()-interval '1 hour',now()+interval '1 day'),('${expired}','owner','global','Fictional expired rehearsal',now()-interval '2 hours',now()-interval '1 hour'),('${revoked}','owner','global','Fictional revoked rehearsal',now()-interval '1 hour',now()+interval '1 day');
    update private.role_assignments set status='revoked',revoked_at=now() where user_id='${revoked}';
    insert into private.ai_configurations(singleton,enabled,model_id,system_prompt) values(true,false,'','Fictional prompt used only for an isolated Owner repair rehearsal.');`);
  const rows = await rowState();
  await sql(repair);
  const patched = await metadata();
  assert.equal(patched.fingerprint,'5ad67fe52caf79bd07c51caa0c30db92');
  for(const key of ['oid','proowner','acl','proconfig','prosecdef']) assert.deepEqual(patched[key],initial[key]);
  assert.deepEqual(await snapshot(),baseline); assert.deepEqual(await rowState(),rows);
  pass('Selective upgrade preserves function identity, table ACL/RLS/policies and config/audit rows');
  for(const actor of [learner,expired,revoked]) {
    const denied=await start(psqlArgs('mcy-owner-denied'),`\\set VERBOSITY verbose\nset role service_role; ${save(actor,1)}`).done;
    assert.notEqual(denied.code,0); assert.match(denied.stderr,/42501/);
  }
  for(const role of ['anon','authenticated']) {
    const denied=await start(psqlArgs('mcy-owner-client'),`\\set VERBOSITY verbose\nset role ${role}; ${save(owner,1)}`).done;
    assert.notEqual(denied.code,0); assert.match(denied.stderr,/42501/);
  }
  assert.deepEqual(await rowState(),rows);
  pass('Non-Owner, expired/revoked Owner and direct client execution denied without writes');
  const first = start(psqlArgs('mcy-owner-first'),`\\set VERBOSITY verbose\nbegin; set local role service_role; ${save(owner,1)} select 'FIRST_SAVED';\n`,30000,false);
  await until(()=>first.output().includes('FIRST_SAVED'),'first session holds updated row');
  const second = start(psqlArgs('mcy-owner-second'),`\\set VERBOSITY verbose\nset role service_role; ${save(owner,1)}`);
  await until(async()=>await sql("select count(*) from pg_stat_activity where application_name='mcy-owner-second' and wait_event_type='Lock';") === '1','second session waits on actual row lock');
  first.child.stdin.end('commit;\n');
  const [one,two] = await Promise.all([first.done,second.done]);
  assert.equal(one.code,0); assert.notEqual(two.code,0); assert.match(two.stderr,/PT409/);
  assert.deepEqual(await rowState(),{version:2,enabled:false,audit:rows.audit+1});
  assert.equal(await sql("select count(*) from pg_stat_activity where application_name like 'mcy-owner-%' and application_name <> 'mcy-owner-rehearsal';"),'0');
  pass('Two real PostgreSQL sessions: one commit, one PT409, one audit, no lingering save backend');
  const beforeRetry=await rowState(); await sql(repair); assert.deepEqual(await rowState(),beforeRetry);
  pass('Exact forward-repair retry is a no-op after committed upgrade');
  await run(psqlArgs('mcy-owner-http-bootstrap','supabase_admin'),`alter role authenticator with password '${password}'; grant service_role,authenticated,anon to authenticator;`);
  await run(['run','--detach','--pull=never','--name',api,'--label',label,'--network',network,'--memory','256m','--env',`PGRST_DB_URI=postgres://authenticator:${password}@${db}:5432/postgres`,'--env','PGRST_DB_SCHEMAS=public','--env','PGRST_DB_ANON_ROLE=anon','--env','PGRST_JWT_SECRET='+jwtSecret,restImage]);
  await until(async()=> (await start(['exec',db,'curl','--silent','--fail','--max-time','2',`http://${api}:3000/`]).done).code===0,'PostgREST readiness');
  const beforeHttp=await rowState();
  const stale=await http('service_role',payload(owner,1)); assert.equal(stale.status,409); assert.equal(stale.body.code,'PT409');
  const denied=await http('service_role',payload(revoked,2)); assert.equal(denied.status,403); assert.equal(denied.body.code,'42501');
  const direct=await http('authenticated',payload(owner,2)); assert.equal(direct.status,403); assert.equal(direct.body.code,'42501');
  assert.deepEqual(await rowState(),beforeHttp);
  await pause(1200);
  assert.equal(await sql("select count(*) from pg_stat_activity where usename='authenticator' and query ilike '%mcy_ai_save_owner_config%' and state <> 'idle';"),'0');
  const logs=await start(['logs',api]).done; assert.equal(logs.code,0); assert.ok(!(logs.stdout+logs.stderr).includes('40001'));
  pass('Local PostgREST 14.13 returns HTTP 409/PT409 and permission denials without writes or continuing active retries');
  const valid=await http('service_role',payload(owner,2)); assert.equal(valid.status,200);
  assert.deepEqual(await rowState(),{version:3,enabled:false,audit:rows.audit+2});
  pass('Local HTTP normal AI-off save commits exactly one version and one audit');
  result='PASS';
} catch(error) { errorMessage=error.message; console.error('FAIL isolated Owner rehearsal: '+errorMessage); }
finally {
  for(const child of children) child.kill();
  const cleanupErrors=[];
  // Always inspect exact randomized names: a timed-out create may still succeed
  // in the daemon. One cleanup failure must not skip the other owned resources.
  for(const [name,isNetwork] of [[api,false],[db,false],[network,true]]) {
    try {
      assert.ok(name.startsWith(prefix));
      const inspectArgs=isNetwork?['network','inspect',name]:['inspect',name];
      const absent=r=>r.code!==0 && /no such (?:object|container|network)|network .+ not found/i.test(r.stderr);
      const inspected=await start(inspectArgs).done;
      if(!absent(inspected)) {
        assert.equal(inspected.code,0,'Cannot inspect owned fixture');
        const item=JSON.parse(inspected.stdout)[0];
        assert.equal((isNetwork?item.Labels:item.Config.Labels)['mcy.owner.rehearsal'],suffix,'Fixture label mismatch');
        await run(isNetwork?['network','rm',name]:['rm','--force','--volumes',name]);
      }
      assert.ok(absent(await start(inspectArgs).done),'Fixture absence not verified');
    } catch { cleanupErrors.push(name); }
  }
  cleanupPassed=cleanupErrors.length===0;
  if(!cleanupPassed) { result='FAIL'; console.error('FAIL cleanup: exact fixture removal could not be verified for '+cleanupErrors.join(', ')); }
  else console.log('PASS All exact labelled containers/network removed and absence verified');
  writeFileSync(receiptFile,JSON.stringify({schemaVersion:1,kind:'IsolatedOwnerPostgresRehearsal',status:result,exitCode:result==='PASS'?0:1,executedAt:new Date().toISOString(),harnessSha256,migration:{path:migrationPath,sha256:hash(repair)},schemaOnly:{sha256:hash(schema),source:'Official CLI ephemeral login-role plus cached PostgreSQL 17.6 schema-only pg_dump; public/private, no data export',metadataSha256:schemaMetadataHash},environment:{postgresImage:image,postgrestImage:restImage,internalNetwork:true,publishedPorts:false,fictionalRows:true},checks,cleanupPassed,limitations:['Platform image and PostgREST minor versions differ from staging; Auth scaffold is not current GoTrue schema','Local restore default grants normalized; snapshot covers app tables/policies and target RPC, not full-platform equivalence','No live Edge/Auth-token or hosted frontend evidence; retry observation is 1.2 seconds','Schema export is not data/Storage backup; no broad rollback to 40001'],releaseAuthorized:false},null,2)+'\n');
}
process.exitCode=result==='PASS'?0:1;
