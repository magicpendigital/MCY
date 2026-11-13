// Current use: guarded account precheck only. The force-stop restoration path
// is retired after Air1 stopped=true/white-screen reproduction on 2026-10-13.
// Failed source is preserved unchanged in .vercel/mcy-native-session-failed-source-20261013.mjs.
// No install, data clear, sign-out, email, consent, check-in or API invocation.
// The app may perform its normal Auth refresh/read hydration on restart.
// Never export DOM text, session values, identity, tokens, URLs or screenshots.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash, randomBytes } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';

const app = 'com.nilaza.motchutyoga.mcydebug';
const serial = 'Q88549EEXCUOONGA';
const receiptPath = 'analyse/MCY_NATIVE_SESSION_RESTORATION_2026-10-13.json';
const intentPath = '.vercel/mcy-native-session-restoration-20261013.intent.json';
const restore = process.argv.length === 3 && process.argv[2] === '--restore';
assert(process.argv.length === 2 || restore, 'Only an optional --restore is supported');
assert(!restore, 'Retired: never force-stop/shell-launch Air1 for restoration. Use user-initiated Recent/icon observation.');
if(restore) assert(!existsSync(intentPath)&&!existsSync(receiptPath), 'Existing attempt: inspect stored state; never automatically repeat');
const artifactPath = 'analyse/MCY_NATIVE_ARTIFACT_2026-10-13.json';
const artifact = JSON.parse(readFileSync(artifactPath, 'utf8').replace(/^\uFEFF/, ''));
const sha = b => createHash('sha256').update(b).digest('hex');
let deadline=Date.now()+60000;
const remaining = cap => {const ms=Math.min(cap,deadline-Date.now());assert(ms>0,'Bounded observation expired');return ms;};
const adb = args => execFileSync('adb', ['-s', serial, ...args], {
  encoding: 'utf8', windowsHide: true, timeout: remaining(8000), maxBuffer: 2 * 1024 * 1024,
});
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
function verifyDevice() {
  assert.equal(adb(['get-state']).trim(), 'device');
  const apk = adb(['shell', 'pm', 'path', app]).match(/^package:(\/data\/app\/[A-Za-z0-9_/.~+=-]+\/base\.apk)$/m)?.[1];
  assert(apk, 'Expected package must be installed');
  assert.equal(adb(['shell', 'sha256sum', apk]).split(/\s+/)[0], artifact.apkSha256);
  assert.equal(artifact.applicationId, app);
  assert.equal(sha(readFileSync(artifact.apkPath)), artifact.apkSha256);
  assert(adb(['shell', 'dumpsys', 'power']).includes('mWakefulness=Awake'), 'Phone must be awake');
  assert(!/^\s*(?:showing|inputRestricted)=true/m.test(adb(['shell', 'dumpsys', 'window', 'policy'])), 'Phone must be unlocked');
}
function verifyForeground() {
  const state=adb(['shell','dumpsys','activity','activities']);
  const top=state.match(/(?:topResumedActivity|mResumedActivity)[:=]\s*ActivityRecord\{[^\n]*?\s([A-Za-z0-9_.]+)\/[A-Za-z0-9_.$]+/);
  assert.equal(top?.[1],app,'Only the foreground MCY parallel app may be navigated or restarted');
}
const salt = randomBytes(32).toString('hex'); // Never saved; fingerprints never printed.
const snapshotExpression = `(async()=>{
  const active=document.querySelector('[data-testid="flow-current"] [data-flow-active="true"]');
  const route=active?.getAttribute('data-flow-route')||null;
  const safeRoutes=['home','discover','profile','journey'];
  const scope=active||document.querySelector('[data-testid="flow-current"]');
  const sessionKey='sb-mhumbczqrzutdnraafhs-auth-token';
  let keyPresent=false,fingerprint=null;
  try {
    keyPresent=Object.keys(localStorage).includes(sessionKey);
    const id=JSON.parse(localStorage.getItem(sessionKey)||'null')?.user?.id;
    if(typeof id==='string' && /^[0-9a-f-]{36}$/i.test(id)) {
      const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(${JSON.stringify(salt)}+id));
      fingerprint=Array.from(new Uint8Array(bytes),b=>b.toString(16).padStart(2,'0')).join('');
    }
  } catch {}
  return {ready:document.readyState,platform:window.Capacitor?.getPlatform(),native:window.Capacitor?.isNativePlatform(),
    safeIdleRoute:safeRoutes.includes(route),hasEditableFields:!!scope?.querySelector('input,textarea,[contenteditable="true"]'),
    hasMediaPlayer:!!scope?.querySelector('iframe,video,audio'),hasAlert:!!scope?.querySelector('[role="alert"]'),
    hasAccount:!!scope?.querySelector('.mcy-account-home'),
    hasSignOut:[...scope?.querySelectorAll('button')||[]].some(b=>b.textContent.trim()==='Đăng xuất thiết bị này'&&!b.disabled),
    sessionKeyPresent:keyPresent,fingerprint};
})()`;

async function withPage(action) {
  const pid = adb(['shell', 'pidof', app]).trim().split(/\s+/)[0];
  assert.match(pid, /^\d+$/, 'Expected app must be running');
  let port, socket;
  const pending = new Map(); let id = 0;
  try {
    port = Number(adb(['forward', 'tcp:0', 'localabstract:webview_devtools_remote_' + pid]).trim());
    assert(port > 0);
    const pages = await (await fetch('http://127.0.0.1:' + port + '/json', {signal: AbortSignal.timeout(remaining(4000))})).json();
    const page = pages.find(p => p.type === 'page' && p.url === 'https://localhost/');
    assert(page?.webSocketDebuggerUrl, 'Only the MCY local app page is allowed');
    socket = new WebSocket(page.webSocketDebuggerUrl);
    await new Promise((resolve,reject)=>{const t=setTimeout(()=>reject(Error('Native debug open timeout')),remaining(5000));
      socket.addEventListener('open',()=>{clearTimeout(t);resolve();},{once:true});
      socket.addEventListener('error',()=>{clearTimeout(t);reject(Error('Native debug open failed'));},{once:true});});
    socket.addEventListener('message',event=>{const r=JSON.parse(event.data), p=pending.get(r.id);if(!p)return;
      pending.delete(r.id);clearTimeout(p.timer);
      if(r.error||r.result?.exceptionDetails)p.reject(Error('Native evaluation failed'));
      else p.resolve(r.result?.result?.value);
    });
    const evaluate = expression => new Promise((resolve,reject)=>{
      const requestId=++id, timer=setTimeout(()=>{pending.delete(requestId);reject(Error('Native evaluation timeout'));},remaining(5000));
      pending.set(requestId,{resolve,reject,timer});
      socket.send(JSON.stringify({id:requestId,method:'Runtime.evaluate',params:{expression,awaitPromise:true,returnByValue:true}}));
    });
    return await action(evaluate);
  } finally {
    for(const p of pending.values()){clearTimeout(p.timer);p.reject(Error('Native connection closed'));}
    socket?.close();
    if(port)execFileSync('adb',['-s',serial,'forward','--remove','tcp:'+port],{encoding:'utf8',windowsHide:true,timeout:3000});
  }
}
async function inspectAccount() {
  verifyForeground();
  return withPage(async evaluate => {
    const initial = await evaluate(snapshotExpression);
    assert.equal(initial.platform,'android'); assert.equal(initial.native,true); assert.equal(initial.ready,'complete');
    assert(initial.safeIdleRoute && !initial.hasEditableFields && !initial.hasMediaPlayer && !initial.hasAlert,
      'Stop: app is not on a safe idle screen; no navigation/restart allowed');
    if(!initial.hasAccount) {
      verifyForeground();
      const clicked=await evaluate(`(()=>{
        const active=document.querySelector('[data-testid="flow-current"] [data-flow-active="true"]');
        if(!active||!['home','discover','profile','journey'].includes(active.getAttribute('data-flow-route'))||active.querySelector('input,textarea,[contenteditable="true"],iframe,video,audio,[role="alert"]'))return false;
        const buttons=[...document.querySelectorAll('[data-testid="flow-fixed-footer"] .mcy-bottom-nav button')]
        .filter(b=>b.textContent.trim()==='Cá nhân'&&!b.disabled&&b.getClientRects().length>0);
        if(buttons.length!==1)return false;buttons[0].click();return true;})()`);
      assert(clicked,'Expected account navigation is unavailable');
    }
    for(let i=0;i<25&&Date.now()<deadline;i++){
      const snapshot=await evaluate(snapshotExpression);
      if(snapshot.hasAccount&&snapshot.hasSignOut&&snapshot.sessionKeyPresent&&snapshot.fingerprint&&!snapshot.hasAlert){verifyForeground();return snapshot;}
      await delay(remaining(200));
    }
    throw Error('Account is not visibly signed in; no automatic sign-in or restart');
  });
}

const startedAt=new Date().toISOString();
let intent, ownsIntent=false, restarted=false;
try {
  verifyDevice();
  if(restore){
    intent={kind:'NativeSessionExclusiveAttempt',startedAt,package:app,serial,apkSha256:artifact.apkSha256,
      sourceSha256:sha(readFileSync(new URL(import.meta.url))),phase:'INTENT_BEFORE_NAVIGATION',restarted:false};
    writeFileSync(intentPath,JSON.stringify(intent,null,2)+'\n',{flag:'wx'});
    ownsIntent=true;
  }
  const before=await inspectAccount();
  if(!restore){console.log(JSON.stringify({status:'PRECHECK_PASS',native:true,visibleSignedIn:true,sessionKeyPresent:true,restoration:'NOT_RUN'}));process.exit(0);}
  // Recheck guards immediately before the single restart, preserving all storage.
  verifyDevice();
  await withPage(async evaluate=>{
    verifyForeground();
    const fresh=await evaluate(snapshotExpression);
    assert(fresh.ready==='complete'&&fresh.safeIdleRoute&&!fresh.hasEditableFields&&!fresh.hasMediaPlayer&&!fresh.hasAlert&&fresh.hasAccount&&fresh.hasSignOut&&fresh.sessionKeyPresent&&fresh.fingerprint===before.fingerprint,
      'Stop: idle signed-in account changed before restart');
    intent.phase='RESTART_STARTING';writeFileSync(intentPath,JSON.stringify(intent,null,2)+'\n');
    restarted=true;
    adb(['shell','am','force-stop',app]);
  });
  adb(['shell','am','start','-a','android.intent.action.MAIN','-c','android.intent.category.LAUNCHER',
    '-n',app+'/com.nilaza.motchutyoga.MainActivity']);
  let after;
  deadline=Math.min(deadline,Date.now()+25000);
  while(Date.now()<deadline){await delay(remaining(750));try{after=await inspectAccount();break;}catch{}}
  assert(after,'Restored account unavailable within bounded observation');
  assert(after.fingerprint===before.fingerprint,'Restoration must keep the same cached actor');
  verifyDevice();
  const clean=snapshot=>{const {fingerprint,...redacted}=snapshot;return redacted;};
  const receipt={kind:'NativeSessionProcessRestoration',startedAt,capturedAt:new Date().toISOString(),package:app,serial,
    sourceSha256:intent.sourceSha256,apkSha256:artifact.apkSha256,status:'PASS',method:'One force-stop + clean MAIN/LAUNCHER shell start of parallel package only; inspect fixed UI signals',
    before:clean(before),after:clean(after),sameCachedActorComparison:true,identityComparison:'Ephemeral per-run salted SHA256 inside device; no UID/token/fingerprint retained; cached identity only, not independent server validation',
    sessionStorageModifiedByProbe:false,installedOrCleared:false,emailTriggered:false,consentOrCheckinWrittenByProbe:false,
    screenshotsOrPrivateTextExported:false,normalAppAuthRefreshAndReadHydrationMayOccur:true,
    fullNativeAuthMatrix:'NOT_COMPLETE',limits:'One shell process restart is not a launcher icon/swipe trial, OS reclaim, expiry/revocation or a check-in/consent/account-switch acceptance.'};
  writeFileSync(receiptPath,JSON.stringify(receipt,null,2)+'\n',{flag:'wx'});
  intent.phase='PASS';intent.restarted=true;intent.completedAt=receipt.capturedAt;
  writeFileSync(intentPath,JSON.stringify(intent,null,2)+'\n');
  console.log(JSON.stringify({status:receipt.status,sameCachedActorComparison:true,visibleSignedInBeforeAndAfter:true,receipt:receiptPath}));
} catch {
  // Keep the intent after every failure/uncertain outcome; no automatic retry.
  if(ownsIntent){intent.phase=restarted?'UNCERTAIN_AFTER_RESTART':'FAILED_BEFORE_RESTART';intent.restarted=restarted;intent.completedAt=new Date().toISOString();
    writeFileSync(intentPath,JSON.stringify(intent,null,2)+'\n');}
  console.error(JSON.stringify({status:'NOT_ACCEPTED',phase:intent?.phase||'PRECHECK_FAILED',message:'Inspect app/device state and stored intent before another attempt. No automatic sign-in or state repair.'}));
  process.exitCode=1;
}
