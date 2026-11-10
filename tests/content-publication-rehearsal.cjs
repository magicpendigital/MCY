// Replays the staging chain plus content foundation, display and publication candidates with fictional platform scaffolding.
// Supplements, and is not, live Supabase evidence. Needs @electric-sql/pglite (MCY_PGLITE_MODULE_PATH).
const { test } = require('node:test');
const { assert, read, one, newDb, denied } = require('./support/pglite-chain.cjs');
const files = ['20261108111116_content_foundation.sql', '20261108162119_content_display.sql', '20261109022545_content_publication.sql', '20261110090000_content_snapshot_screens.sql'];
const O = '66000000-0000-4000-8000-000000000001', T = '66000000-0000-4000-8000-000000000002', U = '66000000-0000-4000-8000-000000000003', S = '66000000-0000-4000-8000-000000000004';
const checks = Object.fromEntries(['accessibility', 'actualDurationChecked', 'audienceScope', 'contentAccuracy', 'expertiseConfirmed', 'rightsConfirmed', 'stopGuidance', 'vietnameseAudioReady'].map(k => [k, true]));
const lesson = { youtubeId: 'AAAAAAAAAAA', summary: 'Fictional lesson summary', durationLabel: '0:43', orientation: 'portrait' };
const asService = db => db.exec('set role service_role;');
const q = (db, sql, args) => one(db, sql, args).then(r => r.v);
const save = (db, actor, item, kind, title, payload, seq) => q(db, 'select public.mcy_content_save_version($1::uuid,$2,$3,$4,$5::jsonb,$6::int) as v', [actor, item, kind, title, JSON.stringify(payload), seq]);
const submit = (db, actor, item, seq) => q(db, 'select public.mcy_content_submit($1::uuid,$2,$3::int) as v', [actor, item, seq]);
const review = (db, actor, item, seq, revision) => q(db, `select public.mcy_content_review_item($1::uuid,$2,$3::int,$4::int,'approved','Fictional qualification text','Fictional review basis text','Fictional rights basis text',$5::jsonb) as v`, [actor, item, seq, revision, JSON.stringify(checks)]);
const show = (db, item, seq = 1) => q(db, 'select public.mcy_content_set_visibility($1::uuid,$2,$3::int,true) as v', [O, item, seq]);
const snapshot = (db, actor) => q(db, 'select public.mcy_content_snapshot($1::uuid) as v', [actor]);
const noteSave = (db, actor, item, seq, note) => q(db, 'select public.mcy_content_note_save($1::uuid,$2,$3::int,$4) as v', [actor, item, seq, note]);
const notesRead = (db, actor, item) => q(db, 'select public.mcy_content_notes_read($1::uuid,$2) as v', [actor, item]);

async function fixture() {
  const db = await newDb();
  for (const f of files) await db.exec(read(f));
  for (const id of [O, T, U, S]) await db.query(`insert into auth.users(id,email,email_confirmed_at) values($1,$2,now())`, [id, `fictional-${id.slice(-1)}@example.test`]);
  await db.query(`insert into private.role_assignments(user_id,role,scope_type,reason) values($1,'owner','global','Fictional fixture'),($2,'teacher','global','Fictional fixture'),($3,'teacher','global','Fictional fixture')`, [O, T, U]);
  await db.query(`insert into public.teachers(user_id,public_name,active) values($1,'Fictional teacher T',true),($2,'Fictional teacher U',true)`, [T, U]);
  return db;
}

test('the snapshot holds only effectively shown lessons, groups and screen texts, with a byline only from an active teacher profile', async () => {
  const db = await fixture();
  try {
    await asService(db);
    assert.deepEqual([(await snapshot(db, O)).items, (await snapshot(db, O)).display.discover_order[0]], [[], 'editors_choice']);
    await denied(() => snapshot(db, T), '42501');
    await denied(() => snapshot(db, S), '42501');
    // A teacher lesson, approved and shown: it carries the teacher's name
    const a = await save(db, T, null, 'video_lesson', 'Teacher lesson', lesson, 0);
    await submit(db, T, a.item_id, 1); await review(db, O, a.item_id, 1, 0);
    let items = (await snapshot(db, O)).items;
    assert.equal(items.length, 0, 'approved but not switched on: not in the snapshot');
    await show(db, a.item_id);
    items = (await snapshot(db, O)).items;
    assert.deepEqual([items.length, items[0].item_id, items[0].kind, items[0].author_kind, items[0].author_label, items[0].origin, items[0].payload.youtubeId], [1, a.item_id, 'video_lesson', 'teacher', 'Fictional teacher T', 'authored', 'AAAAAAAAAAA']);
    // Owner-authored group and an imported lesson (no byline by origin)
    const g = await save(db, O, null, 'course_group', 'Group', { summary: 'Fictional group', lessonIds: [a.item_id] }, 0);
    await submit(db, O, g.item_id, 1); await review(db, O, g.item_id, 1, 0); await show(db, g.item_id);
    const imp = await q(db, `select public.mcy_content_import($1::uuid,'video-gentle-01','video_lesson','Imported',$2::jsonb,null) as v`, [O, JSON.stringify(lesson)]);
    await review(db, O, 'video-gentle-01', 1, 0); await show(db, 'video-gentle-01');
    items = (await snapshot(db, O)).items;
    assert.deepEqual(items.map(i => [i.kind, i.author_kind, i.origin, i.author_label]).sort(), [['course_group', 'mcy', 'authored', null], ['video_lesson', 'mcy', 'imported', null], ['video_lesson', 'teacher', 'authored', 'Fictional teacher T']]);
    assert.equal(imp.unchanged, false);
    // The label disappears when the profile is no longer active; a newer review hides the item until it is switched on again
    await db.exec('reset role;'); await db.query('update public.teachers set active=false where user_id=$1', [T]); await asService(db);
    assert.equal((await snapshot(db, O)).items.find(i => i.item_id === a.item_id).author_label, null);
    await review(db, O, a.item_id, 1, 1);
    assert.equal((await snapshot(db, O)).items.some(i => i.item_id === a.item_id), false);
    // Screen texts appear once approved and switched on (the Edge allow-list decides which keys are published); reading units never do
    const t = await save(db, O, null, 'screen_text', 'Text', { locale: 'vi-VN', entries: { a: 'b' } }, 0);
    assert.equal((await snapshot(db, O)).items.some(i => i.kind === 'screen_text'), false, 'a draft screen text is not in the snapshot');
    await submit(db, O, t.item_id, 1); await review(db, O, t.item_id, 1, 0);
    assert.equal((await snapshot(db, O)).items.some(i => i.kind === 'screen_text'), false, 'approved but not switched on: not in the snapshot');
    await show(db, t.item_id);
    assert.equal((await snapshot(db, O)).items.some(i => i.kind === 'screen_text'), true);
  } finally { await db.close(); }
});

