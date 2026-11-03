import fs from 'node:fs'; import path from 'node:path'; import crypto from 'node:crypto'; import assert from 'node:assert/strict';
import {createServer} from 'vite'; import {chromium, expect} from '@playwright/test'; import {isolatePlaywrightTestEnvironment} from '../../scripts/playwright-test-environment.mjs';
const root = path.resolve(import.meta.dirname, '../..'), dir = path.join(import.meta.dirname, 'editor-baseline-control'); fs.mkdirSync(dir, {recursive:true});
const hash = p => crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const scenarios = [
 {name:'approved44', file:path.join(root,'analyse/ux-step4-4-2026-10-17/SOURCE-FREEZE.json'), sha:'f11a6af114f42427cd6d758f5ac191d0af65324d5018e82524adf913fde7e243'},
 {name:'candidate45v2', file:path.join(import.meta.dirname,'SOURCE-FREEZE-v2.json'), sha:'f57b2ba99aad152ffa52192ea40725ceab0a9ba6005a347323c11a880e7301a8'}
];
function pins(s) {assert.equal(hash(s.file),s.sha);for(const i of s.source.appInputs)assert.equal(hash(path.join(s.source.candidate,i.path)),i.sha256,i.path);for(const i of s.source.harnessAndIntake)assert.equal(hash(path.join(root,i.path)),i.sha256,i.path);}
for(const s of scenarios){s.source=JSON.parse(fs.readFileSync(s.file,'utf8'));pins(s);}
for(const k of Object.keys(process.env))if(k.startsWith('VITE_'))delete process.env[k];isolatePlaywrightTestEnvironment();
const browser=await chromium.launch({channel:'msedge',headless:true,proxy:{server:'http://127.0.0.1:9',bypass:'127.0.0.1,localhost'}}), observations=[];
const active=p=>p.getByTestId('flow-current');
async function tabTo(p,s,max=45){for(let i=0;i<max;i++){await p.keyboard.press('Tab');if(await p.evaluate(s=>document.activeElement?.matches(s),s))return;}throw Error('Tab did not reach '+s);}
async function geometry(p){return p.evaluate(()=>{const e=document.activeElement,box=n=>{const r=n.getBoundingClientRect();return{top:r.top,bottom:r.bottom,left:r.left,right:r.right,height:r.height};},dialog=e.closest('[role=dialog]'),style=getComputedStyle(e);return{focused:box(e),tag:e.tagName,dialog:box(dialog),viewport:box(document.querySelector('.mobile-app-viewport')),sheetContent:box(dialog.querySelector('.sheet-content')),sheetScrollTop:dialog.querySelector('.sheet-content').scrollTop,ring:parseFloat(style.outlineWidth)+parseFloat(style.outlineOffset),value:e.value};});}
try{
 for(const s of scenarios){
  const server=await createServer({root:s.source.candidate,envDir:path.join(dir,s.name,'.invalid'),configFile:path.join(s.source.candidate,'vite.config.ts'),configLoader:'runner',cacheDir:path.join(dir,s.name,'.vite-cache'),server:{host:'127.0.0.1',port:4211,strictPort:true,fs:{allow:[s.source.candidate,path.join(root,'node_modules')]}}});
  const context=await browser.newContext({viewport:{width:320,height:568},reducedMotion:'reduce'}),p=await context.newPage();
  try{await server.listen();await context.route('**/*',r=>new URL(r.request().url()).hostname==='127.0.0.1'?r.fallback():r.abort());await p.route('https://www.youtube-nocookie.com/embed/**',r=>r.fulfill({contentType:'text/html',body:'<!doctype html><title>Control player fixture</title>'}));
   await p.goto('http://127.0.0.1:4211/?mode=web');await p.getByRole('button',{name:'Thử tìm hiểu như khách',exact:true}).click();await p.getByRole('button',{name:'Tiếp: năng lượng và thời gian',exact:true}).click();await p.getByRole('button',{name:'Tự chọn bài học video miễn phí',exact:true}).click();await p.getByRole('button',{name:/Một chút chuyển động nhẹ/}).click();await active(p).locator('.mcy-course-play').click();await active(p).getByRole('button',{name:'Tôi đã thực hành · ghi cảm nhận',exact:true}).click();await expect(active(p).locator('.mcy-reflection-page')).toBeVisible();
   if(s.name==='candidate45v2')await active(p).locator('.mcy-reflection-details > summary').click();
   await active(p).getByRole('button',{name:'Ghi thêm vùng khác sau tập',exact:true}).click();await p.getByRole('dialog').getByRole('button',{name:'Khuỷu tay',exact:true}).click();await p.waitForTimeout(750);
   await tabTo(p,'.mcy-region-editor .mcy-editor-options:not(.side) button:nth-child(3)');await p.keyboard.press('Enter');await tabTo(p,'.mcy-region-editor .mcy-editor-options.side button:nth-child(2)');await p.keyboard.press('Enter');await tabTo(p,'.mcy-region-editor textarea');await p.keyboard.type('Fictional editor note');
   const immediate=await geometry(p);await p.waitForTimeout(750);const settled=await geometry(p);await p.screenshot({path:path.join(dir,s.name+'-textarea-settled.png')});
   await tabTo(p,'.mcy-region-editor > .mcy-action');const saveFocused=await geometry(p);await p.waitForTimeout(500);const saveSettled=await geometry(p);await p.screenshot({path:path.join(dir,s.name+'-save-focused.png')});
   assert.ok(saveSettled.focused.top>=saveSettled.dialog.top-1 && saveSettled.focused.bottom<=saveSettled.dialog.bottom+1,'Save must be keyboard reachable inside dialog');
   await p.keyboard.press('Enter');await expect(p.getByRole('dialog')).toHaveCount(0);await active(p).getByRole('button',{name:'Ghi thêm vùng khác sau tập',exact:true}).click();await p.getByRole('dialog').getByRole('button',{name:'Khuỷu tay',exact:true}).click();await expect(p.getByRole('dialog').locator('.mcy-editor-note textarea')).toHaveValue('Fictional editor note');
   observations.push({name:s.name,sourceSha:s.sha,status:'PASS_REACHABILITY',immediate,settled,saveFocused,saveSettled,savedNotePreserved:true});pins(s);
  }catch(e){observations.push({name:s.name,sourceSha:s.sha,status:'FAIL',error:e.stack});await p.screenshot({path:path.join(dir,s.name+'-failure.png')}).catch(()=>{});}
  finally{await context.close();await server.close();fs.writeFileSync(path.join(dir,'progress.json'),JSON.stringify(observations,null,2)+'\n');}
 }
 for(const s of scenarios)pins(s);
}finally{await browser.close();}
const both=observations.every(o=>o.status==='PASS_REACHABILITY'),comparison=both?{topDifference:observations[1].settled.focused.top-observations[0].settled.focused.top,bottomDifference:observations[1].settled.focused.bottom-observations[0].settled.focused.bottom}:null;
const result={command:'node analyse/ux-step4-5-2026-10-17/editor-baseline-control.mjs',executedAt:new Date().toISOString(),status:both?'PASS_BOUNDED_CONTROL':'FAIL',exitCode:both?0:1,observations,comparison,pinsMatchBeforeAfter:true,limits:'Comparison/reachability diagnostic only; partial textarea focus, if present in both, is retained as baseline gap rather than claimed full visibility; no runtime/app edits or live actions'};
fs.writeFileSync(path.join(dir,'results.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result,null,2));process.exitCode=result.exitCode;
