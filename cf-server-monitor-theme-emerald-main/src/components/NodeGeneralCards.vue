<script setup lang="ts">
import type { NodeData } from '@/stores/nodes'
import { Icon } from '@iconify/vue'
import { computed, defineAsyncComponent } from 'vue'
import NodeEarthGlobe from '@/components/NodeEarthGlobe.vue'
import { useAppStore } from '@/stores/app'
import { useNodesStore } from '@/stores/nodes'
import * as financeHelper from '@/utils/financeHelper'
import { parseNodeGroups } from '@/utils/groupHelper'
import { getCountryCodeFromRegion } from '@/utils/geoHelper'
import { formatBytesSplit, formatUptimeWithFormat } from '@/utils/helper'

const props = defineProps<{
  nodes?: NodeData[]
  globeNodes?: NodeData[]
  transitionKey?: string
}>()

const NodeEarthMaps = defineAsyncComponent(() => import('@/components/NodeEarthMaps.vue'))

const appStore = useAppStore()
const nodesStore = useNodesStore()
const summaryNodes = computed(() => props.nodes ?? nodesStore.nodes)

const totalNodes = computed(() => summaryNodes.value.length)
const onlineNodes = computed(() => summaryNodes.value.filter(node => node.online).length)
const offlineNodes = computed(() => totalNodes.value - onlineNodes.value)
const groupCount = computed(() => {
  const groups = new Set<string>()
  for (const node of summaryNodes.value) {
    for (const group of parseNodeGroups(node.group))
      groups.add(group)
  }
  return groups.size
})
const regionCount = computed(() => {
  const regions = new Set<string>()
  for (const node of summaryNodes.value) {
    const code = getCountryCodeFromRegion(node.region)
    if (code)
      regions.add(code)
  }
  return regions.size
})

const averageLatency = computed(() => {
  let total = 0
  let count = 0
  for (const node of summaryNodes.value) {
    if (!node.online || !node.ping)
      continue
    for (const ping of Object.values(node.ping)) {
      const latency = Number(ping.latest)
      if (Number.isFinite(latency) && latency > 0) {
        total += latency
        count += 1
      }
    }
  }
  return count > 0 ? `${Math.round(total / count)} ms` : '-'
})

const averageUptime = computed(() => {
  const onlineNodes = summaryNodes.value.filter(node => node.online && node.uptime > 0)
  if (onlineNodes.length === 0)
    return '-'
  const total = onlineNodes.reduce((sum, node) => sum + node.uptime, 0)
  return formatUptimeWithFormat(Math.round(total / onlineNodes.length), 'hour')
})

const remainingValue = computed(() => financeHelper.formatFinanceAmount(
  financeHelper.calculateTotalRemainingValueCNY(
    summaryNodes.value,
    financeHelper.DEFAULT_EXCHANGE_RATES,
    financeHelper.shouldExcludeFreeNodes(),
  ),
  'CNY',
))

const totalTraffic = computed(() => {
  const up = summaryNodes.value.reduce((sum, node) => sum + (node.net_total_up || 0), 0)
  const down = summaryNodes.value.reduce((sum, node) => sum + (node.net_total_down || 0), 0)
  return {
    total: formatBytesSplit(up + down, appStore.byteDecimals),
    up: formatBytesSplit(up, appStore.byteDecimals),
    down: formatBytesSplit(down, appStore.byteDecimals),
  }
})

const summaryItems = computed(() => [
  { label: '節點總數', value: `${onlineNodes.value}/${offlineNodes.value}`, detail: '在線 / 離線數量', icon: 'tabler:server-2', tone: 'info' },
  { label: '剩餘價值', value: `${remainingValue.value.symbol}${remainingValue.value.value}`, detail: '節點剩餘價值', icon: 'tabler:wallet', tone: 'success' },
  { label: '總流量', value: `${totalTraffic.value.total.value} ${totalTraffic.value.total.unit}`, detail: `上行 ${totalTraffic.value.up.value} ${totalTraffic.value.up.unit} · 下行 ${totalTraffic.value.down.value} ${totalTraffic.value.down.unit}`, icon: 'tabler:arrows-up-down', tone: 'blue' },
  { label: '分組數', value: groupCount.value, detail: '依服務用途整理', icon: 'tabler:layout-grid', tone: 'cyan' },
  { label: '覆蓋國家', value: regionCount.value, detail: '地球節點分布', icon: 'tabler:world', tone: 'info' },
  { label: '平均延遲', value: averageLatency.value, detail: `平均在線 ${averageUptime.value}`, icon: 'tabler:route-2', tone: 'warning' },
])

