export const skills={boost:{name:'Tăng tốc',duration:4,cooldown:12},armor:{name:'Buff giáp',duration:8,cooldown:18}};
export function activateSkill(p,id){if(!Object.hasOwn(skills,id)||p.hp<=0||(p[id+'Cooldown']||0)>0)return false;p[id+'Remaining']=skills[id].duration;p[id+'Cooldown']=skills[id].cooldown;return true;}
export function tickSkills(p,dt){for(const id of Object.keys(skills)){p[id+'Remaining']=Math.max(0,(p[id+'Remaining']||0)-dt);p[id+'Cooldown']=Math.max(0,(p[id+'Cooldown']||0)-dt);}}
export function skillDamage(p,damage){return (p.armorRemaining||0)>0?damage*.1:damage;}
