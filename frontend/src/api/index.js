import axios from 'axios'

const http = axios.create({
  baseURL: '/api',
  timeout: 30000,
})

http.interceptors.request.use((config) => {
  const token = localStorage.getItem('session_token')
  if (token) config.headers['X-Session-Token'] = token
  return config
})

http.interceptors.response.use(
  (r) => r.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('session_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const api = {
  login: (p) => http.post('/auth/login', { password: p }),
  checkAuth: () => http.get('/auth/check'),
  logout: () => http.post('/auth/logout'),

  getBots: () => http.get('/bots'),
  createBot: (d) => http.post('/bots', d),
  deleteBot: (n) => http.delete(`/bots/${n}`),
  restartBot: (n) => http.post(`/bots/${n}/restart`),

  getChannels: (cid, bn) => http.get('/channels', { params: { community_id: cid, bot_name: bn } }),

  getMessages: (p) => http.get('/messages', { params: p }),
  sendMessage: (d) => http.post('/messages/send', d),

  getPlugins: () => http.get('/plugins'),
  reloadPlugin: (n) => http.post(`/plugins/${n}/reload`),

  updatePassword: (data) => http.post('/auth/password', data).then(r => r),

  getConfig: () => http.get('/config'),
  updateConfig: (d) => http.post('/config', d),

  getLogs: (lines = 100) => http.get('/logs', { params: { lines } }),

  getStats: () => http.get('/stats'),

  checkUpdate: () => http.get('/update/check'),
  getVersion: () => http.get('/update/version'),
}