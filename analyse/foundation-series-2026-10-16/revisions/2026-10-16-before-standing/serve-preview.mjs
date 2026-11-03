import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.dirname(fileURLToPath(import.meta.url));
const pages = new Set(['review.html', 'preview.html', 'preview.css', 'preview.js', 'CONTENT-PROPOSAL.vi.md', 'UI-UX-AUDIT.vi.md', 'VISUAL-AUDIT.vi.md', 'HANDOFF.vi.md']);
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.md': 'text/plain; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml' };
http.createServer(async (req, res) => {
  if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405); res.end(); return; }
  let name;
  try { name = decodeURIComponent(new URL(req.url, 'http://127.0.0.1:4317').pathname).slice(1) || 'review.html'; }
  catch { res.writeHead(400); res.end(); return; }
  if (!pages.has(name) && !/^(assets|screenshots)\/[a-zA-Z0-9._-]+\.(png|jpg|svg)$/.test(name)) { res.writeHead(404); res.end('Not found'); return; }
  const target = path.resolve(root, name);
  if (!target.startsWith(root + path.sep)) { res.writeHead(404); res.end(); return; }
  try {
    const body = await readFile(target);
    res.writeHead(200, { 'Content-Type': types[path.extname(target)] || 'application/octet-stream', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
    res.end(req.method === 'HEAD' ? undefined : body);
  } catch { res.writeHead(404); res.end('Not found'); }
}).listen(4317, '127.0.0.1', () => process.stdout.write('Design review: http://127.0.0.1:4317/\nInteractive preview: http://127.0.0.1:4317/preview.html\n'));
