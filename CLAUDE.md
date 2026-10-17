# Claude 開發規則

這是「熊寶編年史 v22 戰況重製版」的可執行單機／PWA 專案。

1. 主角名稱固定「熊寶」，保留現有熊寶圖樣；介面使用繁體中文。
2. 延續使用者已確定的文字限制，保持所有介面與提示用語一致。
3. 保持免費與離線可玩，不引入付費 API、遠端登入或自動傳送訊息。
4. 玩家進度不得重置。資料結構變動需在 `migratePlayer`、`validateSave`、`applySave` 提供遷移並更新 `schemaVersion`。
5. 所有資源交易先檢查費用與空間，再一次提交；不得透過重複點擊、舊商品按鈕或舊任務 token 重複給獎。
6. 裝備評分依實際屬性，不因名稱或位階額外加分。鎖定、等級需求與同部位限制必須保留。
7. 夥伴不是只顯示名稱：招募後必須透過 `kind` 參與戰鬥或提供被動效果。
8. 不加入可執行任意字串的 `eval`、`new Function` 或跨視窗命令橋接。
9. 修改後執行 `node tests/run.cjs` 與 `node tests/combat-invariant.cjs`。這套測試使用最小 DOM，無法取代真實瀏覽器的畫面、鍵盤、安裝及離線驗收。
10. 發布快取更新時改 `sw.js` 的 CACHE 版本。避免遊戲中自動重新整理導致未保存進度遺失。

## 檔案分工

- `index.html`：頁面骨架、熊寶內嵌圖樣與視窗。
- `app.css`：完整響應式介面。
- `js/legacy-core.js`：v19 即時戰鬥基礎。
- `js/systems-v20.js`：v20 裝備、商會、技能與保存相容層。
- `js/penghu-data.js`：遊戲內建內容；穩定識別碼關係不可任意更名。
- `js/expansion-v21.js`：v21 鍛造、冒險、評分、神祇夥伴、餐食商會、技能與 UI。
- `js/handoff.js`：PWA 安裝按鈕、離線快取註冊與 `window.BearChronicleApp`（遊戲內已無 Claude 接手視窗，不可再加回）。
- `js/live-data.js`、`js/tide-data.js`：開啟時讀取最新景點、美食、廟宇、分海、潮汐；畫面不得出現任何來源字眼。
- `js/bestiary.js`：澎湖妖怪圖鑑與景點等級（使用者 2026-10-17 要求：景點有等級、各地妖怪名稱與招式不同、搭配地點說明與傳說）。
- `js/jobs.js`：熊熊轉職系統（初心熊 1–10、朦朧熊 11–30、戰熊／法熊 31–50、狂暴戰熊／靈玄法熊 51–85、戰熊王／玄熊王 86–100），職業存在 `player.extension.job`，加成逐階累進。
- `js/balance23.js`：戰鬥平衡（使用者要求）：減傷邊際遞減且與等級相關、上限 75%；體質回血每點 0.15；升級所需經驗為原本公式的 1000 倍（使用者要求升級速度降低 1000 倍）；前排 3 隻怪物才會攻擊；怪物等級一律在地點標示範圍內；10 級前在等級夠的地點怪物攻擊與生命打折（等級不變）。
- `js/gear23.js`：新掉落裝備的隨機詞綴（實際加屬性）與隨機技能傷害加成。
- `js/realm23.js`：各鄉市秘境（等級帶最高段）與深淵（再深 100 級），怪物生命、攻擊、防禦 ×100，經驗 ×20、掉寶 ×3。
- `js/ui23.js`：裝備欄單純呈現，點一下才展開屬性與強化按鈕。
- 等級上限 100000。手機戰鬥頁為「角色、戰況（含紀錄）、技能」，預設角色。
- `manifest.webmanifest`、`sw.js`：PWA 設定及離線快取（有網路一律抓最新檔案）。

## 程式介面

`window.BearChronicleApp` 為 API v1。函式包含 `getSnapshot()`、`getCatalog()`、`exportJSON()`、`importJSON(json)`、`dispatch(action, payload)`。

`getSnapshot()` 回傳深拷貝；請勿使用它來直接修改遊戲狀態。匯入進度需要使用者在遊戲內確認。

支援操作：`optimize`、`setProfile`、`craft`、`startAdventure`、`claimAdventure`、`recruit`、`trainSkill`、`buyFood`、`useFood`、`save`、`pause`。未列出的操作會被拒絕。

## v22 強制維護邊界

- `js/expansion-v22.js` 只在既有戰鬥之上新增呈現、成長、委託與遷移。禁止修改既有戰鬥時序、傷害公式、自動施放優先序、冷卻或掉落規則。
- 敵人生成例外：`js/bestiary.js` 依使用者要求換成澎湖妖怪（名稱、說明、招式）並讓景點決定敵人等級；屬性成長公式沿用原本。`tests/combat-invariant.cjs` 會先關閉妖怪圖鑑、平衡與裝備詞綴（`BESTIARY23`、`BALANCE23`、`GEAR23` 的 `enabled=false`）再比對原本戰鬥基準。妖怪不可使用神明、廟宇名稱。
- 90 位主祀夥伴各自以 deity ID 保存天賦，嚴禁回加六位已移除的舊夥伴。
- 主要設定：144 主動、24 被動、48 委託、每位 12 天賦節點；手機八個導覽入口及四個戰鬥分區。
- 設備端使用 `100dvh` 應用程式外框與獨立捲動容器，請勿還原為長頁三欄。
- 新操作介面額外支援 `learnTalent` 與 `claimCommission`，詳見 `js/expansion-v22.js`。
- `tests/fixtures` 是戰鬥相容性基準；不得為了隱藏非預期改動而重寫它。
