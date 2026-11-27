export const combat={magazine:30,reloadSeconds:3,range:32,shellSpeed:30,lives:10};
export function initWeapon(p){p.ammo=combat.magazine;p.reloadRemaining=0;}
export function beginReload(p){if(p.hp<=0||(p.reloadRemaining||0)>0||(p.ammo??combat.magazine)>=combat.magazine)return false;p.reloadRemaining=combat.reloadSeconds;return true;}
export function tickWeapon(p,dt){p.ammo??=combat.magazine;const before=p.reloadRemaining||0;p.reloadRemaining=before-dt>1e-9?before-dt:0;if(before>0&&p.reloadRemaining===0)p.ammo=combat.magazine;}
export function consumeRound(p){p.ammo??=combat.magazine;if(p.hp<=0||p.ammo<=0||(p.reloadRemaining||0)>0)return false;p.ammo--;if(p.ammo===0)beginReload(p);return true;}
export function shellStep(shell,dt){shell.travelled??=0;const distance=Math.min(combat.shellSpeed*dt,Math.max(0,combat.range-shell.travelled));shell.travelled+=distance;return distance;}
export const livesLeft=p=>Math.max(0,combat.lives-(p.deaths||0));
export function randomPlayerName(){const words=['Chớp','Sói','Đại Bàng','Báo','Sấm','Ưng','Hổ','Gấu'];return words[Math.floor(Math.random()*words.length)]+' '+String(Math.floor(Math.random()*9000)+1000);}
export function rankPlayers(players){return [...players].sort((a,b)=>b.score-a.score||(a.deaths||0)-(b.deaths||0)||a.name.localeCompare(b.name)||a.id.localeCompare(b.id));}
