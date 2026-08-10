import { createRouter, createWebHashHistory } from 'vue-router'
import { isAdminDocumentPath } from '../utils/adminRoute'

const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: () => import('../views/Dashboard.vue')
  },
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('../views/admin/index.vue')
  },
  {
    path: '/server/:id',
    name: 'Server',
    component: () => import('../views/ServerDetail.vue')
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

// `/admin#/` used to resolve to the public dashboard. Keep the document path
// authoritative so bookmarked admin URLs always land on the admin route.
router.beforeEach((to) => {
  if (
    to.path === '/' &&
    typeof window !== 'undefined' &&
    isAdminDocumentPath(window.location.pathname)
  ) {
    return { name: 'Admin', replace: true }
  }
})

export default router
