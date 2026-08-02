# [CF-Server-Monitor](https://github.com/huilang-me/CF-Server-Monitor)

一個基於 Cloudflare Workers + D1 + Durable Objects 的多服務器監控探針系統，支持實時監控、歷史數據查看、延遲追蹤、地圖展示等功能。兼容主流 Linux 系統、Alpine Linux、OpenWrt、macOS（Intel / Apple Silicon）、群暉、Windows 系統。

**演示地址**：<https://demo.huilang.me/>

**當前Workers版本：V2.8.1 Beta4; Agent版本：1.3.8**

> [!IMPORTANT]
> V2.7.10 加入了 CSP 內容安全策略。Workers 環境通過 HTTP Response Header 下發 CSP，默認只允許同源資源和必要的 Cloudflare/Google Fonts 資源；
>
> 第三方背景圖、外部 CSS/JS、字體、圖片等資源會被瀏覽器攔截，需要在管理後臺 → 外觀 → CSP 設置中加入可信域名白名單後才能加載。
> 
> 這是基於安全考慮，用於降低 XSS、數據注入和未知第三方資源風險。

> [!NOTE]
> **對比其他探針的優勢**
>
> - 免費託管在 Cloudflare，穩定性比自己服務器還高，超出免費額度也不扣費。目前支持 60+ 臺監控，調整成 120 秒上報間隔後可以翻倍。
> - 安全：無 WebSSH、無命令下發、單向上報，沒有所謂的“主控”；Workers 項目只是一個純收集數據和展示的平臺。
> - 客戶端只需一個非常簡單的 [install.sh](https://github.com/huilang-me/CF-Server-Monitor/blob/main/public/install.sh) 腳本，不依賴 Go 之類的語言，原生支持，非常輕量。
> - 其他探針該有的功能基本都有，後續將繼續完善。

<details>
<summary>更新記錄</summary>

## Workers 版本更新

- V2.8.1 優化長時間歷史查詢的 D1 讀行，增加服務器負載通知，優化主題商店接口。主題新增服務器價值統計面板。主題新增Mikus模式。
- V2.8.0 新增主題商店功能，支持一鍵切換主題。
- V2.7 版本進行了全面重構與功能增強：數據庫層面將每日清理改為每月表輪換，減少 D1 消耗，同時優化數據結構使寫入減半並支持 60+ 服務器監控；新增國內四線路丟包率監控及歷史圖表、GPU 字段展示、服務器到期提醒、多分區磁盤統計、計費與自動續費、tags/note 字段、iOS Scriptable 小組件等功能；通知層面新增釘釘、OneBot(QQ)、飛書、Bark 支持，並重構告警模塊；交互層面新增環形圖顯示模式、服務器導入導出、批量推送（5秒/批）、服務器參數下發，優化 Ping 統計改為中位數；安全與兼容方面加入 CSP、JWT 自動生成、跨域配置、多站點驗證碼登錄、macOS 修復，並簡化安裝流程；探針與運維方面優化客戶端腳本減少流量消耗，新增 Agent 自動更新（默認關閉）、GitHub 自動同步及 Workers/Agent 版本升級提示，增加 OS 圖標顯示，壓縮定時任務從 4 個減為 2 個以規避免費額度限制，並修復月度任務導致索引丟失等嚴重 Bug。
- V2.6 版本重點優化了性能與流量統計體系：將 D1 寫入消耗降低 50%，新增月流量統計功能（需後臺手動升級數據庫並設置重置日期）及月流量校正、首頁流量展示；交互層面新增自定義 Ping 設置、上報間隔配置、詳情頁實時網速展示，並修復啟動時間獲取錯誤、TCP/UDP 上報格式問題、網卡流量誤統計及 Alpine 環境 UDP 連接數統計錯誤；部署兼容性方面重構 OpenWrt 安裝腳本並新增 OpenRC 服務支持，同時修復方式一部署同步後丟失 API_SECRET 的問題及地圖顯示異常。部分修復需重新安裝腳本生效，2.6.4/2.6.0 升級後務必手動升級數據庫結構。
- V2.5.0 增加客戶端上報數據後，在不佔用D1消耗的情況下，前端WebSocket實時刷新數據
- V2.4.0 版本主要優化了D1讀寫佔用，使項目消耗大大降低，以及增加了防護避免被刷。


## Agent 版本更新
- V1.3.8 修復 8/9 月賬期計算中前導零導致的 Shell 八進制解析錯誤
- V1.3.7 添加雙棧IP獲取
- V1.3.6 添加指定網卡選項，支持指定一個或多個網卡統計網速和月流量，留空保持。優化硬盤統計邏輯。
- V1.3.5 各安裝腳本新增採樣數據中間變量，拆分完整指標和基礎採樣字段；新增服務器級 `interface` 參數，支持指定一個或多個網卡統計網速和月流量，留空保持自動彙總
- V1.3.4 添加緩存機制減少資源消耗,新增內核版本指標字段
</details>

## ✨ 功能特點

- 📊 **實時監控**：CPU、GPU、內存、磁盤、網絡、進程數、連接數、負載均衡
- 📈 **歷史圖表**：支持 7 天曆史數據查看
- 🌍 **全球地圖**：可視化展示服務器分佈
- 🔔 **離線告警**：支持 Telegram、企業微信 / 飛書 / Bark / 釘釘 / OneBot 通知
- 📱 **響應式**：支持桌面端和移動端
- 🔄 **自動部署**：GitHub Actions 一鍵部署
- 🗺️ **網絡質量追蹤**：國內電信/聯通/移動/字節延遲與丟包率監測
- 🔒 **服務器隱藏**：可設置特定服務器對非登錄用戶隱藏
- ↕️ **拖拽排序**：後臺拖拽調整服務器顯示順序
- 🌐 **雙語支持**：支持中文和英文界面自由切換
- 🧩 **多站點支持**：可配置多個 API 站點聚合展示，詳情頁與後臺按站點獨立訪問
- 🧪 **本地測試**：支持本地模擬數據生成，方便開發和測試
- 🔐 **Turnstile 驗證**：集成 Cloudflare Turnstile 人機驗證，增強 API 安全性
- 🔑 **JWT 認證**：登錄系統採用 JWT token 認證，支持自定義密鑰
- 🛡️ **CSP 安全策略**：默認限制第三方靜態資源加載，可在後臺按需添加可信白名單
- 🎨 **主題商店**：後臺可選擇第三方主題和版本，Workers 僅反代主題 `index.html` 與 `assets/`
- 📉 **額度查詢**：後臺可查詢 Cloudflare D1 與 Workers 當日/昨天用量
- ⚡ **實時推送**：基於 Durable Objects + WebSocket，探針上報後頁面立即刷新，無輪詢延遲

## 🚀 快速開始

### 前置要求

- [Cloudflare 賬戶](https://dash.cloudflare.com/)
- [GitHub 賬戶](https://github.com/)

<details>
<summary>方式一：Cloudflare Workers 連接GitHub倉庫（推薦使用，方便同步）圖文教程 -> https://huilang.me/cf-server-monitor-setup/</summary>

### 第一步：Fork 項目

點擊右上角 **Fork** 按鈕，將項目 Fork 到你的 GitHub 賬戶。

### 第二步：新建 Cloudflare Workers

1. 登錄 [Cloudflare 控制檯](https://dash.cloudflare.com/)
2. 進入 **[Workers & Pages](https://dash.cloudflare.com/?to=/:account/workers-and-pages)**
3. 點擊 **Create application**
4. 選擇 Continue with GitHub（第一次使用需要連接 GitHub 賬戶），選擇本項目
5. Project Name填寫：`cf-server-monitor`
6. Build command 填寫：`npm run build:frontend`
7. Deploy command 保留默認值：`npx wrangler deploy`
8. 點擊 **Deploy**，成功會在底部顯示`✨ Success! Build completed.`

### 第三步：配置環境變量

1. 在當前Workers & Pages頁面，點擊 **Settings**
2. 在Variables and secrets找到API\_SECRET，點右側編輯，填寫密碼（建議使用隨機數,不要包含特殊字符比如%），點Deploy保存部署，等待30秒左右部署完成

</details>

<details>
<summary>方式二：GitHub Action 自動部署</summary>

### 第一步：Fork 項目

點擊右上角 **Fork** 按鈕，將項目 Fork 到你的 GitHub 賬戶。

### 第二步：創建 D1 數據庫

1. 登錄 [Cloudflare 控制檯](https://dash.cloudflare.com/)
2. 進入 **[Workers & Pages](https://dash.cloudflare.com/?to=/:account/workers-and-pages)**  → **[D1 SQL Database](https://dash.cloudflare.com/?to=/:account/workers/d1)**
3. 點擊 **Create database**
4. 數據庫名稱填寫：`server-monitor-db`
5. 點擊 **Create**
6. 記錄下生成的 **Database ID**，稍後會用到

### 第三步：獲取 Cloudflare 配置

#### 獲取 Account ID

**方式一：從右側面板獲取**

1. 打開 [Cloudflare Dashboard](https://dash.cloudflare.com/?to=/:account/workers-and-pages)
2. 在右側面板找到 **Account ID**
3. 複製保存

**方式二：從 URL 中獲取**

- 登錄後訪問任意 Cloudflare 頁面，例如 [Workers & Pages](https://dash.cloudflare.com/?to=/:account/workers-and-pages)
- URL 中 `dash.cloudflare.com/` 之後的那串字符就是 Account ID

#### 獲取 API Token

1. 打開 [API Tokens 頁面](https://dash.cloudflare.com/profile/api-tokens)
2. 點擊 **Create Token/創建令牌**
3. 選擇（**Edit Cloudflare Workers/編輯 Cloudflare Workers**）模板
4. 在 **Account Resources/帳戶資源** 選擇你的賬戶
5. 點擊 **Continue to summary/繼續以顯示摘要**→ **Create Token/創建令牌**
6. 複製生成的 Token（只顯示一次！）

### 第四步：配置 GitHub Secrets

1. 打開你 Fork 的 GitHub 倉庫
2. 進入 **Settings** → **Secrets and variables** → **Actions**
3. 點擊 **New repository secret**，依次添加以下 5 個密鑰：

| Secret 名稱        | 值                  | 說明                                     |
| ---------------- | ------------------ | -------------------------------------- |
| `CF_API_TOKEN`   | 第三步獲取的 Token       | Cloudflare API 令牌                      |
| `CF_ACCOUNT_ID`  | 第三步獲取的 ID          | Cloudflare 賬戶 ID                       |
| `API_USER_NAME`  | 自定義用戶名（非必填）        | 管理後臺用戶名 新版已移除，默認用戶名admin               |
| `API_SECRET`     | API 認證密鑰（必填）       | 探針認證密鑰 & 默認管理後臺密碼 建議使用隨機密碼,不要包含特殊字符比如% |
| `D1_DATABASE_ID` | 第二步獲取的 Database ID | D1 數據庫 ID                              |
| `API_BASE`       | API 域名（非必填）        | 多站點模式下的 API 地址，多個用逗號分隔                    |
| `CSP_STATIC`     | 靜態文件域名（非必填）       | 額外的 CSP 靜態資源白名單，多個用逗號分隔；用於第三方背景圖、CSS、JS、字體、圖片等 |
| `CSP_API`        | API 域名（非必填）        | 額外的 CSP API 白名單，多個用逗號分隔；用於允許前端連接第三方 API/WebSocket |

### 第五步：部署

#### 方式一：自動部署

推送代碼到 `main` 分支，GitHub Actions 會自動部署。在倉庫的 **Actions** 標籤頁可查看部署進度。

#### 方式二：手動部署

也可以通過 GitHub Actions 手動觸發部署：

1. 進入你的 GitHub 倉庫頁面
2. 點擊頂部的 **Actions** 標籤
3. 在左側工作流列表中選擇 **Deploy to Cloudflare Workers**
4. 點擊右側的 **Run workflow** 按鈕
5. 選擇分支（默認選擇 `main`）
6. 點擊 **Run workflow** 開始部署

部署進度可在 **Actions** 標籤頁中查看。

</details>

<details>
<summary>方式三：一鍵部署（比較簡單，但不推薦，不方便更新）</summary>

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/huilang-me/CF-Server-Monitor)

新用戶點擊一鍵部署

修改`API_SECRET`，建議使用隨機密碼,不要包含特殊字符比如%，登錄密碼在登錄後修改，建議和API\_SECRET不同。

在build command中填入 `npm run build:frontend`，其他保持默認

點擊部署即可

</details>

## 📊 使用說明

<details>
<summary>訪問管理後臺</summary>

部署成功後，訪問管理後臺：

```
https://你的項目名.你的子域.workers.dev/admin
```

- 用戶名：默認admin，如果設置了環境變量 `API_USER_NAME`，則使用該值
- 密碼：你設置的 `API_SECRET`

**登錄後務必修改用戶名和密碼，以確保安全。** 強烈建議登錄密碼和探針認證密鑰不同。

> **提示**：項目名和子域可以在 Cloudflare Workers & Pages 頁面找到。建議綁定域名，避免國內無法訪問

</details>

<details>
<summary>添加服務器監控</summary>

### 在管理後臺添加服務器

1. 進入管理後臺 `/admin`
2. 在"服務器名稱"輸入框填寫名稱
3. 點擊 **+ 添加服務器**
4. 點擊新服務器旁的 **📋** 按鈕複製安裝命令

### 參數說明

| 參數                  | 說明                           | 默認值    |
| ------------------- | ---------------------------- | ------ |
| `-id`               | 服務器唯一標識符（必填）                 | -      |
| `-secret`           | API 認證密鑰（必填）                 | -      |
| `-url`              | Worker 上報地址（必填）              | -      |
| `-collect_interval` | 數據採集間隔（秒），`0` 表示不額外採集並使用單條上報 | `0`    |
| `-interval`         | 數據上報間隔（秒）                    | `60`   |
| `-ct`               | 自定義CT測試節點，支持 `host[:port]` | 默認節點   |
| `-cu`               | 自定義CU測試節點，支持 `host[:port]` | 默認節點   |
| `-cm`               | 自定義CM測試節點，支持 `host[:port]` | 默認節點   |
| `-bd`               | 自定義BD測試節點，支持 `host[:port]` | 默認節點   |
| `-reset_day`        | 流量重置日（1-31）                  | `1`    |
| `-rx_correction`    | 下行流量校正（GB，直接設置當月下行數據）        | -      |
| `-tx_correction`    | 上行流量校正（GB，直接設置當月上行數據）        | -      |

> **注意**：`-collect_interval` 控制本機額外採集頻率，`-interval` 控制向 Worker 上報頻率。默認 `0` 為兼容模式：不額外採集，只按上報間隔發送單條數據；設置為 `1` 時才會 1 秒採集、按上報間隔批量發送。上報間隔越短，API 調用和數據庫寫入越多。

</details>

<details>
<summary>升級 Cloudflare Workers</summary>

根據您使用的安裝方式，選擇對應的升級方法：

### 方式一/方式二：Fork 後通過 GitHub 同步（推薦）

無論你使用 Cloudflare Workers 連接 GitHub 倉庫，還是使用 GitHub Action 自動部署，升級方式相同：同步上游倉庫即可。

#### 自動同步（推薦）

建議啟用自動同步功能，系統會每天自動同步上游倉庫的最新代碼：

1. 進入你 Fork 的 GitHub 倉庫頁面
2. 點擊 **Actions** 標籤
3. 首次使用時，點擊 **"I understand my workflows, go ahead and enable them"** 啟用 Actions
4. 找到 **Upstream Sync** 工作流，點擊進入
5. 點擊 **Run workflow** 手動觸發一次，確認同步正常工作

啟用後，系統每天 UTC 0:00（北京時間 8:00）會自動檢測上游倉庫是否有新提交，有則自動合併到你的 `main` 分支。

> **注意**：如果同步失敗，提示"由於上游倉庫的 workflow 文件變更，導致 GitHub 自動暫停了本次自動更新"，請前往倉庫頁面點擊 **Sync Fork** → **Update branch** 手動執行一次同步，然後再次啟用 Actions。

#### 手動同步

如果需要立即同步，可以手動操作：

1. 進入你 Fork 的 GitHub 倉庫頁面
2. 點擊 **Sync fork** → **Update branch** 同步上游更新

或者在 **Actions** 標籤頁中點擊 **Upstream Sync** → **Run workflow** 手動觸發。

**部署觸發方式**：

- **Cloudflare Workers 連接 GitHub 倉庫**：同步後 Cloudflare 會自動檢測到代碼變更並重新部署
- **GitHub Action 自動部署**：同步後 GitHub Actions 會自動觸發部署，可在 **Actions** 標籤頁查看進度

### 方式三：一鍵部署

一鍵部署方式升級較為麻煩，建議重新部署：

1. 訪問 [一鍵部署頁面](https://deploy.workers.cloudflare.com/?url=https://github.com/huilang-me/CF-Server-Monitor)
2. 選擇已存在的項目進行更新
3. 在 build command 中填入 `npm run build:frontend`
4. 點擊部署

> **注意**：一鍵部署方式不方便同步更新，建議遷移到方式一。

</details>

<details>
<summary>升級探針</summary>

當有新版本部署成功後，可以通過以下命令升級探針，升級過程會自動保留原有配置：

```bash
# Linux
curl -sL https://你的項目.你的子域.workers.dev/install.sh | bash -s install
# Alpine
curl -sL https://你的項目.你的子域.workers.dev/install-alpine.sh | sh -s install
# OpenWrt
curl -sL https://你的項目.你的子域.workers.dev/install-openwrt.sh | sh -s install
# macOS
curl -sL https://你的項目.你的子域.workers.dev/install-mac.sh | sudo bash -s install
# Windows
irm https://你的項目.你的子域.workers.dev/cf-server-monitor.ps1 -OutFile cf-server-monitor.ps1; powershell -ExecutionPolicy Bypass -File .\cf-server-monitor.ps1 install
```

> **V2.7.9 及以上說明**：從 V2.7.8 或更早版本升級後，請重新安裝一次探針以啟用參數下發能力。之後在後臺修改服務器參數會自動下發到探針，無需每次重新安裝；受上報間隔和緩存影響，最長約 240 秒才能看到效果。

可以在服務器編輯配置中啟用自動更新。首次啟用，或修改探針上報地址/API_SECRET/開啟自動更新，需要重新複製並執行該服務器的安裝命令；後續自動更新會沿用本地保存的配置。

</details>

<details>
<summary>卸載探針</summary>

```bash
# Linux
curl -sL https://你的項目.你的子域.workers.dev/install.sh | bash -s uninstall
# Alpine
curl -sL https://你的項目.你的子域.workers.dev/install-alpine.sh | sh -s uninstall
# OpenWrt
curl -sL https://你的項目.你的子域.workers.dev/install-openwrt.sh | sh -s uninstall
# macOS
curl -sL https://你的項目.你的子域.workers.dev/install-mac.sh | sudo bash -s uninstall
# Windows
irm https://你的項目.你的子域.workers.dev/cf-server-monitor.ps1 -OutFile cf-server-monitor.ps1; powershell -ExecutionPolicy Bypass -File .\cf-server-monitor.ps1 uninstall
```
</details>

<details>
<summary>安全增強</summary>

### Turnstile 配置（可選）

如需啟用 Turnstile 人機驗證，可用於基本攔截惡意攻擊，避免額度超出，需在管理後臺配置：

1. 登錄 [Cloudflare Turnstile](https://dash.cloudflare.com/?to=/:account/turnstile)
2. 創建站點，獲取 **Site Key** 和 **Secret Key**
3. 在管理後臺 → 全局設置中啟用 Turnstile 並填入密鑰

### JWT 配置（可選）

如需自定義 JWT 密鑰：

1. 生成一個至少 32 位的隨機字符串作為 JWT Secret
2. 在管理後臺 → 全局設置 → 安全設置中填入 JWT Secret
3. 保存後系統將使用自定義密鑰進行 token 簽名

### CORS 跨域配置（可選）

如需允許特定域名跨域訪問 Workers API，可配置允許的來源：

1. 在 Workers & Pages 頁面的 **Settings** → **Variables and secrets** 中添加 `CORS_ALLOWED_ORIGINS`
2. 值設置為允許跨域的域名，多個域名用逗號分隔，例如：`https://example.com,https://www.example.com`
3. 不設置此變量或留空時，默認僅允許同源請求

### CSP 內容安全策略配置（可選）

Content Security Policy (CSP) 是一種安全層，用於檢測和緩解某些類型的攻擊，包括跨站腳本 (XSS) 和數據注入攻擊。

項目默認啟用 CSP，並採用偏保守的默認策略：除了同源資源和內置必要域名外，第三方靜態資源默認會被瀏覽器攔截。這包括：

- 第三方背景圖，例如 `https://cdn.example.com/bg.webp`
- 外部 CSS，例如 `<link rel="stylesheet" href="https://cdn.example.com/theme.css">`
- CSS 裡的 `@import`，例如 `@import url('https://cdn.example.com/theme.css')`
- 外部 JS，例如 `<script src="https://cdn.example.com/demo.js"></script>`
- 外部字體、圖片、圖標等靜態文件

如果瀏覽器控制檯出現 `Content Security Policy`、`Refused to load`、`Refused to execute` 等提示，通常不是資源地址失效，而是該第三方域名沒有加入 CSP 白名單。

Workers 環境下 CSP 會放在 HTTP Response Header 中返回，並同時設置 `X-Frame-Options: DENY`，禁止頁面被其他站點 iframe 嵌入。第三方主題自帶的 `<meta http-equiv="Content-Security-Policy">` 會在 Workers 反代時被移除，最終以後臺配置和內置白名單生成的 Header 為準。

**默認白名單**（已內置）：

- `https://challenges.cloudflare.com` - Cloudflare Turnstile
- `https://static.cloudflareinsights.com` - Cloudflare Analytics
- `https://fonts.googleapis.com` - Google Fonts CSS
- `https://fonts.gstatic.com` - Google Fonts 文件
- `https://raw.githubusercontent.com` - 主題圖片資源

**默認 `connect-src` 白名單**（已內置）：

- `https://api.github.com`
- `https://api.iconify.design`
- `https://api.unisvg.com`
- `https://api.simplesvg.com`
- `https://api.frankfurter.app`
- `https://api.frankfurter.dev`
- `https://open.er-api.com`
- `https://api.ip.sb`
- `https://ipwho.is`
- `https://api.ipapi.is`
- `https://ipapi.co`
- `https://api.vore.top`

**後臺配置**：

如果需要添加第三方背景圖、CSS、JS、字體、圖片等資源，可在管理後臺 → 外觀 設置中配置：

| 字段 | 說明 | 示例 |
|------|------|------|
| CSP 靜態文件域名 | 允許加載的第三方靜態資源域名 | `https://cdn.jsdelivr.net,https://cdnjs.cloudflare.com` |
| CSP API 域名 | 允許連接的 API 域名 | `https://api.example.com` |

填寫規則：

- 只填寫域名源（origin），不要填寫完整文件路徑。例如填寫 `https://cdn.jsdelivr.net`，不要填寫 `https://cdn.jsdelivr.net/gh/user/repo/style.css`
- 多個域名用英文逗號分隔
- 僅建議填寫 `https://` 域名
- 使用同源資源或本地靜態文件（例如 `./assets/bg.webp`）不需要額外添加白名單

> **安全提示**：添加第三方 CSS/JS 時，請確保來源安全可靠。CSP 默認攔截第三方資源是為了避免惡意腳本注入、頁面被篡改、數據洩露和未知追蹤代碼。建議優先使用同源資源，或將資源託管在自己可信的倉庫/CDN 中；不要把不信任的公共 CDN 域名隨意加入白名單。

**GitHub Pages 環境變量配置**：

| 環境變量 | 說明 | 示例 |
|---------|------|------|
| `CSP_STATIC` | 額外的靜態文件域名，用於第三方背景圖、CSS、JS、字體、圖片等 | `https://cdn.jsdelivr.net` |
| `CSP_API` | 額外的 API 域名 | `https://api.example.com` |

> **注意**：`API_BASE` 環境變量會自動添加到 CSP API 白名單中。
>
> GitHub Pages 純靜態構建無法設置 Workers 的 HTTP Header，因此仍會在構建後的 HTML 中寫入 CSP meta。

### Cloudflare 額度查詢（可選）

如需在後臺查詢 D1 讀寫額度和 Workers 請求量：

1. 在 [Cloudflare Dashboard](https://dash.cloudflare.com/?to=/:account/workers-and-pages)右下角複製當前賬戶的 **Account ID**
2. 在[API Tokens 頁面](https://dash.cloudflare.com/profile/api-tokens)創建具備 **Account Analytics Read** 權限的 Cloudflare API Token
3. 在管理後臺 → 全局設置 → Cloudflare 設置中填入 Account ID 和 API Token
4. 保存後點擊 **查詢 D1 額度** 查看 UTC 當日與昨天用量

</details>

<details>
<summary>通知設置</summary>

## 🔔 通知設置

在管理後臺 → 全局設置 → 通知 中配置。支持以下通知方式，通過 Bot Token 字段自動識別平臺類型：

### Telegram

1. 創建 Telegram Bot（通過 [@BotFather](https://t.me/BotFather)）
2. 獲取 Bot Token，填入 **Bot Token** 字段
3. （通過 [@idbot](https://t.me/idbot)）獲取 ID，填入 **Chat ID** 字段

### 飛書

1. 創建飛書群機器人，獲取 Webhook URL
2. 將 Webhook URL 填入 **Bot Token** 字段
3. **Chat ID** 留空

### 釘釘

1. 在釘釘群中添加自定義機器人，獲取 Webhook URL（包含 `access_token` 參數）
2. 將 Webhook URL 填入 **Bot Token** 字段
3. **Chat ID** 留空

### OneBot (QQ)

1. 部署 OneBot 協議實現（如 go-cqhttp、Lagrange 等），獲取 HTTP API 地址
2. 將 API 地址填入 **Bot Token** 字段，格式為 `onebot:http://127.0.0.1:3000/send_private_msg?access_token=xxx`，或 `onebot:http://127.0.0.1:3000/send_group_msg?access_token=xxx`
3. **Chat ID** 填入目標用戶 ID（如 `123456`）或群 ID（如 `789012`）

### 企業微信

1. [創建企業微信群機器人](https://open.work.weixin.qq.com/help2/pc/14931) 並配置，獲取 Webhook URL
2. 將 Webhook URL 填入 **Bot Token** 字段
3. **Chat ID** 留空

### Bark

1. 獲取 Bark 推送鏈接，比如 `https://api.day.app/xxxxxxx/自定義內容`，刪掉中文，保留 `https://api.day.app/xxxxxxx/`
2. 將鏈接填入 **Bot Token** 字段
3. **Chat ID** 留空
4. 如果是自建 Bark 服務，格式為 `bark:https://example.com/xxxxxxx/`

### Server 醬

1. 註冊 [Server 醬](https://sct.ftqq.com/) 獲取 SendKey
2. 將 SendKey 填入 **Bot Token** 字段，格式為 `https://sctapi.ftqq.com/你的SendKey.send`
3. **Chat ID** 留空

### WxPusher

1. 註冊 [WxPusher](https://wxpusher.zjiecode.com/) 獲取 SPT Token
2. 將 SPT Token 填入 **Bot Token** 字段，格式為 `https://wxpusher.zjiecode.com/api/send/message/[SPT_你的Token]/Hello%20WxPusher`
3. **Chat ID** 留空

### Gotify

1. 部署或使用已有的 [Gotify](https://gotify.net/) 服務
2. 在 Gotify 中創建 Application，獲取 Token
3. 將推送 URL 填入 **Bot Token** 字段，格式為 `https://你的Gotify地址/message?token=你的Token`
4. **Chat ID** 留空

### 告警類型

| 類型   | 說明                       |
| ---- | ------------------------ |
| 離線告警 | 節點離線達到設置的 2-30 分鐘閾值後發送告警，恢復後發送恢復通知 |
| 到期提醒 | 可配置為禁用，或服務器到期前 1-7 天內每天發送提醒 |

### 測試通知

配置完成後，可點擊 **發送測試通知** 按鈕驗證配置是否正確。測試成功後記得點擊 **保存**。

</details>

<details>
<summary>其他設置</summary>

### 前臺大盤

訪問 `https://你的項目.你的子域.workers.dev/` 查看：

- **條形圖視圖**：服務器狀態概覽（含實時網速和本月流量）
- **環形圖視圖**：服務器資源佔用環形展示
- **表格視圖**：詳細數據列表
- **地圖視圖**：全球服務器分佈
- **過濾器**：按國家篩選服務器

### 服務器詳情

點擊任意服務器卡片進入詳情頁：

- 實時 CPU/GPU/內存/磁盤/網絡/負載
- 7 天曆史趨勢圖
- 鼠標懸停查看具體時間點的數值
- 國內四線路延遲與丟包率追蹤

> **注意**：查看 1 小時以上的歷史數據需要登錄管理員賬戶。

### iOS Scriptable 小組件

項目提供了 iOS Scriptable 小組件腳本：[scripts/ios-scriptable-widget.js](scripts/ios-scriptable-widget.js)。

使用方式：

1. 在 iPhone 安裝 [Scriptable](https://scriptable.app/)。
2. 將 [scripts/ios-scriptable-widget.js](https://github.com/huilang-me/CF-Server-Monitor/raw/refs/heads/main/scripts/ios-scriptable-widget.js) 內容複製到 Scriptable 新腳本中。
3. 修改腳本頂部的 `CONFIG.baseURL` 為你的站點地址，例如 `https://status.example.com`。
4. 添加 Scriptable 小組件，選擇該腳本。
5. 在小組件的 **Parameter** 中填寫服務器 ID，例如 `955bd53e-531f-4dc8-8705-dc204000fa98`，也可以寫成 `id:955bd53e-531f-4dc8-8705-dc204000fa98`。

說明：

- 如需在桌面上下滑動切換服務器，需要添加多個同尺寸 Scriptable 小組件，每個小組件填寫不同的服務器 ID，然後在 iOS 桌面將它們疊成小組件堆疊。
- 小組件會顯示服務器在線狀態、CPU/RAM/磁盤/流量、實時上下行速率和更新時間。
- 腳本設置了 60 秒後刷新，但 iOS 會根據系統策略決定實際刷新時間。

### 主題切換與自定義

管理後臺支持以下自定義功能：

| 功能 | 說明 | 位置 |
|------|------|------|
| 自定義 CSS 主題 | 修改頁面樣式 | 後臺 → 外觀 → 自定義腳本 |
| 自定義 `<head>` | 添加外部 CSS/JS、Meta 標籤等 | 後臺 → 外觀 → 自定義 `<head>` |
| 背景圖片 | 自定義頁面背景 | 後臺 → 外觀 → 背景圖片 |
| Mikus 模式 | 勾選後自動寫入 `theme_options.mikus`，開啟內置 Mikus 前端配色、加載頁、歡迎區與櫻花動畫 | 後臺 → 外觀 → 開啟 Mikus 模式 |
| CSP 白名單 | 允許加載的第三方資源域名 | 後臺 → 外觀 → CSP 設置 |
| 主題商店 | 選擇第三方主題與版本 | 後臺 → 主題商店 |

Mikus 模式不會改動數據庫結構，仍復用現有 `theme_options` JSON 配置；勾選開關時會寫入 `{"mikus":1}`，取消勾選時會移除 `mikus` 參數。視覺來源：[mikus-loli/komari-mikus](https://github.com/mikus-loli/komari-mikus)。

**主題商店與 Workers 反代說明**：

- 後臺切換主題會保存 `theme_url`，主題商店會基於主題倉庫 commit 生成 GitHub tree 地址，也支持手動填寫獨立 GitHub 主題倉庫 tree 地址，例如 `https://github.com/huilang-me/cf-server-monitor-theme-emerald/tree/f334bb5e25ffbe66749a8df9eb4b099fb148e0f7`
- 主題商店 `themes.json` 可為主題配置倉庫 `url` 和構建分支 `branch`；後臺會讀取該分支最近 10 個 commit，並把所選 commit 組裝為 `https://github.com/<owner>/<repo>/tree/<commit ID>` 寫入 `theme_url`
- `theme_url` 留空時使用項目內置默認主題
- Workers 僅反代所選主題的 `index.html` 和 `/assets/*`，例如 `/assets/app.css` 會映射到主題倉庫同版本 `assets/app.css`
- `install.sh`、`flags/`、`os-icons/`、favicon、API、管理端等其他路徑不會走主題反代，仍返回項目原有文件或接口
- 遠程主題 `index.html` 和 `assets/` 會在 Workers Cache 中緩存：commit id 固定版 1 天，分支名版本 1 小時；主題商店列表緩存 5 分鐘
- 切換主題會先校驗遠程 `index.html` 是否可訪問，失敗會提示錯誤並拒絕保存，不會自動回退成默認主題
- 主題預覽需要已登錄管理員身份；未授權直接訪問 `/?theme_url=...` 會返回 401，不會啟用臨時主題
- 管理後臺固定使用內置默認主題；第三方主題的管理入口應鏈接到 `/admin#admin`
- 第三方主題詳情頁建議使用 `/#/server/:id`，避免和 `/admin` 的內置後臺接管邏輯衝突

**自定義 `<head>` 使用示例**：

```html
<!-- 引入外部字體 -->
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap">

<!-- 通過 CSS @import 引入第三方樣式 -->
<style>
@import url('https://cdn.jsdelivr.net/gh/user/repo/theme.css');
</style>

<!-- 自定義 Meta 標籤 -->
<meta name="description" content="My Server Monitor">

<!-- 內聯樣式 -->
<style>body { font-family: 'Inter', sans-serif; }</style>
```

**第三方資源導入說明**：

- 外部 CSS、CSS `@import`、外部 JS、第三方背景圖、字體和圖片都會受 CSP 限制
- 如果資源來自第三方域名，需要先在後臺 → 外觀 → CSP 設置 → CSP 靜態文件域名中加入對應域名源
- 白名單填寫域名源即可，例如資源地址是 `https://cdn.jsdelivr.net/gh/user/repo/theme.css`，只填寫 `https://cdn.jsdelivr.net`
- 背景圖 URL 如果使用第三方 CDN，也需要把 CDN 域名加入 CSP 靜態文件域名
- API 請求或 WebSocket 連接使用第三方域名時，加入 CSP API 域名，而不是 CSP 靜態文件域名

> **安全警告**：
> - 添加第三方 CSS/JS 時，請確保來源安全可靠，使用前建議將js源碼發給AI完整分析安全後，確認無問題後使用
> - 建議將資源託管在自己的 GitHub 倉庫中，通過 CDN 調用
> - 使用不當可能帶來 XSS 攻擊、數據洩露等嚴重安全風險
> - 外部資源需要添加到 CSP 白名單中才能正常加載，這是為了安全而默認攔截，不是程序錯誤

### 主題開發

如需開發自定義主題，請參考 [主題開發文檔](theme-develop.md)。

### 拖拽排序

在管理後臺的服務器列表中，可以通過拖拽調整服務器的顯示順序

### 服務器隱藏

可以將特定服務器設置為對非登錄用戶隱藏：

1. 進入管理後臺 `/admin`
2. 點擊服務器行右側的 **✏️ 編輯** 按鈕
3. 勾選 **公開隱藏** 選項
4. 點擊 **保存**

### 數據庫管理

管理後臺提供數據庫維護功能，可在 "Database Management" 標籤頁中找到：

1. **升級數據庫**：將數據庫結構升級到最新版本，適用於舊版本用戶升級
   - 點擊「Upgrade Database」按鈕
   - 確認升級操作
   - 系統會自動執行數據庫升級腳本
2. **清空歷史數據**：清空所有歷史數據（⚠️ 危險操作）
   - 點擊「清空歷史數據」按鈕
   - 確認操作（此操作將刪除所有歷史數據）
   - 系統會清空並重新初始化數據庫

> **注意**：
>
> - 清空歷史數據是不可逆操作，請確保已備份重要數據
> - 升級數據庫不會刪除現有數據，僅會更新表結構
> - 從舊版本升級到包含 GPU/丟包率監控的新版本後，需要先執行升級數據庫，再重新安裝或升級探針以採集新字段

</details>

<details>
<summary>定時任務</summary>

系統包含以下定時任務（UTC 時區）：

| 任務   | 觸發時間          | 說明                                              |
| ---- | ------------- | ----------------------------------------------- |
| 離線檢測 | `*/1 * * * *` | 每分鐘檢測離線節點併發送告警                                  |
| 合併任務 | `0 * * * *`   | 每小時執行，根據日期判斷執行：每月1號數據輪換、每月8號清理舊錶、每天12:00服務器到期檢測 |

</details>

## 📁 項目結構

<details>
<summary>項目結構</summary>

```
CF-Server-Monitor/
├── public/
│   ├── cf-server-monitor.ps1   # Windows 探針腳本（PowerShell 版，零依賴）
│   ├── install.sh              # 一鍵安裝腳本 - systemd 系統 (Ubuntu/Debian/CentOS)
│   ├── install-alpine.sh       # 一鍵安裝腳本 - OpenRC 系統 (Alpine Linux)
│   ├── install-openwrt.sh      # 一鍵安裝腳本 - procd 系統 (OpenWrt/LEDE)
│   ├── install-mac.sh          # 一鍵安裝腳本 - macOS (Intel / Apple Silicon)
│   ├── favicon.ico             # 站點圖標
│   └── logo.svg                # Logo
├── src/
│   ├── index.js                # 後端主入口 - 路由分發 + Durable Object 導出
│   ├── database/
│   │   ├── schema.js             # 數據庫初始化、表結構定義
│   │   ├── indexOptimization.js  # 數據庫索引優化
│   │   └── updateDatabase.js     # 數據庫升級處理
│   ├── durable/
│   │   └── MetricsBroadcaster.js # Durable Object：WebSocket 實時推送廣播中心
│   ├── middleware/
│   │   └── auth.js             # 認證中間件
│   ├── handlers/
│   │   ├── admin.js            # 後臺管理 API
│   │   ├── dashboard.js        # 前臺大盤 API
│   │   ├── frontend.js         # 前端資源服務
│   │   ├── theme.js            # 主題商店列表拉取與緩存
│   │   └── update.js           # 數據上報處理 + 廣播到 DO
│   ├── services/
│   │   └── notification.js     # 通知服務
│   ├── utils/
│   │   ├── agentConfig.js      # 探針配置下發
│   │   ├── cache.js            # 緩存工具
│   │   ├── common.js           # 通用工具函數
│   │   ├── cors.js             # CORS 處理
│   │   ├── csp.js              # CSP Header 生成與主題 HTML CSP meta 清理
│   │   ├── errors.js           # 錯誤類型與響應封裝
│   │   ├── metrics.js          # 指標處理工具
│   │   ├── serverBilling.js    # 服務器計費字段規範化
│   │   ├── settings.js         # 設置管理
│   │   └── version.js          # 版本檢查
│   └── frontend/               # Vue 3 前端應用
│       ├── App.vue             # 根組件
│       ├── main.js             # 前端入口
│       ├── components/         # Vue 組件
│       │   ├── Footer.vue
│       │   ├── ServerBarCard.vue
│       │   ├── ServerRingCard.vue
│       │   └── TerminalHeader.vue
│       ├── composables/        # 通用組合式函數
│       │   ├── useServerCardData.js
│       │   ├── usePasswordVisibility.js
│       │   └── useTheme.js
│       ├── router/
│       │   └── index.js        # Vue Router 配置
│       ├── styles/             # 樣式文件
│       │   ├── light.css
│       │   └── main.css
│       ├── utils/
│       │   ├── api.js          # API 請求封裝 + WebSocket 客戶端
│       │   ├── config.js       # 前端運行時配置
│       │   ├── constants.js    # 前端常量
│       │   ├── displayMode.js  # 前端顯示模式規範化
│       │   ├── http.js         # HTTP 請求封裝
│       │   ├── i18n.js         # 國際化配置
│       │   ├── osIcon.js       # 系統圖標匹配
│       │   ├── pingNode.js     # Ping 節點校驗
│       │   ├── playback.js     # WebSocket 回放節流
│       │   ├── server.js       # 前端服務器指標與計費顯示工具
│       │   ├── time.js         # 時間格式化工具
│       │   └── turnstile.js    # Turnstile 共享工具
│       └── views/              # 頁面視圖
│           ├── admin/          # 管理後臺（拆分為獨立模塊）
│           │   ├── index.vue   # 管理後臺主入口
│           │   ├── components/ # 後臺子組件
│           │   │   ├── AdminLogin.vue
│           │   │   ├── CopyCommandModal.vue
│           │   │   ├── DatabasePanel.vue
│           │   │   ├── DeleteServerModal.vue
│           │   │   ├── EditServerModal.vue
│           │   │   ├── ServerTable.vue
│           │   │   └── SettingsPanel.vue
│           │   └── composables/
│           │       └── useTurnstile.js
│           ├── Dashboard.vue    # 首頁（接入 WebSocket 實時推送）
│           └── ServerDetail.vue # 服務器詳情頁（歷史圖表 + 實時推送）
├── scripts/
│   ├── build.js                 # 前端構建腳本
│   ├── build-github-page.js     # GitHub Pages 構建腳本
│   └── ios-scriptable-widget.js # iOS Scriptable 小組件
├── test/
│   ├── README.md               # 測試工具說明
│   ├── agent-config.js         # 探針配置下發測試
│   ├── api-check.js            # 本地 API 檢查工具
│   ├── generate-sql.js         # 測試數據生成工具
│   ├── mock-data.sql           # 模擬數據 SQL
│   └── mock-sender.sh          # 模擬數據發送腳本（macOS）
├── index.html
├── jsconfig.json               # JS 配置
├── package.json                # 項目依賴與 npm scripts
├── package-lock.json           # npm 依賴鎖定文件
├── vite.config.js              # Vite 配置
├── wrangler.toml               # Wrangler 本地開發配置
├── API.md                      # 全局 API 文檔
├── theme-develop.md            # 第三方主題開發 API 文檔
├── todo.md                     # 待辦事項列表
└── .github/
    └── workflows/
        ├── deploy.yml             # GitHub Actions 自動部署到 Workers
        ├── deploy-github-page.yml # GitHub Pages 自動部署
        └── sync.yml               # 上游倉庫自動同步
```

</details>

## ❓ 常見問題

<details>
<summary>常見問題</summary>

**Q: 部署後返回API_SECRET is required**

如果是部署後丟失`API_SECRET`，請在Workers & Pages頁面，點擊 **Settings**，刪除原有`API_SECRET`（如有），重新添加`API_SECRET`保存觸發重新部署，等待部署完成即可。

**Q: 探針安裝後不顯示數據？**

檢查服務器是否能訪問 Worker URL，在安裝命令參數後面加入 ` -debug=1`（目前僅支持linux系統），再查看探針日誌：`journalctl -u cf-probe -f`，將錯誤信息發到Issue或者TG群，調試結束後刪掉debug=1參數重新安裝，避免日誌過大。

**Q: 如何更換 API_SECRET？**

更新 Cloudflare Workers & Pages 中的 `API_SECRET`，重新部署，並在所有服務器上重新安裝探針。如果是GitHub Action 自動部署，需要在 GitHub Secrets 中更新 `API_SECRET`。

**Q: D1 數據庫免費額度夠用嗎？**

Cloudflare D1 免費版提供 5GB 存儲和 5M 讀取行/日、100K 寫入行/日，足以支持服務器監控。

寫入行：1臺服務器一天佔用寫入行是1.44k，免費寫入額度是100k/天，理論上可用支持60+服務器的監控，如果修改上報頻率為120秒可用翻倍。

讀取行：1臺服務器一天佔用讀行是8k左右，如果開啟站點兼容，大概是1.6k，免費讀行是5M/天，非常充裕
主要是前端訪問消耗的次數，限制了非登錄用戶 1 小時以上的查看，只要不被暴力刷額度，絕對夠用。如果不放心，可以在後臺開啟 Turnstile 人機驗證，也可以選擇僅登錄查看。

**Q: D1 數據庫免費額度超出扣費嗎？**

超出不扣費，只會限制訪問，第二天北京時間08:00重置

**Q: 遇到其他異常問題怎麼辦？**

可以嘗試在後臺數據庫管理中：

- 升級數據庫：嘗試修復數據庫結構問題
- 清空歷史數據：清空數據庫中的歷史數據（⚠️ 注意：此操作將清除所有歷史數據，請確保已備份重要信息）

**Q: 忘記密碼？**

進入Cloudflare後臺，進入D1數據庫（server-monitor-db），點擊右上角explore data，進入後點擊左側的`setting`表，雙擊`site_options`右側的value，可以看到`用戶名`和md5加密的`密碼`，password修改成`e10adc3949ba59abbe56e057f20f883e`，即默認密碼`123456`，右上角點Commit 1 change，彈出的確認框點確認即可。然後訪問後臺用默認密碼登錄即可。

**Q: 地區並列顯示港澳臺和國家**

為了方便用戶查看，前端並列顯示港澳臺和國家，但是旗幟都統一顯示五星紅旗，後端返回的是region字段，這裡是輸出國家和地區，而不是國家，地圖符合中華人民共和國自然資源部標準地圖製作（審圖號：GS(2023)2767 號）。

**Q: 國內服務器無法上報**

1. CF有託管域名的話，綁定一個域名可用解決絕大多數上報問題
2. 如果沒有域名可以綁定，或者綁定域名還是無法訪問，可以改本地host解決，本地ping一個cf的cdn ip，改host解析. `echo [ip] [你的項目名.你的子域.workers.dev] | sudo tee -a /etc/hosts`

</details>

## 📸 界面預覽

<details>
<summary>界面預覽</summary>

### 深色風格
![image](https://github.com/user-attachments/assets/4e6a5db4-65d3-4d40-91b9-9e46ee140d0d)
![image](https://github.com/user-attachments/assets/c10a1376-3d4c-4a58-8d3b-dc904b30f174)
![image](https://github.com/user-attachments/assets/a9c1aefd-42f7-4805-aa42-bbe9e58aed59)
![image](https://github.com/user-attachments/assets/527bcf04-3124-4f1c-b052-451bccae961d)
![image](https://github.com/user-attachments/assets/ac6f6fbb-b9fb-45cd-93e5-ca08bbad9ecb)
![image](https://github.com/user-attachments/assets/b5436816-54bd-4512-a65c-bf963fd4874c)
![image](https://github.com/user-attachments/assets/ba0d3605-ef64-4be1-884b-9506f20277a8)
![image](https://github.com/user-attachments/assets/197767cc-028b-4ec1-b41f-5cadc2b25629)

### 淺色風格
![image](https://github.com/user-attachments/assets/8d310095-2b93-40f3-b762-323fbe6595f6)
![image](https://github.com/user-attachments/assets/bfa48a70-5379-495f-8599-fc9bf49c4801)
![image](https://github.com/user-attachments/assets/e100d984-3165-4f38-948a-625249b4600a)
![image](https://github.com/user-attachments/assets/7d266ff3-0db7-477b-8029-c76e42298002)

</details>

## 🛠️ 本地開發

<details>
<summary>本地開發步驟</summary>

### 環境要求

- Node.js 18+
- npm 或 pnpm

### 開發步驟

根目錄新建 `.env` 文件，添加默認 `API_SECRET`：

```bash
API_SECRET=123456
```

然後執行以下命令進行本地開發：

```bash
# 安裝依賴
npm install

# 創建 D1 數據庫（首次）
npx wrangler d1 create server-monitor-db

# 啟動本地 Worker（默認 https://localhost:8787）
npm run dev

# 單獨啟動前端 Vite 開發模式（默認 http://localhost:5173）
npm run dev:frontend

# 構建前端生產版本
npm run build:frontend

# 部署到 Cloudflare Workers
npm run deploy
```

定時任務

```
https://localhost:8787/cdn-cgi/handler/scheduled?cron=*/1+*+*+*+* // 每分鐘執行一次（離線檢測）
https://localhost:8787/cdn-cgi/handler/scheduled?cron=0+*+*+*+* // 每小時執行一次（合併任務）
https://localhost:8787/cdn-cgi/handler/scheduled?cron=0+0+*+*+0 // 每週執行一次（測試使用）
https://localhost:8787/cdn-cgi/handler/scheduled?cron=0+12+*+*+* // 每天12點執行一次（測試使用）
```

### 本地測試數據

支持生成本地測試數據，方便在部署前進行功能測試：

1. 進入 `test` 目錄查看詳細說明
2. 運行測試數據生成腳本
3. 導入生成的 SQL 數據到本地 D1 數據庫
4. 啟動本地開發服務器進行測試

```
node test/generate-sql.js
wrangler d1 execute server-monitor-db --file=test/mock-data.sql
```

詳細步驟見 [test/README.md](test/README.md)

### API 接口測試

項目提供了 `api-check.js` 接口測試工具，用於驗證本地開發環境的 API 接口是否正常工作：

```bash
# 默認配置測試
node test/api-check.js

# 指定參數測試
node test/api-check.js --base-url=http://localhost:8787 --api-secret=123456

# 查看幫助
node test/api-check.js --help
```

**測試覆蓋範圍：**

- 未登錄接口：`/api/config`、`/api/servers`、`/api/server`、`/update` 等
- 登錄流程：登錄接口驗證
- 已登錄接口：隱藏服務器訪問、歷史數據查詢等
- 後臺管理：服務器增刪改查、設置管理等

**選項參數：**

| 參數                 | 說明          | 默認值                     |
| ------------------ | ----------- | ----------------------- |
| `--base-url`       | 本地服務地址      | `http://localhost:8787` |
| `--api-secret`     | API\_SECRET | `123456`                |
| `--admin-user`     | 管理員用戶名      | `admin`                 |
| `--admin-password` | 管理員密碼       | 使用 API\_SECRET          |
| `--timeout`        | 請求超時時間(ms)  | `10000`                 |

</details>

## 📄 許可證

MIT License

## 🌐 社區

- [Telegram 群組](https://t.me/cfServerMonitor)

## 🙏 致謝

- [CF-Server-Monitor-Pro](https://github.com/a63414262/CF-Server-Monitor-Pro)
- [Cloudflare Workers](https://workers.cloudflare.com/)
- [Vue 3](https://vuejs.org/)
- [Vite](https://vitejs.dev/)
- [Chart.js](https://www.chartjs.org/)
- [Leaflet](https://leafletjs.com/)
- 感謝 [NodeSeek](https://www.nodeseek.com/post-763025-1)  [LINUX DO](https://linux.do/) 社區的支持與推廣
