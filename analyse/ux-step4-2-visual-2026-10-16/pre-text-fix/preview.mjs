import {start} from './qa-global-setup.mjs';
const server=await start(4190);
console.log('http://127.0.0.1:4190/?mode=web — fictional .invalid backend');
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,async()=>{await server.close();process.exit(0);});
