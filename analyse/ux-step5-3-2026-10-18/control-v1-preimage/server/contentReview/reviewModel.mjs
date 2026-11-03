import { createHash, randomUUID } from 'node:crypto';

const fail = (code, message) => Object.assign(new Error(message), { code });
const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const assetUrl = (key, id) => `/__mcy_review/v1/units/${encodeURIComponent(key)}/assets/${encodeURIComponent(id)}`;
const fixtureSvg = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360"><rect width="640" height="360" fill="#d9e8e1"/><text x="32" y="185" font-size="28" fill="#244538">Fictional review fixture</text></svg>');

function fixtureUnit() {
  return {
    id: 'fixture.reading.alpha', revision: 'f1', locale: 'vi-VN', kind: 'sample_reading',
    title: 'Bài đọc giả lập A', shortTitle: 'Mẫu A', intro: 'Nội dung trung tính dùng để thử luồng review cục bộ.',
    learningObjectives: ['Kiểm tra cách hiển thị phiên bản.'], audience: 'Người thử giao diện',
    prerequisites: [], preparation: [], stopGuidance: 'Đây là mẫu kiểm thử, không phải hướng dẫn tập.',
    steps: [{ id: 'step-1', order: 1, title: 'Xem trạng thái', body: 'Đọc nhãn phiên bản và ảnh mẫu.',
      detail: '', entry: '', exit: '', alternative: '', stopCue: '', mediaIds: ['fixture-image'] }],
    media: [{ id: 'fixture-image', stepId: 'step-1', status: 'draft_present',
      alt: 'Hình chữ nhật minh họa kiểm thử', caption: 'Ảnh SVG giả lập; không phải tư thế yoga.',
      mime: 'image/svg+xml' }],
    sourceRefs: [],
  };
}

function project(record, notes, reviewState) {
  const { opaqueKey: key, sourceHash, unit } = record;
  const media = unit.media.map(item => ({
    id: item.id, stepId: item.stepId ?? null, status: item.status,
    alt: item.alt ?? '', caption: item.caption ?? '',
    assetUrl: item.status === 'draft_present' ? assetUrl(key, item.id) : null,
    mime: item.status === 'draft_present' ? item.mime : null,
  }));
  const available = media.filter(item => item.assetUrl).length;
  return {
    key, id: unit.id, revision: unit.revision, locale: unit.locale, kind: unit.kind,
    title: unit.title, shortTitle: unit.shortTitle ?? unit.title, sourceHash,
    mediaAvailable: available, mediaBlocked: media.length - available, reviewState,
    intro: unit.intro ?? '', learningObjectives: unit.learningObjectives ?? [],
    audience: unit.audience ?? '', prerequisites: unit.prerequisites ?? [],
    preparation: unit.preparation ?? [], stopGuidance: unit.stopGuidance ?? '',
    steps: unit.steps.map(step => ({
      id: step.id, order: step.order, title: step.title, body: step.body,
      detail: step.detail ?? null, entry: step.entry ?? null, exit: step.exit ?? null,
      alternative: step.alternative ?? null, stopCue: step.stopCue ?? null,
      mediaIds: step.mediaIds,
    })),
    media,
    sourceRefs: unit.sourceRefs.map(ref => ({
      courseId: ref.courseId, lessonId: ref.lessonId, youtubeId: ref.youtubeId,
      relation: ref.relation, contentObserved: ref.contentObserved,
    })),
    notes: notes ?? null,
  };
}

