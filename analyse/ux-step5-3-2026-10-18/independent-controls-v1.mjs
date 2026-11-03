import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { copyFile, lstat, mkdir, mkdtemp, readFile, realpath, rm, symlink, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createLocalReviewServer } from '../../.vercel/ux-step5-3-20261018-v1/server/contentReview/localReviewServer.mjs';

// SOURCE ONLY until independent source review + root invocation GO.
// No provider, environment files, canonical writes, production hooks or persistent notes.
const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(here, '../..');
const candidate = path.join(repo, '.vercel/ux-step5-3-20261018-v1');
const freezePath = path.join(here, 'CONTROL-SOURCE-FREEZE-v2.json');
const freezeSha = '04aae7b43aef4649c34abb6f0058100a33353a682319374a3fdc062ebb16788d';
const temporaryParent = path.join(repo, '.vercel/ux-step5-3-independent-temporary');
const resultsPath = path.join(here, 'independent-controls-v1-results.json');
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const results = [];
const allowedOrigins = new Set();
let freeze;
let selection;
let postPinsMatch = false;

async function pins() {
  const bytes = await readFile(freezePath);
  assert.equal(sha(bytes), freezeSha, 'Control freeze changed');
  const value = JSON.parse(bytes);
  assert.equal(value.files.length, 9);
  assert.equal(value.canonicalDependencies.length, 71);
  for (const pin of value.files) {
    const bytes = await readFile(path.join(candidate, pin.path));
    assert.equal(sha(bytes), pin.sha256, `Source pin changed: ${pin.path}`);
    assert.equal(bytes.length, pin.bytes);
  }
  for (const pin of value.canonicalDependencies) {
    assert.equal(sha(await readFile(path.join(repo, pin.path))), pin.sha256, `Canonical pin changed: ${pin.path}`);
  }
  return value;
}
before(async () => {
  try { await lstat(resultsPath); throw new Error('Refusing to overwrite prior independent results'); }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
  freeze = await pins();
  selection = JSON.parse(await readFile(path.join(candidate, 'server/contentReview/selectedSnapshot.json')));
  await mkdir(temporaryParent, { recursive: true });
});
after(async () => {
  await pins(); postPinsMatch = true;
  await writeFile(resultsPath, `${JSON.stringify({
    scope: 'INDEPENDENT_LOCAL_TEMP_FIXTURE_CONTROL_ONLY', controlFreezeSha256: freezeSha,
    results, prePinsMatch: Boolean(freeze), postPinsMatch,
    sourcePins: 9, canonicalPins: 71, outputContainsDraftBodiesOrCapabilities: false,
    limit: 'Finite source rechecks; not atomic filesystem, physical device, live Auth or human approval',
  }, null, 2)}\n`, { flag: 'wx' });
});

async function request(origin, suffix, options = {}) {
  assert.ok(allowedOrigins.has(origin), 'Only the current owned loopback server may be requested');
  const url = new URL(suffix, origin);
  assert.equal(url.origin, origin);
  assert.equal(url.protocol, 'http:'); assert.equal(url.hostname, '127.0.0.1');
  return fetch(url, { cache: 'no-store', redirect: 'manual', signal: AbortSignal.timeout(8000), ...options });
}
async function removeCase(directory) {
  const absolute = path.resolve(directory);
  assert.equal(path.dirname(absolute), temporaryParent);
  assert.match(path.basename(absolute), /^case-/);
  const resolved = await realpath(absolute);
  assert.ok(resolved.startsWith(`${await realpath(temporaryParent)}${path.sep}`));
  await rm(absolute, { recursive: true, force: true });
}
async function createCase(owner = false, clock = { value: Date.now() }) {
  const root = await mkdtemp(path.join(temporaryParent, 'case-'));
  const localCandidate = path.join(root, 'candidate');
  await mkdir(path.join(localCandidate, 'dist/client'), { recursive: true });
  await writeFile(path.join(localCandidate, 'dist/client/index.html'), '<!doctype html><title>Neutral independent fixture</title>');
  if (owner) {
    // Only copied metadata is changed by drift tests; no upstream path is a write target.
    for (const item of [selection.contract, selection.inventory, ...selection.units]) {
      const target = path.join(root, item.path);
      await mkdir(path.dirname(target), { recursive: true });
      await copyFile(path.join(repo, item.path), target);
    }
    await mkdir(path.join(localCandidate, 'server/contentReview'), { recursive: true });
    await copyFile(path.join(candidate, 'server/contentReview/selectedSnapshot.json'),
      path.join(localCandidate, 'server/contentReview/selectedSnapshot.json'));
  }
  let running;
  return {
    root, localCandidate,
    async start() {
      running = await createLocalReviewServer({ mode: owner ? 'owner_local_preview' : 'fictional_rehearsal',
        candidateRoot: localCandidate, repoRoot: root, privateRoot: path.join(root, 'private'),
        port: 0, now: () => clock.value });
      allowedOrigins.add(running.origin);
      return running;
    },
    async close() {
      try { if (running) { allowedOrigins.delete(running.origin); await running.close(); } }
      finally { await removeCase(root); }
    },
  };
}
const safe = { 'Sec-Fetch-Site': 'same-origin' };
async function bootstrap(running) {
  const capability = (await readFile(running.bootstrapFiles[0].path, 'utf8')).trim();
  const response = await request(running.origin, '/__mcy_review/v1/bootstrap', {
    method: 'POST', headers: { ...safe, Origin: running.origin, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ capability }),
  });
  assert.equal(response.status, 303);
  const cookie = response.headers.get('set-cookie').split(';')[0];
  return { cookie, leaseId: cookie.slice(cookie.indexOf('=') + 1) };
}
const deferred = () => { let resolve; const promise = new Promise(done => { resolve = done; }); return { promise, resolve }; };
async function bounded(promise) {
  let timeout;
  try { return await Promise.race([promise, new Promise((_, reject) => { timeout = setTimeout(() => reject(new Error('Owned read did not reach delay boundary')), 5000); })]); }
  finally { clearTimeout(timeout); }
}

