// 掉落裝備：隨機詞綴（實際附加屬性）與隨機技能加成。只影響新產生的裝備，舊裝備不變。
const GEAR23={enabled:true};
const GEAR_AFFIX23=[
 ['疾風之','AGI'],['蠻力之','STR'],['睿智之','INT'],['堅韌之','CON'],['幸運之','LUK'],['奇運之','SPL'],
 ['破甲之','PATK'],['奧術之','MATK'],['剛毅之','PDEF'],['守護之','MDEF'],['生命之','MaxHP'],['法力之','MaxMP'],['會心之','Pcrit'],['靈動之','Mcrit']
];
const GEAR_TIER_POWER23={T0:1,T1:1.3,T2:1.7,T3:2.2,T4:3,T5:4};
function affixValue23(stat,level,tier){const p=GEAR_TIER_POWER23[tier]||1,base=(2+level*.4)*p;
 if(stat==='MaxHP'||stat==='MaxMP')return Math.max(5,Math.round(base*8));if(stat==='Pcrit'||stat==='Mcrit')return Math.max(1,Math.min(10,Math.round(p*1.5)));return Math.max(1,Math.round(base));}
function skillBonusPool23(){return Object.keys(EXT_SKILLS).concat(typeof JOB_SKILL_OWNER23==='object'?Object.keys(JOB_SKILL_OWNER23):[]);}
const generateItem23g=generateItem;
generateItem=function(level,bonus=0){const i=generateItem23g.apply(this,arguments);if(!GEAR23.enabled||!i||!i.stats)return i;
 const tierN=Number(String(i.tier).slice(1))||0,count=1+(tierN>=2?1:0)+(tierN>=4?1:0),picked=[];
 while(picked.length<count){const a=GEAR_AFFIX23[Math.floor(Math.random()*GEAR_AFFIX23.length)];if(!picked.includes(a))picked.push(a);}
 for(const [,stat] of picked){const v=affixValue23(stat,i.minLevel||1,i.tier);i.stats[stat]=(i.stats[stat]||0)+v;if(i.baseStats)i.baseStats[stat]=(i.baseStats[stat]||0)+v;}
 i.affix23=picked.map(a=>a[0]);
 const slotName=EQUIPMENT_SLOTS[i.slot]||'',tierName=(TIER_CONFIG[i.tier]||{}).display||'';i.name=`${tierName} ${picked[0][0]}${slotName}`;
 if(Math.random()<.35+tierN*.13){const pool=skillBonusPool23(),id=pool[Math.floor(Math.random()*pool.length)];if(id&&SKILLS[id])i.skill23={id,pct:Math.round(5+tierN*3+Math.random()*(5+tierN*2))};}
 return i;};
// 技能加成：裝備中的技能加成會提高該技能的傷害倍率
function gearSkillBonus23(id){let sum=0;for(const it of Object.values(player.equipment||{}))if(it&&it.skill23&&it.skill23.id===id)sum+=Number(it.skill23.pct)||0;return sum/100;}
const effectiveSkill23g=effectiveSkill;
effectiveSkill=function(id){const r=effectiveSkill23g.apply(this,arguments);const b=gearSkillBonus23(id);if(b&&r&&Number.isFinite(r.multiplier))r.multiplier*=1+b;return r;};
const statsText23g=statsText;
statsText=function(i){const t=statsText23g.apply(this,arguments);if(!i||!i.skill23||!SKILLS[i.skill23.id])return t;return `${t}　技能「${SKILLS[i.skill23.id].name}」傷害 +${i.skill23.pct}%`;};
