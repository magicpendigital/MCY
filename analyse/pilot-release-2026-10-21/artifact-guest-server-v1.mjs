// Preparatory exact-artifact guest viewer. Invoke only after independent QC/root GO.
import { createServer } from 'node:http';
import { createHash } from 'node:crypto';
import { existsSync, lstatSync, readFileSync, realpathSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const evidence = 'D:/Projects/MCY/analyse/pilot-release-2026-10-21';
const receiptPath = path.join(evidence, 'GUEST-ARTIFACT-SERVER-v1.json');
const artifact = 'C:/Users/Admin/.codex/worktrees/pilot-web-android-20261021/MCY/.vercel/pilot-artifacts/web-common-v1/client';
const webSha = '682b13d0c525402bdc3a04e1530a76db1185a68650406741682183ae6e74906d';
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
if (process.argv.length !== 3 || process.argv[2] !== '--root-approved-guest-view') throw new Error('Explicit reviewed guest viewer invocation only');
if (existsSync(receiptPath)) throw new Error('Existing guest view receipt; do not restart automatically');
const webBytes = readFileSync(path.join(evidence, 'COMMON-WEB-v1.json'));
if (sha(webBytes) !== webSha) throw new Error('Common web receipt changed');
const web = JSON.parse(webBytes);
if (web.status !== 'PASS_COMMON_WEB_ARTIFACT_ONLY' || realpathSync(artifact).toLowerCase() !== path.resolve(artifact).toLowerCase()) throw new Error('Expected exact local artifact');
const allowed = new Map();
for (const pin of web.files.filter(item => item.path.startsWith('client/'))) {
  const relative = pin.path.slice('client/'.length);
  const file = path.resolve(artifact, relative);
  if (!file.toLowerCase().startsWith(`${path.resolve(artifact).toLowerCase()}${path.sep}`) || relative.includes('..') || lstatSync(file).isSymbolicLink() || realpathSync(file).toLowerCase() !== file.toLowerCase()) throw new Error('Unsafe artifact path');
  const bytes = readFileSync(file); if (bytes.length !== pin.bytes || sha(bytes) !== pin.sha256) throw new Error('Artifact changed');
  allowed.set(`/${relative}`, { ...pin, file });
}
if (allowed.size !== 59 || !allowed.has('/index.html')) throw new Error('Unexpected common client inventory');
const csp = "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-src 'none'; worker-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'";
const counts = { requests: 0, served: 0, denied: 0, sourceChanged: 0 };
const startedUtc = new Date().toISOString();
const lifetimeMs = 15 * 60_000;
let stopping = false;
const server = createServer({ maxHeaderSize: 8192 }, (request, response) => {
  counts.requests++;
  const headers = { 'Cache-Control': 'no-store, max-age=0', 'Content-Security-Policy': csp, 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer', 'Cross-Origin-Resource-Policy': 'same-origin' };
  const deny = status => { counts.denied++; response.writeHead(status, { ...headers, 'Content-Length': '0' }); response.end(); };
  if (!['GET', 'HEAD'].includes(request.method) || request.headers.host !== '127.0.0.1:4288' || typeof request.url !== 'string' || request.url.length > 2048) { deny(405); return; }
  let url; try { url = new URL(request.url, 'http://127.0.0.1:4288'); } catch { deny(400); return; }
  if (url.origin !== 'http://127.0.0.1:4288' || /%2e|%2f|%5c|\\/i.test(request.url) || !['', '?mode=web', '?mode=review&device=iphone', '?mode=review&device=pixel-10'].includes(url.search)) { deny(400); return; }
  const target = url.pathname === '/' ? '/index.html' : url.pathname;
  const pin = allowed.get(target);
  if (!pin) { deny(404); return; }
  let bytes;
  try {
    if (lstatSync(pin.file).isSymbolicLink() || realpathSync(pin.file).toLowerCase() !== pin.file.toLowerCase()) throw new Error('Artifact path changed');
    bytes = readFileSync(pin.file);
  } catch { counts.sourceChanged++; deny(409); return; }
  if (bytes.length !== pin.bytes || sha(bytes) !== pin.sha256) { counts.sourceChanged++; deny(409); return; }
  const mime = target.endsWith('.html') ? 'text/html; charset=utf-8' : target.endsWith('.js') ? 'text/javascript; charset=utf-8' : target.endsWith('.css') ? 'text/css; charset=utf-8' : target.endsWith('.svg') ? 'image/svg+xml' : target.endsWith('.png') ? 'image/png' : target.endsWith('.webp') ? 'image/webp' : target.endsWith('.wav') ? 'audio/wav' : target.endsWith('.woff2') ? 'font/woff2' : 'application/octet-stream';
  counts.served++; response.writeHead(200, { ...headers, 'Content-Type': mime, 'Content-Length': bytes.length }); response.end(request.method === 'HEAD' ? undefined : bytes);
});
server.requestTimeout = 5000; server.headersTimeout = 5000; server.keepAliveTimeout = 1000;
let timer;
async function stop(reason) {
  if (stopping) return; stopping = true; clearTimeout(timer);
  await new Promise(resolve => { server.close(resolve); server.closeAllConnections(); });
  const result = { status: 'CLOSED_LOCAL_GUEST_ARTIFACT_VIEW', startedUtc, endedUtc: new Date().toISOString(), reason, webReceiptSha256: webSha, artifact, fileCount: allowed.size, counts, lifetimeMs, csp, headersBodiesCookiesQueriesLogged: false, sourceRewritten: false, remoteFetchOrProviderOrAuthOrDataWriteOrDeviceOrDeployActions: 0 };
  writeFileSync(receiptPath, `${JSON.stringify(result, null, 2)}\n`, { flag: 'wx' });
  process.stdout.write(`${JSON.stringify({ status: result.status, receiptPath })}\n`);
}
for (const signal of ['SIGINT', 'SIGTERM']) process.once(signal, () => { void stop(signal); });
await new Promise((resolve, reject) => { server.once('error', reject); server.listen(4288, '127.0.0.1', resolve); });
timer = setTimeout(() => { void stop('FIXED_15_MINUTE_LIMIT'); }, lifetimeMs);
process.stdout.write(`${JSON.stringify({ status: 'LOCAL_GUEST_VIEW_ONLY', pid: process.pid, url: 'http://127.0.0.1:4288/?mode=web', webReceiptSha256: webSha, fileCount: allowed.size, lifetimeMs })}\n`);
