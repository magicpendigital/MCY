import {createServer} from 'vite';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {isolatePlaywrightTestEnvironment} from '../../scripts/playwright-test-environment.mjs';
export async function start(port){
 const project=path.resolve(import.meta.dirname,'../..'),candidate=path.join(project,'.vercel/ux-step4-2-visual-20261016');
 for(const key of Object.keys(process.env))if(key.startsWith('VITE_'))delete process.env[key];
 isolatePlaywrightTestEnvironment();
 const envDir=path.join(candidate,'.invalid');fs.mkdirSync(envDir,{recursive:true});
 for(const name of fs.readdirSync(candidate))assert(!name.startsWith('.env'));
 const server=await createServer({root:candidate,envDir,configFile:path.join(candidate,'vite.config.ts'),configLoader:'runner',cacheDir:path.join(candidate,'.vite-qa'),server:{host:'127.0.0.1',port,strictPort:true,fs:{allow:[candidate,path.join(project,'node_modules')]}}});
 try{await server.listen();}catch(e){await server.close();throw e;}return server;
}
export default async()=>{const server=await start(4196);return async()=>await server.close();};
