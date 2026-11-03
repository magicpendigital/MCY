import fs from 'node:fs';import path from 'node:path';
const d=path.resolve('analyse/ux-step4-4-2026-10-17'),out=path.join(d,process.argv[2]??'initial-focused-failure');fs.mkdirSync(out);
for(const n of ['focused.log','focused-command.json','focused-results.json'])fs.copyFileSync(path.join(d,n),path.join(out,n));
fs.cpSync(path.join(d,'test-results'),path.join(out,'test-results'),{recursive:true,filter:p=>!p.includes('.playwright-artifacts')});
console.log('Preserved initial 11/13 exit1 evidence; source edits and final checks are separate.');
