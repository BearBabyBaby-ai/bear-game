// 戰鬥平衡：減傷改為邊際遞減並與等級相關（上限 75%），體質回血降低，避免 10 級後幾乎不受傷。
const BALANCE23={enabled:true,frontLine:3,drCap:75,drBase:40,drPerLevel:10,regenPerCON:.15};
function damageReduction23(def){const B=BALANCE23,d=Math.max(0,Number(def)||0);return Math.min(B.drCap,Math.floor(B.drCap*d/(d+B.drBase+player.level*B.drPerLevel)));}
const calculateStats23b=calculateStats;
calculateStats=function(){calculateStats23b.apply(this,arguments);if(!BALANCE23.enabled||!player)return;
 player.expToNext=Math.floor(player.level*50*(10+Math.min(player.level,380)*.5));
 player.PDR=damageReduction23(player.PDEF);player.MDR=damageReduction23(player.MDEF);
 const con=Math.max(0,Number(player.CON)||0),old=1+con*.5,now=1+con*BALANCE23.regenPerCON;if(Number.isFinite(player.HPRegen)&&old>0)player.HPRegen=player.HPRegen*now/old;};
// 角色已達該地點最低等級時，怪物最高只比角色高 3 級（避免新手開局被秒殺）；秘境、深淵與越級挑戰不受限制。
const createMonster23b=createMonster;
createMonster=function(){const m=createMonster23b.apply(this,arguments);if(!BALANCE23.enabled||!m)return m;
 const z=ZONE_CONFIGS[currentZoneIndex],cap=player.level+(player.level<10?1:3);if(!z||player.level<z.minLevel)return m;
 if(player.level<10){const soft=.25+player.level*.075;for(const k of ['PATK','MATK','maxHP'])if(Number.isFinite(m[k]))m[k]=Math.max(1,Math.floor(m[k]*soft));m.currentHP=m.maxHP;}
 if(m.level<=cap)return m;
 const f=(1+(cap-1)*.15)/(1+(m.level-1)*.15);for(const k of ['maxHP','PATK','MATK','PDEF','MDEF'])if(Number.isFinite(m[k]))m[k]=Math.max(1,Math.floor(m[k]*f));
 m.currentHP=m.maxHP;if(Number.isFinite(m.expValue))m.expValue=Math.max(1,Math.floor(m.expValue*cap/m.level));m.level=cap;return m;};
if(typeof COMBAT_CORE22==='object')COMBAT_CORE22.createMonster=createMonster;
// 只有前排 3 隻怪物會攻擊，後排等前排倒下再遞補。
const monsterAttack23b=monsterAttack;
monsterAttack=function(m){if(BALANCE23.enabled&&m){const alive=monsters.filter(x=>x.currentHP>0),idx=alive.indexOf(m);if(idx>=BALANCE23.frontLine){if(m.attackCooldown>0)m.attackCooldown--;return;}}return monsterAttack23b.apply(this,arguments);};
if(typeof COMBAT_CORE22==='object')COMBAT_CORE22.monsterAttack=monsterAttack;
