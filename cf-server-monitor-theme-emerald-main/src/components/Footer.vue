<script setup lang="ts">
import { computed } from 'vue'
import VisitorInfoCard from '@/components/VisitorInfoCard.vue'
import { useAppStore } from '@/stores/app'

const appStore = useAppStore()

const showIcp = computed(() => appStore.icpEnabled && appStore.icpNumber)
const showPolice = computed(() => appStore.policeEnabled && appStore.policeNumber)
const showFiling = computed(() => showIcp.value || showPolice.value)
</script>

<template>
  <VisitorInfoCard v-if="appStore.visitorInfoCardEnabled" />
  <footer class="runsing-footer w-full max-w-[1280px] mx-auto px-4 pb-6 pt-3">
    <div class="flex flex-col gap-2 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
      <div class="flex flex-wrap items-center gap-x-2 gap-y-1">
        <span>© 2026</span>
        <span class="text-border">|</span>
        <a
          href="https://innovation.runsing.co" target="_blank" rel="noopener noreferrer"
          class="font-medium text-foreground transition-opacity hover:opacity-80"
        >
          RunSing Innovation 潤昇創新
        </a>
      </div>
      <div class="flex flex-wrap items-center gap-x-2 gap-y-1 sm:justify-end">
        <span>Designed by Joe</span>
        <span class="text-border">|</span>
        <span>v0.1.17</span>
      </div>
    </div>

    <div v-if="showFiling" class="flex flex-wrap gap-2 items-center justify-center sm:flex-shrink-0 pb-7">
      <a
        v-if="showIcp" :href="appStore.icpUrl" target="_blank" rel="noopener noreferrer"
        class="transition-opacity hover:opacity-70"
      >
        <span class="text-xs text-muted-foreground">{{ appStore.icpNumber || '' }}</span>
      </a>
      <span v-if="showIcp && showPolice" class="opacity-50 text-xs text-muted-foreground">·</span>
      <template v-if="showPolice">
        <a
          v-if="appStore.policeUrl" :href="appStore.policeUrl" target="_blank" rel="noopener noreferrer"
          class="transition-opacity hover:opacity-70"
        >
          <span class="text-xs text-muted-foreground">{{ appStore.policeNumber || '' }}</span>
        </a>
        <span v-else class="text-xs text-muted-foreground">{{ appStore.policeNumber || '' }}</span>
      </template>
    </div>
  </footer>
</template>
