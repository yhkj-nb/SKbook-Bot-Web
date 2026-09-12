<script setup>
import { ref, onMounted } from 'vue'
import { usePluginStore } from '@/store'
import SvgIcon from '@/components/SvgIcon.vue'

const pluginStore = usePluginStore()
const expanded = ref({})

function toggleExpand(name) {
  expanded.value[name] = !expanded.value[name]
}

function getTypeIcon(type) {
  if (type === 'command') return 'code'
  if (type === 'message') return 'chat'
  return 'activity'
}

onMounted(() => pluginStore.fetchPlugins())
</script>

<template>
  <div>
    <h1 class="win-page-title">插件管理</h1>
    <p class="win-page-subtitle">已注册的插件和处理器</p>

    <div v-if="pluginStore.loading" class="win-loading">
      <div class="win-ring"></div>
    </div>

    <div v-for="p in pluginStore.plugins" :key="p.name" class="win-card" style="margin-bottom:12px;overflow:hidden">
      <div class="plugin-header" :class="{ expanded: expanded[p.name] }" @click="toggleExpand(p.name)">
        <div style="display:flex;align-items:center;gap:10px;flex:1;min-width:0">
          <SvgIcon name="plugin" :size="18" />
          <div style="flex:1;min-width:0">
            <div class="plugin-name">{{ p.name }}</div>
            <div class="plugin-meta">{{ p.handlers }} 个处理器</div>
          </div>
        </div>
        <div style="display:flex;gap:8px;align-items:center;flex-shrink:0">
          <span class="win-badge" :class="p.has_instance ? 'win-badge-success' : 'win-badge-warning'">
            {{ p.has_instance ? '已加载' : '未加载' }}
          </span>
          <SvgIcon :name="expanded[p.name] ? 'expand_less' : 'chevron_down'" :size="16" class="chevron" />
        </div>
      </div>

      <transition name="win-fade">
        <div v-if="expanded[p.name]" class="plugin-body">
          <div v-if="p.handler_list && p.handler_list.length" style="padding:8px 16px 16px">
            <div style="font-size:13px;font-weight:600;color:var(--text-secondary);margin:8px 0 8px">注册的处理器</div>
            <div v-for="(h, idx) in p.handler_list" :key="idx" class="handler-item">
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
              </div>
            </div>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<style scoped>
.plugin-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  cursor: pointer;
  transition: background 0.1s;
  user-select: none;
}
.plugin-header:hover {
  background: var(--bg-hover);
}
.plugin-header.expanded {
  border-bottom: 1px solid var(--border);
}
.plugin-name {
  font-size: 14px;
  font-weight: 600;
}
.plugin-meta {
  font-size: 12px;
  color: var(--text-tertiary);
  margin-top: 2px;
}
.chevron {
  transition: transform 0.2s;
  color: var(--text-tertiary);
}
.plugin-body {
  animation: win-fade-in 0.15s ease;
}
.handler-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 8px 0;
  border-bottom: 1px solid var(--border);
}
.handler-item:last-child {
  border-bottom: none;
}
.handler-type-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  font-size: 11px;
  font-weight: 600;
  border-radius: 4px;
  white-space: nowrap;
  flex-shrink: 0;
  margin-top: 1px;
}
.handler-type-badge.type-command {
  background: rgba(59, 130, 246, 0.12);
  color: #3B82F6;
}
.handler-type-badge.type-message {
  background: rgba(16, 185, 129, 0.12);
  color: #10B981;
}
.handler-type-badge.type-event {
  background: rgba(139, 92, 246, 0.12);
  color: #8B5CF6;
}
.handler-detail {
  font-size: 13px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
}
.handler-code {
  font-family: 'SF Mono', 'Cascadia Code', 'Consolas', monospace;
  font-size: 12px;
  background: var(--bg-hover);
  padding: 1px 6px;
  border-radius: 3px;
  color: var(--text);
}
.handler-aliases {
  font-size: 12px;
  color: var(--text-tertiary);
  display: inline-flex;
  gap: 4px;
  flex-wrap: wrap;
  align-items: center;
}
@keyframes win-fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>