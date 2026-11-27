// Shared collision and movement rules for server authority and local prediction.
export const cover=[[-10,-8,6,3],[10,8,6,3],[-10,9,3,5],[11,-10,3,6],[-19,0,3,3],[19,1,3,3]];
export const delta=(a,b)=>Math.atan2(Math.sin(b-a),Math.cos(b-a));
export const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export function blocked(x,z,r=1.3){return Math.abs(x)>26||Math.abs(z)>26||cover.some(([cx,cz,w,d])=>Math.abs(x-cx)<w/2+r&&Math.abs(z-cz)<d/2+r);}
export function stepTank(p,input,dt,others=[]){
 const drive=clamp(input.drive||0,-1,1),turn=clamp(input.turn||0,-1,1);
 p.speed??=0;p.steer??=0;
 p.speed+=(drive*8-p.speed)*(1-Math.exp(-9*dt));
 p.steer+=(turn*2.1-p.steer)*(1-Math.exp(-12*dt));p.angle+=p.steer*dt;
 p.aimAngle+=clamp(delta(p.aimAngle,input.aim),-5*dt,5*dt);
 const x=p.x+Math.sin(p.angle)*p.speed*dt,z=p.z+Math.cos(p.angle)*p.speed*dt;
 if(!blocked(x,z)&&!others.some(o=>o!==p&&o.hp>0&&Math.hypot(x-o.x,z-o.z)<2.35)){p.x=x;p.z=z;}else p.speed=0;
}
const spawnPoints=[[0,-21],[0,21],[-21,-20],[21,20],[-21,20],[21,-20],[-5,0],[5,0]];
export function spawn(players){return spawnPoints.reduce((best,p)=>{const distance=players.length?Math.min(...players.map(o=>Math.hypot(o.x-p[0],o.z-p[1]))):100;return distance>best.distance?{x:p[0],z:p[1],distance}:best;},{x:0,z:0,distance:-1});}
export function tickRoom(room,dt){
 room.time+=dt;const events=[];const all=[...room.players.values()];
 for(const p of all){
  if(p.hp<=0){if(room.time>=p.respawnAt){Object.assign(p,spawn(all.filter(o=>o!==p&&o.hp>0)),{hp:100,speed:0,steer:0,shieldUntil:room.time+2});events.push({type:'respawn',id:p.id});}else continue;}
  p.cd=Math.max(0,p.cd-dt);const input=room.time-p.lastInput<.3?p.input:{drive:0,turn:0,aim:p.aimAngle,fire:false};
  stepTank(p,input,dt,all);
  if(input.fire&&p.cd<=0){p.cd=.3;const dir={x:Math.sin(p.aimAngle),z:Math.cos(p.aimAngle)};const shot={id:++room.nextShot,owner:p.id,x:p.x+dir.x*2.3,z:p.z+dir.z*2.3,dx:dir.x,dz:dir.z,life:2};room.shells.push(shot);events.push({type:'shot',...shot});}
 }
 for(let i=room.shells.length-1;i>=0;i--){const s=room.shells[i];s.life-=dt;let spent=s.life<=0;
  for(let j=0;j<3&&!spent;j++){s.x+=s.dx*30*dt/3;s.z+=s.dz*30*dt/3;
   if(blocked(s.x,s.z,.1)){spent=true;break;}
   const target=all.find(p=>p.id!==s.owner&&p.hp>0&&Math.hypot(p.x-s.x,p.z-s.z)<1.25);
   if(target){spent=true;if(room.time>=target.shieldUntil){target.hp=Math.max(0,target.hp-25);events.push({type:'hit',id:target.id,x:target.x,z:target.z,dead:target.hp===0});if(target.hp===0){target.respawnAt=room.time+3;target.deaths++;const owner=room.players.get(s.owner);if(owner)owner.score+=100;}}}
  }
  if(spent){events.push({type:'impact',x:s.x,z:s.z});room.shells.splice(i,1);}
 }return events;
}
export function newRoom(){return {players:new Map(),shells:[],time:0,nextShot:0};}
export function newPlayer(id,name,room){return {id,name,...spawn([...room.players.values()].filter(p=>p.hp>0)),angle:0,aimAngle:0,hp:100,score:0,deaths:0,cd:0,respawnAt:0,shieldUntil:room.time+2,speed:0,steer:0,lastInput:room.time,input:{drive:0,turn:0,aim:0,fire:false}};}
