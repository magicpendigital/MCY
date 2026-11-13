import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { generate, emailRedirects } from './auth-email-templates.mjs';

const root = process.cwd(), workdir = path.join(root, '.vercel/mcy-auth-emails-20261011');
const baseline = JSON.parse(readFileSync('analyse/MCY_OWNER_AUTH_REDIRECT_CONFIG_PREFLIGHT_2026-10-11.json', 'utf8'));
const redirectEntry = baseline.declaredChanges.find(item => item.path.join('.') === 'auth.additional_redirect_urls');
if (!Array.isArray(redirectEntry?.local)) throw Error('Reviewed baseline callback list unavailable');
const localized = [...emailRedirects('vi-VN'), ...emailRedirects('en-US')].filter(url => url.startsWith('https://motchutyoga.magicpendigital.com/') || !url.includes('workspace='));
const redirects = [...new Set([...redirectEntry.local, ...localized])];
const manifest = generate();
const blocks = manifest.scenarios.map(s => `[auth.email.${s.kind}.${s.id}]\nsubject = ${JSON.stringify(s.subject)}\ncontent_path = ${JSON.stringify(s.contentPath)}\n`).join('\n');
mkdirSync(path.join(workdir, 'supabase/templates'), { recursive: true });
for (const s of manifest.scenarios) writeFileSync(path.join(workdir, s.contentPath), readFileSync(s.contentPath));
const config = `project_id = "mcy"\n\n[auth]\nadditional_redirect_urls = ${JSON.stringify(redirects)}\n\n${blocks}`;
writeFileSync(path.join(workdir, 'supabase/config.toml'), config);
// Root config is documentation/local reproducibility, never the cloud push workdir.
let local = readFileSync('supabase/config.toml', 'utf8');
local = local.split('# MCY managed Auth email templates')[0].trimEnd();
writeFileSync('supabase/config.toml', local + '\n\n# MCY managed Auth email templates — VI/EN; notification enablement is separate.\n' + blocks);
console.log(JSON.stringify({ prepared: true, workdir, templates: manifest.scenarios.length, exactCallbacks: redirects.length, cloudMutation: false }));
