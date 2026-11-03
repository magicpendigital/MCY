import { createServer, request as localRequest } from 'node:http';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

// Test transport only. No remote destination, header, body or capability is recorded.
export async function startReviewEgressGuard({ port, allowedOrigin, receiptPath }) {
  const target = new URL(allowedOrigin);
  if (target.protocol !== 'http:' || target.hostname !== '127.0.0.1' || !target.port ||
      !Number.isInteger(port) || port < 1024 || port > 65535) throw new Error('Explicit loopback test proxy configuration required.');
  const connectCategories = { loopbackExpected: 0, invalidBackend: 0, other: 0 };
  const counts = { forwarded: 0, deniedHttp: 0, deniedConnect: 0, deniedUpgrade: 0, capExceeded: 0, localTransportErrors: 0 };
  const startedAt = new Date().toISOString();
  const sockets = new Set();
  let requests = 0;
  const cap = 10_000;
  const withinCap = () => { requests++; if (requests <= cap) return true; counts.capExceeded++; return false; };
  const deny = response => { response.writeHead(403, { 'Content-Type': 'text/plain', 'Cache-Control': 'no-store', Connection: 'close' }); response.end('Test egress denied'); };
  const server = createServer(async (incoming, response) => {
    if (!withinCap()) { counts.deniedHttp++; deny(response); return; }
    let url;
    try { url = new URL(incoming.url); } catch { counts.deniedHttp++; deny(response); return; }
    if (url.origin !== target.origin || url.username || url.password ||
        !['GET', 'HEAD', 'POST'].includes(incoming.method)) {
      counts.deniedHttp++; deny(response); return;
    }
    const chunks = [];
    let bytes = 0;
    try {
      for await (const chunk of incoming) {
        bytes += chunk.length;
        if (bytes > 16_384) { counts.deniedHttp++; deny(response); return; }
        chunks.push(chunk);
      }
    } catch { counts.localTransportErrors++; response.destroy(); return; }
    const headers = { ...incoming.headers, host: target.host, connection: 'close' };
    delete headers['proxy-authorization']; delete headers['proxy-connection'];
    counts.forwarded++;
    const forwarded = localRequest({ hostname: '127.0.0.1', port: Number(target.port), method: incoming.method,
      path: `${url.pathname}${url.search}`, headers, timeout: 10_000 }, upstream => {
      response.writeHead(upstream.statusCode ?? 502, upstream.headers);
      upstream.pipe(response);
      upstream.on('error', () => { counts.localTransportErrors++; response.destroy(); });
    });
    forwarded.on('timeout', () => forwarded.destroy());
    forwarded.on('error', () => { counts.localTransportErrors++; if (!response.headersSent) response.writeHead(502); response.end(); });
    response.on('close', () => forwarded.destroy());
    forwarded.end(Buffer.concat(chunks));
  });
  server.on('connection', socket => {
    sockets.add(socket);
    // A client may reset a denied CONNECT/upgrade socket after receiving 403.
    // The deny counters remain authoritative; cancellation must not crash the proxy.
    socket.on('error', () => {});
    socket.on('close', () => sockets.delete(socket));
  });
  server.on('connect', (_request, socket) => {
    let category='other';
    try { const authority=new URL('http://' + _request.url); if(authority.hostname==='127.0.0.1' && authority.port===target.port) category='loopbackExpected'; else if(authority.hostname==='mcy-playwright.invalid') category='invalidBackend'; } catch {}
    connectCategories[category]++;
    withinCap(); counts.deniedConnect++; socket.end('HTTP/1.1 403 Forbidden\r\nConnection: close\r\n\r\n'); });
  server.on('upgrade', (_request, socket) => { withinCap(); counts.deniedUpgrade++; socket.end('HTTP/1.1 403 Forbidden\r\nConnection: close\r\n\r\n'); });
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(port, '127.0.0.1', resolve); });
  return {
    async close() {
      const stopped = new Promise(resolve => server.close(resolve));
      for (const socket of sockets) socket.destroy();
      await stopped;
      const unexpected = counts.deniedHttp + counts.deniedConnect + counts.deniedUpgrade + counts.capExceeded;
      const receipt = { scope: 'FICTIONAL_UI_TEST_EGRESS_ONLY', allowedOrigin: target.origin, proxyOrigin: `http://127.0.0.1:${port}`,
        startedAt, endedAt: new Date().toISOString(), requestCap: cap, requestBodyCapBytes: 16_384,
        counts, connectCategories, unexpected, status: unexpected ? 'FAIL_UNEXPECTED_EGRESS_OR_CAP' : 'NO_UNEXPECTED_EGRESS',
        recordedDestinations: false, recordedHeadersOrBodies: false };
      await mkdir(dirname(receiptPath), { recursive: true });
      await writeFile(receiptPath, `${JSON.stringify(receipt, null, 2)}\n`, 'utf8');
      return receipt;
    },
  };
}
