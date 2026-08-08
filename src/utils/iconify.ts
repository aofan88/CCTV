/**
 * Iconify 集合預註冊（可選）
 *
 * 預設行為：`<Icon icon="icon-park-outline:sun" />` 在未註冊集合時
 * 會從 https://api.iconify.design 按需拉取單個圖標 SVG（帶瀏覽器緩存）。
 *
 * 此函數保留作為未來擴展入口；目前不做預註冊，避免把整個
 * 圖標集合（每個 1MB+）打進首屏 bundle。
 */
export async function setupIconify(): Promise<void> {
  // no-op：交給 @iconify/vue 預設 CDN 載入策略
}
