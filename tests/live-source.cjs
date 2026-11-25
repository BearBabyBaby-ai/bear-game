// 測試用：直接讀最新資料（與遊戲相同的 js/live-data.js），輸出 JSON 給 dom.cjs；不在儲存庫保存任何資料。
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const code=fs.readFileSync(path.join(__dirname,'../js/live-data.js'),'utf8');
const store=new Map();
const ctx={console,fetch,AbortController,setTimeout,clearTimeout,TextEncoder,crypto:require('node:crypto').webcrypto,localStorage:{getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,v),removeItem:k=>store.delete(k)},addEventListener(){}};
ctx.window=ctx;vm.createContext(ctx);vm.runInContext(code,ctx);
ctx.BEAR_LIVE_LOAD().then(src=>{process.stdout.write(JSON.stringify({source:src,live:{tide:ctx.BEAR_LIVE.tide,parting:ctx.BEAR_LIVE.parting,at:ctx.BEAR_LIVE.at,ready:true}}));})
 .catch(e=>{console.error('讀不到資料：'+e.message);process.exit(1);});
