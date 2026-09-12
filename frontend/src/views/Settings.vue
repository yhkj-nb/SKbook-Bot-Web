<script setup>
import { ref, onMounted } from 'vue'
import { api } from '@/api'
import SvgIcon from '@/components/SvgIcon.vue'
import WinTextBox from '@/components/WinTextBox.vue'

const config = ref(null)
const loading = ref(true)
const saving = ref(false)
const saveMsg = ref('')
const activeTab = ref('web')

// 表单绑定
const form = ref({
  server: { host: '0.0.0.0', port: 5200 },
  web: { enabled: true, session_expire: 86400 },
  oauth2: { client_id: '', redirect_uri: '' },
  logging: { level: 'INFO', file: '', max_size: 5242880, backup_count: 3 },
  database: { path: './data/skbookbot.db' },
  services: { config_watcher: true, media_cleanup: false, message_cleanup_days: 30 },
  bots: [],
})

// 密码修改
const oldPw = ref('')
const newPw = ref('')
const pwSaving = ref(false)
const pwMsg = ref('')

async function fetchConfig() {
  loading.value = true
  try {
    const res = await api.getConfig()
    if (res.success) {
      config.value = res.data
      form.value = JSON.parse(JSON.stringify(res.data))
    }
  } finally { loading.value = false }
}

async function handleSave() {
  saving.value = true; saveMsg.value = ''
  try {
    const res = await api.updateConfig({
      ...form.value,
      'web.enabled': form.value.web.enabled,
      'web.session_expire': form.value.web.session_expire,
      'server.host': form.value.server.host,
      'server.port': form.value.server.port,
      'logging.level': form.value.logging.level,
      'logging.file': form.value.logging.file,
      'logging.max_size': form.value.logging.max_size,
      'logging.backup_count': form.value.logging.backup_count,
      'database.path': form.value.database.path,
      'oauth2.client_id': form.value.oauth2.client_id,
      'oauth2.redirect_uri': form.value.oauth2.redirect_uri,
      'services.config_watcher': form.value.services.config_watcher,
      'services.media_cleanup': form.value.services.media_cleanup,
      'services.message_cleanup_days': form.value.services.message_cleanup_days,
      bots: form.value.bots,
    })
    if (res.success) { saveMsg.value = res.message || '保存成功' }
    else { saveMsg.value = res.message || '保存失败' }
  } catch (e) { saveMsg.value = '保存失败: ' + e.message }
  finally { saving.value = false; setTimeout(() => saveMsg.value = '', 3000) }
}

async function handleChangePassword() {
  if (!oldPw.value || !newPw.value) { pwMsg.value = '请填写旧密码和新密码'; return }
  if (newPw.value.length < 6) { pwMsg.value = '新密码至少 6 位'; return }
  pwSaving.value = true; pwMsg.value = ''
  try {
    const res = await api.updatePassword({ old_password: oldPw.value, new_password: newPw.value })
    if (res.success) { pwMsg.value = '密码已更新'; oldPw.value = ''; newPw.value = '' }
    else { pwMsg.value = res.message || '修改失败' }
  } catch (e) { pwMsg.value = e.response?.data?.message || e.message }
  finally { pwSaving.value = false; setTimeout(() => pwMsg.value = '', 3000) }
}

const tabs = [
  { key: 'web', label: 'Web 服务' },
  { key: 'server', label: '网络' },
  { key: 'logging', label: '日志' },
  { key: 'oauth2', label: 'OAuth2' },
  { key: 'database', label: '数据库' },
  { key: 'services', label: '服务' },
  { key: 'bots', label: '机器人' },
]

onMounted(fetchConfig)
</script>

