import {build} from 'vite';import path from 'node:path';import {isolatePlaywrightTestEnvironment} from '../../scripts/playwright-test-environment.mjs';
const candidate=path.resolve('.vercel/ux-step4-5-20261017');for(const k of Object.keys(process.env))if(k.startsWith('VITE_'))delete process.env[k];isolatePlaywrightTestEnvironment();
await build({root:candidate,envDir:path.join(candidate,'.invalid'),configFile:path.join(candidate,'vite.config.ts'),configLoader:'runner'});
