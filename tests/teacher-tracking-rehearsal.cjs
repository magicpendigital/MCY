// Replays the migration chain applied on mcy-staging (through 20261128030007, S1) and then the W1/T1 candidate
// 20261128120000_teacher_content_tracking.sql LAST, with fictional platform scaffolding. A teacher reads, for the teacher's own
// lessons and courses only: the version learners may see, whether it reaches the app, send/review history without the reviewer,
// and the courses that hold a lesson (own courses, plus shown courses). Supplements, and is not, live Supabase evidence.
// Needs @electric-sql/pglite (MCY_PGLITE_MODULE_PATH).
const { test } = require('node:test');
const { assert, read, one, newDb } = require('./support/pglite-chain.cjs');

const later = ['20261023171210_delete_my_account.sql', '20261102173348_reading_publication.sql', '20261102173513_add_glute_body_region.sql',
  '20261108111116_content_foundation.sql', '20261108162119_content_display.sql', '20261109022545_content_publication.sql',
  '20261110175347_content_snapshot_screens.sql', '20261127031613_teacher_control_plane_rpcs.sql', '20261127072022_teacher_invite_account_kind.sql',
  '20261128030007_teacher_course_groups.sql'];
const candidate = '20261128120000_teacher_content_tracking.sql'; // local candidate; not on staging

