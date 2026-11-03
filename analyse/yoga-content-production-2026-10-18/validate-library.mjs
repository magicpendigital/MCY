import {readFile,readdir,lstat,realpath} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {parseInventory,canonicalCatalogSha256} from './build-library.mjs';
import {unitSchema} from './library-contract.mjs';
const here=path.dirname(fileURLToPath(import.meta.url));
export const repoRoot=path.resolve(here,'../..');
export const libraryRoot=path.join(repoRoot,'content/yoga-library');
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const fail=message=>{throw new Error(message);};
const unique=(items,label)=>{if(new Set(items).size!==items.length)fail(`Duplicate ${label}`);};
const nonblank=(value,label)=>{if(typeof value!=='string'||!value.trim())fail(`Missing ${label}`);};
export const safeRelative=value=>typeof value==='string'&&value.length>0&&!value.includes('\\')&&!value.includes(':')&&!value.startsWith('/')&&!value.split('/').some(part=>!part||part==='.'||part==='..');

// Deliberately bounded JSON Schema evaluator for the keywords used by this pinned
// contract. It rejects unsupported validation keywords rather than silently
// ignoring future contract constraints. It is not a general JSON Schema library.
const known=new Set(['$schema','$id','title','$defs','$ref','type','additionalProperties','properties','required','const','enum','items','minItems','maxItems','minLength','maxLength','minimum','maximum','pattern','anyOf']);
export function validateSchema(value,schema,at='$',document=schema){
 for(const keyword of Object.keys(schema))if(!known.has(keyword))fail(`Unsupported schema keyword ${keyword} at ${at}`);
 if(schema.$ref){if(!schema.$ref.startsWith('#/$defs/'))fail('External schema reference denied');const definition=document.$defs?.[schema.$ref.slice(8)];if(!definition)fail('Missing schema definition');return validateSchema(value,definition,at,document);}
 if(schema.anyOf){if(!schema.anyOf.some(option=>{try{validateSchema(value,option,at,document);return true;}catch{return false;}}))fail(`No schema alternative matches ${at}`);return;}
 if('const'in schema&&!same(value,schema.const))fail(`Invalid constant ${at}`);
 if(schema.enum&&!schema.enum.some(option=>same(value,option)))fail(`Invalid enum ${at}`);
 const types=schema.type?(Array.isArray(schema.type)?schema.type:[schema.type]):[];
 const matches=type=>type==='null'?value===null:type==='array'?Array.isArray(value):type==='object'?value!==null&&typeof value==='object'&&!Array.isArray(value):type==='integer'?Number.isInteger(value):type==='number'?typeof value==='number'&&Number.isFinite(value):typeof value===type;
 if(types.length&&!types.some(matches))fail(`Invalid type ${at}`);
 if(typeof value==='string'){
  if(schema.minLength!==undefined&&value.length<schema.minLength)fail(`String too short ${at}`);
  if(schema.maxLength!==undefined&&value.length>schema.maxLength)fail(`String too long ${at}`);
  if(schema.pattern&&!new RegExp(schema.pattern).test(value))fail(`Invalid pattern ${at}`);
 }
 if(typeof value==='number'){
  if(schema.minimum!==undefined&&value<schema.minimum)fail(`Below minimum ${at}`);
  if(schema.maximum!==undefined&&value>schema.maximum)fail(`Above maximum ${at}`);
 }
 if(Array.isArray(value)){
  if(schema.minItems!==undefined&&value.length<schema.minItems)fail(`Too few items ${at}`);
  if(schema.maxItems!==undefined&&value.length>schema.maxItems)fail(`Too many items ${at}`);
  if(schema.items)value.forEach((item,i)=>validateSchema(item,schema.items,`${at}[${i}]`,document));
 }
 if(value!==null&&typeof value==='object'&&!Array.isArray(value)){
  for(const key of schema.required??[])if(!(key in value))fail(`Missing property ${at}.${key}`);
  for(const [key,item] of Object.entries(value)){
   if(schema.properties?.[key])validateSchema(item,schema.properties[key],`${at}.${key}`,document);
   else if(schema.additionalProperties===false)fail(`Unexpected property ${at}.${key}`);
  }
 }
}

