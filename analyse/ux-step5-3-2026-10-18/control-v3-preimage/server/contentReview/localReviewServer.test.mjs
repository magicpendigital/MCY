import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { request as httpRequest } from 'node:http';
import { createLocalReviewServer } from './localReviewServer.mjs';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const actualRepo = path.resolve(here, '../../../..');

test('fixture HTTP stays same-origin, one-use, no-store and revocable without canonical files', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'mcy-review-http-'));
  const candidateRoot = path.join(root, '.vercel/candidate');
  const dist = path.join(candidateRoot, 'dist/client');
  await mkdir(dist, { recursive: true });
  await writeFile(path.join(dist, 'index.html'), '<!doctype html><title>Fixture only</title>');
  const review = await createLocalReviewServer({ mode: 'fictional_rehearsal',
    candidateRoot, repoRoot: root, privateRoot: path.join(root, '.vercel/private'), port: 0 });
  const base = `${review.origin}/__mcy_review/v1`;
  const safe = { 'Sec-Fetch-Site': 'same-origin' };
  try {
    const unauth = await fetch(`${base}/units`, { headers: safe });
    assert.equal(unauth.status, 401);
    assert.match(unauth.headers.get('cache-control'), /no-store/);
    const raw = await fetch(`${review.origin}/@fs/content/yoga-library/units/cobra/r1.json`);
    assert.equal(raw.status, 404);
    for (const forbidden of ['/src/review/localReviewContract.ts', '/tests/local-review.spec.ts',
      '/assets/app.js.map', '/%2e%2e/content/yoga-library/inventory.json']) {
      assert.equal((await fetch(`${review.origin}${forbidden}`)).status, 404);
    }
    const wrongHost = await new Promise((resolve, reject) => {
      const request = httpRequest(`${base}/session`, { headers: { Host: 'evil.invalid',
        'Sec-Fetch-Site': 'same-origin' } }, response => { response.resume(); resolve(response.statusCode); });
      request.once('error', reject); request.end();
    });
    assert.equal(wrongHost, 403);
    const secret = (await readFile(review.bootstrapFiles.find(x => x.purpose === 'author').path, 'utf8')).trim();
    const wrongToken = await fetch(`${base}/bootstrap`, {
      method: 'POST', redirect: 'manual',
      headers: { ...safe, Origin: review.origin, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ capability: '0'.repeat(64) }),
    });
    assert.equal(wrongToken.status, 403);
    const bootstrap = await fetch(`${base}/bootstrap`, {
      method: 'POST', redirect: 'manual',
      headers: { ...safe, Origin: review.origin, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ capability: secret }),
    });
    assert.equal(bootstrap.status, 303);
    assert.equal(bootstrap.headers.get('location'), '/?workspace=unit-review&mode=web');
    const cookie = bootstrap.headers.get('set-cookie').split(';')[0];
    assert.match(bootstrap.headers.get('set-cookie'), /HttpOnly; SameSite=Strict/);
    const replay = await fetch(`${base}/bootstrap`, {
      method: 'POST', redirect: 'manual',
      headers: { ...safe, Origin: review.origin, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ capability: secret }),
    });
    assert.equal(replay.status, 403);
    const list = await fetch(`${base}/units`, { headers: { ...safe, Cookie: cookie } });
    assert.equal(list.status, 200);
    assert.equal((await list.json()).items.length, 1);
    const asset = await fetch(`${base}/units/f1/assets/fixture-image`, { headers: { ...safe, Cookie: cookie } });
    assert.equal(asset.status, 200);
    assert.equal(asset.headers.get('content-type'), 'image/svg+xml');
    assert.match(asset.headers.get('cache-control'), /no-store/);
    const crossSite = await fetch(`${base}/units/f1`, {
      headers: { Cookie: cookie, 'Sec-Fetch-Site': 'cross-site' },
    });
    assert.equal(crossSite.status, 403);
    const csrf = await fetch(`${base}/units/f1/notes`, {
      method: 'POST', headers: { ...safe, Cookie: cookie, Origin: 'http://evil.invalid',
        'Content-Type': 'application/json', 'X-MCY-Review-Intent': '1' }, body: '{}',
    });
    assert.equal(csrf.status, 403);
    const missingOrigin = await fetch(`${base}/units/f1/notes`, {
      method: 'POST', headers: { ...safe, Cookie: cookie,
        'Content-Type': 'application/json', 'X-MCY-Review-Intent': '1' }, body: '{}',
    });
    assert.equal(missingOrigin.status, 403);
    const missingIntent = await fetch(`${base}/units/f1/notes`, {
      method: 'POST', headers: { ...safe, Cookie: cookie, Origin: review.origin,
        'Content-Type': 'application/json' }, body: '{}',
    });
    assert.equal(missingIntent.status, 403);
    const deniedReview = await fetch(`${base}/units/f1/review`, {
      method: 'POST', headers: { ...safe, Cookie: cookie, Origin: review.origin,
        'Content-Type': 'application/json', 'X-MCY-Review-Intent': '1' }, body: '{}',
    });
    assert.equal(deniedReview.status, 403);
    const other = await createLocalReviewServer({ mode: 'fictional_rehearsal',
      candidateRoot, repoRoot: root, privateRoot: path.join(root, '.vercel/private'), port: 0 });
    try {
      const foreign = await fetch(`${other.origin}/__mcy_review/v1/session`, {
        headers: { ...safe, Cookie: cookie },
      });
      assert.equal((await foreign.json()).authenticated, false);
    } finally { await other.close(); }
    review.model.revoke(cookie.split('=')[1]);
    const revoked = await fetch(`${base}/units/f1`, { headers: { ...safe, Cookie: cookie } });
    assert.equal(revoked.status, 401);
  } finally {
    await review.close();
    await rm(root, { recursive: true, force: true });
  }
});

