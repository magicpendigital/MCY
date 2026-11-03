// Local migration replay with fictional platform scaffolding; not Supabase/Auth/HTTP parity.
// Select only the 18 CLI-reconciled baseline migrations and the single Owner repair.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { before, after, test } = require('node:test');
const engine = process.env.MCY_PGLITE_MODULE_PATH || '@electric-sql/pglite';
const { PGlite } = require(engine);
const { pgcrypto } = require(path.join(engine, 'dist/contrib/pgcrypto.cjs'));
const directory = path.join(__dirname, '../supabase/migrations');
const files = fs.readdirSync(directory).filter(name => /^\d{14}_.+\.sql$/.test(name)
  && name.slice(0, 14) <= '20261001043554').sort();
const repairName = '20261007174155_fix_owner_config_conflict_sqlstate.sql';
const repair = fs.readFileSync(path.join(directory, repairName), 'utf8');
const signature = 'public.mcy_ai_save_owner_config(uuid,integer,boolean,text,text,numeric,integer,integer,integer)';
const owner = '22000000-0000-4000-8000-000000000001';
const learner = '22000000-0000-4000-8000-000000000002';
let db;
let previousFetch;
const one = async (sql, args = []) => (await db.query(sql, args)).rows[0];
const quote = name => '"' + name.replaceAll('"', '""') + '"';
async function appSnapshot() {
  const { rows: tables } = await db.query(`select n.nspname as schema, c.relname as name,
    c.relrowsecurity,c.relforcerowsecurity,c.relacl::text as acl
    from pg_class c join pg_namespace n on n.oid=c.relnamespace
    where n.nspname in ('public','private') and c.relkind='r' order by 1,2`);
  const rows = {};
  for (const table of tables) {
    const result = await db.query(`select to_jsonb(t)::text as row from ${quote(table.schema)}.${quote(table.name)} t order by to_jsonb(t)::text`);
    rows[table.schema + '.' + table.name] = result.rows.map(value => value.row);
  }
  const policies = (await db.query(`select * from pg_policies where schemaname in ('public','private')
    order by schemaname,tablename,policyname`)).rows;
  return { tables, rows, policies };
}
const rpc = () => one(`select oid,proowner,proacl::text as acl,proconfig,prosecdef,
  pg_get_functiondef(oid) as definition,md5(pg_get_functiondef(oid)) as fingerprint
  from pg_proc where oid=$1::regprocedure`, [signature]);
const save = async (actor, version) => one(`select public.mcy_ai_save_owner_config(
  $1::uuid,$2::integer,false,'','Synthetic reviewed prompt used only for offline schema regression.',
  0.3::numeric,320,10,100) as result`, [actor, version]);

before(async () => {
  assert.equal(files.length, 18, 'Baseline inventory drift needs a new reviewed CLI receipt');
  previousFetch = globalThis.fetch;
  globalThis.fetch = async () => { throw new Error('Offline rehearsal denies outbound fetch'); };
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
  for (const file of files) {
    try { await db.exec(fs.readFileSync(path.join(directory, file), 'utf8')); }
    catch (error) { throw new Error('Baseline replay failed at ' + file, { cause: error }); }
  }
  await db.query(`insert into auth.users(id,email,email_confirmed_at) values
    ($1,'owner@example.test',now()),($2,'learner@example.test',now())`, [owner, learner]);
  await db.query(`insert into private.role_assignments(user_id,role,scope_type,reason,starts_at)
    values($1,'owner','global','Fictional full-schema fixture',now()-interval '1 hour')`, [owner]);
});
after(async () => {
  try { if (db) await db.close(); } finally { if (previousFetch) globalThis.fetch = previousFetch; }
});

test('clean replay of all 18 reconciled local baseline migrations reaches the reviewed Owner definition', async () => {
  assert.equal((await rpc()).fingerprint, '1591e77afdfc0dacb6b39200d7bbefc2');
  assert.equal((await one('select enabled from private.ai_configurations')).enabled, false);
  const pending = await one(`select to_regprocedure('public.mcy_teacher_save_own_draft(uuid,jsonb)')::text as teacher,
    to_regprocedure('public.mcy_collaboration_dispatch(uuid,text,jsonb)')::text as collaboration`);
  assert.deepEqual(pending, { teacher: null, collaboration: null });
});

test('selective Owner upgrade preserves every application table, policy and row plus RPC identity/ACL', async () => {
  const snapshot = await appSnapshot();
  assert.ok(snapshot.tables.length > 50, 'Must exercise the full application migration schema');
  const original = await rpc();
  await db.exec(repair);
  const updated = await rpc();
  assert.equal(updated.definition, original.definition.replace("errcode = '40001'", "errcode = 'PT409'"));
  assert.equal(updated.fingerprint, '5ad67fe52caf79bd07c51caa0c30db92');
  for (const key of ['oid','proowner','acl','proconfig','prosecdef']) assert.deepEqual(updated[key], original[key]);
  assert.deepEqual(await appSnapshot(), snapshot);
});

test('full baseline denies stale saves without config/audit changes and allows one atomic AI-off Owner save', async () => {
  const snapshot = await appSnapshot();
  const version = (await one('select version_no from private.ai_configurations')).version_no;
  await db.exec('set role service_role');
  try {
    await assert.rejects(() => save(owner, version - 1), error => error.code === 'PT409');
    await assert.rejects(() => save(learner, version), error => error.code === '42501');
  } finally { await db.exec('reset role'); }
  assert.deepEqual(await appSnapshot(), snapshot);
  const audits = (await one('select count(*)::integer as n from private.audit_events')).n;
  await db.exec('set role service_role');
  try { await save(owner, version); } finally { await db.exec('reset role'); }
  assert.deepEqual(await one('select enabled,version_no from private.ai_configurations'),
    { enabled: false, version_no: version + 1 });
  assert.equal((await one('select count(*)::integer as n from private.audit_events')).n, audits + 1);
});

test('repair retry preserves upgraded rows and public roles still cannot execute the Owner RPC', async () => {
  const snapshot = await appSnapshot();
  await db.exec(repair);
  assert.deepEqual(await appSnapshot(), snapshot);
  for (const role of ['anon','authenticated']) {
    await db.exec('set role ' + role);
    try { await assert.rejects(() => save(owner, 1), error => error.code === '42501'); }
    finally { await db.exec('reset role'); }
  }
  assert.equal((await one(`select has_schema_privilege('service_role','private','USAGE') as allowed`)).allowed, false);
});
