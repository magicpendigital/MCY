// Schema-only export using the CLI's short-lived login-role connection.
// Docker Config.Env temporarily contains connection credentials; removal is verified.
// No access-token store reads, password logging or application-row export.
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { randomUUID, createHash } from 'node:crypto';
import { writeFileSync } from 'node:fs';
const cli=process.env.MCY_SUPABASE_CLI;
const output=process.env.MCY_OWNER_SCHEMA_ONLY_FILE;
const docker=process.env.MCY_DOCKER_PATH||'C:/Program Files/Docker/Docker/resources/bin/docker.exe';
assert.ok(cli&&output,'Explicit CLI and schema-only output paths required');
const run=(exe,args,env,timeout=30000)=>new Promise((accept,reject)=>{
  const p=spawn(exe,args,{windowsHide:true,env,stdio:['ignore','pipe','pipe']});
  let out='',err='';p.stdout.on('data',v=>out+=v);p.stderr.on('data',v=>err+=v);
  const timer=setTimeout(()=>p.kill(),timeout);p.once('error',reject);
  p.once('close',code=>{clearTimeout(timer);accept({code,out,err});});
});
const dry=await run(cli,['db','dump','--project-ref','mhumbczqrzutdnraafhs','--schema','public,private','--dry-run','--workdir',process.cwd(),'--agent','yes'],{...process.env,SUPABASE_TELEMETRY_DISABLED:'true',DO_NOT_TRACK:'1'});
assert.equal(dry.code,0,'Official CLI connection preflight failed; provider details omitted');
const connection={};
for(const name of ['PGHOST','PGPORT','PGUSER','PGPASSWORD','PGDATABASE']) {
  const line=dry.out.split('\n').find(value=>value.startsWith('export '+name+'='));
  assert.ok(line,'CLI connection field missing');
  const value=line.slice(('export '+name+'=').length).trim();
  assert.ok(/^"[^"\\\r\n]*"$/.test(value),'Unexpected CLI assignment syntax; refuse shell evaluation');
  connection[name]=value.slice(1,-1);
}
assert.match(connection.PGHOST,/^(?:[a-z0-9-]+\.)*(?:pooler\.supabase\.com|db\.mhumbczqrzutdnraafhs\.supabase\.co)$/);
assert.match(connection.PGUSER,/^cli_login_postgres(?:\.mhumbczqrzutdnraafhs)?$/);
assert.match(connection.PGPORT,/^\d+$/);
const name='mcy-owner-schema-dump-'+randomUUID().replaceAll('-','').slice(0,12);
let receipt;
try {
  const args=['run','--rm','--pull=never','--name',name,'--label','mcy.owner.schema-export=true','--network','bridge'];
  for(const key of Object.keys(connection))args.push('--env',key);
  args.push('--env','PGSSLMODE','--env','PGOPTIONS','public.ecr.aws/supabase/postgres:17.6.1.139','pg_dump','--schema-only','--quote-all-identifiers','--role','postgres','--schema','public','--schema','private');
  const dumped=await run(docker,args,{...process.env,...connection,PGSSLMODE:'require',PGOPTIONS:'-c default_transaction_read_only=on'},60000);
  if (dumped.code !== 0) {
    let diagnostic = dumped.err;
    for (const value of Object.values(connection).sort((a,b)=>b.length-a.length)) diagnostic = diagnostic.replaceAll(value, '[connection-field]');
    diagnostic = diagnostic.replaceAll(/postgres(?:ql)?:\/\/[^\s]+/gi, '[connection-uri]');
    console.error(diagnostic.slice(-1600));
  }
  assert.equal(dumped.code,0,'Schema-only pg_dump failed; connection values omitted');
  assert.match(dumped.out,/CREATE TABLE "private"\."ai_configurations"/);
  assert.ok(!/^COPY .+ FROM stdin|^INSERT INTO /mi.test(dumped.out),'Refuse dumped row data');
  writeFileSync(output,dumped.out);
  receipt={status:'PASS',schemaBytes:Buffer.byteLength(dumped.out),sha256:createHash('sha256').update(dumped.out).digest('hex'),source:'Official CLI ephemeral login-role + cached PostgreSQL 17.6 pg_dump',schemas:['public','private'],dataExported:false,credentialsPrinted:false,credentialBearingContainerRemoved:true};
} finally {
  try {
    const absent=r=>r.code!==0 && /no such (?:object|container)/i.test(r.err);
    const args=['inspect','--format','{{index .Config.Labels "mcy.owner.schema-export"}}',name];
    const check=await run(docker,args,process.env);
    if(!absent(check)) {
      assert.equal(check.code,0,'Export container inspection failed; provider details omitted');
      assert.equal(check.out.trim(),'true','Export container ownership mismatch');
      const removed=await run(docker,['rm','--force','--volumes',name],process.env);
      assert.equal(removed.code,0,'Export container removal failed; provider details omitted');
    }
    assert.ok(absent(await run(docker,args,process.env)),'Export container absence not verified; refuse PASS');
  } finally { for(const key of Object.keys(connection))delete connection[key]; }
}
console.log(JSON.stringify(receipt));
