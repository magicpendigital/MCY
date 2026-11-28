// Replays the migration chain applied on mcy-staging (through 20261110175347) and then
// 20261127031613_teacher_control_plane_rpcs.sql LAST, exactly as it landed on staging on 2026-11-27 (remote version
// 20261127031613; the source was written as 20261002204228 and renamed to the remote version), with fictional platform scaffolding.
// Supplements, and is not, live Supabase evidence. Needs @electric-sql/pglite (MCY_PGLITE_MODULE_PATH).
const { test } = require('node:test');
const { assert, fs, dir, read, one, newDb, denied, hex, chain } = require('./support/pglite-chain.cjs');

// Applied on staging after the shared chain (delete_my_account landed 2026-10-24, before the reading scope; it only
// defines its own function, so replaying it after the shared chain is equivalent). 20261003031137, 20261005004000 and
// 20261009181735 are local-only and are NOT on staging, so they are not replayed.
const later = ['20261023171210_delete_my_account.sql', '20261102173348_reading_publication.sql', '20261102173513_add_glute_body_region.sql',
  '20261108111116_content_foundation.sql', '20261108162119_content_display.sql', '20261109022545_content_publication.sql',
  '20261110175347_content_snapshot_screens.sql'];
const candidate = '20261127031613_teacher_control_plane_rpcs.sql';
// Follow-up (Owner request 2026-11-27), on staging: replayed after the teacher candidate in its own fixture below.
const followUp = '20261127072022_teacher_invite_account_kind.sql'; // applied to staging 2026-11-27 as remote version 20261127072022 (written as 20261127120000)
const followUpRpcs = ['mcy_teacher_invite_account_kind', 'mcy_teacher_invite_mark_existing_account_emailed'];
const notOnStaging = ['20261003031137_limit_my_consent_events.sql', '20261005004000_private_teacher_collaboration.sql', '20261009181735_ai_read_admission_state.sql'];
// S1 (teacher free courses) landed on staging 2026-11-28 as remote version 20261128030007 (written as 20261127150000);
// tests/teacher-course-group-rehearsal.cjs replays it after this chain.
const laterCandidates = ['20261128030007_teacher_course_groups.sql', '20261128043923_teacher_content_tracking.sql', '20261128053426_content_review_shares.sql']; // W1/T1 tracking: local candidate, replayed by tests/teacher-tracking-rehearsal.cjs
const rpcs = ['mcy_teacher_prepare_invite', 'mcy_teacher_invite_mark_delivered', 'mcy_teacher_invite_delivery_failed',
  'mcy_teacher_invite_mark_existing_account', 'mcy_teacher_accept_own_invite', 'mcy_teacher_list_own_drafts',
  'mcy_teacher_read_own_draft', 'mcy_teacher_save_own_draft'];