export function createReviewModel({ mode, adapter, now = () => Date.now(), leaseMs = 15 * 60_000 }) {
  if (!['fictional_rehearsal', 'owner_local_preview'].includes(mode)) throw fail('INVALID_INPUT', 'Unknown fixed mode');
  if ((mode === 'owner_local_preview') !== Boolean(adapter)) throw fail('INVALID_INPUT', 'Adapter belongs only to owner mode');
  const leases = new Map();
  const assignments = new Map();
  const notes = new Map();
  const fixture = fixtureUnit();
  let fixtureHash = hash(fixture);
  let fixtureReviewState = 'unreviewed';

  const getFixture = key => {
    if (key !== 'f1') throw fail('NOT_FOUND', 'Fixture unit is not selected');
    return { opaqueKey: key, sourceHash: fixtureHash, unit: structuredClone(fixture) };
  };
  const allowed = actor => mode === 'owner_local_preview'
    ? ['list', 'read', 'asset', 'note']
    : actor === 'fictional-author'
      ? ['list', 'read', 'asset', 'note', 'draft']
      : actor === 'fictional-reviewer'
        ? ['list', 'read', 'asset', 'note', 'review'] : [];

  function purgeNotes(id) {
    for (const key of notes.keys()) if (key.startsWith(`${id}\0`)) notes.delete(key);
  }
  const expirySweep = setInterval(() => {
    for (const [id, lease] of leases) {
      if (lease.revoked || now() >= lease.expires) {
        purgeNotes(id);
        if (now() >= lease.expires + leaseMs) leases.delete(id);
      }
    }
  }, Math.min(leaseMs, 60_000));
  expirySweep.unref();

  function issueLease(actor) {
    if (mode === 'owner_local_preview' && actor !== 'local-owner-machine') throw fail('FORBIDDEN', 'Invalid local purpose');
    const permissions = allowed(actor);
    if (!permissions.length) throw fail('FORBIDDEN', 'Actor is not assigned');
    const id = randomUUID();
    const lease = { id, actor, mode, permissions, epoch: randomUUID(), expires: now() + leaseMs, revoked: false };
    leases.set(id, lease);
    if (mode === 'fictional_rehearsal') assignments.set(actor, { key: 'f1', hash: fixtureHash, expires: lease.expires });
    return lease;
  }

  function requireLease(id, permission, key, epoch) {
    const lease = leases.get(id);
    if (!lease) throw fail('SESSION_REQUIRED', 'Local review session required');
    if (lease.revoked) throw fail('SESSION_REVOKED', 'Session was revoked');
    if (now() >= lease.expires) {
      purgeNotes(id);
      throw fail('SESSION_EXPIRED', 'Session expired');
    }
    if (lease.mode !== mode || !lease.permissions.includes(permission)) throw fail('FORBIDDEN', 'Operation unavailable');
    if (epoch !== undefined && lease.epoch !== epoch) throw fail('VERSION_CONFLICT', 'Session epoch changed');
    if (mode === 'fictional_rehearsal') {
      const assignment = assignments.get(lease.actor);
      if (!assignment || assignment.key !== key && key !== undefined || now() >= assignment.expires ||
          assignment.hash !== fixtureHash) throw fail('FORBIDDEN', 'Exact fixture assignment is unavailable');
    }
    return lease;
  }

  async function load(key) {
    return mode === 'owner_local_preview' ? adapter.readUnit(key) : getFixture(key);
  }
  const noteKey = (lease, key, sourceHash) => `${lease.id}\0${key}\0${sourceHash}`;
  const state = (record, lease) => project(record, notes.get(noteKey(lease, record.opaqueKey, record.sourceHash)),
    mode === 'owner_local_preview' ? 'unreviewed' : fixtureReviewState);

  function session(id) {
    const lease = requireLease(id, 'list');
    return { authenticated: true, mode, bootstrapPath: '/__mcy_review/v1/bootstrap',
      epoch: lease.epoch, expiresAt: new Date(lease.expires).toISOString(),
      actorLabel: mode === 'owner_local_preview' ? 'Owner local preview' : lease.actor,
      permissions: lease.permissions };
  }

  async function list(id) {
    const lease = requireLease(id, 'list');
    const records = mode === 'owner_local_preview' ? await adapter.listUnits() : [getFixture('f1')];
    requireLease(id, 'list', mode === 'fictional_rehearsal' ? 'f1' : undefined, lease.epoch);
    return { epoch: lease.epoch, items: records.map(record => {
      const { steps, media, sourceRefs, intro, learningObjectives, audience,
        prerequisites, preparation, stopGuidance, notes: ignored, ...summary } = state(record, lease);
      void steps; void media; void sourceRefs; void intro; void learningObjectives;
      void audience; void prerequisites; void preparation; void stopGuidance; void ignored;
      return summary;
    }) };
  }

  async function read(id, key) {
    const lease = requireLease(id, 'read', key);
    const record = await load(key);
    requireLease(id, 'read', key, lease.epoch);
    return { epoch: lease.epoch, unit: state(record, lease) };
  }

  async function asset(id, key, mediaId) {
    const lease = requireLease(id, 'asset', key);
    const result = mode === 'owner_local_preview'
      ? await adapter.readAsset(key, mediaId)
      : (getFixture(key).unit.media.some(item => item.id === mediaId)
        ? { bytes: fixtureSvg, mime: 'image/svg+xml', sourceHash: fixtureHash }
        : (() => { throw fail('NOT_FOUND', 'Fixture media missing'); })());
    requireLease(id, 'asset', key, lease.epoch);
    return result;
  }

  function precondition(body, record, lease) {
    if (!body || body.epoch !== lease.epoch || body.sourceHash !== record.sourceHash ||
        body.revision !== record.unit.revision) throw fail('VERSION_CONFLICT', 'Exact version changed');
  }

  async function note(id, key, body) {
    const lease = requireLease(id, 'note', key);
    const record = await load(key);
    requireLease(id, 'note', key, lease.epoch);
    precondition(body, record, lease);
    if (typeof body.notes !== 'string' || body.notes.length > 2000) throw fail('INVALID_INPUT', 'Note exceeds limit');
    requireLease(id, 'note', key, lease.epoch);
    notes.set(noteKey(lease, key, record.sourceHash), body.notes);
    return { epoch: lease.epoch, unit: state(record, lease) };
  }

  async function draft(id, key, body) {
    const lease = requireLease(id, 'draft', key);
    const record = await load(key);
    requireLease(id, 'draft', key, lease.epoch);
    precondition(body, record, lease);
    if (typeof body.title !== 'string' || !body.title.trim() || body.title.length > 120) {
      throw fail('INVALID_INPUT', 'Fixture title is invalid');
    }
    requireLease(id, 'draft', key, lease.epoch);
    fixture.title = body.title.trim();
    fixture.revision = `f${Number(fixture.revision.slice(1)) + 1}`;
    fixtureHash = hash(fixture);
    fixtureReviewState = 'unreviewed';
    assignments.set(lease.actor, { key, hash: fixtureHash, expires: lease.expires });
    return { epoch: lease.epoch, unit: state(getFixture(key), lease) };
  }

  async function review(id, key, body) {
    const lease = requireLease(id, 'review', key);
    const record = await load(key);
    requireLease(id, 'review', key, lease.epoch);
    precondition(body, record, lease);
    if (!['changes_requested', 'fixture_reviewed'].includes(body.decision)) {
      throw fail('INVALID_INPUT', 'Fixture decision is invalid');
    }
    requireLease(id, 'review', key, lease.epoch);
    fixtureReviewState = body.decision;
    return { epoch: lease.epoch, unit: state(record, lease) };
  }

  function revoke(id) {
    const lease = leases.get(id);
    if (lease) { lease.revoked = true; lease.epoch = randomUUID(); }
    purgeNotes(id);
  }
  function reassignFixture(actor) {
    if (mode !== 'fictional_rehearsal') throw fail('FORBIDDEN', 'No fixture assignment in owner mode');
    assignments.set(actor, { key: 'f1', hash: fixtureHash, expires: now() + leaseMs });
  }
  async function verifySource(key, mediaId) {
    if (mode === 'owner_local_preview') await adapter.verifyCurrent(key, mediaId);
  }
  function close() { clearInterval(expirySweep); for (const id of leases.keys()) revoke(id); leases.clear(); assignments.clear(); notes.clear(); }

  return { mode, issueLease, session, list, read, asset, note, draft, review, revoke,
    reassignFixture, verifySource, close, requireLease };
}
