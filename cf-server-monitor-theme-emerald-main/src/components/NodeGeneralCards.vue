<script setup lang="ts">
import type { NodeData } from '@/stores/nodes'
import { Icon } from '@iconify/vue'
import { computed, defineAsyncComponent } from 'vue'
import NodeEarthGlobe from '@/components/NodeEarthGlobe.vue'
import { CardX } from '@/components/ui/card-x'
import { useBackgroundSurface } from '@/composables/useBackgroundSurface'
import { useAppStore } from '@/stores/app'
import { useNodesStore } from '@/stores/nodes'
import { parseNodeGroups } from '@/utils/groupHelper'
import { getCountryCodeFromRegion } from '@/utils/geoHelper'
import { formatBytesPerSecondSplit } from '@/utils/helper'

const props = defineProps<{
  nodes?: NodeData[]
  globeNodes?: NodeData[]
  transitionKey?: string
}>()

const NodeEarthMaps = defineAsyncComponent(() => import('@/components/NodeEarthMaps.vue'))

const appStore = useAppStore()
const { pickSurfaceClass } = useBackgroundSurface()
const nodesStore = useNodesStore()

const summaryNodes = computed(() => props.nodes ?? nodesStore.nodes)

const totalNodes = computed(() => summaryNodes.value.length)
const onlineNodes = computed(() => summaryNodes.value.filter(node => node.online).length)
const availability = computed(() => totalNodes.value === 0 ? 0 : Math.round(onlineNodes.value / totalNodes.value * 100))
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

const totalSpeed = computed(() => {
  const onlineNodes = summaryNodes.value.filter(node => node.online)
  const up = onlineNodes.reduce((sum, node) => sum + (node.net_out || 0), 0)
  const down = onlineNodes.reduce((sum, node) => sum + (node.net_in || 0), 0)
  return { up, down }
})

const formattedSpeedUp = computed(() => formatBytesPerSecondSplit(totalSpeed.value.up, appStore.byteDecimals))
const formattedSpeedDown = computed(() => formatBytesPerSecondSplit(totalSpeed.value.down, appStore.byteDecimals))

const summaryItems = computed(() => [
  { label: '節點總數', value: String(totalNodes.value), detail: '監控清單', icon: 'tabler:server-2', tone: 'info' },
  { label: '可用率', value: `${availability.value}%`, detail: `${onlineNodes.value} 個節點目前線上`, icon: 'tabler:activity-heartbeat', tone: availability.value >= 90 ? 'success' : availability.value >= 70 ? 'warning' : 'danger' },
  { label: '分組數', value: String(groupCount.value), detail: '依服務用途整理', icon: 'tabler:layout-grid', tone: 'cyan' },
  { label: '覆蓋地區', value: String(regionCount.value), detail: '地球節點分布', icon: 'tabler:world', tone: 'blue' },
  { label: '即時上行', value: formattedSpeedUp.value.value, unit: formattedSpeedUp.value.unit, detail: '全站即時發送', icon: 'tabler:chevrons-up', tone: 'success' },
  { label: '即時下行', value: formattedSpeedDown.value.value, unit: formattedSpeedDown.value.unit, detail: '全站即時接收', icon: 'tabler:chevrons-down', tone: 'cyan' },
])

const showEarth = computed(() => appStore.earthViewMode === 'earth' || appStore.earthViewMode === 'earth-stop')
const showMaps = computed(() => appStore.earthViewMode === 'maps')
const showVisualPanel = computed(() => showEarth.value || showMaps.value)

const wrapperClass = computed(() => showVisualPanel.value
  ? 'px-4 pt-4 grid grid-cols-12 gap-3 h-auto md:h-64'
  : 'px-4 pt-4 grid grid-cols-1 gap-3 h-auto')

const cardGridClass = computed(() => showVisualPanel.value
  ? 'col-span-12 md:col-span-6 grid grid-cols-3 grid-rows-2 gap-2 h-full'
  : 'col-span-1 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2')
</script>

<template>
  <section :class="wrapperClass">
    <div :class="cardGridClass">
      <CardX
        v-for="item in summaryItems"
        :key="item.label"
        hoverable
        class="group h-full border-none rounded-md transition-all flex flex-col justify-between p-3"
        :class="[
          pickSurfaceClass('bg-background/60 hover:bg-background', 'bg-background/50 hover:bg-background backdrop-blur-xs'),
          `overview-stat-${item.tone}`
        ]"
        content-class="h-full !p-0"
      >
        <div class="flex h-full flex-col justify-between gap-1">
          <div class="flex items-start justify-between">
            <span class="text-xs font-medium tracking-wider text-muted-foreground">{{ item.label }}</span>
            <Icon
              :icon="item.icon" :width="18" :height="18"
              class="overview-stat-icon transition-colors"
            />
          </div>
          <div class="flex items-baseline gap-1 min-w-0 my-1">
            <span class="text-lg md:text-2xl font-bold leading-none tracking-tight text-foreground">
              {{ item.value }}
            </span>
            <span v-if="item.unit" class="text-[11px] md:text-xs font-medium text-muted-foreground truncate">
              {{ item.unit }}
            </span>
          </div>
          <span class="text-[11px] text-muted-foreground truncate">{{ item.detail }}</span>
        </div>
      </CardX>
    </div>

    <div v-if="showVisualPanel" class="overview-globe col-span-12 md:col-span-6 h-full min-h-[220px] md:min-h-0 overflow-hidden border border-border/40 rounded-md bg-background/50 backdrop-blur-xs relative flex items-center justify-center">
      <NodeEarthGlobe v-if="showEarth" :nodes="globeNodes" class="h-full w-full" />
      <NodeEarthMaps v-else-if="showMaps" :nodes="globeNodes" class="h-full w-full" />
    </div>
  </section>
</template>

<style scoped>
.overview-stat-icon {
  color: var(--stat-accent, var(--info));
}

.overview-stat-info { --stat-accent: var(--info, #3b82f6); }
.overview-stat-success { --stat-accent: var(--success, #10b981); }
.overview-stat-warning { --stat-accent: var(--warning, #f59e0b); }
.overview-stat-danger { --stat-accent: var(--destructive, #ef4444); }
.overview-stat-cyan { --stat-accent: var(--cyan, #06b6d4); }
.overview-stat-blue { --stat-accent: var(--primary, #6366f1); }
</style>
