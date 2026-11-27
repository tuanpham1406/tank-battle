import * as THREE from './vendor/three.module.js';
import {zoneOutline,pointInZone} from './maps.js';
export function createZoneSurface(zone){
 const root=new THREE.Group(),water=zone.kind==='water',snow=zone.kind==='snow',outline=zoneOutline(zone),animated=[];
 root.name='terrain-'+zone.kind;
 const material=(color,roughness=1)=>new THREE.MeshStandardMaterial({color,roughness,metalness:water?.12:0});
 function patch(scale,y,paint,dx=0,dz=0,bulge=0){const vertices=[zone.x+dx,y+bulge,zone.z+dz],indices=[];for(const p of outline)vertices.push(zone.x+(p.x-zone.x)*scale+dx,y,zone.z+(p.z-zone.z)*scale+dz);for(let i=0;i<outline.length;i++)indices.push(0,(i+1)%outline.length+1,i+1);const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geometry.setIndex(indices);geometry.computeVertexNormals();const mesh=new THREE.Mesh(geometry,paint);mesh.receiveShadow=true;root.add(mesh);return mesh;}
 // Nested uneven banks, shallow water or raised snow drifts, never a circular rim.
 patch(1,.028,material(snow?0xd3e2e5:water?0x8e9471:0x847154));
 patch(.95,.037,material(snow?0xe2ecee:water?0x648c89:0x6b593e));
 patch(.87,.046,material(snow?0xf1f5f3:water?0x477f8a:0x554733,water?.3:1),0,0,snow?.24:0);
 if(water)patch(.65,.05,material(0x3e7583,.25),zone.rx*.05,-zone.rz*.03);
 if(snow){patch(.54,.07,material(0xf7faf7),-zone.rx*.15,zone.rz*.07,.3);patch(.3,.08,material(0xe7f0f1),zone.rx*.37,-zone.rz*.11,.17);}
 const seed=zone.x*.7+zone.z*.3,noise=i=>{const n=Math.sin(i*127.1+seed)*43758.5453;return n-Math.floor(n);};
 for(let i=0;i<(water?14:snow?18:30);i++){
  const x=zone.x+(noise(i*3)-.5)*zone.rx*1.6,z=zone.z+(noise(i*3+1)-.5)*zone.rz*1.6;
  if(!pointInZone(x,z,zone)||!pointInZone(zone.x+(x-zone.x)/.74,zone.z+(z-zone.z)/.74,zone))continue;
  if(water){const length=.35+noise(i+2)*1.1,curve=new THREE.QuadraticBezierCurve3(new THREE.Vector3(x-length/2,.066,z),new THREE.Vector3(x,.066,z+.13),new THREE.Vector3(x+length/2,.066,z));const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve.getPoints(8)),new THREE.LineBasicMaterial({color:0xc0e0dc,transparent:true,opacity:.2,depthWrite:false}));root.add(line);animated.push({line,phase:i*.9});}
  else {const mesh=new THREE.Mesh(new THREE.IcosahedronGeometry(1,0),material(snow?(i%2?0xffffff:0xd3e1e4):(i%3?0x736044:0x3d392b)));mesh.position.set(x,snow?.08:.055,z);mesh.scale.set(.2+noise(i+8)*.5,snow?.06:.025,.15+noise(i+5)*.35);mesh.rotation.y=noise(i+4)*Math.PI;mesh.receiveShadow=true;root.add(mesh);}
 }
 // Old paired tire ruts in mud, clipped to the irregular patch.
 if(!water&&!snow)for(let i=0;i<24;i++){const z=zone.z+(i/23-.5)*zone.rz*1.4;for(const side of [-1,1]){const x=zone.x+side*.65+Math.sin(i*.13)*.5;if(!pointInZone(x,z,zone))continue;const rut=new THREE.Mesh(new THREE.BoxGeometry(.24,.012,.22),material(0x403b2c));rut.position.set(x,.07,z);root.add(rut);}}
 return {root,animated};
}
