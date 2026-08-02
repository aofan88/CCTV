# CF-Server-Monitor 第三方主題開發 API 文檔

> 面向第三方主題開發作者的 API 參考。
>
> 本文檔只保留第三方主題可用的公開 API、WebSocket 和靜態目錄約定，不介紹後臺管理接口。
>
> 管理後臺固定由默認主題接管；主題中的管理入口只能跳轉到 `/admin#admin`。

**Base URL**：`https://<your-worker-domain>`

**統一響應頭**：

- `Content-Type: application/json`（除特別說明外）

***

## 目錄

- [0. 運行時配置、構建產物與版本升級提示](#0-運行時配置構建產物與版本升級提示)
- [1. 鑑權與 Turnstile 流程](#1-鑑權與-turnstile-流程)
- **[2. 公開 API](#2-公開-api)**
  - **[2.1 獲取站點配置](#21-獲取站點配置)**
  - **[2.2 獲取服務器列表](#22-獲取服務器列表)**
  - [2.3 獲取服務器詳情](#23-獲取服務器詳情)
  - [2.4 獲取歷史指標](#24-獲取歷史指標)
- [3. WebSocket 實時推送](#3-websocket-實時推送)
- [4. 錯誤處理](#4-錯誤處理)
- [5. 類型定義](#5-類型定義)

***

## 0. 運行時配置、構建產物與版本升級提示

### 0.1 API Base 配置

`config.json` 已廢棄，當前前端不會請求或讀取 `config.json`。

默認情況下，前端使用當前頁面同源地址作為 API Base，即 `window.location.origin`。Worker/Pages 同域部署時無需額外配置。

純靜態主題（例如 GitHub Pages）通過 HTML meta 標籤配置後端地址：

```html
<meta name="apiBase" content="https://<your-worker-domain>,https://<your-worker-domain2>">
```

多個地址用英文逗號分隔。前端會按 `apiBase` 創建對應的 HTTP 請求和 WebSocket 連接，多站模式下每個後端只處理自己返回的服務器 ID。

跨域部署主題時，還需要在每個源站 Cloudflare Workers 的環境變量中添加 `CORS_ALLOWED_ORIGINS`，位置和添加 `API_SECRET` 相同。把本地開發地址和最終上線域名加入白名單；如果 `API_BASE` 配置了多個 Workers，每個 Workers 都要添加這一項。

```
https://localhost:5173,https://[你的github用戶名].github.io
```

該值只填寫 origin，多個值用英文逗號分隔，不要包含路徑、查詢參數或結尾 `/`。如果線上主題域名不是 Worker 同源域名，也必須加入這裡，否則瀏覽器會攔截 API 請求和 WebSocket 連接。

使用項目內置靜態主題構建腳本時，需要在主題項目 `.env` 中配置：

| 環境變量 | 說明 | 默認值 |
| --- | --- | --- |
| `API_BASE` | 後端地址，多個地址用英文逗號分隔 | 必填 https://<your-worker-domain> |
| `TITLE` | 靜態頁面標題 | 選填 |
| `BACKGROUND_IMAGE` | 靜態頁面背景圖 | 選填 |
| `CSP_API` | 追加到 `connect-src` 的 API 白名單 | 選填 |
| `CSP_STATIC` | 追加到靜態資源相關 CSP 指令的白名單 | 選填 |

運行：

```bash
npm run build:github-page
```

純靜態構建時，`API_BASE`、`TITLE`、`BACKGROUND_IMAGE`、`CSP_API`、`CSP_STATIC` 會寫入 HTML 運行時配置。後臺外觀設置中的 `csp_api` 和 `csp_static` 也會影響頁面允許加載的第三方 API 和靜態資源域名。

### 0.2 主題構建產物約定

主題完成後提交到 [huilang-me/CFSM-Theme-Store](https://github.com/huilang-me/CFSM-Theme-Store) 項目。

主題構建產物僅需要：

- `index.html`
- `assets/` 目錄

目錄結構示例：

```
my-theme/
├── index.html
└── assets/
    ├── app.css
    ├── app.js
    └── logo.webp
```

主題開發注意事項：

- 主題提交目錄只能生成 `index.html` 和 `assets/`；不要依賴其他主題目錄或根目錄文件
- 靜態資源應放在主題目錄的 `assets/` 下，並在 HTML/JS/CSS 中使用 `/assets/...` 或相對 `assets/...`
- 旗幟和 OS 圖標走默認皮膚靜態文件，不要打包進主題：旗幟使用 `/flags/<code>.svg`，OS 圖標使用 `/os-icons/<filename>`
- 站點標題、背景圖、自定義 `<head>`、自定義腳本由用戶後臺外觀設置控制，主題不要把這些配置寫死
- 主題不可用時應讓頁面暴露加載錯誤，不要在主題內靜默跳轉到其他頁面

路由約定：

- 首頁：`/#/` 或 `/#`
- 詳情頁：`/#/server/:id`
- 管理後臺：鏈接到 `/admin#admin`，由內置默認主題接管，第三方主題不得實現管理頁

### 0.3 版本升級提示

`GET /api/config` 會返回當前 Workers 版本 `version`。當請求帶有有效 JWT 時，後端還會查詢遠程最新版並額外返回：

- `last_workers_version`：最新 Workers 版本
- `last_agent_version`：最新探針 Agent 版本

第三方主題可以將 `version` 與 `last_workers_version` 做字符串比較，自行決定是否展示 Workers 升級提示。`last_agent_version` 僅在登錄後返回，可用於可選的 Agent 版本提示。

未登錄訪問 `/api/config` 時不會返回 `last_workers_version` / `last_agent_version`，自定義主題不要依賴匿名請求展示升級提示。

***

## 1. 鑑權與 Turnstile 流程

### 1.1 鑑權機制

項目使用兩套鑑權機制：

| 機制         | 使用位置            | 方式                                           |
| ---------- | --------------- | -------------------------------------------- |
| JWT Bearer | 非公開站點讀取公開 API、查看 1 小時以上歷史 | `Authorization: Bearer <token>`              |
| Turnstile  | 公開 API（當啟用時）    | `X-Turnstile-Token` 或 `X-Turnstile-Verified` |

### 1.2 Turnstile 人機驗證流程

```
1. 首次訪問 → GET /api/config → 獲取 turnstile_site_key
2. 渲染 Turnstile 組件 → 獲取一次性 token
3. 後續請求 → 攜帶 X-Turnstile-Token 頭
4. 驗證成功 → /api/config 響應體返回 turnstile_verified（加密憑證，有效期 1 小時）
5. 後續請求 → 可複用 X-Turnstile-Verified，省略 X-Turnstile-Token
```

**相關 Header**：

| Header                 | 方向              | 說明                        |
| ---------------------- | --------------- | ------------------------- |
| `X-Turnstile-Token`    | Client → Server | 當次 Turnstile token（明文）    |
| `X-Turnstile-Verified` | Client → Server | AES-GCM 加密的已驗證憑證，客戶端應緩存複用 |

**注意**：

- `/api/ws`、`/api/config`（不帶 Turnstile Header 時）無需驗證
- `/api/config` 帶 `X-Turnstile-Token` 或 `X-Turnstile-Verified` 時會進入驗證流程，並通過 `verified` / `turnstile_verified` 返回驗證結果
- `turnstile_enabled` 是全局 API 驗證開關，`turnstile_login_enabled` 是內置後臺登錄頁驗證開關；第三方主題不實現登錄頁，管理入口跳轉 `/admin#admin`

***

## 2. 公開 API

> 若站點非公開（`is_public !== 'true'`），所有接口需攜帶 JWT。
> 啟用 Turnstile 時需攜帶 `X-Turnstile-Token` 或 `X-Turnstile-Verified`。

### 2.1 獲取站點配置

**Request**

```
GET /api/config
Headers: (可選) Authorization: Bearer <jwt>, X-Turnstile-Token / X-Turnstile-Verified
```

**Response**

```json
{
  "version": "2.7.12 Beta",
  "last_workers_version": "2.7.13",
  "last_agent_version": "1.3.3",
  "is_public": true,
  "authorization": true,
  "turnstile_enabled": true,
  "turnstile_login_enabled": true,
  "turnstile_site_key": "1x00000000000000000000AA",
  "site_title": "My Server Monitor",
  "theme_options": {
    "a": 1,
    "b": 2
  },
  "verified": false,
  "turnstile_verified": null,
  "long_history_points": 120
}
```

**字段說明**：

| 字段                   | 類型           | 說明              |
| -------------------- | ------------ | --------------- |
| `version`            | string       | 當前 Workers 版本號 |
| `last_workers_version` | string\|null | 最新 Workers 版本，僅登錄後返回 |
| `last_agent_version` | string\|null | 最新 Agent 版本，僅登錄後返回 |
| `is_public`          | boolean      | 是否公開站點             |
| `authorization`      | boolean      | 是否通過登錄驗證       |
| `turnstile_enabled`  | boolean      | 是否啟用全局 API 人機驗證 |
| `turnstile_login_enabled` | boolean | 是否啟用登錄頁人機驗證 |
| `turnstile_site_key` | string       | Turnstile 前端公鑰  |
| `site_title`         | string       | 站點標題 |
| `theme_options`      | object       | 第三方主題自定義配置；未配置時為空對象 |
| `verified`           | boolean      | 當前請求是否已驗證       |
| `turnstile_verified` | string\|null | 已驗證憑證，緩存複用 1 小時 |
| `long_history_points` | number      | 長曆史查詢返回的採樣點數，可選 `60`、`120`、`180`、`240` |

`theme_options` 對第三方主題是隻讀運行時配置。需要修改主題配置時，跳轉到內置後臺 `/admin#admin`，不要在第三方主題內調用管理端接口。

**示例**：

```js
const res = await fetch('/api/config');
const config = await res.json();
```

***

### 2.2 獲取服務器列表

**Request**

```
GET /api/servers
Headers: (按需) Authorization: Bearer <jwt>, X-Turnstile-Token/Verified
```

**Response**

```json
{
  "servers": [ /* Server[] */ ],
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
    "show_time": true
  }
}
```

**字段說明**：

| 字段            | 說明                          |
| ------------- | --------------------------- |
| `servers`     | 服務器列表（含最新指標），未登錄用戶自動過濾隱藏服務器；`tags` 始終隨服務器返回 |
| `stats`       | 聚合統計（在線閾值 5 分鐘）             |
| `regionStats` | 按區域統計服務器數量                  |
| `sysConfig`   | 站點開關配置，控制 UI 顯示；主題配置請從 `/api/config` 的 `theme_options` 讀取 |

**示例**：

```js
const res = await fetch('/api/servers', {
  headers: { 'Authorization': 'Bearer ' + token }
});
const { servers, stats, sysConfig } = await res.json();
```

***

### 2.3 獲取服務器詳情

**Request**

```
GET /api/server?id=<uuid>
Headers: (按需) Authorization, X-Turnstile-Token/Verified
```

**Response**

```json
{
  "id": "9b2c...",
  "name": "HK-01",
  "server_group": "HK",
  "tags": "prod,edge",
  "price": "30.00",
  "billing_cycle": "month",
  "auto_renewal": "0",
  "currency": "¥",
  "expire_date": "2026-12-31",
  "traffic_limit": "1TB",
  "traffic_calc_type": "total",
  "reset_day": 1,
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
  "ping_ct": 23, "ping_cu": 25, "ping_cm": 30, "ping_bd": 40,
  "loss_ct": 0, "loss_cu": 0, "loss_cm": 0, "loss_bd": 0,
  "ram_total": 8192, "ram_used": 3700,
  "swap_total": 2048, "swap_used": 100,
  "disk_total": 102400, "disk_used": 32000,
  "cpu_cores": 4, "cpu_info": "Intel Xeon",
  "gpu_info": "[{\"id\":\"0\",\"name\":\"NVIDIA RTX 3060\",\"info\":12.5}]",
  "arch": "x86_64", "os": "Ubuntu 22.04",
  "kernel_version": "6.8.0-36-generic",
  "region": "HK",
  "ip_v4": "1", "ip_v6": "1",
  "boot_time": "1700000000000",
  "last_updated": 1737638400000,
  "timestamp": 1737638400000,
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

`tags` 為英文逗號分隔字符串。`note` 屬於管理端內部字段，不從 dashboard 公共接口返回。`latestReportUpdates` 與 `/api/servers` 同名字段形狀一致，REST 樣本統一為 `{ ts, data }` 並按探針採樣包透傳；內置探針默認只在普通採樣點上報 `cpu`、`ram_total`、`ram_used`、`swap_total`、`swap_used`、`net_in_speed`、`net_out_speed`；緩存約 5 分鐘，允許為空數組。`gpu` 已廢棄，主題應使用 `gpu_info`；新版上報和 WebSocket 實時數據為 `[{ id, name, info }]` 數組，歷史/詳情 REST 響應中可能是同結構的 JSON 字符串。

**失敗返回**：

- `400 { "error": "Missing ID" }`
- `404 { "error": "Server not found" }`

**示例**：

```js
const res = await fetch(`/api/server?id=${serverId}`);
const server = await res.json();
```

***

### 2.4 獲取歷史指標

**Request**

```
GET /api/history/all?id=<uuid>&hours=<number>
Headers: (按需) Authorization, X-Turnstile-Token/Verified
```

**參數**：

- `id`（必填）：服務器 UUID
- `hours`（可選，默認 24）：查詢時長，可選 `0.167`、`0.5`、`1`、`6`、`12`、`24`、`48`、`96`、`168`，最大 168（7 天）

**Response**

```json
[
  { "timestamp": 1737600000000, "cpu": 12.3, "gpu_info": "[{\"id\":\"0\",\"name\":\"NVIDIA RTX 3060\",\"info\":12.5}]", "ram_used": 3700, "kernel_version": "6.8.0-36-generic" },
  { "timestamp": 1737600600000, "cpu": 13.1, "gpu_info": "[{\"id\":\"0\",\"name\":\"NVIDIA RTX 3060\",\"info\":13.0}]", "ram_used": 3712, "kernel_version": "6.8.0-36-generic" }
]
```

**注意**：

- 未登錄用戶 `hours > 24` 時返回 `401`
- 服務端按後臺 `long_history_points` 配置返回採樣點，默認 120 個點
- 數據庫字段缺失且需要升級時可能返回 `409 { "message": "databaseUpgradeRequired" }`

**示例**：

```js
const res = await fetch(`/api/history/all?id=${serverId}&hours=24`);
const rows = await res.json();
```

***

## 3. WebSocket 實時推送

**Request**

```
GET /api/ws?subscribe=<all|serverId>
Headers: Upgrade: websocket, Connection: Upgrade
```

**參數**：

| 參數 | 必填 | 默認值 | 說明 |
| --- | --- | --- | --- |
| `subscribe` | 否 | `all` | `all` 訂閱所有服務器，`<serverId>` 只訂閱指定服務器 |

**過濾機制**：

- `subscribe=all` + 通道內發送 `subscribe` 消息：僅接收 `ids` 列表中的服務器更新
- `subscribe=all` + 未發送 `subscribe` 消息：**不返回任何更新**
- `subscribe=<serverId>`：始終只接收該服務器更新，不需要發送 `ids`
- `ids` 最多 500 個，每個 ID 長度 1-64，僅允許字母、數字、`.`、`_`、`:`、`-`
- `scope` 或 `ids` 格式非法時服務端會關閉 WebSocket 連接（close code `1008`）
- `ids` 是客戶端訂閱過濾，不是服務端鑑權

**多 apiBase 注意事項**：

當配置了多個 `apiBase` 時，前端會為每個 apiBase 創建獨立的 WebSocket 連接。每個連接發送的 `ids` 應只包含該 apiBase 返回的服務器 ID，而非全部服務器 ID。每個 Worker/DO 只知道自己的服務器，傳入不屬於它的 ID 不會產生任何效果。

**推薦流程**：

1. 調用 `GET /api/servers` 獲取服務器列表（已按登錄狀態過濾隱藏服務器）
2. 提取返回的 `servers[].id` 數組
3. 連接 WebSocket：`?subscribe=all`
4. 建連後通過 WebSocket 通道發送 `{ type: "subscribe", scope: "all", ids }`

**推送策略**：

| 訂閱類型 | 推送方式 | 消息類型 | 說明 |
| -------- | ----- | ----- | --- |
| `subscribe=all` | 批量合併，每 5 秒一次 | `batchUpdate` | 減少消息數量，降低前端渲染壓力 |
| `subscribe=<serverId>` | 實時推送 | `batchUpdate` | 單臺服務器詳情頁，低延遲，統一消息格式 |

**消息格式**：

| 類型 | 方向 | 數據結構 |
| --- | --- | --- |
| `hello` | S → C | `{ type: "hello", ts: number, subscribed: string }` |
| `subscribe` | C → S | `{ type: "subscribe", scope: string, ids: string[] }` |
| `subscribed` | S → C | `{ type: "subscribed", ts: number, subscribed: string, count: number }` |
| `ping` | C → S | `{ type: "ping", ts: number }` |
| `pong` | 雙向 | `{ type: "pong", ts: number }` |
| `batchUpdate` | S → C | `{ type: "batchUpdate", ts: number, updates: Array<{serverId, samples: Array<{ts, data: Partial<Server>}>}> }` |

`batchUpdate.samples[].data` 是增量字段：批次內的高頻採樣點主要包含 CPU、內存、Swap、網速和時間字段；每次上報的最後一個樣本會額外攜帶本次完整報告狀態，用於同步磁盤、GPU、進程、連接數、探針、Ping/丟包等報告級數據。

**示例（subscribe=all，帶 ID 過濾）**：

```js
// 1. 獲取服務器列表
const { servers } = await (await fetch('/api/servers')).json();
const ids = servers.map(s => s.id);

// 2. 連接 WebSocket，並通過通道消息提交訂閱 ID 列表
const ws = new WebSocket('wss://status.example.com/api/ws?subscribe=all');
ws.onopen = () => {
  ws.send(JSON.stringify({ type: 'subscribe', scope: 'all', ids }));
};
ws.onmessage = (ev) => {
  const msg = JSON.parse(ev.data);
  if (msg.type === 'batchUpdate') {
    for (const u of msg.updates) {
      for (const s of u.samples || []) {
        updateServer(u.serverId, s.data);
      }
    }
  }
};
```

**示例（subscribe=serverId，實時推送）**：

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

## 4. 錯誤處理

### 統一響應格式

**成功響應**：

成功響應直接返回業務對象或數組，具體結構見各接口；沒有統一的 `success: true` 包裝字段。

**錯誤響應**：

```json
{ "error": "human readable message", "code": 400 }
```

### 錯誤碼速查表

| code | 含義             | 處理建議                 |
| ---- | -------------- | -------------------- |
| 400  | 參數錯誤           | 檢查參數格式和必填項           |
| 401  | 未授權            | 重新登錄或檢查 JWT          |
| 403  | Turnstile 驗證失敗 | 重新獲取 Turnstile token |
| 404  | 資源不存在          | 檢查服務器 ID             |
| 409  | 數據庫需升級        | 提示管理員執行數據庫升級      |
| 500  | 服務器內部錯誤        | 聯繫管理員                |
| 503  | WebSocket 不可用  | 降級為輪詢                |

***

## 5. 類型定義

```typescript
interface Server {
  id: string;
  name: string;
  server_group: string;
  tags: string;
  price: string; // "0" 或 "-1" 表示免費，空白表示未設置
  billing_cycle: string;
  auto_renewal: string;
  currency: string;
  expire_date: string;
  traffic_limit: string;
  traffic_calc_type: string;
  reset_day: number;
  report_interval: number;
  is_hidden: '0' | '1';
  sort_order: number;
  cpu: number;
  load_avg: string;
  net_in_speed: number;
  net_out_speed: number;
  net_rx: number;
  net_tx: number;
  net_rx_monthly: number;
  net_tx_monthly: number;
  processes: number;
  tcp_conn: number;
  udp_conn: number;
  ping_ct: number | null;
  ping_cu: number | null;
  ping_cm: number | null;
  ping_bd: number | null;
  loss_ct: number | null;
  loss_cu: number | null;
  loss_cm: number | null;
  loss_bd: number | null;
  ram_total: number;
  ram_used: number;
  swap_total: number;
  swap_used: number;
  disk_total: number;
  disk_used: number;
  cpu_cores: number;
  cpu_info: string;
  gpu_info: Array<{ id: string; name: string; info: number | null }> | string;
  arch: string;
  os: string;
  kernel_version: string;
  region: string;
  ip_v4: '0' | '1'; // 公共 REST 接口僅返回 IPv4 可達性
  ip_v6: '0' | '1'; // 公共 REST 接口僅返回 IPv6 可達性
  boot_time: string;
  agent_version?: string;
  last_updated: number;
  timestamp: number;
  is_online?: boolean;
  sysConfig?: SysConfig;
}

interface SysConfig {
  show_price?: boolean;
  show_expire?: boolean;
  show_tf?: boolean;
  show_time?: boolean;
  long_history_points?: number;
}

interface SiteConfig {
  version: string;
  last_workers_version?: string | null;
  last_agent_version?: string | null;
  is_public: boolean;
  authorization: boolean;
  turnstile_enabled: boolean;
  turnstile_login_enabled: boolean;
  turnstile_site_key: string;
  site_title: string;
  theme_options: Record<string, unknown>;
  verified: boolean;
  turnstile_verified: string | null;
  long_history_points: number;
}

interface WsMessage {
  type: 'hello' | 'subscribe' | 'subscribed' | 'ping' | 'pong' | 'batchUpdate';
  ts?: number;
  subscribed?: string;
  scope?: string;
  ids?: string[];
  count?: number;
  serverId?: string;
  updates?: Array<{
    serverId: string;
    samples: Array<{ ts: number; data: Partial<Server> }>;
  }>;
}
```