test('expired one-use bootstrap capability cannot establish a local lease', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'mcy-review-expiry-'));
  const candidateRoot = path.join(root, '.vercel/candidate');
  await mkdir(path.join(candidateRoot, 'dist/client'), { recursive: true });
  await writeFile(path.join(candidateRoot, 'dist/client/index.html'), '<!doctype html><title>Fixture</title>');
  const review = await createLocalReviewServer({ mode: 'fictional_rehearsal', candidateRoot,
    repoRoot: root, privateRoot: path.join(root, '.vercel/private'), port: 0, bootstrapTtlMs: 1 });
  try {
    const secret = (await readFile(review.bootstrapFiles[0].path, 'utf8')).trim();
    await new Promise(resolve => setTimeout(resolve, 10));
    const response = await fetch(`${review.origin}/__mcy_review/v1/bootstrap`, {
      method: 'POST', redirect: 'manual',
      headers: { Origin: review.origin, 'Sec-Fetch-Site': 'same-origin',
        'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ capability: secret }),
    });
    assert.equal(response.status, 403);
  } finally {
    await review.close();
    await rm(root, { recursive: true, force: true });
  }
});

test('owner local mode reads exact selected draft but denies edit/review and blocked media', async () => {
  const temporary = await mkdtemp(path.join(os.tmpdir(), 'mcy-review-owner-http-'));
  const candidateRoot = path.join(temporary, 'candidate');
  await mkdir(path.join(candidateRoot, 'dist/client'), { recursive: true });
  await mkdir(path.join(candidateRoot, 'server/contentReview'), { recursive: true });
  await writeFile(path.join(candidateRoot, 'dist/client/index.html'), '<!doctype html><title>Owner local test</title>');
  const selection = await readFile(path.join(here, 'selectedSnapshot.json'));
  await writeFile(path.join(candidateRoot, 'server/contentReview/selectedSnapshot.json'), selection);
  const review = await createLocalReviewServer({ mode: 'owner_local_preview', candidateRoot,
    repoRoot: actualRepo, privateRoot: path.join(actualRepo, '.vercel/local-review-private-tests'), port: 0 });
  const base = `${review.origin}/__mcy_review/v1`;
  const safe = { 'Sec-Fetch-Site': 'same-origin' };
  try {
    const secret = (await readFile(review.bootstrapFiles[0].path, 'utf8')).trim();
    const bootstrap = await fetch(`${base}/bootstrap`, {
      method: 'POST', redirect: 'manual',
      headers: { ...safe, Origin: review.origin, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ capability: secret }),
    });
    assert.equal(bootstrap.status, 303);
    const cookie = bootstrap.headers.get('set-cookie').split(';')[0];
    const headers = { ...safe, Cookie: cookie };
    const list = await fetch(`${base}/units`, { headers });
    assert.equal(list.status, 200);
    const body = await list.json();
    assert.equal(body.items.length, 14);
    const first = await fetch(`${base}/units/u1`, { headers });
    assert.equal(first.status, 200);
    const unit = (await first.json()).unit;
    assert.equal(unit.id, 'mcy.pose.cobra');
    assert.equal(unit.reviewState, 'unreviewed');
    const media = unit.media.find(item => item.status === 'draft_present');
    const image = await fetch(`${review.origin}${media.assetUrl}`, { headers });
    assert.equal(image.status, 200);
    assert.equal(image.headers.get('content-type'), 'image/png');
    assert.match(image.headers.get('cache-control'), /no-store/);
    const noteHeaders = { ...headers, Origin: review.origin,
      'Content-Type': 'application/json', 'X-MCY-Review-Intent': '1' };
    const note = await fetch(`${base}/units/u1/notes`, { method: 'POST', headers: noteHeaders,
      body: JSON.stringify({ epoch: body.epoch, sourceHash: unit.sourceHash,
        revision: unit.revision, notes: 'Ghi chú local, chưa gửi reviewer' }) });
    assert.equal(note.status, 200);
    assert.equal((await note.json()).unit.notes, 'Ghi chú local, chưa gửi reviewer');
    const denied = { method: 'POST', headers: { ...headers, Origin: review.origin,
      'Content-Type': 'application/json', 'X-MCY-Review-Intent': '1' },
      body: JSON.stringify({ epoch: body.epoch, sourceHash: unit.sourceHash,
        revision: unit.revision, title: 'Changed' }) };
    assert.equal((await fetch(`${base}/units/u1/draft`, denied)).status, 403);
    assert.equal((await fetch(`${base}/units/u1/review`, denied)).status, 403);
    const blocked = await fetch(`${base}/units/u1/assets/not-selected`, { headers });
    assert.equal(blocked.status, 404);
  } finally {
    await review.close();
    await rm(temporary, { recursive: true, force: true });
  }
});

