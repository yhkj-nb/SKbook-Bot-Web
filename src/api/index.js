import axios from 'axios'

const http = axios.create({
  baseURL: '/api',
  timeout: 30000,
})

// 请求拦截器 - 自动附加 Token
http.interceptors.request.use((config) => {
  const token = localStorage.getItem('session_token')
  if (token) {
    config.headers['X-Session-Token'] = token
  }
  return config
})

// 响应拦截器
http.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('session_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const api = {
  // 认证
  login: (password) => http.post('/auth/login', { password }).then(r => r),
  getOAuth2Url: () => http.get('/auth/oauth2/url').then(r => r),
  oauth2Callback: (code, state) =>
    http.get(`/auth/oauth2/callback?code=${code}&state=${state}`).then(r => r),
  logout: () => http.post('/auth/logout').then(r => r),
  checkAuth: () => http.get('/auth/check').then(r => r),

  // 机器人
  getBots: () => http.get('/bots').then(r => r),
  createBot: (data) => http.post('/bots', data).then(r => r),
  deleteBot: (name) => http.delete(`/bots/${name}`).then(r => r),
  restartBot: (name) => http.post(`/bots/${name}/restart`).then(r => r),

  // 社区/频道
  getCommunities: () => http.get('/communities').then(r => r),
  getChannels: (communityId, botName) =>
    http.get('/channels', { params: { community_id: communityId, bot_name: botName } }).then(r => r),

  // 消息
  getMessages: (params) => http.get('/messages', { params }).then(r => r),
  sendMessage: (data) => http.post('/messages/send', data).then(r => r),

  // 插件
  getPlugins: () => http.get('/plugins').then(r => r),
  reloadPlugin: (name) => http.post(`/plugins/${name}/reload`).then(r => r),

  // 配置
  getConfig: () => http.get('/config').then(r => r),
  updateConfig: (data) => http.post('/config', data).then(r => r),

  // 统计数据
  getStats: () => http.get('/stats').then(r => r),
}