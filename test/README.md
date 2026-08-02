# 本地測試工具

本目錄包含用於本地測試聚合功能的完整工具，可以無需部署到 Cloudflare 就驗證效果。

## 快速開始

### 方式一：使用 Wrangler 本地模式（推薦）

這是最真實的測試方式，體驗與生產環境完全一致。

1. **生成模擬數據 SQL**
   ```bash
   # 在項目根目錄
   node test/generate-sql.js
   ```

2. **初始化數據庫結構**
   （如果數據庫是空的，先啟動一次 dev 來自動創建表）
   ```bash
   # 在項目根目錄
   npm run dev
   # 訪問一次 http://localhost:8787 會自動初始化表結構
   # 然後按 Ctrl+C 停止
   ```

3. **導入模擬數據**
   ```bash
   # 執行 SQL 導入數據
   wrangler d1 execute server-monitor-db --file=test/mock-data.sql
   ```

4. **啟動本地開發服務器**
   ```bash
   npm run dev
   ```

5. **訪問界面**
   - 首頁儀表盤: http://localhost:8787
   - 服務器詳情頁: http://localhost:8787/?id=s550e8400-e29b-41d4-a716-446655440001
   - 後臺管理: http://localhost:8787/admin

## 模擬數據說明

### 服務器配置

- **US-East-Fast** (`s550e8400-e29b-41d4-a716-446655440001`)
  - 位置: 美國東部
  - 上報間隔: 60 秒
  - 配置: 4 核 / 32G RAM

- **JP-Tokyo-Stable** (`550e8400-e29b-41d4-a716-446655440002`)
  - 位置: 日本東京
  - 上報間隔: 120 秒
  - 配置: 2 核 / 16G RAM

### 數據特點

- 72 小時完整歷史數據
- 指標帶有真實波動（白天負載高、晚上負載低）
- 包含完整的 CPU、RAM、網絡、Ping 等指標
- 聚合表保持空，方便測試聚合邏輯

## 文件說明

- `generate-sql.js` - 生成 SQL 格式模擬數據的腳本
- `mock-data.sql` - 生成後的 SQL 文件（運行腳本後產生）
- `README.md` - 本文檔

## 測試流程建議

1. **測試儀表盤顯示** - 訪問 http://localhost:8787 查看是否正常顯示兩臺服務器
2. **測試歷史圖表** - 點擊服務器查看詳情頁，驗證歷史數據展示