<template>
  <div>
    <h1 class="win-page-title">系统设置</h1>
    <p class="win-page-subtitle">管理面板与框架配置</p>

    <div v-if="loading" class="win-loading"><div class="win-ring"></div></div>

    <template v-else>
      <!-- Tabs -->
      <div class="tabs">
        <button v-for="t in tabs" :key="t.key" class="tab-btn" :class="{ active: activeTab === t.key }"
          @click="activeTab = t.key">{{ t.label }}</button>
      </div>

      <div class="win-card win-card-pad" style="margin-top:12px">
        <!-- Web 服务 -->
        <div v-if="activeTab === 'web'">
          <h2 class="win-section-title">Web 服务</h2>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;max-width:500px">
            <WinTextBox v-model:Text="form.web.session_expire" Header="Session 过期时间（秒）" PlaceholderText="86400" />
          </div>
        </div>

        <!-- 网络 -->
        <div v-if="activeTab === 'server'">
          <h2 class="win-section-title">网络</h2>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;max-width:500px">
            <WinTextBox v-model:Text="form.server.host" Header="监听地址" />
            <WinTextBox v-model:Text="form.server.port" Header="端口" />
          </div>
        </div>

        <!-- 日志 -->
        <div v-if="activeTab === 'logging'">
          <h2 class="win-section-title">日志</h2>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;max-width:500px">
            <WinTextBox v-model:Text="form.logging.level" Header="日志级别" PlaceholderText="INFO" />
            <WinTextBox v-model:Text="form.logging.file" Header="日志文件路径" />
            <WinTextBox v-model:Text="form.logging.max_size" Header="单个日志最大字节" />
            <WinTextBox v-model:Text="form.logging.backup_count" Header="保留文件数" />
          </div>
        </div>

        <!-- OAuth2 -->
        <div v-if="activeTab === 'oauth2'">
          <h2 class="win-section-title">OAuth2 配置</h2>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;max-width:500px">
            <WinTextBox v-model:Text="form.oauth2.client_id" Header="Client ID" />
            <WinTextBox v-model:Text="form.oauth2.redirect_uri" Header="回调地址" />
          </div>
        </div>

        <!-- 数据库 -->
        <div v-if="activeTab === 'database'">
          <h2 class="win-section-title">数据库</h2>
          <div style="max-width:500px">
            <WinTextBox v-model:Text="form.database.path" Header="数据库路径" />
          </div>
        </div>

        <!-- 服务 -->
        <div v-if="activeTab === 'services'">
          <h2 class="win-section-title">系统服务</h2>
          <div style="max-width:500px">
            <label style="display:flex;align-items:center;gap:8px;margin-bottom:8px;cursor:pointer;font-size:13px">
              <input type="checkbox" v-model="form.services.config_watcher" />
              配置文件监视器
            </label>
            <label style="display:flex;align-items:center;gap:8px;margin-bottom:8px;cursor:pointer;font-size:13px">
              <input type="checkbox" v-model="form.services.media_cleanup" />
              媒体文件自动清理
            </label>
            <WinTextBox v-model:Text="form.services.message_cleanup_days" Header="消息自动清理天数" PlaceholderText="30" />
          </div>
        </div>

        <!-- 机器人配置 -->
        <div v-if="activeTab === 'bots'">
          <h2 class="win-section-title">机器人配置</h2>
          <div v-if="form.bots && form.bots.length" style="max-width:500px">
            <div v-for="(bot, idx) in form.bots" :key="idx" style="padding:12px 0;border-bottom:1px solid var(--border)">
              <div style="font-weight:600;font-size:14px;margin-bottom:8px">{{ bot.name }}</div>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
                <WinTextBox v-model:Text="bot.token_masked" Header="Token" IsReadOnly />
                <WinTextBox v-model:Text="bot.poll_interval" Header="轮询间隔（秒）" />
                <WinTextBox v-model:Text="bot.command_prefix" Header="命令前缀" />
              </div>
            </div>
          </div>
          <div v-else class="win-empty"><p>暂无机器人配置</p></div>
        </div>

        <p v-if="saveMsg" style="margin-top:12px;font-size:13px;color:var(--success)">{{ saveMsg }}</p>
        <button class="win-btn win-btn-primary" style="margin-top:16px" :disabled="saving" @click="handleSave">
          {{ saving ? '保存中...' : '保存配置' }}
        </button>
      </div>

      <!-- 修改密码 -->
      <div class="win-card win-card-pad" style="margin-top:16px">
        <h2 class="win-section-title">修改管理员密码</h2>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;max-width:500px">
          <WinTextBox v-model:Text="oldPw" Header="当前密码" IsPassword />
          <WinTextBox v-model:Text="newPw" Header="新密码" IsPassword />
        </div>
        <p v-if="pwMsg" style="margin-top:8px;font-size:13px;color:var(--success)">{{ pwMsg }}</p>
        <button class="win-btn win-btn-primary" style="margin-top:12px" :disabled="pwSaving" @click="handleChangePassword">
          {{ pwSaving ? '修改中...' : '修改密码' }}
        </button>
      </div>
    </template>
  </div>
</template>

<style scoped>
.tabs { display:flex; gap:4px; flex-wrap:wrap; }
.tab-btn {
  padding:6px 14px; font-size:13px; font-family:inherit; border:1px solid var(--border);
  border-radius:var(--radius-control); background:var(--bg-panel); color:var(--text-secondary);
  cursor:pointer; transition:all .1s; white-space:nowrap;
}
.tab-btn:hover { background:var(--bg-hover); }
.tab-btn.active { background:var(--accent); color:#fff; border-color:var(--accent); }
</style>