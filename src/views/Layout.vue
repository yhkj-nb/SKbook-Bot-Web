<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useThemeStore } from '@/store/theme'
import { useAuthStore } from '@/store'
import SvgIcon from '@/components/SvgIcon.vue'

const router = useRouter()
const route = useRoute()
const { darkMode, toggleDark } = useThemeStore()
const auth = useAuthStore()

const NAV_ITEMS = [
  { label: '仪表盘', key: '/', icon: 'dashboard' },
  { label: '机器人管理', key: '/bots', icon: 'bot' },
  { label: '插件管理', key: '/plugins', icon: 'plugins' },
  { label: '消息记录', key: '/messages', icon: 'messages' },
]

const BOTTOM_ITEMS = [
  { label: '日志查看', key: '/logs', icon: 'file' },
  { label: '框架更新', key: '/update', icon: 'update' },
  { label: '系统设置', key: '/settings', icon: 'settings' },
]

const currentRoute = computed(() => route.path)

function navigate(key) {
  router.push(key)
}

function handleLogout() {
  auth.logout()
  router.push('/login')
}

function isActive(key) {
  if (key === '/') return currentRoute.value === '/'
  return currentRoute.value.startsWith(key)
}
</script>

<template>
  <div class="layout-wrapper">
    <!-- Titlebar -->
    <header class="titlebar">
      <div class="titlebar-left">
        <SvgIcon name="bot" :size="16" />
        <span class="titlebar-title">SkBookBot</span>
      </div>
      <div class="titlebar-center"></div>
      <div class="titlebar-actions">
        <button class="win-btn-text titlebar-btn" @click="toggleDark" :title="darkMode ? '切换亮色' : '切换暗色'">
          <SvgIcon :name="darkMode ? 'sun' : 'moon'" :size="16" />
        </button>
      </div>
    </header>

    <!-- Body -->
    <div class="layout-body">
      <!-- Sidebar -->
      <aside class="sidebar">
        <nav class="sidebar-nav">
          <div
            v-for="item in NAV_ITEMS"
            :key="item.key"
            class="nav-item"
            :class="{ active: isActive(item.key) }"
            @click="navigate(item.key)"
          >
            <div v-if="isActive(item.key)" class="nav-indicator"></div>
            <SvgIcon :name="item.icon" :size="20" />
            <span>{{ item.label }}</span>
          </div>
        </nav>

        <div class="sidebar-bottom">
          <div
            v-for="item in BOTTOM_ITEMS"
            :key="item.key"
            class="nav-item"
            :class="{ active: isActive(item.key) }"
            @click="navigate(item.key)"
          >
            <div v-if="isActive(item.key)" class="nav-indicator"></div>
            <SvgIcon :name="item.icon" :size="20" />
            <span>{{ item.label }}</span>
          </div>
          <div class="nav-item" @click="handleLogout">
            <SvgIcon name="power" :size="20" />
            <span>退出登录</span>
          </div>
        </div>
      </aside>

      <!-- Main Area -->
      <main class="main-area">
        <router-view v-slot="{ Component }">
          <transition name="win-fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<style scoped>
.layout-wrapper {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

/* ---- Titlebar ---- */
.titlebar {
  display: flex;
  align-items: center;
  height: var(--titlebar-height, 32px);
  padding: 0 12px;
  background: var(--bg-mica);
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
  user-select: none;
}

.titlebar-left {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--text);
}

.titlebar-title {
  font-size: 13px;
  font-weight: 600;
  line-height: 1;
}

.titlebar-center {
  flex: 1;
  -webkit-app-region: drag;
  height: 100%;
}

.titlebar-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.titlebar-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 28px;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  border-radius: var(--radius-control, 4px);
  cursor: pointer;
  transition: background .1s;
  padding: 0;
}

.titlebar-btn:hover {
  background: var(--bg-hover);
  color: var(--text);
}

.titlebar-close:hover {
  background: #C42B1C;
  color: #fff;
}

/* ---- Layout Body ---- */
.layout-body {
  display: flex;
  flex: 1;
  overflow: hidden;
}

/* ---- Sidebar ---- */
.sidebar {
  width: var(--nav-width, 260px);
  background: var(--bg-panel);
  backdrop-filter: blur(20px);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  border-right: 1px solid var(--border);
  overflow: hidden;
}

.sidebar-nav {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 8px 0;
  gap: 2px;
}

.sidebar-bottom {
  display: flex;
  flex-direction: column;
  padding: 8px 0;
  gap: 2px;
  border-top: 1px solid var(--border);
}

/* ---- Nav Item ---- */
.nav-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  height: 40px;
  padding: 0 16px;
  font-size: 14px;
  cursor: pointer;
  color: var(--text-secondary);
  transition: background .1s;
  white-space: nowrap;
}

.nav-item:hover {
  background: var(--bg-hover);
}

.nav-item.active {
  background: var(--bg-selected);
  color: var(--text);
  font-weight: 600;
}

.nav-indicator {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 20px;
  background: var(--accent);
  border-radius: 0 2px 2px 0;
  pointer-events: none;
}

/* ---- Main Area ---- */
.main-area {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  background: var(--bg);
}
</style>