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
