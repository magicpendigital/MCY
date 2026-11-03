import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,readFile,writeFile,rm,copyFile} from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {createHash} from 'node:crypto';
import {unitSchema,unitTemplate} from './library-contract.mjs';
import {validateLibrary,validateUnit,validateSchema,resolveObservationCapture,libraryRoot,repoRoot} from './validate-library.mjs';
import {packageArtifactFiles} from './create-manifest.mjs';
import {assertManifestCoverage} from './verify-manifest.mjs';
import {renderLibrary} from './render-library.mjs';
const hash=b=>createHash('sha256').update(b).digest('hex');
const clone=value=>structuredClone(value);
async function fixture(){
 const root=await mkdtemp(path.join(os.tmpdir(),'mcy-yoga-draft-test-'));await mkdir(path.join(root,'units/fixture'),{recursive:true});await mkdir(path.join(root,'media/fixture'),{recursive:true});
 const inventory=JSON.parse(await readFile(path.join(libraryRoot,'inventory.json'),'utf8'));for(const record of inventory.records)record.contentUnitIds=record.id==='27'?['mcy.pose.fixture']:[];
 const bytes=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==','base64'); // 1x1 PNG: masters are archived outside the repository
 const imported=JSON.parse(await readFile(path.join(libraryRoot,'units/foundation-standing/r3.json'),'utf8'));
 const unit={...clone(unitTemplate),id:'mcy.pose.fixture',productionStatus:'media_draft',title:'Fictional validation fixture',shortTitle:'Fixture',intro:'Fictional fixture, no exercise instructions.',scope:'Test only.',learningObjectives:['Test a closed draft.'],audience:'Fictional.',preparation:['No physical exercise.'],stopGuidance:'Do not practice this test.',sourceRefs:[{courseId:'poses',lessonId:'27',youtubeId:'rWl5ySBsrG0',relation:'topic_reference',contentObserved:false}],sources:[{id:'source-1',title:'Fictional source',url:'https://example.invalid/fixture',use:'Test only, not evidence.',accessedAt:null}],steps:[{id:'step-1',order:1,title:'Fixture step',body:'Not movement guidance.',detail:'',entry:'',exit:'',alternative:'',stopCue:'Do not practice.',sourceIds:['source-1'],evidenceRefs:[],mediaIds:['fixture-photo']}],media:[{id:'fixture-photo',stepId:'step-1',variant:'photo_ai',status:'draft_present',path:'media/fixture/image.png',sha256:hash(bytes),mime:'image/png',width:bytes.readUInt32BE(16),height:bytes.readUInt32BE(20),alt:'Fictional test reference.',caption:'Test only.',synthetic:true,disclosure:'AI asset, not approved.',rightsStatus:'pending',expertStatus:'pending',provenance:{...clone(imported.media.find(media=>media.variant==='photo_ai').provenance),notes:'Fictional validator fixture reuses an existing asset solely for offline controls.'}}]};
 const save=async()=>{await writeFile(path.join(root,'contract.jsonschema'),JSON.stringify(unitSchema));await writeFile(path.join(root,'inventory.json'),JSON.stringify(inventory));await writeFile(path.join(root,'units/fixture/r1.json'),JSON.stringify(unit));await writeFile(path.join(root,'media/fixture/image.png'),bytes);};
 await save();return {root,inventory,unit,bytes,save,clean:()=>rm(root,{recursive:true,force:true})};
}
test('valid fictional draft remains unpublished, pending and non-recommendable',async()=>{const f=await fixture();try{const result=await validateLibrary({root:f.root});assert.equal(result.status,'PASS');assert.equal(result.units.length,1);assert.equal(result.totalPresentMedia,1);assert.equal(f.unit.learnerVisible,false);assert.equal(f.unit.review.expert,'pending');}finally{await f.clean();}});
test('coverage keeps separate links for two revisions of one unit instead of aliasing the newest',async()=>{const f=await fixture();try{const second={...clone(f.unit),revision:'r2',title:'Second fictional revision'};await writeFile(path.join(f.root,'units/fixture/r2.json'),JSON.stringify(second));await renderLibrary({root:f.root});await renderLibrary({root:f.root,check:true});const coverage=await readFile(path.join(f.root,'COVERAGE.vi.md'),'utf8');assert.match(coverage,/\[Fictional validation fixture\]\(readable\/fixture\/r1\.vi\.md\)/);assert.match(coverage,/\[Second fictional revision\]\(readable\/fixture\/r2\.vi\.md\)/);const result=await validateLibrary({root:f.root});assert.deepEqual(result.units.map(u=>[u.revision,u.locale]),[['r1','vi-VN'],['r2','vi-VN']]);}finally{await f.clean();}});
for(const [name,mutation,pattern]of[
 ['duplicate steps',f=>f.unit.steps.push(clone(f.unit.steps[0])),/Duplicate step ID/],
 ['missing step media ref',f=>f.unit.steps[0].mediaIds.push('missing'),/Missing or wrong-step media ref/],
 ['path traversal',f=>f.unit.media[0].path='media/../escape.png',/Unsafe relative path/],
 ['absolute path',f=>f.unit.media[0].path='D:/secret.png',/package media path/],
 ['media hash drift',f=>f.unit.media[0].sha256='0'.repeat(64),/Media hash mismatch/],
 ['fake approval',f=>f.unit.review.approvalRecords.push({expertApproved:true}),/Too many items/],
 ['approved human review status',f=>f.unit.review.expert='approved',/Invalid constant/],
 ['published flag',f=>f.unit.publishStatus='published',/Invalid constant/],
 ['learner visible flag',f=>f.unit.learnerVisible=true,/Invalid constant/],
 ['recommendation flag',f=>f.unit.recommendationEligible=true,/Invalid constant/],
 ['reading time used as practice duration',f=>f.unit.practiceDurationSeconds=f.unit.readTimeSecondsEstimate??120,/Invalid constant/],
 ['wrong canonical source ID',f=>f.unit.sourceRefs[0].youtubeId='aaaaaaaaaaa',/canonical inventory/],
 ['stale title mapping',f=>f.inventory.records[0].title='Changed',/Canonical inventory drift/],
 ['missing inventory record',f=>f.inventory.records.pop(),/exactly38records/],
 ['missing inventory unit',f=>f.inventory.records[0].contentUnitIds=['mcy.missing'],/references missing unit/],
 ['missing inventory backlink',f=>f.inventory.records.find(r=>r.id==='27').contentUnitIds=[],/Missing inventory backlink/],
 ['nonconsecutive step order',f=>f.unit.steps[0].order=2,/Step order/],
 ['fake ready asset with no path',f=>f.unit.media[0].path=null,/package media path/],
 ['unproduced media with existing path',f=>f.unit.media[0].status='not_produced',/Unproduced media must have null/],
 ['missing source binding',f=>f.unit.steps[0].sourceIds=[],/no source or observed evidence/],
 ['false video observed assertion',f=>f.unit.sourceRefs[0].contentObserved=true,/Invalid constant/],
 ['unsupported unvalidated schema extension',f=>f.unit.uncontrolledPublishOverride=true,/Unexpected property/],
])test(`rejects ${name}`,async()=>{const f=await fixture();try{mutation(f);await f.save();await assert.rejects(validateLibrary({root:f.root}),pattern);}finally{await f.clean();}});
test('rejects a missing referenced image file',async()=>{const f=await fixture();try{await rm(path.join(f.root,'media/fixture/image.png'));await assert.rejects(validateLibrary({root:f.root}),/ENOENT/);}finally{await f.clean();}});
test('rejects a wrong image size despite correct bytes and hash',async()=>{const f=await fixture();try{f.unit.media[0].width=2;await f.save();await assert.rejects(validateLibrary({root:f.root}),/dimensions mismatch/);}finally{await f.clean();}});
test('unproduced media is accepted only with null fields and a matching explicit brief',async()=>{const f=await fixture();try{const media=f.unit.media[0];Object.assign(media,{status:'not_produced',path:null,sha256:null,mime:null,width:null,height:null});f.unit.assetBriefs=[{id:'brief-1',stepId:'step-1',mediaId:media.id,status:'not_produced',path:null,sha256:null,brief:'Fictional test brief; no image yet.',sourceIds:['source-1'],evidenceRefs:[]}];await f.save();const result=await validateLibrary({root:f.root});assert.equal(result.totalPresentMedia,0);assert.equal(result.totalMissingMedia,1);f.unit.assetBriefs=[];await f.save();await assert.rejects(validateLibrary({root:f.root}),/Missing unproduced media brief/);}finally{await f.clean();}});
test('unsupported JSON Schema validation keywords fail closed',()=>assert.throws(()=>validateSchema('x',{type:'string',not:{const:'x'}}),/Unsupported schema keyword/));
test('rejects weakening the declarative schema to accept a visible learner draft',async()=>{const f=await fixture();try{const schema=clone(unitSchema);schema.properties.learnerVisible={type:'boolean'};await writeFile(path.join(f.root,'contract.jsonschema'),JSON.stringify(schema));f.unit.learnerVisible=true;await writeFile(path.join(f.root,'units/fixture/r1.json'),JSON.stringify(f.unit));await assert.rejects(validateLibrary({root:f.root}),/Declarative schema differs/);}finally{await f.clean();}});
test('rejects a missing provenance source file despite an invented digest',async()=>{const f=await fixture();try{f.unit.media[0].provenance.sourcePath=null;f.unit.media[0].provenance.sourceSha256='0'.repeat(64);await f.save();await assert.rejects(validateLibrary({root:f.root}),/Missing present media source path/);}finally{await f.clean();}});

