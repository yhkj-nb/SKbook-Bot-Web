<template>
  <div class="login-page">
    <div class="login-card">
      <h1>SkBookBot</h1>
      <p class="subtitle">SkBook 开放平台机器人管理面板</p>

      <div class="login-tabs">
        <button
          class="login-tab"
          :class="{ active: tab === 'password' }"
          @click="tab = 'password'"
        >
          密码登录
        </button>
        <button
          class="login-tab"
          :class="{ active: tab === 'oauth2' }"
          @click="tab = 'oauth2'"
        >
          SkBook 账号授权
        </button>
      </div>

      <!-- 密码登录 -->
      <form v-if="tab === 'password'" @submit.prevent="handlePasswordLogin">
        <div class="form-group">
          <label class="form-label">管理员密码</label>
          <input
            v-model="password"
            type="password"
            class="form-input"
            placeholder="请输入管理员密码"
            required
          />
        </div>
        <p v-if="error" class="error-msg">{{ error }}</p>
        <button type="submit" class="btn btn-primary" style="width: 100%" :disabled="loading">
          {{ loading ? '登录中...' : '登录' }}
        </button>
      </form>

      <!-- OAuth2 登录 -->
      <div v-else>
        <p style="font-size: 14px; color: #64748B; margin-bottom: 24px; text-align: center;">
          使用 SkBook 社区账号授权登录，获取用户信息
        </p>
        <button class="btn btn-primary" style="width: 100%" @click="handleOAuth2Login" :disabled="loading">
          {{ loading ? '跳转中...' : '前往 SkBook 授权' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/store'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const tab = ref('password')
const password = ref('')
const error = ref('')
const loading = ref(false)

// 处理 OAuth2 回调
const code = route.query.code
if (code) {
  handleOAuth2Callback(code, route.query.state || '')
}

async function handlePasswordLogin() {
  error.value = ''
  loading.value = true
  try {
    const success = await auth.login(password.value)
    if (success) {
      router.push('/')
    } else {
      error.value = '登录失败，请检查密码'
    }
  } catch (e) {
    error.value = '密码错误或服务器错误'
  } finally {
    loading.value = false
  }
}

async function handleOAuth2Login() {
  loading.value = true
  try {
    await auth.oauth2Login()
  } catch (e) {
    error.value = '获取授权链接失败'
    loading.value = false
  }
}

async function handleOAuth2Callback(code, state) {
  loading.value = true
  try {
    const success = await auth.handleOAuth2Callback(code, state)
    if (success) {
      router.push('/')
    } else {
      error.value = '授权失败'
    }
  } catch (e) {
    error.value = '授权处理失败'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.error-msg {
  color: #EF4444;
  font-size: 14px;
  margin-bottom: 12px;
  text-align: center;
}
</style>