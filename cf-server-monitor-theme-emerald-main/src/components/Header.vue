<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { computed, inject, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import { DataTooltip } from '@/components/ui/data-tooltip'
import { useAppStore } from '@/stores/app'
import { buildAdminUrl } from '@/utils/api'
import { publicAsset } from '@/utils/publicAsset'

const router = useRouter()
const appStore = useAppStore()

const isScrolled = inject<ReturnType<typeof ref<boolean>>>('isScrolled', ref(false))

const actionButtons = computed(() => {
  const buttons = [
    {
      title: appStore.themeMode === 'auto' ? '自動主題' : appStore.themeMode === 'light' ? '淺色主題' : '深色主題',
      icon: appStore.themeMode === 'auto' ? 'icon-park-outline:dark-mode' : appStore.themeMode === 'light' ? 'icon-park-outline:sun-one' : 'icon-park-outline:moon',
      action: 'toggleTheme',
    },
  ]

  if (appStore.isLoggedIn || !appStore.hideAdminEntryWhenLoggedOut) {
    buttons.push({
      title: '後臺管理',
      icon: 'icon-park-outline:setting',
      action: 'jumpToSetting',
    })
  }
  return buttons
})

function handleButtonClick(action: string) {
  switch (action) {
    case 'toggleTheme':
      appStore.updateThemeMode()
      break
    case 'jumpToSetting':
      location.href = buildAdminUrl(0)
      break
  }
}

const sitename = computed(() => appStore.publicSettings?.sitename || '潤昇創新 RunSing Innovation')
const logoUrl = publicAsset('runsing-logo.jpeg')
</script>

<template>
  <div
    class="transition-all duration-200 top-0 sticky z-10 border-b border-transparent"
    :class="isScrolled ? 'backdrop-blur-xl' : 'bg-transparent'"
  >
    <div class="px-4 flex-between h-14 max-w-[1280px] mx-auto">
      <div class="flex items-center gap-3 cursor-pointer" @click="router.push('/')">
        <img :src="logoUrl" alt="潤昇創新 Logo" class="size-8 rounded-md object-cover">
        <h3 class="m-0 text-lg font-semibold">
          {{ sitename }}
        </h3>
      </div>
      <div class="flex items-center gap-2">
        <DataTooltip v-for="button in actionButtons" :key="button.action" :content="button.title" placement="left" content-class="whitespace-nowrap text-[11px] px-2">
          <Button variant="ghost" size="icon-sm" @click="handleButtonClick(button.action)">
            <Icon :icon="button.icon" :width="18" :height="18" />
          </Button>
        </DataTooltip>
      </div>
    </div>
  </div>
</template>