const showEarth = computed(() => appStore.earthViewMode === 'earth' || appStore.earthViewMode === 'earth-stop')
const showMaps = computed(() => appStore.earthViewMode === 'maps')
const showVisualPanel = computed(() => showEarth.value || showMaps.value)
</script>

<template>
  <section class="overview-shell px-4 pt-4">
    <div class="overview-summary" :class="{ 'overview-summary-full': !showVisualPanel }">
      <div
        v-for="item in summaryItems"
        :key="item.label"
        class="overview-stat"
        :class="`overview-stat-${item.tone}`"
      >
        <div class="flex items-start justify-between gap-3">
          <span class="overview-stat-label">{{ item.label }}</span>
          <Icon :icon="item.icon" :width="18" :height="18" class="overview-stat-icon" />
        </div>
        <strong>{{ item.value }}</strong>
        <span class="overview-stat-detail">{{ item.detail }}</span>
      </div>
    </div>

    <div v-if="showVisualPanel" class="overview-globe">
      <NodeEarthGlobe v-if="showEarth" :nodes="globeNodes" />
      <NodeEarthMaps v-else-if="showMaps" :nodes="globeNodes" />
    </div>
  </section>
</template>

<style scoped>
.overview-shell {
  display: grid;
  min-width: 0;
  gap: 0.75rem;
  grid-template-columns: repeat(12, minmax(0, 1fr));
}

.overview-summary {
  display: grid;
  min-width: 0;
  grid-column: span 6;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.625rem;
}

.overview-summary-full {
  grid-column: span 12;
  grid-template-columns: repeat(6, minmax(0, 1fr));
}

.overview-stat,
.overview-globe {
  min-width: 0;
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  background: color-mix(in srgb, var(--card) 92%, transparent);
}

.overview-stat {
  display: flex;
  min-height: 7.25rem;
  flex-direction: column;
  justify-content: space-between;
  padding: 0.875rem;
  transition: border-color 180ms ease, transform 180ms ease, background-color 180ms ease;
}

.overview-stat:hover {
  transform: translateY(-2px);
  border-color: color-mix(in srgb, var(--info) 52%, var(--border));
  background: color-mix(in srgb, var(--card) 100%, var(--info) 4%);
}

.overview-stat-label,
.overview-stat-detail {
  color: var(--muted-foreground);
  font-size: 0.72rem;
}

.overview-stat strong {
  color: var(--foreground);
  font-size: clamp(1.55rem, 3vw, 2.2rem);
  line-height: 1;
  letter-spacing: 0;
}

.overview-stat-icon {
  color: var(--stat-accent, var(--info));
}

.overview-stat-info { --stat-accent: var(--info); }
.overview-stat-success { --stat-accent: var(--success); }
.overview-stat-warning { --stat-accent: var(--warning); }
.overview-stat-danger { --stat-accent: var(--destructive); }
.overview-stat-cyan { --stat-accent: var(--cyan, #52d6ff); }
.overview-stat-blue { --stat-accent: var(--primary); }

.overview-globe {
  grid-column: span 6;
  min-height: 15rem;
  overflow: hidden;
}

@media (max-width: 1023px) {
  .overview-summary,
  .overview-globe {
    grid-column: span 12;
  }

  .overview-globe {
    min-height: 19rem;
  }

  .overview-summary-full {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 520px) {
  .overview-summary {
    grid-template-columns: 1fr 1fr;
  }

  .overview-summary-full {
    grid-template-columns: 1fr 1fr;
  }

  .overview-stat {
    min-height: 6.5rem;
    padding: 0.75rem;
  }
}
</style>