const id = n => `56000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
const O = id(1), T = id(2), U = id(3), S = id(4);
const checks = Object.fromEntries(['accessibility', 'actualDurationChecked', 'audienceScope', 'contentAccuracy', 'expertiseConfirmed', 'rightsConfirmed', 'stopGuidance', 'vietnameseAudioReady'].map(k => [k, true]));
const lesson = { youtubeId: 'AAAAAAAAAAA', summary: 'Fictional lesson summary', durationLabel: '0:43', orientation: 'portrait' };
const q = (db, sql, args) => one(db, sql, args).then(r => r.v);
const save = (db, actor, item, kind, title, payload, seq) => q(db, 'select public.mcy_content_save_version($1::uuid,$2,$3,$4,$5::jsonb,$6::int) as v', [actor, item, kind, title, JSON.stringify(payload), seq]);
const submit = (db, actor, item, seq) => q(db, 'select public.mcy_content_submit($1::uuid,$2,$3::int) as v', [actor, item, seq]);
const review = (db, item, seq, revision, decision = 'approved') => q(db, `select public.mcy_content_review_item($1::uuid,$2,$3::int,$4::int,$5,'Fictional qualification text','Fictional review basis text','Fictional rights basis text',$6::jsonb) as v`, [O, item, seq, revision, decision, JSON.stringify(checks)]);
const show = (db, item, seq = 1, on = true) => q(db, 'select public.mcy_content_set_visibility($1::uuid,$2,$3::int,$4) as v', [O, item, seq, on]);
const track = (db, actor) => q(db, 'select public.mcy_content_tracking($1::uuid) as v', [actor]);
const refused = (fn, code) => assert.rejects(fn, e => e.code === code);
const byId = (t, item) => t.items.find(i => i.item_id === item);

const aclSnapshot = db => q(db, `select jsonb_object_agg(k, v) as v from (
  select 'rel:' || n.nspname || '.' || c.relname as k, coalesce(c.relacl::text, '') || '|rls=' || c.relrowsecurity as v
    from pg_class c join pg_namespace n on n.oid = c.relnamespace where n.nspname in ('public', 'private', 'storage', 'auth') and c.relkind in ('r', 'p', 'v', 'm', 'S')
  union all select 'fn:' || n.nspname || '.' || p.proname || '(' || pg_get_function_identity_arguments(p.oid) || ')', coalesce(p.proacl::text, '') || '|' || p.prosecdef || '|' || coalesce(array_to_string(p.proconfig, ','), '')
    from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname in ('public', 'private') and p.proname <> 'mcy_content_tracking'
  union all select 'pol:' || schemaname || '.' || tablename || '.' || policyname, cmd || '|' || array_to_string(roles, ',') || '|' || coalesce(qual, '') || '|' || coalesce(with_check, '') from pg_policies
) s`);

async function fixture() {
  const db = await newDb();
  for (const f of later) await db.exec(read(f));
  await db.exec('alter default privileges in schema public grant all on functions to anon, authenticated, service_role;');
  const before = await aclSnapshot(db);
  await db.exec(read(candidate));
  const after = await aclSnapshot(db);
  for (const u of [O, T, U, S]) await db.query('insert into auth.users(id,email,email_confirmed_at) values($1,$2,now())', [u, `fictional-${u.slice(-1)}@example.test`]);
  await db.query(`insert into private.role_assignments(user_id,role,scope_type,reason) values($1,'owner','global','Fictional fixture'),($2,'teacher','global','Fictional fixture'),($3,'teacher','global','Fictional fixture')`, [O, T, U]);
  await db.query(`insert into public.teachers(user_id,public_name,active) values($1,'Fictional teacher T',true),($2,'Fictional teacher U',true)`, [T, U]);
  await db.exec('set role service_role;');
  return { db, before, after };
}

test('the candidate adds one service-only function and changes no other privilege, policy or function', async () => {
  const { db, before, after } = await fixture();
  try {
    assert.deepEqual(after, before);
    await db.exec('reset role;');
    const fn = await one(db, `select p.prosecdef as definer, array_to_string(p.proconfig, ',') as config, p.proacl::text as acl,
      has_function_privilege('anon', p.oid, 'execute') as anon, has_function_privilege('authenticated', p.oid, 'execute') as auth,
      has_function_privilege('service_role', p.oid, 'execute') as service
      from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname = 'public' and p.proname = 'mcy_content_tracking'`);
    assert.deepEqual([fn.definer, fn.config, fn.anon, fn.auth, fn.service], [true, 'search_path=""', false, false, true]);
    assert.equal(/(^|[{,])=X\//.test(fn.acl), false, 'PUBLIC has no EXECUTE');
  } finally { await db.close(); }
});

test('a teacher tracks only own items: shown version, reaching the app through a shown course, history without the reviewer', async () => {
  const { db } = await fixture();
  try {
    const a = await save(db, T, null, 'video_lesson', 'Lesson A', lesson, 0);
    const b = await save(db, T, null, 'video_lesson', 'Lesson B', { ...lesson, youtubeId: 'BBBBBBBBBBB' }, 0);
    const other = await save(db, U, null, 'video_lesson', 'Lesson of U', lesson, 0);
    const c = await save(db, T, null, 'course_group', 'Course of T', { summary: 'Fictional course', lessonIds: [a.item_id, b.item_id] }, 0);
    const hidden = await save(db, U, null, 'course_group', 'Hidden course of U', { summary: 'Fictional course', lessonIds: [other.item_id] }, 0);
    const mcy = await save(db, O, null, 'course_group', 'Shown MCY course', { summary: 'Fictional group', lessonIds: [b.item_id] }, 0);
    const draftMcy = await save(db, O, null, 'course_group', 'Draft MCY course', { summary: 'Fictional group', lessonIds: [a.item_id] }, 0);

    // Nothing reviewed yet: nothing shown, only own items, own course listed for both lessons
    let t = await track(db, T);
    assert.deepEqual(t.items.map(i => i.item_id).sort(), [a.item_id, b.item_id, c.item_id].sort());
    assert.deepEqual(byId(t, a.item_id), { item_id: a.item_id, kind: 'video_lesson', shown_seq: null, on_app: false, history: [], courses: [{ item_id: c.item_id, title: 'Course of T', own: true, shown: false }] });

    // A approved and switched on, course not yet: A is shown but does not reach the app
    await submit(db, T, a.item_id, 1); await review(db, a.item_id, 1, 0); await show(db, a.item_id);
    t = await track(db, T);
    assert.deepEqual([byId(t, a.item_id).shown_seq, byId(t, a.item_id).on_app], [1, false]);
    assert.deepEqual(byId(t, a.item_id).history.map(h => [h.event, h.seq, h.decision ?? null]), [['review', 1, 'approved'], ['submit', 1, null]]);
    for (const h of byId(t, a.item_id).history) assert.deepEqual(Object.keys(h).sort(), h.event === 'review' ? ['at', 'decision', 'event', 'seq'] : ['at', 'event', 'seq']);

    // Course of T approved and switched on: A reaches the app, the course reaches the app; B (not approved) still does not
    await submit(db, T, c.item_id, 1); await review(db, c.item_id, 1, 0); await show(db, c.item_id);
    // The MCY course holding B is shown; it appears for B with its public title, not marked own
    await submit(db, O, mcy.item_id, 1); await review(db, mcy.item_id, 1, 0); await show(db, mcy.item_id);
    t = await track(db, T);
    assert.deepEqual([byId(t, a.item_id).on_app, byId(t, c.item_id).on_app, byId(t, c.item_id).shown_seq, byId(t, b.item_id).on_app], [true, true, 1, false]);
    assert.deepEqual(byId(t, b.item_id).courses, [{ item_id: c.item_id, title: 'Course of T', own: true, shown: true },
      { item_id: mcy.item_id, title: 'Shown MCY course', own: false, shown: true }].sort((x, y) => x.title.localeCompare(y.title)));
    // The draft MCY course holding A is never revealed to the teacher; the course item has no course list
    assert.equal(JSON.stringify(t).includes(draftMcy.item_id), false);
    assert.equal(JSON.stringify(t).includes(hidden.item_id), false);
    assert.equal(JSON.stringify(t).includes(other.item_id), false);
    assert.deepEqual(byId(t, c.item_id).courses, []);
    assert.equal(JSON.stringify(t).includes(O), false, 'the reviewer is never named');
    assert.equal(/qualification|basis|checklist|reviewer/.test(JSON.stringify(t)), false);

    // A new review after switching on hides the version again (effective rule), and tracking says so
    await review(db, a.item_id, 1, 1, 'changes_requested');
    t = await track(db, T);
    assert.deepEqual([byId(t, a.item_id).shown_seq, byId(t, a.item_id).on_app, byId(t, c.item_id).on_app], [null, false, false]);
    assert.equal(byId(t, a.item_id).history[0].decision, 'changes_requested');

    // Another teacher sees only their own items; the Owner sees all teacher and MCY items
    const u = await track(db, U);
    assert.deepEqual(u.items.map(i => i.item_id).sort(), [other.item_id, hidden.item_id].sort());
    const o = await track(db, O);
    assert.equal(o.role, 'owner');
    assert.equal(o.items.length, 7);
  } finally { await db.close(); }
});

test('strangers, missing users and teachers whose role ended are refused', async () => {
  const { db } = await fixture();
  try {
    await refused(() => track(db, S), '42501');
    await refused(() => track(db, id(99)), '42501');
    await refused(() => track(db, null), '42501');
    await db.exec('reset role;'); await db.query('delete from private.role_assignments where user_id=$1', [T]); await db.exec('set role service_role;');
    await refused(() => track(db, T), '42501');
    await db.exec('reset role;');
    await db.exec('set role authenticated;');
    await refused(() => track(db, U), '42501');
  } finally { await db.close(); }
});
