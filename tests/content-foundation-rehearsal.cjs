// Replays the staging chain plus the content-foundation candidate with fictional platform scaffolding.
// Supplements, and is not, live Supabase evidence. Needs @electric-sql/pglite (MCY_PGLITE_MODULE_PATH).
const { test } = require('node:test');
const { assert, read, one, newDb, denied, hex } = require('./support/pglite-chain.cjs');
const mine = '20261108111116_content_foundation.sql';
const O = '99000000-0000-4000-8000-000000000001', T = '99000000-0000-4000-8000-000000000002', U = '99000000-0000-4000-8000-000000000003', S = '99000000-0000-4000-8000-000000000004';
const checks = Object.fromEntries(['accessibility', 'actualDurationChecked', 'audienceScope', 'contentAccuracy', 'expertiseConfirmed', 'rightsConfirmed', 'stopGuidance', 'vietnameseAudioReady'].map(k => [k, true]));
const lesson = { youtubeId: 'AAAAAAAAAAA', summary: 'Fictional lesson summary', durationLabel: '0:43', orientation: 'portrait' };
const asService = db => db.exec('set role service_role;');
const save = (db, actor, item, kind, title, payload, seq) => one(db, 'select public.mcy_content_save_version($1::uuid,$2,$3,$4,$5::jsonb,$6::int) as v', [actor, item, kind, title, JSON.stringify(payload), seq]).then(r => r.v);
const submit = (db, actor, item, seq) => one(db, 'select public.mcy_content_submit($1::uuid,$2,$3::int) as v', [actor, item, seq]).then(r => r.v);
const list = (db, actor) => one(db, 'select public.mcy_content_list($1::uuid) as v', [actor]).then(r => r.v);
const readV = (db, actor, item, seq = null) => one(db, 'select public.mcy_content_read_version($1::uuid,$2,$3::int) as v', [actor, item, seq]).then(r => r.v);
const reviewItem = (db, actor, item, seq, revision, decision = 'approved') => one(db, `select public.mcy_content_review_item($1::uuid,$2,$3::int,$4::int,$5,'Fictional qualification text','Fictional review basis text','Fictional rights basis text',$6::jsonb) as v`, [actor, item, seq, revision, decision, JSON.stringify(checks)]).then(r => r.v);
const importItem = (db, actor, item, kind, title, payload, hash = null) => one(db, 'select public.mcy_content_import($1::uuid,$2,$3,$4,$5::jsonb,$6) as v', [actor, item, kind, title, JSON.stringify(payload), hash]).then(r => r.v);

async function fixture() {
  const db = await newDb();
  await db.exec(read(mine));
  for (const id of [O, T, U, S]) await db.query(`insert into auth.users(id,email,email_confirmed_at) values($1,$2,now())`, [id, `fictional-${id.slice(-1)}@example.test`]);
  await db.query(`insert into private.role_assignments(user_id,role,scope_type,reason) values($1,'owner','global','Fictional fixture'),($2,'teacher','global','Fictional fixture'),($3,'teacher','global','Fictional fixture')`, [O, T, U]);
  await db.query(`insert into public.teachers(user_id,public_name,active) values($1,'Fictional teacher T',true),($2,'Fictional teacher U',true)`, [T, U]);
  return db;
}

test('a teacher authors video lessons as immutable versions; ownership, kinds and conflicts are enforced', async () => {
  const db = await fixture();
  try {
    await asService(db);
    const first = await save(db, T, null, 'video_lesson', 'Fictional lesson', lesson, 0);
    assert.match(first.item_id, /^video-[a-f0-9]{16}$/);
    assert.deepEqual([first.seq, first.status, first.unchanged, first.content_hash.length], [1, 'draft', false, 64]);
    // The same content again is not a new version; a change is.
    assert.equal((await save(db, T, first.item_id, 'video_lesson', 'Fictional lesson', lesson, 1)).unchanged, true);
    const second = await save(db, T, first.item_id, 'video_lesson', 'Fictional lesson', { ...lesson, summary: 'Changed summary' }, 1);
    assert.deepEqual([second.seq, second.unchanged], [2, false]);
    assert.notEqual(second.content_hash, first.content_hash);
    // A title change alone is a new version too (the hash covers kind, title and payload).
    assert.notEqual((await save(db, T, first.item_id, 'video_lesson', 'Another title', { ...lesson, summary: 'Changed summary' }, 2)).content_hash, second.content_hash);
    // Stale expected version, wrong kind, wrong actor, missing item, bad input
    await denied(() => save(db, T, first.item_id, 'video_lesson', 'x', lesson, 1), 'PT409');
    await denied(() => save(db, T, first.item_id, 'course_group', 'x', { lessonIds: [] }, 3), '42501');
    await denied(() => save(db, U, first.item_id, 'video_lesson', 'x', lesson, 3), '42501');
    await denied(() => save(db, S, null, 'video_lesson', 'x', lesson, 0), '42501');
    await denied(() => save(db, T, 'video-missing', 'video_lesson', 'x', lesson, 0), '22023');
    await denied(() => save(db, T, null, 'video_lesson', 'x', lesson, 1), '22023');
    await denied(() => save(db, T, null, 'video_lesson', '  ', lesson, 0), '22023');
    await denied(() => save(db, T, null, 'video_lesson', 'x', [], 0), '22023');
    await denied(() => save(db, T, null, 'video_lesson', 'x', { big: 'x'.repeat(25000) }, 0), '22023');
    await denied(() => save(db, T, null, 'reading_unit', 'x', lesson, 0), '42501');
    await denied(() => save(db, T, null, 'course_group', 'x', { lessonIds: [] }, 0), '42501');
    await denied(() => save(db, T, null, 'bogus', 'x', lesson, 0), '22023');
    // The Owner does not edit a teacher's item
    await denied(() => save(db, O, first.item_id, 'video_lesson', 'x', lesson, 3), '42501');
  } finally { await db.close(); }
});

