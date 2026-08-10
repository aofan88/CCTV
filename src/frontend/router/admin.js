import { createMemoryHistory, createRouter } from 'vue-router'

const routes = [
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('../views/admin/index.vue')
  }
]

export const createAdminRouter = async (search = '') => {
  const router = createRouter({
    history: createMemoryHistory(),
    routes
  })
  const query = Object.fromEntries(new URLSearchParams(search))

  await router.push({ path: '/admin', query })
  await router.isReady()
  return router
}
