import { defineStore } from 'pinia'
import { api } from '@/api'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('session_token') || '',
    userInfo: null,
    role: '',
    checked: false,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
  },

  actions: {
    async login(password) {
      const res = await api.login(password)
      if (res.success) {
        this.token = res.data.token
        this.role = res.data.role
        localStorage.setItem('session_token', res.data.token)
        return true
      }
      return false
    },

    async oauth2Login() {
      const res = await api.getOAuth2Url()
      if (res.success) {
        window.location.href = res.data.url
      }
    },

    async handleOAuth2Callback(code, state) {
      const res = await api.oauth2Callback(code, state)
      if (res.success) {
        this.token = res.data.token
        this.userInfo = res.data.user_info
        localStorage.setItem('session_token', res.data.token)
        return true
      }
      return false
    },

    async checkAuth() {
      this.checked = true
      if (!this.token) return false
      const res = await api.checkAuth()
      if (res.success && res.data.authenticated) {
        this.role = res.data.role
        this.userInfo = res.data.user_info
        return true
      }
      this.logout()
      return false
    },

    logout() {
      api.logout()
      this.token = ''
      this.userInfo = null
      this.role = ''
      localStorage.removeItem('session_token')
    },
  },
})

export const useBotStore = defineStore('bots', {
  state: () => ({
    bots: [],
    loading: false,
  }),

  actions: {
    async fetchBots() {
      this.loading = true
      try {
        const res = await api.getBots()
        if (res.success) {
          this.bots = res.data.bots
        }
      } finally {
        this.loading = false
      }
    },

    async createBot(data) {
      const res = await api.createBot(data)
      if (res.success) {
        await this.fetchBots()
      }
      return res
    },

    async deleteBot(name) {
      const res = await api.deleteBot(name)
      if (res.success) {
        await this.fetchBots()
      }
      return res
    },

    async restartBot(name) {
      return await api.restartBot(name)
    },
  },
})

export const usePluginStore = defineStore('plugins', {
  state: () => ({
    plugins: [],
    loading: false,
  }),

  actions: {
    async fetchPlugins() {
      this.loading = true
      try {
        const res = await api.getPlugins()
        if (res.success) {
          this.plugins = res.data.plugins
        }
      } finally {
        this.loading = false
      }
    },

    async reloadPlugin(name) {
      const res = await api.reloadPlugin(name)
      if (res.success) {
        await this.fetchPlugins()
      }
      return res
    },
  },
})

export const useStatsStore = defineStore('stats', {
  state: () => ({
    stats: null,
    loading: false,
  }),

  actions: {
    async fetchStats() {
      this.loading = true
      try {
        const res = await api.getStats()
        if (res.success) {
          this.stats = res.data
        }
      } finally {
        this.loading = false
      }
    },
  },
})