test('visibility: the Owner sees everything with author labels; a teacher sees only their own', async () => {
  const db = await fixture();
  try {
    await asService(db);
    const a = await save(db, T, null, 'video_lesson', 'Lesson of T', lesson, 0);
    const b = await save(db, U, null, 'video_lesson', 'Lesson of U', lesson, 0);
    const g = await save(db, O, null, 'course_group', 'Group by MCY', { summary: 'Fictional group', lessonIds: [a.item_id] }, 0);
    assert.match(g.item_id, /^group-/);
    const owner = await list(db, O);
    assert.equal(owner.role, 'owner');
    assert.deepEqual(owner.items.map(i => i.item_id).sort(), [a.item_id, b.item_id, g.item_id].sort());
    assert.deepEqual(owner.items.find(i => i.item_id === a.item_id).author_label, 'Fictional teacher T');
    assert.deepEqual([owner.items.find(i => i.item_id === g.item_id).author_kind, owner.items.find(i => i.item_id === g.item_id).author_label], ['mcy', null]);
    assert.deepEqual((await list(db, T)).items.map(i => i.item_id), [a.item_id]);
    assert.deepEqual((await list(db, U)).items.map(i => i.item_id), [b.item_id]);
    await denied(() => list(db, S), '42501');
    // Reading a version: own item only for a teacher, with the payload but without the reviewer's text
    const own = await readV(db, T, a.item_id);
    assert.deepEqual([own.title, own.payload.youtubeId, own.review.decision, 'qualification' in own.review], ['Lesson of T', 'AAAAAAAAAAA', 'pending', false]);
    await denied(() => readV(db, T, b.item_id), '42501');
    assert.equal((await readV(db, O, b.item_id)).author_label, 'Fictional teacher U');
    await denied(() => readV(db, O, 'video-missing'), '22023');
    // An author label disappears when the teacher profile is no longer active
    await db.exec('reset role;'); await db.query('update public.teachers set active=false where user_id=$1', [T]); await asService(db);
    assert.equal((await list(db, O)).items.find(i => i.item_id === a.item_id).author_label, null);
  } finally { await db.close(); }
});

