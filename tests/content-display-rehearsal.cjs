// Replays the staging chain plus the content foundation and display candidates with fictional platform scaffolding.
// Supplements, and is not, live Supabase evidence. Needs @electric-sql/pglite (MCY_PGLITE_MODULE_PATH).
const { test } = require('node:test');
const { assert, read, one, newDb, denied } = require('./support/pglite-chain.cjs');
const foundation = '20261108111116_content_foundation.sql', mine = '20261108130000_content_display.sql';
const O = '77000000-0000-4000-8000-000000000001', T = '77000000-0000-4000-8000-000000000002', S = '77000000-0000-4000-8000-000000000003';
const checks = Object.fromEntries(['accessibility', 'actualDurationChecked', 'audienceScope', 'contentAccuracy', 'expertiseConfirmed', 'rightsConfirmed', 'stopGuidance', 'vietnameseAudioReady'].map(k => [k, true]));
const lesson = { youtubeId: 'AAAAAAAAAAA', summary: 'Fictional lesson summary', durationLabel: '0:43', orientation: 'portrait' };
const asService = db => db.exec('set role service_role;');
const q = (db, sql, args) => one(db, sql, args).then(r => r.v);
const save = (db, actor, item, kind, title, payload, seq) => q(db, 'select public.mcy_content_save_version($1::uuid,$2,$3,$4,$5::jsonb,$6::int) as v', [actor, item, kind, title, JSON.stringify(payload), seq]);
const submit = (db, actor, item, seq) => q(db, 'select public.mcy_content_submit($1::uuid,$2,$3::int) as v', [actor, item, seq]);
const review = (db, actor, item, seq, revision, decision = 'approved') => q(db, `select public.mcy_content_review_item($1::uuid,$2,$3::int,$4::int,$5,'Fictional qualification text','Fictional review basis text','Fictional rights basis text',$6::jsonb) as v`, [actor, item, seq, revision, decision, JSON.stringify(checks)]);
const readCfg = (db, actor) => q(db, 'select public.mcy_display_read($1::uuid) as v', [actor]);
const saveCfg = (db, actor, version, config) => q(db, 'select public.mcy_display_save($1::uuid,$2::int,$3::jsonb) as v', [actor, version, JSON.stringify(config)]);
const setVis = (db, actor, item, seq, visible) => q(db, 'select public.mcy_content_set_visibility($1::uuid,$2,$3::int,$4::boolean) as v', [actor, item, seq, visible]);
const visList = (db, actor) => q(db, 'select public.mcy_content_visibility_list($1::uuid) as v', [actor]);

async function fixture() {
  const db = await newDb();
  await db.exec(read(foundation)); await db.exec(read(mine));
  for (const id of [O, T, S]) await db.query(`insert into auth.users(id,email,email_confirmed_at) values($1,$2,now())`, [id, `fictional-${id.slice(-1)}@example.test`]);
  await db.query(`insert into private.role_assignments(user_id,role,scope_type,reason) values($1,'owner','global','Fictional fixture'),($2,'teacher','global','Fictional fixture')`, [O, T]);
  await db.query(`insert into public.teachers(user_id,public_name,active) values($1,'Fictional teacher',true)`, [T]);
  return db;
}
// A submitted, approved MCY video lesson (the Owner's own content).
async function approvedLesson(db, title = 'Fictional approved lesson') {
  const a = await save(db, O, null, 'video_lesson', title, lesson, 0);
  await submit(db, O, a.item_id, 1);
  await review(db, O, a.item_id, 1, 0);
  return a;
}