for(const field of ['tool','createdAt','promptRef','sourcePath','sourceSha256'])test(`present AI media rejects missing provenance ${field}`,async()=>{const f=await fixture();try{f.unit.media[0].provenance[field]=null;await f.save();await assert.rejects(validateLibrary({root:f.root}),/Missing present media/);}finally{await f.clean();}});
test('RAM probe: rejects clearing all production provenance on a present foundation asset',async()=>{const unit=JSON.parse(await readFile(path.join(libraryRoot,'units/foundation-standing/r3.json'),'utf8')),inventory=JSON.parse(await readFile(path.join(libraryRoot,'inventory.json'),'utf8'));for(const field of ['tool','createdAt','promptRef','sourcePath','sourceSha256'])unit.media[0].provenance[field]=null;await assert.rejects(validateUnit(unit,{schema:unitSchema,inventory}),/Missing present media production tool/);});
for(const [name,mutate,pattern]of[
 ['source SHA',unit=>unit.sourceObservations[0].sourceSha256='0'.repeat(64),/filename or SHA/],
 ['timestamp99999',unit=>unit.sourceObservations[0].timestampsSeconds=[99999],/lacks visible pixels/],
 ['filename',unit=>unit.sourceObservations[0].fileName='Invented.mov',/filename or SHA/],
])test(`QC RAM reproduction against kneeling unit rejects ${name}`,async()=>{const unit=JSON.parse(await readFile(path.join(libraryRoot,'units/kneeling-backbend/r1.json'),'utf8')),inventory=JSON.parse(await readFile(path.join(libraryRoot,'inventory.json'),'utf8'));await validateUnit(unit,{schema:unitSchema,inventory});mutate(unit);await assert.rejects(validateUnit(unit,{schema:unitSchema,inventory}),pattern);});

