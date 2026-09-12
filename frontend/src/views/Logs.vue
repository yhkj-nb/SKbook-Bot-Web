<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { api } from '@/api'
import WinTextBox from '@/components/WinTextBox.vue'

const lines = ref([])
const total = ref(0)
const filePath = ref('')
const message = ref('')
const loading = ref(false)
const tailCount = ref(100)
const autoRefresh = ref(false)
let refreshTimer = null

async function fetchLogs() {
  loading.value = true
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
  } finally { loading.value = false }
}

function highlightLog(line) {
  const logColors = {
    ERROR: '#FF6B6B', WARNING: '#D7A800', INFO: '#60CDFF',
    DEBUG: '#9E9E9E', CRITICAL: '#C42B1C',
  }
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

function toggleAutoRefresh() {
  autoRefresh.value = !autoRefresh.value
  if (autoRefresh.value) {
    refreshTimer = setInterval(fetchLogs, 3000)
  } else {
    clearInterval(refreshTimer)
  }
}

onMounted(() => fetchLogs())
onUnmounted(() => clearInterval(refreshTimer))
</script>

<template>
  <div>
    <div class="page-head">
      <div>
        <h1 class="win-page-title">日志查看</h1>
        <p class="win-page-subtitle" v-if="filePath">文件: {{ filePath }}</p>
      </div>
      <div class="log-actions">
        <WinTextBox v-model:Text="tailCount" PlaceholderText="行数" style="width:80px" />
        <button class="win-btn win-btn-secondary" @click="fetchLogs" :disabled="loading">
          {{ loading ? '加载中...' : '刷新' }}
        </button>
        <button class="win-btn" :class="autoRefresh ? 'win-btn-primary' : 'win-btn-secondary'" @click="toggleAutoRefresh">
          {{ autoRefresh ? '停止刷新' : '自动刷新' }}
        </button>
      </div>
    </div>

    <div v-if="message" style="margin-bottom:12px;color:var(--text-tertiary);font-size:13px">{{ message }}</div>

    <div class="win-card log-container" v-if="lines.length">
      <div class="log-total">共 {{ total }} 行，显示最近 {{ lines.length }} 行</div>
      <div class="log-line" v-for="(line, i) in lines" :key="i" v-html="highlightLog(line)"></div>
    </div>
    <div class="win-card win-card-pad" v-else-if="!loading">
      <div class="win-empty"><p>{{ message || '暂无日志' }}</p></div>
    </div>
  </div>
</template>

<style scoped>
.page-head { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:16px; flex-wrap:wrap; gap:12px; }
.log-actions { display:flex; align-items:flex-end; gap:8px; }
.log-container { padding:12px; font-family:'SF Mono','Cascadia Code','Consolas',monospace; font-size:12px; line-height:1.6; max-height:calc(100vh - 240px); overflow-y:auto; background:var(--bg); }
.log-total { font-size:11px; color:var(--text-tertiary); margin-bottom:8px; padding-bottom:8px; border-bottom:1px solid var(--border); }
.log-line { white-space:pre-wrap; word-break:break-all; }
.log-line:hover { background:var(--bg-hover); }
</style>