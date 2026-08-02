# CF-Server-Monitor 全局 API 文檔

> 面向 CF-Server-Monitor 項目維護者和集成方的全局 REST / WebSocket API 參考。
> 本文檔覆蓋 Workers 全部公開端點、管理端端點、維護端點、鑑權機制、錯誤碼、數據結構與 WebSocket 實時推送協議。
>
> **Base URL**：`https://<your-worker-domain>`（部署後由 Cloudflare Workers 提供）
>
> **最後核對源碼日期**：`2026-07-26`
>
> **修訂標記約定**：自 `2026-07-26` 起，已過期但有遷移參考價值的說明使用刪除線保留，緊隨其後給出當前實現。
>
> **統一響應頭**：
>
> - `Content-Type: application/json; charset=utf-8`（除特別說明外）
> - CORS：當 `CORS_ALLOWED_ORIGINS` 環境變量配置了允許的源時，會附帶 `Access-Control-Allow-Origin / Allow-Credentials / Vary: Origin`。
> - `X-Cache: HIT | MISS`：僅出現在 `/api/history/all` 響應中。

***

## 目錄

- [0. 通用規範](#0-通用規範)
  - [0.1 鑑權機制](#01-鑑權機制)
  - [0.2 Turnstile 人機驗證](#02-turnstile-人機驗證)
  - [0.3 統一響應格式](#03-統一響應格式)
  - [0.4 統一錯誤碼](#04-統一錯誤碼)
  - [0.5 限流與配額](#05-限流與配額)
  - [0.6 CORS](#06-cors)
- [1. 探針上報接口](#1-探針上報接口)
  - [1.1](#11-post-update---指標上報agent-入口) [`POST /update`](#11-post-update---指標上報agent-入口) [- 指標上報（Agent 入口）](#11-post-update---指標上報agent-入口)
- [2. 公開 API（前端/管理端共用）](#2-公開-api前端管理端共用)
  - [2.1](#21-get-apiconfig---獲取站點配置) [`GET /api/config`](#21-get-apiconfig---獲取站點配置) [- 獲取站點配置](#21-get-apiconfig---獲取站點配置)
  - [2.2](#22-get-apiservers---獲取服務器列表首頁) [`GET /api/servers`](#22-get-apiservers---獲取服務器列表首頁) [- 獲取服務器列表（首頁）](#22-get-apiservers---獲取服務器列表首頁)
  - [2.3](#23-get-apiserver---獲取單臺服務器詳情) [`GET /api/server`](#23-get-apiserver---獲取單臺服務器詳情) [- 獲取單臺服務器詳情](#23-get-apiserver---獲取單臺服務器詳情)
  - [2.4](#24-get-apihistoryall---獲取歷史指標) [`GET /api/history/all`](#24-get-apihistoryall---獲取歷史指標) [- 獲取歷史指標](#24-get-apihistoryall---獲取歷史指標)
  - [2.5](#25-get-apiws---websocket-實時推送) [`GET /api/ws`](#25-get-apiws---websocket-實時推送) [- WebSocket 實時推送](#25-get-apiws---websocket-實時推送)
  - [2.6](#26-get-theme---獲取主題商店數據) [`GET /theme`](#26-get-theme---獲取主題商店數據) [- 獲取主題商店數據](#26-get-theme---獲取主題商店數據)
  - [2.7](#27-前端與主題代理) [前端與主題代理](#27-前端與主題代理)
- [3. 管理端 API（鑑權）](#3-管理端-api鑑權)
  - [3.1](#31-post-adminapi---管理操作入口) [`POST /admin/api`](#31-post-adminapi---管理操作入口) [- 管理操作入口](#31-post-adminapi---管理操作入口)
  - [3.2](#32-action-login---登錄) [`action: login`](#32-action-login---登錄) [- 登錄](#32-action-login---登錄)
  - [3.3](#33-action-get_settings---讀取全部設置) [`action: get_settings`](#33-action-get_settings---讀取全部設置) [- 讀取全部設置](#33-action-get_settings---讀取全部設置)
  - [3.4](#34-action-list---列出全部服務器含在線統計) [`action: list`](#34-action-list---列出全部服務器含在線統計) [- 列出全部服務器（含在線/統計）](#34-action-list---列出全部服務器含在線統計)
  - [3.5](#35-action-d1_usage---d1--workers-用量) [`action: d1_usage`](#35-action-d1_usage---d1--workers-用量) [- D1 / Workers 用量](#35-action-d1_usage---d1--workers-用量)
  - [3.6](#36-action-save_settings---保存設置) [`action: save_settings`](#36-action-save_settings---保存設置) [- 保存設置](#36-action-save_settings---保存設置)
  - [3.6.1](#361-action-start_theme_preview---生成主題預覽授權) [`action: start_theme_preview`](#361-action-start_theme_preview---生成主題預覽授權) [- 生成主題預覽授權](#361-action-start_theme_preview---生成主題預覽授權)
  - [3.6.2](#362-action-clear_theme_preview_auth---清除主題預覽授權) [`action: clear_theme_preview_auth`](#362-action-clear_theme_preview_auth---清除主題預覽授權) [- 清除主題預覽授權](#362-action-clear_theme_preview_auth---清除主題預覽授權)
  - [3.7](#37-action-add---新增服務器) [`action: add`](#37-action-add---新增服務器) [- 新增服務器](#37-action-add---新增服務器)
  - [3.8](#38-action-edit---修改服務器信息) [`action: edit`](#38-action-edit---修改服務器信息) [- 修改服務器信息](#38-action-edit---修改服務器信息)
  - [3.9](#39-action-delete---刪除服務器) [`action: delete`](#39-action-delete---刪除服務器) [- 刪除服務器](#39-action-delete---刪除服務器)
  - [3.10](#310-action-batch_delete---批量刪除) [`action: batch_delete`](#310-action-batch_delete---批量刪除) [- 批量刪除](#310-action-batch_delete---批量刪除)
  - [3.11](#311-action-save_order---保存服務器排序) [`action: save_order`](#311-action-save_order---保存服務器排序) [- 保存服務器排序](#311-action-save_order---保存服務器排序)
  - [3.12](#312-action-send_test_notification---發送測試通知) [`action: send_test_notification`](#312-action-send_test_notification---發送測試通知) [- 發送測試通知](#312-action-send_test_notification---發送測試通知)
  - [3.13](#313-action-export_servers---導出服務器) [`action: export_servers`](#313-action-export_servers---導出服務器) [- 導出服務器](#313-action-export_servers---導出服務器)
  - [3.14](#314-action-import_servers---導入服務器) [`action: import_servers`](#314-action-import_servers---導入服務器) [- 導入服務器](#314-action-import_servers---導入服務器)
- [4. 系統維護端點](#4-系統維護端點)
  - [4.1](#41-post-updatedatabase---數據庫遷移) [`POST /updateDatabase`](#41-post-updatedatabase---數據庫遷移) [- 數據庫遷移](#41-post-updatedatabase---數據庫遷移)
  - [4.2](#42-post-clearhistory---清空歷史數據) [`POST /clearHistory`](#42-post-clearhistory---清空歷史數據) [- 清空歷史數據](#42-post-clearhistory---清空歷史數據)
  - [4.3](#43-get-__dohealth---durable-object-健康檢查) [`GET /__do/health`](#43-get-__dohealth---durable-object-健康檢查) [- Durable Object 健康檢查](#43-get-__dohealth---durable-object-健康檢查)
- [5. 數據結構](#5-數據結構)
  - [5.1 Server 對象](#51-server-對象)
  - [5.2 Metrics 對象（探針上報 payload）](#52-metrics-對象探針上報-payload)
  - [5.3 History Row 對象](#53-history-row-對象)
  - [5.4 Settings 對象](#54-settings-對象)
  - [5.5 WebSocket 消息](#55-websocket-消息)
- [6. 定時任務 (Cron)](#6-定時任務-cron)
- [7. 錯誤碼速查表](#7-錯誤碼速查表)
- [8. 完整 cURL 示例](#8-完整-curl-示例)
- [9. 版本與變更說明](#9-版本與變更說明)

***

## 0. 通用規範

### 0.1 鑑權機制

項目使用 **三套並行的鑑權機制**，按接口範圍區分使用。所有請求還依賴非空的 `env.API_SECRET`；未配置時 Worker 會在路由處理前返回 `400 { "error": "API_SECRET is required", "code": 400 }`。

#### A. 探針 Secret（Agent → Worker）

- **使用位置**：`POST /update`
- **方式**：請求體字段 `secret`
- **值**：必須等於 Worker 環境變量 `API_SECRET`
- **失敗返回**：`401 { "error": "Invalid secret", "code": 401 }`

#### B. Basic Auth（管理登錄 → JWT）

- **使用位置**：`POST /admin/api` 的 `action: login`
- **方式**：請求體字段 `username` / `password`（後端內部組裝 `Basic base64(user:pass)` 進行校驗）
- **校驗順序**：
  1. 若 `site_options.password` 已設置為 PBKDF2 格式 → 按 `pbkdf2_sha256$iterations$salt$hash` 校驗
  2. 若 `site_options.password` 為舊版 32 位 MD5 → 按 MD5 兼容校驗，成功後自動升級為 PBKDF2
  3. 若 `site_options.password` 未設置或為空 → 與 `API_SECRET` 直接比對
  4. 用戶名：若 `site_options.username` 已設置則用之，否則使用 `API_USER_NAME` 環境變量，最終回退為 `admin`
- **失敗返回**：`401 { "error": "Invalid username or password", "code": 401 }`

#### C. JWT Bearer（管理操作 → 後續管理請求）

- **使用位置**：所有非 `login` 的 `POST /admin/api`、`POST /updateDatabase`、`POST /clearHistory`
- **方式**：`Authorization: Bearer <token>` Header
- **Token 簽發**：`HS256` JWT，默認有效期 **604800 秒（7 天）**
- **簽名密鑰**（優先級）：
  1. `site_options.jwt_secret`（長度 ≥ 32）
  2. `API_SECRET`（不夠 32 字符時 `padEnd` 補 `'x'` 後取前 64 位）
  3. 回退常量：`'default_jwt_secret_for_server_monitor'`
- **Payload 字段**：
  ```json
  { "sub": "admin", "iat": <unix>, "exp": <unix + 604800> }
  ```
- **失敗返回**：`401 { "error": "Unauthorized", "code": 401 }`

> **緩存提示**：管理端登錄成功後，前端應將 `token` 存於 `localStorage`，並對所有非登錄的 `admin/api` 請求自動加上 `Authorization: Bearer <token>` Header。
>
> **2026-07-26 修訂**：加載站點設置時，後端會在缺少有效 `jwt_secret` 時生成並持久化一個 32 字節隨機密鑰。因此第 2、3 級回退主要用於數據庫加載異常等兜底場景。

### 0.2 Turnstile 人機驗證

當 `site_options.turnstile_enabled === 'true'` 時，**所有** **`/api/*`** **與** **`/admin/api`** **公共接口**（除了下方 bypass 列表）都需要先驗證 Cloudflare Turnstile Token。

**Bypass 列表**（無需 Turnstile）：

- `/admin/api`（`/admin/api` 走另一套 Turnstile：見 `action: login`）
- `/api/ws`（WebSocket 升級）
- `/api/config` 在 **不攜帶** `X-Turnstile-Token` 與 `X-Turnstile-Verified` 時（用於初始化判斷是否需要驗證）

**驗證流程**：

1. **首次訪問**：客戶端從 `/api/config` 拿到 `turnstile_site_key`。
2. **前端渲染** Turnstile 組件 → 拿到一次性 `token`。
3. **後續請求**在 Header 增加：
   ```
   X-Turnstile-Token: <token from cloudflare>
   ```
4. Worker 用 `site_options.turnstile_secret_key` 調用 `https://challenges.cloudflare.com/turnstile/v0/siteverify` 驗證。
5. ~~**驗證成功後**，Worker 通過 `X-Turnstile-Verified` 這個 **加密 Header** 給客戶端發“已驗證憑證”。~~ **2026-07-26 修訂**：當前實現通過 `/api/config` 響應體的 `turnstile_verified` 字段返回 AES-GCM 加密憑證，有效期 **3600 秒**。代碼會計算同名響應 Header 的值，但當前未實際寫入 Header。
6. 客戶端也可以把 `X-Turnstile-Verified` 再次帶回，Worker 會優先驗證該 Header（驗證有效期）。

**相關請求/響應 Header**：

| Header                 | 方向              | 含義                                                                                 |
| ---------------------- | --------------- | ---------------------------------------------------------------------------------- |
| `X-Turnstile-Token`    | Client → Server | 當次 Turnstile token（明文）                                                             |
| `X-Turnstile-Verified` | Client → Server；響應方向當前僅在 `/api/config` Body 返回 | AES-GCM 加密的 `{ expires: <unix+3600>, verified: true, timestamp: <ms> }`，base64 字符串 |

**失敗返回**：`403 { "error": "Turnstile verification failed", "code": 403 }`

### 0.3 統一響應格式

**成功響應**：

```json
{
  // 業務字段，結構因接口而異；不保證包含 success
  "...": "..."
}
```

> 注：項目裡的成功響應是直接 `JSON.stringify` 業務對象，**沒有固定的 `success` 或 `code` 字段**。~~HTTP 狀態碼始終為 `200`。~~ **2026-07-26 修訂**：大多數成功響應為 `200`，新版探針配置無變化時為 `204`，WebSocket 升級為 `101`。

**成功響應特例**：

- `POST /update` 的舊版協議、流量修正確認或配置生成兜底 → 純文本 `OK`（`Content-Type: text/plain`）；新版協議也可能返回 QueryParam 配置或 `update=1`
- 新版探針配置 MD5 一致、沒有待確認修正且無需自動更新 → `204 No Content`
- WebSocket 升級 → `101 Switching Protocols`

**常見錯誤響應**：

```json
{
  "error": "human readable message",
  "code": 400
}
```

> ~~所有錯誤都使用 `{error, code}`，且 `code` 始終是 HTTP 狀態碼鏡像。~~ **2026-07-26 修訂**：`src/utils/errors.js` 創建的大多數 JSON 錯誤符合該結構；歷史表缺列的 `409` 使用 `{message}`，部分 WebSocket/主題/前端錯誤為純文本，數據庫維護還可能以 HTTP `200` 返回業務 `success: false`。

### 0.4 統一錯誤碼

| code | 含義                    | 常見場景                                               |
| ---- | --------------------- | -------------------------------------------------- |
| 400  | Bad Request           | 參數缺失/類型錯/UUID 不合法/未知 action                        |
| 401  | Unauthorized          | 缺/錯 token、賬號密碼錯、站點非公開且未登錄                          |
| 403  | Forbidden             | Turnstile 驗證失敗                                     |
| 404  | Not Found             | 服務器 ID 不存在                                         |
| 409  | Conflict              | `databaseUpgradeRequired`，需先調用 `/updateDatabase` |
| 500  | Internal Server Error | DB 異常等未捕獲錯誤                                        |
| 503  | Service Unavailable   | WebSocket 不可用（未綁定 DO）                              |

### 0.5 限流與配額

- ~~Cloudflare Workers / D1 固定限制為 D1 500 萬行讀、10 萬行寫、Workers 10 萬次請求/日。~~ **2026-07-26 修訂**：配額取決於 Cloudflare 當前套餐與計費策略，不屬於本項目 API 的固定契約，應以 Cloudflare Dashboard 和官方文檔為準。
- `/admin/api?action=d1_usage` 可查詢當前賬戶 UTC 當日用量與 UTC 昨日用量。

### 0.6 CORS

環境變量 `CORS_ALLOWED_ORIGINS`，**逗號分隔**的源白名單，例如：

```
CORS_ALLOWED_ORIGINS=https://status.example.com,https://admin.example.com
```

- 當請求 `Origin` 命中白名單 → 響應帶 `Access-Control-Allow-Origin: <origin>`、`Access-Control-Allow-Credentials: true`、`Vary: Origin`。
- 預檢請求 `OPTIONS` → 直接返回 `204`，並回顯 `Access-Control-Request-Method` / `Access-Control-Request-Headers`，緩存 86400 秒。
- 未配置或未命中 → 不會下發 CORS Header，瀏覽器側會被同源策略攔截。
- WebSocket Durable Object 是例外：未配置白名單時握手響應使用 `Access-Control-Allow-Origin: *`；配置了非空白名單後才按 `Origin` 拒絕不匹配的連接。

***

## 1. 探針上報接口

### 1.1 `POST /update` - 指標上報（Agent 入口）

> **調用方**：服務器側探針（[Bash install.sh](./public/install.sh) / [Windows cf-server-monitor.ps1](./public/cf-server-monitor.ps1)）。~~舊鏈接使用 `../public` 且指向不存在的 `.pyw` 文件。~~（2026-07-26 修訂）
> **鑑權**：`secret` 字段 == `env.API_SECRET`
> **Turnstile**：不參與

**Request**

- Method：`POST`
- Path：`/update`
- Headers：
  ```
  Content-Type: application/json
  X-Agent-Version: <探針版本號>
  X-Agent-Config-Schema: 3
  X-Agent-Config-Md5: <最後成功應用的配置 MD5，首次為 none>
  ```
  動態配置請求頭為新版探針使用的可選字段；未攜帶時保持舊版響應協議。
- Body（JSON）：
  ```json
  {
    "id": "9b2c4d3e-1a2b-4c5d-9e8f-7a6b5c4d3e2f",
    "secret": "<API_SECRET>",
    "metrics": {
      "cpu": "12.34",
      "ram_total": "8192",
      "ram_used": "3700",
      "swap_total": "2048",
      "swap_used": "100",
      "disk_total": "102400",
      "disk_used": "32000",
      "load_avg": "0.10 0.20 0.30",
      "boot_time": "1700000000000",
      "net_rx": "12345678",
      "net_tx": "87654321",
      "net_rx_monthly": "1073741824",
      "net_tx_monthly": "536870912",
      "net_in_speed": "1024",
      "net_out_speed": "512",
      "os": "Ubuntu 22.04",
      "arch": "x86_64",
      "kernel_version": "6.8.0-36-generic",
      "cpu_info": "Intel(R) Xeon(R) CPU",
      "cpu_cores": "4",
      "gpu_info": [
        { "id": "0", "name": "NVIDIA GeForce RTX 3060", "info": 12.5 }
      ],
      "processes": "256",
      "tcp_conn": "32",
      "udp_conn": "4",
      "ip_v4": "203.0.113.10",
      "ip_v6": "2001:db8::10",
      "ping_ct": "23",
      "ping_cu": "25",
      "ping_cm": "30",
      "ping_bd": "40",
      "loss_ct": "0",
      "loss_cu": "0",
      "loss_cm": "0",
      "loss_bd": "0"
    }
  }
  ```

  新版探針也可以一次上報多個採集樣本，後端兼容舊的單條 `metrics` 格式。`samples` 還兼容別名 `batch`；每個元素可直接是指標對象，也可放在 `metrics`、`data` 或 `payload` 中。單次最多保留時間排序後的最後 300 個樣本。批量格式示例：

  ```json
  {
    "id": "9b2c4d3e-1a2b-4c5d-9e8f-7a6b5c4d3e2f",
    "secret": "<API_SECRET>",
    "metrics": { "...": "latest metrics, kept for compatibility" },
    "samples": [
      { "ts": 1737638340000, "metrics": { "...": "metrics at this timestamp" } },
      { "ts": 1737638341000, "metrics": { "...": "metrics at this timestamp" } }
    ],
    "collect_interval": 1,
    "report_interval": 60
  }
  ```

**字段說明（metrics）**：

> ~~下表“必填”表示服務端會逐字段拒絕缺失值。~~ **2026-07-26 修訂**：服務端只要求存在結構有效的 `metrics`，或至少一個有效的 `samples`/`batch` 元素；不會逐字段校驗。數值字段同時接受 JSON string/number，缺失或無法解析的指標大多按 `0`、空字符串或 `null` 入庫。下表“是”表示官方探針的常規上報字段。

| 字段               | 類型           | 單位  | 必填 | 說明                                          |
| ---------------- | ------------ | --- | -- | ------------------------------------------- |
| `cpu`            | string\|number | %   | 是  | CPU 佔用率，保留 2 位小數                            |
| `ram_total`      | string\|number | MB  | 是  | 內存總容量                                       |
| `ram_used`       | string\|number | MB  | 是  | 內存已用                                        |
| `swap_total`     | string\|number | MB  | 是  | Swap 總容量                                    |
| `swap_used`      | string\|number | MB  | 是  | Swap 已用                                     |
| `disk_total`     | string\|number | MB  | 是  | 磁盤總容量                                       |
| `disk_used`      | string\|number | MB  | 是  | 磁盤已用                                        |
| `load_avg`       | string       | -   | 是  | 三個浮點，空格分隔                                   |
| `boot_time`      | string\|number | 毫秒  | 是  | 系統啟動時間（Unix ms）                             |
| `net_rx`         | string\|number | 字節  | 是  | 累計接收字節                                      |
| `net_tx`         | string\|number | 字節  | 是  | 累計發送字節                                      |
| `net_rx_monthly` | string\|number | 字節  | 是  | 當月累計下行                                      |
| `net_tx_monthly` | string\|number | 字節  | 是  | 當月累計上行                                      |
| `net_in_speed`   | string\|number | B/s | 是  | 實時下行速度                                      |
| `net_out_speed`  | string\|number | B/s | 是  | 實時上行速度                                      |
| `os`             | string       | -   | 是  | 操作系統                                        |
| `arch`           | string       | -   | 是  | 系統架構                                        |
| `kernel_version` | string       | -   | 是  | 內核版本                                      |
| `cpu_info`       | string       | -   | 是  | CPU 型號                                      |
| `cpu_cores`      | string\|number | -   | 是  | 邏輯核心數                                       |
| ~~`gpu`~~        | number\|null | %   | 否  | ~~獨立 GPU 佔用字段。~~ **2026-07-26 修訂**：舊版探針仍可能發送，但後端沒有獨立 `gpu` 列，不會持久化，也不會在 API 中返回 |
| `gpu_info`       | array\|null | - | 否 | 新版格式為 `[{id,name,info}]`；`info` 是佔用率。無 GPU 時可為 `null`，入庫後會序列化為 JSON 字符串 |
| `processes`      | string\|number | -   | 是  | 進程數                                         |
| `tcp_conn`       | string\|number | -   | 是  | TCP 活躍連接數                                   |
| `udp_conn`       | string\|number | -   | 是  | UDP 套接字數                                    |
| `ip_v4`          | string\|number | -   | 是  | 公網 IPv4 地址；`0` 表示不可達；兼容舊探針 `1` 表示可達但未上報地址 |
| `ip_v6`          | string\|number | -   | 是  | 公網 IPv6 地址；`0` 表示不可達；兼容舊探針 `1` 表示可達但未上報地址 |
| `ping_ct`        | string\|number\|false\|null | ms  | 否  | 電信節點延時；空值表示未取到，`false` / `"false"` 表示禁用 |
| `ping_cu`        | string\|number\|false\|null | ms  | 否  | 聯通節點延時                                      |
| `ping_cm`        | string\|number\|false\|null | ms  | 否  | 移動節點延時                                      |
| `ping_bd`        | string\|number\|false\|null | ms  | 否  | BGP 節點延時                                    |
| `loss_ct`        | string\|number\|false\|null | %   | 否  | 電信丟包率                                       |
| `loss_cu`        | string\|number\|false\|null | %   | 否  | 聯通丟包率                                       |
| `loss_cm`        | string\|number\|false\|null | %   | 否  | 移動丟包率                                       |
| `loss_bd`        | string\|number\|false\|null | %   | 否  | BGP 丟包率                                     |

**Response**

- 舊版探針（未攜帶 `X-Agent-Config-Schema: 3`）：返回 `200 OK`：
  ```
  OK
  ```
  （`Content-Type: text/plain`）
- 新版探針且配置 MD5 一致、沒有待確認流量修正且無需自動更新：返回 `204 No Content`，不包含響應體。
- 新版探針且配置 MD5 不一致，或仍有待確認流量修正：返回 `200 OK`，響應頭攜帶當前
  `X-Agent-Config-Schema` 與 `X-Agent-Config-Md5`，響應體以固定順序的完整 QueryParam 配置開頭：
  ```text
  collect_interval=0&report_interval=60&reset_day=1&schema_version=3&custom_ct=gd-ct-dualstack.ip.zstaticcdn.com&custom_cu=gd-cu-dualstack.ip.zstaticcdn.com&custom_cm=gd-cm-dualstack.ip.zstaticcdn.com&custom_bd=ip.zstaticcdn.com&interface=
  ```
  （`Content-Type: application/x-www-form-urlencoded; charset=utf-8`）
- ~~動態配置包含 `traffic_calc_type`、`traffic_limit`、`auto_update` 等全部探針運行參數。~~ **2026-07-26 修訂，2026-07-31 更新**：MD5 覆蓋的規範配置僅包含 `collect_interval`、`report_interval`、`reset_day`、`schema_version`、`custom_ct`、`custom_cu`、`custom_cm`、`custom_bd`、`interface`。待應用的 `rx_correction`、`tx_correction` 會追加到響應體，但不參與配置 MD5；啟用自動更新且版本不一致時追加 `update=1`。
- 探針應用流量修正後，可在下一次 `POST /update` 頂層回傳 `rx_correction` / `tx_correction`。值匹配時後端清空待修正字段並直接返回純文本 `OK`，本次請求不要求 `metrics`。
- 失敗：
  ```json
  { "error": "Invalid secret", "code": 401 }
  { "error": "Server not found", "code": 404 }
  ```

**副作用**

1. `metrics_history` 只寫入本次請求中最新的一個樣本，避免 1 秒採集時放大 D1 寫入次數。
2. 觸發 Durable Object `MetricsBroadcaster` 內部廣播，統一發送 `{type:"batchUpdate", ts, updates:[...]}` 格式，前端按樣本時間逐個回放。
3. 寫入 `request.cf.country`（或 `cf-ipcountry` Header）作為該條記錄的 `region` 字段。~~服務端會統一轉大寫。~~ **2026-07-26 修訂**：當前按原值入庫；Cloudflare 的國家代碼通常為大寫，但自定義回退 Header 不會被規範化。

***

## 2. 公開 API（前端/管理端共用）

> ~~以下接口除 `/api/ws` 外，若 `site_options.is_public !== 'true'` 則必須攜帶 JWT。~~ **2026-07-26 修訂**：`/api/servers`、`/api/server`、`/api/history/all` 在私有站點需要 JWT；`/api/config`、`/api/ws`、`/theme` 無論站點是否公開均可訪問。
> 命中 Turnstile 時需帶 `X-Turnstile-Token` 或 `X-Turnstile-Verified`。

### 2.1 `GET /api/config` - 獲取站點配置

**Request**

- Method：`GET`
- Path：`/api/config`
- Headers（可選）：
  ```
  X-Turnstile-Token: <token>   # 當攜帶時，驗證後會在響應體返回 turnstile_verified
  X-Turnstile-Verified: <encrypted>
  ```

**Response** `200 OK`

```json
{
  "version": "2.8.0 Beta",
  "is_public": true,
  "authorization": false,
  "turnstile_enabled": true,
  "turnstile_login_enabled": true,
  "turnstile_site_key": "1x00000000000000000000AA",
  "site_title": "My Server Monitor",
  "display_mode": "bar",
  "verified": false,
  "turnstile_verified": null,
  "theme_options": {
    "a": 1,
    "b": 2
  },
  "long_history_points": 120
}
```

| 字段                   | 類型           | 說明                                     |
| -------------------- | ------------ | -------------------------------------- |
| `version`            | string       | 當前部署自身 Workers 版本                         |
| `is_public`          | boolean      | 站點是否公開                                     |
| `authorization`     | boolean      | 當前請求是否攜帶有效 JWT                           |
| `turnstile_enabled`  | boolean      | 站點是否啟用人機驗證                             |
| `turnstile_login_enabled` | boolean | 登錄是否需要 Turnstile；全局 Turnstile 開啟時該值也為 `true` |
| `turnstile_site_key` | string       | Turnstile 前端公鑰；前端拿到後渲染 widget          |
| `site_title`         | string       | 站點標題                                         |
| `display_mode`       | string       | 內置前端顯示模式：`bar` / `ring` / `table`        |
| `verified`           | boolean      | 當前 Turnstile 驗證狀態；有效的驗證憑證或本次成功驗證的 Token 均可使其為 `true` |
| `turnstile_verified` | string\|null | 當次驗證成功後回寫給客戶端的"已驗證憑證"，客戶端應回存並在 1 小時內複用 |
| `last_workers_version` | string\|null | **僅登錄時出現**；遠程最新 Workers 版本，來源為 GitHub `version.json`，後端緩存 5 分鐘 |
| `last_agent_version` | string\|null | **僅登錄時出現**；遠程最新 Agent 版本，來源為 GitHub `version.json`，後端緩存 5 分鐘 |
| `theme_options`      | object       | 第三方主題自定義配置；未配置時為空對象，匿名請求也會返回 |
| `long_history_points` | number      | 長曆史查詢返回的採樣點數，後臺可選 `60`、`120`、`180`、`240` |

> ~~`X-Turnstile-Token` 攜帶且驗證成功時，響應頭會同步設置 `X-Turnstile-Verified`。~~ **2026-07-26 修訂**：當前前端從響應體的 `turnstile_verified` 保存憑證；響應 Header 尚未實際寫入。

***

### 2.2 `GET /api/servers` - 獲取服務器列表（首頁）

**Request**

- Method：`GET`
- Path：`/api/servers`
- Headers（按需）：`Authorization: Bearer <jwt>`、`X-Turnstile-Token` 或 `X-Turnstile-Verified`

**Response** `200 OK`

```json
{
  "servers": [ /* Server[]，見 5.1 */ ],
  "latestReportUpdates": [
    {
      "serverId": "9b2c...",
      "reportTs": 1737638405000,
      "reportAgeMs": 1200,
      "samples": [
        {
          "ts": 1737638400000,
          "data": {
            "cpu": 12.34,
            "ram_total": 8192,
            "ram_used": 3700,
            "swap_total": 1024,
            "swap_used": 64,
            "net_in_speed": 1024,
            "net_out_speed": 512
          }
        }
      ]
    }
  ],
  "stats": {
    "total": 10,
    "online": 8,
    "offline": 2,
    "globalSpeedIn": 1234.5,
    "globalSpeedOut": 567.8,
    "globalNetTx": 1234567890,
    "globalNetRx": 9876543210
  },
  "regionStats": { "US": 3, "JP": 2, "CN": 5 },
  "sysConfig": {
    "show_price": true,
    "show_expire": true,
    "show_tf": true,
    "show_time": true,
    "display_mode": "bar"
  }
}
```

| 字段            | 說明                                                                    |
| ------------- | --------------------------------------------------------------------- |
| `servers`     | 已合併最新指標的服務器列表（按 `sort_order ASC`），未登錄用戶**自動過濾** **`is_hidden = '1'`** |
| `latestReportUpdates` | 每臺服務器最近一次批量上報的採樣回放數據，用於新頁面連續回放；來自 Worker/DO 內存緩存，緩存約 5 分鐘，進程重啟或 DO 回收後允許為空。REST 響應中的樣本統一為 `{ ts, data }`，`data` 按探針批量採樣包透傳；內置探針默認只在普通採樣點上報 `cpu`、`ram_total`、`ram_used`、`swap_total`、`swap_used`、`net_in_speed`、`net_out_speed` |
| `stats`       | 聚合統計：在線閾值 300 秒（5 分鐘無上報視為離線）                                          |
| `regionStats` | 按 ISO 區域碼（大寫）統計的服務器數                                                  |
| `sysConfig`   | 當前站點開關：`show_price`、`show_expire`、`show_tf`、`show_time`、`display_mode`。主題配置請從 `/api/config` 的 `theme_options` 讀取。~~舊版示例中的 `site_title` 不在該對象內。~~（2026-07-26 修訂） |

***

### 2.3 `GET /api/server` - 獲取單臺服務器詳情

**Request**

- Method：`GET`
- Path：`/api/server`
- Query：
  - `id`（**必填**）：服務器 UUID
- Headers（按需）：同 `/api/servers`

**Response** `200 OK`

```json
{
  "id": "9b2c...",
  "name": "HK-01",
  "server_group": "HK",
  "price": "30.00",
  "billing_cycle": "month",
  "auto_renewal": "0",
  "currency": "¥",
  "expire_date": "2026-12-31",
  "traffic_limit": "1TB",
  "traffic_calc_type": "total",
  "interface": "eth0,ens3",
  "reset_day": 1,
  "collect_interval": 1,
  "report_interval": 60,
  "is_hidden": "0",
  "sort_order": 0,
  "cpu": 12.34,
  "load_avg": "0.10 0.20 0.30",
  "net_in_speed": 1024,
  "net_out_speed": 512,
  "net_rx": 12345678,
  "net_tx": 87654321,
  "net_rx_monthly": 1073741824,
  "net_tx_monthly": 536870912,
  "processes": 256,
  "tcp_conn": 32,
  "udp_conn": 4,
  "ping_ct": 23,
  "ping_cu": 25,
  "ping_cm": 30,
  "ping_bd": 40,
  "loss_ct": 0,
  "loss_cu": 0,
  "loss_cm": 0,
  "loss_bd": 0,
  "ram_total": 8192,
  "ram_used": 3700,
  "swap_total": 2048,
  "swap_used": 100,
  "disk_total": 102400,
  "disk_used": 32000,
  "cpu_cores": 4,
  "cpu_info": "Intel(R) Xeon(R) CPU",
  "gpu_info": "[{\"id\":\"0\",\"name\":\"NVIDIA GeForce RTX 3060\",\"info\":12.5}]",
  "arch": "x86_64",
  "os": "Ubuntu 22.04",
  "kernel_version": "6.8.0-36-generic",
  "region": "HK",
  "ip_v4": "1",
  "ip_v6": "1",
  "boot_time": "1700000000000",
  "last_updated": 1737638400000,
  "timestamp": 1737000000000,
  "latestReportUpdates": [
    {
      "serverId": "9b2c...",
      "reportTs": 1737638405000,
      "reportAgeMs": 1200,
      "samples": [
        {
          "ts": 1737638400000,
          "data": {
            "cpu": 12.34,
            "ram_total": 8192,
            "ram_used": 3700,
            "swap_total": 1024,
            "swap_used": 64,
            "net_in_speed": 1024,
            "net_out_speed": 512
          }
        }
      ]
    }
  ],
  "sysConfig": { "long_history_points": 120 }
}
```

> `last_updated` 來自最新指標；`timestamp` 是服務器配置記錄的創建/導入時間字段，普通編輯不會刷新它。~~兩者都表示最近上報時間。~~（2026-07-26 修訂）
> `latestReportUpdates` 與 `/api/servers` 同名字段形狀一致，僅包含當前服務器最近一次批量上報的採樣回放包；用於詳情頁打開時連續回放。REST 樣本統一為 `{ ts, data }`，`data` 按探針採樣包透傳。緩存約 5 分鐘，Worker/DO 重啟後允許為空數組。

**失敗返回**：

- `400 { "error": "Missing ID", "code": 400 }` 缺少 `id`
- `404 { "error": "Server not found", "code": 404 }` 不存在 / 被隱藏（未登錄訪問時）

***

### 2.4 `GET /api/history/all` - 獲取歷史指標

**Request**

- Method：`GET`
- Path：`/api/history/all`
- Query：
  - `id`（**必填**）：服務器 UUID
  - `hours`（可選，默認 `24`）：只接受 `0.167`、`0.5`、`1`、`6`、`12`、`24`、`48`、`96`、`168`。~~任意不超過 168 的浮點數均可使用。~~（2026-07-26 修訂）
- Headers（按需）：同 `/api/servers`

**Response** `200 OK`

~~舊版文檔將響應描述為 `{columns, rows}` 包裝對象。~~ **2026-07-26 修訂**：當前直接返回 `HistoryRow[]`。

```json
[
  {
    "timestamp": 1737600000000,
    "cpu": 12.3,
    "gpu_info": "[{\"id\":\"0\",\"name\":\"NVIDIA GPU\",\"info\":12.5}]",
    "ram_total": 8192,
    "ram_used": 3700,
    "disk_total": 102400,
    "disk_used": 32000,
    "region": "HK"
  }
]
```

**採樣間隔（自動）**

~~舊版按 `≤1 / 1~6 / 6~12 / 12~24 / 24~48 / 48~96 / 96~168` 小時使用固定步長，並把大於 168 的值截斷。~~ **2026-07-26 修訂**：當前不接受白名單之外的時長；長曆史查詢按後臺 `long_history_points` 配置動態計算窗口，默認 120 個點：

```text
intervalMs = max(10_000, ceil(hours * 60 * 60 * 1000 / long_history_points))
```

> 歷史查詢使用 `ROW_NUMBER() OVER (PARTITION BY ts/interval ORDER BY ts)` 取每個採樣窗口的第一條。

~~**跨月查詢**：當查詢早於當月 1 日時讀取舊錶。~~ **2026-07-26 修訂**：歷史表在每週日 00:00 UTC 輪換；當查詢起點早於本週日且存在 `metrics_history_old` 時，自動 `UNION ALL` 當前表和舊錶。

**緩存**：命中內存緩存時返回 `X-Cache: HIT`，反之 `MISS`。TTL 取決於 `hours`：

| hours | TTL   |
| ----- | ----- |
| ≥ 120 | 10 分鐘 |
| ≥ 60  | 5 分鐘  |
| ≥ 30  | 3 分鐘  |
| < 30  | 1 分鐘  |

**未登錄限制**：`hours > 24` 時強制 `401`。

**數據庫升級提示**：當 D1 缺少新字段時返回：

~~`{ "code": "DATABASE_UPGRADE_REQUIRED" }`~~

當前響應（2026-07-26）：

```http
HTTP/1.1 409 Conflict
Content-Type: application/json

{"message":"databaseUpgradeRequired"}
```

此時應先調用 [`POST /updateDatabase`](#41-post-updatedatabase---數據庫遷移)。

***

### 2.5 `GET /api/ws` - WebSocket 實時推送

**Request**

- Method：`GET`（**必須**帶 `Upgrade: websocket` Header）
- Path：`/api/ws`
- Query：
  - `subscribe`（可選，默認 `all`）：
    - `all` → 訂閱所有服務器的最新指標（**批量合併推送，每 5 秒一次**）
    - `<serverId>` → 只訂閱指定服務器；~~收到上報後立即實時推送。~~ **2026-07-26 修訂**：同樣經過最長約 5 秒的 Worker 合併窗口

**Response** `101 Switching Protocols`（WebSocket 握手）

**握手 Header 要求**：

```
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Key: <base64>
Sec-WebSocket-Version: 13
```

**推送策略**：

| 訂閱類型 | 推送方式 | 消息類型 | 說明 |
| -------- | ----- | ----- | --- |
| `subscribe=all` | 批量合併，每 5 秒一次 | `batchUpdate` | 減少消息數量，降低前端渲染壓力 |
| `subscribe=<serverId>` | 最長約 5 秒批量窗口 | `batchUpdate` | 單臺服務器詳情頁僅過濾目標 ID，消息仍經統一合併隊列 |

> `subscribe=all` 默認不推送任何服務器更新。客戶端應先調用 `/api/servers` 獲取當前可見服務器列表，再通過 WebSocket 通道發送 `subscribe` 消息，使用 `servers[].id` 作為過濾列表。該過濾是客戶端訂閱範圍控制，不是服務端鑑權。
>
> **安全提示**：`/api/ws` 本身不校驗 JWT、站點公開狀態或 `is_hidden`。知道服務器 ID 的客戶端可以使用單 ID scope 訂閱；如需服務端權限隔離，應先修改實現，不能把 `ids` 過濾當作鑑權。

**服務端 → 客戶端消息**：

1. 連接成功（Hello）
   ```json
   { "type": "hello", "ts": 1737638400000, "subscribed": "all" }
   ```
2. 指標更新（統一使用 `batchUpdate`，`subscribe=all` 和 `subscribe=<serverId>` 均支持）
   ```json
   {
     "type": "batchUpdate",
     "ts": 1737638400000,
     "updates": [
       {
         "serverId": "9b2c...",
         "samples": [
           {
             "ts": 1737638398000,
             "data": { /* Server 增量字段 */ }
           },
           {
             "ts": 1737638399000,
             "data": { /* Server 增量字段；批次最後一條包含本次完整報告狀態 */ }
           }
         ]
       },
       {
         "serverId": "a1f3...",
         "samples": [
           {
             "ts": 1737638398500,
             "data": { /* Server 增量字段；批次最後一條包含本次完整報告狀態 */ }
           }
         ]
       }
     ]
   }
   ```

   批量樣本中的高頻採樣點主要包含 `cpu`、內存、Swap、網速和時間字段；每次上報的最後一個樣本會額外攜帶報告級字段，用於同步磁盤、GPU、進程、連接數、探針、Ping/丟包等無需按採樣率刷新的數據。

**客戶端 → 服務端消息**（可選）：

```json
{ "type": "subscribe", "scope": "all", "ids": ["server-001", "server-002"] }
{ "type": "ping" }   // → 服務端自動回精確字符串 {"type":"pong"}，不含 ts
{ "type": "pong" }   // 靜默忽略
```

`subscribe` 消息用於更新當前 WebSocket 的訂閱範圍：

- `scope`：可選，默認沿用 URL 中的 `subscribe`，通常為 `all`
- `ids`：可選數組，來自 `/api/servers` 返回的 `servers[].id`；`subscribe=all` 時僅推送這些 ID 的更新。最多 500 個，每個 ID 長度 1-64，僅允許字母、數字、`.`、`_`、`:`、`-`

若 `scope` 或 `ids` 格式非法，服務端會關閉 WebSocket 連接（close code `1008`）。

服務端確認消息：

```json
{ "type": "subscribed", "ts": 1737638400000, "subscribed": "all", "count": 2 }
```

**失敗返回**：

- `503 { "error": "WebSocket not enabled", "code": 503 }` —— 未綁定 `METRICS_BROADCASTER` Durable Object
- `426 Expected WebSocket upgrade request` —— 缺少 `Upgrade: websocket` 頭
- `400 Invalid subscription scope` —— URL 中的 `subscribe` 不合法
- `403 Forbidden` ——設置了 WebSocket `Origin`，且不在 `CORS_ALLOWED_ORIGINS` 中
- `500 { "error": "WebSocket error", "code": 500 }` —— Worker 轉發至 DO 失敗

**前端使用示例（subscribe=all，批量推送）**：

```js
const { servers } = await (await fetch('/api/servers')).json();
const ids = servers.map(s => s.id);
const ws = new WebSocket('wss://status.example.com/api/ws?subscribe=all');
ws.onopen = () => {
  ws.send(JSON.stringify({ type: 'subscribe', scope: 'all', ids }));
};
ws.onmessage = (ev) => {
  const msg = JSON.parse(ev.data);
  if (msg.type === 'batchUpdate') {
    for (const u of msg.updates) {
      // 更新對應 serverId 的卡片
      for (const s of u.samples || []) {
        updateServer(u.serverId, s.data);
      }
    }
  }
};
```

**前端使用示例（subscribe=serverId，單服務器推送）**：

```js
const ws = new WebSocket('wss://status.example.com/api/ws?subscribe=server-001');
ws.onmessage = (ev) => {
  const msg = JSON.parse(ev.data);
  if (msg.type === 'batchUpdate') {
    for (const u of msg.updates) {
      for (const s of u.samples) {
        updateServer(u.serverId, s.data);
      }
    }
  }
};
```

***

### 2.6 `GET /theme` - 獲取主題商店數據

> **鑑權 / Turnstile**：均不參與。

從以下上游讀取並規範化主題商店清單，Worker 內存緩存 300 秒：

```text
https://raw.githubusercontent.com/huilang-me/CFSM-Theme-Store/refs/heads/main/themes.json
```

**Response 200**

```json
{
  "schema": 1,
  "themes": [
    {
      "name": "Example Theme",
      "url": "https://github.com/Tokinx/cf-server-monitor-theme-emerald",
      "branch": "build",
      "versions": [
        {
          "short_version": "8cea2bb",
          "title": "update theme to 2024-01-01",
          "releaseDate": "2024-01-01",
          "changelog": "update theme",
          "commitId": "8cea2bbdbadb50684f2e97e13f7b2149ef99911b",
          "theme_url": "https://github.com/Tokinx/cf-server-monitor-theme-emerald/tree/8cea2bbdbadb50684f2e97e13f7b2149ef99911b"
        }
      ]
    }
  ]
}
```

- 上游對象的其他字段原樣保留。
- 主題對象配置 GitHub 倉庫 `url` 和 `branch` 時，會通過 GitHub commits API 讀取該分支最近 10 個 commit，並生成可直接寫入 `theme_url` 的版本列表；`/theme` 響應裡的 `versions` 只由 commits API 生成。commits API 失敗時不會刷新內存緩存；已有成功緩存時返回舊緩存，無緩存時該主題 `versions` 返回空數組。管理端主題商店會對空 `versions` 主題執行瀏覽器端 GitHub commits API fallback 補齊版本下拉。
- `schema` 缺失時補為 `1`；`themes` 不是數組時補為空數組；上游 `themes.json` 不需要提供 `versions`。
- 上游失敗時返回已有內存緩存，即使它已經超過 300 秒 TTL；從未成功緩存時返回 `{ "schema": 1, "themes": [] }`，HTTP 狀態仍為 `200`。

***

### 2.7 前端與主題代理

這些路徑返回 HTML 或靜態文件，不使用統一 JSON 響應格式。

| Path | 行為 |
| ---- | ---- |
| `/`、`/#/`、`/#/server/:id` 等前臺路徑 | `theme_url` 為空時返回內置主題；配置第三方主題時返回反代後的主題 `index.html` |
| `/admin` | 始終返回內置默認主題的管理後臺入口 |
| `/admin/` | `302` 跳轉到 `/admin#admin` |
| `/assets/*` | 配置或預覽第三方主題時反代對應主題 `assets/`；從 `/admin` 引用時優先返回內置靜態資源 |
| 其他靜態路徑 | 不走主題反代，仍由項目原有 ASSETS 或 public 文件處理 |

**主題 URL 規則**：

```text
https://github.com/<owner>/<theme-repo>/tree/<commit-or-branch>[/theme-subdir]
```

主題商店會保存由獨立 GitHub 主題倉庫 commit 生成的 tree 地址。建議使用 commit id 固定版本。

**反代規則**：

- 只代理主題目錄下的 `index.html` 和 `assets/*`
- GitHub raw 默認 `text/plain` 會被 Worker 按文件後綴修正為 CSS、JS、圖片、字體等對應 `Content-Type`
- 遠程主題 `index.html` 和 `assets/*` 使用 `caches.default` 緩存：commit id 固定版 1 天，分支名版本 1 小時，緩存 key 包含 Git ref、作者、主題目錄和資源路徑
- 主題商店列表 `/theme` 使用 Worker 內存緩存 5 分鐘
- 最終 HTML 會注入站點標題、背景圖、自定義 `<head>`、自定義腳本，並移除主題自帶 CSP meta
- CSP 通過 HTTP Response Header 返回，同時設置 `X-Frame-Options: DENY`
- 主題 `index.html` 不可用時返回 `502 Theme index.html is unavailable`，不會自動回落到內置主題
- 主題資源不可用時返回對應錯誤狀態，不會回落成內置靜態文件

**預覽鑑權**：

`/?theme_url=...` 只在已登錄管理員通過 `start_theme_preview` 獲取臨時授權後生效。授權 cookie 有效期 10 分鐘；未授權直接訪問會返回 `401 Theme preview requires admin login`。

***

## 3. 管理端 API（鑑權）

### 3.1 `POST /admin/api` - 管理操作入口

> 所有管理操作都通過這一個端點 + `action` 字段路由。

**Request**

- Method：`POST`
- Path：`/admin/api`
- Headers（除 `login` 外必填）：
  ```
  Content-Type: application/json
  Authorization: Bearer <jwt>
  ```
- Body（JSON）：
  ```json
  { "action": "<one of: login|clear_theme_preview_auth|get_settings|start_theme_preview|list|d1_usage|send_test_notification|save_settings|add|delete|save_order|edit|batch_delete|export_servers|import_servers>", ...payload }
  ```

**Turnstile**：

- 僅 `action: login` 啟用 Turnstile 驗證（請求頭 `X-Turnstile-Token`）；當 `turnstile_enabled` **或** `turnstile_login_enabled` 為 `true` 時要求 token
- 其他 action：**不**走 Turnstile 流程（白名單 bypass）

**Response**：~~所有響應統一為 `200 OK`。~~ **2026-07-26 修訂**：成功響應通常為 `200`；參數、鑑權、Turnstile 或未捕獲異常分別使用實際的 `4xx/5xx` 狀態碼。具體結構見下文各小節。

***

### 3.2 `action: login` - 登錄

**Request**

```json
{
  "action": "login",
  "username": "admin",
  "password": "<plain text>"
}
```

Header：`X-Turnstile-Token: <token>`（當 `site_options.turnstile_enabled` 或 `turnstile_login_enabled` 為 `true` 時**必填**）

**Response 200**

```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbiIsImlhdCI6MTczNzYzODQwMCwiZXhwIjoxNzM4MjQzMjAwfQ.signature",
  "message": "loginSuccessful"
}
```

**Response 失敗**

- ~~`400 { "error": "Missing username or password" }`~~ → `400 { "error": "missingCredentials", "code": 400 }`
- ~~`401 { "error": "Invalid username or password" }`~~ → `401 { "error": "invalidCredentials", "code": 401 }`
- ~~`403 { "error": "Turnstile verification failed" }`~~ → `403 { "error": "verificationFailed", "code": 403 }`

> 錯誤字符串是供前端 i18n 使用的 message key，並非穩定的人類可讀英文。（2026-07-26 修訂）

***

### 3.3 `action: get_settings` - 讀取全部設置

**Request**

```json
{ "action": "get_settings" }
```

**Response 200**

```json
{
  "success": true,
  "settings": { /* Settings 對象，見 5.4 */ },
  "api_secret": "<env.API_SECRET>"
}
```

> `api_secret` 僅在 `get_settings` 中返回，方便前端展示/複製。
>
> ~~`settings` 包含 `jwt_secret`。~~ **2026-07-26 修訂**：後端會從返回對象中剔除 `jwt_secret`；其他敏感值（如密碼哈希、Cloudflare Token、Turnstile Secret）仍可能存在，必須使用 HTTPS 並限制管理 Token。

***

### 3.4 `action: list` - 列出全部服務器（含在線/統計）

**Request**

```json
{ "action": "list" }
```

**Response 200**

```json
{
  "success": true,
  "servers": [ /* Server[]，包含 is_hidden、is_online 等所有字段 */ ],
  "stats": {
    "total": 10,
    "online": 8,
    "offline": 2,
    "total_cpu": 96.3,
    "total_net_in": 12345.6,
    "total_net_out": 7890.1,
    "avg_cpu": "12.04"
  }
}
```

| 字段             | 說明                      |
| -------------- | ----------------------- |
| `is_online`    | `true` = 最近 5 分鐘內有上報    |
| `last_updated` | 最近一次上報時間戳（毫秒）           |
| `stats.avg_cpu` | 僅按在線服務器平均，保留 2 位小數（在線服務器存在時為字符串；初始值為 number `0`） |

> 注意：本接口**包含** `is_hidden=1` 的服務器（與 `/api/servers` 不同）。
>
> ~~舊版示例中的 `total_ram`、`total_disk`、`avg_ram`、`avg_disk` 會返回。~~ **2026-07-26 修訂**：當前實現不計算這些字段。

***

### 3.5 `action: d1_usage` - D1 / Workers 用量

**Request**

```json
{
  "action": "d1_usage",
  "cloudflare_token": "<optional override>",
  "cloudflare_account_id": "<optional override>"
}
```

**前置條件**：Cloudflare Token 與 Account ID 必須通過請求體提供，或已保存在 `site_options`。請求體字段存在時優先使用，即使值為空字符串也會覆蓋保存值。

**Response 200**

```json
{
  "success": true,
  "usage": {
    "today": {
      "rowsRead": 12345,
      "rowsWritten": 678,
      "workersRequests": 1234
    },
    "yesterday": {
      "rowsRead": 23456,
      "rowsWritten": 789,
      "workersRequests": 2345
    }
  },
  "message": "d1UsageQueried"
}
```

> ~~響應會返回日期、套餐限額、剩餘額度、數據庫數量和 Account ID。~~ **2026-07-26 修訂**：當前只返回兩個時間範圍的 `rowsRead`、`rowsWritten`、`workersRequests`；額度由前端自行展示，不屬於 API 響應。
>
> **統計窗口**：`today` 為 UTC 當日 `00:00:00` 至 `23:59:59`；`yesterday` 為 UTC 昨日 `00:00:00` 至 `23:59:59`。

**Response 失敗**

- `400 { "error": "cloudflareTokenRequired", "code": 400 }`
- `400 { "error": "cloudflareAccountIdRequired", "code": 400 }`
- `400 { "error": "<Cloudflare GraphQL 錯誤信息>", "code": 400 }`

> 通過 Cloudflare GraphQL API（`https://api.cloudflare.com/client/v4/graphql`）查詢：
>
> - `d1AnalyticsAdaptiveGroups`（`rowsRead` / `rowsWritten`）
> - `workersInvocationsAdaptive`（`requests`）

***

### 3.6 `action: save_settings` - 保存設置

**Request**

```json
{
  "action": "save_settings",
  "settings": {
    "site_title": "My Server Monitor",
    "custom_bg": "https://...",
    "custom_head": "<style>...</style>",
    "custom_script": "console.log('hi');",
    "csp_static": "https://static.example.com",
    "csp_api": "https://api.example.com",
    "display_mode": "bar",
    "theme_url": "https://github.com/Tokinx/cf-server-monitor-theme-emerald/tree/8cea2bbdbadb50684f2e97e13f7b2149ef99911b",
    "appearance_options": {
      "theme_options": {
        "a": 1,
        "b": 2
      }
    },
    "is_public": "true",
    "show_price": "true",
    "show_expire": "true",
    "show_tf": "true",
    "show_time": "true",
    "long_history_points": "120",
    "tg_notify": "0",
    "tg_bot_token": "",
    "tg_chat_id": "",
    "turnstile_enabled": "false",
    "turnstile_login_enabled": "false",
    "turnstile_site_key": "",
    "turnstile_secret_key": "",
    "jwt_secret": "",
    "username": "admin",
    "password": "<plain text, will be PBKDF2-hashed before save>",
    "cloudflare_account_id": "",
    "cloudflare_token": "",
    "custom_ct": "gd-ct-dualstack.ip.zstaticcdn.com",
    "custom_cu": "gd-cu-dualstack.ip.zstaticcdn.com",
    "custom_cm": "gd-cm-dualstack.ip.zstaticcdn.com",
    "custom_bd": "ip.zstaticcdn.com",
    "expire_reminder": "0"
  }
}
```

**字段分類**：

- `APPEARANCE_FIELDS`（寫入 `appearance_options` JSON）：`site_title`、`custom_bg`、`custom_head`、`custom_script`、`csp_static`、`csp_api`、`display_mode`、`theme_options`
- `SITE_FIELDS`（寫入 `site_options` JSON）：`is_public`、`show_price`、`show_expire`、`show_tf`、`show_time`、`long_history_points`、通知、Turnstile、賬號、Cloudflare、Ping 節點、`expire_reminder`、`theme_url`、歷史優化字段等站點級配置
- 任何未列出的字段會被忽略

**特殊處理**：

- `password`：以**明文**傳入；後端用 PBKDF2-HMAC-SHA-256（50,000 iterations、16 字節 salt、32 字節 hash）計算後保存為 `pbkdf2_sha256$50000$<salt hex>$<hash hex>`；如傳空字符串則**不更新**密碼；舊版 32 位 MD5 哈希仍可登錄並會在成功登錄後自動升級
- `theme_url`：可單獨通過 `{"settings":{"theme_url":"..."}}` 保存；允許 `https://github.com/<owner>/<repo>/tree/<commit-or-branch>[/theme-subdir]` 格式。保存前會請求對應 raw `index.html` 驗證可用性，失敗返回 `400 invalidThemeUrl`，不會保存
- Ping 節點字段：僅校驗本次請求中出現的 `custom_ct/custom_cu/custom_cm/custom_bd` 字段，因此只保存 `theme_url` 不會觸發 Ping 節點格式校驗
- Turnstile：本次請求把 `turnstile_enabled` 或 `turnstile_login_enabled` 設為 `true` 時，必須同時提供非空 `turnstile_site_key` 與 `turnstile_secret_key`
- 通知：規範化後的 `tg_notify` 非 `0`，或 `expire_reminder` 為 `1`-`7` 時，必須提供非空 `tg_bot_token`
- `appearance_options` / `theme_options`：必須是非數組對象；`display_mode` 規範為 `bar` / `ring` / `table`
- `csp_static` / `csp_api`：逗號分隔，只保留不帶憑據、路徑、查詢或 fragment 的 HTTPS origin，非法項會被靜默過濾
- 外觀設置不是字段級合併：請求中只要出現任一外觀字段或 `appearance_options`，後端就會用本次提供的外觀字段重寫整個 `appearance_options` JSON；部分更新時應先讀取並回傳完整外觀對象
- `jwt_secret` 不在保存階段校驗長度；只有長度至少 32 的值會用於簽名，空值或短值在下一次加載設置時會被新生成並持久化的隨機密鑰替換

**Response 200**

```json
{ "success": true, "message": "updateSuccess" }
```

> 副作用：清空 `site_options` 內存緩存，下一次請求會從 DB 重新加載。

***

### 3.6.1 `action: start_theme_preview` - 生成主題預覽授權

**Request**

```json
{
  "action": "start_theme_preview",
  "theme_url": "https://github.com/Tokinx/cf-server-monitor-theme-emerald/tree/8cea2bbdbadb50684f2e97e13f7b2149ef99911b"
}
```

**行為**：

- 需要攜帶有效 `Authorization: Bearer <jwt>`
- 校驗 `theme_url` 格式，並請求對應 raw `index.html` 確認可訪問
- 成功後設置 HttpOnly Cookie：`cfsm_theme_preview_auth`，有效期 600 秒
- 返回可直接打開的預覽地址：`/?theme_url=<encoded theme_url>`

**Response 200**

```json
{
  "success": true,
  "preview_url": "https://status.example.com/?theme_url=https%3A%2F%2Fgithub.com%2FTokinx%2Fcf-server-monitor-theme-emerald%2Ftree%2F8cea2bbdbadb50684f2e97e13f7b2149ef99911b"
}
```

失敗時返回 `400 invalidThemeUrl` 或 `401 Unauthorized`。

***

### 3.6.2 `action: clear_theme_preview_auth` - 清除主題預覽授權

**Request**

```json
{ "action": "clear_theme_preview_auth" }
```

**行為**：清除 `cfsm_theme_preview_auth` Cookie。該 action 可在未登錄時調用，用於離開管理頁後清理臨時預覽授權。

**Response 200**

```json
{ "success": true }
```

***

### 3.7 `action: add` - 新增服務器

**Request**

```json
{ "action": "add", "name": "New Server", "server_group": "Default" }
```

**Response 200**

```json
{
  "success": true,
  "id": "<newly generated UUID v4>",
  "message": "serverAdded"
}
```

**約束**：

- `name`：1 \~ 100 字符，否則 `400 { "error": "服務器名稱無效", "code": 400 }`
- `server_group`：默認 `Default`
- `sort_order`：自動 = `MAX(sort_order) + 1`

***

### 3.8 `action: edit` - 修改服務器信息

**Request**

```jsonc
{
  "action": "edit",
  "id": "<server UUID>",
  "name": "HK-01",
  "server_group": "HK",               // 默認 "Default"
  "tags": "production,hk",
  "note": "Primary node",
  "price": "30.00",                   // 字符串，保存時自動轉換為兩位小數；"0" 或 "-1" 表示免費，空白表示未設置
  "billing_cycle": "month",            // month | quarter | half_year | year | two_years | three_years | four_years | five_years
  "auto_renewal": "0",                 // "0" | "1"
  "currency": "¥",                     // ¥ | $ | € | £ | ₽ | ₣ | ₹ | ₫ | ฿
  "expire_date": "2026-12-31",
  "traffic_limit": "1TB",
  "traffic_calc_type": "total",       // total | ...
  "interface": "eth0,ens3",           // 指定統計網卡，多個用英文逗號分隔；空值自動彙總
  "reset_day": 1,                     // 必傳整數：0 ~ 31
  "collect_interval": 1,              // 必傳：0 | 1 | 2 | 5 | 10
  "report_interval": 60,              // 必傳：30 | 60 | 120 | 180
  "auto_update": "0",                // boolean-like，規範為 "0" | "1"
  "custom_ct": "gd-ct-dualstack.ip.zstaticcdn.com",
  "custom_cu": "gd-cu-dualstack.ip.zstaticcdn.com",
  "custom_cm": "gd-cm-dualstack.ip.zstaticcdn.com",
  "custom_bd": "ip.zstaticcdn.com",
  "rx_correction": null,              // null/空或 0 ~ 1000000
  "tx_correction": null,
  "offline_notify_disabled": "0",
  "is_hidden": "0"
}
```

**校驗與覆蓋規則（2026-07-26）**：

- ~~`reset_day` 只允許 `1~31`，三個探針配置字段均可省略。~~ 當前 `reset_day` 允許 `0~31`，且 `reset_day`、`collect_interval`、`report_interval` 都必須作為 JSON number 傳入；組合最多生成 300 個樣本/次上報。
- 當前實現按整行覆蓋：省略 `name` 會保存為空字符串，省略 `server_group` 會保存 `Default`，其他多個字段也會回落為空值或默認值。調用方應先讀取 `list` 後提交完整編輯對象。
- `tags` 最多保留 12 個，每個最多 32 字符並過濾特殊字符；`note` 去除首尾空白後最多 500 字符。
- 自定義 Ping 節點接受 `host` 或 `host:port`；流量修正接受 `null`/空值或 `0~1000000` 數字。
- 當前實現不檢查 `UPDATE` 的影響行數；格式合法但不存在的 UUID 也可能返回成功。

**Response 200**

```json
{ "success": true, "message": "serverUpdated" }
```

**Response 失敗**

- `400 { "error": "invalidServerId", "code": 400 }` —— UUID 格式錯
- `400` + `collect_interval/report_interval/reset_day` 校驗消息 —— 探針配置不合法
- `400 { "error": "invalidPingNodeFormat", "code": 400 }`
- `400 { "error": "invalidTrafficCorrection", "code": 400 }`
- ~~DB 缺字段時返回 `500 Update failed...`。~~ **2026-07-26 修訂**：後端會先嚐試補列，再返回 `400 { "error": "dbColumnsAdded", "code": 400 }`，客戶端應重新提交編輯請求

***

### 3.9 `action: delete` - 刪除服務器

**Request**

```json
{ "action": "delete", "id": "<server UUID>" }
```

**副作用**：~~級聯刪除該 server 的全部 `metrics_history` 記錄。~~ **2026-07-26 修訂**：後端僅在 `PRAGMA foreign_key_list(metrics_history)` / `metrics_history_old` 返回外鍵時，才會顯式刪除對應歷史行；當前標準建表結構沒有定義該外鍵，因此通常只刪除 `servers` 記錄，歷史行會保留到表輪換或清空歷史。合法但不存在的 UUID 也可能返回成功。

**Response 200**

```json
{ "success": true, "message": "serverDeleted" }
```

UUID 缺失或格式非法時返回 `400 { "error": "invalidServerId", "code": 400 }`。

***

### 3.10 `action: batch_delete` - 批量刪除

**Request**

```json
{ "action": "batch_delete", "ids": ["<uuid1>", "<uuid2>", "<uuid3>"] }
```

**Response 200**

```json
{ "success": true, "message": "batchDeleted" }
```

批量刪除沿用單條刪除的歷史數據處理規則；`ids` 不是非空數組時返回 `400 selectServersToDelete`，任一 UUID 格式非法時整批返回 `400 invalidServerIdInList`，合法但不存在的 UUID 不會單獨報錯。

***

### 3.11 `action: save_order` - 保存服務器排序

**Request**

```json
{ "action": "save_order", "orders": ["<uuid1>", "<uuid2>", "<uuid3>"] }
```

**說明**：

- `orders[i]` 表示該 UUID 排序後應為第 `i` 位（`sort_order = i`）
- 服務端會逐條 `UPDATE sort_order = ? WHERE id = ?`
- `orders` 不是非空數組時返回 `400 missingSortData`；任一 UUID 格式非法時返回 `400 invalidSortId`
- 合法但不存在的 UUID 不會單獨報錯，仍可能返回成功

**Response 200**

```json
{ "success": true, "message": "sortOrderSaved" }
```

***

### 3.12 `action: send_test_notification` - 發送測試通知

使用請求體內的 Telegram Bot 配置發送一條測試消息，不會自動讀取或保存站點設置。

**Request**

```json
{
  "action": "send_test_notification",
  "tg_bot_token": "<Telegram Bot Token>",
  "tg_chat_id": "<Chat ID>"
}
```

**Response 200**

```json
{ "success": true, "message": "testNotificationSent" }
```

**失敗返回**：`400 tgBotTokenRequired` 或 `400 testNotificationFailed`。

***

### 3.13 `action: export_servers` - 導出服務器

導出 `servers` 表全部配置，按 `sort_order` 升序排列；不包含歷史指標。

**Request**

```json
{ "action": "export_servers" }
```

**Response 200**

```json
{
  "success": true,
  "servers": [
    { "id": "9b2c4d3e-1a2b-4c5d-9e8f-7a6b5c4d3e2f", "name": "HK-01", "sort_order": 0 }
  ],
  "message": "serversExported"
}
```

**失敗返回**：`400 serversExportFailed`。

***

### 3.14 `action: import_servers` - 導入服務器

**Request**

```json
{
  "action": "import_servers",
  "servers": [
    { "id": "9b2c4d3e-1a2b-4c5d-9e8f-7a6b5c4d3e2f", "name": "HK-01", "server_group": "HK" }
  ]
}
```

**行為說明**：

- `servers` 不是非空數組時返回 `400 noServersToImport`
- UUID 非法或與現有服務器重複的記錄會被跳過
- `history_partition_id` 非法、重複或超出允許範圍時會重新分配；無可用分區時跳過該記錄
- 僅導入服務器配置，不導入 `metrics_history`；單行插入失敗也會跳過，並繼續處理後續記錄

**Response 200**

```json
{
  "success": true,
  "imported": 2,
  "skipped": 1,
  "skippedIds": ["<duplicate-or-invalid-id>"],
  "message": "serversImported"
}
```

全部記錄均跳過時仍返回 `200`，`message` 為 `noServersImported`。

***

## 4. 系統維護端點

> 以下端點需 JWT 鑑權（`Authorization: Bearer <token>`），不參與 Turnstile。

### 4.1 `POST /updateDatabase` - 數據庫遷移

> 用於老版本升級時補齊 `metrics_history` 與 `servers` 表的字段、並清理廢棄 settings。

**Request**

- Method：`POST`
- Path：`/updateDatabase`
- Headers：`Authorization: Bearer <jwt>`

**Response 200**

```json
{
  "success": true,
  "message": "databaseUpgradeSuccess",
  "results": [
    { "name": "metrics_history 索引檢查", "success": true, "created": false, "message": "..." },
    { "name": "servers 表列更新", "success": true, "added": 5 },
    { "name": "servers 表多餘字段清理", "success": true, "cleaned": 30, "message": "..." },
    { "name": "metrics_history 表列更新", "success": true, "added": 14 },
    { "name": "廢棄 settings key 清理", "success": true, "cleaned": 0 },
    { "name": "刪除棄用的 metrics_aggregated 表", "success": true, "dropped": 0, "message": "..." }
  ]
}
```

~~升級步驟包括 `metrics_history load -> load_avg` 遷移和 `metrics_history` 寫入優化。~~ **2026-07-26 修訂**：當前順序為歷史表索引檢查、補齊 `servers` 列、清理 `servers` 多餘列、補齊 `metrics_history` 列、清理廢棄設置、刪除棄用的 `metrics_aggregated` 表。

~~任一步驟拋錯時返回 HTTP 500。~~ **2026-07-26 修訂**：升級函數會捕獲未被子步驟處理的錯誤並返回 `{ "success": false, "message": "databaseUpgradeFailed", "error": "...", "results": [...] }`；路由仍使用成功響應包裝，因此通常為 HTTP `200`。各子步驟本身也會捕獲錯誤，所以頂層 `success: true` 時 `results[]` 仍可能含 `success: false`，調用方必須同時檢查兩層狀態。

***

### 4.2 `POST /clearHistory` - 清空歷史數據

> **危險操作**：會刪除 `metrics_history` / `metrics_history_old` 全部數據後重建。

**Request**

- Method：`POST`
- Path：`/clearHistory`
- Headers：`Authorization: Bearer <jwt>`

**Response 200**

```json
{ "success": true, "message": "databaseRebuiltSuccess" }
```

失敗時返回 `{ "success": false, "message": "databaseRebuiltFailed", "error": "..." }`；與數據庫升級相同，路由通常仍返回 HTTP `200`，必須檢查業務 `success`。

***

### 4.3 `GET /__do/health` - Durable Object 健康檢查

**Request**

- Method：`GET`
- Path：`/__do/health`
- Headers：無需鑑權

**Response 200**

```json
{ "ok": true, "subscribers": 3 }
```

或

```json
{ "ok": false, "reason": "DO not bound" }
{ "ok": false, "reason": "<error message>" }
```

***

## 5. 數據結構

### 5.1 Server 對象

| 字段                                            | 類型                 | 說明                        |
| --------------------------------------------- | ------------------ | ------------------------- |
| `id`                                          | string (UUID)      | 主鍵                        |
| `name`                                        | string             | 顯示名                       |
| `server_group`                                | string             | 分組                        |
| `tags`                                        | string             | 逗號分隔標籤；編輯時最多保留 12 個，每個最長 32 字符 |
| `note`                                        | string             | 管理備註；僅管理端 `list` / 導出返回，公共接口會刪除 |
| `price`                                       | string             | 價格金額文本，保存時規範為兩位小數；`0` 或 `-1` 表示免費，空白表示未設置 |
| `billing_cycle`                               | string             | `month` / `quarter` / `half_year` / `year` / `two_years` / `three_years` / `four_years` / `five_years` |
| `auto_renewal`                                | string `"0"`/`"1"` | 是否啟用自動續費                    |
| `currency`                                    | string             | 貨幣符號：`¥` 人民幣、`$` 美元、`€` 歐元、`£` 英鎊、`₽` 盧布、`₣` 法郎、`₹` 盧比、`₫` 越南盾、`฿` 泰銖 |
| `expire_date`                                 | string             | 到期日 `YYYY-MM-DD`          |
| `traffic_limit`                               | string             | 流量上限文本                    |
| `traffic_calc_type`                           | string             | `total` / 其他              |
| `interface`                                   | string             | 指定網卡統計，多個用英文逗號分隔；空值保持自動彙總 |
| `reset_day`                                   | number             | 流量重置日 `0..31`；`0` 表示不重置 |
| `collect_interval`                            | number             | 採集間隔枚舉：`0` / `1` / `2` / `5` / `10` 秒 |
| `report_interval`                             | number             | 上報間隔枚舉：`30` / `60` / `120` / `180` 秒 |
| `auto_update`                                 | string `"0"`/`"1"` | 探針自動更新；僅管理端 `list` / 導出返回，公共接口會刪除 |
| `custom_ct` / `custom_cu` / `custom_cm` / `custom_bd` | string | 服務器級測速節點 `host[:port]`；為空時使用站點設置 |
| `rx_correction` / `tx_correction`             | number\|null       | 待下發給探針的一次性流量修正值 |
| `offline_notify_disabled`                     | string `"0"`/`"1"` | 是否禁用該服務器的離線通知 |
| `is_hidden`                                   | string `"0"`/`"1"` | 是否在前臺隱藏                   |
| `sort_order`                                  | number             | 排序值（越小越靠前）                |
| `history_partition_id`                        | number             | 歷史記錄 ID 分區編號，由服務端分配 |
| `timestamp`                                   | number             | `servers` 配置記錄的創建/導入時間戳（毫秒），不是最新指標時間 |
| `cpu`                                         | number             | 最新 CPU%（來自最新指標）           |
| `load_avg`                                    | string             | `"x x x"`                 |
| `net_in_speed`                                | number             | B/s                       |
| `net_out_speed`                               | number             | B/s                       |
| `net_rx`                                      | number             | 累計下行字節                    |
| `net_tx`                                      | number             | 累計上行字節                    |
| `net_rx_monthly`                              | number             | 當月累計下行字節                  |
| `net_tx_monthly`                              | number             | 當月累計上行字節                  |
| `processes`                                   | number             | 進程數                       |
| `tcp_conn`                                    | number             | TCP 連接數                   |
| `udp_conn`                                    | number             | UDP 套接字數                  |
| `ping_ct` / `ping_cu` / `ping_cm` / `ping_bd` | number\|null\|false | 各運營商延時 (ms)；`false` 表示禁用該節點 |
| `loss_ct` / `loss_cu` / `loss_cm` / `loss_bd` | number\|null\|false | 各運營商丟包率 (%)；`false` 表示禁用該節點 |
| `ram_total` / `ram_used`                      | number             | MB                        |
| `swap_total` / `swap_used`                    | number             | MB                        |
| `disk_total` / `disk_used`                    | number             | MB                        |
| `cpu_cores`                                   | number             | 邏輯核心數                     |
| `cpu_info`                                    | string             | CPU 型號                    |
| `gpu_info`                                    | array\|string\|null | GPU 列表。實時上報 / WebSocket 可能是 `[{id,name,info}]` 數組；REST 詳情和歷史接口通常是同結構的 JSON 字符串，其中 `info` 為佔用率 |
| `arch`                                        | string             | 架構                        |
| `os`                                          | string             | OS 名稱                     |
| `kernel_version`                              | string             | 內核版本                    |
| `agent_version`                               | string             | 最新一次上報的探針版本號              |
| `region`                                      | string             | `request.cf.country` 或 `cf-ipcountry` 的原始值；通常為大寫兩字母國家/地區代碼 |
| `ip_v4`                                       | string `"0"`/`"1"` | 公共 REST 接口僅返回 IPv4 可達性，不暴露公網地址 |
| `ip_v6`                                       | string `"0"`/`"1"` | 公共 REST 接口僅返回 IPv6 可達性，不暴露公網地址 |
| `boot_time`                                   | string             | 啟動時間（毫秒）                  |
| `last_updated`                                | number             | 最新指標記錄的 `timestamp`（毫秒） |
| `is_online`                                   | boolean            | 5 分鐘內是否有上報（僅 `list` 接口計算） |
| `sysConfig`                                   | object             | 站點級開關（僅部分接口附帶）            |

### 5.2 Metrics 對象（探針上報 payload）

> 見 [§1.1 metrics 字段表](#11-post-update---指標上報agent-入口)。後端接受字符串或數值，官方 Bash / PowerShell 探針的具體類型並不完全一致；當前 GPU 數據統一使用 `gpu_info`，不返回獨立 `gpu` 字段。

### 5.3 History Row 對象

| 字段          | 類型             | 說明 |
| ----------- | -------------- | ---- |
| `timestamp` | number (ms)    | 採樣時間 |
| 其餘字段        | number\|string\|null | 當前 `/api/history/all` 固定返回：`cpu, gpu_info, ram_total, ram_used, disk_total, disk_used, processes, net_in_speed, net_out_speed, tcp_conn, udp_conn, ping_ct, ping_cu, ping_cm, ping_bd, loss_ct, loss_cu, loss_cm, loss_bd, swap_total, swap_used, load_avg, region, kernel_version`；其中 `gpu_info` 通常是 JSON 數組字符串 |

歷史行不包含單獨的 `gpu` 字段，只包含 `gpu_info`。

### 5.4 Settings 對象

> ~~`get_settings` 直接返回 `site_options` 的全部字段，包括 `jwt_secret`。~~ **2026-07-26 修訂**：返回前會明確刪除 `jwt_secret`，但 `cloudflare_token`、密碼哈希、Turnstile Secret 等其他敏感字段仍可能返回，請只通過 HTTPS 調用並嚴格保護管理 JWT。

```ts
{
  site_title: string,
  custom_bg: string,
  custom_head: string,           // 注入到 </head> 之前
  custom_script: string,         // 注入到 </body> 之前
  csp_static: string,            // 額外靜態資源來源
  csp_api: string,               // 額外 API/WebSocket 來源
  display_mode: 'bar' | 'ring' | 'table',
  theme_options: Record<string, unknown>,
  theme_url: string,             // 第三方主題商店 URL；為空使用內置主題
  is_public: 'true' | 'false',
  show_price: 'true' | 'false',
  show_expire: 'true' | 'false',
  show_tf: 'true' | 'false',
  show_time: 'true' | 'false',
  long_history_points: '60' | '120' | '180' | '240',
  tg_notify: '0' | '2' ... '30',    // 0 = 關閉；舊值 false 兼容為 0，true 兼容為 5
  tg_bot_token: string,
  tg_chat_id: string,
  turnstile_enabled: 'true' | 'false',
  turnstile_login_enabled: 'true' | 'false',
  turnstile_site_key: string,
  turnstile_secret_key: string,
  username: string,
  password: string,              // PBKDF2 哈希值；舊版 MD5 哈希會在成功登錄後自動升級
  cloudflare_account_id: string,
  cloudflare_token: string,
  custom_ct: string,             // 電信測速節點 host[:port]
  custom_cu: string,             // 聯通 host[:port]
  custom_cm: string,             // 移動 host[:port]
  custom_bd: string,             // BGP host[:port]
  expire_reminder: '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7',
  history_id_optimized: 'true' | 'false',
  servers_optimized: 'true' | 'false'
}
```

`jwt_secret` 可通過 `save_settings` 寫入，但不會由 `get_settings` 返回；只有長度至少 32 的值有效，空值或短值會在後續加載時被隨機密鑰替換。

### 5.5 WebSocket 消息

| `type`   | 方向    | Payload                                            |
| -------- | ----- | -------------------------------------------------- |
| `hello`  | S → C | `{ ts: number, subscribed: string }`               |
| `subscribe` | C → S | `{ scope: string, ids: string[] }`              |
| `subscribed` | S → C | `{ ts: number, subscribed: string, count: number }` |
| `ping`   | C → S | 精確文本 `{"type":"ping"}`                       |
| `pong`   | S → C | 自動響應的精確文本 `{"type":"pong"}`，不帶 `ts`   |
| `batchUpdate` | S → C | `{ ts: number, updates: Array<{ serverId: string, samples: Array<{ ts: number, data: Partial<Server> }> }> }` |

客戶端發來的 `pong` 會被靜默忽略；它不是服務端定時發送的雙向心跳協議。

***

## 6. 定時任務 (Cron)

Worker 同時註冊了 cron 觸發器（`scheduled` handler），可在 `wrangler.toml` 配置：

| Cron          | 行為              | 備註                                                             |
| ------------- | --------------- | -------------------------------------------------------------- |
| `*/1 * * * *` | 每分鐘：檢測離線節點      | `checkOfflineNodes`（通知）                                        |
| `0 * * * *`   | 每小時：根據 UTC 日期分支 | 見下表                                                            |
| <br />        | 每週日 0 點：表輪換    | `weeklyCleanup`（刪除舊錶、重命名 metrics\_history → metrics\_history\_old、創建新表） |
| <br />        | 每天 12 點：服務器到期檢測 | `checkExpiringServers`                                         |

每週日 00:00–00:04 UTC 的表輪換窗口內，分鐘任務會跳過離線節點檢測。

DEBUG 模式（`env.DEBUG=1`）下額外提供：

- `0 0 * * 0` → weeklyCleanup
- `0 12 * * *` → checkExpiringServers

***

## 7. 錯誤碼速查表

| code | 名稱                    | 觸發條件                                        |
| ---- | --------------------- | ------------------------------------------- |
| 400  | Bad Request           | 缺參數 / 非法 UUID / 未知 action / 缺 Cloudflare 配置 / `invalidThemeUrl` |
| 401  | Unauthorized          | JWT 失敗 / Basic 失敗 / 站點非公開未登錄 / 探針 secret 錯  |
| 403  | Forbidden             | Turnstile 失敗                                |
| 404  | Not Found             | 服務器不存在；~~也表示 WebSocket DO 未綁定。~~ **2026-07-26 修訂**：DO 未綁定使用 `503` |
| 409  | Conflict              | ~~`DATABASE_UPGRADE_REQUIRED`~~ **2026-07-26 修訂**：D1 缺字段時響應消息為 `databaseUpgradeRequired` |
| 500  | Internal Server Error | 未捕獲異常 / DB 拋錯                               |
| 503  | Service Unavailable   | WebSocket 未啟用或 Durable Object 未綁定          |

***

## 8. 完整 cURL 示例

> 假設部署在 `https://status.example.com`，`API_SECRET=abc123`，服務器 ID 為 `9b2c4d3e-1a2b-4c5d-9e8f-7a6b5c4d3e2f`。

### 8.1 探針上報

```bash
curl -X POST https://status.example.com/update \
  -H "Content-Type: application/json" \
  -d '{
    "id":"9b2c4d3e-1a2b-4c5d-9e8f-7a6b5c4d3e2f",
    "secret":"abc123",
    "metrics":{
      "cpu":"12.34","ram_total":"8192","ram_used":"3700",
      "swap_total":"2048","swap_used":"100",
      "disk_total":"102400","disk_used":"32000",
      "load_avg":"0.10 0.20 0.30","boot_time":"1700000000000",
      "net_rx":"12345678","net_tx":"87654321",
      "net_rx_monthly":"1073741824","net_tx_monthly":"536870912",
      "net_in_speed":"1024","net_out_speed":"512",
      "os":"Ubuntu 22.04","arch":"x86_64","kernel_version":"6.8.0-36-generic","cpu_info":"Intel Xeon","cpu_cores":"4",
      "gpu_info":[{"id":"0","name":"NVIDIA GPU","info":12.5}],
      "processes":"256","tcp_conn":"32","udp_conn":"4",
      "ip_v4":"203.0.113.10","ip_v6":"2001:db8::10",
      "ping_ct":"23","ping_cu":"25","ping_cm":"30","ping_bd":"40"
    }
  }'
```

### 8.2 公共：獲取配置

```bash
curl https://status.example.com/api/config
```

### 8.3 公共：首頁服務器列表

```bash
curl https://status.example.com/api/servers
```

### 8.4 公共：單臺詳情

```bash
curl "https://status.example.com/api/server?id=9b2c4d3e-1a2b-4c5d-9e8f-7a6b5c4d3e2f"
```

### 8.5 公共：24h 歷史

```bash
curl "https://status.example.com/api/history/all?id=9b2c4d3e-1a2b-4c5d-9e8f-7a6b5c4d3e2f&hours=24"
```

### 8.6 管理：登錄

```bash
curl -X POST https://status.example.com/admin/api \
  -H "Content-Type: application/json" \
  -H "X-Turnstile-Token: <token>" \
  -d '{"action":"login","username":"admin","password":"abc123"}'
```

### 8.7 管理：列表（需 JWT）

```bash
TOKEN="eyJhbGc..."
curl -X POST https://status.example.com/admin/api \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"action":"list"}'
```

### 8.8 管理：添加服務器

```bash
curl -X POST https://status.example.com/admin/api \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"action":"add","name":"HK-02","server_group":"HK"}'
```

### 8.9 管理：編輯

```bash
curl -X POST https://status.example.com/admin/api \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"action":"edit","id":"9b2c4d3e-1a2b-4c5d-9e8f-7a6b5c4d3e2f","name":"HK-01","server_group":"HK","price":"35.00","billing_cycle":"month","auto_renewal":"1","currency":"¥","expire_date":"2027-01-01","reset_day":1,"collect_interval":0,"report_interval":60}'
```

### 8.10 管理：刪除

```bash
curl -X POST https://status.example.com/admin/api \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"action":"delete","id":"9b2c4d3e-1a2b-4c5d-9e8f-7a6b5c4d3e2f"}'
```

### 8.11 管理：保存設置

```bash
curl -X POST https://status.example.com/admin/api \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "action":"save_settings",
    "settings":{
      "site_title":"My Status",
      "is_public":"true",
      "long_history_points":"120",
      "turnstile_enabled":"true",
      "turnstile_site_key":"1x00000000000000000000AA",
      "turnstile_secret_key":"1x0000000000000000000000000000000AA"
    }
  }'
```

### 8.12 管理：D1 用量

```bash
curl -X POST https://status.example.com/admin/api \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"action":"d1_usage","cloudflare_account_id":"<account-id>","cloudflare_token":"<api-token>"}'
```

### 8.13 系統：數據庫遷移

```bash
curl -X POST https://status.example.com/updateDatabase \
  -H "Authorization: Bearer $TOKEN"
```

### 8.14 健康檢查

```bash
curl https://status.example.com/__do/health
```

### 8.15 WebSocket（使用 wscat / websocat）

```bash
# 訂閱所有服務器
wscat -c "wss://status.example.com/api/ws?subscribe=all"
# 建連後發送：{"type":"subscribe","scope":"all","ids":["server-id"]}

# 訂閱指定服務器
wscat -c "wss://status.example.com/api/ws?subscribe=9b2c4d3e-1a2b-4c5d-9e8f-7a6b5c4d3e2f"
```

### 8.16 公共：獲取主題商店

```bash
curl https://status.example.com/theme
```

### 8.17 管理：發送測試通知

```bash
curl -X POST https://status.example.com/admin/api \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"action":"send_test_notification","tg_bot_token":"<bot-token>","tg_chat_id":"<chat-id>"}'
```

### 8.18 管理：導出服務器

```bash
curl -X POST https://status.example.com/admin/api \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"action":"export_servers"}'
```

### 8.19 管理：導入服務器

```bash
curl -X POST https://status.example.com/admin/api \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"action":"import_servers","servers":[{"id":"9b2c4d3e-1a2b-4c5d-9e8f-7a6b5c4d3e2f","name":"HK-01","server_group":"HK"}]}'
```

***

## 9. 版本與變更說明

- **2026-07-26**：重新同步 `main` 源碼；當前 Workers 版本為 `2.8.0 Beta`，Agent 版本為 `1.3.2`。補充主題商店、主題代理、最新批次緩存、測試通知、服務器導入/導出及探針動態配置，修正鑑權、歷史查詢、WebSocket、數據庫維護和數據結構說明。
- ~~**v1.x**：當前文檔對應早期 `src/index.js`、`src/handlers/*`、`src/database/schema.js` 主線實現。~~ **2026-07-26 修訂**：文檔現以 `2.8.0 Beta` 的 `main` 分支實現為準。
- **Breaking change**：`/admin/api` 由 `GET?action=...` 改為 `POST {action:...}` 模式，Token 校驗與 Turnstile 走 Header 通道。
- **CORS**：普通 HTTP 響應通過 `CORS_ALLOWED_ORIGINS` 環境變量開啟跨域；不配置時瀏覽器跨域讀取會失敗。WebSocket 握手的特殊行為見 [§0.6](#06-cors)。
- **JWT**：~~未配置 `jwt_secret` 時直接回退到 `API_SECRET` 派生值。~~ **2026-07-26 修訂**：加載設置時會生成並持久化 32 字節隨機密鑰；`API_SECRET` 派生值和固定常量只作為數據庫加載異常等兜底。
- **數據庫升級**：升級到新字段（如 `loss_*`、`net_rx_monthly`、`reset_day` 等）後請調用 `POST /updateDatabase`；~~否則歷史接口可能返回 `409 DATABASE_UPGRADE_REQUIRED`。~~ **2026-07-26 修訂**：當前 409 響應體使用 `{ "message": "databaseUpgradeRequired" }`。

***

> 文檔同步：與源碼 `src/index.js`、`src/middleware/auth.js`、`src/handlers/{admin,dashboard,frontend,theme,update}.js`、`src/durable/MetricsBroadcaster.js`、`src/utils/{settings,errors,cors,csp,cache,metrics,common,serverBilling,version,latestReportCache,agentConfig}.js`、`src/database/{schema,updateDatabase}.js` 一一對應；後續修改任一文件時，請同步更新本文件。
