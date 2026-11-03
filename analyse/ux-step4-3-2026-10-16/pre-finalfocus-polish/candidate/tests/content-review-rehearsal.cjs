// Disposable PostgreSQL 17 WASM rehearsal. Fictional actors only; no live calls.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {before,after,test} = require('node:test');
const engine = process.env.MCY_PGLITE_MODULE_PATH || '@electric-sql/pglite';
const {PGlite} = require(engine);
const {pgcrypto} = require(path.join(engine,'dist/contrib/pgcrypto.cjs'));
const dir = path.join(__dirname,'../supabase/migrations');
const migration = fs.readFileSync(path.join(dir,'20261010113419_owner_content_review.sql'),'utf8');
const owner='44000000-0000-4000-8000-000000000001', teacher='44000000-0000-4000-8000-000000000002', learner='44000000-0000-4000-8000-000000000003', other='44000000-0000-4000-8000-000000000004', dual='44000000-0000-4000-8000-000000000005';
const checks=Object.fromEntries(['contentAccuracy','audienceScope','stopGuidance','accessibility','rightsConfirmed','expertiseConfirmed','vietnameseAudioReady','actualDurationChecked'].map(k=>[k,true]));
const candidate=(id,scope='learning_intro',version='a'.repeat(64))=>({id,scope,version,title:'Fictional technical review fixture only'});
let db;
const one=async(sql,args=[]) => (await db.query(sql,args)).rows[0];
const read=async(actor,candidates)=>(await one('select public.mcy_content_review_read($1::uuid,$2::jsonb) as value',[actor,JSON.stringify(candidates)])).value;
const save=async(actor,c,revision,decision='approved',checklist=checks)=>(await one('select public.mcy_content_review_save($1::uuid,$2::jsonb,$3,$4,$5,$6,$7,$8::jsonb) as value',[actor,JSON.stringify(c),revision,decision,'Fictional qualification; not an expert approval','Fictional technical test basis only','Fictional rights evidence; not real media rights',JSON.stringify(checklist)])).value;
const assign=async(actor,c,revision,target=teacher,active=true,days=7)=>(await one('select public.mcy_content_reviewer_assign($1::uuid,$2::jsonb,$3,$4::uuid,$5,$6) as value',[actor,JSON.stringify(c),revision,target,active,days])).value;
const counts=()=>one('select (select count(*) from private.mcy_content_review_events)::integer as events,(select count(*) from private.mcy_content_review_states)::integer as states,(select count(*) from private.mcy_content_reviewer_assignments)::integer as assignments');
before(async()=>{
  db=new PGlite({extensions:{pgcrypto}});
  await db.exec(`create role anon; create role authenticated; create role service_role bypassrls;
    create schema auth; create schema storage; create schema extensions;
    create table auth.users(id uuid primary key,email text,raw_user_meta_data jsonb default '{}'::jsonb,raw_app_meta_data jsonb default '{}'::jsonb,email_confirmed_at timestamptz,created_at timestamptz default now());
    create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
    create function auth.role() returns text language sql stable as $$select nullif(current_setting('request.jwt.claim.role',true),'')$$;
    create function auth.jwt() returns jsonb language sql stable as $$select coalesce(nullif(current_setting('request.jwt.claims',true),''),'{}')::jsonb$$;
    create table storage.buckets(id text primary key,name text,public boolean default false,file_size_limit bigint,allowed_mime_types text[]);
    create table storage.objects(id uuid primary key default gen_random_uuid(),bucket_id text references storage.buckets(id),name text,owner uuid);
    alter table storage.objects enable row level security;
    create function storage.foldername(text) returns text[] language sql immutable as $$select string_to_array($1,'/')$$;
    grant usage on schema auth,storage,public to anon,authenticated,service_role;
    grant select,insert,update,delete on storage.objects to authenticated;`);
  const baseline=fs.readdirSync(dir).filter(n=>/^\d{14}_.+\.sql$/.test(n)&&n.slice(0,14)<='20261001043554').sort();assert.equal(baseline.length,18);
  for(const file of [...baseline,'20261007174155_fix_owner_config_conflict_sqlstate.sql']) await db.exec(fs.readFileSync(path.join(dir,file),'utf8'));
});
after(async()=>{if(db)await db.close();});
test('additive migration leaves existing grants/RLS/Owner MD5 unchanged',async()=>{
  const tables=(await db.query(`select oid,relacl::text,relrowsecurity from pg_class where relnamespace in ('public'::regnamespace,'private'::regnamespace) and relkind='r' order by oid`)).rows;
  await db.exec(migration);
  assert.deepEqual((await db.query(`select oid,relacl::text,relrowsecurity from pg_class where oid=any($1::oid[]) order by oid`,[tables.map(t=>t.oid)])).rows,tables);
  assert.equal((await one(`select md5(pg_get_functiondef('public.mcy_ai_save_owner_config(uuid,integer,boolean,text,text,numeric,integer,integer,integer)'::regprocedure)) as hash`)).hash,'5ad67fe52caf79bd07c51caa0c30db92');
  for(const id of [owner,teacher,learner,other,dual]) await db.query('insert into auth.users(id,email,email_confirmed_at) values($1,$2,now())',[id,`${id}@example.test`]);
  for(const [id,role] of [[owner,'owner'],[teacher,'teacher'],[other,'teacher'],[dual,'teacher'],[dual,'owner']]) await db.query(`insert into private.role_assignments(user_id,role,scope_type,reason) values($1,$2,'global','Fictional test role')`,[id,role]);
  for(const id of [teacher,other,dual]) await db.query(`insert into public.teachers(user_id,public_name,active) values($1,'Fictional teacher',true)`,[id]);
});
test('Owner defaults, teacher roster parity and no learner/self escalation',async()=>{
  const c=candidate('owner-default');const before=await counts();
  const q=await read(owner,[c]);assert.equal(q.can_assign,true);assert.equal(q.default_reviewer,'owner');assert.equal(q.items[0].state.revision,0);
  assert.deepEqual(q.eligible_reviewers.map(t=>t.user_id).sort(),[teacher,other].sort());assert.deepEqual(await counts(),before);
  for(const id of [learner,teacher,other]) await assert.rejects(()=>read(id,[c]),e=>e.code==='42501');
  await assert.rejects(()=>assign(owner,c,0,dual),e=>e.code==='42501');
  await assert.rejects(()=>assign(learner,c,0),e=>e.code==='42501');
  await assert.rejects(()=>save(teacher,c,0),e=>e.code==='42501');assert.deepEqual(await counts(),before);
  const result=await save(owner,c,0);assert.equal(result.revision,1);assert.equal(result.reviewer_id,owner);assert.equal(result.published,false);
  assert.deepEqual(await one('select enabled,version_no,model_id from private.ai_configurations'),{enabled:false,version_no:1,model_id:''});
});
test('exact assignment, version conflict, cross-teacher denial and revoke invalidate approval',async()=>{
  const c=candidate('assigned');const a=await assign(owner,c,0);assert.equal(a.revision,1);
  const q=await read(teacher,[c,candidate('unassigned'),candidate('assigned','learning_intro','b'.repeat(64))]);assert.equal(q.can_assign,false);assert.equal(q.items.length,1);assert.deepEqual(q.eligible_reviewers,[]);
  await assert.rejects(()=>save(other,c,1),e=>e.code==='42501');await assert.rejects(()=>assign(teacher,c,1,other),e=>e.code==='42501');
  await assert.rejects(()=>save(teacher,{...c,version:'b'.repeat(64)},0),e=>e.code==='42501');
  const result=await save(teacher,c,1);assert.equal(result.revision,2);assert.equal(result.reviewer_id,teacher);
  await assert.rejects(()=>save(owner,c,1),e=>e.code==='PT409');
  await assert.rejects(()=>save(owner,{...c,title:'Changed under same version'},2),e=>e.code==='22023');
  const revoked=await assign(owner,c,2,teacher,false);assert.equal(revoked.revision,3);
  assert.equal((await read(owner,[c])).items[0].state.decision,'pending');
  await assert.rejects(()=>read(teacher,[c]),e=>e.code==='42501');await assert.rejects(()=>save(teacher,c,3),e=>e.code==='42501');
});
test('approval requires real fields/checklist and practice scope requires all eight checks',async()=>{
  const intro=candidate('intro-checks'),practice=candidate('practice-checks','practice_session');
  const partial={...checks,vietnameseAudioReady:false,actualDurationChecked:false};
  assert.equal((await save(owner,intro,0,'approved',partial)).revision,1);
  await assert.rejects(()=>save(owner,practice,0,'approved',partial),e=>e.code==='22023');
  for(const patch of [{expertiseConfirmed:false},{rightsConfirmed:false},{contentAccuracy:'true'},{extraneous:true}]) await assert.rejects(()=>save(owner,practice,0,'approved',{...checks,...patch}),e=>e.code==='22023');
  await assert.rejects(()=>one('select public.mcy_content_review_save($1,$2::jsonb,0,\'approved\',\' \',\'long enough basis\',\'long enough rights\',$3::jsonb)',[owner,JSON.stringify(practice),JSON.stringify(checks)]),e=>e.code==='22023');
  assert.equal((await save(owner,practice,0,'changes_requested',partial)).decision,'changes_requested');
});
test('expired/revoked roles, inactive profile, unconfirmed identity and expired assignment cannot write',async()=>{
  const c=candidate('expiry');await assign(owner,c,0);
  await db.query(`update private.mcy_content_reviewer_assignments set expires_at=clock_timestamp()-interval '1 second' where candidate_id=$1`,[c.id]);
  await assert.rejects(()=>save(teacher,c,1),e=>e.code==='42501');
  await assign(owner,c,1);
  for(const sql of [`update public.teachers set active=false where user_id=$1`,`update auth.users set email_confirmed_at=null where id=$1`,`update private.role_assignments set ends_at=clock_timestamp()-interval '1 second',starts_at=clock_timestamp()-interval '1 day' where user_id=$1`]) {
    await db.query(sql,[teacher]);await assert.rejects(()=>read(teacher,[c]),e=>e.code==='42501');await assert.rejects(()=>save(teacher,c,2),e=>e.code==='42501');
    await db.query(`update public.teachers set active=true where user_id=$1`,[teacher]);await db.query(`update auth.users set email_confirmed_at=clock_timestamp() where id=$1`,[teacher]);await db.query(`update private.role_assignments set starts_at=clock_timestamp()-interval '1 day',ends_at=null where user_id=$1`,[teacher]);
  }
  await db.query(`update private.role_assignments set status='revoked',revoked_at=clock_timestamp() where user_id=$1`,[teacher]);
  await assert.rejects(()=>save(teacher,c,2),e=>e.code==='42501');
  // Owner may revoke an existing capability after the target loses its global role.
  assert.equal((await assign(owner,c,2,teacher,false)).revision,3);
  await db.query(`update private.role_assignments set status='active',revoked_at=null where user_id=$1`,[teacher]);
});
test('quota permits genuine withdrawal/revoke, no-op repeats create no rows/events, rejects new inactive assignment',async()=>{
  const c=candidate('quota');await assign(owner,c,0);await save(owner,c,1);
  // Fill only fictional prior events to reach the limit without making 20 costly fixtures.
  const n=(await one('select count(*)::integer as n from private.mcy_content_review_events where actor_id=$1',[owner])).n;
  for(let i=n;i<20;i++) await db.query(`insert into private.mcy_content_review_events(actor_id,candidate_id,content_version,revision,kind,payload) values($1,$2,$3,$4,'review','{}')`,[owner,c.id,c.version,100+i]);
  await assert.rejects(()=>save(owner,c,2,'changes_requested'),e=>e.code==='PT429');
  assert.equal((await save(owner,c,2,'withdrawn')).revision,3);
  const before=await counts();assert.equal((await save(owner,c,3,'withdrawn')).unchanged,true);assert.deepEqual(await counts(),before);
  assert.equal((await assign(owner,c,3,learner,false)).unchanged,true);assert.deepEqual(await counts(),before);
  assert.equal((await assign(owner,c,3,teacher,false)).revision,4);
  const after=await counts();assert.equal((await assign(owner,c,4,teacher,false)).unchanged,true);assert.deepEqual(await counts(),after);
  await assert.rejects(()=>assign(owner,candidate('no-state'),0,learner,false),e=>e.code==='22023');assert.deepEqual(await counts(),after);
  await assert.rejects(()=>save(owner,candidate('no-withdraw'),0,'withdrawn'),e=>e.code==='22023');assert.deepEqual(await counts(),after);
});
test('effective service-only EXECUTE, private read/write/TRUNCATE denied, empty search paths and helper isolation',async()=>{
  const signatures=['mcy_content_review_read(uuid,jsonb)','mcy_content_review_save(uuid,jsonb,integer,text,text,text,text,jsonb)','mcy_content_reviewer_assign(uuid,jsonb,integer,uuid,boolean,integer)'];
  for(const sig of signatures){const info=await one('select prosecdef,proconfig from pg_proc where oid=$1::regprocedure',[`public.${sig}`]);assert.equal(info.prosecdef,true);assert.deepEqual(info.proconfig,['search_path=""']);}
  for(const role of ['anon','authenticated','service_role']) {
    assert.equal((await one(`select has_schema_privilege($1,'private','USAGE') as value`,[role])).value,false);
    for(const table of ['mcy_content_review_states','mcy_content_reviewer_assignments','mcy_content_review_events']) for(const privilege of ['SELECT','INSERT','UPDATE','DELETE','TRUNCATE']) assert.equal((await one('select has_table_privilege($1,$2,$3) as value',[role,`private.${table}`,privilege])).value,false);
    for(const sig of signatures) assert.equal((await one('select has_function_privilege($1,$2,\'EXECUTE\') as value',[role,`public.${sig}`])).value,role==='service_role');
    await db.exec(`set role ${role}`);
    try { if(role==='service_role') assert.equal((await read(owner,[candidate('owner-default')])).can_assign,true);else await assert.rejects(()=>read(owner,[candidate('owner-default')]),e=>e.code==='42501');await assert.rejects(()=>db.query('select private.mcy_content_review_actor($1::uuid)',[owner]),e=>e.code==='42501'); }
    finally{await db.exec('reset role');}
  }
});
test('wall-clock expiry during an open transaction denies later role and assignment checks',async()=>{
  const c=candidate('expiry');const before=await counts();
  await db.exec('begin');
  try {
    await db.query(`update private.mcy_content_reviewer_assignments set active=true,expires_at=clock_timestamp()+interval '200 milliseconds' where candidate_id=$1`,[c.id]);
    assert.equal((await read(teacher,[c])).items.length,1);
    await new Promise(resolve=>setTimeout(resolve,350));
    await assert.rejects(()=>save(teacher,c,3),e=>e.code==='42501');
  } finally {await db.exec('rollback');}
  await db.exec('begin');
  try {
    await db.query(`update private.role_assignments set starts_at=clock_timestamp()-interval '1 day',ends_at=clock_timestamp()+interval '200 milliseconds' where user_id=$1 and role='owner'`,[owner]);
    assert.equal((await read(owner,[c])).can_assign,true);
    await new Promise(resolve=>setTimeout(resolve,350));
    await assert.rejects(()=>read(owner,[c]),e=>e.code==='42501');
  } finally {await db.exec('rollback');}
  assert.deepEqual(await counts(),before);
});
test('controlled post-lock role downgrade cannot retain Owner authority or assign an Owner target',async()=>{
  // A rollback-only hook changes fictional role state immediately after the real
  // lock helper. It probes the post-lock boundary, not multi-session contention.
  for(const action of ['save','assign','target']) {
    await db.exec('begin');
    try {
      await db.exec(`alter function private.mcy_content_review_lock(uuid,jsonb,integer,boolean) rename to mcy_fixture_real_review_lock;
        create function private.mcy_content_review_lock(p_actor uuid,p_candidate jsonb,p_expected integer,p_limited boolean) returns void language plpgsql set search_path='' as $$begin
          perform private.mcy_fixture_real_review_lock(p_actor,p_candidate,p_expected,p_limited);
          ${action==='target' ? `insert into private.role_assignments(user_id,role,scope_type,reason) values('${other}','owner','global','Fictional post-lock hook');` : `update private.role_assignments set starts_at=clock_timestamp()-interval '1 day',ends_at=clock_timestamp()-interval '1 second' where user_id='${dual}' and role='owner';`}
        end $$;`);
      if(action==='save')await assert.rejects(()=>save(dual,candidate('post-lock-save'),0),e=>e.code==='42501');
      if(action==='assign')await assert.rejects(()=>assign(dual,candidate('post-lock-assign'),0,teacher),e=>e.code==='42501');
      if(action==='target') {
        // Avoid the Owner fixture's already-full quota; use the second Owner.
        await assert.rejects(()=>assign(dual,candidate('post-lock-target'),0,other),e=>e.code==='42501');
      }
    }finally{await db.exec('rollback');}
  }
});
