
// App 程式介面、PWA 安裝按鈕與離線快取註冊。
const APP_ACTIONS={
 optimize:()=>optimizeGear(),
 setProfile:p=>{if(!PROFILES[p.profile])throw Error('invalid-profile');ext().profile=p.profile;changed();return true;},
 craft:p=>craftGear(p),
 startAdventure:p=>startAdventure(p.sceneId,p.kind),
 claimAdventure:p=>claimAdventure(p.token),
 recruit:p=>recruit(p.id),
 trainSkill:p=>trainSkill(p.id),
 buyFood:p=>buyFood(p.id),
 useFood:p=>useFood(p.id),
 save:()=>saveGame(true),
 pause:p=>{ext().paused=!!p.paused;changed();return ext().paused;}
};
window.BearChronicleApp=Object.freeze({
 apiVersion:1,version:'21.0.0',
 getSnapshot:()=>JSON.parse(JSON.stringify(makeSave())),
 getCatalog:()=>({companions:COMPANIONS.map(c=>({id:c.id,name:c.name,role:c.role})),scenes:PENGHU_SOURCE.scenes.map(s=>({id:s.id,name:s.name,region:s.region})),foods:PENGHU_SOURCE.foods.map(f=>({id:f.id,name:f.name,category:f.category})),skills:Object.keys(EXT_SKILLS).map(id=>({id,name:SKILLS[id].name,maxLevel:MAX_SKILL_LEVEL}))}),
 exportJSON:()=>JSON.stringify(makeSave(),null,2),
 importJSON:(json)=>{const data=validateSave(JSON.parse(json));if(!confirm('確定匯入這份進度並取代目前紀錄？'))return false;applySave(data);saveGame(true);changed('進度已匯入。');return true;},
 dispatch:(action,payload={})=>{if(!Object.hasOwn(APP_ACTIONS,action))throw Error('unsupported-action');return APP_ACTIONS[action](payload);}
});
let installPrompt=null;
document.addEventListener('DOMContentLoaded',()=>{
 document.getElementById('install-button').onclick=async()=>{if(installPrompt){await installPrompt.prompt();await installPrompt.userChoice;installPrompt=null;document.getElementById('install-button').hidden=true;}else notify('App 可安裝時會顯示安裝按鈕；也可在瀏覽器選單選擇加入主畫面。');};
 if('serviceWorker'in navigator&&location.protocol!=='file:')navigator.serviceWorker.register('./sw.js').catch(()=>{});
});
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();installPrompt=e;document.getElementById('install-button').hidden=false;});
window.addEventListener('appinstalled',()=>{installPrompt=null;document.getElementById('install-button').hidden=true;});

