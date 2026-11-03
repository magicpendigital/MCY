import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
const root = path.resolve(process.cwd());
assert(root.toLowerCase() === 'd:\\projects\\mcy');
const target = path.join(root, '.vercel/ux-implementation-20261014');
assert(!fs.existsSync(target), 'Candidate already exists; inspect stored state, never overwrite.');
fs.mkdirSync(target, {recursive:true});
const dirs = ['src','public','design-system','brand','tests','scripts','worker','.openai','supabase/functions','docs/content-review'];
const files = ['AGENTS.md','package.json','package-lock.json','tsconfig.json','vite.config.ts','playwright.config.ts','mobile-runtime.lock.json','index.html'];
for (const name of dirs) fs.cpSync(path.join(root,name),path.join(target,name),{recursive:true,force:false,errorOnExist:true,filter:p=>!/(^|[\\/])\.env(?:\.|$)/.test(p)});
for (const name of files) if(fs.existsSync(path.join(root,name))) fs.copyFileSync(path.join(root,name),path.join(target,name),fs.constants.COPYFILE_EXCL);
const sha = p => createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const inputs=[];
function walk(p){for(const entry of fs.readdirSync(p,{withFileTypes:true})){const abs=path.join(p,entry.name);if(entry.isDirectory())walk(abs);else inputs.push({path:path.relative(target,abs).replaceAll('\\','/'),sha256:sha(abs)});}}
walk(target);
fs.writeFileSync(path.join(root,'analyse/ux-implementation-2026-10-14/baseline.json'),JSON.stringify({createdAt:new Date().toISOString(),target,sourceRoot:root,environmentFilesCopied:false,inputs},null,2)+'\n');
console.log(JSON.stringify({target,files:inputs.length,envCopied:false,sourceEdits:0}));
