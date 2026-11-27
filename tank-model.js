import * as THREE from './vendor/three.module.js';
// The lobby preview and the battlefield use this exact same model.
export function tankModel(paint,materials,cube=new THREE.BoxGeometry(1,1,1)){
 const root=new THREE.Group();
 const box=(parent,x,y,z,sx,sy,sz,material)=>{const mesh=new THREE.Mesh(cube,material);mesh.position.set(x,y,z);mesh.scale.set(sx,sy,sz);mesh.castShadow=mesh.receiveShadow=true;if(material===paint)mesh.userData.armor=true;parent.add(mesh);return mesh;};
 box(root,0,.64,0,1.7,.6,2.5,paint);box(root,0,.98,-.55,1.35,.2,.9,paint);
 const wheelGeometry=new THREE.CylinderGeometry(.25,.25,.47,12);
 for(const side of [-1,1]){box(root,side*.98,.43,0,.45,.65,2.9,materials.track);for(let i=0;i<6;i++){const wheel=new THREE.Mesh(wheelGeometry,materials.metal);wheel.rotation.z=Math.PI/2;wheel.position.set(side*.99,.43,-1.1+i*.44);wheel.castShadow=true;root.add(wheel);}for(let i=0;i<10;i++)box(root,side*.98,.77,-1.3+i*.28,.48,.06,.12,materials.dark);}
 const turret=new THREE.Group();turret.position.y=1.16;root.add(turret);box(turret,0,0,0,1.25,.55,1.35,paint);box(turret,0,.32,-.2,.6,.12,.6,materials.metal);box(turret,0,.02,1.25,.18,.18,1.7,materials.dark);box(turret,0,.02,2.05,.28,.27,.3,materials.dark);box(root,.56,1.55,-.8,.025,1.3,.025,materials.dark);
 return {root,turret};
}
