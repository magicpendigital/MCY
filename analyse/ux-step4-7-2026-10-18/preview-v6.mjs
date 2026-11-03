import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createServer } from 'vite';
import { isolatePlaywrightTestEnvironment } from '../../scripts/playwright-test-environment.mjs';

const dir = import.meta.dirname;
const root = path.resolve(dir, '../..');
const candidate = path.join(root, '.vercel/ux-step4-7-20261018-v7');
const sha = file => createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const inputFreeze = JSON.parse(fs.readFileSync(path.join(dir, 'STRICT-PREVIEW-INPUT-FREEZE-v2.json')));
const sourceFreezePath = path.join(dir, 'CANDIDATE-SOURCE-FREEZE-v7.json');
assert.equal(sha(sourceFreezePath), inputFreeze.sourceFreezeSha256);
assert.equal(sha(new URL(import.meta.url)), inputFreeze.helperSha256);
const source = JSON.parse(fs.readFileSync(sourceFreezePath));
assert.equal(source.candidate, '.vercel/ux-step4-7-20261018-v7');
for (const item of source.appInputs) assert.equal(sha(path.join(candidate, item.path)), item.sha256, item.path);
for (const name of fs.readdirSync(candidate)) assert(!name.startsWith('.env'));
for (const name of Object.keys(process.env)) if (name.startsWith('VITE_')) delete process.env[name];
isolatePlaywrightTestEnvironment();
const envDir = path.join(candidate, '.invalid');
fs.mkdirSync(envDir, { recursive: true });
const server = await createServer({
  root: candidate, envDir, configFile: path.join(candidate, 'vite.config.ts'), configLoader: 'runner',
  cacheDir: path.join(candidate, '.vite-preview-v6'),
  server: {
    host: '127.0.0.1', port: 4195, strictPort: true,
    headers: { 'Content-Security-Policy': "connect-src 'self' ws://127.0.0.1:*; frame-src 'none'; img-src 'self' data:; media-src 'none'" },
    fs: { allow: [candidate, path.join(root, 'node_modules')] },
  },
});
try { await server.listen(); } catch (error) { await server.close(); throw error; }
console.log('http://127.0.0.1:4195/?mode=web — frozen UX 4.7 v7, invalid backend, strict no external frames/media');
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, async () => { await server.close(); process.exit(0); });
