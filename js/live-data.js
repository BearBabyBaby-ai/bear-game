// 開啟時讀取最新的景點、美食、廟宇、分海與潮汐；沒網路時沿用上次讀到的內容或內建內容。
// 編號規則與內建內容相同，舊進度（景點章、夥伴、背包）不受影響。
(function(){
'use strict';
const BOOK='1LOr4_3ugTHvTIi4UIfgVz2atVFh2K32zh7YKrrHxTwk';
const TABS={scenes:['景點',2085392869],foods:['美食清單',1582663006],temples:['廟宇',2137991614],parting:['奎壁山摩西分海',1122135459],tide:['澎湖縣-未來30天潮汐預報',776158339]};
const KEY='bear-game-live-v1';
const LIVE=window.BEAR_LIVE={tide:[],parting:[],at:0,ready:false};

function parseCSV(text){const rows=[];let row=[],cell='',q=false;text=String(text||'').replace(/^﻿/,'');
 for(let i=0;i<text.length;i++){const ch=text[i];
  if(q){if(ch==='"'){if(text[i+1]==='"'){cell+='"';i++;}else q=false;}else cell+=ch;}
  else if(ch==='"')q=true;else if(ch===','){row.push(cell);cell='';}
  else if(ch==='\n'||ch==='\r'){if(ch==='\r'&&text[i+1]==='\n')i++;row.push(cell);rows.push(row);row=[];cell='';}
  else cell+=ch;}
 if(cell!==''||row.length){row.push(cell);rows.push(row);}return rows;}
function table(rows){const head=(rows[0]||[]).map(h=>String(h).replace(/\s+/g,'').trim());const col=n=>head.indexOf(n);
 return {col,rows:rows.slice(1)};}
const tx=v=>String(v==null?'':v).trim();
async function sha12(s){const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s));return [...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('').slice(0,12);}

async function build(csv){
 const out={at:Date.now(),scenes:[],foods:[],deities:[],parting:[],tide:[]};
 {const t=table(parseCSV(csv.scenes)),c=t.col,seen=new Set();
  for(let i=0;i<t.rows.length;i++){const r=t.rows[i],g=k=>tx(r[c(k)]);const name=g('景點名稱');if(!name)continue;
   const s={sourceRow:i+2,region:g('區域(鄉市)'),village:g('區域(村里)'),address:g('地址'),phone:'',url:g('完整網址'),imageURL:g('圖資來源'),id:'',name,category:g('主類別'),subtype:g('次類別'),description:g('簡易說明'),legend:g('傳說')};
   s.id='scene_'+await sha12([s.name,s.region,s.village].join('|'));if(seen.has(s.id))continue;seen.add(s.id);out.scenes.push(s);}}
 {const t=table(parseCSV(csv.foods)),c=t.col,seen=new Set();
  for(let i=0;i<t.rows.length;i++){const r=t.rows[i],g=k=>tx(r[c(k)]);const name=g('名稱');if(!name)continue;
   const f={sourceRow:i+2,region:g('區域(鄉市)'),village:'',address:g('地址'),phone:g('電話'),url:g('完整網址'),imageURL:g('圖資來源'),id:'',name,category:g('類別'),menu:g('推薦菜色／行程'),service:g('代表餐食／服務'),hours:g('營業時間')};
   f.id='food_'+await sha12([f.name,f.region,f.address].join('|'));if(seen.has(f.id))continue;seen.add(f.id);out.foods.push(f);}}
 {const t=table(parseCSV(csv.temples)),c=t.col,byName=new Map();
  for(let i=0;i<t.rows.length;i++){const r=t.rows[i],g=k=>tx(r[c(k)]);const name=g('廟宇名稱'),main=g('主祀');if(!name||!main)continue;
   const temple={sourceRow:i+2,region:g('區域(鄉市)'),village:g('區域(村里)'),address:g('地址'),phone:g('電話'),url:g('完整網址'),imageURL:g('圖資來源'),name,main,history:g('廟宇史蹟'),legend:g('傳說')};
   for(const d of main.split('、').map(x=>x.trim()).filter(Boolean)){if(!byName.has(d))byName.set(d,{id:'deity_'+await sha12(d),name:d,temples:[]});byName.get(d).temples.push(temple);}}
  out.deities=[...byName.values()];}
 {const rows=parseCSV(csv.parting),t=table(rows),c=t.col,keep=dayWindow(-1,31);
  for(const r of t.rows){const g=k=>tx(r[c(k)]);const date=g('完整日期');if(!date||!keep(date))continue;
   out.parting.push({date,time:g('潮時'),height:g('潮汐高度'),state:g('狀態'),sunrise:g('日出'),sunset:g('日沒'),safe:g('參考安全通行')});}}
 {const rows=parseCSV(csv.tide),areas=['馬公','湖西','白沙','西嶼','望安','七美'];let area=null,day=null;
  for(const r of rows){const d=tx(r[0]);
   if(d==='日期'){area={region:areas[out.tide.length]||('第'+(out.tide.length+1)+'區'),days:[]};out.tide.push(area);day=null;continue;}
   if(!area)continue;
   if(d){day={label:d.split(/\n/)[0].trim(),note:d.split(/\n/).slice(1).join(' ').trim(),items:[]};area.days.push(day);}
   if(!day||!tx(r[1]))continue;day.items.push({state:tx(r[1]),time:tx(r[2]),height:tx(r[4])});}}
 return out;}

function todayTW(){return new Date().toLocaleDateString('en-CA',{timeZone:'Asia/Taipei'});}
function dayWindow(from,to){const base=new Date(todayTW()+'T00:00:00Z').getTime();return s=>{const m=String(s).match(/(\d{4})\D(\d{1,2})\D(\d{1,2})/);if(!m)return false;const t=Date.UTC(+m[1],+m[2]-1,+m[3]);return t>=base+from*864e5&&t<=base+to*864e5;};}

function sync(list,fresh){const old=new Map(list.map(x=>[x.id,x])),ids=new Set(fresh.map(x=>x.id));let changed=fresh.length!==list.length;
 const next=fresh.map(f=>{const o=old.get(f.id);if(!o){changed=true;return f;}if(JSON.stringify(o)!==JSON.stringify(f)){changed=true;Object.assign(o,f);}return o;});
 const gone=list.filter(x=>!ids.has(x.id));gone.forEach(x=>x._gone22=true);next.forEach(x=>delete x._gone22);
 list.splice(0,list.length,...next,...gone);return changed;}
function syncDeities(fresh){const list=PENGHU_SOURCE.deities,old=new Map(list.map(d=>[d.id,d])),ids=new Set(fresh.map(d=>d.id));let changed=false;
 const next=fresh.map(f=>{const o=old.get(f.id);if(!o){changed=true;return f;}if(JSON.stringify(o.temples)!==JSON.stringify(f.temples)){changed=true;o.temples.splice(0,o.temples.length,...f.temples);}delete o._gone22;return o;});
 const gone=list.filter(d=>!ids.has(d.id));gone.forEach(d=>d._gone22=true);
 const added=next.filter(d=>!old.has(d.id));list.splice(0,list.length,...next,...gone);return {changed,added};}

function apply(data){if(!data||!Array.isArray(data.scenes)||!data.scenes.length)return false;
 const a=sync(PENGHU_SOURCE.scenes,data.scenes),b=sync(PENGHU_SOURCE.foods,data.foods||[]),d=data.deities&&data.deities.length?syncDeities(data.deities):{changed:false,added:[]};
 if(typeof COMPANIONS!=='undefined'&&typeof deityRole==='function'&&typeof ROLES!=='undefined')
  for(const dd of d.added)if(!COMPANIONS.some(c=>c.id===dd.id)){const kind=deityRole(dd.name),r=ROLES[kind];COMPANIONS.push({id:dd.id,name:dd.name,kind,icon:r.icon,role:r.label,cost:350+(hash(dd.id)%6)*100,desc:r.desc,source:dd});}
 LIVE.tide=data.tide||[];LIVE.parting=data.parting||[];LIVE.at=data.at||0;LIVE.ready=true;
 return a||b||d.changed;}

// 移除已從表上刪除、且沒有被目前進度用到的項目（已招募的夥伴、目前場景、背包內的餐食一律保留）。
function prune(){const e=(typeof player!=='undefined'&&player.extension)||{};let changed=false;
 const keepScene=new Set([e.sceneId,e.run&&e.run.sceneId].filter(Boolean)),keepFood=new Set(Object.keys(e.foodBag||{}).filter(k=>e.foodBag[k]>0)),keepDeity=new Set([...Object.keys(e.companions||{}).filter(k=>e.companions[k]>0),...(e.party||[])]);
 const cut=(list,keep)=>{const n=list.length;const rest=list.filter(x=>!x._gone22||keep.has(x.id));if(rest.length!==n){list.splice(0,n,...rest);changed=true;}};
 cut(PENGHU_SOURCE.scenes,keepScene);cut(PENGHU_SOURCE.foods,keepFood);cut(PENGHU_SOURCE.deities,keepDeity);
 if(typeof COMPANIONS!=='undefined'){const ok=new Set(PENGHU_SOURCE.deities.map(d=>d.id));const n=COMPANIONS.length;const rest=COMPANIONS.filter(c=>!c.source||ok.has(c.id));if(rest.length!==n){COMPANIONS.splice(0,n,...rest);changed=true;}}
 return changed;}

async function grab(name,gid){const urls=[`https://docs.google.com/spreadsheets/d/${BOOK}/export?format=csv&gid=${gid}&_=${Date.now()}`,`https://docs.google.com/spreadsheets/d/${BOOK}/gviz/tq?tqx=out:csv&headers=1&sheet=${encodeURIComponent(name)}&_=${Date.now()}`];
 for(const u of urls){const ctl=new AbortController(),timer=setTimeout(()=>ctl.abort(),20000);try{const r=await fetch(u,{cache:'no-store',signal:ctl.signal});if(r.ok){const t=await r.text();if(t&&!/^\s*</.test(t))return t;}}catch(e){}finally{clearTimeout(timer);}}
 return null;}

function refreshView(){try{if(typeof pageView!=='undefined'&&pageView!=='battle'&&typeof renderSystem==='function'){const a=document.activeElement;if(!a||!/INPUT|TEXTAREA|SELECT/.test(a.tagName))renderSystem();}if(typeof renderZoneUI==='function')renderZoneUI();}catch(e){}}

async function update(){if(!window.crypto||!crypto.subtle||!window.fetch)return;
 const csv={};for(const [k,[name,gid]] of Object.entries(TABS))csv[k]=await grab(name,gid);
 if(!csv.scenes||!csv.foods||!csv.temples)return;
 let data;try{data=await build(csv);}catch(e){return;}
 if(!data.scenes.length||!data.foods.length||!data.deities.length)return;
 if(!csv.parting){data.parting=LIVE.parting;}if(!csv.tide){data.tide=LIVE.tide;}
 try{localStorage.setItem(KEY,JSON.stringify(data));}catch(e){try{localStorage.setItem(KEY,JSON.stringify({...data,parting:[]}));}catch(e2){}}
 const changed=apply(data);const pruned=prune();if(changed||pruned)refreshView();else if(window.BEAR_LIVE_ON_TIDE)window.BEAR_LIVE_ON_TIDE();}

// 啟動時先套用上次讀到的內容（在夥伴與場景建立之前）。
try{const raw=localStorage.getItem(KEY);if(raw)apply(JSON.parse(raw));}catch(e){}
if(!(LIVE.tide&&LIVE.tide.length)&&window.BEAR_TIDE_BUILTIN){LIVE.tide=window.BEAR_TIDE_BUILTIN.tide||[];LIVE.parting=window.BEAR_TIDE_BUILTIN.parting||[];}
else if(!(LIVE.parting&&LIVE.parting.length)&&window.BEAR_TIDE_BUILTIN){LIVE.parting=window.BEAR_TIDE_BUILTIN.parting||[];}
window.addEventListener('load',()=>{try{if(prune())refreshView();}catch(e){}update();});
window.BEAR_LIVE_BUILD=build;window.BEAR_LIVE_APPLY=apply;window.BEAR_LIVE_PRUNE=prune;window.BEAR_LIVE_PARSE=parseCSV;
})();
