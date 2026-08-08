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
import { formatBytesSplit } from '@/utils/helper'
import { getRegionCode } from '@/utils/regionHelper'

const props = defineProps<{
  nodes?: NodeData[]
  globeNodes?: NodeData[]
  transitionKey?: string
}>()

const NodeEarthMaps = defineAsyncComponent(() => import('@/components/NodeEarthMaps.vue'))
const appStore = useAppStore()
const { pickSurfaceClass } = useBackgroundSurface()
const nodesStore = useNodesStore()
const exchangeRates = ref(financeHelper.DEFAULT_EXCHANGE_RATES)
const summaryNodes = computed(() => props.nodes ?? nodesStore.nodes)

const onlineNodeCount = computed(() => summaryNodes.value.filter(node => node.online).length)
const offlineNodeCount = computed(() => summaryNodes.value.length - onlineNodeCount.value)
const totalTraffic = computed(() => {
  const up = summaryNodes.value.reduce((sum, node) => sum + (node.net_total_up || 0), 0)
  const down = summaryNodes.value.reduce((sum, node) => sum + (node.net_total_down || 0), 0)
  return up + down
})

const coveredCountryCount = computed(() => {
  const countryCodes = summaryNodes.value
    .map(node => getRegionCode(node.region || '').toUpperCase())
    .filter(Boolean)

  return new Set(countryCodes).size
})
const formattedTraffic = computed(() => formatBytesSplit(totalTraffic.value, appStore.byteDecimals))
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
  <div class="px-4 pt-2 relative max-w-[1280px] mx-auto">
    <!-- Grid container: 12 columns on md and above -->
    <div class="grid grid-cols-12 gap-3 items-center relative z-1">

      <!-- 左側 4 個小卡片 (2x2 網格，佔據左半邊 6 欄) -->
      <div
        class="grid grid-cols-2 gap-3 relative z-10"
        :class="showVisualPanel ? 'col-span-12 md:col-span-6' : 'col-span-12 grid-cols-2 sm:grid-cols-4'"
      >
        <!-- Card 1: 伺服器總數 -->
        <CardX
          hoverable
          class="group border-none rounded-md transition-all p-3.5"
          :class="pickSurfaceClass('bg-background/60 hover:bg-background', 'bg-background/50 hover:bg-background backdrop-blur-xs')"
          content-class="h-full !p-0"
        >
          <div class="flex h-full flex-col justify-between gap-2">
            <div class="flex items-start justify-between">
              <span class="text-xs font-medium tracking-wider text-muted-foreground">伺服器總數</span>
              <Icon icon="tabler:server-2" :width="20" :height="20" class="text-slate-500/30 group-hover:text-slate-300 transition-colors" />
            </div>
            <div class="flex items-baseline gap-1.5 min-w-0 my-0.5">
              <span class="text-xl md:text-2xl font-bold leading-none tracking-tight text-foreground">{{ onlineNodeCount }}/{{ offlineNodeCount }}</span>
              <span class="text-xs font-medium text-muted-foreground">在線 / 離線</span>
            </div>
          </div>
        </CardX>

        <!-- Card 2: 當前月費 -->
        <CardX
          hoverable
          class="group border-none rounded-md transition-all p-3.5"
          :class="pickSurfaceClass('bg-background/60 hover:bg-background', 'bg-background/50 hover:bg-background backdrop-blur-xs')"
          content-class="h-full !p-0"
        >
          <div class="flex h-full flex-col justify-between gap-2">
            <div class="flex items-start justify-between">
              <span class="text-xs font-medium tracking-wider text-muted-foreground">當前月費</span>
              <Icon icon="tabler:receipt-2" :width="20" :height="20" class="text-slate-500/30 group-hover:text-slate-300 transition-colors" />
            </div>
            <div class="flex items-baseline gap-1.5 min-w-0 my-0.5">
              <span class="text-xl md:text-2xl font-bold leading-none tracking-tight text-foreground">{{ formattedMonthlyCost.symbol }}{{ formattedMonthlyCost.value }}</span>
              <span class="text-xs font-medium text-muted-foreground truncate">{{ formattedMonthlyCost.currency }} / 月</span>
            </div>
          </div>
        </CardX>

        <!-- Card 3: 累計流量 -->
        <CardX
          hoverable
          class="group border-none rounded-md transition-all p-3.5"
          :class="pickSurfaceClass('bg-background/60 hover:bg-background', 'bg-background/50 hover:bg-background backdrop-blur-xs')"
          content-class="h-full !p-0"
        >
          <div class="flex h-full flex-col justify-between gap-2">
            <div class="flex items-start justify-between">
              <span class="text-xs font-medium tracking-wider text-muted-foreground">累計流量</span>
              <Icon icon="tabler:arrows-down-up" :width="20" :height="20" class="text-slate-500/30 group-hover:text-slate-300 transition-colors" />
            </div>
            <div class="flex items-baseline gap-1.5 min-w-0 my-0.5">
              <span class="text-xl md:text-2xl font-bold leading-none tracking-tight text-foreground">{{ formattedTraffic.value }}</span>
              <span class="text-xs font-medium text-muted-foreground">{{ formattedTraffic.unit }}</span>
            </div>
          </div>
        </CardX>

        <!-- Card 4: 覆蓋國家 -->
        <CardX
          hoverable
          class="group border-none rounded-md transition-all p-3.5"
          :class="pickSurfaceClass('bg-background/60 hover:bg-background', 'bg-background/50 hover:bg-background backdrop-blur-xs')"
          content-class="h-full !p-0"
        >
          <div class="flex h-full flex-col justify-between gap-2">
            <div class="flex items-start justify-between">
              <span class="text-xs font-medium tracking-wider text-muted-foreground">覆蓋國家</span>
              <Icon icon="tabler:world" :width="20" :height="20" class="text-slate-500/30 group-hover:text-slate-300 transition-colors" />
            </div>
            <div class="flex items-baseline gap-1.5 min-w-0 my-0.5">
              <span class="text-xl md:text-2xl font-bold leading-none tracking-tight text-foreground">{{ coveredCountryCount }}</span>
              <span class="text-xs font-medium text-muted-foreground">個國家 / 地區</span>
            </div>
          </div>
        </CardX>
      </div>

      <!-- 右側 3D 地球 / 地圖區域 (右半邊 6 欄，下半部優雅重疊至下方選單/卡片區) -->
      <div
        v-if="showVisualPanel"
        class="col-span-12 md:col-span-6 relative flex items-center justify-center min-h-[280px] md:min-h-[240px] md:-mb-16 z-0 overflow-visible"
      >
        <NodeEarthGlobe
          v-if="showEarth"
          :nodes="globeNodes"
          class="w-full max-w-[380px] md:max-w-none aspect-square"
        />
        <NodeEarthMaps
          v-else-if="showMaps"
          :nodes="globeNodes"
          class="w-full h-full min-h-[240px]"
        />
      </div>

    </div>
  </div>
</template>
