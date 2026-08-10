import assert from 'node:assert/strict'
import test from 'node:test'

import {
  ADMIN_ENTRY_URL,
  getCanonicalAdminUrl,
  isAdminHashRoute,
  isAdminDocumentPath,
} from '../src/frontend/utils/adminRoute.js'

test('recognizes only admin document paths', () => {
  assert.equal(isAdminDocumentPath('/admin'), true)
  assert.equal(isAdminDocumentPath('/admin/'), true)
  assert.equal(isAdminDocumentPath('/admin/settings'), true)
  assert.equal(isAdminDocumentPath('/administrator'), false)
  assert.equal(isAdminDocumentPath('/'), false)
})

test('recognizes admin hash routes used by static deployments', () => {
  assert.equal(isAdminHashRoute(''), false)
  assert.equal(isAdminHashRoute('#/'), false)
  assert.equal(isAdminHashRoute('#admin'), true)
  assert.equal(isAdminHashRoute('#admin?tab=settings'), true)
  assert.equal(isAdminHashRoute('#/admin'), true)
  assert.equal(isAdminHashRoute('#/admin?tab=settings'), true)
})

test('builds one canonical admin entry URL', () => {
  assert.equal(ADMIN_ENTRY_URL, '/admin')
  assert.equal(getCanonicalAdminUrl(), '/admin')
  assert.equal(getCanonicalAdminUrl({ hash: '#/' }), '/admin')
  assert.equal(
    getCanonicalAdminUrl({ search: '?site=1', hash: '#admin?tab=settings' }),
    '/admin?site=1&tab=settings'
  )
  assert.equal(
    getCanonicalAdminUrl({ hash: '#/admin?apiIndex=2' }),
    '/admin?apiIndex=2'
  )
})
