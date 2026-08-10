export const ADMIN_DOCUMENT_PATH = '/admin'
export const ADMIN_HASH_ROUTE = '#/admin'
export const ADMIN_ENTRY_URL = ADMIN_DOCUMENT_PATH

export const isAdminDocumentPath = (pathname = '') => {
  return pathname === ADMIN_DOCUMENT_PATH || pathname.startsWith(`${ADMIN_DOCUMENT_PATH}/`)
}

export const isAdminHashRoute = (hash = '') => {
  const value = String(hash || '')
  return value === ADMIN_HASH_ROUTE ||
    value.startsWith(`${ADMIN_HASH_ROUTE}?`) ||
    value === '#admin' ||
    value.startsWith('#admin?')
}

export const getCanonicalAdminUrl = (locationLike = {}) => {
  const params = new URLSearchParams(String(locationLike.search || ''))
  const hash = String(locationLike.hash || '')
  const hashQueryIndex = hash.indexOf('?')

  if (hashQueryIndex !== -1 && isAdminHashRoute(hash)) {
    const legacyParams = new URLSearchParams(hash.slice(hashQueryIndex + 1))
    for (const [key, value] of legacyParams) {
      if (!params.has(key)) params.append(key, value)
    }
  }

  const query = params.toString()
  return `${ADMIN_DOCUMENT_PATH}${query ? `?${query}` : ''}`
}
