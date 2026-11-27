import test from 'node:test';
import assert from 'node:assert/strict';
import Sender from '../node_modules/ws/lib/sender.js';
import Receiver from '../node_modules/ws/lib/receiver.js';

test('patched close encoder rejects unsafe typed arrays and preserves normal close reasons',()=>{
 const writes=[],socket={cork(){},uncork(){},write(buffer,callback){writes.push(Buffer.from(buffer));callback?.();}},sender=new Sender(socket);
 assert.throws(()=>sender.close(1000,new Float32Array(20),false),TypeError);
 sender.close(1000,'left room',false);const frame=Buffer.concat(writes);assert.equal(frame[0],0x88);assert.equal(frame.readUInt16BE(2),1000);assert.equal(frame.subarray(4).toString(),'left room');
});
test('excessive tiny fragments are rejected before exhausting memory',async()=>{
 const receiver=new Receiver({isServer:true,maxPayload:2048,maxFragments:128,maxBufferedChunks:128});const frames=[];for(let i=0;i<129;i++)frames.push(Buffer.from([i===0?0x01:0x00,0x81,0,0,0,0,0x61]));const error=await new Promise(resolve=>{receiver.once('error',resolve);receiver.end(Buffer.concat(frames));});assert.equal(error.code,'WS_ERR_TOO_MANY_BUFFERED_PARTS');assert.ok(error.message.includes('fragments'));
});