test('strict static allowlist serves pinned RIFF/WAVE audio and rejects invalid WAV bytes', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'mcy-review-wav-'));
  const candidateRoot = path.join(root, '.vercel/candidate');
  const dist = path.join(candidateRoot, 'dist/client');
  await mkdir(dist, { recursive: true });
  await writeFile(path.join(dist, 'index.html'), '<!doctype html><title>Audio fixture</title>');
  const wav = Buffer.alloc(44);
  wav.write('RIFF', 0, 'ascii');
  wav.writeUInt32LE(36, 4);
  wav.write('WAVE', 8, 'ascii');
  await writeFile(path.join(dist, 'sample.wav'), wav);
  const options = { mode: 'fictional_rehearsal', candidateRoot, repoRoot: root,
    privateRoot: path.join(root, '.vercel/private'), port: 0 };
  try {
    const review = await createLocalReviewServer(options);
    try {
      const response = await fetch(`${review.origin}/sample.wav`);
      assert.equal(response.status, 200);
      assert.equal(response.headers.get('content-type'), 'audio/wav');
      assert.match(response.headers.get('cache-control'), /no-store/);
      assert.deepEqual(Buffer.from(await response.arrayBuffer()), wav);
    } finally { await review.close(); }
    await writeFile(path.join(dist, 'sample.wav'), Buffer.from('not a wave file'));
    await assert.rejects(createLocalReviewServer(options), { code: 'INVALID_INPUT' });
  } finally { await rm(root, { recursive: true, force: true }); }
});
