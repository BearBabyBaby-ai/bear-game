// 戰鬥平衡：減傷改為邊際遞減並與等級相關（上限 75%），體質回血降低，避免 10 級後幾乎不受傷。
const BALANCE23={enabled:true,frontLine:3,drCap:75,drBase:40,drPerLevel:10,regenPerCON:.15};
function damageReduction23(def){const B=BALANCE23,d=Math.max(0,Number(def)||0);return Math.min(B.drCap,Math.floor(B.drCap*d/(d+B.drBase+player.level*B.drPerLevel)));}
const calculateStats23b=calculateStats;
calculateStats=function(){calculateStats23b.apply(this,arguments);if(!BALANCE23.enabled||!player)return;
 player.expToNext=(100+player.level*50)*1000;
 player.PDR=damageReduction23(player.PDEF);player.MDR=damageReduction23(player.MDEF);
 const con=Math.max(0,Number(player.CON)||0),old=1+con*.5,now=1+con*BALANCE23.regenPerCON;if(Number.isFinite(player.HPRegen)&&old>0)player.HPRegen=player.HPRegen*now/old;};
// 怪物等級一律在地點標示的範圍內。新手緩衝：角色 10 級以前，在自己等級夠的地點，怪物攻擊與生命打折（等級不變）；秘境、深淵與越級挑戰不打折。
const createMonster23b=createMonster;
createMonster=function(){const m=createMonster23b.apply(this,arguments);if(!BALANCE23.enabled||!m)return m;
 const z=ZONE_CONFIGS[currentZoneIndex];if(!z||player.level<z.minLevel||player.level>=10)return m;
 const soft=.25+player.level*.075;for(const k of ['PATK','MATK','maxHP'])if(Number.isFinite(m[k]))m[k]=Math.max(1,Math.floor(m[k]*soft));m.currentHP=m.maxHP;return m;};
if(typeof COMBAT_CORE22==='object')COMBAT_CORE22.createMonster=createMonster;
// 只有前排 3 隻怪物會攻擊，後排等前排倒下再遞補。
const monsterAttack23b=monsterAttack;
monsterAttack=function(m){if(BALANCE23.enabled&&m){const alive=monsters.filter(x=>x.currentHP>0),idx=alive.indexOf(m);if(idx>=BALANCE23.frontLine){if(m.attackCooldown>0)m.attackCooldown--;return;}}return monsterAttack23b.apply(this,arguments);};
if(typeof COMBAT_CORE22==='object')COMBAT_CORE22.monsterAttack=monsterAttack;