async function containedFile(base,relative){
 if(!safeRelative(relative))fail(`Unsafe relative path ${relative}`);
 const file=path.resolve(base,...relative.split('/')),physical=await realpath(file),physicalRoot=await realpath(base);
 if(!physical.startsWith(physicalRoot+path.sep))fail(`Path escapes root ${relative}`);
 let current=base;for(const part of relative.split('/')){current=path.join(current,part);if((await lstat(current)).isSymbolicLink())fail(`Symlink not allowed ${relative}`);}
 return file;
}
async function filesUnder(dir){
 const output=[];for(const entry of await readdir(dir,{withFileTypes:true})){const file=path.join(dir,entry.name);if(entry.isSymbolicLink())fail(`Symlink not allowed ${file}`);if(entry.isDirectory())output.push(...await filesUnder(file));else if(entry.isFile())output.push(file);else fail(`Unexpected filesystem object ${file}`);}return output;
}
const json=async file=>JSON.parse(await readFile(file,'utf8'));
function crc32(bytes){let crc=0xffffffff;for(const byte of bytes){crc^=byte;for(let bit=0;bit<8;bit++)crc=(crc>>>1)^((crc&1)?0xedb88320:0);}return (crc^0xffffffff)>>>0;}
// Delivery images are lossy/lossless WebP (RIFF container); read the canvas size without decoding.
function webpDimensions(bytes){
 if(bytes.length<30||bytes.subarray(0,4).toString('latin1')!=='RIFF'||bytes.subarray(8,12).toString('latin1')!=='WEBP')fail('Invalid WebP image');
 const kind=bytes.subarray(12,16).toString('latin1');
 if(kind==='VP8 ')return {width:bytes.readUInt16LE(26)&0x3fff,height:bytes.readUInt16LE(28)&0x3fff};
 if(kind==='VP8L'){const bits=bytes.readUInt32LE(21);return {width:(bits&0x3fff)+1,height:((bits>>14)&0x3fff)+1};}
 if(kind==='VP8X')return {width:(bytes[24]|(bytes[25]<<8)|(bytes[26]<<16))+1,height:(bytes[27]|(bytes[28]<<8)|(bytes[29]<<16))+1};
 fail('Unsupported WebP chunk');
}
// A master that lives in the offline archive is checked through archive-manifest.json (and the files themselves when MCY_ARCHIVE_DIR is set).
async function archivedMaster(root,relative,expectedSha){
 const archiveManifest=JSON.parse(await readFile(path.join(root,'archive-manifest.json'),'utf8'));
 const entry=archiveManifest.files.find(file=>file.path===relative);
 if(!entry||entry.sha256!==expectedSha)fail('Archived master is not recorded with this hash');
 if(process.env.MCY_ARCHIVE_DIR){const bytes=await readFile(await containedFile(process.env.MCY_ARCHIVE_DIR,'yoga-library-originals/'+relative));if(sha(bytes)!==expectedSha)fail('Archived master bytes changed');}
}
function pngDimensions(bytes){
 if(bytes.length<45||bytes.subarray(0,8).toString('hex')!=='89504e470d0a1a0a'||bytes.readUInt32BE(8)!==13||bytes.subarray(12,16).toString()!=='IHDR'||bytes.subarray(-8,-4).toString()!=='IEND')fail('Unsupported or malformed PNG');
 let offset=8,sawData=false,sawEnd=false,chunkIndex=0;
 while(offset<bytes.length){
  if(offset+12>bytes.length)fail('Truncated PNG chunk');const length=bytes.readUInt32BE(offset),end=offset+12+length;if(end>bytes.length)fail('Truncated PNG chunk');
  const type=bytes.subarray(offset+4,offset+8).toString('ascii');if(!/^[A-Za-z]{4}$/.test(type)||crc32(bytes.subarray(offset+4,end-4))!==bytes.readUInt32BE(end-4))fail('Invalid PNG chunk or CRC');
  if(type==='IHDR'&&(chunkIndex!==0||length!==13))fail('Invalid PNG IHDR');if(type==='IDAT')sawData=true;
  if(type==='IEND'){if(length!==0||!sawData||end!==bytes.length)fail('Invalid PNG IEND or missing image data');sawEnd=true;}
  offset=end;chunkIndex++;
 }
 if(!sawEnd||bytes.readUInt32BE(16)===0||bytes.readUInt32BE(20)===0)fail('Malformed PNG image');
 return {width:bytes.readUInt32BE(16),height:bytes.readUInt32BE(20)};
}

