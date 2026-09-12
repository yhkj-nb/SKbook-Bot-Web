<template>
  <div>
    <div class="topbar">
      <h2>仪表盘</h2>
      <div class="topbar-actions">
        <button class="btn btn-outline btn-sm" @click="refresh">刷新</button>
      </div>
    </div>

    <div v-if="statsStore.loading" class="loading">加载中...</div>

    <template v-else-if="statsStore.stats">
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-value">{{ statsStore.stats.bots.total }}</div>
          <div class="stat-label">机器人总数</div>
        </div>
        <div class="stat-card">
          <div class="stat-value" style="color: #22C55E;">{{ statsStore.stats.bots.active }}</div>
          <div class="stat-label">运行中</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ statsStore.stats.plugins.total }}</div>
          <div class="stat-label">插件数</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ statsStore.stats.system.cpu_percent }}%</div>
          <div class="stat-label">CPU 使用率</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ statsStore.stats.system.memory_used }}MB</div>
          <div class="stat-label">内存使用</div>
        </div>
      </div>

      <!-- 机器人状态 -->
      <div class="card">
        <div class="card-title">机器人状态</div>
        <table class="table" v-if="botStore.bots.length">
          <thead>
            <tr>
              <th>名称</th>
              <th>状态</th>
              <th>命令前缀</th>
              <th>监听社区</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="bot in botStore.bots" :key="bot.name">
              <td><strong>{{ bot.name }}</strong></td>
              <td>
                <span class="badge" :class="bot.running ? 'badge-success' : 'badge-danger'">
                  {{ bot.running ? '运行中' : '已停止' }}
                </span>
              </td>
              <td>{{ bot.command_prefix }}</td>
              <td>{{ bot.communities.length || '全部' }}</td>
            </tr>
          </tbody>
        </table>
        <div v-else class="empty-state">
          <p>暂无机器人，请先在「机器人管理」中添加</p>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useStatsStore, useBotStore } from '@/store'

const statsStore = useStatsStore()
const botStore = useBotStore()

onMounted(() => {
  refresh()
})

function refresh() {
  statsStore.fetchStats()
  botStore.fetchBots()
}
</script>