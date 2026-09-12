<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { api } from '@/api'
import { useBotStore } from '@/store'
import SvgIcon from '@/components/SvgIcon.vue'
import WinTextBox from '@/components/WinTextBox.vue'

const botStore = useBotStore()
const communityId = ref('')
const channels = ref([])
const channelsLoading = ref(false)
const channelError = ref('')
const selectedChannel = ref(null)
const messages = ref([])
const messagesLoading = ref(false)
const sendContent = ref('')
const sending = ref(false)
let refreshTimer = null
const autoRefresh = ref(false)

const activeBot = computed(() => {
  const active = botStore.bots.filter(b => b.running)
  return active[0] || null
})

async function fetchChannels() {
  const cid = communityId.value.trim()
  if (!cid) { channelError.value = '请输入社区 ID'; return }
  channelsLoading.value = true; channelError.value = ''
  try {
    const botName = activeBot.value?.name || ''
    const res = await api.getChannels(cid, botName)
    if (res.success) channels.value = res.data.channels || []
    else { channelError.value = res.message || '获取频道失败'; channels.value = [] }
  } catch (e) {
    channelError.value = e.response?.data?.message || e.message || '网络错误'
    channels.value = []
  } finally { channelsLoading.value = false }
}

function selectChannel(ch) {
  selectedChannel.value = ch
  messages.value = []
  fetchMessages()
}

async function fetchMessages() {
  if (!selectedChannel.value || !communityId.value.trim()) return
  messagesLoading.value = true
  try {
    const botName = activeBot.value?.name || ''
    const res = await api.getMessages({
      community_id: communityId.value.trim(),
      channel_id: selectedChannel.value.channel_id,
      limit: 50, bot_name: botName,
    })
    if (res.success) messages.value = (res.data.messages || []).reverse()
  } catch {} finally { messagesLoading.value = false }
}

async function handleSend() {
  const content = sendContent.value.trim()
  if (!content || !selectedChannel.value || !communityId.value.trim()) return
  sending.value = true
  try {
    const botName = activeBot.value?.name || ''
    const res = await api.sendMessage({
      community_id: communityId.value.trim(),
      channel_id: selectedChannel.value.channel_id,
      content, bot_name: botName,
    })
    if (res.success) { sendContent.value = ''; await fetchMessages() }
  } catch {} finally { sending.value = false }
}

function handleKeydown(e) {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
}

function parseMessageDisplay(content) {
  if (!content) return '(空消息)'
  try {
    const obj = JSON.parse(content)
    if (obj.type === 'text') return obj.text || '(空消息)'
    if (obj.type === 'card') return obj.title || obj.header?.text || '[卡片消息]'
    return content.substring(0, 200)
  } catch { return content }
}

function formatTime(t) {
  if (!t) return ''
  const d = new Date(t)
  if (isNaN(d.getTime())) return t
  const now = new Date()
  if (d.toDateString() === now.toDateString())
    return d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  return `${d.getMonth()+1}/${d.getDate()} ${d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}`
}

watch(autoRefresh, (val) => {
  if (val) refreshTimer = setInterval(() => { if (selectedChannel.value) fetchMessages() }, 5000)
  else clearInterval(refreshTimer)
})

onMounted(async () => { if (!botStore.bots.length) await botStore.fetchBots() })
onUnmounted(() => clearInterval(refreshTimer))
</script>

<template>
  <div class="msg-layout">
    <div class="msg-sidebar">
      <div class="msg-sidebar-header">
        <div class="community-input-row">
          <WinTextBox v-model:Text="communityId" PlaceholderText="输入社区 ID" @keydown.enter="fetchChannels" />
          <button class="win-btn win-btn-primary" style="height:32px;flex-shrink:0" :disabled="channelsLoading" @click="fetchChannels">
            <SvgIcon name="refresh" :size="14" />
          </button>
        </div>
        <p v-if="channelError" class="msg-error">{{ channelError }}</p>
      </div>
      <div class="channel-list" v-if="!channelsLoading">
        <div v-for="ch in channels" :key="ch.channel_id" class="channel-item"
          :class="{ active: selectedChannel?.channel_id === ch.channel_id }" @click="selectChannel(ch)">
          <svg class="channel-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M4 9h16M4 15h16M10 3L8 21M16 3l-2 18"/>
          </svg>
          <span class="channel-name">{{ ch.name }}</span>
        </div>
        <div v-if="!channels.length && communityId && !channelError" class="msg-empty-hint">未获取到频道</div>
      </div>
      <div v-else class="channel-loading"><div class="win-ring" style="width:20px;height:20px"></div><span>获取频道中...</span></div>
    </div>

    <div class="msg-main">
      <div v-if="!selectedChannel" class="msg-welcome">
        <SvgIcon name="chat" :size="48" />
        <h3>消息记录</h3>
        <p>输入社区 ID 获取频道列表，选择频道查看和发送消息</p>
      </div>
      <template v-else>
        <div class="chat-header">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink:0">
            <path d="M4 9h16M4 15h16M10 3L8 21M16 3l-2 21"/>
          </svg>
          <span class="chat-header-name">{{ selectedChannel.name }}</span>
          <span class="chat-header-id">#{{ selectedChannel.channel_id }}</span>
          <div class="chat-header-actions">
            <label class="auto-refresh-label">
              <input type="checkbox" v-model="autoRefresh" />
              <span>自动刷新</span>
            </label>
          </div>
        </div>
        <div class="chat-messages">
          <div v-if="messagesLoading" class="chat-loading"><div class="win-ring" style="width:24px;height:24px"></div></div>
          <template v-else>
            <div v-if="messages.length === 0" class="chat-empty">
              <SvgIcon name="chat" :size="32" /><p>暂无消息</p>
            </div>
            <div v-for="(m, i) in messages" :key="m.message_id" class="chat-bubble"
              :class="{ 'is-continuous': i > 0 && messages[i-1].sender_id === m.sender_id }">
              <div class="bubble-sender">发送者 {{ m.sender_id }}</div>
              <div class="bubble-content">{{ parseMessageDisplay(m.content) }}</div>
              <div class="bubble-time">{{ formatTime(m.created_at) }}</div>
            </div>
          </template>
        </div>
        <div class="chat-input-area">
          <textarea class="chat-input" v-model="sendContent"
            :placeholder="`发送消息到 #${selectedChannel.name}`" rows="2"
            @keydown="handleKeydown" :disabled="sending"></textarea>
          <button class="win-btn win-btn-primary send-btn" :disabled="sending || !sendContent.trim()" @click="handleSend">
            <SvgIcon name="send" :size="16" /><span>{{ sending ? '发送中...' : '发送' }}</span>
          </button>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.msg-layout { display:flex; height:calc(100vh - 48px - 48px); margin:-24px; background:var(--bg); overflow:hidden; }
