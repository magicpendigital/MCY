import {start} from './qa-global-setup.mjs';
const server=await start(4192,true);
console.log('http://127.0.0.1:4192/?mode=web — .invalid backend + CSP blocks external frames/network; DOM lifecycle only, no real playback');
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,async()=>{await server.close();process.exit(0);});
