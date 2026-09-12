<template>
  <div>
    <div class="topbar">
      <h2>机器人管理</h2>
      <div class="topbar-actions">
        <button class="btn btn-primary" @click="showCreateModal = true">+ 添加机器人</button>
      </div>
    </div>

    <div class="card">
      <div class="card-title">机器人列表</div>

      <div v-if="botStore.loading" class="loading">加载中...</div>

      <table v-else class="table">
        <thead>
          <tr>
            <th>名称</th>
            <th>Token</th>
            <th>状态</th>
            <th>命令前缀</th>
            <th>轮询间隔</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="bot in botStore.bots" :key="bot.name">
            <td><strong>{{ bot.name }}</strong></td>
            <td><code>{{ bot.token_masked }}</code></td>
            <td>
              <span class="badge" :class="bot.running ? 'badge-success' : 'badge-danger'">
                {{ bot.running ? '运行中' : '已停止' }}
              </span>
            </td>
            <td>{{ bot.command_prefix }}</td>
            <td>{{ bot.poll_interval }}s</td>
            <td>
              <button class="btn btn-outline btn-sm" @click="restartBot(bot.name)" :disabled="!bot.running">
                重启
              </button>
              <button class="btn btn-danger btn-sm" style="margin-left: 4px;" @click="deleteBot(bot.name)">
                删除
              </button>
            </td>
          </tr>
          <tr v-if="!botStore.bots.length">
            <td colspan="6" class="empty-state">
              暂无机器人，点击上方按钮添加
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 创建机器人模态框 -->
    <div v-if="showCreateModal" class="modal-overlay" @click.self="showCreateModal = false">
      <div class="modal">
        <h3>添加机器人</h3>
        <form @submit.prevent="handleCreate">
          <div class="form-group">
            <label class="form-label">机器人名称</label>
            <input v-model="form.name" class="form-input" placeholder="例如：我的机器人" required />
          </div>
          <div class="form-group">
            <label class="form-label">机器人 Token</label>
            <input v-model="form.token" class="form-input" placeholder="在 SkBook 应用设置页获取" required />
            <p style="font-size: 12px; color: #64748B; margin-top: 4px;">
              在 SkBook 应用设置页中查看
            </p>
          </div>
          <div class="form-group">
            <label class="form-label">命令前缀</label>
            <input v-model="form.command_prefix" class="form-input" placeholder="/" />
          </div>
          <div class="form-group">
            <label class="form-label">轮询间隔（秒）</label>
            <input v-model="form.poll_interval" type="number" class="form-input" placeholder="3" />
          </div>
          <p v-if="createError" style="color: #EF4444; font-size: 14px; margin-bottom: 12px;">{{ createError }}</p>
          <div class="modal-actions">
            <button type="button" class="btn btn-outline" @click="showCreateModal = false">取消</button>
            <button type="submit" class="btn btn-primary" :disabled="creating">
              {{ creating ? '创建中...' : '创建' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useBotStore } from '@/store'

const botStore = useBotStore()

const showCreateModal = ref(false)
const creating = ref(false)
const createError = ref('')
const form = ref({
  name: '',
  token: '',
  command_prefix: '/',
  poll_interval: 3,
})

onMounted(() => {
  botStore.fetchBots()
})

async function handleCreate() {
  creating.value = true
  createError.value = ''
  try {
    const res = await botStore.createBot(form.value)
    if (res.success) {
      showCreateModal.value = false
      form.value = { name: '', token: '', command_prefix: '/', poll_interval: 3 }
    } else {
      createError.value = res.message || '创建失败'
    }
  } catch (e) {
    createError.value = '创建失败: ' + (e.response?.data?.message || e.message)
  } finally {
    creating.value = false
  }
}

async function restartBot(name) {
  await botStore.restartBot(name)
}

async function deleteBot(name) {
  if (confirm(`确认删除机器人「${name}」？`)) {
    await botStore.deleteBot(name)
  }
}
</script>