import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import {createHash} from 'node:crypto';
const root=process.cwd(),dir=path.join(root,'analyse/ux-step4-5-2026-10-17'),baseline=JSON.parse(fs.readFileSync(path.join(dir,'app-baseline.json'))),candidate=baseline.target;
const sha=p=>createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const appInputs=baseline.inputs.map(i=>({path:i.path,sha256:sha(path.join(candidate,i.path))}));
for(const i of baseline.inputs){assert.equal(sha(path.join(baseline.source,i.path)),i.sourceSha256,'4.4 source changed: '+i.path);if(i.rootSha256)assert.equal(sha(path.join(root,i.path)),i.rootSha256,'Root preimage changed: '+i.path);}
const changed=appInputs.filter((i,n)=>i.sha256!==baseline.inputs[n].sourceSha256).map(i=>({...i,baselineSha256:baseline.inputs.find(b=>b.path===i.path).sourceSha256}));
assert.deepEqual(changed.map(i=>i.path).sort(),['src/Prototype.tsx','src/prototype.css','src/i18n.ts'].sort());
appInputs.push({path:'tests/ux-reflection.spec.ts',sha256:sha(path.join(candidate,'tests/ux-reflection.spec.ts'))});
const before=fs.readFileSync(path.join(baseline.source,'src/Prototype.tsx'),'utf8'),after=fs.readFileSync(path.join(candidate,'src/Prototype.tsx'),'utf8');
const pre='function ReflectionScreen()',post='function ReflectionFooter()',render='  return <MobileScroll';
assert.equal(before.slice(0,before.indexOf(pre)),after.slice(0,after.indexOf(pre)));
assert.equal(before.slice(before.indexOf(pre),before.indexOf(render,before.indexOf(pre))),after.slice(after.indexOf(pre),after.indexOf(render,after.indexOf(pre))));
assert.equal(before.slice(before.indexOf(post)),after.slice(after.indexOf(post)).replace('mcy-flow-footer mcy-reflection-footer','mcy-flow-footer'));
const names=['app-baseline.json','prepare-app.mjs','qa-global-setup.mjs','qa.playwright.config.mjs','preview.mjs','build-fixture.mjs','run-checks.mjs','run-ui.mjs','freeze-source.mjs','implement-ui.mjs','polish-ui.mjs','strengthen-tests.mjs','EXECUTION.vi.md','INTAKE-ADDENDUM.vi.md','PLAN-CONSOLIDATED.vi.md','TASK-INTAKE.vi.md','PLAN-INTAKE-FREEZE.json','ROOT-PREIMPLEMENTATION-GATE.vi.md'];
const harnessAndIntake=names.map(name=>({path:'analyse/ux-step4-5-2026-10-17/'+name,sha256:sha(path.join(dir,name))}));
const output={createdAt:new Date().toISOString(),risk:'R1 Reflection presentation only, rootclass-only footer extension documented before edit',candidate,approvedBaseline:baseline.source,approvedBaselineManifestSha256:baseline.sourceManifestSha256,appInputs,changed,addition:appInputs.at(-1),harnessAndIntake,source44InputsUnchanged:baseline.inputs.length,rootExistingInputsUnchanged:baseline.inputs.filter(i=>i.rootSha256).length,preservation:{beforeReflection:true,regionHandlers:true,footerAndAfterExceptOneRootClass:true},preview:{url:'http://127.0.0.1:4193/?mode=web',sessionId:33147,externalFramesBlockedByResponseCsp:true},boundary:'Local source/fixture only. Native HALTED, web BLOCKED_NO_UPLOAD_OR_ALIAS. STOP before4.6 user review.'};
const manifest=path.join(dir,'SOURCE-FREEZE.json');assert(!fs.existsSync(manifest));fs.writeFileSync(manifest,JSON.stringify(output,null,2)+'\n');console.log({manifest,sha256:sha(manifest),appInputs:appInputs.length,changed:changed.map(i=>i.path),rootExistingInputsUnchanged:output.rootExistingInputsUnchanged});
