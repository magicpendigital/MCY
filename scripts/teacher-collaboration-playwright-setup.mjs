import { createServer } from 'vite';
import { mkdir,writeFile } from 'node:fs/promises';
import { resolve,join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { isolatePlaywrightTestEnvironment } from './playwright-test-environment.mjs';
import { createDeniedOutboundProxy } from './teacher-collaboration-test-proxy.mjs';

export default async function setup() {
 const root=resolve(fileURLToPath(new URL('..',import.meta.url)));
 const artifacts=process.env.MCY_COLLABORATION_TEST_ARTIFACT_DIR||join(tmpdir(),'mcy-teacher-collaboration-regression');
 await mkdir(artifacts,{recursive:true});
 isolatePlaywrightTestEnvironment();
 const proxy=await createDeniedOutboundProxy();
 let server;
 const evidence={fixture:'full suite, single worker, synthetic backend; no outbound forwarding',coldWarmup:[],network:proxy.stats};
 try {
  server=await createServer({root,configFile:join(root,'vite.config.ts'),configLoader:'runner',envDir:false,
   cacheDir:join(artifacts,'node_modules/.vite-mcy-regression'),
   optimizeDeps:{include:['react','react-dom/client','react/jsx-runtime','@supabase/supabase-js','@capacitor/core','motion/react','@radix-ui/react-icons']},
   server:{host:'127.0.0.1',port:4193,strictPort:true}});
  await server.listen();
  // A transform of main alone does not await cold lazy-route/dependency optimization.
  // Precompile route modules before browser/test clocks start; do not preload them in the guest browser.
  for(const url of ['/src/main.tsx','/src/staff/owner.tsx','/src/staff/teacher.tsx','/src/staff/TeacherCollaborationPanel.tsx',
   '/src/backend/supabase.ts','/src/courses/CourseDetailScreen.tsx','/tests/staff-request-isolation-harness.tsx']){
   const started=performance.now();
   if(!await server.transformRequest(url))throw new Error('Fixture module did not transform: '+url);
   evidence.coldWarmup.push({url,milliseconds:Math.round(performance.now()-started)});
  }
  const optimizer=server.environments.client.depsOptimizer;
  if(optimizer){
   await optimizer.scanProcessing;
   optimizer.run();
   await Promise.all(Object.values({...optimizer.metadata.optimized,...optimizer.metadata.discovered}).map(info=>info.processing));
   evidence.optimizedDependencies=Object.keys(optimizer.metadata.optimized).sort();
  }
  await writeFile(join(artifacts,'fixture-ready.json'),JSON.stringify(evidence,null,2));
 }catch(error){if(server)await server.close();await proxy.close();throw error;}
 return async()=>{
  try{await server.close();}finally{await proxy.close();await writeFile(join(artifacts,'fixture-final.json'),JSON.stringify(evidence,null,2));}
 };
}
