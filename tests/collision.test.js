import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.js';
import {Environment} from '../environment.js';
import {maps} from '../maps.js';
import {createProps,stepTank} from '../arena.js';
import {obstaclePolygon,circleTouches,contact,moveTank,TANK_HALF_LENGTH,TANK_HALF_WIDTH} from '../collision.js';

test('projectile collision matches raycast against the rendered rock at all damage stages',()=>{
 for(const mapId of Object.keys(maps)){
  const scene=new THREE.Scene(),env=new Environment(scene);env.set(mapId);const props=createProps(mapId);
  for(const o of maps[mapId].obstacles.filter(o=>o.kind==='rock'))for(const hp of [o.maxHp,o.maxHp*.6,o.maxHp*.2]){
   props[o.id].hp=hp;env.applyProps(props);scene.updateMatrixWorld(true);const mesh=env.props.get(o.id).live.children[0],polygon=obstaclePolygon(o,props[o.id],1.18,1.18);
   for(const direction of [new THREE.Vector3(1,0,0),new THREE.Vector3(0,0,1)]){
    const origin=new THREE.Vector3(o.x,1.18,o.z).addScaledVector(direction,-20),hits=new THREE.Raycaster(origin,direction).intersectObject(mesh);assert.ok(hits.length>0);const p=hits[0].point;
    assert.equal(circleTouches(polygon,p.x+direction.x*.002,p.z+direction.z*.002),true,`${mapId} ${o.id} ${hp} inside`);
    assert.equal(circleTouches(polygon,p.x-direction.x*.002,p.z-direction.z*.002),false,`${mapId} ${o.id} ${hp} outside`);
   }
  }env.clear();
 }
});
test('tree blocks its visible trunk, not a large invisible square around the canopy',()=>{
 const tree=maps.forest.obstacles.find(o=>o.kind==='tree'),map={half:50,obstacles:[tree]},props=createProps('forest');assert.equal(contact({x:tree.x+1.9,z:tree.z,angle:0},map,props),null);assert.ok(contact({x:tree.x+1.5,z:tree.z,angle:0},map,props));
});
test('a tank glides along an obstacle edge while staying outside its solid geometry',()=>{
 const wall={id:0,x:0,z:0,w:4,d:6,h:2,kind:'wall',maxHp:0},map={half:50,obstacles:[wall]},p={x:3.75,z:-2,angle:-.2};for(let i=0;i<110;i++){moveTank(p,.08,map,[]);assert.equal(contact(p,map,[]),null);}assert.ok(p.z>4,`stalled at ${p.z}`);
});
test('rotation and movement keep the actual hull within walls and the arena boundary',()=>{
 const props=createProps('desert'),p={x:13.9,z:8,angle:0,aimAngle:0,hp:100};for(let i=0;i<120;i++){stepTank(p,{drive:0,turn:1,aim:0},1/60,[],'desert',props);assert.equal(contact(p,maps.desert,props),null);}const edge={x:0,z:41,angle:0,aimAngle:0,hp:100};for(let i=0;i<100;i++)stepTank(edge,{drive:1,turn:0,aim:0},1/60,[],'desert',props);assert.ok(edge.z+TANK_HALF_LENGTH<=maps.desert.half-.5+.00001);
});

import {tankModel} from '../tank-model.js';
test('the collision hull width includes the rendered tracks and wheels',()=>{
 const paint=new THREE.MeshStandardMaterial(),model=tankModel(paint,{track:paint,metal:paint,dark:paint});model.root.updateMatrixWorld(true);const bounds=new THREE.Box3().setFromObject(model.root);assert.ok(Math.abs(bounds.max.x-TANK_HALF_WIDTH)<1e-6);assert.ok(Math.abs(bounds.min.x+TANK_HALF_WIDTH)<1e-6);
 const geometries=new Set();model.root.traverse(o=>{if(o.geometry)geometries.add(o.geometry);});geometries.forEach(g=>g.dispose());paint.dispose();
});
