import {readFile,writeFile,mkdir,copyFile,readdir} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {unitSchema,unitTemplate,schemaVersion,pending} from './library-contract.mjs';
const here=path.dirname(fileURLToPath(import.meta.url));
const repo=path.resolve(here,'../..');
const root=path.join(repo,'content/yoga-library');
const original=path.join(repo,'analyse/foundation-series-2026-10-16');
const hash=b=>createHash('sha256').update(b).digest('hex');
export const canonicalCatalogSha256='92cfc2e572a9aa94abdce1843609634a536d80ee29eecb55d12d21ddfa9e5436';
const relative=p=>path.relative(repo,p).split(path.sep).join('/');
const writeJson=async(p,data)=>{await mkdir(path.dirname(p),{recursive:true});await writeFile(p,JSON.stringify(data,null,2)+'\n','utf8');};

export function parseInventory(source){
 const records=[];let courseId=null;
 for(const line of source.split(/\r?\n/)){
  const group=line.match(/^    id: "(gentle|poses|sequences)"/);if(group)courseId=group[1];
  const clip=line.match(/youtubeLesson\("(\d+)", "([^"]+)", "([^"]+)", "([^"]+)"(?:, "([^"]+)")?\)/);
  if(clip)records.push({courseId,id:clip[1],youtubeId:clip[2],title:clip[3],duration:clip[4],description:'Video hướng dẫn yoga từ kênh Một chút yoga. Bạn tự chọn biên độ phù hợp và dừng lại nếu thấy đau tăng hoặc không an toàn.',visibility:'unlisted',orientation:clip[5]??'portrait',channelCaptionsVerified:false,channelCaptionLanguages:[],contentUnitIds:[],contentReviewStatus:'not_reviewed',rightsStatus:'pending',expertStatus:'pending'});
 }
 if(records.length!==38||records.some(r=>!r.courseId))throw new Error('Canonical source shape changed; stop parser.');
 return records;
}