async function observationFixture({supplement=false}={}){
 const f=await fixture();f.unit.media=[];f.unit.steps[0].mediaIds=[];f.unit.productionStatus='editorial_draft';
 const record={sourceFileName:'Fictional.mov',sourceSha256:'a'.repeat(64),browserMeasurements:[{actualTime:1,error:null,readyState:4},{actualTime:2,error:null,readyState:4},{actualTime:3,error:null,readyState:1}]};
 if(supplement)Object.assign(record,{visibleColumns:[1],blackColumns:[2,3],visibleTimestampsSeconds:[1]});else record.pixelReview={visibleColumns:[1,3],blackColumns:[2]};
 const document={schemaVersion:'mcy-private-source-observations/1',records:[record]},relative='evidence/visible.json';await mkdir(path.join(f.root,'evidence'),{recursive:true});
 const saveEvidence=async({repin=true}={})=>{const bytes=Buffer.from(JSON.stringify(document));await writeFile(path.join(f.root,relative),bytes);if(repin)f.unit.provenance.sourceFiles=[{path:relative,sha256:hash(bytes)}];};
 await saveEvidence();f.unit.sourceObservations=[{id:'fixture-observation',fileName:record.sourceFileName,sourceSha256:record.sourceSha256,timestampsSeconds:supplement?[1]:[1,3],visualOnly:true,audioObserved:false,notes:'Fictional pixel-review fixture, not source acceptance.',evidenceRef:relative}];
 return {...f,document,saveEvidence,validate:()=>validateUnit(f.unit,{schema:unitSchema,inventory:f.inventory,root:f.root,repo:f.root})};
}
test('initial evidence accepts only visible columns, including a visible frame whose readyState is1',async()=>{const f=await observationFixture();try{await f.validate();f.unit.sourceObservations[0].timestampsSeconds=[2];await assert.rejects(f.validate(),/lacks visible pixels/);}finally{await f.clean();}});
test('supplement evidence accepts its visible timestamps and refuses a timestamp visible only in an earlier capture',async()=>{const f=await observationFixture({supplement:true});try{await f.validate();f.unit.sourceObservations[0].timestampsSeconds=[3];await assert.rejects(f.validate(),/lacks visible pixels/);}finally{await f.clean();}});
for(const [name,mutate,pattern]of[
 ['source SHA',f=>f.unit.sourceObservations[0].sourceSha256='0'.repeat(64),/filename or SHA/],
 ['filename',f=>f.unit.sourceObservations[0].fileName='Invented.mov',/filename or SHA/],
 ['timestamp99999',f=>f.unit.sourceObservations[0].timestampsSeconds=[99999],/lacks visible pixels/],
])test(`RAM probe: observation rejects invented ${name}`,async()=>{const f=await observationFixture();try{mutate(f);await assert.rejects(f.validate(),pattern);}finally{await f.clean();}});
test('observation evidence must itself be pinned in unit provenance',async()=>{const f=await observationFixture();try{f.unit.provenance.sourceFiles=[];await assert.rejects(f.validate(),/exact provenance pin/);}finally{await f.clean();}});
test('observation evidence hash cannot drift after its pin',async()=>{const f=await observationFixture();try{f.document.records[0].pixelReview.visibleColumns=[2];await f.saveEvidence({repin:false});await assert.rejects(f.validate(),/provenance hash mismatch/);}finally{await f.clean();}});
test('observation rejects unknown evidence schemas',async()=>{const f=await observationFixture();try{f.document.schemaVersion='made-up';await f.saveEvidence();await assert.rejects(f.validate(),/Unknown observation evidence schema/);}finally{await f.clean();}});
test('supplement explicit timestamps cannot contradict its visible columns',async()=>{const f=await observationFixture({supplement:true});try{f.document.records[0].visibleTimestampsSeconds=[2];await f.saveEvidence();await assert.rejects(f.validate(),/do not match visible columns/);}finally{await f.clean();}});

