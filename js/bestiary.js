// 澎湖妖怪圖鑑與景點等級：依鄉市給景點等級帶，依景點名稱、說明與傳說中的地形決定出沒妖怪。
// 戰鬥公式（屬性成長、傷害、攻擊間隔、掉寶）沿用原本規則；妖怪只換名稱、說明與招式。
const BESTIARY23=(function(){
'use strict';
const REGION_BAND={'馬公市':0,'湖西鄉':1,'白沙鄉':2,'西嶼鄉':3,'望安鄉':4,'七美鄉':5};
// 招式效果：heavy 重擊、magic 法術、drain 吸取、mpburn 耗魔、multi 連擊、heal 回復
const SKILL_TEXT={heavy:'造成 1.5 倍物理傷害',magic:'以法術攻擊造成 1.3 倍傷害',drain:'造成 1.2 倍傷害並回復自身',mpburn:'造成傷害並奪走魔力',multi:'連續攻擊兩次',heal:'回復自身生命'};
const KINDS={
 sea:{name:'海魍魎',skill:['潮霧纏身','mpburn'],desc:'棲於潮間與海灘的水怪，退潮時藏身礁縫，漲潮時隨浪而出，最愛纏住夜歸的人。'},
 wave:{name:'浪夜叉',skill:['浪叉突刺','multi'],desc:'踏浪而行的海夜叉，手持三叉，在浪頭與港口之間來回巡獵。'},
 weir:{name:'滬魍魎',skill:['滬網困鎖','drain'],desc:'盤據石滬的水怪，會學著石滬的形狀困住來者，吸取氣力。'},
 rock:{name:'岩魑',skill:['玄武崩岩','heavy'],desc:'山石之怪「魑」，由風化的玄武岩與崖石聚成，力大身硬。'},
 cave:{name:'洞魑',skill:['石牙連咬','multi'],desc:'藏在海蝕洞與岩穴深處的魑，聽見腳步聲便從暗處撲出。'},
 well:{name:'井魅',skill:['井底寒息','magic'],desc:'老井裡生出的魅，夜裡在井邊低語，吐出刺骨寒氣。'},
 house:{name:'古厝魅',skill:['老宅迷影','magic'],desc:'老屋與聚落中的器物久了成精，化作魅影在巷弄間迷惑旅人。'},
 war:{name:'戰魂燐火',skill:['燐火焚身','magic'],desc:'古砲台與舊營地上飄盪的燐火，帶著昔日兵戈的殘念。'},
 tree:{name:'木魅',skill:['盤根纏絞','drain'],desc:'老樹的氣根化成的魅，會用根鬚纏住過客，吸取精氣。'},
 flower:{name:'花魅',skill:['花粉迷香','mpburn'],desc:'藏在花叢裡的小魅，散出迷香讓人恍神、魔力流失。'},
 wind:{name:'風煞',skill:['東北季風','multi'],desc:'冬季強勁的東北季風化成的煞氣，一陣接一陣撲面而來。'},
 lamp:{name:'燈影鬼火',skill:['孤燈幻光','magic'],desc:'燈塔與海岬附近的鬼火，用忽明忽滅的光迷惑船隻。'},
 whale:{name:'海翁影',skill:['鯨潮衝擊','heavy'],desc:'海翁（鯨魚）的巨大影子，在海面下翻身時掀起大浪。'},
 turtle:{name:'龜甲精',skill:['硬甲回息','heal'],desc:'披著厚甲的海中精怪，受傷時縮回殼中慢慢回氣。'},
 bird:{name:'雲雀魅',skill:['羽刃疾風','multi'],desc:'棲在草原與濕地的鳥魅，振翅時帶起銳利的風。'},
 marsh:{name:'澤魍魎',skill:['泥沼吞噬','drain'],desc:'濕地與泥灘中的魍魎，會把踏進泥裡的腳拖住。'},
 sand:{name:'沙魑',skill:['流沙捲襲','heavy'],desc:'沙灘與沙丘裡的魑，隨風捲起沙粒襲人。'},
 town:{name:'市井魅',skill:['人聲幻擾','mpburn'],desc:'老街與市集裡聚集的魅，模仿人聲擾亂心神。'},
 bridge:{name:'橋魍魎',skill:['橋下暗流','heavy'],desc:'跨海大橋下的魍魎，順著橋墩間的急流撲擊。'},
 octopus:{name:'大章魚精',skill:['八腕纏擊','multi'],desc:'海中的大章魚修煉成精，八條觸腕同時纏擊。'}
};
// 依關鍵字決定出沒妖怪（名稱、類別、說明、傳說都會比對）
const RULES=[
 [/章魚/,'octopus'],[/鯨/,'whale'],[/龜/,'turtle'],[/石滬|滬/,'weir'],[/燈塔|燈/,'lamp'],
 [/砲台|砲|營|軍|戰|堡|坑道/,'war'],[/井/,'well'],[/古厝|聚落|厝|宅|祠|書院|古蹟|老屋/,'house'],
 [/老街|市場|街|商圈/,'town'],[/榕|樹|林/,'tree'],[/花|菊|仙人掌/,'flower'],[/風/,'wind'],
 [/橋/,'bridge'],[/濕地|泥|潟湖/,'marsh'],[/鳥|雀|鷗|燕/,'bird'],[/沙灘|沙/,'sand'],
 [/洞|窟|穴/,'cave'],[/玄武岩|岩|石|礁|崖|嶼|山/,'rock'],[/浪|港|灣|碼頭|漁/,'wave'],[/海|潮|灘|浪/,'sea']
];
const REGION_KIND={'馬公市':'town','湖西鄉':'marsh','白沙鄉':'tree','西嶼鄉':'rock','望安鄉':'turtle','七美鄉':'weir'};
let enabled=true;
function h(s){let v=2166136261;for(const c of String(s)){v^=c.charCodeAt(0);v=Math.imul(v,16777619);}return v>>>0;}
function zoneOf(s){if(!s)return 0;const band=REGION_BAND[s.region]??6;const list=(typeof PENGHU_SOURCE!=='undefined'?PENGHU_SOURCE.scenes:[]).filter(x=>x.region===s.region).sort((a,b)=>(a.sourceRow||0)-(b.sourceRow||0));
 const i=Math.max(0,list.findIndex(x=>x.id===s.id)),n=Math.max(1,list.length);return band*10+Math.min(9,Math.floor(i*10/n));}
function levelText(s){const z=zoneOf(s);return `Lv.${z*10+1}–${z*10+10}`;}
function kindsOf(s){if(!s)return ['sea'];const text=[s.name,s.category,s.subtype,s.description,s.legend].join(' ');const out=[];
 for(const [re,k]of RULES)if(re.test(text)&&!out.includes(k))out.push(k);
 const rk=REGION_KIND[s.region];if(rk&&!out.includes(rk))out.push(rk);if(!out.includes('sea'))out.push('sea');
 return out.slice(0,4);}
function legendLine(s){const t=String(s?.legend||'').trim();if(!t)return '';const first=t.split(/(?<=。)/)[0];return first;}
const REGION_SHORT={'馬公市':'馬公','湖西鄉':'湖西','白沙鄉':'白沙','西嶼鄉':'西嶼','望安鄉':'望安','七美鄉':'七美'};
function place(s){const full=String(s?.name||'').replace(/[（(].*?[）)]/g,'').replace(/[0-9０-９]+/g,'').trim();
 if(!full||/觀音|媽祖|天后|王爺|佛|宮|廟|寺|祠|帝|聖|神|菩薩|宮|殿|堂|亭|塔公|塔婆/.test(full.slice(0,4)))return REGION_SHORT[s?.region]||'澎湖';
 return [...full].slice(0,2).join('');}
function profile(kind,s){const k=KINDS[kind]||KINDS.sea;return {kind,name:k.name,skill:k.skill[0],effect:k.skill[1],effectText:SKILL_TEXT[k.skill[1]],desc:k.desc,where:place(s),legend:legendLine(s)};}
function sceneMonsters(s){return kindsOf(s).map(k=>profile(k,s));}
return {get enabled(){return enabled;},set enabled(v){enabled=!!v;},KINDS,zoneOf,levelText,kindsOf,sceneMonsters,profile,legendLine,place};
})();

