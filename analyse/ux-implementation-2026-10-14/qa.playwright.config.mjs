import {defineConfig} from '@playwright/test';
import path from 'node:path';
const candidate=path.resolve(import.meta.dirname,'../../.vercel/ux-implementation-20261014');
export default defineConfig({testDir:path.join(candidate,'tests'),testMatch:'**/*.spec.ts',globalSetup:'./qa-global-setup.mjs',timeout:20_000,workers:2,reporter:[['list'],['json',{outputFile:path.join(import.meta.dirname,'ui-results.json')}]],outputDir:path.join(candidate,'test-results-final'),use:{baseURL:'http://127.0.0.1:4190',viewport:{width:1100,height:1100},launchOptions:{channel:'msedge'}}});
