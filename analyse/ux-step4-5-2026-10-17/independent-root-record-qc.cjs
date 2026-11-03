const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{createHash}=require('node:crypto');
const root=process.cwd(),dir=path.join(root,'analyse/ux-step4-5-2026-10-17');
const sha=p=>createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const read=p=>JSON.parse(fs.readFileSync(p));
const record=path.join(dir,'ROOT-FINAL-PINS-VALIDATED.json');
assert.equal(sha(record),'05bc5fb7bd8101e203d56b6cf1ede58583ceb99fa5a846fee5a0ed5fa311474b');
const j=read(record),prior=read(path.join(dir,'INDEPENDENT-FINAL-PINS.json'));
assert.equal(j.status,'PASS');assert.equal(j.checkedInputPins,890);assert.equal(j.criticalManifestAndQcPins,6);assert.deepEqual(j.mismatches,[]);
const inputs=prior.checks.filter(i=>!['source-manifest','evidence-manifest'].includes(i.group));assert.equal(inputs.length,890);
for(const i of inputs)assert.equal(sha(i.path),i.sha256,i.path);
for(const i of j.criticalPins)assert.equal(sha(i.path),i.sha256,i.path);
assert.equal(j.rootScreenshots.length,4);for(const i of j.rootScreenshots)assert.equal(sha(i.path),i.sha256,i.path);
assert.equal(sha(j.rejectedPriorRecord.path),j.rejectedPriorRecord.sha256);assert.equal(j.rejectedPriorRecord.sha256,'83284bb19959fe0c235f1da3177399a64754ea6d25d58695ca6997e895edc050');assert.match(j.rejectedPriorRecord.disposition,/INVALID false PASS/);assert.match(j.rejectedPriorRecord.disposition,/not acceptance/);
const counts={};for(const i of inputs){let g=i.group==='harness-intake'?'harness':i.group==='dirty-root-preimage'?'root-preimage':i.group==='supportingEvidence'?'support':i.group;counts[g]=(counts[g]||0)+1;}
for(const i of j.counts)assert.equal(counts[i.group],i.count,i.group);
for(const r of j.requiredUiResults){assert.equal(r.exitCode,0);assert.equal(r.cases,{'focused-confirmation':38,mapped:10,adjacent:84}[r.kind]);}
assert(j.criticalPins.some(i=>i.path.endsWith('ux-step4-4-2026-10-17\\APP-EVIDENCE-FREEZE.json')&&i.sha256==='ea5e3fd5bd8f2efb7270d97c74058c909251f47d7f9857b770f0384d8f1455d6'));
const out={executedAt:new Date().toISOString(),reviewer:'/root/step44_independent_qc',status:'PASS_ROOT_RECORD_REVIEW',exitCode:0,rootRecordSha256:sha(record),rehash:{inputs:inputs.length,critical:j.criticalPins.length,rootScreenshots:j.rootScreenshots.length,rejectedPrior:1},counts,failFastAttribution:'Root-reported execution mode; independent reviewer rehashed all recorded input/critical/image groups and checked explicit invalidation, not root script execution.',priorInvalidDisposition:j.rejectedPriorRecord.disposition,limitations:'No browser rerun; root manual observations remain root-attributed. Native/live/deploy acceptance unchanged; STOP before4.6.'};
const target=path.join(dir,'INDEPENDENT-ROOT-RECORD-QC.json');fs.writeFileSync(target,JSON.stringify(out,null,2)+'\n');console.log(JSON.stringify({status:out.status,receiptSha256:sha(target),rehash:out.rehash},null,2));
