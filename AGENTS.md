# 頁面與首頁內嵌版本同步

每次修改頁面內容、樣式、資料或產生程式後，先重新產生受影響的頁面，再執行 `node scripts/cards/build-index.cjs`，同步更新 `assets/index/index-pages.js` 與 `index.html` 的版本引用。若有多個受影響頁面，必須全部產生完成後再重建首頁。

驗證時必須從 `index.html` 進入受影響頁面，確認首頁 iframe 顯示最新內容與排版；不能只驗證獨立 HTML 頁面。涉及手機版時，也必須驗證首頁內嵌頁面的手機寬度。

修改頁面產生程式時，另遵循 `scripts/AGENTS.md` 的分類與建置規範。
