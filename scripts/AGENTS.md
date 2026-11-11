# 頁面設計範圍

依使用者指示，除根目錄的 `mobile.html`（行動版）外，專案根目錄及其子資料夾內的 HTML 僅以電腦桌機版為設計與驗證目標。不需新增手機版斷點或滿寬例外；行動版獨立保留。

# 素材分類

`assets/` 僅依 `ancient`、`builds`、`cards`、`event`、`monster`、`potion`、`relic` 分類，不再建立 `offline`、`images`、`icons` 或 `previews` 頂層資料夾。共用素材依所屬內容分類並重用；卡圖原始素材放在 `cards/source`，產生卡圖放在 `cards/images`，共用圖示放在 `cards/icons`。下載圖片使用 `asset-paths.cjs`；驗證截圖只在執行驗證時產生於對應分類的 `previews` 子資料夾。

# 頁面檔名

桌機版根目錄檔名固定為 `ancient.html`、`builds.html`、`cards.html`、`event.html`、`monster.html`、`potion.html`、`relic.html`；行動版為 `mobile.html`。產生程式與連結使用上述短檔名。

# 資料分類

`data/` 僅使用 `ancient`、`builds`、`cards`、`event`、`monster`、`potion`、`relic` 七個分類目錄，不使用 offline 命名。分類清單為 `catalog.json`，原始 HTML 放在各分類的 `source/`，詳細內容 HTML 放在該分類目錄。各分類的 `assets.json` 保存素材對照，透過 `data-assets.cjs` 統一讀寫。

# 程式分類與執行

程式依七個分類存放。各頁入口為 `node scripts/<分類>/build-<分類>.cjs`（先古之民使用 `ancient/build-ancients.cjs`）。行動版入口為 `node scripts/builds/build-mobile-device.cjs`。共用導覽、配色、資料及素材工具歸於 `cards/`；共用目錄與詳細內容工具歸於 `event/`；行動版整合介面歸於 `builds/`。各目錄透過相對路徑重用共用程式，不複製。程式的工作目錄統一解析至專案根目錄。
