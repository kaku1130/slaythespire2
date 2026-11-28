# 頁面設計範圍

預設以電腦桌機版為設計與驗證目標，不另建獨立行動版。依使用者最新指示，Monster 頁面另維護非桌機滿寬排版、平板兩欄與手機單欄章節選單；遺物頁面八個遠古之民圖示排成兩列，每列四個；Ancient 文字按鈕位於圖示下方。各頁手機版導覽列隱藏 Game Info，僅保留六個分類圖示。

# 素材分類

`assets/` 依主頁檔名分類為 `characters`、`cards`、`monsters`、`potions`、`relics`、`enchantments`，不再建立 `offline`、`images`、`icons` 或 `previews` 頂層資料夾。共用素材依所屬內容分類並重用；卡圖原始素材放在 `cards/source`，產生卡圖放在 `cards/images`，共用圖示放在 `cards/icons`。下載圖片使用 `asset-paths.cjs`；驗證截圖只在執行驗證時產生於對應分類的 `previews` 子資料夾。

# 頁面檔名

桌機版根目錄檔名固定為 `monsters.html`、`characters.html`、`cards.html`、`potions.html`、`relics.html`、`enchantments.html`。產生程式與連結使用上述短檔名。

# 資料分類

`data/` 僅使用 `ancient`、`builds`、`cards`、`monster`、`potion`、`relic`、`enchantments` 分類目錄，不使用 offline 命名。分類清單為 `catalog.json`，原始 HTML 放在各分類的 `source/`，詳細內容 HTML 放在該分類目錄。各分類的 `assets.json` 保存素材對照，透過 `data-assets.cjs` 統一讀寫。

# 程式分類與執行

程式依既有六個分類及 `enchantments` 分類存放。各頁入口為 `node scripts/<分類>/build-<分類>.cjs`。共用導覽、配色、資料及素材工具歸於 `cards/`；共用目錄與詳細內容工具歸於 `event/`。各目錄透過相對路徑重用共用程式，不複製。程式的工作目錄統一解析至專案根目錄。

# 桌機主頁 CSS

每個桌機主頁只載入自己的 assets/<頁名>/<頁名>.css。產生程式依原本的套用順序將該頁的樣式合併至這個檔案。調整單一頁面時，請修改該頁的產生程式或專用樣式來源，並同步更新該頁 CSS。只有各頁都要改動時才調整共用樣式。

# 清理範圍

目前維護上述六個主頁，不再產生遠古之民主頁或詳細頁。遠古之民圖示放在 `assets/relics`，排序程式歸於 `scripts/relic` 分類；共用配色歸於 `cards` 分類。清理素材前應同時檢查頁面引用與產生程式依賴。

# Enchantments 頁面

使用 `enchantments.html`，程式、資料與素材分別位於 `scripts/enchantments/`、`data/enchantments/`、`assets/enchantments/`。搜尋列與卡片排版共用藥水頁面實作；保留來源的 icon、名稱、效果與 Found in，導覽圖示使用 Soul's Power。
