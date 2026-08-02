import dayjs from 'dayjs'
import { CURRENCY_SYMBOLS, normalizeCurrency } from '@/utils/financeHelper'

/** 計費週期類型 */
export type BillingCycleType = 'monthly' | 'quarterly' | 'semi_annual' | 'annual' | 'biennial' | 'triennial' | 'quadrennial' | 'quinquennial' | 'once' | 'custom'

/** 過期狀態類型 */
export type ExpireStatus = 'expired' | 'critical' | 'warning' | 'normal' | 'long_term'

/** 支援的標籤顏色 */
export type TagColor
  = | 'ruby'
    | 'gray'
    | 'gold'
    | 'bronze'
    | 'brown'
    | 'yellow'
    | 'amber'
    | 'orange'
    | 'tomato'
    | 'red'
    | 'crimson'
    | 'pink'
    | 'plum'
    | 'purple'
    | 'violet'
    | 'iris'
    | 'indigo'
    | 'blue'
    | 'cyan'
    | 'teal'
    | 'jade'
    | 'green'
    | 'grass'
    | 'lime'
    | 'mint'
    | 'sky'

/** 所有支援的標籤顏色列表 */
export const TAG_COLORS = [
  'ruby',
  'gray',
  'gold',
  'bronze',
  'brown',
  'yellow',
  'amber',
  'orange',
  'tomato',
  'red',
  'crimson',
  'pink',
  'plum',
  'purple',
  'violet',
  'iris',
  'indigo',
  'blue',
  'cyan',
  'teal',
  'jade',
  'green',
  'grass',
  'lime',
  'mint',
  'sky',
] as const

/** Radix Themes 顏色到 HEX 的映射（基於 light 模式的 9 色階） */
export const TAG_COLOR_HEX_MAP: Record<TagColor, string> = {
  ruby: '#E5484D',
  gray: '#8D8D8D',
  gold: '#E5C00D',
  bronze: '#C2853C',
  brown: '#AA6A38',
  yellow: '#F9D400',
  amber: '#F5B21A',
  orange: '#F97316',
  tomato: '#E54D2E',
  red: '#E5484D',
  crimson: '#E93D82',
  pink: '#E24D8C',
  plum: '#A855C2',
  purple: '#8E4EC6',
  violet: '#7C5DFA',
  iris: '#5B5BD6',
  indigo: '#6366F1',
  blue: '#0090FF',
  cyan: '#00A2C7',
  teal: '#12A594',
  jade: '#29A383',
  green: '#30A46C',
  grass: '#46A358',
  lime: '#84CC16',
  mint: '#4FD1C5',
  sky: '#00A6ED',
}

/** 計費週期範圍配置（天） */
const BILLING_CYCLE_RANGES: Array<{ type: BillingCycleType, min: number, max: number }> = [
  { type: 'monthly', min: 27, max: 32 },
  { type: 'quarterly', min: 87, max: 95 },
  { type: 'semi_annual', min: 175, max: 185 },
  { type: 'annual', min: 360, max: 370 },
  { type: 'biennial', min: 720, max: 750 },
  { type: 'triennial', min: 1080, max: 1150 },
  { type: 'quadrennial', min: 1440, max: 1500 },
  { type: 'quinquennial', min: 1800, max: 1850 },
]

/** 過期狀態閾值配置（天） */
const EXPIRE_THRESHOLDS = {
  critical: 7, // 7天內過期顯示紅色
  warning: 15, // 15天內過期顯示橙色
  long_term: 36500, // 約100年視為長期
} as const

const TAG_COLOR_SUFFIX_REGEX = /<(\w+)>$/
const TAG_COLOR_SUFFIX_REMOVE_REGEX = /<\w+>$/
const TAG_SEPARATOR_REGEX = /[,;]/

/**
 * 解析計費週期類型
 * @param billingCycle 計費週期（天）
 * @returns 計費週期類型
 */
export function parseBillingCycleType(billingCycle: number): BillingCycleType {
  if (billingCycle === -1)
    return 'once'

  for (const range of BILLING_CYCLE_RANGES) {
    if (billingCycle >= range.min && billingCycle <= range.max) {
      return range.type
    }
  }

  return 'custom'
}

/**
 * 取得計費週期的顯示文本
 * @param billingCycle 計費週期（天）
 * @param lang 語言
 * @returns 顯示文本
 */
