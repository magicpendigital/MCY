// Replays the staging chain plus the reading-publication candidate with fictional platform scaffolding.
// Supplements, and is not, live Supabase evidence. Needs @electric-sql/pglite (MCY_PGLITE_MODULE_PATH).
const { test } = require('node:test');
const { assert, read, one, newDb, denied, hex } = require('./support/pglite-chain.cjs');
const mine = '20261102173348_reading_publication.sql';
const O = '88000000-0000-4000-8000-000000000001', T = '88000000-0000-4000-8000-000000000002', S = '88000000-0000-4000-8000-000000000003';
const unitA = { id: 'reading-alpha', scope: 'learning_reading', title: 'Fictional reading A', version: hex('a') };
const unitB = { id: 'reading-beta', scope: 'learning_reading', title: 'Fictional reading B', version: hex('b') };
const intro = { id: 'preparation-draft', scope: 'learning_intro', title: 'Fictional intro', version: hex('c') };
const checks = Object.fromEntries(['accessibility', 'actualDurationChecked', 'audienceScope', 'contentAccuracy', 'expertiseConfirmed', 'rightsConfirmed', 'stopGuidance', 'vietnameseAudioReady'].map(k => [k, true]));
const readingChecks = { ...checks, vietnameseAudioReady: false, actualDurationChecked: false };
const asService = db => db.exec('set role service_role;');
const review = (db, actor, meta, decision, revision) => one(db, `select public.mcy_content_review_save($1::uuid,$2::jsonb,$3::int,$4,'Fictional qualification text','Fictional review basis text','Fictional rights basis text',$5::jsonb) as v`, [actor, JSON.stringify(meta), revision, decision, JSON.stringify(readingChecks)]).then(r => r.v);
const snapshot = (db, actor) => one(db, 'select public.mcy_reading_publication_snapshot($1::uuid) as v', [actor]).then(r => r.v);
const setUnit = (db, actor, meta, visible, mode = 'inherit') => one(db, 'select public.mcy_reading_publication_set($1::uuid,$2::jsonb,$3::boolean,$4) as v', [actor, JSON.stringify(meta), visible, mode]).then(r => r.v);
const setDefault = (db, actor, allowed) => one(db, 'select public.mcy_reading_publication_set_default($1::uuid,$2::boolean) as v', [actor, allowed]).then(r => r.v);
// Counted as the owner of the tables: service_role itself has no table privileges on purpose.
const eventCount = async db => { await db.exec('reset role;'); const n = (await one(db, 'select count(*)::int as n from private.mcy_reading_publication_events')).n; await asService(db); return n; };

async function fixture() {
  const db = await newDb();
  await db.exec(read(mine));
  for (const id of [O, T, S]) await db.query(`insert into auth.users(id,email,email_confirmed_at) values($1,$2,now())`, [id, `fictional-${id.slice(-1)}@example.test`]);
  await db.query(`insert into private.role_assignments(user_id,role,scope_type,reason) values($1,'owner','global','Fictional fixture'),($2,'teacher','global','Fictional fixture')`, [O, T]);
  await db.query(`insert into public.teachers(user_id,public_name,active) values($1,'Fictional teacher',true)`, [T]);
  return db;
}

test('switches follow approval, reviews, roles and quotas; nothing is visible by default', async () => {
  const db = await fixture();
  try {
    // Defaults and access
    await asService(db);
    const first = await snapshot(db, O);
    assert.deepEqual([first.role, first.default_text_only_allowed, first.approved, first.rows], ['owner', false, [], []]);
    await denied(() => snapshot(db, S), '42501');
    await db.exec('reset role;');
    for (const role of ['anon', 'authenticated']) {
      await db.exec(`set role ${role};`);
      await denied(() => snapshot(db, O), '42501');
      await db.exec('reset role;');
    }

    // Without a review state, then with an unapproved one, a unit cannot be switched on
    await asService(db);
    await denied(() => setUnit(db, O, unitA, true), '22023');
    await review(db, O, unitA, 'changes_requested', 0);
    await denied(() => setUnit(db, O, unitA, true), '22023');
    assert.equal((await setUnit(db, O, unitA, false)).visible, false, 'switching off is always allowed');

    // Approved: it can be switched on, and the snapshot shows approval and the switch
    await review(db, O, unitA, 'approved', 1);
    const on = await setUnit(db, O, unitA, true);
    assert.deepEqual([on.visible, on.text_only_allowed, on.unchanged], [true, null, false]);
    let snap = await snapshot(db, O);
    assert.deepEqual(snap.approved.map(a => a.candidate_id), ['reading-alpha']);
    assert.equal(snap.rows.length, 1);
    assert.ok(Date.parse(snap.rows[0].updated_at) >= Date.parse(snap.approved[0].reviewed_at), 'switch set after the review');

    // Idempotent repeat records nothing; a real change records one event
    const events = await eventCount(db);
    assert.equal((await setUnit(db, O, unitA, true)).unchanged, true);
    assert.equal(await eventCount(db), events);
    assert.equal((await setUnit(db, O, unitA, true, 'allow')).text_only_allowed, true);
    assert.equal((await setUnit(db, O, unitA, true, 'require')).text_only_allowed, false);
    assert.equal((await setUnit(db, O, unitA, true, 'inherit')).text_only_allowed, null);
    assert.equal(await eventCount(db), events + 3);

    // Validation
    await denied(() => setUnit(db, O, unitA, true, 'always'), '22023');
    await denied(() => setUnit(db, O, unitA, null), '22023');
    await denied(() => setUnit(db, O, intro, true), '22023');
    await denied(() => setUnit(db, O, { ...unitA, title: 'Different title' }, true), '22023');
    await denied(() => setUnit(db, O, { ...unitA, version: hex('f') }, true), '22023');

    // A later review is newer than the switch, so a consumer can hide the unit until it is switched on again
    await review(db, O, unitA, 'approved', 2);
    snap = await snapshot(db, O);
    assert.ok(Date.parse(snap.rows[0].updated_at) < Date.parse(snap.approved[0].reviewed_at), 'new review is newer than the switch');
    await setUnit(db, O, unitA, true);
    snap = await snapshot(db, O);
    assert.ok(Date.parse(snap.rows[0].updated_at) >= Date.parse(snap.approved[0].reviewed_at));

    // Default for text-only units: Owner only, idempotent, validated
    assert.deepEqual([(await setDefault(db, O, true)).unchanged, (await setDefault(db, O, true)).unchanged], [false, true]);
    assert.equal((await snapshot(db, O)).default_text_only_allowed, true);
    await denied(() => setDefault(db, T, false), '42501');
    await denied(() => setDefault(db, S, false), '42501');
    await denied(() => setDefault(db, O, null), '22023');
    await setDefault(db, O, false);

    // Daily cap of 200 recorded changes per actor
    await db.exec('reset role;');
    await db.query(`insert into private.mcy_reading_publication_events(actor_id,kind,payload) select $1,'unit','{"fixture":true}'::jsonb from generate_series(1,200)`, [O]);
    await asService(db);
    await denied(() => setUnit(db, O, unitA, false), 'PT429');
    await denied(() => setDefault(db, O, true), 'PT429');
    await db.exec('reset role;');
  } finally { await db.close(); }
});

