import {readFile,lstat,realpath} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {validateSchema,safeRelative,libraryRoot,repoRoot} from './validate-library.mjs';
import {expansionSchema} from './expansion-contract.mjs';

export {libraryRoot,repoRoot};
export const inventoryPath='content/yoga-library/inventory.json';
export const inventorySha256='85b1242a4f9fd06fa8eb53f3a12adb4e1bc401ab277813ff149b0c9a65ebe3ed';
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const fail=message=>{throw new Error(message);};
const unique=(items,label)=>{if(new Set(items).size!==items.length)fail('Duplicate '+label);};
const nonblank=(value,label)=>{if(typeof value!=='string'||!value.trim())fail('Missing '+label);};
const knownKeywords=new Set(['$schema','$id','title','$defs','$ref','type','additionalProperties','properties','required','const','enum','items','minItems','maxItems','minLength','maxLength','minimum','maximum','pattern','anyOf']);

// Inspect every schema branch first. The reused bounded evaluator's anyOf
// selection must not hide an unsupported keyword in an unselected alternative.
export function assertBoundedExpansionSchema(schema,at='$'){
 if(!schema||typeof schema!=='object'||Array.isArray(schema))fail('Invalid schema node '+at);
 for(const key of Object.keys(schema))if(!knownKeywords.has(key))fail('Unsupported expansion schema keyword '+key+' at '+at);
 for(const [key,child] of Object.entries(schema.properties??{}))assertBoundedExpansionSchema(child,at+'.properties.'+key);
 for(const [key,child] of Object.entries(schema.$defs??{}))assertBoundedExpansionSchema(child,at+'.$defs.'+key);
 if(schema.items)assertBoundedExpansionSchema(schema.items,at+'.items');
 for(const [i,child] of (schema.anyOf??[]).entries())assertBoundedExpansionSchema(child,at+'.anyOf['+i+']');
}
export function validateExpansionSchema(value,schema=expansionSchema){
 assertBoundedExpansionSchema(schema);
 validateSchema(value,schema);
}
async function containedFile(base,relative){
 if(!safeRelative(relative))fail('Unsafe expansion relative path '+relative);
 if((await lstat(base)).isSymbolicLink())fail('Expansion base symlink denied');
 let current=base;
 for(const part of relative.split('/')){current=path.join(current,part);if((await lstat(current)).isSymbolicLink())fail('Expansion symlink denied '+relative);}
 const physical=await realpath(current),physicalRoot=await realpath(base),difference=path.relative(physicalRoot,physical);
 if(!difference||difference==='..'||difference.startsWith('..'+path.sep)||path.isAbsolute(difference))fail('Expansion path escapes root '+relative);
 if(!(await lstat(current)).isFile())fail('Expansion path is not a file '+relative);
 return current;
}
function assertNonblankStrings(value,at='$'){
 if(typeof value==='string')nonblank(value,at);
 else if(Array.isArray(value))value.forEach((item,i)=>assertNonblankStrings(item,at+'['+i+']'));
 else if(value&&typeof value==='object')for(const [key,item] of Object.entries(value))assertNonblankStrings(item,at+'.'+key);
}
function assertAcyclic(ids,edges,label){
 const active=new Set(),done=new Set();
 const visit=id=>{if(active.has(id))fail(label+' cycle');if(done.has(id))return;active.add(id);for(const next of edges(id))visit(next);active.delete(id);done.add(id);};
 for(const id of ids)visit(id);
}
const kinds={
 pose_family:{prefix:'mcy.expansion.pose.',domain:'posture'},
 pose_variant:{prefix:'mcy.expansion.variant.',domain:'posture'},
 skill:{prefix:'mcy.expansion.skill.',domain:'skill'},
 knowledge_topic:{prefix:'mcy.expansion.knowledge.',domain:'knowledge'},
 local_unresolved_topic:{prefix:'mcy.expansion.local-topic.',domain:'local_topic'}
};
const localUnits={
 'mcy.pose.kneeling-backbend':'kneeling-backbend',
 'mcy.pose.low-crow':'low-crow',
 'mcy.pose.wild-thing-high':'wild-thing-high',
 'mcy.transition.stand-up':'stand-up',
 'mcy.pose.low-wheel':'low-wheel'
};
// Explicit current crosswalk, not a universal equivalence table. New current
// unit mappings need a reviewed policy addition rather than title inference.
const linkPolicy={
 'mcy.foundation.standing':[['mcy.expansion.skill.body-awareness','related_topic'],['mcy.expansion.skill.support-point-literacy','related_topic']],
 'mcy.foundation.cat-cow':[['mcy.expansion.pose.cat','component_topic'],['mcy.expansion.pose.cow','component_topic']],
 'mcy.pose.downward-dog':[['mcy.expansion.pose.downward-dog','related_topic']],
 'mcy.pose.high-lunge':[['mcy.expansion.pose.high-lunge','related_topic']],
 'mcy.pose.warrior-ii':[['mcy.expansion.pose.warrior-ii','related_topic']],
 'mcy.pose.cobra':[['mcy.expansion.pose.cobra','related_topic']],
 'mcy.pose.cobra-gentle':[['mcy.expansion.pose.cobra','related_topic']],
 'mcy.pose.cow-face':[['mcy.expansion.pose.cow-face','component_topic']],
 'mcy.pose.three-legged-dog':[['mcy.expansion.pose.downward-dog','related_topic']],
 ...Object.fromEntries(Object.entries(localUnits).map(([id,slug])=>[id,[['mcy.expansion.local-topic.'+slug,'unverified_topic']]]))
};
linkPolicy['mcy.transition.stand-up'].push(['mcy.expansion.skill.ground-transition-literacy','unverified_topic']);
const unitFolders={
 'mcy.foundation.standing':'foundation-standing','mcy.foundation.cat-cow':'foundation-cat-cow',
 'mcy.pose.downward-dog':'downward-dog','mcy.pose.high-lunge':'high-lunge','mcy.pose.warrior-ii':'warrior-ii',
 'mcy.pose.cobra':'cobra','mcy.pose.cobra-gentle':'cobra-gentle','mcy.pose.cow-face':'cow-face','mcy.pose.three-legged-dog':'three-legged-dog',...localUnits
};
const unresolvedNames=new Set(['high-lunge','low-lunge','crow','warrior-iii','reclining-hero'].map(slug=>'mcy.expansion.pose.'+slug));
const nullSanskrit=new Set(['high-lunge','low-lunge','crow','warrior-iii'].map(slug=>'mcy.expansion.pose.'+slug));
const tuple=ref=>[ref.courseId,ref.lessonId,ref.youtubeId].join('@');
const countBy=(items,key)=>Object.fromEntries([...new Set(items.map(item=>item[key]))].sort().map(value=>[value,items.filter(item=>item[key]===value).length]));

