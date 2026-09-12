<template>
  <div class="app-layout">
    <!-- 侧边栏 -->
    <aside class="sidebar">
      <div class="sidebar-header">
        <h1>SkBookBot</h1>
        <p>管理面板</p>
      </div>
      <nav class="sidebar-nav">
        <button
          v-for="item in navItems"
          :key="item.path"
          class="nav-item"
          :class="{ active: currentRoute === item.path }"
          @click="navigate(item.path)"
        >
          <span class="icon">{{ item.icon }}</span>
          <span>{{ item.label }}</span>
        </button>
      </nav>
      <div class="sidebar-footer" style="padding: 16px 20px; border-top: 1px solid rgba(255,255,255,0.1);">
        <button class="nav-item" @click="handleLogout" style="padding: 8px 0;">
          <span class="icon">🚪</span>
          <span>退出登录</span>
        </button>
      </div>
    </aside>

    <!-- 主内容 -->
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/store'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const currentRoute = computed(() => route.path)

const navItems = [
  { path: '/', label: '仪表盘', icon: '📊' },
  { path: '/bots', label: '机器人管理', icon: '🤖' },
  { path: '/plugins', label: '插件管理', icon: '🧩' },
  { path: '/messages', label: '消息记录', icon: '💬' },
  { path: '/settings', label: '系统设置', icon: '⚙️' },
]

function navigate(path) {
  router.push(path)
}

function handleLogout() {
  auth.logout()
  router.push('/login')
}
</script>