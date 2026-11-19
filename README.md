# Slay the Spire 2

本機靜態頁面：

- [先古之民](ancient.html)
- [流派](build.html)
- [卡牌](card.html)
- [藥水](potion.html)
- [遺物](relic.html)

使用 Node.js 重新產生頁面：

```powershell
node scripts/cards/build-cards.cjs
node scripts/builds/build-builds.cjs
node scripts/ancient/build-ancients.cjs
node scripts/potion/build-potion.cjs
node scripts/relic/build-relic.cjs
```

卡牌產生程式也會同步產生流派頁面。assets、data、scripts 保留這五頁及其重建依賴；cards、event 目錄含共用工具，monster 目錄僅保留導覽圖示與先古之民使用的共用圖示資料。

本機瀏覽器完整性檢查：`node scripts/cards/verify-site.cjs`（使用 Codex 環境提供的 Playwright 與本機 Chrome）。
