// 熊熊轉職系統：等級達標後在角色頁轉職，31 級選擇戰熊或法熊路線，每一階提供能力加成。
const JOBS23={
 novice:{name:'初心熊',min:1,max:10,path:'',next:['misty'],bonus:{}},
 misty:{name:'朦朧熊',min:11,max:30,path:'',next:['warrior','mage'],bonus:{maxHP:.05,maxMP:.05}},
 warrior:{name:'戰熊',min:31,max:50,path:'戰',next:['berserker'],bonus:{PATK:.10,PDEF:.05,maxHP:.10,maxMP:.05}},
 mage:{name:'法熊',min:31,max:50,path:'法',next:['mystic'],bonus:{MATK:.10,MDEF:.05,maxMP:.10,maxHP:.05}},
 berserker:{name:'狂暴戰熊',min:51,max:85,path:'戰',next:['warking'],bonus:{PATK:.20,PDEF:.10,maxHP:.18,maxMP:.05}},
 mystic:{name:'靈玄法熊',min:51,max:85,path:'法',next:['mageking'],bonus:{MATK:.20,MDEF:.10,maxMP:.18,maxHP:.05}},
 warking:{name:'戰熊王',min:86,max:100,path:'戰',next:[],bonus:{PATK:.35,PDEF:.15,maxHP:.28,maxMP:.05}},
 mageking:{name:'玄熊王',min:86,max:100,path:'法',next:[],bonus:{MATK:.35,MDEF:.15,maxMP:.28,maxHP:.05}}
};
const JOB_STAT_NAME23={PATK:'物理攻擊',MATK:'法術攻擊',PDEF:'物理防禦',MDEF:'法術防禦',maxHP:'生命上限',maxMP:'魔力上限'};
function jobId23(){const e=player&&player.extension;const id=e&&e.job;return JOBS23[id]?id:'novice';}
function job23(){return JOBS23[jobId23()];}
function jobBonusText23(j){const b=Object.entries(j.bonus);return b.length?b.map(([k,v])=>`${JOB_STAT_NAME23[k]} +${Math.round(v*100)}%`).join('、'):'無';}
function jobNextReady23(){const j=job23();return j.next.map(id=>({id,...JOBS23[id]})).filter(n=>player.level>=n.min);}

// 能力加成：在原本數值計算完成後套用
const calculateStats23j=calculateStats;
calculateStats=function(){calculateStats23j();if(!player.extension)return;const j=job23();
 for(const [k,v] of Object.entries(j.bonus)){if(!Number.isFinite(player[k]))continue;player[k]=(k==='maxHP'||k==='maxMP')?Math.floor(player[k]*(1+v)):player[k]*(1+v);}
 if(player.currentHP>player.maxHP)player.currentHP=player.maxHP;if(player.currentMP>player.maxMP)player.currentMP=player.maxMP;};

// 舊存檔沒有職業時視為初心熊
const migratePlayer23j=migratePlayer;
migratePlayer=function(){const r=migratePlayer23j.apply(this,arguments);try{const e=player.extension;if(e&&e.job&&!JOBS23[e.job])delete e.job;}catch(err){}return r;};

function changeJob23(id){const j=job23(),n=JOBS23[id];if(!n||!j.next.includes(id))return false;if(player.level<n.min){notify(`需要等級 ${n.min} 才能轉職為${n.name}。`);return false;}
 if(n.path&&!confirm(`確定轉職為「${n.name}」？轉職後將沿著${n.path}系路線前進，無法更改。`))return false;
 player.extension.job=id;player.extension.jobNotified=id;calculateStats();updatePlayerUI();if(typeof saveGame==='function')saveGame(true);
 logCombat(`<span class='log-name'>${esc(player.name)}</span> 轉職為「${n.name}」！`,'log-status');notify(`轉職成功！熊寶成為「${n.name}」。加成：${jobBonusText23(n)}`);renderJob23();return true;}

