const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const {createHash} = require('node:crypto');
const root = process.cwd();
const dir = path.join(root, 'analyse/ux-step4-5-2026-10-17');
const sha = p => createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const read = p => JSON.parse(fs.readFileSync(p));
const checks = [];
function pin(p, expected, group) { assert.equal(sha(p), expected, p); checks.push({group,path:p,sha256:expected}); }
const freezePath = path.join(dir,'SOURCE-FREEZE-v2.json');
pin(freezePath,'f57b2ba99aad152ffa52192ea40725ceab0a9ba6005a347323c11a880e7301a8','source-manifest');
const freeze=read(freezePath), baseline=read(path.join(dir,'app-baseline.json'));
for(const i of freeze.appInputs) pin(path.join(freeze.candidate,i.path),i.sha256,'candidate');
for(const i of freeze.harnessAndIntake) pin(path.join(root,i.path),i.sha256,'harness-intake');
for(const i of baseline.inputs) {
  pin(path.join(freeze.approvedBaseline,i.path),i.sourceSha256,'approved4.4');
  if(i.rootSha256) pin(path.join(root,i.path),i.rootSha256,'dirty-root-preimage');
}
const base=fs.readFileSync(path.join(freeze.approvedBaseline,'src/Prototype.tsx'),'utf8');
const cand=fs.readFileSync(path.join(freeze.candidate,'src/Prototype.tsx'),'utf8');
const functionMark='function ReflectionScreen()';
const returnMark='  return <MobileScroll';
const footerMark='function ReflectionFooter()';
assert.equal(cand.slice(0,cand.indexOf(functionMark)),base.slice(0,base.indexOf(functionMark)));
const bStart=base.indexOf(functionMark),cStart=cand.indexOf(functionMark);
assert.equal(cand.slice(cStart,cand.indexOf(returnMark,cStart)),base.slice(bStart,base.indexOf(returnMark,bStart)));
assert.equal(cand.slice(cand.indexOf(footerMark)).replace('className="mcy-flow-footer mcy-reflection-footer"','className="mcy-flow-footer"'),base.slice(base.indexOf(footerMark)));
const evidencePath=path.join(dir,'EVIDENCE-FREEZE-v2.json');
const expectedEvidence=process.argv[2];
assert(expectedEvidence,'Pass exact root/worker supplied EVIDENCE-FREEZE-v2 SHA');
pin(evidencePath,expectedEvidence,'evidence-manifest');
const evidence=read(evidencePath);
assert.equal(evidence.sourceFreezeSha256,sha(freezePath));
for(const i of evidence.files)pin(path.join(root,i.path),i.sha256,'evidence');
for(const group of ['images','supportingEvidence'])for(const i of evidence[group]||[])pin(path.join(dir,i.path),i.sha256,group);
const build=read(path.join(dir,'BUILD-ARTIFACT-v2.json'));
for(const i of build.files)pin(path.join(freeze.candidate,'dist',i.path),i.sha256,'build');
for(const gate of read(path.join(dir,'checks.json')))assert.equal(gate.exitCode,0,gate.name);
for(const [name,count]of [['focused-confirmation',38],['mapped-v2',10],['adjacent-v2',84]]){
 const command=read(path.join(dir,name+'-command.json')), report=read(path.join(dir,name+'-results.json'));
 assert.equal(command.exitCode,0,name); assert.equal(command.sourceFreezeSha256,sha(freezePath));
 assert.equal(report.stats.expected,count,name);assert.equal(report.stats.unexpected,0,name);assert.equal(report.stats.skipped,0,name);assert.equal(report.stats.flaky,0,name);
}
const probe=read(path.join(dir,'independent-qc-v2/probe-results.json'));
assert.equal(probe.beforeAfterPinsMatch,true);assert.equal(probe.cases.filter(c=>c.status==='PASS').length,14);assert.equal(probe.cases.filter(c=>c.status==='FAIL').length,1);
assert.equal(probe.cases.find(c=>c.status==='FAIL').name,'editor-real-keyboard-and-note');
const editor=read(path.join(dir,'editor-baseline-control/results.json'));
assert.equal(editor.status,'PASS_BOUNDED_CONTROL');assert.equal(editor.exitCode,0);assert.equal(editor.pinsMatchBeforeAfter,true);
const counts={};for(const c of checks)counts[c.group]=(counts[c.group]||0)+1;
const result={executedAt:new Date().toISOString(),status:'PASS',exitCode:0,sourceFreezeSha256:sha(freezePath),evidenceFreezeSha256:sha(evidencePath),counts,preservation:{beforeReflection:true,reflectionHandlers:true,footerAndAfterExceptApprovedClass:true},workerFinal:{baselineCommands:7,focused:38,mapped:10,adjacent:84},independentProbe:{pass:14,fail:1,failedCaseDisposition:'Identical approved4.4 RegionEditor focus clipping; separate two-scenario control exit0/P3 residual'},checks};
fs.writeFileSync(path.join(dir,'INDEPENDENT-FINAL-PINS.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({status:result.status,counts,sourceFreezeSha256:result.sourceFreezeSha256,evidenceFreezeSha256:result.evidenceFreezeSha256,reportSha256:sha(path.join(dir,'INDEPENDENT-FINAL-PINS.json'))},null,2));