// 產生怪物：沿用原本的屬性計算，再套上當地妖怪的名稱、說明與招式
const createMonster22b=createMonster;
createMonster=function(zoneLevel){const m=createMonster22b(zoneLevel);if(!BESTIARY23.enabled)return m;
 const s=typeof currentScene==='function'?currentScene():null,pool=BESTIARY23.kindsOf(s),kind=pool[Math.floor(Math.random()*pool.length)],p=BESTIARY23.profile(kind,s);
 const tag=(String(m.name).match(/^\[[^\]]+\]\s*/)||[''])[0];
 m.name=tag+p.where+p.name;m.lore23=p;m.skillTurn23=0;return m;};
// 首領冒險的首領也換成當地妖怪之王
const spawnMonster22b=spawnMonster;
spawnMonster=function(){spawnMonster22b();if(!BESTIARY23.enabled)return;const boss=monsters.find(m=>m.runToken&&m.isSpecial&&/幻境首領/.test(m.name));
 if(boss){const s=currentScene(),p=boss.lore23||BESTIARY23.profile(BESTIARY23.kindsOf(s)[0],s);boss.name='[幻境首領] '+p.where+p.name+'王';boss.lore23=p;boss.skillTurn23=0;}};
// 妖怪攻擊：每第三次出手施展招式，其餘照原本的普通攻擊
const monsterAttack22b=monsterAttack;
monsterAttack=function(monster){
 if(!BESTIARY23.enabled||!monster.lore23||monster.attackCooldown>0||player.currentHP<=0||player.isDefeated)return monsterAttack22b(monster);
 monster.skillTurn23=(monster.skillTurn23||0)+1;if(monster.skillTurn23%3!==0)return monsterAttack22b(monster);
 const p=monster.lore23,phys=r=>Math.max(1,Math.floor(monster.PATK*r*(1-player.PDR/100))),mag=r=>Math.max(1,Math.floor(monster.MATK*r*(1-(player.MDR||0)/100)));
 let dmg=0,extra='';
 if(p.effect==='heavy')dmg=phys(1.5);
 else if(p.effect==='magic')dmg=mag(1.3);
 else if(p.effect==='multi')dmg=phys(.7)+phys(.7);
 else if(p.effect==='drain'){dmg=phys(1.2);const heal=Math.floor(dmg*.3);monster.currentHP=Math.min(monster.maxHP,monster.currentHP+heal);extra=`，自身回復 ${formatNumber(heal)}`;}
 else if(p.effect==='mpburn'){dmg=phys(1);const burn=Math.min(player.currentMP,Math.floor(player.maxMP*.1));player.currentMP-=burn;extra=`，奪走魔力 ${formatNumber(burn)}`;}
 else if(p.effect==='heal'){const heal=Math.floor(monster.maxHP*.15);monster.currentHP=Math.min(monster.maxHP,monster.currentHP+heal);dmg=phys(.6);extra=`，回復生命 ${formatNumber(heal)}`;}
 player.currentHP-=dmg;
 logCombat(`<span class='log-name'>${monster.name}</span> 施展「${p.skill}」，對 <span class='log-name'>${player.name}</span> 造成 <span class='log-dmg-value'>${formatNumber(dmg)}</span> 點傷害${extra}。`,'log-damage');
 monster.attackCooldown=2;updatePlayerUI();updateMonsterUI();};
