export const ADMIN_DOCUMENT_PATH = '/admin'
export const ADMIN_HASH_ROUTE = '#/admin'
export const ADMIN_ENTRY_URL = `${ADMIN_DOCUMENT_PATH}${ADMIN_HASH_ROUTE}`

export const isAdminDocumentPath = (pathname = '') => {
  return pathname === ADMIN_DOCUMENT_PATH || pathname.startsWith(`${ADMIN_DOCUMENT_PATH}/`)
}

export const normalizeAdminHash = (hash = '') => {
  const value = String(hash || '')

  if (value === ADMIN_HASH_ROUTE || value.startsWith(`${ADMIN_HASH_ROUTE}?`)) {
    return value
  }

  if (value === '#admin' || value.startsWith('#admin?')) {
    return `${ADMIN_HASH_ROUTE}${value.slice('#admin'.length)}`
  }

  return ADMIN_HASH_ROUTE
}

export const getCanonicalAdminUrl = (locationLike = {}) => {
  const search = String(locationLike.search || '')
  return `${ADMIN_DOCUMENT_PATH}${search}${normalizeAdminHash(locationLike.hash)}`
}