const id = n => `77000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
const O = id(1), O2 = id(2), T = id(3), X = id(4), N = id(5), L = id(6), E = id(7);
const H = { O: hex('0'), O2: hex('1'), T: hex('a'), X: hex('b'), N: hex('c'), L: hex('d'), E: hex('e'), P: hex('f'), Q: hex('9'), R: hex('8') };
const NAME = 'Fictional Teacher Lan';

// Effective ACL/RLS/policy/security-definer state of every relation, function and schema the app uses.
const aclSnapshot = db => one(db, `select jsonb_object_agg(k, v) as v from (
  select 'rel:' || n.nspname || '.' || c.relname as k, coalesce(c.relacl::text, '') || '|rls=' || c.relrowsecurity as v
    from pg_class c join pg_namespace n on n.oid = c.relnamespace
    where n.nspname in ('public', 'private', 'storage', 'auth') and c.relkind in ('r', 'p', 'v', 'm', 'S')
  union all select 'fn:' || n.nspname || '.' || p.proname || '(' || pg_get_function_identity_arguments(p.oid) || ')', coalesce(p.proacl::text, '') || '|' || p.prosecdef || '|' || coalesce(array_to_string(p.proconfig, ','), '')
    from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname in ('public', 'private')
  union all select 'schema:' || nspname, coalesce(nspacl::text, '') from pg_namespace where nspname in ('public', 'private', 'auth', 'storage')
  union all select 'pol:' || schemaname || '.' || tablename || '.' || policyname,
    cmd || '|' || array_to_string(roles, ',') || '|' || coalesce(qual, '') || '|' || coalesce(with_check, '') from pg_policies
) s`).then(r => r.v);

async function fixture({ withFollowUp = false } = {}) {
  const db = await newDb();
  for (const f of later) await db.exec(read(f));
  let before = await aclSnapshot(db);
  // Supabase's default privileges grant new public functions to anon/authenticated; the candidate must revoke them itself.
  await db.exec('alter default privileges in schema public grant all on functions to anon, authenticated, service_role;');
  await db.exec(read(candidate));
  if (withFollowUp) { before = await aclSnapshot(db); await db.exec(read(followUp)); }
  const after = await aclSnapshot(db);
  for (const [u, email, confirmed] of [[O, 'owner'], [O2, 'owner2'], [T, 'teacher'], [X, 'stranger'], [N, 'unconfirmed', false], [L, 'learner'], [E, 'existing']]) {
    await db.query('insert into auth.users(id,email,email_confirmed_at) values($1,$2,$3)', [u, `fictional-${email}@example.test`, confirmed === false ? null : new Date()]);
  }
  await db.query(`insert into private.role_assignments(user_id,role,scope_type,reason) values($1,'owner','global','Fictional fixture'),($2,'owner','global','Fictional fixture')`, [O, O2]);
  for (const u of [T, X, N, L, E]) await db.query('insert into public.profiles(user_id,display_name) values($1,$2)', [u, NAME]);
  return { db, before, after };
}

const svc = async (db, sql, args = []) => { await db.exec('set role service_role;'); try { return (await db.query(sql, args)).rows[0].v; } finally { await db.exec('reset role;'); } };
const prepare = (db, actor, email, actorEmail, key, role = 'teacher', scope = 'global', hours = 72) =>
  svc(db, 'select public.mcy_teacher_prepare_invite($1::uuid,$2,$3,$4::uuid,$5,$6,$7::int) as v', [actor, email, actorEmail, key, role, scope, hours]);
const delivered = (db, actor, invite) => svc(db, 'select public.mcy_teacher_invite_mark_delivered($1::uuid,$2::uuid) as v', [actor, invite]);
const failed = (db, actor, invite) => svc(db, 'select public.mcy_teacher_invite_delivery_failed($1::uuid,$2::uuid) as v', [actor, invite]);
const existing = (db, actor, invite) => svc(db, 'select public.mcy_teacher_invite_mark_existing_account($1::uuid,$2::uuid) as v', [actor, invite]);
const accept = (db, actor, email, name = NAME) => svc(db, 'select public.mcy_teacher_accept_own_invite($1::uuid,$2,$3) as v', [actor, email, name]);
const listDrafts = (db, actor) => svc(db, 'select public.mcy_teacher_list_own_drafts($1::uuid) as v', [actor]);
const readDraft = (db, actor, session) => svc(db, 'select public.mcy_teacher_read_own_draft($1::uuid,$2::uuid) as v', [actor, session]);
const saveDraft = (db, actor, draft) => svc(db, 'select public.mcy_teacher_save_own_draft($1::uuid,$2::jsonb) as v', [actor, JSON.stringify(draft)]);
const reviewActor = (db, actor) => one(db, 'select private.mcy_content_review_actor($1::uuid) as v', [actor]).then(r => r.v);
const invite = (db, inviteId) => one(db, 'select * from private.workspace_invites where id=$1', [inviteId]);
const audit = (db, objectId) => db.query('select action, outcome, metadata from private.audit_events where object_id=$1 order by occurred_at, created_at', [objectId]).then(r => r.rows);
const key = n => `77000000-0000-4000-9000-${String(n).padStart(12, '0')}`;
const sentInvite = async (db, email, k) => { const r = await prepare(db, O, email, H.O, k); assert.equal(await delivered(db, O, r.invite_id), true); return r.invite_id; };
const draft = { locale: 'vi-VN', title: 'Fictional draft', duration_seconds: 60, props: [], positions: [], learning_focus: [],
  segments: [{ position: 1, start_ms: 0, end_ms: 30000, movement_name: 'Fictional movement' }] };

test('the chain under test is exactly what staging has, with the candidate replayed last', () => {
  const all = fs.readdirSync(dir).filter(n => /^\d{14}_.+\.sql$/.test(n)).sort();
  const staged = [...chain, ...later];
  assert.equal(staged.length, 31, 'staging listed 31 applied migrations through 20261110175347 before the candidate');
  assert.equal(candidate.slice(0, 14), '20261127031613', 'the candidate carries its remote staging version');
  assert.equal(new Set(staged).size, staged.length);
  assert.deepEqual([...staged, candidate, followUp, ...notOnStaging, ...laterCandidates].sort(), all, 'a new migration file appeared: decide whether staging has it and update this chain');
  assert.ok(staged.every(f => f.slice(0, 14) <= '20261110175347'));
});

test('the candidate applies on top of the staging chain and widens no table, schema, policy or older function privilege', async () => {
  const { db, before, after } = await fixture();
  try {
    const added = Object.keys(after).filter(k => !(k in before)).sort();
    assert.deepEqual(added.map(k => k.replace(/^fn:public\.(\w+)\(.*$/, '$1')).sort(), [...rpcs].sort(), 'only the 8 teacher RPCs are new objects');
    for (const k of Object.keys(before)) assert.equal(after[k], before[k], `${k} changed`);
    const fns = (await db.query(`select p.proname, p.prosecdef, p.proconfig, coalesce(p.proacl::text,'') acl, pg_get_userbyid(p.proowner) owner,
      has_function_privilege('anon', p.oid, 'execute') a, has_function_privilege('authenticated', p.oid, 'execute') u,
      has_function_privilege('service_role', p.oid, 'execute') s
      from pg_proc p where p.pronamespace='public'::regnamespace and p.proname like 'mcy_teacher_%' order by p.proname`)).rows;
    assert.deepEqual(fns.map(f => f.proname), [...rpcs].sort());
    for (const f of fns) {
      assert.equal(f.prosecdef, true, `${f.proname} security definer`);
      assert.deepEqual(f.proconfig, ['search_path=""'], `${f.proname} empty search_path`);
      assert.deepEqual([f.a, f.u, f.s], [false, false, true], `${f.proname} EXECUTE only for service_role`);
      assert.doesNotMatch(f.acl, /[{,]=[a-zA-Z*]*X/, `${f.proname} not executable by PUBLIC`);
    }
    for (const role of ['anon', 'authenticated']) {
      for (const priv of ['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'TRUNCATE', 'REFERENCES', 'TRIGGER']) {
        assert.equal((await one(db, 'select has_table_privilege($1,\'private.workspace_invites\',$2) v', [role, priv])).v, false, `${role} ${priv} workspace_invites`);
      }
      assert.equal((await one(db, 'select has_table_privilege($1,\'public.teachers\',\'INSERT,UPDATE,DELETE,TRUNCATE\') v', [role])).v, false, `${role} write teachers`);
    }
    // An ordinary signed-in user still cannot make themselves an active teacher or touch invitations directly.
    await db.exec(`set role authenticated; set request.jwt.claim.sub='${L}'; set request.jwt.claim.role='authenticated';`);
    try {
      await denied(() => db.query(`insert into public.teachers(user_id,public_name,active) values($1,'Self-made',true)`, [L]), '42501');
      await denied(() => db.query('update public.teachers set active=true where user_id=$1', [L]), '42501');
      await denied(() => db.query('select * from private.workspace_invites'), '42501');
      await denied(() => db.query('truncate private.workspace_invites'), '42501');
      await denied(() => db.query('select public.mcy_teacher_accept_own_invite($1::uuid,$2,$3)', [L, H.L, NAME]), '42501');
    } finally { await db.exec('reset role;'); }
    await db.exec('set role anon;');
    try { await denied(() => db.query('select public.mcy_teacher_prepare_invite($1::uuid,$2,$3,$4::uuid,$5,$6,$7::int)', [O, H.T, H.O, key(1), 'teacher', 'global', 72]), '42501'); }
    finally { await db.exec('reset role;'); }
  } finally { await db.close(); }
});

test('Owner invites, delivery is confirmed, the teacher accepts and the content workspace recognises a teacher', async () => {
  const { db } = await fixture();
  try {
    await denied(() => reviewActor(db, T), '42501');
    const first = await prepare(db, O, H.T, H.O, key(1));
    assert.equal(first.delivery_state, 'ready');
    assert.equal((await invite(db, first.invite_id)).delivery_state, 'in_progress');
    assert.deepEqual(await prepare(db, O, H.T, H.O, key(1)), { invite_id: first.invite_id, delivery_state: 'in_progress' }, 'same key repeats, never "ready" twice');
    await denied(() => prepare(db, O, H.X, H.O, key(1)), '23505');
    assert.equal(await delivered(db, O, first.invite_id), true);
    assert.equal(await delivered(db, O, first.invite_id), false, 'second confirmation is a no-op');
    assert.equal(await failed(db, O, first.invite_id), false, 'a sent invitation cannot fall back to uncertain');
    assert.deepEqual(await prepare(db, O, H.T, H.O, key(2)), { invite_id: first.invite_id, delivery_state: 'sent' }, 'a second invite for a pending address returns the existing one');
    assert.equal((await one(db, 'select count(*)::int c from private.workspace_invites')).c, 1);

    assert.deepEqual(await accept(db, T, H.T, `  ${NAME} `), { status: 'active', role: 'teacher' });
    const row = await invite(db, first.invite_id);
    assert.equal(row.accepted_by, T);
    assert.ok(row.accepted_at);
    const roles = (await db.query(`select role, scope_type, status, assigned_by from private.role_assignments where user_id=$1`, [T])).rows;
    assert.deepEqual(roles, [{ role: 'teacher', scope_type: 'global', status: 'active', assigned_by: O }]);
    assert.deepEqual(await one(db, 'select public_name, active from public.teachers where user_id=$1', [T]), { public_name: NAME, active: true });
    assert.deepEqual((await audit(db, first.invite_id)).map(a => a.action), ['teacher.invite.prepared', 'teacher.invite.delivery_confirmed', 'teacher.invite.accepted']);
    assert.equal(await reviewActor(db, T), 'teacher');
    assert.equal(await reviewActor(db, O), 'owner');

    // Repeat acceptance and repeat prepare with the old key are idempotent.
    assert.deepEqual(await accept(db, T, H.T), { status: 'active', role: 'teacher' });
    assert.equal((await one(db, `select count(*)::int c from private.role_assignments where user_id=$1`, [T])).c, 1);
    assert.equal((await audit(db, first.invite_id)).length, 3);
    assert.deepEqual(await prepare(db, O, H.T, H.O, key(1)), { invite_id: first.invite_id, delivery_state: 'sent' });

    // The activated teacher can use the current content workspace and the (older) teacher draft RPCs.
    const lesson = { youtubeId: 'AAAAAAAAAAA', summary: 'Fictional lesson summary', durationLabel: '0:43', orientation: 'portrait' };
    const saved = await svc(db, `select public.mcy_content_save_version($1::uuid,null,'video_lesson','Teacher lesson',$2::jsonb,0) as v`, [T, JSON.stringify(lesson)]);
    assert.ok(saved.item_id);
    const d1 = await saveDraft(db, T, draft);
    assert.equal(d1.version_no, 1);
    assert.equal((await listDrafts(db, T)).length, 1);
    assert.equal((await readDraft(db, T, d1.session_id)).segments.length, 1);
    const d2 = await saveDraft(db, T, { ...draft, title: 'Fictional draft 2', session_id: d1.session_id, expected_version: 1 });
    assert.equal(d2.version_no, 2);
    await denied(() => saveDraft(db, T, { ...draft, session_id: d1.session_id, expected_version: 1 }), 'PT409');
    await denied(() => listDrafts(db, O), '42501');
    await denied(() => readDraft(db, X, d1.session_id), '42501');
  } finally { await db.close(); }
});

test('Owner-only actions refuse others, self-invites, bad input, expired Owner roles and the hourly cap', async () => {
  const { db } = await fixture();
  try {
    await denied(() => prepare(db, L, H.T, H.L, key(1)), '42501');
    await denied(() => prepare(db, T, H.X, H.T, key(1)), '42501');
    await denied(() => prepare(db, O, H.O, H.O, key(1)), '22023');
    await denied(() => prepare(db, O, H.T, H.O, key(1), 'owner'), '22023');
    await denied(() => prepare(db, O, H.T, H.O, key(1), 'teacher', 'content'), '22023');
    await denied(() => prepare(db, O, H.T, H.O, key(1), 'teacher', 'global', 24), '22023');
    await denied(() => prepare(db, O, 'not-a-hash', H.O, key(1)), '22023');
    const r = await prepare(db, O, H.T, H.O, key(1));
    for (const fn of [delivered, failed, existing]) await denied(() => fn(db, L, r.invite_id), '42501');
    assert.equal(await delivered(db, O2, r.invite_id), false, 'another Owner cannot settle this Owner\'s invite');
    assert.equal(await existing(db, O2, r.invite_id), false);
    await prepare(db, O, H.X, H.O, key(2));
    await prepare(db, O, H.N, H.O, key(3));
    await denied(() => prepare(db, O, H.P, H.O, key(4)), '54000');
    assert.equal((await prepare(db, O, H.X, H.O, key(5))).delivery_state, 'in_progress', 'a pending address still answers under the cap');
    assert.equal((await prepare(db, O, H.T, H.O, key(1))).invite_id, r.invite_id, 'a retried key still answers under the cap');
    await db.query(`update private.workspace_invites set created_at = now() - interval '61 minutes' where invited_by=$1`, [O]);
    assert.equal((await prepare(db, O, H.P, H.O, key(6))).delivery_state, 'ready', 'cap is a rolling hour');
    // An Owner role whose end date has passed grants nothing.
    await db.query(`update private.role_assignments set starts_at = now() - interval '2 days', ends_at = now() - interval '1 day' where user_id=$1`, [O2]);
    await denied(() => prepare(db, O2, H.Q, H.O2, key(7)), '42501');
    await db.query(`update private.role_assignments set ends_at = null, status='revoked', revoked_at = now() where user_id=$1`, [O2]);
    await denied(() => prepare(db, O2, H.Q, H.O2, key(7)), '42501');
  } finally { await db.close(); }
});

test('expired, uncertain or undelivered invitations cannot be accepted', async () => {
  const { db } = await fixture();
  try {
    const pending = await prepare(db, O, H.T, H.O, key(1));
    await denied(() => accept(db, T, H.T), '42501');
    assert.equal(await delivered(db, O, pending.invite_id), true);
    await db.query(`update private.workspace_invites set expires_at = now() - interval '1 minute' where id=$1`, [pending.invite_id]);
    await denied(() => accept(db, T, H.T), '42501');
    const fresh = await prepare(db, O, H.T, H.O, key(2));
    assert.notEqual(fresh.invite_id, pending.invite_id, 'an expired invite is not reused');
    assert.equal(fresh.delivery_state, 'ready');

    const unsure = await prepare(db, O, H.X, H.O, key(3));
    assert.equal(await failed(db, O, unsure.invite_id), true);
    assert.equal((await invite(db, unsure.invite_id)).delivery_state, 'uncertain');
    assert.deepEqual((await audit(db, unsure.invite_id)).map(a => [a.action, a.outcome]), [['teacher.invite.prepared', 'success'], ['teacher.invite.delivery_uncertain', 'failure']]);
    await denied(() => accept(db, X, H.X), '42501');
    assert.equal(await delivered(db, O, unsure.invite_id), false);
    assert.equal(await existing(db, O, unsure.invite_id), false);
    assert.deepEqual(await prepare(db, O, H.X, H.O, key(4)), { invite_id: unsure.invite_id, delivery_state: 'uncertain' }, 'no automatic resend while the uncertain invite is pending');
    assert.equal((await one(db, 'select count(*)::int c from private.role_assignments where user_id in ($1,$2)', [T, X])).c, 0);
  } finally { await db.close(); }
});

test('an address that already has an account is settled without email and still needs its own confirmed account to accept', async () => {
  const { db } = await fixture();
  try {
    const r = await prepare(db, O, H.E, H.O, key(1));
    assert.equal(await existing(db, O, r.invite_id), true);
    assert.equal(await existing(db, O, r.invite_id), false, 'only an in_progress invite can be settled');
    assert.equal(await delivered(db, O, r.invite_id), false);
    assert.equal((await invite(db, r.invite_id)).delivery_state, 'sent');
    const events = await audit(db, r.invite_id);
    assert.deepEqual(events.map(a => a.action), ['teacher.invite.prepared', 'teacher.invite.existing_account']);
    assert.deepEqual(events[1].metadata, { delivery_state: 'sent', email_sent: false });
    await denied(() => accept(db, X, H.X), '42501');
    assert.deepEqual(await accept(db, E, H.E), { status: 'active', role: 'teacher' });
    assert.equal(await reviewActor(db, E), 'teacher');
    assert.equal(await existing(db, O, r.invite_id), false, 'an accepted invite cannot be settled again');
    const sent = await sentInvite(db, H.T, key(2));
    assert.equal(await existing(db, O, sent), false, 'a delivered invite is not in_progress');
  } finally { await db.close(); }
});

test('strangers, unconfirmed accounts and mismatched profile names are refused; a revoked teacher stays revoked', async () => {
  const { db } = await fixture();
  try {
    await sentInvite(db, H.T, key(1));
    await sentInvite(db, H.N, key(2));
    await denied(() => accept(db, X, H.X), '42501');
    await denied(() => accept(db, N, H.N), '42501');
    await db.query('delete from public.profiles where user_id=$1', [X]);
    await denied(() => accept(db, X, H.T), '42501');
    await denied(() => accept(db, id(99), H.T), '42501');
    await denied(() => accept(db, T, H.T, 'Another name'), '42501');
    await denied(() => accept(db, T, H.T, 'Bad\u0001name'), '22023');
    await denied(() => accept(db, T, 'not-a-hash'), '22023');
    assert.equal((await one(db, 'select count(*)::int c from public.teachers')).c, 0);

    assert.deepEqual(await accept(db, T, H.T), { status: 'active', role: 'teacher' });
    await db.query(`update private.role_assignments set status='revoked', revoked_at=now() where user_id=$1 and role='teacher'`, [T]);
    await denied(() => accept(db, T, H.T), '42501');
    await denied(() => reviewActor(db, T), '42501');
    await denied(() => listDrafts(db, T), '42501');
    assert.equal((await one(db, `select count(*)::int c from private.role_assignments where user_id=$1 and status='active'`, [T])).c, 0);

    // A deactivated profile with a still-active role is also not a teacher, and acceptance does not revive it.
    await sentInvite(db, H.E, key(3));
    assert.deepEqual(await accept(db, E, H.E), { status: 'active', role: 'teacher' });
    await db.query('update public.teachers set active=false where user_id=$1', [E]);
    await denied(() => accept(db, E, H.E), '42501');
    await denied(() => reviewActor(db, E), '42501');
    assert.equal((await one(db, 'select active from public.teachers where user_id=$1', [E])).active, false);

    // Current behaviour (reported, not fixed here): a NEW delivered invite to the same address still cannot reactivate the
    // revoked teacher, because acceptance first finds the consumed invite and refuses. Re-inviting needs a migration change.
    await db.query(`update private.workspace_invites set created_at = now() - interval '2 hours'`);
    await sentInvite(db, H.T, key(4));
    await denied(() => accept(db, T, H.T), '42501');
  } finally { await db.close(); }
});

const accountKind = (db, actor, email) => svc(db, 'select public.mcy_teacher_invite_account_kind($1::uuid,$2) as v', [actor, email]);
const emailed = (db, actor, invite) => svc(db, 'select public.mcy_teacher_invite_mark_existing_account_emailed($1::uuid,$2::uuid) as v', [actor, invite]);
const mail = n => `fictional-${n}@example.test`;

test('the follow-up adds only its two RPCs, service_role only, and widens nothing older', async () => {
  const { db, before, after } = await fixture({ withFollowUp: true });
  try {
    const added = Object.keys(after).filter(k => !(k in before)).sort();
    assert.deepEqual(added.map(k => k.replace(/^fn:public\.(\w+)\(.*$/, '$1')).sort(), [...followUpRpcs].sort());
    for (const k of Object.keys(before)) assert.equal(after[k], before[k], `${k} changed`);
    for (const name of followUpRpcs) {
      const f = await one(db, `select p.prosecdef, p.proconfig, coalesce(p.proacl::text,'') acl,
        has_function_privilege('anon', p.oid, 'execute') a, has_function_privilege('authenticated', p.oid, 'execute') u,
        has_function_privilege('service_role', p.oid, 'execute') s from pg_proc p where p.proname=$1`, [name]);
      assert.equal(f.prosecdef, true, `${name} security definer`);
      assert.deepEqual(f.proconfig, ['search_path=""'], `${name} empty search_path`);
      assert.deepEqual([f.a, f.u, f.s], [false, false, true], `${name} EXECUTE only for service_role`);
      assert.doesNotMatch(f.acl, /[{,]=[a-zA-Z*]*X/, `${name} not executable by PUBLIC`);
    }
    await db.exec(`set role authenticated; set request.jwt.claim.sub='${L}'; set request.jwt.claim.role='authenticated';`);
    try { await denied(() => db.query('select public.mcy_teacher_invite_account_kind($1::uuid,$2)', [O, mail('learner')]), '42501'); }
    finally { await db.exec('reset role;'); }
  } finally { await db.close(); }
});

test('account kind: none, learner (a teacher-only role still counts as learner), staff; Owner only; audited without the address', async () => {
  const { db } = await fixture({ withFollowUp: true });
  try {
    assert.equal(await accountKind(db, O, mail('nobody')), 'none');
    assert.equal(await accountKind(db, O, mail('learner')), 'learner');
    assert.equal(await accountKind(db, O, mail('unconfirmed')), 'learner', 'an unconfirmed account still exists');
    await db.query(`insert into private.role_assignments(user_id,role,scope_type,reason) values($1,'teacher','global','Fictional fixture')`, [E]);
    assert.equal(await accountKind(db, O, mail('existing')), 'learner');
    assert.equal(await accountKind(db, O, mail('owner2')), 'staff');
    await db.query(`insert into private.role_assignments(user_id,role,scope_type,reason) values($1,'support','global','Fictional fixture')`, [X]);
    assert.equal(await accountKind(db, O, mail('stranger')), 'staff');
    // An ended staff role no longer counts.
    await db.query(`update private.role_assignments set starts_at = now() - interval '2 days', ends_at = now() - interval '1 day' where user_id=$1`, [X]);
    assert.equal(await accountKind(db, O, mail('stranger')), 'learner');
    const refusals = (await db.query(`select actor_id, outcome, object_id, metadata from private.audit_events where action='teacher.invite.refused_staff_account'`)).rows;
    assert.deepEqual(refusals.map(r => [r.actor_id, r.outcome, r.object_id]), [[O, 'denied', null], [O, 'denied', null]]);
    for (const r of refusals) assert.doesNotMatch(JSON.stringify(r.metadata), /@|example/, 'no address in the audit');
    // Not an Owner, or a malformed / non-normalised address.
    await denied(() => accountKind(db, L, mail('learner')), '42501');
    await denied(() => accountKind(db, T, mail('learner')), '42501');
    for (const bad of [' fictional-learner@example.test', 'Fictional-Learner@example.test', 'no-at-sign', 'a@b', '', `${'a'.repeat(250)}@x.test`]) {
      await denied(() => accountKind(db, O, bad), '22023');
    }
    await denied(() => accountKind(db, O, null), '22023');
    assert.equal((await one(db, 'select count(*)::int c from private.workspace_invites')).c, 0, 'the lookup creates no invitation');
  } finally { await db.close(); }
});

test('an existing account settled by the instructions email records email_sent and can then be accepted', async () => {
  const { db } = await fixture({ withFollowUp: true });
  try {
    const r = await prepare(db, O, H.E, H.O, key(1));
    await denied(() => emailed(db, L, r.invite_id), '42501');
    assert.equal(await emailed(db, O2, r.invite_id), false, 'another Owner cannot settle it');
    assert.equal(await emailed(db, O, r.invite_id), true);
    assert.equal(await emailed(db, O, r.invite_id), false, 'only an in_progress invite can be settled');
    assert.equal(await existing(db, O, r.invite_id), false);
    assert.equal((await invite(db, r.invite_id)).delivery_state, 'sent');
    const events = await audit(db, r.invite_id);
    assert.deepEqual(events.map(a => a.action), ['teacher.invite.prepared', 'teacher.invite.delivery_confirmed']);
    assert.deepEqual(events[1].metadata, { delivery_state: 'sent', email_sent: true, existing_account: true });
    assert.deepEqual(await prepare(db, O, H.E, H.O, key(2)), { invite_id: r.invite_id, delivery_state: 'sent' }, 'a second click sends nothing');
    assert.deepEqual(await accept(db, E, H.E), { status: 'active', role: 'teacher' });
    assert.equal(await emailed(db, O, r.invite_id), false, 'an accepted invite cannot be settled again');
  } finally { await db.close(); }
});
