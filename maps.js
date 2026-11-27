// Shared deterministic layouts: identical collision on server and every client.
const central=[[-10,-8,6,3],[10,8,6,3],[-10,9,3,5],[11,-10,3,6],[-19,0,3,3],[19,1,3,3]];
const obstacle=(x,z,w,d,h,kind='rock')=>({x,z,w,d,h,kind});
const base=central.map(([x,z,w,d])=>obstacle(x,z,w,d,2,'wall'));
export const maps={
 desert:{id:'desert',name:'Sa mạc vàng',subtitle:'DUNES / 01',half:44,ground:0xb6a17c,sky:0xbac7c8,fog:0xc3bca6,rock:0xad8d65,leaf:0x6f8050,weather:'dust',description:'88 × 88 m · Cồn cát, pháo đài và bụi cát',obstacles:[...base,...[[-30,-20],[29,23],[-28,25],[31,-24],[-4,29],[5,-31]].map(([x,z],i)=>obstacle(x,z,5+i%2,4,3+i%3))]},
 forest:{id:'forest',name:'Rừng sương',subtitle:'GREEN FRONT / 02',half:48,ground:0x64785b,sky:0x9fb5ad,fog:0x9fb5ad,rock:0x7b8779,leaf:0x315d42,weather:'rain',description:'96 × 96 m · Cây thông, sương và mưa nhẹ',obstacles:[...central.map(([x,z,w,d])=>obstacle(x,z,w,d,2.4)),...Array.from({length:24},(_,i)=>{const angle=i*2.39996,r=25+(i%4)*3.7;return obstacle(Math.sin(angle)*r,Math.cos(angle)*r,1.5,1.5,6+i%3,'tree');})]},
 alpine:{id:'alpine',name:'Đèo núi tuyết',subtitle:'FROST RIDGE / 03',half:52,ground:0xb8c8c9,sky:0xa6b9cd,fog:0xb2c5d8,rock:0x768795,leaf:0x3d6461,weather:'snow',description:'104 × 104 m · Vách núi, đá lớn và tuyết rơi',obstacles:[...central.map(([x,z,w,d])=>obstacle(x,z,w,d,3)),...Array.from({length:12},(_,i)=>{const a=i/12*Math.PI*2,r=32+(i%2)*5;return obstacle(Math.sin(a)*r,Math.cos(a)*r,4+i%3,4+i%2,4+i%4);})]}
};
export const skins={olive:{name:'Xanh quân đội',color:0x71865b},sand:{name:'Cát sa mạc',color:0xc6a268},navy:{name:'Xanh hải quân',color:0x4d779a},crimson:{name:'Đỏ chiến binh',color:0xb7584b},arctic:{name:'Trắng Bắc Cực',color:0xd5e3e5},violet:{name:'Tím hoàng hôn',color:0x8765aa}};
export const getMap=id=>Object.hasOwn(maps,id)?maps[id]:maps.desert;
export const getSkin=id=>Object.hasOwn(skins,id)?id:'olive';

// Slow zones are visualized locally and evaluated by the authoritative simulation.
export const surfaces={water:{name:'Nước nông',speed:.5,turn:.8,color:0x538d9c},snow:{name:'Tuyết dày',speed:.45,turn:.7,color:0xecf4f4},mud:{name:'Bùn lầy',speed:.6,turn:.8,color:0x645642}};
maps.desert.zones=[{x:0,z:12,rx:5,rz:4,kind:'water'},{x:-23,z:-8,rx:6,rz:4,kind:'water'}];
maps.forest.zones=[{x:0,z:11,rx:6,rz:5,kind:'water'},{x:18,z:-20,rx:7,rz:5,kind:'mud'},{x:-23,z:-13,rx:6,rz:5,kind:'mud'}];
maps.alpine.zones=[{x:0,z:11,rx:7,rz:6,kind:'snow'},{x:-23,z:12,rx:8,rz:5,kind:'snow'},{x:22,z:-15,rx:7,rz:6,kind:'snow'}];
for(const map of Object.values(maps))map.obstacles.forEach((o,id)=>{o.id=id;o.maxHp=o.kind==='tree'?75:o.kind==='rock'?125:0;});

// One deterministic shoreline polygon is shared by rendering and movement.
export function zoneOutline(zone){const seed=zone.x*.37+zone.z*.23;return Array.from({length:64},(_,i)=>{const a=i/64*Math.PI*2,r=.82+.09*Math.sin(a*3+seed)+.055*Math.cos(a*5-seed)+.025*Math.sin(a*9+seed);return {x:zone.x+Math.cos(a)*zone.rx*r,z:zone.z+Math.sin(a)*zone.rz*r};});}
export function pointInZone(x,z,zone){const points=zone.outline??=zoneOutline(zone);let inside=false;for(let i=0,j=points.length-1;i<points.length;j=i++){const a=points[i],b=points[j];if((a.z>z)!==(b.z>z)&&x<(b.x-a.x)*(z-a.z)/(b.z-a.z)+a.x)inside=!inside;}return inside;}
