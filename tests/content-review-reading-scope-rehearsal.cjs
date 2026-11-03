// Replays the staging chain plus the reading-unit review scope candidate with fictional platform scaffolding.
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
const mine = '20261030063241_content_review_reading_scope.sql';
const chain = [...applied, candidate];
const hex = c => c.repeat(64);
const readingMeta = { id: 'reading-cobra', scope: 'learning_reading', title: 'Fictional reading unit', version: hex('a') };
const introMeta = { id: 'preparation-draft', scope: 'learning_intro', title: 'Fictional intro', version: hex('b') };
const practiceMeta = { id: 'practice-fixture', scope: 'practice_session', title: 'Fictional practice', version: hex('c') };
const allChecks = Object.fromEntries(['accessibility', 'actualDurationChecked', 'audienceScope', 'contentAccuracy', 'expertiseConfirmed', 'rightsConfirmed', 'stopGuidance', 'vietnameseAudioReady'].map(k => [k, true]));
const noAudioOrDuration = { ...allChecks, vietnameseAudioReady: false, actualDurationChecked: false };
const read = (db, metas) => one(db, 'select public.mcy_content_review_read($1::uuid,$2::jsonb) as value', [A, JSON.stringify(metas)]).then(r => r.value);
const saveReview = (db, meta, decision, checks, revision = 0) => one(db, 'select public.mcy_content_review_save($1::uuid,$2::jsonb,$3::int,$4,$5,$6,$7,$8::jsonb) as value', [A, JSON.stringify(meta), revision, decision, 'Fictional qualification text', 'Fictional review basis text', 'Fictional rights basis text', JSON.stringify(checks)]).then(r => r.value);

test('reading units are reviewable after the scope migration; practice sessions keep the strict rules', async () => {
  const db = new PGlite({ extensions: { pgcrypto } });
  try {
    await db.exec(bootstrap);
    for (const file of chain) await db.exec(fs.readFileSync(path.join(dir, file), 'utf8'));
    await db.query(`insert into auth.users(id,email,email_confirmed_at) values($1,'fictional-owner@example.test',now())`, [A]);
    await db.query(`insert into private.role_assignments(user_id,role,scope_type,reason) values($1,'owner','global','fictional fixture')`, [A]);
    await denied(() => read(db, [readingMeta]), '22023');                       // unknown scope before the migration
    const before = (await db.query(`select p.oid::regprocedure::text as sig, p.proacl::text as acl, p.prosecdef from pg_proc p where p.proname='mcy_content_review_validate'`)).rows;

    await db.exec(fs.readFileSync(path.join(dir, mine), 'utf8'));
    assert.deepEqual((await db.query(`select p.oid::regprocedure::text as sig, p.proacl::text as acl, p.prosecdef from pg_proc p where p.proname='mcy_content_review_validate'`)).rows, before, 'validator ACL and security mode preserved');

    const queue = await read(db, [introMeta, readingMeta, practiceMeta]);
    assert.deepEqual(queue.items.map(i => i.candidate_id).sort(), ['practice-fixture', 'preparation-draft', 'reading-cobra']);
    assert.ok(queue.items.every(i => i.state.decision === 'pending' && i.state.revision === 0));

    // A reading unit can be approved without audio/duration checks; a practice session cannot.
    const approved = await saveReview(db, readingMeta, 'approved', noAudioOrDuration);
    assert.equal(approved.published, false);
    assert.equal((await read(db, [readingMeta])).items[0].state.decision, 'approved');
    await denied(() => saveReview(db, practiceMeta, 'approved', noAudioOrDuration), '22023');
    assert.ok(await saveReview(db, practiceMeta, 'approved', allChecks));
    // Other checks are still mandatory for a reading unit.
    await denied(() => saveReview(db, { ...readingMeta, id: 'reading-other', version: hex('d') }, 'approved', { ...noAudioOrDuration, rightsConfirmed: false }), '22023');
    // Unknown scopes are still refused.
    await denied(() => read(db, [{ ...readingMeta, scope: 'learner_visible' }]), '22023');
    assert.equal((await one(db, `select count(*)::int as value from private.mcy_content_review_states where scope='learning_reading'`)).value, 1);
  } finally { await db.close(); }
});

test('the migration refuses to run when the validator no longer has the expected scope list', async () => {
  const db = new PGlite({ extensions: { pgcrypto } });
  try {
    await db.exec(bootstrap);
    for (const file of [...chain, mine]) await db.exec(fs.readFileSync(path.join(dir, file), 'utf8'));
    await assert.rejects(() => db.exec(fs.readFileSync(path.join(dir, mine), 'utf8')), /not found|changed \(0 scope lists found/);
  } finally { await db.close(); }
});
