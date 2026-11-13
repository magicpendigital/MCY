// Selective staging Auth URL repair; no mail trigger, SQL, role or AI mutation.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {readFileSync,writeFileSync,mkdirSync,existsSync,lstatSync,realpathSync} from 'node:fs';
import path from 'node:path';
const root=realpathSync('D:/Projects/MCY');assert.equal(realpathSync('.'),root);
const projectRef='mhumbczqrzutdnraafhs',native='motchutyoga-mcydebug://auth/callback';
const workdir=path.join(root,'.vercel/mcy-native-auth-20261013');
const cli='C:/Users/Admin/AppData/Local/Temp/mcy-rpc-fix-tools-442b31230cac41c8903f7b36b0e613d1/_npx/fcaf72be640e6e73/node_modules/@supabase/cli-windows-x64/bin/supabase.exe';
const sha=b=>createHash('sha256').update(b).digest('hex');
const probe=JSON.parse(readFileSync('analyse/MCY_NATIVE_AUTH_CONFIG_PROBE_2026-10-13.json'));
assert.equal(probe.projectRef,projectRef);assert.equal(probe.siteUrl,'https://motchutyoga.magicpendigital.com');
assert.equal(probe.additionalRedirectUrls.length,17);assert.equal(new Set(probe.additionalRedirectUrls).size,17);assert.equal(probe.nativeExactAllowed,false);
assert.ok(!probe.additionalRedirectUrls.includes(native));
const expected=[...probe.additionalRedirectUrls,native];
const config='project_id = "mcy"\n\n[auth]\nadditional_redirect_urls = '+JSON.stringify(expected)+'\n';
const mode=process.argv[2];assert.ok(['--prepare','--apply','--readback'].includes(mode));
function invoke(args){const r=spawnSync(cli,args,{encoding:'utf8',windowsHide:true,timeout:45000,input:'',env:{...process.env,SUPABASE_TELEMETRY_DISABLED:'true',DO_NOT_TRACK:'1'}});assert.ok(!r.error&&r.status===0,'CLI outcome unavailable; raw output withheld, inspect readback before any retry');return r;}
function diff(){const r=invoke(['config','diff','--project-ref',projectRef,'--workdir',workdir,'--output-format','json']);const lines=r.stdout.split(/\r?\n/);const start=lines.findIndex(l=>l.trimStart().startsWith('{'));assert.ok(start>=0);const d=JSON.parse(lines.slice(start).join('\n'));assert.equal(d.target.project_ref,projectRef);return d;}
const unrelated=d=>d.changes.filter(c=>!c.declared).map(c=>({path:c.path.join('.'),sha256:sha(JSON.stringify(c))}));
const preflightPath='analyse/MCY_NATIVE_AUTH_REDIRECT_PREFLIGHT_2026-10-13.json';
const applyPath='analyse/MCY_NATIVE_AUTH_REDIRECT_APPLY_2026-10-13.json';
if(mode==='--prepare'){
 for(const p of [workdir,path.join(workdir,'supabase')]){mkdirSync(p,{recursive:true});assert.ok(!lstatSync(p).isSymbolicLink());assert.equal(realpathSync(p),p);}
 const file=path.join(workdir,'supabase/config.toml');
 if(existsSync(file))assert.equal(readFileSync(file,'utf8'),config);else writeFileSync(file,config,{flag:'wx'});
}
assert.equal(readFileSync(path.join(workdir,'supabase/config.toml'),'utf8'),config);
assert.ok(!lstatSync(path.join(workdir,'supabase/config.toml')).isSymbolicLink());
const d=diff(),declared=d.changes.filter(c=>c.declared);
if(mode!=='--readback'){
 assert.equal(declared.length,1);const c=declared[0];assert.deepEqual(c.path,['auth','additional_redirect_urls']);assert.equal(c.class,'update');assert.deepEqual(c.remote,probe.additionalRedirectUrls);assert.deepEqual(c.local,expected);
 assert.equal(d.changes.find(c=>c.path.join('.')==='auth.site_url')?.remote,probe.siteUrl);
}
if(mode==='--prepare'){
 const receipt={kind:'SelectiveNativeAuthRedirectPreflight',capturedAt:new Date().toISOString(),status:'PASS',projectRef,organizationId:'rzbpjfrndhrtxagpgdre',configSha256:sha(config),scriptSha256:sha(readFileSync('scripts/repair-native-auth-redirect.mjs')),probeSha256:sha(readFileSync('analyse/MCY_NATIVE_AUTH_CONFIG_PROBE_2026-10-13.json')),beforeUrls:probe.additionalRedirectUrls,afterUrls:expected,changedPath:'auth.additional_redirect_urls',unrelatedHashes:unrelated(d),cloudMutation:false};
 writeFileSync(preflightPath,JSON.stringify(receipt,null,2)+'\n');console.log(JSON.stringify({status:receipt.status,before:17,after:18,addedOnly:native,unrelatedProperties:receipt.unrelatedHashes.length,cloudMutation:false}));
}else{
 const pre=JSON.parse(readFileSync(preflightPath));assert.equal(pre.status,'PASS');assert.equal(pre.projectRef,projectRef);assert.equal(pre.configSha256,sha(config));assert.equal(pre.scriptSha256,sha(readFileSync('scripts/repair-native-auth-redirect.mjs')));assert.equal(pre.probeSha256,sha(readFileSync('analyse/MCY_NATIVE_AUTH_CONFIG_PROBE_2026-10-13.json')));assert.deepEqual(pre.beforeUrls,probe.additionalRedirectUrls);assert.deepEqual(pre.afterUrls,expected);assert.deepEqual(unrelated(d),pre.unrelatedHashes);
 if(mode==='--apply'){
  const age=Date.now()-Date.parse(pre.capturedAt);assert.ok(age>=0&&age<20*60*1000);
  assert.ok(!existsSync(applyPath),'Prior attempt exists; no automatic reapply');
  const receipt={kind:'SelectiveNativeAuthRedirectApply',startedAt:new Date().toISOString(),projectRef,organizationId:pre.organizationId,preflightSha256:sha(readFileSync(preflightPath)),phase:'INTENT_RECORDED',requestedUserTask:'Implement next step and repair reported native email routing failure',addedOnly:native,unrelatedPreserved:false,emailSent:false,databaseMigration:false,roleChanges:false,aiChanges:false,automaticRetry:false};
  writeFileSync(applyPath,JSON.stringify(receipt,null,2)+'\n',{flag:'wx'});
  try{invoke(['config','push','--project-ref',projectRef,'--workdir',workdir,'--yes']);const after=diff();assert.equal(after.changes.filter(c=>c.declared).length,0);assert.deepEqual(unrelated(after),pre.unrelatedHashes);receipt.phase='PASS_READBACK';receipt.unrelatedPreserved=true;}catch{receipt.phase='FAILED_OR_UNCERTAIN_READBACK_REQUIRED';process.exitCode=1;}
  receipt.completedAt=new Date().toISOString();writeFileSync(applyPath,JSON.stringify(receipt,null,2)+'\n');console.log(JSON.stringify(receipt));
 }else{assert.equal(declared.length,0);console.log(JSON.stringify({status:'READBACK_PASS',exactUrls:18,addedOnly:native,unrelatedPreserved:true,cloudMutation:false}));}
}
