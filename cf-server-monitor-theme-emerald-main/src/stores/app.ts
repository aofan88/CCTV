import type { EarthViewMode, NodeViewMode, PublicSettings } from '@/utils/api'
import type { ByteDecimalsConfig } from '@/utils/helper'
import { usePreferredDark, useStorageAsync } from '@vueuse/core'
import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'

export type ThemeMode = 'auto' | 'light' | 'dark'
type Lang = 'zh-CN' | 'en-US'

/** 固定的字節精度配置 */
const BYTE_DECIMALS: ByteDecimalsConfig = {
  B: 0,
  KB: 0,
  MB: 1,
  GB: 1,
  TB: 2,
}

function isValidThemeMode(value: unknown): value is ThemeMode {
  return value === 'auto' || value === 'light' || value === 'dark'
}

const useAppStore = defineStore('app', () => {
  const loading = ref<boolean>(true)

  // 使用 VueUse 的 useStorageAsync 實現自動持久化
  const themeMode = useStorageAsync<ThemeMode>('themeMode', 'auto', localStorage)
  const lang = ref<Lang>('zh-CN')
  const publicSettings = ref<PublicSettings>()
  const nodeSelectedGroup = useStorageAsync<string>('nodeSelectedGroup', 'all', localStorage)
  const isLoggedIn = ref<boolean>(false)
  const connectionError = ref<boolean>(false)

  // 首頁滾動位置記憶
  const homeScrollPosition = ref<number>(0)

  // 使用 null 表示未設定，等待主題配置載入後決定
  const storedViewMode = useStorageAsync<NodeViewMode | null>('nodeViewMode', null, localStorage)

  // 計算屬性：從主題配置取得預設視圖模式
  const defaultViewMode = computed<NodeViewMode>(() => {
    return publicSettings.value?.themeSettings.defaultViewMode ?? 'card'
  })

  // 校驗視圖模式是否為合法值
  function isValidViewMode(value: string | null): value is NodeViewMode {
    return value === 'card' || value === 'list'
  }

  // 目前實際使用的視圖模式
  const nodeViewMode = computed<NodeViewMode>({
    get: () => {
      // 校驗 storedViewMode 是否為合法值，非法值時使用預設值
      if (storedViewMode.value !== null && isValidViewMode(storedViewMode.value)) {
        return storedViewMode.value
      }
      return defaultViewMode.value
    },
    set: (val) => {
      storedViewMode.value = val
    },
  })

  // 字節格式化精度（固定配置）
  const byteDecimals: ByteDecimalsConfig = { ...BYTE_DECIMALS }

  // 計算屬性：公告配置
  const alertEnabled = computed<boolean>(() => {
    return publicSettings.value?.themeSettings.alertEnabled ?? false
  })

  const alertTitle = computed<string>(() => {
    return publicSettings.value?.themeSettings.alertTitle ?? ''
  })

  const alertContent = computed<string>(() => {
    return publicSettings.value?.themeSettings.alertContent ?? ''
  })

  const visitorCountryCode = ref<string | null>(null)

  const earthViewMode = computed<EarthViewMode>(() => {
    return publicSettings.value?.themeSettings.earthViewMode ?? 'earth'
  })

  const visitorInfoCardEnabled = computed<boolean>(() => {
    return publicSettings.value?.themeSettings.visitorInfoCardEnabled ?? true
  })

  const hideAdminEntryWhenLoggedOut = computed<boolean>(() => {
    return publicSettings.value?.themeSettings.hideAdminEntryWhenLoggedOut ?? false
  })

  const disablePageAnimation = computed<boolean>(() => {
    return publicSettings.value?.themeSettings.disablePageAnimation ?? false
  })

  // 計算屬性：ICP 備案配置
  const icpEnabled = computed<boolean>(() => {
    return publicSettings.value?.themeSettings.icpEnabled ?? false
  })

  const icpNumber = computed<string>(() => {
    return publicSettings.value?.themeSettings.icpNumber ?? ''
  })

  const icpUrl = computed<string>(() => {
    return publicSettings.value?.themeSettings.icpUrl || 'https://beian.miit.gov.cn/'
  })

  // 計算屬性：公安備案配置
  const policeEnabled = computed<boolean>(() => {
    return publicSettings.value?.themeSettings.policeEnabled ?? false
  })

  const policeNumber = computed<string>(() => {
    return publicSettings.value?.themeSettings.policeNumber ?? ''
  })

  const policeUrl = computed<string>(() => {
    return publicSettings.value?.themeSettings.policeUrl ?? ''
  })

  // 計算屬性：自定義背景配置
  const backgroundEnabled = computed<boolean>(() => {
    return publicSettings.value?.themeSettings.backgroundEnabled ?? false
  })

  const backgroundType = computed<'image' | 'video'>(() => {
    return publicSettings.value?.themeSettings.backgroundType ?? 'image'
  })

  const lightBackgroundUrl = computed<string>(() => {
    return publicSettings.value?.themeSettings.lightBackgroundUrl ?? ''
  })

  const darkBackgroundUrl = computed<string>(() => {
    return publicSettings.value?.themeSettings.darkBackgroundUrl ?? ''
  })

  const backgroundBlur = computed<number>(() => {
    return publicSettings.value?.themeSettings.backgroundBlur ?? 0
  })

  const backgroundOverlay = computed<number>(() => {
    return publicSettings.value?.themeSettings.backgroundOverlay ?? 0
  })

  // 當 publicSettings 載入後，如果 localStorage 沒有保存過視圖模式或值為非法值，使用預設值
  watch(publicSettings, (settings) => {
    if (settings && !isValidViewMode(storedViewMode.value)) {
      // 觸發 computed setter，會自動保存到 localStorage
      storedViewMode.value = defaultViewMode.value
    }
  }, { immediate: true })

  // 使用 VueUse 的 usePreferredDark 檢測系統主題偏好
  const prefersDark = usePreferredDark()

  watch(themeMode, (mode) => {
    if (!isValidThemeMode(mode)) {
      themeMode.value = 'auto'
    }
  }, { immediate: true })

  // 計算目前是否為暗色模式
  const isDark = computed(() => {
    if (themeMode.value === 'auto') {
      return prefersDark.value
    }
    return themeMode.value === 'dark'
  })

  const resolvedThemeMode = computed<'light' | 'dark'>(() => isDark.value ? 'dark' : 'light')

  // 計算屬性：目前主題模式下的背景 URL
  const currentBackgroundUrl = computed<string>(() => {
    if (!backgroundEnabled.value) {
      return ''
    }

    if (resolvedThemeMode.value === 'dark') {
      return darkBackgroundUrl.value
    }
    return lightBackgroundUrl.value
  })

  function updateThemeMode(mode?: ThemeMode) {
    if (mode) {
      themeMode.value = isValidThemeMode(mode) ? mode : 'auto'
      return
    }

    const nextMode: Record<ThemeMode, ThemeMode> = {
      auto: 'light',
      light: 'dark',
      dark: 'auto',
    }

    const currentMode = isValidThemeMode(themeMode.value) ? themeMode.value : 'auto'
    themeMode.value = nextMode[currentMode]
  }

  function updateLoginState(loggedIn: boolean) {
    isLoggedIn.value = loggedIn
  }

  return {
    loading,
    themeMode,
    isDark,
    resolvedThemeMode,
    lang,
    nodeSelectedGroup,
    nodeViewMode,
    defaultViewMode,
    byteDecimals,
    alertEnabled,
    alertTitle,
    alertContent,
    earthViewMode,
    visitorInfoCardEnabled,
    visitorCountryCode,
    hideAdminEntryWhenLoggedOut,
    disablePageAnimation,
    icpEnabled,
    icpNumber,
    icpUrl,
    policeEnabled,
    policeNumber,
    policeUrl,
    backgroundEnabled,
    backgroundType,
    lightBackgroundUrl,
    darkBackgroundUrl,
    currentBackgroundUrl,
    backgroundBlur,
    backgroundOverlay,
    isLoggedIn,
    publicSettings,
    connectionError,
    homeScrollPosition,
    updateThemeMode,
    updateLoginState,
  }
})

export { useAppStore }