test('PNG with authentic IHDR and IEND but no image data is rejected even under an updated asset hash',async()=>{const f=await fixture();try{const malformed=Buffer.concat([f.bytes.subarray(0,33),f.bytes.subarray(-12)]);f.unit.media[0].sha256=hash(malformed);await f.save();await writeFile(path.join(f.root,'media/fixture/image.png'),malformed);await assert.rejects(validateLibrary({root:f.root}),/missing image data/);}finally{await f.clean();}});
test('PNG chunk corruption is rejected even when the recorded file hash is updated',async()=>{const f=await fixture();try{const malformed=Buffer.from(f.bytes);let offset=8;while(malformed.subarray(offset+4,offset+8).toString()!=='IDAT')offset+=malformed.readUInt32BE(offset)+12;malformed[offset+8]^=1;f.unit.media[0].sha256=hash(malformed);await f.save();await writeFile(path.join(f.root,'media/fixture/image.png'),malformed);await assert.rejects(validateLibrary({root:f.root}),/PNG chunk or CRC/);}finally{await f.clean();}});
test('truncated PNG is rejected under an updated file hash',async()=>{const f=await fixture();try{const truncated=f.bytes.subarray(0,f.bytes.length-5);f.unit.media[0].sha256=hash(truncated);await f.save();await writeFile(path.join(f.root,'media/fixture/image.png'),truncated);await assert.rejects(validateLibrary({root:f.root}),/malformed PNG/);}finally{await f.clean();}});

