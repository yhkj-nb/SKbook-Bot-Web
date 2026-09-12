<script setup>
import { ref, onMounted } from 'vue'
import { api } from '@/api'
import { useUpdateStore } from '@/store'
import SvgIcon from '@/components/SvgIcon.vue'

const store = useUpdateStore()

async function handleCheck() {
  await store.checkUpdate()
}

function openLink(url) {
  if (url) window.open(url, '_blank')
}

onMounted(() => {
  store.checkUpdate()
})
</script>

<template>
  <div>
    <h1 class="win-page-title">框架更新</h1>
    <p class="win-page-subtitle">检查 SkBookBot 框架新版本</p>

    <div class="win-card win-card-pad" style="margin-bottom:16px">
      <div class="update-info">
        <div class="update-icon-wrap">
          <SvgIcon name="update" :size="32" />
        </div>
        <div class="update-detail">
          <div class="update-version-row">
            <span class="update-label">当前版本</span>
            <span class="update-badge current">{{ store.currentVersion }}</span>
          </div>
          <div class="update-version-row" v-if="store.updateInfo">
            <span class="update-label">最新版本</span>
            <span class="update-badge" :class="store.updateInfo.has_update ? 'latest' : 'current'">
              {{ store.updateInfo.latest_version || '未知' }}
            </span>
          </div>
        </div>
      </div>

      <div v-if="store.checking" class="win-loading" style="padding:12px">
        <div class="win-ring" style="width:20px;height:20px"></div>
        <span style="font-size:13px;color:var(--text-tertiary);margin-left:8px">检查更新中...</span>
      </div>

      <div v-else-if="store.updateInfo" class="update-result">
        <div v-if="store.updateInfo.has_update" class="update-available">
          <div class="update-msg">
            <SvgIcon name="alert" :size="18" style="color:var(--warning)" />
            <span>新版本 {{ store.updateInfo.latest_version }} 可用</span>
          </div>
          <p v-if="store.updateInfo.release_time" style="font-size:12px;color:var(--text-tertiary);margin-top:4px">
            发布时间：{{ store.updateInfo.release_time }}
          </p>
          <div v-if="store.updateInfo.release_notes" class="release-notes">
            <div class="rn-title">更新说明</div>
            <pre class="rn-body">{{ store.updateInfo.release_notes }}</pre>
          </div>
          <button class="win-btn win-btn-primary" style="margin-top:12px" @click="openLink(store.updateInfo.download_url)">
            <SvgIcon name="download" :size="14" />
            前往下载 {{ store.updateInfo.latest_version }}
          </button>
        </div>
        <div v-else class="update-current">
          <SvgIcon name="check" :size="18" style="color:var(--success)" />
          <span>已是最新版本</span>
        </div>
      </div>

      <button class="win-btn win-btn-secondary" style="margin-top:16px" :disabled="store.checking" @click="handleCheck">
        <SvgIcon name="refresh" :size="14" />
        重新检查
      </button>
    </div>

    <div class="win-card win-card-pad">
      <h2 class="win-section-title">仓库信息</h2>
      <div style="display:flex;flex-direction:column;gap:8px;font-size:13px">
        <div style="display:flex;align-items:center;gap:8px">
          <SvgIcon name="git" :size="16" />
          <span style="color:var(--text-secondary)">GitHub：</span>
          <a href="https://github.com/yhkj-nb/SKbook-Bot" target="_blank" style="color:var(--accent);text-decoration:none">
            yhkj-nb/SKbook-Bot
          </a>
        </div>
        <div style="display:flex;align-items:center;gap:8px">
          <SvgIcon name="tag" :size="16" />
          <span style="color:var(--text-secondary)">版本标签：</span>
          <code style="font-size:12px;padding:2px 6px;background:var(--bg-hover);border-radius:4px;color:var(--text)">
            {{ store.updateInfo?.latest_version || store.currentVersion }}
          </code>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.update-info {
  display: flex;
  gap: 16px;
  align-items: center;
  margin-bottom: 12px;
}
.update-icon-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 12px;
  background: rgba(59, 130, 246, 0.1);
  color: var(--accent);
  flex-shrink: 0;
}
.update-detail {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.update-version-row {
  display: flex;
  align-items: center;
  gap: 8px;
}
.update-label {
  font-size: 13px;
  color: var(--text-secondary);
  min-width: 60px;
}
.update-badge {
  font-size: 14px;
  font-weight: 700;
  padding: 2px 10px;
  border-radius: 4px;
}
.update-badge.current {
  background: rgba(16, 185, 129, 0.12);
  color: var(--success);
}
.update-badge.latest {
  background: rgba(59, 130, 246, 0.12);
  color: var(--accent);
}
.update-available {
  padding: 12px;
  background: rgba(138, 109, 0, 0.06);
  border-radius: 6px;
  border: 1px solid rgba(138, 109, 0, 0.15);
}
.update-msg {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
}
.release-notes {
  margin-top: 8px;
}
.rn-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 4px;
}
.rn-body {
  font-family: 'SF Mono', 'Cascadia Code', 'Consolas', monospace;
  font-size: 11px;
  line-height: 1.5;
  color: var(--text-secondary);
  white-space: pre-wrap;
  word-break: break-word;
  max-height: 200px;
  overflow-y: auto;
  background: var(--bg);
  padding: 8px;
  border-radius: 4px;
}
.update-current {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: var(--success);
  font-weight: 500;
}
.update-result {
  margin-top: 8px;
}
</style>