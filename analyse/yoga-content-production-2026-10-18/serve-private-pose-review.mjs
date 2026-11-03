// Read-only localhost fallback: exact 13 local originals, never a learner asset route.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const rows = [
  ['Bánh xe thấp.mov',53.522], ['Bò mèo.mov',34.761], ['Chiến binh 2.mov',46.371],
  ['Chó 3 chân.mov',32.067], ['Đầu bò.mov',47.137], ['Đứng lên thẳng lưng.mov',37.315],
  ['Hoang dã cao.mov',52.408], ['Quạ thấp.mov',38.29], ['Quỳ gối ngả sau.mov',48.461],
  ['Rắn hổ mang.mov',23.337], ['Rắng hổ mang phiên bản dễ.mov',34.668],
  ['Trường tấn cao.mov',45.79], ['V ngược (chó úp mặt).mov',52.988],
];
const sourceRoot = 'D:\\nilaza\\documents\\Tư thế lẻ';
const escape = s => s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const page = index => {
  const [file,duration] = rows[index];
  const cards = [.15,.35,.55,.8].map(f => {
    const time = +(duration*f).toFixed(3);
    return `<figure><video controls muted preload="auto" src="/video/${index}#t=${time}"></video><figcaption>Requested ${time}s · use controls to inspect</figcaption></figure>`;
  }).join('');
  return `<!doctype html><html lang="vi"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Private pose source review · ${escape(file)}</title><style>body{margin:20px;background:#eeede8;color:#20352b;font:16px system-ui}h1{font-size:22px}nav{display:flex;gap:8px;flex-wrap:wrap;margin:18px 0}a{color:inherit;padding:7px;border:1px solid #8b998b}main{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}figure{margin:0}video{display:block;width:100%;max-height:700px;background:#111}figcaption{padding:8px 0;font-size:13px}@media(max-width:800px){main{grid-template-columns:repeat(2,minmax(0,1fr))}}</style><h1>${escape(file)}</h1><p>Local original · private editorial sampling only · no expert or rights approval. YouTube binding remains unverified. Four timestamp requests do not establish full-session review.</p><nav>${rows.map((r,i)=>`<a href="/review?pose=${i}"${i===index?' aria-current="page"':''}>${i+1}. ${escape(r[0])}</a>`).join('')}</nav><main>${cards}</main></html>`;
};
const server = http.createServer((req,res) => {
  if (!['GET','HEAD'].includes(req.method)) {res.writeHead(405);res.end();return;}
  const url = new URL(req.url,'http://127.0.0.1:4318');
  if (url.pathname === '/review' || url.pathname === '/') {
    const index = Number(url.searchParams.get('pose')??7);
    if (!Number.isInteger(index) || index<0 || index>=rows.length) {res.writeHead(404);res.end();return;}
    res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store','Content-Security-Policy':"default-src 'self'; style-src 'unsafe-inline'; media-src 'self'; connect-src 'none'; frame-ancestors 'none'"});
    res.end(req.method==='HEAD'?'':page(index));return;
  }
  const match = /^\/video\/(\d+)$/.exec(url.pathname);
  if (!match || +match[1]>=rows.length) {res.writeHead(404);res.end();return;}
  const file = path.join(sourceRoot,rows[+match[1]][0]);
  const stat = fs.statSync(file);
  const headers = {'Content-Type':'video/quicktime','Accept-Ranges':'bytes','Cache-Control':'no-store'};
  let start = 0, end = stat.size-1, code=200;
  if (req.headers.range) {
    const range = /^bytes=(\d+)-(\d*)$/.exec(req.headers.range);
    if (!range) {res.writeHead(416,{'Content-Range':`bytes */${stat.size}`});res.end();return;}
    start=+range[1];end=range[2]?+range[2]:end;
    if (start>end || end>=stat.size) {res.writeHead(416,{'Content-Range':`bytes */${stat.size}`});res.end();return;}
    headers['Content-Range']=`bytes ${start}-${end}/${stat.size}`;code=206;
  }
  headers['Content-Length']=end-start+1;
  res.writeHead(code,headers);
  if (req.method==='HEAD') res.end(); else fs.createReadStream(file,{start,end}).pipe(res);
});
server.listen(4318,'127.0.0.1',()=>console.log('Private source review: http://127.0.0.1:4318/review?pose=7 (13 exact MOVs, read-only localhost)'));
