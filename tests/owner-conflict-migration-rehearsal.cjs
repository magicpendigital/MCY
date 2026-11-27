// Disposable, in-memory PostgreSQL fixture, not Supabase/Auth/PostgREST evidence.
// Engine must already exist; this test never installs packages or loads .env.local.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { before, after, test } = require('node:test');
const { PGlite } = require(process.env.MCY_PGLITE_MODULE_PATH || '@electric-sql/pglite');

const directory = path.join(__dirname, '../supabase/migrations');
const sql = name => fs.readFileSync(path.join(directory, name), 'utf8').replace(/\r\n/g, '\n');
const baseline = sql('20260930160616_allow_unset_model_for_disabled_ai.sql');
const repair = sql('20261007174155_fix_owner_config_conflict_sqlstate.sql');
const teacher = sql('20261127031613_teacher_control_plane_rpcs.sql');
const signature = 'public.mcy_ai_save_owner_config(uuid,integer,boolean,text,text,numeric,integer,integer,integer)';
const ids = Array.from({ length: 8 }, (_, index) => `11000000-0000-4000-8000-${String(index + 1).padStart(12, '0')}`);
const [owner, learner, teacherA, teacherB, reviewer, revoked, expired, future] = ids;
let db;
let previousFetch;
let lesson;
const scalar = async (statement, parameters = []) => (await db.query(statement, parameters)).rows[0];
const snapshot = () => scalar(`select
  (select jsonb_agg(to_jsonb(c)) from private.ai_configurations c) as config,
  (select jsonb_agg(to_jsonb(a) order by a.id) from private.audit_events a) as audit`);
const definition = () => scalar(`select pg_get_functiondef($1::regprocedure) as definition,
  md5(pg_get_functiondef($1::regprocedure)) as fingerprint,
  oid,proowner,proacl::text as acl,proconfig,prosecdef from pg_proc where oid=$1::regprocedure`, [signature]);
const callOwner = async (actor = owner, version, overrides = {}) => {
  const config = { enabled: false, model_id: '', system_prompt: 'Fictional reviewed prompt for offline regression only.',
    temperature: 0.3, max_output_tokens: 320, per_user_daily_limit: 10, global_daily_limit: 100, ...overrides };
  return (await scalar(`select public.mcy_ai_save_owner_config($1::uuid,$2::integer,$3::boolean,$4::text,
    $5::text,$6::numeric,$7::integer,$8::integer,$9::integer) as result`, [actor, version, config.enabled,
    config.model_id, config.system_prompt, config.temperature, config.max_output_tokens,
    config.per_user_daily_limit, config.global_daily_limit])).result;
};
const version = async () => (await scalar('select version_no from private.ai_configurations')).version_no;
const denied = async (operation, code) => assert.rejects(operation, error => error.code === code);
const draft = { locale: 'vi-VN', title: 'Fictional lesson', duration_seconds: 60,
  props: [], positions: [], learning_focus: [], segments: [] };
const callTeacher = async (actor, data) => (await scalar(
  'select public.mcy_teacher_save_own_draft($1::uuid,$2::jsonb) as result', [actor, JSON.stringify(data)])).result;

before(async () => {
  previousFetch = globalThis.fetch;
  globalThis.fetch = async () => { throw new Error('Offline SQL rehearsal denies outbound fetch'); };
  db = new PGlite();
  await db.exec(`create role anon; create role authenticated; create role service_role bypassrls;
    create schema private;
    create table private.role_assignments(user_id uuid,role text,scope_type text,status text,
      starts_at timestamptz default now(),ends_at timestamptz);
    create table private.ai_configurations(singleton boolean primary key default true check(singleton),
      enabled boolean not null default false,model_id text not null default '',system_prompt text not null,
      temperature numeric(3,2) not null default 0.3 check(temperature between 0 and 0.70),
      max_output_tokens integer not null default 320 check(max_output_tokens between 64 and 512),
      per_user_daily_limit integer not null default 10 check(per_user_daily_limit between 1 and 50),
      global_daily_limit integer not null default 100 check(global_daily_limit between 1 and 500),
      version_no integer not null default 1 check(version_no>0),updated_by uuid,updated_at timestamptz default now(),
      check(model_id='' or model_id ~ '^[a-z0-9][a-z0-9._/-]{1,200}$'),
      check(length(system_prompt) between 40 and 6000));
    alter table private.ai_configurations enable row level security;
    create table private.audit_events(id uuid primary key default gen_random_uuid(),actor_id uuid,
      actor_type text,action text,object_schema text,object_table text,object_id uuid,outcome text,
      reason text,metadata jsonb,occurred_at timestamptz default now());
    insert into private.ai_configurations(system_prompt) values('Fictional reviewed prompt for offline regression only.');
    insert into private.role_assignments(user_id,role,scope_type,status,starts_at,ends_at) values
      ('${owner}','owner','global','active',now()-interval '1 hour',null),
      ('${teacherA}','teacher','global','active',now()-interval '1 hour',null),
      ('${teacherB}','teacher','global','active',now()-interval '1 hour',null),
      ('${reviewer}','content_reviewer','global','active',now()-interval '1 hour',null),
      ('${revoked}','owner','global','revoked',now()-interval '1 hour',null),
      ('${expired}','owner','global','active',now()-interval '2 hours',now()-interval '1 hour'),
      ('${future}','owner','global','active',now()+interval '1 hour',null);`);
  await db.exec(baseline);
});

