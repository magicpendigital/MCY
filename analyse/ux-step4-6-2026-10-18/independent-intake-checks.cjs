const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),cp=require('node:child_process'),{createHash}=require('node:crypto');
const root=process.cwd(),dir=path.join(root,'analyse/ux-step4-6-2026-10-18');
const sha=p=>createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const read=p=>JSON.parse(fs.readFileSync(p));
const manifest=path.join(dir,'PLAN-INTAKE-FREEZE.json'),expected='9596f1f4d7f2f782d819dabc50fae0b4a280f5506de06d89bbfe8877ffbb8d3d';
assert.equal(sha(manifest),expected);const freeze=read(manifest),checks=[];
function pin(i,group){const p=path.resolve(root,i.path);assert(fs.existsSync(p),p);assert.equal(sha(p),i.sha256,p);checks.push({group,path:i.path,sha256:i.sha256});}
assert.equal(freeze.files.length,5);assert.equal(freeze.baselinePins.length,26);
for(const i of freeze.files)pin(i,'frozen-doc-helper');for(const i of freeze.baselinePins)pin(i,'source-context');
const dirty=read(path.join(dir,'ROOT-DIRTY-BASELINE.json'));assert.equal(dirty.files.length,35);for(const i of dirty.files)pin(i,'fresh-dirty-tracked');
const actualStatus=cp.execFileSync('git',['status','--short','--untracked-files=no'],{cwd:root,encoding:'utf8'});assert.equal(actualStatus,dirty.statusText);
const staged=cp.execFileSync('git',['diff','--cached','--name-only','-z'],{cwd:root,encoding:'utf8'});assert.equal(staged,'','Uncaptured staged change');
const actualDirty=cp.execFileSync('git',['diff','--name-only','-z'],{cwd:root,encoding:'utf8'}).split('\0').filter(Boolean);assert.deepEqual(actualDirty,[...dirty.files].map(i=>i.path));
const sourceRead=read(path.join(dir,'SOURCE-READ-RECEIPT.json'));assert.deepEqual(sourceRead.inputs,freeze.baselinePins);
const baselineFreeze=read(path.join(root,'analyse/ux-step4-5-2026-10-17/SOURCE-FREEZE-v2.json'));
for(const i of baselineFreeze.appInputs){assert.equal(sha(path.join(baselineFreeze.candidate,i.path)),i.sha256,i.path);}
assert(!fs.existsSync(path.join(root,'.vercel/ux-step4-6-20261018')),'App candidate created before intake gate');
const links=[];for(const n of ['TASK-INTAKE.vi.md','PLAN-CONSOLIDATED.vi.md'])for(const m of fs.readFileSync(path.join(dir,n),'utf8').matchAll(/\]\(([^)]+)\)/g)){if(/^https?:/.test(m[1]))continue;assert(fs.existsSync(path.resolve(dir,m[1])),m[1]);links.push({document:n,target:m[1]});}
assert.equal(links.length,15);assert.equal(sha(manifest),expected);for(const i of freeze.files)pin(i,'postcheck-frozen-doc-helper');for(const i of freeze.baselinePins)assert.equal(sha(path.resolve(root,i.path)),i.sha256,i.path);
const out={executedAt:new Date().toISOString(),reviewer:'/root/step44_independent_qc',status:'PASS_INTAKE_BYTE_LINK_PRESERVATION_CHECKS',exitCode:0,intakeFreezeSha256:expected,sourceContextPins:26,freshDirtyTrackedPins:35,frozenDocHelperPins:5,approved45CandidatePins:baselineFreeze.appInputs.length,localLinksResolved:links.length,currentTrackedStatusMatches:true,noStagedInputsOmitted:true,appCandidateAbsent:true,prePostFreezePinsMatch:true,checks,links,scope:'Read-only intake verification plus own QC evidence writes; no app creation/edit, browser tests, Auth/live/native/deploy.'};
const target=path.join(dir,'INDEPENDENT-INTAKE-CHECKS.json');fs.writeFileSync(target,JSON.stringify(out,null,2)+'\n');console.log(JSON.stringify({status:out.status,sourcePins:26,dirtyPins:35,docs:5,baselineAppPins:baselineFreeze.appInputs.length,links:links.length,receiptSha256:sha(target)},null,2));
