// Full reconciled local-source schema with fictional platform scaffolding.
// No live connection, credentials, grants or provider calls.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { before, after, test } = require('node:test');
const engine = process.env.MCY_PGLITE_MODULE_PATH || '@electric-sql/pglite';
const { PGlite } = require(engine);
const { pgcrypto } = require(path.join(engine, 'dist/contrib/pgcrypto.cjs'));
const dir = path.join(__dirname, '../supabase/migrations');
const candidate = fs.readFileSync(path.join(dir, '20261009181735_ai_read_admission_state.sql'), 'utf8');
const actor = '44000000-0000-4000-8000-000000000001';
const other = '44000000-0000-4000-8000-000000000002';
let db;
const one = async (sql, args = []) => (await db.query(sql, args)).rows[0];
const state = async id => (await one('select public.mcy_ai_read_admission_state($1::uuid) as value', [id])).value;
before(async () => {
  db = new PGlite({ extensions: { pgcrypto } });
  await db.exec(`create role anon; create role authenticated; create role service_role bypassrls;
    create schema auth; create schema storage; create schema extensions;
    create table auth.users(id uuid primary key,email text,raw_user_meta_data jsonb default '{}'::jsonb,
      raw_app_meta_data jsonb default '{}'::jsonb,email_confirmed_at timestamptz,created_at timestamptz default now());
    create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
    create function auth.role() returns text language sql stable as $$select nullif(current_setting('request.jwt.claim.role',true),'')$$;
    create function auth.jwt() returns jsonb language sql stable as $$select coalesce(nullif(current_setting('request.jwt.claims',true),''),'{}')::jsonb$$;
    create table storage.buckets(id text primary key,name text,public boolean default false,file_size_limit bigint,allowed_mime_types text[]);
    create table storage.objects(id uuid primary key default gen_random_uuid(),bucket_id text references storage.buckets(id),name text,owner uuid);
    alter table storage.objects enable row level security;
    create function storage.foldername(text) returns text[] language sql immutable as $$select string_to_array($1,'/')$$;
    grant usage on schema auth,storage,public to anon,authenticated,service_role;
    grant select,insert,update,delete on storage.objects to authenticated;`);
  const baseline = fs.readdirSync(dir).filter(name => /^\d{14}_.+\.sql$/.test(name) && name.slice(0, 14) <= '20261001043554').sort();
  assert.equal(baseline.length, 18);
  for (const file of [...baseline, '20261007174155_fix_owner_config_conflict_sqlstate.sql']) await db.exec(fs.readFileSync(path.join(dir, file), 'utf8'));
});
after(async () => { if (db) await db.close(); });
test('additive admission snapshot preserves table grants/policies and deployed Owner repair', async () => {
  const before = (await db.query(`select oid,relacl::text,relrowsecurity from pg_class where relnamespace in ('public'::regnamespace,'private'::regnamespace) and relkind='r' order by oid`)).rows;
  await db.exec(candidate);
  assert.deepEqual((await db.query(`select oid,relacl::text,relrowsecurity from pg_class where relnamespace in ('public'::regnamespace,'private'::regnamespace) and relkind='r' order by oid`)).rows, before);
  assert.equal((await one(`select md5(pg_get_functiondef('public.mcy_ai_save_owner_config(uuid,integer,boolean,text,text,numeric,integer,integer,integer)'::regprocedure)) as hash`)).hash, '5ad67fe52caf79bd07c51caa0c30db92');
  const definition = await one(`select prosecdef,proconfig from pg_proc where oid='public.mcy_ai_read_admission_state(uuid)'::regprocedure`);
  assert.equal(definition.prosecdef, true); assert.deepEqual(definition.proconfig, ['search_path=""']);
});
test('current exact consent, revocation, wrong version and verified identity are read without writes', async () => {
  await db.query(`insert into auth.users(id,email,email_confirmed_at) values($1,'fictional-a@example.test',now()),($2,'fictional-b@example.test',null)`, [actor, other]);
  assert.deepEqual(await state(actor), { enabled: false, version_no: 1, consent_current: false });
  for (const [purpose, version] of [['terms','terms-review-0.1'],['privacy','privacy-review-0.1'],['ai_processing','ai-processing-review-1.0']]) await db.query(`insert into private.consent_events(user_id,purpose,action,policy_version,source,occurred_at) values($1,$2,'granted',$3,'system',now()-interval '1 hour')`, [actor, purpose, version]);
  assert.deepEqual(await state(actor), { enabled: false, version_no: 1, consent_current: true });
  await db.exec(`update private.ai_configurations set enabled=true,model_id='provider/model',version_no=2`);
  assert.deepEqual(await state(actor), { enabled: true, version_no: 2, consent_current: true });
  assert.deepEqual(await state(other), { enabled: false, version_no: 2, consent_current: false });
  await db.query(`insert into private.consent_events(user_id,purpose,action,policy_version,source) values($1,'ai_processing','revoked','ai-processing-review-1.0','system')`, [actor]);
  assert.equal((await state(actor)).consent_current, false);
  await db.query(`update private.consent_events set action='granted',policy_version='obsolete' where user_id=$1 and action='revoked'`, [actor]);
  assert.equal((await state(actor)).consent_current, false);
  const counts = await one(`select (select count(*) from private.ai_usage_events)::integer as usage,(select count(*) from private.audit_events)::integer as audit`);
  await state(actor);
  assert.deepEqual(await one(`select (select count(*) from private.ai_usage_events)::integer as usage,(select count(*) from private.audit_events)::integer as audit`), counts);
});
test('effective EXECUTE is service-only and no private schema grant is added', async () => {
  for (const role of ['anon','authenticated']) { await db.exec('set role '+role); try { await assert.rejects(()=>state(actor), e=>e.code==='42501'); } finally { await db.exec('reset role'); } }
  assert.equal((await one(`select has_schema_privilege('service_role','private','USAGE') as value`)).value, false);
  await db.exec('set role service_role');
  try { assert.equal((await state(actor)).version_no, 2); await assert.rejects(()=>state(null), e=>e.code==='22023'); } finally { await db.exec('reset role'); }
});
