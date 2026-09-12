<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { api } from '@/api'
import SvgIcon from '@/components/SvgIcon.vue'

const lines = ref([])
const total = ref(0)
const filePath = ref('')
const message = ref('')
const loading = ref(true)
const tailCount = ref(100)
const autoRefresh = ref(true)
let refreshTimer = null

const logColors = {
  'ERROR': '#EF4444',
  'WARN': '#F59E0B',
  'WARNING': '#F59E0B',
  'INFO': '#3B82F6',
  'DEBUG': '#6366F1',
  'CRITICAL': '#DC2626',
}

async function fetchLogs() {
  try {
    const res = await api.getLogs(tailCount.value)
    if (res.success) {
      lines.value = res.data.lines || []
      total.value = res.data.total || 0
      filePath.value = res.data.file || ''
      message.value = res.data.message || ''
    }
  } catch (e) {
    lines.value = []
    message.value = '获取日志失败: ' + e.message
  } finally {
    loading.value = false
  }
}

function highlightLog(line) {
  for (const [level, color] of Object.entries(logColors)) {
    const idx = line.indexOf(` | ${level} `)
    if (idx !== -1) {
      return line.substring(0, idx + 3) +
        `<span style="color:${color};font-weight:600">${level}</span>` +
        line.substring(idx + 3 + level.length)
    }
  }
  return line
}

function handleRefresh() {
  loading.value = true
  fetchLogs()
}

function scrollToBottom() {
  setTimeout(() => {
    const container = document.querySelector('.log-container')
    if (container) container.scrollTop = container.scrollHeight
  }, 50)
}

onMounted(() => {
  fetchLogs().then(scrollToBottom)
  if (autoRefresh.value) {
    refreshTimer = setInterval(() => {
      fetchLogs()
    }, 5000)
  }
})

onUnmounted(() => {
  if (refreshTimer) clearInterval(refreshTimer)
})
</script>

<template>
  <div>
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:24px">
      <div>
        <h1 class="win-page-title">日志查看</h1>
        <p class="win-page-subtitle">实时查看运行日志</p>
      </div>
      <div style="display:flex;gap:8px;align-items:center">
        <select v-model.number="tailCount" class="win-select" style="width:90px">
          <option :value="50">50 行</option>
          <option :value="100">100 行</option>
          <option :value="200">200 行</option>
          <option :value="500">500 行</option>
        </select>
        <button class="win-btn win-btn-secondary" @click="handleRefresh" :disabled="loading">
          <SvgIcon name="refresh" :size="14" />
          刷新
        </button>
      </div>
    </div>

    <div class="win-card win-card-pad">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
        <div style="display:flex;align-items:center;gap:12px">
          <h2 class="win-section-title" style="margin-bottom:0">日志输出</h2>
          <span v-if="filePath" style="font-size:12px;color:var(--text-tertiary)">{{ filePath }} — 共 {{ total }} 行</span>
        </div>
        <span v-if="autoRefresh" class="win-badge win-badge-info" style="font-size:11px">自动刷新中 (5s)</span>
      </div>

      <div v-if="message && !lines.length" class="win-infobar win-infobar-warning" style="margin-bottom:12px">
        {{ message }}
      </div>

      <div v-if="loading && !lines.length" class="win-loading" style="padding:60px 0">
        <div class="win-ring"></div>
        <span>加载日志...</span>
      </div>

      <div
        v-else-if="lines.length"
        class="log-container"
        style="background:var(--bg-deep,#1E293B);border-radius:8px;padding:16px;max-height:60vh;overflow-y:auto;font-family:'Cascadia Code','Fira Code','Consolas',monospace;font-size:12px;line-height:1.7"
      >
        <div v-for="(line, idx) in lines" :key="idx" style="color:#94A3B8;white-space:pre-wrap;word-break:break-all">
          <span v-html="highlightLog(line)"></span>
        </div>
      </div>

      <div v-else class="win-empty" style="padding:60px 0">
        <SvgIcon name="file" :size="36" />
        <p>暂无日志内容</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.log-container::-webkit-scrollbar {
  width: 6px;
}
.log-container::-webkit-scrollbar-track {
  background: transparent;
}
.log-container::-webkit-scrollbar-thumb {
  background: #475569;
  border-radius: 3px;
}

.win-select {
  height: 32px;
  padding: 0 10px;
  border: 1px solid var(--border, #E2E8F0);
  border-radius: var(--radius-control, 6px);
  background: var(--bg-input, #fff);
  color: var(--text, #1E293B);
  font-size: 13px;
  outline: none;
  cursor: pointer;
}
.win-select:focus {
  border-color: var(--accent, #3B82F6);
}
</style>