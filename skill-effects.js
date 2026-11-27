import * as THREE from './vendor/three.module.js';
export function updateSkillEffects(actor,dt){
 if(!actor.skillEffects){
  const root=new THREE.Group(),shield=new THREE.Group(),boost=new THREE.Group();root.name='skill-effects';shield.name='armor-shield';boost.name='boost-wind';
  const plate=new THREE.Mesh(new THREE.SphereGeometry(1,24,16),new THREE.MeshBasicMaterial({color:0x65d9ff,transparent:true,opacity:.15,depthWrite:false,side:THREE.DoubleSide}));plate.scale.set(1.85,1.5,2.05);plate.position.y=.9;shield.add(plate);
  const outline=new THREE.Mesh(new THREE.IcosahedronGeometry(1,1),new THREE.MeshBasicMaterial({color:0xa4efff,wireframe:true,transparent:true,opacity:.35,depthWrite:false}));outline.scale.copy(plate.scale);outline.position.copy(plate.position);shield.add(outline);
  const ring=new THREE.Mesh(new THREE.TorusGeometry(1.85,.045,6,48),new THREE.MeshBasicMaterial({color:0x9cecff,transparent:true,opacity:.6,depthWrite:false}));ring.rotation.x=Math.PI/2;ring.position.y=.18;shield.add(ring);
  for(let i=0;i<14;i++){const line=new THREE.Mesh(new THREE.SphereGeometry(1,5,4),new THREE.MeshBasicMaterial({color:i%3?0xdaf5ff:0xffe8b2,transparent:true,opacity:.6,depthWrite:false,blending:THREE.AdditiveBlending}));line.userData.phase=i/14;boost.add(line);}
  root.add(shield,boost);actor.root.add(root);actor.skillEffects={root,shield,boost,plate,outline,time:0,previous:actor.root.position.clone(),velocity:new THREE.Vector3()};
 }
 const fx=actor.skillEffects,pos=actor.root.position;
 if(dt>0){const displacement=pos.clone().sub(fx.previous);if(displacement.length()<2)fx.velocity.copy(displacement).multiplyScalar(1/dt);else fx.velocity.set(0,0,0);fx.time+=dt;}
 fx.previous.copy(pos);fx.root.visible=actor.hp>0;
 const remaining=actor.armorRemaining||0,speed=fx.velocity.length();fx.shield.visible=remaining>0;fx.boost.visible=(actor.boostRemaining||0)>0&&speed>.35;
 if(fx.shield.visible){fx.outline.rotation.y+=dt*.35;const warning=remaining<2,blink=warning ? .2+.8*(.5+.5*Math.sin(fx.time*22)):1;fx.plate.material.opacity=(.19+Math.sin(fx.time*4)*.03)*blink;for(const o of fx.shield.children)if(o!==fx.plate)o.material.opacity=(o===fx.outline ? .35 : .6)*blink;}
 if(fx.boost.visible){
  // Root already rotates with the hull: compensate so wind follows actual travel.
  fx.boost.rotation.y=Math.atan2(fx.velocity.x,fx.velocity.z)-actor.angle;
  const intensity=Math.min(1,speed/9);
  for(const [i,line] of fx.boost.children.entries()){const phase=(fx.time*(1.1+speed*.1)+line.userData.phase)%1,side=i%2?1:-1;line.position.set(side*(.95+phase*.5),.3+(i%4)*.22,-.75-phase*2.5);line.scale.set(.018,.018,.18+intensity*.22);line.material.opacity=Math.sin(phase*Math.PI)*.7*intensity;}
 }
}
export function disposeSkillEffects(root){root.getObjectByName('skill-effects')?.traverse(o=>o.material?.dispose());}
