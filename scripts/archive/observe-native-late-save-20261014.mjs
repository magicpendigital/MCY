// Read-only actual-phone Auth/metadata observation for the approved manual trial.
// No session injection/refresh, UI navigation, email, profile/consent/check-in writes.
// Bearer/user response stay inside WebView; only approved actor booleans and
// canonical metadata digests leave it. Never enable Network/console collection.
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';

const [label,phase]=process.argv.slice(2);
const phases=['before-grant','after-grant','before-checkin','after-checkin','after-reopen','before-revoke','after-revoke','after-denied-save'];
assert(process.argv.length===4&&['LEARNER_A','LEARNER_B'].includes(label)&&phases.includes(phase),'Expected approved actor and observation phase');
const manifestPath='analyse/MCY_NATIVE_LATE_SAVE_OPERATION_2026-10-14.json';
const approvalPath='analyse/MCY_NATIVE_LATE_SAVE_APPROVAL_2026-10-14.json';
const intentPath='.vercel/mcy-native-late-save-20261014.intent.json';
assert(fs.existsSync(approvalPath),'Exact new Owner approval required before any device/Auth observation');
const sha=b=>createHash('sha256').update(b).digest('hex');
const fileHash=p=>sha(fs.readFileSync(p));
const manifestBytes=fs.readFileSync(manifestPath);const manifestHash=sha(manifestBytes);
const manifest=JSON.parse(manifestBytes);
const approvalBytes=fs.readFileSync(approvalPath),approval=JSON.parse(approvalBytes);
assert(approval.decision==='APPROVED'&&approval.releaseId==='mcy-native-late-save-20261014'&&manifest.releaseId===approval.releaseId&&approval.manifestSha256===manifestHash,'Exact new Owner decision required');
assert(JSON.stringify(approval.target)===JSON.stringify(manifest.target),'Approved target drift');
assert(fileHash(manifest.permissions.independentReviewRequired)===approval.reviewSha256,'Prepared review drift');
for(const i of [...manifest.inputs,...manifest.frozenApplicationSource])assert(fileHash(i.path)===i.sha256,'Reviewed input drift');
const intentBytes=fs.readFileSync(intentPath),intent=JSON.parse(intentBytes);
assert(intent.kind==='ManualNativeLateSaveExclusiveIntent'&&intent.manifestSha256===manifestHash&&intent.approvalSha256===sha(approvalBytes)&&typeof intent.nonce==='string'&&/^[0-9a-f-]{36}$/i.test(intent.nonce),'Exclusive approved trial intent required');
assert(['A_ACTIVE','B_ACTIVE'].includes(intent.phase),'New approved active actor phase required');
assert(intent.phase===(label==='LEARNER_A'?'A_ACTIVE':'B_ACTIVE'),'Current approved progress actor mismatch');
assert(intent.executionStatus==='ACTIVE'||(intent.executionStatus==='HALTED'&&['before-revoke','after-revoke'].includes(phase)),'Closed/halted operation cannot continue except final approved revoke observation');
const capturedPins={sourceSha256:fileHash(new URL(import.meta.url)),approvalSha256:sha(approvalBytes),intentSha256:sha(intentBytes)};
const output=`analyse/MCY_NATIVE_LATE_SAVE_${label}_${phase.toUpperCase().replaceAll('-','_')}_2026-10-14.json`;
assert(!fs.existsSync(output),'Existing observation: read stored receipt; do not overwrite');
const app=manifest.device.package,serial=manifest.device.serial,actor=manifest.actors.find(a=>a.label===label);
assert(app==='com.nilaza.motchutyoga.mcydebug'&&serial==='Q88549EEXCUOONGA'&&actor,'Fixed phone/package required');
const artifact=JSON.parse(fs.readFileSync('analyse/MCY_NATIVE_LATE_SAVE_ARTIFACT_2026-10-14.json'));
assert(artifact.applicationId===app&&artifact.apkSha256===manifest.device.apkSha256&&fileHash(artifact.apkPath)===artifact.apkSha256,'Native archive drift');
const entry=artifact.assets.find(a=>/^assets\/index-[A-Za-z0-9_-]+\.js$/.test(a.path));assert(entry,'Canonical native entry required');
const entryPath=path.join(artifact.extractedPublicPath,entry.path);assert(fileHash(entryPath)===entry.sha256,'Extracted native entry drift');
const publicKeys=[...new Set(fs.readFileSync(entryPath,'utf8').match(/sb_publishable_[A-Za-z0-9_-]+/g)||[])];
assert(publicKeys.length===1,'One bundled publishable key required');
const origin='https://mhumbczqrzutdnraafhs.supabase.co';
const deadline=Date.now()+30000;
const remaining=cap=>{const ms=Math.min(cap,deadline-Date.now());assert(ms>0,'Observation deadline');return ms;};
const adb=a=>execFileSync('adb',['-s',serial,...a],{encoding:'utf8',windowsHide:true,timeout:remaining(6000),maxBuffer:2*1024*1024});
function fixedDevice(){
  assert(adb(['get-state']).trim()==='device','Device unavailable');
  const pkg=adb(['shell','dumpsys','package',app]);assert(pkg.match(/User 0:.*\bstopped=(true|false)/)?.[1]==='false','Do not probe stopped package');
  const apk=adb(['shell','pm','path',app]).match(/^package:(\/data\/app\/[A-Za-z0-9_/.~+=-]+\/base\.apk)$/m)?.[1];
  assert(apk&&adb(['shell','sha256sum',apk]).split(/\s+/)[0]===artifact.apkSha256,'Installed bytes drift');
  const activities=adb(['shell','dumpsys','activity','activities']);
  const top=activities.match(/(?:topResumedActivity|mResumedActivity)[:=]\s*ActivityRecord\{[^\n]*?\s([A-Za-z0-9_.]+)\/[A-Za-z0-9_.$]+/);
  assert(top?.[1]===app,'Only foreground MCY may be observed');
  assert(adb(['shell','dumpsys','power']).includes('mWakefulness=Awake'),'Phone asleep');
  assert(!/^\s*(?:showing|inputRestricted)=true/m.test(adb(['shell','dumpsys','window','policy'])),'Phone locked');
}
const expression=`(async()=>{
  const hash=async s=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s))),b=>b.toString(16).padStart(2,'0')).join('');
  const canonical=v=>Array.isArray(v)?'['+v.map(canonical).join(',')+']':v&&typeof v==='object'?'{'+Object.keys(v).sort().map(k=>JSON.stringify(k)+':'+canonical(v[k])).join(',')+'}':JSON.stringify(v);
  const read=()=>{try{return JSON.parse(localStorage.getItem('sb-mhumbczqrzutdnraafhs-auth-token')||'null')}catch{return null}};
  const initial=read();
  if(!window.Capacitor?.isNativePlatform()||window.Capacitor.getPlatform()!=='android'||document.readyState!=='complete')return {status:'NOT_READY'};
  if(typeof initial?.user?.id!=='string'||await hash(initial.user.id)!==${JSON.stringify(actor.identitySha256)})return {status:'CACHED_ACTOR_MISMATCH',sessionCachePresent:localStorage.getItem('sb-mhumbczqrzutdnraafhs-auth-token')!==null,parsedSessionPresent:initial!==null,cachedUserIdPresent:typeof initial?.user?.id==='string',cachedApprovedBMatch:typeof initial?.user?.id==='string'&&await hash(initial.user.id)==='1dce191e95a843797bb7e8ebb9c63e5f0a5e20aa7ee98720be3df467421bebd3'};
  // Only the approved cached actor reaches bearer access and the fixed Auth GET.
  const token=initial.access_token;
  if(typeof token!=='string'||!Number.isFinite(initial.expires_at)||initial.expires_at<=Date.now()/1000)return {status:'EXPIRED_SESSION'};
  const response=await fetch(${JSON.stringify(origin+'/auth/v1/user')},{method:'GET',headers:{apikey:${JSON.stringify(publicKeys[0])},Authorization:'Bearer '+token,'X-Client-Info':'mcy-native-trial-read-only-20261013'},signal:AbortSignal.timeout(7000),redirect:'error'});
  if(!response.ok)return {status:'AUTH_DENIED',httpStatus:response.status};
  const user=await response.json();
  if(typeof user?.id!=='string'||await hash(user.id)!==${JSON.stringify(actor.identitySha256)}||!user.email_confirmed_at||user.role!=='authenticated')return {status:'SERVER_ACTOR_DENIED',httpStatus:response.status};
  const metadata=user.user_metadata&&typeof user.user_metadata==='object'&&!Array.isArray(user.user_metadata)?user.user_metadata:{};
  const withoutLocale=Object.fromEntries(Object.entries(metadata).filter(([key])=>key!=='locale'));
  const metadataSha256=await hash(canonical(withoutLocale));
  const appMetadataSha256=await hash(canonical(user.app_metadata||{}));
  const locale=typeof metadata.locale==='string'&&['vi','vi-VN','en','en-US'].includes(metadata.locale)?metadata.locale:null;
  const current=read();
  if(current?.user?.id!==initial.user.id||current?.access_token!==token||!Number.isFinite(current?.expires_at)||current.expires_at<=Date.now()/1000)return {status:'SESSION_CHANGED_DURING_READ'};
  const route=document.querySelector('[data-testid="flow-current"] [data-flow-active="true"]')?.getAttribute('data-flow-route');
  return {status:'PASS',httpStatus:response.status,approvedCachedAndServerActorMatch:true,confirmed:true,authRoleAuthenticated:true,
    nonLocaleUserMetadataSha256:metadataSha256,appMetadataSha256,locale,
    activeRoute:['onboarding','home','profile','privacy','checkin','journey','consent'].includes(route)?route:'unrecognized'};
})()`;
let port,socket,result,expectedLocalPageCount=null;
const startedAt=new Date().toISOString();
try {
  fixedDevice();
  const pid=adb(['shell','pidof',app]).trim();assert(/^\d+$/.test(pid),'One running MCY process required');
  port=Number(adb(['forward','tcp:0','localabstract:webview_devtools_remote_'+pid]).trim());assert(port>0,'Owned forwarding unavailable');
  const pages=await(await fetch('http://127.0.0.1:'+port+'/json',{signal:AbortSignal.timeout(remaining(4000))})).json();
  const localPages=pages.filter(p=>p.type==='page'&&p.url==='https://localhost/');expectedLocalPageCount=localPages.length;assert(localPages.length===1,'One fixed MCY page required');const page=localPages[0];assert(page?.webSocketDebuggerUrl,'Fixed MCY page required');
  socket=new WebSocket(page.webSocketDebuggerUrl);
  result=await new Promise((resolve,reject)=>{
    const timer=setTimeout(()=>reject(Error('Bounded native Auth observation timeout')),remaining(12000));
    socket.addEventListener('open',()=>socket.send(JSON.stringify({id:1,method:'Runtime.evaluate',params:{expression,awaitPromise:true,returnByValue:true}})),{once:true});
    socket.addEventListener('message',event=>{const r=JSON.parse(event.data);if(r.id!==1)return;clearTimeout(timer);
      r.error||r.result?.exceptionDetails?reject(Error('Native Auth observation failed')):resolve(r.result?.result?.value);});
    socket.addEventListener('error',()=>{clearTimeout(timer);reject(Error('Native observer connection failed'));},{once:true});
  });
  fixedDevice();
} catch { result={status:'OBSERVATION_NOT_ACCEPTED'}; }
finally {
  socket?.close();
  if(port)try{execFileSync('adb',['-s',serial,'forward','--remove','tcp:'+port],{encoding:'utf8',windowsHide:true,timeout:3000});}catch{result={status:'CLEANUP_NOT_ACCEPTED'};}
}
try {
  if(fileHash(new URL(import.meta.url))!==capturedPins.sourceSha256||fileHash(approvalPath)!==capturedPins.approvalSha256||fileHash(intentPath)!==capturedPins.intentSha256||fileHash(manifestPath)!==manifestHash
    ||[...manifest.inputs,...manifest.frozenApplicationSource].some(i=>fileHash(i.path)!==i.sha256))result={status:'INPUT_DRIFT_DURING_READ'};
} catch {result={status:'INPUT_DRIFT_DURING_READ'};}
// Only a constrained schema is allowed out of the WebView.
const allowed=['status','httpStatus','sessionCachePresent','parsedSessionPresent','cachedUserIdPresent','cachedApprovedBMatch','approvedCachedAndServerActorMatch','confirmed','authRoleAuthenticated','nonLocaleUserMetadataSha256','appMetadataSha256','locale','activeRoute'];
assert(result&&typeof result==='object'&&Object.keys(result).every(k=>allowed.includes(k)),'Unexpected observer result');
assert(['PASS','NOT_READY','CACHED_ACTOR_MISMATCH','EXPIRED_SESSION','AUTH_DENIED','SERVER_ACTOR_DENIED','SESSION_CHANGED_DURING_READ','INPUT_DRIFT_DURING_READ','OBSERVATION_NOT_ACCEPTED','CLEANUP_NOT_ACCEPTED'].includes(result.status),'Unknown observation status');
const cacheDiagnosticKeys=['sessionCachePresent','parsedSessionPresent','cachedUserIdPresent','cachedApprovedBMatch'];
for(const k of cacheDiagnosticKeys)if(k in result)assert(result.status==='CACHED_ACTOR_MISMATCH'&&typeof result[k]==='boolean','Cache diagnostics only on a known cache denial');
assert(expectedLocalPageCount===null||(Number.isSafeInteger(expectedLocalPageCount)&&expectedLocalPageCount>=0),'Invalid local page count');
if(result.status==='PASS') {
  assert(result.httpStatus===200&&result.approvedCachedAndServerActorMatch===true&&result.confirmed===true&&result.authRoleAuthenticated===true,'Invalid Auth acceptance');
  assert(typeof result.nonLocaleUserMetadataSha256==='string'&&typeof result.appMetadataSha256==='string'&&/^[a-f0-9]{64}$/.test(result.nonLocaleUserMetadataSha256)&&/^[a-f0-9]{64}$/.test(result.appMetadataSha256),'Only metadata digests may leave device');
  assert(result.locale===null||['vi','vi-VN','en','en-US'].includes(result.locale),'Only reviewed locale enum may leave device');
  assert(['onboarding','home','profile','privacy','checkin','journey','consent','unrecognized'].includes(result.activeRoute),'Only reviewed route enum may leave device');
} else {
  const deniedAllowed=result.status==='CACHED_ACTOR_MISMATCH'?['status','sessionCachePresent','parsedSessionPresent','cachedUserIdPresent','cachedApprovedBMatch']:['status','httpStatus'];
  assert(Object.keys(result).every(k=>deniedAllowed.includes(k)),'Denied observation must contain no metadata');
  assert(result.httpStatus===undefined||(Number.isInteger(result.httpStatus)&&result.httpStatus>=100&&result.httpStatus<=599),'Invalid HTTP status');
}
const receipt={kind:'NativeTrialFreshActorReadOnlyObservation',startedAt,capturedAt:new Date().toISOString(),label,phase,
  manifestSha256:manifestHash,approvalSha256:capturedPins.approvalSha256,trialNonce:intent.nonce,sourceSha256:capturedPins.sourceSha256,intentSha256AtStart:capturedPins.intentSha256,
  package:app,apkSha256:artifact.apkSha256,expectedLocalPageCount,result,authGetOnly:true,sessionInjectedOrRefreshedByProbe:false,uiNavigation:false,
  emailOrDataWritesByProbe:false,tokenIdentityOrRawMetadataExported:false};
fs.writeFileSync(output,JSON.stringify(receipt,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({status:result.status,label,phase,receipt:output}));
if(result.status!=='PASS')process.exitCode=1;