export async function buildLibrary(){
 await mkdir(root,{recursive:true});
 await writeJson(path.join(root,'contract.jsonschema'),unitSchema);
 await writeJson(path.join(here,'UNIT-TEMPLATE.json'),unitTemplate);
 const sourcePath=path.join(repo,'src/courses/freeCourses.ts'),sourceBytes=await readFile(sourcePath);
 if(hash(sourceBytes)!==canonicalCatalogSha256)throw new Error('Canonical source bytes changed; review parser and crosswalk before rebuilding.');
 const records=parseInventory(sourceBytes.toString('utf8'));
 // Preserve future editorial crosswalks if rebuilding canonical imported inputs.
 try{const previous=JSON.parse(await readFile(path.join(root,'inventory.json'),'utf8'));for(const record of records){const old=previous.records.find(r=>r.id===record.id&&r.youtubeId===record.youtubeId);if(old)record.contentUnitIds=old.contentUnitIds;}}catch(e){if(e.code!=='ENOENT')throw e;}
 for(const record of records)if(record.id==='27'&&!record.contentUnitIds.includes('mcy.foundation.cat-cow'))record.contentUnitIds.push('mcy.foundation.cat-cow');
 await writeJson(path.join(root,'inventory.json'),{schemaVersion,source:{path:relative(sourcePath),sha256:hash(sourceBytes),observedAt:'2026-10-18',observation:'Local catalog bytes only; no current provider or video-content verification.'},records});
 const overlayPath=path.join(original,'assets/photo-media.json'),overlayBytes=await readFile(overlayPath),overlay=JSON.parse(overlayBytes);
 for(const [legacy,directory,id,kind] of [['standing','foundation-standing','mcy.foundation.standing','pose_education'],['tabletop','foundation-cat-cow','mcy.foundation.cat-cow','movement_education']]){
  const jsonPath=path.join(original,`${legacy}-lesson.json`),jsonBytes=await readFile(jsonPath),lesson=JSON.parse(jsonBytes);
  const media=[];
  for(let i=0;i<lesson.steps.length;i++)for(const variant of ['photo_ai','illustration']){
   const content=variant==='photo_ai'?overlay[legacy][i]:lesson.steps[i];
   const sourcePath=path.join(original,content.image),bytes=await readFile(sourcePath);
   if(bytes.subarray(0,8).toString('hex')!=='89504e470d0a1a0a')throw new Error('Expected PNG '+sourcePath);
   const target=path.join(root,'media',directory,'r3',path.basename(sourcePath));await mkdir(path.dirname(target),{recursive:true});await copyFile(sourcePath,target);
   media.push({id:`${directory}-step-${i+1}-${variant}`,stepId:`step-${i+1}`,variant,status:'draft_present',path:path.relative(root,target).split(path.sep).join('/'),sha256:hash(bytes),mime:'image/png',width:bytes.readUInt32BE(16),height:bytes.readUInt32BE(20),alt:content.alt,caption:content.caption,synthetic:true,disclosure:variant==='photo_ai'?'Ảnh AI minh họa; không phải ảnh giáo viên thật hoặc bằng chứng kỹ thuật đã được duyệt.':'Minh họa tạo bằng AI; chưa được thẩm định kỹ thuật tư thế.',rightsStatus:'pending',expertStatus:'pending',provenance:{tool:'image_gen',createdAt:'2026-10-16',sourcePath:relative(sourcePath),sourceSha256:hash(bytes),promptRef:`analyse/foundation-series-2026-10-16/assets/${variant==='photo_ai'?'PHOTO-MEDIA':legacy==='standing'?'STANDING-IMAGES':'TABLETOP-IMAGES'}.vi.md`,notes:'Imported unchanged from standalone Owner preview. Synthetic media; human expertise/rights review pending.'}});
  }
  const unit={schemaVersion,id,revision:'r3',legacyAliases:[legacy,lesson.version],locale:'vi-VN',kind,seriesId:'mcy.series.foundation',productionStatus:'media_draft',learnerVisible:false,recommendationEligible:false,publishStatus:'unpublished',title:lesson.title,shortTitle:lesson.short,intro:lesson.intro,scope:lesson.material,learningObjectives:lesson.goal,audience:lesson.audience,prerequisites:[],preparation:lesson.preparation,stopGuidance:lesson.stopCue,alternatives:[lesson.alternative],readTimeSecondsEstimate:lesson.minutes*60,practiceDurationSeconds:null,
   sourceRefs:legacy==='tabletop'?[{courseId:'poses',lessonId:'27',youtubeId:'rWl5ySBsrG0',relation:'topic_reference',contentObserved:false}]:[],sourceObservations:[],
   steps:lesson.steps.map((s,i)=>({id:`step-${i+1}`,order:i+1,title:s.title,body:s.body,detail:s.detail,entry:'',exit:'',alternative:s.alternative,stopCue:lesson.stopCue,sourceIds:lesson.sources.map((_,j)=>`source-${j+1}`),evidenceRefs:[relative(jsonPath)],mediaIds:media.filter(m=>m.stepId===`step-${i+1}`).map(m=>m.id)})),
   media,assetBriefs:[],sources:lesson.sources.map((s,i)=>({id:`source-${i+1}`,title:s.title,url:s.url,use:s.use,accessedAt:null})),review:pending(),blockers:['Chưa có người thật thẩm định chuyên môn yoga.','Chưa có thẩm định quyền text/media và khả năng tiếp cận trước phát hành.','Chưa có adapter reader/CMS; không import vào app hoặc reviewed catalog.'],changeLog:['r3: nhập nguyên nội dung bản16/10/2026 và thêm hai biến thể ảnhAI/minh họa có hash; không mang approval cũ.'],provenance:{createdAt:'2026-10-18',authoring:'imported_ai_assisted_draft',sourceFiles:[{path:relative(jsonPath),sha256:hash(jsonBytes)},{path:relative(overlayPath),sha256:hash(overlayBytes)}],notes:'Imported copy preserved; source URLs inherited without claiming a new web verification. Topic relation is not a transcript of the instructor video.'},subtitle:lesson.subtitle,readTimeNote:lesson.readTimeNote,ending:lesson.ending,reviewQuestion:lesson.reviewQuestion,reviewOptions:lesson.reviewOptions,preferredMediaVariant:'photo_ai',legacyPayload:lesson};
  await writeJson(path.join(root,'units',directory,'r3.json'),unit);
 }
 return {schema:path.join(root,'contract.jsonschema'),records:records.length,foundationUnits:2,copiedMedia:20};
}
if(process.argv[1]===fileURLToPath(import.meta.url))console.log(JSON.stringify(await buildLibrary(),null,2));
