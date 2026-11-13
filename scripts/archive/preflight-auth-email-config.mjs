import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { verifyAuthEmailBodyManifest } from './auth-email-body-manifest.mjs';
const projectRef = 'mhumbczqrzutdnraafhs';
const workdir = 'D:/Projects/MCY/.vercel/mcy-auth-emails-20261011';
const cli = 'C:/Users/Admin/AppData/Local/Temp/mcy-rpc-fix-tools-442b31230cac41c8903f7b36b0e613d1/_npx/fcaf72be640e6e73/node_modules/@supabase/cli-windows-x64/bin/supabase.exe';
const result = spawnSync(cli, ['config', 'diff', '--project-ref', projectRef, '--workdir', workdir, '--output-format', 'json'], { windowsHide: true, encoding: 'utf8', timeout: 60000, env: { ...process.env, SUPABASE_TELEMETRY_DISABLED: 'true', DO_NOT_TRACK: '1' } });
if (result.error || result.status !== 0) throw Error('Official read-only config diff failed; response omitted');
const lines = result.stdout.split(/\r?\n/), start = lines.findIndex(line => line.trimStart().startsWith('{'));
if (start < 0) throw Error('Expected official CLI JSON');
const diff = JSON.parse(lines.slice(start).join('\n')); if (diff.target.project_ref !== projectRef) throw Error('Wrong project');
const declared = diff.changes.filter(item => item.declared), unmanaged = diff.changes.filter(item => !item.declared);
const manifest=JSON.parse(readFileSync('supabase/templates/manifest.json','utf8'));
const bodyUploads=verifyAuthEmailBodyManifest(workdir,manifest);
const allowed=new Map(manifest.scenarios.map(s=>[`auth.email.${s.kind}.${s.id}.subject`,s.subject]));
const config=readFileSync(workdir+'/supabase/config.toml','utf8');
const redirectLine=config.match(/^additional_redirect_urls = (\[.+\])$/m);
if(!redirectLine)throw Error('Exact callbacks missing');
allowed.set('auth.additional_redirect_urls',JSON.parse(redirectLine[1]));
if(allowed.size!==14)throw Error('Unexpected manifest scenario count');
if (declared.some(item => !allowed.has(item.path.join('.')) || item.class!=='update' || JSON.stringify(item.local)!==JSON.stringify(allowed.get(item.path.join('.'))))) {
  console.log(JSON.stringify({ unexpectedDeclaredPaths: declared.map(item => item.path.join('.')) })); throw Error('Unexpected declared change; no mutation');
}
// Do not persist SMTP passwords or unrelated remote configuration.
const receipt = { kind: 'AuthEmailConfigPreflight', capturedAt: new Date().toISOString(), projectRef, configSha256: createHash('sha256').update(readFileSync(workdir + '/supabase/config.toml')).digest('hex'), manifestSha256: createHash('sha256').update(readFileSync('supabase/templates/manifest.json')).digest('hex'), bodyUploads, declaredChanges: declared, otpLength: unmanaged.find(item => item.path.join('.') === 'auth.email.otp_length')?.remote ?? 'CLI_DEFAULT_NO_DIFF', unmanagedDifferencePaths: unmanaged.map(item => item.path.join('.')), unmanagedDifferenceHashes: unmanaged.map(item => ({ path: item.path.join('.'), hash: createHash('sha256').update(JSON.stringify(item)).digest('hex') })), readOnly: true };
writeFileSync(process.argv.includes('--readback') ? 'analyse/MCY_AUTH_EMAIL_CONFIG_READBACK_2026-10-11.json' : 'analyse/MCY_AUTH_EMAIL_CONFIG_PREFLIGHT_2026-10-11.json', JSON.stringify(receipt, null, 2) + '\n');
console.log(JSON.stringify({ status: 'PREFLIGHT_ONLY', otpLength: receipt.otpLength, declaredPaths: declared.map(item => item.path.join('.')), unmanagedPaths: receipt.unmanagedDifferencePaths, secretValuesPersisted: false }));
