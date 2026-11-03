import {spawnSync} from 'node:child_process';import fs from 'node:fs';import path from 'node:path';
const dir=path.resolve('analyse/ux-step4-4-2026-10-17'),kind=process.argv[2]??'focused';
const args=['node_modules/@playwright/test/cli.js','test','--config',path.join(dir,'qa.playwright.config.mjs')];
if(kind==='focused')args.push('ux-course-detail.spec.ts');
else if(kind==='mapped')args.push('free-courses-contract.spec.ts','learner-ux.spec.ts','--grep','free-course source|guest can browse free|free-course screens load|learner app defers course|course guidance has honest|English learner flow|free course detail groups|inactive FlowStack|embedded lesson offers|course player timeout|short portrait keeps welcome');
else if(kind==='adjacent')args.push('ux-home.spec.ts','ux-checkin-layout.spec.ts','ux-energy-time.spec.ts','ux-save-feedback.spec.ts','ux-journey-selection.spec.ts');
else throw Error('Unknown bounded suite');
args.push('--reporter=list,json');
const env={...process.env,PLAYWRIGHT_JSON_OUTPUT_FILE:path.join(dir,kind+'-results.json')};
let cwd=process.cwd();if(kind==='adjacent'){args[0]=path.resolve(args[0]);cwd=path.join(dir,'adjacent-run');fs.mkdirSync(cwd,{recursive:true});}
const r=spawnSync(process.execPath,args,{encoding:'utf8',env,cwd});fs.writeFileSync(path.join(dir,kind+'.log'),r.stdout+r.stderr);fs.writeFileSync(path.join(dir,kind+'-command.json'),JSON.stringify({command:['node',...args].join(' '),cwd,exitCode:r.status,signal:r.signal},null,2)+'\n');console.log((r.stdout+r.stderr).slice(-14000));process.exitCode=r.status??1;
