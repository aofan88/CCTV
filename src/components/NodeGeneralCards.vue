<script setup lang="ts">
import type { NodeData } from '@/stores/nodes'
import { Icon } from '@iconify/vue'
import { computed, defineAsyncComponent } from 'vue'
import NodeEarthGlobe from '@/components/NodeEarthGlobe.vue'
import { useAppStore } from '@/stores/app'
import { useNodesStore } from '@/stores/nodes'
import { parseNodeGroups } from '@/utils/groupHelper'
import { getCountryCodeFromRegion } from '@/utils/geoHelper'

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

const summaryItems = computed(() => [
  { label: '節點總數', value: totalNodes.value, detail: '監控清單', icon: 'tabler:server-2', tone: 'info' },
  { label: '可用率', value: `${availability.value}%`, detail: `${onlineNodes.value} 個節點目前線上`, icon: 'tabler:activity-heartbeat', tone: availability.value >= 90 ? 'success' : availability.value >= 70 ? 'warning' : 'danger' },
  { label: '分組數', value: groupCount.value, detail: '依服務用途整理', icon: 'tabler:layout-grid', tone: 'cyan' },
  { label: '覆蓋地區', value: regionCount.value, detail: '地球節點分布', icon: 'tabler:world', tone: 'blue' },
])

const showEarth = computed(() => appStore.earthViewMode === 'earth' || appStore.earthViewMode === 'earth-stop')
const showMaps = computed(() => appStore.earthViewMode === 'maps')
const showVisualPanel = computed(() => showEarth.value || showMaps.value)
</script>

<template>
  <section class="overview-shell px-4 pt-4">
    <div class="overview-summary" :class="showVisualPanel ? 'lg:w-[42%]' : 'w-full'">
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

@media (max-width: 520px) {
  .overview-summary {
    grid-template-columns: 1fr 1fr;
  }

  .overview-stat {
    min-height: 6.5rem;
    padding: 0.75rem;
  }
}
</style>
