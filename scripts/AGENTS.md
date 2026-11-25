# 頁面設計範圍

依使用者指示，專案根目錄及其子資料夾內的 HTML 僅以電腦桌機版為設計與驗證目標。不需新增手機版斷點或滿寬例外；獨立行動版已移除，不再建置或驗證。

# 素材分類

`assets/` 僅依 `ancient`、`builds`、`cards`、`event`、`monster`、`potion`、`relic` 分類，不再建立 `offline`、`images`、`icons` 或 `previews` 頂層資料夾。共用素材依所屬內容分類並重用；卡圖原始素材放在 `cards/source`，產生卡圖放在 `cards/images`，共用圖示放在 `cards/icons`。下載圖片使用 `asset-paths.cjs`；驗證截圖只在執行驗證時產生於對應分類的 `previews` 子資料夾。

# 頁面檔名

桌機版根目錄檔名固定為 `ancients.html`、`characters.html`、`cards.html`、`potions.html`、`relics.html`。產生程式與連結使用上述短檔名。

# 資料分類

`data/` 僅使用 `ancient`、`builds`、`cards`、`monster`、`potion`、`relic` 六個分類目錄，不使用 offline 命名。分類清單為 `catalog.json`，原始 HTML 放在各分類的 `source/`，詳細內容 HTML 放在該分類目錄。各分類的 `assets.json` 保存素材對照，透過 `data-assets.cjs` 統一讀寫。

# 程式分類與執行

程式依七個分類存放。各頁入口為 `node scripts/<分類>/build-<分類>.cjs`（先古之民使用 `ancient/build-ancients.cjs`）。共用導覽、配色、資料及素材工具歸於 `cards/`；共用目錄與詳細內容工具歸於 `event/`。各目錄透過相對路徑重用共用程式，不複製。程式的工作目錄統一解析至專案根目錄。

# 桌機主頁 CSS

每個桌機主頁只載入自己的 assets/<頁名>/<頁名>.css。產生程式依原本的套用順序將該頁的樣式合併至這個檔案。調整單一頁面時，請修改該頁的產生程式或專用樣式來源，並同步更新該頁 CSS。只有各頁都要改動時才調整共用樣式。

# 清理範圍

目前僅維護上述五個主頁及先古之民詳細頁。`assets/monster/` 與 `data/monster/assets.json` 僅存放其他頁仍需使用的共用圖示及對照資料，不產生本機怪物頁。清理素材前應同時檢查頁面引用與產生程式依賴。
