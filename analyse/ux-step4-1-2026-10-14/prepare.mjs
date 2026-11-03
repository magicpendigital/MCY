import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
const root=process.cwd(), source=path.join(root,'.vercel/ux-implementation-20261014'), target=path.join(root,'.vercel/ux-step4-1-20261014');
// Resume only byte-identical files after the recorded initial path-guard failure.
const original=JSON.parse(fs.readFileSync(path.join(root,'analyse/ux-implementation-2026-10-14/baseline.json')));
const evidence=JSON.parse(fs.readFileSync(path.join(root,'analyse/ux-implementation-2026-10-14/evidence.json')));
const paths=[...original.inputs.map(x=>x.path),...evidence.additions.map(x=>x.path)];
assert.equal(original.inputs.length,228);assert.equal(paths.length,230);assert.equal(new Set(paths).size,230);
const sha=p=>createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const inputs=paths.map(rel=>{assert(!/(^|\/)(\.env[^/]*|\.git|dist|node_modules)(\/|$)/.test(rel));assert(!/^(android|ios)\//.test(rel));const dest=path.join(target,rel);fs.mkdirSync(path.dirname(dest),{recursive:true});if(fs.existsSync(dest))assert.equal(sha(dest),sha(path.join(source,rel)));else fs.copyFileSync(path.join(source,rel),dest,fs.constants.COPYFILE_EXCL);return {path:rel,sourceSha256:sha(path.join(source,rel)),rootSha256:fs.existsSync(path.join(root,rel))?sha(path.join(root,rel)):null};});
fs.writeFileSync(path.join(root,'analyse/ux-step4-1-2026-10-14/baseline.json'),JSON.stringify({createdAt:new Date().toISOString(),source,target,inputs},null,2)+'\n');
console.log(JSON.stringify({copied:inputs.length,target}));
