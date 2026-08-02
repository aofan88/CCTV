/**
 * 緩存管理模塊
 * 集中管理所有內存緩存，包括：
 * - 服務器列表緩存
 * - 服務器詳情（複用服務器列表緩存）
 * - 最新指標緩存
 * - 歷史指標緩存
 * - 站點設置緩存
 */

import { clearAppearanceSettingsCache, clearSiteSettingsCache, debug } from './settings.js';

const SERVERS_LIST_TTL = 120 * 1000;
let serversListCache = null;

const LATEST_ALL_TTL = 30 * 1000;
let latestAllCache = null;
let latestAllCacheTime = 0;

const metricsHistoryCache = new Map();

const serverDetailCache = new Map();

export function getCacheDuration(hours) {
  if (hours >= 120) {
    return 10 * 60 * 1000;
  } else if (hours >= 60) {
    return 5 * 60 * 1000;
  } else if (hours >= 30) {
    return 3 * 60 * 1000;
  } else {
    return 1 * 60 * 1000;
  }
}

function filterServersByHidden(servers, includeHidden) {
  if (!servers || servers.length === 0) return [];
  if (includeHidden) {
    return [...servers];
  }
  return servers.filter(s => s.is_hidden !== 1 && s.is_hidden !== '1');
}

export async function getAllServers(db, includeHidden = true) {
  const now = Date.now();
  
  if (serversListCache && now - serversListCache.time < SERVERS_LIST_TTL) {
    debug('服務器列表緩存命中');
    return filterServersByHidden(serversListCache.data, includeHidden);
  }

  try {
    const { results } = await db.prepare('SELECT * FROM servers ORDER BY sort_order ASC').all();
    serversListCache = { data: results, time: now };
    debug('服務器列表緩存更新');
    return filterServersByHidden(results, includeHidden);
  } catch (e) {
    debug('獲取服務器列表失敗:', e);
    return filterServersByHidden(serversListCache?.data, includeHidden);
  }
}

export function clearServersListCache() {
  serversListCache = null;
  serverDetailCache.clear();
}

export function clearServerDetailCache() {
  serverDetailCache.clear();
}

export async function getServerDetail(db, id, includeHidden = false) {
  const now = Date.now();
  const cached = serverDetailCache.get(id);
  
  if (cached) {
    if (now - cached.time < SERVERS_LIST_TTL) {
      debug('服務器詳情緩存命中');
      const server = cached.data;
      
      if (!server) {
        return null;
      }
      
      if (!includeHidden && (server.is_hidden === 1 || server.is_hidden === '1')) {
        return null;
      }
      
      return { ...server };
    }
    
    serverDetailCache.delete(id);
  }
  
  const server = await db.prepare('SELECT * FROM servers WHERE id = ?').bind(id).first();

  serverDetailCache.set(id, { data: server, time: now });
  debug('服務器詳情緩存更新');
  
  if (!server) {
    return null;
  }
  
  if (!includeHidden && (server.is_hidden === 1 || server.is_hidden === '1')) {
    return null;
  }
  
  return { ...server };
}

export async function checkServerExists(db, id) {
  const server = await getServerDetail(db, id, true);
  return !!server;
}

/**
 * 獲取最新指標緩存信息
 * @returns {object} 包含 cache、time、ttl 字段的對象
 */
export function getLatestMetricsCache() {
  return { cache: latestAllCache, time: latestAllCacheTime, ttl: LATEST_ALL_TTL };
}

export function setLatestMetricsCache(data) {
  latestAllCache = data;
  latestAllCacheTime = Date.now();
}

export function clearLatestMetricsCache() {
  latestAllCache = null;
  latestAllCacheTime = 0;
}

function getCacheKey(serverId, hours, columns, samplePoints = null) {
  const sortedColumns = columns.split(',').sort().join(',');
  const sampleSuffix = samplePoints ? `:points=${samplePoints}` : '';
  return `${serverId}:${hours}:${sortedColumns}${sampleSuffix}`;
}

export function getMetricsHistoryCache(serverId, hours, columns, samplePoints = null) {
  const key = getCacheKey(serverId, hours, columns, samplePoints);
  return metricsHistoryCache.get(key);
}

export function setMetricsHistoryCache(serverId, hours, columns, data, samplePoints = null) {
  const key = getCacheKey(serverId, hours, columns, samplePoints);
  metricsHistoryCache.set(key, { data, timestamp: Date.now() });
}

export function clearMetricsHistoryCache(serverId) {
  for (const key of metricsHistoryCache.keys()) {
    if (key.startsWith(`${serverId}:`)) {
      metricsHistoryCache.delete(key);
    }
  }
}

export function clearAllCaches() {
  clearServersListCache();
  clearLatestMetricsCache();
  metricsHistoryCache.clear();
  clearSiteSettingsCache();
  clearAppearanceSettingsCache();
}
