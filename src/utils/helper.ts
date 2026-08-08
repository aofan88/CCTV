import dayjs from 'dayjs'

/** 字節單位常量 */
const BYTE_UNITS = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'] as const
const LAST_BYTE_UNIT = BYTE_UNITS.at(-1)

/** 時間單位配置（秒為單位） */
const TIME_UNITS = [
  { value: 86400, label: '天' },
  { value: 3600, label: '小時' },
  { value: 60, label: '分鐘' },
  { value: 1, label: '秒' },
] as const

/** 運行時間格式化精度類型 */
export type UptimeFormat = 'day' | 'hour' | 'minute' | 'second'

/** 字節格式化精度配置 */
export interface ByteDecimalsConfig {
  /** B 精確位數，-1 為不顯示此單位 */
  B?: number
  /** KB 精確位數，-1 為不顯示此單位 */
  KB?: number
  /** MB 精確位數，-1 為不顯示此單位 */
  MB?: number
  /** GB 精確位數，-1 為不顯示此單位 */
  GB?: number
  /** TB 及以上精確位數，-1 為不顯示此單位 */
  TB?: number
}

/** 預設字節精度配置 */
const DEFAULT_BYTE_DECIMALS: ByteDecimalsConfig = {
  B: 0,
  KB: 0,
  MB: 1,
  GB: 1,
  TB: 1,
}

/**
 * 格式化字節數為可讀單位
 * @param bytes 字節數
 * @param decimals 小數位數
 * @returns 格式化後的字串，如 "1.5 GB"
 */
export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0)
    return '0 B'

  const k = 1024
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  const unit = BYTE_UNITS[i] ?? LAST_BYTE_UNIT
  return `${(bytes / k ** i).toFixed(decimals)} ${unit}`
}

/**
 * 格式化字節數為可讀單位（支援自定義精度配置）
 * @param bytes 字節數
 * @param config 精度配置
 * @returns 格式化後的字串，如 "1.5 GB"
 */
export function formatBytesWithConfig(bytes: number, config?: ByteDecimalsConfig): string {
  const mergedConfig = { ...DEFAULT_BYTE_DECIMALS, ...config }

  if (bytes === 0) {
    // 0 字節時，檢查 B 是否被禁用
    if (mergedConfig.B === -1)
      return '0 KB'
    return '0 B'
  }

  const k = 1024
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  // 取得對應單位的精度配置
  const unitKey = BYTE_UNITS[i]
  // PB 及以上單位使用 TB 的精度配置
  const decimals = (unitKey === 'TB' || unitKey === 'PB') ? mergedConfig.TB : mergedConfig[unitKey as keyof ByteDecimalsConfig]

  // 如果目前單位被禁用，向上查找可用單位
  if (decimals === -1) {
    for (let j = i + 1; j < BYTE_UNITS.length; j++) {
      const nextUnitKey = BYTE_UNITS[j]
      const nextDecimals = (nextUnitKey === 'TB' || nextUnitKey === 'PB') ? mergedConfig.TB : mergedConfig[nextUnitKey as keyof ByteDecimalsConfig]
      if (nextDecimals !== -1) {
        const unit = BYTE_UNITS[j]
        return `${(bytes / k ** j).toFixed(nextDecimals)} ${unit}`
      }
    }
    // 所有單位都被禁用，使用預設行為
    const unit = BYTE_UNITS[i] ?? LAST_BYTE_UNIT
    return `${(bytes / k ** i).toFixed(1)} ${unit}`
  }

  const unit = BYTE_UNITS[i] ?? LAST_BYTE_UNIT
  return `${(bytes / k ** i).toFixed(decimals)} ${unit}`
}

/**
 * 格式化字節數為分離的數值和單位（支援自定義精度配置）
 * @param bytes 字節數
 * @param config 精度配置
 * @returns 分離的數值和單位，如 { value: "1.5", unit: "GB" }
 */
export function formatBytesSplit(bytes: number, config?: ByteDecimalsConfig): { value: string, unit: string } {
  const mergedConfig = { ...DEFAULT_BYTE_DECIMALS, ...config }

  if (bytes === 0) {
    if (mergedConfig.B === -1)
      return { value: '0', unit: 'KB' }
    return { value: '0', unit: 'B' }
  }

  const k = 1024
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  const unitKey = BYTE_UNITS[i]
  const decimals = (unitKey === 'TB' || unitKey === 'PB') ? mergedConfig.TB : mergedConfig[unitKey as keyof ByteDecimalsConfig]

  if (decimals === -1) {
    for (let j = i + 1; j < BYTE_UNITS.length; j++) {
      const nextUnitKey = BYTE_UNITS[j]
      const nextDecimals = (nextUnitKey === 'TB' || nextUnitKey === 'PB') ? mergedConfig.TB : mergedConfig[nextUnitKey as keyof ByteDecimalsConfig]
      if (nextDecimals !== -1) {
        const unit = BYTE_UNITS[j]
        return { value: (bytes / k ** j).toFixed(nextDecimals), unit: `${unit}` }
      }
    }
    const unit = BYTE_UNITS[i] ?? LAST_BYTE_UNIT
    return { value: (bytes / k ** i).toFixed(1), unit: `${unit}` }
  }

  const unit = BYTE_UNITS[i] ?? LAST_BYTE_UNIT
  return { value: (bytes / k ** i).toFixed(decimals), unit: `${unit}` }
}

