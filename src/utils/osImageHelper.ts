/**
 * OS Image Helper - 根據字串匹配返回操作系統圖像路徑
 */

import { getApiAssetUrl } from '@/utils/api'

// 操作系統匹配配置
interface OSConfig {
  name: string
  image: string
  keywords: string[]
}

const OS_NAME_SPLIT_REGEX = /[\s/]+/

// 操作系統匹配組
const osConfigs: OSConfig[] = [
  {
    name: 'AlmaLinux',
    image: 'os-icons/os-alma.svg',
    keywords: ['alma', 'almalinux'],
  },
  {
    name: 'Alpine Linux',
    image: 'os-icons/os-alpine.webp',
    keywords: ['alpine', 'alpine linux'],
  },
  {
    name: 'Armbian',
    image: 'os-icons/os-armbian.png',
    keywords: ['armbox', 'armbian'],
  },
  {
    name: 'CentOS',
    image: 'os-icons/os-centos.svg',
    keywords: ['centos', 'cent os'],
  },
  {
    name: 'Debian',
    image: 'os-icons/os-debian.svg',
    keywords: ['debian', 'debian gnu/linux', 'deb'],
  },
  {
    name: 'Ubuntu',
    image: 'os-icons/os-ubuntu.svg',
    keywords: ['ubuntu', 'elementary'],
  },
  {
    name: 'Windows',
    image: 'os-icons/os-windows.svg',
    keywords: ['windows', 'win32', 'win64', 'win10', 'win11', 'win server', 'microsoft'],
  },
  {
    name: 'Arch Linux',
    image: 'os-icons/os-arch.svg',
    keywords: ['arch', 'archlinux', 'arch linux'],
  },
  {
    name: 'Kali Linux',
    image: 'os-icons/os-kail.svg',
    keywords: ['kail', 'kali', 'kali linux'],
  },
  {
    name: 'iStoreOS',
    image: 'os-icons/os-istore.png',
    keywords: ['istore', 'istoreos', 'istore os'],
  },
  {
    name: 'OpenWrt',
    image: 'os-icons/os-openwrt.svg',
    keywords: ['openwrt', 'open wrt', 'open-wrt', 'qwrt', 'kwrt'],
  },
  {
    name: 'ImmortalWrt',
    image: 'os-icons/os-openwrt.svg',
    keywords: ['immortalwrt', 'immortal', 'emmortal'],
  },
  {
    name: 'NixOS',
    image: 'os-icons/os-nix.svg',
    keywords: ['nixos', 'nix os', 'nix'],
  },
  {
    name: 'Rocky Linux',
    image: 'os-icons/os-rocky.svg',
    keywords: ['rocky', 'rocky linux'],
  },
  {
    name: 'Fedora',
    image: 'os-icons/os-fedora.svg',
    keywords: ['fedora'],
  },
  {
    name: 'openSUSE',
    image: 'os-icons/os-openSUSE.svg',
    keywords: ['opensuse', 'suse'],
  },
  {
    name: 'Gentoo',
    image: 'os-icons/os-gentoo.svg',
    keywords: ['gentoo'],
  },
  {
    name: 'Red Hat',
    image: 'os-icons/os-redhat.svg',
    keywords: ['redhat', 'rhel', 'red hat'],
  },
  {
    name: 'Linux Mint',
    image: 'os-icons/os-mint.svg',
    keywords: ['mint', 'linux mint'],
  },
  {
    name: 'Manjaro',
    image: 'os-icons/os-manjaro-.svg',
    keywords: ['manjaro'],
  },
  {
    name: 'Synology DSM',
    image: 'os-icons/os-synology.ico',
    keywords: ['synology', 'dsm', 'synology dsm'],
  },
  {
    name: 'Proxmox VE',
    image: 'os-icons/os-proxmox.ico',
    keywords: ['proxmox', 'proxmox ve', 'pve'],
  },
  {
    name: 'macOS',
    image: 'os-icons/os-macos.svg',
    keywords: ['macos', 'mac os', 'darwin', 'os x'],
  },
  {
    name: 'Alibaba Cloud Linux',
    image: 'os-icons/os-alibaba.svg',
    keywords: ['alibaba', 'aliyun', 'alinux', 'anolis', 'openanolis', '阿里', '龍蜥'],
  },
  {
    name: 'OpenCloudOS',
    image: 'os-icons/os-opencloud.svg',
    keywords: ['opencloud', 'opencloudos', 'opencloud os'],
  },
]

// 預設配置
const defaultOSConfig: OSConfig = {
  name: 'Unknown',
  image: 'os-icons/os-unknown.svg',
  keywords: ['unknown'],
}

/**
 * 根據輸入字串查找匹配的操作系統配置
 * @param osString - 操作系統相關的字串
 * @returns 匹配的操作系統配置，如果沒有匹配則返回預設配置
 */
function findOSConfig(osString: string): OSConfig {
  if (!osString) {
    return defaultOSConfig
  }

  const normalizedInput = osString.toLowerCase().trim()

  // 遍歷匹配配置
  for (const config of osConfigs) {
    for (const keyword of config.keywords) {
      if (normalizedInput.includes(keyword)) {
        return config
      }
    }
  }

  // 如果沒有匹配到，返回預設配置
  return defaultOSConfig
}

/**
 * 根據輸入字串匹配返回操作系統圖像路徑
 * @param osString - 操作系統相關的字串
 * @returns 匹配的操作系統圖像路徑，如果沒有匹配則返回預設圖像
 */
export function getOSImage(osString: string, apiIndex = 0): string {
  return getApiAssetUrl(findOSConfig(osString).image, apiIndex)
}

/**
 * 取得所有可用的操作系統圖像
 * @returns 所有操作系統圖像的映射表
 */
export function getAllOSImages(apiIndex = 0): Record<string, string> {
  const imageMap: Record<string, string> = {}

  osConfigs.forEach((config) => {
    const key = config.keywords[0] // 使用第一個關鍵詞作為鍵
    if (key)
      imageMap[key] = getApiAssetUrl(config.image, apiIndex)
  })

  imageMap.unknown = getApiAssetUrl(defaultOSConfig.image, apiIndex)

  return imageMap
}

/**
 * 根據輸入字串匹配返回操作系統名稱
 * @param osString - 操作系統相關的字串
 * @returns 匹配的操作系統名稱
 */
export function getOSName(osString: string): string {
  const config = findOSConfig(osString)

  // 如果匹配到具體的操作系統，返回其名稱
  if (config !== defaultOSConfig) {
    return config.name
  }

  // 如果沒有匹配到，從輸入字串中提取名稱
  if (!osString) {
    return 'Unknown'
  }

  // 使用空格或斜槓分割，取第一個部分
  const parts = osString.trim().split(OS_NAME_SPLIT_REGEX)
  return parts[0] || 'Unknown'
}

/**
 * 檢查是否為支援的操作系統
 * @param osString - 操作系統相關的字串
 * @returns 是否為支援的操作系統
 */
export function isSupportedOS(osString: string): boolean {
  if (!osString)
    return false

  const config = findOSConfig(osString)
  return config !== defaultOSConfig
}