function renderJob23(){const title=document.getElementById('player-job23');if(title)title.textContent=job23().name;
 const sec=document.querySelector('.battle-attributes22');if(!sec)return;let box=document.getElementById('job-box23');
 if(!box){box=document.createElement('div');box.id='job-box23';box.className='job-box23';const head=sec.querySelector('.section-title22');if(head&&head.after)head.after(box);else sec.prepend(box);}
 const j=job23(),ready=jobNextReady23(),next=j.next.map(id=>JOBS23[id]);
 let html=`<div class="job-now23"><span>目前職業</span><strong>${esc(j.name)}</strong><em>Lv.${j.min}${j.next.length?'–'+j.max:' 以上'}</em></div><div class="job-bonus23">職業加成：${esc(jobBonusText23(j))}</div>`;
 if(!next.length)html+='<div class="job-next23">已到達最高職業。</div>';
 else if(!ready.length)html+=`<div class="job-next23">下一階：${next.map(n=>esc(n.name)).join(' 或 ')}（Lv.${next[0].min} 可轉職）</div>`;
 else{if(ready.length>1)html+='<div class="job-next23">選擇路線：戰熊走物理攻擊，法熊走法術攻擊。</div>';html+=ready.map(n=>`<div class="job-preview23">${esc(n.name)}：${esc(jobBonusText23(n))}</div>`).join('');}
 const sk=(JOB_SKILLS23&&JOB_SKILLS23[jobId23()]||[]).map(x=>x[1]);if(sk.length)html+=`<div class="job-next23">專屬技能：${sk.map(esc).join('、')}（到「技能研習」學習）</div>`;
 box.innerHTML=html;
 if(next.length&&ready.length){const acts=document.createElement('div');acts.className='job-actions23';
  for(const n of ready){const b=document.createElement('button');b.className='bear-btn primary';b.textContent=`轉職為「${n.name}」`;b.onclick=()=>changeJob23(n.id);acts.append(b);}
  box.append(acts);}}

// 等級達標時提示一次，並隨角色畫面更新
const updatePlayerUI23j=updatePlayerUI;
let jobShown23='';
updatePlayerUI=function(){updatePlayerUI23j.apply(this,arguments);if(!player.extension)return;const key=jobId23()+'|'+jobNextReady23().map(n=>n.id).join(',');
 if(key!==jobShown23){jobShown23=key;renderJob23();const ready=jobNextReady23();if(ready.length&&player.extension.jobNotified!==ready[0].id+'@ready'){player.extension.jobNotified=ready[0].id+'@ready';notify(`熊寶已達 Lv.${ready[0].min}，可以到角色頁轉職為「${ready.map(n=>n.name).join('」或「')}」！`);}}};

// 冒險手冊：轉職說明
const renderHelp23j=renderHelp;
renderHelp=function(parent){renderHelp23j(parent);const box=card(`<h3>熊熊轉職</h3><p>等級達標後，到「即時戰鬥」的角色頁按「轉職」。31 級時選擇戰熊（物理）或法熊（法術）路線，選定後不能更改。</p>`+
 `<div class="job-table23">${['novice','misty','warrior','mage','berserker','mystic','warking','mageking'].map(id=>{const j=JOBS23[id];return `<div><strong>${j.name}</strong><span>Lv.${j.min}${j.next.length?'–'+j.max:' 以上'}${j.path?'・'+j.path+'系':''}</span><em>${esc(jobBonusText23(j))}</em></div>`;}).join('')}</div>`);
 const first=parent.firstElementChild;if(first&&first.after)first.after(box);else parent.append(box);};

document.addEventListener('DOMContentLoaded',()=>{try{calculateStats();updatePlayerUI();renderJob23();}catch(e){}});

// 職業專屬技能：每個職業兩招；轉職後原本路線上的專屬技能仍可使用。
const JOB_SKILLS23={
 novice:[['bear_paw23','熊掌拍擊','Physical','Single',6,1.6,2,'','用厚實的熊掌拍向單一敵人。'],['honey23','蜂蜜補給','Support','Single',10,.3,8,'mana','吃一口蜂蜜，回復魔力。']],
 misty:[['mist_claw23','朦朧霧爪','Physical','Area',14,1.4,4,'','在霧中揮爪，攻擊全體敵人。'],['mist_focus23','霧中凝神','Support','Single',16,.15,10,'buff','凝神靜氣，短時間提升戰意。']],
 warrior:[['war_smash23','戰熊重擊','Physical','Single',24,3.2,5,'','集中全力重擊單一敵人。'],['war_roar23','熊吼戰意','Support','Single',20,.25,12,'buff','一聲熊吼，大幅提升戰意。']],
 mage:[['mage_bolt23','熊靈法彈','Magic','Single',24,3.2,5,'','凝聚熊靈之力射出法彈。'],['mage_ward23','熊靈護盾','Support','Single',22,1.2,12,'shield','以法力張開護盾抵擋傷害。']],
 berserker:[['rage_slash23','狂暴連斬','Physical','Area',36,2.8,6,'','狂暴地連續斬擊全體敵人。'],['blood_rage23','嗜血狂擊','Physical','Single',30,3,6,'drain','重擊敵人並吸取生命。']],
 mystic:[['star_fall23','靈玄星落','Magic','Area',36,2.8,6,'','召喚星光墜落，攻擊全體敵人。'],['soul_drain23','玄冥吸魂','Magic','Single',30,3,6,'drain','以玄冥法術吸取敵人生命。']],
 warking:[['king_quake23','王者裂地','Physical','Area',55,4.2,8,'','王者一擊震裂大地，攻擊全體敵人。'],['iron_wall23','王之鐵壁','Support','Single',40,2,14,'shield','築起鐵壁般的護盾。']],
 mageking:[['heaven23','玄熊天罰','Magic','Area',55,4.2,8,'','降下天罰之雷，攻擊全體敵人。'],['spirit_tide23','玄王回靈','Support','Single',30,.5,14,'mana','引動靈潮，大量回復魔力。']]
};
const JOB_SKILL_OWNER23={};
for(const [job,list] of Object.entries(JOB_SKILLS23))for(const [id,name,type,target,cost,multiplier,cooldown,effect,desc] of list){SKILLS[id]={name,type,target,cost,multiplier,cooldown,isAuto:true,effect:effect||undefined};JOB_SKILL_OWNER23[id]={job,desc};}
function jobChain23(id){const chain=[id];let cur=id;for(let guard=0;guard<10;guard++){const prev=Object.keys(JOBS23).find(k=>JOBS23[k].next.includes(cur));if(!prev)break;chain.unshift(prev);cur=prev;}return chain;}
function jobSkillUnlocked23(id){const o=JOB_SKILL_OWNER23[id];return !!o&&jobChain23(jobId23()).includes(o.job);}
function trainJobSkill23(id){if(!jobSkillUnlocked23(id))return false;const e=ext(),r=e.skillRanks[id]||0;if(r>=MAX_SKILL_LEVEL)return false;if(!spend(learnCost(id)))return false;e.skillRanks[id]=r+1;
 if(!e.skillPriority.includes(id))e.skillPriority.unshift(id);if(!r)player.autoSkills[id]=true;changed(`${SKILLS[id].name} 提升至 Lv.${r+1}。`);return true;}