after(async () => {
  try { if (db) await db.close(); } finally { globalThis.fetch = previousFetch; }
});

test('forward migration changes exactly the conflict code and preserves data, identity, owner, ACL and search_path', async () => {
  const state = await snapshot();
  const original = await definition();
  assert.equal(original.fingerprint, '1591e77afdfc0dacb6b39200d7bbefc2');
  await db.exec(repair);
  const updated = await definition();
  assert.equal(updated.definition, original.definition.replace("errcode = '40001'", "errcode = 'PT409'"));
  assert.equal(updated.fingerprint, '5ad67fe52caf79bd07c51caa0c30db92');
  for (const key of ['oid', 'proowner', 'acl', 'proconfig', 'prosecdef']) assert.deepEqual(updated[key], original[key]);
  assert.deepEqual(await snapshot(), state);
});

test('exact migration retry is a no-op', async () => {
  const original = await definition();
  const state = await snapshot();
  await db.exec(repair);
  assert.deepEqual(await definition(), original);
  assert.deepEqual(await snapshot(), state);
});

test('missing RPC fails closed instead of creating a new privileged function', async () => {
  await db.exec(`drop function ${signature}`);
  await denied(() => db.exec(repair), 'P0001');
  assert.equal((await scalar('select to_regprocedure($1) as rpc', [signature])).rpc, null);
  await db.exec(baseline);
  await db.exec(repair);
});

test('unexpected definition drift is rejected without overwriting the different function', async () => {
  await db.exec(baseline.replace("message = 'Owner role required'", "message = 'Unexpected fixture drift'"));
  const original = await definition();
  await denied(() => db.exec(repair), 'P0001');
  assert.deepEqual(await definition(), original);
  await db.exec(baseline);
  await db.exec(repair);
});

test('unexpected ACL drift is rejected, not silently widened or repaired', async () => {
  await db.exec(`grant execute on function ${signature} to authenticated`);
  const original = await definition();
  await denied(() => db.exec(repair), 'P0001');
  assert.deepEqual(await definition(), original);
  await db.exec(`revoke execute on function ${signature} from authenticated`);
  await db.exec(repair);
});

test('stale and null versions return PT409 with no config or audit write', async () => {
  for (const stale of [-1, null]) {
    const state = await snapshot();
    await denied(() => callOwner(owner, stale), 'PT409');
    assert.deepEqual(await snapshot(), state);
  }
});

test('active Owner save stays atomic, versioned, audited and AI-off', async () => {
  const previous = await version();
  const saved = await callOwner(owner, previous);
  assert.equal(saved.version_no, previous + 1);
  assert.equal(saved.enabled, false);
  assert.equal(saved.model_id, '');
  assert.equal(saved.updated_by, owner);
  assert.equal('singleton' in saved, false);
  assert.equal((await scalar("select count(*)::int as count from private.audit_events where action='ai_config.updated'")).count, 1);
});

test('learner, teacher, reviewer, revoked, expired, future and missing actors remain denied', async () => {
  const state = await snapshot();
  for (const actor of [learner, teacherA, reviewer, revoked, expired, future, null]) {
    await denied(async () => callOwner(actor, await version()), '42501');
  }
  assert.deepEqual(await snapshot(), state);
});