function jpegDimensions(bytes){
 if(bytes.length<4||bytes[0]!==0xff||bytes[1]!==0xd8||bytes[bytes.length-2]!==0xff||bytes[bytes.length-1]!==0xd9)fail('Malformed or truncated JPEG capture');
 let offset=2,size=null,sawScan=false;
 while(offset<bytes.length){
  if(bytes[offset]!==0xff)fail('Malformed JPEG marker');while(bytes[offset]===0xff)offset++;if(offset>=bytes.length)fail('Truncated JPEG marker');const marker=bytes[offset++];
  if(marker===0xd9){if(!size||!sawScan||offset!==bytes.length)fail('Malformed JPEG end or missing image data');return size;}
  if(marker===0||marker===0xd8||(marker>=0xd0&&marker<=0xd7))fail('Unexpected JPEG standalone marker');if(marker===0x01)continue;
  if(offset+2>bytes.length)fail('Truncated JPEG segment');const length=bytes.readUInt16BE(offset),end=offset+length,payload=offset+2;if(length<2||end>bytes.length)fail('Malformed or truncated JPEG segment');
  const sof=(marker>=0xc0&&marker<=0xcf&&![0xc4,0xc8,0xcc].includes(marker));
  if(sof){if(size||length<11)fail('Malformed JPEG frame');const components=bytes[payload+5];if(components<1||length!==8+3*components)fail('Malformed JPEG frame components');const height=bytes.readUInt16BE(payload+1),width=bytes.readUInt16BE(payload+3);if(!width||!height)fail('Invalid JPEG dimensions');size={width,height};}
  offset=end;
  if(marker===0xda){
   if(!size||length<8||length!==6+2*bytes[payload])fail('Malformed JPEG scan header');sawScan=true;const start=offset;
   while(offset<bytes.length){if(bytes[offset]!==0xff){offset++;continue;}const next=bytes[offset+1];if(next===0||(next>=0xd0&&next<=0xd7)){offset+=2;continue;}break;}
   if(offset===start||offset>=bytes.length)fail('Missing or truncated JPEG scan data');
  }
 }
 fail('Truncated JPEG capture');
}

function captureImageType(bytes){
 if(bytes.subarray(0,8).toString('hex')==='89504e470d0a1a0a')return {mime:'image/png',...pngDimensions(bytes)};
 if(bytes[0]===0xff&&bytes[1]===0xd8)return {mime:'image/jpeg',...jpegDimensions(bytes)};
 fail('Unsupported private capture image type');
}

