<h1 align="center">Emerald Theme for CF Server Monitor</h1>

<p align="center">基於 Vue 3 + Vite + reka-ui + Tailwind CSS v4 構建的 CF Server Monitor主題</p>

<p align="center">支援一鍵部署到 Vercel、Cloudflare、EdgeOne，也可自行部署到 VPS 或其他靜態伺服器。</p>

![preview](/docs/preview.png)

## 功能

- 卡片和表格兩種節點視圖
- 多分組、搜尋、地區旗幟和作業系統圖示
- CPU、記憶體、磁碟、流量、網路和 Ping 歷史圖表
- `CF Server Monitor` WebSocket 即時更新與斷線重連
- 單後端 Turnstile 驗證
- 多後端聚合，詳情頁保留資料來源資訊
- 深色、淺色和跟隨系統主題
- Hash 路由，可部署到 `Vercel`、`Cloudflare`、`EdgeOne` 或其他靜態伺服器

## 一鍵部署

| 平臺             | 一鍵部署                                                                                                                                                                                                                                          | PROXY_BACKEND    |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- |
| Vercel           | [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Tokinx/cf-server-monitor-theme-emerald)                                                                                         | **true** / false |
| Cloudflare       | [![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/Tokinx/cf-server-monitor-theme-emerald)                                                                     | **true** / false |
| EdgeOne (Global) | [![使用 EdgeOne Makers 部署](https://cdnstatic.tencentcs.com/edgeone/pages/deploy.svg)](https://edgeone.ai/pages/new?repository-url=https://github.com/Tokinx/cf-server-monitor-theme-emerald&env=API_BASE,PROXY_BACKEND)                         | **true** / false |
| EdgeOne (國內)   | [![使用 EdgeOne Makers 部署](https://cdnstatic.tencentcs.com/edgeone/pages/deploy.svg)](https://console.cloud.tencent.com/edgeone/makers/new?repository-url=https://github.com/Tokinx/cf-server-monitor-theme-emerald&env=API_BASE,PROXY_BACKEND) | **true** / false |

- `API_BASE` 是 CF Server Monitor Worker 的網址，例如 `https://monitor.example.com`。
- `PROXY_BACKEND` 開啟後 `/api`、`/flags`、`/os-icons` 將通過代理轉發到 `API_BASE`，可起到一定的加速作用
- Cloudflare Workers / Pages 會在返回頁面時讀取運行時環境變量，無需在 Vite 構建階段額外注入；在 Cloudflare 控制檯修改變量並重新部署後即可生效。

## 主題設定

複製並調整下方參數，將其填入 **CF Server Monitor** 後台設定頁面的「主題自訂設定 JSON」中並儲存。

```
{
  "configuration": [
    {
      "key": "defaultViewMode",
      "value": "card",
      "options": "card,list",
      "description": "節點列表的預設顯示模式"
    },
    {
      "key": "alertEnabled",
      "value": "false",
      "options": "",
      "description": "在首頁顯示自定義公告"
    },
    {
      "key": "alertTitle",
      "value": "",
      "options": "",
      "description": "公告的標題內容"
    },
    {
      "key": "alertContent",
      "value": "",
      "options": "",
      "description": "公告的詳細內容（支援簡單 Markdown 格式）"
    },
    {
      "key": "earthViewMode",
      "value": "maps",
      "options": "earth,earth-stop,maps,cards,hide",
      "description": "earth：自轉地球；earth-stop：靜止地球；maps：點狀地圖；cards：僅顯示頭部卡片；hide：隱藏整個頭部"
    },
    {
      "key": "visitorInfoCardEnabled",
      "value": "true",
      "options": "",
      "description": "顯示訪客來源、裝置和瀏覽器資訊卡片"
    },
    {
      "key": "hideAdminEntryWhenLoggedOut",
      "value": "false",
      "options": "",
      "description": "隱藏頂部管理後臺按鈕"
    },
    {
      "key": "disablePageAnimation",
      "value": "false",
      "options": "",
      "description": "減少頁面過渡動畫效果，提升訪問速度和響應性"
    },
    {
      "key": "icpEnabled",
      "value": "false",
      "options": "",
      "description": "在頁腳顯示網站備案號"
    },
    {
      "key": "icpNumber",
      "value": "",
      "options": "",
      "description": "網站備案號（如：京ICP備12345678號）"
    },
    {
      "key": "icpUrl",
      "value": "https://beian.miit.gov.cn/",
      "options": "",
      "description": "點擊備案號跳轉的鏈接地址"
    },
    {
      "key": "policeEnabled",
      "value": "false",
      "options": "",
      "description": "在頁腳顯示公安備案資訊"
    },
    {
      "key": "policeNumber",
      "value": "",
      "options": "",
      "description": "公安備案號（如：京公網安備 11010502000000號）"
    },
    {
      "key": "policeUrl",
      "value": "",
      "options": "",
      "description": "點擊公安備案號跳轉的鏈接地址，留空則不跳轉"
    },
    {
      "key": "backgroundEnabled",
      "value": "false",
      "options": "",
      "description": "啟用後可設定自訂圖片或影片作為頁面背景"
    },
    {
      "key": "backgroundType",
      "value": "image",
      "options": "image,video",
      "description": "選擇背景類型：圖片或視頻"
    },
    {
      "key": "lightBackgroundUrl",
      "value": "",
      "options": "",
      "description": "亮色模式下的背景圖片/視頻 URL"
    },
    {
      "key": "darkBackgroundUrl",
      "value": "",
      "options": "",
      "description": "暗色模式下的背景圖片/視頻 URL"
    },
    {
      "key": "backgroundBlur",
      "value": "0",
      "options": "",
      "description": "背景的高斯模糊半徑（單位：px），0 表示不模糊"
    },
    {
      "key": "backgroundOverlay",
      "value": "0",
      "options": "",
      "description": "背景遮罩強度（-100 到 100）：負數降低背景透明度，0 表示關閉，正數為黑色遮罩，絕對值越大效果越明顯"
    }
  ]
}
```

## 開發

```bash
bun install
cp .env.example .env
bun run dev
```

`.env` 示例：

```dotenv
API_BASE=https://monitor.example.com
PROXY_BACKEND=false
CSP_API=
CSP_STATIC=
BASE_PATH=./
```

`API_BASE` 支援用英文逗號設定多個 Worker。開發模式會把同源 `/api` 請求代理到單個 `API_BASE`，避免本機 CORS 限制。Cloudflare 部署會從 `wrangler.toml`（Pages 則為 `wrangler.pages.toml`）的 `[vars]` 讀取這些設定，並在執行時寫入頁面。

當設定 `PROXY_BACKEND=true` 時，HTTP 請求使用同源 `/api`、`/flags/xxx` 和 `/os-icons/xxx`，這要求部署平台提供反向代理。WebSocket 連線使用 `webSocketBase` meta 指定的網址，未指定時回退到 `API_BASE`；`PROXY_BACKEND=false` 時 WebSocket 直連 `API_BASE`。

## 構建

```bash
bun run lint
bun run build
bun run preview
```

產物位於 `dist/`。純靜態部署時，構建會將 `API_BASE` 寫入 `index.html` 的 `meta[name="apiBase"]`；Cloudflare Workers / Pages 則由運行時中間件寫入。跨域直連部署還需在 CF Server Monitor Worker 中將站點域名加入 `CORS_ALLOWED_ORIGINS`。

自定義域名和其他靜態平臺通常保留 `BASE_PATH=./` 即可。

### 主題開發文檔：

- [CF-Server-Monitor項目地址](https://github.com/huilang-me/CF-Server-Monitor)
- [開發指南](https://github.com/huilang-me/CF-Server-Monitor/blob/main/develop.md)
- [前端API文檔](https://github.com/huilang-me/CF-Server-Monitor/blob/main/theme-develop.md)
- [後端API文檔](https://github.com/huilang-me/CF-Server-Monitor/blob/main/API.md)

## 運行時約定

- 路由：`/#/`、`/#/server/:id`
- 後端管理入口：`${API_BASE}#/admin`
- 未設定 `apiBase` 時預設使用目前頁面的 origin
- `PROXY_BACKEND=true` 時請求使用當前站點的 `/api`、`/flags` 和 `/os-icons`
- 多後端模式下不支援任一來源站點開啟 Turnstile
- 匿名用戶僅查詢 1 小時以內的歷史數據，符合 CF Server Monitor API 權限限制

## 致謝

- [Tokinx/komari-theme-emerald](https://github.com/Tokinx/komari-theme-emerald)
- [huilang-me/CF-Server-Monitor](https://github.com/huilang-me/CF-Server-Monitor)
- [huilang-me/CF-Server-Monitor-theme](https://github.com/huilang-me/CF-Server-Monitor-theme)

## License

[MIT](./LICENSE)
