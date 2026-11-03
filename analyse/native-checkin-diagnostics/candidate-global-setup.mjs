import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {createServer} from 'vite';
import {isolatePlaywrightTestEnvironment} from '../../scripts/playwright-test-environment.mjs';

export default async function globalSetup() {
  const project=path.resolve(process.cwd()), candidate=path.resolve(project,'.vercel/native-checkin-late-save-candidate');
  assert(project.toLowerCase()==='d:\\projects\\mcy'&&candidate.startsWith(project+path.sep),'Fixed workspace required');
  const hash=p=>createHash('sha256').update(fs.readFileSync(p)).digest('hex');
  const sourceRecord=path.join(project,'analyse/MCY_NATIVE_LATE_SAVE_CANDIDATE_SOURCE_2026-10-13.json');
  const verifySources=()=>{
    assert(hash(sourceRecord)==='eca27da324ecb5cbf11540c0f53b952a678d7f72a3e084a7bca68c16e8320821','Prepared source snapshot drift');
    const records=JSON.parse(fs.readFileSync(sourceRecord,'utf8')).sourceRecords;
    assert(Array.isArray(records)&&records.length===68,'Expected source snapshot');
    for(const item of records){
      const original=path.resolve(project,item.path), copied=path.resolve(candidate,item.path);
      assert(original.startsWith(project+path.sep)&&copied.startsWith(candidate+path.sep),'Source path outside workspace');
      assert(hash(original)===item.originalSha256&&hash(copied)===item.candidateSha256,'Prepared source drift');
    }
    const auxiliary=path.join(project,'analyse/MCY_NATIVE_LATE_SAVE_CANDIDATE_AUX_INPUTS_2026-10-13.json');
    assert(hash(auxiliary)==='1158ed459ee49d44ee699fcc48b05c7e8c24f4d41bd2c5496b1aab738585acf1','Auxiliary snapshot drift');
    const extra=JSON.parse(fs.readFileSync(auxiliary,'utf8')).records;
    assert(Array.isArray(extra)&&extra.length===3,'Expected bootstrap/config/token stylesheet');
    for(const item of extra){
      const original=path.resolve(project,item.path),copied=path.resolve(candidate,item.path);
      assert(original.startsWith(project+path.sep)&&copied.startsWith(candidate+path.sep),'Auxiliary path outside workspace');
      assert(hash(original)===item.originalSha256&&hash(copied)===item.candidateSha256,'Auxiliary input drift');
    }
  };
  verifySources();
  assert(hash(path.join(project,'src/Prototype.tsx'))==='58b8845cf5790c251e85554a27a74b9cf6d41f1c1568330868a205a4bbb84bd0','Original source drift');
  assert(hash(path.join(candidate,'src/Prototype.tsx'))==='32c100fbcd7433f6db2c6c299556adb22633d5cd8ecd9da01ca5420515287482','Candidate drift');
  for(const name of ['.env','.env.local','.env.development','.env.development.local'])assert(!fs.existsSync(path.join(candidate,name)),'Candidate must not contain environment files');
  const port=Number(process.env.MOBILE_RUNTIME_TEST_PORT??4177);
  assert(Number.isInteger(port)&&port>0&&port<=65535,'Invalid fixture port');
  isolatePlaywrightTestEnvironment();
  const server=await createServer({
    root:candidate,envDir:candidate,publicDir:path.join(project,'public'),
    configFile:path.join(project,'vite.config.ts'),configLoader:'runner',
    server:{host:'127.0.0.1',port,strictPort:true,fs:{allow:[project]}},
  });
  try {await server.listen();} catch(error) {await server.close();throw error;}
  return async()=>{await server.close();verifySources();};
}
