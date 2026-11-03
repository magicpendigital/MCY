import {defineConfig} from '@playwright/test';
const port=Number(process.env.MOBILE_RUNTIME_TEST_PORT??4177);
if(!Number.isInteger(port)||port<1||port>65535)throw new Error('Invalid fixture port');
export default defineConfig({
  testDir:'.',testMatch:'late-save.spec.ts',workers:1,timeout:20000,
  globalSetup:'./candidate-global-setup.mjs',reporter:[['list']],
  outputDir:'../../.vercel/native-checkin-candidate-results',
  use:{baseURL:`http://127.0.0.1:${port}`,viewport:{width:390,height:844},
    ...(process.env.MCY_PLAYWRIGHT_CHANNEL?{launchOptions:{channel:process.env.MCY_PLAYWRIGHT_CHANNEL}}:{})},
});
