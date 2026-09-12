<template>
  <div>
    <div class="topbar">
      <h2>插件管理</h2>
      <div class="topbar-actions">
        <button class="btn btn-outline btn-sm" @click="refresh">刷新</button>
      </div>
    </div>

    <div class="card">
      <div class="card-title">已加载插件</div>

      <div v-if="pluginStore.loading" class="loading">加载中...</div>

      <table v-else class="table">
        <thead>
          <tr>
            <th>插件名称</th>
            <th>处理器数</th>
            <th>有实例</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="plugin in pluginStore.plugins" :key="plugin.name">
            <td><strong>{{ plugin.name }}</strong></td>
            <td>{{ plugin.handlers }}</td>
            <td>
              <span class="badge" :class="plugin.has_instance ? 'badge-success' : 'badge-warning'">
                {{ plugin.has_instance ? '是' : '否' }}
              </span>
            </td>
            <td>
              <button class="btn btn-outline btn-sm" @click="reloadPlugin(plugin.name)">重载</button>
            </td>
          </tr>
          <tr v-if="!pluginStore.plugins.length">
            <td colspan="4" class="empty-state">
              <div class="empty-state">
                <div class="icon">🧩</div>
                <p>暂无插件</p>
                <p style="font-size: 12px; margin-top: 8px;">将插件放置在 plugins/ 目录下即可自动加载</p>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 插件开发说明 -->
    <div class="card">
      <div class="card-title">插件开发指南</div>
      <div style="font-size: 14px; line-height: 1.8; color: #475569;">
        <p>创建插件文件 <code>plugins/my_plugin.py</code>：</p>
        <pre style="background: #F1F5F9; padding: 16px; border-radius: 8px; margin: 12px 0; overflow-x: auto;">
<code>from core.plugin.decorators import on_command, on_message
from core.plugin.context import PluginContext

class MyPlugin:
    _skbook_handlers = [
        {"type": "command", "name": "hello", "aliases": ["你好"]},
    ]

    def __init__(self):
        self.ctx: PluginContext = None

    async def on_load(self):
        self.ctx.log.info("插件已加载")

    async def hello(self, event):
        await event.reply(f"你好！你的用户ID是 {event.sender_id}")</code>
        </pre>
        <p>更多文档请参考 <code>docs/plugin-development.md</code></p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { usePluginStore } from '@/store'

const pluginStore = usePluginStore()

onMounted(() => {
  refresh()
})

function refresh() {
  pluginStore.fetchPlugins()
}

async function reloadPlugin(name) {
  await pluginStore.reloadPlugin(name)
}
</script>