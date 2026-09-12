<template>
  <div>
    <div class="topbar">
      <h2>系统设置</h2>
    </div>

    <!-- 环境变量提示 -->
    <div class="info-bar">
      <span class="info-bar-icon">ℹ️</span>
      <span>环境变量(.env)仅在 <code>config/settings.yaml</code> 不存在时生效。配置已保存后请通过面板修改，重启后配置仍然保留。</span>
    </div>

    <div v-if="configLoading" class="loading">加载中...</div>

    <template v-else>
      <form @submit.prevent="handleSave">
        <!-- ===== 服务器配置 ===== -->
        <div class="card">
          <div class="card-title">服务器配置</div>
          <div class="form-group">
            <label class="form-label">监听地址</label>
            <input v-model="localConfig.server.host" class="form-input" placeholder="0.0.0.0" />
            <p class="form-hint">修改后需重启生效</p>
          </div>
          <div class="form-group">
            <label class="form-label">监听端口</label>
            <input v-model.number="localConfig.server.port" type="number" class="form-input" />
            <p class="form-hint">修改后需重启生效</p>
          </div>
          <div class="form-group">
            <label class="form-label">Web 密钥 (web_secret_key)</label>
            <input v-model="localConfig.server.web_secret_key" type="password" class="form-input" :placeholder="localConfig.server.has_web_secret_key ? '当前：已设置（留空不修改）' : '未设置（可选）'" />
            <p class="form-hint">用于 Session 加密，留空保留当前值</p>
          </div>
        </div>

        <!-- ===== 安全设置 ===== -->
        <div class="card">
          <div class="card-title">安全设置</div>
          <div class="form-group">
            <label class="form-label">管理员密码</label>
            <div style="display: flex; gap: 8px;">
              <input v-model="pwForm.oldPassword" type="password" class="form-input" placeholder="当前密码" style="flex:1" />
              <input v-model="pwForm.newPassword" type="password" class="form-input" placeholder="新密码（留空不修改）" style="flex:1" />
              <button type="button" class="btn btn-outline" @click="handleChangePassword" :disabled="pwSaving">
                {{ pwSaving ? '修改中...' : '修改密码' }}
              </button>
            </div>
            <p v-if="pwMsg" :style="{ color: pwSuccess ? '#22C55E' : '#EF4444', fontSize: '13px', marginTop: '4px' }">{{ pwMsg }}</p>
          </div>
          <div class="form-group">
            <label class="form-label">Session 过期时间（秒）</label>
            <input v-model.number="localConfig.web.session_expire" type="number" class="form-input" />
            <p class="form-hint">默认 86400（24 小时）</p>
          </div>
        </div>

        <!-- ===== OAuth2 配置 ===== -->
        <div class="card">
          <div class="card-title">OAuth2 配置</div>
          <div style="font-size: 13px; color: #64748B; line-height: 1.7; margin-bottom: 16px;">
            <p>OAuth2 用于绑定 SkBook 社区账号登录管理面板。填写回调地址为：<code>{{ callbackUrl }}</code></p>
          </div>
          <div class="form-group">
            <label class="form-label">CLIENT_ID</label>
            <input v-model="localConfig.oauth2.client_id" class="form-input" placeholder="留空禁用 OAuth2" />
          </div>
          <div class="form-group">
            <label class="form-label">CLIENT_SECRET</label>
            <input v-model="localConfig.oauth2.client_secret" type="password" class="form-input" :placeholder="localConfig.oauth2.has_client_secret ? '当前：已设置（留空不修改）' : '未设置'" />
            <p class="form-hint">留空保留当前值</p>
          </div>
          <div class="form-group">
            <label class="form-label">回调地址</label>
            <input v-model="localConfig.oauth2.redirect_uri" class="form-input" :placeholder="callbackUrl" />
          </div>
        </div>

        <!-- ===== 日志配置 ===== -->
        <div class="card">
          <div class="card-title">日志配置</div>
          <div class="form-row">
            <div class="form-group" style="flex:1">
              <label class="form-label">日志级别</label>
              <select v-model="localConfig.logging.level" class="form-input">
                <option value="DEBUG">DEBUG</option>
                <option value="INFO">INFO</option>
                <option value="WARNING">WARNING</option>
                <option value="ERROR">ERROR</option>
              </select>
            </div>
            <div class="form-group" style="flex:2">
              <label class="form-label">日志文件路径</label>
              <input v-model="localConfig.logging.file" class="form-input" placeholder="留空输出到控制台" />
              <p class="form-hint">修改后需重启生效</p>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group" style="flex:1">
              <label class="form-label">最大文件大小（字节）</label>
              <input v-model.number="localConfig.logging.max_size" type="number" class="form-input" />
              <p class="form-hint">修改后需重启生效，默认 5MB</p>
            </div>
            <div class="form-group" style="flex:1">
              <label class="form-label">备份文件数</label>
              <input v-model.number="localConfig.logging.backup_count" type="number" class="form-input" />
              <p class="form-hint">修改后需重启生效</p>
            </div>
          </div>
        </div>

        <!-- ===== 数据库与数据目录 ===== -->
        <div class="card">
          <div class="card-title">数据库与数据目录</div>
          <div class="form-row">
            <div class="form-group" style="flex:1">
              <label class="form-label">数据库路径</label>
              <input v-model="localConfig.database.path" class="form-input" />
              <p class="form-hint">修改后需重启生效</p>
            </div>
            <div class="form-group" style="flex:1">
              <label class="form-label">数据目录</label>
              <input v-model="localConfig.data_dir" class="form-input" />
              <p class="form-hint">修改后需重启生效</p>
            </div>
          </div>
        </div>

        <!-- ===== 服务设置 ===== -->
        <div class="card">
          <div class="card-title">服务设置</div>
          <div class="form-row">
            <div class="form-group" style="flex:1">
              <label class="form-label">配置热重载</label>
              <select v-model="localConfig.services.config_watcher" class="form-input">
                <option :value="true">开启</option>
                <option :value="false">关闭</option>
              </select>
            </div>
            <div class="form-group" style="flex:1">
              <label class="form-label">媒体自动清理</label>
              <select v-model="localConfig.services.media_cleanup" class="form-input">
                <option :value="true">开启</option>
                <option :value="false">关闭</option>
              </select>
            </div>
            <div class="form-group" style="flex:1">
              <label class="form-label">消息保留天数</label>
              <input v-model.number="localConfig.services.message_cleanup_days" type="number" class="form-input" />
            </div>
          </div>
        </div>

        <!-- ===== 机器人配置 ===== -->
        <div class="card">
          <div class="card-title">机器人配置</div>
          <p style="font-size: 13px; color: #64748B; margin-bottom: 16px;">编辑已有机器人配置。Token 显示脱敏值，如需修改请填入新 Token。</p>
          <div v-if="!localConfig.bots.length" class="empty-state">
            <p>暂无机器人，请先在「机器人管理」中添加</p>
          </div>
          <div v-for="(bot, idx) in localConfig.bots" :key="bot.name" class="bot-config-card">
            <div class="bot-config-header">
              <strong>{{ bot.name }}</strong>
              <select v-model="bot.enabled" class="form-input bot-enabled-select">
                <option :value="true">启用</option>
                <option :value="false">禁用</option>
              </select>
            </div>
            <div class="form-row">
              <div class="form-group" style="flex:2">
                <label class="form-label">Token</label>
                <input v-model="bot.token" type="password" class="form-input" :placeholder="bot.token_masked || '请输入 Token'" />
              </div>
              <div class="form-group" style="flex:1">
                <label class="form-label">命令前缀</label>
                <input v-model="bot.command_prefix" class="form-input" placeholder="/" />
              </div>
              <div class="form-group" style="flex:1">
                <label class="form-label">轮询间隔（秒）</label>
                <input v-model.number="bot.poll_interval" type="number" class="form-input" />
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">监听社区 ID（逗号分隔）</label>
              <input :value="(bot.communities || []).join(', ')" @input="e => bot.communities = e.target.value.split(',').map(s => s.trim()).filter(Boolean)" class="form-input" placeholder="留空监听所有社区" />
            </div>
          </div>
        </div>

        <!-- 保存按钮 & 消息 -->
        <p v-if="saveMsg" class="save-msg" :class="{ 'save-success': saveSuccess, 'save-error': !saveSuccess }">
          {{ saveMsg }}
        </p>
        <button type="submit" class="btn btn-primary" :disabled="saving" style="margin-bottom: 24px;">
          {{ saving ? '保存中...' : '保存全部设置' }}
        </button>
      </form>

      <!-- ===== 关于 ===== -->
      <div class="card">
        <div class="card-title">关于</div>
        <div style="font-size: 14px; color: #475569; line-height: 1.8;">
          <p><strong>SkBookBot</strong> v1.0.0</p>
          <p>SkBook 开放平台机器人框架</p>
          <p style="margin-top: 8px;">
            基于 SkBook 开放平台 API 的多机器人管理框架，支持插件热加载、Web 管理面板。
          </p>
          <p style="margin-top: 8px; font-size: 12px; color: #94A3B8;">
            API 文档：<a href="https://skbook.sk26.cn" target="_blank">https://skbook.sk26.cn</a>
          </p>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { api } from '@/api'

