// 各鄉市的秘境與深淵：怪物生命、攻擊、防禦為普通怪物的 100 倍；經驗 ×20、掉寶機會 ×3。
const REALM23={power:100,exp:20,drops:3,kinds:{'秘境':{depth:9,desc:'鄉市等級帶最高段的隱密之地。'},'深淵':{depth:19,desc:'比秘境再深 100 級的深淵。'}},
 regions:['馬公市','湖西鄉','白沙鄉','西嶼鄉','望安鄉','七美鄉'],short:{'馬公市':'馬公','湖西鄉':'湖西','白沙鄉':'白沙','西嶼鄉':'西嶼','望安鄉':'望安','七美鄉':'七美'}};
function realm23(){const r=player&&player.extension&&player.extension.realm23;return r&&REALM23.regions.includes(r.region)&&REALM23.kinds[r.kind]?r:null;}
function realmZone23(r){return REALM23.regions.indexOf(r.region)*10+REALM23.kinds[r.kind].depth;}
function realmLevelText23(r){const z=realmZone23(r);return `Lv.${z*10+1}–${z*10+10}`;}
function realmName23(r){return REALM23.short[r.region]+r.kind;}
const createMonster23r=createMonster;
createMonster=function(){const m=createMonster23r.apply(this,arguments),r=realm23();if(!r)return m;
 const list=PENGHU_SOURCE.scenes.filter(s=>s.region===r.region),s=list[Math.floor(Math.random()*list.length)]||currentScene(),ks=BESTIARY23.kindsOf(s),kind=ks[Math.floor(Math.random()*ks.length)],p=BESTIARY23.profile(kind,s);
 p.where=REALM23.short[r.region];const tag=(String(m.name).match(/^\[[^\]]+\]\s*/)||[''])[0];
 m.name=`${tag}【${r.kind}】${p.where}${p.name}`;m.lore23=p;m.skillTurn23=0;m.realm23=r.kind;
 for(const k of ['maxHP','PATK','MATK','PDEF','MDEF'])if(Number.isFinite(m[k]))m[k]=Math.floor(m[k]*REALM23.power);m.currentHP=m.maxHP;
 if(Number.isFinite(m.expValue))m.expValue=Math.floor(m.expValue*REALM23.exp);return m;};
const handleItemDrop23r=handleItemDrop;
handleItemDrop=function(monster){const n=monster&&monster.realm23?REALM23.drops:1;for(let i=0;i<n;i++)handleItemDrop23r.apply(this,arguments);};
function enterRealm23(region,kind){if(ext().run){notify('請先完成或放棄目前冒險，再進入秘境或深淵。');return false;}
 ext().realm23={region,kind};const r=realm23();currentZoneIndex=realmZone23(r);monsters=[];spawnMonster();renderZoneUI();changed(`進入${realmName23(r)}（${realmLevelText23(r)}）。怪物屬性為普通怪物的 100 倍，小心應戰！`);if(typeof setView==='function')setView('battle');return true;}
function leaveRealm23(quiet){if(!realm23())return;ext().realm23=null;currentZoneIndex=BESTIARY23.zoneOf(currentScene());monsters=[];spawnMonster();renderZoneUI();if(!quiet)changed(`離開秘境，回到 ${currentScene().name}。`);}
const travelScene23r=travelScene;
travelScene=function(id){if(realm23())leaveRealm23(true);return travelScene23r.apply(this,arguments);};
const handleZoneChange23r=handleZoneChange;
handleZoneChange=function(dir){if(realm23()){leaveRealm23();return;}return handleZoneChange23r.apply(this,arguments);};
const startAdventure23r=startAdventure;
startAdventure=function(){if(realm23()){notify('秘境與深淵中無法開始景點冒險，請先離開。');return false;}return startAdventure23r.apply(this,arguments);};
const renderZoneUI23r=renderZoneUI;
renderZoneUI=function(){renderZoneUI23r.apply(this,arguments);const r=realm23();const exit=document.getElementById('realm-exit23');
 if(!r){if(exit)exit.remove();return;}
 const name=document.getElementById('current-zone-name');if(name)name.textContent=`${realmName23(r)} · ${realmLevelText23(r)}`;
 const z=ZONE_CONFIGS[currentZoneIndex];if(z){const a=document.getElementById('zone-min-lvl'),b=document.getElementById('zone-max-lvl');if(a)a.textContent=z.minLevel;if(b)b.textContent=z.maxLevel;}
 const box=document.getElementById('scene-monsters23');if(box)box.textContent=`${realmName23(r)}：怪物屬性為普通怪物的 100 倍，經驗 ×20、掉寶機會 ×3`;
 const prev=document.getElementById('prev-zone'),nx=document.getElementById('next-zone');if(prev){prev.disabled=false;prev.textContent='離開'+r.kind;}if(nx){nx.disabled=true;}};
function renderRealm23(parent){parent.append(panelIntro('秘境與深淵','每個鄉市都有秘境與深淵。怪物的生命、攻擊、防禦都是普通怪物的 100 倍；擊敗可獲得 20 倍經驗與 3 倍掉寶機會。'));
 const cur=realm23(),grid=document.createElement('div');grid.className='system-grid realm-grid23';
 for(const region of REALM23.regions)for(const kind of Object.keys(REALM23.kinds)){const r={region,kind},here=cur&&cur.region===region&&cur.kind===kind;
  const pool=[...new Set(PENGHU_SOURCE.scenes.filter(s=>s.region===region).flatMap(s=>BESTIARY23.kindsOf(s)))].slice(0,5).map(k=>BESTIARY23.KINDS[k].name);
  const el=card(`<span class="bear-tag ${kind==='深淵'?'abyss23':'secret23'}">${kind}</span><h3>${esc(realmName23(r))}</h3><div class="scene-level23">敵人等級 ${realmLevelText23(r)}</div><p>${esc(REALM23.kinds[kind].desc)}怪物屬性 ×100。</p><div class="bear-muted">出沒：${esc(pool.join('、'))}</div>`,'realm-card23 '+(kind==='深淵'?'abyss23':'secret23'));
  el.append(here?button('離開'+kind,()=>{leaveRealm23();renderSystem();},false,''):button('進入'+kind,()=>enterRealm23(region,kind),!!ext().run||player.isDefeated,'primary'));grid.append(el);}
 parent.append(grid);}
window.addEventListener('load',()=>{try{const r=realm23();if(r){currentZoneIndex=realmZone23(r);monsters=[];spawnMonster();renderZoneUI();}}catch(e){}});
if(typeof COMBAT_CORE22==='object')COMBAT_CORE22.createMonster=createMonster;
