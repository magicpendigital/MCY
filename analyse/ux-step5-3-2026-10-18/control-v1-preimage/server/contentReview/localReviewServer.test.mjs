import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { request as httpRequest } from 'node:http';
import { createLocalReviewServer } from './localReviewServer.mjs';

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