test('the display configuration starts as today\'s app, is Owner-only and is validated strictly', async () => {
  const db = await fixture();
  try {
    await asService(db);
    const first = await readCfg(db, O);
    assert.deepEqual([first.version_no, first.config.discover_order, first.config.editors_choice, first.log], [1, ['editors_choice', 'video_groups', 'quick_find', 'reading'], [], []]);
    assert.deepEqual(first.config.policies, { show_teacher_names: true, ai_image_label: true });
    for (const who of [T, S]) await denied(() => readCfg(db, who), '42501');
    await denied(() => saveCfg(db, T, 1, first.config), '42501');
    const bad = [
      { ...first.config, extra: 1 }, { ...first.config, discover_order: ['reading', 'video_groups', 'quick_find', 'editors_choice'] },   // reading above the video groups
      { ...first.config, discover_order: ['editors_choice', 'video_groups', 'reading'] }, { ...first.config, discover_order: ['editors_choice', 'video_groups', 'reading', 'reading'] },
      { ...first.config, policies: { show_teacher_names: 'yes', ai_image_label: true } }, { ...first.config, policies: { show_teacher_names: true } },
      { ...first.config, editors_choice: ['a', 'b', 'c', 'd'] }, { ...first.config, editors_choice: ['dup', 'dup'] }, { ...first.config, editors_choice: ['Bad Id'] },
      { ...first.config, review_rules: { video_lesson: { owner_self_review: true } } }, { ...first.config, review_rules: { ...first.config.review_rules, video_lesson: { owner_self_review: 'no' } } },
    ];
    for (const config of bad) await denied(() => saveCfg(db, O, 1, config), '22023');
    await denied(() => saveCfg(db, O, 0, first.config), '22023');
    // The video-first rule still allows moving the other sections around
    const moved = { ...first.config, discover_order: ['video_groups', 'editors_choice', 'quick_find', 'reading'] };
    const r2 = await saveCfg(db, O, 1, moved);
    assert.deepEqual([r2.version_no, r2.unchanged], [2, false]);
    assert.equal((await saveCfg(db, O, 2, moved)).unchanged, true);
    await denied(() => saveCfg(db, O, 1, first.config), 'PT409');                      // stale version
    const log = (await readCfg(db, O)).log;
    assert.equal(log.length, 1);
    assert.deepEqual([log[0].kind, log[0].before.discover_order[0], log[0].after.discover_order[0]], ['config', 'editors_choice', 'video_groups']);
  } finally { await db.close(); }
});

test('visibility needs a submitted, approved version; the switch only counts after the latest review; one version is shown per item', async () => {
  const db = await fixture();
  try {
    await asService(db);
    const a = await save(db, O, null, 'video_lesson', 'Lesson', lesson, 0);
    await denied(() => setVis(db, O, a.item_id, 1, true), '22023');                    // not submitted
    await submit(db, O, a.item_id, 1);
    await denied(() => setVis(db, O, a.item_id, 1, true), '22023');                    // submitted but not approved
    assert.equal((await setVis(db, O, a.item_id, 1, false)).unchanged, false);          // switching off is always allowed (records the row)
    await review(db, O, a.item_id, 1, 0);
    await denied(() => setVis(db, T, a.item_id, 1, true), '42501');
    await denied(() => setVis(db, S, a.item_id, 1, true), '42501');
    await denied(() => setVis(db, O, 'video-missing', 1, true), '22023');
    await denied(() => setVis(db, O, a.item_id, 1, null), '22023');
    const on = await setVis(db, O, a.item_id, 1, true);
    assert.deepEqual([on.item_id, on.seq, on.visible, on.unchanged], [a.item_id, 1, true, false]);
    assert.equal((await setVis(db, O, a.item_id, 1, true)).unchanged, true);
    let rows = (await visList(db, O)).rows;
    assert.deepEqual(rows.map(r => [r.item_id, r.seq, r.visible, r.effective]), [[a.item_id, 1, true, true]]);
    // A newer review of the same version hides it until it is switched on again
    await review(db, O, a.item_id, 1, 1);
    rows = (await visList(db, O)).rows;
    assert.deepEqual([rows[0].visible, rows[0].effective], [true, false]);
    assert.equal((await setVis(db, O, a.item_id, 1, true)).unchanged, false);
    assert.equal((await visList(db, O)).rows[0].effective, true);
    // A new version replaces the old one as the shown version once it is approved and switched on
    await save(db, O, a.item_id, 'video_lesson', 'Lesson', { ...lesson, summary: 'Edited' }, 1);
    await submit(db, O, a.item_id, 2);
    await review(db, O, a.item_id, 2, 0);
    await setVis(db, O, a.item_id, 2, true);
    rows = (await visList(db, O)).rows;
    assert.deepEqual(rows.map(r => [r.seq, r.visible, r.effective]), [[2, true, true]]);
    const log = (await readCfg(db, O)).log.filter(e => e.kind === 'visibility');
    assert.ok(log.length >= 4 && log.every(e => /^video-/.test(e.subject)));
  } finally { await db.close(); }
});

