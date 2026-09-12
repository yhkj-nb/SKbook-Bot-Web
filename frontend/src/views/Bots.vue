<script setup>
import { ref, onMounted } from 'vue'
import { useBotStore } from '@/store'
import SvgIcon from '@/components/SvgIcon.vue'
import WinTextBox from '@/components/WinTextBox.vue'

const botStore = useBotStore()

const showAdd = ref(false)
const newName = ref('')
const newToken = ref('')
const newPrefix = ref('/')
const saving = ref(false)
const error = ref('')

async function handleCreate() {
  if (!newName.value || !newToken.value) {
    error.value = '名称和 Token 不能为空'
    return
  }
  saving.value = true
  error.value = ''
  try {
    const res = await botStore.createBot({
      name: newName.value,
      token: newToken.value,
      command_prefix: newPrefix.value || '/',
    })
    if (!res.success) {
      error.value = res.message || '创建失败'
    } else {
      showAdd.value = false
      newName.value = ''
      newToken.value = ''
      newPrefix.value = '/'
    }
  } catch (e) {
    error.value = e.response?.data?.message || e.message
  } finally {
    saving.value = false
  }
}

function handleDelete(name) {
  if (confirm(`确定要删除机器人「${name}」吗？`)) {
    botStore.deleteBot(name)
  }
}

function handleRestart(name) {
  botStore.restartBot(name)
}

onMounted(() => {
  botStore.fetchBots()
})
</script>

<template>
  <div>
    <div class="page-head">
      <div>
        <h1 class="win-page-title">机器人管理</h1>
        <p class="win-page-subtitle">管理 SkBook 机器人</p>
      </div>
      <button class="win-btn win-btn-primary" @click="showAdd = !showAdd">
        <SvgIcon name="plus" :size="14" />
        {{ showAdd ? '取消' : '添加机器人' }}
      </button>
    </div>

    <!-- 添加机器人 -->
    <div v-if="showAdd" class="win-card win-card-pad" style="margin-bottom:16px">
      <h2 class="win-section-title">添加机器人</h2>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px">
        <WinTextBox v-model:Text="newName" Header="机器人名称" PlaceholderText="例如：我的机器人" />
        <WinTextBox v-model:Text="newPrefix" Header="命令前缀" PlaceholderText="/" />
      </div>
      <WinTextBox v-model:Text="newToken" Header="机器人 TOKEN" PlaceholderText="从应用设置页获取" IsPassword />
      <p v-if="error" style="color:var(--danger);font-size:13px;margin-top:8px">{{ error }}</p>
      <button class="win-btn win-btn-primary" style="margin-top:12px" :disabled="saving" @click="handleCreate">
        {{ saving ? '创建中...' : '创建机器人' }}
      </button>
    </div>

    <!-- 列表 -->
    <div v-if="botStore.loading" class="win-loading">
      <div class="win-ring"></div>
    </div>
    <div v-else-if="botStore.bots.length" class="win-list win-card">
      <div v-for="b in botStore.bots" :key="b.name" class="win-list-item">
        <SvgIcon name="bot" :size="22" />
        <div class="win-list-item-content">
          <div class="win-list-item-title">{{ b.name }}</div>
          <div class="win-list-item-sub">
            Token: {{ b.token_masked }} · 轮询间隔: {{ b.poll_interval }}s
          </div>
        </div>
        <span class="win-badge" :class="b.running ? 'win-badge-success' : 'win-badge-warning'" style="margin-right:8px">
          {{ b.running ? '运行中' : '已停止' }}
        </span>
        <button class="win-btn win-btn-text" title="重启" @click="handleRestart(b.name)">
          <SvgIcon name="restart" :size="16" />
        </button>
        <button class="win-btn win-btn-text" title="删除" style="color:var(--danger)" @click="handleDelete(b.name)">
          <SvgIcon name="trash" :size="16" />
        </button>
      </div>
    </div>
    <div v-else class="win-card win-card-pad">
      <div class="win-empty">
        <SvgIcon name="bot" :size="36" />
        <p>暂无机器人，点击上方添加</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 16px;
}
</style>