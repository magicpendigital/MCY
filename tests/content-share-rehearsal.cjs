// Replays the migration chain applied on mcy-staging (through 20261128043923, W1/T1) and then the candidate
// 20261128150000_content_review_shares.sql LAST, with fictional platform scaffolding. Owner 28/11, option A: the Owner invites an
// active teacher to read an MCY lesson or course and comment; the teacher never edits, never decides a review and never changes
// what learners see. Plus the Owner's list of MCY lessons still without "areas". Supplements, and is not, live Supabase evidence.
// Needs @electric-sql/pglite (MCY_PGLITE_MODULE_PATH).
const { test } = require('node:test');
const { assert, read, one, newDb } = require('./support/pglite-chain.cjs');

const later = ['20261023171210_delete_my_account.sql', '20261102173348_reading_publication.sql', '20261102173513_add_glute_body_region.sql',
  '20261108111116_content_foundation.sql', '20261108162119_content_display.sql', '20261109022545_content_publication.sql',
  '20261110175347_content_snapshot_screens.sql', '20261127031613_teacher_control_plane_rpcs.sql', '20261127072022_teacher_invite_account_kind.sql',
  '20261128030007_teacher_course_groups.sql', '20261128043923_teacher_content_tracking.sql'];
const candidate = '20261128150000_content_review_shares.sql'; // local candidate; not on staging
const newFns = ['mcy_content_share_set', 'mcy_content_share_read', 'mcy_content_shared_list', 'mcy_content_share_note', 'mcy_content_legacy_lessons'];
const newTables = ['mcy_content_shares', 'mcy_content_share_events', 'mcy_content_share_notes'];

