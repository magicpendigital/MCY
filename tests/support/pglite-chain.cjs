// Shared scaffolding for the PGlite rehearsals of the 2026-11 migrations: fictional platform pieces (roles, auth, storage)
// plus the staging migration chain in order. Supplements, and is not, live Supabase evidence.
// Needs an installed @electric-sql/pglite (set MCY_PGLITE_MODULE_PATH to its folder).
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const engine = process.env.MCY_PGLITE_MODULE_PATH || '@electric-sql/pglite';
const { PGlite } = require(engine);
const { pgcrypto } = require(path.join(engine, 'dist/contrib/pgcrypto.cjs'));
const dir = path.join(__dirname, '../../supabase/migrations');
const baseline = fs.readdirSync(dir).filter(n => /^\d{14}_.+\.sql$/.test(n) && n.slice(0, 14) <= '20261001043554').sort();
assert.equal(baseline.length, 18);
// The order staging has: baseline, Owner repair, content review, actor-bound check-in writer, body status, reading scope and bucket.
const chain = [...baseline, '20261007174155_fix_owner_config_conflict_sqlstate.sql', '20261010113419_owner_content_review.sql',
  '20261002120000_bind_checkin_writes_to_current_actor_and_consent.sql', '20261023171158_add_tired_uncomfortable_body_status.sql',
  '20261030063241_content_review_reading_scope.sql', '20261030063252_reading_preview_bucket.sql'];
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
const read = file => fs.readFileSync(path.join(dir, file), 'utf8');
const one = async (db, sql, args = []) => (await db.query(sql, args)).rows[0];
const newDb = async () => { const db = new PGlite({ extensions: { pgcrypto } }); await db.exec(bootstrap); for (const file of chain) await db.exec(read(file)); return db; };
const identity = (db, id) => db.exec(`set role authenticated; set request.jwt.claim.sub='${id}'; set request.jwt.claim.role='authenticated';`);
const consent = (db, purpose) => db.query('select public.record_my_consent($1,$2,$3,$4,$5,$6)', [purpose, 'granted', purpose === 'wellbeing_data' ? 'wellbeing-data-review-0.1' : `${purpose}-review-0.1`, 'settings', crypto.randomUUID(), 'web']);
const saveCheckin = (db, user, key, observations = []) => one(db, `select * from public.save_my_checkin_for_current_user_with_current_consent($1::uuid,'2026-10-11','Asia/Bangkok',2::smallint,'none_now','standalone',$2::jsonb,$3)`, [user, JSON.stringify(observations), key]);
const denied = (fn, code) => assert.rejects(fn, error => error.code === code);
const hex = c => c.repeat(64);
module.exports = { assert, fs, path, PGlite, pgcrypto, dir, read, one, newDb, identity, consent, saveCheckin, denied, hex, chain };
