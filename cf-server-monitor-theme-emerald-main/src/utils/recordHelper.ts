/**
 * 數據處理工具函數
 * 參考 React 版本的 RecordHelper.tsx 實現
 */

import dayjs from 'dayjs'

/** 負載記錄格式 */
export interface RecordFormat {
  client: string
  time: string
  cpu: number | null
  gpu: number | null
  gpu_usage: number | null
  gpu_memory: number | null
  gpu_detailed?: {
    [index: number]: {
      usage: number | null
      memory: number | null
      temperature: number | null
      device_index?: number
      device_name?: string
      mem_total?: number
      mem_used?: number
    }
  }
  ram: number | null
  ram_total: number | null
  swap: number | null
  swap_total: number | null
  load: number | null
  temp: number | null
  disk: number | null
  disk_total: number | null
  net_in: number | null
  net_out: number | null
  net_total_up: number | null
  net_total_down: number | null
  process: number | null
  connections: number | null
  connections_udp: number | null
}

type AnyRecord = Record<string, any>

/**
 * 創建空值模板
 * 遞歸設定所有數值屬性為 null，用於填充缺失的時間點
 */
function createNullTemplate(obj: unknown): unknown {
  if (obj === null || obj === undefined)
    return null
  if (typeof obj === 'number')
    return null
  if (typeof obj === 'string' || typeof obj === 'boolean')
    return obj
  if (Array.isArray(obj))
    return obj.map(createNullTemplate)
  if (typeof obj === 'object') {
    const res: Record<string, unknown> = {}
    for (const k in obj as Record<string, unknown>) {
      if (k === 'updated_at' || k === 'time')
        continue
      res[k] = createNullTemplate((obj as Record<string, unknown>)[k])
    }
    return res
  }
  return null
}

/**
 * 填充缺失的時間點
 * 兩種模式：
 * 1. 固定長度（預設）：生成指定長度的時間窗口數據，以最後一個數據點為終點
 * 2. 可變長度：如果 totalSeconds 為 null，則從第一個數據點填充到最後一個
 *
 * @param data 輸入數據數組，應有 time 或 updated_at 屬性
 * @param intervalSec 時間點間隔（秒）
 * @param totalSeconds 要顯示的總時長（秒），設為 null 則從第一個數據點開始
 * @param matchToleranceSec 匹配時間點的容差（秒），預設為 intervalSec
 */
export function fillMissingTimePoints<T extends { time?: string, updated_at?: string }>(
  data: T[],
  intervalSec: number = 10,
  totalSeconds: number | null = 180,
  matchToleranceSec?: number,
): T[] {
  if (!data.length)
    return []

  const getTime = (item: T) =>
    dayjs(item.time ?? item.updated_at ?? '').valueOf()

  // 預計算時間戳，避免重複解析
  const timedData = data.map(item => ({ item, timeMs: getTime(item) }))
  timedData.sort((a, b) => a.timeMs - b.timeMs)

  const firstItem = timedData[0]
  const lastItem = timedData.at(-1)

  if (!firstItem || !lastItem)
    return []

  const end = lastItem.timeMs
  const interval = intervalSec * 1000

  // 確定起始時間
  const start
    = totalSeconds !== null && totalSeconds > 0
      ? end - totalSeconds * 1000 + interval // 固定長度模式
      : firstItem.timeMs // 可變長度模式

  // 生成理想的時間點
  const timePoints: number[] = []
  for (let t = start; t <= end; t += interval) {
    timePoints.push(t)
  }

  // 創建空值模板
  const nullTemplate = createNullTemplate(lastItem.item) as T

  let dataIdx = 0
  const matchToleranceMs = (matchToleranceSec ?? intervalSec) * 1000

  const filled: T[] = timePoints.map((t) => {
    let found: T | undefined

    // 跳過太舊的數據點
    while (
      dataIdx < timedData.length
      && timedData[dataIdx]!.timeMs < t - matchToleranceMs
    ) {
      dataIdx++
    }

    const currentData = timedData[dataIdx]
    // 檢查目前數據點是否在容差範圍內
    if (
      currentData
      && Math.abs(currentData.timeMs - t) <= matchToleranceMs
    ) {
      found = currentData.item
    }

    if (found) {
      // 找到則使用，但對齊時間到網格
      return { ...found, time: dayjs(t).toISOString() }
    }

    // 未找到則插入空值模板
    return { ...nullTemplate, time: dayjs(t).toISOString() } as T
  })

  return filled
}

/**
 * 線性插值填充
 * 在相鄰兩個有效點之間，用線性插值填充中間的 null 值
 * - 僅在"兩個端點都存在且為數值"時進行插值
 * - 可通過 maxGapMs 控制最大可插值的時間跨度
 */
