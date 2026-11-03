import { createServer } from 'node:http';

/** Reject outbound HTTP/HTTPS in local browser fixtures; never forward a request. */
export async function createDeniedOutboundProxy(port=4194) {
 const stats={httpRejected:0,connectRejected:0,forwarded:0};
 const sockets=new Set();
 const server=createServer((_request,response)=>{
  ++stats.httpRejected;
  response.writeHead(403,{'Content-Type':'text/plain','Connection':'close'});
  response.end('External network is disabled in synthetic tests.');
 });
 server.on('connect',(_request,socket)=>{
  ++stats.connectRejected;
  socket.end('HTTP/1.1 403 Forbidden\r\nConnection: close\r\nContent-Length: 0\r\n\r\n');
 });
 server.on('connection',socket=>{sockets.add(socket);socket.once('close',()=>sockets.delete(socket));});
 await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(port,'127.0.0.1',()=>{server.removeListener('error',reject);resolve();});});
 return {port:server.address().port,stats,
  close:async()=>{for(const socket of sockets)socket.destroy();await new Promise((resolve,reject)=>server.close(error=>error?reject(error):resolve()));}};
}