test('an assigned teacher can switch only the unit assigned to them', async () => {
  const db = await fixture();
  try {
    await asService(db);
    await review(db, O, unitA, 'approved', 0);
    await review(db, O, unitB, 'changes_requested', 0);
    await one(db, `select public.mcy_content_reviewer_assign($1::uuid,$2::jsonb,$3::int,$4::uuid,true,7) as v`, [O, JSON.stringify(unitB), 1, T]);
    await denied(() => setUnit(db, T, unitB, true), '22023');
    await review(db, T, unitB, 'approved', 2);
    assert.equal((await setUnit(db, T, unitB, true)).visible, true);
    await denied(() => setUnit(db, T, unitA, true), '42501');
    await denied(() => setUnit(db, S, unitB, true), '42501');
    assert.equal((await snapshot(db, T)).role, 'teacher');
    await one(db, `select public.mcy_content_reviewer_assign($1::uuid,$2::jsonb,$3::int,$4::uuid,false,7) as v`, [O, JSON.stringify(unitB), 3, T]);
    await denied(() => setUnit(db, T, unitB, false), '42501');
  } finally { await db.close(); }
});

test('private tables and functions are closed to clients; the public bucket is exactly as intended', async () => {
  const db = await fixture();
  try {
    const fns = ['mcy_reading_publication_snapshot(uuid)', 'mcy_reading_publication_set(uuid,jsonb,boolean,text)', 'mcy_reading_publication_set_default(uuid,boolean)'];
    for (const fn of fns) {
      for (const role of ['anon', 'authenticated']) assert.equal((await one(db, `select has_function_privilege($1,$2,'execute') as ok`, [role, `public.${fn}`])).ok, false, `${role} ${fn}`);
      assert.equal((await one(db, `select has_function_privilege('service_role',$1,'execute') as ok`, [`public.${fn}`])).ok, true, `service_role ${fn}`);
      assert.equal((await one(db, `select p.prosecdef and p.proconfig::text like '%search_path=%' as ok from pg_proc p where p.oid=$1::regprocedure`, [`public.${fn}`])).ok, true, `${fn} is security definer with a pinned search_path`);
    }
    for (const table of ['mcy_reading_publication', 'mcy_reading_publication_defaults', 'mcy_reading_publication_events']) {
      for (const role of ['anon', 'authenticated', 'service_role']) for (const privilege of ['select', 'insert', 'update', 'delete', 'truncate']) {
        assert.equal((await one(db, `select has_table_privilege($1,$2,$3) as ok`, [role, `private.${table}`, privilege])).ok, false, `${role} ${privilege} ${table}`);
      }
      assert.equal((await one(db, `select relrowsecurity as ok from pg_class where oid=$1::regclass`, [`private.${table}`])).ok, true, `${table} has RLS enabled`);
    }
    const bucket = await one(db, `select public, file_size_limit, allowed_mime_types from storage.buckets where id='reading-published'`);
    assert.deepEqual([bucket.public, Number(bucket.file_size_limit), [...bucket.allowed_mime_types].sort()], [true, 1048576, ['application/json', 'image/webp']]);
    assert.equal((await one(db, `select public from storage.buckets where id='reading-preview'`)).public, false, 'the Preview bucket stays private');
    await db.exec(`update storage.buckets set public=false where id='reading-published'`);
    const guard = read(mine).slice(read(mine).lastIndexOf('do $$'));
    await assert.rejects(() => db.exec(guard), error => error.code === '42501' && /must be a public bucket/.test(error.message));
  } finally { await db.close(); }
});
