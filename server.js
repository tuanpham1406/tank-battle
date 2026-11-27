import {activateSkill} from './skills.js';
import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {randomUUID} from 'node:crypto';
import {WebSocketServer,WebSocket} from 'ws';
import {newRoom,newPlayer,tickRoom} from './arena.js';
const root=path.dirname(fileURLToPath(import.meta.url)),rooms=new Map();
const allowed=new Set(['index.html','game.js','multiplayer.js','arena.js','skills.js','skill-effects.js','maps.js','environment.js','zone-surfaces.js','icons.js','collision.js','tank-model.js','tank-preview.js','minimap.js','map-previews.js','favicon.svg','style.css','vendor/three.module.js','vendor/LICENSE-three.txt']);
const server=http.createServer(async(req,res)=>{try{const file=decodeURIComponent(new URL(req.url,'http://localhost').pathname).slice(1)||'index.html';if(!allowed.has(file)){res.writeHead(404);res.end();return;}const data=await readFile(path.join(root,file));res.writeHead(200,{'Content-Type':file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':file.endsWith('.html')?'text/html; charset=utf-8':file.endsWith('.svg')?'image/svg+xml':'text/plain','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; connect-src 'self'; img-src 'self' data:; object-src 'none'; frame-ancestors 'none'"});res.end(data);}catch{res.writeHead(400);res.end();}});
const wss=new WebSocketServer({server,maxPayload:2048,maxFragments:128,maxBufferedChunks:128});
function send(ws,value){if(ws.readyState===WebSocket.OPEN&&ws.bufferedAmount<128000)ws.send(JSON.stringify(value));}
wss.on('connection',(ws,req)=>{
 if(req.headers.origin){try{if(new URL(req.headers.origin).host!==req.headers.host){ws.close(1008,'Origin rejected');return;}}catch{ws.close(1008);return;}}
 let room,player,messages=0;let windowStart=Date.now();ws.alive=true;ws.on('pong',()=>ws.alive=true);
 ws.on('message',buffer=>{if(Date.now()-windowStart>1000){messages=0;windowStart=Date.now();}if(++messages>100){ws.close(1008,'Rate limit');return;}
  let m;try{m=JSON.parse(buffer);}catch{return;}
  if(m?.type==='join'&&!player){const code=String(m.room||'').trim().toUpperCase();const name=String(m.name||'').trim().slice(0,24);if(!/^[A-Z0-9-]{1,16}$/.test(code)||!name){send(ws,{type:'error',message:'Nhập tên và mã phòng (chữ, số hoặc dấu -).'});return;}if(!rooms.has(code)&&rooms.size>=50){send(ws,{type:'error',message:'Server đã đầy.'});return;}room=rooms.get(code)||newRoom(m.map);rooms.set(code,room);if(room.players.size>=8){send(ws,{type:'error',message:'Phòng đã đủ 8 người.'});return;}player=newPlayer(randomUUID(),name,room,m.skin);player.ws=ws;room.players.set(player.id,player);send(ws,{type:'joined',id:player.id,room:code,map:room.map});}
  else if(m?.type==='skill'&&player){activateSkill(player,m.skill);}
  else if(m?.type==='input'&&player&&Number.isFinite(m.drive)&&Number.isFinite(m.turn)&&Number.isFinite(m.aim)){player.input={drive:Math.max(-1,Math.min(1,m.drive)),turn:Math.max(-1,Math.min(1,m.turn)),aim:Math.atan2(Math.sin(m.aim),Math.cos(m.aim)),fire:m.fire===true};player.lastInput=room.time;}
 });
 ws.on('error',()=>{});ws.on('close',()=>{if(!room||!player)return;room.players.delete(player.id);if(!room.players.size)for(const [code,r] of rooms)if(r===room)rooms.delete(code);});
});
setInterval(()=>{for(const room of rooms.values()){const events=tickRoom(room,1/60);room.events??=[];room.events.push(...events);}},1000/60);
setInterval(()=>{for(const room of rooms.values()){const snapshot={type:'state',map:room.map,props:room.props,time:room.time,players:[...room.players.values()].map(({ws,input,lastInput,cd,...p})=>p),shells:room.shells,events:room.events||[]};room.events=[];for(const p of room.players.values())send(p.ws,snapshot);}},1000/20);
setInterval(()=>{for(const ws of wss.clients){if(!ws.alive){ws.terminate();continue;}ws.alive=false;ws.ping();}},15000).unref();
server.listen(Number(process.env.PORT)||5280,process.env.HOST||'127.0.0.1',()=>console.log(`Tank server: http://${process.env.HOST||'127.0.0.1'}:${process.env.PORT||5280}`));