function setJobSkillAuto23(id,on){if(!(ext().skillRanks[id]>0))return;player.autoSkills[id]=!!on;if(on&&!ext().skillPriority.includes(id))ext().skillPriority.unshift(id);changed();}
// 讀檔後把已學的職業技能放回施放順序（原本的整理只保留一般技能）
const migratePlayer23s=migratePlayer;
migratePlayer=function(){const r=migratePlayer23s.apply(this,arguments);try{const e=player.extension;if(e&&Array.isArray(e.skillPriority)){for(const id of Object.keys(JOB_SKILL_OWNER23))if(e.skillRanks&&e.skillRanks[id]>0&&!e.skillPriority.includes(id))e.skillPriority.unshift(id);}}catch(err){}return r;};
// 技能研習頁：職業專屬技能區
const renderSkills23j=renderSkills21;
renderSkills21=function(parent){renderSkills23j(parent);const chain=jobChain23(jobId23()),cur=job23(),nextJobs=cur.next;
 const wrap=document.createElement('section');wrap.className='job-skills23';wrap.innerHTML=`<h3>職業專屬技能 · ${esc(cur.name)}</h3><p class="bear-muted">目前路線上的職業技能都能學習；轉職後會解鎖新的專屬技能。專屬技能不佔 6 格自動技能。</p>`;
 const grid=document.createElement('div');grid.className='system-grid skills-grid22';
 const show=[...chain,...nextJobs];
 for(const job of show)for(const [id] of JOB_SKILLS23[job]){const s=SKILLS[id],o=JOB_SKILL_OWNER23[id],rank=ext().skillRanks[id]||0,open=chain.includes(job),cost=learnCost(id);
  const el=card(`<span class="bear-tag">${esc(JOBS23[job].name)}專屬 · ${SKILL_TYPES22[s.type]}</span><h3>${esc(s.name)}</h3><div class="skill-level22">Lv.${rank}<small> / ${MAX_SKILL_LEVEL}</small></div><p>${esc(o.desc)}</p><div class="bear-muted">MP ${s.cost} · 冷卻 ${s.cooldown} 回合<br>${open?(rank>=MAX_SKILL_LEVEL?'已達滿級':`${fmt(cost.gold)} 金幣 / ${cost.skillPoints} 技能點`):`轉職為「${esc(JOBS23[job].name)}」後解鎖`}</div>`,open?'':'locked23');
  if(open){el.append(button(rank>=MAX_SKILL_LEVEL?'已達滿級':rank?'提升等級':'學習技能',()=>trainJobSkill23(id),rank>=MAX_SKILL_LEVEL||!afford(cost),'primary'));
   if(rank){const label=document.createElement('label');label.className='auto-label';const box=document.createElement('input');box.type='checkbox';box.checked=!!player.autoSkills[id];box.onchange=()=>setJobSkillAuto23(id,box.checked);label.append(box,' 自動施放');el.append(label);}}
  grid.append(el);}
 wrap.append(grid);const first=parent.firstElementChild;if(first&&first.after)first.after(wrap);else parent.append(wrap);};
