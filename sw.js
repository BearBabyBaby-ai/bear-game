const CACHE='bear-chronicle-v22-20261017-l';
const FILES=["./", "./index.html", "./app.css", "./manifest.webmanifest", "./assets/icon-192.png", "./assets/icon-512.png", "./js/legacy-core.js", "./js/systems-v20.js", "./js/penghu-data.js", "./js/tide-data.js", "./js/live-data.js", "./js/expansion-v21.js", "./js/handoff.js", "./js/expansion-v22.js", "./js/bestiary.js", "./js/jobs.js", "./js/balance23.js", "./js/gear23.js", "./js/realm23.js", "./js/ui23.js"];
// 安裝後立即生效；有網路時一律抓最新檔案，沒網路才用手機裡存的檔案。
self.addEventListener('install',event=>{self.skipWaiting();event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(FILES)).catch(()=>{}));});
self.addEventListener('activate',event=>event.waitUntil(Promise.all([caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('bear-chronicle-')&&key!==CACHE).map(key=>caches.delete(key)))),self.clients.claim()])));
self.addEventListener('fetch',event=>{
 const req=event.request;
 if(req.method!=='GET'||new URL(req.url).origin!==self.location.origin)return;
 event.respondWith(fetch(req.mode==='navigate'?req:new Request(req,{cache:'no-cache'})).then(response=>{
  if(response.ok){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(req.mode==='navigate'?'./index.html':req,copy));}
  return response;
 }).catch(()=>caches.match(req.mode==='navigate'?'./index.html':req,{ignoreSearch:true}).then(hit=>hit||caches.match(req))));
});
