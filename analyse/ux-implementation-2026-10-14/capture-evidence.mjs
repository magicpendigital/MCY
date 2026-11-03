import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import assert from 'node:assert/strict';
const root=path.resolve(import.meta.dirname,'../..');
const out=import.meta.dirname;
const candidate=path.join(root,'.vercel/ux-implementation-20261014');
const baseline=JSON.parse(fs.readFileSync(path.join(out,'baseline.json'),'utf8'));
const sha=p=>createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const unchangedRoot=[],changes=[],concurrentDocumentation=[];
for(const input of baseline.inputs){
  const rootSha=sha(path.join(root,input.path));
  if(rootSha!==input.sha256){
    assert(input.path==='AGENTS.md'&&input.sha256==='b300e5c647d5c01ed8373ffce12c2f867638e6ae4fa5f318a5d84413365db51f'&&rootSha==='cd51d9bf588d36cabde52dec56a9d57c01ec2c45e0df6c74ec539d41c264876c','Unreconciled root drift');
    concurrentDocumentation.push({path:input.path,baselineSha256:input.sha256,currentSha256:rootSha,reason:'Separate native operation added8checkpoint lines during this task. Inspected exact diff; no UX action inferred. Baseline remains unchanged.'});
  }else unchangedRoot.push(input.path);
  const finalSha=sha(path.join(candidate,input.path));
  if(finalSha!==input.sha256)changes.push({...input,candidateSha256:finalSha});
}
const additions=['tests/ux-save-feedback.spec.ts','tests/ux-journey-selection.spec.ts'];
let patch='';
for(const item of changes){
  const result=spawnSync('C:/Program Files/Git/cmd/git.exe',['--no-pager','diff','--no-index','--no-ext-diff','--no-color','--',item.path,`.vercel/ux-implementation-20261014/${item.path}`],{cwd:root,encoding:'utf8',windowsHide:true});
  assert(result.status===1&&result.stdout.startsWith('diff --git'),`Diff failed: ${item.path}`);
  patch+=result.stdout.replaceAll('b/.vercel/ux-implementation-20261014/','b/');
}
for(const name of additions){
  const body=fs.readFileSync(path.join(candidate,name),'utf8').replaceAll('\r\n','\n');
  const lines=(body.endsWith('\n')?body.slice(0,-1):body).split('\n');
  patch+=`diff --git a/${name} b/${name}\nnew file mode 100644\n--- /dev/null\n+++ b/${name}\n@@ -0,0 +1,${lines.length} @@\n${lines.map(l=>'+'+l).join('\n')}\n`;
}
fs.writeFileSync(path.join(out,'ux-candidate.patch'),patch);
const ui=JSON.parse(fs.readFileSync(path.join(out,'ui-results.json'),'utf8'));
const artifactFiles=[];
function walk(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,e.name);if(e.isDirectory())walk(p);else artifactFiles.push({path:path.relative(candidate,p).replaceAll('\\','/'),bytes:fs.statSync(p).size,sha256:sha(p)});}}
walk(path.join(candidate,'dist'));
const evidence={recordedAt:new Date().toISOString(),scope:'Isolated local UX candidate; no integration, native install, live writes, release or AI inference',candidate,rootInputsVerifiedUnchanged:unchangedRoot.length,changes,additions:additions.map(p=>({path:p,sha256:sha(path.join(candidate,p))})),patchSha256:sha(path.join(out,'ux-candidate.patch')),ui:{stats:ui.stats,processExitCode:Number(process.argv[2]),reportSha256:sha(path.join(out,'ui-results.json'))},build:{command:'npm run build',exitCode:0,logSha256:sha(path.join(out,'build-final.log')),runtimeProtectedFiles:28,reviewedSessions:0,bundleScannerTextFiles:23,sitesTests:4,isolationTests:1},rootContractBaseline:{command:'node --test tests/checkin-consent-migration.test.mjs',passed:4,exitCode:0,scope:'unchanged root migration/client contract; candidate migrations were not copied or executed'},screenshots:['03-final-draft-360.jpg','04-final-journey-empty-360.jpg','05-final-notifications-360.jpg'].map(p=>({path:p,sha256:sha(path.join(out,p))})),artifactFiles,limitations:['No physical Android/iOS test','No live Auth/consent/check-in or other cloud effect','No full screen-reader, 200% text or native serif fallback acceptance','Closed native trial remains FAIL; pending exact14Oct operation unchanged','No content expertise/rights approval; reviewed catalog remains empty','Vite main chunk exceeds500kB warning remains'],rolloutStatus:'NOT_INTEGRATED_NOT_RELEASED'};
evidence.concurrentDocumentation=concurrentDocumentation;
fs.writeFileSync(path.join(out,'evidence.json'),JSON.stringify(evidence,null,2)+'\n');
console.log(JSON.stringify({rootInputsUnchanged:unchangedRoot.length,changedFiles:changes.length,newTests:additions.length,ui:ui.stats,artifacts:artifactFiles.length,patchSha256:evidence.patchSha256}));
