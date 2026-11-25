# Slay the Spire 2

本機靜態頁面：

- [單一網址入口](index.html)：保留固定導覽列，在同一網址切換下方五個頁面；原有 HTML 仍可獨立開啟。

- [先古之民](ancients.html)
- [角色](characters.html)
- [卡牌](cards.html)
- [藥水](potions.html)
- [遺物](relics.html)

使用 Node.js 重新產生頁面：

```powershell
node scripts/cards/build-cards.cjs
node scripts/builds/build-builds.cjs
node scripts/ancient/build-ancients.cjs
node scripts/potion/build-potion.cjs
node scripts/relic/build-relic.cjs
```

原有頁面更新後，執行 `node scripts/cards/build-index.cjs` 同步單一入口的內容。
單一入口可直接開啟本機檔案，也可放在靜態網站；驗證指令為 `node scripts/cards/verify-index.cjs`。

卡牌產生程式也會同步產生角色頁面。assets、data、scripts 保留這五頁及其重建依賴；cards、event 目錄含共用工具，monster 目錄僅保留導覽圖示與先古之民使用的共用圖示資料。

本機瀏覽器完整性檢查：`node scripts/cards/verify-site.cjs`（使用 Codex 環境提供的 Playwright 與本機 Chrome）。

角色頁資料來源：[Untapped Characters](https://sts2.untapped.gg/en/characters)。`data/builds/source/` 保存來源快照，`data/builds/characters.json` 與 `assets/builds/images/` 保存離線內容及圖片。角色頁沿用 `characters.html` 與既有重建入口；重建不需連線。更新來源時執行 `python scripts/builds/sync-characters.py --refresh`，再執行 `node scripts/builds/build-builds.cjs`。

角色頁離線檢查：`node scripts/builds/verify-characters.cjs`（斷網測試角色切換、詳細內容、卡牌、圖片及全站角色導覽）。

卡牌 Tier 區塊顯示既有 Jorbs 評級與離線評語。更新評語：`node scripts/cards/sync-creator-comments.cjs`；使用已下載來源重建：加上 `--cached`。再執行 `node scripts/cards/build-card1.cjs --promote` 更新卡牌頁。

Jorbs 評語的繁體中文機器翻譯保存在 `data/cards/creator-comments-zh-TW.json`，英文更新後執行 `python scripts/cards/sync-comment-translations.py`，再重建卡牌頁與單一入口。翻譯快取使用英文內容雜湊檢查更新；瀏覽網頁時不連線翻譯服務。

各頁內容中的卡牌、遺物及藥水連結由 `scripts/cards/content-links.cjs` 統一導向 Untapped 英文詳細頁，並以新分頁開啟。驗證：`node scripts/cards/verify-content-links.cjs`。