export async function resolveObservationEvidence(observation,unit,repo=repoRoot){
 if(!observation.timestampsSeconds.length)fail('Observation needs actually viewed timestamps');unique(observation.timestampsSeconds,'observation timestamp');
 const pin=unit.provenance.sourceFiles.filter(input=>input.path===observation.evidenceRef);if(pin.length!==1)fail('Observation evidence must have one exact provenance pin');
 const evidenceFile=await containedFile(repo,observation.evidenceRef),bytes=await readFile(evidenceFile);if(sha(bytes)!==pin[0].sha256)fail('Observation evidence provenance hash mismatch');
 let document;try{document=JSON.parse(bytes.toString('utf8'));}catch{fail('Observation evidence is not JSON');}
 if(document.schemaVersion!=='mcy-private-source-observations/1'||!Array.isArray(document.records))fail('Unknown observation evidence schema');
 const matches=document.records.filter(record=>record.sourceFileName===observation.fileName&&record.sourceSha256===observation.sourceSha256);if(matches.length!==1)fail('Observation source filename or SHA does not match evidence');
 const record=matches[0],initial=record.pixelReview!==null&&typeof record.pixelReview==='object'&&!Array.isArray(record.pixelReview),supplement=Array.isArray(record.visibleTimestampsSeconds);
 if(initial===supplement||!Array.isArray(record.browserMeasurements))fail('Unknown or ambiguous observation record schema');
 const columns=initial?record.pixelReview.visibleColumns:record.visibleColumns,black=initial?record.pixelReview.blackColumns:record.blackColumns;
 if(!Array.isArray(columns)||!Array.isArray(black))fail('Missing observation pixel visibility review');unique(columns,'visible observation column');unique(black,'black observation column');
 const validColumn=column=>Number.isInteger(column)&&column>=1&&column<=record.browserMeasurements.length;
 if([...columns,...black].some(column=>!validColumn(column))||columns.some(column=>black.includes(column)))fail('Invalid observation visibility columns');
 const visible=columns.map(column=>{const measured=record.browserMeasurements[column-1];if(typeof measured.actualTime!=='number'||!Number.isFinite(measured.actualTime)||measured.actualTime<0||measured.error!==null)fail('Invalid visible browser measurement');return measured.actualTime;});
 if(supplement&&(!same(visible,record.visibleTimestampsSeconds)||record.visibleTimestampsSeconds.some(time=>typeof time!=='number'||!Number.isFinite(time))))fail('Supplement visible timestamps do not match visible columns');
 if(observation.timestampsSeconds.some(time=>!visible.includes(time)))fail('Observation timestamp lacks visible pixels in its exact evidence');
 return {visibleTimes:visible,record,evidenceFile};
}

// Freeze private screenshot evidence, not the MOV source. Windows separators in
// existing evidence metadata are normalized before the same containment checks.
export async function resolveObservationCapture(observation,unit,repo=repoRoot){
 const {record,evidenceFile}=await resolveObservationEvidence(observation,unit,repo);
 if(typeof record.capturePath!=='string'||typeof record.captureSha256!=='string'||!(/^[a-f0-9]{64}$/).test(record.captureSha256))fail('Observation capture path or SHA is missing');
 const relative=record.capturePath.replaceAll('\\','/');if(!safeRelative(relative)||!relative.toLowerCase().endsWith('.png'))fail('Unsafe observation capture path; expected the historical relative screenshot path, never a raw video');
 const file=await containedFile(path.dirname(evidenceFile),relative),bytes=await readFile(file);if(sha(bytes)!==record.captureSha256)fail('Observation capture hash mismatch');
 const image=captureImageType(bytes);
 return {file,sha256:record.captureSha256,bytes:bytes.length,evidenceFile,...image};
}