test('Owner notes reach the author and the Owner only', async () => {
  const db = await fixture();
  try {
    await asService(db);
    const a = await save(db, T, null, 'video_lesson', 'Teacher lesson', lesson, 0);
    await submit(db, T, a.item_id, 1);
    const saved = await noteSave(db, O, a.item_id, 1, '  Please shorten the summary.  ');
    assert.deepEqual([saved.item_id, saved.seq], [a.item_id, 1]);
    assert.deepEqual((await notesRead(db, T, a.item_id)).notes.map(n => [n.seq, n.note]), [[1, 'Please shorten the summary.']]);
    assert.equal((await notesRead(db, O, a.item_id)).notes.length, 1);
    await denied(() => notesRead(db, U, a.item_id), '42501');                  // another teacher
    await denied(() => notesRead(db, S, a.item_id), '42501');                  // a learner
    await denied(() => noteSave(db, T, a.item_id, 1, 'self note'), '42501');   // only the Owner writes
    await denied(() => noteSave(db, O, a.item_id, 2, 'no such version'), '22023');
    await denied(() => noteSave(db, O, a.item_id, 1, '   '), '22023');
    await denied(() => noteSave(db, O, a.item_id, 1, 'x'.repeat(1001)), '22023');
    await denied(() => notesRead(db, O, 'video-missing'), '22023');
    await db.exec('reset role;');
    await db.query(`insert into private.mcy_content_notes(item_id,seq,note,created_by) select $1,1,'fixture',$2 from generate_series(1,99)`, [a.item_id, O]);
    await asService(db);
    await denied(() => noteSave(db, O, a.item_id, 1, 'over the cap'), 'PT429');
  } finally { await db.close(); }
});

test('the public bucket is exactly as intended and the new objects are closed to clients', async () => {
  const db = await fixture();
  try {
    const bucket = await one(db, `select public, file_size_limit, allowed_mime_types from storage.buckets where id='content-published'`);
    assert.deepEqual([bucket.public, Number(bucket.file_size_limit), [...bucket.allowed_mime_types]], [true, 1048576, ['application/json']]);
    assert.equal((await one(db, `select count(*)::int as n from pg_policies where schemaname='storage' and tablename='objects'`)).n, 0, 'no storage policy: only service_role writes');
    const fns = ['mcy_content_note_save(uuid,text,integer,text)', 'mcy_content_notes_read(uuid,text)', 'mcy_content_snapshot(uuid)'];
    for (const fn of fns) {
      for (const role of ['anon', 'authenticated']) assert.equal((await one(db, `select has_function_privilege($1,$2,'execute') as ok`, [role, `public.${fn}`])).ok, false, `${role} ${fn}`);
      assert.equal((await one(db, `select has_function_privilege('service_role',$1,'execute') as ok`, [`public.${fn}`])).ok, true);
      assert.equal((await one(db, `select p.prosecdef and p.proconfig::text like '%search_path=%' as ok from pg_proc p where p.oid=$1::regprocedure`, [`public.${fn}`])).ok, true);
    }
    for (const role of ['anon', 'authenticated', 'service_role']) for (const privilege of ['select', 'insert', 'update', 'delete', 'truncate']) {
      assert.equal((await one(db, `select has_table_privilege($1,'private.mcy_content_notes',$2) as ok`, [role, privilege])).ok, false, `${role} ${privilege}`);
    }
    assert.equal((await one(db, `select relrowsecurity as ok from pg_class where oid='private.mcy_content_notes'::regclass`)).ok, true);
    await db.exec(`update storage.buckets set public=false where id='content-published'`);
    const guard = read(files[2]).slice(read(files[2]).indexOf('do $$'), read(files[2]).indexOf('-- 2. Owner notes'));
    await assert.rejects(() => db.exec(guard), error => error.code === '42501' && /must be a public bucket/.test(error.message));
  } finally { await db.close(); }
});

test('the snapshot-screens migration refuses to patch a function that drifted from what it expects', async () => {
  const db = await newDb();
  try {
    for (const f of files.slice(0, 3)) await db.exec(read(f));
    await db.exec(`create or replace function public.mcy_content_snapshot(p_actor_id uuid) returns jsonb language plpgsql security definer set search_path = '' as $$ begin return '{}'::jsonb; end $$;`);
    await assert.rejects(() => db.exec(read(files[3])), error => error.code === '55000' && /snapshot_function_drift/.test(error.message));
  } finally { await db.close(); }
});