const id = n => `57000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
const O = id(1), T = id(2), U = id(3), S = id(4);
const checks = Object.fromEntries(['accessibility', 'actualDurationChecked', 'audienceScope', 'contentAccuracy', 'expertiseConfirmed', 'rightsConfirmed', 'stopGuidance', 'vietnameseAudioReady'].map(k => [k, true]));
const lesson = { youtubeId: 'AAAAAAAAAAA', summary: 'Fictional lesson summary', durationLabel: '0:43', orientation: 'portrait' };
const q = (db, sql, args) => one(db, sql, args).then(r => r.v);
const importItem = (db, item, kind, title, payload) => q(db, 'select public.mcy_content_import($1::uuid,$2,$3,$4,$5::jsonb,null) as v', [O, item, kind, title, JSON.stringify(payload)]);
const save = (db, actor, item, kind, title, payload, seq) => q(db, 'select public.mcy_content_save_version($1::uuid,$2,$3,$4,$5::jsonb,$6::int) as v', [actor, item, kind, title, JSON.stringify(payload), seq]);
const review = (db, item, seq, revision) => q(db, `select public.mcy_content_review_item($1::uuid,$2,$3::int,$4::int,'approved','Fictional qualification text','Fictional review basis text','Fictional rights basis text',$5::jsonb) as v`, [O, item, seq, revision, JSON.stringify(checks)]);
const share = (db, actor, item, reviewer, active = true, days = 7) => q(db, 'select public.mcy_content_share_set($1::uuid,$2,$3::uuid,$4,$5::int) as v', [actor, item, reviewer, active, days]);
const shareRead = (db, actor, item) => q(db, 'select public.mcy_content_share_read($1::uuid,$2) as v', [actor, item]);
const shared = (db, actor) => q(db, 'select public.mcy_content_shared_list($1::uuid) as v', [actor]);
const note = (db, actor, item, seq, text) => q(db, 'select public.mcy_content_share_note($1::uuid,$2,$3::int,$4) as v', [actor, item, seq, text]);
const legacy = db => q(db, 'select public.mcy_content_legacy_lessons($1::uuid) as v', [O]);
const reviewState = (db, item) => asAdmin(db, () => one(db, `select s.decision, s.revision from private.mcy_content_review_states s join private.mcy_content_versions v
  on v.item_id = s.candidate_id and v.content_hash = s.content_version where v.item_id = $1 order by v.seq desc limit 1`, [item]));
const refused = (fn, code, message) => assert.rejects(fn, e => e.code === code && (!message || e.message === message));
const asAdmin = async (db, fn) => { await db.exec('reset role;'); try { return await fn(); } finally { await db.exec('set role service_role;'); } };

const aclSnapshot = db => q(db, `select jsonb_object_agg(k, v) as v from (
  select 'rel:' || n.nspname || '.' || c.relname as k, coalesce(c.relacl::text, '') || '|rls=' || c.relrowsecurity as v
    from pg_class c join pg_namespace n on n.oid = c.relnamespace where n.nspname in ('public', 'private', 'storage', 'auth') and c.relkind in ('r', 'p', 'v', 'm', 'S')
      and not (c.relname like 'mcy_content_share%')
  union all select 'fn:' || n.nspname || '.' || p.proname || '(' || pg_get_function_identity_arguments(p.oid) || ')', coalesce(p.proacl::text, '') || '|' || p.prosecdef || '|' || coalesce(array_to_string(p.proconfig, ','), '')
    from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname in ('public', 'private')
      and p.proname <> all (array['mcy_content_share_set','mcy_content_share_read','mcy_content_shared_list','mcy_content_share_note','mcy_content_legacy_lessons','mcy_content_is_teacher'])
  union all select 'pol:' || schemaname || '.' || tablename || '.' || policyname, cmd || '|' || array_to_string(roles, ',') || '|' || coalesce(qual, '') || '|' || coalesce(with_check, '') from pg_policies
) s`);

async function fixture() {
  const db = await newDb();
  for (const f of later) await db.exec(read(f));
  await db.exec('alter default privileges in schema public grant all on functions to anon, authenticated, service_role;');
  await db.exec('alter default privileges in schema private grant all on functions to anon, authenticated, service_role;');
  await db.exec('alter default privileges in schema private grant all on tables to anon, authenticated, service_role;');
  const before = await aclSnapshot(db);
  await db.exec(read(candidate));
  const after = await aclSnapshot(db);
  for (const u of [O, T, U, S]) await db.query('insert into auth.users(id,email,email_confirmed_at) values($1,$2,now())', [u, `fictional-${u.slice(-1)}@example.test`]);
  await db.query(`insert into private.role_assignments(user_id,role,scope_type,reason) values($1,'owner','global','Fictional fixture'),($2,'teacher','global','Fictional fixture'),($3,'teacher','global','Fictional fixture')`, [O, T, U]);
  await db.query(`insert into public.teachers(user_id,public_name,active) values($1,'Fictional teacher T',true),($2,'Fictional teacher U',true)`, [T, U]);
  await db.exec('set role service_role;');
  return { db, before, after };
}

test('the candidate adds private tables with no client or service access and service-only functions, and changes nothing else', async () => {
  const { db, before, after } = await fixture();
  try {
    assert.deepEqual(after, before);
    await db.exec('reset role;');
    for (const t of newTables) {
      const r = await one(db, `select c.relrowsecurity as rls,
        has_table_privilege('anon', c.oid, 'select,insert,update,delete,truncate,references,trigger') as anon,
        has_table_privilege('authenticated', c.oid, 'select,insert,update,delete,truncate,references,trigger') as auth,
        has_table_privilege('service_role', c.oid, 'select,insert,update,delete,truncate,references,trigger') as service
        from pg_class c join pg_namespace n on n.oid = c.relnamespace where n.nspname = 'private' and c.relname = $1`, [t]);
      assert.deepEqual([r.rls, r.anon, r.auth, r.service], [true, false, false, false], t);
    }
    for (const f of newFns) {
      const fn = await one(db, `select p.prosecdef as definer, array_to_string(p.proconfig, ',') as config, p.proacl::text as acl,
        has_function_privilege('anon', p.oid, 'execute') as anon, has_function_privilege('authenticated', p.oid, 'execute') as auth,
        has_function_privilege('service_role', p.oid, 'execute') as service
        from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname = 'public' and p.proname = $1`, [f]);
      assert.deepEqual([fn.definer, fn.config, fn.anon, fn.auth, fn.service], [true, 'search_path=""', false, false, true], f);
      assert.equal(/(^|[{,])=X\//.test(fn.acl), false, `${f}: PUBLIC has no EXECUTE`);
    }
    const helper = await one(db, `select has_function_privilege('service_role', 'private.mcy_content_is_teacher(uuid)', 'execute') as s,
      has_function_privilege('authenticated', 'private.mcy_content_is_teacher(uuid)', 'execute') as a`);
    assert.deepEqual([helper.s, helper.a], [false, false]);
    await db.exec('set role authenticated;');
    await refused(() => shared(db, T), '42501');
  } finally { await db.close(); }
});

test('an invited teacher reads the latest MCY version and comments; nothing is edited, decided or shown, and the Owner sees the comment', async () => {
  const { db } = await fixture();
  try {
    const l = await importItem(db, 'video-mcy-01', 'video_lesson', 'MCY lesson', lesson);
    await review(db, l.item_id, 1, 0);
    const before = await reviewState(db, l.item_id);
    const c = await importItem(db, 'group-mcy-01', 'course_group', 'MCY course', { summary: 'Fictional group', lessonIds: [l.item_id] });
    const own = await save(db, T, null, 'video_lesson', 'Lesson of T', lesson, 0);

    // Nobody invited yet
    assert.deepEqual((await shared(db, T)).items, []);
    let o = await shareRead(db, O, l.item_id);
    assert.equal(o.shareable, true);
    assert.deepEqual(o.shares, []);
    assert.deepEqual(o.eligible.map(e => e.label), ['Fictional teacher T', 'Fictional teacher U']);
    assert.equal((await shareRead(db, O, own.item_id)).shareable, false);

    const r = await share(db, O, l.item_id, T, true, 7);
    assert.deepEqual([r.active, r.unchanged], [true, false]);
    await share(db, O, c.item_id, T, true, 1);
    const t = await shared(db, T);
    assert.deepEqual(t.items.map(i => i.item_id).sort(), [l.item_id, c.item_id].sort());
    const item = t.items.find(i => i.item_id === l.item_id);
    assert.deepEqual([item.kind, item.seq, item.title, item.payload.youtubeId, item.notes], ['video_lesson', 1, 'MCY lesson', 'AAAAAAAAAAA', []]);
    assert.deepEqual((await shared(db, U)).items, [], 'another teacher sees nothing');
    assert.deepEqual((await shared(db, O)).items, [], 'the Owner has no invitations');

    await note(db, T, l.item_id, 1, '  Fictional comment on the cue at 0:20  ');
    await refused(() => note(db, T, l.item_id, 2, 'Wrong version'), 'PT409');
    await refused(() => note(db, U, l.item_id, 1, 'Not invited'), '42501');
    await refused(() => note(db, O, l.item_id, 1, 'Owner is not a teacher here'), '42501');
    await refused(() => note(db, T, l.item_id, 1, '   '), '22023');
    await refused(() => note(db, T, own.item_id, 1, 'Own lesson is not shared'), '42501');
    assert.deepEqual((await shared(db, T)).items.find(i => i.item_id === l.item_id).notes.map(n => [n.seq, n.note]), [[1, 'Fictional comment on the cue at 0:20']]);
    o = await shareRead(db, O, l.item_id);
    assert.deepEqual(o.shares.map(s => [s.reviewer_id, s.label]), [[T, 'Fictional teacher T']]);
    assert.deepEqual(o.notes.map(n => [n.seq, n.note, n.label]), [[1, 'Fictional comment on the cue at 0:20', 'Fictional teacher T']]);

    // Sharing never touched the Owner's decision, and the teacher still cannot edit or decide MCY content
    assert.deepEqual(await reviewState(db, l.item_id), before);
    await refused(() => save(db, T, l.item_id, 'video_lesson', 'Edited by T', lesson, 1), '42501');
    await refused(() => q(db, `select public.mcy_content_review_item($1::uuid,$2,1,1,'approved','Fictional qualification text','Fictional review basis text','Fictional rights basis text',$3::jsonb) as v`, [T, l.item_id, JSON.stringify(checks)]), '42501');
    assert.equal(await asAdmin(db, () => q(db, 'select count(*)::int as v from private.mcy_content_reviewer_assignments')), 0);

    // A new Owner version moves the comment target to the newest version
    await importItem(db, 'video-mcy-01', 'video_lesson', 'MCY lesson', { ...lesson, summary: 'Second summary' });
    await refused(() => note(db, T, l.item_id, 1, 'Old version'), 'PT409');
    assert.equal((await shared(db, T)).items.find(i => i.item_id === l.item_id).seq, 2);

    // Withdrawn and expired invitations end access; withdrawing twice is a no-op
    const w = await share(db, O, l.item_id, T, false, 1);
    assert.deepEqual([w.active, w.unchanged], [false, false]);
    assert.equal((await share(db, O, l.item_id, T, false, 1)).unchanged, true);
    await refused(() => note(db, T, l.item_id, 2, 'After withdrawal'), '42501');
    await asAdmin(db, () => db.query(`update private.mcy_content_shares set expires_at = now() - interval '1 minute' where item_id = $1`, [c.item_id]));
    assert.deepEqual((await shared(db, T)).items, []);
    assert.deepEqual((await shareRead(db, O, l.item_id)).shares, []);
    assert.equal((await shareRead(db, O, l.item_id)).notes.length, 1, 'comments stay with the item');
    assert.equal(await asAdmin(db, () => q(db, 'select count(*)::int as v from private.mcy_content_share_events')), 3);
  } finally { await db.close(); }
});

test('only the Owner shares, only MCY lessons and courses, only with an active teacher, within 1-30 days', async () => {
  const { db } = await fixture();
  try {
    const l = await importItem(db, 'video-mcy-02', 'video_lesson', 'MCY lesson', lesson);
    const own = await save(db, T, null, 'video_lesson', 'Lesson of T', lesson, 0);
    await refused(() => share(db, T, l.item_id, U), '42501', 'owner_access_required');
    await refused(() => share(db, S, l.item_id, T), '42501');
    await refused(() => share(db, O, own.item_id, U), '22023', 'invalid_share');
    await refused(() => share(db, O, 'video-missing', T), '22023', 'content_item_not_found');
    await refused(() => share(db, O, l.item_id, S), '42501', 'active_teacher_required');
    await refused(() => share(db, O, l.item_id, O), '22023', 'invalid_share');
    await refused(() => share(db, O, l.item_id, T, true, 0), '22023', 'invalid_share');
    await refused(() => share(db, O, l.item_id, T, true, 31), '22023', 'invalid_share');
    await asAdmin(db, () => db.query('update public.teachers set active = false where user_id = $1', [U]));
    await refused(() => share(db, O, l.item_id, U), '42501', 'active_teacher_required');
    assert.deepEqual((await shareRead(db, O, l.item_id)).eligible.map(e => e.label), ['Fictional teacher T']);
    await share(db, O, l.item_id, T);
    await asAdmin(db, () => db.query('delete from private.role_assignments where user_id = $1', [T]));
    await refused(() => shared(db, T), '42501');
    await refused(() => shareRead(db, T, l.item_id), '42501');
    await refused(() => legacy(db).then(() => q(db, 'select public.mcy_content_legacy_lessons($1::uuid) as v', [U])), '42501');
  } finally { await db.close(); }
});

test('the Owner lists MCY lessons without areas; a new version with areas leaves the list and the old version is untouched', async () => {
  const { db } = await fixture();
  try {
    const a = await importItem(db, 'video-mcy-03', 'video_lesson', 'Neck lesson', lesson);
    await importItem(db, 'video-mcy-04', 'video_lesson', 'Back lesson', { ...lesson, areas: ['back'] });
    await save(db, T, null, 'video_lesson', 'Lesson of T', lesson, 0);
    let list = await legacy(db);
    assert.deepEqual(list.items.map(i => [i.item_id, i.seq, i.origin]), [[a.item_id, 1, 'imported']]);
    assert.deepEqual(list.items[0].payload, lesson);
    const oldHash = await asAdmin(db, () => q(db, 'select content_hash as v from private.mcy_content_versions where item_id = $1 and seq = 1', [a.item_id]));
    const v2 = await save(db, O, a.item_id, 'video_lesson', 'Neck lesson', { ...lesson, areas: ['neck-shoulders'], tags: ['cổ'] }, 1);
    assert.equal(v2.seq, 2);
    list = await legacy(db);
    assert.deepEqual(list.items, []);
    assert.equal(await asAdmin(db, () => q(db, 'select content_hash as v from private.mcy_content_versions where item_id = $1 and seq = 1', [a.item_id])), oldHash);
    await refused(() => q(db, 'select public.mcy_content_legacy_lessons($1::uuid) as v', [T]), '42501');
  } finally { await db.close(); }
});
