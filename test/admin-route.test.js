import assert from 'node:assert/strict'
import test from 'node:test'

import {
  ADMIN_ENTRY_URL,
  getCanonicalAdminUrl,
  isAdminDocumentPath,
  normalizeAdminHash
} from '../src/frontend/utils/adminRoute.js'

test('recognizes only admin document paths', () => {
  assert.equal(isAdminDocumentPath('/admin'), true)
  assert.equal(isAdminDocumentPath('/admin/'), true)
  assert.equal(isAdminDocumentPath('/admin/settings'), true)
  assert.equal(isAdminDocumentPath('/administrator'), false)
  assert.equal(isAdminDocumentPath('/'), false)
})

test('normalizes legacy and incomplete admin hashes', () => {
  assert.equal(normalizeAdminHash(''), '#/admin')
  assert.equal(normalizeAdminHash('#/'), '#/admin')
  assert.equal(normalizeAdminHash('#admin'), '#/admin')
  assert.equal(normalizeAdminHash('#admin?tab=settings'), '#/admin?tab=settings')
  assert.equal(normalizeAdminHash('#/admin?tab=settings'), '#/admin?tab=settings')
})

test('builds one canonical admin entry URL', () => {
  assert.equal(ADMIN_ENTRY_URL, '/admin#/admin')
  assert.equal(getCanonicalAdminUrl(), '/admin#/admin')
  assert.equal(getCanonicalAdminUrl({ hash: '#/' }), '/admin#/admin')
  assert.equal(
    getCanonicalAdminUrl({ search: '?site=1', hash: '#admin?tab=settings' }),
    '/admin?site=1#/admin?tab=settings'
  )
})
