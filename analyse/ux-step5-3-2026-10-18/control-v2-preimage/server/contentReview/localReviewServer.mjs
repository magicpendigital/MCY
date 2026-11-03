import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { createServer } from 'node:http';
import { lstat, mkdir, mkdtemp, readFile, readdir, realpath, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { createCanonicalAdapter } from './canonicalAdapter.mjs';
import { createReviewModel } from './reviewModel.mjs';

const BASE = '/__mcy_review/v1';
const STATIC_EXTENSION = /\.(?:html|js|css|svg|png|jpe?g|webp|avif|gif|woff2?|ico)$/;
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
const CSP = "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; frame-src 'none'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'";
const errorStatus = { SESSION_REQUIRED: 401, SESSION_EXPIRED: 401, SESSION_REVOKED: 401,
  FORBIDDEN: 403, NOT_FOUND: 404, VERSION_CONFLICT: 409, SOURCE_CHANGED: 409,
  MEDIA_UNAVAILABLE: 404, INVALID_INPUT: 400, REVIEW_UNAVAILABLE: 403 };
const fail = (code, message) => Object.assign(new Error(message), { code });
const inside = (child, parent) => child === parent || child.startsWith(`${parent}${path.sep}`);
const json = (response, status, body) => send(response, status, 'application/json; charset=utf-8', Buffer.from(JSON.stringify(body)));

function send(response, status, mime, bytes, extra = {}) {
  response.writeHead(status, {
    'Content-Type': mime, 'Content-Length': bytes.length,
    'Cache-Control': 'no-store, max-age=0', Pragma: 'no-cache',
    'Referrer-Policy': 'no-referrer', 'X-Content-Type-Options': 'nosniff',
    'Content-Security-Policy': CSP, 'Cross-Origin-Resource-Policy': 'same-origin',
    'Vary': 'Cookie, Origin, Sec-Fetch-Site', ...extra,
  });
  response.end(bytes);
}

async function boundedBody(request, maxBytes = 4096) {
  const chunks = [];
  let total = 0;
  for await (const chunk of request) {
    total += chunk.length;
    if (total > maxBytes) throw fail('INVALID_INPUT', 'Request exceeds local limit');
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString('utf8');
}

function parseCookie(request, name) {
  const raw = request.headers.cookie || '';
  const values = raw.split(';').map(item => item.trim()).filter(item => item.startsWith(`${name}=`));
  return values.length === 1 ? values[0].slice(name.length + 1) : null;
}

function sameOrigin(request, origin, { mutation = false } = {}) {
  if (request.headers.host !== new URL(origin).host) throw fail('FORBIDDEN', 'Unexpected Host');
  if (request.headers.origin && request.headers.origin !== origin) throw fail('FORBIDDEN', 'Unexpected Origin');
  if (mutation && request.headers.origin !== origin) throw fail('FORBIDDEN', 'Origin required');
  if (request.headers['sec-fetch-site'] !== 'same-origin') throw fail('FORBIDDEN', 'Same-origin browser request required');
}

async function buildStaticAllowlist(candidateRoot) {
  for (const segment of ['dist', 'dist/client']) {
    if ((await lstat(path.join(candidateRoot, segment))).isSymbolicLink()) {
      throw fail('FORBIDDEN', 'Built output contains a symlink ancestor');
    }
  }
  const dist = await realpath(path.join(candidateRoot, 'dist/client'));
  if (!inside(dist, candidateRoot)) throw fail('FORBIDDEN', 'Built output escaped candidate');
  const files = new Map();
  const queue = [{ absolute: dist, relative: '' }];
  let totalBytes = 0;
  while (queue.length) {
    const directory = queue.shift();
    for (const entry of await readdir(directory.absolute, { withFileTypes: true })) {
      const absolute = path.join(directory.absolute, entry.name);
      const relative = directory.relative ? `${directory.relative}/${entry.name}` : entry.name;
      const metadata = await lstat(absolute);
      if (metadata.isSymbolicLink() || relative.startsWith('.') || relative.includes('/.') ||
          relative.includes('..') || relative.includes('\\')) throw fail('INVALID_INPUT', 'Unsafe static output');
      if (metadata.isDirectory()) {
        queue.push({ absolute, relative });
      } else if (metadata.isFile() && STATIC_EXTENSION.test(relative) && metadata.size <= 12_000_000) {
        const bytes = await readFile(absolute);
        totalBytes += bytes.length;
        if (totalBytes > 80_000_000 || files.size >= 500) throw fail('INVALID_INPUT', 'Static output exceeds limit');
        files.set(relative, { absolute, sha256: sha256(bytes), bytes: bytes.length });
      } else {
        throw fail('INVALID_INPUT', 'Unexpected static artifact');
      }
    }
  }
  if (!files.has('index.html')) throw fail('INVALID_INPUT', 'Built index is missing');
  return { dist, files };
}

async function staticFile(allowlist, urlPath) {
  if (urlPath.includes('\\') || /(?:%2e|%2f|%5c|@fs|\.map|service-worker|sw\.js)/i.test(urlPath)) {
    throw fail('NOT_FOUND', 'Path unavailable');
  }
  const decoded = decodeURIComponent(urlPath);
  if (decoded.includes('..') || decoded.startsWith('/.') || decoded.includes('//')) throw fail('NOT_FOUND', 'Path unavailable');
  const relative = decoded === '/' ? 'index.html' : decoded.slice(1);
  if (!/^[A-Za-z0-9_./-]+$/.test(relative) || !STATIC_EXTENSION.test(relative)) {
    throw fail('NOT_FOUND', 'Static type unavailable');
  }
  const pin = allowlist.files.get(relative);
  if (!pin) throw fail('NOT_FOUND', 'Static artifact is not in startup allowlist');
  const absolute = pin.absolute;
  const resolved = await realpath(absolute);
  if (!inside(resolved, allowlist.dist) || !(await stat(resolved)).isFile() ||
      (await lstat(absolute)).isSymbolicLink()) throw fail('NOT_FOUND', 'Path unavailable');
  const bytes = await readFile(resolved);
  if (bytes.length !== pin.bytes || sha256(bytes) !== pin.sha256) throw fail('SOURCE_CHANGED', 'Static output changed since start');
  const mime = relative.endsWith('.html') ? 'text/html; charset=utf-8' :
    relative.endsWith('.js') ? 'text/javascript; charset=utf-8' :
      relative.endsWith('.css') ? 'text/css; charset=utf-8' :
        relative.endsWith('.svg') ? 'image/svg+xml' :
          relative.endsWith('.png') ? 'image/png' :
            relative.endsWith('.webp') ? 'image/webp' :
              relative.endsWith('.avif') ? 'image/avif' :
                relative.endsWith('.gif') ? 'image/gif' :
                  relative.endsWith('.ico') ? 'image/x-icon' :
                    relative.endsWith('.woff') ? 'font/woff' :
                      relative.endsWith('.woff2') ? 'font/woff2' : 'image/jpeg';
  return { mime, bytes };
}

export async function createLocalReviewServer({ mode, candidateRoot, repoRoot, privateRoot, port, now, bootstrapTtlMs = 5 * 60_000 }) {
  if (!Number.isInteger(port) || port < 0 || port > 65535) throw fail('INVALID_INPUT', 'Local port required');
  if (!Number.isInteger(bootstrapTtlMs) || bootstrapTtlMs < 1 || bootstrapTtlMs > 5 * 60_000) {
    throw fail('INVALID_INPUT', 'Bounded bootstrap lifetime required');
  }
  if (!['fictional_rehearsal', 'owner_local_preview'].includes(mode)) throw fail('INVALID_INPUT', 'Fixed mode required');
  const candidate = await realpath(candidateRoot);
  const staticAllowlist = await buildStaticAllowlist(candidate);
  const root = await realpath(repoRoot);
  const privateParent = path.resolve(privateRoot);
  if (inside(privateParent, candidate) || !inside(privateParent, root)) {
    throw fail('INVALID_INPUT', 'Private bootstrap directory must be outside candidate and inside workspace');
  }
  const relativePrivate = path.relative(root, privateParent);
  let ancestor = root;
  for (const segment of relativePrivate.split(path.sep)) {
    ancestor = path.join(ancestor, segment);
    try {
      if ((await lstat(ancestor)).isSymbolicLink()) throw fail('FORBIDDEN', 'Private bootstrap path contains a symlink');
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
  }
  await mkdir(privateParent, { recursive: true });
  const resolvedPrivate = await realpath(privateParent);
  if (!inside(resolvedPrivate, root) || inside(resolvedPrivate, candidate)) {
    throw fail('FORBIDDEN', 'Private bootstrap path escaped workspace');
  }
  const privateDir = await mkdtemp(path.join(resolvedPrivate, 'review-'));
  const snapshot = mode === 'owner_local_preview'
    ? JSON.parse(await readFile(path.join(candidate, 'server/contentReview/selectedSnapshot.json'), 'utf8'))
    : null;
  const adapter = mode === 'owner_local_preview' ? createCanonicalAdapter({ repoRoot: root, snapshot }) : null;
  const model = createReviewModel({ mode, adapter, now });
  const cookieName = `mcy_review_${randomBytes(12).toString('hex')}`;
  const pending = new Map();
  const purposes = mode === 'owner_local_preview'
    ? [['owner', 'local-owner-machine']]
    : [['author', 'fictional-author'], ['reviewer', 'fictional-reviewer']];
  const bootstrapFiles = [];
  for (const [purpose, actor] of purposes) {
    const token = randomBytes(32);
    const file = path.join(privateDir, `${purpose}.cap`);
    await writeFile(file, `${token.toString('hex')}\n`, { mode: 0o600, flag: 'wx' });
    pending.set(purpose, { actor, token, file, expires: Date.now() + bootstrapTtlMs });
    bootstrapFiles.push({ purpose, path: file });
  }
  let origin;
  const server = createServer(async (request, response) => {
    try {
      if (request.headers.host !== new URL(origin).host) throw fail('FORBIDDEN', 'Unexpected Host');
      const raw = request.url || '/';
      if (/[%]2e|[%]2f|[%]5c|\\/i.test(raw)) throw fail('NOT_FOUND', 'Encoded path unavailable');
      const url = new URL(raw, origin);
      const pathname = url.pathname;
      if (pathname.startsWith(BASE)) {
        if (pathname === `${BASE}/bootstrap` && request.method === 'GET') {
          const form = '<!doctype html><meta charset="utf-8"><title>Local review access</title><h1>Local review access</h1><form method="post"><label>One-use local capability <input name="capability" type="password" autocomplete="off" required></label><button>Continue</button></form>';
          return send(response, 200, 'text/html; charset=utf-8', Buffer.from(form));
        }
        if (pathname === `${BASE}/bootstrap` && request.method === 'POST') {
          sameOrigin(request, origin, { mutation: true });
          if (!/^application\/x-www-form-urlencoded(?:;|$)/i.test(request.headers['content-type'] || '')) throw fail('INVALID_INPUT', 'Bootstrap form required');
          const body = new URLSearchParams(await boundedBody(request, 256));
          const candidateToken = body.get('capability');
          if (!/^[a-f0-9]{64}$/.test(candidateToken || '')) throw fail('FORBIDDEN', 'Invalid local capability');
          let matched = null;
          for (const [purpose, item] of pending) {
            if (Date.now() < item.expires && timingSafeEqual(Buffer.from(candidateToken, 'hex'), item.token)) {
              matched = { purpose, item }; break;
            }
          }
          if (!matched) throw fail('FORBIDDEN', 'Invalid or expired local capability');
          pending.delete(matched.purpose);
          await rm(matched.item.file, { force: true });
          const lease = model.issueLease(matched.item.actor);
          response.writeHead(303, {
            Location: '/?workspace=unit-review&mode=web',
            'Set-Cookie': `${cookieName}=${lease.id}; HttpOnly; SameSite=Strict; Path=/; Max-Age=900`,
            'Cache-Control': 'no-store, max-age=0', Pragma: 'no-cache',
            'Referrer-Policy': 'no-referrer', 'Content-Security-Policy': CSP,
          });
          return response.end();
        }
        sameOrigin(request, origin, { mutation: request.method === 'POST' });
        const id = parseCookie(request, cookieName);
        if (pathname === `${BASE}/session` && request.method === 'GET') {
          try { return json(response, 200, model.session(id)); }
          catch { return json(response, 200, { authenticated: false, mode: null,
            bootstrapPath: `${BASE}/bootstrap`, epoch: null, expiresAt: null,
            actorLabel: null, permissions: [] }); }
        }
        if (!id) throw fail('SESSION_REQUIRED', 'Local review session required');
        if (pathname === `${BASE}/units` && request.method === 'GET') {
          const epoch = model.requireLease(id, 'list').epoch;
          const result = await model.list(id);
          await model.verifySource();
          for (const item of result.items) model.requireCurrentSource(item.sourceHash);
          model.requireLease(id, 'list', undefined, epoch);
          return json(response, 200, result);
        }
        const match = pathname.match(/^\/__mcy_review\/v1\/units\/([A-Za-z0-9_-]+)(?:\/(assets\/([A-Za-z0-9_-]+)|notes|draft|review))?$/);
        if (!match) throw fail('NOT_FOUND', 'Endpoint unavailable');
        const key = match[1];
        const operation = match[2];
        if (!operation && request.method === 'GET') {
          const epoch = model.requireLease(id, 'read', key).epoch;
          const result = await model.read(id, key);
          await model.verifySource(key);
          model.requireCurrentSource(result.unit.sourceHash);
          model.requireLease(id, 'read', key, epoch);
          return json(response, 200, result);
        }
        if (operation?.startsWith('assets/') && request.method === 'GET') {
          const epoch = model.requireLease(id, 'asset', key).epoch;
          const asset = await model.asset(id, key, match[3]);
          await model.verifySource(key, match[3]);
          model.requireCurrentSource(asset.sourceHash);
          model.requireLease(id, 'asset', key, epoch);
          return send(response, 200, asset.mime, asset.bytes);
        }
        if (request.method !== 'POST' || !['notes', 'draft', 'review'].includes(operation)) throw fail('NOT_FOUND', 'Endpoint unavailable');
        if (request.headers['x-mcy-review-intent'] !== '1' ||
            !/^application\/json(?:;|$)/i.test(request.headers['content-type'] || '')) throw fail('FORBIDDEN', 'JSON intent required');
        const body = JSON.parse(await boundedBody(request));
        const permission = operation === 'notes' ? 'note' : operation;
        const epoch = model.requireLease(id, permission, key).epoch;
        const result = operation === 'notes' ? await model.note(id, key, body)
          : operation === 'draft' ? await model.draft(id, key, body)
            : await model.review(id, key, body);
        await model.verifySource(key);
        model.requireCurrentSource(result.unit.sourceHash);
        model.requireLease(id, permission, key, epoch);
        return json(response, 200, result);
      }
      if (request.method !== 'GET' && request.method !== 'HEAD') throw fail('NOT_FOUND', 'Static method unavailable');
      const file = await staticFile(staticAllowlist, pathname);
      return send(response, 200, file.mime, request.method === 'HEAD' ? Buffer.alloc(0) : file.bytes);
    } catch (error) {
      if (response.headersSent) return response.end();
      const code = error?.code && errorStatus[error.code] ? error.code : 'REVIEW_UNAVAILABLE';
      return json(response, errorStatus[code], { code, message: code === 'REVIEW_UNAVAILABLE' ? 'Local review unavailable' : error.message });
    }
  });
  try {
    await new Promise((resolve, reject) => {
      server.once('error', reject);
      server.listen(port, '127.0.0.1', () => {
        origin = `http://127.0.0.1:${server.address().port}`;
        resolve();
      });
    });
  } catch (error) {
    model.close();
    await rm(privateDir, { recursive: true, force: true });
    throw error;
  }
  async function close() {
    model.close();
    server.closeAllConnections();
    await new Promise(resolve => server.close(resolve));
    await rm(privateDir, { recursive: true, force: true });
  }
  return { server, model, origin, bootstrapFiles, close, privateDir };
}
