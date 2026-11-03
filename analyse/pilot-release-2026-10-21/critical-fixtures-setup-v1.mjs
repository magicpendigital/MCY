import path from 'node:path';
import { existsSync, mkdirSync, readdirSync } from 'node:fs';
import { createServer } from 'file:///C:/Users/Admin/.codex/worktrees/pilot-web-android-20261021/MCY/node_modules/vite/dist/node/index.js';
import { startReviewEgressGuard } from 'file:///C:/Users/Admin/.codex/worktrees/pilot-web-android-20261021/MCY/scripts/unit-review-egress-guard.mjs';
const tree = 'C:/Users/Admin/.codex/worktrees/pilot-web-android-20261021/MCY';
export default async function setup() {
  if (process.env.VITE_SUPABASE_URL !== 'https://mcy-playwright.invalid' || process.env.VITE_SUPABASE_PUBLISHABLE_KEY !== 'sb_publishable_mcy_playwright_fixture') throw new Error('Only existing invalid fixture transport allowed');
  if (readdirSync(tree).some(name => name.startsWith('.env') && name !== '.env.example')) throw new Error('Unexpected environment file; no read attempted');
  const control = path.join(tree, '.vercel/critical-fixtures-v1');
  if (existsSync(control)) throw new Error('Existing critical fixture control outputs; no automatic retry');
  mkdirSync(control, { recursive: true });
  const guard = await startReviewEgressGuard({ port: 4291, allowedOrigin: 'http://127.0.0.1:4290', receiptPath: path.join(control, 'egress.json') });
  let server;
  try {
    server = await createServer({ root: tree, envDir: control, configFile: path.join(tree, 'vite.config.ts'), configLoader: 'runner',
      server: { host: '127.0.0.1', port: 4290, strictPort: true, hmr: false,
        fs: { strict: true, allow: [tree], deny: ['**/.env*', '**/.git/**', '**/.vercel/**', '**/server/**'] } } });
    await server.listen();
  } catch (cause) { await server?.close(); await guard.close(); throw cause; }
  return async () => {
    let receipt; try { await server.close(); } finally { receipt = await guard.close(); }
    if (receipt.unexpected) throw new Error(`Fixture deny proxy observed ${receipt.unexpected} unexpected requests`);
  };
}
