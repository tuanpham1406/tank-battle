import * as THREE from './vendor/three.module.js';
import {tankModel} from './tank-model.js';
import {skins,getSkin} from './maps.js';
export class TankPreview {
 constructor(canvas){
  this.canvas=canvas;this.elapsed=0;this.lastPaint=0;this.yaw=-.55;this.targetYaw=-.55;this.dragging=false;
  this.renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,preserveDrawingBuffer:true});this.renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));this.renderer.setClearColor(0,0);this.renderer.toneMapping=THREE.ACESFilmicToneMapping;this.renderer.outputColorSpace=THREE.SRGBColorSpace;
  this.scene=new THREE.Scene();this.camera=new THREE.PerspectiveCamera(35,1,.1,40);this.camera.position.set(4.7,3.3,6.2);this.camera.lookAt(0,.65,0);
  this.scene.add(new THREE.HemisphereLight(0xdceaf6,0x77735d,2.4));const key=new THREE.DirectionalLight(0xffe6bb,4);key.position.set(3,6,4);this.scene.add(key);const rim=new THREE.DirectionalLight(0x88c6e9,3);rim.position.set(-4,3,-3);this.scene.add(rim);
  const material=color=>new THREE.MeshStandardMaterial({color,roughness:.65,metalness:.15});this.paint=material(skins.olive.color);this.model=tankModel(this.paint,{track:material(0x252f2c),metal:material(0x8a9682),dark:material(0x26342c)});this.model.turret.rotation.y=.15;this.scene.add(this.model.root);
  const base=new THREE.Mesh(new THREE.CylinderGeometry(2.25,2.4,.12,64),material(0x20322d));base.position.y=-.08;this.scene.add(base);
  const ring=new THREE.Mesh(new THREE.RingGeometry(2.26,2.28,80),new THREE.MeshBasicMaterial({color:0xe0b878,transparent:true,opacity:.45,side:THREE.DoubleSide}));ring.rotation.x=-Math.PI/2;ring.position.y=-.01;this.scene.add(ring);
  const shadow=new THREE.Mesh(new THREE.CircleGeometry(1.6,48),new THREE.MeshBasicMaterial({color:0x09130e,transparent:true,opacity:.4}));shadow.rotation.x=-Math.PI/2;shadow.scale.set(.8,1.2,1);shadow.position.y=.005;this.scene.add(shadow);
  this.observer=new ResizeObserver(()=>this.resize());this.observer.observe(canvas);this.resize();
  canvas.addEventListener('pointerdown',e=>{this.dragging=true;this.startX=e.clientX;this.startYaw=this.targetYaw;canvas.setPointerCapture(e.pointerId);});canvas.addEventListener('pointermove',e=>{if(this.dragging)this.targetYaw=this.startYaw+(e.clientX-this.startX)*.012;});const release=()=>{this.dragging=false;this.rest=2;};canvas.addEventListener('pointerup',release);canvas.addEventListener('pointercancel',release);
  canvas.addEventListener('keydown',e=>{if(e.code==='ArrowLeft'||e.code==='ArrowRight'){e.preventDefault();this.targetYaw+=e.code==='ArrowLeft'?-.25:.25;this.rest=3;}});
 }
 resize(){const {width,height}=this.canvas.getBoundingClientRect();if(!width||!height)return;this.renderer.setSize(width,height,false);this.camera.aspect=width/height;this.camera.updateProjectionMatrix();}
 setSkin(id){const skin=getSkin(id);this.paint.color.setHex(skins[skin].color);this.canvas.setAttribute('aria-label','Xe tăng 3D màu '+skins[skin].name+'. Kéo hoặc dùng phím trái/phải để xoay.');}
 update(dt,visible){if(!visible)return;this.elapsed+=dt;this.rest=Math.max(0,(this.rest||0)-dt);if(!this.dragging&&!this.rest&&!matchMedia('(prefers-reduced-motion: reduce)').matches)this.targetYaw+=dt*.08;this.yaw+=(this.targetYaw-this.yaw)*(1-Math.exp(-10*dt));this.model.root.rotation.y=this.yaw;if(this.elapsed-this.lastPaint<1/30)return;this.lastPaint=this.elapsed;this.renderer.render(this.scene,this.camera);}
}
