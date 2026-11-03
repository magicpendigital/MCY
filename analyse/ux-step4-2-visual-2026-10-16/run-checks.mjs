import fs from 'node:fs';import path from 'node:path';import {spawnSync} from 'node:child_process';import {isolatePlaywrightTestEnvironment} from '../../scripts/playwright-test-environment.mjs';
const root=process.cwd(),candidate=path.join(root,'.vercel/ux-step4-2-visual-20261016'),dir=path.join(root,'analyse/ux-step4-2-visual-2026-10-16');
for(const k of Object.keys(process.env))if(k.startsWith('VITE_'))delete process.env[k];isolatePlaywrightTestEnvironment();
const checks=[];
for(const [name,args] of [['runtime',['scripts/check-mobile-runtime.mjs']],['catalogue',['scripts/check-reviewed-practice-catalog.mjs']],['typecheck',[path.join(root,'node_modules/typescript/bin/tsc')]],['build',[path.join(root,'node_modules/vite/bin/vite.js'),'build']],['sites-prep',['scripts/prepare-sites-build.mjs']],['bundle',['scripts/check-client-bundle-secrets.mjs']],['sites-isolation',['--test','tests/sites-worker.test.mjs','tests/playwright-test-environment.test.mjs']]]){const r=spawnSync(process.execPath,args,{cwd:candidate,encoding:'utf8'});fs.writeFileSync(path.join(dir,name+'.log'),r.stdout+r.stderr);checks.push({name,command:['node',...args].join(' '),cwd:candidate,exitCode:r.status});}
fs.writeFileSync(path.join(dir,'checks.json'),JSON.stringify(checks,null,2)+'\n');console.log(checks);
if(checks.some(x=>x.exitCode!==0))process.exitCode=1;
