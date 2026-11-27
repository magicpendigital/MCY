// Replays the migration chain applied on mcy-staging (through 20261127072022) and then the S1 candidate
// 20261127150000_teacher_course_groups.sql LAST, with fictional platform scaffolding. A teacher may save a course_group made of
// the teacher's own video lessons only, without guidance; the Owner reviews and switches it on; the public snapshot then carries it
// with the teacher's byline. Supplements, and is not, live Supabase evidence. Needs @electric-sql/pglite (MCY_PGLITE_MODULE_PATH).
const { test } = require('node:test');
const { assert, read, one, newDb, denied } = require('./support/pglite-chain.cjs');

// Same staged order as tests/teacher-control-plane-rehearsal.cjs, plus the two teacher migrations that landed on 2026-11-27.
const later = ['20261023171210_delete_my_account.sql', '20261102173348_reading_publication.sql', '20261102173513_add_glute_body_region.sql',
  '20261108111116_content_foundation.sql', '20261108162119_content_display.sql', '20261109022545_content_publication.sql',
  '20261110175347_content_snapshot_screens.sql', '20261127031613_teacher_control_plane_rpcs.sql', '20261127072022_teacher_invite_account_kind.sql'];
const candidate = '20261127150000_teacher_course_groups.sql';

const id = n => `55000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
const O = id(1), T = id(2), U = id(3), S = id(4);
const checks = Object.fromEntries(['accessibility', 'actualDurationChecked', 'audienceScope', 'contentAccuracy', 'expertiseConfirmed', 'rightsConfirmed', 'stopGuidance', 'vietnameseAudioReady'].map(k => [k, true]));
const lesson = { youtubeId: 'AAAAAAAAAAA', summary: 'Fictional lesson summary', durationLabel: '0:43', orientation: 'portrait' };
const q = (db, sql, args) => one(db, sql, args).then(r => r.v);
const save = (db, actor, item, kind, title, payload, seq) => q(db, 'select public.mcy_content_save_version($1::uuid,$2,$3,$4,$5::jsonb,$6::int) as v', [actor, item, kind, title, JSON.stringify(payload), seq]);
const submit = (db, actor, item, seq) => q(db, 'select public.mcy_content_submit($1::uuid,$2,$3::int) as v', [actor, item, seq]);
const review = (db, item, seq, revision) => q(db, `select public.mcy_content_review_item($1::uuid,$2,$3::int,$4::int,'approved','Fictional qualification text','Fictional review basis text','Fictional rights basis text',$5::jsonb) as v`, [O, item, seq, revision, JSON.stringify(checks)]);
const show = (db, item, seq = 1) => q(db, 'select public.mcy_content_set_visibility($1::uuid,$2,$3::int,true) as v', [O, item, seq]);
const snapshot = db => q(db, 'select public.mcy_content_snapshot($1::uuid) as v', [O]);
const refused = (fn, code, message) => assert.rejects(fn, e => e.code === code && (!message || e.message === message));

// Effective ACL/RLS/security-definer/search_path state of every relation and function in the app schemas.
const aclSnapshot = db => q(db, `select jsonb_object_agg(k, v) as v from (
  select 'rel:' || n.nspname || '.' || c.relname as k, coalesce(c.relacl::text, '') || '|rls=' || c.relrowsecurity as v
    from pg_class c join pg_namespace n on n.oid = c.relnamespace where n.nspname in ('public', 'private', 'storage', 'auth') and c.relkind in ('r', 'p', 'v', 'm', 'S')
  union all select 'fn:' || n.nspname || '.' || p.proname || '(' || pg_get_function_identity_arguments(p.oid) || ')', coalesce(p.proacl::text, '') || '|' || p.prosecdef || '|' || coalesce(array_to_string(p.proconfig, ','), '')
    from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname in ('public', 'private')
  union all select 'pol:' || schemaname || '.' || tablename || '.' || policyname, cmd || '|' || array_to_string(roles, ',') || '|' || coalesce(qual, '') || '|' || coalesce(with_check, '') from pg_policies
) s`);
const body = db => q(db, `select p.prosrc as v from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname = 'public' and p.proname = 'mcy_content_save_version'`);

async function fixture({ apply = true } = {}) {
  const db = await newDb();
  for (const f of later) await db.exec(read(f));
  await db.exec('alter default privileges in schema public grant all on functions to anon, authenticated, service_role;');
  const before = await aclSnapshot(db), bodyBefore = await body(db);
  if (apply) await db.exec(read(candidate));
  const after = await aclSnapshot(db), bodyAfter = await body(db);
  for (const u of [O, T, U, S]) await db.query('insert into auth.users(id,email,email_confirmed_at) values($1,$2,now())', [u, `fictional-${u.slice(-1)}@example.test`]);
  await db.query(`insert into private.role_assignments(user_id,role,scope_type,reason) values($1,'owner','global','Fictional fixture'),($2,'teacher','global','Fictional fixture'),($3,'teacher','global','Fictional fixture')`, [O, T, U]);
  await db.query(`insert into public.teachers(user_id,public_name,active) values($1,'Fictional teacher T',true),($2,'Fictional teacher U',true)`, [T, U]);
  await db.exec('set role service_role;');
  return { db, before, after, bodyBefore, bodyAfter };
}

test('before the candidate a teacher course is refused; the patch changes only the save function body, never a privilege', async () => {
  const old = await fixture({ apply: false });
  try {
    const a = await save(old.db, T, null, 'video_lesson', 'Lesson', lesson, 0);
    await refused(() => save(old.db, T, null, 'course_group', 'Course', { summary: 'Fictional course', lessonIds: [a.item_id] }, 0), '42501', 'content_kind_not_allowed');
  } finally { await old.db.close(); }
  const { db, before, after, bodyBefore, bodyAfter } = await fixture();
  try {
    assert.deepEqual(after, before, 'ACL, RLS, security definer and search_path are unchanged');
    assert.notEqual(bodyAfter, bodyBefore);
    assert.equal(bodyAfter.split("p_kind not in ('video_lesson', 'course_group')").length - 1, 2, 'both teacher kind checks (before and after the lock) were widened');
    assert.equal(bodyAfter.includes("p_kind <> 'video_lesson'"), false);
    assert.equal(bodyAfter.split('course_lessons_not_own').length - 1, 1);
    // Re-applying the candidate is refused by its drift guard instead of patching twice.
    await db.exec('reset role;');
    await refused(() => db.exec(read(candidate)), 'P0001');
  } finally { await db.close(); }
});

test('a teacher course holds only the teacher\'s own video lessons and no guidance; other kinds stay MCY-only', async () => {
  const { db } = await fixture();
  try {
    const a = await save(db, T, null, 'video_lesson', 'Lesson A', lesson, 0);
    const b = await save(db, T, null, 'video_lesson', 'Lesson B', { ...lesson, youtubeId: 'BBBBBBBBBBB' }, 0);
    const other = await save(db, U, null, 'video_lesson', 'Lesson of U', lesson, 0);
    const mcy = await save(db, O, null, 'video_lesson', 'MCY lesson', lesson, 0);
    const course = { summary: 'Fictional course', lessonIds: [b.item_id, a.item_id] };
    const c = await save(db, T, null, 'course_group', 'Course of T', course, 0);
    assert.match(c.item_id, /^group-[a-f0-9]{16}$/);
    assert.deepEqual([c.seq, c.status, c.unchanged], [1, 'draft', false]);
    // A new version, a submit, and the teacher sees it in the own list with the author label
    const c2 = await save(db, T, c.item_id, 'course_group', 'Course of T', { ...course, lessonIds: [a.item_id] }, 1);
    assert.equal(c2.seq, 2);
    assert.equal((await submit(db, T, c.item_id, 2)).status, 'submitted');
    const own = await q(db, 'select public.mcy_content_list($1::uuid) as v', [T]);
    assert.deepEqual(own.items.map(i => [i.item_id, i.kind]).sort(), [[a.item_id, 'video_lesson'], [b.item_id, 'video_lesson'], [c.item_id, 'course_group']].sort());
    // Refused: another teacher's lesson, an MCY lesson, a missing id, a group id, empty, non-string ids, guidance (even unreviewed)
    for (const lessonIds of [[a.item_id, other.item_id], [mcy.item_id], ['video-missing'], [c.item_id], [], [1], 'x', null]) {
      await refused(() => save(db, T, null, 'course_group', 'Bad', { summary: 'Fictional course', lessonIds }, 0), '22023', 'course_lessons_not_own');
    }
    await refused(() => save(db, T, null, 'course_group', 'Bad', { summary: 'Fictional course' }, 0), '22023', 'course_lessons_not_own');
    await refused(() => save(db, T, null, 'course_group', 'Bad', { ...course, guidance: { reviewed: true, benefits: ['x'], cautions: [] } }, 0), '22023', 'course_lessons_not_own');
    await refused(() => save(db, T, null, 'course_group', 'Bad', { ...course, guidance: { reviewed: false, benefits: [], cautions: [] } }, 0), '22023', 'course_lessons_not_own');
    // Ownership of the course itself: another teacher and the Owner cannot write it; a refused save adds no version
    await refused(() => save(db, U, c.item_id, 'course_group', 'x', { summary: 'Fictional course', lessonIds: [other.item_id] }, 2), '42501', 'content_access_required');
    await refused(() => save(db, O, c.item_id, 'course_group', 'x', { summary: 'Fictional course', lessonIds: [mcy.item_id] }, 2), '42501', 'teacher_content_is_reviewed_not_edited');
    await refused(() => save(db, T, c.item_id, 'course_group', 'x', { summary: 'Fictional course', lessonIds: [other.item_id] }, 2), '22023', 'course_lessons_not_own');
    assert.equal((await q(db, 'select public.mcy_content_read_version($1::uuid,$2,null) as v', [T, c.item_id])).latest_seq, 2);
    // Screen texts and reading units remain refused for a teacher; a stranger is refused outright
    await refused(() => save(db, T, null, 'screen_text', 'x', { locale: 'vi-VN', entries: { a: 'b' } }, 0), '42501', 'content_kind_not_allowed');
    await refused(() => save(db, T, null, 'reading_unit', 'x', lesson, 0), '42501', 'content_kind_not_allowed');
    await refused(() => save(db, S, null, 'course_group', 'x', course, 0), '42501');
    // A removed teacher role stops course saves too
    await db.exec('reset role;'); await db.query('delete from private.role_assignments where user_id=$1', [T]); await db.exec('set role service_role;');
    await refused(() => save(db, T, null, 'course_group', 'x', course, 0), '42501');
    // The Owner's own courses are unchanged: MCY lessons, teacher lessons and guidance are all still accepted
    const g = await save(db, O, null, 'course_group', 'MCY course', { summary: 'Fictional group', lessonIds: [mcy.item_id, a.item_id, other.item_id], guidance: { reviewed: true, benefits: ['Fictional benefit'], cautions: [] } }, 0);
    assert.equal(g.seq, 1);
  } finally { await db.close(); }
});

test('an approved and switched-on teacher course reaches the public snapshot with the teacher byline and only shown lessons', async () => {
  const { db } = await fixture();
  try {
    const { buildManifest } = await import('../supabase/functions/_shared/contentPublication.ts');
    const a = await save(db, T, null, 'video_lesson', 'Lesson A', lesson, 0);
    const b = await save(db, T, null, 'video_lesson', 'Lesson B', { ...lesson, youtubeId: 'BBBBBBBBBBB' }, 0);
    const c = await save(db, T, null, 'course_group', 'Course of T', { summary: 'Fictional course', lessonIds: [a.item_id, b.item_id] }, 0);
    for (const item of [a.item_id, c.item_id]) { await submit(db, T, item, 1); await review(db, item, 1, 0); await show(db, item); }
    const manifest = buildManifest(await snapshot(db), new Date('2026-11-27T00:00:00Z'));
    assert.deepEqual(manifest.groups.map(g => [g.id, g.title, g.lesson_ids, g.byline, 'guidance' in g]), [[c.item_id, 'Course of T', [a.item_id], 'Fictional teacher T', false]], 'lesson B is not approved, so the course shows lesson A only');
    assert.deepEqual(manifest.lessons.map(l => [l.id, l.byline]), [[a.item_id, 'Fictional teacher T']]);
    // Without the course switched on, the approved lesson alone is not published (why S1 is needed)
    await q(db, 'select public.mcy_content_set_visibility($1::uuid,$2,1,false) as v', [O, c.item_id]);
    const bare = buildManifest(await snapshot(db));
    assert.deepEqual([bare.groups.length, bare.lessons.length], [0, 0]);
  } finally { await db.close(); }
});