export async function validateExpansionDocument(catalog,{schema=expansionSchema,root=libraryRoot,repo=repoRoot}={}){
 assertBoundedExpansionSchema(schema);
 if(!same(schema,expansionSchema))fail('Expansion declarative schema differs from reviewed generator contract');
 validateExpansionSchema(catalog,schema);assertNonblankStrings(catalog);
 unique(catalog.sources.map(source=>source.id),'expansion source ID');
 unique(catalog.taxonomies.map(taxonomy=>taxonomy.id),'expansion taxonomy ID');
 unique(catalog.entities.map(entity=>entity.id),'expansion entity ID');
 const sources=new Map(catalog.sources.map(source=>[source.id,source]));
 const taxonomies=new Map(catalog.taxonomies.map(taxonomy=>[taxonomy.id,taxonomy]));
 const entities=new Map(catalog.entities.map(entity=>[entity.id,entity]));
 const inventoryBytes=await readFile(await containedFile(repo,inventoryPath));
 if(hash(inventoryBytes)!==inventorySha256)fail('Expansion canonical inventory bytes changed');
 const inventory=JSON.parse(inventoryBytes);
 if(!Array.isArray(inventory.records))fail('Expansion inventory records absent');
 const inventoryRecords=new Map(inventory.records.map(record=>[[record.courseId,record.id].join('@'),record]));
 for(const source of catalog.sources){
  const date=new Date(source.accessedAt+'T00:00:00.000Z');
  if(!Number.isFinite(date.getTime())||date.toISOString().slice(0,10)!==source.accessedAt)fail('Invalid source accessedAt date');
  if(source.kind==='web_teaching'){
   let url;try{url=new URL(source.url);}catch{fail('Source must have a valid HTTPS URL');}
   if(url.protocol!=='https:'||!url.hostname||url.username||url.password||source.url!==source.url.trim())fail('Source must have a public HTTPS URL without credentials');
   if(source.repoPath!==null||source.sha256!==null)fail('Web source must have null local path/hash');
  }else{
   if(source.url!==null||source.repoPath!==inventoryPath||source.sha256!==inventorySha256)fail('Local source must pin exact inventory path/hash and null URL');
   if(hash(await readFile(await containedFile(repo,source.repoPath)))!==source.sha256)fail('Local source bytes do not match pin');
  }
 }
 const refs=(items,label)=>{
  unique(items.map(item=>JSON.stringify(item)),label+' assertion');
  for(const item of items){
   const source=sources.get(item.sourceId);if(!source)fail('Unknown source reference '+label);
   if(source.kind==='local_draft_inventory'){
    const match=/^records\[courseId=(gentle|poses|sequences),id=(0[1-9]|[12][0-9]|3[0-8])\]$/.exec(item.locator);
    if(!match||!inventoryRecords.has(match[1]+'@'+match[2]))fail('Local assertion needs exact existing inventory record locator');
   }
  }
 };
 const name=(value,label,expectedLocale=null,{alias=false}={})=>{
  if(value===null)return;
  if(expectedLocale&&value.locale!==expectedLocale)fail('Name locale mismatch '+label);
  refs(value.conceptualSourceRefs,label+' conceptual');refs(value.attestationSourceRefs,label+' attestation');
  if(value.provenance==='source_attested'){
   if(!value.sourceAttested||!value.attestationSourceRefs.length||value.conceptualSourceRefs.length)fail('Attested name needs attestation refs and no editorial conceptual refs '+label);
   const allowedScopes=alias?['alias','name_'+(value.locale==='vi-VN'?'vi':value.locale)]:['name_'+(value.locale==='vi-VN'?'vi':value.locale),'alias'];
   if(value.attestationSourceRefs.some(ref=>sources.get(ref.sourceId).kind!=='web_teaching'||!allowedScopes.includes(ref.scope)))fail('Name attestation scope/source mismatch '+label);
  }else if(value.sourceAttested||!value.conceptualSourceRefs.length||value.attestationSourceRefs.length)fail('Editorial name needs conceptual refs and must not claim attestation '+label);
  if(value.locale==='sa'&&value.provenance!=='source_attested')fail('Sanskrit must be source-attested or null');
  if(alias&&value.provenance!=='source_attested')fail('Alias must be source-attested');
 };
 for(const taxonomy of catalog.taxonomies){
  name(taxonomy.label,'taxonomy '+taxonomy.id);
  if(taxonomy.parentId!==null){const parent=taxonomies.get(taxonomy.parentId);if(!parent)fail('Unknown taxonomy parent');if(parent.domain!==taxonomy.domain)fail('Cross-domain taxonomy parent');}
 }
 assertAcyclic(taxonomies.keys(),id=>taxonomies.get(id).parentId===null?[]:[taxonomies.get(id).parentId],'Taxonomy');
 let relationCount=0,linkCount=0;
 for(const entity of catalog.entities){
  const kind=kinds[entity.kind];if(!entity.id.startsWith(kind.prefix)||!entity.id.slice(kind.prefix.length).match(/^[a-z0-9]+(?:-[a-z0-9]+)*$/))fail('Entity kind/prefix mismatch');
  if(entity.names.vi===null&&entity.names.en===null)fail('Entity requires at least a Vietnamese or English name');
  for(const [key,locale]of [['vi','vi-VN'],['en','en'],['sa','sa']])name(entity.names[key],entity.id+'.names.'+key,locale);
  unique(entity.taxonomyRefs,'entity taxonomy ref');unique(entity.contextRefs,'entity context ref');
  for(const id of entity.taxonomyRefs){const taxonomy=taxonomies.get(id);if(!taxonomy)fail('Unknown taxonomy ref');if(taxonomy.domain!==kind.domain)fail('Cross-domain entity taxonomy');}
  for(const id of entity.contextRefs)if(!sources.has(id))fail('Unknown context source ref');
  unique(entity.aliases.map(alias=>alias.name.locale+'@'+alias.name.text+'@'+alias.context),'entity alias');
  for(const alias of entity.aliases){name(alias.name,entity.id+' alias',null,{alias:true});if(alias.name.attestationSourceRefs.some(ref=>!entity.contextRefs.includes(ref.sourceId)))fail('Alias lacks explicit source context');}
  refs(entity.sourceRefs,entity.id);
  if((entity.kind==='pose_family'||entity.kind==='pose_variant')&&!entity.sourceRefs.some(ref=>sources.get(ref.sourceId).kind==='web_teaching'))fail('Local inventory cannot establish a standard asana identity');
  if(unresolvedNames.has(entity.id)&&entity.nomenclatureStatus!=='unresolved')fail('Known naming conflict must remain unresolved');
  if(nullSanskrit.has(entity.id)&&(entity.names.sa!==null||entity.aliases.some(alias=>alias.name.locale==='sa')))fail('Conflicted Sanskrit must remain null without Sanskrit aliases');
  if(entity.kind==='local_unresolved_topic'){
   if(entity.nomenclatureStatus!=='unresolved'||entity.aliases.length||entity.names.sa!==null)fail('Local unresolved topic cannot gain alias/Sanskrit/resolved identity');
   if(!entity.sourceRefs.some(ref=>sources.get(ref.sourceId).kind==='local_draft_inventory'))fail('Local unresolved topic lacks local inventory basis');
   for(const value of [entity.names.vi,entity.names.en].filter(Boolean))if(value.provenance!=='editorial_label'||value.conceptualSourceRefs.some(ref=>sources.get(ref.sourceId).kind!=='local_draft_inventory'))fail('Local unresolved names need local editorial labels');
   const linkedLocators=new Set(entity.existingContentLinks.flatMap(link=>link.inventoryRefs).map(ref=>'records[courseId='+ref.courseId+',id='+ref.lessonId+']'));
   const localAssertions=[...entity.sourceRefs,...[entity.names.vi,entity.names.en].filter(Boolean).flatMap(value=>value.conceptualSourceRefs)].filter(ref=>sources.get(ref.sourceId).kind==='local_draft_inventory');
   if(linkedLocators.size&&localAssertions.some(ref=>!linkedLocators.has(ref.locator)))fail('Local assertion locator differs from linked unit inventory record');
  }
  unique(entity.relations.map(relation=>relation.type+'@'+relation.targetId),'entity relation');
  const parents=entity.relations.filter(relation=>relation.type==='variant_of');
  if((entity.kind==='pose_variant'&&parents.length!==1)||(entity.kind!=='pose_variant'&&parents.length))fail('Variant needs exactly one family parent; other kinds cannot variant_of');
  for(const relation of entity.relations){
   relationCount++;refs(relation.sourceRefs,entity.id+' relation');
   const target=entities.get(relation.targetId);if(!target)fail('Unknown relation target');if(target.id===entity.id)fail('Self relation denied');
   if(relation.sourceRefs.some(ref=>ref.scope!=='relation'))fail('Relation assertion scope must be relation');
   if(relation.basis==='source_attested'&&relation.sourceRefs.some(ref=>sources.get(ref.sourceId).kind!=='web_teaching'))fail('Attested relation requires web teaching source');
   const posture=entity.kind==='pose_family'||entity.kind==='pose_variant',targetPosture=target.kind==='pose_family'||target.kind==='pose_variant';
   if(relation.type==='variant_of'&&(target.kind!=='pose_family'||relation.basis!=='source_attested'||relation.sourceRefs.some(ref=>sources.get(ref.sourceId).kind!=='web_teaching')))fail('Variant parent must be source-attested pose family');
   if(relation.type==='study_topic_for'&&!((posture&&['skill','knowledge_topic'].includes(target.kind))||(['skill','knowledge_topic'].includes(entity.kind)&&targetPosture)))fail('Incompatible study-topic relation kinds');
   if(relation.type==='has_named_component'&&!(posture&&targetPosture||['skill','knowledge_topic'].includes(entity.kind)&&['skill','knowledge_topic'].includes(target.kind)))fail('Incompatible named-component relation kinds');
   if(entity.kind==='local_unresolved_topic'&&targetPosture)fail('Unresolved local topic cannot map to a standard pose');
  }
  unique(entity.existingContentLinks.map(link=>[link.unitId,link.revision,link.locale].join('@')),'existing content selector');
  for(const link of entity.existingContentLinks){
   linkCount++;
   if(!linkPolicy[link.unitId]?.some(([id,relation])=>id===entity.id&&relation===link.relation))fail('Unreviewed existing-content mapping or relation');
   if(link.unitPath!=='content/yoga-library/units/'+unitFolders[link.unitId]+'/'+link.revision+'.json')fail('Existing content canonical path mismatch');
   const unit=JSON.parse(await readFile(await containedFile(repo,link.unitPath),'utf8'));
   if(unit.id!==link.unitId||unit.revision!==link.revision||unit.locale!==link.locale||path.basename(link.unitPath)!==link.revision+'.json')fail('Existing content selector mismatch');
   unique(link.inventoryRefs.map(tuple),'link inventory ref');
   const expected=(unit.sourceRefs??[]).map(tuple).sort(),actual=link.inventoryRefs.map(tuple).sort();
   if(!same(expected,actual))fail('Existing link inventory refs differ from unit');
   for(const ref of link.inventoryRefs){const record=inventoryRecords.get(ref.courseId+'@'+ref.lessonId);if(!record||record.youtubeId!==ref.youtubeId||!record.contentUnitIds.includes(unit.id))fail('Existing link inventory tuple/backlink mismatch');}
  }
 }
 assertAcyclic(entities.keys(),id=>entities.get(id).relations.filter(relation=>relation.type==='variant_of').map(relation=>relation.targetId),'Variant');
 return {status:'PASS',scope:'Local metadata-only structure, provenance-reference and current-crosswalk checks; not source truth, expertise, rights, practice or release approval.',schemaVersion:catalog.schemaVersion,taxonomyVersion:catalog.taxonomyVersion,entities:catalog.entities.length,sources:catalog.sources.length,taxonomies:catalog.taxonomies.length,counts:{byKind:countBy(catalog.entities,'kind'),bySourceKind:countBy(catalog.sources,'kind'),byTaxonomyDomain:countBy(catalog.taxonomies,'domain'),relations:relationCount,existingContentLinks:linkCount},unitCountContribution:0,mediaCountContribution:0};
}
export async function validateExpansionCatalog({root=libraryRoot,repo=repoRoot}={}){
 const schema=JSON.parse(await readFile(await containedFile(root,'expansion/catalog.schema.json'),'utf8'));
 const catalog=JSON.parse(await readFile(await containedFile(root,'expansion/catalog.json'),'utf8'));
 return validateExpansionDocument(catalog,{schema,root,repo});
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
 try{console.log(JSON.stringify(await validateExpansionCatalog(),null,2));}
 catch(error){console.error(error.stack);process.exitCode=1;}
}