export async function validateUnit(unit,{schema,inventory,root=libraryRoot,repo=repoRoot}){
 validateSchema(unit,schema);
 unique(unit.steps.map(s=>s.id),'step ID');unique(unit.media.map(m=>m.id),'media ID');unique(unit.assetBriefs.map(b=>b.id),'asset brief ID');unique(unit.sources.map(s=>s.id),'source ID');unique(unit.sourceObservations.map(s=>s.id),'observation ID');unique(unit.legacyAliases,'legacy alias');
 const steps=new Map(unit.steps.map(s=>[s.id,s])),media=new Map(unit.media.map(m=>[m.id,m])),sources=new Set(unit.sources.map(s=>s.id)),observations=new Set(unit.sourceObservations.map(s=>s.id));
 if(['editorial_draft','media_draft'].includes(unit.productionStatus)){
  if(!unit.steps.length)fail('Draft with instructional copy needs steps');nonblank(unit.intro,'intro');nonblank(unit.scope,'scope');nonblank(unit.audience,'audience');nonblank(unit.stopGuidance,'stop guidance');if(!unit.learningObjectives.length||!unit.preparation.length)fail('Draft needs objectives and preparation');
 }
 if(!unit.blockers.length)fail('Unreviewed draft needs explicit blockers');
 const evidence=async value=>{if(observations.has(value))return;if(!safeRelative(value))fail(`Unsafe evidence path ${value}`);await containedFile(repo,value);};
 for(const source of unit.sources){let url;try{url=new URL(source.url);}catch{fail('Invalid source URL');}if(url.protocol!=='https:')fail('Source must use HTTPS');}
 for(const ref of unit.sourceRefs){const record=inventory.records.find(r=>r.id===ref.lessonId);if(!record||ref.courseId!==record.courseId||ref.youtubeId!==record.youtubeId)fail('Source reference does not match canonical inventory');}
 for(const observation of unit.sourceObservations)await resolveObservationEvidence(observation,unit,repo);
 for(let index=0;index<unit.steps.length;index++){
  const step=unit.steps[index];if(step.order!==index+1)fail('Step order must be consecutive');unique(step.sourceIds,'step source ref');unique(step.mediaIds,'step media ref');
  for(const id of step.sourceIds)if(!sources.has(id))fail('Missing step source ref');for(const ref of step.evidenceRefs)await evidence(ref);
  if(step.body.trim()&&!step.sourceIds.length&&!step.evidenceRefs.length)fail('Instructional step has no source or observed evidence');
  for(const id of step.mediaIds)if(!media.has(id)||media.get(id).stepId!==step.id)fail('Missing or wrong-step media ref');
 }
 for(const asset of unit.media){
  if(!steps.has(asset.stepId)||!steps.get(asset.stepId).mediaIds.includes(asset.id))fail('Media not bound to a step');
  if(asset.status==='draft_present'){
   nonblank(asset.provenance.tool,'present media production tool');nonblank(asset.provenance.createdAt,'present media production date');if(!/^\d{4}-\d{2}-\d{2}(?:T.*)?$/.test(asset.provenance.createdAt)||!Number.isFinite(Date.parse(asset.provenance.createdAt)))fail('Invalid present media production date');
   nonblank(asset.provenance.promptRef,'present media prompt ref');nonblank(asset.provenance.sourcePath,'present media source path');nonblank(asset.provenance.sourceSha256,'present media source SHA');
   if(!asset.path?.startsWith('media/'))fail('Present media must use package media path');nonblank(asset.alt,'media alt');nonblank(asset.caption,'media caption');
   const bytes=await readFile(await containedFile(root,asset.path));if(sha(bytes)!==asset.sha256)fail('Media hash mismatch');
   if(!['image/png','image/webp'].includes(asset.mime))fail('Only content-checked PNG or WebP supported in this package validator');const size=asset.mime==='image/webp'?webpDimensions(bytes):pngDimensions(bytes);if(size.width!==asset.width||size.height!==asset.height)fail('Media dimensions mismatch');
  }else{
   if([asset.path,asset.sha256,asset.mime,asset.width,asset.height].some(value=>value!==null))fail('Unproduced media must have null path/hash/mime/dimensions');
   if(!unit.assetBriefs.some(b=>b.mediaId===asset.id&&b.status===asset.status))fail('Missing unproduced media brief');
  }
  if(asset.provenance.sourcePath?.startsWith('archive:'))await archivedMaster(root,asset.provenance.sourcePath.slice('archive:'.length),asset.provenance.sourceSha256);
  else if(asset.provenance.sourcePath){const bytes=await readFile(await containedFile(repo,asset.provenance.sourcePath));if(sha(bytes)!==asset.provenance.sourceSha256)fail('Media provenance source hash mismatch');}
  else if(asset.provenance.sourceSha256!==null)fail('Media provenance hash without source path');
  if(asset.provenance.promptRef)await containedFile(repo,asset.provenance.promptRef);
 }
 for(const brief of unit.assetBriefs){const asset=media.get(brief.mediaId);if(!asset||asset.stepId!==brief.stepId||brief.path!==asset.path||brief.sha256!==asset.sha256||brief.status!==asset.status)fail('Asset brief reference/status mismatch');for(const id of brief.sourceIds)if(!sources.has(id))fail('Missing brief source ref');for(const ref of brief.evidenceRefs)await evidence(ref);}
 for(const sourceFile of unit.provenance.sourceFiles){const bytes=await readFile(await containedFile(repo,sourceFile.path));if(sha(bytes)!==sourceFile.sha256)fail('Provenance input changed');}
 if(unit.legacyPayload){
  const originalFile=unit.provenance.sourceFiles.find(s=>s.path.endsWith('-lesson.json'));if(!originalFile)fail('Legacy payload lacks original input');const original=await json(await containedFile(repo,originalFile.path));
  if(!same(unit.legacyPayload,original))fail('Legacy payload differs from imported source');
  for(const [target,source]of[['title','title'],['shortTitle','short'],['intro','intro'],['scope','material'],['audience','audience'],['stopGuidance','stopCue'],['subtitle','subtitle'],['readTimeNote','readTimeNote'],['ending','ending'],['reviewQuestion','reviewQuestion']])if(unit[target]!==original[source])fail(`Imported text drift ${target}`);
  if(!same(unit.learningObjectives,original.goal)||!same(unit.preparation,original.preparation)||!same(unit.alternatives,[original.alternative])||!same(unit.reviewOptions,original.reviewOptions))fail('Imported text array drift');
  if(unit.steps.length!==original.steps.length)fail('Imported step count drift');for(let i=0;i<original.steps.length;i++)for(const field of['title','body','detail','alternative'])if(unit.steps[i][field]!==original.steps[i][field])fail('Imported step copy drift');
 }
 return {id:unit.id,revision:unit.revision,locale:unit.locale,status:unit.productionStatus,steps:unit.steps.length,presentMedia:unit.media.filter(m=>m.status==='draft_present').length,missingMedia:unit.media.filter(m=>m.status!=='draft_present').length};
}

