import {tickSkills} from './skills.js';
import {stepTank,delta} from './arena.js';
export class Multiplayer {
 constructor(api){this.api=api;this.actors=new Map();this.labels=new Map();this.shots=new Map();this.active=false;this.timer=0;this.socket=null;this.id=null;this.pending=false;this.hostId=null;this.paused=false;}
 join(name,room,map,skin){if(this.pending)return;this.leave();this.pending=true;const ws=this.socket=new WebSocket(`${location.protocol==='https:'?'wss:':'ws:'}//${location.host}`);let joined=false;
 const timeout=setTimeout(()=>{if(!joined&&this.socket===ws){this.api.status('Không kết nối được. Hãy chạy server bằng npm start.');this.leave();}},7000);
 ws.onopen=()=>ws.send(JSON.stringify({type:'join',name,room,map,skin}));
 ws.onmessage=e=>{let m;try{m=JSON.parse(e.data);}catch{return;}if(m.type==='error'){clearTimeout(timeout);this.api.status(m.message);this.leave();}
 if(m.type==='joined'){joined=true;clearTimeout(timeout);this.pending=false;this.id=m.id;this.active=true;this.room=m.room;this.map=m.map;this.hostId=m.hostId;this.paused=m.paused===true;this.api.begin(name,m.room,m.map);this.api.roomState?.(this.paused,this.isHost);}
 if(m.type==='state'&&this.active)this.snapshot(m);};
 ws.onclose=()=>{clearTimeout(timeout);if(this.socket!==ws)return;const wasActive=this.active;this.leave();this.api.status(wasActive?'Mất kết nối. Bạn có thể vào lại phòng.':'Không thể kết nối phòng chơi. Kiểm tra server npm start.');if(wasActive)this.api.disconnected();};ws.onerror=()=>{};
 }
 leave(){const ws=this.socket;this.socket=null;if(ws){ws.onclose=null;ws.close();}for(const a of this.actors.values())this.api.remove(a.root);for(const s of this.shots.values())this.api.remove(s.mesh);for(const label of this.labels.values())label.remove();this.actors.clear();this.shots.clear();this.labels.clear();this.active=false;this.pending=false;this.local=null;this.id=null;this.timer=0;this.props=null;this.hostId=null;this.paused=false;}
 get isHost(){return !!this.id&&this.id===this.hostId;}
 pause(paused){if(this.active&&this.isHost&&this.socket?.readyState===WebSocket.OPEN)this.socket.send(JSON.stringify({type:'pause',paused}));}
 useSkill(skill){if(this.active&&!this.paused&&this.socket?.readyState===WebSocket.OPEN)this.socket.send(JSON.stringify({type:'skill',skill}));}
 snapshot(m){const changed=this.hostId!==m.hostId||this.paused!==(m.paused===true);this.hostId=m.hostId;this.paused=m.paused===true;if(changed)this.api.roomState?.(this.paused,this.isHost);this.time=m.time;this.props=m.props;this.api.props(m.props);const ids=new Set();for(const p of m.players){ids.add(p.id);let a=this.actors.get(p.id);if(!a){a=p.id===this.id?this.api.player():this.api.tank(p.x,p.z,true,p.skin);this.actors.set(p.id,a);const label=document.createElement('div');label.className='tank-label';document.body.append(label);this.labels.set(p.id,label);}
 const old=a.net; a.net=p;a.hp=p.hp;for(const id of ['boost','armor']){a[id+'Remaining']=p[id+'Remaining']||0;a[id+'Cooldown']=p[id+'Cooldown']||0;}this.api.paint(a,p.skin);a.root.visible=p.hp>0;if(this.paused){a.root.position.set(p.x,0,p.z);a.angle=p.angle;a.aimAngle=p.aimAngle;a.root.rotation.y=p.angle;a.turret.rotation.y=p.aimAngle-p.angle;}this.labels.get(p.id).textContent=`${p.name} · ${p.hp}%`;
 if(p.id===this.id){if(!this.local||old?.hp<=0&&p.hp>0){this.local={...p};}else{const error=Math.hypot(this.local.x-p.x,this.local.z-p.z);if(error>4)Object.assign(this.local,p);else{this.local.x+=(p.x-this.local.x)*.3;this.local.z+=(p.z-this.local.z)*.3;this.local.angle+=delta(this.local.angle,p.angle)*.2;}this.local.hp=p.hp;this.local.score=p.score;this.local.ammo=p.ammo;this.local.reloadRemaining=p.reloadRemaining;this.local.deaths=p.deaths;for(const id of ['boost','armor']){this.local[id+'Remaining']=p[id+'Remaining']||0;this.local[id+'Cooldown']=p[id+'Cooldown']||0;}}this.api.hud(p,m.players,this.room,p.hp<=0?Math.max(0,Math.ceil(p.respawnAt-m.time)):0);}
 }
 for(const [id,a] of this.actors)if(!ids.has(id)){if(id!==this.id)this.api.remove(a.root);this.actors.delete(id);this.labels.get(id)?.remove();this.labels.delete(id);}
 const shots=new Set();for(const s of m.shells){shots.add(s.id);let v=this.shots.get(s.id);if(!v){v=this.api.shell(s);this.shots.set(s.id,v);}v.net=s;}
 for(const [id,s] of this.shots)if(!shots.has(id)){this.api.remove(s.mesh);this.shots.delete(id);}
 for(const e of m.events){if(e.type==='propHit')this.api.propEffect(e);if(e.type==='shot')this.api.shotSound(e.owner===this.id);if(e.type==='impact'||e.type==='hit')this.api.effect(e.x,e.z,e.dead);}
 }
 update(dt,input){if(!this.active)return;this.timer+=dt;if(this.socket?.readyState===WebSocket.OPEN&&this.timer>=1/30){this.socket.send(JSON.stringify({type:'input',...input}));this.timer=0;}
 if(this.paused)return;
 for(const [id,a] of this.actors){if(id===this.id&&this.local){tickSkills(this.local,dt);if(this.local.hp>0)stepTank(this.local,input,dt,[...this.actors.values()].filter(o=>o!==a).map(o=>o.net),this.map,this.props);a.root.position.set(this.local.x,0,this.local.z);a.angle=this.local.angle;a.aimAngle=this.local.aimAngle;a.hp=this.local.hp;}else{a.root.position.x+=(a.net.x-a.root.position.x)*(1-Math.exp(-14*dt));a.root.position.z+=(a.net.z-a.root.position.z)*(1-Math.exp(-14*dt));a.angle+=delta(a.angle,a.net.angle)*(1-Math.exp(-14*dt));a.aimAngle+=delta(a.aimAngle,a.net.aimAngle)*(1-Math.exp(-16*dt));}a.root.rotation.y=a.angle;a.turret.rotation.y=a.aimAngle-a.angle;}
 for(const s of this.shots.values()){s.mesh.position.x+=(s.net.x-s.mesh.position.x)*(1-Math.exp(-25*dt));s.mesh.position.z+=(s.net.z-s.mesh.position.z)*(1-Math.exp(-25*dt));}
 }
 project(camera,width,height,Vector3){if(!this.active)return;for(const [id,a] of this.actors){const p=new Vector3(a.root.position.x,2.4,a.root.position.z).project(camera),label=this.labels.get(id);label.style.display=a.root.visible&&p.z<1?'block':'none';label.style.left=(p.x*.5+.5)*width+'px';label.style.top=(-p.y*.5+.5)*height+'px';}}
}
