import { defineConfig } from '@playwright/test';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
const artifacts=process.env.MCY_COLLABORATION_TEST_ARTIFACT_DIR||join(tmpdir(),'mcy-teacher-collaboration-regression');
export default defineConfig({
 testDir:fileURLToPath(new URL('./tests',import.meta.url)),testMatch:'**/*.spec.ts',timeout:20000,workers:1,retries:0,
 globalSetup:fileURLToPath(new URL('./scripts/teacher-collaboration-playwright-setup.mjs',import.meta.url)),
 outputDir:join(artifacts,'test-results'),reporter:[['line'],['json',{outputFile:join(artifacts,'playwright-report.json')}]],
 use:{baseURL:'http://127.0.0.1:4193',viewport:{width:1100,height:1100},trace:'off',
  launchOptions:{channel:'msedge',proxy:{server:'http://127.0.0.1:4194',bypass:'127.0.0.1,localhost'}}},
});
