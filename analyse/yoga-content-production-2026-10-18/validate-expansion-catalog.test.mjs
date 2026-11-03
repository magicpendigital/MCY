import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir,mkdtemp,rm,symlink,readdir} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {expansionSchema} from './expansion-contract.mjs';
import {validateExpansionCatalog,validateExpansionDocument,validateExpansionSchema,inventoryPath,inventorySha256,repoRoot} from './validate-expansion-catalog.mjs';
const clone=value=>structuredClone(value),run=promisify(execFile);
const ref=(scope='conceptual_topic',sourceId='fixture-web',locator='Fictional metadata heading')=>({sourceId,scope,locator});
const editorial=(text,locale='vi-VN',sourceId='fixture-web',locator='Fictional metadata heading')=>({text,locale,provenance:'editorial_label',sourceAttested:false,conceptualSourceRefs:[ref('conceptual_topic',sourceId,locator)],attestationSourceRefs:[],reviewStatus:'pending'});
const attested=(text,locale='en')=>({text,locale,provenance:'source_attested',sourceAttested:true,conceptualSourceRefs:[],attestationSourceRefs:[ref('name_'+(locale==='vi-VN'?'vi':locale))],reviewStatus:'pending'});
const closure=()=>({productionStatus:'metadata_only',learnerVisible:false,recommendationEligible:false,publishStatus:'unpublished',review:{expert:'pending',rights:'pending',editorial:'pending',accessibility:'pending'},approvalRecords:[]});
const inventoryRef={courseId:'poses',lessonId:'21',youtubeId:'KtMlgK2cjsU'};
const unitLink=()=>({unitId:'mcy.pose.cobra',revision:'r1',locale:'vi-VN',unitPath:'content/yoga-library/units/cobra/r1.json',relation:'related_topic',inventoryRefs:[clone(inventoryRef)],scopeNote:'Fictional control fixture; no technique or exact-video claim.'});
const entity=(id='mcy.expansion.pose.cobra',kind='pose_family',taxonomy='posture.fixture')=>({id,kind,names:{vi:editorial('Nhãn kiểm metadata'),en:attested('Fictional metadata name'),sa:null},aliases:[],taxonomyRefs:[taxonomy],contextRefs:[],relations:[],existingContentLinks:[],sourceRefs:[ref()],nomenclatureStatus:'pending',...closure()});
const taxonomy=(id,domain)=>({id,domain,label:editorial('Nhãn phân loại kiểm thử'),parentId:null,classificationStatus:'editorial_proposed'});
const relation=(type,targetId,basis='source_attested')=>({type,targetId,basis,sourceRefs:[ref('relation')],reviewStatus:'pending'});
async function fixture(){
 const repo=await mkdtemp(path.join(tmpdir(),'mcy-expansion-fixture-')),root=path.join(repo,'content/yoga-library');
 await mkdir(path.join(root,'expansion'),{recursive:true});await mkdir(path.join(root,'units/cobra'),{recursive:true});
 const inventoryBytes=await readFile(path.join(repoRoot,...inventoryPath.split('/')));
 await writeFile(path.join(repo,...inventoryPath.split('/')),inventoryBytes);
 const catalog={schemaVersion:'mcy-yoga-expansion-1',taxonomyVersion:'mcy-yoga-taxonomy-1',status:'metadata_only',scopeNote:'Fictional metadata control; not a practice instruction.',nonExhaustive:true,
 sources:[{id:'fixture-web',kind:'web_teaching',url:'https://example.invalid/metadata',repoPath:null,sha256:null,title:'Fictional test source',publisher:'Fixture only',accessedAt:'2026-10-18',usage:'nomenclature_and_classification_only',limits:'Test data only; not evidence of real source truth.'},{id:'fixture-local',kind:'local_draft_inventory',url:null,repoPath:inventoryPath,sha256:inventorySha256,title:'Pinned current draft inventory',publisher:'Local fixture copy',accessedAt:'2026-10-18',usage:'nomenclature_and_classification_only',limits:'Local names do not prove asana identity.'}],
 taxonomies:[taxonomy('posture.fixture','posture'),taxonomy('skill.fixture','skill'),taxonomy('knowledge.fixture','knowledge'),taxonomy('local.fixture','local_topic')],
 entities:[entity()],...closure()};
 const unit={id:'mcy.pose.cobra',revision:'r1',locale:'vi-VN',sourceRefs:[clone(inventoryRef)]};catalog.entities[0].existingContentLinks=[unitLink()];
 const save=async()=>{await writeFile(path.join(root,'expansion/catalog.schema.json'),JSON.stringify(expansionSchema));await writeFile(path.join(root,'expansion/catalog.json'),JSON.stringify(catalog));await writeFile(path.join(root,'units/cobra/r1.json'),JSON.stringify(unit));};
 await save();return {repo,root,catalog,unit,save,validate:()=>validateExpansionCatalog({root,repo}),clean:()=>rm(repo,{recursive:true,force:true})};
}
async function withFixture(body){const f=await fixture();try{await body(f);}finally{await f.clean();}}
function addVariant(f){
 const variant=entity('mcy.expansion.variant.fixture','pose_variant');variant.relations=[relation('variant_of',f.catalog.entities[0].id)];f.catalog.entities.push(variant);return variant;
}
async function addLocal(f){
 const local=entity('mcy.expansion.local-topic.low-crow','local_unresolved_topic','local.fixture'),locator='records[courseId=poses,id=22]';
 local.names={vi:editorial('Tên local chưa xác định','vi-VN','fixture-local',locator),en:editorial('Local unresolved topic','en','fixture-local',locator),sa:null};
 local.sourceRefs=[ref('conceptual_topic','fixture-local',locator)];local.nomenclatureStatus='unresolved';
 local.existingContentLinks=[{unitId:'mcy.pose.low-crow',revision:'r1',locale:'vi-VN',unitPath:'content/yoga-library/units/low-crow/r1.json',relation:'unverified_topic',inventoryRefs:[{courseId:'poses',lessonId:'22',youtubeId:'0fs1LCnK3-U'}],scopeNote:'Unresolved local fixture; no standard-asana identity.'}];
 await mkdir(path.join(f.root,'units/low-crow'),{recursive:true});await writeFile(path.join(f.root,'units/low-crow/r1.json'),JSON.stringify({id:'mcy.pose.low-crow',revision:'r1',locale:'vi-VN',sourceRefs:local.existingContentLinks[0].inventoryRefs}));f.catalog.entities.push(local);return local;
}
test('fictional metadata passes without adding units/media or public flags',()=>withFixture(async f=>{const result=await f.validate();assert.equal(result.status,'PASS');assert.equal(result.entities,1);assert.equal(result.unitCountContribution,0);assert.equal(result.mediaCountContribution,0);assert.equal(result.counts.existingContentLinks,1);assert.equal(f.catalog.learnerVisible,false);}));
test('source-attested variant has exactly one family parent',()=>withFixture(async f=>{addVariant(f);await f.save();assert.equal((await f.validate()).counts.byKind.pose_variant,1);}));
test('local unresolved source uses exact pinned local inventory and selector',()=>withFixture(async f=>{await addLocal(f);await f.save();assert.equal((await f.validate()).counts.byKind.local_unresolved_topic,1);}));
test('related-topic cycles are allowed and are not treated as prerequisites',()=>withFixture(async f=>{const other=entity('mcy.expansion.pose.other');f.catalog.entities.push(other);f.catalog.entities[0].relations=[relation('related_to',other.id,'editorial_topic')];other.relations=[relation('related_to',f.catalog.entities[0].id,'editorial_topic')];await f.save();assert.equal((await f.validate()).counts.relations,2);}));

