import { createServer } from 'vite';
import { resolve } from 'node:path';
import { isolatePlaywrightTestEnvironment } from '../../scripts/playwright-test-environment.mjs';

// Audit-only preview: no .env files, credentials, or production service target.
for (const key of Object.keys(process.env)) if (key.startsWith('VITE_')) delete process.env[key];
isolatePlaywrightTestEnvironment();
const server = await createServer({
  configFile: resolve('vite.config.ts'),
  configLoader: 'runner',
  envDir: resolve('analyse/ux-audit-2026-10-14/empty-env'),
  cacheDir: resolve('analyse/ux-audit-2026-10-14/vite-cache'),
  server: { host: '127.0.0.1', port: 4184, strictPort: true },
});
await server.listen();
console.log('Isolated audit preview http://127.0.0.1:4184 ; Supabase fixture .invalid; no env files loaded.');
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, async () => { await server.close(); process.exit(0); });
