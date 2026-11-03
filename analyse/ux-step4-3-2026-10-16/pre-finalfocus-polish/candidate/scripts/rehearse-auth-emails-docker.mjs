// Real GoTrue Go-template renderer + disposable PostgreSQL/Mailpit. No cloud or inbox.
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createHmac, createHash, randomUUID } from 'node:crypto';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import http from 'node:http';
import net from 'node:net';
import { scenarios, subjectFor } from './auth-email-templates.mjs';

const docker = process.env.MCY_DOCKER_PATH || 'C:/Program Files/Docker/Docker/resources/bin/docker.exe';
const receiptPath = process.env.MCY_EMAIL_DOCKER_RECEIPT || 'analyse/MCY_AUTH_EMAIL_DOCKER_2026-10-11.json';
const suffix = randomUUID().replaceAll('-', '').slice(0, 10), prefix = 'mcy-email-' + suffix;
const db = prefix + '-db', mail = prefix + '-mail', network = prefix + '-net';
const labelKey = 'mcy.email.rehearsal', containers = [], checks = [];
const dbImage = 'public.ecr.aws/supabase/postgres:17.6.1.139', mailImage = 'public.ecr.aws/supabase/mailpit:v1.30.2', authImage = 'public.ecr.aws/supabase/gotrue:v2.191.0';
const password = 'fictional-local-email-password', secret = 'fictional-local-email-jwt-secret-for-isolated-tests-only';
const hash = v => createHash('sha256').update(v).digest('hex');
const claims = { role: 'service_role', aud: 'authenticated', exp: Math.floor(Date.now() / 1000) + 3600 };
const encoded = v => Buffer.from(JSON.stringify(v)).toString('base64url');
const jwtBase = encoded({ alg: 'HS256', typ: 'JWT' }) + '.' + encoded(claims);
const adminToken = jwtBase + '.' + createHmac('sha256', secret).update(jwtBase).digest('base64url');
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
function execute(args, input = '', timeout = 45000) {
  return new Promise((resolve, reject) => {
    const child = spawn(docker, args, { windowsHide: true, stdio: ['pipe', 'pipe', 'pipe'] }); let out = '', err = '';
    child.stdout.on('data', value => out += value); child.stderr.on('data', value => err += value);
    const timer = setTimeout(() => child.kill(), timeout); child.on('error', reject);
    child.on('close', code => { clearTimeout(timer); resolve({ code, out, err }); }); child.stdin.on('error', () => {}); child.stdin.end(input);
  });
}
async function run(args, input, timeout) { const result = await execute(args, input, timeout); assert.equal(result.code, 0, `Local Docker ${args[0]} failed; response omitted`); return result.out.trim(); }
async function until(predicate, name, timeout = 45000) { const end = Date.now() + timeout; while (Date.now() < end) { if (await predicate()) return; await pause(200); } throw Error('Timeout: ' + name); }
const pass = name => { checks.push({ name, status: 'PASS' }); console.log('PASS ' + name); };
async function port() { const socket = net.createServer(); await new Promise(resolve => socket.listen(0, '127.0.0.1', resolve)); const value = socket.address().port; await new Promise(resolve => socket.close(resolve)); return value; }
const server = http.createServer((req, res) => {
  const filename = req.url?.slice(1); const scenario = scenarios.find(s => `${s.id}${s.kind === 'notification' ? '_notification' : ''}.html` === filename);
  if (!scenario) { res.writeHead(404).end(); return; }
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' }); res.end(readFileSync(`supabase/templates/${filename}`));
});
const apiRequest = async (base, route, body, token) => {
  const response = await fetch(base + route, { method: body ? (route === '/user' ? 'PUT' : 'POST') : 'GET', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) }, ...(body ? { body: JSON.stringify(body) } : {}), signal: AbortSignal.timeout(12000) });
  const data = await response.json(); return { status: response.status, data };
};
let failed;
try {
  for (const image of [dbImage, mailImage, authImage]) await run(['image', 'inspect', '--format', '{{.Id}}', image]);
  await new Promise(resolve => server.listen(0, '0.0.0.0', resolve)); const templatePort = server.address().port;
  await run(['network', 'create', '--label', `${labelKey}=${suffix}`, network]);
  containers.push(db); await run(['run', '-d', '--pull=never', '--name', db, '--label', `${labelKey}=${suffix}`, '--network', network, '--memory', '1g', '--cpus', '2', '-e', 'POSTGRES_INITDB_ARGS=--no-sync', '-e', `POSTGRES_PASSWORD=${password}`, dbImage]);
  await until(async () => { const logs = await execute(['logs', db]); return /init process complete|Skipping initialization/.test(logs.out + logs.err); }, 'database initialization complete', 120000);
  await until(async () => (await execute(['exec', db, 'pg_isready', '-U', 'postgres'])).code === 0, 'database readiness');
  assert.equal(await run(['inspect', '--format', `{{index .Config.Labels "${labelKey}"}}`, db]), suffix);
  // The cached PostgreSQL image contains an old Auth scaffold owned by a different
  // role. Replace only this empty disposable schema before current GoTrue migrates.
  await run(['exec', '-i', db, 'psql', '-U', 'supabase_admin', '-d', 'postgres', '-v', 'ON_ERROR_STOP=1'], 'drop schema auth cascade; create schema auth authorization postgres; alter role postgres set search_path=auth,public,extensions;');
  containers.push(mail); const mailPort = await port(); await run(['run', '-d', '--pull=never', '--name', mail, '--label', `${labelKey}=${suffix}`, '--network', network, '-p', `127.0.0.1:${mailPort}:8025`, mailImage]);
  const mailBase = `http://127.0.0.1:${mailPort}`;
  await until(async () => { try { return (await fetch(mailBase + '/api/v1/messages')).ok; } catch { return false; } }, 'Mailpit readiness');
  let users;
  const cases = [
    { name: 'saved-vi', metadata: 'vi-VN', request: '', lang: 'vi' },
    { name: 'saved-en', metadata: 'en-US', request: '', lang: 'en' },
    { name: 'request-en-overrides-vi', metadata: 'vi-VN', request: 'en-US', lang: 'en' },
    { name: 'request-vi-overrides-en', metadata: 'en-US', request: 'vi-VN', lang: 'vi' },
    { name: 'unknown-locale', metadata: 'fr-FR', request: '', lang: 'vi' },
    { name: 'hostile-metadata', metadata: { role: 'owner', locale: 'en-US', content: '<script>fixture</script>' }, request: '', lang: 'vi' },
  ];
  for (const [index, scenario] of scenarios.entries()) {
    const name = prefix + '-auth-' + index, apiPort = await port(), base = `http://127.0.0.1:${apiPort}`;
    const filename = `${scenario.id}${scenario.kind === 'notification' ? '_notification' : ''}.html`;
    const env = {
      GOTRUE_API_HOST: '0.0.0.0', GOTRUE_API_PORT: '9999', API_EXTERNAL_URL: base,
      GOTRUE_DB_DRIVER: 'postgres', GOTRUE_DB_DATABASE_URL: `postgres://postgres:${password}@${db}:5432/postgres?sslmode=disable`, GOTRUE_DB_NAMESPACE: 'auth',
      GOTRUE_SITE_URL: 'https://motchutyoga.magicpendigital.com', GOTRUE_URI_ALLOW_LIST: 'https://motchutyoga.magicpendigital.com/auth/callback*',
      GOTRUE_JWT_SECRET: secret, GOTRUE_JWT_EXP: '3600', GOTRUE_JWT_ADMIN_ROLES: 'service_role', GOTRUE_JWT_AUD: 'authenticated',
      GOTRUE_EXTERNAL_EMAIL_ENABLED: 'true', GOTRUE_MAILER_AUTOCONFIRM: 'false', GOTRUE_SMTP_HOST: mail, GOTRUE_SMTP_PORT: '1025', GOTRUE_SMTP_ADMIN_EMAIL: 'no-reply@example.test', GOTRUE_SMTP_SENDER_NAME: 'Fictional MCY renderer fixture',
      GOTRUE_SMTP_MAX_FREQUENCY: '0', GOTRUE_RATE_LIMIT_EMAIL_SENT: '1000', GOTRUE_MAILER_OTP_LENGTH: '8',
      GOTRUE_MAILER_TEMPLATES_MAGIC_LINK: `http://host.docker.internal:${templatePort}/${filename}`, GOTRUE_MAILER_SUBJECTS_MAGIC_LINK: subjectFor(scenario),
    };
    containers.push(name); const args = ['run', '-d', '--pull=never', '--name', name, '--label', `${labelKey}=${suffix}`, '--network', network, '-p', `127.0.0.1:${apiPort}:9999`];
    for (const [key, value] of Object.entries(env)) args.push('-e', `${key}=${value}`); args.push(authImage); await run(args);
    await until(async () => { try { return (await fetch(base + '/health')).ok; } catch { return false; } }, 'GoTrue readiness ' + index);
    {
      users = [];
      for (const item of cases) {
        const result = await apiRequest(base, '/admin/users', { email: `${scenario.id}-${item.name}@example.test`, password, role: 'authenticated', email_confirm: true, user_metadata: { locale: item.metadata, unrelated: 'preserved' } }, adminToken);
        assert.equal(result.status, 200, 'Fictional confirmed actor creation'); users.push(result.data);
      }
    }
    for (const [caseIndex, item] of cases.entries()) {
      const expectedLanguage = scenario.kind === 'notification' ? (item.metadata === 'en-US' ? 'en' : 'vi') : item.lang;
      await fetch(mailBase + '/api/v1/messages', { method: 'DELETE' });
      const redirect = `https://motchutyoga.magicpendigital.com/auth/callback?workspace=owner${item.request ? '&email_locale=' + item.request : ''}`;
      const result = await apiRequest(base, '/otp?redirect_to=' + encodeURIComponent(redirect), { email: users[caseIndex].email, create_user: false, data: { locale: item.metadata === 'en-US' ? 'vi-VN' : 'en-US', role: 'owner' } });
      assert.equal(result.status, 200, 'Local OTP request');
      let message;
      await until(async () => { const list = await (await fetch(mailBase + '/api/v1/messages')).json(); if (!list.messages?.length) return false; message = await (await fetch(mailBase + '/api/v1/message/' + list.messages[0].ID)).json(); return true; }, 'captured local email');
      assert.match(message.HTML, new RegExp(`<html lang="${expectedLanguage}"`));
      assert.ok(message.Subject.includes(expectedLanguage === 'en' ? 'A Little Yoga' : 'Một chút yoga'), 'Localized Go-rendered subject');
      assert.ok(!message.HTML.includes('{{') && !message.Subject.includes('{{'), 'No unrendered template');
      assert.ok(!message.HTML.includes('<script>') && !message.HTML.includes('preserved'), 'Metadata never becomes HTML copy');
      if (scenario.kind === 'template' && !scenario.codeOnly) { assert.ok(message.HTML.includes(base + '/verify?'), 'Original GoTrue confirmation URL'); assert.ok(message.HTML.includes('redirect_to='), 'Original destination'); }
      if (caseIndex < 2) {
        mkdirSync('.vercel/mcy-auth-emails-20261011/rendered', { recursive: true });
        const sanitized = message.HTML.replaceAll(/href="[^"]*\/verify\?[^\"]*"/g, 'href="https://example.test/fictional-verification"').replaceAll(/\b\d{6,8}\b/g, '123456');
        writeFileSync(`.vercel/mcy-auth-emails-20261011/rendered/${filename.replace('.html', '')}-${expectedLanguage}.html`, sanitized);
      }
      const state = await run(['exec', '-i', db, 'psql', '-U', 'postgres', '-d', 'postgres', '-At', '-v', 'ON_ERROR_STOP=1'], `select raw_user_meta_data::text from auth.users where id='${users[caseIndex].id}';`);
      assert.equal(JSON.parse(state).unrelated, 'preserved'); assert.deepEqual(JSON.parse(state).locale, item.metadata); assert.equal(JSON.parse(state).role, undefined);
    }
    pass(`GoTrue subject/body ${scenario.id}: VI/EN, ${scenario.kind === 'notification' ? 'stored locale independent of redirect hints' : 'request override both directions'}, unknown/object metadata fallback; existing OTP data cannot alter metadata or roles`);
    if (index === 0) {
      const login = await apiRequest(base, '/token?grant_type=password', { email: users[0].email, password }); assert.equal(login.status, 200);
      const denied = await apiRequest(base, '/user', { data: { locale: 'en-US' } }); assert.equal(denied.status, 401);
      const changed = await apiRequest(base, '/user', { data: { locale: 'en-US' } }, login.data.access_token); assert.equal(changed.status, 200); assert.equal(changed.data.id, users[0].id); assert.equal(changed.data.user_metadata.unrelated, 'preserved'); assert.equal(changed.data.role, 'authenticated');
      await apiRequest(base, '/user', { data: { locale: 'vi-VN' } }, login.data.access_token);
      pass('Authenticated locale update is actor-bound, preserves unrelated metadata and Auth role; anonymous update denied');
    }
    await run(['rm', '-f', '-v', name]);
  }
} catch (error) {
  failed = error; console.error('FAIL ' + error.message);
  const diagnosticName = containers.findLast(name => name.includes('-auth-')) || containers.find(name => name === db);
  if (diagnosticName) {
    const logs = await execute(['logs', '--tail', '12', diagnosticName]);
    const safe = (logs.out + logs.err).replaceAll(password, '[fixture-password]').replaceAll(secret, '[fixture-secret]').replaceAll(/Bearer\s+\S+/g, 'Bearer [omitted]').replaceAll(/token=[^\s&"]+/g, 'token=[omitted]');
    console.error(safe.slice(-1800));
  }
}
finally {
  await new Promise(resolve => server.close(resolve));
  for (const name of containers.reverse()) {
    const found = await execute(['inspect', '--format', `{{index .Config.Labels "${labelKey}"}}`, name]);
    if (found.code === 0) { assert.equal(found.out.trim(), suffix, 'Cleanup ownership'); await run(['rm', '-f', '-v', name]); }
    assert.notEqual((await execute(['inspect', name])).code, 0, 'Disposable container absence');
  }
  const found = await execute(['network', 'inspect', '--format', `{{index .Labels "${labelKey}"}}`, network]);
  if (found.code === 0) { assert.equal(found.out.trim(), suffix); await run(['network', 'rm', network]); }
  assert.notEqual((await execute(['network', 'inspect', network])).code, 0); pass('Owned disposable containers, volumes and network removed; unrelated Docker project untouched');
  const receipt = { kind: 'AuthEmailDockerRehearsal', capturedAt: new Date().toISOString(), status: failed ? 'FAIL' : 'PASS', checks, images: { dbImage, mailImage, authImage }, scenarios: scenarios.length, rendererCases: scenarios.length * 6, notificationTriggerTests: false, renderedThrough: 'Common GoTrue MagicLink subject/body renderer', harnessSha256: hash(readFileSync(new URL(import.meta.url))), templateManifestSha256: hash(readFileSync('supabase/templates/manifest.json')), cloudRequests: false, externalEmails: false, credentialStoreReads: false, cleanupVerified: true };
  writeFileSync(receiptPath, JSON.stringify(receipt, null, 2) + '\n');
}
if (failed) process.exitCode = 1;