const configLoading = ref(true)
const saving = ref(false)
const saveMsg = ref('')
const saveSuccess = ref(false)

// 密码修改
const pwForm = reactive({ oldPassword: '', newPassword: '' })
const pwSaving = ref(false)
const pwMsg = ref('')
const pwSuccess = ref(false)

// 本地配置编辑副本
const localConfig = ref({
  server: { host: '0.0.0.0', port: 5200, has_web_secret_key: false, web_secret_key: '' },
  web: { enabled: true, has_admin_password: false, session_expire: 86400 },
  oauth2: { client_id: '', has_client_secret: false, client_secret: '', redirect_uri: '' },
  logging: { level: 'INFO', file: '', max_size: 5242880, backup_count: 3 },
  database: { path: './data/skbookbot.db' },
  data_dir: './data',
  services: { config_watcher: true, media_cleanup: false, message_cleanup_days: 30 },
  bots: [],
})

const callbackUrl = computed(() => {
  const host = localConfig.value.server.host || 'localhost'
  const port = localConfig.value.server.port || 5200
  return `http://${host}:${port}/api/auth/oauth2/callback`
})

onMounted(async () => {
  try {
    const res = await api.getConfig()
    if (res.success) {
      const d = res.data
      // 前端脱敏字段还原为可编辑状态
      localConfig.value = {
        server: {
          host: d.server?.host || '0.0.0.0',
          port: d.server?.port ?? 5200,
          has_web_secret_key: !!d.server?.has_web_secret_key,
          web_secret_key: '',
        },
        web: {
          enabled: d.web?.enabled ?? true,
          has_admin_password: !!d.web?.has_admin_password,
          session_expire: d.web?.session_expire ?? 86400,
        },
        oauth2: {
          client_id: d.oauth2?.client_id || '',
          has_client_secret: !!d.oauth2?.has_client_secret,
          client_secret: '',
          redirect_uri: d.oauth2?.redirect_uri || '',
        },
        logging: {
          level: d.logging?.level || 'INFO',
          file: d.logging?.file || '',
          max_size: d.logging?.max_size ?? 5242880,
          backup_count: d.logging?.backup_count ?? 3,
        },
        database: {
          path: d.database?.path || './data/skbookbot.db',
        },
        data_dir: d.data_dir || './data',
        services: {
          config_watcher: d.services?.config_watcher ?? true,
          media_cleanup: d.services?.media_cleanup ?? false,
          message_cleanup_days: d.services?.message_cleanup_days ?? 30,
        },
        bots: (d.bots || []).map(b => ({
          name: b.name,
          token: b.token_masked || '',
          enabled: b.enabled !== false,
          communities: b.communities || [],
          poll_interval: b.poll_interval ?? 3,
          command_prefix: b.command_prefix || '/',
        })),
      }
    }
  } catch (e) {
    console.error('加载配置失败', e)
  } finally {
    configLoading.value = false
  }
})