export function interpolateNullsLinear(
  rows: AnyRecord[],
  keys: string[],
  options?:
    | number
    | {
      /** 統一的最大插值跨度 */
      maxGapMs?: number
      /** 若未提供 maxGapMs，則以典型間隔 * 該倍數作為最大插值跨度 */
      maxGapMultiplier?: number
      /** 統一的下限與上限（用於鉗制） */
      minCapMs?: number
      maxCapMs?: number
    },
): AnyRecord[] {
  if (!rows || rows.length === 0 || !keys.length)
    return rows

  const times = rows.map(r =>
    dayjs(r.time ?? r.updated_at ?? '').valueOf(),
  )
  const out: AnyRecord[] = rows.map(r => ({ ...r }))

  // 解析配置
  const opts
    = typeof options === 'number'
      ? { maxGapMs: options }
      : options || {}
  const maxGapMsUnified = opts.maxGapMs
  const multiplier = opts.maxGapMultiplier ?? 6
  const minCap = opts.minCapMs ?? 2 * 60_000 // 2min
  const maxCap = opts.maxCapMs ?? 30 * 60_000 // 30min

  const clamp = (v: number, lo: number, hi: number) =>
    Math.max(lo, Math.min(hi, v))

  for (const key of keys) {
    // 收集該列的有效點索引
    const validIdx: number[] = []
    for (let i = 0; i < rows.length; i++) {
      const v = rows[i]?.[key]
      if (typeof v === 'number' && Number.isFinite(v))
        validIdx.push(i)
    }

    if (validIdx.length < 2)
      continue

    // 計算該列的"典型間隔"（使用中位數）
    let perKeyMaxGap = maxGapMsUnified
    if (perKeyMaxGap === undefined) {
      const gaps: number[] = []
      for (let s = 0; s < validIdx.length - 1; s++) {
        const i0 = validIdx[s]
        const i1 = validIdx[s + 1]
        if (i0 === undefined || i1 === undefined)
          continue
        const t0 = times[i0]
        const t1 = times[i1]
        if (t0 !== undefined && t1 !== undefined && Number.isFinite(t0) && Number.isFinite(t1) && t1 > t0) {
          gaps.push(t1 - t0)
        }
      }
      if (gaps.length === 0)
        continue
      gaps.sort((a, b) => a - b)
      const median = gaps[Math.floor(gaps.length / 2)]
      if (median === undefined)
        continue
      perKeyMaxGap = clamp(median * multiplier, minCap, maxCap)
    }

    // 相鄰有效點之間做線性插值
    for (let s = 0; s < validIdx.length - 1; s++) {
      const i0 = validIdx[s]
      const i1 = validIdx[s + 1]
      if (i0 === undefined || i1 === undefined)
        continue

      const t0 = times[i0]
      const t1 = times[i1]
      if (t0 === undefined || t1 === undefined)
        continue

      const row0 = rows[i0]
      const row1 = rows[i1]
      if (!row0 || !row1)
        continue

      const v0 = row0[key]
      const v1 = row1[key]

      if (!Number.isFinite(t0) || !Number.isFinite(t1) || t1 <= t0)
        continue
      if (typeof v0 !== 'number' || typeof v1 !== 'number')
        continue
      if (perKeyMaxGap && t1 - t0 > perKeyMaxGap)
        continue // 間隔太大，保持空洞

      for (let j = i0 + 1; j < i1; j++) {
        const tj = times[j]
        if (tj === undefined)
          continue
        const ratio = (tj - t0) / (t1 - t0)
        const outRow = out[j]
        if (outRow) {
          outRow[key] = v0 + (v1 - v0) * ratio
        }
      }
    }
  }

  return out
}

/**
 * EWMA（指數加權移動平均）峰值裁剪
 * 使用指數加權移動平均算法平滑數據，同時檢測並過濾突變值，填充 null/undefined 值
 *
 * @param data 輸入數據數組
 * @param keys 需要處理的數值屬性名數組
 * @param alpha 平滑因子
 * @param windowSize 突變檢測窗口大小
 * @param spikeThreshold 突變閾值
 */
export function cutPeakValues(
  data: AnyRecord[],
  keys: string[],
  alpha: number = 0.3,
  windowSize: number = 15,
  spikeThreshold: number = 0.3,
): AnyRecord[] {
  if (!data || data.length === 0)
    return data

  const result: AnyRecord[] = [...data]
  const halfWindow = Math.floor(windowSize / 2)

  for (const key of keys) {
    // 第一步：檢測並移除突變值
    for (let i = 0; i < result.length; i++) {
      const currentRow = result[i]
      if (!currentRow)
        continue
      const currentValue = currentRow[key]

      if (currentValue != null && typeof currentValue === 'number') {
        const neighborValues: number[] = []

        // 收集窗口範圍內的鄰近有效值
        for (
          let j = Math.max(0, i - halfWindow);
          j <= Math.min(result.length - 1, i + halfWindow);
          j++
        ) {
          if (j === i)
            continue
          const neighborRow = result[j]
          if (!neighborRow)
            continue
          const neighbor = neighborRow[key]
          if (neighbor != null && typeof neighbor === 'number') {
            neighborValues.push(neighbor)
          }
        }

        // 如果有足夠的鄰近值進行突變檢測
        if (neighborValues.length >= 2) {
          const neighborSum = neighborValues.reduce((sum, val) => sum + val, 0)
          const neighborMean = neighborValues.length > 0 ? neighborSum / neighborValues.length : 0

          // 檢測突變
          if (neighborMean > 0) {
            const relativeChange = Math.abs(currentValue - neighborMean) / neighborMean
            if (relativeChange > spikeThreshold) {
              result[i] = { ...currentRow, [key]: null }
            }
          }
          else if (Math.abs(currentValue) > 10) {
            result[i] = { ...currentRow, [key]: null }
          }
        }
      }
    }

    // 第二步：使用 EWMA 平滑和填充
    let ewma: number | null = null

    for (let i = 0; i < result.length; i++) {
      const row = result[i]
      if (!row)
        continue
      const currentValue = row[key]

      if (currentValue != null && typeof currentValue === 'number') {
        if (ewma === null) {
          ewma = currentValue
        }
        else {
          ewma = alpha * currentValue + (1 - alpha) * ewma
        }
        result[i] = { ...row, [key]: ewma }
      }
      else if (ewma !== null) {
        result[i] = { ...row, [key]: ewma }
      }
    }
  }

  return result
}
