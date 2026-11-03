// Only run after independent R3 and root exact GO. Fixture build is separate from delivery artifacts.
import path from 'node:path';
import { createHash } from 'node:crypto';
import { createServer } from 'node:http';
import { existsSync, lstatSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { build } from 'file:///C:/Users/Admin/.codex/worktrees/pilot-web-android-20261021/MCY/node_modules/vite/dist/node/index.js';
import { startReviewEgressGuard } from './critical-egress-guard-v2.mjs';
const tree='C:/Users/Admin/.codex/worktrees/pilot-web-android-20261021/MCY';
const sha=b=>createHash('sha256').update(b).digest('hex');
export default async function setup(){
 if(process.env.VITE_SUPABASE_URL!=='https://mcy-playwright.invalid'||process.env.VITE_SUPABASE_PUBLISHABLE_KEY!=='sb_publishable_mcy_playwright_fixture')throw new Error('Invalid fixture only');
 if(readdirSync(tree).some(n=>n.startsWith('.env')&&n!=='.env.example'))throw new Error('Unexpected environment filename; no read');
 const out=path.join(tree,'.vercel/critical-fixtures-v2');
 if(existsSync(out))throw new Error('Existing output: no retry');mkdirSync(out,{recursive:true});
 const buildDir=path.join(out,'build');const envDir=path.join(out,'empty-env');mkdirSync(envDir);
 await build({root:tree,envDir,configFile:path.join(tree,'vite.config.ts'),configLoader:'runner',build:{outDir:buildDir,emptyOutDir:false}});
 const files=new Map();let total=0;
 function walk(dir){for(const entry of readdirSync(dir,{withFileTypes:true})){const file=path.join(dir,entry.name);if(lstatSync(file).isSymbolicLink())throw new Error('Built link');if(entry.isDirectory())walk(file);else{const bytes=readFileSync(file);total+=bytes.length;if(total>80*1024*1024||files.size>=1000)throw new Error('Built inventory cap');files.set('/'+path.relative(buildDir,file).replaceAll('\\','/'),bytes);}}}walk(buildDir);
 if(!files.has('/index.html'))throw new Error('Missing fixture index');
 writeFileSync(path.join(out,'build-inventory.json'),JSON.stringify({kind:'INVALID_BACKEND_FIXTURE_ONLY_NOT_DELIVERY',files:[...files].map(([pathname,b])=>({pathname,bytes:b.length,sha256:sha(b)}))},null,2)+'\n',{flag:'wx'});
 const guard=await startReviewEgressGuard({port:4293,allowedOrigin:'http://127.0.0.1:4292',receiptPath:path.join(out,'egress.json')});
 const sockets=new Set();
 const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg','.woff2':'font/woff2','.mp4':'video/mp4'};
 const server=createServer((req,res)=>{
  const finish=(status,body='')=>{res.writeHead(status,{'Cache-Control':'no-store','Content-Type':'text/plain'});res.end(body);};
  if(!['GET','HEAD'].includes(req.method))return finish(405);
  if(req.headers.host!=='127.0.0.1:4292')return finish(400);
  let url;try{url=new URL(req.url,'http://127.0.0.1:4292');}catch{return finish(400);}
  let pathname=url.pathname;if(pathname==='/'||pathname==='/auth/callback')pathname='/index.html';
  const bytes=files.get(pathname);if(!bytes)return finish(404);
  res.writeHead(200,{'Content-Type':mime[path.extname(pathname)]||'application/octet-stream','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; media-src 'self'; connect-src 'self' https://mcy-playwright.invalid; frame-src 'none'; object-src 'none'; base-uri 'self'; form-action 'self'"});res.end(req.method==='HEAD'?undefined:bytes);
 });
 server.on('connection',socket=>{sockets.add(socket);socket.on('error',()=>{});socket.on('close',()=>sockets.delete(socket));});
 try{await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(4292,'127.0.0.1',resolve);});}catch(cause){await guard.close();throw cause;}
 return async()=>{const closed=new Promise(resolve=>server.close(resolve));for(const s of sockets)s.destroy();await closed;const receipt=await guard.close();if(receipt.unexpected)throw new Error(`Fixture deny proxy observed ${receipt.unexpected} unexpected requests`);};
}