export function getBillingCycleText(billingCycle: number, lang: 'zh-CN' | 'en-US' = 'zh-CN'): string {
  const type = parseBillingCycleType(billingCycle)

  const texts: Record<BillingCycleType, Record<'zh-CN' | 'en-US', string>> = {
    monthly: { 'zh-CN': '月', 'en-US': 'Month' },
    quarterly: { 'zh-CN': '季', 'en-US': 'Quarter' },
    semi_annual: { 'zh-CN': '半年', 'en-US': 'Semi-Annual' },
    annual: { 'zh-CN': '年', 'en-US': 'Year' },
    biennial: { 'zh-CN': '兩年', 'en-US': 'Biennial' },
    triennial: { 'zh-CN': '三年', 'en-US': 'Triennial' },
    quadrennial: { 'zh-CN': '四年', 'en-US': 'Quadrennial' },
    quinquennial: { 'zh-CN': '五年', 'en-US': 'Quinquennial' },
    once: { 'zh-CN': '一次性', 'en-US': 'Once' },
    custom: { 'zh-CN': `${billingCycle} 天`, 'en-US': `${billingCycle} Days` },
  }

  return texts[type][lang]
}

/**
 * 計算距離過期的天數
 * @param expiredAt 過期時間（字串或時間戳）
 * @returns 距離過期的天數，負數表示已過期
 */
export function getDaysUntilExpired(expiredAt: string | number | undefined): number {
  if (!expiredAt)
    return 0

  const expiredDate = dayjs(expiredAt)
  const now = dayjs()

  if (!expiredDate.isValid())
    return 0

  return Math.round(expiredDate.diff(now, 'day', true))
}

/**
 * 取得過期狀態
 * @param expiredAt 過期時間
 * @returns 過期狀態
 */
export function getExpireStatus(expiredAt: string | number | undefined): ExpireStatus {
  const days = getDaysUntilExpired(expiredAt)

  if (days <= 0)
    return 'expired'
  if (days < EXPIRE_THRESHOLDS.critical)
    return 'critical'
  if (days < EXPIRE_THRESHOLDS.warning)
    return 'warning'
  if (days > EXPIRE_THRESHOLDS.long_term)
    return 'long_term'
  return 'normal'
}

/**
 * 取得過期時間的文本顏色類
 * @param expiredAt 過期時間
 * @returns Tailwind 文本顏色類
 */
export function getExpireTextClass(expiredAt: string | number | undefined): string {
  const status = getExpireStatus(expiredAt)

  if (status === 'expired' || status === 'critical')
    return 'text-destructive'
  if (status === 'warning')
    return 'text-yellow-600 dark:text-yellow-400'
  if (status === 'long_term')
    return 'text-muted-foreground'
  return 'text-emerald-600 dark:text-emerald-400'
}

/**
 * 格式化節點剩餘天數，使用原生主題的帶符號短格式。
 */
export function formatRemainingDays(expiredAt: string | number | undefined): string {
  const days = getDaysUntilExpired(expiredAt)
  if (getExpireStatus(expiredAt) === 'long_term')
    return '長期'
  return `${days > 0 ? '+' : ''}${days} 天`
}

/**
 * 取得過期狀態的顯示顏色（Naive UI 顏色類型）
 * @param status 過期狀態
 * @returns Naive UI 顏色類型
 */
export function getExpireStatusColor(status: ExpireStatus): 'error' | 'warning' | 'success' | 'default' {
  switch (status) {
    case 'expired':
    case 'critical':
      return 'error'
    case 'warning':
      return 'warning'
    case 'normal':
    case 'long_term':
      return 'success'
    default:
      return 'default'
  }
}

/**
 * 取得過期狀態的 HEX 顏色值
 * @param status 過期狀態
 * @returns HEX 顏色值
 */
export function getExpireStatusHexColor(status: ExpireStatus): string {
  switch (status) {
    case 'expired':
    case 'critical':
      return TAG_COLOR_HEX_MAP.tomato
    case 'warning':
      return TAG_COLOR_HEX_MAP.orange
    case 'normal':
      return TAG_COLOR_HEX_MAP.green
    case 'long_term':
      return TAG_COLOR_HEX_MAP.gray
    default:
      return TAG_COLOR_HEX_MAP.gray
  }
}

/**
 * 取得過期時間的顯示文本
 * @param expiredAt 過期時間
 * @param lang 語言
 * @returns 顯示文本
 */