test('only the exact root manifest is excluded; nested manifest must be pinned by both producer and verifier',async()=>{const f=await fixture();try{await writeFile(path.join(f.root,'manifest.json'),'{}');await mkdir(path.join(f.root,'media/nested'),{recursive:true});const nested=path.join(f.root,'media/nested/manifest.json');await writeFile(nested,'{"fixture":true}');const files=await packageArtifactFiles(f.root);assert.ok(files.includes(nested));assert.ok(!files.includes(path.join(f.root,'manifest.json')));const listed=new Set(files.map(file=>path.relative(f.root,file).split(path.sep).join('/')));await assertManifestCoverage(f.root,listed,f.root);listed.delete('media/nested/manifest.json');await assert.rejects(assertManifestCoverage(f.root,listed,f.root),/Unfrozen package file media\/nested\/manifest.json/);}finally{await f.clean();}});

async function captureFixture({jpeg=false}={}){const f=await observationFixture();const capture=path.join(f.root,'evidence/private/capture.png'),captureBytes=jpeg?await readFile(path.join(repoRoot,'analyse/yoga-content-production-2026-10-18/private-evidence/browser-contacts/pose-0.png')):f.bytes;await mkdir(path.dirname(capture),{recursive:true});await writeFile(capture,captureBytes);f.document.records[0].capturePath='private\\capture.png';f.document.records[0].captureSha256=hash(captureBytes);await f.saveEvidence();return {...f,capture,captureBytes,resolveCapture:()=>resolveObservationCapture(f.unit.sourceObservations[0],f.unit,f.root)};}
test('capture resolver normalizes a metadata Windows separator and pins exact PNG bytes',async()=>{const f=await captureFixture();try{const result=await f.resolveCapture();assert.equal(result.file,f.capture);assert.equal(result.sha256,hash(f.bytes));assert.equal(result.bytes,f.bytes.length);}finally{await f.clean();}});
test('capture drift is rejected even while its observation JSON pin remains valid',async()=>{const f=await captureFixture();try{await writeFile(f.capture,Buffer.concat([f.bytes,Buffer.from('drift')]));await assert.rejects(f.resolveCapture(),/capture hash mismatch/);}finally{await f.clean();}});
for(const unsafe of ['../outside.png','C:\\private\\capture.png','/absolute.png','private/capture.mov'])test(`capture resolver refuses unsafe or raw-video path ${unsafe}`,async()=>{const f=await captureFixture();try{f.document.records[0].capturePath=unsafe;await f.saveEvidence();await assert.rejects(f.resolveCapture(),/Unsafe observation capture path/);}finally{await f.clean();}});
test('capture resolver requires a recorded screenshot SHA',async()=>{const f=await captureFixture();try{delete f.document.records[0].captureSha256;await f.saveEvidence();await assert.rejects(f.resolveCapture(),/capture path or SHA is missing/);}finally{await f.clean();}});
test('actual initial and supplement captures bind to their exact observation records',async()=>{const unit=JSON.parse(await readFile(path.join(libraryRoot,'units/low-wheel/r1.json'),'utf8'));assert.equal(unit.sourceObservations.length,2);const results=[];for(const observation of unit.sourceObservations)results.push(await resolveObservationCapture(observation,unit));assert.equal(new Set(results.map(item=>item.file)).size,2);assert.ok(results.some(item=>item.file.endsWith(path.join('browser-contacts','pose-0.png'))));assert.ok(results.some(item=>item.file.endsWith(path.join('browser-contacts','supplement','pose-0.png'))));});
test('private JPEG capture is detected by bytes while its historical png filename stays unchanged',async()=>{const f=await captureFixture({jpeg:true});try{const result=await f.resolveCapture();assert.equal(result.mime,'image/jpeg');assert.ok(result.width>0&&result.height>0);assert.equal(result.file,f.capture);assert.equal(result.sha256,hash(f.captureBytes));assert.ok(result.file.endsWith('.png'));}finally{await f.clean();}});
test('truncated private JPEG is rejected after updating capture SHA and JSON provenance',async()=>{const f=await captureFixture({jpeg:true});try{const bytes=f.captureBytes.subarray(0,f.captureBytes.length-2);await writeFile(f.capture,bytes);f.document.records[0].captureSha256=hash(bytes);await f.saveEvidence();await assert.rejects(f.resolveCapture(),/Malformed or truncated JPEG/);}finally{await f.clean();}});
test('malformed private JPEG marker length is rejected after updating all recorded hashes',async()=>{const f=await captureFixture({jpeg:true});try{const bytes=Buffer.from(f.captureBytes);bytes.writeUInt16BE(1,4);await writeFile(f.capture,bytes);f.document.records[0].captureSha256=hash(bytes);await f.saveEvidence();await assert.rejects(f.resolveCapture(),/Malformed or truncated JPEG segment/);}finally{await f.clean();}});
test('unknown private capture format is rejected under its updated file and evidence hashes',async()=>{const f=await captureFixture();try{const bytes=Buffer.from('unrecognized-image-format');await writeFile(f.capture,bytes);f.document.records[0].captureSha256=hash(bytes);await f.saveEvidence();await assert.rejects(f.resolveCapture(),/Unsupported private capture image type/);}finally{await f.clean();}});

