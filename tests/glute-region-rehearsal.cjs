// Replays the staging chain plus the Mông (glute) region candidate with fictional platform scaffolding.
// Supplements, and is not, live Supabase evidence. Needs @electric-sql/pglite (MCY_PGLITE_MODULE_PATH).
const { test } = require('node:test');
const { assert, read, one, newDb, identity, consent, saveCheckin, denied } = require('./support/pglite-chain.cjs');
const mine = '20261102173513_add_glute_body_region.sql';
const A = '77000000-0000-4000-8000-000000000001';
const obs = (code, state = 'discomfort') => ({ region_code: code, state, level: state === 'discomfort' ? 2 : null, note: null });
const writerFacts = db => db.query(`select p.proowner::regrole::text as owner, p.proacl::text as acl, p.proconfig::text as config, p.prosecdef from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='private' and p.proname='save_my_checkin_expanded'`).then(r => r.rows);
const writerBody = db => one(db, `select pg_get_functiondef(p.oid) as body from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='private' and p.proname='save_my_checkin_expanded'`).then(r => r.body);
const constraintText = (db, table) => one(db, `select pg_get_constraintdef(c.oid) as def from pg_constraint c where c.conrelid=$1::regclass and c.conname=$2`, [`public.${table}`, `${table}_region_code_check`]).then(r => r.def);
const setupUser = async db => {
  await db.query(`insert into auth.users(id,email,email_confirmed_at) values($1,'fictional-glute@example.test',now())`, [A]);
  await identity(db, A);
  for (const purpose of ['terms', 'privacy', 'wellbeing_data']) await consent(db, purpose);
  await db.exec('reset role;');
};

test('glute regions are accepted after the migration; existing regions, owner, ACL and search_path are unchanged', async () => {
  const db = await newDb();
  try {
    await setupUser(db);
    const before = await writerFacts(db);
    await identity(db, A);
    await denied(() => saveCheckin(db, A, 'before-glute', [obs('glute_left')]), '22023');
    await db.exec('reset role;');
    assert.doesNotMatch(await constraintText(db, 'checkin_observations'), /glute/);

    await db.exec(read(mine));
    assert.deepEqual(await writerFacts(db), before, 'owner, ACL, search_path and security mode are preserved');
    for (const table of ['checkin_observations', 'reflection_observations']) {
      const def = await constraintText(db, table);
      for (const code of ['glute_left', 'glute_right', 'glute_unspecified', 'lower_back', 'foot_unspecified', 'neck']) assert.match(def, new RegExp(`'${code}'`), `${table} keeps ${code}`);
    }
    await identity(db, A);
    assert.ok((await saveCheckin(db, A, 'both-sides', [obs('glute_left'), obs('glute_right', 'no_discomfort'), obs('neck'), obs('knee_left')])).checkin_id);
    assert.ok((await saveCheckin(db, A, 'unspecified', [obs('glute_unspecified', 'uncertain')])).checkin_id);
    // Same side rules as every paired region: an unspecified entry cannot sit beside a left or right entry.
    await denied(() => saveCheckin(db, A, 'clash', [obs('glute_left'), obs('glute_unspecified')]), '22023');
    await denied(() => saveCheckin(db, A, 'dup', [obs('glute_left'), obs('glute_left')]), '22023');
    await denied(() => saveCheckin(db, A, 'bogus', [obs('glute_middle')]), '22023');
    await db.exec('reset role;');
    assert.deepEqual((await db.query(`select region_code from public.checkin_observations where region_code like 'glute%' order by region_code`)).rows.map(r => r.region_code), ['glute_left', 'glute_right', 'glute_unspecified']);
    await assert.rejects(() => db.query(`insert into public.checkin_observations(checkin_id,user_id,region_code,state) select id,user_id,'glute_up','uncertain' from public.checkins limit 1`), error => error.code === '23514');
  } finally { await db.close(); }
});

test('running the migration twice is a no-op for the writer', async () => {
  const db = await newDb();
  try {
    await db.exec(read(mine));
    const once = await writerBody(db);
    await db.exec(read(mine));
    assert.equal(await writerBody(db), once);
    assert.equal(once.split("'glute_left'").length - 1, 1, 'exactly one glute allow-list copy');
  } finally { await db.close(); }
});

test('the migration refuses a drifted or missing writer and leaves the constraints untouched', async () => {
  const db = await newDb();
  try {
    const body = await writerBody(db);
    const old = "'foot_left', 'foot_right', 'foot_unspecified'";
    assert.equal(body.split(old).length - 1, 1, 'staging chain has exactly one allow-list copy');
    await db.exec(body.replace(old, `${old}, ${old}`));
    await assert.rejects(() => db.exec(read(mine)), /changed \(2 allow-list copies found, expected 1\)/);
    assert.doesNotMatch(await constraintText(db, 'checkin_observations'), /glute/, 'the failed migration rolled back');
    await db.exec('alter function private.save_my_checkin_expanded(uuid,date,text,smallint,text,text,jsonb,text) rename to saved_elsewhere').catch(async () => {
      const signature = (await one(db, `select p.oid::regprocedure::text as sig from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='private' and p.proname='save_my_checkin_expanded'`)).sig;
      await db.exec(`alter function ${signature} rename to saved_elsewhere`);
    });
    await assert.rejects(() => db.exec(read(mine)), /save_my_checkin_expanded is missing/);
  } finally { await db.close(); }
});
