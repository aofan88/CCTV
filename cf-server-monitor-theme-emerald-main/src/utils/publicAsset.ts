const LEADING_SLASHES_REGEX = /^\/+/

export function publicAsset(path: string): string {
  const cleanPath = path.replace(LEADING_SLASHES_REGEX, '')
  const basePath = import.meta.env.BASE_URL + cleanPath

  if (typeof window === 'undefined')
    return basePath

  const themeUrl = new URLSearchParams(window.location.search).get('theme_url')
  if (!themeUrl)
    return basePath

  return basePath + (basePath.includes('?') ? '&' : '?') + 'theme_url=' + encodeURIComponent(themeUrl)
}