if(typeof COMBAT_CORE22==='object'){COMBAT_CORE22.createMonster=createMonster;COMBAT_CORE22.spawnMonster=spawnMonster;COMBAT_CORE22.monsterAttack=monsterAttack;}

// 景點等級：前往景點時，敵人等級跟著景點走
const travelScene23b=travelScene;
travelScene=function(id){const s=PENGHU_SOURCE.scenes.find(x=>x.id===id);if(BESTIARY23.enabled&&s&&!ext().run)currentZoneIndex=BESTIARY23.zoneOf(s);return travelScene23b(id);};
function sortedScenes23(){return [...PENGHU_SOURCE.scenes].sort((a,b)=>BESTIARY23.zoneOf(a)-BESTIARY23.zoneOf(b)||a.sourceRow-b.sourceRow);}
const handleZoneChange23b=handleZoneChange;
handleZoneChange=function(dir){if(!BESTIARY23.enabled)return handleZoneChange23b(dir);if(ext().run){notify('請先完成或放棄目前冒險，再更換地點。');return;}
 const list=sortedScenes23(),i=list.findIndex(s=>s.id===currentScene().id),next=list[i+dir];if(next)travelScene(next.id);};
const renderZoneUI23b=renderZoneUI;
renderZoneUI=function(){renderZoneUI23b();if(!BESTIARY23.enabled||!player.extension)return;const s=currentScene(),list=sortedScenes23(),i=list.findIndex(x=>x.id===s.id);
 const name=document.getElementById('current-zone-name');if(name)name.textContent=s.region+' · '+BESTIARY23.levelText(s);
 const z=ZONE_CONFIGS[currentZoneIndex];if(z){const a=document.getElementById('zone-min-lvl'),b=document.getElementById('zone-max-lvl');if(a)a.textContent=z.minLevel;if(b)b.textContent=z.maxLevel;}
 const prev=document.getElementById('prev-zone'),nx=document.getElementById('next-zone');if(prev){prev.disabled=i<=0;prev.textContent='較低地點';}if(nx){nx.disabled=i<0||i>=list.length-1;nx.textContent='較高地點';}
 const desc=document.getElementById('scene-description');if(desc){let box=document.getElementById('scene-monsters23');if(!box){box=document.createElement('div');box.id='scene-monsters23';box.className='scene-monsters23';desc.after?desc.after(box):desc.parentElement.append(box);}
  box.textContent='出沒：'+BESTIARY23.sceneMonsters(s).map(p=>p.where+p.name).join('、');}};
