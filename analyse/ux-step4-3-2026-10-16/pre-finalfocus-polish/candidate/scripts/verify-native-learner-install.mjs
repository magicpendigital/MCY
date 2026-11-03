// Read-only device preservation, actual installed bytes and native DOM snapshot.
// Never changes app state, session, settings, roles or data; no sign-in/data write.
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {readFileSync,writeFileSync} from 'node:fs';
const serial='Q88549EEXCUOONGA',app='com.nilaza.motchutyoga.mcydebug';
const adb=(args,binary=false)=>execFileSync('adb',['-s',serial,...args],{encoding:binary?undefined:'utf8',windowsHide:true,timeout:10000,maxBuffer:12*1024*1024});
const sha=b=>createHash('sha256').update(b).digest('hex');
function foregroundPackage(){
 const activity=adb(['shell','dumpsys','activity','activities']);
 const top=activity.match(/(?:topResumedActivity|mResumedActivity)[:=]\s*ActivityRecord\{[^\n]*?\s([A-Za-z0-9_.]+)\/[A-Za-z0-9_.$]+/);
 return top?.[1]||null;
}
const before=JSON.parse(readFileSync('analyse/MCY_NATIVE_PREFLIGHT_2026-10-13.json','utf8').replace(/^\uFEFF/,''));
const artifact=JSON.parse(readFileSync('analyse/MCY_NATIVE_ARTIFACT_2026-10-13.json','utf8').replace(/^\uFEFF/,''));
assert.equal(artifact.applicationId,app);assert.equal(sha(readFileSync(artifact.apkPath)),artifact.apkSha256);
const packages={};
for(const pkg of Object.keys(before.packages)){
 const dump=adb(['shell','dumpsys','package',pkg]);
 const file=adb(['shell','pm','path',pkg]).match(/^package:(\/data\/app\/[A-Za-z0-9_/.~+=-]+\/base\.apk)$/m)?.[1];assert.ok(file,'Expected package still installed');
 packages[pkg]={lastUpdateTime:dump.match(/lastUpdateTime=([^\r\n]+)/)?.[1]?.trim(),firstInstallTime:dump.match(/firstInstallTime=([^\r\n]+)/)?.[1]?.trim(),versionName:dump.match(/versionName=(\S+)/)?.[1],apkSha256:adb(['shell','sha256sum',file]).split(/\s+/)[0]};
 assert.equal(packages[pkg].firstInstallTime,before.packages[pkg].firstInstallTime,'Install history must be retained');
 if(pkg!==app){assert.equal(packages[pkg].lastUpdateTime,before.packages[pkg].lastUpdateTime);assert.equal(packages[pkg].apkSha256,before.packages[pkg].apkSha256);}
 else assert.equal(packages[pkg].apkSha256,artifact.apkSha256);
}
const pid=adb(['shell','pidof',app]).trim().split(/\s+/)[0];assert.match(pid,/^\d+$/);
let port;let dom;
try{
 port=Number(adb(['forward','tcp:0','localabstract:webview_devtools_remote_'+pid]).trim());assert.ok(port>0);
 const pages=await (await fetch('http://127.0.0.1:'+port+'/json',{signal:AbortSignal.timeout(5000)})).json();
 const page=pages.find(p=>p.type==='page'&&p.url==='https://localhost/');assert.ok(page?.webSocketDebuggerUrl);
 const expression=`({ready:document.readyState,platform:window.Capacitor?.getPlatform(),native:window.Capacitor?.isNativePlatform(),hasWelcome:!!document.querySelector('.mcy-welcome'),renderedChildren:document.querySelector('#root')?.children.length||0,hasSimulator:!!document.querySelector('.phone-frame'),imagesReady:[...document.images].every(i=>i.complete&&i.naturalWidth>0)})`;
 const socket=new WebSocket(page.webSocketDebuggerUrl);
 try{dom=await new Promise((resolve,reject)=>{
  const timer=setTimeout(()=>reject(new Error('Bounded native DOM timeout')),6000);
  socket.addEventListener('open',()=>socket.send(JSON.stringify({id:1,method:'Runtime.evaluate',params:{expression,returnByValue:true}})));
  socket.addEventListener('message',event=>{const r=JSON.parse(event.data);if(r.id!==1)return;clearTimeout(timer);if(r.error||r.result?.exceptionDetails)reject(new Error('Native read failed'));else resolve(r.result?.result?.value);});
  socket.addEventListener('error',()=>{clearTimeout(timer);reject(new Error('Native debug connection failed'));});
 });}finally{socket.close();}
}finally{if(port)adb(['forward','--remove','tcp:'+port]);}
assert.equal(dom.ready,'complete');assert.equal(dom.platform,'android');assert.equal(dom.native,true);assert.ok(dom.renderedChildren>0);assert.equal(dom.hasSimulator,false);
const receipt={kind:'NativeInstallPreservationAndDomReadback',capturedAt:new Date().toISOString(),serial,package:app,status:'PASS',apkSha256:artifact.apkSha256,packages,dom,productionAndStandardDebugPreserved:true,packageDataCleared:false,physicalAuthenticatedFlow:'NOT_RUN_USER_TRIAL_PENDING',signInRequestedByAgent:false,healthWritesByAgent:false,aiInference:false,screenshotStatus:'NOT_CAPTURED',foregroundBeforeScreenshot:foregroundPackage()};
// Only capture the public welcome; never export account/health/private screens.
if(dom.hasWelcome&&receipt.foregroundBeforeScreenshot===app){
 const image=adb(['exec-out','screencap','-p'],true);receipt.foregroundAfterScreenshot=foregroundPackage();
 if(receipt.foregroundAfterScreenshot===app){const output='C:/Users/Admin/.codex/visualizations/2026/10/07/01a11751-6855-7892-82a3-79f901f16a45/mcy-native-welcome-verified-2026-10-13.png';writeFileSync(output,image);receipt.publicWelcomeScreenshot={path:output,sha256:sha(image)};receipt.screenshotStatus='CAPTURED_EXPECTED_FOREGROUND_PIXELS_REQUIRE_REVIEW';}
 else receipt.screenshotStatus='REJECTED_FOREGROUND_CHANGED';
}else receipt.screenshotStatus=dom.hasWelcome?'NOT_CAPTURED_OTHER_FOREGROUND':'NOT_CAPTURED_PRIVATE_OR_CHANGED_SCREEN';
writeFileSync('analyse/MCY_NATIVE_INSTALLED_2026-10-13.json',JSON.stringify(receipt,null,2)+'\n');
console.log(JSON.stringify({status:receipt.status,apkSha256:receipt.apkSha256,productionAndStandardDebugPreserved:true,dom:receipt.dom,screenshot:receipt.publicWelcomeScreenshot?.path}));
