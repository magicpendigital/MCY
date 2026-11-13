// One bounded, read-only diagnosis after the user-reported native reopen failure.
// No SDK initialization, token refresh, session injection, UI action or data write.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';

assert(process.argv.length === 2, 'No alternate actor, package or output permitted');
const sha = b => createHash('sha256').update(b).digest('hex');
const hashFile = p => sha(fs.readFileSync(p));
const manifestPath = 'analyse/MCY_NATIVE_LATE_SAVE_OPERATION_2026-10-14.json';
const approvalPath = 'analyse/MCY_NATIVE_LATE_SAVE_APPROVAL_2026-10-14.json';
const intentPath = '.vercel/mcy-native-late-save-20261014.intent.json';
const previousPath = 'analyse/MCY_NATIVE_LATE_SAVE_LEARNER_A_BEFORE_GRANT_2026-10-14.json';
const failurePath = 'analyse/MCY_NATIVE_LATE_SAVE_REOPEN_AUTH_FAILURE_RECONCILIATION_2026-10-14.json';
const reviewPath = 'analyse/MCY_NATIVE_AUTH_RESTORE_DIAGNOSTIC_R3_2026-10-14.json';
const output = 'analyse/MCY_NATIVE_AUTH_RESTORE_DIAGNOSTIC_2026-10-14.json';
assert(!fs.existsSync(output), 'Read existing receipt; never overwrite or rerun');
const manifest = JSON.parse(fs.readFileSync(manifestPath));
const approval = JSON.parse(fs.readFileSync(approvalPath));
const intent = JSON.parse(fs.readFileSync(intentPath));
const previous = JSON.parse(fs.readFileSync(previousPath));
const failure = JSON.parse(fs.readFileSync(failurePath));
const review = JSON.parse(fs.readFileSync(reviewPath));
const sourceSha256 = hashFile(new URL(import.meta.url));
assert(hashFile(manifestPath) === '02817156939cf9cfc3497396cd25f0f10042300ebea244e93742bdedb968020f', 'Exact approved manifest');
assert(approval.decision === 'APPROVED' && approval.releaseId === manifest.releaseId && approval.manifestSha256 === hashFile(manifestPath), 'Exact approval');
assert(JSON.stringify(approval.target) === JSON.stringify(manifest.target), 'Target drift');
assert(manifest.target.projectRef === 'mhumbczqrzutdnraafhs' && manifest.target.organizationId === 'rzbpjfrndhrtxagpgdre', 'Fixed staging target');
assert(intent.kind === 'ManualNativeLateSaveExclusiveIntent' && intent.executionStatus === 'HALTED' && intent.phase === 'A_ACTIVE'
  && intent.awaiting === 'READ_ONLY_SESSION_RESTORE_DIAGNOSTIC_NO_LOGIN_OR_WRITES' && intent.manifestSha256 === hashFile(manifestPath)
  && intent.approvalSha256 === hashFile(approvalPath), 'Current halted intent');
assert(previous.label === 'LEARNER_A' && previous.result.status === 'PASS' && previous.trialNonce === intent.nonce
  && previous.manifestSha256 === hashFile(manifestPath), 'Prior approved actual A');
assert(failure.status === 'PASS_ZERO_NEW_DATABASE_EFFECTS_RESTORE_UI_FAIL' && failure.wellbeingRevokedBoth === true, 'Failure reconciliation required');
assert(review.status === 'APPROVED_READ_ONLY_DIAGNOSTIC' && review.probeSha256 === sourceSha256
  && review.manifestSha256 === hashFile(manifestPath) && review.intentSha256 === hashFile(intentPath)
  && review.noRemainingP1P2 === true, 'Independent source/control clearance required');
const pins = [manifestPath, approvalPath, intentPath, previousPath, failurePath, reviewPath,
  ...manifest.inputs.map(x => x.path), ...manifest.frozenApplicationSource.map(x => x.path)];
for (const x of [...manifest.inputs, ...manifest.frozenApplicationSource]) assert(hashFile(x.path) === x.sha256, 'Frozen input drift');
const capturedPins = pins.map(p => ({path:p, sha256:hashFile(p)}));
const artifact = JSON.parse(fs.readFileSync('analyse/MCY_NATIVE_LATE_SAVE_ARTIFACT_2026-10-14.json'));
const app = 'com.nilaza.motchutyoga.mcydebug', serial = 'Q88549EEXCUOONGA';
assert(manifest.device.package === app && manifest.device.serial === serial && artifact.applicationId === app
  && artifact.apkSha256 === manifest.device.apkSha256 && hashFile(artifact.apkPath) === artifact.apkSha256, 'Fixed candidate APK');