// 敵人卡片的「查看屬性」加上妖怪說明、招式與當地傳說
const updateMonsterUI23b=updateMonsterUI;
updateMonsterUI=function(){updateMonsterUI23b();if(typeof tickBatch!=='undefined'&&tickBatch)return;if(typeof ENEMY_NODES22==='undefined')return;
 for(const m of monsters){const n=ENEMY_NODES22.get(String(m.id));if(!n||!m.lore23||n.querySelector('.enemy-lore23'))continue;const d=n.querySelector('details');if(!d)continue;const box=document.createElement('div');box.className='enemy-lore23';
  const p=m.lore23;box.innerHTML=`<p><strong>招式「${esc(p.skill)}」</strong>：${esc(p.effectText)}（每第三次出手施展）</p><p>${esc(p.desc)}</p>${p.legend?`<p class="lore-legend23">${esc(p.where)}的傳說：${esc(p.legend)}</p>`:''}`;d.append(box);}};
// 冒險場景卡片：顯示推薦等級與出沒妖怪
const renderAdventure23b=renderAdventure;
renderAdventure=function(parent){renderAdventure23b(parent);if(!BESTIARY23.enabled)return;
 for(const n of parent.querySelectorAll('.scene-grid .system-card')){const s=PENGHU_SOURCE.scenes.find(x=>x.id===n.dataset.sceneId);if(!s)continue;
  const h3=n.querySelector('h3');const lv=document.createElement('div');lv.className='scene-level23';lv.textContent='敵人等級 '+BESTIARY23.levelText(s);if(h3)(h3.after?h3.after(lv):n.append(lv));
  const ms=BESTIARY23.sceneMonsters(s),d=document.createElement('details');d.className='scene-bestiary23';d.innerHTML=`<summary>出沒妖怪：${ms.map(p=>esc(p.name)).join('、')}</summary>`+ms.map(p=>`<div class="bestiary-item23"><strong>${esc(p.where+p.name)}</strong><span>招式「${esc(p.skill)}」：${esc(p.effectText)}</span><p>${esc(p.desc)}</p></div>`).join('')+(ms[0]&&ms[0].legend?`<p class="lore-legend23">${esc(ms[0].where)}的傳說：${esc(ms[0].legend)}</p>`:'');
  const sel=n.querySelector('select');if(sel&&sel.before)sel.before(d);else n.append(d);}};
// 開啟時讓敵人等級與目前景點一致
window.addEventListener('load',()=>{try{if(!BESTIARY23.enabled||!player.extension)return;const z=BESTIARY23.zoneOf(currentScene());if(currentZoneIndex!==z&&!ext().run){currentZoneIndex=z;monsters=[];spawnMonster();}renderZoneUI();}catch(e){}});
