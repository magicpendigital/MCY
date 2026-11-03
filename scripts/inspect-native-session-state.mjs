// Read only after an uncertain restart. No navigation/restart or private export.
import {execFileSync} from 'node:child_process';
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const serial='Q88549EEXCUOONGA',app='com.nilaza.motchutyoga.mcydebug';
const adb=args=>execFileSync('adb',['-s',serial,...args],{encoding:'utf8',windowsHide:true,timeout:6000,maxBuffer:2*1024*1024});
const intentPath='.vercel/mcy-native-session-restoration-20261013.intent.json';
const intentBytes=readFileSync(intentPath),intent=JSON.parse(intentBytes);
assert.equal(intent.phase,'UNCERTAIN_AFTER_RESTART');
const pid=adb(['shell','pidof',app]).trim();assert.match(pid,/^\d+$/);
let port,socket;
try {
  port=Number(adb(['forward','tcp:0','localabstract:webview_devtools_remote_'+pid]).trim());
  const pages=await(await fetch('http://127.0.0.1:'+port+'/json',{signal:AbortSignal.timeout(5000)})).json();
  const page=pages.find(p=>p.type==='page'&&p.url==='https://localhost/');assert(page?.webSocketDebuggerUrl);
  socket=new WebSocket(page.webSocketDebuggerUrl);
  const snapshot=await new Promise((resolve,reject)=>{
    const timer=setTimeout(()=>reject(Error('Bounded inspection timeout')),6000);
    socket.addEventListener('open',()=>socket.send(JSON.stringify({id:1,method:'Runtime.evaluate',params:{returnByValue:true,expression:`(()=>{
      const current=document.querySelector('[data-testid="flow-current"]');
      const active=current?.querySelector('[data-flow-active="true"]');
      const names=['home','discover','profile','journey','welcome','consent','auth-email','auth-code','onboarding','checkin'];
      const raw=active?.getAttribute('data-flow-route');
      const scope=active||current;
      return {ready:document.readyState,native:window.Capacitor?.isNativePlatform(),platform:window.Capacitor?.getPlatform(),
        rootChildren:document.querySelector('#root')?.children.length||0,route:names.includes(raw)?raw:'unrecognized',
        hasCurrent:!!current,hasActive:!!active,sessionKeyPresent:Object.keys(localStorage).includes('sb-mhumbczqrzutdnraafhs-auth-token'),
        hasEditableFields:!!scope?.querySelector('input,textarea,[contenteditable="true"]'),hasMediaPlayer:!!scope?.querySelector('iframe,video,audio'),
        hasAlert:!!scope?.querySelector('[role="alert"]'),hasAccount:!!scope?.querySelector('.mcy-account-home'),
        hasSignedInAccount:[...scope?.querySelectorAll('button')||[]].some(b=>b.textContent.trim()==='Đăng xuất thiết bị này'),
        fixedNavVisible:[...document.querySelectorAll('[data-testid="flow-fixed-footer"] .mcy-bottom-nav button')].some(b=>b.getClientRects().length>0)};
    })()`}})));
    socket.addEventListener('message',event=>{const r=JSON.parse(event.data);if(r.id!==1)return;clearTimeout(timer);
      r.error||r.result?.exceptionDetails?reject(Error('Inspection failed')):resolve(r.result.result.value);});
  });
  const activity=adb(['shell','dumpsys','activity','activities']);
  const match=activity.match(/(?:topResumedActivity|mResumedActivity)[:=]\s*ActivityRecord\{[^\n]*?\s([A-Za-z0-9_.]+)\/[A-Za-z0-9_.$]+/);
  const receipt={kind:'NativeSessionUncertainReadOnlyInspection',capturedAt:new Date().toISOString(),package:app,
    intent:{path:intentPath,sha256:createHash('sha256').update(intentBytes).digest('hex'),phase:intent.phase},
    foregroundIsExpectedPackage:match?.[1]===app,snapshot,status:'OBSERVATION_ONLY_NO_RESTORATION_PASS',
    navigationOrRestart:false,sessionValuesRead:false,privateTextOrScreenshotExported:false};
  const output='analyse/MCY_NATIVE_SESSION_UNCERTAIN_INSPECTION_2026-10-13.json';
  writeFileSync(output,JSON.stringify(receipt,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify(receipt));
}finally{socket?.close();if(port)adb(['forward','--remove','tcp:'+port]);}
