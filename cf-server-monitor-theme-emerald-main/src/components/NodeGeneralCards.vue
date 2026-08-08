<script setup lang="ts">
import type { NodeData } from '@/stores/nodes'
import { Icon } from '@iconify/vue'
import { computed, defineAsyncComponent, onMounted, ref } from 'vue'
import NodeEarthGlobe from '@/components/NodeEarthGlobe.vue'
import { CardX } from '@/components/ui/card-x'
import { useBackgroundSurface } from '@/composables/useBackgroundSurface'
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
const { pickSurfaceClass } = useBackgroundSurface()
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
const wrapperClass = computed(() => showVisualPanel.value
  ? 'p-4 grid grid-cols-1 gap-3 md:grid-cols-12 md:grid-rows-1 md:h-[26rem]'
  : 'p-4 grid grid-cols-1 gap-2 h-auto')
const cardGridClass = computed(() => showVisualPanel.value
  ? 'grid grid-cols-2 grid-rows-2 content-start gap-3 self-start md:col-span-6 md:row-start-1 md:h-fit'
  : 'grid grid-cols-2 md:grid-cols-4 gap-2')

onMounted(async () => {
  const { rates } = await financeHelper.getDailyExchangeRates()
  exchangeRates.value = rates
})
</script>

<template>
  <div :class="wrapperClass">
    <NodeEarthGlobe v-if="showEarth" :nodes="globeNodes" class="min-h-[20rem] w-full md:col-span-6 md:col-start-7 md:row-start-1 md:h-full" />
    <NodeEarthMaps v-else-if="showMaps" :nodes="globeNodes" class="min-h-[20rem] w-full md:col-span-6 md:col-start-7 md:row-start-1 md:h-full" />

    <div :class="cardGridClass">
      <CardX
        hoverable
        class="summary-card group min-h-32 rounded-md transition-all"
        :class="pickSurfaceClass('bg-background/60 hover:bg-background', 'bg-background/50 hover:bg-background backdrop-blur-xs')"
        content-class="!p-4"
      >
        <div class="flex min-h-24 flex-col justify-between gap-2">
          <div class="flex items-start justify-between">
            <span class="text-xs font-medium tracking-wider text-muted-foreground">伺服器總數</span>
            <Icon icon="tabler:server-2" width="20" height="20" class="text-muted-foreground/60 transition-colors group-hover:text-foreground" />
          </div>
          <div class="flex items-baseline gap-1">
            <span class="text-2xl font-bold leading-none tracking-tight">{{ onlineNodes.length }}/{{ offlineNodes }}</span>
            <span class="text-xs font-medium text-muted-foreground">在線 / 離線</span>
          </div>
        </div>
      </CardX>

      <CardX
        hoverable
        class="summary-card group min-h-32 rounded-md transition-all"
        :class="pickSurfaceClass('bg-background/60 hover:bg-background', 'bg-background/50 hover:bg-background backdrop-blur-xs')"
        content-class="!p-4"
      >
        <div class="flex min-h-24 flex-col justify-between gap-2">
          <div class="flex items-start justify-between">
            <span class="text-xs font-medium tracking-wider text-muted-foreground">當前月費</span>
            <Icon icon="tabler:receipt-2" width="20" height="20" class="text-muted-foreground/60 transition-colors group-hover:text-foreground" />
          </div>
          <div class="flex items-baseline gap-1 min-w-0">
            <span class="text-2xl font-bold leading-none tracking-tight truncate">{{ formattedMonthlyCost.symbol }}{{ formattedMonthlyCost.value }}</span>
            <span class="text-xs font-medium text-muted-foreground">{{ formattedMonthlyCost.currency }} / 月</span>
          </div>
        </div>
      </CardX>

      <CardX
        hoverable
        class="summary-card group min-h-32 rounded-md transition-all"
        :class="pickSurfaceClass('bg-background/60 hover:bg-background', 'bg-background/50 hover:bg-background backdrop-blur-xs')"
        content-class="!p-4"
      >
        <div class="flex min-h-24 flex-col justify-between gap-2">
          <div class="flex items-start justify-between">
            <span class="text-xs font-medium tracking-wider text-muted-foreground">累計流量</span>
            <Icon icon="tabler:arrows-down-up" width="20" height="20" class="text-muted-foreground/60 transition-colors group-hover:text-foreground" />
          </div>
          <div class="flex items-baseline gap-1">
            <span class="text-2xl font-bold leading-none tracking-tight">{{ formattedTraffic.value }}</span>
            <span class="text-xs font-medium text-muted-foreground">{{ formattedTraffic.unit }}</span>
          </div>
        </div>
      </CardX>

      <CardX
        hoverable
        class="summary-card group min-h-32 rounded-md transition-all"
        :class="pickSurfaceClass('bg-background/60 hover:bg-background', 'bg-background/50 hover:bg-background backdrop-blur-xs')"
        content-class="!p-4"
      >
        <div class="flex min-h-24 flex-col justify-between gap-2">
          <div class="flex items-start justify-between">
            <span class="text-xs font-medium tracking-wider text-muted-foreground">即時流量</span>
            <Icon icon="tabler:arrows-up-down" width="20" height="20" class="text-muted-foreground/60 transition-colors group-hover:text-foreground" />
          </div>
          <div class="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-sm font-bold leading-tight whitespace-nowrap">
            <span class="text-emerald-500">↑ {{ formattedSpeedUp.value }} {{ formattedSpeedUp.unit }}</span>
            <span class="text-blue-500">↓ {{ formattedSpeedDown.value }} {{ formattedSpeedDown.unit }}</span>
          </div>
        </div>
      </CardX>
    </div>

  </div>
</template>
