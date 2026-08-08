import type { NodeData } from '@/stores/nodes'
import { formatDateTime } from '@/utils/helper'
import { formatPriceWithCycle, formatRemainingDays, getExpireStatus, getExpireTextClass, parseTags } from '@/utils/tagHelper'

/** Ping 運營商配置 */
export const PING_PROVIDERS = [
  { key: 'ct', label: 'CT' },
  { key: 'cu', label: 'CU' },
  { key: 'cm', label: 'CM' },
  { key: 'bd', label: 'BD' },
] as const

export interface PriceTagItem {
  text: string
  highlightValue?: string
  prefix?: string
  suffix?: string
}

/**
 * 檢查區域資訊是否有效
 */
export function hasRegion(region: string | null | undefined): boolean {
  return Boolean(region?.trim())
}

/**
 * 檢查是否需要顯示流量進度條
 */
export function showTrafficProgress(node: NodeData): boolean {
  return node.traffic_limit > 0
}

/**
 * 檢查節點是否配置了價格
 */
export function hasConfiguredPrice(node: NodeData): boolean {
  return node.price_configured ?? node.price !== 0
}

/**
 * 根據延遲返回 Ping 色調 CSS 類
 */
export function getPingToneClass(latency: number, available: boolean): string {
  if (!available)
    return 'text-muted-foreground'
  if (latency <= 100)
    return 'text-emerald-600 dark:text-emerald-400'
  if (latency <= 180)
    return 'text-lime-600 dark:text-lime-400'
  if (latency <= 260)
    return 'text-amber-600 dark:text-amber-400'
  return 'text-rose-600 dark:text-rose-400'
}

/**
 * 根據流量限制類型計算已用流量
 */
export function getTrafficUsed(node: NodeData): number {
  const { net_monthly_up = 0, net_monthly_down = 0, traffic_limit_type } = node
  switch (traffic_limit_type) {
    case 'up': return net_monthly_up
    case 'down': return net_monthly_down
    case 'min': return Math.min(net_monthly_up, net_monthly_down)
    case 'max': return Math.max(net_monthly_up, net_monthly_down)
    case 'sum':
    default: return net_monthly_up + net_monthly_down
  }
}

/**
 * 計算流量使用百分比
 */
export function getTrafficUsedPercentage(node: NodeData): number {
  if (node.traffic_limit <= 0)
    return 0
  return Math.min((getTrafficUsed(node) / node.traffic_limit) * 100, 100)
}

/**
 * 格式化離線時間
 */
export function formatOfflineTime(node: NodeData): string {
  return formatDateTime(node.time)
}

/**
 * 取得價格標籤列表
 */
export function getPriceTags(node: NodeData, lang: 'zh-CN' | 'en-US'): PriceTagItem[] {
  const tags: PriceTagItem[] = []
  const status = getExpireStatus(node.expired_at)
  const remainingDays = formatRemainingDays(node.expired_at)
  const priceText = formatPriceWithCycle(node.price, node.billing_cycle, node.currency, lang)
  if (hasConfiguredPrice(node))
    tags.push({ text: priceText })
  if (status === 'long_term')
    tags.push({ text: lang === 'zh-CN' ? '長期' : 'Long-term' })
  else
    tags.push({ text: remainingDays, highlightValue: remainingDays })
  return tags
}

/**
 * 取得剩餘時間標籤的樣式類
 */
export function getRemainingTimeTagClass(node: NodeData): string {
  if (!hasConfiguredPrice(node))
    return ''
  return getExpireTextClass(node.expired_at)
}

/**
 * 解析自定義標籤文本列表
 */
export function getCustomTags(node: NodeData): string[] {
  return parseTags(node.tags).map(t => t.text)
}
