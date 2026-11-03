// Replays the staging chain plus the account-deletion candidate with fictional platform scaffolding.
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
const tired = '20261023171158_add_tired_uncomfortable_body_status.sql';
const mine = '20261023171210_delete_my_account.sql';
const chain = [...applied, candidate, tired, mine];
const S = '66000000-0000-4000-8000-000000000003';
const remove = (db, confirmation = 'DELETE_MY_ACCOUNT') => db.query('select public.delete_my_account($1)', [confirmation]);

test('a learner deletes their own account and every owned row, nothing else', async () => {
  const db = new PGlite({ extensions: { pgcrypto } });
  try {
    await db.exec(bootstrap);
    for (const file of chain) await db.exec(fs.readFileSync(path.join(dir, file), 'utf8'));
    await db.query(`insert into auth.users(id,email,email_confirmed_at) values($1,'fictional-a@example.test',now()),($2,'fictional-b@example.test',now()),($3,'fictional-staff@example.test',now())`, [A, B, S]);
    for (const id of [A, B]) {
      await identity(db, id);
      for (const purpose of ['terms', 'privacy', 'wellbeing_data']) await consent(db, purpose);
      await save(db, `deletion-${id}`, 'tired', [], id);
      await db.exec('reset role;');
    }
    await db.exec(`insert into public.profiles(user_id,display_name) values('${A}','Fictional A'),('${B}','Fictional B')`);
    await db.query(`insert into private.role_assignments(user_id,role,scope_type,reason) values($1,'owner','global','fictional fixture')`, [S]);
    const counts = async id => (await one(db, `select (select count(*) from public.profiles where user_id=$1)::int as profiles, (select count(*) from public.checkins where user_id=$1)::int as checkins, (select count(*) from private.consent_events where user_id=$1)::int as consents, (select count(*) from auth.users where id=$1)::int as users`, [id]));
    assert.deepEqual(await counts(A), { profiles: 1, checkins: 1, consents: 3, users: 1 });

    // Not signed in, wrong confirmation, staff role: nothing is deleted.
    await db.exec('set role anon;');
    await denied(() => remove(db), '42501');
    await db.exec('reset role;');
    await identity(db, A);
    await denied(() => remove(db, 'yes'), '22023');
    await denied(() => remove(db, ''), '22023');
    await db.exec('reset role;');
    assert.deepEqual(await counts(A), { profiles: 1, checkins: 1, consents: 3, users: 1 });
    await identity(db, S);
    await denied(() => remove(db), '42501');
    await db.exec('reset role;');
    assert.equal((await counts(S)).users, 1);

    // A deletes their own account; B and the staff account are untouched.
    const auditBefore = (await one(db, `select count(*)::int as value from private.audit_events where action='learner_account_deleted'`)).value;
    await identity(db, A);
    await remove(db);
    await db.exec('reset role;');
    assert.deepEqual(await counts(A), { profiles: 0, checkins: 0, consents: 0, users: 0 });
    assert.deepEqual(await counts(B), { profiles: 1, checkins: 1, consents: 3, users: 1 });
    assert.equal((await counts(S)).users, 1);
    const audit = await db.query(`select actor_id, actor_type, outcome, metadata::text as metadata from private.audit_events where action='learner_account_deleted'`);
    assert.equal(audit.rows.length, auditBefore + 1);
    assert.deepEqual(audit.rows.at(-1), { actor_id: null, actor_type: 'system', outcome: 'success', metadata: '{}' });
    assert.equal(JSON.stringify(audit.rows).includes('fictional-a'), false, 'no identifier survives in the audit trail');

    // The deleted account cannot call again, and the function is not open to anon/PUBLIC.
    await identity(db, A);
    await denied(() => remove(db), 'P0002');
    await db.exec('reset role;');
    for (const role of ['anon', 'public']) assert.equal((await one(db, `select has_function_privilege($1,'public.delete_my_account(text)','EXECUTE') as value`, [role])).value, false);
    assert.equal((await one(db, `select has_function_privilege('authenticated','public.delete_my_account(text)','EXECUTE') as value`)).value, true);
  } finally { await db.close(); }
});
