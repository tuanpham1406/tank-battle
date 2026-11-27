import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.js';
import {Environment} from '../environment.js';
import {createProps,damageProp} from '../arena.js';
import {maps} from '../maps.js';

test('tree damage changes foliage and leans, then falls to cosmetic stump without a health label',()=>{
 const env=new Environment(new THREE.Scene());env.set('forest');const props=createProps('forest'),o=maps.forest.obstacles.find(o=>o.kind==='tree'),v=env.props.get(o.id),initial=v.leafMaterial.color.getHex();damageProp('forest',props,o.id);env.applyProps(props);assert.notEqual(v.leafMaterial.color.getHex(),initial);assert.ok(v.cracks.some(c=>c.visible));damageProp('forest',props,o.id);env.applyProps(props);assert.equal(v.branches[2].visible,false);assert.ok(v.live.rotation.z>.05);damageProp('forest',props,o.id);env.applyProps(props);env.update(1);assert.equal(v.live.visible,false);assert.equal(v.rubble.visible,true);env.set('forest');assert.equal(env.props.get(o.id).live.visible,true);env.clear();
});
test('rocks crack in stages, rubble remains, and surface traces do not depend on weather',()=>{
 const env=new Environment(new THREE.Scene());env.set('alpine');const props=createProps('alpine'),o=maps.alpine.obstacles.find(o=>o.kind==='rock'),v=env.props.get(o.id);for(let i=0;i<3;i++)damageProp('alpine',props,o.id);env.applyProps(props);assert.ok(v.live.scale.x<1);assert.ok(v.cracks.some(c=>c.visible));for(let i=0;i<2;i++)damageProp('alpine',props,o.id);env.applyProps(props);assert.equal(v.live.visible,false);assert.equal(v.rubble.visible,true);env.toggle(false);env.trace(0,10,'snow');env.update(.1);assert.ok(env.ripples[0].mesh.scale.x>1);env.update(1);assert.equal(env.ripples.length,0);env.clear();
});

import {Multiplayer} from '../multiplayer.js';
test('client prediction retains destruction state when sending input and passes a destroyed tree',()=>{
 const net=new Multiplayer({}),props=createProps('forest');props[6].hp=0;net.active=true;net.id='local';net.map='forest';net.props=props;net.local={x:0,z:23,angle:0,aimAngle:0,hp:100};net.socket={readyState:1,send(){}};const root=new THREE.Group(),turret=new THREE.Group();net.actors.set('local',{root,turret,net:{hp:100}});for(let i=0;i<40;i++)net.update(.04,{drive:1,turn:0,aim:0,fire:false});assert.equal(net.props,props);assert.ok(net.local.z>26);});

test('irregular visible shoreline and authoritative slow zone share the same boundary',async()=>{
 const {zoneOutline,pointInZone}=await import('../maps.js'),{terrainAt}=await import('../arena.js'),{createZoneSurface}=await import('../zone-surfaces.js');
 for(const map of Object.values(maps))for(const zone of map.zones){
  const outline=zoneOutline(zone),visual=createZoneSurface(zone),positions=visual.root.children[0].geometry.attributes.position;
  assert.deepEqual(outline,zoneOutline(zone));assert.equal(pointInZone(zone.x,zone.z,zone),true);
  const radii=outline.map(p=>Math.hypot((p.x-zone.x)/zone.rx,(p.z-zone.z)/zone.rz));assert.ok(Math.max(...radii)-Math.min(...radii)>.15);
  outline.forEach((p,i)=>{assert.ok(Math.abs(positions.getX(i+1)-p.x)<.00001);assert.ok(Math.abs(positions.getZ(i+1)-p.z)<.00001);const inside={x:zone.x+(p.x-zone.x)*.99,z:zone.z+(p.z-zone.z)*.99},outside={x:zone.x+(p.x-zone.x)*1.01,z:zone.z+(p.z-zone.z)*1.01};assert.equal(terrainAt(inside.x,inside.z,map.id).kind,zone.kind);assert.equal(terrainAt(outside.x,outside.z,map.id).kind,'ground');});
  visual.root.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});
 }
});
