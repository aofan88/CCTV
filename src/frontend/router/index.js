import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    alias: ['/admin', '/admin/', 'admin', '/#admin', '/#/admin', '#admin', '#/admin'],
    name: 'Admin',
    component: () => import('../views/admin/index.vue')
  },
  {
    path: '/admin',
    alias: ['/admin/', 'admin', '/#admin', '/#/admin', '#admin', '#/admin'],
    name: 'AdminPage',
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

export default router
