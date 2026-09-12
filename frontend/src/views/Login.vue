<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store'
import SvgIcon from '@/components/SvgIcon.vue'
import WinTextBox from '@/components/WinTextBox.vue'

const router = useRouter()
const auth = useAuthStore()

const password = ref('')
const loading = ref(false)
const error = ref('')

async function handleLogin() {
  if (!password.value) {
    error.value = '请输入密码'
    return
  }
  loading.value = true
  error.value = ''
  try {
    const ok = await auth.login(password.value)
    if (ok) {
      router.push('/')
    } else {
      error.value = '密码错误'
    }
  } catch (e) {
    error.value = e.response?.data?.message || e.message || '登录失败'
  } finally {
    loading.value = false
  }
}

function onKeydown(e) {
  if (e.key === 'Enter') handleLogin()
}
</script>

<template>
  <div class="login-wrapper">
    <div class="win-card login-card">
      <div class="login-header">
        <SvgIcon name="bot" :size="32" />
        <h1>SkBookBot</h1>
        <p>管理面板</p>
      </div>

      <WinTextBox
        v-model:Text="password"
        Header="管理员密码"
        PlaceholderText="请输入密码"
        IsPassword
        @keydown="onKeydown"
      />

      <p v-if="error" class="login-error">{{ error }}</p>

      <button class="win-btn win-btn-primary login-btn" :disabled="loading" @click="handleLogin">
        {{ loading ? '登录中...' : '登录' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.login-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: var(--bg);
  padding: 24px;
}

.login-card {
  width: 100%;
  max-width: 360px;
  padding: 32px 24px;
}

.login-header {
  text-align: center;
  margin-bottom: 24px;
}

.login-header h1 {
  font-size: 22px;
  font-weight: 700;
  margin-top: 8px;
}

.login-header p {
  font-size: 13px;
  color: var(--text-tertiary);
  margin-top: 4px;
}

.login-error {
  color: var(--danger);
  font-size: 13px;
  margin-top: 8px;
}

.login-btn {
  width: 100%;
  margin-top: 16px;
  height: 36px;
}
</style>