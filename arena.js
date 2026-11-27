import {combat,tickWeapon,consumeRound,initWeapon,shellStep,beginReload,livesLeft} from './combat.js';
import {tickSkills,skillDamage} from './skills.js';
import {obstaclePolygon,circleTouches,contact,moveTank} from './collision.js';
import {getMap,getSkin,surfaces,pointInZone} from './maps.js';
// Shared collision and movement rules for server authority and local prediction.
export const cover=[[-10,-8,6,3],[10,8,6,3],[-10,9,3,5],[11,-10,3,6],[-19,0,3,3],[19,1,3,3]];
export const delta=(a,b)=>Math.atan2(Math.sin(b-a),Math.cos(b-a));
export const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export function createProps(mapId){return getMap(mapId).obstacles.map(o=>({id:o.id,hp:o.maxHp,maxHp:o.maxHp}));}
export function obstacleAt(x,z,r=.1,mapId='desert',props=null,low=1.18,high=low){return getMap(mapId).obstacles.find(o=>circleTouches(obstaclePolygon(o,props?.[o.id],low,high),x,z,r));}
export function terrainAt(x,z,mapId='desert'){const zone=getMap(mapId).zones.find(o=>pointInZone(x,z,o));return zone?{kind:zone.kind,...surfaces[zone.kind]}:{kind:'ground',name:'Đường khô',speed:1,turn:1};}
export function damageProp(mapId,props,id,amount=25){const o=getMap(mapId).obstacles[id],p=props[id];if(!o||!o.maxHp||!p||p.hp<=0)return null;const damage=Number.isFinite(amount)?Math.max(0,amount):0;if(!damage)return null;p.hp=Math.max(0,p.hp-damage);return {type:'propHit',id,kind:o.kind,x:o.x,z:o.z,hp:p.hp,maxHp:p.maxHp,dead:p.hp===0};}
export function blocked(x,z,r=1.3,mapId='desert',props=null){const m=getMap(mapId);return Math.abs(x)+r>m.half-.5||Math.abs(z)+r>m.half-.5||!!obstacleAt(x,z,r,mapId,props,0,1.75);}
export function stepTank(p,input,dt,others=[],mapId='desert',props=null){
 const drive=clamp(input.drive||0,-1,1),turn=clamp(input.turn||0,-1,1);
 p.speed??=0;p.steer??=0;
 const surface=terrainAt(p.x,p.z,mapId);p.surface=surface.kind;
 p.speed+=(drive*8*surface.speed*((p.boostRemaining||0)>0?1.6:1)-p.speed)*(1-Math.exp(-9*dt));
 p.steer+=(turn*2.1*surface.turn-p.steer)*(1-Math.exp(-12*dt));const map=getMap(mapId),previousAngle=p.angle;p.angle+=p.steer*dt;if(contact(p,map,props,others)){p.angle=previousAngle;p.steer=0;}
 p.aimAngle+=clamp(delta(p.aimAngle,input.aim),-5*dt,5*dt);
 const moved=moveTank(p,p.speed*dt,map,props,others);if(moved<Math.abs(p.speed*dt)*.1)p.speed=0;
}
export function spawn(players,mapId='desert',props=null){const edge=getMap(mapId).half-6;const points=[[0,-edge],[0,edge],[-edge,-edge],[edge,edge],[-edge,edge],[edge,-edge],[-5,0],[5,0]].filter(([x,z])=>!blocked(x,z,1.9,mapId,props));return points.reduce((best,p)=>{const distance=players.length?Math.min(...players.map(o=>Math.hypot(o.x-p[0],o.z-p[1]))):100;return distance>best.distance?{x:p[0],z:p[1],distance}:best;},{x:0,z:0,distance:-1});}
export function tickRoom(room,dt){
 if(room.paused)return [];room.time+=dt;const events=[];const all=[...room.players.values()];
 for(const p of all){
  if(p.hp<=0){if(livesLeft(p)===0)continue;if(room.time>=p.respawnAt){Object.assign(p,spawn(all.filter(o=>o!==p&&o.hp>0),room.map,room.props),{hp:100,speed:0,steer:0,boostRemaining:0,armorRemaining:0,shieldUntil:room.time+2});initWeapon(p);events.push({type:'respawn',id:p.id});}else continue;}
  tickSkills(p,dt);tickWeapon(p,dt);p.cd=Math.max(0,p.cd-dt);const input=room.time-p.lastInput<.3?p.input:{drive:0,turn:0,aim:p.aimAngle,fire:false};
  if(input.reload)beginReload(p);stepTank(p,input,dt,all,room.map,room.props);
  if(input.fire&&p.cd<=0&&consumeRound(p)){p.cd=.3;const dir={x:Math.sin(p.aimAngle),z:Math.cos(p.aimAngle)};const shot={id:++room.nextShot,owner:p.id,x:p.x+dir.x*2.3,z:p.z+dir.z*2.3,dx:dir.x,dz:dir.z,life:combat.range/combat.shellSpeed,travelled:0};room.shells.push(shot);events.push({type:'shot',...shot});}
 }
 for(let i=room.shells.length-1;i>=0;i--){const s=room.shells[i];s.life-=dt;let spent=false;
  for(let j=0;j<3&&!spent;j++){const distance=shellStep(s,dt/3);s.x+=s.dx*distance;s.z+=s.dz*distance;
   if(s.travelled>=combat.range){spent=true;break;}const obstacle=obstacleAt(s.x,s.z,.1,room.map,room.props);if(obstacle){const event=damageProp(room.map,room.props,obstacle.id);if(event)events.push(event);spent=true;break;}if(Math.abs(s.x)>getMap(room.map).half-.6||Math.abs(s.z)>getMap(room.map).half-.6){spent=true;break;}
   const target=all.find(p=>p.id!==s.owner&&p.hp>0&&Math.hypot(p.x-s.x,p.z-s.z)<1.25);
   if(target){spent=true;if(room.time>=target.shieldUntil){target.hp=Math.max(0,target.hp-skillDamage(target,25));events.push({type:'hit',id:target.id,x:target.x,z:target.z,dead:target.hp===0});if(target.hp===0){target.respawnAt=room.time+3;target.deaths++;const owner=room.players.get(s.owner);if(owner)owner.score+=100;}}}
  }
  if(s.life<=0)spent=true;if(spent){events.push({type:'impact',x:s.x,z:s.z});room.shells.splice(i,1);}
 }return events;
}
export function newRoom(mapId='desert'){return {map:getMap(mapId).id,props:createProps(mapId),hostId:null,paused:false,players:new Map(),shells:[],time:0,nextShot:0};}
export function newPlayer(id,name,room,skin='olive'){return {id,name,skin:getSkin(skin),...spawn([...room.players.values()].filter(p=>p.hp>0),room.map,room.props),angle:0,aimAngle:0,hp:100,score:0,deaths:0,ammo:combat.magazine,reloadRemaining:0,cd:0,respawnAt:0,shieldUntil:room.time+2,speed:0,steer:0,lastInput:room.time,input:{drive:0,turn:0,aim:0,fire:false}};}

export function roomHost(room){if(!room.players.has(room.hostId))room.hostId=room.players.keys().next().value??null;return room.hostId;}
export function pauseRoom(room,playerId,paused){if(!room.players.has(playerId)||roomHost(room)!==playerId||typeof paused!=='boolean')return false;if(room.paused===paused)return true;room.paused=paused;for(const p of room.players.values()){p.input={drive:0,turn:0,aim:p.aimAngle,fire:false,reload:false};p.lastInput=-Infinity;}return true;}