/**
 * 格式化字節速率為分離的數值和單位（支援自定義精度配置）
 * @param bytes 字節速率
 * @param config 精度配置
 * @returns 分離的數值和單位，如 { value: "1.5", unit: "GB/s" }
 */
export function formatBytesPerSecondSplit(bytes: number, config?: ByteDecimalsConfig): { value: string, unit: string } {
  const result = formatBytesSplit(bytes, config)
  return { value: result.value, unit: `${result.unit}/s` }
}

/**
 * 格式化字節速率為可讀單位
 * @param bytes 字節速率
 * @returns 格式化後的字串，如 "1.5 GB/s"
 */
export function formatBytesPerSecond(bytes: number): string {
  return `${formatBytes(bytes)}/s`
}

/**
 * 格式化字節速率為可讀單位（支援自定義精度配置）
 * @param bytes 字節速率
 * @param config 精度配置
 * @returns 格式化後的字串，如 "1.5 GB/s"
 */
export function formatBytesPerSecondWithConfig(bytes: number, config?: ByteDecimalsConfig): string {
  return `${formatBytesWithConfig(bytes, config)}/s`
}

/**
 * 格式化運行時間
 * @param seconds 秒數
 * @returns 格式化後的字串，如 "2 天 3 小時 15 分鐘"
 */
export function formatUptime(seconds: number): string {
  if (!seconds || seconds <= 0)
    return '0 秒'

  const parts: string[] = []
  let remaining = seconds

  for (const { value, label } of TIME_UNITS) {
    const amount = Math.floor(remaining / value)
    if (amount > 0) {
      parts.push(`${amount} ${label}`)
      remaining %= value
    }
  }

  return parts.length > 0 ? parts.join(' ') : '0 秒'
}

/**
 * 格式化運行時間（支援自定義精度）
 * @param seconds 秒數
 * @param format 精度格式：'day' | 'hour' | 'minute' | 'second'
 * - 'day': 只顯示天（如 "2 天"），不滿一天時顯示"不足 1 天"
 * - 'hour': 顯示天和小時（如 "2 天 3 小時"），不滿一小時時顯示"不足 1 小時"
 * - 'minute': 顯示天、小時、分鐘（如 "2 天 3 小時 15 分鐘"），不滿一分鐘時顯示"不足 1 分鐘"
 * - 'second': 顯示天、小時、分鐘、秒（如 "2 天 3 小時 15 分鐘 30 秒"）
 * @returns 格式化後的字串
 */
export function formatUptimeWithFormat(seconds: number, format: UptimeFormat = 'day'): string {
  if (!seconds || seconds <= 0)
    return '0 秒'

  // 根據格式確定最大單位索引（從天開始）
  const formatMaxUnitIndexMap: Record<UptimeFormat, number> = {
    day: 0, // 只到天
    hour: 1, // 到小時
    minute: 2, // 到分鐘
    second: 3, // 到秒
  }

  const maxUnitIndex = formatMaxUnitIndexMap[format]
  const parts: string[] = []
  let remaining = seconds

  for (let i = 0; i < TIME_UNITS.length; i++) {
    const unit = TIME_UNITS[i]
    if (!unit)
      continue
    const { value, label } = unit
    const amount = Math.floor(remaining / value)
    if (amount > 0) {
      parts.push(`${amount} ${label}`)
      remaining %= value
    }
    // 達到最大單位索引時停止
    if (i >= maxUnitIndex) {
      break
    }
  }

  // 如果沒有任何單位有值，顯示"不足 1 X"
  if (parts.length === 0) {
    const fallbackUnit = TIME_UNITS[maxUnitIndex]
    const fallbackLabel = fallbackUnit?.label ?? '秒'
    return `不足 1 ${fallbackLabel}`
  }

  return parts.join(' ')
}

/**
 * 計算佔用百分比
 * @param used 已使用量
 * @param total 總量
 * @returns 百分比（0-100）
 */
export function calcPercentage(used: number, total: number): number {
  if (total === 0)
    return 0
  return (used / total) * 100
}

/** 狀態閾值配置 */
const STATUS_THRESHOLDS = {
  success: 60,
  warning: 80,
} as const

/**
 * 根據佔用百分比返回狀態
 * @param percentage 百分比
 * @returns 狀態類型
 */
export function getStatus(percentage: number): 'success' | 'warning' | 'error' {
  if (percentage < STATUS_THRESHOLDS.success)
    return 'success'
  if (percentage < STATUS_THRESHOLDS.warning)
    return 'warning'
  return 'error'
}

/**
 * 格式化時間戳為可讀日期時間
 * @param timestamp 時間戳字串或 Date 對象
 * @returns 格式化後的字串，如 "2024-01-15 14:30:00"
 */
export function formatDateTime(timestamp: string | Date | undefined, format = 'YYYY-MM-DD HH:mm:ss'): string {
  if (!timestamp)
    return '-'

  const date = dayjs(timestamp)

  if (!date.isValid())
    return '-'

  return date.format(format)
}