test('Editor\'s choice only holds content that is shown, and hiding content removes it from the slots', async () => {
  const db = await fixture();
  try {
    await asService(db);
    const a = await approvedLesson(db), b = await approvedLesson(db, 'Second approved lesson');
    const cfg = (await readCfg(db, O)).config;
    await denied(() => saveCfg(db, O, 1, { ...cfg, editors_choice: [a.item_id] }), '22023');      // approved but not switched on
    await setVis(db, O, a.item_id, 1, true); await setVis(db, O, b.item_id, 1, true);
    assert.equal((await saveCfg(db, O, 1, { ...cfg, editors_choice: [a.item_id, b.item_id] })).version_no, 2);
    await denied(() => saveCfg(db, O, 2, { ...cfg, editors_choice: ['video-nonexistent'] }), '22023');
    await setVis(db, O, a.item_id, 1, false);
    const after = await readCfg(db, O);
    assert.deepEqual([after.config.editors_choice, after.version_no], [[b.item_id], 3]);
  } finally { await db.close(); }
});

test('the self-review rule is a configuration: when off, the Owner cannot decide own content of that kind, teacher content is unaffected', async () => {
  const db = await fixture();
  try {
    await asService(db);
    const own = await save(db, O, null, 'video_lesson', 'Own lesson', lesson, 0);
    await submit(db, O, own.item_id, 1);
    const theirs = await save(db, T, null, 'video_lesson', 'Teacher lesson', lesson, 0);
    await submit(db, T, theirs.item_id, 1);
    const cfg = (await readCfg(db, O)).config;
    await saveCfg(db, O, 1, { ...cfg, review_rules: { ...cfg.review_rules, video_lesson: { owner_self_review: false } } });
    await denied(() => review(db, O, own.item_id, 1, 0), '42501');
    assert.equal((await review(db, O, theirs.item_id, 1, 0)).decision, 'approved');
    // Other kinds keep their own setting
    const group = await save(db, O, null, 'course_group', 'Group', { summary: 'Fictional group', lessonIds: [theirs.item_id] }, 0);
    await submit(db, O, group.item_id, 1);
    assert.equal((await review(db, O, group.item_id, 1, 0)).decision, 'approved');
    await saveCfg(db, O, 2, cfg);
    assert.equal((await review(db, O, own.item_id, 1, 0)).decision, 'approved');
  } finally { await db.close(); }
});

test('the new tables and functions are closed to clients', async () => {
  const db = await fixture();
  try {
    const fns = ['mcy_display_read(uuid)', 'mcy_display_save(uuid,integer,jsonb)', 'mcy_content_set_visibility(uuid,text,integer,boolean)', 'mcy_content_visibility_list(uuid)'];
    for (const fn of fns) {
      for (const role of ['anon', 'authenticated']) assert.equal((await one(db, `select has_function_privilege($1,$2,'execute') as ok`, [role, `public.${fn}`])).ok, false, `${role} ${fn}`);
      assert.equal((await one(db, `select has_function_privilege('service_role',$1,'execute') as ok`, [`public.${fn}`])).ok, true, `service_role ${fn}`);
      assert.equal((await one(db, `select p.prosecdef and p.proconfig::text like '%search_path=%' as ok from pg_proc p where p.oid=$1::regprocedure`, [`public.${fn}`])).ok, true, `${fn} secdef + pinned search_path`);
    }
    for (const table of ['mcy_content_visibility', 'mcy_display_config', 'mcy_display_events']) {
      for (const role of ['anon', 'authenticated', 'service_role']) for (const privilege of ['select', 'insert', 'update', 'delete', 'truncate']) {
        assert.equal((await one(db, `select has_table_privilege($1,$2,$3) as ok`, [role, `private.${table}`, privilege])).ok, false, `${role} ${privilege} ${table}`);
      }
      assert.equal((await one(db, `select relrowsecurity as ok from pg_class where oid=$1::regclass`, [`private.${table}`])).ok, true, `${table} RLS`);
    }
    for (const role of ['anon', 'authenticated']) { await db.exec(`set role ${role};`); await denied(() => readCfg(db, O), '42501'); await db.exec('reset role;'); }
  } finally { await db.close(); }
});

test('the migration refuses a drifted review function', async () => {
  const db = await newDb();
  try {
    await db.exec(read(foundation));
    await db.exec(`create or replace function public.mcy_content_review_item(p_actor_id uuid,p_item_id text,p_seq integer,p_expected_revision integer,p_decision text,p_qualification text,p_review_basis text,p_rights_basis text,p_checklist jsonb) returns jsonb language plpgsql security definer set search_path='' as $$ begin return '{}'::jsonb; end $$;`);
    await assert.rejects(() => db.exec(read(mine)), e => /changed|expected 1/.test(e.message));
  } finally { await db.close(); }
});
