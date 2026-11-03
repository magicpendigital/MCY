import { build } from 'vite';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { isolatePlaywrightTestEnvironment } from '../../scripts/playwright-test-environment.mjs';

const candidate = path.resolve(import.meta.dirname, '../../.vercel/ux-step4-7-20261018-v5');
for (const name of fs.readdirSync(candidate)) assert(!name.startsWith('.env'));
for (const name of Object.keys(process.env)) if (name.startsWith('VITE_')) delete process.env[name];
isolatePlaywrightTestEnvironment();
const envDir = path.join(candidate, '.invalid');
fs.mkdirSync(envDir, { recursive: true });
await build({ root: candidate, envDir, configFile: path.join(candidate, 'vite.config.ts'), configLoader: 'runner' });
