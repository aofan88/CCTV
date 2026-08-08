<script setup lang="ts">
import type { NodeData } from '@/stores/nodes'
import { Icon } from '@iconify/vue'
import { computed, defineAsyncComponent, onMounted, ref } from 'vue'
import NodeEarthGlobe from '@/components/NodeEarthGlobe.vue'
import { useAppStore } from '@/stores/app'
import { useNodesStore } from '@/stores/nodes'
import * as financeHelper from '@/utils/financeHelper'
import { formatBytesPerSecondSplit, formatBytesSplit } from '@/utils/helper'

const props = defineProps<{
  nodes?: NodeData[]
  globeNodes?: NodeData[]
  transitionKey?: string
}>()

const NodeEarthMaps = defineAsyncComponent(() => import('@/components/NodeEarthMaps.vue'))
const appStore = useAppStore()
const nodesStore = useNodesStore()
const exchangeRates = ref(financeHelper.DEFAULT_EXCHANGE_RATES)
const summaryNodes = computed(() => props.nodes ?? nodesStore.nodes)
const summaryTransitionKey = computed(() => props.transitionKey ?? 'all')

const onlineNodes = computed(() => summaryNodes.value.filter(node => node.online))
const offlineNodes = computed(() => summaryNodes.value.length - onlineNodes.value.length)
const totalSpeed = computed(() => ({
  up: onlineNodes.value.reduce((sum, node) => sum + (node.net_out || 0), 0),
  down: onlineNodes.value.reduce((sum, node) => sum + (node.net_in || 0), 0),
}))
const totalTraffic = computed(() => ({
  up: summaryNodes.value.reduce((sum, node) => sum + (node.net_total_up || 0), 0),
  down: summaryNodes.value.reduce((sum, node) => sum + (node.net_total_down || 0), 0),
}))

const formattedSpeedUp = computed(() => formatBytesPerSecondSplit(totalSpeed.value.up, appStore.byteDecimals))
const formattedSpeedDown = computed(() => formatBytesPerSecondSplit(totalSpeed.value.down, appStore.byteDecimals))
const formattedTraffic = computed(() => formatBytesSplit(totalTraffic.value.up + totalTraffic.value.down, appStore.byteDecimals))
const formattedMonthlyCost = computed(() => {
  const cny = financeHelper.calculateTotalMonthlyAverageCostCNY(summaryNodes.value, exchangeRates.value, false)
  return financeHelper.formatFinanceAmount(cny, 'CNY')
})

const showEarth = computed(() => appStore.earthViewMode === 'earth' || appStore.earthViewMode === 'earth-stop')
const showMaps = computed(() => appStore.earthViewMode === 'maps')
const showVisualPanel = computed(() => showEarth.value || showMaps.value)

onMounted(async () => {
  const { rates } = await financeHelper.getDailyExchangeRates()
  exchangeRates.value = rates
})
</script>

<template>
  <section class="overview-shell px-4 pt-4">
    <div class="overview-summary" :class="showVisualPanel ? 'lg:w-[42%]' : 'w-full'">
      <article class="overview-stat">
        <div class="flex items-start justify-between gap-3">
          <span class="overview-stat-label">伺服器總數</span>
          <Icon icon="tabler:server-2" :width="18" :height="18" class="overview-stat-icon" />
        </div>
        <div class="overview-stat-value">
          <strong>{{ onlineNodes.length }}/{{ offlineNodes }}</strong>
          <span>在線 / 離線</span>
        </div>
      </article>

      <article class="overview-stat">
        <div class="flex items-start justify-between gap-3">
          <span class="overview-stat-label">當前月費</span>
          <Icon icon="tabler:receipt-2" :width="18" :height="18" class="overview-stat-icon" />
        </div>
        <div class="overview-stat-value">
          <strong>{{ formattedMonthlyCost.symbol }}{{ formattedMonthlyCost.value }}</strong>
          <span>{{ formattedMonthlyCost.currency }} / 月</span>
        </div>
      </article>

      <article class="overview-stat">
        <div class="flex items-start justify-between gap-3">
          <span class="overview-stat-label">累計流量</span>
          <Icon icon="tabler:arrows-down-up" :width="18" :height="18" class="overview-stat-icon" />
        </div>
        <div class="overview-stat-value">
          <strong>{{ formattedTraffic.value }}</strong>
          <span>{{ formattedTraffic.unit }}</span>
        </div>
      </article>

      <article class="overview-stat">
        <div class="flex items-start justify-between gap-3">
          <span class="overview-stat-label">即時流量</span>
          <Icon icon="tabler:arrows-up-down" :width="18" :height="18" class="overview-stat-icon" />
        </div>
        <div class="overview-speed">
          <span class="text-emerald-500">↑ {{ formattedSpeedUp.value }} {{ formattedSpeedUp.unit }}</span>
          <span class="text-blue-500">↓ {{ formattedSpeedDown.value }} {{ formattedSpeedDown.unit }}</span>
        </div>
      </article>
    </div>

    <div v-if="showVisualPanel" class="overview-globe" :class="showVisualPanel ? 'lg:w-[58%]' : ''">
      <NodeEarthGlobe v-if="showEarth" :nodes="globeNodes" class="h-full min-h-72 w-full" />
      <NodeEarthMaps v-else-if="showMaps" :nodes="globeNodes" class="h-full min-h-72 w-full" />
    </div>
  </section>
</template>

<style scoped>
.overview-shell {
  display: flex;
  min-width: 0;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.overview-summary {
  display: grid;
  min-width: 0;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.625rem;
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
  border-color: color-mix(in srgb, var(--foreground) 22%, var(--border));
  background: color-mix(in srgb, var(--card) 98%, var(--foreground) 2%);
}

.overview-stat-label,
.overview-stat-value > span {
  color: var(--muted-foreground);
  font-size: 0.72rem;
}

.overview-stat-value {
  display: flex;
  min-width: 0;
  align-items: baseline;
  gap: 0.3rem;
}

.overview-stat strong {
  overflow: hidden;
  color: var(--foreground);
  font-size: clamp(1.55rem, 3vw, 2.2rem);
  line-height: 1;
  letter-spacing: 0;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.overview-stat-icon {
  flex: none;
  color: color-mix(in srgb, var(--muted-foreground) 70%, transparent);
  transition: color 180ms ease;
}

.overview-stat:hover .overview-stat-icon {
  color: var(--foreground);
}

.overview-speed {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem 0.75rem;
  font-size: 0.82rem;
  font-weight: 700;
  line-height: 1.2;
  white-space: nowrap;
}

.overview-globe {
  min-height: 15rem;
  overflow: hidden;
}

@media (max-width: 1023px) {
  .overview-summary,
  .overview-globe {
    width: 100%;
  }

  .overview-globe {
    min-height: 19rem;
  }
}

@media (max-width: 640px) {
  .overview-summary {
    grid-template-columns: 1fr 1fr;
  }

  .overview-stat {
    min-height: 6.5rem;
    padding: 0.75rem;
  }
}
</style>
