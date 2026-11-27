import {obstaclePolygon} from './collision.js';
import {getMap} from './maps.js';
export class Minimap {
 constructor(canvas){this.canvas=canvas;this.ctx=canvas.getContext('2d');this.last=-Infinity;}
 draw(mapId,props,actors,now=performance.now()){
  if(now-this.last<65)return;this.last=now;
  const c=this.ctx,size=this.canvas.width,pad=13,map=getMap(mapId),scale=(size-pad*2)/(map.half*2);
  const x=v=>pad+(v+map.half)*scale,z=v=>pad+(v+map.half)*scale;
  c.clearRect(0,0,size,size);c.fillStyle='#16251f';c.fillRect(0,0,size,size);
  c.strokeStyle='#9caf9e15';c.lineWidth=1;for(let i=1;i<4;i++){const n=pad+i*(size-2*pad)/4;c.beginPath();c.moveTo(n,pad);c.lineTo(n,size-pad);c.moveTo(pad,n);c.lineTo(size-pad,n);c.stroke();}
  for(const region of map.zones){c.fillStyle=region.kind==='water'?'#37606b':region.kind==='snow'?'#b7c9c355':'#6d5e414d';c.beginPath();c.ellipse(x(region.x),z(region.z),region.rx*scale,region.rz*scale,0,0,Math.PI*2);c.fill();}
  c.fillStyle='#929c97';for(const o of map.obstacles){if(o.maxHp&&props?.[o.id]?.hp===0)continue;const poly=obstaclePolygon(o,props?.[o.id]);if(poly.length){c.beginPath();poly.forEach((p,i)=>i===0?c.moveTo(x(p.x),z(p.z)):c.lineTo(x(p.x),z(p.z)));c.closePath();c.fill();}}
  c.strokeStyle='#9daf9a66';c.strokeRect(pad,pad,size-pad*2,size-pad*2);
  for(const actor of actors){if(!actor.alive)continue;const px=x(actor.x),pz=z(actor.z);c.save();c.translate(px,pz);if(actor.self){c.fillStyle='#63e69c20';c.beginPath();c.arc(0,0,13*scale,0,Math.PI*2);c.fill();c.rotate(-actor.angle);c.fillStyle='#62e99d';c.strokeStyle='#0b2417';c.lineWidth=1.5;c.beginPath();c.moveTo(0,8);c.lineTo(-5,-5);c.lineTo(0,-2);c.lineTo(5,-5);c.closePath();c.fill();c.stroke();}else{c.fillStyle='#ff7777';c.strokeStyle='#361b1b';c.lineWidth=1.3;c.beginPath();c.arc(0,0,3.8,0,Math.PI*2);c.fill();c.stroke();}c.restore();}
  c.fillStyle='#c5d3c9';c.font='9px system-ui';c.textAlign='center';c.fillText('N',size/2,9);
 }
}
