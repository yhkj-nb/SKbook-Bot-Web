<template>
  <div>
    <div class="topbar">
      <h2>消息记录</h2>
    </div>

    <div class="card">
      <div class="card-title">发送消息</div>
      <form @submit.prevent="handleSend">
        <div class="form-group">
          <label class="form-label">社区 ID</label>
          <input v-model="sendForm.community_id" class="form-input" placeholder="10位数字社区长ID" required />
        </div>
        <div class="form-group">
          <label class="form-label">频道 ID</label>
          <input v-model="sendForm.channel_id" type="number" class="form-input" placeholder="频道ID" required />
        </div>
        <div class="form-group">
          <label class="form-label">
            消息内容
            <span style="font-weight: normal; font-size: 12px; color: #64748B;">
              （支持纯文本或 JSON 卡片）
            </span>
          </label>
          <textarea
            v-model="sendForm.content"
            class="form-textarea"
            placeholder="输入消息内容，例如：你好 或 JSON 卡片消息"
            rows="3"
            required
          ></textarea>
        </div>
        <div class="form-group">
          <label class="form-label">机器人</label>
          <select v-model="sendForm.bot_name" class="form-input">
            <option value="">默认机器人</option>
            <option v-for="bot in botStore.bots" :key="bot.name" :value="bot.name">
              {{ bot.name }}
            </option>
          </select>
        </div>
        <p v-if="sendError" style="color: #EF4444; font-size: 14px; margin-bottom: 12px;">{{ sendError }}</p>
        <p v-if="sendSuccess" style="color: #22C55E; font-size: 14px; margin-bottom: 12px;">{{ sendSuccess }}</p>
        <button type="submit" class="btn btn-primary" :disabled="sending">
          {{ sending ? '发送中...' : '发送消息' }}
        </button>
      </form>
    </div>

    <div class="card">
      <div class="card-title">获取消息</div>
      <div style="display: flex; gap: 12px; margin-bottom: 16px; flex-wrap: wrap;">
        <div style="flex: 1; min-width: 200px;">
          <label class="form-label">社区 ID</label>
          <input v-model="queryForm.community_id" class="form-input" placeholder="社区长ID" />
        </div>
        <div style="flex: 1; min-width: 200px;">
          <label class="form-label">频道 ID</label>
          <input v-model="queryForm.channel_id" type="number" class="form-input" placeholder="频道ID" />
        </div>
        <div style="flex: 0 0 120px;">
          <label class="form-label">数量</label>
          <input v-model="queryForm.limit" type="number" class="form-input" placeholder="20" />
        </div>
        <div style="display: flex; align-items: flex-end;">
          <button class="btn btn-primary" @click="fetchMessages" :disabled="messagesLoading">
            {{ messagesLoading ? '加载中...' : '查询' }}
          </button>
        </div>
      </div>

      <div v-if="messagesLoading" class="loading">加载中...</div>

      <div v-else-if="messages.length">
        <div v-for="msg in messages" :key="msg.message_id" class="message-item">
          <div class="message-meta">
            <span>#{{ msg.message_id }}</span>
            <span>发送者: {{ msg.sender_id }}</span>
            <span>{{ msg.created_at }}</span>
          </div>
          <div class="message-content">{{ msg.content }}</div>
        </div>
      </div>

      <div v-else class="empty-state">
        <div class="icon">💬</div>
        <p>输入社区和频道 ID 查询消息</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useBotStore } from '@/store'
import { api } from '@/api'

const botStore = useBotStore()

const sendForm = ref({
  community_id: '',
  channel_id: '',
  content: '',
  bot_name: '',
})
const sendError = ref('')
const sendSuccess = ref('')
const sending = ref(false)

const queryForm = ref({
  community_id: '',
  channel_id: '',
  limit: 20,
})
const messages = ref([])
const messagesLoading = ref(false)

onMounted(() => {
  botStore.fetchBots()
})

async function handleSend() {
  sending.value = true
  sendError.value = ''
  sendSuccess.value = ''
  try {
    const res = await api.sendMessage({
      community_id: sendForm.value.community_id,
      channel_id: Number(sendForm.value.channel_id),
      content: sendForm.value.content,
      bot_name: sendForm.value.bot_name,
    })
    if (res.success) {
      sendSuccess.value = '消息发送成功！'
      sendForm.value.content = ''
    } else {
      sendError.value = res.message || '发送失败'
    }
  } catch (e) {
    sendError.value = '发送失败: ' + (e.response?.data?.message || e.message)
  } finally {
    sending.value = false
  }
}

async function fetchMessages() {
  messagesLoading.value = true
  try {
    const res = await api.getMessages({
      community_id: queryForm.value.community_id,
      channel_id: Number(queryForm.value.channel_id) || undefined,
      limit: Number(queryForm.value.limit) || 20,
    })
    if (res.success) {
      messages.value = res.data.messages || []
    }
  } catch (e) {
    console.error('获取消息失败', e)
  } finally {
    messagesLoading.value = false
  }
}
</script>