async function handleChangePassword() {
  if (!pwForm.oldPassword && localConfig.value.web.has_admin_password) {
    pwMsg.value = '请输入当前密码'
    pwSuccess.value = false
    return
  }
  if (!pwForm.newPassword) {
    pwMsg.value = '请输入新密码'
    pwSuccess.value = false
    return
  }
  pwSaving.value = true
  pwMsg.value = ''
  try {
    const res = await api.updateConfig({
      'web.admin_password': pwForm.newPassword,
    })
    if (res.success) {
      pwMsg.value = '密码已更新'
      pwSuccess.value = true
      pwForm.oldPassword = ''
      pwForm.newPassword = ''
      localConfig.value.web.has_admin_password = true
    } else {
      pwMsg.value = res.message || '密码修改失败'
      pwSuccess.value = false
    }
  } catch (e) {
    pwMsg.value = '密码修改失败: ' + (e.response?.data?.message || e.message)
    pwSuccess.value = false
  } finally {
    pwSaving.value = false
  }
}

async function handleSave() {
  saving.value = true
  saveMsg.value = ''
  saveSuccess.value = false
  try {
    const c = localConfig.value

    // 构建扁平键值对
    const payload = {
      'server.host': c.server.host,
      'server.port': c.server.port,
      'web.enabled': c.web.enabled,
      'web.session_expire': c.web.session_expire,
      'logging.level': c.logging.level,
      'logging.file': c.logging.file,
      'logging.max_size': c.logging.max_size,
      'logging.backup_count': c.logging.backup_count,
      'database.path': c.database.path,
      'data_dir': c.data_dir,
      'oauth2.client_id': c.oauth2.client_id,
      'oauth2.redirect_uri': c.oauth2.redirect_uri,
      'services.config_watcher': c.services.config_watcher,
      'services.media_cleanup': c.services.media_cleanup,
      'services.message_cleanup_days': c.services.message_cleanup_days,
    }

    // web_secret_key: 如果用户填了新值才提交
    if (c.server.web_secret_key) {
      payload['server.web_secret_key'] = c.server.web_secret_key
    }

    // oauth2.client_secret: 如果用户填了新值才提交
    if (c.oauth2.client_secret) {
      payload['oauth2.client_secret'] = c.oauth2.client_secret
    }

    // bots: 脱敏 token 保留原样，新 token 直接提交
    payload['bots'] = c.bots.map(b => ({
      name: b.name,
      token: b.token,
      enabled: b.enabled,
      communities: b.communities || [],
      poll_interval: b.poll_interval ?? 3,
      command_prefix: b.command_prefix || '/',
    }))

    const res = await api.updateConfig(payload)
    if (res.success) {
      saveMsg.value = res.message || '全部设置已保存'
      saveSuccess.value = true
      // 刷新配置状态（重新获取最新配置）
      const refreshRes = await api.getConfig()
      if (refreshRes.success) {
        const d = refreshRes.data
        localConfig.value.server.has_web_secret_key = !!d.server?.has_web_secret_key
        localConfig.value.server.web_secret_key = ''
        localConfig.value.oauth2.has_client_secret = !!d.oauth2?.has_client_secret
        localConfig.value.oauth2.client_secret = ''
      }
    } else {
      saveMsg.value = res.message || '保存失败'
      saveSuccess.value = false
    }
  } catch (e) {
    saveMsg.value = '保存失败: ' + (e.response?.data?.message || e.message)
    saveSuccess.value = false
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.info-bar {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 16px;
  background: #FFFBEB;
  border: 1px solid #FDE68A;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 13px;
  color: #92400E;
  line-height: 1.6;
}
.info-bar code {
  background: rgba(0,0,0,0.06);
  padding: 1px 5px;
  border-radius: 4px;
  font-size: 12px;
}
.info-bar-icon {
  font-size: 16px;
  flex-shrink: 0;
  margin-top: 1px;
}

.form-row {
  display: flex;
  gap: 16px;
}

.form-hint {
  font-size: 12px;
  color: #94A3B8;
  margin-top: 3px;
}

.save-msg {
  font-size: 14px;
  margin-bottom: 16px;
  padding: 10px 16px;
  border-radius: 6px;
}
.save-success {
  color: #166534;
  background: #DCFCE7;
}
.save-error {
  color: #991B1B;
  background: #FEE2E2;
}

/* 机器人配置卡片 */
.bot-config-card {
  background: #F8FAFC;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
}
.bot-config-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  font-size: 15px;
}
.bot-enabled-select {
  width: auto;
  min-width: 80px;
}

@media (max-width: 768px) {
  .form-row {
    flex-direction: column;
    gap: 0;
  }
}
</style>