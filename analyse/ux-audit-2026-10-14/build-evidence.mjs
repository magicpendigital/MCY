import {readFile,writeFile,readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve,relative} from 'node:path';
const root=resolve('D:/Projects/MCY');
const dir=resolve(root,'analyse/ux-audit-2026-10-14');
const hash=data=>createHash('sha256').update(data).digest('hex');
const sourcePaths=['src/Prototype.tsx','src/prototype.css','src/JourneyScreen.tsx','src/courses/DiscoverScreen.tsx','src/courses/CourseDetailScreen.tsx','src/courses/freeCourses.ts','src/i18n.ts','design-system/tokens.css','brand/BRAND_GUIDELINES.md','docs/content-review/README.md','supabase/functions/_shared/reviewedPracticeCatalog.ts'];
const sourceReadbackAtEnd=[];
for(const path of sourcePaths) sourceReadbackAtEnd.push({path,sha256:hash(await readFile(resolve(root,path)))});
const screenshots=[];
for(const file of (await readdir(dir)).filter(f=>/^\d\d-.*\.jpg$/.test(f)).sort()){
 const bytes=await readFile(resolve(dir,file));
 screenshots.push({file,sha256:hash(bytes),bytes:bytes.length,status:file.startsWith('02-')?'REJECTED_ANIMATION_IN_PROGRESS':'ACCEPTED_VISUALLY_INSPECTED',...(file.startsWith('02-')?{replacement:'19-welcome-mobile-stable.jpg'}:{})});
}
const manifest={auditDate:'2026-10-14',timezone:'Asia/Bangkok',recordedAt:new Date().toISOString(),surface:'Current local source; browser audit; guest; consent DEV layout fixture without UID',origin:'http://127.0.0.1:4184',previewIsolation:{envDir:'empty-env (no env files loaded)',backend:'https://mcy-playwright.invalid',key:'fictional fixture',knownServerCredentialsRemoved:true},runtimeIntegrity:'PASS, 28 protected files, before preview',sourceReadbackAtEnd,screenshots,acceptedScreenshots:screenshots.filter(s=>s.status.startsWith('ACCEPTED')).length,observations:{guestStandalone:'Selected none_now -> step 2 -> standalone record -> Journey empty, no not-saved explanation. Source agrees for default guest saveFeedbackConsent=false.',controls:'Notifications toggle:56x30 CSS px,font9px; consent preview buttons:height36px,font10px',typography:'NFC correct DOM, computed Georgia/Times New Roman/serif; visible Vietnamese glyph spacing errors. Font fallback cause supported but not browser platform-fonts verified.',youtube:'One explicitly opened iframe displayed a video frame; no complete-watch, caption, instructional-content or native-playback acceptance.',responsive:'390x844 main route;360x640 Discover;1440x900 Home/Discover; iPhone/Pixel review welcome'},limits:['No cloud/backend writes or real actor session','No app-source changes, build/install/deploy or AI inference','No native trial rerun; prior closed trial status unchanged','No screen-reader, keyboard traversal, zoom200%, full contrast or physical-device acceptance','No user research or measured conversion impact','Source-only findings F02/F11 need isolated UI fixtures','No claim source was immutable throughout concurrent workspace activity'],report:{path:'index.html',sha256:hash(await readFile(resolve(dir,'index.html')))}};
await writeFile(resolve(dir,'evidence-manifest.json'),JSON.stringify(manifest,null,2)+'\n');
console.log(JSON.stringify({accepted:manifest.acceptedScreenshots,rejected:screenshots.length-manifest.acceptedScreenshots,sourceFiles:sourcePaths.length,output:relative(root,resolve(dir,'evidence-manifest.json'))}));