test('invalid limits still fail before persistence', async () => {
  const state = await snapshot();
  await denied(async () => callOwner(owner, await version(), { max_output_tokens: 513 }), '22023');
  assert.deepEqual(await snapshot(), state);
});

test('client EXECUTE/direct private access remains denied; server RPC needs no private USAGE', async () => {
  for (const role of ['anon', 'authenticated']) {
    await db.exec(`set role ${role}`);
    try {
      await denied(() => callOwner(owner, 1), '42501');
      await denied(() => db.query('select * from private.ai_configurations'), '42501');
    } finally { await db.exec('reset role'); }
  }
  const expected = await version();
  await db.exec('set role service_role');
  try {
    await denied(() => db.query('select * from private.ai_configurations'), '42501');
    assert.equal((await callOwner(owner, expected)).version_no, expected + 1);
  } finally { await db.exec('reset role'); }
});

test('unapplied teacher save function is exercised with the same private, versioned draft boundary', async () => {
  await db.exec(`create table public.teachers(user_id uuid primary key,active boolean);
    create table public.sessions(id uuid primary key,owner_teacher_id uuid,stable_slug text,updated_at timestamptz default now());
    create table public.session_versions(id uuid primary key default gen_random_uuid(),session_id uuid,version_no integer,
      source_version_id uuid,locale text,title text,summary text,objective text,level text,intensity text,pace text,
      instruction_density text,duration_seconds integer,props jsonb,space_requirement text,floor_contact text,
      positions jsonb,learning_focus jsonb,status text,updated_at timestamptz default now());
    create table public.session_segments(session_version_id uuid,position integer,start_ms integer,end_ms integer,
      movement_name text,cue_text text,stop_cue text,breath_cue text,variant_ref text);
    insert into public.teachers values('${teacherA}',true),('${teacherB}',true);`);
  const start = teacher.indexOf('create or replace function public.mcy_teacher_save_own_draft(');
  assert.notEqual(start, -1);
  await db.exec(teacher.slice(start, teacher.indexOf('$$;', start) + 3));
  await db.exec(`revoke all on function public.mcy_teacher_save_own_draft(uuid,jsonb) from public,anon,authenticated;
    grant execute on function public.mcy_teacher_save_own_draft(uuid,jsonb) to service_role;`);
  lesson = await callTeacher(teacherA, draft);
  assert.equal(lesson.version_no, 1);
  assert.equal(lesson.status, 'draft');
});

const draftSnapshot = () => scalar(`select
  (select jsonb_agg(to_jsonb(s) order by s.id) from public.sessions s) as sessions,
  (select jsonb_agg(to_jsonb(s) order by s.position) from public.session_segments s) as segments,
  (select jsonb_agg(to_jsonb(v) order by v.id) from public.session_versions v) as versions,
  (select jsonb_agg(to_jsonb(a) order by a.id) from private.audit_events a) as audit`);

test('teacher stale version raises PT409 without creating a version or audit event', async () => {
  const state = await draftSnapshot();
  await denied(() => callTeacher(teacherA, { ...draft, session_id: lesson.session_id, expected_version: 99 }), 'PT409');
  assert.deepEqual(await draftSnapshot(), state);
});

test('teacher cross-actor session access remains denied', async () => {
  const state = await draftSnapshot();
  await denied(() => callTeacher(teacherB, { ...draft, session_id: lesson.session_id, expected_version: 1 }), 'P0002');
  assert.deepEqual(await draftSnapshot(), state);
});

test('teacher non-draft latest version raises PT409 without further writes', async () => {
  await db.query("update public.session_versions set status='published' where id=$1", [lesson.version_id]);
  const state = await draftSnapshot();
  await denied(() => callTeacher(teacherA, { ...draft, session_id: lesson.session_id, expected_version: 1 }), 'PT409');
  assert.deepEqual(await draftSnapshot(), state);
});

test('teacher missing latest version raises PT409 without recreating content', async () => {
  await db.query('delete from public.session_versions where id=$1', [lesson.version_id]);
  const state = await draftSnapshot();
  await denied(() => callTeacher(teacherA, { ...draft, session_id: lesson.session_id, expected_version: 1 }), 'PT409');
  assert.deepEqual(await draftSnapshot(), state);
});
