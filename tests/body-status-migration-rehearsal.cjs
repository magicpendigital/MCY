// Replays the staging chain plus the tired/uncomfortable body_status candidate with fictional platform scaffolding.
// Supplements, and is not, live Supabase evidence. Needs an installed @electric-sql/pglite (MCY_PGLITE_MODULE_PATH).
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
const mine = '20261023171158_add_tired_uncomfortable_body_status.sql';
const ordered = [...applied, candidate];
const aclOf = db => db.query(`select p.oid::regprocedure::text as sig, p.proowner::regrole::text as owner, p.proacl::text as acl, p.proconfig::text as config, p.prosecdef from pg_proc p join pg_namespace n on n.oid=p.pronamespace where p.proname in ('save_my_checkin_expanded','save_my_checkin_for_current_user_with_current_consent','save_my_checkin_with_current_consent') order by 1`);

test('tired/uncomfortable are accepted after the candidate, everything else is unchanged', async () => {
  const db = new PGlite({ extensions: { pgcrypto } });
  try {
    await db.exec(bootstrap);
    for (const file of ordered) await db.exec(fs.readFileSync(path.join(dir, file), 'utf8'));
    const before = (await aclOf(db)).rows;
    await db.query('insert into auth.users(id,email,email_confirmed_at) values($1,\'fictional-a@example.test\',now())', [A]);
    await identity(db, A);
    for (const purpose of ['terms', 'privacy', 'wellbeing_data']) await consent(db, purpose);
    await denied(() => save(db, 'before-tired', 'tired'), '22023');
    await db.exec('reset role;');

    await db.exec(fs.readFileSync(path.join(dir, mine), 'utf8'));
    const after = (await aclOf(db)).rows;
    assert.deepEqual(after, before, 'owner, ACL, search_path and security mode are preserved');

    await identity(db, A);
    for (const status of ['none_now', 'uncertain', 'skipped', 'tired', 'uncomfortable']) assert.ok((await save(db, `ok-${status}`, status)).checkin_id, status);
    assert.equal((await save(db, 'ok-tired', 'tired')).checkin_id, (await save(db, 'ok-tired', 'tired')).checkin_id, 'exact retry is still idempotent');
    await denied(() => save(db, 'bogus', 'happy'), '22023');
    await denied(() => save(db, 'ok-tired', 'uncomfortable'), '22023');
    await db.exec('reset role;');
    assert.deepEqual((await db.query(`select body_status from public.checkins order by body_status`)).rows.map(r => r.body_status), ['none_now', 'skipped', 'tired', 'uncertain', 'uncomfortable']);
    await assert.rejects(() => db.query(`insert into public.checkins(user_id,local_date,local_timezone,body_status,capture_type) values($1,'2026-10-11','Asia/Bangkok','happy','standalone')`, [A]), error => error.code === '23514');
  } finally { await db.close(); }
});

test('the migration refuses to run when the writer no longer has the expected allow-list', async () => {
  const db = new PGlite({ extensions: { pgcrypto } });
  try {
    await db.exec(bootstrap);
    for (const file of [...ordered, mine]) await db.exec(fs.readFileSync(path.join(dir, file), 'utf8'));
    await assert.rejects(() => db.exec(fs.readFileSync(path.join(dir, mine), 'utf8')), /changed \(0 allow-list copies found, expected 1\)/);
  } finally { await db.close(); }
});