test('accepts a WebP delivery file whose master is archived outside the package, and rejects an unrecorded master',async()=>{
 const f=await fixture();
 try{
  const webp=Buffer.from('UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEADsD+JaQAA3AAAAAA','base64'); // 1x1 lossy WebP
  f.unit.media[0].path='media/fixture/p.webp';f.unit.media[0].mime='image/webp';f.unit.media[0].sha256=hash(webp);f.unit.media[0].width=1;f.unit.media[0].height=1;
  f.unit.assetBriefs.filter(b=>b.mediaId===f.unit.media[0].id).forEach(b=>{b.path='media/fixture/p.webp';b.sha256=hash(webp);});
  await writeFile(path.join(f.root,'media/fixture/p.webp'),webp);
  f.unit.media[0].provenance.sourcePath='archive:media/fixture/p.png';
  await writeFile(path.join(f.root,'archive-manifest.json'),JSON.stringify({files:[{path:'media/fixture/p.png',sha256:f.unit.media[0].provenance.sourceSha256}]}));
  await f.save();
  assert.equal((await validateLibrary({root:f.root})).status,'PASS');
  await writeFile(path.join(f.root,'archive-manifest.json'),JSON.stringify({files:[{path:'media/fixture/p.png',sha256:'0'.repeat(64)}]}));
  await assert.rejects(validateLibrary({root:f.root}),/Archived master is not recorded/);
 }finally{await f.clean();}
});
