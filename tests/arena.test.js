import test from 'node:test';
import assert from 'node:assert/strict';
import {newRoom,newPlayer,tickRoom,stepTank} from '../arena.js';
test('movement accelerates and stops without entering cover',()=>{const p={x:0,z:0,angle:0,aimAngle:0,hp:100};stepTank(p,{drive:1,turn:0,aim:0},1/60);assert.ok(p.speed>0&&p.speed<8);for(let i=0;i<600;i++)stepTank(p,{drive:1,turn:0,aim:0},1/60);assert.ok(p.z<=42.051);for(let i=0;i<60;i++)stepTank(p,{drive:0,turn:0,aim:0},1/60);assert.ok(Math.abs(p.speed)<.01);});
test('server resolves hits, score and respawn; stale input cannot keep firing',()=>{const r=newRoom(),a=newPlayer('a','A',r);r.players.set(a.id,a);const b=newPlayer('b','B',r);r.players.set(b.id,b);Object.assign(a,{x:0,z:0,shieldUntil:0});Object.assign(b,{x:0,z:8,shieldUntil:0});for(let i=0;i<150;i++){a.lastInput=r.time;a.input={drive:0,turn:0,aim:0,fire:true};tickRoom(r,1/60);}assert.equal(b.hp,0);assert.equal(a.score,100);a.input.fire=false;for(let i=0;i<240;i++)tickRoom(r,1/60);assert.equal(b.hp,100);assert.ok(b.shieldUntil>r.time-2);const previous=r.nextShot;for(let i=0;i<60;i++)tickRoom(r,1/60);assert.equal(r.nextShot,previous);});
test('cover blocks damage',()=>{const r=newRoom(),a=newPlayer('a','A',r),b=newPlayer('b','B',r);r.players.set('a',a);r.players.set('b',b);Object.assign(a,{x:-10,z:-14,shieldUntil:0});Object.assign(b,{x:-10,z:-3,shieldUntil:0});for(let i=0;i<120;i++){a.lastInput=r.time;a.input={drive:0,turn:0,aim:0,fire:true};tickRoom(r,1/60);}assert.equal(b.hp,100);});

import {maps,skins} from '../maps.js';
import {blocked,spawn} from '../arena.js';
test('all maps have larger bounds, safe spawns and matching collision',()=>{for(const map of Object.values(maps)){assert.ok(map.half>=44);const players=[];for(let i=0;i<8;i++){const p=spawn(players,map.id);assert.equal(blocked(p.x,p.z,1.3,map.id),false);assert.ok(players.every(o=>Math.hypot(o.x-p.x,o.z-p.z)>2.35));players.push({...p,hp:100});}assert.equal(blocked(map.half,0,1.3,map.id),true);for(const o of map.obstacles)assert.equal(blocked(o.x,o.z,.1,map.id),true);}});
test('room selects one authoritative map and validates skins',()=>{const room=newRoom('forest');assert.equal(room.map,'forest');const p=newPlayer('1','Player',room,'navy');assert.equal(p.skin,'navy');assert.ok(skins[p.skin]);assert.equal(newPlayer('2','Other',room,'unknown').skin,'olive');assert.equal(newRoom('unknown').map,'desert');assert.equal(newRoom('__proto__').map,'desert');assert.equal(newPlayer('3','Other',room,'__proto__').skin,'olive');});

import {createProps,damageProp,obstacleAt,terrainAt} from '../arena.js';
test('water, mud and snow slow movement consistently; leaving restores normal speed',()=>{
 for(const mapId of Object.keys(maps)){const map=maps[mapId];for(const zone of map.zones){const surface=terrainAt(zone.x,zone.z,mapId);assert.ok(surface.speed<1);const dry={x:0,z:0,angle:Math.PI/2,aimAngle:0},wet={x:zone.x,z:zone.z,angle:Math.PI/2,aimAngle:0};for(let i=0;i<20;i++){stepTank(dry,{drive:1,turn:0,aim:0},1/60,[],mapId);stepTank(wet,{drive:1,turn:0,aim:0},1/60,[],mapId);}assert.ok(wet.speed<dry.speed*.8);wet.x=0;wet.z=0;for(let i=0;i<10;i++)stepTank(wet,{drive:1,turn:0,aim:0},1/60,[],mapId);assert.ok(wet.speed>surface.speed*5);}}
 assert.equal(terrainAt(0,0,'forest').speed,1);
});
test('hidden prop health progresses to destruction, opening collision, and resets per room',()=>{
 for(const kind of ['tree','rock']){const map=maps.forest,o=map.obstacles.find(o=>o.kind===kind),props=createProps('forest');assert.equal(obstacleAt(o.x,o.z,.1,'forest',props)?.id,o.id);const hp=[];for(let i=0;i<o.maxHp/25;i++){const e=damageProp('forest',props,o.id);hp.push(e.hp);assert.equal(e.dead,e.hp===0);}assert.equal(hp.at(-1),0);assert.equal(obstacleAt(o.x,o.z,.1,'forest',props),undefined);assert.equal(damageProp('forest',props,o.id),null);assert.equal(createProps('forest')[o.id].hp,o.maxHp);}
 const props=createProps('desert');assert.equal(damageProp('desert',props,0),null);assert.equal(blocked(-10,-8,.1,'desert',props),true);
});
test('server bullets damage props once, remove obstruction, and keep room damage isolated',()=>{
 const r=newRoom('forest'),other=newRoom('forest'),tree=maps.forest.obstacles.find(o=>o.kind==='tree');const p=newPlayer('shooter','Player',r);Object.assign(p,{x:tree.x,z:tree.z-5,angle:0,aimAngle:0});r.players.set(p.id,p);const events=[];for(let i=0;i<75;i++){p.lastInput=r.time;p.input={drive:0,turn:0,aim:0,fire:true};events.push(...tickRoom(r,1/60));}assert.equal(r.props[tree.id].hp,0);assert.equal(events.filter(e=>e.type==='propHit'&&e.id===tree.id).length,3);assert.equal(events.filter(e=>e.type==='propHit'&&e.id===tree.id&&e.dead).length,1);assert.equal(other.props[tree.id].hp,75);
});
