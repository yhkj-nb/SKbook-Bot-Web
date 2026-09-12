<script setup>
import { ref, onMounted, computed } from 'vue'
import { api } from '@/api'
import SvgIcon from '@/components/SvgIcon.vue'

const loading = ref(true)
const pluginList = ref([])
const expanded = ref({})

onMounted(async () => {
  try {
    const res = await api.getPlugins()
    if (res.success) pluginList.value = res.data.plugins || []
  } catch (e) {
    console.error('加载插件失败', e)
  } finally {
    loading.value = false
  }
})

function toggleExpand(name) {
  expanded.value[name] = !expanded.value[name]
}

async function handleReload(name) {
  try {
    const res = await api.reloadPlugin(name)
    if (res.success) {
      const r2 = await api.getPlugins()
      if (r2.success) pluginList.value = r2.data.plugins || []
    }
  } catch (e) {
    console.error('重载插件失败', e)
  }
}

function getTypeIcon(type) {
  return type === 'command' ? 'play' : type === 'message' ? 'chat' : 'info'
}
</script>

<template>
  <div>
    <h1 class="win-page-title">插件管理</h1>
    <p class="win-page-subtitle">管理已加载的插件模块，查看注册的指令</p>

    <div v-if="loading" class="win-loading">
      <div class="win-ring"></div>
      <span>加载中...</span>
    </div>

    <template v-else>
      <div v-if="!pluginList.length" class="win-card win-card-pad">
        <div class="win-empty">
          <SvgIcon name="plugins" :size="48" />
          <p>暂无已加载的插件</p>
        </div>
      </div>

      <div v-for="p in pluginList" :key="p.name" class="win-card" style="margin-bottom:12px;overflow:hidden">
        <!-- 插件头部（可点击折叠） -->
        <div
          class="plugin-header"
          :class="{ expanded: expanded[p.name] }"
          @click="toggleExpand(p.name)"
        >
          <div style="display:flex;align-items:center;gap:10px;flex:1;min-width:0">
            <SvgIcon name="plugins" :size="18" />
            <div style="flex:1;min-width:0">
              <div class="plugin-name">{{ p.name }}</div>
              <div class="plugin-meta">{{ p.handlers }} 个处理器</div>
            </div>
          </div>
          <div style="display:flex;gap:8px;align-items:center;flex-shrink:0">
            <span class="win-badge" :class="p.has_instance ? 'win-badge-success' : 'win-badge-warning'">
              {{ p.has_instance ? '已加载' : '未加载' }}
            </span>
            <SvgIcon
              :name="expanded[p.name] ? 'expand_less' : 'chevron-down'"
              :size="16"
              class="chevron"
            />
          </div>
        </div>

        <!-- 折叠内容：指令列表 -->
        <transition name="win-fade">
          <div v-if="expanded[p.name]" class="plugin-body">
            <!-- 重载按钮 -->
            <div style="padding:12px 16px;border-bottom:1px solid var(--border,#E2E8F0);display:flex;gap:8px">
              <button class="win-btn win-btn-sm win-btn-secondary" @click.stop="handleReload(p.name)">
                <SvgIcon name="refresh" :size="12" />
                重载插件
              </button>
            </div>

            <!-- 处理器列表 -->
            <div v-if="p.handler_list && p.handler_list.length" style="padding:8px 16px 16px">
              <div style="font-size:13px;font-weight:600;color:var(--text-secondary);margin:8px 0 8px">注册的处理器</div>
              <div
                v-for="(h, idx) in p.handler_list"
                :key="idx"
                class="handler-item"
              >
                <div class="handler-type-badge" :class="'type-' + h.type">
                  <SvgIcon :name="getTypeIcon(h.type)" :size="12" />
                  {{ h.type === 'command' ? '指令' : h.type === 'message' ? '消息' : '事件' }}
                </div>
                <div class="handler-detail">
                  <template v-if="h.type === 'command'">
                    <code class="handler-code">/{{ h.command }}</code>
                    <span v-if="h.aliases && h.aliases.length" class="handler-aliases">
                      别名：<code v-for="(a, ai) in h.aliases" :key="ai" class="handler-code">/{{ a }}</code>
                    </span>
                  </template>
                  <template v-else-if="h.type === 'message'">
                    <code v-if="h.pattern" class="handler-code">{{ h.pattern }}</code>
                    <span v-else style="color:var(--text-tertiary);font-size:12px">匹配任意消息</span>
                  </template>
                  <template v-else>
                    <span style="color:var(--text-tertiary);font-size:12px">事件处理器</span>
                  </template>
                </div>
              </div>
            </div>

            <div v-else style="padding:16px;text-align:center;color:var(--text-tertiary);font-size:13px">
              该插件没有注册显式处理器
            </div>
          </div>
        </transition>
      </div>
    </template>
  </div>
</template>

<style scoped>
.plugin-header {
  display: flex;
  align-items: center;
  padding: 14px 16px;
  cursor: pointer;
  transition: background .1s;
  user-select: none;
}
.plugin-header:hover {
  background: var(--bg-hover, rgba(0,0,0,0.03));
}
.plugin-header.expanded {
  background: var(--bg-hover, rgba(0,0,0,0.03));
}

.plugin-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text, #1E293B);
}
.plugin-meta {
  font-size: 12px;
  color: var(--text-tertiary, #94A3B8);
  margin-top: 1px;
}

.chevron {
  color: var(--text-tertiary, #94A3B8);
  transition: transform .2s;
  flex-shrink: 0;
}

.plugin-body {
  border-top: 1px solid var(--border, #E2E8F0);
}

.handler-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 8px 0;
  border-bottom: 1px solid var(--border, #E2E8F0);
}
.handler-item:last-child {
  border-bottom: none;
}

.handler-type-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
  flex-shrink: 0;
  margin-top: 1px;
}
.type-command {
  background: #DBEAFE;
  color: #1D4ED8;
}
.type-message {
  background: #DCFCE7;
  color: #15803D;
}
.type-event {
  background: #F3E8FF;
  color: #7C3AED;
}

.handler-detail {
  font-size: 13px;
  color: var(--text-secondary, #475569);
  line-height: 1.7;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.handler-code {
  background: var(--bg-deep, #F1F5F9);
  padding: 1px 6px;
  border-radius: 3px;
  font-size: 12px;
  font-family: 'Cascadia Code', 'Fira Code', 'Consolas', monospace;
  color: var(--text, #1E293B);
}

.handler-aliases {
  font-size: 12px;
  color: var(--text-tertiary, #94A3B8);
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
}
</style>