export async function validateLibrary({root=libraryRoot,repo=repoRoot}={}){
 const schema=await json(path.join(root,'contract.jsonschema')),inventory=await json(path.join(root,'inventory.json'));
 if(!same(schema,unitSchema))fail('Declarative schema differs from reviewed generator contract');
 if(inventory.schemaVersion!=='mcy-yoga-draft-1'||!Array.isArray(inventory.records))fail('Invalid inventory envelope');
 const source=await readFile(await containedFile(repo,'src/courses/freeCourses.ts'));if(sha(source)!==canonicalCatalogSha256||inventory.source.path!=='src/courses/freeCourses.ts'||inventory.source.sha256!==sha(source))fail('Canonical catalog input changed');
 const canonical=parseInventory(source.toString('utf8'));if(inventory.records.length!==38)fail('Inventory must contain exactly38records');unique(inventory.records.map(r=>r.id),'inventory record ID');unique(inventory.records.map(r=>r.youtubeId),'YouTube ID');
 for(let i=0;i<canonical.length;i++){
  const expected=canonical[i],actual=inventory.records[i];for(const field of Object.keys(expected).filter(k=>k!=='contentUnitIds'))if(!same(actual[field],expected[field]))fail(`Canonical inventory drift ${expected.id}.${field}`);
  if(Object.keys(actual).some(key=>!Object.keys(expected).includes(key))||!Array.isArray(actual.contentUnitIds))fail('Unexpected inventory field');unique(actual.contentUnitIds,'inventory unit ref');
 }
 const unitFiles=(await filesUnder(path.join(root,'units'))).filter(f=>f.endsWith('.json')).sort(),units=await Promise.all(unitFiles.map(json));unique(units.map(u=>`${u.id}@${u.revision}`),'unit revision');
 const ids=new Set(units.map(u=>u.id));for(const record of inventory.records)for(const id of record.contentUnitIds)if(!ids.has(id))fail('Inventory references missing unit');
 const results=[];for(let i=0;i<units.length;i++){
  const unit=units[i];if(path.basename(unitFiles[i])!==`${unit.revision}.json`)fail('Unit revision filename mismatch');
  results.push(await validateUnit(unit,{schema,inventory,root,repo}));
  for(const ref of unit.sourceRefs)if(!inventory.records.find(r=>r.id===ref.lessonId).contentUnitIds.includes(unit.id))fail('Missing inventory backlink for source relation');
 }
 return {status:'PASS',scope:'Local draft schema/inventory/bytes/reference consistency only; no human yoga or rights approval.',inventoryRecords:inventory.records.length,units:results,totalPresentMedia:results.reduce((n,u)=>n+u.presentMedia,0),totalMissingMedia:results.reduce((n,u)=>n+u.missingMedia,0)};
}
if(process.argv[1]===fileURLToPath(import.meta.url)){try{console.log(JSON.stringify(await validateLibrary(),null,2));}catch(error){console.error(error.stack);process.exitCode=1;}}