test('independent static artifact changes and additions fail closed', { timeout: 30000 }, async () => {
  const fixture = await createCase();
  try {
    const running = await fixture.start();
    assert.equal((await request(running.origin, '/')).status, 200);
    await writeFile(path.join(fixture.localCandidate, 'dist/client/index.html'), '<title>Changed neutral bytes</title>');
    assert.equal((await request(running.origin, '/')).status, 409);
    await writeFile(path.join(fixture.localCandidate, 'dist/client/added.js'), 'throw new Error("must never be served")');
    assert.equal((await request(running.origin, '/added.js')).status, 404);
    for (const suffix of ['/src/staff/UnitReviewWorkspace.tsx', '/server/contentReview/reviewModel.mjs', '/@fs/AGENTS.md']) {
      assert.equal((await request(running.origin, suffix)).status, 404);
    }
    results.push({ case: 'static-integrity-and-added-path', status: 'PASS', changed: 409, added: 404 });
  } finally { await fixture.close(); }
});

test('independent static root junction is rejected before server startup', { timeout: 30000 }, async context => {
  const fixture = await createCase();
  const client = path.join(fixture.localCandidate, 'dist/client');
  const outside = path.join(fixture.root, 'outside-candidate');
  let linked = false;
  try {
    await mkdir(outside); await writeFile(path.join(outside, 'index.html'), '<title>Outside neutral fixture</title>');
    await rm(client, { recursive: true });
    try { await symlink(outside, client, 'junction'); linked = true; }
    catch (error) {
      if (!['EPERM', 'EACCES', 'ENOTSUP'].includes(error.code)) throw error;
      results.push({ case: 'static-root-junction', status: 'SKIP_HOST_PERMISSION' });
      context.skip('Host disallows the owned junction fixture'); return;
    }
    await assert.rejects(fixture.start(), { code: 'FORBIDDEN' });
    results.push({ case: 'static-root-junction', status: 'PASS' });
  } finally { if (linked) await unlink(client); await fixture.close(); }
});

for (const condition of ['source-drift', 'revoke', 'expiry']) {
  test(`independent final HTTP emit denies ${condition} after model read`, { timeout: 45000 }, async () => {
    const clock = { value: Date.now() };
    const fixture = await createCase(true, clock);
    const reached = deferred(); const release = deferred();
    let running; let originalRead; let pending;
    try {
      running = await fixture.start();
      const { cookie, leaseId } = await bootstrap(running);
      const headers = { ...safe, Cookie: cookie };
      const healthy = await request(running.origin, '/__mcy_review/v1/units/u1', { headers });
      assert.equal(healthy.status, 200); await healthy.arrayBuffer();
      originalRead = running.model.read;
      // Add only latency through an existing exported model method. The real model read
      // runs completely; its result is returned unchanged. All final server source/lease
      // guards stay in place. No production seam or authorization guard is replaced.
      running.model.read = async (...args) => {
        const result = await originalRead(...args); reached.resolve(); await release.promise; return result;
      };
      pending = request(running.origin, '/__mcy_review/v1/units/u1', { headers });
      await bounded(reached.promise);
      if (condition === 'source-drift') {
        const copied = path.join(fixture.root, selection.units[0].path);
        await writeFile(copied, Buffer.concat([await readFile(copied), Buffer.from('\n')]));
      } else if (condition === 'revoke') running.model.revoke(leaseId);
      else clock.value += 15 * 60_000 + 1;
      release.resolve();
      const response = await pending;
      assert.equal(response.status, condition === 'source-drift' ? 409 : 401);
      assert.match(response.headers.get('cache-control'), /no-store/);
      const body = await response.json();
      assert.equal(body.code, { 'source-drift': 'SOURCE_CHANGED', revoke: 'SESSION_REVOKED', expiry: 'SESSION_EXPIRED' }[condition]);
      assert.equal(Object.hasOwn(body, 'unit'), false);
      results.push({ case: `final-emit-${condition}`, status: 'PASS', httpStatus: response.status, privateUnitEmitted: false });
    } finally {
      release.resolve();
      if (pending) await pending.catch(() => {});
      if (running && originalRead) running.model.read = originalRead;
      await fixture.close();
    }
  });
}
