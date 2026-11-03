import test from 'node:test';
import assert from 'node:assert/strict';
import { request } from 'node:http';
import { createDeniedOutboundProxy } from '../scripts/teacher-collaboration-test-proxy.mjs';
test('synthetic browser proxy rejects both HTTP and HTTPS tunneling without forwarding',async()=>{
 const proxy=await createDeniedOutboundProxy(0);
 try{
  const get=await new Promise((resolve,reject)=>{
   const req=request({host:'127.0.0.1',port:proxy.port,path:'http://outside.example.invalid/fictional',method:'GET'},res=>{res.resume();res.once('end',()=>resolve(res.statusCode));});
   req.once('error',reject);req.end();
  });assert.equal(get,403);
  const connect=await new Promise((resolve,reject)=>{
   const req=request({host:'127.0.0.1',port:proxy.port,path:'outside.example.invalid:443',method:'CONNECT'});
   req.once('connect',(res,socket)=>{socket.destroy();resolve(res.statusCode);});req.once('error',reject);req.end();
  });assert.equal(connect,403);
  assert.deepEqual(proxy.stats,{httpRejected:1,connectRejected:1,forwarded:0});
 }finally{await proxy.close();}
});
