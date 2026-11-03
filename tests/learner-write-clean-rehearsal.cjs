// Ordered clean replay and upgrade with fictional platform scaffolding only.
// This supplements the multi-session Docker rehearsal; it is not live Auth evidence.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');
const engine = process.env.MCY_PGLITE_MODULE_PATH || '@electric-sql/pglite';
const { PGlite } = require(engine);
const { pgcrypto } = require(path.join(engine, 'dist/contrib/pgcrypto.cjs'));
const dir = path.join(__dirname, '../supabase/migrations');
const candidate = '20261002120000_bind_checkin_writes_to_current_actor_and_consent.sql';
const baseline = fs.readdirSync(dir).filter(n => /^\d{14}_.+\.sql$/.test(n) && n.slice(0, 14) <= '20261001043554').sort();
assert.equal(baseline.length, 18);
const applied = [...baseline, '20261007174155_fix_owner_config_conflict_sqlstate.sql', '20261010113419_owner_content_review.sql'];
const A = '66000000-0000-4000-8000-000000000001', B = '66000000-0000-4000-8000-000000000002';
const bootstrap = `create role anon; create role authenticated; create role service_role bypassrls;
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
 grant select,insert,update,delete on storage.objects to authenticated;`;
const one = async (db, sql, args = []) => (await db.query(sql, args)).rows[0];
const fingerprint = db => db.query(`select n.nspname,p.proname,pg_get_function_identity_arguments(p.oid) as args,pg_get_functiondef(p.oid) as body,p.proacl::text as acl,p.proconfig,p.prosecdef from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname in ('public','private') order by 1,2,3`);
const identity = (db, id) => db.exec(`set role authenticated; set request.jwt.claim.sub='${id}'; set request.jwt.claim.role='authenticated';`);
const consent = (db, purpose, action = 'granted', version = purpose === 'wellbeing_data' ? 'wellbeing-data-review-0.1' : `${purpose}-review-0.1`) => db.query('select public.record_my_consent($1,$2,$3,$4,$5,$6)', [purpose, action, version, 'settings', crypto.randomUUID(), 'web']);
const save = (db, key, status = 'none_now', observations = [], expected = A) => one(db, `select * from public.save_my_checkin_for_current_user_with_current_consent($1::uuid,'2026-10-11','Asia/Bangkok',2::smallint,$2,'standalone',$3::jsonb,$4)`, [expected, status, JSON.stringify(observations), key]);
const denied = (fn, code) => assert.rejects(fn, error => error.code === code);

test('clean chronological 21 replay and selected upgrade from 20 applied migrations agree', async () => {
  const databases = [], fingerprints = [];
  try {
    for (const order of [[...applied, candidate].sort(), [...applied, candidate]]) {
      const db = new PGlite({ extensions: { pgcrypto } }); databases.push(db);
      await db.exec(bootstrap);
      for (const file of order) await db.exec(fs.readFileSync(path.join(dir, file), 'utf8'));
      fingerprints.push((await fingerprint(db)).rows);
      assert.equal((await one(db, `select md5(pg_get_functiondef('public.mcy_ai_save_owner_config(uuid,integer,boolean,text,text,numeric,integer,integer,integer)'::regprocedure)) as value`)).value, '5ad67fe52caf79bd07c51caa0c30db92');
      for (const role of ['anon', 'authenticated', 'service_role']) assert.equal((await one(db, 'select has_schema_privilege($1,\'private\',\'USAGE\') as value', [role])).value, false);
      for (const role of ['anon', 'authenticated']) for (const table of ['public.checkins', 'public.checkin_observations']) for (const privilege of ['INSERT', 'UPDATE', 'DELETE', 'TRUNCATE']) assert.equal((await one(db, 'select has_table_privilege($1,$2,$3) as value', [role, table, privilege])).value, false);
      await db.query('insert into auth.users(id,email,email_confirmed_at) values($1,\'fictional-a@example.test\',now()),($2,\'fictional-b@example.test\',now())', [A, B]);
      await identity(db, A);
      await denied(() => save(db, 'no-consent'), '42501');
      for (const purpose of ['terms', 'privacy', 'wellbeing_data']) await consent(db, purpose);
      const first = await save(db, 'exact-retry');
      assert.equal((await save(db, 'exact-retry')).checkin_id, first.checkin_id);
      await denied(() => save(db, 'exact-retry', 'uncertain'), '22023');
      await denied(() => save(db, 'wrong-actor', 'none_now', [], B), '28000');
      await consent(db, 'wellbeing_data', 'revoked');
      await denied(() => save(db, 'after-revoke'), '42501');
      await consent(db, 'wellbeing_data', 'granted', 'obsolete');
      await denied(() => save(db, 'stale-version'), '42501');
      await identity(db, B);
      assert.equal((await one(db, 'select count(*)::integer as value from public.checkins')).value, 0);
      await denied(() => db.query(`select * from public.save_my_checkin_with_current_consent('2026-10-11','Asia/Bangkok',2::smallint,'none_now','standalone','[]','old-client')`), '42501');
      await db.exec('reset role; set role anon;');
      await denied(() => save(db, 'anonymous'), '42501');
      await db.exec('reset role;');
      assert.equal((await one(db, 'select count(*)::integer as value from public.checkins')).value, 1);
      assert.deepEqual(await one(db, 'select enabled,version_no,model_id from private.ai_configurations'), { enabled: false, version_no: 1, model_id: '' });
      const definitions = (await fingerprint(db)).rows;
      await db.exec(fs.readFileSync(path.join(__dirname, '../docs/release/MCY_LEARNER_WRITE_STOP_2026-10-11.sql'), 'utf8'));
      await identity(db, A);
      await denied(() => save(db, 'stopped'), '42501');
      await denied(() => db.query(`select * from public.save_my_checkin_with_current_consent('2026-10-11','Asia/Bangkok',2::smallint,'none_now','standalone','[]','stopped-old')`), '42501');
      await db.exec('reset role;');
      await db.exec(fs.readFileSync(path.join(__dirname, '../docs/release/MCY_LEARNER_WRITE_RESUME_2026-10-11.sql'), 'utf8'));
      assert.deepEqual((await fingerprint(db)).rows, definitions);
      await identity(db, A);
      await consent(db, 'wellbeing_data');
      assert.ok((await save(db, 'resumed-key')).checkin_id);
      await denied(() => db.query(`select * from public.save_my_checkin_with_current_consent('2026-10-11','Asia/Bangkok',2::smallint,'none_now','standalone','[]','resumed-old')`), '42501');
      await db.exec('reset role;');
    }
    assert.deepEqual(fingerprints[0], fingerprints[1]);
  } finally { for (const db of databases) await db.close(); }
});