.msg-sidebar { width:280px; min-width:280px; display:flex; flex-direction:column; border-right:1px solid var(--border); background:var(--bg-panel); }
.msg-sidebar-header { padding:12px; border-bottom:1px solid var(--border); }
.community-input-row { display:flex; gap:6px; align-items:center; }
.msg-error { font-size:12px; color:var(--danger,#C42B1C); margin-top:6px; }
.channel-list { flex:1; overflow-y:auto; padding:4px 0; }
.channel-item { display:flex; align-items:center; gap:8px; padding:8px 12px; cursor:pointer; color:var(--text-secondary); font-size:13px; transition:background .1s; border-left:3px solid transparent; }
.channel-item:hover { background:var(--bg-hover); color:var(--text); }
.channel-item.active { background:var(--accent); color:#fff; border-left-color:rgba(255,255,255,.5); }
.channel-icon { flex-shrink:0; opacity:.6; }
.channel-item.active .channel-icon { opacity:1; }
.channel-name { white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.channel-loading { display:flex; align-items:center; justify-content:center; gap:8px; padding:24px; font-size:13px; color:var(--text-tertiary); }
.msg-empty-hint { padding:24px 16px; font-size:13px; color:var(--text-tertiary); text-align:center; }
.msg-main { flex:1; display:flex; flex-direction:column; overflow:hidden; }
.msg-welcome { display:flex; flex-direction:column; align-items:center; justify-content:center; flex:1; gap:8px; color:var(--text-tertiary); }
.msg-welcome h3 { font-size:18px; font-weight:600; color:var(--text); margin:0; }
.msg-welcome p { font-size:13px; margin:0; }
.chat-header { display:flex; align-items:center; gap:8px; padding:12px 16px; border-bottom:1px solid var(--border); background:var(--bg-panel); flex-shrink:0; color:var(--text); }
.chat-header-name { font-size:15px; font-weight:600; }
.chat-header-id { font-size:12px; color:var(--text-tertiary); }
.chat-header-actions { margin-left:auto; }
.auto-refresh-label { display:flex; align-items:center; gap:4px; font-size:12px; color:var(--text-secondary); cursor:pointer; user-select:none; }
.chat-messages { flex:1; overflow-y:auto; padding:16px; display:flex; flex-direction:column; gap:8px; }
.chat-loading { display:flex; justify-content:center; padding:40px; }
.chat-empty { display:flex; flex-direction:column; align-items:center; justify-content:center; flex:1; gap:4px; color:var(--text-tertiary); font-size:14px; }
.chat-bubble { max-width:80%; padding:8px 12px; border-radius:8px; background:var(--bg-card,var(--bg-panel)); border:1px solid var(--border); align-self:flex-start; }
.chat-bubble.is-continuous { margin-top:2px; }
.bubble-sender { font-size:11px; font-weight:600; color:var(--accent); margin-bottom:4px; }
.bubble-content { font-size:14px; line-height:1.5; color:var(--text); word-break:break-word; white-space:pre-wrap; }
.bubble-time { font-size:11px; color:var(--text-tertiary); margin-top:4px; text-align:right; }
.chat-input-area { display:flex; gap:8px; padding:12px 16px; border-top:1px solid var(--border); background:var(--bg-panel); flex-shrink:0; align-items:flex-end; }
.chat-input { flex:1; resize:none; border:1px solid var(--border); border-radius:var(--radius-control,6px); padding:8px 12px; font-size:14px; font-family:inherit; background:var(--bg-input,var(--bg)); color:var(--text); outline:none; transition:border-color .15s; line-height:1.5; }
.chat-input:focus { border-color:var(--accent); }
.chat-input::placeholder { color:var(--text-tertiary); }
.send-btn { display:flex; align-items:center; gap:4px; height:40px; padding:0 16px; flex-shrink:0; }
@media (max-width:768px) {
  .msg-layout { flex-direction:column; height:auto; margin:-12px; }
  .msg-sidebar { width:100%; min-width:100%; max-height:200px; }
  .msg-main { height:400px; }
  .chat-bubble { max-width:95%; }
}
</style>