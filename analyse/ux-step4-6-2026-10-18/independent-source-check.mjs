import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
const root=path.resolve(import.meta.dirname,'../..'),dir=import.meta.dirname,sha=p=>createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const file=path.join(dir,'SOURCE-FREEZE-v1.json');assert.equal(sha(file),'01d45905ff401b6e127bac0bbafff03d3c66934e064f0711fcaf10deddb8db45');
const freeze=JSON.parse(fs.readFileSync(file)),candidate=path.resolve(root,freeze.candidate),priorPath=path.resolve(root,freeze.approvedSourceManifest);
assert.equal(sha(priorPath),'f57b2ba99aad152ffa52192ea40725ceab0a9ba6005a347323c11a880e7301a8');
const prior=JSON.parse(fs.readFileSync(priorPath)),base=path.resolve(root,prior.candidate),baseline=JSON.parse(fs.readFileSync(path.join(dir,'app-baseline.json')));
for(const i of freeze.appInputs)assert.equal(sha(path.join(candidate,i.path)),i.sha256,i.path);
for(const i of freeze.harnessAndIntake)assert.equal(sha(path.resolve(root,i.path)),i.sha256,i.path);
for(const i of prior.appInputs)assert.equal(sha(path.join(base,i.path)),i.sha256,i.path);
const changed=[];let rootUnchanged=0;for(const i of baseline.inputs){assert.equal(sha(path.join(base,i.path)),i.sourceSha256);if(sha(path.join(candidate,i.path))!==i.sourceSha256)changed.push(i.path);if(i.rootSha256){assert.equal(sha(path.join(root,i.path)),i.rootSha256,'root '+i.path);rootUnchanged++;}}
assert.deepEqual(changed.sort(),['src/Prototype.tsx','src/prototype.css']);
const before=fs.readFileSync(path.join(base,'src/Prototype.tsx'),'utf8'),after=fs.readFileSync(path.join(candidate,'src/Prototype.tsx'),'utf8'),start=s=>s.indexOf('  return <MobileScroll className="mcy-scroll',s.indexOf('function ProfileScreen()')),end=s=>s.indexOf('\n}\n\nfunction AccountRow',s.indexOf('function ProfileScreen()'));
assert.equal(after.slice(0,start(after)),before.slice(0,start(before)));assert.equal(after.slice(end(after)),before.slice(end(before)));
assert(fs.readFileSync(path.join(candidate,'src/prototype.css'),'utf8').startsWith(fs.readFileSync(path.join(base,'src/prototype.css'),'utf8')));
const result={recordedAt:new Date().toISOString(),status:'PASS',sourceFreezeSha256:sha(file),appPins:freeze.appInputs.length,harnessPins:freeze.harnessAndIntake.length,approved45Pins:prior.appInputs.length,rootExistingInputsUnchanged:rootUnchanged,oldTestsUnchanged:baseline.inputs.filter(x=>x.path.startsWith('tests/')).length,changed,profileHandlersAndSurroundingSourceBytewise:true,oldCssPrefixBytewise:true,checkerSha256:sha(new URL(import.meta.url))};
fs.writeFileSync(path.join(dir,'INDEPENDENT-SOURCE-CHECK.json'),JSON.stringify(result,null,2)+'\n',{flag:'wx'});console.log(result);
