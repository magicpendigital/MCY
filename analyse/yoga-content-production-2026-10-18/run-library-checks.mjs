import {spawnSync} from 'node:child_process';
import {writeFile,mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const here=path.dirname(fileURLToPath(import.meta.url)),repo=path.resolve(here,'../..');
const label=process.argv.find(v=>v.startsWith('--label='))?.slice(8)??'current';
if(!/^[a-z0-9-]+$/.test(label))throw new Error('Invalid evidence label');
const commands=[['validate-library.mjs'],['--test','validate-library.test.mjs'],['render-library.mjs',...(process.argv.includes('--render')?[]:['--check'])],['validate-expansion-catalog.mjs'],['--test','validate-expansion-catalog.test.mjs']];
const records=[];
for(const command of commands){const args=command.map(arg=>arg.endsWith('.mjs')?path.join(here,arg):arg),result=spawnSync(process.execPath,args,{cwd:repo,encoding:'utf8',timeout:120000,maxBuffer:16*1024*1024}),name=command.find(arg=>arg.endsWith('.mjs')).replace('.mjs',''),logPath=path.join(here,`${label}-${name}.log`);await writeFile(logPath,(result.stdout??'')+(result.stderr??''));const record={command:[process.execPath,...args],exitCode:result.status,signal:result.signal,error:result.error?.message??null,status:result.status===0&&!result.error?'PASS':'FAIL',log:path.relative(repo,logPath).split(path.sep).join('/')};records.push(record);console.log(JSON.stringify(record));if(record.status!=='PASS')break;}
const output={recordedAt:new Date().toISOString(),phase:label,environment:'local Node.js fictional data checks only',checks:records,status:records.length===commands.length&&records.every(r=>r.status==='PASS')?'PASS':'FAIL'};await writeFile(path.join(here,`${label}-checks.json`),JSON.stringify(output,null,2)+'\n');if(output.status!=='PASS')process.exitCode=1;
