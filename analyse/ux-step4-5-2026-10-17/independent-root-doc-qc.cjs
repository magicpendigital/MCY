const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{createHash}=require('node:crypto');
const root=process.cwd(),dir=path.join(root,'analyse/ux-step4-5-2026-10-17');
const sha=p=>createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const read=p=>JSON.parse(fs.readFileSync(p));
const freezePath=path.join(dir,'ROOT-VERIFICATION-FREEZE.json'),expected='3c1c9d1dbcc8b1e6afe54c4400f5ae47d7cede51a55c0e501041e39781bc74fb';
assert.equal(sha(freezePath),expected);const j=read(freezePath);assert.equal(j.files.length,13);
for(const i of j.files)assert.equal(sha(i.path),i.sha256,i.path);
const source=read(path.join(dir,'SOURCE-FREEZE-v2.json'));
function appGuard(){for(const i of source.appInputs)assert.equal(sha(path.join(source.candidate,i.path)),i.sha256,i.path);for(const i of source.harnessAndIntake)assert.equal(sha(path.join(root,i.path)),i.sha256,i.path);}
appGuard();
const links=[];
for(const n of ['ROOT-VERIFICATION.vi.md','CURRENT-STATUS.vi.md']){
 const text=fs.readFileSync(path.join(dir,n),'utf8');
 for(const m of text.matchAll(/\]\(([^)]+)\)/g)){
  if(/^(https?:|#)/.test(m[1]))continue;
  const target=path.resolve(dir,m[1]);assert(fs.existsSync(target),target);links.push({document:n,target});
 }
 for(const claim of ['132','P3','INVALID','37/38','4.6','HALTED','BLOCKED_NO_UPLOAD_OR_ALIAS'])assert(text.includes(claim),n+': '+claim);
}
assert.equal(links.length,28);appGuard();assert.equal(sha(freezePath),expected);for(const i of j.files)assert.equal(sha(i.path),i.sha256,i.path);
const out={executedAt:new Date().toISOString(),reviewer:'/root/step44_independent_qc',status:'PASS_DOCUMENT_CLAIMS_LINK_PIN_REVIEW',exitCode:0,documentFreezeSha256:expected,frozenFilesVerified:13,localLinksResolved:links.length,appPinsVerifiedBeforeAfter:source.appInputs.length,harnessIntakePinsVerifiedBeforeAfter:source.harnessAndIntake.length,manualClaimsReview:{workerAttribution:true,rootManualAttribution:true,latest132Only:true,own14Pass1BaselineDiagnosticFailProcess1:true,baselineControl2ScenariosExit0:true,old37of38FailureRetainedCauseUnproven:true,oldRootFalsePassInvalidPreserved:true,residualP3AndLocalLimitsExplicit:true,noZeroRegressionOrRemoteCiGuarantee:true,stopBefore46:true},scope:'Documentation and pin review only; no app/UI tests, source edits, live/native/deploy actions. Root must read final docs separately.',files:j.files,links};
const target=path.join(dir,'ROOT-HANDOFF-DOC-QC.json');fs.writeFileSync(target,JSON.stringify(out,null,2)+'\n');console.log(JSON.stringify({status:out.status,receiptSha256:sha(target),pins:13,localLinks:links.length,appBeforeAfter:source.appInputs.length,harnessBeforeAfter:source.harnessAndIntake.length},null,2));