const entry = artifact.assets.find(x => /^assets\/index-[A-Za-z0-9_-]+\.js$/.test(x.path));
assert(entry, 'Bundled entry');
const entryPath = path.join(artifact.extractedPublicPath, entry.path);
assert(hashFile(entryPath) === entry.sha256, 'Extracted entry drift');
const publicKeys = [...new Set(fs.readFileSync(entryPath,'utf8').match(/sb_publishable_[A-Za-z0-9_-]+/g) || [])];
assert(publicKeys.length === 1, 'One bundled publishable key');
const actor = manifest.actors.find(x => x.label === 'LEARNER_A');
assert(actor?.identitySha256 === '995e6d265987a1c5cd6c831d6b2dda54998092aa769082cc72bf93fa209ece68', 'Only approved A');
const deadline = Date.now() + 30000;
const remaining = cap => {const n = Math.min(cap, deadline-Date.now()); assert(n>0,'Bounded deadline'); return n;};
const adb = args => execFileSync('adb',['-s',serial,...args],{encoding:'utf8',windowsHide:true,timeout:remaining(6000),maxBuffer:2*1024*1024});
function fixedDevice() {
  assert(adb(['get-state']).trim() === 'device', 'Connected device');
  const pkg = adb(['shell','dumpsys','package',app]);
  assert(pkg.match(/User 0:.*\bstopped=(true|false)/)?.[1] === 'false', 'Do not launch stopped app');
  const apk = adb(['shell','pm','path',app]).match(/^package:(\/data\/app\/[A-Za-z0-9_/.~+=-]+\/base\.apk)$/m)?.[1];
  assert(apk && adb(['shell','sha256sum',apk]).split(/\s+/)[0] === artifact.apkSha256,'Current installed candidate');
  const top = adb(['shell','dumpsys','activity','activities']).match(/(?:topResumedActivity|mResumedActivity)[:=]\s*ActivityRecord\{[^\n]*?\s([A-Za-z0-9_.]+)\/[A-Za-z0-9_.$]+/);
  assert(top?.[1] === app,'Only foreground approved app');
  assert(adb(['shell','dumpsys','power']).includes('mWakefulness=Awake'),'Awake');
  assert(!/^\s*(?:showing|inputRestricted)=true/m.test(adb(['shell','dumpsys','window','policy'])),'Unlocked');
}
const expression = `(async()=>{
  if(!window.Capacitor?.isNativePlatform()||window.Capacitor.getPlatform()!=='android'||document.readyState!=='complete'||window.location.origin!=='https://localhost') return {status:'NOT_READY'};
  const route=document.querySelector('[data-testid="flow-current"] [data-flow-active="true"]')?.getAttribute('data-flow-route');
  const activeRoute=['welcome','auth-email','auth-code','home','journey','profile','privacy','consent','onboarding','checkin'].includes(route)?route:'unrecognized';
  const base={activeRoute,readyComplete:true,nativeAndroid:true,localhostOrigin:true};
  let raw;try{raw=localStorage.getItem('sb-mhumbczqrzutdnraafhs-auth-token')}catch{return {status:'STORAGE_UNAVAILABLE',...base}};
  if(raw===null)return {status:'SESSION_CACHE_ABSENT',...base};
  let cached;try{cached=JSON.parse(raw)}catch{return {status:'SESSION_CACHE_INVALID',...base}};
  if(typeof cached?.user?.id!=='string')return {status:'SESSION_CACHE_INVALID',...base};
  const hash=async s=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s))),b=>b.toString(16).padStart(2,'0')).join('');
  if(await hash(cached.user.id)!==${JSON.stringify(actor.identitySha256)})return {status:'CACHED_ACTOR_DENIED',...base};
  const currentA={...base,approvedCachedA:true,refreshTokenPresent:typeof cached.refresh_token==='string'&&cached.refresh_token.length>0};
  if(typeof cached.access_token!=='string'||!Number.isFinite(cached.expires_at))return {status:'APPROVED_CACHE_INCOMPLETE',...currentA};
  if(cached.expires_at<=Date.now()/1000)return {status:'APPROVED_CACHE_EXPIRED_NO_REQUEST',...currentA};
  const token=cached.access_token;
  const response=await fetch('https://mhumbczqrzutdnraafhs.supabase.co/auth/v1/user',{method:'GET',headers:{apikey:${JSON.stringify(publicKeys[0])},Authorization:'Bearer '+token,'X-Client-Info':'mcy-native-auth-restore-read-only-20261014'},signal:AbortSignal.timeout(7000),redirect:'error'});
  if(!response.ok)return {status:'AUTH_DENIED',httpStatus:response.status,...currentA};
  const user=await response.json();
  if(typeof user?.id!=='string'||await hash(user.id)!==${JSON.stringify(actor.identitySha256)}||!user.email_confirmed_at||user.role!=='authenticated')return {status:'SERVER_ACTOR_DENIED',httpStatus:response.status,...currentA};
  let now;try{now=JSON.parse(localStorage.getItem('sb-mhumbczqrzutdnraafhs-auth-token')||'null')}catch{return {status:'SESSION_CHANGED_DURING_READ'}};
  if(now?.user?.id!==cached.user.id||now?.access_token!==token||!Number.isFinite(now?.expires_at)||now.expires_at<=Date.now()/1000)return {status:'SESSION_CHANGED_DURING_READ'};
  return {status:'APPROVED_A_AUTH_VALID',httpStatus:200,confirmed:true,approvedServerA:true,...currentA};
})()`;
let port, socket, result;
const startedAt = new Date().toISOString();
try {
  fixedDevice();
  const pid = adb(['shell','pidof',app]).trim();assert(/^\d+$/.test(pid),'One process');
  port=Number(adb(['forward','tcp:0','localabstract:webview_devtools_remote_'+pid]).trim());assert(port>0,'Owned forwarding');
  const pages=await(await fetch('http://127.0.0.1:'+port+'/json',{signal:AbortSignal.timeout(remaining(4000))})).json();
  const local=pages.filter(p=>p.type==='page'&&p.url==='https://localhost/');assert(local.length===1&&local[0].webSocketDebuggerUrl,'One fixed local page');
  socket=new WebSocket(local[0].webSocketDebuggerUrl);
  result=await new Promise((resolve,reject)=>{
    const timer=setTimeout(()=>reject(Error('Bounded observation timeout')),remaining(12000));
    socket.addEventListener('open',()=>socket.send(JSON.stringify({id:1,method:'Runtime.evaluate',params:{expression,awaitPromise:true,returnByValue:true}})),{once:true});
    socket.addEventListener('message',event=>{const reply=JSON.parse(event.data);if(reply.id!==1)return;clearTimeout(timer);reply.error||reply.result?.exceptionDetails?reject(Error('Probe rejected')):resolve(reply.result?.result?.value);});
    socket.addEventListener('error',()=>{clearTimeout(timer);reject(Error('Probe connection failed'));},{once:true});
  });
  fixedDevice();
}catch{result={status:'OBSERVATION_NOT_ACCEPTED'};}
finally {
  socket?.close();
  if(port)try{execFileSync('adb',['-s',serial,'forward','--remove','tcp:'+port],{encoding:'utf8',windowsHide:true,timeout:3000});}catch{result={status:'CLEANUP_NOT_ACCEPTED'};}
}
if(hashFile(new URL(import.meta.url))!==sourceSha256||capturedPins.some(p=>hashFile(p.path)!==p.sha256))result={status:'INPUT_DRIFT_DURING_READ'};
const allowed=['status','activeRoute','readyComplete','nativeAndroid','localhostOrigin','approvedCachedA','refreshTokenPresent','httpStatus','confirmed','approvedServerA'];
const statuses=['NOT_READY','STORAGE_UNAVAILABLE','SESSION_CACHE_ABSENT','SESSION_CACHE_INVALID','CACHED_ACTOR_DENIED','APPROVED_CACHE_INCOMPLETE','APPROVED_CACHE_EXPIRED_NO_REQUEST','AUTH_DENIED','SERVER_ACTOR_DENIED','SESSION_CHANGED_DURING_READ','APPROVED_A_AUTH_VALID','OBSERVATION_NOT_ACCEPTED','CLEANUP_NOT_ACCEPTED','INPUT_DRIFT_DURING_READ'];
assert(result&&typeof result==='object'&&Object.keys(result).every(k=>allowed.includes(k))&&statuses.includes(result.status),'Constrained output');
for(const k of ['readyComplete','nativeAndroid','localhostOrigin','approvedCachedA','refreshTokenPresent','confirmed','approvedServerA'])if(k in result)assert(typeof result[k]==='boolean','Only boolean flags');
if('activeRoute'in result)assert(['welcome','auth-email','auth-code','home','journey','profile','privacy','consent','onboarding','checkin','unrecognized'].includes(result.activeRoute),'Only route enum');
if('httpStatus'in result)assert(Number.isInteger(result.httpStatus)&&result.httpStatus>=100&&result.httpStatus<=599,'HTTP status enum');
const receipt={kind:'NativeAuthRestoreFailureReadOnlyDiagnostic',startedAt,capturedAt:new Date().toISOString(),manifestSha256:hashFile(manifestPath),approvalSha256:hashFile(approvalPath),trialNonce:intent.nonce,sourceSha256,reviewSha256:hashFile(reviewPath),intentSha256AtStart:capturedPins.find(p=>p.path===intentPath).sha256,package:app,apkSha256:artifact.apkSha256,result,sessionInjectedOrRefreshedByProbe:false,sdkInitializedByProbe:false,uiNavigation:false,emailOrDataWritesByProbe:false,tokenIdentityOrRawMetadataExported:false};
fs.writeFileSync(output,JSON.stringify(receipt,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({status:result.status,receipt:output}));
if(['NOT_READY','OBSERVATION_NOT_ACCEPTED','CLEANUP_NOT_ACCEPTED','INPUT_DRIFT_DURING_READ'].includes(result.status))process.exitCode=1;
