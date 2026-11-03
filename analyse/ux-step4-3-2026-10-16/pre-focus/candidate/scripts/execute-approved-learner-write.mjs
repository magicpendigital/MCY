// Executes only the immutable, human-approved selective staging packet.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync,writeFileSync,readdirSync,lstatSync,realpathSync,existsSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import path from 'node:path';
const root=realpathSync('D:/Projects/MCY');
assert.equal(realpathSync('.'),root);
const approvedHash='13521cea066fa99467d23cca987533e03339efd019bbd4a09dc287b890ae2143';
const hash=b=>createHash('sha256').update(b).digest('hex');
function bytes(relative){
 assert.ok(!path.isAbsolute(relative)&&!relative.split(/[\\/]/).includes('..'));
 const absolute=path.join(root,relative);
 assert.ok(!lstatSync(absolute).isSymbolicLink());
 assert.ok(realpathSync(absolute).startsWith(root+path.sep));
 return readFileSync(absolute);
}
const manifestBytes=bytes('analyse/MCY_LEARNER_WRITE_OPERATION_2026-10-11.json');
assert.equal(hash(manifestBytes),approvedHash);
const op=JSON.parse(manifestBytes),version='20261002120000';
assert.equal(op.target.projectRef,'mhumbczqrzutdnraafhs');
assert.equal(op.target.organizationId,'rzbpjfrndhrtxagpgdre');
assert.equal(op.releaseId,'mcy-learner-write-20261011');
for(const e of [...op.sourceInputs,...op.evidence,op.ownerPacket,...op.allLocalMigrations])assert.equal(hash(bytes(e.path)),e.sha256,'Approved input drift: '+e.path);
assert.equal(op.isolatedInputs.length,21);
assert.deepEqual(readdirSync(path.join(root,'supabase/migrations')).filter(x=>/^\d{14}_.+\.sql$/.test(x)).sort(),op.allLocalMigrations.map(e=>path.basename(e.path)).sort());
const isolated=path.join(root,op.isolatedWorkdir);
assert.equal(isolated,path.join(root,'.vercel/mcy-learner-write-20261011'));
assert.equal(hash(bytes(op.isolatedWorkdir+'/supabase/config.toml')),op.isolatedConfigSha256);
assert.equal(bytes(op.isolatedWorkdir+'/supabase/config.toml').toString(),'project_id = "mcy"\n');
assert.deepEqual(readdirSync(path.join(isolated,'supabase/migrations')).sort(),op.isolatedInputs.map(e=>path.basename(e.path)).sort());
for(const e of op.isolatedInputs)assert.equal(hash(bytes(op.isolatedWorkdir+'/'+e.path)),e.sha256);
const cli='C:/Users/Admin/AppData/Local/Temp/mcy-rpc-fix-tools-442b31230cac41c8903f7b36b0e613d1/_npx/fcaf72be640e6e73/node_modules/@supabase/cli-windows-x64/bin/supabase.exe';
function command(args){return spawnSync(cli,args,{encoding:'utf8',windowsHide:true,timeout:60000,input:'',env:{...process.env,SUPABASE_TELEMETRY_DISABLED:'true',DO_NOT_TRACK:'1'}});}
const mode=process.argv[2];assert.ok(['--verify','--apply','--post-list'].includes(mode));
const expectedVersions=op.isolatedInputs.filter(e=>e.remoteApplied).map(e=>e.path.split('/').at(-1).slice(0,14));
if(mode==='--post-list')expectedVersions.push(version);
const list=command(['migration','list','--project-ref',op.target.projectRef,'--workdir',isolated,'--output-format','json']);
assert.ok(!list.error&&list.status===0,'Official CLI list failed; raw output withheld');
const json=list.stdout.match(/\{"migrations":.*\}/s);assert.ok(json);
const entries=JSON.parse(json[0]).migrations;
assert.equal(entries.length,21);assert.ok(entries.every(e=>e.local&&(!e.remote||e.local===e.remote)));
assert.deepEqual(entries.filter(e=>e.remote).map(e=>e.remote).sort(),expectedVersions.sort());
assert.deepEqual(entries.filter(e=>!e.remote).map(e=>e.local),mode==='--post-list'?[]:[version]);
console.log(JSON.stringify({mode,immutableManifestSha256:approvedHash,allPinnedHashes:'PASS',officialLedger:{aligned:expectedVersions.length,remoteOnly:0,pending:entries.filter(e=>!e.remote).map(e=>e.local)}}));
if(mode==='--apply'){
 const baseline=JSON.parse(bytes('analyse/MCY_LEARNER_WRITE_BASELINE_2026-10-12.json'));
 assert.equal(baseline.status,'PASS');assert.equal(baseline.projectRef,op.target.projectRef);
 assert.equal(baseline.organizationId,op.target.organizationId);assert.equal(baseline.manifestSha256,approvedHash);
 const age=Date.now()-Date.parse(baseline.capturedAt);assert.ok(age>=0&&age<15*60*1000,'Fresh catalog baseline required');
 assert.deepEqual(baseline.ledger,expectedVersions);
 assert.equal(baseline.owner.definitionMd5,'5ad67fe52caf79bd07c51caa0c30db92');assert.equal(String(baseline.owner.oid),'19270');
 assert.equal(baseline.currentOperator,'postgres');assert.equal(baseline.newWriterAbsent,true);
 assert.equal(baseline.owner.owner,'postgres');assert.deepEqual(baseline.owner.searchPath,['search_path=""']);
 assert.equal(baseline.owner.acl,'{postgres=X/postgres,service_role=X/postgres}');
 assert.deepEqual(baseline.privateUsage,{anon:false,authenticated:false,service_role:false});
 assert.equal(baseline.effectivePrivileges.length,60);
 for(const role of ['anon','authenticated','service_role'])for(const table of ['public.checkins','public.checkin_observations','public.user_consents','private.consent_events'])for(const privilege of ['SELECT','INSERT','UPDATE','DELETE','TRUNCATE']){
  const matches=baseline.effectivePrivileges.filter(p=>p.role===role&&p.table===table&&p.privilege===privilege);
  assert.equal(matches.length,1);const expected=table!=='private.consent_events'&&(role==='service_role'||(role==='authenticated'&&privilege==='SELECT'&&table!=='public.user_consents'));
  assert.equal(matches[0].allowed,expected,'Baseline effective privilege drift');
 }
 const originalFunctions={
  'private.save_my_checkin_expanded':{oid:'19204',bodyMd5:'bde5bb8980bd1c075cc1e9db6eda7e14',acl:'{postgres=X/postgres}'},
  'public.record_my_consent':{oid:'19184',bodyMd5:'9f453baa1a839c60fd88213ed35cb4b7',acl:'{postgres=X/postgres,authenticated=X/postgres,service_role=X/postgres}'},
  'public.save_my_checkin_with_current_consent':{oid:'19199',bodyMd5:'cd2531b703fd1f588b0469a55e67f8ef',acl:'{postgres=X/postgres,authenticated=X/postgres,service_role=X/postgres}'},
 };
 assert.equal(baseline.functions.length,3);
 for(const f of baseline.functions){const expected=originalFunctions[f.schema+'.'+f.name];assert.ok(expected);assert.equal(String(f.oid),expected.oid);assert.equal(f.bodyMd5,expected.bodyMd5);assert.equal(f.acl,expected.acl);assert.equal(f.owner,'postgres');assert.deepEqual(f.config,['search_path=""']);}
 assert.equal(baseline.ai.enabled,false);assert.equal(baseline.ai.version,1);assert.equal(baseline.ai.modelUnset,true);
 const exactArgs=['migration','up','--linked','--include-all','--project-ref',op.target.projectRef,'--workdir',isolated];
 assert.deepEqual(op.proposedApplyArguments.map(x=>x.replaceAll('\\','/')),exactArgs.map(x=>x.replaceAll('\\','/')));
 const receiptPath='analyse/MCY_LEARNER_WRITE_APPLY_2026-10-12.json';
 assert.ok(!existsSync(receiptPath),'Prior apply attempt exists; inspect ledger/outcome, never retry automatically');
 const receipt={kind:'ApprovedSelectiveLearnerWriteApply',releaseId:op.releaseId,manifestSha256:approvedHash,projectRef:op.target.projectRef,organizationId:op.target.organizationId,startedAt:new Date().toISOString(),phase:'INTENT_RECORDED',humanDecision:'Duyệt gói staging và kiểm thử giới hạn trên',operatorPath:'Official CLI 2.119.0, isolated 20-applied-plus-one workdir',baselineSha256:hash(bytes('analyse/MCY_LEARNER_WRITE_BASELINE_2026-10-12.json')),arguments:exactArgs,automaticRetry:false};
 writeFileSync(receiptPath,JSON.stringify(receipt,null,2)+'\n',{flag:'wx'});
 const result=command(exactArgs);
 receipt.completedAt=new Date().toISOString();receipt.exitCode=result.status;receipt.spawnError=!!result.error;
 receipt.phase=!result.error&&result.status===0?'CLI_EXIT_0_READBACK_REQUIRED':'UNCERTAIN_OR_FAILED_READBACK_REQUIRED';
 receipt.outputSha256=hash((result.stdout||'')+(result.stderr||''));
 receipt.appliedCandidateReported=((result.stdout||'')+(result.stderr||'')).includes('20261002120000');
 writeFileSync(receiptPath,JSON.stringify(receipt,null,2)+'\n');
 console.log(JSON.stringify({phase:receipt.phase,exitCode:receipt.exitCode,appliedCandidateReported:receipt.appliedCandidateReported,rawOutputWithheld:true}));
 process.exitCode=receipt.exitCode===0?0:1;
}