test('review reuses the existing workflow: only the latest submitted version, only by the Owner, with the Owner\'s own declaration', async () => {
  const db = await fixture();
  try {
    await asService(db);
    const v1 = await save(db, T, null, 'video_lesson', 'Reviewable', lesson, 0);
    await denied(() => reviewItem(db, O, v1.item_id, 1, 0), '22023');                     // not submitted yet
    await denied(() => submit(db, U, v1.item_id, 1), '42501');
    await denied(() => submit(db, T, v1.item_id, 2), 'PT409');
    const sub = await submit(db, T, v1.item_id, 1);
    assert.deepEqual([sub.status, sub.unchanged, sub.candidate.scope, sub.candidate.version], ['submitted', false, 'video_lesson', v1.content_hash]);
    assert.equal((await submit(db, T, v1.item_id, 1)).unchanged, true);
    await denied(() => reviewItem(db, T, v1.item_id, 1, 0), '42501');                     // a teacher cannot decide
    await denied(() => reviewItem(db, O, v1.item_id, 2, 0), 'PT409');                     // stale version
    const receipt = await reviewItem(db, O, v1.item_id, 1, 0);
    assert.deepEqual([receipt.decision, receipt.scope, receipt.candidate_id, receipt.content_version, receipt.published], ['approved', 'video_lesson', v1.item_id, v1.content_hash, false]);
    let row = (await list(db, O)).items[0];
    assert.deepEqual([row.review.decision, row.approved_seq], ['approved', 1]);
    // The teacher sees the decision but not the reviewer's declarations
    assert.deepEqual([(await readV(db, T, v1.item_id)).review.decision, 'qualification' in (await readV(db, T, v1.item_id)).review], ['approved', false]);
    assert.equal((await readV(db, O, v1.item_id)).review.qualification, 'Fictional qualification text');
    // A new version starts pending again and keeps the earlier approval visible as approved_seq
    const v2 = await save(db, T, v1.item_id, 'video_lesson', 'Reviewable', { ...lesson, summary: 'Edited' }, 1);
    row = (await list(db, O)).items[0];
    assert.deepEqual([row.seq, row.status, row.review.decision, row.approved_seq], [2, 'draft', 'pending', 1]);
    await denied(() => reviewItem(db, O, v1.item_id, 1, 1), 'PT409');                     // the old version cannot be decided any more
    await submit(db, T, v1.item_id, 2);
    assert.equal((await reviewItem(db, O, v1.item_id, 2, 0, 'changes_requested')).decision, 'changes_requested');
    // The Owner may approve the Owner's own item, with the same declaration and audit trail
    const mine1 = await save(db, O, null, 'screen_text', 'Fictional text', { locale: 'vi-VN', entries: { greeting: 'Xin chào' } }, 0);
    await submit(db, O, mine1.item_id, 1);
    assert.equal((await reviewItem(db, O, mine1.item_id, 1, 0)).scope, 'screen_text');
    assert.equal(v2.seq, 2);
  } finally { await db.close(); }
});

test('import keeps registry hashes and approvals, is idempotent, owner-only and never touches teacher items', async () => {
  const db = await fixture();
  try {
    await asService(db);
    const unit = { steps: [{ title: 'Fictional step' }] };
    const trusted = hex('a');
    const first = await importItem(db, O, 'reading-fictional', 'reading_unit', 'Fictional reading', unit, trusted);
    assert.deepEqual([first.seq, first.content_hash, first.unchanged], [1, trusted, false]);
    assert.equal((await importItem(db, O, 'reading-fictional', 'reading_unit', 'Fictional reading', unit, trusted)).unchanged, true);
    const row = (await list(db, O)).items.find(i => i.item_id === 'reading-fictional');
    assert.deepEqual([row.status, row.origin, row.author_kind], ['submitted', 'imported', 'mcy']);
    // Existing approval at the registry hash carries over because the hash is the same
    await one(db, `select public.mcy_content_review_save($1::uuid,$2::jsonb,0,'approved','Fictional qualification text','Fictional review basis text','Fictional rights basis text',$3::jsonb) as v`,
      [O, JSON.stringify({ id: 'reading-fictional', scope: 'learning_reading', title: 'Fictional reading', version: trusted }), JSON.stringify({ ...checks, vietnameseAudioReady: false, actualDurationChecked: false })]);
    assert.deepEqual([(await list(db, O)).items.find(i => i.item_id === 'reading-fictional').review.decision, (await list(db, O)).items.find(i => i.item_id === 'reading-fictional').approved_seq], ['approved', 1]);
    // Without a trusted hash the hash is computed; a changed unit becomes version 2
    const computed = await importItem(db, O, 'video-gentle-01', 'video_lesson', 'Fictional import', lesson);
    assert.match(computed.content_hash, /^[a-f0-9]{64}$/);
    assert.equal((await importItem(db, O, 'video-gentle-01', 'video_lesson', 'Fictional import', lesson)).unchanged, true);
    assert.equal((await importItem(db, O, 'video-gentle-01', 'video_lesson', 'Fictional import', { ...lesson, summary: 'New' })).seq, 2);
    // Guards
    await denied(() => importItem(db, T, 'video-x', 'video_lesson', 'x', lesson), '42501');
    await denied(() => importItem(db, S, 'video-x', 'video_lesson', 'x', lesson), '42501');
    await denied(() => importItem(db, O, 'group-x', 'video_lesson', 'x', lesson), '22023');        // id prefix must match the kind
    await denied(() => importItem(db, O, 'video-y', 'video_lesson', 'x', lesson, 'not-a-hash'), '22023');
    await denied(() => importItem(db, O, 'video-gentle-01', 'course_group', 'x', { lessonIds: [] }), '22023');
    const teacherItem = await save(db, T, null, 'video_lesson', 'Teacher item', lesson, 0);
    await denied(() => importItem(db, O, teacherItem.item_id, 'video_lesson', 'Teacher item', { ...lesson, summary: 'Overwrite' }), '42501');
  } finally { await db.close(); }
});

