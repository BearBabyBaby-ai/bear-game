// 開啟流程：先讀最新的景點、美食、廟宇、分海與潮汐，讀完才載入遊戲（遊戲不內建這些資料）。
// 讀不到時只顯示提示、不載入遊戲，進度不會被改動。
(function(){
'use strict';
const GAME_SCRIPTS=['./js/legacy-core.js','./js/systems-v20.js','./js/expansion-v21.js','./js/handoff.js','./js/expansion-v22.js','./js/bestiary.js','./js/jobs.js','./js/balance23.js','./js/gear23.js','./js/realm23.js','./js/ui23.js'];
const ready=[],loaded=[];
// 遊戲程式是讀完資料後才載入，頁面的 DOMContentLoaded／load 已經過了：先收起來，全部載入後依原本順序執行。
const docAdd=document.addEventListener.bind(document),winAdd=window.addEventListener.bind(window);
document.addEventListener=function(type,fn,opt){if(type==='DOMContentLoaded')ready.push(fn);else docAdd(type,fn,opt);};
window.addEventListener=function(type,fn,opt){if(type==='load')loaded.push(fn);else if(type==='DOMContentLoaded')ready.push(fn);else winAdd(type,fn,opt);};
function restore(){document.addEventListener=docAdd;window.addEventListener=winAdd;}
function loadScript(src){return new Promise((ok,fail)=>{const s=document.createElement('script');s.src=src;s.async=false;s.onload=ok;s.onerror=()=>fail(new Error(src));document.body.appendChild(s);});}
function pageLoaded(){return document.readyState==='complete'?Promise.resolve():new Promise(ok=>winAdd('load',ok,{once:true}));}
function notice(text){let box=document.getElementById('boot-notice');if(!box){box=document.createElement('div');box.id='boot-notice';box.setAttribute('role','status');box.style.cssText='position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;padding:24px;background:rgba(20,16,12,.92);color:#fff;font-size:18px;line-height:1.6;text-align:center';document.body.appendChild(box);}box.textContent=text;return box;}
async function start(){
 const box=notice('熊寶正在整理澎湖的最新資訊…');
 try{await window.BEAR_LIVE_LOAD();}
 catch(e){restore();notice('目前讀不到最新資訊，請連上網路後重新開啟遊戲。');return;}
 for(const src of GAME_SCRIPTS)await loadScript(src);
 await pageLoaded();restore();
 for(const fn of ready)try{fn.call(document,new Event('DOMContentLoaded'));}catch(e){console.error(e);}
 for(const fn of loaded)try{fn.call(window,new Event('load'));}catch(e){console.error(e);}
 box.remove();}
window.BEAR_BOOT_SCRIPTS=GAME_SCRIPTS;
start();
})();
