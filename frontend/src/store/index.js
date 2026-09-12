import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api } from '@/api'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('session_token') || '')
  const userInfo = ref(null)
  const role = ref('')
  const checked = ref(false)

  const isAuthenticated = computed(() => !!token.value)

  async function login(password) {
    const res = await api.login(password)
    if (res.success) {
      token.value = res.data.token
      role.value = res.data.role
      localStorage.setItem('session_token', res.data.token)
      return true
    }
    return false
  }

  async function checkAuth() {
    checked.value = true
    if (!token.value) return false
    try {
      const res = await api.checkAuth()
      if (res.success && res.data.authenticated) {
        role.value = res.data.role
        userInfo.value = res.data.user_info
        return true
      }
    } catch {}
    logout()
    return false
  }

  function logout() {
    token.value = ''
    userInfo.value = null
    role.value = ''
    localStorage.removeItem('session_token')
  }

  return { token, userInfo, role, checked, isAuthenticated, login, checkAuth, logout }
})

export const useBotStore = defineStore('bots', () => {
  const bots = ref([])
  const loading = ref(false)

  async function fetchBots() {
    loading.value = true
    try {
      const res = await api.getBots()
      if (res.success) bots.value = res.data.bots
    } finally { loading.value = false }
  }

  async function createBot(data) {
    const res = await api.createBot(data)
    if (res.success) await fetchBots()
    return res
  }

  async function deleteBot(name) {
    const res = await api.deleteBot(name)
    if (res.success) await fetchBots()
    return res
  }

  async function restartBot(name) {
    return await api.restartBot(name)
  }

  return { bots, loading, fetchBots, createBot, deleteBot, restartBot }
})

export const usePluginStore = defineStore('plugins', () => {
  const plugins = ref([])
  const loading = ref(false)

  async function fetchPlugins() {
    loading.value = true
    try {
      const res = await api.getPlugins()
      if (res.success) plugins.value = res.data.plugins
    } finally { loading.value = false }
  }

  async function reloadPlugin(name) {
    const res = await api.reloadPlugin(name)
    if (res.success) await fetchPlugins()
    return res
  }

  return { plugins, loading, fetchPlugins, reloadPlugin }
})

export const useStatsStore = defineStore('stats', () => {
  const stats = ref(null)
  const loading = ref(false)

  async function fetchStats() {
    loading.value = true
    try {
      const res = await api.getStats()
      if (res.success) stats.value = res.data
    } finally { loading.value = false }
  }

  return { stats, loading, fetchStats }
})

export const useUpdateStore = defineStore('update', () => {
  const checking = ref(false)
  const updateInfo = ref(null)
  const currentVersion = ref('v1.0.0')

  async function checkUpdate() {
    checking.value = true
    try {
      const res = await api.checkUpdate()
      if (res.success) updateInfo.value = res.data
    } catch { updateInfo.value = null }
    finally { checking.value = false }
  }

  return { checking, updateInfo, currentVersion, checkUpdate }
})