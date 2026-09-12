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
    <aside class="sidebar">
      <div class="sidebar-brand">
        <SvgIcon name="bot" :size="20" />
        <span class="sidebar-title">SkBookBot</span>
      </div>
      <nav class="sidebar-nav">
        <div
          v-for="item in NAV_ITEMS"
          :key="item.key"
          class="nav-item"
          :class="{ active: isActive(item.key) }"
          @click="navigate(item.key)"
        >
          <div v-if="isActive(item.key)" class="nav-indicator"></div>
          <SvgIcon :name="item.icon" :size="18" />
          <span class="nav-label">{{ item.label }}</span>
        </div>
      </nav>
      <div class="sidebar-bottom">
        <div class="nav-item" @click="toggleDark">
          <SvgIcon :name="darkMode ? 'sun' : 'moon'" :size="18" />
          <span class="nav-label">{{ darkMode ? '亮色模式' : '暗色模式' }}</span>
        </div>
        <div class="nav-item logout-item" @click="handleLogout">
          <SvgIcon name="power" :size="18" />
          <span class="nav-label">退出登录</span>
        </div>
      </div>
    </aside>
    <main class="main-area">
      <router-view v-slot="{ Component }">
        <transition name="win-fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
  </div>
</template>

<style scoped>
.layout-wrapper {
  display: flex;
  height: 100vh;
  overflow: hidden;
  background: var(--bg);
}
.sidebar {
  width: 220px;
  min-width: 220px;
  display: flex;
  flex-direction: column;
  background: var(--bg-panel);
  border-right: 1px solid var(--border);
  overflow: hidden;
  flex-shrink: 0;
}
.sidebar-brand {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px 16px 12px;
  color: var(--text);
  flex-shrink: 0;
}
.sidebar-title {
  font-size: 15px;
  font-weight: 700;
}
.sidebar-nav {
  flex: 1;
  overflow-y: auto;
  padding: 4px 8px;
  display: flex;
  flex-direction: column;
  gap: 1px;
}
.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 38px;
  padding: 0 12px;
  font-size: 13px;
  cursor: pointer;
  color: var(--text-secondary);
  border-radius: var(--radius-control, 6px);
  transition: background 0.1s, color 0.1s;
  user-select: none;
  position: relative;
  flex-shrink: 0;
}
.nav-item:hover {
  background: var(--bg-hover);
  color: var(--text);
}
.nav-item.active {
  background: var(--accent);
  color: #fff;
  font-weight: 600;
}
.nav-indicator {
  position: absolute;
  left: -8px;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 18px;
  background: var(--accent);
  border-radius: 0 2px 2px 0;
}
.nav-item.active .nav-indicator {
  background: #fff;
}
.nav-label {
  white-space: nowrap;
}
.sidebar-bottom {
  border-top: 1px solid var(--border);
  padding: 6px 8px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 1px;
}
.logout-item:hover {
  background: rgba(196, 43, 28, 0.1);
  color: #C42B1C;
}
.main-area {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  background: var(--bg);
}
@media (max-width: 768px) {
  .sidebar {
    width: 56px;
    min-width: 56px;
  }
  .sidebar-brand { justify-content: center; padding: 12px 4px; }
  .sidebar-title { display: none; }
  .nav-item { justify-content: center; padding: 0 4px; }
  .nav-label { display: none; }
  .nav-indicator { display: none; }
  .main-area { padding: 12px; }
}
</style>