for(const field of ['cues','dose','benefits','difficulty','suitableFor','media','practiceDurationSeconds'])test('rejects forbidden entity field '+field,()=>withFixture(async f=>{f.catalog.entities[0][field]='not allowed';await f.save();await assert.rejects(f.validate(),/Unexpected property/);}));
for(const [label,mutate,pattern]of[
 ['public entity',f=>f.catalog.entities[0].learnerVisible=true,/Invalid constant/],
 ['public envelope',f=>f.catalog.learnerVisible=true,/Invalid constant/],
 ['recommendation',f=>f.catalog.entities[0].recommendationEligible=true,/Invalid constant/],
 ['published',f=>f.catalog.publishStatus='published',/Invalid constant/],
 ['approved review',f=>f.catalog.entities[0].review.expert='approved',/Invalid constant/],
 ['approval record',f=>f.catalog.approvalRecords.push({invented:true}),/Too many items/],
 ['duplicate entity',f=>f.catalog.entities.push(clone(f.catalog.entities[0])),/Duplicate expansion entity/],
 ['duplicate source',f=>f.catalog.sources.push(clone(f.catalog.sources[0])),/Duplicate expansion source/],
 ['duplicate taxonomy',f=>f.catalog.taxonomies.push(clone(f.catalog.taxonomies[0])),/Duplicate expansion taxonomy/],
 ['unknown source',f=>f.catalog.entities[0].sourceRefs[0].sourceId='unknown',/Unknown source/],
 ['empty locator',f=>f.catalog.entities[0].sourceRefs[0].locator=' ',/Missing/],
 ['HTTP source',f=>f.catalog.sources[0].url='http://example.invalid/source',/HTTPS/],
 ['credential URL',f=>f.catalog.sources[0].url='https://user:secret@example.invalid/source',/HTTPS/],
 ['web local path',f=>f.catalog.sources[0].repoPath=inventoryPath,/Web source/],
 ['local external URL',f=>f.catalog.sources[1].url='https://example.invalid/not-local',/Local source/],
 ['local source path drift',f=>f.catalog.sources[1].repoPath='../outside.json',/Local source/],
 ['local hash drift',f=>f.catalog.sources[1].sha256='0'.repeat(64),/Local source/],
 ['invalid source date',f=>f.catalog.sources[0].accessedAt='2026-02-30',/accessedAt/],
 ['empty source registry',f=>f.catalog.sources=[],/Too few items/],
 ['Sanskrit editorial',f=>f.catalog.entities[0].names.sa=editorial('Invented Sanskrit','sa'),/Sanskrit/],
 ['attestation absent',f=>f.catalog.entities[0].names.en.attestationSourceRefs=[],/Attested name/],
 ['false editorial attestation',f=>f.catalog.entities[0].names.vi.sourceAttested=true,/Editorial name/],
 ['conceptual source absent',f=>f.catalog.entities[0].names.vi.conceptualSourceRefs=[],/Editorial name/],
 ['primary locale mismatch',f=>f.catalog.entities[0].names.en.locale='sa',/Name locale/],
 ['name attestation scope mismatch',f=>f.catalog.entities[0].names.en.attestationSourceRefs[0].scope='name_sa',/attestation scope/],
 ['unknown taxonomy',f=>f.catalog.entities[0].taxonomyRefs=['missing'],/Unknown taxonomy/],
 ['cross-domain taxonomy',f=>f.catalog.entities[0].taxonomyRefs=['skill.fixture'],/Cross-domain entity/],
 ['unknown taxonomy parent',f=>f.catalog.taxonomies[0].parentId='missing',/Unknown taxonomy parent/],
 ['cross-domain taxonomy parent',f=>f.catalog.taxonomies[0].parentId='skill.fixture',/Cross-domain taxonomy parent/],
 ['taxonomy cycle',f=>{f.catalog.taxonomies.push(taxonomy('posture.second','posture'));f.catalog.taxonomies[0].parentId='posture.second';f.catalog.taxonomies.at(-1).parentId='posture.fixture';},/Taxonomy cycle/],
 ['unknown context',f=>f.catalog.entities[0].contextRefs=['unknown'],/Unknown context/],
 ['kind prefix drift',f=>f.catalog.entities[0].id='mcy.expansion.skill.cobra',/kind\/prefix/],
 ['unknown relation target',f=>f.catalog.entities[0].relations=[relation('related_to','missing')],/Unknown relation target/],
 ['forbidden relation',f=>f.catalog.entities[0].relations=[relation('safe_for',f.catalog.entities[0].id)],/Invalid enum/],
 ['family variant parent',f=>f.catalog.entities[0].relations=[relation('variant_of','missing')],/Variant needs/],
 ['variant parent absent',f=>{addVariant(f).relations=[];},/Variant needs/],
 ['variant chain or cycle',f=>{const v=addVariant(f),other=entity('mcy.expansion.variant.other','pose_variant');other.relations=[relation('variant_of',v.id)];v.relations=[relation('variant_of',other.id)];f.catalog.entities.push(other);},/Variant parent/],
 ['editorial variant basis',f=>addVariant(f).relations[0].basis='editorial_topic',/Variant parent/],
 ['relation assertion scope',f=>{const v=addVariant(f);v.relations[0].sourceRefs[0].scope='name_en';},/Relation assertion scope/],
 ['wrong study kinds',f=>{const other=entity('mcy.expansion.pose.other');f.catalog.entities.push(other);f.catalog.entities[0].relations=[relation('study_topic_for',other.id)];},/Incompatible study/],
 ['unreviewed content mapping',f=>f.catalog.entities[0].existingContentLinks[0].unitId='mcy.foundation.standing',/Unreviewed existing-content/],
 ['exact-match relation',f=>f.catalog.entities[0].existingContentLinks[0].relation='exact_match',/Invalid enum/],
 ['unit path traversal',f=>f.catalog.entities[0].existingContentLinks[0].unitPath='content/yoga-library/units/../secret.json',/Invalid pattern/],
 ['absolute unit path',f=>f.catalog.entities[0].existingContentLinks[0].unitPath='D:/secret.json',/Invalid pattern/],
 ['wrong canonical unit folder',f=>f.catalog.entities[0].existingContentLinks[0].unitPath='content/yoga-library/units/other/r1.json',/canonical path mismatch/],
 ['unit ID drift',f=>f.unit.id='mcy.changed',/selector mismatch/],
 ['unit revision drift',f=>f.unit.revision='r2',/selector mismatch/],
 ['unit locale drift',f=>f.unit.locale='en',/selector mismatch/],
 ['inventory tuple drift',f=>f.catalog.entities[0].existingContentLinks[0].inventoryRefs[0].youtubeId='aaaaaaaaaaa',/inventory refs differ/],
 ['missing inventory refs',f=>f.catalog.entities[0].existingContentLinks[0].inventoryRefs=[],/inventory refs differ/],
 ['alias editorial claim',f=>{f.catalog.entities[0].aliases=[{name:editorial('Alias'),context:'Fictional'}];},/Alias must be/],
 ['alias without context ref',f=>{f.catalog.entities[0].aliases=[{name:attested('Alias'),context:'Fictional source context'}];},/Alias lacks/],
 ['known conflict resolved',f=>{const e=f.catalog.entities[0];e.id='mcy.expansion.pose.warrior-iii';e.existingContentLinks=[];},/conflict must remain/],
 ['conflicted Sanskrit filled',f=>{const e=f.catalog.entities[0];e.id='mcy.expansion.pose.warrior-iii';e.existingContentLinks=[];e.nomenclatureStatus='unresolved';e.names.sa=attested('Suspicious heading','sa');},/Conflicted Sanskrit/],
 ['local inventory posing as external asana',f=>{const e=f.catalog.entities[0];e.existingContentLinks=[];e.sourceRefs=[ref('conceptual_topic','fixture-local','records[courseId=poses,id=22]')];},/cannot establish/]
])test('rejects '+label,()=>withFixture(async f=>{mutate(f);await f.save();await assert.rejects(f.validate(),pattern);}));

