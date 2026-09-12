<script setup>
import { ref, onMounted } from 'vue'
import { useStatsStore, useBotStore, usePluginStore } from '@/store'
import SvgIcon from '@/components/SvgIcon.vue'

const statsStore = useStatsStore()
const botStore = useBotStore()
const pluginStore = usePluginStore()

onMounted(async () => {
  await Promise.all([
    statsStore.fetchStats(),
    botStore.fetchBots(),
    pluginStore.fetchPlugins(),
  ])
})
</script>

<template>
  <div>
    <h1 class="win-page-title">仪表盘</h1>
    <p class="win-page-subtitle">系统概览</p>

    <div class="stats-grid" v-if="statsStore.stats">
      <div class="win-card win-card-pad stat-card">
        <div class="stat-icon" style="background:rgba(59,130,246,0.12);color:#3B82F6">
          <SvgIcon name="cpu" :size="22" />
        </div>
        <div>
          <div class="stat-value">{{ statsStore.stats.system.cpu_percent }}%</div>
          <div class="stat-label">CPU 使用率</div>
        </div>
      </div>
      <div class="win-card win-card-pad stat-card">
        <div class="stat-icon" style="background:rgba(16,185,129,0.12);color:#10B981">
          <SvgIcon name="memory" :size="22" />
        </div>
        <div>
          <div class="stat-value">{{ statsStore.stats.system.memory_percent }}%</div>
          <div class="stat-label">内存使用率</div>
        </div>
      </div>
      <div class="win-card win-card-pad stat-card">
        <div class="stat-icon" style="background:rgba(139,92,246,0.12);color:#8B5CF6">
          <SvgIcon name="bot" :size="22" />
        </div>
        <div>
          <div class="stat-value">{{ statsStore.stats.bots.active }} / {{ statsStore.stats.bots.total }}</div>
          <div class="stat-label">机器人运行中</div>
        </div>
      </div>
      <div class="win-card win-card-pad stat-card">
        <div class="stat-icon" style="background:rgba(245,158,11,0.12);color:#F59E0B">
          <SvgIcon name="plugin" :size="22" />
        </div>
        <div>
          <div class="stat-value">{{ statsStore.stats.plugins.total }}</div>
          <div class="stat-label">插件总数</div>
        </div>
      </div>
    </div>

    <div v-if="statsStore.loading" class="win-loading">
      <div class="win-ring"></div>
    </div>

    <!-- 机器人状态 -->
    <div class="win-card win-card-pad" style="margin-top:20px">
      <h2 class="win-section-title">运行状态</h2>
      <div v-if="botStore.bots.length" class="win-list">
        <div v-for="b in botStore.bots" :key="b.name" class="win-list-item">
          <SvgIcon name="bot" :size="20" />
          <div class="win-list-item-content">
            <div class="win-list-item-title">{{ b.name }}</div>
            <div class="win-list-item-sub">Token: {{ b.token_masked }}</div>
          </div>
          <span class="win-badge" :class="b.running ? 'win-badge-success' : 'win-badge-warning'">
            {{ b.running ? '运行中' : '已停止' }}
          </span>
        </div>
      </div>
      <div v-else class="win-empty">
        <SvgIcon name="bot" :size="32" />
        <p>暂无机器人</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 12px;
}
.stat-card {
  display: flex;
  align-items: center;
  gap: 12px;
}
.stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 8px;
  flex-shrink: 0;
}
.stat-value {
  font-size: 20px;
  font-weight: 700;
  line-height: 1.2;
}
.stat-label {
  font-size: 12px;
  color: var(--text-tertiary);
  margin-top: 2px;
}
</style>