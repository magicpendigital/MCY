// Pure harness guard/syntax/pin checks. No browser or app execution.
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';import {execFileSync} from 'node:child_process';
import {controlCases,installIndependentGuard,assertIndependentLedger} from './independent-responsive-controls.mjs';
const dir=import.meta.dirname,root=path.resolve(dir,'../..'),sha=p=>createHash('sha256').update(fs.readFileSync(p)).digest('hex');
assert.equal(controlCases.length,5);assert.equal(new Set(controlCases.map(c=>c.id)).size,5);
let handler;const fake={on(){},async route(pattern,fn){assert.equal(pattern,'**/*');handler=fn;}};
const ledger=await installIndependentGuard(fake,'http://127.0.0.1:4195');
const vectors=[
 ['http://127.0.0.1:4195/src/Prototype.tsx','GET',null,'continue'],
 ['http://127.0.0.1:4195/mutation','POST',{},'abort'],
 ['https://mcy-playwright.invalid/functions/v1/mcy-ai-assistant','POST',{action:'capability'},'fulfill'],
 ['https://mcy-playwright.invalid/functions/v1/mcy-ai-assistant','POST',{action:'infer'},'abort'],
 ['https://mcy-playwright.invalid/functions/v1/mcy-ai-assistant?escape=1','POST',{action:'capability'},'abort'],
 ['https://mcy-playwright.invalid/functions/v1/mcy-ai-assistant','POST',{action:'capability',extra:true},'abort'],
 ['https://mcy-playwright.invalid/auth/v1/otp','POST',{},'abort'],
 ['https://example.com/video','GET',null,'abort'],
 ['http://127.0.0.1:4194/','GET',null,'abort'],
];
for(const[url,method,body,expected]of vectors){let action;await handler({request:()=>({url:()=>url,method:()=>method,postDataJSON:()=>body}),continue:async()=>{action='continue';},abort:async()=>{action='abort';},fulfill:async options=>{assert.deepEqual(options,{json:{available:false,contractVersion:'reviewed-practice-1'}});action='fulfill';}});assert.equal(action,expected,url);}
assert.equal(ledger.localMutations.length,1);assert.equal(ledger.unexpected.length,6);assert.equal(ledger.capabilityReads.length,1);assert.throws(()=>assertIndependentLedger(ledger));assertIndependentLedger({unexpected:[],localMutations:[],pageErrors:[]});
execFileSync(process.execPath,['--check',path.join(dir,'independent-responsive-controls.mjs')],{cwd:root,stdio:'pipe'});
const sourceFile=path.join(root,'analyse/ux-step4-6-2026-10-18/SOURCE-FREEZE-v1.json');assert.equal(sha(sourceFile),'01d45905ff401b6e127bac0bbafff03d3c66934e064f0711fcaf10deddb8db45');
const source=JSON.parse(fs.readFileSync(sourceFile));for(const p of source.appInputs)assert.equal(sha(path.resolve(root,source.candidate,p.path)),p.sha256,p.path);for(const p of source.harnessAndIntake)assert.equal(sha(path.resolve(root,p.path)),p.sha256,p.path);
const earlier=JSON.parse(fs.readFileSync(path.join(dir,'INDEPENDENT-INTAKE-SOURCE-CHECK.json')));for(const p of earlier.trackedDirty)assert.equal(sha(path.resolve(root,p.path)),p.sha256,p.path);
const report={recordedAt:new Date().toISOString(),status:'PASS_PREPARATION_ONLY_NOT_BROWSER_OR_APP_ACCEPTANCE',aggregateCases:5,pureRequestGuardVectors:vectors.length,guardRejectsUnexpected:true,syntaxCheckExit:0,accepted46AppPins:source.appInputs.length,accepted46HarnessPins:source.harnessAndIntake.length,rootTrackedDirtyHashes:earlier.trackedDirty.length,noBrowserServerOrAppInvocation:true};
fs.writeFileSync(path.join(dir,'INDEPENDENT-FINAL-CONTROL-PREPARATION-CHECK.json'),JSON.stringify(report,null,2)+'\n',{flag:'wx'});
const files=['INDEPENDENT-FINAL-CONTROL-PLAN.vi.md','independent-responsive-controls.mjs','check-independent-responsive-preparation.mjs','INDEPENDENT-FINAL-CONTROL-PREPARATION-CHECK.json'];
const freeze={schema:'mcy-independent-responsive-preparation-v1',status:'PREPARED_NOT_APPROVED_FOR_INVOCATION',recordedAt:report.recordedAt,accepted46SourceSha256:sha(sourceFile),candidateBinding:null,runnerBinding:null,files:files.map(file=>({path:path.relative(root,path.join(dir,file)).replaceAll('\\','/'),sha256:sha(path.join(dir,file))})),boundary:'Core module only; no launch/server/top-level tests. Final source/diff/runner review, immutable binding and root release required before browser.'};
fs.writeFileSync(path.join(dir,'INDEPENDENT-FINAL-CONTROL-PREPARATION-FREEZE.json'),JSON.stringify(freeze,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({...report,freezeSha256:sha(path.join(dir,'INDEPENDENT-FINAL-CONTROL-PREPARATION-FREEZE.json'))},null,2));