test('rejects current inventory bytes changing in fixture',()=>withFixture(async f=>{await writeFile(path.join(f.repo,...inventoryPath.split('/')),'{}');await assert.rejects(f.validate(),/inventory bytes changed/);}));
test('rejects weakening schema artifact even if value would pass the weakened rule',()=>withFixture(async f=>{const weakened=clone(expansionSchema);weakened.properties.learnerVisible={type:'boolean'};await writeFile(path.join(f.root,'expansion/catalog.schema.json'),JSON.stringify(weakened));f.catalog.learnerVisible=true;await writeFile(path.join(f.root,'expansion/catalog.json'),JSON.stringify(f.catalog));await assert.rejects(f.validate(),/schema differs/);}));
test('unknown schema keyword fails in an unselected anyOf branch',()=>{const schema={anyOf:[{type:'string'},{type:'number',not:{const:0}}]};assert.throws(()=>validateExpansionSchema('valid-string',schema),/Unsupported expansion schema keyword/);});
test('rejects local name falsely attested',()=>withFixture(async f=>{const local=await addLocal(f);local.names.vi=attested('Local title','vi-VN');local.names.vi.attestationSourceRefs=[ref('name_vi','fixture-local','records[courseId=poses,id=22]')];await f.save();await assert.rejects(f.validate(),/attestation scope\/source/);}));
test('rejects unresolved local becoming a standard-asana relation',()=>withFixture(async f=>{const local=await addLocal(f);local.relations=[relation('related_to',f.catalog.entities[0].id,'editorial_topic')];await f.save();await assert.rejects(f.validate(),/cannot map to a standard pose/);}));
test('rejects false inventory record locator',()=>withFixture(async f=>{const local=await addLocal(f);local.sourceRefs[0].locator='records[courseId=poses,id=38]';await f.save();await assert.rejects(f.validate(),/exact existing inventory record/);}));
test('rejects a real but unrelated local entity source record',()=>withFixture(async f=>{const local=await addLocal(f);local.sourceRefs[0].locator='records[courseId=poses,id=19]';await f.save();await assert.rejects(f.validate(),/differs from linked unit inventory/);}));
test('rejects a real but unrelated local name source record',()=>withFixture(async f=>{const local=await addLocal(f);local.names.vi.conceptualSourceRefs[0].locator='records[courseId=poses,id=19]';await f.save();await assert.rejects(f.validate(),/differs from linked unit inventory/);}));
test('rejects local aliases',()=>withFixture(async f=>{const local=await addLocal(f);local.aliases=[{name:attested('Unproved alias'),context:'Fictional'}];local.contextRefs=['fixture-web'];await f.save();await assert.rejects(f.validate(),/cannot gain alias/);}));
test('rejects direct standard-asana link to unresolved low-crow unit',()=>withFixture(async f=>{const local=await addLocal(f);f.catalog.entities[0].existingContentLinks=[clone(local.existingContentLinks[0])];await f.save();await assert.rejects(f.validate(),/Unreviewed existing-content/);}));
test('rejects Cow Face full-pose related link instead of arm-component link',()=>withFixture(async f=>{const e=f.catalog.entities[0];e.id='mcy.expansion.pose.cow-face';e.existingContentLinks[0].unitId='mcy.pose.cow-face';await f.save();await assert.rejects(f.validate(),/Unreviewed existing-content/);}));
test('rejects standing foundation conflated with stand-up24',()=>withFixture(async f=>{const e=f.catalog.entities[0];e.id='mcy.expansion.pose.mountain';e.existingContentLinks[0].unitId='mcy.foundation.standing';await f.save();await assert.rejects(f.validate(),/Unreviewed existing-content/);}));
test('rejects missing linked unit file',()=>withFixture(async f=>{await rm(path.join(f.root,'units/cobra/r1.json'));await assert.rejects(f.validate(),/ENOENT/);}));
test('denies a symlink linked unit instead of following it',async t=>withFixture(async f=>{const target=path.join(f.repo,'outside-unit.json'),link=path.join(f.root,'units/cobra/r1.json');await writeFile(target,JSON.stringify(f.unit));await rm(link);try{await symlink(target,link,'file');}catch(error){if(['EPERM','EACCES','ENOTSUP'].includes(error.code)){t.skip('OS does not permit file symlinks in this fixture');return;}throw error;}await assert.rejects(f.validate(),/symlink denied/);}));
test('importing the checker produces no output and creates no files',()=>withFixture(async f=>{const before=await readdir(f.root,{recursive:true});const url=pathToFileURL(path.join(repoRoot,'analyse/yoga-content-production-2026-10-18/validate-expansion-catalog.mjs')).href;const result=await run(process.execPath,['--input-type=module','-e','await import('+JSON.stringify(url)+')'],{cwd:f.root});assert.equal(result.stdout,'');assert.equal(result.stderr,'');assert.deepEqual(await readdir(f.root,{recursive:true}),before);}));
test('RAM document validation is read-only and does not count metadata as unit/media',()=>withFixture(async f=>{const before=JSON.stringify(f.catalog);const result=await validateExpansionDocument(f.catalog,{root:f.root,repo:f.repo});assert.equal(JSON.stringify(f.catalog),before);assert.equal(result.unitCountContribution+result.mediaCountContribution,0);}));
