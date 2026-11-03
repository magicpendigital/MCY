import {createServer} from 'vite';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {isolatePlaywrightTestEnvironment} from '../../scripts/playwright-test-environment.mjs';
export default async function setup(){
  const project=path.resolve(import.meta.dirname,'../..');
  const candidate=path.join(project,'.vercel/ux-implementation-20261014');
  for(const name of ['.env','.env.local','.env.development','.env.development.local'])assert(!fs.existsSync(path.join(candidate,name)),'No candidate env files');
  for(const key of Object.keys(process.env))if(key.startsWith('VITE_'))delete process.env[key];
  isolatePlaywrightTestEnvironment();
  const server=await createServer({root:candidate,envDir:candidate,configFile:path.join(candidate,'vite.config.ts'),configLoader:'runner',cacheDir:path.join(candidate,'.vite-qa'),server:{host:'127.0.0.1',port:4190,strictPort:true,fs:{allow:[candidate,path.join(project,'node_modules')]}}});
  try{await server.listen();}catch(e){await server.close();throw e;}
  return async()=>server.close();
}
