import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createServer } from 'vite';
import { isolatePlaywrightTestEnvironment } from '../../scripts/playwright-test-environment.mjs';

const root = path.resolve(import.meta.dirname, '../..');
const candidate = path.join(root, '.vercel/ux-step4-7-20261018-v5');
const sha = file => createHash('sha256').update(fs.readFileSync(file)).digest('hex');
export default async function () {
  const sourceFreezePath = path.join(import.meta.dirname, 'CANDIDATE-SOURCE-FREEZE-v5.json');
  const harnessFreezePath = path.join(import.meta.dirname, 'RESPONSIVE-HARNESS-FREEZE-v6.json');
  const harness = JSON.parse(fs.readFileSync(harnessFreezePath));
  assert.equal(sha(sourceFreezePath), harness.sourceFreezeSha256);
  for (const item of harness.files) assert.equal(sha(path.join(root, item.path)), item.sha256, item.path);
  const source = JSON.parse(fs.readFileSync(sourceFreezePath));
  assert.equal(source.candidate, '.vercel/ux-step4-7-20261018-v5');
  for (const item of source.appInputs) assert.equal(sha(path.join(candidate, item.path)), item.sha256, item.path);
  for (const name of Object.keys(process.env)) if (name.startsWith('VITE_')) delete process.env[name];
  isolatePlaywrightTestEnvironment();
  for (const name of fs.readdirSync(candidate)) assert(!name.startsWith('.env'));
  const envDir = path.join(candidate, '.invalid');
  fs.mkdirSync(envDir, { recursive: true });
  const server = await createServer({ root: candidate, envDir, configFile: path.join(candidate, 'vite.config.ts'), configLoader: 'runner', cacheDir: path.join(candidate, '.vite-responsive-v6'), server: { host: '127.0.0.1', port: 4195, strictPort: true, headers: { 'Content-Security-Policy': "connect-src 'self' https://mcy-playwright.invalid ws://127.0.0.1:*; frame-src https://www.youtube-nocookie.com/embed/; img-src 'self' data:; media-src 'none'" }, fs: { allow: [candidate, path.join(root, 'node_modules')] } } });
  try { await server.listen(); } catch (error) { await server.close(); throw error; }
  return async () => await server.close();
}
