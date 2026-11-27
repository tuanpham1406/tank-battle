import * as THREE from './vendor/three.module.js';
import {Environment} from './environment.js';
import {maps} from './maps.js';
// Render the actual map geometry once, using the existing WebGL context.
export function mapPreviews(renderer){
 const result={},size=renderer.getSize(new THREE.Vector2()),ratio=renderer.getPixelRatio(),shadows=renderer.shadowMap.enabled;
 try{renderer.setPixelRatio(1);renderer.setSize(400,300,false);renderer.shadowMap.enabled=false;
  for(const map of Object.values(maps)){
   const scene=new THREE.Scene(),environment=new Environment(scene);environment.set(map.id);environment.toggle(false);scene.fog=null;
   scene.add(new THREE.HemisphereLight(0xdcecff,0x9a8059,2.5));const sun=new THREE.DirectionalLight(0xffecd2,3);sun.position.set(-20,40,15);scene.add(sun);
   const camera=new THREE.PerspectiveCamera(45,4/3,.1,400);camera.position.set(map.half*.9,map.half*1.35,map.half*1.2);camera.lookAt(0,0,0);
   renderer.render(scene,camera);result[map.id]=renderer.domElement.toDataURL('image/webp',.85);environment.clear();
  }
 }finally{renderer.shadowMap.enabled=shadows;renderer.setPixelRatio(ratio);renderer.setSize(size.x,size.y,false);}
 return result;
}