test('saved versions are immutable at the table level, and daily limits apply', async () => {
  const db = await fixture();
  try {
    await asService(db);
    const v = await save(db, T, null, 'video_lesson', 'Immutable', lesson, 0);
    await db.exec('reset role;');
    // Even the table owner cannot rewrite or delete a saved version; only draft -> submitted is allowed
    await assert.rejects(() => db.query(`update private.mcy_content_versions set payload='{"youtubeId":"BBBBBBBBBBB"}'::jsonb where item_id=$1`, [v.item_id]), e => e.code === '42501');
    await assert.rejects(() => db.query(`update private.mcy_content_versions set title='Other' where item_id=$1`, [v.item_id]), e => e.code === '42501');
    await assert.rejects(() => db.query(`delete from private.mcy_content_versions where item_id=$1`, [v.item_id]), e => e.code === '42501');
    await db.query(`update private.mcy_content_versions set status='submitted',submitted_at=now() where item_id=$1`, [v.item_id]);
    await assert.rejects(() => db.query(`update private.mcy_content_versions set status='draft' where item_id=$1`, [v.item_id]), e => e.code === '42501');
    // 40 saves per actor per 24 hours
    await asService(db);
    for (let i = 0; i < 40; i++) await save(db, U, null, 'video_lesson', `Limit ${i}`, { ...lesson, summary: `s${i}` }, 0);
    await denied(() => save(db, U, null, 'video_lesson', 'Over the limit', lesson, 0), 'PT429');
  } finally { await db.close(); }
});

test('private tables and functions are closed to clients', async () => {
  const db = await fixture();
  try {
    const fns = ['mcy_content_save_version(uuid,text,text,text,jsonb,integer)', 'mcy_content_submit(uuid,text,integer)', 'mcy_content_list(uuid)',
      'mcy_content_read_version(uuid,text,integer)', 'mcy_content_review_item(uuid,text,integer,integer,text,text,text,text,jsonb)', 'mcy_content_import(uuid,text,text,text,jsonb,text)'];
    for (const fn of fns) {
      for (const role of ['anon', 'authenticated']) assert.equal((await one(db, `select has_function_privilege($1,$2,'execute') as ok`, [role, `public.${fn}`])).ok, false, `${role} ${fn}`);
      assert.equal((await one(db, `select has_function_privilege('service_role',$1,'execute') as ok`, [`public.${fn}`])).ok, true, `service_role ${fn}`);
      assert.equal((await one(db, `select p.prosecdef and p.proconfig::text like '%search_path=%' as ok from pg_proc p where p.oid=$1::regprocedure`, [`public.${fn}`])).ok, true, `${fn} is security definer with a pinned search_path`);
    }
    for (const table of ['mcy_content_items', 'mcy_content_versions', 'mcy_content_events']) {
      for (const role of ['anon', 'authenticated', 'service_role']) for (const privilege of ['select', 'insert', 'update', 'delete', 'truncate']) {
        assert.equal((await one(db, `select has_table_privilege($1,$2,$3) as ok`, [role, `private.${table}`, privilege])).ok, false, `${role} ${privilege} ${table}`);
      }
      assert.equal((await one(db, `select relrowsecurity as ok from pg_class where oid=$1::regclass`, [`private.${table}`])).ok, true, `${table} has RLS enabled`);
    }
    for (const role of ['anon', 'authenticated']) {
      await db.exec(`set role ${role};`);
      await denied(() => list(db, O), '42501');
      await db.exec('reset role;');
    }
  } finally { await db.close(); }
});

test('the migration refuses a drifted validator and keeps the older scopes working', async () => {
  const db = await newDb();
  try {
    await db.exec(`create or replace function private.mcy_content_review_validate(p_candidate jsonb) returns void language plpgsql set search_path='' as $$ begin null; end $$;`);
    await assert.rejects(() => db.exec(read(mine)), e => /changed|expected 1/.test(e.message));
  } finally { await db.close(); }
  const ok = await newDb();
  try {
    await ok.exec(read(mine));
    const scopes = (await ok.query(`select pg_get_constraintdef(oid) as d from pg_constraint where conrelid='private.mcy_content_review_states'::regclass and contype='c' and conname like '%scope%'`)).rows[0].d;
    for (const s of ['learning_intro', 'learning_reading', 'practice_session', 'video_lesson', 'course_group', 'screen_text']) assert.ok(scopes.includes(s), s);
  } finally { await ok.close(); }
});