export function getExpireText(expiredAt: string | number | undefined, lang: 'zh-CN' | 'en-US' = 'zh-CN'): string {
  const days = getDaysUntilExpired(expiredAt)
  const status = getExpireStatus(expiredAt)

  if (status === 'expired') {
    return lang === 'zh-CN' ? '已過期' : 'Expired'
  }

  if (status === 'long_term') {
    return lang === 'zh-CN' ? '長期' : 'Long-term'
  }

  if (lang === 'zh-CN') {
    return `${days} 天`
  }
  return `${days} days`
}

/**
 * 解析帶顏色的標籤
 * @param tag 標籤字串，支援格式 "文本<顏色>"
 * @returns 解析後的標籤對象
 */
export function parseTagWithColor(tag: string): { text: string, color: TagColor | null } {
  const colorMatch = tag.match(TAG_COLOR_SUFFIX_REGEX)
  if (colorMatch && colorMatch[1]) {
    const colorCandidate = colorMatch[1].toLowerCase()
    const text = tag.replace(TAG_COLOR_SUFFIX_REMOVE_REGEX, '')
    if ((TAG_COLORS as readonly string[]).includes(colorCandidate)) {
      return { text, color: colorCandidate as TagColor }
    }
  }
  return { text: tag, color: null }
}

/**
 * 取得標籤顏色對應的 HEX 值
 * @param color 標籤顏色
 * @returns HEX 顏色值
 */
export function getTagColorHex(color: TagColor): string {
  return TAG_COLOR_HEX_MAP[color]
}

/**
 * 解析標籤字串為標籤列表
 * @param tags 標籤字串，用逗號或分號分隔
 * @returns 標籤數組
 */
export function parseTags(tags: string | undefined): Array<{ text: string, color: TagColor, hex: string }> {
  if (!tags || tags.trim() === '')
    return []

  const tagList = tags
    .split(TAG_SEPARATOR_REGEX)
    .map(tag => tag.trim())
    .filter(Boolean)

  return tagList.map((tag, index) => {
    const { text, color } = parseTagWithColor(tag)
    const defaultColor = TAG_COLORS[index % TAG_COLORS.length] ?? 'blue'
    const resolvedColor = color ?? defaultColor
    return {
      text,
      color: resolvedColor,
      hex: getTagColorHex(resolvedColor),
    }
  })
}

/**
 * 格式化價格顯示
 * @param price 價格
 * @param currency 貨幣符號
 * @param lang 語言
 * @returns 價格顯示文本
 */
export function formatPrice(price: number, currency: string = '￥', lang: 'zh-CN' | 'en-US' = 'zh-CN'): string {
  const numericPrice = Number(price)
  if (numericPrice === 0 || numericPrice === -1 || !Number.isFinite(numericPrice))
    return lang === 'zh-CN' ? '免費' : 'Free'

  const code = normalizeCurrency(currency)
  const symbol = CURRENCY_SYMBOLS[code] ?? (currency || '¥')
  return `${symbol}${numericPrice}`
}

function getBillingCycleShortText(billingCycle: number): string {
  const days = Number(billingCycle)
  if (days === -1 || days <= 0 || !Number.isFinite(days))
    return 'once'
  if (days === 90)
    return 'Q'
  if (days === 180)
    return '6M'
  if (days > 0 && days % 365 === 0) {
    const years = days / 365
    return years === 1 ? 'Y' : `${years}Y`
  }
  if (days > 0 && days % 30 === 0) {
    const months = days / 30
    return months === 1 ? 'M' : `${months}M`
  }
  if (days >= 360)
    return 'Y'
  if (days >= 175)
    return '6M'
  if (days >= 87)
    return 'Q'
  if (days >= 27)
    return 'M'
  return `${days}D`
}

/**
 * 格式化價格和計費週期
 * @param price 價格
 * @param billingCycle 計費週期（天）
 * @param currency 貨幣符號
 * @param lang 語言
 * @returns 完整的價格顯示文本
 */
export function formatPriceWithCycle(
  price: number,
  billingCycle: number,
  currency: string = '￥',
  lang: 'zh-CN' | 'en-US' = 'zh-CN',
): string {
  const priceText = formatPrice(price, currency, lang)
  const cycleText = getBillingCycleShortText(billingCycle)
  return Number(price) > 0 ? `${priceText}/${cycleText}` : priceText
}

/**
 * 檢查是否有 IPv4
 */
export function hasIPv4(ipv4: string | undefined | null): boolean {
  return !!ipv4 && ipv4.trim() !== ''
}

/**
 * 檢查是否有 IPv6
 */
export function hasIPv6(ipv6: string | undefined | null): boolean {
  return !!ipv6 && ipv6.trim() !== ''
}
