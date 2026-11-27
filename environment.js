import {appearance,rockShape} from './collision.js';
import * as THREE from './vendor/three.module.js';
import {getMap,surfaces} from './maps.js';

export class Environment {
 constructor(scene){this.scene=scene;this.group=null;this.weather=null;this.elapsed=0;this.enabled=true;this.props=new Map();this.ripples=[];}
 clear(){if(!this.group)return;this.scene.remove(this.group);const geometries=new Set(),materials=new Set();this.group.traverse(o=>{if(o.geometry)geometries.add(o.geometry);if(o.material)materials.add(o.material);});geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());this.traceGeometry?.dispose();this.props.clear();this.ripples=[];}
 set(id){this.clear();this.map=getMap(id);const m=this.map;this.group=new THREE.Group();this.group.name='Map: '+m.name;this.scene.add(this.group);this.scene.background=new THREE.Color(m.sky);this.scene.fog=new THREE.Fog(m.fog,m.half*.9,m.half*3.2);
 const material=color=>new THREE.MeshStandardMaterial({color,roughness:.95});const soil=material(m.ground),stone=material(m.rock),leaf=material(m.leaf),trunk=material(0x675443),snow=material(0xe5eded),dark=material(0x454d44);
 const cube=new THREE.BoxGeometry(1,1,1),rock=new THREE.IcosahedronGeometry(1,0),cone=new THREE.ConeGeometry(1,1,7);
 const mesh=(geometry,paint,x,y,z,sx,sy,sz,parent=this.group)=>{const o=new THREE.Mesh(geometry,paint);o.position.set(x,y,z);o.scale.set(sx,sy,sz);o.castShadow=o.receiveShadow=true;parent.add(o);return o;};
 mesh(cube,soil,0,-.4,0,m.half*5,.8,m.half*5);
 // Flat ellipses define real slow zones; their boundary matches the shared simulation.
 for(const zone of m.zones){const water=zone.kind==='water';const surface=new THREE.MeshStandardMaterial({color:surfaces[zone.kind].color,roughness:water?.22:1,metalness:water?.18:0,transparent:water,opacity:water?.88:1});const patch=new THREE.Mesh(new THREE.CircleGeometry(1,48),surface);patch.rotation.x=-Math.PI/2;patch.scale.set(zone.rx,zone.rz,1);patch.position.set(zone.x,.025,zone.z);patch.receiveShadow=true;this.group.add(patch);const ring=new THREE.Mesh(new THREE.RingGeometry(.97,1,48),new THREE.MeshBasicMaterial({color:water?0xb3d5cf:0xa2b3b4,transparent:true,opacity:.45,side:THREE.DoubleSide}));ring.rotation.x=-Math.PI/2;ring.scale.set(zone.rx,zone.rz,1);ring.position.copy(patch.position);ring.position.y=.03;this.group.add(ring);}
 for(const o of m.obstacles){
  const root=new THREE.Group();root.position.set(o.x,0,o.z);this.group.add(root);
  if(o.kind==='wall'){mesh(cube,stone,0,o.h/2,0,o.w,o.h,o.d,root);mesh(cube,soil,0,o.h+.08,0,o.w+.15,.16,o.d+.15,root);continue;}
  const live=new THREE.Group();root.add(live);const bodyMaterial=material(o.kind==='tree'?0x675443:m.rock);const leafMaterial=material(m.leaf);const branches=[];
  if(o.kind==='tree'){mesh(cube,bodyMaterial,0,o.h*.35,0,o.w*.65,o.h*.7,o.d*.65,live);for(let i=0;i<3;i++)branches.push(mesh(cone,leafMaterial,0,o.h*.48+.9+i*1.1,0,2.7-i*.5,3.8,2.7-i*.5,live));}
  else {const shape=rockShape(o);const r=mesh(rock,bodyMaterial,0,shape.y,0,shape.sx,shape.sy,shape.sz,live);r.rotation.y=shape.angle;if(m.id==='alpine')mesh(cone,snow,0,o.h*.9,0,o.w*.4,o.h*.3,o.d*.4,live);}
  const cracks=[];for(let i=0;i<3;i++){const line=mesh(cube,dark,(i-1)*o.w*.2,o.h*(.3+i*.17),o.d*.48,.07,o.h*.55,.04,live);line.rotation.z=(i%2?1:-1)*.35;line.visible=false;cracks.push(line);}
  const rubble=new THREE.Group();root.add(rubble);rubble.visible=false;
  if(o.kind==='tree'){mesh(cube,trunk,0,.2,0,.7,.4,.7,rubble);const log=mesh(cube,trunk,.7,.25,0,2.2,.35,.4,rubble);log.rotation.y=.5;}
  else for(let i=0;i<5;i++){const bit=mesh(rock,stone,Math.sin(i*2.4)*o.w*.28,.2,Math.cos(i*2.4)*o.d*.28,.5,.35,.5,rubble);bit.rotation.y=i;}
  this.props.set(o.id,{root,live,rubble,bodyMaterial,leafMaterial,branches,cracks,obstacle:o,kind:o.kind,hp:o.maxHp,maxHp:o.maxHp,fall:0});
 }
 this.traceGeometry=new THREE.RingGeometry(.6,1,24);
 const edge=m.half;for(const [x,z,w,d] of [[0,-edge,edge*2,1],[0,edge,edge*2,1],[-edge,0,1,edge*2],[edge,0,1,edge*2]])mesh(cube,stone,x,.75,z,w,1.5,d);
 // Scenery beyond the playable boundary; kept separate from gameplay obstacles.
 for(let i=0;i<20;i++){const a=i/20*Math.PI*2,r=edge+10+(i%3)*6,h=m.id==='alpine'?12+i%5*3:m.id==='forest'?7+i%4:3+i%4;
 if(m.id==='forest'){mesh(cube,trunk,Math.sin(a)*r,h*.4,Math.cos(a)*r,.7,h*.8,.7);mesh(cone,leaf,Math.sin(a)*r,h*.8,Math.cos(a)*r,4,h,4);}else{mesh(cone,stone,Math.sin(a)*r,h*.4,Math.cos(a)*r,10,h,10);if(m.id==='alpine')mesh(cone,snow,Math.sin(a)*r,h*.82,Math.cos(a)*r,3,h*.3,3);}}
 for(let i=0;i<32;i++){const x=Math.sin(i*17.31)*(edge-3),z=Math.cos(i*11.73)*(edge-3);mesh(rock,stone,x,.12,z,.15+(i%3)*.1,.2,.2);}
 const count=200,positions=new Float32Array(count*3);for(let i=0;i<count;i++){positions[i*3]=Math.sin(i*9.1)*edge;positions[i*3+1]=(i*.97)%22;positions[i*3+2]=Math.cos(i*5.3)*edge;}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(positions,3));const paint=new THREE.PointsMaterial({color:m.weather==='dust'?0xf6d6a2:0xe6f3ff,size:m.weather==='rain'?.07:m.weather==='snow'?.16:.12,transparent:true,opacity:m.weather==='dust'?.32:.65,depthWrite:false});this.weather=new THREE.Points(g,paint);this.weather.frustumCulled=false;this.group.add(this.weather);this.weather.visible=this.enabled;
 }
 applyProps(state){if(!state)return;for(const p of state){const visual=this.props.get(p.id);if(!visual||visual.hp===p.hp)continue;const previous=visual.hp;visual.hp=p.hp;const look=appearance(visual.obstacle,p),stage=look.stage;
 visual.cracks.forEach((line,i)=>line.visible=i<stage);visual.bodyMaterial.color.setHex(visual.kind==='tree'?(stage===2?0x3c3429:stage===1?0x51402f:0x675443):this.map.rock).multiplyScalar(visual.kind==='rock'?1-stage*.14:1);
 if(visual.kind==='tree'){visual.leafMaterial.color.setHex(stage===2?0x746444:stage===1?0x607047:this.map.leaf);visual.branches.forEach((branch,i)=>branch.visible=stage<2||i!==2);visual.live.rotation.z=look.lean;}
 else visual.live.scale.setScalar(look.scale);
 visual.rubble.visible=p.hp===0;if(p.hp===0){if(visual.kind==='tree'&&previous>0){visual.fall=.001;}else visual.live.visible=false;}
 }}
 impact(id){const prop=this.props.get(id);if(prop)prop.flash=.15;}
 trace(x,z,kind){if(kind==='ground'||this.ripples.length>18)return;const material=new THREE.MeshBasicMaterial({color:kind==='water'?0xc1e9ee:kind==='snow'?0xffffff:0xa18c69,transparent:true,opacity:.55,depthWrite:false,side:THREE.DoubleSide});const mesh=new THREE.Mesh(this.traceGeometry,material);mesh.rotation.x=-Math.PI/2;mesh.position.set(x,.065,z);this.group.add(mesh);this.ripples.push({mesh,life:.7});}
 update(dt){for(const prop of this.props.values()){prop.flash=Math.max(0,(prop.flash||0)-dt);prop.bodyMaterial.emissive.setHex(0xbd7640);prop.bodyMaterial.emissiveIntensity=prop.flash*2;}for(const prop of this.props.values())if(prop.fall>0){prop.fall+=dt;prop.live.rotation.z=Math.min(1.5,prop.fall*2);if(prop.fall>.8){prop.live.visible=false;prop.fall=0;}}
 for(let i=this.ripples.length-1;i>=0;i--){const r=this.ripples[i];r.life-=dt;r.mesh.scale.setScalar(1+(.7-r.life)*2);r.mesh.material.opacity=Math.max(0,r.life*.7);if(r.life<=0){this.group.remove(r.mesh);r.mesh.material.dispose();this.ripples.splice(i,1);}}
 if(!this.weather||!this.enabled)return;const p=this.weather.geometry.attributes.position,m=this.map;const speed=m.weather==='rain'?15:m.weather==='snow'?1.8:.35;for(let i=0;i<p.count;i++){p.array[i*3+1]-=dt*speed;if(p.array[i*3+1]<.1)p.array[i*3+1]=22;p.array[i*3]+=dt*(m.weather==='dust'?1.8:.4);if(p.array[i*3]>m.half)p.array[i*3]=-m.half;}p.needsUpdate=true;
 }
 toggle(enabled){this.enabled=enabled;if(this.weather)this.weather.visible=enabled;}
}
