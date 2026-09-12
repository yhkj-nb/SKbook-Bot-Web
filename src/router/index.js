import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/store'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/',
    component: () => import('@/views/Layout.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: '', name: 'Dashboard', component: () => import('@/views/Dashboard.vue') },
      { path: 'bots', name: 'Bots', component: () => import('@/views/Bots.vue') },
      { path: 'plugins', name: 'Plugins', component: () => import('@/views/Plugins.vue') },
      { path: 'messages', name: 'Messages', component: () => import('@/views/Messages.vue') },
      { path: 'logs', name: 'Logs', component: () => import('@/views/Logs.vue') },
      { path: 'settings', name: 'Settings', component: () => import('@/views/Settings.vue') },
      { path: 'update', name: 'Update', component: () => import('@/views/Update.vue') },
    ],
  },
]

const router = createRouter({ history: createWebHistory(), routes })

router.beforeEach(async (to, from, next) => {
  const auth = useAuthStore()
  if (to.meta.requiresAuth !== false && !auth.isAuthenticated) {
    if (!auth.checked) await auth.checkAuth()
    if (!auth.isAuthenticated) return next('/login')
  }
  if (to.path === '/login' && auth.isAuthenticated) return next('/')
  next()
})

export default router